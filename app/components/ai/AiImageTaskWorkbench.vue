<template>
  <AiAssistantImagePage
    :force-image-mode="embedded"
    :reset-image-mode-on-mount="embedded"
    :task-image-embed="embedded"
    :selected-session-id="selectedSessionId"
    @open-history-gallery="handleOpenHistoryGallery"
    @session-loaded="handleSessionLoaded"
    @generated="handleGenerated"
    @generate-start="handleGenerateStart"
  />
</template>

<script setup lang="ts">
import AiAssistantImagePage from "~/components/ai/AiAssistantImagePage.vue";

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
    selectedSessionId?: string;
  }>(),
  {
    embedded: false,
    selectedSessionId: "",
  }
);

const emit = defineEmits<{
  (event: "generate-start"): void;
  (event: "open-history-gallery"): void;
  (
    event: "session-loaded",
    payload: { sessionId: string; imageUrls: string[]; prompt: string }
  ): void;
  (
    event: "generated",
    payload: { sessionId: string; imageUrls: string[]; prompt: string }
  ): void;
}>();

const handleGenerateStart = () => {
  emit("generate-start");
};

const handleOpenHistoryGallery = () => {
  emit("open-history-gallery");
};

const handleSessionLoaded = (payload: {
  sessionId: string;
  imageUrls: string[];
  prompt: string;
}) => {
  emit("session-loaded", payload);
};

const handleGenerated = (payload: {
  sessionId: string;
  imageUrls: string[];
  prompt: string;
}) => {
  emit("generated", payload);
};
</script>
