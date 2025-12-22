<template>
  <div class="prepare-page">
    <!-- 顶部导航 -->
    <div class="prepare-header">
      <div class="header-left">
        <NuxtLink :to="`/system/course/${route.params.id}`" class="back-link">
          <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </NuxtLink>
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
              <div 
                v-for="chapter in chapterList" 
                :key="chapter.id" 
                class="dropdown-item"
                :class="{ active: chapter.id === currentChapterId }"
                @click="selectChapter(chapter)"
              >
                {{ chapter.name }}
              </div>
            </div>
          </Transition>
        </div>
      </div>
      <div class="header-center"><span class="status-tag">🎓 备课中...</span></div>
      <div class="header-right">
        <button class="btn-outline" @click="showStudentVisibleModal = true">设置学生可见资源</button>
        <button class="btn-white" @click="handleFinish">退出备课</button>
      </div>
    </div>

    <div class="prepare-body">
      <!-- 左侧整体容器 (Tab栏 + 资源面板) -->
      <div class="left-sidebar" :class="{ collapsed: panelCollapsed }">
        <!-- 左侧 Tab 栏 -->
        <div class="tab-sidebar">
          <button v-for="tab in tabs" :key="tab.value" class="tab-item" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value">
            <div class="tab-icon-wrapper">
              <svg v-if="tab.value === 'resource'" class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <svg v-else-if="tab.value === 'task'" class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <!-- 课件分组 -->
            <div class="resource-section">
              <div class="section-header" @click="expandedSections.courseware = !expandedSections.courseware">
                <svg class="section-arrow" :class="{ expanded: expandedSections.courseware }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>课件 ({{ resources.courseware.length }})</span>
              </div>
              <div v-if="expandedSections.courseware" class="section-content">
                <div v-for="item in resources.courseware" :key="item.id" class="resource-item" :class="{ active: selectedResource?.id === item.id }" @click="selectResource(item)">
                  <div class="item-icon" :class="getIconClass(item.type)">{{ getIconText(item.type) }}</div>
                  <div class="item-info">
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                  <button class="item-download" @click.stop="downloadResource(item)" title="下载">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 学生手册分组 -->
            <div class="resource-section">
              <div class="section-header" @click="expandedSections.handbook = !expandedSections.handbook">
                <svg class="section-arrow" :class="{ expanded: expandedSections.handbook }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>学生手册 ({{ resources.handbook.length }})</span>
              </div>
              <div v-if="expandedSections.handbook" class="section-content">
                <div v-for="item in resources.handbook" :key="item.id" class="resource-item" :class="{ active: selectedResource?.id === item.id }" @click="selectResource(item)">
                  <div class="item-icon" :class="getIconClass(item.type)">{{ getIconText(item.type) }}</div>
                  <div class="item-info">
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                  <button class="item-download" @click.stop="downloadResource(item)" title="下载">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 学习任务 Tab 内容 -->
          <div v-else-if="activeTab === 'task'" class="empty-content">
            <svg class="empty-svg" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="80" fill="#f5f5f5"/>
              <rect x="60" y="60" width="80" height="100" rx="8" fill="white" stroke="#e0e0e0" stroke-width="2"/>
              <line x1="75" y1="85" x2="125" y2="85" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
              <line x1="75" y1="105" x2="115" y2="105" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
              <line x1="75" y1="125" x2="105" y2="125" stroke="#e0e0e0" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <p class="empty-text">暂无数据</p>
          </div>

          <!-- 个人资源 Tab 内容 -->
          <div v-else-if="activeTab === 'personal'" class="personal-resource-panel">
            <!-- 顶部按钮 -->
            <div class="personal-header">
              <button class="btn-primary" @click="showLinkModal = true">关联平台资源</button>
              <button class="btn-primary" @click="showUploadModal = true">上传个人资源</button>
            </div>
            
            <div class="resource-list">
              <!-- AI生成类资源 -->
              <div class="resource-section">
                <div class="section-header" @click="expandedSections.aiGenerated = !expandedSections.aiGenerated">
                  <svg class="section-arrow" :class="{ expanded: expandedSections.aiGenerated }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>AI生成类资源 ({{ personalResources.aiGenerated.length }})</span>
                </div>
                <div v-if="expandedSections.aiGenerated" class="section-content">
                  <div v-for="item in personalResources.aiGenerated" :key="item.id" class="resource-item" :class="{ active: selectedResource?.id === item.id }" @click="selectResource(item)">
                    <div class="item-icon" :class="getIconClass(item.type)">{{ getIconText(item.type) }}</div>
                    <div class="item-info">
                      <span class="item-name">{{ item.name }}</span>
                    </div>
                    <button class="item-delete" @click.stop="deletePersonalResource(item)" title="删除">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 课程资源 -->
              <div class="resource-section">
                <div class="section-header" @click="expandedSections.courseResource = !expandedSections.courseResource">
                  <svg class="section-arrow" :class="{ expanded: expandedSections.courseResource }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>课程资源 ({{ personalResources.courseResource.length }})</span>
                </div>
                <div v-if="expandedSections.courseResource" class="section-content">
                  <p v-if="personalResources.courseResource.length === 0" class="section-tip">上传的资源文件，上传后其他资源将以课堂为课程资源，请谨慎支持资源~</p>
                  <div v-for="item in personalResources.courseResource" :key="item.id" class="resource-item" :class="{ active: selectedResource?.id === item.id }" @click="selectResource(item)">
                    <div class="item-icon" :class="getIconClass(item.type)">{{ getIconText(item.type) }}</div>
                    <div class="item-info">
                      <span class="item-name">{{ item.name }}</span>
                    </div>
                    <span v-if="item.canDelete" class="item-action-text" @click.stop="deletePersonalResource(item)">删除</span>
                    <button class="item-download" @click.stop="downloadResource(item)" title="下载">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 个人程序 -->
              <div class="resource-section">
                <div class="section-header" @click="expandedSections.personalProgram = !expandedSections.personalProgram">
                  <svg class="section-arrow" :class="{ expanded: expandedSections.personalProgram }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>个人程序 ({{ personalResources.personalProgram.length }})</span>
                </div>
                <div v-if="expandedSections.personalProgram" class="section-content">
                  <div v-for="item in personalResources.personalProgram" :key="item.id" class="resource-item" :class="{ active: selectedResource?.id === item.id }" @click="selectResource(item)">
                    <div class="item-icon" :class="getIconClass(item.type)">{{ getIconText(item.type) }}</div>
                    <div class="item-info">
                      <span class="item-name">{{ item.name }}</span>
                    </div>
                    <button class="item-delete" @click.stop="deletePersonalResource(item)" title="删除">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- AI实训资源 -->
              <div class="resource-section">
                <div class="section-header" @click="expandedSections.aiTraining = !expandedSections.aiTraining">
                  <svg class="section-arrow" :class="{ expanded: expandedSections.aiTraining }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>AI实训资源 ({{ personalResources.aiTraining.length }})</span>
                </div>
                <div v-if="expandedSections.aiTraining" class="section-content">
                  <div v-for="item in personalResources.aiTraining" :key="item.id" class="resource-item" :class="{ active: selectedResource?.id === item.id }" @click="selectResource(item)">
                    <div class="item-icon" :class="getIconClass(item.type)">{{ getIconText(item.type) }}</div>
                    <div class="item-info">
                      <span class="item-name">{{ item.name }}</span>
                    </div>
                    <button class="item-delete" @click.stop="deletePersonalResource(item)" title="删除">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 自定义练习题 -->
              <div class="resource-section">
                <div class="section-header" @click="expandedSections.customExercise = !expandedSections.customExercise">
                  <svg class="section-arrow" :class="{ expanded: expandedSections.customExercise }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span>自定义练习题 ({{ personalResources.customExercise.length }})</span>
                </div>
                <div v-if="expandedSections.customExercise" class="section-content">
                  <div v-for="item in personalResources.customExercise" :key="item.id" class="resource-item" :class="{ active: selectedResource?.id === item.id }" @click="selectResource(item)">
                    <div class="item-icon" :class="getIconClass(item.type)">{{ getIconText(item.type) }}</div>
                    <div class="item-info">
                      <span class="item-name">{{ item.name }}</span>
                    </div>
                    <button class="item-delete" @click.stop="deletePersonalResource(item)" title="删除">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 折叠按钮 -->
        <button class="collapse-btn" @click="panelCollapsed = !panelCollapsed">
          <svg class="collapse-icon" :class="{ rotated: panelCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- 右侧预览区域 -->
      <div class="preview-area">
        <!-- 学习任务 Tab 的空状态 -->
        <div v-if="activeTab === 'task'" class="preview-empty-large">
          <svg class="empty-svg-large" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" fill="#f0f0f0"/>
            <rect x="55" y="50" width="90" height="110" rx="8" fill="white" stroke="#ddd" stroke-width="2"/>
            <circle cx="80" cy="80" r="8" fill="#e8e8e8"/>
            <line x1="95" y1="80" x2="130" y2="80" stroke="#e8e8e8" stroke-width="3" stroke-linecap="round"/>
            <circle cx="80" cy="105" r="8" fill="#e8e8e8"/>
            <line x1="95" y1="105" x2="125" y2="105" stroke="#e8e8e8" stroke-width="3" stroke-linecap="round"/>
            <circle cx="80" cy="130" r="8" fill="#e8e8e8"/>
            <line x1="95" y1="130" x2="120" y2="130" stroke="#e8e8e8" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <p class="empty-text-large">暂无数据</p>
        </div>
        <div v-else-if="previewLoading" class="preview-loading"><div class="spinner"></div><span>加载中...</span></div>
        <div v-else-if="!selectedResource" class="preview-empty"><p>请从左侧选择资源进行预览</p></div>
        <div v-else class="preview-content">
          <div v-if="selectedResource.type === 'word'" class="doc-preview">
            <div v-if="wordError" class="word-error">
              <p>⚠️ {{ wordError }}</p>
              <p class="error-hint">仅支持 .docx 格式，不支持旧版 .doc 格式</p>
            </div>
            <div v-else ref="docxContainerRef" class="docx-container"></div>
          </div>
          <div v-else-if="selectedResource.type === 'pdf'" class="pdf-preview-wrapper" @wheel="handleWheel">
            <div class="pdf-page-container" :style="{ visibility: pdfReady ? 'visible' : 'hidden' }">
              <canvas ref="pdfCanvasRef" class="pdf-canvas"></canvas>
              <canvas ref="annotationCanvasRef" class="annotation-canvas" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"></canvas>
              <div v-if="currentTool === 'laser'" class="laser-pointer" :style="laserStyle"></div>
            </div>
          </div>
          <div v-else class="preview-unsupported"><p>暂不支持预览该类型文件</p></div>
        </div>
      </div>
    </div>

    <!-- 底部工具栏 - 仅在 PDF 预览时显示 -->
    <div class="toolbar" v-if="activeTab === 'resource' && selectedResource?.type === 'pdf'">
      <div class="toolbar-left">
        <button class="tool-btn" @click="prevPage" :disabled="pdfCurrentPage <= 1">‹</button>
        <span class="page-info">{{ pdfCurrentPage }} / {{ pdfTotalPages || 1 }}</span>
        <button class="tool-btn" @click="nextPage" :disabled="pdfCurrentPage >= pdfTotalPages">›</button>
        <span class="divider"></span>
        <span class="tool-label">跳转第</span>
        <input type="number" v-model.number="jumpPage" class="page-input" min="1" :max="pdfTotalPages" @keyup.enter="goToPage" />
        <span class="tool-label">页</span>
        <button class="tool-btn small" @click="goToPage">跳转</button>
      </div>
      <div class="toolbar-center">
        <button class="tool-btn icon" :class="{ active: currentTool === 'pencil' }" @click="setTool('pencil')" title="铅笔">✏️</button>
        <button class="tool-btn icon" :class="{ active: currentTool === 'brush' }" @click="setTool('brush')" title="画笔">🖌️</button>
        <button class="tool-btn icon" :class="{ active: currentTool === 'highlighter' }" @click="setTool('highlighter')" title="荧光笔">🖍️</button>
        <button class="tool-btn icon" :class="{ active: currentTool === 'eraser' }" @click="setTool('eraser')" title="橡皮擦">🧹</button>
        <button class="tool-btn icon" :class="{ active: currentTool === 'laser' }" @click="setTool('laser')" title="激光笔">🔴</button>
        <span class="divider"></span>
        <input type="color" v-model="penColor" class="color-picker" title="画笔颜色" />
        <select v-model="penWidth" class="width-select" title="线宽">
          <option :value="2">细</option>
          <option :value="4">中</option>
          <option :value="8">粗</option>
        </select>
        <span class="divider"></span>
        <button class="tool-btn" @click="clearAnnotations">清除标注</button>
      </div>
      <div class="toolbar-right">
        <button class="tool-btn" @click="zoomOut">−</button>
        <span class="zoom-value">{{ Math.round(previewScale * 100) }}%</span>
        <button class="tool-btn" @click="zoomIn">+</button>
      </div>
    </div>

    <!-- 上传个人资源弹窗 -->
    <UploadPersonalResourceModal v-model:visible="showUploadModal" />
    
    <!-- 关联平台资源弹窗 -->
    <LinkPlatformResourceModal v-model:visible="showLinkModal" />
    
    <!-- 设置学生可见资源弹窗 -->
    <SetStudentVisibleModal v-model:visible="showStudentVisibleModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed, onUnmounted } from 'vue'
