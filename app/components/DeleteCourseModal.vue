<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-container">
        <button class="close-btn" @click="handleCancel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <h2 class="modal-title">删除课程提醒</h2>
        
        <p class="modal-content">
          删除后无法恢复，师生均无法再查看课程是否确认删除？
        </p>
        
        <div class="modal-footer">
          <button class="btn-delete" @click="handleConfirm">删除课程</button>
          <button class="btn-cancel" @click="handleCancel">再想想</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'confirm'])

const handleCancel = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 420px;
  padding: 24px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
}
.close-btn:hover { color: #666; }

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0 0 24px;
}

.modal-content {
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 1.8;
  margin: 0 0 32px;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-delete, .btn-cancel {
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-delete {
  background: white;
  border: 1px solid #FF9900;
  color: #FF9900;
}
.btn-delete:hover {
  background: #FFF7E6;
}

.btn-cancel {
  background: #FF9900;
  border: 1px solid #FF9900;
  color: white;
}
.btn-cancel:hover {
  background: #E68A00;
}

/* 弹窗动画 */
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
