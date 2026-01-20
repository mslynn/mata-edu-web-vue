<template>
    <div class="growth-page flex-1 flex flex-col">
        <div class="flex-1 flex overflow-hidden">
            <!-- 左侧子菜单容器 -->
            <div class="sidebar-container flex-shrink-0 relative">
                <aside
                    class="growth-sidebarflex flex-col w-[310px]">
                    <!-- 类别标题 -->
                    <div class="pt-[56px] pl-[26px] ">
                        <span class="inline-flex items-center justify-center w-[140px] h-[45px] bg-[#FF9900] text-white text-sm rounded-t-[10px]">{{
                            $t('growth.category') }}</span>
                    </div>
                    <!-- 菜单列表 -->
                    <nav class="flex-1 pt-[54px] pl-[18px]  bg-white rounded-[20px] h-[584px]">
                        <button v-for="item in sideMenuItems" :key="item.value" type="button" :class="[ 
                            ' flex w-[273px] h-[50px] leading-[50px] mb-[10px] whitespace-nowrap text-[18px] font-normal text-[#4D4D4D] rounded-lg transition-all text-left pl-[50px]',
                            activeMenu === item.value
                                ? 'bg-[#FAFAFA] border-1 border-[#D9D9D9]'
                                : 'border-1 border-transparent hover:bg-[#FAFAFA] hover:border-[#D9D9D9]'
                        ]" @click="handleMenuClick(item.value)">
                            <span>{{ item.label }}</span>
                        </button>
                    </nav>
                </aside>
            </div>

            <!-- 右侧内容区 - 教师培训课程 -->
            <div v-if="activeMenu === 'training'" class="flex-1 flex flex-col min-h-0 overflow-hidden px-4">
                <!-- 顶部一级分类标签 + 筛选 -->
                <div class="flex items-center justify-between mb-0 flex-shrink-0 pt-[56px]">
                    <div class="flex items-center gap-[20px] flex-wrap">
                        <button v-for="cat in trainingTabs" :key="cat.value" :class="[
                            'min-w-[130px] h-[45px] px-4 rounded-t-[10px] text-sm transition-colors',
                            activeTrainingTab === cat.value
                                ? 'bg-[#FF9900] text-white'
                                : 'bg-white border border-gray-200 border-b-0 text-gray-600 hover:border-[#FF9900]'
                        ]" @click="activeTrainingTab = cat.value">
                            {{ cat.label }}
                        </button>
                    </div>
                    <!-- 开通状态筛选 -->
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">{{ $t('common.openStatus') }}：</span>
                        <div class="relative">
                            <button type="button"
                                class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#FF9900] transition-colors min-w-[90px]"
                                @click="showStatusDropdown = !showStatusDropdown">
                                <span>{{statusOptions.find(o => o.value === openStatus)?.label || $t('common.all')
                                    }}</span>
                                <svg class="w-4 h-4 text-gray-400 transition-transform"
                                    :class="{ 'rotate-180': showStatusDropdown }" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <Transition name="dropdown">
                                <div v-if="showStatusDropdown"
                                    class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                                    <div v-for="option in statusOptions" :key="String(option.value)"
                                        class="px-3 py-2 text-sm cursor-pointer transition-colors" :class="[
                                            openStatus === option.value
                                                ? 'bg-[#FFF7E6] text-[#FF9900]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        ]" @click="selectStatus(option.value)">
                                        {{ option.label }}
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </div>
                <!-- 二级分类标签 -->
                <div v-if="level2Tabs.length > 0" class="flex items-center gap-[20px] mb-0 flex-shrink-0 flex-wrap">
                    <button v-for="tab in level2Tabs" :key="tab.value" :class="[
                        'min-w-[130px] h-[45px] px-4 rounded-t-[10px] text-sm transition-colors',
                        getActiveLevelTab(1) === tab.value
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 border-b-0 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="setActiveLevelTab(1, tab.value)">
                        {{ tab.label }}
                    </button>
                </div>
                <!-- 三级分类标签 -->
                <div v-if="level3Tabs.length > 0" class="flex items-center gap-[20px] mb-0 flex-shrink-0 flex-wrap">
                    <button v-for="tab in level3Tabs" :key="tab.value" :class="[
                        'min-w-[130px] h-[45px] px-4 rounded-t-[10px] text-sm transition-colors',
                        getActiveLevelTab(2) === tab.value
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 border-b-0 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="setActiveLevelTab(2, tab.value)">
                        {{ tab.label }}
                    </button>
                </div>
                <!-- 四级分类标签 -->
                <div v-if="level4Tabs.length > 0" class="flex items-center gap-[20px] mb-0 flex-shrink-0 flex-wrap">
                    <button v-for="tab in level4Tabs" :key="tab.value" :class="[
                        'min-w-[130px] h-[45px] px-4 rounded-t-[10px] text-sm transition-colors',
                        getActiveLevelTab(3) === tab.value
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 border-b-0 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="setActiveLevelTab(3, tab.value)">
                        {{ tab.label }}
                    </button>
                </div>
                <!-- 课程列表 -->
                <div class="flex-1 bg-white rounded-[20px] p-6 overflow-auto">
                    <!-- 加载中 -->
                    <div v-if="courseLoading" class="flex items-center justify-center h-full">
                        <div class="text-gray-400">{{ $t('common.loading') }}...</div>
                    </div>
                    <template v-else>
                        <div class="course-grid">
                            <div v-for="course in courseList" :key="course.id" class="course-card cursor-pointer group"
                                @click="handleCourseClick(course)">
                                <div
                                    class="course-cover bg-gray-200 rounded-lg  flex items-center justify-center relative overflow-hidden">
                                    <span class="absolute top-2 right-2 px-2 py-0.5 rounded text-xs z-10"
                                        :class="[statusConfig[course.status]?.bg, statusConfig[course.status]?.color]">
                                        {{ statusConfig[course.status]?.label }}
                                    </span>
                                    <img v-if="course.cover" :src="course.cover" :alt="course.name"
                                        class="absolute inset-0 w-full h-full object-cover" />
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
                                <div class="text-center course-name">{{ course.name }}</div>
                            </div>
                        </div>
                        <div v-if="!courseList.length"
                            class="flex flex-col items-center justify-center h-full text-gray-400">
                            <p>{{ $t('growth.noCourse') }}</p>
                        </div>
                    </template>
                </div>
            </div>

            <!-- 右侧内容区 - 教师社区 -->
            <div v-else-if="activeMenu === 'community'" class="flex-1 flex flex-col min-h-0 overflow-hidden px-4 pt-[56px]">
                <!-- 顶部标签 -->
                <div class="flex items-center gap-[16px] mb-[10px] flex-shrink-0 flex-wrap">
                    <!-- 左侧：话题广场、官方发布、精品推荐 -->
                    <button v-for="tab in communityTabs" :key="tab.value" :class="[
                        'min-w-[120px] h-[45px] px-4 rounded-[10px] text-sm transition-colors',
                        activeCommunityTab === tab.value && !activeCommunityAction
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="handleCommunityTabClick(tab.value)">
                        {{ tab.label }}
                    </button>
                    <!-- 分隔 -->
                    <div class="w-[1px] h-[30px] bg-gray-200 mx-2"></div>
                    <!-- 右侧：发布话题、我的话题、我评论的 -->
                    <button class="min-w-[120px] h-[45px] px-4 rounded-[10px] text-sm transition-colors flex items-center justify-center gap-1 bg-[#E68A00] text-white hover:bg-[#D67A00]" @click="goPublishTopic">
                        <span>+</span>
                        <span>{{ $t('growth.publishTopic') }}</span>
                    </button>
                    <button v-for="tab in communityActionTabs" :key="tab.value" :class="[
                        'min-w-[120px] h-[45px] px-4 rounded-[10px] text-sm transition-colors',
                        activeCommunityAction === tab.value
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="handleCommunityActionClick(tab.value)">
                        {{ tab.label }}
                    </button>
                </div>
                
                <!-- 话题列表区域 -->
                <div class="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
                    <!-- 搜索 + 排序 -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                        <div class="relative">
                            <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input v-model="topicSearch" type="text" :placeholder="$t('growth.searchTopic')"
                                class="pl-9 pr-4 py-1.5 border border-gray-200 rounded text-sm w-[200px] outline-none focus:border-[#FF9900]"
                                @keyup.enter="handleTopicSearch" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-500">{{ $t('growth.sortBy') }}</span>
                            <div class="relative">
                                <button type="button"
                                    class="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-600 min-w-[70px]"
                                    @click="showSortDropdown = !showSortDropdown">
                                    <span>{{sortOptions.find(o => o.value === topicSort)?.label}}</span>
                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <Transition name="dropdown">
                                    <div v-if="showSortDropdown"
                                        class="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg overflow-hidden z-10">
                                        <div v-for="option in sortOptions" :key="option.value"
                                            class="px-3 py-2 text-sm cursor-pointer whitespace-nowrap"
                                            :class="topicSort === option.value ? 'bg-[#FFF7E6] text-[#FF9900]' : 'text-gray-600 hover:bg-gray-50'"
                                            @click="topicSort = option.value; showSortDropdown = false">
                                            {{ option.label }}
                                        </div>
                                    </div>
                                </Transition>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 话题列表 -->
                    <div class="flex-1 overflow-auto">
                        <!-- 加载中 -->
                        <div v-if="topicLoading" class="flex items-center justify-center h-full">
                            <div class="text-gray-400">{{ $t('common.loading') }}...</div>
                        </div>
                        <template v-else>
                            <div v-for="topic in topicList" :key="topic.id"
                                class="topic-item px-12 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                @click="goTopicDetail(topic)">
                                <!-- 标题行 -->
                                <div class="flex items-start justify-between mb-2">
                                    <div class="flex items-center gap-2">
                                        <h3 class="text-base font-medium text-gray-800">{{ topic.title }}</h3>
                                        <span v-if="topic.isOfficial" class="px-2 py-0.5 text-xs bg-[#E6F7FF] text-[#1890FF] rounded">官方</span>
                                        <span v-if="topic.isFeatured" class="px-2 py-0.5 text-xs bg-[#FFF1E6] text-[#FF6A00] rounded">精品</span>
                                    </div>
                                    <!-- 右侧点赞评论 -->
                                    <div class="flex items-center gap-4 text-sm text-gray-400 flex-shrink-0 ml-4">
                                        <div class="flex items-center gap-1">
                                            <!-- <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                            </svg> -->
                                           <img src="../../../assets/images/dianzhan.png" alt="">
                                            <span>{{ topic.likes }}</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <!-- <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg> -->
                                             <img src="../../../assets/images/pinlun.png" alt="">
                                            <span>{{ topic.comments }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2 text-sm text-gray-400">
                                    <img v-if="topic.avatar" :src="topic.avatar" class="w-5 h-5 rounded-full object-cover" />
                                    <div v-else class="w-5 h-5 rounded-full bg-gray-300"></div>
                                    <span>{{ topic.author }}</span>
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{{ topic.date }}</span>
                                </div>
                            </div>
                            <div v-if="!topicList.length"
                                class="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                                <p>{{ $t('growth.noTopic') }}</p>
                            </div>
                        </template>
                    </div>
                </div>
                <!-- 分页 -->
                <div v-if="topicTotal > 0" class="flex items-center justify-center gap-2 py-4 flex-shrink-0">
                    <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        :disabled="topicPageNum === 1" @click="topicPageNum--; loadTopicList()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button v-for="p in topicVisiblePages" :key="p" :class="[
                        'w-8 h-8 flex items-center justify-center text-sm rounded',
                        topicPageNum === p ? 'bg-[#FF9900] text-white' : 'text-gray-600 hover:bg-gray-100'
                    ]" @click="topicPageNum = p; loadTopicList()">
                        {{ p }}
                    </button>
                    <span v-if="topicTotalPages > 5" class="text-gray-400">...</span>
                    <span v-if="topicTotalPages > 5" class="text-gray-400">{{ topicTotalPages }}</span>
                    <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        :disabled="topicPageNum === topicTotalPages" @click="topicPageNum++; loadTopicList()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <span class="text-sm text-gray-500 ml-2">{{ $t('growth.jumpTo') }}</span>
                    <input v-model.number="topicJumpPage" type="number"
                        class="w-12 h-8 border border-gray-200 rounded text-center text-sm"
                        @keyup.enter="handleTopicJump" />
                    <span class="text-sm text-gray-500">{{ $t('growth.page') }}</span>
                </div>
            </div>

            <!-- 右侧内容区 - 图书馆 -->
            <div v-else-if="activeMenu === 'library'" class="flex-1 flex flex-col overflow-hidden px-4 pt-[56px]">
                <!-- 顶部分类标签 -->
                <div class="flex items-center gap-[20px] mb-0 flex-shrink-0">
                    <button v-for="tab in libraryTabs" :key="tab.value" :class="[
                        'min-w-[130px] h-[45px] px-4 rounded-t-[10px] text-sm transition-colors',
                        activeLibraryTab === tab.value
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 border-b-0 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="activeLibraryTab = tab.value">
                        {{ tab.label }}
                    </button>
                </div>

                <!-- 内容区 -->
                <div class="flex-1 bg-white rounded-[20px] overflow-hidden flex flex-col">
                    <!-- 标题 -->
                    <h2 class="text-center text-lg font-medium text-gray-800 py-4">{{ $t('growth.libraryResources') }}</h2>

                    <!-- 资源卡片列表 -->
                    <div class="flex-1 overflow-auto px-6 pb-6">
                        <!-- 加载中 -->
                        <div v-if="libraryLoading" class="flex items-center justify-center h-full">
                            <div class="text-gray-400">{{ $t('common.loading') }}...</div>
                        </div>
                        <template v-else>
                            <div class="grid grid-cols-3 gap-4 mb-6">
                                <div v-for="item in libraryList" :key="item.id"
                                    class="library-card"
                                    @click="handleLibraryClick(item)">
                                    <div class="flex items-center justify-center gap-3 mb-3">
                                        <div class="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 overflow-hidden" 
                                            :class="item.iconUrl ? 'bg-transparent' : 'bg-gray-100'">
                                            <img v-if="item.iconUrl" :src="item.iconUrl" class="w-full h-full object-contain text-[10px]" :alt="item.logo" />
                                            <span v-else class="text-xs font-bold text-gray-500">{{ item.logo }}</span>
                                        </div>
                                        <h3 class="font-medium text-gray-800">{{ item.title }}</h3>
                                    </div>
                                    <p class="library-card-desc">{{ item.content }}</p>
                                </div>
                            </div>
                            <!-- 空状态 -->
                            <div v-if="!libraryList.length" class="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                                <p>{{ $t('common.noData') }}</p>
                            </div>
                        </template>
                    </div>
                </div>
                
                <!-- 分页 -->
                <div v-if="libraryTotal > 0" class="flex items-center justify-center gap-2 py-4 flex-shrink-0">
                    <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                        :disabled="libraryPage === 1" @click="libraryPage--; loadLibraryList()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button v-for="p in visiblePages" :key="p" :class="[
                        'w-8 h-8 flex items-center justify-center text-sm rounded',
                        libraryPage === p ? 'bg-[#FF9900] text-white' : 'text-gray-600 hover:bg-gray-100'
                    ]" @click="libraryPage = p; loadLibraryList()">
                        {{ p }}
                    </button>
                    <span v-if="libraryTotalPages > 5" class="text-gray-400">...</span>
                    <span v-if="libraryTotalPages > 5" class="text-gray-400">{{ libraryTotalPages }}</span>
                    <button class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
                        :disabled="libraryPage === libraryTotalPages" @click="libraryPage++; loadLibraryList()">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    <span class="text-sm text-gray-500 ml-2">{{ $t('growth.jumpTo') }}</span>
                    <input v-model.number="jumpPage" type="number"
                        class="w-12 h-8 border border-gray-200 rounded text-center text-sm"
                        @keyup.enter="libraryPage = jumpPage; loadLibraryList()" />
                    <span class="text-sm text-gray-500">{{ $t('growth.page') }}</span>
                </div>
            </div>

            <!-- 右侧内容区 - 教师认证 -->
            <div v-else-if="activeMenu === 'certification'" class="flex-1 flex flex-col overflow-hidden">
                <iframe 
                    src="https://matatalab.com/en/self-guided-course" 
                    class="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
            </div>

            <!-- 右侧内容区 - 其他（占位） -->
            <div v-else class="flex-1 flex flex-col items-center justify-center p-4 text-gray-400">
                <p>{{ $t('growth.comingSoon') }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { content } from '#tailwind-config'
import { ref, computed, onMounted, onUnmounted, h, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { growthAdmin } from '~/composables/api/growth'

definePageMeta({
    layout: 'sidebar'
})

const { t } = useI18n()
const { getTeacherCourseMenuTree, getTeacherCourseList, getTeacherCourseTopicList, getMyTeacherCourseTopicList, getMyCommentedTeacherCourseTopicList, getTeacherbookMenuTree, getTeacherbookList } = growthAdmin()

// 使用共享状态
const { activeMenu } = useGrowthState()

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)

// 菜单树数据
interface MenuTreeItem {
    menuId: number
    parentId: number
    menuName: string
    sortOrder: number
    menuLevel: number
    isVisible: number
    children?: MenuTreeItem[]
}
const menuTree = ref<MenuTreeItem[]>([])
const menuLoading = ref(false)

// 左侧菜单项
const sideMenuItems = computed(() => [
    {
        label: t('growth.teacherTraining'),
        value: 'training',
        icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
        ])
    },
    {
        label: t('growth.teacherCommunity'),
        value: 'community',
        icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' })
        ])
    },
    {
        label: t('growth.library'),
        value: 'library',
        icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' })
        ])
    },
    {
        label: t('growth.teacherCertification'),
        value: 'certification',
        icon: h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' })
        ])
    }
])

