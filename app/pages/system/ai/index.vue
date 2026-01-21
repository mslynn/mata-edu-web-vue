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
      <!-- AIGC 区块 (已移除内容，暂隐藏) -->
      <div class="section" v-if="aigcItems.length > 0">
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
              <div class="card-cover-wrapper">
                <img v-if="item.cover" :src="item.cover" class="card-cover" alt="" />
                <div v-else class="card-cover card-cover-default"></div>
                <!-- 即将上线 提示 -->
                <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                  <div class="cs-content">
                    <span class="cs-rocket">🚀</span>
                    <span class="cs-text">{{ $t('ai.comingSoon') }}</span>
                  </div>
                </div>
                <!-- 遮罩层 -->
                <div v-if="item.desc" class="card-hover-overlay">
                  <p class="hover-desc">{{ $t(item.desc || '') }}</p>
                  <button class="hover-btn" @click.stop="handleCardClick(item)">{{ $t('ai.use') }}</button>
                </div>
              </div>
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
              <div class="card-cover-wrapper">
                <img v-if="item.cover" :src="item.cover" class="card-cover" alt="" />
                <div v-else class="card-cover card-cover-default"></div>
                <!-- 即将上线 提示 -->
                <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                  <div class="cs-content">
                    <span class="cs-rocket">🚀</span>
                    <span class="cs-text">{{ $t('ai.comingSoon') }}</span>
                  </div>
                </div>
                <div v-if="item.desc" class="card-hover-overlay">
                  <p class="hover-desc">{{ $t(item.desc || '') }}</p>
                  <button class="hover-btn" @click.stop="handleCardClick(item)">{{ $t('ai.use') }}</button>
                </div>
              </div>
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
              <div class="card-cover-wrapper">
                <img v-if="item.cover" :src="item.cover" class="card-cover" alt="" />
                <div v-else class="card-cover card-cover-default"></div>
                <!-- 即将上线 提示 -->
                <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                  <div class="cs-content">
                    <span class="cs-rocket">🚀</span>
                    <span class="cs-text">{{ $t('ai.comingSoon') }}</span>
                  </div>
                </div>
                <div v-if="item.desc" class="card-hover-overlay">
                  <p class="hover-desc">{{ $t(item.desc || '') }}</p>
                  <button class="hover-btn" @click.stop="handleCardClick(item)">{{ $t('ai.use') }}</button>
                </div>
              </div>
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
              <div class="card-cover-wrapper">
                <img v-if="item.cover" :src="item.cover" class="card-cover" alt="" />
                <div v-else class="card-cover card-cover-default"></div>
                <!-- 即将上线 提示 -->
                <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                  <div class="cs-content">
                    <span class="cs-rocket">🚀</span>
                    <span class="cs-text">{{ $t('ai.comingSoon') }}</span>
                  </div>
                </div>
                <div v-if="item.desc" class="card-hover-overlay">
                  <p class="hover-desc">{{ $t(item.desc || '') }}</p>
                  <button class="hover-btn" @click.stop="handleCardClick(item)">{{ $t('ai.use') }}</button>
                </div>
              </div>
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
              <div class="card-cover-wrapper">
                <img v-if="item.cover" :src="item.cover" class="card-cover" alt="" />
                <div v-else class="card-cover card-cover-default"></div>
                <!-- 即将上线 提示 -->
                <div v-if="isComingSoon(item)" class="coming-soon-overlay">
                  <div class="cs-content">
                    <span class="cs-rocket">🚀</span>
                    <span class="cs-text">{{ $t('ai.comingSoon') }}</span>
                  </div>
                </div>
                <div v-if="item.desc" class="card-hover-overlay">
                  <p class="hover-desc">{{ $t(item.desc || '') }}</p>
                  <button class="hover-btn" @click.stop="handleCardClick(item)">{{ $t('ai.use') }}</button>
                </div>
              </div>
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


    <!-- 新建模型弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span class="modal-title">{{ $t('ai.newModelTitle', { name: currentModel ? $t(currentModel.label) : '' }) }}</span>
          <button class="close-btn" @click="closeModal">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 1l12 12M13 1l-12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <label class="form-label">{{ $t('ai.modelName') }}</label>
            <input v-model="modelName" type="text" class="form-input" :placeholder="$t('ai.inputModelName')" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-confirm" @click="handleConfirm">{{ $t('common.confirm') }}</button>
          <button class="btn-cancel" @click="closeModal">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>

    <!-- Iframe 弹窗 -->
    <div v-if="showIframeModal" class="iframe-modal">
      <div class="iframe-header">
        <span class="iframe-title">{{ currentModel ? $t(currentModel.label) : '' }} - {{ modelName }}</span>
        <button class="close-btn" @click="closeIframeModal">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 1l12 12M13 1l-12 12"/>
          </svg>
        </button>
      </div>
      <div class="iframe-content">
        <div v-if="iframeLoading" class="loading-state">{{ $t('common.loading') }}</div>
        <iframe :src="currentIframeUrl" class="iframe-view" allow="camera; microphone" @load="onIframeLoad"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

