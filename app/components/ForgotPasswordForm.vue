<template>
  <div class="h-full flex flex-col login-form">
    <!-- 标题 -->
    <h2 class="text-center text-base text-[#808080] mb-6">{{ t('auth.resetPassword') }}</h2>

    <!-- 手机号输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.phone && 'has-error'
      ]">
        <img src="~/assets/images/tel.png" alt="phone" class="w-5 h-5 mr-3 opacity-50" />
        <CountryCodeSelector 
          v-model="countryCode" 
          class="mr-3"
        />
        <input 
          type="tel" 
          v-model="formData.phone"
          inputmode="numeric"
          :maxlength="phoneMaxLength"
          @input="handlePhoneInput"
          :placeholder="t('auth.pleaseInputPhone')"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
      </div>
      <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>
    </div>

    <!-- 验证码输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.code && 'has-error'
      ]">
        <img src="~/assets/images/code.png" alt="code" class="w-5 h-5 mr-3 opacity-50" />
        <input 
          type="text" 
          v-model="formData.code"
          inputmode="numeric"
          maxlength="6"
          @input="handleCodeInput"
          :placeholder="t('auth.pleaseInputCode')"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
        <button 
          class="send-code-btn"
          :class="{ 'is-counting': countdown > 0 }"
          :disabled="countdown > 0" 
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}${t('auth.resendAfter')}` : t('auth.sendCode') }}
        </button>
      </div>
      <p v-if="errors.code" class="field-error">{{ errors.code }}</p>
    </div>

    <!-- 新密码输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.password && 'has-error'
      ]">
        <img src="~/assets/images/mima.png" alt="password" class="w-5 h-5 mr-3 opacity-50" />
        <input 
          :type="showPassword ? 'text' : 'password'"
          v-model="formData.password"
          @input="clearError('password')"
          :placeholder="t('auth.newPassword')"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
        <button 
          type="button"
          @click="showPassword = !showPassword"
          class="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <img 
            v-if="showPassword" 
            src="~/assets/images/eye-open.png" 
            alt="show" 
            class="w-4 h-4"
          />
          <img 
            v-else 
            src="~/assets/images/eye-close.png" 
            alt="hide" 
            class="w-4 h-4"
          />
        </button>
      </div>
      <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
    </div>

    <!-- 确认新密码输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.confirmPassword && 'has-error'
      ]">
        <img src="~/assets/images/mima.png" alt="password" class="w-5 h-5 mr-3 opacity-50" />
        <input 
          :type="showConfirmPassword ? 'text' : 'password'"
          v-model="formData.confirmPassword"
          @input="clearError('confirmPassword')"
          :placeholder="t('auth.confirmNewPassword')"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
        <button 
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <img 
            v-if="showConfirmPassword" 
            src="~/assets/images/eye-open.png" 
            alt="show" 
            class="w-4 h-4"
          />
          <img 
            v-else 
            src="~/assets/images/eye-close.png" 
            alt="hide" 
            class="w-4 h-4"
          />
        </button>
      </div>
      <p v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</p>
    </div>

    <!-- 提交按钮 -->
    <button 
      class="w-full py-3 mt-4 bg-[#FFA54D] border border-solid border-gray-300 rounded-[40px] text-white text-base font-medium cursor-pointer transition-colors"
      @click="handleSubmit"
    >
      {{ t('auth.submit') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuth } from '~/composables/api/useAuth'

const { $i18n } = useNuxtApp()
const t = (key: string) => $i18n.t(key)

const { getSmsCode } = useAuth()

const emit = defineEmits<{
  'submit': [data: typeof formData]
  'back': []
}>()

const countryCode = ref('86')
const countdown = ref(0)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const phoneMaxLength = computed(() => (countryCode.value === '852' ? 8 : 11))

const formData = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const clearError = (field: keyof typeof errors) => {
  errors[field] = ''
}

const handlePhoneInput = () => {
  formData.phone = formData.phone.replace(/\D/g, '').slice(0, phoneMaxLength.value)
  clearError('phone')
}

const handleCodeInput = () => {
  formData.code = formData.code.replace(/\D/g, '').slice(0, 6)
  clearError('code')
}

// 校验手机号格式
const validatePhone = (phone: string): boolean => {
  if (countryCode.value === '86') {
    return /^1[3-9]\d{9}$/.test(phone)
  } else if (countryCode.value === '852') {
    return /^[569]\d{7}$/.test(phone)
  }
  return false
}

const handleSendCode = async () => {
  if (countdown.value > 0) return
  
  const phone = formData.phone.trim()
  
  if (!phone) {
    errors.phone = t('auth.pleaseInputPhone')
    return
  }
  
  if (!validatePhone(phone)) {
    if (countryCode.value === '86') {
      errors.phone = t('auth.phoneError11')
    } else if (countryCode.value === '852') {
      errors.phone = t('auth.phoneError8')
    }
    return
  }
  
  errors.phone = ''
  
  try {
    // 调用发送验证码接口
    console.log('📤 重置密码-发送验证码:', phone)
    await getSmsCode(phone)
    console.log('✅ 验证码发送成功')
    
    // 开始60s倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    console.error('❌ 验证码发送失败:', error)
    errors.phone = error?.data?.msg || error?.message || t('auth.codeSendFailed')
  }
}

const handleSubmit = () => {
  let hasError = false
  
  // 清除所有错误
  errors.phone = ''
  errors.code = ''
  errors.password = ''
  errors.confirmPassword = ''
  
  // 校验手机号
  if (!formData.phone.trim()) {
    errors.phone = t('auth.pleaseInputPhone')
    hasError = true
  } else if (!validatePhone(formData.phone.trim())) {
    if (countryCode.value === '86') {
      errors.phone = t('auth.phoneError11')
    } else {
      errors.phone = t('auth.phoneError8')
    }
    hasError = true
  }
  
  // 校验验证码
  if (!formData.code.trim()) {
    errors.code = t('auth.pleaseInputCode')
    hasError = true
  }
  
  // 校验新密码（8-16位，必须包含数字+大小写字母）
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,16}$/
  if (!formData.password.trim()) {
    errors.password = t('auth.newPassword')
    hasError = true
  } else if (!passwordRegex.test(formData.password)) {
    errors.password = t('auth.passwordRule')
    hasError = true
  }
  
  // 校验确认密码
  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = t('auth.confirmNewPassword')
    hasError = true
  } else if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = t('auth.passwordNotMatch')
    hasError = true
  }
  
  if (hasError) return
  
  emit('submit', { ...formData })
}
</script>

