<template>
  <div ref="toolCenterPageRef" class="tool-center-page" :style="pageAdaptiveStyle">
    <div class="tool-center-shell">
      <section class="tool-hero-banner">
        <div class="tool-hero-banner__copy">
          <h1 class="tool-hero-banner__title">
            <span>激发无限创意</span>
            <span>数字工具赋能智慧教学</span>
          </h1>
          <p class="tool-hero-banner__desc">
            配套智能教具，软硬件结合，探索未来教育的无限可能。为每一个创意提供触手可及的实现路径。
          </p>
        </div>

        <div class="tool-hero-banner__visual" aria-hidden="true">
          <img
            :src="toolHeroImage"
            alt=""
            class="tool-hero-banner__image"
          />
        </div>
      </section>

      <div class="tool-grid tool-grid--featured">
        <template v-if="pageLoading">
          <div v-for="i in 2" :key="`featured-${i}`" class="tool-card tool-card--featured">
            <el-skeleton animated :rows="0">
              <template #template>
                <div class="tool-card__featured-inner">
                  <el-skeleton-item
                    variant="rect"
                    style="width: 88px; height: 88px; border-radius: 22px"
                  />
                  <div style="flex: 1">
                    <el-skeleton-item
                      variant="text"
                      style="width: 60%; height: 24px; margin-bottom: 14px"
                    />
                    <el-skeleton-item
                      variant="text"
                      style="width: 100%; height: 16px; margin-bottom: 10px"
                    />
                    <el-skeleton-item
                      variant="text"
                      style="width: 90%; height: 16px; margin-bottom: 18px"
                    />
                    <div class="tool-card__featured-actions">
                      <el-skeleton-item
                        variant="rect"
                        style="width: 110px; height: 34px; border-radius: 10px"
                      />
                      <el-skeleton-item
                        variant="rect"
                        style="width: 110px; height: 34px; border-radius: 10px"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </el-skeleton>
          </div>
        </template>

        <template v-else>
          <article
            v-for="tool in featuredTools"
            :key="tool.id"
            class="tool-card tool-card--featured"
          >
            <div class="tool-card__featured-inner">
              <div class="tool-brand-box">
                 <img :src="getToolVisualMeta(tool.id).featuredLogo" :alt="getToolDisplayName(tool.id)" />
                <!-- <div
                  class="tool-brand-box__inner"
                
                >
                 
                </div> -->
              </div>

              <div class="tool-card__body">
                <h2 class="tool-card__title tool-card__title--featured">
                  {{ getToolTitleParts(tool.id).main }}
                  <span
                    v-if="getToolTitleParts(tool.id).subtitle"
                    class="tool-card__title-subtitle"
                  >
                    {{ getToolTitleParts(tool.id).subtitle }}
                  </span>
                </h2>
                <p class="tool-card__desc tool-card__desc--featured">
                  {{ t(tool.descKey) }}
                </p>

                <div class="tool-card__featured-actions">
                  <button
                    v-if="tool.hasCreate"
                    class="tool-btn tool-btn--primary"
                    @click="handleCreate(tool)"
                  >
                    {{ t("tool.startCreate") }}
                  </button>

                  <button
                    v-if="tool.hasDownloadClient"
                    class="tool-btn tool-btn--soft"
                    @click="handleDownloadClient(tool)"
                  >
                    {{ t("tool.downloadClient") }}
                  </button>
                </div>
              </div>
            </div>
          </article>
        </template>
      </div>

      <div class="tool-grid tool-grid--compact">
        <template v-if="pageLoading">
          <div v-for="i in 3" :key="`compact-${i}`" class="tool-card tool-card--compact">
            <el-skeleton animated :rows="0">
              <template #template>
                <div class="tool-card__compact-icon-skeleton">
                  <el-skeleton-item
                    variant="rect"
                    style="width: 68px; height: 68px; border-radius: 18px"
                  />
                </div>
                <el-skeleton-item
                  variant="text"
                  style="width: 56%; height: 22px; margin: 0 auto 16px"
                />
                <el-skeleton-item
                  variant="text"
                  style="width: 92%; height: 16px; margin-bottom: 10px"
                />
                <el-skeleton-item
                  variant="text"
                  style="width: 84%; height: 16px; margin: 0 auto 20px"
                />
                <div class="tool-card__compact-actions tool-card__compact-actions--stack">
                  <el-skeleton-item
                    variant="rect"
                    style="width: 100%; height: 34px; border-radius: 10px"
                  />
                  <el-skeleton-item
                    variant="rect"
                    style="width: 100%; height: 34px; border-radius: 10px"
                  />
                </div>
              </template>
            </el-skeleton>
          </div>
        </template>

        <template v-else>
          <article
            v-for="tool in compactTools"
            :key="tool.id"
            class="tool-card tool-card--compact"
            :class="{
              'tool-card--compact-xplore': tool.id === 'matataxplore',
            }"
          >
            <div class="tool-card__compact-icon">
              <div
                class="tool-card__compact-icon-inner"
                :style="{
                  background: 'transparent',
                  boxShadow: 'none',
                }"
              >
                <img
                  :src="tool.icon"
                  :alt="getToolDisplayName(tool.id)"
                  class="tool-card__compact-symbol-image"
                />
              </div>
            </div>

            <h3 class="tool-card__title tool-card__title--compact">
              {{ getToolTitleParts(tool.id).main }}
              <span
                v-if="getToolTitleParts(tool.id).subtitle"
                class="tool-card__title-subtitle"
              >
                {{ getToolTitleParts(tool.id).subtitle }}
              </span>
            </h3>
            <p class="tool-card__desc tool-card__desc--compact">{{ t(tool.descKey) }}</p>

            <div
              class="tool-card__compact-actions"
              :class="{
                'tool-card__compact-actions--stack': tool.id === 'matatacode',
                'tool-card__compact-actions--single': tool.id === 'talemap',
                'tool-card__compact-actions--grid': tool.id === 'matataxplore',
              }"
            >
              <button
                v-if="tool.hasMacOS"
                class="tool-btn tool-btn--compact"
                @click="handleDownloadMacOS(tool)"
              >
                <span
                  class="tool-icon-svg tool-btn__icon"
                  v-html="getActionIconSvg(tool.id, 'macOS')"
                ></span>
                {{ t("tool.downloadMacOS") }}
              </button>

              <button
                v-if="tool.hasWindows"
                class="tool-btn tool-btn--compact"
                @click="handleDownloadWindows(tool)"
              >
                <span
                  class="tool-icon-svg tool-btn__icon"
                  v-html="getActionIconSvg(tool.id, 'windows')"
                ></span>
                {{ t("tool.downloadWindows") }}
              </button>

              <button
                v-if="tool.hasAppStore"
                class="tool-btn tool-btn--compact"
                @click="handleDownloadAppStore(tool)"
              >
                <span
                  class="tool-icon-svg tool-btn__icon"
                  v-html="getActionIconSvg(tool.id, 'appStore')"
                ></span>
                {{ t(tool.appStoreKey || "tool.downloadAppStore") }}
              </button>

              <button
                v-if="tool.hasGooglePlay"
                class="tool-btn tool-btn--compact"
                @click="handleDownloadGooglePlay(tool)"
              >
                <span
                  class="tool-icon-svg tool-btn__icon"
                  v-html="getActionIconSvg(tool.id, 'googlePlay')"
                ></span>
                {{ t(tool.googlePlayKey || "tool.downloadGooglePlay") }}
              </button>

              <button
                v-if="tool.hasDownloadClient"
                class="tool-btn tool-btn--compact"
                @click="handleDownloadClient(tool)"
              >
                <span
                  class="tool-icon-svg tool-btn__icon"
                  v-html="getActionIconSvg(tool.id, 'client')"
                ></span>
                {{ t("tool.downloadClient") }}
              </button>
            </div>
          </article>
        </template>
      </div>

      <div
        v-if="showIframeModal"
        class="iframe-modal-overlay"
        @click.self="closeIframeModal"
      >
        <div class="iframe-modal-container">
          <div class="iframe-modal-header">
            <div class="iframe-modal-copy">
              <span class="iframe-modal-title">{{ currentToolName }}</span>
              <span class="iframe-modal-desc">
                工具内容保持原有交互逻辑，仅更新当前容器界面样式。
              </span>
            </div>

            <button class="iframe-close-btn" @click="closeIframeModal">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="iframe-modal-body">
            <div v-if="iframeLoading" class="iframe-loading">
              <div class="loading-spinner"></div>
              <span class="loading-text">{{ t("common.loading") }}</span>
            </div>
            <iframe
              ref="toolIframeRef"
              :src="currentIframeUrl"
              class="tool-iframe"
              :class="{ hidden: iframeLoading }"
              frameborder="0"
              allowfullscreen
              allow="camera; microphone; bluetooth; serial"
              @load="onIframeLoad"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { aiAdmin } from "~/composables/api/ai";
