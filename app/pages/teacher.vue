<template>
  <div class="flex-1 overflow-hidden py-4 w-full">
    <!-- 三栏水平布局容器，左边距115px与头部对齐 -->
    <div class="main-content flex h-full">
      <!-- 左侧边栏 -->
      <aside class="left-sidebar py-6 px-4 flex-shrink-0">
        <nav class="space-y-2">
          <a 
            v-for="item in menuItems" 
            :key="item.name"
            :class="[
              'menu-item block px-4 py-2.5 rounded-full text-[14px] cursor-pointer',
              activeMenu === item.activeMenu 
                ? 'active bg-[#FFA54D] text-white shadow-[0_2px_8px_rgba(255,165,77,0.4)]' 
                : 'text-[#666666] hover:bg-white/50'
            ]"
            @click="handleMenuClick(item)"
          >
            {{ item.label }}
          </a>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="main-area p-4 lg:p-6 overflow-visible">
        <!-- 首页内容 -->
        <div v-if="activeMenu === 'home'">
          <!-- 顶部三个授课卡片 -->
          <div class="top-cards flex gap-[20px] xl:gap-[45px] mb-12 xl:mb-36 justify-center flex-wrap xl:flex-nowrap">
            <!-- 授课卡片1 -->
            <div class="flex flex-col items-center cursor-pointer group border-2">
              <div class="w-[180px] h-[200px] xl:w-[262px] xl:h-[296px] rounded-[20px] flex items-center justify-center transition-colors">
                <img src="~/assets/images/one.png" alt="授课" class="w-[140px] h-[140px] xl:w-[210px] xl:h-[210px] object-contain" />
              </div>
              <span class="mt-3 text-gray-600 text-sm pb-6">授课</span>
            </div>

            <!-- 授课卡片2 -->
            <div class="flex flex-col items-center cursor-pointer group border-2">
              <div class="w-[180px] h-[200px] xl:w-[262px] xl:h-[296px] rounded-[20px] flex items-center justify-center transition-colors">
                <img src="~/assets/images/two.png" alt="授课" class="w-[140px] h-[140px] xl:w-[210px] xl:h-[210px] object-contain" />
              </div>
              <span class="mt-3 text-gray-600 text-sm pb-6">授课</span>
            </div>

            <!-- 授课卡片3 -->
            <div class="flex flex-col items-center cursor-pointer group border-2">
              <div class="w-[180px] h-[200px] xl:w-[262px] xl:h-[296px] rounded-[20px] flex items-center justify-center transition-colors">
                <img src="~/assets/images/three.png" alt="授课" class="w-[140px] h-[140px] xl:w-[210px] xl:h-[210px] object-contain" />
              </div>
              <span class="mt-3 text-gray-600 text-sm pb-6">授课</span>
            </div>
          </div>

          <!-- 下方内容区 -->
          <div class="flex gap-4">
            <!-- 授课记录区域 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 md:gap-4 mb-4 flex-wrap">
                <span class="text-gray-600 text-xs md:text-sm">授课记录</span>
                <select class="px-2 md:px-3 py-1 md:py-1.5 bg-white border border-gray-200 rounded text-xs md:text-sm text-gray-600 outline-none">
                  <option>八年级一班</option>
                  <option>八年级二班</option>
                  <option>七年级一班</option>
                </select>
                <span class="text-gray-600 text-xs md:text-sm ml-4 md:ml-8">班级码登录</span>
              </div>
              
              <div class="flex gap-3 md:gap-4">
                <!-- 左侧大卡片 -->
                <div class="w-[160px] md:w-[140px] flex-shrink-0 mr-[90px]">
                  <div class="w-full h-[210px] md:h-[180px] bg-[#F5A67D]  mb-2 md:mb-3"></div>
                  <select class="w-full px-1 md:px-2 py-1 md:py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none">
                    <option>nous ai set</option>
                    <option>课程包 A</option>
                    <option>课程包 B</option>
                  </select>
                </div>
                
                <!-- 右侧班级码登录区域 - 4个卡片 -->
                <div class="flex-1 min-w-0">
                  <div class="flex gap-11">
                    <div 
                      v-for="i in 4" 
                      :key="i"
                      class="flex flex-col items-center"
                    >
                      <div class="w-[120px] h-[150px] aspect-[4/3] bg-[#A8B8C8] border-2 border-dashed border-[#8A9DB0] mb-8"></div>
                      <button class="text-xs text-gray-500 hover:text-[#FFA54D] transition-colors">
                        开始上课
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <!-- 右侧边栏 -->
      <aside class="right-sidebar p-4 flex-shrink-0 overflow-auto">
        <!-- 玛塔工具中心 -->
        <div class="h-[250px] mb-[40px] border-2 border-dashed border-[#B8D4E8] rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-600 text-sm font-medium">玛塔工具中心</span>
            <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer" />
          </div>
          <div class="flex gap-3  justify-around  mt-[60px]" >
            <div v-for="i in 3" :key="i" class="w-[87px] h-[87px] rounded-lg overflow-hidden cursor-pointer">
              <img src="~/assets/images/four.png" alt="工具" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- AI实践中心 -->
        <div class= " h-[250px] mb-4 border-2 border-dashed border-[#B8D4E8] rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-600 text-sm font-medium">AI实践中心</span>
            <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer " />
          </div>
          <div class="flex gap-3 justify-around  mt-[60px]">
            <div v-for="i in 3" :key="i" class="w-[90px] h-[90px] rounded-lg overflow-hidden">
              <img src="~/assets/images/four.png" alt="实践中心" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- 信息栏 -->
        <div class="">
          <div class="text-gray-600 text-sm font-medium mb-4">信息栏</div>
          <div class="grid grid-cols-2 gap-4">
            <div class=" h-[130px] border border-[#E0E0E0] rounded-lg p-4">
              <div class="text-gray-400 text-xs mb-2">班级数</div>
              <div class="text-3xl font-500 text-[#808080]">8</div>
            </div>
            <div class=" h-[130px] border border-[#E0E0E0] rounded-lg p-4">
              <div class="text-gray-400 text-xs mb-2">提交作品数</div>
              <div class="text-3xl font-500 text-[#808080]">1208</div>
            </div>
            <div class=" h-[130px] border border-[#E0E0E0] rounded-lg p-4">
              <div class="text-gray-400 text-xs mb-2">授课课时</div>
              <div class="text-3xl font-500 text-[#808080]">50</div>
            </div>
            <div class=" h-[130px] border border-[#E0E0E0] rounded-lg p-4">
              <div class="text-gray-400 text-xs mb-2">学生人数</div>
              <div class="text-3xl font-500 text-[#808080]">80</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTeacher } from '~/composables/api/useTeacher'

