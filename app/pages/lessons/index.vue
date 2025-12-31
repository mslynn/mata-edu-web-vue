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
        <template v-for="item in flattenedTree" :key="item.key">
          <!-- 菜单节点 -->
          <div 
            v-if="item.isMenu && item.node"
            class="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-50 rounded"
            :style="{ paddingLeft: `${item.level * 16}px` }"
            @click="toggleNode(item.node)"
          >
            <!-- 有子级才显示箭头，否则显示占位 -->
            <svg 
              v-if="item.hasChildren"
              class="w-4 h-4 text-gray-400 transition-transform" 
              :class="{ 'rotate-90': expandedNodes.has(item.key) }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span v-else class="w-4 h-4"></span>
            <span class="text-sm text-gray-700">{{ item.menuName }}</span>
          </div>
          
          <!-- 课程节点 -->
          <div 
            v-else-if="!item.isMenu && item.course"
            class="px-3 py-2 text-sm cursor-pointer rounded transition-colors"
            :class="selectedCourse?.courseId === item.course.courseId ? 'bg-[#FFF1DD] text-[#FF9900]' : 'text-gray-600 hover:bg-gray-50'"
            :style="{ paddingLeft: `${item.level * 16 + 8}px` }"
            @click="selectCourse(item.course)"
          >
            {{ item.menuName }}
          </div>
        </template>
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

definePageMeta({
  layout: 'default'
})

useI18n()
const router = useRouter()
const { getCursorTreeMenu, getCursorList, getCursorDetail, createCursor, startPrepare } = cursorAdmin()

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

// 菜单树节点类型
interface MenuNode {
  menuId: number | null
  menuName: string
  parentId: number | null
  menuLevel: number | null
  isVisible: number | null
  children?: MenuNode[]
  courses?: CourseItem[]
  courseType?: number
}

// 课程类型
interface CourseItem {
  courseId: number
  courseName: string
  courseHours?: number
}

// 章节类型
interface ChapterItem {
  chapterId: number
  chapterName: string
  isPrepare?: number  // 0=未备课, 1=已备课
}

// 扁平化的树节点（用于渲染）
interface FlatNode {
  key: string
  menuName: string
  level: number
  isMenu: boolean
  hasChildren: boolean
  node?: MenuNode
  course?: CourseItem
}

// 菜单树数据
const menuTree = ref<MenuNode[]>([])
const expandedNodes = ref<Set<string>>(new Set())
const selectedCourse = ref<CourseItem | null>(null)
const chapterList = ref<ChapterItem[]>([])

// 所有已加载的课程（用于前端搜索）
const allCourses = ref<CourseItem[]>([])

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

// 生成节点唯一key
const getNodeKey = (node: MenuNode): string => {
  if (node.menuId !== null) {
    return `menu_${node.menuId}`
  }
  return `special_${node.menuName}`
}

// 扁平化树结构用于渲染
const flattenedTree = computed(() => {
  const result: FlatNode[] = []
  
  const flatten = (nodes: MenuNode[], level: number) => {
    for (const node of nodes) {
      const key = getNodeKey(node)
      const hasChildrenMenu = !!(node.children && node.children.length > 0)
      const isLeaf = !hasChildrenMenu
      const hasCourses = !!(node.courses && node.courses.length > 0)
      // 有子菜单或者有课程（或者是叶子节点可以加载课程）都显示箭头
      const hasChildren = hasChildrenMenu || hasCourses || isLeaf
      
      // 添加菜单节点
      result.push({
        key,
        menuName: node.menuName,
        level,
        isMenu: true,
        hasChildren,
        node
      })
      
      // 如果展开了
      if (expandedNodes.value.has(key)) {
        // 有子菜单则递归
        if (hasChildrenMenu && node.children) {
          flatten(node.children, level + 1)
        }
        // 叶子节点显示课程
        if (isLeaf && node.courses) {
          for (const course of node.courses) {
            result.push({
              key: `course_${course.courseId}`,
              menuName: course.courseName,
              level: level + 1,
              isMenu: false,
              hasChildren: false,
              course
            })
          }
        }
      }
    }
  }
  
  flatten(menuTree.value, 0)
  return result
})

