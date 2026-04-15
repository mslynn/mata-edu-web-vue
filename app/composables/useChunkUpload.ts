import { computed, ref } from "vue";
import { shardingAdmin } from "~/composables/api/sharding";

type ChunkUploadStatus = "idle" | "uploading" | "success" | "error";

interface ChunkUploadSession {
  uploadId: string;
  fileName: string;
  contentType: string;
  controller: AbortController | null;
  cancelled: boolean;
}

interface UseChunkUploadOptions {
  chunkSize?: number;
  defaultErrorMessage?: string;
}

const createEmptySession = (): ChunkUploadSession => ({
  uploadId: "",
  fileName: "",
  contentType: "",
  controller: null,
  cancelled: false,
});

export const useChunkUpload = (options: UseChunkUploadOptions = {}) => {
  const {
    startUploadInit,
    startUploadpart,
    completeUpload,
    startUploadAbort,
  } = shardingAdmin();

  const chunkSize = options.chunkSize || 5 * 1024 * 1024;
  const defaultErrorMessage = options.defaultErrorMessage || "文件分片上传失败，请重试";

  const status = ref<ChunkUploadStatus>("idle");
  const progress = ref(0);
  const errorMessage = ref("");
  const cancelPending = ref(false);
  const session = ref<ChunkUploadSession>(createEmptySession());

  const isUploading = computed(() => status.value === "uploading");
  const progressPercent = computed(() =>
    Math.max(0, Math.min(100, Math.round(progress.value)))
  );

  const reset = () => {
    status.value = "idle";
    progress.value = 0;
    errorMessage.value = "";
    cancelPending.value = false;
    session.value = createEmptySession();
  };

  const resolveUploadId = (payload: any) =>
    String(payload?.uploadId || payload?.id || payload?.upload_id || "").trim();

  const resolvePartMeta = (payload: any, fallbackPartNumber: number) => {
    const partNumber = Number(
      payload?.partNumber ?? payload?.part_num ?? payload?.number ?? fallbackPartNumber
    );
    const eTag = String(payload?.eTag ?? payload?.etag ?? payload?.ETag ?? "").trim();
    return { partNumber, eTag };
  };

  const start = async (file: File) => {
    reset();

    const contentType = file.type || "application/octet-stream";
    status.value = "uploading";
    session.value = {
      uploadId: "",
      fileName: file.name,
      contentType,
      controller: null,
      cancelled: false,
    };

    let uploadId = "";

    try {
      const initController = new AbortController();
      session.value.controller = initController;
      const initResult = await startUploadInit(
        {
          fileName: file.name,
          contentType,
        },
        initController.signal
      );

      uploadId = resolveUploadId(initResult);
      if (!uploadId) {
        throw new Error("分片上传初始化成功，但未返回 uploadId");
      }

      session.value.uploadId = uploadId;

      const parts: Array<{ partNumber: number; eTag: string }> = [];
      const totalChunks = Math.max(1, Math.ceil(file.size / chunkSize));

      for (let index = 0; index < totalChunks; index++) {
        if (session.value.cancelled) {
          throw new DOMException("用户取消上传", "AbortError");
        }

        const startBytes = index * chunkSize;
        const endBytes = Math.min(file.size, startBytes + chunkSize);
        const uploadedBytesBeforeChunk = startBytes;
        const chunkBlob = file.slice(startBytes, endBytes, contentType);
        const chunkFile = new File([chunkBlob], file.name, { type: contentType });
        const chunkController = new AbortController();
        session.value.controller = chunkController;

        const partResult = await startUploadpart(
          {
            file: chunkFile,
            fileName: file.name,
            uploadId,
            partNumber: index + 1,
          },
          {
            signal: chunkController.signal,
            onProgress: (loaded, total) => {
              const safeTotal = total || chunkFile.size || 1;
              const uploadedBytes = uploadedBytesBeforeChunk + Math.min(loaded, safeTotal);
              progress.value = Math.min(
                99,
                (uploadedBytes / Math.max(file.size, 1)) * 100
              );
            },
          }
        );

        const partMeta = resolvePartMeta(partResult, index + 1);
        if (!partMeta.eTag) {
          throw new Error(`第 ${index + 1} 个分片上传成功，但未返回 eTag`);
        }

        parts.push(partMeta);
        progress.value = Math.min(99, (endBytes / Math.max(file.size, 1)) * 100);
      }

      const completeResult = await completeUpload({
        uploadId,
        fileName: file.name,
        parts: parts.sort((a, b) => a.partNumber - b.partNumber),
        fileSize: file.size,
        contentType,
      });

      if (!completeResult?.ossId) {
        throw new Error("分片上传完成，但未返回 ossId");
      }

      session.value.controller = null;
      progress.value = 100;
      status.value = "success";
      return completeResult;
    } catch (error: any) {
      const isCancelled =
        cancelPending.value ||
        session.value.cancelled ||
        (error instanceof DOMException && error.name === "AbortError");

      if (!isCancelled) {
        try {
          await startUploadAbort({
            fileName: file.name,
            contentType,
            uploadId: uploadId || undefined,
          });
        } catch (abortError) {
          console.warn("取消分片上传失败:", abortError);
        }

        status.value = "error";
        errorMessage.value = error?.message || defaultErrorMessage;
        throw error;
      }

      return null;
    } finally {
      session.value.controller = null;
      if (cancelPending.value) {
        reset();
      }
    }
  };

  const cancel = async () => {
    if (!isUploading.value) return false;

    const currentSession = { ...session.value };
    cancelPending.value = true;
    session.value.cancelled = true;
    session.value.controller?.abort();

    if (!currentSession.fileName) {
      return false;
    }

    await startUploadAbort({
      fileName: currentSession.fileName,
      contentType: currentSession.contentType || "application/octet-stream",
      uploadId: currentSession.uploadId || undefined,
    });

    status.value = "idle";
    progress.value = 0;
    errorMessage.value = "";
    return true;
  };

  return {
    status,
    progress,
    progressPercent,
    errorMessage,
    isUploading,
    start,
    cancel,
    reset,
  };
};
