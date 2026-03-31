<template>
  <div class="teacher-page">
    <div class="teacher-dashboard">
      <section class="dashboard-top-row">
        <div class="dashboard-panel dashboard-panel--hero">
          <div
            class="dashboard-panel-title"
            style="padding-top: 20px; padding-left: 20px"
          >
            教师中心
          </div>
          <div class="teacher-center-card" :style="teacherCenterCardStyle">
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
                任务
              </button>
            </div>
          </div>
        </div>

        <div class="dashboard-panel dashboard-panel--stats">
          <div
            class="dashboard-panel-title"
            style="padding-top: 20px; padding-left: 20px"
          >
            信息
          </div>
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
import teacherCenterBanner from "~/assets/newimages/bg2.png";
import statsClassIcon from "~/assets/newimages/988.png";
import statsTeachingIcon from "~/assets/newimages/987.png";
import statsOpusIcon from "~/assets/newimages/986.png";
import statsStudentIcon from "~/assets/newimages/985.png";
import tool2Icon from "~/assets/images/tool2.png";
import tool1Icon from "~/assets/images/tool1.png";
import tool4Icon from "~/assets/images/too4.png";

const { t: $t, locale } = useI18n();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const teacherCenterCardStyle = {
  backgroundImage: `url(${teacherCenterBanner})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "left bottom",
  backgroundSize: "cover",
} as Record<string, string>;
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
}) => {
  const className = encodeURIComponent(info.className || "");
  return `/system/classroom/${info.chapterId}?classId=${info.classId}&className=${className}&courseId=${info.courseId}&from=teacher&autoQuickLogin=1`;
};

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

  ElMessage.warning("当前已有进行中的课堂，请先结束后再开始新的课程");
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

// 使用 useAsyncData 加载快捷登录信息（lazy 模式）
const { data: quickLoginInfo, refresh: refreshQuickLoginInfo } = useAsyncData(
  "teacher-quick-login",
  async () => {
    const data = await getQuickLoginInfo();
    return data;
  },
  {
    lazy: true,
    default: () => ({
      classCode: "",
      classCodePwd: "",
      expirationDate: "",
    }),
    transform: (data: any) => ({
      classCode: data?.classCode || "",
      classCodePwd: data?.classCodePwd || "",
      expirationDate: data?.expirationDate || "",
    }),
  }
);

// 页面加载状态（最少显示 150ms 骨架屏，避免闪烁）
const minLoadingDone = ref(false);
onMounted(() => {
  setTimeout(() => {
    minLoadingDone.value = true;
  }, 0);
});
const pageLoading = computed(
  () => !minLoadingDone.value || teachListPending.value || teacherStatsPending.value
);

// 从 quickLoginInfo 中解构出各个字段（保持响应式）
const quickLoginCode = computed(() => quickLoginInfo.value.classCode);
const quickLoginPwd = computed(() => quickLoginInfo.value.classCodePwd);
const quickLoginExpire = computed(() => quickLoginInfo.value.expirationDate);
const dashboardQuickLoginLabel = computed(() =>
  quickLoginCode.value ? $t("teacher.viewLoginStatus") : $t("auth.classCodeLogin")
);
const TEACHER_QUICK_LOGIN_STORAGE_KEY = "teacher_quick_login_info";

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
    showQuickLoginResultModal.value = true;

    // 刷新快捷登录信息
    await refreshQuickLoginInfo();
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
  if (quickLoginCode.value) {
    // 已开启快捷登录，跳转到班级管理页面
    navigateTo("/system/class");
  } else {
    // 未开启，打开选择班级弹窗
    openQuickLoginModal();
  }
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
  syncTeacherQuickLoginCache();
  const classroomUrl = buildTeacherClassroomUrl({
    classId: currentClassId,
    className: selectedClassName.value || "",
    courseId,
    chapterId,
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
    syncTeacherQuickLoginCache();
    navigateTo(
      buildTeacherClassroomUrl({
        classId: data.classId,
        className,
        courseId: data.courseId,
        chapterId: data.chapterId,
      })
    );
  } catch (error: any) {
    await loadChapterList();
    console.error("开始上课失败:", error);
  }
};
</script>

<style scoped>
.teacher-page {
  min-height: 100%;
  overflow: visible;
  padding: 24px 0 36px;
}

.teacher-dashboard {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-height: 100%;
  width: 100%;
  max-width: 1484px;
  box-sizing: border-box;
  padding: 0 0 32px;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.dashboard-top-row {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(360px, 1fr);
  gap: clamp(14px, 1.6vw, 28px);
  justify-content: space-between;
  align-items: start;
}

.dashboard-panel--hero {
  width: 100%;
  max-width: none;
  justify-self: start;
  /* background: #dfe9f7; */
  border-color: #c8d8ee;
  box-shadow: none;
}

.dashboard-panel--stats {
  width: 100%;
  max-width: none;
  justify-self: start;
  align-self: start;
  padding-right: clamp(12px, 1.2vw, 18px);
  box-sizing: border-box;
  /* background: #dfe9f7;
  border-color: #c8d8ee; */
  /* padding: 24px 28px 24px 20px; */
  box-shadow: none;
}

.dashboard-tool-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.dashboard-panel {
  box-sizing: border-box;
  border-radius: 28px;
  /* padding: 24px; */
  /* background: rgba(255, 255, 255, 0.88); */
  /* border: 1px solid rgba(217, 228, 243, 0.92); */
  box-shadow: 0 16px 36px rgba(180, 194, 224, 0.18);
}

.dashboard-panel-title {
  display: inline-flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #4a5a78;
  letter-spacing: 0.01em;
}

.dashboard-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.teacher-center-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
  width: 100%;
  height: clamp(280px, 30vw, 488px);
  min-height: 280px;
  padding: 0 clamp(10px, 2vw, 28px) 0 0;
  border-radius: 26px;
  overflow: hidden;
}

.teacher-center-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(8px, 0.9vw, 14px);
  width: clamp(120px, 14vw, 172px);
  position: relative;
  z-index: 1;
}

.teacher-center-action {
  height: clamp(56px, 6vw, 82px);
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.94);
  color: #333333;
  font-size: clamp(18px, 2vw, 28px);
  /* color: #556178;
  font-size: 22px;
  font-weight: 500; */
  letter-spacing: 0.04em;
  box-shadow: 0 16px 24px rgba(75, 71, 154, 0.18);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.teacher-center-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 28px rgba(75, 71, 154, 0.24);
}

.teacher-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 34px;
  row-gap: 34px;
  margin-top: 40px;
  width: 100%;
  height: 408px;
  border-radius: 30px;
  background: #ffffff;
  box-sizing: border-box;
}

.teacher-stat-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 138px;
  padding: 60px 0 0 43px;
  border-radius: 0;
  background: transparent;
  border: none;
}

.teacher-stat-card:nth-child(3),
.teacher-stat-card:nth-child(4) {
  padding-top: 0px !important;
}

.teacher-stat-card--skeleton {
  padding: 0;
  overflow: hidden;
}

.teacher-stat-skeleton {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  height: 100%;
  padding: 18px;
}

.teacher-stat-skeleton-content {
  flex: 1;
}

.teacher-stat-icon {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  object-fit: contain;
  margin-top: 4px;
}

.teacher-stat-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0px;
  padding-top: 8px;
}

.teacher-stat-label {
  display: flex;
  align-items: center;
  min-height: 60px;
  font-size: 18px;
  line-height: 1.4;
  color: #333;
  white-space: nowrap;
}

.teacher-stat-value {
  font-size: 44px;
  line-height: 0.95;
  font-weight: 500;
  color: #333;
}

.dashboard-quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.dashboard-tool-panel {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.dashboard-tool-panel > .dashboard-panel-header {
  margin-bottom: 15px;
}

.dashboard-tool-body {
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(217, 228, 243, 0.92);
  box-shadow: 0 16px 36px rgba(180, 194, 224, 0.18);
  padding: 80px 24px 80px;
}

.dashboard-quick-grid--tools {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.dashboard-quick-grid--ai {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px 12px;
}

.dashboard-quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 146px;
  padding: 18px 14px;
  border: 1px solid rgba(223, 231, 245, 0.94);
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.dashboard-quick-card:hover {
  transform: translateY(-4px);
  border-color: rgba(177, 196, 231, 0.96);
  box-shadow: 0 16px 24px rgba(183, 198, 226, 0.22);
}

.dashboard-quick-card--plain {
  min-height: auto;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.dashboard-quick-card--plain:hover {
  border-color: transparent;
  box-shadow: none;
}

.dashboard-quick-icon {
  width: 88px;
  height: 88px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dashboard-quick-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.dashboard-quick-icon--tool,
.dashboard-quick-icon--ai {
  width: 92px;
  height: 92px;
  border-radius: 16px;
  overflow: hidden;
}

.dashboard-quick-icon--tool img,
.dashboard-quick-icon--ai img {
  object-fit: cover;
}

.dashboard-quick-label {
  font-size: 15px;
  font-weight: 500;
  color: #556178;
  text-align: center;
  line-height: 1.4;
}

.dashboard-quick-label--tool,
.dashboard-quick-label--ai {
  font-size: 14px;
  color: #4a5a78;
  white-space: nowrap;
}

.dashboard-record-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.dashboard-record-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 15px;
}

.dashboard-record-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.dashboard-record-subtitle {
  font-size: 13px;
  color: #8d9db7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-record-card {
  padding: 18px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(217, 228, 243, 0.92);
  box-shadow: 0 16px 36px rgba(180, 194, 224, 0.18);
}

.dashboard-record-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-record-toolbar-main {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.dashboard-quick-login-btn {
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #62728f;
  font-size: 14px;
  box-shadow: inset 0 0 0 1px rgba(205, 216, 233, 0.96);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.dashboard-quick-login-btn:hover {
  transform: translateY(-1px);
  color: #44526a;
  box-shadow: inset 0 0 0 1px rgba(179, 194, 220, 0.96),
    0 10px 18px rgba(180, 194, 224, 0.2);
}

.dashboard-record-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
}

.dashboard-select {
  width: 100%;
}

.dashboard-select--class {
  width: 200px;
  min-width: 200px;
}

.dashboard-course-select {
  position: relative;
  width: min(320px, 100%);
}

.dashboard-record-body {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  min-height: 0;
}

.dashboard-record-body--skeleton {
  align-items: stretch;
}

.dashboard-course-column {
  min-width: 0;
}

.dashboard-course-card {
  height: 360px;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(219, 228, 242, 0.95);
  background: linear-gradient(180deg, #d6e4ff 0%, #bfcff3 100%);
  box-shadow: 0 14px 30px rgba(177, 195, 228, 0.2);
  cursor: pointer;
}

.dashboard-course-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.28s ease;
}

.dashboard-course-card:hover .dashboard-course-cover {
  transform: scale(1.03);
}

.dashboard-course-cover--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #58657f;
  font-size: 16px;
  background: linear-gradient(135deg, #f5a46c 0%, #e58d63 100%);
}

.dashboard-chapter-column {
  min-width: 0;
  max-height: min(640px, calc(100vh - 360px));
  padding: 6px 6px 0 0;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.dashboard-chapter-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.dashboard-chapter-column::-webkit-scrollbar {
  width: 8px;
}

.dashboard-chapter-column::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(188, 198, 217, 0.9);
}

.dashboard-chapter-column::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-chapter-grid--skeleton {
  align-content: start;
}

.dashboard-chapter-card {
  position: relative;
  min-height: 170px;
  padding: 18px 16px 16px;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%);
  border: 1px solid rgba(220, 229, 243, 0.98);
  box-shadow: 0 14px 24px rgba(180, 196, 224, 0.14);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.dashboard-chapter-card:hover {
  transform: translateY(-3px);
  border-color: rgba(199, 212, 234, 0.98);
  box-shadow: 0 18px 28px rgba(180, 196, 224, 0.2);
}

.dashboard-chapter-card.is-selected {
  border-color: #ff9900;
  box-shadow: 0 18px 30px rgba(255, 153, 0, 0.18);
}

.dashboard-chapter-status {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 54px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  color: #fff;
}

.dashboard-chapter-name {
  display: block;
  min-height: 72px;
  margin-top: 26px;
  font-size: 15px;
  font-weight: 600;
  color: #46546d;
  line-height: 1.45;
  white-space: pre-line;
}

.dashboard-chapter-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.dashboard-action-btn {
  width: 100%;
  min-height: 38px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard-action-btn:hover {
  transform: translateY(-1px);
}

.dashboard-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  border-radius: 24px;
  border: 1px dashed rgba(202, 214, 235, 0.98);
  background: linear-gradient(180deg, #fbfdff 0%, #f5f8ff 100%);
  color: #8d9db7;
  font-size: 14px;
}

.dashboard-empty-state--chapter {
  min-height: 360px;
}

@media (max-width: 1480px) {
  .dashboard-top-row {
    grid-template-columns: minmax(0, 1.42fr) minmax(300px, 1fr);
  }

  .dashboard-panel--hero {
    min-height: 360px;
  }

  .teacher-center-card {
    height: 360px;
    min-height: 360px;
  }

  .dashboard-record-body {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .dashboard-chapter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .dashboard-course-card {
    height: 320px;
  }

  .teacher-stats-grid {
    column-gap: 22px;
    row-gap: 22px;
    margin-top: 24px;
    height: auto;
    min-height: 340px;
  }

  .teacher-stat-card {
    min-height: 116px;
    padding: 32px 0 0 20px;
    gap: 10px;
  }

  .teacher-stat-card:nth-child(3),
  .teacher-stat-card:nth-child(4) {
    padding-top: 12px !important;
  }

  .teacher-stat-icon {
    width: 52px;
    height: 52px;
    margin-top: 2px;
  }

  .teacher-stat-content {
    gap: 8px;
    padding-top: 4px;
  }

  .teacher-stat-label {
    min-height: 46px;
    font-size: 15px;
  }

  .teacher-stat-value {
    font-size: 32px;
  }
}

@media (max-width: 1360px) {
  .dashboard-top-row {
    grid-template-columns: minmax(0, 1.32fr) minmax(260px, 1fr);
  }

  .dashboard-panel--hero {
    min-height: 330px;
  }

  .teacher-center-card {
    height: 330px;
    min-height: 330px;
  }

  .dashboard-chapter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .teacher-stats-grid {
    column-gap: 16px;
    row-gap: 16px;
    margin-top: 18px;
    min-height: 300px;
  }

  .teacher-stat-card {
    min-height: 100px;
    padding: 22px 0 0 14px;
    gap: 8px;
  }

  .teacher-stat-card:nth-child(3),
  .teacher-stat-card:nth-child(4) {
    padding-top: 6px !important;
  }

  .teacher-stat-icon {
    width: 46px;
    height: 46px;
  }

  .teacher-stat-content {
    gap: 6px;
    padding-top: 2px;
  }

  .teacher-stat-label {
    min-height: 40px;
    font-size: 13px;
    line-height: 1.3;
  }

  .teacher-stat-value {
    font-size: 26px;
    line-height: 1;
  }
}

@media (max-width: 1200px) {
  .teacher-page {
    padding: 18px 0 28px;
  }

  .teacher-dashboard {
    padding: 22px;
    border-radius: 24px;
  }

  .dashboard-top-row {
    grid-template-columns: minmax(0, 1.18fr) minmax(220px, 1fr);
  }

  .dashboard-tool-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .dashboard-record-body {
    grid-template-columns: 1fr;
  }

  .teacher-center-card {
    height: 300px;
    min-height: 300px;
  }

  .teacher-stats-grid {
    margin-top: 12px;
    min-height: 260px;
  }

  .teacher-stat-card {
    padding: 18px 0 0 12px;
  }

  .teacher-stat-card:nth-child(3),
  .teacher-stat-card:nth-child(4) {
    padding-top: 0 !important;
  }

  .teacher-stat-label {
    min-height: 36px;
    font-size: 12px;
  }

  .teacher-stat-value {
    font-size: 24px;
  }

  .dashboard-record-header,
  .dashboard-record-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard-record-toolbar-main {
    width: 100%;
    flex-wrap: wrap;
  }

  .dashboard-select--class,
  .dashboard-course-select {
    width: 100%;
    min-width: 0;
  }

  .dashboard-course-card,
  .dashboard-empty-state--chapter {
    height: 280px;
    min-height: 280px;
  }

  .dashboard-chapter-column {
    max-height: none;
    padding-right: 0;
    overflow: visible;
  }

  .dashboard-chapter-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .dashboard-chapter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .teacher-dashboard {
    padding: 18px;
    gap: 18px;
  }

  .dashboard-top-row {
    grid-template-columns: minmax(0, 1.08fr) minmax(168px, 1fr);
    gap: 12px;
  }

  .dashboard-tool-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .dashboard-panel {
    padding: 18px;
    border-radius: 22px;
  }

  .teacher-center-card {
    border-radius: 22px;
    height: 240px;
    min-height: 240px;
  }

  .teacher-center-actions {
    width: clamp(120px, 34vw, 150px);
  }

  .teacher-center-action {
    font-size: clamp(18px, 4vw, 22px);
  }

  .teacher-stats-grid,
  .dashboard-quick-grid,
  .dashboard-chapter-grid {
    grid-template-columns: 1fr;
  }

  .teacher-stats-grid {
    column-gap: 12px;
    row-gap: 12px;
    min-height: 230px;
  }

  .teacher-stat-card {
    min-height: 84px;
    padding: 12px 0 0 10px;
    gap: 6px;
  }

  .teacher-stat-icon {
    width: 40px;
    height: 40px;
  }

  .teacher-stat-label {
    min-height: 28px;
    font-size: 11px;
  }

  .teacher-stat-value {
    font-size: 22px;
  }

  .teacher-stat-card {
    min-height: 104px;
  }

  .dashboard-course-card,
  .dashboard-empty-state,
  .dashboard-empty-state--chapter {
    min-height: 220px;
    height: 220px;
  }
}

.login-popover {
  position: absolute;
  top: 100%;
  right: 0; /* Align to right since button is right aligned in its context usually */
  left: auto;
  transform: none;
  padding-top: 12px;
  z-index: 100;
}

.popover-arrow {
  position: absolute;
  top: 4px;
  right: 20px; /* Adjust arrow position */
  left: auto;
  transform: none;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid rgba(58, 63, 71, 0.6);
}

.popover-content {
  background: rgba(58, 63, 71, 0.8);
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  color: white;
  text-align: center;
}

.popover-tip {
  font-size: 14px;
  color: white;
  line-height: 1.6;
}

.popover-title {
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.popover-expire {
  font-size: 13px;
  color: #ccc;
  margin-bottom: 16px;
}

.popover-info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
}

.popover-info-text {
  text-align: left;
  font-size: 14px;
  line-height: 1.8;
}

.popover-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-size: 14px;
}

.popover-row:last-child {
  margin-bottom: 0;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #3eaeff;
  font-size: 13px;
  cursor: pointer;
}

.copy-btn:hover {
  color: #5bc0ff;
}

/* 授课记录 */
.lesson-record {
  flex-shrink: 0;
  width: 240px;
  padding-right: 24px;
  border-right: 1px solid #e5e5e5;
}

.lesson-record .section-header {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.course-select-container {
  position: relative;
  width: 100%;
}

.course-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: #303133;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.tooltip-arrow {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #303133;
}

.empty-record {
  width: 100%;
  height: 200px; /* consistent height */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

/* AI 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 480px;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease;
}

.model-select-modal {
  width: 620px;
}

.model-select-body {
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.model-select-section {
  border: 1px solid #f0e4d0;
  border-radius: 14px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #fffdf8 0%, #fff9f0 100%);
}

.model-select-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.model-select-section-head--stack {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.model-select-section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-select-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.model-select-section-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #8a6a3f;
}

.model-select-count {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: #fff1d9;
  color: #ff9900;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.model-select-create-btn {
  width: auto;
  min-width: 120px;
  padding: 0 20px;
  flex-shrink: 0;
}

.model-card-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
  max-height: 280px;
  overflow-y: auto;
}

.model-card {
  position: relative;
  text-align: left;
  border: 1px solid #f3d7a7;
  border-radius: 14px;
  background: white;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.model-card:hover {
  border-color: #ff9900;
  box-shadow: 0 10px 18px rgba(255, 153, 0, 0.12);
  transform: translateY(-2px);
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
  color: white;
  font-size: 12px;
  line-height: 28px;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform: translateY(-4px);
}

.model-card:hover .model-card-delete {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.model-card-cover {
  background: #f3f3f3;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.model-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.model-card-body {
  padding: 10px 12px 12px;
}

.model-card-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card-time {
  margin-top: 6px;
  font-size: 11px;
  color: #999;
}

.model-list-empty {
  margin-top: 16px;
  border: 1px dashed #e5d3b6;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: #999;
  background: rgba(255, 255, 255, 0.7);
}

.modal-header {
  background: #ff9900;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
  display: flex;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 40px 48px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  color: #333;
  width: 70px;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  height: 40px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #ff9900;
}

.modal-footer {
  padding: 20px 48px 40px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-confirm {
  background: #ff9900;
  color: white;
  border: none;
  border-radius: 4px;
  width: 120px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background: #e68a00;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  width: 120px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #999;
  color: #333;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.lesson-card {
  width: 100%;
  height: auto;
  border-radius: 8px;
  overflow: hidden;
}

.lesson-cover {
  width: 100%;
  height: auto;
  min-height: 200px;
  border-radius: 8px;
  object-fit: fill;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.lesson-cover:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.lesson-cover-placeholder {
  background: linear-gradient(135deg, #f5a67d 0%, #e8956a 100%);
}

.course-select {
  width: 100%;
  margin-bottom: 12px;
}

/* 章节列表 */
.chapter-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  max-height: 400px;
}

.chapter-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
  gap: 40px;
  padding-bottom: 16px;
}

.chapter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chapter-card {
  width: 100%;
  height: 180px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 6px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
  padding: 12px;
}

.chapter-card:hover {
  border-color: #d9d9d9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chapter-item.is-selected .chapter-card {
  border-color: #ff9900;
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.2);
}

.status-tag {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 10px;
  color: white;
  padding: 3px 8px;
  border-radius: 0 6px 0 6px;
}

.status-ended {
  background: #999;
}

.status-not-started {
  background: #3eaeff;
}

.status-last {
  background: #ff9900;
}

.status-ongoing {
  background: #52c41a;
}

.chapter-name {
  font-size: 13px;
  color: #333;
  text-align: center;
  word-break: break-word;
  white-space: pre-line;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -40px;
  margin-bottom: 0;
}

.chapter-actions {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-btn {
  width: 100%;
  padding: 5px 0;
  font-size: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.teach-btn {
  background: #ff9900;
  color: white;
}

.teach-btn:hover {
  background: #e68a00;
}

.prepare-btn {
  background: white;
  color: #ff9900;
  border: 1px solid #ff9900;
}

.prepare-btn:hover {
  background: #fff7e6;
}

.empty-chapter {
  grid-column: 1 / -1;
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 40px 0;
}

/* 右侧边栏 */
.right-sidebar {
  width: 540px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  height: 250px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 16px 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.more-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  opacity: 0.6;
}

.tool-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.tool-icon {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.tool-icon:hover {
  transform: scale(1.05);
}

.tool-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 信息栏 */
.info-section {
  flex: 1;
  min-height: 0;
}

.mb-3 {
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-card {
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
}

.info-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.info-value {
  font-size: 28px;
  font-weight: 500;
  color: #666;
}

.info-value--highlight {
  color: #ff9900;
}

/* 响应式 */
@media (max-width: 1600px) {
  .right-sidebar {
    width: 400px;
    gap: 14px;
  }

  .sidebar-card {
    height: 200px;
  }

  .tool-icon {
    width: 70px;
    height: 70px;
  }

  .card-icon {
    width: 120px;
    height: 120px;
  }

  .action-card {
    padding: 20px 28px;
    height: 280px;
  }

  .class-grid {
    grid-template-columns: repeat(4, 100px);
    gap: 24px;
  }

  .class-card {
    width: 100px;
    height: 130px;
  }
}

/* 小高度屏幕优化 */
@media (max-height: 800px) {
  .action-card {
    height: 200px;
  }

  .card-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
  }

  .sidebar-card {
    height: 140px;
  }

  .tool-icon {
    width: 50px;
    height: 50px;
  }

  .top-cards {
    gap: 20px;
    margin-bottom: 16px;
  }
}

@media (max-width: 1400px) {
  .right-sidebar {
    width: 320px;
    gap: 20px;
  }

  .sidebar-card {
    height: 160px;
  }

  .tool-icon {
    width: 56px;
    height: 56px;
  }

  .card-icon {
    width: 100px;
    height: 100px;
  }

  .action-card {
    padding: 16px 24px;
  }

  .class-grid {
    grid-template-columns: repeat(3, 90px);
    gap: 20px;
  }

  .class-card {
    width: 90px;
    height: 115px;
  }

  .info-value {
    font-size: 24px;
  }
}

@media (max-width: 1200px) {
  .teacher-page {
    height: auto;
    min-height: calc(100vh - 70px);
    overflow-y: auto;
  }

  .main-content {
    flex-direction: column;
    height: auto;
  }

  .right-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }

  .sidebar-card {
    flex: 1;
    min-width: 280px;
    height: 180px;
  }

  .info-section {
    width: 100%;
  }

  .class-grid {
    grid-template-columns: repeat(4, 100px);
    gap: 24px;
  }

  .class-card {
    width: 100px;
    height: 130px;
  }
}

@media (max-width: 768px) {
  .top-cards {
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }

  .action-card {
    padding: 14px 20px;
  }

  .card-icon {
    width: 80px;
    height: 80px;
  }

  .bottom-section {
    flex-direction: column;
    gap: 20px;
  }

  .class-grid {
    grid-template-columns: repeat(2, 100px);
    gap: 16px;
  }
}

/* 快捷登录弹窗样式 */
.quick-login-modal {
  padding: 8px 0;
}

.modal-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.class-list {
  max-height: 300px;
  overflow-y: auto;
}

.class-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.class-item:last-child {
  margin-bottom: 0;
}

.class-item:hover {
  border-color: #ff9900;
  background: #fff9f0;
}

.class-item.is-selected {
  border-color: #ff9900;
  background: #fff9f0;
}

.class-name {
  font-size: 14px;
  color: #333;
}

.check-icon {
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.confirm-btn {
  background: #ff9900 !important;
  color: white !important;
  border: none !important;
}

.confirm-btn:hover:not(:disabled) {
  background: #e68a00 !important;
}

.confirm-btn:disabled {
  background: #ffd699 !important;
  cursor: not-allowed;
}

/* 快捷登录结果弹窗样式 */
.quick-login-result {
  text-align: center;
  padding: 20px 0;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.result-class-name {
  font-size: 18px;
  color: #333;
  margin-bottom: 4px;
}

.result-expire {
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
}

.result-info-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px 20px;
  text-align: left;
  position: relative;
}

.info-row {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.info-row:last-of-type {
  margin-bottom: 0;
}

.copy-btn-inline {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #3eaeff;
  font-size: 13px;
  cursor: pointer;
}

.copy-btn-inline:hover {
  color: #1890ff;
}

.result-actions {
  margin-top: 24px;
}

.view-login-btn {
  background: #ff9900 !important;
  color: white !important;
  border: none !important;
  padding: 10px 40px !important;
  border-radius: 6px !important;
}

.view-login-btn:hover {
  background: #e68a00 !important;
}

/* 工具 iframe 弹窗样式 */
.iframe-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.iframe-modal-overlay--embedded-ai {
  background: transparent;
}

.iframe-modal-container {
  width: 95vw;
  height: 90vh;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.iframe-modal-container--embedded-ai {
  width: 100vw;
  height: 100vh;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.iframe-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
  background: #fafafa;
}

.iframe-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.iframe-close-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.iframe-close-btn:hover {
  background: #f0f0f0;
  color: #666;
}

.iframe-modal-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.iframe-modal-body--embedded-ai {
  height: 100vh;
}

.tool-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.tool-iframe.hidden {
  opacity: 0;
  position: absolute;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #ff9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* 工具列表样式调整 */
.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.tool-item:hover .tool-icon {
  transform: scale(1.05);
}

.tool-item .tool-name {
  font-size: 12px;
  color: #666;
}

/* 骨架屏卡片样式 */
.skeleton-card {
  pointer-events: none;
}

/* 骨架屏到内容的淡入过渡 */
.fade-enter-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
}
</style>
