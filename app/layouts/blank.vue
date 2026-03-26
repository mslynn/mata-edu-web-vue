<template>
  <div class="blank-layout">
    <StudentEvaluationNoticeBridge v-if="isStudentRoute" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();
const isStudentRoute = computed(() => route.path.startsWith("/student"));
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
}
</style>
