<template>
  <div class="flex-1 overflow-hidden py-4 w-full">
    <!-- 三栏水平布局容器，左边距115px与头部对齐 -->
    <div class="main-content flex h-full">
      <!-- 左侧边栏 -->
      <aside class="left-sidebar py-6 px-4 flex-shrink-0">
        <nav class="space-y-2">
          <a 
            v-for="item in menuItems" 
            :key="item.name"
            :class="[
              'menu-item block px-4 py-2.5 rounded-full text-[14px] cursor-pointer',
              activeMenu === item.name 
                ? 'active bg-[#FFA54D] text-white shadow-[0_2px_8px_rgba(255,165,77,0.4)]' 
                : 'text-[#666666] hover:bg-white/50'
            ]"
            @click="activeMenu = item.name"
          >
            {{ item.label }}
          </a>
        </nav>
      </aside>

      <!-- 主内容区 -->
      <main class="main-area p-4 lg:p-6 overflow-visible">
        <!-- 顶部三个授课卡片 -->
        <div class="top-cards flex gap-[20px] xl:gap-[45px] mb-12 xl:mb-36 justify-center flex-wrap xl:flex-nowrap">
          <!-- 授课卡片1 -->
          <div class="flex flex-col items-center cursor-pointer group border-2">
            <div class="w-[180px] h-[200px] xl:w-[262px] xl:h-[296px] rounded-[20px] flex items-center justify-center transition-colors">
              <img src="~/assets/images/one.png" alt="授课" class="w-[140px] h-[140px] xl:w-[210px] xl:h-[210px] object-contain" />
            </div>
            <span class="mt-3 text-gray-600 text-sm pb-6">授课</span>
          </div>

          <!-- 授课卡片2 -->
          <div class="flex flex-col items-center cursor-pointer group border-2">
            <div class="w-[180px] h-[200px] xl:w-[262px] xl:h-[296px] rounded-[20px] flex items-center justify-center transition-colors">
              <img src="~/assets/images/two.png" alt="授课" class="w-[140px] h-[140px] xl:w-[210px] xl:h-[210px] object-contain" />
            </div>
            <span class="mt-3 text-gray-600 text-sm pb-6">授课</span>
          </div>

          <!-- 授课卡片3 -->
          <div class="flex flex-col items-center cursor-pointer group border-2">
            <div class="w-[180px] h-[200px] xl:w-[262px] xl:h-[296px] rounded-[20px] flex items-center justify-center transition-colors">
              <img src="~/assets/images/three.png" alt="授课" class="w-[140px] h-[140px] xl:w-[210px] xl:h-[210px] object-contain" />
            </div>
            <span class="mt-3 text-gray-600 text-sm pb-6">授课</span>
          </div>
        </div>

        <!-- 下方内容区 -->
        <div class="flex gap-4">
          <!-- 授课记录区域 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 md:gap-4 mb-4 flex-wrap">
              <span class="text-gray-600 text-xs md:text-sm">授课记录</span>
              <select class="px-2 md:px-3 py-1 md:py-1.5 bg-white border border-gray-200 rounded text-xs md:text-sm text-gray-600 outline-none">
                <option>八年级一班</option>
                <option>八年级二班</option>
                <option>七年级一班</option>
              </select>
              <span class="text-gray-600 text-xs md:text-sm ml-4 md:ml-8">班级码登录</span>
            </div>
            
            <div class="flex gap-3 md:gap-4">
              <!-- 左侧大卡片 -->
              <div class="w-[160px] md:w-[140px] flex-shrink-0 mr-[90px]">
                <div class="w-full h-[210px] md:h-[180px] bg-[#F5A67D]  mb-2 md:mb-3"></div>
                <select class="w-full px-1 md:px-2 py-1 md:py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 outline-none">
                  <option>nous ai set</option>
                  <option>课程包 A</option>
                  <option>课程包 B</option>
                </select>
              </div>
              
              <!-- 右侧班级码登录区域 - 4个卡片 -->
              <div class="flex-1 min-w-0">
                <div class="flex gap-11">
                  <div 
                    v-for="i in 4" 
                    :key="i"
                    class="flex flex-col items-center"
                  >
                    <div class="w-[120px] h-[150px] aspect-[4/3] bg-[#A8B8C8] border-2 border-dashed border-[#8A9DB0] mb-8"></div>
                    <button class="text-xs text-gray-500 hover:text-[#FFA54D] transition-colors">
                      开始上课
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 右侧边栏 -->
      <aside class="right-sidebar p-4 flex-shrink-0 overflow-auto">
        <!-- 玛塔工具中心 -->
        <div class="h-[250px] mb-[40px] border-2 border-dashed border-[#B8D4E8] rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-600 text-sm font-medium">玛塔工具中心</span>
            <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer" />
          </div>
          <div class="flex gap-3  justify-around  mt-[60px]" >
            <div v-for="i in 3" :key="i" class="w-[87px] h-[87px] rounded-lg overflow-hidden cursor-pointer">
              <img src="~/assets/images/four.png" alt="工具" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- AI实践中心 -->
        <div class= " h-[250px] mb-4 border-2 border-dashed border-[#B8D4E8] rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-600 text-sm font-medium">AI实践中心</span>
            <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer " />
          </div>
          <div class="flex gap-3 justify-around  mt-[60px]">
            <div v-for="i in 3" :key="i" class="w-[90px] h-[90px] rounded-lg overflow-hidden">
              <img src="~/assets/images/four.png" alt="实践中心" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- 信息栏 -->
        <div class="">
          <div class="text-gray-600 text-sm font-medium mb-4">信息栏</div>
          <div class="grid grid-cols-2 gap-4">
            <div class=" h-[130px] border border-[#E0E0E0] rounded-lg p-4">
              <div class="text-gray-400 text-xs mb-2">班级数</div>
              <div class="text-3xl font-500 text-[#808080]">8</div>
            </div>
            <div class=" h-[130px] border border-[#E0E0E0] rounded-lg p-4">
              <div class="text-gray-400 text-xs mb-2">提交作品数</div>
              <div class="text-3xl font-500 text-[#808080]">1208</div>
            </div>
            <div class=" h-[130px] border border-[#E0E0E0] rounded-lg p-4">
              <div class="text-gray-400 text-xs mb-2">授课课时</div>
              <div class="text-3xl font-500 text-[#808080]">50</div>
            </div>
            <div class=" h-[130px] border border-[#E0E0E0] rounded-lg p-4">
              <div class="text-gray-400 text-xs mb-2">学生人数</div>
              <div class="text-3xl font-500 text-[#808080]">80</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'default'
})

