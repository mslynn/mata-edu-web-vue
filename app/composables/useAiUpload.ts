/**
 * AI 文件上传 composable
 * 封装文件校验、上传、轮询等待激活、删除等逻辑，可在多个 AIGC 模块复用。
 */

export type AiUploadFile = {
  name: string;
  ossId: string;
  url: string;
  fileType: string;
  size?: number;
};

export interface UseAiUploadApis {
  uploadAI: (file: File, options?: { signal?: AbortSignal }) => Promise<any>;
  getFiles: (fileId: string) => Promise<any>;
  deleteFiles: (fileId: string) => Promise<any>;
}

// ---- 常量 ----
const AI_UPLOAD_IMAGE_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",
  ".tiff", ".ico", ".icns", ".sgi", ".jp2", ".heic", ".heif",
];
const AI_UPLOAD_VIDEO_EXTENSIONS = [".mp4", ".avi", ".mov"];
const AI_UPLOAD_PDF_EXTENSIONS = [".pdf"];

export const AI_UPLOAD_ACCEPT = [
  ...AI_UPLOAD_IMAGE_EXTENSIONS,
  ...AI_UPLOAD_VIDEO_EXTENSIONS,
  ...AI_UPLOAD_PDF_EXTENSIONS,
].join(",");

export const AI_UPLOAD_TOOLTIP =
  "最多上传一个文件，支持图片（jpg、jpeg、png、gif、webp、bmp、tiff、ico、icns、sgi、jp2、heic、heif）、视频（mp4、avi、mov）和PDF（pdf），单文件最大15MB。";

const AI_UPLOAD_POLL_INTERVAL = 1200;
const AI_UPLOAD_POLL_MAX = 30;

// ---- 工具函数 ----
const getFileExtension = (name: string) => {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
};

const validateUploadFile = (file: File): string => {
  const ext = getFileExtension(file.name);
  const allExtensions = [
    ...AI_UPLOAD_IMAGE_EXTENSIONS,
    ...AI_UPLOAD_VIDEO_EXTENSIONS,
    ...AI_UPLOAD_PDF_EXTENSIONS,
  ];
  if (!allExtensions.includes(ext)) {
    return "当前仅支持图片、视频（mp4、avi、mov）和PDF格式";
  }
  if (file.size / 1024 / 1024 > 15) return "文件大小不能超过15MB";
  return "";
};

const resolveFileType = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const r = payload as Record<string, unknown>;
  return String(r.fileType || r.file_type || r.type || "").trim();
};

const resolveFileId = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const r = payload as Record<string, unknown>;
  const directId = r.fileId || r.file_id || r.id;
  if (directId) return String(directId).trim();
  if (r.data && typeof r.data === "object") {
    const d = r.data as Record<string, unknown>;
    return String(d.fileId || d.id || "").trim();
  }
  return "";
};

const resolveFileStatus = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const r = payload as Record<string, unknown>;
  return String(r.fileStatus || r.file_status || r.status || r.state || "").trim().toLowerCase();
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---- composable ----
export function useAiUpload(apis: UseAiUploadApis) {
  const uploadInputRef = ref<HTMLInputElement | null>(null);
  const aiUploadFile = ref<AiUploadFile | null>(null);
  const aiUploading = ref(false);
  const aiUploadError = ref("");
  const aiUploadAbortController = ref<AbortController | null>(null);

  const waitForFileActive = async (fileId: string, abort: AbortController) => {
    if (!fileId) throw new Error("文件ID为空");
    for (let i = 0; i < AI_UPLOAD_POLL_MAX; i++) {
      if (abort.signal.aborted) throw new DOMException("已取消", "AbortError");
      const info = await apis.getFiles(fileId);
      const status = resolveFileStatus(info);
      if (status === "active") return info;
      if (status && status !== "processing" && status !== "pending") {
        throw new Error(`文件处理失败(${status})`);
      }
      await sleep(AI_UPLOAD_POLL_INTERVAL);
    }
    throw new Error("文件处理超时，请稍后重试");
  };

  const triggerUpload = () => {
    if (aiUploading.value) return;
    uploadInputRef.value?.click();
  };

  const clearUploadFile = () => {
    aiUploadFile.value = null;
    aiUploading.value = false;
    aiUploadError.value = "";
    aiUploadAbortController.value = null;
    if (uploadInputRef.value) uploadInputRef.value.value = "";
  };

  const handleRemoveFile = async () => {
    if (aiUploading.value) {
      aiUploadAbortController.value?.abort();
      clearUploadFile();
      return;
    }
    const f = aiUploadFile.value;
    if (f?.ossId) {
      try { await apis.deleteFiles(f.ossId); } catch { /* 静默 */ }
    }
    clearUploadFile();
  };

  const handleFileChange = async (event: Event) => {
    const { ElMessage } = await import("element-plus");
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    if (aiUploading.value) {
      ElMessage.warning("文件上传中，请先取消");
      if (input) input.value = "";
      return;
    }

    const msg = validateUploadFile(file);
    if (msg) {
      ElMessage.warning(msg);
      if (input) input.value = "";
      return;
    }

    aiUploadError.value = "";
    aiUploading.value = true;
    const ext = getFileExtension(file.name);
    aiUploadFile.value = {
      name: file.name,
      ossId: "",
      url: "",
      fileType: AI_UPLOAD_IMAGE_EXTENSIONS.includes(ext)
        ? "image"
        : AI_UPLOAD_VIDEO_EXTENSIONS.includes(ext)
          ? "video"
          : "document",
      size: file.size,
    };
    const abort = new AbortController();
    aiUploadAbortController.value = abort;

    try {
      const result = await apis.uploadAI(file, { signal: abort.signal });
      if (!result) { clearUploadFile(); return; }

      const fileId = resolveFileId(result);
      const fileInfo = await waitForFileActive(fileId, abort);
      const fileType = resolveFileType(result) || resolveFileType(fileInfo);

      aiUploadFile.value = {
        name: String((result as any).fileName || file.name),
        ossId: String((result as any).ossId || (fileInfo as any)?.ossId || fileId || ""),
        url: String((result as any).url || (fileInfo as any)?.url || ""),
        fileType: String(fileType || aiUploadFile.value?.fileType || ""),
        size: file.size,
      };
      aiUploading.value = false;
      ElMessage.success("上传成功");
    } catch (error: any) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      aiUploading.value = false;
      aiUploadError.value = error?.message || "上传失败";
      ElMessage.error(aiUploadError.value);
    }
  };

  return {
    uploadInputRef,
    aiUploadFile,
    aiUploading,
    aiUploadError,
    triggerUpload,
    clearUploadFile,
    handleRemoveFile,
    handleFileChange,
  };
}
