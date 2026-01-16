<template>
  <div class="ai-center-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('ai.pageTitle') }}</h1>
      <button class="material-btn" @click="goToMaterial">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        {{ $t('ai.myMaterial') }}
      </button>
    </div>

    <!-- 内容区 -->
    <div class="content-area">
      <!-- AIGC 区块 -->
      <div class="section">
        <div class="section-header">
          <img :src="ai1Icon" class="section-icon" alt="" />
          <span class="section-name">{{ $t('ai.aigc') }}</span>
          <span class="section-desc">{{ $t('ai.aigcDesc') }}</span>
        </div>
        <div class="card-slider">
          <button v-if="arrowState.aigc.left" class="slider-arrow slider-arrow-left" @click="scrollLeftFn('aigc')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="card-grid-scroll" ref="aigcList" @scroll="handleScroll('aigc')">
            <div class="ai-card" v-for="item in aigcItems" :key="item.key" @click="handleCardClick(item)">
              <div class="card-cover"></div>
              <div class="card-name">{{ $t(item.label) }}</div>
            </div>
          </div>
          <button v-if="arrowState.aigc.right" class="slider-arrow slider-arrow-right" @click="scrollRightFn('aigc')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 视觉智能 区块 -->
      <div class="section">
        <div class="section-header">
          <img :src="ai2Icon" class="section-icon" alt="" />
          <span class="section-name">{{ $t('ai.vision') }}</span>
          <span class="section-desc">{{ $t('ai.visionDesc') }}</span>
        </div>
        <div class="card-slider">
          <button v-if="arrowState.vision.left" class="slider-arrow slider-arrow-left" @click="scrollLeftFn('vision')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="card-grid-scroll" ref="visionList" @scroll="handleScroll('vision')">
            <div class="ai-card" v-for="item in visionItems" :key="item.key" @click="handleCardClick(item)">
              <div class="card-cover"></div>
              <div class="card-name">{{ $t(item.label) }}</div>
            </div>
          </div>
          <button v-if="arrowState.vision.right" class="slider-arrow slider-arrow-right" @click="scrollRightFn('vision')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 语言智能 区块 -->
      <div class="section">
        <div class="section-header">
          <img :src="ai3Icon" class="section-icon" alt="" />
          <span class="section-name">{{ $t('ai.language') }}</span>
          <span class="section-desc">{{ $t('ai.languageDesc') }}</span>
        </div>
        <div class="card-slider">
          <button v-if="arrowState.language.left" class="slider-arrow slider-arrow-left" @click="scrollLeftFn('language')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="card-grid-scroll" ref="languageList" @scroll="handleScroll('language')">
            <div class="ai-card" v-for="item in languageItems" :key="item.key" @click="handleCardClick(item)">
              <div class="card-cover"></div>
              <div class="card-name">{{ $t(item.label) }}</div>
            </div>
          </div>
          <button v-if="arrowState.language.right" class="slider-arrow slider-arrow-right" @click="scrollRightFn('language')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 行为与动作识别 区块 -->
      <div class="section section-highlight">
        <div class="section-header">
          <img :src="ai4Icon" class="section-icon" alt="" />
          <span class="section-name">{{ $t('ai.behavior') }}</span>
          <span class="section-desc">{{ $t('ai.behaviorDesc') }}</span>
        </div>
        <div class="card-slider">
          <button v-if="arrowState.behavior.left" class="slider-arrow slider-arrow-left" @click="scrollLeftFn('behavior')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="card-grid-scroll" ref="behaviorList" @scroll="handleScroll('behavior')">
            <div class="ai-card" v-for="item in behaviorItems" :key="item.key" @click="handleCardClick(item)">
              <div class="card-cover"></div>
              <div class="card-name">{{ $t(item.label) }}</div>
            </div>
          </div>
          <button v-if="arrowState.behavior.right" class="slider-arrow slider-arrow-right" @click="scrollRightFn('behavior')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 机器学习 区块 -->
      <div class="section section-highlight">
        <div class="section-header">
          <img :src="ai5Icon" class="section-icon" alt="" />
          <span class="section-name">{{ $t('ai.ml') }}</span>
          <span class="section-desc">{{ $t('ai.mlDesc') }}</span>
        </div>
        <div class="card-slider">
          <button v-if="arrowState.ml.left" class="slider-arrow slider-arrow-left" @click="scrollLeftFn('ml')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="card-grid-scroll" ref="mlList" @scroll="handleScroll('ml')">
            <div class="ai-card" v-for="item in mlItems" :key="item.key" @click="handleCardClick(item)">
              <div class="card-cover"></div>
              <div class="card-name">{{ $t(item.label) }}</div>
            </div>
          </div>
          <button v-if="arrowState.ml.right" class="slider-arrow slider-arrow-right" @click="scrollRightFn('ml')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'

import ai1Icon from '~/assets/images/ai1.png'
import ai2Icon from '~/assets/images/ai2.png'
import ai3Icon from '~/assets/images/ai3.png'
import ai4Icon from '~/assets/images/ai4.png'
import ai5Icon from '~/assets/images/ai5.png'

definePageMeta({
  layout: 'sidebar'
})

const router = useRouter()

// AIGC 数据
const aigcItems = ref([
  { key: 'aiPainting', label: 'ai.aiPainting' },
  { key: 'aiStory', label: 'ai.aiStory' },
  { key: 'aiSong', label: 'ai.aiSong' },
  { key: 'aiVideo', label: 'ai.aiVideo' },
])

