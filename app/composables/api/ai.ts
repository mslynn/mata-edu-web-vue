/*
 * @Author: your name
 * @Date: 2026-03-11 15:16:56
 * @LastEditTime: 2026-03-12 12:02:19
 * @LastEditors: lynn
 * @Description: In User Settings Edit
 * @FilePath: \mata-edu-web\app\composables\api\ai.ts
 */

/**
 * ai实践 API
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

export interface AiListParams {
  optType: string;
  userId: string;
}
// 图像分类:image_cls 语音分类:audio_cls 姿态分类:pose_cls 手势分类:gesture_cls

export const aiAdmin = () => {
  const http = useHttp();
  //查询AI实践列表
  //   const getAiList = async () => {
  //     try {
  //       const response = await http.get("/system/ai/opt/list");
  //       if (response.code !== 200) {
  //         throw new Error(response.msg || "查询AI实践列表失败");
  //       }
  //       return response.data;
  //     } catch (error: any) {
  //       throw error;
  //     }
  //   };

  //玛塔编程平台SSO登录
  const ssoLogin = async () => {
    try {
      const response = await http.post("/system/matatacode/sso/login");   
        if (response.code !== 200) {
            throw new Error(response.msg || "SSO登录失败");
        }   
        return response.data;
    } catch (error: any) {
        throw error;
    }
  };


  const getAiList = async (params: AiListParams) => {
    try {
      const response = await http.get("/system/ai/opt/list", params);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询AI实践列表失败");
      }
      return response.rows;
    } catch (error: any) {
      throw error;
    }
  };
  //新增AI实践
  const createAi = async (data: {
    optName: string;
    optType: string;
    userId: string;
    ossId: number | string;
  }) => {
    try {
      const response = await http.post("/system/ai/opt", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "新增AI实践失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //修改AI实践
  const updateAi = async (data: { optId: string }) => {
    try {
      const response = await http.put("/system/ai/opt", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "更新AI实践失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除AI实践
  const deleteAi = async (optIds: string) => {
    try {
      const response = await http.del(`/system/ai/opt/${optIds}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除AI实践失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //删除OSS对象存储
  const deleteOss = async (ossId: string) => {
    try {
      const response = await http.del(`/resource/oss/${ossId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除OSS对象存储失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    ssoLogin,
    getAiList,
    createAi,
    updateAi,
    deleteAi,
    deleteOss
  };
};
