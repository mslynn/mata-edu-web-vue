<template>
    <div class="course-page flex-1 flex flex-col">
        <!-- 创建/编辑课程弹窗 -->
        <CreateCourseModal v-model="showCreateModal" :edit-data="editCourseData" @confirm="handleCreateCourse" />

        <!-- 删除课程确认弹窗 -->
        <DeleteCourseModal v-model:visible="showDeleteModal" @confirm="confirmDeleteCourse" />

        <!-- 右侧内容区 -->
        <div class="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
            <!-- 顶部分类标签 + 创建按钮 -->
            <div class="flex items-center justify-between mb-4 flex-shrink-0">
                <!-- 一级分类标签 -->
                <div class="flex items-center gap-2 flex-wrap">
                    <!-- 主分类 -->
                    <button v-for="cat in mainCategories" :key="cat.value" :class="[
                        'px-4 py-2 rounded-full text-sm transition-colors',
                        activeCategory === cat.value
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="activeCategory = cat.value">
                        {{ cat.label }}
                    </button>
                    <!-- 分隔线 -->
                    <div class="w-px h-6 bg-gray-300 mx-2"></div>
                    <!-- 特殊分类 -->
                    <button v-for="cat in extraCategories" :key="cat.value" :class="[
                        'px-4 py-2 rounded-full text-sm transition-colors',
                        activeCategory === cat.value
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="activeCategory = cat.value">
                        {{ cat.label }}
                    </button>
                </div>
                <!-- 创建课程按钮 -->
                <button class="px-4 py-2 bg-[#FF9900] text-white rounded-lg flex items-center gap-1 text-sm"
                    @click="openCreateModal">
                    <span class="text-lg">+</span>
                    <span>{{ $t('course.createCourse') }}</span>
                </button>
            </div>

            <!-- 二级分类 + 筛选 -->
            <div class="flex items-center justify-between mb-4 flex-shrink-0">
                <!-- 二级分类标签 -->
                <div class="flex items-center gap-2 flex-wrap">
                    <button v-for="sub in subCategories" :key="sub.value" :class="[
                        'px-4 py-2 rounded-full text-sm transition-colors',
                        activeSubCategory === sub.value
                            ? 'bg-[#FF9900] text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF9900]'
                    ]" @click="handleSubCategoryClick(sub)">
                        {{ sub.label }}
                    </button>
                </div>
                <!-- 右侧筛选 -->
                <div class="flex items-center gap-3">
                    <!-- 开通状态筛选（自定义和共享课程不显示） -->
                    <div v-if="activeCategory !== '自定义课程' && activeCategory !== '共享课程'" class="flex items-center gap-2">
                        <span class="text-sm text-gray-500">{{ $t('common.openStatus') }}：</span>
                        <!-- 自定义下拉框 -->
                        <div class="relative">
                            <button type="button"
                                class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#FF9900] transition-colors min-w-[90px]"
                                @click="showStatusDropdown = !showStatusDropdown">
                                <span>{{statusOptions.find(o => o.value === courseStatus)?.label || $t('common.all')}}</span>
                                <svg class="w-4 h-4 text-gray-400 transition-transform"
                                    :class="{ 'rotate-180': showStatusDropdown }" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <!-- 下拉选项 -->
                            <Transition name="dropdown">
                                <div v-if="showStatusDropdown"
                                    class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-[5]">
                                    <div v-for="option in statusOptions" :key="option.value"
                                        class="px-3 py-2 text-sm cursor-pointer transition-colors" :class="[
                                            courseStatus === option.value
                                                ? 'bg-[#FFF7E6] text-[#FF9900]'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        ]" @click="selectStatus(option.value)">
                                        {{ option.label }}
                                    </div>
                                </div>
                            </Transition>
                        </div>
                    </div>
                    <div class="relative">
                        <input v-model="searchKeyword" type="text" :placeholder="$t('common.searchPlaceholder')"
                            class="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-[200px] outline-none focus:border-[#FF9900]" />
                        <svg class="w-5 h-5 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- 三级分类 -->
            <div v-if="thirdCategories.length > 0" class="flex items-center gap-2 flex-wrap mb-4 flex-shrink-0">
                <button v-for="third in thirdCategories" :key="third.value" :class="[
                    'px-4 py-2 rounded-full text-sm transition-colors',
                    activeThirdCategory === third.value
                        ? 'bg-[#FF9900] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF9900]'
                ]" @click="activeThirdCategory = third.value">
                    {{ third.label }}
                </button>
            </div>

            <!-- 课程列表区域 -->
            <div class="flex-1 bg-white rounded-lg border border-dashed border-gray-300 p-6 overflow-auto">
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    <NuxtLink v-for="course in courseList" :key="course.id" :to="`/system/course/${course.id}`"
                        class="course-card cursor-pointer group">
                        <!-- 课程封面 -->
                        <div
                            class="course-cover bg-gray-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                            <!-- 自定义课程：显示编辑和删除图标 -->
                            <div v-if="course.category === '自定义课程'" class="absolute top-2 right-2 flex gap-1 z-10">
                                <div class="tooltip-wrapper group relative">
                                    <button
                                        class="w-7 h-7 bg-white rounded flex items-center justify-center shadow hover:bg-gray-50"
                                        @click.prevent="handleEditCourse(course)">
                                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <div class="tooltip-content">{{ $t('common.edit') }}<span class="tooltip-arrow"></span></div>
                                </div>
                                <!-- 学校可见的课程不显示删除按钮（coursePermission: 0=仅自己可见，1=全校老师可见） -->
                                <div v-if="course.coursePermission !== 1" class="tooltip-wrapper group relative">
                                    <button
                                        class="w-7 h-7 bg-white rounded flex items-center justify-center shadow hover:bg-red-50"
                                        @click.prevent="handleDeleteCourse(course)">
                                        <svg class="w-4 h-4 text-gray-500 hover:text-red-500" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <div class="tooltip-content">{{ $t('common.delete') }}<span class="tooltip-arrow"></span></div>
                                </div>
                            </div>
                            <!-- 共享课程：编辑或添加按钮（二选一） -->
                            <div v-else-if="course.category === '共享课程'" class="absolute top-2 right-2 z-10">
                                <!-- 可添加的共享课程（别人分享的）只显示添加按钮 -->
                                <div v-if="course.canAdd" class="tooltip-wrapper group relative">
                                    <button
                                        class="w-7 h-7 bg-white rounded flex items-center justify-center shadow hover:bg-[#FFF7E6]"
                                        @click.prevent="handleAddToMyCourse(course)">
                                        <svg class="w-4 h-4 text-[#FF9900]" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                    <div class="tooltip-content">{{ $t('common.add') }}<span class="tooltip-arrow"></span></div>
                                </div>
                                <!-- 自己的共享课程只显示编辑按钮 -->
                                <div v-else class="tooltip-wrapper group relative">
                                    <button
                                        class="w-7 h-7 bg-white rounded flex items-center justify-center shadow hover:bg-gray-50"
                                        @click.prevent="handleEditCourse(course)">
                                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <div class="tooltip-content">{{ $t('common.edit') }}<span class="tooltip-arrow"></span></div>
                                </div>
                            </div>
                            <!-- 其他课程：显示状态标签 -->
                            <span v-else class="absolute top-2 right-2 px-2 py-0.5 rounded text-xs z-10"
                                :class="[statusConfig[course.status]?.bg, statusConfig[course.status]?.color]">
                                {{ statusConfig[course.status]?.label }}
                            </span>
                            <!-- 封面图片 -->
                            <img v-if="course.cover" :src="course.cover" alt="课程封面" class="absolute inset-0 w-full h-full object-cover" />
                            <!-- 无封面时显示占位 -->
                            <template v-else>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-gray-400 text-sm">{{ $t('common.courseCover') }}</span>
                                </div>
                                <!-- 对角线装饰 -->
                                <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                    <line x1="0" y1="0" x2="100%" y2="100%" stroke="#ccc" stroke-width="1" />
                                    <line x1="100%" y1="0" x2="0" y2="100%" stroke="#ccc" stroke-width="1" />
                                </svg>
                            </template>
                        </div>
                        <!-- 课程名称 -->
                        <div class="text-sm font-medium text-gray-800 mb-1">{{ course.name }}</div>
                        <!-- 课时数 -->
                        <div class="text-xs text-gray-400">{{ course.hours }}{{ $t('common.hours') }}</div>
                    </NuxtLink>
                </div>

                <!-- 空状态 -->
                <div v-if="!courseList.length" class="flex flex-col items-center justify-center h-full text-gray-400">
                    <p>{{ $t('course.noChapter') }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { cursorAdmin } from '~/composables/api/curosr'

definePageMeta({
    layout: 'sidebar'
})

const { getCursorTreeMenu, getCursorList, createCursor, editCursor, deleteCursor, copyCursor } = cursorAdmin()

// 获取当前用户ID
const currentUserId = ref<string>('')
const initUserInfo = () => {
    if (process.client) {
        const userInfo = localStorage.getItem('user_info')
        if (userInfo) {
            const user = JSON.parse(userInfo)
            currentUserId.value = user.user_id || ''
        }
    }
}

// 菜单树数据接口返回结构
interface MenuNode {
    menuId: number | null
    menuName: string
    parentId: number | null
    menuLevel: number | null
    isVisible: number | null
    children?: MenuNode[]
}

// 一级分类 - 主分类（从接口获取，不含自定义和共享）
const mainCategories = ref<{ label: string; value: string }[]>([])

// 一级分类 - 特殊分类（自定义和共享，从接口获取但单独处理）
const extraCategories = ref<{ label: string; value: string }[]>([])

const activeCategory = ref('')

// 二级分类映射表：一级分类 -> 对应的二级分类列表（从接口获取）
const subCategoryMap = ref<Record<string, { label: string; value: string; hasChildren?: boolean }[]>>({})

// 三级分类映射表：二级分类 -> 对应的三级分类列表
const thirdCategoryMap = ref<Record<string, { label: string; value: string }[]>>({})

// 当前选中的三级分类
const activeThirdCategory = ref('')

// 加载菜单数据
const loadMenuData = async () => {
    try {
        const data = await getCursorTreeMenu()
        if (data && Array.isArray(data)) {
            const mainList: { label: string; value: string }[] = []
            const extraList: { label: string; value: string }[] = []

            data.forEach((item: MenuNode) => {
                const menuValue = item.menuId !== null ? String(item.menuId) : item.menuName
                const menuItem = {
                    label: item.menuName,
                    value: menuValue,
                }

                // 自定义课程和共享课程（menuId 为 null）放到特殊分类
                if (item.menuId === null) {
                    extraList.push(menuItem)
                    // 设置特殊分类的二级分类
                    if (item.menuName === '自定义课程') {
                        subCategoryMap.value[menuValue] = [
                            { label: t('common.privateVisible'), value: 'private' },
                            { label: t('common.schoolVisible'), value: 'public' },
                        ]
                    } else if (item.menuName === '共享课程') {
                        subCategoryMap.value[menuValue] = [
                            { label: t('common.all'), value: 'all' },
                        ]
                    }
                } else {
                    mainList.push(menuItem)
                    // 解析二级分类
                    const children = item.children || []
                    // 检查是否已有"全部"子项
                    const hasAll = children.some((c) => c.menuName === '全部')
                    const subList: { label: string; value: string; hasChildren?: boolean }[] = []

                    if (!hasAll) {
                        subList.push({ label: t('common.all'), value: 'all' })
                    }

                    children.forEach((child: MenuNode) => {
                        const childValue = child.menuId !== null ? String(child.menuId) : 'all'
                        const hasGrandChildren = child.children && child.children.length > 0

                        subList.push({
                            label: child.menuName,
                            value: childValue,
                            hasChildren: hasGrandChildren,
                        })

                        // 如果有三级分类，存储到三级分类映射表
                        if (hasGrandChildren && child.children) {
                            // 检查是否已有"全部"子项
                            const hasThirdAll = child.children.some((c) => c.menuName === '全部')
                            const thirdList: { label: string; value: string }[] = []

                            if (!hasThirdAll) {
                                thirdList.push({ label: t('common.all'), value: 'all' })
                            }

                            child.children.forEach((grandChild: MenuNode) => {
                                thirdList.push({
                                    label: grandChild.menuName,
                                    value: grandChild.menuId !== null ? String(grandChild.menuId) : 'all',
                                })
                            })
                            thirdCategoryMap.value[childValue] = thirdList
                        }
                    })

                    subCategoryMap.value[menuValue] = subList
                }
            })

            mainCategories.value = mainList
            extraCategories.value = extraList

            // 默认选中第一个分类（常规课程）及其二级分类的第一个（全部）
            if (mainCategories.value.length > 0 && mainCategories.value[0]) {
                const firstCategoryValue = mainCategories.value[0].value
                activeCategory.value = firstCategoryValue
                // 获取该分类的二级分类，默认选中第一个
                const subList = subCategoryMap.value[firstCategoryValue]
                if (subList && subList.length > 0 && subList[0]) {
                    activeSubCategory.value = subList[0].value
                }
                // 加载课程列表
                await loadCourseList()
            }
            // 标记初始化完成
            initialized.value = true
        }
    } catch (error) {
        console.error('获取课程菜单失败:', error)
    }
}

// 根据当前一级分类计算二级分类列表
const subCategories = computed(() => {
    return subCategoryMap.value[activeCategory.value] || [{ label: t('common.all'), value: 'all' }]
})

const activeSubCategory = ref('all')

// 根据当前二级分类计算三级分类列表
const thirdCategories = computed(() => {
    return thirdCategoryMap.value[activeSubCategory.value] || []
})

// 点击二级分类
const handleSubCategoryClick = (sub: { label: string; value: string; hasChildren?: boolean }) => {
    activeSubCategory.value = sub.value
    // 如果有三级分类，默认选中第一个
    const thirdList = thirdCategoryMap.value[sub.value]
    if (thirdList && thirdList.length > 0 && thirdList[0]) {
        activeThirdCategory.value = thirdList[0].value
    } else {
        activeThirdCategory.value = ''
    }
}

// 监听一级分类变化，重置二级分类为第一个
watch(activeCategory, (newVal) => {
    // 自定义课程默认选中"个人可见"
    if (newVal === '自定义课程') {
        activeSubCategory.value = 'private'
    } else {
        // 获取该分类的二级分类，默认选中第一个
        const subList = subCategoryMap.value[newVal]
        if (subList && subList.length > 0 && subList[0]) {
            activeSubCategory.value = subList[0].value
        } else {
            activeSubCategory.value = 'all'
        }
    }
})

// 筛选
const courseStatus = ref('')
const searchKeyword = ref('')

// 创建课程弹窗
const showCreateModal = ref(false)

// 打开创建课程弹窗（新建模式）
const openCreateModal = () => {
    editCourseData.value = null
    showCreateModal.value = true
}

const handleCreateCourse = async (data: any) => {
    try {
        if (editCourseData.value) {
            // 编辑模式
            await editCursor({
                courseId: editCourseData.value.id,
                courseName: data.name,
                courseCoverUrl: data.coverUrl || editCourseData.value.coverUrl || '',
                courseDesc: data.description || '',
                coursePermission: data.permission === 'public' ? 1 : 0,
                chapterList: data.chapters.map((c: any) => ({
                    chapterId: c.chapterId || undefined,
                    chapterName: c.name,
                    delFlag: c.delFlag,
                })),
            })
        } else {
            // 创建模式
            await createCursor({
                courseName: data.name,
                courseCoverUrl: data.coverUrl || '',
                courseDesc: data.description || '',
                coursePermission: data.permission === 'public' ? 1 : 0,
                chapterList: data.chapters.map((c: any) => ({
                    chapterName: c.name,
                    delFlag: c.delFlag,
                })),
            })
        }
        // 刷新课程列表
        loadCourseList()
    } catch (error) {
        console.error('操作失败:', error)
    }
}

// 编辑自定义课程
const editCourseData = ref<any>(null)

const handleEditCourse = (course: any) => {
    // 构造编辑数据
    editCourseData.value = {
        id: course.id,
        name: course.name,
        description: course.description || '',
        permission: course.coursePermission === 1 ? 'public' : 'private',
        coverUrl: course.cover || '',
        coverOssId: course.coverOssId || '',
        chapters: course.chapters || [{ id: 1, name: '第一章' }],
        hours: course.hours,
    }
    showCreateModal.value = true
}

// 删除自定义课程
const showDeleteModal = ref(false)
const courseToDelete = ref<any>(null)

const handleDeleteCourse = (course: any) => {
    courseToDelete.value = course
    showDeleteModal.value = true
}

const confirmDeleteCourse = async () => {
    if (courseToDelete.value) {
        try {
            await deleteCursor(String(courseToDelete.value.id))
            courseToDelete.value = null
            // 刷新课程列表
            loadCourseList()
        } catch (error) {
            console.error('删除课程失败:', error)
        }
    }
}

// 添加共享课程到我的自定义课程
const handleAddToMyCourse = async (course: any) => {
    console.log(course)
    try {
        await copyCursor(course.id)
        // 刷新课程列表
        loadCourseList()
        ElMessage.success(t('common.addSuccess'))
    } catch (error) {
        console.error('添加到我的课程失败:', error)
    }
}

// 开通状态下拉框
const showStatusDropdown = ref(false)
const { t } = useI18n()
const statusOptions = computed(() => [
    { label: t('common.all'), value: '' },
    { label: t('common.opened'), value: 'opened' },
    { label: t('common.notOpened'), value: 'not_opened' },
    { label: t('common.expired'), value: 'expired' },
    { label: t('common.trial'), value: 'trial' },
])

const selectStatus = (value: string) => {
    courseStatus.value = value
    showStatusDropdown.value = false
}

// 点击外部关闭下拉框
const closeDropdown = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
        showStatusDropdown.value = false
    }
}

