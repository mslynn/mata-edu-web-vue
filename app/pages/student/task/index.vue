<template>
  <div class="student-task-page flex-1 flex flex-col overflow-hidden">
    <div class="task-shell flex-1 overflow-hidden">
      <div class="task-header">
        <div class="header-left">
          <button class="back-btn" @click="goBack">
            <svg
              class="w-5 h-5 text-[#6B7280]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <MSelect
            v-if="chapterList.length > 0"
            :model-value="currentChapterId"
            :options="chapterList"
            value-key="id"
            label-key="name"
            :placeholder="currentChapterName"
            class="chapter-select"
            @change="handleChapterSelectChange"
          />
          <span v-else class="chapter-name">{{ currentChapterName }}</span>
        </div>

        <div class="header-title">我的任务</div>
        <div class="header-right"></div>
      </div>

      <div class="task-body">
        <aside class="task-sidebar">
          <template v-if="!taskListLoading && taskGroups.length > 0">
            <div v-for="group in taskGroups" :key="group.key" class="task-group">
              <button class="task-group-title" @click="toggleGroup(group.key)">
                <svg
                  class="task-group-arrow"
                  :class="{ expanded: expandedGroups[group.key] }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span>{{ group.name }}</span>
              </button>

              <div v-show="expandedGroups[group.key]" class="task-group-list">
                <button
                  v-for="item in group.items"
                  :key="item.key"
                  class="task-item"
                  :class="{ active: item.key === selectedTaskKey }"
                  @click="selectedTaskKey = item.key"
                >
                  <span class="task-status-pill" :class="taskStatusClass(item.status)">
                    {{ taskStatusLabel(item.status) }}
                  </span>
                  <span class="task-item-name">{{ item.menuName }}</span>
                </button>
              </div>
            </div>
          </template>

          <div
            v-else-if="!taskListLoading"
            class="h-full text-sm text-[#9CA3AF] flex items-center justify-center"
          >
            当前章节暂无任务
          </div>

          <div v-else class="task-sidebar-skeleton">
            <el-skeleton v-for="idx in 6" :key="idx" animated>
              <template #template>
                <el-skeleton-item variant="text" style="width: 100%; height: 28px" />
              </template>
            </el-skeleton>
          </div>
        </aside>

        <main class="task-main">
          <template v-if="taskListLoading">
            <div class="task-main-card">
              <el-skeleton animated>
                <template #template>
                  <div class="task-main-skeleton">
                    <el-skeleton-item variant="text" style="width: 120px; height: 24px" />
                    <el-skeleton-item variant="text" style="width: 220px; height: 16px" />
                    <el-skeleton-item
                      variant="rect"
                      style="width: 220px; height: 210px; border-radius: 12px"
                    />
                    <el-skeleton-item
                      variant="button"
                      style="width: 116px; height: 36px; border-radius: 8px"
                    />
                  </div>
                </template>
              </el-skeleton>
            </div>
          </template>

          <template v-else-if="selectedTask">
            <div class="task-main-card">
              <template v-if="isExerciseLikeTask">
                <div class="exercise-stepper">
                  <div
                    class="exercise-step"
                    :class="{
                      'exercise-step--active': !isExerciseResultStep,
                      'exercise-step--done': isExerciseResultStep,
                    }"
                  >
                    <span class="exercise-step-dot">{{ isExerciseResultStep ? "✓" : "1" }}</span>
                    <span class="exercise-step-text">提交任务</span>
                  </div>
                  <div
                    class="exercise-step-line"
                    :class="{ 'exercise-step-line--active': isExerciseResultStep }"
                  ></div>
                  <div class="exercise-step" :class="{ 'exercise-step--active': isExerciseResultStep }">
                    <span class="exercise-step-dot">2</span>
                    <span class="exercise-step-text">查看结果</span>
                  </div>
                </div>

                <p class="task-submit-desc task-submit-desc--exercise">
                  {{
                    isSelectedTaskSubmitted
                      ? isExerciseResultStep
                        ? "当前为查看结果步骤，可点击查看详情"
                        : "任务已提交，可查看详情或进入下一步"
                      : "请完成以下任务，完成后点击提交"
                  }}
                </p>

                <template v-if="!isExerciseResultStep">
                  <button class="exercise-preview-card" type="button" @click="handleExerciseCardClick">
                    <div class="exercise-preview-body">
                      <div class="exercise-scroll-icon">
                        <span class="exercise-scroll-fold"></span>
                        <span class="exercise-scroll-line"></span>
                        <span class="exercise-scroll-line"></span>
                        <span class="exercise-scroll-line"></span>
                      </div>
                      <span class="exercise-pointer" aria-hidden="true">
                        <span class="exercise-pointer-ripple"></span>
                        <span class="exercise-pointer-icon">👈</span>
                      </span>
                    </div>
                    <div class="exercise-preview-name">{{ selectedTask.taskName }}</div>
                  </button>

                  <div v-if="isSelectedTaskSubmitted" class="exercise-action-row">
                    <button
                      class="task-submit-btn task-submit-btn--exercise task-submit-btn--detail"
                      :disabled="doingTask"
                      @click="handleViewDetail"
                    >
                      {{ doingTask ? "处理中..." : "查看详情" }}
                    </button>
                    <button
                      class="task-submit-btn task-submit-btn--exercise task-submit-btn--next"
                      :disabled="isExerciseResultStep"
                      @click="handleNextStep"
                    >
                      {{ isExerciseResultStep ? "已下一步" : "下一步" }}
                    </button>
                  </div>
                  <button
                    v-else
                    class="task-submit-btn task-submit-btn--exercise"
                    :disabled="doingTask"
                    @click="handleDoTask"
                  >
                    {{ doingTask ? "处理中..." : "做任务" }}
                  </button>
                </template>

                <template v-else>
                  <div class="exercise-result-table">
                    <div class="exercise-result-head">
                      <div>练习名称</div>
                      <div>提交时间</div>
                      <div>状态</div>
                      <div>得分</div>
                      <div>操作</div>
                    </div>

                    <div class="exercise-result-row">
                      <div class="exercise-result-name" :title="selectedTask.taskName">{{ selectedTask.taskName }}</div>
                      <div>{{ selectedTaskSubmitTime }}</div>
                      <div>{{ selectedTaskReviewStatus }}</div>
                      <div>
                        <div class="exercise-score-box">
                          <StarRating
                            :model-value="selectedTaskScoreStar"
                            :size="16"
                            :gap="1"
                            fill-color="#f7b84b"
                            empty-color="#e6dfd1"
                            readonly
                          />
                        </div>
                      </div>
                      <div>
                        <button class="exercise-result-detail-btn" @click="handleViewDetail">查看详情</button>
                      </div>
                    </div>
                  </div>

                  <button class="task-submit-btn task-submit-btn--exercise task-submit-btn--detail" @click="handlePrevStep">
                    上一步
                  </button>
                </template>
              </template>

              <template v-else>
                <h2 class="task-submit-title">提交任务</h2>
                <p class="task-submit-desc">请完成以下任务，完成后点击提交</p>

                <div class="task-preview-card">
                  <div class="task-preview-icon">AI</div>
                  <div class="task-preview-name">{{ selectedTask.taskName }}</div>
                </div>

                <button
                  class="task-submit-btn"
                  :disabled="doingTask || selectedTask.status === 1"
                  @click="handleDoTask"
                >
                  {{ doingTask ? "处理中..." : selectedTask.status === 1 ? "已提交" : "做任务" }}
                </button>
              </template>
            </div>
          </template>

          <template v-else>
            <div class="task-main-card task-empty">请选择左侧任务</div>
          </template>
        </main>
      </div>
    </div>

    <StudentTaskAnswerModal
      v-model="taskAnswerVisible"
      :task-id="activeTaskId"
      :task-name="activeTaskName"
      :readonly="taskAnswerReadonly"
      @submitted="handleTaskSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { student } from "~/composables/api/student";
