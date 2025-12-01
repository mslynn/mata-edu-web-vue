<template>
  <div class="h-full flex flex-col login-form">
    <!-- 手机号输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.phone && 'has-error'
      ]">
        <img src="~/assets/images/tel.png" alt="手机" class="w-5 h-5 mr-3" />
        <CountryCodeSelector 
          v-model="countryCode" 
          ref="countryCodeSelectorRef"
          @change="handleCountryChange" 
          class="mr-3"
        />
        <input 
          type="tel" 
          :value="modelValue.phone"
          @input="handleInput('phone', $event)"
          placeholder="请输入手机号"
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
        <img src="~/assets/images/code.png" alt="验证码" class="w-5 h-5 mr-3" />
        <input 
          type="text" 
          :value="modelValue.code"
          @input="handleInput('code', $event)"
          placeholder="请输入验证码"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
        <button 
          class="send-code-btn"
          :class="{ 'is-counting': countdown > 0 }"
          :disabled="countdown > 0" 
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
        </button>
      </div>
      <p v-if="errors.code" class="field-error">请输入验证码</p>
    </div>

    <!-- 密码登录链接 - 右对齐，和上面按钮对齐 -->
    <div class="text-right mb-6 px-4">
      <a href="#" class="text-gray-400 text-xs hover:text-[#e8a063] no-underline" @click.prevent="handleTogglePasswordLogin">密码登录</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Country } from './CountryCodeSelector.vue'

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
const phoneErrorMsg = ref('请输入手机号')
const countryCode = ref('86') // 默认中国大陆
const countryCodeSelectorRef = ref<InstanceType<typeof import('./CountryCodeSelector.vue').default> | null>(null)

// 获取当前选中的国家信息
const getSelectedCountry = (): Country => {
  return countryCodeSelectorRef.value?.selectedCountry || { code: '86', name: '中国大陆' }
}

const handleCountryChange = (country: Country) => {
  emit('update:countryCode', country.code)
}

const handleInput = (field: 'phone' | 'code', event: Event) => {
  const value = (event.target as HTMLInputElement).value
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

// 校验手机号格式
const validatePhone = (phone: string): boolean => {
  const selectedCountry = getSelectedCountry()
  if (selectedCountry.code === '86') {
    // 中国大陆：11位，1开头，第二位3-9
    return /^1[3-9]\d{9}$/.test(phone)
  } else if (selectedCountry.code === '852') {
    // 香港：8位数字，以5/6/9开头
    return /^[569]\d{7}$/.test(phone)
  }
  return false
}

const handleSendCode = () => {
  if (countdown.value > 0) return
  
  const phone = props.modelValue.phone.trim()
  const selectedCountry = getSelectedCountry()
  
  // 校验手机号是否为空
  if (!phone) {
    phoneErrorMsg.value = '请输入手机号'
    emit('update:errors', { ...props.errors, phone: true })
    return
  }
  
  // 校验手机号格式
  if (!validatePhone(phone)) {
    if (selectedCountry.code === '86') {
      phoneErrorMsg.value = '请输入正确的11位手机号'
    } else if (selectedCountry.code === '852') {
      phoneErrorMsg.value = '请输入正确的8位香港手机号'
    } else {
      phoneErrorMsg.value = '请输入正确的手机号'
    }
    emit('update:errors', { ...props.errors, phone: true })
    return
  }
  
  // 清除手机号错误状态
  emit('update:errors', { ...props.errors, phone: false })
  
  // 发送验证码
  emit('send-code')
  
  // 开始60s倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleTogglePasswordLogin = () => {
  emit('toggle-password-login')
}
</script>

<!-- 样式已移至 assets/css/main.css 避免SSR闪烁 -->

