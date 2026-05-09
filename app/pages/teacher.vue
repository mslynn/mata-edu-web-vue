<template>
  <div ref="teacher2PageRef" class="teacher2-page" :style="pageAdaptiveStyle">
    <div class="teacher2-container">
      <TeacherSidebar />

      <div class="teacher2-content">
        <header class="teacher2-topbar" aria-hidden="true"></header>

        <main class="teacher2-main">
          <section class="teacher2-hero-grid">
            <article class="teacher2-hero" :style="heroBackgroundStyle">
              <div class="teacher2-hero__copy">
                <h1 class="teacher2-hero__title">
                  <span class="teacher2-hero__title-line">欢迎回来，开启今天的</span>
                  <span class="teacher2-hero__title-line">智慧教学之旅</span>
                </h1>
                <p class="teacher2-hero__desc">
                  您的 AI 助教已经准备就绪，随时为您提供课程支持。
                </p>

                <div class="teacher2-hero__actions">
                  <button
                    v-for="action in heroActions"
                    :key="action.key"
                    type="button"
                    class="teacher2-hero__button"
                    :class="{ 'teacher2-hero__button--primary': action.primary }"
                    @click="handleHeroAction(action.key)"
                  >
                    <span class="material-symbols-outlined teacher2-hero__button-icon">
                      {{ action.icon }}
                    </span>
                    <span>{{ action.label }}</span>
                  </button>
                </div>
              </div>

              <div class="teacher2-hero__visual" aria-hidden="true"></div>

              <div class="teacher2-hero__glow teacher2-hero__glow--top"></div>
              <div class="teacher2-hero__glow teacher2-hero__glow--bottom"></div>
            </article>

            <div class="teacher2-stats">
              <article
                v-for="item in statCards"
                :key="item.label"
                class="teacher2-stat-card"
              >
                <div
                  class="teacher2-stat-card__icon-wrap"
                  :style="{ background: item.background }"
                >
                  <span
                    class="material-symbols-outlined teacher2-stat-card__icon"
                    :style="{ color: item.color }"
                  >
                    {{ item.icon }}
                  </span>
                </div>
                <p class="teacher2-stat-card__label">{{ item.label }}</p>
                <p class="teacher2-stat-card__value">{{ item.value }}</p>
              </article>
            </div>
          </section>

          <section class="teacher2-section">
            <div class="teacher2-section__header">
              <div>
                <h2 class="teacher2-section__title">工具中心</h2>
                <p class="teacher2-section__subtitle">配套智能教具，激发无限创意</p>
              </div>

              <button
                type="button"
                class="teacher2-section__link"
                @click="goToToolCenter"
              >
                <span>查看全部</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div class="teacher2-tool-grid">
              <article
                v-for="item in toolCards"
                :key="item.key"
                class="teacher2-tool-card"
                @click="handleOpenTool(item.key)"
              >
                <div class="teacher2-tool-card__media">
                  <img
                    :src="item.image"
                    :alt="item.title"
                    class="teacher2-tool-card__logo"
                  />
                </div>

                <div class="teacher2-tool-card__content">
                  <h3 class="teacher2-tool-card__title">
                    {{ item.title }}
                    <span class="teacher2-tool-card__subtitle">{{ item.subtitle }}</span>
                  </h3>
                  <p class="teacher2-tool-card__desc">{{ item.desc }}</p>
                </div>
              </article>
            </div>
          </section>

          <section class="teacher2-section">
            <div class="teacher2-section__header">
              <div>
                <h2 class="teacher2-section__title">AI 实践中心</h2>
                <p class="teacher2-section__subtitle">通过机器学习，让机器变得更“聪明”</p>
              </div>

              <button type="button" class="teacher2-section__link" @click="goToAICenter">
                <span>查看全部</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div class="teacher2-ai-grid">
              <article
                v-for="item in aiCards"
                :key="item.key"
                class="teacher2-ai-card"
                @click="handleOpenAIModal(item.key)"
              >
                <div
                  class="teacher2-ai-card__cover"
                  :style="{ background: item.background }"
                >
                  <img
                    :src="item.image"
                    :alt="item.title"
                    class="teacher2-ai-card__image"
                  />
                  <div
                    class="teacher2-ai-card__overlay"
                    :style="{ background: item.overlay }"
                  ></div>
                </div>

                <div class="teacher2-ai-card__body">
                  <h3 class="teacher2-ai-card__title">{{ item.title }}</h3>
                </div>
              </article>
            </div>
          </section>

          <section class="teacher2-section teacher2-section--record">
            <div class="teacher2-section__header teacher2-section__header--record">
              <div>
                <h2 class="teacher2-section__title">授课记录</h2>
                <p class="teacher2-section__subtitle">
                  延续您的教学进度，高效开展后续课程
                </p>
              </div>
            </div>

            <div class="teacher2-filter-row">
              <div class="teacher2-filter-row__main">
                <MSelect
                  v-model="selectedClassId"
                  :options="classOptions"
                  placeholder="暂无班级"
                  :style="classSelectStyle"
                  class="teacher2-custom-select teacher2-custom-select--class"
                  dropdown-class="teacher2-custom-dropdown"
                />

                <MSelect
                  v-model="selectedCourseId"
                  :options="courseOptions"
                  placeholder="暂无课程"
                  :style="courseSelectStyle"
                  class="teacher2-custom-select teacher2-custom-select--course"
                  dropdown-class="teacher2-custom-dropdown"
                />
              </div>

              <button
                type="button"
                class="teacher2-login-btn teacher2-login-btn--inline"
                @click="handleQuickLoginBtnClick"
              >
                <span class="material-symbols-outlined">key</span>
                <span>班级码登录</span>
              </button>
            </div>

            <div v-if="recordEmptyState" class="teacher2-record-empty">
              <div class="teacher2-record-empty__icon-wrap">
                <span class="material-symbols-outlined teacher2-record-empty__icon">
                  {{ recordEmptyState.icon }}
                </span>
              </div>
              <h3 class="teacher2-record-empty__title">{{ recordEmptyState.title }}</h3>
              <p class="teacher2-record-empty__desc">
                {{ recordEmptyState.description }}
              </p>
            </div>

            <div v-else class="teacher2-record-grid">
              <article class="teacher2-cover-card" @click="goToCourse">
                <img
                  :src="recordLessonCover"
                  :alt="recordLessonCoverAlt"
                  class="teacher2-cover-card__image"
                />
                <div class="teacher2-cover-card__mask"></div>
              </article>

              <div class="teacher2-lesson-grid">
                <article
                  v-for="item in lessonCards"
                  :key="item.chapterId"
                  class="teacher2-lesson-card"
                >
                  <div class="teacher2-lesson-card__order">{{ item.order }}</div>
                  <div class="teacher2-lesson-card__status" :class="`is-${item.status}`">
                    {{ item.statusText }}
                  </div>

                  <h3 class="teacher2-lesson-card__title">{{ item.title }}</h3>

                  <div class="teacher2-lesson-card__actions">
                    <button
                      type="button"
                      class="teacher2-lesson-card__button teacher2-lesson-card__button--primary"
                      @click="handleLessonTeach(item)"
                    >
                      去上课
                    </button>
                    <button
                      type="button"
                      class="teacher2-lesson-card__button teacher2-lesson-card__button--secondary"
                      @click="handleLessonPrepare(item)"
                    >
                      去备课
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>

    <StartClassModal
      v-model:visible="showStartClassModal"
      :class-list="startClassData.classList"
      :course-list="startClassData.courseList"
      :course-tree="startClassData.courseTree"
      :initial-course-id="startClassData.initialCourseId"
      :initial-chapter-id="startClassData.initialChapterId"
      theme="teacher2"
      ref="startClassModalRef"
      @class-change="handleClassChange"
      @course-change="handleCourseChange"
      @confirm="handleStartClassConfirm"
    />

    <Teleport to="body">
      <div
        v-if="showAIModelSelectModal"
        class="teacher2-ai-modal"
        @click="closeAIModelSelectModal"
      >
        <div
          class="teacher2-ai-modal__panel teacher2-ai-modal__panel--select"
          @click.stop
        >
          <div class="teacher2-ai-modal__header">
            <span class="teacher2-ai-modal__title">{{
              currentAIModel?.title || ""
            }}</span>
            <button
              type="button"
              class="teacher2-ai-modal__close"
              @click="closeAIModelSelectModal"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="teacher2-ai-modal__body teacher2-ai-modal__body--select">
            <div class="teacher2-ai-modal__section">
              <div class="teacher2-ai-modal__section-head">
                <div>
                  <div class="teacher2-ai-modal__section-title">新建模型</div>
                  <div class="teacher2-ai-modal__section-desc">
                    创建一个新的 AI 实践模型项目
                  </div>
                </div>
                <button
                  type="button"
                  class="teacher2-ai-modal__confirm"
                  @click="openAICreateModal"
                >
                  新建项目
                </button>
              </div>
            </div>

            <div class="teacher2-ai-modal__section">
              <div
                class="teacher2-ai-modal__section-head teacher2-ai-modal__section-head--stack"
              >
                <div class="teacher2-ai-modal__section-title-row">
                  <div class="teacher2-ai-modal__section-title">我的模型</div>
                  <span v-if="savedAIModels.length" class="teacher2-ai-modal__count">
                    {{ savedAIModels.length }}
                  </span>
                </div>
                <div class="teacher2-ai-modal__section-desc">
                  可继续编辑已创建的模型项目
                </div>
              </div>

              <div v-if="savedAIModelsLoading" class="teacher2-ai-modal__empty">
                加载中...
              </div>
              <div v-else-if="!savedAIModels.length" class="teacher2-ai-modal__empty">
                暂无模型
              </div>
              <div v-else class="teacher2-ai-model-grid">
                <article
                  v-for="item in savedAIModels"
                  :key="item.id"
                  class="teacher2-ai-model-card"
                  @click="handleOpenAISavedModel(item)"
                >
                  <button
                    type="button"
                    class="teacher2-ai-model-card__delete"
                    @click.stop="handleDeleteAISavedModel(item)"
                  >
                    删除
                  </button>
                  <div class="teacher2-ai-model-card__cover">
                    <img :src="getSavedAIModelCover(item.toolKey)" alt="" />
                  </div>
                  <div class="teacher2-ai-model-card__body">
                    <div class="teacher2-ai-model-card__name">{{ item.name }}</div>
                    <div class="teacher2-ai-model-card__time">
                      {{ item.updatedAt ? formatSavedAIModelTime(item.updatedAt) : "-" }}
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div class="teacher2-ai-modal__footer teacher2-ai-modal__footer--single">
            <button
              type="button"
              class="teacher2-ai-modal__cancel"
              @click="closeAIModelSelectModal"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      <div v-if="showAICreateModal" class="teacher2-ai-modal" @click="closeAICreateModal">
        <div class="teacher2-ai-modal__panel" @click.stop>
          <div class="teacher2-ai-modal__header">
            <span class="teacher2-ai-modal__title">
              新建{{ currentAIModel?.title || "AI 模型" }}
            </span>
            <button
              type="button"
              class="teacher2-ai-modal__close"
              @click="closeAICreateModal"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="teacher2-ai-modal__body">
            <label class="teacher2-ai-modal__field">
              <span class="teacher2-ai-modal__label">模型名称</span>
              <input
                v-model="aiModelName"
                type="text"
                class="teacher2-ai-modal__input"
                placeholder="请输入模型名称"
                @keyup.enter="handleAIConfirm"
              />
            </label>
          </div>

          <div class="teacher2-ai-modal__footer">
            <button
              type="button"
              class="teacher2-ai-modal__cancel"
              @click="closeAICreateModal"
            >
              取消
            </button>
            <button
              type="button"
              class="teacher2-ai-modal__confirm"
              @click="handleAIConfirm"
            >
              确定
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showQuickLoginModal"
        class="teacher2-quick-modal"
        @click="showQuickLoginModal = false"
      >
        <div class="teacher2-quick-modal__panel" @click.stop>
          <div class="teacher2-quick-modal__header">
            <span class="teacher2-quick-modal__title">班级码登录</span>
            <button
              type="button"
              class="teacher2-quick-modal__close"
              @click="showQuickLoginModal = false"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="teacher2-quick-modal__body">
            <p class="teacher2-quick-modal__tip">请选择要生成班级码的班级</p>

            <div v-if="quickLoginLoading" class="teacher2-quick-modal__empty">
              加载中...
            </div>
            <div v-else class="teacher2-quick-modal__list">
              <button
                v-for="item in quickLoginClassList"
                :key="item.classId"
                type="button"
                class="teacher2-quick-modal__item"
                :class="{ 'is-selected': selectedQuickLoginClassId === item.classId }"
                @click="selectedQuickLoginClassId = item.classId"
              >
                <span>{{ item.className }}</span>
                <span
                  v-if="selectedQuickLoginClassId === item.classId"
                  class="material-symbols-outlined teacher2-quick-modal__item-check"
                >
                  check
                </span>
              </button>
              <div v-if="!quickLoginClassList.length" class="teacher2-quick-modal__empty">
                暂无班级
              </div>
            </div>
          </div>

          <div class="teacher2-quick-modal__footer">
            <button
              type="button"
              class="teacher2-quick-modal__button teacher2-quick-modal__button--ghost"
              @click="showQuickLoginModal = false"
            >
              取消
            </button>
            <button
              type="button"
              class="teacher2-quick-modal__button teacher2-quick-modal__button--primary"
              :disabled="!selectedQuickLoginClassId"
              @click="handleQuickLoginConfirm"
            >
              创建
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showQuickLoginResultModal"
        class="teacher2-quick-modal"
        @click="showQuickLoginResultModal = false"
      >
        <div
          class="teacher2-quick-modal__panel teacher2-quick-modal__panel--result"
          @click.stop
        >
          <div class="teacher2-quick-modal__header">
            <span class="teacher2-quick-modal__title">班级码登录</span>
            <button
              type="button"
              class="teacher2-quick-modal__close"
              @click="showQuickLoginResultModal = false"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="teacher2-quick-modal__body teacher2-quick-modal__body--result">
            <div class="teacher2-quick-modal__result-title">快捷登录方式已生成</div>
            <div class="teacher2-quick-modal__result-class">
              {{ quickLoginResultData.className }}
            </div>
            <div class="teacher2-quick-modal__result-expire">
              有效期至 {{ quickLoginResultData.expirationDate || "-" }}
            </div>

            <div class="teacher2-quick-modal__result-card">
              <div class="teacher2-quick-modal__result-row">
                班级码：{{ quickLoginResultData.classCode || "-" }}
              </div>
              <div class="teacher2-quick-modal__result-row">
                统一密码：{{ quickLoginResultData.classCodePwd || "-" }}
              </div>
              <button
                type="button"
                class="teacher2-quick-modal__copy"
                @click="copyQuickLoginInfo"
              >
                <span class="material-symbols-outlined">content_copy</span>
                <span>复制</span>
              </button>
            </div>
          </div>

          <div class="teacher2-quick-modal__footer">
            <button
              type="button"
              class="teacher2-quick-modal__button teacher2-quick-modal__button--primary"
              @click="goToClassPage"
            >
              查看登录状态
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showToolIframeModal"
        class="teacher2-iframe-modal"
        @click.self="closeToolIframeModal"
      >
        <div class="teacher2-iframe-modal__panel">
          <div class="teacher2-iframe-modal__header">
            <span class="teacher2-iframe-modal__title">{{ currentToolName }}</span>
            <button
              type="button"
              class="teacher2-iframe-modal__close"
              @click="closeToolIframeModal"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="teacher2-iframe-modal__body">
            <div v-if="toolIframeLoading" class="teacher2-iframe-modal__loading">
              <div class="teacher2-iframe-modal__spinner"></div>
              <span>加载中...</span>
            </div>

            <iframe
              ref="toolIframeRef"
              :src="currentToolUrl"
              class="teacher2-tool-iframe"
              :class="{ 'is-hidden': toolIframeLoading }"
              frameborder="0"
              allowfullscreen
              allow="camera; microphone; bluetooth; serial"
              @load="onToolIframeLoad"
            ></iframe>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import tool1Icon from "~/assets/images/tool1.png";
