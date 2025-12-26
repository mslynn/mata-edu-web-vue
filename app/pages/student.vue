<template>
  <div class="flex-1 overflow-auto py-4 w-full">
    <!-- 两栏布局容器 -->
    <div class="main-content flex">
      
      <!-- 左侧 - 学习与任务中心 585x581 -->
      <aside class="left-panel p-4 flex-shrink-0">
        <div class="border-2 border-dashed border-[#B8D4E8] rounded-lg p-6 h-[581px]">
          <div class="text-gray-600 text-sm font-medium mb-6">学习与任务中心</div>
          
          <!-- 上次课程 -->
          <div class="mb-6">
            <div class="text-gray-500 text-xs mb-2">上次课程</div>
            <div class="bg-[#F1F1F1] text-[#808080] rounded px-3 py-2 text-sm text-center  cursor-pointer">
              第一单元 第十课
            </div>
          </div>
          
          <!-- 未完成任务 -->
          <div class="mb-6">
            <div class="text-gray-500 text-xs mb-2">未完成任务</div>
            <div class="bg-[#F1F1F1] text-[#808080] rounded px-3 py-2 text-sm text-center cursor-pointer">
              第一单元 第十课
        </div>
      </div>

          <!-- 未完成评测 -->
          <div>
            <div class="text-gray-500 text-xs mb-2">未完成评测</div>
            <div class="bg-[#F1F1F1] text-[#808080] rounded px-3 py-2 text-sm text-center cursor-pointer">
              第一单元 第十课
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧大区域 -->
      <div class="right-area flex-1 p-4 min-w-0">
        <!-- 上半部分：玛塔工具中心 + AI实践中心 并排 -->
        <div class="flex gap-4 mb-6 flex-wrap xl:flex-nowrap h-[270px]">
          <!-- 玛塔工具中心 -->
          <div class="tool-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex-1 min-w-[280px] ">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-600 text-sm font-medium">玛塔工具中心</span>
              <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer" />
        </div>
            <div class="flex gap-4 justify-around mt-[60px]">
              <div v-for="i in 3" :key="'tool'+i" class="w-[87px] h-[87px] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                <img src="~/assets/images/four.png" alt="工具" class="w-full h-full object-cover" />
        </div>
      </div>
          </div>

          <!-- AI实践中心 -->
          <div class="tool-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex-1 min-w-[280px]">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-600 text-sm font-medium">AI实践中心</span>
              <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer" />
            </div>
            <div class="flex gap-4 justify-around mt-[60px]">
              <div v-for="i in 3" :key="'ai'+i" class="w-[87px] h-[87px] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                <img src="~/assets/images/four.png" alt="AI实践" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <!-- 下半部分：4个功能中心 -->
        <div class="center-cards mb-6">
          <div class="center-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <div class="text-gray-600 text-sm mb-4">课程中心</div>
            <div class="center-icon flex items-center justify-center">
              <img src="~/assets/images/kecheng.png" alt="课程中心" class="w-full h-full object-contain" />
            </div>
          </div>
          <div class="center-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <div class="text-gray-600 text-sm mb-4">测评中心</div>
            <div class="center-icon flex items-center justify-center">
              <img src="~/assets/images/ceping.png" alt="测评中心" class="w-full h-full object-contain" />
            </div>
          </div>
          <div class="center-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <div class="text-gray-600 text-sm mb-4">学情中心</div>
            <div class="center-icon flex items-center justify-center">
              <img src="~/assets/images/xueqing.png" alt="学情中心" class="w-full h-full object-contain" />
      </div>
          </div>
          <div class="center-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <div class="text-gray-600 text-sm mb-4">拓展中心</div>
            <div class="center-icon flex items-center justify-center">
              <img src="~/assets/images/tuozhan.png" alt="拓展中心" class="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        <!-- 底部卡片 -->
        <div class="flex justify-center">
          <div class="border-2 border-dashed border-[#B8D4E8] rounded-lg p-6 w-[180px] h-[180px] flex items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <img src="~/assets/images/bottom.png" alt="更多" class="w-[120px] h-[120px] object-contain" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/api/useAuth'

definePageMeta({
  layout: 'default'
})

const { logout } = useAuth()

const handleLogout = () => {
  logout()
}
</script>

<style scoped>
/* ===== 响应式两栏布局 ===== */

/* 主容器 */
.main-content {
  /* display: flex;
  justify-content: flex-start;
  padding-right: 120px; */
  display: flex;
    width: 95%;
    margin: 0 auto;
}

/* 左侧面板 585x581 */
.left-panel {
  width: 585px;
  min-height: 581px;
  flex-shrink: 0;
}

/* 右侧区域 */
.right-area {
  flex: 1;
  min-width: 0;
}

/* 大屏幕 1600px+ */
@media (min-width: 1600px) {
  .left-panel { 
    width: 585px; 
    min-height: 581px;
  }
}

/* 笔记本 1280px - 1600px */
@media (max-width: 1600px) and (min-width: 1024px) {
  .main-content {
    padding-right: 60px;
  }
  .left-panel { 
    width: 400px;
    min-height: auto;
  }
}

/* 平板 768px - 1024px */
@media (max-width: 1024px) and (min-width: 768px) {
  .main-content {
    padding: 0 20px;
    flex-wrap: wrap;
  }
  .left-panel { 
    width: 280px;
    min-height: auto;
  }
}

/* 手机 < 768px：单栏布局 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 0 12px;
  }
  .left-panel {
    width: 100%;
    min-height: auto;
    order: 2;
  }
  .right-area {
    width: 100%;
    order: 1;
  }
}
/* 4个功能中心卡片 - 不换行，自动缩放 */
.center-cards {
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 20px;
}

.center-card {
  flex: 1;
  min-width: 0;
  aspect-ratio: 1;
  max-width: 274px;
  max-height: 274px;
}

.center-icon {
  width: 60%;
  height: 60%;
}
</style>
