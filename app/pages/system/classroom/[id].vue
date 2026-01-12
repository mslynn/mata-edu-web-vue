<template>
  <div class="classroom-page">
    <!-- 顶部导航栏 -->
    <header class="classroom-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="class-time">
          <span class="time-label">{{ t('classroom.classTime') }}</span>
          <span class="time-value">{{ formatTime(classTime) }}</span>
        </span>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="showStudentManageModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>{{ t('classroom.studentManage') }}</span>
        </button>
        <button class="header-btn" :class="{ active: isScreenSharing }" @click="toggleScreenShare">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span>{{ isScreenSharing ? t('classroom.stopShare') : t('classroom.screenShare') }}</span>
        </button>
        <button class="header-btn" :class="{ active: isFullscreenControl }" @click="toggleFullscreenControl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <span>{{ t('classroom.fullscreenControl') }}</span>
        </button>
        <span class="divider"></span>
        <button class="header-btn" :class="{ active: isBlackboardMode }" @click="toggleBlackboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <path d="M8 21h8"/>
            <path d="M12 17v4"/>
          </svg>
          <span>{{ isBlackboardMode ? t('classroom.exitBlackboard') : t('classroom.switchToBlackboard') }}</span>
        </button>
        <span class="divider"></span>
        <button class="end-class-btn" @click="handleEndClass">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span>{{ t('classroom.endClass') }}</span>
        </button>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="classroom-body" :class="{ 'blackboard-fullscreen': isBlackboardMode }">
      <!-- 学生快捷登录提示框 -->
      <div v-if="showLoginTip" class="login-tip-panel" :class="{ collapsed: loginTipCollapsed }">
        <div class="tip-header">
          <div class="tip-header-left">
            <span class="tip-title">{{ t('classroom.studentQuickLogin') }}</span>
            <span class="tip-expire-inline">{{ t('classroom.validFor2Hours') }}{{ expireTime }}{{ t('classroom.expire') }}</span>
          </div>
          <div class="tip-actions">
            <button class="tip-action-btn" @click="loginTipCollapsed = !loginTipCollapsed">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path :d="loginTipCollapsed ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'"/>
              </svg>
            </button>
            <button class="tip-action-btn" @click="showLoginTip = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div v-show="!loginTipCollapsed" class="tip-body">
          <div class="info-card code-card">
            <div class="code-row">
              <span class="code-label">{{ t('classroom.classCode') }}</span>
              <span class="code-value">{{ classCode }}</span>
            </div>
            <div class="code-row">
              <span class="code-label">{{ t('classroom.loginPassword') }}</span>
              <span class="code-value">{{ loginPassword }}</span>
            </div>
            <button class="copy-btn card-copy" @click="copyClassInfo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>{{ t('classroom.copy') }}</span>
            </button>
          </div>
          <p class="tip-footer">{{ t('classroom.viewLoginStatusTip') }}</p>
        </div>
      </div>

      <!-- 左侧边栏：课件 + 任务 (黑板模式隐藏) -->
      <aside v-if="!isBlackboardMode" class="sidebar-left" :class="{ collapsed: leftCollapsed }">
        <div class="sidebar-content">
          <!-- 课件区域 -->
          <div class="section-block">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>{{ t('classroom.courseware') }}</span>
              <button class="send-btn" @click="showSendCoursewareModal = true">{{ t('classroom.sendCoursewareToStudent') }}</button>
            </div>
            <div class="resource-list">
              <div v-if="resourceLoading" class="resource-loading">{{ t('classroom.loading') }}</div>
              <div v-else-if="resourceList.length === 0" class="resource-empty">{{ t('classroom.noCourseware') }}</div>
              <div 
                v-else
                v-for="item in resourceList" 
                :key="item.id" 
                class="resource-item"
                :class="{ active: activeResource === item.id }"
                @click="selectResource(item)"
              >
                <img :src="getResourceIcon(item.type)" alt="" class="resource-icon" />
                <span class="resource-name">{{ item.name }}</span>
              </div>
            </div>
          </div>

          <!-- 任务区域 -->
          <div class="section-block">
            <div class="section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span>{{ t('classroom.task') }}</span>
            </div>
            <div class="task-list">
              <!-- 1. AI实践任务 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('aiPractice')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.aiPractice }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>{{ t('classroom.aiPracticeTask') }}</span>
                  <span class="group-desc">{{ t('classroom.aiPracticeTaskDesc') }}</span>
                </div>
                <div v-if="expandedGroups.aiPractice" class="group-content">
                  <div class="task-item" @click="selectTask('ai-dialog')">
                    <span>{{ t('classroom.aiDialogModel') }}</span>
                  </div>
                  <div class="task-item" @click="selectTask('cluster')">
                    <span>{{ t('classroom.clusterAnalysis') }}</span>
                  </div>
                </div>
              </div>
              <!-- 2. 自定义练习题 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('customExercise')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.customExercise }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>{{ t('classroom.customExercise') }}</span>
                  <span class="group-desc">{{ t('classroom.customExerciseDesc') }}</span>
                </div>
                <div v-if="expandedGroups.customExercise" class="group-content">
                  <div class="task-item">
                    <span>今天学习的几个快捷键</span>
                  </div>
                </div>
              </div>
              <!-- 3. 随堂练习 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('classExercise')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.classExercise }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>{{ t('classroom.classExercise') }}</span>
                  <span class="group-desc">{{ t('classroom.classExerciseDesc') }}</span>
                </div>
                <div v-if="expandedGroups.classExercise" class="group-content">
                  <div class="empty-tip">{{ t('classroom.noClassExercise') }}</div>
                </div>
              </div>
              <!-- 4. 自由编程 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('freeCoding')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.freeCoding }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>{{ t('classroom.freeCoding') }}</span>
                  <span class="group-desc">{{ t('classroom.freeCodingDesc') }}</span>
                </div>
                <div v-if="expandedGroups.freeCoding" class="group-content">
                  <div class="task-item">
                    <span>{{ t('classroom.freeCreationTask') }}</span>
                  </div>
                </div>
              </div>
              <!-- 5. 学生编程任务 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('studentCoding')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.studentCoding }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>{{ t('classroom.studentCodingTask') }}</span>
                  <span class="group-desc">{{ t('classroom.studentCodingTaskDesc') }}</span>
                </div>
                <div v-if="expandedGroups.studentCoding" class="group-content">
                  <div class="empty-tip">{{ t('classroom.noStudentCodingTask') }}</div>
                </div>
              </div>
              <!-- 6. 个人上传任务 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('personalUpload')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.personalUpload }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>{{ t('classroom.personalUploadTask') }}</span>
                  <span class="group-desc">{{ t('classroom.personalUploadTaskDesc') }}</span>
                </div>
                <div v-if="expandedGroups.personalUpload" class="group-content">
                  <div class="empty-tip">{{ t('classroom.noPersonalUploadTask') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="collapse-btn" @click="leftCollapsed = !leftCollapsed">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="leftCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'"/>
          </svg>
        </button>
      </aside>

      <!-- 中间预览区 -->
      <main class="preview-area">
        <div class="preview-toolbar">
          <button class="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
        </div>
        <div class="preview-content">
          <!-- 黑板模式（优先显示，即使在屏幕分享时也显示） -->
          <div v-if="isBlackboardMode" class="blackboard-wrapper">
            <FabricBoard />
            <!-- 屏幕分享状态小提示 -->
            <div v-if="isScreenSharing" class="share-indicator">
              <span class="indicator-dot"></span>
              <span>{{ t('classroom.sharing') }} · {{ connectedStudentCount }} {{ t('classroom.students') }}</span>
            </div>
          </div>
          <!-- 屏幕分享状态提示（非黑板模式时显示） -->
          <div v-else-if="isScreenSharing" class="screen-share-status">
            <div class="share-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3EAEFF" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span class="status-dot"></span>
            </div>
            <p class="share-text">{{ t('classroom.sharingScreen') }}</p>
            <p class="share-tip">{{ t('classroom.studentCanSeeContent') }}</p>
            <div class="connected-count">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{{ connectedStudentCount }} {{ t('classroom.studentsConnected') }}</span>
            </div>
            <button class="stop-share-btn" @click="stopScreenShare">{{ t('classroom.stopShare') }}</button>
          </div>
          <!-- 文档预览区域 -->
          <div v-else class="document-viewer">
            <!-- 加载中 -->
            <div v-if="previewLoading" class="preview-loading">
              <div class="spinner"></div>
              <span>{{ t('classroom.loading') }}</span>
            </div>
            <!-- 未选择资源 -->
            <div v-else-if="!selectedResource" class="empty-preview">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p>{{ t('classroom.selectCoursewareToPreview') }}</p>
            </div>
            <!-- PPT/Word/PDF/图片 预览 -->
            <div v-else-if="previewType === 'iframe' && iframePreviewUrl" class="iframe-preview-wrapper">
              <iframe :src="iframePreviewUrl" class="preview-iframe" frameborder="0" allowfullscreen></iframe>
            </div>
            <!-- 视频预览 -->
            <div v-else-if="previewType === 'video'" class="video-preview-wrapper">
              <video :src="selectedResource.resourceUrl" controls class="preview-video" preload="metadata"></video>
            </div>
            <!-- UCD 文件 -->
            <div v-else-if="previewType === 'ucd'" class="ucd-preview-wrapper">
              <div class="ucd-preview-card">
                <div class="ucd-icon"><span>ucd</span></div>
                <p class="ucd-filename">{{ selectedResource.name }}</p>
                <button class="ucd-btn" @click="downloadResource(selectedResource)">{{ t('classroom.download') }}</button>
              </div>
            </div>
            <!-- MC 文件 -->
            <div v-else-if="previewType === 'mc'" class="ucd-preview-wrapper">
              <div class="ucd-preview-card">
                <div class="ucd-icon mc-icon"><span>mc</span></div>
                <p class="ucd-filename">{{ selectedResource.name }}</p>
                <button class="ucd-btn" @click="downloadResource(selectedResource)">{{ t('classroom.download') }}</button>
              </div>
            </div>
            <!-- 不支持预览 -->
            <div v-else class="empty-preview">
              <p>{{ t('classroom.previewNotSupported') }}</p>
              <button class="download-btn" @click="downloadResource(selectedResource)">{{ t('classroom.downloadFile') }}</button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 发送课件弹窗 -->
    <SendCoursewareModal 
      :visible="showSendCoursewareModal" 
      :class-id="route.query.classId as string"
      :peer-id="teacherPeerId"
      :unsent-list="unsentCoursewareList"
      :sent-list="sentCoursewareList"
      @close="showSendCoursewareModal = false"
      @send="(ids) => updateCoursewareSentStatus(ids, true)"
      @recall="(ids) => updateCoursewareSentStatus(ids, false)"
    />
    
    <!-- 学生管理弹窗 -->
    <StudentManageModal :visible="showStudentManageModal" :class-id="route.query.classId as string" @close="showStudentManageModal = false" @quick-login-change="loadQuickLoginInfo" />

    <!-- 下课确认弹窗 -->
    <MModal v-model="showEndClassModal" custom-width="420px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showEndClassModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ t('classroom.endClassConfirmTitle') }}</h3>
        <p class="text-[#4D4D4D] mb-8 px-4">
          {{ t('classroom.endClassConfirmContent') }}
        </p>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showEndClassModal = false">
            {{ t('common.cancel') }}
          </button>
          <button class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="confirmEndClass">
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 返回确认弹窗（从教师首页进入时显示） -->
    <MModal v-model="showBackConfirmModal" custom-width="420px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showBackConfirmModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ t('common.tips') }}</h3>
        <p class="text-[#4D4D4D] text-center mb-8 px-4">
          {{ t('classroom.backConfirmContent') }}
        </p>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[44px] border border-[#3EAEFF] rounded-lg text-[#3EAEFF] hover:bg-blue-50"
            @click="showBackConfirmModal = false">
            {{ t('common.cancel') }}
          </button>
          <button class="w-[136px] h-[44px] bg-[#3EAEFF] text-white rounded-lg hover:bg-[#2E9EEF]"
            @click="confirmBack">
            {{ t('classroom.leaveClassroom') }}
          </button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { usePeerJS } from '~/composables/usePeerJS'
import { useTeacher } from '~/composables/api/useTeacher'
import { ElMessage } from '~/components/ui'
import { useI18n } from 'vue-i18n'

definePageMeta({ layout: 'blank' })

const { t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const { endClass } = useTeacher()
const { getQuickLoginInfo } = useTeacher()

// PeerJS 屏幕分享
const peerJS = usePeerJS()
const connectedStudentCount = computed(() => peerJS.connectedPeers.value.size)

// 信令服务器地址（用于接收学生加入通知）
const signalingUrl = (config.public.signalingUrl as string) || 'ws://192.168.0.55:8001/resource/websocket'

// WebSocket 连接（用于接收 STUDENT_JOIN 消息）
let notifyWs: WebSocket | null = null

// 老师的 PeerId（用于学生连接）
const teacherPeerId = ref('')

// 上课计时
const classTime = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// 侧边栏折叠
const leftCollapsed = ref(false)

// 屏幕分享状态（使用 PeerJS composable 的状态）
const isScreenSharing = computed(() => peerJS.isScreenSharing.value)

// 黑板模式
const isBlackboardMode = ref(false)

// 全屏管控
const isFullscreenControl = ref(false)

// 发送课件弹窗
const showSendCoursewareModal = ref(false)

// 学生管理弹窗
const showStudentManageModal = ref(false)

// 下课确认弹窗
const showEndClassModal = ref(false)

// 学生快捷登录提示
const showLoginTip = ref(true)
const loginTipCollapsed = ref(false)
const classCode = ref('')
const loginPassword = ref('')
const expireTime = ref('')

// 加载快捷登录信息
const loadQuickLoginInfo = async () => {
  try {
    const data = await getQuickLoginInfo()
    if (data && data.classCode) {
      classCode.value = data.classCode || ''
      loginPassword.value = data.classCodePwd || ''
      expireTime.value = data.expirationDate || ''
      showLoginTip.value = true
    } else {
      // 没有班级码，隐藏快捷登录提示
      classCode.value = ''
      loginPassword.value = ''
      expireTime.value = ''
      showLoginTip.value = false
    }
  } catch (error) {
    console.error('加载快捷登录信息失败:', error)
    showLoginTip.value = false
  }
}

const copyClassInfo = () => {
  const text = `班级码：${classCode.value}\n登录密码：${loginPassword.value}`
  navigator.clipboard.writeText(text)
  alert('班级信息已复制')
}

const toggleBlackboard = () => {
  isBlackboardMode.value = !isBlackboardMode.value
}

// 全屏管控 - 向学生端发送全屏指令
const toggleFullscreenControl = () => {
  isFullscreenControl.value = !isFullscreenControl.value
  const classId = route.query.classId as string
  
  if (notifyWs && notifyWs.readyState === WebSocket.OPEN) {
    const msg = JSON.stringify({
      type: 'CLASS_INTERACTION',
      peerId: classId,
      action: isFullscreenControl.value ? 'fullscreen_enter' : 'fullscreen_exit'
    })
    notifyWs.send(msg)
    console.log('[教师课堂] 发送全屏管控指令:', msg)
  }
  
  if (isFullscreenControl.value) {
    console.log('开启全屏管控，学生端将进入全屏模式')
  } else {
    console.log('关闭全屏管控，学生端将退出全屏模式')
  }
}

const toggleScreenShare = async () => {
  if (isScreenSharing.value) {
    stopScreenShare()
  } else {
    await startScreenShare()
  }
}

const startScreenShare = async () => {
  // 使用 PeerJS 开始屏幕分享
  const success = await peerJS.startScreenShare()
  if (success) {
    const classId = route.query.classId as string
    console.log('屏幕分享已开始')
    console.log('老师 PeerId:', teacherPeerId.value)
    
    // 屏幕分享开始后，通过 WebSocket 通知所有学生
    if (notifyWs && notifyWs.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({ 
        type: 'SCREEN_SHARE_START', 
        peerId: classId,
        teacherPeerId: teacherPeerId.value 
      })
      notifyWs.send(msg)
      console.log('[教师课堂] 发送屏幕分享开始通知:', msg)
    }
    
    // 延迟后直接呼叫学生
    const studentPeerId = `student_${classId}`
    const callStudent = async () => {
      // 检查是否还在分享状态
      if (!peerJS.isScreenSharing.value || !peerJS.localStream.value) {
        console.log('[教师课堂] 分享已停止，取消呼叫')
        return
      }
      console.log('[教师课堂] 呼叫学生:', studentPeerId)
      try {
        await peerJS.callPeer(studentPeerId)
        console.log('[教师课堂] 呼叫学生成功')
      } catch (err) {
        console.error('[教师课堂] 呼叫学生失败:', err)
      }
    }
    
    // 延迟 1.5 秒呼叫
    setTimeout(callStudent, 1500)
  }
}

const stopScreenShare = () => {
  // 使用 PeerJS 停止屏幕分享
  peerJS.stopScreenShare()
  console.log('屏幕分享已停止')
  
  // 通知学生端屏幕分享已停止
  const classId = route.query.classId as string
  if (notifyWs && notifyWs.readyState === WebSocket.OPEN) {
    const msg = JSON.stringify({ 
      type: 'SCREEN_SHARE_STOP', 
      peerId: classId 
    })
    notifyWs.send(msg)
    console.log('[教师课堂] 发送屏幕分享停止通知:', msg)
  }
}

// 资源列表（从接口获取）
interface ResourceItem {
  id: string
  name: string
  type: string
  resourceUrl?: string
  isSent?: boolean
}
const resourceList = ref<ResourceItem[]>([])
const resourceLoading = ref(false)

// 未发送和已发送的课件列表（供弹窗使用）
const unsentCoursewareList = computed(() => resourceList.value.filter(item => !item.isSent))
const sentCoursewareList = computed(() => resourceList.value.filter(item => item.isSent))

// 加载课件列表
const { getCoursewareList } = useTeacher()
const loadResourceList = async () => {
  const chapterId = route.params.id as string
  const classId = route.query.classId as string
  if (!chapterId) return
  
  resourceLoading.value = true
  try {
    const data = await getCoursewareList({ chapterId })
    if (data && Array.isArray(data)) {
      resourceList.value = data.map((item: any) => ({
        id: String(item.resourceId),
        name: item.fileName || item.resourceName || '未命名文件',
        type: getFileExtension(item.fileName || ''),
        resourceUrl: item.resourceUrl || '',
        isSent: item.isSent || false
      }))
      
      // 自动选中课件：优先选中上次选中的，否则选中第一个
      if (resourceList.value.length > 0) {
        const storageKey = `classroom_selected_resource_${classId}_${chapterId}`
        const lastSelectedId = localStorage.getItem(storageKey)
        
        let targetResource = null
        if (lastSelectedId) {
          // 尝试找到上次选中的课件
          targetResource = resourceList.value.find(item => item.id === lastSelectedId)
        }
        
        // 如果没有上次选中的，或者上次选中的已不存在，选中第一个
        if (!targetResource) {
          targetResource = resourceList.value[0]
        }
        
        if (targetResource) {
          await selectResource(targetResource)
        }
      }
    }
  } catch (error) {
    console.error('加载课件列表失败:', error)
  } finally {
    resourceLoading.value = false
  }
}

// 更新课件发送状态
const updateCoursewareSentStatus = (ids: string[], isSent: boolean) => {
  resourceList.value.forEach(item => {
    if (ids.includes(item.id)) {
      item.isSent = isSent
    }
  })
}

// 获取文件扩展名
const getFileExtension = (fileName: string) => {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

const activeResource = ref('')

// 预览相关
interface SelectedResourceItem {
  id: string
  name: string
  type: string
  resourceUrl?: string
  isSent?: boolean
}
const selectedResource = ref<SelectedResourceItem | null>(null)
const previewLoading = ref(false)
const previewType = ref<'iframe' | 'video' | 'ucd' | 'mc' | 'unsupported' | ''>('')
const iframePreviewUrl = ref('')

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
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    bmp: 'image',
    webp: 'image',
    svg: 'image',
    mp4: 'video',
    mov: 'video',
    webm: 'video'
  }
  return typeMap[ext] || 'default'
}

// Base64 编码函数
const base64Encode = (str: string): string => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
}

// 生成 PPT/Word/PDF 预览地址
const getPptPreviewUrl = (url: string): string => {
  const previewBaseUrl = (config.public.previewBaseUrl as string)?.trim() || 'http://192.168.0.145:8012'
  return `${previewBaseUrl}/onlinePreview?url=${encodeURIComponent(base64Encode(url))}`
}

// 下载资源
const downloadResource = (item: SelectedResourceItem) => {
  if (item.resourceUrl) {
    const link = document.createElement('a')
    link.href = item.resourceUrl
    link.download = item.name
    link.target = '_blank'
    link.click()
  }
}

// 任务分组展开状态
const expandedGroups = reactive({
  aiPractice: true,
  customExercise: true,
  classExercise: false,
  freeCoding: false,
  studentCoding: false,
  personalUpload: false
})

const toggleTaskGroup = (group: string) => {
  expandedGroups[group as keyof typeof expandedGroups] = !expandedGroups[group as keyof typeof expandedGroups]
}

const selectResource = async (item: ResourceItem) => {
  activeResource.value = item.id
  
  // 保存选中的课件到 localStorage
  const chapterId = route.params.id as string
  const classId = route.query.classId as string
  const storageKey = `classroom_selected_resource_${classId}_${chapterId}`
  localStorage.setItem(storageKey, item.id)
  
  // 设置选中的资源
  selectedResource.value = {
    id: item.id,
    name: item.name,
    type: item.type,
    resourceUrl: item.resourceUrl,
    isSent: item.isSent
  }
  
  previewLoading.value = true
  previewType.value = ''
  iframePreviewUrl.value = ''
  
  const fileType = getFileType(item.name)
  
  try {
    if ((fileType === 'word' || fileType === 'ppt' || fileType === 'excel' || fileType === 'pdf' || fileType === 'image') && item.resourceUrl) {
      // Word/PPT/Excel/PDF/图片 使用 iframe 预览
      previewType.value = 'iframe'
      iframePreviewUrl.value = getPptPreviewUrl(item.resourceUrl)
      previewLoading.value = false
    } else if (fileType === 'video' && item.resourceUrl) {
      // 视频直接播放
      previewType.value = 'video'
      previewLoading.value = false
    } else if (fileType === 'ucd') {
      // UCD 文件显示预览卡片
      previewType.value = 'ucd'
      previewLoading.value = false
    } else if (fileType === 'mc') {
      // MC 文件显示预览卡片
      previewType.value = 'mc'
      previewLoading.value = false
    } else {
      // 不支持预览
      previewType.value = 'unsupported'
      previewLoading.value = false
    }
  } catch (error) {
    console.error('加载预览失败:', error)
    previewType.value = 'unsupported'
    previewLoading.value = false
  }
}

const getResourceIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    ucd: '/assets/images/course.png',
    pdf: '/assets/images/course.png',
    ppt: '/assets/images/course.png'
  }
  return iconMap[type] || '/assets/images/course.png'
}