import tool2Icon from "~/assets/images/tool2.png";
import tool4Icon from "~/assets/images/too4.png";
import aiCover1 from "~/assets/images/1.svg";
import aiCover2 from "~/assets/images/2.svg";
import aiCover3 from "~/assets/images/3.svg";
import aiCover4 from "~/assets/images/4.svg";
import heroBannerIllustration from "~/assets/images/banner.svg";
import { ElMessageBox } from "element-plus";
import { aiAdmin } from "~/composables/api/ai";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";
import { useAuth } from "~/composables/api/useAuth";
import { useTeacher } from "~/composables/api/useTeacher";
import { ElMessage } from "~/components/ui";
import { useI18n } from "vue-i18n";

definePageMeta({
  layout: "blank",
});

useHead({
  title: "智慧教育云平台 - 首页",
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href:
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600&display=swap",
    },
    {
      rel: "preload",
      href: "/fonts/material-symbols-outlined-teacher2.woff2",
      as: "font",
      type: "font/woff2",
      crossorigin: "",
    },
  ],
});

const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const { locale, t } = useI18n();
const { user } = useAuth();
const { ssoLogin, getAiList, createAi, updateAi, deleteAi, deleteOss } = aiAdmin();
const {
  getTeachList,
  getQuickLoginInfo,
  createQuickLogin,
  getTeacherStats,
  getClassListNoPage,
  getCourseMenuTree,
  getTeachChapterList,
  beginClass,
} = useTeacher();
const {
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  toZipFile,
  toUploadFile,
  uploadFileToOSS,
  downloadFileFromOSS,
  isMessageFromIframe,
  postFileBufferToIframe,
} = useIframeFileBridge();

onMounted(async () => {
  void loadTeacherStats();
  void loadTeachList();
  void refreshQuickLoginInfo();
});

onMounted(() => {
  if (typeof window === "undefined") return;
  syncTeacher2LayoutWidth();
  window.addEventListener("resize", syncTeacher2LayoutWidth);
  window.visualViewport?.addEventListener("resize", syncTeacher2LayoutWidth);
  if (window.ResizeObserver && teacher2PageRef.value) {
    teacher2PageResizeObserver = new window.ResizeObserver(() => {
      syncTeacher2LayoutWidth();
    });
    teacher2PageResizeObserver.observe(teacher2PageRef.value);
  }
  window.addEventListener("message", handleToolIframeMessage);
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("resize", syncTeacher2LayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncTeacher2LayoutWidth);
  teacher2PageResizeObserver?.disconnect();
  teacher2PageResizeObserver = null;
  window.removeEventListener("message", handleToolIframeMessage);
});

type HeroAction = {
  key: "teach" | "prepare" | "task";
  label: string;
  icon: string;
  primary?: boolean;
};

type StatCard = {
  label: string;
  value: string;
  icon: string;
  background: string;
  color: string;
};

type ToolCard = {
  key: "vincibot" | "nous" | "talemap";
  title: string;
  subtitle: string;
  desc: string;
  image: string;
};

type TeacherAIKey =
  | "imageClassModel"
  | "gestureClassModel"
  | "voiceClassModel"
  | "poseClassModel";

type AICard = {
  key: TeacherAIKey;
  title: string;
  image: string;
  background: string;
  overlay: string;
};

type TeacherAICardItem = {
  key: TeacherAIKey;
  title: string;
  image: string;
};

type SavedAITeacherModelListItem = {
  id: string;
  toolKey: TeacherAIKey;
  name: string;
  updatedAt: number;
  fileName: string;
  mimeType: string;
  size: number;
  ossId?: string;
  optType?: string;
  url?: string;
};

type LessonCard = {
  chapterId: string;
  order: string;
  title: string;
  statusText: string;
  status: "finished" | "pending" | "last" | "ongoing";
  chapter: ChapterItem;
};

type CourseItem = {
  courseId: string;
  courseName: string;
  courseCoverUrl: string;
};

type TeachRecordClassItem = {
  classId: string;
  className: string;
  gradeName?: string;
  courseList: CourseItem[];
};

type ChapterItem = {
  chapterId: string;
  chapterName: string;
  teachStatus: number;
  isLatestTeach: number;
};

type SelectOption = {
  value: string;
  label: string;
};

type RecordEmptyState = {
  title: string;
  description: string;
  icon: string;
};

type QuickLoginInfoState = {
  classCode: string;
  classCodePwd: string;
  expirationDate: string;
};

type TeacherStatsState = {
  classCount: number;
  opusCount: number;
  studentCount: number;
  teachHours: number;
};

const heroIllustration = heroBannerIllustration;
const heroBackgroundStyle = {
  "--teacher2-hero-art": `url("${heroIllustration}")`,
};
const teacher2PageRef = ref<HTMLElement | null>(null);
let teacher2PageResizeObserver: ResizeObserver | null = null;
const teacher2LayoutWidth = ref(1360);

