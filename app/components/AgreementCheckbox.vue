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
        我已阅读并同意，
        <a
          href="#"
          @click.prevent="$emit('show-agreement')"
          class="no-underline hover:underline text-[#3366FF] cursor-pointer"
        >
          《用户协议》
        </a>
        及
        <a
          href="#"
          @click.prevent="$emit('show-privacy')"
          class="no-underline hover:underline text-[#3366FF] cursor-pointer"
        >
          《隐私协议》
        </a>
      </span>
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'show-agreement': []
  'show-privacy': []
}>()
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
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #FFA54D;
  border-radius: 50%;
}
</style>

