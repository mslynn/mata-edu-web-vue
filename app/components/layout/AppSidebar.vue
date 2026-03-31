<template>
  <aside
    class="app-sidebar w-[240px] xl:w-[288px] 2xl:w-[348px] flex flex-col flex-shrink-0 bg-[#FFFFFF]"
  >
    <div class="sidebar-brand" @click="handleLogoClick">
      <img :src="sidebarLogo" alt="智慧教育平台" class="sidebar-brand-logo" />
    </div>

    <nav class="sidebar-nav flex-1 overflow-auto py-6">
      <!-- 骨架屏：菜单数据加载中 -->
      <template v-if="!menuItems.length">
        <div v-for="i in 6" :key="i" class="sidebar-menu-skeleton">
          <div class="sidebar-menu-icon bg-gray-200 rounded-lg animate-pulse"></div>
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
          'sidebar-menu-item text-left flex items-center transition-colors text-sm',
          isActiveItem(item)
            ? 'sidebar-menu-item--active text-[#303133] font-medium cursor-default'
            : 'text-gray-700 cursor-pointer',
        ]"
        @click="!isActiveItem(item) && handleMenuClick(item)"
        @mouseenter="prefetchMenuRoute(item)"
      >
        <div class="sidebar-menu-icon flex items-center justify-center flex-shrink-0">
          <img
            v-if="item.icon || item.iconSelected"
            :src="item.icon || item.iconSelected"
            alt=""
            class="sidebar-menu-icon-image object-contain"
          />
          <span v-else>•</span>
        </div>
        <span class="sidebar-menu-label">{{ getMenuLabel(item.label) }}</span>
      </button>
    </nav>

    <div class="sidebar-account">
      <div class="sidebar-account-entry" ref="dropdownRef">
        <button
          type="button"
          class="sidebar-account-trigger"
          :aria-label="displayUserName"
          :title="displayUserName"
          @click="toggleDropdown"
        >
          <span class="sidebar-account-avatar-shell">
            <img
              :src="user?.avatar || defaultAvatar"
              alt="用户头像"
              class="sidebar-account-avatar"
            />
          </span>
          <span class="sidebar-account-label">账号登录</span>
        </button>

        <Transition name="dropdown">
          <div v-if="showDropdown" class="sidebar-user-dropdown">
            <div class="sidebar-user-dropdown-head">
              <p class="sidebar-user-dropdown-name">{{ displayUserName }}</p>
              <p class="sidebar-user-dropdown-role">{{ user?.role_name || "" }}</p>
            </div>

            <button
              v-if="showModuleSwitch"
              type="button"
              class="sidebar-user-dropdown-item"
              @click="handleModuleSwitch"
            >
              {{ $t("common.moduleSwitch") }}
            </button>
            <button
              type="button"
              class="sidebar-user-dropdown-item"
              @click="handleProfile"
            >
              {{ $t("user.profile") }}
            </button>
            <button
              type="button"
              class="sidebar-user-dropdown-item sidebar-user-dropdown-item--danger"
              @click="handleLogout"
            >
              {{ $t("auth.logout") }}
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 即将上线提示弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showComingSoonModal"
          class="coming-soon-overlay"
          @click="showComingSoonModal = false"
        >
          <div class="coming-soon-modal" @click.stop>
            <div class="coming-soon-icon">🚀</div>
            <div class="coming-soon-title">{{ $t("common.comingSoon") }}</div>
            <div class="coming-soon-text">
              {{ $t("common.comingSoonDesc") }}
            </div>
            <button class="coming-soon-btn" @click="showComingSoonModal = false">
              {{ $t("common.gotIt") }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useTeacherNav } from "~/composables/api/useTeacherNav";
import { useAuth } from "~/composables/api/useAuth";
import sidebarLogo from "~/assets/newimages/logo.png";
import defaultAvatar from "~/assets/images/avatar.png";

const router = useRouter();
const route = useRoute();
const { locale, t } = useI18n();
const { menuItems, loadMenus } = useTeacherNav();
const { user, logout } = useAuth();

interface SidebarMenuItem {
  label: string;
  path: string;
  icon?: string;
  iconSelected?: string;
}

// 菜单标签翻译映射
const menuLabelMap: Record<string, string> = {
  首页: "menu.home",
  班级管理: "menu.classManagement",
  课程中心: "menu.courseCenter",
  玛塔工具中心: "menu.toolCenter",
  AI实践中心: "menu.aiCenter",
  学情中心: "menu.studyCenter",
  教师成长中心: "menu.teacherGrowth",
  赛事中心: "menu.eventCenter",
};

// 获取菜单标签翻译
const getMenuLabel = (label: string) => {
  const key = menuLabelMap[label];
  return key ? t(key) : label;
};

const showComingSoonModal = ref(false);
const prefetchedPaths = new Set<string>();
const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const displayUserName = computed(() => {
  return (
    user.value?.nickName ||
    user.value?.userName ||
    user.value?.nickname ||
    user.value?.nick_name ||
    user.value?.user_name ||
    "用户"
  );
});

const showModuleSwitch = computed(() => {
  const roleKey = user.value?.role_key;
  return roleKey === "city_admin" || roleKey === "district_admin";
});

