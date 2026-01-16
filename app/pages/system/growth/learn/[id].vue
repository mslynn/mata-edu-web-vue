<template>
  <div class="preview-page">
    <!-- 公共头部 -->
    <AppHeader />
    
    <!-- 顶部导航 -->
    <div class="preview-header">
      <div class="header-left">
        <a href="javascript:;" class="back-link" @click="goBack">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </a>
        <span class="course-name">{{ chapterName }}</span>
      </div>
    </div>

    <div class="preview-body">
      <!-- 左侧资源列表 -->
      <div class="left-sidebar" :class="{ collapsed: panelCollapsed }">
        <!-- 资源列表面板 -->
        <div class="resource-panel">
          <!-- 资料文件夹 -->
          <div class="folder-section">
            <div class="folder-header">
              <img :src="folderIcon" alt="folder" class="folder-icon" />
              <span class="folder-name">资料</span>
            </div>
            <div class="resource-list">
              <template v-if="resources.length > 0">
                <div v-for="item in resources" :key="item.resourceId" class="resource-item"
                  :class="{ active: selectedResource?.resourceId === item.resourceId }"
                  @click="selectResource(item)">
                  <img class="item-icon-img" :src="getFileIconSrc(getFileType(item.fileName))" :alt="getFileType(item.fileName)" />
                  <div class="item-info">
                    <span class="item-name" :title="item.fileName">{{ item.fileName }}</span>
                  </div>
                </div>
              </template>
              <div v-else class="empty-content">
                <p class="empty-text">{{ $t('common.noData') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 折叠按钮 -->
        <button class="collapse-btn" @click="panelCollapsed = !panelCollapsed">
          <svg class="collapse-icon" :class="{ rotated: panelCollapsed }" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- 右侧预览区域 -->
      <div class="preview-area">
        <div v-if="previewLoading" class="preview-loading">
          <div class="spinner"></div>
          <span>{{ $t('common.loading') }}</span>
        </div>
        <div v-else-if="!selectedResource" class="preview-empty">
          <svg class="empty-svg-large" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" fill="#f0f0f0" />
            <rect x="55" y="50" width="90" height="110" rx="8" fill="white" stroke="#ddd" stroke-width="2" />
            <circle cx="80" cy="80" r="8" fill="#e8e8e8" />
            <line x1="95" y1="80" x2="130" y2="80" stroke="#e8e8e8" stroke-width="3" stroke-linecap="round" />
            <circle cx="80" cy="105" r="8" fill="#e8e8e8" />
            <line x1="95" y1="105" x2="125" y2="105" stroke="#e8e8e8" stroke-width="3" stroke-linecap="round" />
            <circle cx="80" cy="130" r="8" fill="#e8e8e8" />
            <line x1="95" y1="130" x2="120" y2="130" stroke="#e8e8e8" stroke-width="3" stroke-linecap="round" />
          </svg>
          <p class="empty-text-large">{{ $t('prepare.selectResourceToPreview') }}</p>
        </div>
        <div v-else class="preview-content">
          <!-- Word/PPT/PDF/图片/Excel 使用 iframe 预览 -->
          <div v-if="['word', 'ppt', 'pdf', 'image', 'excel'].includes(getFileType(selectedResource.fileName))" class="ppt-preview-wrapper">
            <iframe :src="pptPreviewUrl" class="ppt-iframe" frameborder="0" allowfullscreen></iframe>
          </div>
          <!-- 视频预览 -->
          <div v-else-if="getFileType(selectedResource.fileName) === 'video'" class="video-preview-wrapper">
            <video :src="selectedResource.resourceUrl" controls class="preview-video" preload="metadata">
              {{ $t('prepare.browserNotSupportVideo') }}
            </video>
          </div>
          <!-- 不支持预览 -->
          <div v-else class="preview-unsupported">
            <p>{{ $t('prepare.previewNotSupported') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { growthAdmin } from '~/composables/api/growth'
import '~/assets/css/prepare.css'

// 引入图标
import folderIcon from '~/assets/images/ziliao.png'
import docIcon from '~/assets/images/doc.png'
import xlsIcon from '~/assets/images/xls.png'
import pdfIcon from '~/assets/images/pdf.png'
import mp4Icon from '~/assets/images/mp4.png'
import pngIcon from '~/assets/images/png.png'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const router = useRouter()
const { getTeacherCourseChapterResourceList } = growthAdmin()

// 章节ID从路由参数获取
const chapterId = computed(() => route.params.id as string)
const chapterName = computed(() => route.query.chapterName as string || '')
const courseName = computed(() => route.query.courseName as string || '')
const panelCollapsed = ref(false)

// 资源数据
interface ResourceItem {
  resourceId: number
  chapterId: string
  resourceType: number
  resourceCategory: number
  resourceName: string
  ossId: string
  fileName: string
  resourceUrl?: string
}

const resources = ref<ResourceItem[]>([])
const selectedResource = ref<ResourceItem | null>(null)
const previewLoading = ref(false)
const pptPreviewUrl = ref('')

// base64 编码
const base64Encode = (str: string): string => {
  if (typeof window !== 'undefined') {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
  }
  return str
}

// 生成预览地址
const config = useRuntimeConfig()
const getPptPreviewUrl = (url: string): string => {
  const previewBaseUrl = (config.public.previewBaseUrl as string)?.trim() || 'http://192.168.0.145:8012'
  return `${previewBaseUrl}/onlinePreview?url=${encodeURIComponent(base64Encode(url))}`
}

onMounted(async () => {
  if (chapterId.value) {
    await loadChapterResources(chapterId.value)
  }
})

const goBack = () => router.back()

// 加载章节资源
const loadChapterResources = async (id: string) => {
  try {
    const data = await getTeacherCourseChapterResourceList(id)
    if (data) {
      resources.value = data || []
      
      // 自动选中第一个资源
      if (resources.value.length > 0 && resources.value[0]) {
        selectResource(resources.value[0])
      }
    }
  } catch (error) {
    console.error('Failed to load chapter resources:', error)
  }
}

const getFileType = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    doc: 'word', docx: 'word',
    ppt: 'ppt', pptx: 'ppt',
    xls: 'excel', xlsx: 'excel',
    pdf: 'pdf',
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', bmp: 'image', webp: 'image', svg: 'image',
    mp4: 'video', mov: 'video', webm: 'video'
  }
  return typeMap[ext] || 'default'
}

// 根据文件类型获取图标图片路径
const getFileIconSrc = (type: string) => {
  const iconMap: Record<string, string> = {
    ppt: pdfIcon,
    word: docIcon,
    excel: xlsIcon,
    pdf: pdfIcon,
    video: mp4Icon,
    image: pngIcon
  }
  return iconMap[type] || docIcon
}

const selectResource = async (item: ResourceItem) => {
  if (selectedResource.value?.resourceId === item.resourceId) return
  pptPreviewUrl.value = ''
  selectedResource.value = item
  previewLoading.value = true
  
  try {
    const fileType = getFileType(item.fileName)
    if (['word', 'ppt', 'pdf', 'image', 'excel'].includes(fileType) && item.resourceUrl) {
      pptPreviewUrl.value = getPptPreviewUrl(item.resourceUrl)
    }
    previewLoading.value = false
  } catch (error) {
    console.error('Failed to load preview:', error)
    previewLoading.value = false
  }
}
</script>

<style scoped>
.preview-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 50px;
  background: #FF9900;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.back-link:hover { background: rgba(255, 255, 255, 0.3); }
.back-icon { width: 20px; height: 20px; }

.course-name { font-size: 16px; color: white; font-weight: 500; }

.preview-body { flex: 1; display: flex; overflow: hidden; }

.left-sidebar {
  width: 280px;
  background: white;
  display: flex;
  position: relative;
  transition: width 0.3s;
}
.left-sidebar.collapsed { width: 0; }
.left-sidebar.collapsed .resource-panel { display: none; }

.resource-panel { flex: 1; overflow-y: auto; padding: 20px; }

.folder-section {
  margin-bottom: 16px;
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
}

.folder-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.folder-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.resource-list {
  padding-left: 8px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 4px;
}
.resource-item:hover { background: #f5f5f5; }
.resource-item.active { background: #FFF8F0; }

.item-icon-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex-shrink: 0;
}

.item-info { flex: 1; min-width: 0; }
.item-name { 
  font-size: 14px; 
  color: #333; 
  display: block; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

.collapse-btn {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.collapse-btn:hover { background: #f5f5f5; }
.collapse-icon { width: 16px; height: 16px; transition: transform 0.3s; }
.collapse-icon.rotated { transform: rotate(180deg); }

.preview-area { flex: 1; display: flex; align-items: center; justify-content: center; background: #fafafa; overflow: hidden; }
.preview-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; color: #999; }
.spinner { width: 32px; height: 32px; border: 3px solid #eee; border-top-color: #FF9900; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.preview-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.empty-svg-large { width: 120px; height: 120px; }
.empty-text-large { color: #999; font-size: 14px; }

.preview-content { width: 100%; height: 100%; }
.ppt-preview-wrapper { width: 100%; height: 100%; }
.ppt-iframe { width: 100%; height: 100%; border: none; }
.video-preview-wrapper { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #000; }
.preview-video { max-width: 100%; max-height: 100%; }
.preview-unsupported { display: flex; align-items: center; justify-content: center; color: #999; }

.empty-content { display: flex; align-items: center; justify-content: center; height: 100px; }
.empty-text { color: #999; font-size: 14px; }
</style>
