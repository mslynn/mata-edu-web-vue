<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
        <div class="relative bg-white rounded-lg w-[1000px] max-h-[85vh] flex flex-col">
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
            <!-- Subtitle -->
            <div class="text-sm text-gray-600 mb-4">{{ $t('literacy.selectHint') }}</div>

            <!-- Four Column Selection -->
            <div class="flex border rounded-lg h-[280px]">
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
      <div v-if="exitConfirmVisible" class="fixed inset-0 z-[60] flex items-center justify-center">
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

interface Question {
  id: number
  title: string
  score: number
}

interface Indicator {
  id: number
  name: string
  parentId?: number
}

const props = defineProps<{
  visible: boolean
  hasLiteracy?: boolean
}>()

const emit = defineEmits<{
  'close': []
  'config': [data: any]
}>()

// Tooltip state
const tooltipVisible = ref(false)
const tooltipContent = ref('')
const tooltipX = ref(0)
const tooltipY = ref(0)

// Exit confirm state
const exitConfirmVisible = ref(false)
const initialAssociations = ref<Record<number, number[]>>({})
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

// Watch visible to reset state based on hasLiteracy
watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (props.hasLiteracy) {
      // 已配置：所有试题都选中，但只关联第一个一级指标下的所有三级指标
      const allQuestionIds = questions.value.map(q => q.id)
      
      // 获取第一个一级指标下的所有三级指标
      const firstLevel1Id = level1Indicators.value[0]?.id
      const level2IdsUnderFirst = level2Indicators.value
        .filter(l2 => l2.parentId === firstLevel1Id)
        .map(l2 => l2.id)
      const level3IdsUnderFirst = level3Indicators.value
        .filter(l3 => level2IdsUnderFirst.includes(l3.parentId!))
        .map(l3 => l3.id)
      
      selectedQuestions.value = [...allQuestionIds]
      
      // 每个试题都关联第一个一级指标下的所有三级指标
      const associations: Record<number, number[]> = {}
      allQuestionIds.forEach(qId => {
        associations[qId] = [...level3IdsUnderFirst]
      })
      questionAssociations.value = associations
      expandedQuestions.value = allQuestionIds[0] ? [allQuestionIds[0]] : []
    } else {
      // 未配置：清空所有选中
      selectedQuestions.value = []
      questionAssociations.value = {}
      expandedQuestions.value = []
    }
    selectedQuestionIndex.value = 0
    selectedLevel1Index.value = 0
    selectedLevel2Index.value = 0
    // 保存初始状态用于比较
    initialAssociations.value = JSON.parse(JSON.stringify(questionAssociations.value))
  }
})

// Mock data
const questions = ref<Question[]>([
  { id: 1, title: '图像识别技术最适合应用在哪些场景中？', score: 10 },
  { id: 2, title: '卷积神经网络（CNN）的主要特点是什么？', score: 10 },
  { id: 3, title: '以下哪个场景最适合使用实时图像识别技术？', score: 10 },
  { id: 4, title: '当图像识别系统出现误判时应该如何处理？', score: 10 },
  { id: 5, title: '某公司用人脸识别技术进行考勤管理的优缺点', score: 10 },
  { id: 6, title: '关于Nous Camera智能摄像头的功能描述', score: 10 },
  { id: 7, title: '请写出实物编程机器人的三个主要应用场景', score: 10 },
  { id: 8, title: 'Vincibot机器套件包含哪些核心组件？', score: 10 },
  { id: 9, title: '将下列产品与其对应的应用领域进行匹配', score: 20 }
])

const level1Indicators = ref<Indicator[]>([
  { id: 1, name: '1人工智能意识' },
  { id: 2, name: '2人工智能技术' },
  { id: 3, name: '3人工智能应用' },
  { id: 4, name: '4人工智能思维' },
  { id: 5, name: '5智能社会责任' }
])

const level2Indicators = ref<Indicator[]>([
  { id: 11, name: '1.1人工智能相关概念', parentId: 1 },
  { id: 12, name: '1.2人工智能技术优缺点', parentId: 1 },
  { id: 13, name: '1.3人工智能发展历程', parentId: 1 },
  { id: 21, name: '2.1机器学习基础', parentId: 2 },
  { id: 22, name: '2.2深度学习', parentId: 2 },
  { id: 31, name: '3.1智能家居应用', parentId: 3 },
  { id: 32, name: '3.2智能交通应用', parentId: 3 },
  { id: 41, name: '4.1人机协同思维', parentId: 4 },
  { id: 42, name: '4.2创新思维', parentId: 4 },
  { id: 43, name: '4.3计算思维', parentId: 4 },
  { id: 51, name: '5.1数据安全与隐私', parentId: 5 },
  { id: 52, name: '5.2人工智能伦理', parentId: 5 }
])

