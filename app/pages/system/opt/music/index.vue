<template>
  <div ref="musicPageRef" class="music-page" :style="pageAdaptiveStyle">
    <div class="music-shell">
      <nav class="music-breadcrumb" :aria-label="t('music.breadcrumbLabel')">
        <button type="button" class="music-breadcrumb__link" @click="handleBackToAiCenter">
          {{ t("music.aiPracticeCenter") }}
        </button>
        <span class="music-breadcrumb__separator">/</span>
        <span class="music-breadcrumb__current">{{ t("music.aiSongCreation") }}</span>
      </nav>

      <main class="music-main">
        <section class="music-hero">
          <div class="music-hero__content">
            <span class="music-kicker">Music Generation Suite</span>
            <h1>{{ t("music.heroTitle") }}</h1>
            <p>
              {{ t("music.heroDesc") }}
            </p>
          </div>
        </section>

        <MusicGenerationWorkspace
          v-model:prompt="prompt"
          v-model:song-title="songTitle"
          v-model:lyrics="lyrics"
          v-model:selected-style="selectedStyle"
          v-model:selected-emotion="selectedEmotion"
          v-model:selected-scene="selectedScene"
          :lyrics-generating="lyricsGenerating"
          :song-generating="songGenerating"
          :song-generate-hint="songGenerateHint"
          :prompt-tags="promptTags"
          :style-options="styleOptions"
          :emotion-options="emotionOptions"
          :scene-options="sceneOptions"
          @append-tag="appendPromptTag"
          @generate-lyrics="handleCreateSongLyrics"
          @generate-song="handleGenerate"
        />

        <section class="music-works">
          <div class="music-section-head">
            <div>
              <span class="music-section-head__icon material-symbols-outlined">
                library_music
              </span>
              <h2>{{ t("music.myWorks") }}</h2>
            </div>
            <button type="button" class="music-view-all" @click="openWorksModal">
              {{ t("music.viewAll") }}
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div class="music-work-grid">
            <article
              v-for="work in musicWorks"
              :key="work.songId || work.taskId || work.title"
              class="music-work-card"
              :style="{ '--work-accent': work.accent }"
              @click="openPlayer(work)"
            >
              <div class="music-work-card__cover">
                <img :src="work.cover" :alt="work.title" />
                <span>{{ work.badge }}</span>
                <button
                  type="button"
                  class="music-work-card__play"
                  :aria-label="t('music.play')"
                  @click.stop="openPlayer(work)"
                >
                  <span class="material-symbols-outlined">play_arrow</span>
                </button>
              </div>
              <h3>{{ work.title }}</h3>
              <p>{{ work.date }}</p>
            </article>
          </div>
        </section>
      </main>
    </div>

    <Teleport to="body">
      <div
        v-if="showWorksModal"
        class="music-modal"
        @click="closeWorksModal"
      >
        <section
          class="music-modal__panel"
          role="dialog"
          aria-modal="true"
          :aria-label="t('music.myWorks')"
          @click.stop
        >
          <header class="music-modal__header">
            <div class="music-modal__title-wrap">
              <i></i>
              <h2>{{ t("music.myWorks") }}</h2>
            </div>
            <button
              type="button"
              class="music-modal__close"
              :aria-label="t('music.close')"
              @click="closeWorksModal"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>

          <div class="music-modal__grid">
            <article
              v-for="work in allMusicWorks"
              :key="`modal-${work.songId || work.taskId || work.title}`"
              class="music-modal-card"
              :style="{ '--work-accent': work.accent }"
              @click="openPlayer(work)"
            >
              <div class="music-modal-card__cover">
                <img :src="work.cover" :alt="work.title" />
                <span>{{ work.style }}</span>
              </div>
              <h3>{{ work.title }}</h3>
              <p>{{ work.date }}</p>
            </article>
          </div>

          <footer class="music-modal__footer">
            <button type="button" class="music-modal__confirm" @click="closeWorksModal">
              {{ t("music.close") }}
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { aiAdmin } from "~/composables/api/ai";
import { ElMessage } from "element-plus";
import MusicGenerationWorkspace from "~/components/music/MusicGenerationWorkspace.vue";

