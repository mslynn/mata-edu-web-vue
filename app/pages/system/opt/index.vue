<template>
  <div
    ref="aiCenterPageRef"
    class="ai-center-page"
    :class="{ 'ai-center-page--embedded': embedded }"
    :style="pageAdaptiveStyle"
  >
    <!-- 页面标题 -->
    <div v-if="!embedded" class="page-header">
      <div class="page-header__copy">
        <h1 class="page-title">探索人工智能的无限可能</h1>
        <p class="page-header__desc">
          通过沉浸式的 AI 实践项目，从生成式 AI 到机器学习，全方位构建您的数字化创新能力。
        </p>
      </div>
    </div>

    <!-- 内容区 -->
    <div v-if="!embedded" class="content-area">
      <!-- 骨架屏 -->
      <template v-if="pageLoading">
        <div v-for="i in 4" :key="i" class="section">
          <el-skeleton animated :rows="0">
            <template #template>
              <div
                style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px"
              >
                <el-skeleton-item
                  variant="rect"
                  style="width: 22px; height: 22px; border-radius: 4px"
                />
                <el-skeleton-item variant="text" style="width: 80px; height: 20px" />
                <el-skeleton-item variant="text" style="width: 160px; height: 16px" />
              </div>
              <div style="display: flex; gap: 16px">
                <div v-for="j in 5" :key="j" style="flex: 0 0 207px">
                  <el-skeleton-item
                    variant="rect"
                    style="width: 100%; height: 155px; border-radius: 12px 12px 0 0"
                  />
                  <el-skeleton-item
                    variant="text"
                    style="width: 80%; height: 16px; margin: 14px auto; display: block"
                  />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </template>
      <template v-else>
        <!-- AIGC 区块 (已移除内容，暂隐藏) -->
        <div class="section" v-if="aigcItems.length > 0">
          <div class="section-header">
            <div class="section-icon-chip section-icon-chip--aigc">
              <span class="ai-material-symbols section-icon">auto_awesome</span>
            </div>
            <div class="section-copy">
              <span class="section-name">{{ $t("ai.aigc") }}</span>
              <span class="section-desc">{{ $t("ai.aigcDesc") }}</span>
            </div>
          </div>
          <div class="card-slider">
            <button
              v-if="arrowState.aigc.left"
              class="slider-arrow slider-arrow-left"
              @click="scrollLeftFn('aigc')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div class="card-grid-scroll" ref="aigcList" @scroll="handleScroll('aigc')">
              <div
                class="ai-card"
                v-for="item in aigcItems"
                :key="item.key"
                @click="handleCardClick(item)"
              >
                <div class="card-cover-wrapper">
                  <img :src="getAICardCover(item)" class="card-cover" alt="" />
                  <!-- 即将上线 提示 -->
                  <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                    <div class="cs-content">
                      <span class="cs-text">{{ $t("ai.comingSoon") }}</span>
                    </div>
                  </div>
                  <!-- 遮罩层 -->
                  <div v-if="item.desc" class="card-hover-overlay">
                    <p class="hover-desc">{{ $t(item.desc || "") }}</p>
                    <button class="hover-btn" @click.stop="handleCardClick(item)">
                      {{ $t("ai.use") }}
                    </button>
                  </div>
                </div>
                <div class="card-name">{{ $t(item.label) }}</div>
              </div>
            </div>
            <button
              v-if="arrowState.aigc.right"
              class="slider-arrow slider-arrow-right"
              @click="scrollRightFn('aigc')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 视觉智能 区块 -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon-chip section-icon-chip--vision">
              <span class="ai-material-symbols section-icon">visibility</span>
            </div>
            <div class="section-copy">
              <span class="section-name">{{ $t("ai.vision") }}</span>
              <span class="section-desc">{{ $t("ai.visionDesc") }}</span>
            </div>
          </div>
          <div class="card-slider">
            <button
              v-if="arrowState.vision.left"
              class="slider-arrow slider-arrow-left"
              @click="scrollLeftFn('vision')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div
              class="card-grid-scroll"
              ref="visionList"
              @scroll="handleScroll('vision')"
            >
              <div
                class="ai-card"
                v-for="item in visionItems"
                :key="item.key"
                @click="handleCardClick(item)"
              >
                <div class="card-cover-wrapper">
                  <img :src="getAICardCover(item)" class="card-cover" alt="" />
                  <!-- 即将上线 提示 -->
                  <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                    <div class="cs-content">
                      <span class="cs-text">{{ $t("ai.comingSoon") }}</span>
                    </div>
                  </div>
                  <div v-if="item.desc" class="card-hover-overlay">
                    <p class="hover-desc">{{ $t(item.desc || "") }}</p>
                    <button class="hover-btn" @click.stop="handleCardClick(item)">
                      {{ $t("ai.use") }}
                    </button>
                  </div>
                </div>
                <div class="card-name">{{ $t(item.label) }}</div>
              </div>
            </div>
            <button
              v-if="arrowState.vision.right"
              class="slider-arrow slider-arrow-right"
              @click="scrollRightFn('vision')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 语言智能 区块 -->
        <div class="section">
          <div class="section-header">
            <div class="section-icon-chip section-icon-chip--language">
              <span class="ai-material-symbols section-icon">translate</span>
            </div>
            <div class="section-copy">
              <span class="section-name">{{ $t("ai.language") }}</span>
              <span class="section-desc">{{ $t("ai.languageDesc") }}</span>
            </div>
          </div>
          <div class="card-slider">
            <button
              v-if="arrowState.language.left"
              class="slider-arrow slider-arrow-left"
              @click="scrollLeftFn('language')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div
              class="card-grid-scroll"
              ref="languageList"
              @scroll="handleScroll('language')"
            >
              <div
                class="ai-card"
                v-for="item in languageItems"
                :key="item.key"
                @click="handleCardClick(item)"
              >
                <div class="card-cover-wrapper">
                  <img :src="getAICardCover(item)" class="card-cover" alt="" />
                  <!-- 即将上线 提示 -->
                  <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                    <div class="cs-content">
                      <span class="cs-text">{{ $t("ai.comingSoon") }}</span>
                    </div>
                  </div>
                  <div v-if="item.desc" class="card-hover-overlay">
                    <p class="hover-desc">{{ $t(item.desc || "") }}</p>
                    <button class="hover-btn" @click.stop="handleCardClick(item)">
                      {{ $t("ai.use") }}
                    </button>
                  </div>
                </div>
                <div class="card-name">{{ $t(item.label) }}</div>
              </div>
            </div>
            <button
              v-if="arrowState.language.right"
              class="slider-arrow slider-arrow-right"
              @click="scrollRightFn('language')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 行为与动作识别 区块 -->
        <div class="section section-highlight">
          <div class="section-header">
            <div class="section-icon-chip section-icon-chip--behavior">
              <span class="ai-material-symbols section-icon">accessibility_new</span>
            </div>
            <div class="section-copy">
              <span class="section-name">{{ $t("ai.behavior") }}</span>
              <span class="section-desc">{{ $t("ai.behaviorDesc") }}</span>
            </div>
          </div>
          <div class="card-slider">
            <button
              v-if="arrowState.behavior.left"
              class="slider-arrow slider-arrow-left"
              @click="scrollLeftFn('behavior')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div
              class="card-grid-scroll"
              ref="behaviorList"
              @scroll="handleScroll('behavior')"
            >
              <div
                class="ai-card"
                v-for="item in behaviorItems"
                :key="item.key"
                @click="handleCardClick(item)"
              >
                <div class="card-cover-wrapper">
                  <img :src="getAICardCover(item)" class="card-cover" alt="" />
                  <!-- 即将上线 提示 -->
                  <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                    <div class="cs-content">
                      <span class="cs-text">{{ $t("ai.comingSoon") }}</span>
                    </div>
                  </div>
                  <div v-if="item.desc" class="card-hover-overlay">
                    <p class="hover-desc">{{ $t(item.desc || "") }}</p>
                    <button class="hover-btn" @click.stop="handleCardClick(item)">
                      {{ $t("ai.use") }}
                    </button>
                  </div>
                </div>
                <div class="card-name">{{ $t(item.label) }}</div>
              </div>
            </div>
            <button
              v-if="arrowState.behavior.right"
              class="slider-arrow slider-arrow-right"
              @click="scrollRightFn('behavior')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 机器学习 区块 -->
        <div class="section section-highlight">
          <div class="section-header">
            <div class="section-icon-chip section-icon-chip--ml">
              <span class="ai-material-symbols section-icon">model_training</span>
            </div>
            <div class="section-copy">
              <span class="section-name">{{ $t("ai.ml") }}</span>
              <span class="section-desc">{{ $t("ai.mlDesc") }}</span>
            </div>
          </div>
          <div class="card-slider">
            <button
              v-if="arrowState.ml.left"
              class="slider-arrow slider-arrow-left"
              @click="scrollLeftFn('ml')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div class="card-grid-scroll" ref="mlList" @scroll="handleScroll('ml')">
              <div
                class="ai-card"
                v-for="item in mlItems"
                :key="item.key"
                @click="handleCardClick(item)"
              >
                <div class="card-cover-wrapper">
                  <img :src="getAICardCover(item)" class="card-cover" alt="" />
                  <!-- 即将上线 提示 -->
                  <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                    <div class="cs-content">
                      <span class="cs-text">{{ $t("ai.comingSoon") }}</span>
                    </div>
                  </div>
                  <div v-if="item.desc" class="card-hover-overlay">
                    <p class="hover-desc">{{ $t(item.desc || "") }}</p>
                    <button class="hover-btn" @click.stop="handleCardClick(item)">
                      {{ $t("ai.use") }}
                    </button>
                  </div>
                </div>
                <div class="card-name">{{ $t(item.label) }}</div>
              </div>
            </div>
            <button
              v-if="arrowState.ml.right"
              class="slider-arrow slider-arrow-right"
              @click="scrollRightFn('ml')"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 模型入口弹窗 -->
    <div
      v-if="showModelSelectModal"
      class="modal-overlay"
      :class="{ 'modal-overlay--embedded': embedded }"
      @click="closeModelSelectModal"
    >
      <div class="modal-content model-select-modal" @click.stop>
        <div class="modal-header">
          <span class="modal-title">{{
            currentModel ? $t(currentModel.label) : ""
          }}</span>
          <button class="close-btn" @click="closeModelSelectModal">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 1l12 12M13 1l-12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body model-select-body">
          <div class="model-select-section">
            <div class="model-select-section-head">
              <div>
                <div class="model-select-section-title">
                  {{ $t("ai.createNewModel") }}
                </div>
                <div class="model-select-section-desc">
                  {{ $t("ai.createNewModelDesc") }}
                </div>
              </div>
              <button
                class="btn-confirm model-select-create-btn"
                @click="openCreateModelModal"
              >
                {{ $t("ai.createProject") }}
              </button>
            </div>
          </div>

          <div class="model-select-section">
            <div class="model-select-section-head model-select-section-head--stack">
              <div class="model-select-section-title-row">
                <div class="model-select-section-title">
                  {{ $t("ai.myCreatedModels") }}
                </div>
                <span v-if="savedModels.length" class="model-select-count">{{
                  savedModels.length
                }}</span>
              </div>
              <div class="model-select-section-desc">
                {{ $t("ai.myCreatedModelsDesc") }}
              </div>
            </div>

            <div v-if="savedModelsLoading" class="model-list-empty">
              {{ $t("common.loading") }}
            </div>
            <div v-else-if="!savedModels.length" class="model-list-empty">
              {{ $t("ai.noCreatedModels") }}
            </div>
            <div v-else class="model-card-grid">
              <div
                v-for="item in savedModels"
                :key="item.id"
                class="model-card"
                @click="handleOpenSavedModel(item)"
              >
                <button
                  class="model-card-delete"
                  type="button"
                  @click.stop="handleDeleteSavedModel(item)"
                >
                  删除
                </button>
                <div class="model-card-cover">
                  <img :src="getSavedModelCover(item.toolKey)" alt="" />
                </div>
                <div class="model-card-body">
                  <div class="model-card-name">{{ item.name }}</div>
                  <div class="model-card-time">
                    {{ item.updatedAt ? formatSavedModelTime(item.updatedAt) : "-" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer modal-footer--single">
          <button class="btn-cancel" @click="closeModelSelectModal">
            {{ $t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- 新建模型弹窗 -->
    <div
      v-if="showModal"
      class="modal-overlay"
      :class="{ 'modal-overlay--embedded': embedded }"
      @click="closeCreateModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span class="modal-title">{{
            $t("ai.newModelTitle", {
              name: currentModel ? $t(currentModel.label) : "",
            })
          }}</span>
          <button class="close-btn" @click="closeCreateModal">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 1l12 12M13 1l-12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label class="form-label">{{ $t("ai.modelName") }}</label>
            <input
              v-model="modelName"
              type="text"
              class="form-input"
              :placeholder="$t('ai.inputModelName')"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm" @click="handleConfirm">
            {{ $t("common.confirm") }}
          </button>
          <button class="btn-cancel" @click="closeCreateModal">
            {{ $t("common.cancel") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Iframe 弹窗 -->
    <div v-if="showIframeModal" class="iframe-modal">
      <div class="iframe-header">
        <span class="iframe-title"
          >{{ currentModel ? $t(currentModel.label) : "" }} -
          {{ currentProjectName }}</span
        >
        <button class="close-btn" @click="closeIframeModal">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M1 1l12 12M13 1l-12 12" />
          </svg>
        </button>
      </div>
      <div class="iframe-content">
        <div v-if="iframeLoading" class="loading-state">
          {{ $t("common.loading") }}
        </div>
        <iframe
          ref="aiIframeRef"
          :src="currentIframeUrl"
          class="iframe-view"
          allow="camera; microphone; bluetooth; serial"
          @load="onIframeLoad"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { aiAdmin } from "~/composables/api/ai";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";

// AIGC 卡片封面图
import aigcCover1 from "~/assets/images/1.svg";
import aigcCover2 from "~/assets/images/2.svg";
import aigcCover3 from "~/assets/images/3.svg";
import aigcCover4 from "~/assets/images/4.svg";
import { it } from "element-plus/es/locale/index.mjs";

definePageMeta({
  layout: "sidebar",
});

const router = useRouter();
const route = useRoute();
const embedded = computed(() => route.query.embedded === "1");
const { locale, t } = useI18n();
const { getAiList, createAi, updateAi, deleteAi, deleteOss, ssoLogin } = aiAdmin();
const {
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  toUploadFile: toSharedUploadFile,
  uploadFileToOSS,
  downloadFileFromOSS,
  isMessageFromIframe,
} = useIframeFileBridge();

// 页面骨架屏（最少显示 300ms）
const pageLoading = ref(true);
const aiCenterPageRef = ref<HTMLElement | null>(null);
let aiCenterResizeObserver: ResizeObserver | null = null;
const aiCenterLayoutWidth = ref(1360);

interface AICardItem {
  key: string;
  label: string;
  desc?: string;
  cover?: string;
  routePath?: string;
}

interface SavedAIModelRecord {
  id: string;
  toolKey: string;
  name: string;
  updatedAt: number;
  fileName: string;
  mimeType: string;
  size: number;
  zipBlob: Blob;
  ossId?: string;
  optType?: string;
  url?: string;
}

interface SavedAIModelListItem {
  id: string;
  toolKey: string;
  name: string;
  updatedAt: number;
  fileName: string;
  mimeType: string;
  size: number;
  ossId?: string;
  optType?: string;
  url?: string;
}

const AI_MODEL_DB_NAME = "mata-ai-models-db";
const AI_MODEL_STORE_NAME = "models";

const aigcItems = ref<AICardItem[]>([
  {
    key: "aiPainting",
    label: "ai.aiPainting",
    routePath: "/system/opt/ai-painting?aiView=form&aiSessionType=7",
  },
  {
    key: "atQA",
    label: "ai.atQA",
    routePath: "/system/opt/aiwenda",
  },
  { key: "aiStory", label: "ai.aiStory" },
  { key: "aiSong", label: "ai.aiSong" },
  { key: "aiVideo", label: "ai.aiVideo" },
]);

// 视觉智能 数据
const visionItems = ref<AICardItem[]>([
  {
    key: "imageClassModel",
    label: "ai.imageClassModel",
    desc: "ai.imageClassModelDesc",
    cover: aigcCover1,
  },
  {
    key: "faceRecognition",
    label: "ai.faceRecognition",
    routePath: "/system/ai/face",
  },
  {
    key: "imageRecognition",
    label: "ai.imageRecognition",
    routePath: "/system/ai/material",
  },

  { key: "handwrittenDigit", label: "ai.handwrittenDigit" },
  { key: "doodleRecognition", label: "ai.doodleRecognition" },
]);

// 语言智能 数据
const languageItems = ref<AICardItem[]>([
  {
    key: "voiceClassModel",
    label: "ai.voiceClassModel",
    desc: "ai.voiceClassModelDesc",
    cover: aigcCover3,
  },
  {
    key: "speechSynthesis",
    label: "ai.speechSynthesis",
    routePath: "/system/opt/tts",
  },
  {
    key: "smartQA",
    label: "ai.smartQA",
    routePath: "/system/opt/aiwenda",
  },
  {
    key: "speechTranscription",
    label: "ai.speechTranscription",
    routePath: "/system/opt/speech-transcription/experience",
  },
  {
    key: "speechTranscriptionPrinciple",
    label: "ai.speechTranscriptionPrinciple",
  },
]);

// 行为与动作识别 数据

const behaviorItems = ref<AICardItem[]>([
  {
    key: "poseClassModel",
    label: "ai.poseClassModel",
    desc: "ai.poseClassModelDesc",
    cover: aigcCover4,
  },
  {
    key: "gestureClassModel",
    label: "ai.gestureClassModel",
    desc: "ai.gestureClassModelDesc",
    cover: aigcCover2,
  },
  { key: "poseRecognition", label: "ai.poseRecognition" },
  { key: "gestureRecognition", label: "ai.gestureRecognition" },

  { key: "emotionRecognition", label: "ai.emotionRecognition" },
]);

// 机器学习 数据
const mlItems = ref<AICardItem[]>([
  { key: "mlProcess", label: "ai.mlProcess" },
  { key: "decisionTree", label: "ai.decisionTree" },
  { key: "bigData", label: "ai.bigData" },
]);

const AI_CARD_COVER_MAP: Record<string, string> = {
  aiPainting:
    "/images/ai-practice/practice-01-eb90e462.webp",
  aiStory:
    "/images/ai-practice/practice-02-2aa5c253.webp",
  aiSong:
    "/images/ai-practice/practice-03-10ed00a3.webp",
  aiVideo:
    "/images/ai-practice/practice-04-71172075.webp",
  imageClassModel:
    "/images/ai-practice/practice-05-f6a05d9d.webp",
  faceRecognition:
    "/images/ai-practice/practice-06-b311ccf2.webp",
  imageRecognition:
    "/images/ai-practice/practice-07-0698f4e2.webp",
  handwrittenDigit:
    "/images/ai-practice/practice-08-31ce93c4.webp",
  doodleRecognition:
    "/images/ai-practice/practice-09-ed29662c.webp",
  voiceClassModel:
    "/images/ai-practice/practice-10-d1a9f616.webp",
  speechSynthesis:
    "/images/ai-practice/practice-11-1da4999c.webp",
  atQA:
    "/images/ai-practice/practice-12-c48396fd.webp",
  smartQA:
    "/images/ai-practice/practice-12-c48396fd.webp",
  speechTranscription:
    "/images/ai-practice/practice-13-8cc3f4df.webp",
  speechTranscriptionPrinciple:
    "/images/ai-practice/practice-14-6d6e5f8d.webp",
  poseClassModel:
    "/images/ai-practice/practice-15-a0fc8317.webp",
  gestureClassModel:
    "/images/ai-practice/practice-16-3c20b186.webp",
  poseRecognition:
    "/images/ai-practice/practice-17-a5b3aeef.webp",
  gestureRecognition:
    "/images/ai-practice/practice-18-941e689d.webp",
  emotionRecognition:
    "/images/ai-practice/practice-19-ad61f826.webp",
  mlProcess:
    "/images/ai-practice/practice-20-9b486d3f.webp",
  decisionTree:
    "/images/ai-practice/practice-21-de26116a.webp",
  bigData:
    "/images/ai-practice/practice-22-2fa0b7b3.webp",
};

const getAICardCover = (item: AICardItem) =>
  AI_CARD_COVER_MAP[item.key] || item.cover || AI_CARD_COVER_MAP.aiPainting;

const getAICenterLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = aiCenterPageRef.value?.clientWidth || 0;
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

const syncAICenterLayoutWidth = () => {
  aiCenterLayoutWidth.value = getAICenterLayoutWidth();
};

const aiCenterShellWidth = computed(() => {
  if (aiCenterLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(aiCenterLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(aiCenterLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--ai-center-shell-width": aiCenterShellWidth.value,
}));

// 滑动相关
const aigcList = ref<HTMLElement | null>(null);
const visionList = ref<HTMLElement | null>(null);
const languageList = ref<HTMLElement | null>(null);
const behaviorList = ref<HTMLElement | null>(null);
const mlList = ref<HTMLElement | null>(null);

// 箭头显示状态
const arrowState = ref({
  aigc: { left: false, right: false },
  vision: { left: false, right: false },
  language: { left: false, right: false },
  behavior: { left: false, right: false },
  ml: { left: false, right: false },
});

// 更新箭头状态
const updateArrowState = (type: string, el: HTMLElement | null) => {
  if (!el) return;
  const { scrollLeft, scrollWidth, clientWidth } = el;
  const canScrollLeft = scrollLeft > 5;
  const canScrollRight = scrollLeft + clientWidth < scrollWidth - 5;
  arrowState.value[type as keyof typeof arrowState.value] = {
    left: canScrollLeft,
    right: canScrollRight,
  };
};

// 检查所有区块的箭头状态
const checkAllArrows = () => {
  updateArrowState("aigc", aigcList.value);
  updateArrowState("vision", visionList.value);
  updateArrowState("language", languageList.value);
  updateArrowState("behavior", behaviorList.value);
  updateArrowState("ml", mlList.value);
};

// 获取列表元素
const getListEl = (type: string): HTMLElement | null => {
  const listMap: Record<string, HTMLElement | null> = {
    aigc: aigcList.value,
    vision: visionList.value,
    language: languageList.value,
    behavior: behaviorList.value,
    ml: mlList.value,
  };
  return listMap[type] || null;
};

// 滚动事件处理
const handleScroll = (type: string) => {
  updateArrowState(type, getListEl(type));
};

const scrollLeftFn = (type: string) => {
  const list = getListEl(type);
  if (list) {
    list.scrollBy({ left: -300, behavior: "smooth" });
  }
};

const scrollRightFn = (type: string) => {
  const list = getListEl(type);
  if (list) {
    list.scrollBy({ left: 300, behavior: "smooth" });
  }
};

const goToMaterial = () => {
  router.push("/system/ai/material");
};

const showModelSelectModal = ref(false);
const showModal = ref(false);
const currentModel = ref<AICardItem | null>(null);
const modelName = ref("");
const currentProjectName = ref("");
const currentEditingModelId = ref("");
const currentEditingOssId = ref("");
const currentToolCacheKey = ref("");
const savedModels = ref<SavedAIModelListItem[]>([]);
const savedModelsLoading = ref(false);
const loadedModelKeys = new Set<string>();
const loadingModelKeys = new Set<string>();
const showIframeModal = ref(false);
const currentIframeUrl = ref("");
const iframeLoading = ref(true);
const iframeReady = ref(false);
const aiIframeRef = ref<HTMLIFrameElement | null>(null);
const savedProjectZipCache = new Map<string, File>();
const savedModelMetaCache = new Map<string, SavedAIModelListItem>();
const DEFAULT_IFRAME_ZIP_MESSAGE_TYPE = "ZIP_DATA";
const TM_ZIP_RECEIVE_MESSAGE_TYPE = "receive-tm-zip";
const TM_ZIP_RESPONSE_MESSAGE_TYPE = "send-tm-zip";
const currentIframeZipMessageType = ref(DEFAULT_IFRAME_ZIP_MESSAGE_TYPE);
const pendingIframeZipDelivery = ref(false);
const isEditingSavedModel = ref(false);
const isHandlingTmZip = ref(false);
const pendingIframeMessage = ref<{
  type: string;
  payload: ArrayBuffer;
  optId?: string;
  transfer?: Transferable[];
} | null>(null);

const AVAILABLE_AI_CARD_KEYS = new Set([
  "aiPainting",
  "atQA",
  "smartQA",
  "speechSynthesis",
  "speechTranscription",
  "imageClassModel",
  "gestureClassModel",
  "voiceClassModel",
  "poseClassModel",
  "faceRecognition",
  "imageRecognition",
]);

const isComingSoon = (item: AICardItem) => {
  return !AVAILABLE_AI_CARD_KEYS.has(item.key);
};

const notifyEmbeddedHostToClose = () => {
  if (!import.meta.client || !embedded.value || window.parent === window) {
    return;
  }

  window.parent.postMessage(
    {
      type: "close-ai-embedded",
    },
    "*"
  );
};

const findAIItemByKey = (key: string) => {
  const allItems = [
    ...aigcItems.value,
    ...visionItems.value,
    ...languageItems.value,
    ...behaviorItems.value,
    ...mlItems.value,
  ];
  return allItems.find((item) => item.key === key) || null;
};

const openAIModelDb = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("当前环境不支持 IndexedDB"));
      return;
    }

    const request = window.indexedDB.open(AI_MODEL_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(AI_MODEL_STORE_NAME)) {
        db.createObjectStore(AI_MODEL_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("打开本地模型库失败"));
  });
};

const loadSavedModels = async () => {
  if (!currentModel.value) {
    savedModels.value = [];
    return;
  }

  const modelKey = currentModel.value.key;
  if (loadingModelKeys.has(modelKey)) {
    return;
  }

  savedModelsLoading.value = true;
  loadingModelKeys.add(modelKey);

  try {
    const targetOptType = getAiOptTypeByToolKey(modelKey);
    const userId = getCurrentUserId();
    const response = await getAiList({
      optType: targetOptType,
      userId,
    });
    const list = Array.isArray(response)
      ? response
      : response?.rows || response?.list || response?.records || [];
    const remoteModels = list
      .filter((item: any) => !targetOptType || item.optType === targetOptType)
      .map((item: any) => {
        const modelName = item.optName || item.name || item.projectName || "-";

        return {
          id: String(
            item.optId || item.id || item.aiId || item.ossId || generateAIModelId()
          ),
          toolKey: getToolKeyByAiOptType(item.optType) || currentModel.value?.key || "",
          name: modelName,
          updatedAt: normalizeAiModelTimestamp(
            item.updateTime || item.updatedAt || item.createTime,
            0
          ),
          fileName: item.fileName || getAiFileNameFromUrl(item.url, `${modelName}.zip`),
          mimeType: item.mimeType || "application/octet-stream",
          size: Number(item.size || 0),
          ossId: item.ossId ? String(item.ossId) : "",
          optType: item.optType || "",
          url: item.url || "",
        } satisfies SavedAIModelListItem;
      });

    savedModels.value = remoteModels.sort(
      (a: SavedAIModelListItem, b: SavedAIModelListItem) => b.updatedAt - a.updatedAt
    );

    console.log("加载AI模型列表完成:", {
      toolKey: modelKey,
      count: savedModels.value.length,
      ids: savedModels.value.map((item) => item.id),
    });
    loadedModelKeys.add(modelKey);
  } catch (error) {
    console.error("加载AI模型列表失败:", error);
    savedModels.value = [];
  } finally {
    loadingModelKeys.delete(modelKey);
    savedModelsLoading.value = false;
  }
};

const saveAIModelRecord = async (record: SavedAIModelRecord) => {
  const db = await openAIModelDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(AI_MODEL_STORE_NAME, "readwrite");
    const store = transaction.objectStore(AI_MODEL_STORE_NAME);

    store.put(record);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error || new Error("保存本地模型失败"));
    };
  });
};

