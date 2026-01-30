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
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";

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

const props = defineProps<{
  visible: boolean;
  initialLinked?: number[];
}>();

const emit = defineEmits<{
  close: [];
  confirm: [data: number[]];
}>();

const { t } = useI18n();

// Course type tabs
const courseTypes = computed(() => [
  { value: "official", label: t("linkCourse.officialCourse") },
  { value: "custom", label: t("linkCourse.customCourse") },
]);

// Sub tabs with children
const subTabs = computed(() => [
  {
    value: "normal",
    label: t("linkCourse.normalClass"),
    children: [
      { value: "example", label: t("linkCourse.exampleClass") },
      { value: "external", label: t("linkCourse.externalClass") },
      { value: "research", label: t("linkCourse.researchClass") },
      { value: "other", label: t("linkCourse.otherClass") },
    ],
  },
  {
    value: "club",
    label: t("linkCourse.clubClass"),
    children: [
      { value: "club-example", label: t("linkCourse.exampleClass") },
      { value: "club-external", label: t("linkCourse.externalClass") },
      { value: "club-other", label: t("linkCourse.otherClass") },
    ],
  },
  {
    value: "custom",
    label: t("linkCourse.customClass"),
    children: [
      { value: "custom-example", label: t("linkCourse.exampleClass") },
      { value: "custom-other", label: t("linkCourse.otherClass") },
    ],
  },
  {
    value: "dual",
    label: t("linkCourse.dualClass"),
    children: [
      { value: "dual-example", label: t("linkCourse.exampleClass") },
      { value: "dual-external", label: t("linkCourse.externalClass") },
    ],
  },
  {
    value: "demo",
    label: t("linkCourse.demoClass"),
    children: [
      { value: "demo-example", label: t("linkCourse.exampleClass") },
      { value: "demo-other", label: t("linkCourse.otherClass") },
    ],
  },
  {
    value: "crealand",
    label: "Crealand内容资源",
    children: [
      { value: "crealand-video", label: t("linkCourse.videoResource") },
      { value: "crealand-doc", label: t("linkCourse.docResource") },
    ],
  },
]);

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
};

// Select second level tab
const selectSecondLevel = (childValue: string) => {
  // Find which parent tab this child belongs to
  for (const tab of subTabs.value) {
    const child = tab.children?.find((c) => c.value === childValue);
    if (child) {
      selectedSubTab.value = tab.value;
      selectedSubTab2.value = childValue;
      break;
    }
  }
};

const selectedCourseType = ref("official");
const selectedSubTab = ref("normal");
const leftSearchKeyword = ref("");
const rightSearchKeyword = ref("");
const expandedCourses = ref<number[]>([1]);
const selectedChapters = ref<number[]>([]);
const linkedChapters = ref<Chapter[]>([]);
const initialLinkedIds = ref<number[]>([]);
const expandedLinkedCourses = ref<number[]>([]);
const selectedLinkedChapters = ref<number[]>([]);

