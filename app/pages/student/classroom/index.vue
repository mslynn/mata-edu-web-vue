<template>
  <div class="student-classroom">
    <!-- 顶部导航栏 -->
    <header class="classroom-header">
      <button class="header-back-btn" @click="handleBack" aria-label="返回学生首页">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div class="header-center">
        <span class="student-name">{{ studentName }}</span>
        <span class="class-name">{{ className || '课堂学习' }}</span>
        <span class="divider">|</span>
        <span class="class-time">{{ formatTime(classTime) }}</span>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="classroom-body">
      <!-- 屏幕分享接收区域 -->
      <div class="screen-area">
        <!-- 等待状态（连接中/等待上课/等待屏幕分享） -->
        <div v-if="!hasRemoteStream" class="waiting-screen">
          <!-- 提示条 -->
          <div v-if="classStarted" class="notice-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span>老师已经开课了，请注意听讲哦</span>
          </div>

          <!-- 装饰背景 -->
          <div class="decoration-bg">
            <div class="blob blob-1"></div>
            <div class="blob blob-2"></div>
            <div class="blob blob-3"></div>
            <div class="blob blob-4"></div>
            <div class="confetti confetti-1"></div>
            <div class="confetti confetti-2"></div>
            <div class="confetti confetti-3"></div>
            <div class="confetti confetti-4"></div>
            <div class="confetti confetti-5"></div>
          </div>

          <!-- 中心文字 -->
          <div class="center-text">
            <p class="main-text">{{ classStarted ? '课程已开始' : '等待上课' }}</p>
            <p class="sub-text">{{ classStarted ? '请注意听讲' : '请耐心等待老师开课' }}</p>
          </div>
        </div>

        <!-- 远程视频 -->
        <video 
          v-else
          ref="remoteVideoRef" 
          autoplay 
          playsinline
          muted
          class="remote-video"
        />
      </div>

      <!-- 左下角按钮组 -->
      <div class="left-bottom-btns">
        <!-- 课程资源按钮 - 收到课件后显示 -->
        <button v-if="receivedCoursewareList.length > 0" class="resource-btn" @click="showResourceModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span>课程资源</span>
          <span class="resource-badge">{{ receivedCoursewareList.length }}</span>
        </button>
        
        <!-- 课堂任务按钮 -->
        <button class="task-btn">
          <span>课堂任务</span>
        </button>
      </div>
    </div>

    <!-- 下课提示弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showClassEndModal" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CD964" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3 class="modal-title">下课啦</h3>
            <p class="modal-text">老师已结束本节课，感谢你的认真听讲！</p>
            <button class="modal-btn" @click="handleClassEndConfirm">确定</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 被踢出弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showKickoutModal" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
              </svg>
            </div>
            <h3 class="modal-title">已被移出课堂</h3>
            <p class="modal-text">老师已将你移出课堂，请联系老师了解原因</p>
            <button class="modal-btn modal-btn-red" @click="handleKickoutConfirm">确定</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 全屏管控弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showFullscreenModal" class="modal-overlay">
          <div class="modal-container">
            <div class="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3EAEFF" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </div>
            <h3 class="modal-title">全屏模式</h3>
            <p class="modal-text">老师开启了全屏管控，点击确定进入全屏模式专心听课</p>
            <button class="modal-btn modal-btn-blue" @click="handleFullscreenConfirm">确定</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 课程资源弹窗 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showResourceModal" class="resource-modal-overlay" @click.self="showResourceModal = false">
          <div class="resource-modal-container">
            <div class="resource-modal-header">
              <span class="resource-modal-title">课程资源</span>
              <button class="resource-close-btn" @click="showResourceModal = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="resource-modal-body">
              <!-- 左侧资源列表 -->
              <div class="resource-list-panel">
                <div class="resource-list-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CD964" stroke-width="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>课件</span>
                </div>
                <div class="resource-list">
                  <div 
                    v-for="(item, index) in receivedCoursewareList" 
                    :key="item.resourceId"
                    class="resource-item"
                    :class="{ 'is-selected': selectedResourceIndex === index }"
                    @click="selectResource(index)"
                  >
                    <div class="resource-icon" :class="getResourceIconClass(item.fileName)">
                      {{ getResourceIconText(item.fileName) }}
                    </div>
                    <span class="resource-name" :title="item.fileName">{{ item.fileName }}</span>
                  </div>
                  <div v-if="receivedCoursewareList.length === 0" class="resource-empty">
                    暂无课件
                  </div>
                </div>
              </div>
              
              <!-- 右侧预览区域 -->
              <div class="resource-preview-panel">
                <div v-if="selectedResource" class="preview-content">
                  <div v-if="previewLoading" class="preview-loading">
                    <div class="loading-spinner"></div>
                    <span>加载中...</span>
                  </div>
                  <iframe 
                    v-if="previewUrl"
                    :src="previewUrl" 
                    class="preview-iframe"
                    :class="{ hidden: previewLoading }"
                    frameborder="0"
                    @load="previewLoading = false"
                  ></iframe>
                </div>
                <div v-else class="preview-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span>选择左侧资源进行预览</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { usePeerJS } from '~/composables/usePeerJS'