import { personalcenterApi } from "~/composables/api/personalcenter";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";

import tool1Icon from "~/assets/images/tool1.svg";
import tool2Icon from "~/assets/images/tool2.svg";
import tool4Icon from "~/assets/images/too4.svg";
import tool3Icon from "~/assets/images/tool3.svg";
import tool5Icon from "~/assets/images/tool5.svg";
import toolHeroBannerImage from "~/assets/images/xiaoxinxin.svg";

definePageMeta({
  layout: "sidebar",
});

const { t, locale } = useI18n();
const runtimeConfig = useRuntimeConfig();
const { createAi, ssoLogin } = aiAdmin();
const { addOpus, uploadOSS } = personalcenterApi();
const {
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  toZipFile,
  toUploadFile,
  toWorkFile,
  uploadFileToOSS,
  createUploadFormData,
  isMessageFromIframe,
  postFileBufferToIframe,
} = useIframeFileBridge();

const pageLoading = ref(true);
const TOOL_OUTER_SCROLL_CLASS = "tool-page-use-outer-scroll";
const toolCenterPageRef = ref<HTMLElement | null>(null);
let toolCenterResizeObserver: ResizeObserver | null = null;
const toolCenterLayoutWidth = ref(1360);

const toggleToolOuterScroll = (enabled: boolean) => {
  if (typeof document === "undefined") return;

  document.documentElement.classList.remove(TOOL_OUTER_SCROLL_CLASS);
  document.body.classList.remove(TOOL_OUTER_SCROLL_CLASS);
};

const resetToolPageScroll = () => {
  if (typeof window === "undefined") return;

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const shell = document.querySelector(".sidebar-shell") as HTMLElement | null;
  const content = document.querySelector(".sidebar-shell-content") as HTMLElement | null;

  if (shell) shell.scrollTop = 0;
  if (content) content.scrollTop = 0;
};

