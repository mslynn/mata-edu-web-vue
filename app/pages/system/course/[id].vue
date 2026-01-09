<template>
  <div ref="pageRef" class="course-detail-page" @scroll="onScroll">
    <!-- 顶部区域 -->
    <div class="header-section">
      <div class="breadcrumb">
        <NuxtLink to="/system/course" class="breadcrumb-link">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ $t('course.courseResource') }}
        </NuxtLink>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">{{ courseInfo.name }}</span>
      </div>
      <!-- 固定高度的容器 -->
      <div ref="wrapperRef" class="course-row-wrapper" :class="{ collapsed: isCollapsed }">
        <div ref="courseRowRef" class="course-row">
          <div class="cover-box">
          
            <img :src="courseInfo.courseCoverUrl" :alt="$t('common.courseCover')" class="cover-img" />
          </div>
          <div class="info-box">
            <div class="title-line">
              <h1 class="title">{{ courseInfo.name }}</h1>
              <button class="edit-btn" @click="showEvaluationModal = true">{{ $t('course.courseEvaluation') }}</button>
            </div>
            <div ref="extraInfoRef" class="extra-info">
              <!-- <span class="units">课程单元：{{ courseInfo.units }}单元</span> -->
              <p class="desc">{{ courseInfo.description }}</p>
            </div>
          </div>
          <a href="javascript:;" class="settings-link" @click="showClassModal = true">{{ $t('course.setVisibleClass') }}</a>
        </div>
      </div>
    </div>

    <!-- 设置可见班级弹窗 -->
    <ClassVisibilityModal v-model:visible="showClassModal" @confirm="handleClassConfirm" />
    
    <!-- 课程测评弹窗 -->
    <CourseEvaluationModal v-model:visible="showEvaluationModal" @distribute="handleDistribute" />

    <!-- 开课设置弹窗 -->
    <StartClassModal 
      v-model:visible="showStartClassModal"
      :class-list="startClassData.classList"
      :course-list="startClassData.courseList"
      :initial-course-id="startClassData.initialCourseId"
      :initial-chapter-id="startClassData.initialChapterId"
      ref="startClassModalRef"
      @class-change="handleClassChange"
      @course-change="handleCourseChange"
      @confirm="handleStartClassConfirm"
    />

    <!-- 主体内容 -->
    <div ref="courseMainRef" class="course-main">
      <div class="chapter-sidebar">
        <div class="sidebar-title">{{ $t('course.chapterDetails') }}</div>
        <div class="chapter-list">
          <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item" :class="{ active: activeChapter === chapter.id }" @click="activeChapter = chapter.id">
            <span class="chapter-name">{{ chapter.name }}</span>
            <div class="chapter-actions">
              <button class="action-btn prepare-btn" @click.stop="handlePrepare(chapter)">{{ chapter.isPrepare === 1 ? $t('course.continuePrepare') : $t('course.startPrepare') }}</button>
              <button class="action-btn start-btn" @click.stop="handleStartClass(chapter)">{{ $t('course.startClass') }}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="content-area">
        <div class="tab-header">
          <button v-for="tab in tabs" :key="tab.value" class="tab-btn" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">{{ tab.label }}</button>
        </div>
        <div class="tab-content">
          <div v-if="activeTab === 'resource'" class="resource-panel">
            <!-- 教学资源 - 动态渲染分组 -->
            <template v-if="teachingResources.length > 0">
              <div v-for="group in teachingResources" :key="group.resourceName" class="resource-section">
                <div class="section-header" @click="toggleTeachingSection(group.resourceName)">
                  <svg class="arrow-icon" :class="{ expanded: teachingExpandedSections[group.resourceName] }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{{ group.resourceName }}({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="teachingExpandedSections[group.resourceName]" class="section-content">
                  <div class="resource-grid">
                    <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item" @click="openTeachingResource(item)">
                      <div class="resource-icon" :class="getFileIconClass(getFileType(item.fileName))">
                        <span>{{ getFileIconText(getFileType(item.fileName)) }}</span>
                      </div>
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
                  <svg class="arrow-icon" :class="{ expanded: taskExpandedSections[group.resourceName] }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{{ group.resourceName }}({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="taskExpandedSections[group.resourceName]" class="section-content">
                  <div class="resource-grid">
                    <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item" @click="openTaskResource(item)">
                      <div class="resource-icon" :class="getFileIconClass(getFileType(item.fileName))">
                        <span>{{ getFileIconText(getFileType(item.fileName)) }}</span>
                      </div>
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
                  <svg class="arrow-icon" :class="{ expanded: personalExpandedSections[group.resourceName] }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{{ group.resourceName }}({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="personalExpandedSections[group.resourceName]" class="section-content">
                  <div class="resource-grid">
                    <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item" @click="openPersonalResource(item)">
                      <div class="resource-icon" :class="getFileIconClass(getFileType(item.fileName))">
                        <span>{{ getFileIconText(getFileType(item.fileName)) }}</span>
                      </div>
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
import gsap from 'gsap'
import { cursorAdmin } from '~/composables/api/curosr'
import { useTeacher } from '~/composables/api/useTeacher'

