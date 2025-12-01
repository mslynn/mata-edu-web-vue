<template>
  <div class="h-full flex flex-col login-form">
    <!-- 账号输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white',
        errors.account && 'has-error'
      ]">
        <img src="~/assets/images/account.png" alt="账号" class="mr-3  w-5 h-5" />
        <input 
          type="text" 
          :value="modelValue.account"
          @input="handleInput('account', $event)"
          placeholder="请输入账号"
          class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
        />
      </div>
      <p v-if="errors.account" class="field-error">请输入账号</p>
    </div>

    <!-- 密码输入 -->
    <div class="form-field">
      <div :class="[
        'flex items-center input-line px-4 py-3 bg-white relative',
        errors.password && 'has-error'
      ]">
        <img src="~/assets/images/mima.png" alt="密码" class="mr-3  w-5 h-5" />
        <input 
          :type="showPassword ? 'text' : 'password'"
          :value="modelValue.password"
          @input="handleInput('password', $event)"
          placeholder="请输入密码"
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
            alt="显示密码" 
            class="w-4 h-4"
          />
          <img 
            v-else 
            src="~/assets/images/eye-close.png" 
            alt="隐藏密码" 
            class="w-4 h-4"
          />
        </button>
      </div>
      <p v-if="errors.password" class="field-error">请输入密码</p>
    </div>

    <!-- 忘记密码链接 -->
    <div class="text-right mb-6">
      <a href="#" class="text-gray-400 text-xs hover:text-[#e8a063] no-underline" @click.prevent="emit('forgot-password')">忘记密码</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: {
    account: string
    password: string
  }
  errors: {
    account: boolean
    password: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: { account: string; password: string }]
  'update:errors': [value: { account: boolean; password: boolean }]
  'forgot-password': []
}>()

const showPassword = ref(false)

const handleInput = (field: 'account' | 'password', event: Event) => {
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

