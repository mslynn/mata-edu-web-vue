<template>
  <div class="file-preview">
    <!-- 加载中 -->
    <div v-if="loading" class="preview-loading">
      <div class="spinner"></div>
      <span>{{ $t('common.loading') }}</span>
    </div>

    <!-- 空状态 -->
    <div v-else-if="!resource" class="preview-empty">
      <svg class="empty-svg" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="80" fill="#f0f0f0" />
        <rect x="60" y="60" width="80" height="100" rx="4" fill="#e8e8e8" />
        <line x1="75" y1="85" x2="125" y2="85" stroke="#d0d0d0" stroke-width="3" stroke-linecap="round" />
        <line x1="75" y1="100" x2="125" y2="100" stroke="#d0d0d0" stroke-width="3" stroke-linecap="round" />
        <line x1="75" y1="115" x2="110" y2="115" stroke="#d0d0d0" stroke-width="3" stroke-linecap="round" />
        <line x1="75" y1="130" x2="100" y2="130" stroke="#d0d0d0" stroke-width="3" stroke-linecap="round" />
        <line x1="95" y1="130" x2="120" y2="130" stroke="#e8e8e8" stroke-width="3" stroke-linecap="round" />
      </svg>
      <p class="empty-text">{{ emptyText || $t('prepare.selectResourceToPreview') }}</p>
    </div>

    <!-- 预览内容 -->
    <div v-else class="preview-content">
      <!-- Word/PPT/PDF/图片/Excel 使用 iframe 预览 -->
      <div v-if="isIframeType" class="iframe-wrapper">
        <iframe :src="previewUrl" class="preview-iframe" frameborder="0" allowfullscreen></iframe>
      </div>

      <!-- 视频预览 -->
      <div v-else-if="fileType === 'video'" class="video-wrapper">
        <video :src="resource.url" controls class="preview-video" preload="metadata">
          {{ $t('prepare.browserNotSupportVideo') }}
        </video>
      </div>

      <!-- UCD 文件预览卡片 -->
      <div v-else-if="fileType === 'ucd'" class="special-file-wrapper">
        <div class="special-file-card">
          <div class="file-icon ucd-icon"><span>ucd</span></div>
          <div class="file-name">{{ resource.name }}</div>
          <div class="file-tip">{{ $t('prepare.ucdEditInDev') }}</div>
        </div>
      </div>

      <!-- MC 文件预览卡片 -->
      <div v-else-if="fileType === 'mc'" class="special-file-wrapper">
        <div class="special-file-card">
          <div class="file-icon mc-icon"><span>mc</span></div>
          <div class="file-name">{{ resource.name }}</div>
          <div class="file-tip">{{ $t('prepare.mcEditInDev') }}</div>
        </div>
      </div>

      <!-- 不支持预览 -->
      <div v-else class="preview-unsupported">
        <p>{{ $t('prepare.previewNotSupported') }}</p>
        <a v-if="resource.url" :href="resource.url" download class="download-btn">
          {{ $t('common.download') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface ResourceItem {
  name: string      // 文件名
  url: string       // 文件URL
}

const props = defineProps<{
  resource?: ResourceItem | null  // 要预览的资源
  loading?: boolean               // 加载状态
  emptyText?: string              // 空状态文字
}>()

// 获取运行时配置
const config = useRuntimeConfig()

// base64 编码
const base64Encode = (str: string): string => {
  if (typeof window !== 'undefined') {
    return btoa(unescape(encodeURIComponent(str)))
  }
  return Buffer.from(str).toString('base64')
}

// 获取文件类型
const getFileType = (fileName: string): string => {
  if (!fileName) return 'unknown'
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    doc: 'word', docx: 'word',
    ppt: 'ppt', pptx: 'ppt',
    pdf: 'pdf',
    xls: 'excel', xlsx: 'excel',
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', bmp: 'image', webp: 'image', svg: 'image',
    mp4: 'video', webm: 'video', ogg: 'video', mov: 'video', avi: 'video',
    ucd: 'ucd',
    mc: 'mc',
  }
  return typeMap[ext] || 'unknown'
}

// 当前文件类型
const fileType = computed(() => {
  return props.resource ? getFileType(props.resource.name) : ''
})

// 是否是 iframe 预览类型
const isIframeType = computed(() => {
  return ['word', 'ppt', 'pdf', 'image', 'excel'].includes(fileType.value)
})

// 生成预览URL
const previewUrl = computed(() => {
  if (!props.resource?.url || !isIframeType.value) return ''
  const previewBaseUrl = (config.public.previewBaseUrl as string)?.trim() || 'http://192.168.0.145:8012'
  return `${previewBaseUrl}/onlinePreview?url=${encodeURIComponent(base64Encode(props.resource.url))}`
})
</script>

<style scoped>
.file-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  overflow: hidden;
}

/* 加载状态 */
.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #999;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #eee;
  border-top-color: #FF9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-svg {
  width: 120px;
  height: 120px;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

/* 预览内容 */
.preview-content {
  width: 100%;
  height: 100%;
}

/* iframe 预览 */
.iframe-wrapper {
  width: 100%;
  height: 100%;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 视频预览 */
.video-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
}

/* 特殊文件预览卡片 */
.special-file-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.special-file-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.file-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.ucd-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.mc-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.file-name {
  font-size: 14px;
  color: #333;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-tip {
  font-size: 12px;
  color: #999;
}

/* 不支持预览 */
.preview-unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #999;
}

.download-btn {
  padding: 8px 24px;
  background: #FF9900;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #E68A00;
}
</style>