import { cursorAdmin } from '~/composables/api/curosr'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const router = useRouter()
const { getCursorDetail } = cursorAdmin()

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
onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))

const courseInfo = ref({ name: '', id: '' })
const chapterList = ref<{ id: number; name: string }[]>([])
const currentChapterId = ref<number>(0)
const dropdownOpen = ref(false)
const activeTab = ref('resource')
const panelCollapsed = ref(false)

// 计算当前章节名称
const currentChapterName = computed(() => {
  const chapter = chapterList.value.find(c => c.id === currentChapterId.value)
  return chapter?.name || '选择章节'
})

const selectChapter = (chapter: { id: number; name: string }) => {
  currentChapterId.value = chapter.id
  dropdownOpen.value = false
  // 切换章节时可以加载对应章节的资源
  console.log('切换到章节:', chapter.name)
}
const tabs = [
  { label: '教学资源', value: 'resource' },
  { label: '学习任务', value: 'task' },
  { label: '个人资源\n(可修改)', value: 'personal' }
]

interface Resource { id: number; name: string; type: string; url: string; visible?: boolean; canDelete?: boolean }
const resources = reactive({
  courseware: [
    { id: 1, name: '主题11-活动课：未来之家（学生主题）V1.5.docx', type: 'word', url: 'http://192.168.0.30:9000/mata/2025/12/22/8e3ceba623c64d32bcced390d35e9832.docx', visible: false }
  ] as Resource[],
  handbook: [
    { id: 2, name: '主题11-活动课：未来之家（学生主题）V1.5.docx', type: 'word', url: 'http://192.168.0.30:9000/mata/2025/12/22/8e3ceba623c64d32bcced390d35e9832.docx', visible: true },
    { id: 3, name: '测试PDF文档.pdf', type: 'pdf', url: 'http://192.168.0.30:9000/mata/2025/12/22/e98407271692446da69888b8068c0bfc.pdf', visible: true }
  ] as Resource[]
})

