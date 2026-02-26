 

<template>
  <div class="flex items-center" :class="wrapperClass">
    <div class="flex" :style="{ gap: `${gap}px` }">
      <template v-for="i in maxStars" :key="i">
        <div 
          class="relative" 
          :class="{ 'cursor-pointer': !readonly }"
          @click="!readonly && handleStarClick($event, i)"
        >
          <!-- Empty star background -->
          <svg 
            :width="size" 
            :height="size" 
            viewBox="0 0 24 24" 
            fill="none" 
            :stroke="emptyColor" 
            :stroke-width="strokeWidth"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <!-- Filled star overlay -->
          <svg 
            class="absolute top-0 left-0" 
            :width="size" 
            :height="size" 
            viewBox="0 0 24 24"
          >
            <defs>
              <clipPath :id="'clip-half-' + uniqueId + '-' + i">
                <rect x="0" y="0" width="12" height="24"/>
              </clipPath>
              <clipPath :id="'clip-full-' + uniqueId + '-' + i">
                <rect x="0" y="0" width="24" height="24"/>
              </clipPath>
            </defs>
            <polygon 
              v-if="modelValue >= i - 0.5"
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              :fill="fillColor"
              :clip-path="modelValue >= i ? `url(#clip-full-${uniqueId}-${i})` : `url(#clip-half-${uniqueId}-${i})`"
            />
          </svg>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: number
  maxStars?: number
  size?: number
  gap?: number
  fillColor?: string
  emptyColor?: string
  strokeWidth?: number
  readonly?: boolean
  wrapperClass?: string
}>(), {
  maxStars: 5,
  size: 20,
  gap: 2,
  fillColor: '#FBBF24',
  emptyColor: '#D1D5DB',
  strokeWidth: 1.5,
  readonly: true,
  wrapperClass: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// Generate unique ID for SVG clipPath
const uniqueId = computed(() => Math.random().toString(36).substring(2, 9))

// Handle star click - support half star
const handleStarClick = (event: MouseEvent, starIndex: number) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const halfWidth = rect.width / 2
  
  // Click on left half = half star, right half = full star
  const newScore = clickX < halfWidth ? starIndex - 0.5 : starIndex
  emit('update:modelValue', newScore)
}
</script>
