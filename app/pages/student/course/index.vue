<template>
  <div class="course-page flex-1 flex flex-col">
    <!-- 右侧内容区 -->
    <div class="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
      <!-- 顶部分类标签 -->
      <div class="flex items-center justify-between mb-4 flex-shrink-0">
        <!-- 一级分类标签 -->
        <div class="flex items-center gap-2 flex-wrap">
          <button v-for="cat in mainCategories" :key="cat.value" :class="[
            'px-4 py-2 rounded-full text-sm transition-colors',
            activeCategory === cat.value
              ? 'bg-[#FF9900] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-[#FF9900]'
          ]" @click="activeCategory = cat.value">
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- 二级分类 + 搜索 -->
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
        
        <div class="flex items-center gap-4">
          <!-- 开通状态下拉 (仅常规课程显示) -->
          <div v-if="activeCategory !== '教师课程'" class="flex items-center gap-2">
            <span class="text-sm text-gray-600">{{ $t('common.openStatus') }}：</span>
            <div class="relative">
              <button 
                @click="showStatusDropdown = !showStatusDropdown"
                class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm min-w-[120px] justify-between"
              >
                <span>{{ activeStatusLabel }}</span>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showStatusDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div v-if="showStatusDropdown" class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <div 
                  v-for="status in statusOptions" 
                  :key="status.value"
                  @click="selectStatus(status.value)"
                  :class="[
                    'px-4 py-2 text-sm cursor-pointer hover:bg-[#FFF8F0]',
                    activeStatus === status.value ? 'text-[#FF9900] bg-[#FFF8F0]' : 'text-gray-600'
                  ]"
                >
                  {{ status.label }}
                </div>
              </div>
            </div>
          </div>

          <!-- 搜索框 -->
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
        <!-- 加载中 -->
        <div v-if="loading" class="flex items-center justify-center h-full">
          <div class="text-gray-400">加载中...</div>
        </div>
        
        <!-- 课程列表 -->
        <div v-else-if="courseList.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <NuxtLink v-for="course in courseList" :key="course.id" :to="`/student/course/${course.id}`"
            class="course-card cursor-pointer group">
            <!-- 课程封面 -->
            <div class="course-cover bg-gray-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
              <!-- 状态标签（仅常规课程显示） -->
              <span 
                v-if="activeCategory !== '教师课程' && course.status && statusConfig[course.status]" 
                class="absolute top-2 right-2 px-2 py-0.5 rounded text-xs z-10"
                :class="[statusConfig[course.status].bg, statusConfig[course.status].color]"
              >
                {{ statusConfig[course.status].label }}
              </span>
              <!-- 封面图片 -->
              <img v-if="course.cover" :src="course.cover" alt="课程封面" class="absolute inset-0 w-full h-full object-cover" />
              <!-- 无封面时显示占位 -->
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
            <!-- 课程名称 -->
            <div class="text-sm font-medium text-gray-800 mb-1">{{ course.name }}</div>
            <!-- 课时数 -->
            <div class="text-xs text-gray-400">{{ course.hours }}{{ $t('common.hours') }}</div>
          </NuxtLink>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center h-full text-gray-400">
          <p>{{ $t('course.noChapter') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { cursorAdmin } from '~/composables/api/curosr'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const { getCursorTreeMenu, getCursorList } = cursorAdmin()

// 菜单树数据接口返回结构
interface MenuNode {
  menuId: number | null
  menuName: string
  parentId: number | null
  menuLevel: number | null
  isVisible: number | null
  children?: MenuNode[]
}

// 一级分类
const mainCategories = ref<{ label: string; value: string }[]>([])
const activeCategory = ref('')

// 二级分类映射表
const subCategoryMap = ref<Record<string, { label: string; value: string; hasChildren?: boolean }[]>>({})

// 三级分类映射表
const thirdCategoryMap = ref<Record<string, { label: string; value: string }[]>>({})

const activeSubCategory = ref('all')
const activeThirdCategory = ref('')

// 搜索
const searchKeyword = ref('')

// 开通状态筛选（常规课程用）
const showStatusDropdown = ref(false)
const activeStatus = ref('')
const statusOptions = computed(() => [
  { label: t('common.all'), value: '' },
  { label: t('common.opened'), value: '1' },
  { label: t('common.notOpened'), value: '0' },
  { label: t('common.expired'), value: '2' },
  { label: t('common.trial'), value: '3' },
])
const activeStatusLabel = computed(() => {
  const found = statusOptions.value.find(s => s.value === activeStatus.value)
  return found ? found.label : t('common.all')
})
const selectStatus = (value: string) => {
  activeStatus.value = value
  showStatusDropdown.value = false
}

// 加载菜单数据
const loadMenuData = async () => {
  try {
    const data = await getCursorTreeMenu()
    if (data && Array.isArray(data)) {
      const mainList: { label: string; value: string }[] = []

      data.forEach((item: MenuNode) => {
        // 使用 menuId 或 menuName 作为 value
        const menuValue = item.menuId !== null ? String(item.menuId) : item.menuName
        mainList.push({
          label: item.menuName,
          value: menuValue,
        })

        // 解析二级分类
        const children = item.children || []
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

          // 三级分类
          if (hasGrandChildren && child.children) {
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
      })

      mainCategories.value = mainList

      // 默认选中第一个分类
      if (mainCategories.value.length > 0 && mainCategories.value[0]) {
        activeCategory.value = mainCategories.value[0].value
        const subList = subCategoryMap.value[activeCategory.value]
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

// 二级分类列表
const subCategories = computed(() => {
  return subCategoryMap.value[activeCategory.value] || [{ label: t('common.all'), value: 'all' }]
})

// 三级分类列表
const thirdCategories = computed(() => {
  return thirdCategoryMap.value[activeSubCategory.value] || []
})

// 点击二级分类
const handleSubCategoryClick = (sub: { label: string; value: string; hasChildren?: boolean }) => {
  activeSubCategory.value = sub.value
  const thirdList = thirdCategoryMap.value[sub.value]
  if (thirdList && thirdList.length > 0 && thirdList[0]) {
    activeThirdCategory.value = thirdList[0].value
  } else {
    activeThirdCategory.value = ''
  }
}

// 监听一级分类变化
watch(activeCategory, (newVal) => {
  const subList = subCategoryMap.value[newVal]
  if (subList && subList.length > 0 && subList[0]) {
    activeSubCategory.value = subList[0].value
  } else {
    activeSubCategory.value = 'all'
  }
})

// 课程列表
interface Course {
  id: number
  name: string
  hours: number
  cover?: string
  status?: string // 开通状态
}

// 状态配置
const statusConfig = computed(() => ({
  opened: { label: t('common.opened'), color: 'text-green-600', bg: 'bg-green-50' },
  not_opened: { label: t('common.notOpened'), color: 'text-gray-500', bg: 'bg-gray-100' },
  expired: { label: t('common.expired'), color: 'text-red-500', bg: 'bg-red-50' },
  trial: { label: t('common.trial'), color: 'text-blue-500', bg: 'bg-blue-50' },
} as Record<string, { label: string; color: string; bg: string }>))

const courseList = ref<Course[]>([])
const loading = ref(false)

// 加载课程列表
const loadCourseList = async () => {
  loading.value = true
  try {
    const params: any = {}

    // 教师课程使用 courseType
    if (activeCategory.value === '教师课程') {
      params.courseType = 3
    } else {
      // 普通课程使用 menuId
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

    // 搜索
    if (searchKeyword.value) {
      params.name = searchKeyword.value
    }

    // 开通状态（仅常规课程）
    if (activeCategory.value !== '教师课程' && activeStatus.value) {
      params.openStatus = activeStatus.value
    }

    const data = await getCursorList(params)
    if (data && Array.isArray(data)) {
      courseList.value = data.map((item: any) => ({
        id: item.courseId,
        name: item.courseName,
        hours: item.courseHours || item.chapterCount || 0,
        cover: item.courseCoverUrl || item.courseCover || '',
        status: item.openStatus === 1 ? 'opened' : item.openStatus === 2 ? 'expired' : item.openStatus === 3 ? 'trial' : 'not_opened',
      }))
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

const initialized = ref(false)

// 监听分类变化
watch([activeCategory, activeSubCategory, activeThirdCategory, searchKeyword, activeStatus], () => {
  if (initialized.value) {
    loadCourseList()
  }
})

onMounted(() => {
  if (process.client) {
    loadMenuData()
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
</style>
