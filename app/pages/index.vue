<template>
  <!-- 如果已登录，显示首页 -->
  <div v-if="isAuthenticated" class="p-8">
    <!-- <h1 class="text-2xl font-bold mb-4">欢迎回来！</h1>
    <p class="text-gray-600 mb-6">这是智慧教育平台的首页</p>
    <button 
      @click="handleLogout"
      class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      退出登录
    </button> -->
  </div>
  <!-- 如果未登录，显示登录表单 -->
  <div v-else ref="loginPageRef" class="login-page" :style="pageAdaptiveStyle">
    <div class="login-page__shell">
      <section class="login-page__visual">
        <div class="login-page__visual-card">
          <div class="login-page__visual-bg"></div>
          <div class="login-page__visual-hero">
            <div class="login-page__visual-frame">
              <img
                src="/images/login/left.svg"
                alt="AI 智学云视觉插画"
                class="login-page__visual-image"
              />
            </div>
          </div>

          <div class="login-page__visual-copy">
            <h1 class="login-page__title">玛塔创想·AI智学云</h1>
            <p class="login-page__desc">面向未来的全场景人工智能素养教育基座</p>
          </div>
        </div>
      </section>

      <section class="login-page__panel">
        <div class="login-page__panel-card">
          <div class="login-page__toolbar">
            <LanguageSwitcher class="login-page__language" />
          </div>

          <div class="login-page__panel-head">
            <button
              type="button"
              class="login-page__back"
              :class="{ 'login-page__back--hidden': !isSubLoginMode }"
              @click="loginType = 'campus'"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              <span>{{ t("common.back") }}</span>
            </button>

            <div class="login-page__brandline">
              <img
                src="~/assets/newimages/logo.svg"
                alt="玛塔创想 AI智学云"
                class="login-page__brand-logo"
              />
            </div>

            <div class="login-page__title-block">
              <h2 v-if="panelTitle" class="login-page__panel-title">
                {{ panelTitle }}
              </h2>
            </div>
          </div>

          <LoginTabs
            v-if="
              loginType !== 'classcode' &&
              loginType !== 'trial' &&
              loginType !== 'forgotPassword'
            "
            v-model="loginType"
          />

          <div class="login-page__form-wrap">
            <div
              v-if="loginType !== 'trial' && loginType !== 'forgotPassword'"
              class="login-page__base-form"
            >
              <CampusLoginForm
                v-if="loginType === 'campus'"
                v-model:model-value="campusForm"
                v-model:errors="campusErrors"
                @forgot-password="loginType = 'forgotPassword'"
              />

              <PhoneLoginForm
                v-else-if="loginType === 'phonenumber'"
                v-model:model-value="phoneForm"
                v-model:errors="phoneErrors"
                @send-smsCode="sendCode"
                @toggle-password-login="togglePasswordLogin"
              />

              <ClassCodeLoginForm
                v-else-if="loginType === 'classcode'"
                v-model:model-value="classCodeForm"
                v-model:errors="classCodeErrors"
                @back="loginType = 'campus'"
              />
            </div>

            <div
              v-else-if="loginType === 'trial'"
              class="login-page__scroll-form"
            >
              <TrialAccountForm
                ref="trialFormRef"
                @submit="handleTrialSubmit"
              />
            </div>

            <div
              v-else
              class="login-page__scroll-form"
            >
              <ForgotPasswordForm
                @submit="handleForgotPasswordSubmit"
                @back="loginType = 'campus'"
              />
            </div>
          </div>

          <client-only v-if="loginType !== 'forgotPassword'">
            <button
              class="login-page__submit"
              :class="{ 'login-page__submit--trial': isTrialMode }"
              @click="handleLogin"
            >
              {{ isTrialMode ? t("auth.submit") : "立即登录" }}
            </button>
          </client-only>

          <AgreementCheckbox
            v-if="loginType !== 'forgotPassword' && loginType !== 'trial'"
            v-model="agreed"
            class="login-page__agreement"
            @show-agreement="showAgreementModal = true"
            @show-privacy="showPrivacyModal = true"
          />

          <OtherLoginOptions
            v-if="
              loginType !== 'classcode' &&
              loginType !== 'trial' &&
              loginType !== 'forgotPassword'
            "
            class="login-page__other-options"
            @classcode-login="loginType = 'classcode'"
            @apply-account="handleApplyAccount"
          />
        </div>
      </section>

      <Modal
        v-model="showAgreementRequiredModal"
        :title="t('auth.tips')"
        @confirm="handleAgreementConfirm"
        @cancel="showAgreementRequiredModal = false"
      >
        <div class="text-center">
          <p>{{ t("auth.agreementTip") }}</p>
        </div>
      </Modal>
    </div>
  </div>
  
  <!-- 班级码登录学生选择弹窗 -->
  <ClassCodeStudentModal
    v-model:visible="showStudentModal"
    :student-list="studentList"
    @select="handleSelectStudent"
  />
