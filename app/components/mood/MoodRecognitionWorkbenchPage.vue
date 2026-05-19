<template>
  <div class="mood-workbench">
    <aside class="mood-workbench__sidebar">
      <section class="mood-panel">
        <div class="mood-panel__eyebrow">{{ t("moodWorkbench.inputEyebrow") }}</div>
        <div class="mood-input-list">
          <button type="button" class="mood-input-card" @click="triggerUpload">
            <div class="mood-input-card__left">
              <span class="material-symbols-outlined">upload_file</span>
              <span>{{ t("moodWorkbench.localUpload") }}</span>
            </div>
            <span class="material-symbols-outlined mood-input-card__arrow">chevron_right</span>
          </button>

          <button
            type="button"
            class="mood-input-card"
            :class="{ 'mood-input-card--active': activeInputMode === 'camera' }"
            @click="activateCameraMode"
          >
            <div class="mood-input-card__left">
              <span class="material-symbols-outlined">videocam</span>
              <span>{{ t("moodWorkbench.cameraRecognition") }}</span>
            </div>
            <span v-if="activeInputMode === 'camera'" class="mood-input-card__dot"></span>
          </button>
        </div>

        <input
          ref="uploadInputRef"
          class="mood-upload-input"
          type="file"
          accept="image/*"
          @change="handleUploadChange"
        />
      </section>

      <section class="mood-panel">
        <div class="mood-panel__eyebrow mood-panel__eyebrow--neutral">
          {{ t("moodWorkbench.configEyebrow") }}
        </div>

        <div class="mood-config">
          <label class="mood-config__label">{{ t("moodWorkbench.sensitivityLabel") }}</label>
          <input
            v-model="sensitivity"
            class="mood-config__range"
            type="range"
            min="50"
            max="98"
            step="1"
          />
          <div class="mood-config__range-meta">
            <span>{{ t("moodWorkbench.lowLabel") }}</span>
            <span>{{ t("moodWorkbench.highLabel", { value: `${sensitivity}%` }) }}</span>
          </div>

          <div class="mood-config__toggle-row">
            <span>{{ t("moodWorkbench.multiFaceLabel") }}</span>
            <button
              type="button"
              class="mood-switch"
              :class="{ 'is-on': multiFaceEnabled }"
              @click="multiFaceEnabled = !multiFaceEnabled"
            >
              <span class="mood-switch__thumb"></span>
            </button>
          </div>
        </div>
      </section>
    </aside>

    <section class="mood-workbench__stage">
      <div class="mood-camera-stage">
        <div v-if="activeInputMode === 'camera'" class="mood-camera-stage__surface">
          <video
            ref="videoRef"
            class="mood-camera-stage__image"
            autoplay
            muted
            playsinline
          ></video>
        </div>

        <div v-else class="mood-camera-stage__surface">
          <img
            v-if="uploadedPreviewUrl"
            class="mood-camera-stage__image"
            :src="uploadedPreviewUrl"
            :alt="t('moodWorkbench.stageImageAlt')"
          />
          <div v-else class="mood-camera-stage__placeholder">
            <span class="material-symbols-outlined">imagesmode</span>
            <p>{{ t("moodWorkbench.uploadPlaceholder") }}</p>
          </div>
        </div>

        <canvas ref="overlayCanvasRef" class="mood-camera-stage__canvas"></canvas>
        <div class="mood-camera-stage__overlay"></div>

        <div
          v-if="activeDetection && primaryDetection"
          class="mood-camera-stage__frame"
          :style="frameStyle"
        >
          <span class="mood-camera-stage__corner mood-camera-stage__corner--lt"></span>
          <span class="mood-camera-stage__corner mood-camera-stage__corner--rt"></span>
          <span class="mood-camera-stage__corner mood-camera-stage__corner--lb"></span>
          <span class="mood-camera-stage__corner mood-camera-stage__corner--rb"></span>
          <div class="mood-camera-stage__scan-line"></div>
          <div class="mood-camera-stage__badge">{{ t("moodWorkbench.activeTracking") }}</div>
        </div>

        <div class="mood-camera-stage__hud mood-camera-stage__hud--left">
          <div class="mood-camera-stage__metric">
            <span>{{ t("moodWorkbench.resolutionLabel") }}</span>
            <strong>{{ stageResolution }}</strong>
          </div>
          <div class="mood-camera-stage__divider"></div>
          <div class="mood-camera-stage__metric">
            <span>{{ t("moodWorkbench.fpsLabel") }}</span>
            <strong>{{ fpsLabel }}</strong>
          </div>
        </div>

        <div class="mood-camera-stage__hud mood-camera-stage__hud--right">
          <div class="mood-recording-pill">
            <span class="mood-recording-pill__dot"></span>
            <span>{{ recordingLabel }}</span>
          </div>
        </div>
      </div>

      <div class="mood-stage-action">
        <button type="button" class="mood-stage-action__button" @click="handlePrimaryAction">
          <span class="material-symbols-outlined">
            {{ activeInputMode === "camera" && detectionRunning ? "pause_circle" : "play_circle" }}
          </span>
          <span>
            {{
              activeInputMode === "camera" && detectionRunning
                ? t("moodWorkbench.stopRecognition")
                : t("moodWorkbench.startRecognition")
            }}
          </span>
        </button>
      </div>
    </section>

    <aside class="mood-workbench__result">
      <section class="mood-panel mood-panel--result">
        <div class="mood-panel__eyebrow mood-panel__eyebrow--neutral">
          {{ t("moodWorkbench.resultEyebrow") }}
        </div>
        <div class="mood-result__headline">
          {{ primaryEmotionLabel }}
        </div>

        <div class="mood-result-bars">
          <div
            v-for="item in resultBars"
            :key="item.key"
            class="mood-result-bar"
            :class="{ 'is-dim': item.dim }"
          >
            <div class="mood-result-bar__head">
              <span>{{ item.label }}</span>
              <strong>{{ item.displayValue }}</strong>
            </div>
            <div class="mood-result-bar__track">
              <div
                class="mood-result-bar__fill"
                :class="`mood-result-bar__fill--${item.key}`"
                :style="{ width: `${item.value}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="mood-result__status" :class="statusClass">
          {{ statusMessage || t("moodWorkbench.readyHint") }}
        </div>
      </section>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { FaceDemoDetection } from "~/composables/useFaceApiDemo";
