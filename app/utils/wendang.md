/**
 * HTTP 请求封装
 * 基于 Nuxt3 的 $fetch
 */
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

    // 处理请求体和加密
    let processedBody = body
    
    // POST 和 PUT 请求时加密请求体
    if ((method === 'POST' || method === 'PUT') && body) {
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

    try {
      const response = await $fetch<T>(url, {
        baseURL: BASE_URL,
        method,
        body: **processedBody**,
        params,
        headers: {
          'Content-Type': (method === 'POST' || method === 'PUT') && body ? 'text/plain' : 'application/json',
          ...headers
        },
        // 请求拦截
        onRequest({ options }) {
          console.log('📤 请求:', method, url, body || params || '')
        },
        // 响应拦截
        onResponse({ response }) {
          console.log('📥 响应:', response._data)
        },
        // 错误处理
        onResponseError({ response }) {
          console.error('❌ 请求错误:', response.status, response._data)
          
          // 401 未授权，清除 token
          if (response.status === 401) {
            removeToken()
            // 可以在这里跳转到登录页
            // navigateTo('/login')
          }
        }
      })

      return response
    } catch (error: any) {
      console.error('❌ 请求失败:', error)
      throw error
    }
  }

  // GET 请求
  const get = <T = any>(url: string, params?: Record<string, any>) => {
    return request<T>(url, { method: 'GET', params })
  }

  // POST 请求
  const post = <T = any>(url: string, body?: any) => {
    return request<T>(url, { method: 'POST', body })
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

// 登录参数示例：
// {
//   "username": "admin",        // 用户名
//   "password": "admin123",     // 密码
//   "grantType": "password"     // 账号密码登录
// }
// 验证码登录参数示例：
<!-- 李老师关联的手机号：18488888888 -->
// {
//   "phonenumber": "18488888888", // 手机号
//   "smsCode": "12345",           // 短信验证码
//   "grantType": "sms"            // 验证码登录
// }


市级：adm0001/123456
区级：adm0002/123456
校级：school000001/123456   
教师：teacher000001/Zlm137145  18488888888
学生：xiaoming0919/123456