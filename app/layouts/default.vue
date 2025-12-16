<template>
  <div class="h-screen flex flex-col font-sans overflow-hidden">
    <!-- 公用顶部导航栏 -->
    <AppHeader />

    <!-- 页面内容插槽 - 样式由各页面自己控制 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
