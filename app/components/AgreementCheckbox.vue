<template>
  <div class="mt-[20px] pl-[10px]">
    <label class="flex items-center gap-[6px] cursor-pointer">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        class="custom-checkbox"
      />
      <span class="text-xs text-gray-500 text-[16px] block">
        {{ t("auth.agreementPrefix") }}
        <a
          href="https://matatalab.com/app/user_agreement.html"
          target="_blank"
          rel="noopener noreferrer"
          class="no-underline text-[#3366FF] cursor-pointer"
        >
          {{ t("auth.userAgreement") }}
        </a>
        {{ t("auth.and") }}
        <a
          href="https://nous.matatastudio.com/static/privacy_policy_matatalab_zh.html"
          target="_blank"
          rel="noopener noreferrer"
          class="no-underline text-[#3366FF] cursor-pointer"
        >
          {{ t("auth.privacyPolicy") }}
        </a>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
const { $i18n } = useNuxtApp();
const t = (key: string) => $i18n.t(key);

defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
  "show-agreement": [];
  "show-privacy": [];
}>();
</script>

<style scoped>
.custom-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #808080;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
}

.custom-checkbox:checked {
  border-color: #808080;
  background: transparent;
}

.custom-checkbox:checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #0f67ff;
  border-radius: 50%;
}
</style>