import StudentTaskAnswerModal from "~/components/student/StudentTaskAnswerModal.vue";
import StarRating from "~/components/ui/StarRating.vue";

definePageMeta({ layout: "default" });

type TaskStatus = 0 | 1;

interface ChapterItem {
  id: string;
  name: string;
}

interface TaskItem {
  key: string;
  taskId: string;
  menuName: string;
  taskName: string;
  status: TaskStatus;
  resourceCategory: number;
  raw: any;
}

interface TaskGroup {
  key: string;
  name: string;
  items: TaskItem[];
}

const route = useRoute();
const router = useRouter();
const { getStudentTaskChapterList, getStudentTaskList, startStudentTask } = student();

const chapterList = ref<ChapterItem[]>([]);
const currentChapterId = ref("");
const taskGroups = ref<TaskGroup[]>([]);
const expandedGroups = ref<Record<string, boolean>>({});
const selectedTaskKey = ref("");
const taskListLoading = ref(false);
const doingTask = ref(false);
const taskAnswerVisible = ref(false);
const activeTaskId = ref("");
const activeTaskName = ref("");
const taskAnswerReadonly = ref(false);
const exerciseStep = ref<1 | 2>(1);

const courseId = computed(() => {
  const value = route.query.courseId;
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
});

const chapterNameFromQuery = computed(() => {
  const value = route.query.chapterName;
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
});

