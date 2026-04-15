<template>
  <div class="lessons-page flex h-full">
    <!-- 创建课程弹窗 -->
    <CreateCourseModal v-model="showCreateModal" @confirm="handleCreateCourseConfirm" />

    <!-- 设置可见班级弹窗 -->
    <ClassVisibilityModal v-model:visible="showClassModal" :course-id="selectedCourse?.courseId || ''" @confirm="handleClassConfirm" />

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
          <NuxtLink to="/teacher" class="hover:text-[#FF9900]">{{ $t('menu.home') }}</NuxtLink>
          <span>></span>
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
            {{ $t('course.setVisibleClass') }}
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="bg-white rounded-lg shadow-sm">
          <!-- 课程标题 -->
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-medium text-gray-800">{{ selectedCourse?.courseName || $t('teacher.pleaseSelectCourse') }}</h2>
          </div>

          <template v-if="activeTab === 'chapters'">
            <div class="divide-y divide-gray-100">
              <div 
                v-for="chapter in chapterList" 
                :key="chapter.chapterId"
                class="lessons-chapter-item px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <span class="text-sm text-gray-700">{{ chapter.chapterName }}</span>
                <div class="lessons-chapter-actions">
                  <button class="lessons-prepare-btn" @click.stop="handlePrepare(chapter)">
                    {{ chapter.isPrepare === 1 ? $t('course.continuePrepare') : $t('course.startPrepare') }}
                  </button>
                </div>
              </div>

              <div v-if="chapterList.length === 0" class="px-6 py-12 text-center text-gray-400">
                {{ $t('common.noData') }}
              </div>
            </div>
          </template>

          <template v-else-if="activeTab === 'evaluation'">
            <div class="evaluation-list px-4 py-3">
              <div v-if="evaluationLoading" class="empty-state">加载中...</div>
              <div v-else-if="evaluationLoadError" class="empty-state">{{ evaluationLoadError }}</div>
              <div v-else-if="evaluationList.length === 0" class="empty-state">暂无课程测评</div>
              <template v-else>
                <div
                  v-for="item in evaluationList"
                  :key="item.exerciseId"
                  class="evaluation-item"
                >
                  <div class="item-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7CB3F0" stroke-width="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <span class="item-name">
                    {{ item.exerciseName }}
                    <span class="distribute-text" :class="getEvaluationStatusClass(item.status)">
                      {{ getEvaluationStatusText(item.status) }}
                    </span>
                  </span>
                  <div class="hover-actions">
                    <button class="hover-btn" @click="handleViewQuestions(item)">{{ $t('course.viewQuestions') }}</button>
                    <button class="hover-btn" @click="handleSetExam(item)">{{ $t('course.setExam') }}</button>
                    <button
                      class="hover-btn"
                      :class="{ disabled: !canGradeEvaluation(item.status) }"
                      :disabled="!canGradeEvaluation(item.status)"
                      @click="canGradeEvaluation(item.status) && handleGrading(item)"
                    >
                      {{ $t('course.gradeExam') }}
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </template>
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

const { t } = useI18n()
const router = useRouter()
const {
  getCursorDetail,
  createCursor,
  startPrepare,
  getCourseEvaluationList,
  startDistribute,
  withdrawExam,
  setCourseEvaluationList
} = cursorAdmin()
const { getCourseMenuTree } = useTeacher()

const showCreateModal = ref(false)
const showClassModal = ref(false)
const searchKeyword = ref('')

const activeTab = ref('chapters')
const tabs = computed(() => [
  { label: t('course.courseChapter'), value: 'chapters' },
  { label: t('course.courseEvaluation'), value: 'evaluation' }
])

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

interface CourseEvaluationItem {
  courseId: number | string
  exerciseId: string
  exerciseName: string
  status: number
}

const menuTree = ref<MenuNode[]>([])
const expandedMenus = ref<Set<string>>(new Set())
const selectedCourse = ref<CourseItem | null>(null)
const chapterList = ref<ChapterItem[]>([])
const evaluationList = ref<CourseEvaluationItem[]>([])
const evaluationLoading = ref(false)
const evaluationLoadError = ref('')
const showExerciseDetailModal = ref(false)
const currentExerciseId = ref<string | null>(null)
const showSetExamModal = ref(false)
const currentSetExamExerciseId = ref<string | null>(null)
const showGradingClassModal = ref(false)
const gradingClassLoading = ref(false)
const gradingClassOptions = ref<{ value: string; label: string }[]>([])
const currentGradingExerciseId = ref<string | null>(null)

const normalizeGradingClassOptions = (data: any) => {
  const classList = (Array.isArray(data) ? data : []).flatMap((item: any) => {
    if (Array.isArray(item?.classList)) {
      return item.classList
    }
    return item ? [item] : []
  })

  const seenClassIds = new Set<string>()

  return classList
    .filter((cls: any) => {
      if (cls?.status === null || cls?.status === undefined || cls?.status === '') {
        return true
      }
      return Number(cls.status) === 1
    })
    .map((cls: any) => {
      const classId = String(cls?.classId ?? cls?.id ?? '')
      const className = String(cls?.className ?? cls?.name ?? '')

      if (!classId || !className || seenClassIds.has(classId)) {
        return null
      }

      seenClassIds.add(classId)
      return {
        value: classId,
        label: className
      }
    })
    .filter((option): option is { value: string; label: string } => !!option)
}

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
    menuName: item.menuName || t('course.unGrouped'),
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
            await loadCourseContent(firstCourse.courseId)
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
  await loadCourseContent(course.courseId)
}

