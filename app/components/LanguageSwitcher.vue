<template>
  <div class="lang-switcher" ref="switcherRef">
    <button class="lang-btn" @click="toggleDropdown">
      <svg class="lang-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      <span class="lang-text">{{ currentLangName }}</span>
      <svg class="arrow-icon" :class="{ 'rotate': showDropdown }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </button>
    
    <Transition name="fade">
      <div v-if="showDropdown" class="lang-dropdown">
        <div 
          v-for="loc in availableLocales" 
          :key="loc.code"
          class="lang-option"
          :class="{ 'active': loc.code === currentLocale }"
          @click="selectLocale(loc.code)"
        >
          <span class="option-text">{{ loc.name }}</span>
          <svg v-if="loc.code === currentLocale" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const showDropdown = ref(false)
const switcherRef = ref<HTMLElement | null>(null)

const availableLocales = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' }
]

const currentLocale = computed(() => locale.value)

const currentLangName = computed(() => {
  const current = availableLocales.find(l => l.code === locale.value)
  return current?.name || locale.value
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectLocale = (code: string) => {
  locale.value = code
  // 保存到 localStorage，供 HTTP 请求使用
  if (process.client) {
    localStorage.setItem('app_locale', code)
  }
  showDropdown.value = false
}

// 初始化时从 localStorage 读取
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 恢复上次选择的语言
  if (process.client) {
    const savedLocale = localStorage.getItem('app_locale')
    if (savedLocale && (savedLocale === 'zh' || savedLocale === 'en')) {
      locale.value = savedLocale
    }
  }
})

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (switcherRef.value && !switcherRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.lang-switcher {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.lang-icon {
  width: 18px;
  height: 18px;
}

.lang-text {
  font-weight: 500;
}

.arrow-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 120px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
}

.lang-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.lang-option:hover {
  background: #FFF7E6;
}

.lang-option.active {
  background: #FFF7E6;
}

.option-text {
  font-size: 14px;
  color: #333;
}

.lang-option.active .option-text {
  color: #FF9900;
  font-weight: 500;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #FF9900;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