import ai1Icon from '~/assets/images/ai1.png'
import ai2Icon from '~/assets/images/ai2.png'
import ai3Icon from '~/assets/images/ai3.png'
import ai4Icon from '~/assets/images/ai4.png'
import ai5Icon from '~/assets/images/ai5.png'

// AIGC 卡片封面图
import aigcCover1 from '~/assets/images/1.svg'
import aigcCover2 from '~/assets/images/2.svg'
import aigcCover3 from '~/assets/images/3.svg'
import aigcCover4 from '~/assets/images/4.svg'

definePageMeta({
  layout: 'sidebar'
})

const router = useRouter()
const { locale, t } = useI18n()

interface AICardItem {
  key: string
  label: string
  desc?: string
  cover?: string
}

const aigcItems = ref<AICardItem[]>([
  { key: 'aiPainting', label: 'ai.aiPainting' },
  { key: 'aiStory', label: 'ai.aiStory' },
  { key: 'aiSong', label: 'ai.aiSong' },
  { key: 'aiVideo', label: 'ai.aiVideo' },
])

// 视觉智能 数据
const visionItems = ref<AICardItem[]>([
    { key: 'imageClassModel', label: 'ai.imageClassModel', desc: 'ai.imageClassModelDesc', cover: aigcCover1 },
  { key: 'faceRecognition', label: 'ai.faceRecognition' },
  { key: 'imageRecognition', label: 'ai.imageRecognition' },

  { key: 'handwrittenDigit', label: 'ai.handwrittenDigit' },
  { key: 'doodleRecognition', label: 'ai.doodleRecognition' },
])

// 语言智能 数据
const languageItems = ref<AICardItem[]>([
  { key: 'voiceClassModel', label: 'ai.voiceClassModel', desc: 'ai.voiceClassModelDesc', cover: aigcCover3 },
  { key: 'speechSynthesis', label: 'ai.speechSynthesis' },
  { key: 'smartQA', label: 'ai.smartQA' },
  { key: 'speechTranscription', label: 'ai.speechTranscription' },
  { key: 'speechTranscriptionPrinciple', label: 'ai.speechTranscriptionPrinciple' },
])

// 行为与动作识别 数据

const behaviorItems = ref<AICardItem[]>([
    { key: 'poseClassModel', label: 'ai.poseClassModel', desc: 'ai.poseClassModelDesc', cover: aigcCover4 },
  { key: 'gestureClassModel', label: 'ai.gestureClassModel', desc: 'ai.gestureClassModelDesc', cover: aigcCover2 },
  { key: 'poseRecognition', label: 'ai.poseRecognition' },
  { key: 'gestureRecognition', label: 'ai.gestureRecognition' },

  { key: 'emotionRecognition', label: 'ai.emotionRecognition' },
])

