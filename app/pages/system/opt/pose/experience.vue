<template>
  <div class="pose-exp-page">
    <div class="pose-exp-shell">
      <div class="pose-exp-breadcrumb">
        <button type="button" class="pose-exp-breadcrumb__link" @click="goTo('/system/opt')">
          {{ t("poseExperience.aiPracticeCenter") }}
        </button>
        <span>/</span>
        <button type="button" class="pose-exp-breadcrumb__link" @click="goTo('/system/opt/pose')">
          {{ t("poseExperience.poseRecognition") }}
        </button>
        <span>/</span>
        <span class="pose-exp-breadcrumb__current">{{ t("poseExperience.experience") }}</span>
      </div>

      <main class="pose-exp-main">
        <div class="pose-exp-content">
          <div class="pose-exp-topbar">
            <div class="pose-exp-mode-merged">
              <span class="pose-exp-mode-merged__badge">{{ t("poseExperience.mergedBadge") }}</span>
              <p class="pose-exp-mode-merged__desc">{{ t("poseExperience.mergedDesc") }}</p>
            </div>

            <div v-if="cameraDeviceOptions.length > 1" class="pose-exp-camera-select">
              <span class="pose-exp-camera-select__label">{{ t("poseExperience.cameraLabel") }}</span>
              <MSelect
                v-model="selectedDeviceId"
                :options="cameraDeviceOptions"
                :placeholder="t('poseExperience.cameraPlaceholder')"
                @change="handleCameraDeviceChange"
              />
            </div>
          </div>

          <div
            class="pose-exp-workbench"
            :class="{ 'pose-exp-workbench--idle': !cameraActive }"
          >
            <div class="pose-exp-media">
              <video ref="videoRef" class="pose-exp-media__video" autoplay playsinline muted></video>
              <canvas ref="canvasRef" class="pose-exp-media__canvas"></canvas>
              <div v-if="!cameraActive" class="pose-exp-media__placeholder">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                  <path d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 14.25 5.25H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" stroke="#4b8eff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>{{ t("poseExperience.openCameraHint") }}</p>
              </div>
            </div>

            <div class="pose-exp-controls">
              <button
                v-if="!cameraActive"
                class="pose-exp-controls__btn pose-exp-controls__btn--primary"
                :disabled="modelLoading"
                @click="startCamera"
              >
                {{ modelLoading ? t("poseExperience.modelLoading") : t("poseExperience.openCamera") }}
              </button>
              <template v-else>
                <button
                  class="pose-exp-controls__btn pose-exp-controls__btn--capture"
                  :disabled="!currentPose"
                  @click="capturePose"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ t("poseExperience.captureAndLearn") }}
                </button>
                <button
                  class="pose-exp-controls__btn pose-exp-controls__btn--danger"
                  @click="handleStopCamera"
                >
                  {{ t("poseExperience.closeCamera") }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <aside class="pose-exp-sidebar">
          <div class="pose-exp-result-card">
            <h3 class="pose-exp-result-card__title">{{ t("poseExperience.resultTitle") }}</h3>
            <div v-if="matchedLearnedPose" class="pose-exp-result-card__body">
              <div class="pose-exp-result-card__pose-name">{{ matchedLearnedPose.name }}</div>
              <div class="pose-exp-result-card__pose-en">{{ t("poseExperience.customPoseMatch", { score: (matchedLearnedPose.score * 100).toFixed(0) }) }}</div>
              <div class="pose-exp-result-card__thumb">
                <img :src="matchedLearnedPose.thumbnail" alt="" />
              </div>
            </div>
            <div v-else-if="currentPose" class="pose-exp-result-card__body">
              <div class="pose-exp-result-card__pose-name">{{ currentPose.nameZh }}</div>
              <div class="pose-exp-result-card__pose-en">{{ currentPose.name }}</div>
              <div class="pose-exp-result-card__meta">
                <div class="pose-exp-result-card__meta-item">
                  <span class="pose-exp-result-card__meta-label">{{ t("poseExperience.confidence") }}</span>
                  <span class="pose-exp-result-card__meta-value">{{ (currentPose.confidence * 100).toFixed(1) }}%</span>
                </div>
                <div class="pose-exp-result-card__meta-item">
                  <span class="pose-exp-result-card__meta-label">{{ t("poseExperience.keypoints") }}</span>
                  <span class="pose-exp-result-card__meta-value">{{ currentPose.landmarks.length }}</span>
                </div>
              </div>
              <div class="pose-exp-result-card__bar">
                <div class="pose-exp-result-card__bar-fill" :style="{ width: (currentPose.confidence * 100) + '%' }"></div>
              </div>
            </div>
            <div v-else class="pose-exp-result-card__empty">
              <span>{{ t("poseExperience.waitingPose") }}</span>
            </div>
          </div>

          <div class="pose-exp-guide-card">
            <h3 class="pose-exp-guide-card__title">{{ t("poseExperience.supportedPoses") }}</h3>
            <div class="pose-exp-guide-card__list">
              <div class="pose-exp-guide-card__item"><span class="pose-exp-guide-card__emoji">🙌</span><span>{{ t("poseExperience.poseList.handsUp") }}</span></div>
              <div class="pose-exp-guide-card__item"><span class="pose-exp-guide-card__emoji">✋</span><span>{{ t("poseExperience.poseList.leftHandUp") }}</span></div>
              <div class="pose-exp-guide-card__item"><span class="pose-exp-guide-card__emoji">🤚</span><span>{{ t("poseExperience.poseList.rightHandUp") }}</span></div>
              <div class="pose-exp-guide-card__item"><span class="pose-exp-guide-card__emoji">🧍</span><span>{{ t("poseExperience.poseList.tPose") }}</span></div>
              <div class="pose-exp-guide-card__item"><span class="pose-exp-guide-card__emoji">🤷</span><span>{{ t("poseExperience.poseList.handsOnHips") }}</span></div>
              <div class="pose-exp-guide-card__item"><span class="pose-exp-guide-card__emoji">🧘</span><span>{{ t("poseExperience.poseList.armsFolded") }}</span></div>
              <div class="pose-exp-guide-card__item"><span class="pose-exp-guide-card__emoji">🏋️</span><span>{{ t("poseExperience.poseList.squat") }}</span></div>
              <div class="pose-exp-guide-card__item"><span class="pose-exp-guide-card__emoji">🚶</span><span>{{ t("poseExperience.poseList.stand") }}</span></div>
            </div>
          </div>

          <div class="pose-exp-learn-card">
            <h3 class="pose-exp-learn-card__title">{{ t("poseExperience.learnedLibrary", { count: learnedPoses.length }) }}</h3>
            <div v-if="learnedPoses.length > 0" class="pose-exp-learn-card__grid">
              <div
                v-for="(p, idx) in learnedPoses"
                :key="idx"
                class="pose-exp-learn-card__item"
              >
                <div class="pose-exp-learn-card__thumb">
                  <img :src="p.thumbnail" alt="" />
                  <button class="pose-exp-learn-card__delete" @click="removePose(idx)">×</button>
                </div>
                <span class="pose-exp-learn-card__name">{{ p.name }}</span>
              </div>
            </div>
            <div v-else class="pose-exp-learn-card__empty">
              <p>{{ t("poseExperience.emptyLibraryTitle") }}</p>
              <p>{{ t("poseExperience.emptyLibraryDesc") }}</p>
            </div>
            <button
              v-if="learnedPoses.length > 0"
              class="pose-exp-learn-card__clear"
              @click="clearAllPoses"
            >{{ t("poseExperience.clearAll") }}</button>
          </div>

          <div v-if="poseError" class="pose-exp-error-card">
            <p>{{ poseError }}</p>
          </div>
        </aside>
      </main>
    </div>

    <div v-if="showNamingModal" class="pose-exp-modal-mask" @click.self="showNamingModal = false">
      <div class="pose-exp-modal">
        <h3>{{ t("poseExperience.namingTitle") }}</h3>
        <div class="pose-exp-modal__preview">
          <img :src="capturedThumbnail" alt="" />
        </div>
        <input
          v-model="poseName"
          class="pose-exp-modal__input"
          :placeholder="t('poseExperience.namingPlaceholder')"
          maxlength="10"
          @keyup.enter="confirmLearn"
        />
        <div class="pose-exp-modal__actions">
          <button class="pose-exp-modal__btn pose-exp-modal__btn--confirm" @click="confirmLearn">{{ t("common.confirm") }}</button>
          <button class="pose-exp-modal__btn pose-exp-modal__btn--cancel" @click="showNamingModal = false">{{ t("common.cancel") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePoseDetection, type PoseLandmark } from "~/composables/usePoseDetection";
import { useI18n } from "vue-i18n";

definePageMeta({ layout: "sidebar" });
const { t } = useI18n();
useHead(() => ({ title: t("poseExperience.pageTitle") }));

const router = useRouter();
function goTo(path: string) { router.push(path); }

interface LearnedPose {
  name: string;
  thumbnail: string;
  landmarks: PoseLandmark[];
}

const STORAGE_KEY = "mata-pose-library";

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const cameraActive = ref(false);
const modelLoading = ref(false);

const showNamingModal = ref(false);
const poseName = ref("");
const capturedThumbnail = ref("");
const capturedLandmarks = ref<PoseLandmark[]>([]);

const learnedPoses = ref<LearnedPose[]>([]);
const matchedLearnedPose = ref<{ name: string; thumbnail: string; score: number } | null>(null);
const cameraDevices = ref<MediaDeviceInfo[]>([]);
const selectedDeviceId = ref<string | number | null>("");
const cameraDeviceOptions = computed(() =>
  cameraDevices.value.map((device, index) => ({
    value: device.deviceId,
    label: device.label || t("poseExperience.cameraOption", { index: index + 1 }),
  })),
);

let stream: MediaStream | null = null;
let matchInterval: ReturnType<typeof setInterval> | null = null;
let cameraStarting = false;

const {
  isModelLoaded,
  currentPose,
  error: poseError,
  loadModel,
  startDetection,
  stopDetection,
} = usePoseDetection();

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) learnedPoses.value = JSON.parse(data);
  } catch {}
}

