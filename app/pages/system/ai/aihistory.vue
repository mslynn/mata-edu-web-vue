<template>
  <div class="ai-image-history-page">
    <div class="ai-image-history-shell">
      <div class="ai-image-history-topbar">
        <button type="button" class="ai-image-history-back" @click="handleBackToImagePage">
          <span>返回</span>
        </button>

        <button
          type="button"
          class="ai-image-history-download"
          :disabled="!selectedImageUrl || downloadLoading"
          @click="handleDownloadSelectedImage"
        >
          <span>{{ downloadButtonText }}</span>
        </button>
      </div>

      <div class="ai-image-history-heading">
        <h1 class="ai-image-history-heading__title">作品画廊</h1>
        <p class="ai-image-history-heading__subtitle">
          探索 AI 实践中的创意灵感与学习成果
        </p>
      </div>

      <div v-if="historyLoading" class="ai-image-history-empty">
        <p class="ai-image-history-empty__title">作品画廊加载中...</p>
      </div>

      <div v-else-if="historyError" class="ai-image-history-empty">
        <p class="ai-image-history-empty__title">{{ historyError }}</p>
      </div>

      <template v-else-if="imageHistoryList.length > 0">
        <div class="ai-image-history-gallery">
          <article
            v-for="(item, index) in visibleHistoryList"
            :key="item.id"
            class="ai-image-history-gallery__item"
            :class="[resolveGalleryCardClass(index), { 'is-active': item.id === selectedRecordId }]"
          >
            <button
              type="button"
              class="ai-image-history-gallery__select"
              :class="{ 'is-active': item.id === selectedRecordId }"
              :aria-label="item.id === selectedRecordId ? '当前已选中下载作品' : '设为当前下载作品'"
              @click.stop="handleSelectRecord(item)"
            >
              <span class="ai-image-history-gallery__select-text">
                {{ item.id === selectedRecordId ? "已选中" : "选中下载" }}
              </span>
            </button>

            <button
              type="button"
              class="ai-image-history-gallery__image-button"
              :title="item.content"
              :aria-label="`打开作品详情：${item.content}`"
              @click="handleOpenImageDetail(item)"
            >
              <img
                v-if="item.imageUrl"
                :src="buildAiImageProxyUrl(item.imageUrl)"
                :alt="item.content"
                class="ai-image-history-gallery__image"
              />
              <div v-else class="ai-image-history-gallery__placeholder">暂无图片</div>
              <span class="ai-image-history-gallery__shadow" aria-hidden="true"></span>
              <span
                v-if="item.id === selectedRecordId"
                class="ai-image-history-gallery__active-badge"
                aria-hidden="true"
              >
                当前下载
              </span>
            </button>
          </article>
        </div>

        <div v-if="canLoadMore" class="ai-image-history-more">
          <button type="button" class="ai-image-history-more__button" @click="handleLoadMore">
            <span>加载更多作品</span>
          </button>
        </div>
      </template>

      <div v-else class="ai-image-history-empty">
        <p class="ai-image-history-empty__title">暂无作品记录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "sidebar",
});

type ImageHistoryRecord = {
  id: string;
  recordId: string;
  sessionId: string;
  messageId: string;
  content: string;
  date: string;
  imageUrl: string;
};

const route = useRoute();
const router = useRouter();
import { aiAdmin } from "~/composables/api/ai";
const { getImageList } = aiAdmin();

const historyLoading = ref(false);
const historyError = ref("");
const imageHistoryList = ref<ImageHistoryRecord[]>([]);
const selectedRecordId = ref("");
const downloadLoading = ref(false);
const IMAGE_HISTORY_PAGE_SIZE = 6;
const visibleCount = ref(IMAGE_HISTORY_PAGE_SIZE);

const isValidFieldValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  return text.length > 0 && text !== "null" && text !== "undefined";
};

const createLowerCaseMap = (source: Record<string, unknown>) => {
  const map = new Map<string, unknown>();
  Object.entries(source).forEach(([key, value]) => {
    map.set(key.toLowerCase(), value);
  });
  return map;
};