</template>
<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { useAuth } from '~/composables/api/useAuth'
import { useTeacherNav } from '~/composables/api/useTeacherNav'

const { $i18n } = useNuxtApp()
const t = (key: string) => $i18n.t(key)

const { login, isLoggedIn: isAuthenticated, token, logout, applyTrialAccount, resetPassword, user, getRedirectPathByRole, classCodeLogin, getClassCodeLoginList,getUser } = useAuth();
// 登录页也阻止返回
const { allowNavigation } = usePreventBack();
// 是否正在跳转（防止布局闪烁）
const isNavigating = ref(false);
const getLayoutByRole = (roleKey?: string) => {
  switch (roleKey) {
    case "teacher":
    case "school_admin":
      return "sidebar";
    case "student":
      return "blank";
    case "city_admin":
    case "district_admin":
      return "default";
    default:
      return "auth";
  }
};
// 根据登录状态动态切换布局（跳转时不切换）
// 只在客户端执行，避免 hydration 错误
if (import.meta.client) {
  watch(
    [isAuthenticated, () => user.value?.role_key || user.value?.roleKey || ""],
    ([authenticated, roleKey]) => {
      if (!isNavigating.value) {
        setPageLayout(
          authenticated ? getLayoutByRole(String(roleKey || "")) : "auth"
        );
      }
      // 如果已登录，自动跳转到对应页面
      if (authenticated && user.value) {
        const redirectPath = getRedirectPathByRole(user.value.role_key)
        if (redirectPath && redirectPath !== '/') {
          allowNavigation()
          navigateTo(redirectPath, { replace: true })
        }
      }
    },
    { immediate: true }
  );
}
// 默认使用 auth 布局
definePageMeta({
  layout: "auth",
});
const loginPageRef = ref<HTMLElement | null>(null);
const loginLayoutWidth = ref(1360);
let loginResizeObserver: ResizeObserver | null = null;

const getLoginLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = loginPageRef.value?.clientWidth || 0;
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

const syncLoginLayoutWidth = () => {
  loginLayoutWidth.value = getLoginLayoutWidth();
};