// ========== 教师培训课程 ==========
// 一级分类 tabs（从API获取）
const trainingTabs = computed(() => {
    return menuTree.value.map(item => ({
        label: item.menuName,
        value: item.menuId,
        children: item.children || []
    }))
})
// 当前选中的一级分类
const activeTrainingTab = ref<number | null>(null)

// 多级分类选中状态数组 [二级选中值, 三级选中值, 四级选中值, ...]
// 负数表示"全部"，使用父级menuId
const activeLevelTabs = ref<number[]>([])

// 根据选中状态计算各级分类的tabs
interface TabItem {
    label: string
    value: number
    children?: MenuTreeItem[]
}

// 获取指定层级的tabs
const getLevelTabs = (level: number): TabItem[] => {
    if (level === 0) return [] // 一级分类单独处理

    // 找到上一级选中的菜单项
    let parentMenu: MenuTreeItem | undefined

    if (level === 1) {
        // 二级分类，父级是一级分类
        parentMenu = menuTree.value.find(m => m.menuId === activeTrainingTab.value)
    } else {
        // 三级及以上，需要递归查找
        const findMenuById = (menus: MenuTreeItem[], id: number): MenuTreeItem | undefined => {
            for (const menu of menus) {
                if (menu.menuId === id) return menu
                if (menu.children) {
                    const found = findMenuById(menu.children, id)
                    if (found) return found
                }
            }
            return undefined
        }

        // 获取上一级选中的实际menuId（负数转正数）
        const prevSelectedValue = activeLevelTabs.value[level - 2]
        if (!prevSelectedValue) return []
        const prevMenuId = prevSelectedValue < 0 ? Math.abs(prevSelectedValue) : prevSelectedValue
        parentMenu = findMenuById(menuTree.value, prevMenuId)

        // 如果上一级选的是"全部"，则当前级不显示
        if (prevSelectedValue < 0) return []
    }

    if (!parentMenu || !parentMenu.children?.length) return []

    // 添加"全部"选项（负数标识，值为父级menuId的负数）
    const allTab: TabItem = { label: t('common.all'), value: -parentMenu.menuId }
    const childTabs: TabItem[] = parentMenu.children.map(child => ({
        label: child.menuName,
        value: child.menuId,
        children: child.children
    }))

    return [allTab, ...childTabs]
}

