<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
        <div
          class="relative bg-white rounded-lg w-[1000px] max-h-[85vh] flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-center justify-center py-4 border-b relative">
            <h3 class="text-lg font-medium">{{ $t("linkCourse.title") }}</h3>
            <button
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              @click="handleClose"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-hidden p-6">
            <div class="flex gap-8 h-[520px]">
              <!-- Left: Course Selection -->
              <div class="flex-1 flex flex-col">
                <div class="text-sm text-gray-500 mb-4 text-center">
                  {{ $t("linkCourse.selectHint") }}
                </div>

                <!-- Course Type Tabs -->
                <div class="flex gap-3 mb-4">
                  <button
                    v-for="type in courseTypes"
                    :key="type.value"
                    class="px-5 py-1.5 text-sm rounded-full transition-colors"
                    :class="
                      selectedCourseType === type.value
                        ? 'bg-[#FF9900] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    "
                    @click="selectedCourseType = type.value"
                  >
                    {{ type.label }}
                  </button>
                </div>

                <!-- Sub Tabs with Second Level - Only for official courses -->
                <div v-if="selectedCourseType === 'official'" class="mb-4" @mouseleave="hoveredTab = ''">
                  <!-- First Level Tabs -->
                  <div class="flex gap-6 mb-3">
                    <div
                      v-for="tab in subTabs"
                      :key="tab.value"
                      class="relative"
                      @mouseenter="hoveredTab = tab.value"
                    >
                      <button
                        class="pb-2 text-sm transition-colors relative"
                        :class="[
                          selectedSubTab === tab.value && !selectedSubTab2
                            ? 'text-[#FF9900]'
                            : hoveredTab === tab.value
                              ? 'text-[#FF9900]'
                              : 'text-gray-500 hover:text-gray-700',
                        ]"
                        @click="selectFirstLevel(tab.value)"
                      >
                        {{ tab.label }}
                        <div
                          v-if="
                            selectedSubTab === tab.value && !selectedSubTab2
                          "
                          class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9900]"
                        ></div>
                      </button>
                    </div>
                  </div>
                  <!-- Second Level Tabs - Show only on hover -->
                  <div
                    v-if="displaySecondLevelTabs.length > 0"
                    class="flex gap-6"
                  >
                    <button
                      v-for="child in displaySecondLevelTabs"
                      :key="child.value"
                      class="pb-2 text-sm transition-colors relative"
                      :class="
                        selectedSubTab2 === child.value
                          ? 'text-[#FF9900]'
                          : 'text-gray-500 hover:text-gray-700'
                      "
                      @click="selectSecondLevel(child.value)"
                    >
                      {{ child.label }}
                      <div
                        v-if="selectedSubTab2 === child.value"
                        class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9900]"
                      ></div>
                    </button>
                  </div>
                </div>

                <!-- Search -->
                <div class="relative mb-4">
                  <input
                    v-model="leftSearchKeyword"
                    type="text"
                    :placeholder="$t('linkCourse.searchPlaceholder')"
                    class="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF9900] bg-white"
                  />
                  <svg
                    class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>

                <!-- Course Tree -->
                <div
                  class="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white"
                >
                  <div
                    v-for="course in filteredCourses"
                    :key="course.id"
                    class="border-b border-gray-100 last:border-b-0"
                  >
                    <!-- Course Header -->
                    <div
                      class="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      @click="toggleCourseExpand(course.id)"
                    >
                      <svg
                        class="w-4 h-4 mr-2 text-gray-400 transition-transform shrink-0"
                        :class="
                          expandedCourses.includes(course.id)
                            ? ''
                            : '-rotate-90'
                        "
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                      <div
                        class="w-4 h-4 mr-3 rounded border flex items-center justify-center shrink-0 transition-colors"
                        :class="getCourseCheckClass(course.id)"
                        @click.stop="!isCourseFullyLinked(course.id) && toggleCourse(course)"
                      >
                        <svg
                          v-if="getCourseCheckState(course.id) === 'full' || isCourseFullyLinked(course.id)"
                          class="w-3 h-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <div
                          v-else-if="getCourseCheckState(course.id) === 'partial' || isCoursePartiallyLinked(course.id)"
                          class="w-2 h-0.5 bg-white"
                        ></div>
                      </div>
                      <span 
                        class="text-sm"
                        :class="isCourseFullyLinked(course.id) ? 'text-gray-400' : 'text-gray-700'"
                      >{{ course.name }}</span>
                    </div>
                    <!-- Chapters -->
                    <div v-if="expandedCourses.includes(course.id)">
                      <div
                        v-for="chapter in course.chapters"
                        :key="chapter.id"
                        class="flex items-center pl-12 pr-4 py-2.5 hover:bg-gray-50"
                        :class="isChapterLinked(chapter.id) ? 'cursor-not-allowed' : 'cursor-pointer'"
                        @click="!isChapterLinked(chapter.id) && toggleChapter(chapter)"
                      >
                        <div
                          class="w-4 h-4 mr-3 rounded border flex items-center justify-center shrink-0 transition-colors"
                          :class="[
                            isChapterLinked(chapter.id)
                              ? 'bg-gray-300 border-gray-300 cursor-not-allowed'
                              : isChapterSelected(chapter.id)
                                ? 'bg-[#FF9900] border-[#FF9900] cursor-pointer hover:border-[#FF9900]'
                                : 'border-gray-300 cursor-pointer hover:border-[#FF9900]'
                          ]"
                        >
                          <svg
                            v-if="isChapterLinked(chapter.id) || isChapterSelected(chapter.id)"
                            class="w-3 h-3 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                        <span 
                          class="text-sm"
                          :class="isChapterLinked(chapter.id) ? 'text-gray-400' : 'text-gray-600'"
                        >{{ chapter.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Link Button -->
                <div class="flex justify-center mt-4">
                  <button
                    class="px-10 py-2 rounded-lg transition-colors text-sm"
                    :class="selectedChapters.length > 0 
                      ? 'border border-[#FF9900] text-[#FF9900] hover:bg-[#FFF7E6]' 
                      : 'border border-gray-300 text-gray-400 cursor-not-allowed'"
                    :disabled="selectedChapters.length === 0"
                    @click="handleLink"
                  >
                    {{ $t("linkCourse.goLink") }}
                  </button>
                </div>
              </div>

              <!-- Right: Linked Courses -->
              <div class="flex-1 flex flex-col">
                <div class="text-sm text-gray-500 mb-4 text-center">
                  {{ $t("linkCourse.linkedHint") }}
                </div>

                <!-- Search -->
                <div class="relative mb-4 mt-[52px]">
                  <input
                    v-model="rightSearchKeyword"
                    type="text"
                    :placeholder="$t('linkCourse.searchPlaceholder')"
                    class="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF9900] bg-white"
                  />
                  <svg
                    class="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </div>

                <!-- Linked List -->
                <div
                  class="flex-1 overflow-auto border border-gray-200 rounded-lg bg-white"
                >
                  <div
                    v-if="groupedLinkedCourses.length === 0"
                    class="h-full flex flex-col items-center justify-center text-gray-400 py-16"
                  >
                    <div
                      class="w-24 h-24 mb-4 rounded-full bg-gray-50 flex items-center justify-center"
                    >
                      <svg
                        class="w-12 h-12 text-gray-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                      >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="12" cy="11" r="3" />
                        <path d="M7 20c0-2.5 2.5-4 5-4s5 1.5 5 4" />
                        <circle cx="18" cy="8" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <p class="text-sm text-gray-400">
                      {{ $t("linkCourse.noLinked") }}
                    </p>
                    <p class="text-sm text-gray-400">
                      {{ $t("linkCourse.noLinkedTip") }}
                    </p>
                  </div>
                  <div v-else>
                    <div
                      v-for="group in filteredGroupedLinkedCourses"
                      :key="group.courseId"
                      class="border-b border-gray-100 last:border-b-0"
                    >
                      <!-- Course Header -->
                      <div 
                        class="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                        @click="toggleLinkedCourseExpand(group.courseId)"
                      >
                        <svg 
                          class="w-4 h-4 mr-2 text-gray-400 transition-transform shrink-0"
                          :class="expandedLinkedCourses.includes(group.courseId) ? '' : '-rotate-90'"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        >
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                        <div 
                          class="w-4 h-4 mr-3 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:border-[#FF9900]"
                          :class="getLinkedCourseCheckState(group.courseId) === 'full' ? 'bg-[#FF9900] border-[#FF9900]' : getLinkedCourseCheckState(group.courseId) === 'partial' ? 'bg-[#FF9900] border-[#FF9900]' : 'border-gray-300'"
                          @click.stop="toggleLinkedCourse(group.courseId)"
                        >
                          <svg v-if="getLinkedCourseCheckState(group.courseId) === 'full'" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                          <div v-else-if="getLinkedCourseCheckState(group.courseId) === 'partial'" class="w-2 h-0.5 bg-white"></div>
                        </div>
                        <span class="text-sm text-gray-700">{{ group.courseName }}</span>
                      </div>
                      <!-- Chapters -->
                      <div v-if="expandedLinkedCourses.includes(group.courseId)">
                        <div 
                          v-for="chapter in group.chapters" 
                          :key="chapter.id"
                          class="flex items-center pl-12 pr-4 py-2.5 hover:bg-gray-50"
                        >
                          <div 
                            class="w-4 h-4 mr-3 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:border-[#FF9900]"
                            :class="selectedLinkedChapters.includes(chapter.id) ? 'bg-[#FF9900] border-[#FF9900]' : 'border-gray-300'"
                            @click="toggleLinkedChapter(chapter.id)"
                          >
                            <svg v-if="selectedLinkedChapters.includes(chapter.id)" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          </div>
                          <span class="text-sm text-gray-600">{{ chapter.name }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Unlink Button -->
                <div class="flex justify-center mt-4">
                  <button
                    class="px-10 py-2 rounded-lg transition-colors text-sm"
                    :class="selectedLinkedChapters.length > 0 
                      ? 'border border-[#FF9900] text-[#FF9900] hover:bg-[#FFF7E6]' 
                      : 'border border-gray-300 text-gray-400 cursor-not-allowed'"
                    :disabled="selectedLinkedChapters.length === 0"
                    @click="handleUnlink"
                  >
                    {{ $t("linkCourse.cancelLink") }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { taskmanagementcenterApi } from "~/composables/api/taskmanagement";


interface Chapter {
  id: number;
  name: string;
  courseId: number;
  courseName?: string;
}

interface Course {
  id: number;
  name: string;
  chapters: Chapter[];
  courseType: string; // official | custom
  category: string; // normal | club | custom | dual | demo | crealand
  subCategory?: string; // example | external | research | other | video | doc
}

// API 返回的菜单树结构
interface MenuTreeItem {
  menuId: number | null;
  parentId: number | null;
  menuName: string;
  sortOrder: number | null;
  menuLevel: number | null;
  isVisible: number | null;
  children?: MenuTreeItem[];
}

const props = defineProps<{
  visible: boolean;
  exerciseId?: string;
  initialLinked?: number[];
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();

const { t } = useI18n();
const api = taskmanagementcenterApi();


// 菜单树数据（从 API 获取）
const menuTree = ref<MenuTreeItem[]>([]);
const menuLoading = ref(false);

// 自定义课程数据
const customCourses = ref<Course[]>([]);
const customCoursesLoading = ref(false);

// Course type tabs
const courseTypes = computed(() => [
  { value: "official", label: t("linkCourse.officialCourse") },
  { value: "custom", label: t("linkCourse.customCourse") },
]);

// Sub tabs - 从 API 数据动态生成（过滤掉没有 menuId 的项）
const subTabs = computed(() => {
  return menuTree.value
    .filter(item => item.menuId !== null)
    .map(item => ({
      value: String(item.menuId),
      label: item.menuName,
      children: item.children?.filter(child => child.menuId !== null).map(child => ({
        value: String(child.menuId),
        label: child.menuName
      })) || []
    }));
});

const selectedSubTab2 = ref("");
const hoveredTab = ref("");

// Display second level tabs only on hover
const displaySecondLevelTabs = computed(() => {
  if (hoveredTab.value) {
    const tab = subTabs.value.find((t) => t.value === hoveredTab.value);
    return tab?.children || [];
  }
  return [];
});

// Select first level tab (clears second level)
const selectFirstLevel = (tabValue: string) => {
  selectedSubTab.value = tabValue;
  selectedSubTab2.value = "";
  // 加载该菜单下的课程
  loadOfficialCourses(Number(tabValue));
};

// Select second level tab
const selectSecondLevel = (childValue: string) => {
  // Find which parent tab this child belongs to
  for (const tab of subTabs.value) {
    const child = tab.children?.find((c) => c.value === childValue);
    if (child) {
      selectedSubTab.value = tab.value;
      selectedSubTab2.value = childValue;
      // 加载该二级菜单下的课程
      loadOfficialCourses(Number(childValue));
      break;
    }
  }
};

const selectedCourseType = ref("official");
const selectedSubTab = ref("");
const leftSearchKeyword = ref("");
const rightSearchKeyword = ref("");
const expandedCourses = ref<number[]>([]);
const selectedChapters = ref<number[]>([]);
const linkedChapters = ref<Chapter[]>([]);
const initialLinkedIds = ref<number[]>([]);
const expandedLinkedCourses = ref<number[]>([]);
const selectedLinkedChapters = ref<number[]>([]);

// 课程数据（官方课程）
const courses = ref<Course[]>([]);
const coursesLoading = ref(false);
// 记录已加载章节的课程ID
const loadedChapterCourseIds = ref<number[]>([]);

// 加载官方课程列表（根据menuId）- 不包含章节
const loadOfficialCourses = async (menuId: number) => {
  coursesLoading.value = true;
  try {
    const data = await api.getCursorList({ menuId });
    // 转换 API 数据为 Course 格式（章节初始为空）
    courses.value = (data || []).map((item: any) => ({
      id: item.courseId,
      name: item.courseName,
      courseType: 'official',
      category: String(menuId),
      chapters: [] // 章节需要点击展开时加载
    }));
    // 清空已加载章节记录
    loadedChapterCourseIds.value = [];
  } catch (error) {
    console.error("获取官方课程列表失败:", error);
  } finally {
    coursesLoading.value = false;
  }
};

// 加载课程章节列表
const loadChapterList = async (courseId: number) => {
  // 如果已经加载过，不重复加载
  if (loadedChapterCourseIds.value.includes(courseId)) return;
  
  try {
    const data = await api.getChapterList({ courseId });
    const chapters = (data || []).map((ch: any) => ({
      id: ch.chapterId,
      name: ch.chapterName,
      courseId: courseId
    }));
    
    // 更新对应课程的章节（官方课程）
    const course = courses.value.find(c => c.id === courseId);
    if (course) {
      course.chapters = chapters;
    }
    // 更新自定义课程的章节
    const customCourse = customCourses.value.find(c => c.id === courseId);
    if (customCourse) {
      customCourse.chapters = chapters;
    }
    
    loadedChapterCourseIds.value.push(courseId);
  } catch (error) {
    console.error("获取章节列表失败:", error);
  }
};

// 加载自定义课程列表
const loadCustomCourses = async () => {
  customCoursesLoading.value = true;
  try {
    const data = await api.getCursorList({ courseType: 1 });
    // 转换 API 数据为 Course 格式（章节初始为空）
    customCourses.value = (data || []).map((item: any) => ({
      id: item.courseId,
      name: item.courseName,
      courseType: 'custom',
      category: '',
      chapters: [] // 章节需要点击展开时加载
    }));
  } catch (error) {
    console.error("获取自定义课程列表失败:", error);
  } finally {
    customCoursesLoading.value = false;
  }
};

// 加载菜单树数据
const loadMenuTree = async () => {
  menuLoading.value = true;
  try {
    const data = await api.getExerciseCourseMenuTree();
    menuTree.value = data || [];
    // 默认选中第一个有 menuId 的一级菜单
    const firstValidMenu = menuTree.value.find(item => item.menuId !== null);
    if (firstValidMenu) {
      selectedSubTab.value = String(firstValidMenu.menuId);
      // 加载第一个菜单的课程列表
      loadOfficialCourses(firstValidMenu.menuId!);
    }
  } catch (error) {
    console.error("获取课程菜单树失败:", error);
    ElMessage.error("获取课程菜单树失败");
  } finally {
    menuLoading.value = false;
  }
};

// 加载已关联的课程章节
const loadLinkedChapters = async () => {
  if (!props.exerciseId) return;
  
  try {
    const data = await api.getExercisebind(props.exerciseId);
    // API 返回的是课程列表，每个课程包含 chapterList
    const chapters: Chapter[] = [];
    (data || []).forEach((course: any) => {
      (course.chapterList || []).forEach((ch: any) => {
        chapters.push({
          id: ch.chapterId,
          name: ch.chapterName,
          courseId: course.courseId,
          courseName: course.courseName
        });
      });
    });
    linkedChapters.value = chapters;
    
    // 自动展开已关联的课程
    const courseIds = [...new Set(linkedChapters.value.map(c => c.courseId))];
    expandedLinkedCourses.value = courseIds;
  } catch (error) {
    console.error("获取已关联课程章节失败:", error);
  }
};

// Watch visible to init
watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      linkedChapters.value = [];
      selectedChapters.value = [];
      selectedLinkedChapters.value = [];
      expandedLinkedCourses.value = [];
      
      // 加载已关联的课程章节
      await loadLinkedChapters();
      
      // 加载菜单树
      loadMenuTree();
    }
  },
);

// Watch course type change
watch(
  () => selectedCourseType.value,
  (newVal) => {
    // 切换到自定义课程时加载自定义课程列表
    if (newVal === 'custom' && customCourses.value.length === 0) {
      loadCustomCourses();
    }
  }
);

const findChapterById = (id: number): Chapter | null => {
  // 先从官方课程中查找
  for (const course of courses.value) {
    const chapter = course.chapters.find((c) => c.id === id);
    if (chapter) {
      return { ...chapter, courseName: course.name };
    }
  }
  // 再从自定义课程中查找
  for (const course of customCourses.value) {
    const chapter = course.chapters.find((c) => c.id === id);
    if (chapter) {
      return { ...chapter, courseName: course.name };
    }
  }
  return null;
};

const filteredCourses = computed(() => {
  // 自定义课程使用 customCourses
  if (selectedCourseType.value === 'custom') {
    let result = customCourses.value;
    // Filter by search keyword (搜索课程名称和已加载的章节名称)
    if (leftSearchKeyword.value) {
      const keyword = leftSearchKeyword.value.toLowerCase();
      result = result.filter(course => {
        const courseNameMatch = course.name.toLowerCase().includes(keyword);
        const chapterMatch = course.chapters.some(c => 
          c.name.toLowerCase().includes(keyword)
        );
        return courseNameMatch || chapterMatch;
      });
    }
    return result;
  }
  
  // 官方课程使用 courses（已经根据 menuId 加载了对应课程）
  let result = courses.value;
  
  // Filter by search keyword (搜索课程名称和已加载的章节名称)
  if (leftSearchKeyword.value) {
    const keyword = leftSearchKeyword.value.toLowerCase();
    result = result.filter(course => {
      const courseNameMatch = course.name.toLowerCase().includes(keyword);
      const chapterMatch = course.chapters.some(c => 
        c.name.toLowerCase().includes(keyword)
      );
      return courseNameMatch || chapterMatch;
    });
  }
  
  return result;
});

// Auto expand first course when filtered courses change
watch(filteredCourses, async (newCourses) => {
  if (newCourses && newCourses.length > 0 && newCourses[0]) {
    const firstCourseId = newCourses[0].id;
    expandedCourses.value = [firstCourseId];
    // 自动加载第一个课程的章节
    await loadChapterList(firstCourseId);
  } else {
    expandedCourses.value = [];
  }
});

const filteredLinkedChapters = computed(() => {
  if (!rightSearchKeyword.value) return linkedChapters.value;
  const keyword = rightSearchKeyword.value.toLowerCase();
  return linkedChapters.value.filter(
    (c) =>
      c.name.toLowerCase().includes(keyword) ||
      (c.courseName && c.courseName.toLowerCase().includes(keyword)),
  );
});

// Group linked chapters by course
interface LinkedCourseGroup {
  courseId: number;
  courseName: string;
  chapters: Chapter[];
}

const groupedLinkedCourses = computed<LinkedCourseGroup[]>(() => {
  const groups: Map<number, LinkedCourseGroup> = new Map();
  
  linkedChapters.value.forEach(chapter => {
    const courseId = chapter.courseId;
    const courseName = chapter.courseName || '';
    
    if (!groups.has(courseId)) {
      groups.set(courseId, {
        courseId,
        courseName,
        chapters: []
      });
    }
    groups.get(courseId)!.chapters.push(chapter);
  });
  
  return Array.from(groups.values());
});

const filteredGroupedLinkedCourses = computed(() => {
  if (!rightSearchKeyword.value) return groupedLinkedCourses.value;
  const keyword = rightSearchKeyword.value.toLowerCase();
  
  return groupedLinkedCourses.value.filter(group => {
    const courseNameMatch = group.courseName.toLowerCase().includes(keyword);
    const chapterMatch = group.chapters.some(c => 
      c.name.toLowerCase().includes(keyword)
    );
    return courseNameMatch || chapterMatch;
  });
});

// Toggle linked course expand
const toggleLinkedCourseExpand = (courseId: number) => {
  const index = expandedLinkedCourses.value.indexOf(courseId);
  if (index > -1) {
    expandedLinkedCourses.value.splice(index, 1);
  } else {
    expandedLinkedCourses.value.push(courseId);
  }
};

// Get linked course check state
const getLinkedCourseCheckState = (courseId: number): 'none' | 'partial' | 'full' => {
  const group = groupedLinkedCourses.value.find(g => g.courseId === courseId);
  if (!group) return 'none';
  
  const chapterIds = group.chapters.map(c => c.id);
  const selectedCount = chapterIds.filter(id => selectedLinkedChapters.value.includes(id)).length;
  
  if (selectedCount === 0) return 'none';
  if (selectedCount === chapterIds.length) return 'full';
  return 'partial';
};

// Toggle linked course selection
const toggleLinkedCourse = (courseId: number) => {
  const group = groupedLinkedCourses.value.find(g => g.courseId === courseId);
  if (!group) return;
  
  const state = getLinkedCourseCheckState(courseId);
  const chapterIds = group.chapters.map(c => c.id);
  
  if (state !== 'none') {
    selectedLinkedChapters.value = selectedLinkedChapters.value.filter(id => !chapterIds.includes(id));
  } else {
    chapterIds.forEach(id => {
      if (!selectedLinkedChapters.value.includes(id)) {
        selectedLinkedChapters.value.push(id);
      }
    });
  }
};

// Toggle linked chapter selection
const toggleLinkedChapter = (chapterId: number) => {
  const index = selectedLinkedChapters.value.indexOf(chapterId);
  if (index > -1) {
    selectedLinkedChapters.value.splice(index, 1);
  } else {
    selectedLinkedChapters.value.push(chapterId);
  }
};

const toggleCourseExpand = async (courseId: number) => {
  const index = expandedCourses.value.indexOf(courseId);
  if (index > -1) {
    expandedCourses.value.splice(index, 1);
  } else {
    expandedCourses.value.push(courseId);
    // 展开时加载章节列表
    await loadChapterList(courseId);
  }
};

const getCourseCheckState = (courseId: number): "none" | "partial" | "full" => {
  const course = filteredCourses.value.find((c) => c.id === courseId);
  if (!course) return "none";

  const chapterIds = course.chapters.map((c) => c.id);
  const selectedCount = chapterIds.filter((id) =>
    selectedChapters.value.includes(id),
  ).length;

  if (selectedCount === 0) return "none";
  if (selectedCount === chapterIds.length) return "full";
  return "partial";
};

const toggleCourse = (course: Course) => {
  const state = getCourseCheckState(course.id);
  const chapterIds = course.chapters.map((c) => c.id);

  if (state !== "none") {
    selectedChapters.value = selectedChapters.value.filter(
      (id) => !chapterIds.includes(id),
    );
  } else {
    chapterIds.forEach((id) => {
      if (!selectedChapters.value.includes(id)) {
        selectedChapters.value.push(id);
      }
    });
  }
};

const isChapterSelected = (chapterId: number) =>
  selectedChapters.value.includes(chapterId);

const isChapterLinked = (chapterId: number) =>
  linkedChapters.value.some(c => c.id === chapterId);

// Check if all chapters of a course are linked (in right panel)
const isCourseFullyLinked = (courseId: number) => {
  // 从当前显示的课程列表中查找
  const course = filteredCourses.value.find(c => c.id === courseId);
  if (!course || course.chapters.length === 0) return false;
  return course.chapters.every(ch => isChapterLinked(ch.id));
};

// Check if some chapters of a course are linked (in right panel)
const isCoursePartiallyLinked = (courseId: number) => {
  const course = filteredCourses.value.find(c => c.id === courseId);
  if (!course || course.chapters.length === 0) return false;
  const linkedCount = course.chapters.filter(ch => isChapterLinked(ch.id)).length;
  return linkedCount > 0 && linkedCount < course.chapters.length;
};

// Get course checkbox class
const getCourseCheckClass = (courseId: number) => {
  // 如果所有章节都已关联，显示灰色不可选
  if (isCourseFullyLinked(courseId)) {
    return 'bg-gray-300 border-gray-300 cursor-not-allowed';
  }
  // 如果部分章节已关联，显示灰色但可选（选择未关联的章节）
  if (isCoursePartiallyLinked(courseId)) {
    return 'bg-gray-300 border-gray-300 cursor-pointer hover:border-[#FF9900]';
  }
  // 正常选中状态
  const state = getCourseCheckState(courseId);
  if (state === 'full' || state === 'partial') {
    return 'bg-[#FF9900] border-[#FF9900] cursor-pointer hover:border-[#FF9900]';
  }
  // 未选中状态
  return 'border-gray-300 cursor-pointer hover:border-[#FF9900]';
};

const toggleChapter = (chapter: Chapter) => {
  const index = selectedChapters.value.indexOf(chapter.id);
  if (index > -1) {
    selectedChapters.value.splice(index, 1);
  } else {
    selectedChapters.value.push(chapter.id);
  }
};

const handleLink = async () => {
  if (selectedChapters.value.length === 0) return;
  if (!props.exerciseId) {
    ElMessage.error('缺少练习题ID');
    return;
  }
  
  try {
    // 调用关联接口
    await api.bindExerciseChapter({
      exerciseId: props.exerciseId,
      type: 1, // 1-关联
      chapterIds: selectedChapters.value
    });
    
    // 更新本地状态
    selectedChapters.value.forEach((chapterId) => {
      if (!linkedChapters.value.find((c) => c.id === chapterId)) {
        const chapter = findChapterById(chapterId);
        if (chapter) {
          linkedChapters.value.push(chapter);
          // Auto expand the linked course
          if (!expandedLinkedCourses.value.includes(chapter.courseId)) {
            expandedLinkedCourses.value.push(chapter.courseId);
          }
        }
      }
    });
    selectedChapters.value = [];
    
    ElMessage.success(t('linkCourse.linkSuccess'));
    emit('confirm');
  } catch (error) {
    console.error('关联课程章节失败:', error);
    ElMessage.error('关联课程章节失败');
  }
};

const removeLinked = (chapterId: number) => {
  const index = linkedChapters.value.findIndex((c) => c.id === chapterId);
  if (index > -1) {
    linkedChapters.value.splice(index, 1);
  }
};

const handleUnlink = async () => {
  if (selectedLinkedChapters.value.length === 0) return;
  if (!props.exerciseId) {
    ElMessage.error('缺少练习题ID');
    return;
  }
  
  try {
    // 调用取消关联接口
    await api.bindExerciseChapter({
      exerciseId: props.exerciseId,
      type: 2, // 2-取消关联
      chapterIds: selectedLinkedChapters.value
    });
    
    // 更新本地状态
    linkedChapters.value = linkedChapters.value.filter(
      c => !selectedLinkedChapters.value.includes(c.id)
    );
    selectedLinkedChapters.value = [];
    
    ElMessage.success(t('linkCourse.unlinkSuccess'));
    emit('confirm');
  } catch (error) {
    console.error('取消关联课程章节失败:', error);
    ElMessage.error('取消关联课程章节失败');
  }
};

const handleClose = () => {
  emit("close");
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
