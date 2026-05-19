<template>
  <div ref="playerPageRef" class="music-player-page" :style="pageAdaptiveStyle">
    <div class="music-player-shell">
      <main class="music-player-canvas">
        <div class="music-player-bg">
          <div class="music-player-bg__gradient"></div>
          <div
            class="music-player-bg__cover"
            :style="{ backgroundImage: `url(${resolvedCurrentWork.cover})` }"
          ></div>
        </div>

        <header class="music-player-header">
          <div class="music-player-header__left">
            <button
              type="button"
              class="music-player-back"
              :aria-label="t('music.back')"
              @click="handleBack"
            >
              <span class="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <div class="music-player-header__title">
              <h2>{{ resolvedCurrentWork.title }}</h2>
            </div>
          </div>
        </header>

        <section class="music-player-main">
          <div class="music-player-main__disc-side">
            <div class="music-player-vinyl-group">
              <div class="music-player-vinyl-group__glow"></div>

              <div class="music-player-vinyl" :class="{ 'is-spinning': isPlaying }">
                <div class="music-player-vinyl__ring music-player-vinyl__ring--outer"></div>
                <div class="music-player-vinyl__ring music-player-vinyl__ring--middle"></div>
                <div class="music-player-vinyl__ring music-player-vinyl__ring--inner"></div>

                <div class="music-player-vinyl__cover">
                  <img :src="resolvedCurrentWork.cover" :alt="resolvedCurrentWork.title" />
                </div>

                <div class="music-player-vinyl__core"></div>
              </div>

              <div class="music-player-tonearm">
                <div class="music-player-tonearm__bar"></div>
                <div class="music-player-tonearm__head"></div>
              </div>
            </div>

            <div class="music-player-meta">
              <h3>{{ resolvedCurrentWork.title }}</h3>
            </div>
          </div>

          <aside class="music-player-lyrics glass-panel">
            <div class="music-player-lyrics__viewport lyrics-mask">
              <div class="music-player-lyrics__scroll">
              <p
                v-for="(line, index) in lyricLines"
                :key="`${index}-${line}`"
                :class="getLyricClass(index)"
              >
                {{ line }}
              </p>
              </div>
            </div>
          </aside>
        </section>

        <footer class="music-player-footer glass-panel">
          <div class="music-player-footer__info">
            <img :src="resolvedCurrentWork.cover" :alt="resolvedCurrentWork.title" />
            <div class="music-player-footer__info-text">
              <h4>{{ resolvedCurrentWork.title }}</h4>
            </div>
          </div>

          <div class="music-player-footer__controls">
            <div class="music-player-footer__actions-row">
              <button type="button" class="music-player-icon-btn music-player-icon-btn--muted">
                <span class="material-symbols-outlined">shuffle</span>
              </button>

              <button
                type="button"
                class="music-player-icon-btn music-player-icon-btn--strong"
                @click="handlePrev"
              >
                <span class="material-symbols-outlined music-player-icon-btn__filled">
                  skip_previous
                </span>
              </button>

              <button
                type="button"
                class="music-player-play-btn"
                :aria-label="isPlaying ? t('music.pause') : t('music.play')"
                @click="togglePlay"
              >
                <span class="material-symbols-outlined music-player-icon-btn__filled">
                  {{ isPlaying ? "pause" : "play_arrow" }}
                </span>
              </button>

              <button
                type="button"
                class="music-player-icon-btn music-player-icon-btn--strong"
                @click="handleNext"
              >
                <span class="material-symbols-outlined music-player-icon-btn__filled">
                  skip_next
                </span>
              </button>

              <button type="button" class="music-player-icon-btn music-player-icon-btn--muted">
                <span class="material-symbols-outlined">repeat</span>
              </button>
            </div>

            <div class="music-player-progress">
              <span class="music-player-progress__time">{{ currentTimeLabel }}</span>

              <div class="music-player-progress__track-wrap">
                <input
                  v-model="progressValue"
                  class="music-player-progress__slider"
                  type="range"
                  min="0"
                  :max="durationSeconds"
                  step="1"
                  @input="handleSeek"
                />
              </div>

              <span class="music-player-progress__time">{{ durationLabel }}</span>
            </div>
          </div>

          <div class="music-player-footer__extra">
            <div class="music-player-volume">
              <span class="material-symbols-outlined">volume_up</span>
              <input
                v-model="volumeValue"
                class="music-player-volume__slider"
                type="range"
                min="0"
                max="100"
                step="1"
                @input="handleVolumeChange"
              />
            </div>

            <button
              type="button"
              class="music-player-icon-btn music-player-icon-btn--muted"
              @click="downloadSongFile"
            >
              <span class="material-symbols-outlined">download</span>
            </button>

            <button
              type="button"
              class="music-player-icon-btn music-player-icon-btn--muted"
              @click="handleDeleteSong"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </footer>

        <audio
          ref="audioRef"
          :src="audioSrc"
          preload="metadata"
          @timeupdate="handleAudioTimeUpdate"
          @loadedmetadata="handleAudioLoadedMetadata"
          @ended="handleAudioEnded"
        ></audio>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { aiAdmin } from "~/composables/api/ai";