const currentChapterName = computed(() => {
  const chapter = chapterList.value.find((item) => item.id === currentChapterId.value);
  return chapter?.name || chapterNameFromQuery.value || "请选择章节";
});

const selectedTask = computed(() => {
  for (const group of taskGroups.value) {
    const found = group.items.find((item) => item.key === selectedTaskKey.value);
    if (found) return found;
  }
  return null;
});

const isExerciseLikeTask = computed(() => {
  const category = Number(selectedTask.value?.resourceCategory ?? -1);
  return category === 11 || category === 6;
});

const isSelectedTaskSubmitted = computed(() => {
  return Number(selectedTask.value?.status ?? 0) === 1;
});

const isExerciseResultStep = computed(() => {
  return isSelectedTaskSubmitted.value && exerciseStep.value === 2;
});

const formatTaskTime = (value: any) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  if (!text) return "-";

  if (/^\d{10,13}$/.test(text)) {
    const timestamp = text.length === 13 ? Number(text) : Number(text) * 1000;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return text;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }
  return text;
};

const selectedTaskSubmitTime = computed(() => {
  const raw = selectedTask.value?.raw;
  return formatTaskTime(raw?.taskEndTime);
});

const selectedTaskReviewStatus = computed(() => {
  const raw = selectedTask.value?.raw;
  const reviewText = firstNonEmptyString(
    raw?.reviewStatusName,
    raw?.reviewStatusText,
    raw?.correctStatusName,
    raw?.checkStatusName,
    raw?.statusName
  );
  if (reviewText) return reviewText;
  return isSelectedTaskSubmitted.value ? "已提交" : "未提交";
});

const normalizeRatePercent = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace("%", "");
  if (!text) return null;
  const num = Number(text);
  if (Number.isNaN(num)) return null;
  const rate = num > 0 && num <= 1 ? num * 100 : num;
  return Math.max(0, Math.min(100, rate));
};

const rateToStars = (rate: number): number => {
  if (rate <= 0) return 0;
  if (rate <= 10) return 0.5;
  if (rate <= 20) return 1;
  if (rate <= 30) return 1.5;
  if (rate <= 40) return 2;
  if (rate <= 50) return 2.5;
  if (rate <= 60) return 3;
  if (rate <= 70) return 3.5;
  if (rate <= 80) return 4;
  if (rate <= 90) return 4.5;
  return 5;
};

const selectedTaskScoreStar = computed(() => {
  const raw = selectedTask.value?.raw || {};
  const directRate =
    normalizeRatePercent(raw?.correctRate) ??
    normalizeRatePercent(raw?.accuracy) ??
    normalizeRatePercent(raw?.accuracyRate) ??
    normalizeRatePercent(raw?.rightRate) ??
    normalizeRatePercent(raw?.correctPercent);

  if (directRate !== null) {
    return rateToStars(directRate);
  }

  const score = Number(raw?.score);
  const totalScore = Number(raw?.totalScore);
  if (Number.isNaN(score) || Number.isNaN(totalScore) || totalScore <= 0) {
    return 0;
  }

  const rate = Math.round((score / totalScore) * 100);
  return rateToStars(rate);
});

