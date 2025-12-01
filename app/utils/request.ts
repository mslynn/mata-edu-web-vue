/**
 * HTTP 请求封装
 * 基于 Nuxt3 的 $fetch
 */

// API 响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 请求配置
interface RequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

// 获取API基础地址
const getBaseURL = (): string => {
  if (import.meta.client) {
    const config = useRuntimeConfig()
    return config.public.apiBaseUrl as string || ''
  }
  return ''
}

// 默认配置
const defaultConfig: RequestConfig = {
  baseURL: '', // 会在请求时动态获取
  timeout: 30000,
}

/**
 * 封装请求方法
 */
class HttpRequest {
  private config: RequestConfig

  constructor(config: RequestConfig = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  // 获取token
  private getToken(): string | null {
    if (import.meta.client) {
      const token = useCookie('token')
      return token.value || null
    }
    return null
  }

  // 通用请求方法
  async request<T = any>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: any
      params?: Record<string, any>
      headers?: Record<string, string>
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, params, headers = {} } = options

    // 构建完整URL（动态获取baseURL）
    const baseURL = this.config.baseURL || getBaseURL()
    const fullUrl = baseURL + url

    // 添加token到header
    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await $fetch<ApiResponse<T>>(fullUrl, {
        method,
        body,
        params,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...headers,
        },
        timeout: this.config.timeout,
      })

      // 业务错误处理
      if (response.code !== 200 && response.code !== 0) {
        console.error(`[API Error] ${url}:`, response.message)
        return response
      }

      return response
    } catch (error: any) {
      console.error(`[Request Error] ${url}:`, error)
      
      // 处理HTTP错误
      if (error.response) {
        const status = error.response.status
        if (status === 401) {
          // token过期，清除登录状态
          const tokenCookie = useCookie('token')
          tokenCookie.value = null
          if (import.meta.client) {
            window.location.href = '/'
          }
        }
      }

      return {
        code: error.response?.status || 500,
        message: error.message || '网络请求失败',
        data: null as any,
      }
    }
  }

  // GET 请求
  get<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>) {
    return this.request<T>(url, { method: 'GET', params, headers })
  }

  // POST 请求
  post<T = any>(url: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(url, { method: 'POST', body, headers })
  }

  // PUT 请求
  put<T = any>(url: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(url, { method: 'PUT', body, headers })
  }

  // DELETE 请求
  delete<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>) {
    return this.request<T>(url, { method: 'DELETE', params, headers })
  }

  // PATCH 请求
  patch<T = any>(url: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(url, { method: 'PATCH', body, headers })
  }
}

// 创建实例
export const http = new HttpRequest()

// 也可以创建带自定义配置的实例
export const createHttp = (config: RequestConfig) => new HttpRequest(config)

export default http