const selectTask = (taskId: string) => {
  console.log('选择任务:', taskId)
}

const handleEndClass = () => {
  showEndClassModal.value = true
}

const confirmEndClass = async () => {
  const chapterId = route.params.id as string
  const classId = route.query.classId as string
  const courseId = route.query.courseId as string
  
  try {
    await endClass({ classId, courseId, chapterId, peerId: teacherPeerId.value })
    console.log('下课成功')
    // 清除课堂开始时间
    const classKey = `class_start_${classId}_${chapterId}`
    localStorage.removeItem(classKey)
    // 清除正在进行的课堂信息
    localStorage.removeItem('ongoing_classroom')
    showEndClassModal.value = false
    navigateTo(`/system/course/${courseId}`)
  } catch (error: any) {
    console.error('下课失败:', error)
    ElMessage.error(error.message || '下课失败')
  }
}

const handleBack = () => {
  const from = route.query.from as string
  // 如果是从教师首页进入，显示确认弹窗
  if (from === 'teacher') {
    showBackConfirmModal.value = true
  } else {
    const courseId = route.query.courseId as string
    navigateTo(`/system/course/${courseId}`)
  }
}

// 返回确认弹窗
const showBackConfirmModal = ref(false)

const confirmBack = () => {
  showBackConfirmModal.value = false
  navigateTo('/teacher')
}

