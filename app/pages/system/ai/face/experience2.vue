<template>
  <div class="stitch-face-page">
    <canvas ref="captureCanvasRef" class="hidden"></canvas>
    <input
      ref="uploadInputRef"
      class="hidden"
      type="file"
      accept="image/png,image/jpeg,image/jpg"
      @change="handleUploadChange"
    />

    <header class="stitch-face-page__header">
      <div class="stitch-face-page__header-top">
        <button
          type="button"
          class="page-back-button"
          aria-label="返回上一页"
          @click="handleGoBack"
        >
          <svg viewBox="0 0 24 24" class="page-back-button__icon" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.9"
            />
          </svg>
        </button>
        <div class="stitch-face-page__header-copy">
          <div class="stitch-face-page__crumbs">
            <span>AI 实践中心</span>
            <span class="stitch-face-page__crumb-sep">/</span>
            <span>人脸识别</span>
          </div>
          <h1 class="stitch-face-page__title">人脸数据采集及录入</h1>
          <p class="stitch-face-page__subtitle">{{ pageSubtitle }}</p>
        </div>
      </div>
    </header>

    <div class="stitch-face-page__grid">
      <section class="workbench-panel">
        <div class="workbench-panel__surface">
          <template v-if="currentStep === 'name'">
            <div class="mode-grid">
              <article
                class="mode-card mode-card--muted mode-card--clickable"
                :class="{ 'mode-card--disabled': !draftName.trim() }"
                @click="handleSelectUpload"
              >
                <div class="mode-card__icon mode-card__icon--upload" aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="stitch-icon">
                    <path
                      d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                    <path
                      d="M14 3v5h5M12 17V10m0 0-3 3m3-3 3 3"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                  </svg>
                </div>
                <h3 class="mode-card__title">上传本地图片</h3>
                <p class="mode-card__desc">支持 JPG, PNG 格式<br />可批量选择多张照片</p>
              </article>

              <article
                class="mode-card mode-card--active mode-card--clickable"
                :class="{ 'mode-card--disabled': !draftName.trim() }"
                @click="handleSelectCamera"
              >
                <div class="mode-card__icon mode-card__icon--camera" aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="stitch-icon">
                    <path
                      d="M4 8.5a2 2 0 0 1 2-2h2.1l1.2-1.8a1.2 1.2 0 0 1 1-.5h3.4a1.2 1.2 0 0 1 1 .5l1.2 1.8H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                    <circle
                      cx="12"
                      cy="13"
                      r="3.5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    />
                  </svg>
                </div>
                <h3 class="mode-card__title">开启摄像头</h3>
                <p class="mode-card__desc">实时视频捕获<br />AI 自动提取面部特征</p>
              </article>
            </div>
          </template>

          <template v-else-if="currentStep === 'capture'">
            <div class="stage-view">
              <div class="stage-view__meta">
                <span class="stage-view__tag">{{
                  captureMode === "upload" ? "图片采集" : "摄像头采集"
                }}</span>
                <p class="stage-view__note">
                  {{
                    captureMode === "upload"
                      ? "请上传一张清晰正脸照片，系统会自动提取面部特征"
                      : "请将面部对准框内，保持光线充足"
                  }}
                </p>
              </div>

              <div class="media-shell">
                <video
                  v-show="
                    captureMode === 'camera' && captureVideoReady && !capturePreview
                  "
                  ref="captureVideoRef"
                  class="media-shell__media media-shell__media--mirrored"
                  autoplay
                  muted
                  playsinline
                ></video>

                <img
                  v-if="capturePreview"
                  class="media-shell__media"
                  :src="capturePreview"
                  alt="人脸采集预览"
                />

                <div
                  v-if="!captureVideoReady && !capturePreview"
                  class="media-shell__placeholder"
                >
                  <strong>{{
                    captureMode === "upload"
                      ? "请先选择图片"
                      : loadingModels
                      ? "模型加载中..."
                      : "正在打开摄像头"
                  }}</strong>
                  <span>{{
                    captureMode === "upload"
                      ? "支持 JPG、PNG 格式，建议上传单人正脸照片"
                      : runtimeNotice
                  }}</span>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="currentStep === 'success'">
            <div class="stage-view stage-view--success">
              <div class="stage-view__meta stage-view__meta--center">
                <span class="stage-view__tag stage-view__tag--success">录入完成</span>
                <p class="stage-view__headline">人脸信息已成功录入</p>
                <p class="stage-view__note">可继续录入更多样本，或直接进入识别阶段</p>
              </div>

              <div class="media-shell media-shell--success">
                <img
                  v-if="lastEnrolledPreview"
                  class="media-shell__media"
                  :src="lastEnrolledPreview"
                  alt="录入成功预览"
                />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="stage-view stage-view--recognize">
              <div class="stage-view__meta">
                <span class="stage-view__tag stage-view__tag--recognize">实时识别</span>
                <p class="stage-view__headline">{{ assistantBubbleTitle }}</p>
                <p class="stage-view__note">
                  {{ assistantBubbleDesc || recognitionNotice }}
                </p>
              </div>

              <div
                class="media-shell media-shell--recognize"
                :style="recognitionVideoShellStyle"
              >
                <video
                  ref="recognitionVideoRef"
                  class="media-shell__media media-shell__media--mirrored"
                  autoplay
                  muted
                  playsinline
                ></video>
                <canvas ref="recognitionCanvasRef" class="media-shell__canvas"></canvas>

                <div v-if="!recognitionVideoReady" class="media-shell__placeholder">
                  <strong>{{
                    loadingModels ? "模型加载中..." : "正在打开识别摄像头"
                  }}</strong>
                  <span>{{ recognitionNotice }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div
          class="workbench-panel__actions"
          :class="{
            'workbench-panel__actions--dual':
              currentStep === 'capture' || currentStep === 'success',
          }"
        >
          <template v-if="currentStep === 'name'">
            <button
              type="button"
              class="primary-button primary-button--wide"
              @click="handleConfirmName"
            >
              录入人脸信息
            </button>
          </template>

          <template v-else-if="currentStep === 'capture'">
            <button
              v-if="captureMode === 'upload' || capturePreview"
              type="button"
              class="secondary-button"
              @click="handleRetryCapture"
            >
              {{
                captureMode === "upload"
                  ? capturePreview
                    ? "重新上传"
                    : "选择图片"
                  : "重新拍摄"
              }}
            </button>
            <button
              type="button"
              class="primary-button"
              :disabled="captureActionDisabled"
              @click="handleEnrollFace"
            >
              {{ savingProfile ? "录入中..." : "开始录入" }}
            </button>
          </template>

          <template v-else-if="currentStep === 'success'">
            <button
              type="button"
              class="secondary-button"
              @click="handleContinueEnrollment"
            >
              继续录入
            </button>
            <button type="button" class="primary-button" @click="handleEnterRecognition">
              去识别
            </button>
          </template>

          <template v-else>
            <button
              type="button"
              class="primary-button primary-button--wide"
              @click="handleStopRecognition"
            >
              结束识别
            </button>
          </template>
        </div>

        <p v-if="captureError" class="workbench-panel__error">{{ captureError }}</p>
      </section>

      <aside class="side-column">
        <section class="side-card">
          <div class="side-card__head">
            <div class="side-card__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="stitch-icon">
                <path
                  d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12Zm-6 7a6 6 0 0 1 12 0"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                />
              </svg>
            </div>
            <div>
              <h3 class="side-card__title">身份标记</h3>
              <p class="side-card__subtitle">{{ identityHint }}</p>
            </div>
          </div>

          <label class="field-label" for="face-name-input">姓名</label>
          <input
            v-if="currentStep === 'name'"
            id="face-name-input"
            v-model.trim="draftName"
            class="field-input"
            type="text"
            maxlength="20"
            placeholder="请输入您的姓名"
            @keydown.enter="handleConfirmName"
          />
          <input
            v-else
            id="face-name-input"
            class="field-input field-input--readonly"
            type="text"
            :value="activeIdentityName"
            readonly
          />
        </section>

        <section class="side-card side-card--list">
          <h4 class="list-card__label">已录入人脸信息</h4>

          <div v-if="hasVisibleProfiles" class="profile-list">
            <article
              v-for="profile in visibleProfiles"
              :key="profile.id"
              class="profile-row"
              :class="{ 'profile-row--active': profile.id === latestProfileId }"
            >
              <div class="profile-row__avatar">
                <img
                  v-if="!isPlaceholderAvatar(profile.avatarDataUrl)"
                  :src="profile.avatarDataUrl"
                  :alt="profile.name"
                />
                <span v-else>{{ getProfileInitial(profile.name) }}</span>
              </div>

              <div class="profile-row__content">
                <p class="profile-row__name">{{ profile.name }}</p>
                <p class="profile-row__desc">
                  {{
                    profile.id === latestProfileId
                      ? "最近录入的人脸样本"
                      : "本地识别特征已就绪"
                  }}
                </p>
                <div class="profile-row__actions">
                  <button
                    type="button"
                    class="profile-row__action"
                    :disabled="savingProfile"
                    @click="handleRenameProfile(profile)"
                  >
                    修改名称
                  </button>
                  <button
                    type="button"
                    class="profile-row__action profile-row__action--primary"
                    :disabled="savingProfile"
                    @click="handleReEnrollProfile(profile)"
                  >
                    重新录入
                  </button>
                </div>
              </div>

              <span class="profile-row__badge">{{
                profile.id === latestProfileId ? "NEW" : "OK"
              }}</span>
            </article>
          </div>

          <div v-else class="profile-empty">
            <div class="profile-empty__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="stitch-icon">
                <path
                  d="M12 5v14M5 12h14"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                />
              </svg>
            </div>
            <strong class="profile-empty__title">{{
              activeIdentityName || "未录入人脸信息"
            }}</strong>
            <span class="profile-empty__desc"
              >完成录入后，这里会显示可用于识别的人脸样本</span
            >
          </div>
        </section>
      </aside>
    </div>

    <section class="tips-card">
      <div class="tips-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="stitch-icon">
          <path
            d="M12 10v6m0-9h.01M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
          />
        </svg>
      </div>
      <div>
        <h4 class="tips-card__title">采集提示</h4>
        <p class="tips-card__desc">
          建议在光线柔和的环境下采集，人脸正对镜头可获得更精准的特征提取。系统将自动过滤模糊影像。
        </p>
      </div>
    </section>

    <div v-if="showRecognitionCompleteDialog" class="completion-dialog">
      <div class="completion-dialog__mask"></div>
      <div class="completion-dialog__card">
        <div class="completion-dialog__art">
          <img
            :src="finishMascotImage"
            alt="体验完成机器人"
            class="completion-dialog__art-image"
          />
        </div>
        <p class="completion-dialog__message">
          恭喜你完成人脸识别机器人体验，快去探索其他内容吧～
        </p>
        <button
          type="button"
          class="completion-dialog__button"
          @click="handleRecognitionCompleteConfirm"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import finishMascotImage from "~/assets/images/shizi.png";