// Mock data with category info
const courses = ref<Course[]>([
  // 官方课程 - 常态课
  {
    id: 1,
    name: "AI上神奇动物",
    courseType: "official",
    category: "normal",
    subCategory: "",
    chapters: [
      { id: 101, name: "《AI上神奇动物》资料合集", courseId: 1 },
      { id: 102, name: "主题01 走近神奇动物", courseId: 1 },
      { id: 103, name: "主题02 谁的大嘴巴", courseId: 1 },
      { id: 104, name: "主题03 猫的眼睛", courseId: 1 },
      { id: 105, name: "主题04 活动课——奇特的朋友：猫头鹰", courseId: 1 },
      { id: 106, name: "主题05 会说话的大象（1）", courseId: 1 },
      { id: 107, name: "主题06 会说话的大象（2）", courseId: 1 },
      { id: 108, name: "主题07 喜欢摇尾巴的小狗", courseId: 1 },
      { id: 109, name: "主题08 小鸟的翅膀", courseId: 1 },
      { id: 110, name: "主题09 活动课——我们不一样", courseId: 1 },
      { id: 111, name: "主题10 长颈鹿的长脖子", courseId: 1 },
      { id: 112, name: "主题11 蜗牛的触角（1）", courseId: 1 },
    ],
  },
  {
    id: 2,
    name: "AI未来实验室",
    courseType: "official",
    category: "normal",
    subCategory: "",
    chapters: [
      { id: 201, name: "主题01 认识人工智能", courseId: 2 },
      { id: 202, name: "主题02 机器学习基础", courseId: 2 },
      { id: 203, name: "主题03 图像识别技术", courseId: 2 },
    ],
  },
  // 官方课程 - 常态课 - 示例课
  {
    id: 8,
    name: "常态课示例：编程基础",
    courseType: "official",
    category: "normal",
    subCategory: "example",
    chapters: [
      { id: 801, name: "示例01 变量与数据类型", courseId: 8 },
      { id: 802, name: "示例02 条件语句", courseId: 8 },
    ],
  },
  // 官方课程 - 常态课 - 校外机构课程
  {
    id: 9,
    name: "校外机构：机器人课程",
    courseType: "official",
    category: "normal",
    subCategory: "external",
    chapters: [
      { id: 901, name: "机器人入门", courseId: 9 },
      { id: 902, name: "机器人进阶", courseId: 9 },
    ],
  },
  // 官方课程 - 社团课
  {
    id: 3,
    name: "机器人编程入门",
    courseType: "official",
    category: "club",
    subCategory: "",
    chapters: [
      { id: 301, name: "第一课 认识机器人", courseId: 3 },
      { id: 302, name: "第二课 基础编程", courseId: 3 },
    ],
  },
  // 官方课程 - 双师课
  {
    id: 4,
    name: "创意编程工坊",
    courseType: "official",
    category: "dual",
    subCategory: "",
    chapters: [
      { id: 401, name: "项目01 动画制作", courseId: 4 },
      { id: 402, name: "项目02 游戏设计", courseId: 4 },
    ],
  },
  // 官方课程 - 展示课
  {
    id: 10,
    name: "展示课：AI创作展",
    courseType: "official",
    category: "demo",
    subCategory: "",
    chapters: [
      { id: 1001, name: "展示01 学生作品", courseId: 10 },
      { id: 1002, name: "展示02 优秀案例", courseId: 10 },
    ],
  },
  // 官方课程 - Crealand内容资源
  {
    id: 7,
    name: "Crealand视频教程",
    courseType: "official",
    category: "crealand",
    subCategory: "",
    chapters: [
      { id: 701, name: "视频01 平台介绍", courseId: 7 },
      { id: 702, name: "视频02 功能演示", courseId: 7 },
    ],
  },
  // 自定义课程 - 常态课
  {
    id: 5,
    name: "Scratch趣味编程",
    courseType: "custom",
    category: "normal",
    subCategory: "",
    chapters: [
      { id: 501, name: "入门篇 认识Scratch", courseId: 5 },
      { id: 502, name: "基础篇 角色与舞台", courseId: 5 },
    ],
  },
  // 自定义课程 - 社团课
  {
    id: 6,
    name: "Python数据分析",
    courseType: "custom",
    category: "club",
    subCategory: "",
    chapters: [
      { id: 601, name: "数据处理基础", courseId: 6 },
      { id: 602, name: "数据可视化", courseId: 6 },
    ],
  },
]);

// Watch visible to init
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      linkedChapters.value = [];
      selectedChapters.value = [];
      if (props.initialLinked && props.initialLinked.length > 0) {
        props.initialLinked.forEach((chapterId) => {
          const chapter = findChapterById(chapterId);
          if (chapter) {
            linkedChapters.value.push(chapter);
          }
        });
      }
      initialLinkedIds.value = linkedChapters.value.map((c) => c.id);
    }
  },
);

const findChapterById = (id: number): Chapter | null => {
  for (const course of courses.value) {
    const chapter = course.chapters.find((c) => c.id === id);
    if (chapter) {
      return { ...chapter, courseName: course.name };
    }
  }
  return null;
};

