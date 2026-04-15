/**
 * 区管理员 API
 */
import { getCurrentContentLanguage, useHttp } from "./useHttp";

export interface Teacher {
  userId: string;
  nickName: string;
  userName: string;
  teacherAccount: string;
  phonenumber: string;
  createTime: string;
}

export const districtAdmin = () => {
  const http = useHttp();

  //获取学校列表
  const getSchooleList = async (params?: {
    nickPhone?: string;
    pageNum?: number;
    pageSize?: number;
  }) => {
    try {
      const queryParams: Record<string, any> = {};

      if (params?.nickPhone) {
        queryParams["params[numberName]"] = params.nickPhone;
      }
      if (params?.pageNum) {
        queryParams.pageNum = params.pageNum;
      }
      if (params?.pageSize) {
        queryParams.pageSize = params.pageSize;
      }
      const response = await http.get("/system/org/page", queryParams);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取学校列表失败");
      }
      return {
        list: response.rows || [],
        total: response.total || 0,
      };
    } catch (error: any) {
      throw error;
    }
  };

//学校详情
const getSchoolDetail = async (orgId: string) => {
  try {
    const response = await http.get(`/system/org/detail/${orgId}`);
    if (response.code !== 200) {
      throw new Error(response.msg || "获取学校详情失败");
    }
    return response.data;
  } catch (error: any) {
    throw error;
  }
};







// 更新学校信息
const updateSchool = async (data: {
  orgId: string;
  orgName: string;
}) => {
  try {
    const response = await http.put("/system/org", data);
    if (response.code !== 200) {
      throw new Error(response.msg || "更新学校信息失败");
    }
    return response.data;
  } catch (error: any) {
    throw error;
  }
};


//导出学校信息（文件流下载）
const exportSchoolInfo = async () => {
  try {
    const config = useRuntimeConfig()
    const token = http.getToken()
    
    const response = await fetch(`${config.public.apiBaseUrl}/system/org/export`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Content-Language': getCurrentContentLanguage()
      }
    })
    
    if (!response.ok) {
      throw new Error('导出失败')
    }
    
    const filename = '开课学校信息.xlsx'
    
    // 下载文件
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    return true
  } catch (error: any) {
    throw error
  }
}





  return {
    getSchooleList,
    getSchoolDetail,
    updateSchool,
    exportSchoolInfo
  };
};