import {
  FACE_DEMO_DESCRIPTOR_VERSION,
  useFaceApiDemo,
} from "~/composables/useFaceApiDemo";
import type {
  FaceDemoDetection,
  FaceDemoMatchResult,
} from "~/composables/useFaceApiDemo";
import type { FaceDemoProfile } from "~/composables/useFaceDemoStorage";
import { useFaceDemoStorage } from "~/composables/useFaceDemoStorage";

definePageMeta({ layout: "sidebar" });

useHead({
  title: "人脸识别机器人",
  htmlAttrs: { lang: "zh-CN" },
});

type FlowStep = "name" | "capture" | "success" | "recognize";
type CaptureMode = "camera" | "upload";
type CameraScene = "capture" | "recognize";
type RecognitionDetectionWithMatch = FaceDemoDetection & {
  match: FaceDemoMatchResult;
};

const { listProfiles, saveProfile, clearProfiles } = useFaceDemoStorage();
const {
  ensureReady,
  detectSingleFace,
  detectSingleFaceFast,
  detectAllFaces,
  matchDescriptor,
} = useFaceApiDemo();

const currentStep = ref<FlowStep>("name");
const captureMode = ref<CaptureMode>("camera");
const draftName = ref("");
const playerName = ref("");
const lastEnrolledPreview = ref("");
const capturePreview = ref("");
const captureError = ref("");
const runtimeNotice = ref("首次使用会加载本地模型，通常需要几秒。");
const recognitionNotice = ref("请把面部放进识别区域，我来帮你识别。");
const loadingModels = ref(false);
const modelsReady = ref(false);
const savingProfile = ref(false);
const profiles = ref<FaceDemoProfile[]>([]);
const selectedDeviceId = ref("");
const captureVideoReady = ref(false);
const recognitionVideoReady = ref(false);
const recognitionRunning = ref(false);
const recognitionDetections = ref<RecognitionDetectionWithMatch[]>([]);
const recognitionVideoAspectRatio = ref("16 / 9");
const showRecognitionCompleteDialog = ref(false);
const reEnrollTargetId = ref("");

