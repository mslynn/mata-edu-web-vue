<template>
  <div class="district-page">
    <header class="district-nav">
      <div class="district-nav__brand">
        <img :src="districtLogo" alt="智慧教育平台" class="district-nav__logo" />
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
            <span class="district-nav__avatar">
              <img :src="resolvedAvatar" alt="用户头像" @error="handleAvatarError" />
            </span>
            <span class="district-nav__account-text">{{ displayUserName }}</span>
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
      <div class="district-shell" :style="shellStyle">
        <main class="district-body">
          <div class="district-cards">
            <button type="button" class="district-card" @click="goToDataCenter">
              <div class="district-card__art">
                <div class="district-card__placeholder">
                  <!-- <span>图片待补</span> -->
                  <img src="../assets/newimages/datacenter.svg" alt="" />
                </div>
              </div>
              <div class="district-card__title">{{ $t("city.datacenter") }}</div>
            </button>

            <button type="button" class="district-card" @click="goToSchoolManage">
              <div class="district-card__art">
                <div class="district-card__placeholder">
                  <img src="../assets/newimages/guanli.svg" alt="" />
                </div>
              </div>
              <div class="district-card__title">{{ manageTitle }}</div>
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
import districtLogo from "~/assets/newimages/logo.svg";
import defaultAvatar from "~/assets/newimages/user.png";

definePageMeta({
  layout: "blank",
});

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const router = useRouter();
const { t } = useI18n();
const { user, logout } = useAuth();

const viewportWidth = ref(DESIGN_WIDTH);
const viewportHeight = ref(DESIGN_HEIGHT);
const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const updateViewportSize = () => {
  if (typeof window === "undefined") return;
  viewportWidth.value = window.innerWidth || DESIGN_WIDTH;
  viewportHeight.value = window.innerHeight || DESIGN_HEIGHT;
};

const scale = computed(() =>
  Number(
    Math.min(
      viewportWidth.value / DESIGN_WIDTH,
      viewportHeight.value / DESIGN_HEIGHT
    ).toFixed(4)
  )
);

const shellStyle = computed(() => ({
  width: `${DESIGN_WIDTH}px`,
  height: `${DESIGN_HEIGHT}px`,
  transform: `translate(-50%, -50%) scale(${scale.value})`,
}));

const manageTitle = computed(() => {
  return user.value?.role_key === "district_admin"
    ? t("school.schoolManage")
    : t("city.districtManage");
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
  updateViewportSize();
  window.addEventListener("resize", updateViewportSize);
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateViewportSize);
  }
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.district-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f1f1f1;
}

.district-stage {
  position: relative;
  width: 100%;
  height: calc(100vh - 88px);
  overflow: hidden;
  background: #f1f1f1;
}

.district-shell {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center center;
  background: #f1f1f1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.district-nav {
  width: 100%;
  height: 80px;
  flex-shrink: 0;
  background: #ffffff;
  border-bottom: 1px solid #ececec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  box-sizing: border-box;
  position: relative;
  z-index: 2;
}

.district-nav__brand {
  display: flex;
  align-items: center;
  min-width: 0;
}

.district-nav__logo {
  width: 200px;
  height: 32px;
  object-fit: contain;
  display: block;
}

.district-nav__actions {
  display: flex;
  align-items: center;
  gap: 16px;
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
  color: #4d4d4d;
  font-size: 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.district-nav__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ececec;
  background: #ffffff;
}

.district-nav__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.district-nav__account-text {
  white-space: nowrap;
}

.district-nav__dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 188px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  padding: 8px 0;
  z-index: 10;
}

.district-nav__dropdown-head {
  padding: 10px 16px 12px;
  border-bottom: 1px solid #f2f2f2;
}

.district-nav__dropdown-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
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
  padding: 11px 16px;
  font-size: 14px;
  color: #4d4d4d;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.district-nav__dropdown-item:hover {
  background: #f8f8f8;
  color: #ff9900;
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
  background: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 80px 80px;
  box-sizing: border-box;
}

.district-cards {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 72px;
}

.district-card {
  width: 369px;
  min-height: 405px;
  padding: 23px 20px 28px;
  /* border: 1px dashed #b8c0cd; */
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.72);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.district-card:hover {
  transform: translateY(-6px);
  border-color: #9ea7b7;
  box-shadow: 0 18px 36px rgba(31, 41, 55, 0.08);
}

.district-card__art {
  width: 100%;
  height: 284px;
  /* border: 1px dashed #b8c0cd; */
  border-radius: 10px;
  background: #ffffff;
  padding: 14px;
  box-sizing: border-box;
}

.district-card__placeholder {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(180deg, #f7f7f7 0%, #efefef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b2b2b2;
  font-size: 16px;
  letter-spacing: 0.04em;
}

.district-card__title {
  margin-top: 18px;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: #4d4d4d;
}
</style>