const { t } = useI18n();
const { getSongOptions, creatSongLyrics, creatSongTask, getSongTasks, getSongList, getSongDetail } = aiAdmin();

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: computed(() => t("music.aiSongCreation")),
  htmlAttrs: {},
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800;900&display=swap",
    },
  ],
});

const musicPageRef = ref<HTMLElement | null>(null);
let musicPageResizeObserver: ResizeObserver | null = null;
const musicLayoutWidth = ref(1360);
const showWorksModal = ref(false);

interface MusicWorkItem {
  songId?: string;
  taskId?: string;
  title: string;
  badge?: string;
  style: string;
  date: string;
  accent: string;
  cover: string;
  audioUrl?: string;
  lyricsContent?: string;
  taskStatus?: string;
}

interface MusicOption {
  key: string;
  label: string;
}

const prompt = ref("");
const songTitle = ref("");
const lyrics = ref("");
const lyricsGenerating = ref(false);
const songGenerating = ref(false);
const songGenerateHint = ref(t("music.generateHint"));
const latestSongTaskId = ref("");
const selectedStyle = ref("pop");
const selectedEmotion = ref("happy");
const selectedScene = ref("fitness");

const promptTags = computed(() => [t("music.tagRetroFuturism"), t("music.tagMorningCafe"), t("music.tagDeepSeaDive")]);
const fallbackStyleOptions = computed<MusicOption[]>(() => [
  { key: "pop", label: t("music.stylePop") },
  { key: "electronic", label: t("music.styleElectronic") },
  { key: "rock", label: t("music.styleRock") },
  { key: "jazz", label: t("music.styleJazz") },
  { key: "folk", label: t("music.styleFolk") },
  { key: "classical", label: t("music.styleClassical") },
  { key: "ambient", label: t("music.styleAmbient") },
  { key: "blues", label: t("music.styleBlues") },
  { key: "metal", label: t("music.styleMetal") },
  { key: "hiphop", label: t("music.styleHiphop") },
  { key: "country", label: t("music.styleCountry") },
  { key: "disco", label: t("music.styleDisco") },
]);
const fallbackEmotionOptions = computed<MusicOption[]>(() => [
  { key: "happy", label: t("music.emotionHappy") },
  { key: "sad", label: t("music.emotionSad") },
  { key: "energetic", label: t("music.emotionEnergetic") },
  { key: "calm", label: t("music.emotionCalm") },
  { key: "relaxed", label: t("music.emotionRelaxed") },
  { key: "soothing", label: t("music.emotionSoothing") },
  { key: "focused", label: t("music.emotionFocused") },
  { key: "positive", label: t("music.emotionPositive") },
  { key: "inspiring", label: t("music.emotionInspiring") },
]);
const fallbackSceneOptions = computed<MusicOption[]>(() => [
  { key: "fitness", label: t("music.sceneFitness") },
  { key: "study", label: t("music.sceneStudy") },
  { key: "party", label: t("music.sceneParty") },
  { key: "meditation", label: t("music.sceneMeditation") },
  { key: "driving", label: t("music.sceneDriving") },
  { key: "sleep", label: t("music.sceneSleep") },
  { key: "travel", label: t("music.sceneTravel") },
  { key: "yoga", label: t("music.sceneYoga") },
  { key: "gaming", label: t("music.sceneGaming") },
]);

const styleOptionsState = ref<MusicOption[]>([]);
const emotionOptionsState = ref<MusicOption[]>([]);
const sceneOptionsState = ref<MusicOption[]>([]);

const styleOptions = computed<MusicOption[]>(() =>
  styleOptionsState.value.length ? styleOptionsState.value : fallbackStyleOptions.value,
);
const emotionOptions = computed<MusicOption[]>(() =>
  emotionOptionsState.value.length ? emotionOptionsState.value : fallbackEmotionOptions.value,
);
const sceneOptions = computed<MusicOption[]>(() =>
  sceneOptionsState.value.length ? sceneOptionsState.value : fallbackSceneOptions.value,
);

