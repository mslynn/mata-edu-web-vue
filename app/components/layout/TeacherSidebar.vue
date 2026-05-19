<template>
  <aside class="teacher2-sidebar">
    <div class="teacher2-brand" @click="handleSidebarLogoClick">
      <img :src="brandLogo" alt="玛塔创想 AI 智学云" class="teacher2-brand__image" />
    </div>

    <nav class="teacher2-nav" aria-label="教师导航">
      <button
        v-for="item in sidebarNavItems"
        :key="item.path"
        type="button"
        class="teacher2-nav__item"
        :class="{ 'is-active': isSidebarItemActive(item) }"
        @click="handleSidebarItemClick(item)"
      >
        <span class="teacher2-nav__icon">
          <span class="material-symbols-outlined teacher2-nav__icon-glyph">
            {{ resolveSidebarIconGlyph(item) }}
          </span>
        </span>
        <span class="teacher2-nav__label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- 语言切换（测试用） -->
    <div class="teacher2-lang-switch">
      <button
        type="button"
        class="teacher2-lang-btn"
        :class="{ 'is-active': currentLocale === 'zh' }"
        @click="switchLocale('zh')"
      >中文</button>
      <button
        type="button"
        class="teacher2-lang-btn"
        :class="{ 'is-active': currentLocale === 'en' }"
        @click="switchLocale('en')"
      >EN</button>
    </div>

    <div class="teacher2-profile-wrap">
      <div ref="profileDropdownRef" class="teacher2-profile-entry">
        <button
          type="button"
          class="teacher2-profile"
          :aria-label="teacherDisplayName"
          :title="teacherDisplayName"
          @click="toggleProfileDropdown"
        >
          <img
            :src="resolvedTeacherAvatar"
            alt="教师头像"
            class="teacher2-profile__avatar"
            @error="handleTeacherAvatarError"
          />
          <div class="teacher2-profile__meta">
            <p class="teacher2-profile__name">{{ teacherDisplayName }}</p>
            <p class="teacher2-profile__role">{{ teacherDisplayRole }}</p>
          </div>
        </button>

        <Transition name="teacher2-profile-dropdown">
          <div v-if="showProfileDropdown" class="teacher2-profile-dropdown">
            <div class="teacher2-profile-dropdown__head">
              <p class="teacher2-profile-dropdown__name">{{ teacherDisplayName }}</p>
              <p class="teacher2-profile-dropdown__role">{{ teacherDisplayRole }}</p>
            </div>

            <button
              v-if="showModuleSwitch"
              type="button"
              class="teacher2-profile-dropdown__item"
              @click="handleModuleSwitch"
            >
              {{ t('sidebar.moduleSwitch') }}
            </button>
            <button
              type="button"
              class="teacher2-profile-dropdown__item"
              @click="handleProfile"
            >
              {{ t('sidebar.personalCenter') }}
            </button>
            <button
              type="button"
              class="teacher2-profile-dropdown__item teacher2-profile-dropdown__item--danger"
              @click="handleLogout"
            >
              {{ t('sidebar.logout') }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import brandLogoImage from "~/assets/newimages/logo.svg";
import teacherAvatarImage from "~/assets/newimages/user.png";
import { ElMessageBox } from "element-plus";
import { ElMessage } from "~/components/ui";
import { useAuth } from "~/composables/api/useAuth";
import { useTeacher } from "~/composables/api/useTeacher";
import { useTeacherNav } from "~/composables/api/useTeacherNav";

type NavItem = {
  label: string;
  icon?: string;
  iconSelected?: string;
  fallbackIcon?: string;
  path: string;
  activeMenu?: string;
  externalUrl?: string;
};

type OngoingClassroomInfo = {
  classId: string;
  courseId: string;
  chapterId: string;
  expireAt?: number;
};

const route = useRoute();
const router = useRouter();
const { $i18n } = useNuxtApp();
const { t } = useI18n();
const currentLocale = computed(() => $i18n.locale.value);
const switchLocale = (lang: 'zh' | 'en') => {
  $i18n.locale.value = lang;
  localStorage.setItem('locale', lang);
};
const { user, logout } = useAuth();
const { menuItems, loadMenus } = useTeacherNav();
const { endClass, stopQuickLogin, getTeacherStatus } = useTeacher();

const brandLogo = brandLogoImage;
const defaultTeacherAvatar = teacherAvatarImage;
const showProfileDropdown = ref(false);
const profileDropdownRef = ref<HTMLElement | null>(null);

useHead({
  link: [
    {
      rel: "preload",
      href: "/fonts/material-symbols-outlined-teacher2.woff2",
      as: "font",
      type: "font/woff2",
      crossorigin: "",
    },
  ],
});

const fallbackNavItems = computed<NavItem[]>(() => [
  { label: t('sidebar.home'), fallbackIcon: "home", path: "/teacher" },
  {
    label: t('sidebar.classManagement'),
    fallbackIcon: "group",
    path: "/system/class",
  },
  {
    label: t('sidebar.courseCenter'),
    fallbackIcon: "menu_book",
    path: "/system/course",
  },
  {
    label: t('sidebar.toolCenter'),
    fallbackIcon: "construction",
    path: "/system/tool",
  },
  {
    label: t('sidebar.aiPracticeCenter'),
    fallbackIcon: "psychology",
    path: "/system/opt",
  },
  {
    label: t('sidebar.learningCenter'),
    fallbackIcon: "insights",
    path: "/system/study",
  },
  {
    label: t('sidebar.teacherGrowthCenter'),
    fallbackIcon: "trending_up",
    path: "/system/growth",
  },
  {
    label: t('sidebar.competitionCenter'),
    fallbackIcon: "emoji_events",
    path: "/system/event",
  },
  { label: t('sidebar.aiAssistant'), fallbackIcon: "smart_toy", path: "/system/ai" },
]);

const implementedSidebarPaths = [
  "/teacher",
  "/teacher2",
  "/system/class",
  "/system/course",
  "/system/tool",
  "/system/opt",
  "/system/study",
  "/system/growth",
  "/system/event",
  "/system/user",
  "/system/ai",
];
const AI_FORCE_HOME_ONCE_KEY = "mata-ai-force-home-once";
const sidebarGlyphWhitelist = new Set([
  "home",
  "group",
  "menu_book",
  "construction",
  "psychology",
  "insights",
  "trending_up",
  "emoji_events",
  "smart_toy",
]);

const normalizeSidebarPath = (label: string, path: string) => {
  if (label.includes("AI实践中心")) {
    return "/system/opt";
  }

  if (label.includes("AI助手") || label.includes("AI 助手")) {
    return "/system/ai";
  }

  return path;
};

const resolveSidebarIcon = (label: string, path: string) => {
  if (label.includes("AI助手") || label.includes("AI 助手")) {
    return "smart_toy";
  }
  if (label.includes("AI实践中心")) {
    return "psychology";
  }
  if (path === "/teacher" || path === "/teacher2") return "home";
  if (
    path.startsWith("/system/class") ||
    label.includes("班级") ||
    label.includes("账号")
  ) {
    return "group";
  }
  if (path.startsWith("/system/course") || label.includes("课程")) {
    return "menu_book";
  }
  if (path.startsWith("/system/tool") || label.includes("工具")) {
    return "construction";
  }
  if (path.startsWith("/system/ai") || label.includes("AI")) {
    return "smart_toy";
  }
  if (
    path.startsWith("/system/study") ||
    label.includes("学情") ||
    label.includes("学习")
  ) {
    return "insights";
  }
  if (path.startsWith("/system/growth") || label.includes("成长")) {
    return "trending_up";
  }
  if (
    path.startsWith("/system/event") ||
    label.includes("赛事") ||
    label.includes("比赛")
  ) {
    return "emoji_events";
  }
  return "home";
};

const resolveSidebarIconGlyph = (item: NavItem) => {
  const rawIcon = String(
    isSidebarItemActive(item)
      ? item.iconSelected || item.icon || item.fallbackIcon || ""
      : item.icon || item.iconSelected || item.fallbackIcon || "",
  ).trim();

  // 仅接受白名单里的 ligature，避免显示为字母碎片
  if (rawIcon && sidebarGlyphWhitelist.has(rawIcon)) {
    return rawIcon;
  }

  const path = item.path;
  const label = item.label || "";
  return resolveSidebarIcon(label, path);
};

const sidebarLabelMap: Record<string, string> = {
  "首页": "sidebar.home",
  "班级管理": "sidebar.classManagement",
  "课程中心": "sidebar.courseCenter",
  "玛塔工具中心": "sidebar.toolCenter",
  "AI实践中心": "sidebar.aiPracticeCenter",
  "学情中心": "sidebar.learningCenter",
  "教师成长中心": "sidebar.teacherGrowthCenter",
  "赛事中心": "sidebar.competitionCenter",
  "AI助手": "sidebar.aiAssistant",
  "AI 助手": "sidebar.aiAssistant",
};

const resolveSidebarLabel = (label: string) => {
  const key = sidebarLabelMap[label];
  return key ? t(key) : label;
};

const sidebarNavItems = computed<NavItem[]>(() => {
  if (!menuItems.value.length) {
    return fallbackNavItems.value;
  }

  return menuItems.value.map((item) => {
    const path = normalizeSidebarPath(item.label, item.path);
    return {
      label: resolveSidebarLabel(item.label),
      path,
      activeMenu: item.activeMenu,
      externalUrl: item.externalUrl,
      icon: String(item.icon || "").trim(),
      iconSelected: String(item.iconSelected || "").trim(),
      fallbackIcon: resolveSidebarIcon(item.label, path),
    };
  });
});

watch(currentLocale, () => {
  void loadMenus(true);
});

const showModuleSwitch = computed(() => {
  const roleKey = user.value?.role_key || user.value?.roleKey;
  return roleKey === "city_admin" || roleKey === "district_admin";
});

const teacherDisplayName = computed(() => {
  return (
    user.value?.nickName ||
    user.value?.userName ||
    user.value?.nickname ||
    user.value?.nick_name ||
    user.value?.user_name ||
    t('sidebar.user')
  );
});

const teacherDisplayRole = computed(() => {
  return user.value?.roleName || user.value?.role_name || t('sidebar.teacher');
});

const resolvedTeacherAvatar = computed(() => {
  const avatar = String(
    user.value?.avatar ||
      user.value?.avatarUrl ||
      user.value?.headImg ||
      user.value?.headimg ||
      ""
  ).trim();

  return avatar || defaultTeacherAvatar;
});

const isSidebarItemActive = (item: NavItem) => {
  const currentPath = route.path;

  if (item.path === "/teacher") {
    return ["/teacher", "/teacher/", "/teacher2", "/teacher2/"].includes(currentPath);
  }

  if (
    currentPath.startsWith("/system/ai/face") ||
    currentPath.startsWith("/system/ai/material")
  ) {
    return item.path === "/system/opt";
  }

  return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
};

const isSidebarPathImplemented = (path: string) => {
  return implementedSidebarPaths.some(
    (implementedPath) =>
      path === implementedPath || path.startsWith(`${implementedPath}/`)
  );
};

const handleSidebarLogoClick = () => {
  const roleKey = user.value?.role_key || user.value?.roleKey;

  if (roleKey === "student") {
    router.push("/student");
    return;
  }

  if (route.path.startsWith("/teacher2")) {
    router.push("/teacher2");
    return;
  }

  router.push("/teacher");
};

const handleSidebarItemClick = (item: NavItem) => {
  console.log("[sidebar] 菜单点击:", item.path);
  if (isSidebarItemActive(item)) {
    if (item.path === "/system/ai" && typeof window !== "undefined") {
      window.sessionStorage.setItem(AI_FORCE_HOME_ONCE_KEY, "1");
      window.location.href = "/system/ai";
    }
    return;
  }

  if (item.externalUrl) {
    window.open(item.externalUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (!isSidebarPathImplemented(item.path)) {
    return;
  }

  if (item.path === "/system/ai" && typeof window !== "undefined") {
    window.sessionStorage.setItem(AI_FORCE_HOME_ONCE_KEY, "1");
  }

  router.push(item.path);
};

const handleTeacherAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement | null;
  if (!target) return;
  target.src = defaultTeacherAvatar;
};

const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value;
};

const handleProfile = () => {
  showProfileDropdown.value = false;
  router.push("/personalcenter");
};

const handleModuleSwitch = () => {
  showProfileDropdown.value = false;
  router.push("/district");
};

const getStoredOngoingClassroom = (): OngoingClassroomInfo | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("ongoing_classroom");
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    const classId = String(parsed?.classId || "").trim();
    const courseId = String(parsed?.courseId || "").trim();
    const chapterId = String(parsed?.chapterId || "").trim();
    const expireAt = Number(parsed?.expireAt || 0);

    if (!classId || !courseId || !chapterId) {
      localStorage.removeItem("ongoing_classroom");
      return null;
    }

    if (expireAt && Date.now() > expireAt) {
      localStorage.removeItem("ongoing_classroom");
      return null;
    }

    return {
      classId,
      courseId,
      chapterId,
      expireAt: expireAt || undefined,
    };
  } catch {
    localStorage.removeItem("ongoing_classroom");
    return null;
  }
};

