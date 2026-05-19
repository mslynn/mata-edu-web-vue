<template>
  <div
    ref="workbenchPageRef"
    class="handwritten-workbench-page"
    :class="{ 'handwritten-workbench-page--compact': isCompactWorkbenchLayout }"
    :style="pageAdaptiveStyle"
  >
    <div class="page-header">
      <nav class="workbench-breadcrumb" aria-label="breadcrumb">
        <button
          type="button"
          class="workbench-breadcrumb__back"
          @click="handleBack"
        >
          <svg class="workbench-breadcrumb__back-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10.5 3.5L6 8L10.5 12.5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t("common.back") }}</span>
        </button>
      </nav>

      <div class="workbench-header-copy">
        <h1 class="workbench-title">{{ t("ai.handwrittenWorkbench.title") }}</h1>
        <p class="workbench-desc">{{ t("ai.handwrittenWorkbench.desc") }}</p>
      </div>
    </div>

    <div class="content-area">
      <div class="workbench-shell">
        <div class="workbench-grid">
          <section class="workbench-main">
            <div class="workbench-mode-switch">
              <button
                v-for="item in modeOptions"
                :key="item.value"
                type="button"
                class="workbench-mode-switch__item"
                :class="{ 'is-active': activeMode === item.value }"
                @click="switchMode(item.value)"
              >
                <span class="ai-material-symbols">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </button>
            </div>

            <div class="workbench-canvas-card">
              <div class="workbench-canvas-card__badge">
                <span class="workbench-canvas-card__badge-dot"></span>
                <span>{{ currentStageBadgeText }}</span>
              </div>

              <div v-if="activeMode === 'draw'" class="workbench-canvas-stage">
                <canvas
                  ref="drawCanvasRef"
                  class="workbench-canvas"
                  @pointerdown="startDraw"
                  @pointermove="drawMove"
                  @pointerup="endDraw"
                  @pointerleave="endDraw"
                ></canvas>
              </div>

              <div v-else-if="activeMode === 'upload'" class="workbench-preview-stage">
                <input
                  ref="uploadInputRef"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  class="workbench-hidden-input"
                  @change="handleUploadChange"
                />
                <button
                  v-if="!uploadedPreview"
                  type="button"
                  class="workbench-upload-dropzone"
                  @click="triggerUpload"
                >
                  <span class="ai-material-symbols">cloud_upload</span>
                  <strong>{{ t("ai.handwrittenWorkbench.uploadButton") }}</strong>
                  <small>{{ t("ai.handwrittenWorkbench.uploadHint") }}</small>
                </button>
                <img
                  v-else
                  class="workbench-preview-image"
                  :src="uploadedPreview"
                  :alt="t('ai.handwrittenWorkbench.uploadPreviewAlt')"
                />
                <p class="workbench-preview-note">
                  {{ t("ai.handwrittenWorkbench.uploadGuide") }}
                </p>
              </div>

              <div v-else class="workbench-preview-stage">
                <div class="workbench-camera-placeholder">
                  <span class="ai-material-symbols">photo_camera</span>
                  <strong>{{ t("ai.handwrittenWorkbench.cameraTitle") }}</strong>
                  <small>{{ t("ai.handwrittenWorkbench.cameraHint") }}</small>
                </div>
              </div>

              <div class="workbench-toolbar">
                <div class="workbench-toolbar__left">
                  <button
                    type="button"
                    class="workbench-secondary-btn"
                    @click="resetCanvas"
                  >
                    <span class="ai-material-symbols">refresh</span>
                    <span>{{ secondaryActionLabel }}</span>
                  </button>
                  <div v-if="showBrushControl" class="workbench-brush">
                    <span>{{ t("ai.handwrittenWorkbench.brushSize") }}</span>
                    <input
                      v-model="brushSize"
                      type="range"
                      min="8"
                      max="30"
                      step="1"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  class="workbench-primary-btn"
                  :disabled="isPrimaryActionDisabled"
                  @click="runRecognition"
                >
                  <span class="ai-material-symbols">bolt</span>
                  <span>
                    {{
                      recognitionLoading
                        ? t("ai.handwrittenWorkbench.recognizing")
                        : t("ai.handwrittenWorkbench.startRecognition")
                    }}
                  </span>
                </button>
              </div>
            </div>
          </section>

          <aside class="workbench-side">
            <section class="workbench-result-card">
              <span class="workbench-result-card__eyebrow">
                {{ t("ai.handwrittenWorkbench.resultTitle") }}
              </span>
              <div class="workbench-result-card__digit">{{ prediction }}</div>
              <div class="workbench-result-card__confidence-row">
                <span>{{ t("ai.handwrittenWorkbench.confidence") }}</span>
                <strong>{{ confidenceText }}</strong>
              </div>
              <div class="workbench-result-card__confidence-track">
                <div
                  class="workbench-result-card__confidence-fill"
                  :style="{ width: `${confidencePercent}%` }"
                ></div>
              </div>
            </section>

            <section class="workbench-probability-card">
              <h2 class="workbench-probability-card__title">
                <span class="ai-material-symbols">analytics</span>
                <span>{{ t("ai.handwrittenWorkbench.allProbabilities") }}</span>
              </h2>

              <div class="workbench-probability-list">
                <div
                  v-for="item in probabilityList"
                  :key="item.digit"
                  class="workbench-probability-item"
                >
                  <span class="workbench-probability-item__digit">{{ item.digit }}</span>
                  <div class="workbench-probability-item__track">
                    <div
                      class="workbench-probability-item__fill"
                      :class="{ 'is-primary': item.digit === prediction }"
                      :style="{ width: `${item.value}%` }"
                    ></div>
                  </div>
                  <span class="workbench-probability-item__value">{{ item.value.toFixed(1) }}%</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { useMnistRecognizer } from "~/composables/handwritten/useMnistRecognizer";

