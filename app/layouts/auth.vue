<template>
  <div class="h-screen flex flex-col bg-[#FAFAFA] font-sans overflow-hidden">
    <!-- 登录页专用顶部导航栏 -->
    <header class="flex justify-between items-center pl-6 md:pl-[115px] bg-[#FF9900] h-[70px] flex-shrink-0">
      <div class="flex items-baseline gap-1">
        <img src="~/assets/images/logo.png" alt="Logo" class="w-[220px] h-[37px] object-contain" />
      </div>
    </header>

    <!-- 页面内容插槽 - 垂直居中 -->
    <main class="flex-1 flex justify-center items-center w-full max-w-[1000px] mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
  const config = useRuntimeConfig()
  console.log(config.public.apiBaseUrl) // http://localhost:3001/api or api.yourdomain.com
  </script>
  
