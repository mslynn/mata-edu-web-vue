<template>
  <Transition name="modal">
    <div v-if="visible" class="class-visibility-overlay" @click.self="handleClose">
      <div class="modal-container">
        <button class="class-visibility-close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        
        <h2 class="class-visibility-title">{{ $t('course.setVisibleClassTitle') }}</h2>
        
        <div class="tab-section">
          <span class="tab-label active">{{ $t('course.selectVisibleClass') }}</span>
          <span class="tab-hint">{{ $t('course.classTakenCourseHint') }}</span>
        </div>
        
        <div class="class-visibility-list">
          <div v-if="listLoading" class="class-visibility-empty">加载中...</div>
          <template v-else-if="classList.length > 0">
            <label v-for="cls in classList" :key="cls.id" class="class-visibility-item">
              <input 
                type="checkbox" 
                :checked="selectedClasses.includes(cls.id)"
                :disabled="cls.isClassed"
                @change="toggleClass(cls.id)"
                class="class-checkbox"
                :class="{ disabled: cls.isClassed }"
              />
              <span class="class-visibility-name">
                {{ cls.name }}
                <span v-if="cls.isClassed" class="taken-hint">{{ $t('course.classTakenCourse') }}</span>
              </span>
            </label>
          </template>
          <div v-else class="class-visibility-empty">暂无可见班级</div>
        </div>
        
        <div class="class-visibility-footer">
          <button class="class-visibility-btn-cancel" @click="handleClose">{{ $t('common.cancel') }}</button>
          <button class="class-visibility-btn-confirm" :disabled="loading" @click="handleConfirm">
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
const listLoading = ref(false)

const resetModalState = () => {
  classList.value = []
  selectedClasses.value = []
}

// 加载班级列表
const loadClassList = async () => {
  listLoading.value = true
  resetModalState()

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
  } finally {
    listLoading.value = false
  }
}

// 监听弹窗打开
watch(() => props.visible, (val) => {
  if (val) {
    loadClassList()
  } else {
    resetModalState()
    listLoading.value = false
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
.class-visibility-overlay {
  position: fixed;
  inset: 0;
  padding: 24px;
  background: rgba(12, 15, 16, 0.42);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  position: relative;
  width: min(680px, calc(100vw - 48px));
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 30px 34px 28px;
  background: #ffffff;
  border: 1px solid rgba(222, 227, 229, 0.96);
  border-radius: 24px;
  box-shadow: 0 18px 48px rgba(46, 51, 53, 0.12);
}

.class-visibility-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 999px;
  cursor: pointer;
  color: #8d9496;
  transition: all 0.2s ease;
}

.class-visibility-close-btn:hover {
  border-color: rgba(0, 91, 194, 0.18);
  background: #f8fbff;
  color: #005bc2;
}

.class-visibility-title {
  margin: 0 0 24px;
  text-align: center;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.tab-section {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 0;
}

.tab-label {
  padding: 10px 18px;
  color: #5a6062;
  font-size: 14px;
  font-weight: 700;
  background: #f4f8ff;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 14px 14px 0 0;
  border-bottom: none;
}

.tab-label.active {
  background: #ffffff;
  color: #005bc2;
  border-color: rgba(0, 91, 194, 0.18);
  margin-bottom: -1px;
  position: relative;
  z-index: 1;
}

.tab-hint {
  color: #8d9496;
  font-size: 13px;
  line-height: 1.6;
}

.class-visibility-list {
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 0 18px 18px 18px;
  min-height: 280px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.68);
}

.class-visibility-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  color: #8d9496;
  font-size: 14px;
}

.class-visibility-list::-webkit-scrollbar {
  width: 6px;
}

.class-visibility-list::-webkit-scrollbar-track {
  background: transparent;
}

.class-visibility-list::-webkit-scrollbar-thumb {
  background: rgba(174, 179, 181, 0.32);
  border-radius: 999px;
}

.class-visibility-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.class-visibility-item:hover {
  background: #f8fbff;
}

.class-checkbox {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border: 1.5px solid rgba(174, 179, 181, 0.9);
  border-radius: 6px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background: #ffffff;
  position: relative;
  transition: all 0.2s ease;
}

.class-checkbox:checked {
  background: #005bc2;
  border-color: #005bc2;
}

.class-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.class-checkbox:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.12);
}

.class-checkbox.disabled {
  background: #f2f4f5;
  border-color: rgba(174, 179, 181, 0.5);
  cursor: not-allowed;
}

.class-checkbox.disabled:checked {
  background: rgba(0, 91, 194, 0.32);
  border-color: rgba(0, 91, 194, 0.32);
}

.class-checkbox.disabled:checked::after {
  border-color: white;
}

.class-visibility-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2e3335;
}

.taken-hint {
  color: #8d9496;
  font-size: 12px;
  font-weight: 500;
}

.class-visibility-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(174, 179, 181, 0.14);
}

.class-visibility-btn-cancel,
.class-visibility-btn-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  min-height: 42px;
  padding: 0 22px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  appearance: none;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.class-visibility-btn-cancel {
  background: #ffffff;
  border: 1px solid rgba(0, 91, 194, 0.18);
  color: #005bc2;
}

.class-visibility-btn-cancel:hover {
  border-color: rgba(0, 91, 194, 0.28);
  background: rgba(0, 91, 194, 0.05);
}

.class-visibility-btn-confirm {
  background: #005bc2;
  border: 1px solid #005bc2;
  color: #ffffff;
}

.class-visibility-btn-confirm:hover {
  background: #004fa8;
  border-color: #004fa8;
}

.class-visibility-btn-confirm:disabled {
  background: #aeb3b5;
  border-color: #aeb3b5;
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

@media (max-width: 760px) {
  .class-visibility-overlay {
    padding: 16px;
  }

  .modal-container {
    width: 100%;
    padding: 24px 18px 20px;
    border-radius: 20px;
  }

  .tab-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .class-visibility-list {
    min-height: 220px;
    max-height: 320px;
    border-radius: 16px;
  }

  .class-visibility-footer {
    flex-direction: column;
  }

  .class-visibility-btn-cancel,
  .class-visibility-btn-confirm {
    width: 100%;
  }
}
</style>
