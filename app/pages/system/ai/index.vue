<template>
  <div class="ai-center-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">你身边的 AI 学习与创作工具箱</h1>
      <MButton size="small" class="material-btn" @click="goToMaterial">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        我的素材库
      </MButton>
    </div>

    <!-- AIGC 区块 -->
    <div class="content-area">
      <div class="section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-icon aigc">AI</span>
            <span class="section-name">AIGC</span>
            <span class="section-desc">利用人工智能模型自动生成文本、图像、音频和视频等内容，激发创意的内容生产方式</span>
          </div>
        </div>
        <div class="card-slider">
          <button class="slider-arrow left" @click="scrollLeft('aigc')" :class="{ hidden: !aigcCanScrollLeft }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="card-list" ref="aigcList" @scroll="updateAigcScroll">
            <div class="ai-card" v-for="item in aigcItems" :key="item.name">
              <div class="card-cover">
                <span class="cover-text">封面图尝试AI生成</span>
              </div>
              <div class="card-name">{{ item.name }}</div>
            </div>
          </div>
          <button class="slider-arrow right" @click="scrollRight('aigc')" :class="{ hidden: !aigcCanScrollRight }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

    <!-- 视觉智能 区块 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon vision">👁</span>
          <span class="section-name">视觉智能</span>
          <span class="section-desc">通过图像识别、目标检测、场景分析等技术，让计算机具备"看懂世界"的能力</span>
        </div>
      </div>
      <div class="card-slider">
        <button class="slider-arrow left" @click="scrollLeft('vision')" :class="{ hidden: !visionCanScrollLeft }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="card-list" ref="visionList" @scroll="updateVisionScroll">
          <div class="ai-card" v-for="item in visionItems" :key="item.name">
            <div class="card-cover">
              <span class="cover-text">封面图尝试AI生成</span>
            </div>
            <div class="card-name">{{ item.name }}</div>
          </div>
        </div>
        <button class="slider-arrow right" @click="scrollRight('vision')" :class="{ hidden: !visionCanScrollRight }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 语言智能 区块 -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon language">💬</span>
          <span class="section-name">语言智能</span>
          <span class="section-desc">通过语音识别、文本理解与生成等技术，让机器能够"听得懂、说得出、读得会"</span>
        </div>
      </div>
      <div class="card-slider">
        <button class="slider-arrow left" @click="scrollLeft('language')" :class="{ hidden: !languageCanScrollLeft }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="card-list" ref="languageList" @scroll="updateLanguageScroll">
          <div class="ai-card" v-for="item in languageItems" :key="item.name">
            <div class="card-cover">
              <span class="cover-text">封面图尝试AI生成</span>
            </div>
            <div class="card-name">{{ item.name }}</div>
          </div>
        </div>
        <button class="slider-arrow right" @click="scrollRight('language')" :class="{ hidden: !languageCanScrollRight }">
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
import { ref, onMounted, nextTick } from 'vue'

definePageMeta({
  layout: 'sidebar'
})

const router = useRouter()

// AIGC 数据
const aigcItems = ref([
  { name: 'AI画图' },
  { name: 'AI讲故事' },
  { name: 'AI歌曲创作' },
  { name: 'AI动画视频' },
  { name: 'AI写作助手' },
  { name: 'AI配音' },
])

// 视觉智能 数据
const visionItems = ref([
  { name: '人脸识别' },
  { name: '图像识别' },
  { name: '图像分类训练' },
  { name: '手写数字识别' },
  { name: '物体检测' },
  { name: '姿态识别' },
])

// 语言智能 数据
const languageItems = ref([
  { name: '语音识别' },
  { name: '语音合成' },
  { name: '文本翻译' },
  { name: '情感分析' },
  { name: '智能问答' },
  { name: '文本摘要' },
])

// 滑动相关
const aigcList = ref<HTMLElement | null>(null)
const visionList = ref<HTMLElement | null>(null)
const languageList = ref<HTMLElement | null>(null)

