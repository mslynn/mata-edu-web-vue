<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('update:visible', false)">
        <div class="modal-container">
          <!-- 左上角装饰 -->
          <div class="corner-decoration top-left"></div>
          <!-- 右上角装饰 -->
          <div class="corner-decoration top-right"></div>

          <!-- 标题 -->
          <h2 class="modal-title">请找到你的账号，点击进行登录</h2>
          
          <!-- 提示 -->
          <p class="modal-tip">如你的账号已经登录，请告知教师帮忙踢人处理</p>

          <!-- 学生列表 -->
          <div class="student-grid">
            <div 
              v-for="student in studentList" 
              :key="student.id"
              class="student-card"
              :class="{ 'is-online': student.loginStatus === 1, 'is-disabled': student.loginStatus === 1 }"
              @click="handleSelectStudent(student)"
            >
              <!-- 已登录标签 -->
              <span v-if="student.loginStatus === 1" class="online-tag">已登录</span>
              <div class="student-info">
                <p class="info-row"><span class="label">姓名：</span><span class="value">{{ student.studentName }}</span></p>
                <p class="info-row"><span class="label">账号：</span><span class="value">{{ student.studentNumber }}</span></p>
              </div>
            </div>
          </div>

          <!-- 左下角装饰 -->
          <div class="corner-decoration bottom-left"></div>
          <!-- 右下角装饰 -->
          <div class="corner-decoration bottom-right"></div>
        </div>
      </div>
    </Transition>

    <!-- 确认登录弹窗 -->
    <Transition name="modal-fade">
      <div v-if="showConfirm" class="modal-overlay" @click.self="cancelConfirm">
        <div class="confirm-container">
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="cancelConfirm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="#999" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <!-- 左上角装饰 -->
          <div class="corner-decoration top-left"></div>
          <!-- 右上角装饰 -->
          <div class="corner-decoration top-right"></div>
          
          <h3 class="confirm-title">确认登录</h3>
          <p class="confirm-text">你的姓名是{{ selectedStudent?.studentName }}，对吗？</p>
          
          <div class="confirm-buttons">
            <button class="btn-cancel" @click="cancelConfirm">取消</button>
            <button class="btn-confirm" @click="confirmLogin">确定</button>
          </div>

          <!-- 左下角装饰 -->
          <div class="corner-decoration bottom-left"></div>
          <!-- 右下角装饰 -->
          <div class="corner-decoration bottom-right"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Student {
  id: string
  studentName: string
  studentNumber: string
  loginStatus?: number
}

interface Props {
  visible: boolean
  studentList: Student[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'select': [student: Student]
}>()

const showConfirm = ref(false)
const selectedStudent = ref<Student | null>(null)

const handleSelectStudent = (student: Student) => {
  // 已登录的学生不能被选中
  if (student.loginStatus === 1) return
  selectedStudent.value = student
  showConfirm.value = true
}

const cancelConfirm = () => {
  showConfirm.value = false
  selectedStudent.value = null
}

const confirmLogin = () => {
  if (selectedStudent.value) {
    emit('select', selectedStudent.value)
  }
  showConfirm.value = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  position: relative;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 40px 50px;
  overflow-y: auto;
}

.corner-decoration {
  position: absolute;
}
.top-left { top: 10px; left: 10px; }
.top-right { top: 10px; right: 10px; }
.bottom-left { bottom: 10px; left: 10px; }
.bottom-right { bottom: 10px; right: 10px; }

.modal-title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.modal-tip {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .student-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .student-grid {
    grid-template-columns: 1fr;
  }
}

.student-card {
  position: relative;
  background: #F5F5F5;
  border: 1px dashed #D9D9D9;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.student-card:hover {
  background: #FEE7BC;
  border-color: #FF9900;
}

.student-card.is-disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.student-card.is-disabled:hover {
  background: #FFF7E6;
  border-color: #FFD591;
}

.student-card.is-online {
  background: #FFF7E6;
  border-color: #FFD591;
  border-style: solid;
}

.online-tag {
  position: absolute;
  top: 0;
  right: 0;
  background: #FF9900;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 0 8px 0 8px;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  font-size: 14px;
  color: #666;
  margin: 0;
  display: flex;
}

.info-row .label {
  color: #999;
  flex-shrink: 0;
}

.info-row .value {
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 确认弹窗 */
.confirm-container {
  position: relative;
  width: 400px;
  background: linear-gradient(180deg, #E8F4FC 0%, #FFFFFF 100%);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  border: 1px dashed #D9D9D9;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  border-color: #999;
}

.confirm-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
}

.confirm-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
}

.confirm-buttons {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.btn-cancel,
.btn-confirm {
  width: 120px;
  height: 44px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: transparent;
  border: 1px dashed #D9D9D9;
  color: #666;
}

.btn-cancel:hover {
  border-color: #999;
  color: #333;
}

.btn-confirm {
  background: #FF9900;
  border: 1px solid #FF9900;
  color: white;
}

.btn-confirm:hover {
  background: #E68A00;
  border-color: #E68A00;
}
</style>
