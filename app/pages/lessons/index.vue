<template>
  <div ref="lessonsPageRef" class="lessons-page" :style="pageAdaptiveStyle">
    <!-- 创建课程弹窗 -->
    <CreateCourseModal v-model="showCreateModal" @confirm="handleCreateCourseConfirm" />

    <!-- 设置可见班级弹窗 -->
    <ClassVisibilityModal
      v-model:visible="showClassModal"
      :course-id="selectedCourse?.courseId || ''"
      @confirm="handleClassConfirm"
    />

    <SetExamModal
      v-model:visible="showSetExamModal"
      :course-id="selectedCourse?.courseId || ''"
      :exercise-id="currentSetExamExerciseId"
      @submit="handleExamSubmit"
      @withdraw="handleExamWithdraw"
    />
    <ExerciseDetailModal
      v-model="showExerciseDetailModal"
      :exercise-id="currentExerciseId"
      detail-source="courseEvaluation"
    />
    <SelectGradingClassModal
      v-model:visible="showGradingClassModal"
      :loading="gradingClassLoading"
      :options="gradingClassOptions"
      @select="handleGradingClassSelect"
    />

    <div class="lessons-shell">
      <div class="lessons-breadcrumb">
        <div class="lessons-breadcrumb__inner">
          <NuxtLink to="/teacher" class="lessons-breadcrumb__link">{{
            $t("menu.home")
          }}</NuxtLink>
          <span class="lessons-breadcrumb__separator">/</span>
          <NuxtLink to="/system/course" class="lessons-breadcrumb__link">{{
            $t("course.myCourse")
          }}</NuxtLink>
          <span class="lessons-breadcrumb__separator">/</span>
          <span class="lessons-breadcrumb__current">{{ $t("prepare.title") }}</span>
        </div>
      </div>

      <div class="lessons-layout">
        <aside class="lessons-sidebar">
          <!-- <div class="lessons-sidebar__head">
            <p class="lessons-sidebar__eyebrow">课程管理</p>
            <h1 class="lessons-sidebar__title">我的课程</h1>
            <p class="lessons-sidebar__desc">按课程、章节与测评内容进行统一管理</p>
          </div> -->

          <div class="lessons-search">
            <MInput
              v-model="searchKeyword"
              class="lessons-search__input"
              :placeholder="$t('common.searchPlaceholder')"
              clearable
              @clear="clearSearch"
            >
              <template #prefix>
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </template>
            </MInput>

            <div
              v-if="searchKeyword && filteredCourses.length > 0"
              class="lessons-search__dropdown"
            >
              <button
                v-for="course in filteredCourses"
                :key="course.courseId"
                type="button"
                class="lessons-search__option"
                :class="{ 'is-active': selectedCourse?.courseId === course.courseId }"
                @click="selectSearchResult(course)"
              >
                {{ course.courseName }}
              </button>
            </div>
          </div>

          <div class="lessons-sidebar__tree">
            <MenuTreeItem
              v-for="menu in menuTree"
              :key="String(menu.menuId || menu.menuName)"
              :node="menu"
              :level="0"
              :expanded-menus="expandedMenus"
              :selected-course-id="selectedCourse?.courseId"
              variant="teacher2"
              @toggle="toggleMenu"
              @select="selectCourse"
            />
          </div>

          <div class="lessons-sidebar__footer">
            <button class="lessons-create-btn" @click="handleCreateCourse">
              <span class="lessons-create-btn__plus">+</span>
              <span>{{ $t("course.createCourse") }}</span>
            </button>
          </div>
        </aside>

        <main class="lessons-main">
          <section class="lessons-panel">
            <div class="lessons-panel__head">
              <div class="lessons-panel__copy">
                <!-- <p class="lessons-panel__eyebrow">课程备课</p> -->
                <h2 class="lessons-panel__title">
                  {{ selectedCourse?.courseName || $t("teacher.pleaseSelectCourse") }}
                </h2>
                <!-- <p class="lessons-panel__desc">{{ panelDescription }}</p> -->
              </div>

              <button class="lessons-panel__action" @click="handleSetVisibility">
                {{ $t("course.setVisibleClass") }}
              </button>
            </div>

            <div class="lessons-tabs">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                class="lessons-tabs__item"
                :class="{ 'is-active': activeTab === tab.value }"
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="lessons-panel__body">
              <template v-if="activeTab === 'chapters'">
                <div class="lessons-chapter-list">
                  <div
                    v-for="(chapter, index) in chapterList"
                    :key="chapter.chapterId"
                    class="lessons-chapter-item"
                  >
                    <div class="lessons-chapter-item__main">
                      <span class="lessons-chapter-item__index">{{
                        String(index + 1).padStart(2, "0")
                      }}</span>
                      <span class="lessons-chapter-item__name">{{
                        chapter.chapterName
                      }}</span>
                    </div>
                    <div class="lessons-chapter-actions">
                      <button
                        class="lessons-prepare-btn"
                        @click.stop="handlePrepare(chapter)"
                      >
                        {{
                          chapter.isPrepare === 1
                            ? $t("course.continuePrepare")
                            : $t("course.startPrepare")
                        }}
                      </button>
                    </div>
                  </div>

                  <div v-if="chapterList.length === 0" class="empty-state">
                    {{
                      selectedCourse
                        ? $t("common.noData")
                        : $t("teacher.pleaseSelectCourse")
                    }}
                  </div>
                </div>
              </template>

              <template v-else-if="activeTab === 'evaluation'">
                <div class="evaluation-list">
                  <div v-if="evaluationLoading" class="empty-state">加载中...</div>
                  <div v-else-if="evaluationLoadError" class="empty-state">
                    {{ evaluationLoadError }}
                  </div>
                  <div v-else-if="evaluationList.length === 0" class="empty-state">
                    暂无课程测评
                  </div>
                  <template v-else>
                    <div
                      v-for="item in evaluationList"
                      :key="item.exerciseId"
                      class="evaluation-item"
                    >
                      <div class="evaluation-item__main">
                        <div class="item-icon">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#7CB3F0"
                            stroke-width="1.5"
                          >
                            <path
                              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                          </svg>
                        </div>

                        <div class="item-copy">
                          <span class="item-name">{{ item.exerciseName }}</span>
                          <span
                            class="distribute-text"
                            :class="getEvaluationStatusClass(item.status)"
                          >
                            {{ getEvaluationStatusText(item.status) }}
                          </span>
                        </div>
                      </div>

                      <div class="hover-actions">
                        <button class="hover-btn" @click="handleViewQuestions(item)">
                          {{ $t("course.viewQuestions") }}
                        </button>
                        <button class="hover-btn" @click="handleSetExam(item)">
                          {{ $t("course.setExam") }}
                        </button>
                        <button
                          class="hover-btn"
                          :class="{ disabled: !canGradeEvaluation(item.status) }"
                          :disabled="!canGradeEvaluation(item.status)"
                          @click="canGradeEvaluation(item.status) && handleGrading(item)"
                        >
                          {{ $t("course.gradeExam") }}
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { cursorAdmin } from "~/composables/api/curosr";
import { useTeacher } from "~/composables/api/useTeacher";
import { ElMessage } from "element-plus";
import MenuTreeItem from "~/components/MenuTreeItem.vue";