// 视觉智能 数据
const visionItems = ref([
  { key: 'faceRecognition', label: 'ai.faceRecognition' },
  { key: 'imageRecognition', label: 'ai.imageRecognition' },
  { key: 'imageClassification', label: 'ai.imageClassification' },
  { key: 'handwrittenDigit', label: 'ai.handwrittenDigit' },
  { key: 'doodleRecognition', label: 'ai.doodleRecognition' },
])

// 语言智能 数据
const languageItems = ref([
  { key: 'voiceClassification', label: 'ai.voiceClassification' },
  { key: 'speechSynthesis', label: 'ai.speechSynthesis' },
  { key: 'smartQA', label: 'ai.smartQA' },
  { key: 'speechTranscription', label: 'ai.speechTranscription' },
  { key: 'speechTranscriptionPrinciple', label: 'ai.speechTranscriptionPrinciple' },
])

// 行为与动作识别 数据
const behaviorItems = ref([
  { key: 'poseRecognition', label: 'ai.poseRecognition' },
  { key: 'gestureRecognition', label: 'ai.gestureRecognition' },
  { key: 'poseClassification', label: 'ai.poseClassification' },
  { key: 'gestureClassification', label: 'ai.gestureClassification' },
  { key: 'emotionRecognition', label: 'ai.emotionRecognition' },
])

// 机器学习 数据
const mlItems = ref([
  { key: 'mlProcess', label: 'ai.mlProcess' },
  { key: 'decisionTree', label: 'ai.decisionTree' },
  { key: 'bigData', label: 'ai.bigData' },
])

// 滑动相关
const aigcList = ref<HTMLElement | null>(null)
const visionList = ref<HTMLElement | null>(null)
const languageList = ref<HTMLElement | null>(null)
const behaviorList = ref<HTMLElement | null>(null)
const mlList = ref<HTMLElement | null>(null)

// 箭头显示状态
const arrowState = ref({
  aigc: { left: false, right: false },
  vision: { left: false, right: false },
  language: { left: false, right: false },
  behavior: { left: false, right: false },
  ml: { left: false, right: false },
})

// 更新箭头状态
const updateArrowState = (type: string, el: HTMLElement | null) => {
  if (!el) return
  const { scrollLeft, scrollWidth, clientWidth } = el
  const canScrollLeft = scrollLeft > 5
  const canScrollRight = scrollLeft + clientWidth < scrollWidth - 5
  arrowState.value[type as keyof typeof arrowState.value] = {
    left: canScrollLeft,
    right: canScrollRight
  }
}

// 检查所有区块的箭头状态
const checkAllArrows = () => {
  updateArrowState('aigc', aigcList.value)
  updateArrowState('vision', visionList.value)
  updateArrowState('language', languageList.value)
  updateArrowState('behavior', behaviorList.value)
  updateArrowState('ml', mlList.value)
}

// 获取列表元素
const getListEl = (type: string): HTMLElement | null => {
  const listMap: Record<string, HTMLElement | null> = {
    aigc: aigcList.value,
    vision: visionList.value,
    language: languageList.value,
    behavior: behaviorList.value,
    ml: mlList.value
  }
  return listMap[type] || null
}

// 滚动事件处理
const handleScroll = (type: string) => {
  updateArrowState(type, getListEl(type))
}

const scrollLeftFn = (type: string) => {
  const list = getListEl(type)
  if (list) {
    list.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

const scrollRightFn = (type: string) => {
  const list = getListEl(type)
  if (list) {
    list.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

const goToMaterial = () => {
  router.push('/system/ai/material')
}

const handleCardClick = (item: { key: string; label: string }) => {
  console.log('点击卡片:', item.key)
}

onMounted(() => {
  nextTick(() => {
    checkAllArrows()
  })
  window.addEventListener('resize', checkAllArrows)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkAllArrows)
})
</script>

<style scoped>
.ai-center-page {
  height: calc(100vh - 70px);
  background: #F5F5F5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 30px;
  background: #F5F5F5;
  flex-shrink: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.material-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  color: #666;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.material-btn:hover {
  border-color: #FF9900;
  color: #FF9900;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 30px 30px;
}

.section {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.section-highlight {
  background: #FFFBF5;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-icon {
  width: 24px;
  height: 24px;
}

.section-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.section-desc {
  font-size: 12px;
  color: #999;
}

.card-grid {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.card-grid::-webkit-scrollbar {
  display: none;
}

.card-slider {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-grid-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  flex: 1;
}

.card-grid-scroll::-webkit-scrollbar {
  display: none;
}

.slider-arrow {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 1px solid #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.slider-arrow:hover {
  border-color: #FF9900;
  color: #FF9900;
}

.slider-arrow-left {
  margin-right: 8px;
}

.slider-arrow-right {
  margin-left: 8px;
}

.ai-card {
  flex: 0 0 207px;
  min-width: 207px;
  cursor: pointer;
  transition: transform 0.2s;
}

.ai-card:hover {
  transform: translateY(-4px);
}

.card-cover {
  width: 100%;
  aspect-ratio: 4/3;
  background: linear-gradient(135deg, #7FDBDA 0%, #B8E994 100%);
  border-radius: 16px 16px 0 0;
  margin-bottom: 10px;
}

.card-name {
  font-size: 14px;
  color: #333;
  text-align: center;
}

/* 响应式 */
@media (max-width: 1400px) {
  .ai-card {
    flex: 0 0 180px;
    width: 180px;
  }
}

@media (max-width: 1100px) {
  .ai-card {
    flex: 0 0 160px;
    width: 160px;
  }
  .section-desc {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px 20px;
  }
  .content-area {
    padding: 0 20px 20px;
  }
  .ai-card {
    flex: 0 0 140px;
    width: 140px;
  }
}
</style>
