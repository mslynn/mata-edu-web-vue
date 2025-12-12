<template>
  <div class="min-h-screen flex flex-col font-sans">
    <!-- 默认顶部导航栏 -->
    <header class="header-wrapper  bg-[#FF9900] h-[70px]">
      <div class="header-content">
        <div class="flex items-center">
          <img src="~/assets/images/logo.png" alt="Logo" class="w-[220px] h-[37px] object-contain" />
        </div>
        <nav class="flex-1 flex justify-center gap-8">
          <!-- 导航菜单占位 -->
        </nav>
        <div class="flex items-center gap-4">
          <img src="~/assets/images/infor.png" alt="infor" class="w-10 h-10 rounded-lg  object-cover  transition-all cursor-pointer" />
          
          <!-- 用户头像下拉菜单 -->
          <div class="relative" ref="dropdownRef">
            <img 
              src="~/assets/images/avatar.png" 
              alt="Avatar" 
              class="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2  transition-all"
              @click="toggleDropdown"
            />
            
            <!-- 下拉菜单 -->
            <Transition name="dropdown">
              <div 
                v-if="showDropdown"
                class="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
              >
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ user?.nick_name || '用户' }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ user?.role_name || '' }}</p>
                </div>
                <button 
                  @click="handleLogout"
                  class="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  退出登录
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </header>

    <!-- 页面内容插槽 - 样式由各页面自己控制 -->
    <div class="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/api/useAuth'

const { logout, user } = useAuth()
const { allowNavigation } = usePreventBack()

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleLogout = () => {
  showDropdown.value = false
  allowNavigation()
  logout()
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 头部容器 - 全宽背景 */
.header-wrapper {
 
  /* box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); */
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
}

/* 头部内容 - 最大宽度1712px，左边距115px，右边距95px */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  width: 100%;
  max-width: 1712px;
  margin-left: 115px;
  margin-right: 95px;
}

/* 小屏幕时用较小边距 */
@media (max-width: 1920px) {
  .header-content {
    margin-left: auto;
    margin-right: auto;
    padding-left: 16px;
    padding-right: 16px;
  }
}

/* 大屏幕(>=1920px)时用设计稿边距 */
@media (min-width: 1920px) {
  .header-content {
    margin-left: 115px;
    margin-right: 95px;
  }
}

/* 下拉菜单动画 */
.dropdown-enter-active {
  transition: all 0.2s ease-out;
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
