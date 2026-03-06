<template>
  <div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Row 1: Breadcrumb & Save Button -->
    <div class="pl-[6%] pr-[5%] py-4 flex items-center justify-between">
      <div class="flex items-center text-sm text-gray-500">
        <button class="mr-2 p-1 hover:bg-gray-100 rounded transition-colors" @click="goBack">
          <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span class="hover:text-gray-700 transition-colors cursor-pointer" @click="goHome">{{ $t('nav.home') }}</span>
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="hover:text-gray-700 transition-colors cursor-pointer" @click="goTaskManagement">{{ $t('taskManagement.title') }}</span>
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="hover:text-gray-700 transition-colors cursor-pointer" @click="goCustomExercise">{{ $t('taskManagement.customExercise') }}</span>
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="text-gray-900 font-medium">{{ isEditMode ? $t('customExercise.editExercise') : $t('customExercise.newExercise') }}</span>
      </div>
      <MButton type="primary" class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] !border-[#FF9900] shadow-md shadow-orange-500/20" @click="handleSave">
        {{ $t('customExercise.saveExercise') }}
      </MButton>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-hidden pl-[6%] pr-[5%] pb-6">
      <div class="h-full flex bg-[#e3ebf3]/60 rounded-xl p-4 gap-4">
        <!-- Left Sidebar - Question Types -->
        <div class="w-[130px] shrink-0 bg-white rounded-lg px-4 py-4">
          <div class="text-sm text-gray-600 mb-4 text-center font-medium">{{ $t('customExercise.questionType') }}</div>
          <div class="space-y-2 flex flex-col items-center">
            <button 
              v-for="type in questionTypes" 
              :key="type.value"
              class="w-[100px] py-2.5 text-sm rounded border transition-all text-center"
              :class="selectedType === type.value 
                ? 'bg-[#FF9900] text-white border-[#FF9900]' 
                : 'bg-white text-[#FF9900] border-[#FF9900] hover:bg-[#FFF7E6]'"
              @click="handleAddQuestion(type.value)"
            >
              {{ type.label }}
            </button>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="flex-1 flex flex-col overflow-hidden gap-4">
          <!-- Form Area -->
          <div class="bg-white rounded-lg px-5 py-4">
            <div class="flex">
              <div class="flex-1 mr-4">
                <div class="mb-3">
                  <div class="flex items-center">
                    <label class="text-sm text-gray-600 shrink-0 whitespace-nowrap min-w-[90px]">
                      <span class="text-red-500">*</span>{{ $t('customExercise.exerciseNameLabel') }}：
                    </label>
                    <input 
                      v-model="exerciseName"
                      type="text"
                      :placeholder="$t('customExercise.exerciseNamePlaceholder')"
                      class="flex-1 h-9 px-3 border rounded text-sm focus:outline-none transition-all"
                      :class="exerciseNameError 
                        ? 'border-red-400 bg-red-50/50' 
                        : 'border-[#91D5FF] bg-[#E6F7FF]/40 focus:border-[#FF9900]'"
                    />
                  </div>
                  <div v-if="exerciseNameError" class="ml-[90px] mt-1 text-xs text-red-500">
                    {{ $t('customExercise.exerciseNameRequired') }}
                  </div>
                </div>
                <div class="flex items-center">
                  <label class="text-sm text-gray-600 shrink-0 whitespace-nowrap min-w-[90px]">
                    {{ $t('customExercise.exerciseDesc') }}：
                  </label>
                  <div class="flex-1 relative">
                    <input 
                      v-model="exerciseDesc"
                      type="text"
                      maxlength="30"
                      :placeholder="$t('customExercise.exerciseDescPlaceholder')"
                      class="w-full h-9 px-3 pr-14 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#FF9900] bg-white"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ exerciseDesc.length }}/30</span>
                  </div>
                </div>
              </div>
              <div class="shrink-0 text-sm text-gray-500 text-right flex flex-col justify-center">
                <div>{{ $t('customExercise.questionCount') }}：<span class="text-gray-800">{{ questions.length }}</span></div>
                <div class="mt-1">{{ $t('customExercise.totalScore') }}：<span class="text-gray-800">{{ totalScore }}</span></div>
              </div>
            </div>
          </div>

          <!-- Questions Area -->
          <div ref="questionsAreaRef" class="flex-1 bg-white rounded-lg p-4 overflow-auto relative" @scroll="handleScroll">
            <!-- Empty State -->
            <div v-if="questions.length === 0" class="h-full flex flex-col items-center justify-center">
              <div class="w-24 h-24 mb-4">
                <svg viewBox="0 0 96 96" fill="none" class="w-full h-full">
                  <rect x="24" y="14" width="40" height="54" rx="4" fill="#C5E4F3" stroke="#8DCAE8" stroke-width="2"/>
                  <rect x="32" y="28" width="20" height="3" rx="1.5" fill="#8DCAE8"/>
                  <rect x="32" y="38" width="16" height="3" rx="1.5" fill="#8DCAE8"/>
                  <rect x="32" y="48" width="12" height="3" rx="1.5" fill="#8DCAE8"/>
                  <circle cx="60" cy="60" r="16" fill="#E8F4FC" stroke="#5BB5D5" stroke-width="2"/>
                  <path d="M52 60l5 5 9-9" stroke="#5BB5D5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="text-gray-400 text-sm">{{ $t('customExercise.emptyQuestionTip') }}</div>
            </div>

            <!-- Questions List -->
            <div v-else class="space-y-0">
              <template v-for="(question, index) in questions" :key="index">
                <!-- 判断题使用独立组件 -->
                <TrueFalseEditor
                  v-if="question.type === 'trueFalse'"
                  :question="question"
                  :question-index="index"
                  :show-error="question.showError"
                  @update:question="updateQuestion(index, $event)"
                  @delete="showDeleteConfirm(index)"
                />
                <!-- 填空题使用独立组件 -->
                <FillBlankEditor
                  v-else-if="question.type === 'fillBlank'"
                  :question="question"
                  :question-index="index"
                  :show-error="question.showError"
                  @update:question="updateQuestion(index, $event)"
                  @delete="showDeleteConfirm(index)"
                />
                <!-- 连线题使用独立组件 -->
                <MatchingEditor
                  v-else-if="question.type === 'matching'"
                  :question="question"
                  :question-index="index"
                  :show-error="question.showError"
                  @update:question="updateQuestion(index, $event)"
                  @delete="showDeleteConfirm(index)"
                />
                <!-- 单选/多选题 -->
                <QuestionEditor
                  v-else
                  :question="question"
                  :question-index="index"
                  :show-error="question.showError"
                  @update:question="updateQuestion(index, $event)"
                  @delete="showDeleteConfirm(index)"
                />
                <!-- Divider between questions -->
                <div v-if="index < questions.length - 1" class="h-3 bg-[#E8F4FC] my-0"></div>
              </template>
            </div>

            <!-- Back to Top Button -->
            <Transition name="fade">
              <button 
                v-if="showBackToTop"
                class="fixed bottom-8 right-[8%] w-10 h-10 bg-[#FF9900] text-white rounded-full shadow-lg hover:bg-[#e68a00] flex items-center justify-center transition-all z-40"
                @click="scrollToTop"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </button>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteModalVisible" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" @click="deleteModalVisible = false"></div>
          <div class="relative bg-white rounded-lg w-[400px] p-6">
            <!-- Close Button -->
            <button 
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              @click="deleteModalVisible = false"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            
            <!-- Title -->
            <h3 class="text-lg font-medium text-center mb-6">{{ $t('customExercise.deleteReminder') }}</h3>
            
            <!-- Content -->
            <p class="text-center text-gray-600 mb-8">{{ $t('customExercise.deleteConfirmText') }}</p>
            
            <!-- Buttons -->
            <div class="flex justify-center gap-4">
              <button 
                class="px-8 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50"
                @click="deleteModalVisible = false"
              >
                {{ $t('common.cancel') }}
              </button>
              <button 
                class="px-8 py-2 bg-[#FF9900] text-white rounded-full hover:bg-[#e68a00]"
                @click="confirmDelete"
              >
                {{ $t('common.delete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Leave Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="leaveModalVisible" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" @click="leaveModalVisible = false"></div>
          <div class="relative bg-white rounded-lg w-[400px] p-6">
            <!-- Close Button -->
            <button 
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              @click="leaveModalVisible = false"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            
            <!-- Title -->
            <h3 class="text-lg font-medium text-center mb-6">{{ $t('common.tips') }}</h3>
            
            <!-- Content -->
            <p class="text-center text-gray-600 mb-8">{{ $t('customExercise.leaveConfirmText') }}</p>
            
            <!-- Buttons -->
            <div class="flex justify-center gap-4">
              <button 
                class="px-8 py-2 border border-[#FF9900] text-[#FF9900] rounded hover:bg-[#FFF7E6]"
                @click="leaveModalVisible = false"
              >
                {{ $t('common.cancel') }}
              </button>
              <button 
                class="px-8 py-2 bg-[#FF9900] text-white rounded hover:bg-[#e68a00]"
                @click="confirmLeave"
              >
                {{ $t('common.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import QuestionEditor from '../../../components/taskmanagement/QuestionEditor.vue'
import TrueFalseEditor from '../../../components/taskmanagement/TrueFalseEditor.vue'
import FillBlankEditor from '../../../components/taskmanagement/FillBlankEditor.vue'
import MatchingEditor from '../../../components/taskmanagement/MatchingEditor.vue'
import { taskmanagementcenterApi } from '~/composables/api/taskmanagement'

interface QuestionOption {
  text: string
  type: 'text' | 'image'
  image?: string
  imageUrl?: string
}

interface BlankItem {
  answer: string
}

interface MatchItem {
  type: 'text' | 'image'
  content: string
  image?: string
  imageUrl?: string
}

interface Question {
  type: string
  content: string
  contentImage?: string // 题目图片ossId
  contentImageUrl?: string // 题目图片预览URL
  score: number
  options?: QuestionOption[]
  correctAnswer?: number | number[] | boolean
  blanks?: BlankItem[]
  leftItems?: MatchItem[]
  rightItems?: MatchItem[]
  matchAnswers?: (number | undefined)[]
  analysis?: string
  showError?: boolean
}

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { addExercise, getDetailExercise, updateExercise } = taskmanagementcenterApi()

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.query.id)
const saving = ref(false)
const loading = ref(false)

const exerciseName = ref('')
const exerciseDesc = ref('')
const exerciseNameError = ref(false)

// 输入时自动取消错误状态
watch(exerciseName, (val) => {
  if (val.trim()) {
    exerciseNameError.value = false
  }
})
const selectedType = ref('')
const deleteModalVisible = ref(false)
const deleteIndex = ref(-1)
const questionsAreaRef = ref<HTMLElement | null>(null)
const showBackToTop = ref(false)

// 加载练习题详情（编辑模式）
const loadExerciseDetail = async () => {
  const exerciseId = route.query.id as string
  if (!exerciseId) return
  
  loading.value = true
  try {
    const data = await getDetailExercise(exerciseId)
    exerciseName.value = data.exerciseName || ''
    exerciseDesc.value = data.exerciseDesc || ''
    
    // 转换题目数据
    if (data.questions && data.questions.length > 0) {
      questions.value = data.questions.map((q: any) => transformApiToQuestion(q))
    }
  } catch (error) {
    console.error('加载练习题详情失败:', error)
    ElMessage.error(t('customExercise.loadDetailFailed'))
  } finally {
    loading.value = false
  }
}

// 将API返回的题目数据转换为页面格式
const transformApiToQuestion = (apiQuestion: any): Question => {
  const questionTypeMap: Record<string, string> = {
    'single': 'single',
    'multiple': 'multiple',
    'judge': 'trueFalse',
    'blank': 'fillBlank',
    'connect': 'matching'
  }
  
  const type = questionTypeMap[apiQuestion.questionType] || apiQuestion.questionType
  const question: Question = {
    type,
    content: apiQuestion.questionName || '',
    contentImage: apiQuestion.imageOssId || undefined,
    contentImageUrl: apiQuestion.imageUrl || undefined,
    score: apiQuestion.score || 10,
    analysis: apiQuestion.analysis || ''
  }
  
  // 单选/多选题
  if (type === 'single' || type === 'multiple') {
    question.options = (apiQuestion.options || []).map((opt: any) => ({
      text: opt.optionText || '',
      type: opt.imageOssId ? 'image' : 'text',
      image: opt.imageOssId || undefined,
      imageUrl: opt.imageUrl || undefined
    }))
    
    const answerTempIds = (apiQuestion.answers || []).map((a: any) => a.optionTempId)
    if (type === 'single') {
      const correctOpt = apiQuestion.options?.findIndex((opt: any) => answerTempIds.includes(opt.tempId))
      question.correctAnswer = correctOpt >= 0 ? correctOpt : undefined
    } else {
      question.correctAnswer = apiQuestion.options
        ?.map((opt: any, idx: number) => answerTempIds.includes(opt.tempId) ? idx : -1)
        .filter((idx: number) => idx >= 0) || []
    }
  }
  
  // 判断题
  if (type === 'trueFalse') {
    const answerTempId = apiQuestion.answers?.[0]?.optionTempId
    const correctOpt = apiQuestion.options?.find((opt: any) => opt.tempId === answerTempId)
    if (correctOpt) {
      question.correctAnswer = correctOpt.optionLabel === 'A'
    }
  }
  
  // 填空题
  if (type === 'fillBlank') {
    question.blanks = (apiQuestion.answers || []).map((a: any) => ({
      answer: a.blankText || ''
    }))
  }
  
  // 连线题
  if (type === 'matching') {
    const sourceItems = (apiQuestion.options || []).filter((opt: any) => opt.groupType === 'source')
    const targetItems = (apiQuestion.options || []).filter((opt: any) => opt.groupType === 'target')
    
    question.leftItems = sourceItems.map((opt: any) => ({
      type: opt.imageOssId ? 'image' as const : 'text' as const,
      content: opt.optionText || '',
      image: opt.imageOssId || undefined,
      imageUrl: opt.imageUrl || undefined
    }))
    question.rightItems = targetItems.map((opt: any) => ({
      type: opt.imageOssId ? 'image' as const : 'text' as const,
      content: opt.optionText || '',
      image: opt.imageOssId || undefined,
      imageUrl: opt.imageUrl || undefined
    }))
    
    // 解析答案匹配关系
    question.matchAnswers = sourceItems.map((sourceOpt: any) => {
      const answer = apiQuestion.answers?.find((a: any) => a.optionTempId === sourceOpt.tempId)
      if (answer) {
        const targetIndex = targetItems.findIndex((t: any) => t.tempId === answer.matchOptionTempId)
        return targetIndex >= 0 ? targetIndex : undefined
      }
      return undefined
    })
  }
  
  return question
}

// 初始化
onMounted(() => {
  if (isEditMode.value) {
    loadExerciseDetail()
  }
})

const handleScroll = () => {
  if (questionsAreaRef.value) {
    showBackToTop.value = questionsAreaRef.value.scrollTop > 200
  }
}

const scrollToTop = () => {
  if (questionsAreaRef.value) {
    questionsAreaRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const questionTypes = computed(() => [
  { label: t('customExercise.singleChoice'), value: 'single' },
  { label: t('customExercise.multipleChoice'), value: 'multiple' },
  { label: t('customExercise.trueFalse'), value: 'trueFalse' },
  { label: t('customExercise.fillBlank'), value: 'fillBlank' },
  { label: t('customExercise.matching'), value: 'matching' }
])

const questions = ref<Question[]>([])
const totalScore = computed(() => questions.value.reduce((sum, q) => sum + q.score, 0))

const handleAddQuestion = (type: string) => {
  selectedType.value = type
  const newQuestion: Question = {
    type,
    content: '',
    score: 10,
    analysis: ''
  }
  
  if (type === 'single' || type === 'multiple') {
    newQuestion.options = [
      { text: '', type: 'text' },
      { text: '', type: 'text' },
      { text: '', type: 'text' },
      { text: '', type: 'text' }
    ]
    newQuestion.correctAnswer = type === 'single' ? undefined : []
  }
  
  if (type === 'trueFalse') {
    newQuestion.correctAnswer = undefined
  }
  
  if (type === 'fillBlank') {
    newQuestion.content = '这是题目内容「填空1」'
    newQuestion.blanks = [{ answer: '' }]
  }
  
  if (type === 'matching') {
    newQuestion.leftItems = [
      { type: 'text', content: '' },
      { type: 'text', content: '' },
      { type: 'text', content: '' },
      { type: 'text', content: '' }
    ]
    newQuestion.rightItems = [
      { type: 'text', content: '' },
      { type: 'text', content: '' },
      { type: 'text', content: '' },
      { type: 'text', content: '' }
    ]
    newQuestion.matchAnswers = [undefined, undefined, undefined, undefined]
  }
  
  questions.value.push(newQuestion)
}

const updateQuestion = (index: number, question: Question) => {
  questions.value[index] = question
}

const showDeleteConfirm = (index: number) => {
  deleteIndex.value = index
  deleteModalVisible.value = true
}

const confirmDelete = () => {
  if (deleteIndex.value >= 0) {
    questions.value.splice(deleteIndex.value, 1)
    deleteIndex.value = -1
  }
  deleteModalVisible.value = false
}

const validateQuestion = (question: Question) => {
  let isValid = true
  
  // 题目内容必填
  if (!question.content?.trim()) {
    isValid = false
  }
  
  if (question.options) {
    const hasEmpty = question.options.some(opt => opt.type === 'text' && !opt.text?.trim())
    if (hasEmpty) isValid = false
  }
  
  // 连线题验证：左右列表数量必须相等
  if (question.type === 'matching') {
    const leftCount = (question.leftItems || []).length
    const rightCount = (question.rightItems || []).length
    if (leftCount !== rightCount) {
      isValid = false
    }
    // 检查左右列表是否有空内容
    const hasEmptyLeft = (question.leftItems || []).some(item => item.type === 'image' ? !item.image : !item.content?.trim())
    const hasEmptyRight = (question.rightItems || []).some(item => item.type === 'image' ? !item.image : !item.content?.trim())
    if (hasEmptyLeft || hasEmptyRight) {
      isValid = false
    }
    // 检查答案是否都已选择
    const answers = question.matchAnswers || []
    for (let i = 0; i < leftCount; i++) {
      if (answers[i] === undefined || answers[i] === null) {
        isValid = false
        break
      }
    }
    // 检查答案是否有重复
    const validAnswers = answers.filter(a => a !== undefined && a !== null) as number[]
    const uniqueAnswers = new Set(validAnswers)
    if (validAnswers.length !== uniqueAnswers.size) {
      isValid = false
    }
    // 检查列表2是否有未被配对的选项
    for (let i = 0; i < rightCount; i++) {
      if (!validAnswers.includes(i)) {
        isValid = false
        break
      }
    }
  }
  
  if (question.score < 1 || question.score > 100) {
    isValid = false
  }
  
  return isValid
}

const goBack = () => handleLeave(() => router.back())
const goHome = () => handleLeave(() => router.push('/teacher'))
const goTaskManagement = () => handleLeave(() => router.push('/taskmanagement'))
const goCustomExercise = () => handleLeave(() => router.push('/taskmanagement/custom-exercise'))

// 离开确认弹窗
const leaveModalVisible = ref(false)
const pendingNavigation = ref<(() => void) | null>(null)

// 检查是否有未保存的内容
const hasUnsavedContent = computed(() => {
  return exerciseName.value.trim() !== '' || 
         exerciseDesc.value.trim() !== '' || 
         questions.value.length > 0
})

// 处理离开
const handleLeave = (navigateFn: () => void) => {
  if (hasUnsavedContent.value) {
    pendingNavigation.value = navigateFn
    leaveModalVisible.value = true
  } else {
    navigateFn()
  }
}

// 确认离开
const confirmLeave = () => {
  leaveModalVisible.value = false
  if (pendingNavigation.value) {
    pendingNavigation.value()
    pendingNavigation.value = null
  }
}

// 转换题目数据为 API 格式
const transformQuestionToApi = (question: Question, index: number) => {
  const typeMap: Record<string, string> = {
    'single': 'single',
    'multiple': 'multiple',
    'trueFalse': 'judge',
    'fillBlank': 'blank',
    'matching': 'connect'
  }
  
  const result: any = {
    questionType: typeMap[question.type] || question.type,
    questionName: question.content, // 始终用文字内容
    score: question.score,
    analysis: question.analysis || '',
    sequence: index + 1, // 排序字段，按下标排序
    options: [],
    answers: []
  }
  
  // 如果题目有图片，新增imageOssId字段
  if (question.contentImage) {
    result.imageOssId = question.contentImage
  }
  
  // 单选/多选题
  if (question.type === 'single' || question.type === 'multiple') {
    result.options = (question.options || []).map((opt, i) => {
      const option: any = {
        tempId: `opt_${index}_${i}`,
        optionLabel: String.fromCharCode(65 + i), // A, B, C, D...
        optionText: opt.text,
        sequence: i + 1
      }
      // 如果选项是图片类型且有图片，添加imageOssId字段
      if (opt.type === 'image' && opt.image) {
        option.imageOssId = opt.image
      }
      return option
    })
    
    if (question.type === 'single' && question.correctAnswer !== undefined) {
      result.answers = [{ optionTempId: `opt_${index}_${question.correctAnswer}` }]
    } else if (question.type === 'multiple' && Array.isArray(question.correctAnswer)) {
      result.answers = question.correctAnswer.map(idx => ({ optionTempId: `opt_${index}_${idx}` }))
    }
  }
  
  // 判断题
  if (question.type === 'trueFalse') {
    result.options = [
      { tempId: `opt_${index}_true`, optionLabel: 'A', optionText: '正确', sequence: 1 },
      { tempId: `opt_${index}_false`, optionLabel: 'B', optionText: '错误', sequence: 2 }
    ]
    if (question.correctAnswer === true) {
      result.answers = [{ optionTempId: `opt_${index}_true` }]
    } else if (question.correctAnswer === false) {
      result.answers = [{ optionTempId: `opt_${index}_false` }]
    }
  }
  
  // 填空题
  if (question.type === 'fillBlank') {
    result.options = []
    result.answers = (question.blanks || []).map((blank, i) => ({
      blankIndex: i + 1,
      blankText: blank.answer
    }))
  }
  
  // 连线题
  if (question.type === 'matching') {
    const leftItems = question.leftItems || []
    const rightItems = question.rightItems || []
    
    result.options = [
      ...leftItems.map((item, i) => {
        const option: any = {
          tempId: `opt_${index}_L${i}`,
          optionLabel: `L${i + 1}`,
          optionText: item.content || '',
          groupType: 'source',
          sequence: i + 1
        }
        if (item.type === 'image' && item.image) {
          option.imageOssId = item.image
        }
        return option
      }),
      ...rightItems.map((item, i) => {
        const option: any = {
          tempId: `opt_${index}_R${i}`,
          optionLabel: `R${i + 1}`,
          optionText: item.content || '',
          groupType: 'target',
          sequence: i + 1
        }
        if (item.type === 'image' && item.image) {
          option.imageOssId = item.image
        }
        return option
      })
    ]
    
    result.answers = (question.matchAnswers || [])
      .map((rightIdx, leftIdx) => {
        if (rightIdx !== undefined) {
          return {
            optionTempId: `opt_${index}_L${leftIdx}`,
            matchOptionTempId: `opt_${index}_R${rightIdx}`
          }
        }
        return null
      })
      .filter(Boolean)
  }
  
  return result
}

const handleSave = async () => {
  // 先检查是否有题目
  if (questions.value.length === 0) {
    ElMessage.warning(t('customExercise.pleaseAddQuestion'))
    return
  }
  
  // 再检查练习题名称
  if (!exerciseName.value.trim()) {
    exerciseNameError.value = true
    return
  }
  exerciseNameError.value = false
  
  let allValid = true
  questions.value.forEach(q => {
    q.showError = true
    if (!validateQuestion(q)) {
      allValid = false
    }
  })
  
  if (!allValid) {
    return
  }
  
  try {
    saving.value = true
    const apiQuestions = questions.value.map((q, i) => transformQuestionToApi(q, i))
    console.log(apiQuestions,'题目格式*******参数')
    
    if (isEditMode.value) {
      // 编辑模式 - 调用修改接口
      await updateExercise({
        exerciseId: route.query.id as string,
        exerciseName: exerciseName.value,
        exerciseDesc: exerciseDesc.value || undefined,
        questionCount: String(questions.value.length),
        totalScore: String(totalScore.value),
        questions: apiQuestions as any
      })
    } else {
      // 新增模式
      await addExercise({
        exerciseName: exerciseName.value,
        exerciseDesc: exerciseDesc.value || undefined,
        questionCount: String(questions.value.length),
        totalScore: String(totalScore.value),
        questions: apiQuestions as any
      })
    }
    
    ElMessage.success(t('common.editSuccess'))
    router.push('/taskmanagement/custom-exercise')
  } catch (error: any) {
   // ElMessage.error(error.message || t('customExercise.saveFailed'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
