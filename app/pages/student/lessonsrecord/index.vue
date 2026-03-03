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

        <!-- 上课记录标签 -->
        <div class="mb-3">
          <span class="lesson-record-tag">{{ $t("lessonsRecord.classRecord") }}</span>
        </div>

        <div class="lesson-record-panel">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { student } from "~/composables/api/student";

definePageMeta({
  layout: "default",
});

const { t } = useI18n();
const { getStudentCourseList, getStudentChapterList } = student();
const route = useRoute();
const router = useRouter();

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

const carouselCourses = ref<CarouselCourse[]>([]);
const lessonRecords = ref<LessonRecordItem[]>([]);
const lessonRecordLoading = ref(false);
let lessonRecordRequestSeq = 0;
const lessonSkeletonCount = computed(() => lessonRecords.value.length);

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

onMounted(() => {
  loadStudentCourseList();
});

watch(
  () => selectedCourseId.value,
  (courseId) => {
    loadLessonRecords(courseId);
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

.lesson-record-panel {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #dfe6ee;
  background: #eef2f5;
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