import { useFaceApiDemo } from "~/composables/useFaceApiDemo";

type InputMode = "camera" | "upload";

type EmotionKey = "happy" | "calm" | "surprise" | "confused";

type EmotionScores = Record<EmotionKey, number>;

interface FaceLandmarkPoint {
  x: number;
  y: number;
}

interface FaceLandmarkSource {
  position?: FaceLandmarkPoint;
  _x?: number;
  _y?: number;
  x?: number;
  y?: number;
}

declare global {
  interface Window {
    faceapi?: {
      TinyFaceDetectorOptions: new (options?: { inputSize?: number; scoreThreshold?: number }) => unknown;
      detectSingleFace: (
        input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
        options?: unknown,
      ) => {
        withFaceLandmarks: (useTinyLandmarkNet?: boolean) => Promise<any>;
      };
    };
  }
}

const { t } = useI18n();
const { ensureReady, detectSingleFace } = useFaceApiDemo();

const uploadInputRef = ref<HTMLInputElement | null>(null);
const overlayCanvasRef = ref<HTMLCanvasElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);

const activeInputMode = ref<InputMode>("camera");
const uploadedPreviewUrl = ref("");
const uploadedImageElement = ref<HTMLImageElement | null>(null);
const sensitivity = ref(85);
const multiFaceEnabled = ref(true);
const detectionRunning = ref(false);
const detectionReady = ref(false);
const statusMessage = ref("");
const statusTone = ref<"idle" | "info" | "error">("idle");
const startTimestamp = ref<number | null>(null);
const lastFrameTimestamp = ref(0);
const fps = ref(0);
const mediaStream = ref<MediaStream | null>(null);
const detectionTimer = ref<number | null>(null);
const activeDetection = ref<FaceDemoDetection | null>(null);
const activeEmotionScores = ref<EmotionScores>({
  happy: 92.5,
  calm: 5.0,
  surprise: 2.1,
  confused: 0.4,
});

