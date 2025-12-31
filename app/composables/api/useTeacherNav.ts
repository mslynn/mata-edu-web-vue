import { computed, onMounted } from 'vue'
import { useTeacher } from './useTeacher'

// 本地默认图标（打包后为绝对可访问路径）
const homeIcon = new URL('../../assets/images/home.png', import.meta.url).href
const classIcon = new URL('../../assets/images/class.png', import.meta.url).href
const courseIcon = new URL('../../assets/images/course.png', import.meta.url).href
const toolsIcon = new URL('../../assets/images/tool.png', import.meta.url).href
const aiIcon = new URL('../../assets/images/ai.png', import.meta.url).href
const teacherIcon = new URL('../../assets/images/teacher.png', import.meta.url).href
const studyIcon = new URL('../../assets/images/study.png', import.meta.url).href
const eventIcon = new URL('../../assets/images/event.png', import.meta.url).href

// 本地选中态图标（全部放在 assets/images 下，确保存在；若缺失将回退到普通态）
const selectedHomeIcon = new URL('../../assets/images/selected-home.png', import.meta.url).href
const selectedClassIcon = new URL('../../assets/images/selected-class.png', import.meta.url).href
const selectedCourseIcon = new URL('../../assets/images/selected-course.png', import.meta.url).href
const selectedToolIcon = new URL('../../assets/images/selected-tool.png', import.meta.url).href
const selectedAiIcon = new URL('../../assets/images/selected-ai.png', import.meta.url).href
const selectedStudyIcon = new URL('../../assets/images/selected-study.png', import.meta.url).href
const selectedTeacherIcon = new URL('../../assets/images/selected-teacher.png', import.meta.url).href
const selectedEventIcon = new URL('../../assets/images/selected-event.png', import.meta.url).href

// 本地选中态图标（无单独选中图时回退到普通态）
const localSelectedIcons: Record<string, string> = {
  '/teacher': selectedHomeIcon || homeIcon,
  '/system/class': selectedClassIcon || classIcon,
  '/course': selectedCourseIcon || courseIcon,
  '/tools': selectedToolIcon || toolsIcon,
  '/tool': selectedToolIcon || toolsIcon,
  '/ai': selectedAiIcon || aiIcon,
  '/study': selectedStudyIcon || studyIcon,
  '/growth': selectedTeacherIcon || teacherIcon,
  '/event': selectedEventIcon || eventIcon,

  home: selectedHomeIcon || homeIcon,
  class: selectedClassIcon || classIcon,
  course: selectedCourseIcon || courseIcon,
  tools: selectedToolIcon || toolsIcon,
  tool: selectedToolIcon || toolsIcon,
  ai: selectedAiIcon || aiIcon,
  study: selectedStudyIcon || studyIcon,
  growth: selectedTeacherIcon || teacherIcon,
  event: selectedEventIcon || eventIcon,
}

// 本地常用图标映射（按 path 或 activeMenu 兜底）
const localIcons: Record<string, string> = {
  '/teacher': homeIcon,
  '/system/class': classIcon,
  '/course': courseIcon,
  '/tools': toolsIcon,
  '/tool': toolsIcon,
  '/ai': aiIcon,
  '/study': studyIcon,
  '/growth': teacherIcon,
  '/event': eventIcon,

  home: homeIcon,
  class: classIcon,
  course: courseIcon,
  tools: toolsIcon,
  tool: toolsIcon,
  ai: aiIcon,
  study: studyIcon,
  growth: teacherIcon,
  event: eventIcon,
}

interface TeacherMenuItem {
  label: string
  path: string
  component?: string
  activeMenu?: string
  icon?: string
  iconSelected?: string
}

const STORAGE_KEY = 'teacher-nav-menus'

// 从 localStorage 读取缓存
const getStoredMenus = (): TeacherMenuItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    // ignore
  }
  return []
}

// 保存到 localStorage
const setStoredMenus = (menus: TeacherMenuItem[]) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus))
  } catch (e) {
    // ignore
  }
}

/**
 * 教师侧边菜单：登录后只请求一次，缓存到全局 state + localStorage
 */