const firstNonEmptyString = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const normalizeTaskStatus = (item: any): TaskStatus => {
  const statusNum = Number(
    item?.taskStatus ?? item?.chapterStatus ?? item?.commitStatus ?? item?.status
  );
  if (statusNum === 0 || statusNum === 1) return statusNum;
  if (statusNum === 2) return 0;
  if (statusNum === 3) return 1;

  const submissionStatus = firstNonEmptyString(item?.submissionStatus).toLowerCase();
  if (submissionStatus === "submitted") return 1;
  if (submissionStatus === "unsubmitted") return 0;

  const statusText = firstNonEmptyString(
    item?.taskStatusName,
    item?.taskStatusText,
    item?.statusName,
    item?.status
  ).toLowerCase();
  if (statusText.includes("已") || statusText.includes("完成") || statusText.includes("done")) return 1;
  if (statusText.includes("部分") || statusText.includes("partial")) return 0;
  if (statusText.includes("未") || statusText.includes("un")) return 0;
  return 0;
};

const categoryNameMap: Record<number, string> = {
  12: "个人实训任务",
  7: "个人实训任务",
  10: "个人实训任务",
  2: "个人上传任务",
  11: "自定义练习题",
  6: "自定义练习题",
};

const getCategoryName = (category: number) => {
  return categoryNameMap[category] || "任务";
};

const taskStatusLabel = (status: TaskStatus) => {
  return status === 1 ? "已提交" : "未提交";
};

const taskStatusClass = (status: TaskStatus) => {
  return status === 1 ? "task-status-pill--done" : "task-status-pill--pending";
};

const normalizeTaskItem = (item: any, index: number, fallbackCategory?: number): TaskItem => {
  const key = firstNonEmptyString(
    item?.taskId,
    item?.taskid,
    item?.taskID,
    item?.resourceId,
    item?.id,
    `${index}`
  );
  // 下发/开始任务必须使用任务列表返回的 taskId，不能回退到其它字段
  const taskId = firstNonEmptyString(item?.taskId, item?.taskid, item?.taskID);
  // 左侧子级：优先使用 taskName，resourceName 仅兜底
  const menuName =
    firstNonEmptyString(item?.taskName, item?.resourceName, item?.fileName, item?.name) || "-";
  // 右侧名称：优先使用内层 taskName
  const taskName =
    firstNonEmptyString(item?.taskName, item?.resourceName, item?.fileName, item?.name) || "-";
  const status = normalizeTaskStatus(item);
  const resourceCategory = Number(item?.resourceCategory ?? item?.category ?? fallbackCategory ?? -1);

  return {
    key,
    taskId,
    menuName,
    taskName,
    status,
    resourceCategory,
    raw: item,
  };
};

const normalizeTaskGroupList = (data: any): TaskGroup[] => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.records)
      ? data.records
      : Array.isArray(data?.rows)
        ? data.rows
        : Array.isArray(data?.list)
          ? data.list
          : [];

  if (list.length === 0) return [];

  if (
    list.some(
      (item: any) =>
        Array.isArray(item?.resourceList) ||
        Array.isArray(item?.taskList) ||
        Array.isArray(item?.tasklist)
    )
  ) {
    return list
      .map((group: any, index: number) => {
        const category = Number(group?.resourceCategory ?? -1);
        const groupName =
          firstNonEmptyString(group?.resourceName, group?.groupName, getCategoryName(category)) ||
          `任务分组${index + 1}`;
        const rawItems = Array.isArray(group?.resourceList)
          ? group.resourceList
          : Array.isArray(group?.taskList)
            ? group.taskList
            : Array.isArray(group?.tasklist)
              ? group.tasklist
            : [];
        const items = rawItems.map((task: any, taskIndex: number) =>
          normalizeTaskItem(task, taskIndex, category)
        );
        return {
          key: firstNonEmptyString(group?.resourceCategory, groupName, `${index}`),
          name: groupName,
          items,
        };
      })
      .filter((group: TaskGroup) => group.items.length > 0);
  }

  const groupedMap = new Map<string, TaskGroup>();
  list.forEach((item: any, index: number) => {
    const normalizedTask = normalizeTaskItem(item, index);
    const category = Number(item?.resourceCategory ?? normalizedTask.resourceCategory ?? -1);
    const groupKey = `cat_${category}`;
    // 扁平数据分支：父级优先使用接口 resourceName，再回退到分类文案
    const groupName =
      firstNonEmptyString(item?.resourceName, item?.groupName, getCategoryName(category)) ||
      getCategoryName(category);

    if (!groupedMap.has(groupKey)) {
      groupedMap.set(groupKey, { key: groupKey, name: groupName, items: [] });
    }
    groupedMap.get(groupKey)!.items.push(normalizedTask);
  });

  return [...groupedMap.values()].filter((group) => group.items.length > 0);
};