const captureVideoRef = ref<HTMLVideoElement | null>(null);
const captureCanvasRef = ref<HTMLCanvasElement | null>(null);
const uploadInputRef = ref<HTMLInputElement | null>(null);
const recognitionVideoRef = ref<HTMLVideoElement | null>(null);
const recognitionCanvasRef = ref<HTMLCanvasElement | null>(null);
const FACE_PROFILE_PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const FACE_FALLBACK_STORAGE_KEY = "mata-face-demo-experience2-profiles";

let activeStream: MediaStream | null = null;
let recognitionTimer: number | null = null;
let recognitionBusy = false;
let legacyProfilesWarned = false;

const pageSubtitle = computed(() => {
  if (currentStep.value === "recognize") {
    return "通过摄像头实时比对当前页面已录入的人脸信息";
  }

  return "通过上传图片或开启摄像头快速完成人脸数据采集";
});

const activeIdentityName = computed(() => {
  return playerName.value || draftName.value || "";
});

const identityHint = computed(() => {
  if (currentStep.value === "name") {
    return "请先完善目标姓名信息";
  }

  if (currentStep.value === "recognize") {
    return "当前正在执行实时识别";
  }

  return "当前采集目标姓名";
});

const visibleProfiles = computed(() => {
  return profiles.value.slice(0, 6);
});

const hasVisibleProfiles = computed(() => {
  return visibleProfiles.value.length > 0;
});

const latestProfileId = computed(() => {
  return visibleProfiles.value[0]?.id || "";
});

const hasCompatibleProfiles = computed(() => {
  return profiles.value.some((profile) => {
    return profile.descriptorVersion === FACE_DEMO_DESCRIPTOR_VERSION;
  });
});

const sortedRecognitions = computed(() => {
  return [...recognitionDetections.value].sort((left, right) => {
    return right.match.confidence - left.match.confidence;
  });
});

const bestDetection = computed(() => {
  return sortedRecognitions.value.find((item) => item.match.profile) || null;
});

const bestMatchedConfidenceText = computed(() => {
  const confidence = bestDetection.value?.match.confidence || 0;
  return confidence ? `${(confidence * 100).toFixed(2)}%` : "--";
});

const assistantBubbleTitle = computed(() => {
  if (bestDetection.value?.match.profile) {
    return `你是 ${bestDetection.value.match.profile.name}!`;
  }

  return "请把脸对准识别框";
});

const assistantBubbleDesc = computed(() => {
  if (bestDetection.value?.match.profile) {
    return `当前识别相似度 ${bestMatchedConfidenceText.value}`;
  }

  return recognitionNotice.value;
});

const recognitionVideoShellStyle = computed(() => {
  return {
    aspectRatio: recognitionVideoAspectRatio.value,
  };
});

const captureActionDisabled = computed(() => {
  return savingProfile.value || (!captureVideoReady.value && !capturePreview.value);
});

const resetRuntimeNotice = () => {
  runtimeNotice.value = modelsReady.value
    ? "模型准备完成，可以开始录入和识别了。"
    : "首次使用会加载本地模型，通常需要几秒。";
};

const readFallbackProfiles = () => {
  if (!import.meta.client) {
    return [] as FaceDemoProfile[];
  }

  try {
    const rawValue = window.localStorage.getItem(FACE_FALLBACK_STORAGE_KEY);
    if (!rawValue) {
      return [] as FaceDemoProfile[];
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as FaceDemoProfile[]) : [];
  } catch (error) {
    console.warn("读取页面兜底人脸库失败:", error);
    return [] as FaceDemoProfile[];
  }
};

const writeFallbackProfiles = (nextProfiles: FaceDemoProfile[]) => {
  if (!import.meta.client) {
    return;
  }

  window.localStorage.setItem(FACE_FALLBACK_STORAGE_KEY, JSON.stringify(nextProfiles));
};

const mergeProfiles = (
  primaryProfiles: FaceDemoProfile[],
  fallbackProfiles: FaceDemoProfile[]
) => {
  const mergedMap = new Map<string, FaceDemoProfile>();

  for (const profile of primaryProfiles) {
    mergedMap.set(profile.id, profile);
  }

  for (const profile of fallbackProfiles) {
    if (!mergedMap.has(profile.id)) {
      mergedMap.set(profile.id, profile);
    }
  }

  return [...mergedMap.values()].sort((left, right) => right.createdAt - left.createdAt);
};

const persistFallbackProfile = (profile: FaceDemoProfile) => {
  const fallbackProfiles = readFallbackProfiles().filter(
    (item) => item.id !== profile.id
  );
  fallbackProfiles.unshift(profile);
  writeFallbackProfiles(fallbackProfiles);
  profiles.value = mergeProfiles(profiles.value, [profile]);
};

const persistProfile = async (profile: FaceDemoProfile) => {
  try {
    await saveProfile(profile);
  } catch (error) {
    console.warn("写入 IndexedDB 人脸库失败，已使用页面兜底存储:", error);
  }

  persistFallbackProfile(profile);
};

const clearExperienceProfiles = async () => {
  try {
    await clearProfiles();
  } catch (error) {
    console.error("清空本地人脸库失败:", error);
  }

  if (import.meta.client) {
    window.localStorage.removeItem(FACE_FALLBACK_STORAGE_KEY);
  }

  profiles.value = [];
};

const loadProfiles = async () => {
  const fallbackProfiles = readFallbackProfiles();

  try {
    const storedProfiles = await listProfiles();
    profiles.value = mergeProfiles(storedProfiles, fallbackProfiles);

    const hasLegacyProfiles = profiles.value.some((profile) => {
      return profile.descriptorVersion !== FACE_DEMO_DESCRIPTOR_VERSION;
    });

    if (hasLegacyProfiles) {
      runtimeNotice.value = "检测到旧版录入数据，建议清空本地库后重新录入。";

      if (!legacyProfilesWarned) {
        legacyProfilesWarned = true;
        ElMessage.warning("检测到旧版人脸数据，请清空本地库后重新录入");
      }
    } else {
      legacyProfilesWarned = false;
      resetRuntimeNotice();
    }
  } catch (error) {
    console.error("读取本地人脸库失败:", error);
    profiles.value = fallbackProfiles;

    if (!fallbackProfiles.length) {
      ElMessage.error("读取本地人脸库失败");
    }
  }
};

