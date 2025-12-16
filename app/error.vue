<template>
  <div class="error-page h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-[#FF9900] mb-4">{{ error?.statusCode || 404 }}</h1>
      <p class="text-xl text-gray-600 mb-8">{{ error?.message || '页面不存在' }}</p>
      <button 
        class="px-6 py-3 bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00] transition-colors"
        @click="handleBack"
      >
        返回上一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()

const handleBack = () => {
  // 返回上一页
  if (window.history.length > 1) {
    window.history.back()
  } else {
    // 如果没有历史记录，跳转到首页
    navigateTo('/teacher')
  }
}
</script>

<style scoped>
.error-page {
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
