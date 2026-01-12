<template>
  <div class="lessons-page flex h-full">
    <!-- 创建课程弹窗 -->
    <CreateCourseModal v-model="showCreateModal" @confirm="handleCreateCourseConfirm" />

    <!-- 设置可见班级弹窗 -->
    <ClassVisibilityModal v-model:visible="showClassModal" @confirm="handleClassConfirm" />

    <!-- 左侧面板 -->
    <aside class="left-panel w-[260px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <!-- 搜索框 -->
      <div class="p-4 relative">
        <MInput 
          v-model="searchKeyword" 
          :placeholder="$t('common.searchPlaceholder')"
          clearable
          @clear="clearSearch"
        >
          <template #prefix>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </template>
        </MInput>
        
        <!-- 搜索结果下拉列表 -->
        <div 
          v-if="searchKeyword && filteredCourses.length > 0"
          class="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-10"
        >
          <div 
            v-for="course in filteredCourses" 
            :key="course.courseId"
            class="px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-[#E6F7FF]"
            :class="selectedCourse?.courseId === course.courseId ? 'bg-[#E6F7FF] text-[#1890FF]' : 'text-gray-700'"
            @click="selectSearchResult(course)"
          >
            {{ course.courseName }}
          </div>
        </div>
      </div>

      <!-- 课程树 -->
      <div class="flex-1 overflow-y-auto px-2">
        <div v-for="menu in menuTree" :key="menu.menuName" class="menu-group">
          <!-- 分组标题 -->
          <div 
            class="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-50 rounded"
            @click="toggleMenu(menu.menuName)"
          >
            <svg 
              class="w-4 h-4 text-gray-400 transition-transform" 
              :class="{ 'rotate-90': expandedMenus.has(menu.menuName) }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span class="text-sm text-gray-700 font-medium">{{ menu.menuName }}</span>
          </div>
          
          <!-- 课程列表 -->
          <Transition name="slide">
            <div v-if="expandedMenus.has(menu.menuName)" class="course-list">
              <div 
                v-for="course in menu.courseList" 
                :key="course.courseId"
                class="pl-8 pr-3 py-2 text-sm cursor-pointer rounded transition-colors"
                :class="selectedCourse?.courseId === course.courseId ? 'bg-[#FFF1DD] text-[#FF9900]' : 'text-gray-600 hover:bg-gray-50'"
                @click="selectCourse(course)"
              >
                {{ course.courseName }}
              </div>
              <div v-if="menu.courseList.length === 0" class="pl-8 py-2 text-sm text-gray-400">
                暂无课程
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 创建课程按钮 -->
      <div class="p-4 border-t border-gray-100">
        <button 
          class="w-full h-[44px] flex items-center justify-center gap-2 bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00] transition-colors"
          @click="handleCreateCourse"
        >
          <span class="text-lg">+</span>
          <span>{{ $t('course.createCourse') }}</span>
        </button>
      </div>
    </aside>

    <!-- 右侧主内容 -->
    <main class="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
      <!-- 面包屑导航 -->
      <div class="px-6 py-4 bg-white border-b border-gray-200">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <NuxtLink to="/system/course" class="hover:text-[#FF9900]">{{ $t('course.myCourse') }}</NuxtLink>
          <span>></span>
          <span class="text-gray-800">{{ $t('prepare.title') }}</span>
        </div>
      </div>

      <!-- Tab 切换 + 操作按钮 -->
      <div class="px-6 py-4 bg-white flex items-center justify-between">
        <div class="flex gap-2">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            class="px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="activeTab === tab.value ? 'bg-[#FF9900] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="flex items-center gap-4">
          <button class="text-sm text-[#FF9900] hover:underline" @click="handleSetVisibility">
            设置课程可见班级
          </button>
  
        </div>
      </div>

      <!-- 章节列表 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white rounded-lg shadow-sm">
          <!-- 课程标题 -->
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-medium text-gray-800">{{ selectedCourse?.courseName || '请选择课程' }} </h2>
          </div>

          <!-- 章节列表 -->
          <div class="divide-y divide-gray-100">
            <div 
              v-for="chapter in chapterList" 
              :key="chapter.chapterId"
              class="chapter-item px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <span class="text-sm text-gray-700">{{ chapter.chapterName }}</span>
              <div class="chapter-actions">
                <button 
                  class="prepare-btn"
                  @click.stop="handlePrepare(chapter)"
                >
                  {{ chapter.isPrepare === 1 ? '继续备课' : '开始备课' }}
                </button>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="chapterList.length === 0" class="px-6 py-12 text-center text-gray-400">
              {{ $t('common.noData') }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { cursorAdmin } from '~/composables/api/curosr'
import { useTeacher } from '~/composables/api/useTeacher'

definePageMeta({
  layout: 'default'
})

useI18n()
const router = useRouter()
const { getCursorDetail, createCursor, startPrepare } = cursorAdmin()
const { getCourseMenuTree } = useTeacher()

// 创建课程弹窗
const showCreateModal = ref(false)

// 设置可见班级弹窗
const showClassModal = ref(false)

// 搜索
const searchKeyword = ref('')

// Tab
const activeTab = ref('chapters')
const tabs = [
  { label: '课程章节', value: 'chapters' },
  { label: '课程测评', value: 'resources' }
]

// 菜单树节点类型（简化版，直接用 course/tree 接口）
interface MenuGroup {
  menuId: string | null
  menuName: string
  courseList: CourseItem[]
  expanded?: boolean
}

// 课程类型
interface CourseItem {
  courseId: string
  courseName: string
}

// 章节类型
interface ChapterItem {
  chapterId: number
  chapterName: string
  isPrepare?: number  // 0=未备课, 1=已备课
}

// 菜单树数据
const menuTree = ref<MenuGroup[]>([])
const expandedMenus = ref<Set<string>>(new Set())
const selectedCourse = ref<CourseItem | null>(null)
const chapterList = ref<ChapterItem[]>([])

// 所有课程（用于前端搜索）
const allCourses = computed(() => {
  const courses: CourseItem[] = []
  menuTree.value.forEach(menu => {
    if (menu.courseList) {
      courses.push(...menu.courseList)
    }
  })
  return courses
})

// 前端搜索过滤的课程列表
const filteredCourses = computed(() => {
  if (!searchKeyword.value.trim()) {
    return []
  }
  const keyword = searchKeyword.value.toLowerCase()
  return allCourses.value.filter(course => 
    course.courseName.toLowerCase().includes(keyword)
  )
})

// 切换菜单展开/收起
const toggleMenu = (menuName: string) => {
  if (expandedMenus.value.has(menuName)) {
    expandedMenus.value.delete(menuName)
  } else {
    expandedMenus.value.add(menuName)
  }
}

// 加载菜单树
const loadMenuData = async () => {
  try {
    const data = await getCourseMenuTree()
    if (data && Array.isArray(data)) {
      menuTree.value = data.map((item: any) => ({
        menuId: item.menuId,
        menuName: item.menuName || '未分组',
        courseList: (item.courseList || []).map((course: any) => ({
          courseId: String(course.courseId),
          courseName: course.courseName
        }))
      }))
      
      // 默认展开第一个分组
      if (menuTree.value.length > 0 && menuTree.value[0]) {
        expandedMenus.value.add(menuTree.value[0].menuName)
      }
    }
  } catch (error) {
    console.error('获取课程菜单失败:', error)
  }
}

// 搜索结果选中
const selectSearchResult = async (course: CourseItem) => {
  searchKeyword.value = ''  // 清空搜索关键词，关闭下拉
  selectedCourse.value = course
  await loadChapters(course.courseId)
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
}

// 选择课程
const selectCourse = async (course: CourseItem) => {
  selectedCourse.value = course
  await loadChapters(course.courseId)
}

// 加载章节
const loadChapters = async (courseId: string) => {
  try {
    const data = await getCursorDetail(courseId)
    if (data && data.chapterList) {
      chapterList.value = data.chapterList.map((item: any) => ({
        chapterId: item.chapterId,
        chapterName: item.chapterName,
        isPrepare: item.isPrepare || 0
      }))
    } else {
      chapterList.value = []
    }
  } catch (error) {
    console.error('获取章节列表失败:', error)
    chapterList.value = []
  }
}

// 开始/继续备课
const handlePrepare = async (chapter: ChapterItem) => {
  if (!selectedCourse.value) return
  
  // 如果是开始备课（isPrepare === 0），先调用接口
  if (chapter.isPrepare === 0) {
    try {
      await startPrepare(String(chapter.chapterId), String(selectedCourse.value.courseId))
      // 更新本地状态
      chapter.isPrepare = 1
    } catch (error) {
      console.error('开始备课失败:', error)
      return
    }
  }
  // 跳转到备课页面
  router.push(`/system/course/prepare/${selectedCourse.value.courseId}?chapterId=${chapter.chapterId}`)
}

const handleCreateCourse = () => {
  showCreateModal.value = true
}

// 创建课程确认
const handleCreateCourseConfirm = async (data: any) => {
  try {
    await createCursor({
      courseName: data.name,
      courseCoverUrl: data.coverUrl || '',
      courseDesc: data.description || '',
      coursePermission: data.permission === 'public' ? 1 : 0,
      chapterList: data.chapters.map((c: any) => ({
        chapterName: c.name,
        delFlag: c.delFlag,
      })),
    })
    // 刷新菜单树
    await loadMenuData()
  } catch (error) {
    console.error('创建课程失败:', error)
  }
}

const handleSetVisibility = () => {
  showClassModal.value = true
}

// 设置可见班级确认
const handleClassConfirm = (selectedIds: number[]) => {
  console.log('选中的班级:', selectedIds)
}

// 初始化
onMounted(() => {
  loadMenuData()
})
</script>

<style scoped>
.lessons-page {
  height: calc(100vh - 70px);
}

.chapter-item {
  position: relative;
}

.chapter-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.chapter-item:hover .chapter-actions {
  opacity: 1;
}

.prepare-btn {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  background: white;
  border: 1px solid #1890FF;
  color: #1890FF;
}

.prepare-btn:hover {
  background: #E6F4FF;
}

/* 展开/收起动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  max-height: 500px;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