definePageMeta({
  layout: "blank",
});

const { t } = useI18n();
const router = useRouter();
const {
  getCursorDetail,
  createCursor,
  startPrepare,
  getCourseEvaluationList,
  startDistribute,
  withdrawExam,
  setCourseEvaluationList,
} = cursorAdmin();
const { getCourseMenuTree } = useTeacher();

const showCreateModal = ref(false);
const showClassModal = ref(false);
const searchKeyword = ref("");

const activeTab = ref("chapters");
const tabs = computed(() => [
  { label: t("course.courseChapter"), value: "chapters" },
  { label: t("course.courseEvaluation"), value: "evaluation" },
]);

// 类型定义
interface MenuNode {
  menuId: string | number | null;
  menuName: string;
  courseList?: CourseItem[];
  children?: MenuNode[];
}

interface CourseItem {
  courseId: string;
  courseName: string;
}

interface ChapterItem {
  chapterId: number;
  chapterName: string;
  isPrepare?: number;
}

interface CourseEvaluationItem {
  courseId: number | string;
  exerciseId: string;
  exerciseName: string;
  status: number;
}

const menuTree = ref<MenuNode[]>([]);
const expandedMenus = ref<Set<string>>(new Set());
const selectedCourse = ref<CourseItem | null>(null);
const chapterList = ref<ChapterItem[]>([]);
const evaluationList = ref<CourseEvaluationItem[]>([]);
const evaluationLoading = ref(false);
const evaluationLoadError = ref("");
const showExerciseDetailModal = ref(false);
const currentExerciseId = ref<string | null>(null);
const showSetExamModal = ref(false);
const currentSetExamExerciseId = ref<string | null>(null);
const showGradingClassModal = ref(false);
const gradingClassLoading = ref(false);
const gradingClassOptions = ref<{ value: string; label: string }[]>([]);
const currentGradingExerciseId = ref<string | null>(null);
const lessonsPageRef = ref<HTMLElement | null>(null);
let lessonsPageResizeObserver: ResizeObserver | null = null;
const lessonsLayoutWidth = ref(1360);

