<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <el-config-provider :locale="zhCn">
      <div class="modal-container">
        <button class="close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <h2 class="modal-title">设置考试</h2>
        
        <div class="modal-body">
          <!-- 左侧班级树 -->
          <div class="class-tree">
            <div v-for="grade in gradeList" :key="grade.id" class="grade-item">
              <div class="grade-header" @click="toggleGrade(grade.id)">
                <svg class="arrow-icon" :class="{ expanded: expandedGrades.includes(grade.id) }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span>{{ grade.name }}</span>
              </div>
              <div v-if="expandedGrades.includes(grade.id)" class="class-list">
                <div 
                  v-for="cls in grade.classes" 
                  :key="cls.id" 
                  class="class-item"
                  :class="{ active: selectedClass === cls.id }"
                  @click="selectClass(cls)"
                >
                  <span class="status-tag" :class="cls.status">{{ cls.status === 'sent' ? '已下发' : '未下发' }}</span>
                  <span class="class-name">{{ cls.name }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧表单/详情 -->
          <div class="exam-form">
            <!-- 未下发：显示表单 -->
            <template v-if="!currentClassSent">
              <div class="form-item">
                <label class="form-label">考试日期</label>
                <el-date-picker
                  v-model="examForm.date"
                  type="date"
                  placeholder="考试日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disabledDate"
                  style="width: 100%"
                />
              </div>
              
              <div class="form-item">
                <label class="form-label">考试时间</label>
                <el-time-picker
                  v-model="examForm.time"
                  placeholder="考试时间"
                  format="HH:mm"
                  value-format="HH:mm"
                  style="width: 100%"
                />
              </div>
              
              <div class="form-item">
                <label class="form-label">考试时长</label>
                <input type="text" v-model="examForm.duration" placeholder="分钟" class="form-input" />
              </div>
            </template>
            
            <!-- 已下发：显示详情 -->
            <template v-else>
              <div class="form-item">
                <label class="form-label">考试日期</label>
                <div class="form-value">{{ currentClassData?.date || '-' }}</div>
              </div>
              
              <div class="form-item">
                <label class="form-label">考试时间</label>
                <div class="form-value">{{ currentClassData?.time || '-' }}</div>
              </div>
              
              <div class="form-item">
                <label class="form-label">考试时长</label>
                <div class="form-value">{{ currentClassData?.duration ? currentClassData.duration + '分钟' : '-' }}</div>
              </div>
            </template>
          </div>
        </div>
        
        <div class="modal-footer">
          <button v-if="!currentClassSent" class="btn-submit" @click="handleSubmit">下发考试</button>
          <button v-else class="btn-withdraw" @click="handleWithdraw">撤回考试</button>
        </div>
      </div>
      </el-config-provider>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible', 'submit'])

const gradeList = ref([
  {
    id: 1,
    name: '1年级',
    classes: [
      { id: 1, name: '1年级1班', status: 'unsent' },
      { id: 2, name: '1年级2班', status: 'sent' },
      { id: 3, name: '1年级3班', status: 'unsent' },
    ]
  },
  {
    id: 2,
    name: '2年级',
    classes: [
      { id: 4, name: '2年级1班', status: 'sent' },
      { id: 5, name: '2年级2班', status: 'unsent' },
    ]
  },
  {
    id: 3,
    name: '3年级',
    classes: [
      { id: 6, name: '3年级1班', status: 'unsent' },
      { id: 7, name: '3年级2班', status: 'sent' },
      { id: 8, name: '3年级3班', status: 'unsent' },
    ]
  },
])

const expandedGrades = ref<number[]>([1])
const selectedClass = ref<number | null>(1)

// 存储每个班级的考试数据
const classExamData = ref<Record<number, { date: string; time: string; duration: string }>>({
  2: { date: '2025-01-15', time: '09:00', duration: '60' },
  4: { date: '2025-01-16', time: '14:00', duration: '90' },
  7: { date: '2025-01-17', time: '10:00', duration: '45' },
})

const examForm = reactive({
  date: '',
  time: '',
  duration: ''
})

// 当前选中班级是否已下发
const currentClassSent = computed(() => {
  if (!selectedClass.value) return false
  for (const grade of gradeList.value) {
    const cls = grade.classes.find(c => c.id === selectedClass.value)
    if (cls) return cls.status === 'sent'
  }
  return false
})

// 当前选中班级的考试数据
const currentClassData = computed(() => {
  if (!selectedClass.value) return null
  return classExamData.value[selectedClass.value] || null
})

const toggleGrade = (gradeId: number) => {
  const index = expandedGrades.value.indexOf(gradeId)
  if (index > -1) {
    expandedGrades.value.splice(index, 1)
  } else {
    expandedGrades.value.push(gradeId)
  }
}

const selectClass = (cls: { id: number; name: string }) => {
  selectedClass.value = cls.id
  // 切换班级时清空表单
  examForm.date = ''
  examForm.time = ''
  examForm.duration = ''
}

const handleClose = () => {
  emit('update:visible', false)
}

// 下发考试
const handleSubmit = () => {
  if (!selectedClass.value) return
  
  // 保存考试数据
  classExamData.value[selectedClass.value] = {
    date: examForm.date,
    time: examForm.time,
    duration: examForm.duration
  }
  
  // 更新班级状态为已下发
  for (const grade of gradeList.value) {
    const cls = grade.classes.find(c => c.id === selectedClass.value)
    if (cls) {
      cls.status = 'sent'
      break
    }
  }
  
  emit('submit', {
    classId: selectedClass.value,
    ...examForm
  })
}

// 检查是否可以撤回（考试时间未到）
const canWithdraw = computed(() => {
  if (!selectedClass.value || !currentClassData.value) return true
  const { date, time } = currentClassData.value
  if (!date || !time) return true
  const examDateTime = new Date(`${date} ${time}`).getTime()
  return Date.now() < examDateTime
})

// 撤回考试
const handleWithdraw = () => {
  if (!selectedClass.value) return
  
  // 检查是否超过考试时间
  if (!canWithdraw.value) {
    ElMessage.warning('考试时间已过，无法撤回')
    return
  }
  
  // 删除考试数据
  delete classExamData.value[selectedClass.value]
  
  // 更新班级状态为未下发
  for (const grade of gradeList.value) {
    const cls = grade.classes.find(c => c.id === selectedClass.value)
    if (cls) {
      cls.status = 'unsent'
      break
    }
  }
}

// 禁用今天之前的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
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
  width: 650px;
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

.modal-body {
  display: flex;
  gap: 24px;
  min-height: 300px;
}

.class-tree {
  width: 240px;
  flex-shrink: 0;
  max-height: 350px;
  overflow-y: auto;
}

.grade-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.arrow-icon {
  transition: transform 0.2s;
}
.arrow-icon.expanded {
  transform: rotate(180deg);
}

.class-list {
  padding-left: 24px;
}

.class-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  border-left: 3px solid transparent;
}
.class-item:hover {
  background: #FFF7E6;
}
.class-item.active {
  background: #E6F4FF;
  border-left-color: #40a9ff;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-tag.unsent {
  background: #FFF0F0;
  color: #FF6B6B;
}
.status-tag.sent {
  background: #E6FFE6;
  color: #52c41a;
}

.class-name {
  font-size: 14px;
  color: #333;
}

.exam-form {
  flex: 1;
  padding-left: 24px;
  border-left: 1px solid #f0f0f0;
}

.form-item {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #FF9900;
}
.form-input::placeholder {
  color: #bbb;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #ddd inset;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #FF9900 inset;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #FF9900 inset;
}

.modal-footer {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.btn-submit {
  padding: 12px 48px;
  background: #FF9900;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
.btn-submit:hover {
  background: #E68A00;
}

.btn-withdraw {
  padding: 12px 48px;
  background: white;
  border: 1px solid #FF9900;
  border-radius: 6px;
  color: #FF9900;
  font-size: 14px;
  cursor: pointer;
}
.btn-withdraw:hover {
  background: #FFF7E6;
}

.form-value {
  padding: 10px 12px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
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
