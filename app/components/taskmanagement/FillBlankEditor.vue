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
            :class="showError && !hasContent ? 'border-red-400' : 'border-gray-300 focus-within:border-[#FF9900]'"
          >
            <template v-for="(part, idx) in contentParts" :key="idx">
              <!-- Editable text part -->
              <input
                v-if="part.type === 'text'"
                :value="part.value"
                type="text"
                class="outline-none border-none bg-transparent text-sm"
                :style="{ width: Math.max((part.value?.length || 1) * 14, 20) + 'px' }"
                :placeholder="idx === 0 && !part.value ? $t('customExercise.questionTitlePlaceholder') : ''"
                @input="updateTextPart(idx, ($event.target as HTMLInputElement).value)"
              />
              <!-- Blank tag -->
              <span 
                v-else 
                class="inline-flex items-center px-2 py-0.5 bg-[#FFF7E6] text-[#FF9900] text-xs rounded border border-[#FF9900] shrink-0"
              >「{{ $t('customExercise.blank') }}{{ part.index }}」</span>
            </template>
            <!-- Input for adding new text at the end -->
            <input
              ref="endInput"
              v-model="endText"
              type="text"
              class="flex-1 min-w-[20px] outline-none border-none bg-transparent text-sm"
              @input="appendEndText"
              @keydown.backspace="handleBackspace"
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
          <div 
            v-for="(blank, index) in localQuestion.blanks" 
            :key="index" 
            class="flex items-center gap-2 group"
          >
            <span class="text-sm text-gray-600 shrink-0 w-[40px]">{{ $t('customExercise.blank') }}{{ index + 1 }}</span>
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
            <!-- Delete button - show on hover, but not for first blank -->
            <button 
              v-if="index > 0"
              class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity w-5"
              @click="removeBlank(index)"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
            <!-- Placeholder for first blank to keep alignment -->
            <div v-else class="w-5"></div>
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
const endText = ref('')
const endInput = ref<HTMLInputElement>()

const localQuestion = computed({
  get: () => props.question,
  set: (val) => emit('update:question', val)
})

// Parse content into parts (text and blanks)
const contentParts = computed<ContentPart[]>(() => {
  const content = localQuestion.value.content || ''
  if (!content) return [{ type: 'text', value: '' }]
  
  const parts: ContentPart[] = []
  const regex = /「填空(\d+)」/g
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(content)) !== null) {
    // Add text before blank (even if empty, to allow editing)
    parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    parts.push({ type: 'blank', index: parseInt(match[1] || '0') })
    lastIndex = regex.lastIndex
  }
  
  // Add remaining text after last blank
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) })
  }
  
  return parts
})

const hasContent = computed(() => {
  const content = localQuestion.value.content || ''
  // Check if there's any actual text content (not just blank tags)
  const textOnly = content.replace(/「填空\d+」/g, '').trim()
  return textOnly.length > 0
})

const hasEmptyBlank = computed(() => {
  if (!localQuestion.value.blanks) return false
  return localQuestion.value.blanks.some(b => !b.answer?.trim())
})

const updateTextPart = (partIndex: number, newValue: string) => {
  const parts = contentParts.value
  let newContent = ''
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue
    if (part.type === 'blank') {
      newContent += `「填空${part.index}」`
    } else {
      newContent += i === partIndex ? newValue : (part.value || '')
    }
  }
  
  localQuestion.value.content = newContent
}

const appendEndText = () => {
  if (endText.value) {
    localQuestion.value.content = (localQuestion.value.content || '') + endText.value
    endText.value = ''
  }
}

const handleBackspace = (e: KeyboardEvent) => {
  if (endText.value === '') {
    const content = localQuestion.value.content || ''
    if (content.length > 0) {
      // Check if last part is a blank tag
      const match = content.match(/「填空(\d+)」$/)
      if (match) {
        const blankIndex = parseInt(match[1] || '0') - 1
        localQuestion.value.content = content.slice(0, -match[0].length)
        if (localQuestion.value.blanks && localQuestion.value.blanks.length > blankIndex) {
          localQuestion.value.blanks.splice(blankIndex, 1)
          // Re-index remaining blanks
          let newContent = localQuestion.value.content
          for (let i = blankIndex; i < localQuestion.value.blanks.length; i++) {
            newContent = newContent.replace(`「填空${i + 2}」`, `「填空${i + 1}」`)
          }
          localQuestion.value.content = newContent
        }
        e.preventDefault()
      }
    }
  }
}

const addBlank = () => {
  if (!localQuestion.value.blanks) {
    localQuestion.value.blanks = []
  }
  const blankIndex = localQuestion.value.blanks.length + 1
  localQuestion.value.blanks.push({ answer: '' })
  
  // Add blank tag to content
  localQuestion.value.content = (localQuestion.value.content || '') + `「填空${blankIndex}」`
}

const removeBlank = (index: number) => {
  if (!localQuestion.value.blanks) return
  
  // Remove blank from array
  localQuestion.value.blanks.splice(index, 1)
  
  // Remove blank tag from content and re-index
  let content = localQuestion.value.content || ''
  const blankTag = `「填空${index + 1}」`
  content = content.replace(blankTag, '')
  
  // Re-index remaining blanks
  for (let i = index + 1; i <= localQuestion.value.blanks.length + 1; i++) {
    content = content.replace(`「填空${i + 1}」`, `「填空${i}」`)
  }
  
  localQuestion.value.content = content
}
</script>