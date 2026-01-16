import { ref, computed } from 'vue'

export interface PreviewResource {
  id?: string | number
  name: string      // 文件名
  url: string       // 文件URL
}

/**
 * 文件预览 composable
 * 统一管理文件预览的状态和逻辑
 */
export function useFilePreview() {
  const config = useRuntimeConfig()
  
  // 当前选中的资源
  const selectedResource = ref<PreviewResource | null>(null)
  
  // 加载状态
  const loading = ref(false)

  // base64 编码
  const base64Encode = (str: string): string => {
    if (typeof window !== 'undefined') {
      return btoa(unescape(encodeURIComponent(str)))
    }
    return Buffer.from(str).toString('base64')
  }

  // 获取文件类型
  const getFileType = (fileName: string): string => {
    if (!fileName) return 'unknown'
    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    const typeMap: Record<string, string> = {
      doc: 'word', docx: 'word',
      ppt: 'ppt', pptx: 'ppt',
      pdf: 'pdf',
      xls: 'excel', xlsx: 'excel',
      png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', bmp: 'image', webp: 'image', svg: 'image',
      mp4: 'video', webm: 'video', ogg: 'video', mov: 'video', avi: 'video',
      ucd: 'ucd',
      mc: 'mc',
    }
    return typeMap[ext] || 'unknown'
  }

  // 获取文件图标类名
  const getIconClass = (fileName: string): string => {
    const type = getFileType(fileName)
    const iconMap: Record<string, string> = {
      word: 'icon-word',
      ppt: 'icon-ppt',
      pdf: 'icon-pdf',
      excel: 'icon-excel',
      image: 'icon-image',
      video: 'icon-video',
      ucd: 'icon-ucd',
      mc: 'icon-mc',
    }
    return iconMap[type] || 'icon-default'
  }

  // 当前文件类型
  const currentFileType = computed(() => {
    return selectedResource.value ? getFileType(selectedResource.value.name) : ''
  })

  // 是否是 iframe 预览类型
  const isIframeType = computed(() => {
    return ['word', 'ppt', 'pdf', 'image', 'excel'].includes(currentFileType.value)
  })

  // 生成预览URL
  const getPreviewUrl = (url: string): string => {
    const previewBaseUrl = (config.public.previewBaseUrl as string)?.trim() || 'http://192.168.0.145:8012'
    return `${previewBaseUrl}/onlinePreview?url=${encodeURIComponent(base64Encode(url))}`
  }

  // 预览URL
  const previewUrl = computed(() => {
    if (!selectedResource.value?.url || !isIframeType.value) return ''
    return getPreviewUrl(selectedResource.value.url)
  })

  // 选择资源进行预览
  const selectResource = async (resource: PreviewResource) => {
    // 如果是同一个资源，不重复加载
    if (selectedResource.value?.id === resource.id && selectedResource.value?.url === resource.url) {
      return
    }

    loading.value = true
    selectedResource.value = resource

    // 模拟加载延迟（实际上 iframe 会自己加载）
    await nextTick()
    loading.value = false
  }

  // 清空预览
  const clearPreview = () => {
    selectedResource.value = null
    loading.value = false
  }

  return {
    // 状态
    selectedResource,
    loading,
    currentFileType,
    isIframeType,
    previewUrl,
    
    // 方法
    getFileType,
    getIconClass,
    getPreviewUrl,
    selectResource,
    clearPreview,
    base64Encode,
  }
}
