<template>
  <div class="language-switcher" @click="toggleLang">
    <div class="globe-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </div>
    <span class="lang-text">{{ locale === 'zh' ? '中文' : 'English' }}</span>
    <div class="arrow-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
    
    <!-- 下拉菜单 -->
    <Transition name="dropdown">
      <div v-if="showDropdown" class="dropdown-menu" @click.stop>
        <div 
          class="dropdown-item" 
          :class="{ active: locale === 'zh' }"
          @click="switchLang('zh')"
        >
          <span class="flag">🇨🇳</span>
          <span>中文</span>
          <svg v-if="locale === 'zh'" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div 
          class="dropdown-item"
          :class="{ active: locale === 'en' }"
          @click="switchLang('en')"
        >
          <span class="flag">🇺🇸</span>
          <span>English</span>
          <svg v-if="locale === 'en'" class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { $i18n } = useNuxtApp()
const locale = computed({
  get: () => $i18n.locale.value,
  set: (val) => { $i18n.locale.value = val }
})

const showDropdown = ref(false)

const toggleLang = () => {
  showDropdown.value = !showDropdown.value
}

const switchLang = (lang: string) => {
  locale.value = lang
  showDropdown.value = false
  localStorage.setItem('locale', lang)
}

// 点击外部关闭
const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.language-switcher')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && ['zh', 'en'].includes(savedLocale)) {
    locale.value = savedLocale
  }
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #fff;
  border-radius: 24px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  user-select: none;
}

.language-switcher:hover {
  border-color: #0f67ff;
  box-shadow: 0 4px 12px rgba(15, 103, 255, 0.12);
}

.globe-icon {
  width: 18px;
  height: 18px;
  color: #0f67ff;
  flex-shrink: 0;
}

.globe-icon svg {
  width: 100%;
  height: 100%;
}

.lang-text {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.arrow-icon {
  width: 14px;
  height: 14px;
  color: #999;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.arrow-icon svg {
  width: 100%;
  height: 100%;
}

.language-switcher:hover .arrow-icon {
  color: #0f67ff;
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  padding: 6px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
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

.dropdown-item:hover {
  background: #f4f8ff;
}

.dropdown-item.active {
  background: linear-gradient(135deg, #edf4ff 0%, #dceaff 100%);
  color: #0f67ff;
  font-weight: 500;
}

.flag {
  font-size: 18px;
  line-height: 1;
}

.check-icon {
  width: 16px;
  height: 16px;
  margin-left: auto;
  color: #0f67ff;
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
</style>