onMounted(async () => {
  // 获取路由参数
  const chapterId = route.params.id as string
  const classId = route.query.classId as string
  const courseId = route.query.courseId as string
  // 初始化 PeerJS（教师端）
  // 使用 classId 作为 PeerId 的一部分，方便学生连接
  const peerId = classId

  // 课堂计时 - 使用 localStorage 存储开课时间，支持续上
  const classKey = `class_start_${classId}_${chapterId}`
  let startTime = localStorage.getItem(classKey)
  if (!startTime) {
    // 首次开课，记录开始时间
    startTime = Date.now().toString()
    localStorage.setItem(classKey, startTime)
  }
  // 计算已上课时间
  const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000)
  classTime.value = elapsed

  // 存储正在进行的课堂信息（供全局"回到课堂"按钮使用）
  // 有效时间为2小时
  const expireAt = Date.now() + 2 * 60 * 60 * 1000
  localStorage.setItem('ongoing_classroom', JSON.stringify({
    classId,
    courseId,
    chapterId,
    expireAt
  }))
  console.log('[课堂] 已存储 ongoing_classroom:', { classId, courseId, chapterId, expireAt })

  // 开始计时
  timer = setInterval(() => {
    classTime.value++
  }, 1000)

  // 加载快捷登录信息
  loadQuickLoginInfo()
  
  // 加载课件列表
  loadResourceList()
  
  try {
    await peerJS.initialize(peerId)
    teacherPeerId.value = peerJS.myPeerId.value
    console.log('[教师课堂] PeerJS 初始化成功, PeerId:', teacherPeerId.value)
  } catch (error) {
    console.error('[教师课堂] PeerJS 初始化失败:', error)
  }

  // 连接 WebSocket 监听学生加入
  connectNotifyWebSocket(classId)
})

