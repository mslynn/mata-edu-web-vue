<template>
  <div class="event-center-page">
    <!-- 加载状态 -->
    <div v-if="iframeLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ $t('common.loading') }}</span>
    </div>
    
    <!-- iframe 容器 -->
    <iframe 
      v-if="iframeUrl"
      :src="iframeUrl" 
      class="event-iframe"
      :class="{ hidden: iframeLoading }"
      frameborder="0" 
      allowfullscreen
      @load="onIframeLoad"
    ></iframe>

    <!-- 无链接时的提示 -->
    <div v-else-if="!iframeLoading" class="no-url-container">
      <p>{{ $t('common.noData') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeacherNav } from '~/composables/api/useTeacherNav'

definePageMeta({
  layout: 'sidebar'
})

const { locale } = useI18n()
const { menuItems } = useTeacherNav()

// 加载状态
const iframeLoading = ref(true)

// 从菜单缓存中获取赛事中心的外部链接地址
const baseUrl = computed(() => {
  // 查找赛事中心菜单项
  const eventMenu = menuItems.value.find(
    item => item.path === '/system/event' || 
            item.label?.includes('赛事') || 
            item.label?.toLowerCase().includes('event')
  )
  return eventMenu?.externalUrl || 'https://mwrc.matatastudio.com/'
})

// 根据当前语言生成完整的 iframe URL
const iframeUrl = computed(() => {
  if (!baseUrl.value) return ''
  const lang = locale.value === 'zh' ? 'zh' : 'en'
  const separator = baseUrl.value.includes('?') ? '&' : '?'
  return `${baseUrl.value}${separator}lang=${lang}`
})

// iframe 加载完成
const onIframeLoad = () => {
  iframeLoading.value = false
}

// 如果找不到 URL，停止加载状态
onMounted(() => {
  if (!baseUrl.value) {
    iframeLoading.value = false
  }
})
</script>

<style scoped>
.event-center-page {
  width: 100%;
  height: calc(100vh - 70px);
  position: relative;
  background: #F5F5F5;
}

.event-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.event-iframe.hidden {
  opacity: 0;
}

.loading-container {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  gap: 16px;
  z-index: 10;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E5E5;
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

.no-url-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}
</style>