const stageResolution = computed(() => {
  const video = videoRef.value;
  if (activeInputMode.value === "camera" && video?.videoWidth && video?.videoHeight) {
    return `${video.videoWidth}x${video.videoHeight}`;
  }

  const image = uploadedImageElement.value;
  if (activeInputMode.value === "upload" && image?.naturalWidth && image?.naturalHeight) {
    return `${image.naturalWidth}x${image.naturalHeight}`;
  }

  return "1920x1080";
});

const fpsLabel = computed(() => fps.value.toFixed(1));

const recordingLabel = computed(() => {
  const timestamp = startTimestamp.value;
  if (!timestamp || !detectionRunning.value) {
    return t("moodWorkbench.recordingIdle");
  }

  const elapsed = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  return `REC 00:${minutes}:${seconds}`;
});

const primaryEmotionKey = computed<EmotionKey>(() => {
  const entries = Object.entries(activeEmotionScores.value) as Array<[EmotionKey, number]>;
  return entries.sort((a, b) => b[1] - a[1])[0]?.[0] || "happy";
});

const primaryEmotionLabel = computed(() => {
  const key = primaryEmotionKey.value;
  return t(`moodWorkbench.results.${key}Primary`);
});

const resultBars = computed(() => {
  const entries: Array<{ key: EmotionKey; value: number; label: string; displayValue: string; dim: boolean }> = [
    {
      key: "happy",
      value: activeEmotionScores.value.happy,
      label: t("moodWorkbench.results.happy"),
      displayValue: `${activeEmotionScores.value.happy.toFixed(1)}%`,
      dim: false,
    },
    {
      key: "calm",
      value: activeEmotionScores.value.calm,
      label: t("moodWorkbench.results.calm"),
      displayValue: `${activeEmotionScores.value.calm.toFixed(1)}%`,
      dim: false,
    },
    {
      key: "surprise",
      value: activeEmotionScores.value.surprise,
      label: t("moodWorkbench.results.surprise"),
      displayValue: `${activeEmotionScores.value.surprise.toFixed(1)}%`,
      dim: false,
    },
    {
      key: "confused",
      value: activeEmotionScores.value.confused,
      label: t("moodWorkbench.results.confused"),
      displayValue: `${activeEmotionScores.value.confused.toFixed(1)}%`,
      dim: activeEmotionScores.value.confused < 1,
    },
  ];

  return entries.sort((a, b) => b.value - a.value);
});

const statusClass = computed(() => ({
  "is-info": statusTone.value === "info",
  "is-error": statusTone.value === "error",
}));

const frameStyle = computed(() => {
  const detection = activeDetection.value;
  const canvas = overlayCanvasRef.value;
  const source = getActiveSourceDimensions();

  if (!detection || !canvas || !source) {
    return {};
  }

  const scaleX = canvas.clientWidth / source.width;
  const scaleY = canvas.clientHeight / source.height;

  return {
    left: `${detection.box.x * scaleX}px`,
    top: `${detection.box.y * scaleY}px`,
    width: `${detection.box.width * scaleX}px`,
    height: `${detection.box.height * scaleY}px`,
  };
});

const triggerUpload = () => {
  uploadInputRef.value?.click();
};

const activateCameraMode = async () => {
  activeInputMode.value = "camera";
  await startCamera();
};

const stopCamera = () => {
  const stream = mediaStream.value;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
  mediaStream.value = null;
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
};

const clearDetectionLoop = () => {
  if (detectionTimer.value !== null) {
    window.clearTimeout(detectionTimer.value);
    detectionTimer.value = null;
  }
};

