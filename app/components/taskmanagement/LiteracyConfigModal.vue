<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-[2200] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
        <div class="relative bg-white rounded-lg w-[1180px] max-h-[88vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-center py-4 border-b relative">
            <h3 class="text-lg font-medium">{{ $t('literacy.configTitle') }}</h3>
            <div class="relative group/help ml-1">
              <button class="text-gray-400 hover:text-gray-500">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
              </button>
              <!-- Tooltip -->
              <div class="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-10">
                {{ $t('literacy.configHelpTip') }}
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
              </div>
            </div>
            <button 
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
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
              v-if="dataLoading"
              class="h-full flex items-center justify-center text-sm text-gray-400"
            >
              加载中...
            </div>

            <template v-else>
            <!-- Subtitle -->
            <div class="text-sm text-gray-600 mb-4">{{ $t('literacy.selectHint') }}</div>

            <!-- Four Column Selection -->
            <div class="flex border rounded-lg h-[360px]">
              <!-- Column 1: Questions -->
              <div class="w-[220px] border-r flex flex-col">
                <div class="px-3 py-2 bg-gray-50 border-b text-sm text-center font-medium">
                  {{ $t('literacy.questions') }} ({{ selectedQuestions.length }}/{{ questions.length }})
                </div>
                <div class="flex-1 overflow-auto">
                  <div 
                    v-for="(item, index) in questions" 
                    :key="'q-' + index"
                    class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm border-b border-gray-100"
                    :class="selectedQuestionIndex === index ? 'bg-[#E6F7FF]' : ''"
                    @click="selectQuestion(index)"
                    @mouseenter="showTooltip($event, `(${item.score}${$t('literacy.points')}) ${item.title}`)"
                    @mouseleave="hideTooltip"
                  >
                    <div class="flex items-center flex-1 min-w-0">
                      <span class="truncate" :class="isQuestionSelected(item.id) ? 'text-[#FF9900] font-medium' : ''">
                        ({{ item.score }}{{ $t('literacy.points') }}) {{ item.title }}
                      </span>
                      <span 
                        v-if="isQuestionSelected(item.id)" 
                        class="ml-1 px-1.5 py-0.5 bg-[#FF9900] text-white text-xs rounded shrink-0"
                      >
                        {{ $t('literacy.selected') }}
                      </span>
                    </div>
                    <svg class="w-4 h-4 text-gray-400 shrink-0 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Column 2: Level 1 Indicators -->
              <div class="flex-1 border-r flex flex-col">
                <div class="px-3 py-2 bg-gray-50 border-b text-sm text-center font-medium">
                  {{ $t('literacy.level1') }}
                </div>
                <div class="flex-1 overflow-auto">
                  <div 
                    v-for="(item, index) in level1Indicators" 
                    :key="'l1-' + index"
                    class="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm border-b border-gray-100"
                    :class="selectedLevel1Index === index ? 'bg-[#E6F7FF]' : ''"
                    @click="selectLevel1(index)"
                  >
                    <div 
                      class="w-4 h-4 mr-2 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:border-[#FF9900]"
                      :class="getLevel1CheckState(item.id) === 'full' ? 'bg-[#FF9900] border-[#FF9900]' : getLevel1CheckState(item.id) === 'partial' ? 'bg-[#FF9900] border-[#FF9900]' : 'border-gray-300'"
                      @click.stop="toggleLevel1(item)"
                    >
                      <svg v-if="getLevel1CheckState(item.id) === 'full'" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <div v-else-if="getLevel1CheckState(item.id) === 'partial'" class="w-2 h-0.5 bg-white"></div>
                    </div>
                    <span class="truncate flex-1" :class="getLevel1CheckState(item.id) !== 'none' ? 'text-[#FF9900]' : ''">{{ item.name }}</span>
                    <svg class="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Column 3: Level 2 Indicators -->
              <div class="flex-1 border-r flex flex-col">
                <div class="px-3 py-2 bg-gray-50 border-b text-sm text-center font-medium">
                  {{ $t('literacy.level2') }}
                </div>
                <div class="flex-1 overflow-auto">
                  <div 
                    v-for="(item, index) in currentLevel2Indicators" 
                    :key="'l2-' + index"
                    class="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm border-b border-gray-100"
                    :class="selectedLevel2Index === index ? 'bg-[#E6F7FF]' : ''"
                    @click="selectLevel2(index)"
                  >
                    <div 
                      class="w-4 h-4 mr-2 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:border-[#FF9900]"
                      :class="getLevel2CheckState(item.id) === 'full' ? 'bg-[#FF9900] border-[#FF9900]' : getLevel2CheckState(item.id) === 'partial' ? 'bg-[#FF9900] border-[#FF9900]' : 'border-gray-300'"
                      @click.stop="toggleLevel2(item)"
                    >
                      <svg v-if="getLevel2CheckState(item.id) === 'full'" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      <div v-else-if="getLevel2CheckState(item.id) === 'partial'" class="w-2 h-0.5 bg-white"></div>
                    </div>
                    <span class="truncate flex-1" :class="getLevel2CheckState(item.id) !== 'none' ? 'text-[#FF9900]' : ''">{{ item.name }}</span>
                    <svg class="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Column 4: Level 3 Indicators -->
              <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div class="px-3 py-2 bg-gray-50 border-b text-sm text-center font-medium">
                  {{ $t('literacy.level3') }}
                </div>
                <div class="flex-1 overflow-auto">
                  <div 
                    v-for="(item, index) in currentLevel3Indicators" 
                    :key="'l3-' + index"
                    class="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm border-b border-gray-100 min-w-0"
                    @mouseenter="showTooltip($event, item.name)"
                    @mouseleave="hideTooltip"
                  >
                    <div 
                      class="w-4 h-4 mr-2 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors hover:border-[#FF9900]"
                      :class="isLevel3Selected(item.id) ? 'bg-[#FF9900] border-[#FF9900]' : 'border-gray-300'"
                      @click.stop="toggleLevel3(item)"
                    >
                      <svg v-if="isLevel3Selected(item.id)" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <span class="truncate flex-1 min-w-0" :class="isLevel3Selected(item.id) ? 'text-[#FF9900]' : ''">
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Associated Content -->
            <div class="mt-4">
              <div class="text-sm text-gray-600 mb-2">
                {{ $t('literacy.associatedContent') }} (<span class="text-[#FF9900]">{{ totalAssociatedCount }}</span>{{ $t('literacy.itemUnit') }})
              </div>
              <div class="border rounded-lg max-h-[180px] overflow-auto">
                <div v-if="associatedByQuestion.length === 0" class="text-gray-400 text-sm text-center py-8">
                  {{ $t('literacy.noAssociated') }}
                </div>
                <div v-else>
                  <div 
                    v-for="(group, gIndex) in associatedByQuestion" 
                    :key="'group-' + gIndex"
                    class="border-b last:border-b-0"
                  >
                    <!-- Question Header -->
                    <div 
                      class="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                      @click="toggleExpand(group.questionId)"
                    >
                      <svg 
                        class="w-4 h-4 mr-2 text-gray-500 transition-transform"
                        :class="expandedQuestions.includes(group.questionId) ? '' : '-rotate-90'"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      >
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                      <span class="text-sm">
                        ({{ group.score }}{{ $t('literacy.points') }}) {{ group.title }}
                      </span>
                      <span class="text-sm text-[#FF9900] ml-2">({{ group.items.length }}{{ $t('literacy.itemUnit') }})</span>
                    </div>
                    <!-- Associated Items -->
                    <div v-if="expandedQuestions.includes(group.questionId)" class="px-3 pb-3 flex flex-wrap gap-2">
                      <div 
                        v-for="(item, iIndex) in group.items" 
                        :key="'item-' + iIndex"
                        class="px-2 py-1 bg-gray-100 text-sm rounded flex items-center gap-1 max-w-[220px]"
                        @mouseenter="showTooltip($event, item.name)"
                        @mouseleave="hideTooltip"
                      >
                        <span class="truncate">{{ item.name }}</span>
                        <button class="text-gray-400 hover:text-gray-600 shrink-0" @click.stop="removeAssociated(group.questionId, item.id)">
                          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </template>
          </div>

          <!-- Footer -->
          <div class="flex justify-center py-4 border-t">
            <button 
              class="px-8 py-2 bg-[#FF9900] text-white rounded hover:bg-[#e68a00]"
              @click="handleConfig"
            >
              {{ $t('literacy.goConfig') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Global Tooltip -->
    <Transition name="tooltip">
      <div 
        v-if="tooltipVisible"
        class="fixed px-3 py-2 bg-gray-800 text-white text-xs rounded z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-full max-w-[350px] text-center"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        {{ tooltipContent }}
        <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </Transition>

    <!-- Exit Confirm Modal -->
    <Transition name="modal">
      <div v-if="exitConfirmVisible" class="fixed inset-0 z-[2210] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="exitConfirmVisible = false"></div>
        <div class="relative bg-white rounded-lg w-[400px] p-6">
          <button 
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            @click="exitConfirmVisible = false"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <h3 class="text-lg font-medium text-center mb-4">{{ $t('literacy.reminder') }}</h3>
          <p class="text-gray-600 text-center mb-6">{{ $t('literacy.exitConfirmMessage') }}</p>
          <div class="flex justify-center gap-4">
            <button 
              class="px-8 py-2 border border-[#FF9900] text-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
              @click="exitConfirmVisible = false"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              class="px-8 py-2 bg-[#FF9900] text-white rounded hover:bg-[#e68a00] transition-colors"
              @click="confirmExit"
            >
              {{ $t('literacy.exit') }}
            </button>
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
import { taskmanagementcenterApi } from '~/composables/api/taskmanagement'

interface Question {
  id: string
  title: string
  score: number
}

interface Indicator {
  id: string
  name: string
  parentId?: string
}

const props = defineProps<{
  visible: boolean
  hasLiteracy?: boolean
  exerciseId?: string | number | null
  sourceType?: 'exercise' | 'resource'
  resourceTitle?: string
  initialConfigData?: any
}>()

const emit = defineEmits<{
  'close': []
  'config': [data: {
    configList: Array<{
      questionId: string | number
      quotaIds: Array<string | number>
    }>
  }]
}>()

const {
  getExerciseQuestions,
  getQuotaMenuTree,
  getExerciseEvalConfig
} = taskmanagementcenterApi()

// Tooltip state
const tooltipVisible = ref(false)
const tooltipContent = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)

// Exit confirm state
const exitConfirmVisible = ref(false)
const dataLoading = ref(false)
const initialAssociations = ref<Record<string, string[]>>({})
const hasChanges = computed(() => {
  return JSON.stringify(questionAssociations.value) !== JSON.stringify(initialAssociations.value)
})

const showTooltip = (event: MouseEvent, content: string) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  tooltipContent.value = content
  tooltipX.value = rect.left + rect.width / 2 // 元素水平中心
  tooltipY.value = rect.top - 8
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const questions = ref<Question[]>([])
const level1Indicators = ref<Indicator[]>([])
const level2Indicators = ref<Indicator[]>([])
const level3Indicators = ref<Indicator[]>([])

const selectedQuestionIndex = ref(0)
const selectedLevel1Index = ref(0)
const selectedLevel2Index = ref(0)
const selectedQuestions = ref<string[]>([])
const expandedQuestions = ref<string[]>([])

// Store associations per question: { questionId: [indicatorIds] }
const questionAssociations = ref<Record<string, string[]>>({})

const firstNonEmptyString = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

const toIdString = (value: any, fallback = '') => {
  const text = String(value ?? '').trim()
  return text || fallback
}

const normalizeQuestions = (data: any): Question[] => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.questions)
      ? data.questions
      : Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data?.rows)
          ? data.rows
          : []

  return list
    .map((item: any, index: number) => ({
      id: toIdString(item?.questionId ?? item?.id, `question_${index + 1}`),
      title: firstNonEmptyString(item?.questionName, item?.title, item?.name, `题目${index + 1}`),
      score: Number(item?.score ?? item?.questionScore ?? 0) || 0
    }))
    .filter((item: Question) => !!item.id)
}

