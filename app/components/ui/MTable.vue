<template>
  <div class="bg-white rounded-lg overflow-hidden shadow-sm">
    <!-- 加载遮罩 -->
    <div v-if="loading" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
      <div class="text-[#4CB9CF]">{{ $t('common.loading') }}</div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-[#FFF1DD]">
          <tr>
            <!-- 选择列 -->
            <th v-if="selectable" class="w-12 px-4 py-3">
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="handleSelectAll"
                class="w-4 h-4 rounded border-gray-300 accent-[#FF9900] focus:ring-[#FF9900]"
              />
            </th>
            <!-- 序号列 -->
            <th v-if="showIndex" class="w-16 px-4 py-3 text-left text-sm font-medium text-gray-600 whitespace-nowrap">
              {{ $t('common.serialNumber') }}
            </th>
            <!-- 数据列 -->
            <th 
              v-for="col in columns" 
              :key="col.key"
              :style="{ width: col.width, minWidth: col.minWidth }"
              :class="[
                'px-4 py-3 text-sm font-medium text-gray-600',
                col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
              ]"
            >
              {{ col.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(row, index) in data" 
            :key="rowKey ? row[rowKey] : index" 
            :class="[
              'border-t border-gray-100 transition-colors',
              stripe && index % 2 === 1 ? 'bg-gray-50' : '',
              'hover:bg-[#4CB9CF]/5'
            ]"
            @click="$emit('row-click', row, index)"
          >
            <!-- 选择列 -->
            <td v-if="selectable" class="px-4 py-3">
              <input 
                type="checkbox" 
                :checked="selectedKeys.includes(row[rowKey || 'id'])"
                @change="handleSelect(row)"
                @click.stop
                class="w-4 h-4 rounded border-gray-300 accent-[#FF9900] focus:ring-[#FF9900]"
              />
            </td>
            <!-- 序号列 -->
            <td v-if="showIndex" class="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
              {{ index + 1 }}
            </td>
            <!-- 数据列 -->
            <td 
              v-for="col in columns" 
              :key="col.key"
              :class="[
                'px-4 py-3 text-sm text-gray-600',
                col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
              ]"
            >
              <!-- 自定义插槽 -->
              <slot :name="col.key" :row="row" :index="index" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
          
          <!-- 空数据 -->
          <tr v-if="!data || !data.length">
            <td 
              :colspan="(selectable ? 1 : 0) + (showIndex ? 1 : 0) + columns.length" 
              class="px-4 py-12 text-center text-gray-400"
            >
              <slot name="empty">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span>{{ $t('common.noData') }}</span>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  key: string
  title: string
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
}

const props = withDefaults(defineProps<{
  columns: Column[]
  data: any[]
  rowKey?: string
  loading?: boolean
  stripe?: boolean
  showIndex?: boolean
  selectable?: boolean
  selectedKeys?: (string | number)[]
}>(), {
  rowKey: 'id',
  loading: false,
  stripe: false,
  showIndex: false,
  selectable: false,
  selectedKeys: () => []
})

const emit = defineEmits<{
  'row-click': [row: any, index: number]
  'select': [keys: (string | number)[], rows: any[]]
  'select-all': [selected: boolean]
}>()

const isAllSelected = computed(() => {
  if (!props.data.length) return false
  return props.data.every(row => props.selectedKeys.includes(row[props.rowKey || 'id']))
})

const isIndeterminate = computed(() => {
  if (!props.data.length) return false
  const selectedCount = props.data.filter(row => props.selectedKeys.includes(row[props.rowKey || 'id'])).length
  return selectedCount > 0 && selectedCount < props.data.length
})

const handleSelect = (row: any) => {
  const key = row[props.rowKey || 'id']
  let newKeys: (string | number)[]
  let newRows: any[]
  
  if (props.selectedKeys.includes(key)) {
    newKeys = props.selectedKeys.filter(k => k !== key)
    newRows = props.data.filter(r => newKeys.includes(r[props.rowKey || 'id']))
  } else {
    newKeys = [...props.selectedKeys, key]
    newRows = props.data.filter(r => newKeys.includes(r[props.rowKey || 'id']))
  }
  
  emit('select', newKeys, newRows)
}

const handleSelectAll = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  emit('select-all', checked)
  
  if (checked) {
    const allKeys = props.data.map(row => row[props.rowKey || 'id'])
    emit('select', allKeys, props.data)
  } else {
    emit('select', [], [])
  }
}
</script>