// 加载菜单树
const loadMenuData = async () => {
  try {
    const data = await getCursorTreeMenu()
    if (data && Array.isArray(data)) {
      // 处理数据，过滤共享课程，给自定义课程添加子级
      const processedData = data
        .filter((item: MenuNode) => item.menuName !== '共享课程')
        .map((item: MenuNode) => {
          // 自定义课程：手动添加"个人可见"和"学校可见"两个子级
          if (item.menuId === null && item.menuName === '自定义课程') {
            return {
              ...item,
              children: [
                {
                  menuId: null,
                  menuName: '个人可见',
                  parentId: null,
                  menuLevel: 2,
                  isVisible: 1,
                  courseType: 1  // 自定义课程 - 个人可见
                },
                {
                  menuId: null,
                  menuName: '学校可见',
                  parentId: null,
                  menuLevel: 2,
                  isVisible: 1,
                  courseType: 2  // 自定义课程 - 学校可见
                }
              ]
            }
          }
          return item
        })
      
      menuTree.value = processedData
      
      // 默认展开第一个节点
      if (menuTree.value.length > 0 && menuTree.value[0]) {
        const firstKey = getNodeKey(menuTree.value[0])
        expandedNodes.value.add(firstKey)
      }
      
      // 预加载所有叶子节点的课程（用于搜索）
      await preloadAllCourses(menuTree.value)
    }
  } catch (error) {
    console.error('获取课程菜单失败:', error)
  }
}

// 预加载所有叶子节点的课程
const preloadAllCourses = async (nodes: MenuNode[]) => {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      // 有子菜单，递归
      await preloadAllCourses(node.children)
    } else {
      // 叶子节点，加载课程
      await loadCoursesForNode(node)
    }
  }
}

// 判断节点是否是叶子节点
const isLeafMenu = (node: MenuNode): boolean => {
  return !node.children || node.children.length === 0
}

// 切换节点展开/收起
const toggleNode = async (node: MenuNode) => {
  const key = getNodeKey(node)
  const isLeaf = isLeafMenu(node)
  
  // 切换展开/收起
  if (expandedNodes.value.has(key)) {
    expandedNodes.value.delete(key)
  } else {
    expandedNodes.value.add(key)
    // 叶子节点展开时加载课程
    if (isLeaf && (!node.courses || node.courses.length === 0)) {
      await loadCoursesForNode(node)
    }
  }
  // 触发响应式更新
  expandedNodes.value = new Set(expandedNodes.value)
}

// 为节点加载课程列表
const loadCoursesForNode = async (node: MenuNode) => {
  try {
    const params: any = {}
    
    // 自定义课程 - 个人可见
    if (node.courseType === 1) {
      params.courseType = 1
      params.coursePermission = 0
    }
    // 自定义课程 - 学校可见
    else if (node.courseType === 2) {
      params.courseType = 1
      params.coursePermission = 1
    }
    // 常规课程
    else if (node.menuId !== null) {
      params.menuId = node.menuId
    }
    
    if (searchKeyword.value) {
      params.name = searchKeyword.value
    }
    
    const data = await getCursorList(params)
    if (data && Array.isArray(data)) {
      const courses = data.map((item: any) => ({
        courseId: item.courseId,
        courseName: item.courseName,
        courseHours: item.courseHours || item.chapterCount || 0
      }))
      node.courses = courses
      
      // 添加到全局课程列表（用于搜索），去重
      for (const course of courses) {
        if (!allCourses.value.find(c => c.courseId === course.courseId)) {
          allCourses.value.push(course)
        }
      }
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
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
const loadChapters = async (courseId: number) => {
  try {
    const data = await getCursorDetail(String(courseId))
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

// 跳转到章节
const goToChapter = (chapter: ChapterItem) => {
  if (selectedCourse.value) {
    router.push(`/system/course/prepare/${selectedCourse.value.courseId}?chapterId=${chapter.chapterId}`)
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
</style>
