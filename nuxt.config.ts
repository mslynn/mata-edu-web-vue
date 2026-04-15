// https://nuxt.com/docs/api/configuration/nuxt-config  'http://192.168.0.54:8001'  ws://192.168.0.54:8001/resource/websocket

// 根据环境直接设置 API 地址
const apiBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://test-gateway.matatastudio.com'
  : 'https://test-gateway.matatastudio.com'

// 预览服务地址

const previewBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://edu-view.matatastudio.com'
  : 'https://edu-view.matatastudio.com'
  
//编程平台iframe地址 
// const toolCreateBaseUrl = process.env.NUXT_PUBLIC_TOOL_CREATE_URL || 'http://192.168.0.199:8601/' ws://192.168.0.60:8001/resource/websocket

//websocket通信
const signalingUrl = process.env.NODE_ENV === 'production'
  ? 'wss://test-gateway.matatastudio.com/resource/websocket'
  : 'ws://192.168.0.60:8001/resource/websocket'



// const signalingUrl = process.env.NUXT_PUBLIC_SIGNALING_URL || 'ws://192.168.0.59:8001/resource/websocket'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  app: {
    head: {
      title: 'AI智学云-教育平台',
      meta: [
        { name: 'keywords', content: 'AI智学云,教育平台' },
        { name: 'description', content: 'AI智学云-教育平台' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/key.png' },
        { rel: 'shortcut icon', type: 'image/png', href: '/key.png' },
        { rel: 'apple-touch-icon', href: '/key.png' }
      ]
    }
  },
  devServer: {
    // host:'0.0.0.0',
    host: '127.0.0.1',
    port: 3001,
  },
//localhost
  // 运行时配置 - API地址等
  runtimeConfig: {
    public: {
      //   apiBaseUrl:'https://test-gateway.matatastudio.com',
      // API 基础地址，从环境变量读取，默认值用于开发环境
      apiBaseUrl: apiBaseUrl || 'http://192.168.0.59:8001',
      // 预览服务地址
      previewBaseUrl: previewBaseUrl || 'https://edu-view.matatastudio.com',
      // 工具中心创建地址
    //  toolCreateBaseUrl,
      vincibotCreateUrl: process.env.NUXT_PUBLIC_TOOL_CREATE_URL || 'http://192.168.0.199:8601/',
      nousCreateUrl: process.env.NUXT_PUBLIC_TOOL_CREATE_URL || 'http://192.168.0.199:8601/',
      // WebRTC 信令服务器地址
      signalingUrl: signalingUrl || 'ws://192.168.0.60:8001/resource/websocket',
      // Cloudflare Turnstile 站点公钥
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    }
  },

  // 禁用 SSR，使用纯客户端渲染避免水合问题
  ssr: false,

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  // 组件配置 - ui 目录下的组件不使用路径前缀
  components: [
    {
      path: '~/components',
      pathPrefix: false, // 不使用路径前缀
    }
  ],
  css: [
    '~/assets/css/main.css',
    'element-plus/dist/index.css'
  ],
  tailwindcss: {
    exposeConfig: true,
    viewer: process.env.NODE_ENV !== 'production',
  },

  // 修改构建产物输出目录为 dist (默认是隐藏的 .output)
  nitro: {
    output: {
      dir: 'dist',
      serverDir: 'dist/server',
      publicDir: 'dist/public'
    }
  },

  // Element Plus 按需引入 + 环境变量
  vite: {
    optimizeDeps: {
      include: ['element-plus']
    },
    // esbuild: {
    //   drop: ['console', 'debugger']
    // },
    // 定义环境变量（RSA密钥等）
    define: {
      'import.meta.env.VITE_APP_RSA_PUBLIC_KEY': JSON.stringify(process.env.VITE_APP_RSA_PUBLIC_KEY || 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdHnzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ=='),
    },
    // Vite 开发服务器配置 - 代理
    // server: {
    //   proxy: {
    //     '/auth': {
    //       target: 'http://192.168.0.67:8001',
    //       changeOrigin: true,
    //       secure: false,
    //       configure: (proxy) => {
    //         proxy.on('proxyRes', (proxyRes) => {
    //           // 暴露自定义响应头给浏览器
    //           proxyRes.headers['access-control-expose-headers'] = 'encrypt-key'
    //         })
    //       }
    //     }
    //   }
    // }
  }
})