const clearSearch = () => {
  searchKeyword.value = ''
}

const selectCourse = async (course: CourseItem) => {
  selectedCourse.value = course
  await loadCourseContent(course.courseId)
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

const loadEvaluations = async (courseId: string) => {
  if (!courseId) {
    evaluationList.value = []
    return
  }

  evaluationLoading.value = true
  evaluationLoadError.value = ''

  try {
    const data = await getCourseEvaluationList(courseId)
    evaluationList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('获取课程测评列表失败:', error)
    evaluationLoadError.value = '加载课程测评列表失败'
    evaluationList.value = []
  } finally {
    evaluationLoading.value = false
  }
}

const loadCourseContent = async (courseId: string) => {
  await Promise.allSettled([
    loadChapters(courseId),
    loadEvaluations(courseId)
  ])
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
    ElMessage.warning(t('course.pleaseSelectCourseFirst'))
    return
  }
  showClassModal.value = true
}

const handleClassConfirm = (selectedIds: number[]) => {
  console.log('选中的班级:', selectedIds)
}

const getEvaluationStatusText = (status: number) => {
  if (status === 2) return '全部下发'
  if (status === 1) return '部分下发'
  return '未下发'
}

const getEvaluationStatusClass = (status: number) => {
  if (status === 2) return 'sent'
  if (status === 1) return 'partial'
  return ''
}

const canGradeEvaluation = (status: number) => status !== 0

const handleViewQuestions = (item: CourseEvaluationItem) => {
  currentExerciseId.value = String(item.exerciseId || '')
  showExerciseDetailModal.value = !!currentExerciseId.value
}

const handleSetExam = (item: CourseEvaluationItem) => {
  currentSetExamExerciseId.value = String(item.exerciseId || '')
  showSetExamModal.value = !!currentSetExamExerciseId.value
}

const handleExamSubmit = async (data: any) => {
  try {
    await startDistribute(data)
    ElMessage.success('下发测评成功')
    showSetExamModal.value = false
    if (selectedCourse.value?.courseId) {
      await loadEvaluations(selectedCourse.value.courseId)
    }
  } catch (error) {
    console.error('下发测评失败:', error)
    ElMessage.error('下发测评失败')
  }
}

const handleExamWithdraw = async (data: any) => {
  try {
    await withdrawExam(data)
    ElMessage.success('撤回测评成功')
    showSetExamModal.value = false
    if (selectedCourse.value?.courseId) {
      await loadEvaluations(selectedCourse.value.courseId)
    }
  } catch (error) {
    console.error('撤回测评失败:', error)
    ElMessage.error('撤回测评失败')
  }
}

const handleGrading = async (item: CourseEvaluationItem) => {
  if (!selectedCourse.value?.courseId || !item?.exerciseId) return

  currentGradingExerciseId.value = String(item.exerciseId)
  gradingClassLoading.value = true
  gradingClassOptions.value = []
  showGradingClassModal.value = true

  try {
    const data = await setCourseEvaluationList({
      courseId: selectedCourse.value.courseId,
      exerciseId: String(item.exerciseId)
    })

    gradingClassOptions.value = normalizeGradingClassOptions(data)
  } catch (error) {
    console.error('加载批改班级失败:', error)
    gradingClassOptions.value = []
    ElMessage.error('加载批改班级失败')
  } finally {
    gradingClassLoading.value = false
  }
}

const handleGradingClassSelect = async (option: { value: string; label: string }) => {
  await router.push({
    path: "/taskmanagement",
    query: {
      tab: "assessment",
      classId: option.value,
      courseId: String(selectedCourse.value?.courseId || ""),
      exerciseId: String(currentGradingExerciseId.value || ""),
    },
  })
}

onMounted(() => {
  loadMenuData()
})
</script>

<style scoped>
.lessons-page {
  height: calc(100vh - 70px);
}

.lessons-chapter-item {
  position: relative;
}

.lessons-chapter-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.lessons-chapter-item:hover .lessons-chapter-actions {
  opacity: 1;
}

.lessons-prepare-btn {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  background: white;
  border: 1px solid #FF9900;
  color: #FF9900;
}

.lessons-prepare-btn:hover {
  background: #FFF7E6;
}

.evaluation-list {
  min-height: 240px;
}

.evaluation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.evaluation-item:hover {
  background: #f5f9ff;
  border-radius: 8px;
}

.item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.distribute-text {
  color: #FF6B6B;
  font-size: 13px;
  margin-left: 8px;
}

.distribute-text.sent {
  color: #52c41a;
}

.distribute-text.partial {
  color: #fa8c16;
}

.hover-actions {
  display: none;
  gap: 8px;
  margin-left: auto;
}

.evaluation-item:hover .hover-actions {
  display: flex;
}

.hover-btn {
  padding: 6px 16px;
  background: white;
  border: 1px solid #FF9900;
  border-radius: 20px;
  color: #FF9900;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.hover-btn:hover {
  background: #FFF7E6;
}

.hover-btn.disabled {
  border-color: #ddd;
  color: #ccc;
  cursor: not-allowed;
}

.hover-btn.disabled:hover {
  background: white;
}

.empty-state {
  padding: 48px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
