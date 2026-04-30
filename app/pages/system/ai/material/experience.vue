<template>
  <div class="object-workbench-page">
    <main class="object-workbench-shell">
      <nav class="object-workbench-breadcrumb" aria-label="面包屑">
        <button type="button" @click="handleBackToIntro">物品识别</button>
        <span>/</span>
        <button type="button" @click="handleBackToAiPractice">AI 实践中心</button>
      </nav>

      <section class="object-workbench-upload" aria-label="上传方式">
        <label class="object-workbench-upload__button">
          <input type="file" accept="image/*" @change="handleLocalUpload" />
          <span>本地上传</span>
        </label>
        <button type="button" class="object-workbench-upload__button" @click="openCameraModal">
          <span>拍摄上传</span>
        </button>
      </section>

      <section class="object-workbench-content">
        <aside class="object-workbench-materials" aria-label="素材列表">
          <div class="object-workbench-thumb-grid">
            <button
              v-for="(item, index) in materialItems"
              :key="item.id"
              type="button"
              class="object-workbench-thumb"
              :class="{ 'is-active': index === selectedIndex }"
              @click="selectImage(index)"
            >
              <img :src="item.url" :alt="item.name" />
              <span v-if="index === selectedIndex">当前选择</span>
            </button>
          </div>
        </aside>

        <section class="object-workbench-preview" aria-label="识别预览">
          <div class="object-workbench-preview__image">
            <img ref="previewImageRef" :src="currentImage.url" :alt="currentImage.name" />
          </div>
          <button type="button" class="object-workbench-recognize" :disabled="isDetecting" @click="handleDetect">
            <span>{{ detectButtonText }}</span>
          </button>
        </section>

        <aside class="object-workbench-result" aria-label="识别结果">
          <div class="object-workbench-result__head">
            <div>
              <span>RESULT</span>
              <h1>识别结果窗口</h1>
            </div>
            <span v-if="hasDetected" class="object-workbench-result__count">
              检测到 {{ detectedObjects.length }} 个物体
            </span>
          </div>

          <div v-if="!hasDetected" class="object-workbench-empty">
            <div class="object-workbench-empty__image" aria-hidden="true"></div>
            <p>快快开始检测体验模型吧</p>
          </div>

          <template v-else>
            <p v-if="detectionError" class="object-workbench-error">
              {{ detectionError }}
            </p>
            <div v-if="primaryDetection" class="object-workbench-result__block">
              <p>识别结果：</p>
              <strong>{{ primaryDetection.name }}</strong>
              <span>分类：{{ primaryDetection.name }} / {{ primaryDetection.category }}</span>
            </div>

            <div v-if="primaryDetection" class="object-workbench-result__block">
              <p>置信度：</p>
              <strong class="object-workbench-result__score">{{ primaryDetection.confidence }}</strong>
              <div class="object-workbench-progress">
                <i :style="{ width: primaryDetection.confidence }"></i>
              </div>
            </div>

            <div v-if="!primaryDetection" class="object-workbench-empty object-workbench-empty--small">
              <p>暂未识别到物品</p>
            </div>

            <div v-if="secondaryDetections.length" class="object-workbench-matches">
              <h2>其他匹配：</h2>
              <div v-for="item in secondaryDetections" :key="item.name" class="object-workbench-match">
                <span>{{ item.name }}</span>
                <strong>{{ item.confidence }}</strong>
              </div>
            </div>

          </template>
        </aside>
      </section>
    </main>

    <div v-if="cameraVisible" class="object-camera-modal" role="dialog" aria-modal="true">
      <div class="object-camera-panel">
        <header class="object-camera-panel__head">
          <h2>拍摄上传</h2>
          <button type="button" @click="closeCameraModal">关闭</button>
        </header>
        <div class="object-camera-panel__body">
          <video ref="cameraVideoRef" autoplay playsinline muted></video>
          <p v-if="cameraError" class="object-camera-error">{{ cameraError }}</p>
        </div>
        <footer class="object-camera-panel__foot">
          <button type="button" class="object-camera-cancel" @click="closeCameraModal">
            取消
          </button>
          <button type="button" class="object-camera-shot" :disabled="Boolean(cameraError)" @click="capturePhoto">
            拍照使用
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ObjectDetection } from "@tensorflow-models/coco-ssd";
import type { MobileNet } from "@tensorflow-models/mobilenet";
import { ElMessage } from "element-plus";
import {
  IMAGE_CLASSIFICATION_CONFIDENCE_THRESHOLD,
  OBJECT_DETECTION_CONFIDENCE_THRESHOLD,
  cocoSsdClassMap,
  defaultObjectRecognitionMaterials,
  mobileNetClassPatterns,
  type ObjectRecognitionMaterialItem,
} from "~/config/objectRecognition";

