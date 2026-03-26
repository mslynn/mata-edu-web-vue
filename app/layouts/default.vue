<template>
  <div class="h-screen flex flex-col font-sans overflow-hidden">
    <!-- 公用顶部导航栏 -->
    <AppHeader />
    <StudentEvaluationNoticeBridge v-if="isStudentRoute" />

    <!-- 页面内容插槽 - 样式由各页面自己控制 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();
const isStudentRoute = computed(() => route.path.startsWith("/student"));
</script>
