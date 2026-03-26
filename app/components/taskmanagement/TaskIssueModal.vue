<template>
  <MModal
    :model-value="modelValue"
    :title="$t('taskManagement.issueTask')"
    custom-width="600px"
    :show-footer="true"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="py-8 px-8">
      <!-- Free Coding Layout -->
      <template v-if="isFreeCoding">
        <div class="space-y-5">
          <!-- Task Name Input -->
          <div class="flex items-center gap-4">
            <span class="text-gray-700 font-medium whitespace-nowrap w-20 text-right">{{ $t('taskManagement.taskNameLabel') }}:</span>
            <input 
              v-model="freeTaskName"
              type="text"
              class="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]/20"
            />
          </div>
          <!-- Task Type -->
          <div class="flex items-center gap-4">
            <span class="text-gray-700 font-medium whitespace-nowrap w-20 text-right">{{ $t('taskManagement.taskType') }}:</span>
            <span class="text-gray-700">{{ taskTypeName || $t('taskManagement.freeCreationTask') }}</span>
          </div>
          <!-- Issue Class -->
          <div class="flex items-center gap-4">
            <span class="text-gray-700 font-medium whitespace-nowrap w-20 text-right">{{ $t('taskManagement.issueClass') }}:</span>
            <span class="text-gray-700">{{ className }}</span>
          </div>
        </div>
      </template>

      <!-- Default Layout -->
      <template v-else>
        <!-- Info Rows -->
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="grid grid-cols-[80px_1fr] gap-4 items-baseline text-gray-700 w-full max-w-[300px]">
            <span class="text-right font-medium text-gray-500 truncate">{{ $t('class.className') }}:</span>
            <span class="font-medium text-left truncate" :title="className">{{ className }}</span>
          </div>
          <div class="grid grid-cols-[80px_1fr] gap-4 items-baseline text-gray-700 w-full max-w-[300px]">
            <span class="text-right font-medium text-gray-500 truncate">{{ $t('taskManagement.task') }}:</span>
            <span class="font-medium text-left truncate" :title="taskName">{{ taskName }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Custom Footer -->
    <template #footer>
      <div class="flex items-center justify-center gap-6 w-full px-4 pb-2">
        <!-- Free Coding: Orange theme buttons -->
        <template v-if="isFreeCoding">
          <MButton 
            type="primary"
            class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-8 py-2.5 min-w-[140px] shadow-lg shadow-orange-500/20"
            @click="handleGroup"
          >
            {{ $t('taskManagement.sendToGroup') }}
          </MButton>
          <MButton 
            class="!bg-white !text-[#FF9900] border !border-[#FF9900] hover:!bg-orange-50 px-8 py-2.5 min-w-[140px]"
            @click="handleStudent"
          >
            {{ $t('taskManagement.sendToStudent') }}
          </MButton>
        </template>
        <!-- Default: Orange buttons -->
        <template v-else>
          <MButton 
            class="!bg-white !text-[#FF9900] border !border-[#FF9900] hover:!bg-orange-50 px-8 py-2.5 min-w-[140px]"
            @click="handleGroup"
          >
            {{ $t('taskManagement.sendToGroup') }}
          </MButton>
          <MButton 
            type="primary"
            class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-8 py-2.5 min-w-[140px] shadow-lg shadow-orange-500/20"
            @click="handleStudent"
          >
            {{ $t('taskManagement.sendToStudent') }}
          </MButton>
        </template>
      </div>
    </template>
  </MModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  className: string
  taskName: string
  hasAiSettings?: boolean
  isFreeCoding?: boolean
  taskTypeName?: string
  editorName?: string
}>(), {
  hasAiSettings: true,
  isFreeCoding: false,
  taskTypeName: '',
  editorName: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm-group': [taskName?: string]
  'confirm-student': [taskName?: string]
}>()

const resolveDefaultFreeTaskName = () => ''
const freeTaskName = ref(resolveDefaultFreeTaskName())

watch(() => props.modelValue, (visible) => {
  if (visible && props.isFreeCoding) {
    freeTaskName.value = resolveDefaultFreeTaskName()
  }
})

const resolveEmitTaskName = () => freeTaskName.value.trim()

const handleGroup = () => {
  if (props.isFreeCoding) {
    emit('confirm-group', resolveEmitTaskName())
  } else {
    emit('confirm-group')
  }
}

const handleStudent = () => {
  if (props.isFreeCoding) {
    emit('confirm-student', resolveEmitTaskName())
  } else {
    emit('confirm-student')
  }
}
</script>

<style scoped>
/* Customize radio accent color just in case tailwind class doesn't catch all browsers */
input[type="radio"] {
  accent-color: #FF9900;
}
</style>