definePageMeta({
  layout: "sidebar",
});

type WorkbenchMode = "draw" | "upload" | "camera";

const router = useRouter();
const { t } = useI18n();
const workbenchPageRef = ref<HTMLElement | null>(null);
const drawCanvasRef = ref<HTMLCanvasElement | null>(null);
const uploadInputRef = ref<HTMLInputElement | null>(null);
const uploadedPreview = ref("");
const uploadedFile = ref<File | null>(null);
const prediction = ref("5");
const confidencePercent = ref(99.8);
const probabilityListState = ref<number[]>([0, 0, 0, 0, 0, 99.8, 0, 0, 0, 0]);
const brushSize = ref(16);
const activeMode = ref<WorkbenchMode>("draw");
const recognitionLoading = ref(false);
const workbenchLayoutWidth = ref(1360);
const workbenchVisibleWidth = ref(1360);
let workbenchResizeObserver: ResizeObserver | null = null;
let isDrawing = false;
let lastPoint: { x: number; y: number } | null = null;
const { modelPath, predictFromCanvas, predictFromFile } = useMnistRecognizer();

const modeOptions = computed(() => [
  {
    value: "draw" as WorkbenchMode,
    icon: "edit_note",
    label: t("ai.handwrittenWorkbench.modes.draw"),
  },
  {
    value: "upload" as WorkbenchMode,
    icon: "cloud_upload",
    label: t("ai.handwrittenWorkbench.modes.upload"),
  },
  {
    value: "camera" as WorkbenchMode,
    icon: "photo_camera",
    label: t("ai.handwrittenWorkbench.modes.camera"),
  },
]);

const probabilityList = computed(() => {
  return Array.from({ length: 10 }, (_, digit) => ({
    digit,
    value: probabilityListState.value[digit] ?? 0,
  }));
});

