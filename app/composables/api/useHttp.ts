/**
 * HTTP 请求封装
 * 基于 Nuxt3 的 $fetch
 */
// 已全局引入 ElMessage，无需在此单独引入
import { ElMessage } from 'element-plus'
import { generateAesKey, encryptWithAes, encryptBase64 } from '~/utils/crypto'
import { encrypt } from '~/utils/jsencrypt'

// 基础配置 - 从环境变量读取
const config = useRuntimeConfig()
const BASE_URL = config.public.apiBaseUrl 

// 加密请求头名称
const ENCRYPT_HEADER = 'encrypt-key'

// 请求配置类型
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  params?: Record<string, any>
  headers?: Record<string, string>
}

export const useHttp = () => {
  // 获取 token
  const getToken = () => {
    if (import.meta.client) {
      return localStorage.getItem('token')
    }
    return null
  }

  // 设置 token
  const setToken = (token: string) => {
    if (import.meta.client) {
      localStorage.setItem('token', token)
    }
  }

  // 清除 token
  const removeToken = () => {
    if (import.meta.client) {
      localStorage.removeItem('token')
    }
  }

  // 统一处理 401/403 认证错误
  const handleAuthError = (code: number, message?: string) => {
    if (code === 401) {
      removeToken()
      ElMessage.error(message || '登录已过期，2秒后跳转到登录页')
      setTimeout(() => {
        if (import.meta.client) {
          window.location.href = '/'
        }
      }, 2000)
      return true
    }
    
    if (code === 403) {
      removeToken()
      ElMessage.error(message || '无访问权限，2秒后跳转到登录页')
      setTimeout(() => {
        if (import.meta.client) {
          window.location.href = '/'
        }
      }, 2000)
      return true
    }
    
    return false
  }

  // 通用请求方法
  const request = async <T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const { method = 'GET', body, params, headers = {} } = options

    // 添加 token 到请求头
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // 添加语言标识到请求头
    const locale = import.meta.client ? (localStorage.getItem('locale') || 'zh') : 'zh'
    headers['Content-Language'] = locale === 'en' ? 'en_US' : 'zh_CN'
    
    // 检查是否需要加密
    const needEncrypt = headers['isEncrypt'] === 'true'
    
    // 检查是否需要显示成功提示（默认：GET 不显示，其他方法显示）
    const showSuccessMsg = headers['showSuccessMsg'] !== 'false'
    
    // 处理请求体和加密
    let processedBody = body
    
    // POST 和 PUT 请求时，如果 isEncrypt 为 true，则加密请求体
    if (needEncrypt && (method === 'POST' || method === 'PUT') && body) {
      // 生成 AES 密钥
      const aesKey = generateAesKey()
      
      // 使用 RSA 加密 AES 密钥，放入请求头
      headers[ENCRYPT_HEADER] = encrypt(encryptBase64(aesKey)) || ''
      
      // 使用 AES 加密请求体
      const dataStr = typeof body === 'object' ? JSON.stringify(body) : body
      processedBody = encryptWithAes(dataStr, aesKey)
      
      console.log('🔐 加密请求体:', { 
        original: body, 
        encrypted: processedBody,
        encryptHeader: headers[ENCRYPT_HEADER]
      })
    }
    
    // 移除前端控制用的 headers（不需要发送给后端）
    delete headers['isEncrypt']
    delete headers['showSuccessMsg']
    
    // 保存是否显示成功提示的标志（用于响应拦截）
    const shouldShowSuccess = showSuccessMsg && method !== 'GET'
    
    try {
      const response = await $fetch<T>(url, {
        baseURL: BASE_URL,
        method,
        body: processedBody,
        params,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        // 响应拦截
        onResponse({ response }) {
          const { code, msg } = response._data || {}
          
          // 统一处理认证错误
          if (handleAuthError(code)) return
          
          if (code === 200) {
            // GET 请求默认不显示成功提示
            if (msg && shouldShowSuccess) {
              // ElMessage.success(msg)
            }
          } else if (code) {
            // 业务错误
            ElMessage.error(msg || '操作失败')
          }
        },
        // 错误处理
        onResponseError({ response }) {
          // 统一处理认证错误（HTTP 状态码）
          if (handleAuthError(response.status)) return
          
          const errorMsg = response._data?.msg || '请求失败'
          ElMessage.error(errorMsg)
        }
      })

      return response
    } catch (error: any) {
      // 网络错误等异常
      if (!error?.response) {
        ElMessage.error('网络连接失败，请检查网络')
      }
      throw error
    }
  }

  // GET 请求
  const get = <T = any>(url: string, params?: Record<string, any>) => {
    return request<T>(url, { method: 'GET', params })
  }

  // POST 请求
  const post = <T = any>(url: string, body?: any, headers?: Record<string, string>) => {
    return request<T>(url, { method: 'POST', body, headers })
  }

  // PUT 请求
  const put = <T = any>(url: string, body?: any, headers?: Record<string, string>) => {
    return request<T>(url, { method: 'PUT', body, headers })
  }

  // DELETE 请求
  const del = <T = any>(url: string, params?: Record<string, any>) => {
    return request<T>(url, { method: 'DELETE', params })
  }

  // PATCH 请求
  const patch = <T = any>(url: string, body?: any) => {
    return request<T>(url, { method: 'PATCH', body })
  }

  return {
    request,
    get,
    post,
    put,
    del,
    patch,
    getToken,
    setToken,
    removeToken
  }
}