const ensureRuntimeReady = async () => {
  if (modelsReady.value) return;

  loadingModels.value = true;
  runtimeNotice.value = "正在加载本地模型，请稍等...";

  try {
    await ensureReady();
    modelsReady.value = true;
    runtimeNotice.value = "模型准备完成，可以开始录入和识别了。";
  } catch (error) {
    console.error("加载本地模型失败:", error);
    runtimeNotice.value = "模型加载失败，请刷新页面后重试。";
    throw error;
  } finally {
    loadingModels.value = false;
  }
};

const createImageElement = (dataUrl: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = dataUrl;
  });
};

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(reader.error || new Error("读取图片失败"));
    };

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("读取图片失败"));
    };

    reader.readAsDataURL(file);
  });
};

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    (error as { message: string }).message.trim()
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
};

const getCanvas2DContext = (canvas: HTMLCanvasElement, willReadFrequently = false) => {
  return (
    canvas.getContext(
      "2d",
      willReadFrequently ? { willReadFrequently: true } : undefined
    ) || canvas.getContext("2d")
  );
};

const createDetectionCanvas = (
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement,
  maxEdge = 320
) => {
  const sourceWidth =
    source instanceof HTMLVideoElement
      ? source.videoWidth
      : source instanceof HTMLImageElement
      ? source.naturalWidth || source.width
      : source.width;
  const sourceHeight =
    source instanceof HTMLVideoElement
      ? source.videoHeight
      : source instanceof HTMLImageElement
      ? source.naturalHeight || source.height
      : source.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("采集画面尚未准备完成");
  }

  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));

  const context = getCanvas2DContext(canvas, true);
  if (!context) {
    throw new Error("识别画布初始化失败");
  }

  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const detectEnrollmentFaceFromSource = async (
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
) => {
  const fastCanvas = createDetectionCanvas(source, 256);
  const fastFace = await detectSingleFaceFast(fastCanvas);

  if (fastFace) {
    return fastFace;
  }

  const preciseCanvas = createDetectionCanvas(source, 320);
  return await detectSingleFace(preciseCanvas, "capture");
};

const resolveEnrollmentFace = async (previewDataUrl: string) => {
  const previewImage = await createImageElement(previewDataUrl);
  const previewFace = await detectEnrollmentFaceFromSource(previewImage);

  if (previewFace) {
    return previewFace;
  }

  if (captureVideoRef.value && captureVideoReady.value) {
    return await detectEnrollmentFaceFromSource(captureVideoRef.value);
  }

  return null;
};

const persistEnrollmentProfile = async (
  profile: Omit<FaceDemoProfile, "avatarDataUrl">,
  _previewDataUrl: string
) => {
  const compactProfile: FaceDemoProfile = {
    ...profile,
    avatarDataUrl: FACE_PROFILE_PLACEHOLDER,
  };

  await persistProfile(compactProfile);
};

const getProfileInitial = (name: string) => {
  const trimmedName = name.trim();
  return trimmedName ? trimmedName.slice(0, 1).toUpperCase() : "未";
};

const isPlaceholderAvatar = (avatarDataUrl: string) => {
  return !avatarDataUrl || avatarDataUrl === FACE_PROFILE_PLACEHOLDER;
};

const waitForVideoReady = (video: HTMLVideoElement) => {
  return new Promise<void>((resolve, reject) => {
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
      reject(new Error("视频流加载失败"));
    };
  });
};

const clearRecognitionCanvas = () => {
  const canvas = recognitionCanvasRef.value;
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  context.clearRect(0, 0, canvas.width, canvas.height);
};

const stopRecognitionLoop = () => {
  recognitionRunning.value = false;
  recognitionBusy = false;

  if (recognitionTimer !== null) {
    window.clearTimeout(recognitionTimer);
    recognitionTimer = null;
  }
};

const updateRecognitionVideoAspectRatio = (video: HTMLVideoElement) => {
  if (!video.videoWidth || !video.videoHeight) return;
  recognitionVideoAspectRatio.value = `${video.videoWidth} / ${video.videoHeight}`;
};

const stopActiveStream = () => {
  stopRecognitionLoop();

  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
  }

  activeStream = null;
  captureVideoReady.value = false;
  recognitionVideoReady.value = false;

  if (captureVideoRef.value) {
    captureVideoRef.value.srcObject = null;
  }

  if (recognitionVideoRef.value) {
    recognitionVideoRef.value.srcObject = null;
  }

  clearRecognitionCanvas();
};

const refreshCameraDevices = async () => {
  if (!import.meta.client || !navigator.mediaDevices?.enumerateDevices) return;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videos = devices.filter((device) => device.kind === "videoinput");

  if (!videos.length) {
    selectedDeviceId.value = "";
    return;
  }

  if (
    !selectedDeviceId.value ||
    !videos.some((device) => device.deviceId === selectedDeviceId.value)
  ) {
    selectedDeviceId.value = videos[0]?.deviceId ?? "";
  }
};

const startCamera = async (scene: CameraScene) => {
  if (!import.meta.client || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("当前浏览器不支持摄像头调用");
  }

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: selectedDeviceId.value
      ? {
          deviceId: { exact: selectedDeviceId.value },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        }
      : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
  };

  stopActiveStream();
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  activeStream = stream;

  await nextTick();
  const video = scene === "capture" ? captureVideoRef.value : recognitionVideoRef.value;

  if (!video) {
    throw new Error("摄像头载体未准备完成");
  }

  video.srcObject = stream;
  await waitForVideoReady(video);

  if (scene === "capture") {
    captureVideoReady.value = true;
  } else {
    updateRecognitionVideoAspectRatio(video);
    recognitionVideoReady.value = true;
  }

  await refreshCameraDevices();
};

const takeSnapshotFromVideo = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("摄像头画面尚未准备完成");
  }

  const maxEdge = 560;
  const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight));
  canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

  const context = getCanvas2DContext(canvas, true);
  if (!context) {
    throw new Error("截图画布初始化失败");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
};