// 计算各级tabs（最多支持4级）
const level2Tabs = computed(() => getLevelTabs(1))
const level3Tabs = computed(() => getLevelTabs(2))
const level4Tabs = computed(() => getLevelTabs(3))

// 获取当前级别选中值
const getActiveLevelTab = (level: number) => activeLevelTabs.value[level - 1] ?? null

// 设置某一级的选中值，并清空后续级别
const setActiveLevelTab = (level: number, value: number) => {
    // 更新当前级别
    activeLevelTabs.value[level - 1] = value
    // 清空后续级别
    activeLevelTabs.value = activeLevelTabs.value.slice(0, level)

    // 如果选的不是"全部"，且有子级，自动选中子级的"全部"
    if (value > 0) {
        // 需要重新计算下一级tabs
        nextTick(() => {
            const tabs = getLevelTabs(level + 1)
            if (tabs.length > 0 && tabs[0]) {
                activeLevelTabs.value[level] = tabs[0].value // 选中"全部"
            }
            loadCourseList()
        })
    } else {
        // 选的是"全部"，直接加载
        loadCourseList()
    }
}

const openStatus = ref<number | undefined>(undefined)
const showStatusDropdown = ref(false)

const statusOptions = computed(() => [
    { label: t('common.all'), value: undefined },
    { label: t('common.opened'), value: 1 },
    { label: t('common.notOpened'), value: 0 },
    { label: t('common.expired'), value: 2 },
    { label: t('common.trial'), value: 3 }
])