const normalizeQuotaTree = (data: any) => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.list)
      ? data.list
      : Array.isArray(data?.rows)
        ? data.rows
        : []

  const nextLevel1: Indicator[] = []
  const nextLevel2: Indicator[] = []
  const nextLevel3: Indicator[] = []

  list.forEach((level1: any, level1Index: number) => {
    const level1Id = toIdString(level1?.id ?? level1?.quotaId, `level1_${level1Index + 1}`)
    if (!level1Id) return

    nextLevel1.push({
      id: level1Id,
      name: firstNonEmptyString(
        [firstNonEmptyString(level1?.quotaCode), firstNonEmptyString(level1?.quotaName, level1?.name, level1?.label)].filter(Boolean).join(' '),
        level1?.quotaName,
        level1?.name,
        level1?.label,
        `一级指标${level1Index + 1}`
      )
    })

    const level2List = Array.isArray(level1?.children) ? level1.children : []
    level2List.forEach((level2: any, level2Index: number) => {
      const level2Id = toIdString(level2?.id ?? level2?.quotaId, `level2_${level1Index + 1}_${level2Index + 1}`)
      if (!level2Id) return

      nextLevel2.push({
        id: level2Id,
        name: firstNonEmptyString(
          [firstNonEmptyString(level2?.quotaCode), firstNonEmptyString(level2?.quotaName, level2?.name, level2?.label)].filter(Boolean).join(' '),
          level2?.quotaName,
          level2?.name,
          level2?.label,
          `二级指标${level2Index + 1}`
        ),
        parentId: level1Id
      })

      const level3List = Array.isArray(level2?.children) ? level2.children : []
      level3List.forEach((level3: any, level3Index: number) => {
        const level3Id = toIdString(level3?.id ?? level3?.quotaId, `level3_${level2Index + 1}_${level3Index + 1}`)
        if (!level3Id) return

        nextLevel3.push({
          id: level3Id,
          name: firstNonEmptyString(
            [firstNonEmptyString(level3?.quotaCode), firstNonEmptyString(level3?.quotaName, level3?.name, level3?.label)].filter(Boolean).join(' '),
            level3?.quotaName,
            level3?.name,
            level3?.label,
            `三级指标${level3Index + 1}`
          ),
          parentId: level2Id
        })
      })
    })
  })

  level1Indicators.value = nextLevel1
  level2Indicators.value = nextLevel2
  level3Indicators.value = nextLevel3
}

