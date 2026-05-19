<template>
  <div ref="workbenchPageRef" class="graffiti-workbench-page" :style="pageAdaptiveStyle">
    <main class="graffiti-workbench-shell">
      <nav
        class="graffiti-workbench-breadcrumb"
        :aria-label="t('graffitiWorkbench.breadcrumbAria')"
      >
        <button type="button" @click="handleBackToSpot">
          <span class="material-symbols-outlined">chevron_left</span>
          {{ t("graffitiWorkbench.back") }}
        </button>
      </nav>

      <div class="graffiti-workbench-head">
        <h1>{{ t("graffitiWorkbench.title") }}</h1>
        <p>{{ t("graffitiWorkbench.desc") }}</p>
      </div>

      <section class="graffiti-workbench-layout">
        <div class="graffiti-workbench-canvas-card">
          <div
            ref="canvasBoardRef"
            class="graffiti-workbench-canvas"
            @pointerdown="handlePointerDown"
            @pointermove="handlePointerMove"
            @pointerup="handlePointerUp"
            @pointerleave="handlePointerUp"
          >
            <svg class="graffiti-workbench-canvas__layer" viewBox="0 0 1000 700" preserveAspectRatio="none">
              <path
                v-for="stroke in strokePaths"
                :key="stroke.id"
                :d="stroke.d"
                class="graffiti-workbench-canvas__stroke"
              />
            </svg>

            <div class="graffiti-workbench-canvas__hint">
              <span class="material-symbols-outlined">info</span>
              <span>{{ t("graffitiWorkbench.canvasHint") }}</span>
            </div>
          </div>

          <div class="graffiti-workbench-toolbar">
            <div class="graffiti-workbench-toolbar__left">
              <label class="graffiti-workbench-slider">
                <span>{{ t("graffitiWorkbench.brushSize") }}</span>
                <input
                  v-model="brushSize"
                  type="range"
                  min="4"
                  max="24"
                  step="1"
                />
              </label>

              <button type="button" class="graffiti-workbench-reset" @click="resetCanvas">
                <span class="material-symbols-outlined">refresh</span>
                {{ t("graffitiWorkbench.resetCanvas") }}
              </button>
            </div>

            <div class="graffiti-workbench-status">
              <span class="material-symbols-outlined">
                {{ isRecognizing ? "autorenew" : "auto_awesome" }}
              </span>
              <span>
                {{ isRecognizing ? t("graffitiWorkbench.recognizing") : t("graffitiWorkbench.autoRecognize") }}
              </span>
            </div>
          </div>
        </div>

        <aside class="graffiti-workbench-result-column">
          <section class="graffiti-workbench-result-hero">
            <span class="graffiti-workbench-result-hero__eyebrow">
              {{ t("graffitiWorkbench.predictionLabel") }}
            </span>
            <h2>{{ predictionLabel }}</h2>
            <p>
              <strong>{{ predictionResult.confidenceText }}</strong>
              {{ t("graffitiWorkbench.confidenceSuffix") }}
            </p>
          </section>

          <section class="graffiti-workbench-probability-card">
            <h3>{{ t("graffitiWorkbench.probabilitiesTitle") }}</h3>
            <div
              v-if="probabilityItemsDisplay.length"
              class="graffiti-workbench-probability-list"
            >
              <div
                v-for="item in probabilityItemsDisplay"
                :key="item.key"
                class="graffiti-workbench-probability-item"
              >
                <div class="graffiti-workbench-probability-item__head">
                  <span>{{ item.label }}</span>
                  <strong :class="{ 'is-primary': item.primary }">{{ item.confidenceText }}</strong>
                </div>
                <div class="graffiti-workbench-probability-item__bar">
                  <i
                    :class="{ 'is-primary': item.primary }"
                    :style="{ width: `${Math.round(item.confidence * 100)}%` }"
                  ></i>
                </div>
              </div>
            </div>
            <div v-else class="graffiti-workbench-probability-empty">
              {{ t("graffitiWorkbench.probabilityEmpty") }}
            </div>
          </section>

          <section class="graffiti-workbench-tip-card">
            <span class="material-symbols-outlined">info</span>
            <p>{{ t("graffitiWorkbench.tipText") }}</p>
          </section>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getStroke } from "perfect-freehand";
import { useDoodleRecognizer } from "~/composables/graffiti/useDoodleRecognizer";

definePageMeta({
  layout: "sidebar",
});

type ProbabilityItem = {
  key: string;
  label: string;
  confidence: number;
  confidenceText: string;
  primary?: boolean;
};