const selectStatus = (value: number | undefined) => {
    openStatus.value = value
    showStatusDropdown.value = false
}

const statusConfig = computed(() => ({
    1: { label: t('common.opened'), color: 'text-green-600', bg: 'bg-green-50' },
    0: { label: t('common.notOpened'), color: 'text-gray-500', bg: 'bg-gray-100' },
    2: { label: t('common.expired'), color: 'text-red-500', bg: 'bg-red-50' },
    3: { label: t('common.trial'), color: 'text-blue-500', bg: 'bg-blue-50' }
} as Record<number, { label: string; color: string; bg: string }>))

interface Course {
    id: number
    name: string
    cover?: string
    status: number
}

const courseList = ref<Course[]>([])
const courseLoading = ref(false)

// 加载菜单树
const loadMenuTree = async () => {
    menuLoading.value = true
    try {
        const data = await getTeacherCourseMenuTree()
        menuTree.value = data || []
        // 默认选中第一个一级分类
        if (menuTree.value.length > 0 && menuTree.value[0]) {
            activeTrainingTab.value = menuTree.value[0].menuId
        }
    } catch (error) {
        console.error('加载菜单树失败:', error)
    } finally {
        menuLoading.value = false
    }
}

// 加载课程列表
const loadCourseList = async () => {
    if (!activeTrainingTab.value) return

    // 从最后一级有效选中值获取menuId
    // 负数表示"全部"，取绝对值作为menuId
    let menuId: number = activeTrainingTab.value

    for (let i = activeLevelTabs.value.length - 1; i >= 0; i--) {
        const val = activeLevelTabs.value[i]
        if (val) {
            menuId = val < 0 ? Math.abs(val) : val
            break
        }
    }

    courseLoading.value = true
    try {
        const data = await getTeacherCourseList(menuId, openStatus.value)
        courseList.value = (data || []).map((item: any) => ({
            id: item.courseId || item.id,
            name: item.courseName || item.name,
            cover: item.courseCoverUrl || item.coverUrl || item.cover,
            status: item.openStatus ?? item.status ?? 0
        }))
    } catch (error) {
        console.error('加载课程列表失败:', error)
        courseList.value = []
    } finally {
        courseLoading.value = false
    }
}