const clearCanvas = () => {
  const canvas = overlayCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const handleUploadChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  activeInputMode.value = "upload";
  detectionRunning.value = false;
  statusTone.value = "info";
  clearDetectionLoop();
  stopCamera();
  statusMessage.value = t("moodWorkbench.imageLoading");

  if (uploadedPreviewUrl.value) {
    URL.revokeObjectURL(uploadedPreviewUrl.value);
  }

  uploadedPreviewUrl.value = URL.createObjectURL(file);
  const image = new Image();
  image.src = uploadedPreviewUrl.value;
  image.onload = async () => {
    uploadedImageElement.value = image;
    statusMessage.value = "";
    await runUploadDetection();
  };
  image.onerror = () => {
    statusTone.value = "error";
    statusMessage.value = t("moodWorkbench.uploadLoadFailed");
  };
  target.value = "";
};

const startCamera = async () => {
  try {
    statusTone.value = "info";
    statusMessage.value = t("moodWorkbench.cameraInitializing");
    await ensureReady();

    stopCamera();

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
      audio: false,
    });

    mediaStream.value = stream;
    if (!videoRef.value) return;

    videoRef.value.srcObject = stream;
    await videoRef.value.play();
    detectionReady.value = true;
    statusTone.value = "idle";
    statusMessage.value = t("moodWorkbench.cameraReady");
    activeDetection.value = null;
    clearCanvas();
  } catch (error) {
    console.error("初始化摄像头失败:", error);
    statusTone.value = "error";
    statusMessage.value = t("moodWorkbench.cameraInitFailed");
  }
};

const handlePrimaryAction = async () => {
  if (activeInputMode.value === "upload") {
    await runUploadDetection();
    return;
  }

  if (detectionRunning.value) {
    stopRealtimeDetection();
    return;
  }

  await startRealtimeDetection();
};

const startRealtimeDetection = async () => {
  if (!videoRef.value) {
    await startCamera();
  }

  if (!videoRef.value) return;

  detectionRunning.value = true;
  startTimestamp.value = Date.now();
  statusTone.value = "info";
  statusMessage.value = t("moodWorkbench.detecting");
  await runRealtimeDetectionLoop();
};

const stopRealtimeDetection = () => {
  detectionRunning.value = false;
  clearDetectionLoop();
  statusTone.value = "idle";
  statusMessage.value = t("moodWorkbench.cameraReady");
};

const runRealtimeDetectionLoop = async () => {
  if (!detectionRunning.value || !videoRef.value) return;

  const startedAt = performance.now();
  await processSource(videoRef.value);
  const duration = Math.max(1, performance.now() - startedAt);
  fps.value = 1000 / duration;
  lastFrameTimestamp.value = startedAt;

  detectionTimer.value = window.setTimeout(() => {
    void runRealtimeDetectionLoop();
  }, 180);
};

const runUploadDetection = async () => {
  if (!uploadedImageElement.value) {
    statusTone.value = "idle";
    statusMessage.value = t("moodWorkbench.uploadPlaceholder");
    return;
  }

  statusTone.value = "info";
  statusMessage.value = t("moodWorkbench.imageDetecting");
  await processSource(uploadedImageElement.value);
};

const getActiveSourceDimensions = () => {
  if (activeInputMode.value === "camera" && videoRef.value?.videoWidth && videoRef.value?.videoHeight) {
    return {
      width: videoRef.value.videoWidth,
      height: videoRef.value.videoHeight,
    };
  }

  if (activeInputMode.value === "upload" && uploadedImageElement.value?.naturalWidth && uploadedImageElement.value?.naturalHeight) {
    return {
      width: uploadedImageElement.value.naturalWidth,
      height: uploadedImageElement.value.naturalHeight,
    };
  }

  return null;
};

const resizeOverlayCanvas = () => {
  const canvas = overlayCanvasRef.value;
  const sourceDimensions = getActiveSourceDimensions();

  if (!canvas || !sourceDimensions) return;

  canvas.width = sourceDimensions.width;
  canvas.height = sourceDimensions.height;
};

