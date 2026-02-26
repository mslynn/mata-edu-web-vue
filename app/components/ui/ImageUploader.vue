<template>
  <div class="inline-block">
    <input 
      ref="fileInputRef"
      type="file"
      accept="image/png,image/jpg,image/jpeg,image/gif"
      class="hidden"
      @change="handleFileChange"
    />
    
    <!-- 未上传图片时显示上传按钮 -->
    <template v-if="!ossId">
      <button 
        class="px-4 py-1.5 text-sm rounded inline-flex items-center gap-1 disabled:opacity-50 transition-colors"
        :class="buttonStyle === 'primary' 
          ? 'bg-[#FF9900] text-white hover:bg-[#e68a00]' 
          : 'border border-[#FF9900] text-[#FF9900] hover:bg-[#FFF7E6]'"
        :disabled="uploading"
        @click="handleClick"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        {{ uploading ? $t('common.loading') : $t('customExercise.uploadImage') }}
      </button>
      <span v-if="showTip" class="text-xs text-gray-400 ml-2">{{ $t('customExercise.uploadImageTip') }}</span>
    </template>
    
    <!-- 已上传图片时显示缩略图 -->
    <template v-else>
      <div class="flex items-start gap-3">
        <div class="relative group" :style="{ width: size + 'px', height: size + 'px' }">
          <!-- 删除按钮 -->
          <button 
            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center z-10 hover:bg-red-600"
            @click="handleRemove"
          >×</button>
          <!-- 图片 -->
          <img 
            :src="imageUrl" 
            class="w-full h-full object-cover rounded border border-gray-200"
          />
          <!-- hover遮罩 - 重新上传 -->
          <div 
            class="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            @click="handleClick"
          >
            <span class="text-white text-xs">{{ $t('customExercise.reupload') }}</span>
          </div>
          <!-- 预览按钮 -->
          <button 
            class="absolute bottom-1 right-1 w-5 h-5 bg-white/80 rounded flex items-center justify-center hover:bg-white"
            @click="previewVisible = true"
          >
            <svg class="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
        <span v-if="showTip" class="text-xs text-gray-400">{{ $t('customExercise.uploadImageTip') }}</span>
      </div>
    </template>
    
    <!-- 图片预览弹窗 -->
    <ImagePreviewModal 
      v-model:visible="previewVisible"
      :image-url="imageUrl || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import ImagePreviewModal from './ImagePreviewModal.vue'

const props = withDefaults(defineProps<{
  ossId?: string
  imageUrl?: string
  size?: number
  buttonStyle?: 'primary' | 'outline'
  showTip?: boolean
  uploadFn: (file: File) => Promise<{ ossId: string; url: string }>
}>(), {
  size: 80,
  buttonStyle: 'primary',
  showTip: true
})

const emit = defineEmits<{
  'update:ossId': [value: string | undefined]
  'update:imageUrl': [value: string | undefined]
  'uploaded': [data: { ossId: string; url: string }]
  'removed': []
}>()

const { t } = useI18n()
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const previewVisible = ref(false)

const handleClick = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  // 验证文件类型和大小
  const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']
  if (!validTypes.includes(file.type)) {
    ElMessage.warning(t('customExercise.uploadImageTip'))
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning(t('customExercise.uploadImageTip'))
    return
  }
  
  uploading.value = true
  try {
    const result = await props.uploadFn(file)
    emit('update:ossId', result.ossId)
    emit('update:imageUrl', result.url)
    emit('uploaded', result)
    ElMessage.success(t('personalCenter.uploadSuccess'))
  } catch (error) {
    console.error('上传失败:', error)

  } finally {
    uploading.value = false
    input.value = ''
  }
}

const handleRemove = () => {
  emit('update:ossId', undefined)
  emit('update:imageUrl', undefined)
  emit('removed')
}
</script>