const clearStoredOngoingClassroom = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ongoing_classroom");
};

const getActiveOngoingClassroom = async () => {
  const stored = getStoredOngoingClassroom();
  if (!stored) return null;

  try {
    const status = await getTeacherStatus();
    if (status?.isTeach) {
      return stored;
    }
  } catch (error) {
    console.error("teacher2 校验进行中课堂失败:", error);
  }

  clearStoredOngoingClassroom();
  return null;
};

const handleLogout = async () => {
  showProfileDropdown.value = false;

  const ongoingClassroom = await getActiveOngoingClassroom();
  if (!ongoingClassroom) {
    await logout();
    return;
  }

  try {
    await ElMessageBox.confirm(
      "当前有进行中的课堂，退出登录将自动结束当前课堂，是否继续？",
      "确认退出",
      {
        confirmButtonText: "确认退出",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
  } catch {
    return;
  }

  try {
    await endClass({
      classId: ongoingClassroom.classId,
      courseId: ongoingClassroom.courseId,
      chapterId: ongoingClassroom.chapterId,
      peerId: ongoingClassroom.classId,
    });

    try {
      await stopQuickLogin(ongoingClassroom.classId);
    } catch (error) {
      console.error("teacher2 退出登录时停用快捷登录失败:", error);
    }

    await logout();
  } catch (error: any) {
    console.error("teacher2 退出登录时自动结束课堂失败:", error);
    ElMessage.error(error?.message || "自动结束课堂失败，请稍后重试");
  }
};

const handleProfileClickOutside = (event: MouseEvent) => {
  if (
    profileDropdownRef.value &&
    !profileDropdownRef.value.contains(event.target as Node)
  ) {
    showProfileDropdown.value = false;
  }
};

onMounted(() => {
  loadMenus();
  document.addEventListener("click", handleProfileClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleProfileClickOutside);
});
</script>

<style scoped>
@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 100 700;
  src: url("/fonts/material-symbols-outlined-teacher2.woff2") format("woff2");
}

.teacher2-sidebar {
  position: sticky;
  top: 0;
  align-self: start;
  z-index: 50;
  display: flex;
  flex-direction: column;
  width: 240px;
  min-width: 240px;
  height: 100vh;
  padding: 20px 14px;
  background: #f2f4f5;
  overflow: hidden;
}

.teacher2-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 26px;
  padding: 0 12px;
  cursor: pointer;
}

