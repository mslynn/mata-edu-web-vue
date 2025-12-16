<template>
  <div class="teacher-page flex justify-center bg-[#FAFAFA] px-[60px]">
    <!-- 公用左侧导航 -->
    <AppSidebar class="hidden lg:flex" />

    <!-- 主内容区 -->
    <div class="main-content flex flex-1 p-4 min-h-0">
      <!-- 左侧主内容 -->
      <section class="flex-1 min-w-0">
        <!-- 顶部三个授课卡片 - 居中，两边安全距离 -->
        <div class="top-cards flex gap-[45px] mb-[60px] justify-center mx-auto max-w-[900px]">
          <!-- 授课卡片1 -->
          <div class="flex flex-col items-center cursor-pointer group border-2 rounded-lg">
            <div class="card-img rounded-[20px] flex items-center justify-center transition-colors">
              <img src="~/assets/images/one.png" alt="授课" class="card-icon object-contain" />
            </div>
            <span class="mt-2 text-gray-600 text-sm pb-4">授课</span>
          </div>

          <!-- 授课卡片2 -->
          <div class="flex flex-col items-center cursor-pointer group border-2 rounded-lg">
            <div class="card-img rounded-[20px] flex items-center justify-center transition-colors">
              <img src="~/assets/images/two.png" alt="授课" class="card-icon object-contain" />
            </div>
            <span class="mt-2 text-gray-600 text-sm pb-4">授课</span>
          </div>

          <!-- 授课卡片3 -->
          <div class="flex flex-col items-center cursor-pointer group border-2 rounded-lg">
            <div class="card-img rounded-[20px] flex items-center justify-center transition-colors">
              <img src="~/assets/images/three.png" alt="授课" class="card-icon object-contain" />
            </div>
            <span class="mt-2 text-gray-600 text-sm pb-4">授课</span>
          </div>
        </div>

        <!-- 下方内容区 - 授课记录 和 班级码登录 分开 -->
        <div class="flex gap-[90px] xl:gap-[64px] lg:gap-12 md:flex-col lg:flex-row">
          <!-- 左侧：授课记录 -->
          <div class="flex-shrink-0 md:w-full lg:w-auto">
            <div class="flex items-center gap-4 mb-4">
              <span class="text-gray-600 text-sm">授课记录</span>
              <select class="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-600 outline-none">
                <option>八年级一班</option>
                <option>八年级二班</option>
                <option>七年级一班</option>
              </select>
            </div>
            
            <!-- 大卡片 -->
            <div class="lesson-card flex-shrink-0">
              <div class="w-full lesson-card-inner bg-[#F5A67D] mb-3 rounded-lg"></div>
              <select class="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none">
                <option>nous ai set</option>
                <option>课程包 A</option>
                <option>课程包 B</option>
              </select>
            </div>
          </div>
          
          <!-- 右侧：班级码登录区域 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-4 mb-4">
              <span class="text-gray-600 text-sm">班级码登录</span>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 md:gap-x-8 gap-y-6">
              <div 
                v-for="i in 8" 
                :key="i"
                class="flex flex-col items-center"
              >
                <div class="class-card bg-[#A8B8C8] border-2 border-dashed border-[#8A9DB0] mb-3"></div>
                <button class="text-xs text-gray-500 hover:text-[#FFA54D] transition-colors">
                  开始上课
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧边栏 -->
      <aside class="right-sidebar flex-shrink-0 h-full flex flex-col p-4">
        <!-- 玛塔工具中心 -->
        <div class="h-[200px] mb-[40px] border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-600 text-sm font-medium">玛塔工具中心</span>
            <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer" />
          </div>
          <div class="flex-1 flex items-center justify-around">
            <div v-for="i in 3" :key="i" class="tool-icon rounded-lg overflow-hidden cursor-pointer">
              <img src="~/assets/images/four.png" alt="工具" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- AI实践中心 -->
        <div class="h-[200px] mb-4 border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-600 text-sm font-medium">AI实践中心</span>
            <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer" />
          </div>
          <div class="flex-1 flex items-center justify-around">
            <div v-for="i in 3" :key="i" class="tool-icon rounded-lg overflow-hidden">
              <img src="~/assets/images/four.png" alt="实践中心" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- 信息栏 -->
        <div class="flex-1 flex flex-col">
          <div class="text-gray-600 text-sm font-medium mb-4">信息栏</div>
          <div class="grid grid-cols-2 gap-4 flex-1">
            <div class="h-[130px] border border-[#E0E0E0] rounded-lg p-4 flex flex-col justify-center">
              <div class="text-gray-400 text-xs mb-2">班级数</div>
              <div class="text-3xl font-medium text-[#808080]">8</div>
            </div>
            <div class="h-[130px] border border-[#E0E0E0] rounded-lg p-4 flex flex-col justify-center">
              <div class="text-gray-400 text-xs mb-2">提交作品数</div>
              <div class="text-3xl font-medium text-[#808080]">1208</div>
            </div>
            <div class="h-[130px] border border-[#E0E0E0] rounded-lg p-4 flex flex-col justify-center">
              <div class="text-gray-400 text-xs mb-2">授课课时</div>
              <div class="text-3xl font-medium text-[#808080]">50</div>
            </div>
            <div class="h-[130px] border border-[#E0E0E0] rounded-lg p-4 flex flex-col justify-center">
              <div class="text-gray-400 text-xs mb-2">学生人数</div>
              <div class="text-3xl font-medium text-[#808080]">80</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