interface Tool {
  id: string;
  name: string;
  icon: string;
  titleKey: string;
  descKey: string;
  hasCreate: boolean;
  onlyCreateFlow?: boolean;
  hasDownloadClient?: boolean;
  hasMacOS?: boolean;
  hasWindows?: boolean;
  hasAppStore?: boolean;
  hasGooglePlay?: boolean;
  appStoreKey?: string;
  googlePlayKey?: string;
  createUrl?: string;
  downloadClientUrl?: string;
  macOSUrl?: string;
  windowsUrl?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
}

interface ToolVisualMeta {
  displayName: string;
  brandBg: string;
  featuredLogo: string;
  compactBg: string;
  compactShadow: string;
}

const toolHeroImage = toolHeroBannerImage;

const toolList: Tool[] = [
  {
    id: "vincibot",
    name: "MatataCode<br/>(VinciBot)",
    icon: tool1Icon,
    titleKey: "tool.vincibot.title",
    descKey: "tool.vincibot.desc",
    hasCreate: true,
    onlyCreateFlow: true,
    hasDownloadClient: true,
    createUrl: runtimeConfig.public.vincibotCreateUrl,
    downloadClientUrl: "https://vinci.matatastudio.com/static/download.html",
  },
  {
    id: "nous",
    name: "MatataCode<br/>(Nous)",
    icon: tool2Icon,
    titleKey: "tool.nous.title",
    descKey: "tool.nous.desc",
    hasCreate: true,
    onlyCreateFlow: true,
    hasDownloadClient: true,
    createUrl: runtimeConfig.public.nousCreateUrl,
    downloadClientUrl: "https://nous.matatastudio.com/?page=download",
  },
  {
    id: "matatacode",
    name: "MatataCode（Kids）",
    icon: tool3Icon,
    titleKey: "tool.matatacode.title",
    descKey: "tool.matatacode.desc",
    hasCreate: false,
    hasAppStore: true,
    hasGooglePlay: true,
    appStoreKey: "tool.downloadTheAppStore",
    googlePlayKey: "tool.downloadTheGooglePlay",
    appStoreUrl: "https://apps.apple.com/us/app/matatacode/id1448969038",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=com.matatalab.matatacode",
  },
  {
    id: "talemap",
    name: "MatataCode<br/>(TaleMap)",
    icon: tool4Icon,
    titleKey: "tool.talemap.title",
    descKey: "tool.talemap.desc",
    hasCreate: false,
    hasDownloadClient: true,
    downloadClientUrl:
      "https://www.mediafire.com/file_premium/rz1j080mpbsdhus/MatataCode-TaleMap-v1.0.0-win-x64.exe/file",
  },
  {
    id: "matataxplore",
    name: "MatataXplore",
    icon: tool5Icon,
    titleKey: "tool.matataxplore.title",
    descKey: "tool.matataxplore.desc",
    hasCreate: false,
    hasMacOS: true,
    hasWindows: true,
    hasAppStore: true,
    hasGooglePlay: true,
    appStoreKey: "tool.downloadTheAppStore",
    googlePlayKey: "tool.downloadTheGooglePlay",
    macOSUrl:
      "https://rrrorwxhlpoolo5m.ldycdn.com/attachment/kijkKBliqnRllSnllimilrSR7ww7fgzb73r/MatataXplore.dmg",
    windowsUrl:
      "https://jjrorwxhlpoolo5m.ldycdn.com/attachment/kjjkKBliqnRllSnllipiljSR7ww7fgzb73r/MatataXplore.exe",
    appStoreUrl: "https://apps.apple.com/us/app/matataxplore/id6450284009",
    googlePlayUrl:
      "https://play.google.com/store/apps/details?id=com.matatalab.mtts&pli=1",
  },
];

const TOOL_VISUAL_META: Record<string, ToolVisualMeta> = {
  vincibot: {
    displayName: "MatataCode (VinciBot)",
    brandBg: "#0d1016",
    featuredLogo: tool1Icon,
    compactBg: "#eef2ff",
    compactShadow: "rgba(0, 91, 194, 0.12)",
  },
  nous: {
    displayName: "MatataCode (Nous)",
    brandBg: "#0f1824",
    featuredLogo: tool2Icon,
    compactBg: "#eef6ff",
    compactShadow: "rgba(0, 91, 194, 0.1)",
  },
  matatacode: {
    displayName: "MatataCode (Kids)",
    brandBg: "#121212",
    featuredLogo: "",
    compactBg: "#fff0f0",
    compactShadow: "rgba(236, 94, 94, 0.14)",
  },
  talemap: {
    displayName: "MatataCode (TaleMap)",
    brandBg: "#132236",
    featuredLogo: "",
    compactBg: "#eef4ff",
    compactShadow: "rgba(74, 115, 255, 0.14)",
  },
  matataxplore: {
    displayName: "MatataXplore",
    brandBg: "#171124",
    featuredLogo: "",
    compactBg: "#f4efff",
    compactShadow: "rgba(147, 99, 255, 0.16)",
  },
};

const featuredTools = computed(() => toolList.slice(0, 2));
const compactTools = computed(() => toolList.slice(2));

const getToolVisualMeta = (toolId: string) => TOOL_VISUAL_META[toolId];
const getToolDisplayName = (toolId: string) =>
  TOOL_VISUAL_META[toolId]?.displayName || toolId;