const filteredCourses = computed(() => {
  let result = courses.value;
  
  // Filter by course type (official/custom)
  result = result.filter(course => course.courseType === selectedCourseType.value);
  
  // Only filter by category for official courses
  if (selectedCourseType.value === 'official') {
    // Filter by category (first level tab)
    result = result.filter(course => course.category === selectedSubTab.value);
    
    // Filter by sub category (second level tab) if selected
    if (selectedSubTab2.value) {
      result = result.filter(course => course.subCategory === selectedSubTab2.value);
    }
  }
  
  // Filter by search keyword
  if (leftSearchKeyword.value) {
    const keyword = leftSearchKeyword.value.toLowerCase();
    // Filter courses and their chapters
    result = result.map(course => {
      const matchedChapters = course.chapters.filter(c => 
        c.name.toLowerCase().includes(keyword)
      );
      const courseNameMatch = course.name.toLowerCase().includes(keyword);
      
      // If course name matches, return all chapters
      if (courseNameMatch) {
        return course;
      }
      // If chapters match, return course with only matched chapters
      if (matchedChapters.length > 0) {
        return { ...course, chapters: matchedChapters };
      }
      return null;
    }).filter((course): course is Course => course !== null);
  }
  
  return result;
});

// Auto expand first course when filtered courses change
watch(filteredCourses, (newCourses) => {
  if (newCourses && newCourses.length > 0 && newCourses[0]) {
    expandedCourses.value = [newCourses[0].id];
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
  
  return groupedLinkedCourses.value.map(group => {
    const matchedChapters = group.chapters.filter(c => 
      c.name.toLowerCase().includes(keyword)
    );
    const courseNameMatch = group.courseName.toLowerCase().includes(keyword);
    
    if (courseNameMatch) {
      return group;
    }
    if (matchedChapters.length > 0) {
      return { ...group, chapters: matchedChapters };
    }
    return null;
  }).filter((group): group is LinkedCourseGroup => group !== null);
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

const toggleCourseExpand = (courseId: number) => {
  const index = expandedCourses.value.indexOf(courseId);
  if (index > -1) {
    expandedCourses.value.splice(index, 1);
  } else {
    expandedCourses.value.push(courseId);
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

// Check if all chapters of a course are linked
const isCourseFullyLinked = (courseId: number) => {
  const course = courses.value.find(c => c.id === courseId);
  if (!course) return false;
  return course.chapters.every(ch => isChapterLinked(ch.id));
};

// Check if some chapters of a course are linked
const isCoursePartiallyLinked = (courseId: number) => {
  const course = courses.value.find(c => c.id === courseId);
  if (!course) return false;
  const linkedCount = course.chapters.filter(ch => isChapterLinked(ch.id)).length;
  return linkedCount > 0 && linkedCount < course.chapters.length;
};

// Get course checkbox class
const getCourseCheckClass = (courseId: number) => {
  if (isCourseFullyLinked(courseId)) {
    return 'bg-gray-300 border-gray-300 cursor-not-allowed';
  }
  if (isCoursePartiallyLinked(courseId)) {
    return 'bg-gray-300 border-gray-300 cursor-pointer hover:border-[#FF9900]';
  }
  const state = getCourseCheckState(courseId);
  if (state === 'full' || state === 'partial') {
    return 'bg-[#FF9900] border-[#FF9900] cursor-pointer hover:border-[#FF9900]';
  }
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

const handleLink = () => {
  if (selectedChapters.value.length === 0) return;
  
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
  
  // Show success message
  ElMessage.success(t('linkCourse.linkSuccess'));
};

const removeLinked = (chapterId: number) => {
  const index = linkedChapters.value.findIndex((c) => c.id === chapterId);
  if (index > -1) {
    linkedChapters.value.splice(index, 1);
  }
};

const handleUnlink = () => {
  // Remove selected linked chapters
  if (selectedLinkedChapters.value.length > 0) {
    linkedChapters.value = linkedChapters.value.filter(
      c => !selectedLinkedChapters.value.includes(c.id)
    );
    selectedLinkedChapters.value = [];
    ElMessage.success(t('linkCourse.unlinkSuccess'));
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