import { useHttp } from "~/composables/api/useHttp";
import { ElMessage, ElMessageBox } from "element-plus";

const { t } = useI18n();
const { getSongDetail, deleteSong } = aiAdmin();

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: computed(() => t("music.aiSongPlayer")),
  htmlAttrs: {},
  bodyAttrs: {
    class: "music-player-route",
  },
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
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap",
    },
  ],
});

interface MusicPlayerWorkItem {
  songId?: string;
  ossId?: string;
  title: string;
  badge: string;
  style: string;
  date: string;
  accent: string;
  cover: string;
  audioUrl?: string;
  lyricsContent?: string;
}

const defaultWorks = computed<MusicPlayerWorkItem[]>(() => [
  {
    title: t("music.workDeepBlueEcho"),
    badge: t("music.badgeCompleted"),
    style: "POP",
    date: "2026. 05. 20",
    accent: "#005bc2",
    cover: "/images/ai-practice/practice-23-7c2c96bc.webp",
  },
  {
    title: t("music.workNightRipple"),
    badge: t("music.badgeInProgress"),
    style: "LO-FI",
    date: "2026. 05. 18",
    accent: "#2d3337",
    cover: "/images/ai-practice/practice-24-488ee045.webp",
  },
  {
    title: t("music.workMorningLines"),
    badge: t("music.badgeCompleted"),
    style: "ELECTRONIC",
    date: "2026. 05. 16",
    accent: "#0f9f6e",
    cover: "/images/ai-practice/practice-25-9df2aa4e.webp",
  },
  {
    title: t("music.workJazzCover"),
    badge: t("music.badgeDraft"),
    style: "AMBIENT",
    date: "2026. 05. 12",
    accent: "#8c5b17",
    cover: "/images/ai-practice/practice-26-48d56026.webp",
  },
]);

const route = useRoute();
const playerPageRef = ref<HTMLElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);
let playerPageResizeObserver: ResizeObserver | null = null;

const DESIGN_WIDTH = 1663;
const DESIGN_HEIGHT = 1088;
const playerLayoutWidth = ref(1360);
const playerViewportHeight = ref(900);
const isPlaying = ref(false);
const progressValue = ref(165);
const volumeValue = ref(76);
const durationSeconds = ref(252);
const currentTimeSeconds = ref(165);

const queryWork = computed<MusicPlayerWorkItem | null>(() => {
  const title = typeof route.query.title === "string" ? route.query.title : "";
  if (!title) return null;

  return {
    title,
    badge: typeof route.query.badge === "string" && route.query.badge ? route.query.badge : t("music.badgeCompleted"),
    style: typeof route.query.style === "string" && route.query.style ? route.query.style : "POP",
    date: typeof route.query.date === "string" && route.query.date ? route.query.date : "2026. 05. 20",
    accent:
      typeof route.query.accent === "string" && route.query.accent ? route.query.accent : "#005bc2",
    cover:
      typeof route.query.cover === "string" && route.query.cover
        ? route.query.cover
        : "/images/ai-practice/practice-23-7c2c96bc.webp",
  };
});

const currentWork = computed<MusicPlayerWorkItem>(() => queryWork.value || defaultWorks.value[0] || { title: "", badge: "", style: "POP", date: "", accent: "#005bc2", cover: "" });
const resolvedCurrentWork = ref<MusicPlayerWorkItem>(currentWork.value);

const audioSrc = computed(() => resolvedCurrentWork.value.audioUrl || "/asr-demo/lecture-chinese-04.wav");

