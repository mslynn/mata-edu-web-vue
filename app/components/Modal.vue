<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="handleCancel">
        <div class="modal-container">
          <!-- 标题 -->
          <div class="modal-header">
            <h2 class="modal-title">{{ t(title) }}</h2>
          </div>

          <!-- 内容区域 -->
          <div class="modal-content">
            <slot>
              <p>{{ content }}</p>
            </slot>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button 
              class="modal-btn modal-btn-cancel hover:opacity-80 hover:bg-gray-100 transition-all"
              @click="handleCancel"
            >
              {{ t(cancelText) }}
            </button>
            <button 
              class="modal-btn modal-btn-confirm hover:opacity-90 transition-all" 
              @click="handleConfirm"
            >
              {{ t(confirmText) }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">

import { useI18n } from 'vue-i18n';

const { t } = useI18n(); 

interface Props {
  modelValue: boolean;
  title?: string;
  content?: string;
  cancelText?: string;
  confirmText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "tool.tips",
  content: "",
  cancelText: "common.cancel",
  confirmText: "common.confirm",
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  confirm: [];
  cancel: [];
}>();

const handleConfirm = () => {
  emit("confirm");
  emit("update:modelValue", false);
};

const handleCancel = () => {
  emit("cancel");
  emit("update:modelValue", false);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 30px;
  width: 400px;
  height: 264px;
  max-width: 90vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding-top: 24px;
  padding-left: 40px;
  padding-right: 40px;
  text-align: center;
  position: relative;
  flex-shrink: 0;
}

.modal-title {
  min-width: 40px;
  height: 20px;
  margin: 0 auto;
  font-family: jiangchengyuanti-400W, jiangchengyuanti-400W;
  font-weight: normal;
  font-size: 20px;
  color: #808080;
  line-height: 24px;
  letter-spacing: 10px;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin-bottom: 20px;
}

.modal-content {
  width: 307px;
height: 16px;
font-family: jiangchengyuanti-400W, jiangchengyuanti-400W;
font-weight: normal;
font-size: 16px;
color: #808080;
line-height: 19px;

text-align: center;
font-style: normal;
text-transform: none;
margin: auto;
margin-bottom: 80px;
}
.text-center p {
  font-size: 18px;
  
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 0 40px 24px;
  flex-shrink: 0;
}

.modal-btn {
  flex: 1;
  padding: 12px 24px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px dashed #d0d0d0;
}

.modal-btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.modal-btn-cancel:hover {
  background: #e8e8e8;
}

.modal-btn-confirm {
  background: #0f67ff;
  color: white;
  border-color: #0f67ff;
}

.modal-btn-confirm:hover:not(:disabled) {
  background: #0d61dd;
}

.modal-btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-checkbox-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.modal-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid #808080;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  appearance: none;
  -webkit-appearance: none;
}

.modal-checkbox:checked {
  border-color: #808080;
  background: transparent;
}

.modal-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #0f67ff;
  border-radius: 50%;
}

.modal-checkbox-text {
  font-size: 14px;
  color: #808080;
  user-select: none;
}

/* 动画效果 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}
</style>