// 使用浏览器窗口外层宽度作为参考宽度，尽量不受页面缩放影响。
// 这样 75% / 80% / 90% / 100% 会保持同一套布局比例，只由浏览器负责整体放大缩小；
// 当缩放后可视区域真的放不下时，再交给页面横向滚动，而不是重新切版。
const getTeacher2LayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = teacher2PageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth =
    outerWidth ||
    innerWidth ||
    clientWidth ||
    1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(width => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const syncTeacher2LayoutWidth = () => {
  teacher2LayoutWidth.value = getTeacher2LayoutWidth();
};

const teacher2ShellWidth = computed(() => {
  if (teacher2LayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(teacher2LayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(teacher2LayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--teacher2-shell-width": teacher2ShellWidth.value,
}));

const lessonCover =
  "https://lh3.googleusercontent.com/aida/ADBb0ui6IdgX373LRvMlzFkxxWAcVCEDPGVAo6YHY60SB_HHfqSMpC-BxbKS-2vgfs-u4t9NzrQxKK0WuRHx_eFvZroagvyEEGldid4Bi3ZvI7Ng1gQYa6mRZZ2xE8Oacmd26H8wgaUzgOAQXrVrLoiTxVjESnb3mpIDRc1_TfC5-EB-QNvqzTPXi9CgygpQwESgK_9YfwTfQlDi3Jh-F1iwZahTITiuqmeHBohqbUKretpgAK_7eEJ3VNbQQJwIbaSgYcfOJyL70w";

const createDefaultTeacherStats = (): TeacherStatsState => ({
  classCount: 0,
  opusCount: 0,
  studentCount: 0,
  teachHours: 0,
});

const teacherStatsState = ref<TeacherStatsState>(createDefaultTeacherStats());

const loadTeacherStats = async () => {
  try {
    const data = await getTeacherStats();
    teacherStatsState.value = {
      classCount: Number(data?.classCount ?? 0),
      opusCount: Number(data?.opusCount ?? 0),
      studentCount: Number(data?.studentCount ?? 0),
      teachHours: Number(data?.teachHours ?? 0),
    };
  } catch (error) {
    console.error("teacher2 获取教师统计失败:", error);
    teacherStatsState.value = createDefaultTeacherStats();
  }
};

const heroActions: HeroAction[] = [
  { key: "teach", label: "去上课", icon: "play_circle", primary: true },
  { key: "prepare", label: "去备课", icon: "edit_note" },
  { key: "task", label: "任务管理", icon: "assignment" },
];

const statCards = computed<StatCard[]>(() => [
  {
    label: "班级数",
    value: String(teacherStatsState.value.classCount),
    icon: "groups",
    background: "#E4DFFF",
    color: "#5948D3",
  },
  {
    label: "授课课时",
    value: String(teacherStatsState.value.teachHours),
    icon: "history_edu",
    background: "#A4C1FF",
    color: "#005BC2",
  },
  {
    label: "提交作品数",
    value: String(teacherStatsState.value.opusCount),
    icon: "palette",
    background: "#FFA44F",
    color: "#904E00",
  },
  {
    label: "学生人数",
    value: String(teacherStatsState.value.studentCount),
    icon: "person_pin",
    background: "rgba(245, 105, 101, 0.2)",
    color: "#AC3434",
  },
]);

type OngoingClassroomInfo = {
  classId: string;
  courseId: string;
  chapterId: string;
  expireAt?: number;
};

const getStoredOngoingClassroom = (): OngoingClassroomInfo | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("ongoing_classroom");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    const classId = String(parsed?.classId || "").trim();
    const courseId = String(parsed?.courseId || "").trim();
    const chapterId = String(parsed?.chapterId || "").trim();
    const expireAt = Number(parsed?.expireAt || 0);

    if (!classId || !courseId || !chapterId) {
      localStorage.removeItem("ongoing_classroom");
      return null;
    }

    if (expireAt && Date.now() > expireAt) {
      localStorage.removeItem("ongoing_classroom");
      return null;
    }

    return {
      classId,
      courseId,
      chapterId,
      expireAt: expireAt || undefined,
    };
  } catch {
    localStorage.removeItem("ongoing_classroom");
    return null;
  }
};

const clearStoredOngoingClassroom = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ongoing_classroom");
};

const buildTeacherClassroomUrl = (info: {
  classId: string;
  courseId: string;
  chapterId: string;
  className?: string;
  autoQuickLogin?: boolean;
}) => {
  const className = encodeURIComponent(info.className || "");
  const autoQuickLoginQuery = info.autoQuickLogin ? "&autoQuickLogin=1" : "";
  return `/system/classroom/${info.chapterId}?classId=${info.classId}&className=${className}&courseId=${info.courseId}&from=teacher${autoQuickLoginQuery}`;
};

const ongoingClassroomBlockedMessage = "需先结束当前课程才能开始新的课程";
const TEACHER_QUICK_LOGIN_STORAGE_KEY = "teacher_quick_login_info";

const verifyOngoingClassroom = async () => {
  const stored = getStoredOngoingClassroom();
  if (!stored) return null;

  try {
    const data = await getTeachChapterList(stored.courseId, stored.classId);
    const chapters = Array.isArray(data) ? data : [];
    const matched = chapters.find(
      (item: any) =>
        String(item?.chapterId || "") === stored.chapterId &&
        Number(item?.teachStatus ?? -1) === 1
    );

    if (matched) {
      return stored;
    }

    clearStoredOngoingClassroom();
    return null;
  } catch (error) {
    console.error("teacher2 校验进行中课堂失败:", error);
    return null;
  }
};

const ensureNoOngoingClassroomBeforeStart = async (target: {
  classId: string;
  courseId: string;
  chapterId: string;
}) => {
  const ongoing = await verifyOngoingClassroom();
  if (!ongoing) return true;

  const sameTarget =
    ongoing.classId === target.classId &&
    ongoing.courseId === target.courseId &&
    ongoing.chapterId === target.chapterId;

  const ongoingClassName = getResolvedClassNameById(ongoing.classId);

  if (sameTarget) {
    navigateTo(
      buildTeacherClassroomUrl({
        ...ongoing,
        className: ongoingClassName,
      })
    );
    return false;
  }

  ElMessage.error(ongoingClassroomBlockedMessage);
  return false;
};

const goToLessons = () => {
  router.push("/lessons");
};

const handleGoToTask = () => {
  router.push("/taskmanagement");
};

const teachList = ref<TeachRecordClassItem[]>([]);
const teachListLoading = ref(false);
const selectedClassId = ref("");
const selectedCourseId = ref("");
const selectedChapterId = ref("");
const chapterList = ref<ChapterItem[]>([]);

const createEmptyQuickLoginInfo = (): QuickLoginInfoState => ({
  classCode: "",
  classCodePwd: "",
  expirationDate: "",
});

const normalizeQuickLoginInfo = (data?: any): QuickLoginInfoState => ({
  classCode: data?.classCode || "",
  classCodePwd: data?.classCodePwd || "",
  expirationDate: data?.expirationDate || "",
});

const quickLoginInfo = ref<QuickLoginInfoState>(createEmptyQuickLoginInfo());
const showQuickLoginModal = ref(false);
const quickLoginClassList = ref<{ classId: string; className: string }[]>([]);
const selectedQuickLoginClassId = ref<string | null>(null);
const quickLoginLoading = ref(false);
const showQuickLoginResultModal = ref(false);
const quickLoginResultData = ref({
  className: "",
  classCode: "",
  classCodePwd: "",
  expirationDate: "",
});

const loadTeachList = async () => {
  teachListLoading.value = true;

  try {
    const data = await getTeachList();
    const list = Array.isArray(data) ? data : [];
    teachList.value = list
      .map((item: any) => ({
        classId: String(item.classId || "").trim(),
        className: String(item.className || "").trim(),
        gradeName: item.gradeName || "",
        courseList: Array.isArray(item.courseList)
          ? item.courseList
              .map((course: any) => ({
                courseId: String(course?.courseId || "").trim(),
                courseName: String(course?.courseName || "").trim(),
                courseCoverUrl: course?.courseCoverUrl || "",
              }))
              .filter((course: CourseItem) => course.courseId && course.courseName)
          : [],
      }))
      .filter((item: TeachRecordClassItem) => item.classId && item.className);
  } catch (error) {
    console.error("teacher2 加载授课记录失败:", error);
    teachList.value = [];
  } finally {
    teachListLoading.value = false;
  }
};

const refreshQuickLoginInfo = async () => {
  try {
    const data = await getQuickLoginInfo();
    quickLoginInfo.value = normalizeQuickLoginInfo(data);
  } catch (error) {
    console.error("teacher2 获取快捷登录信息失败:", error);
    quickLoginInfo.value = createEmptyQuickLoginInfo();
  }
};

