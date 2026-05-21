<template>
  <AiWendaTaskWorkbench
    :embedded="embedded"
    @chat-session-ready="handleChatSessionReady"
  />
</template>

<script setup lang="ts">
import AiWendaTaskWorkbench from "~/components/ai/AiWendaTaskWorkbench.vue";

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
