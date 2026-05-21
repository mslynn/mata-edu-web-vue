<template>
  <div ref="districtPageRef" class="district-page" :style="pageAdaptiveStyle">
    <header class="district-nav">
      <div class="district-nav__brand">
        <span class="district-nav__brand-text">智慧教育平台</span>
      </div>
      <div class="district-nav__actions">
        <!-- <LanguageSwitcher />
        <img src="~/assets/images/infor.png" alt="消息通知" class="district-nav__notice" /> -->
        <div class="district-nav__account" ref="dropdownRef">
          <button
            type="button"
            class="district-nav__account-trigger"
            @click="toggleDropdown"
          >
            <span class="district-nav__account-meta">
              <span class="district-nav__account-name">{{ displayUserName }}</span>
              <span class="district-nav__account-role">{{ roleLabel }}</span>
            </span>
            <span class="district-nav__avatar">
              <img :src="resolvedAvatar" alt="用户头像" @error="handleAvatarError" />
            </span>
          </button>

          <Transition name="district-dropdown">
            <div v-if="showDropdown" class="district-nav__dropdown">
              <div class="district-nav__dropdown-head">
                <p class="district-nav__dropdown-name">{{ displayUserName }}</p>
              </div>
              <button
                v-if="showModuleSwitch"
                type="button"
                class="district-nav__dropdown-item"
                @click="handleModuleSwitch"
              >
                模块切换
              </button>
              <button
                type="button"
                class="district-nav__dropdown-item"
                @click="handleProfile"
              >
                个人中心
              </button>
              <button
                type="button"
                class="district-nav__dropdown-item district-nav__dropdown-item--danger"
                @click="handleLogout"
              >
                退出登录
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <div class="district-stage">
      <div class="district-shell">
        <main class="district-body">
          <section class="district-hero">
            <h1 class="district-hero__title">欢迎回来，管理员</h1>
            <p class="district-hero__desc">
              请选择您需要进入的管理版块，快速开展今日的智慧教育管理工作。
            </p>
          </section>

          <div class="district-cards">
            <button type="button" class="district-card" @click="goToDataCenter">
              <div class="district-card__art">
                <img :src="dataCenterCover" alt="数据中心" />
                <span class="district-card__art-mask"></span>
              </div>
              <div class="district-card__content">
                <div class="district-card__head">
                  <span class="district-card__icon district-card__icon--primary">
                    <span class="district-card__icon-bars"></span>
                  </span>
                  <h2 class="district-card__title">{{ $t("city.datacenter") }}</h2>
                </div>
                <p class="district-card__desc">
                  提供全方位的教学数据监测与深度分析报告，助您实时掌握区域学校学习动态、评估教师教学成果。
                </p>
              </div>
              <span class="district-card__accent district-card__accent--primary"></span>
            </button>

            <button type="button" class="district-card" @click="goToSchoolManage">
              <div class="district-card__art">
                <img :src="manageCover" alt="区域管理" />
                <span class="district-card__art-mask"></span>
              </div>
              <div class="district-card__content">
                <div class="district-card__head">
                  <span class="district-card__icon district-card__icon--secondary">
                    <span class="district-card__icon-building"></span>
                  </span>
                  <h2 class="district-card__title">{{ manageTitle }}</h2>
                </div>
                <p class="district-card__desc">{{ manageDescription }}</p>
              </div>
              <span class="district-card__accent district-card__accent--secondary"></span>
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "~/composables/api/useAuth";
import defaultAvatar from "~/assets/newimages/user.png";

definePageMeta({
  layout: "blank",
});

const router = useRouter();
const { t } = useI18n();
const { user, logout } = useAuth();

const districtPageRef = ref<HTMLElement | null>(null);
const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
let districtPageResizeObserver: ResizeObserver | null = null;
const districtLayoutWidth = ref(1360);
const dataCenterCover = "/images/district/datacenter-cover.png";
const schoolManageCover = "/images/district/school-manage-cover.png";

const getDistrictLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = districtPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(width => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const syncDistrictLayoutWidth = () => {
  districtLayoutWidth.value = getDistrictLayoutWidth();
};

const districtShellWidth = computed(() => {
  if (districtLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(districtLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(districtLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--district-shell-width": districtShellWidth.value,
}));

const manageTitle = computed(() => {
  return user.value?.role_key === "district_admin"
    ? t("school.schoolManage")
    : t("city.districtManage");
});

const manageCover = computed(() => {
  return user.value?.role_key === "district_admin"
    ? schoolManageCover
    : schoolManageCover;
});

const manageDescription = computed(() => {
  return user.value?.role_key === "district_admin"
    ? "高效管理多级机构架构，精细化配置教育资源与人员权限，实现全区一体化智能管控。"
    : "高效管理多级机构架构，精细化配置教育资源与人员权限，实现全区域一体化智能管控。";
});

const roleLabel = computed(() => {
  const roleKey = user.value?.role_key || user.value?.roleKey;
  if (roleKey === "district_admin") {
    return "区级管理员";
  }
  if (roleKey === "city_admin") {
    return "市级管理员";
  }
  return "超级管理员";
});

const displayUserName = computed(() => {
  return (
    user.value?.nickName ||
    user.value?.userName ||
    user.value?.nickname ||
    user.value?.nick_name ||
    user.value?.user_name ||
    "账号登录"
  );
});

const showModuleSwitch = computed(() => {
  const roleKey = user.value?.role_key || user.value?.roleKey;
  return roleKey === "city_admin" || roleKey === "district_admin";
});

const resolvedAvatar = computed(() => {
  const avatar = String(
    user.value?.avatar ||
      user.value?.avatarUrl ||
      user.value?.headImg ||
      user.value?.headimg ||
      ""
  ).trim();
  return avatar || defaultAvatar;
});

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement | null;
  if (!target) return;
  target.src = defaultAvatar;
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const goToDataCenter = () => {
  router.push("/datacenter");
};

const goToSchoolManage = () => {
  if (user.value?.role_key === "city_admin") {
    router.push("/city");
    return;
  }
  router.push("/school");
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
  syncDistrictLayoutWidth();
  window.addEventListener("resize", syncDistrictLayoutWidth);
  if (typeof ResizeObserver !== "undefined") {
    districtPageResizeObserver = new ResizeObserver(() => {
      syncDistrictLayoutWidth();
    });
    if (districtPageRef.value) {
      districtPageResizeObserver.observe(districtPageRef.value);
    }
  }
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncDistrictLayoutWidth);
  }
  districtPageResizeObserver?.disconnect();
  districtPageResizeObserver = null;
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.district-page {
  --district-min-width: 1280px;
  --district-max-width: 1920px;
  --district-shell-width: var(--district-min-width);
  --district-primary: #0056c4;
  --district-secondary: #445d95;
  --district-surface: #ffffff;
  --district-text: #191b23;
  --district-muted: #424655;
  width: 100vw;
  height: 100vh;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  background:
    radial-gradient(circle at 10% 20%, rgba(0, 86, 196, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 90% 80%, rgba(68, 93, 149, 0.05) 0%, transparent 50%),
    #ffffff;
  color: var(--district-text);
  font-family: "Manrope", "PingFang SC", sans-serif;
}

.district-stage {
  width: min(
    var(--district-max-width),
    max(var(--district-min-width), var(--district-shell-width))
  );
  min-width: 0;
  height: calc(100vh - 72px);
  margin: 0 auto;
  background: transparent;
}

.district-shell {
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
}

.district-nav {
  width: 100%;
  height: 72px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
  border-bottom: 1px solid rgba(205, 214, 232, 0.55);
}

.district-nav__brand {
  display: flex;
  align-items: center;
  min-width: 0;
}

.district-nav__brand-text {
  color: var(--district-primary);
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.02em;
}

.district-nav__actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.district-nav__notice {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
  cursor: pointer;
}

.district-nav__account {
  position: relative;
}

.district-nav__account-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--district-text);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 8px 0;
}

.district-nav__account-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.district-nav__account-name {
  color: var(--district-text);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.1;
}

.district-nav__account-role {
  color: var(--district-muted);
  font-size: 13px;
  line-height: 1.1;
}

.district-nav__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 86, 196, 0.2);
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.district-nav__account-trigger:hover .district-nav__avatar {
  border-color: var(--district-primary);
}

.district-nav__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.district-nav__dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 224px;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  padding: 10px 0;
  z-index: 10;
}

.district-nav__dropdown-head {
  padding: 14px 18px 14px;
  border-bottom: 1px solid #f2f2f2;
}

