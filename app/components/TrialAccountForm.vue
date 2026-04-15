<template>
  <div class="trial-account-form">
    <!-- 标题 -->
    <h2 class="text-center text-base text-[#808080] mb-2">
      {{ t("auth.welcomeApplyTrial") }}
    </h2>

    <!-- 姓名 -->
    <div class="form-item">
      <div :class="['form-input-wrap', errors.name && 'has-error']">
        <img src="~/assets/images/account.png" alt="name" class="form-icon" />
        <input
          v-model="formData.name"
          type="text"
          maxlength="10"
          :placeholder="t('auth.name')"
          class="form-input"
          @input="handleNameInput"
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
          inputmode="numeric"
          :maxlength="phoneMaxLength"
          :placeholder="t('auth.pleaseInputPhone')"
          class="form-input"
          @input="handlePhoneInput"
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
          inputmode="numeric"
          maxlength="6"
          :placeholder="t('auth.pleaseInputCode')"
          class="form-input"
          @input="handleSmsCodeInput"
        />
        <button
          type="button"
          class="send-code-btn trial-send-code-btn"
          :class="{ 'is-counting': countdown > 0 }"
          :disabled="countdown > 0 || isSendingCode"
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}s` : t("auth.sendCode") }}
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
          maxlength="20"
          :placeholder="t('auth.organizationName')"
          class="form-input"
          @input="handleOrganizationNameInput"
        />
      </div>
      <p v-if="errors.organizationName" class="error-msg">
        {{ errors.organizationName }}
      </p>
    </div>

    <!-- 体验目的（多选） -->
    <div class="form-item">
      <div :class="['form-select-wrap', errors.purposes && 'has-error']">
        <span class="select-label">{{ t("auth.purpose") }}</span>
        <el-select
          v-model="formData.purposes"
          multiple
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
        <span class="select-label">{{ t("auth.interestedProducts") }}</span>
        <el-select
          v-model="formData.products"
          multiple
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

    <CloudflareTurnstileDialog
      v-model="showTurnstileDialog"
      :site-key="turnstileSiteKey"
      @success="handleTurnstileSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { useAuth } from "~/composables/api/useAuth";

const { $i18n } = useNuxtApp();
const t = (key: string) => $i18n.t(key);

const { getSmsCode } = useAuth();
const turnstileSiteKey = String(useRuntimeConfig().public.turnstileSiteKey || "");

const emit = defineEmits<{
  submit: [data: typeof formData];
}>();

const countryCode = ref("86");
const countdown = ref(0);
const phoneMaxLength = computed(() => (countryCode.value === "852" ? 8 : 11));
const showTurnstileDialog = ref(false);
const isSendingCode = ref(false);
const pendingSmsPhone = ref("");

const formData = reactive({
  name: "",
  phonenumber: "",
  smsCode: "",
  organizationName: "",
  purposes: [] as string[], // 多选，初始化为空
  products: [] as string[], // 多选，初始化为空
});

const errors = reactive({
  name: "",
  phonenumber: "",
  smsCode: "",
  organizationName: "",
  purposes: "",
  products: "",
});

// 体验目的选项
const purposeOptions = computed(() => [
  { value: "校企合作", label: t("auth.purposeTeaching") },
  { value: "企业合作", label: t("auth.purposeResearch") },
  { value: "机构采购", label: t("auth.purposePersonalStudy") },
  { value: "个人学习", label: t("auth.purposeEnterpriseTrain") },
  { value: "其他", label: t("auth.purposeOther") },
]);

// 感兴趣产品选项
const productOptions = computed(() => [
  { value: "Coding Set", label: t("auth.productNous") },
  { value: "Talebot Pro", label: t("auth.productMatatalab") },
  { value: "VinciBot", label: t("auth.productRobot") },
  { value: "Nous AI Set", label: t("auth.productSmartClass") },
  { value: "显微镜系列", label: t("auth.productMicroscope") },
  { value: "望远镜系列", label: t("auth.productTelescope") },
  { value: "其他", label: t("auth.productOther") },
]);

const clearError = (field: keyof typeof errors) => {
  errors[field] = "";
};

const setFieldError = (field: keyof typeof errors, message: string) => {
  errors[field] = message;
};

const handleNameInput = () => {
  formData.name = formData.name.slice(0, 10);
  clearError("name");
};

const handlePhoneInput = () => {
  formData.phonenumber = formData.phonenumber
    .replace(/\D/g, "")
    .slice(0, phoneMaxLength.value);
  clearError("phonenumber");
};

const handleOrganizationNameInput = () => {
  formData.organizationName = formData.organizationName.slice(0, 20);
  clearError("organizationName");
};

const handleSmsCodeInput = () => {
  formData.smsCode = formData.smsCode.replace(/\D/g, "").slice(0, 6);
  clearError("smsCode");
};

// 校验手机号格式
const validatePhone = (phonenumber: string): boolean => {
  if (countryCode.value === "86") {
    return /^1[3-9]\d{9}$/.test(phonenumber);
  } else if (countryCode.value === "852") {
    return /^[569]\d{7}$/.test(phonenumber);
  }
  return false;
};

const startCountdown = () => {
  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const handleSendCode = async () => {
  if (countdown.value > 0 || isSendingCode.value) return;

  const phonenumber = formData.phonenumber.trim();

  if (!phonenumber) {
    errors.phonenumber = t("auth.pleaseInputPhone");
    return;
  }

  if (!validatePhone(phonenumber)) {
    if (countryCode.value === "86") {
      errors.phonenumber = t("auth.phoneError11");
    } else if (countryCode.value === "852") {
      errors.phonenumber = t("auth.phoneError8");
    }
    return;
  }

  errors.phonenumber = "";

  if (!turnstileSiteKey) {
    ElMessage.warning(t("auth.turnstileSiteKeyMissing"));
    return;
  }

  pendingSmsPhone.value = phonenumber;
  showTurnstileDialog.value = true;
};

const handleTurnstileSuccess = async (turnstileToken: string) => {
  const phonenumber = pendingSmsPhone.value || formData.phonenumber.trim();

  if (!phonenumber || isSendingCode.value) {
    showTurnstileDialog.value = false;
    return;
  }

  showTurnstileDialog.value = false;
  isSendingCode.value = true;

  try {
    const response = await getSmsCode(phonenumber, turnstileToken);

    if (response?.code !== 200) {
      errors.phonenumber = response?.msg || t("auth.codeSendFailed");
      return;
    }

    ElMessage.success(t("auth.codeSendSuccess"));
    startCountdown();
  } catch (error: any) {
    errors.phonenumber =
      error?.data?.msg || error?.message || t("auth.codeSendFailed");
  } finally {
    isSendingCode.value = false;
    pendingSmsPhone.value = "";
  }
};

const handleSubmit = () => {
  let hasError = false;
  const name = formData.name.trim();
  const organizationName = formData.organizationName.trim();

  if (!name) {
    errors.name = t("auth.pleaseInputName");
    hasError = true;
  } else if (name.length > 10) {
    errors.name = t("auth.nameLengthLimit");
    hasError = true;
  }

  if (!formData.phonenumber.trim()) {
    errors.phonenumber = t("auth.pleaseInputPhone");
    hasError = true;
  } else if (!validatePhone(formData.phonenumber.trim())) {
    if (countryCode.value === "86") {
      errors.phonenumber = t("auth.phoneError11");
    } else {
      errors.phonenumber = t("auth.phoneError8");
    }
    hasError = true;
  }

  if (!formData.smsCode.trim()) {
    errors.smsCode = t("auth.pleaseInputCode");
    hasError = true;
  }

  if (!organizationName) {
    errors.organizationName = t("auth.pleaseInputOrganization");
    hasError = true;
  } else if (organizationName.length > 20) {
    errors.organizationName = t("auth.organizationLengthLimit");
    hasError = true;
  }

  if (formData.purposes.length === 0) {
    errors.purposes = t("auth.pleaseSelectPurpose");
    hasError = true;
  }

  if (formData.products.length === 0) {
    errors.products = t("auth.pleaseSelectProducts");
    hasError = true;
  }

  if (hasError) return;

  emit("submit", {
    ...formData,
    name,
    organizationName,
  });
};

// 暴露方法给父组件调用
defineExpose({
  handleSubmit,
  setFieldError,
});
</script>

<!-- 样式已移至 assets/css/main.css 避免SSR闪烁 -->