// 连接通知 WebSocket（监听 STUDENT_JOIN）
const connectNotifyWebSocket = (classId: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  let wsUrl = signalingUrl
  if (token) {
    const separator = signalingUrl.includes('?') ? '&' : '?'
    wsUrl = `${signalingUrl}${separator}Authorization=${encodeURIComponent(`Bearer ${token}`)}`
  }

  console.log('[教师课堂] 连接通知 WebSocket')
  notifyWs = new WebSocket(wsUrl)

  notifyWs.onopen = () => {
    console.log('[教师课堂] 通知 WebSocket 已连接')
  }

  notifyWs.onmessage = async (event) => {
    console.log('[教师课堂] 收到消息:', event.data)
    try {
      const message = JSON.parse(event.data)
      
      // 学生加入课堂
      if (message.type === 'STUDENT_JOIN') {
        console.log('[教师课堂] 学生加入课堂, classId:', message.classId)
        // 如果正在分享屏幕，呼叫学生
        if (peerJS.isScreenSharing.value) {
          const studentPeerId = `student_${message.classId || classId}`  // 加 student_ 前缀
          console.log('[教师课堂] 正在分享屏幕，呼叫学生:', studentPeerId)
          try {
            await peerJS.callPeer(studentPeerId)
            console.log('[教师课堂] 呼叫学生成功')
          } catch (err) {
            console.error('[教师课堂] 呼叫学生失败:', err)
          }
        } else {
          console.log('[教师课堂] 当前未分享屏幕，不呼叫学生')
        }
      }

      // 学生准备好接收屏幕分享
      if (message.type === 'STUDENT_READY') {
        console.log('[教师课堂] 学生准备好了, studentPeerId:', message.studentPeerId)
        if (peerJS.isScreenSharing.value && message.studentPeerId) {
          console.log('[教师课堂] 呼叫学生:', message.studentPeerId)
          try {
            await peerJS.callPeer(message.studentPeerId)
            console.log('[教师课堂] 呼叫学生成功')
          } catch (err) {
            console.error('[教师课堂] 呼叫学生失败:', err)
          }
        }
      }
    } catch (e) {
      console.log('[教师课堂] 非 JSON 消息:', event.data)
    }
  }

  notifyWs.onclose = () => {
    console.log('[教师课堂] 通知 WebSocket 已断开')
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (notifyWs) {
    notifyWs.close()
    notifyWs = null
  }
  // 销毁 PeerJS 连接
  peerJS.destroy()
})
</script>

