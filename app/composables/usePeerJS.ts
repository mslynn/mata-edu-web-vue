/**
 * PeerJS 屏幕分享服务
 * 用于教师端推送屏幕流、学生端接收屏幕流
 */
import { ref, onUnmounted } from 'vue'
import Peer, { type MediaConnection, type DataConnection } from 'peerjs'

export function usePeerJS() {
  const peer = ref<Peer | null>(null)
  const myPeerId = ref('')
  const isConnected = ref(false)
  const localStream = ref<MediaStream | null>(null)
  const remoteStream = ref<MediaStream | null>(null)
  const isScreenSharing = ref(false)
  const connectedPeers = ref<Set<string>>(new Set())
  
  // 老师端：保存所有活跃的呼叫连接
  const activeCalls = new Map<string, MediaConnection>()
  // 老师端：等待屏幕分享的学生列表
  const pendingStudents = new Set<string>()
  
  // 学生端：当前呼叫
  let currentCall: MediaConnection | null = null
  // 学生端：与老师的数据连接
  let teacherDataConnection: DataConnection | null = null

  // 初始化 PeerJS
  const initialize = async (peerId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('[PeerJS] 初始化, peerId:', peerId)

      peer.value = new Peer(peerId, {
        host: 'peerjs.matatastudio.com',
        port: 443,
        path: '/peerjs',
        key: 'KDlNH3JzGu6Ybk9iVjGhHe8Xb4zsxOeqNW31pQY4dG6gfZcMvg9k0EQP4hCiOWu',
        secure: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        },
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
        
        // 保存当前呼叫
        currentCall = call

        // 应答呼叫（不发送流，只接收）
        call.answer()

        call.on('stream', (stream) => {
          console.log('[PeerJS] 收到远程流, tracks:', stream.getTracks().length)
          remoteStream.value = stream
          connectedPeers.value.add(call.peer)
        })

        call.on('close', () => {
          console.log('[PeerJS] 呼叫关闭')
          // 只有当前呼叫关闭时才清除远程流
          if (currentCall === call) {
            remoteStream.value = null
            currentCall = null
          }
          connectedPeers.value.delete(call.peer)
        })

        call.on('error', (err) => {
          console.error('[PeerJS] 呼叫错误:', err)
        })
      })

      // 老师端：接收学生的数据连接
      peer.value.on('connection', (conn) => {
        console.log('[PeerJS] 收到数据连接，来自:', conn.peer)

        conn.on('data', (data: any) => {
          console.log('[PeerJS] 收到数据:', data)
          
          if (data.type === 'REQUEST_SCREEN') {
            const studentPeerId = data.studentPeerId || conn.peer
            console.log('[PeerJS] 学生请求屏幕分享:', studentPeerId)

            if (isScreenSharing.value && localStream.value) {
              // 检查是否已有活跃连接
              if (activeCalls.has(studentPeerId)) {
                console.log('[PeerJS] 已有连接，跳过:', studentPeerId)
                return
              }
              // 呼叫学生
              callPeer(studentPeerId)
            } else {
              // 加入等待列表
              console.log('[PeerJS] 加入等待列表:', studentPeerId)
              pendingStudents.add(studentPeerId)
            }
          }
        })
      })
    })
  }

  // 老师端：开始屏幕分享
  const startScreenShare = async (): Promise<boolean> => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      console.error('[PeerJS] 浏览器不支持屏幕分享')
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
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        stopScreenShare()
      })

      console.log('[PeerJS] 屏幕分享已开始')

      // 呼叫所有等待中的学生
      if (pendingStudents.size > 0) {
        console.log('[PeerJS] 呼叫等待中的学生:', Array.from(pendingStudents))
        for (const studentPeerId of pendingStudents) {
          callPeer(studentPeerId)
        }
        pendingStudents.clear()
      }

      return true
    } catch (error) {
      console.error('[PeerJS] 获取屏幕流失败:', error)
      return false
    }
  }

  // 老师端：呼叫学生
  const callPeer = (remotePeerId: string) => {
    if (!peer.value || !localStream.value) {
      console.error('[PeerJS] 无法呼叫：未初始化或没有本地流')
      return
    }

    console.log('[PeerJS] 呼叫学生:', remotePeerId)
    const call = peer.value.call(remotePeerId, localStream.value)

    call.on('close', () => {
      console.log('[PeerJS] 与学生的呼叫关闭:', remotePeerId)
      connectedPeers.value.delete(remotePeerId)
      activeCalls.delete(remotePeerId)
    })

    call.on('error', (err) => {
      console.error('[PeerJS] 呼叫错误:', remotePeerId, err)
      connectedPeers.value.delete(remotePeerId)
      activeCalls.delete(remotePeerId)
    })

    connectedPeers.value.add(remotePeerId)
    activeCalls.set(remotePeerId, call)
  }

  // 学生端：连接老师并请求屏幕分享
  const connectToTeacher = (teacherPeerId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!peer.value) {
        reject(new Error('PeerJS 未初始化'))
        return
      }

      console.log('[PeerJS] 连接老师:', teacherPeerId)

      const conn = peer.value.connect(teacherPeerId, { reliable: true })
      teacherDataConnection = conn

      const timeoutId = setTimeout(() => {
        reject(new Error('连接超时'))
      }, 5000)

      conn.on('open', () => {
        clearTimeout(timeoutId)
        console.log('[PeerJS] 已连接到老师，发送屏幕分享请求')
        conn.send({ type: 'REQUEST_SCREEN', studentPeerId: myPeerId.value })
        resolve()
      })

      conn.on('error', (err) => {
        clearTimeout(timeoutId)
        reject(err)
      })
    })
  }

  // 停止屏幕分享
  const stopScreenShare = () => {
    localStream.value?.getTracks().forEach(track => track.stop())
    localStream.value = null

    // 把当前连接的学生加回等待列表，以便下次分享时主动呼叫
    for (const [peerId] of activeCalls) {
      console.log('[PeerJS] 将学生加入等待列表:', peerId)
      pendingStudents.add(peerId)
    }

    // 关闭所有呼叫
    for (const [peerId, call] of activeCalls) {
      console.log('[PeerJS] 关闭呼叫:', peerId)
      call.close()
    }
    activeCalls.clear()
    
    isScreenSharing.value = false
    connectedPeers.value.clear()
    console.log('[PeerJS] 屏幕分享已停止，等待列表:', Array.from(pendingStudents))
  }

  // 销毁
  const destroy = () => {
    stopScreenShare()
    pendingStudents.clear()
    
    teacherDataConnection?.close()
    teacherDataConnection = null
    
    currentCall?.close()
    currentCall = null

    peer.value?.destroy()
    peer.value = null

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
    initialize,
    startScreenShare,
    callPeer,
    connectToTeacher,
    stopScreenShare,
    destroy
  }
}