const getToolTitleParts = (toolId: string) => {
  const displayName = getToolDisplayName(toolId).replace(/<br\s*\/?>/gi, " ").trim();
  const match = displayName.match(/^(.*?)(\s*\([^()]+\))$/);

  if (!match) {
    return {
      main: displayName,
      subtitle: "",
    };
  }

  return {
    main: match[1].trim(),
    subtitle: match[2].trim(),
  };
};

const TOOL_ICON_SVGS = {
  action: {
    macOS: `
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="5" y="6" width="14" height="9.5" rx="1.8" stroke="currentColor" stroke-width="1.8"/>
        <path d="M3.5 18.2H20.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    windows: `
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.8"/>
        <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.8"/>
        <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.8"/>
        <rect x="13" y="13" width="6.5" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.8"/>
      </svg>
    `,
    client: `
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4.5" y="5.5" width="15" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/>
        <path d="M9.5 19H14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    tablet: `
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="7" y="3.8" width="10" height="16.4" rx="2.2" stroke="currentColor" stroke-width="1.8"/>
        <circle cx="12" cy="16.9" r="0.85" fill="currentColor"/>
      </svg>
    `,
    phone: `
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="8" y="3.5" width="8" height="17" rx="2.2" stroke="currentColor" stroke-width="1.8"/>
        <circle cx="12" cy="17.3" r="0.75" fill="currentColor"/>
      </svg>
    `,
    googlePlay: `
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M8 5.5L16.5 12L8 18.5V5.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M6 4.8L17.5 12L6 19.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.6"/>
      </svg>
    `,
  },
} as const;

const getActionIconSvg = (
  toolId: string,
  action: "macOS" | "windows" | "appStore" | "googlePlay" | "client"
) => {
  if (action === "appStore") {
    return toolId === "matatacode"
      ? TOOL_ICON_SVGS.action.tablet
      : TOOL_ICON_SVGS.action.phone;
  }

  return TOOL_ICON_SVGS.action[action];
};

const getToolCenterLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = toolCenterPageRef.value?.clientWidth || 0;
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

const syncToolCenterLayoutWidth = () => {
  toolCenterLayoutWidth.value = getToolCenterLayoutWidth();
};

const toolCenterShellWidth = computed(() => {
  if (toolCenterLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(toolCenterLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(toolCenterLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--tool-center-shell-width": toolCenterShellWidth.value,
}));

const showIframeModal = ref(false);
const currentIframeUrl = ref("");
const currentToolName = ref("");
const iframeLoading = ref(true);
const toolIframeRef = ref<HTMLIFrameElement | null>(null);
const currentToolCacheKey = ref("");
const currentToolOnlyCreate = ref(false);
const savedProjectZipCache = new Map<string, File>();

const downloadZipFile = (zipFile: File) => {
  const downloadUrl = URL.createObjectURL(zipFile);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = zipFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
};

const uploadWorkFileToOSS = async (file: File) =>
  uploadFileToOSS(file, "上传作品文件失败");
const uploadProjectFileToOSS = async (file: File) =>
  uploadFileToOSS(file, "上传模型文件失败");

const getToolAccessToken = async () => {
  const ssoData = await ssoLogin();
  const accessToken =
    (typeof ssoData === "string" ? ssoData : "") ||
    ssoData?.accessToken ||
    ssoData?.token ||
    ssoData?.access_token ||
    "";

  if (!accessToken) {
    throw new Error("获取工具Token失败");
  }

  return accessToken;
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

const getAiOptTypeFromMessage = (messageData: any, fallbackName = "") => {
  const toolKey = typeof messageData?.toolKey === "string" ? messageData.toolKey : "";
  const modelType =
    typeof messageData?.modelType === "string" ? messageData.modelType : "";
  const nameSource = [
    typeof messageData?.projectName === "string" ? messageData.projectName : "",
    typeof messageData?.fileName === "string" ? messageData.fileName : "",
    typeof messageData?.name === "string" ? messageData.name : "",
    fallbackName,
  ]
    .join(" ")
    .toLowerCase();

  const toolKeyMap: Record<string, string> = {
    imageClassModel: "image_cls",
    voiceClassModel: "audio_cls",
    poseClassModel: "pose_cls",
    gestureClassModel: "gesture_cls",
  };

  const modelTypeMap: Record<string, string> = {
    image: "image_cls",
    audio: "audio_cls",
    voice: "audio_cls",
    pose: "pose_cls",
    hand: "gesture_cls",
    gesture: "gesture_cls",
  };

  if (toolKeyMap[toolKey]) {
    return toolKeyMap[toolKey];
  }

  if (modelTypeMap[modelType]) {
    return modelTypeMap[modelType];
  }

  if (nameSource.includes("图像") || nameSource.includes("image")) {
    return "image_cls";
  }
  if (
    nameSource.includes("语音") ||
    nameSource.includes("audio") ||
    nameSource.includes("voice")
  ) {
    return "audio_cls";
  }
  if (nameSource.includes("姿态") || nameSource.includes("pose")) {
    return "pose_cls";
  }
  if (
    nameSource.includes("手势") ||
    nameSource.includes("gesture") ||
    nameSource.includes("hand")
  ) {
    return "gesture_cls";
  }

  return "";
};

const postCachedZipToIframe = async () => {
  return;
};

const handleIframeMessage = async (event: MessageEvent) => {
  if (
    !isMessageFromIframe({
      event,
      iframeWindow: toolIframeRef.value?.contentWindow,
      iframeUrl: currentIframeUrl.value,
    })
  ) {
    return;
  }

  console.log("收到工具 iframe 原始消息:", {
    origin: event.origin,
    data: event.data,
  });

  const messageData = parseMessageData(event.data) as any;
  const messageType = getMessageType(messageData);

  if (
    !messageData ||
    (typeof messageData !== "object" && typeof messageData !== "string")
  ) {
    return;
  }

  if (messageType === "send-tm-zip") {
    const zipPayload = pickMessagePayload(messageData, [
      "payload",
      "data",
      "file",
      "blob",
      "arrayBuffer",
      "result",
    ]);
    const zipFile = toZipFile(zipPayload);

    if (!zipFile) {
      console.warn(
        "收到 send-tm-zip 消息，但 payload 不是可转换的文件类型:",
        messageData
      );
      return;
    }

    if (currentToolCacheKey.value) {
      savedProjectZipCache.set(currentToolCacheKey.value, zipFile);
    }

    const normalizedMessageData = {
      ...messageData,
      payload: zipFile,
      zipFile,
    };

    console.log("收到工具 iframe send-tm-zip 消息:", normalizedMessageData);

    if (
      currentToolName.value.includes("VinciBot") ||
      currentToolName.value.includes("Nous")
    ) {
      try {
        const uploadFile = toUploadFile(zipPayload, pickMessageFileName(messageData));
        if (!uploadFile) {
          throw new Error("模型文件格式不正确");
        }

        const uploadResult = await uploadProjectFileToOSS(uploadFile);
        const userId = getCurrentUserId();
        const optType = getAiOptTypeFromMessage(messageData, uploadFile.name);
        const optName =
          (typeof messageData?.projectName === "string" &&
            messageData.projectName.trim()) ||
          uploadFile.name.replace(/\.[^.]+$/, "");

        if (!uploadResult?.ossId || !userId || !optType) {
          console.warn("工具中心创建模型参数缺失:", {
            ossId: uploadResult?.ossId,
            userId,
            optType,
            uploadFileName: uploadFile.name,
            rawData: messageData,
          });
          throw new Error("创建模型参数不完整");
        }

        console.log("工具中心创建模型参数:", {
          optName,
          optType,
          userId,
          ossId: uploadResult.ossId,
        });

        const createResult = await createAi({
          optName,
          optType,
          userId,
          ossId: uploadResult.ossId,
        });

        console.log("工具中心新建模型成功:", {
          uploadResult,
          createResult,
        });

        ElMessage.success("创建成功");
      } catch (error) {
        console.error("工具中心新建模型失败:", error);
        ElMessage.error(error instanceof Error ? error.message : "创建失败");
      }
    }

    window.dispatchEvent(
      new CustomEvent("tool-send-tm-zip", {
        detail: normalizedMessageData,
      })
    );

    return;
  }

  if (messageType === "send-works-sb3" || messageType === "send-works-mc") {
    const worksPayload = pickMessagePayload(messageData, [
      "payload",
      "data",
      "file",
      "blob",
      "arrayBuffer",
    ]) as any;

    const nestedPayload =
      worksPayload &&
      typeof worksPayload === "object" &&
      !(worksPayload instanceof File) &&
      !(worksPayload instanceof Blob) &&
      !(worksPayload instanceof ArrayBuffer) &&
      !ArrayBuffer.isView(worksPayload)
        ? worksPayload
        : null;

    const workFilePayload = nestedPayload
      ? messageType === "send-works-mc"
        ? nestedPayload.mc || nestedPayload.file || nestedPayload.payload
        : nestedPayload.sb3 || nestedPayload.file || nestedPayload.payload
      : worksPayload;

    const coverFile = nestedPayload?.cover instanceof File ? nestedPayload.cover : null;

    const workFile = toWorkFile(
      workFilePayload,
      pickMessageFileName(messageData),
      messageType === "send-works-mc" ? ".mc" : ".sb3"
    );

    if (!workFile) {
      console.warn(
        `收到 ${messageType} 消息，但作品文件不是可转换的文件类型:`,
        messageData
      );
      return;
    }

    if (!coverFile) {
      console.warn(`收到 ${messageType} 消息，但未找到 cover 图片文件:`, messageData);
      return;
    }

    const formData = createUploadFormData(workFile);

    const normalizedMessageData = {
      ...messageData,
      payload: workFile,
      workFile,
      coverFile,
      formData,
    };

    try {
      const uploadResult = await uploadWorkFileToOSS(workFile);
      const coverUploadResult = await uploadOSS(coverFile);

      const opusType = currentToolName.value.includes("VinciBot")
        ? "vinci"
        : currentToolName.value.includes("Nous")
        ? "nous"
        : "";

      if (!uploadResult?.ossId || !coverUploadResult?.ossId || !opusType) {
        throw new Error("作品保存参数不完整");
      }

      const opusName =
        (typeof messageData?.projectName === "string" &&
          messageData.projectName.trim()) ||
        workFile.name.replace(/\.[^.]+$/, "");

      const opusResult = await addOpus({
        opusName,
        opusOssId: String(uploadResult.ossId),
        coverOssId: String(coverUploadResult.ossId),
        opusType,
      });

      const uploadedMessageData = {
        ...normalizedMessageData,
        uploadResult,
        coverUploadResult,
        opusResult,
      };

      console.log(
        `收到工具 iframe ${messageType} 消息并上传 OSS 成功:`,
        uploadedMessageData
      );

      window.dispatchEvent(
        new CustomEvent(
          messageType === "send-works-mc" ? "tool-send-works-mc" : "tool-send-works-sb3",
          {
            detail: uploadedMessageData,
          }
        )
      );
    } catch (error) {
      console.error(`上传 ${messageType} 文件到 OSS 失败:`, error);
      ElMessage.error(error instanceof Error ? error.message : "上传作品文件失败");
    }

    return;
  }

  if (messageType !== "saveProject") {
    return;
  }

  const zipPayload = pickMessagePayload(messageData);
  const zipFile = toZipFile(zipPayload);
  if (!zipFile) {
    console.warn("收到 saveProject 消息，但 payload 不是可转换的文件类型:", messageData);
    return;
  }

  const formData = createUploadFormData(zipFile);

  const normalizedMessageData = {
    ...messageData,
    payload: zipFile,
    zipFile,
    formData,
  };

  if (currentToolCacheKey.value && !currentToolOnlyCreate.value) {
    savedProjectZipCache.set(currentToolCacheKey.value, zipFile);
  }

  console.log("收到工具 iframe saveProject 消息:", normalizedMessageData);

  try {
    downloadZipFile(zipFile);
    ElMessage.success(`项目已下载：${zipFile.name}`);
  } catch (error) {
    console.error("下载项目文件失败:", error);
    ElMessage.error("下载项目文件失败");
  }

  window.dispatchEvent(
    new CustomEvent("tool-save-project", {
      detail: normalizedMessageData,
    })
  );
};

const handleCreate = async (tool: Tool) => {
  if (!tool.createUrl) {
    return;
  }

  try {
    let url = tool.createUrl;

    if (tool.id === "vincibot") {
      const token = await getToolAccessToken();
      const lang = locale.value === "zh" ? "zh-CN" : "en";
      url = `${url}?token=${encodeURIComponent(token)}&lang=${lang}`;
    } else if (tool.id === "nous") {
      const token = await getToolAccessToken();
      const lang = locale.value === "zh" ? "zh" : "en";
      url = `${url}?token=${encodeURIComponent(token)}&lang=${lang}`;
    }

    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}ch=aiedu`;

    console.log("打开工具中心创建 iframe:", {
      toolId: tool.id,
      url,
    });

    currentIframeUrl.value = url;
    currentToolOnlyCreate.value = !!tool.onlyCreateFlow;
    if (tool.onlyCreateFlow) {
      savedProjectZipCache.delete(`tool:${tool.id}`);
      currentToolCacheKey.value = "";
    } else {
      currentToolCacheKey.value = `tool:${tool.id}`;
    }
    currentToolName.value = getToolDisplayName(tool.id);
    iframeLoading.value = true;
    showIframeModal.value = true;
  } catch (error) {
    console.error("获取工具SSO登录信息失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "获取工具Token失败");
  }
};

const onIframeLoad = () => {
  iframeLoading.value = false;
  window.setTimeout(() => {
    void postCachedZipToIframe();
  }, 300);
};

const closeIframeModal = () => {
  showIframeModal.value = false;
  currentIframeUrl.value = "";
  currentToolName.value = "";
  iframeLoading.value = true;
  currentToolOnlyCreate.value = false;
  currentToolCacheKey.value = "";
};

onMounted(() => {
  toggleToolOuterScroll(false);
  resetToolPageScroll();
  syncToolCenterLayoutWidth();
  window.addEventListener("resize", syncToolCenterLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncToolCenterLayoutWidth);
  if (window.ResizeObserver && toolCenterPageRef.value) {
    toolCenterResizeObserver = new window.ResizeObserver(() => {
      syncToolCenterLayoutWidth();
    });
    toolCenterResizeObserver.observe(toolCenterPageRef.value);
  }
  window.addEventListener("message", handleIframeMessage);
  setTimeout(() => {
    pageLoading.value = false;
  }, 300);
  window.requestAnimationFrame(() => {
    resetToolPageScroll();
  });
});

onBeforeUnmount(() => {
  toggleToolOuterScroll(false);
  window.removeEventListener("resize", syncToolCenterLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncToolCenterLayoutWidth);
  toolCenterResizeObserver?.disconnect();
  toolCenterResizeObserver = null;
  window.removeEventListener("message", handleIframeMessage);
});

const handleDownloadClient = (tool: Tool) => {
  console.log("Download Client:", tool.id);
  if (tool.id === "nous") {
    const lang = locale.value === "zh" ? "zh" : "en";
    window.open(`https://nous.matatastudio.com/?page=download&lang=${lang}`, "_blank");
    return;
  }
  if (tool.id === "vincibot") {
    const lang = locale.value === "zh" ? "zh-CN" : "en";
    window.open(
      `https://vinci.matatastudio.com/static/download.html?lang=${lang}`,
      "_blank"
    );
    return;
  }
  if (tool.downloadClientUrl) window.open(tool.downloadClientUrl, "_blank");
};

const handleDownloadMacOS = (tool: Tool) => {
  console.log("Download macOS:", tool.id);
  if (tool.macOSUrl) {
    window.location.href = tool.macOSUrl;
  }
};

const handleDownloadWindows = (tool: Tool) => {
  console.log("Download Windows:", tool.id);
  if (tool.windowsUrl) {
    window.location.href = tool.windowsUrl;
  }
};

const handleDownloadAppStore = (tool: Tool) => {
  console.log("Download App Store:", tool.id);
  if (tool.appStoreUrl) window.open(tool.appStoreUrl, "_blank");
};

const handleDownloadGooglePlay = (tool: Tool) => {
  console.log("Download Google Play:", tool.id);
  if (tool.googlePlayUrl) window.open(tool.googlePlayUrl, "_blank");
};
</script>

<style scoped>
.tool-icon-svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 0;
}

