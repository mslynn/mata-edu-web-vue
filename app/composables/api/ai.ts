/*
 * @Author: your name
 * @Date: 2026-03-11 15:16:56
 * @LastEditTime: 2026-05-18 16:45:57
 * @LastEditors: lynn
 * @Description: In User Settings Edit
 * @FilePath: \mata-edu-web\app\composables\api\ai.ts
 */

/**
 * ai实践 API
 */
import { getCurrentContentLanguage, useHttp } from "./useHttp";

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
export interface chat {
  sessionId?: string;
  sessionType: string | number;
  message: string;
  formData?: string;
  title?: string;
  fileRefs?: [
    {
      fileId: string;
      fileType: string;
    },
  ];
  enableThinking?: boolean;
}

interface AiChatStreamOptions {
  onChunk?: (payload: unknown, fullText: string) => void;
  signal?: AbortSignal;
}

const resolveAiStreamText = (payload: unknown): string => {
  if (payload === null || payload === undefined) return "";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    return payload.map((item) => resolveAiStreamText(item)).join("");
  }
  if (typeof payload !== "object") {
    return String(payload);
  }

  const record = payload as Record<string, unknown>;
  const directKeys = [
    "delta",
    "content",
    "text",
    "message",
    "answer",
    "reply",
    "outputText",
  ];

  for (const key of directKeys) {
    const value = record[key];
    if (value === null || value === undefined) continue;
    const resolved = resolveAiStreamText(value);
    if (resolved) {
      return resolved;
    }
  }

  const nestedKeys = ["data", "output", "choices", "messages"];
  for (const key of nestedKeys) {
    const value = record[key];
    if (value === null || value === undefined) continue;
    const resolved = resolveAiStreamText(value);
    if (resolved) {
      return resolved;
    }
  }

  return "";
};

const mergeAiStreamText = (currentText: string, incomingText: string) => {
  if (!incomingText) return currentText;
  if (!currentText) return incomingText;
  if (incomingText.startsWith(currentText)) return incomingText;
  return `${currentText}${incomingText}`;
};

const resolveAiApiResponseData = (response: Record<string, any>) => {
  if (Array.isArray(response.rows)) {
    return response.rows;
  }
  if (response.data !== undefined) {
    return response.data;
  }
  return response.rows;
};
// 图像分类:image_cls 语音分类:audio_cls 姿态分类:pose_cls 手势分类:gesture_cls

