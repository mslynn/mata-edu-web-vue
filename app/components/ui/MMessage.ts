/**
 * 消息提示组件（函数式调用）
 * 使用方式：
 * import { MMessage } from '~/components/ui/MMessage'
 * MMessage.success('操作成功')
 * MMessage.error('操作失败')
 * MMessage.warning('警告信息')
 * MMessage.info('提示信息')
 */

import { h, render, ref } from 'vue'

type MessageType = 'success' | 'error' | 'warning' | 'info'

interface MessageOptions {
  message: string
  type?: MessageType
  duration?: number
  showClose?: boolean
}

interface MessageInstance {
  id: string
  close: () => void
}

// 消息容器
let messageContainer: HTMLDivElement | null = null
const messages = ref<MessageInstance[]>([])

// 获取图标
const getIcon = (type: MessageType) => {
  const icons = {
    success: `<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>`,
    error: `<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>`,
    warning: `<svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>`,
    info: `<svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>`
  }
  return icons[type]
}

// 获取背景色
const getBgColor = (type: MessageType) => {
  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }
  return colors[type]
}

// 创建消息
const createMessage = (options: MessageOptions): MessageInstance => {
  const { message, type = 'info', duration = 3000, showClose = false } = options
  
  // 创建容器
  if (!messageContainer) {
    messageContainer = document.createElement('div')
    messageContainer.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2'
    document.body.appendChild(messageContainer)
  }
  
  const id = `message-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const messageEl = document.createElement('div')
  messageEl.id = id
  messageEl.className = `flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${getBgColor(type)}`
  messageEl.style.cssText = 'animation: messageSlideIn 0.3s ease; min-width: 200px;'
  
  messageEl.innerHTML = `
    ${getIcon(type)}
    <span class="text-sm text-gray-700 flex-1">${message}</span>
    ${showClose ? `<button class="text-gray-400 hover:text-gray-600 ml-2" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>` : ''}
  `
  
  messageContainer.appendChild(messageEl)
  
  const close = () => {
    messageEl.style.animation = 'messageSlideOut 0.3s ease forwards'
    setTimeout(() => {
      messageEl.remove()
      messages.value = messages.value.filter(m => m.id !== id)
      // 如果没有消息了，移除容器
      if (messageContainer && !messageContainer.children.length) {
        messageContainer.remove()
        messageContainer = null
      }
    }, 300)
  }
  
  // 自动关闭
  if (duration > 0) {
    setTimeout(close, duration)
  }
  
  const instance: MessageInstance = { id, close }
  messages.value.push(instance)
  
  return instance
}

// 添加动画样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes messageSlideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
  `
  document.head.appendChild(style)
}

// 导出方法
export const MMessage = {
  success: (message: string, options?: Partial<MessageOptions>) => 
    createMessage({ message, type: 'success', ...options }),
  error: (message: string, options?: Partial<MessageOptions>) => 
    createMessage({ message, type: 'error', ...options }),
  warning: (message: string, options?: Partial<MessageOptions>) => 
    createMessage({ message, type: 'warning', ...options }),
  info: (message: string, options?: Partial<MessageOptions>) => 
    createMessage({ message, type: 'info', ...options }),
  close: (id: string) => {
    const instance = messages.value.find(m => m.id === id)
    instance?.close()
  },
  closeAll: () => {
    messages.value.forEach(m => m.close())
  }
}

export default MMessage