async function refreshCameraDevices() {
  if (!import.meta.client || !navigator.mediaDevices?.enumerateDevices) return;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoInputs = devices.filter((device) => device.kind === "videoinput");
  cameraDevices.value = videoInputs;

  if (!videoInputs.length) {
    selectedDeviceId.value = "";
    return;
  }

  if (
    !selectedDeviceId.value ||
    !videoInputs.some((device) => device.deviceId === selectedDeviceId.value)
  ) {
    selectedDeviceId.value = videoInputs[0]?.deviceId ?? "";
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(learnedPoses.value));
}

function clearCanvas() {
  if (!canvasRef.value) return;
  const context = canvasRef.value.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
}

function captureThumbnail(): string {
  if (!videoRef.value) return "";
  const canvas = document.createElement("canvas");
  canvas.width = 120;
  canvas.height = 120;
  const ctx = canvas.getContext("2d")!;
  const v = videoRef.value;
  const size = Math.min(v.videoWidth, v.videoHeight);
  const sx = (v.videoWidth - size) / 2;
  const sy = (v.videoHeight - size) / 2;
  ctx.translate(120, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(v, sx, sy, size, size, 0, 0, 120, 120);
  return canvas.toDataURL("image/jpeg", 0.7);
}

function capturePose() {
  if (!currentPose.value) return;
  capturedThumbnail.value = captureThumbnail();
  capturedLandmarks.value = [...currentPose.value.landmarks];
  poseName.value = "";
  showNamingModal.value = true;
}

function confirmLearn() {
  const name = poseName.value.trim();
  if (!name) return;
  learnedPoses.value.push({
    name,
    thumbnail: capturedThumbnail.value,
    landmarks: capturedLandmarks.value,
  });
  saveToStorage();
  showNamingModal.value = false;
}

function removePose(idx: number) {
  learnedPoses.value.splice(idx, 1);
  saveToStorage();
}

function clearAllPoses() {
  learnedPoses.value = [];
  saveToStorage();
}

function landmarkDistance(a: PoseLandmark[], b: PoseLandmark[]): number {
  const upperBodyIndices = [11, 12, 13, 14, 15, 16, 23, 24];
  let sum = 0;
  let count = 0;
  for (const i of upperBodyIndices) {
    if (!a[i] || !b[i]) continue;
    sum += (a[i]!.x - b[i]!.x) ** 2 + (a[i]!.y - b[i]!.y) ** 2;
    count++;
  }
  if (count === 0) return Infinity;
  return Math.sqrt(sum / count);
}

function matchAgainstLibrary() {
  if (!currentPose.value || learnedPoses.value.length === 0) {
    matchedLearnedPose.value = null;
    return;
  }
  const current = currentPose.value.landmarks;
  let bestScore = 0;
  let bestMatch: LearnedPose | null = null;

  for (const p of learnedPoses.value) {
    const dist = landmarkDistance(current, p.landmarks);
    const score = Math.max(0, 1 - dist * 4);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = p;
    }
  }

  if (bestMatch && bestScore > 0.7) {
    matchedLearnedPose.value = { name: bestMatch.name, thumbnail: bestMatch.thumbnail, score: bestScore };
  } else {
    matchedLearnedPose.value = null;
  }
}