const router = useRouter();
const { t, locale } = useI18n();
const workbenchPageRef = ref<HTMLElement | null>(null);
const canvasBoardRef = ref<HTMLDivElement | null>(null);
const workbenchLayoutWidth = ref(1360);
const brushSize = ref(12);
const isRecognizing = ref(false);
const isDrawing = ref(false);
const hasDrawing = ref(false);
let workbenchResizeObserver: ResizeObserver | null = null;
let canvasResizeObserver: ResizeObserver | null = null;
let activePointerId: number | null = null;
let recognizeTimer: ReturnType<typeof setTimeout> | null = null;

type DrawPoint = [number, number, number];
type StrokeItem = {
  id: string;
  points: DrawPoint[];
};

const strokes = ref<StrokeItem[]>([]);
const currentStroke = ref<StrokeItem | null>(null);

useHead({
  title: computed(() => t("graffitiWorkbench.pageTitle")),
  htmlAttrs: {},
});

const predictionResult = ref({
  key: "unknown",
  confidence: 0,
  confidenceText: "0.0%",
});

const formatGraffitiLabel = (rawKey: string) => {
  const normalizedKey = rawKey.replace(/-/g, "_");
  const i18nKey = `graffitiLabels.${normalizedKey}`;
  const translated = t(i18nKey);
  if (translated !== i18nKey) {
    return translated;
  }

  const prettyEnglish = rawKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return locale.value.startsWith("zh")
    ? `未翻译(${prettyEnglish})`
    : prettyEnglish;
};

const defaultProbabilityItems = computed<ProbabilityItem[]>(() => []);

const getWorkbenchLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = workbenchPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(width => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);

  return Math.max(1280, Math.round(boundedWidth));
};

const syncWorkbenchLayoutWidth = () => {
  workbenchLayoutWidth.value = getWorkbenchLayoutWidth();
};

