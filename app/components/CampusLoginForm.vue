<template>
  <div class="h-full flex flex-col login-form">
    <!-- 账号输入 -->
    <div class="form-field">
      <label class="form-field-label">{{ t('auth.username') }}</label>
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.username && 'has-error'
      ]">
        <img src="~/assets/images/account.png" :alt="t('auth.username')" class="mr-3  w-5 h-5" />
        <input 
          type="text" 
          :value="modelValue.username"
          minlength="6"
          maxlength="30"
          @input="handleInput('username', $event)"
          :placeholder="t('auth.pleaseInputAccount')"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
      </div>
      <p v-if="errors.username" class="field-error">{{ t('auth.pleaseInputAccount') }}</p>
    </div>

    <!-- 密码输入 -->
    <div class="form-field">
      <label class="form-field-label">{{ t('auth.password') }}</label>
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white relative',
        errors.password && 'has-error'
      ]">
        <img src="~/assets/images/mima.png" :alt="t('auth.password')" class="mr-3  w-5 h-5" />
        <input 
          :type="showPassword ? 'text' : 'password'"
          :value="modelValue.password"
          minlength="6"
          maxlength="30"
          @input="handleInput('password', $event)"
          :placeholder="t('auth.pleaseInputPassword')"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
        <button 
          type="button"
          @click="showPassword = !showPassword"
          class="ml-2 hover:opacity-100 transition-opacity"
        >
          <img 
            v-if="showPassword" 
            src="~/assets/images/eye-open.png" 
            alt="show password" 
            class="w-4 h-4"
          />
          <img 
            v-else 
            src="~/assets/images/eye-close.png" 
            alt="hide password" 
            class="w-4 h-4"
          />
        </button>
      </div>
      <p v-if="errors.password" class="field-error">{{ t('auth.pleaseInputPassword') }}</p>
    </div>

    <!-- 忘记密码链接 -->
    <div class="text-right mb-6">
      <a href="#" class="text-gray-400 text-xs hover:text-[#0f67ff] no-underline" @click.prevent="emit('forgot-password')">{{ t('auth.forgotPassword') }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { $i18n } = useNuxtApp()
const t = (key: string) => $i18n.t(key)

interface Props {
  modelValue: {
    username: string
    password: string
  }
  errors: {
    username: boolean
    password: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: { username: string; password: string }]
  'update:errors': [value: { username: boolean; password: boolean }]
  'forgot-password': []
}>()

const showPassword = ref(false)

const handleInput = (field: 'username' | 'password', event: Event) => {
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
</script>

