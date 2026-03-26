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
            <div
              v-if="modalLoading"
              class="flex h-[600px] items-center justify-center text-base text-gray-500"
            >
              加载中...
            </div>

            <div v-else class="flex gap-8 h-[600px]">
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
                <div class="flex-1 bg-gradient-to-br from-[#fff8ed] via-[#fffdf7] to-[#fff3df] rounded-xl overflow-hidden relative border border-[#ffd7a3]">
                  <!-- Project Name Tag -->
                  <div class="absolute top-4 left-4 z-10 bg-[#FF9900] text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm">
                    {{ projectName }}
                  </div>
                  
                  <!-- Preview Image/Video -->
                  <div v-if="activePreviewTab === 'video' && previewVideo" class="w-full h-full p-4 pt-16">
                    <video 
                      :src="previewVideo"
                      controls
                      class="w-full h-full rounded-[20px] bg-black object-contain shadow-[0_18px_36px_rgba(255,153,0,0.16)]"
                    ></video>
                  </div>

                  <div
                    v-else-if="activePreviewTab === 'image' && currentPreviewImage"
                    class="w-full h-full p-4 pt-16"
                  >
                    <div class="relative w-full h-full overflow-hidden rounded-[20px] bg-white shadow-[0_18px_36px_rgba(255,153,0,0.16)]">
                      <img
                        :src="currentPreviewImage"
                        alt="Preview"
                        class="w-full h-full object-cover"
                      />

                      <button
                        v-if="imageUrlList.length > 1"
                        class="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#ffd7a3] bg-white/92 text-[#FF9900] shadow-lg transition-all hover:bg-[#FFF7E6]"
                        @click="showPrevImage"
                      >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      <button
                        v-if="imageUrlList.length > 1"
                        class="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#ffd7a3] bg-white/92 text-[#FF9900] shadow-lg transition-all hover:bg-[#FFF7E6]"
                        @click="showNextImage"
                      >
                        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>

                      <div
                        v-if="imageUrlList.length > 1"
                        class="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/38 px-3 py-1.5 text-xs font-medium text-white"
                      >
                        <span>{{ currentImageIndex + 1 }}/{{ imageUrlList.length }}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else-if="currentPreviewImage"
                    class="w-full h-full flex items-center justify-center p-4 pt-16"
                  >
                    <div class="relative h-full w-full">
                      <img 
                        :src="currentPreviewImage" 
                        alt="Preview" 
                        class="h-full w-full rounded-[20px] object-contain bg-white shadow-[0_18px_36px_rgba(255,153,0,0.12)]"
                      />
                      <button
                        v-if="activePreviewTab === 'code' && canOpenEditor"
                        class="absolute bottom-6 left-1/2 flex h-12 -translate-x-1/2 items-center justify-center rounded-full bg-[#FF9900] px-6 text-sm font-medium text-white shadow-[0_14px_28px_rgba(255,153,0,0.28)] transition-all hover:bg-[#f39000] active:scale-95"
                        @click="handleOpenEditor"
                      >
                        进入编程平台
                      </button>
                    </div>
                  </div>

                  <div v-else class="flex h-full items-center justify-center text-sm text-[#c0a17a]">
                      暂无预览内容
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
                  <div class="flex items-center">
                    <span class="text-gray-400 text-sm w-20 shrink-0">完成时长</span>
                    <span class="text-gray-600 text-sm">{{ taskDuration }}</span>
                  </div>
                </div>

                <!-- Dimension Scoring -->
                <div class="mb-6">
                  <div class="flex items-center gap-1 mb-3">
                    <span class="font-semibold text-gray-800">{{ $t('taskManagement.teacherScore') }}</span>
                    <span class="text-[#FF9900] text-sm">{{ $t('viewScore.scoreHint') }}</span>
                  </div>
                  <div class="bg-[#F7F8FA] rounded-xl p-4 border border-gray-100">
                    <div class="flex items-center justify-between">
                      <span class="text-gray-700 text-sm">{{ $t('viewScore.totalScore') }}</span>
                      <div class="flex items-center gap-2">
                        <input
                          :value="formatScoreText(scoreInput)"
                          type="number"
                          inputmode="decimal"
                          min="0"
                          max="100"
                          step="0.5"
                          class="score-input h-10 w-32 shrink-0 rounded-lg border border-[#FFD7A3] bg-white px-3 text-left text-sm text-gray-700 outline-none transition-all focus:border-[#FF9900] focus:ring-2 focus:ring-[#FFE8CC]"
                          :placeholder="$t('viewScore.scorePlaceholder')"
                          @input="handleScoreInput"
                          @blur="handleScoreBlur"
                        />
                        <span class="text-[#FF9900] text-sm font-semibold">{{ $t('viewScore.point') }}</span>
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
                  <div class="rounded-xl bg-[#FFF7E6] px-4 py-2">
                    <span class="text-[#FF9900] font-bold text-lg">{{ formatScoreText(totalScoreDisplay) }} {{ $t('viewScore.point') }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center justify-end mt-auto">
                  <button 
                    class="px-8 py-2.5 bg-[#FF9900] text-white font-medium rounded-lg hover:bg-[#e68a00] transition-all active:scale-95"
                    @click="handleSave"
                  >
                    {{ $t('common.save') }}
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
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  rowData?: any
  detailData?: any
  loading?: boolean
  canOpenEditor?: boolean
  hasNextSubmission?: boolean
}>()

const emit = defineEmits<{
  'close': []
  'open-editor': []
  'save': [data: any]
  'next': []
}>()

