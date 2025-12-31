/**
 * WebRTC 管理服务
 * 用于教师端推送屏幕流、学生端接收屏幕流
 */
import { ref, onUnmounted } from 'vue'
// 使用原生 WebSocket 信令（通过 URL 参数传递 token）
import { useSignaling, type SignalingMessage } from './useSignaling'

// 公共 STUN/TURN 服务器配置
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  // 如需更稳定的 NAT 穿透，可以添加 TURN 服务器
  // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
]

export interface WebRTCOptions {
  signalingUrl: string
  roomId: string
  userId: string
  role: 'teacher' | 'student'
  onRemoteStream?: (stream: MediaStream, peerId: string) => void
  onPeerConnected?: (peerId: string) => void
  onPeerDisconnected?: (peerId: string) => void
  onError?: (error: Error) => void
}

export function useWebRTC() {
  const signaling = useSignaling()
  const localStream = ref<MediaStream | null>(null)
  const remoteStreams = ref<Map<string, MediaStream>>(new Map())
  const peerConnections = ref<Map<string, RTCPeerConnection>>(new Map())
  const isScreenSharing = ref(false)
  const connectedPeers = ref<Set<string>>(new Set())

  let options: WebRTCOptions | null = null
  let pendingCandidates: Map<string, RTCIceCandidate[]> = new Map()

  // 初始化 WebRTC
  const initialize = (opts: WebRTCOptions) => {
    options = opts

    // 连接信令服务器
    signaling.connect({
      url: opts.signalingUrl,
      roomId: opts.roomId,
      userId: opts.userId,
      role: opts.role,
      onMessage: handleSignalingMessage,
      onConnected: () => {
        console.log('[WebRTC] 信令服务器连接成功')
      },
      onDisconnected: () => {
        console.log('[WebRTC] 信令服务器断开')
      },
      onError: (error) => {
        console.error('[WebRTC] 信令错误:', error)
        opts.onError?.(new Error('信令服务器连接失败'))
      }
    })
  }

  // 处理信令消息
  const handleSignalingMessage = async (message: SignalingMessage) => {
    console.log('[WebRTC] 处理消息:', message.type, '| 我是:', options?.role, '| 消息详情:', message)
    
    switch (message.type) {
      case 'user-joined':
        console.log('[WebRTC] 用户加入:', message.userId, '角色:', message.role)
        // 如果是教师端且正在分享屏幕，向新加入的学生发送 offer
        if (options?.role === 'teacher' && isScreenSharing.value) {
          console.log('[WebRTC] 教师端检测到用户加入，准备发送 offer')
          await createOfferForPeer(message.userId!)
        }
        break

      case 'user-left':
        console.log('[WebRTC] 用户离开:', message.userId)
        closePeerConnection(message.userId!)
        break

      case 'screen-share-start':
        console.log('[WebRTC] 收到屏幕分享开始通知，来自:', message.userId)
        // 学生端收到通知，发送 request-offer 让教师发送 offer
        if (options?.role === 'student' && message.userId) {
          console.log('[WebRTC] 学生端请求教师发送 offer')
          signaling.send({
            type: 'request-offer',
            roomId: options.roomId,
            userId: options.userId,
            role: 'student',
            data: { targetUserId: message.userId }
          })
        }
        break

      case 'request-offer':
        // 教师端收到学生请求，发送 offer
        console.log('[WebRTC] 收到学生请求 offer:', message.userId)
        if (options?.role === 'teacher' && isScreenSharing.value && message.userId) {
          await createOfferForPeer(message.userId)
        }
        break

      case 'screen-share-stop':
        console.log('[WebRTC] 教师停止屏幕分享')
        // 清理远程流
        if (message.userId) {
          remoteStreams.value.delete(message.userId)
          closePeerConnection(message.userId)
        }
        break

      case 'offer':
        console.log('[WebRTC] 收到 offer!')
        await handleOffer(message)
        break

      case 'answer':
        console.log('[WebRTC] 收到 answer!')
        await handleAnswer(message)
        break

      case 'ice-candidate':
        console.log('[WebRTC] 收到 ice-candidate')
        await handleIceCandidate(message)
        break
        
      default:
        console.log('[WebRTC] 未处理的消息类型:', message.type)
    }
  }

  // 创建 PeerConnection
  const createPeerConnection = (peerId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      iceCandidatePoolSize: 10
    })

    // ICE 候选事件
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signaling.sendIceCandidate(event.candidate, peerId)
      }
    }

    // ICE 连接状态变化
    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE 连接状态 (${peerId}):`, pc.iceConnectionState)
      
      if (pc.iceConnectionState === 'connected') {
        connectedPeers.value.add(peerId)
        options?.onPeerConnected?.(peerId)
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        connectedPeers.value.delete(peerId)
        options?.onPeerDisconnected?.(peerId)
      }
    }

    // 收到远程流（学生端）
    pc.ontrack = (event) => {
      console.log('[WebRTC] 收到远程轨道:', event.streams)
      if (event.streams && event.streams[0]) {
        remoteStreams.value.set(peerId, event.streams[0])
        options?.onRemoteStream?.(event.streams[0], peerId)
      }
    }

    peerConnections.value.set(peerId, pc)
    return pc
  }

  // 获取或创建 PeerConnection
  const getOrCreatePeerConnection = (peerId: string): RTCPeerConnection => {
    let pc = peerConnections.value.get(peerId)
    if (!pc) {
      pc = createPeerConnection(peerId)
    }
    return pc
  }

  // 教师端：开始屏幕分享
  const startScreenShare = async (): Promise<boolean> => {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      console.error('[WebRTC] 不在浏览器环境中')
      options?.onError?.(new Error('屏幕分享仅支持浏览器环境'))
      return false
    }

    // 检查浏览器是否支持 getDisplayMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      console.error('[WebRTC] 浏览器不支持屏幕分享，请确保使用 HTTPS 或 localhost')
      options?.onError?.(new Error('浏览器不支持屏幕分享，请使用 HTTPS 访问'))
      alert('屏幕分享需要 HTTPS 环境，请使用 https:// 或 localhost 访问')
      return false
    }

    try {
      // 获取屏幕流
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always'
        },
        audio: false
      })

      localStream.value = stream
      isScreenSharing.value = true

      // 监听用户停止分享
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare()
      }

      // 通知所有学生开始屏幕分享
      signaling.notifyScreenShareStart()

      console.log('[WebRTC] 屏幕分享已开始')
      return true
    } catch (error: any) {
      console.error('[WebRTC] 获取屏幕流失败:', error)
      if (error.name !== 'NotAllowedError') {
        options?.onError?.(new Error('屏幕分享启动失败'))
      }
      return false
    }
  }

  // 教师端：向指定学生发送 Offer
  const createOfferForPeer = async (peerId: string) => {
    if (!localStream.value) {
      console.warn('[WebRTC] 没有本地流，无法创建 offer')
      return
    }

    const pc = getOrCreatePeerConnection(peerId)

    // 添加本地轨道
    localStream.value.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.value!)
    })

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      signaling.sendOffer(offer, peerId)
      console.log('[WebRTC] 已发送 offer 给:', peerId)
    } catch (error) {
      console.error('[WebRTC] 创建 offer 失败:', error)
    }
  }

  // 学生端：处理收到的 Offer
  const handleOffer = async (message: SignalingMessage) => {
    const senderId = message.userId!
    const { sdp } = message.data

    console.log('[WebRTC] 收到 offer 来自:', senderId)

    const pc = getOrCreatePeerConnection(senderId)

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))

      // 处理之前缓存的 ICE 候选
      const candidates = pendingCandidates.get(senderId) || []
      for (const candidate of candidates) {
        await pc.addIceCandidate(candidate)
      }
      pendingCandidates.delete(senderId)

      // 创建 answer
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      signaling.sendAnswer(answer, senderId)
      console.log('[WebRTC] 已发送 answer 给:', senderId)
    } catch (error) {
      console.error('[WebRTC] 处理 offer 失败:', error)
    }
  }

  // 教师端：处理收到的 Answer
  const handleAnswer = async (message: SignalingMessage) => {
    const senderId = message.userId!
    const { sdp } = message.data

    console.log('[WebRTC] 收到 answer 来自:', senderId)

    const pc = peerConnections.value.get(senderId)
    if (!pc) {
      console.warn('[WebRTC] 找不到对应的 PeerConnection')
      return
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))

      // 处理之前缓存的 ICE 候选
      const candidates = pendingCandidates.get(senderId) || []
      for (const candidate of candidates) {
        await pc.addIceCandidate(candidate)
      }
      pendingCandidates.delete(senderId)
    } catch (error) {
      console.error('[WebRTC] 处理 answer 失败:', error)
    }
  }

  // 处理 ICE 候选
  const handleIceCandidate = async (message: SignalingMessage) => {
    const senderId = message.userId!
    const { candidate } = message.data

    const pc = peerConnections.value.get(senderId)
    
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        console.error('[WebRTC] 添加 ICE 候选失败:', error)
      }
    } else {
      // 如果还没有设置远程描述，先缓存候选
      if (!pendingCandidates.has(senderId)) {
        pendingCandidates.set(senderId, [])
      }
      pendingCandidates.get(senderId)!.push(new RTCIceCandidate(candidate))
    }
  }

  // 停止屏幕分享
  const stopScreenShare = () => {
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => track.stop())
      localStream.value = null
    }

    isScreenSharing.value = false
    signaling.notifyScreenShareStop()

    // 关闭所有 PeerConnection
    peerConnections.value.forEach((pc, peerId) => {
      pc.close()
    })
    peerConnections.value.clear()
    connectedPeers.value.clear()

    console.log('[WebRTC] 屏幕分享已停止')
  }

  // 关闭指定的 PeerConnection
  const closePeerConnection = (peerId: string) => {
    const pc = peerConnections.value.get(peerId)
    if (pc) {
      pc.close()
      peerConnections.value.delete(peerId)
    }
    remoteStreams.value.delete(peerId)
    connectedPeers.value.delete(peerId)
  }

  // 销毁
  const destroy = () => {
    stopScreenShare()
    signaling.disconnect()
    remoteStreams.value.clear()
    pendingCandidates.clear()
  }

  // 组件卸载时自动销毁
  onUnmounted(() => {
    destroy()
  })

  return {
    // 状态
    localStream,
    remoteStreams,
    isScreenSharing,
    connectedPeers,
    isSignalingConnected: signaling.isConnected,

    // 方法
    initialize,
    startScreenShare,
    stopScreenShare,
    destroy
  }
}