// 监听一级分类变化
watch(activeTrainingTab, (newVal) => {
    if (newVal) {
        // 设置二级的"全部"并加载课程
        nextTick(() => {
            const tabs = getLevelTabs(1)
            if (tabs.length > 0 && tabs[0]) {
                activeLevelTabs.value = [tabs[0].value]
            } else {
                activeLevelTabs.value = []
            }
            loadCourseList()
        })
    }
})

// 监听多级分类变化，加载课程（仅用户手动点击时触发）
// 一级分类变化时由上面的 watch 统一处理

// 监听开通状态变化，重新加载课程
watch(openStatus, () => {
    loadCourseList()
})

const handleCourseClick = (course: Course) => {
    navigateTo(`/system/growth/${course.id}`)
}

// 处理菜单点击
const handleMenuClick = (value: string) => {
    if (value === 'certification') {
        window.open('https://matatalab.com/en/self-guided-course', '_blank')
    } else {
        activeMenu.value = value
    }
}

// 跳转发布话题
const goPublishTopic = () => {
    navigateTo('/system/growth/topic/publish')
}

// 跳转话题详情
const goTopicDetail = (topic: Topic) => {
    navigateTo(`/system/growth/topic/${topic.id}`)
}

// ========== 教师社区 ==========
const communityTabs = computed(() => [
    { label: t('growth.topicSquare'), value: 'square', isOfficial: undefined, isPremium: undefined },
    { label: t('growth.officialRelease'), value: 'official', isOfficial: 1, isPremium: undefined },
    { label: t('growth.featuredRecommend'), value: 'featured', isOfficial: undefined, isPremium: 1 }
])
const communityActionTabs = computed(() => [
    { label: t('growth.myTopics'), value: 'my' },
    { label: t('growth.myComments'), value: 'comments' }
])
const activeCommunityTab = ref('square')
const activeCommunityAction = ref('')
const topicSearch = ref('')
const topicSort = ref('hot')
const showSortDropdown = ref(false)
const topicLoading = ref(false)
const topicPageNum = ref(1)
const topicPageSize = ref(10)
const topicTotal = ref(0)
const topicJumpPage = ref(1)

