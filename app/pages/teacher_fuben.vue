<template>
  <div class="teacher-page">
    <div class="teacher-dashboard">
      <section class="dashboard-top-row">
        <div
          class="dashboard-panel dashboard-panel--hero"
          :style="{ '--teacher-hero-card-bg': teacherCenterCardBg }"
        >
          <div class="dashboard-panel-title dashboard-panel-title--top">教师中心</div>
          <div class="teacher-center-card">
            <div class="teacher-center-actions">
              <button
                type="button"
                class="teacher-center-action teacher-center-action--primary"
                @click="handleGoToClass"
              >
                授课
              </button>
              <button type="button" class="teacher-center-action" @click="goToLessons">
                备课
              </button>
              <button type="button" class="teacher-center-action" @click="handleGoToTask">
                任务管理
              </button>
            </div>
          </div>
        </div>

        <div class="dashboard-panel dashboard-panel--stats">
          <div class="dashboard-panel-title dashboard-panel-title--top">信息</div>
          <div class="teacher-stats-grid">
            <template v-if="pageLoading">
              <div
                v-for="i in 4"
                :key="i"
                class="teacher-stat-card teacher-stat-card--skeleton"
              >
                <el-skeleton animated :rows="0">
                  <template #template>
                    <div class="teacher-stat-skeleton">
                      <el-skeleton-item
                        variant="circle"
                        style="width: 52px; height: 52px"
                      />
                      <div class="teacher-stat-skeleton-content">
                        <el-skeleton-item
                          variant="text"
                          style="width: 72px; margin-bottom: 12px"
                        />
                        <el-skeleton-item
                          variant="text"
                          style="width: 54px; height: 32px"
                        />
                      </div>
                    </div>
                  </template>
                </el-skeleton>
              </div>
            </template>
            <template v-else>
              <div
                v-for="card in dashboardInfoCards"
                :key="card.key"
                class="teacher-stat-card"
              >
                <img :src="card.icon" :alt="card.label" class="teacher-stat-icon" />
                <div class="teacher-stat-content">
                  <div class="teacher-stat-label">{{ card.label }}</div>
                  <div class="teacher-stat-value">{{ card.value }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <section class="dashboard-tool-row">
        <div class="dashboard-panel dashboard-tool-panel">
          <div class="dashboard-panel-header">
            <span class="dashboard-panel-title">{{ $t("teacher.mataToolCenter") }}</span>
          </div>
          <div class="dashboard-tool-body">
            <div class="dashboard-quick-grid dashboard-quick-grid--tools">
              <button
                v-for="item in dashboardToolCards"
                :key="item.key"
                type="button"
                class="dashboard-quick-card dashboard-quick-card--plain"
                @click="handleOpenTool(item.key)"
              >
                <span class="dashboard-quick-icon dashboard-quick-icon--tool">
                  <img :src="item.image" :alt="item.label" />
                </span>
                <span class="dashboard-quick-label dashboard-quick-label--tool">{{
                  item.label
                }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="dashboard-panel dashboard-tool-panel">
          <div class="dashboard-panel-header">
            <span class="dashboard-panel-title">{{
              $t("teacher.aiPracticeCenter")
            }}</span>
          </div>
          <div class="dashboard-tool-body">
            <div class="dashboard-quick-grid dashboard-quick-grid--ai">
              <button
                v-for="item in dashboardAICards"
                :key="item.key"
                type="button"
                class="dashboard-quick-card dashboard-quick-card--plain"
                @click="handleOpenAIModal(item.key)"
              >
                <span class="dashboard-quick-icon dashboard-quick-icon--ai">
                  <img :src="item.image" :alt="item.label" />
                </span>
                <span class="dashboard-quick-label dashboard-quick-label--ai">{{
                  item.label
                }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="dashboard-panel dashboard-record-panel">
        <div class="dashboard-record-header">
          <span class="dashboard-panel-title">{{ $t("teacher.teachingRecord") }}</span>
        </div>

        <div class="dashboard-record-card">
          <template v-if="pageLoading">
            <div class="dashboard-record-toolbar">
              <div class="dashboard-record-toolbar-main">
                <el-skeleton-item
                  variant="rect"
                  style="width: 180px; height: 42px; border-radius: 999px"
                />
                <el-skeleton-item
                  variant="rect"
                  style="width: 220px; height: 42px; border-radius: 999px"
                />
              </div>
              <el-skeleton-item
                variant="rect"
                style="width: 110px; height: 44px; border-radius: 999px"
              />
            </div>
            <div class="dashboard-record-body dashboard-record-body--skeleton">
              <el-skeleton-item
                variant="rect"
                style="width: 100%; height: 360px; border-radius: 24px"
              />
              <div class="dashboard-chapter-grid dashboard-chapter-grid--skeleton">
                <el-skeleton-item
                  v-for="i in 6"
                  :key="i"
                  variant="rect"
                  style="width: 100%; height: 168px; border-radius: 24px"
                />
              </div>
            </div>
          </template>

          <template v-else-if="teachList.length > 0">
            <div class="dashboard-record-toolbar">
              <div class="dashboard-record-toolbar-main">
                <MSelect
                  v-model="selectedClassId"
                  :options="classOptions"
                  value-key="value"
                  label-key="label"
                  :placeholder="$t('teacher.selectClass')"
                  class="dashboard-select dashboard-select--class"
                />

                <div
                  class="dashboard-course-select"
                  @mouseenter="showCoursePopover = true"
                  @mouseleave="showCoursePopover = false"
                >
                  <MSelect
                    v-model="selectedCourseId"
                    :options="courseOptions"
                    value-key="value"
                    label-key="label"
                    :placeholder="$t('teacher.selectCourse')"
                    class="dashboard-select"
                  />
                  <Transition name="fade">
                    <div
                      v-if="showCoursePopover && selectedCourse?.courseName"
                      class="course-tooltip"
                    >
                      {{ selectedCourse?.courseName }}
                      <div class="tooltip-arrow"></div>
                    </div>
                  </Transition>
                </div>
              </div>

              <button
                type="button"
                class="dashboard-quick-login-btn"
                @click="handleQuickLoginBtnClick"
              >
                {{ dashboardQuickLoginLabel }}
              </button>
            </div>

            <div class="dashboard-record-body">
              <div class="dashboard-course-column">
                <div class="dashboard-course-card" @click="goToCourse">
                  <img
                    v-if="selectedCourse?.courseCoverUrl"
                    :src="selectedCourse.courseCoverUrl"
                    :alt="$t('common.courseCover')"
                    class="dashboard-course-cover"
                  />
                  <div
                    v-else
                    class="dashboard-course-cover dashboard-course-cover--placeholder"
                  >
                    暂无课程封面
                  </div>
                </div>
              </div>

              <div class="dashboard-chapter-column">
                <div v-if="chapterList.length > 0" class="dashboard-chapter-grid">
                  <div
                    v-for="chapter in chapterList"
                    :key="chapter.chapterId"
                    class="dashboard-chapter-card"
                    :class="{ 'is-selected': selectedChapterId === chapter.chapterId }"
                    @click="selectedChapterId = chapter.chapterId"
                  >
                    <span
                      class="dashboard-chapter-status"
                      :class="{
                        'status-ended': getChapterStatus(chapter) === 0,
                        'status-not-started': getChapterStatus(chapter) === 1,
                        'status-last': getChapterStatus(chapter) === 2,
                        'status-ongoing': getChapterStatus(chapter) === 3,
                      }"
                    >
                      {{ getChapterStatusText(chapter) }}
                    </span>

                    <span class="dashboard-chapter-name">
                      {{ formatChapterName(chapter.chapterName) }}
                    </span>

                    <div class="dashboard-chapter-actions">
                      <button
                        type="button"
                        class="dashboard-action-btn teach-btn"
                        @click.stop="goToTeach(chapter)"
                      >
                        {{
                          chapter.teachStatus === 1
                            ? $t("teacher.backToClassroom")
                            : chapter.teachStatus === 2
                            ? $t("teacher.classAgain")
                            : $t("teacher.goToClass")
                        }}
                      </button>
                      <button
                        v-if="chapter.teachStatus !== 1"
                        type="button"
                        class="dashboard-action-btn prepare-btn"
                        @click.stop="goToPrepare(chapter)"
                      >
                        {{
                          chapter.teachStatus === 2
                            ? $t("teacher.continuePrepare")
                            : $t("teacher.goToPrepare")
                        }}
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="dashboard-empty-state dashboard-empty-state--chapter">
                  {{ $t("teacher.noChapter") }}
                </div>
              </div>
            </div>
          </template>

          <div v-else class="dashboard-empty-state">
            {{ $t("teacher.noTeachingRecord") }}
          </div>
        </div>
      </section>

      <div
        v-if="showAIModelSelectModal"
        class="modal-overlay"
        @click="closeAIModelSelectModal"
      >
        <div class="modal-content model-select-modal" @click.stop>
          <div class="modal-header">
            <span class="modal-title">{{
              currentAIModel ? $t(currentAIModel.label) : ""
            }}</span>
            <button class="close-btn" @click="closeAIModelSelectModal">
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
                  @click="openAICreateModal"
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
                  <span v-if="savedAIModels.length" class="model-select-count">{{
                    savedAIModels.length
                  }}</span>
                </div>
                <div class="model-select-section-desc">
                  {{ $t("ai.myCreatedModelsDesc") }}
                </div>
              </div>

              <div v-if="savedAIModelsLoading" class="model-list-empty">
                {{ $t("common.loading") }}
              </div>
              <div v-else-if="!savedAIModels.length" class="model-list-empty">
                {{ $t("ai.noCreatedModels") }}
              </div>
              <div v-else class="model-card-grid">
                <div
                  v-for="item in savedAIModels"
                  :key="item.id"
                  class="model-card"
                  @click="handleOpenAISavedModel(item)"
                >
                  <button
                    class="model-card-delete"
                    type="button"
                    @click.stop="handleDeleteAISavedModel(item)"
                  >
                    删除
                  </button>
                  <div class="model-card-cover">
                    <img :src="getSavedAIModelCover(item.toolKey)" alt="" />
                  </div>
                  <div class="model-card-body">
                    <div class="model-card-name">{{ item.name }}</div>
                    <div class="model-card-time">
                      {{ item.updatedAt ? formatSavedAIModelTime(item.updatedAt) : "-" }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer modal-footer--single">
            <button class="btn-cancel" @click="closeAIModelSelectModal">
              {{ $t("common.cancel") }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showAICreateModal" class="modal-overlay" @click="closeAICreateModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <span class="modal-title">{{
              $t("ai.newModelTitle", {
                name: currentAIModel ? $t(currentAIModel.label) : "",
              })
            }}</span>
            <button class="close-btn" @click="closeAICreateModal">
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
              <span class="form-label">{{ $t("ai.modelName") }}</span>
              <input
                v-model="aiModelName"
                type="text"
                class="form-input"
                :placeholder="$t('ai.inputModelName')"
                @keyup.enter="handleAIConfirm"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeAICreateModal">
              {{ $t("common.cancel") }}
            </button>
            <button class="btn-confirm" @click="handleAIConfirm">
              {{ $t("common.confirm") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 开课设置弹窗 -->
    <StartClassModal
      v-model:visible="showStartClassModal"
      :class-list="startClassData.classList"
      :course-list="startClassData.courseList"
      :course-tree="startClassData.courseTree"
      :initial-course-id="startClassData.initialCourseId"
      :initial-chapter-id="startClassData.initialChapterId"
      ref="startClassModalRef"
      @class-change="handleClassChange"
      @course-change="handleCourseChange"
      @confirm="handleStartClassConfirm"
    />

    <!-- 快捷登录弹窗 -->
    <MModal
      v-model="showQuickLoginModal"
      :title="$t('teacher.quickLoginModal')"
      size="medium"
      :show-footer="false"
    >
      <div class="quick-login-modal">
        <div class="modal-tip">{{ $t("teacher.selectClassTip") }}</div>

        <div v-if="quickLoginLoading" class="loading-state">
          {{ $t("common.loading") }}
        </div>

        <div v-else class="class-list">
          <div
            v-for="item in quickLoginClassList"
            :key="item.classId"
            class="class-item"
            :class="{ 'is-selected': selectedQuickLoginClassId === item.classId }"
            @click="selectedQuickLoginClassId = item.classId"
          >
            <span class="class-name">{{ item.className }}</span>
            <svg
              v-if="selectedQuickLoginClassId === item.classId"
              class="check-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF9900"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div v-if="quickLoginClassList.length === 0" class="empty-state">
            {{ $t("teacher.noClass") }}
          </div>
        </div>

        <div class="modal-actions">
          <MButton @click="showQuickLoginModal = false">{{
            $t("common.cancel")
          }}</MButton>
          <MButton
            class="confirm-btn"
            :disabled="!selectedQuickLoginClassId"
            @click="handleQuickLoginConfirm"
          >
            {{ $t("common.create") }}
          </MButton>
        </div>
      </div>
    </MModal>

    <!-- 快捷登录结果弹窗 -->
    <MModal
      v-model="showQuickLoginResultModal"
      title=""
      size="medium"
      :show-footer="false"
      :show-close="true"
    >
      <div class="quick-login-result">
        <div class="result-title">{{ $t("teacher.quickLoginMethod") }}</div>
        <div class="result-class-name">{{ quickLoginResultData.className }}</div>
        <div class="result-expire">
          （{{ $t("teacher.validFor2Hours") }}{{ quickLoginResultData.expirationDate
          }}{{ $t("teacher.expire") }}）
        </div>

        <div class="result-info-card">
          <div class="info-row">
            <span>{{ $t("teacher.classCode") }}{{ quickLoginResultData.classCode }}</span>
          </div>
          <div class="info-row">
            <span
              >{{ $t("teacher.unifiedPassword")
              }}{{ quickLoginResultData.classCodePwd }}</span
            >
          </div>
          <button class="copy-btn-inline" @click="copyQuickLoginInfo">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {{ $t("common.copy") }}
          </button>
        </div>

        <div class="result-actions">
          <MButton class="view-login-btn" @click="goToClassPage">
            {{ $t("teacher.viewLoginStatus") }}
          </MButton>
        </div>
      </div>
    </MModal>

    <!-- 工具 iframe 弹窗 -->
    <div
      v-if="showToolIframeModal"
      class="iframe-modal-overlay"
      :class="{ 'iframe-modal-overlay--embedded-ai': currentEmbeddedAI }"
      @click.self="closeToolIframeModal"
    >
      <div
        class="iframe-modal-container"
        :class="{ 'iframe-modal-container--embedded-ai': currentEmbeddedAI }"
      >
        <div v-if="!currentEmbeddedAI" class="iframe-modal-header">
          <span class="iframe-modal-title">{{ currentToolName }}</span>
          <button class="iframe-close-btn" @click="closeToolIframeModal">
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
        <div
          class="iframe-modal-body"
          :class="{ 'iframe-modal-body--embedded-ai': currentEmbeddedAI }"
        >
          <div v-if="toolIframeLoading" class="iframe-loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">{{ $t("common.loading") }}</span>
          </div>
          <iframe
            ref="toolIframeRef"
            :src="currentToolUrl"
            class="tool-iframe"
            :class="{ hidden: toolIframeLoading }"
            frameborder="0"
            allowfullscreen
            allow="camera; microphone; bluetooth; serial"
            @load="onToolIframeLoad"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import '~/assets/css/teacher.css'
import '~/assets/css/teacher-global.css'
import { useTeacher } from "~/composables/api/useTeacher";
import { aiAdmin } from "~/composables/api/ai";
import { personalcenterApi } from "~/composables/api/personalcenter";
import { useI18n } from "vue-i18n";
import { ElMessage, ElMessageBox } from "element-plus";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";
import aigcCover1 from "~/assets/images/1.svg";
import aigcCover2 from "~/assets/images/2.svg";
import aigcCover3 from "~/assets/images/3.svg";
import aigcCover4 from "~/assets/images/4.svg";
import teacherCenterBanner from "~/assets/newimages/bg2.svg";
import statsClassIcon from "~/assets/newimages/988.svg";
import statsTeachingIcon from "~/assets/newimages/987.svg";
import statsOpusIcon from "~/assets/newimages/986.svg";
import statsStudentIcon from "~/assets/newimages/985.svg";
import tool2Icon from "~/assets/images/tool2.png";
import tool1Icon from "~/assets/images/tool1.png";
import tool4Icon from "~/assets/images/too4.png";

const { t: $t, locale } = useI18n();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const teacherCenterCardBg = `url(${teacherCenterBanner})`;
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

definePageMeta({
  layout: "sidebar",
});

const {
  getClassListNoPage,
  getCourseMenuTree,
  getTeachChapterList,
  beginClass,
  getTeachList,
  getQuickLoginInfo,
  getTeacherStats,
} = useTeacher();
const { getAiList, createAi, updateAi, deleteAi, deleteOss, ssoLogin } = aiAdmin();
const { addOpus, uploadOSS } = personalcenterApi();

const goToLessons = () => {
  router.push("/lessons");
};

// 点击课程封面跳转到课程详情
const goToCourse = () => {
  if (selectedCourseId.value) {
    navigateTo(`/system/course/${selectedCourseId.value}`);
  }
};

// 复制班级码
const copyCode = () => {
  const text = `${$t("teacher.classCode")}${quickLoginCode.value}\n${$t(
    "teacher.unifiedPassword"
  )}${quickLoginPwd.value}`;
  navigator.clipboard.writeText(text);
  alert($t("teacher.copied"));
};

// 授课记录数据
interface CourseItem {
  courseId: string;
  courseName: string;
  courseCoverUrl: string;
}

interface TeacherStats {
  classCount: number;
  opusCount: number;
  teachHours: number;
  studentCount: number;
}

const getDefaultTeacherStats = (): TeacherStats => ({
  classCount: 0,
  opusCount: 0,
  teachHours: 0,
  studentCount: 0,
});

// 使用 useAsyncData 加载授课记录（lazy 模式，先显示骨架屏）
const { data: teachList, pending: teachListPending } = useAsyncData(
  "teacher-teach-list",
  async () => {
    const data = await getTeachList();
    return data;
  },
  {
    lazy: true,
    // 默认空数组
    default: () => [],
    // 数据转换
    transform: (data: any) => {
      if (!Array.isArray(data)) return [];
      return data.map((item: any) => ({
        classId: String(item.classId),
        className: item.className,
        gradeName: item.gradeName,
        courseList: (item.courseList || [])
          .filter((course: any) => course.courseId) // 过滤掉没有 courseId 的课程
          .map((course: any) => ({
            courseId: String(course.courseId),
            courseName: course.courseName,
            courseCoverUrl: course.courseCoverUrl || "",
          })),
      }));
    },
  }
);

const { data: teacherStats, pending: teacherStatsPending } = useAsyncData(
  "teacher-stats",
  async () => {
    const data = await getTeacherStats();
    return data;
  },
  {
    lazy: true,
    default: getDefaultTeacherStats,
    transform: (data: any): TeacherStats => ({
      classCount: Number(data?.classCount ?? 0),
      opusCount: Number(data?.opusCount ?? 0),
      teachHours: Number(data?.teachHours ?? 0),
      studentCount: Number(data?.studentCount ?? 0),
    }),
  }
);

const dashboardInfoCards = computed(() => [
  {
    key: "classCount",
    label: $t("teacher.classCount"),
    value: teacherStats.value?.classCount ?? 0,
    icon: statsClassIcon,
  },
  {
    key: "teachingHours",
    label: $t("teacher.teachingHours"),
    value: teacherStats.value?.teachHours ?? 0,
    icon: statsTeachingIcon,
  },
  {
    key: "submittedWorks",
    label: $t("teacher.submittedWorks"),
    value: teacherStats.value?.opusCount ?? 0,
    icon: statsOpusIcon,
  },
  {
    key: "studentCount",
    label: $t("teacher.studentCount"),
    value: teacherStats.value?.studentCount ?? 0,
    icon: statsStudentIcon,
  },
]);

const dashboardToolCards = [
  {
    key: "vincibot",
    label: "MatataCode（VinciBot）",
    image: tool1Icon,
  },
  {
    key: "nous",
    label: "MatataCode（Nous）",
    image: tool2Icon,
  },
  {
    key: "talemap",
    label: "MatataCode(TaleMap)",
    image: tool4Icon,
  },
];

const selectedClassId = ref<string | null>(null);
const selectedCourseId = ref<string | null>(null);
const selectedChapterId = ref<string | null>(null);
const showCoursePopover = ref(false);

// 章节列表数据
interface ChapterItem {
  chapterId: string;
  chapterName: string;
  teachStatus: number;
  isLatestTeach: number;
}
interface OngoingClassroomInfo {
  classId: string;
  courseId: string;
  chapterId: string;
  expireAt?: number;
}
const chapterList = ref<ChapterItem[]>([]);

// 加载章节列表
const loadChapterList = async () => {
  if (!selectedCourseId.value || !selectedClassId.value) {
    chapterList.value = [];
    return;
  }

  try {
    const data = await getTeachChapterList(selectedCourseId.value, selectedClassId.value);
    if (data && Array.isArray(data)) {
      chapterList.value = data.map((c: any) => ({
        chapterId: String(c.chapterId),
        chapterName: c.chapterName,
        teachStatus: c.teachStatus ?? 0,
        isLatestTeach: c.isLatestTeach ?? 0,
      }));
    } else {
      chapterList.value = [];
    }
  } catch (error) {
    console.error("加载章节列表失败:", error);
    chapterList.value = [];
  }
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
    console.error("校验进行中课堂失败:", error);
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

  const ongoingClassName =
    teachList.value.find((item: any) => String(item.classId) === ongoing.classId)?.className || "";

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

// 监听 teachList 变化，自动选中第一个班级
watch(
  teachList,
  (list) => {
    if (list.length > 0 && list[0] && !selectedClassId.value) {
      selectedClassId.value = list[0].classId;
    }
  },
  { immediate: true }
);

// 班级切换时，重置课程选择并默认选中第一个课程
watch(
  selectedClassId,
  (newClassId) => {
    if (newClassId) {
      const selectedClass = teachList.value.find((item) => item.classId === newClassId);
      if (selectedClass?.courseList && selectedClass.courseList.length > 0) {
        const firstCourse = selectedClass.courseList[0];
        selectedCourseId.value = firstCourse?.courseId || null;
        console.log(
          "班级切换，选中课程:",
          firstCourse?.courseId,
          firstCourse?.courseName
        );
      } else {
        selectedCourseId.value = null;
        console.log("班级切换，没有课程");
      }
    } else {
      selectedCourseId.value = null;
    }
  },
  { immediate: true }
);

// 监听课程变化，加载章节列表
watch(
  selectedCourseId,
  (newCourseId) => {
    console.log("课程变化:", newCourseId);
    loadChapterList();
  },
  { immediate: true }
);

// 快捷登录相关
const showLoginPopover = ref(false);

const createEmptyQuickLoginInfo = () => ({
  classCode: "",
  classCodePwd: "",
  expirationDate: "",
});

const normalizeQuickLoginInfo = (data?: any) => ({
  classCode: data?.classCode || "",
  classCodePwd: data?.classCodePwd || "",
  expirationDate: data?.expirationDate || "",
});

const quickLoginInfo = ref(createEmptyQuickLoginInfo());

const refreshQuickLoginInfo = async () => {
  try {
    const data = await getQuickLoginInfo();
    quickLoginInfo.value = normalizeQuickLoginInfo(data);
  } catch (error) {
    console.error("获取快捷登录信息失败:", error);
    quickLoginInfo.value = createEmptyQuickLoginInfo();
  }
};

// 页面加载状态（最少显示 150ms 骨架屏，避免闪烁）
const minLoadingDone = ref(false);
onMounted(() => {
  toggleTeacherOuterScroll(true);
  // 教师首页只主动加载一次快捷登录状态，避免同一接口重复请求
  refreshQuickLoginInfo();

  if (import.meta.dev && typeof window !== "undefined") {
    // 开发时打印当前视口参数，便于复现大屏缩放场景
    console.log("[teacher-debug] viewport", {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      dpr: window.devicePixelRatio,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
    });
  }

  setTimeout(() => {
    minLoadingDone.value = true;
  }, 0);
});

onBeforeUnmount(() => {
  toggleTeacherOuterScroll(false);
});

const pageLoading = computed(
  () => !minLoadingDone.value || teachListPending.value || teacherStatsPending.value
);

// 从 quickLoginInfo 中解构出各个字段（保持响应式）
const quickLoginCode = computed(() => quickLoginInfo.value.classCode);
const quickLoginPwd = computed(() => quickLoginInfo.value.classCodePwd);
const quickLoginExpire = computed(() => quickLoginInfo.value.expirationDate);
const dashboardQuickLoginLabel = computed(() => $t("auth.classCodeLogin"));
const TEACHER_QUICK_LOGIN_STORAGE_KEY = "teacher_quick_login_info";
const TEACHER_OUTER_SCROLL_CLASS = "teacher-page-use-outer-scroll";

const toggleTeacherOuterScroll = (enabled: boolean) => {
  if (typeof document === "undefined") return;

  document.documentElement.classList.toggle(TEACHER_OUTER_SCROLL_CLASS, enabled);
  document.body.classList.toggle(TEACHER_OUTER_SCROLL_CLASS, enabled);
};

const syncTeacherQuickLoginCache = (data?: {
  classCode?: string;
  classCodePwd?: string;
  expirationDate?: string;
} | null) => {
  if (typeof window === "undefined") return;

  const classCode = String(data?.classCode || quickLoginCode.value || "").trim();
  if (!classCode) {
    localStorage.removeItem(TEACHER_QUICK_LOGIN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    TEACHER_QUICK_LOGIN_STORAGE_KEY,
    JSON.stringify({
      classCode,
      classCodePwd: String(data?.classCodePwd || quickLoginPwd.value || ""),
      expirationDate: String(data?.expirationDate || quickLoginExpire.value || ""),
      expireAt: Date.now() + 2 * 60 * 60 * 1000,
    })
  );
};

// 工具 iframe 弹窗相关
const showToolIframeModal = ref(false);
const currentToolUrl = ref("");
const currentToolName = ref("");
const toolIframeLoading = ref(true);
const toolIframeRef = ref<HTMLIFrameElement | null>(null);
const currentToolCacheKey = ref("");
const currentToolOnlyCreate = ref(false);
const currentEmbeddedAI = ref(false);
const savedProjectZipCache = new Map<string, File>();

interface TeacherAICardItem {
  key: string;
  label: string;
  cover: string;
}

interface SavedAITeacherModelRecord {
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

interface SavedAITeacherModelListItem {
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

const teacherAIItems: Record<string, TeacherAICardItem> = {
  imageClassModel: {
    key: "imageClassModel",
    label: "ai.imageClassModel",
    cover: aigcCover1,
  },
  gestureClassModel: {
    key: "gestureClassModel",
    label: "ai.gestureClassModel",
    cover: aigcCover2,
  },
  voiceClassModel: {
    key: "voiceClassModel",
    label: "ai.voiceClassModel",
    cover: aigcCover3,
  },
  poseClassModel: {
    key: "poseClassModel",
    label: "ai.poseClassModel",
    cover: aigcCover4,
  },
};

const dashboardAICards = computed(() => [
  {
    key: "imageClassModel",
    label: $t("ai.imageClassModel"),
    image: aigcCover1,
  },
  {
    key: "gestureClassModel",
    label: $t("ai.gestureClassModel"),
    image: aigcCover2,
  },
  {
    key: "voiceClassModel",
    label: $t("ai.voiceClassModel"),
    image: aigcCover3,
  },
  {
    key: "poseClassModel",
    label: $t("ai.poseClassModel"),
    image: aigcCover4,
  },
]);

const AI_MODEL_DB_NAME = "mata-ai-models-db";
const AI_MODEL_STORE_NAME = "models";

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

const saveAITeacherModelRecord = async (record: SavedAITeacherModelRecord) => {
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

const getAITeacherModelRecord = async (modelId: string) => {
  const db = await openAIModelDb();

  return new Promise<SavedAITeacherModelRecord | null>((resolve, reject) => {
    const transaction = db.transaction(AI_MODEL_STORE_NAME, "readonly");
    const store = transaction.objectStore(AI_MODEL_STORE_NAME);
    const request = store.get(modelId);

    request.onsuccess = () =>
      resolve((request.result as SavedAITeacherModelRecord | undefined) || null);
    request.onerror = () => reject(request.error || new Error("读取模型文件失败"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () =>
      reject(transaction.error || new Error("读取模型文件失败"));
  });
};

const deleteAITeacherModelRecord = async (modelId: string) => {
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

const parseToolIframeMessageData = parseMessageData;

const toToolZipFile = (payload: unknown) => toZipFile(payload);

const toToolWorkFile = (
  payload: unknown,
  fileName?: string,
  fallbackExtension = ".sb3"
) => toWorkFile(payload, fileName, fallbackExtension);

const downloadToolZipFile = (zipFile: File) => {
  const downloadUrl = URL.createObjectURL(zipFile);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = zipFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
};

const uploadToolWorkFileToOSS = async (file: File) =>
  uploadFileToOSS(file, "上传作品文件失败");
const uploadToolProjectFileToOSS = async (file: File) =>
  uploadFileToOSS(file, "上传模型文件失败");

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
  const modelType = typeof messageData?.modelType === "string" ? messageData.modelType : "";
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
  if (nameSource.includes("语音") || nameSource.includes("audio") || nameSource.includes("voice")) {
    return "audio_cls";
  }
  if (nameSource.includes("姿态") || nameSource.includes("pose")) {
    return "pose_cls";
  }
  if (nameSource.includes("手势") || nameSource.includes("gesture") || nameSource.includes("hand")) {
    return "gesture_cls";
  }

  return "";
};

const postCachedZipToToolIframe = async () => {
  if (currentToolOnlyCreate.value) {
    return;
  }

  const zipFile = currentToolCacheKey.value
    ? savedProjectZipCache.get(currentToolCacheKey.value)
    : null;
  const isAITool = currentToolCacheKey.value.startsWith("ai:");
  const postResult = await postFileBufferToIframe({
    file: zipFile,
    iframeUrl: currentToolUrl.value,
    iframeWindow: toolIframeRef.value?.contentWindow,
    type: isAITool ? "receive-tm-zip" : "ZIP_DATA",
    payloadOnly: isAITool,
    additionalData: isAITool ? { optId: currentEditingAIModelId.value || undefined } : {},
  });

  if (!postResult) {
    return;
  }

  console.log("已向教师端工具 iframe 发送 ZIP_DATA:", {
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

  if (!messageData || (typeof messageData !== "object" && typeof messageData !== "string")) {
    return;
  }

  if (messageType === "close-ai-embedded") {
    closeToolIframeModal();
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
    const zipFile = toToolZipFile(zipPayload);
    if (!zipFile) {
      console.warn("收到 send-tm-zip 消息，但 payload 不是可转换的文件类型:", messageData);
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

    console.log("收到教师端工具 iframe send-tm-zip 消息:", normalizedMessageData);

    if (currentToolCacheKey.value.startsWith("ai:")) {
      try {
        if (!currentAIModel.value) {
          throw new Error("当前AI模型上下文不存在");
        }
        const saveMode = isEditingAITeacherModel.value ? "edit" : "create";

        const uploadFile = toUploadFile(zipPayload, pickMessageFileName(messageData));
        if (!uploadFile) {
          throw new Error("模型文件格式不正确");
        }

        if (isEditingAITeacherModel.value && currentEditingAIOssId.value) {
          try {
            await deleteOss(currentEditingAIOssId.value);
          } catch (error) {
            console.warn("教师页删除旧OSS对象失败，继续上传新文件:", error);
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
          throw new Error("创建模型参数不完整");
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
        const finalCacheKey = getTeacherAICacheKey(currentAIModel.value.key, finalModelId);
        currentToolCacheKey.value = finalCacheKey;
        savedProjectZipCache.set(finalCacheKey, uploadFile);
        await saveAITeacherModelRecord({
          id: finalModelId,
          toolKey: currentAIModel.value.key,
          name: optName,
          updatedAt: Date.now(),
          fileName: uploadFile.name,
          mimeType: uploadFile.type,
          size: uploadFile.size,
          zipBlob: uploadFile,
          ossId: String(uploadResult.ossId),
          optType,
          url: uploadResult?.url || "",
        });

        isEditingAITeacherModel.value = true;
        await loadSavedAIModels();
        ElMessage.success(saveMode === "edit" ? "编辑成功" : "创建成功");
      } catch (error) {
        console.error("教师页AI中心保存模型失败:", error);
        ElMessage.error(error instanceof Error ? error.message : "保存失败");
      }
      return;
    }

    if (
      currentToolName.value.includes("VinciBot") ||
      currentToolName.value.includes("Nous")
    ) {
      try {
        const uploadFile = toUploadFile(zipPayload, pickMessageFileName(messageData));
        if (!uploadFile) {
          throw new Error("模型文件格式不正确");
        }

        const uploadResult = await uploadToolProjectFileToOSS(uploadFile);
        const userId = getCurrentUserId();
        const optType = getAiOptTypeFromMessage(messageData, uploadFile.name);
        const optName =
          (typeof messageData?.projectName === "string" && messageData.projectName.trim()) ||
          uploadFile.name.replace(/\.[^.]+$/, "");

        if (!uploadResult?.ossId || !userId || !optType) {
          console.warn("教师页工具中心创建模型参数缺失:", {
            ossId: uploadResult?.ossId,
            userId,
            optType,
            uploadFileName: uploadFile.name,
            rawData: messageData,
          });
          throw new Error("创建模型参数不完整");
        }

        console.log("教师页工具中心创建模型参数:", {
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

        console.log("教师页工具中心新建模型成功:", {
          uploadResult,
          createResult,
        });

        ElMessage.success("创建成功");
      } catch (error) {
        console.error("教师页工具中心新建模型失败:", error);
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

    const workFile = toToolWorkFile(
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
      const uploadResult = await uploadToolWorkFileToOSS(workFile);
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
        (typeof messageData?.projectName === "string" && messageData.projectName.trim()) ||
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
        `收到教师端工具 iframe ${messageType} 消息并上传 OSS 成功:`,
        uploadedMessageData
      );

      window.dispatchEvent(
        new CustomEvent(messageType === "send-works-mc" ? "tool-send-works-mc" : "tool-send-works-sb3", {
          detail: uploadedMessageData,
        })
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
  const zipFile = toToolZipFile(zipPayload);
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

  console.log("收到教师端工具 iframe saveProject 消息:", normalizedMessageData);

  try {
    downloadToolZipFile(zipFile);
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

const toolUrls: Record<string, { url: string; nameKey: string }> = {
  vincibot: {
    url: runtimeConfig.public.vincibotCreateUrl,
    nameKey: "teacher.vincibot",
  },

  nous: { url: runtimeConfig.public.nousCreateUrl, nameKey: "teacher.nous" },
  talemap: {
    url:
      "https://www.mediafire.com/file_premium/rz1j080mpbsdhus/MatataCode-TaleMap-v1.0.0-win-x64.exe/file",
    nameKey: "teacher.talemap",
  },
};

// 打开工具 iframe
const handleOpenTool = (toolId: string) => {
  const tool = toolUrls[toolId];
  if (tool) {
    void (async () => {
      let url = tool.url;
      if (toolId === "talemap") {
        window.open(url, "_blank");
        return;
      }

      if (toolId === "vincibot") {
        const token = await getAiToolAccessToken();
        const lang = locale.value === "zh" ? "zh-CN" : "en";
        url = `${url}?token=${encodeURIComponent(token)}&lang=${lang}&ch=aiedu`;
      } else if (toolId === "nous") {
        const token = await getAiToolAccessToken();
        const lang = locale.value === "zh" ? "zh" : "en";
        url = `${url}?token=${encodeURIComponent(token)}&lang=${lang}&ch=aiedu`;
      }

      currentToolUrl.value = url;
      currentToolOnlyCreate.value = toolId === "vincibot" || toolId === "nous";
      if (currentToolOnlyCreate.value) {
        savedProjectZipCache.delete(`tool:${toolId}`);
        currentToolCacheKey.value = "";
      } else {
        currentToolCacheKey.value = `tool:${toolId}`;
      }
      currentToolName.value = $t(tool.nameKey);
      toolIframeLoading.value = true;
      showToolIframeModal.value = true;
    })().catch((error) => {
      console.error("获取工具SSO登录信息失败:", error);
      ElMessage.error(error instanceof Error ? error.message : "获取工具Token失败");
    });
  }
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

const getSavedAIModelCover = (toolKey: string) => {
  return teacherAIItems[toolKey]?.cover || aigcCover1;
};

const formatSavedAIModelTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString(locale.value === "zh" ? "zh-CN" : "en-US", {
    hour12: false,
  });
};

const getTeacherAITypeByKey = (toolKey: string) => {
  const typeMap: Record<string, number> = {
    imageClassModel: 1,
    gestureClassModel: 2,
    voiceClassModel: 3,
    poseClassModel: 4,
  };

  return typeMap[toolKey] || 1;
};

const getTeacherAIOptTypeByKey = (toolKey: string) => {
  const optTypeMap: Record<string, string> = {
    imageClassModel: "image_cls",
    voiceClassModel: "audio_cls",
    poseClassModel: "pose_cls",
    gestureClassModel: "gesture_cls",
  };

  return optTypeMap[toolKey] || "";
};

const getTeacherAICacheKey = (toolKey: string, modelId: string) => `ai:${toolKey}:${modelId}`;

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
          id: String(
            item.optId || item.id || item.aiId || item.ossId || `${Date.now()}`
          ),
          toolKey: currentAIModel.value?.key || "",
          name: modelName,
          updatedAt: normalizeTeacherAIModelTimestamp(
            item.updateTime || item.updatedAt || item.createTime,
            0
          ),
          fileName:
            item.fileName ||
            getTeacherAIFileNameFromUrl(item.url, `${modelName}.zip`),
          mimeType: item.mimeType || "application/octet-stream",
          size: Number(item.size || 0),
          ossId: item.ossId ? String(item.ossId) : "",
          optType: item.optType || "",
          url: item.url || "",
        } satisfies SavedAITeacherModelListItem;
      })
      .sort(
        (a: SavedAITeacherModelListItem, b: SavedAITeacherModelListItem) =>
          b.updatedAt - a.updatedAt
      );
  } catch (error) {
    console.error("加载教师页AI模型列表失败:", error);
    savedAIModels.value = [];
  } finally {
    savedAIModelsLoading.value = false;
  }
};

const downloadTeacherAIModelZipFile = async (item: SavedAITeacherModelListItem) => {
  const fallbackFileName =
    item.fileName || getTeacherAIFileNameFromUrl(item.url, `${item.name || "project"}.zip`);

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
  const url = `https://pre.matatalab.com/?token=${encodeURIComponent(token)}&type=${type}&projectName=${encodeURIComponent(projectName)}&lang=${lang}&ch=aiedu&type2=opt${isEditingAITeacherModel.value ? `&optId=${encodeURIComponent(modelId)}` : ""}`;

  currentToolUrl.value = url;
  currentToolName.value = $t(tool.label);
  currentToolCacheKey.value = getTeacherAICacheKey(tool.key, modelId);
  currentToolOnlyCreate.value = false;
  currentEmbeddedAI.value = false;
  toolIframeLoading.value = true;
  currentAIProjectName.value = projectName;
  currentEditingAIModelId.value = modelId;
  showAIModelSelectModal.value = false;
  showAICreateModal.value = false;
  showToolIframeModal.value = true;
};

const handleOpenAIModal = (key: string) => {
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
    ElMessage.warning($t("ai.inputModelName"));
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
    if (cachedFile) {
      isEditingAITeacherModel.value = true;
      currentEditingAIOssId.value = item.ossId || "";
      await openTeacherAIIframe(currentAIModel.value, item.name, item.id);
      return;
    }

    const localRecord = await getAITeacherModelRecord(item.id);
    if (localRecord) {
      const localFile = new File([localRecord.zipBlob], localRecord.fileName, {
        type: localRecord.mimeType || "application/octet-stream",
        lastModified: localRecord.updatedAt,
      });
      savedProjectZipCache.set(cacheKey, localFile);
      isEditingAITeacherModel.value = true;
      currentEditingAIOssId.value = item.ossId || localRecord.ossId || "";
      await openTeacherAIIframe(currentAIModel.value, item.name, item.id);
      return;
    }

    const remoteFile = await downloadTeacherAIModelZipFile(item);
    if (remoteFile) {
      savedProjectZipCache.set(cacheKey, remoteFile);
      await saveAITeacherModelRecord({
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
      isEditingAITeacherModel.value = true;
      currentEditingAIOssId.value = item.ossId || "";
      await openTeacherAIIframe(currentAIModel.value, item.name, item.id);
      return;
    }

    ElMessage.error($t("ai.loadModelFailed"));
  } catch (error) {
    console.error("教师页读取AI模型文件失败:", error);
    ElMessage.error($t("ai.loadModelFailed"));
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
    await deleteAITeacherModelRecord(item.id);
    const cacheKey = getTeacherAICacheKey(item.toolKey, item.id);
    savedProjectZipCache.delete(cacheKey);
    savedAIModels.value = savedAIModels.value.filter((model) => model.id !== item.id);
    ElMessage.success("删除成功");
  } catch (error) {
    console.error("教师页删除AI模型失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "删除失败");
  }
};

// iframe 加载完成
const onToolIframeLoad = () => {
  toolIframeLoading.value = false;
  window.setTimeout(() => {
    void postCachedZipToToolIframe();
  }, 300);
};

// 关闭工具 iframe 弹窗
const closeToolIframeModal = () => {
  const shouldRestoreAIModelSelect =
    currentToolCacheKey.value.startsWith("ai:") && Boolean(currentAIModel.value);

  showToolIframeModal.value = false;
  currentToolUrl.value = "";
  currentToolName.value = "";
  toolIframeLoading.value = true;
  currentToolOnlyCreate.value = false;
  currentEmbeddedAI.value = false;
  currentToolCacheKey.value = "";

  if (shouldRestoreAIModelSelect) {
    showAIModelSelectModal.value = true;
    void loadSavedAIModels();
  }
};

onMounted(() => {
  window.addEventListener("message", handleToolIframeMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleToolIframeMessage);
});

// 跳转到工具中心
const goToToolCenter = () => {
  navigateTo("/system/tool");
};

// 快捷登录弹窗
const showQuickLoginModal = ref(false);
const quickLoginClassList = ref<{ classId: string; className: string }[]>([]);
const selectedQuickLoginClassId = ref<string | null>(null);
const quickLoginLoading = ref(false);

// 快捷登录结果弹窗
const showQuickLoginResultModal = ref(false);
const quickLoginResultData = ref({
  className: "",
  classCode: "",
  classCodePwd: "",
  expirationDate: "",
});

// 打开快捷登录弹窗
const openQuickLoginModal = async () => {
  showQuickLoginModal.value = true;
  quickLoginLoading.value = true;
  selectedQuickLoginClassId.value = null;

  try {
    const data = await getClassListNoPage();
    if (data && Array.isArray(data)) {
      quickLoginClassList.value = data.map((item: any) => ({
        classId: String(item.classId || item.id),
        className: item.className,
      }));
    } else {
      quickLoginClassList.value = [];
    }
  } catch (error) {
    console.error("获取班级列表失败:", error);
    quickLoginClassList.value = [];
  } finally {
    quickLoginLoading.value = false;
  }
};

// 确认创建快捷登录
const { createQuickLogin } = useTeacher();
const handleQuickLoginConfirm = async () => {
  if (!selectedQuickLoginClassId.value) return;

  try {
    const result = await createQuickLogin(selectedQuickLoginClassId.value);
    showQuickLoginModal.value = false;
    syncTeacherQuickLoginCache(result);

    // 获取选中的班级名称
    const selectedClass = quickLoginClassList.value.find(
      (c) => c.classId === selectedQuickLoginClassId.value
    );

    // 设置结果数据并显示结果弹窗
    quickLoginResultData.value = {
      className: selectedClass?.className || "",
      classCode: result?.classCode || "",
      classCodePwd: result?.classCodePwd || "",
      expirationDate: result?.expirationDate || "",
    };
    quickLoginInfo.value = normalizeQuickLoginInfo(result);
    showQuickLoginResultModal.value = true;
  } catch (error) {
    console.error("创建快捷登录失败:", error);
  }
};

// 复制班级码信息
const copyQuickLoginInfo = () => {
  const text = `${$t("teacher.classCode")}${quickLoginResultData.value.classCode}\n${$t(
    "teacher.unifiedPassword"
  )}${quickLoginResultData.value.classCodePwd}`;
  navigator.clipboard.writeText(text);
  alert($t("teacher.copied"));
};

// 跳转到班级管理页面
const goToClassPage = () => {
  showQuickLoginResultModal.value = false;
  navigateTo("/system/class");
};

// 快捷登录按钮点击处理
const handleQuickLoginBtnClick = () => {
  openQuickLoginModal();
};

// 当前选中的班级名称
const selectedClassName = computed(() => {
  const selectedClass = teachList.value.find(
    (item) => item.classId === selectedClassId.value
  );
  return selectedClass?.className || "";
});

// 班级选项
const classOptions = computed(() => {
  return teachList.value.map((item) => ({
    value: item.classId,
    label: item.className,
  }));
});

// 当前选中班级的课程列表
const courseOptions = computed(() => {
  const selectedClass = teachList.value.find(
    (item) => item.classId === selectedClassId.value
  );
  if (!selectedClass || !selectedClass.courseList) return [];
  return selectedClass.courseList.map((course: CourseItem) => ({
    value: course.courseId,
    label: course.courseName,
  }));
});

// 当前选中的课程信息（用于显示封面）
const selectedCourse = computed(() => {
  const selectedClass = teachList.value.find(
    (item) => item.classId === selectedClassId.value
  );
  if (!selectedClass || !selectedClass.courseList) return null;
  return selectedClass.courseList.find(
    (course: CourseItem) => course.courseId === selectedCourseId.value
  );
});

// 获取章节状态：0-已结束, 1-未开始, 2-上节课, 3-开课中
const getChapterStatus = (chapter: ChapterItem) => {
  if (chapter.teachStatus === 0) return 1; // 未开始
  if (chapter.teachStatus === 1) return 3; // 开课中
  if (chapter.teachStatus === 2) {
    // 已结束，判断是否是上节课
    if (chapter.isLatestTeach === 1) return 2; // 上节课
    return 0; // 已结束
  }
  return 1; // 默认未开始
};

// 获取章节状态文本
const getChapterStatusText = (chapter: ChapterItem) => {
  const status = getChapterStatus(chapter);
  switch (status) {
    case 0:
      return $t("teacher.ended");
    case 1:
      return $t("teacher.notStarted");
    case 2:
      return $t("teacher.lastClass");
    case 3:
      return $t("teacher.ongoing");
    default:
      return $t("teacher.notStarted");
  }
};

// 格式化章节名称：将 "-" 替换为换行，不显示 "-"
const formatChapterName = (name: string) => {
  if (!name) return "";
  // 兼容后端返回的 "<br>" 字符串，统一按纯文本换行显示
  const normalizedName = String(name).replace(/<br\s*\/?>/gi, "\n");
  // 按 "-" 分割，过滤空字符串，用换行连接
  const parts = normalizedName
    .split("-")
    .map((p) => p.trim())
    .filter((p) => p);
  return parts.join("\n");
};

// 去上课 - 从授课记录直接进入课堂
const goToTeach = async (chapter: ChapterItem) => {
  if (!selectedClassId.value || !selectedCourseId.value) return;

  const currentClassId = selectedClassId.value;
  const courseId = selectedCourseId.value;
  const chapterId = chapter.chapterId;
  const classroomUrl = buildTeacherClassroomUrl({
    classId: currentClassId,
    className: selectedClassName.value || "",
    courseId,
    chapterId,
    autoQuickLogin: chapter.teachStatus !== 1,
  });

  // 如果是开课中状态，直接跳转
  if (chapter.teachStatus === 1) {
    navigateTo(classroomUrl);
    return;
  }

  if (
    !(await ensureNoOngoingClassroomBeforeStart({
      classId: currentClassId,
      courseId,
      chapterId,
    }))
  ) {
    return;
  }

  // 未开课或已结束，调用接口开课
  try {
    await beginClass({
      classId: currentClassId,
      courseId,
      chapterId,
      peerId: currentClassId,
    });
    console.log("开始上课成功");
    navigateTo(classroomUrl);
  } catch (error: any) {
    await loadChapterList();
    console.error("开始上课失败:", error);
  }
};

// 去备课
const goToPrepare = (chapter: ChapterItem) => {
  if (!selectedCourseId.value) return;
  navigateTo(
    `/system/course/prepare/${selectedCourseId.value}?chapterId=${chapter.chapterId}`
  );
};

// 开课设置弹窗
const showStartClassModal = ref(false);
const startClassModalRef = ref<any>(null);
const startClassData = reactive({
  classList: [] as { classId: string; className: string }[],
  courseList: [] as { courseId: string; courseName: string }[],
  courseTree: [] as {
    menuId: string | null;
    menuName: string;
    courseList: { courseId: string; courseName: string }[];
  }[],
  initialCourseId: "",
  initialChapterId: "",
});

// 去授课 - 打开开课弹窗
const handleGoToClass = async () => {
  const ongoing = await verifyOngoingClassroom();
  if (ongoing) {
    ElMessage.error(ongoingClassroomBlockedMessage);
    return;
  }

  // 清空初始值
  startClassData.initialCourseId = "";
  startClassData.initialChapterId = "";

  // 并行调用两个独立的接口
  try {
    const [classListRes, courseTreeRes] = await Promise.all([
      getClassListNoPage(),
      getCourseMenuTree(),
    ]);

    // 设置班级列表
    if (classListRes && Array.isArray(classListRes)) {
      startClassData.classList = classListRes.map((item: any) => ({
        classId: String(item.classId || item.id),
        className: item.className,
      }));
    } else {
      startClassData.classList = [];
    }

    // 设置课程列表（从分组结构中提取所有课程）
    // 设置课程树形结构
    if (courseTreeRes && Array.isArray(courseTreeRes)) {
      // 递归提取所有课程（用于扁平列表兼容）
      const extractAllCourses = (
        nodes: any[]
      ): { courseId: string; courseName: string }[] => {
        let courses: { courseId: string; courseName: string }[] = [];
        nodes.forEach((node: any) => {
          // 提取当前节点的课程
          if (node.courseList && Array.isArray(node.courseList)) {
            node.courseList.forEach((course: any) => {
              courses.push({
                courseId: String(course.courseId),
                courseName: course.courseName,
              });
            });
          }
          // 递归提取子节点的课程
          if (node.children && Array.isArray(node.children)) {
            courses = courses.concat(extractAllCourses(node.children));
          }
        });
        return courses;
      };

      // 设置树形结构（保持原始结构）
      startClassData.courseTree = courseTreeRes;

      // 设置扁平列表（兼容）
      startClassData.courseList = extractAllCourses(courseTreeRes);
    } else {
      startClassData.courseTree = [];
      startClassData.courseList = [];
    }
  } catch (error) {
    console.error("获取开课设置失败:", error);
    startClassData.classList = [];
    startClassData.courseTree = [];
    startClassData.courseList = [];
  }

  // 打开弹窗
  showStartClassModal.value = true;
};
//跳转到作业
const handleGoToTask = () => {
  router.push("/taskmanagement");
};

// 班级切换
const handleClassChange = (classId: string) => {
  // 清空已选章节
  if (startClassModalRef.value) {
    startClassModalRef.value.setChapterList([]);
  }
};

// 课程切换时加载章节列表
const handleCourseChange = async (courseId: string, classId: string) => {
  try {
    const data = await getTeachChapterList(courseId, classId);
    if (data && startClassModalRef.value) {
      const chapters = (Array.isArray(data) ? data : []).map((c: any) => ({
        chapterId: String(c.chapterId),
        chapterName: c.chapterName,
        isLastClass: c.isLastClass || false,
      }));
      startClassModalRef.value.setChapterList(chapters);
    }
  } catch (error) {
    console.error("加载章节列表失败:", error);
    if (startClassModalRef.value) {
      startClassModalRef.value.setChapterList([]);
    }
  }
};

// 确认开课
const handleStartClassConfirm = async (data: {
  classId: string;
  courseId: string;
  chapterId: string;
}) => {
  console.log("开课数据:", data);

  const peerId = data.classId;
  const className =
    startClassData.classList.find((item) => item.classId === data.classId)?.className || "";

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
      peerId,
    });
    console.log("开始上课成功");
    navigateTo(
      buildTeacherClassroomUrl({
        classId: data.classId,
        className,
        courseId: data.courseId,
        chapterId: data.chapterId,
        autoQuickLogin: true,
      })
    );
  } catch (error: any) {
    await loadChapterList();
    console.error("开始上课失败:", error);
  }
};
</script>
