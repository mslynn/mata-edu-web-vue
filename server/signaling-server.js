/**
 * WebRTC 信令服务器
 * 用于教师端和学生端之间的 WebRTC 信令交换
 * 
 * 启动方式: node server/signaling-server.js
 * 默认端口: 3002
 */

const WebSocket = require('ws')

const PORT = process.env.SIGNALING_PORT || 3002

// 存储房间和用户
const rooms = new Map() // roomId -> Map<userId, { ws, role }>

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`[信令服务器] 已启动，监听端口 ${PORT}`)
})

wss.on('connection', (ws) => {
  let currentRoomId = null
  let currentUserId = null
  let currentRole = null

  console.log('[信令服务器] 新连接')

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log('[信令服务器] 收到消息:', message.type, '来自:', message.userId)

      switch (message.type) {
        case 'join-room':
          handleJoinRoom(ws, message)
          currentRoomId = message.roomId
          currentUserId = message.userId
          currentRole = message.role
          break

        case 'leave-room':
          handleLeaveRoom(message)
          break

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // 转发 WebRTC 信令给目标用户
          forwardMessage(message)
          break

        case 'screen-share-start':
        case 'screen-share-stop':
          // 广播屏幕分享状态给房间内所有用户
          broadcastToRoom(message.roomId, message, message.userId)
          break

        default:
          console.log('[信令服务器] 未知消息类型:', message.type)
      }
    } catch (error) {
      console.error('[信令服务器] 解析消息失败:', error)
    }
  })

  ws.on('close', () => {
    console.log('[信令服务器] 连接关闭:', currentUserId)
    if (currentRoomId && currentUserId) {
      handleLeaveRoom({
        roomId: currentRoomId,
        userId: currentUserId,
        role: currentRole
      })
    }
  })

  ws.on('error', (error) => {
    console.error('[信令服务器] WebSocket 错误:', error)
  })
})

// 处理加入房间
function handleJoinRoom(ws, message) {
  const { roomId, userId, role } = message

  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map())
  }

  const room = rooms.get(roomId)
  room.set(userId, { ws, role })

  console.log(`[信令服务器] 用户 ${userId} (${role}) 加入房间 ${roomId}，当前人数: ${room.size}`)

  // 通知房间内其他用户
  broadcastToRoom(roomId, {
    type: 'user-joined',
    roomId,
    userId,
    role
  }, userId)

  // 如果是学生加入，通知教师（教师可能正在分享屏幕）
  if (role === 'student') {
    room.forEach((user, id) => {
      if (user.role === 'teacher' && id !== userId) {
        sendToUser(roomId, id, {
          type: 'user-joined',
          roomId,
          userId,
          role: 'student'
        })
      }
    })
  }
}

// 处理离开房间
function handleLeaveRoom(message) {
  const { roomId, userId, role } = message

  if (!rooms.has(roomId)) return

  const room = rooms.get(roomId)
  room.delete(userId)

  console.log(`[信令服务器] 用户 ${userId} 离开房间 ${roomId}，剩余人数: ${room.size}`)

  // 通知房间内其他用户
  broadcastToRoom(roomId, {
    type: 'user-left',
    roomId,
    userId,
    role
  }, userId)

  // 如果房间为空，删除房间
  if (room.size === 0) {
    rooms.delete(roomId)
    console.log(`[信令服务器] 房间 ${roomId} 已清空并删除`)
  }
}

// 转发消息给目标用户
function forwardMessage(message) {
  const { roomId, data } = message
  const targetUserId = data?.targetUserId

  if (targetUserId) {
    // 发送给特定用户
    sendToUser(roomId, targetUserId, message)
  } else {
    // 广播给房间内所有其他用户
    broadcastToRoom(roomId, message, message.userId)
  }
}

// 发送消息给特定用户
function sendToUser(roomId, userId, message) {
  if (!rooms.has(roomId)) return

  const room = rooms.get(roomId)
  const user = room.get(userId)

  if (user && user.ws.readyState === WebSocket.OPEN) {
    user.ws.send(JSON.stringify(message))
    console.log(`[信令服务器] 发送消息给 ${userId}:`, message.type)
  }
}

// 广播消息给房间内所有用户（除了发送者）
function broadcastToRoom(roomId, message, excludeUserId) {
  if (!rooms.has(roomId)) return

  const room = rooms.get(roomId)
  room.forEach((user, id) => {
    if (id !== excludeUserId && user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify(message))
    }
  })
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n[信令服务器] 正在关闭...')
  wss.close(() => {
    console.log('[信令服务器] 已关闭')
    process.exit(0)
  })
})