// 个人资源数据
const personalResources = reactive({
  aiGenerated: [] as Resource[],
  courseResource: [
    { id: 101, name: 'SD单元测试报告 - 脚本.doc', type: 'word', url: '', canDelete: true },
    { id: 102, name: '主题01-"悟空"来了（教师用书）V1.5.docx', type: 'word', url: 'http://192.168.0.30:9000/mata/2025/12/22/8e3ceba623c64d32bcced390d35e9832.docx' }
  ] as Resource[],
  personalProgram: [
    { id: 201, name: '今天学习的几个快捷键', type: 'ucd', url: '' }
  ] as Resource[],
  aiTraining: [
    { id: 301, name: 'AI实训资源1', type: 'pdf', url: '' },
    { id: 302, name: 'AI实训资源2', type: 'pdf', url: '' },
  
  ] as Resource[],
  customExercise: [
    { id: 401, name: '自定义练习题1', type: 'pdf', url: '' }
  ] as Resource[]
})

const expandedSections = reactive({ 
  courseware: true, 
  handbook: true,
  aiGenerated: true,
  courseResource: true,
  personalProgram: true,
  aiTraining: true,
  customExercise: true
})
const selectedResource = ref<Resource | null>(null)
const previewLoading = ref(false)
const previewScale = ref(1)
const wordError = ref('')
const pdfReady = ref(false)