const workbenchShellWidth = computed(() => {
  if (workbenchLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(workbenchLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(workbenchLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--graffiti-workbench-shell-width": workbenchShellWidth.value,
}));

const { recognizeCanvas } = useDoodleRecognizer();
const recognitionThreshold = 0.18;

const getRelativePoint = (event: PointerEvent) => {
  const board = canvasBoardRef.value;
  if (!board) return null;

  const rect = board.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * 1000,
    y: ((event.clientY - rect.top) / rect.height) * 700,
  };
};

const getSvgPathFromStroke = (stroke: number[][]) => {
  if (!stroke.length) return "";
  const d = stroke.reduce(
    (acc, [x0, y0], index, array) => {
      const [x1, y1] = array[(index + 1) % array.length];
      acc.push(index === 0 ? `M ${x0} ${y0}` : `L ${x0} ${y0}`);
      acc.push(`Q ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`);
      return acc;
    },
    [] as string[]
  );
  d.push("Z");
  return d.join(" ");
};

const strokePaths = computed(() => {
  const allStrokes = currentStroke.value
    ? [...strokes.value, currentStroke.value]
    : strokes.value;

  return allStrokes
    .map((stroke) => {
      const outline = getStroke(stroke.points, {
        size: brushSize.value * 2.2,
        thinning: 0.58,
        smoothing: 0.72,
        streamline: 0.48,
        simulatePressure: true,
      });

      return {
        id: stroke.id,
        d: getSvgPathFromStroke(outline),
      };
    })
    .filter((item) => item.d);
});

const rasterizeToCanvas = () => {
  const board = canvasBoardRef.value;
  if (!board) return null;

  const canvas = document.createElement("canvas");
  canvas.width = board.clientWidth;
  canvas.height = board.clientHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const allStrokes = currentStroke.value
    ? [...strokes.value, currentStroke.value]
    : strokes.value;
  if (allStrokes.length === 0) return canvas;

  const scaleX = canvas.width / 1000;
  const scaleY = canvas.height / 700;
  const uniformScale = Math.min(scaleX, scaleY);

  // Render thick lines independent of the display so the stroke survives downsampling to 28×28.
  context.strokeStyle = "#000000";
  context.fillStyle = "#000000";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = Math.max(36, brushSize.value * 3) * uniformScale;
  const dotRadius = context.lineWidth / 2;

  allStrokes.forEach((stroke) => {
    if (!stroke.points.length) return;

    if (stroke.points.length === 1) {
      const first = stroke.points[0];
      if (!first) return;
      context.beginPath();
      context.arc(first[0] * scaleX, first[1] * scaleY, dotRadius, 0, Math.PI * 2);
      context.fill();
      return;
    }

    context.beginPath();
    stroke.points.forEach((point, index) => {
      const px = point[0] * scaleX;
      const py = point[1] * scaleY;
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.stroke();
  });

  return canvas;
};

const handlePointerDown = (event: PointerEvent) => {
  if (event.button !== 0) return;
  if (recognizeTimer) {
    clearTimeout(recognizeTimer);
    recognizeTimer = null;
  }
  const point = getRelativePoint(event);
  if (!point) return;

  isDrawing.value = true;
  activePointerId = event.pointerId;
  canvasBoardRef.value?.setPointerCapture(event.pointerId);
  currentStroke.value = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    points: [[point.x, point.y, 0.5]],
  };
};

const handlePointerMove = (event: PointerEvent) => {
  if (!isDrawing.value || activePointerId !== event.pointerId) return;
  const point = getRelativePoint(event);
  if (!point || !currentStroke.value) return;

  currentStroke.value.points.push([point.x, point.y, 0.5]);
  hasDrawing.value = true;
  scheduleRecognize();
};

const handlePointerUp = (event: PointerEvent) => {
  if (activePointerId !== null && event.pointerId !== activePointerId) return;
  isDrawing.value = false;
  activePointerId = null;
  canvasBoardRef.value?.releasePointerCapture?.(event.pointerId);
  if (currentStroke.value?.points.length) {
    strokes.value.push(currentStroke.value);
    currentStroke.value = null;
  }
  if (hasDrawing.value) {
    scheduleRecognize();
  }
};

const resetCanvas = () => {
  strokes.value = [];
  currentStroke.value = null;
  hasDrawing.value = false;
  if (recognizeTimer) {
    clearTimeout(recognizeTimer);
    recognizeTimer = null;
  }
  predictionResult.value = {
    key: "unknown",
    confidence: 0,
    confidenceText: "0.0%",
  };
  probabilityItemsOverride.value = null;
};

const handleRecognize = async () => {
  const canvas = rasterizeToCanvas();
  if (!canvas || !hasDrawing.value) return;

  try {
    isRecognizing.value = true;
    const result = await recognizeCanvas(canvas);
    predictionResult.value = {
      key: result.key,
      confidence: result.confidence,
      confidenceText: result.confidenceText,
    };
    const nextList = result.probabilities.map((item) => ({
      ...item,
      label: formatGraffitiLabel(item.key),
    }));
    probabilityItemsOverride.value = nextList;
  } catch (error) {
    console.error("涂鸦识别失败:", error);
  } finally {
    isRecognizing.value = false;
  }
};

const scheduleRecognize = () => {
  if (!hasDrawing.value) return;
  if (recognizeTimer) {
    clearTimeout(recognizeTimer);
  }
  recognizeTimer = setTimeout(() => {
    void handleRecognize();
  }, 420);
};

const probabilityItemsOverride = ref<ProbabilityItem[] | null>(null);

const probabilityItemsDisplay = computed(
  () => probabilityItemsOverride.value || defaultProbabilityItems.value
);

const predictionLabel = computed(() =>
  predictionResult.value.confidence >= recognitionThreshold
    ? formatGraffitiLabel(predictionResult.value.key)
    : t("graffitiWorkbench.unrecognized")
);

const handleBackToSpot = async () => {
  await router.push("/system/opt/graffiti/spot");
};

onMounted(async () => {
  if (typeof window === "undefined") return;

  syncWorkbenchLayoutWidth();
  window.addEventListener("resize", syncWorkbenchLayoutWidth, { passive: true });

  if (window.ResizeObserver && workbenchPageRef.value) {
    workbenchResizeObserver = new window.ResizeObserver(() => {
      syncWorkbenchLayoutWidth();
    });
    workbenchResizeObserver.observe(workbenchPageRef.value);
  }

  if (window.ResizeObserver && canvasBoardRef.value) {
    canvasResizeObserver = new window.ResizeObserver(() => {
      // perfect-freehand strokes are vector-based; no imperative resize needed here
    });
    canvasResizeObserver.observe(canvasBoardRef.value);
  }

  await nextTick();
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncWorkbenchLayoutWidth);
  workbenchResizeObserver?.disconnect();
  workbenchResizeObserver = null;
  canvasResizeObserver?.disconnect();
  canvasResizeObserver = null;
  if (recognizeTimer) {
    clearTimeout(recognizeTimer);
    recognizeTimer = null;
  }
});
</script>

<style scoped>
.graffiti-workbench-page,
.graffiti-workbench-page * {
  box-sizing: border-box;
}

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
  font-size: 20px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.graffiti-workbench-page {
  height: calc(100vh - 70px);
  padding: 20px 0;
  background: #f8fafc;
  color: #2d3337;
  overflow: hidden;
}

.graffiti-workbench-shell {
  width: min(100%, 1800px, var(--graffiti-workbench-shell-width));
  height: 100%;
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  flex-direction: column;
}

.graffiti-workbench-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7d8790;
  font-size: 13px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.graffiti-workbench-breadcrumb button {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.graffiti-workbench-breadcrumb button:hover {
  color: #005bc4;
}

.graffiti-workbench-head {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.graffiti-workbench-head h1 {
  margin: 0 0 6px;
  color: #10233f;
  font-size: 32px;
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.graffiti-workbench-head p {
  margin: 0;
  color: #5d6670;
  font-size: 13px;
  line-height: 1.7;
  max-width: 760px;
}

.graffiti-workbench-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: start;
  flex: 1;
  min-height: 0;
}

.graffiti-workbench-canvas-card {
  height: 100%;
  overflow: hidden;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.22);
  box-shadow: 0 20px 40px -10px rgba(0, 91, 196, 0.08);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.graffiti-workbench-canvas {
  position: relative;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  border-bottom: 1px solid #e7ecf0;
  background-color: #ffffff;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  cursor: crosshair;
}

.graffiti-workbench-canvas__layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.graffiti-workbench-canvas__stroke {
  fill: #3f464d;
}

.graffiti-workbench-canvas__hint {
  position: absolute;
  right: 24px;
  bottom: 22px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(89, 96, 99, 0.4);
  font-size: 12px;
  font-weight: 500;
  pointer-events: none;
}

.graffiti-workbench-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: #005bc4;
  flex-shrink: 0;
}

.graffiti-workbench-toolbar__left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 26px;
}

.graffiti-workbench-slider {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.graffiti-workbench-slider span {
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.graffiti-workbench-slider input[type="range"] {
  width: 128px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  appearance: none;
  outline: none;
  cursor: pointer;
}

.graffiti-workbench-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background: #2d3337;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.graffiti-workbench-slider input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background: #2d3337;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.graffiti-workbench-reset {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  padding: 0;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.graffiti-workbench-reset:hover {
  opacity: 0.88;
}

.graffiti-workbench-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.graffiti-workbench-status .material-symbols-outlined {
  font-size: 18px;
}

.graffiti-workbench-result-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.graffiti-workbench-result-hero,
.graffiti-workbench-probability-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.graffiti-workbench-result-hero {
  padding: 22px 20px;
}

.graffiti-workbench-result-hero::before {
  content: "";
  position: absolute;
  right: -24px;
  top: -24px;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: rgba(0, 91, 196, 0.05);
  filter: blur(28px);
}

.graffiti-workbench-result-hero__eyebrow {
  position: relative;
  z-index: 1;
  display: block;
  margin-bottom: 14px;
  color: #a53173;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.graffiti-workbench-result-hero h2 {
  position: relative;
  z-index: 1;
  margin: 0 0 6px;
  color: #10233f;
  font-size: 38px;
  line-height: 1;
  font-weight: 900;
}

.graffiti-workbench-result-hero p {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #5d6670;
  font-size: 14px;
  font-weight: 500;
}

.graffiti-workbench-result-hero p strong {
  color: #005bc4;
  font-weight: 800;
}

.graffiti-workbench-probability-card {
  padding: 22px 20px;
}

.graffiti-workbench-probability-card h3 {
  margin: 0 0 18px;
  color: #10233f;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.graffiti-workbench-probability-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.graffiti-workbench-probability-empty {
  color: #7d8790;
  font-size: 13px;
  line-height: 1.8;
}

.graffiti-workbench-probability-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: #2d3337;
  font-size: 14px;
  font-weight: 700;
}

.graffiti-workbench-probability-item__head strong {
  color: #5d6670;
  font-weight: 700;
}

.graffiti-workbench-probability-item__head strong.is-primary {
  color: #005bc4;
}

.graffiti-workbench-probability-item__bar {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eaeef1;
}

.graffiti-workbench-probability-item__bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #dde3e7;
}

