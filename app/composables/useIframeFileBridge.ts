import { useHttp } from "~/composables/api/useHttp";

type IframeWindowLike = WindowProxy | null | undefined;

type ToFileOptions = {
  fileName?: string;
  fallbackExtension?: string;
  defaultBaseName?: string;
  defaultMimeType?: string;
};

type IframeMessageMatchOptions = {
  event: MessageEvent;
  iframeWindow: IframeWindowLike;
  iframeUrl?: string;
  allowOriginFallback?: boolean;
};

type PostFileBufferOptions = {
  file?: File | null;
  iframeUrl?: string;
  iframeWindow: IframeWindowLike;
  type?: string;
  payloadOnly?: boolean;
  additionalData?: Record<string, unknown>;
};

type MessageDataRecord = Record<string, unknown>;

export const useIframeFileBridge = () => {
  const http = useHttp();
  const runtimeConfig = useRuntimeConfig();

  const parseMessageData = (rawData: unknown) => {
    if (typeof rawData !== "string") {
      return rawData;
    }

    try {
      return JSON.parse(rawData);
    } catch {
      return rawData;
    }
  };

  const getMessageType = (messageData: unknown) => {
    if (typeof messageData === "string") {
      return messageData;
    }

    if (!messageData || typeof messageData !== "object") {
      return "";
    }

    return (
      (messageData as any).type ||
      (messageData as any).event ||
      (messageData as any).eventName ||
      (messageData as any).name ||
      ""
    );
  };

  const pickMessageValue = (messageData: unknown, keys: string[]) => {
    if (!messageData || typeof messageData !== "object") {
      return null;
    }

    const dataRecord = messageData as MessageDataRecord;
    for (const key of keys) {
      const value = dataRecord[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }

    return null;
  };

  const pickMessagePayload = (
    messageData: unknown,
    keys = ["payload", "data", "file"]
  ) => pickMessageValue(messageData, keys);

  const pickMessageFileName = (
    messageData: unknown,
    keys = ["fileName", "name", "projectName"]
  ) => {
    const value = pickMessageValue(messageData, keys);
    return typeof value === "string" ? value : undefined;
  };

  const normalizeFileName = (
    fileName?: string,
    fallbackExtension = "",
    defaultBaseName = "project"
  ) => {
    const trimmedName = (fileName || defaultBaseName).trim() || defaultBaseName;
    if (!fallbackExtension) {
      return trimmedName;
    }

    return /\.[a-z0-9]+$/i.test(trimmedName)
      ? trimmedName
      : `${trimmedName}${fallbackExtension}`;
  };

  const toBinaryFilePart = (payload: ArrayBufferView) => {
    const binaryData = new Uint8Array(payload.byteLength);
    binaryData.set(
      new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength)
    );
    return binaryData;
  };

  const toFile = (payload: unknown, options: ToFileOptions = {}) => {
    const payloadFileName = payload instanceof File ? payload.name : undefined;
    const normalizedName = normalizeFileName(
      options.fileName || payloadFileName,
      options.fallbackExtension,
      options.defaultBaseName
    );

    if (payload instanceof File) {
      const mimeType =
        options.defaultMimeType || payload.type || "application/octet-stream";

      if (normalizedName === payload.name && mimeType === payload.type) {
        return payload;
      }

      return new File([payload], normalizedName, {
        type: mimeType,
        lastModified: payload.lastModified || Date.now(),
      });
    }

    if (payload instanceof Blob) {
      return new File([payload], normalizedName, {
        type:
          options.defaultMimeType || payload.type || "application/octet-stream",
        lastModified: Date.now(),
      });
    }

    if (payload instanceof ArrayBuffer) {
      return new File([payload], normalizedName, {
        type: options.defaultMimeType || "application/octet-stream",
        lastModified: Date.now(),
      });
    }

    if (ArrayBuffer.isView(payload)) {
      return new File([toBinaryFilePart(payload)], normalizedName, {
        type: options.defaultMimeType || "application/octet-stream",
        lastModified: Date.now(),
      });
    }

    return null;
  };

  const toZipFile = (payload: unknown) =>
    toFile(payload, {
      fallbackExtension: ".zip",
      defaultMimeType: "application/zip",
    });

  const toWorkFile = (
    payload: unknown,
    fileName?: string,
    fallbackExtension = ".sb3"
  ) =>
    toFile(payload, {
      fileName,
      fallbackExtension,
      defaultMimeType: "application/octet-stream",
    });

  const toUploadFile = (payload: unknown, fileName?: string) =>
    toFile(payload, {
      fileName,
      defaultMimeType: "application/octet-stream",
    });

  const uploadFileToOSS = async (file: File, errorMessage = "上传文件失败") => {
    const token = http.getToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${runtimeConfig.public.apiBaseUrl}/resource/oss/upload`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    const response = await res.json();
    if (response.code !== 200) {
      throw new Error(response.msg || errorMessage);
    }

    return response.data;
  };

  const createUploadFormData = (file: File, fieldName = "file") => {
    const formData = new FormData();
    formData.append(fieldName, file, file.name);
    return formData;
  };

  const downloadFileFromOSS = async (
    ossId: string,
    fileName = "project.zip",
    mimeType = "application/octet-stream"
  ) => {
    const token = http.getToken();
    const response = await fetch(
      `${runtimeConfig.public.apiBaseUrl}/resource/oss/download/${ossId}`,
      {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`下载 OSS 文件失败: ${response.status}`);
    }

    const blob = await response.blob();
    return new File([blob], fileName, {
      type: blob.type || mimeType,
      lastModified: Date.now(),
    });
  };

  const getIframeOrigin = (iframeUrl?: string) => {
    if (!iframeUrl) {
      return "";
    }

    try {
      return new URL(iframeUrl).origin;
    } catch {
      return "";
    }
  };

  const isMessageFromIframe = ({
    event,
    iframeWindow,
    iframeUrl,
    allowOriginFallback = true,
  }: IframeMessageMatchOptions) => {
    if (iframeWindow && event.source === iframeWindow) {
      return true;
    }

    if (!allowOriginFallback) {
      return false;
    }

    const iframeOrigin = getIframeOrigin(iframeUrl);
    return !!iframeOrigin && event.origin === iframeOrigin;
  };

  const postFileBufferToIframe = async ({
    file,
    iframeUrl,
    iframeWindow,
    type = "ZIP_DATA",
    payloadOnly = false,
    additionalData = {},
  }: PostFileBufferOptions) => {
    const iframeOrigin = getIframeOrigin(iframeUrl);

    if (!file || !iframeOrigin || !iframeWindow) {
      return null;
    }

    const payload = await file.arrayBuffer();

    const message = payloadOnly
      ? {
          type,
          payload,
        }
      : {
          type,
          payload,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          ...additionalData,
        };

    iframeWindow.postMessage(message, iframeOrigin, [payload]);

    return {
      origin: iframeOrigin,
      fileName: file.name,
      size: file.size,
      payloadType: "ArrayBuffer" as const,
    };
  };

  return {
    parseMessageData,
    getMessageType,
    pickMessageValue,
    pickMessagePayload,
    pickMessageFileName,
    toBinaryFilePart,
    toFile,
    toZipFile,
    toWorkFile,
    toUploadFile,
    uploadFileToOSS,
    createUploadFormData,
    downloadFileFromOSS,
    getIframeOrigin,
    isMessageFromIframe,
    postFileBufferToIframe,
  };
};