<style scoped>
.classroom-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F5F5F5;
}

/* 顶部导航栏 */
.classroom-header {
  height: 50px;
  background: #FF9900;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.class-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 14px;
  margin-right: 8px;
}

.time-label {
  opacity: 0.9;
}

.time-value {
  font-family: monospace;
  font-weight: 500;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.header-btn.active {
  background: #FF6B6B;
}

.header-btn.ai-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 6px 16px;
}

.header-btn.ai-btn .btn-tag {
  background: #52C41A;
  border-radius: 3px;
}

.header-btn.more-btn {
  padding: 6px 10px;
}

.header-btn.more-btn .dots {
  font-size: 16px;
  letter-spacing: 2px;
}

.header-btn svg {
  flex-shrink: 0;
}

.btn-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.btn-tag {
  padding: 2px 6px;
  background: #FF9900;
  border-radius: 3px;
  font-size: 11px;
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
}

.back-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 8px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.end-class-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: white;
  border: none;
  border-radius: 20px;
  color: #FF6B6B;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.end-class-btn svg {
  stroke: #FF6B6B;
}

.end-class-btn:hover {
  background: #FFF0F0;
}

/* 主体内容 */
.classroom-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 黑板全屏模式 */
.classroom-body.blackboard-fullscreen .preview-area {
  flex: 1;
}