async function releaseVideoElement() {
  if (!videoRef.value) return;
  videoRef.value.pause();
  videoRef.value.srcObject = null;
  videoRef.value.removeAttribute("src");
  videoRef.value.load();
  await nextTick();
}

async function stopMediaStream() {
  if (!stream) return;
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());
  stream = null;
  await new Promise((resolve) => window.setTimeout(resolve, 160));
}

function hasReusableStream() {
  return Boolean(stream?.getVideoTracks().some((track) => track.readyState === "live"));
}

function waitForVideoReady(video: HTMLVideoElement) {
  return new Promise<void>((resolve, reject) => {
    if (video.readyState >= 1) {
      video.play().then(() => resolve()).catch(reject);
      return;
    }

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
    };

    video.onloadedmetadata = async () => {
      try {
        await video.play();
        cleanup();
        resolve();
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("视频流初始化失败"));
    };
  });
}

function normalizeCameraError(error: unknown) {
  const errorName =
    error instanceof DOMException
      ? error.name
      : typeof error === "object" && error && "name" in error
        ? String((error as { name?: string }).name || "")
        : "";

  if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
    return t("poseExperience.errors.cameraPermission");
  }

  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return t("poseExperience.errors.cameraNotFound");
  }

  if (errorName === "NotReadableError" || errorName === "TrackStartError") {
    const detail =
      error instanceof Error && error.message
        ? `（${error.message}）`
        : "";
    return t("poseExperience.errors.cameraUnreadable", { detail });
  }

  if (errorName === "AbortError") {
    return t("poseExperience.errors.cameraAborted");
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t("poseExperience.errors.cameraUnavailable");
}

