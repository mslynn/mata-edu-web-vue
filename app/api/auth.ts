/**
 * 登录认证相关 API
 */
import { useHttp } from '~/composables/useHttp'
// import type { UserInfo } from '~/composables/useAuth'

// ============ 接口响应类型 ============

// 通用 API 响应包装
export interface ApiResponse<T = any> {
  code: number
  msg?: string
  message?: string
  data: T
}

// 登录数据（真实接口返回格式）
export interface LoginData {
  code: number
  access_token: string
  user_info: {
    role_name: string    // 角色名称，如"教师"
    user_name: string    // 用户名，如"teacher[000001]"
    nick_name: string    // 昵称，如"李老师"
    role_key: string     // 角色key，如"teacher"、"student"、"school"、"district"
  }
}

// 登录响应
export type LoginResponse = ApiResponse<LoginData>

// 发送验证码响应
export interface SendCodeResponse {
  success: boolean
}

// ============ API 接口 ============

/**
 * 发送验证码
 * @param phone 手机号
 * @param countryCode 国家区号，默认86
 */
export const sendSmsCode = (phone: string, countryCode: string = '86') => {
  const http = useHttp()
  return http.post<SendCodeResponse>('/api/sms/send', {
    phonenumber: phone,
    countryCode,
  })
}

/**
 * 手机验证码登录
 * @param phone 手机号
 * @param code 验证码
 * @param countryCode 国家区号
 */
export const loginByPhone = (phone: string, code: string, countryCode: string = '86') => {
  const http = useHttp()
  return http.post<LoginResponse>('/api/auth/login/phone', {
    phone,
    code,
    countryCode,
  })
}



/**
 * 用户名密码登录（/login 接口）
 * 请求体会在 request 层自动加密
 * @param username 用户名
 * @param password 密码
 * @param grantType 授权类型，默认为 'password'
 */
export const login = (username: string, password: string, grantType: string = 'password') => {
  const http = useHttp()
  return http.post<LoginResponse>('/auth/login', {
    username,
    password,
    grantType,
  })
}
/**
 * 用户退出登录（/logout 接口）
 */
export const logout = () => {
  const http = useHttp()
  return http.post('/auth/logout')
}

/**
 * 班级码登录（学生）
 * @param classCode 班级码
 * @param password 密码
 */
export const loginByClassCode = (classCode: string, password: string) => {
  const http = useHttp()
  return http.post<LoginResponse>('/api/auth/login/class', {
    classCode,
    password,
  })
}



/**
 * 获取当前用户信息
 */
// export const getUserInfo = () => {
//   const http = useHttp()
//   return http.get<UserInfo>('/api/user/info')
// }

/**
 * 获取租户列表
 */
export const getTenantList = () => {
  const http = useHttp()
  return http.get('/auth/tenant/list')
}

/**
 * 刷新token
 */
export const refreshToken = () => {
  const http = useHttp()
  return http.post<{ token: string }>('/api/auth/refresh')
}