definePageMeta({
  layout: 'teacher'
})

const route = useRoute()
const { getTeacherMenu } = useTeacher()
const { showLoading, hideLoading } = useLoading()

const activeMenu = ref('')
const menuItems = ref<any[]>([])

// 将 component 路径转换为路由路径
const componentToRoute = (componentPath: string) => {
  if (!componentPath) return ''
  // 在 Nuxt 3 中，index.vue 文件对应的路由不需要 /index 后缀
  // 例如: system/class/index -> /system/class
  // 例如: system/user -> /system/user
  let routePath = componentPath
  // 移除末尾的 /index
  if (routePath.endsWith('/index')) {
    routePath = routePath.replace(/\/index$/, '')
  }
  return `/${routePath}`
}

// 获取菜单数据
const fetchMenu = async () => {
  showLoading()
  try {
    const data = await getTeacherMenu()
    console.log('📥 菜单数据:', data)
    
    // 提取 title、activeMenu 和 component
    if (Array.isArray(data)) {
      const extractedMenus = data.map((item: any) => {
        const child = item.children?.[0]
        if (child) {
          return {
            name: child.path || child.name,
            label: child.meta?.title || '',
            component: child.component || '',
            activeMenu: child.path || ''
          }
        }
        return null
      }).filter(Boolean)
      
      // 在开头添加默认首页
      menuItems.value = [
        { name: 'home', label: '首页', component: '', activeMenu: 'home' },
        ...extractedMenus
      ]
      
      // 设置首页为默认激活
      activeMenu.value = 'home'
    } else {
      menuItems.value = [
        { name: 'home', label: '首页', component: '', activeMenu: 'home' }
      ]
      activeMenu.value = 'home'
    }
  } catch (error) {
    console.error('获取菜单失败:', error)
    // 使用默认菜单
    menuItems.value = [
      { name: 'home', label: '首页', component: '', activeMenu: 'home' },
      { name: 'class', label: '班级管理', component: 'system/class/index', activeMenu: 'class' },
      { name: 'course', label: '课程中心', component: '', activeMenu: 'course' },
      { name: 'tools', label: '玛塔工具中心', component: '', activeMenu: 'tools' },
      { name: 'ai', label: 'AI实践中心', component: '', activeMenu: 'ai' },
      { name: 'study', label: '学情中心', component: '', activeMenu: 'study' },
      { name: 'growth', label: '教师成长中心', component: '', activeMenu: 'growth' },
      { name: 'competition', label: '赛事中心', component: '', activeMenu: 'competition' },
    ]
    activeMenu.value = 'home'
  } finally {
    // 延迟一点关闭，让动画更丝滑
    setTimeout(() => {
      hideLoading()
    }, 300)
  }
}

