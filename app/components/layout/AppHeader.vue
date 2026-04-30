<template>
  <header class="header-wrapper bg-[#FF9900] h-[70px]" :class="{ 'header-wrapper--admin': showModuleSwitch }">
    <div class="header-content">
      <div class="flex items-center">
        <img 
          :src="logoSrc" 
          alt="Logo" 
          class="header-logo h-[37px] w-auto object-contain cursor-pointer" 
          @click="handleLogoClick"
        />
      </div>
      <nav class="flex-1 flex justify-center gap-8">
        <!-- 导航菜单占位 -->
      </nav>
      <div class="header-actions flex items-center gap-4">
        <!-- 语言切换 -->
        <LanguageSwitcher v-if="!showModuleSwitch" />
        
        <img v-if="!showModuleSwitch" src="~/assets/images/infor.png" alt="infor" class="w-10 h-10 rounded-lg object-cover transition-all cursor-pointer" />
        
        <!-- 用户头像下拉菜单 -->
        <div class="relative" ref="dropdownRef">
          <button class="header-user-trigger" type="button" @click="toggleDropdown">
            <img 
              :src="resolvedAvatar" 
              alt="Avatar" 
              class="header-avatar w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 transition-all"
              @error="handleAvatarError"
            />
            <span v-if="showModuleSwitch" class="header-user-name">{{ displayUserName }}</span>
          </button>
          
          <!-- 下拉菜单 -->
          <Transition name="dropdown">
            <div 
              v-if="showDropdown"
              class="header-dropdown absolute right-0 top-12 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-800 truncate">{{ displayUserName }}</p>
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
              <!-- 个人中心 -->
              <button 
                @click="handleProfile"
                class="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-[#FF9900] transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {{ $t('user.profile') }}
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
import defaultAvatar from '~/assets/newimages/user.png'
import adminLogo from '~/assets/newimages/logo.svg'
import logoZh from '~/assets/images/logo.png'
import logoEn from '~/assets/images/logo_en.png'

const router = useRouter()
const route = useRoute()
const { logout, user } = useAuth()
const { locale } = useI18n()

// 根据语言显示不同的 Logo
const logoSrc = computed(() => {
  if (showModuleSwitch.value) {
    return adminLogo
  }
  return locale.value === 'en' ? logoEn : logoZh
})

const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const displayUserName = computed(() => {
  return (
    user.value?.nickName ||
    user.value?.userName ||
    user.value?.nickname ||
    user.value?.nick_name ||
    user.value?.user_name ||
    '用户'
  )
})

// 判断是否显示模块切换（仅市/区管理员）
const showModuleSwitch = computed(() => {
  const roleKey = user.value?.role_key
  if (roleKey === 'city_admin' || roleKey === 'district_admin') {
    return true
  }

  return ['/city', '/school'].some(path => route.path === path || route.path.startsWith(`${path}/`))
})

const resolvedAvatar = computed(() => {
  const avatar = String(
    user.value?.avatar ||
    user.value?.avatarUrl ||
    user.value?.headImg ||
    user.value?.headimg ||
    ''
  ).trim()
  return avatar || defaultAvatar
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

// 个人中心
const handleProfile = () => {
  showDropdown.value = false
  router.push('/personalcenter')
}

const handleLogout = () => {
  showDropdown.value = false
  logout()
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (!target) return
  target.src = defaultAvatar
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

.header-wrapper--admin {
  height: 94px;
  background: #ffffff !important;
  border-bottom: 1px solid #edf0f5;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
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

.header-wrapper--admin .header-content {
  height: 94px;
  padding: 0 clamp(56px, 6vw, 116px) 0 clamp(56px, 6vw, 116px);
}

.header-wrapper--admin .header-logo {
  width: 200px;
  height: 32px;
}

.header-user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1f2a37;
  cursor: pointer;
}

.header-wrapper--admin .header-avatar {
  width: 34px;
  height: 34px;
  border: 2px solid #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.header-user-name {
  font-size: 15px;
  font-weight: 500;
  color: #1f2a37;
}

.header-wrapper--admin .header-dropdown {
  top: 46px;
  width: 188px;
  padding: 10px 0;
  border: 1px solid #edf0f5;
  border-radius: 16px;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.12);
}

.header-wrapper--admin .header-dropdown button,
.header-wrapper--admin .header-dropdown > div {
  padding-left: 18px;
  padding-right: 18px;
}

.header-wrapper--admin .header-dropdown button:hover {
  color: #005bc2;
  background: #f4f8ff;
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
