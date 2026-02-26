<template>
  <div class="relative inline-block" @mouseenter="show" @mouseleave="hide">
    <slot></slot>
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="visible && content"
          ref="tooltipRef"
          class="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg max-w-[300px] break-words"
          :style="tooltipStyle"
        >
          {{ content }}
          <div 
            class="absolute w-2 h-2 bg-gray-800 rotate-45"
            :class="arrowClass"
          ></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  disabled?: boolean
}>(), {
  placement: 'top',
  disabled: false
})

const visible = ref(false)
const tooltipRef = ref<HTMLElement | null>(null)
const triggerRect = ref<DOMRect | null>(null)

const tooltipStyle = computed(() => {
  if (!triggerRect.value) return {}
  
  const rect = triggerRect.value
  const gap = 8
  
  switch (props.placement) {
    case 'top':
      return {
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.top - gap}px`,
        transform: 'translate(-50%, -100%)'
      }
    case 'bottom':
      return {
        left: `${rect.left + rect.width / 2}px`,
        top: `${rect.bottom + gap}px`,
        transform: 'translate(-50%, 0)'
      }
    case 'left':
      return {
        left: `${rect.left - gap}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: 'translate(-100%, -50%)'
      }
    case 'right':
      return {
        left: `${rect.right + gap}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: 'translate(0, -50%)'
      }
    default:
      return {}
  }
})

const arrowClass = computed(() => {
  switch (props.placement) {
    case 'top':
      return 'left-1/2 -translate-x-1/2 -bottom-1'
    case 'bottom':
      return 'left-1/2 -translate-x-1/2 -top-1'
    case 'left':
      return 'top-1/2 -translate-y-1/2 -right-1'
    case 'right':
      return 'top-1/2 -translate-y-1/2 -left-1'
    default:
      return ''
  }
})

const show = (e: MouseEvent) => {
  if (props.disabled || !props.content) return
  const target = e.currentTarget as HTMLElement
  triggerRect.value = target.getBoundingClientRect()
  visible.value = true
}

const hide = () => {
  visible.value = false
}
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
