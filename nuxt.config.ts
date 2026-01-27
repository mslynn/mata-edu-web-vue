// https://nuxt.com/docs/api/configuration/nuxt-config  'http://192.168.0.54:8001'  ws://192.168.0.54:8001/resource/websocket

// 根据环境直接设置 API 地址
const apiBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://test-gateway.matatastudio.com'
  : 'http://192.168.0.24:8001'

// 预览服务地址

const previewBaseUrl = process.env.NODE_ENV === 'production'
  ? 'https://edu-view.matatastudio.com'
  : 'https://edu-view.matatastudio.com'

//websocket通信
const signalingUrl = process.env.NODE_ENV === 'production'
  ? 'ws://test-gateway.matatastudio.com/resource/websocket'
  : 'ws://test-gateway.matatastudio.com/resource/websocket'



// const signalingUrl = process.env.NUXT_PUBLIC_SIGNALING_URL || 'ws://192.168.0.59:8001/resource/websocket'

console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('apiBaseUrl:', apiBaseUrl)
console.log('previewBaseUrl:', previewBaseUrl)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: 3001,
  },

  // 运行时配置 - API地址等
  runtimeConfig: {
    public: {
      //   apiBaseUrl:'https://test-gateway.matatastudio.com',
      // API 基础地址，从环境变量读取，默认值用于开发环境
      apiBaseUrl: apiBaseUrl || 'http://192.168.0.65:8001',
      // 预览服务地址
      previewBaseUrl: previewBaseUrl || 'https://edu-view.matatastudio.com',
      // WebRTC 信令服务器地址
      signalingUrl: signalingUrl || 'ws://192.168.0.59:8001/resource/websocket',
    }
  },

  // 禁用 SSR，使用纯客户端渲染避免水合问题
  ssr: false,

  modules: [
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
    viewer: true,
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