const pdfCanvasRef = ref<HTMLCanvasElement | null>(null)
const annotationCanvasRef = ref<HTMLCanvasElement | null>(null)
const docxContainerRef = ref<HTMLElement | null>(null)
let pdfDoc: any = null
const pdfCurrentPage = ref(1)
const pdfTotalPages = ref(0)
const jumpPage = ref(1)

const currentTool = ref<string>('')
const penColor = ref('#FF0000')
const penWidth = ref(4)
const isDrawing = ref(false)
let lastX = 0, lastY = 0
const laserStyle = ref({ left: '0px', top: '0px', display: 'none' })
const pageAnnotations = ref<Map<number, ImageData>>(new Map())

const getIconClass = (type: string) => ({ word: 'icon-word', ppt: 'icon-ppt', pdf: 'icon-pdf', ucd: 'icon-ucd' }[type] || 'icon-default')
const getIconText = (type: string) => ({ word: 'W', ppt: 'P', pdf: 'PDF', ucd: 'ucd' }[type] || '?')
const downloadResource = (item: Resource) => {
  const link = document.createElement('a')
  link.href = item.url
  link.download = item.name
  link.target = '_blank'
  link.click()
}
const deletePersonalResource = (item: Resource) => {
  // 删除个人资源
  const categories = ['aiGenerated', 'courseResource', 'personalProgram', 'aiTraining', 'customExercise'] as const
  for (const category of categories) {
    const index = personalResources[category].findIndex(r => r.id === item.id)
    if (index > -1) {
      personalResources[category].splice(index, 1)
      if (selectedResource.value?.id === item.id) {
        selectedResource.value = null
      }
      break
    }
  }
}
const handleFinish = () => router.push(`/system/course/${route.params.id}`)

