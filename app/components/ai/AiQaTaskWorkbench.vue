<template>
  <AiAssistantImagePage
    :force-chat-mode="embedded"
    :reset-chat-mode-on-mount="embedded"
    :task-chat-embed="embedded"
    @chat-session-ready="handleChatSessionReady"
  />
</template>

<script setup lang="ts">
import AiAssistantImagePage from "~/components/ai/AiAssistantImagePage.vue";

withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  {
    embedded: false,
  }
);

const emit = defineEmits<{
  (event: "chat-session-ready", payload: { sessionId: string }): void;
}>();

const handleChatSessionReady = (payload: { sessionId: string }) => {
  emit("chat-session-ready", payload);
};
</script>