.teacher2-brand__image {
  width: 184px;
  height: 30px;
  max-width: none;
  flex-shrink: 0;
  object-fit: contain;
  display: block;
}

.teacher2-nav {
  flex: 1;
}

.teacher2-nav__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
  padding: 10px 14px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #2e3335;
  text-align: left;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.teacher2-nav__item + .teacher2-nav__item {
  margin-top: 6px;
}

.teacher2-nav__item:hover {
  background: #dee3e5;
}

.teacher2-nav__item.is-active {
  background: rgba(255, 255, 255, 0.5);
  color: #005bc2;
  font-weight: 700;
}

.teacher2-nav__item.is-active::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -14px;
  width: 3px;
  height: calc(100% - 16px);
  background: #005bc2;
  transform: translateY(-50%);
  border-radius: 999px;
}

.teacher2-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: inherit;
  flex-shrink: 0;
}

.teacher2-nav__icon-image {
  width: 22px;
  height: 22px;
  display: block;
  object-fit: contain;
}

.teacher2-nav__icon-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  overflow: hidden;
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  color: #5d6572;
  font-variation-settings: "FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "liga";
  -webkit-font-feature-settings: "liga";
}

.teacher2-nav__item.is-active .teacher2-nav__icon-glyph {
  color: #005bc2;
  font-variation-settings: "FILL" 1, "wght" 600, "GRAD" 0, "opsz" 24;
}

