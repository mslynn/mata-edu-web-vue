<template>
  <div class="hand-exp-page">
    <div class="hand-exp-shell">
      <div class="hand-exp-breadcrumb">
        <button type="button" class="hand-exp-breadcrumb__link" @click="goTo('/system/opt')">
          {{ t("gestureExperience.aiPracticeCenter") }}
        </button>
        <span>/</span>
        <button type="button" class="hand-exp-breadcrumb__link" @click="goTo('/system/opt/hand')">
          {{ t("gestureExperience.gestureRecognition") }}
        </button>
        <span>/</span>
        <span class="hand-exp-breadcrumb__current">{{ t("gestureExperience.experience") }}</span>
      </div>

      <main class="hand-exp-main">
        <div class="hand-exp-content">
          <div class="hand-exp-topbar">
            <div class="hand-exp-mode-merged">
              <span class="hand-exp-mode-merged__badge">{{ t("gestureExperience.mergedBadge") }}</span>
              <p class="hand-exp-mode-merged__desc">{{ t("gestureExperience.mergedDesc") }}</p>
            </div>

            <div v-if="cameraDeviceOptions.length > 1" class="hand-exp-camera-select">
              <span class="hand-exp-camera-select__label">{{ t("gestureExperience.cameraLabel") }}</span>
              <MSelect
                v-model="selectedDeviceId"
                :options="cameraDeviceOptions"
                :placeholder="t('gestureExperience.cameraPlaceholder')"
                @change="handleCameraDeviceChange"
              />
            </div>
          </div>

          <div
            class="hand-exp-workbench"
            :class="{ 'hand-exp-workbench--idle': !cameraActive }"
          >
            <div class="hand-exp-media">
              <video ref="videoRef" class="hand-exp-media__video" autoplay playsinline muted></video>
              <canvas ref="canvasRef" class="hand-exp-media__canvas"></canvas>
              <div v-if="!cameraActive" class="hand-exp-media__placeholder">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                  <path d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9.75a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 14.25 5.25H4.5A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" stroke="#6d7eff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>{{ t("gestureExperience.openCameraHint") }}</p>
              </div>
            </div>

            <div class="hand-exp-controls">
              <button
                v-if="!cameraActive"
                class="hand-exp-controls__btn hand-exp-controls__btn--primary"
                :disabled="modelLoading"
                @click="startCamera"
              >
                {{ modelLoading ? t("gestureExperience.modelLoading") : t("gestureExperience.openCamera") }}
              </button>
              <template v-else>
                <button
                  class="hand-exp-controls__btn hand-exp-controls__btn--capture"
                  :disabled="!currentGesture"
                  @click="captureGesture"
                >
                  <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ t("gestureExperience.captureAndLearn") }}
                </button>
                <button
                  class="hand-exp-controls__btn hand-exp-controls__btn--danger"
                  @click="handleStopCamera"
                >
                  {{ t("gestureExperience.closeCamera") }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <aside class="hand-exp-sidebar">
          <div class="hand-exp-result-card">
            <h3 class="hand-exp-result-card__title">{{ t("gestureExperience.resultTitle") }}</h3>
            <div v-if="matchedLearnedGesture" class="hand-exp-result-card__body">
              <div class="hand-exp-result-card__gesture-name">{{ matchedLearnedGesture.name }}</div>
              <div class="hand-exp-result-card__gesture-en">{{ t("gestureExperience.customGestureMatch", { score: (matchedLearnedGesture.score * 100).toFixed(0) }) }}</div>
              <div class="hand-exp-result-card__thumb">
                <img :src="matchedLearnedGesture.thumbnail" alt="" />
              </div>
            </div>
            <div v-else-if="currentGesture" class="hand-exp-result-card__body">
              <div class="hand-exp-result-card__gesture-name">{{ currentGesture.nameZh }}</div>
              <div class="hand-exp-result-card__gesture-en">{{ currentGesture.name }}</div>
              <div class="hand-exp-result-card__meta">
                <div class="hand-exp-result-card__meta-item">
                  <span class="hand-exp-result-card__meta-label">{{ t("gestureExperience.confidence") }}</span>
                  <span class="hand-exp-result-card__meta-value">{{ (currentGesture.confidence * 100).toFixed(1) }}%</span>
                </div>
                <div class="hand-exp-result-card__meta-item">
                  <span class="hand-exp-result-card__meta-label">{{ t("gestureExperience.fingerCount") }}</span>
                  <span class="hand-exp-result-card__meta-value">{{ currentGesture.fingerCount }}</span>
                </div>
              </div>
              <div class="hand-exp-result-card__bar">
                <div class="hand-exp-result-card__bar-fill" :style="{ width: (currentGesture.confidence * 100) + '%' }"></div>
              </div>
            </div>
            <div v-else class="hand-exp-result-card__empty">
              <span>{{ t("gestureExperience.waitingGesture") }}</span>
            </div>
          </div>

          <div class="hand-exp-guide-card">
            <h3 class="hand-exp-guide-card__title">{{ t("gestureExperience.supportedGestures") }}</h3>
            <div class="hand-exp-guide-card__list">
              <div class="hand-exp-guide-card__item"><span class="hand-exp-guide-card__emoji">✊</span><span>{{ t("gestureExperience.gestureList.fist") }}</span></div>
              <div class="hand-exp-guide-card__item"><span class="hand-exp-guide-card__emoji">✋</span><span>{{ t("gestureExperience.gestureList.openPalm") }}</span></div>
              <div class="hand-exp-guide-card__item"><span class="hand-exp-guide-card__emoji">✌️</span><span>{{ t("gestureExperience.gestureList.vSign") }}</span></div>
              <div class="hand-exp-guide-card__item"><span class="hand-exp-guide-card__emoji">👍</span><span>{{ t("gestureExperience.gestureList.thumbsUp") }}</span></div>
              <div class="hand-exp-guide-card__item"><span class="hand-exp-guide-card__emoji">☝️</span><span>{{ t("gestureExperience.gestureList.pointing") }}</span></div>
              <div class="hand-exp-guide-card__item"><span class="hand-exp-guide-card__emoji">🤟</span><span>{{ t("gestureExperience.gestureList.rock") }}</span></div>
            </div>
          </div>

          <div class="hand-exp-learn-card">
            <h3 class="hand-exp-learn-card__title">{{ t("gestureExperience.learnedLibrary", { count: learnedGestures.length }) }}</h3>
            <div v-if="learnedGestures.length > 0" class="hand-exp-learn-card__grid">
              <div
                v-for="(g, idx) in learnedGestures"
                :key="idx"
                class="hand-exp-learn-card__item"
              >
                <div class="hand-exp-learn-card__thumb">
                  <img :src="g.thumbnail" alt="" />
                  <button class="hand-exp-learn-card__delete" @click="removeGesture(idx)">×</button>
                </div>
                <span class="hand-exp-learn-card__name">{{ g.name }}</span>
              </div>
            </div>
            <div v-else class="hand-exp-learn-card__empty">
              <p>{{ t("gestureExperience.emptyLibraryTitle") }}</p>
              <p>{{ t("gestureExperience.emptyLibraryDesc") }}</p>
            </div>
            <button
              v-if="learnedGestures.length > 0"
              class="hand-exp-learn-card__clear"
              @click="clearAllGestures"
            >{{ t("gestureExperience.clearAll") }}</button>
          </div>

          <div v-if="gestureError" class="hand-exp-error-card">
            <p>{{ gestureError }}</p>
          </div>
        </aside>
      </main>
    </div>

    <div v-if="showNamingModal" class="hand-exp-modal-mask" @click.self="showNamingModal = false">
      <div class="hand-exp-modal">
        <h3>{{ t("gestureExperience.namingTitle") }}</h3>
        <div class="hand-exp-modal__preview">
          <img :src="capturedThumbnail" alt="" />
        </div>
        <input
          v-model="gestureName"
          class="hand-exp-modal__input"
          :placeholder="t('gestureExperience.namingPlaceholder')"
          maxlength="10"
          @keyup.enter="confirmLearn"
        />
        <div class="hand-exp-modal__actions">
          <button class="hand-exp-modal__btn hand-exp-modal__btn--confirm" @click="confirmLearn">{{ t("common.confirm") }}</button>
          <button class="hand-exp-modal__btn hand-exp-modal__btn--cancel" @click="showNamingModal = false">{{ t("common.cancel") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHandGesture, type HandLandmark } from "~/composables/useHandGesture";
import { useI18n } from "vue-i18n";

definePageMeta({ layout: "sidebar" });
const { t } = useI18n();
useHead(() => ({ title: t("gestureExperience.pageTitle") }));

const router = useRouter();
function goTo(path: string) { router.push(path); }

interface LearnedGesture {
  name: string;
  thumbnail: string;
  landmarks: HandLandmark[];
}

const STORAGE_KEY = "mata-hand-gesture-library";

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const cameraActive = ref(false);
const modelLoading = ref(false);

const showNamingModal = ref(false);
const gestureName = ref("");
const capturedThumbnail = ref("");
const capturedLandmarks = ref<HandLandmark[]>([]);

const learnedGestures = ref<LearnedGesture[]>([]);
const matchedLearnedGesture = ref<{ name: string; thumbnail: string; score: number } | null>(null);
const cameraDevices = ref<MediaDeviceInfo[]>([]);
const selectedDeviceId = ref<string | number | null>("");
const cameraDeviceOptions = computed(() =>
  cameraDevices.value.map((device, index) => ({
    value: device.deviceId,
    label: device.label || t("gestureExperience.cameraOption", { index: index + 1 }),
  })),
);

let stream: MediaStream | null = null;
let matchInterval: ReturnType<typeof setInterval> | null = null;
let cameraStarting = false;

const {
  isModelLoaded,
  currentGesture,
  error: gestureError,
  loadModel,
  startDetection,
  stopDetection,
} = useHandGesture();

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) learnedGestures.value = JSON.parse(data);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(learnedGestures.value));
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