.classroom-body.blackboard-fullscreen .blackboard-wrapper {
  position: absolute;
  inset: 0;
  border-radius: 0;
}

.classroom-body.blackboard-fullscreen .preview-content {
  padding: 0;
}

/* 左侧边栏 */
.sidebar-left {
  width: 260px;
  background: white;
  border-right: 1px solid #E5E5E5;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s;
}

.sidebar-left.collapsed {
  width: 0;
}

.sidebar-left.collapsed .sidebar-content {
  opacity: 0;
  pointer-events: none;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  transition: opacity 0.2s;
}

.collapse-btn {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 区块样式 */
.section-block {
  border-bottom: 1px solid #E5E5E5;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background: #FAFAFA;
}

.section-title .send-btn {
  margin-left: auto;
  padding: 4px 12px;
  background: #FF9900;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.section-title .send-btn:hover {
  background: #E68A00;
}

/* 资源列表 */
.resource-list {
  padding: 8px 12px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.resource-item:hover {
  background: #F5F5F5;
}

.resource-item.active {
  background: #E6F4FF;
  color: #1890FF;
}

.resource-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.resource-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 任务列表 */
.task-list {
  padding: 8px 12px;
  font-size: 13px;
}

.task-group {
  margin-bottom: 4px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 8px;
  cursor: pointer;
  color: #333;
  border-radius: 4px;
  flex-wrap: wrap;
}

.group-header:hover {
  background: #F5F5F5;
}

.expand-icon {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.group-desc {
  font-size: 11px;
  color: #999;
  margin-left: auto;
  flex-shrink: 0;
}

.group-content {
  padding-left: 18px;
}

.task-item {
  padding: 8px 8px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
}

.task-item:hover {
  background: #F5F5F5;
  color: #333;
}

.empty-tip {
  padding: 8px 8px;
  color: #999;
  font-size: 12px;
}

/* 中间预览区 */
.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #E8E8E8;
  position: relative;
}

.preview-toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: #F5F5F5;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding: 20px; */
}

.document-viewer {
  width: 100%;
  height: 100%;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.empty-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  gap: 16px;
}

.empty-preview p {
  margin: 0;
}

/* 预览加载中 */
.preview-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #666;
}