const activeMenu = ref('ai')

const menuItems = [
  { name: 'home', label: '首页' },
  { name: 'class', label: '班级管理' },
  { name: 'course', label: '课程中心' },
  { name: 'tools', label: '玛塔工具中心' },
  { name: 'ai', label: 'AI实践中心' },
  { name: 'study', label: '学情中心' },
  { name: 'growth', label: '教师成长中心' },
  { name: 'competition', label: '赛事中心' },
]
</script>

<style scoped>
/* ===== 响应式三栏布局 ===== */

/* 主容器 */
.main-content {
  display: flex;
  justify-content: space-around;
}

/* 左侧边栏 */
.left-sidebar {
  width: 295px;
  flex-shrink: 0;
}

/* 主内容区 */
.main-area {
  width: 900px;
  flex-shrink: 1;
  min-width: 0;
}

/* 右侧边栏 */
.right-sidebar {
  width: 537px;
  flex-shrink: 0;
}

/* 大屏幕 1600px+ - 三栏完整显示 */
@media (min-width: 1600px) {
  .left-sidebar { width: 295px; }
  .main-area { width: 900px; }
  .right-sidebar { width: 537px; }
}

/* 笔记本 1280px - 1600px：两栏布局，右侧栏移到底部 */
@media (max-width: 1600px) and (min-width: 1024px) {
  .main-content {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 20px;
  }
  .left-sidebar { 
    width: 180px; 
    flex-shrink: 0;
  }
  .main-area { 
    flex: 1; 
    width: auto; 
    min-width: 0;
    max-width: calc(100% - 200px);
  }
  .right-sidebar { 
    width: 100%;
    margin-top: 20px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .right-sidebar > div {
    flex: 1;
    min-width: 280px;
  }
}

/* 平板 768px - 1024px */
@media (max-width: 1024px) and (min-width: 768px) {
  .main-content {
    flex-wrap: wrap;
    padding: 0 16px;
    gap: 16px;
  }
  .left-sidebar { 
    width: 140px;
    flex-shrink: 0;
  }
  .main-area { 
    flex: 1; 
    width: auto;
    min-width: 0;
  }
  .right-sidebar { 
    width: 100%;
    margin-top: 16px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .right-sidebar > div {
    flex: 1;
    min-width: 200px;
  }
}

/* 手机 < 768px：单栏布局 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 0 12px;
  }
  .left-sidebar {
    width: 100%;
    padding: 12px;
  }
  .left-sidebar nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .main-area {
    width: 100%;
    flex: none;
  }
  .right-sidebar {
    width: 100%;
    margin-top: 16px;
  }
}

/* 菜单项切换动画 */
.menu-item {
  transition: all 0.3s ease;
}

.menu-item.active {
  animation: menuPop 0.3s ease-out;
}

@keyframes menuPop {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }
  60% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 自定义滚动条 */
main::-webkit-scrollbar,
aside::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track,
aside::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb,
aside::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover,
aside::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
