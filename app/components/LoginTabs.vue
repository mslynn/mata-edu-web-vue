<template>
  <div class="flex gap-12 mb-8 justify-center">
    <button 
      :class="[
        'bg-transparent border-none text-lg cursor-pointer py-2 relative transition-all duration-300 ease-in-out',
        modelValue === 'campus' ? 'text-gray-800' : 'text-[#808080]'
      ]"
      @click="$emit('update:modelValue', 'campus')"
    >
      校园账号登录
      <span 
        :class="[
          'absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out',
          modelValue === 'campus' ? 'left-0 right-0 opacity-100' : 'left-1/2 right-1/2 opacity-0'
        ]"
      ></span>
    </button>
    <button 
      :class="[
        'bg-transparent border-none text-lg cursor-pointer py-2 relative transition-all duration-300 ease-in-out',
        modelValue === 'phonenumber' ? 'text-gray-800' : 'text-[#808080]'
      ]"
      @click="$emit('update:modelValue', 'phonenumber')"
    >
      手机号登录
      <span 
        :class="[
          'absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out',
          modelValue === 'phonenumber' ? 'left-0 right-0 opacity-100' : 'left-1/2 right-1/2 opacity-0'
        ]"
      ></span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: 'campus' | 'phonenumber'
}>()

defineEmits<{
  'update:modelValue': [value: 'campus' | 'phonenumber']
}>()
</script>