const getAIModelRecord = async (modelId: string) => {
  const db = await openAIModelDb();

  return new Promise<SavedAIModelRecord | null>((resolve, reject) => {
    const transaction = db.transaction(AI_MODEL_STORE_NAME, "readonly");
    const store = transaction.objectStore(AI_MODEL_STORE_NAME);
    const request = store.get(modelId);

    request.onsuccess = () =>
      resolve((request.result as SavedAIModelRecord | undefined) || null);
    request.onerror = () => reject(request.error || new Error("读取模型文件失败"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () =>
      reject(transaction.error || new Error("读取模型文件失败"));
  });
};

const getAllAIModelRecords = async () => {
  const db = await openAIModelDb();

  return new Promise<SavedAIModelRecord[]>((resolve, reject) => {
    const transaction = db.transaction(AI_MODEL_STORE_NAME, "readonly");
    const store = transaction.objectStore(AI_MODEL_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () =>
      resolve((request.result as SavedAIModelRecord[] | undefined) || []);
    request.onerror = () => reject(request.error || new Error("读取模型列表失败"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () =>
      reject(transaction.error || new Error("读取模型列表失败"));
  });
};

const deleteAIModelRecord = async (modelId: string) => {
  const db = await openAIModelDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(AI_MODEL_STORE_NAME, "readwrite");
    const store = transaction.objectStore(AI_MODEL_STORE_NAME);
    const request = store.delete(modelId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error("删除本地模型失败"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () =>
      reject(transaction.error || new Error("删除本地模型失败"));
  });
};

const getTypeByToolKey = (toolKey: string) => {
  const typeMap: Record<string, number> = {
    imageClassModel: 1,
    gestureClassModel: 2,
    voiceClassModel: 3,
    poseClassModel: 4,
  };

  return typeMap[toolKey] || 1;
};

const getSavedModelCover = (toolKey: string) => {
  const coverMap: Record<string, string> = {
    imageClassModel: aigcCover1,
    gestureClassModel: aigcCover2,
    voiceClassModel: aigcCover3,
    poseClassModel: aigcCover4,
  };

  return coverMap[toolKey] || aigcCover1;
};
//http://192.168.0.199:8601/
//https://pre.matatalab.com
const getAiToolAccessToken = async () => {
  const ssoData = await ssoLogin();
  const accessToken = ssoData?.accessToken;
  if (!accessToken) {
    throw new Error("获取AI工具Token失败");
  }

  return accessToken;
};

const buildAIIframeUrl = async (toolKey: string, projectName: string, optId = "") => {
  const lang = locale.value === "zh" ? "zh" : "en";
  const type = getTypeByToolKey(toolKey);
  const aiToolToken = await getAiToolAccessToken();
  return `https://pre.matatalab.com/?token=${encodeURIComponent(
    aiToolToken
  )}&type=${type}&projectName=${encodeURIComponent(
    projectName
  )}&lang=${lang}&ch=aiedu&type2=opt${optId ? `&optId=${encodeURIComponent(optId)}` : ""}`;
};

const getAIModelCacheKey = (toolKey: string, modelId: string) =>
  `ai:${toolKey}:${modelId}`;

const getAiOptTypeByToolKey = (toolKey: string) => {
  const optTypeMap: Record<string, string> = {
    imageClassModel: "image_cls",
    voiceClassModel: "audio_cls",
    poseClassModel: "pose_cls",
    gestureClassModel: "gesture_cls",
  };

  return optTypeMap[toolKey] || "";
};

const getToolKeyByAiOptType = (optType?: string) => {
  const toolKeyMap: Record<string, string> = {
    image_cls: "imageClassModel",
    audio_cls: "voiceClassModel",
    pose_cls: "poseClassModel",
    gesture_cls: "gestureClassModel",
  };

  return optType ? toolKeyMap[optType] || "" : "";
};

const getAiFileNameFromUrl = (url?: string, fallbackName = "project.zip") => {
  if (!url) {
    return fallbackName;
  }

  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split("/").filter(Boolean).pop();
    return lastSegment ? decodeURIComponent(lastSegment) : fallbackName;
  } catch {
    return fallbackName;
  }
};

const normalizeAiModelTimestamp = (value: unknown, fallbackValue = Date.now()) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? fallbackValue : parsed;
  }

  return fallbackValue;
};

const getCurrentUserId = () => {
  if (!import.meta.client) {
    return "";
  }

  try {
    const rawUserInfo = localStorage.getItem("user_info");
    if (!rawUserInfo) {
      return "";
    }

    const userInfo = JSON.parse(rawUserInfo);
    return userInfo?.user_id || userInfo?.userId || userInfo?.id || "";
  } catch {
    return "";
  }
};

const uploadProjectFileToOSS = async (file: File) => {
  const uploadResult = await uploadFileToOSS(file, "上传模型文件失败");
  console.log("AI 模型文件上传响应:", uploadResult);
  return uploadResult;
};

const downloadAiModelZipFile = async (item: SavedAIModelListItem) => {
  const fallbackFileName =
    item.fileName || getAiFileNameFromUrl(item.url, `${item.name || "project"}.zip`);

  if (item.url) {
    const response = await fetch(item.url);
    if (!response.ok) {
      throw new Error(`下载模型文件失败: ${response.status}`);
    }

    const blob = await response.blob();
    return new File([blob], fallbackFileName, {
      type: item.mimeType || blob.type || "application/zip",
      lastModified: item.updatedAt || Date.now(),
    });
  }

  if (item.ossId) {
    return downloadFileFromOSS(
      item.ossId,
      fallbackFileName,
      item.mimeType || "application/zip"
    );
  }

  return null;
};

const generateAIModelId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `ai-model-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const toUploadFile = (payload: unknown, fileName?: string) =>
  toSharedUploadFile(payload, fileName);

const parseIframeMessageData = (rawData: unknown) => parseMessageData(rawData);

const postToIframe = (message: {
  type: string;
  payload: ArrayBuffer;
  optId?: string;
  transfer?: Transferable[];
}) => {
  const iframeWindow = aiIframeRef.value?.contentWindow;
  if (!iframeWindow) {
    return false;
  }
  const payloadSize = message.payload.byteLength;

  iframeWindow.postMessage(
    {
      type: message.type,
      payload: message.payload,
      optId: message.optId,
    },
    "*",
    message.transfer || []
  );

  console.log("已向 AI iframe 发送 receive-tm-zip:", {
    cacheKey: currentToolCacheKey.value,
    type: message.type,
    fileName: currentToolCacheKey.value
      ? savedProjectZipCache.get(currentToolCacheKey.value)?.name || ""
      : "",
    optId: message.optId || "",
    payloadType: "ArrayBuffer",
    size: payloadSize,
  });

  return true;
};

const postCachedZipToIframe = async () => {
  const zipFile = currentToolCacheKey.value
    ? savedProjectZipCache.get(currentToolCacheKey.value)
    : null;
  if (!zipFile) {
    return null;
  }

  const arrayBuffer = await zipFile.arrayBuffer();
  const message = {
    type: currentIframeZipMessageType.value,
    payload: arrayBuffer,
    optId:
      currentIframeZipMessageType.value === TM_ZIP_RECEIVE_MESSAGE_TYPE
        ? currentEditingModelId.value || undefined
        : undefined,
    transfer: [arrayBuffer] as Transferable[],
  };

  if (iframeReady.value) {
    const posted = postToIframe(message);
    if (posted) {
      pendingIframeZipDelivery.value = false;
      pendingIframeMessage.value = null;
      return {
        payloadType: "ArrayBuffer" as const,
        fileName: zipFile.name,
        size: zipFile.size,
      };
    }
    pendingIframeMessage.value = message;
    return null;
  }

  pendingIframeMessage.value = message;
  return {
    payloadType: "ArrayBuffer" as const,
    fileName: zipFile.name,
    size: zipFile.size,
    pending: true,
  };
};

const finishCloseIframeModal = () => {
  const shouldRestoreModelSelect = Boolean(currentModel.value);
  isHandlingTmZip.value = false;
  pendingIframeZipDelivery.value = false;
  isEditingSavedModel.value = false;
  pendingIframeMessage.value = null;
  showIframeModal.value = false;
  currentIframeUrl.value = "";
  iframeLoading.value = true;
  iframeReady.value = false;
  currentIframeZipMessageType.value = DEFAULT_IFRAME_ZIP_MESSAGE_TYPE;
  currentProjectName.value = "";
  currentEditingModelId.value = "";
  currentEditingOssId.value = "";
  currentToolCacheKey.value = "";

  if (shouldRestoreModelSelect) {
    showModelSelectModal.value = true;
    void loadSavedModels();
  }
};

const openAIIframe = async (tool: AICardItem, projectName: string, modelId: string) => {
  try {
    const iframeUrl = await buildAIIframeUrl(
      tool.key,
      projectName,
      isEditingSavedModel.value ? modelId : ""
    );
    const cacheKey = getAIModelCacheKey(tool.key, modelId);
    console.log("打开 AI iframe:", {
      mode: isEditingSavedModel.value ? "edit" : "create",
      toolKey: tool.key,
      projectName,
      modelId,
      optId: isEditingSavedModel.value ? modelId : "",
      iframeUrl,
    });
    isHandlingTmZip.value = false;
    pendingIframeZipDelivery.value = savedProjectZipCache.has(cacheKey);
    iframeReady.value = false;
    currentModel.value = tool;
    currentProjectName.value = projectName;
    currentEditingModelId.value = modelId;
    currentToolCacheKey.value = cacheKey;
    currentIframeUrl.value = iframeUrl;
    iframeLoading.value = true;
    showModelSelectModal.value = false;
    showModal.value = false;
    showIframeModal.value = true;
  } catch (error) {
    console.error("获取AI工具SSO登录信息失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "获取AI工具Token失败");
  }
};

const formatSavedModelTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString(locale.value === "zh" ? "zh-CN" : "en-US", {
    hour12: false,
  });
};

const handleIframeMessage = async (event: MessageEvent) => {
  if (
    !isMessageFromIframe({
      event,
      iframeWindow: aiIframeRef.value?.contentWindow,
      iframeUrl: currentIframeUrl.value,
    })
  ) {
    return;
  }

  const messageData = parseIframeMessageData(event.data) as any;
  const messageType = getMessageType(messageData);

  if (
    !messageData ||
    (typeof messageData !== "object" && typeof messageData !== "string") ||
    messageType !== TM_ZIP_RESPONSE_MESSAGE_TYPE
  ) {
    return;
  }

  try {
    if (isHandlingTmZip.value) {
      return;
    }

    isHandlingTmZip.value = true;

    const rawPayload = pickMessagePayload(messageData, [
      "payload",
      "data",
      "file",
      "blob",
      "arrayBuffer",
      "result",
    ]);
    const uploadFile = toUploadFile(rawPayload, pickMessageFileName(messageData));
    if (!uploadFile) {
      console.warn(
        "收到 send-tm-zip 消息，但 payload 不是可上传的文件类型:",
        messageData
      );
      return;
    }

    const saveMode = isEditingSavedModel.value ? "edit" : "create";
    const activeToolKey = currentModel.value?.key || "";
    const persistedModelId = currentEditingModelId.value || generateAIModelId();
    const persistedProjectName =
      currentProjectName.value.trim() || uploadFile.name.replace(/\.[^.]+$/, "");
    const optType = activeToolKey ? getAiOptTypeByToolKey(activeToolKey) : "";
    const cacheKey = activeToolKey
      ? getAIModelCacheKey(activeToolKey, persistedModelId)
      : currentToolCacheKey.value;

    console.log("收到 AI iframe send-tm-zip，准备写入本地模型库:", {
      mode: saveMode,
      origin: event.origin,
      type: messageType,
      rawData: event.data,
      data: messageData,
      payload: rawPayload,
      uploadFile: {
        name: uploadFile.name,
        type: uploadFile.type,
        size: uploadFile.size,
      },
      modelId: persistedModelId,
      projectName: persistedProjectName,
      toolKey: activeToolKey,
    });

    window.dispatchEvent(
      new CustomEvent("tool-send-tm-zip", {
        detail: {
          ...messageData,
          payload: uploadFile,
          uploadFile,
          mode: saveMode,
        },
      })
    );

    if (!currentModel.value || !activeToolKey) {
      console.warn("AI 模型上下文不完整，已收到 send-tm-zip，但未写入本地模型列表");
      return;
    }

    try {
      if (isEditingSavedModel.value && currentEditingOssId.value) {
        try {
          await deleteOss(currentEditingOssId.value);
          console.log("删除旧OSS对象成功:", currentEditingOssId.value);
        } catch (error) {
          console.warn("删除旧OSS对象失败，继续上传新文件:", error);
        }
      }

      const uploadResult = await uploadProjectFileToOSS(uploadFile);
      const ossId = uploadResult?.ossId;
      const userId = getCurrentUserId();

      if (!ossId || !userId || !optType) {
        throw new Error("AI 保存参数不完整");
      }

      let finalModelId = persistedModelId;
      if (isEditingSavedModel.value && currentEditingModelId.value) {
        await updateAi({
          optId: currentEditingModelId.value,
          optName: persistedProjectName,
          optType,
          userId,
          ossId,
        });
        finalModelId = currentEditingModelId.value;
      } else {
        const createResult = await createAi({
          optName: persistedProjectName,
          optType,
          userId,
          ossId,
        });
        finalModelId = String(
          createResult?.optId || createResult?.id || currentEditingModelId.value || persistedModelId
        );
      }

      const finalCacheKey = getAIModelCacheKey(activeToolKey, finalModelId);
      currentEditingModelId.value = finalModelId;
      currentEditingOssId.value = String(ossId);
      currentToolCacheKey.value = finalCacheKey;
      savedProjectZipCache.set(finalCacheKey, uploadFile);
      if (cacheKey !== finalCacheKey) {
        savedProjectZipCache.delete(cacheKey);
      }
      savedModelMetaCache.set(finalModelId, {
        id: finalModelId,
        toolKey: currentModel.value.key,
        name: persistedProjectName,
        updatedAt: Date.now(),
        fileName: uploadFile.name,
        mimeType: uploadFile.type,
        size: uploadFile.size,
        ossId: String(ossId),
        optType,
        url: uploadResult?.url || "",
      });
      await saveAIModelRecord({
        id: finalModelId,
        toolKey: currentModel.value.key,
        name: persistedProjectName,
        updatedAt: Date.now(),
        fileName: uploadFile.name,
        mimeType: uploadFile.type,
        size: uploadFile.size,
        zipBlob: uploadFile,
        ossId: String(ossId),
        optType,
        url: uploadResult?.url || "",
      });

      isEditingSavedModel.value = true;
      await loadSavedModels();
      ElMessage.success(saveMode === "edit" ? "编辑成功" : "创建成功");
    } catch (error) {
      console.error("保存AI模型失败:", error);
      ElMessage.error(error instanceof Error ? error.message : t("ai.modelSaveFailed"));
    }
  } finally {
    isHandlingTmZip.value = false;
  }
};

const handleCardClick = async (item: AICardItem) => {
  console.log(item,'************')
  if (isComingSoon(item)) return;

  if (item.routePath) {
    await router.push(item.routePath);
    return;
  }

  currentModel.value = item;
  modelName.value = "";
  showModelSelectModal.value = true;
  if (!loadedModelKeys.has(item.key) || !savedModels.value.length) {
    savedModels.value = [];
    await loadSavedModels();
  }
};

const closeModelSelectModal = () => {
  showModelSelectModal.value = false;
  currentModel.value = null;
  modelName.value = "";
  savedModels.value = [];
  notifyEmbeddedHostToClose();
};

const openCreateModelModal = () => {
  modelName.value = "";
  showModelSelectModal.value = false;
  showModal.value = true;
};

const closeCreateModal = () => {
  showModal.value = false;
  modelName.value = "";
  if (currentModel.value) {
    showModelSelectModal.value = true;
    return;
  }

  savedModels.value = [];
  notifyEmbeddedHostToClose();
};

const handleConfirm = async () => {
  if (!currentModel.value) {
    return;
  }

  const trimmedName = modelName.value.trim();
  if (!trimmedName) {
    ElMessage.warning(t("ai.inputModelName"));
    return;
  }

  isEditingSavedModel.value = false;
  currentEditingOssId.value = "";
  currentIframeZipMessageType.value = DEFAULT_IFRAME_ZIP_MESSAGE_TYPE;
  await openAIIframe(currentModel.value, trimmedName, generateAIModelId());
};

const handleOpenSavedModel = async (item: SavedAIModelListItem) => {
  if (!currentModel.value) {
    return;
  }

  try {
    const cacheKey = getAIModelCacheKey(item.toolKey, item.id);
    const cachedFile = savedProjectZipCache.get(cacheKey);
    if (cachedFile) {
      console.log("命中内存缓存，直接使用已缓存的 AI 模型 ZIP:", {
        modelId: item.id,
        fileName: cachedFile.name,
        size: cachedFile.size,
      });
      isEditingSavedModel.value = true;
      currentEditingOssId.value = item.ossId || "";
      currentIframeZipMessageType.value = TM_ZIP_RECEIVE_MESSAGE_TYPE;
      await openAIIframe(currentModel.value, item.name, item.id);
      return;
    }

    const localRecord = await getAIModelRecord(item.id);
    if (localRecord) {
      const localFile = new File([localRecord.zipBlob], localRecord.fileName, {
        type: localRecord.mimeType || "application/octet-stream",
        lastModified: localRecord.updatedAt,
      });

      console.log("命中 IndexedDB 缓存，直接使用本地 AI 模型 ZIP:", {
        modelId: item.id,
        fileName: localFile.name,
        size: localFile.size,
      });
      savedProjectZipCache.set(cacheKey, localFile);
      isEditingSavedModel.value = true;
      currentEditingOssId.value = item.ossId || localRecord.ossId || "";
      currentIframeZipMessageType.value = TM_ZIP_RECEIVE_MESSAGE_TYPE;
      await openAIIframe(currentModel.value, item.name, item.id);
      return;
    }

    const remoteFile = await downloadAiModelZipFile(item);
    if (remoteFile) {
      savedProjectZipCache.set(cacheKey, remoteFile);
      savedModelMetaCache.set(item.id, {
        ...item,
        fileName: remoteFile.name,
        mimeType: remoteFile.type || item.mimeType || "application/octet-stream",
        size: remoteFile.size,
      });
      await saveAIModelRecord({
        id: item.id,
        toolKey: item.toolKey,
        name: item.name,
        updatedAt: item.updatedAt || Date.now(),
        fileName: remoteFile.name,
        mimeType: remoteFile.type || item.mimeType || "application/octet-stream",
        size: remoteFile.size,
        zipBlob: remoteFile,
        ossId: item.ossId || "",
        optType: item.optType || "",
        url: item.url || "",
      });
      isEditingSavedModel.value = true;
      currentEditingOssId.value = item.ossId || "";
      currentIframeZipMessageType.value = TM_ZIP_RECEIVE_MESSAGE_TYPE;
      await openAIIframe(currentModel.value, item.name, item.id);
      return;
    }

    ElMessage.error(t("ai.loadModelFailed"));
  } catch (error) {
    console.error("读取AI模型文件失败:", error);
    ElMessage.error(t("ai.loadModelFailed"));
  }
};

const handleDeleteSavedModel = async (item: SavedAIModelListItem) => {
  try {
    await ElMessageBox.confirm(`确认删除模型“${item.name}”吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  try {
    await deleteAi(item.id);
    await deleteAIModelRecord(item.id);
    const cacheKey = getAIModelCacheKey(item.toolKey, item.id);
    savedProjectZipCache.delete(cacheKey);
    savedModelMetaCache.delete(item.id);
    savedModels.value = savedModels.value.filter((model) => model.id !== item.id);
    ElMessage.success("删除成功");
  } catch (error) {
    console.error("删除AI模型失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "删除失败");
  }
};

const openSavedModelFromRoute = async () => {
  const openKey = typeof route.query.open === "string" ? route.query.open : "";
  const modelId = typeof route.query.modelId === "string" ? route.query.modelId : "";
  const targetItem = openKey ? findAIItemByKey(openKey) : null;

  if (!targetItem) {
    return;
  }

  await handleCardClick(targetItem);

  if (!modelId) {
    return;
  }

  const targetSavedModel = savedModels.value.find(
    (item) => String(item.id) === modelId
  );

  if (targetSavedModel) {
    await handleOpenSavedModel(targetSavedModel);
  }
};

const closeIframeModal = () => {
  finishCloseIframeModal();
};

const onIframeLoad = () => {
  iframeLoading.value = false;
  iframeReady.value = true;
  window.setTimeout(() => {
    if (pendingIframeMessage.value) {
      const message = pendingIframeMessage.value;
      pendingIframeMessage.value = null;
      const posted = postToIframe(message);
      if (posted) {
        pendingIframeZipDelivery.value = false;
      }
      return;
    }

    if (pendingIframeZipDelivery.value) {
      void postCachedZipToIframe();
    }
  }, 300);
};

onMounted(() => {
  syncAICenterLayoutWidth();
  if (embedded.value) {
    pageLoading.value = false;
  } else {
    setTimeout(() => {
      pageLoading.value = false;
    }, 300);
  }
  nextTick(() => {
    checkAllArrows();
  });
  window.addEventListener("resize", syncAICenterLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncAICenterLayoutWidth);
  if (window.ResizeObserver && aiCenterPageRef.value) {
    aiCenterResizeObserver = new window.ResizeObserver(() => {
      syncAICenterLayoutWidth();
    });
    aiCenterResizeObserver.observe(aiCenterPageRef.value);
  }
  window.addEventListener("resize", checkAllArrows);
  window.addEventListener("message", handleIframeMessage);

  nextTick(() => {
    void openSavedModelFromRoute();
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", syncAICenterLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncAICenterLayoutWidth);
  aiCenterResizeObserver?.disconnect();
  aiCenterResizeObserver = null;
  window.removeEventListener("resize", checkAllArrows);
  window.removeEventListener("message", handleIframeMessage);
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
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.ai-center-page {
  min-height: calc(100vh - 70px);
  padding: 28px 0 72px;
  background: #f8f9fa;
  overflow: visible;
}

.ai-center-page--embedded {
  min-height: 100vh;
  padding: 0;
  background: transparent;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--ai-center-shell-width));
  margin: 0 auto;
  box-sizing: border-box;
}

.page-header {
  padding: 0 32px 22px;
}

.page-header__copy {
  max-width: 1100px;
}

.page-title {
  margin: 0;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 36px;
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -0.03em;
}

.page-header__desc {
  margin: 16px 0 0;
  color: #5a6062;
  font-size: 18px;
  line-height: 1.75;
}

.content-area {
  padding: 0 32px 0;
  overflow: visible;
}

.section {
  margin-bottom: 52px;
}

.section-highlight {
  background: transparent;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.section-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.section-icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  border-radius: 18px;
}

.section-icon-chip--aigc {
  background: rgba(0, 91, 194, 0.1);
  color: #005bc2;
}

.section-icon-chip--vision {
  background: rgba(89, 72, 211, 0.12);
  color: #5948d3;
}

.section-icon-chip--language {
  background: rgba(144, 78, 0, 0.1);
  color: #904e00;
}

.section-icon-chip--behavior {
  background: rgba(89, 72, 211, 0.1);
  color: #5948d3;
}

.section-icon-chip--ml {
  background: rgba(0, 91, 194, 0.1);
  color: #005bc2;
}

.section-icon {
  font-size: 30px;
  font-variation-settings:
    "FILL" 1,
    "wght" 500,
    "GRAD" 0,
    "opsz" 30;
}

.section-name {
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.section-desc {
  color: #5a6062;
  font-size: 14px;
  line-height: 1.75;
}

.card-slider {
  position: relative;
}

.slider-arrow {
  display: none;
}

.card-grid-scroll {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  overflow: visible;
  padding: 0;
}

.ai-card {
  min-width: 0;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(174, 179, 181, 0.14);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(46, 51, 53, 0.05);
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease;
}

.ai-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 91, 194, 0.2);
  box-shadow: 0 20px 42px rgba(46, 51, 53, 0.1);
}

.card-cover-wrapper {
  position: relative;
  aspect-ratio: 1.58 / 1;
  overflow: hidden;
  background: #eef2f6;
}

.card-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s ease;
}

.card-cover-default {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #dbe8ff 0%, #f1f5ff 100%);
}

.ai-card:hover .card-cover {
  transform: scale(1.04);
}

.card-hover-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 60px 20px 18px;
  background: linear-gradient(180deg, rgba(12, 15, 16, 0) 0%, rgba(12, 15, 16, 0.72) 100%);
  opacity: 0;
  transition: opacity 0.28s ease;
}

.ai-card:hover .card-hover-overlay {
  opacity: 1;
}

.hover-desc {
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  line-height: 1.7;
}

.hover-btn {
  width: fit-content;
  min-width: 96px;
  height: 36px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #005bc2;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(12, 15, 16, 0.18);
}

.card-name {
  padding: 18px 20px 22px;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}

.coming-soon-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(12, 15, 16, 0.72);
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.cs-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cs-text {
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(12, 15, 16, 0.45);
  backdrop-filter: blur(8px);
}

.modal-overlay--embedded {
  background: rgba(12, 15, 16, 0.2);
}

.modal-content {
  width: min(560px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  overflow: hidden;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 24px 64px rgba(12, 15, 16, 0.18);
  animation: modalFadeIn 0.3s ease;
}

.model-select-modal {
  width: min(720px, calc(100vw - 48px));
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  color: #ffffff;
  background: linear-gradient(135deg, #005bc2 0%, #4b8eff 100%);
}

.modal-title {
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.26);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px 36px;
}

.model-select-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.model-select-section {
  border: 1px solid rgba(164, 193, 255, 0.45);
  border-radius: 18px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%);
}

.model-select-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.model-select-section-head--stack {
  flex-direction: column;
  align-items: stretch;
}

.model-select-section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-select-section-title {
  color: #2e3335;
  font-size: 15px;
  font-weight: 700;
}

.model-select-section-desc {
  margin-top: 6px;
  color: #5a6062;
  font-size: 13px;
  line-height: 1.65;
}

.model-select-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: #e4efff;
  color: #005bc2;
  font-size: 12px;
  font-weight: 700;
}

