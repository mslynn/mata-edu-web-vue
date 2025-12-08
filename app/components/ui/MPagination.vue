<template>
  <div class="flex items-center justify-between flex-wrap gap-4">
    <!-- 左侧信息 -->
    <div v-if="showTotal" class="text-sm text-gray-500">
      共 <span class="font-medium text-gray-700">{{ total }}</span> 条
    </div>
    
    <!-- 分页器 -->
    <div class="flex items-center gap-2">
      <!-- 每页条数选择 -->
      <div v-if="showSizeChanger" class="flex items-center gap-2">
        <select 
          :value="pageSize"
          class="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-[#FF9900]"
          @change="handleSizeChange"
        >
          <option v-for="size in pageSizes" :key="size" :value="size">
            {{ size }} 条/页
          </option>
        </select>
      </div>
      
      <!-- 上一页 -->
      <button 
        :disabled="currentPage <= 1"
        :class="[
          'w-8 h-8 flex items-center justify-center rounded border transition-colors',
          currentPage <= 1 
            ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
            : 'border-gray-300 text-gray-600 hover:border-[#FF9900] hover:text-[#FF9900]'
        ]"
        @click="changePage(currentPage - 1)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <!-- 页码 -->
      <template v-for="page in displayPages" :key="page">
        <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
        <button 
          v-else
          :class="[
            'w-8 h-8 flex items-center justify-center rounded border text-sm transition-colors',
            page === currentPage 
              ? 'bg-[#FF9900] text-white border-[#FF9900]' 
              : 'border-gray-300 text-gray-600 hover:border-[#FF9900] hover:text-[#FF9900]'
          ]"
          @click="changePage(page as number)"
        >
          {{ page }}
        </button>
      </template>
      
      <!-- 下一页 -->
      <button 
        :disabled="currentPage >= totalPages"
        :class="[
          'w-8 h-8 flex items-center justify-center rounded border transition-colors',
          currentPage >= totalPages 
            ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
            : 'border-gray-300 text-gray-600 hover:border-[#FF9900] hover:text-[#FF9900]'
        ]"
        @click="changePage(currentPage + 1)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <!-- 跳转 -->
      <div v-if="showQuickJumper" class="flex items-center gap-2 ml-2">
        <span class="text-sm text-gray-500">跳至</span>
        <input 
          v-model.number="jumpPage"
          type="number"
          min="1"
          :max="totalPages"
          class="w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:border-[#FF9900]"
          @keyup.enter="handleJump"
        />
        <span class="text-sm text-gray-500">页</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  currentPage: number
  pageSize: number
  total: number
  pageSizes?: number[]
  showTotal?: boolean
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  pagerCount?: number
}>(), {
  pageSizes: () => [10, 20, 50, 100],
  showTotal: true,
  showSizeChanger: true,
  showQuickJumper: false,
  pagerCount: 7
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  change: [page: number, pageSize: number]
}>()

const jumpPage = ref(props.currentPage)

const totalPages = computed(() => Math.ceil(props.total / props.pageSize) || 1)

const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = props.currentPage
  const count = props.pagerCount
  
  if (total <= count) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(count / 2)
    let start = current - half
    let end = current + half
    
    if (start <= 1) {
      start = 1
      end = count - 1
    }
    
    if (end >= total) {
      end = total
      start = total - count + 2
    }
    
    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }
    
    for (let i = start; i <= end; i++) {
      if (i > 0 && i <= total) pages.push(i)
    }
    
    if (end < total) {
      if (end < total - 1) pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage) return
  emit('update:currentPage', page)
  emit('change', page, props.pageSize)
  jumpPage.value = page
}

const handleSizeChange = (e: Event) => {
  const size = Number((e.target as HTMLSelectElement).value)
  emit('update:pageSize', size)
  emit('update:currentPage', 1)
  emit('change', 1, size)
}

const handleJump = () => {
  if (jumpPage.value && jumpPage.value >= 1 && jumpPage.value <= totalPages.value) {
    changePage(jumpPage.value)
  }
}
</script>

<style scoped>
/* 隐藏数字输入框的上下箭头 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* select 选中时的样式 */
select:focus {
  border-color: #FF9900;
  outline: none;
}

select:hover {
  border-color: #FF9900;
}

select option:hover {
  background-color: #FFF1DD;
}

/* select option:checked {
  background-color: #FF9900;
  color: white;
} */
</style>