const lyricLines = computed(() => {
  const lyricsContent = resolvedCurrentWork.value.lyricsContent?.trim() || "";
  if (lyricsContent) {
    const lines = lyricsContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length) {
      return lines;
    }
  }

  return [
    t("music.lyric1"),
    t("music.lyric2"),
    t("music.lyric3"),
    t("music.lyric4"),
    t("music.lyric5"),
    t("music.lyric6"),
    t("music.lyric7"),
    t("music.lyric8"),
    t("music.lyric9"),
    t("music.lyric10"),
  ];
});

const activeLyricIndex = computed(() => {
  if (!lyricLines.value.length || durationSeconds.value <= 0) {
    return 2;
  }

  const progress = currentTimeSeconds.value / durationSeconds.value;
  const index = Math.floor(progress * lyricLines.value.length);
  return Math.min(lyricLines.value.length - 1, Math.max(0, index));
});

const currentTimeLabel = computed(() => formatTime(currentTimeSeconds.value));
const durationLabel = computed(() => formatTime(durationSeconds.value));

const getPlayerLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = playerPageRef.value?.clientWidth || 0;
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

const syncPlayerLayoutWidth = () => {
  playerLayoutWidth.value = getPlayerLayoutWidth();
  if (typeof window !== "undefined") {
    playerViewportHeight.value = Math.max(720, window.innerHeight || 900);
  }
};

const playerShellWidth = computed(() => {
  if (playerLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(playerLayoutWidth.value))}px`;
  }

  return `${Math.min(1920, Math.max(1280, Math.round(playerLayoutWidth.value * 0.9)))}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--music-player-shell-width": playerShellWidth.value,
  "--music-player-scale": String(
    Math.min(
      playerLayoutWidth.value / DESIGN_WIDTH,
      (playerViewportHeight.value - 1) / DESIGN_HEIGHT,
      1
    )
  ),
  "--music-player-design-width": `${DESIGN_WIDTH}px`,
  "--music-player-design-height": `${DESIGN_HEIGHT}px`,
  "--music-player-accent": resolvedCurrentWork.value.accent,
  "--music-player-progress-percent": `${Math.max(
    0,
    Math.min(
      100,
      durationSeconds.value > 0 ? (currentTimeSeconds.value / durationSeconds.value) * 100 : 0
    )
  )}%`,
  "--music-player-volume-percent": `${Math.max(0, Math.min(100, volumeValue.value))}%`,
  "--music-player-lyrics-offset": `${Math.max(0, activeLyricIndex.value - 2) * -70}px`,
}));

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remain = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

function getLyricClass(index: number) {
  if (index === activeLyricIndex.value) {
    return "is-active is-primary";
  }

  if (index === activeLyricIndex.value + 1) {
    return "is-strong";
  }

  return "is-muted";
}

const handleBack = async () => {
  await navigateTo("/system/opt/music");
};