const selectResource = async (item: Resource) => {
  if (selectedResource.value?.id === item.id) return
  pdfReady.value = false
  selectedResource.value = item
  previewLoading.value = true
  try {
    if (item.type === 'word' && item.url) {
      await nextTick()
      await loadWord(item.url)
      previewLoading.value = false
    } else if (item.type === 'pdf' && item.url) {
      await loadPdf(item.url)
    } else {
      previewLoading.value = false
    }
  } catch (error) {
    console.error('加载失败:', error)
    previewLoading.value = false
  }
}

const loadWord = async (url: string) => {
  wordError.value = ''
  try {
    // 检查文件扩展名
    if (url.toLowerCase().endsWith('.doc') && !url.toLowerCase().endsWith('.docx')) {
      wordError.value = '不支持 .doc 格式文件'
      return
    }
    const { renderAsync } = await import('docx-preview')
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    if (docxContainerRef.value) {
      docxContainerRef.value.innerHTML = ''
      await renderAsync(arrayBuffer, docxContainerRef.value, undefined, {
        className: 'docx-wrapper',
        inWrapper: true,
        breakPages: true,
        useBase64URL: true,
        ignoreWidth: false,
        ignoreHeight: false,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true
      })
    }
  } catch (error: any) {
    console.error('Word加载失败:', error)
    if (error.message?.includes('zip') || error.message?.includes('central directory')) {
      wordError.value = '文件格式不正确，可能是 .doc 格式'
    } else {
      wordError.value = '文件加载失败'
    }
  }
}

const loadPdf = async (url: string) => {
  pdfReady.value = false
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  pdfTotalPages.value = pdfDoc.numPages
  pdfCurrentPage.value = 1
  jumpPage.value = 1
  pageAnnotations.value.clear()
  
  // 先关闭 loading 让 canvas 渲染出来
  previewLoading.value = false
  await nextTick()
  // 然后渲染 PDF 内容
  await renderCurrentPage()
  pdfReady.value = true
}

const renderCurrentPage = async () => {
  if (!pdfDoc || !pdfCanvasRef.value || !annotationCanvasRef.value) return
  const page = await pdfDoc.getPage(pdfCurrentPage.value)
  const viewport = page.getViewport({ scale: 1.5 * previewScale.value })
  const canvas = pdfCanvasRef.value
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  const annoCanvas = annotationCanvasRef.value
  annoCanvas.width = viewport.width
  annoCanvas.height = viewport.height
  const savedAnnotation = pageAnnotations.value.get(pdfCurrentPage.value)
  if (savedAnnotation) annoCanvas.getContext('2d')?.putImageData(savedAnnotation, 0, 0)
}

const saveCurrentAnnotation = () => {
  if (!annotationCanvasRef.value) return
  const ctx = annotationCanvasRef.value.getContext('2d')
  if (ctx) pageAnnotations.value.set(pdfCurrentPage.value, ctx.getImageData(0, 0, annotationCanvasRef.value.width, annotationCanvasRef.value.height))
}

const prevPage = async () => { if (pdfCurrentPage.value > 1) { saveCurrentAnnotation(); pdfCurrentPage.value--; jumpPage.value = pdfCurrentPage.value; await renderCurrentPage() } }
const nextPage = async () => { if (pdfCurrentPage.value < pdfTotalPages.value) { saveCurrentAnnotation(); pdfCurrentPage.value++; jumpPage.value = pdfCurrentPage.value; await renderCurrentPage() } }
const goToPage = async () => { if (jumpPage.value >= 1 && jumpPage.value <= pdfTotalPages.value && jumpPage.value !== pdfCurrentPage.value) { saveCurrentAnnotation(); pdfCurrentPage.value = jumpPage.value; await renderCurrentPage() } }