function captureGesture() {
  if (!currentGesture.value) return;
  capturedThumbnail.value = captureThumbnail();
  capturedLandmarks.value = [...currentGesture.value.landmarks];
  gestureName.value = "";
  showNamingModal.value = true;
}

function confirmLearn() {
  const name = gestureName.value.trim();
  if (!name) return;
  learnedGestures.value.push({
    name,
    thumbnail: capturedThumbnail.value,
    landmarks: capturedLandmarks.value,
  });
  saveToStorage();
  showNamingModal.value = false;
}

function removeGesture(idx: number) {
  learnedGestures.value.splice(idx, 1);
  saveToStorage();
}

function clearAllGestures() {
  learnedGestures.value = [];
  saveToStorage();
}

function landmarkDistance(a: HandLandmark[], b: HandLandmark[]): number {
  let sum = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    sum += (a[i]!.x - b[i]!.x) ** 2 + (a[i]!.y - b[i]!.y) ** 2;
  }
  return Math.sqrt(sum / Math.min(a.length, b.length));
}

function matchAgainstLibrary() {
  if (!currentGesture.value || learnedGestures.value.length === 0) {
    matchedLearnedGesture.value = null;
    return;
  }
  const current = currentGesture.value.landmarks;
  let bestScore = 0;
  let bestMatch: LearnedGesture | null = null;

  for (const g of learnedGestures.value) {
    const dist = landmarkDistance(current, g.landmarks);
    const score = Math.max(0, 1 - dist * 5);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = g;
    }
  }

  if (bestMatch && bestScore > 0.7) {
    matchedLearnedGesture.value = { name: bestMatch.name, thumbnail: bestMatch.thumbnail, score: bestScore };
  } else {
    matchedLearnedGesture.value = null;
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
    return t("gestureExperience.errors.cameraPermission");
  }

  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return t("gestureExperience.errors.cameraNotFound");
  }

  if (errorName === "NotReadableError" || errorName === "TrackStartError") {
    const detail =
      error instanceof Error && error.message
        ? `（${error.message}）`
        : "";
    return t("gestureExperience.errors.cameraUnreadable", { detail });
  }

  if (errorName === "AbortError") {
    return t("gestureExperience.errors.cameraAborted");
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return t("gestureExperience.errors.cameraUnavailable");
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

  throw lastError ?? new Error(t("gestureExperience.errors.cameraUnavailable"));
}

