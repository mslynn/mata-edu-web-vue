<template>
  <div class="h-screen flex flex-col bg-[#FAFAFA] font-sans overflow-hidden">
    <!-- 登录页专用顶部导航栏 -->
    <header
      class="flex justify-between items-center pl-6 md:pl-[115px] bg-white h-[70px] flex-shrink-0"
    >
      <div class="flex items-baseline gap-1">
        <img :src="currentLogo" alt="Logo" class="w-[200px] h-[32px] object-contain" />
      </div>
    </header>

    <!-- 页面内容插槽 - 垂直居中 -->
    <main class="flex-1 flex justify-center items-center w-full max-w-[1000px] mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import logo from '~/assets/newimages/logo.png'

const currentLogo = computed(() => {
  return logo
})
</script>
  