const syncTeacherQuickLoginCache = (data?: Partial<QuickLoginInfoState> | null) => {
  if (typeof window === "undefined") {
    return;
  }

  const classCode = String(
    data?.classCode || quickLoginInfo.value.classCode || ""
  ).trim();
  if (!classCode) {
    localStorage.removeItem(TEACHER_QUICK_LOGIN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    TEACHER_QUICK_LOGIN_STORAGE_KEY,
    JSON.stringify({
      classCode,
      classCodePwd: String(data?.classCodePwd || quickLoginInfo.value.classCodePwd || ""),
      expirationDate: String(
        data?.expirationDate || quickLoginInfo.value.expirationDate || ""
      ),
      expireAt: Date.now() + 2 * 60 * 60 * 1000,
    })
  );
};

const getResolvedClassNameById = (classId: string) => {
  return (
    startClassData.classList.find((item) => item.classId === classId)?.className ||
    teachList.value.find((item) => item.classId === classId)?.className ||
    ""
  );
};

const classOptions = computed<SelectOption[]>(() => {
  return teachList.value.map((item) => ({
    value: item.classId,
    label: item.className,
  }));
});

const courseOptions = computed<SelectOption[]>(() => {
  const currentClass = teachList.value.find(
    (item) => item.classId === selectedClassId.value
  );
  if (!currentClass?.courseList?.length) {
    return [];
  }

  return currentClass.courseList.map((item) => ({
    value: item.courseId,
    label: item.courseName,
  }));
});

const estimateSelectTextUnits = (text: string) => {
  return Array.from(String(text || "")).reduce((total, char) => {
    return total + (/[ -~]/.test(char) ? 0.65 : 1);
  }, 0);
};

const buildAdaptiveSelectStyle = (
  options: SelectOption[],
  placeholder: string,
  minWidth: number,
  maxWidth: number
) => {
  const labels = options.map((item) => item.label).filter(Boolean);
  const longestLabel = labels.reduce((longest, label) => {
    return estimateSelectTextUnits(label) > estimateSelectTextUnits(longest)
      ? label
      : longest;
  }, placeholder);
  const estimatedWidth = Math.round(estimateSelectTextUnits(longestLabel) * 16 + 78);
  const width = Math.min(Math.max(estimatedWidth, minWidth), maxWidth);

  return {
    width: `${width}px`,
    minWidth: `${width}px`,
  };
};

const classSelectStyle = computed(() =>
  buildAdaptiveSelectStyle(classOptions.value, "暂无班级", 180, 240)
);

const courseSelectStyle = computed(() =>
  buildAdaptiveSelectStyle(courseOptions.value, "暂无课程", 220, 360)
);

const selectedClassName = computed(() => {
  return (
    teachList.value.find((item) => item.classId === selectedClassId.value)?.className ||
    ""
  );
});

const selectedCourse = computed<CourseItem | null>(() => {
  const currentClass = teachList.value.find(
    (item) => item.classId === selectedClassId.value
  );
  if (!currentClass?.courseList?.length) {
    return null;
  }

  return (
    currentClass.courseList.find((item) => item.courseId === selectedCourseId.value) ||
    null
  );
});

const recordLessonCover = computed(() => {
  return selectedCourse.value?.courseCoverUrl || lessonCover;
});

const recordLessonCoverAlt = computed(() => {
  return selectedCourse.value?.courseName || "课程封面大图";
});

const normalizeRecordLessonTitle = (name: string) => {
  if (!name) {
    return "";
  }

  return String(name)
    .replace(/<br\s*\/?>/gi, "")
    .split("-")
    .map((item) => item.trim())
    .filter(Boolean)
    .join("");
};

const loadChapterList = async () => {
  if (!selectedClassId.value || !selectedCourseId.value) {
    chapterList.value = [];
    selectedChapterId.value = "";
    return;
  }

  try {
    const data = await getTeachChapterList(selectedCourseId.value, selectedClassId.value);
    const list = Array.isArray(data) ? data : [];
    chapterList.value = list.map((item: any) => ({
      chapterId: String(item.chapterId || ""),
      chapterName: item.chapterName || "",
      teachStatus: Number(item.teachStatus ?? 0),
      isLatestTeach: Number(item.isLatestTeach ?? 0),
    }));
    selectedChapterId.value = chapterList.value[0]?.chapterId || "";
  } catch (error) {
    console.error("teacher2 加载授课章节失败:", error);
    chapterList.value = [];
    selectedChapterId.value = "";
  }
};

const getLessonStatusText = (chapter: ChapterItem) => {
  if (chapter.teachStatus === 1) {
    return "上课中";
  }

  if (chapter.teachStatus === 2 && chapter.isLatestTeach === 1) {
    return "上节课";
  }

  if (chapter.teachStatus === 2) {
    return "已结束";
  }

  return "未开始";
};

const getLessonStatusVariant = (chapter: ChapterItem): LessonCard["status"] => {
  if (chapter.teachStatus === 1) {
    return "ongoing";
  }

  if (chapter.teachStatus === 2 && chapter.isLatestTeach === 1) {
    return "last";
  }

  if (chapter.teachStatus === 2) {
    return "finished";
  }

  return "pending";
};

const lessonCards = computed<LessonCard[]>(() => {
  return chapterList.value.map((chapter, index) => ({
    chapterId: chapter.chapterId,
    order: `${String(index + 1).padStart(2, "0")} 课`,
    title: normalizeRecordLessonTitle(chapter.chapterName),
    statusText: getLessonStatusText(chapter),
    status: getLessonStatusVariant(chapter),
    chapter,
  }));
});

const recordEmptyState = computed<RecordEmptyState | null>(() => {
  if (teachListLoading.value) {
    return {
      title: "正在加载授课记录",
      description: "请稍候，我们正在同步您的班级与课程信息。",
      icon: "hourglass_top",
    };
  }

  if (!classOptions.value.length) {
    return {
      title: "暂无班级",
      description: "当前还没有可用的授课班级，待分配班级后会在这里显示。",
      icon: "groups",
    };
  }

  if (!courseOptions.value.length) {
    return {
      title: "暂无课程",
      description: "当前班级下还没有可用课程，关联课程后即可查看授课记录。",
      icon: "menu_book",
    };
  }

  if (!lessonCards.value.length) {
    return {
      title: "暂无授课记录",
      description: "当前课程还没有章节授课记录，开始上课后会在这里展示进度。",
      icon: "history_edu",
    };
  }

  return null;
});

const goToCourse = () => {
  if (!selectedCourseId.value) {
    return;
  }

  navigateTo(`/system/course/${selectedCourseId.value}`);
};

const goToTeach = async (chapter: ChapterItem) => {
  if (!selectedClassId.value || !selectedCourseId.value) {
    return;
  }

  const classId = selectedClassId.value;
  const courseId = selectedCourseId.value;
  const chapterId = chapter.chapterId;
  const classroomUrl = buildTeacherClassroomUrl({
    classId,
    className: selectedClassName.value,
    courseId,
    chapterId,
    autoQuickLogin: chapter.teachStatus !== 1,
  });

  if (chapter.teachStatus === 1) {
    navigateTo(classroomUrl);
    return;
  }

  if (
    !(await ensureNoOngoingClassroomBeforeStart({
      classId,
      courseId,
      chapterId,
    }))
  ) {
    return;
  }

  try {
    await beginClass({
      classId,
      courseId,
      chapterId,
      peerId: classId,
    });

    navigateTo(classroomUrl);
  } catch (error) {
    console.error("teacher2 授课记录区开始上课失败:", error);
  }
};

const goToPrepare = (chapter: ChapterItem) => {
  if (!selectedCourseId.value) {
    return;
  }

  navigateTo(
    `/system/course/prepare/${selectedCourseId.value}?chapterId=${chapter.chapterId}`
  );
};

const handleLessonTeach = (item: LessonCard) => {
  void goToTeach(item.chapter);
};

const handleLessonPrepare = (item: LessonCard) => {
  goToPrepare(item.chapter);
};

const openQuickLoginModal = async () => {
  showQuickLoginModal.value = true;
  quickLoginLoading.value = true;
  selectedQuickLoginClassId.value = null;

  try {
    const data = await getClassListNoPage();
    quickLoginClassList.value = Array.isArray(data)
      ? data.map((item: any) => ({
          classId: String(item.classId || item.id || ""),
          className: item.className || "",
        }))
      : [];
  } catch (error) {
    console.error("teacher2 获取班级列表失败:", error);
    quickLoginClassList.value = [];
  } finally {
    quickLoginLoading.value = false;
  }
};

const handleQuickLoginConfirm = async () => {
  if (!selectedQuickLoginClassId.value) {
    return;
  }

  try {
    const result = await createQuickLogin(selectedQuickLoginClassId.value);
    const normalized = normalizeQuickLoginInfo(result);
    syncTeacherQuickLoginCache(normalized);
    quickLoginInfo.value = normalized;

    const selectedClassName =
      quickLoginClassList.value.find(
        (item) => item.classId === selectedQuickLoginClassId.value
      )?.className || getResolvedClassNameById(selectedQuickLoginClassId.value);

    quickLoginResultData.value = {
      className: selectedClassName || "",
      classCode: normalized.classCode,
      classCodePwd: normalized.classCodePwd,
      expirationDate: normalized.expirationDate,
    };

    showQuickLoginModal.value = false;
    showQuickLoginResultModal.value = true;
  } catch (error) {
    console.error("teacher2 创建快捷登录失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "创建失败");
  }
};

const copyQuickLoginInfo = async () => {
  const text = `班级码：${quickLoginResultData.value.classCode}\n统一密码：${quickLoginResultData.value.classCodePwd}`;

  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success("已复制");
  } catch (error) {
    console.error("teacher2 复制班级码失败:", error);
    ElMessage.error("复制失败");
  }
};

const goToClassPage = () => {
  showQuickLoginResultModal.value = false;
  navigateTo("/system/class");
};

const handleQuickLoginBtnClick = () => {
  void openQuickLoginModal();
};

watch(
  teachList,
  (list) => {
    if (!list.length) {
      selectedClassId.value = "";
      selectedCourseId.value = "";
      chapterList.value = [];
      return;
    }

    if (
      !selectedClassId.value ||
      !list.some((item) => item.classId === selectedClassId.value)
    ) {
      selectedClassId.value = list[0]?.classId || "";
    }
  },
  { immediate: true }
);

watch(
  selectedClassId,
  (newClassId) => {
    if (!newClassId) {
      selectedCourseId.value = "";
      return;
    }

    const currentClass = teachList.value.find((item) => item.classId === newClassId);
    const firstCourseId = currentClass?.courseList?.[0]?.courseId || "";
    selectedCourseId.value = firstCourseId;
  },
  { immediate: true }
);

watch(
  selectedCourseId,
  () => {
    void loadChapterList();
  },
  { immediate: true }
);

const showStartClassModal = ref(false);
const startClassModalRef = ref<any>(null);
const startClassData = reactive({
  classList: [] as { classId: string; className: string }[],
  courseList: [] as { courseId: string; courseName: string }[],
  courseTree: [] as {
    menuId: string | number | null;
    menuName: string;
    courseList: { courseId: string; courseName: string }[];
    children?: any[];
  }[],
  initialCourseId: "",
  initialChapterId: "",
});

const handleGoToClass = async () => {
  const ongoing = await verifyOngoingClassroom();
  if (ongoing) {
    ElMessage.error(ongoingClassroomBlockedMessage);
    return;
  }

  startClassData.initialCourseId = "";
  startClassData.initialChapterId = "";

  try {
    const [classListRes, courseTreeRes] = await Promise.all([
      getClassListNoPage(),
      getCourseMenuTree(),
    ]);

    if (classListRes && Array.isArray(classListRes)) {
      startClassData.classList = classListRes.map((item: any) => ({
        classId: String(item.classId || item.id),
        className: item.className,
      }));
    } else {
      startClassData.classList = [];
    }

    if (courseTreeRes && Array.isArray(courseTreeRes)) {
      const extractAllCourses = (
        nodes: any[]
      ): { courseId: string; courseName: string }[] => {
        let courses: { courseId: string; courseName: string }[] = [];

        nodes.forEach((node: any) => {
          if (node.courseList && Array.isArray(node.courseList)) {
            node.courseList.forEach((course: any) => {
              courses.push({
                courseId: String(course.courseId),
                courseName: course.courseName,
              });
            });
          }

          if (node.children && Array.isArray(node.children)) {
            courses = courses.concat(extractAllCourses(node.children));
          }
        });

        return courses;
      };

      startClassData.courseTree = courseTreeRes;
      startClassData.courseList = extractAllCourses(courseTreeRes);
    } else {
      startClassData.courseTree = [];
      startClassData.courseList = [];
    }
  } catch (error) {
    console.error("teacher2 获取开课设置失败:", error);
    startClassData.classList = [];
    startClassData.courseTree = [];
    startClassData.courseList = [];
  }

  showStartClassModal.value = true;
};

const handleHeroAction = async (actionKey: HeroAction["key"]) => {
  if (actionKey === "teach") {
    await handleGoToClass();
    return;
  }

  if (actionKey === "prepare") {
    goToLessons();
    return;
  }

  handleGoToTask();
};

const handleClassChange = () => {
  if (startClassModalRef.value) {
    startClassModalRef.value.setChapterList([]);
  }
};

const handleCourseChange = async (courseId: string, classId: string) => {
  try {
    const data = await getTeachChapterList(courseId, classId);
    if (data && startClassModalRef.value) {
      const chapters = (Array.isArray(data) ? data : []).map((chapter: any) => ({
        chapterId: String(chapter.chapterId),
        chapterName: chapter.chapterName,
        isLastClass: chapter.isLastClass || false,
      }));
      startClassModalRef.value.setChapterList(chapters);
    }
  } catch (error) {
    console.error("teacher2 加载章节列表失败:", error);
    if (startClassModalRef.value) {
      startClassModalRef.value.setChapterList([]);
    }
  }
};

const handleStartClassConfirm = async (data: {
  classId: string;
  courseId: string;
  chapterId: string;
}) => {
  const className =
    startClassData.classList.find((item) => item.classId === data.classId)?.className ||
    "";

  if (
    !(await ensureNoOngoingClassroomBeforeStart({
      classId: data.classId,
      courseId: data.courseId,
      chapterId: data.chapterId,
    }))
  ) {
    return;
  }

  try {
    await beginClass({
      classId: data.classId,
      courseId: data.courseId,
      chapterId: data.chapterId,
      peerId: data.classId,
    });

    navigateTo(
      buildTeacherClassroomUrl({
        classId: data.classId,
        className,
        courseId: data.courseId,
        chapterId: data.chapterId,
        autoQuickLogin: true,
      })
    );
  } catch (error) {
    console.error("teacher2 开始上课失败:", error);
  }
};

const toolCards: ToolCard[] = [
  {
    key: "vincibot",
    title: "MatataCode",
    subtitle: "(VinciBot)",
    desc: "提供AI模型训练、图形化编程和Python文本编程，满足不同年龄段学生的认知水平和学习需求。内置AI、摄像头、乐器等趣味功能。",
    image: tool1Icon,
  },
  {
    key: "nous",
    title: "MatataCode",
    subtitle: "(Nous)",
    desc: "面向更高阶的人工智能编程学习平台，深度融合图形化与Python，提供丰富的AI功能体验。支持摄像头、传感器、多感官交互编程玩法。",
    image: tool2Icon,
  },
  {
    key: "talemap",
    title: "MatataCode",
    subtitle: "(TaleMap)",
    desc: "故事地图设计平台，用户可自行创建无限的交互式地图和场景，将编程融入叙事艺术中。",
    image: tool4Icon,
  },
];

const showToolIframeModal = ref(false);
const currentToolUrl = ref("");
const currentToolName = ref("");
const toolIframeLoading = ref(true);
const toolIframeRef = ref<HTMLIFrameElement | null>(null);
const currentToolCacheKey = ref("");
const savedProjectZipCache = new Map<string, File>();

const toolUrls: Record<ToolCard["key"], { url: string; nameKey: string }> = {
  vincibot: {
    url: runtimeConfig.public.vincibotCreateUrl,
    nameKey: "teacher.vincibot",
  },
  nous: {
    url: runtimeConfig.public.nousCreateUrl,
    nameKey: "teacher.nous",
  },
  talemap: {
    url:
      "https://www.mediafire.com/file_premium/rz1j080mpbsdhus/MatataCode-TaleMap-v1.0.0-win-x64.exe/file",
    nameKey: "teacher.talemap",
  },
};

const getAiToolAccessToken = async () => {
  const ssoData = await ssoLogin();
  const accessToken =
    (typeof ssoData === "string" ? ssoData : "") ||
    ssoData?.accessToken ||
    ssoData?.token ||
    ssoData?.access_token ||
    "";

  if (!accessToken) {
    throw new Error("获取AI工具Token失败");
  }

  return accessToken;
};

const goToToolCenter = () => {
  navigateTo("/system/tool");
};

const goToAICenter = () => {
  navigateTo("/system/ai");
};

const handleOpenTool = (toolId: ToolCard["key"]) => {
  const tool = toolUrls[toolId];
  if (!tool) return;

  void (async () => {
    let url = tool.url;

    if (toolId === "talemap") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    const token = await getAiToolAccessToken();
    const lang =
      toolId === "vincibot"
        ? locale.value === "zh"
          ? "zh-CN"
          : "en"
        : locale.value === "zh"
        ? "zh"
        : "en";

    url = `${url}?token=${encodeURIComponent(token)}&lang=${lang}&ch=aiedu`;
    currentToolCacheKey.value = "";
    currentToolUrl.value = url;
    currentToolName.value = t(tool.nameKey);
    toolIframeLoading.value = true;
    showToolIframeModal.value = true;
  })().catch((error) => {
    console.error("teacher2 获取工具SSO登录信息失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "获取工具Token失败");
  });
};

const parseToolIframeMessageData = parseMessageData;
const toToolZipFile = (payload: unknown) => toZipFile(payload);
const uploadToolProjectFileToOSS = async (file: File) =>
  uploadFileToOSS(file, "上传模型文件失败");

const teacherAIItems: Record<TeacherAIKey, TeacherAICardItem> = {
  imageClassModel: {
    key: "imageClassModel",
    title: "图像分类训练",
    image: aiCover1,
  },
  gestureClassModel: {
    key: "gestureClassModel",
    title: "手势分类训练",
    image: aiCover2,
  },
  voiceClassModel: {
    key: "voiceClassModel",
    title: "语音分类训练",
    image: aiCover3,
  },
  poseClassModel: {
    key: "poseClassModel",
    title: "姿态分类训练",
    image: aiCover4,
  },
};

const showAIModelSelectModal = ref(false);
const showAICreateModal = ref(false);
const currentAIModel = ref<TeacherAICardItem | null>(null);
const aiModelName = ref("");
const currentAIProjectName = ref("");
const currentEditingAIModelId = ref("");
const currentEditingAIOssId = ref("");
const isEditingAITeacherModel = ref(false);
const savedAIModels = ref<SavedAITeacherModelListItem[]>([]);
const savedAIModelsLoading = ref(false);

const getCurrentUserId = () => {
  const userId =
    user.value?.userId ||
    user.value?.user_id ||
    user.value?.id ||
    user.value?.userID ||
    "";

  if (userId) {
    return String(userId);
  }

  if (typeof window === "undefined") {
    return "";
  }

  try {
    const rawUserInfo = localStorage.getItem("user_info");
    if (!rawUserInfo) {
      return "";
    }

    const userInfo = JSON.parse(rawUserInfo);
    return String(userInfo?.user_id || userInfo?.userId || userInfo?.id || "");
  } catch {
    return "";
  }
};

const getSavedAIModelCover = (toolKey: TeacherAIKey) => {
  return teacherAIItems[toolKey]?.image || aiCover1;
};

const formatSavedAIModelTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString(locale.value === "zh" ? "zh-CN" : "en-US", {
    hour12: false,
  });
};

const getTeacherAITypeByKey = (toolKey: TeacherAIKey) => {
  const typeMap: Record<TeacherAIKey, number> = {
    imageClassModel: 1,
    gestureClassModel: 2,
    voiceClassModel: 3,
    poseClassModel: 4,
  };

  return typeMap[toolKey];
};

const getTeacherAIOptTypeByKey = (toolKey: TeacherAIKey) => {
  const optTypeMap: Record<TeacherAIKey, string> = {
    imageClassModel: "image_cls",
    voiceClassModel: "audio_cls",
    poseClassModel: "pose_cls",
    gestureClassModel: "gesture_cls",
  };

  return optTypeMap[toolKey];
};

const getTeacherAICacheKey = (toolKey: TeacherAIKey, modelId: string) =>
  `ai:${toolKey}:${modelId}`;

const getTeacherAIFileNameFromUrl = (url?: string, fallbackName = "project.zip") => {
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

const normalizeTeacherAIModelTimestamp = (value: unknown, fallbackValue = Date.now()) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? fallbackValue : parsed;
  }

  return fallbackValue;
};

