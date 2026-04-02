/*
 * @Author: your name
 * @Date: 2026-04-02 14:17:00
 * @LastEditTime: 2026-04-02 14:41:26
 * @LastEditors: lynn
 * @Description: In User Settings Edit
 * @FilePath: \mata-edu-web\app\composables\api\datacenter.ts
 */

import { useHttp } from "./useHttp";

export const datacenterApi = () => {
  const http = useHttp();

  // 获取赛事荣誉公告列表
  const getEventHonorPage = async (data: {
    provinceCode?: string;
    cityCode?: string;
    districtCode?: string;
  }) => {
    try {
      const params = Object.fromEntries(
        Object.entries(data).filter(([, value]) => String(value || "").trim())
      );
      const response = await http.get("/system/dashboard/eventHonor/list", params);
      if (response.code !== 200) {
        throw new Error(response.msg || "获取赛事荣誉公告列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  return {
    getEventHonorPage,
  };
};

export const aiAdmin = datacenterApi;
