<template>
  <div class="ai-face-task-workbench">
    <button
      v-if="completed"
      type="button"
      class="ai-face-task-workbench__back"
      @click="resetWorkbench"
      aria-label="返回上一步"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <FaceExperiencePage embedded @completed="handleCompleted" />
  </div>
</template>

<script setup lang="ts">
import FaceExperiencePage from "~/pages/system/opt/face/experience2.vue";

const completed = ref(false);

const handleCompleted = () => {
  completed.value = true;
};

const resetWorkbench = () => {
  completed.value = false;
};
</script>

<style scoped>
.ai-face-task-workbench {
  position: relative;
  min-height: 0;
  height: 100%;
}

.ai-face-task-workbench__back {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #1d4f91;
  box-shadow: 0 6px 18px rgba(31, 79, 145, 0.1);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.ai-face-task-workbench__back:hover {
  background: #f4f8ff;
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(31, 79, 145, 0.16);
}

.ai-face-task-workbench__back svg {
  width: 18px;
  height: 18px;
}
</style>
