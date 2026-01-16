<template>
    <div class="growth-detail-page flex-1 flex flex-col">
        <!-- 顶部导航 -->
        <div class="detail-header flex items-center gap-1 px-6 py-4">
            <button class="back-btn" @click="goBack">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div class="breadcrumb text-sm text-gray-500">
                <span class="cursor-pointer hover:text-[#FF9900]" @click="goBack">{{ $t('growth.teacherTraining') }}</span>
                <span class="mx-2">></span>
                <span class="text-gray-800">{{ courseInfo.name }}</span>
            </div>
        </div>

        <!-- 内容区 -->
        <div class="flex-1 overflow-auto p-6">
            <!-- 课程信息卡片 -->
            <div class="course-info-card bg-white rounded-lg p-6 mb-6 flex gap-6">
                <!-- 封面图 -->
                <div class="cover-box">
                    <img v-if="courseInfo.cover" :src="courseInfo.cover" :alt="courseInfo.name" class="w-full h-full object-cover" />
                    <template v-else>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-gray-400 text-sm">{{ $t('common.courseCover') }}</span>
                        </div>
                        <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="#ccc" stroke-width="1" />
                            <line x1="100%" y1="0" x2="0" y2="100%" stroke="#ccc" stroke-width="1" />
                        </svg>
                    </template>
                </div>
                <!-- 课程信息 -->
                <div class="course-meta flex-1">
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">{{ courseInfo.name }}</h1>
                    <p class="text-sm text-gray-500 leading-relaxed mb-4">{{ courseInfo.description }}</p>
                    <!-- 标签 -->
                    <div class="flex items-center gap-4 text-sm text-gray-400">
                        <span v-for="tag in courseInfo.tags" :key="tag">{{ tag }}</span>
                    </div>
                </div>
            </div>

            <!-- 课程内容标签 -->
            <div class="ml-[20px]">
                <span class="course-content-tab">{{ $t('growth.courseContent') }}</span>
            </div>
            
            <!-- 课程内容 -->
            <div class="course-content bg-white rounded-lg border border-dashed border-gray-300">
                <!-- 章节列表 -->
                <div class="chapter-list">
                    <div 
                        v-for="(chapter, index) in chapterList" 
                        :key="chapter.id"
                        class="chapter-item flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50"
                    >
                        <span class="text-sm text-gray-700">{{ String(index + 1).padStart(2, '0') }} {{ chapter.name }}</span>
                        <button 
                            class="start-btn"
                            @click="startLearning(chapter)"
                        >
                            {{ $t('growth.startLearning') }}
                        </button>
                    </div>
                </div>
                <!-- 空状态 -->
                <div v-if="!chapterList.length" class="px-6 py-12 text-center text-gray-400">
                    {{ $t('growth.noChapter') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { growthAdmin } from '~/composables/api/growth'

definePageMeta({
    layout: 'sidebar'
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { getTeacherCourseDetail } = growthAdmin()

// 课程信息
const courseInfo = ref({
    id: '',
    name: '',
    description: '',
    cover: '',
    tags: [] as string[]
})

// 章节列表
const chapterList = ref<{ id: string; name: string }[]>([])

// 加载状态
const loading = ref(false)

// 返回上一页
const goBack = () => {
    router.back()
}

// 开始学习
const startLearning = (chapter: { id: string; name: string }) => {
    navigateTo({
        path: `/system/growth/learn/${chapter.id}`,
        query: {
            chapterName: chapter.name,
            courseName: courseInfo.value.name
        }
    })
}

// 加载课程详情
const loadCourseDetail = async () => {
    const courseId = route.params.id as string
    loading.value = true
    try {
        const data = await getTeacherCourseDetail(courseId)
        if (data) {
            courseInfo.value = {
                id: data.courseId || courseId,
                name: data.courseName || '',
                description: data.courseDescription || data.description || '',
                cover: data.courseCoverUrl || data.coverUrl || '',
                tags: data.tags || []
            }
            // 章节列表
            chapterList.value = (data.chapters || data.chapterList || []).map((item: any) => ({
                id: item.chapterId || item.id,
                name: item.chapterName || item.name
            }))
        }
    } catch (error) {
        console.error('加载课程详情失败:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadCourseDetail()
})
</script>

<style scoped>
.growth-detail-page {
    height: calc(100vh - 70px);
    overflow: hidden;
}

.back-btn {
    width: 69px;
    height: 50px;
    background: #FF9900;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: none;
    cursor: pointer;
    margin-right: 12px;
}

.back-btn:hover {
    background: #E68A00;
}

.cover-box {
    width: 220px;
    height: 276px;
    flex-shrink: 0;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
}

.course-info-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.course-content-tab {
    display: inline-block;
    min-width: 100px;
    height: 38px;
    line-height: 38px;
    padding: 0 20px;
    background: #FF9900;
    color: white;
    font-size: 14px;
    border-radius: 10px 10px 0 0;
}

.course-content {
    border-radius: 0 10px 10px 10px;
}

.start-btn {
    width: 121px;
    height: 38px;
    background: #FF9900;
    color: white;
    font-size: 14px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
}

.start-btn:hover {
    background: #E68A00;
}
</style>
