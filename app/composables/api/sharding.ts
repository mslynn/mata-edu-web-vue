/*
 * @Author: your name
 * @Date: 2026-04-10 15:33:18
 * @LastEditTime: 2026-04-10 16:24:22
 * @LastEditors: lynn
 * @Description: In User Settings Edit
 * @FilePath: \mata-edu-web\app\composables\api\sharding.ts
 */

/**
 * 区管理员 API
 */
import { getCurrentContentLanguage, useHttp } from "./useHttp";

export const shardingAdmin = () => {
  const http = useHttp();

  //初始化分片上传
  const startUploadInit = async (data: {
    fileName: string;
    contentType: string;
  }, signal?: AbortSignal) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const params = new URLSearchParams();

      params.set("fileName", data.fileName);
      params.set("contentType", data.contentType);

      const res = await fetch(
        `${config.public.apiBaseUrl}/resource/oss/upload/init?${params.toString()}`,
        {
          method: "POST",
          signal,
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Language": getCurrentContentLanguage(),
          },
        },
      );

      const response = await res.json();
      if (response.code !== 200) {
        throw new Error(response.msg || "初始化分片上传失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 上传分片文件，文件走 form-data，其他上下文走请求参数
  const startUploadpart = async (data: {
    file: File;
    fileName: string;
    uploadId?: string;
    partNumber?: number;
  }, options?: {
    signal?: AbortSignal;
    onProgress?: (loaded: number, total: number) => void;
  }) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const formData = new FormData();
      const params = new URLSearchParams();

      formData.append("file", data.file, data.file.name);
      params.set("fileName", data.fileName);
      if (data.uploadId) {
        params.set("uploadId", data.uploadId);
      }
      if (typeof data.partNumber === "number") {
        params.set("partNumber", String(data.partNumber));
      }

      const response = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const requestUrl = `${config.public.apiBaseUrl}/resource/oss/upload/part?${params.toString()}`;

        xhr.open("POST", requestUrl);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.setRequestHeader("Content-Language", getCurrentContentLanguage());

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            options?.onProgress?.(event.loaded, event.total);
          }
        };

        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch {
            reject(new Error("解析分片上传响应失败"));
          }
        };

        xhr.onerror = () => reject(new Error("分片上传网络错误"));
        xhr.onabort = () => reject(new DOMException("用户取消上传", "AbortError"));

        if (options?.signal) {
          if (options.signal.aborted) {
            xhr.abort();
            return;
          }
          options.signal.addEventListener("abort", () => xhr.abort(), { once: true });
        }

        xhr.send(formData);
      });

      if (response.code !== 200) {
        throw new Error(response.msg || "上传分片失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  // 完成分片上传（合并分片）
  const completeUpload = async (data: {
    uploadId: string;
    fileName: string;
    parts: {
      partNumber: number;
      eTag: string;
    }[];
    fileSize: number;
    contentType: string;
  }) => {
    try {
      const response = await http.post(`/resource/oss/upload/complete`, data);
      if (response.code !== 200) {
        throw new Error(response.msg || "完成分片上传失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //取消分片上传
  const startUploadAbort = async (data: {
    fileName: string;
    contentType: string;
    uploadId?: string;
  }) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const params = new URLSearchParams();

      params.set("fileName", data.fileName);
      params.set("contentType", data.contentType);
      if (data.uploadId) {
        params.set("uploadId", data.uploadId);
      }

      const res = await fetch(
        `${config.public.apiBaseUrl}/resource/oss/upload/abort?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Language": getCurrentContentLanguage(),
          },
        },
      );

      const response = await res.json();
      if (response.code !== 200) {
        throw new Error(response.msg || "取消分片上传失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  return {
    startUploadInit,
    startUploadpart,
    completeUpload,
    startUploadAbort,
  };
};