const aigcCanScrollLeft = ref(false)
const aigcCanScrollRight = ref(false)
const visionCanScrollLeft = ref(false)
const visionCanScrollRight = ref(false)
const languageCanScrollLeft = ref(false)
const languageCanScrollRight = ref(false)

const updateAigcScroll = () => {
  if (!aigcList.value) return
  const { scrollLeft, scrollWidth, clientWidth } = aigcList.value
  aigcCanScrollLeft.value = scrollLeft > 0
  aigcCanScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10
}

const updateVisionScroll = () => {
  if (!visionList.value) return
  const { scrollLeft, scrollWidth, clientWidth } = visionList.value
  visionCanScrollLeft.value = scrollLeft > 0
  visionCanScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10
}

const updateLanguageScroll = () => {
  if (!languageList.value) return
  const { scrollLeft, scrollWidth, clientWidth } = languageList.value
  languageCanScrollLeft.value = scrollLeft > 0
  languageCanScrollRight.value = scrollLeft + clientWidth < scrollWidth - 10
}

const scrollLeft = (type: string) => {
  const list = type === 'aigc' ? aigcList.value : type === 'vision' ? visionList.value : languageList.value
  if (list) {
    list.scrollBy({ left: -300, behavior: 'smooth' })
  }
}

const scrollRight = (type: string) => {
  const list = type === 'aigc' ? aigcList.value : type === 'vision' ? visionList.value : languageList.value
  if (list) {
    list.scrollBy({ left: 300, behavior: 'smooth' })
  }
}

const goToMaterial = () => {
  router.push('/system/ai/material')
}

onMounted(() => {
  nextTick(() => {
    updateAigcScroll()
    updateVisionScroll()
    updateLanguageScroll()
  })
})
</script>

<style scoped>
.ai-center-page {
  height: calc(100vh - 70px);
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #F9F9F9;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 20;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.material-btn {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  background: white !important;
  color: #666 !important;
  border: 1px solid #E5E5E5 !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
  font-size: 13px !important;
}

.material-btn:hover {
  border-color: #FF9900 !important;
  color: #FF9900 !important;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.section-icon.aigc {
  background: #3EAEFF;
  color: white;
}

.section-icon.vision {
  background: #FFF3E0;
  font-size: 14px;
}

.section-icon.language {
  background: #E8F5E9;
  font-size: 14px;
}

.section-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.section-desc {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}

.card-slider {
  position: relative;
  display: flex;
  align-items: center;
}

.slider-arrow {
  position: absolute;
  z-index: 10;
  width: 36px;
  height: 36px;
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

.slider-arrow.left {
  left: 0;
}

.slider-arrow.right {
  right: 0;
}

.slider-arrow.hidden {
  opacity: 0;
  pointer-events: none;
}

.card-list {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 8px 48px;
  -ms-overflow-style: none;
  scrollbar-width: none;
  width: 100%;
}

.card-list::-webkit-scrollbar {
  display: none;
}

.ai-card {
  flex: 0 0 calc(25% - 15px);
  min-width: 180px;
  max-width: 220px;
  cursor: pointer;
  transition: transform 0.2s;
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.ai-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.card-cover {
  width: 100%;
  height: 120px;
  background: #FFF5E6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.cover-text {
  font-size: 12px;
  color: #CC9966;
}

.card-name {
  font-size: 14px;
  color: #333;
  text-align: center;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 1400px) {
  .ai-card {
    flex: 0 0 calc(33.33% - 14px);
  }
}

@media (max-width: 1100px) {
  .ai-card {
    flex: 0 0 calc(50% - 10px);
  }
  
  .section-desc {
    display: none;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
  }
  
  .content-area {
    padding: 0 16px 16px;
  }
  
  .ai-card {
    flex: 0 0 160px;
    min-width: 160px;
  }
  
  .card-cover {
    height: 100px;
  }
  
  .card-list {
    padding: 8px 40px;
  }
}

/* 小高度屏幕 */
@media (max-height: 700px) {
  .page-header {
    padding: 12px 24px;
  }
  
  .section {
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .card-cover {
    height: 90px;
  }
  
  .ai-card {
    padding: 10px;
  }
}
</style>