const normalizeChapterList = (data: any): ChapterItem[] => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.records)
      ? data.records
      : Array.isArray(data?.rows)
        ? data.rows
        : Array.isArray(data?.list)
          ? data.list
          : [];

  return list
    .map((item: any, index: number) => ({
      id: firstNonEmptyString(item?.chapterId, item?.id, item?.recordId, `${index}`),
      name:
        firstNonEmptyString(item?.chapterName, item?.chapterTitle, item?.title, item?.name) ||
        `章节${index + 1}`,
    }))
    .filter((item: ChapterItem) => !!item.id);
};

const resetTaskSelection = () => {
  const firstTask = taskGroups.value[0]?.items?.[0];
  selectedTaskKey.value = firstTask ? firstTask.key : "";
};

const loadTaskList = async (chapterId: string) => {
  if (!chapterId) {
    taskGroups.value = [];
    selectedTaskKey.value = "";
    return;
  }

  taskListLoading.value = true;
  try {
    const data = await getStudentTaskList(chapterId);
    taskGroups.value = normalizeTaskGroupList(data);

    const nextExpanded: Record<string, boolean> = {};
    taskGroups.value.forEach((group) => {
      nextExpanded[group.key] = expandedGroups.value[group.key] ?? true;
    });
    expandedGroups.value = nextExpanded;

    const hasSelected = taskGroups.value.some((group) =>
      group.items.some((item) => item.key === selectedTaskKey.value)
    );
    if (!hasSelected) {
      resetTaskSelection();
    }
  } catch (error: any) {
    console.error("获取学生任务列表失败", error);
    taskGroups.value = [];
    selectedTaskKey.value = "";
    ElMessage.error(error?.message || "获取学生任务列表失败");
  } finally {
    taskListLoading.value = false;
  }
};

const loadPageData = async () => {
  const queryChapterId = Array.isArray(route.query.chapterId)
    ? String(route.query.chapterId[0] || "")
    : String(route.query.chapterId || "");

  // 左侧菜单数据以 getStudentTaskList 为准，优先使用外部传入的 chapterId
  currentChapterId.value = queryChapterId;
  if (currentChapterId.value) {
    await loadTaskList(currentChapterId.value);
  }

  // 章节列表仅用于顶部切换下拉
  if (!courseId.value) return;
  try {
    const chapterData = await getStudentTaskChapterList(courseId.value);
    chapterList.value = normalizeChapterList(chapterData);
  } catch (error) {
    console.error("获取章节列表失败", error);
    chapterList.value = [];
  }

  if (!currentChapterId.value && chapterList.value.length > 0) {
    currentChapterId.value = chapterList.value[0]!.id;
    await loadTaskList(currentChapterId.value);
    return;
  }

  if (currentChapterId.value && chapterList.value.length > 0) {
    const matched = chapterList.value.find((item) => item.id === currentChapterId.value);
    if (!matched) {
      currentChapterId.value = chapterList.value[0]!.id;
      await loadTaskList(currentChapterId.value);
    }
  }
};

const selectChapter = async (chapter: ChapterItem) => {
  if (chapter.id === currentChapterId.value) {
    return;
  }

  currentChapterId.value = chapter.id;
  selectedTaskKey.value = "";

  await router.replace({
    path: "/student/task",
    query: {
      ...route.query,
      courseId: courseId.value || undefined,
      chapterId: chapter.id,
      chapterName: chapter.name,
    },
  });

  await loadTaskList(chapter.id);
};

