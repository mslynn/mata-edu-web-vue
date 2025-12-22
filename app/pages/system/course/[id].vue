<template>
  <div ref="pageRef" class="course-detail-page" @scroll="onScroll">
    <!-- 顶部区域 -->
    <div class="header-section">
      <div class="breadcrumb">
        <NuxtLink to="/system/course" class="breadcrumb-link">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          课程资源
        </NuxtLink>
        <span class="breadcrumb-separator">&gt;</span>
        <span class="breadcrumb-current">{{ courseInfo.name }}</span>
      </div>
      <!-- 固定高度的容器 -->
      <div ref="wrapperRef" class="course-row-wrapper" :class="{ collapsed: isCollapsed }">
        <div ref="courseRowRef" class="course-row">
          <div class="cover-box">
          
            <img :src="courseInfo.courseCoverUrl" alt="封面" class="cover-img" />
          </div>
          <div class="info-box">
            <div class="title-line">
              <h1 class="title">{{ courseInfo.name }}</h1>
              <button class="edit-btn" @click="showEvaluationModal = true">课程测评</button>
            </div>
            <div ref="extraInfoRef" class="extra-info">
              <!-- <span class="units">课程单元：{{ courseInfo.units }}单元</span> -->
              <p class="desc">{{ courseInfo.description }}</p>
            </div>
          </div>
          <a href="javascript:;" class="settings-link" @click="showClassModal = true">设置课程可见班级</a>
        </div>
      </div>
    </div>

    <!-- 设置可见班级弹窗 -->
    <ClassVisibilityModal v-model:visible="showClassModal" @confirm="handleClassConfirm" />
    
    <!-- 课程测评弹窗 -->
    <CourseEvaluationModal v-model:visible="showEvaluationModal" @distribute="handleDistribute" />

    <!-- 主体内容 -->
    <div ref="courseMainRef" class="course-main">
      <div class="chapter-sidebar">
        <div class="sidebar-title">章节详情</div>
        <div class="chapter-list">
          <div v-for="(chapter, index) in chapters" :key="chapter.id" class="chapter-item" :class="{ active: activeChapter === chapter.id }" @click="activeChapter = chapter.id">
            <span class="chapter-name">{{ chapter.name }}</span>
            <div class="chapter-actions">
              <button class="action-btn prepare-btn" @click.stop="handlePrepare(chapter)">继续备课</button>
              <button class="action-btn start-btn" @click.stop="handleStartClass(chapter)">开始上课</button>
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
            <!-- 课件 -->
            <div class="resource-section">
              <div class="section-header" @click="expandedSections.courseware = !expandedSections.courseware">
                <svg class="arrow-icon" :class="{ expanded: expandedSections.courseware }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span>课件({{ resources.courseware.length }})</span>
              </div>
              <div v-if="expandedSections.courseware" class="section-content">
                <div class="resource-grid">
                  <div v-for="item in resources.courseware" :key="item.id" class="resource-item" @click="openDocument(item)">
                    <div class="resource-icon" :class="getFileIconClass(item.type)">
                      <span>{{ getFileIconText(item.type) }}</span>
                    </div>
                    <span class="resource-name">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 教师程序 -->
            <div class="resource-section">
              <div class="section-header" @click="expandedSections.program = !expandedSections.program">
                <svg class="arrow-icon" :class="{ expanded: expandedSections.program }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span>教师程序({{ resources.program.length }})</span>
              </div>
              <div v-if="expandedSections.program" class="section-content">
                <div class="resource-grid">
                  <div v-for="item in resources.program" :key="item.id" class="resource-item" @click="openDocument(item)">
                    <div class="resource-icon" :class="getFileIconClass(item.type)">
                      <span>{{ getFileIconText(item.type) }}</span>
                    </div>
                    <span class="resource-name">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 学生手册 -->
            <div class="resource-section">
              <div class="section-header" @click="expandedSections.handbook = !expandedSections.handbook">
                <svg class="arrow-icon" :class="{ expanded: expandedSections.handbook }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span>学生手册({{ resources.handbook.length }})</span>
              </div>
              <div v-if="expandedSections.handbook" class="section-content">
                <div class="resource-grid">
                  <div v-for="item in resources.handbook" :key="item.id" class="resource-item" @click="openDocument(item)">
                    <div class="resource-icon" :class="getFileIconClass(item.type)">
                      <span>{{ getFileIconText(item.type) }}</span>
                    </div>
                    <span class="resource-name">{{ item.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="activeTab === 'design'" class="empty-state">暂无内容</div>
          <div v-else-if="activeTab === 'task'" class="empty-state">暂无内容</div>
          <div v-else class="empty-state">暂无内容</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import gsap from 'gsap'
import { cursorAdmin } from '~/composables/api/curosr'

definePageMeta({ layout: 'default' })

const route = useRoute()
const { getCursorDetail } = cursorAdmin()
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
          name: c.chapterName || `章节${idx + 1}`
        }))
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
const chapters = ref<{ id: number; name: string }[]>([])
const activeChapter = ref(1)
const tabs = [
  { label: '教学资源', value: 'resource' },
  { label: '学习任务', value: 'task' },
  { label: '个人资源', value: 'personal' }
]
const activeTab = ref('resource')