const loginShellWidth = computed(() => {
  if (loginLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(loginLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(loginLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--login-shell-width": loginShellWidth.value,
}));

const loginType = ref<
  "campus" | "phonenumber" | "classcode" | "trial" | "forgotPassword"
>("campus");
const isTrialMode = computed(() => loginType.value === "trial");
const isSubLoginMode = computed(() =>
  ["classcode", "trial", "forgotPassword"].includes(loginType.value)
);
const panelTitle = computed(() => {
  if (loginType.value === "trial") return t("auth.applyTrialAccount");
  if (loginType.value === "forgotPassword") return t("auth.resetPassword");
  if (loginType.value === "classcode") return t("auth.classCodeLogin");
  return "";
});
const ACCOUNT_PASSWORD_MIN_LENGTH = 6;
const ACCOUNT_PASSWORD_MAX_LENGTH = 30;
const trialFormRef = ref<{
  handleSubmit: () => void;
  setFieldError: (field: "smsCode", message: string) => void;
} | null>(null);
const agreed = ref(false);
const countdown = ref(0);
const showAgreementRequiredModal = ref(false);
const showAgreementModal = ref(false);
const showPrivacyModal = ref(false);
// 班级码登录相关
const showStudentModal = ref(false);
const studentList = ref<any[]>([]);
const classCodeLoginData = ref<any>(null);
// 校园账号表单数据
const campusForm = ref({
  username: "",
  password: "",
});
const campusErrors = ref({
  username: false,
  password: false,
});
// 手机号表单数据
const phoneForm = ref({
  phone: "",
  code: "",
});
const phoneErrors = ref({
  phone: false,
  code: false,
});
// 班级码表单数据
const classCodeForm = ref({
  classCode: "",
  classPassword: "",
});
const classCodeErrors = ref({
  classCode: false,
  classPassword: false,
});
// 重置表单函数
const resetForm = () => {
  campusForm.value = { username: "", password: "" };
  campusErrors.value = { username: false, password: false };
  phoneForm.value = { phone: "", code: "" };
  phoneErrors.value = { phone: false, code: false };
  classCodeForm.value = { classCode: "", classPassword: "" };
  classCodeErrors.value = { classCode: false, classPassword: false };
};
// 监听登录方式切换，重置表单和消息
watch(loginType, () => {
  resetForm();
});
const sendCode = async () => {
  // 验证码发送已在 PhoneLoginForm 组件内部处理
  console.log('📤 发送验证码事件触发');
};
const togglePasswordLogin = () => {
  loginType.value = "campus";
};
const handleApplyAccount = () => {
  console.log('🎯 点击申请体验账号，切换到 trial');
  loginType.value = "trial";
  console.log('loginType 已切换为:', loginType.value);
};
const handleLogin = async () => {
  console.log("🚀 handleLogin called!", {
    agreed: agreed.value,
    loginType: loginType.value,
    campusForm: campusForm.value,
  });
  // 体验账号申请（不需要勾选协议）
  if (loginType.value === "trial") {
    trialFormRef.value?.handleSubmit();
    return;
  }

  // 其他登录方式需要勾选协议
  if (!agreed.value) {
    showAgreementRequiredModal.value = true;
    return;
  }
  console.log("loginType", loginType.value);
  
  if (loginType.value === "campus") {
    // 校园账号登录
    campusErrors.value.username = false;
    campusErrors.value.password = false;
    const username = (campusForm.value.username || "").trim();
    const password = campusForm.value.password || "";
    
    if (!username || !password) {
      if (!username) campusErrors.value.username = true;
      if (!password) campusErrors.value.password = true;
      return;
    }

    if (
      username.length < ACCOUNT_PASSWORD_MIN_LENGTH ||
      username.length > ACCOUNT_PASSWORD_MAX_LENGTH
    ) {
      ElMessage.warning(t("auth.accountLengthRule"));
      return;
    }

    if (
      password.length < ACCOUNT_PASSWORD_MIN_LENGTH ||
      password.length > ACCOUNT_PASSWORD_MAX_LENGTH
    ) {
      ElMessage.warning(t("auth.passwordRule"));
      return;
    }
    try {
      isNavigating.value = true;
      const result = await login(
        username,
        password,
        'password'
      );
      console.log("✅ 登录结果:", result);

      // 登录成功，预加载菜单数据（如果是教师角色）
      if (result?.redirectPath?.startsWith('/system')) {
        const { loadMenus } = useTeacherNav();
        await loadMenus(true); // 强制刷新菜单
      }

      // 登录成功，跳转到对应页面
      if (result?.redirectPath) {
        allowNavigation();
        // 使用硬刷新跳转，确保布局和状态正确加载
        window.location.href = result.redirectPath;
      } else {
        console.error("❌ 未获取到跳转路径");
        isNavigating.value = false;
      }
    } catch (error: any) {
      console.error("❌ 登录失败:", error);
      isNavigating.value = false;
      // ElMessage.error(error?.data?.msg || error?.message || "登录失败，请重试");
    }
  } else if (loginType.value === "phonenumber") {
    // 手机号登录
    phoneErrors.value.phone = false;
    phoneErrors.value.code = false;
    
    if (!phoneForm.value.phone || !phoneForm.value.code) {
      if (!phoneForm.value.phone) phoneErrors.value.phone = true;
      if (!phoneForm.value.code) phoneErrors.value.code = true;
      return;
    }
    try {
      // 设置跳转标志，防止布局闪烁
      isNavigating.value = true;
      const result = await login(
        phoneForm.value.phone,
        phoneForm.value.code,
        'sms'
      );
      
      console.log('✅ 手机号登录结果:', result);
      
      if (result?.redirectPath) {
        // 登录成功，跳转到对应页面
        allowNavigation();
        // 使用硬刷新跳转，确保布局和状态正确加载
        window.location.href = result.redirectPath;
      } else {
        isNavigating.value = false;
       // ElMessage.error(result?.msg || "登录失败，请重试");
      }
    } catch (error: any) {
      console.error("❌ 手机号登录失败:", error);
      isNavigating.value = false;
     // ElMessage.error(error?.data?.msg || error?.message || "登录失败，请重试");
    }
  } else if (loginType.value === "classcode") {
    // 班级码登录
    classCodeErrors.value.classCode = false;
    classCodeErrors.value.classPassword = false;
    const classCode = (classCodeForm.value.classCode || "").trim();
    const classPassword = classCodeForm.value.classPassword || "";
    
    if (!classCode || !classPassword) {
      if (!classCode)
        classCodeErrors.value.classCode = true;
      if (!classPassword)
        classCodeErrors.value.classPassword = true;
      return;
    }

    if (
      classPassword.length < ACCOUNT_PASSWORD_MIN_LENGTH ||
      classPassword.length > ACCOUNT_PASSWORD_MAX_LENGTH
    ) {
      ElMessage.warning(t("auth.passwordRule"));
      return;
    }
    try {
      isNavigating.value = true;
      const result = await classCodeLogin(
        classCode,
        classPassword
      );
      console.log('✅ 班级码登录结果:', result);
      
      // 保存登录数据，获取学生列表 (data 直接是 classId 字符串)
      if (result?.data) {
        classCodeLoginData.value = result.data;
        const listResult = await getClassCodeLoginList(result.data);
        console.log('✅ 学生列表:', listResult);
        
        if (listResult?.data) {
          studentList.value = listResult.data;
          showStudentModal.value = true;
        }
      }
      isNavigating.value = false;
    } catch (error: any) {
      console.error("❌ 班级码登录失败:", error);
      isNavigating.value = false;
    }
  }
};
const handleLogout = () => {
  logout();
};
// 体验账号提交
const handleTrialSubmit = async (data: any) => {
  console.log("体验账号申请数据:", data);
  try {
    const res = await applyTrialAccount(
      data.name,
      data.phonenumber,
      data.smsCode,
      data.organizationName,
      data.purposes.join(','),   // purpose: 多选转为逗号分隔字符串
      data.products.join(',')    // product: 多选转为逗号分隔字符串
    );

    if (res?.code === 200) {
      console.log('✅ 申请提交成功');
      ElMessage.success(res?.msg || "申请已提交，我们将尽快与您联系");
      loginType.value = "campus";
      return;
    }

    const errorMsg = res?.msg || "申请提交失败，请重试";
    if (errorMsg.includes("验证码")) {
      trialFormRef.value?.setFieldError("smsCode", errorMsg);
    } else {
      ElMessage.error(errorMsg);
    }
  } catch (error: any) {
    console.error('❌ 申请提交失败:', error);
    const errorMsg = error?.data?.msg || error?.message || "申请提交失败，请重试";
    if (errorMsg.includes("验证码")) {
      trialFormRef.value?.setFieldError("smsCode", errorMsg);
      return;
    }
    ElMessage.error(errorMsg);
  }
};
// 忘记密码提交
const handleForgotPasswordSubmit = async (data: any) => {
  console.log("重置密码数据:", data);
  try {
    let res =  await resetPassword(data.phone, data.code, data.password);
    console.log('✅ 密码重置结果', res);
    if (res.code === 200) {
      ElMessage.success(t('auth.resetPasswordSuccess'));
      loginType.value = "campus";
    } else {
    //  ElMessage.error(res.msg || "密码重置失败，请重试");
    }
 
 
  } catch (error: any) {
    console.error('❌ 密码重置失败:', error);
  //  ElMessage.error(error?.data?.msg || error?.message || "密码重置失败，请重试");
  }
};
const handleAgreementConfirm = () => {
  agreed.value = true;
  showAgreementRequiredModal.value = false;
  // 确认协议后直接触发登录
  handleLogin();
};

// 选择学生完成登录
const handleSelectStudent = async (student: any) => {
  console.log('✅ 选择学生:', student);
  try {
    isNavigating.value = true;
    const result = await login(
      classCodeForm.value.classCode,
      classCodeForm.value.classPassword,
      'classcode',
      student.studentNumber
    );
    console.log('✅ 班级码学生登录结果:', result);
    
    showStudentModal.value = false;
    
    if (result?.redirectPath) {
      allowNavigation();
      window.location.href = result.redirectPath;
    } else {
      isNavigating.value = false;
    }
  } catch (error: any) {
    console.error('❌ 班级码学生登录失败:', error);
    isNavigating.value = false;
  }
};
// 是否允许离开页面（只有退出登录时才允许）
// const allowLeave = ref(false)
// // 使用路由守卫阻止返回
// onBeforeRouteLeave(() => {
//   if (!allowLeave.value) {
//     return false // 阻止离开
//   }
// })

onMounted(() => {
  syncLoginLayoutWidth();
  window.addEventListener("resize", syncLoginLayoutWidth);
  if (typeof ResizeObserver !== "undefined") {
    loginResizeObserver = new ResizeObserver(() => {
      syncLoginLayoutWidth();
    });
    if (loginPageRef.value) {
      loginResizeObserver.observe(loginPageRef.value);
    }
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncLoginLayoutWidth);
  }
  loginResizeObserver?.disconnect();
  loginResizeObserver = null;
});
</script>
<style scoped>
.login-page {
  --login-shell-width: 1180px;
  width: min(100%, var(--login-shell-width));
  min-height: min(760px, calc(100vh - 40px));
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-page__shell {
  width: 100%;
  min-height: min(740px, calc(100vh - 40px));
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
  gap: 0;
  align-items: stretch;
  background: #fefeff;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(223, 229, 243, 0.8);
  box-shadow: 0 26px 80px rgba(6, 23, 54, 0.18);
}

.login-page__visual {
  min-width: 0;
}

.login-page__visual-card {
  position: relative;
  height: 100%;
  min-height: 740px;
  overflow: hidden;
  border-radius: 0;
  background:
    radial-gradient(circle at 78% 16%, rgba(19, 123, 255, 0.18) 0%, transparent 26%),
    radial-gradient(circle at 28% 82%, rgba(50, 124, 255, 0.18) 0%, transparent 30%),
    linear-gradient(180deg, #072964 0%, #08275d 100%);
  padding: 48px 44px 42px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.login-page__visual-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.1) 1.2px, transparent 0);
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

.login-page__panel {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(180deg, #fbfbff 0%, #ffffff 100%);
}

.login-page__panel-card {
  min-height: 740px;
  background: transparent;
  padding: 42px 68px 38px 58px;
  display: flex;
  flex-direction: column;
}

.login-page__panel-head {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 18px;
}

.login-page__back {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: #4c5f81;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0 0 12px;
}

.login-page__back--hidden {
  visibility: hidden;
  pointer-events: none;
}

.login-page__panel-title {
  margin: 0;
  color: #1b2b46;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 600;
}

.login-page__form-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-page__base-form,
.login-page__scroll-form {
  flex: 1;
  min-height: 0;
}

.login-page__base-form {
  padding-top: 0;
}

.login-page__scroll-form {
  overflow-y: auto;
  padding-right: 4px;
}

.login-page__submit {
  width: 100%;
  height: 52px;
  margin-top: 12px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #0b5fd8 0%, #2673ef 100%);
  color: #ffffff;
  font-size: 15px;
  line-height: 1;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(13, 97, 221, 0.24);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-page__submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(13, 97, 221, 0.24);
}

.login-page__submit--trial {
  margin-top: 12px;
}

.login-page__agreement {
  margin-top: 10px;
}

.login-page__other-options {
  margin-top: auto;
}

.login-page :deep(.language-switcher) {
  gap: 6px;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.login-page :deep(.language-switcher:hover) {
  box-shadow: none;
}

.login-page :deep(.globe-icon) {
  color: #7c8ba6;
}

.login-page :deep(.lang-text) {
  color: #7c8ba6;
  font-size: 13px;
  font-weight: 500;
}

.login-page :deep(.dropdown-menu) {
  border-radius: 16px;
  border-color: rgba(223, 231, 245, 0.9);
}

.login-page :deep(.dropdown-item:hover) {
  background: #f4f8ff;
}

.login-page :deep(.dropdown-item.active) {
  background: linear-gradient(135deg, #edf4ff 0%, #dceaff 100%);
  color: #0f67ff;
}

.login-page :deep(.check-icon) {
  color: #0f67ff;
}

.login-page :deep(.login-form) {
  height: 100%;
}

.login-page :deep(.login-form .form-field) {
  margin-bottom: 8px;
  padding-bottom: 14px;
}

.login-page :deep(.login-form .form-field-label) {
  margin: 0 0 8px 2px;
  color: #1b2b46;
  font-size: 12px;
  line-height: 1;
  font-weight: 700;
}

.login-page :deep(.login-form .input-line) {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  background: #edf1fb !important;
  border: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.login-page :deep(.login-form .input-line:hover) {
  background: #e8eefb !important;
}

.login-page :deep(.login-form .input-line:focus-within) {
  background: #ffffff !important;
  box-shadow: 0 0 0 2px rgba(9, 110, 243, 0.14);
}

.login-page :deep(.login-form .input-line::after) {
  display: none;
}

.login-page :deep(.login-form .input-line.has-error) {
  background: #fff2f2 !important;
  outline: 1px solid rgba(245, 108, 108, 0.36);
}

.login-page :deep(.login-form input) {
  color: #2a3750 !important;
  font-size: 13px !important;
  font-weight: 500;
}

.login-page :deep(.login-form input::placeholder) {
  color: #9aa7bd !important;
}

.login-page :deep(.login-form .field-error) {
  left: 14px;
  font-size: 11px;
}

.login-page :deep(.send-code-btn) {
  min-width: 104px;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, #0b5fd8 0%, #2673ef 100%) !important;
  color: #ffffff !important;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 8px 18px rgba(13, 97, 221, 0.18);
}

.login-page :deep(.country-code-selector) {
  height: 30px;
  border-radius: 12px;
  border-color: rgba(210, 220, 235, 0.72);
  background: #ffffff;
}

.login-page :deep(.country-code-selector:hover) {
  border-color: #4b8eff;
}

.login-page :deep(.country-option:hover) {
  background-color: #f4f8ff;
  color: #0f67ff;
}

.login-page :deep(.country-option.active) {
  background-color: #0f67ff;
}

.login-page :deep(.trial-account-form) {
  max-width: none;
}

.login-page :deep(.trial-account-form .form-input-wrap),
.login-page :deep(.trial-account-form .form-select-wrap) {
  min-height: 40px;
  border-radius: 18px;
  border: none;
  background: #edf1fb;
  padding: 0 14px;
}

.login-page :deep(.trial-account-form .form-input-wrap) {
  border-bottom-width: 0;
}

.login-page :deep(.trial-account-form .form-item) {
  margin-bottom: 8px;
  padding-bottom: 18px;
}

.login-page :deep(.trial-account-form .trial-send-code-btn) {
  min-width: 104px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(90deg, #0b5fd8 0%, #2673ef 100%) !important;
  color: #ffffff !important;
}

.login-page :deep(.trial-account-form .form-input),
.login-page :deep(.trial-account-form .select-label),
.login-page :deep(.trial-account-form .el-select-custom) {
  font-weight: 500;
  font-size: 12px;
}

.login-page :deep(.trial-account-form .error-msg) {
  left: 14px;
}

.login-page :deep(.el-select__wrapper) {
  box-shadow: none !important;
  background: transparent !important;
}

.login-page :deep(.el-select__placeholder),
.login-page :deep(.el-select__selected-item) {
  color: #1d2b43;
  font-weight: 500;
}

.login-page :deep(.el-select__placeholder.is-transparent) {
  color: #a5b3ca;
}

.login-page :deep(.agreement-checkbox) {
  color: #7a86a0;
  font-size: 12px;
}

.login-page :deep(.agreement-checkbox a) {
  color: #0f67ff;
  font-weight: 500;
}

.login-page :deep(.agreement-checkbox input[type='checkbox']) {
  accent-color: #0f67ff;
}

.login-page :deep(.other-login-options button),
.login-page :deep(.flex.justify-start.gap-20.mt-8.pt-9.text-lg button) {
  color: #7a89a4 !important;
}

.login-page :deep(.other-login-options button:hover),
.login-page :deep(.flex.justify-start.gap-20.mt-8.pt-9.text-lg button:hover) {
  color: #0f67ff !important;
}

.login-page :deep(.flex.justify-start.gap-20.mt-8.pt-9.text-lg) {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(224, 232, 245, 0.92);
}

.login-page :deep(.flex.justify-start.gap-20.mt-8.pt-9.text-lg button) {
  flex: none;
  justify-content: center;
  font-size: 12px;
}

.login-page :deep(.flex.gap-12.mb-8.justify-center) {
  justify-content: flex-start;
  gap: 34px;
  margin-bottom: 18px;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(223, 229, 243, 0.96);
}

.login-page :deep(.flex.gap-12.mb-8.justify-center button) {
  padding-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.login-page__visual-hero {
  width: 100%;
  max-width: 406px;
  position: relative;
  z-index: 1;
}

.login-page__visual-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 34px;
  background: transparent;
  box-shadow:
    inset 0 0 0 1px rgba(67, 125, 216, 0.14),
    0 30px 56px rgba(2, 20, 47, 0.28);
  overflow: hidden;
}

.login-page__visual-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}

.login-page__visual-copy {
  margin-top: 30px;
  position: relative;
  z-index: 2;
}

.login-page__title {
  margin: 0;
  color: #ffffff;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 700;
}

.login-page__desc {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.7;
  font-weight: 500;
}

.login-page__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
 }

.login-page__brandline {
  display: inline-flex;
  align-items: center;
  margin-bottom: 18px;
}

.login-page__brand-logo {
  display: block;
  width: 204px;
  height: auto;
  object-fit: contain;
}

.login-page__title-block {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.login-page__language {
  flex-shrink: 0;
}


@media (max-width: 1500px) {
  .login-page__shell {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.96fr);
  }

  .login-page__visual-card,
  .login-page__panel-card {
    min-height: 680px;
  }

  .login-page__panel-card {
    padding: 36px 52px 30px 42px;
  }

  .login-page__brand-logo {
    width: 188px;
  }

  .login-page__title {
    font-size: 22px;
  }
}

@media (max-width: 1280px) {
  .login-page {
    min-height: calc(100vh - 32px);
  }

  .login-page__shell {
    min-width: 0;
  }
}
</style>