const handleChapterSelectChange = async (value: string | number | null, option: any) => {
  const chapterId = String(option?.id ?? option?.value ?? value ?? "");
  if (!chapterId) return;
  const chapterName = String(option?.name ?? option?.label ?? "");
  await selectChapter({ id: chapterId, name: chapterName });
};

const toggleGroup = (groupKey: string) => {
  expandedGroups.value[groupKey] = !expandedGroups.value[groupKey];
};

const handleTaskSubmitted = async () => {
  if (!currentChapterId.value) return;
  exerciseStep.value = 1;
  await loadTaskList(currentChapterId.value);
};

const handleViewDetail = () => {
  handleDoTask();
};

const handleNextStep = () => {
  if (!isSelectedTaskSubmitted.value) return;
  exerciseStep.value = 2;
};

const handlePrevStep = () => {
  exerciseStep.value = 1;
};

const handleExerciseCardClick = () => {
  handleDoTask();
};

const handleDoTask = async () => {
  if (!selectedTask.value) return;

  const taskId = firstNonEmptyString(
    selectedTask.value.raw?.taskId,
    selectedTask.value.raw?.taskid,
    selectedTask.value.raw?.taskID,
    selectedTask.value.taskId
  );
  if (!taskId) {
    ElMessage.warning("当前任务缺少 taskId");
    return;
  }

  if (isExerciseLikeTask.value && selectedTask.value.status === 1) {
    taskAnswerReadonly.value = true;
    activeTaskId.value = String(taskId);
    activeTaskName.value = selectedTask.value.taskName;
    taskAnswerVisible.value = true;
    return;
  }

  if (selectedTask.value.status === 1) {
    ElMessage.warning("任务已提交");
    return;
  }

  doingTask.value = true;
  try {
    const data = await startStudentTask(String(taskId));
    if (isExerciseLikeTask.value) {
      taskAnswerReadonly.value = false;
      activeTaskId.value = String(taskId);
      activeTaskName.value = selectedTask.value.taskName;
      taskAnswerVisible.value = true;
      return;
    }

    const taskUrl = firstNonEmptyString(
      data?.taskUrl,
      data?.url,
      data?.resourceUrl,
      data?.previewUrl
    );
    if (taskUrl && /^https?:\/\//i.test(taskUrl)) {
      window.open(taskUrl, "_blank", "noopener,noreferrer");
      return;
    }
    ElMessage.success("任务已开始");
  } catch (error: any) {
    console.error("开始任务失败", error);
    ElMessage.error(error?.message || "开始任务失败");
  } finally {
    doingTask.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadPageData();
});

watch(
  () => selectedTaskKey.value,
  () => {
    exerciseStep.value = 1;
  }
);
</script>

<style scoped>
.student-task-page {
  height: calc(100vh - 70px);
}

.task-shell {
  margin: 10px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
}