const setTool = (tool: string) => { currentTool.value = currentTool.value === tool ? '' : tool }

const startDrawing = (e: MouseEvent) => {
  if (!currentTool.value || currentTool.value === 'laser') return
  isDrawing.value = true
  const rect = annotationCanvasRef.value!.getBoundingClientRect()
  lastX = e.clientX - rect.left
  lastY = e.clientY - rect.top
}

const draw = (e: MouseEvent) => {
  if (!annotationCanvasRef.value) return
  const rect = annotationCanvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  if (currentTool.value === 'laser') { laserStyle.value = { left: `${x - 8}px`, top: `${y - 8}px`, display: 'block' }; return }
  if (!isDrawing.value || !currentTool.value) return
  const ctx = annotationCanvasRef.value.getContext('2d')!
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (currentTool.value === 'eraser') { ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = penWidth.value * 3 }
  else { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = penColor.value; ctx.lineWidth = currentTool.value === 'pencil' ? 2 : currentTool.value === 'highlighter' ? penWidth.value * 2 : penWidth.value; ctx.globalAlpha = currentTool.value === 'highlighter' ? 0.3 : 1 }
  ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke()
  lastX = x; lastY = y
}

const stopDrawing = () => { isDrawing.value = false; if (currentTool.value === 'laser') laserStyle.value.display = 'none' }

const clearAnnotations = () => {
  if (!annotationCanvasRef.value) return
  annotationCanvasRef.value.getContext('2d')?.clearRect(0, 0, annotationCanvasRef.value.width, annotationCanvasRef.value.height)
  pageAnnotations.value.delete(pdfCurrentPage.value)
}

const zoomIn = async () => { if (previewScale.value < 2) { saveCurrentAnnotation(); previewScale.value = Math.min(2, previewScale.value + 0.1); await renderCurrentPage() } }
const zoomOut = async () => { if (previewScale.value > 0.5) { saveCurrentAnnotation(); previewScale.value = Math.max(0.5, previewScale.value - 0.1); await renderCurrentPage() } }

// 鼠标滚轮翻页
let wheelTimeout: any = null
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (wheelTimeout) return // 防抖，避免翻太快
  wheelTimeout = setTimeout(() => { wheelTimeout = null }, 300)
  if (e.deltaY > 0) nextPage()
  else if (e.deltaY < 0) prevPage()
}

onMounted(async () => {
  try {
    const data = await getCursorDetail(String(route.params.id))
    if (data) {
      courseInfo.value.name = data.courseName || ''
      // 加载章节列表
      if (data.chapterList?.length) {
        chapterList.value = data.chapterList.map((c: any) => ({
          id: c.chapterId,
          name: c.chapterName
        }))
        // 默认选中第一个章节，或者从 URL 参数获取
        const chapterIdFromUrl = route.query.chapterId ? Number(route.query.chapterId) : null
        currentChapterId.value = chapterIdFromUrl || chapterList.value[0]?.id || 0
      }
    }
    const resourceUrl = route.query.resourceUrl as string
    const resourceName = route.query.resourceName as string
    const resourceType = route.query.resourceType as string
    if (resourceUrl && resourceName && resourceType) await selectResource({ id: Date.now(), name: decodeURIComponent(resourceName), type: resourceType, url: decodeURIComponent(resourceUrl) })
  } catch (error) { console.error('加载失败:', error) }
})
</script>