const normalizeExerciseEvalConfig = (data: any): Record<string, string[]> => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.configList)
      ? data.configList
      : Array.isArray(data?.list)
        ? data.list
        : Array.isArray(data?.data)
          ? data.data
        : []

  const associations: Record<string, string[]> = {}
  list.forEach((item: any) => {
    const questionId = toIdString(item?.questionId)
    const quotaIds = Array.isArray(item?.quotaIds)
      ? item.quotaIds.map((id: any) => toIdString(id)).filter(Boolean)
      : Array.isArray(item?.quotaList)
        ? item.quotaList
            .map((quota: any) => toIdString(quota?.quotaId ?? quota?.id))
            .filter(Boolean)
        : []

    if (questionId) {
      associations[questionId] = quotaIds
    }
  })

  return associations
}

const normalizeResourceEvalConfig = (
  resourceId: string,
  data: any
): Record<string, string[]> => {
  if (!resourceId) return {}

  const configList = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.rows)
        ? data.rows
      : Array.isArray(data?.configList)
        ? data.configList
        : []

  const matchedConfigList = configList.filter(
    (item: any) => toIdString(item?.objectId ?? item?.questionId) === resourceId
  )

  const collectedQuotaIds = matchedConfigList.flatMap((item: any) => {
    if (Array.isArray(item?.quotaIds)) {
      return item.quotaIds.map((id: any) => toIdString(id)).filter(Boolean)
    }
    if (Array.isArray(item?.quotaList)) {
      return item.quotaList
        .map((quota: any) => toIdString(quota?.quotaId ?? quota?.id))
        .filter(Boolean)
    }
    const singleQuotaId = toIdString(item?.quotaId)
    return singleQuotaId ? [singleQuotaId] : []
  })

  const quotaIds = collectedQuotaIds.length > 0
    ? Array.from(new Set(collectedQuotaIds))
    : Array.isArray(data?.quotaIds)
      ? data.quotaIds.map((id: any) => toIdString(id)).filter(Boolean)
      : Array.isArray(data?.quotaList)
        ? data.quotaList
            .map((quota: any) => toIdString(quota?.quotaId ?? quota?.id))
            .filter(Boolean)
        : []

  return quotaIds.length > 0 ? { [resourceId]: quotaIds } : {}
}