const normalizeSongOptions = (rows: unknown): MusicOption[] => {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const key = String(
        row.key ??
        row.value ??
        row.code ??
        row.optionValue ??
        row.dictValue ??
        row.id ??
        `option-${index}`,
      ).trim();
      const label = String(
        row.label ??
        row.name ??
        row.title ??
        row.optionLabel ??
        row.dictLabel ??
        row.text ??
        key,
      ).trim();
      if (!key || !label) return null;
      return { key, label };
    })
    .filter((item): item is MusicOption => Boolean(item));
};

const syncSelectedSongOption = (selectedRef: Ref<string>, options: MusicOption[]) => {
  if (!options.length) return;
  if (!options.some((item) => item.key === selectedRef.value)) {
    selectedRef.value = options[0]!.key;
  }
};

const selectFirstSongOptions = () => {
  if (styleOptions.value[0]) selectedStyle.value = styleOptions.value[0].key;
  if (emotionOptions.value[0]) selectedEmotion.value = emotionOptions.value[0].key;
  if (sceneOptions.value[0]) selectedScene.value = sceneOptions.value[0].key;
};

const loadSongOptions = async () => {
  try {
    const data = await getSongOptions();
    const optionMap = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;

    styleOptionsState.value = normalizeSongOptions(
      optionMap.styleOptions ??
      optionMap.styles ??
      optionMap.styleList ??
      optionMap.musicStyles,
    );
    emotionOptionsState.value = normalizeSongOptions(
      optionMap.emotionOptions ??
      optionMap.emotions ??
      optionMap.emotionList,
    );
    sceneOptionsState.value = normalizeSongOptions(
      optionMap.sceneOptions ??
      optionMap.scenarios ??
      optionMap.scenarioOptions ??
      optionMap.scenarioList,
    );

    selectFirstSongOptions();
  } catch (error) {
    console.error("加载歌曲参数选项失败:", error);
    syncSelectedSongOption(selectedStyle, styleOptions.value);
    syncSelectedSongOption(selectedEmotion, emotionOptions.value);
    syncSelectedSongOption(selectedScene, sceneOptions.value);
  }
};

const musicWorksState = ref<MusicWorkItem[]>([]);

const allMusicWorks = computed<MusicWorkItem[]>(() => musicWorksState.value);
const musicWorks = computed<MusicWorkItem[]>(() => allMusicWorks.value.slice(0, 4));

const getSongTaskBadge = (taskStatus?: string) => {
  const normalizedStatus = String(taskStatus || "").trim().toLowerCase();
  if (["success", "completed", "done", "finished"].includes(normalizedStatus)) {
    return t("music.badgeCompleted");
  }
  if (["processing", "pending", "running", "queued"].includes(normalizedStatus)) {
    return t("music.badgeInProgress");
  }
  if (["failed", "error", "cancelled", "canceled"].includes(normalizedStatus)) {
    return t("music.badgeDraft");
  }
  return t("music.badgeCompleted");
};

