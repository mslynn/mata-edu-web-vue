<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="modelValue" 
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        @keydown.esc="handleClose"
      >
        <!-- 遮罩 -->
        <div 
          class="absolute inset-0 bg-black/50 transition-opacity" 
          @click="closeOnClickModal && handleClose()" 
        />
        
        <!-- 弹窗内容 -->
        <div 
          :class="[
            'relative bg-white rounded-lg shadow-xl w-full transition-all',
            sizeClass
          ]"
          :style="customWidth ? { maxWidth: customWidth } : {}"
        >
          <!-- 标题栏 -->
          <div v-if="(title || $slots.header) && showClose !== false" class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <slot name="header">
              <h3 class="text-lg font-medium text-gray-800">{{ title }}</h3>
            </slot>
            <button 
              v-if="showClose"
              class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
              @click="handleClose"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- 内容区 -->
          <div :class="['px-6 py-4', contentClass]">
            <slot />
          </div>
          
          <!-- 底部按钮 -->
          <div v-if="showFooter" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <slot name="footer">
              <MButton v-if="showCancel" @click="handleClose">
                {{ cancelText }}
              </MButton>
              <MButton 
                v-if="showConfirm"
                type="primary" 
                :disabled="confirmDisabled"
                @click="handleConfirm"
              >
                {{ confirmText }}
              </MButton>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'full'
  customWidth?: string
  showClose?: boolean
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  confirmDisabled?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  contentClass?: string
}>(), {
  title: '',
  size: 'medium',
  showClose: true,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  cancelText: '取消',
  confirmText: '确定',
  confirmDisabled: false,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  contentClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
  open: []
  close: []
}>()

const sizeClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'max-w-sm'
    case 'large':
      return 'max-w-2xl'
    case 'full':
      return 'max-w-[90vw] max-h-[90vh]'
    default:
      return 'max-w-md'
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
  emit('cancel')
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

// 监听显示状态
watch(() => props.modelValue, (val) => {
  if (val) {
    emit('open')
    // 禁止背景滚动
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// ESC 关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnPressEscape && props.modelValue) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active {
  transition: all 0.2s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child {
  transform: scale(0.8) translateY(30px);
  opacity: 0;
}

.modal-leave-to > div:last-child {
  transform: scale(0.9) translateY(-10px);
  opacity: 0;
}

.modal-enter-active > div:last-child {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-leave-active > div:last-child {
  transition: all 0.2s ease-out;
}
</style>

