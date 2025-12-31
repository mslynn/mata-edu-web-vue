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
          <span class="time-label">已上课</span>
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
          <span>学生管理</span>
        </button>
        <button class="header-btn" :class="{ active: isScreenSharing }" @click="toggleScreenShare">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <span>{{ isScreenSharing ? '停止分享' : '屏幕分享' }}</span>
        </button>
        <button class="header-btn" :class="{ active: isFullscreenControl }" @click="toggleFullscreenControl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <span>全屏管控</span>
        </button>
        <span class="divider"></span>
        <button class="header-btn" :class="{ active: isBlackboardMode }" @click="toggleBlackboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <path d="M8 21h8"/>
            <path d="M12 17v4"/>
          </svg>
          <span>{{ isBlackboardMode ? '退出黑板' : '切至黑板' }}</span>
        </button>
        <span class="divider"></span>
        <button class="end-class-btn" @click="handleEndClass">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span>下课</span>
        </button>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="classroom-body" :class="{ 'blackboard-fullscreen': isBlackboardMode }">
      <!-- 学生快捷登录提示框 -->
      <div v-if="showLoginTip" class="login-tip-panel" :class="{ collapsed: loginTipCollapsed }">
        <div class="tip-header">
          <div class="tip-header-left">
            <span class="tip-title">学生快捷登录</span>
            <span class="tip-expire-inline">有效时长为2小时，{{ expireTime }}过期</span>
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
          <div class="info-card link-card">
            <span class="info-label">快捷登录链接</span>
            <button class="copy-btn" @click="copyLoginLink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>复制</span>
            </button>
          </div>
          <div class="info-card code-card">
            <div class="code-row">
              <span class="code-label">班级码：</span>
              <span class="code-value">{{ classCode }}</span>
            </div>
            <div class="code-row">
              <span class="code-label">登录密码：</span>
              <span class="code-value">{{ loginPassword }}</span>
            </div>
            <button class="copy-btn card-copy" @click="copyClassInfo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>复制</span>
            </button>
          </div>
          <p class="tip-footer">点击顶部「学生管理」可查看登录情况</p>
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
              <span>课件</span>
              <button class="send-btn" @click="showSendCoursewareModal = true">发送课件给学生</button>
            </div>
            <div class="resource-list">
              <div 
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
              <span>任务</span>
            </div>
            <div class="task-list">
              <!-- 1. AI实践任务 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('aiPractice')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.aiPractice }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>AI实践任务</span>
                  <span class="group-desc">关联玛塔AI实践中心</span>
                </div>
                <div v-if="expandedGroups.aiPractice" class="group-content">
                  <div class="task-item" @click="selectTask('ai-dialog')">
                    <span>AI对话大模型</span>
                  </div>
                  <div class="task-item" @click="selectTask('cluster')">
                    <span>聚类分析</span>
                  </div>
                </div>
              </div>
              <!-- 2. 自定义练习题 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('customExercise')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.customExercise }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>自定义练习题</span>
                  <span class="group-desc">教师个人自定义出题</span>
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
                  <span>随堂练习</span>
                  <span class="group-desc">后台配置的习题，题库中的</span>
                </div>
                <div v-if="expandedGroups.classExercise" class="group-content">
                  <div class="empty-tip">暂无随堂练习</div>
                </div>
              </div>
              <!-- 4. 自由编程 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('freeCoding')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.freeCoding }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>自由编程</span>
                  <span class="group-desc">平台推送自由编程类任务</span>
                </div>
                <div v-if="expandedGroups.freeCoding" class="group-content">
                  <div class="task-item">
                    <span>自由创作任务</span>
                  </div>
                </div>
              </div>
              <!-- 5. 学生编程任务 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('studentCoding')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.studentCoding }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>学生编程任务</span>
                  <span class="group-desc">后台配置的编程任务</span>
                </div>
                <div v-if="expandedGroups.studentCoding" class="group-content">
                  <div class="empty-tip">暂无学生编程任务</div>
                </div>
              </div>
              <!-- 6. 个人上传任务 -->
              <div class="task-group">
                <div class="group-header" @click="toggleTaskGroup('personalUpload')">
                  <svg class="expand-icon" :class="{ expanded: expandedGroups.personalUpload }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <span>个人上传任务</span>
                  <span class="group-desc">教师个人上传的编程任务</span>
                </div>
                <div v-if="expandedGroups.personalUpload" class="group-content">
                  <div class="empty-tip">暂无个人上传任务</div>
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
          <!-- 屏幕分享状态提示 -->
          <div v-if="isScreenSharing" class="screen-share-status">
            <div class="share-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3EAEFF" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <span class="status-dot"></span>
            </div>
            <p class="share-text">正在分享屏幕</p>
            <p class="share-tip">学生端可以看到您分享的内容</p>
            <div class="connected-count">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{{ connectedStudentCount }} 名学生已连接</span>
            </div>
            <button class="stop-share-btn" @click="stopScreenShare">停止分享</button>
          </div>
          <!-- 黑板模式 -->
          <div v-else-if="isBlackboardMode" class="blackboard-wrapper">
            <FabricBoard />
          </div>
          <!-- 文档预览区域 -->
          <div v-else class="document-viewer">
            <iframe v-if="previewUrl" :src="previewUrl" class="preview-iframe"></iframe>
            <div v-else class="empty-preview">
              <p>请选择要预览的课件</p>
            </div>
          </div>
        </div>
        <!-- 底部分页栏 (黑板模式隐藏) -->
        <div v-if="!isBlackboardMode" class="preview-pagination">
          <button class="page-btn" :disabled="currentPage <= 1" @click="prevPage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          <span class="page-info">{{ currentPage }}/{{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="nextPage">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          <button class="page-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </main>
    </div>

    <!-- 发送课件弹窗 -->
    <SendCoursewareModal :visible="showSendCoursewareModal" @close="showSendCoursewareModal = false" />
    
    <!-- 学生管理弹窗 -->
    <StudentManageModal :visible="showStudentManageModal" @close="showStudentManageModal = false" />

    <!-- 下课确认弹窗 -->
    <MModal v-model="showEndClassModal" custom-width="420px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showEndClassModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">提示</h3>
        <p class="text-[#4D4D4D] mb-8 px-4">
          确定结束本节课教学吗？学生端将会收到下课通知。快捷登录方式将自动停用，已登录学生不受影响。
        </p>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showEndClassModal = false">
            取消
          </button>
          <button class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="confirmEndClass">
            确定
          </button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useWebRTC } from '~/composables/useWebRTC'

