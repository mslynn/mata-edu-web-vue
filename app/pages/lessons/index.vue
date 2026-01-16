<template>
  <div class="lessons-page flex h-full">
    <!-- 创建课程弹窗 -->
    <CreateCourseModal v-model="showCreateModal" @confirm="handleCreateCourseConfirm" />

    <!-- 设置可见班级弹窗 -->
    <ClassVisibilityModal v-model:visible="showClassModal" :course-id="selectedCourse?.courseId || ''" @confirm="handleClassConfirm" />

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

      <!-- 课程树 - 递归渲染 -->
      <div class="flex-1 overflow-y-auto px-2">
        <MenuTreeItem 
          v-for="menu in menuTree" 
          :key="String(menu.menuId || menu.menuName)"
          :node="menu" 
          :level="0"
          :expanded-menus="expandedMenus"
          :selected-course-id="selectedCourse?.courseId"
          @toggle="toggleMenu"
          @select="selectCourse"
        />
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
            <h2 class="text-lg font-medium text-gray-800">{{ selectedCourse?.courseName || '请选择课程' }}</h2>
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
                <button class="prepare-btn" @click.stop="handlePrepare(chapter)">
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
import { ElMessage } from 'element-plus'
import MenuTreeItem from '~/components/MenuTreeItem.vue'

definePageMeta({
  layout: 'default'
})

useI18n()
const router = useRouter()
const { getCursorDetail, createCursor, startPrepare } = cursorAdmin()
const { getCourseMenuTree } = useTeacher()

const showCreateModal = ref(false)
const showClassModal = ref(false)
const searchKeyword = ref('')

const activeTab = ref('chapters')
const tabs = [
  { label: '课程章节', value: 'chapters' },
  { label: '课程测评', value: 'resources' }
]

// 类型定义
interface MenuNode {
  menuId: string | number | null
  menuName: string
  courseList?: CourseItem[]
  children?: MenuNode[]
}

interface CourseItem {
  courseId: string
  courseName: string
}

interface ChapterItem {
  chapterId: number
  chapterName: string
  isPrepare?: number
}

const menuTree = ref<MenuNode[]>([])
const expandedMenus = ref<Set<string>>(new Set())
const selectedCourse = ref<CourseItem | null>(null)
const chapterList = ref<ChapterItem[]>([])

// 递归提取所有课程
const allCourses = computed(() => {
  const courses: CourseItem[] = []
  const extract = (node: MenuNode) => {
    if (node.courseList) courses.push(...node.courseList)
    if (node.children) node.children.forEach(extract)
  }
  menuTree.value.forEach(extract)
  return courses
})

const filteredCourses = computed(() => {
  if (!searchKeyword.value.trim()) return []
  const keyword = searchKeyword.value.toLowerCase()
  return allCourses.value.filter(c => c.courseName.toLowerCase().includes(keyword))
})

const toggleMenu = (menuKey: string) => {
  if (expandedMenus.value.has(menuKey)) {
    expandedMenus.value.delete(menuKey)
  } else {
    expandedMenus.value.add(menuKey)
  }
}

const parseMenuNode = (item: any): MenuNode => {
  const node: MenuNode = {
    menuId: item.menuId,
    menuName: item.menuName || '未分组',
    courseList: (item.courseList || []).map((c: any) => ({
      courseId: String(c.courseId),
      courseName: c.courseName
    }))
  }
  if (item.children?.length) {
    node.children = item.children.map(parseMenuNode)
  }
  return node
}

const findFirstCourse = (node: MenuNode): CourseItem | null => {
  if (node.courseList?.length) return node.courseList[0] || null
  if (node.children) {
    for (const child of node.children) {
      const course = findFirstCourse(child)
      if (course) return course
    }
  }
  return null
}

const expandToFirstCourse = (node: MenuNode): boolean => {
  const key = String(node.menuId ?? node.menuName)
  if (node.courseList?.length) {
    expandedMenus.value.add(key)
    return true
  }
  if (node.children) {
    for (const child of node.children) {
      if (expandToFirstCourse(child)) {
        expandedMenus.value.add(key)
        return true
      }
    }
  }
  return false
}

const loadMenuData = async () => {
  try {
    const data = await getCourseMenuTree()
    if (data?.length) {
      menuTree.value = data.map(parseMenuNode)
      
      for (const menu of menuTree.value) {
        if (expandToFirstCourse(menu)) {
          const firstCourse = findFirstCourse(menu)
          if (firstCourse) {
            selectedCourse.value = firstCourse
            await loadChapters(firstCourse.courseId)
          }
          break
        }
      }
    }
  } catch (error) {
    console.error('获取课程菜单失败:', error)
  }
}

const selectSearchResult = async (course: CourseItem) => {
  searchKeyword.value = ''
  selectedCourse.value = course
  await loadChapters(course.courseId)
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const selectCourse = async (course: CourseItem) => {
  selectedCourse.value = course
  await loadChapters(course.courseId)
}

const loadChapters = async (courseId: string) => {
  try {
    const data = await getCursorDetail(courseId)
    chapterList.value = (data?.chapterList || []).map((item: any) => ({
      chapterId: item.chapterId,
      chapterName: item.chapterName,
      isPrepare: item.isPrepare || 0
    }))
  } catch (error) {
    console.error('获取章节列表失败:', error)
    chapterList.value = []
  }
}

const handlePrepare = async (chapter: ChapterItem) => {
  if (!selectedCourse.value) return
  
  if (chapter.isPrepare === 0) {
    try {
      await startPrepare(String(chapter.chapterId), selectedCourse.value.courseId)
      chapter.isPrepare = 1
    } catch (error) {
      console.error('开始备课失败:', error)
      return
    }
  }
  router.push(`/system/course/prepare/${selectedCourse.value.courseId}?chapterId=${chapter.chapterId}`)
}

const handleCreateCourse = () => {
  showCreateModal.value = true
}

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
    await loadMenuData()
  } catch (error) {
    console.error('创建课程失败:', error)
  }
}

const handleSetVisibility = () => {
  if (!selectedCourse.value) {
    ElMessage.warning('请先选择课程')
    return
  }
  showClassModal.value = true
}

const handleClassConfirm = (selectedIds: number[]) => {
  console.log('选中的班级:', selectedIds)
}

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
</style>