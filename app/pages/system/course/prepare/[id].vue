<template>
  <div class="prepare-page">
    <!-- 公共头部 -->
    <AppHeader />
    
    <!-- 顶部导航 -->
    <div class="prepare-header">
      <div class="header-left">
        <a href="javascript:;" class="back-link" @click="goBack">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </a>
        <!-- 自定义下拉框 -->
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
      <div class="header-center"><span class="status-tag">{{ t('prepare.preparing') }}</span></div>
      <div class="header-right">
        <button class="btn-outline" @click="showStudentVisibleModal = true">{{ t('prepare.setStudentVisibleResource') }}</button>
        <button class="btn-white" @click="handleFinish">{{ t('prepare.exitPrepare') }}</button>
      </div>
    </div>

    <div class="prepare-body">
      <!-- 左侧整体容器 (Tab栏 + 资源面板) -->
      <div class="left-sidebar" :class="{ collapsed: panelCollapsed }">
        <!-- 左侧 Tab 栏 -->
        <div class="tab-sidebar">
          <button v-for="tab in tabs" :key="tab.value" class="tab-item" :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value">
            <div class="tab-icon-wrapper">
              <svg v-if="tab.value === 'resource'" class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <svg v-else-if="tab.value === 'task'" class="tab-svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <svg v-else class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span class="tab-label">{{ tab.label }}</span>
          </button>
        </div>

        <!-- 资源列表面板 -->
        <div class="resource-panel">
          <!-- 教学资源 Tab 内容 -->
          <div v-if="activeTab === 'resource'" class="resource-list">
            <!-- 教学资源 - 动态渲染分组 -->
            <template v-if="teachingResources.length > 0">
              <div v-for="group in teachingResources" :key="group.resourceName" class="resource-section">
                <div class="section-header" @click="toggleSection(group.resourceName)">
                  <svg class="section-arrow" :class="{ expanded: expandedSections[group.resourceName] }"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>{{ group.resourceName }} ({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="expandedSections[group.resourceName]" class="section-content">
                  <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item-wrapper">
                    <div class="resource-item" :class="{ active: selectedResource?.resourceId === item.resourceId }"
                      @click="selectResource(item)">
                      <img class="item-icon-img" :src="getFileIconSrc(getFileType(item.fileName))" :alt="getFileType(item.fileName)" />
                      <div class="item-info">
                        <span class="item-name" :title="item.fileName">{{ item.fileName }}</span>
                      </div>
                      <button class="item-download" @click.stop="downloadResource(item)" :title="t('common.download')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </button>
                    </div>
                    <div class="item-actions">
                      <template v-if="item.modifyNum === 0">
                        <span class="action-link" @click.stop="startModify(item)">{{ t('prepare.startModify') }}</span>
                      </template>
                      <template v-else>
                        <span class="action-link" @click.stop="continueModify(item)">{{ t('prepare.continueModify') }}</span>
                        <span class="action-link" @click.stop="addCopy(item)">{{ t('prepare.addCopy') }}</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-content">
              <svg class="empty-svg" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" fill="#f5f5f5" />
                <rect x="60" y="60" width="80" height="100" rx="8" fill="white" stroke="#e0e0e0" stroke-width="2" />
                <line x1="75" y1="85" x2="125" y2="85" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
                <line x1="75" y1="105" x2="115" y2="105" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
                <line x1="75" y1="125" x2="105" y2="125" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
              </svg>
              <p class="empty-text">{{ t('common.noData') }}</p>
            </div>
          </div>

          <!-- 学习任务 Tab 内容 -->
          <div v-else-if="activeTab === 'task'" class="resource-list">
            <template v-if="taskResources.length > 0">
              <div v-for="group in taskResources" :key="group.resourceName" class="resource-section">
                <div class="section-header" @click="toggleSection(group.resourceName)">
                  <svg class="section-arrow" :class="{ expanded: expandedSections[group.resourceName] }"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>{{ group.resourceName }} ({{ group.resourceList?.length || 0 }})</span>
                </div>
                <div v-if="expandedSections[group.resourceName]" class="section-content">
                  <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item"
                    :class="{ active: selectedResource?.resourceId === item.resourceId }" @click="selectResource(item)">
                    <img class="item-icon-img" :src="getFileIconSrc(getFileType(item.fileName))" :alt="getFileType(item.fileName)" />
                    <div class="item-info">
                      <span class="item-name" :title="item.fileName">{{ item.fileName }}</span>
                    </div>
                    <button class="item-download" @click.stop="downloadResource(item)" :title="t('common.download')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-content">
              <svg class="empty-svg" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="80" fill="#f5f5f5" />
                <rect x="60" y="60" width="80" height="100" rx="8" fill="white" stroke="#e0e0e0" stroke-width="2" />
                <line x1="75" y1="85" x2="125" y2="85" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
                <line x1="75" y1="105" x2="115" y2="105" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
                <line x1="75" y1="125" x2="105" y2="125" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
              </svg>
              <p class="empty-text">{{ t('common.noData') }}</p>
            </div>
          </div>

          <!-- 个人资源 Tab 内容 -->
          <div v-else-if="activeTab === 'personal'" class="personal-resource-panel">
            <!-- 顶部按钮 -->
            <div class="personal-header">
              <button class="btn-primary" @click="showLinkModal = true">{{ t('prepare.linkPlatformResource') }}</button>
              <button class="btn-primary" @click="showUploadModal = true">{{ t('prepare.uploadPersonalResource') }}</button>
            </div>

            <div class="resource-list">
              <!-- 个人资源 - 动态渲染分组 -->
              <template v-if="personalResourceGroups.length > 0">
                <div v-for="group in personalResourceGroups" :key="group.resourceName" class="resource-section">
                  <div class="section-header" @click="toggleSection(group.resourceName)">
                    <svg class="section-arrow" :class="{ expanded: expandedSections[group.resourceName] }"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    <span>{{ group.resourceName }} ({{ group.resourceList?.length || 0 }})</span>
                  </div>
                  <div v-if="expandedSections[group.resourceName]" class="section-content">
                    <div v-for="item in group.resourceList" :key="item.resourceId" class="resource-item"
                      :class="{ active: selectedResource?.resourceId === item.resourceId }"
                      @click="selectResource(item)">
                      <img class="item-icon-img" :src="getFileIconSrc(getFileType(item.fileName))" :alt="getFileType(item.fileName)" />
                      <div class="item-info">
                        <span class="item-name" :title="item.fileName">{{ item.fileName }}</span>
                      </div>
                      <button class="item-download" @click.stop="downloadResource(item)" :title="t('common.download')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                      </button>
                      <button v-if="selectedResource?.resourceId === item.resourceId" class="item-delete"
                        @click.stop="deletePersonalResource(item)" :title="t('common.delete')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2">
                          </path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="empty-content">
                <svg class="empty-svg" viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="100" r="80" fill="#f5f5f5" />
                  <rect x="60" y="60" width="80" height="100" rx="8" fill="white" stroke="#e0e0e0" stroke-width="2" />
                  <line x1="75" y1="85" x2="125" y2="85" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
                  <line x1="75" y1="105" x2="115" y2="105" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
                  <line x1="75" y1="125" x2="105" y2="125" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round" />
                </svg>
                <p class="empty-text">{{ t('common.noData') }}</p>
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
        <!-- 无选中资源时的空状态 -->
        <div v-if="previewLoading" class="preview-loading">
          <div class="spinner"></div><span>{{ t('common.loading') }}</span>
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
          <p class="empty-text-large">{{ t('prepare.selectResourceToPreview') }}</p>
        </div>
        <div v-else class="preview-content">
          <!-- Word/PPT/PDF/图片 使用 iframe 预览 -->
          <div v-if="['word', 'ppt', 'pdf', 'image', 'excel'].includes(getFileType(selectedResource.fileName))" class="ppt-preview-wrapper">
            <iframe :src="pptPreviewUrl" class="ppt-iframe" frameborder="0" allowfullscreen></iframe>
          </div>
          <div v-else-if="getFileType(selectedResource.fileName) === 'ucd'" class="ucd-preview-wrapper">
            <div class="ucd-preview-card">
              <div class="ucd-icon">
                <span>ucd</span>
              </div>
              <p class="ucd-filename">{{ selectedResource.fileName }}</p>
              <div class="ucd-actions">
                <button class="ucd-btn ucd-btn-edit" @click="editUcdFile(selectedResource)">{{ t('common.edit') }}</button>
                <button class="ucd-btn ucd-btn-download" @click="downloadResource(selectedResource)">{{ t('common.download') }}</button>
              </div>
            </div>
          </div>
          <div v-else-if="getFileType(selectedResource.fileName) === 'mc'" class="ucd-preview-wrapper">
            <div class="ucd-preview-card">
              <div class="ucd-icon mc-icon">
                <span>mc</span>
              </div>
              <p class="ucd-filename">{{ selectedResource.fileName }}</p>
              <div class="ucd-actions">
                <button class="ucd-btn ucd-btn-edit" @click="editMcFile(selectedResource)">{{ t('common.edit') }}</button>
                <button class="ucd-btn ucd-btn-download" @click="downloadResource(selectedResource)">{{ t('common.download') }}</button>
              </div>
            </div>
          </div>
          <div v-else-if="getFileType(selectedResource.fileName) === 'video'" class="video-preview-wrapper">
            <video 
              :src="selectedResource.resourceUrl" 
              controls 
              class="preview-video"
              preload="metadata"
            >
              {{ t('prepare.browserNotSupportVideo') }}
            </video>
          </div>
          <div v-else class="preview-unsupported">
            <p>{{ t('prepare.previewNotSupported') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传个人资源弹窗 -->
    <UploadPersonalResourceModal v-model:visible="showUploadModal" :chapter-id="String(currentChapterId)"
      @uploaded="handleResourceUploaded" />

    <!-- 关联平台资源弹窗 -->
    <LinkPlatformResourceModal v-model:visible="showLinkModal" />

    <!-- 设置学生可见资源弹窗 -->
    <SetStudentVisibleModal v-model:visible="showStudentVisibleModal" :chapter-id="currentChapterId" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { cursorAdmin } from '~/composables/api/curosr'
import '~/assets/css/prepare.css'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const { getCursorDetail, getChapterResourceList, deleteChapterResource, downloadOSS, copyChapterResource } = cursorAdmin()

// 弹窗状态
const showUploadModal = ref(false)
const showLinkModal = ref(false)
const showStudentVisibleModal = ref(false)

// 点击外部关闭下拉框
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.chapter-dropdown')) {
    dropdownOpen.value = false
  }
}

// 初始化加载
onMounted(async () => {
  document.addEventListener('click', closeDropdown)

  // 加载课程详情获取章节列表
  try {
    const data = await getCursorDetail(String(route.params.id))
    if (data) {
      courseInfo.value.name = data.courseName || ''
      if (data.chapterList && Array.isArray(data.chapterList)) {
        chapterList.value = data.chapterList.map((c: any, idx: number) => ({
          id: String(c.chapterId || idx + 1),
          name: c.chapterName || t('prepare.defaultChapter', { idx: idx + 1 })
        }))

        // 从 URL 获取 chapterId 或默认选中第一个
        const urlChapterId = route.query.chapterId ? String(route.query.chapterId) : null
        if (urlChapterId && chapterList.value.some(c => c.id === urlChapterId)) {
          currentChapterId.value = urlChapterId
        } else if (chapterList.value.length > 0 && chapterList.value[0]) {
          currentChapterId.value = chapterList.value[0].id
        }

        // 从 URL 获取 tab 参数，设置对应的 tab
        const urlTab = route.query.tab as string
        if (urlTab && ['resource', 'task', 'personal'].includes(urlTab)) {
          activeTab.value = urlTab
        }

        // 根据 tab 加载对应类型的资源
        if (currentChapterId.value) {
          const resourceType = activeTab.value === 'resource' ? 1 : activeTab.value === 'task' ? 2 : 3
          await loadChapterResources(currentChapterId.value, resourceType)
          
          // 检查 URL 是否有 resourceId 参数，自动选中并预览该资源
          const urlResourceId = route.query.resourceId ? String(route.query.resourceId) : null
          
          if (urlResourceId) {
            let targetResource: ResourceItem | null = null
            
            // 根据当前 tab 在对应资源列表中查找
            if (activeTab.value === 'resource') {
              for (const group of teachingResources.value) {
                const found = group.resourceList?.find(r => String(r.resourceId) === urlResourceId)
                if (found) {
                  targetResource = found
                  break
                }
              }
            } else if (activeTab.value === 'task') {
              for (const group of taskResources.value) {
                const found = group.resourceList?.find(r => String(r.resourceId) === urlResourceId)
                if (found) {
                  targetResource = found
                  break
                }
              }
            } else if (activeTab.value === 'personal') {
              for (const group of personalResourceGroups.value) {
                const found = group.resourceList?.find(r => String(r.resourceId) === urlResourceId)
                if (found) {
                  targetResource = found
                  break
                }
              }
            }
            
            // 找到资源后自动选中预览
            if (targetResource) {
              await selectResource(targetResource)
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(t('prepare.loadCourseDetailFailed'), error)
  }
  // 初始化完成，允许 watch 正常工作
  isInitialLoad.value = false
})
onUnmounted(() => document.removeEventListener('click', closeDropdown))

// 返回上一页
const goBack = () => {
  router.back()
}

const courseInfo = ref({ name: '', id: '' })
const chapterList = ref<{ id: string; name: string }[]>([])
const currentChapterId = ref<string>('')
const dropdownOpen = ref(false)
const activeTab = ref('resource')
const panelCollapsed = ref(false)
// 标记是否是初始化加载（用于跳过 watch 中的自动选中逻辑）
const isInitialLoad = ref(true)

// 监听 tab 切换
watch(activeTab, async () => {
  // 初始化加载时跳过，由 onMounted 处理自动选中
  if (isInitialLoad.value) return
  
  // 切换 tab 时清空右侧预览
  selectedResource.value = null
  pptPreviewUrl.value = ''
  
  if (currentChapterId.value) {
    await loadChapterResources(currentChapterId.value)
    
    // 切换到个人资源 tab 时自动选中第一个资源并预览
    if (activeTab.value === 'personal') {
      const firstGroup = personalResourceGroups.value[0]
      const firstResource = firstGroup?.resourceList?.[0]
      if (firstResource) {
        selectResource(firstResource)
      }
    }
  }
})

// 计算当前章节名称
const currentChapterName = computed(() => {
  const chapter = chapterList.value.find(c => c.id === currentChapterId.value)
  return chapter?.name || t('prepare.selectChapter')
})

const selectChapter = async (chapter: { id: string; name: string }) => {
  currentChapterId.value = chapter.id
  dropdownOpen.value = false
  
  // 切换章节时清空右侧预览
  selectedResource.value = null
  pptPreviewUrl.value = ''
  
  // 切换章节时加载对应章节的资源
  await loadChapterResources(chapter.id)
  
  // 如果是个人资源 tab，自动选中第一个资源并预览
  if (activeTab.value === 'personal') {
    const firstGroup = personalResourceGroups.value[0]
    const firstResource = firstGroup?.resourceList?.[0]
    if (firstResource) {
      selectResource(firstResource)
    }
  }
}
// tabs 使用 computed 以支持动态语言切换
const tabs = computed(() => [
  { label: t('prepare.teachingResource'), value: 'resource', resourceType: 1 },
  { label: t('prepare.learningTask'), value: 'task', resourceType: 2 },
  { label: t('prepare.personalResourceEditable'), value: 'personal', resourceType: 3 }
])

// 资源项接口定义
interface ResourceItem {
  resourceId: number
  chapterId: string
  resourceType: number
  resourceCategory: number
  resourceName: string
  ossId: string
  fileName: string
  modifyNum: number
  resourceUrl?: string
}
interface ResourceGroup {
  resourceCategory: number | null
  resourceName: string
  resourceList: ResourceItem[]
}

// 教学资源数据
const teachingResources = ref<ResourceGroup[]>([])
// 学习任务数据
const taskResources = ref<ResourceGroup[]>([])
// 个人资源数据
const personalResourceGroups = ref<ResourceGroup[]>([])

// 展开状态
const expandedSections = reactive<Record<string, boolean>>({})

// 根据文件名获取文件类型
const getFileType = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    doc: 'word',
    docx: 'word',
    ppt: 'ppt',
    pptx: 'ppt',
    xls: 'excel',
    xlsx: 'excel',
    pdf: 'pdf',
    ucd: 'ucd',
    mc: 'mc',
    // 图片类型
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    webp: 'image',
    svg: 'image',
    // 视频类型
    mp4: 'video',
    mov: 'video',
    webm: 'video'
  }
  return typeMap[ext] || 'default'
}

// 获取当前 tab 对应的 resourceType
const getCurrentResourceType = () => {
  const currentTab = tabs.value.find(tab => tab.value === activeTab.value)
  return currentTab?.resourceType || 1
}

// 加载章节资源
const loadChapterResources = async (chapterId: string, resourceType?: number) => {
  try {
    const type = resourceType ?? getCurrentResourceType()
    const data = await getChapterResourceList(chapterId, type)
    if (data) {
      if (type === 1) {
        teachingResources.value = data || []
        teachingResources.value.forEach(group => {
          if (expandedSections[group.resourceName] === undefined) {
            expandedSections[group.resourceName] = true
          }
        })
      } else if (type === 2) {
        taskResources.value = data || []
        taskResources.value.forEach(group => {
          if (expandedSections[group.resourceName] === undefined) {
            expandedSections[group.resourceName] = true
          }
        })
      } else if (type === 3) {
        personalResourceGroups.value = data || []
        personalResourceGroups.value.forEach(group => {
          if (expandedSections[group.resourceName] === undefined) {
            expandedSections[group.resourceName] = true
          }
        })
      }
    }
  } catch (error) {
    console.error(t('prepare.loadChapterResourceFailed'), error)
  }
}

// 切换分组展开状态
const toggleSection = (name: string) => {
  expandedSections[name] = !expandedSections[name]
}

const selectedResource = ref<ResourceItem | null>(null)
const previewLoading = ref(false)

const getIconClass = (type: string) => ({ word: 'icon-word', ppt: 'icon-ppt', pdf: 'icon-pdf', ucd: 'icon-ucd', excel: 'icon-excel', image: 'icon-image', video: 'icon-video' }[type] || 'icon-default')
const getIconText = (type: string) => ({ word: 'W', ppt: 'P', pdf: 'PDF', ucd: 'ucd', excel: 'X', image: 'IMG', video: 'MP4' }[type] || '?')

// 引入图标图片
import pptIcon from '~/assets/images/ppt.png'
import docIcon from '~/assets/images/doc.png'
import xlsIcon from '~/assets/images/xls.png'
import pdfIcon from '~/assets/images/pdf.png'
import mp4Icon from '~/assets/images/mp4.png'
import pngIcon from '~/assets/images/png.png'

// 根据文件类型获取图标图片路径
const getFileIconSrc = (type: string) => {
  const iconMap: Record<string, string> = {
    ppt: pptIcon, // 暂时用pdf图标代替ppt
    word: docIcon,
    excel: xlsIcon,
    pdf: pdfIcon,
    video: mp4Icon,
    image: pngIcon
  }
  return iconMap[type] || docIcon
}

// 我要修改（modifyNum === 0 时）
const startModify = async (item: ResourceItem) => {
  try {
    await copyChapterResource(String(item.resourceId))
    ElMessage.success(t('prepare.copySuccess'))
    // 刷新教学资源列表
    if (currentChapterId.value) {
      await loadChapterResources(currentChapterId.value, 1)
    }
  } catch (error) {
    console.error(t('prepare.modifyFailed'), error)
  }
}

// 继续修改（modifyNum >= 1 时）
const continueModify = async (item: ResourceItem) => {
  try {
    await copyChapterResource(String(item.resourceId))
    ElMessage.success(t('prepare.copySuccess'))
    // 切换到个人资源 tab
    activeTab.value = 'personal'
    // 刷新个人资源列表
    if (currentChapterId.value) {
      await loadChapterResources(currentChapterId.value, 3)
      // 默认选中第一个资源
      const firstGroup = personalResourceGroups.value[0]
      const firstResource = firstGroup?.resourceList?.[0]
      if (firstResource) {
        selectResource(firstResource)
      }
    }
  } catch (error) {
    console.error(t('prepare.continueModifyFailed'), error)
  }
}

// 新增副本（modifyNum >= 1 时）
const addCopy = async (item: ResourceItem) => {
  try {
    await copyChapterResource(String(item.resourceId))
    ElMessage.success(t('prepare.copySuccess'))
    // 刷新教学资源列表
    if (currentChapterId.value) {
      await loadChapterResources(currentChapterId.value, 1)
    }
  } catch (error) {
    console.error(t('prepare.addCopyFailed'), error)
  }
}

const downloadResource = async (item: ResourceItem) => {
  if (item.ossId) {
    try {
      const blobUrl = await downloadOSS(item.ossId)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = item.fileName
      link.click()
      // 释放 blob URL
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error(t('prepare.downloadFailed'), error)
    }
  }
}
const deletePersonalResource = async (item: ResourceItem) => {
  try {
    await deleteChapterResource(String(item.resourceId))
    // 重新加载个人资源列表
    if (currentChapterId.value) {
      await loadChapterResources(currentChapterId.value, 3)
      // 删除后自动选中第一个资源
      const firstGroup = personalResourceGroups.value[0]
      const firstResource = firstGroup?.resourceList?.[0]
      if (firstResource) {
        selectResource(firstResource)
      } else {
        selectedResource.value = null
      }
    }
  } catch (error) {
    console.error(t('prepare.deleteResourceFailed'), error)
  }
}

// 上传资源完成后刷新列表
const handleResourceUploaded = () => {
  if (currentChapterId.value) {
    loadChapterResources(currentChapterId.value, 3) // 刷新个人资源
  }
}
const handleFinish = () => router.push(`/system/course/${route.params.id}`)

// 编辑 UCD 文件
const editUcdFile = (item: ResourceItem) => {
  // TODO: 实现 UCD 编辑功能
  ElMessage.info(t('prepare.ucdEditInDev'))
}

// 编辑 MC 文件
const editMcFile = (item: ResourceItem) => {
  // TODO: 实现 MC 编辑功能
  ElMessage.info(t('prepare.mcEditInDev'))
}

// 获取运行时配置
const config = useRuntimeConfig()

// Base64 编码函数
const base64Encode = (str: string): string => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
}

// PPT 预览 URL
const pptPreviewUrl = ref('')

// 生成 PPT 预览地址
const getPptPreviewUrl = (url: string): string => {
  const previewBaseUrl = (config.public.previewBaseUrl as string)?.trim() || 'http://192.168.0.145:8012'
  return `${previewBaseUrl}/onlinePreview?url=${encodeURIComponent(base64Encode(url))}`
}

const selectResource = async (item: ResourceItem) => {
  console.log(item)
  if (selectedResource.value?.resourceId === item.resourceId) return
  pptPreviewUrl.value = ''
  selectedResource.value = item
  previewLoading.value = true
  const fileType = getFileType(item.fileName)
  console.log(fileType, '类型')
  try {
    if (['word', 'ppt', 'pdf', 'image', 'excel'].includes(fileType) && item.resourceUrl) {
      // Word/PPT/PDF/图片/Excel 使用 iframe 预览
      pptPreviewUrl.value = getPptPreviewUrl(item.resourceUrl)
      previewLoading.value = false
    } else if (fileType === 'ucd') {
      // UCD 文件显示预览卡片
      previewLoading.value = false
    } else if (fileType === 'mc') {
      // MC 文件显示预览卡片
      previewLoading.value = false
    } else if (fileType === 'video') {
      // 视频文件直接播放
      previewLoading.value = false
    } else {
      previewLoading.value = false
    }
  } catch (error) {
    console.error(t('prepare.loadFailed'), error)
    previewLoading.value = false
  }
}
</script>