.tool-center-page {
  display: block;
  min-height: calc(100vh - 70px);
  padding: 28px 0 72px;
  background: #f8f9fa;
}

.tool-center-shell {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  gap: 32px;
  width: min(100%, 1440px, var(--tool-center-shell-width));
  margin: 0 auto;
  padding: 0 32px;
  box-sizing: border-box;
}

.tool-hero-banner {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 336px;
  overflow: hidden;
  border-radius: 24px;
  padding: 0 64px;
  background: linear-gradient(135deg, #005bc2 0%, #a4c1ff 100%);
  box-shadow: 0 18px 48px rgba(0, 91, 194, 0.16);
}

.tool-hero-banner__copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 620px;
  padding: 40px 0;
}

.tool-hero-banner__title {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  color: #ffffff;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 42px;
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -0.02em;
}

.tool-hero-banner__desc {
  max-width: 520px;
  margin: 20px 0 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 18px;
  line-height: 1.72;
}

.tool-hero-banner__visual {
  position: absolute;
  right: 20px;
  bottom: 0;
  width: min(52%, 680px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
}

.tool-hero-banner__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: right center;
  mix-blend-mode: normal;
  opacity: 1;
}

.tool-grid {
  display: grid;
  gap: 32px;
}

.tool-grid--featured {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.tool-grid--compact {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.tool-card {
  border: 1px solid rgba(174, 179, 181, 0.14);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(46, 51, 53, 0.05);
}

.tool-card--featured {
  padding: 36px 40px;
}

.tool-card--compact {
  display: flex;
  flex-direction: column;
  min-height: 360px;
  padding: 32px;
}

.tool-card--compact-xplore {
  padding: 28px 28px 26px;
}

.tool-card__featured-inner {
  display: flex;
  align-items: center;
  gap: 32px;
  min-height: 100%;
}

.tool-brand-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 160px;
  height: 160px;
  border-radius: 0;
  background: transparent;
}

.tool-brand-box > img {
  display: block;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  object-fit: contain;
}

.tool-brand-box__inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  height: 112px;
  box-sizing: border-box;
  overflow: hidden;
}

