<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="handleCancel"></div>
      
      <!-- Modal Content -->
      <div class="bg-white rounded-xl shadow-xl w-[400px] overflow-hidden relative z-10 flex flex-col transform transition-all">
        <!-- Close Button -->
        <button 
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          @click="handleCancel"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="w-6 h-6">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- Body -->
        <div class="p-8 flex flex-col items-center text-center">
          <h3 class="text-xl font-bold text-gray-800 mb-6">{{ $t('taskManagement.withdrawConfirmTitle') }}</h3>
          
          <p class="text-gray-600 leading-relaxed mb-8 px-4">
            {{ $t('taskManagement.withdrawConfirmContent') }}
          </p>

          <!-- Buttons -->
          <div class="flex items-center gap-4 w-full px-6">
            <button 
              class="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 transition-colors font-medium"
              @click="handleCancel"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              class="flex-1 px-4 py-2.5 rounded-lg bg-[#FF9900] text-white hover:bg-[#e68a00] transition-colors font-medium shadow-md shadow-orange-500/20"
              @click="handleConfirm"
            >
              {{ $t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .bg-white,
.modal-fade-leave-active .bg-white {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .bg-white,
.modal-fade-leave-to .bg-white {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