definePageMeta({ layout: 'blank' })

const config = useRuntimeConfig()
const route = useRoute()
const STUDENT_ONGOING_CLASSROOM_KEY = 'student_ongoing_classroom'
const STUDENT_PAUSE_AUTO_ENTER_KEY = 'student_pause_auto_enter_classroom'
const STUDENT_CLASS_TIMER_STATE_KEY = 'student_classroom_timer_state'

// 信令服务器地址（用于接收 CLASS_BEGIN）
const signalingUrl =
  (config.public.signalingUrl as string) || 'ws://192.168.0.55:8001/resource/websocket'

// 状态
const className = ref('')
const studentName = ref('学生')
const wsConnected = ref(false)
const classStarted = ref(false)
const showClassEndModal = ref(false) // 下课弹窗
const showFullscreenModal = ref(false) // 全屏管控弹窗
const showResourceModal = ref(false) // 课程资源弹窗
const showKickoutModal = ref(false) // 被踢出弹窗

// 保存/清理课堂状态（用于学生首页“返回课堂”入口）
const saveOngoingClassroom = () => {
  if (typeof window === 'undefined') return
  const payload = {
    classId: String(currentClassId.value || ''),
    teacherPeerId: String(currentTeacherPeerId.value || ''),
    expireAt: Date.now() + 2 * 60 * 60 * 1000
  }
  localStorage.setItem(STUDENT_ONGOING_CLASSROOM_KEY, JSON.stringify(payload))
}

const clearOngoingClassroom = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STUDENT_ONGOING_CLASSROOM_KEY)
}

const setPauseAutoEnterClassroom = (paused: boolean) => {
  if (typeof window === 'undefined') return
  if (paused) {
    localStorage.setItem(STUDENT_PAUSE_AUTO_ENTER_KEY, '1')
  } else {
    localStorage.removeItem(STUDENT_PAUSE_AUTO_ENTER_KEY)
  }
}

// 生成固定的学生 peerId（使用用户ID区分不同学生）
const getStudentPeerId = (classId: string) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}')
    const userId = userInfo.id || userInfo.user_id || 'unknown'
    return `student_${classId}_${userId}`
  } catch {
    return `student_${classId}_unknown`
  }
}