const confidenceText = computed(() => `${confidencePercent.value.toFixed(1)}%`);
const isPrimaryActionDisabled = computed(
  () => recognitionLoading.value || (activeMode.value === "upload" && !uploadedFile.value)
);
const showBrushControl = computed(() => activeMode.value === "draw");
const currentStageBadgeText = computed(() => {
  if (activeMode.value === "upload") {
    return t("ai.handwrittenWorkbench.uploadBadge");
  }
  if (activeMode.value === "camera") {
    return t("ai.handwrittenWorkbench.cameraBadge");
  }
  return t("ai.handwrittenWorkbench.canvasBadge");
});
const secondaryActionLabel = computed(() =>
  activeMode.value === "upload"
    ? t("ai.handwrittenWorkbench.clearUpload")
    : t("ai.handwrittenWorkbench.resetCanvas")
);

const getWorkbenchLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = workbenchPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter((width) => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const getWorkbenchVisibleWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const pageClientWidth = workbenchPageRef.value?.clientWidth || 0;
  const contentWidth = pageClientWidth || document.documentElement?.clientWidth || 1360;
  return Math.max(0, Math.round(contentWidth));
};

const syncWorkbenchLayoutWidth = () => {
  workbenchLayoutWidth.value = getWorkbenchLayoutWidth();
  workbenchVisibleWidth.value = getWorkbenchVisibleWidth();
};

const workbenchShellWidth = computed(() => {
  if (workbenchLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(workbenchLayoutWidth.value))}px`;
  }
  return `${Math.min(1920, Math.max(1280, Math.round(workbenchLayoutWidth.value * 0.9)))}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--handwritten-workbench-shell-width": workbenchShellWidth.value,
}));

const isCompactWorkbenchLayout = computed(() => workbenchVisibleWidth.value <= 1120);

const setupCanvas = () => {
  const canvas = drawCanvasRef.value;
  if (!canvas) return;
  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(canvas.clientWidth);
  const height = Math.round(canvas.clientHeight);
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.scale(ratio, ratio);
  context.fillStyle = "#0f172a";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "#ffffff";
  context.lineCap = "round";
  context.lineJoin = "round";
};

const getCanvasPoint = (event: PointerEvent) => {
  const canvas = drawCanvasRef.value;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const startDraw = (event: PointerEvent) => {
  if (activeMode.value !== "draw") return;
  const context = drawCanvasRef.value?.getContext("2d");
  const point = getCanvasPoint(event);
  if (!context || !point) return;
  isDrawing = true;
  lastPoint = point;
  context.lineWidth = brushSize.value;
  context.beginPath();
  context.moveTo(point.x, point.y);
};

const drawMove = (event: PointerEvent) => {
  if (!isDrawing || activeMode.value !== "draw") return;
  const context = drawCanvasRef.value?.getContext("2d");
  const point = getCanvasPoint(event);
  if (!context || !point || !lastPoint) return;
  context.lineWidth = brushSize.value;
  context.beginPath();
  context.moveTo(lastPoint.x, lastPoint.y);
  context.lineTo(point.x, point.y);
  context.stroke();
  lastPoint = point;
};

const endDraw = () => {
  isDrawing = false;
  lastPoint = null;
};

const resetCanvas = () => {
  uploadedPreview.value = "";
  uploadedFile.value = null;
  nextTick(() => {
    setupCanvas();
  });
};

const triggerUpload = () => {
  uploadInputRef.value?.click();
};

const handleUploadChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;
  uploadedFile.value = file;
  uploadedPreview.value = URL.createObjectURL(file);
};

const switchMode = (mode: WorkbenchMode) => {
  activeMode.value = mode;
  if (mode === "draw") {
    nextTick(() => {
      setupCanvas();
    });
  }
};

