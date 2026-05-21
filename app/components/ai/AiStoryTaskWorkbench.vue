<template>
  <div class="ai-story-task-workbench">
    <button
      v-if="currentBookId"
      type="button"
      class="ai-story-task-workbench__back"
      @click="handleBackEdit"
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

    <StoryReadingPage
      v-if="currentBookId"
      :key="currentBookId"
      embedded
      :book-id="currentBookId"
      @back-edit="handleBackEdit"
      @open-book="handleOpenBook"
    />
    <StoryCreatorPage
      v-else
      embedded
      @generated="handleGenerated"
      @open-book="handleOpenBook"
    />
  </div>
</template>

<script setup lang="ts">
import StoryCreatorPage from "~/components/story/StoryCreatorPage.vue";
import StoryReadingPage from "~/components/story/StoryReadingPage.vue";

const currentBookId = ref("");

const handleGenerated = (payload: { bookId: string }) => {
  currentBookId.value = String(payload.bookId || "").trim();
};

const handleOpenBook = (payload: { bookId: string }) => {
  currentBookId.value = String(payload.bookId || "").trim();
};

const handleBackEdit = () => {
  currentBookId.value = "";
};
</script>

<style scoped>
.ai-story-task-workbench {
  position: relative;
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
}

.ai-story-task-workbench__back {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 5;
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

.ai-story-task-workbench__back:hover {
  background: #f4f8ff;
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(31, 79, 145, 0.16);
}

.ai-story-task-workbench__back svg {
  width: 18px;
  height: 18px;
}
</style>
