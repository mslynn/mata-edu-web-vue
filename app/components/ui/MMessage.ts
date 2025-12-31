/**
 * 消息提示组件（函数式调用）
 * 使用方式：
 * import { ElMessage } from '~/components/ui/ElMessage'
 * ElMessage.success('操作成功')
 * ElMessage.error('操作失败')
 * ElMessage.warning('警告信息')
 * ElMessage.info('提示信息')
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

// 获取图标（圆形背景 21x21）
const getIcon = (type: MessageType) => {
  const icons = {
    success: `<div class="flex-shrink-0 rounded-full border-2 flex items-center justify-center" style="width: 21px; height: 21px; border-color: #5EB26B">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; color: #5EB26B">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
      </svg>
    </div>`,
    error: `<div class="flex-shrink-0 rounded-full border-2 border-red-500 flex items-center justify-center" style="width: 21px; height: 21px;">
      <svg class="text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>`,
    warning: `<div class="flex-shrink-0 rounded-full border-2 border-yellow-500 flex items-center justify-center" style="width: 21px; height: 21px;">
      <svg class="text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>`,
    info: `<div class="flex-shrink-0 rounded-full border-2 border-blue-500 flex items-center justify-center" style="width: 21px; height: 21px;">
      <svg class="text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px;">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>`
  }
  return icons[type]
}

// 获取背景色和文字颜色
const getStyles = (type: MessageType) => {
  const styles = {
    success: {
      bg: 'bg-gray-100',
      text: '', // 使用内联样式
      textColor: '#5EB26B'
    },
    error: {
      bg: 'bg-gray-100',
      text: 'text-red-500',
      textColor: ''
    },
    warning: {
      bg: 'bg-gray-100',
      text: 'text-yellow-500',
      textColor: ''
    },
    info: {
      bg: 'bg-gray-100',
      text: 'text-blue-500',
      textColor: ''
    }
  }
  return styles[type]
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
  const styles = getStyles(type)
  messageEl.className = `flex items-center justify-center rounded-2xl ${styles.bg} transition-all duration-300`
  messageEl.style.cssText = 'animation: messageSlideIn 0.3s ease; min-width: 210px; height: 60px; gap: 15px; padding: 0 24px; white-space: nowrap;'
  
  const textColorStyle = type === 'success' ? `color: ${styles.textColor};` : ''
  messageEl.innerHTML = `
    ${getIcon(type)}
    <span class="${styles.text}" style="font-size: 16px; font-weight: normal; ${textColorStyle}">${message}</span>
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
export const ElMessage = {
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

export default ElMessage