const { t } = useI18n()
definePageMeta({ layout: 'default' })

const route = useRoute()
const { getCursorDetail, startPrepare, getChapterResourceList } = cursorAdmin()
const { getTeachChapterList, getClassListNoPage, getCourseMenuTree } = useTeacher()
const isCollapsed = ref(false)
const courseRowRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const pageRef = ref<HTMLElement | null>(null)
const extraInfoRef = ref<HTMLElement | null>(null)
const courseMainRef = ref<HTMLElement | null>(null)

const onScroll = (e: Event) => {
  const top = (e.target as HTMLElement).scrollTop
  isCollapsed.value = top > 10
}

// 页面加载时确保滚动到顶部，显示放大状态，并加载课程详情
onMounted(async () => {
  if (pageRef.value) {
    pageRef.value.scrollTop = 0
  }
  
  // 加载课程详情
  try {
    const data = await getCursorDetail(String(route.params.id))
    if (data) {
      courseInfo.value.name = data.courseName || courseInfo.value.name
      courseInfo.value.description = data.courseDesc || courseInfo.value.description
      courseInfo.value.courseCoverUrl = data.courseCoverUrl || ''
      
      // 更新章节列表
      if (data.chapterList && Array.isArray(data.chapterList)) {
        chapters.value = data.chapterList.map((c: any, idx: number) => ({
          id: c.chapterId || idx + 1,
          name: c.chapterName || `章节${idx + 1}`,
          isPrepare: c.isPrepare || 0
        }))
        
        // 默认选中第一个章节并加载详情
        if (chapters.value.length > 0 && chapters.value[0]) {
          activeChapter.value = chapters.value[0].id
        }
      }
    }
  } catch (error) {
    console.error('加载课程详情失败:', error)
  }
})

// 用 GSAP 动画 - 全部用 transform，动画完成后改高度
watch(isCollapsed, (collapsed) => {
  if (!courseRowRef.value || !courseMainRef.value || !wrapperRef.value) return
  
  gsap.killTweensOf([courseRowRef.value, extraInfoRef.value, courseMainRef.value])
  
  if (collapsed) {
    // 缩小：scale + translateY 同步动画
    gsap.to(courseRowRef.value, {
      scale: 1,
      duration: 0.35,
      ease: 'power2.out'
    })
    gsap.to(courseMainRef.value, {
      y: -120,
      duration: 0.35,
      ease: 'power2.out',
      onComplete: () => {
        // 动画完成后改高度并重置 translateY
        if (wrapperRef.value && courseMainRef.value) {
          wrapperRef.value.style.height = '120px'
          gsap.set(courseMainRef.value, { y: 0 })
        }
      }
    })
    if (extraInfoRef.value) {
      gsap.to(extraInfoRef.value, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out'
      })
    }
  } else {
    // 放大：先改高度，再动画
    wrapperRef.value.style.height = '240px'
    gsap.to(courseRowRef.value, {
      scale: 2,
      duration: 0.35,
      ease: 'power2.out'
    })
    gsap.to(courseMainRef.value, {
      y: 0,
      duration: 0.35,
      ease: 'power2.out'
    })
    if (extraInfoRef.value) {
      gsap.to(extraInfoRef.value, {
        opacity: 1,
        duration: 0.25,
        delay: 0.1,
        ease: 'power2.out'
      })
    }
  }
})