const processSource = async (source: HTMLImageElement | HTMLVideoElement) => {
  try {
    await ensureReady();
    resizeOverlayCanvas();

    const detection = await detectSingleFace(source, activeInputMode.value === "upload" ? "capture" : "recognize");
    activeDetection.value = detection;

    if (!detection) {
      clearCanvas();
      statusTone.value = detectionRunning.value ? "info" : "idle";
      statusMessage.value =
        activeInputMode.value === "upload"
          ? t("moodWorkbench.noFaceInUpload")
          : t("moodWorkbench.noFaceDetected");
      return;
    }

    const landmarkResult = await detectLandmarks(source);
    const points = normalizeLandmarkPoints(landmarkResult);

    if (!points.length) {
      statusTone.value = "error";
      statusMessage.value = t("moodWorkbench.landmarkFailed");
      return;
    }

    drawLandmarks(points, detection.box);
    activeEmotionScores.value = scoreEmotionFromLandmarks(points, detection.box);
    statusTone.value = detectionRunning.value ? "info" : "idle";
    statusMessage.value =
      activeInputMode.value === "upload"
        ? t("moodWorkbench.uploadDetectSuccess")
        : t("moodWorkbench.faceDetected");
  } catch (error) {
    console.error("情绪识别处理失败:", error);
    statusTone.value = "error";
    statusMessage.value = t("moodWorkbench.detectFailed");
  }
};

const detectLandmarks = async (source: HTMLImageElement | HTMLVideoElement) => {
  const faceapi = window.faceapi;
  if (!faceapi) {
    throw new Error("faceapi 未加载");
  }

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: activeInputMode.value === "upload" ? 416 : 320,
    scoreThreshold: 0.18,
  });

  return await faceapi.detectSingleFace(source, options).withFaceLandmarks(true);
};

const normalizeLandmarkPoints = (landmarkResult: any): FaceLandmarkPoint[] => {
  const rawPoints = landmarkResult?.landmarks?.positions || [];

  return rawPoints
    .map((point: FaceLandmarkSource) => {
      const position = point?.position;
      const x = position?.x ?? point?._x ?? point?.x ?? 0;
      const y = position?.y ?? point?._y ?? point?.y ?? 0;
      return { x: Number(x), y: Number(y) };
    })
    .filter((point: FaceLandmarkPoint) => Number.isFinite(point.x) && Number.isFinite(point.y));
};

const drawLandmarks = (points: FaceLandmarkPoint[], box: FaceDemoDetection["box"]) => {
  const canvas = overlayCanvasRef.value;
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(0, 91, 196, 0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);

  ctx.fillStyle = "rgba(105, 246, 184, 0.9)";
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });
};