// 初始化 PeerJS（带重试，处理 ID taken 的情况）
const initializePeerJS = async (classId: string, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      // 先销毁旧的连接
      if (peerJS.peer.value) {
        peerJS.destroy()
        // 等待一下让服务器释放 ID
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      const studentPeerId = getStudentPeerId(classId)
      await peerJS.initialize(studentPeerId)
      console.log('[学生课堂] PeerJS 初始化成功, PeerId:', peerJS.myPeerId.value)
      return true
    } catch (error: any) {
      console.error(`[学生课堂] PeerJS 初始化失败 (${i + 1}/${maxRetries}):`, error?.message || error)
      if (i < maxRetries - 1) {
        // ID taken 时等待久一点再重试
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
  return false
}

// 课程资源相关
interface CoursewareItem {
  resourceId: string
  fileName: string
  resourceUrl: string
}
const receivedCoursewareList = ref<CoursewareItem[]>([])
const selectedResourceIndex = ref(-1)
const previewLoading = ref(false)

// 当前选中的资源
const selectedResource = computed(() => {
  if (selectedResourceIndex.value >= 0 && selectedResourceIndex.value < receivedCoursewareList.value.length) {
    return receivedCoursewareList.value[selectedResourceIndex.value]
  }
  return null
})

// 预览 URL
const previewUrl = computed(() => {
  if (!selectedResource.value) return ''
  const previewBaseUrl = config.public.previewBaseUrl || 'http://192.168.0.145:8012'
  const resourceUrl = selectedResource.value.resourceUrl
  // base64 编码
  const base64Url = btoa(unescape(encodeURIComponent(resourceUrl)))
  return `${previewBaseUrl}/onlinePreview?url=${encodeURIComponent(base64Url)}`
})

// 选择资源
const selectResource = (index: number) => {
  if (selectedResourceIndex.value !== index) {
    selectedResourceIndex.value = index
    previewLoading.value = true
  }
}

// 获取资源图标类名
const getResourceIconClass = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (['ppt', 'pptx'].includes(ext)) return 'icon-ppt'
  if (['doc', 'docx'].includes(ext)) return 'icon-word'
  if (['pdf'].includes(ext)) return 'icon-pdf'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'icon-image'
  return 'icon-file'
}

// 获取资源图标文字
const getResourceIconText = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (['ppt', 'pptx'].includes(ext)) return 'P'
  if (['doc', 'docx'].includes(ext)) return 'W'
  if (['pdf'].includes(ext)) return 'PDF'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return '图'
  return 'F'
}
// 从路由获取 classId 和 teacherPeerId
const currentClassId = ref((route.query.classId as string) || '')
// 老师的 PeerId
const currentTeacherPeerId = ref((route.query.teacherPeerId as string) || '')
// 上课计时
const classTime = ref(0)
let classTimer: ReturnType<typeof setInterval> | null = null

const clearClassTimerState = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STUDENT_CLASS_TIMER_STATE_KEY)
}

const getOrCreateClassStartAt = (classId: string) => {
  const now = Date.now()
  if (typeof window === 'undefined') return now

  try {
    const stored = localStorage.getItem(STUDENT_CLASS_TIMER_STATE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const storedClassId = String(parsed?.classId || '')
      const startAt = Number(parsed?.startAt || 0)
      if (
        storedClassId === String(classId || '') &&
        Number.isFinite(startAt) &&
        startAt > 0
      ) {
        return startAt
      }
    }
  } catch {
    // ignore parse error and rewrite state
  }

  localStorage.setItem(
    STUDENT_CLASS_TIMER_STATE_KEY,
    JSON.stringify({
      classId: String(classId || ''),
      startAt: now
    })
  )
  return now
}

const syncClassTime = (startAt: number) => {
  classTime.value = Math.max(0, Math.floor((Date.now() - startAt) / 1000))
}

const startClassTimer = (classId: string) => {
  if (!classId) return
  const startAt = getOrCreateClassStartAt(classId)
  syncClassTime(startAt)
  if (classTimer) {
    clearInterval(classTimer)
  }
  classTimer = setInterval(() => {
    syncClassTime(startAt)
  }, 1000)
}

const stopClassTimer = (removeState = false) => {
  if (classTimer) {
    clearInterval(classTimer)
    classTimer = null
  }
  if (removeState) {
    clearClassTimerState()
    classTime.value = 0
  }
}
// 组件是否已卸载
let isUnmounted = false

