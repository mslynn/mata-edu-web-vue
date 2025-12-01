<template>
  <div class="p-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">学校/教师工作台</h1>
          <p class="text-gray-500 mt-1">欢迎回来，老师</p>
        </div>
        <button 
          @click="handleLogout"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          退出登录
        </button>
      </div>

      <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="text-3xl font-bold text-[#FFA54D]">8</div>
          <div class="text-gray-500 mt-1">我的班级</div>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="text-3xl font-bold text-[#3366FF]">256</div>
          <div class="text-gray-500 mt-1">学生人数</div>  
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div class="text-3xl font-bold text-[#10B981]">32</div>
          <div class="text-gray-500 mt-1">课程数量</div>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 class="text-lg font-semibold mb-4">教学工具</h2>
        <div class="grid grid-cols-4 gap-4">
          <button class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
            <div class="text-2xl mb-2">📚</div>
            <div class="text-sm text-gray-600">课程管理</div>
          </button>
          <button class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
            <div class="text-2xl mb-2">👥</div>
            <div class="text-sm text-gray-600">班级管理</div>
          </button>
          <button class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
            <div class="text-2xl mb-2">📝</div>
            <div class="text-sm text-gray-600">作业批改</div>
          </button>
          <button class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center">
            <div class="text-2xl mb-2">📈</div>
            <div class="text-sm text-gray-600">学情分析</div>
          </button>
        </div>
      </div>

      <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-lg font-semibold mb-4">今日待办</h2>
        <div class="space-y-3">
          <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="w-2 h-2 bg-[#FFA54D] rounded-full mr-3"></div>
            <span class="text-gray-600">三年级（2）班 - 编程基础课</span>
            <span class="ml-auto text-sm text-gray-400">10:00</span>
          </div>
          <div class="flex items-center p-3 bg-gray-50 rounded-lg">
            <div class="w-2 h-2 bg-[#3366FF] rounded-full mr-3"></div>
            <span class="text-gray-600">批改作业 - 12份待批</span>
            <span class="ml-auto text-sm text-gray-400">待处理</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const { logout } = useAuth()
const { allowNavigation } = usePreventBack()

const handleLogout = () => {
  allowNavigation()
  logout()
}
</script>