const runRecognition = async () => {
  if (recognitionLoading.value) return;
  recognitionLoading.value = true;

  try {
    let result;
    if (activeMode.value === "draw") {
      const canvas = drawCanvasRef.value;
      if (!canvas) {
        throw new Error(t("ai.handwrittenWorkbench.errors.canvasMissing"));
      }
      result = await predictFromCanvas(canvas);
    } else if (activeMode.value === "upload") {
      if (!uploadedFile.value) {
        ElMessage.warning(t("ai.handwrittenWorkbench.errors.uploadMissing"));
        return;
      }
      result = await predictFromFile(uploadedFile.value);
    } else {
      ElMessage.info(t("ai.handwrittenWorkbench.errors.cameraUnavailable"));
      return;
    }

    prediction.value = String(result.digit);
    confidencePercent.value = Number((result.confidence * 100).toFixed(1));
    probabilityListState.value = result.probabilities.map((item) =>
      Number((item * 100).toFixed(1))
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : t("ai.handwrittenWorkbench.errors.recognitionFailed");
    if (message.includes(modelPath)) {
      ElMessage.error(t("ai.handwrittenWorkbench.errors.modelMissing"));
      return;
    }
    ElMessage.error(message);
  } finally {
    recognitionLoading.value = false;
  }
};

const handleBack = async () => {
  await router.push("/system/opt/handwritten");
};

onMounted(() => {
  syncWorkbenchLayoutWidth();
  nextTick(() => {
    setupCanvas();
  });
  window.addEventListener("resize", syncWorkbenchLayoutWidth, { passive: true });
  window.addEventListener("resize", setupCanvas, { passive: true });

  if (typeof ResizeObserver !== "undefined" && workbenchPageRef.value) {
    workbenchResizeObserver = new ResizeObserver(() => {
      syncWorkbenchLayoutWidth();
      setupCanvas();
    });
    workbenchResizeObserver.observe(workbenchPageRef.value);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", syncWorkbenchLayoutWidth);
  window.removeEventListener("resize", setupCanvas);
  workbenchResizeObserver?.disconnect();
  workbenchResizeObserver = null;
  if (uploadedPreview.value) {
    URL.revokeObjectURL(uploadedPreview.value);
  }
});
</script>

<style scoped>
.handwritten-workbench-page,
.handwritten-workbench-page * {
  box-sizing: border-box;
}

@font-face {
  font-family: "Material Symbols Outlined Full";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("/fonts/material-symbols-outlined-full.ttf") format("truetype");
}

.ai-material-symbols {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  overflow: hidden;
  font-family: "Material Symbols Outlined Full";
  font-style: normal;
  font-weight: 400;
  font-size: 22px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.handwritten-workbench-page {
  height: calc(100vh - 70px);
  min-height: calc(100vh - 70px);
  padding: clamp(16px, 1.6vw, 24px) 0 clamp(16px, 2vw, 28px);
  background: #f8f9fa;
  color: #2d3337;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--handwritten-workbench-shell-width));
  margin: 0 auto;
  box-sizing: border-box;
}

.page-header {
  padding: 0 clamp(20px, 1.8vw, 32px) clamp(10px, 1.2vw, 22px);
  flex-shrink: 0;
}

.content-area {
  padding: 0 clamp(20px, 1.8vw, 32px);
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.workbench-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.workbench-breadcrumb__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: #66717b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.workbench-breadcrumb__back-icon {
  width: 16px;
  height: 16px;
}

.workbench-header-copy {
  margin-top: clamp(6px, 0.8vw, 14px);
}

.workbench-title {
  margin: 0;
  font-size: clamp(24px, 2.1vw, 36px);
  font-weight: 800;
  line-height: 1.15;
  color: #2e3335;
}

.workbench-desc {
  margin: clamp(4px, 0.7vw, 10px) 0 0;
  max-width: 960px;
  color: #5a6062;
  font-size: clamp(14px, 1vw, 18px);
  line-height: 1.55;
}

.workbench-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
}

.workbench-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(280px, 22vw, 380px);
  gap: clamp(14px, 1.4vw, 24px);
  align-items: start;
  height: 100%;
  min-height: 0;
}

.workbench-main,
.workbench-side {
  min-width: 0;
  min-height: 0;
}

.workbench-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.workbench-side {
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 1vw, 16px);
  height: 100%;
}

