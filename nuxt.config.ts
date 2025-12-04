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
      // API 基础地址，从环境变量读取，默认值用于开发环境
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://192.168.0.32:8080',
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
  
  // Element Plus 按需引入 + 环境变量
  vite: {
    optimizeDeps: {
      include: ['element-plus']
    },
    // 定义环境变量（RSA密钥等）
    define: {
      'import.meta.env.VITE_APP_RSA_PUBLIC_KEY': JSON.stringify(process.env.VITE_APP_RSA_PUBLIC_KEY || ''),
      'import.meta.env.VITE_APP_RSA_PRIVATE_KEY': JSON.stringify(process.env.VITE_APP_RSA_PRIVATE_KEY || ''),
    },
    // Vite 开发服务器配置 - 代理
    server: {
      proxy: {
        '/auth': {
          target: 'http://192.168.0.32:8080',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              // 暴露自定义响应头给浏览器
              proxyRes.headers['access-control-expose-headers'] = 'encrypt-key'
            })
          }
        }
      }
    }
  }
})
