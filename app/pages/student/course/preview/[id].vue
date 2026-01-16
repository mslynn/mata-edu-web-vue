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
        <!-- 章节下拉框 -->
        <div class="chapter-dropdown" :class="{ open: dropdownOpen }">
          <button class="dropdown-trigger" @click.stop="dropdownOpen = !dropdownOpen">
            <span class="dropdown-text">{{ currentChapterName }}</span>
            <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <Transition name="dropdown">
            <div class="dropdown-menu" v-if="dropdownOpen">
              <div v-for="chapter in chapterList" :key="chapter.id" class="dropdown-item"
                :class="{ active: chapter.id === currentChapterId }" @click="selectChapter(chapter)">
                {{ chapter.name }}
              </div>
            </div>
          </Transition>
        </div>
      </div>
      <div class="header-center">
        <span class="course-name">{{ courseInfo.name }}</span>
      </div>
      <div class="header-right"></div>
    </div>

    <div class="preview-body">
      <!-- 左侧资源列表 -->
      <div class="left-sidebar" :class="{ collapsed: panelCollapsed }">
        <!-- 资源列表面板 -->
        <div class="resource-panel">
          <div class="resource-list">
            <template v-if="resources.length > 0">
              <div v-for="group in resources" :key="group.resourceName" class="resource-section">
                <div class="section-header" @click="toggleSection(group.resourceName)">
                  <svg class="section-arrow" :class="{ expanded: expandedSections[group.resourceName] }"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>{{ group.resourceName }} ({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="expandedSections[group.resourceName]" class="section-content">
                  <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item"
                    :class="{ active: selectedResource?.id === item.resourceId }"
                    @click="handleSelectResource(item)">
                    <div class="item-icon" :class="getIconClass(item.fileName)">
                      {{ getIconText(item.fileName) }}
                    </div>
                    <div class="item-info">
                      <span class="item-name">{{ item.fileName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-content">
              <p class="empty-text">{{ $t('common.noData') }}</p>
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

      <!-- 右侧预览区域 - 使用通用组件 -->
      <div class="preview-area">
        <FilePreview 
          :resource="selectedResource" 
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { cursorAdmin } from '~/composables/api/curosr'
import { useFilePreview } from '~/composables/useFilePreview'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getCursorDetail, getChapterResourceList } = cursorAdmin()

// 使用文件预览 composable
const { 
  selectedResource, 
  loading, 
  selectResource, 
  clearPreview,
  getFileType,
  getIconClass: getIconClassByType 
} = useFilePreview()

const courseInfo = ref({ name: '' })
const chapterList = ref<{ id: string; name: string }[]>([])
const currentChapterId = ref<string>('')
const dropdownOpen = ref(false)
const panelCollapsed = ref(false)

// 资源数据
interface ResourceItem {
  resourceId: number
  chapterId: string
  resourceType?: number
  resourceCategory: number
  resourceName: string
  ossId: string
  fileName: string
  resourceUrl?: string
}
interface ResourceGroup {
  resourceCategory: number | null
  resourceName: string
  resourceList: ResourceItem[]
}

const resources = ref<ResourceGroup[]>([])
const expandedSections = reactive<Record<string, boolean>>({})

// 获取图标类名
const getIconClass = (fileName: string) => {
  const type = getFileType(fileName)
  const iconMap: Record<string, string> = {
    word: 'icon-word',
    ppt: 'icon-ppt',
    pdf: 'icon-pdf',
    excel: 'icon-excel',
    image: 'icon-image',
    video: 'icon-video',
  }
  return iconMap[type] || 'icon-default'
}

// 获取图标文字
const getIconText = (fileName: string) => {
  const type = getFileType(fileName)
  const textMap: Record<string, string> = {
    word: 'W',
    ppt: 'P',
    pdf: 'PDF',
    excel: 'X',
    image: '图',
    video: '视',
  }
  return textMap[type] || '?'
}

// 选择资源
const handleSelectResource = (item: ResourceItem) => {
  selectResource({
    id: item.resourceId,
    name: item.fileName,
    url: item.resourceUrl || ''
  })
}

// 点击外部关闭下拉框
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.chapter-dropdown')) {
    dropdownOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', closeDropdown)

  try {
    const data = await getCursorDetail(String(route.params.id))
    if (data) {
      courseInfo.value.name = data.courseName || ''
      if (data.chapterList && Array.isArray(data.chapterList)) {
        chapterList.value = data.chapterList.map((c: any, idx: number) => ({
          id: String(c.chapterId || idx + 1),
          name: c.chapterName || `${t('course.chapter')}${idx + 1}`
        }))

        // 从 URL 获取 chapterId 或默认选中第一个
        const urlChapterId = route.query.chapterId ? String(route.query.chapterId) : null
        if (urlChapterId && chapterList.value.some(c => c.id === urlChapterId)) {
          currentChapterId.value = urlChapterId
        } else if (chapterList.value.length > 0 && chapterList.value[0]) {
          currentChapterId.value = chapterList.value[0].id
        }

        if (currentChapterId.value) {
          await loadChapterResources(currentChapterId.value)
        }
      }
    }
  } catch (error) {
    console.error('Failed to load course details:', error)
  }
})

onUnmounted(() => document.removeEventListener('click', closeDropdown))

const goBack = () => router.back()

const currentChapterName = computed(() => {
  const chapter = chapterList.value.find(c => c.id === currentChapterId.value)
  return chapter?.name || t('prepare.selectChapter')
})

const selectChapter = async (chapter: { id: string; name: string }) => {
  currentChapterId.value = chapter.id
  dropdownOpen.value = false
  clearPreview() // 清空预览
  await loadChapterResources(chapter.id)
}

// 加载章节资源（学生只能看教学资源 resourceType=1）
const loadChapterResources = async (chapterId: string) => {
  try {
    const data = await getChapterResourceList(chapterId)
    if (data) {
      resources.value = data || []
      resources.value.forEach(group => {
        if (expandedSections[group.resourceName] === undefined) {
          expandedSections[group.resourceName] = true
        }
      })
      
      // 自动选中第一个资源
      const firstGroup = resources.value[0]
      const firstResource = firstGroup?.resourceList?.[0]
      if (firstResource) {
        handleSelectResource(firstResource)
      }
    }
  } catch (error) {
    console.error('Failed to load chapter resources:', error)
  }
}

const toggleSection = (name: string) => {
  expandedSections[name] = !expandedSections[name]
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
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-link {
  color: #666;
  display: flex;
  align-items: center;
}
.back-link:hover { color: #FF9900; }
.back-icon { width: 24px; height: 24px; }

.chapter-dropdown { position: relative; }
.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}
.dropdown-trigger:hover { border-color: #FF9900; }
.dropdown-arrow { width: 16px; height: 16px; transition: transform 0.2s; }
.chapter-dropdown.open .dropdown-arrow { transform: rotate(180deg); }
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 200px;
  z-index: 100;
  max-height: 300px;
  overflow-y: auto;
}
.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
}
.dropdown-item:hover { background: #FFF8F0; }
.dropdown-item.active { color: #FF9900; background: #FFF8F0; }

.header-center { flex: 1; text-align: center; }
.course-name { font-size: 16px; font-weight: 500; color: #333; }
.header-right { width: 200px; }

.preview-body { flex: 1; display: flex; overflow: hidden; }

.left-sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  position: relative;
  transition: width 0.3s;
}
.left-sidebar.collapsed { width: 0; }
.left-sidebar.collapsed .resource-panel { display: none; }

.resource-panel { flex: 1; overflow-y: auto; padding: 16px; }

.resource-section { margin-bottom: 8px; }
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  border-radius: 6px;
}
.section-header:hover { background: #f5f5f5; }
.section-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s;
  transform: rotate(-90deg);
}
.section-arrow.expanded { transform: rotate(0); }

.section-content { padding-left: 24px; }

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
.resource-item.active { background: #FFF8F0; border: 1px solid #FF9900; }

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}
.icon-word { background: #2B579A; }
.icon-ppt { background: #D24726; }
.icon-pdf { background: #F40F02; }
.icon-excel { background: #217346; }
.icon-image { background: #4CAF50; }
.icon-video { background: #9C27B0; }
.icon-default { background: #999; }

.item-info { flex: 1; min-width: 0; }
.item-name {
  font-size: 13px;
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

.preview-area {
  flex: 1;
  overflow: hidden;
}

.empty-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
.empty-text { color: #999; font-size: 14px; }

/* 下拉动画 */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
