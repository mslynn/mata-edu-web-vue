/**
 * 登录认证相关 API
 */
import http from '~/utils/request'
import type { UserInfo, UserRole } from '~/composables/useAuth'

// ============ 接口响应类型 ============

// 登录响应
export interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    phone?: string
    account?: string
    role: UserRole
    roleName: string
    avatar?: string
  }
}

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
  return http.post<SendCodeResponse>('/api/sms/send', {
    phone,
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
  return http.post<LoginResponse>('/api/auth/login/phone', {
    phone,
    code,
    countryCode,
  })
}

/**
 * 账号密码登录
 * @param account 账号
 * @param password 密码
 */
export const loginByPassword = (account: string, password: string) => {
  return http.post<LoginResponse>('/api/auth/login/password', {
    account,
    password,
  })
}

/**
 * 班级码登录（学生）
 * @param classCode 班级码
 * @param password 密码
 */
export const loginByClassCode = (classCode: string, password: string) => {
  return http.post<LoginResponse>('/api/auth/login/class', {
    classCode,
    password,
  })
}

/**
 * 退出登录
 */
export const logout = () => {
  return http.post('/api/auth/logout')
}

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return http.get<UserInfo>('/api/user/info')
}

/**
 * 刷新token
 */
export const refreshToken = () => {
  return http.post<{ token: string }>('/api/auth/refresh')
}