.workbench-mode-switch {
  display: flex;
  gap: 8px;
  padding: clamp(5px, 0.5vw, 8px);
  border-radius: clamp(16px, 1.2vw, 20px);
  background: #fff;
  border: 1px solid rgba(172, 179, 183, 0.16);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
}

.workbench-mode-switch__item {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: clamp(38px, 3vw, 48px);
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #596063;
  font-size: clamp(12px, 0.9vw, 14px);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.workbench-mode-switch__item.is-active {
  background: #005bc4;
  color: #fff;
  box-shadow: 0 10px 22px rgba(0, 91, 196, 0.24);
}

.workbench-canvas-card,
.workbench-result-card,
.workbench-probability-card {
  border-radius: 24px;
  background: #fff;
  border: 1px solid rgba(172, 179, 183, 0.16);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.04);
}

.workbench-canvas-card {
  margin-top: clamp(10px, 1vw, 16px);
  overflow: hidden;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
}

.workbench-canvas-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #5a6062;
  font-size: 11px;
  font-weight: 700;
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
}

.workbench-canvas-card__badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
}

.workbench-canvas-stage,
.workbench-preview-stage {
  padding: clamp(12px, 1vw, 20px) clamp(12px, 1.2vw, 24px) 0;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.workbench-canvas {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 24px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  cursor: crosshair;
}

.workbench-upload-dropzone,
.workbench-camera-placeholder {
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 24px;
  border: 1px dashed rgba(117, 124, 127, 0.35);
  background: #f1f4f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #596063;
  text-align: center;
}

.workbench-upload-dropzone {
  cursor: pointer;
}

.workbench-upload-dropzone .material-symbols-outlined,
.workbench-camera-placeholder .material-symbols-outlined {
  font-size: 42px;
  color: #005bc4;
}

.workbench-preview-image {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: contain;
  border-radius: 24px;
  background: #f1f4f6;
}

.workbench-preview-note {
  margin: 10px 4px 0;
  color: #66717b;
  font-size: 12px;
  line-height: 1.6;
}

.workbench-hidden-input {
  display: none;
}

.workbench-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(10px, 1vw, 16px);
  padding: clamp(10px, 1vw, 22px) clamp(12px, 1.2vw, 24px) clamp(12px, 1.2vw, 24px);
  border-top: 1px solid rgba(172, 179, 183, 0.12);
  flex-shrink: 0;
}

.workbench-toolbar__left {
  display: flex;
  align-items: center;
  gap: clamp(8px, 0.8vw, 14px);
}

.workbench-secondary-btn,
.workbench-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: clamp(36px, 2.8vw, 46px);
  border-radius: 999px;
  border: none;
  padding: 0 clamp(14px, 1.2vw, 22px);
  font-size: clamp(12px, 0.9vw, 14px);
  font-weight: 700;
  cursor: pointer;
}

.workbench-secondary-btn {
  background: #fff;
  color: #2d3337;
  border: 1px solid rgba(117, 124, 127, 0.28);
}

.workbench-primary-btn {
  background: #005bc4;
  color: #fff;
  box-shadow: 0 12px 24px rgba(0, 91, 196, 0.24);
}

.workbench-primary-btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
  box-shadow: none;
}

.workbench-brush {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  height: clamp(36px, 2.8vw, 46px);
  padding: 0 clamp(10px, 1vw, 18px);
  border-radius: 999px;
  background: #f1f4f6;
  color: #596063;
  font-size: 11px;
  font-weight: 700;
}

.workbench-brush input {
  width: clamp(84px, 8vw, 120px);
  accent-color: #005bc4;
}

.workbench-result-card {
  min-height: 0;
  padding: clamp(16px, 1.6vw, 32px) clamp(16px, 1.4vw, 28px);
  position: relative;
  overflow: hidden;
  text-align: center;
  flex-shrink: 0;
}

