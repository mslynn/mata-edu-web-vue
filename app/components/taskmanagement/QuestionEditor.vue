<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden relative">
    <!-- Question Type Tag - Corner Badge -->
    <div class="absolute top-0 left-0 px-3 py-1 bg-[#FF9900] text-white text-sm rounded-br-lg rounded-tl-lg">
      {{ questionTypeLabel }}
    </div>
    <!-- Delete Button -->
    <div class="absolute top-2 right-4">
      <button class="text-sm text-gray-500 hover:text-red-500" @click="$emit('delete')">{{ $t('customExercise.deleteQuestion') }}</button>
    </div>
    
    <!-- Question Content -->
    <div class="bg-white mt-8 mx-0 p-4 space-y-4">
      <!-- 题目 -->
      <div class="flex items-start">
        <label class="text-sm text-gray-600 shrink-0 w-[60px] pt-2">
          <span class="text-red-500">*</span>{{ $t('customExercise.questionTitle') }}：
        </label>
        <div class="flex-1">
          <div class="relative mb-2">
            <input 
              v-model="localQuestion.content"
              type="text"
              maxlength="200"
              :placeholder="$t('customExercise.questionTitlePlaceholder')"
              class="w-full h-9 px-3 pr-16 border rounded text-sm focus:outline-none focus:border-[#FF9900]"
              :class="showError && !localQuestion.content?.trim() ? 'border-red-400' : 'border-gray-300'"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs" :class="showError && !localQuestion.content?.trim() ? 'text-red-400' : 'text-gray-400'">{{ localQuestion.content?.length || 0 }}/200</span>
          </div>
          <button class="px-4 py-1.5 bg-[#FF9900] text-white text-sm rounded hover:bg-[#e68a00] inline-flex items-center gap-1">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            {{ $t('customExercise.uploadImage') }}
          </button>
          <span class="text-xs text-gray-400 ml-2">{{ $t('customExercise.uploadImageTip') }}</span>
          <div v-if="showError && !localQuestion.content?.trim()" class="text-sm text-[#FF9900] mt-1">
            {{ $t('customExercise.questionContentRequired') }}
          </div>
        </div>
      </div>

      <!-- 答案选项 (单选/多选) -->
      <div v-if="localQuestion.type === 'single' || localQuestion.type === 'multiple'" class="flex items-start">
        <label class="text-sm text-gray-600 shrink-0 w-[60px] pt-2">
          <span class="text-red-500">*</span>{{ $t('customExercise.answer') }}：
        </label>
        <div class="flex-1">
          <div class="space-y-2">
            <div v-for="(option, optIndex) in localQuestion.options" :key="optIndex" class="flex items-center gap-2">
              <!-- Custom Radio for Single Choice -->
              <label v-if="localQuestion.type === 'single'" class="relative flex items-center cursor-pointer">
                <input 
                  type="radio"
                  :name="'answer-' + questionIndex"
                  :checked="localQuestion.correctAnswer === optIndex"
                  class="sr-only peer"
                  @change="localQuestion.correctAnswer = optIndex"
                />
                <span class="radio-circle"></span>
              </label>
              <!-- Custom Checkbox for Multiple Choice -->
              <label v-else class="relative flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  :checked="isOptionSelected(optIndex)"
                  class="sr-only peer"
                  @change="toggleOption(optIndex)"
                />
                <span class="checkbox-box"></span>
              </label>
              <span class="text-sm font-medium w-6">{{ String.fromCharCode(65 + optIndex) }}</span>
              <MSelect 
                v-model="option.type"
                :options="optionTypeOptions"
                class="w-[80px]"
              />
              <!-- 文字输入 -->
              <div v-if="option.type === 'text'" class="flex-1 relative">
                <input 
                  v-model="option.text"
                  type="text"
                  maxlength="50"
                  :placeholder="$t('customExercise.inputPlaceholder')"
                  class="w-full h-8 px-3 pr-12 border rounded text-sm focus:outline-none focus:border-[#FF9900]"
                  :class="showError && !option.text?.trim() ? 'border-red-400' : 'border-gray-300'"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ option.text?.length || 0 }}/50</span>
              </div>
              <!-- 图片上传 -->
              <div v-else class="flex-1">
                <button class="px-3 py-1.5 border border-[#FF9900] text-[#FF9900] text-sm rounded hover:bg-[#FFF7E6] inline-flex items-center gap-1">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  {{ $t('customExercise.uploadImage') }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button 
                class="text-sm text-[#FF9900] hover:text-[#e68a00]"
                @click="addOption"
              >
                + {{ $t('customExercise.addOption') }}
              </button>
              <span v-if="showError && hasEmptyOption" class="text-sm text-[#FF9900]">{{ $t('customExercise.optionRequired') }}</span>
            </div>
          </div>
          <div v-if="showError && !hasAnswer" class="text-sm text-[#FF9900] mt-1">
            {{ $t('customExercise.answerRequired') }}
          </div>
        </div>
      </div>

      <!-- 分值 -->
      <div class="flex flex-col">
        <div class="flex items-center">
          <label class="text-sm text-gray-600 shrink-0 w-[60px]">
            <span class="text-red-500">*</span>{{ $t('customExercise.score') }}：
          </label>
          <input 
            v-model.number="localQuestion.score"
            type="number"
            min="1"
            max="100"
            :placeholder="$t('customExercise.scorePlaceholder')"
            class="w-[200px] h-9 px-3 border rounded text-sm focus:outline-none focus:border-[#FF9900]"
            :class="showError && (localQuestion.score < 1 || localQuestion.score > 100) ? 'border-red-400' : 'border-gray-300'"
          />
        </div>
        <div v-if="showError && (localQuestion.score < 1 || localQuestion.score > 100)" class="ml-[60px] mt-1 text-sm text-[#FF9900]">
          {{ $t('customExercise.scoreRangeError') }}
        </div>
      </div>

      <!-- 解析 -->
      <div class="flex items-start">
        <label class="text-sm text-gray-600 shrink-0 w-[60px] pt-2">
          {{ $t('customExercise.analysis') }}：
        </label>
        <div class="flex-1 relative">
          <textarea 
            v-model="localQuestion.analysis"
            maxlength="300"
            :placeholder="$t('customExercise.analysisPlaceholder')"
            class="w-full h-24 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#FF9900] resize-none"
          ></textarea>
          <span class="absolute right-3 bottom-2 text-xs text-gray-400">{{ localQuestion.analysis?.length || 0 }}/300</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface QuestionOption {
  text: string
  type: 'text' | 'image'
  image?: string
}

interface Question {
  type: string
  content: string
  score: number
  options?: QuestionOption[]
  correctAnswer?: number | number[] | boolean
  analysis?: string
  showError?: boolean
}

const props = defineProps<{
  question: Question
  questionIndex: number
  showError?: boolean
}>()

const emit = defineEmits<{
  'update:question': [value: Question]
  'delete': []
}>()

const { t } = useI18n()

const localQuestion = computed({
  get: () => props.question,
  set: (val) => emit('update:question', val)
})

const optionTypeOptions = computed(() => [
  { label: t('customExercise.text'), value: 'text' },
  { label: t('customExercise.image'), value: 'image' }
])

const questionTypeLabel = computed(() => {
  const types: Record<string, string> = {
    single: t('customExercise.singleChoice'),
    multiple: t('customExercise.multipleChoice'),
    trueFalse: t('customExercise.trueFalse'),
    fillBlank: t('customExercise.fillBlank'),
    matching: t('customExercise.matching')
  }
  return types[props.question.type] || props.question.type
})

const hasEmptyOption = computed(() => {
  if (!localQuestion.value.options) return false
  return localQuestion.value.options.some(opt => opt.type === 'text' && !opt.text?.trim())
})

const hasAnswer = computed(() => {
  const answer = localQuestion.value.correctAnswer
  if (localQuestion.value.type === 'single') {
    return answer !== undefined && answer !== null && typeof answer === 'number' && answer >= 0
  }
  if (localQuestion.value.type === 'multiple') {
    return Array.isArray(answer) && answer.length > 0
  }
  return true
})

const addOption = () => {
  if (localQuestion.value.options && localQuestion.value.options.length < 8) {
    localQuestion.value.options.push({ text: '', type: 'text' })
  }
}

// Multiple choice helpers
const isOptionSelected = (index: number) => {
  const answer = localQuestion.value.correctAnswer
  if (Array.isArray(answer)) {
    return answer.includes(index)
  }
  return false
}

const toggleOption = (index: number) => {
  let answer = localQuestion.value.correctAnswer
  if (!Array.isArray(answer)) {
    answer = []
  }
  const idx = answer.indexOf(index)
  if (idx > -1) {
    answer.splice(idx, 1)
  } else {
    answer.push(index)
    answer.sort((a, b) => a - b)
  }
  localQuestion.value.correctAnswer = [...answer]
}
</script>

<style scoped>
.radio-circle {
  width: 16px;
  height: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s;
}

.peer:checked + .radio-circle {
  border-color: #FF9900;
}

.peer:checked + .radio-circle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #FF9900;
  border-radius: 50%;
}

.checkbox-box {
  width: 16px;
  height: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  position: relative;
  transition: all 0.2s;
}

.peer:checked + .checkbox-box {
  border-color: #FF9900;
  background: #FF9900;
}

.peer:checked + .checkbox-box::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
