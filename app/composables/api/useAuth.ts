/**
 * 登录认证
 * 使用 useHttp 封装
 */
import { useHttp } from './useHttp'

// 登录请求参数
interface LoginParams {
  username: string
  password: string
  grantType: string
}

// 登录响应（根据实际接口调整）
interface LoginResponse {
  code: number
  msg?: string
  data: {
    access_token?: string
    refresh_token?: string
    expires_in?: number
    user_info?: any
  }
  [key: string]: any
}

export const useAuth = () => {
  const http = useHttp()
  
  // 从 localStorage 初始化用户信息
  const getUserFromStorage = () => {
    if (process.client) {
      const stored = localStorage.getItem('user_info')
      return stored ? JSON.parse(stored) : null
    }
    return null
  }
  
  const user = useState<any>('auth-user', () => getUserFromStorage())

  // token 状态（从 localStorage 同步）
  const token = computed(() => http.getToken())
  const isLoggedIn = computed(() => !!http.getToken())

  // 根据角色获取跳转路径
  const getRedirectPathByRole = (roleKey?: string) => {
    console.log('roleKey', roleKey)
    switch (roleKey) {
      case 'teacher':
        return '/system/class'
       case 'school_admin':
        return '/system/user'
      case 'student':
        return '/student'
   
      case 'city_admin':
        return '/district'
       case 'district_admin':
        return '/district'
      default:
        return '/'
    }
  }

  // 登录
  const login = async (username: string, password: string, grantType: string = 'password') => {
    try {
      // 根据 grantType 构建请求参数
      let requestBody: any = { grantType }
      
      if (grantType === 'sms') {
        // 验证码登录：phonenumber + smsCode
        requestBody.phonenumber = username
        requestBody.smsCode = password
      } else {
        // 密码登录：username + password
        requestBody.username = username
        requestBody.password = password
      }
      
      console.log('🔐 登录请求参数:', requestBody)
      
      const response = await http.post<LoginResponse>('/auth/login', requestBody, {
        'isEncrypt': 'true'
      })
      
      console.log('📥 登录响应:', response)
      
      console.log('登录信息:', response)
      
      // 保存 accessToken
      const accessToken = response.data.access_token
      if (accessToken) {
        http.setToken(accessToken)
      }
      
      // 保存用户信息到 state 和 localStorage
      const userInfo = response.data.user_info
      user.value = userInfo
      if (process.client && userInfo) {
        localStorage.setItem('user_info', JSON.stringify(userInfo))
      }
      
      console.log('👤 用户信息已保存:', userInfo)
      
      // 根据角色跳转到对应页面
      const redirectPath = getRedirectPathByRole(userInfo?.role_key)
      
      return { ...response, redirectPath }
    } catch (error: any) {
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      // 调用登出接口
      const res =  await http.post('/auth/logout')
      console.log('✅ 登出成功', res)
      
      // 接口成功后，清除本地数据并跳转
      http.removeToken()
      user.value = null
      if (process.client) {
        localStorage.removeItem('user_info')
        localStorage.removeItem('teacher-nav-menus') // 清除侧边栏菜单缓存
        // 跳转到登录页 - 使用 window.location.href 硬刷新
        window.location.href = '/'
      }
    } catch (error: any) {
      // 静默处理
    }
  }

  //获取手机验证码
  const getSmsCode = async (phonenumber: string) => {
    try {
      const response = await http.get(`/resource/sms/code?phonenumber=${phonenumber}`)
      return response
    } catch (error: any) {
      throw error
    }
  }

  //申请体验账号
  const applyTrialAccount = async (name: string, phonenumber: string, smsCode: string, organizationName: string, purpose: string, product: string) => {
    try {
      const response = await http.post(`/auth/trial/apply`, {
        name,
        phonenumber,
        smsCode,
        organizationName,
        purpose,
        product
      })
      return response
    } catch (error: any) {
      throw error
    }
  }

  //重置密码
  const resetPassword = async (phonenumber: string, smsCode: string, passwordNew: string) => {
    try {
      const response = await http.post(`/auth/reset`, {
        phonenumber,
        smsCode,
        passwordNew
      }, {
        'isEncrypt': 'true'
      })
      return response
    } catch (error: any) {
      throw error
    }
  }
  //b班级码登录
  const classCodeLogin = async (classCode: string, classCodePwd: string) => {
    try {
      const response = await http.post('/auth/classCodeLogin', {
        classCode,
        classCodePwd
      })
      return response
    } catch (error: any) {
      throw error
    }
  }



  return {
    token,
    user,
    isLoggedIn,
    login,
    logout,
    classCodeLogin,
    getRedirectPathByRole,
    getSmsCode,
    applyTrialAccount,
    resetPassword
  }
}