async function startCamera() {
  if (cameraStarting) return;
  cameraStarting = true;
  modelLoading.value = true;
  try {
    gestureError.value = null;
    if (!isModelLoaded.value) await loadModel();
    if (gestureError.value) return;

    if (!import.meta.client || !navigator.mediaDevices?.getUserMedia) {
      throw new Error(t("gestureExperience.errors.browserUnsupported"));
    }

    await stopCamera({ preserveStream: true });
    await refreshCameraDevices();

    if (!hasReusableStream()) {
      stream = await requestCameraStream();
    }

    await nextTick();

    if (!videoRef.value) {
      throw new Error(t("gestureExperience.errors.videoNotReady"));
    }

    videoRef.value.srcObject = stream;
    await waitForVideoReady(videoRef.value);

    if (!canvasRef.value) {
      throw new Error(t("gestureExperience.errors.canvasNotReady"));
    }

    canvasRef.value.width = videoRef.value.videoWidth;
    canvasRef.value.height = videoRef.value.videoHeight;
    startDetection(videoRef.value, canvasRef.value);

    cameraActive.value = true;
    matchInterval = setInterval(matchAgainstLibrary, 300);
    await refreshCameraDevices();
  } catch (e: unknown) {
    console.error("打开手势识别摄像头失败:", e);
    stopDetection();
    await releaseVideoElement();
    await stopMediaStream();
    cameraActive.value = false;
    matchedLearnedGesture.value = null;
    gestureError.value = normalizeCameraError(e);
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
  matchedLearnedGesture.value = null;
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
.hand-exp-page {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  color: #163257;
}

.hand-exp-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 24px;
  box-sizing: border-box;
}

.hand-exp-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #adb7d3;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 20px;
}

