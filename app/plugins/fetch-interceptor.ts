/**
 * 全局 $fetch 拦截器
 * 为所有请求添加 content-language 请求头
 */
export default defineNuxtPlugin(() => {
  globalThis.$fetch = $fetch.create({
    onRequest({ options }) {
      // 获取当前语言
      const locale = import.meta.client ? (localStorage.getItem('locale') || 'zh') : 'zh'
      const langValue = locale === 'en' ? 'en_US' : 'zh_CN'
      
      // 添加 content-language 请求头
      if (options.headers instanceof Headers) {
        if (!options.headers.has('content-language')) {
          options.headers.set('content-language', langValue)
        }
      } else {
        const newHeaders: Record<string, string> = {
          ...(options.headers as Record<string, string> || {}),
          'content-language': langValue
        }
        ;(options as any).headers = newHeaders
      }
    }
  })
})