.tool-brand-box__inner img {
  width: 87px;
  height: 87px;
  object-fit: contain;
}

.tool-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  align-self: stretch;
}

.tool-card__title {
  margin: 0;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-weight: 800;
}

.tool-card__title-subtitle {
  display: inline;
}

.tool-card__title--featured .tool-card__title-subtitle {
  display: block;
}

.tool-card__title--featured {
  font-size: 30px;
  line-height: 1.18;
  letter-spacing: -0.02em;
}

.tool-card__title--compact {
  font-size: 26px;
  line-height: 1.24;
  text-align: center;
  letter-spacing: -0.02em;
}

.tool-card__desc {
  color: #5a6062;
}

.tool-card__desc--featured {
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.8;
}

.tool-card__desc--compact {
  min-height: 84px;
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.78;
  text-align: center;
}

.tool-card__featured-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: auto;
  padding-top: 28px;
}

.tool-card__featured-actions .tool-btn {
  flex: 1 1 160px;
}

.tool-card__compact-icon,
.tool-card__compact-icon-skeleton {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.tool-card__compact-icon-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  overflow: hidden;
}

.tool-card__compact-symbol-image {
  display: block;
  width: 87px;
  height: 87px;
  object-fit: contain;
}

.tool-card--compact-xplore .tool-card__compact-icon {
  margin-bottom: 20px;
}

