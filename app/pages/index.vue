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
  <div v-else class="flex bg-white rounded-lg border border-dashed border-gray-300 overflow-hidden h-[600px] w-full max-w-[1000px]">
    <!-- 左侧插图 -->
    <div class="p-[33px]">
      <img src="~/assets/images/bg.png" alt="背景插图" class="object-contain" />
    </div>

    <!-- 右侧登录表单 -->
    <div class="flex-1 pt-[104px] px-10 flex flex-col relative">
      <!-- 返回按钮（班级码登录、体验账号、忘记密码） -->
      <button 
        v-if="loginType === 'classcode' || loginType === 'trial' || loginType === 'forgotPassword'"
        @click="loginType = 'campus'"
        class="absolute top-10 left-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <!-- 登录方式切换 -->
      <LoginTabs 
        v-if="loginType !== 'classcode' && loginType !== 'trial' && loginType !== 'forgotPassword'"
        v-model="loginType"
      />

      <!-- 班级码登录标题（固定高度，与 LoginTabs 高度一致） -->
      <div v-if="loginType === 'classcode'" class="h-[72px] flex items-center justify-center mb-8">
        <p class="text-gray-500 text-sm">请输入班级码和密码</p>
      </div>

      <!-- 体验账号无需标题，直接显示表单 -->
      <!-- <div v-if="loginType === 'trial'" class="h-[20px]"></div> -->

      <!-- 登录消息提示 -->
      <div v-if="loginMessage" class="mb-4 p-3 rounded text-sm" :class="{
        'bg-green-50 text-green-600': loginMessageType === 'success',
        'bg-red-50 text-red-600': loginMessageType === 'error',
        'bg-blue-50 text-blue-600': loginMessageType === 'info'
      }">
        {{ loginMessage }}
      </div>

      <!-- 表单内容 -->
      <div v-if="loginType !== 'trial' && loginType !== 'forgotPassword'" class="relative h-[280px] flex flex-col">
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
            v-else-if="loginType === 'phone'"
            key="phone"
            v-model:model-value="phoneForm"
            v-model:errors="phoneErrors"
            @send-code="sendCode"
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

        <!-- 登录按钮 -->
        <button 
          class="w-full py-3 bg-[#FFA54D] border border-solid border-gray-300 rounded-[40px] text-white text-base font-medium cursor-pointer transition-colors "
          @click="handleLogin"
        >
          登录
        </button>

        <!-- 协议勾选 -->
        <AgreementCheckbox 
          v-model="agreed"
          @show-agreement="showAgreementModal = true"
          @show-privacy="showPrivacyModal = true"
        />
      </div>

      <!-- 体验账号申请表单 -->
      <div v-else-if="loginType === 'trial'" class="flex-1 overflow-auto">
        <TrialAccountForm 
          @submit="handleTrialSubmit"
          @send-code="handleTrialSendCode"
        />
      </div>

      <!-- 忘记密码表单 -->
      <div v-else-if="loginType === 'forgotPassword'" class="flex-1 overflow-auto">
        <ForgotPasswordForm 
          @submit="handleForgotPasswordSubmit"
          @back="loginType = 'campus'"
        />
      </div>

      <!-- 测试账号提示（仅手机号登录时显示） -->
      <div v-if="loginType === 'phone'" class="mb-4 p-3 bg-blue-50 rounded text-xs text-blue-600">
        <div class="font-medium mb-1">📱 测试账号（验证码统一为: 123456）</div>
        <div>• 手机尾号 <strong>1</strong> → 市区管理员</div>
        <div>• 手机尾号 <strong>2</strong> → 学校管理员</div>
        <div>• 手机尾号 <strong>3</strong> → 老师</div>
        <div>• 手机尾号 <strong>4</strong> → 学生</div>
      </div>

      <!-- 底部其他登录方式 -->
      <OtherLoginOptions 
        v-if="loginType !== 'classcode' && loginType !== 'trial' && loginType !== 'forgotPassword'"
        @classcode-login="loginType = 'classcode'"
        @apply-account="handleApplyAccount"
      />
      
    </div>

   

    <!-- 协议未勾选提示弹窗 -->
    <Modal 
      v-model="showAgreementRequiredModal"
      title="提示"
      @confirm="handleAgreementConfirm"
      @cancel="showAgreementRequiredModal = false"
    >
      <div class="text-center">
        <p>我已阅读同意用户协议，隐私协议。</p>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const { isAuthenticated, login, loginByPhone, sendVerificationCode, getRedirectPath, userInfo, logout } = useAuth()

// 登录页也阻止返回
const { allowNavigation } = usePreventBack()

// 登录消息提示
const loginMessage = ref('')
const loginMessageType = ref<'success' | 'error' | 'info'>('info')

// 是否正在跳转（防止布局闪烁）
const isNavigating = ref(false)

// 根据登录状态动态切换布局（跳转时不切换）
// 只在客户端执行，避免 hydration 错误
if (import.meta.client) {
  watch(isAuthenticated, (authenticated) => {
    if (!isNavigating.value) {
      setPageLayout(authenticated ? 'default' : 'auth')
    }
  }, { immediate: true })
}

// 默认使用 auth 布局
definePageMeta({
  layout: 'auth'
})