const averagePoints = (points: FaceLandmarkPoint[]) => {
  if (!points.length) return { x: 0, y: 0 };

  const total = points.reduce(
    (acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    },
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
};

const distanceBetween = (start: FaceLandmarkPoint, end: FaceLandmarkPoint) => {
  return Math.hypot(end.x - start.x, end.y - start.y);
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const scoreEmotionFromLandmarks = (points: FaceLandmarkPoint[], box: FaceDemoDetection["box"]): EmotionScores => {
  const mouthLeft = points[48];
  const mouthRight = points[54];
  const mouthTop = points[51];
  const mouthBottom = points[57];
  const browLeftInner = points[21];
  const browRightInner = points[22];
  const leftEyeTop = points[38];
  const leftEyeBottom = points[40];
  const rightEyeTop = points[43];
  const rightEyeBottom = points[47];
  const browLeftCenter = averagePoints(points.slice(17, 22));
  const browRightCenter = averagePoints(points.slice(22, 27));
  const leftEyeCenter = averagePoints(points.slice(36, 42));
  const rightEyeCenter = averagePoints(points.slice(42, 48));
  const noseTip = points[30];
  const leftEyeOuter = points[36];
  const leftEyeInner = points[39];
  const rightEyeInner = points[42];
  const rightEyeOuter = points[45];

  const faceHeight = Math.max(box.height, 1);
  const faceWidth = Math.max(box.width, 1);
  const mouthWidth = mouthLeft && mouthRight ? distanceBetween(mouthLeft, mouthRight) / faceWidth : 0.3;
  const mouthOpen = mouthTop && mouthBottom ? distanceBetween(mouthTop, mouthBottom) / faceHeight : 0.03;
  const eyeOpenLeft = leftEyeTop && leftEyeBottom ? distanceBetween(leftEyeTop, leftEyeBottom) / faceHeight : 0.025;
  const eyeOpenRight = rightEyeTop && rightEyeBottom ? distanceBetween(rightEyeTop, rightEyeBottom) / faceHeight : 0.025;
  const eyeWidthLeft = leftEyeOuter && leftEyeInner ? distanceBetween(leftEyeOuter, leftEyeInner) / faceWidth : 0.12;
  const eyeWidthRight = rightEyeOuter && rightEyeInner ? distanceBetween(rightEyeOuter, rightEyeInner) / faceWidth : 0.12;
  const eyeAspectLeft = eyeWidthLeft > 0 ? eyeOpenLeft / eyeWidthLeft : 0.2;
  const eyeAspectRight = eyeWidthRight > 0 ? eyeOpenRight / eyeWidthRight : 0.2;
  const eyeOpen = (eyeAspectLeft + eyeAspectRight) / 2;
  const browLift =
    leftEyeCenter.y && browLeftCenter.y && rightEyeCenter.y && browRightCenter.y
      ? ((leftEyeCenter.y - browLeftCenter.y) + (rightEyeCenter.y - browRightCenter.y)) /
        2 /
        faceHeight
      : 0.08;
  const mouthCenterY = mouthTop && mouthBottom ? (mouthTop.y + mouthBottom.y) / 2 : box.y + box.height * 0.68;
  const mouthSmile =
    mouthLeft && mouthRight
      ? (mouthCenterY - (mouthLeft.y + mouthRight.y) / 2) / faceHeight
      : 0;
  const innerBrowDistance =
    browLeftInner && browRightInner ? distanceBetween(browLeftInner, browRightInner) / faceWidth : 0.08;
  const profileBalance =
    noseTip && leftEyeCenter.x && rightEyeCenter.x
      ? Math.min(
          Math.abs(noseTip.x - leftEyeCenter.x),
          Math.abs(rightEyeCenter.x - noseTip.x),
        ) /
        Math.max(
          Math.abs(noseTip.x - leftEyeCenter.x),
          Math.abs(rightEyeCenter.x - noseTip.x),
          1,
        )
      : 1;
  const profilePenalty = 1 - Math.max(0, Math.min(1, profileBalance));

  const happyRaw =
    34 +
    Math.max(0, mouthSmile - 0.012) * 540 +
    Math.max(0, mouthOpen - 0.018) * 120 +
    Math.max(0, 0.3 - profilePenalty) * 36;
  const surpriseRaw =
    8 +
    Math.max(0, mouthOpen - 0.1) * 520 +
    Math.max(0, eyeOpen - 0.22) * 320 +
    Math.max(0, browLift - 0.085) * 260 -
    Math.max(0, mouthSmile - 0.015) * 180 -
    profilePenalty * 70;
  const calmRaw =
    30 +
    Math.max(0, 0.12 - Math.abs(mouthOpen - 0.035)) * 260 +
    Math.max(0, 0.14 - Math.abs(eyeOpen - 0.19)) * 240 +
    Math.max(0, 0.1 - Math.abs(browLift - 0.075)) * 220 +
    profilePenalty * 26;
  const confusedRaw =
    18 +
    Math.max(0, 0.09 - innerBrowDistance) * 360 +
    Math.abs(eyeAspectLeft - eyeAspectRight) * 280 +
    profilePenalty * 40 +
    Math.max(0, 0.015 - mouthSmile) * 110;

  const happy = clampPercent(happyRaw);
  const surprise = clampPercent(surpriseRaw);
  const calm = clampPercent(calmRaw);
  const confused = clampPercent(confusedRaw);

  const total = happy + surprise + calm + confused || 1;

  return {
    happy: Number(((happy / total) * 100).toFixed(1)),
    calm: Number(((calm / total) * 100).toFixed(1)),
    surprise: Number(((surprise / total) * 100).toFixed(1)),
    confused: Number(((confused / total) * 100).toFixed(1)),
  };
};

watch(activeInputMode, () => {
  activeDetection.value = null;
  clearCanvas();
});

watch(
  () => multiFaceEnabled.value,
  () => {
    statusTone.value = "info";
    statusMessage.value = t("moodWorkbench.multiFaceHint");
  },
);

onMounted(async () => {
  await startCamera();
});

onBeforeUnmount(() => {
  clearDetectionLoop();
  stopCamera();
  if (uploadedPreviewUrl.value) {
    URL.revokeObjectURL(uploadedPreviewUrl.value);
  }
});
</script>

<style scoped>
@font-face {
  font-family: "Material Symbols Outlined Full";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("/fonts/material-symbols-outlined-full.ttf") format("truetype");
}

.material-symbols-outlined {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  overflow: hidden;
  font-family: "Material Symbols Outlined Full";
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 1;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.mood-workbench,
.mood-workbench * {
  box-sizing: border-box;
}

.mood-workbench {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) 384px;
  gap: 24px;
  align-items: stretch;
}

.mood-workbench__sidebar,
.mood-workbench__result {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mood-panel {
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.1);
  box-shadow: 0 10px 28px rgba(0, 91, 196, 0.04);
  padding: 24px;
}

.mood-panel--result {
  height: 100%;
}

.mood-panel__eyebrow {
  margin-bottom: 16px;
  color: #a53173;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.mood-panel__eyebrow--neutral {
  color: #7d8790;
}

.mood-input-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mood-upload-input {
  display: none;
}

.mood-input-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  background: #f1f4f6;
  color: #2d3337;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.mood-input-card:hover {
  transform: translateY(-1px);
  background: #e9eef5;
}

.mood-input-card--active {
  border: 2px solid #005bc4;
  background: rgba(0, 91, 196, 0.05);
  padding: 15px;
}

.mood-input-card__left {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  font-weight: 700;
}

.mood-input-card__left .material-symbols-outlined {
  color: #005bc4;
  font-size: 22px;
}

.mood-input-card__arrow {
  color: #9aa3ad;
  font-size: 18px;
}

.mood-input-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #005bc4;
  box-shadow: 0 0 0 6px rgba(0, 91, 196, 0.12);
}

