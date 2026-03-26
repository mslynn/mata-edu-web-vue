<template>
  <div class="lessonsrecord-page flex-1 flex flex-col overflow-hidden">
    <!-- 返回按钮 -->
    <div class="shrink-0 max-w-[1100px] w-full mx-auto px-6 py-3">
      <button
        class="w-8 h-8 rounded-full bg-[#B8D4E8]/60 flex items-center justify-center hover:bg-[#B8D4E8] transition-colors"
        @click="$router.back()"
      >
        <svg
          class="w-5 h-5 text-gray-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 pb-6">
      <div class="max-w-[1100px] w-full mx-auto">
        <!-- 课程封面轮播区 -->
        <div class="relative mb-6 carousel-shell">
          <div class="flex items-center relative z-[2]">
            <!-- 左箭头 -->
            <button
              class="shrink-0 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
              @click="scrollCarousel(-1)"
            >
              <svg
                class="w-4 h-4 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <!-- 轮播内容 -->
            <div ref="carouselRef" class="flex-1 overflow-hidden mx-3 py-1">
              <div v-if="isCarouselLoading" class="flex gap-4">
                <div
                  v-for="idx in 5"
                  :key="`skeleton-${idx}`"
                  class="shrink-0 w-[160px] h-[200px] rounded-lg skeleton-card"
                  :class="idx === 1 ? 'scale-[1.06]' : ''"
                ></div>
              </div>
              <div
                v-else
                class="flex gap-4 carousel-track"
                :style="{ transform: `translateX(-${carouselOffset}px)` }"
              >
                <div
                  v-for="course in carouselCourses"
                  :key="course.courseId"
                  class="carousel-item shrink-0 w-[160px] cursor-pointer group"
                  :class="
                    String(course.courseId) === selectedCourseId
                      ? 'carousel-item--active z-20'
                      : 'carousel-item--inactive'
                  "
                  @click="selectCourse(String(course.courseId))"
                >
                  <div
                    class="course-card relative w-[160px] h-[200px] rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow"
                    :class="
                      String(course.courseId) === selectedCourseId
                        ? 'course-card--active'
                        : 'course-card--inactive'
                    "
                  >
                    <!-- 任务状态角标 -->
                    <div v-if="course.taskStatus === 1" class="task-unsubmitted-badge">
                      <span>任务未提交</span>
                    </div>
                    <!-- 封面图 -->
                    <div class="relative w-full h-full" :class="course.bgClass">
                      <img
                        v-if="course.coverUrl"
                        :src="course.coverUrl"
                        alt=""
                        class="absolute inset-0 w-full h-full object-cover"
                      />
                      <div class="absolute inset-0"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右箭头 -->
            <button
              class="shrink-0 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
              @click="scrollCarousel(1)"
            >
              <svg
                class="w-4 h-4 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 上课记录 / 课程测评 Tab -->
        <div class="mb-3">
          <div class="record-tabs">
            <button
              class="record-tab"
              :class="activeTab === 'lessons' ? 'record-tab--active' : 'record-tab--inactive'"
              @click="activeTab = 'lessons'"
            >
              {{ $t("lessonsRecord.classRecord") }}
            </button>
            <button
              v-if="showEvaluationTab"
              class="record-tab"
              :class="activeTab === 'evaluation' ? 'record-tab--active' : 'record-tab--inactive'"
              @click="activeTab = 'evaluation'"
            >
              课程测评
            </button>
          </div>
        </div>

        <div class="lesson-record-panel">
          <template v-if="activeTab === 'lessons'">
            <!-- 记录骨架屏 -->
            <div v-if="lessonRecordLoading && lessonSkeletonCount > 0" class="lesson-grid">
              <el-skeleton
                v-for="idx in lessonSkeletonCount"
                :key="`lesson-skeleton-${idx}`"
                animated
                class="lesson-card lesson-card--skeleton"
              >
                <template #template>
                  <div class="lesson-skeleton-inner">
                    <el-skeleton-item variant="rect" class="lesson-skeleton-corner" />
                    <el-skeleton-item variant="text" class="lesson-skeleton-title" />
                    <el-skeleton-item variant="text" class="lesson-skeleton-meta" />
                    <el-skeleton-item variant="rect" class="lesson-skeleton-tag" />
                    <div class="lesson-skeleton-actions">
                      <el-skeleton-item
                        variant="button"
                        class="lesson-skeleton-btn lesson-skeleton-btn--primary"
                      />
                      <el-skeleton-item variant="button" class="lesson-skeleton-btn" />
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>

            <!-- 记录卡片网格 -->
            <div v-else-if="lessonRecords.length > 0" class="lesson-grid">
              <div v-for="record in lessonRecords" :key="record.id" class="lesson-card">
                <div v-if="record.isLastLesson" class="lesson-last-corner">上次课</div>

                <h3 class="lesson-title">{{ record.title }}</h3>

                <div class="lesson-meta">{{ record.teacher }} {{ record.time }}</div>

                <span
                  class="lesson-task-tag"
                  :class="taskTagClass(record.taskStatus)"
                >
                  {{ taskTagLabel(record.taskStatus) }}
                </span>

                <div class="lesson-actions">
                  <button
                    v-for="(btn, bIdx) in record.actions"
                    :key="bIdx"
                    class="lesson-btn"
                    :class="btn.primary ? 'lesson-btn--primary' : 'lesson-btn--secondary'"
                    @click="handleLessonAction(btn, record)"
                  >
                    {{ btn.label }}
                  </button>
                </div>
              </div>
            </div>

            <div
              v-else-if="!lessonRecordLoading"
              class="h-[140px] rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm flex items-center justify-center"
            >
              暂无上课记录
            </div>
          </template>

          <div
            v-else-if="evaluationLoading"
            class="h-[140px] rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm flex items-center justify-center"
          >
            测评加载中...
          </div>

          <div v-else-if="evaluationRecords.length > 0" class="evaluation-grid">
            <div
              v-for="record in evaluationRecords"
              :key="record.id"
              class="evaluation-card"
            >
              <h3 class="evaluation-title">{{ record.title }}</h3>

              <div class="evaluation-time">
                考试时间：{{ record.examTime }}
              </div>

              <span
                class="evaluation-status"
                :class="evaluationStatusClass(getEffectiveEvaluationStatus(record))"
              >
                {{ evaluationStatusLabel(getEffectiveEvaluationStatus(record)) }}
              </span>

              <div
                v-if="getEffectiveEvaluationStatus(record) === 2 && record.starScore > 0"
                class="evaluation-score-stars"
              >
                <StarRating
                  :model-value="record.starScore"
                  :size="18"
                  :gap="3"
                  fill-color="#f7b84b"
                  empty-color="#d9e0e7"
                  readonly
                />
              </div>

              <div
                v-if="shouldShowEvaluationFooter(record)"
                class="evaluation-footer"
              >
                <div
                  v-if="getEvaluationActionLabel(getEffectiveEvaluationStatus(record))"
                  class="evaluation-actions"
                >
                  <button
                    class="evaluation-btn"
                    @click="handleEvaluationAction(record)"
                  >
                    {{ getEvaluationActionLabel(getEffectiveEvaluationStatus(record)) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="h-[140px] rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm flex items-center justify-center"
          >
            暂无课程测评
          </div>
        </div>
      </div>
    </div>

    <Transition name="evaluation-countdown-float">
      <div
        v-if="activeCountdownRecord && activeTab === 'evaluation'"
        class="evaluation-countdown-floating"
      >
        <span class="evaluation-countdown-label">考试倒计时：</span>
        <span class="evaluation-countdown-box">
          {{ activeCountdownDisplay.minutes }}
        </span>
        <span class="evaluation-countdown-separator">:</span>
        <span class="evaluation-countdown-box">
          {{ activeCountdownDisplay.seconds }}
        </span>
      </div>
    </Transition>

    <Transition name="evaluation-resume-float">
      <button
        v-if="showResumeEvaluationEntry"
        class="evaluation-resume-floating"
        type="button"
        @click="resumeEvaluationExam"
      >
        <span class="evaluation-resume-text">考试进行中</span>
        <span class="evaluation-resume-bars" aria-hidden="true">
          <span class="evaluation-resume-bar"></span>
          <span class="evaluation-resume-bar"></span>
          <span class="evaluation-resume-bar"></span>
          <span class="evaluation-resume-bar"></span>
        </span>
      </button>
    </Transition>

    <Teleport to="body">
      <Transition name="evaluation-start-modal">
        <div
          v-if="showExamStartModal"
          class="exam-start-overlay"
        >
          <div class="exam-start-backdrop" @click="closeExamStartModal"></div>
          <div class="exam-start-modal">
            <button class="exam-start-close" @click="closeExamStartModal" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h3 class="exam-start-title">考试开始提示</h3>
            <div class="exam-start-content">
              <div class="exam-start-line">
                考试名称：{{ examStartRecord?.title || "-" }}
              </div>
              <div class="exam-start-line">
                考试已开始，点击开始考试，进入考试页面
              </div>
            </div>

            <button class="exam-start-btn" @click="handleExamStartConfirm">
              开始考试
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <StudentTaskAnswerModal
      v-model="evaluationAnswerVisible"
      :evaluation-id="activeEvaluationId"
      :task-name="activeEvaluationName"
      :readonly="evaluationAnswerReadonly"
      @submitted="handleEvaluationSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { student } from "~/composables/api/student";
import StudentTaskAnswerModal from "~/components/student/StudentTaskAnswerModal.vue";
import StarRating from "~/components/ui/StarRating.vue";
import { scoreToStars } from "~/utils/star-rating";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { getStudentCourseList, getStudentChapterList, getStudentCourseTest } = student();
const route = useRoute();
const router = useRouter();
const activeTab = ref<"lessons" | "evaluation">(
  String(route.query.tab || "") === "evaluation" ? "evaluation" : "lessons"
);

// 轮播
const carouselRef = ref<HTMLElement | null>(null);
const carouselOffset = ref(0);
const selectedCourseId = ref("");
const carouselStep = 176;
const carouselSidePadding = 12;
const isCarouselLoading = ref(false);

const getMaxOffset = () => {
  const containerWidth = carouselRef.value?.clientWidth || 600;
  return Math.max(
    0,
    carouselCourses.value.length * carouselStep + carouselSidePadding * 2 - containerWidth
  );
};

const scrollCarousel = (dir: number) => {
  const maxOffset = getMaxOffset();
  carouselOffset.value = Math.max(
    0,
    Math.min(maxOffset, carouselOffset.value + dir * carouselStep)
  );
};

const scrollToCourse = (courseId: string) => {
  const index = carouselCourses.value.findIndex(
    (item) => String(item.courseId) === courseId
  );
  if (index < 0) return;
  const containerWidth = carouselRef.value?.clientWidth || 600;
  const maxOffset = getMaxOffset();
  const cardCenter = index * carouselStep + 80 + carouselSidePadding;
  const targetOffset = cardCenter - containerWidth / 2;
  carouselOffset.value = Math.max(0, Math.min(maxOffset, targetOffset));
};

const selectCourse = (courseId: string) => {
  selectedCourseId.value = courseId;
  scrollToCourse(courseId);
};

const getInitialCourseId = (list: StudentCourseItem[]) => {
  const queryCourseId = route.query.courseId;
  const externalCourseId = Array.isArray(queryCourseId)
    ? String(queryCourseId[0] || "")
    : String(queryCourseId || "");
  if (
    externalCourseId &&
    list.some((item) => String(item.courseId) === externalCourseId)
  ) {
    return externalCourseId;
  }
  return list.length > 0 ? String(list[0].courseId) : "";
};

// 轮播课程背景渐变
const bgClasses = [
  "from-teal-400 to-cyan-500",
  "from-purple-400 to-indigo-500",
  "from-blue-400 to-cyan-400",
  "from-green-400 to-teal-500",
  "from-orange-400 to-amber-500",
];

interface StudentCourseItem {
  courseId: string | number;
  courseName?: string;
  courseCoverUrl?: string;
  courseDesc?: string;
  courseLabels?: string;
  taskStatus?: number;
}

interface CarouselCourse {
  courseId: string | number;
  coverUrl: string;
  taskStatus: number;
  bgClass: string;
}

interface LessonRecordItem {
  id: string;
  chapterId: string;
  title: string;
  teacher: string;
  time: string;
  isLastLesson: boolean;
  taskStatus: 0 | 1 | 2 | 3;
  actions: {
    type: "doTask" | "viewCourseResource";
    label: string;
    primary: boolean;
  }[];
}

interface EvaluationRecordItem {
  id: string;
  title: string;
  courseId: string;
  examTime: string;
  examStartTime: string;
  examEndTime: string;
  score: number | null;
  totalScore: number | null;
  starScore: number;
  status: 0 | 1 | 2 | 3;
}

const carouselCourses = ref<CarouselCourse[]>([]);
const lessonRecords = ref<LessonRecordItem[]>([]);
const evaluationRecords = ref<EvaluationRecordItem[]>([]);
const lessonRecordLoading = ref(false);
const evaluationLoading = ref(false);
const evaluationLoadedCourseIds = ref<Record<string, boolean>>({});
const evaluationHiddenCourseIds = ref<Record<string, boolean>>({});
const evaluationCache = ref<Record<string, EvaluationRecordItem[]>>({});
const nowTimestamp = ref(Date.now());
const showExamStartModal = ref(false);
const examStartRecord = ref<EvaluationRecordItem | null>(null);
const evaluationAnswerVisible = ref(false);
const activeEvaluationId = ref("");
const activeEvaluationName = ref("");
const evaluationAnswerReadonly = ref(false);
const resumeEvaluationRecord = ref<EvaluationRecordItem | null>(null);
let lessonRecordRequestSeq = 0;
let evaluationRequestSeq = 0;
let evaluationCountdownTimer: ReturnType<typeof setInterval> | null = null;
const lessonSkeletonCount = computed(() => lessonRecords.value.length);
const shownExamStartRecordIds = new Set<string>();
const showEvaluationTab = computed(() => {
  if (!selectedCourseId.value) return false;
  if (!evaluationLoadedCourseIds.value[selectedCourseId.value]) return false;
  return evaluationHiddenCourseIds.value[selectedCourseId.value] !== true;
});

const loadStudentCourseList = async () => {
  isCarouselLoading.value = true;
  try {
    const data = await getStudentCourseList();
    const list = Array.isArray(data) ? data : [];
    carouselCourses.value = list.map((item: StudentCourseItem, index: number) => ({
      courseId: item.courseId,
      coverUrl: String(item.courseCoverUrl || ""),
      taskStatus: Number(item.taskStatus ?? 0),
      bgClass: bgClasses[index % bgClasses.length],
    }));
    const initialCourseId = getInitialCourseId(list);
    selectedCourseId.value = initialCourseId;
    await nextTick();
    if (initialCourseId) scrollToCourse(initialCourseId);
  } catch (error) {
    console.error("获取上课记录课程列表失败", error);
    carouselCourses.value = [];
    selectedCourseId.value = "";
  } finally {
    isCarouselLoading.value = false;
  }
};

const firstNonEmptyString = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const normalizeTaskStatus = (item: any): 0 | 1 | 2 | 3 => {
  const statusNum = Number(
    item?.taskStatus ?? item?.chapterStatus ?? item?.commitStatus ?? item?.status
  );
  if (statusNum === 0 || statusNum === 1 || statusNum === 2 || statusNum === 3) {
    return statusNum;
  }

  const statusText = firstNonEmptyString(
    item?.taskStatusName,
    item?.taskStatusText,
    item?.statusName,
    item?.status
  ).toLowerCase();
  if (statusText.includes("部分") || statusText.includes("partial")) return 2;
  if (statusText.includes("un") || statusText.includes("未")) return 1;
  if (statusText.includes("已") || statusText.includes("完成")) return 3;
  if (
    statusText.includes("none") ||
    statusText.includes("暂无") ||
    statusText.includes("无") ||
    statusText.includes("暂")
  ) {
    return 0;
  }
  return 0;
};

const taskTagLabel = (status: LessonRecordItem["taskStatus"]) => {
  if (status === 1) return "未完成";
  if (status === 2) return "部分未提交";
  if (status === 3) return "已完成";
  return "暂无任务";
};

const taskTagClass = (status: LessonRecordItem["taskStatus"]) => {
  if (status === 1) return "lesson-task-tag--unfinished";
  if (status === 2) return "lesson-task-tag--partial";
  if (status === 3) return "lesson-task-tag--done";
  return "lesson-task-tag--none";
};

const normalizeLessonRecord = (item: any, index: number): LessonRecordItem => {
  const isLastLesson =
    item?.isLastLesson === 1 || item?.isLastLesson === true || index === 0;
  const taskStatus = normalizeTaskStatus(item);
  const chapterId = firstNonEmptyString(item?.chapterId, item?.id, item?.recordId);
  const title =
    firstNonEmptyString(item?.chapterName, item?.chapterTitle, item?.title, item?.name) ||
    "-";
  const teacher =
    firstNonEmptyString(item?.teacherName, item?.teacher, item?.createByName) || "-";
  const time =
    firstNonEmptyString(
      item?.lessonStartTime,
      item?.lessonTime,
      item?.classTime,
      item?.startTime,
      item?.createTime,
      item?.updateTime
    ) || "-";

  return {
    id: chapterId || `${index}`,
    chapterId,
    title,
    teacher,
    time,
    isLastLesson,
    taskStatus,
    actions:
      taskStatus === 1 || taskStatus === 2
        ? [
            { type: "doTask", label: t("lessonsRecord.doTask"), primary: true },
            {
              type: "viewCourseResource",
              label: t("lessonsRecord.viewCourseResource"),
              primary: false,
            },
          ]
        : [
            {
              type: "viewCourseResource",
              label: t("lessonsRecord.viewCourseResource"),
              primary: false,
            },
          ],
  };
};

const handleLessonAction = (
  action: LessonRecordItem["actions"][number],
  record: LessonRecordItem
) => {
  if (!selectedCourseId.value || !record.chapterId) return;

  if (action.type === "doTask") {
    router.push({
      path: "/student/task",
      query: {
        courseId: selectedCourseId.value,
        chapterId: record.chapterId,
        chapterName: record.title,
      },
    });
    return;
  }

  if (action.type === "viewCourseResource") {
    router.push({
      path: `/student/course/preview/${selectedCourseId.value}`,
      query: { chapterId: record.chapterId },
    });
  }
};

const normalizeLessonList = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.list)) return data.list;
  return [];
};

