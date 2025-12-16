// ===== 优化后的课程详情页组件 =====
// 主要改进：解决闪烁抖动问题，优化性能

<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
definePageMeta({ layout: 'default' })

const route = useRoute()
const isCollapsed = ref(false)
const courseRowRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const pageRef = ref<HTMLElement | null>(null)
const extraInfoRef = ref<HTMLElement | null>(null)
const isAnimating = ref(false)

// 防抖处理的滚动事件 - 避免频繁触发
let scrollTimer: number | null = null
const onScroll = (e: Event) => {
  const target = e.target as HTMLElement
  const top = target.scrollTop
  
  // 清除之前的定时器
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  
  // 设置新的定时器，延迟执行状态更新
  scrollTimer = window.setTimeout(() => {
    isCollapsed.value = top > 15
  }, 50)
}

// 页面加载时确保滚动到顶部，显示放大状态
onMounted(() => {
  if (pageRef.value) {
    pageRef.value.scrollTop = 0
  }
})

// 优化的动画控制 - 解决闪烁抖动问题
watch(isCollapsed, async (collapsed) => {
  if (!courseRowRef.value || !wrapperRef.value || isAnimating.value) return
  
  // 防止重复触发动画
  isAnimating.value = true
  
  try {
    if (collapsed) {
      // 收起状态：先动画缩放，再调整高度
      gsap.to(courseRowRef.value, {
        scale: 1.2,  // 降低缩放比例，减少视觉冲击
        duration: 0.25,
        ease: 'power2.out'
      })
      
      // 额外信息淡出
      if (extraInfoRef.value) {
        gsap.to(extraInfoRef.value, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.out'
        })
      }
      
      // 等待缩放动画完成后再调整容器高度
      setTimeout(() => {
        if (wrapperRef.value) {
          wrapperRef.value.style.height = '120px'
        }
      }, 200)
      
    } else {
      // 展开状态：先调整高度，再动画缩放
      if (wrapperRef.value) {
        wrapperRef.value.style.height = '240px'
      }
      
      // 等待高度调整完成后再缩放
      setTimeout(() => {
        gsap.to(courseRowRef.value, {
          scale: 1.4,  // 降低缩放比例，减少视觉冲击
          duration: 0.25,
          ease: 'power2.out'
        })
        
        // 额外信息淡入
        if (extraInfoRef.value) {
          gsap.to(extraInfoRef.value, {
            opacity: 1,
            duration: 0.2,
            delay: 0.1,
            ease: 'power2.out'
          })
        }
      }, 50)
    }
    
    // 动画完成后重置状态
    setTimeout(() => {
      isAnimating.value = false
    }, 400)
    
  } catch (error) {
    console.error('Animation error:', error)
    isAnimating.value = false
  }
})