.mood-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mood-config__label {
  color: #596063;
  font-size: 13px;
  font-weight: 700;
}

.mood-config__range {
  width: 100%;
  accent-color: #005bc4;
  cursor: pointer;
}

.mood-config__range-meta {
  display: flex;
  justify-content: space-between;
  color: #7d8790;
  font-size: 11px;
  font-weight: 700;
}

.mood-config__toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 4px;
  color: #2d3337;
  font-size: 14px;
  font-weight: 700;
}

.mood-switch {
  position: relative;
  width: 42px;
  height: 24px;
  border: none;
  border-radius: 999px;
  background: #c7d2e0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.mood-switch.is-on {
  background: #005bc4;
}

.mood-switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ffffff;
  transition: transform 0.2s ease;
}

.mood-switch.is-on .mood-switch__thumb {
  transform: translateX(18px);
}

.mood-workbench__stage {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.mood-camera-stage {
  position: relative;
  height: 560px;
  overflow: hidden;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 20px 36px rgba(0, 91, 196, 0.06);
}

.mood-camera-stage__surface {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0f172a;
}

.mood-camera-stage__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(0.22);
}

.mood-camera-stage__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.76);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.mood-camera-stage__placeholder .material-symbols-outlined {
  font-size: 56px;
}

.mood-camera-stage__placeholder p {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
}