/* 页面高度 */
.teacher-page {
  min-height: calc(100vh - 70px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 1920px 设计图基准 */
.main-content {
  display: flex;
  justify-content: flex-end;
}

.right-sidebar {
  width: 380px;
}

.tool-icon {
  width: 87px;
  height: 87px;
}

.card-img {
  width: 262px;
  height: 296px;
}
.card-icon {
  width: 210px;
  height: 210px;
}

.lesson-card {
  width: 140px;
}
.lesson-card-inner {
  height: 180px;
}

.class-card {
  width: 120px;
  height: 150px;
}

/* 1600px - 1920px */
@media (max-width: 1920px) and (min-width: 1600px) {
  .right-sidebar { width: 530px; }
  .tool-icon { width: 80px; height: 80px; }
  .card-img { width: 240px; height: 270px; }
  .card-icon { width: 190px; height: 190px; }
  .class-card { width: 110px; height: 140px; }
}

/* 1400px - 1600px */
@media (max-width: 1600px) and (min-width: 1400px) {
  .right-sidebar { width: 280px; }
  .tool-icon { width: 64px; height: 64px; }
  .card-img { width: 180px; height: 210px; }
  .card-icon { width: 150px; height: 150px; }
  .lesson-card { width: 110px; }
  .lesson-card-inner { height: 135px; }
  .class-card { width: 95px; height: 118px; }
  .top-cards { gap: 20px; flex-wrap: wrap; max-width: 780px; justify-content: center; }
}

/* 1200px - 1400px */
@media (max-width: 1400px) and (min-width: 1200px) {
  .right-sidebar { width: 250px; }
  .tool-icon { width: 56px; height: 56px; }
  .card-img { width: 150px; height: 175px; }
  .card-icon { width: 120px; height: 120px; }
  .lesson-card { width: 95px; }
  .lesson-card-inner { height: 120px; }
  .class-card { width: 85px; height: 105px; }
  .top-cards { gap: 16px; margin-bottom: 36px; flex-wrap: wrap; max-width: 640px; justify-content: center; }
}

/* 1024px - 1200px */
@media (max-width: 1200px) and (min-width: 1024px) {
  .right-sidebar { width: 240px; }
  .tool-icon { width: 50px; height: 50px; }
  .card-img { width: 140px; height: 160px; }
  .card-icon { width: 100px; height: 100px; }
  .lesson-card { width: 90px; }
  .lesson-card-inner { height: 110px; }
  .class-card { width: 70px; height: 90px; }
  .top-cards { gap: 15px; margin-bottom: 30px; }
}

/* < 1024px */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    overflow: auto;
  }
  .main-area {
    flex: none;
    overflow: visible;
  }
  .right-sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }
  .right-sidebar > div {
    flex: 1;
    min-width: 200px;
  }
  .top-cards {
    flex-wrap: wrap;
    gap: 16px;
    max-width: 100%;
    padding: 0 16px;
    justify-content: center;
    margin-bottom: 32px;
  }
  .card-img { width: 140px; height: 160px; }
  .card-icon { width: 110px; height: 110px; }
  .lesson-card { width: 110px; }
  .lesson-card-inner { height: 120px; }
  .class-card { width: 90px; height: 110px; }
}
</style>