<style scoped>
.prepare-page { height: 100vh; display: flex; flex-direction: column; background: #f0f0f0; }
.prepare-header { display: flex; align-items: center; justify-content: space-between; padding: 0 20px; height: 50px; background: #2cb0ff; color: white; flex-shrink: 0; }
.header-left { display: flex; align-items: center; gap: 8px; }
.back-link { display: flex; align-items: center; color: white; text-decoration: none; }
.back-link:hover { opacity: 0.8; }
.back-icon { width: 22px; height: 22px; }

/* 自定义下拉框 */
.chapter-dropdown { position: relative; }
.dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: white;
  padding: 8px 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.dropdown-trigger:hover { opacity: 0.9; }
.dropdown-text { max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.dropdown-arrow { width: 18px; height: 18px; transition: transform 0.3s ease; stroke: white; }
.chapter-dropdown.open .dropdown-arrow { transform: rotate(180deg); }
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 240px;
  max-height: 320px;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  z-index: 1000;
  padding: 8px 0;
}
.dropdown-item {
  padding: 12px 18px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.15s;
}
.dropdown-item:hover { background: #f5f7fa; }
.dropdown-item.active { background: #e6f7ff; color: #2cb0ff; font-weight: 500; }

/* 下拉框过渡动画 */
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.25s ease;
  transform-origin: top;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.9) translateY(-8px);
}
.dropdown-enter-to, .dropdown-leave-from {
  opacity: 1;
  transform: scaleY(1) translateY(0);
}

.status-tag { font-size: 14px; letter-spacing: 1px; }
.header-right { display: flex; gap: 12px; }
.btn-outline {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: transparent;
  color: white;
  border: 1px solid rgba(255,255,255,0.5);
  transition: all 0.2s;
}
.btn-outline:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.8); }
.btn-white {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  background: white;
  color: #2cb0ff;
  border: none;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-white:hover { background: #f0f0f0; }
.prepare-body { flex: 1; display: flex; overflow: hidden; }

/* 左侧整体容器 */
.left-sidebar { display: flex; position: relative; flex-shrink: 0; }
.left-sidebar.collapsed { width: 0; }
.left-sidebar.collapsed .tab-sidebar,
.left-sidebar.collapsed .resource-panel { width: 0; overflow: hidden; opacity: 0; padding: 0; border: none; }

.tab-sidebar { width: 90px; background: white; display: flex; flex-direction: column; flex-shrink: 0; border-right: 1px solid #e8e8e8; padding: 12px 8px; gap: 8px; }
.tab-item { display: flex; flex-direction: column; align-items: center; padding: 14px 6px; background: none; border: none; color: #666; cursor: pointer; border-radius: 8px; transition: all 0.2s; }
.tab-item:hover { background: #f0f7ff; color: #2cb0ff; }
.tab-item.active { background: #2cb0ff; color: white; }
.tab-icon-wrapper { width: 28px; height: 28px; margin-bottom: 6px; }
.tab-svg { width: 100%; height: 100%; }
.tab-label { font-size: 12px; white-space: pre-line; text-align: center; line-height: 1.4; }
.resource-panel { width: 300px; background: white; display: flex; flex-direction: column; flex-shrink: 0; border-right: 1px solid #e8e8e8; }
.empty-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; padding: 40px 20px; }
.empty-svg { width: 120px; height: 120px; margin-bottom: 16px; }
.empty-text { font-size: 14px; color: #999; margin: 0; }
.preview-empty-large { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; }
.empty-svg-large { width: 180px; height: 180px; margin-bottom: 20px; }
.empty-text-large { font-size: 16px; color: #999; margin: 0; }
.resource-list { flex: 1; overflow-y: auto; padding: 12px 0; }
.resource-section { margin-bottom: 8px; }
.section-header { display: flex; align-items: center; gap: 4px; padding: 10px 16px; font-size: 14px; color: #2cb0ff; cursor: pointer; font-weight: 500; }
.section-header:hover { background: #f5f7fa; }
.section-arrow { width: 16px; height: 16px; transition: transform 0.2s; flex-shrink: 0; transform: rotate(-90deg); }
.section-arrow.expanded { transform: rotate(0deg); }
.section-content { padding: 0 12px; }
.resource-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; margin: 6px 0; border-radius: 8px; cursor: pointer; background: #f8f9fa; border: 1px solid #eee; border-left: 3px solid transparent; transition: all 0.2s; }
.resource-item:hover { background: #f0f7ff; border-color: #d0e8ff; }
.resource-item.active { background: #e6f4ff; border-color: #91caff; border-left-color: #2cb0ff; }
.item-icon { width: 36px; height: 36px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.icon-word { background: #2B5797; color: white; }
.icon-ppt { background: #D04423; color: white; }
.icon-pdf { background: #E53935; color: white; }
.icon-ucd { background: #FFF3E0; color: #FF9800; border: 1px solid #FFE0B2; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 13px; color: #333; display: block; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.item-download { width: 28px; height: 28px; background: none; border: none; cursor: pointer; padding: 4px; color: #2cb0ff; flex-shrink: 0; border-radius: 4px; transition: all 0.2s; }
.item-download:hover { background: #e6f4ff; }
.item-download svg { width: 100%; height: 100%; }
.item-delete { width: 28px; height: 28px; background: none; border: none; cursor: pointer; padding: 4px; color: #999; flex-shrink: 0; border-radius: 4px; transition: all 0.2s; }
.item-delete:hover { background: #fff1f0; color: #ff4d4f; }
.item-delete svg { width: 100%; height: 100%; }
.item-action-text { font-size: 12px; color: #ff4d4f; cursor: pointer; flex-shrink: 0; }
.item-action-text:hover { text-decoration: underline; }

/* 个人资源面板 */
.personal-resource-panel { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.personal-header { display: flex; gap: 10px; padding: 12px; border-bottom: 1px solid #eee; flex-shrink: 0; }
.btn-primary { padding: 8px 16px; background: #2cb0ff; color: white; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { background: #1a9fe8; }
.section-tip { font-size: 12px; color: #999; padding: 8px 12px; margin: 0; line-height: 1.5; }
.collapse-btn { position: absolute; right: -14px; top: 50%; transform: translateY(-50%); width: 28px; height: 56px; background: white; border: 1px solid #e8e8e8; border-left: none; border-radius: 0 6px 6px 0; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; box-shadow: 2px 0 4px rgba(0,0,0,0.05); }
.left-sidebar.collapsed .collapse-btn { right: -28px; }
.collapse-btn:hover { background: #f5f5f5; }
.collapse-icon { width: 16px; height: 16px; color: #999; transition: transform 0.3s; }
.collapse-icon.rotated { transform: rotate(180deg); }
.preview-area { flex: 1; overflow: auto; display: flex; justify-content: center; align-items: flex-start; padding: 20px; background: #e8e8e8; }
.preview-loading, .preview-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #999; }
.spinner { width: 32px; height: 32px; border: 3px solid #ddd; border-top-color: #1890FF; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.preview-content { display: flex; justify-content: center; }
.doc-preview { width: 100%; height: 100%; overflow: auto; display: flex; justify-content: center; }
.docx-container { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  padding: 30px 20px;
  min-height: 100%;
}
/* Word 文档整体样式 */
.docx-container :deep(.docx-wrapper) { 
  background: white;
  max-width: 900px;
  margin: 0 auto;
}
/* 每一页的样式 - 像 PDF 一样有阴影和间距 */
.docx-container :deep(.docx-wrapper > section) {
  background: white !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
  margin-bottom: 30px !important;
  padding: 60px 80px !important;
  min-height: 1000px;
  border-radius: 2px;
}
/* 最后一页不需要底部间距 */
.docx-container :deep(.docx-wrapper > section:last-child) {
  margin-bottom: 0 !important;
}
/* 文字样式优化 */
.docx-container :deep(p) {
  line-height: 1.8 !important;
  margin: 0.5em 0 !important;
}
.docx-container :deep(table) {
  border-collapse: collapse !important;
  width: 100% !important;
}
.docx-container :deep(td), .docx-container :deep(th) {
  border: 1px solid #ddd !important;
  padding: 8px 12px !important;
}
.pdf-preview-wrapper { display: flex; justify-content: center; align-items: center; min-height: 400px; }
.pdf-page-container { position: relative; box-shadow: 0 2px 12px rgba(0,0,0,0.15); }
.pdf-canvas { display: block; background: white; }
.annotation-canvas { position: absolute; top: 0; left: 0; cursor: crosshair; }
.laser-pointer { position: absolute; width: 16px; height: 16px; background: red; border-radius: 50%; pointer-events: none; box-shadow: 0 0 10px 4px rgba(255,0,0,0.6); z-index: 100; }
.preview-unsupported { text-align: center; color: #999; }
.word-error { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; color: #ff4d4f; }
.word-error p { margin: 8px 0; font-size: 16px; }
.word-error .error-hint { color: #999; font-size: 13px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: #fff; border-top: 1px solid #e0e0e0; flex-shrink: 0; }
.toolbar-left, .toolbar-center, .toolbar-right { display: flex; align-items: center; gap: 8px; }
.tool-btn { padding: 6px 12px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.tool-btn:hover:not(:disabled) { background: #e8e8e8; }
.tool-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.tool-btn.active { background: #1890FF; color: white; border-color: #1890FF; }
.tool-btn.icon { padding: 6px 10px; font-size: 16px; }
.tool-btn.small { padding: 4px 8px; font-size: 12px; }
.page-info { font-size: 14px; color: #666; min-width: 60px; text-align: center; }
.page-input { width: 50px; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; text-align: center; font-size: 13px; }
.tool-label { font-size: 13px; color: #666; }
.divider { width: 1px; height: 24px; background: #ddd; margin: 0 8px; }
.color-picker { width: 32px; height: 32px; padding: 0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
.width-select { padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; }
.zoom-value { font-size: 14px; color: #666; min-width: 50px; text-align: center; }
</style>