const syncDefaultIndicatorSelection = () => {
  const firstQuestionId = selectedQuestions.value[0]
  if (!firstQuestionId) {
    selectedQuestionIndex.value = 0
    selectedLevel1Index.value = 0
    selectedLevel2Index.value = 0
    return
  }

  const questionIndex = questions.value.findIndex((question) => question.id === firstQuestionId)
  selectedQuestionIndex.value = questionIndex >= 0 ? questionIndex : 0

  const firstQuotaId = questionAssociations.value[firstQuestionId]?.[0]
  if (!firstQuotaId) {
    selectedLevel1Index.value = 0
    selectedLevel2Index.value = 0
    return
  }

  const level3Item = level3Indicators.value.find((item) => item.id === firstQuotaId)
  const level2Id = level3Item?.parentId
  const level2Index = level2Id
    ? level2Indicators.value.findIndex((item) => item.id === level2Id)
    : -1
  const level1Id = level2Index >= 0 ? level2Indicators.value[level2Index]?.parentId : ''
  const level1Index = level1Id
    ? level1Indicators.value.findIndex((item) => item.id === level1Id)
    : -1

  selectedLevel1Index.value = level1Index >= 0 ? level1Index : 0
  const currentLevel2List = level2Indicators.value.filter(
    (item) => item.parentId === level1Indicators.value[selectedLevel1Index.value]?.id
  )
  const currentLevel2Index = level2Id
    ? currentLevel2List.findIndex((item) => item.id === level2Id)
    : -1
  selectedLevel2Index.value = currentLevel2Index >= 0 ? currentLevel2Index : 0
}