export const aiAdmin = () => {
  const http = useHttp();
  //查询AI实践列表
  //   const getAiList = async () => {
  //     try {
  //       const response = await http.get("/system/opt/list");
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
      const response = await http.get("/system/opt/list", params);
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
      const response = await http.post("/system/opt", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "新增AI实践失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //修改AI实践
  const updateAi = async (data: {
    optId: string;
    optName?: string;
    optType?: string;
    userId?: string;
    ossId?: number | string;
  }) => {
    try {
      const response = await http.put("/system/opt", data);
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
      const response = await http.del(`/system/opt/${optIds}`);
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

  //  **ai助手** **
  //查询会话历史列表
  const getAiSessions = async (sessionType?: string | number) => {
    try {
      const requestParams =
        sessionType === undefined ||
        sessionType === null ||
        String(sessionType).trim() === ""
          ? undefined
          : { sessionType };
      const response = requestParams
        ? await http.get("/system/ai/sessions", requestParams)
        : await http.get("/system/ai/sessions");
      if (response.code !== 200) {
        throw new Error(response.msg || "查询AI会话历史列表失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //查询会话消息列表
  const getSessions = async (sessionId: string) => {
    try {
      const response = await http.get(`/system/ai/sessions/${sessionId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询会话消息列表失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //删除会话
  const deleteSession = async (sessionId: string) => {
    try {
      const response = await http.del(`/system/ai/sessions/${sessionId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除会话失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询当前用户AI额度详情
  const getAiQuotaDetail = async () => {
    try {
      const response = await http.get("/system/ai/quota/detail");
      if (response.code !== 200) {
        throw new Error(response.msg || "查询AI额度详情失败");
      }
      const rows = Array.isArray(response.rows) ? response.rows : undefined;
      const data = response.data;

      if (rows) {
        return rows;
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (data && typeof data === "object") {
        const nestedRows = Array.isArray((data as any).rows)
          ? (data as any).rows
          : undefined;
        if (nestedRows) {
          return nestedRows;
        }

        const nestedData = Array.isArray((data as any).data)
          ? (data as any).data
          : undefined;
        if (nestedData) {
          return nestedData;
        }
      }

      return [];
    } catch (error: any) {
      throw error;
    }
  };
  //AI对话（Responses API，SSE流式响应）
  const createAiChat = async (
    params: chat,
    options: AiChatStreamOptions = {},
  ) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const response = await fetch(
        `${config.public.apiBaseUrl}/system/ai/chat`,
        {
          method: "POST",
          signal: options.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream, application/json",
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Language": getCurrentContentLanguage(),
          },
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) {
        throw new Error(`新增AI对话失败(${response.status})`);
      }

      const contentType = String(
        response.headers.get("content-type") || "",
      ).toLowerCase();
      if (!contentType.includes("text/event-stream")) {
        const json = await response.json();
        if (json.code !== 200) {
          throw new Error(json.msg || "新增AI对话失败");
        }
        return json.data;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("AI对话流读取失败");
      }

      const decoder = new TextDecoder("utf-8");
      const eventChunks: unknown[] = [];
      let buffer = "";
      let streamText = "";
      let lastPayload: unknown = null;

      const consumeEventBlock = (eventBlock: string) => {
        const lines = eventBlock.split(/\r?\n/);
        const dataLines: string[] = [];
        let eventName = "";
        lines.forEach((line) => {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim().toLowerCase();
          }
          if (line.startsWith("data:")) {
            const lineValue = line.slice(5);
            dataLines.push(
              lineValue.startsWith(" ") ? lineValue.slice(1) : lineValue,
            );
          }
        });

        const rawDataText = dataLines.join("\n");
        if (!rawDataText.trim()) {
          return false;
        }
        if (rawDataText.trim() === "[DONE]") {
          return true;
        }

        let payload: unknown = rawDataText;
        try {
          payload = JSON.parse(rawDataText);
        } catch {
          payload = rawDataText;
        }

        if (eventName === "error") {
          const errorMessage =
            typeof payload === "object" && payload !== null
              ? String(
                  (payload as Record<string, unknown>).message ||
                    (payload as Record<string, unknown>).msg ||
                    rawDataText,
                ).trim()
              : String(payload || rawDataText).trim();
          throw new Error(errorMessage || "AI对话失败");
        }

        lastPayload = payload;
        eventChunks.push(payload);
        const nextText = resolveAiStreamText(payload);
        if (nextText) {
          streamText = mergeAiStreamText(streamText, nextText);
        }
        options.onChunk?.(payload, streamText);
        return eventName === "done";
      };

      let isDone = false;
      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const eventBlocks = buffer.split(/\r?\n\r?\n/);
        buffer = eventBlocks.pop() || "";

        for (const eventBlock of eventBlocks) {
          if (consumeEventBlock(eventBlock)) {
            isDone = true;
            await reader.cancel().catch(() => undefined);
            break;
          }
        }
      }

      if (!isDone && buffer.trim()) {
        consumeEventBlock(buffer);
      }

      return {
        data: lastPayload,
        chunks: eventChunks,
        text: streamText,
      };
    } catch (error: any) {
      throw error;
    }
  };
  //上传文件到火山方舟（用于AI对话多模态输入）
  const uploadAI = async (file: File, options?: { signal?: AbortSignal }) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${config.public.apiBaseUrl}/system/ai/upload`, {
        method: "POST",
        signal: options?.signal,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const response = await res.json();
      if (response.code !== 200) {
        throw new Error(response.msg || "上传AI文件失败");
      }
      return response.data; // 返回 { url, fileName, ossId }
    } catch (error: any) {
      throw error;
    }
  };
  //获取火山方舟上的文件
  const getFiles = async (fileId: string) => {
    try {
      const response = await http.get(`/system/ai/files/${fileId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询AI文件失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除火山方舟上的文件
  const deleteFiles = async (fileId: string) => {
    try {
      const response = await http.del(`/system/ai/files/${fileId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除AI文件失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //在已有课程中打开AI生成教案
  const getExistingCursor = async (data: {
    sessionId: string;
    courseId: string;
    chapterId: String;
  }) => {
    try {
      const response = await http.get(
        "/system/ai/lesson-plan/existing-course",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "在已有课程中打开AI生成教案失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //创建新课程并打开AI生成教案

  const getNewCursor = async (data: { sessionId: string }) => {
    try {
      const response = await http.get(
        "/system/ai/lesson-plan/new-course",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "创建新课程并打开AI生成教案失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //在已有课程中打开AI生成课件PPT
  const getPptExistingCursor = async (data: {
    sessionId: string;
    courseId: string;
    chapterId: String;
  }) => {
    try {
      const response = await http.get("/system/ai/ppt/existing-course", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "在已有课程中打开AI生成课件PPT失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //创建新课程并打开AI生成课件PPT
  const getPptNewCursor = async (data: { sessionId: string }) => {
    try {
      const response = await http.get("/system/ai/ppt/new-course", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "创建新课程并打开AI生成课件PPT失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //保存AI生成习题并关联已有课程章节
  const getExerciseExistingCursor = async (data: {
    sessionId: string;
    courseId: string;
    chapterId: String;
  }) => {
    try {
      const response = await http.get(
        "/system/ai/exercise/existing-course",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "在已有课程中打开AI生成习题失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //保存AI生成习题并进入自定义编辑
  const getExerciseNewCursorEdit = async (data: { sessionId: string }) => {
    try {
      const response = await http.get("/system/ai/exercise/custom-edit", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "创建新课程并打开AI生成习题失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //获取热门会话（热门会话标题）
  const getHotAiList = async () => {
    try {
      const response = await http.get("/system/ai/sessions/hot");
      if (response.code !== 200) {
        throw new Error(response.msg || "查询热门会话失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //停止回答
  const stopSession = async (sessionId: string | number) => {
    try {
      const response = await http.get(`/system/ai/sessions/${sessionId}/stop`);
      if (response.code !== 200) {
        throw new Error(response.msg || "停止会话失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询智能生图历史列表
  const getImageList = async () => {
    try {
      const response = await http.get("/system/ai/images");
      if (response.code !== 200) {
        throw new Error(response.msg || "查询智能生图历史列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };

  //ai自由对话

  //查询AI问答角色分组
  const getOptList = async () => {
    try {
      const response = await http.get("/system/opt/qa/roles");
      if (response.code !== 200) {
        throw new Error(response.msg || "查询查询AI问答角色分组列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //新增AI问答自定义角色
  const createOptQa = async (data: { roleName: string; prompt?: string }) => {
    try {
      const response = await http.post("/system/opt/qa/roles", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "新增AI问答自定义角色失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //修改AI问答自定义角色
  const editOptQa = async (data: {
    roleName: string;
    prompt?: string;
    roleId: string;
  }) => {
    try {
      const response = await http.put("/system/opt/qa/roles", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "修改AI问答自定义角色失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除AI问答自定义角色
  const delOptQa = async (roleId: string) => {
    try {
      const response = await http.del(`/system/opt/qa/roles/${roleId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除AI问答自定义角色失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询AI问答历史会话列表
  const getOptQaSessions = async () => {
    try {
      const response = await http.get("/system/opt/qa/sessions");
      if (response.code !== 200) {
        throw new Error(response.msg || "查询AI问答历史会话列表失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询AI问答会话详情
  const getOptQaDeatil = async (sessionId: string) => {
    try {
      const response = await http.get(`/system/opt/qa/sessions/${sessionId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询AI问答会话详情失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //重命名AI问答会话
  const titleOptQa = async (sessionId: string, title: string) => {
    try {
      const response = await http.put(
        `/system/opt/qa/sessions/${sessionId}/title`,
        { title },
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "重命名AI问答会话失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //置顶/取消置顶AI问答会话
  const topOptQa = async (sessionId: string, isTop: 0 | 1) => {
    try {
      const response = await http.put(
        `/system/opt/qa/sessions/${sessionId}/top`,
        { isTop },
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "置顶/取消置顶AI问答会话失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //删除AI问答会话
  const delAiOptQa = async (sessionId: string) => {
    try {
      const response = await http.del(`/system/opt/qa/sessions/${sessionId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除AI问答会话失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //停止AI问答会话生成
  const stopAiOptQa = async (sessionId: string) => {
    try {
      const response = await http.get(
        `/system/opt/qa/sessions/${sessionId}/stop`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "停止AI问答会话生成失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //AI问答流式对话
  //ai实践中心的AI对话（Responses API，SSE流式响应）

  const createOptAiChat = async (
    params: chat,
    options: AiChatStreamOptions = {},
  ) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const response = await fetch(
        `${config.public.apiBaseUrl}/system/opt/qa/chat`,
        {
          method: "POST",
          signal: options.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream, application/json",
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Language": getCurrentContentLanguage(),
          },
          body: JSON.stringify(params),
        },
      );

      if (!response.ok) {
        throw new Error(`新增AI对话失败(${response.status})`);
      }

      const contentType = String(
        response.headers.get("content-type") || "",
      ).toLowerCase();
      if (!contentType.includes("text/event-stream")) {
        const json = await response.json();
        if (json.code !== 200) {
          throw new Error(json.msg || "新增AI对话失败");
        }
        return json.data;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("AI对话流读取失败");
      }

      const decoder = new TextDecoder("utf-8");
      const eventChunks: unknown[] = [];
      let buffer = "";
      let streamText = "";
      let lastPayload: unknown = null;

      const consumeEventBlock = (eventBlock: string) => {
        const lines = eventBlock.split(/\r?\n/);
        const dataLines: string[] = [];
        let eventName = "";
        lines.forEach((line) => {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim().toLowerCase();
          }
          if (line.startsWith("data:")) {
            const lineValue = line.slice(5);
            dataLines.push(
              lineValue.startsWith(" ") ? lineValue.slice(1) : lineValue,
            );
          }
        });

        const rawDataText = dataLines.join("\n");
        if (!rawDataText.trim()) {
          return false;
        }
        if (rawDataText.trim() === "[DONE]") {
          return true;
        }

        let payload: unknown = rawDataText;
        try {
          payload = JSON.parse(rawDataText);
        } catch {
          payload = rawDataText;
        }

        if (eventName === "error") {
          const errorMessage =
            typeof payload === "object" && payload !== null
              ? String(
                  (payload as Record<string, unknown>).message ||
                    (payload as Record<string, unknown>).msg ||
                    rawDataText,
                ).trim()
              : String(payload || rawDataText).trim();
          throw new Error(errorMessage || "AI对话失败");
        }

        lastPayload = payload;
        eventChunks.push(payload);
        const nextText = resolveAiStreamText(payload);
        if (nextText) {
          streamText = mergeAiStreamText(streamText, nextText);
        }
        options.onChunk?.(payload, streamText);
        return eventName === "done";
      };

      let isDone = false;
      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const eventBlocks = buffer.split(/\r?\n\r?\n/);
        buffer = eventBlocks.pop() || "";

        for (const eventBlock of eventBlocks) {
          if (consumeEventBlock(eventBlock)) {
            isDone = true;
            await reader.cancel().catch(() => undefined);
            break;
          }
        }
      }

      if (!isDone && buffer.trim()) {
        consumeEventBlock(buffer);
      }

      return {
        data: lastPayload,
        chunks: eventChunks,
        text: streamText,
      };
    } catch (error: any) {
      throw error;
    }
  };

  //AI实践中心 生成故事
  //创建故事书
  const creatBook = async (data: {
    title?: string;
    coverUrl?: string;
    roleName: string;
    roleType: string;
    storyScene: string;
    storyKeywords: [string];
    storyDesc: string;
    firstChapterTitle?: string;
    autoGenerateFirstChapter?: true;
  }) => {
    try {
      const response = await http.post("/system/opt/story/books", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "创建故事书失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询故事书架

  const getBookList = async (data: {
    pageSize: string;
    pageNum: string;
    orderByColumn: string;
    isAsc: string;
    title: string;
  }) => {
    try {
      const response = await http.get("/system/opt/story/books", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询故事书架失败");
      }
      return response.rows;
    } catch (error: any) {
      throw error;
    }
  };
  //查询故事书详情
  const getBookDetail = async (bookId: string) => {
    try {
      const response = await http.get(`/system/opt/story/books/${bookId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询故事书详情失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //生成故事正文
  const createAiChatChapters = async (
    data: {
      chapterTitle?: string;
      chapterScene?: string;
      enableThinking: false;
      bookId: string;
    },
    options: AiChatStreamOptions = {},
  ) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const response = await fetch(
        `${config.public.apiBaseUrl}/system/opt/story/books/${data.bookId}/generate`,
        {
          method: "POST",
          signal: options.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream, application/json",
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Language": getCurrentContentLanguage(),
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error(`生成故事章节失败(${response.status})`);
      }

      const contentType = String(
        response.headers.get("content-type") || "",
      ).toLowerCase();
      if (!contentType.includes("text/event-stream")) {
        const json = await response.json();
        if (json.code !== 200) {
          throw new Error(json.msg || "生成故事章节失败");
        }
        return json.data;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("故事章节流读取失败");
      }

      const decoder = new TextDecoder("utf-8");
      const eventChunks: unknown[] = [];
      let buffer = "";
      let streamText = "";
      let lastPayload: unknown = null;

      const consumeEventBlock = (eventBlock: string) => {
        const lines = eventBlock.split(/\r?\n/);
        const dataLines: string[] = [];
        let eventName = "";
        lines.forEach((line) => {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim().toLowerCase();
          }
          if (line.startsWith("data:")) {
            const lineValue = line.slice(5);
            dataLines.push(
              lineValue.startsWith(" ") ? lineValue.slice(1) : lineValue,
            );
          }
        });

        const rawDataText = dataLines.join("\n");
        if (!rawDataText.trim()) {
          return false;
        }
        if (rawDataText.trim() === "[DONE]") {
          return true;
        }

        let payload: unknown = rawDataText;
        try {
          payload = JSON.parse(rawDataText);
        } catch {
          payload = rawDataText;
        }

        if (eventName === "error") {
          const errorMessage =
            typeof payload === "object" && payload !== null
              ? String(
                  (payload as Record<string, unknown>).message ||
                    (payload as Record<string, unknown>).msg ||
                    rawDataText,
                ).trim()
              : String(payload || rawDataText).trim();
          throw new Error(errorMessage || "生成故事章节失败");
        }

        lastPayload = payload;
        eventChunks.push(payload);
        const nextText = resolveAiStreamText(payload);
        if (nextText) {
          streamText = mergeAiStreamText(streamText, nextText);
        }
        options.onChunk?.(payload, streamText);
        return eventName === "done";
      };

      let isDone = false;
      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const eventBlocks = buffer.split(/\r?\n\r?\n/);
        buffer = eventBlocks.pop() || "";

        for (const eventBlock of eventBlocks) {
          if (consumeEventBlock(eventBlock)) {
            isDone = true;
            await reader.cancel().catch(() => undefined);
            break;
          }
        }
      }

      if (!isDone && buffer.trim()) {
        consumeEventBlock(buffer);
      }

      return {
        data: lastPayload,
        chunks: eventChunks,
        text: streamText,
      };
    } catch (error: any) {
      throw error;
    }
  };
  //改写故事
  const reviseAiChatChapters = async (
    data: {
      modifyCommand: string;
      enableThinking: false;
      bookId: string;
    },
    options: AiChatStreamOptions = {},
  ) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const { bookId, ...payload } = data;
      const response = await fetch(
        `${config.public.apiBaseUrl}/system/opt/story/books/${bookId}/revise`,
        {
          method: "POST",
          signal: options.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream, application/json",
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Language": getCurrentContentLanguage(),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`改写故事章节失败(${response.status})`);
      }

      const contentType = String(
        response.headers.get("content-type") || "",
      ).toLowerCase();
      if (!contentType.includes("text/event-stream")) {
        const json = await response.json();
        if (json.code !== 200) {
          throw new Error(json.msg || "改写故事章节失败");
        }
        return json.data;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("改写故事流读取失败");
      }

      const decoder = new TextDecoder("utf-8");
      const eventChunks: unknown[] = [];
      let buffer = "";
      let streamText = "";
      let lastPayload: unknown = null;

      const consumeEventBlock = (eventBlock: string) => {
        const lines = eventBlock.split(/\r?\n/);
        const dataLines: string[] = [];
        let eventName = "";
        lines.forEach((line) => {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim().toLowerCase();
          }
          if (line.startsWith("data:")) {
            const lineValue = line.slice(5);
            dataLines.push(
              lineValue.startsWith(" ") ? lineValue.slice(1) : lineValue,
            );
          }
        });

        const rawDataText = dataLines.join("\n");
        if (!rawDataText.trim()) {
          return false;
        }
        if (rawDataText.trim() === "[DONE]") {
          return true;
        }

        let payloadValue: unknown = rawDataText;
        try {
          payloadValue = JSON.parse(rawDataText);
        } catch {
          payloadValue = rawDataText;
        }

        if (eventName === "error") {
          const errorMessage =
            typeof payloadValue === "object" && payloadValue !== null
              ? String(
                  (payloadValue as Record<string, unknown>).message ||
                    (payloadValue as Record<string, unknown>).msg ||
                    rawDataText,
                ).trim()
              : String(payloadValue || rawDataText).trim();
          throw new Error(errorMessage || "改写故事章节失败");
        }

        lastPayload = payloadValue;
        eventChunks.push(payloadValue);
        const nextText = resolveAiStreamText(payloadValue);
        if (nextText) {
          streamText = mergeAiStreamText(streamText, nextText);
        }
        options.onChunk?.(payloadValue, streamText);
        return eventName === "done";
      };

      let isDone = false;
      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const eventBlocks = buffer.split(/\r?\n\r?\n/);
        buffer = eventBlocks.pop() || "";

        for (const eventBlock of eventBlocks) {
          if (consumeEventBlock(eventBlock)) {
            isDone = true;
            await reader.cancel().catch(() => undefined);
            break;
          }
        }
      }

      if (!isDone && buffer.trim()) {
        consumeEventBlock(buffer);
      }

      return {
        data: lastPayload,
        chunks: eventChunks,
        text: streamText,
      };
    } catch (error: any) {
      throw error;
    }
  };
  //续写故事章节
  const continueAiChatChapters = async (
    data: {
      chapterPlot: string;
      chapterKeywords: [string];
      enableThinking: false;
      chapterId: string;
    },
    options: AiChatStreamOptions = {},
  ) => {
    try {
      const config = useRuntimeConfig();
      const token = http.getToken();
      const { chapterId, ...payload } = data;
      const response = await fetch(
        `${config.public.apiBaseUrl}/system/opt/story/chapters/${chapterId}/continue`,
        {
          method: "POST",
          signal: options.signal,
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream, application/json",
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Language": getCurrentContentLanguage(),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`续写故事章节失败(${response.status})`);
      }

      const contentType = String(
        response.headers.get("content-type") || "",
      ).toLowerCase();
      if (!contentType.includes("text/event-stream")) {
        const json = await response.json();
        if (json.code !== 200) {
          throw new Error(json.msg || "续写故事章节失败");
        }
        return json.data;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("续写故事流读取失败");
      }

      const decoder = new TextDecoder("utf-8");
      const eventChunks: unknown[] = [];
      let buffer = "";
      let streamText = "";
      let lastPayload: unknown = null;

      const consumeEventBlock = (eventBlock: string) => {
        const lines = eventBlock.split(/\r?\n/);
        const dataLines: string[] = [];
        let eventName = "";
        lines.forEach((line) => {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim().toLowerCase();
          }
          if (line.startsWith("data:")) {
            const lineValue = line.slice(5);
            dataLines.push(
              lineValue.startsWith(" ") ? lineValue.slice(1) : lineValue,
            );
          }
        });

        const rawDataText = dataLines.join("\n");
        if (!rawDataText.trim()) {
          return false;
        }
        if (rawDataText.trim() === "[DONE]") {
          return true;
        }

        let payloadValue: unknown = rawDataText;
        try {
          payloadValue = JSON.parse(rawDataText);
        } catch {
          payloadValue = rawDataText;
        }

        if (eventName === "error") {
          const errorMessage =
            typeof payloadValue === "object" && payloadValue !== null
              ? String(
                  (payloadValue as Record<string, unknown>).message ||
                    (payloadValue as Record<string, unknown>).msg ||
                    rawDataText,
                ).trim()
              : String(payloadValue || rawDataText).trim();
          throw new Error(errorMessage || "续写故事章节失败");
        }

        lastPayload = payloadValue;
        eventChunks.push(payloadValue);
        const nextText = resolveAiStreamText(payloadValue);
        if (nextText) {
          streamText = mergeAiStreamText(streamText, nextText);
        }
        options.onChunk?.(payloadValue, streamText);
        return eventName === "done";
      };

      let isDone = false;
      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const eventBlocks = buffer.split(/\r?\n\r?\n/);
        buffer = eventBlocks.pop() || "";

        for (const eventBlock of eventBlocks) {
          if (consumeEventBlock(eventBlock)) {
            isDone = true;
            await reader.cancel().catch(() => undefined);
            break;
          }
        }
      }

      if (!isDone && buffer.trim()) {
        consumeEventBlock(buffer);
      }

      return {
        data: lastPayload,
        chunks: eventChunks,
        text: streamText,
      };
    } catch (error: any) {
      throw error;
    }
  };
  //查询故事版本列表
  const getBookVersions = async (bookId: string) => {
    try {
      const response = await http.get(
        `/system/opt/story/books/${bookId}/versions`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查询章节版本列表失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //查询故事版本详情
  const getBookVersionsDetail = async (bookId: string, versionId: string) => {
    try {
      const response = await http.get(
        `/system/opt/story/books/${bookId}/versions/${versionId}`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "查询章节版本详情失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //恢复章节版本
  const restoreBookVersionsDetail = async (
    chapterId: string,
    versionId: string,
  ) => {
    try {
      const response = await http.put(
        `/system/opt/story/chapters/${chapterId}/versions/${versionId}/restore`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "恢复章节版本失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //应用编辑后的故事内容
  const applyBookVersionsDetail = async (
    bookId: string,
    content: string,
    sourceVersionId: string,
  ) => {
    try {
      const response = await http.put(
        `/system/opt/story/books/${bookId}/versions/apply`,
        {
          content,
          sourceVersionId: sourceVersionId,
        },
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "应用编辑后的章节内容失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };

  //导出故事文本
  const exportBookVersionsDetail = async (bookId: string) => {
    try {
      const response = await http.get(
        `/system/opt/story/books/${bookId}/export/txt`,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "导出故事文本失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  // 音乐生成

  //查询歌曲参数选项
  const getSongOptions = async () => {
    try {
      const response = await http.get(`/system/opt/song/options`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询歌曲参数选项失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //生成歌曲歌词
  const creatSongLyrics = async (data: {
    songMode?: string;
    title?: string;
    promptText: string;
    styleTag?: string;
    emotionTag?: string;
    scenarioTag?: string;
  }) => {
    try {
      const response = await http.post(
        "/system/opt/song/generate-lyrics",
        data,
      );
      if (response.code !== 200) {
        throw new Error(response.msg || "生成歌曲歌词失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //创建歌曲任务
  const creatSongTask = async (data: {
    songMode?: string;
    title?: string;
    lyricsContent?: string;
    promptText: string;
    styleTag?: string;
    emotionTag?: string;
    scenarioTag?: string;
  }) => {
    try {
      const response = await http.post("/system/opt/song/tasks", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "创建歌曲任务失败");
      }
      return response.data;
    } catch (error: any) {
      throw error;
    }
  };
  //查询歌曲任务
    const getSongTasks = async (taskId: string) => {
    try {
      const response = await http.get(`/system/opt/song/tasks/${taskId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询歌曲任务失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //查询我的音乐作品
    const getSongList = async (data: {
    pageSize?: string;
    pageNum?: string;
    orderByColumn?: string;
    isAsc?: string;
    title?: string;
    songMode?: string;
    taskStatus?: string;
  }) => {
    try {
      const response = await http.get("/system/opt/song/works", data);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询我的音乐作品失败");
      }
      return response.rows;
    } catch (error: any) {
      throw error;
    }
  };

  //查询音乐作品详情
    const getSongDetail = async (songId: string) => {
    try {
      const response = await http.get(`/system/opt/song/works/${songId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "查询音乐作品详情失败");
      }
      return resolveAiApiResponseData(response);
    } catch (error: any) {
      throw error;
    }
  };
  //删除音乐作品
    const deleteSong = async (songId: string) => {
    try {
      const response = await http.del(`/system/opt/song/works/${songId}`);
      if (response.code !== 200) {
        throw new Error(response.msg || "删除音乐作品失败");
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
    deleteOss,
    getAiSessions,
    getSessions,
    deleteSession,
    stopSession,
    getAiQuotaDetail,
    createAiChat,
    uploadAI,
    getFiles,
    deleteFiles,
    getExistingCursor,
    getNewCursor,
    getPptExistingCursor,
    getPptNewCursor,
    getExerciseExistingCursor,
    getExerciseNewCursorEdit,
    getHotAiList,
    getImageList,
    getOptList,
    createOptQa,
    editOptQa,
    delOptQa,
    getOptQaSessions,
    getOptQaDeatil,
    titleOptQa,
    topOptQa,
    delAiOptQa,
    stopAiOptQa,
    createOptAiChat,
    creatBook,
    getBookList,
    getBookDetail,
    createAiChatChapters,
    reviseAiChatChapters,
    continueAiChatChapters,
    getBookVersions,
    getBookVersionsDetail,
    restoreBookVersionsDetail,
    exportBookVersionsDetail,
    applyBookVersionsDetail,
    getSongOptions,
    creatSongLyrics,
    creatSongTask,
    getSongTasks,
    getSongList,
    getSongDetail,
    deleteSong,
    
  };
};