const formatSongDate = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") {
    return "2026. 05. 18";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}`;
};

const resolveSongAssetUrl = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const normalizeSongWorkItem = (payload: unknown, index = 0): MusicWorkItem | null => {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const taskStatus = String(
    record.taskStatus ??
    record.status ??
    "",
  ).trim();
  const title = String(
    record.title ??
    record.songTitle ??
    record.name ??
    `歌曲作品 ${index + 1}`,
  ).trim();
  const style = String(
    record.styleTag ??
    record.style ??
    record.songStyle ??
    "POP",
  ).trim().toUpperCase();
  const cover = resolveSongAssetUrl(record, [
    "coverUrl",
    "cover",
    "picUrl",
    "imageUrl",
    "posterUrl",
  ]) || "/images/ai-practice/practice-23-7c2c96bc.webp";

  return {
    songId: String(record.songId ?? record.id ?? "").trim() || undefined,
    taskId: String(record.taskId ?? "").trim() || undefined,
    title,
    badge: getSongTaskBadge(taskStatus),
    style: style || "POP",
    date: formatSongDate(
      record.createTime ??
      record.createdAt ??
      record.gmtCreate ??
      record.updateTime ??
      Date.now(),
    ),
    accent: "#005bc2",
    cover,
    audioUrl: resolveSongAssetUrl(record, ["audioUrl", "songUrl", "fileUrl", "url"]),
    lyricsContent: typeof record.lyricsContent === "string" ? record.lyricsContent : "",
    taskStatus,
  };
};

const loadSongWorks = async () => {
  try {
    const rows = await getSongList({
      pageNum: "1",
      pageSize: "100",
      orderByColumn: "createTime",
      isAsc: "desc",
    });
    const nextWorks = (Array.isArray(rows) ? rows : [])
      .map((item, index) => normalizeSongWorkItem(item, index))
      .filter((item): item is MusicWorkItem => Boolean(item));

    if (nextWorks.length) {
      musicWorksState.value = nextWorks;
    }
  } catch (error) {
    console.error("加载音乐作品失败:", error);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getMusicLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = musicPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(width => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const syncMusicLayoutWidth = () => {
  musicLayoutWidth.value = getMusicLayoutWidth();
};

const musicShellWidth = computed(() => {
  if (musicLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(musicLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(musicLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--music-shell-width": musicShellWidth.value,
}));

const handleBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};

const resolveSongLyricsText = (payload: unknown): string => {
  if (payload === null || payload === undefined) return "";
  if (typeof payload === "string") return payload.trim();
  if (Array.isArray(payload)) {
    return payload.map((item) => resolveSongLyricsText(item)).filter(Boolean).join("\n").trim();
  }
  if (typeof payload !== "object") return String(payload).trim();

  const record = payload as Record<string, unknown>;
  const directKeys = [
    "lyrics",
    "lyricsContent",
    "content",
    "text",
    "result",
    "data",
  ];

  for (const key of directKeys) {
    const value = record[key];
    const resolved = resolveSongLyricsText(value);
    if (resolved) return resolved;
  }

  return "";
};

const appendPromptTag = (tag: string) => {
  const value = prompt.value.trim();
  prompt.value = value ? `${value}${t("music.tagSeparator")}${tag}` : tag;
};

const handleCreateSongLyrics = async () => {
  if (lyricsGenerating.value) return;

  const promptText = prompt.value.trim();
  if (!promptText) {
    ElMessage.warning("请先输入音乐风格或意境描述");
    return;
  }

  try {
    lyricsGenerating.value = true;
    const response = await creatSongLyrics({
      title: songTitle.value.trim() || undefined,
      promptText,
      styleTag: selectedStyle.value,
      emotionTag: selectedEmotion.value,
      scenarioTag: selectedScene.value,
    });
    const nextLyrics = resolveSongLyricsText(response);
    if (!nextLyrics) {
      ElMessage.warning("暂未生成歌词内容，请调整描述后重试");
      return;
    }
    lyrics.value = nextLyrics;
  } catch (error) {
    console.error("生成歌曲歌词失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "生成歌曲歌词失败");
  } finally {
    lyricsGenerating.value = false;
  }
};

const resolveSongTaskTip = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  const directKeys = [
    "message",
    "msg",
    "status",
    "taskStatus",
    "taskStage",
    "step",
    "progressText",
    "text",
  ];

  for (const key of directKeys) {
    const value = record[key];
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }

  const nestedKeys = ["data", "result"];
  for (const key of nestedKeys) {
    const text = resolveSongTaskTip(record[key]);
    if (text) return text;
  }

  return "";
};

const resolveSongTaskPayload = (payload: unknown): Record<string, unknown> => {
  if (!payload || typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  const nestedData = record.data;
  if (nestedData && typeof nestedData === "object") {
    return nestedData as Record<string, unknown>;
  }
  return record;
};

const isSongTaskCompleted = (taskStatus?: string) => {
  return ["succeeded"].includes(
    String(taskStatus || "").trim().toLowerCase(),
  );
};

const isSongTaskFailed = (taskStatus?: string) => {
  return ["failed"].includes(
    String(taskStatus || "").trim().toLowerCase(),
  );
};

const pollSongTaskUntilFinished = async (taskId: string, initialSongId?: string) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const taskResult = await getSongTasks(taskId);
    const taskPayload = resolveSongTaskPayload(taskResult);
    const taskStatus = String(
      taskPayload.taskStatus ??
      taskPayload.status ??
      "",
    ).trim();
    const nextTip =
      resolveSongTaskTip(taskResult) ||
      resolveSongTaskTip(taskPayload) ||
      `生成中（${attempt + 1}/60）`;
    songGenerateHint.value = nextTip;

    if (isSongTaskFailed(taskStatus)) {
      const errorMessage = String(
        taskPayload.errorMessage ??
        taskPayload.message ??
        taskPayload.msg ??
        "歌曲生成失败",
      ).trim();
      throw new Error(errorMessage || "歌曲生成失败");
    }

    if (isSongTaskCompleted(taskStatus)) {
      await loadSongWorks();
      const nextSongId = String(
        taskPayload.songId ??
        initialSongId ??
        "",
      ).trim();
      songGenerateHint.value = "歌曲生成完成";
      if (nextSongId) {
        await navigateTo({
          path: "/system/opt/music/player",
          query: {
            songId: nextSongId,
          },
        });
      }
      return taskPayload;
    }

    await sleep(2000);
  }

  throw new Error("歌曲生成超时，请稍后在我的作品中查看");
};

const handleGenerate = async () => {
  if (songGenerating.value) return;

  if (!prompt.value.trim()) {
    const styleLabel = styleOptions.value.find(o => o.key === selectedStyle.value)?.label || "";
    const emotionLabel = emotionOptions.value.find(o => o.key === selectedEmotion.value)?.label || "";
    const sceneLabel = sceneOptions.value.find(o => o.key === selectedScene.value)?.label || "";
    prompt.value = t("music.generatePromptTemplate", { style: styleLabel, emotion: emotionLabel, scene: sceneLabel });
  }

  const promptText = prompt.value.trim();
  if (!promptText) {
    ElMessage.warning("请先输入音乐风格或意境描述");
    return;
  }

  try {
    songGenerating.value = true;
    songGenerateHint.value = "正在提交生成任务...";

    const result = await creatSongTask(
      {
        title: songTitle.value.trim() || undefined,
        lyricsContent: lyrics.value.trim() || undefined,
        promptText,
        styleTag: selectedStyle.value,
        emotionTag: selectedEmotion.value,
        scenarioTag: selectedScene.value,
      },
      {
        onChunk: (payload) => {
          const nextTip = resolveSongTaskTip(payload);
          if (nextTip) {
            songGenerateHint.value = nextTip;
          }
        },
      },
    );

    const taskPayload = resolveSongTaskPayload(result);
    const taskId = String(taskPayload.taskId ?? "").trim();
    const songId = String(taskPayload.songId ?? "").trim();
    const taskStatus = String(
      taskPayload.taskStatus ??
      taskPayload.status ??
      "",
    ).trim();
    latestSongTaskId.value = taskId;

    const submitTip =
      resolveSongTaskTip(result) ||
      resolveSongTaskTip(taskPayload) ||
      "歌曲生成任务已提交";
    songGenerateHint.value = submitTip;

    if (taskId) {
      await pollSongTaskUntilFinished(taskId, songId);
      ElMessage.success("歌曲生成完成");
      return;
    }

    if (isSongTaskCompleted(taskStatus)) {
      await loadSongWorks();
      if (songId) {
        await navigateTo({
          path: "/system/opt/music/player",
          query: {
            songId,
          },
        });
      }
      ElMessage.success("歌曲生成完成");
      return;
    }

    if (isSongTaskFailed(taskStatus)) {
      throw new Error(
        String(taskPayload.errorMessage ?? submitTip ?? "歌曲生成失败").trim(),
      );
    }

    ElMessage.success(submitTip);
  } catch (error) {
    console.error("创建歌曲任务失败:", error);
    songGenerateHint.value = t("music.generateHint");
    ElMessage.error(error instanceof Error && error.message ? error.message : "创建歌曲任务失败");
  } finally {
    songGenerating.value = false;
  }
};

const openWorksModal = () => {
  showWorksModal.value = true;
};

const closeWorksModal = () => {
  showWorksModal.value = false;
};

const openPlayer = async (work: MusicWorkItem) => {
  try {
    const detail = work.songId ? await getSongDetail(work.songId) : null;
    const record = detail && typeof detail === "object"
      ? detail as Record<string, unknown>
      : null;

    await navigateTo({
      path: "/system/opt/music/player",
      query: {
        songId: work.songId || "",
        title: String(record?.title ?? record?.songTitle ?? work.title ?? "").trim(),
        badge: String(record?.taskStatus ?? record?.status ?? work.badge ?? "").trim(),
        style: String(record?.styleTag ?? record?.style ?? work.style ?? "").trim(),
        date: String(record?.createTime ?? record?.createdAt ?? work.date ?? "").trim(),
        accent: work.accent,
        cover: String(record?.coverUrl ?? record?.cover ?? work.cover ?? "").trim(),
      },
    });
  } catch (error) {
    console.error("加载歌曲详情失败:", error);
    ElMessage.error("加载歌曲详情失败");
    return;
  }

};

const handleMusicPageKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showWorksModal.value) {
    closeWorksModal();
  }
};

onMounted(() => {
  if (typeof window === "undefined") return;
  syncMusicLayoutWidth();
  void loadSongOptions();
  void loadSongWorks();
  window.addEventListener("resize", syncMusicLayoutWidth);
  window.addEventListener("keydown", handleMusicPageKeydown);
  window.visualViewport?.addEventListener("resize", syncMusicLayoutWidth);
  if (window.ResizeObserver && musicPageRef.value) {
    musicPageResizeObserver = new window.ResizeObserver(() => {
      syncMusicLayoutWidth();
    });
    musicPageResizeObserver.observe(musicPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("resize", syncMusicLayoutWidth);
  window.removeEventListener("keydown", handleMusicPageKeydown);
  window.visualViewport?.removeEventListener("resize", syncMusicLayoutWidth);
  musicPageResizeObserver?.disconnect();
  musicPageResizeObserver = null;
});
</script>

<style scoped>
@font-face {
  font-family: "Material Symbols Outlined Full";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("/fonts/material-symbols-outlined-full.ttf") format("truetype");
}

.material-symbols-outlined {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  overflow: hidden;
  font-family: "Material Symbols Outlined Full";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}

.music-page {
  min-height: 100%;
  overflow-x: auto;
  color: #2d3337;
  background:
    radial-gradient(circle at 88% 8%, rgba(165, 193, 255, 0.26), transparent 20%),
    #f7f9fb;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.music-shell {
  width: min(100%, var(--music-shell-width));
  min-width: 1280px;
  margin: 0 auto;
  padding: 22px 34px 42px;
  box-sizing: border-box;
}

.music-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #97a3b8;
  font-size: 13px;
  font-weight: 500;
}

.music-breadcrumb__link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #005bc2;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.music-breadcrumb__link:hover,
.music-breadcrumb__current {
  color: #2d3337;
}

.music-breadcrumb__separator {
  color: #b5bfd0;
}

.music-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.music-hero {
  display: block;
}

.music-hero__content {
  max-width: 840px;
}

.music-kicker {
  display: block;
  margin-bottom: 8px;
  color: #a53173;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.music-hero h1 {
  margin: 0;
  color: #2d3337;
  font-size: clamp(34px, 2.5vw, 48px);
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: -0.06em;
}

.music-hero p {
  max-width: 900px;
  margin: 10px 0 0;
  color: #596063;
  font-size: 14px;
  line-height: 1.75;
}

.music-works {
  margin-top: 2px;
}

.music-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 16px;
}

.music-section-head > div {
  display: flex;
  align-items: center;
  gap: 12px;
}

.music-section-head__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #eef2f6;
  color: #7b8794;
  font-size: 18px;
}

.music-section-head h2 {
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.music-view-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 0;
  background: transparent;
  color: #005bc2;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.music-view-all .material-symbols-outlined {
  font-size: 19px;
}

.music-work-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}

.music-work-card {
  overflow: hidden;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
  padding: 10px 10px 12px;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease;
}

.music-work-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.music-work-card__cover {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 12px;
  background: #eff3f7;
}

.music-work-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.music-work-card__cover > span {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--work-accent);
  font-size: 10px;
  font-weight: 900;
}

.music-work-card__play {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: rgba(0, 0, 0, 0.26);
  color: #005bc2;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.22s ease;
}

.music-work-card:hover .music-work-card__play {
  opacity: 1;
}

.music-work-card__play .material-symbols-outlined {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #ffffff;
  font-size: 32px;
}

.music-work-card h3 {
  margin: 10px 0 3px;
  color: #2d3337;
  font-size: 14px;
  font-weight: 900;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.music-work-card p {
  margin: 0;
  color: #7c868b;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.music-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(6px);
}

.music-modal__panel {
  width: min(100%, 1040px);
  max-height: min(88vh, 820px);
  overflow: auto;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 26px 64px rgba(15, 23, 42, 0.16);
  padding: 18px 24px 20px;
}

.music-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.music-modal__title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.music-modal__title-wrap i {
  width: 5px;
  height: 24px;
  border-radius: 999px;
  background: #005bc2;
}

.music-modal__title-wrap h2 {
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  font-weight: 900;
}

.music-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: #eef2f6;
  color: #7b8794;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.music-modal__close:hover {
  background: #dfe7f0;
  color: #2d3337;
}

.music-modal__close .material-symbols-outlined {
  font-size: 18px;
}

.music-modal__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px 16px;
}

.music-modal-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
}

.music-modal-card__cover {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 18px;
  background: #eef2f6;
  transform: translateZ(0);
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease;
}

.music-modal-card__cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition:
    transform 0.45s ease,
    filter 0.45s ease;
}

.music-modal-card__cover::after {
  content: "";
  position: absolute;
  inset: -18% auto -18% -42%;
  width: 34%;
  background: linear-gradient(
    115deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.12) 35%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 255, 255, 0.12) 65%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-185%) skewX(-24deg);
  opacity: 0;
  pointer-events: none;
}

.music-modal-card__cover span {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.74);
  color: #ffffff;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.music-modal-card h3 {
  margin: 0;
  color: #2d3337;
  font-size: 13px;
  font-weight: 900;
  text-align: center;
  line-height: 1.4;
}

.music-modal-card p {
  margin: 0;
  color: #9aa3af;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
}

.music-modal-card:hover .music-modal-card__cover {
  transform: translateY(-4px);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.16);
}

.music-modal-card:hover .music-modal-card__cover img {
  transform: scale(1.04);
  filter: saturate(1.04);
}

.music-modal-card:hover .music-modal-card__cover::after {
  opacity: 1;
  animation: music-modal-sheen 0.9s ease;
}

.music-modal__footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.music-modal__confirm {
  min-width: 110px;
  height: 40px;
  padding: 0 24px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #005bc2 0%, #004fad 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(0, 91, 194, 0.2);
}

@keyframes music-modal-sheen {
  0% {
    transform: translateX(-185%) skewX(-24deg);
  }

  100% {
    transform: translateX(405%) skewX(-24deg);
  }
}

@media (max-width: 1500px) {
  .music-shell {
    padding: 20px 24px 34px;
  }

}

@media (max-width: 1280px) {
  .music-shell {
    padding-left: 24px;
    padding-right: 24px;
  }

  .music-hero h1 {
    font-size: 40px;
  }

  .music-work-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .music-modal__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

}
</style>
