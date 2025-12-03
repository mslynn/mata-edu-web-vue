/**
 * HTTP 请求封装
 * 基于 Nuxt3 的 $fetch
 */
import { ElMessage } from 'element-plus'
import { generateAesKey, encryptWithAes, encryptBase64 } from '~/utils/crypto'
import { encrypt } from '~/utils/jsencrypt'

// 基础配置
const BASE_URL = 'http://192.168.0.34:8080'

// 加密请求头名称
const ENCRYPT_HEADER = 'encrypt-key'

// 请求配置类型
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  params?: Record<string, any>
  headers?: Record<string, string>
}

// 响应类型
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export const useHttp = () => {
  // 获取 token
  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('token')
    }
    return null
  }

  // 设置 token
  const setToken = (token: string) => {
    if (process.client) {
      localStorage.setItem('token', token)
    }
  }

  // 清除 token
  const removeToken = () => {
    if (process.client) {
      localStorage.removeItem('token')
    }
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
    
    // 检查是否需要加密
    const needEncrypt = headers['isEncrypt'] === 'true'
    
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
    
    // 移除 isEncrypt header（这是给前端用的，不需要发送给后端）
    delete headers['isEncrypt']
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
        // 请求拦截
        onRequest({ options }) {
          console.log('📤 请求:', method, url, body || params || '')
        },
        // 响应拦截
        onResponse({ response }) {
          console.log('📥 响应:', response._data)
          const { code, msg } = response._data || {}
          if (code === 200) {
            // 成功时如果有 msg 才提示
            if (msg) {
              ElMessage.success(msg)
            }
          } else if (code) {
            // 业务错误
            ElMessage.error(msg || '操作失败')
          }
        },
        // 错误处理
        onResponseError({ response }) {
          const errorMsg = response._data?.msg  || '请求失败'
          ElMessage.error(errorMsg)
          
          // 401 未授权，清除 token
          if (response.status === 401) {
            removeToken()
            ElMessage.error('登录已过期，请重新登录')
            // 可以在这里跳转到登录页
            // navigateTo('/login')
          }
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
  const put = <T = any>(url: string, body?: any) => {
    return request<T>(url, { method: 'PUT', body })
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

