<template>
  <div class="tool-center-page">
    <!-- 页面标题 -->
    <h1 class="page-title">{{ t('tool.pageTitle') }}</h1>
    
    <div class="tool-grid">
      <div v-for="tool in toolList" :key="tool.id" class="tool-card">
        <div class="tool-content">
          <!-- 左侧图标和名称 -->
          <div class="tool-left">
            <div class="tool-icon">
              <img :src="tool.icon" :alt="tool.name" />
            </div>
            <div class="tool-name" v-html="tool.name"></div>
          </div>
          <!-- 右侧描述 -->
          <div class="tool-right">
            <p class="tool-desc">{{ t(tool.descKey) }}</p>
          </div>
        </div>
        <!-- 底部按钮 -->
        <div class="tool-actions">
          <button v-if="tool.hasCreate" class="btn-primary" @click="handleCreate(tool)">
            {{ t('tool.startCreate') }}
          </button>
          <button v-if="tool.hasMobile" class="btn-outline" @click="handleDownloadMobile(tool)">
            {{ t('tool.downloadMobile') }}
          </button>
          <button v-if="tool.hasDesktop" class="btn-outline" @click="handleDownloadDesktop(tool)">
            {{ t('tool.downloadDesktop') }}
          </button>
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

import tool1Icon from '~/assets/images/tool1.png'
import tool2Icon from '~/assets/images/tool2.png'
import tool3Icon from '~/assets/images/tool3.png'
import tool4Icon from '~/assets/images/too4.png'
import tool5Icon from '~/assets/images/tool5.png'

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

const toolList: Tool[] = [
  {
    id: 'vincibot',
    name: 'MatataCode<br/>(VinciBot)',
    icon: tool1Icon,
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
    icon: tool2Icon,
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
    icon: tool3Icon,
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
    icon: tool4Icon,
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
    icon: tool5Icon,
    titleKey: 'tool.matataxplore.title',
    descKey: 'tool.matataxplore.desc',
    hasCreate: false,
    hasMobile: true,
    hasDesktop: true,
    mobileUrl: 'https://example.com/matataxplore/mobile',
    desktopUrl: 'https://example.com/matataxplore/desktop'
  }
]

const showIframeModal = ref(false)
const currentIframeUrl = ref('')
const currentToolName = ref('')
const iframeLoading = ref(true)

const handleCreate = (tool: Tool) => {
  if (tool.createUrl) {
    currentIframeUrl.value = tool.createUrl
    currentToolName.value = tool.name.replace('<br/>', ' ')
    iframeLoading.value = true
    showIframeModal.value = true
  }
}

const onIframeLoad = () => {
  iframeLoading.value = false
}

const closeIframeModal = () => {
  showIframeModal.value = false
  currentIframeUrl.value = ''
  currentToolName.value = ''
  iframeLoading.value = true
}

const handleDownloadMobile = (tool: Tool) => {
  // TODO: 实现下载移动端逻辑
  console.log('下载移动端:', tool.id)
}

const handleDownloadDesktop = (tool: Tool) => {
  // TODO: 实现下载桌面端逻辑
  console.log('下载桌面端:', tool.id)
}
</script>

<style scoped>
.tool-center-page {
  padding: 30px 40px;
  min-height: calc(100vh - 70px);
  background: #F5F5F5;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 24px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.tool-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  min-height: 220px;
}

.tool-content {
  display: flex;
  gap: 20px;
  flex: 1;
}

.tool-left {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}

.tool-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  overflow: hidden;
  background: #f5f5f5;
  margin-bottom: 10px;
}

.tool-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tool-name {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

.tool-right {
  flex: 1;
  min-width: 0;
}

.tool-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.tool-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.btn-primary {
  background: #FF9900;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #E68A00;
}

.btn-outline {
  background: white;
  color: #FF9900;
  border: 1px solid #FF9900;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #FFF9F0;
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