const normalizeGradingClassOptions = (data: any) => {
  const classList = (Array.isArray(data) ? data : []).flatMap((item: any) => {
    if (Array.isArray(item?.classList)) {
      return item.classList;
    }
    return item ? [item] : [];
  });

  const seenClassIds = new Set<string>();

  return classList
    .filter((cls: any) => {
      if (cls?.status === null || cls?.status === undefined || cls?.status === "") {
        return true;
      }
      return Number(cls.status) === 1;
    })
    .map((cls: any) => {
      const classId = String(cls?.classId ?? cls?.id ?? "");
      const className = String(cls?.className ?? cls?.name ?? "");

      if (!classId || !className || seenClassIds.has(classId)) {
        return null;
      }

      seenClassIds.add(classId);
      return {
        value: classId,
        label: className,
      };
    })
    .filter((option): option is { value: string; label: string } => !!option);
};

// 递归提取所有课程
const allCourses = computed(() => {
  const courses: CourseItem[] = [];
  const extract = (node: MenuNode) => {
    if (node.courseList) courses.push(...node.courseList);
    if (node.children) node.children.forEach(extract);
  };
  menuTree.value.forEach(extract);
  return courses;
});

const filteredCourses = computed(() => {
  if (!searchKeyword.value.trim()) return [];
  const keyword = searchKeyword.value.toLowerCase();
  return allCourses.value.filter((c) => c.courseName.toLowerCase().includes(keyword));
});

const panelDescription = computed(() => {
  if (!selectedCourse.value) {
    return "从左侧课程目录中选择课程后，可查看章节备课与课程测评内容。";
  }

  if (activeTab.value === "chapters") {
    return "管理当前课程章节与备课进度，保持教学内容清晰可控。";
  }

  return "统一查看测评下发状态与批改入口，提升课程管理效率。";
});

const getLessonsLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = lessonsPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(
    (width) => width > 0
  );
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);

  return Math.max(1280, Math.round(boundedWidth));
};

const syncLessonsLayoutWidth = () => {
  lessonsLayoutWidth.value = getLessonsLayoutWidth();
};