// 格式化时间
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// 连接老师（简单重试）
const connectToTeacherWithRetry = async (teacherPeerId: string) => {
  // 如果已经有远程流了，不需要再连接
  if (peerJS.remoteStream.value) {
    console.log('[学生课堂] 已有远程流，跳过连接')
    return true
  }
  
  for (let i = 0; i < 3; i++) {
    try {
      await peerJS.connectToTeacher(teacherPeerId)
      console.log('[学生课堂] 已向老师发送屏幕分享请求')
      return true
    } catch (err) {
      console.error(`[学生课堂] 连接老师失败 (${i + 1}/3):`, err)
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
  return false
}

// WebSocket 实例（用于监听 CLASS_BEGIN）
let notifyWs: WebSocket | null = null

// PeerJS
const peerJS = usePeerJS()
const myPeerId = computed(() => peerJS.myPeerId.value)

// 远程流
const remoteVideoRef = ref<HTMLVideoElement | null>(null)
const hasRemoteStream = computed(() => peerJS.remoteStream.value !== null)

// 连接状态
const isConnected = computed(() => wsConnected.value || classStarted.value)

// 连接状态文本
const connectionStatusText = computed(() => {
  if (!wsConnected.value && !classStarted.value) return '连接中...'
  if (!classStarted.value) return '等待上课'
  if (hasRemoteStream.value) return '上课中'
  return '等待屏幕分享'
})

// 监听远程流变化，绑定到 video 元素
watch(
  () => peerJS.remoteStream.value,
  async (stream, oldStream) => {
    console.log('[学生课堂] remoteStream 变化:', stream)
    
    // 如果有旧流，先停止
    if (oldStream && remoteVideoRef.value) {
      remoteVideoRef.value.srcObject = null
    }
    
    if (stream) {
      // 等待 DOM 更新（v-if 条件变化后 video 元素才会渲染）
      await nextTick()
      
      // 延迟一点确保 DOM 完全渲染
      await new Promise(resolve => setTimeout(resolve, 50))
      
      if (remoteVideoRef.value && peerJS.remoteStream.value === stream) {
        remoteVideoRef.value.srcObject = stream
        console.log('[学生课堂] 视频流已绑定到 video 元素')
        // 尝试播放
        try {
          await remoteVideoRef.value.play()
          console.log('[学生课堂] 视频开始播放')
        } catch (err: any) {
          // 忽略 AbortError（用户交互导致的中断）
          if (err.name !== 'AbortError') {
            console.error('[学生课堂] 视频播放失败:', err)
          }
        }
      } else if (!remoteVideoRef.value) {
        console.warn('[学生课堂] video 元素未找到，稍后重试')
        // 再等一下
        setTimeout(async () => {
          if (remoteVideoRef.value && peerJS.remoteStream.value === stream) {
            remoteVideoRef.value.srcObject = stream
            console.log('[学生课堂] 视频流已绑定到 video 元素（重试）')
            try {
              await remoteVideoRef.value.play()
              console.log('[学生课堂] 视频开始播放（重试）')
            } catch (err: any) {
              if (err.name !== 'AbortError') {
                console.error('[学生课堂] 视频播放失败（重试）:', err)
              }
            }
          }
        }, 200)
      }
    }
  }
)

// 连接通知 WebSocket（监听 CLASS_BEGIN）
const connectNotifyWebSocket = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  let wsUrl = signalingUrl
  if (token) {
    const separator = signalingUrl.includes('?') ? '&' : '?'
    wsUrl = `${signalingUrl}${separator}Authorization=${encodeURIComponent(`Bearer ${token}`)}`
  }

  console.log('[学生课堂] 连接通知 WebSocket')
  notifyWs = new WebSocket(wsUrl)

  notifyWs.onopen = () => {
    console.log('[学生课堂] 通知 WebSocket 已连接')
    wsConnected.value = true
    
    // 发送学生在线状态，后台会推送当前课堂信息
    const statusMsg = JSON.stringify({ type: 'STUDENT_STATUS', status: 'online' })
    notifyWs?.send(statusMsg)
    console.log('[学生课堂] 发送:', statusMsg)
  }

  notifyWs.onmessage = async (event) => {
    console.log('[学生课堂] 收到消息:', event.data)
    try {
      const message = JSON.parse(event.data)

      // 处理 CLASS_BEGIN 消息
      if (message.type === 'CLASS_BEGIN') {
        const teacherPeerId = message.peerId // 老师的 PeerId
        // 从老师的 peerId 中提取 classId（格式：teacher_{classId}）
        const classId = message.classId || currentClassId.value || (teacherPeerId ? teacherPeerId.replace('teacher_', '') : '') || '1996788444002480128'
        console.log('[学生课堂] 收到上课通知! classId:', classId, 'teacherPeerId:', teacherPeerId)
        currentClassId.value = classId
        classStarted.value = true
        
        // 开始计时（基于开课时间戳回算，返回首页再进来也不会重置）
        startClassTimer(classId)
        
        if (teacherPeerId) {
          currentTeacherPeerId.value = teacherPeerId
        }
        saveOngoingClassroom()

        // 如果 PeerJS 还没初始化或没连接，现在初始化
        if (!peerJS.isConnected.value || !peerJS.peer.value) {
          const success = await initializePeerJS(classId)
          if (!success) {
            console.error('[学生课堂] PeerJS 初始化失败')
            return
          }
        }
        
        // PeerJS 已连接，连接老师请求屏幕分享
        if (teacherPeerId && peerJS.isConnected.value) {
          console.log('[学生课堂] 尝试连接老师请求屏幕分享:', teacherPeerId)
          await connectToTeacherWithRetry(teacherPeerId)
        }
        console.log('[学生课堂] 等待老师呼叫...')
      }

      // 处理 CLASS_END 消息
      if (message.type === 'CLASS_END') {
        console.log('[学生课堂] 收到下课通知!')
        classStarted.value = false
        clearOngoingClassroom()
        setPauseAutoEnterClassroom(false)
        stopClassTimer(true)
        peerJS.destroy()
        // 显示下课弹窗
        showClassEndModal.value = true
      }

      // 处理 SCREEN_SHARE_START 消息 - 老师开始屏幕分享
      if (message.type === 'SCREEN_SHARE_START') {
        console.log('[学生课堂] 收到屏幕分享开始通知!')
        const teacherPeerId = message.teacherPeerId || currentTeacherPeerId.value
        if (teacherPeerId) {
          currentTeacherPeerId.value = teacherPeerId
        }
        
        // 如果已经有远程流了，说明已经连接成功，不需要再处理
        if (peerJS.remoteStream.value) {
          console.log('[学生课堂] 已有远程流，跳过')
          return
        }
        
        // 主动连接老师请求屏幕分享
        if (teacherPeerId && peerJS.isConnected.value) {
          console.log('[学生课堂] 主动连接老师请求屏幕分享:', teacherPeerId)
          await connectToTeacherWithRetry(teacherPeerId)
        } else if (!peerJS.isConnected.value) {
          // PeerJS 还没连接，先初始化
          console.log('[学生课堂] PeerJS 未连接，先初始化')
          const classId = currentClassId.value || '1996788444002480128'
          const success = await initializePeerJS(classId)
          if (success && teacherPeerId) {
            await connectToTeacherWithRetry(teacherPeerId)
          }
        }
      }

      // 处理 SCREEN_SHARE_STOP 消息 - 老师停止屏幕分享
      if (message.type === 'SCREEN_SHARE_STOP') {
        console.log('[学生课堂] 收到屏幕分享停止通知!')
        // 清除远程流，UI 会自动切换到等待状态
        peerJS.remoteStream.value = null
      }

      // 处理 CLASS_INTERACTION 消息 - 课堂互动（全屏管控等）
      if (message.type === 'CLASS_INTERACTION') {
        console.log('[学生课堂] 收到课堂互动指令:', message.action)
        
        // 全屏管控
        if (message.action === 'fullscreen_enter') {
          showFullscreenModal.value = true
        } else if (message.action === 'fullscreen_exit') {
          try {
            if (document.fullscreenElement) {
              await document.exitFullscreen()
              console.log('[学生课堂] 已退出全屏模式')
            }
          } catch (err) {
            console.error('[学生课堂] 退出全屏失败:', err)
          }
        }
      }

      // 处理 FULLSCREEN_CONTROL 消息 - 全屏管控（兼容旧格式）
      if (message.type === 'FULLSCREEN_CONTROL') {
        console.log('[学生课堂] 收到全屏管控指令:', message.action)
        if (message.action === 'enter') {
          showFullscreenModal.value = true
        } else if (message.action === 'exit') {
          try {
            if (document.fullscreenElement) {
              await document.exitFullscreen()
              console.log('[学生课堂] 已退出全屏模式')
            }
          } catch (err) {
            console.error('[学生课堂] 退出全屏失败:', err)
          }
        }
      }

      // 处理 COURSEWARE_SEND 消息 - 老师发送课件
      if (message.type === 'COURSEWARE_SEND') {
        console.log('[学生课堂] 收到课件:', message)
        const coursewareList = message.coursewareList || []
        if (Array.isArray(coursewareList) && coursewareList.length > 0) {
          // 添加到已收到的课件列表（去重）
          coursewareList.forEach((item: any) => {
            const exists = receivedCoursewareList.value.some(c => c.resourceId === item.resourceId)
            if (!exists) {
              receivedCoursewareList.value.push({
                resourceId: String(item.resourceId),
                fileName: item.fileName || '未知文件',
                resourceUrl: item.resourceUrl || ''
              })
            }
          })
          console.log('[学生课堂] 课件列表已更新:', receivedCoursewareList.value)
          
          // 自动打开弹窗并选中第一个资源
          showResourceModal.value = true
          if (selectedResourceIndex.value < 0 && receivedCoursewareList.value.length > 0) {
            selectedResourceIndex.value = 0
            previewLoading.value = true
          }
        }
      }

      // 处理 COURSEWARE_REVOKE 消息 - 老师撤回课件
      if (message.type === 'COURSEWARE_REVOKE') {
        console.log('[学生课堂] 老师撤回课件:', message)
        const revokeList = message.coursewareList || []
        
        if (Array.isArray(revokeList) && revokeList.length > 0) {
          // 根据 resourceId 删除对应的课件
          const revokeIds = revokeList.map((item: any) => String(item.resourceId))
          receivedCoursewareList.value = receivedCoursewareList.value.filter(
            c => !revokeIds.includes(c.resourceId)
          )
          
          // 如果当前选中的资源被撤回了，重置选择
          if (selectedResourceIndex.value >= receivedCoursewareList.value.length) {
            selectedResourceIndex.value = receivedCoursewareList.value.length > 0 ? 0 : -1
            if (selectedResourceIndex.value >= 0) {
              previewLoading.value = true
            }
          }
          
          // 如果课件全部被撤回，关闭弹窗
          if (receivedCoursewareList.value.length === 0) {
            showResourceModal.value = false
            selectedResourceIndex.value = -1
            previewLoading.value = false
          }
        } else {
          // 没有指定具体课件，全部撤回
          receivedCoursewareList.value = []
          selectedResourceIndex.value = -1
          previewLoading.value = false
          showResourceModal.value = false
        }
        
        console.log('[学生课堂] 撤回后课件列表:', receivedCoursewareList.value)
      }

      // 处理 KICKOUT 消息 - 被老师踢出课堂
      if (message.type === 'KICKOUT') {
        console.log('[学生课堂] 被老师踢出课堂!')
        // 清理资源
        if (classTimer) {
          clearInterval(classTimer)
          classTimer = null
        }
        peerJS.destroy()
        // 显示踢出弹窗
        showKickoutModal.value = true
      }
    } catch (e) {
      console.log('[学生课堂] 非 JSON 消息:', event.data)
    }
  }

  notifyWs.onclose = () => {
    console.log('[学生课堂] 通知 WebSocket 已断开')
    wsConnected.value = false
    
    // 自动重连（3秒后），但如果组件已卸载则不重连
    setTimeout(() => {
      if (!wsConnected.value && !isUnmounted) {
        console.log('[学生课堂] 尝试重新连接 WebSocket...')
        connectNotifyWebSocket()
      }
    }, 3000)
  }

  notifyWs.onerror = (error) => {
    console.error('[学生课堂] 通知 WebSocket 错误:', error)
  }
}

// 举手
const handleRaiseHand = () => {
  alert('已举手，等待老师回应')
}

// 全屏
const toggleFullscreen = async () => {
  const screenArea = document.querySelector('.screen-area')
  if (!screenArea) return

  if (!document.fullscreenElement) {
    await screenArea.requestFullscreen()
  } else {
    await document.exitFullscreen()
  }
}

// 返回
const handleBack = () => {
  if (classStarted.value) {
    saveOngoingClassroom()
    setPauseAutoEnterClassroom(true)
  } else {
    clearOngoingClassroom()
    setPauseAutoEnterClassroom(false)
  }
  if (notifyWs) {
    notifyWs.close()
    notifyWs = null
  }
  peerJS.destroy()
  navigateTo('/student')
}

// 下课确认
const handleClassEndConfirm = () => {
  showClassEndModal.value = false
  clearOngoingClassroom()
  setPauseAutoEnterClassroom(false)
  stopClassTimer(true)
  if (notifyWs) {
    notifyWs.close()
    notifyWs = null
  }
  peerJS.destroy()
  navigateTo('/student')
}

// 被踢出确认
const handleKickoutConfirm = () => {
  showKickoutModal.value = false
  clearOngoingClassroom()
  setPauseAutoEnterClassroom(false)
  stopClassTimer(true)
  if (notifyWs) {
    notifyWs.close()
    notifyWs = null
  }
  peerJS.destroy()
  // 清除 token
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  navigateTo('/')
}

// 全屏确认
const handleFullscreenConfirm = async () => {
  showFullscreenModal.value = false
  try {
    await document.documentElement.requestFullscreen()
    console.log('[学生课堂] 已进入全屏模式')
  } catch (err) {
    console.error('[学生课堂] 进入全屏失败:', err)
  }
}

onMounted(async () => {
  console.log('========================================')
  console.log('[学生课堂] 页面加载!')
  console.log('[学生课堂] PeerJS 服务器: localhost:9000')
  console.log('[学生课堂] classId:', currentClassId.value)
  console.log('[学生课堂] teacherPeerId:', currentTeacherPeerId.value)
  console.log('========================================')

  // 先连接通知 WebSocket
  connectNotifyWebSocket()
  // 已在课堂内，恢复自动进课堂能力
  setPauseAutoEnterClassroom(false)

  // 如果有 classId，初始化 PeerJS 并开始计时
  if (currentClassId.value) {
    const success = await initializePeerJS(currentClassId.value)
    if (success) {
      classStarted.value = true
      saveOngoingClassroom()
      // 开始计时（若之前返回过首页，会沿用已有起始时间）
      startClassTimer(currentClassId.value)
      
      // 如果有老师的 PeerId，延迟2秒后尝试连接老师请求屏幕分享
      if (currentTeacherPeerId.value) {
        setTimeout(async () => {
          console.log('[学生课堂] 尝试连接老师请求屏幕分享:', currentTeacherPeerId.value)
          await connectToTeacherWithRetry(currentTeacherPeerId.value)
        }, 2000)
      }
    }
  }
})

onUnmounted(() => {
  isUnmounted = true
  if (notifyWs) {
    notifyWs.close()
    notifyWs = null
  }
  stopClassTimer(false)
  peerJS.destroy()
})
</script>

<style scoped>
.student-classroom {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f0f4f0;
}

.classroom-header {
  height: 44px;
  background: #4CD964;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  position: relative;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 14px;
}

.student-name {
  font-weight: 500;
}

.class-name {
  opacity: 0.9;
}

.divider {
  opacity: 0.6;
}

.class-time {
  font-family: monospace;
}

.header-back-btn {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.header-back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.classroom-body {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.screen-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f0;
  overflow: hidden;
  position: relative;
}

/* 等待屏幕 */
.waiting-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 提示条 */
.notice-bar {
  position: absolute;
  top: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #FFF8E6;
  border: 1px solid #FFE4B3;
  border-radius: 24px;
  color: #FF9900;
  font-size: 14px;
}

/* 装饰背景 */
.decoration-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
}

.blob-1 {
  width: 200px;
  height: 200px;
  background: #FFE4B3;
  top: 10%;
  left: 10%;
}

.blob-2 {
  width: 150px;
  height: 150px;
  background: #B3E5FC;
  top: 20%;
  right: 15%;
}

.blob-3 {
  width: 180px;
  height: 180px;
  background: #FFCDD2;
  bottom: 20%;
  left: 20%;
}

.blob-4 {
  width: 120px;
  height: 120px;
  background: #C8E6C9;
  bottom: 15%;
  right: 25%;
}

.confetti {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  opacity: 0.7;
}

.confetti-1 {
  background: #FF6B6B;
  top: 15%;
  left: 25%;
  transform: rotate(45deg);
}

.confetti-2 {
  background: #4ECDC4;
  top: 30%;
  right: 20%;
  transform: rotate(-30deg);
}

.confetti-3 {
  background: #FFE66D;
  bottom: 35%;
  left: 15%;
  transform: rotate(15deg);
}

.confetti-4 {
  background: #95E1D3;
  bottom: 25%;
  right: 30%;
  transform: rotate(-45deg);
}

.confetti-5 {
  background: #DDA0DD;
  top: 45%;
  left: 40%;
  transform: rotate(60deg);
}

/* 中心文字 */
.center-text {
  position: relative;
  z-index: 1;
  text-align: center;
}

.main-text {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.sub-text {
  font-size: 16px;
  color: #666;
}

/* 远程视频 */
.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

/* 课堂任务按钮 */
.left-bottom-btns {
  position: absolute;
  left: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;
}

.resource-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #4CD964;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.resource-btn:hover {
  background: #3CB853;
}

.resource-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background: #FF6B6B;
  border-radius: 9px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.task-btn {
  padding: 10px 20px;
  background: #FF6B6B;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.task-btn:hover {
  background: #FF5252;
}

/* 下课弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 320px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
}

.modal-icon {
  margin-bottom: 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.modal-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-btn {
  width: 100%;
  height: 44px;
  background: #4CD964;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-btn:hover {
  background: #3CB853;
}

.modal-btn-blue {
  background: #3EAEFF;
}

.modal-btn-blue:hover {
  background: #2196F3;
}

.modal-btn-red {
  background: #FF6B6B;
}

.modal-btn-red:hover {
  background: #FF5252;
}

/* 弹窗动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 课程资源弹窗样式 */
.resource-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.resource-modal-container {
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.resource-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E5E5;
  background: #FAFAFA;
}

.resource-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.resource-close-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.resource-close-btn:hover {
  background: #F0F0F0;
  color: #666;
}

.resource-modal-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧资源列表 */
.resource-list-panel {
  width: 240px;
  border-right: 1px solid #E5E5E5;
  display: flex;
  flex-direction: column;
  background: #FAFAFA;
}

.resource-list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #E5E5E5;
}

.resource-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.resource-item:hover {
  background: #E8F5E9;
}

.resource-item.is-selected {
  background: #4CD964;
  color: #fff;
}

.resource-item.is-selected .resource-name {
  color: #fff;
}

.resource-icon {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
}

.icon-ppt {
  background: #D04423;
}

.icon-word {
  background: #2B579A;
}

.icon-pdf {
  background: #F40F02;
}

.icon-image {
  background: #4CAF50;
}

.icon-file {
  background: #9E9E9E;
}

.resource-name {
  flex: 1;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

/* 右侧预览区域 */
.resource-preview-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  overflow: hidden;
  position: relative;
}

.preview-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-iframe.hidden {
  opacity: 0;
  position: absolute;
}

.preview-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E0E0E0;
  border-top-color: #4CD964;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #999;
  font-size: 14px;
}
</style>
