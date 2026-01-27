<template>
  <div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Row 1: Breadcrumb -->
    <div class="pl-[6%] pr-[5%] py-4">
      <div class="flex items-center text-sm text-gray-500">
        <span class="hover:text-gray-700 transition-colors cursor-pointer" @click="goHome">{{ $t('nav.myDesktop') }}</span>
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="hover:text-gray-700 transition-colors cursor-pointer" @click="goTaskManagement">{{ $t('taskManagement.title') }}</span>
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="text-gray-900 font-medium">{{ $t('taskManagement.customExercise') }}</span>
      </div>
    </div>

    <!-- Row 2: Search Bar & New Button -->
    <div class="pl-[6%] pr-[5%] pb-4 flex items-center justify-between">
      <div class="relative inline-block">
        <input 
          v-model="searchKeyword"
          type="text"
          :placeholder="$t('customExercise.searchPlaceholder')"
          class="w-[240px] h-8 pl-3 pr-9 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#FF9900] transition-colors"
          @keyup.enter="handleSearch"
        />
        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-[#FF9900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" @click="handleSearch">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <MButton type="primary" class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] shadow-md shadow-orange-500/20 active:scale-95 transition-all" @click="handleNewExercise">
        {{ $t('customExercise.newExercise') }}
      </MButton>
    </div>

    <!-- Table Area with Background -->
    <div class="flex-1 overflow-hidden pl-[6%] pr-[5%] pb-6">
      <div class="h-full flex flex-col bg-[#e3ebf3]/60 rounded-xl p-4">
        <!-- Table Container -->
        <div class="flex-1 overflow-auto bg-white rounded-lg">
          <table class="w-full border-collapse min-w-[900px]">
            <thead class="bg-[#E8F4FC] sticky top-0">
              <tr>
                <th class="px-4 py-3 text-sm font-medium text-gray-700 text-left w-[60px]">{{ $t('common.serialNumber') }}</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-700 text-left w-[180px]">{{ $t('customExercise.exerciseName') }}</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-700 text-center w-[100px]">{{ $t('customExercise.questionCount') }}</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-700 text-center w-[60px]">{{ $t('customExercise.totalScore') }}</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-700 text-center w-[160px]">{{ $t('customExercise.lastEditTime') }}</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-700 text-left">{{ $t('customExercise.linkedCourses') }}</th>
                <th class="px-4 py-3 text-sm font-medium text-gray-700 text-center w-[280px]">{{ $t('common.operation') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(row, index) in exerciseList" 
                :key="row.id"
                class="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <td class="px-4 py-4 text-sm text-gray-600">{{ index + 1 }}</td>
                <td class="px-4 py-4 text-sm text-gray-800">{{ row.exerciseName }}</td>
                <td class="px-4 py-4 text-sm text-gray-600 text-center">{{ row.questionCount }}</td>
                <td class="px-4 py-4 text-sm text-gray-600 text-center">{{ row.totalScore }}</td>
                <td class="px-4 py-4 text-sm text-gray-600 text-center">{{ row.lastEditTime }}</td>
                <td class="px-4 py-4 text-sm text-gray-500">{{ row.linkedCourses }}</td>
                <td class="px-4 py-4 text-sm text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                      @click="handleEditScore(row)"
                    >
                      {{ $t('customExercise.editScoreEvaluation') }}
                    </button>
                    <button 
                      class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                      @click="handleLinkCourse(row)"
                    >
                      {{ $t('customExercise.linkCourse') }}
                    </button>
                    <!-- More Button with Hover Dropdown -->
                    <div class="relative group">
                      <button 
                        class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                      >
                        {{ $t('common.more') }}
                      </button>
                      <!-- Dropdown Menu - Show on Hover -->
                      <div class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[80px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <button 
                          class="w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-center"
                          @click="handleAction('edit', row)"
                        >
                          {{ $t('common.edit') }}
                        </button>
                        <button 
                          class="w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-center"
                          @click="handleAction('copy', row)"
                        >
                          {{ $t('common.copy') }}
                        </button>
                        <button 
                          class="w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-center"
                          @click="handleAction('delete', row)"
                        >
                          {{ $t('common.delete') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              <!-- Empty State -->
              <tr v-if="exerciseList.length === 0">
                <td colspan="7" class="py-20">
                  <div class="flex flex-col items-center justify-center">
                    <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center mb-4">
                      <svg width="56" height="56" viewBox="0 0 64 64" fill="none" class="text-[#91D5FF]">
                        <rect x="12" y="8" width="32" height="40" rx="4" fill="#E6F7FF" stroke="#91D5FF" stroke-width="2"/>
                        <path d="M20 18h16M20 26h12M20 34h8" stroke="#91D5FF" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    </div>
                    <div class="text-gray-400 text-sm">{{ $t('common.noData') }}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="shrink-0 py-4 flex items-center justify-center">
          <MPagination 
            v-model:currentPage="currentPage"
            v-model:pageSize="pageSize"
            :total="total"
            :show-total="true"
            :show-size-changer="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

// Search
const searchKeyword = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(6)

// Mock Data
const exerciseList = ref([
  { id: 1, exerciseName: '今天学习的几个快捷键(1)', questionCount: 1, totalScore: 5, lastEditTime: '2026-01-22 16:57:11', linkedCourses: '-' },
  { id: 2, exerciseName: '今天学习的几个快捷键', questionCount: 1, totalScore: 5, lastEditTime: '2025-12-22 16:53:10', linkedCourses: 'AI上神奇动物/AI上全能助手,111' },
  { id: 3, exerciseName: '图像识别练习题', questionCount: 9, totalScore: 100, lastEditTime: '2025-11-06 15:06:31', linkedCourses: 'AI未来实验室（硬件版）,AI在奇妙世界,探秘人工智能技术' },
  { id: 4, exerciseName: '机器学习', questionCount: 1, totalScore: 10, lastEditTime: '2025-09-17 14:29:23', linkedCourses: 'AI上神奇动物' },
  { id: 5, exerciseName: '三人三', questionCount: 1, totalScore: 10, lastEditTime: '2025-09-12 11:24:14', linkedCourses: 'AI上神奇动物' },
  { id: 6, exerciseName: '油画识别练习题', questionCount: 5, totalScore: 50, lastEditTime: '2025-07-21 18:03:53', linkedCourses: 'AI未来实验室（硬件版）,AI版校：智慧城市,玩转人工智能技术' }
])

// Navigation
const goHome = () => {
  router.push('/teacher')
}

const goTaskManagement = () => {
  router.push('/taskmanagement')
}

// Actions
const handleSearch = () => {
  console.log('Search:', searchKeyword.value)
}

const handleNewExercise = () => {
  router.push('/taskmanagement/add-custom-question')
}

const handleEditScore = (row: any) => {
  console.log('Edit score:', row)
}

const handleLinkCourse = (row: any) => {
  console.log('Link course:', row)
}

const handleAction = (action: string, row: any) => {
  console.log('Action:', action, row)
}
</script>