const loadModalData = async () => {
  if (!props.exerciseId) {
    questions.value = []
    level1Indicators.value = []
    level2Indicators.value = []
    level3Indicators.value = []
    selectedQuestions.value = []
    questionAssociations.value = {}
    expandedQuestions.value = []
    initialAssociations.value = {}
    return
  }

  dataLoading.value = true
  try {
    const quotaTree = await getQuotaMenuTree()
    normalizeQuotaTree(quotaTree)

    if (props.sourceType === 'resource') {
      const resourceId = toIdString(props.exerciseId)
      questions.value = resourceId
        ? [
            {
              id: resourceId,
              title: firstNonEmptyString(props.resourceTitle, '个人资源'),
              score: 0
            }
          ]
        : []

      questionAssociations.value = normalizeResourceEvalConfig(
        resourceId,
        props.initialConfigData
      )
    } else {
      const [questionData, exerciseConfig] = await Promise.all([
        getExerciseQuestions(String(props.exerciseId)),
        getExerciseEvalConfig(String(props.exerciseId))
      ])

      questions.value = normalizeQuestions(questionData)
      questionAssociations.value = normalizeExerciseEvalConfig(exerciseConfig)
    }

    selectedQuestions.value = Object.keys(questionAssociations.value)
      .filter(Boolean)
    expandedQuestions.value = [...selectedQuestions.value]
    syncDefaultIndicatorSelection()
    initialAssociations.value = JSON.parse(JSON.stringify(questionAssociations.value))
  } catch (error) {
    console.error('加载素养评价配置数据失败:', error)
    ElMessage.error('加载素养评价配置数据失败')
  } finally {
    dataLoading.value = false
  }
}

watch(() => [props.visible, props.exerciseId, props.hasLiteracy, props.sourceType, props.initialConfigData] as const, ([visible]) => {
  if (!visible) return
  loadModalData()
}, { immediate: true })

const currentLevel2Indicators = computed(() => {
  if (selectedLevel1Index.value < 0) return []
  const parentId = level1Indicators.value[selectedLevel1Index.value]?.id
  if (!parentId) return []
  return level2Indicators.value.filter(item => item.parentId === parentId)
})

