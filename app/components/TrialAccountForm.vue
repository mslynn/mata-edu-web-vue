<template>
  <div class="trial-account-form">
    <!-- 标题 -->
    <h2 class="text-center text-base text-[#808080] mb-2">欢迎申请开通玛塔智慧教育平台</h2>

    <!-- 姓名 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.name && 'has-error']">
        <img src="~/assets/images/account.png" alt="姓名" class="form-icon" />
        <input 
          v-model="formData.name"
          type="text" 
          placeholder="姓名"
          class="form-input"
          @input="clearError('name')"
        />
      </div>
      <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
    </div>

    <!-- 手机号 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.phonenumber && 'has-error']">
        <img src="~/assets/images/tel.png" alt="手机" class="form-icon" />
        <CountryCodeSelector v-model="countryCode" class="mr-3" />
        <input 
          v-model="formData.phonenumber"
          type="tel" 
          placeholder="请输入手机号"
          class="form-input"
          @input="clearError('phonenumber')"
        />
      </div>
      <p v-if="errors.phonenumber" class="error-msg">{{ errors.phonenumber }}</p>
    </div>

    <!-- 验证码 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.smsCode && 'has-error']">
        <img src="~/assets/images/code.png" alt="验证码" class="form-icon" />
        <input 
          v-model="formData.smsCode"
          type="text" 
          placeholder="请输入验证码"
          class="form-input"
          @input="clearError('smsCode')"
        />
        <button 
          class="send-code-btn"
          :class="{ 'is-counting': countdown > 0 }"
          :disabled="countdown > 0" 
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
        </button>
      </div>
      <p v-if="errors.smsCode" class="error-msg">{{ errors.smsCode }}</p>
    </div>

    <!-- 企业/学校名称 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.organizationName && 'has-error']">
        <img src="~/assets/images/apply.png" alt="企业" class="form-icon" />
        <input 
          v-model="formData.organizationName"
          type="text" 
          placeholder="企业/学校名称"
          class="form-input"
          @input="clearError('organizationName')"
        />
      </div>
      <p v-if="errors.organizationName" class="error-msg">{{ errors.organizationName }}</p>
    </div>

    <!-- 体验目的（多选） -->
    <div class="form-item">
      <div :class="['form-select-wrap', errors.purposes && 'has-error']">
        <span class="select-label">体验目的</span>
        <el-select
          v-model="formData.purposes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择"
          class="el-select-custom"
          :class="{ 'is-error': errors.purposes }"
          @change="clearError('purposes')"
        >
          <el-option
            v-for="item in purposeOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </div>
      <p v-if="errors.purposes" class="error-msg">{{ errors.purposes }}</p>
    </div>

    <!-- 感兴趣产品（多选） -->
    <div class="form-item">
      <div :class="['form-select-wrap', errors.products && 'has-error']">
        <span class="select-label">感兴趣产品</span>
        <el-select
          v-model="formData.products"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择"
          class="el-select-custom"
          :class="{ 'is-error': errors.products }"
          @change="clearError('products')"
        >
          <el-option
            v-for="item in productOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </div>
      <p v-if="errors.products" class="error-msg">{{ errors.products }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '~/composables/api/useAuth'

const { getSmsCode } = useAuth()

const emit = defineEmits<{
  'submit': [data: typeof formData]
}>()

const countryCode = ref('86')
const countdown = ref(0)

const formData = reactive({
  name: '',
  phonenumber: '',
  smsCode: '',
  organizationName: '',
  purposes: [] as string[],   // 多选，初始化为空
  products: [] as string[]    // 多选，初始化为空
})

const errors = reactive({
  name: '',
  phonenumber: '',
  smsCode: '',
  organizationName: '',
  purposes: '',
  products: ''
})

// 体验目的选项
const purposeOptions = ['教学', '科研', '个人学习', '企业培训', '其他']

// 感兴趣产品选项
const productOptions = ['nous', 'matatalab', '编程机器人', '智慧课堂', '其他']

const clearError = (field: keyof typeof errors) => {
  errors[field] = ''
}

// 校验手机号格式
const validatePhone = (phonenumber: string): boolean => {
  if (countryCode.value === '86') {
    return /^1[3-9]\d{9}$/.test(phonenumber)
  } else if (countryCode.value === '852') {
    return /^[569]\d{7}$/.test(phonenumber)
  }
  return false
}

const handleSendCode = async () => {
  if (countdown.value > 0) return
  
  const phonenumber = formData.phonenumber.trim()
  
  if (!phonenumber) {
    errors.phonenumber = '请输入手机号'
    return
  }
  
  if (!validatePhone(phonenumber)) {
    if (countryCode.value === '86') {
      errors.phonenumber = '请输入正确的11位手机号'
    } else if (countryCode.value === '852') {
      errors.phonenumber = '请输入正确的8位香港手机号'
    }
    return
  }
  
  errors.phonenumber = ''
  
  try {
    // 调用获取验证码接口
    console.log('📤 申请体验账号-发送验证码:', phonenumber)
    await getSmsCode(phonenumber)
    console.log('✅ 验证码发送成功')
    
    // 开始倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  } catch (error: any) {
    console.error('❌ 验证码发送失败:', error)
    errors.phonenumber = error?.data?.msg || error?.message || '验证码发送失败'
  }
}


const handleSubmit = () => {
  let hasError = false
  
  if (!formData.name.trim()) {
    errors.name = '请输入姓名'
    hasError = true
  }
  
  if (!formData.phonenumber.trim()) {
    errors.phonenumber = '请输入手机号'
    hasError = true
  } else if (!validatePhone(formData.phonenumber.trim())) {
    if (countryCode.value === '86') {
      errors.phonenumber = '请输入正确的11位手机号'
    } else {
      errors.phonenumber = '请输入正确的8位香港手机号'
    }
    hasError = true
  }
  
  if (!formData.smsCode.trim()) {
    errors.smsCode = '请输入验证码'
    hasError = true
  }
  
  if (!formData.organizationName.trim()) {
    errors.organizationName = '请输入企业/学校名称'
    hasError = true
  }
  
  if (formData.purposes.length === 0) {
    errors.purposes = '请选择体验目的'
    hasError = true
  }
  
  if (formData.products.length === 0) {
    errors.products = '请选择感兴趣产品'
    hasError = true
  }
  
  if (hasError) return
  
  emit('submit', { ...formData })
}

// 暴露方法给父组件调用
defineExpose({
  handleSubmit
})
</script>

<!-- 样式已移至 assets/css/main.css 避免SSR闪烁 -->

