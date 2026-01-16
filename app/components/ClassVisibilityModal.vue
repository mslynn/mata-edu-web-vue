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
              :disabled="cls.isClassed"
              @change="toggleClass(cls.id)"
              class="class-checkbox"
              :class="{ disabled: cls.isClassed }"
            />
            <span class="class-name">
              {{ cls.name }}
              <span v-if="cls.isClassed" class="taken-hint">（该班级已经上过当前课程）</span>
            </span>
          </label>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancel" @click="handleClose">{{ $t('common.cancel') }}</button>
          <button class="btn-confirm" :disabled="loading" @click="handleConfirm">
            {{ loading ? '保存中...' : $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { cursorAdmin } from '~/composables/api/curosr'

const props = defineProps<{
  visible: boolean
  courseId: string | number
}>()

const emit = defineEmits(['update:visible', 'confirm'])

const { setChapterResourceVisibleClass, GetChapterCourse } = cursorAdmin()

const classList = ref<{ id: string; name: string; isClassed: boolean }[]>([])
const selectedClasses = ref<string[]>([])
const loading = ref(false)

// 加载班级列表
const loadClassList = async () => {
  try {
    const res = await GetChapterCourse(String(props.courseId))
    const data = res.data
    if (data && Array.isArray(data)) {
      classList.value = data.map((item: any) => ({
        id: String(item.classId || item.id),
        name: item.className,
        isClassed: item.isClassed === 1 // 已上过课程，不可取消
      }))
      // isClassed == 1 或 type == 1 的自动勾选
      selectedClasses.value = data
        .filter((item: any) => item.isClassed === 1 || item.type === 1)
        .map((item: any) => String(item.classId || item.id))
    }
  } catch (error) {
    console.error('加载班级列表失败:', error)
  }
}

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    loadClassList()
  }
})

const toggleClass = (id: string) => {
  const cls = classList.value.find(c => c.id === id)
  if (cls?.isClassed) return // isClassed == 1 不可取消
  
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

const handleConfirm = async () => {
  loading.value = true
  try {
    // 过滤掉 isClassed == 1 的班级，只提交可编辑的班级
    const submitClassIds = selectedClasses.value.filter(id => {
      const cls = classList.value.find(c => c.id === id)
      return !cls?.isClassed
    })
    
    await setChapterResourceVisibleClass({
      courseId: String(props.courseId),
      classIds: submitClassIds
    })
    emit('confirm', selectedClasses.value)
    emit('update:visible', false)
  } catch (error) {
    console.error('设置可见班级失败:', error)
  } finally {
    loading.value = false
  }
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
  border-radius: 14px;
  width: 665px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 30px 40px;
  box-shadow: 0 0 19px 1px rgba(145, 145, 145, 0.2);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
}
.close-btn:hover { color: #666; }

.modal-title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin: 0 0 24px;
}

.tab-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 0;
}

.tab-label {
  font-size: 14px;
  color: #333;
  padding: 10px 20px;
  background: #f5f5f5;
  border-radius: 8px 8px 0 0;
  border: 1px solid #eee;
  border-bottom: none;
}
.tab-label.active {
  background: white;
  color: #333;
  border: 1px solid #ddd;
  border-bottom: 1px solid white;
  margin-bottom: -1px;
  position: relative;
  z-index: 1;
}

.tab-hint {
  font-size: 13px;
  color: #999;
}

.class-list {
  background: white;
  border: 1px solid #ddd;
  border-radius: 0 8px 8px 8px;
  padding: 16px 20px;
  min-height: 280px;
  max-height: 400px;
  overflow-y: auto;
}

.class-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  cursor: pointer;
}

.class-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background: white;
  position: relative;
}

.class-checkbox:checked {
  background: #FF9900;
  border-color: #FF9900;
}

.class-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.class-checkbox.disabled {
  background: #ddd;
  border-color: #ddd;
  cursor: not-allowed;
}

.class-checkbox.disabled:checked {
  background: #ddd;
  border-color: #ddd;
}

.class-checkbox.disabled:checked::after {
  border-color: white;
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
  gap: 20px;
  margin-top: 30px;
}

.btn-cancel, .btn-confirm {
  min-width: 120px;
  padding: 12px 40px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.btn-cancel {
  background: white;
  border: 1px solid #ddd;
  color: #666;
}
.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-confirm {
  background: #FF9900;
  border: 1px solid #FF9900;
  color: white;
}
.btn-confirm:hover {
  background: #E68A00;
}
.btn-confirm:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
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