.graffiti-workbench-probability-item__bar i.is-primary {
  background: #005bc4;
}

.graffiti-workbench-tip-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border-radius: 16px;
  background: rgba(211, 219, 223, 0.2);
  padding: 16px 16px;
  flex-shrink: 0;
}

.graffiti-workbench-tip-card .material-symbols-outlined {
  color: #005bc4;
  font-size: 18px;
  margin-top: 1px;
}

.graffiti-workbench-tip-card p {
  margin: 0;
  color: #596063;
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 1500px) {
  .graffiti-workbench-page {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .graffiti-workbench-shell {
    padding-left: 24px;
    padding-right: 24px;
  }

  .graffiti-workbench-head {
    margin-bottom: 12px;
  }

  .graffiti-workbench-head h1 {
    font-size: 30px;
  }

  .graffiti-workbench-head p {
    font-size: 12px;
  }

  .graffiti-workbench-layout {
    grid-template-columns: minmax(0, 1fr) 286px;
    gap: 16px;
  }

  .graffiti-workbench-result-hero h2 {
    font-size: 34px;
  }
}

@media (max-width: 1180px) {
  .graffiti-workbench-page {
    height: auto;
    min-height: calc(100vh - 70px);
    overflow: visible;
  }

  .graffiti-workbench-shell {
    height: auto;
  }

  .graffiti-workbench-layout {
    grid-template-columns: 1fr;
  }

  .graffiti-workbench-canvas {
    min-height: 560px;
  }
}
</style>
