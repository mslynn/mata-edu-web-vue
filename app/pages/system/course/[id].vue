<template>
  <div ref="pageRef" class="course-detail-page">
    <!-- 顶部区域 -->
    <div class="header-section">
      <div class="breadcrumb">
        <NuxtLink to="/system/course" class="back-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </NuxtLink>
        <span class="breadcrumb-text">{{ $t('course.courseResource') }}</span>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">{{ courseInfo.name }}</span>
      </div>
      <!-- 课程信息区域 -->
      <div class="course-row-wrapper">
        <div class="course-row">
          <div class="cover-box">
            <img v-if="courseInfo.courseCoverUrl" :src="courseInfo.courseCoverUrl" :alt="$t('common.courseCover')"
              class="cover-img" />
          </div>
          <div class="info-box">
            <div class="title-container">
              <h1 class="title">{{ courseInfo.name }}</h1>
              <div v-if="courseLabelList.length > 0" class="label-container">
                <span v-for="label in courseLabelList" :key="label" class="course-label">
                  {{ label }}
                </span>
              </div>
            </div>
            <p class="desc">{{ courseInfo.description }}</p>
            <div class="action-buttons">
              <button class="action-btn-primary" @click="showEvaluationModal = true">{{ $t('course.courseEvaluation') }}</button>
              <button class="action-btn-primary" @click="showClassModal = true">{{ $t('course.setVisibleClass') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置可见班级弹窗 -->
    <ClassVisibilityModal v-model:visible="showClassModal" :course-id="String(route.params.id)" @confirm="handleClassConfirm" />

    <!-- 课程测评弹窗 -->
    <CourseEvaluationModal v-model:visible="showEvaluationModal" @distribute="handleDistribute" />

    <!-- 开课设置弹窗 -->
    <StartClassModal v-model:visible="showStartClassModal" :class-list="startClassData.classList"
      :course-list="startClassData.courseList" :course-tree="startClassData.courseTree"
      :initial-course-id="startClassData.initialCourseId" :initial-chapter-id="startClassData.initialChapterId"
      ref="startClassModalRef" @class-change="handleClassChange" @course-change="handleCourseChange"
      @confirm="handleStartClassConfirm" />

    <!-- 主体内容 -->
    <div ref="courseMainRef" class="course-main">
      <div class="chapter-sidebar">
        <div class="sidebar-title">{{ $t('course.chapterDetails') }}</div>
        <div class="chapter-list">
          <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item"
            :class="{ active: activeChapter === chapter.id }" @click="activeChapter = chapter.id">
            <span class="chapter-name">{{ chapter.name }}</span>
            <div class="chapter-actions">
              <button class="action-btn prepare-btn" @click.stop="handlePrepare(chapter)">{{ chapter.isPrepare === 1 ?
                $t('course.continuePrepare') : $t('course.startPrepare') }}</button>
              <button class="action-btn start-btn" @click.stop="handleStartClass(chapter)">{{ $t('course.startClass')
                }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="content-area">
        <div class="tab-header">
          <button v-for="tab in tabs" :key="tab.value" class="tab-btn" :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value">{{ tab.label }}</button>
        </div>
        <div class="tab-content">
          <div v-if="activeTab === 'resource'" class="resource-panel">
            <!-- 教学资源 - 动态渲染分组 -->
            <template v-if="teachingResources.length > 0">
              <div v-for="group in teachingResources" :key="group.resourceName" class="resource-section">
                <div class="section-header" @click="toggleTeachingSection(group.resourceName)">
                  <svg class="arrow-icon" :class="{ expanded: teachingExpandedSections[group.resourceName] }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{{ group.resourceName }}({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="teachingExpandedSections[group.resourceName]" class="section-content">
                  <div class="resource-grid">
                    <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item"
                      @click="openTeachingResource(item)">
                      <img class="resource-icon-img" :src="getFileIconSrc(getFileType(item.fileName))" :alt="getFileType(item.fileName)" />
                      <span class="resource-name">{{ item.fileName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">{{ $t('common.noData') }}</div>
          </div>
          <div v-else-if="activeTab === 'task'" class="resource-panel">
            <template v-if="taskResources.length > 0">
              <!-- 学习任务 - 动态渲染分组 -->
              <div v-for="group in taskResources" :key="group.resourceName" class="resource-section">
                <div class="section-header" @click="toggleTaskSection(group.resourceName)">
                  <svg class="arrow-icon" :class="{ expanded: taskExpandedSections[group.resourceName] }" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{{ group.resourceName }}({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="taskExpandedSections[group.resourceName]" class="section-content">
                  <div class="resource-grid">
                    <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item"
                      @click="openTaskResource(item)">
                      <img class="resource-icon-img" :src="getFileIconSrc(getFileType(item.fileName))" :alt="getFileType(item.fileName)" />
                      <span class="resource-name">{{ item.fileName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">{{ $t('common.noData') }}</div>
          </div>
          <div v-else-if="activeTab === 'personal'" class="resource-panel">
            <!-- 个人资源 - 动态渲染分组 -->
            <template v-if="personalResources.length > 0">
              <div v-for="group in personalResources" :key="group.resourceName" class="resource-section">
                <div class="section-header" @click="togglePersonalSection(group.resourceName)">
                  <svg class="arrow-icon" :class="{ expanded: personalExpandedSections[group.resourceName] }"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{{ group.resourceName }}({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="personalExpandedSections[group.resourceName]" class="section-content">
                  <div class="resource-grid">
                    <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item"
                      @click="openPersonalResource(item)">
                      <img class="resource-icon-img" :src="getFileIconSrc(getFileType(item.fileName))" :alt="getFileType(item.fileName)" />
                      <span class="resource-name">{{ item.fileName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">{{ $t('common.noData') }}</div>
          </div>
          <div v-else class="empty-state">{{ $t('common.noData') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cursorAdmin } from '~/composables/api/curosr'
import { useTeacher } from '~/composables/api/useTeacher'

const { locale, t } = useI18n()
definePageMeta({ layout: 'default' })

const route = useRoute()
const { getCursorDetail, startPrepare, getChapterResourceList } = cursorAdmin()
const { getTeachChapterList, getClassListNoPage, getCourseMenuTree } = useTeacher()

// 加载课程详情函数
const loadCourseDetail = async () => {
  try {
    const data = await getCursorDetail(String(route.params.id))
    if (data) {
      courseInfo.value.name = data.courseName || courseInfo.value.name
      courseInfo.value.description = data.courseDesc || courseInfo.value.description
      courseInfo.value.courseCoverUrl = data.courseCoverUrl || ''
      courseInfo.value.courseLabels = data.courseLabels || ''

      // 更新章节列表
      if (data.chapterList && Array.isArray(data.chapterList)) {
        chapters.value = data.chapterList.map((c: any, idx: number) => ({
          id: c.chapterId || idx + 1,
          name: c.chapterName || `章节${idx + 1}`,
          isPrepare: c.isPrepare || 0
        }))

        // 默认选中第一个章节并加载详情（仅在初次加载且没有选中章节时）
        if (!activeChapter.value && chapters.value.length > 0 && chapters.value[0]) {
          activeChapter.value = chapters.value[0].id
        }
      }
    }
  } catch (error) {
    console.error('加载课程详情失败:', error)
  }
}

// 监听语言变化
watch(locale, () => {
  loadCourseDetail()
  if (activeChapter.value) {
    loadChapterDetail(activeChapter.value)
  }
})

// 页面加载时
onMounted(() => {
  loadCourseDetail()
})

const courseInfo = ref({
  id: route.params.id,
  name: '',
  description: '',
  courseCoverUrl: '',
  courseLabels: ''
})

const courseLabelList = computed(() => {
  if (!courseInfo.value.courseLabels) return []
  return courseInfo.value.courseLabels.split(',').map(s => s.trim()).filter(s => s !== '')
})
const chapters = ref<{ id: number; name: string; isPrepare: number }[]>([])
const activeChapter = ref<number | null>(null)
const chapterLoading = ref(false)
const tabs = computed(() => [
  { label: t('prepare.teachingResource'), value: 'resource', resourceType: 1 },
  { label: t('prepare.learningTask'), value: 'task', resourceType: 2 },
  { label: t('prepare.personalResource'), value: 'personal', resourceType: 3 }
])
const activeTab = ref('resource')

// 资源项接口定义
interface ResourceItem {
  resourceId: number
  chapterId: string
  resourceType: number
  resourceCategory: number
  resourceName: string
  ossId: string
  fileName: string
  modifyNum: number
}
interface ResourceGroup {
  resourceCategory: number | null
  resourceName: string
  resourceList: ResourceItem[]
}

// 教学资源数据
const teachingResources = ref<ResourceGroup[]>([])
const teachingExpandedSections = reactive<Record<string, boolean>>({})

// 学习任务数据
const taskResources = ref<ResourceGroup[]>([])
const taskExpandedSections = reactive<Record<string, boolean>>({})

// 个人资源数据
const personalResources = ref<ResourceGroup[]>([])
const personalExpandedSections = reactive<Record<string, boolean>>({})

// 切换教学资源分组展开状态
const toggleTeachingSection = (name: string) => {
  teachingExpandedSections[name] = !teachingExpandedSections[name]
}

// 切换学习任务分组展开状态
const toggleTaskSection = (name: string) => {
  taskExpandedSections[name] = !taskExpandedSections[name]
}

// 切换个人资源分组展开状态
const togglePersonalSection = (name: string) => {
  personalExpandedSections[name] = !personalExpandedSections[name]
}

// 根据文件名获取文件类型
const getFileType = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    doc: 'word',
    docx: 'word',
    ppt: 'ppt',
    pptx: 'ppt',
    xls: 'excel',
    xlsx: 'excel',
    pdf: 'pdf',
    ucd: 'ucd'
  }
  return typeMap[ext] || 'default'
}

// 打开教学资源
const openTeachingResource = (item: ResourceItem) => {
  const type = getFileType(item.fileName)
  navigateTo(`/system/course/prepare/${route.params.id}?chapterId=${activeChapter.value}&resourceId=${item.resourceId}&tab=resource&ossId=${item.ossId}&resourceName=${encodeURIComponent(item.fileName)}&resourceType=${type}`)
}

// 打开学习任务资源
const openTaskResource = (item: ResourceItem) => {
  const type = getFileType(item.fileName)
  navigateTo(`/system/course/prepare/${route.params.id}?chapterId=${activeChapter.value}&resourceId=${item.resourceId}&tab=task&ossId=${item.ossId}&resourceName=${encodeURIComponent(item.fileName)}&resourceType=${type}`)
}

// 打开个人资源
const openPersonalResource = (item: ResourceItem) => {
  const type = getFileType(item.fileName)
  navigateTo(`/system/course/prepare/${route.params.id}?chapterId=${activeChapter.value}&resourceId=${item.resourceId}&tab=personal&ossId=${item.ossId}&resourceName=${encodeURIComponent(item.fileName)}&resourceType=${type}`)
}

// 获取当前 tab 对应的 resourceType
const getCurrentResourceType = () => {
  const currentTab = tabs.value.find(t => t.value === activeTab.value)
  return currentTab?.resourceType || 1
}

// 加载章节资源
const loadChapterDetail = async (chapterId: number, resourceType?: number) => {
  chapterLoading.value = true
  try {
    const type = resourceType ?? getCurrentResourceType()
    const data = await getChapterResourceList(String(chapterId), type)
    if (data) {
      if (type === 1) {
        // 教学资源
        teachingResources.value = data || []
        teachingResources.value.forEach(group => {
          if (teachingExpandedSections[group.resourceName] === undefined) {
            teachingExpandedSections[group.resourceName] = true
          }
        })
      } else if (type === 2) {
        // 学习任务
        taskResources.value = data || []
        taskResources.value.forEach(group => {
          if (taskExpandedSections[group.resourceName] === undefined) {
            taskExpandedSections[group.resourceName] = true
          }
        })
      } else if (type === 3) {
        // 个人资源
        personalResources.value = data || []
        personalResources.value.forEach(group => {
          if (personalExpandedSections[group.resourceName] === undefined) {
            personalExpandedSections[group.resourceName] = true
          }
        })
      }
    }
  } catch (error) {
    console.error('加载章节资源失败:', error)
  } finally {
    chapterLoading.value = false
  }
}

// 监听章节切换
watch(activeChapter, (newChapterId) => {
  if (newChapterId) {
    loadChapterDetail(newChapterId)
  }
})

// 监听 tab 切换
watch(activeTab, () => {
  if (activeChapter.value) {
    loadChapterDetail(activeChapter.value)
  }
})

// 引入图标图片
import pptIcon from '~/assets/images/ppt.png'
import docIcon from '~/assets/images/doc.png'
import xlsIcon from '~/assets/images/xls.png'
import pdfIcon from '~/assets/images/pdf.png'
import mp4Icon from '~/assets/images/mp4.png'
import pngIcon from '~/assets/images/png.png'
import sbIcon from '~/assets/images/sb.png'
import pyIcon from '~/assets/images/py.png'

// 根据文件类型获取图标图片路径
const getFileIconSrc = (type: string) => {
  const iconMap: Record<string, string> = {
    ppt: pptIcon, 
    word: docIcon,
    excel: xlsIcon,
    pdf: pdfIcon,
    video: mp4Icon,
    image: pngIcon,
    scratch: sbIcon,
    python: pyIcon
  }
  return iconMap[type] || docIcon
}

// 设置可见班级弹窗
const showClassModal = ref(false)
const handleClassConfirm = (selectedIds: number[]) => {
  console.log('选中的班级:', selectedIds)
}

// 课程测评弹窗
const showEvaluationModal = ref(false)
const handleDistribute = (item: { id: number; name: string }) => {
  console.log('下发测评:', item)
}

// 开课设置弹窗
const showStartClassModal = ref(false)
const startClassModalRef = ref<any>(null)
const startClassData = reactive({
  classList: [] as { classId: string; className: string }[],
  courseList: [] as { courseId: string; courseName: string }[],
  courseTree: [] as { menuId: number | null; menuName: string; courseList: { courseId: string; courseName: string }[] }[],
  initialCourseId: '',
  initialChapterId: ''
})

// 班级切换时不再需要更新课程列表（班级和课程独立）
const handleClassChange = (classId: string) => {
  // 清空已选章节
  if (startClassModalRef.value) {
    startClassModalRef.value.setChapterList([])
  }
}

// 课程切换时加载章节列表
const handleCourseChange = async (courseId: string, classId: string) => {
  try {
    const data = await getTeachChapterList(courseId, classId)
    if (data && startClassModalRef.value) {
      const chapters = (Array.isArray(data) ? data : []).map((c: any) => ({
        chapterId: String(c.chapterId),
        chapterName: c.chapterName,
        isLastClass: c.isLastClass || false
      }))
      startClassModalRef.value.setChapterList(chapters)
    }
  } catch (error) {
    console.error('加载章节列表失败:', error)
    if (startClassModalRef.value) {
      startClassModalRef.value.setChapterList([])
    }
  }
}

// 确认开课
const handleStartClassConfirm = async (data: { classId: string; courseId: string; chapterId: string }) => {
  console.log('开课数据:', data)

  // 先调用开始上课接口
  const { beginClass } = useTeacher()
  const peerId = data.classId

  try {
    await beginClass({
      classId: data.classId,
      courseId: data.courseId,
      chapterId: data.chapterId,
      peerId
    })
    console.log('开始上课成功')
    // 接口成功，跳转到上课页面
    navigateTo(`/system/classroom/${data.chapterId}?classId=${data.classId}&courseId=${data.courseId}`)
  } catch (error: any) {
    console.error('开始上课失败:', error)
    // ElMessage.error(error.message || '开始上课失败')
  }
}

// 章节操作
const handlePrepare = async (chapter: { id: number; name: string; isPrepare: number }) => {
  // 如果是开始备课（isPrepare === 0），先调用接口
  if (chapter.isPrepare === 0) {
    try {
      await startPrepare(String(chapter.id), String(route.params.id))
      // 更新本地状态
      chapter.isPrepare = 1
    } catch (error) {
      console.error('开始备课失败:', error)
      return
    }
  }
  // 跳转到备课页面
  navigateTo(`/system/course/prepare/${route.params.id}?chapterId=${chapter.id}`)
}

const handleStartClass = async (chapter: { id: number; name: string }) => {
  console.log('开始上课:', chapter)

  // 设置初始数据 
  startClassData.initialCourseId = String(route.params.id)
  startClassData.initialChapterId = String(chapter.id)

  // 并行调用两个独立的接口
  try {
    const [classListRes, courseTreeRes] = await Promise.all([
      getClassListNoPage(),
      getCourseMenuTree()
    ])

    // 设置班级列表
    if (classListRes && Array.isArray(classListRes)) {
      startClassData.classList = classListRes.map((item: any) => ({
        classId: String(item.classId || item.id),
        className: item.className
      }))
    } else {
      startClassData.classList = []
    }

    // 设置课程树形结构
    if (courseTreeRes && Array.isArray(courseTreeRes)) {
      // 递归提取所有课程（用于扁平列表兼容）
      const extractAllCourses = (nodes: any[]): { courseId: string; courseName: string }[] => {
        let courses: { courseId: string; courseName: string }[] = []
        nodes.forEach((node: any) => {
          // 提取当前节点的课程
          if (node.courseList && Array.isArray(node.courseList)) {
            node.courseList.forEach((course: any) => {
              courses.push({
                courseId: String(course.courseId),
                courseName: course.courseName
              })
            })
          }
          // 递归提取子节点的课程
          if (node.children && Array.isArray(node.children)) {
            courses = courses.concat(extractAllCourses(node.children))
          }
        })
        return courses
      }

      // 设置树形结构（保持原始结构）
      startClassData.courseTree = courseTreeRes

      // 设置扁平列表（兼容）
      startClassData.courseList = extractAllCourses(courseTreeRes)
    } else {
      startClassData.courseTree = []
      startClassData.courseList = []
    }
  } catch (error) {
    console.error('获取开课设置失败:', error)
    startClassData.classList = []
    startClassData.courseTree = []
    startClassData.courseList = [
      { courseId: String(route.params.id), courseName: courseInfo.value.name }
    ]
  }

  // 打开弹窗
  showStartClassModal.value = true
}
</script>

<style scoped>
.course-detail-page {
  height: calc(100vh - 70px);
  background: #f5f5f5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header-section {
  flex-shrink: 0;
  background: #f5f5f5;
  padding: 12px 40px 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 69px;
  height: 50px;
  background: #FE9900;
  border-radius: 10px;
  color: white;
  text-decoration: none;
}

.back-btn:hover {
  background: #E68A00;
}

.breadcrumb-text {
  color: #666;
}

.breadcrumb-separator {
  color: #999;
}

.breadcrumb-current {
  color: #333;
}

/* 课程信息区域 */
.course-row-wrapper {
  background: white;
  padding: 20px;
  border-radius: 10px;
}

.course-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.cover-box {
  width: 220px;
  height: 276px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #ddd;
}

.cover-badge {
  position: absolute;
  top: 0;
  left: 0;
  background: #FF9900;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 8px 0 8px 0;
  z-index: 2;
}

.cover-status {
  position: absolute;
  top: 0;
  right: 0;
  background: #52c41a;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 0 8px 0 8px;
  z-index: 2;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-box {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 12px 0;
  flex-wrap: wrap;
}

.title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.label-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.course-label {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: #FFF8F0;
  border: 1px solid #FF9900;
  color: #FF9900;
  border-radius: 4px;
  font-size: 12px;
  font-weight: normal;
  line-height: 1.2;
}

.desc {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 0 40px 16px 0;
  height: 130px;
  overflow-y: auto;
  background: #F5F5F5;
  padding: 12px 16px;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn-primary {
  min-width: auto;
  padding: 0 24px;
  height: 36px;
  background: #FE9900;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.action-btn-primary:hover {
  background: #E68A00;
}

.course-main {
  display: flex;
  gap: 10px;
  border-radius: 8px;
  margin: 20px 40px 20px;
  flex: 1;
  min-height: 0;
}

.chapter-sidebar {
  width: 440px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  margin-right: 13px;
}

.sidebar-title {
  text-align: center;
  padding: 16px 20px;
  font-weight: 400;
  font-size: 20px;
  color: #696969;
  flex-shrink: 0;
}

.chapter-list {
  padding: 8px 0;
  flex: 1;
  overflow-y: auto;
}

.chapter-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 20px;

  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #eee;
}

.chapter-item:hover {
  background: #FFF8F0;
  color: #FF9900;
}

.chapter-item.active {
  background: #FFF8F0;
  color: #FF9900;
}

.chapter-name {
  flex: 1;
  /* min-width: 0; */
}

.chapter-actions {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.chapter-item:hover .chapter-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.prepare-btn {
  background: white;
  border: 1px solid #FF9900;
  color: #FF9900;
}

.prepare-btn:hover {
  background: #FFF8F0;
}

.start-btn {
  background: #FF9900;
  border: 1px solid #FF9900;
  color: white;
}

.start-btn:hover {
  background: #E68A00;
  border-color: #E68A00;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tab-header {
  display: flex;
  gap: 20px;
  margin-bottom: 0;
  margin-left: 20px;
  flex-shrink: 0;
}

.tab-btn {
  padding: 12px 32px;
  border: 1px solid #ddd;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  font-size: 16px;
  color: #666;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #FF9900;
}

.tab-btn.active {
  background: #FF9900;
  border-color: #FF9900;
  color: white;
}

.tab-content {
  flex: 1;
  border-radius: 10px;
  padding: 20px;
  background: white;
  border: 1px solid #ddd;
  overflow-y: auto;
  min-height: 0;
}

.resource-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.section-header:hover {
  color: #FF9900;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
}

.arrow-icon.expanded {
  transform: rotate(180deg);
}

.section-content {
  padding-left: 24px;
}

.resource-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9f9f9;
  border-radius: 8px;
  min-width: 200px;
  max-width: 280px;
  cursor: pointer;
  transition: all 0.2s;
}

.resource-item:hover {
  background: #FFF8F0;
}

.resource-icon-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
}

.resource-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.icon-ppt {
  background: #D04423;
  color: white;
}

.icon-word {
  background: #2B5797;
  color: white;
}

.icon-excel {
  background: #1D6F42;
  color: white;
}

.icon-pdf {
  background: #E53935;
  color: white;
}

.icon-ucd {
  background: #FFF3E0;
  color: #FF9800;
  border: 1px solid #FFE0B2;
  font-size: 10px;
}

.icon-default {
  background: #9E9E9E;
  color: white;
}

.resource-name {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
  word-break: break-all;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
}
</style>
