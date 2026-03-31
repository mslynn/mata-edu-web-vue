<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden relative">
    <!-- Question Type Tag - Corner Badge -->
    <div class="absolute top-0 left-0 px-3 py-1 bg-[#FF9900] text-white text-sm rounded-br-lg rounded-tl-lg">
      {{ $t('customExercise.matching') }}
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
          <ImageUploader
            :oss-id="localQuestion.contentImage"
            :image-url="localQuestion.contentImageUrl"
            :size="80"
            button-style="primary"
            :upload-fn="uploadOSS"
            @update:oss-id="localQuestion.contentImage = $event"
            @update:image-url="localQuestion.contentImageUrl = $event"
          />
          <div v-if="showError && !localQuestion.content?.trim()" class="text-sm text-red-500 mt-1">
            {{ $t('customExercise.questionContentRequired') }}
          </div>
        </div>
      </div>

      <!-- 列表区域 -->
      <!-- 列表区域 - 左右并排 -->
      <div class="flex gap-8">
        <!-- 列表1 -->
        <div class="flex items-start flex-1">
          <label class="text-sm text-gray-600 shrink-0 pt-1 whitespace-nowrap">
            <span class="text-red-500">*</span>{{ $t('customExercise.list1') }}：
          </label>
          <div class="flex-1">
            <div class="space-y-2">
              <div v-for="(item, index) in localQuestion.leftItems" :key="'left-' + index" class="flex items-center gap-2 group">
                <span class="text-sm font-medium w-4">{{ index + 1 }}</span>
                <MSelect 
                  v-model="item.type"
                  :options="typeOptions"
                  class="w-[70px]"
                />
                <!-- 文字输入 -->
                <div v-if="item.type === 'text'" class="w-[280px] relative">
                  <input 
                    v-model="item.content"
                    type="text"
                    maxlength="50"
                    :placeholder="$t('customExercise.matchItemPlaceholder')"
                    class="w-full h-8 px-2 pr-10 border rounded text-sm focus:outline-none focus:border-[#FF9900]"
                    :class="showError && !item.content?.trim() ? 'border-red-400' : 'border-gray-300'"
                  />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ item.content?.length || 0 }}/50</span>
                </div>
                <!-- 图片上传 -->
                <div v-else class="w-[280px]">
                  <ImageUploader
                    :oss-id="item.image"
                    :image-url="item.imageUrl"
                    :size="60"
                    button-style="outline"
                    :show-tip="false"
                    :upload-fn="uploadOSS"
                    @update:oss-id="item.image = $event"
                    @update:image-url="item.imageUrl = $event"
                  />
                </div>
                <!-- 删除按钮 -->
                <button 
                  class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity shrink-0"
                  @click="removeLeftItem(index)"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            <button 
              class="text-sm text-[#FF9900] hover:text-[#e68a00] mt-2"
              @click="addLeftItem"
            >
              + {{ $t('customExercise.addListItem') }}
            </button>
            <div v-if="showError && hasEmptyLeftItem" class="text-sm text-red-500 mt-1">
              {{ $t('customExercise.optionRequired') }}
            </div>
            <div v-if="showError && !isListCountEqual" class="text-sm text-red-500 mt-1">
              {{ $t('customExercise.matchingCountError') }}
            </div>
          </div>
        </div>

        <!-- 列表2 -->
        <div class="flex items-start flex-1">
          <label class="text-sm text-gray-600 shrink-0 pt-1 whitespace-nowrap">
            <span class="text-red-500">*</span>{{ $t('customExercise.list2') }}：
          </label>
          <div class="flex-1">
            <div class="space-y-2">
              <div v-for="(item, index) in localQuestion.rightItems" :key="'right-' + index" class="flex items-center gap-2 group">
                <span class="text-sm font-medium w-4">{{ String.fromCharCode(65 + index) }}</span>
                <MSelect 
                  v-model="item.type"
                  :options="typeOptions"
                  class="w-[70px]"
                />
                <!-- 文字输入 -->
                <div v-if="item.type === 'text'" class="w-[280px] relative">
                  <input 
                    v-model="item.content"
                    type="text"
                    maxlength="50"
                    :placeholder="$t('customExercise.matchItemPlaceholder')"
                    class="w-full h-8 px-2 pr-10 border rounded text-sm focus:outline-none focus:border-[#FF9900]"
                    :class="showError && !item.content?.trim() ? 'border-red-400' : 'border-gray-300'"
                  />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ item.content?.length || 0 }}/50</span>
                </div>
                <!-- 图片上传 -->
                <div v-else class="w-[280px]">
                  <ImageUploader
                    :oss-id="item.image"
                    :image-url="item.imageUrl"
                    :size="60"
                    button-style="outline"
                    :show-tip="false"
                    :upload-fn="uploadOSS"
                    @update:oss-id="item.image = $event"
                    @update:image-url="item.imageUrl = $event"
                  />
                </div>
                <!-- 删除按钮 -->
                <button 
                  class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity shrink-0"
                  @click="removeRightItem(index)"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            <button 
              class="text-sm text-[#FF9900] hover:text-[#e68a00] mt-2"
              @click="addRightItem"
            >
              + {{ $t('customExercise.addListItem') }}
            </button>
            <div v-if="showError && hasEmptyRightItem" class="text-sm text-red-500 mt-1">
              {{ $t('customExercise.optionRequired') }}
            </div>
            <div v-if="hasDuplicateAnswer" class="text-sm text-red-500 mt-1">
              {{ $t('customExercise.unmatchedRightItemError') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 答案 -->
      <div class="flex items-start">
        <label class="text-sm text-gray-600 shrink-0 w-[60px] pt-2">
          <span class="text-red-500">*</span>{{ $t('customExercise.answer') }}：
        </label>
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-4">
            <div v-for="(_, index) in localQuestion.leftItems" :key="'answer-' + index" class="flex items-center gap-1">
              <span class="text-sm">{{ index + 1 }}</span>
              <MSelect 
                :model-value="getMatchAnswer(index)"
                :options="rightOptions"
                class="w-[70px]"
                placeholder=""
                @update:model-value="setMatchAnswer(index, $event)"
              />
            </div>
          </div>
          <div v-if="showError && hasEmptyAnswer" class="text-sm text-red-500 mt-1">
            {{ $t('customExercise.answerRequired') }}
          </div>
          <div v-if="hasDuplicateAnswer" class="text-sm text-red-500 mt-1">
            {{ $t('customExercise.answerDuplicateError') }}
          </div>
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
import { taskmanagementcenterApi } from '~/composables/api/taskmanagement'
import ImageUploader from '../ui/ImageUploader.vue'

interface MatchItem {
  type: 'text' | 'image'
  content: string
  image?: string
  imageUrl?: string
}

interface Question {
  type: string
  content: string
  contentImage?: string
  contentImageUrl?: string
  score: number
  leftItems?: MatchItem[]
  rightItems?: MatchItem[]
  matchAnswers?: (number | undefined)[]
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
const { uploadOSS } = taskmanagementcenterApi()

const localQuestion = computed({
  get: () => props.question,
  set: (val) => emit('update:question', val)
})

const typeOptions = computed(() => [
  { label: t('customExercise.text'), value: 'text' },
  { label: t('customExercise.image'), value: 'image' }
])

const rightOptions = computed(() => {
  const items = localQuestion.value.rightItems || []
  return items.map((_, index) => ({
    label: String.fromCharCode(65 + index),
    value: index
  }))
})

const hasEmptyLeftItem = computed(() => {
  const items = localQuestion.value.leftItems || []
  return items.some(item => {
    if (item.type === 'image') {
      return !item.image
    }
    return !item.content?.trim()
  })
})

const hasEmptyRightItem = computed(() => {
  const items = localQuestion.value.rightItems || []
  return items.some(item => {
    if (item.type === 'image') {
      return !item.image
    }
    return !item.content?.trim()
  })
})

const isListCountEqual = computed(() => {
  const leftCount = (localQuestion.value.leftItems || []).length
  const rightCount = (localQuestion.value.rightItems || []).length
  return leftCount === rightCount
})

const hasEmptyAnswer = computed(() => {
  const answers = localQuestion.value.matchAnswers || []
  const leftCount = (localQuestion.value.leftItems || []).length
  // 检查是否所有左侧项都有对应的答案
  for (let i = 0; i < leftCount; i++) {
    if (answers[i] === undefined || answers[i] === null) {
      return true
    }
  }
  return false
})

const hasDuplicateAnswer = computed(() => {
  const answers = localQuestion.value.matchAnswers || []
  const validAnswers = answers.filter(a => a !== undefined && a !== null)
  const uniqueAnswers = new Set(validAnswers)
  return validAnswers.length !== uniqueAnswers.size
})

// 检查列表2是否有未被配对的选项
const hasUnmatchedRightItem = computed(() => {
  const answers = localQuestion.value.matchAnswers || []
  const rightCount = (localQuestion.value.rightItems || []).length
  const validAnswers = answers.filter(a => a !== undefined && a !== null) as number[]
  // 检查是否所有右侧选项都被选中了
  for (let i = 0; i < rightCount; i++) {
    if (!validAnswers.includes(i)) {
      return true
    }
  }
  return false
})

const addLeftItem = () => {
  if (!localQuestion.value.leftItems) {
    localQuestion.value.leftItems = []
  }
  if (!localQuestion.value.matchAnswers) {
    localQuestion.value.matchAnswers = []
  }
  if (localQuestion.value.leftItems.length < 10) {
    localQuestion.value.leftItems.push({ type: 'text', content: '' })
    localQuestion.value.matchAnswers.push(undefined)
  }
}

const addRightItem = () => {
  if (!localQuestion.value.rightItems) {
    localQuestion.value.rightItems = []
  }
  if (localQuestion.value.rightItems.length < 10) {
    localQuestion.value.rightItems.push({ type: 'text', content: '' })
  }
}

const removeLeftItem = (index: number) => {
  if (!localQuestion.value.leftItems || localQuestion.value.leftItems.length <= 2) return
  localQuestion.value.leftItems.splice(index, 1)
  // Also remove corresponding answer
  if (localQuestion.value.matchAnswers) {
    localQuestion.value.matchAnswers.splice(index, 1)
  }
}

const removeRightItem = (index: number) => {
  if (!localQuestion.value.rightItems || localQuestion.value.rightItems.length <= 2) return
  localQuestion.value.rightItems.splice(index, 1)
  // Update answers that reference removed or shifted items
  if (localQuestion.value.matchAnswers) {
    localQuestion.value.matchAnswers = localQuestion.value.matchAnswers.map(ans => {
      if (ans === undefined) return undefined
      if (ans === index) return undefined
      if (ans > index) return ans - 1
      return ans
    })
  }
}

const getMatchAnswer = (index: number): number | null => {
  const answers = localQuestion.value.matchAnswers
  if (!answers || answers[index] === undefined) return null
  return answers[index] as number
}

const setMatchAnswer = (index: number, value: string | number | null) => {
  if (!localQuestion.value.matchAnswers) {
    localQuestion.value.matchAnswers = []
  }
  localQuestion.value.matchAnswers[index] = value === null ? undefined : Number(value)
}
</script>
