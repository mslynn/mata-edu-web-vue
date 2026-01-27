<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden relative">
    <!-- Question Type Tag - Corner Badge -->
    <div class="absolute top-0 left-0 px-3 py-1 bg-[#FF9900] text-white text-sm rounded-br-lg rounded-tl-lg">
      {{ $t('customExercise.fillBlank') }}
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
          <div 
            class="w-full min-h-[36px] px-3 py-2 border rounded text-sm mb-2 flex flex-wrap items-center gap-1"
            :class="showError && !hasContent ? 'border-red-400' : 'border-gray-300'"
          >
            <template v-for="(part, idx) in contentParts" :key="idx">
              <span v-if="part.type === 'text'" class="whitespace-pre-wrap">{{ part.value }}</span>
              <span 
                v-else 
                class="inline-flex items-center px-2 py-0.5 bg-[#E6F7FF] text-[#1890FF] text-xs rounded border border-[#91D5FF]"
              >「{{ $t('customExercise.blank') }}{{ part.index }}」</span>
            </template>
            <input
              ref="hiddenInput"
              v-model="textInput"
              type="text"
              class="flex-1 min-w-[100px] outline-none border-none bg-transparent text-sm"
              :placeholder="contentParts.length === 0 ? $t('customExercise.questionTitlePlaceholder') : ''"
              @keydown="handleKeydown"
            />
          </div>
          <button 
            class="text-sm text-[#FF9900] hover:text-[#e68a00]"
            @click="addBlank"
          >
            + {{ $t('customExercise.addBlank') }}
          </button>
          <div v-if="showError && !hasContent" class="text-sm text-[#FF9900] mt-1">
            {{ $t('customExercise.questionContentRequired') }}
          </div>
        </div>
      </div>

      <!-- 填空答案 -->
      <div v-if="localQuestion.blanks && localQuestion.blanks.length > 0" class="flex items-start">
        <label class="text-sm text-gray-600 shrink-0 w-[60px] pt-2">
          <span class="text-red-500">*</span>{{ $t('customExercise.answer') }}：
        </label>
        <div class="flex-1 space-y-2">
          <div v-for="(blank, index) in localQuestion.blanks" :key="index" class="flex items-center gap-2">
            <span class="text-sm text-gray-600 shrink-0">{{ $t('customExercise.blank') }}{{ index + 1 }}</span>
            <div class="flex-1 relative">
              <input 
                v-model="blank.answer"
                type="text"
                maxlength="100"
                :placeholder="$t('customExercise.blankAnswerPlaceholder')"
                class="w-full h-8 px-3 pr-14 border rounded text-sm focus:outline-none focus:border-[#FF9900]"
                :class="showError && !blank.answer?.trim() ? 'border-red-400' : 'border-gray-300'"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ blank.answer?.length || 0 }}/100</span>
            </div>
          </div>
          <div v-if="showError && hasEmptyBlank" class="text-sm text-[#FF9900]">
            {{ $t('customExercise.optionRequired') }}
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
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

interface BlankItem {
  answer: string
}

interface ContentPart {
  type: 'text' | 'blank'
  value?: string
  index?: number
}

interface Question {
  type: string
  content: string
  score: number
  blanks?: BlankItem[]
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
const textInput = ref('')
const hiddenInput = ref<HTMLInputElement>()

const localQuestion = computed({
  get: () => props.question,
  set: (val) => emit('update:question', val)
})

const contentParts = computed<ContentPart[]>(() => {
  const content = localQuestion.value.content || ''
  if (!content) return []
  
  const parts: ContentPart[] = []
  const regex = /「填空(\d+)」/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'blank', index: parseInt(match[1] || '0') })
    lastIndex = regex.lastIndex
  }
  
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }
  
  return parts
})

const hasContent = computed(() => {
  return (localQuestion.value.content?.trim().length || 0) > 0 || textInput.value.trim().length > 0
})

const hasEmptyBlank = computed(() => {
  if (!localQuestion.value.blanks) return false
  return localQuestion.value.blanks.some(b => !b.answer?.trim())
})

const addBlank = () => {
  if (!localQuestion.value.blanks) {
    localQuestion.value.blanks = []
  }
  const blankIndex = localQuestion.value.blanks.length + 1
  localQuestion.value.blanks.push({ answer: '' })
  
  // Add blank tag to content
  const currentContent = localQuestion.value.content || ''
  const blankTag = `「填空${blankIndex}」`
  localQuestion.value.content = currentContent + textInput.value + blankTag
  textInput.value = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Backspace' && textInput.value === '') {
    // Remove last blank if exists
    const content = localQuestion.value.content || ''
    const match = content.match(/「填空(\d+)」$/)
    if (match) {
      localQuestion.value.content = content.slice(0, -match[0].length)
      if (localQuestion.value.blanks && localQuestion.value.blanks.length > 0) {
        localQuestion.value.blanks.pop()
      }
      e.preventDefault()
    }
  }
}

watch(textInput, (val) => {
  // Update content when typing
  const baseContent = localQuestion.value.content || ''
  // Content is managed separately, textInput is just for new text
})
</script>