// 资源数据
const resources = reactive({
  courseware: [
    { id: 1, name: '主题01-"悟空"来了（课件）V1.5.pptx', type: 'ppt', url: '' }
  ],
  program: [
    { id: 2, name: '1-1参考程序.ucd', type: 'ucd', url: '' },
    { id: 3, name: '1-2参考程序.ucd', type: 'ucd', url: '' }
  ],
  handbook: [
    { id: 4, name: '主题01-"悟空"来了（学生手册）V1.5.docx', type: 'word', url: 'http://192.168.0.30:9000/mata/2025/12/22/8e3ceba623c64d32bcced390d35e9832.docx' },
    { id: 5, name: '测试PDF文档.pdf', type: 'pdf', url: 'http://192.168.0.30:9000/mata/2025/12/22/e98407271692446da69888b8068c0bfc.pdf' }
  ]
})
const expandedSections = reactive({ courseware: true, program: true, handbook: true })

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

// 章节操作
const handlePrepare = (chapter: { id: number; name: string }) => {
  navigateTo(`/system/course/prepare/${route.params.id}?chapterId=${chapter.id}`)
}

const handleStartClass = (chapter: { id: number; name: string }) => {
  console.log('开始上课:', chapter)
}

// 打开资源 - 跳转到备课页面
const openDocument = (item: { id: number; name: string; type: string; url?: string }) => {
  // 跳转到备课页面，带上资源信息
  navigateTo(`/system/course/prepare/${route.params.id}?resourceId=${item.id}&resourceUrl=${encodeURIComponent(item.url || '')}&resourceName=${encodeURIComponent(item.name)}&resourceType=${item.type}`)
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
  z-index: 100;
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
.chapter-item:hover { background: #E6F4FF; color: #1890FF; }
.chapter-item.active { background: #E6F4FF; color: #1890FF; border-left-color: #1890FF; }
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
  border: 1px solid #1890FF; 
  color: #1890FF; 
}
.prepare-btn:hover { background: #E6F4FF; }
.start-btn { 
  background: #1890FF; 
  border: 1px solid #1890FF; 
  color: white; 
}
.start-btn:hover { background: #40A9FF; border-color: #40A9FF; }

.content-area { flex: 1; padding: 20px; }
.tab-header { display: flex; gap: 8px; margin-bottom: 20px; }
.tab-btn { padding: 8px 20px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; color: #666; background: white; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { border-color: #FF9900; color: #FF9900; }
.tab-btn.active { background: #FF9900; border-color: #FF9900; color: white; }

.tab-content { min-height: 300px; }
.resource-section { margin-bottom: 16px; }
.section-header { display: flex; align-items: center; gap: 8px; padding: 10px 0; font-size: 14px; color: #333; cursor: pointer; }
.section-header:hover { color: #1890FF; }
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
.resource-item:hover { background: #E6F4FF; }
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
