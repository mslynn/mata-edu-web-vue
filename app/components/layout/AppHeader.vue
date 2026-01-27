<template>
  <header class="header-wrapper bg-[#FF9900] h-[70px]">
    <div class="header-content">
      <div class="flex items-center">
        <img 
          :src="logoSrc" 
          alt="Logo" 
          class="h-[37px] w-auto object-contain cursor-pointer" 
          @click="handleLogoClick"
        />
      </div>
      <nav class="flex-1 flex justify-center gap-8">
        <!-- 导航菜单占位 -->
      </nav>
      <div class="flex items-center gap-4">
        <!-- 语言切换 -->
        <LanguageSwitcher />
        
        <img src="~/assets/images/infor.png" alt="infor" class="w-10 h-10 rounded-lg object-cover transition-all cursor-pointer" />
        
        <!-- 用户头像下拉菜单 -->
        <div class="relative" ref="dropdownRef">
          <img 
            :src="user?.avatar || defaultAvatar" 
            alt="Avatar" 
            class="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 transition-all"
            @click="toggleDropdown"
          />
          
          <!-- 下拉菜单 -->
          <Transition name="dropdown">
            <div 
              v-if="showDropdown"
              class="absolute right-0 top-12 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-800 truncate">{{ user?.nickname || user?.nick_name || '用户' }}</p>
                <p class="text-xs text-gray-400 truncate">{{ user?.role_name || '' }}</p>
              </div>
              <!-- 模块切换 - 仅市/区管理员显示 -->
              <button 
                v-if="showModuleSwitch"
                @click="handleModuleSwitch"
                class="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-[#FF9900] transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                {{ $t('common.moduleSwitch') }}
              </button>
              <button 
                @click="handleLogout"
                class="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {{ $t('auth.logout') }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/api/useAuth'
import { useI18n } from 'vue-i18n'
import defaultAvatar from '~/assets/images/avatar.png'
import logoZh from '~/assets/images/logo.png'
import logoEn from '~/assets/images/logo_en.png'

const router = useRouter()
const { logout, user } = useAuth()
const { locale } = useI18n()

// 根据语言显示不同的 Logo
const logoSrc = computed(() => {
  return locale.value === 'en' ? logoEn : logoZh
})

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

// 判断是否显示模块切换（仅市/区管理员）
const showModuleSwitch = computed(() => {
  const roleKey = user.value?.role_key
  return roleKey === 'city_admin' || roleKey === 'district_admin'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 点击 Logo 跳转首页
const handleLogoClick = () => {
  const roleKey = user.value?.role_key
  // 老师跳转到教师首页
  if (roleKey === 'teacher') {
    router.push('/teacher')
  }
  // 学生端先空着，后续补充
  else if (roleKey === 'student') {
    router.push('/student')
  }
}

// 模块切换 - 跳转到模块选择页面
const handleModuleSwitch = () => {
  showDropdown.value = false
  router.push('/district')
}

const handleLogout = () => {
  showDropdown.value = false
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
  padding: 16px 5% 16px 6%;
  width: 100%;
  box-sizing: border-box;
}

/* 小屏幕时减少内边距 */
@media (max-width: 1280px) {
  .header-content {
    padding-left: 24px;
    padding-right: 24px;
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