const lessonsShellWidth = computed(() => {
  if (lessonsLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(lessonsLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(lessonsLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--lessons-shell-width": lessonsShellWidth.value,
}));

const toggleMenu = (menuKey: string) => {
  if (expandedMenus.value.has(menuKey)) {
    expandedMenus.value.delete(menuKey);
  } else {
    expandedMenus.value.add(menuKey);
  }
};

const parseMenuNode = (item: any): MenuNode => {
  const node: MenuNode = {
    menuId: item.menuId,
    menuName: item.menuName || t("course.unGrouped"),
    courseList: (item.courseList || []).map((c: any) => ({
      courseId: String(c.courseId),
      courseName: c.courseName,
    })),
  };
  if (item.children?.length) {
    node.children = item.children.map(parseMenuNode);
  }
  return node;
};

const findFirstCourse = (node: MenuNode): CourseItem | null => {
  if (node.courseList?.length) return node.courseList[0] || null;
  if (node.children) {
    for (const child of node.children) {
      const course = findFirstCourse(child);
      if (course) return course;
    }
  }
  return null;
};

const expandToFirstCourse = (node: MenuNode): boolean => {
  const key = String(node.menuId ?? node.menuName);
  if (node.courseList?.length) {
    expandedMenus.value.add(key);
    return true;
  }
  if (node.children) {
    for (const child of node.children) {
      if (expandToFirstCourse(child)) {
        expandedMenus.value.add(key);
        return true;
      }
    }
  }
  return false;
};

const loadMenuData = async () => {
  try {
    const data = await getCourseMenuTree();
    if (data?.length) {
      menuTree.value = data.map(parseMenuNode);

      for (const menu of menuTree.value) {
        if (expandToFirstCourse(menu)) {
          const firstCourse = findFirstCourse(menu);
          if (firstCourse) {
            selectedCourse.value = firstCourse;
            await loadCourseContent(firstCourse.courseId);
          }
          break;
        }
      }
    }
  } catch (error) {
    console.error("获取课程菜单失败:", error);
  }
};

const selectSearchResult = async (course: CourseItem) => {
  searchKeyword.value = "";
  selectedCourse.value = course;
  await loadCourseContent(course.courseId);
};

const clearSearch = () => {
  searchKeyword.value = "";
};

const selectCourse = async (course: CourseItem) => {
  selectedCourse.value = course;
  await loadCourseContent(course.courseId);
};

const loadChapters = async (courseId: string) => {
  try {
    const data = await getCursorDetail(courseId);
    chapterList.value = (data?.chapterList || []).map((item: any) => ({
      chapterId: item.chapterId,
      chapterName: item.chapterName,
      isPrepare: item.isPrepare || 0,
    }));
  } catch (error) {
    console.error("获取章节列表失败:", error);
    chapterList.value = [];
  }
};

const loadEvaluations = async (courseId: string) => {
  if (!courseId) {
    evaluationList.value = [];
    return;
  }

  evaluationLoading.value = true;
  evaluationLoadError.value = "";

  try {
    const data = await getCourseEvaluationList(courseId);
    evaluationList.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("获取课程测评列表失败:", error);
    evaluationLoadError.value = "加载课程测评列表失败";
    evaluationList.value = [];
  } finally {
    evaluationLoading.value = false;
  }
};

const loadCourseContent = async (courseId: string) => {
  await Promise.allSettled([loadChapters(courseId), loadEvaluations(courseId)]);
};

const handlePrepare = async (chapter: ChapterItem) => {
  if (!selectedCourse.value) return;

  if (chapter.isPrepare === 0) {
    try {
      await startPrepare(String(chapter.chapterId), selectedCourse.value.courseId);
      chapter.isPrepare = 1;
    } catch (error) {
      console.error("开始备课失败:", error);
      return;
    }
  }
  router.push(
    `/system/course/prepare/${selectedCourse.value.courseId}?chapterId=${chapter.chapterId}`
  );
};

const handleCreateCourse = () => {
  showCreateModal.value = true;
};

const handleCreateCourseConfirm = async (data: any) => {
  try {
    await createCursor({
      courseName: data.name,
      courseCoverUrl: data.coverUrl || "",
      courseDesc: data.description || "",
      coursePermission: data.permission === "public" ? 1 : 0,
      chapterList: data.chapters.map((c: any) => ({
        chapterName: c.name,
        delFlag: c.delFlag,
      })),
    });
    await loadMenuData();
  } catch (error) {
    console.error("创建课程失败:", error);
  }
};

const handleSetVisibility = () => {
  if (!selectedCourse.value) {
    ElMessage.warning(t("course.pleaseSelectCourseFirst"));
    return;
  }
  showClassModal.value = true;
};

const handleClassConfirm = (selectedIds: number[]) => {
  console.log("选中的班级:", selectedIds);
};

const getEvaluationStatusText = (status: number) => {
  if (status === 2) return "全部下发";
  if (status === 1) return "部分下发";
  return "未下发";
};

const getEvaluationStatusClass = (status: number) => {
  if (status === 2) return "sent";
  if (status === 1) return "partial";
  return "";
};

const canGradeEvaluation = (status: number) => status !== 0;

const handleViewQuestions = (item: CourseEvaluationItem) => {
  currentExerciseId.value = String(item.exerciseId || "");
  showExerciseDetailModal.value = !!currentExerciseId.value;
};

const handleSetExam = (item: CourseEvaluationItem) => {
  currentSetExamExerciseId.value = String(item.exerciseId || "");
  showSetExamModal.value = !!currentSetExamExerciseId.value;
};

const handleExamSubmit = async (data: any) => {
  try {
    await startDistribute(data);
    ElMessage.success("下发测评成功");
    showSetExamModal.value = false;
    if (selectedCourse.value?.courseId) {
      await loadEvaluations(selectedCourse.value.courseId);
    }
  } catch (error) {
    console.error("下发测评失败:", error);
    ElMessage.error("下发测评失败");
  }
};

const handleExamWithdraw = async (data: any) => {
  try {
    await withdrawExam(data);
    ElMessage.success("撤回测评成功");
    showSetExamModal.value = false;
    if (selectedCourse.value?.courseId) {
      await loadEvaluations(selectedCourse.value.courseId);
    }
  } catch (error) {
    console.error("撤回测评失败:", error);
    ElMessage.error("撤回测评失败");
  }
};

const handleGrading = async (item: CourseEvaluationItem) => {
  if (!selectedCourse.value?.courseId || !item?.exerciseId) return;

  currentGradingExerciseId.value = String(item.exerciseId);
  gradingClassLoading.value = true;
  gradingClassOptions.value = [];
  showGradingClassModal.value = true;

  try {
    const data = await setCourseEvaluationList({
      courseId: selectedCourse.value.courseId,
      exerciseId: String(item.exerciseId),
    });

    gradingClassOptions.value = normalizeGradingClassOptions(data);
  } catch (error) {
    console.error("加载批改班级失败:", error);
    gradingClassOptions.value = [];
    ElMessage.error("加载批改班级失败");
  } finally {
    gradingClassLoading.value = false;
  }
};

const handleGradingClassSelect = async (option: { value: string; label: string }) => {
  await router.push({
    path: "/taskmanagement",
    query: {
      tab: "assessment",
      classId: option.value,
      courseId: String(selectedCourse.value?.courseId || ""),
      exerciseId: String(currentGradingExerciseId.value || ""),
    },
  });
};

onMounted(() => {
  syncLessonsLayoutWidth();
  window.addEventListener("resize", syncLessonsLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncLessonsLayoutWidth);
  if (window.ResizeObserver && lessonsPageRef.value) {
    lessonsPageResizeObserver = new window.ResizeObserver(() => {
      syncLessonsLayoutWidth();
    });
    lessonsPageResizeObserver.observe(lessonsPageRef.value);
  }
  loadMenuData();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncLessonsLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncLessonsLayoutWidth);
  lessonsPageResizeObserver?.disconnect();
  lessonsPageResizeObserver = null;
});
</script>

<style scoped>
.lessons-page {
  --lessons-min-width: 1280px;
  --lessons-max-width: 1920px;
  --lessons-shell-width: var(--lessons-min-width);
  --lessons-grid-gap: clamp(20px, 1.45vw, 28px);
  --lessons-card-height: calc(100vh - 132px);
  height: 100vh;
  min-width: var(--lessons-min-width);
  overflow-x: auto;
  overflow-y: auto;
  background: radial-gradient(
      circle at top left,
      rgba(164, 193, 255, 0.16),
      transparent 32%
    ),
    linear-gradient(180deg, #f8f9fa 0%, #f4f8ff 100%);
  color: #2e3335;
  font-family: "Manrope", "PingFang SC", sans-serif;
  -webkit-font-smoothing: antialiased;
}

.lessons-page::-webkit-scrollbar,
.lessons-sidebar__tree::-webkit-scrollbar,
.lessons-panel__body::-webkit-scrollbar,
.lessons-search__dropdown::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.lessons-page::-webkit-scrollbar-track,
.lessons-sidebar__tree::-webkit-scrollbar-track,
.lessons-panel__body::-webkit-scrollbar-track,
.lessons-search__dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.lessons-page::-webkit-scrollbar-thumb,
.lessons-sidebar__tree::-webkit-scrollbar-thumb,
.lessons-panel__body::-webkit-scrollbar-thumb,
.lessons-search__dropdown::-webkit-scrollbar-thumb {
  background-color: rgba(174, 179, 181, 0.3);
  border-radius: 999px;
}

.lessons-shell {
  width: min(
    var(--lessons-max-width),
    max(var(--lessons-min-width), var(--lessons-shell-width))
  );
  min-width: var(--lessons-min-width);
  min-height: 100vh;
  margin: 0 auto;
}

.lessons-layout {
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  gap: var(--lessons-grid-gap);
  align-items: start;
  padding: 0 clamp(18px, 1.5vw, 24px) 36px;
}

.lessons-sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  height: var(--lessons-card-height);
  max-height: var(--lessons-card-height);
  padding: 18px;
  border: 1px solid rgba(174, 179, 181, 0.2);
  border-radius: 28px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(244, 248, 255, 0.98) 100%
  );
  box-shadow: 0 16px 36px rgba(46, 51, 53, 0.06);
}