const evaluationStatusLabel = (status: EvaluationRecordItem["status"]) => {
  if (status === 1) return "考试中";
  if (status === 0) return "未开始";
  if (status === 2) return "已批改";
  return "未完成";
};

const evaluationStatusClass = (status: EvaluationRecordItem["status"]) => {
  if (status === 1) return "evaluation-status--ongoing";
  if (status === 0) return "evaluation-status--upcoming";
  if (status === 2) return "evaluation-status--finished";
  return "evaluation-status--unfinished";
};

const handleEvaluationAction = (record: EvaluationRecordItem) => {
  if (getEffectiveEvaluationStatus(record) === 1) {
    resumeEvaluationRecord.value = record;
  }
  activeEvaluationId.value = record.id;
  activeEvaluationName.value = record.title;
  evaluationAnswerReadonly.value = getEffectiveEvaluationStatus(record) !== 1;
  evaluationAnswerVisible.value = true;
};

const showResumeEvaluationEntry = computed(() => {
  return !!resumeEvaluationRecord.value && !evaluationAnswerVisible.value;
});

const resumeEvaluationExam = async () => {
  if (!resumeEvaluationRecord.value) return;

  const targetRecord = resumeEvaluationRecord.value;
  activeTab.value = "evaluation";

  if (selectedCourseId.value !== targetRecord.courseId) {
    selectedCourseId.value = targetRecord.courseId;
    await nextTick();
    scrollToCourse(targetRecord.courseId);
  }

  handleEvaluationAction(targetRecord);
};

