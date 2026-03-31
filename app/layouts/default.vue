<template>
  <div class="h-screen flex flex-col font-sans overflow-hidden">
    <!-- 公用顶部导航栏 -->
    <AppHeader />
    <StudentEvaluationNoticeBridge v-if="shouldShowStudentNoticeBridge" />

    <!-- 页面内容插槽 - 样式由各页面自己控制 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();
const shouldShowStudentNoticeBridge = computed(() => {
  if (!route.path.startsWith("/student")) {
    return false;
  }

  return route.path !== "/student" && route.path !== "/student/classroom";
});
</script>