.teacher2-nav__label {
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.25;
}

.teacher2-nav__item.is-active .teacher2-nav__label {
  font-weight: 700;
}

.teacher2-profile-wrap {
  margin-top: auto;
  padding: 18px 12px 0;
  border-top: 1px solid rgba(174, 179, 181, 0.1);
}

.teacher2-profile-entry {
  position: relative;
}

.teacher2-profile {
  width: 100%;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.teacher2-profile:hover {
  background: #f8fbff;
  box-shadow: 0 10px 24px rgba(0, 91, 194, 0.08);
}

.teacher2-profile:focus-visible {
  outline: 2px solid rgba(0, 91, 194, 0.28);
  outline-offset: 3px;
}

.teacher2-profile__avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  object-fit: cover;
  background: #a4c1ff;
}

.teacher2-profile__meta {
  min-width: 0;
}

.teacher2-profile__name {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.teacher2-profile__role {
  margin: 2px 0 0;
  font-size: 9px;
  color: #5a6062;
}

.teacher2-lang-switch {
  display: flex;
  gap: 4px;
  padding: 0 12px;
  margin-bottom: 8px;
}

.teacher2-lang-btn {
  flex: 1;
  border: 1px solid #dee3e5;
  border-radius: 8px;
  background: transparent;
  padding: 6px 0;
  font-size: 12px;
  font-weight: 500;
  color: #5a6062;
  cursor: pointer;
  transition: all 0.2s ease;
}

.teacher2-lang-btn:hover {
  border-color: #005bc2;
  color: #005bc2;
}

.teacher2-lang-btn.is-active {
  background: #005bc2;
  border-color: #005bc2;
  color: #fff;
  font-weight: 600;
}

@media (min-width: 1536px) {
  .teacher2-sidebar {
    width: 240px;
    min-width: 240px;
    padding: 20px 14px;
  }

  .teacher2-brand__image {
    width: 184px;
  }

  .teacher2-nav__item {
    min-height: 42px;
    padding: 10px 14px;
  }

  .teacher2-nav__label {
    font-size: 13px;
  }
}

.teacher2-profile-dropdown {
  position: absolute;
  right: 0;
  bottom: calc(100% + 12px);
  width: 188px;
  border: 1px solid #edf1f4;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(12, 15, 16, 0.1);
  overflow: hidden;
  z-index: 80;
}

.teacher2-profile-dropdown__head {
  padding: 12px 16px 10px;
  border-bottom: 1px solid #f1f4f6;
}

.teacher2-profile-dropdown__name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #2e3335;
}

.teacher2-profile-dropdown__role {
  margin: 4px 0 0;
  font-size: 12px;
  color: #767c7e;
}

.teacher2-profile-dropdown__item {
  width: 100%;
  border: none;
  background: transparent;
  padding: 11px 16px;
  text-align: left;
  font-size: 14px;
  color: #4d4d4d;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.teacher2-profile-dropdown__item:hover {
  background: #f8fbff;
  color: #005bc2;
}

.teacher2-profile-dropdown__item--danger:hover {
  color: #f56c6c;
}

.teacher2-profile-dropdown-enter-active,
.teacher2-profile-dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.teacher2-profile-dropdown-enter-from,
.teacher2-profile-dropdown-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
