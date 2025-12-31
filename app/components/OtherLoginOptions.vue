<template>
  <div class="flex justify-start gap-20 mt-8 pt-9 text-lg">
    <button 
      @click="$emit('classcode-login')"
      class="flex items-center gap-2 bg-transparent border-none text-gray-400 text-sm cursor-pointer transition-colors hover:text-[#e8a063]"
    >
      <img src="~/assets/images/classcode.png" alt="class code" class="w-6 h-6 " />
      <span>{{ t('auth.classCodeLogin') }}</span>
    </button>
    <button 
      @click="$emit('apply-account')"
      class="flex items-center gap-2 bg-transparent border-none text-gray-400 text-sm cursor-pointer transition-colors hover:text-[#e8a063]"
    >
      <img src="~/assets/images/apply.png" alt="apply" class="w-6 h-6 " />
      <span>{{ t('auth.applyTrialAccount') }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const { $i18n } = useNuxtApp()
const t = (key: string) => $i18n.t(key)

defineEmits<{
  'classcode-login': []
  'apply-account': []
}>()
</script>