.model-select-create-btn {
  width: auto;
  min-width: 120px;
  padding: 0 20px;
  flex-shrink: 0;
}

.model-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 14px;
  max-height: 320px;
  margin-top: 16px;
  overflow-y: auto;
}

.model-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.model-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 91, 194, 0.24);
  box-shadow: 0 14px 26px rgba(46, 51, 53, 0.1);
}

.model-card-delete {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  min-width: 52px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 77, 79, 0.92);
  color: #ffffff;
  font-size: 12px;
  line-height: 28px;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.model-card:hover .model-card-delete {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.model-card-delete:hover {
  background: #ff4d4f;
}

.model-card-cover {
  height: 108px;
  background: #eef2f6;
}

.model-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.model-card-body {
  padding: 12px;
}

.model-card-name {
  color: #2e3335;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card-time {
  margin-top: 6px;
  color: #5a6062;
  font-size: 11px;
}

.model-list-empty {
  margin-top: 16px;
  border: 1px dashed rgba(174, 179, 181, 0.4);
  border-radius: 14px;
  padding: 24px 16px;
  color: #5a6062;
  font-size: 13px;
  text-align: center;
  background: rgba(248, 249, 250, 0.9);
}

.form-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  width: 56px;
  flex-shrink: 0;
  color: #2e3335;
  font-size: 14px;
  font-weight: 600;
}

