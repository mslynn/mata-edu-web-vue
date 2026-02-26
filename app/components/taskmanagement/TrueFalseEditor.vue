<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden relative">
    <!-- Question Type Tag - Corner Badge -->
    <div class="absolute top-0 left-0 px-3 py-1 bg-[#FF9900] text-white text-sm rounded-br-lg rounded-tl-lg">
      {{ $t('customExercise.trueFalse') }}
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

      <!-- 判断题答案 -->
      <div class="flex items-start">
        <label class="text-sm text-gray-600 shrink-0 w-[60px] pt-2">
          <span class="text-red-500">*</span>{{ $t('customExercise.answer') }}：
        </label>
        <div class="flex-1">
          <div class="space-y-2">
            <!-- 正确选项 -->
            <label class="flex items-center cursor-pointer">
              <input 
                type="radio"
                :name="'trueFalse-' + questionIndex"
                :checked="localQuestion.correctAnswer === true"
                class="sr-only peer"
                @change="localQuestion.correctAnswer = true"
              />
              <span class="radio-circle"></span>
              <span class="ml-2 text-sm text-gray-700">{{ $t('customExercise.correct') }}</span>
            </label>
            <!-- 错误选项 -->
            <label class="flex items-center cursor-pointer">
              <input 
                type="radio"
                :name="'trueFalse-' + questionIndex"
                :checked="localQuestion.correctAnswer === false"
                class="sr-only peer"
                @change="localQuestion.correctAnswer = false"
              />
              <span class="radio-circle"></span>
              <span class="ml-2 text-sm text-gray-700">{{ $t('customExercise.incorrect') }}</span>
            </label>
          </div>
          <div v-if="showError && localQuestion.correctAnswer === undefined" class="text-sm text-red-500 mt-1">
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
        <div v-if="showError && (localQuestion.score < 1 || localQuestion.score > 100)" class="ml-[60px] mt-1 text-sm text-red-500">
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
import { taskmanagementcenterApi } from '~/composables/api/taskmanagement'
import ImageUploader from '../ui/ImageUploader.vue'

interface Question {
  type: string
  content: string
  contentImage?: string
  contentImageUrl?: string
  score: number
  correctAnswer?: boolean | number | number[]
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

const { uploadOSS } = taskmanagementcenterApi()

const localQuestion = computed({
  get: () => props.question,
  set: (val) => emit('update:question', val)
})
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
</style>