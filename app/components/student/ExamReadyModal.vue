<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="exam-ready-overlay">
        <div class="exam-ready-backdrop" @click="handleClose"></div>
        <div class="exam-ready-modal">
          <button class="exam-ready-close" @click="handleClose" aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h3 class="exam-ready-title">考试准备提示</h3>
          <p class="exam-ready-desc">考试即将开始，请做好准备。</p>

          <div class="exam-ready-info">
            <div class="exam-ready-line">
              <span class="exam-ready-label">考试内容：</span>
              <span class="exam-ready-value">{{ evaluationName || "-" }}</span>
            </div>
            <div class="exam-ready-line">
              <span class="exam-ready-label">考试时间：</span>
              <span class="exam-ready-value">{{ examTime || "-" }}</span>
            </div>
          </div>

          <button class="exam-ready-btn" @click="handleConfirm">准备考试</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  evaluationName?: string
  examTime?: string
}>()

const emit = defineEmits<{
  "update:visible": [value: boolean]
  confirm: []
}>()

const handleClose = () => {
  emit("update:visible", false)
}

const handleConfirm = () => {
  emit("confirm")
  emit("update:visible", false)
}
</script>

<style scoped>
.exam-ready-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exam-ready-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.exam-ready-modal {
  position: relative;
  z-index: 1;
  width: min(420px, calc(100vw - 32px));
  border-radius: 16px;
  background: #fff;
  padding: 34px 36px 32px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
  text-align: center;
}

.exam-ready-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.exam-ready-close:hover {
  background: #f5f5f5;
  color: #666;
}

.exam-ready-title {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  line-height: 1.4;
  font-weight: 700;
}

.exam-ready-desc {
  margin: 18px 0 0;
  color: #374151;
  font-size: 15px;
  line-height: 1.7;
}

.exam-ready-info {
  margin-top: 18px;
}

.exam-ready-line + .exam-ready-line {
  margin-top: 10px;
}

.exam-ready-line {
  color: #6b7280;
  font-size: 15px;
  line-height: 1.7;
}

.exam-ready-label {
  color: #6b7280;
}

.exam-ready-value {
  color: #4b5563;
}

.exam-ready-btn {
  min-width: 130px;
  height: 42px;
  margin-top: 28px;
  padding: 0 24px;
  border-radius: 10px;
  background: linear-gradient(180deg, #72e85d 0%, #66dd55 100%);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(102, 221, 85, 0.22);
  transition: all 0.2s ease;
}

.exam-ready-btn:hover {
  background: linear-gradient(180deg, #67df56 0%, #5fd34f 100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
