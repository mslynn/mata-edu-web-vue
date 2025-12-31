<template>
  <div class="screen-share-viewer">
    <!-- 连接状态提示 -->
    <div v-if="!isConnected" class="connection-status connecting">
      <div class="status-icon">
        <svg class="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
        </svg>
      </div>
      <p>正在连接教师端...</p>
    </div>

    <!-- 等待屏幕分享 -->
    <div v-else-if="isConnected && !hasRemoteStream" class="connection-status waiting">
      <div class="status-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
      <p>已连接，等待教师分享屏幕...</p>
    </div>

    <!-- 屏幕分享视频 -->
    <div v-else class="video-container">
      <video 
        ref="videoRef" 
        autoplay 
        playsinline
        :class="{ 'fullscreen': isFullscreen }"
      />
      <div class="video-controls">
        <button class="control-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
          <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useWebRTC } from '~/composables/useWebRTC'

const props = defineProps<{
  roomId: string
  userId: string
  signalingUrl?: string
}>()

const emit = defineEmits<{
  connected: []
  disconnected: []
  streamReceived: [stream: MediaStream]
  error: [error: Error]
}>()

const config = useRuntimeConfig()
const webRTC = useWebRTC()
const videoRef = ref<HTMLVideoElement | null>(null)
const isFullscreen = ref(false)

const isConnected = computed(() => webRTC.isSignalingConnected.value)
const hasRemoteStream = computed(() => webRTC.remoteStreams.value.size > 0)

// 监听远程流变化
watch(
  () => webRTC.remoteStreams.value,
  (streams) => {
    if (streams.size > 0 && videoRef.value) {
      // 获取第一个远程流（教师的屏幕分享）
      const stream = streams.values().next().value
      if (stream) {
        videoRef.value.srcObject = stream
        emit('streamReceived', stream)
      }
    }
  },
  { deep: true }
)

const toggleFullscreen = async () => {
  const container = videoRef.value?.parentElement
  if (!container) return

  if (!document.fullscreenElement) {
    try {
      await container.requestFullscreen()
      isFullscreen.value = true
    } catch (err) {
      console.error('无法进入全屏:', err)
    }
  } else {
    await document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  // 初始化 WebRTC（学生端）
  const signalingUrl = props.signalingUrl || (config.public.signalingUrl as string) || 'ws://192.168.0.17:8001/resource/websocket'

  webRTC.initialize({
    signalingUrl,
    roomId: props.roomId,
    userId: props.userId,
    role: 'student',
    onRemoteStream: (stream, peerId) => {
      console.log('收到教师屏幕分享:', peerId)
      if (videoRef.value) {
        videoRef.value.srcObject = stream
      }
      emit('streamReceived', stream)
    },
    onPeerConnected: () => {
      emit('connected')
    },
    onPeerDisconnected: () => {
      emit('disconnected')
      if (videoRef.value) {
        videoRef.value.srcObject = null
      }
    },
    onError: (error) => {
      emit('error', error)
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  webRTC.destroy()
})
</script>

<style scoped>
.screen-share-viewer {
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
}

.connection-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #999;
}

.connection-status.connecting .status-icon {
  color: #3EAEFF;
}

.connection-status p {
  font-size: 14px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-container video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  background: #000;
}

.video-container video.fullscreen {
  width: 100%;
  height: 100%;
}

.video-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-container:hover .video-controls {
  opacity: 1;
}

.control-btn {
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}
</style>

