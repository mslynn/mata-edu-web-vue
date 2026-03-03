/**
 * 登录认证
 * 使用 useHttp 封装
 */
import { useHttp } from './useHttp'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

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
  const { t } = useI18n()
  
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

  // 获取用户信息
  const getUser = async () => {
    try {
      const response = await http.get<{
        code: number
        msg: string
        data: {
          user: {
            userId: string
            username: string
            nickname: string
            avatar: string
            roleKey: string
            roleName: string
          }
        }
      }>('/system/user/get')
      
      if (response.code === 200 && response.data?.user) {
        const userInfo = response.data.user
        // 转换为统一的用户信息格式（与现有代码兼容）
        const formattedUser = {
          user_id: userInfo.userId,
          user_name: userInfo.username,
          nick_name: userInfo.nickname,
          nickname: userInfo.nickname, // 同时保留 nickname 字段
          avatar: userInfo.avatar,
          role_key: userInfo.roleKey,
          role_name: userInfo.roleName
        }
        
        // 更新用户状态
        user.value = formattedUser
        
        // 保存到 localStorage
        if (import.meta.client) {
          localStorage.setItem('user_info', JSON.stringify(formattedUser))
        }
        
        return formattedUser
      }
      
      return null
    } catch (error: any) {
      throw error
    }
  }

  // 登录
  const login = async (username: string, password: string, grantType: string = 'password', studentNumber?: string, clientId: string = '3ad3f52781fd471b86779ca0cf192508') => {
    try {
      // 根据 grantType 构建请求参数
      let requestBody: any = { grantType, clientId }
      
      if (grantType === 'sms') {
        // 验证码登录：phonenumber + smsCode
        requestBody.phonenumber = username
        requestBody.smsCode = password
      } else if (grantType === 'classcode') {
        // 班级码登录：classCode + classCodePwd + studentNumber
        requestBody.classCode = username
        requestBody.classCodePwd = password
        requestBody.studentNumber = studentNumber
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
      
      // 登录成功后调用 getUser 获取用户信息
      let userInfo = null
      try {
        userInfo = await getUser()
        console.log('👤 获取用户信息成功:', userInfo)
      } catch (e) {
        console.warn('获取用户信息失败，使用登录返回的用户信息')
        // 如果 getUser 失败，使用登录接口返回的用户信息
        userInfo = response.data.user_info
        user.value = userInfo
        if (import.meta.client && userInfo) {
          localStorage.setItem('user_info', JSON.stringify(userInfo))
        }
      }
      
      // 登录成功提示
      ElMessage.success(t('auth.loginSuccess'))
      
      // 等待 1 秒让用户看到成功提示
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
      }, {
        'ignoreAuthError': 'true'
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
  //获取班级码登录列表
  const getClassCodeLoginList = async (classId: string) => {
    try {
      const response = await http.get(`/auth/student/list/${classId}`)
      return response
    } catch (error: any) {
      throw error
    }
  }

  //peerjs token
  const getPeerjsToken = async () => {
    try {
      const response = await http.get(`/auth/peer/token`)
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
    resetPassword,
    getClassCodeLoginList,
    getPeerjsToken,
    getUser
  }
}