.preview-loading .spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E5E5;
  border-top-color: #FF9900;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* iframe 预览 */
.iframe-preview-wrapper {
  width: 100%;
  height: 100%;
}

.iframe-preview-wrapper .preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 视频预览 */
.video-preview-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
}

/* UCD/MC 文件预览卡片 */
.ucd-preview-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ucd-preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  background: #FAFAFA;
  border-radius: 12px;
}

.ucd-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FF9900 0%, #FFB84D 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.ucd-icon.mc-icon {
  background: linear-gradient(135deg, #3EAEFF 0%, #6BC5FF 100%);
}

.ucd-filename {
  font-size: 14px;
  color: #333;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

.ucd-btn {
  padding: 8px 24px;
  background: #FF9900;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.ucd-btn:hover {
  background: #E68A00;
}

/* 下载按钮 */
.download-btn {
  padding: 8px 24px;
  background: #FF9900;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #E68A00;
}

/* 屏幕分享状态 */
.screen-share-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.share-icon {
  position: relative;
  margin-bottom: 16px;
}

.share-icon .status-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: #FF6B6B;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 1.5s infinite;
}

.share-text {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.share-tip {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.connected-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #E8F5E9;
  border-radius: 20px;
  color: #4CAF50;
  font-size: 14px;
  margin-bottom: 24px;
}

.connected-count svg {
  color: #4CAF50;
}

.stop-share-btn {
  padding: 10px 32px;
  background: #FF6B6B;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.stop-share-btn:hover {
  background: #FF5252;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 黑板模式 */
.blackboard-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

/* 屏幕分享时黑板上的小提示 */
.share-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(62, 174, 255, 0.9);
  border-radius: 20px;
  color: white;
  font-size: 13px;
  z-index: 100;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  background: #FF6B6B;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

/* PDF 工具栏 */
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: white;
  border-top: 1px solid #E5E5E5;
}

.pdf-toolbar .toolbar-left,
.pdf-toolbar .toolbar-center,
.pdf-toolbar .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pdf-toolbar .divider {
  width: 1px;
  height: 20px;
  background: #E5E5E5;
  margin: 0 4px;
}

.pdf-toolbar .tool-label {
  font-size: 13px;
  color: #666;
}

.pdf-toolbar .page-info {
  font-size: 13px;
  color: #666;
  min-width: 60px;
  text-align: center;
}

.pdf-toolbar .page-input {
  width: 50px;
  height: 28px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  outline: none;
}

.pdf-toolbar .page-input:focus {
  border-color: #FF9900;
}

.pdf-toolbar .tool-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-toolbar .tool-btn:hover:not(:disabled) {
  background: #E5E5E5;
}

.pdf-toolbar .tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pdf-toolbar .tool-btn.icon {
  font-size: 16px;
  padding: 0;
  width: 32px;
}

.pdf-toolbar .tool-btn.icon.active {
  background: #FF9900;
  border-color: #FF9900;
}

.pdf-toolbar .tool-btn.small {
  padding: 0 10px;
}

.pdf-toolbar .color-picker {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  cursor: pointer;
}

.pdf-toolbar .width-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.pdf-toolbar .zoom-value {
  font-size: 13px;
  color: #666;
  min-width: 45px;
  text-align: center;
}

.preview-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: white;
  border-top: 1px solid #E5E5E5;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #E5E5E5;
  margin: 0 8px;
}