const courseInfo = ref({
  id: route.params.id,
  name: 'AI上全能助手',
  units: 15,
  description: '在小学科学课程标准的指导下从真实问题出发，涵科学/技术/工程/艺术/数学等多学科知识和技能为一体，并以国内最先进的人形机器人"悟空"为媒体，结合图形化编程和开源硬件引领人形机器人的教程。'
})
const chapters = ref([
  { id: 1, name: '"悟空"来了' }, { id: 2, name: '"工程师"来了' }, { id: 3, name: '人脸解锁' },
  { id: 4, name: '"悟空"听我的' }, { id: 5, name: '生日快乐' }, { id: 6, name: '垃圾分类' },
  { id: 7, name: '活动课：小小侦探' }, { id: 8, name: '语音风扇' }, { id: 9, name: '智能家门' }, { id: 10, name: '智能感应灯' },
])
const activeChapter = ref(1)
const tabs = [{ label: '教学资源', value: 'resource' }, { label: '学习任务', value: 'task' }, { label: '个人资源', value: 'personal' }]
const activeTab = ref('resource')
const resources = reactive({ courseware: [{ id: 1, name: '主题01-"悟空"来了（教师用书）V1.5.docx' }] })
const expandedSections = reactive({ courseware: true })

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
</script>

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
        <span class="breadcrumb-separator">></span>
        <span class="breadcrumb-current">{{ courseInfo.name }}</span>
      </div>
      <!-- 固定高度的容器 -->
      <div ref="wrapperRef" class="course-row-wrapper" :class="{ collapsed: isCollapsed }">
        <div ref="courseRowRef" class="course-row">
          <div class="cover-box">
            <div class="cover-badge">第二版</div>
            <span class="cover-status">已开通</span>
            <img src="../../assets/images/course.png" alt="封面" class="cover-img" />
          </div>
          <div class="info-box">
            <div class="title-line">
              <h1 class="title">{{ courseInfo.name }}</h1>
              <button class="edit-btn" @click="showEvaluationModal = true">课程测评</button>
            </div>
            <div ref="extraInfoRef" class="extra-info">
              <span class="units">课程单元：{{ courseInfo.units }}单元</span>
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
    <div class="course-main">
      <div class="chapter-sidebar">
        <div class="sidebar-title">章节详情</div>
        <div class="chapter-list">
          <div v-for="(chapter, index) in chapters" :key="chapter.id" class="chapter-item" :class="{ active: activeChapter === chapter.id }" @click="activeChapter = chapter.id">
            主题{{ String(index + 1).padStart(2, '0') }}-{{ chapter.name }}
          </div>
        </div>
      </div>
      <div class="content-area">
        <div class="tab-header">
          <button v-for="tab in tabs" :key="tab.value" class="tab-btn" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">{{ tab.label }}</button>
        </div>
        <div class="tab-content">
          <div v-if="activeTab === 'resource'" class="resource-panel">
            <div class="section-header" @click="expandedSections.courseware = !expandedSections.courseware">
              <svg class="arrow-icon" :class="{ expanded: expandedSections.courseware }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span>教案({{ resources.courseware.length }})</span>
            </div>
            <div v-if="expandedSections.courseware" class="section-content">
              <div v-for="item in resources.courseware" :key="item.id" class="resource-item">
                <div class="resource-icon">W</div>
                <span class="resource-name">{{ item.name }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">暂无内容</div>
        </div>
      </div>
    </div>
  </div>
</template>

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

/* 外层容器 - 优化高度管理 */
.course-row-wrapper {
  height: 240px;
  overflow: visible;
  transition: height 0.25s ease; /* 添加CSS过渡 */
}

/* 内层 - 优化缩放动画 */
.course-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  position: relative;
  transform-origin: top center; /* 改为center定位，减少位移 */
  transform: scale(1.4) translateZ(0); /* 降低缩放比例 */
  will-change: transform, opacity;
  backface-visibility: hidden;
  width: 100%; /* 改为100%宽度，避免复杂计算 */
  max-width: 100%;
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

.chapter-sidebar { width: 220px; border-right: 1px solid #eee; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden; }
.sidebar-title { padding: 16px 20px; font-size: 14px; color: #333; font-weight: 500; border-bottom: 1px solid #eee; flex-shrink: 0; }
.chapter-list { padding: 8px 0; max-height: 500px; overflow-y: auto; }
.chapter-item { padding: 12px 20px; font-size: 13px; color: #666; cursor: pointer; border-left: 3px solid transparent; transition: all 0.2s; }
.chapter-item:hover { background: #FFF7E6; color: #FF9900; }
.chapter-item.active { background: #FFF7E6; color: #FF9900; border-left-color: #FF9900; }

.content-area { flex: 1; padding: 20px; }
.tab-header { display: flex; gap: 8px; margin-bottom: 20px; }
.tab-btn { padding: 8px 20px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; color: #666; background: white; cursor: pointer; transition: all 0.2s; }
.tab-btn:hover { border-color: #FF9900; color: #FF9900; }
.tab-btn.active { background: #FF9900; border-color: #FF9900; color: white; }

.tab-content { min-height: 300px; }
.section-header { display: flex; align-items: center; gap: 8px; padding: 10px 0; font-size: 14px; color: #333; cursor: pointer; }
.section-header:hover { color: #FF9900; }
.arrow-icon { width: 16px; height: 16px; transition: transform 0.2s; }
.arrow-icon.expanded { transform: rotate(90deg); }
.section-content { padding-left: 24px; }
.resource-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #f9f9f9; border-radius: 6px; margin-bottom: 8px; }
.resource-icon { width: 36px; height: 36px; border-radius: 6px; background: #2b5797; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; }
.resource-name { font-size: 13px; color: #333; }
.empty-state { display: flex; align-items: center; justify-content: center; height: 200px; color: #999; }

/* 移动端优化 */
@media (max-width: 768px) {
  .course-row {
    transform: scale(1.2); /* 移动端进一步降低缩放比例 */
  }
  
  .header-section {
    padding: 12px 20px 0;
  }
  
  .course-main {
    margin: 20px 20px 20px;
  }
}
</style>
