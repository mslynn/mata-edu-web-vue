<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <button class="close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <h2 class="modal-title">{{ $t('course.courseEvaluation') }}</h2>
        
        <div class="evaluation-list">
          <div v-for="item in evaluationList" :key="item.id" class="evaluation-item">
            <div class="item-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7CB3F0" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <span class="item-name">
              {{ $t('course.codingTest') }} {{ item.id }} 
              <span class="distribute-text" :class="{ sent: item.distributed }">
                {{ item.distributed ? $t('course.distributed') : $t('course.notDistributed') }}
              </span>
            </span>
            <div class="hover-actions">
              <button class="hover-btn" @click="handleViewQuestions(item)">{{ $t('course.viewQuestions') }}</button>
              <button class="hover-btn" @click="handleSetExam(item)">{{ $t('course.setExam') }}</button>
              <button 
                class="hover-btn" 
                :class="{ disabled: !item.distributed }"
                :disabled="!item.distributed"
                @click="item.distributed && handleGrading(item)"
              >{{ $t('course.gradeExam') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- 设置考试弹窗 -->
  <SetExamModal v-model:visible="showSetExamModal" @submit="handleExamSubmit" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'distribute'])

const evaluationList = ref([
  { id: 1, distributed: true },
  { id: 2, distributed: false },
  { id: 3, distributed: true },
])

const handleClose = () => {
  emit('update:visible', false)
}

const handleDistribute = (item: any) => {
  emit('distribute', item)
}

const handleViewQuestions = (item: any) => {
  console.log('查看试题:', item)
}

const showSetExamModal = ref(false)
const handleSetExam = (item: any) => {
  showSetExamModal.value = true
}

const handleExamSubmit = (data: any) => {
  console.log('下发考试:', data)
}

const handleGrading = (item: any) => {
  console.log('批改试卷:', item)
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
  width: 800px;
  min-height: 300px;
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
  margin: 0 0 24px;
}

.evaluation-list {
  flex: 1;
}

.evaluation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.distribute-text {
  color: #FF6B6B;
  font-size: 13px;
  margin-left: 8px;
}
.distribute-text.sent {
  color: #52c41a;
}

.hover-actions {
  display: none;
  gap: 8px;
  margin-left: auto;
}

.evaluation-item:hover .hover-actions {
  display: flex;
}

.evaluation-item:hover {
  background: #f5f9ff;
  margin: 0 -16px;
  padding: 16px;
  border-radius: 8px;
}

.hover-btn {
  padding: 6px 16px;
  background: white;
  border: 1px solid #FF9900;
  border-radius: 20px;
  color: #FF9900;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.hover-btn:hover {
  background: #FFF7E6;
}
.hover-btn.disabled {
  border-color: #ddd;
  color: #ccc;
  cursor: not-allowed;
}
.hover-btn.disabled:hover {
  background: white;
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