const loadSavedAIModels = async () => {
  if (!currentAIModel.value) {
    savedAIModels.value = [];
    return;
  }

  savedAIModelsLoading.value = true;

  try {
    const targetOptType = getTeacherAIOptTypeByKey(currentAIModel.value.key);
    const userId = getCurrentUserId();
    const response = await getAiList({
      optType: targetOptType,
      userId,
    });
    const list = Array.isArray(response)
      ? response
      : response?.rows || response?.list || response?.records || [];

    savedAIModels.value = list
      .filter((item: any) => !targetOptType || item.optType === targetOptType)
      .map((item: any) => {
        const modelName = item.optName || item.name || item.projectName || "-";

        return {
          id: String(item.optId || item.id || item.aiId || item.ossId || `${Date.now()}`),
          toolKey: currentAIModel.value?.key || "imageClassModel",
          name: modelName,
          updatedAt: normalizeTeacherAIModelTimestamp(
            item.updateTime || item.updatedAt || item.createTime,
            0
          ),
          fileName:
            item.fileName || getTeacherAIFileNameFromUrl(item.url, `${modelName}.zip`),
          mimeType: item.mimeType || "application/octet-stream",
          size: Number(item.size || 0),
          ossId: item.ossId ? String(item.ossId) : "",
          optType: item.optType || "",
          url: item.url || "",
        } as SavedAITeacherModelListItem;
      })
      .sort(
        (a: SavedAITeacherModelListItem, b: SavedAITeacherModelListItem) =>
          b.updatedAt - a.updatedAt
      );
  } catch (error) {
    console.error("teacher2 加载AI模型列表失败:", error);
    savedAIModels.value = [];
  } finally {
    savedAIModelsLoading.value = false;
  }
};

const downloadTeacherAIModelZipFile = async (item: SavedAITeacherModelListItem) => {
  const fallbackFileName =
    item.fileName ||
    getTeacherAIFileNameFromUrl(item.url, `${item.name || "project"}.zip`);

  if (item.ossId) {
    return downloadFileFromOSS(
      item.ossId,
      fallbackFileName,
      item.mimeType || "application/zip"
    );
  }

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

  return null;
};

const openTeacherAIIframe = async (
  tool: TeacherAICardItem,
  projectName: string,
  modelId: string
) => {
  const token = await getAiToolAccessToken();
  const type = getTeacherAITypeByKey(tool.key);
  const lang = locale.value === "zh" ? "zh" : "en";
  const url =
    `https://pre.matatalab.com/?token=${encodeURIComponent(token)}` +
    `&type=${type}` +
    `&projectName=${encodeURIComponent(projectName)}` +
    `&lang=${lang}&ch=aiedu&type2=opt` +
    (isEditingAITeacherModel.value ? `&optId=${encodeURIComponent(modelId)}` : "");

  currentToolUrl.value = url;
  currentToolName.value = tool.title;
  currentToolCacheKey.value = getTeacherAICacheKey(tool.key, modelId);
  toolIframeLoading.value = true;
  currentAIProjectName.value = projectName;
  currentEditingAIModelId.value = modelId;
  showAIModelSelectModal.value = false;
  showAICreateModal.value = false;
  showToolIframeModal.value = true;
};

const handleOpenAIModal = (key: TeacherAIKey) => {
  currentAIModel.value = teacherAIItems[key] || null;
  aiModelName.value = "";
  savedAIModels.value = [];
  showAIModelSelectModal.value = true;
  void loadSavedAIModels();
};

const closeAIModelSelectModal = () => {
  showAIModelSelectModal.value = false;
  currentAIModel.value = null;
  aiModelName.value = "";
  savedAIModels.value = [];
  savedAIModelsLoading.value = false;
  currentAIProjectName.value = "";
  currentEditingAIModelId.value = "";
  currentEditingAIOssId.value = "";
  isEditingAITeacherModel.value = false;
};

