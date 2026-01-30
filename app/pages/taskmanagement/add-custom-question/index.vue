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
                <div class="flex items-center mb-3">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import QuestionEditor from '../../../components/taskmanagement/QuestionEditor.vue'
import TrueFalseEditor from '../../../components/taskmanagement/TrueFalseEditor.vue'
import FillBlankEditor from '../../../components/taskmanagement/FillBlankEditor.vue'
import MatchingEditor from '../../../components/taskmanagement/MatchingEditor.vue'

interface QuestionOption {
  text: string
  type: 'text' | 'image'
  image?: string
}

interface BlankItem {
  answer: string
}

interface MatchItem {
  type: 'text' | 'image'
  content: string
}

interface Question {
  type: string
  content: string
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

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.query.id)

const exerciseName = ref('')
const exerciseDesc = ref('')
const exerciseNameError = ref(false)
const selectedType = ref('')
const deleteModalVisible = ref(false)
const deleteIndex = ref(-1)
const questionsAreaRef = ref<HTMLElement | null>(null)
const showBackToTop = ref(false)

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
  
  if (question.score < 1 || question.score > 100) {
    isValid = false
  }
  
  return isValid
}

const goBack = () => router.back()
const goHome = () => router.push('/teacher')
const goTaskManagement = () => router.push('/taskmanagement')
const goCustomExercise = () => router.push('/taskmanagement/custom-exercise')

const handleSave = () => {
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
  
  console.log('Save:', { name: exerciseName.value, desc: exerciseDesc.value, questions: questions.value })
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
