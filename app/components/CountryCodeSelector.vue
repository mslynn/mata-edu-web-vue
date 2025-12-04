<template>
  <div class="country-code-selector" @click="toggleDropdown">
    <span class="country-code-display">+{{ selectedCountry.code }}</span>
    <span class="dropdown-arrow" :class="{ open: showDropdown }">▼</span>
    <Transition name="dropdown">
      <div v-if="showDropdown" class="country-dropdown">
        <div 
          v-for="(country, index) in countries" 
          :key="country.code"
          class="country-option"
          :class="{ active: selectedCountry.code === country.code }"
          :style="{ animationDelay: `${index * 0.05}s` }"
          @click.stop="selectCountry(country)"
        >
          +{{ country.code }} {{ country.name }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

// 定义国家类型
export interface Country {
  code: string
  name: string
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

// 支持的国家/地区
const countries: Country[] = [
  { code: '86', name: '中国大陆' },
  { code: '852', name: '中国香港' }
]

// 根据 modelValue 找到对应的国家
const findCountryByCode = (code: string): Country => {
  return countries.find(c => c.code === code) || countries[0]
}

const selectedCountry = ref<Country>(findCountryByCode(props.modelValue))

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newCode) => {
  selectedCountry.value = findCountryByCode(newCode)
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectCountry = (country: Country) => {
  selectedCountry.value = country
  showDropdown.value = false
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
  countries
})
</script>

<!-- 样式在 assets/css/main.css 中定义 -->

