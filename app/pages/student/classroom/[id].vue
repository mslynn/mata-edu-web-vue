<template>
  <div class="student-classroom">
    <!-- 顶部导航栏 -->
    <header class="classroom-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <span class="class-info">
          <span class="class-name">{{ className || '课堂学习' }}</span>
        </span>
      </div>
      <div class="header-right">
        <div class="connection-status" :class="{ connected: isConnected }">
          <span class="status-dot"></span>
          <span>{{ isConnected ? '已连接' : '连接中...' }}</span>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="classroom-body">
      <!-- 屏幕分享接收区域 -->
      <div class="screen-area">
        <!-- 连接中 -->
        <div v-if="!isConnected" class="status-panel">
          <div class="loading-spinner"></div>
          <p>正在连接...</p>
        </div>

        <!-- 等待教师分享 -->
        <div v-else-if="!remoteStream" class="status-panel">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <p>已连接，等待教师分享屏幕...</p>
          <p class="hint">教师 PeerId: {{ teacherPeerId || '未知' }}</p>
        </div>

        <!-- 远程视频 -->
        <video 
          v-else
          ref="remoteVideoRef" 
          autoplay 
          playsinline
          class="remote-video"
        />
      </div>

      <!-- 右侧工具栏 -->
      <aside class="tool-sidebar">
        <div class="tool-section">
          <h3 class="section-title">课堂工具</h3>
          <div class="tool-list">
            <button class="tool-btn" @click="handleRaiseHand">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1"/>
                <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v6"/>
                <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/>
                <path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
              </svg>
              <span>举手</span>
            </button>
            <button class="tool-btn" @click="toggleFullscreen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              <span>全屏</span>
            </button>
          </div>
        </div>

        <!-- 连接信息 -->
        <div class="tool-section">
          <h3 class="section-title">连接信息</h3>
          <div class="info-item">
            <span class="label">我的ID:</span>
            <span class="value">{{ myPeerId || '...' }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { usePeerScreenShare } from '~/composables/usePeerScreenShare'

definePageMeta({ layout: 'blank' })

const route = useRoute()

// 课堂信息
const classroomId = computed(() => route.params.id as string)
const teacherPeerId = computed(() => route.query.teacherPeerId as string || '')
const className = ref('')

// PeerJS
const {
  myPeerId,
  isConnected,
  remoteStream,
  initialize,
  destroy
} = usePeerScreenShare()

const remoteVideoRef = ref<HTMLVideoElement | null>(null)

// 监听远程流，绑定到 video
watch(remoteStream, (stream) => {
  console.log('[学生课堂] remoteStream 变化:', stream)
  if (remoteVideoRef.value && stream) {
    remoteVideoRef.value.srcObject = stream
    console.log('[学生课堂] 视频流已绑定')
  }
})

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
  destroy()
  navigateTo('/student')
}

onMounted(async () => {
  console.log('========================================')
  console.log('[学生课堂] 页面加载!')
  console.log('[学生课堂] 课堂ID:', classroomId.value)
  console.log('[学生课堂] 教师PeerId:', teacherPeerId.value)
  console.log('========================================')

  // 初始化 PeerJS
  const studentId = `student_${Date.now()}`
  try {
    await initialize(studentId)
    console.log('[学生课堂] PeerJS 初始化成功，我的ID:', myPeerId.value)
    
    // 如果有教师 PeerId，可以显示在界面上
    // 教师会主动 call 学生，学生只需要等待
  } catch (err) {
    console.error('[学生课堂] PeerJS 初始化失败:', err)
  }
})

onUnmounted(() => {
  destroy()
})
</script>

<style scoped>
.student-classroom {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
}

.classroom-header {
  height: 50px;
  background: #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #333;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.class-info {
  color: #fff;
}

.class-name {
  font-size: 16px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #999;
  font-size: 12px;
}

.connection-status.connected {
  color: #4CAF50;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
}

.connection-status.connected .status-dot {
  background: #4CAF50;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.classroom-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.screen-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
}

.status-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
}

.status-panel p {
  font-size: 14px;
}

.status-panel .hint {
  font-size: 12px;
  color: #555;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #FF9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.remote-video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.tool-sidebar {
  width: 200px;
  background: #2a2a2a;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-left: 1px solid #333;
}

.tool-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 12px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  color: #ccc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #666;
}

.info-item .value {
  font-size: 12px;
  color: #999;
  word-break: break-all;
}
</style>
