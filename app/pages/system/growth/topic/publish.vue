<template>
  <div class="publish-page flex-1 flex flex-col">
    <!-- 顶部导航 -->
    <div class="publish-header flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
      <div class="flex items-center gap-3">
        <button class="back-btn w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" @click="goBack">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-medium text-gray-800">{{ $t('growth.publishTopic') }}</h1>
      </div>
      <button 
        class="px-6 py-2 bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canPublish"
        @click="handlePublish"
      >
        {{ $t('growth.publish') }}
      </button>
    </div>

    <!-- 内容区 -->
    <div class="flex-1 overflow-auto p-6 bg-gray-50">
      <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <!-- 标题输入 -->
        <div class="mb-6">
          <input 
            v-model="topicTitle"
            type="text"
            :placeholder="$t('growth.inputTitle')"
            class="w-full text-xl font-medium border-0 border-b border-gray-200 pb-3 outline-none focus:border-[#FF9900] placeholder-gray-400"
          />
        </div>

        <!-- 富文本编辑器 -->
        <div class="editor-container">
          <ClientOnly>
            <Toolbar
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
              class="editor-toolbar"
            />
            <Editor
              v-model="valueHtml"
              :defaultConfig="editorConfig"
              mode="default"
              class="editor-content"
              @onCreated="handleCreated"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { growthAdmin } from '~/composables/api/growth'

definePageMeta({
  layout: 'sidebar'
})

const { t } = useI18n()
const router = useRouter()
const config = useRuntimeConfig()
const { publishTeacherCourseTopic } = growthAdmin()

// 获取token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || ''
  }
  return ''
}

// 动态导入 WangEditor 组件（仅客户端）
// @ts-ignore
const Editor = defineAsyncComponent(() =>
  import('@wangeditor/editor-for-vue').then(m => m.Editor)
)
// @ts-ignore
const Toolbar = defineAsyncComponent(() =>
  import('@wangeditor/editor-for-vue').then(m => m.Toolbar)
)

// 编辑器实例
const editorRef = shallowRef()

// 内容
const topicTitle = ref('')
const valueHtml = ref('')
const publishing = ref(false)

// 工具栏配置
const toolbarConfig = {
  excludeKeys: [
    'group-video', // 排除视频
    'fullScreen'   // 排除全屏
  ]
}

// 编辑器配置
const editorConfig = {
  placeholder: t('growth.inputContent'),
  MENU_CONF: {
    uploadImage: {
      server: `${config.public.apiBaseUrl}/resource/oss/upload`,
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: ['image/*'],
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      // 自定义插入图片
      customInsert(res: any, insertFn: (url: string, alt?: string, href?: string) => void) {
        // res 是服务端返回的数据
        if (res.code === 200 && res.data?.url) {
          insertFn(res.data.url, '', '')
        }
      },
      onError(file: File, err: Error) {
        console.error('上传图片失败', file, err)
      }
    }
  }
}

// 编辑器创建完成
const handleCreated = (editor: any) => {
  editorRef.value = editor
}

// 是否可以发布
const canPublish = computed(() => {
  return topicTitle.value.trim() && valueHtml.value.trim() && valueHtml.value !== '<p><br></p>' && !publishing.value
})

// 返回
const goBack = () => {
  router.back()
}

// 发布
const handlePublish = async () => {
  if (!canPublish.value) return
  
  publishing.value = true
  try {
    await publishTeacherCourseTopic({
      title: topicTitle.value.trim(),
      content: valueHtml.value
    })
    // 发布成功后返回
    router.back()
  } catch (error) {
    console.error('发布话题失败:', error)
  } finally {
    publishing.value = false
  }
}

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>

<style scoped>
.publish-page {
  height: calc(100vh - 70px);
  overflow: hidden;
}

.editor-container {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.editor-toolbar {
  border-bottom: 1px solid #e5e7eb;
}

.editor-content {
  min-height: 400px;
  max-height: calc(100vh - 350px);
  overflow-y: auto;
}

:deep(.w-e-text-container) {
  min-height: 400px;
}

:deep(.w-e-toolbar) {
  background-color: #fafafa;
}
</style>
