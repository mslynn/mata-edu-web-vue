/**
 * 学校用户（教师）管理 API
 */
import { useHttp } from "./useHttp";
import { ElMessage } from '~/components/ui'

export interface Teacher {
  userId: string;
  nickName: string;
  userName: string;
  teacherAccount: string;
  phonenumber: string;
  createTime: string;
  orgId:string
}

export const useSchoolUser = () => {
  const http = useHttp();

  //获取学校列表
  const getOrgTree = async () => {
    try {
      const response = await http.get("/system/user/orgTree");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校列表失败");
      }
      return response.data || [];
    } catch (error: any) {
      throw error;
    }
  };

  // 获取用户列表（班级转让用）
  const getUserList = async () => {
    try {
      const response = await http.get("/system/user/list");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取用户列表失败");
      }
      return response.data || [];
    } catch (error: any) {
      throw error;
    }
  };

  // 获取教师列表
  const getTeacherList = async (params?: {
    orgId?:string
    userNick?: string;
    pageNum?: number;
    pageSize?: number;
  }) => {
    try {
      const queryParams: Record<string, any> = {};
      if (params?.orgId) {
        queryParams.orgId = params.orgId;
      }
      if (params?.userNick) {
        // queryParams.userNick = params.userNick;
        queryParams['params[userNick]'] = params.userNick
      }
      if (params?.pageNum) {
        queryParams.pageNum = params.pageNum;
      }
      if (params?.pageSize) {
        queryParams.pageSize = params.pageSize;
      }
      const response = await http.get("/system/user/page", queryParams);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师列表失败");
      }
      return {
        list: response.rows || [],
        total: response.total || 0,
      };
    } catch (error: any) {
      throw error;
    }
  };
  // const getStudentList = async (data: { classId: string; numberName?: string }) => {
  //   try {
  //     // 构建查询参数，numberName 需要转换为 params[numberName] 格式
  //     const queryParams: Record<string, any> = { classId: data.classId }
  //     if (data.numberName) {
  //       queryParams['params[numberName]'] = data.numberName
  //     }
  //     const response = await http.get('/system/student/list', queryParams)
  //     if (response.code !== 200) {
  //       throw new Error(response.msg || '获取学生列表失败')
  //     }
  //     return response.rows || response.data
  //   } catch (error: any) {
  //     throw error
  //   }
  // }

  // 创建教师
  const createTeacher = async (data: {
    orgId: string;
    nickName: string;
    phonenumber: string;
    countryCode?: string;
  }) => {
    try {
      const response = await http.post("/system/user", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "创建教师失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 编辑教师
  const updateTeacher = async (data: {
    userId: string;
    nickName: string;
    phonenumber: string;
    countryCode?: string;
  }) => {
    try {
      const response = await http.put("/system/user", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "编辑教师失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 删除教师
  const deleteTeacher = async (userIds: string[], password?: string) => {
    try {
      // 有密码时需要加密（批量删除），无密码时不加密（单个删除）
      const headers = password ? { 'isEncrypt': 'true' } : {}
      const response = await http.post("/system/user/remove", { ids: userIds, password }, { 'isEncrypt': 'true' });
      if (response.code !== 200) {
        throw new Error(response.msg || "删除教师失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 重置教师密码
  const resetTeacherPassword = async (ids: string[], password?: string, orgId?: string) => {
    try {
      // 始终加密
      const headers = { 'isEncrypt': 'true' }
      const payload: Record<string, any> = { ids, password };
      if (orgId) {
        payload.orgId = orgId;
      }
      const response = await http.post("/system/user/reset", payload, headers);
      if (response.code !== 200) {
        throw new Error(response.msg || "重置密码失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };


  //班级转让对应老师年级列表
  const transferGrade = async (userId: string, orgId?: string) => {
    try {
      const params: any = { userId }
      if (orgId) params.orgId = orgId
      const response = await http.get("/system/user/grade", params);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级转让年级列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //班级转让对应老师班级列表
  const transferClassList = async (params: {
    teacherId: string;
    grade: string;
    schoolId: string;
  }) => {
    try {
      const response = await http.get("/system/user/class", params);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取班级转让班级列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 班级转让
  const transferClass = async (data: {
    teacherId: string;
    classId: string;
    schoolId: string;
    targetTeacherId: string;
    className:string
  
  }) => {
    try {
      const response = await http.post("/system/user/move", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "班级转让失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 获取教师统一密码
  const getTeacherPassword = async (orgId?: string) => {
    try {
      const params: Record<string, any> = {};
      if (orgId) {
        params.orgId = orgId;
      }
      const response = await http.get("/system/org/getPwd", params);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取教师统一密码失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 获取学校信息
  const getSchoolInfo = async () => {
    try {
      const response = await http.get("/system/school/info");
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校信息失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //导出教师信息（文件流下载）
  const exportTeacherInfo = async (filename: string = "教师账号信息.xlsx") => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();

      const response = await fetch(
        `${config.public.apiBaseUrl}/system/user/export`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("导出失败");
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error: any) {
      throw error;
    }
  };

  // 导入教师信息
  const importTeacher = async (file: File, orgId: string) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("orgId", orgId);

      const response = await fetch(
        `${config.public.apiBaseUrl}/system/user/importData`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (result.msg) {
        if (result.code === 200) {
          ElMessage.success(result.msg)
        } else {
          ElMessage.error(result.msg)
        }
      }
      if (result.code !== 200) {
        throw new Error(result.msg || "导入失败");
      }
      return result.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 下载教师导入模板
  const downloadTeacherTemplate = async () => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();

      const response = await fetch(
        `${config.public.apiBaseUrl}/system/user/template`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("下载失败");
      }

      const filename = "教师账号批量导入模板.xlsx";

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    getOrgTree,
    getUserList,
    getTeacherList,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    resetTeacherPassword,
    getTeacherPassword,
    getSchoolInfo,
    importTeacher,
    downloadTeacherTemplate,
    exportTeacherInfo,
    transferGrade,
    transferClassList,
    transferClass,
  };
};
