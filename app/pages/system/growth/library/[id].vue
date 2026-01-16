<template>
  <div class="library-detail-page flex-1 flex flex-col">
    <!-- 顶部导航 -->
    <div class="detail-header flex items-center gap-4 px-6 py-4 bg-white">
      <button class="back-btn" @click="goBack">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="breadcrumb text-sm text-gray-500">
        <span class="cursor-pointer hover:text-[#FF9900]" @click="goBack">{{ $t('growth.library') }}</span>
        <span class="mx-2">></span>
        <span class="text-gray-800">{{ libraryDetail.title }}</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 bg-white overflow-hidden">
      <!-- 加载中 -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-gray-400">{{ $t('common.loading') }}...</div>
      </div>
      
      <div v-else class="content-wrapper">
        <!-- 标题 -->
        <h1 class="text-xl font-medium text-gray-800 text-center py-6">{{ libraryDetail.title }}</h1>
        
        <!-- 文章内容区 -->
        <div class="article-area">
          <div class="article-content" v-html="libraryDetail.content"></div>
          
          <!-- 附件资料 -->
          <div v-if="resourceList.length" class="resource-area">
            <div 
              v-for="file in resourceList" 
              :key="file.id"
              class="resource-item"
              @click="downloadFile(file)"
            >
              <img :src="getFileIcon(file.fileType)" class="w-6 h-6" />
              <span class="resource-name">{{ file.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { growthAdmin } from '~/composables/api/growth'
import { cursorAdmin } from '~/composables/api/curosr'

import pdfIcon from '~/assets/images/pdf.png'
import docIcon from '~/assets/images/doc.png'
import xlsIcon from '~/assets/images/xls.png'
import mp4Icon from '~/assets/images/mp4.png'
import pngIcon from '~/assets/images/png.png'

definePageMeta({
  layout: 'sidebar'
})

const route = useRoute()
const router = useRouter()
const { getBookdetail, getBookresourceList } = growthAdmin()
const { downloadOSS } = cursorAdmin()

interface LibraryDetail {
  id: string
  title: string
  content: string
}

interface ResourceItem {
  id: number
  name: string
  ossId: string
  fileType: string
}

const libraryDetail = ref<LibraryDetail>({
  id: '',
  title: '',
  content: ''
})

const resourceList = ref<ResourceItem[]>([])
const loading = ref(false)

// 获取文件图标
const getFileIcon = (fileType: string) => {
  const type = fileType?.toLowerCase() || ''
  if (type.includes('pdf')) return pdfIcon
  if (type.includes('doc') || type.includes('word')) return docIcon
  if (type.includes('xls') || type.includes('excel')) return xlsIcon
  if (type.includes('mp4') || type.includes('video')) return mp4Icon
  if (type.includes('png') || type.includes('jpg') || type.includes('jpeg') || type.includes('gif')) return pngIcon
  return pdfIcon
}

// 返回
const goBack = () => {
  router.back()
}

// 下载附件
const downloadFile = async (file: ResourceItem) => {
  if (file.ossId) {
    try {
      const blobUrl = await downloadOSS(file.ossId)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('下载失败:', error)
    }
  }
}

// 加载详情
const loadLibraryDetail = async () => {
  const bookId = route.params.id as string
  loading.value = true
  try {
    const data = await getBookdetail(bookId)
    if (data) {
      libraryDetail.value = {
        id: data.bookId || data.id || bookId,
        title: data.title || data.bookName || '',
        content: data.content || data.bookContent || ''
      }
    }
    // 加载资源列表
    await loadResourceList(bookId)
  } catch (error) {
    console.error('加载图书详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载资源列表
const loadResourceList = async (bookId: string) => {
  try {
    const data = await getBookresourceList(bookId)
    resourceList.value = (data || []).map((item: any) => ({
      id: item.resourceId || item.id,
      name: item.fileName || item.resourceName || item.name || '',
      ossId: item.ossId || '',
      fileType: item.fileSuffix || item.resourceType || item.fileType || 'PDF'
    }))
  } catch (error) {
    console.error('加载资源列表失败:', error)
    resourceList.value = []
  }
}

onMounted(() => {
  loadLibraryDetail()
})
</script>

<style scoped>
.library-detail-page {
  height: calc(100vh - 70px);
  overflow: hidden;
}

.back-btn {
  width: 69px;
  height: 50px;
  background: #FF9900;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  cursor: pointer;
}

.back-btn:hover {
  background: #E68A00;
}

.content-wrapper {
  width: 77.6%;
  max-width: 1490px;
  margin: 0 auto;
  padding: 0 0 40px;
}

.article-area {
  background: #FFFFFF;
  border-radius: 10px;
  padding: 30px 40px;
  margin-bottom: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 60vh;
}

.article-content {
  font-size: 14px;
  line-height: 2;
  color: #333;
}

.article-content :deep(p) {
  margin-bottom: 1em;
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  font-weight: 500;
  margin-bottom: 0.5em;
  color: #333;
}

.resource-area {
  padding: 20px 0;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
}

.resource-item:hover .resource-name {
  color: #FF9900;
}

.resource-name {
  font-size: 14px;
  color: #666;
  transition: color 0.2s;
}
</style>