const { t } = useI18n()

// Preview tabs
const previewTabs = computed(() => [
  { value: 'code', label: '作品' },
  { value: 'video', label: t('viewScore.video') },
  { value: 'image', label: t('viewScore.image') }
])

const activePreviewTab = ref('code')
const modalLoading = computed(() => Boolean(props.loading))
const currentImageIndex = ref(0)

const detailOpus = computed(() => props.detailData?.opus || {})
const imageUrlList = computed(() => {
  const rawValue = String(detailOpus.value?.picUrl || '').trim()
  if (!rawValue) return []
  return rawValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
})

const projectName = computed(
  () =>
    props.detailData?.opus?.opusName ||
    props.detailData?.taskName ||
    props.rowData?.taskName ||
    '-'
)
const studentName = computed(
  () => props.detailData?.studentName || props.rowData?.studentName || '-'
)
const taskName = computed(
  () => props.detailData?.taskName || props.rowData?.taskName || '-'
)
const submitTime = computed(
  () => props.detailData?.taskEndTime || props.rowData?.submissionTime || '-'
)
const taskDuration = computed(() => props.detailData?.taskDuration || '-')
const previewImage = computed(
  () =>
    detailOpus.value?.coverUrl ||
    imageUrlList.value[0] ||
    ''
)
const previewVideo = computed(() => detailOpus.value?.videoUrl || '')
const currentPreviewImage = computed(() => {
  if (activePreviewTab.value === 'image') {
    return imageUrlList.value[currentImageIndex.value] || previewImage.value
  }
  return previewImage.value
})

const DIMENSION_KEYS = ['creativeDesign', 'codeStandard'] as const
const MIN_SCORE = 0
const MAX_SCORE = 100

const roundToHalf = (value: number) => Math.round(value * 2) / 2

const normalizeScore = (value: unknown) => {
  const score = Number(value)
  if (!Number.isFinite(score) || score < MIN_SCORE) {
    return 0
  }
  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, roundToHalf(score)))
}

const createDimensionsFromTotalScore = (totalScore: number) => {
  let remaining = normalizeScore(totalScore)
  return DIMENSION_KEYS.map((name, index) => {
    const remainingSlots = DIMENSION_KEYS.length - index
    const current = remainingSlots > 0 ? roundToHalf(remaining / remainingSlots) : 0
    remaining = roundToHalf(Math.max(0, remaining - current))
    return {
      name,
      score: current,
    }
  })
}

const scoreInput = ref(0)

// Comment
const comment = ref('')

const formatScoreText = (value: number) => Number(value.toFixed(1)).toString()

// Total score display
const totalScoreDisplay = computed(() => {
  return Number(scoreInput.value.toFixed(1))
})

const getInputValue = (event: Event) => {
  return event.target instanceof HTMLInputElement ? event.target.value : ''
}

const handleScoreInput = (event: Event) => {
  const input = event.target instanceof HTMLInputElement ? event.target : null
  const value = getInputValue(event)
  if (!value) {
    scoreInput.value = 0
    if (input) input.value = ''
    return
  }

  const score = Number(value)
  if (!Number.isFinite(score)) return
  const nextScore = Math.min(MAX_SCORE, Math.max(MIN_SCORE, score))
  scoreInput.value = nextScore
  if (input && Number(value) !== nextScore) {
    input.value = formatScoreText(nextScore)
  }
}

const handleScoreBlur = (event: Event) => {
  scoreInput.value = normalizeScore(getInputValue(event))
}

// Handlers
const handleClose = () => {
  emit('close')
}

const handleOpenEditor = () => {
  emit('open-editor')
}

const showPrevImage = () => {
  if (imageUrlList.value.length <= 1) return
  currentImageIndex.value =
    currentImageIndex.value === 0
      ? imageUrlList.value.length - 1
      : currentImageIndex.value - 1
}

const showNextImage = () => {
  if (imageUrlList.value.length <= 1) return
  currentImageIndex.value =
    currentImageIndex.value === imageUrlList.value.length - 1
      ? 0
      : currentImageIndex.value + 1
}

const handleSave = () => {
  scoreInput.value = normalizeScore(scoreInput.value)
  if (scoreInput.value < MIN_SCORE || scoreInput.value > MAX_SCORE) {
    ElMessage.warning(t('viewScore.scoreRangeError'))
    return
  }
  ElMessage.success(t('common.success'))
  emit('save', {
    dimensions: createDimensionsFromTotalScore(totalScoreDisplay.value),
    comment: comment.value,
    totalScore: totalScoreDisplay.value
  })
}

const handleNext = () => {
  if (props.hasNextSubmission) {
    emit('next')
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      activePreviewTab.value = 'code'
      currentImageIndex.value = 0
    }
  }
)

watch(
  () => props.detailData,
  (detail) => {
    const totalScore = normalizeScore(
      detail?.score ?? props.rowData?._raw?.score ?? props.rowData?.teacherScore ?? 0
    )
    scoreInput.value = totalScore
    comment.value = String(detail?.comment ?? '').trim()
  },
  { immediate: true }
)

watch(
  () => props.detailData?.taskId,
  () => {
    currentImageIndex.value = 0
  }
)

watch(
  () => imageUrlList.value.length,
  (length) => {
    if (length === 0) {
      currentImageIndex.value = 0
      return
    }
    if (currentImageIndex.value >= length) {
      currentImageIndex.value = 0
    }
  }
)
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

.score-input::-webkit-outer-spin-button,
.score-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.score-input[type="number"] {
  -moz-appearance: textfield;
}
</style>
