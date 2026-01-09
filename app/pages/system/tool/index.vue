<template>
  <div class="tool-center-page">
    <div class="tool-grid">
      <div v-for="tool in toolList" :key="tool.id" class="tool-card">
        <div class="tool-header">
          <div class="tool-icon">
            <img :src="tool.icon" :alt="tool.name" />
          </div>
          <div class="tool-info">
            <h3 class="tool-title">{{ t(tool.titleKey) }}</h3>
            <p class="tool-desc">{{ t(tool.descKey) }}</p>
          </div>
        </div>
        <div class="tool-footer">
          <div class="tool-name" v-html="tool.name"></div>
          <div class="tool-actions">
            <MButton v-if="tool.hasCreate" size="small" class="primary-btn" @click="handleCreate(tool)">
              {{ t('tool.startCreate') }}
            </MButton>
            <MButton v-if="tool.hasMobile" size="small" class="outline-btn" @click="handleDownloadMobile(tool)">
              {{ t('tool.downloadMobile') }}
            </MButton>
            <MButton v-if="tool.hasDesktop" size="small" class="outline-btn" @click="handleDownloadDesktop(tool)">
              {{ t('tool.downloadDesktop') }}
            </MButton>
          </div>
        </div>
      </div>
    </div>

    <!-- iframe 弹窗 -->
    <div v-if="showIframeModal" class="iframe-modal-overlay" @click.self="closeIframeModal">
      <div class="iframe-modal-container">
        <div class="iframe-modal-header">
          <span class="iframe-modal-title">{{ currentToolName }}</span>
          <button class="iframe-close-btn" @click="closeIframeModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="iframe-modal-body">
          <!-- Loading 状态 -->
          <div v-if="iframeLoading" class="iframe-loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">{{ t('common.loading') }}</span>
          </div>
          <iframe 
            :src="currentIframeUrl" 
            class="tool-iframe" 
            :class="{ hidden: iframeLoading }"
            frameborder="0" 
            allowfullscreen
            @load="onIframeLoad"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'sidebar'
})

const { t } = useI18n()

interface Tool {
  id: string
  name: string
  icon: string
  titleKey: string
  descKey: string
  hasCreate: boolean
  hasMobile: boolean
  hasDesktop: boolean
  createUrl?: string
  mobileUrl?: string
  desktopUrl?: string
}

// Mock 数据
const toolList: Tool[] = [
  {
    id: 'vincibot',
    name: 'MatataCode<br/>(VinciBot)',
    icon: '/images/tool-vincibot.png',
    titleKey: 'tool.vincibot.title',
    descKey: 'tool.vincibot.desc',
    hasCreate: true,
    hasMobile: true,
    hasDesktop: true,
    createUrl: 'https://vinci.matatastudio.com/',
    mobileUrl: 'https://example.com/vincibot/mobile',
    desktopUrl: 'https://example.com/vincibot/desktop'
  },
  {
    id: 'nous',
    name: 'MatataCode<br/>(Nous)',
    icon: '/images/tool-nous.png',
    titleKey: 'tool.nous.title',
    descKey: 'tool.nous.desc',
    hasCreate: true,
    hasMobile: true,
    hasDesktop: true,
    createUrl: 'https://nous.matatastudio.com/',
    mobileUrl: 'https://example.com/nous/mobile',
    desktopUrl: 'https://example.com/nous/desktop'
  },
  {
    id: 'matatacode',
    name: 'MatataCode',
    icon: '/images/tool-matatacode.png',
    titleKey: 'tool.matatacode.title',
    descKey: 'tool.matatacode.desc',
    hasCreate: false,
    hasMobile: true,
    hasDesktop: false,
    mobileUrl: 'https://example.com/matatacode/mobile'
  },
  {
    id: 'talemap',
    name: 'MatataCode<br/>(TaleMap)',
    icon: '/images/tool-talemap.png',
    titleKey: 'tool.talemap.title',
    descKey: 'tool.talemap.desc',
    hasCreate: false,
    hasMobile: false,
    hasDesktop: true,
    desktopUrl: 'https://example.com/talemap/desktop'
  },
  {
    id: 'matataxplore',
    name: 'MatataXplore',
    icon: '/images/tool-matataxplore.png',
    titleKey: 'tool.matataxplore.title',
    descKey: 'tool.matataxplore.desc',
    hasCreate: false,
    hasMobile: true,
    hasDesktop: true,
    mobileUrl: 'https://example.com/matataxplore/mobile',
    desktopUrl: 'https://example.com/matataxplore/desktop'
  }
]

// iframe 弹窗状态
const showIframeModal = ref(false)
const currentIframeUrl = ref('')
const currentToolName = ref('')
const iframeLoading = ref(true)

// 开始创作 - 打开 iframe 弹窗
const handleCreate = (tool: Tool) => {
  if (tool.createUrl) {
    currentIframeUrl.value = tool.createUrl
    currentToolName.value = tool.name.replace('<br/>', ' ')
    iframeLoading.value = true
    showIframeModal.value = true
  }
}

// iframe 加载完成
const onIframeLoad = () => {
  iframeLoading.value = false
}

// 关闭 iframe 弹窗
const closeIframeModal = () => {
  showIframeModal.value = false
  currentIframeUrl.value = ''
  currentToolName.value = ''
  iframeLoading.value = true
}

// 下载移动端
const handleDownloadMobile = (tool: Tool) => {
  if (tool.mobileUrl) {
    window.open(tool.mobileUrl, '_blank')
  }
}

// 下载桌面端
const handleDownloadDesktop = (tool: Tool) => {
  if (tool.desktopUrl) {
    window.open(tool.desktopUrl, '_blank')
  }
}
</script>

<style scoped>
.tool-center-page {
  padding: 24px;
  min-height: calc(100vh - 70px);
  background: #F5F5F5;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.tool-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 240px;
}

.tool-header {
  display: flex;
  gap: 16px;
  flex: 1;
}

.tool-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  flex-shrink: 0;
  overflow: hidden;
  background: #f5f5f5;
}

.tool-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.5;
}

.tool-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 12px;
}

.tool-name {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.tool-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.primary-btn {
  background: #FF9900 !important;
  color: white !important;
  border: none !important;
  border-radius: 20px !important;
  padding: 6px 14px !important;
  font-size: 12px !important;
}

.primary-btn:hover {
  background: #E68A00 !important;
}

.outline-btn {
  background: white !important;
  color: #FF9900 !important;
  border: 1px solid #FF9900 !important;
  border-radius: 20px !important;
  padding: 6px 14px !important;
  font-size: 12px !important;
}

.outline-btn:hover {
  background: #FFF9F0 !important;
}

/* 响应式 */
@media (max-width: 1400px) {
  .tool-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .tool-grid {
    grid-template-columns: 1fr;
  }
}

/* iframe 弹窗样式 */
.iframe-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.iframe-modal-container {
  width: 95vw;
  height: 90vh;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.iframe-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E5E5;
  background: #FAFAFA;
}

.iframe-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.iframe-close-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.iframe-close-btn:hover {
  background: #F0F0F0;
  color: #666;
}

.iframe-modal-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.tool-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.tool-iframe.hidden {
  opacity: 0;
  position: absolute;
}

/* Loading 样式 */
.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #F0F0F0;
  border-top-color: #FF9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #666;
}
</style>
