<template>
  <aside class="app-sidebar w-[220px] xl:w-[260px] 2xl:w-[295px] flex flex-col flex-shrink-0">
    <nav class="flex-1 overflow-auto py-2">
      <button
        v-for="item in menuItems"
        :key="item.path"
        type="button"
        :disabled="isActiveItem(item)"
        :class="[
          'w-full text-left flex items-center h-[50px] gap-3 px-4 py-3 transition-colors',
          isActiveItem(item)
            ? 'bg-[#FF9900] text-white font-normal cursor-default rounded-lg'
            : 'text-gray-700 hover:bg-gray-50 cursor-pointer text-sm'
        ]"
        :style="isActiveItem(item) ? { fontSize: '20px' } : {}"
        @click="!isActiveItem(item) && go(item.path)"
      >
        <div class="w-9 h-9 flex items-center justify-center">
          <img 
            v-if="item.icon || item.iconSelected" 
            :src="isActiveItem(item) ? item.iconSelected || item.icon : item.icon" 
            alt="" 
            class="w-9 h-9 object-contain" 
          />
          <span v-else>•</span>
        </div>
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTeacherNav } from '~/composables/api/useTeacherNav'

const route = useRoute()
const { locale } = useI18n()
const { menuItems, loadMenus } = useTeacherNav()

const go = (path: string) => {
  navigateTo(path)
}

const isActiveItem = (item: any) => {
  if (item.path === '/teacher') return route.path === '/teacher'
  return route.path.startsWith(item.path)
}

onMounted(() => {
  loadMenus()
})

// 监听语言切换，强制重新加载菜单
watch(locale, () => {
  loadMenus(true)
})
</script>

<style scoped>
.app-sidebar {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}
</style>