export const useTeacherNav = () => {
  const { getTeacherMenu } = useTeacher()

  // 使用 useState 保持跨页面状态，初始值从 localStorage 读取
  const menuState = useState<TeacherMenuItem[]>('teacher-nav', () => [])
  const loadingState = useState<boolean>('teacher-nav-loading', () => false)
  const initializedState = useState<boolean>('teacher-nav-initialized', () => false)

  // 客户端初始化时立即从 localStorage 读取，避免闪烁
  if (import.meta.client && !initializedState.value) {
    const stored = getStoredMenus()
    if (stored.length) {
      menuState.value = stored
    }
    initializedState.value = true
  }

  const menuItems = computed(() => menuState.value)
  const loading = computed(() => loadingState.value)

  const normalizeIcon = (icon?: string, path?: string, activeMenu?: string, label?: string) => {
    // 如果接口返回了绝对或以 / 开头的地址，优先用
    if (icon) {
      if (icon.startsWith('http://') || icon.startsWith('https://')) return icon
      if (icon.startsWith('/')) return icon
    }
    // 根据 label 关键字兜底
    const key = label || ''
    const hit = (kw: string) => key.includes(kw)
    if (hit('学情') || hit('学习') || hit('学情中心')) return studyIcon
    if (hit('课程')) return courseIcon
    if (hit('工具')) return toolsIcon
    if (hit('AI')) return aiIcon
    if (hit('成长') || hit('教师')) return teacherIcon
    if (hit('赛事') || hit('比赛')) return eventIcon
    if (hit('账号') || hit('班级')) return classIcon
    // 本地映射
    if (path && localIcons[path]) return localIcons[path]
    if (activeMenu && localIcons[activeMenu]) return localIcons[activeMenu]
    return ''
  }

  const normalizeSelectedIcon = (
    icon?: string,
    path?: string,
    activeMenu?: string,
    label?: string,
    fallback?: string
  ) => {
    // 接口选中态优先（绝对或 / 开头）
    if (icon) {
      if (icon.startsWith('http://') || icon.startsWith('https://')) return icon
      if (icon.startsWith('/')) return icon
    }
    // 本地选中态映射，若不存在则回退普通态
    if (path && localSelectedIcons[path]) return localSelectedIcons[path]
    if (activeMenu && localSelectedIcons[activeMenu]) return localSelectedIcons[activeMenu]
    // 关键词兜底
    const key = label || ''
    const hit = (kw: string) => key.includes(kw)
    if (hit('学情') || hit('学习') || hit('学情中心')) return localSelectedIcons['/study'] || fallback || ''
    if (hit('课程')) return localSelectedIcons['/course'] || fallback || ''
    if (hit('工具')) return localSelectedIcons['/tools'] || fallback || ''
    if (hit('AI')) return localSelectedIcons['/ai'] || fallback || ''
    if (hit('成长') || hit('教师')) return localSelectedIcons['/growth'] || fallback || ''
    if (hit('赛事') || hit('比赛')) return localSelectedIcons['/event'] || fallback || ''
    if (hit('账号') || hit('班级')) return localSelectedIcons['/system/class'] || fallback || ''
    return fallback || ''
  }

  // 将 component 路径转换为路由路径
  const componentToRoute = (componentPath: string) => {
    if (!componentPath) return ''
    let routePath = componentPath
    // 移除末尾的 /index
    if (routePath.endsWith('/index')) {
      routePath = routePath.replace(/\/index$/, '')
    }
    return routePath.startsWith('/') ? routePath : `/${routePath}`
  }

  const mapMenus = (data: any[]): TeacherMenuItem[] => {
    if (!Array.isArray(data)) return []
    const mapped = data
      .map((item: any) => {
        const child = item.children?.[0]
        if (!child) return null
        // 优先使用 component 生成路由路径，否则用 path
        const path = child.component 
          ? componentToRoute(child.component)
          : (child.path?.startsWith('/') ? child.path : `/${child.path || ''}`)
        const rawIcon = child.meta?.icon || child.meta?.iconUrl || child.icon
        const rawIconSelected = child.meta?.iconSelected || child.meta?.activeIcon
        const icon = normalizeIcon(rawIcon, path, child.path || child.name, child.meta?.title || child.name)
        const iconSelected = normalizeSelectedIcon(
          rawIconSelected,
          path,
          child.path || child.name,
          child.meta?.title || child.name,
          icon
        )
        return {
          label: child.meta?.title || child.name || '',
          path,
          component: child.component || '',
          activeMenu: child.path || '',
          icon,
          iconSelected,
        }
      })
      .filter(Boolean) as TeacherMenuItem[]

    // 默认首页
    return [
      { label: '首页', path: '/teacher', component: '', activeMenu: 'home', icon: homeIcon, iconSelected: localSelectedIcons['/teacher'] },
      ...mapped,
    ]
  }

  const loadMenus = async (forceRefresh = false) => {
    // 已有数据且不强制刷新则不再请求
    if (menuState.value.length && !forceRefresh) return
    loadingState.value = true
    try {
      const data = await getTeacherMenu()
      const menus = mapMenus(data)
      menuState.value = menus
      setStoredMenus(menus) // 持久化到 localStorage
    } catch (error) {
      // 回退默认菜单
      const defaultMenus = [
        { label: '首页', path: '/teacher', component: '', activeMenu: 'home', icon: homeIcon, iconSelected: localSelectedIcons['/teacher'] },
        { label: '班级管理', path: '/system/class', component: '', activeMenu: 'class', icon: classIcon, iconSelected: localSelectedIcons['/system/class'] },
      ]
      menuState.value = defaultMenus
      setStoredMenus(defaultMenus)
    } finally {
      loadingState.value = false
    }
  }

  // 清除缓存（登出时调用）
  const clearMenus = () => {
    menuState.value = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 供页面在 onMounted 手动触发
  const ensureMenuLoaded = () => {
    onMounted(() => {
      loadMenus()
    })
  }

  return {
    menuItems,
    loading,
    loadMenus,
    ensureMenuLoaded,
    clearMenus, // 登出时清除缓存
  }
}
