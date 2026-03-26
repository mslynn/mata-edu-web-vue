<template>
  <aside class="app-sidebar w-[180px] xl:w-[200px] 2xl:w-[220px] flex flex-col flex-shrink-0">
    <nav class="flex-1 overflow-auto py-[52px]">
      <!-- 骨架屏：菜单数据加载中 -->
      <template v-if="!menuItems.length">
        <div 
          v-for="i in 6" 
          :key="i" 
          class="w-full flex items-center h-[50px] gap-3 px-4 py-3"
        >
          <div class="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
          <div class="flex-1 h-5 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </template>
      
      <!-- 真实菜单 -->
      <button
        v-else
        v-for="item in menuItems"
        :key="item.path"
        type="button"
        :disabled="isActiveItem(item)"
        :class="[
          'w-full text-left flex items-center min-h-[50px] gap-3 px-4 py-3 transition-colors',
          isActiveItem(item)
            ? 'bg-[#FF9900] text-white font-medium cursor-default rounded-lg text-sm'
            : 'text-gray-700 hover:bg-gray-50 cursor-pointer text-sm'
        ]"
        @click="!isActiveItem(item) && handleMenuClick(item)"
        @mouseenter="prefetchMenuRoute(item)"
      >
        <div class="w-9 h-9 flex items-center justify-center">
          <img 
            v-if="item.icon || item.iconSelected" 
            :src="isActiveItem(item) ? item.iconSelected || item.icon : item.icon" 
            alt="" 
            class="w-9 h-9 object-contain" 
          />
          <span v-else>•</span>
        </div>
        <span>{{ getMenuLabel(item.label) }}</span>
      </button>
    </nav>

    <!-- 即将上线提示弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showComingSoonModal" class="coming-soon-overlay" @click="showComingSoonModal = false">
          <div class="coming-soon-modal" @click.stop>
            <div class="coming-soon-icon">🚀</div>
            <div class="coming-soon-title">{{ $t('common.comingSoon') }}</div>
            <div class="coming-soon-text">{{ $t('common.comingSoonDesc') }}</div>
            <button class="coming-soon-btn" @click="showComingSoonModal = false">
              {{ $t('common.gotIt') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTeacherNav } from '~/composables/api/useTeacherNav'

const route = useRoute()
const { locale, t } = useI18n()
const { menuItems, loadMenus } = useTeacherNav()

// 菜单标签翻译映射
const menuLabelMap: Record<string, string> = {
  '首页': 'menu.home',
  '班级管理': 'menu.classManagement',
  '课程中心': 'menu.courseCenter',
  '玛塔工具中心': 'menu.toolCenter',
  'AI实践中心': 'menu.aiCenter',
  '学情中心': 'menu.studyCenter',
  '教师成长中心': 'menu.teacherGrowth',
  '赛事中心': 'menu.eventCenter',
}

// 获取菜单标签翻译
const getMenuLabel = (label: string) => {
  const key = menuLabelMap[label]
  return key ? t(key) : label
}

const showComingSoonModal = ref(false)
const prefetchedPaths = new Set<string>()

// 立即加载菜单（不等 onMounted）
loadMenus()

// 已实现的页面路径列表
const implementedPages = [
  '/teacher',
  '/system/class',
  '/system/course',
  '/system/tool',
  '/system/ai',
  '/system/study',
  '/system/growth',
  '/system/event',
  '/system/user',
]

const go = (path: string) => {
  navigateTo(path)
}

// 检查页面是否已实现
const isPageImplemented = (path: string) => {
  return implementedPages.some(p => path === p || path.startsWith(p + '/'))
}

// 处理菜单点击
const handleMenuClick = (item: any) => {
  if (isPageImplemented(item.path)) {
    // 页面已实现，正常跳转
    go(item.path)
  } else {
    // 页面未实现，显示即将上线提示
    showComingSoonModal.value = true
  }
}

const isActiveItem = (item: any) => {
  if (!item || !item.path) return false
  
  const currentPath = route.path
  
  // 精确匹配首页（处理带/不带斜杠的情况）
  if (item.path === '/teacher') {
    return currentPath === '/teacher' || currentPath === '/teacher/'
  }
  
  // 其他页面使用 startsWith 匹配
  // 确保不会误匹配（例如 /system/class 不应该匹配 /system/classroom）
  return currentPath === item.path || currentPath.startsWith(item.path + '/')
}

const prefetchMenuRoute = async (item: TeacherMenuItem) => {
  if (!item?.path || !isPageImplemented(item.path) || prefetchedPaths.has(item.path)) {
    return
  }

  try {
    await preloadRouteComponents(item.path)
    prefetchedPaths.add(item.path)
  } catch (error) {
    console.warn('[sidebar] 预取路由失败:', item.path, error)
  }
}

onMounted(() => {
  // loadMenus 内部已经有防重复请求机制
  // 如果有缓存数据，不会重新请求，所以不会闪烁
  loadMenus()
})

// 监听语言切换，强制重新加载菜单
watch(locale, () => {
  loadMenus(true)
})
</script>

<style scoped>
.app-sidebar {
  /* box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04); */
}

/* 即将上线弹窗样式 */
.coming-soon-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.coming-soon-modal {
  background: white;
  border-radius: 16px;
  padding: 40px 48px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.coming-soon-icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.coming-soon-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.coming-soon-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 32px;
  line-height: 1.6;
}

.coming-soon-btn {
  width: 100%;
  height: 44px;
  background: #FF9900;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.coming-soon-btn:hover {
  background: #E68A00;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