definePageMeta({ layout: 'blank' })

const route = useRoute()
const config = useRuntimeConfig()

// WebRTC 屏幕分享
const webRTC = useWebRTC()
const connectedStudentCount = computed(() => webRTC.connectedPeers.value.size)

// 信令服务器地址（从环境变量或使用默认值）
const signalingUrl = (config.public.signalingUrl as string) || 'ws://192.168.0.17:8001/resource/websocket'

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

// 屏幕分享状态（使用 WebRTC composable 的状态）
const isScreenSharing = computed(() => webRTC.isScreenSharing.value)

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
const classCode = ref('75688')
const loginPassword = ref('388363')
const expireTime = ref('18:08')

const copyLoginLink = () => {
  const link = `${window.location.origin}/login?classCode=${classCode.value}`
  navigator.clipboard.writeText(link)
  alert('登录链接已复制')
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
  if (isFullscreenControl.value) {
    // TODO: 通过 WebSocket 向所有学生端发送全屏指令
    console.log('开启全屏管控，学生端将进入全屏模式')
    alert('已开启全屏管控，学生端将进入全屏模式')
  } else {
    // TODO: 通过 WebSocket 向所有学生端发送退出全屏指令
    console.log('关闭全屏管控，学生端将退出全屏模式')
    alert('已关闭全屏管控')
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
  // 使用 WebRTC 开始屏幕分享
  const success = await webRTC.startScreenShare()
  if (success) {
    console.log('屏幕分享已开始，等待学生连接...')
  }
}

const stopScreenShare = () => {
  // 使用 WebRTC 停止屏幕分享
  webRTC.stopScreenShare()
  console.log('屏幕分享已停止')
}

// 资源列表（扁平列表）
const resourceList = ref([
  { id: '1', name: '主题01-"悟空"来了（课件...）', type: 'ucd' },
  { id: '2', name: '1-1多变悟空.ucd', type: 'ucd' },
  { id: '3', name: '1-2孝顺悟空.ucd', type: 'ucd' },
  { id: '4', name: '主题01-"悟空"来了（学生...）', type: 'ucd' },
  { id: '5', name: '主题01-"悟空"来了（教师...）', type: 'ucd' },
  { id: '6', name: '主题01-"悟空"来了（课件...）', type: 'ucd' },
  { id: '7', name: '主题02-"工程狮"来了', type: 'ucd' },
  { id: '8', name: '主题03-人脸解锁', type: 'ucd' },
  { id: '9', name: '主题04-"悟空"听我的', type: 'ucd' },
  { id: '10', name: '主题05-生日快乐', type: 'ucd' },
  { id: '11', name: '主题06-垃圾分类', type: 'ucd' },
  { id: '12', name: '主题07-活动课：小小编剧', type: 'ucd' }
])

const activeResource = ref('')
const previewUrl = ref('')
const currentPage = ref(1)
const totalPages = ref(3)

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

const selectResource = (item: any) => {
  activeResource.value = item.id
  // TODO: 加载预览
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

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const handleEndClass = () => {
  showEndClassModal.value = true
}

const confirmEndClass = () => {
  showEndClassModal.value = false
  // TODO: 调用接口结束课程
  navigateTo('/system/course')
}

const handleBack = () => {
  navigateTo('/system/course')
}

onMounted(() => {
  // 开始计时
  timer = setInterval(() => {
    classTime.value++
  }, 1000)

  // 初始化 WebRTC（教师端）
  const classroomId = route.params.id as string
  const teacherId = `teacher_${Date.now()}` // 实际应从用户信息获取
  
  webRTC.initialize({
    signalingUrl: signalingUrl,
    roomId: classroomId,
    userId: teacherId,
    role: 'teacher',
    onPeerConnected: (peerId) => {
      console.log('学生已连接:', peerId)
    },
    onPeerDisconnected: (peerId) => {
      console.log('学生已断开:', peerId)
    },
    onError: (error) => {
      console.error('WebRTC 错误:', error)
    }
  })
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  // 销毁 WebRTC 连接
  webRTC.destroy()
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
  background: #3EAEFF;
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
  padding: 20px;
}

.document-viewer {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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
  align-items: center;
  justify-content: center;
  color: #999;
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
}

.preview-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-top: 1px solid #E5E5E5;
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
