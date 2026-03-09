<template>
  <MModal
    :model-value="modelValue"
    custom-width="420px"
    :show-footer="false"
    :show-close="false"
    content-class="!p-0"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="relative p-6">
      <button
        class="absolute right-3 top-3 text-gray-400 transition-colors hover:text-gray-600"
        @click="emit('update:modelValue', false)"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      <h3 class="mb-6 text-center text-lg font-medium text-[#4D4D4D]">
        {{ title }}
      </h3>
      <p class="mb-6 text-center text-[#4D4D4D]">
        {{ content }}
      </p>
      <div
        class="mx-auto mb-8 flex w-fit max-w-full items-center justify-center gap-2 rounded-[10px] border border-[#FFD9D2] bg-[#FFF7F5] px-4 py-3 text-sm text-[#666]"
      >
        <svg class="h-4 w-4 shrink-0 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="break-all text-[#666] sm:break-normal">{{ tip }}</span>
      </div>
      <div class="flex items-center justify-center gap-4">
        <button
          class="h-[44px] w-[136px] rounded-lg border border-gray-300 text-[#4D4D4D] hover:bg-gray-50"
          @click="emit('update:modelValue', false)"
        >
          {{ cancelText }}
        </button>
        <button
          class="h-[44px] w-[136px] rounded-lg bg-[#FF9900] text-white hover:bg-[#E68A00]"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </MModal>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    content: string;
    tip: string;
    cancelText?: string;
    confirmText?: string;
  }>(),
  {
    cancelText: "取消",
    confirmText: "确定",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
}>();
</script>
