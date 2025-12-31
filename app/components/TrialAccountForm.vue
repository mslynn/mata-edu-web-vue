<template>
  <div class="trial-account-form">
    <!-- 标题 -->
    <h2 class="text-center text-base text-[#808080] mb-2">{{ t('auth.welcomeApplyTrial') }}</h2>

    <!-- 姓名 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.name && 'has-error']">
        <img src="~/assets/images/account.png" alt="name" class="form-icon" />
        <input 
          v-model="formData.name"
          type="text" 
          :placeholder="t('auth.name')"
          class="form-input"
          @input="clearError('name')"
        />
      </div>
      <p v-if="errors.name" class="error-msg">{{ errors.name }}</p>
    </div>

    <!-- 手机号 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.phonenumber && 'has-error']">
        <img src="~/assets/images/tel.png" alt="phone" class="form-icon" />
        <CountryCodeSelector v-model="countryCode" class="mr-3" />
        <input 
          v-model="formData.phonenumber"
          type="tel" 
          :placeholder="t('auth.pleaseInputPhone')"
          class="form-input"
          @input="clearError('phonenumber')"
        />
      </div>
      <p v-if="errors.phonenumber" class="error-msg">{{ errors.phonenumber }}</p>
    </div>

    <!-- 验证码 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.smsCode && 'has-error']">
        <img src="~/assets/images/code.png" alt="code" class="form-icon" />
        <input 
          v-model="formData.smsCode"
          type="text" 
          :placeholder="t('auth.pleaseInputCode')"
          class="form-input"
          @input="clearError('smsCode')"
        />
        <button 
          class="send-code-btn"
          :class="{ 'is-counting': countdown > 0 }"
          :disabled="countdown > 0" 
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}s` : t('auth.sendCode') }}
        </button>
      </div>
      <p v-if="errors.smsCode" class="error-msg">{{ errors.smsCode }}</p>
    </div>

    <!-- 企业/学校名称 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.organizationName && 'has-error']">
        <img src="~/assets/images/apply.png" alt="organization" class="form-icon" />
        <input 
          v-model="formData.organizationName"
          type="text" 
          :placeholder="t('auth.organizationName')"
          class="form-input"
          @input="clearError('organizationName')"
        />
      </div>
      <p v-if="errors.organizationName" class="error-msg">{{ errors.organizationName }}</p>
    </div>

    <!-- 体验目的（多选） -->
    <div class="form-item">
      <div :class="['form-select-wrap', errors.purposes && 'has-error']">
        <span class="select-label">{{ t('auth.purpose') }}</span>
        <el-select
          v-model="formData.purposes"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :placeholder="t('auth.pleaseSelect')"
          class="el-select-custom"
          :class="{ 'is-error': errors.purposes }"
          @change="clearError('purposes')"
        >
          <el-option
            v-for="item in purposeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <p v-if="errors.purposes" class="error-msg">{{ errors.purposes }}</p>
    </div>

    <!-- 感兴趣产品（多选） -->
    <div class="form-item">
      <div :class="['form-select-wrap', errors.products && 'has-error']">
        <span class="select-label">{{ t('auth.interestedProducts') }}</span>
        <el-select
          v-model="formData.products"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :placeholder="t('auth.pleaseSelect')"
          class="el-select-custom"
          :class="{ 'is-error': errors.products }"
          @change="clearError('products')"
        >
          <el-option
            v-for="item in productOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <p v-if="errors.products" class="error-msg">{{ errors.products }}</p>
    </div>

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
const purposeOptions = computed(() => [
  { value: '校企合作', label: t('auth.purposeTeaching') },
  { value: '企业合作', label: t('auth.purposeResearch') },
  { value: '机构采购', label: t('auth.purposePersonalStudy') },
  { value: '个人学习', label: t('auth.purposeEnterpriseTrain') },
  { value: '其他', label: t('auth.purposeOther') }
])

// 感兴趣产品选项
const productOptions = computed(() => [
  { value: 'Coding Set', label: t('auth.productNous') },
  { value: 'Talebot Pro', label: t('auth.productMatatalab') },
  { value: 'VinciBot', label: t('auth.productRobot') },
  { value: 'Nous AI Set', label: t('auth.productSmartClass') },
  { value: '显微镜系列', label: t('auth.productMicroscope') },
  { value: '望远镜系列', label: t('auth.productTelescope') },
  { value: '其他', label: t('auth.productOther') }
])

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
    errors.phonenumber = t('auth.pleaseInputPhone')
    return
  }
  
  if (!validatePhone(phonenumber)) {
    if (countryCode.value === '86') {
      errors.phonenumber = t('auth.phoneError11')
    } else if (countryCode.value === '852') {
      errors.phonenumber = t('auth.phoneError8')
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
    errors.phonenumber = error?.data?.msg || error?.message || t('auth.codeSendFailed')
  }
}


const handleSubmit = () => {
  let hasError = false
  
  if (!formData.name.trim()) {
    errors.name = t('auth.pleaseInputName')
    hasError = true
  }
  
  if (!formData.phonenumber.trim()) {
    errors.phonenumber = t('auth.pleaseInputPhone')
    hasError = true
  } else if (!validatePhone(formData.phonenumber.trim())) {
    if (countryCode.value === '86') {
      errors.phonenumber = t('auth.phoneError11')
    } else {
      errors.phonenumber = t('auth.phoneError8')
    }
    hasError = true
  }
  
  if (!formData.smsCode.trim()) {
    errors.smsCode = t('auth.pleaseInputCode')
    hasError = true
  }
  
  if (!formData.organizationName.trim()) {
    errors.organizationName = t('auth.pleaseInputOrganization')
    hasError = true
  }
  
  if (formData.purposes.length === 0) {
    errors.purposes = t('auth.pleaseSelectPurpose')
    hasError = true
  }
  
  if (formData.products.length === 0) {
    errors.products = t('auth.pleaseSelectProducts')
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

