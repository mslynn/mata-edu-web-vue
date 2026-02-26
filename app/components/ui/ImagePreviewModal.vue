<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/70" @click="close"></div>
        <div class="relative max-w-[90vw] max-h-[90vh]">
          <button 
            class="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full text-gray-600 hover:text-gray-800 flex items-center justify-center shadow-lg z-10"
            @click="close"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <img 
            :src="imageUrl" 
            class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  imageUrl: string
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'close': []
}>()

const close = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
