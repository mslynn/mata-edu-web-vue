/**
 * WebSocket 信令服务
 * 用于 WebRTC 连接的信令交换（SDP、ICE 候选等）
 */
import { ref, onUnmounted } from 'vue'

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'screen-share-start' | 'screen-share-stop' | 'user-joined' | 'user-left' | 'request-offer' | 'CLASS_BEGIN' | 'CLASS_END' | 'STUDENT_JOIN'
  roomId?: string
  userId?: string
  role?: 'teacher' | 'student'
  data?: any
}

export interface SignalingOptions {
  url: string
  roomId: string
  userId: string
  role: 'teacher' | 'student'
  onMessage?: (message: SignalingMessage) => void
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Event) => void
}

export function useSignaling() {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const roomId = ref('')
  const userId = ref('')
  const role = ref<'teacher' | 'student'>('student')
  
  let messageHandler: ((message: SignalingMessage) => void) | null = null
  let connectedHandler: (() => void) | null = null
  let disconnectedHandler: (() => void) | null = null
  let errorHandler: ((error: Event) => void) | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5

  // 连接到信令服务器
  const connect = (options: SignalingOptions) => {
    const { url, roomId: room, userId: user, role: userRole, onMessage, onConnected, onDisconnected, onError } = options
    
    roomId.value = room
    userId.value = user
    role.value = userRole
    messageHandler = onMessage || null
    connectedHandler = onConnected || null
    disconnectedHandler = onDisconnected || null
    errorHandler = onError || null

    try {
      // 从 localStorage 获取 token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      console.log('[Signaling] 获取到的 token:', token ? `${token.substring(0, 20)}...` : 'null')
      
      // 构建带 token 的 WebSocket URL（参数名: Authorization，需要 Bearer 前缀）
      let wsUrl = url
      if (token) {
        const separator = url.includes('?') ? '&' : '?'
        const authToken = `Bearer ${token}`
        wsUrl = `${url}${separator}Authorization=${encodeURIComponent(authToken)}`
      } else {
        console.warn('[Signaling] 未找到 token，请先登录')
      }
      
      console.log('[Signaling] 完整连接地址:', wsUrl)
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('[Signaling] 连接成功')
        isConnected.value = true
        reconnectAttempts = 0
        
        // 加入房间
        send({
          type: 'join-room',
          roomId: room,
          userId: user,
          role: userRole
        })

        connectedHandler?.()
      }

      ws.value.onmessage = (event) => {
        try {
          // 打印原始消息，方便调试后端格式
          console.log('[Signaling] 收到原始消息:', event.data)
          
          let message: SignalingMessage
          
          // 尝试解析 JSON
          if (event.data.startsWith('{')) {
            message = JSON.parse(event.data)
          } else {
            // 纯字符串消息（如 CLASS_BEGIN、CLASS_END）
            message = {
              type: event.data as any,
              data: event.data
            }
            console.log('[Signaling] 收到字符串命令:', event.data)
          }
          
          console.log('[Signaling] 解析后消息:', message.type, message)
          messageHandler?.(message)
        } catch (error) {
          console.error('[Signaling] 处理消息失败:', error, '原始数据:', event.data)
        }
      }

      ws.value.onclose = (event) => {
        console.log('[Signaling] 连接关闭', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        // 常见关闭码说明
        const codeMessages: Record<number, string> = {
          1000: '正常关闭',
          1001: '端点离开',
          1002: '协议错误',
          1003: '数据类型错误',
          1006: '异常关闭（可能是服务器未响应或网络问题）',
          1007: '数据格式错误',
          1008: '策略违规',
          1009: '消息太大',
          1010: '客户端期望扩展',
          1011: '服务器内部错误',
          1015: 'TLS握手失败'
        }
        console.log('[Signaling] 关闭原因:', codeMessages[event.code] || '未知')
        isConnected.value = false
        disconnectedHandler?.()
        
        // 暂时禁用自动重连，方便调试
        // if (reconnectAttempts < maxReconnectAttempts) {
        //   reconnectAttempts++
        //   console.log(`[Signaling] 尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})...`)
        //   reconnectTimer = setTimeout(() => {
        //     connect(options)
        //   }, 2000 * reconnectAttempts)
        // }
      }

      ws.value.onerror = (error) => {
        console.error('[Signaling] 连接错误:', error)
        console.error('[Signaling] 请检查：')
        console.error('  1. 后端 WebSocket 服务是否启动')
        console.error('  2. 地址是否正确: ws://192.168.0.55:8001/resource/websocket')
        console.error('  3. 是否有跨域限制')
        console.error('  4. token 格式是否正确')
        errorHandler?.(error)
      }
    } catch (error) {
      console.error('[Signaling] 创建连接失败:', error)
    }
  }

  // 发送消息
  const send = (message: SignalingMessage) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message))
      console.log('[Signaling] 发送消息:', message.type)
    } else {
      console.warn('[Signaling] 连接未就绪，无法发送消息')
    }
  }

  // 发送 SDP Offer
  const sendOffer = (offer: RTCSessionDescriptionInit, targetUserId?: string) => {
    send({
      type: 'offer',
      roomId: roomId.value,
      userId: userId.value,
      data: {
        sdp: offer,
        targetUserId
      }
    })
  }

  // 发送 SDP Answer
  const sendAnswer = (answer: RTCSessionDescriptionInit, targetUserId: string) => {
    send({
      type: 'answer',
      roomId: roomId.value,
      userId: userId.value,
      data: {
        sdp: answer,
        targetUserId
      }
    })
  }

  // 发送 ICE 候选
  const sendIceCandidate = (candidate: RTCIceCandidate, targetUserId?: string) => {
    send({
      type: 'ice-candidate',
      roomId: roomId.value,
      userId: userId.value,
      data: {
        candidate,
        targetUserId
      }
    })
  }

  // 通知开始屏幕分享
  const notifyScreenShareStart = () => {
    send({
      type: 'screen-share-start',
      roomId: roomId.value,
      userId: userId.value,
      role: role.value
    })
  }

  // 通知停止屏幕分享
  const notifyScreenShareStop = () => {
    send({
      type: 'screen-share-stop',
      roomId: roomId.value,
      userId: userId.value,
      role: role.value
    })
  }

  // 离开房间
  const leaveRoom = () => {
    send({
      type: 'leave-room',
      roomId: roomId.value,
      userId: userId.value,
      role: role.value
    })
  }

  // 断开连接
  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    if (ws.value) {
      leaveRoom()
      ws.value.close()
      ws.value = null
    }
    
    isConnected.value = false
  }

  // 组件卸载时自动断开
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    roomId,
    userId,
    role,
    connect,
    send,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    notifyScreenShareStart,
    notifyScreenShareStop,
    leaveRoom,
    disconnect
  }
}

