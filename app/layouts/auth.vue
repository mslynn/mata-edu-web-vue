<template>
  <div class="h-screen flex flex-col bg-[#FAFAFA] font-sans overflow-hidden">
    <!-- 登录页专用顶部导航栏 -->
    <header class="flex justify-between items-center pl-6 md:pl-[115px] bg-[#FF9921] h-[70px] flex-shrink-0">
      <div class="flex items-baseline gap-1">
        <img :src="currentLogo" alt="Logo" class="w-[220px] h-[37px] object-contain" />
      </div>
    </header>

    <!-- 页面内容插槽 - 垂直居中 -->
    <main class="flex-1 flex justify-center items-center w-full max-w-[1000px] mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import logo from '~/assets/images/logo.png'
import logoEn from '~/assets/images/logo_en.png'

const config = useRuntimeConfig()
const { locale } = useI18n()

const currentLogo = computed(() => {
  return locale.value === 'en' ? logoEn : logo
})

console.log(config.public.apiBaseUrl) // http://localhost:3001/api or api.yourdomain.com
</script>
  