// 话题总页数
const topicTotalPages = computed(() => Math.ceil(topicTotal.value / topicPageSize.value) || 1)

// 话题可见页码
const topicVisiblePages = computed(() => {
    const pages = []
    for (let i = 1; i <= Math.min(5, topicTotalPages.value); i++) {
        pages.push(i)
    }
    return pages
})

// 话题跳转页
const handleTopicJump = () => {
    if (topicJumpPage.value >= 1 && topicJumpPage.value <= topicTotalPages.value) {
        topicPageNum.value = topicJumpPage.value
        loadTopicList()
    }
}

const sortOptions = computed(() => [
    { label: t('growth.sortHot'), value: 'hot' },
    { label: t('growth.sortDate'), value: 'date' }
])

interface Topic {
    id: number
    title: string
    author: string
    avatar?: string
    date: string
    likes: number
    comments: number
    isTop?: boolean
    isFeatured?: boolean
    isOfficial?: boolean
}

const topicList = ref<Topic[]>([])

// 加载话题列表
const loadTopicList = async () => {
    topicLoading.value = true
    try {
        let res: any
        const baseParams: any = {
            pageNum: topicPageNum.value,
            pageSize: topicPageSize.value,
            orderByColumn: topicSort.value === 'hot' ? 'browse_count' : 'create_time',
          
        }
        if (topicSearch.value) {
            baseParams.title = topicSearch.value
        }
        
        if (activeCommunityAction.value === 'my') {
            // 我的话题
            res = await getMyTeacherCourseTopicList(baseParams)
        } else if (activeCommunityAction.value === 'comments') {
            // 我评论的
            res = await getMyCommentedTeacherCourseTopicList(baseParams)
        } else {
            // 话题广场/官方发布/精品推荐
            const currentTab = communityTabs.value.find(t => t.value === activeCommunityTab.value)
            res = await getTeacherCourseTopicList({
                ...baseParams,
                isOfficial: currentTab?.isOfficial,
                isPremium: currentTab?.isPremium
            })
        }
        
        if (res) {
            topicList.value = (res.rows || []).map((item: any) => ({
                id: item.topicId || item.id,
                title: item.title,
                author: item.author || '',
                avatar: item.avatar,
                date: item.createTime || '',
                likes: item.likeCount || 0,
                comments: item.commentCount || 0,
                isTop: item.isTop === 1,
                isFeatured: item.isPremium === 1,
                isOfficial: item.isOfficial === 1
            }))
            topicTotal.value = res.total || 0
        }
    } catch (error) {
        console.error('加载话题列表失败:', error)
        topicList.value = []
    } finally {
        topicLoading.value = false
    }
}