.task-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.header-left {
  width: 280px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.header-title {
  flex: 1;
  text-align: center;
  color: #111827;
  font-size: 20px;
  line-height: 1;
  font-weight: 600;
}

.header-right {
  width: 280px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid #d1d5db;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.chapter-name {
  color: #111827;
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
}

.chapter-select {
  width: 260px;
}

.chapter-select :deep(.relative > div:first-child) {
  height: 36px;
  border-radius: 10px;
}

.chapter-select :deep(.relative > div:first-child span) {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.task-body {
  min-height: 0;
  flex: 1;
  display: flex;
  gap: 10px;
}

.task-sidebar {
  width: 240px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 8px 0;
  overflow-y: auto;
}

.task-group {
  margin-bottom: 8px;
}

.task-group-title {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.task-group-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.task-group-arrow.expanded {
  transform: rotate(180deg);
}

.task-group-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.task-item {
  width: 100%;
  min-height: 36px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  border-right: 3px solid transparent;
  transition: background-color 0.2s ease;
}

.task-item:hover {
  background: #f9fafb;
}

.task-item.active {
  background: #e6f4ed;
  border-right-color: #4ed17a;
}

.task-status-pill {
  min-width: 56px;
  height: 24px;
  border-radius: 7px;
  font-size: 11px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  flex-shrink: 0;
}

.task-status-pill--pending {
  background: #ffe4ec;
  color: #ff5f8a;
}

.task-status-pill--done {
  background: #e8f8ee;
  color: #31b86f;
}

.task-status-pill--none {
  background: #eceff3;
  color: #98a2b3;
}

.task-item-name {
  flex: 1;
  color: #111827;
  font-size: 13px;
  line-height: 1.35;
}

.task-sidebar-skeleton {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-main {
  min-width: 0;
  flex: 1;
}

.task-main-card {
  height: 100%;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 14px;
}

.exercise-stepper {
  width: 100%;
  max-width: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}

.exercise-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
}

.exercise-step--active {
  color: #111827;
}

.exercise-step--done {
  color: #111827;
}

.exercise-step-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  color: #9ca3af;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.exercise-step--active .exercise-step-dot {
  border-color: #4fcb8f;
  background: #4fcb8f;
  color: #ffffff;
}

.exercise-step--done .exercise-step-dot {
  border-color: #4fcb8f;
  background: #ecfff4;
  color: #36c873;
  font-weight: 700;
}

.exercise-step-text {
  font-size: 22px;
  line-height: 1;
  font-weight: 500;
  white-space: nowrap;
}

.exercise-step-line {
  flex: 1;
  max-width: 240px;
  height: 1px;
  background: #d1d5db;
}

.exercise-step-line--active {
  background: #4fcb8f;
}

.task-main-skeleton {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.task-empty {
  color: #9ca3af;
  font-size: 14px;
  justify-content: center;
}

.task-submit-title {
  margin: 0;
  color: #111827;
  font-size: 18px;
  line-height: 1;
  font-weight: 600;
}

.task-submit-desc {
  margin: 12px 0 10px;
  color: #111827;
  font-size: 13px;
  line-height: 1.4;
}

.task-submit-desc--exercise {
  margin-top: 18px;
  margin-bottom: 14px;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 500;
}

.exercise-result-table {
  width: 100%;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.exercise-result-head,
.exercise-result-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1.2fr 1.2fr;
  align-items: center;
}

.exercise-result-head {
  height: 48px;
  background: #f3f4f6;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
}

.exercise-result-head > div,
.exercise-result-row > div {
  padding: 0 14px;
}

.exercise-result-row {
  min-height: 58px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
  font-size: 13px;
}

.exercise-result-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exercise-score-box {
  width: 110px;
  height: 32px;
  border-radius: 8px;
  background: #f8f1e5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.exercise-result-detail-btn {
  width: 92px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #cfd8e3;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.exercise-result-detail-btn:hover {
  border-color: #9bb0c9;
  color: #0f172a;
}

.exercise-preview-card {
  width: 236px;
  border-radius: 16px;
  border: 9px solid #e2e8f0;
  overflow: hidden;
  background: #f8fafc;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.exercise-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.exercise-preview-body {
  height: 182px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.exercise-scroll-icon {
  width: 76px;
  height: 96px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7b500 0%, #f2a900 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: -9px 9px 0 #f08c00;
}

.exercise-scroll-fold {
  position: absolute;
  left: -12px;
  top: 0;
  width: 12px;
  height: 20px;
  border-top-left-radius: 12px;
  background: #ec8e00;
}

.exercise-scroll-line {
  width: 30px;
  height: 4px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.45);
}

.exercise-pointer {
  position: absolute;
  right: 10px;
  bottom: -2px;
  width: 62px;
  height: 62px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.exercise-pointer-icon {
  position: relative;
  z-index: 2;
  font-size: 42px;
  line-height: 1;
  animation: pointerFloat 1.4s ease-in-out infinite;
}

.exercise-pointer-ripple {
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(79, 203, 143, 0.28);
  animation: pointerRipple 1.4s ease-out infinite;
}

.exercise-preview-name {
  height: 48px;
  background: #eef2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-preview-card {
  width: 200px;
  height: 184px;
  border-radius: 12px;
  border: 7px solid #dbe2ea;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.task-preview-icon {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  background: #4aa7ff;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.task-preview-name {
  max-width: 164px;
  text-align: center;
  color: #111827;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 600;
  word-break: break-all;
}

.task-submit-btn {
  margin-top: auto;
  width: 100px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(180deg, #62d86f 0%, #4fcb8f 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
}

.task-submit-btn--exercise {
  width: 128px;
  height: 38px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 18px;
  background: #ff9900;
}

.task-submit-btn--exercise:hover:not(:disabled) {
  background: #e68a00;
}

.exercise-action-row {
  margin-top: auto;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.task-submit-btn--detail {
  margin-bottom: 0;
  background: linear-gradient(180deg, #67df79 0%, #43cf72 100%);
}

.task-submit-btn--detail:hover:not(:disabled) {
  background: linear-gradient(180deg, #5cd46f 0%, #39c368 100%);
}

.task-submit-btn--next {
  margin-bottom: 0;
  background: #ffffff;
  color: #43cf72;
  border: 1px solid #9ae3b2;
}

.task-submit-btn--next:hover:not(:disabled) {
  background: #f4fff8;
}

.task-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes pointerFloat {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  40% {
    transform: translate(-3px, -3px) rotate(-3deg);
  }
  70% {
    transform: translate(1px, 1px) rotate(2deg);
  }
}

@keyframes pointerRipple {
  0% {
    transform: scale(0.65);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.2);
    opacity: 0.15;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .task-shell {
    margin: 10px;
    padding: 10px;
  }

  .header-left {
    width: 280px;
  }

  .header-right {
    width: 280px;
  }

  .header-title {
    font-size: 18px;
  }

  .chapter-name {
    font-size: 15px;
  }

  .chapter-select {
    width: 240px;
  }

  .chapter-select :deep(.relative > div:first-child span) {
    font-size: 15px;
  }

  .exercise-step-text {
    font-size: 20px;
  }

  .task-submit-desc--exercise {
    font-size: 20px;
  }

  .exercise-result-head,
  .exercise-result-row {
    grid-template-columns: 1.8fr 1.8fr 1fr 1.1fr 1.1fr;
  }

  .exercise-preview-card {
    width: 220px;
    border-width: 8px;
  }

  .exercise-preview-body {
    height: 168px;
  }

  .exercise-preview-name {
    height: 44px;
    font-size: 16px;
  }

  .task-submit-btn--exercise {
    width: 120px;
    height: 36px;
    font-size: 16px;
  }

  .exercise-action-row {
    gap: 10px;
  }
}

@media (max-width: 900px) {
  .task-body {
    flex-direction: column;
  }

  .task-sidebar {
    width: 100%;
    max-height: 280px;
  }

  .header-title {
    font-size: 17px;
  }

  .chapter-name {
    font-size: 13px;
  }

  .chapter-select {
    width: 200px;
  }

  .chapter-select :deep(.relative > div:first-child span) {
    font-size: 13px;
  }

  .task-submit-title {
    font-size: 17px;
  }

  .task-submit-desc {
    font-size: 13px;
  }

  .exercise-stepper {
    gap: 8px;
  }

  .exercise-step-dot {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }

  .exercise-step-text {
    font-size: 14px;
  }

  .task-submit-desc--exercise {
    margin-top: 14px;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .exercise-result-table {
    overflow-x: auto;
  }

  .exercise-result-head,
  .exercise-result-row {
    min-width: 760px;
  }

  .exercise-preview-card {
    width: 188px;
    border-width: 7px;
  }

  .exercise-preview-body {
    height: 140px;
  }

  .exercise-scroll-icon {
    width: 60px;
    height: 76px;
    gap: 5px;
    box-shadow: -6px 6px 0 #f08c00;
  }

  .exercise-scroll-fold {
    left: -10px;
    width: 10px;
    height: 18px;
  }

  .exercise-scroll-line {
    width: 24px;
    height: 3px;
  }

  .exercise-pointer {
    right: 8px;
    width: 48px;
    height: 48px;
  }

  .exercise-pointer-icon {
    font-size: 32px;
  }

  .exercise-pointer-ripple {
    width: 26px;
    height: 26px;
  }

  .exercise-preview-name {
    height: 40px;
    font-size: 14px;
  }

  .task-submit-btn--exercise {
    width: 108px;
    height: 34px;
    font-size: 15px;
  }

  .exercise-action-row {
    gap: 8px;
  }
}
</style>