const drawRecognitionOverlay = (detections: RecognitionDetectionWithMatch[]) => {
  const canvas = recognitionCanvasRef.value;
  const video = recognitionVideoRef.value;

  if (!canvas || !video || !video.videoWidth || !video.videoHeight) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 3;
  context.font = "18px sans-serif";
  context.textBaseline = "top";

  for (const item of detections) {
    const isMatched = Boolean(item.match.profile);
    const color = isMatched ? "#ff3b30" : "#7ad9ff";
    const label = isMatched
      ? `${item.match.profile?.name}: ${(item.match.confidence * 100).toFixed(2)}%`
      : "未录入";
    const boxX = canvas.width - item.box.x - item.box.width;

    context.strokeStyle = color;
    context.fillStyle = color;
    context.strokeRect(boxX, item.box.y, item.box.width, item.box.height);
    context.fillText(label, boxX + 8, Math.max(0, item.box.y + 8));
  }
};

const startRecognitionLoop = async () => {
  const video = recognitionVideoRef.value;
  if (!video || !recognitionVideoReady.value) return;

  stopRecognitionLoop();
  recognitionRunning.value = true;
  recognitionNotice.value = "正在持续分析画面中的人脸...";

  const tick = async () => {
    if (!recognitionRunning.value) return;

    if (recognitionBusy || !recognitionVideoReady.value || !recognitionVideoRef.value) {
      recognitionTimer = window.setTimeout(tick, 240);
      return;
    }

    recognitionBusy = true;

    try {
      const detections = await detectAllFaces(recognitionVideoRef.value);
      const matchedDetections = detections.map((item) => ({
        ...item,
        match: matchDescriptor(item.descriptor, profiles.value),
      }));

      recognitionDetections.value = matchedDetections;
      drawRecognitionOverlay(matchedDetections);

      if (!matchedDetections.length) {
        recognitionNotice.value = "暂时没有检测到人脸，请把脸移动到镜头中央。";
      } else if (matchedDetections.some((item) => item.match.profile)) {
        const names = matchedDetections
          .filter((item) => item.match.profile)
          .map((item) => item.match.profile?.name)
          .filter(Boolean)
          .join("、");
        recognitionNotice.value = `已识别到：${names}`;
      } else {
        recognitionNotice.value = "检测到了人脸，但和当前人脸库还没有匹配上。";
      }
    } catch (error) {
      console.error("实时识别失败:", error);
      recognitionNotice.value = "识别过程中出现异常，请重新打开摄像头。";
    } finally {
      recognitionBusy = false;
      if (recognitionRunning.value) {
        recognitionTimer = window.setTimeout(tick, 240);
      }
    }
  };

  recognitionTimer = window.setTimeout(tick, 120);
};

const handleConfirmName = async () => {
  const name = draftName.value.trim();
  if (!name) {
    ElMessage.warning("请先输入名字");
    return;
  }

  captureMode.value = "camera";
  reEnrollTargetId.value = "";
  playerName.value = name;
  captureError.value = "";
  capturePreview.value = "";
  currentStep.value = "capture";

  try {
    await ensureRuntimeReady();
    await startCamera("capture");
    runtimeNotice.value = "摄像头已打开，请保持单人正脸后点击开始录入。";
  } catch (error: any) {
    console.error("打开摄像头失败:", error);
    captureError.value = error?.message || "打开摄像头失败";
    ElMessage.error(captureError.value);
  }
};

const triggerUploadPicker = () => {
  uploadInputRef.value?.click();
};

const handleSelectUpload = () => {
  if (!draftName.value.trim()) {
    ElMessage.warning("请先输入名字");
    return;
  }

  captureMode.value = "upload";
  captureError.value = "";
  triggerUploadPicker();
};

const handleSelectCamera = async () => {
  if (!draftName.value.trim()) {
    ElMessage.warning("请先输入名字");
    return;
  }

  await handleConfirmName();
};

const handleUploadChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
    ElMessage.warning("仅支持 png、jpg、jpeg 格式");
    input.value = "";
    return;
  }

  try {
    stopActiveStream();
    await ensureRuntimeReady();
    captureMode.value = "upload";
    playerName.value = draftName.value.trim() || playerName.value;
    capturePreview.value = await readFileAsDataUrl(file);
    captureError.value = "";
    currentStep.value = "capture";
    runtimeNotice.value = "图片已加载，请确认照片清晰后开始录入。";
  } catch (error) {
    console.error("读取上传图片失败:", error);
    captureError.value = "读取上传图片失败";
    ElMessage.error(captureError.value);
  } finally {
    input.value = "";
  }
};

const handleRetryCapture = async () => {
  capturePreview.value = "";
  captureError.value = "";

  if (captureMode.value === "upload") {
    triggerUploadPicker();
    return;
  }

  try {
    await ensureRuntimeReady();
    await startCamera("capture");
    runtimeNotice.value = "摄像头已重新打开，请保持单人正脸后点击开始录入。";
  } catch (error: any) {
    console.error("重新打开摄像头失败:", error);
    captureError.value = error?.message || "重新打开摄像头失败";
    ElMessage.error(captureError.value);
  }
};

const handleEnrollFace = async () => {
  const isReEnroll = Boolean(reEnrollTargetId.value);
  let enrollmentPreview = capturePreview.value;

  if (!enrollmentPreview) {
    if (!captureVideoRef.value || !captureCanvasRef.value || !captureVideoReady.value) {
      ElMessage.warning("请先打开摄像头");
      return;
    }

    try {
      enrollmentPreview = takeSnapshotFromVideo(
        captureVideoRef.value,
        captureCanvasRef.value
      );
      capturePreview.value = enrollmentPreview;
    } catch (error: any) {
      captureError.value = error?.message || "拍照失败";
      ElMessage.error(captureError.value);
      return;
    }
  }

  if (!enrollmentPreview) {
    ElMessage.warning("请先准备一张人脸图片");
    return;
  }

  savingProfile.value = true;
  captureError.value = "";

  try {
    await ensureRuntimeReady();
    const enrolledFace = await resolveEnrollmentFace(enrollmentPreview);
    if (!enrolledFace) {
      throw new Error("没有检测到清晰正脸，请正对镜头并保持单人入镜后重试");
    }

    await persistEnrollmentProfile(
      {
        id: reEnrollTargetId.value || crypto.randomUUID(),
        name: playerName.value,
        descriptor: enrolledFace.descriptor,
        descriptorVersion: FACE_DEMO_DESCRIPTOR_VERSION,
        createdAt: Date.now(),
      },
      enrollmentPreview
    );

    await loadProfiles();
    reEnrollTargetId.value = "";
    stopActiveStream();
    lastEnrolledPreview.value = enrollmentPreview;
    capturePreview.value = enrollmentPreview;
    currentStep.value = "success";
    ElMessage.success(
      isReEnroll
        ? "重新录入成功，已覆盖本地人脸样本"
        : "录入成功，已写入当前浏览器本地人脸库"
    );
  } catch (error: any) {
    console.error("录入人脸失败:", error);
    captureError.value = resolveErrorMessage(error, "录入人脸失败");
    ElMessage.error(captureError.value);
  } finally {
    savingProfile.value = false;
  }
};

