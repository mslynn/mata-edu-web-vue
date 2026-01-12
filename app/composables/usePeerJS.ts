/**
 * PeerJS 屏幕分享服务
 * 用于教师端推送屏幕流、学生端接收屏幕流
 */
import { ref, onUnmounted } from 'vue'
import Peer, { type MediaConnection, type DataConnection } from 'peerjs'

export interface PeerJSOptions {
  host?: string
  port?: number
  path?: string
  key?: string
  secure?: boolean
  authorization?: string
}

export function usePeerJS() {
  const peer = ref<Peer | null>(null)
  const myPeerId = ref('')
  const isConnected = ref(false)
  const localStream = ref<MediaStream | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const isScreenSharing = ref(false)
  const currentCall = ref<MediaConnection | null>(null)
  const connectedPeers = ref<Set<string>>(new Set())
  // 等待屏幕分享的学生列表
  const pendingStudents = ref<Set<string>>(new Set())
  // 保存所有活跃的呼叫连接
  const activeCalls = new Map<string, MediaConnection>()
  // 保存所有已知的学生（用于第二次分享时主动呼叫）
  const knownStudents = ref<Set<string>>(new Set())
  // 保存学生端的数据连接（用于重连）
  let teacherDataConnection: DataConnection | null = null

  // 初始化 PeerJS
  const initialize = async (peerId: string, options?: any): Promise<string> => {
    const defaultOptions = {
      host: 'peerjs.matatastudio.com',
      port: 443,
      path: '/peerjs',
      key: 'KDlNH3JzGu6Ybk9iVjGhHe8Xb4zsxOeqNW31pQY4dG6gfZcMvg9k0EQP4hCiOWu',
      secure: true,
      // ICE 服务器配置，改善 NAT 穿透
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    }

    return new Promise((resolve, reject) => {
      const opts = { ...defaultOptions, ...options }

      console.log('[PeerJS] 初始化, peerId:', peerId)

      peer.value = new Peer(peerId, {
        host: opts.host,
        port: opts.port,
        path: opts.path,
        key: opts.key,
        secure: opts.secure,
        config: opts.config,
        debug: 2
      } as any)

      peer.value.on('open', (id) => {
        console.log('[PeerJS] 连接成功, myPeerId:', id)
        myPeerId.value = id
        isConnected.value = true
        resolve(id)
      })

      peer.value.on('error', (err) => {
        console.error('[PeerJS] 错误:', err)
        isConnected.value = false
        reject(err)
      })

      peer.value.on('disconnected', () => {
        console.log('[PeerJS] 断开连接')
        isConnected.value = false
      })

      // 学生端：接收老师的呼叫
      peer.value.on('call', (call) => {
        console.log('[PeerJS] 收到呼叫，来自:', call.peer)

        // 如果有旧的呼叫，先关闭它
        if (currentCall.value && currentCall.value !== call) {
          console.log('[PeerJS] 关闭旧的呼叫')
          try {
            currentCall.value.close()
          } catch (e) {
            // 忽略关闭错误
          }
        }
        
        // 清除旧的远程流
        remoteStream.value = null
        currentCall.value = call

        // 应答呼叫（不发送流，只接收）
        call.answer()

        call.on('stream', (stream) => {
          console.log('[PeerJS] 收到远程流')
          remoteStream.value = stream
          connectedPeers.value.add(call.peer)
        })

        call.on('close', () => {
          console.log('[PeerJS] 呼叫关闭')
          remoteStream.value = null
          currentCall.value = null
          connectedPeers.value.delete(call.peer)
        })

        call.on('error', (err) => {
          console.error('[PeerJS] 呼叫错误:', err)
        })

        currentCall.value = call
      })

      // 老师端：接收学生的数据连接（学生请求屏幕分享）
      peer.value.on('connection', (conn) => {
        console.log('[PeerJS] 收到数据连接，来自:', conn.peer)

        conn.on('open', () => {
          console.log('[PeerJS] 数据连接已打开')
        })

        conn.on('data', (data: any) => {
          console.log('[PeerJS] 收到数据:', data)
          // 如果是学生请求屏幕分享
          if (data.type === 'REQUEST_SCREEN') {
            const studentPeerId = data.studentPeerId || conn.peer
            console.log('[PeerJS] 学生请求屏幕分享:', studentPeerId, '当前分享状态:', isScreenSharing.value, '活跃连接:', Array.from(activeCalls.keys()))

            // 记录已知学生
            knownStudents.value.add(studentPeerId)

            if (isScreenSharing.value && localStream.value) {
              // 如果已有活跃连接，先关闭它
              if (activeCalls.has(studentPeerId)) {
                console.log('[PeerJS] 关闭旧的活跃连接:', studentPeerId)
                const oldCall = activeCalls.get(studentPeerId)
                if (oldCall) {
                  try {
                    oldCall.close()
                  } catch (e) {
                    // 忽略
                  }
                }
                activeCalls.delete(studentPeerId)
              }
              // 老师正在分享，呼叫学生
              console.log('[PeerJS] 呼叫学生:', studentPeerId)
              callPeer(studentPeerId)
            } else {
              // 老师还没开始分享，先记录下来
              console.log('[PeerJS] 老师还没开始分享，将学生加入等待列表:', studentPeerId)
              pendingStudents.value.add(studentPeerId)
            }
          }
        })

        conn.on('close', () => {
          console.log('[PeerJS] 数据连接已关闭')
        })
      })
    })
  }

  // 老师端：开始屏幕分享
  const startScreenShare = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      console.error('[PeerJS] 不在浏览器环境中')
      return false
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      console.error('[PeerJS] 浏览器不支持屏幕分享')
      alert('屏幕分享需要 HTTPS 环境，请使用 https:// 或 localhost 访问')
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      localStream.value = stream
      isScreenSharing.value = true

      // 监听用户停止分享
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare()
        }
      }

      console.log('[PeerJS] 屏幕分享已开始')

      // 呼叫所有等待中的学生（这些是在分享开始前就发送了请求的学生）
      if (pendingStudents.value.size > 0) {
        console.log('[PeerJS] 呼叫等待中的学生:', Array.from(pendingStudents.value))
        for (const studentPeerId of pendingStudents.value) {
          try {
            await callPeer(studentPeerId)
            console.log('[PeerJS] 已呼叫学生:', studentPeerId)
          } catch (err) {
            console.error('[PeerJS] 呼叫学生失败:', studentPeerId, err)
          }
        }
        pendingStudents.value.clear()
      }

      // 注意：不主动呼叫 knownStudents，等学生收到 WebSocket 通知后主动请求连接
      // 这样可以避免学生刷新后 peerId 变化导致的问题

      return true
    } catch (error: any) {
      console.error('[PeerJS] 获取屏幕流失败:', error)
      return false
    }
  }

  // 老师端：呼叫学生（发送屏幕流）
  const callPeer = (remotePeerId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!peer.value || !localStream.value) {
        reject(new Error('PeerJS 未初始化或没有本地流'))
        return
      }

      console.log('[PeerJS] 呼叫学生:', remotePeerId)

      const call = peer.value.call(remotePeerId, localStream.value)

      call.on('stream', () => {
        console.log('[PeerJS] 收到对方流（学生端通常不发送）')
      })

      call.on('close', () => {
        console.log('[PeerJS] 呼叫关闭:', remotePeerId)
        connectedPeers.value.delete(remotePeerId)
        activeCalls.delete(remotePeerId)
      })

      call.on('error', (err) => {
        console.error('[PeerJS] 呼叫错误:', err)
        activeCalls.delete(remotePeerId)
        reject(err)
      })

      connectedPeers.value.add(remotePeerId)
      activeCalls.set(remotePeerId, call)
      currentCall.value = call
      resolve()
    })
  }

  // 学生端：连接老师并请求屏幕分享
  const connectToTeacher = (teacherPeerId: string, timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!peer.value) {
        reject(new Error('PeerJS 未初始化'))
        return
      }

      console.log('[PeerJS] 连接老师:', teacherPeerId)

      // 如果已有数据连接且仍然打开，先关闭它
      if (teacherDataConnection && teacherDataConnection.open) {
        console.log('[PeerJS] 关闭旧的数据连接')
        teacherDataConnection.close()
        teacherDataConnection = null
      }

      // 设置超时
      const timeoutId = setTimeout(() => {
        reject(new Error('连接超时'))
      }, timeout)

      const conn = peer.value.connect(teacherPeerId, { reliable: true })
      teacherDataConnection = conn

      conn.on('open', () => {
        clearTimeout(timeoutId)
        console.log('[PeerJS] 已连接到老师，发送屏幕分享请求')
        conn.send({ type: 'REQUEST_SCREEN', studentPeerId: myPeerId.value })
        resolve()
      })

      conn.on('error', (err) => {
        clearTimeout(timeoutId)
        teacherDataConnection = null
        // 不打印错误日志，静默处理
        reject(err)
      })

      conn.on('close', () => {
        console.log('[PeerJS] 与老师的数据连接已关闭')
        teacherDataConnection = null
      })
    })
  }

  // 停止屏幕分享
  const stopScreenShare = () => {
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }

    // 关闭所有活跃的呼叫
    for (const [peerId, call] of activeCalls) {
      console.log('[PeerJS] 关闭与学生的呼叫:', peerId)
      try {
        call.close()
      } catch (e) {
        // 忽略关闭错误
      }
    }
    activeCalls.clear()

    if (currentCall.value) {
      currentCall.value.close()
      currentCall.value = null
    }

    isScreenSharing.value = false
    connectedPeers.value.clear()
    // 注意：不清除 knownStudents，以便下次分享时可以主动呼叫
    console.log('[PeerJS] 屏幕分享已停止，已知学生:', Array.from(knownStudents.value))
  }

  // 销毁
  const destroy = () => {
    stopScreenShare()

    // 清除已知学生列表
    knownStudents.value.clear()
    
    // 关闭学生端的数据连接
    if (teacherDataConnection) {
      teacherDataConnection.close()
      teacherDataConnection = null
    }

    if (peer.value) {
      peer.value.destroy()
      peer.value = null
    }

    myPeerId.value = ''
    isConnected.value = false
    remoteStream.value = null
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    peer,
    myPeerId,
    isConnected,
    localStream,
    remoteStream,
    isScreenSharing,
    connectedPeers,
    knownStudents,
    initialize,
    startScreenShare,
    callPeer,
    connectToTeacher,
    stopScreenShare,
    destroy
  }
}
