import { computed, onMounted } from 'vue'
import { useTeacher } from './useTeacher'

// 本地默认图标（打包后为绝对可访问路径）
const homeIcon = new URL('../../assets/newimages/home.svg', import.meta.url).href
const classIcon = new URL('../../assets/newimages/class.svg', import.meta.url).href
const courseIcon = new URL('../../assets/newimages/cursor.svg', import.meta.url).href
const toolsIcon = new URL('../../assets/newimages/tool.svg', import.meta.url).href
const aiIcon = new URL('../../assets/newimages/ai.svg', import.meta.url).href
const teacherIcon = new URL('../../assets/newimages/student.svg', import.meta.url).href
const studyIcon = new URL('../../assets/newimages/study.svg', import.meta.url).href
const eventIcon = new URL('../../assets/newimages/saishi.svg', import.meta.url).href

// 选中态不再切换图标，统一使用同一套新图标
const selectedHomeIcon = homeIcon
const selectedClassIcon = classIcon
const selectedCourseIcon = courseIcon
const selectedToolIcon = toolsIcon
const selectedAiIcon = aiIcon
const selectedStudyIcon = studyIcon
const selectedTeacherIcon = teacherIcon
const selectedEventIcon = eventIcon

// 本地选中态图标（无单独选中图时回退到普通态）
const localSelectedIcons: Record<string, string> = {
  '/teacher': selectedHomeIcon || homeIcon,
  '/system/class': selectedClassIcon || classIcon,
  '/system/course': selectedCourseIcon || courseIcon,
  '/system/tool': selectedToolIcon || toolsIcon,
  '/system/ai': selectedAiIcon || aiIcon,
  '/system/study': selectedStudyIcon || studyIcon,
  '/system/growth': selectedTeacherIcon || teacherIcon,
  '/system/event': selectedEventIcon || eventIcon,
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
  '/system/course': courseIcon,
  '/system/tool': toolsIcon,
  '/system/ai': aiIcon,
  '/system/study': studyIcon,
  '/system/growth': teacherIcon,
  '/system/event': eventIcon,
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
  externalUrl?: string // 外部链接地址（如赛事中心的 iframe URL）
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

  const menuItems = computed(() => menuState.value)
  const loading = computed(() => loadingState.value)

  const normalizeIcon = (icon?: string, path?: string, activeMenu?: string, label?: string) => {
    // 优先使用本地新图标
    if (path && localIcons[path]) return localIcons[path]
    if (activeMenu && localIcons[activeMenu]) return localIcons[activeMenu]

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
    // 选中态统一沿用普通图标
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

  const attachLocalIcons = (item: TeacherMenuItem): TeacherMenuItem => {
    const icon = normalizeIcon(item.icon, item.path, item.activeMenu, item.label)
    const iconSelected = normalizeSelectedIcon(
      item.iconSelected,
      item.path,
      item.activeMenu,
      item.label,
      icon
    )

    return {
      ...item,
      icon,
      iconSelected,
    }
  }

  // 客户端初始化时立即从 localStorage 读取，避免闪烁
  if (import.meta.client && !initializedState.value) {
    const stored = getStoredMenus()
    if (stored.length) {
      menuState.value = stored.map(attachLocalIcons)
      setStoredMenus(menuState.value)
      initializedState.value = true
    }
    // 注意：如果没有缓存，不设置 initializedState，让后续可以继续尝试
  }

  // 将 component 路径转换为路由路径
  const componentToRoute = (componentPath: string) => {
    if (!componentPath) return ''
    let routePath = componentPath
    // 移除末尾的 /index
    if (routePath.endsWith('/index')) {
      routePath = routePath.replace(/\/index$/, '')
    }
    // 确保以 / 开头
    if (!routePath.startsWith('/')) {
      routePath = `/${routePath}`
    }
    return routePath
  }

  // 根据菜单名称获取对应的路由路径
  const getRouteByLabel = (label: string, defaultPath: string) => {
    const routeMap: Record<string, string> = {
      '班级管理': '/system/class',
      '课程中心': '/system/course',
      '玛塔工具中心': '/system/tool',
      'AI实践中心': '/system/ai',
      '学情中心': '/system/study',
      '教师成长中心': '/system/growth',
      '赛事中心': '/system/event',
    }
    return routeMap[label] || defaultPath
  }

  const mapMenus = (data: any[]): TeacherMenuItem[] => {
    if (!Array.isArray(data)) return []
    const mapped = data
      .map((item: any) => {
        const child = item.children?.[0]
        if (!child) return null
        const label = child.meta?.title || child.name || ''
        // 优先使用 component 生成路由路径，否则用 path
        let path = child.component
          ? componentToRoute(child.component)
          : (child.path?.startsWith('/') ? child.path : `/${child.path || ''}`)
        // 根据菜单名称修正路由路径
        path = getRouteByLabel(label, path)
        const rawIcon = child.meta?.icon || child.meta?.iconUrl || child.icon
        const rawIconSelected = child.meta?.iconSelected || child.meta?.activeIcon
        const icon = normalizeIcon(rawIcon, path, child.path || child.name, label)
        const iconSelected = normalizeSelectedIcon(
          rawIconSelected,
          path,
          child.path || child.name,
          label,
          icon
        )
        return {
          label,
          path,
          component: child.component || '',
          activeMenu: child.path || '',
          icon,
          iconSelected,
          externalUrl: child.meta?.link || child.meta?.externalUrl || '', // 保存外部链接地址
        }
      })
      .filter(Boolean)
      .map((item) => attachLocalIcons(item as TeacherMenuItem)) as TeacherMenuItem[]

    // 默认首页
    return [
      attachLocalIcons({
        label: '首页',
        path: '/teacher',
        component: '',
        activeMenu: 'home',
        icon: homeIcon,
        iconSelected: localSelectedIcons['/teacher'],
      }),
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
        attachLocalIcons({
          label: '首页',
          path: '/teacher',
          component: '',
          activeMenu: 'home',
          icon: homeIcon,
          iconSelected: localSelectedIcons['/teacher'],
        }),
        attachLocalIcons({
          label: '班级管理',
          path: '/system/class',
          component: '',
          activeMenu: 'class',
          icon: classIcon,
          iconSelected: localSelectedIcons['/system/class'],
        }),
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