.lessons-sidebar__head {
  padding: 6px 6px 18px;
}

.lessons-sidebar__eyebrow,
.lessons-panel__eyebrow {
  margin: 0 0 8px;
  color: #005bc2;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.lessons-sidebar__title {
  margin: 0;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
}

.lessons-sidebar__desc {
  margin: 10px 0 0;
  color: #5a6062;
  font-size: 14px;
  line-height: 1.6;
}

.lessons-search {
  position: relative;
  margin-bottom: 18px;
}

.lessons-search__input :deep(input) {
  min-height: 46px;
  border: 1px solid rgba(174, 179, 181, 0.26) !important;
  border-radius: 16px !important;
  background: #ffffff !important;
  color: #2e3335 !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.lessons-search__input :deep(input:focus) {
  border-color: rgba(0, 91, 194, 0.36) !important;
  box-shadow: 0 0 0 4px rgba(0, 91, 194, 0.08) !important;
}

.lessons-search__input :deep(.absolute.left-3),
.lessons-search__input :deep(.absolute.right-3) {
  color: #8d9496;
}

.lessons-search__dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  padding: 10px;
  overflow-y: auto;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 18px 36px rgba(12, 15, 16, 0.08);
}

.lessons-search__option {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #5a6062;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  transition: background-color 0.2s ease, color 0.2s ease;
  cursor: pointer;
}