const currentLevel3Indicators = computed(() => {
  if (selectedLevel2Index.value < 0 || currentLevel2Indicators.value.length === 0) return []
  const parentId = currentLevel2Indicators.value[selectedLevel2Index.value]?.id
  if (!parentId) return []
  return level3Indicators.value.filter(item => item.parentId === parentId)
})

const currentQuestionId = computed(() => {
  return questions.value[selectedQuestionIndex.value]?.id
})

const associatedByQuestion = computed(() => {
  const result: { questionId: string; title: string; score: number; items: { id: string; name: string }[] }[] = []
  
  for (const qId of selectedQuestions.value) {
    const question = questions.value.find(q => q.id === qId)
    const indicatorIds = questionAssociations.value[qId] || []
    if (question && indicatorIds.length > 0) {
      const items = indicatorIds.map(id => {
        const indicator = level3Indicators.value.find(i => i.id === id)
        return indicator ? { id: indicator.id, name: indicator.name } : null
      }).filter(Boolean) as { id: string; name: string }[]
      
      if (items.length > 0) {
        result.push({
          questionId: qId,
          title: question.title,
          score: question.score,
          items
        })
      }
    }
  }
  return result
})

const totalAssociatedCount = computed(() => {
  return associatedByQuestion.value.reduce((sum, g) => sum + g.items.length, 0)
})

const selectQuestion = (index: number) => {
  selectedQuestionIndex.value = index
}

const selectLevel1 = (index: number) => {
  selectedLevel1Index.value = index
  selectedLevel2Index.value = 0  // 默认选中第一个二级指标
}

const selectLevel2 = (index: number) => {
  selectedLevel2Index.value = index
}

const isQuestionSelected = (id: string) => selectedQuestions.value.includes(id)

// 获取一级指标的选中状态: 'none' | 'partial' | 'full'
const getLevel1CheckState = (id: string): 'none' | 'partial' | 'full' => {
  const qId = currentQuestionId.value
  if (!qId) return 'none'
  
  const associations = questionAssociations.value[qId] || []
  const level2Ids = level2Indicators.value.filter(l2 => l2.parentId === id).map(l2 => l2.id)
  const allLevel3Ids: string[] = []
  level2Ids.forEach(l2Id => {
    const l3Ids = level3Indicators.value.filter(l3 => l3.parentId === l2Id).map(l3 => l3.id)
    allLevel3Ids.push(...l3Ids)
  })
  
  if (allLevel3Ids.length === 0) return 'none'
  
  const selectedCount = allLevel3Ids.filter(l3Id => associations.includes(l3Id)).length
  if (selectedCount === 0) return 'none'
  if (selectedCount === allLevel3Ids.length) return 'full'
  return 'partial'
}

// 获取二级指标的选中状态: 'none' | 'partial' | 'full'
const getLevel2CheckState = (id: string): 'none' | 'partial' | 'full' => {
  const qId = currentQuestionId.value
  if (!qId) return 'none'
  
  const associations = questionAssociations.value[qId] || []
  const level3Ids = level3Indicators.value.filter(l3 => l3.parentId === id).map(l3 => l3.id)
  
  if (level3Ids.length === 0) return 'none'
  
  const selectedCount = level3Ids.filter(l3Id => associations.includes(l3Id)).length
  if (selectedCount === 0) return 'none'
  if (selectedCount === level3Ids.length) return 'full'
  return 'partial'
}

const isLevel3Selected = (id: string) => {
  const qId = currentQuestionId.value
  if (!qId) return false
  const associations = questionAssociations.value[qId] || []
  return associations.includes(id)
}

const toggleLevel1 = (item: Indicator) => {
  const qId = currentQuestionId.value
  if (!qId) return
  
  // 切换到对应的子级列表
  const index = level1Indicators.value.findIndex(l1 => l1.id === item.id)
  if (index >= 0) {
    selectedLevel1Index.value = index
    selectedLevel2Index.value = 0
  }
  
  // Select/deselect all level3 under this level1
  const level2Ids = level2Indicators.value.filter(l2 => l2.parentId === item.id).map(l2 => l2.id)
  const level3Ids = level3Indicators.value.filter(l3 => level2Ids.includes(l3.parentId!)).map(l3 => l3.id)
  
  if (!questionAssociations.value[qId]) {
    questionAssociations.value[qId] = []
  }
  
  const currentAssociations = questionAssociations.value[qId]
  const state = getLevel1CheckState(item.id)
  if (state !== 'none') {
    questionAssociations.value[qId] = currentAssociations.filter((id: string) => !level3Ids.includes(id))
  } else {
    level3Ids.forEach(id => {
      if (!currentAssociations.includes(id)) {
        currentAssociations.push(id)
      }
    })
  }
  updateSelectedQuestions()
}

