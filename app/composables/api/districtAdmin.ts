/**
 * 区管理员 API
 */
import { useHttp } from "./useHttp";

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
    numberName?: string;
    pageNum?: number;
    pageSize?: number;
  }) => {
    try {
      const queryParams: Record<string, any> = {};

      if (params?.numberName) {
        queryParams['params[numberName]'] = params.numberName
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
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('导出失败')
    }
    
    // 获取文件名
    const contentDisposition = response.headers.get('content-disposition')
    let filename = '学校管理列表.xlsx'
    if (contentDisposition) {
      // 优先匹配 filename*=utf-8''xxx 格式（URL编码的中文）
      let match = contentDisposition.match(/filename\*=utf-8''([^;\s]+)/i)
      if (match) {
        filename = decodeURIComponent(match[1])
      } else {
        // 尝试匹配 filename=xxx 格式
        match = contentDisposition.match(/filename=([^;\s]+)/i)
        if (match) {
          // 去掉可能的引号，然后解码
          filename = decodeURIComponent(match[1].replace(/['"]/g, ''))
        }
      }
      // 截取 _ 后面的部分作为文件名
      const underscoreIndex = filename.indexOf('_')
      if (underscoreIndex !== -1) {
        filename = filename.substring(underscoreIndex + 1)
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





  return {
    getSchooleList,
    getSchoolDetail,
    updateSchool,
    exportSchoolInfo
  };
};
