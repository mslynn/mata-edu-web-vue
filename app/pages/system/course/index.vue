    <template>
    <div ref="coursePageRef" class="course-page" :style="courseAdaptiveStyle">
        <!-- 创建/编辑课程弹窗 -->
        <CreateCourseModal v-model="showCreateModal" :edit-data="editCourseData" @confirm="handleCreateCourse" />

        <!-- 删除课程确认弹窗 -->
        <DeleteCourseModal v-model:visible="showDeleteModal" @confirm="confirmDeleteCourse" />

        <div class="course-page__content">
            <div class="course-topbar">
                <div class="course-topbar__tabs">
                    <button
                        v-for="cat in mainCategories"
                        :key="cat.value"
                        :class="['course-pill', { 'is-active': activeCategory === cat.value }]"
                        @click="activeCategory = cat.value"
                    >
                        {{ cat.label }}
                    </button>
                    <div v-if="mainCategories.length > 0" class="course-topbar__divider"></div>
                    <button
                        v-for="cat in extraCategories"
                        :key="cat.value"
                        :class="['course-pill', { 'is-active': activeCategory === cat.value }]"
                        @click="activeCategory = cat.value"
                    >
                        {{ cat.label }}
                    </button>
                </div>

                <button class="course-create-btn" @click="openCreateModal">
                    <span class="course-create-btn__icon">+</span>
                    <span>{{ $t('course.createCourse') }}</span>
                </button>
            </div>

            <div class="course-tools">
                <MInput
                    v-model="searchKeyword"
                    clearable
                    :placeholder="$t('common.searchPlaceholder')"
                    class="course-search course-search__input"
                >
                    <template #prefix>
                        <svg class="course-search__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </template>
                </MInput>

                <div
                    v-if="activeCategory !== 'custom' && activeCategory !== 'shared'"
                    class="course-status-filter"
                >
                    <span class="course-status-filter__label">{{ $t('common.openStatus') }}:</span>
                    <MSelect
                        v-model="courseStatus"
                        :options="statusOptions"
                        class="course-status-filter__select"
                        dropdown-class="course-status-filter__dropdown"
                    />
                </div>

                <div class="course-status-filter">
                    <span class="course-status-filter__label">课程学段:</span>
                    <MSelect
                        v-model="courseStage"
                        :options="stageOptions"
                        class="course-status-filter__select"
                        dropdown-class="course-status-filter__dropdown"
                    />
                </div>
            </div>

            <div class="course-filter-strip">
                <span class="course-filter-strip__label">分类</span>
                <button
                    v-for="sub in subCategories"
                    :key="sub.value"
                    :class="['course-filter-strip__item', { 'is-active': activeSubCategory === sub.value }]"
                    @click="handleSubCategoryClick(sub)"
                >
                    {{ sub.label }}
                </button>
            </div>

            <div v-if="thirdCategories.length > 0" class="course-filter-strip course-filter-strip--secondary">
                <span class="course-filter-strip__label">子类</span>
                <button
                    v-for="third in thirdCategories"
                    :key="third.value"
                    :class="['course-filter-strip__item', { 'is-active': activeThirdCategory === third.value }]"
                    @click="activeThirdCategory = third.value"
                >
                    {{ third.label }}
                </button>
            </div>

            <div class="course-board">
                <div class="course-board__scroll">
                    <div v-if="loading" class="course-grid course-grid--loading">
                        <div v-for="i in 10" :key="i" class="course-card course-card--skeleton">
                            <el-skeleton animated :rows="0">
                                <template #template>
                                    <div class="course-cover">
                                        <el-skeleton-item variant="rect" class="course-card__cover-skeleton" />
                                    </div>
                                    <div class="course-card__body">
                                        <el-skeleton-item variant="text" class="course-card__title-skeleton" />
                                    </div>
                                </template>
                            </el-skeleton>
                        </div>
                    </div>

                    <div v-else class="course-grid">
                        <div
                            v-for="course in filteredCourseList"
                            :key="course.id"
                            class="course-card group"
                            :class="getCourseCardStateClass(course)"
                            @click="handleCourseCardClick(course)"
                        >
                            <div class="course-cover">
                                <div v-if="course.category === 'custom'" class="course-card__actions">
                                    <div class="tooltip-wrapper group relative">
                                        <button
                                            class="course-card__action-btn"
                                            @click.stop.prevent="handleEditCourse(course)"
                                        >
                                            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <div class="tooltip-content">{{ $t('common.edit') }}<span class="tooltip-arrow"></span></div>
                                    </div>
                                    <div
                                        v-if="activeSubCategory !== 'public' && Number(course.coursePermission) !== 1"
                                        class="tooltip-wrapper group relative"
                                    >
                                        <button
                                            class="course-card__action-btn course-card__action-btn--danger"
                                            @click.stop.prevent="handleDeleteCourse(course)"
                                        >
                                            <svg class="w-4 h-4 text-gray-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <div class="tooltip-content">{{ $t('common.delete') }}<span class="tooltip-arrow"></span></div>
                                    </div>
                                </div>

                                <template v-else-if="course.category === 'shared'">
                                    <div class="course-card__actions">
                                        <div v-if="course.canAdd" class="tooltip-wrapper group relative">
                                            <button
                                                class="course-card__action-btn course-card__action-btn--accent"
                                                @click.stop.prevent="handleAddToMyCourse(course)"
                                            >
                                                <svg class="w-4 h-4 text-[#005BC2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                            <div class="tooltip-content">{{ $t('common.add') }}<span class="tooltip-arrow"></span></div>
                                        </div>
                                        <div v-else class="tooltip-wrapper group relative">
                                            <button
                                                class="course-card__action-btn"
                                                @click.stop.prevent="handleEditCourse(course)"
                                            >
                                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <div class="tooltip-content">{{ $t('common.edit') }}<span class="tooltip-arrow"></span></div>
                                        </div>
                                    </div>
                                    <span v-if="course.isOwner" class="course-card__tag course-card__tag--mine">我的</span>
                                    <span v-else-if="course.createByName" class="course-card__tag course-card__tag--shared">{{ course.createByName }}</span>
                                </template>

                                <span
                                    v-else
                                    class="course-card__status"
                                    :class="getCourseStatusBadgeClass(course.status)"
                                >
                                    {{ statusConfig[course.status]?.label }}
                                </span>

                                <img
                                    v-if="course.cover"
                                    :src="course.cover"
                                    alt="课程封面"
                                    loading="lazy"
                                    decoding="async"
                                    fetchpriority="low"
                                    class="course-card__image"
                                />
                                <template v-else>
                                    <div class="course-card__cover-empty">
                                        <span class="text-gray-400 text-sm">{{ $t('common.courseCover') }}</span>
                                    </div>
                                    <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#ccc" stroke-width="1" />
                                        <line x1="100%" y1="0" x2="0" y2="100%" stroke="#ccc" stroke-width="1" />
                                    </svg>
                                </template>
                            </div>

                            <div class="course-card__body">
                                <div class="course-card__title">{{ course.name }}</div>
                            </div>
                        </div>
                    </div>

                    <div v-if="!loading && !filteredCourseList.length" class="course-empty-state">
                        <p>{{ $t('course.noChapter') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { ref, shallowRef, computed, watch, onMounted, onUnmounted } from 'vue'
import { cursorAdmin } from '~/composables/api/curosr'
import { useCourseMenuStore, type CourseMenuNode } from '~/stores/courseMenu'

definePageMeta({
    layout: 'sidebar'
})

const router = useRouter()
const { getCursorTreeMenu, getCursorList, createCursor, editCursor, deleteCursor, copyCursor } = cursorAdmin()
const coursePageRef = ref<HTMLElement | null>(null)
const courseLayoutWidth = ref(1360)
let coursePageResizeObserver: ResizeObserver | null = null

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

const courseMenuStore = useCourseMenuStore()

// 一级分类 - 主分类（从接口获取，不含自定义和共享）
const mainCategories = shallowRef<{ label: string; value: string }[]>([])

// 一级分类 - 特殊分类（自定义和共享，从接口获取但单独处理）
const extraCategories = shallowRef<{ label: string; value: string }[]>([])

const activeCategory = ref('')

// 二级分类映射表：一级分类 -> 对应的二级分类列表（从接口获取）
const subCategoryMap = shallowRef<Record<string, { label: string; value: string; hasChildren?: boolean }[]>>({})

// 三级分类映射表：二级分类 -> 对应的三级分类列表
const thirdCategoryMap = shallowRef<Record<string, { label: string; value: string }[]>>({})

// 当前选中的三级分类
const activeThirdCategory = ref('')

// 加载菜单数据
const applyMenuData = (data: CourseMenuNode[]) => {
    const mainList: { label: string; value: string }[] = []
    const extraList: { label: string; value: string }[] = []
    const nextSubCategoryMap: Record<string, { label: string; value: string; hasChildren?: boolean }[]> = {}
    const nextThirdCategoryMap: Record<string, { label: string; value: string }[]> = {}

    data.forEach((item: CourseMenuNode) => {
        const isCustomCourse = item.menuId === null && (item.menuName === '自定义课程' || item.menuName === 'Custom Course')
        const isSharedCourse = item.menuId === null && (item.menuName === '共享课程' || item.menuName === 'Shared Course')
        const menuValue = item.menuId !== null ? String(item.menuId) : (isCustomCourse ? 'custom' : (isSharedCourse ? 'shared' : item.menuName))
        const menuItem = {
            label: item.menuName,
            value: menuValue,
        }

        if (item.menuId === null) {
            extraList.push(menuItem)
            if (isCustomCourse) {
                nextSubCategoryMap[menuValue] = [
                    { label: t('common.privateVisible'), value: 'private' },
                    { label: t('common.schoolVisible'), value: 'public' },
                ]
            } else if (isSharedCourse) {
                nextSubCategoryMap[menuValue] = [
                    { label: t('common.all'), value: 'all' },
                ]
            }
        } else {
            mainList.push(menuItem)
            const children = item.children || []
            const hasAll = children.some((c) => c.menuName === '全部')
            const subList: { label: string; value: string; hasChildren?: boolean }[] = []

            if (!hasAll) {
                subList.push({ label: t('common.all'), value: 'all' })
            }

            children.forEach((child: CourseMenuNode) => {
                const childValue = child.menuId !== null ? String(child.menuId) : 'all'
                const hasGrandChildren = child.children && child.children.length > 0

                subList.push({
                    label: child.menuName,
                    value: childValue,
                    hasChildren: hasGrandChildren,
                })

                if (hasGrandChildren && child.children) {
                    const hasThirdAll = child.children.some((c) => c.menuName === '全部')
                    const thirdList: { label: string; value: string }[] = []

                    if (!hasThirdAll) {
                        thirdList.push({ label: t('common.all'), value: 'all' })
                    }

                    child.children.forEach((grandChild: CourseMenuNode) => {
                        thirdList.push({
                            label: grandChild.menuName,
                            value: grandChild.menuId !== null ? String(grandChild.menuId) : 'all',
                        })
                    })
                    nextThirdCategoryMap[childValue] = thirdList
                }
            })

            nextSubCategoryMap[menuValue] = subList
        }
    })

    mainCategories.value = mainList
    extraCategories.value = extraList
    subCategoryMap.value = nextSubCategoryMap
    thirdCategoryMap.value = nextThirdCategoryMap
}

const loadMenuData = async () => {
    try {
        const cachedData = courseMenuStore.tree
        const data = cachedData.length ? cachedData : await getCursorTreeMenu()
        if (data && Array.isArray(data)) {
            if (!cachedData.length) {
                courseMenuStore.setTree(data)
            }
            applyMenuData(data)

            if (mainCategories.value.length > 0 && mainCategories.value[0]) {
                const firstCategoryValue = mainCategories.value[0].value
                activeCategory.value = firstCategoryValue
                const subList = subCategoryMap.value[firstCategoryValue]
                if (subList && subList.length > 0 && subList[0]) {
                    activeSubCategory.value = subList[0].value
                }
                await loadCourseList()
            }
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
    if (newVal === 'custom') {
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
const courseStage = ref('')
const searchKeyword = ref('')

const stageOptions = [
    { label: '全部', value: '' },
    { label: '幼儿园', value: '幼儿园' },
    { label: '小学', value: '小学' },
    { label: '初中', value: '初中' },
    { label: '高中', value: '高中' },
]

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

const { t } = useI18n()

const getCourseLayoutWidth = () => {
    if (typeof window === 'undefined') {
        return 1360
    }

    const clientWidth = document.documentElement?.clientWidth || 0
    const pageClientWidth = coursePageRef.value?.clientWidth || 0
    const outerWidth = window.outerWidth || 0
    const innerWidth = window.innerWidth || 0
    const referenceWidth = outerWidth || innerWidth || clientWidth || 1360
    const visibleWidthCandidates = [clientWidth, pageClientWidth].filter((width) => width > 0)
    const visibleWidth = visibleWidthCandidates.length ? Math.min(...visibleWidthCandidates) : referenceWidth
    const boundedWidth = Math.min(referenceWidth, visibleWidth)

    return Math.max(1280, Math.round(boundedWidth))
}

const syncCourseLayoutWidth = () => {
    courseLayoutWidth.value = getCourseLayoutWidth()
}

const courseShellWidth = computed(() => {
    if (courseLayoutWidth.value <= 1700) {
        return `${Math.max(1280, Math.round(courseLayoutWidth.value))}px`
    }

    return `${Math.min(1920, Math.max(1280, Math.round(courseLayoutWidth.value * 0.9)))}px`
})

const courseAdaptiveStyle = computed(() => ({
    '--course-shell-width': courseShellWidth.value,
}))

const statusOptions = computed(() => [
    { label: t('common.all'), value: '' },
    { label: t('common.opened'), value: 'opened' },
    { label: t('common.notOpened'), value: 'not_opened' },
    { label: t('common.expired'), value: 'expired' },
    { label: t('common.trial'), value: 'trial' },
])

onMounted(() => {
    syncCourseLayoutWidth()
    initUserInfo()
    if (process.client) {
        loadMenuData()
    }
    window.addEventListener('resize', syncCourseLayoutWidth)
    window.visualViewport?.addEventListener('resize', syncCourseLayoutWidth)
    if (window.ResizeObserver && coursePageRef.value) {
        coursePageResizeObserver = new window.ResizeObserver(() => {
            syncCourseLayoutWidth()
        })
        coursePageResizeObserver.observe(coursePageRef.value)
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', syncCourseLayoutWidth)
    window.visualViewport?.removeEventListener('resize', syncCourseLayoutWidth)
    coursePageResizeObserver?.disconnect()
    coursePageResizeObserver = null
    if (searchTimer) {
        clearTimeout(searchTimer)
        searchTimer = null
    }
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
    createByName?: string // 创建者名字
    category: string
    subCategory: string
    status: string
    description?: string
    coursePermission?: number // 0=仅自己可见，1=全校老师可见
    chapters?: { id: number; name: string }[]
    cover?: string // 课程封面
    courseStageLabels?: string
}

// 课程列表数据
const courseList = shallowRef<Course[]>([])
const loading = ref(false)
const debouncedSearchKeyword = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const filteredCourseList = computed(() => {
    const keyword = debouncedSearchKeyword.value.trim().toLowerCase()
    const stage = courseStage.value
    return courseList.value.filter((course) => {
        const matchStatus =
            !courseStatus.value || activeCategory.value === 'custom' || activeCategory.value === 'shared'
                ? true
                : course.status === courseStatus.value

        const matchKeyword = !keyword
            ? true
            : [
                course.name,
                course.description,
                course.createByName
            ].some((field) => String(field || '').toLowerCase().includes(keyword))

        const matchStage = !stage
            ? true
            : String(course.courseStageLabels || '')
                .split(',')
                .map((s) => s.trim())
                .includes(stage)

        return matchStatus && matchKeyword && matchStage
    })
})

const canEnterCourse = (course: Course) => {
    if (course.category === 'custom' || course.category === 'shared') {
        return true
    }
    return course.status === 'opened' || course.status === 'trial'
}

const getCourseCardStateClass = (course: Course) => {
    return canEnterCourse(course)
        ? 'cursor-pointer'
        : 'cursor-not-allowed opacity-80'
}

const getCourseStatusBadgeClass = (status: string) => {
    switch (status) {
    case 'opened':
        return 'course-card__status--opened'
    case 'expired':
        return 'course-card__status--expired'
    case 'trial':
        return 'course-card__status--trial'
    default:
        return 'course-card__status--default'
    }
}

const handleCourseCardClick = (course: Course) => {
    if (!canEnterCourse(course)) {
        ElMessage.warning(
            course.status === 'expired'
                ? '该课程已过期，暂时无法进入'
                : '该课程暂未开通，暂时无法进入'
        )
        return
    }
    router.push(`/system/course/${course.id}`)
}

// 加载课程列表
const loadCourseList = async () => {
    loading.value = true
    try {
        const params: any = {}

        // 自定义课程和共享课程使用 courseType
        if (activeCategory.value === 'custom') {
            params.courseType = 1
            // 自定义课程的二级分类：0仅自己可见（个人可见）/1全校老师可见（学校可见）
            if (activeSubCategory.value === 'public') {
                params.coursePermission = 1 // 学校可见
            } else {
                params.coursePermission = 0 // 个人可见（默认）
            }
        } else if (activeCategory.value === 'shared') {
            params.courseType = 2
        } else {
            // 普通课程使用 menuId，优先使用三级分类
            let menuId: number
            if (activeThirdCategory.value && activeThirdCategory.value !== 'all') {
                // 选了具体的三级分类，用三级的menuId
                menuId = Number(activeThirdCategory.value)
            } else if (activeThirdCategory.value === 'all' && activeSubCategory.value && activeSubCategory.value !== 'all') {
                // 三级选"全部"，用二级的menuId（父级）
                menuId = Number(activeSubCategory.value)
            } else if (activeSubCategory.value && activeSubCategory.value !== 'all') {
                // 选了具体的二级分类（没有三级），用二级的menuId
                menuId = Number(activeSubCategory.value)
            } else {
                // 二级选"全部"，用一级的menuId（父级）
                menuId = Number(activeCategory.value)
            }

            if (isNaN(menuId)) {
                courseList.value = []
                loading.value = false
                return
            }
            params.menuId = menuId
        }

        const data = await getCursorList(params)
        if (data && Array.isArray(data)) {
            const nextCourseList = data.map((item: any) => {
                // 共享课程：createBy 等于当前用户ID则可编辑，否则可添加
                const isOwner = String(item.createBy) === String(currentUserId.value)
                const permissionRaw = item.coursePermission ?? item.permission
                const permissionValue = permissionRaw === 'public'
                    ? 1
                    : permissionRaw === 'private'
                        ? 0
                        : Number(permissionRaw)
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
                    createBy: item.createBy,
                    createByName: item.createByName || item.nickName || '',
                    isOwner, // 是否是自己创建的
                    canAdd: !isOwner, // 不是自己创建的才能添加
                    coursePermission: Number.isFinite(permissionValue) ? permissionValue : 0,
                    courseStageLabels: typeof item.courseStageLabels === 'string' ? item.courseStageLabels : '',
                }
            })
            courseList.value = nextCourseList
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
watch([activeCategory, activeSubCategory, activeThirdCategory], () => {
    // 初始化完成后才响应 watch
    if (initialized.value) {
        loadCourseList()
    }
})

watch(searchKeyword, () => {
    if (initialized.value) {
        if (searchTimer) {
            clearTimeout(searchTimer)
        }
        searchTimer = setTimeout(() => {
            debouncedSearchKeyword.value = searchKeyword.value.trim()
        }, 250)
    }
})
</script>

<style scoped>
.course-page {
    --course-min-width: 1280px;
    --course-max-width: 1920px;
    --course-shell-width: var(--course-min-width);
    height: auto;
    min-height: 100%;
    min-width: 0;
    overflow: visible;
    /* background:
        radial-gradient(circle at top left, rgba(164, 193, 255, 0.14), transparent 28%),
        linear-gradient(180deg, #f8f9fa 0%, #f4f8ff 100%); */
    color: #191b23;
    font-family: 'Manrope', 'PingFang SC', sans-serif;
}

.course-page__content {
    width: 100%;
    min-width: 0;
    min-height: 100%;
    margin: 0;
    padding: 14px clamp(20px, 0vw, 40px) 40px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.course-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
}

.course-topbar__tabs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.course-topbar__divider {
    width: 1px;
    height: 24px;
    background: rgba(194, 198, 215, 0.5);
    margin: 0 4px;
}

.course-pill {
    min-width: 0;
    border: 0;
    border-radius: 999px;
    background: #f2f4f5;
    color: #5a606f;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.course-pill:hover {
    background: #e6e7f3;
    color: #005bc2;
}

.course-pill.is-active {
    background: #096ef3;
    color: #ffffff;
    box-shadow: 0 10px 24px rgba(9, 110, 243, 0.18);
}

.course-create-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 0;
    border-radius: 12px;
    background: #0056c4;
    color: #ffffff;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
    box-shadow: 0 14px 28px rgba(0, 86, 196, 0.22);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.course-create-btn:hover {
    transform: translateY(-1px);
    background: #004cad;
    box-shadow: 0 18px 30px rgba(0, 86, 196, 0.26);
}

.course-create-btn__icon {
    font-size: 18px;
    line-height: 1;
}

.course-tools {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 18px;
    padding: 0;
}

.course-search {
    width: 420px;
    max-width: 100%;
}

.course-search__icon {
    width: 18px;
    height: 18px;
    color: #7a8090;
}

.course-status-filter {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    padding: 0 16px;
    border: 1px solid rgba(212, 221, 236, 0.92);
    border-radius: 16px;
    background: rgba(248, 250, 253, 0.96);
    box-shadow: 0 4px 12px rgba(80, 103, 136, 0.05);
}

.course-status-filter__label {
    color: #5c6880;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
}

.course-status-filter__select {
    width: 90px;
}

.course-filter-strip {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 14px;
    border-radius: 18px;
    background: #f2f4f5;
    padding: 8px 12px;
}

.course-filter-strip--secondary {
    margin-top: -6px;
}

.course-filter-strip__label {
    padding: 0 8px 0 4px;
    color: #8b90a0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.course-filter-strip__item {
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #5a606f;
    padding: 8px 18px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.course-filter-strip__item:hover {
    background: rgba(255, 255, 255, 0.72);
    color: #0056c4;
}

.course-filter-strip__item.is-active {
    background: #ffffff;
    color: #0056c4;
    box-shadow: 0 4px 12px rgba(25, 27, 35, 0.06);
}

.course-board {
    flex: 1;
    min-height: 0;
    padding-top: 8px;
}

.course-board__scroll {
    height: auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
    padding: 0 0 40px;
}

.course-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    justify-content: stretch;
    align-content: start;
    gap: clamp(18px, 1.35vw, 24px);
}

.course-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(224, 226, 237, 0.95);
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 9px 24px rgba(46, 51, 53, 0.06);
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.course-card:hover {
    transform: translateY(-3px);
    border-color: rgba(176, 198, 255, 0.8);
    box-shadow: 0 18px 32px rgba(46, 51, 53, 0.1);
}

.course-card.cursor-not-allowed:hover {
    transform: none;
    border-color: rgba(224, 226, 237, 0.95);
    box-shadow: 0 9px 24px rgba(46, 51, 53, 0.06);
}

.course-cover {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    background: linear-gradient(180deg, #dce7f7 0%, #edf2fb 100%);
}

.course-card__image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.45s ease;
}

.course-card:hover .course-card__image {
    transform: scale(1.06);
}

.course-card.cursor-not-allowed:hover .course-card__image {
    transform: none;
}

.course-card__actions {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
    display: flex;
    gap: 6px;
}

.course-card__action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 0;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 8px 16px rgba(25, 27, 35, 0.12);
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.course-card__action-btn:hover {
    transform: translateY(-1px);
    background: #ffffff;
}

.course-card__action-btn--danger:hover {
    background: #fff1f2;
}

.course-card__action-btn--accent:hover {
    background: #eef4ff;
}

.course-card__status {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 54px;
    height: 22px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    backdrop-filter: blur(10px);
}

.course-card__status--opened {
    background: rgba(0, 86, 196, 0.9);
    color: #ffffff;
}

.course-card__status--trial {
    background: rgba(68, 93, 149, 0.9);
    color: #ffffff;
}

.course-card__status--expired {
    background: rgba(186, 26, 26, 0.88);
    color: #ffffff;
}

.course-card__status--default {
    background: rgba(114, 119, 134, 0.85);
    color: #ffffff;
}

.course-card__tag {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 10;
    border-top-left-radius: 10px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
}

.course-card__tag--mine {
    background: #0056c4;
    color: #ffffff;
}

.course-card__tag--shared {
    background: #52c41a;
    color: #ffffff;
}

.course-card__cover-empty {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.course-card__body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    padding: 15px 14px 13px;
    background: #ffffff;
}

.course-card__title {
    color: #191b23;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.25;
    text-align: center;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color 0.22s ease;
}

.course-card:hover .course-card__title {
    color: #0056c4;
}

.course-card--skeleton {
    padding: 0;
}

.course-card--skeleton :deep(.el-skeleton) {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.course-card__cover-skeleton {
    display: block;
    width: 100%;
    height: 100% !important;
    border-radius: 0;
}

.course-card__title-skeleton {
    display: block;
    width: 72%;
    height: 16px !important;
    margin: 0 auto;
}

.course-empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    color: #8b90a0;
    font-size: 14px;
}

.course-cover-skeleton {
    background: linear-gradient(110deg, #e8edf3 8%, #f7f9fc 18%, #e8edf3 33%);
    background-size: 200% 100%;
    animation: courseCoverShimmer 1.2s linear infinite;
}

@keyframes courseCoverShimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

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
    color: #ffffff;
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

:deep(.course-search__input > input) {
    height: 48px !important;
    border: 0 !important;
    border-radius: 14px !important;
    background: rgba(248, 250, 253, 0.96) !important;
    padding: 0 40px 0 42px !important;
    color: #191b23 !important;
    font-size: 14px !important;
    box-shadow:
        0 4px 12px rgba(80, 103, 136, 0.05),
        inset 0 0 0 1px rgba(212, 221, 236, 0.95) !important;
}

:deep(.course-search__input > input::placeholder) {
    color: #7d8799 !important;
}

:deep(.course-search__input > input:focus) {
    border: 0 !important;
    background: #ffffff !important;
    box-shadow:
        0 0 0 2px rgba(0, 86, 196, 0.12),
        0 10px 24px rgba(79, 117, 255, 0.1),
        inset 0 0 0 1px rgba(0, 86, 196, 0.42) !important;
}

:deep(.course-search__input > .absolute:first-child) {
    left: 14px !important;
    color: #6f7b90 !important;
}

:deep(.course-search__input > button) {
    right: 14px !important;
}

:deep(.course-status-filter__select > div) {
    min-height: auto !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    padding: 0 !important;
    box-shadow: none !important;
}

:deep(.course-status-filter__select > div > span:first-child) {
    color: #0056c4 !important;
    font-size: 14px !important;
    font-weight: 700 !important;
}

:deep(.course-status-filter__select > div > svg) {
    color: #7a8090 !important;
}

:deep(.course-status-filter__select > div.ring-2) {
    box-shadow: none !important;
}

:global(.course-status-filter__dropdown) {
    min-width: 110px !important;
    max-height: none !important;
    overflow: visible !important;
    border: 1px solid rgba(194, 198, 215, 0.7) !important;
    border-radius: 12px !important;
    box-shadow: 0 18px 36px rgba(25, 27, 35, 0.12) !important;
    padding: 6px 0 !important;
}

:global(.course-status-filter__dropdown > div.py-1) {
    max-height: none !important;
    overflow: visible !important;
}

:global(.course-status-filter__dropdown > div.py-1 > div) {
    margin: 0 8px 4px !important;
    border-radius: 8px !important;
    padding: 10px 14px !important;
    color: #5a606f !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    transition: background-color 0.2s ease, color 0.2s ease !important;
}

:global(.course-status-filter__dropdown > div.py-1 > div:not(.text-gray-700)) {
    background: #eef4ff !important;
    color: #0056c4 !important;
    font-weight: 700 !important;
}

:global(.course-status-filter__dropdown > div.py-1 > div.text-gray-700:hover) {
    background: #f5f8ff !important;
    color: #0056c4 !important;
}

.course-page::-webkit-scrollbar,
.course-board__scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.course-page::-webkit-scrollbar-track,
.course-board__scroll::-webkit-scrollbar-track {
    background: transparent;
}

.course-page::-webkit-scrollbar-thumb,
.course-board__scroll::-webkit-scrollbar-thumb {
    background-color: rgba(174, 179, 181, 0.3);
    border-radius: 999px;
}

@media (max-width: 1780px) {
    .course-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
    }
}

@media (max-width: 1580px) {
    .course-search {
        width: 360px;
    }

    .course-topbar {
        margin-bottom: 20px;
    }
}

@media (max-width: 1320px) {
    .course-topbar {
        flex-wrap: wrap;
    }

    .course-tools {
        gap: 14px;
    }

    .course-create-btn {
        margin-left: auto;
    }

    .course-status-filter__select {
        width: 156px;
    }
}
</style>