const parseEvaluationDateTime = (value: string) => {
  const text = String(value || "").trim();
  if (!text || text === "-") return null;
  const parsed = new Date(text.replace(/-/g, "/"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getEvaluationStartTimestamp = (record: EvaluationRecordItem) => {
  const date = parseEvaluationDateTime(record.examStartTime);
  return date ? date.getTime() : null;
};

const getEffectiveEvaluationStatus = (record: EvaluationRecordItem): EvaluationRecordItem["status"] => {
  if (record.status !== 0) return record.status;
  const startTimestamp = getEvaluationStartTimestamp(record);
  if (startTimestamp !== null && nowTimestamp.value >= startTimestamp) {
    return 1;
  }
  return record.status;
};

const getEvaluationCountdownSeconds = (record: EvaluationRecordItem) => {
  if (record.status !== 0) return null;
  const startTimestamp = getEvaluationStartTimestamp(record);
  if (startTimestamp === null) return null;

  const diffSeconds = Math.floor((startTimestamp - nowTimestamp.value) / 1000);
  if (diffSeconds <= 0 || diffSeconds > 60) return null;
  return diffSeconds;
};

const getEvaluationCountdownDisplay = (record: EvaluationRecordItem) => {
  const totalSeconds = Math.max(0, getEvaluationCountdownSeconds(record) || 0);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return { minutes, seconds };
};

const shouldShowEvaluationFooter = (record: EvaluationRecordItem) => {
  return !!getEvaluationActionLabel(getEffectiveEvaluationStatus(record));
};

const activeCountdownRecord = computed(() => {
  return (
    evaluationRecords.value.find(
      (record) => getEvaluationCountdownSeconds(record) !== null
    ) || null
  );
});

const activeCountdownDisplay = computed(() => {
  if (!activeCountdownRecord.value) {
    return { minutes: "00", seconds: "00" };
  }
  return getEvaluationCountdownDisplay(activeCountdownRecord.value);
});

const closeExamStartModal = () => {
  showExamStartModal.value = false;
};

const handleExamStartConfirm = () => {
  if (examStartRecord.value) {
    handleEvaluationAction(examStartRecord.value);
  }
  showExamStartModal.value = false;
};

const buildEvaluationExamTime = (item: any) => {
  const fullRange = firstNonEmptyString(item?.examTime);
  if (fullRange) return fullRange;

  const start = firstNonEmptyString(item?.examStartTime);
  const end = firstNonEmptyString(item?.examEndTime);
  if (start && end) return `${start}-${end}`;
  if (start) return start;
  if (end) return end;
  return "-";
};

const getEvaluationActionLabel = (status: number) => {
  if (status === 1) return "去考试";
  if (status === 0) return "";
  return "查看详情";
};

const normalizeEvaluationRecord = (item: any, index: number): EvaluationRecordItem => {
  const statusNum = Number(item?.status ?? 0);
  const status: 0 | 1 | 2 | 3 =
    statusNum === 0 || statusNum === 1 || statusNum === 2 || statusNum === 3
      ? statusNum
      : 0;

  return {
    id: firstNonEmptyString(item?.evaluationId, item?.id, `evaluation-${index}`),
    title: firstNonEmptyString(item?.evaluationName, item?.title, item?.name) || "-",
    courseId: String(selectedCourseId.value || ""),
    examTime: buildEvaluationExamTime(item),
    examStartTime: firstNonEmptyString(item?.examStartTime),
    examEndTime: firstNonEmptyString(item?.examEndTime),
    score: item?.score === null || item?.score === undefined ? null : Number(item.score),
    totalScore:
      item?.totalScore === null || item?.totalScore === undefined
        ? null
        : Number(item.totalScore),
    starScore: scoreToStars(item?.score, item?.totalScore),
    status,
  };
};

const updateEvaluationCountdownState = () => {
  const targetRecord = evaluationRecords.value.find((record) => {
    if (shownExamStartRecordIds.has(record.id)) return false;
    if (record.status !== 0) return false;
    const startTimestamp = getEvaluationStartTimestamp(record);
    return startTimestamp !== null && nowTimestamp.value >= startTimestamp;
  });

  if (!targetRecord) return;

  shownExamStartRecordIds.add(targetRecord.id);
  examStartRecord.value = targetRecord;
  showExamStartModal.value = true;
};

const handleEvaluationSubmitted = async () => {
  evaluationAnswerVisible.value = false;
  resumeEvaluationRecord.value = null;
  if (selectedCourseId.value) {
    await loadEvaluationRecords(selectedCourseId.value);
  }
};

const loadLessonRecords = async (courseId: string) => {
  if (!courseId) {
    lessonRecords.value = [];
    return;
  }

  const requestId = ++lessonRecordRequestSeq;
  lessonRecordLoading.value = true;
  try {
    const data = await getStudentChapterList(courseId);
    if (requestId !== lessonRecordRequestSeq) return;

    const list = normalizeLessonList(data);
    lessonRecords.value = list.map((item: any, index: number) =>
      normalizeLessonRecord(item, index)
    );
  } catch (error) {
    if (requestId !== lessonRecordRequestSeq) return;
    console.error("获取上课记录章节列表失败", error);
    lessonRecords.value = [];
  } finally {
    if (requestId === lessonRecordRequestSeq) {
      lessonRecordLoading.value = false;
    }
  }
};

const loadEvaluationRecords = async (courseId: string) => {
  if (!courseId) {
    evaluationRecords.value = [];
    return;
  }

  const requestId = ++evaluationRequestSeq;
  evaluationLoading.value = true;
  try {
    const data = await getStudentCourseTest(courseId);
    if (requestId !== evaluationRequestSeq) return;

    const list = Array.isArray(data) ? data : [];
    const normalizedList = list.map((item: any, index: number) =>
      normalizeEvaluationRecord(item, index)
    );
    evaluationCache.value[courseId] = normalizedList;
    evaluationLoadedCourseIds.value[courseId] = true;
    evaluationHiddenCourseIds.value[courseId] = normalizedList.length === 0;
    evaluationRecords.value = normalizedList;
    if (normalizedList.length === 0 && activeTab.value === "evaluation") {
      activeTab.value = "lessons";
    }
  } catch (error) {
    if (requestId !== evaluationRequestSeq) return;
    console.error("获取学生课程测评列表失败", error);
    evaluationRecords.value = [];
    evaluationLoadedCourseIds.value[courseId] = true;
    evaluationHiddenCourseIds.value[courseId] = true;
  } finally {
    if (requestId === evaluationRequestSeq) {
      evaluationLoading.value = false;
    }
  }
};

const syncEvaluationRecordsByCourse = async (courseId: string) => {
  if (!courseId) {
    evaluationRecords.value = [];
    return;
  }

  if (evaluationLoadedCourseIds.value[courseId]) {
    evaluationRecords.value = evaluationCache.value[courseId] || [];
    if (evaluationHiddenCourseIds.value[courseId]) {
      activeTab.value = "lessons";
    }
    return;
  }

  await loadEvaluationRecords(courseId);
};

onMounted(() => {
  loadStudentCourseList();
  evaluationCountdownTimer = window.setInterval(() => {
    nowTimestamp.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (evaluationCountdownTimer) {
    clearInterval(evaluationCountdownTimer);
    evaluationCountdownTimer = null;
  }
});

watch(
  () => selectedCourseId.value,
  (courseId) => {
    loadLessonRecords(courseId);
    void syncEvaluationRecordsByCourse(courseId);
  }
);

watch(
  () => route.query.courseId,
  async (newCourseId) => {
    const targetId = Array.isArray(newCourseId)
      ? String(newCourseId[0] || "")
      : String(newCourseId || "");
    if (!targetId || carouselCourses.value.length === 0) return;
    if (!carouselCourses.value.some((item) => String(item.courseId) === targetId)) return;
    await nextTick();
    selectedCourseId.value = targetId;
    scrollToCourse(targetId);
  }
);

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = String(tab || "") === "evaluation" ? "evaluation" : "lessons";
  }
);

watch(
  [() => nowTimestamp.value, () => evaluationRecords.value],
  () => {
    updateEvaluationCountdownState();
  },
  { deep: true }
);

watch(
  () => evaluationAnswerVisible.value,
  (visible) => {
    if (visible) return;
    if (!resumeEvaluationRecord.value) return;
    if (evaluationAnswerReadonly.value) {
      resumeEvaluationRecord.value = null;
      return;
    }
    if (getEffectiveEvaluationStatus(resumeEvaluationRecord.value) !== 1) {
      resumeEvaluationRecord.value = null;
    }
  }
);
</script>

<style scoped>
.lessonsrecord-page {
  height: calc(100vh - 70px);
}

.carousel-shell {
  padding-bottom: 14px;
}

.carousel-track {
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  padding: 4px 12px 4px 12px;
  box-sizing: border-box;
}

.carousel-item {
  transition: transform 220ms ease-out, opacity 220ms ease-out;
  transform-origin: center center;
  will-change: transform, opacity;
}

.carousel-item--active {
  transform: scale(1.06) translateZ(0);
  opacity: 1;
}

.carousel-item--inactive {
  transform: scale(0.95) translateZ(0);
  opacity: 0.9;
}

.course-card {
  transition: border-color 360ms cubic-bezier(0.2, 0.9, 0.2, 1),
    box-shadow 360ms cubic-bezier(0.2, 0.9, 0.2, 1);
  border: 3px solid transparent;
}

.course-card--active {
  border-color: #ff9900;
  box-shadow: 0 10px 20px rgba(255, 153, 0, 0.16), 0 4px 10px rgba(255, 153, 0, 0.12);
}

.course-card--active::after {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -18px;
  width: 0;
  height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 14px solid #ff9900;
}

.course-card--active::before {
  content: "";
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -28px;
  width: 18px;
  height: 8px;
  border-radius: 999px;
  background: #ffb84d;
}

.task-unsubmitted-badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  padding: 6px 20px 6px 14px;
  color: #ffffff;
  font-size: 11px;
  line-height: 1;
  font-weight: 600;
  background: linear-gradient(90deg, #ff5f8a 0%, #ff7eb7 100%);
  clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%);
  box-shadow: 0 6px 14px rgba(255, 95, 138, 0.34);
}

.lesson-record-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 4px;
  background: linear-gradient(180deg, #5bd995 0%, #4dce86 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
}

.record-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.record-tab {
  min-width: 112px;
  height: 40px;
  padding: 0 18px;
  border-radius: 10px 10px 0 0;
  font-size: 14px;
  line-height: 1;
  font-weight: 600;
  transition: all 0.2s ease;
}

.record-tab--active {
  background: linear-gradient(180deg, #5bd995 0%, #4dce86 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(77, 206, 134, 0.22);
}

.record-tab--inactive {
  background: #ffffff;
  color: #4b5563;
  border: 1px solid #dfe6ee;
  border-bottom: none;
}

.lesson-record-panel {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #dfe6ee;
  background: #eef2f5;
}

.evaluation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 396px));
  gap: 18px;
  align-items: start;
}

