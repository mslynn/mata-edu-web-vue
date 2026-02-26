<template>
  <div class="lessonsrecord-page flex-1 flex flex-col overflow-hidden">
    <!-- 返回按钮 -->
    <div class="shrink-0 max-w-[1100px] w-full mx-auto px-6 py-3">
      <button class="w-8 h-8 rounded-full bg-[#B8D4E8]/60 flex items-center justify-center hover:bg-[#B8D4E8] transition-colors" @click="$router.back()">
        <svg class="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-6 pb-6">
      <div class="max-w-[1100px] w-full mx-auto">
      <!-- 课程封面轮播区 -->
      <div class="relative mb-6">
        <div class="flex items-center">
          <!-- 左箭头 -->
          <button 
            class="shrink-0 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            @click="scrollCarousel(-1)"
          >
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <!-- 轮播内容 -->
          <div ref="carouselRef" class="flex-1 overflow-hidden mx-3">
            <div class="flex gap-4 transition-transform duration-300" :style="{ transform: `translateX(-${carouselOffset}px)` }">
              <div 
                v-for="(course, idx) in carouselCourses" 
                :key="idx"
                class="shrink-0 w-[160px] cursor-pointer group"
              >
                <div class="relative w-[160px] h-[200px] rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                  <!-- 任务未提交标签 -->
                  <div v-if="course.hasUnsubmitted" class="absolute top-0 left-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-br-lg z-10">
                    {{ $t('lessonsRecord.taskUnsubmitted') }}
                  </div>
                  <!-- 封面图 -->
                  <div class="w-full h-full bg-gradient-to-br" :class="course.bgClass">
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="text-white text-sm font-medium text-center px-2 leading-tight">{{ course.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右箭头 -->
          <button 
            class="shrink-0 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            @click="scrollCarousel(1)"
          >
            <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>

      <!-- 上课记录标签 -->
      <div class="mb-4">
        <span class="inline-block px-4 py-1.5 bg-[#7ED957] text-white text-sm rounded-full font-medium">
          {{ $t('lessonsRecord.classRecord') }}
        </span>
      </div>

      <!-- 记录卡片网格 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="(record, idx) in lessonRecords" 
          :key="idx"
          class="bg-white rounded-lg border border-gray-200 p-5 flex flex-col"
        >
          <!-- 标题 + 状态 -->
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-800 flex-1 mr-2 line-clamp-1">{{ record.title }}</h3>
            <span 
              class="shrink-0 text-xs px-2 py-0.5 rounded"
              :class="statusClass(record.status)"
            >
              {{ statusLabel(record.status) }}
            </span>
          </div>

          <!-- 老师 + 时间 -->
          <div class="text-xs text-gray-400 mb-4">
            {{ record.teacher }} {{ record.time }}
          </div>

          <!-- 底部按钮 -->
          <div class="flex items-center gap-2 mt-auto">
            <button 
              v-for="(btn, bIdx) in record.actions" 
              :key="bIdx"
              class="px-3 py-1.5 text-xs rounded-full border transition-colors"
              :class="btn.primary 
                ? 'bg-white text-[#FF9900] border-[#FF9900] hover:bg-[#FFF7E6]' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
            >
              {{ btn.label }}
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()

// 轮播
const carouselRef = ref<HTMLElement | null>(null)
const carouselOffset = ref(0)
const scrollCarousel = (dir: number) => {
  const step = 180
  const maxOffset = Math.max(0, carouselCourses.value.length * step - (carouselRef.value?.clientWidth || 600))
  carouselOffset.value = Math.max(0, Math.min(maxOffset, carouselOffset.value + dir * step))
}

// Mock 轮播课程数据
const bgClasses = [
  'from-teal-400 to-cyan-500',
  'from-purple-400 to-indigo-500',
  'from-blue-400 to-cyan-400',
  'from-green-400 to-teal-500',
  'from-orange-400 to-amber-500',
]

const carouselCourses = ref([
  { name: 'AI上神奇动物 硬件版', hasUnsubmitted: true, bgClass: bgClasses[0] },
  { name: 'AI走近科技', hasUnsubmitted: true, bgClass: bgClasses[1] },
  { name: 'AI上全能助手', hasUnsubmitted: true, bgClass: bgClasses[2] },
  { name: 'AI上智慧生活', hasUnsubmitted: true, bgClass: bgClasses[3] },
  { name: 'AI未来实验室', hasUnsubmitted: false, bgClass: bgClasses[4] },
  { name: 'uCode编程入门', hasUnsubmitted: false, bgClass: bgClasses[0] },
])

// Mock 上课记录
const lessonRecords = ref([
  {
    title: '主题02 谁的大嘴巴',
    teacher: '吴伟贞',
    time: '2026-02-04 16:22:49',
    status: 'lastLesson',
    actions: [
      { label: t('lessonsRecord.viewTask'), primary: false },
      { label: t('lessonsRecord.viewCourseResource'), primary: false },
    ]
  },
  {
    title: '《AI上神奇动物》资料合集',
    teacher: '吴伟贞',
    time: '2026-01-13 11:31:57',
    status: 'unfinished',
    actions: [
      { label: t('lessonsRecord.doTask'), primary: true },
      { label: t('lessonsRecord.viewCourseResource'), primary: false },
    ]
  },
  {
    title: '主题01 走近神奇动物',
    teacher: '吴伟贞',
    time: '2026-01-26 11:16:01',
    status: 'unfinished',
    actions: [
      { label: t('lessonsRecord.doTask'), primary: true },
      { label: t('lessonsRecord.viewCourseResource'), primary: false },
    ]
  },
  {
    title: '主题03 猫的眼睛',
    teacher: '吴伟贞',
    time: '2026-01-20 09:15:30',
    status: 'reviewed',
    actions: [
      { label: t('lessonsRecord.viewTask'), primary: false },
      { label: t('lessonsRecord.viewCourseResource'), primary: false },
    ]
  },
  {
    title: '主题04 活动课——奇特的朋友：……',
    teacher: '吴伟贞',
    time: '2026-01-18 14:30:00',
    status: 'unfinished',
    actions: [
      { label: t('lessonsRecord.doTask'), primary: true },
      { label: t('lessonsRecord.viewCourseResource'), primary: false },
    ]
  },
  {
    title: '主题05 会说话的大象（1）',
    teacher: '吴伟贞',
    time: '2026-01-15 10:00:00',
    status: 'reviewed',
    actions: [
      { label: t('lessonsRecord.viewTask'), primary: false },
      { label: t('lessonsRecord.viewCourseResource'), primary: false },
    ]
  },
])

const statusClass = (status: string) => {
  switch (status) {
    case 'lastLesson': return 'bg-[#E6F7FF] text-[#1890FF]'
    case 'reviewed': return 'bg-[#FFF7E6] text-[#FF9900]'
    case 'unfinished': return 'bg-[#FFF1F0] text-[#FF4D4F]'
    default: return 'bg-gray-100 text-gray-500'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'lastLesson': return t('lessonsRecord.lastLessonTag')
    case 'reviewed': return t('lessonsRecord.reviewed')
    case 'unfinished': return t('lessonsRecord.unfinishedTag')
    default: return ''
  }
}
</script>

<style scoped>
.lessonsrecord-page {
  height: calc(100vh - 70px);
}
</style>