const downloadSongFile = async () => {
  const ossId = resolvedCurrentWork.value.ossId;
  if (!ossId) {
    ElMessage.warning("当前作品缺少下载文件");
    return;
  }

  try {
    const config = useRuntimeConfig();
    const token = useHttp().getToken();
    const response = await fetch(`${config.public.apiBaseUrl}/resource/oss/download/${ossId}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    if (!response.ok) {
      throw new Error(`下载歌曲失败(${response.status})`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fallbackName = `${resolvedCurrentWork.value.title || "song"}.mp3`;
    link.href = blobUrl;
    link.download = fallbackName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
    ElMessage.success("开始下载");
  } catch (error) {
    console.error("下载歌曲失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "下载歌曲失败");
  }
};

const handleDeleteSong = async () => {
  const songId = resolvedCurrentWork.value.songId;
  if (!songId) {
    ElMessage.warning("当前作品缺少歌曲标识");
    return;
  }

  try {
    await ElMessageBox.confirm("确认删除当前音乐作品吗？", "删除提示", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
    await deleteSong(songId);
    ElMessage.success("删除成功");
    await navigateTo("/system/opt/music");
  } catch (error) {
    if (error === "cancel") return;
    console.error("删除音乐作品失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "删除音乐作品失败");
  }
};

const loadSongDetail = async () => {
  const songId = typeof route.query.songId === "string" ? route.query.songId : "";
  if (!songId) return;

  try {
    const detail = await getSongDetail(songId);
    if (detail && typeof detail === "object") {
      const record = detail as Record<string, unknown>;
      resolvedCurrentWork.value = {
        songId,
        ossId: String(record.ossId ?? record.audioOssId ?? "").trim() || undefined,
        title: String(record.title ?? record.songTitle ?? currentWork.value.title ?? "").trim() || currentWork.value.title,
        badge: String(record.taskStatus ?? record.status ?? currentWork.value.badge ?? t("music.badgeCompleted")).trim() || currentWork.value.badge,
        style: String(record.styleTag ?? record.style ?? currentWork.value.style ?? "POP").trim() || currentWork.value.style,
        date: String(record.createTime ?? record.createdAt ?? currentWork.value.date ?? "").trim() || currentWork.value.date,
        accent: currentWork.value.accent,
        cover: String(record.coverUrl ?? record.cover ?? currentWork.value.cover ?? "").trim() || currentWork.value.cover,
        audioUrl: String(record.audioUrl ?? record.songUrl ?? record.fileUrl ?? "").trim() || currentWork.value.audioUrl,
        lyricsContent: String(record.lyricsContent ?? record.lyrics ?? "").trim() || currentWork.value.lyricsContent,
      };
    }
  } catch (error) {
    console.error("加载歌曲详情失败:", error);
  }
};

const syncAudioVolume = () => {
  if (!audioRef.value) return;
  audioRef.value.volume = volumeValue.value / 100;
};

const togglePlay = async () => {
  if (!audioRef.value) {
    isPlaying.value = !isPlaying.value;
    return;
  }

  if (isPlaying.value) {
    audioRef.value.pause();
    isPlaying.value = false;
    return;
  }

  syncAudioVolume();

  try {
    await audioRef.value.play();
    isPlaying.value = true;
  } catch {
    isPlaying.value = false;
  }
};

const handlePrev = () => {
  if (!audioRef.value) return;
  audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 15);
  currentTimeSeconds.value = audioRef.value.currentTime;
  progressValue.value = Math.round(audioRef.value.currentTime);
};

const handleNext = () => {
  if (!audioRef.value) return;
  audioRef.value.currentTime = Math.min(durationSeconds.value, audioRef.value.currentTime + 15);
  currentTimeSeconds.value = audioRef.value.currentTime;
  progressValue.value = Math.round(audioRef.value.currentTime);
};

const handleSeek = () => {
  const nextValue = Number(progressValue.value);
  currentTimeSeconds.value = nextValue;
  if (audioRef.value) {
    audioRef.value.currentTime = nextValue;
  }
};

const handleVolumeChange = () => {
  syncAudioVolume();
};

const handleAudioTimeUpdate = () => {
  if (!audioRef.value) return;
  currentTimeSeconds.value = audioRef.value.currentTime;
  progressValue.value = Math.round(audioRef.value.currentTime);
};

const handleAudioLoadedMetadata = () => {
  if (!audioRef.value) return;
  if (Number.isFinite(audioRef.value.duration) && audioRef.value.duration > 0) {
    durationSeconds.value = Math.round(audioRef.value.duration);
  }
  syncAudioVolume();
};

const handleAudioEnded = () => {
  isPlaying.value = false;
  currentTimeSeconds.value = 0;
  progressValue.value = 0;
  if (audioRef.value) {
    audioRef.value.currentTime = 0;
  }
};

watch(
  currentWork,
  (nextWork) => {
    resolvedCurrentWork.value = {
      ...nextWork,
      ossId: nextWork.ossId || resolvedCurrentWork.value.ossId,
      audioUrl: nextWork.audioUrl || resolvedCurrentWork.value.audioUrl,
      lyricsContent: nextWork.lyricsContent || resolvedCurrentWork.value.lyricsContent,
    };
  },
  { immediate: true },
);

watch(
  () => currentWork.value.title,
  () => {
    isPlaying.value = false;
    currentTimeSeconds.value = 165;
    progressValue.value = 165;
    durationSeconds.value = 252;

    if (audioRef.value) {
      audioRef.value.pause();
      audioRef.value.load();
      syncAudioVolume();
    }
  }
);

watch(
  () => route.query.songId,
  () => {
    void loadSongDetail();
  },
  { immediate: true },
);

onMounted(() => {
  if (typeof window === "undefined") return;

  syncPlayerLayoutWidth();
  window.addEventListener("resize", syncPlayerLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncPlayerLayoutWidth);

  if (window.ResizeObserver && playerPageRef.value) {
    playerPageResizeObserver = new window.ResizeObserver(() => {
      syncPlayerLayoutWidth();
    });
    playerPageResizeObserver.observe(playerPageRef.value);
  }

  syncAudioVolume();
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("resize", syncPlayerLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncPlayerLayoutWidth);
  playerPageResizeObserver?.disconnect();
  playerPageResizeObserver = null;
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

.music-player-page {
  position: relative;
  height: 100vh;
  min-height: 720px;
  overflow: hidden;
  background:
    radial-gradient(circle at 6% 2%, rgba(219, 231, 255, 0.62), transparent 30%),
    radial-gradient(circle at 92% 80%, rgba(255, 230, 241, 0.48), transparent 28%),
    linear-gradient(135deg, #f4f8ff 0%, #fbfcff 44%, #fffafc 100%);
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.music-player-shell {
  width: 100%;
  min-width: 1280px;
  height: 100%;
  min-height: 720px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
}

.music-player-canvas {
  position: relative;
  width: var(--music-player-design-width);
  height: var(--music-player-design-height);
  flex: 0 0 auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 32px 34px 28px;
  color: #2d3337;
  transform: scale(var(--music-player-scale));
  transform-origin: top center;
}

.music-player-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.music-player-bg__gradient {
  position: absolute;
  inset: 0;
  background: transparent;
}

.music-player-bg__cover {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  filter: blur(150px) saturate(0.55);
  opacity: 0.035;
  transform: scale(1.1);
}

.music-player-header,
.music-player-main,
.music-player-footer {
  position: relative;
  z-index: 1;
}

.music-player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 10px;
}

.music-player-header__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.music-player-back {
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  color: #2d3337;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(24px);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.music-player-back:hover {
  background: rgba(255, 255, 255, 0.72);
  transform: translateY(-1px);
}

.music-player-back .material-symbols-outlined {
  font-size: 18px;
}

.music-player-header__title h2 {
  margin: 0;
  color: #243040;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.music-player-main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 120px;
  padding: 10px 86px 18px 86px;
}

.music-player-main__disc-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 26px;
}

.music-player-vinyl-group {
  position: relative;
  width: 520px;
  height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.music-player-vinyl-group__glow {
  position: absolute;
  inset: 52px;
  border-radius: 50%;
  background: rgba(0, 91, 196, 0.08);
  filter: blur(56px);
  transition: background-color 0.5s ease;
}

.music-player-vinyl-group:hover .music-player-vinyl-group__glow {
  background: rgba(0, 91, 196, 0.14);
}

.music-player-vinyl {
  position: relative;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: #0f1724;
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.music-player-vinyl.is-spinning {
  animation: vinyl-spin 20s linear infinite;
}

.music-player-vinyl__ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.05);
}

.music-player-vinyl__ring--outer {
  inset: 0;
}

.music-player-vinyl__ring--middle {
  inset: 16px;
}

.music-player-vinyl__ring--inner {
  inset: 48px;
}

.music-player-vinyl__cover {
  width: 320px;
  height: 320px;
  border-radius: 50%;
  overflow: hidden;
  border: 8px solid #1f2937;
  box-shadow: inset 0 2px 12px rgba(255, 255, 255, 0.16);
}

.music-player-vinyl__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.music-player-vinyl__core {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #0f1724;
  border: 2px solid #334155;
  box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.12);
}

.music-player-tonearm {
  position: absolute;
  top: -30px;
  right: -8px;
  width: 128px;
  height: 256px;
  transform-origin: top right;
}

.music-player-tonearm__bar {
  width: 16px;
  height: 192px;
  margin: 0 auto;
  border-radius: 999px;
  background: linear-gradient(180deg, #94a3b8 0%, #475569 100%);
  transform: rotate(15deg);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
}

.music-player-tonearm__head {
  position: absolute;
  left: 4px;
  bottom: 38px;
  width: 32px;
  height: 48px;
  border-radius: 12px;
  background: #334155;
  transform: rotate(45deg);
}

.music-player-meta {
  text-align: center;
}

.music-player-meta h3 {
  margin: 0;
  color: #0f172a;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.music-player-lyrics {
  width: 450px;
  height: 550px;
  border-radius: 32px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(30, 64, 175, 0.06);
}

.lyrics-mask {
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
}

.music-player-lyrics__viewport {
  flex: 1;
  overflow: hidden;
  padding-right: 16px;
}

.music-player-lyrics__scroll {
  transform: translateY(var(--music-player-lyrics-offset));
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.music-player-lyrics__scroll p {
  margin: 0 0 32px;
  transform-origin: left center;
  transition:
    color 0.32s ease,
    opacity 0.32s ease,
    transform 0.32s ease,
    font-size 0.32s ease,
    font-weight 0.32s ease;
}

.music-player-lyrics__scroll p.is-muted {
  color: #94a3b8;
  font-size: 18px;
  font-weight: 500;
  opacity: 0.78;
  transform: scale(1);
}

.music-player-lyrics__scroll p.is-primary {
  color: #005bc4;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
  opacity: 1;
  transform: scale(1.02);
}

.music-player-lyrics__scroll p.is-strong {
  color: #0f172a;
  font-size: 20px;
  font-weight: 600;
  opacity: 0.95;
  transform: scale(1);
}

.music-player-footer {
  height: 128px;
  margin: 20px 0 0;
  padding: 0 48px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 48px;
  box-shadow: 0 22px 42px rgba(30, 64, 175, 0.08);
}

.music-player-footer__info {
  width: 256px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.music-player-footer__info img {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.14);
}

.music-player-footer__info-text h4 {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-player-footer__controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.music-player-footer__actions-row {
  display: flex;
  align-items: center;
  gap: 32px;
}

.music-player-icon-btn {
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.music-player-icon-btn:hover {
  color: #005bc4;
}

.music-player-icon-btn:active,
.music-player-play-btn:active {
  transform: scale(0.94);
}

.music-player-icon-btn .material-symbols-outlined {
  font-size: 24px;
}

.music-player-icon-btn--strong .material-symbols-outlined {
  font-size: 40px;
  color: #0f172a;
}

.music-player-icon-btn__filled {
  font-variation-settings:
    "FILL" 1,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}

.music-player-play-btn {
  width: 56px;
  height: 56px;
  border: 0;
  border-radius: 50%;
  background: #005bc4;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 14px 28px rgba(0, 91, 196, 0.22);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.music-player-play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 18px 34px rgba(0, 91, 196, 0.28);
}

.music-player-play-btn .material-symbols-outlined {
  font-size: 34px;
}

.music-player-progress {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
}

.music-player-progress__time {
  width: 40px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.music-player-progress__track-wrap {
  flex: 1;
  position: relative;
}

.music-player-progress__slider,
.music-player-volume__slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  outline: none;
  cursor: pointer;
}

.music-player-progress__slider {
  background: linear-gradient(
    90deg,
    #005bc4 0%,
    #005bc4 var(--music-player-progress-percent),
    #e2e8f0 var(--music-player-progress-percent),
    #e2e8f0 100%
  );
}

.music-player-progress__slider::-webkit-slider-thumb,
.music-player-volume__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #005bc4;
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.14);
}

.music-player-footer__extra {
  width: 256px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
}

.music-player-volume {
  display: flex;
  align-items: center;
  gap: 8px;
}

.music-player-volume .material-symbols-outlined {
  font-size: 22px;
  color: #64748b;
}

.music-player-volume__slider {
  width: 96px;
  background: linear-gradient(
    90deg,
    #475569 0%,
    #475569 var(--music-player-volume-percent),
    #e2e8f0 var(--music-player-volume-percent),
    #e2e8f0 100%
  );
}

@keyframes vinyl-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
body.music-player-route .sidebar-shell,
body.music-player-route .sidebar-shell-content {
  overflow-y: hidden;
}

body.music-player-route .sidebar-shell-main,
body.music-player-route .sidebar-shell-content {
  background:
    radial-gradient(circle at 6% 2%, rgba(219, 231, 255, 0.62), transparent 30%),
    radial-gradient(circle at 92% 80%, rgba(255, 230, 241, 0.48), transparent 28%),
    linear-gradient(135deg, #f4f8ff 0%, #fbfcff 44%, #fffafc 100%);
}
</style>