// 机器学习 数据
const mlItems = ref<AICardItem[]>([
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

const showModal = ref(false)
const currentModel = ref<AICardItem | null>(null)
const modelName = ref('')

const isComingSoon = (item: AICardItem) => {
  return !['imageClassModel', 'gestureClassModel', 'voiceClassModel', 'poseClassModel'].includes(item.key)
}

const handleCardClick = (item: AICardItem) => {
  if (isComingSoon(item)) return
  
  currentModel.value = item
  modelName.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  currentModel.value = null
  modelName.value = ''
}

const handleConfirm = () => {
  if (!modelName.value.trim()) return
  
  const token = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJ0b2tlblR5cGVcIjpcImFjY2Vzc190b2tlblwiLFwidXNlcklkXCI6MTE1MzIsXCJ1c2VybmFtZVwiOlwiMzI4NzI1Nzk0QHFxLmNvbVwifSIsImV4cCI6MTc3MDQzODM0MSwiaWF0IjoxNzY3ODQ2MzQxNDU0LCJqdGkiOiI0YzBmYWQ1ZC1mYjVjLTRjMTMtOTUwNi1kOGVlOGI0YWUzMTAifQ.MKTjQtiuXvbl1TDvp3AF8j0qllvMX-Hr6wwqjkzKW3LpUlM7A882MhYX78l2DoqrxrRPQ1gAzm8uZ_anCgzlrg'
  const typeMap: Record<string, number> = {
    'imageClassModel': 1,
    'gestureClassModel': 2,
    'voiceClassModel': 3,
    'poseClassModel': 4
  }
  const type = typeMap[currentModel.value?.key || ''] || 1
  const lang = locale.value === 'zh' ? 'zh' : 'en'
  const url = `https://pre.matatalab.com/?token=${token}&type=${type}&projectName=${modelName.value}&lang=${lang}`
  
  currentIframeUrl.value = url
  // Iframe title uses the modal name input or the model label
  // currentToolName.value = currentModel.value ? t(currentModel.value.label) : '' 
  // User didn't specify title, but let's use the model label.
  
  showIframeModal.value = true
  closeModal()
}

// Iframe 逻辑
const showIframeModal = ref(false)
const currentIframeUrl = ref('')
const iframeLoading = ref(true)

const closeIframeModal = () => {
  showIframeModal.value = false
  currentIframeUrl.value = ''
  iframeLoading.value = true
}

const onIframeLoad = () => {
  iframeLoading.value = false
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
  border-radius: 12px;
  padding: 24px 30px;
  margin-bottom: 24px;
  border: 1px solid #F0F0F0;
}

.section-highlight {
  background: #FFFBF5;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  width: 22px;
  height: 22px;
}

.section-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-desc {
  font-size: 13px;
  color: #999;
  font-weight: normal;
  margin-left: 4px;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #EDEDED;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.ai-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.08);
  border-color: #FF9900;
}

.card-cover {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
}

.card-cover-default {
  background: linear-gradient(135deg, #7FDBDA 0%, #B8E994 100%);
  aspect-ratio: 4/3;
}

.card-cover-wrapper {
  position: relative;
  overflow: hidden;
}

/* 悬停遮罩层 */
.card-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  transition: all 0.3s ease;
}

.ai-card:hover .card-hover-overlay {
  opacity: 1;
}

.hover-desc {
  color: white;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
  margin: 0 0 16px 0;
}

.hover-btn {
  background: #FF9900;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.hover-btn:hover {
  background: #E68A00;
  transform: scale(1.05);
}

.card-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
  padding: 14px 8px;
  border-top: 1px solid #F0F0F0;
  background: white;
  transition: color 0.3s;
}

.ai-card:hover .card-name {
  color: #FF9900;
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

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 480px;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease;
}

.modal-header {
  background: #FF9900; /* 主题色 */
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
  display: flex;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 40px 48px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  color: #333;
  width: 40px;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  height: 40px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #FF9900;
}

.modal-footer {
  padding: 20px 48px 40px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-confirm {
  background: #FF9900;
  color: white;
  border: none;
  border-radius: 4px;
  width: 120px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background: #E68A00;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  width: 120px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #999;
  color: #333;
}

/* 即将上线卡片样式 */
.coming-soon-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.cs-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cs-rocket {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.cs-text {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  letter-spacing: 1px;
}

.ai-card:hover .coming-soon-overlay {
  background: rgba(255, 255, 255, 0.2);
}

/* Iframe 弹窗样式 */
.iframe-modal {
  position: fixed;
  inset: 0;
  background: white;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.iframe-header {
  height: 50px;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  color: white;
  flex-shrink: 0;
}

.iframe-title {
  font-size: 16px;
  font-weight: 500;
}

.iframe-content {
  flex: 1;
  position: relative;
  background: #f5f5f5;
}

.iframe-view {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.loading-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  background: #f5f5f5;
}
</style>