// 监听社区tab变化
watch(activeCommunityTab, () => {
    topicPageNum.value = 1
    loadTopicList()
})

// 监听我的话题/我评论的切换
watch(activeCommunityAction, () => {
    topicPageNum.value = 1
    loadTopicList()
})

// 点击左边tabs（话题广场/官方发布/精品推荐）
const handleCommunityTabClick = (value: string) => {
    activeCommunityAction.value = '' // 清空右边选中
    activeCommunityTab.value = value
}

// 点击右边tabs（我的话题/我评论的）
const handleCommunityActionClick = (value: string) => {
    activeCommunityAction.value = value
}

// 搜索话题
const handleTopicSearch = () => {
    topicPageNum.value = 1
    loadTopicList()
}

// 监听排序变化
watch(topicSort, () => {
    topicPageNum.value = 1
    loadTopicList()
})

// ========== 图书馆 ==========
// 图书菜单树
interface BookMenuTreeItem {
    menuId: number
    parentId: number
    menuName: string
    sortOrder: number
    menuLevel: number
    isVisible: number
    children?: BookMenuTreeItem[]
}
const bookMenuTree = ref<BookMenuTreeItem[]>([])

// 图书馆tabs（从API获取）
const libraryTabs = computed(() => {
    return bookMenuTree.value.map(item => ({
        label: item.menuName,
        value: item.menuId
    }))
})
const activeLibraryTab = ref<number | null>(null)
const libraryPage = ref(1)
const libraryPageSize = ref(12)
const libraryTotal = ref(0)
const libraryLoading = ref(false)
const jumpPage = ref(1)