async function requestCameraStream() {
  let lastError: unknown = null;
  const tryGetUserMedia = async (constraints: MediaStreamConstraints) => {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;
      return null;
    }
  };

  const baseConstraint = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  if (selectedDeviceId.value) {
    const selectedStream = await tryGetUserMedia({
      audio: false,
      video: {
        deviceId: { exact: String(selectedDeviceId.value) },
        ...baseConstraint,
      },
    });
    if (selectedStream) {
      return selectedStream;
    }
  }

  const directAttempts: MediaStreamConstraints[] = [
    {
      audio: false,
      video: baseConstraint,
    },
    {
      audio: false,
      video: true,
    },
  ];

  for (const constraints of directAttempts) {
    const directStream = await tryGetUserMedia(constraints);
    if (directStream) {
      return directStream;
    }
  }

  if (navigator.mediaDevices.enumerateDevices) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((device) => device.kind === "videoinput");

    for (const device of videoInputs) {
      const exactDeviceStream = await tryGetUserMedia({
        audio: false,
        video: {
          deviceId: { exact: device.deviceId },
          ...baseConstraint,
        },
      });
      if (exactDeviceStream) {
        return exactDeviceStream;
      }

      const looseDeviceStream = await tryGetUserMedia({
        audio: false,
        video: {
          deviceId: device.deviceId,
        },
      });
      if (looseDeviceStream) {
        return looseDeviceStream;
      }
    }
  }

  throw lastError ?? new Error(t("poseExperience.errors.cameraUnavailable"));
}