onMounted(() => {
    initUserInfo()
    if (process.client) {
        loadMenuData()
    }
    document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
    document.removeEventListener('click', closeDropdown)
})

// 课程状态配置
const statusConfig = computed(() => ({
    opened: { label: t('common.opened'), color: 'text-green-600', bg: 'bg-green-50' },
    not_opened: { label: t('common.notOpened'), color: 'text-gray-500', bg: 'bg-gray-100' },
    expired: { label: t('common.expired'), color: 'text-red-500', bg: 'bg-red-50' },
    trial: { label: t('common.trial'), color: 'text-blue-500', bg: 'bg-blue-50' },
} as Record<string, { label: string; color: string; bg: string }>))

// 课程类型定义
interface Course {
    id: number
    name: string
    hours: number
    canAdd?: boolean // 共享课程是否可添加（别人创建的）
    isOwner?: boolean // 是否是自己创建的
    createBy?: string // 创建者ID
    category: string
    subCategory: string
    status: string
    description?: string
    coursePermission?: number // 0=仅自己可见，1=全校老师可见
    chapters?: { id: number; name: string }[]
    cover?: string // 课程封面
}

// 课程列表数据
const courseList = ref<Course[]>([])
const loading = ref(false)

// 加载课程列表
const loadCourseList = async () => {
    loading.value = true
    try {
        const params: any = {}

        // 自定义课程和共享课程使用 courseType
        if (activeCategory.value === '自定义课程') {
            params.courseType = 1
            // 自定义课程的二级分类：0仅自己可见（个人可见）/1全校老师可见（学校可见）
            if (activeSubCategory.value === 'public') {
                params.coursePermission = 1 // 学校可见
            } else {
                params.coursePermission = 0 // 个人可见（默认）
            }
        } else if (activeCategory.value === '共享课程') {
            params.courseType = 2
        } else {
            // 普通课程使用 menuId，优先使用三级分类
            let menuId: number
            if (activeThirdCategory.value && activeThirdCategory.value !== 'all') {
                menuId = Number(activeThirdCategory.value)
            } else if (activeSubCategory.value && activeSubCategory.value !== 'all') {
                menuId = Number(activeSubCategory.value)
            } else {
                menuId = Number(activeCategory.value)
            }

            if (isNaN(menuId)) {
                courseList.value = []
                loading.value = false
                return
            }
            params.menuId = menuId
        }

        // 开通状态筛选
        if (courseStatus.value) {
            const statusMap: Record<string, number> = {
                opened: 1,
                not_opened: 0,
                expired: 2,
                trial: 3,
            }
            params.openStatus = statusMap[courseStatus.value]
        }

        // 关键词搜索
        if (searchKeyword.value) {
            params.name = searchKeyword.value
        }

        const data = await getCursorList(params)
        if (data && Array.isArray(data)) {
            courseList.value = data.map((item: any) => {
                // 共享课程：createBy 等于当前用户ID则可编辑，否则可添加
                const isOwner = String(item.createBy) === String(currentUserId.value)
                return {
                    id: item.courseId,
                    name: item.courseName,
                    hours: item.courseHours || item.chapterCount || 0,
                    category: activeCategory.value,
                    subCategory: activeSubCategory.value,
                    status: item.openStatus === 1 ? 'opened' : item.openStatus === 2 ? 'expired' : item.openStatus === 3 ? 'trial' : 'not_opened',
                    description: item.courseDesc || item.courseDescription || '',
                    cover: item.courseCoverUrl || item.courseCover || '',
                    coverOssId: item.courseCoverOssId || '',
                    coeateBy: item.createBy,
                    isOwner, // 是否是自己创建的
                    canAdd: !isOwner, // 不是自己创建的才能添加
                }
            })
        } else {
            courseList.value = []
        }
    } catch (error) {
        console.error('获取课程列表失败:', error)
        courseList.value = []
    } finally {
        loading.value = false
    }
}

// 是否已完成初始化
const initialized = ref(false)

// 监听分类和筛选条件变化，重新加载课程列表
watch([activeCategory, activeSubCategory, activeThirdCategory, courseStatus, searchKeyword], () => {
    // 初始化完成后才响应 watch
    if (initialized.value) {
        loadCourseList()
    }
})
</script>

<style scoped>
.course-page {
    height: calc(100vh - 70px);
    overflow: hidden;
}

.course-cover {
    width: 100%;
    aspect-ratio: 3 / 4;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.course-card {
    transition: transform 0.3s ease;
}

.course-card:hover {
    transform: scale(1.05);
}

.course-card:hover .course-cover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* 下拉框动画 */
.dropdown-enter-active,
.dropdown-leave-active {
    transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}

/* 自定义 Tooltip 样式 */
.tooltip-wrapper {
    display: inline-block;
}

.tooltip-content {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 12px;
    background: #333;
    color: white;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: 100;
}

.tooltip-arrow {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-bottom-color: #333;
}

.tooltip-wrapper:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
}
</style>