.tool-card--compact-xplore .tool-card__compact-icon-inner {
  width: 88px;
  height: 88px;
}

.tool-card--compact-xplore .tool-card__compact-symbol-image {
  width: 87px;
  height: 87px;
}

.tool-card--compact-xplore .tool-card__desc--compact {
  min-height: 76px;
  margin-top: 14px;
}

.tool-card__compact-actions {
  display: grid;
  margin-top: auto;
}

.tool-card__compact-actions--stack {
  gap: 12px;
}

.tool-card__compact-actions--single {
  gap: 12px;
}

.tool-card__compact-actions--grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.tool-card--compact-xplore .tool-card__compact-actions--grid {
  gap: 10px;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 24px;
  border: 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.tool-btn:hover {
  transform: translateY(-2px);
}

.tool-btn--primary {
  min-width: 148px;
  background: #005bc2;
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(0, 91, 194, 0.18);
}

.tool-btn--primary:hover {
  background: #0050ab;
}

.tool-btn--soft,
.tool-btn--compact {
  background: #e5e9eb;
  color: #2e3335;
}

.tool-btn--soft {
  min-width: 148px;
}

.tool-btn--soft:hover,
.tool-btn--compact:hover {
  background: #dee3e5;
}

.tool-btn__icon {
  width: 20px;
  height: 20px;
}

.tool-card__compact-actions--stack .tool-btn--compact,
.tool-card__compact-actions--single .tool-btn--compact {
  width: 100%;
  justify-content: center;
}

.tool-card__compact-actions--grid .tool-btn--compact {
  flex-direction: column;
  min-height: 88px;
  padding: 12px 8px;
  gap: 6px;
  font-size: 12px;
  line-height: 1.35;
}

.tool-card--compact-xplore .tool-card__compact-actions--grid .tool-btn--compact {
  min-height: 80px;
  padding: 10px 8px;
  font-size: 14px;
}

.tool-card__compact-actions--grid .tool-btn__icon {
  width: 24px;
  height: 24px;
}

.tool-card--compact-xplore .tool-card__compact-actions--grid .tool-btn__icon {
  width: 22px;
  height: 22px;
}

.iframe-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(12, 15, 16, 0.45);
  backdrop-filter: blur(8px);
}