const level3Indicators = ref<Indicator[]>([
  { id: 111, name: '1.1.1理解"智能""人工智能"的概念和内涵❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌', parentId: 11 },
  { id: 112, name: '1.1.2认识人类、动物与机器智能的区别与联系', parentId: 11 },
  { id: 113, name: '1.1.3知道机器能够模拟、延伸和扩展人类智能嘟嘟嘟嘟嘟嘟哒哒哒哒', parentId: 11 },
  { id: 114, name: '1.1.4了解人工智能在各个领域的应用场景', parentId: 11 },
  { id: 115, name: '1.1.5能够基于对人工智能的理解分析实际问题', parentId: 11 },
  { id: 121, name: '1.2.1认识人工智能在技术上的优势和特点', parentId: 12 },
  { id: 122, name: '1.2.2了解人工智能的局限性', parentId: 12 },
  { id: 131, name: '1.3.1了解人工智能发展历史', parentId: 13 },
  { id: 211, name: '2.1.1理解机器学习基本概念', parentId: 21 },
  { id: 212, name: '2.1.2了解监督学习与非监督学习', parentId: 21 },
  { id: 221, name: '2.2.1理解深度学习基本原理', parentId: 22 },
  { id: 311, name: '3.1.1了解智能家居系统组成', parentId: 31 },
  { id: 321, name: '3.2.1了解智能交通应用场景', parentId: 32 },
  { id: 411, name: '4.1.1了解协作可以是人与人、人与机器之间的合作滴滴滴滴滴滴滴滴滴的', parentId: 41 },
  { id: 412, name: '4.1.2认识自身和智能机器各自的优势与不足', parentId: 41 },
  { id: 421, name: '4.2.1理解创新思维的概念', parentId: 42 },
  { id: 431, name: '4.3.1理解计算思维的概念', parentId: 43 },
  { id: 511, name: '5.1.1了解数据安全的重要性', parentId: 51 },
  { id: 521, name: '5.2.1理解人工智能伦理问题', parentId: 52 }
])

const selectedQuestionIndex = ref(0)
const selectedLevel1Index = ref(0)
const selectedLevel2Index = ref(0)
const selectedQuestions = ref<number[]>([1, 2])
const expandedQuestions = ref<number[]>([1])

// Store associations per question: { questionId: [indicatorIds] }
const questionAssociations = ref<Record<number, number[]>>({
  1: [111, 112, 113, 114, 115, 121, 122, 131],
  2: [211, 212, 221]
})

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
  const result: { questionId: number; title: string; score: number; items: { id: number; name: string }[] }[] = []
  
  for (const qId of selectedQuestions.value) {
    const question = questions.value.find(q => q.id === qId)
    const indicatorIds = questionAssociations.value[qId] || []
    if (question && indicatorIds.length > 0) {
      const items = indicatorIds.map(id => {
        const indicator = level3Indicators.value.find(i => i.id === id)
        return indicator ? { id: indicator.id, name: indicator.name } : null
      }).filter(Boolean) as { id: number; name: string }[]
      
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

const isQuestionSelected = (id: number) => selectedQuestions.value.includes(id)

// 获取一级指标的选中状态: 'none' | 'partial' | 'full'
const getLevel1CheckState = (id: number): 'none' | 'partial' | 'full' => {
  const qId = currentQuestionId.value
  if (!qId) return 'none'
  
  const associations = questionAssociations.value[qId] || []
  const level2Ids = level2Indicators.value.filter(l2 => l2.parentId === id).map(l2 => l2.id)
  const allLevel3Ids: number[] = []
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
const getLevel2CheckState = (id: number): 'none' | 'partial' | 'full' => {
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

const isLevel3Selected = (id: number) => {
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
    questionAssociations.value[qId] = currentAssociations.filter((id: number) => !level3Ids.includes(id))
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
    questionAssociations.value[qId] = currentAssociations.filter((id: number) => !level3Ids.includes(id))
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
  } else if (!hasAssociations && selectedQuestions.value.includes(qId)) {
    const idx = selectedQuestions.value.indexOf(qId)
    selectedQuestions.value.splice(idx, 1)
  }
}

const toggleExpand = (questionId: number) => {
  const index = expandedQuestions.value.indexOf(questionId)
  if (index > -1) {
    expandedQuestions.value.splice(index, 1)
  } else {
    expandedQuestions.value.push(questionId)
  }
}

const removeAssociated = (questionId: number, indicatorId: number) => {
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
  emit('config', { associations: questionAssociations.value })
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
