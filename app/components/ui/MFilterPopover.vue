<template>
  <div class="relative inline-block group py-2">
    <!-- Trigger Slot -->
    <slot name="trigger"></slot>

    <!-- Popover Content -->
    <div class="absolute top-full left-1/2 -translate-x-1/2 mt-0 pt-2 z-50 hidden group-hover:block w-max">
      <div class="bg-black/80 backdrop-blur-sm rounded-lg shadow-xl py-2 relative min-w-[80px]">
         <!-- Arrow -->
         <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
         
         <!-- Options -->
         <div 
            v-for="opt in options" 
            :key="opt.value"
            class="relative z-10 px-4 py-2 text-center text-sm cursor-pointer transition-colors whitespace-nowrap"
            :class="modelValue === opt.value ? 'text-[#FF9900] font-medium' : 'text-white hover:text-[#FF9900]'"
            @click="$emit('update:modelValue', opt.value)"
         >
            {{ opt.label }}
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number
  options: Array<{ label: string, value: string | number }>
}>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>