const openAICreateModal = () => {
  aiModelName.value = "";
  showAIModelSelectModal.value = false;
  showAICreateModal.value = true;
};

const closeAICreateModal = () => {
  showAICreateModal.value = false;
  aiModelName.value = "";
  if (currentAIModel.value) {
    showAIModelSelectModal.value = true;
    return;
  }

  savedAIModels.value = [];
};

const handleAIConfirm = async () => {
  if (!currentAIModel.value) {
    return;
  }

  const trimmedName = aiModelName.value.trim();
  if (!trimmedName) {
    ElMessage.warning("请输入模型名称");
    return;
  }

  isEditingAITeacherModel.value = false;
  currentEditingAIOssId.value = "";
  await openTeacherAIIframe(
    currentAIModel.value,
    trimmedName,
    `teacher-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
};

const handleOpenAISavedModel = async (item: SavedAITeacherModelListItem) => {
  if (!currentAIModel.value) {
    return;
  }

  try {
    const cacheKey = getTeacherAICacheKey(item.toolKey, item.id);
    const cachedFile = savedProjectZipCache.get(cacheKey);
    if (!cachedFile) {
      const remoteFile = await downloadTeacherAIModelZipFile(item);
      if (!remoteFile) {
        ElMessage.error("模型文件不存在");
        return;
      }

      savedProjectZipCache.set(cacheKey, remoteFile);
    }

    isEditingAITeacherModel.value = true;
    currentEditingAIOssId.value = item.ossId || "";
    await openTeacherAIIframe(currentAIModel.value, item.name, item.id);
  } catch (error) {
    console.error("teacher2 读取AI模型文件失败:", error);
    ElMessage.error("加载模型失败");
  }
};

const handleDeleteAISavedModel = async (item: SavedAITeacherModelListItem) => {
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
    if (item.ossId) {
      try {
        await deleteOss(item.ossId);
      } catch (error) {
        console.warn("teacher2 删除AI模型OSS文件失败:", error);
      }
    }

    const cacheKey = getTeacherAICacheKey(item.toolKey, item.id);
    savedProjectZipCache.delete(cacheKey);
    savedAIModels.value = savedAIModels.value.filter((model) => model.id !== item.id);
    ElMessage.success("删除成功");
  } catch (error) {
    console.error("teacher2 删除AI模型失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "删除失败");
  }
};

const postCachedZipToToolIframe = async () => {
  if (!currentToolCacheKey.value.startsWith("ai:")) {
    return;
  }

  const zipFile = savedProjectZipCache.get(currentToolCacheKey.value);
  const postResult = await postFileBufferToIframe({
    file: zipFile,
    iframeUrl: currentToolUrl.value,
    iframeWindow: toolIframeRef.value?.contentWindow,
    type: "receive-tm-zip",
    payloadOnly: true,
  });

  if (!postResult) {
    return;
  }

  console.log("teacher2 已向AI工具 iframe 发送 zip 文件:", {
    cacheKey: currentToolCacheKey.value,
    ...postResult,
  });
};

const handleToolIframeMessage = async (event: MessageEvent) => {
  if (
    !isMessageFromIframe({
      event,
      iframeWindow: toolIframeRef.value?.contentWindow,
      iframeUrl: currentToolUrl.value,
    })
  ) {
    return;
  }

  const messageData = parseToolIframeMessageData(event.data) as any;
  const messageType = getMessageType(messageData);

  if (
    !messageData ||
    (typeof messageData !== "object" && typeof messageData !== "string")
  ) {
    return;
  }

  if (messageType === "close-ai-embedded") {
    closeToolIframeModal();
    return;
  }

  if (messageType !== "send-tm-zip" || !currentToolCacheKey.value.startsWith("ai:")) {
    return;
  }

  const zipPayload = pickMessagePayload(messageData, [
    "payload",
    "data",
    "file",
    "blob",
    "arrayBuffer",
    "result",
  ]);
  const zipFile = toToolZipFile(zipPayload);
  if (!zipFile) {
    console.warn(
      "teacher2 收到 send-tm-zip 消息，但 payload 无法转换为 zip 文件:",
      messageData
    );
    return;
  }

  try {
    if (!currentAIModel.value) {
      throw new Error("当前AI模型上下文不存在");
    }

    const previousCacheKey = currentToolCacheKey.value;
    const saveMode = isEditingAITeacherModel.value ? "edit" : "create";
    const uploadFile =
      toUploadFile(zipPayload, pickMessageFileName(messageData)) ||
      new File([zipFile], `${currentAIProjectName.value || "project"}.zip`, {
        type: zipFile.type || "application/zip",
        lastModified: Date.now(),
      });

    if (isEditingAITeacherModel.value && currentEditingAIOssId.value) {
      try {
        await deleteOss(currentEditingAIOssId.value);
      } catch (error) {
        console.warn("teacher2 删除旧OSS对象失败，继续上传新文件:", error);
      }
    }

    const uploadResult = await uploadToolProjectFileToOSS(uploadFile);
    const userId = getCurrentUserId();
    const optType = getTeacherAIOptTypeByKey(currentAIModel.value.key);
    const optName =
      (typeof messageData?.projectName === "string" && messageData.projectName.trim()) ||
      currentAIProjectName.value.trim() ||
      uploadFile.name.replace(/\.[^.]+$/, "");

    if (!uploadResult?.ossId || !userId || !optType) {
      throw new Error("保存模型参数不完整");
    }

    let finalModelId = currentEditingAIModelId.value || `${Date.now()}`;
    if (isEditingAITeacherModel.value && currentEditingAIModelId.value) {
      await updateAi({
        optId: currentEditingAIModelId.value,
        optName,
        optType,
        userId,
        ossId: uploadResult.ossId,
      });
    } else {
      const createResult = await createAi({
        optName,
        optType,
        userId,
        ossId: uploadResult.ossId,
      });
      finalModelId = String(createResult?.optId || createResult?.id || finalModelId);
    }

    currentEditingAIModelId.value = finalModelId;
    currentEditingAIOssId.value = String(uploadResult.ossId);
    currentAIProjectName.value = optName;

    const finalCacheKey = getTeacherAICacheKey(currentAIModel.value.key, finalModelId);
    currentToolCacheKey.value = finalCacheKey;
    if (previousCacheKey && previousCacheKey !== finalCacheKey) {
      savedProjectZipCache.delete(previousCacheKey);
    }
    savedProjectZipCache.set(finalCacheKey, uploadFile);

    isEditingAITeacherModel.value = true;
    await loadSavedAIModels();
    ElMessage.success(saveMode === "edit" ? "编辑成功" : "创建成功");
  } catch (error) {
    console.error("teacher2 AI中心保存模型失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
  }
};

const onToolIframeLoad = () => {
  toolIframeLoading.value = false;
  window.setTimeout(() => {
    void postCachedZipToToolIframe();
  }, 300);
};

const closeToolIframeModal = () => {
  const shouldRestoreAIModelSelect =
    currentToolCacheKey.value.startsWith("ai:") && Boolean(currentAIModel.value);

  showToolIframeModal.value = false;
  currentToolUrl.value = "";
  currentToolName.value = "";
  toolIframeLoading.value = true;
  currentToolCacheKey.value = "";

  if (shouldRestoreAIModelSelect) {
    showAIModelSelectModal.value = true;
    void loadSavedAIModels();
  }
};

const aiCards: AICard[] = [
  {
    key: "imageClassModel",
    title: "图像分类训练",
    image: aiCover1,
    background: "#E4DFFF",
    overlay: "linear-gradient(180deg, transparent 0%, rgba(89, 72, 211, 0.4) 100%)",
  },
  {
    key: "gestureClassModel",
    title: "手势分类训练",
    image: aiCover2,
    background: "#A4C1FF",
    overlay: "linear-gradient(180deg, transparent 0%, rgba(0, 91, 194, 0.4) 100%)",
  },
  {
    key: "voiceClassModel",
    title: "语音分类训练",
    image: aiCover3,
    background: "#FFA44F",
    overlay: "linear-gradient(180deg, transparent 0%, rgba(144, 78, 0, 0.4) 100%)",
  },
  {
    key: "poseClassModel",
    title: "姿态分类训练",
    image: aiCover4,
    background: "#F56965",
    overlay: "linear-gradient(180deg, transparent 0%, rgba(172, 52, 52, 0.4) 100%)",
  },
];
</script>

<style scoped>
.teacher2-page {
  --teacher2-min-width: 1280px;
  --teacher2-max-width: 1920px;
  --teacher2-shell-width: var(--teacher2-min-width);
  --sidebar-width: 256px;
  --topbar-height: 64px;
  --content-padding: clamp(28px, 1.9vw, 36px);
  --section-gap: clamp(36px, 2.25vw, 44px);
  --grid-gap: clamp(20px, 1.45vw, 28px);
  height: 100vh;
  min-width: var(--teacher2-min-width);
  overflow-x: auto;
  overflow-y: auto;
  background: #f8f9fa;
  color: #2e3335;
  font-family: "Manrope", "PingFang SC", sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* 页面滚动条美化 */
.teacher2-page::-webkit-scrollbar {
  width: 6px;
}

.teacher2-page::-webkit-scrollbar-track {
  background: transparent;
}

.teacher2-page::-webkit-scrollbar-thumb {
  background-color: rgba(174, 179, 181, 0.3);
  border-radius: 3px;
}

.teacher2-page::-webkit-scrollbar-thumb:hover {
  background-color: rgba(174, 179, 181, 0.5);
}

@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("/fonts/material-symbols-outlined-teacher2.woff2") format("woff2");
}

.material-symbols-outlined {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  overflow: hidden;
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 400;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  flex-shrink: 0;
  user-select: none;
  font-feature-settings: "liga";
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.teacher2-container {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  width: min(
    var(--teacher2-max-width),
    max(var(--teacher2-min-width), var(--teacher2-shell-width))
  );
  min-width: var(--teacher2-min-width);
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
  background: #f8f9fa;
}

.teacher2-content {
  position: relative;
  min-width: 0;
}

.teacher2-topbar {
  position: sticky;
  top: 0;
  z-index: 40;
  width: 100%;
  height: var(--topbar-height);
  padding: 0 var(--content-padding);
  background: rgba(248, 249, 250, 0.8);
  backdrop-filter: blur(12px);
}

.teacher2-main {
  min-height: 0;
  min-width: 0;
  padding: 40px var(--content-padding) 48px;
}

.teacher2-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(300px, 24vw, 400px);
  min-height: 380px;
  gap: var(--grid-gap);
  align-items: stretch;
  margin-bottom: var(--section-gap);
}

.teacher2-hero {
  --hero-art-size: clamp(250px, 16vw, 310px);
  --hero-art-right: clamp(-14px, -0.6vw, 0px);
  position: relative;
  display: block;
  min-height: 380px;
  height: 380px;
  padding: clamp(24px, 1.8vw, 30px) clamp(26px, 2vw, 34px);
  overflow: hidden;
  border-radius: 24px;
  background: linear-gradient(135deg, #005bc2 0%, #0050ab 100%);
  isolation: isolate;
}

.teacher2-hero::after {
  content: none;
}

.teacher2-hero__copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: auto;
  max-width: none;
  min-height: 100%;
  min-width: 0;
  padding-right: calc(
    var(--hero-art-size) + var(--hero-art-right) + clamp(22px, 1.8vw, 36px)
  );
}

.teacher2-hero__title {
  margin: 0 0 clamp(18px, 1.4vw, 24px);
  color: #ffffff;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: clamp(36px, 2.3vw, 44px);
  font-weight: 800;
  line-height: 1.1;
}

.teacher2-hero__title-line {
  display: block;
  white-space: nowrap;
}

.teacher2-hero__desc {
  margin: 0 0 clamp(26px, 2.4vw, 36px);
  color: rgba(255, 255, 255, 0.8);
  font-size: clamp(16px, 1vw, 18px);
  font-weight: 500;
}

.teacher2-hero__actions {
  display: flex;
  flex-wrap: nowrap;
  gap: clamp(12px, 1.5vw, 24px);
}

.teacher2-hero__button {
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  gap: clamp(10px, 0.8vw, 12px);
  min-width: clamp(120px, 8vw, 136px);
  min-height: clamp(48px, 2.8vw, 52px);
  padding: 0 clamp(22px, 1.5vw, 28px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: clamp(14px, 0.9vw, 15px);
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  backdrop-filter: blur(12px);
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease,
    border-color 0.25s ease;
}

.teacher2-hero__button::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 12%,
    rgba(255, 255, 255, 0.22) 50%,
    rgba(255, 255, 255, 0) 88%
  );
  transform: translateX(-120%);
  transition: transform 0.7s ease;
}

.teacher2-hero__button > span {
  position: relative;
  z-index: 1;
}

.teacher2-hero__button:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.24);
  box-shadow: 0 14px 32px rgba(12, 15, 16, 0.14);
}

.teacher2-hero__button:hover::before {
  transform: translateX(120%);
}

.teacher2-hero__button:hover .teacher2-hero__button-icon {
  transform: scale(1.05);
}

.teacher2-hero__button:focus-visible {
  transform: translateY(-2px);
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.16);
}

.teacher2-hero__button--primary {
  border-color: transparent;
  background: #ffffff;
  color: #005bc2;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12);
}

.teacher2-hero__button--primary:hover {
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
}

.teacher2-hero__button--primary::before {
  background: linear-gradient(
    120deg,
    rgba(0, 91, 194, 0) 12%,
    rgba(0, 91, 194, 0.12) 50%,
    rgba(0, 91, 194, 0) 88%
  );
}

.teacher2-hero__button-icon {
  font-size: clamp(20px, 1.3vw, 24px);
  transition: transform 0.25s ease;
}

.teacher2-hero__visual {
  position: absolute;
  top: 50%;
  right: var(--hero-art-right);
  z-index: 1;
  width: var(--hero-art-size);
  height: var(--hero-art-size);
  min-height: var(--hero-art-size);
  transform: translateY(-50%);
  isolation: isolate;
  pointer-events: none;
}

.teacher2-hero__visual::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: -22px;
  z-index: 1;
  background: left center / contain no-repeat var(--teacher2-hero-art);
  filter: drop-shadow(0 14px 30px rgba(0, 91, 194, 0.12));
}

.teacher2-hero__glow {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}

.teacher2-hero__glow--top {
  top: -10%;
  right: -10%;
  width: 320px;
  height: 320px;
  background: rgba(255, 255, 255, 0.1);
  filter: blur(48px);
}

.teacher2-hero__glow--bottom {
  bottom: -10%;
  left: -5%;
  width: 256px;
  height: 256px;
  background: rgba(89, 72, 211, 0.2);
  filter: blur(32px);
}

.teacher2-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  height: 380px;
  gap: clamp(16px, 1.35vw, 24px);
  min-width: 0;
  align-content: stretch;
  align-self: stretch;
}

.teacher2-stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: clamp(22px, 1.8vw, 28px);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(46, 51, 53, 0.04);
}

.teacher2-stat-card__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: clamp(48px, 3vw, 56px);
  height: clamp(48px, 3vw, 56px);
  margin-bottom: clamp(18px, 1.4vw, 24px);
  border-radius: 16px;
}

.teacher2-stat-card__icon {
  font-size: clamp(24px, 1.6vw, 30px);
  font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
}

.teacher2-stat-card__label {
  margin: 0;
  color: #5a6062;
  font-size: clamp(14px, 0.9vw, 16px);
  font-weight: 500;
}

.teacher2-stat-card__value {
  margin: 0;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: clamp(28px, 2vw, 32px);
  font-weight: 800;
}

.teacher2-section {
  margin-bottom: var(--section-gap);
}

.teacher2-section--record {
  /* padding-bottom: 64px; */
}

.teacher2-section__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: clamp(24px, 1.7vw, 32px);
}

.teacher2-section__header--compact {
  justify-content: flex-start;
}

.teacher2-section__header--record {
  align-items: flex-start;
  margin-bottom: 16px;
}

.teacher2-section__title {
  margin: 0;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: clamp(26px, 1.5vw, 28px);
  font-weight: 700;
}

.teacher2-section__subtitle {
  margin: 4px 0 0;
  color: #5a6062;
  font-size: clamp(15px, 0.95vw, 16px);
  font-weight: 500;
}

.teacher2-section__link,
.teacher2-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  color: #005bc2;
  font-size: 16px;
  font-weight: 700;
}

.teacher2-section__link .material-symbols-outlined,
.teacher2-login-btn .material-symbols-outlined {
  font-size: 16px;
}

.teacher2-login-btn--inline {
  min-height: 44px;
  font-size: 16px;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;
}

.teacher2-tool-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--grid-gap);
}

.teacher2-tool-card {
  display: flex;
  align-items: center;
  gap: clamp(20px, 1.5vw, 24px);
  min-height: 150px;
  height: 150px;
  padding: 20px 24px;
  border: 1px solid rgba(174, 179, 181, 0.1);
  border-radius: 24px;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.teacher2-tool-card:hover {
  background: #005bc2;
  box-shadow: 0 20px 40px rgba(0, 91, 194, 0.12);
}

.teacher2-tool-card__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
  align-self: stretch;
}

.teacher2-tool-card__media {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 88px;
  height: 88px;
  /* border-radius: 24px;
  background: #f2f4f5; */
  transition: background-color 0.2s ease;
}

.teacher2-tool-card:hover .teacher2-tool-card__media {
  /* background: rgba(255, 255, 255, 0.2); */
}

.teacher2-tool-card__logo {
  /* width: 80px;
  height: 80px; */
  width: 88px;
  height: 88px;
  object-fit: contain;
}

.teacher2-tool-card__title {
  margin: 0;
  color: #2e3335;
  font-size: clamp(18px, 1.28vw, 20px);
  font-weight: 700;
  line-height: 1.1;
  overflow: hidden;
  transition: color 0.2s ease;
}

.teacher2-tool-card:hover .teacher2-tool-card__title,
.teacher2-tool-card:hover .teacher2-tool-card__desc {
  color: #ffffff;
}

.teacher2-tool-card__subtitle {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: inherit;
  line-height: inherit;
}

.teacher2-tool-card__desc {
  margin: 0;
  color: #5a6062;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.teacher2-iframe-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(12, 15, 16, 0.52);
  backdrop-filter: blur(8px);
}

.teacher2-iframe-modal__panel {
  display: flex;
  flex-direction: column;
  width: min(1440px, calc(100vw - 64px));
  height: min(860px, calc(100vh - 64px));
  overflow: hidden;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 32px 80px rgba(12, 15, 16, 0.18);
}

.teacher2-iframe-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(174, 179, 181, 0.18);
}

.teacher2-iframe-modal__title {
  min-width: 0;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 20px;
  font-weight: 700;
}

.teacher2-iframe-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: #f2f4f5;
  color: #5a6062;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.teacher2-iframe-modal__close:hover {
  background: #e5e9eb;
  color: #2e3335;
}

.teacher2-iframe-modal__body {
  position: relative;
  flex: 1;
  min-height: 0;
  background: #f8f9fa;
}

.teacher2-iframe-modal__loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #5a6062;
  font-size: 15px;
  font-weight: 600;
}

.teacher2-iframe-modal__spinner {
  width: 34px;
  height: 34px;
  border: 3px solid rgba(0, 91, 194, 0.14);
  border-top-color: #005bc2;
  border-radius: 999px;
  animation: teacher2-spin 0.8s linear infinite;
}

.teacher2-tool-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  background: #ffffff;
}

.teacher2-tool-iframe.is-hidden {
  visibility: hidden;
}

@keyframes teacher2-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.teacher2-ai-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--grid-gap);
}

.teacher2-ai-card {
  overflow: hidden;
  border: 1px solid rgba(174, 179, 181, 0.1);
  border-radius: 24px;
  background: #ffffff;
  cursor: default;
  transition: box-shadow 0.2s ease;
}

.teacher2-ai-card:hover {
  box-shadow: 0 20px 40px rgba(46, 51, 53, 0.08);
}

.teacher2-ai-card__cover {
  position: relative;
  height: clamp(224px, 14vw, 248px);
  overflow: hidden;
}

.teacher2-ai-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.teacher2-ai-card:hover .teacher2-ai-card__image {
  transform: scale(1.1);
}

.teacher2-ai-card__overlay {
  position: absolute;
  inset: 0;
}

.teacher2-ai-card__body {
  padding: clamp(20px, 1.5vw, 24px);
}

.teacher2-ai-card__title {
  margin: 0;
  font-size: clamp(20px, 1.35vw, 22px);
  font-weight: 500;
  text-align: center;
}

.teacher2-ai-modal {
  position: fixed;
  inset: 0;
  z-index: 1900;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(12, 15, 16, 0.4);
  backdrop-filter: blur(6px);
}

.teacher2-ai-modal__panel {
  display: flex;
  flex-direction: column;
  width: min(560px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  overflow: hidden;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(12, 15, 16, 0.18);
}

.teacher2-ai-modal__panel--select {
  width: min(920px, calc(100vw - 48px));
}

.teacher2-ai-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(174, 179, 181, 0.18);
}

.teacher2-ai-modal__title {
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 22px;
  font-weight: 700;
}

.teacher2-ai-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: #f2f4f5;
  color: #5a6062;
}

.teacher2-ai-modal__body {
  padding: 24px;
}

.teacher2-ai-modal__body--select {
  overflow-y: auto;
}

.teacher2-ai-modal__section + .teacher2-ai-modal__section {
  margin-top: 24px;
}

.teacher2-ai-modal__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.teacher2-ai-modal__section-head--stack {
  align-items: flex-start;
  flex-direction: column;
}

.teacher2-ai-modal__section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.teacher2-ai-modal__section-title {
  color: #2e3335;
  font-size: 18px;
  font-weight: 700;
}

.teacher2-ai-modal__section-desc {
  margin-top: 6px;
  color: #5a6062;
  font-size: 14px;
  line-height: 1.6;
}

.teacher2-ai-modal__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  background: #eef4ff;
  color: #005bc2;
  font-size: 14px;
  font-weight: 700;
}

.teacher2-ai-model-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.teacher2-ai-model-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(174, 179, 181, 0.16);
  border-radius: 20px;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.teacher2-ai-model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 36px rgba(46, 51, 53, 0.08);
}

.teacher2-ai-model-card__delete {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  padding: 6px 10px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #d9485f;
  font-size: 12px;
  font-weight: 700;
}

.teacher2-ai-model-card__cover {
  aspect-ratio: 600 / 372;
  background: #f2f4f5;
  overflow: hidden;
}

.teacher2-ai-model-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.teacher2-ai-model-card__body {
  padding: 16px;
}

.teacher2-ai-model-card__name {
  color: #2e3335;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  word-break: break-word;
}

.teacher2-ai-model-card__time {
  margin-top: 6px;
  color: #5a6062;
  font-size: 13px;
}

.teacher2-ai-modal__empty {
  margin-top: 18px;
  padding: 28px 16px;
  border-radius: 18px;
  background: #f8f9fa;
  color: #5a6062;
  font-size: 14px;
  text-align: center;
}

.teacher2-ai-modal__field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.teacher2-ai-modal__label {
  color: #2e3335;
  font-size: 15px;
  font-weight: 700;
}

.teacher2-ai-modal__input {
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(174, 179, 181, 0.28);
  border-radius: 14px;
  color: #2e3335;
  font-size: 15px;
  outline: none;
}

.teacher2-ai-modal__input:focus {
  border-color: rgba(0, 91, 194, 0.42);
  box-shadow: 0 0 0 4px rgba(0, 91, 194, 0.08);
}

.teacher2-ai-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
}

.teacher2-ai-modal__footer--single {
  justify-content: flex-end;
}

.teacher2-ai-modal__cancel,
.teacher2-ai-modal__confirm {
  min-width: 96px;
  min-height: 44px;
  padding: 0 20px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.teacher2-ai-modal__cancel {
  border: 1px solid rgba(174, 179, 181, 0.24);
  background: #ffffff;
  color: #2e3335;
}

.teacher2-ai-modal__confirm {
  border: 0;
  background: #005bc2;
  color: #ffffff;
}

.teacher2-quick-modal {
  position: fixed;
  inset: 0;
  z-index: 1950;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(12, 15, 16, 0.42);
  backdrop-filter: blur(8px);
}

.teacher2-quick-modal__panel {
  display: flex;
  flex-direction: column;
  width: min(520px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  overflow: hidden;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(12, 15, 16, 0.18);
}

.teacher2-quick-modal__panel--result {
  width: min(560px, calc(100vw - 48px));
}

.teacher2-quick-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(174, 179, 181, 0.18);
}

.teacher2-quick-modal__title {
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 22px;
  font-weight: 700;
}

.teacher2-quick-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: #f2f4f5;
  color: #5a6062;
}

.teacher2-quick-modal__body {
  padding: 24px;
}

.teacher2-quick-modal__body--result {
  text-align: center;
}

.teacher2-quick-modal__tip {
  margin: 0 0 16px;
  color: #5a6062;
  font-size: 14px;
}

.teacher2-quick-modal__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.teacher2-quick-modal__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border: 1px solid rgba(174, 179, 181, 0.2);
  border-radius: 16px;
  background: #ffffff;
  color: #2e3335;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
}

.teacher2-quick-modal__item.is-selected {
  border-color: rgba(0, 91, 194, 0.42);
  background: rgba(0, 91, 194, 0.04);
  color: #005bc2;
}

.teacher2-quick-modal__item-check {
  font-size: 18px;
}

.teacher2-quick-modal__empty {
  padding: 28px 16px;
  border-radius: 16px;
  background: #f8f9fa;
  color: #5a6062;
  font-size: 14px;
  text-align: center;
}

.teacher2-quick-modal__result-title {
  color: #2e3335;
  font-size: 20px;
  font-weight: 700;
}

.teacher2-quick-modal__result-class {
  margin-top: 10px;
  color: #005bc2;
  font-size: 26px;
  font-weight: 800;
}

.teacher2-quick-modal__result-expire {
  margin-top: 8px;
  color: #5a6062;
  font-size: 14px;
}

.teacher2-quick-modal__result-card {
  position: relative;
  margin-top: 24px;
  padding: 24px 20px;
  border-radius: 20px;
  background: #f8f9fa;
  text-align: left;
}

.teacher2-quick-modal__result-row {
  color: #2e3335;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.8;
}

.teacher2-quick-modal__copy {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  border: 0;
  background: transparent;
  color: #005bc2;
  font-size: 14px;
  font-weight: 700;
}

.teacher2-quick-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
}

.teacher2-quick-modal__button {
  min-width: 96px;
  min-height: 44px;
  padding: 0 20px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
}

.teacher2-quick-modal__button--ghost {
  border: 1px solid rgba(174, 179, 181, 0.24);
  background: #ffffff;
  color: #2e3335;
}

.teacher2-quick-modal__button--primary {
  border: 0;
  background: #005bc2;
  color: #ffffff;
}

.teacher2-quick-modal__button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.teacher2-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.teacher2-filter-row__main {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.teacher2-select {
  min-width: 160px;
  padding: 12px 24px;
  border: 0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(46, 51, 53, 0.04);
  color: #2e3335;
  font-size: 14px;
  font-weight: 700;
  outline: none;
  cursor: pointer;
}

.teacher2-record-grid {
  --teacher2-record-cover-height: clamp(334px, calc(5.714vw + 248.29px), 358px);
  --teacher2-record-grid-gap: 8px;
  --teacher2-record-card-height: clamp(188px, 12.8vw, 204px);
  display: grid;
  grid-template-columns: clamp(248px, 18vw, 280px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.teacher2-record-empty {
  display: flex;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 28px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.94) 0%,
    rgba(244, 248, 255, 0.96) 100%
  );
  box-shadow: 0 10px 28px rgba(46, 51, 53, 0.05);
  text-align: center;
  padding: 40px 32px;
}

.teacher2-record-empty__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 24px;
  background: rgba(0, 91, 194, 0.08);
}

.teacher2-record-empty__icon {
  color: #005bc2;
  font-size: 34px;
  font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
}

.teacher2-record-empty__title {
  margin: 0;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 24px;
  font-weight: 700;
}

.teacher2-record-empty__desc {
  max-width: 560px;
  margin: 0;
  color: #5a6062;
  font-size: 15px;
  line-height: 1.7;
}

.teacher2-cover-card {
  position: relative;
  height: var(--teacher2-record-cover-height);
  overflow: hidden;
  border: 1px solid rgba(174, 179, 181, 0.3);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(46, 51, 53, 0.04);
  cursor: pointer;
}

.teacher2-cover-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  transition: transform 0.7s ease;
}

.teacher2-cover-card:hover .teacher2-cover-card__image {
  transform: scale(1.05);
}

.teacher2-cover-card__mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.teacher2-lesson-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: var(--teacher2-record-card-height);
  gap: var(--teacher2-record-grid-gap);
  height: var(--teacher2-record-cover-height);
  max-height: var(--teacher2-record-cover-height);
  overflow-x: hidden;
  overflow-y: auto;
  align-content: start;
  padding-right: 8px;
}

.teacher2-lesson-grid::-webkit-scrollbar {
  width: 6px;
}

.teacher2-lesson-grid::-webkit-scrollbar-track {
  background: transparent;
}

.teacher2-lesson-grid::-webkit-scrollbar-thumb {
  background-color: rgba(174, 179, 181, 0.4);
  border-radius: 4px;
}

.teacher2-lesson-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  height: var(--teacher2-record-card-height);
  min-height: var(--teacher2-record-card-height);
  padding: 14px 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 91, 194, 0.7);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(46, 51, 53, 0.04);
}

.teacher2-lesson-card__order {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(0, 91, 194, 0.1);
  color: #005bc2;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 800;
}

.teacher2-lesson-card__status {
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}

.teacher2-lesson-card__status.is-finished {
  background: #dcfce7;
  color: #15803d;
}

.teacher2-lesson-card__status.is-last {
  background: #dcfce7;
  color: #15803d;
}

.teacher2-lesson-card__status.is-ongoing {
  background: #dbeafe;
  color: #1d4ed8;
}

.teacher2-lesson-card__status.is-pending {
  background: #ffedd5;
  color: #c2410c;
}

.teacher2-lesson-card__title {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  margin: 50px 0 0;
  padding: 0 4px;
  color: #2e3335;
  font-size: clamp(14px, 0.95vw, 16px);
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.teacher2-lesson-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: auto;
  width: 100%;
}

.teacher2-lesson-card__button {
  min-height: 36px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.teacher2-lesson-card__button--primary {
  border: 0;
  background: #005bc2;
  color: #ffffff;
}

.teacher2-lesson-card__button--secondary {
  border: 1px solid rgba(0, 91, 194, 0.2);
  background: #ffffff;
  color: #005bc2;
}

/* --- MSelect 适配本页原本风格 --- */
:deep(.teacher2-custom-select > div) {
  padding: 12px 24px !important;
  border: 0 !important;
  border-radius: 16px !important;
  background: #ffffff !important;
  box-shadow: 0 4px 16px rgba(46, 51, 53, 0.04) !important;
  color: #2e3335 !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  height: auto !important;
}

:deep(.teacher2-custom-select > div > span:first-child) {
  white-space: nowrap !important;
}

:deep(.teacher2-custom-select > div.ring-2) {
  box-shadow: 0 0 0 2px rgba(0, 91, 194, 0.1) !important;
  border: 0 !important;
}

:global(.teacher2-custom-dropdown) {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(46, 51, 53, 0.08) !important;
  border: 0 !important;
  padding: 8px 0 !important;
}

:global(.teacher2-custom-dropdown > div.py-1 > div) {
  padding: 10px 16px !important;
  margin: 0 8px 4px !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  transition: all 0.2s !important;
}

/* 选中的大块高亮 */
:global(.teacher2-custom-dropdown > div.py-1 > div:not(.text-gray-700)) {
  background-color: #005bc2 !important;
  color: #ffffff !important;
}

/* 未选中的正常化 */
:global(.teacher2-custom-dropdown > div.py-1 > div.text-gray-700) {
  background-color: transparent !important;
  color: #2e3335 !important;
}

/* 未选中的移入 */
:global(.teacher2-custom-dropdown > div.py-1 > div.text-gray-700:hover) {
  background-color: rgba(0, 91, 194, 0.08) !important;
  color: #005bc2 !important;
}
</style>
