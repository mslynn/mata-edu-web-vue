<template>
  <div :class="['flex gap-2 lg:gap-[15px]', block ? 'w-full' : '']">
    <button 
      v-for="tab in tabs" 
      :key="tab.value"
      :disabled="tab.disabled"
      :class="[
        'w-[100px] sm:w-[120px] lg:w-[142px] h-[40px] lg:h-[50px] text-[14px] lg:text-[16px] font-medium transition-all rounded-[10px]',
        // 选中状态
        modelValue === tab.value 
          ? 'bg-[#FF9900] text-white' 
          : 'bg-[#FAFAFA] text-[#4D4D4D] hover:opacity-90 border border-[#E5E5E5]',
        // 禁用状态
        tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        // 撑满宽度
        block ? 'flex-1' : ''
      ]"
      @click="handleClick(tab)"
    >
      <span class="flex items-center justify-center gap-2">
        <slot :name="`tab-${tab.value}`" :tab="tab">
          {{ tab.label }}
        </slot>
        <!-- 徽标 -->
        <span 
          v-if="tab.badge !== undefined" 
          class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs bg-red-500 text-white rounded-full"
        >
          {{ tab.badge }}
        </span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  label: string
  value: string
  disabled?: boolean
  badge?: number | string
}

const props = withDefaults(defineProps<{
  modelValue: string
  tabs: Tab[]
  block?: boolean
}>(), {
  block: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const handleClick = (tab: Tab) => {
  if (tab.disabled) return
  emit('update:modelValue', tab.value)
  emit('change', tab.value)
}
</script>

