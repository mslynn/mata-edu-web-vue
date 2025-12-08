<template>
  <div class="min-h-screen bg-[#FAFAFA] font-sans">
    <!-- 登录页专用顶部导航栏 -->
    <header class="flex justify-between items-center pl-6 md:pl-[115px]  bg-[#FF9900] h-[70px]">
      <div class="flex items-baseline gap-1">
        <img src="~/assets/images/logo.png" alt="Logo" class="w-[220px] h-[37px] object-contain" />
      </div>
 
    </header>

    <!-- 页面内容插槽 -->
    <main class="flex justify-center items-center min-h-[400px] md:min-h-[600px] w-full max-w-[1000px] mx-auto px-4 mt-20 md:mt-[178px]">
      <slot />
    </main>
  </div>
</template>