// 立即加载菜单（不等 onMounted）
loadMenus();

// 已实现的页面路径列表
const implementedPages = [
  "/teacher",
  "/system/class",
  "/system/course",
  "/system/tool",
  "/system/ai",
  "/system/study",
  "/system/growth",
  "/system/event",
  "/system/user",
];

const go = (path: string) => {
  navigateTo(path);
};

const handleLogoClick = () => {
  const roleKey = user.value?.role_key;
  if (roleKey === "teacher") {
    router.push("/teacher");
    return;
  }

  if (roleKey === "student") {
    router.push("/student");
    return;
  }

  router.push("/teacher");
};

// 检查页面是否已实现
const isPageImplemented = (path: string) => {
  return implementedPages.some((p) => path === p || path.startsWith(p + "/"));
};

// 处理菜单点击
const handleMenuClick = (item: SidebarMenuItem) => {
  if (isPageImplemented(item.path)) {
    // 页面已实现，正常跳转
    go(item.path);
  } else {
    // 页面未实现，显示即将上线提示
    showComingSoonModal.value = true;
  }
};

const isActiveItem = (item: SidebarMenuItem) => {
  if (!item || !item.path) return false;

  const currentPath = route.path;

  // 精确匹配首页（处理带/不带斜杠的情况）
  if (item.path === "/teacher") {
    return currentPath === "/teacher" || currentPath === "/teacher/";
  }

  // 其他页面使用 startsWith 匹配
  // 确保不会误匹配（例如 /system/class 不应该匹配 /system/classroom）
  return currentPath === item.path || currentPath.startsWith(item.path + "/");
};

const prefetchMenuRoute = async (item: SidebarMenuItem) => {
  if (!item?.path || !isPageImplemented(item.path) || prefetchedPaths.has(item.path)) {
    return;
  }

  try {
    await preloadRouteComponents(item.path);
    prefetchedPaths.add(item.path);
  } catch (error) {
    console.warn("[sidebar] 预取路由失败:", item.path, error);
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleModuleSwitch = () => {
  showDropdown.value = false;
  router.push("/district");
};

const handleProfile = () => {
  showDropdown.value = false;
  router.push("/personalcenter");
};

const handleLogout = () => {
  showDropdown.value = false;
  logout();
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  // loadMenus 内部已经有防重复请求机制
  // 如果有缓存数据，不会重新请求，所以不会闪烁
  loadMenus();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// 监听语言切换，强制重新加载菜单
watch(locale, () => {
  loadMenus(true);
});
</script>

<style scoped>
.app-sidebar {
  border-radius: 0 0 28px 28px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  min-height: 126px;
  padding: 34px 32px 18px;
  cursor: pointer;
}

.sidebar-brand-logo {
  width: 200px;
  height: 32px;
  max-width: none;
  display: block;
  object-fit: contain;
}

.sidebar-nav {
  padding-left: 0;
}

.sidebar-menu-skeleton,
.sidebar-menu-item {
  margin: 0 auto;
  gap: 8px;
  padding: 12px 16px 12px 15px;
  border-radius: 30px;
  width: 270px;
  height: 60px;
}

.sidebar-menu-item {
  background: transparent;
}

.sidebar-menu-item:hover {
  background: #f8f8f8;
}

.sidebar-menu-item--active {
  background: #f1f1f1;
}

.sidebar-menu-icon {
  width: 51px;
  height: 51px;
  overflow: visible;
}

.sidebar-menu-icon-image {
  width: 51px;
  height: 51px;
  flex-shrink: 0;
  transform: none;
}

.sidebar-menu-label {
  transform: none;
  font-size: 16px;
  color: #333333;
}

.sidebar-account {
  padding: 4px 0 32px;
}

.sidebar-account-entry {
  position: relative;
  width: 270px;
  margin: 0 auto;
}

.sidebar-account-trigger {
  width: 100%;
  min-height: 60px;
  padding: 4px 16px 4px 15px;
  border: none;
  border-radius: 30px;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sidebar-account-trigger:hover {
  background: #f8f8f8;
}

.sidebar-account-trigger:focus-visible {
  outline: 2px solid #ff9900;
  outline-offset: 3px;
}

.sidebar-account-avatar-shell {
  width: 51px;
  height: 51px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.sidebar-account-avatar {
  width: 51px;
  height: 51px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.sidebar-account-label {
  font-size: 16px;
  color: #333333;
  line-height: 1.4;
}

.sidebar-user-dropdown {
  position: absolute;
  left: 0;
  bottom: calc(100% + 14px);
  width: 188px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  padding: 8px 0;
  z-index: 50;
}

.sidebar-user-dropdown-head {
  padding: 10px 16px 12px;
  border-bottom: 1px solid #f2f2f2;
}

.sidebar-user-dropdown-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.sidebar-user-dropdown-role {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.sidebar-user-dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 11px 16px;
  font-size: 14px;
  color: #4d4d4d;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.sidebar-user-dropdown-item:hover {
  background: #f8f8f8;
  color: #ff9900;
}

.sidebar-user-dropdown-item--danger:hover {
  color: #f56c6c;
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
  0%,
  100% {
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
  background: #ff9900;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.coming-soon-btn:hover {
  background: #e68a00;
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
