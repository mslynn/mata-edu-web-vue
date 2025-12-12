<template>
  <div class="min-h-screen flex items-center justify-center p-4 md:p-8">
    <div class="flex flex-col md:flex-row gap-8 md:gap-20">
      <!-- 数据中心卡片 -->
      <div 
        class="card-wrapper cursor-pointer group"
        @click="goToDataCenter"
      >
        <div class="card-border">
          <div class="card-content bg-[#FFFFFF]">
            <img 
              src="~/assets/images/datacenter.png" 
              alt="数据中心" 
              class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
      </div>
          <div class="card-title">数据中心</div>
        </div>
    
      </div>

      <!-- 学校管理卡片 -->
      <div 
        class="card-wrapper cursor-pointer group"
        @click="goToSchoolManage"
      >
        <div class="card-border">
          <div class="card-content bg-[#FFFFFF]">
            <img 
              src="~/assets/images/manage.png" 
              alt="学校管理" 
              class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div class="card-title">学校管理</div>
        </div>

      </div>
    </div>

    <!-- 退出登录按钮 -->
    <button 
      @click="handleLogout"
      class="fixed top-6 right-6 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
    >
      退出登录
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/api/useAuth'

definePageMeta({
  layout: 'default'
})

const router = useRouter()
const { logout } = useAuth()
const { allowNavigation } = usePreventBack()

const handleLogout = () => {
  allowNavigation()
  logout()
}

const goToDataCenter = () => {
  // TODO: 跳转到数据中心页面
  console.log('跳转到数据中心')
}

const goToSchoolManage = () => {
  // TODO: 跳转到学校管理页面
  console.log('跳转到学校管理')
}
</script>

<style scoped>
.card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-border {
  width: 280px;
  height: 340px;
  /* border: 2px dashed #D0D0D0; */
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.card-content {
  width: 240px;
  height: 240px;
  border-radius: 8px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

/* 中等屏幕及以上恢复原尺寸 */
@media (min-width: 768px) {
  .card-border {
    width: 350px;
    height: 420px;
    padding: 20px;
  }
  
  .card-content {
    width: 306px;
    height: 306px;
    padding: 22px;
    margin-bottom: 42px;
  }
}

.card-title {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
  text-align: center;
}

.card-wrapper:hover .card-border {
  border-color: #999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
