/**
 *  个人中心
 */
import { useHttp } from "./useHttp";

export interface personalcenter {
  userId: string;
  nickName: string;
  userName: string;
  teacherAccount: string;
  phonenumber: number;
  createTime: string;
}

export const personalcenterApi = () => {
  const http = useHttp();

  //个人信息/
  const getProfile = async () => {
    try {
      const response = await http.get("/system/user/profile");
      if (response.code !== 200) {
        throw new Error(response.msg || "个人信息失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //修改密码
  const updatePwd = async (data: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await http.put("/system/user/profile/updatePwd", data, {
        'isEncrypt': 'true'
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "修改密码失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //注销账号
  const account = async (data: { password?: string }) => {
    try {
      const response = await http.post("/system/user/profile/account", data, {
        'isEncrypt': 'true'
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "注销账号失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //获取作品列表
  const getProfileopus = async (
    pageSize: number,
    pageNum: Number,
    opusName?: String,
    opusType?: String,
  ) => {
    try {
      const response = await http.get("/system/user/profile/opus", {
        pageSize,
        pageNum,
        opusName,
        opusType,
      });
      if (response.code !== 200) {
        throw new Error(response.msg || "获取作品列表失败");
      }
      // 返回整个 response，因为 rows 和 total 在顶层
      return {
        rows: response.rows || [],
        total: response.total || 0
      };
    } catch (error: any) {
      throw error;
    }
  };
  //获取作品详情
  const getOpusDetail = async (opusId: string) => {
    try {
      const response = await http.get(`/system/user/profile/opus/${opusId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取作品详情失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //上传作品
  const addOpus = async (data: {
    opusName: string;
    opusOssId: String;
    coverOssId: String;
    videoOssId?: String;
    picOssIds?: String;
    opusType?: String;
    opusGuide?: String;
    opusDesc?: String;
  }) => {
    try {
      const response = await http.post("/system/user/profile/opus", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "上传作品失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //修改作品
  const editOpus = async (data: {
    opusId: string;
    opusName: string;
    opusOssId: String;
    coverOssId: String;
    videoOssId?: String;
    picOssIds?: String;
    opusType?: String;
    opusGuide?: String;
  }) => {
    try {
      const response = await http.put("/system/user/profile/opus", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "修改作品失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除作品
  const deleteOpus = async (opusId: string) => {
    try {
      const response = await http.del(`/system/user/profile/opus/${opusId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
    // 上传OSS对象存储
  const uploadOSS = async (file: File) => {
    try {
      const config = useRuntimeConfig()
      const token = http.getToken()

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${config.public.apiBaseUrl}/resource/oss/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      })

      const response = await res.json()
      if (response.code !== 200) {
        throw new Error(response.msg || '上传OSS对象存储失败')
      }
      return response.data // 返回 { url, fileName, ossId }
    } catch (error: any) {
      throw error
    }
  }
    // 下载oss（返回 blob URL 用于显示图片）
  const downloadOSS = async (ossId: string) => {
    try {
      const config = useRuntimeConfig()
      const token = http.getToken()
      const response = await fetch(`${config.public.apiBaseUrl}/resource/oss/download/${ossId}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      return blobUrl
    } catch (error: any) {
      throw error
    }
  }

  return {
    getProfile,
    updatePwd,
    account,
    getProfileopus,
    getOpusDetail,
    addOpus,
    editOpus,
    deleteOpus,
    uploadOSS,
    downloadOSS  
  };
};