const libraryTotalPages = computed(() => Math.ceil(libraryTotal.value / libraryPageSize.value) || 1)

const visiblePages = computed(() => {
    const pages = []
    for (let i = 1; i <= Math.min(5, libraryTotalPages.value); i++) {
        pages.push(i)
    }
    return pages
})

interface LibraryItem {
    id: number
    logo: string
    title: string
    description: string
    url?: string
    content?: string
    iconUrl?: string
}

const libraryList = ref<LibraryItem[]>([])

// 加载图书菜单树
const loadBookMenuTree = async () => {
    try {
        const data = await getTeacherbookMenuTree()
        bookMenuTree.value = data || []
        // 默认选中第一个
        if (bookMenuTree.value.length > 0 && bookMenuTree.value[0]) {
            activeLibraryTab.value = bookMenuTree.value[0].menuId
        }
    } catch (error) {
        console.error('加载图书菜单树失败:', error)
    }
}

// 加载图书列表
const loadLibraryList = async () => {
    if (!activeLibraryTab.value) return
    
    libraryLoading.value = true
    try {
        const data = await getTeacherbookList(activeLibraryTab.value)
        libraryList.value = (data?.rows || data || []).map((item: any) => ({
            id: item.bookId || item.id,
            logo: item.bookLogo || item.logo || item.bookName?.substring(0, 2) || 'LIB',
            title: item.bookName || item.title || '',
            description: item.bookDesc || item.description || '',
            content:item.content || '',
            iconUrl: item.iconUrl
        }))
        libraryTotal.value = data?.total || libraryList.value.length
    } catch (error) {
        console.error('加载图书列表失败:', error)
        libraryList.value = []
    } finally {
        libraryLoading.value = false
    }
}

// 监听图书馆tab变化
watch(activeLibraryTab, () => {
    libraryPage.value = 1
    loadLibraryList()
})

const handleLibraryClick = (item: LibraryItem) => {
    navigateTo(`/system/growth/library/${item.id}`)
}

// 点击外部关闭下拉框
const closeDropdown = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
        showStatusDropdown.value = false
        showSortDropdown.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', closeDropdown)
    // 根据当前菜单加载数据
    if (activeMenu.value === 'training') {
        loadMenuTree()
    } else if (activeMenu.value === 'community') {
        loadTopicList()
    } else if (activeMenu.value === 'library') {
        loadBookMenuTree().then(() => loadLibraryList())
    }
})

// 监听左侧菜单切换
watch(activeMenu, (newVal) => {
    if (newVal === 'training' && menuTree.value.length === 0) {
        loadMenuTree()
    } else if (newVal === 'community' && topicList.value.length === 0) {
        loadTopicList()
    } else if (newVal === 'library' && bookMenuTree.value.length === 0) {
        loadBookMenuTree().then(() => loadLibraryList())
    }
})

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.growth-page {
    height: calc(100vh - 70px);
    overflow: hidden;
}

.growth-page {
    overflow-x: hidden;
}

.sidebar-container {
    position: relative;
}

.course-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    justify-items: center;
}

.course-card {
    width: 100%;
    max-width: 237px;
    height: 280px;
    transition: transform 0.3s ease;
}

.course-cover {
    width: 100%;
    height: 220px;
    border-radius: 8px 8px 0 0;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-name {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FAFAFA;
    font-weight: 400;
    font-size: 18px;
    color: #4D4D4D;
}

.course-card:hover {
    transform: scale(1.05);
}

.library-card {
    width: 100%;
    height: 140px;
    border-radius: 10px;
    border: 1px solid #E8E8E8;
    background: white;
    padding: 16px;
    cursor: pointer;
    transition: box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.library-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.library-card-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
}

.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