.form-input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1px solid rgba(174, 179, 181, 0.3);
  border-radius: 12px;
  outline: none;
  color: #2e3335;
  font-size: 14px;
  background: #f8f9fa;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.form-input:focus {
  border-color: rgba(0, 91, 194, 0.35);
  box-shadow: 0 0 0 4px rgba(0, 91, 194, 0.08);
  background: #ffffff;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 0 36px 32px;
}

.modal-footer--single {
  padding-top: 0;
}

.btn-confirm,
.btn-cancel {
  min-width: 120px;
  height: 42px;
  padding: 0 22px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.btn-confirm {
  border: none;
  color: #ffffff;
  background: linear-gradient(135deg, #005bc2 0%, #4b8eff 100%);
  box-shadow: 0 12px 24px rgba(0, 91, 194, 0.18);
}

.btn-confirm:hover {
  transform: translateY(-1px);
}

.btn-cancel {
  border: 1px solid rgba(174, 179, 181, 0.35);
  color: #5a6062;
  background: #ffffff;
}

.btn-cancel:hover {
  border-color: rgba(0, 91, 194, 0.26);
  color: #005bc2;
}

.iframe-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.iframe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 56px;
  padding: 0 20px;
  color: #ffffff;
  background: linear-gradient(135deg, #005bc2 0%, #4b8eff 100%);
  flex-shrink: 0;
}

.iframe-title {
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
}

.iframe-content {
  position: relative;
  flex: 1;
  background: #ffffff;
}

.iframe-view {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.loading-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a6062;
  font-size: 14px;
  background: #ffffff;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1600px) {
  .page-header,
  .content-area {
    padding-left: 24px;
    padding-right: 24px;
  }

  .page-title {
    font-size: 40px;
  }
}

@media (max-width: 1360px) {
  .card-grid-scroll {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .card-grid-scroll {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .ai-center-page {
    padding: 20px 0 40px;
  }

  .page-header,
  .content-area {
    padding-left: 16px;
    padding-right: 16px;
  }

  .page-header {
    padding-bottom: 18px;
  }

  .page-title {
    font-size: 30px;
  }

  .page-header__desc {
    margin-top: 12px;
    font-size: 14px;
  }

  .section {
    margin-bottom: 40px;
  }

  .section-header {
    gap: 12px;
    margin-bottom: 18px;
  }

  .section-icon-chip {
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }

  .section-icon {
    font-size: 26px;
    font-variation-settings:
      "FILL" 1,
      "wght" 500,
      "GRAD" 0,
      "opsz" 26;
  }

  .section-name {
    font-size: 24px;
  }

  .section-desc {
    font-size: 13px;
  }

  .card-grid-scroll {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .card-cover-wrapper {
    aspect-ratio: 1.48 / 1;
  }

  .card-name {
    padding: 16px 18px 20px;
    font-size: 17px;
  }

  .model-select-modal,
  .modal-content {
    width: calc(100vw - 24px);
  }

  .model-select-body,
  .modal-body,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .model-select-section-head {
    flex-direction: column;
    align-items: stretch;
  }

  .model-select-create-btn,
  .btn-confirm,
  .btn-cancel {
    width: 100%;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .model-card-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .model-card-cover {
    height: 82px;
  }
}
</style>

