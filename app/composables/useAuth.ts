// 用户类型
export type UserRole = 'district' | 'school' | 'teacher' | 'student'

// 用户信息接口
export interface UserInfo {
  id: string
  name: string
  phone: string
  role: UserRole
  roleName: string
  avatar?: string
}

// 模拟用户数据 - 根据手机号尾号判断用户类型
const mockUsers: Record<string, UserInfo> = {
  // 手机号尾号1 - 市区管理员
  '13800000001': {
    id: 'district_001',
    name: '张市区管理员',
    phone: '13418857011',
    role: 'district',
    roleName: '市区管理员',
    avatar: ''
  },
  // 手机号尾号2 - 学校管理员
  '13800000002': {
    id: 'school_001',
    name: '李学校管理员',
    phone: '13800000002',
    role: 'school',
    roleName: '学校管理员',
    avatar: ''
  },
  // 手机号尾号3 - 老师
  '13800000003': {
    id: 'teacher_001',
    name: '王老师',
    phone: '13800000003',
    role: 'teacher',
    roleName: '老师',
    avatar: ''
  },
  // 手机号尾号4 - 学生
  '13800000004': {
    id: 'student_001',
    name: '小明同学',
    phone: '13800000004',
    role: 'student',
    roleName: '学生',
    avatar: ''
  }
}

// 根据手机号尾号获取用户角色
const getRoleByPhoneLastDigit = (phone: string): UserRole => {
  const lastDigit = phone.slice(-1)
  const roleMap: Record<string, UserRole> = {
    '1': 'district',
    '2': 'school',
    '3': 'teacher',
    '4': 'student'
  }
  return roleMap[lastDigit] || 'student' // 默认返回学生
}

// 生成模拟用户
const generateMockUser = (phone: string): UserInfo => {
  // 先检查是否有预设用户
  if (mockUsers[phone]) {
    return mockUsers[phone]
  }
  
  // 根据手机号尾号生成用户
  const role = getRoleByPhoneLastDigit(phone)
  const roleNameMap: Record<UserRole, string> = {
    'district': '市区管理员',
    'school': '学校管理员',
    'teacher': '老师',
    'student': '学生'
  }
  
  return {
    id: `${role}_${Date.now()}`,
    name: `${roleNameMap[role]}用户`,
    phone,
    role,
    roleName: roleNameMap[role],
    avatar: ''
  }
}

export const useAuth = () => {
  const token = useCookie<string | null>('token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7, // 7天
    secure: true,
    sameSite: 'strict'
  })

  const userInfo = useCookie<UserInfo | null>('userInfo', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7
  })

  const isAuthenticated = computed(() => !!token.value)

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  const clearToken = () => {
    token.value = null
    userInfo.value = null
  }

  // 模拟发送验证码
  const sendVerificationCode = async (phone: string): Promise<{ success: boolean; message: string }> => {
    // 模拟验证码发送，实际验证码固定为 123456
    console.log(`[Mock] 向 ${phone} 发送验证码: 123456`)
    return {
      success: true,
      message: '验证码已发送，测试验证码为: 123456'
    }
  }

  // 手机号验证码登录
  const loginByPhone = async (phone: string, code: string): Promise<{ success: boolean; message: string; user?: UserInfo }> => {
    // 模拟验证码验证 - 固定验证码为 123456
    if (code !== '123456') {
      return {
        success: false,
        message: '验证码错误，请输入 123456'
      }
    }

    // 生成用户信息
    const user = generateMockUser(phone)
    
    // 设置 token 和用户信息
    setToken('mock-token-' + Date.now())
    setUserInfo(user)

    return {
      success: true,
      message: '登录成功',
      user
    }
  }

  // 通用登录方法
  const login = async (credentials: { 
    account?: string
    password?: string
    phone?: string
    code?: string
    classCode?: string
    classPassword?: string 
  }) => {
    // 如果是手机号登录
    if (credentials.phone && credentials.code) {
      return await loginByPhone(credentials.phone, credentials.code)
    }

    // TODO: 其他登录方式
    setToken('mock-token-' + Date.now())
    return { success: true, message: '登录成功' }
  }

  /**
   * 根据用户角色获取跳转路径
   *    district => /district
   *    school   => /school
   *    teacher  => /teacher
   *    student  => /student
   */
  const getRedirectPath = (): string => {
    if (!userInfo.value) return '/'
    
    const pathMap: Record<UserRole, string> = {
      'district': '/district',
      'school': '/school',
      'teacher': '/teacher',
      'student': '/student'
    }
    
    return pathMap[userInfo.value.role]
  }

  const logout = () => {
    clearToken()
    // 使用 window.location.replace 确保完全跳转并清除历史记录
    if (import.meta.client) {
      window.location.replace('/')
    } else {
      navigateTo('/')
    }
  }

  return {
    token: readonly(token),
    userInfo: readonly(userInfo),
    isAuthenticated,
    setToken,
    setUserInfo,
    clearToken,
    sendVerificationCode,
    loginByPhone,
    login,
    getRedirectPath,
    logout
  }
}