const resetToNameStep = (clearName = false) => {
  stopActiveStream();
  showRecognitionCompleteDialog.value = false;
  recognitionDetections.value = [];
  recognitionNotice.value = "请把面部放进识别区域，我来帮你识别。";
  captureMode.value = "camera";
  reEnrollTargetId.value = "";
  capturePreview.value = "";
  captureError.value = "";
  lastEnrolledPreview.value = "";
  currentStep.value = "name";

  if (clearName) {
    draftName.value = "";
    playerName.value = "";
    return;
  }

  if (!draftName.value.trim() && playerName.value.trim()) {
    draftName.value = playerName.value;
  }
};

const handleContinueEnrollment = () => {
  resetToNameStep(true);
};

const handleRenameProfile = async (profile: FaceDemoProfile) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入新的姓名", "修改名称", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputValue: profile.name,
      inputPattern: /\S+/,
      inputErrorMessage: "姓名不能为空",
    });
    const nextName = value.trim();

    if (!nextName || nextName === profile.name) {
      return;
    }

    await persistProfile({
      ...profile,
      name: nextName,
    });

    if (playerName.value === profile.name) {
      playerName.value = nextName;
    }

    if (draftName.value === profile.name) {
      draftName.value = nextName;
    }

    await loadProfiles();
    ElMessage.success("名称已更新");
  } catch (error) {
    if (error === "cancel" || error === "close") {
      return;
    }

    console.error("修改名称失败:", error);
    ElMessage.error(resolveErrorMessage(error, "修改名称失败"));
  }
};

const handleReEnrollProfile = async (profile: FaceDemoProfile) => {
  stopActiveStream();
  recognitionDetections.value = [];
  recognitionNotice.value = "请把面部放进识别区域，我来帮你识别。";
  showRecognitionCompleteDialog.value = false;
  captureMode.value = "camera";
  reEnrollTargetId.value = profile.id;
  draftName.value = profile.name;
  playerName.value = profile.name;
  capturePreview.value = "";
  captureError.value = "";
  currentStep.value = "capture";

  try {
    await ensureRuntimeReady();
    await startCamera("capture");
    runtimeNotice.value = `请重新录入 ${profile.name} 的人脸信息。`;
  } catch (error: any) {
    console.error("重新打开录入摄像头失败:", error);
    captureError.value = error?.message || "重新打开录入摄像头失败";
    ElMessage.error(captureError.value);
  }
};

const handleEnterRecognition = async () => {
  await loadProfiles();

  if (!profiles.value.length) {
    ElMessage.warning("请先录入至少一个人脸");
    return;
  }

  if (!hasCompatibleProfiles.value) {
    ElMessage.warning("检测到旧版人脸数据，请先清空本地库后重新录入");
    return;
  }

  currentStep.value = "recognize";
  recognitionDetections.value = [];
  recognitionNotice.value = "正在准备识别摄像头...";

  try {
    await ensureRuntimeReady();
    await startCamera("recognize");
    await startRecognitionLoop();
  } catch (error: any) {
    console.error("进入识别失败:", error);
    recognitionNotice.value = error?.message || "进入识别失败";
    ElMessage.error(recognitionNotice.value);
  }
};

const handleStopRecognition = () => {
  stopActiveStream();
  recognitionDetections.value = [];
  recognitionNotice.value = "请把面部放进识别区域，我来帮你识别。";
  showRecognitionCompleteDialog.value = true;
};

const handleRecognitionCompleteConfirm = async () => {
  showRecognitionCompleteDialog.value = false;
  await clearExperienceProfiles();
  captureMode.value = "camera";
  reEnrollTargetId.value = "";
  draftName.value = "";
  playerName.value = "";
  lastEnrolledPreview.value = "";
  capturePreview.value = "";
  captureError.value = "";
  currentStep.value = "name";
  await navigateTo("/system/ai/face", { replace: true });
};

const handleGoBack = async () => {
  if (currentStep.value !== "name") {
    resetToNameStep();
    return;
  }

  stopActiveStream();

  if (import.meta.client && window.history.length > 1) {
    window.history.back();
    return;
  }

  await navigateTo("/system/ai/face");
};

onMounted(async () => {
  await loadProfiles();
  await refreshCameraDevices();

  if (import.meta.client && navigator.mediaDevices?.addEventListener) {
    navigator.mediaDevices.addEventListener("devicechange", refreshCameraDevices);
  }
});

onBeforeUnmount(() => {
  stopActiveStream();

  if (import.meta.client && navigator.mediaDevices?.removeEventListener) {
    navigator.mediaDevices.removeEventListener("devicechange", refreshCameraDevices);
  }
});
</script>

<style scoped>
.hidden {
  display: none;
}

.stitch-face-page,
.stitch-face-page * {
  box-sizing: border-box;
}

.stitch-face-page {
  height: calc(100vh - 64px);
  padding: 28px 32px 20px;
  background: #f7f9fc;
  color: #2c3338;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-back-button {
  /* display: inline-flex;
  align-items: center;
  justify-content: center; */
  width: 30px;
  /* height: 30px; */
  padding: 0;
  margin-top: -2px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #5f6b76;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.page-back-button__icon {
  width: 18px;
  height: 18px;
  display: block;
}

.page-back-button:hover {
  color: #2451dc;
  /* background: rgba(36, 81, 220, 0.08); */
}