const loginType = ref<'campus' | 'phone' | 'classcode' | 'trial' | 'forgotPassword'>('campus')
const agreed = ref(false)
const countdown = ref(0)
const showAgreementRequiredModal = ref(false)
const showAgreementModal = ref(false)
const showPrivacyModal = ref(false)

// 校园账号表单数据
const campusForm = ref({
  account: '',
  password: ''
})

const campusErrors = ref({
  account: false,
  password: false
})

// 手机号表单数据
const phoneForm = ref({
  phone: '',
  code: ''
})

const phoneErrors = ref({
  phone: false,
  code: false
})

// 班级码表单数据
const classCodeForm = ref({
  classCode: '',
  classPassword: ''
})

const classCodeErrors = ref({
  classCode: false,
  classPassword: false
})

// 重置表单函数
const resetForm = () => {
  campusForm.value = { account: '', password: '' }
  campusErrors.value = { account: false, password: false }
  phoneForm.value = { phone: '', code: '' }
  phoneErrors.value = { phone: false, code: false }
  classCodeForm.value = { classCode: '', classPassword: '' }
  classCodeErrors.value = { classCode: false, classPassword: false }
}

// 监听登录方式切换，重置表单和消息
watch(loginType, () => {
  resetForm()
  loginMessage.value = ''
})

const sendCode = async () => {
  if (countdown.value > 0) return
  if (!phoneForm.value.phone) {
    loginMessage.value = '请输入手机号'
    loginMessageType.value = 'error'
    return
  }
  
  const result = await sendVerificationCode(phoneForm.value.phone)
  loginMessage.value = result.message
  loginMessageType.value = result.success ? 'info' : 'error'
  
  if (result.success) {
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }
}

const togglePasswordLogin = () => {
  loginType.value = 'campus'
}

const handleApplyAccount = () => {
  loginType.value = 'trial'
}

const handleLogin = async () => {
  if (!agreed.value) {
    showAgreementRequiredModal.value = true
    return
  }
  console.log('loginType', loginType.value)
  
  if (loginType.value === 'campus') {
    // 校园账号登录
    campusErrors.value.account = false
    campusErrors.value.password = false
    
    if (!campusForm.value.account || !campusForm.value.password) {
      if (!campusForm.value.account) campusErrors.value.account = true
      if (!campusForm.value.password) campusErrors.value.password = true
      return
    }
    try {
      isNavigating.value = true
      await login({ account: campusForm.value.account, password: campusForm.value.password })
      allowNavigation()  // 允许跳转
      window.location.replace(getRedirectPath())
    } catch (error) {
      isNavigating.value = false
      alert('登录失败，请重试')
    }
  } else if (loginType.value === 'phone') {
    // 手机号登录
    phoneErrors.value.phone = false
    phoneErrors.value.code = false
    
    if (!phoneForm.value.phone || !phoneForm.value.code) {
      if (!phoneForm.value.phone) phoneErrors.value.phone = true
      if (!phoneForm.value.code) phoneErrors.value.code = true
      return
    }
    try {
      // 设置跳转标志，防止布局闪烁
      isNavigating.value = true
      const result = await loginByPhone(phoneForm.value.phone, phoneForm.value.code)
      if (result.success) {
        // 登录成功，允许跳转并使用 window.location.replace 彻底清空历史记录
        allowNavigation()
        const targetPath = getRedirectPath()
        window.location.replace(targetPath)
      } else {
        isNavigating.value = false
        loginMessage.value = result.message
        loginMessageType.value = 'error'
      }
    } catch (error) {
      isNavigating.value = false
      loginMessage.value = '登录失败，请重试'
      loginMessageType.value = 'error'
    }
  } else if (loginType.value === 'classcode') {
    // 班级码登录
    classCodeErrors.value.classCode = false
    classCodeErrors.value.classPassword = false
    
    if (!classCodeForm.value.classCode || !classCodeForm.value.classPassword) {
      if (!classCodeForm.value.classCode) classCodeErrors.value.classCode = true
      if (!classCodeForm.value.classPassword) classCodeErrors.value.classPassword = true
      return
    }
    try {
      isNavigating.value = true
      await login({ classCode: classCodeForm.value.classCode, classPassword: classCodeForm.value.classPassword })
      allowNavigation()  // 允许跳转
      window.location.replace(getRedirectPath())
    } catch (error) {
      isNavigating.value = false
      alert('登录失败，请重试')
    }
  }
}

const handleLogout = () => {
  logout()
}

// 体验账号提交
const handleTrialSubmit = async (data: any) => {
  console.log('体验账号申请数据:', data)
  // TODO: 调用申请API
  alert('申请已提交，我们会尽快审核！')
  loginType.value = 'campus'
}

// 体验账号发送验证码
const handleTrialSendCode = (phone: string, countryCode: string) => {
  console.log('发送验证码到:', countryCode, phone)
  // TODO: 调用发送验证码API
}

// 忘记密码提交
const handleForgotPasswordSubmit = async (data: any) => {
  console.log('重置密码数据:', data)
  // TODO: 调用重置密码API
  alert('密码重置成功！')
  loginType.value = 'campus'
}

const handleAgreementConfirm = () => {
  agreed.value = true
  showAgreementRequiredModal.value = false
}


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
