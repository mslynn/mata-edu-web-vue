/**
 * 区管理员 API
 */
import { useHttp } from "./useHttp";

export interface Teacher {
  userId: string;
  nickName: string;
  userName: string;
  teacherAccount: string;
  phonenumber: number;
  createTime: string;
}

export const cityAdmin = () => {
  const http = useHttp();

  //获取区管理人员列表
  const getCityAdminList = async (params?: {
    nickPhone?: string;
    phonenumber?: number;
    pageNum?: number;
    pageSize?: number;
  }) => {
    try {
      const queryParams: Record<string, any> = {};

      if (params?.nickPhone) {
        queryParams["params[nickPhone]"] = params.nickPhone;
      }
      if (params?.phonenumber) {
        queryParams.phonenumber = params.phonenumber;
      }
   
      if (params?.pageNum) {
        queryParams.pageNum = params.pageNum;
      }
      if (params?.pageSize) {
        queryParams.pageSize = params.pageSize;
      }
      const response = await http.get("/system/user/page", queryParams);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取区管理人员列表失败");
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
const getCityAdminDetail = async (userId: string) => {
  try {
    const response = await http.get(`/system/user/detail/${userId}`);
    if (response.code !== 200) {
      throw new Error(response.msg || "获取区管理人员详情失败");
    }
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

  // 重置教师密码
  const resetCityAdminPassword = async (ids: string[]) => {
    try {
      const response = await http.post("/system/user/reset", { ids });
      if (response.code !== 200) {
        throw new Error(response.msg || "重置区管理员密码失败");
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
        'Content-Type': 'application/json'
      }
    })
    
      if (!response.ok) {
        throw new Error("导出失败");
      }

      // 获取文件名
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "学校管理列表.xlsx";
      if (contentDisposition) {
        // 优先匹配 filename*=utf-8''xxx 格式（URL编码的中文）
        let match = contentDisposition.match(/filename\*=utf-8''([^;\s]+)/i);
        if (match) {
          filename = decodeURIComponent(match[1] || "");
        } else {
          // 尝试匹配 filename=xxx 格式
          match = contentDisposition.match(/filename=([^;\s]+)/i);
          if (match) {
            // 去掉可能的引号，然后解码
            filename = decodeURIComponent(
              (match[1] || "").replace(/['"]/g, "")
            );
          }
        }
        // 截取 _ 后面的部分作为文件名
        const underscoreIndex = filename.indexOf("_");
        if (underscoreIndex !== -1) {
          filename = filename.substring(underscoreIndex + 1);
        }
      }
    
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

//导出区管理员信息（文件流下载）
const exportCityAdminInfo = async () => {
  try {
    const config = useRuntimeConfig()
    const token = http.getToken()
    
    const response = await fetch(`${config.public.apiBaseUrl}/system/user/export`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error("导出失败");
    }

    // 强制使用指定的文件名
    const filename = "区管理员列表.xlsx"; 
    
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
    getCityAdminList,
    getCityAdminDetail,
    resetCityAdminPassword,
    updateSchool,
    exportSchoolInfo,
    exportCityAdminInfo
  };
};
