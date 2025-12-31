/**
 * STOMP WebSocket 信令服务
 * 用于 Java/Spring 后端的 WebSocket 连接，支持自定义 Header
 */
import { ref, onUnmounted } from 'vue'
import { Client, type Message } from '@stomp/stompjs'

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join-room' | 'leave-room' | 'screen-share-start' | 'screen-share-stop' | 'user-joined' | 'user-left'
  roomId?: string
  userId?: string
  role?: 'teacher' | 'student'
  data?: any
}

export interface StompSignalingOptions {
  url: string
  roomId: string
  userId: string
  role: 'teacher' | 'student'
  onMessage?: (message: SignalingMessage) => void
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: string) => void
}

export function useStompSignaling() {
  const client = ref<Client | null>(null)
  const isConnected = ref(false)
  const roomId = ref('')
  const userId = ref('')
  const role = ref<'teacher' | 'student'>('student')
  
  let messageHandler: ((message: SignalingMessage) => void) | null = null
  let connectedHandler: (() => void) | null = null
  let disconnectedHandler: (() => void) | null = null
  let errorHandler: ((error: string) => void) | null = null
  let currentOptions: StompSignalingOptions | null = null

  // 连接到信令服务器
  const connect = (options: StompSignalingOptions) => {
    const { url, roomId: room, userId: user, role: userRole, onMessage, onConnected, onDisconnected, onError } = options
    
    currentOptions = options
    roomId.value = room
    userId.value = user
    role.value = userRole
    messageHandler = onMessage || null
    connectedHandler = onConnected || null
    disconnectedHandler = onDisconnected || null
    errorHandler = onError || null

    // 从 localStorage 获取 token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    console.log('[STOMP] 获取到的 token:', token ? `${token.substring(0, 20)}...` : 'null')

    if (!token) {
      console.warn('[STOMP] 未找到 token，请先登录')
    }

    // 创建 STOMP 客户端
    client.value = new Client({
      brokerURL: url,
      
      // 关键：通过 connectHeaders 传递 Authorization
      connectHeaders: {
        Authorization: token ? `Bearer ${token}` : '',
      },
      
      debug: (str) => {
        console.log('[STOMP Debug]', str)
      },
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('[STOMP] 连接成功！')
        isConnected.value = true
        
        // 订阅房间消息（根据后端的订阅路径调整）
        // 常见的订阅路径格式：
        // /topic/room/{roomId}
        // /user/queue/messages
        // /topic/classroom/{roomId}
        
        const subscriptionPath = `/topic/room/${room}`
        console.log('[STOMP] 订阅:', subscriptionPath)
        
        client.value?.subscribe(subscriptionPath, (message: Message) => {
          try {
            console.log('[STOMP] 收到原始消息:', message.body)
            const parsedMessage: SignalingMessage = JSON.parse(message.body)
            console.log('[STOMP] 解析后消息:', parsedMessage)
            messageHandler?.(parsedMessage)
          } catch (error) {
            console.error('[STOMP] 解析消息失败:', error)
          }
        })
        
        // 发送加入房间消息
        send({
          type: 'join-room',
          roomId: room,
          userId: user,
          role: userRole
        })
        
        connectedHandler?.()
      },

      onDisconnect: () => {
        console.log('[STOMP] 连接断开')
        isConnected.value = false
        disconnectedHandler?.()
      },

      onStompError: (frame) => {
        console.error('[STOMP] 错误:', frame.headers['message'])
        console.error('[STOMP] 详情:', frame.body)
        errorHandler?.(frame.headers['message'] || '连接错误')
      },

      onWebSocketError: (event) => {
        console.error('[STOMP] WebSocket 错误:', event)
        errorHandler?.('WebSocket 连接失败')
      },

      onWebSocketClose: (event) => {
        console.log('[STOMP] WebSocket 关闭:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
      }
    })

    console.log('[STOMP] 正在连接:', url)
    client.value.activate()
  }

  // 发送消息（根据后端的发送路径调整）
  const send = (message: SignalingMessage) => {
    if (client.value && client.value.connected) {
      // 常见的发送路径格式：
      // /app/room/{roomId}
      // /app/message
      // /app/classroom/signal
      
      const destination = `/app/room/${roomId.value}`
      console.log('[STOMP] 发送消息到:', destination, message)
      
      client.value.publish({
        destination,
        body: JSON.stringify(message)
      })
    } else {
      console.warn('[STOMP] 连接未就绪，无法发送消息')
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
    if (client.value) {
      leaveRoom()
      client.value.deactivate()
      client.value = null
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

