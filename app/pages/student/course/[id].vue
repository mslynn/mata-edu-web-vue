<template>
  <div class="course-detail-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <NuxtLink to="/student/course" class="back-btn">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <h1 class="page-title">{{ $t('course.courseResource') }}</h1>
    </div>

    <!-- 课程信息卡片 -->
    <div class="course-info-card">
      <div class="course-cover">
        <img v-if="courseInfo.courseCoverUrl" :src="courseInfo.courseCoverUrl" :alt="$t('common.courseCover')" />
        <div v-else class="cover-placeholder">
          <span>{{ $t('common.courseCover') }}</span>
        </div>
      </div>
      <div class="course-content">
        <h2 class="course-title">{{ courseInfo.name }}</h2>
        <div class="course-meta">{{ $t('course.chapter') }}：{{ chapters.length }}{{ $t('course.chapter') }}</div>
        <p class="course-desc">{{ courseInfo.description }}</p>
        <button class="evaluation-btn">{{ $t('course.courseEvaluation') }}</button>
      </div>
    </div>

    <!-- 章节详情 -->
    <div class="chapter-section">
      <div class="section-title">{{ $t('course.chapterDetails') }}</div>
      <div class="chapter-list">
        <NuxtLink 
          v-for="chapter in chapters" 
          :key="chapter.id" 
          :to="`/student/course/preview/${route.params.id}?chapterId=${chapter.id}`"
          class="chapter-item"
        >
          {{ chapter.name }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { cursorAdmin } from '~/composables/api/curosr'

definePageMeta({ layout: 'default' })

const { t } = useI18n()
const route = useRoute()
const { getCursorDetail } = cursorAdmin()

const courseInfo = ref({
  name: '',
  description: '',
  courseCoverUrl: ''
})

const chapters = ref<{ id: number; name: string }[]>([])

onMounted(async () => {
  try {
    const data = await getCursorDetail(String(route.params.id))
    if (data) {
      courseInfo.value.name = data.courseName || ''
      courseInfo.value.description = data.courseDesc || ''
      courseInfo.value.courseCoverUrl = data.courseCoverUrl || ''
      
      if (data.chapterList && Array.isArray(data.chapterList)) {
        chapters.value = data.chapterList.map((c: any, idx: number) => ({
          id: c.chapterId || idx + 1,
          name: c.chapterName || `${t('course.chapter')}${idx + 1}`
        }))
      }
    }
  } catch (error) {
    console.error('Failed to load course details:', error)
  }
})
</script>

<style scoped>
.course-detail-page {
  min-height: calc(100vh - 70px);
  background: #f5f5f5;
  padding: 20px 40px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 20px;
}

.back-btn {
  position: absolute;
  left: 0;
  color: #666;
}
.back-btn:hover { color: #FF9900; }

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.course-info-card {
  display: flex;
  gap: 24px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.course-cover {
  width: 160px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f0f0;
}
.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.course-content {
  flex: 1;
}
.course-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}
.course-meta {
  font-size: 13px;
  color: #FF9900;
  margin-bottom: 12px;
}
.course-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 16px;
}
.evaluation-btn {
  padding: 8px 20px;
  background: #FF9900;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.evaluation-btn:hover { background: #E68A00; }

.chapter-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}
.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.chapter-item {
  padding: 12px 16px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}
.chapter-item:hover {
  background: #fff7e6;
  /* color: #4CD964; */
}

.loading-state, .empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: #999;
}
</style>
