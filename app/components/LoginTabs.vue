<template>
  <div class="flex gap-12 mb-8 justify-center">
    <button 
      :class="[
        'bg-transparent border-none text-lg cursor-pointer py-2 relative transition-all duration-300 ease-in-out',
        modelValue === 'campus' ? 'text-gray-800' : 'text-[#808080]'
      ]"
      @click="$emit('update:modelValue', 'campus')"
    >
      {{ t('auth.campusLogin') }}
      <span 
        :class="[
          'absolute bottom-0 h-0.5 bg-[#0f67ff] transition-all duration-300 ease-in-out',
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
      {{ t('auth.phoneLogin') }}
      <span 
        :class="[
          'absolute bottom-0 h-0.5 bg-[#0f67ff] transition-all duration-300 ease-in-out',
          modelValue === 'phonenumber' ? 'left-0 right-0 opacity-100' : 'left-1/2 right-1/2 opacity-0'
        ]"
      ></span>
    </button>
  </div>
</template>

<script setup lang="ts">
const { $i18n } = useNuxtApp()
const t = (key: string) => $i18n.t(key)

defineProps<{
  modelValue: 'campus' | 'phonenumber'
}>()

defineEmits<{
  'update:modelValue': [value: 'campus' | 'phonenumber']
}>()
</script>

