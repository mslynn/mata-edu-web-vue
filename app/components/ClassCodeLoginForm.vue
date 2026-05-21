<template>
  <div class="h-full flex flex-col login-form">
      <!-- 班级码输入 -->
      <div class="form-field">
        <label class="form-field-label">班级码</label>
        <div :class="[
          'flex items-center input-line px-4 py-3 bg-white',
          errors.classCode && 'has-error'
        ]">
          <img src="~/assets/images/classcode.png" alt="class code" class="w-5 h-5 mr-3" />
          <input 
            type="text" 
            :value="modelValue.classCode"
            @input="handleInput('classCode', $event)"
            :placeholder="t('auth.pleaseInputClassCode')"
            class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
          />
        </div>
        <p v-if="errors.classCode" class="field-error">{{ t('auth.pleaseInputClassCode') }}</p>
      </div>

      <!-- 密码输入 -->
      <div class="form-field">
        <label class="form-field-label">{{ t('auth.password') }}</label>
        <div :class="[
          'flex items-center input-line px-4 py-3 bg-white relative',
          errors.classPassword && 'has-error'
        ]">
          <img src="~/assets/images/mima.png" :alt="t('auth.password')" class="w-5 h-5 mr-3" />
          <input 
            :type="showPassword ? 'text' : 'password'"
            :value="modelValue.classPassword"
            minlength="6"
            maxlength="30"
            @input="handleInput('classPassword', $event)"
            :placeholder="t('auth.pleaseInputPassword')"
            class="flex-1 border-none outline-none text-sm text-[#808080] placeholder-[#CCCCCC] bg-transparent"
          />
          <button 
            type="button"
            @click="showPassword = !showPassword"
            class="ml-2  hover:opacity-100 transition-opacity"
          >
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
        <p v-if="errors.classPassword" class="field-error">{{ t('auth.pleaseInputPassword') }}</p>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const { $i18n } = useNuxtApp()
const t = (key: string) => $i18n.t(key)

interface Props {
  modelValue: {
    classCode: string
    classPassword: string
  }
  errors: {
    classCode: boolean
    classPassword: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: { classCode: string; classPassword: string }]
  'update:errors': [value: { classCode: boolean; classPassword: boolean }]
  'back': []
}>()

const showPassword = ref(false)

const handleInput = (field: 'classCode' | 'classPassword', event: Event) => {
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

