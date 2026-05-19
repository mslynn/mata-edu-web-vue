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
      <div class="header-center"><span class="prepare-status-tag">{{ t('prepare.preparing') }}</span></div>
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
                        <span class="action-link" @click.stop="startModify(item)">{{ t('common.copy') }}</span>
                      </template>
                      <template v-if="item.modifyNum  > 0">
                        <span class="action-link" @click.stop="continueModify(item)">{{ t('prepare.startModify') }}</span>
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
              <button class="btn-primary" @click="openLinkPlatformModal">{{ t('prepare.linkPlatformResource') }}</button>
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
        <div v-else-if="embeddedMcEditorVisible" class="embedded-editor-wrapper">
          <div class="embedded-editor-header">
            <div class="embedded-editor-meta">
              <span class="embedded-editor-title">{{ selectedResource.fileName || 'MatataCode' }}</span>
              <span class="embedded-editor-desc">
                {{ embeddedMcEditorHasExistingFile ? '编辑个人程序' : '新建个人程序' }}
              </span>
            </div>
            <button class="embedded-editor-close" @click="closePrepareMcEditor">退出编辑</button>
          </div>
          <div class="embedded-editor-body">
            <div v-if="embeddedMcEditorLoading" class="embedded-editor-loading">
              <div class="spinner"></div>
              <span>{{ t('common.loading') }}</span>
            </div>
            <iframe
              ref="prepareMcIframeRef"
              :src="embeddedMcEditorUrl"
              class="embedded-editor-iframe"
              :class="{ hidden: embeddedMcEditorLoading }"
              frameborder="0"
              allowfullscreen
              allow="camera; microphone; bluetooth; serial"
              @load="onPrepareMcIframeLoad"
            />
          </div>
        </div>
        <div v-else-if="embeddedAiEditorVisible" class="embedded-editor-wrapper">
          <div class="embedded-editor-header">
            <div class="embedded-editor-meta">
              <span class="embedded-editor-title">{{ selectedResource.fileName || 'AI实践资源' }}</span>
              <span class="embedded-editor-desc">
                {{ embeddedAiEditorHasExistingFile ? '编辑训练模型' : '新建训练模型' }}
              </span>
            </div>
            <button class="embedded-editor-close" @click="closePrepareAiEditor">退出编辑</button>
          </div>
          <div class="embedded-editor-body">
            <div v-if="embeddedAiEditorLoading" class="embedded-editor-loading">
              <div class="spinner"></div>
              <span>{{ t('common.loading') }}</span>
            </div>
            <iframe
              ref="prepareAiIframeRef"
              :src="embeddedAiEditorUrl"
              class="embedded-editor-iframe"
              :class="{ hidden: embeddedAiEditorLoading }"
              frameborder="0"
              allowfullscreen
              allow="camera; microphone; bluetooth; serial"
              @load="onPrepareAiIframeLoad"
            />
          </div>
        </div>
        <div v-else-if="exercisePreviewData" class="exercise-preview-wrapper">
          <div class="exercise-preview-body">
            <div
              v-for="(question, index) in exercisePreviewData.questions || []"
              :key="question.questionId || index"
              class="exercise-preview-question"
            >
              <div class="exercise-preview-question-title">
                {{ index + 1 }}. {{ question.questionName || '未命名题目' }}
                <span class="exercise-preview-question-score">（{{ question.score || 0 }}分）</span>
              </div>

              <div v-if="question.imageUrl" class="exercise-preview-image-wrap">
                <img :src="question.imageUrl" class="exercise-preview-image" />
              </div>

              <div
                v-if="question.questionType === 'single' || question.questionType === 'multiple' || question.questionType === 'judge'"
                class="exercise-preview-options"
              >
                <div
                  v-for="(opt, optIdx) in question.options || []"
                  :key="opt.optionId || opt.tempId || optIdx"
                  class="exercise-preview-option"
                >
                  <span class="exercise-preview-option-label">{{ opt.optionLabel }}.</span>
                  <span class="exercise-preview-option-text">{{ opt.optionText }}</span>
                </div>
              </div>

              <div v-else-if="question.questionType === 'blank'" class="exercise-preview-answer-list">
                <div
                  v-for="(ans, ansIdx) in question.answers || []"
                  :key="ansIdx"
                  class="exercise-preview-answer-item"
                >
                  填空{{ ansIdx + 1 }}：{{ ans.blankText || '-' }}
                </div>
              </div>

              <div v-else-if="question.questionType === 'connect'" class="exercise-preview-connect">
                <div class="exercise-preview-connect-column">
                  <div
                    v-for="(opt, optIdx) in getPrepareExerciseSourceOptions(question)"
                    :key="opt.optionId || opt.tempId || optIdx"
                    class="exercise-preview-option"
                  >
                    <span class="exercise-preview-option-label">
                      {{ getPrepareExerciseConnectDisplayLabel(question, opt) }}.
                    </span>
                    <span class="exercise-preview-option-text">{{ opt.optionText }}</span>
                  </div>
                </div>
                <div class="exercise-preview-connect-column">
                  <div
                    v-for="(opt, optIdx) in getPrepareExerciseTargetOptions(question)"
                    :key="opt.optionId || opt.tempId || optIdx"
                    class="exercise-preview-option"
                  >
                    <span class="exercise-preview-option-label">
                      {{ getPrepareExerciseConnectDisplayLabel(question, opt) }}.
                    </span>
                    <span class="exercise-preview-option-text">{{ opt.optionText }}</span>
                  </div>
                </div>
              </div>

              <div class="exercise-preview-actions">
                <button
                  class="exercise-preview-analysis-btn"
                  @click="togglePrepareExerciseAnalysis(index)"
                >
                  答案解析
                </button>
              </div>

              <div
                v-if="expandedExerciseAnalysis.includes(index)"
                class="exercise-preview-analysis"
              >
                <div class="exercise-preview-analysis-title">
                  正确答案：{{ getPrepareExerciseCorrectAnswerText(question) }}
                </div>
                <div class="exercise-preview-analysis-text">
                  {{ question.analysis || '暂无解析' }}
                </div>
              </div>
            </div>
          </div>
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
    <LinkPlatformResourceModal
      v-model:visible="showLinkModal"
      :chapter-id="String(currentChapterId)"
      :linked-exercise-ids="linkedExerciseIds"
      :linked-work-resources="linkedWorkResources"
    />

    <!-- 设置学生可见资源弹窗 -->
    <SetStudentVisibleModal v-model:visible="showStudentVisibleModal" :chapter-id="currentChapterId" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { cursorAdmin } from '~/composables/api/curosr'
