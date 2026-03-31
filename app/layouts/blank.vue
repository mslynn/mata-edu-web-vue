<template>
  <div class="blank-layout">
    <StudentEvaluationNoticeBridge v-if="shouldShowStudentNoticeBridge" />
    <slot />
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

<style scoped>
.blank-layout {
  min-height: 100vh;
}
</style>
