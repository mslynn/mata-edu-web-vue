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
  <div
    v-else
    class="flex bg-white rounded-lg border border-dashed border-gray-300 overflow-hidden h-auto max-h-[600px] w-full max-w-[1000px]"
  >
    <!-- 左侧插图 -->
    <div class="p-[33px]">
      <img src="~/assets/images/bg.png" alt="背景插图" class="object-contain" />
    </div>
    <!-- 右侧登录表单 -->
    <div
      class="flex-1 px-10 flex flex-col relative min-h-0"
      :class="loginType === 'trial' ? 'pt-[72px]' : 'pt-[104px]'"
    >
      <!-- 语言切换器 -->
      <div class="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      <!-- 返回按钮（班级码登录、体验账号、忘记密码） -->
      <button 
        v-if="
          loginType === 'classcode' ||
          loginType === 'trial' ||
          loginType === 'forgotPassword'
        "
        @click="loginType = 'campus'"
        class="absolute top-10 left-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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
      </button>
      <!-- 登录方式切换 -->
      <LoginTabs 
        v-if="
          loginType !== 'classcode' &&
          loginType !== 'trial' &&
          loginType !== 'forgotPassword'
        "
        v-model="loginType"
      />
      <!-- 班级码登录标题（固定高度，与 LoginTabs 高度一致） -->
      <div
        v-if="loginType === 'classcode'"
        class="h-[72px] flex items-center justify-center mb-8"
      >
        <p class="text-gray-500 text-sm">{{ t('auth.classCodePasswordTip') }}</p>
      </div>
      <!-- 体验账号无需标题，直接显示表单 -->
      <!-- <div v-if="loginType === 'trial'" class="h-[20px]"></div> -->
      <!-- 表单内容 -->
      <div
        v-if="loginType !== 'trial' && loginType !== 'forgotPassword'"
        class="relative h-[190px] flex flex-col"
      >
        <Transition name="slide-fade" mode="out-in">
          <!-- 校园账号登录表单 -->
          <CampusLoginForm
            v-if="loginType === 'campus'"
            key="campus"
            v-model:model-value="campusForm"
            v-model:errors="campusErrors"
            @forgot-password="loginType = 'forgotPassword'"
          />
          <!-- 手机号登录表单 -->
          <PhoneLoginForm
            v-else-if="loginType === 'phonenumber'"
            key="phonenumber"
            v-model:model-value="phoneForm"
            v-model:errors="phoneErrors"
            @send-smsCode="sendCode"
            @toggle-password-login="togglePasswordLogin"
          />
          <!-- 班级码登录表单 -->
          <ClassCodeLoginForm
            v-else-if="loginType === 'classcode'"
            key="classcode"
            v-model:model-value="classCodeForm"
            v-model:errors="classCodeErrors"
            @back="loginType = 'campus'"
          />
        </Transition>
      </div>
      <!-- 体验账号申请表单 -->
      <div v-else-if="loginType === 'trial'" class="flex-1 min-h-0 overflow-y-auto pr-1">
        <TrialAccountForm 
          ref="trialFormRef"
          @submit="handleTrialSubmit"
        />
      </div>
      <!-- 登录/提交按钮（除了忘记密码外都显示） -->
      <client-only v-if="loginType !== 'forgotPassword'">
        <button
          class="w-full py-3 bg-[#FFA54D] border border-solid border-gray-300 rounded-[40px] text-white text-base font-medium cursor-pointer transition-colors shrink-0"
          :class="isTrialMode ? 'mt-4 mb-4' : 'mt-4'"
          @click="handleLogin"
        >
          {{ isTrialMode ? t('auth.submit') : t('auth.login') }}
        </button>
      </client-only>
      <!-- 协议勾选（除了忘记密码和体验账号外都显示） -->
      <AgreementCheckbox
        v-if="loginType !== 'forgotPassword' && loginType !== 'trial'"
        v-model="agreed"
        @show-agreement="showAgreementModal = true"
        @show-privacy="showPrivacyModal = true"
      />
      <!-- 忘记密码表单 -->
      <div
        v-else-if="loginType === 'forgotPassword'"
        class="flex-1 overflow-auto"
      >
        <ForgotPasswordForm 
          @submit="handleForgotPasswordSubmit"
          @back="loginType = 'campus'"
        />
      </div>
      <!-- 测试账号提示（仅手机号登录时显示） -->
      <!-- <div
        v-if="loginType === 'phonenumber'"
        class="mb-4 p-3 bg-blue-50 rounded text-xs text-blue-600"
      >
        <div class="font-medium mb-1">📱 测试账号（验证码统一为: 123456）</div>
        <div>• 手机尾号 <strong>1</strong> → 市区管理员</div>
        <div>• 手机尾号 <strong>2</strong> → 学校管理员</div>
        <div>• 手机尾号 <strong>3</strong> → 老师</div>
        <div>• 手机尾号 <strong>4</strong> → 学生</div>
      </div> -->
      <!-- 底部其他登录方式 -->
      <OtherLoginOptions 
        v-if="
          loginType !== 'classcode' &&
          loginType !== 'trial' &&
          loginType !== 'forgotPassword'
        "
        @classcode-login="loginType = 'classcode'"
        @apply-account="handleApplyAccount"
      />
    </div>

    <!-- 协议未勾选提示弹窗 -->
    <Modal 
      v-model="showAgreementRequiredModal"
      :title="t('auth.tips')"
      @confirm="handleAgreementConfirm"
      @cancel="showAgreementRequiredModal = false"
    >
      <div class="text-center">
        <p>{{ t('auth.agreementTip') }}</p>
      </div>
    </Modal>
  </div>
  
  <!-- 班级码登录学生选择弹窗 -->
  <ClassCodeStudentModal
    v-model:visible="showStudentModal"
    :student-list="studentList"
    @select="handleSelectStudent"
  />
</template>
<script setup lang="ts">
import { ref, watch, nextTick, computed } from "vue";
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
// 根据登录状态动态切换布局（跳转时不切换）
// 只在客户端执行，避免 hydration 错误
if (import.meta.client) {
  watch(
    isAuthenticated,
    (authenticated) => {
      if (!isNavigating.value) {
        setPageLayout(authenticated ? "default" : "auth");
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
const loginType = ref<
  "campus" | "phonenumber" | "classcode" | "trial" | "forgotPassword"
>("campus");
const isTrialMode = computed(() => loginType.value === "trial");
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
</script>
<style scoped>
/* Tab 切换动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
  transform: translateX(10px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>
