// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    host: '127.0.0.1',
    port: 3001,
  },
  
  // 运行时配置 - API地址等
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    }
  },
  
  // 解决 SSR 样式闪烁问题
  experimental: {
    inlineSSRStyles: true,
  },
  
  // 禁用 SSR，使用纯客户端渲染避免水合问题
  ssr: false,
  
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: [
    '~/assets/css/main.css',
    'element-plus/dist/index.css'
  ],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  
  // Element Plus 按需引入
  vite: {
    optimizeDeps: {
      include: ['element-plus']
    }
  }
})