.tool-label {
  font-size: 13px;
  color: #666;
}

.page-input {
  width: 50px;
  height: 28px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  outline: none;
}

.page-input:focus {
  border-color: #FF9900;
}

.jump-btn {
  padding: 4px 12px;
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
}

.jump-btn:hover {
  background: #E5E5E5;
}

.zoom-value {
  font-size: 13px;
  color: #666;
  min-width: 45px;
  text-align: center;
}

.page-btn {
  width: 32px;
  height: 32px;
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #E5E5E5;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 学生快捷登录提示框 */
.login-tip-panel {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 340px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
}

.tip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #F0F0F0;
  background: linear-gradient(135deg, #F8FCFF 0%, #FFFFFF 100%);
}

.tip-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tip-expire-inline {
  font-size: 13px;
  color: #999;
}

.tip-actions {
  display: flex;
  gap: 4px;
}

.tip-action-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.tip-action-btn:hover {
  background: #F0F0F0;
  color: #666;
}

.tip-body {
  padding: 16px 20px;
}

.info-card {
  background: #F8F9FA;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
  position: relative;
}

.info-card.link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-card.code-card {
  padding-right: 80px;
}

.code-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.code-row:last-child {
  margin-bottom: 0;
}

.code-label {
  font-size: 14px;
  color: #666;
  min-width: 80px;
}

.code-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  font-family: 'SF Mono', Monaco, monospace;
  letter-spacing: 1px;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #3EAEFF;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #E6F4FF;
}

.copy-btn svg {
  stroke: #3EAEFF;
}

.card-copy {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
}

.tip-footer {
  font-size: 13px;
  color: #999;
  margin: 4px 0 0;
  text-align: center;
}

.login-tip-panel.collapsed {
  width: auto;
}

.login-tip-panel.collapsed .tip-header {
  border-bottom: none;
  padding: 12px 16px;
}
</style>