.lessons-search__option:hover,
.lessons-search__option.is-active {
  background: rgba(0, 91, 194, 0.08);
  color: #005bc2;
}

.lessons-sidebar__tree {
  flex: 1;
  min-height: 0;
  padding-right: 4px;
  overflow-y: auto;
}

.lessons-sidebar__footer {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid rgba(174, 179, 181, 0.14);
}

.lessons-create-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #005bc2 0%, #0050ab 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 16px 32px rgba(0, 91, 194, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.lessons-create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 36px rgba(0, 91, 194, 0.24);
}

.lessons-create-btn__plus {
  font-size: 18px;
  line-height: 1;
}

.lessons-main {
  display: flex;
  min-height: 0;
  min-width: 0;
  height: var(--lessons-card-height);
  max-height: var(--lessons-card-height);
}

.lessons-breadcrumb {
  width: 100vw;
  min-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-bottom: 20px;
  border-top: 1px solid rgba(174, 179, 181, 0.18);
  border-bottom: 1px solid rgba(174, 179, 181, 0.18);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 10px 28px rgba(46, 51, 53, 0.04);
}

.lessons-breadcrumb__inner {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(
    var(--lessons-max-width),
    max(var(--lessons-min-width), var(--lessons-shell-width))
  );
  min-width: var(--lessons-min-width);
  min-height: 56px;
  padding: 0 clamp(18px, 1.5vw, 24px);
  box-sizing: border-box;
  margin: 0 auto;
}

.lessons-breadcrumb__link {
  color: #5a6062;
  font-size: 14px;
  font-weight: 600;
  transition: color 0.2s ease;
}

.lessons-breadcrumb__link:hover {
  color: #005bc2;
}

.lessons-breadcrumb__separator {
  color: #aeb3b5;
  font-size: 13px;
}

.lessons-breadcrumb__current {
  color: #2e3335;
  font-size: 14px;
  font-weight: 700;
}

.lessons-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 36px rgba(46, 51, 53, 0.06);
  overflow: hidden;
}

.lessons-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 32px 22px;
}

.lessons-panel__copy {
  min-width: 0;
}

.lessons-panel__title {
  margin: 0;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: clamp(24px, 1.5vw, 30px);
  font-weight: 800;
  line-height: 1.16;
  font-size: 21px;
}

.lessons-panel__desc {
  margin: 10px 0 0;
  color: #5a6062;
  font-size: 15px;
  line-height: 1.7;
}