type MaterialItem = ObjectRecognitionMaterialItem & {
  file?: File;
};

type DetectionResult = {
  name: string;
  category: string;
  confidence: string;
};

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "物品识别工作台",
  htmlAttrs: {
    lang: "zh-CN",
  },
});

const selectedIndex = ref(0);
const hasDetected = ref(false);
const isDetecting = ref(false);
const detectionError = ref("");
const cameraVisible = ref(false);
const cameraError = ref("");
const cameraVideoRef = ref<HTMLVideoElement | null>(null);
const previewImageRef = ref<HTMLImageElement | null>(null);
const detectedObjects = ref<DetectionResult[]>([]);
let cameraStream: MediaStream | null = null;
let objectDetectionModel: ObjectDetection | null = null;
let imageClassificationModel: MobileNet | null = null;

const handleBackToIntro = async () => {
  await navigateTo("/system/ai/material");
};

const handleBackToAiPractice = async () => {
  await navigateTo("/system/opt");
};

const materialItems = ref<MaterialItem[]>([...defaultObjectRecognitionMaterials]);

const currentImage = computed(() => materialItems.value[selectedIndex.value] || materialItems.value[0]);
const primaryDetection = computed(() => detectedObjects.value[0] || null);
const secondaryDetections = computed(() => detectedObjects.value.slice(1, 4));
const detectButtonText = computed(() => {
  if (isDetecting.value) return "识别中...";
  return hasDetected.value ? "重新检测" : "开始智能识别";
});

const selectImage = (index: number) => {
  selectedIndex.value = index;
  hasDetected.value = false;
  detectedObjects.value = [];
  detectionError.value = "";
};

const addUploadedImage = (file: File, source: "upload" | "camera") => {
  const url = URL.createObjectURL(file);
  materialItems.value.unshift({
    id: `${source}-${Date.now()}`,
    name: file.name || "上传图片",
    url,
    file,
  });
  selectedIndex.value = 0;
  hasDetected.value = false;
  detectedObjects.value = [];
  detectionError.value = "";
};

const handleLocalUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    addUploadedImage(file, "upload");
  }
  input.value = "";
};

const stopCamera = () => {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  if (cameraVideoRef.value) {
    cameraVideoRef.value.srcObject = null;
  }
};

const openCameraModal = async () => {
  cameraVisible.value = true;
  cameraError.value = "";

  await nextTick();

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = "当前浏览器不支持摄像头调用";
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    if (cameraVideoRef.value) {
      cameraVideoRef.value.srcObject = cameraStream;
    }
  } catch (error) {
    console.error("打开摄像头失败:", error);
    cameraError.value = "无法打开摄像头，请检查浏览器权限";
  }
};

const closeCameraModal = () => {
  stopCamera();
  cameraVisible.value = false;
};