.mood-camera-stage__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mood-camera-stage__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.06);
  pointer-events: none;
}

.mood-camera-stage__frame {
  position: absolute;
  border: 2px solid rgba(0, 91, 196, 0.5);
  border-radius: 16px;
  pointer-events: none;
}

.mood-camera-stage__corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: #005bc4;
  border-style: solid;
  border-width: 0;
}

.mood-camera-stage__corner--lt {
  top: -2px;
  left: -2px;
  border-top-width: 4px;
  border-left-width: 4px;
}

.mood-camera-stage__corner--rt {
  top: -2px;
  right: -2px;
  border-top-width: 4px;
  border-right-width: 4px;
}

.mood-camera-stage__corner--lb {
  bottom: -2px;
  left: -2px;
  border-bottom-width: 4px;
  border-left-width: 4px;
}

.mood-camera-stage__corner--rb {
  right: -2px;
  bottom: -2px;
  border-right-width: 4px;
  border-bottom-width: 4px;
}

.mood-camera-stage__scan-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #005bc4, transparent);
  animation: mood-scan 3s infinite linear;
  opacity: 0.45;
}

.mood-camera-stage__badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(0, 91, 196, 0.82);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.mood-camera-stage__hud {
  position: absolute;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.88);
  pointer-events: none;
}

.mood-camera-stage__hud--left {
  left: 24px;
}

.mood-camera-stage__hud--right {
  right: 24px;
}

.mood-camera-stage__metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mood-camera-stage__metric span {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.mood-camera-stage__metric strong {
  font-size: 14px;
  font-weight: 700;
}

.mood-camera-stage__divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.24);
}

.mood-recording-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
}

.mood-recording-pill__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #ff4d4f;
  animation: mood-pulse 1.4s infinite ease-in-out;
}

.mood-stage-action {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 72px;
}

.mood-stage-action__button {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-width: 220px;
  height: 58px;
  padding: 0 34px;
  border: none;
  border-radius: 999px;
  background: #005bc4;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 18px 30px rgba(0, 91, 196, 0.26);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mood-stage-action__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 36px rgba(0, 91, 196, 0.32);
}

.mood-stage-action__button .material-symbols-outlined {
  font-size: 28px;
}

.mood-result__headline {
  margin-bottom: 28px;
  color: #005bc4;
  font-size: 30px;
  line-height: 1.15;
  font-weight: 900;
}

.mood-result-bars {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.mood-result-bar.is-dim {
  opacity: 0.45;
}

.mood-result-bar__head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.mood-result-bar__head span {
  color: #2d3337;
  font-size: 14px;
  font-weight: 800;
}

.mood-result-bar__head strong {
  color: #005bc4;
  font-size: 24px;
  font-weight: 900;
}

.mood-result-bar__track {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: #f1f4f6;
}

.mood-result-bar__fill {
  height: 100%;
  border-radius: 999px;
}

.mood-result-bar__fill--happy {
  background: #005bc4;
}

.mood-result-bar__fill--calm {
  background: #69f6b8;
}

.mood-result-bar__fill--surprise {
  background: #ffd8e7;
}

.mood-result-bar__fill--confused {
  background: #acb3b7;
}

.mood-result__status {
  margin-top: 30px;
  min-height: 44px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f1f4f6;
  color: #596063;
  font-size: 13px;
  line-height: 1.5;
  font-weight: 700;
}

.mood-result__status.is-error {
  color: #ac3434;
  background: #fff1f0;
}

@keyframes mood-scan {
  0% {
    top: 0;
  }

  100% {
    top: calc(100% - 2px);
  }
}

@keyframes mood-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

@media (max-width: 1500px) {
  .mood-workbench {
    grid-template-columns: 292px minmax(0, 1fr) 340px;
    gap: 20px;
  }
}

@media (max-width: 1180px) {
  .mood-workbench {
    grid-template-columns: 1fr;
  }

  .mood-camera-stage {
    height: 440px;
  }
}
</style>