const toggleLevel2 = (item: Indicator) => {
  const qId = currentQuestionId.value
  if (!qId) return
  
  // 切换到对应的三级列表
  const index = currentLevel2Indicators.value.findIndex(l2 => l2.id === item.id)
  if (index >= 0) {
    selectedLevel2Index.value = index
  }
  
  const level3Ids = level3Indicators.value.filter(l3 => l3.parentId === item.id).map(l3 => l3.id)
  
  if (!questionAssociations.value[qId]) {
    questionAssociations.value[qId] = []
  }
  
  const currentAssociations = questionAssociations.value[qId]
  const state = getLevel2CheckState(item.id)
  if (state !== 'none') {
    questionAssociations.value[qId] = currentAssociations.filter((id: string) => !level3Ids.includes(id))
  } else {
    level3Ids.forEach(id => {
      if (!currentAssociations.includes(id)) {
        currentAssociations.push(id)
      }
    })
  }
  updateSelectedQuestions()
}

const toggleLevel3 = (item: Indicator) => {
  const qId = currentQuestionId.value
  if (!qId) return
  
  if (!questionAssociations.value[qId]) {
    questionAssociations.value[qId] = []
  }
  
  const index = questionAssociations.value[qId].indexOf(item.id)
  if (index > -1) {
    questionAssociations.value[qId].splice(index, 1)
  } else {
    questionAssociations.value[qId].push(item.id)
  }
  updateSelectedQuestions()
}

const updateSelectedQuestions = () => {
  const qId = currentQuestionId.value
  if (!qId) return
  
  const hasAssociations = (questionAssociations.value[qId] || []).length > 0
  
  if (hasAssociations && !selectedQuestions.value.includes(qId)) {
    selectedQuestions.value.push(qId)
  }

  if (hasAssociations && !expandedQuestions.value.includes(qId)) {
    expandedQuestions.value.push(qId)
  } else if (!hasAssociations && selectedQuestions.value.includes(qId)) {
    const idx = selectedQuestions.value.indexOf(qId)
    selectedQuestions.value.splice(idx, 1)
  }

  if (!hasAssociations && expandedQuestions.value.includes(qId)) {
    const expandedIdx = expandedQuestions.value.indexOf(qId)
    expandedQuestions.value.splice(expandedIdx, 1)
  }
}

const toggleExpand = (questionId: string) => {
  const index = expandedQuestions.value.indexOf(questionId)
  if (index > -1) {
    expandedQuestions.value.splice(index, 1)
  } else {
    expandedQuestions.value.push(questionId)
  }
}

const removeAssociated = (questionId: string, indicatorId: string) => {
  if (questionAssociations.value[questionId]) {
    const index = questionAssociations.value[questionId].indexOf(indicatorId)
    if (index > -1) {
      questionAssociations.value[questionId].splice(index, 1)
    }
    // Remove question from selected if no associations left
    if (questionAssociations.value[questionId].length === 0) {
      const qIdx = selectedQuestions.value.indexOf(questionId)
      if (qIdx > -1) {
        selectedQuestions.value.splice(qIdx, 1)
      }
    }
  }
}

const handleConfig = () => {
  const configList = Object.entries(questionAssociations.value)
    .map(([questionId, quotaIds]) => ({
      questionId,
      quotaIds: quotaIds || []
    }))
    .filter((item) => !!item.questionId && item.quotaIds.length > 0)

  emit('config', { configList })
  emit('close')
}

const handleClose = () => {
  if (hasChanges.value) {
    exitConfirmVisible.value = true
  } else {
    emit('close')
  }
}

const confirmExit = () => {
  exitConfirmVisible.value = false
  emit('close')
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
