<template>
  <button 
    :class="[
      'inline-flex items-center justify-center gap-1 rounded transition-all font-medium',
      typeClass,
      sizeClass,
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'primary' | 'default' | 'danger' | 'text'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}>(), {
  type: 'default',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (e: MouseEvent) => {
  if (!props.disabled) {
    emit('click', e)
  }
}

const typeClass = computed(() => {
  switch (props.type) {
    case 'primary':
      return 'bg-[#4CB9CF] text-white hover:bg-[#3da8be] active:bg-[#2f97ad]'
    case 'danger':
      return 'bg-[#FF6B6B] text-white hover:bg-[#ff5252] active:bg-[#e04848]'
    case 'text':
      return 'text-[#4CB9CF] hover:text-[#3da8be] hover:bg-[#4CB9CF]/10'
    default:
      return 'bg-white border border-gray-300 text-gray-600 hover:border-[#4CB9CF] hover:text-[#4CB9CF]'
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'px-2 py-1 text-xs'
    case 'large':
      return 'px-6 py-3 text-base'
    default:
      return 'px-4 py-2 text-sm'
  }
})
</script>