const capturePhoto = () => {
  const video = cameraVideoRef.value;
  if (!video || !video.videoWidth || !video.videoHeight) {
    cameraError.value = "摄像头画面未准备好，请稍后再试";
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    cameraError.value = "拍照失败，请重试";
    return;
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob((blob) => {
    if (!blob) {
      cameraError.value = "拍照失败，请重试";
      return;
    }
    const file = new File([blob], `capture-${Date.now()}.png`, { type: "image/png" });
    addUploadedImage(file, "camera");
    closeCameraModal();
  }, "image/png");
};

const loadObjectDetectionModel = async () => {
  if (!import.meta.client) {
    throw new Error("物品识别仅支持在浏览器环境运行");
  }
  if (!objectDetectionModel) {
    await import("@tensorflow/tfjs");
    const cocoSsd = await import("@tensorflow-models/coco-ssd");
    objectDetectionModel = await cocoSsd.load();
  }
  return objectDetectionModel;
};

const loadImageClassificationModel = async () => {
  if (!import.meta.client) {
    throw new Error("物品识别仅支持在浏览器环境运行");
  }
  if (!imageClassificationModel) {
    await import("@tensorflow/tfjs");
    const mobileNet = await import("@tensorflow-models/mobilenet");
    imageClassificationModel = await mobileNet.load();
  }
  return imageClassificationModel;
};

const waitForPreviewImage = async () => {
  await nextTick();
  const imageElement = previewImageRef.value;
  if (!imageElement) {
    throw new Error("识别图片未准备好");
  }
  if (imageElement.complete && imageElement.naturalWidth > 0) {
    return imageElement;
  }

  return await new Promise<HTMLImageElement>((resolve, reject) => {
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = () => reject(new Error("图片加载失败，无法识别"));
  });
};

const convertCocoDetection = (item: { class: string; score: number }): DetectionResult | null => {
  if (item.score < OBJECT_DETECTION_CONFIDENCE_THRESHOLD) {
    return null;
  }
  const classConfig = cocoSsdClassMap[item.class];
  if (!classConfig) {
    return null;
  }
  return {
    name: classConfig.name,
    category: classConfig.category,
    confidence: `${Math.round(item.score * 100)}%`,
  };
};

const convertMobileNetClassification = (item: {
  className: string;
  probability: number;
}): DetectionResult | null => {
  if (item.probability < IMAGE_CLASSIFICATION_CONFIDENCE_THRESHOLD) {
    return null;
  }
  const classConfig = mobileNetClassPatterns.find(({ pattern }) => pattern.test(item.className));
  if (!classConfig) {
    return null;
  }
  return {
    name: classConfig.name,
    category: classConfig.category,
    confidence: `${Math.round(item.probability * 100)}%`,
  };
};

const detectByImageClassification = async (imageElement: HTMLImageElement) => {
  const model = await loadImageClassificationModel();
  const classifications = await model.classify(imageElement, 5);
  return classifications
    .map(convertMobileNetClassification)
    .filter((item): item is DetectionResult => Boolean(item));
};

const handleDetect = async () => {
  isDetecting.value = true;
  detectionError.value = "";

  try {
    const [model, imageElement] = await Promise.all([
      loadObjectDetectionModel(),
      waitForPreviewImage(),
    ]);
    const detections = await model.detect(imageElement);
    const objectDetectionResults = detections
      .map(convertCocoDetection)
      .filter((item): item is DetectionResult => Boolean(item));
    detectedObjects.value = objectDetectionResults.length
      ? objectDetectionResults
      : await detectByImageClassification(imageElement);
    if (!detectedObjects.value.length) {
      ElMessage.warning("无法识别");
    }
    hasDetected.value = true;
  } catch (error) {
    console.error("TFJS 物品识别失败:", error);
    detectionError.value = error instanceof Error ? error.message : "识别失败，请稍后重试";
    detectedObjects.value = [];
    hasDetected.value = true;
  } finally {
    isDetecting.value = false;
  }
};

onBeforeUnmount(() => {
  stopCamera();
});
</script>

<style scoped>
.object-workbench-page {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #ffffff;
  color: #1f2f46;
}

.object-workbench-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 32px;
  box-sizing: border-box;
}

.object-workbench-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  color: #9aa8c0;
  font-size: 13px;
  font-weight: 600;
}

.object-workbench-breadcrumb button {
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.object-workbench-breadcrumb button:hover {
  color: #005bc2;
}

.object-workbench-breadcrumb button:first-child {
  color: #005bc2;
}

.object-workbench-upload {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex: 0 0 auto;
}

.object-workbench-upload__button,
.object-workbench-recognize {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f1f4f6;
  color: #2d3337;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.object-workbench-upload__button {
  height: 48px;
  padding: 0 30px;
}

.object-workbench-upload__button input {
  display: none;
}

.object-workbench-upload__button:hover,
.object-workbench-recognize:hover {
  transform: translateY(-1px);
  background: #e3e9ec;
}

.object-workbench-content {
  display: grid;
  grid-template-columns: 300px minmax(420px, 1fr) 360px;
  gap: 30px;
  align-items: start;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.object-workbench-materials {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.object-workbench-thumb-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2px 8px 2px 2px;
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.45) transparent;
}

.object-workbench-thumb-grid::-webkit-scrollbar {
  width: 6px;
}

.object-workbench-thumb-grid::-webkit-scrollbar-track {
  background: transparent;
}

.object-workbench-thumb-grid::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.35);
}

.object-workbench-thumb-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.58);
}

.object-workbench-thumb {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border: 3px solid transparent;
  border-radius: 18px;
  background: #eef2f7;
  padding: 0;
  cursor: pointer;
}

.object-workbench-thumb.is-active {
  border-color: #3b82f6;
}

.object-workbench-thumb img,
.object-workbench-preview__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.object-workbench-thumb span {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  white-space: nowrap;
  border-radius: 999px;
  background: #ffffff;
  color: #3b82f6;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

.object-workbench-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 22px;
  min-width: 0;
  min-height: 0;
}

.object-workbench-preview__image {
  position: relative;
  width: min(100%, 640px);
  height: min(58vh, 640px);
  min-height: 420px;
  overflow: hidden;
  border-radius: 26px;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.16);
}