.workbench-result-card::before {
  content: "";
  position: absolute;
  top: -70px;
  right: -70px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: rgba(0, 91, 196, 0.05);
}

.workbench-result-card__eyebrow {
  position: relative;
  z-index: 1;
  display: inline-block;
  color: #a53173;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.workbench-result-card__digit {
  position: relative;
  z-index: 1;
  margin-top: 8px;
  font-size: clamp(72px, 7vw, 130px);
  line-height: 1;
  font-weight: 900;
  color: #005bc4;
}

.workbench-result-card__confidence-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: clamp(10px, 1vw, 18px);
  color: #596063;
  font-size: 13px;
}

.workbench-result-card__confidence-row strong {
  color: #005bc4;
  font-size: 14px;
}

.workbench-result-card__confidence-track {
  position: relative;
  z-index: 1;
  margin-top: 8px;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: #edf1f4;
}

.workbench-result-card__confidence-fill {
  height: 100%;
  border-radius: inherit;
  background: #005bc4;
  box-shadow: 0 0 12px rgba(0, 91, 196, 0.3);
}

.workbench-probability-card {
  padding: clamp(14px, 1.2vw, 26px) clamp(14px, 1.2vw, 24px);
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.workbench-probability-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 clamp(10px, 1vw, 22px);
  color: #2d3337;
  font-size: clamp(13px, 1vw, 16px);
  font-weight: 800;
}

.workbench-probability-card__title .material-symbols-outlined {
  color: #a53173;
}

.workbench-probability-list {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 0.8vw, 14px);
}

.workbench-probability-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 48px;
  align-items: center;
  gap: 8px;
}

.workbench-probability-item__digit {
  color: #596063;
  font-size: 12px;
  font-weight: 700;
}

.workbench-probability-item__track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #edf1f4;
}

.workbench-probability-item__fill {
  height: 100%;
  border-radius: inherit;
  background: #c8d6e4;
}

.workbench-probability-item__fill.is-primary {
  background: #005bc4;
}

.workbench-probability-item__value {
  color: #596063;
  font-size: 11px;
  font-weight: 700;
  text-align: right;
}

.handwritten-workbench-page--compact {
  height: auto;
  min-height: calc(100vh - 70px);
  overflow: visible;
}

.handwritten-workbench-page--compact .content-area,
.handwritten-workbench-page--compact .workbench-shell,
.handwritten-workbench-page--compact .workbench-main,
.handwritten-workbench-page--compact .workbench-grid {
  min-height: auto;
  height: auto;
}

.handwritten-workbench-page--compact .workbench-grid {
  grid-template-columns: 1fr;
}

.handwritten-workbench-page--compact .workbench-side {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
}

.handwritten-workbench-page--compact .workbench-canvas {
  min-height: 360px;
}

.handwritten-workbench-page--compact .workbench-upload-dropzone,
.handwritten-workbench-page--compact .workbench-camera-placeholder,
.handwritten-workbench-page--compact .workbench-preview-image {
  min-height: 360px;
}

.handwritten-workbench-page--compact .workbench-probability-card {
  overflow: visible;
}

@media (max-width: 1440px) {
  .page-header,
  .content-area {
    width: min(100%, 1600px, var(--handwritten-workbench-shell-width));
  }
}

@media (max-width: 1280px) {
  .page-header,
  .content-area {
    padding-left: 24px;
    padding-right: 24px;
  }

  .handwritten-workbench-page {
    height: auto;
    min-height: calc(100vh - 70px);
    overflow: visible;
  }

  .content-area,
  .workbench-shell,
  .workbench-grid,
  .workbench-main {
    min-height: auto;
    height: auto;
  }

  .workbench-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .workbench-toolbar__left {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 960px) {
  .handwritten-workbench-page--compact .workbench-side {
    grid-template-columns: 1fr;
  }
}
</style>