.iframe-modal-container {
  display: flex;
  flex-direction: column;
  width: min(1480px, calc(100vw - 48px));
  height: min(880px, calc(100vh - 48px));
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 24px 64px rgba(12, 15, 16, 0.18);
}

.iframe-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(174, 179, 181, 0.18);
  background: #fafbfc;
}

.iframe-modal-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.iframe-modal-title {
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.iframe-modal-desc {
  margin-top: 6px;
  color: #5a6062;
  font-size: 12px;
  line-height: 1.7;
}

.iframe-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: #edf1f4;
  color: #5a6062;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.iframe-close-btn:hover {
  background: #dee3e5;
  color: #2e3335;
}

.iframe-modal-body {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: #f8f9fa;
}

.tool-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.tool-iframe.hidden {
  position: absolute;
  opacity: 0;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #ffffff;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid rgba(174, 179, 181, 0.24);
  border-top-color: #005bc2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #5a6062;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 1600px) {
  .tool-center-shell {
    width: min(100%, 1360px, var(--tool-center-shell-width));
    padding: 0 24px;
  }

  .tool-hero-banner {
    min-height: 312px;
    padding: 0 48px;
  }

  .tool-hero-banner__title {
    font-size: 38px;
  }

  .tool-card--featured {
    padding: 32px;
  }

  .tool-brand-box {
    width: 144px;
    height: 144px;
  }

  .tool-brand-box__inner {
    width: 104px;
    height: 104px;
  }
}

@media (max-width: 1360px) {
  .tool-grid--featured {
    grid-template-columns: 1fr;
  }

  .tool-grid--compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .tool-hero-banner {
    min-height: 0;
    padding: 32px 28px 220px;
  }

  .tool-hero-banner__visual {
    width: 100%;
    height: 220px;
  }

  .tool-grid--compact {
    grid-template-columns: 1fr;
  }

  .tool-card--featured,
  .tool-card--compact {
    padding: 28px 24px;
  }

  .tool-card__featured-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }

  .tool-brand-box {
    width: 132px;
    height: 132px;
    margin: 0 auto;
  }

  .tool-card__title--featured,
  .tool-card__title--compact {
    text-align: center;
  }

  .tool-card__desc--featured {
    text-align: center;
  }

  .tool-card__featured-actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .tool-center-page {
    padding: 20px 0 40px;
  }

  .tool-center-shell {
    gap: 24px;
    padding: 0 16px;
  }

  .tool-hero-banner {
    border-radius: 20px;
    padding: 24px 20px 188px;
  }

  .tool-hero-banner__title {
    font-size: 30px;
  }

  .tool-hero-banner__desc {
    margin-top: 14px;
    font-size: 14px;
  }

  .tool-hero-banner__visual {
    height: 188px;
  }

  .tool-card {
    border-radius: 20px;
  }

  .tool-card--featured,
  .tool-card--compact {
    padding: 24px 20px;
  }

  .tool-card__title--featured {
    font-size: 24px;
  }

  .tool-card__title--compact {
    font-size: 22px;
  }

  .tool-card__desc--featured,
  .tool-card__desc--compact {
    font-size: 14px;
  }

  .tool-card__compact-actions--grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

<style>
html.tool-page-use-outer-scroll,
body.tool-page-use-outer-scroll {
  overflow-y: auto;
}

html.tool-page-use-outer-scroll .sidebar-shell,
body.tool-page-use-outer-scroll .sidebar-shell {
  height: auto;
  min-height: 100vh;
  overflow: visible;
}

html.tool-page-use-outer-scroll .sidebar-shell-body,
body.tool-page-use-outer-scroll .sidebar-shell-body {
  display: block;
  height: auto;
  min-height: 100vh;
}

html.tool-page-use-outer-scroll .sidebar-shell-main,
body.tool-page-use-outer-scroll .sidebar-shell-main,
html.tool-page-use-outer-scroll .sidebar-shell-content,
body.tool-page-use-outer-scroll .sidebar-shell-content {
  display: block;
  min-height: auto;
  overflow: visible;
}

html.tool-page-use-outer-scroll .app-sidebar,
body.tool-page-use-outer-scroll .app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 20;
}

html.tool-page-use-outer-scroll .sidebar-shell-main,
body.tool-page-use-outer-scroll .sidebar-shell-main {
  width: auto;
  margin-left: 264px;
  margin-right: 24px;
}

@media (min-width: 1280px) {
  html.tool-page-use-outer-scroll .sidebar-shell-main,
  body.tool-page-use-outer-scroll .sidebar-shell-main {
    margin-left: 328px;
    margin-right: 40px;
  }
}

@media (min-width: 1536px) {
  html.tool-page-use-outer-scroll .sidebar-shell-main,
  body.tool-page-use-outer-scroll .sidebar-shell-main {
    margin-left: 416px;
    margin-right: 68px;
  }
}
</style>
