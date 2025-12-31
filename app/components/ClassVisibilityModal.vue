<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
      <button class="close-btn" @click="handleClose">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      
      <h2 class="modal-title">{{ $t('course.setVisibleClassTitle') }}</h2>
      
      <div class="tab-section">
        <span class="tab-label active">{{ $t('course.selectVisibleClass') }}</span>
        <span class="tab-hint">{{ $t('course.classTakenCourseHint') }}</span>
      </div>
      
      <div class="class-list">
        <label v-for="cls in classList" :key="cls.id" class="class-item">
          <input 
            type="checkbox" 
            :checked="selectedClasses.includes(cls.id)"
            @change="toggleClass(cls.id)"
            class="class-checkbox"
          />
          <span class="class-name">
            {{ cls.name }}
            <span v-if="cls.hasTakenCourse" class="taken-hint">{{ $t('course.classTakenCourse') }}</span>
          </span>
        </label>
      </div>
      
      <div class="modal-footer">
        <button class="btn-cancel" @click="handleClose">{{ $t('common.cancel') }}</button>
        <button class="btn-confirm" @click="handleConfirm">{{ $t('common.confirm') }}</button>
      </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'confirm'])

const classList = ref([
  { id: 1, name: '12年级333', hasTakenCourse: false },
  { id: 2, name: '1年级1111111', hasTakenCourse: true },
  { id: 3, name: '1年级22222', hasTakenCourse: false },
])

const selectedClasses = ref<number[]>([2])

const toggleClass = (id: number) => {
  const index = selectedClasses.value.indexOf(id)
  if (index > -1) {
    selectedClasses.value.splice(index, 1)
  } else {
    selectedClasses.value.push(id)
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm', selectedClasses.value)
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
  width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px;
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
  margin: 0 0 20px;
}

.tab-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.tab-label {
  font-size: 14px;
  color: #333;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 4px;
}
.tab-label.active {
  background: #FFF7E6;
  color: #FF9900;
  border: 1px solid #FF9900;
}

.tab-hint {
  font-size: 13px;
  color: #999;
}

.class-list {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.class-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  cursor: pointer;
}

.class-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #FF9900;
  cursor: pointer;
}

.class-name {
  font-size: 14px;
  color: #333;
}

.taken-hint {
  color: #999;
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.btn-cancel, .btn-confirm {
  padding: 10px 48px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.btn-cancel {
  background: white;
  border: 1px solid #FF9900;
  color: #FF9900;
}
.btn-cancel:hover {
  background: #FFF7E6;
}

.btn-confirm {
  background: #FF9900;
  border: 1px solid #FF9900;
  color: white;
}
.btn-confirm:hover {
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
