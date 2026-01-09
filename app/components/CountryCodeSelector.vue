<template>
  <div class="country-code-selector" @click="toggleDropdown">
    <span class="country-code-display">+{{ selectedCountry.code }}</span>
    <span class="dropdown-arrow" :class="{ open: showDropdown }">▼</span>
    <Transition name="dropdown">
      <div v-if="showDropdown" class="country-dropdown" @click.stop>
        <!-- 搜索框 -->
        <div class="country-search">
          <input 
            v-model="searchKeyword"
            type="text"
            :placeholder="t('auth.searchCountry')"
            class="country-search-input"
            @click.stop
          />
        </div>
        <!-- 国家列表 -->
        <div class="country-list">
          <div 
            v-for="country in filteredCountries" 
            :key="country.code"
            class="country-option"
            :class="{ active: selectedCountry.code === country.code }"
            @click.stop="selectCountry(country)"
          >
            <img :src="`https://flagcdn.com/w20/${country.flagCode}.png`" :alt="country.name" class="country-flag-img" />
            <span class="country-name">{{ country.name }}</span>
            <span class="country-code-text">+{{ country.code }}</span>
          </div>
          <div v-if="filteredCountries.length === 0" class="country-empty">
            {{ t('common.noData') }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 定义国家类型
export interface Country {
  code: string
  name: string
  flagCode: string // ISO 3166-1 alpha-2 国家代码（小写）
  regex: RegExp // 手机号验证正则
  example: string // 示例号码
  minLength: number
  maxLength: number
}

interface Props {
  modelValue?: string // 区号，如 '86'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '86'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [country: Country]
}>()

const showDropdown = ref(false)
const searchKeyword = ref('')

// 完整的国家/地区列表（按常用程度排序）
const countries: Country[] = [
  // 中国及港澳台
  { code: '86', name: '中国大陆', flagCode: 'cn', regex: /^1[3-9]\d{9}$/, example: '13812345678', minLength: 11, maxLength: 11 },
  { code: '852', name: '中国香港', flagCode: 'hk', regex: /^[2-9]\d{7}$/, example: '91234567', minLength: 8, maxLength: 8 },
  { code: '853', name: '中国澳门', flagCode: 'mo', regex: /^6\d{7}$/, example: '62345678', minLength: 8, maxLength: 8 },
  { code: '886', name: '中国台湾', flagCode: 'cn', regex: /^9\d{8}$/, example: '912345678', minLength: 9, maxLength: 9 },
  
  // 亚洲
  { code: '81', name: '日本', flagCode: 'jp', regex: /^[789]0\d{8}$/, example: '9012345678', minLength: 10, maxLength: 11 },
  { code: '82', name: '韩国', flagCode: 'kr', regex: /^1[0-9]\d{7,8}$/, example: '1012345678', minLength: 9, maxLength: 10 },
  { code: '65', name: '新加坡', flagCode: 'sg', regex: /^[89]\d{7}$/, example: '81234567', minLength: 8, maxLength: 8 },
  { code: '60', name: '马来西亚', flagCode: 'my', regex: /^1\d{8,9}$/, example: '123456789', minLength: 9, maxLength: 10 },
  { code: '66', name: '泰国', flagCode: 'th', regex: /^[689]\d{8}$/, example: '812345678', minLength: 9, maxLength: 9 },
  { code: '84', name: '越南', flagCode: 'vn', regex: /^[35789]\d{8}$/, example: '912345678', minLength: 9, maxLength: 10 },
  { code: '62', name: '印度尼西亚', flagCode: 'id', regex: /^8\d{8,11}$/, example: '81234567890', minLength: 9, maxLength: 12 },
  { code: '63', name: '菲律宾', flagCode: 'ph', regex: /^9\d{9}$/, example: '9123456789', minLength: 10, maxLength: 10 },
  { code: '91', name: '印度', flagCode: 'in', regex: /^[6-9]\d{9}$/, example: '9123456789', minLength: 10, maxLength: 10 },
  { code: '92', name: '巴基斯坦', flagCode: 'pk', regex: /^3\d{9}$/, example: '3001234567', minLength: 10, maxLength: 10 },
  { code: '880', name: '孟加拉国', flagCode: 'bd', regex: /^1[3-9]\d{8}$/, example: '1712345678', minLength: 10, maxLength: 10 },
  { code: '94', name: '斯里兰卡', flagCode: 'lk', regex: /^7\d{8}$/, example: '712345678', minLength: 9, maxLength: 9 },
  { code: '95', name: '缅甸', flagCode: 'mm', regex: /^9\d{8,9}$/, example: '912345678', minLength: 9, maxLength: 10 },
  { code: '855', name: '柬埔寨', flagCode: 'kh', regex: /^[1-9]\d{7,8}$/, example: '12345678', minLength: 8, maxLength: 9 },
  { code: '856', name: '老挝', flagCode: 'la', regex: /^20\d{7,8}$/, example: '2012345678', minLength: 9, maxLength: 10 },
  { code: '977', name: '尼泊尔', flagCode: 'np', regex: /^9[78]\d{8}$/, example: '9812345678', minLength: 10, maxLength: 10 },
  
  // 中东
  { code: '971', name: '阿联酋', flagCode: 'ae', regex: /^5[0-9]\d{7}$/, example: '501234567', minLength: 9, maxLength: 9 },
  { code: '966', name: '沙特阿拉伯', flagCode: 'sa', regex: /^5\d{8}$/, example: '512345678', minLength: 9, maxLength: 9 },
  { code: '972', name: '以色列', flagCode: 'il', regex: /^5\d{8}$/, example: '512345678', minLength: 9, maxLength: 9 },
  { code: '90', name: '土耳其', flagCode: 'tr', regex: /^5\d{9}$/, example: '5012345678', minLength: 10, maxLength: 10 },
  { code: '98', name: '伊朗', flagCode: 'ir', regex: /^9\d{9}$/, example: '9123456789', minLength: 10, maxLength: 10 },
  { code: '974', name: '卡塔尔', flagCode: 'qa', regex: /^[3567]\d{7}$/, example: '33123456', minLength: 8, maxLength: 8 },
  { code: '965', name: '科威特', flagCode: 'kw', regex: /^[569]\d{7}$/, example: '51234567', minLength: 8, maxLength: 8 },
  { code: '973', name: '巴林', flagCode: 'bh', regex: /^[3679]\d{7}$/, example: '31234567', minLength: 8, maxLength: 8 },
  { code: '968', name: '阿曼', flagCode: 'om', regex: /^[79]\d{7}$/, example: '91234567', minLength: 8, maxLength: 8 },
  
  // 北美
  { code: '1', name: '美国/加拿大', flagCode: 'us', regex: /^[2-9]\d{9}$/, example: '2012345678', minLength: 10, maxLength: 10 },
  { code: '52', name: '墨西哥', flagCode: 'mx', regex: /^[1-9]\d{9}$/, example: '1234567890', minLength: 10, maxLength: 10 },
  
  // 欧洲
  { code: '44', name: '英国', flagCode: 'gb', regex: /^7\d{9}$/, example: '7123456789', minLength: 10, maxLength: 10 },
  { code: '49', name: '德国', flagCode: 'de', regex: /^1[567]\d{8,9}$/, example: '15123456789', minLength: 10, maxLength: 11 },
  { code: '33', name: '法国', flagCode: 'fr', regex: /^[67]\d{8}$/, example: '612345678', minLength: 9, maxLength: 9 },
  { code: '39', name: '意大利', flagCode: 'it', regex: /^3\d{8,9}$/, example: '3123456789', minLength: 9, maxLength: 10 },
  { code: '34', name: '西班牙', flagCode: 'es', regex: /^[67]\d{8}$/, example: '612345678', minLength: 9, maxLength: 9 },
  { code: '351', name: '葡萄牙', flagCode: 'pt', regex: /^9[1236]\d{7}$/, example: '912345678', minLength: 9, maxLength: 9 },
  { code: '31', name: '荷兰', flagCode: 'nl', regex: /^6\d{8}$/, example: '612345678', minLength: 9, maxLength: 9 },
  { code: '32', name: '比利时', flagCode: 'be', regex: /^4[5-9]\d{7}$/, example: '470123456', minLength: 9, maxLength: 9 },
  { code: '41', name: '瑞士', flagCode: 'ch', regex: /^7[5-9]\d{7}$/, example: '761234567', minLength: 9, maxLength: 9 },
  { code: '43', name: '奥地利', flagCode: 'at', regex: /^6[5-7]\d{7,10}$/, example: '6641234567', minLength: 9, maxLength: 12 },
  { code: '46', name: '瑞典', flagCode: 'se', regex: /^7\d{8}$/, example: '701234567', minLength: 9, maxLength: 9 },
  { code: '47', name: '挪威', flagCode: 'no', regex: /^[49]\d{7}$/, example: '41234567', minLength: 8, maxLength: 8 },
  { code: '45', name: '丹麦', flagCode: 'dk', regex: /^[2-9]\d{7}$/, example: '21234567', minLength: 8, maxLength: 8 },
  { code: '358', name: '芬兰', flagCode: 'fi', regex: /^[45]\d{8,9}$/, example: '401234567', minLength: 9, maxLength: 10 },
  { code: '48', name: '波兰', flagCode: 'pl', regex: /^[5-8]\d{8}$/, example: '512345678', minLength: 9, maxLength: 9 },
  { code: '420', name: '捷克', flagCode: 'cz', regex: /^[67]\d{8}$/, example: '601234567', minLength: 9, maxLength: 9 },
  { code: '36', name: '匈牙利', flagCode: 'hu', regex: /^[237]\d{8}$/, example: '201234567', minLength: 9, maxLength: 9 },
  { code: '30', name: '希腊', flagCode: 'gr', regex: /^6[89]\d{8}$/, example: '6912345678', minLength: 10, maxLength: 10 },
  { code: '7', name: '俄罗斯', flagCode: 'ru', regex: /^9\d{9}$/, example: '9123456789', minLength: 10, maxLength: 10 },
  { code: '380', name: '乌克兰', flagCode: 'ua', regex: /^[3-9]\d{8}$/, example: '501234567', minLength: 9, maxLength: 9 },
  { code: '353', name: '爱尔兰', flagCode: 'ie', regex: /^8[35-9]\d{7}$/, example: '851234567', minLength: 9, maxLength: 9 },
  
  // 大洋洲
  { code: '61', name: '澳大利亚', flagCode: 'au', regex: /^4\d{8}$/, example: '412345678', minLength: 9, maxLength: 9 },
  { code: '64', name: '新西兰', flagCode: 'nz', regex: /^2[0-9]\d{7,8}$/, example: '211234567', minLength: 9, maxLength: 10 },
  
  // 南美
  { code: '55', name: '巴西', flagCode: 'br', regex: /^[1-9]\d{10}$/, example: '11912345678', minLength: 11, maxLength: 11 },
  { code: '54', name: '阿根廷', flagCode: 'ar', regex: /^[1-9]\d{9}$/, example: '1123456789', minLength: 10, maxLength: 10 },
  { code: '56', name: '智利', flagCode: 'cl', regex: /^9\d{8}$/, example: '912345678', minLength: 9, maxLength: 9 },
  { code: '57', name: '哥伦比亚', flagCode: 'co', regex: /^3\d{9}$/, example: '3012345678', minLength: 10, maxLength: 10 },
  { code: '51', name: '秘鲁', flagCode: 'pe', regex: /^9\d{8}$/, example: '912345678', minLength: 9, maxLength: 9 },
  
  // 非洲
  { code: '27', name: '南非', flagCode: 'za', regex: /^[6-8]\d{8}$/, example: '612345678', minLength: 9, maxLength: 9 },
  { code: '20', name: '埃及', flagCode: 'eg', regex: /^1[0125]\d{8}$/, example: '1012345678', minLength: 10, maxLength: 10 },
  { code: '234', name: '尼日利亚', flagCode: 'ng', regex: /^[789]\d{9}$/, example: '8012345678', minLength: 10, maxLength: 10 },
  { code: '254', name: '肯尼亚', flagCode: 'ke', regex: /^7\d{8}$/, example: '712345678', minLength: 9, maxLength: 9 },
  { code: '212', name: '摩洛哥', flagCode: 'ma', regex: /^[67]\d{8}$/, example: '612345678', minLength: 9, maxLength: 9 },
]

// 根据 modelValue 找到对应的国家
const findCountryByCode = (code: string): Country => {
  return countries.find(c => c.code === code) || countries[0]
}

const selectedCountry = ref<Country>(findCountryByCode(props.modelValue))

// 过滤后的国家列表
const filteredCountries = computed(() => {
  if (!searchKeyword.value.trim()) return countries
  const keyword = searchKeyword.value.toLowerCase().trim()
  return countries.filter(c => 
    c.name.toLowerCase().includes(keyword) || 
    c.code.includes(keyword)
  )
})

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newCode) => {
  selectedCountry.value = findCountryByCode(newCode)
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    searchKeyword.value = ''
  }
}

