<template>
  <div class="ai-mood-task-workbench">
    <MoodRecognitionWorkbenchPage />
  </div>
</template>

<script setup lang="ts">
import MoodRecognitionWorkbenchPage from "~/components/mood/MoodRecognitionWorkbenchPage.vue";
</script>

<style scoped>
.ai-mood-task-workbench {
  height: 100%;
  min-height: 0;
  overflow: auto;
  background: #f8fafc;
}
</style>
