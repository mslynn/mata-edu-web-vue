<template>
  <div class="relative" ref="selectRef">
    <!-- 选择框 -->
    <div 
      :class="[
        'flex items-center justify-between px-4 py-2 border rounded-lg cursor-pointer transition-all',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-[#FF9900]',
        isOpen ? 'border-[#FF9900] ring-2 ring-[#FF9900]/20' : 'border-gray-300',
        error ? 'border-red-500' : ''
      ]"
      @click="toggleOpen"
    >
      <span :class="['text-sm truncate', selectedLabel ? 'text-gray-700' : 'text-gray-400']">
        {{ selectedLabel || placeholder }}
      </span>
      <svg 
        :class="['w-4 h-4 text-gray-400 transition-transform', isOpen ? 'rotate-180' : '']" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    
    <!-- 下拉选项 -->
    <Transition name="select-dropdown">
      <div 
        v-if="isOpen" 
        class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        <!-- 搜索框 -->
        <div v-if="filterable" class="p-2 border-b border-gray-100">
          <input 
            v-model="searchKeyword"
            type="text"
            placeholder="搜索..."
            class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#FF9900]"
            @click.stop
          />
        </div>
        
        <!-- 选项列表 -->
        <div class="py-1">
          <div
            v-for="option in filteredOptions"
            :key="option[valueKey]"
            :class="[
              'px-4 py-2 text-sm cursor-pointer transition-colors',
              modelValue === option[valueKey] 
                ? 'bg-[#FF9900]/10 text-[#FF9900]' 
                : 'text-gray-700 hover:bg-[#FF9900]/10 hover:text-[#FF9900]',
              option.disabled ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            @click="handleSelect(option)"
          >
            <slot name="option" :option="option">
              {{ option[labelKey] }}
            </slot>
          </div>
          
          <!-- 无数据 -->
          <div v-if="!filteredOptions.length" class="px-4 py-3 text-sm text-gray-400 text-center">
            暂无数据
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface Option {
  [key: string]: any
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string | number | null
  options: Option[]
  valueKey?: string
  labelKey?: string
  placeholder?: string
  disabled?: boolean
  filterable?: boolean
  error?: boolean
}>(), {
  valueKey: 'value',
  labelKey: 'label',
  placeholder: '请选择',
  disabled: false,
  filterable: false,
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null, option: Option | null]
}>()

const selectRef = ref<HTMLElement>()
const isOpen = ref(false)
const searchKeyword = ref('')

const selectedLabel = computed(() => {
  const option = props.options.find(o => o[props.valueKey] === props.modelValue)
  return option ? option[props.labelKey] : ''
})

const filteredOptions = computed(() => {
  if (!props.filterable || !searchKeyword.value) {
    return props.options
  }
  const keyword = searchKeyword.value.toLowerCase()
  return props.options.filter(o => 
    String(o[props.labelKey]).toLowerCase().includes(keyword)
  )
})

const toggleOpen = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    searchKeyword.value = ''
  }
}

const handleSelect = (option: Option) => {
  if (option.disabled) return
  emit('update:modelValue', option[props.valueKey])
  emit('change', option[props.valueKey], option)
  isOpen.value = false
  searchKeyword.value = ''
}

// 点击外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false
    searchKeyword.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.select-dropdown-enter-active,
.select-dropdown-leave-active {
  transition: all 0.2s ease;
}

.select-dropdown-enter-from,
.select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