const pickByKeys = (map: Map<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = map.get(key.toLowerCase());
    if (isValidFieldValue(value)) {
      return value;
    }
  }
  return undefined;
};

const unwrapAiRows = (rows: unknown): unknown[] => {
  if (Array.isArray(rows)) return rows;
  if (!rows || typeof rows !== "object") return [];

  const record = rows as Record<string, unknown>;
  const directKeys = ["rows", "list", "items", "records", "messages", "data"];
  for (const key of directKeys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }
  for (const key of directKeys) {
    const nestedValue = record[key];
    if (nestedValue && typeof nestedValue === "object") {
      const nestedRows = unwrapAiRows(nestedValue);
      if (nestedRows.length) {
        return nestedRows;
      }
    }
  }
  return [record];
};

const formatHistoryDate = (value: unknown) => {
  if (!isValidFieldValue(value)) return "--";
  const text = String(value).trim();
  const matched = text.match(/(\d{1,2})[-/月](\d{1,2})/);
  if (matched) {
    return `${matched[1].padStart(2, "0")}月${matched[2].padStart(2, "0")}日`;
  }
  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${month}月${day}日`;
  }
  return text;
};

const normalizeAiImageUrl = (value: unknown) => {
  if (!isValidFieldValue(value)) return "";
  const text = String(value).trim();
  if (!/^https?:\/\//i.test(text)) return "";
  return text.replace(/[),.;]+$/g, "");
};

const extractAiImageUrlsFromText = (text: string): string[] => {
  const source = String(text || "").trim();
  if (!source) return [];
  const result = new Set<string>();
  const markdownMatches = source.matchAll(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/gi);
  for (const match of markdownMatches) {
    const url = normalizeAiImageUrl(match[1]);
    if (url) result.add(url);
  }
  const urlMatches = source.matchAll(/https?:\/\/[^\s"'<>）)]+/gi);
  for (const match of urlMatches) {
    const url = normalizeAiImageUrl(match[0]);
    if (url) result.add(url);
  }
  return Array.from(result);
};

const extractAiChatText = (payload: unknown): string => {
  if (!payload) return "";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    return payload.map((item) => extractAiChatText(item)).join(" ");
  }
  if (typeof payload !== "object") return String(payload);
  const record = payload as Record<string, unknown>;
  const directKeys = ["content", "text", "message", "prompt", "question", "title", "name"];
  for (const key of directKeys) {
    const value = record[key];
    if (isValidFieldValue(value)) {
      return String(value).trim();
    }
  }
  const nestedKeys = ["data", "output", "result", "results", "messages", "choices"];
  for (const key of nestedKeys) {
    const text = extractAiChatText(record[key]);
    if (text) return text;
  }
  return "";
};

const extractAiImageUrls = (payload: unknown): string[] => {
  if (!payload) return [];
  if (typeof payload === "string") return extractAiImageUrlsFromText(payload);
  if (Array.isArray(payload)) {
    const result = new Set<string>();
    payload.forEach((item) => {
      extractAiImageUrls(item).forEach((url) => result.add(url));
    });
    return Array.from(result);
  }
  if (typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const result = new Set<string>();
  const directUrlKeys = ["url", "imageUrl", "imageURL", "image_url", "fileUrl", "file_url", "src"];
  directUrlKeys.forEach((key) => {
    const url = normalizeAiImageUrl(record[key]);
    if (url) result.add(url);
  });
  const listKeys = [
    "urls",
    "imageUrls",
    "image_urls",
    "images",
    "imageList",
    "outputs",
    "results",
    "data",
    "output",
    "message",
    "choices",
    "chunks",
  ];
  listKeys.forEach((key) => {
    extractAiImageUrls(record[key]).forEach((url) => result.add(url));
  });
  const text = extractAiChatText(record);
  extractAiImageUrlsFromText(text).forEach((url) => result.add(url));
  return Array.from(result);
};

const normalizeAiImagePreviewList = (rows: unknown): ImageHistoryRecord[] => {
  return unwrapAiRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const rowMap = createLowerCaseMap(item);
      const recordId = String(
        pickByKeys(rowMap, ["recordId", "record_id", "id", "sessionRecordId"]) || ""
      ).trim();
      const sessionId = String(
        pickByKeys(rowMap, ["sessionId", "session_id", "conversationId", "conversation_id"]) || ""
      ).trim();
      const messageId = String(pickByKeys(rowMap, ["messageId", "message_id", "id"]) || "").trim();
      const imageUrl = extractAiImageUrls(item)[0] || "";
      const content =
        String(
          pickByKeys(rowMap, [
            "title",
            "prompt",
            "sessionTitle",
            "question",
            "content",
            "message",
            "name",
          ]) || ""
        ).trim() || "未命名生图记录";

      return {
        id: recordId || sessionId || messageId,
        recordId,
        sessionId,
        messageId,
        content,
        date: formatHistoryDate(
          pickByKeys(rowMap, ["updateTime", "updatedAt", "createTime", "createdAt", "time"])
        ),
        imageUrl,
      };
    })
    .filter((item) => item.sessionId);
};

const buildAiImageProxyUrl = (url: string) => {
  const normalizedUrl = String(url || "").trim();
  if (!normalizedUrl) return "";
  if (
    normalizedUrl.startsWith("data:") ||
    normalizedUrl.startsWith("blob:") ||
    normalizedUrl.startsWith("/")
  ) {
    return normalizedUrl;
  }
  if (/^https?:\/\//i.test(normalizedUrl)) {
    return `/api/ai-image-proxy?url=${encodeURIComponent(normalizedUrl)}`;
  }
  return normalizedUrl;
};

const resolveImageDownloadName = (url: string) => {
  const normalizedUrl = String(url || "").trim();
  const filePath = normalizedUrl.split("?")[0] || "";
  const matched = filePath.match(/\.([a-zA-Z0-9]+)$/);
  const extension = matched?.[1] ? matched[1].toLowerCase() : "png";
  const safeExtension = ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(extension)
    ? extension
    : "png";
  return `AI生图-${Date.now()}.${safeExtension}`;
};

const selectedRecord = computed(
  () => imageHistoryList.value.find((item) => item.id === selectedRecordId.value) || null
);
const selectedImageUrl = computed(() => String(selectedRecord.value?.imageUrl || "").trim());
const downloadButtonText = computed(() =>
  downloadLoading.value ? "下载中..." : selectedImageUrl.value ? "下载当前选中" : "请选择作品"
);
const visibleHistoryList = computed(() => imageHistoryList.value.slice(0, visibleCount.value));
const canLoadMore = computed(() => imageHistoryList.value.length > visibleCount.value);

const ensureSelectedRecordVisible = () => {
  const selectedIndex = imageHistoryList.value.findIndex((item) => item.id === selectedRecordId.value);
  if (selectedIndex < 0) return;
  const nextVisibleCount =
    Math.ceil((selectedIndex + 1) / IMAGE_HISTORY_PAGE_SIZE) * IMAGE_HISTORY_PAGE_SIZE;
  if (nextVisibleCount > visibleCount.value) {
    visibleCount.value = nextVisibleCount;
  }
};

const syncSelectedRecord = () => {
  const routeSessionId = String(route.query.aiSessionId || "").trim();
  if (routeSessionId) {
    const matched = imageHistoryList.value.find((item) => item.sessionId === routeSessionId);
    if (matched?.id) {
      selectedRecordId.value = matched.id;
      ensureSelectedRecordVisible();
      return;
    }
  }
  if (!imageHistoryList.value.some((item) => item.id === selectedRecordId.value)) {
    selectedRecordId.value = imageHistoryList.value[0]?.id || "";
  }
  ensureSelectedRecordVisible();
};

const fetchImageHistoryList = async () => {
  historyLoading.value = true;
  historyError.value = "";
  try {
    const rows = await getImageList();
    imageHistoryList.value = normalizeAiImagePreviewList(rows);
    syncSelectedRecord();
  } catch (error: unknown) {
    historyError.value =
      error instanceof Error && error.message ? error.message : "历史记录获取失败";
    ElMessage.error(historyError.value);
  } finally {
    historyLoading.value = false;
  }
};

const handleSelectRecord = (item: ImageHistoryRecord) => {
  selectedRecordId.value = item.id;
  ensureSelectedRecordVisible();
};

const handleLoadMore = () => {
  visibleCount.value += IMAGE_HISTORY_PAGE_SIZE;
};

const resolveGalleryCardClass = (index: number) => {
  const pattern = ["wide", "portrait", "square", "portrait-tall", "portrait-large", "wide-low"];
  return `ai-image-history-gallery__item--${pattern[index % pattern.length]}`;
};

const handleBackToImagePage = () => {
  const targetQuery: Record<string, string> = {
    aiView: "form",
    aiSessionType: "7",
  };
  const sessionId = String(selectedRecord.value?.sessionId || "").trim();
  if (sessionId) {
    targetQuery.aiSessionId = sessionId;
  }
  const targetPath = route.path.startsWith("/system/opt/")
    ? "/system/opt/ai-painting"
    : "/system/ai";
  void router.push({
    path: targetPath,
    query: targetQuery,
  });
};

const handleOpenImageDetail = (item: ImageHistoryRecord | null) => {
  const sessionId = String(item?.sessionId || "").trim();
  if (!sessionId) return;
  const targetPath = route.path.startsWith("/system/opt/")
    ? "/system/opt/ai-painting"
    : "/system/ai";
  void router.push({
    path: targetPath,
    query: {
      aiView: "form",
      aiSessionType: "7",
      aiSessionId: sessionId,
    },
  });
};

const handleDownloadSelectedImage = async () => {
  const targetUrl = selectedImageUrl.value;
  if (!targetUrl || downloadLoading.value) return;
  const proxyUrl = buildAiImageProxyUrl(targetUrl);

  try {
    downloadLoading.value = true;
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error("下载失败");
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = resolveImageDownloadName(targetUrl);
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
    ElMessage.success("开始下载");
  } catch {
    ElMessage.error("下载失败，请重试");
  } finally {
    downloadLoading.value = false;
  }
};

onMounted(() => {
  void fetchImageHistoryList();
});
</script>

<style scoped>
.ai-image-history-page {
  min-height: calc(100vh - 96px);
  padding: 24px 0 40px;
  background:
    radial-gradient(circle at top left, rgba(116, 166, 255, 0.08), transparent 24%),
    linear-gradient(180deg, #fbfcff 0%, #f7f9fd 100%);
}

.ai-image-history-shell {
  width: min(100%, 1520px);
  margin: 0 auto;
  padding: 0 28px;
}

.ai-image-history-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.ai-image-history-back,
.ai-image-history-download,
.ai-image-history-more__button {
  border: none;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease,
    background-color 0.2s ease, color 0.2s ease;
}

.ai-image-history-back {
  height: 36px;
  padding: 0 4px;
  background: transparent;
  color: #5f6672;
  justify-content: flex-start;
}

.ai-image-history-back:hover {
  color: #1f2937;
}

.ai-image-history-download {
  min-width: 118px;
  height: 40px;
  padding: 0 18px;
  background: linear-gradient(135deg, #0d6dde 0%, #005bc2 100%);
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(0, 91, 194, 0.22);
}

.ai-image-history-download:hover,
.ai-image-history-more__button:hover {
  transform: translateY(-1px);
}

.ai-image-history-download:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
  transform: none;
}

.ai-image-history-heading {
  margin-bottom: 30px;
}

.ai-image-history-heading__title {
  margin: 0;
  color: #0f172a;
  font-size: 42px;
  font-weight: 800;
  line-height: 1.08;
}

.ai-image-history-heading__subtitle {
  margin: 10px 0 0;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
}

.ai-image-history-empty {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
}

.ai-image-history-empty__title {
  margin: 0;
  color: #516178;
  font-size: 16px;
  font-weight: 700;
}

.ai-image-history-gallery {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: 16px;
  gap: 16px;
}

.ai-image-history-gallery__item {
  position: relative;
  min-height: 0;
  border-radius: 22px;
  overflow: hidden;
  background: #070b12;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.ai-image-history-gallery__item:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.14);
}

.ai-image-history-gallery__item.is-active {
  border-color: rgba(0, 91, 194, 0.52);
  box-shadow:
    0 20px 44px rgba(0, 91, 194, 0.18),
    0 0 0 3px rgba(121, 176, 255, 0.22);
}

.ai-image-history-gallery__item--wide {
  grid-row: span 10;
}

.ai-image-history-gallery__item--portrait {
  grid-row: span 8;
}

.ai-image-history-gallery__item--square {
  grid-row: span 13;
}

.ai-image-history-gallery__item--portrait-tall {
  grid-row: span 11;
}

.ai-image-history-gallery__item--portrait-large {
  grid-row: span 16;
}

.ai-image-history-gallery__item--wide-low {
  grid-row: span 8;
}

.ai-image-history-gallery__select {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  min-width: 82px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.46);
  color: rgba(255, 255, 255, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease,
    border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-image-history-gallery__select.is-active {
  border-color: rgba(255, 255, 255, 0.22);
  background: linear-gradient(135deg, rgba(16, 127, 255, 0.96) 0%, rgba(0, 91, 194, 0.96) 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(0, 91, 194, 0.26);
}

.ai-image-history-gallery__select:hover {
  transform: scale(1.04);
}

.ai-image-history-gallery__select-text {
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.01em;
}

.ai-image-history-gallery__item:not(.is-active) .ai-image-history-gallery__select {
  opacity: 0;
}

.ai-image-history-gallery__item:hover .ai-image-history-gallery__select,
.ai-image-history-gallery__item:focus-within .ai-image-history-gallery__select,
.ai-image-history-gallery__item.is-active .ai-image-history-gallery__select {
  opacity: 1;
}

.ai-image-history-gallery__image-button {
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0;
  display: block;
  cursor: pointer;
}

.ai-image-history-gallery__image,
.ai-image-history-gallery__placeholder {
  width: 100%;
  height: 100%;
  display: block;
}

.ai-image-history-gallery__image {
  object-fit: cover;
}

.ai-image-history-gallery__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.58);
  font-size: 14px;
  font-weight: 600;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.1), transparent 30%),
    linear-gradient(180deg, #131a27 0%, #090d14 100%);
}

.ai-image-history-gallery__shadow {
  position: absolute;
  inset: auto 0 0 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(5, 8, 15, 0) 0%, rgba(5, 8, 15, 0.26) 100%);
  pointer-events: none;
}

.ai-image-history-gallery__active-badge {
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 2;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #005bc2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16);
}

.ai-image-history-more {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.ai-image-history-more__button {
  height: 42px;
  padding: 0 18px;
  background: #ffffff;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

@media (max-width: 1700px) {
  .ai-image-history-shell {
    width: 100%;
  }
}

@media (max-width: 1360px) {
  .ai-image-history-shell {
    padding: 0 22px;
  }

  .ai-image-history-heading__title {
    font-size: 36px;
  }

  .ai-image-history-gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .ai-image-history-page {
    padding-top: 18px;
  }

  .ai-image-history-shell {
    padding: 0 16px;
  }

  .ai-image-history-topbar {
    flex-wrap: wrap;
  }

  .ai-image-history-download {
    margin-left: auto;
  }

  .ai-image-history-heading {
    margin-bottom: 22px;
  }

  .ai-image-history-heading__title {
    font-size: 32px;
  }

  .ai-image-history-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .ai-image-history-heading__title {
    font-size: 28px;
  }

  .ai-image-history-gallery {
    grid-template-columns: 1fr;
  }

  .ai-image-history-gallery__item--wide,
  .ai-image-history-gallery__item--portrait,
  .ai-image-history-gallery__item--square,
  .ai-image-history-gallery__item--portrait-tall,
  .ai-image-history-gallery__item--portrait-large,
  .ai-image-history-gallery__item--wide-low {
    grid-row: span 16;
  }
}
</style>
