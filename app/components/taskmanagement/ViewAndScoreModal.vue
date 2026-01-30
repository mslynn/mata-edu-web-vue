<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
        <div class="relative bg-white rounded-2xl w-[1200px] max-h-[90vh] flex flex-col shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-center py-5 border-b border-gray-100 relative">
            <h3 class="text-lg font-semibold text-gray-800">{{ $t('viewScore.title') }}</h3>
            <button 
              class="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              @click="handleClose"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-hidden p-6">
            <div class="flex gap-8 h-[600px]">
              <!-- Left: Preview Area -->
              <div class="flex-1 flex flex-col">
                <!-- Tabs -->
                <div class="flex justify-center mb-5">
                  <div class="inline-flex rounded-full overflow-hidden border border-gray-200 p-1 bg-gray-50">
                    <button 
                      v-for="tab in previewTabs" 
                      :key="tab.value"
                      class="px-6 py-2 text-sm font-medium rounded-full transition-all duration-200"
                      :class="activePreviewTab === tab.value 
                        ? 'bg-[#FF9900] text-white shadow-md' 
                        : 'bg-transparent text-gray-500 hover:text-gray-700'"
                      @click="activePreviewTab = tab.value"
                    >
                      {{ tab.label }}
                    </button>
                  </div>
                </div>

                <!-- Preview Content -->
                <div class="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                  <!-- Project Name Tag -->
                  <div class="absolute top-4 left-4 z-10 bg-[#1890FF] text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm">
                    {{ projectName }}
                  </div>
                  
                  <!-- Preview Image/Video -->
                  <div class="w-full h-full flex items-center justify-center p-4">
                    <img 
                      v-if="activePreviewTab === 'code' || activePreviewTab === 'image'"
                      :src="previewImage" 
                      alt="Preview" 
                      class="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                    />
                    <video 
                      v-else-if="activePreviewTab === 'video'"
                      :src="previewVideo"
                      controls
                      class="max-w-full max-h-full rounded-lg"
                    ></video>
                  </div>

                  <!-- View Source Code Button -->
                  <div class="absolute bottom-5 left-1/2 -translate-x-1/2">
                    <button 
                      class="px-6 py-2.5 bg-[#1890FF] text-white text-sm font-medium rounded-full hover:bg-[#40a9ff] transition-all shadow-lg hover:shadow-xl active:scale-95"
                      @click="handleViewSourceCode"
                    >
                      {{ $t('viewScore.viewSourceCode') }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right: Score Area -->
              <div class="w-[360px] flex flex-col">
                <!-- Student Info Card -->
                <div class="space-y-2 mb-6 pb-4 border-b border-gray-100">
                  <div class="flex items-center">
                    <span class="text-gray-400 text-sm w-20 shrink-0">{{ $t('viewScore.studentName') }}</span>
                    <span class="text-gray-800 font-medium">{{ studentName }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-400 text-sm w-20 shrink-0">{{ $t('viewScore.taskName') }}</span>
                    <span class="text-gray-800 font-medium">{{ taskName }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-gray-400 text-sm w-20 shrink-0">{{ $t('viewScore.submitTime') }}</span>
                    <span class="text-gray-600 text-sm">{{ submitTime }}</span>
                  </div>
                </div>

                <!-- Dimension Scoring -->
                <div class="mb-6">
                  <div class="flex items-center gap-1 mb-3">
                    <span class="font-semibold text-gray-800">{{ $t('viewScore.dimensionScore') }}</span>
                    <span class="text-[#FF9900] text-sm">{{ $t('viewScore.dimensionScoreHint') }}</span>
                  </div>
                  <div class="bg-[#F7F8FA] rounded-xl p-4 border border-gray-100">
                    <div class="space-y-4">
                      <div v-for="(dim, index) in dimensions" :key="index" class="flex items-center justify-between">
                        <span class="text-gray-700 text-sm">{{ getDimensionName(dim.name) }}</span>
                        <div class="flex items-center gap-2">
                          <StarRating 
                            v-model="dim.score"
                            :size="20"
                            :readonly="false"
                          />
                          <span class="text-gray-300 text-xs mx-1">--------</span>
                          <span class="text-[#FF9900] text-sm font-semibold min-w-[50px] text-right">{{ dim.score }} {{ $t('viewScore.point') }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Comment -->
                <div class="mb-6">
                  <div class="font-semibold text-gray-800 mb-3">{{ $t('viewScore.comment') }}</div>
                  <textarea 
                    v-model="comment"
                    :placeholder="$t('viewScore.commentPlaceholder')"
                    maxlength="100"
                    class="w-full h-[100px] px-4 py-3 bg-[#F7F8FA] border border-gray-100 rounded-xl text-sm resize-none focus:outline-none focus:border-[#FF9900] focus:bg-white transition-all placeholder:text-gray-400"
                  ></textarea>
                </div>

                <!-- Total Score -->
                <div class="flex items-center justify-between py-4 border-t border-gray-100 mb-4">
                  <span class="text-gray-700 font-semibold">{{ $t('viewScore.totalScore') }}</span>
                  <div class="flex items-center gap-2">
                    <StarRating 
                      :model-value="averageScore"
                      :size="20"
                      readonly
                    />
                    <span class="text-gray-300 text-xs mx-1">--------</span>
                    <span class="text-[#FF9900] font-bold text-lg">{{ totalScoreDisplay }} {{ $t('viewScore.point') }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end gap-3 mt-auto">
                  <button 
                    class="px-8 py-2.5 bg-[#FF9900] text-white font-medium rounded-lg hover:bg-[#e68a00] transition-all active:scale-95"
                    @click="handleSave"
                  >
                    {{ $t('common.save') }}
                  </button>
                  <button 
                    class="px-8 py-2.5 font-medium rounded-lg transition-all"
                    :class="hasNextSubmission 
                      ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-95' 
                      : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'"
                    :disabled="!hasNextSubmission"
                    @click="handleNext"
                  >
                    {{ $t('viewScore.next') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  rowData?: any
  hasNextSubmission?: boolean
}>()

const emit = defineEmits<{
  'close': []
  'save': [data: any]
  'next': []
}>()

const { t } = useI18n()

// Preview tabs
const previewTabs = computed(() => [
  { value: 'code', label: t('viewScore.code') },
  { value: 'video', label: t('viewScore.video') },
  { value: 'image', label: t('viewScore.image') }
])

const activePreviewTab = ref('code')

// Mock data
const projectName = ref('uCode4-2')
const studentName = computed(() => props.rowData?.studentName || 'tony')
const taskName = ref('uCode4')
const submitTime = computed(() => props.rowData?.submissionTime || '2026-01-23 15:45:30')
const previewImage = ref('https://via.placeholder.com/600x400/E8F4FD/1890FF?text=Preview')
const previewVideo = ref('')

// Dimensions scoring (support half stars: 0.5, 1, 1.5, 2, 2.5, 3)
const dimensions = ref([
  { name: 'creativeDesign', score: 2.5 },
  { name: 'codeStandard', score: 2 }
])

// Get dimension display name
const getDimensionName = (key: string) => {
  return t(`viewScore.dimensions.${key}`)
}

// Comment
const comment = ref('')

// Calculate average score (rounded to 0.5)
const averageScore = computed(() => {
  if (dimensions.value.length === 0) return 0
  const total = dimensions.value.reduce((sum, dim) => sum + dim.score, 0)
  const avg = total / dimensions.value.length
  return Math.round(avg * 2) / 2 // Round to nearest 0.5
})

// Total score display
const totalScoreDisplay = computed(() => {
  const total = dimensions.value.reduce((sum, dim) => sum + dim.score, 0)
  return total
})

// Handlers
const handleClose = () => {
  emit('close')
}

const handleViewSourceCode = () => {
  console.log('View source code')
}

const handleSave = () => {
  ElMessage.success(t('common.success'))
  emit('save', {
    dimensions: dimensions.value,
    comment: comment.value,
    totalScore: totalScoreDisplay.value
  })
}

const handleNext = () => {
  if (props.hasNextSubmission) {
    emit('next')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
