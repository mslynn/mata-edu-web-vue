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
          <div v-if="loading" class="empty-state">加载中...</div>
          <div v-else-if="loadError" class="empty-state">{{ loadError }}</div>
          <div v-else-if="evaluationList.length === 0" class="empty-state">暂无课程测评</div>
          <template v-else>
            <div v-for="item in evaluationList" :key="item.exerciseId" class="evaluation-item">
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
                {{ item.exerciseName }}
                <span class="distribute-text" :class="getStatusClass(item.status)">
                  {{ getStatusText(item.status) }}
                </span>
              </span>
              <div class="hover-actions">
                <button class="hover-btn" @click="handleViewQuestions(item)">{{ $t('course.viewQuestions') }}</button>
                <button class="hover-btn" @click="handleSetExam(item)">{{ $t('course.setExam') }}</button>
                <button class="hover-btn" :class="{ disabled: !canGrade(item.status) }"
                  :disabled="!canGrade(item.status)" @click="canGrade(item.status) && handleGrading(item)">
                  {{ $t('course.gradeExam') }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
  
  <!-- 设置考试弹窗 -->
  <SetExamModal v-model:visible="showSetExamModal" :course-id="props.courseId"
    :exercise-id="currentSetExamExerciseId" @submit="handleExamSubmit" @withdraw="handleExamWithdraw" />
  <ExerciseDetailModal v-model="showExerciseDetailModal" :exercise-id="currentExerciseId"
    detail-source="courseEvaluation" />
  <SelectGradingClassModal
    v-model:visible="showGradingClassModal"
    :loading="gradingClassLoading"
    :options="gradingClassOptions"
    @select="handleGradingClassSelect"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { cursorAdmin } from '~/composables/api/curosr'

interface CourseEvaluationItem {
  courseId: number | string
  exerciseId: string
  exerciseName: string
  status: number
}

const props = defineProps<{
  visible: boolean
  courseId: string
}>()

const emit = defineEmits(['update:visible', 'distribute'])

const { getCourseEvaluationList, startDistribute, withdrawExam, getChapterExerciseclass } = cursorAdmin()

const evaluationList = ref<CourseEvaluationItem[]>([])
const loading = ref(false)
const loadError = ref('')
const showExerciseDetailModal = ref(false)
const currentExerciseId = ref<string | null>(null)
const currentSetExamExerciseId = ref<string | null>(null)
const showGradingClassModal = ref(false)
const gradingClassLoading = ref(false)
const gradingClassOptions = ref<{ value: string; label: string }[]>([])
const currentGradingExerciseId = ref<string | null>(null)

const normalizeGradingClassOptions = (data: any) => {
  const classList = (Array.isArray(data) ? data : []).flatMap((item: any) => {
    if (Array.isArray(item?.classList)) {
      return item.classList
    }
    return item ? [item] : []
  })

  const seenClassIds = new Set<string>()

  return classList
    .filter((cls: any) => {
      if (cls?.status === null || cls?.status === undefined || cls?.status === '') {
        return true
      }
      return Number(cls.status) === 1
    })
    .map((cls: any) => {
      const classId = String(cls?.classId ?? cls?.id ?? '')
      const className = String(cls?.className ?? cls?.name ?? '')

      if (!classId || !className || seenClassIds.has(classId)) {
        return null
      }

      seenClassIds.add(classId)
      return {
        value: classId,
        label: className
      }
    })
    .filter((option): option is { value: string; label: string } => !!option)
}

const handleClose = () => {
  emit('update:visible', false)
}

const loadEvaluationData = async () => {
  if (!props.courseId) {
    evaluationList.value = []
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    const data = await getCourseEvaluationList(props.courseId)
    evaluationList.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载课程测评列表失败:', error)
    loadError.value = '加载课程测评列表失败'
    evaluationList.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    loadEvaluationData()
  }
})

watch(() => props.courseId, () => {
  if (props.visible) {
    loadEvaluationData()
  }
})

const handleDistribute = (item: any) => {
  emit('distribute', item)
}

const getStatusText = (status: number) => {
  if (status === 2) return '全部下发'
  if (status === 1) return '部分下发'
  return '未下发'
}

const getStatusClass = (status: number) => {
  if (status === 2) return 'sent'
  if (status === 1) return 'partial'
  return ''
}

const canGrade = (status: number) => status !== 0

const handleViewQuestions = (item: any) => {
  currentExerciseId.value = String(item.exerciseId || '')
  showExerciseDetailModal.value = !!currentExerciseId.value
}

const showSetExamModal = ref(false)
const handleSetExam = (item: any) => {
  currentSetExamExerciseId.value = String(item.exerciseId || '')
  showSetExamModal.value = !!currentSetExamExerciseId.value
}

const handleExamSubmit = async (data: any) => {
  try {
    await startDistribute(data)
    ElMessage.success('下发测评成功')
    showSetExamModal.value = false
    await loadEvaluationData()
    handleDistribute(data)
  } catch (error) {
    console.error('下发测评失败:', error)
    ElMessage.error('下发测评失败')
  }
}

const handleExamWithdraw = async (data: any) => {
  try {
    await withdrawExam(data)
    ElMessage.success('撤回测评成功')
    showSetExamModal.value = false
    await loadEvaluationData()
  } catch (error) {
    console.error('撤回测评失败:', error)
    ElMessage.error('撤回测评失败')
  }
}

const handleGrading = async (item: any) => {
  if (!props.courseId || !item?.exerciseId) return

  currentGradingExerciseId.value = String(item.exerciseId)
  gradingClassLoading.value = true
  gradingClassOptions.value = []
  showGradingClassModal.value = true

  try {
    const data = await getChapterExerciseclass({
      courseId: props.courseId,
      exerciseId: String(item.exerciseId)
    })

    gradingClassOptions.value = normalizeGradingClassOptions(data)
  } catch (error) {
    console.error('加载批改班级失败:', error)
    gradingClassOptions.value = []
    ElMessage.error('加载批改班级失败')
  } finally {
    gradingClassLoading.value = false
  }
}

const handleGradingClassSelect = async (option: { value: string; label: string }) => {
  await navigateTo({
    path: "/taskmanagement",
    query: {
      tab: "assessment",
      classId: option.value,
      courseId: String(props.courseId || ""),
      exerciseId: String(currentGradingExerciseId.value || ""),
    },
  })
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

.distribute-text.partial {
  color: #fa8c16;
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

.empty-state {
  padding: 48px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
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
