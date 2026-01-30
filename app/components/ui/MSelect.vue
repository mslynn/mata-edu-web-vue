<template>
  <div class="relative" ref="selectRef" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <!-- 选择框 -->
    <div 
      ref="triggerRef"
      :class="[
        'flex items-center justify-between px-3 py-1.5 border rounded-lg cursor-pointer transition-all',
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
    
    <!-- 下拉选项 - 使用 Teleport 避免被 overflow:hidden 裁剪 -->
    <Teleport to="body">
      <Transition name="select-dropdown">
        <div 
          v-if="isOpen" 
          ref="dropdownRef"
          :style="dropdownStyle"
          :class="[
            'fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto',
            dropdownClass || 'min-w-[200px]'
          ]"
          @mouseenter="handleDropdownMouseEnter"
          @mouseleave="handleDropdownMouseLeave"
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

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
  trigger?: 'click' | 'hover'
  placement?: 'bottom-start' | 'bottom-end' | 'bottom-center'
  dropdownClass?: string
}>(), {
  valueKey: 'value',
  labelKey: 'label',
  placeholder: '请选择',
  disabled: false,
  filterable: false,
  error: false,
  trigger: 'click',
  placement: 'bottom-start',
  dropdownClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null, option: Option | null]
}>()

const selectRef = ref<HTMLElement>()
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const isOpen = ref(false)
const searchKeyword = ref('')
const dropdownStyle = ref<Record<string, string>>({})

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

// 计算下拉框位置
const updateDropdownPosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft
  
  let left = rect.left + scrollLeft
  if (props.placement === 'bottom-end') {
    left = rect.right + scrollLeft
  } else if (props.placement === 'bottom-center') {
    left = rect.left + rect.width / 2 + scrollLeft
  }
  
  dropdownStyle.value = {
    top: `${rect.bottom + scrollTop + 4}px`,
    left: props.placement === 'bottom-end' ? 'auto' : `${left}px`,
    right: props.placement === 'bottom-end' ? `${window.innerWidth - rect.right - scrollLeft}px` : 'auto',
    width: `${rect.width}px`,
    transform: props.placement === 'bottom-center' ? 'translateX(-50%)' : 'none'
  }
}

const toggleOpen = () => {
  if (props.disabled || props.trigger === 'hover') return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(updateDropdownPosition)
  } else {
    searchKeyword.value = ''
  }
}

const timer = ref<ReturnType<typeof setTimeout> | null>(null)

const handleMouseEnter = () => {
  if (props.disabled || props.trigger !== 'hover') return
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
  isOpen.value = true
  nextTick(updateDropdownPosition)
}

const handleMouseLeave = () => {
  if (props.disabled || props.trigger !== 'hover') return
  timer.value = setTimeout(() => {
    isOpen.value = false
    searchKeyword.value = ''
  }, 150)
}

const handleDropdownMouseEnter = () => {
  if (props.trigger !== 'hover') return
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}

const handleDropdownMouseLeave = () => {
  if (props.trigger !== 'hover') return
  timer.value = setTimeout(() => {
    isOpen.value = false
    searchKeyword.value = ''
  }, 150)
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
  if (props.trigger === 'hover') return
  const target = e.target as Node
  if (selectRef.value && !selectRef.value.contains(target) && 
      dropdownRef.value && !dropdownRef.value.contains(target)) {
    isOpen.value = false
    searchKeyword.value = ''
  }
}

// 滚动时更新位置
const handleScroll = () => {
  if (isOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', updateDropdownPosition)
  if (timer.value) {
    clearTimeout(timer.value)
  }
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
  margin-top: -8px;
}
</style>