import { aiAdmin } from '~/composables/api/ai'
import { taskmanagementcenterApi } from '~/composables/api/taskmanagement'
import { useIframeFileBridge } from '~/composables/useIframeFileBridge'
import '~/assets/css/prepare.css'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const {
  getCursorDetail,
  getChapterResourceList,
  deleteChapterResource,
  downloadOSS,
  copyChapterResource,
  uploadOSS,
  createChapterResource,
} = cursorAdmin()
const { ssoLogin, deleteOss, createAi, updateAi } = aiAdmin()
const { getDetailExercise } = taskmanagementcenterApi()
const {
  downloadFileFromOSS,
  postFileBufferToIframe,
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  isMessageFromIframe,
  toUploadFile,
  toWorkFile,
} = useIframeFileBridge()

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
  window.addEventListener('message', handlePrepareMcIframeMessage)
  window.addEventListener('message', handlePrepareAiIframeMessage)

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

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
  window.removeEventListener('message', handlePrepareMcIframeMessage)
  window.removeEventListener('message', handlePrepareAiIframeMessage)
})

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

watch(
  () => activeTab.value,
  (value) => {
    if (value !== 'personal' && embeddedMcEditorVisible.value) {
      closePrepareMcEditor()
    }
    if (value !== 'personal' && embeddedAiEditorVisible.value) {
      closePrepareAiEditor()
    }
  }
)

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