.stitch-face-page__header {
  width: 100%;
  max-width: 1560px;
  margin: 0 auto 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stitch-face-page__header-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.stitch-face-page__header-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stitch-face-page__crumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: #7d8790;
  font-size: 14px;
  line-height: 1;
}

.stitch-face-page__crumb-sep {
  color: #b3bbc3;
}

.stitch-face-page__title {
  margin: 0;
  color: #20262d;
  font-size: 38px;
  font-weight: 700;
  line-height: 1.15;
}

.stitch-face-page__subtitle {
  margin: 8px 0 0;
  color: #7a838b;
  font-size: 15px;
  line-height: 1.6;
}

.stitch-face-page__grid {
  width: 100%;
  max-width: 1560px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.workbench-panel {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.workbench-panel__surface {
  flex: 1;
  min-height: clamp(360px, 50vh, 520px);
  padding: 32px;
  border-radius: 32px;
  background: #f0f4f8;
  border: 1px solid rgba(171, 179, 185, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.mode-grid {
  width: 100%;
  max-width: 720px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.mode-card {
  min-height: 190px;
  padding: 28px 24px;
  border-radius: 28px;
  border: 2px dashed rgba(171, 179, 185, 0.4);
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.mode-card--active {
  border-color: rgba(0, 107, 96, 0.22);
}

.mode-card--clickable {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.mode-card--clickable:hover {
  transform: translateY(-1px);
  border-color: rgba(36, 81, 220, 0.2);
  box-shadow: 0 14px 28px rgba(36, 81, 220, 0.08);
}

.mode-card--disabled,
.mode-card--disabled:hover {
  opacity: 0.56;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.mode-card__icon {
  width: 68px;
  height: 68px;
  margin-bottom: 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 700;
}

.stitch-icon {
  width: 26px;
  height: 26px;
  display: block;
}

.mode-card__icon--upload {
  background: rgba(36, 81, 220, 0.12);
  color: #2451dc;
}

.mode-card__icon--camera {
  background: rgba(0, 107, 96, 0.12);
  color: #006b60;
}

.mode-card__title {
  margin: 0;
  color: #2c3338;
  font-size: 20px;
  font-weight: 700;
}

.mode-card__desc {
  margin: 10px 0 0;
  color: #7d8790;
  font-size: 13px;
  line-height: 1.7;
}

.stage-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.stage-view--success {
  gap: 24px;
}

.stage-view__meta {
  width: 100%;
  max-width: 860px;
}

.stage-view__meta--center {
  text-align: center;
}

.stage-view__tag {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(36, 81, 220, 0.08);
  color: #2451dc;
  font-size: 13px;
  font-weight: 700;
}

.stage-view__tag--success {
  background: rgba(0, 107, 96, 0.12);
  color: #006b60;
}

.stage-view__tag--recognize {
  background: rgba(36, 81, 220, 0.1);
}

.stage-view__headline {
  margin: 12px 0 0;
  color: #2c3338;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.25;
}

.stage-view__note {
  margin: 10px 0 0;
  color: #7d8790;
  font-size: 14px;
  line-height: 1.7;
}

.media-shell {
  position: relative;
  width: 100%;
  max-width: 860px;
  aspect-ratio: 16 / 10;
  border-radius: 28px;
  overflow: hidden;
  background: #dce3e9;
  border: 1px solid rgba(171, 179, 185, 0.18);
}

.media-shell--success {
  max-width: 760px;
}

.media-shell__media,
.media-shell__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.media-shell__media {
  object-fit: cover;
}

.media-shell__media--mirrored {
  transform: scaleX(-1);
}

.media-shell__canvas {
  pointer-events: none;
}

.media-shell__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(240, 244, 248, 0.95);
  color: #5f6871;
  text-align: center;
  padding: 24px;
}

.media-shell__placeholder strong {
  color: #2c3338;
  font-size: 20px;
}

.media-shell__placeholder span {
  max-width: 360px;
  font-size: 14px;
  line-height: 1.7;
}

.workbench-panel__actions {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.workbench-panel__actions--dual {
  justify-content: center;
}

.workbench-panel__error {
  margin: 14px 0 0;
  color: #d34a5b;
  font-size: 14px;
  text-align: center;
}

.primary-button,
.secondary-button {
  min-width: 180px;
  height: 50px;
  padding: 0 28px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
}

.primary-button {
  color: #ffffff;
  border: none;
  background: linear-gradient(135deg, #2451dc 0%, #4d73fd 100%);
  box-shadow: 0 12px 24px rgba(36, 81, 220, 0.22);
}

.primary-button--wide {
  width: min(100%, 720px);
}

.secondary-button {
  color: #2451dc;
  border: 1px solid rgba(36, 81, 220, 0.18);
  background: #ffffff;
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
}

.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.54;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.side-column {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-card {
  border-radius: 24px;
  background: #ffffff;
  border: 2px solid #4f75ff;
  box-shadow: 0 12px 28px rgba(79, 117, 255, 0.08);
  padding: 24px;
}

.side-card--list {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.side-card__head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.side-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(36, 81, 220, 0.08);
  color: #2451dc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.side-card__title {
  margin: 0;
  color: #2c3338;
  font-size: 20px;
  font-weight: 700;
}

.side-card__subtitle {
  margin: 4px 0 0;
  color: #7d8790;
  font-size: 13px;
}

.field-label {
  display: block;
  margin-bottom: 10px;
  color: #4b545d;
  font-size: 14px;
  font-weight: 700;
}

.field-input {
  width: 100%;
  height: 50px;
  padding: 0 16px;
  border: none;
  border-radius: 14px;
  background: #edf1f5;
  color: #2c3338;
  font-size: 15px;
  outline: none;
}

.field-input:focus {
  box-shadow: inset 0 0 0 2px rgba(36, 81, 220, 0.16);
}

.field-input--readonly {
  color: #64707b;
}

.list-card__label {
  margin: 0 0 16px;
  color: #7d8790;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: none;
}

.profile-list::-webkit-scrollbar {
  display: none;
}

.profile-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  background: #f7f9fc;
  border: 1px solid rgba(171, 179, 185, 0.12);
}

.profile-row--active {
  border-color: rgba(36, 81, 220, 0.2);
  background: rgba(36, 81, 220, 0.05);
}

.profile-row__avatar {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2451dc 0%, #4d73fd 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-row__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-row__content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.profile-row__name {
  margin: 0;
  color: #2c3338;
  font-size: 15px;
  font-weight: 700;
}

.profile-row__desc {
  margin: 4px 0 0;
  color: #7d8790;
  font-size: 12px;
  line-height: 1.5;
}

.profile-row__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.profile-row__action {
  height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(36, 81, 220, 0.12);
  border-radius: 999px;
  background: #ffffff;
  color: #5f6871;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.profile-row__action--primary {
  border-color: rgba(36, 81, 220, 0.18);
  color: #2451dc;
}

.profile-row__action:hover {
  border-color: rgba(36, 81, 220, 0.26);
  color: #2451dc;
}

.profile-row__action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.profile-row__badge {
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(36, 81, 220, 0.1);
  color: #2451dc;
  font-size: 11px;
  font-weight: 700;
  line-height: 24px;
}

.profile-empty {
  min-height: 0;
  flex: 1;
  border-radius: 22px;
  background: #f7f9fc;
  border: 1px dashed rgba(171, 179, 185, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
}

.profile-empty__icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #ffffff;
  color: #7d8790;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.profile-empty__title {
  color: #2c3338;
  font-size: 15px;
}

.profile-empty__desc {
  color: #7d8790;
  font-size: 12px;
  line-height: 1.7;
}

.tips-card {
  width: 100%;
  max-width: 1560px;
  margin: 16px auto 0;
  flex-shrink: 0;
  padding: 18px 22px;
  border-radius: 24px;
  background: rgba(36, 81, 220, 0.05);
  border: 1px solid rgba(36, 81, 220, 0.08);
  display: flex;
  align-items: center;
  gap: 14px;
}

.tips-card__icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(36, 81, 220, 0.12);
  color: #2451dc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.tips-card__title {
  margin: 0 0 4px;
  color: #2451dc;
  font-size: 15px;
  font-weight: 700;
}

.tips-card__desc {
  margin: 0;
  color: #69737c;
  font-size: 13px;
  line-height: 1.7;
}

.completion-dialog {
  position: fixed;
  inset: 0;
  z-index: 2600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.completion-dialog__mask {
  position: absolute;
  inset: 0;
  background: rgba(25, 41, 72, 0.28);
  backdrop-filter: blur(6px);
}

.completion-dialog__card {
  position: relative;
  z-index: 1;
  width: min(100%, 560px);
  min-height: 420px;
  padding: 32px 40px 30px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 28px 70px rgba(24, 39, 75, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.completion-dialog__art {
  width: 168px;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-dialog__art-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.completion-dialog__message {
  margin: 18px 0 34px;
  color: #2f3a4c;
  font-size: 18px;
  line-height: 1.8;
  text-align: center;
}

.completion-dialog__button {
  min-width: 140px;
  height: 44px;
  padding: 0 28px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff7a45 0%, #ff5c36 100%);
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 24px rgba(255, 108, 62, 0.24);
}

.completion-dialog__button:hover {
  transform: translateY(-1px);
}

@media (max-width: 1600px) {
  .stitch-face-page {
    padding: 24px 24px 16px;
  }

  .stitch-face-page__header {
    margin: 0 auto 16px;
  }

  .stitch-face-page__title {
    font-size: 34px;
  }

  .stitch-face-page__subtitle {
    margin-top: 6px;
  }

  .stitch-face-page__grid {
    grid-template-columns: minmax(0, 1fr) 308px;
    gap: 18px;
  }

  .workbench-panel__surface {
    min-height: clamp(300px, 42vh, 420px);
    padding: 24px;
    border-radius: 28px;
  }

  .mode-grid {
    max-width: 640px;
    gap: 18px;
  }

  .mode-card {
    min-height: 160px;
    padding: 20px;
    border-radius: 24px;
  }

  .mode-card__icon {
    width: 56px;
    height: 56px;
    margin-bottom: 12px;
  }

  .mode-card__title {
    font-size: 18px;
  }

  .mode-card__desc {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.6;
  }

  .workbench-panel__actions {
    margin-top: 16px;
    gap: 12px;
    flex-shrink: 0;
  }

  .primary-button,
  .secondary-button {
    min-width: 160px;
    height: 46px;
  }

  .side-column {
    gap: 16px;
  }

  .side-card {
    padding: 20px;
    border-radius: 20px;
  }

  .side-card__head {
    margin-bottom: 16px;
  }

  .side-card__title {
    font-size: 18px;
  }

  .field-label {
    margin-bottom: 8px;
  }

  .field-input {
    height: 46px;
  }

  .profile-empty {
    padding: 16px;
  }

  .tips-card {
    margin-top: 12px;
    padding: 14px 18px;
    border-radius: 20px;
  }
}

@media (max-width: 1500px) {
  .stitch-face-page {
    padding: 24px 24px 18px;
  }

  .stitch-face-page__grid {
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 20px;
  }

  .workbench-panel__surface {
    min-height: clamp(340px, 48vh, 480px);
    padding: 26px;
  }

  .side-card {
    padding: 22px;
    border-radius: 22px;
    border-width: 2px;
  }
}

@media (max-width: 1300px) {
  .stitch-face-page__grid {
    grid-template-columns: minmax(0, 1fr) 280px;
    gap: 16px;
  }

  .side-column {
    gap: 14px;
  }

  .side-card {
    padding: 18px;
    border-radius: 18px;
    border-width: 2px;
  }

  .side-card__icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .side-card__title {
    font-size: 16px;
  }
}

@media (max-width: 1280px) {
  .stitch-face-page {
    height: auto;
    min-height: calc(100vh - 64px);
    padding: 20px;
    overflow: visible;
  }

  .stitch-face-page__grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    order: -1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .side-card--list {
    min-height: 260px;
  }
}

@media (max-width: 860px) {
  .mode-grid,
  .side-column {
    grid-template-columns: 1fr;
  }

  .workbench-panel__surface {
    min-height: 420px;
  }

  .workbench-panel__actions,
  .workbench-panel__actions--dual {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button,
  .primary-button--wide {
    width: 100%;
  }

  .stitch-face-page__title {
    font-size: 30px;
  }

  .tips-card {
    align-items: flex-start;
  }

  .completion-dialog__card {
    min-height: 380px;
    padding: 28px 24px 26px;
  }

  .completion-dialog__message {
    font-size: 16px;
  }
}
</style>
