<template>
  <div class="h-screen flex flex-col font-sans overflow-hidden">
    <!-- 公用顶部导航栏 -->
    <AppHeader />

    <!-- 内容区 -->
    <div class="flex-1 flex overflow-hidden bg-[#FAFAFA] px-2 lg:px-4 xl:px-8 2xl:px-[60px]">
      <!-- 固定的左侧导航 -->
      <AppSidebar class="hidden lg:flex flex-shrink-0" />
      
      <!-- 页面内容插槽 -->
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