.object-workbench-detect-box {
  position: absolute;
  left: 45%;
  top: 10%;
  width: 72px;
  height: 72%;
  border: 3px solid #00e5d8;
  border-radius: 14px;
  box-shadow: 0 0 18px rgba(0, 229, 216, 0.28);
}

.object-workbench-detect-box span {
  position: absolute;
  left: 10px;
  top: 8px;
  color: #00cfc4;
  font-size: 20px;
  font-weight: 900;
}

.object-workbench-recognize {
  flex: 0 0 auto;
  height: 56px;
  min-width: 220px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.24);
}

.object-workbench-recognize:hover {
  background: #2563eb;
}

.object-workbench-recognize:disabled {
  cursor: not-allowed;
  opacity: 0.68;
  transform: none;
}

.object-workbench-result {
  display: flex;
  flex-direction: column;
  gap: 22px;
  height: min(72vh, 776px);
  min-height: 560px;
  overflow: hidden;
  border: 1px solid #eef2f7;
  border-radius: 24px;
  background: #ffffff;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.04);
}

.object-workbench-result__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.object-workbench-result__head span:not(.object-workbench-result__count) {
  display: block;
  margin-bottom: 8px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.object-workbench-result__head h1 {
  margin: 0;
  color: #10233f;
  font-size: 22px;
  font-weight: 900;
}

.object-workbench-result__count {
  color: #1f2f46;
  font-size: 14px;
  white-space: nowrap;
}

.object-workbench-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  color: #1f2f46;
  font-size: 16px;
}

.object-workbench-empty__image {
  width: 138px;
  height: 138px;
  border-radius: 45% 55% 52% 48%;
  background:
    radial-gradient(circle at 74% 20%, #84d2ff 0 4px, transparent 5px),
    radial-gradient(circle at 20% 30%, #84d2ff 0 3px, transparent 4px),
    linear-gradient(180deg, #e6f8ff 0%, #5dbbff 100%);
  box-shadow: inset 0 -20px 24px rgba(12, 99, 202, 0.18);
}

.object-workbench-empty--small {
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0;
  color: #64748b;
}

.object-workbench-error {
  margin: 0;
  border-radius: 14px;
  background: #fff1f2;
  padding: 12px 14px;
  color: #e11d48;
  font-size: 13px;
  font-weight: 700;
}

.object-workbench-result__block p {
  margin: 0 0 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 900;
}

.object-workbench-result__block strong {
  display: block;
  margin-bottom: 8px;
  color: #10233f;
  font-size: 30px;
  font-weight: 900;
}

.object-workbench-result__block span {
  color: #64748b;
  font-size: 14px;
}

.object-workbench-result__score {
  color: #3b82f6 !important;
  font-size: 42px !important;
}

.object-workbench-progress {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.object-workbench-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #3b82f6;
}

.object-workbench-matches h2 {
  margin: 0 0 12px;
  color: #10233f;
  font-size: 15px;
  font-weight: 900;
}

.object-workbench-match {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 42px;
  margin-bottom: 10px;
  border-radius: 14px;
  background: #f8fafc;
  padding: 0 14px;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.object-workbench-match strong {
  color: #3b82f6;
}

.object-camera-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.56);
  backdrop-filter: blur(6px);
}

.object-camera-panel {
  width: min(760px, calc(100vw - 48px));
  overflow: hidden;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
}

.object-camera-panel__head,
.object-camera-panel__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
}

.object-camera-panel__head {
  border-bottom: 1px solid #edf2f7;
}

.object-camera-panel__head h2 {
  margin: 0;
  color: #10233f;
  font-size: 20px;
  font-weight: 900;
}

.object-camera-panel__head button,
.object-camera-cancel,
.object-camera-shot {
  border: none;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
}

.object-camera-panel__head button {
  background: transparent;
  color: #64748b;
  font-size: 14px;
}

.object-camera-panel__body {
  position: relative;
  min-height: 420px;
  background: #0f172a;
}

.object-camera-panel__body video {
  width: 100%;
  height: 420px;
  object-fit: cover;
  display: block;
}

.object-camera-error {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
}

.object-camera-panel__foot {
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #edf2f7;
}

.object-camera-cancel,
.object-camera-shot {
  height: 42px;
  padding: 0 22px;
  font-size: 15px;
}

.object-camera-cancel {
  background: #f1f5f9;
  color: #475569;
}

.object-camera-shot {
  background: #3b82f6;
  color: #ffffff;
}

.object-camera-shot:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 1500px) {
  .object-workbench-shell {
    padding: 24px;
  }

  .object-workbench-content {
    grid-template-columns: 260px minmax(360px, 1fr) 320px;
    gap: 22px;
  }

  .object-workbench-result {
    padding: 24px;
  }
}
</style>
