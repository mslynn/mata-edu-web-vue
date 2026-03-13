<template>
  <div class="relative">
    <!-- 前缀图标 -->
    <div 
      v-if="$slots.prefix" 
      class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    >
      <slot name="prefix" />
    </div>
    
    <input 
      ref="inputRef"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      :readonly="readonly"
      :class="[
        'w-full border rounded-lg text-sm transition-all focus:outline-none',
        $slots.prefix ? 'pl-10' : 'pl-4',
        clearable && modelValue ? 'pr-10' : 'pr-4',
        'py-2',
        disabled ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-white',
        error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#FF9900]'
      ]"
      @input="handleInput"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      @keyup.enter="$emit('enter', $event)"
    />
    
    <!-- 清除按钮 -->
    <button 
      v-if="clearable && modelValue && !disabled" 
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      @click="handleClear"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- 后缀图标 -->
    <div 
      v-if="$slots.suffix && !(clearable && modelValue)" 
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
    >
      <slot name="suffix" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string | number
  type?: string
  placeholder?: string
  maxlength?: string | number
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  error?: boolean
}>(), {
  type: 'text',
  placeholder: '',
  maxlength: undefined,
  disabled: false,
  readonly: false,
  clearable: false,
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  enter: [event: KeyboardEvent]
  clear: []
}>()

const inputRef = ref<HTMLInputElement>()

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