const selectCountry = (country: Country) => {
  selectedCountry.value = country
  showDropdown.value = false
  searchKeyword.value = ''
  emit('update:modelValue', country.code)
  emit('change', country)
}

// 点击外部关闭下拉
const closeDropdown = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.country-code-selector')) {
    showDropdown.value = false
  }
}

// 挂载时添加点击监听
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

// 暴露方法给父组件
defineExpose({
  selectedCountry,
  countries,
  // 验证手机号
  validatePhone: (phone: string): { valid: boolean; message: string } => {
    const country = selectedCountry.value
    const cleanPhone = phone.replace(/\s/g, '')
    
    if (!cleanPhone) {
      return { valid: false, message: 'auth.pleaseInputPhone' }
    }
    
    if (cleanPhone.length < country.minLength || cleanPhone.length > country.maxLength) {
      return { 
        valid: false, 
        message: 'auth.phoneErrorLength'
      }
    }
    
    if (!country.regex.test(cleanPhone)) {
      return { 
        valid: false, 
        message: 'auth.phoneErrorFormat'
      }
    }
    
    return { valid: true, message: '' }
  }
})
</script>

<style scoped>
.country-code-selector {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.country-code-display {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 8px;
  color: #999;
  margin-left: 4px;
  transition: transform 0.2s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.country-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: -16px;
  min-width: 280px;
  max-height: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid #f0f0f0;
  z-index: 9999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.country-search {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.country-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.country-search-input:focus {
  border-color: #FF9900;
}

.country-search-input::placeholder {
  color: #ccc;
}

.country-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.country-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.15s ease;
}

.country-option:hover {
  background: #FFF8F0;
}

.country-option.active {
  background: linear-gradient(135deg, #FFF4E6 0%, #FFECDA 100%);
  color: #FF9900;
}

.country-flag-img {
  width: 20px;
  height: 14px;
  object-fit: cover;
  border-radius: 2px;
}

.country-name {
  flex: 1;
}

.country-code-text {
  color: #999;
  font-size: 13px;
}

.country-option.active .country-code-text {
  color: #FF9900;
}

.country-empty {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 自定义滚动条 */
.country-list::-webkit-scrollbar {
  width: 4px;
}

.country-list::-webkit-scrollbar-track {
  background: transparent;
}

.country-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.country-list::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