const courseInfo = ref({
  id: route.params.id,
  name: '',
  description: '',
  courseCoverUrl: ''
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

// 根据文件类型获取图标样式
const getFileIconClass = (type: string) => {
  const iconMap: Record<string, string> = {
    ppt: 'icon-ppt',
    word: 'icon-word',
    excel: 'icon-excel',
    pdf: 'icon-pdf',
    ucd: 'icon-ucd'
  }
  return iconMap[type] || 'icon-default'
}

// 根据文件类型获取图标文字
const getFileIconText = (type: string) => {
  const textMap: Record<string, string> = {
    ppt: 'P',
    word: 'W',
    excel: 'X',
    pdf: 'PDF',
    ucd: 'ucd'
  }
  return textMap[type] || '?'
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
const handleCourseChange = async (courseId: string,classId:string) => {
  try {
    const data = await getTeachChapterList(courseId,classId)
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

    // 设置课程列表（从分组结构中提取所有课程）
    if (courseTreeRes && Array.isArray(courseTreeRes)) {
      const allCourses: { courseId: string; courseName: string }[] = []
      courseTreeRes.forEach((group: any) => {
        if (group.courseList && Array.isArray(group.courseList)) {
          group.courseList.forEach((course: any) => {
            allCourses.push({
              courseId: String(course.courseId),
              courseName: course.courseName
            })
          })
        }
      })
      startClassData.courseList = allCourses
    } else {
      startClassData.courseList = []
    }
  } catch (error) {
    console.error('获取开课设置失败:', error)
    startClassData.classList = []
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
  overflow-y: auto;
}

.header-section {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f5f5f5;
  padding: 12px 40px 0;
}

.breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #666; margin-bottom: 12px; }
.breadcrumb-link { display: flex; align-items: center; gap: 4px; color: #666; text-decoration: none; }
.breadcrumb-link:hover { color: #FF9900; }
.breadcrumb-separator { color: #999; }
.breadcrumb-current { color: #333; }

/* 外层容器 - 固定高度 */
.course-row-wrapper {
  height: 240px;
  overflow: visible;
}

/* 内层 - GSAP 控制缩放，GPU加速 */
.course-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  position: relative;
  transform-origin: top left;
  transform: scale(2) translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
  width: calc(100% / 2);
  max-width: calc(100% / 2);
  overflow: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.cover-box { width: 100px; height: 120px; border-radius: 8px; overflow: hidden; position: relative; flex-shrink: 0; background: #ddd; }
.cover-badge { position: absolute; top: 0; left: 0; background: #FF9900; color: white; font-size: 10px; padding: 2px 8px; border-radius: 8px 0 8px 0; z-index: 2; }
.cover-status { position: absolute; top: 0; right: 0; background: #52c41a; color: white; font-size: 10px; padding: 2px 6px; border-radius: 0 8px 0 8px; z-index: 2; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }

.info-box { flex: 1; min-width: 0; overflow: hidden; }
.title-line { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.title { font-size: 20px; font-weight: 600; color: #333; margin: 0; word-break: break-all; }
.edit-btn { padding: 6px 16px; background: #FF9900; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
.edit-btn:hover { background: #E68A00; }
.extra-info { margin-top: 4px; }
.units { font-size: 13px; color: #999; }
.desc { font-size: 13px; color: #666; line-height: 1.6; margin: 4px 0 0; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-all; }
.settings-link { position: absolute; right: 0; top: 0; color: #FF9900; font-size: 14px; text-decoration: none; }
.settings-link:hover { text-decoration: underline; }

.course-main {
  display: flex;
  gap: 20px;
  background: white;
  border-radius: 8px;
  margin: 20px 40px 20px;
  min-height: calc(100vh - 250px);
  transform: translateZ(0);
  will-change: transform;
}

.chapter-sidebar { width: 380px; border-right: 1px solid #eee; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; }
.sidebar-title { padding: 16px 20px; font-size: 14px; color: #333; font-weight: 500; border-bottom: 1px solid #eee; flex-shrink: 0; }
.chapter-list { padding: 8px 0; max-height: 500px; overflow-y: auto; }
.chapter-item { 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  padding: 12px 20px; 
  font-size: 13px; 
  color: #666; 
  cursor: pointer; 
  border-left: 3px solid transparent; 
  transition: all 0.2s; 
}
.chapter-item:hover { background: #FFF8F0; color: #FF9900; }
.chapter-item.active { background: #FFF8F0; color: #FF9900; border-left-color: #FF9900; }
.chapter-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chapter-actions { 
  display: flex; 
  gap: 8px; 
  opacity: 0; 
  transition: opacity 0.2s; 
}
.chapter-item:hover .chapter-actions { opacity: 1; }
.action-btn { 
  padding: 4px 12px; 
  font-size: 12px; 
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
.prepare-btn:hover { background: #FFF8F0; }
.start-btn { 
  background: #FF9900; 
  border: 1px solid #FF9900; 
  color: white; 
}
.start-btn:hover { background: #E68A00; border-color: #E68A00; }

.content-area { flex: 1; padding: 20px; }
.tab-header { display: flex; gap: 8px; margin-bottom: 20px; }
.tab-btn { padding: 8px 20px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; color: #666; background: white; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { border-color: #FF9900; color: #FF9900; }
.tab-btn.active { background: #FF9900; border-color: #FF9900; color: white; }

.tab-content { min-height: 300px; }
.resource-section { margin-bottom: 16px; }
.section-header { display: flex; align-items: center; gap: 8px; padding: 10px 0; font-size: 14px; color: #333; cursor: pointer; }
.section-header:hover { color: #FF9900; }
.arrow-icon { width: 16px; height: 16px; transition: transform 0.2s; }
.arrow-icon.expanded { transform: rotate(180deg); }
.section-content { padding-left: 24px; }
.resource-grid { display: flex; flex-wrap: wrap; gap: 12px; }
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
.resource-item:hover { background: #FFF8F0; }
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
.icon-ppt { background: #D04423; color: white; }
.icon-word { background: #2B5797; color: white; }
.icon-excel { background: #1D6F42; color: white; }
.icon-pdf { background: #E53935; color: white; }
.icon-ucd { background: #FFF3E0; color: #FF9800; border: 1px solid #FFE0B2; font-size: 10px; }
.icon-default { background: #9E9E9E; color: white; }
.resource-name { font-size: 13px; color: #333; line-height: 1.4; word-break: break-all; }
.empty-state { display: flex; align-items: center; justify-content: center; height: 200px; color: #999; }
</style>
