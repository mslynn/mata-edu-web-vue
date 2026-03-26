<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-[1000] flex items-center justify-center">
        <!-- 遮罩 -->
        <div class="absolute inset-0 bg-black/50" @click="close" />
        
        <!-- 弹窗主体 -->
        <div class="relative w-[90%] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <!-- 关闭按钮 - 左上角 -->
          <button 
            class="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center text-white bg-red-400 hover:bg-red-500 rounded-full transition-colors shadow"
            @click="close"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <template v-if="displayData">
            <!-- 标题栏 -->
            <div class="py-4 px-10 text-center shrink-0 relative">
              <h2 class="text-lg font-bold text-gray-800">
                {{ displayTitle }}
              </h2>
              <!-- 学生信息 - 右上角 -->
              <div v-if="taskInfo" class="absolute top-3 right-10 border border-[#FF9900] rounded-md px-3 py-1.5 text-sm">
                <span class="text-[#FF9900]">{{ taskInfo.studentName }}：{{ taskInfo.score }}{{ $t('customExercise.scoreUnit') }}</span>
              </div>
            </div>

            <!-- 题目列表 -->
            <div class="flex-1 overflow-y-auto px-10 pb-6">
              <div class="space-y-4">
                <div 
                  v-for="(q, index) in displayData.questions" 
                  :key="index"
                  class="border border-gray-200 rounded-lg p-6 relative"
                >
                  <!-- 每题得分 - 右上角 -->
                  <div v-if="q.studentAnswer" class="absolute top-4 right-6 text-sm border border-[#FF9900] rounded px-2 py-0.5 text-[#FF9900]">
                    {{ q.studentAnswer.score }}{{ $t('customExercise.scoreUnit') }}
                  </div>

                  <!-- 题干 -->
                  <div class="mb-4 pr-16">
                    <span class="font-medium text-gray-800">{{ q.sequence || (Number(index) + 1) }}. {{ q.questionName }}</span>
                    <span class="text-gray-500 ml-1">({{ q.score }}{{ $t('customExercise.scoreUnit') }})</span>
                  </div>

                  <!-- 题目图片 -->
                  <div v-if="q.imageUrl" class="mb-3">
                    <img :src="q.imageUrl" class="max-w-[300px] max-h-[200px] rounded border border-gray-100" />
                  </div>

                  <!-- 单选/多选/判断题选项 -->
                  <div v-if="q.questionType === 'single' || q.questionType === 'multiple' || q.questionType === 'judge'" class="space-y-3 ml-4">
                    <div 
                      v-for="(opt, optIdx) in q.options" 
                      :key="optIdx"
                      class="flex items-center gap-2"
                    >
                      <!-- 单选圆圈 -->
                      <span v-if="q.questionType === 'single' || q.questionType === 'judge'" 
                        class="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                        :class="isStudentSelected(q, opt) 
                          ? 'border-[#FF9900]' 
                          : 'border-gray-300'"
                      >
                        <span v-if="isStudentSelected(q, opt)" class="w-2 h-2 rounded-full bg-[#FF9900]"></span>
                      </span>
                      <!-- 多选方框 -->
                      <span v-else 
                        class="w-4 h-4 rounded-sm border-2 shrink-0 flex items-center justify-center"
                        :class="isStudentSelected(q, opt) 
                          ? 'border-[#FF9900]' 
                          : 'border-gray-300'"
                      >
                        <svg v-if="isStudentSelected(q, opt)" class="w-2.5 h-2.5 text-[#FF9900]" viewBox="0 0 10 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 4L3.5 6.5L9 1"/>
                        </svg>
                      </span>
                      <span class="text-sm text-gray-700">{{ opt.optionLabel }}. </span>
                      <span v-if="opt.optionText" class="text-sm text-gray-700">{{ opt.optionText }}</span>
                      <img v-if="opt.imageUrl" :src="opt.imageUrl" class="max-w-[120px] max-h-[80px] rounded border border-gray-100" />
                    </div>
                  </div>

                  <!-- 填空题 -->
                  <div v-else-if="q.questionType === 'blank'" class="ml-4 space-y-1">
                    <div v-for="(ans, aIdx) in q.answers" :key="aIdx" class="text-sm text-gray-600">
                      {{ $t('customExercise.blankLabel') }}{{ Number(aIdx) + 1 }}：
                      <span v-if="getStudentBlankAnswer(q, Number(aIdx) + 1)" class="text-[#FF9900] font-medium">{{ getStudentBlankAnswer(q, Number(aIdx) + 1) }}</span>
                      <span v-else class="inline-block w-20 border-b border-gray-300">&nbsp;</span>
                    </div>
                  </div>

                  <!-- 连线题 -->
                  <div v-else-if="q.questionType === 'connect'" class="ml-4">
                    <div class="flex gap-12">
                      <div class="space-y-2">
                        <div v-for="(opt, oIdx) in getSourceOptions(q)" :key="oIdx" class="flex items-center gap-2 text-sm text-gray-700 min-h-8">
                          <span>{{ getConnectDisplayLabel(q, opt) }}.</span>
                          <span v-if="opt.optionText">{{ opt.optionText }}</span>
                          <img
                            v-if="opt.imageUrl"
                            :src="opt.imageUrl"
                            class="max-w-[120px] max-h-[80px] rounded border border-gray-100"
                          />
                        </div>
                      </div>
                      <div class="space-y-2">
                        <div v-for="(opt, oIdx) in getTargetOptions(q)" :key="oIdx" class="flex items-center gap-2 text-sm text-gray-700 min-h-8">
                          <span>{{ getConnectDisplayLabel(q, opt) }}.</span>
                          <span v-if="opt.optionText">{{ opt.optionText }}</span>
                          <img
                            v-if="opt.imageUrl"
                            :src="opt.imageUrl"
                            class="max-w-[120px] max-h-[80px] rounded border border-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                    <!-- 学生连线答案 -->
                    <div v-if="q.studentAnswer?.connectAnswers" class="mt-2 text-sm text-[#FF9900]">
                      <span v-for="(ca, caIdx) in q.studentAnswer.connectAnswers" :key="caIdx" class="mr-3">
                        {{ getOptionLabel(q, ca.sourceOptionId) }} → {{ getOptionLabel(q, ca.targetOptionId) }}
                      </span>
                    </div>
                  </div>

                  <!-- 答案解析按钮 -->
                  <div class="mt-4 flex justify-end">
                    <button 
                      class="px-4 py-1.5 text-sm border border-[#FF9900] text-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                      @click="toggleAnalysis(Number(index))"
                    >
                      {{ $t('customExercise.answerAnalysis') }}
                    </button>
                  </div>

                  <!-- 解析内容 -->
                  <Transition name="slide">
                    <div v-if="expandedAnalysis.includes(Number(index))" class="mt-3 p-3 bg-[#FFF7E6] rounded text-sm text-gray-700 border-l-[3px] border-[#FF9900]">
                      <div class="font-medium text-[#FF9900] mb-1">{{ $t('customExercise.correctAnswer') }}：{{ getCorrectAnswerText(q) }}</div>
                      <div v-if="q.analysis" class="text-gray-600">{{ $t('customExercise.analysis') }}：{{ q.analysis }}</div>
                      <div v-else class="text-gray-400">{{ $t('customExercise.noAnalysis') }}</div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { taskmanagementcenterApi } from '~/composables/api/taskmanagement'
