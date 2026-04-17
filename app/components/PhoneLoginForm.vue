<template>
  <div class="h-full flex flex-col login-form">
    <!-- 手机号输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.phone && 'has-error'
      ]">
        <img src="~/assets/images/tel.png" alt="phone" class="w-5 h-5 mr-3" />
        <CountryCodeSelector 
          v-model="countryCode" 
          ref="countryCodeSelectorRef"
          @change="handleCountryChange" 
          class="mr-3"
        />
        <input 
          type="tel" 
          inputmode="numeric"
          :maxlength="phoneMaxLength"
          :value="modelValue.phone"
          @input="handleInput('phone', $event)"
          :placeholder="t('auth.pleaseInputPhone')"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
      </div>
      <p v-if="errors.phone" class="field-error">{{ phoneErrorMsg }}</p>
    </div>

    <!-- 验证码输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.code && 'has-error'
      ]">
        <img src="~/assets/images/code.png" alt="code" class="w-5 h-5 mr-3" />
        <input 
          type="text" 
          inputmode="numeric"
          maxlength="6"
          :value="modelValue.code"
          @input="handleInput('code', $event)"
          :placeholder="t('auth.pleaseInputCode')"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
        <button 
          class="send-code-btn"
          :class="[
            { 'is-counting': countdown > 0 },
            'bg-primary text-white'
          ]"
          :disabled="countdown > 0 || isSendingCode" 
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}${t('auth.resendAfter')}` : t('auth.getCode') }}
        </button>
      </div>
      <p v-if="errors.code" class="field-error">{{ t('auth.pleaseInputCode') }}</p>
    </div>

    <!-- 密码登录链接 - 右对齐，和上面按钮对齐 -->
    <div class="text-right mb-6 px-4">
      <a href="#" class="text-gray-400 text-xs hover:text-[#e8a063] no-underline" @click.prevent="handleTogglePasswordLogin">{{ t('auth.passwordLogin') }}</a>
    </div>

    <CloudflareTurnstileDialog
      v-model="showTurnstileDialog"
      :site-key="turnstileSiteKey"
      @success="handleTurnstileSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Country } from './CountryCodeSelector.vue'
import { useAuth } from '~/composables/api/useAuth'

const { $i18n } = useNuxtApp()
const t = (key: string) => $i18n.t(key)
const { getSmsCode, getSmsErrorMessage } = useAuth();
const turnstileSiteKey = String(useRuntimeConfig().public.turnstileSiteKey || '')

interface Props {
  modelValue: {
    phone: string
    code: string
  }
  errors: {
    phone: boolean
    code: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: { phone: string; code: string }]
  'update:errors': [value: { phone: boolean; code: boolean }]
  'send-code': []
  'toggle-password-login': []
  'update:countryCode': [value: string | null]
}>()

const countdown = ref(0)
const phoneErrorMsg = ref(t('auth.pleaseInputPhone'))
const countryCode = ref('86') // 默认中国大陆
const phoneMaxLength = ref(11)
const countryCodeSelectorRef = ref<InstanceType<typeof import('./CountryCodeSelector.vue').default> | null>(null)
const showTurnstileDialog = ref(false)
const isSendingCode = ref(false)
const pendingSmsPhone = ref('')
const verifiedTurnstileToken = ref('')
const verifiedSmsPhone = ref('')

const clearVerifiedTurnstile = () => {
  verifiedTurnstileToken.value = ''
  verifiedSmsPhone.value = ''
}

const handleCountryChange = (country: Country) => {
  clearVerifiedTurnstile()
  phoneMaxLength.value = country.maxLength
  // 区号切换后，同步截断已输入手机号
  const trimmedPhone = (props.modelValue.phone || '').replace(/\D/g, '').slice(0, phoneMaxLength.value)
  if (trimmedPhone !== props.modelValue.phone) {
    emit('update:modelValue', {
      ...props.modelValue,
      phone: trimmedPhone
    })
  }
  emit('update:countryCode', country.code)
}

const handleInput = (field: 'phone' | 'code', event: Event) => {
  const rawValue = (event.target as HTMLInputElement).value
  const value = field === 'phone'
    ? rawValue.replace(/\D/g, '').slice(0, phoneMaxLength.value)
    : rawValue.replace(/\D/g, '').slice(0, 6)

  if (field === 'phone') {
    clearVerifiedTurnstile()
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
  // 清除错误状态
  if (props.errors[field]) {
    emit('update:errors', {
      ...props.errors,
      [field]: false
    })
  }
}

// 校验手机号格式 - 使用 CountryCodeSelector 的验证方法
const validatePhone = (phone: string): { valid: boolean; message: string } => {
  if (countryCodeSelectorRef.value?.validatePhone) {
    return countryCodeSelectorRef.value.validatePhone(phone)
  }
  // 降级处理
  if (!phone) {
    return { valid: false, message: 'auth.pleaseInputPhone' }
  }
  return { valid: true, message: '' }
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendSmsCode = async (phone: string, turnstileToken: string) => {
  isSendingCode.value = true

  try {
    const response = await getSmsCode(phone, turnstileToken)

    if (response?.code !== 200) {
      phoneErrorMsg.value = getSmsErrorMessage(response?.msg)
      emit('update:errors', { ...props.errors, phone: true })
      return
    }

    ElMessage.success(t('auth.codeSendSuccess'))
    emit('send-code')
    startCountdown()
  } catch (error: any) {
    phoneErrorMsg.value = getSmsErrorMessage(error?.data?.msg || error?.message)
    emit('update:errors', { ...props.errors, phone: true })
  } finally {
    isSendingCode.value = false
    pendingSmsPhone.value = ''
    clearVerifiedTurnstile()
  }
}

const handleSendCode = async () => {
  if (countdown.value > 0 || isSendingCode.value) return
  
  const phone = props.modelValue.phone.trim()
  
  // 使用统一的验证方法
  const validation = validatePhone(phone)
  if (!validation.valid) {
    phoneErrorMsg.value = t(validation.message)
    emit('update:errors', { ...props.errors, phone: true })
    return
  }
  
  // 清除手机号错误状态
  emit('update:errors', { ...props.errors, phone: false })

  if (!turnstileSiteKey) {
    ElMessage.warning(t('auth.turnstileSiteKeyMissing'))
    return
  }

  if (verifiedTurnstileToken.value && verifiedSmsPhone.value === phone) {
    await sendSmsCode(phone, verifiedTurnstileToken.value)
    return
  }

  pendingSmsPhone.value = phone
  showTurnstileDialog.value = true
}

const handleTurnstileSuccess = async (turnstileToken: string) => {
  const phone = pendingSmsPhone.value || props.modelValue.phone.trim()

  if (!phone) {
    showTurnstileDialog.value = false
    return
  }

  verifiedTurnstileToken.value = turnstileToken
  verifiedSmsPhone.value = phone
  showTurnstileDialog.value = false
  pendingSmsPhone.value = ''
  phoneErrorMsg.value = ''
  emit('update:errors', { ...props.errors, phone: false })
  ElMessage.success(t('auth.turnstileReadyToSend'))
}

const handleTogglePasswordLogin = () => {
  emit('toggle-password-login')
}
</script>

<!-- 样式已移至 assets/css/main.css 避免SSR闪烁 -->