.evaluation-card {
  position: relative;
  min-height: 230px;
  padding: 26px 22px 20px;
  border-radius: 16px;
  border: 1px solid #e2e8ef;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.evaluation-title {
  margin: 0;
  color: #111827;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 600;
}

.evaluation-time {
  margin-top: 18px;
  color: #6f7e94;
  font-size: 15px;
  line-height: 1.6;
}

.evaluation-status {
  margin-top: 22px;
  width: fit-content;
  min-width: 64px;
  height: 28px;
  padding: 0 12px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  font-weight: 600;
}

.evaluation-status--ongoing {
  background: #ddf8d9;
  color: #58c64e;
}

.evaluation-status--upcoming {
  background: #e4f5ff;
  color: #3ea8ff;
}

.evaluation-status--finished {
  background: #eceff3;
  color: #a0acba;
}

.evaluation-status--unfinished {
  background: #fff0f0;
  color: #ff6b6b;
}

.evaluation-footer {
  margin-top: auto;
  padding-top: 26px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 14px;
  flex-wrap: wrap;
}

.evaluation-actions {
  display: flex;
  justify-content: flex-end;
}

.evaluation-btn {
  min-width: 104px;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  background: linear-gradient(180deg, #ddf8df 0%, #cbeed0 100%);
  color: #35c37a;
  font-size: 14px;
  line-height: 1;
  font-weight: 600;
  transition: all 0.2s ease;
}

.evaluation-btn:hover {
  background: linear-gradient(180deg, #d1f4d8 0%, #bce8c3 100%);
}

.evaluation-score-stars {
  margin-top: 22px;
  display: flex;
  align-items: center;
}

.evaluation-countdown-floating {
  position: fixed;
  left: 44px;
  bottom: 28px;
  z-index: 50;
  min-height: 64px;
  padding: 0 14px 0 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(90deg, #79ec58 0%, #48d18b 100%);
  box-shadow: 0 14px 24px rgba(72, 209, 139, 0.22);
}

.evaluation-countdown-label {
  color: #ffffff;
  font-size: 14px;
  line-height: 1;
  font-weight: 600;
  white-space: nowrap;
}

.evaluation-countdown-box {
  min-width: 68px;
  height: 54px;
  padding: 0 12px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.98);
  color: #4dd08a;
  font-size: 30px;
  line-height: 1;
  font-weight: 700;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.evaluation-countdown-separator {
  color: #ffffff;
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
}

.evaluation-countdown-float-enter-active,
.evaluation-countdown-float-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.evaluation-countdown-float-enter-from,
.evaluation-countdown-float-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.evaluation-resume-floating {
  position: fixed;
  left: 0;
  bottom: 168px;
  z-index: 55;
  min-width: 164px;
  height: 68px;
  padding: 0 22px 0 26px;
  border-radius: 0 34px 34px 0;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: linear-gradient(90deg, #79ec58 0%, #48d18b 100%);
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(73, 212, 138, 0.26);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.evaluation-resume-floating:hover {
  transform: translateX(6px);
  box-shadow: 0 18px 34px rgba(73, 212, 138, 0.32);
}

.evaluation-resume-text {
  font-size: 16px;
  line-height: 1;
  font-weight: 700;
  white-space: nowrap;
}

.evaluation-resume-bars {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.evaluation-resume-bar {
  width: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  animation: evaluation-resume-pulse 1s ease-in-out infinite;
}

.evaluation-resume-bar:nth-child(1) {
  height: 18px;
  animation-delay: 0s;
}

.evaluation-resume-bar:nth-child(2) {
  height: 26px;
  animation-delay: 0.12s;
}

.evaluation-resume-bar:nth-child(3) {
  height: 22px;
  animation-delay: 0.24s;
}

.evaluation-resume-bar:nth-child(4) {
  height: 16px;
  animation-delay: 0.36s;
}

.evaluation-resume-float-enter-active,
.evaluation-resume-float-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.evaluation-resume-float-enter-from,
.evaluation-resume-float-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes evaluation-resume-pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scaleY(0.72);
  }
  50% {
    opacity: 1;
    transform: scaleY(1);
  }
}

.exam-start-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exam-start-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.exam-start-modal {
  position: relative;
  z-index: 1;
  width: min(420px, calc(100vw - 32px));
  border-radius: 16px;
  background: #fff;
  padding: 30px 34px 28px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
  text-align: center;
}

.exam-start-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.exam-start-close:hover {
  background: #f5f5f5;
  color: #666;
}

.exam-start-title {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 700;
}

.exam-start-content {
  margin-top: 40px;
}

.exam-start-line {
  color: #374151;
  font-size: 15px;
  line-height: 1.8;
}

.exam-start-btn {
  min-width: 130px;
  height: 40px;
  margin-top: 36px;
  padding: 0 24px;
  border-radius: 10px;
  background: linear-gradient(180deg, #72e85d 0%, #66dd55 100%);
  color: #fff;
  font-size: 15px;
  line-height: 1;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(102, 221, 85, 0.22);
  transition: all 0.2s ease;
}

.exam-start-btn:hover {
  background: linear-gradient(180deg, #67df56 0%, #5fd34f 100%);
}

.evaluation-start-modal-enter-active,
.evaluation-start-modal-leave-active {
  transition: opacity 0.2s ease;
}

.evaluation-start-modal-enter-from,
.evaluation-start-modal-leave-to {
  opacity: 0;
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.lesson-card {
  position: relative;
  min-height: 228px;
  padding: 18px 18px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8ef;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.24s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.24s ease;
}

.lesson-card:hover {
  transform: translateY(-4px);
  border-color: #d5dfea;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.12);
}

.lesson-last-corner {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 64px;
  height: 30px;
  padding: 0 10px;
  border-radius: 0 12px 0 12px;
  background: #ddf0d6;
  color: #53bf46;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  line-height: 1;
  font-weight: 600;
}

.lesson-title {
  margin: 0;
  color: #111827;
  font-size: 20px;
  line-height: 1.35;
  font-weight: 600;
  transform-origin: left top;
  margin-bottom: 10px;
  margin-top: 10px;
}

.lesson-meta {
  margin-bottom: 20px;
  color: #6f7e94;
  font-size: 16px;
  line-height: 1.35;

  transform-origin: left top;
}

.lesson-task-tag {
  margin-top: 10px;
  width: fit-content;
  height: 34px;
  padding: 10px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
  font-weight: 400;

  transform-origin: left top;
}

.lesson-task-tag--unfinished {
  background: #ffd9ef;
  color: #ff58ad;
}

.lesson-task-tag--partial {
  background: #ffe8cc;
  color: #fa8c16;
}

.lesson-task-tag--done {
  background: #e8f8ee;
  color: #2fb96f;
}

.lesson-task-tag--none {
  background: #eceff3;
  color: #b5bcc7;
}

.lesson-actions {
  margin-top: auto;
  padding-top: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  flex-wrap: nowrap;
}

.lesson-btn {
  height: 32px;
  padding: 0 11px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.lesson-btn--primary {
  border: 1px solid #9fe5bf;
  color: #35c37a;
  background: #ffffff;
}

.lesson-btn--primary:hover {
  background: #f5fff9;
}

.lesson-btn--secondary {
  border: 1px solid #c6ead7;
  color: #35c37a;
  background: #ccefdc;
}

.lesson-btn--secondary:hover {
  background: #bfe7d0;
}

.lesson-card--skeleton {
  pointer-events: none;
}

.lesson-card--skeleton:hover {
  transform: none;
  box-shadow: none;
  border-color: #e2e8ef;
}

.lesson-skeleton-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.lesson-skeleton-corner {
  width: 64px;
  height: 30px;
  border-radius: 0 12px 0 12px;
  margin-left: auto;
}

.lesson-skeleton-title {
  width: 68%;
  height: 22px;
  border-radius: 8px;
  margin-top: 14px;
}

.lesson-skeleton-meta {
  width: 72%;
  height: 14px;
  border-radius: 8px;
  margin-top: 12px;
}

.lesson-skeleton-tag {
  width: 84px;
  height: 34px;
  border-radius: 10px;
  margin-top: 12px;
}

.lesson-skeleton-actions {
  margin-top: auto;
  padding-top: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
}

.lesson-skeleton-btn {
  width: 86px;
  height: 32px;
  border-radius: 8px;
}

.lesson-skeleton-corner,
.lesson-skeleton-title,
.lesson-skeleton-meta,
.lesson-skeleton-tag,
.lesson-skeleton-btn {
  overflow: hidden;
}

.lesson-card--skeleton :deep(.el-skeleton__item) {
  border-radius: inherit;
}

.lesson-skeleton-btn--primary {
  width: 78px;
}

@media (max-width: 1024px) {
  .lesson-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .evaluation-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .lesson-record-panel {
    padding: 12px;
  }

  .lesson-grid {
    grid-template-columns: 1fr;
  }

  .lesson-card {
    min-height: 206px;
    padding: 16px 14px 14px;
  }

  .lesson-title {
    font-size: 29px;
  }

  .lesson-meta {
    font-size: 27px;
  }

  .lesson-task-tag {
    font-size: 24px;
  }

  .lesson-btn {
    height: 30px;
    padding: 0 10px;
    font-size: 11px;
    border-radius: 8px;
  }

  .lesson-skeleton-btn {
    height: 30px;
    border-radius: 8px;
  }
}

@keyframes skeletonShimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-card {
  background: linear-gradient(110deg, #e8edf3 8%, #f7f9fc 18%, #e8edf3 33%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.2s linear infinite;
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.08);
}
</style>