import { cursorAdmin } from '~/composables/api/curosr'

const props = defineProps<{
  modelValue: boolean
  exerciseId?: string | null
  evaluationId?: string | null
  taskId?: string | null
  detailSource?: 'task' | 'courseEvaluation' | 'evaluationDetail' | 'evaluationWithAnswers'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { getExerciseDetail, getTaskIdDetail, getEvaluationDetail, getEvaluationWithAnswers } = taskmanagementcenterApi()
const { getCourseEvaluationDetail } = cursorAdmin()

const loading = ref(true)
const exerciseData = ref<any>(null)
const taskDetailData = ref<any>(null)
const expandedAnalysis = ref<number[]>([])

// 是否为学生答题详情模式
const isTaskMode = computed(() => props.detailSource === 'evaluationWithAnswers' || !!props.taskId)

// 任务信息（学生姓名、得分等）
const taskInfo = computed(() => taskDetailData.value?.taskInfo || null)

// 统一的显示数据
const displayData = computed(() => {
  if (isTaskMode.value) return taskDetailData.value
  return exerciseData.value ? { questions: exerciseData.value.questions } : null
})

// 标题
const displayTitle = computed(() => {
  if (isTaskMode.value && taskInfo.value) {
    return `${$t('customExercise.totalScore')}${taskInfo.value.totalScore}${$t('customExercise.scoreUnit')}`
  }
  if (exerciseData.value) {
    return `${exerciseData.value.exerciseName}（${exerciseData.value.questionCount}${$t('customExercise.questionUnit')}，${$t('customExercise.totalScore')}${exerciseData.value.totalScore}${$t('customExercise.scoreUnit')}）`
  }
  return ''
})

const { t: $t } = useI18n()

import { useI18n } from 'vue-i18n'

const close = () => {
  emit('update:modelValue', false)
}

const toggleAnalysis = (index: number) => {
  const idx = expandedAnalysis.value.indexOf(index)
  if (idx > -1) {
    expandedAnalysis.value.splice(idx, 1)
  } else {
    expandedAnalysis.value.push(index)
  }
}

// 判断学生是否选了该选项
const isStudentSelected = (q: any, opt: any) => {
  const sa = q.studentAnswer
  if (!sa) return false
  const candidateIds = getOptionKeyCandidates(opt)
  // 单选/判断
  if (candidateIds.includes(String(sa.optionId || ''))) return true
  // 多选
  if (sa.optionIds && sa.optionIds.some((id: any) => candidateIds.includes(String(id)))) return true
  return false
}

// 获取学生填空答案
const getStudentBlankAnswer = (q: any, blankIndex: number) => {
  const sa = q.studentAnswer
  if (!sa?.blankAnswers) return ''
  const found = sa.blankAnswers.find((b: any) => b.index === blankIndex)
  return found?.text || ''
}

const getOptionKeyCandidates = (opt: any): string[] => {
  return [
    opt?.tempId,
    opt?.optionId,
    opt?.id
  ].filter(Boolean).map((id: any) => String(id))
}

const sortOptionsBySequence = (options: any[]) => {
  return [...(options || [])].sort((a: any, b: any) => {
    const seqA = Number(a?.sequence ?? 0)
    const seqB = Number(b?.sequence ?? 0)
    return seqA - seqB
  })
}

const toLowerAlphabetLabel = (index: number) => {
  if (index < 0) return ''
  let n = index + 1
  let result = ''
  while (n > 0) {
    n -= 1
    result = String.fromCharCode(97 + (n % 26)) + result
    n = Math.floor(n / 26)
  }
  return result
}

const getOptionIndexInList = (list: any[], opt: any) => {
  const optIds = getOptionKeyCandidates(opt)
  return list.findIndex((item: any) => {
    const itemIds = getOptionKeyCandidates(item)
    return itemIds.some((id: string) => optIds.includes(id))
  })
}

const getSourceOptions = (q: any) => {
  return sortOptionsBySequence((q.options || []).filter((o: any) => o.groupType === 'source'))
}

const getTargetOptions = (q: any) => {
  return sortOptionsBySequence((q.options || []).filter((o: any) => o.groupType === 'target'))
}

const getConnectDisplayLabel = (q: any, opt: any) => {
  const groupType = String(opt?.groupType || '').toLowerCase()
  if (groupType === 'source') {
    const idx = getOptionIndexInList(getSourceOptions(q), opt)
    return idx >= 0 ? String(idx + 1) : String(opt?.optionLabel || '')
  }
  if (groupType === 'target') {
    const idx = getOptionIndexInList(getTargetOptions(q), opt)
    return idx >= 0 ? toLowerAlphabetLabel(idx) : String(opt?.optionLabel || '')
  }
  return String(opt?.optionLabel || '')
}

const getOptionLabel = (q: any, tempId: string) => {
  const optionId = String(tempId || '')
  const opt = (q.options || []).find((o: any) => getOptionKeyCandidates(o).includes(optionId))
  if (!opt) return ''
  if (q.questionType === 'connect') {
    return getConnectDisplayLabel(q, opt)
  }
  return opt.optionLabel
}

const getCorrectAnswerText = (q: any) => {
  if (q.questionType === 'blank') {
    return (q.answers || []).map((a: any) => a.blankText).join('；')
  }
  if (q.questionType === 'connect') {
    return (q.answers || []).map((a: any) => `${getOptionLabel(q, a.optionTempId)}→${getOptionLabel(q, a.matchOptionTempId)}`).join('，')
  }
  const correctTempIds = (q.answers || []).map((a: any) => a.optionTempId)
  const correctLabels = (q.options || [])
    .filter((o: any) => correctTempIds.includes(o.tempId))
    .map((o: any) => o.optionLabel)
  return correctLabels.join('、') || '-'
}

const fetchDetail = async () => {
  loading.value = true
  expandedAnalysis.value = []
  exerciseData.value = null
  taskDetailData.value = null
  try {
    if (props.detailSource === 'evaluationWithAnswers' && props.evaluationId) {
      taskDetailData.value = await getEvaluationWithAnswers(props.evaluationId)
    } else if (props.taskId) {
      // 学生答题详情模式
      const data = await getTaskIdDetail(props.taskId)
      taskDetailData.value = data
    } else if (props.exerciseId) {
      if (props.detailSource === 'evaluationDetail') {
        exerciseData.value = await getEvaluationDetail(props.exerciseId)
      } else if (props.detailSource === 'courseEvaluation') {
        exerciseData.value = await getCourseEvaluationDetail(props.exerciseId)
      } else {
        // 任务文件详情模式
        exerciseData.value = await getExerciseDetail(props.exerciseId)
      }
    }
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (val) => {
  if (val && (props.exerciseId || props.taskId || props.evaluationId)) {
    fetchDetail()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
.slide-enter-to {
  max-height: 200px;
}
</style>
