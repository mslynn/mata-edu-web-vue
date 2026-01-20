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
          
          <!-- 下载客户端 (VinciBot, Nous, TaleMap) -->
          <button v-if="tool.hasDownloadClient" class="btn-outline" @click="handleDownloadClient(tool)">
            {{ t('tool.downloadClient') }}
          </button>

          <!-- macOS (MatataXplore) -->
          <button v-if="tool.hasMacOS" class="btn-outline" @click="handleDownloadMacOS(tool)">
            {{ t('tool.downloadMacOS') }}
          </button>

          <!-- Windows (MatataXplore) -->
          <button v-if="tool.hasWindows" class="btn-outline" @click="handleDownloadWindows(tool)">
            {{ t('tool.downloadWindows') }}
          </button>
          
          <!-- App Store (MatataXplore, MatataCode) -->
          <button v-if="tool.hasAppStore" class="btn-outline" @click="handleDownloadAppStore(tool)">
            {{ t(tool.appStoreKey || 'tool.downloadAppStore') }}
          </button>

          <!-- Google Play (MatataXplore, MatataCode) -->
          <button v-if="tool.hasGooglePlay" class="btn-outline" @click="handleDownloadGooglePlay(tool)">
            {{ t(tool.googlePlayKey || 'tool.downloadGooglePlay') }}
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

const { t, locale } = useI18n()

interface Tool {
  id: string
  name: string
  icon: string
  titleKey: string
  descKey: string
  hasCreate: boolean
  hasDownloadClient?: boolean // 下载客户端
  hasMacOS?: boolean        // 下载macOS
  hasWindows?: boolean      // 下载Windows
  hasAppStore?: boolean     // App Store
  hasGooglePlay?: boolean   // Google Play
  appStoreKey?: string      // App Store 按钮文案key
  googlePlayKey?: string    // Google Play 按钮文案key
  createUrl?: string
  downloadClientUrl?: string
  macOSUrl?: string
  windowsUrl?: string
  appStoreUrl?: string
  googlePlayUrl?: string
}

const toolList: Tool[] = [
  {
    id: 'vincibot',
    name: 'MatataCode<br/>(VinciBot)',
    icon: tool1Icon,
    titleKey: 'tool.vincibot.title',
    descKey: 'tool.vincibot.desc',
    hasCreate: true,
    hasDownloadClient: true,
    createUrl: 'https://vinci.matatastudio.com/',
    downloadClientUrl: 'https://vinci.matatastudio.com/static/download.html'
  },
  {
    id: 'nous',
    name: 'MatataCode<br/>(Nous)',
    icon: tool2Icon,
    titleKey: 'tool.nous.title',
    descKey: 'tool.nous.desc',
    hasCreate: true,
    hasDownloadClient: true,
    createUrl: 'https://nous.matatastudio.com/',
    downloadClientUrl: 'https://nous.matatastudio.com/?page=download'
  },
  {
    id: 'matatacode',
    name: 'MatataCode',
    icon: tool3Icon,
    titleKey: 'tool.matatacode.title',
    descKey: 'tool.matatacode.desc',
    hasCreate: false,
    hasAppStore: true,
    hasGooglePlay: true,
    appStoreKey: 'tool.downloadTheAppStore',
    googlePlayKey: 'tool.downloadTheGooglePlay',
    appStoreUrl: 'https://apps.apple.com/us/app/matatacode/id1448969038',
    googlePlayUrl: 'https://nous.matatastudio.com/?page=download&lang=zh'
  },
  {
    id: 'talemap',
    name: 'MatataCode<br/>(TaleMap)',
    icon: tool4Icon,
    titleKey: 'tool.talemap.title',
    descKey: 'tool.talemap.desc',
    hasCreate: false,
    hasDownloadClient: true,
    downloadClientUrl: 'https://www.mediafire.com/file_premium/rz1j080mpbsdhus/MatataCode-TaleMap-v1.0.0-win-x64.exe/file'
  },
  {
    id: 'matataxplore',
    name: 'MatataXplore',
    icon: tool5Icon,
    titleKey: 'tool.matataxplore.title',
    descKey: 'tool.matataxplore.desc',
    hasCreate: false,
    hasDownloadClient: false,
    hasMacOS: true,
    hasWindows: true,
    hasAppStore: true,
    hasGooglePlay: true,
    appStoreKey: 'tool.downloadTheAppStore',
    googlePlayKey: 'tool.downloadTheGooglePlay',
    macOSUrl: 'https://rrrorwxhlpoolo5m.ldycdn.com/attachment/kijkKBliqnRllSnllimilrSR7ww7fgzb73r/MatataXplore.dmg',
    windowsUrl: 'https://jjrorwxhlpoolo5m.ldycdn.com/attachment/kjjkKBliqnRllSnllipiljSR7ww7fgzb73r/MatataXplore.exe',
    appStoreUrl: 'https://apps.apple.com/us/app/matataxplore/id6450284009',
    googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.matatalab.mtts&pli=1'
  }
]

const showIframeModal = ref(false)
const currentIframeUrl = ref('')
const currentToolName = ref('')
const iframeLoading = ref(true)

const handleCreate = (tool: Tool) => {
  if (tool.createUrl) {
    let url = tool.createUrl
    
    // 动态添加语言参数
    if (tool.id === 'vincibot') {
      const lang = locale.value === 'zh' ? 'zh-CN' : 'en'
      url = `${url}?lang=${lang}`
    } else if (tool.id === 'nous') {
      const lang = locale.value === 'zh' ? 'zh' : 'en'
      url = `${url}?lang=${lang}`
    }

    currentIframeUrl.value = url
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

const handleDownloadClient = (tool: Tool) => {
  console.log('Download Client:', tool.id)
  if (tool.id === 'nous') {
    const lang = locale.value === 'zh' ? 'zh' : 'en'
    window.open(`https://nous.matatastudio.com/?page=download&lang=${lang}`, '_blank')
    return
  }
  if (tool.id === 'vincibot') {
    const lang = locale.value === 'zh' ? 'zh-CN' : 'en'
    window.open(`https://vinci.matatastudio.com/static/download.html?lang=${lang}`, '_blank')
    return
  }
  if (tool.downloadClientUrl) window.open(tool.downloadClientUrl, '_blank')
}

const handleDownloadMacOS = (tool: Tool) => {
  console.log('Download macOS:', tool.id)
  if (tool.macOSUrl) {
    window.location.href = tool.macOSUrl
  }
}

const handleDownloadWindows = (tool: Tool) => {
  console.log('Download Windows:', tool.id)
  if (tool.windowsUrl) {
    window.location.href = tool.windowsUrl
  }
}

const handleDownloadAppStore = (tool: Tool) => {
  console.log('Download App Store:', tool.id)
  if (tool.appStoreUrl) window.open(tool.appStoreUrl, '_blank')
}

const handleDownloadGooglePlay = (tool: Tool) => {
  console.log('Download Google Play:', tool.id)
  if (tool.googlePlayUrl) window.open(tool.googlePlayUrl, '_blank')
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