.district-nav__dropdown-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.district-nav__dropdown-role {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.district-nav__dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 13px 18px;
  font-size: 15px;
  color: #4d4d4d;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.district-nav__dropdown-item:hover {
  background: #f8f8f8;
  color: var(--district-primary);
}

.district-nav__dropdown-item--danger:hover {
  color: #f56c6c;
}

.district-dropdown-enter-active {
  transition: all 0.2s ease-out;
}

.district-dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.district-dropdown-enter-from,
.district-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.district-body {
  flex: 1;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 56px clamp(48px, 5vw, 88px) 32px;
  box-sizing: border-box;
  overflow: hidden;
}

.district-hero {
  max-width: 760px;
  margin: 0 auto 48px;
  text-align: center;
}

.district-hero__title {
  margin: 0;
  color: var(--district-text);
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: clamp(34px, 2.2vw, 42px);
  font-weight: 500;
  line-height: 1.18;
  letter-spacing: 0.01em;
}

.district-hero__desc {
  margin: 20px 0 0;
  color: var(--district-muted);
  font-size: 17px;
  line-height: 1.75;
}

.district-cards {
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1080px;
  gap: 48px;
}

.district-card {
  position: relative;
  width: 512px;
  min-width: 0;
  min-height: 500px;
  padding: 0;
  border: 1px solid rgba(194, 198, 215, 0.45);
  border-radius: 32px;
  background: var(--district-surface);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(25, 27, 35, 0.08);
  transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
}

.district-card:hover {
  transform: translateY(-6px);
  border-color: rgba(0, 86, 196, 0.28);
  box-shadow: 0 22px 46px rgba(25, 27, 35, 0.14);
}

.district-card__art {
  width: 100%;
  height: 278px;
  position: relative;
  overflow: hidden;
}

.district-card__art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.7s ease;
}

.district-card:hover .district-card__art img {
  transform: scale(1.08);
}

.district-card__art-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 35%,
    rgba(255, 255, 255, 0.8) 78%,
    #ffffff 100%
  );
  pointer-events: none;
}

.district-card__content {
  flex: 1;
  padding: 28px 32px 32px;
}

.district-card__head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.district-card__icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.district-card__icon--primary {
  background: #096ef3;
}

.district-card__icon--secondary {
  background: #a7c0ff;
}

.district-card__icon-bars {
  width: 22px;
  height: 22px;
  border: 2px solid #ffffff;
  position: relative;
}

.district-card__icon-bars::before,
.district-card__icon-bars::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: 3px;
  border-radius: 3px;
  background: #ffffff;
  transform: translateX(-50%);
}

.district-card__icon-bars::before {
  height: 6px;
  margin-left: -5px;
}

.district-card__icon-bars::after {
  height: 11px;
  margin-left: 5px;
}

.district-card__icon-building {
  width: 22px;
  height: 18px;
  border: 2px solid #334d85;
  border-top-width: 6px;
  border-radius: 4px;
  position: relative;
}

.district-card__icon-building::before,
.district-card__icon-building::after {
  content: "";
  position: absolute;
  top: 5px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #334d85;
}

.district-card__icon-building::before {
  left: 4px;
}

.district-card__icon-building::after {
  right: 4px;
}

.district-card__title {
  margin: 0;
  color: var(--district-text);
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 28px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.district-card__desc {
  margin: 0;
  color: var(--district-muted);
  font-size: 17px;
  line-height: 1.85;
}

.district-card__accent {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 6px;
  border-radius: 0 999px 999px 0;
  transition: width 0.35s ease;
  pointer-events: none;
  z-index: 2;
}

.district-card__accent--primary {
  background: linear-gradient(90deg, #0b63f3 0%, #4b8eff 100%);
}

.district-card__accent--secondary {
  background: linear-gradient(90deg, #6f8ff7 0%, #9bb7ff 100%);
}

.district-card:hover .district-card__accent {
  width: 100%;
}

@media (max-width: 1360px) {
  .district-body {
    padding-left: 36px;
    padding-right: 36px;
  }

  .district-card {
    width: calc((100% - 56px) / 2);
    min-width: 0;
  }

  .district-card__title {
    font-size: 24px;
  }

  .district-card__desc {
    font-size: 15px;
  }
}

@media (max-width: 1280px) {
  .district-cards {
    flex-wrap: nowrap;
  }

  .district-card {
    width: 504px;
  }
}
</style>