async function startCamera() {
  if (cameraStarting) return;
  cameraStarting = true;
  modelLoading.value = true;
  try {
    poseError.value = null;
    if (!isModelLoaded.value) await loadModel();
    if (poseError.value) return;

    if (!import.meta.client || !navigator.mediaDevices?.getUserMedia) {
      throw new Error(t("poseExperience.errors.browserUnsupported"));
    }

    await stopCamera({ preserveStream: true });
    await refreshCameraDevices();

    if (!hasReusableStream()) {
      stream = await requestCameraStream();
    }

    await nextTick();

    if (!videoRef.value) {
      throw new Error(t("poseExperience.errors.videoNotReady"));
    }

    videoRef.value.srcObject = stream;
    await waitForVideoReady(videoRef.value);

    if (!canvasRef.value) {
      throw new Error(t("poseExperience.errors.canvasNotReady"));
    }

    canvasRef.value.width = videoRef.value.videoWidth;
    canvasRef.value.height = videoRef.value.videoHeight;
    startDetection(videoRef.value, canvasRef.value);

    cameraActive.value = true;
    matchInterval = setInterval(matchAgainstLibrary, 300);
    await refreshCameraDevices();
  } catch (e: unknown) {
    console.error("打开姿态识别摄像头失败:", e);
    stopDetection();
    await releaseVideoElement();
    await stopMediaStream();
    cameraActive.value = false;
    matchedLearnedPose.value = null;
    poseError.value = normalizeCameraError(e);
  } finally {
    modelLoading.value = false;
    cameraStarting = false;
  }
}

async function stopCamera(options?: { preserveStream?: boolean }) {
  stopDetection();
  if (matchInterval) { clearInterval(matchInterval); matchInterval = null; }
  clearCanvas();
  await releaseVideoElement();
  if (!options?.preserveStream) {
    await stopMediaStream();
  }
  cameraActive.value = false;
  matchedLearnedPose.value = null;
}

function handleStopCamera() {
  void stopCamera({ preserveStream: true });
}

async function handleCameraDeviceChange() {
  if (!cameraActive.value) return;
  await startCamera();
}

onMounted(() => {
  loadFromStorage();
  void refreshCameraDevices();
  if (import.meta.client && navigator.mediaDevices?.addEventListener) {
    navigator.mediaDevices.addEventListener("devicechange", refreshCameraDevices);
  }
});

onUnmounted(() => {
  if (import.meta.client && navigator.mediaDevices?.removeEventListener) {
    navigator.mediaDevices.removeEventListener("devicechange", refreshCameraDevices);
  }
  void stopCamera({ preserveStream: false });
});
</script>

<style scoped>
.pose-exp-page {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  color: #163257;
}

.pose-exp-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 24px;
  box-sizing: border-box;
}

.pose-exp-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #adb7d3;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 20px;
}