const ensureCurrentChapterId = () => {
  const routeChapterId = route.query.chapterId ? String(route.query.chapterId) : ''
  if (routeChapterId && chapterList.value.some(c => c.id === routeChapterId)) {
    currentChapterId.value = routeChapterId
    return currentChapterId.value
  }

  if (currentChapterId.value && chapterList.value.some(c => c.id === currentChapterId.value)) {
    return currentChapterId.value
  }

  const firstChapterId = chapterList.value[0]?.id || ''
  currentChapterId.value = firstChapterId
  return currentChapterId.value
}

const selectChapter = async (chapter: { id: string; name: string }) => {
  currentChapterId.value = chapter.id
  dropdownOpen.value = false
  
  // 切换章节时清空右侧预览
  closePrepareMcEditor()
  closePrepareAiEditor()
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
  updateStatus?: number | string | null
  fileType?: string
  fileTypeName?: string
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
const embeddedMcEditorVisible = ref(false)
const embeddedMcEditorLoading = ref(false)
const embeddedMcEditorUrl = ref('')
const embeddedMcEditorFile = ref<File | null>(null)
const prepareMcIframeRef = ref<HTMLIFrameElement | null>(null)
const savingPrepareMcResource = ref(false)
const currentPrepareMcResource = ref<ResourceItem | null>(null)
const embeddedMcEditorHasExistingFile = computed(() => Boolean(currentPrepareMcResource.value?.resourceUrl))
const embeddedAiEditorVisible = ref(false)
const embeddedAiEditorLoading = ref(false)
const embeddedAiEditorUrl = ref('')
const embeddedAiEditorFile = ref<File | null>(null)
const prepareAiIframeRef = ref<HTMLIFrameElement | null>(null)
const savingPrepareAiResource = ref(false)
const currentPrepareAiResource = ref<ResourceItem | null>(null)
const embeddedAiEditorHasExistingFile = computed(() => Boolean(currentPrepareAiResource.value?.resourceUrl))
const exercisePreviewData = ref<any | null>(null)
const expandedExerciseAnalysis = ref<number[]>([])

const PREPARE_AI_TYPE_MAP: Record<string, { toolKey: string; label: string; type: number }> = {
  image_cls: { toolKey: 'imageClassModel', label: '图像分类训练', type: 1 },
  audio_cls: { toolKey: 'voiceClassModel', label: '语音分类模型', type: 3 },
  pose_cls: { toolKey: 'poseClassModel', label: '姿态分类模型', type: 4 },
  gesture_cls: { toolKey: 'gestureClassModel', label: '手势分类模型', type: 2 },
}

const isPrepareAiResource = (item?: ResourceItem | null) => {
  const fileType = String(item?.fileType || '').trim().toLowerCase()
  return ['image_cls', 'audio_cls', 'pose_cls', 'gesture_cls'].includes(fileType)
}

const isPrepareExerciseResource = (item?: ResourceItem | null) => {
  return Number(item?.resourceCategory) === 11
}

const getPrepareExerciseId = (item?: ResourceItem | null) => {
  return String((item as any)?.exerciseId || item?.resourceId || (item as any)?.id || '').trim()
}

const getPrepareExerciseOptionKeyCandidates = (opt: any): string[] => {
  return [opt?.tempId, opt?.optionId, opt?.id].filter(Boolean).map((id: any) => String(id))
}

const sortPrepareExerciseOptionsBySequence = (options: any[]) => {
  return [...(options || [])].sort((a: any, b: any) => {
    const seqA = Number(a?.sequence ?? 0)
    const seqB = Number(b?.sequence ?? 0)
    return seqA - seqB
  })
}

const getPrepareExerciseSourceOptions = (question: any) => {
  return sortPrepareExerciseOptionsBySequence(
    (question.options || []).filter((opt: any) => opt.groupType === 'source')
  )
}

const getPrepareExerciseTargetOptions = (question: any) => {
  return sortPrepareExerciseOptionsBySequence(
    (question.options || []).filter((opt: any) => opt.groupType === 'target')
  )
}

const getPrepareExerciseOptionIndex = (list: any[], opt: any) => {
  const optIds = getPrepareExerciseOptionKeyCandidates(opt)
  return list.findIndex((item: any) => {
    const itemIds = getPrepareExerciseOptionKeyCandidates(item)
    return itemIds.some((id: string) => optIds.includes(id))
  })
}

const toLowerAlphabetLabel = (index: number) => {
  if (index < 0) return ''
  let n = index + 1
  let result = ''
  while (n > 0) {
    n -= 1
    result = String.fromCharCode(97 + (n % 26)) + result
    n = Math.floor(n / 26)
  }
  return result
}

const getPrepareExerciseConnectDisplayLabel = (question: any, opt: any) => {
  const groupType = String(opt?.groupType || '').toLowerCase()
  if (groupType === 'source') {
    const index = getPrepareExerciseOptionIndex(getPrepareExerciseSourceOptions(question), opt)
    return index >= 0 ? String(index + 1) : String(opt?.optionLabel || '')
  }
  if (groupType === 'target') {
    const index = getPrepareExerciseOptionIndex(getPrepareExerciseTargetOptions(question), opt)
    return index >= 0 ? toLowerAlphabetLabel(index) : String(opt?.optionLabel || '')
  }
  return String(opt?.optionLabel || '')
}

const getPrepareExerciseOptionLabel = (question: any, optionTempId: string) => {
  const optionId = String(optionTempId || '')
  const option = (question.options || []).find((opt: any) =>
    getPrepareExerciseOptionKeyCandidates(opt).includes(optionId)
  )
  if (!option) return ''
  return String(option.optionLabel || '')
}

const getPrepareExerciseCorrectAnswerText = (question: any) => {
  if (question.questionType === 'blank') {
    return (question.answers || []).map((ans: any) => ans.blankText).filter(Boolean).join('；') || '-'
  }
  if (question.questionType === 'connect') {
    return (question.answers || [])
      .map((ans: any) =>
        `${getPrepareExerciseOptionLabel(question, ans.optionTempId)}→${getPrepareExerciseOptionLabel(
          question,
          ans.matchOptionTempId
        )}`
      )
      .join('，') || '-'
  }
  const correctTempIds = (question.answers || []).map((ans: any) => String(ans.optionTempId || ''))
  const correctLabels = (question.options || [])
    .filter((opt: any) => getPrepareExerciseOptionKeyCandidates(opt).some((id) => correctTempIds.includes(id)))
    .map((opt: any) => String(opt.optionLabel || ''))
  return correctLabels.join('、') || '-'
}

const loadPrepareExerciseDetail = async (item: ResourceItem) => {
  const exerciseId = getPrepareExerciseId(item)
  if (!exerciseId) {
    exercisePreviewData.value = null
    return
  }

  expandedExerciseAnalysis.value = []
  exercisePreviewData.value = await getDetailExercise(exerciseId)
}

const togglePrepareExerciseAnalysis = (index: number) => {
  const currentIndex = expandedExerciseAnalysis.value.indexOf(index)
  if (currentIndex > -1) {
    expandedExerciseAnalysis.value.splice(currentIndex, 1)
    return
  }
  expandedExerciseAnalysis.value.push(index)
}

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
    if (selectedResource.value?.resourceId === item.resourceId) {
      closePrepareMcEditor()
      closePrepareAiEditor()
    }
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

const openLinkPlatformModal = async () => {
  const chapterId = ensureCurrentChapterId()
  if (!chapterId) {
    ElMessage.warning('缺少章节ID')
    return
  }

  await loadChapterResources(chapterId, 2)
  await loadChapterResources(chapterId, 3)
  showLinkModal.value = true
}

const linkedExerciseIds = computed(() => {
  return taskResources.value.flatMap((group) =>
    (group.resourceList || []).map((item: any) =>
      String(item.exerciseId || item.resourceId || item.id || '')
    )
  )
})

const linkedWorkResources = computed(() => {
  return personalResourceGroups.value.flatMap((group) => group.resourceList || [])
})

const handleFinish = () => router.push(`/system/course/${route.params.id}`)

// 编辑 UCD 文件
const editUcdFile = (item: ResourceItem) => {
  // TODO: 实现 UCD 编辑功能
  ElMessage.info(t('prepare.ucdEditInDev'))
}

const getPrepareProgramToolId = (item: ResourceItem): 'vincibot' | 'nous' => {
  return /\.sb3$/i.test(item.fileName) ? 'nous' : 'vincibot'
}

const getPrepareProgramReceiveMessageType = (item: ResourceItem) => {
  return /\.sb3$/i.test(item.fileName) ? 'receive-works-sb3' : 'receive-works-mc'
}

const getPrepareProgramFileName = (item: ResourceItem) => {
  if (/\.[^.]+$/i.test(item.fileName || '')) return item.fileName
  return `${item.fileName || 'project'}.${getPrepareProgramToolId(item) === 'nous' ? 'sb3' : 'mc'}`
}

const buildPrepareToolIframeUrl = async (toolId: 'vincibot' | 'nous') => {
  const baseUrl =
    toolId === 'nous'
      ? String(config.public.nousCreateUrl || '').trim()
      : String(config.public.vincibotCreateUrl || '').trim()
  if (!baseUrl) {
    throw new Error('当前未配置编程平台地址')
  }

  const ssoData = await ssoLogin()
  const accessToken =
    (typeof ssoData === 'string' ? ssoData : '') ||
    ssoData?.accessToken ||
    ssoData?.token ||
    ssoData?.access_token ||
    ''
  if (!accessToken) {
    throw new Error('获取编程平台Token失败')
  }

  const lang = toolId === 'vincibot' ? 'zh-CN' : 'zh'
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}token=${encodeURIComponent(accessToken)}&lang=${lang}&ch=aiedu`
}

const downloadPrepareProgramFile = async (item: ResourceItem) => {
  if (item.ossId) {
    return downloadFileFromOSS(item.ossId, getPrepareProgramFileName(item), 'application/octet-stream')
  }
  if (item.resourceUrl) {
    const response = await fetch(item.resourceUrl)
    if (!response.ok) {
      throw new Error(`下载程序文件失败: ${response.status}`)
    }
    const blob = await response.blob()
    return new File([blob], getPrepareProgramFileName(item), {
      type: blob.type || 'application/octet-stream',
      lastModified: Date.now(),
    })
  }
  return null
}

const closePrepareMcEditor = () => {
  embeddedMcEditorVisible.value = false
  embeddedMcEditorLoading.value = false
  embeddedMcEditorUrl.value = ''
  embeddedMcEditorFile.value = null
  currentPrepareMcResource.value = null
  savingPrepareMcResource.value = false
}

const buildPrepareAiIframeUrl = async (fileType: string, projectName: string, optId = '') => {
  const toolConfig = PREPARE_AI_TYPE_MAP[fileType]
  if (!toolConfig) {
    throw new Error('当前资源类型不支持训练模型编辑')
  }

  const ssoData = await ssoLogin()
  const accessToken =
    (typeof ssoData === 'string' ? ssoData : '') ||
    ssoData?.accessToken ||
    ssoData?.token ||
    ssoData?.access_token ||
    ''
  if (!accessToken) {
    throw new Error('获取AI工具Token失败')
  }

  return `https://pre.matatalab.com/?token=${encodeURIComponent(
    accessToken
  )}&type=${toolConfig.type}&projectName=${encodeURIComponent(
    projectName
  )}&lang=zh&ch=aiedu&type2=opt${optId ? `&optId=${encodeURIComponent(optId)}` : ''}`
}

const downloadPrepareAiFile = async (item: ResourceItem) => {
  if (item.ossId) {
    return downloadFileFromOSS(String(item.ossId), `${item.fileName || 'project'}.zip`, 'application/zip')
  }
  if (item.resourceUrl) {
    const response = await fetch(item.resourceUrl)
    if (!response.ok) {
      throw new Error(`下载AI模型文件失败: ${response.status}`)
    }
    const blob = await response.blob()
    return new File([blob], `${item.fileName || 'project'}.zip`, {
      type: blob.type || 'application/zip',
      lastModified: Date.now(),
    })
  }
  return null
}

const closePrepareAiEditor = () => {
  embeddedAiEditorVisible.value = false
  embeddedAiEditorLoading.value = false
  embeddedAiEditorUrl.value = ''
  embeddedAiEditorFile.value = null
  currentPrepareAiResource.value = null
  savingPrepareAiResource.value = false
}

const openPrepareAiEditor = async (item: ResourceItem) => {
  const fileType = String(item.fileType || '').trim().toLowerCase()
  if (!PREPARE_AI_TYPE_MAP[fileType]) {
    ElMessage.warning('当前资源类型不支持训练模型编辑')
    return
  }

  try {
    currentPrepareAiResource.value = item
    embeddedAiEditorVisible.value = true
    embeddedAiEditorLoading.value = true
    embeddedAiEditorUrl.value = ''
    embeddedAiEditorFile.value = null

    if (item.resourceUrl) {
      embeddedAiEditorFile.value = await downloadPrepareAiFile(item)
    }

    embeddedAiEditorUrl.value = await buildPrepareAiIframeUrl(
      fileType,
      item.fileName || PREPARE_AI_TYPE_MAP[fileType].label,
      item.resourceUrl ? String(item.resourceId || '') : ''
    )
  } catch (error) {
    console.error('打开 AI 训练模型编辑器失败', error)
    closePrepareAiEditor()
    ElMessage.error(error instanceof Error ? error.message : '打开 AI 训练模型编辑器失败')
  }
}

// 编辑 MC 文件
const editMcFile = async (item: ResourceItem) => {
  try {
    currentPrepareMcResource.value = item
    embeddedMcEditorVisible.value = true
    embeddedMcEditorLoading.value = true
    embeddedMcEditorUrl.value = ''
    embeddedMcEditorFile.value = null

    if (item.resourceUrl) {
      embeddedMcEditorFile.value = await downloadPrepareProgramFile(item)
    }

    embeddedMcEditorUrl.value = await buildPrepareToolIframeUrl(getPrepareProgramToolId(item))
  } catch (error) {
    console.error('打开 MC 编辑器失败', error)
    closePrepareMcEditor()
    ElMessage.error(error instanceof Error ? error.message : '打开 MC 编辑器失败')
  }
}

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

const findPersonalResourceItem = (matcher: (item: ResourceItem) => boolean) => {
  for (const group of personalResourceGroups.value) {
    const matchedItem = (group.resourceList || []).find(matcher)
    if (matchedItem) return matchedItem
  }
  return null
}

const handlePrepareMcSaveSuccess = async (file: File, projectName?: string) => {
  if (!currentChapterId.value) {
    throw new Error('缺少章节ID')
  }

  const uploadResult = await uploadOSS(file)
  if (!uploadResult?.ossId) {
    throw new Error('上传程序文件失败')
  }

  const fileExt = /\.sb3$/i.test(file.name) ? '.sb3' : '.mc'
  const baseName =
    (typeof projectName === 'string' && projectName.trim()) || file.name.replace(/\.[^.]+$/, '')
  const nextFileName = /\.[^.]+$/i.test(baseName) ? baseName : `${baseName}${fileExt}`
  const previousResource = currentPrepareMcResource.value
  const isEditMode = Boolean(previousResource?.resourceUrl)
  const shouldReplacePrevious = Boolean(previousResource?.resourceId)

  await createChapterResource({
    chapterId: currentChapterId.value,
    resourceType: 3,
    ossId: String(uploadResult.ossId),
    fileName: nextFileName,
  })

  if (shouldReplacePrevious && previousResource?.resourceId) {
    try {
      await deleteChapterResource(String(previousResource.resourceId))
    } catch (error) {
      console.warn('删除旧章节资源失败，已保留新资源:', error)
    }
    if (previousResource.ossId) {
      try {
        await deleteOss(String(previousResource.ossId))
      } catch (error) {
        console.warn('删除旧 OSS 文件失败，已保留新文件:', error)
      }
    }
  }

  await loadChapterResources(currentChapterId.value, 3)
  const nextResource =
    findPersonalResourceItem((item) => String(item.ossId || '') === String(uploadResult.ossId || '')) ||
    findPersonalResourceItem((item) => item.fileName === nextFileName)

  closePrepareMcEditor()
  if (nextResource) {
    selectedResource.value = nextResource
  } else {
    selectedResource.value = null
  }
  previewLoading.value = false
  ElMessage.success(isEditMode ? '编辑成功' : '创建成功')
}

const onPrepareMcIframeLoad = async () => {
  embeddedMcEditorLoading.value = false
  if (!embeddedMcEditorFile.value || !embeddedMcEditorUrl.value) return

  window.setTimeout(async () => {
    await postFileBufferToIframe({
      file: embeddedMcEditorFile.value,
      iframeUrl: embeddedMcEditorUrl.value,
      iframeWindow: prepareMcIframeRef.value?.contentWindow,
      type: getPrepareProgramReceiveMessageType(currentPrepareMcResource.value as ResourceItem),
    })
  }, 300)
}

const onPrepareAiIframeLoad = async () => {
  embeddedAiEditorLoading.value = false
  if (!embeddedAiEditorFile.value || !embeddedAiEditorUrl.value || !currentPrepareAiResource.value?.resourceUrl) {
    return
  }

  window.setTimeout(async () => {
    await postFileBufferToIframe({
      file: embeddedAiEditorFile.value,
      iframeUrl: embeddedAiEditorUrl.value,
      iframeWindow: prepareAiIframeRef.value?.contentWindow,
      type: 'receive-tm-zip',
      additionalData: {
        optId: String(currentPrepareAiResource.value?.resourceId || ''),
      },
    })
  }, 300)
}

const handlePrepareMcIframeMessage = async (event: MessageEvent) => {
  if (
    !embeddedMcEditorVisible.value ||
    !isMessageFromIframe({
      event,
      iframeWindow: prepareMcIframeRef.value?.contentWindow,
      iframeUrl: embeddedMcEditorUrl.value,
    })
  ) {
    return
  }

  const messageData = parseMessageData(event.data) as any
  const messageType = getMessageType(messageData)

  if (!messageData || (typeof messageData !== 'object' && typeof messageData !== 'string')) {
    return
  }

  if (messageType === 'close-ai-embedded') {
    closePrepareMcEditor()
    return
  }

  if (messageType !== 'send-works-mc' && messageType !== 'send-works-sb3') {
    return
  }

  if (savingPrepareMcResource.value) {
    return
  }

  const worksPayload = pickMessagePayload(messageData, [
    'payload',
    'data',
    'file',
    'blob',
    'arrayBuffer',
  ]) as any

  const nestedPayload =
    worksPayload &&
    typeof worksPayload === 'object' &&
    !(worksPayload instanceof File) &&
    !(worksPayload instanceof Blob) &&
    !(worksPayload instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(worksPayload)
      ? worksPayload
      : null

  const workFilePayload = nestedPayload
    ? messageType === 'send-works-mc'
      ? nestedPayload.mc || nestedPayload.file || nestedPayload.payload
      : nestedPayload.sb3 || nestedPayload.file || nestedPayload.payload
    : worksPayload

  const workFile = toWorkFile(
    workFilePayload,
    pickMessageFileName(messageData),
    messageType === 'send-works-mc' ? '.mc' : '.sb3'
  )

  if (!workFile) {
    ElMessage.error('当前程序文件格式不正确')
    return
  }

  savingPrepareMcResource.value = true
  try {
    await handlePrepareMcSaveSuccess(
      workFile,
      typeof messageData?.projectName === 'string' ? messageData.projectName : ''
    )
  } catch (error) {
    console.error('保存 MC 资源失败', error)
    ElMessage.error(error instanceof Error ? error.message : '保存 MC 资源失败')
  } finally {
    savingPrepareMcResource.value = false
  }
}

const handlePrepareAiSaveSuccess = async (file: File, projectName?: string) => {
  const resource = currentPrepareAiResource.value
  if (!resource) {
    throw new Error('缺少当前 AI 资源')
  }

  const uploadResult = await uploadOSS(file)
  const ossId = uploadResult?.ossId
  const userId = (() => {
    try {
      const rawUserInfo = localStorage.getItem('user_info')
      if (!rawUserInfo) return ''
      const userInfo = JSON.parse(rawUserInfo)
      return userInfo?.user_id || userInfo?.userId || userInfo?.id || ''
    } catch {
      return ''
    }
  })()
  const optType = String(resource.fileType || '').trim().toLowerCase()
  const optName =
    (typeof projectName === 'string' && projectName.trim()) ||
    resource.fileName ||
    PREPARE_AI_TYPE_MAP[optType]?.label ||
    '训练模型'

  if (!ossId || !userId || !optType) {
    throw new Error('AI 模型保存参数不完整')
  }

  if (resource.resourceUrl) {
    await updateAi({
      optId: String(resource.resourceId),
      optName,
      optType,
      userId,
      ossId,
    })
  } else {
    await createAi({
      optName,
      optType,
      userId,
      ossId,
    })
  }

  await loadChapterResources(String(currentChapterId.value), 3)
  const nextResource =
    findPersonalResourceItem((item) => String(item.resourceId) === String(resource.resourceId)) ||
    findPersonalResourceItem((item) => String(item.fileType || '').trim().toLowerCase() === optType)

  closePrepareAiEditor()
  if (nextResource) {
    selectedResource.value = nextResource
  }
  previewLoading.value = false
  ElMessage.success(resource.resourceUrl ? '编辑成功' : '创建成功')
}

const handlePrepareAiIframeMessage = async (event: MessageEvent) => {
  if (
    !embeddedAiEditorVisible.value ||
    !isMessageFromIframe({
      event,
      iframeWindow: prepareAiIframeRef.value?.contentWindow,
      iframeUrl: embeddedAiEditorUrl.value,
    })
  ) {
    return
  }

  const messageData = parseMessageData(event.data) as any
  const messageType = getMessageType(messageData)

  if (!messageData || (typeof messageData !== 'object' && typeof messageData !== 'string')) {
    return
  }

  if (messageType === 'close-ai-embedded') {
    closePrepareAiEditor()
    return
  }

  if (messageType !== 'send-tm-zip') {
    return
  }

  if (savingPrepareAiResource.value) {
    return
  }

  const zipPayload = pickMessagePayload(messageData, [
    'payload',
    'data',
    'file',
    'blob',
    'arrayBuffer',
    'result',
  ])
  const uploadFile = toUploadFile(zipPayload, pickMessageFileName(messageData))
  if (!uploadFile) {
    ElMessage.error('当前模型文件格式不正确')
    return
  }

  savingPrepareAiResource.value = true
  try {
    await handlePrepareAiSaveSuccess(
      uploadFile,
      typeof messageData?.projectName === 'string' ? messageData.projectName : ''
    )
  } catch (error) {
    console.error('保存 AI 训练模型失败', error)
    ElMessage.error(error instanceof Error ? error.message : '保存 AI 训练模型失败')
  } finally {
    savingPrepareAiResource.value = false
  }
}

const selectResource = async (item: ResourceItem) => {
  console.log(item)
  if (
    selectedResource.value?.resourceId === item.resourceId &&
    !isPrepareAiResource(item)
  ) {
    return
  }
  if (
    selectedResource.value?.resourceId === item.resourceId &&
    isPrepareAiResource(item) &&
    embeddedAiEditorVisible.value
  ) {
    return
  }
  if (embeddedMcEditorVisible.value) {
    closePrepareMcEditor()
  }
  if (embeddedAiEditorVisible.value) {
    closePrepareAiEditor()
  }
  exercisePreviewData.value = null
  pptPreviewUrl.value = ''
  selectedResource.value = item
  previewLoading.value = true
  const fileType = isPrepareAiResource(item)
    ? String(item.fileType || '').trim().toLowerCase()
    : getFileType(item.fileName)
  console.log(fileType, '类型')
  try {
    if (['word', 'ppt', 'pdf', 'image', 'excel'].includes(fileType) && item.resourceUrl) {
      // Word/PPT/PDF/图片/Excel 使用 iframe 预览
      pptPreviewUrl.value = getPptPreviewUrl(item.resourceUrl)
      previewLoading.value = false
    } else if (isPrepareExerciseResource(item)) {
      await loadPrepareExerciseDetail(item)
      previewLoading.value = false
    } else if (isPrepareAiResource(item)) {
      await openPrepareAiEditor(item)
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