// 菜单点击处理
const handleMenuClick = (menu: any) => {
  if (menu.activeMenu === 'home') {
    // 首页，跳转到 teacher 页面
    navigateTo('/teacher')
    activeMenu.value = 'home'
  } else if (menu.component) {
    // 有 component 路径，跳转到对应页面
    const routePath = componentToRoute(menu.component)
    console.log('🔗 跳转路由:', routePath, 'component:', menu.component)
    navigateTo(routePath)
    activeMenu.value = menu.activeMenu
  } else {
    // 没有 component，只更新激活状态
    activeMenu.value = menu.activeMenu
  }
}

// 根据当前路由设置激活菜单
const setActiveMenuFromRoute = () => {
  const currentPath = route.path
  console.log('📍 当前路由:', currentPath)
  if (currentPath === '/teacher') {
    activeMenu.value = 'home'
  } else {
    // 查找匹配的菜单项
    const matchedMenu = menuItems.value.find(item => {
      if (item.component) {
        const routePath = componentToRoute(item.component)
        console.log('🔍 匹配菜单:', item.label, 'routePath:', routePath, 'currentPath:', currentPath)
        return currentPath === routePath || currentPath.startsWith(routePath)
      }
      return false
    })
    if (matchedMenu) {
      activeMenu.value = matchedMenu.activeMenu
    }
  }
}

// 监听路由变化，更新激活菜单
watch(() => route.path, () => {
  if (menuItems.value.length > 0) {
    setActiveMenuFromRoute()
  }
})

onMounted(() => {
  fetchMenu().then(() => {
    setActiveMenuFromRoute()
  })
})
</script>

<style scoped>
/* ===== 响应式三栏布局 ===== */

/* 主容器 */
.main-content {
  display: flex;
  justify-content: space-around;
}

/* 左侧边栏 */
.left-sidebar {
  width: 295px;
  flex-shrink: 0;
}

/* 主内容区 */
.main-area {
  width: 900px;
  flex-shrink: 1;
  min-width: 0;
}

/* 右侧边栏 */
.right-sidebar {
  width: 537px;
  flex-shrink: 0;
}

/* 大屏幕 1600px+ - 三栏完整显示 */
@media (min-width: 1600px) {
  .left-sidebar { width: 295px; }
  .main-area { width: 900px; }
  .right-sidebar { width: 537px; }
}

/* 笔记本 1280px - 1600px：两栏布局，右侧栏移到底部 */
@media (max-width: 1600px) and (min-width: 1024px) {
  .main-content {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 20px;
  }
  .left-sidebar { 
    width: 180px; 
    flex-shrink: 0;
  }
  .main-area { 
    flex: 1; 
    width: auto; 
    min-width: 0;
    max-width: calc(100% - 200px);
  }
  .right-sidebar { 
    width: 100%;
    margin-top: 20px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .right-sidebar > div {
    flex: 1;
    min-width: 280px;
  }
}

/* 平板 768px - 1024px */
@media (max-width: 1024px) and (min-width: 768px) {
  .main-content {
    flex-wrap: wrap;
    padding: 0 16px;
    gap: 16px;
  }
  .left-sidebar { 
    width: 140px;
    flex-shrink: 0;
  }
  .main-area { 
    flex: 1; 
    width: auto;
    min-width: 0;
  }
  .right-sidebar { 
    width: 100%;
    margin-top: 16px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .right-sidebar > div {
    flex: 1;
    min-width: 200px;
  }
}

/* 手机 < 768px：单栏布局 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 0 12px;
  }
  .left-sidebar {
    width: 100%;
    padding: 12px;
  }
  .left-sidebar nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .main-area {
    width: 100%;
    flex: none;
  }
  .right-sidebar {
    width: 100%;
    margin-top: 16px;
  }
}

/* 菜单项切换动画 */
.menu-item {
  transition: all 0.3s ease;
}

.menu-item.active {
  animation: menuPop 0.3s ease-out;
}

@keyframes menuPop {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  60% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 自定义滚动条 */
main::-webkit-scrollbar,
aside::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track,
aside::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb,
aside::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover,
aside::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
