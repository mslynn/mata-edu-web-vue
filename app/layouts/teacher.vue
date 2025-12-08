<template>
  <div class="teacher-layout min-h-screen bg-[#f5f7fb] flex">
    <!-- 左侧导航 -->
    <aside class="side-nav w-[220px] bg-white border-r border-gray-200 flex flex-col">
      <div class="side-header h-16 flex items-center px-4 border-b border-gray-100 text-lg font-semibold text-[#4CB9CF]">
        教师中心
      </div>
      <nav class="flex-1 overflow-auto py-4">
        <div
          v-for="item in navItems"
          :key="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors',
            isActive(item.path)
              ? 'bg-[#4CB9CF]/10 text-[#4CB9CF] font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          ]"
          @click="go(item.path)"
        >
          <span class="text-base">{{ item.label }}</span>
        </div>
      </nav>
    </aside>

    <!-- 右侧内容 -->
    <main class="flex-1 min-w-0 p-4 lg:p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { label: '首页', path: '/teacher' },
  { label: '班级管理', path: '/system/class' },
  { label: '课程中心', path: '/course' },
  { label: '玛塔工具中心', path: '/tools' },
  { label: 'AI实践中心', path: '/ai' },
  { label: '学情中心', path: '/study' },
  { label: '教师成长中心', path: '/growth' },
  { label: '赛事中心', path: '/competition' },
]

const go = (path: string) => {
  navigateTo(path)
}

const isActive = (path: string) => {
  if (path === '/teacher') return route.path === '/teacher'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.teacher-layout {
  color: #333;
}
.side-nav {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}
</style>

