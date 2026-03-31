/**
 * 基于 PeerJS 的屏幕分享
 * 使用 PeerJS 公共服务器 + 后端 WebSocket 通知
 */
import { ref, onUnmounted } from 'vue'

// 动态导入 PeerJS（避免 SSR 问题）
let Peer: any = null

export interface ClassStartMessage {
  type: 'CLASS_START'
  roomId: string
  teacherPeerId: string
  className?: string
}

export interface ClassEndMessage {
  type: 'CLASS_END'
  roomId: string
}

export function usePeerScreenShare() {
  const peer = ref<any>(null)
  const localStream = ref<MediaStream | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const isConnected = ref(false)
  const isScreenSharing = ref(false)
  const myPeerId = ref('')
  const connectedPeers = ref<Set<string>>(new Set())
  const connections = ref<Map<string, any>>(new Map())
  
  // 后端通知相关
  const currentRoomId = ref('')
  const teacherPeerId = ref('')

  // 初始化 Peer（教师或学生都调用）
  const initialize = async (userId: string): Promise<string> => {
    // 动态导入 PeerJS（仅在客户端）
    if (!Peer) {
      const peerjs = await import('peerjs')
      Peer = peerjs.default || peerjs.Peer || peerjs
    }
    
    return new Promise((resolve, reject) => {
      // 使用用户ID作为 Peer ID（确保唯一）
      const peerId = userId.replace(/[^a-zA-Z0-9]/g, '_')
      
      peer.value = new Peer(peerId, {
        debug: 2, // 调试级别
      })

      peer.value.on('open', (id) => {
        console.log('[PeerJS] 连接成功，我的 ID:', id)
        myPeerId.value = id
        isConnected.value = true
        resolve(id)
      })

      peer.value.on('error', (err) => {
        console.error('[PeerJS] 错误:', err)
        // 如果 ID 已被使用，尝试随机 ID
        if (err.type === 'unavailable-id') {
          console.log('[PeerJS] ID 已被使用，尝试随机 ID')
          peer.value = new Peer({
            debug: 2,
          })
          peer.value.on('open', (id) => {
            console.log('[PeerJS] 使用随机 ID 连接成功:', id)
            myPeerId.value = id
            isConnected.value = true
            resolve(id)
          })
        } else {
          reject(err)
        }
      })

      // 监听来电（学生端接收教师的屏幕分享）
      peer.value.on('call', (call) => {
        console.log('[PeerJS] 收到来电，来自:', call.peer)
        
        // 接听（不需要发送流，只接收）
        call.answer()
        
        call.on('stream', (stream) => {
          console.log('[PeerJS] 收到远程视频流！')
          remoteStream.value = stream
        })

        call.on('close', () => {
          console.log('[PeerJS] 通话结束')
          remoteStream.value = null
        })

        call.on('error', (err) => {
          console.error('[PeerJS] 通话错误:', err)
        })
      })

      peer.value.on('disconnected', () => {
        console.log('[PeerJS] 断开连接')
        isConnected.value = false
      })
    })
  }

  // 教师端：开始屏幕分享
  const startScreenShare = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      console.error('[PeerJS] 不在浏览器环境')
      return false
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      console.error('[PeerJS] 当前环境无法使用屏幕分享，请使用 HTTPS 或 localhost 访问', {
        origin: window.location.origin,
        isSecure: window.isSecureContext
      })
      alert('屏幕分享需要在 HTTPS 或 localhost 环境下使用')
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      })

      localStream.value = stream
      isScreenSharing.value = true

      // 监听用户停止分享
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      console.log('[PeerJS] 屏幕分享已开始')
      return true
    } catch (error: any) {
      console.error('[PeerJS] 获取屏幕流失败:', error)
      if (error.name !== 'NotAllowedError') {
        alert('屏幕分享启动失败')
      }
      return false
    }
  }

  // 教师端：呼叫学生（发送屏幕流）
  const callStudent = (studentPeerId: string): boolean => {
    if (!peer.value || !localStream.value) {
      console.error('[PeerJS] 未初始化或没有本地流')
      return false
    }

    console.log('[PeerJS] 呼叫学生:', studentPeerId)
    
    const call = peer.value.call(studentPeerId, localStream.value)
    
    call.on('stream', () => {
      console.log('[PeerJS] 学生已连接')
      connectedPeers.value.add(studentPeerId)
    })

    call.on('close', () => {
      console.log('[PeerJS] 学生断开:', studentPeerId)
      connectedPeers.value.delete(studentPeerId)
      connections.value.delete(studentPeerId)
    })

    call.on('error', (err) => {
      console.error('[PeerJS] 呼叫错误:', err)
    })

    connections.value.set(studentPeerId, call)
    return true
  }

  // 停止屏幕分享
  const stopScreenShare = () => {
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }

    // 关闭所有连接
    connections.value.forEach((call) => {
      call.close()
    })
    connections.value.clear()
    connectedPeers.value.clear()

    isScreenSharing.value = false
    console.log('[PeerJS] 屏幕分享已停止')
  }

  // ========== 后端集成方法 ==========

  /**
   * 学生端：处理后端推送的上课通知
   * 收到教师的 PeerId 后自动连接
   */
  const handleClassStart = (message: ClassStartMessage) => {
    console.log('[PeerJS] 收到上课通知:', message)
    teacherPeerId.value = message.teacherPeerId
    currentRoomId.value = message.roomId

    // 如果已经初始化 PeerJS，自动接收教师的屏幕分享
    // 学生端不需要主动做任何事，等待教师 call 即可
    console.log('[PeerJS] 等待教师发送屏幕分享...')
  }

  /**
   * 学生端：主动请求教师发送屏幕（可选）
   * 通过后端 WebSocket 发送请求给教师
   */
  const requestScreenShare = (sendToBackend: (msg: any) => void) => {
    if (!myPeerId.value) {
      console.error('[PeerJS] 请先初始化')
      return false
    }

    sendToBackend({
      type: 'REQUEST_SCREEN_SHARE',
      roomId: currentRoomId.value,
      studentPeerId: myPeerId.value
    })

    console.log('[PeerJS] 已请求教师发送屏幕')
    return true
  }

  /**
   * 教师端：处理学生请求，发送屏幕
   */
  const handleScreenShareRequest = (studentPeerId: string) => {
    console.log('[PeerJS] 收到学生请求:', studentPeerId)
    if (isScreenSharing.value) {
      callStudent(studentPeerId)
    }
  }

  /**
   * 教师端：广播上课通知给后端
   */
  const broadcastClassStart = (sendToBackend: (msg: any) => void, roomId: string, className?: string) => {
    if (!myPeerId.value) {
      console.error('[PeerJS] 请先初始化')
      return false
    }

    const message: ClassStartMessage = {
      type: 'CLASS_START',
      roomId,
      teacherPeerId: myPeerId.value,
      className
    }

    sendToBackend(message)
    console.log('[PeerJS] 已广播上课通知:', message)
    return true
  }

  /**
   * 教师端：广播下课通知给后端
   */
  const broadcastClassEnd = (sendToBackend: (msg: any) => void, roomId: string) => {
    const message: ClassEndMessage = {
      type: 'CLASS_END',
      roomId
    }

    sendToBackend(message)
    stopScreenShare()
    console.log('[PeerJS] 已广播下课通知')
  }

  // 销毁
  const destroy = () => {
    stopScreenShare()
    if (peer.value) {
      peer.value.destroy()
      peer.value = null
    }
    isConnected.value = false
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    // 状态
    myPeerId,
    isConnected,
    isScreenSharing,
    localStream,
    remoteStream,
    connectedPeers,
    teacherPeerId,
    currentRoomId,
    
    // 基础方法
    initialize,
    startScreenShare,
    callStudent,
    stopScreenShare,
    destroy,
    
    // 后端集成方法
    handleClassStart,        // 学生端：处理上课通知
    requestScreenShare,      // 学生端：请求屏幕分享
    handleScreenShareRequest, // 教师端：处理学生请求
    broadcastClassStart,     // 教师端：广播上课
    broadcastClassEnd        // 教师端：广播下课
  }
}