.pose-exp-breadcrumb span { color: #c5cce0; }

.pose-exp-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #c5cce0;
  font-size: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.pose-exp-breadcrumb__link:hover { color: #005bc2; }
.pose-exp-breadcrumb__current { color: #005bc2 !important; font-weight: 600; }

.pose-exp-main {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.pose-exp-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pose-exp-topbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pose-exp-workbench {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pose-exp-workbench--idle {
  align-self: stretch;
}

.pose-exp-mode-merged {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pose-exp-mode-merged__badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(0, 91, 194, 0.12) 0%, rgba(75, 142, 255, 0.18) 100%);
  color: #005bc2;
  font-size: 13px;
  font-weight: 700;
}

.pose-exp-mode-merged__desc {
  margin: 0;
  font-size: 13px;
  color: #7080a3;
  line-height: 1.6;
}

.pose-exp-camera-select {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 320px;
}

.pose-exp-camera-select__label {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #53627f;
}

.pose-exp-media {
  flex: 1;
  min-height: 0;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #0a0f1e;
  border: 1px solid rgba(245, 105, 101, 0.15);
}

.pose-exp-workbench--idle .pose-exp-media {
  min-height: 560px;
}

.pose-exp-media__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.pose-exp-media__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  pointer-events: none;
}

.pose-exp-media__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: rgba(165, 193, 255, 0.92);
  font-size: 14px;
}

.pose-exp-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.pose-exp-controls__btn {
  padding: 12px 28px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pose-exp-controls__btn:disabled { opacity: 0.6; cursor: not-allowed; }

.pose-exp-controls__btn--primary {
  background: linear-gradient(135deg, #005bc2 0%, #4b8eff 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(0, 91, 194, 0.25);
}

.pose-exp-controls__btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(0, 91, 194, 0.35);
}

.pose-exp-controls__btn--capture {
  background: linear-gradient(135deg, #db1a2e 0%, #af1e30 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(219, 26, 46, 0.3);
  padding: 14px 32px;
  font-size: 15px;
  border-radius: 14px;
}

.pose-exp-controls__btn--capture:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(219, 26, 46, 0.4);
}

.pose-exp-controls__btn--danger {
  background: linear-gradient(135deg, #6b7bff 0%, #4f68fb 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(79, 104, 251, 0.25);
}

.pose-exp-controls__btn--danger:hover { transform: translateY(-1px); }

.pose-exp-sidebar {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 74px;
}

.pose-exp-result-card,
.pose-exp-guide-card,
.pose-exp-learn-card,
.pose-exp-error-card {
  border-radius: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid #eef1f8;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.pose-exp-result-card__title,
.pose-exp-guide-card__title,
.pose-exp-learn-card__title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: #1a2540;
}

.pose-exp-result-card__pose-name {
  font-size: 28px;
  font-weight: 800;
  color: #f56965;
  line-height: 1.2;
}

.pose-exp-result-card__pose-en {
  font-size: 13px;
  color: #7080a3;
  margin-top: 4px;
}

.pose-exp-result-card__thumb {
  margin-top: 12px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #eef1f8;
}

.pose-exp-result-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pose-exp-result-card__meta { display: flex; gap: 20px; margin-top: 16px; }
.pose-exp-result-card__meta-item { display: flex; flex-direction: column; gap: 4px; }
.pose-exp-result-card__meta-label { font-size: 11px; color: #adb7d3; font-weight: 500; }
.pose-exp-result-card__meta-value { font-size: 16px; font-weight: 700; color: #1a2540; }

.pose-exp-result-card__bar {
  margin-top: 14px;
  height: 6px;
  border-radius: 999px;
  background: #eef1f8;
  overflow: hidden;
}

.pose-exp-result-card__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f56965 0%, #ffb284 100%);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.pose-exp-result-card__empty {
  color: #adb7d3;
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
}

.pose-exp-guide-card__list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

.pose-exp-guide-card__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #f7f8fc;
  font-size: 13px;
  color: #3d4f6f;
}

.pose-exp-guide-card__emoji { font-size: 18px; }

.pose-exp-learn-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.pose-exp-learn-card__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.pose-exp-learn-card__thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #eef1f8;
  background: #1a1a2e;
}

.pose-exp-learn-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pose-exp-learn-card__delete {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: #ff4757;
  color: #fff;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.pose-exp-learn-card__thumb:hover .pose-exp-learn-card__delete {
  opacity: 1;
}

.pose-exp-learn-card__name {
  font-size: 13px;
  font-weight: 600;
  color: #1a2540;
}

.pose-exp-learn-card__empty {
  text-align: center;
  padding: 20px 0;
  color: #adb7d3;
  font-size: 13px;
  line-height: 1.8;
}

.pose-exp-learn-card__empty p { margin: 0; }

.pose-exp-learn-card__clear {
  margin-top: 12px;
  padding: 8px 16px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff5f5;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  align-self: center;
  transition: background 0.2s;
}

.pose-exp-learn-card__clear:hover { background: #fee2e2; }

.pose-exp-error-card {
  background: #fff5f5;
  border-color: #fecaca;
}

.pose-exp-error-card p { margin: 0; color: #dc2626; font-size: 13px; }

.pose-exp-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.pose-exp-modal {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  width: 340px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
}

.pose-exp-modal h3 {
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 700;
  color: #1a2540;
}

.pose-exp-modal__preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
  border: 3px solid #eef1f8;
  background: #1a1a2e;
}

.pose-exp-modal__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pose-exp-modal__input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.pose-exp-modal__input:focus { border-color: #f56965; }

.pose-exp-modal__actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.pose-exp-modal__btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.pose-exp-modal__btn--confirm {
  background: linear-gradient(135deg, #ff8c80 0%, #f56965 100%);
  color: #fff;
}

.pose-exp-modal__btn--cancel {
  background: #f0f2f8;
  color: #7080a3;
}

@media (max-width: 1024px) {
  .pose-exp-main {
    flex-direction: column;
  }
  .pose-exp-content {
    gap: 12px;
  }
  .pose-exp-sidebar {
    margin-top: 0;
  }
  .pose-exp-sidebar { width: 100%; }
}
</style>