.lessons-panel__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid rgba(0, 91, 194, 0.18);
  border-radius: 14px;
  background: #ffffff;
  color: #005bc2;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.lessons-panel__action:hover {
  background: rgba(0, 91, 194, 0.05);
  border-color: rgba(0, 91, 194, 0.24);
  transform: translateY(-1px);
}

.lessons-tabs {
  display: flex;
  gap: 12px;
  padding: 0 32px 24px;
  border-bottom: 1px solid rgba(174, 179, 181, 0.14);
}

.lessons-tabs__item {
  min-height: 44px;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: 14px;
  background: #f2f4f5;
  color: #5a6062;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
  cursor: pointer;
}

.lessons-tabs__item:hover {
  background: #e8edf4;
  color: #2e3335;
}

.lessons-tabs__item.is-active {
  background: #005bc2;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(0, 91, 194, 0.2);
}

.lessons-panel__body {
  flex: 1;
  min-height: 0;
  padding: 28px 32px 32px;
  overflow-x: hidden;
  overflow-y: auto;
}

.lessons-chapter-list,
.evaluation-list {
  min-height: 100%;
}

.lessons-chapter-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  /* min-height: 72px; */
  padding: 6px 20px;
  border: 1px solid rgba(174, 179, 181, 0.14);
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.lessons-chapter-item + .lessons-chapter-item,
.evaluation-item + .evaluation-item {
  margin-top: 16px;
}

.lessons-chapter-item:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 91, 194, 0.18);
  box-shadow: 0 14px 28px rgba(46, 51, 53, 0.05);
}

.lessons-chapter-item__main {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.lessons-chapter-item__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(0, 91, 194, 0.08);
  color: #005bc2;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.lessons-chapter-item__name {
  min-width: 0;
  color: #2e3335;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
}

.lessons-chapter-actions {
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.lessons-chapter-item:hover .lessons-chapter-actions,
.lessons-chapter-item:focus-within .lessons-chapter-actions {
  opacity: 1;
  transform: translateY(0);
}

.lessons-prepare-btn {
  min-height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(0, 91, 194, 0.2);
  background: #ffffff;
  color: #005bc2;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.lessons-prepare-btn:hover {
  background: rgba(0, 91, 194, 0.06);
  border-color: rgba(0, 91, 194, 0.32);
}

.evaluation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px 24px;
  padding: 20px 22px;
  border: 1px solid rgba(174, 179, 181, 0.14);
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  transition: all 0.2s ease;
}

.evaluation-item:hover {
  border-color: rgba(0, 91, 194, 0.18);
  box-shadow: 0 14px 28px rgba(46, 51, 53, 0.05);
}

.evaluation-item__main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.item-icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 16px;
  background: rgba(0, 91, 194, 0.08);
}

.item-copy {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
}

.item-name {
  color: #2e3335;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  word-break: break-word;
}

.distribute-text {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.distribute-text.sent {
  background: rgba(34, 197, 94, 0.14);
  color: #15803d;
}

.distribute-text.partial {
  background: rgba(249, 115, 22, 0.14);
  color: #c2410c;
}

.hover-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-left: auto;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.evaluation-item:hover .hover-actions,
.evaluation-item:focus-within .hover-actions {
  opacity: 1;
  transform: translateY(0);
}

.hover-btn {
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid rgba(0, 91, 194, 0.18);
  border-radius: 999px;
  background: #ffffff;
  color: #005bc2;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.hover-btn:hover {
  background: rgba(0, 91, 194, 0.06);
  border-color: rgba(0, 91, 194, 0.32);
  transform: translateY(-1px);
}

.hover-btn.disabled {
  border-color: rgba(174, 179, 181, 0.24);
  color: #aeb3b5;
  cursor: not-allowed;
}

.hover-btn.disabled:hover {
  background: #ffffff;
  transform: none;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 32px;
  border: 1px dashed rgba(174, 179, 181, 0.3);
  border-radius: 24px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.88) 0%,
    rgba(244, 248, 255, 0.98) 100%
  );
  text-align: center;
  color: #767c7e;
  font-size: 14px;
  font-weight: 600;
}

@media (max-width: 1500px) {
  .lessons-panel__head {
    padding: 24px 26px 20px;
  }

  .lessons-tabs {
    padding: 0 26px 20px;
  }

  .lessons-panel__body {
    padding: 24px 26px 28px;
  }
}
</style>