.hand-exp-breadcrumb span { color: #c5cce0; }

.hand-exp-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #c5cce0;
  font-size: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.hand-exp-breadcrumb__link:hover { color: #8ea3ff; }
.hand-exp-breadcrumb__current { color: #6d7eff !important; font-weight: 600; }

.hand-exp-main {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.hand-exp-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hand-exp-topbar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hand-exp-workbench {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hand-exp-workbench--idle {
  align-self: stretch;
}

.hand-exp-mode-merged {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hand-exp-mode-merged__badge {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(79, 104, 251, 0.12) 0%, rgba(123, 213, 255, 0.18) 100%);
  color: #4f68fb;
  font-size: 13px;
  font-weight: 700;
}

.hand-exp-mode-merged__desc {
  margin: 0;
  font-size: 13px;
  color: #7080a3;
  line-height: 1.6;
}

.hand-exp-camera-select {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 320px;
}

.hand-exp-camera-select__label {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #53627f;
}

.hand-exp-media {
  flex: 1;
  min-height: 0;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #0a0f1e;
  border: 1px solid rgba(79, 117, 255, 0.15);
}

.hand-exp-workbench--idle .hand-exp-media {
  min-height: 560px;
}

.hand-exp-media__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.hand-exp-media__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  pointer-events: none;
}

.hand-exp-media__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #7080a3;
  font-size: 14px;
}

.hand-exp-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.hand-exp-controls__btn {
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

.hand-exp-controls__btn:disabled { opacity: 0.6; cursor: not-allowed; }

.hand-exp-controls__btn--primary {
  background: linear-gradient(135deg, #6580ff 0%, #4f68fb 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(80, 106, 252, 0.25);
}

.hand-exp-controls__btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(80, 106, 252, 0.35);
}

.hand-exp-controls__btn--capture {
  background: linear-gradient(135deg, #1a56db 0%, #1e40af 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(26, 86, 219, 0.3);
  padding: 14px 32px;
  font-size: 15px;
  border-radius: 14px;
}

.hand-exp-controls__btn--capture:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(26, 86, 219, 0.4);
}

.hand-exp-controls__btn--danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(238, 90, 36, 0.25);
}

.hand-exp-controls__btn--danger:hover { transform: translateY(-1px); }

.hand-exp-sidebar {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 74px;
}

.hand-exp-result-card,
.hand-exp-guide-card,
.hand-exp-learn-card,
.hand-exp-error-card {
  border-radius: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid #eef1f8;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.hand-exp-result-card__title,
.hand-exp-guide-card__title,
.hand-exp-learn-card__title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 700;
  color: #1a2540;
}

.hand-exp-result-card__gesture-name {
  font-size: 28px;
  font-weight: 800;
  color: #4f68fb;
  line-height: 1.2;
}

.hand-exp-result-card__gesture-en {
  font-size: 13px;
  color: #7080a3;
  margin-top: 4px;
}

.hand-exp-result-card__thumb {
  margin-top: 12px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #eef1f8;
}

.hand-exp-result-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hand-exp-result-card__meta { display: flex; gap: 20px; margin-top: 16px; }
.hand-exp-result-card__meta-item { display: flex; flex-direction: column; gap: 4px; }
.hand-exp-result-card__meta-label { font-size: 11px; color: #adb7d3; font-weight: 500; }
.hand-exp-result-card__meta-value { font-size: 16px; font-weight: 700; color: #1a2540; }

.hand-exp-result-card__bar {
  margin-top: 14px;
  height: 6px;
  border-radius: 999px;
  background: #eef1f8;
  overflow: hidden;
}

.hand-exp-result-card__bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f73ff 0%, #7bd5ff 100%);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.hand-exp-result-card__empty {
  color: #adb7d3;
  font-size: 13px;
  text-align: center;
  padding: 24px 0;
}

.hand-exp-guide-card__list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

.hand-exp-guide-card__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: #f7f8fc;
  font-size: 13px;
  color: #3d4f6f;
}

.hand-exp-guide-card__emoji { font-size: 18px; }

.hand-exp-learn-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.hand-exp-learn-card__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.hand-exp-learn-card__thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #eef1f8;
  background: #1a1a2e;
}

.hand-exp-learn-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hand-exp-learn-card__delete {
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

.hand-exp-learn-card__thumb:hover .hand-exp-learn-card__delete {
  opacity: 1;
}

.hand-exp-learn-card__name {
  font-size: 13px;
  font-weight: 600;
  color: #1a2540;
}

.hand-exp-learn-card__empty {
  text-align: center;
  padding: 20px 0;
  color: #adb7d3;
  font-size: 13px;
  line-height: 1.8;
}

.hand-exp-learn-card__empty p { margin: 0; }

.hand-exp-learn-card__clear {
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

.hand-exp-learn-card__clear:hover { background: #fee2e2; }

.hand-exp-error-card {
  background: #fff5f5;
  border-color: #fecaca;
}

.hand-exp-error-card p { margin: 0; color: #dc2626; font-size: 13px; }

.hand-exp-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.hand-exp-modal {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  width: 340px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
}

.hand-exp-modal h3 {
  margin: 0 0 16px;
  font-size: 17px;
  font-weight: 700;
  color: #1a2540;
}

.hand-exp-modal__preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
  border: 3px solid #eef1f8;
  background: #1a1a2e;
}

.hand-exp-modal__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hand-exp-modal__input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.hand-exp-modal__input:focus { border-color: #4f68fb; }

.hand-exp-modal__actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.hand-exp-modal__btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.hand-exp-modal__btn--confirm {
  background: linear-gradient(135deg, #6580ff 0%, #4f68fb 100%);
  color: #fff;
}

.hand-exp-modal__btn--cancel {
  background: #f0f2f8;
  color: #7080a3;
}

@media (max-width: 1024px) {
  .hand-exp-main {
    flex-direction: column;
  }
  .hand-exp-content {
    gap: 12px;
  }
  .hand-exp-sidebar {
    margin-top: 0;
  }
  .hand-exp-sidebar { width: 100%; }
}
</style>
