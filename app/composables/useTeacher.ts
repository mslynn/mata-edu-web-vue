/**
 * 教师相关 API
 */
import { ElMessage } from 'element-plus'

export const useTeacher = () => {
  const http = useHttp()
//获取老师的左侧菜单信息
  const getTeacherMenu = async () => {
    try {
      const response = await http.get('/system/menu/getRouters')
      return response.data
    } catch (error: any) {
     // ElMessage.error(error?.data?.msg || error?.message || '获取老师左侧菜单信息失败')
      throw error
    }
  }
  // 获取教师信息
  const getTeacherInfo = async () => {
    try {
      const response = await http.get('/teacher/info')
      if (response.code !== 200) {
        throw new Error(response.msg || '获取教师信息失败')
      }
      return response.data
    } catch (error: any) {
      //ElMessage.error(error?.data?.msg || error?.message || '获取教师信息失败')
      throw error
    }
  }

  // 获取班级列表
  const getClassList = async () => {
    try {
      const response = await http.get('/teacher/class/list')
      if (response.code !== 200) {
        throw new Error(response.msg || '获取班级列表失败')
      }
      return response.data
    } catch (error: any) {
     // ElMessage.error(error?.data?.msg || error?.message || '获取班级列表失败')
      throw error
    }
  }

  // 获取学生列表
  const getStudentList = async (classId: string) => {
    try {
      const response = await http.get(`/teacher/student/list?classId=${classId}`)
      if (response.code !== 200) {
        throw new Error(response.msg || '获取学生列表失败')
      }
      return response.data
    } catch (error: any) {
    //  ElMessage.error(error?.data?.msg || error?.message || '获取学生列表失败')
      throw error
    }
  }

  // 获取课程列表
  const getCourseList = async () => {
    try {
      const response = await http.get('/teacher/course/list')
      if (response.code !== 200) {
        throw new Error(response.msg || '获取课程列表失败')
      }
      return response.data
    } catch (error: any) {
      //ElMessage.error(error?.data?.msg || error?.message || '获取课程列表失败')
      throw error
    }
  }

  return {
    getTeacherMenu,
    getTeacherInfo,
    getClassList,
    getStudentList,
    getCourseList
  }
}

