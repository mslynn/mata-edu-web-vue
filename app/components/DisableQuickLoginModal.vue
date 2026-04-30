<template>
  <MModal
    :model-value="modelValue"
    custom-width="392px"
    :show-footer="false"
    :show-close="false"
    content-class="!p-0"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="quick-login-disable-modal relative">
      <button
        class="quick-login-disable-modal__close absolute right-5 top-5"
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
      <h3 class="quick-login-disable-modal__title">
        {{ title }}
      </h3>
      <p class="quick-login-disable-modal__desc">
        {{ content }}
      </p>
      <div class="quick-login-disable-modal__notice">
        <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="break-all sm:break-normal">{{ tip }}</span>
      </div>
      <div class="quick-login-disable-modal__actions">
        <button
          class="quick-login-disable-modal__btn quick-login-disable-modal__btn--ghost"
          @click="emit('update:modelValue', false)"
        >
          {{ cancelText }}
        </button>
        <button
          class="quick-login-disable-modal__btn quick-login-disable-modal__btn--primary"
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

<style scoped>
.quick-login-disable-modal {
  padding: 24px;
  border: 1px solid rgba(174, 179, 181, 0.2);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(25, 28, 30, 0.08);
}

.quick-login-disable-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #9aa4af;
  background: #f8f9fa;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 999px;
  transition: all 0.2s ease;
}

.quick-login-disable-modal__close:hover {
  color: #005bc2;
  background: #f2f6fb;
  border-color: rgba(0, 91, 194, 0.18);
}

.quick-login-disable-modal__title {
  margin-bottom: 20px;
  padding: 0 24px;
  text-align: center;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: #2e3335;
}

.quick-login-disable-modal__desc {
  margin-bottom: 18px;
  text-align: center;
  font-size: 15px;
  line-height: 1.65;
  color: #5a6062;
}

.quick-login-disable-modal__notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px 14px;
  border: 1px solid rgba(164, 193, 255, 0.3);
  border-radius: 14px;
  background: #f7fbff;
  font-size: 13px;
  line-height: 1.6;
  color: #7b8794;
}

.quick-login-disable-modal__notice svg {
  margin-top: 1px;
  color: #005bc2;
}

.quick-login-disable-modal__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.quick-login-disable-modal__btn {
  min-width: 136px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-login-disable-modal__btn--ghost {
  border: 1px solid rgba(0, 91, 194, 0.2);
  color: #005bc2;
  background: #ffffff;
}

.quick-login-disable-modal__btn--ghost:hover {
  background: rgba(0, 91, 194, 0.06);
  border-color: rgba(0, 91, 194, 0.3);
}

.quick-login-disable-modal__btn--primary {
  color: #ffffff;
  background: #005bc2;
}

.quick-login-disable-modal__btn--primary:hover {
  background: #0050ab;
}
</style>
