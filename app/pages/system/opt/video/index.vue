<template>
  <div ref="videoPageRef" class="video-page" :style="pageAdaptiveStyle">
    <div class="video-shell">
      <nav class="video-breadcrumb" aria-label="面包屑">
        <button type="button" class="video-breadcrumb__link" @click="handleBackToAiCenter">
          AI 实践中心
        </button>
        <span class="video-breadcrumb__separator">/</span>
        <span class="video-breadcrumb__current">AI 视频创作</span>
      </nav>

      <main class="video-main">
        <section class="video-hero">
          <div class="video-hero__backdrop"></div>
          <div class="video-hero__content">
            <span class="video-hero__kicker">NEXT-GEN VIDEO AI</span>
            <h1>AI视频创作</h1>
            <p>释放想象力，让文字与图片跃然屏上。适用顶尖深度学习算法，开启下一代数字叙事革命。</p>
          </div>
        </section>

        <section class="video-workbench">
          <div class="video-workbench__left">
            <article class="video-card video-card--prompt">
              <div class="video-card__title">输入视频提示词</div>
              <textarea
                v-model="videoPrompt"
                class="video-prompt-textarea"
                placeholder="描述你想要生成的视频场景，例如：在一个充满霓虹灯的未来城市中，一辆飞行的汽车穿梭在雨夜中，细节写实，电影级光效..."
              ></textarea>

              <div class="video-card__footer">
                <span>{{ promptLength }}/500 字符</span>
                <button type="button" class="video-optimize-link" @click="handleOptimizePrompt">
                  <span class="material-symbols-outlined">auto_fix_high</span>
                  优化提示词
                </button>
              </div>
            </article>

            <article class="video-card video-card--params">
              <div class="video-params-grid">
                <section class="video-param-group">
                  <div class="video-param-group__title">尺寸比例</div>
                  <div class="video-ratio-grid">
                    <button
                      v-for="item in ratioOptions"
                      :key="item"
                      type="button"
                      class="video-ratio-chip"
                      :class="{ 'is-active': selectedRatio === item }"
                      @click="selectedRatio = item"
                    >
                      {{ item }}
                    </button>
                  </div>
                </section>

                <section class="video-param-group">
                  <div class="video-param-group__title">视频时长</div>
                  <div class="video-duration-list">
                    <button
                      v-for="item in durationOptions"
                      :key="item.value"
                      type="button"
                      class="video-duration-row"
                      :class="{ 'is-active': selectedDuration === item.value }"
                      @click="selectedDuration = item.value"
                    >
                      <span class="video-duration-row__dot"></span>
                      <strong>{{ item.label }}</strong>
                      <span>{{ item.desc }}</span>
                    </button>
                  </div>
                </section>
              </div>
            </article>
          </div>

          <div class="video-workbench__right">
            <article class="video-card video-card--preview">
              <div class="video-preview">
                <template v-if="showPreviewContent">
                  <img :src="previewCover" alt="视频预览" />
                  <button type="button" class="video-preview__play" @click="handlePreviewPlay">
                    <span class="material-symbols-outlined">play_arrow</span>
                  </button>
                  <span class="video-preview__duration">{{ selectedDuration }}</span>
                </template>
                <template v-else>
                  <div class="video-preview__placeholder">
                    <span class="material-symbols-outlined">video_library</span>
                    <p>生成的视频将在这里预览</p>
                  </div>
                </template>
              </div>
            </article>

            <button type="button" class="video-generate-btn" @click="handleGenerateVideo">
              <span class="material-symbols-outlined">play_circle</span>
              开始生成视频
            </button>
          </div>
        </section>

        <section class="video-works">
          <div class="video-section-head">
            <div>
              <span class="video-section-head__icon material-symbols-outlined">video_library</span>
              <h2>我的视频作品</h2>
            </div>
          </div>

          <div class="video-work-grid">
            <article
              v-for="work in videoWorks"
              :key="work.title"
              class="video-work-card"
              @click="openPreview(work)"
            >
              <div class="video-work-card__cover">
                <img :src="work.cover" :alt="work.title" />
                <span>{{ work.badge }}</span>
                <button
                  type="button"
                  class="video-work-card__play"
                  aria-label="播放作品"
                  @click.stop="openPreview(work)"
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
      <div v-if="showVideoDetailModal" class="video-modal" @click="closeVideoDetailModal">
        <section
          class="video-modal__panel video-modal__panel--detail"
          role="dialog"
          aria-modal="true"
          aria-label="查看视频"
          @click.stop
        >
          <button
            type="button"
            class="video-modal__close video-modal__close--detail"
            aria-label="关闭"
            @click="closeVideoDetailModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>

          <div v-if="activeVideoWork" class="video-detail-layout">
            <div class="video-detail-player">
              <img :src="activeVideoWork.cover" :alt="activeVideoWork.title" />

              <div class="video-detail-player__controls">
                <div class="video-detail-player__progress">
                  <div class="video-detail-player__progress-bar"></div>
                </div>
                <div class="video-detail-player__control-row">
                  <div class="video-detail-player__control-left">
                    <button type="button">
                      <span class="material-symbols-outlined">play_arrow</span>
                    </button>
                    <button type="button">
                      <span class="material-symbols-outlined">volume_up</span>
                    </button>
                    <span>{{ activeVideoWork.duration }}</span>
                  </div>
                  <button type="button">
                    <span class="material-symbols-outlined">fullscreen</span>
                  </button>
                </div>
              </div>

              <div class="video-detail-player__play-wrap">
                <button type="button" class="video-detail-player__play-btn" @click="handlePreviewPlay">
                  <span class="material-symbols-outlined">play_arrow</span>
                </button>
              </div>
            </div>

            <aside class="video-detail-side">
              <div class="video-detail-side__content">
                <section class="video-detail-side__section">
                  <div class="video-detail-side__label">
                    <span class="material-symbols-outlined">auto_awesome</span>
                    <span>作品详情</span>
                  </div>
                  <div class="video-detail-side__prompt">
                    <p>{{ activeVideoWork.prompt }}</p>
                  </div>
                </section>

                <section class="video-detail-side__meta">
                  <div class="video-detail-side__label">
                    <span class="material-symbols-outlined">schedule</span>
                    <span>生成时间 (Generated at)</span>
                  </div>
                  <p>{{ activeVideoWork.date }} 14:30</p>
                </section>
              </div>

              <div class="video-detail-side__footer">
                <button type="button" class="video-detail-download-btn" @click="handleDownloadVideo">
                  <span class="material-symbols-outlined">download</span>
                  <span>下载视频 (Download Video)</span>
                </button>
                <p>{{ `MP4 • ${activeVideoWork.fileSize} • ${activeVideoWork.resolution}` }}</p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "AI视频创作",
  htmlAttrs: {
    lang: "zh-CN",
  },
  bodyAttrs: {
    class: "video-creator-route",
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

interface VideoWorkItem {
  title: string;
  badge: string;
  date: string;
  cover: string;
  prompt: string;
  duration: string;
  fileSize: string;
  resolution: string;
}

interface DurationOption {
  value: string;
  label: string;
  desc: string;
}

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAWgncHxHN7_aFkrYtGPXnuQzk45tfoZmGB3AmCB-0COj-uNUhm76YGlz_SBogpLnfemuidcaj7tsGvI-3btJa4LK0YJKYWPasf5-UHLRLnCzzxaYIFVEjPaIH3jdXIQj53mZhdbdI0sEkuqy4cUWerimlG_525x6ABNbDPg-CkxD5wa03tlkXelEW3imS8qUbj5VklfcHH-Lse9YQu_lJxg7G1RvMpEp1-V6cOp37UqLAky2UCzIllkKtarc1h88gRFBhhw9BOmns";
const VIDEO_WORK_COVER_1 =
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80";
const VIDEO_WORK_COVER_2 =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";
const VIDEO_WORK_COVER_3 =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80";
const VIDEO_WORK_COVER_4 =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

const router = useRouter();
const videoPageRef = ref<HTMLElement | null>(null);
let videoResizeObserver: ResizeObserver | null = null;
const videoLayoutWidth = ref(1360);

const videoPrompt = ref(
  "在一个充满霓虹灯的未来城市中，一辆飞行的汽车穿梭在雨夜中，细节写实，电影级光效。"
);
const selectedDuration = ref("5s");
const selectedRatio = ref("16:9");
const previewCover = ref(HERO_IMAGE);
const showPreviewContent = ref(false);
const showVideoDetailModal = ref(false);
const activeVideoWork = ref<VideoWorkItem | null>(null);

const promptTags = ["赛博朋克", "未来城市", "镜头运动", "雨夜霓虹", "写实光影"];
const ratioOptions = ["16:9", "9:16", "1:1", "4:3", "3:4"];
const durationOptions: DurationOption[] = [
  { value: "5s", label: "5s", desc: "快速生成" },
  { value: "10s", label: "10s", desc: "标准质量" },
  { value: "15s", label: "15s", desc: "精细渲染" },
];

const videoWorks = ref<VideoWorkItem[]>([
  {
    title: "霓虹城市夜巡",
    badge: "已完成",
    date: "2024-05-20",
    cover: VIDEO_WORK_COVER_1,
    prompt:
      '"Cinematic 3D fluid motion graphics, ethereal silk textures flowing in a void, soft pastel gradients, primary blue accents, 8k resolution, minimalist editorial aesthetic, studio lighting, hyper-realistic physics."',
    duration: "00:04 / 00:12",
    fileSize: "12.4 MB",
    resolution: "1920x1080",
  },
  {
    title: "实验室觉醒计划",
    badge: "生成中",
    date: "2024-05-18",
    cover: VIDEO_WORK_COVER_2,
    prompt:
      '"Modern AI laboratory scene with collaborative robotics, dynamic camera movement, soft rim lighting, cinematic documentary style, high detail, educational technology showcase."',
    duration: "00:03 / 00:10",
    fileSize: "10.1 MB",
    resolution: "1920x1080",
  },
  {
    title: "未来课堂短片",
    badge: "已完成",
    date: "2024-05-15",
    cover: VIDEO_WORK_COVER_3,
    prompt:
      '"Future classroom short film, digital holographic displays, students interacting with immersive AI tools, clean modern visuals, bright daylight, professional educational promo mood."',
    duration: "00:05 / 00:15",
    fileSize: "14.7 MB",
    resolution: "1920x1080",
  },
  {
    title: "海底文明回响",
    badge: "已完成",
    date: "2024-05-12",
    cover: VIDEO_WORK_COVER_4,
    prompt:
      '"A cinematic underwater civilization with reflective architecture, drifting particles, serene motion, soft volumetric light shafts, dreamy science-fiction ocean atmosphere."',
    duration: "00:04 / 00:12",
    fileSize: "11.8 MB",
    resolution: "1920x1080",
  },
]);

const allVideoWorks = computed(() => videoWorks.value);
const promptLength = computed(() => videoPrompt.value.length);

const getVideoLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = videoPageRef.value?.clientWidth || 0;
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

const syncVideoLayoutWidth = () => {
  videoLayoutWidth.value = getVideoLayoutWidth();
};

const videoShellWidth = computed(() => {
  if (videoLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(videoLayoutWidth.value))}px`;
  }

  return `${Math.min(1920, Math.max(1280, Math.round(videoLayoutWidth.value * 0.9)))}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--video-shell-width": videoShellWidth.value,
  "--video-hero-image": `url(${HERO_IMAGE})`,
}));

const appendPromptTag = (tag: string) => {
  if (!videoPrompt.value.includes(tag)) {
    videoPrompt.value = `${videoPrompt.value.trim()}，${tag}`.replace(/^，/, "");
  }
};

const handleOptimizePrompt = () => {
  ElMessage.success("提示词已优化");
};

const handleBackToAiCenter = () => {
  router.push("/system/opt");
};

const handleGenerateVideo = () => {
  showPreviewContent.value = true;
  ElMessage.success("视频生成任务已创建");
};

const handlePreviewPlay = () => {
  ElMessage.info("预览播放功能已预留");
};

const openPreview = (work: VideoWorkItem) => {
  previewCover.value = work.cover;
  showPreviewContent.value = true;
  activeVideoWork.value = work;
  showVideoDetailModal.value = true;
};

const closeVideoDetailModal = () => {
  showVideoDetailModal.value = false;
};

const handleDownloadVideo = () => {
  if (!activeVideoWork.value) {
    ElMessage.warning("当前没有可下载的视频");
    return;
  }

  ElMessage.success(`开始下载：${activeVideoWork.value.title}`);
};

onMounted(() => {
  if (typeof window === "undefined") return;

  syncVideoLayoutWidth();
  window.addEventListener("resize", syncVideoLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncVideoLayoutWidth);

  if (window.ResizeObserver && videoPageRef.value) {
    videoResizeObserver = new window.ResizeObserver(() => {
      syncVideoLayoutWidth();
    });
    videoResizeObserver.observe(videoPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncVideoLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncVideoLayoutWidth);
  videoResizeObserver?.disconnect();
  videoResizeObserver = null;
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
  font-family: "Material Symbols Outlined Full", sans-serif;
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  font-feature-settings: "liga";
}

.video-page {
  --video-min-width: 1280px;
  --video-max-width: 1920px;
  --video-shell-width: var(--video-min-width);
  --video-hero-image: none;
  min-height: 100vh;
  min-width: var(--video-min-width);
  overflow-x: auto;
  overflow-y: visible;
  background:
    radial-gradient(circle at top right, rgba(75, 142, 255, 0.12), transparent 22%),
    linear-gradient(180deg, #f6f9fd 0%, #f9fbfe 100%);
  color: #12304f;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.video-shell {
  width: min(
    var(--video-max-width),
    max(var(--video-min-width), var(--video-shell-width))
  );
  min-width: var(--video-min-width);
  margin: 0 auto;
  padding: 26px 32px 56px;
  box-sizing: border-box;
}

.video-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7b8ca3;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.video-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #60748f;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.video-breadcrumb__separator {
  color: #a5b4c7;
}

.video-breadcrumb__current {
  color: #2563eb;
}

.video-main {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.video-hero {
  position: relative;
  overflow: hidden;
  min-height: 208px;
  border-radius: 30px;
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.12);
}

.video-hero__backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.74) 0%, rgba(8, 20, 38, 0.58) 28%, rgba(14, 31, 69, 0.38) 52%, rgba(17, 24, 39, 0.08) 100%),
    var(--video-hero-image);
  background-size: cover;
  background-position: center;
  transform: scale(1.01);
}

.video-hero__content {
  position: relative;
  z-index: 1;
  max-width: 430px;
  padding: 56px 34px 34px 34px;
  color: #ffffff;
}

.video-hero__kicker {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(15, 95, 189, 0.26);
  border: 1px solid rgba(91, 156, 255, 0.34);
  color: #7dc0ff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.video-hero__content h1 {
  margin: 18px 0 12px;
  font-size: 42px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.video-hero__content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
  line-height: 1.9;
  font-weight: 600;
}

.video-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 560px;
  gap: 22px;
  align-items: start;
}

.video-workbench__left,
.video-workbench__right {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-card {
  border: 1px solid rgba(210, 220, 232, 0.68);
  border-radius: 26px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
}

.video-card--prompt {
  padding: 18px 18px 14px;
}

.video-card__title,
.video-param-group__title {
  color: #1f3653;
  font-size: 14px;
  font-weight: 800;
}

.video-prompt-textarea {
  width: 100%;
  min-height: 200px;
  margin-top: 12px;
  border: none;
  border-radius: 0;
  background: #eef3f8;
  padding: 16px 14px;
  color: #16365c;
  font-size: 13px;
  line-height: 1.8;
  font-family: inherit;
  resize: none;
  box-sizing: border-box;
  outline: none;
}

.video-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
  color: #8b97a8;
  font-size: 12px;
  font-weight: 600;
}

.video-optimize-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: #0a6bda;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}

.video-card--params {
  padding: 16px 18px 14px;
}

.video-params-grid {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 14px;
}

.video-param-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-ratio-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.video-ratio-chip {
  min-height: 28px;
  border: none;
  background: #eff3f7;
  color: #59728f;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.video-ratio-chip.is-active {
  background: #9dbefc;
  color: #ffffff;
}

.video-duration-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-duration-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  border: none;
  background: #eff3f7;
  padding: 0 10px;
  color: #1f3653;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
}

.video-duration-row strong {
  font-size: 11px;
}

.video-duration-row span:last-child {
  color: #5f7390;
  font-weight: 600;
}

.video-duration-row__dot {
  display: none;
}

.video-duration-row.is-active {
  background: #9dbefc;
  color: #ffffff;
}

.video-duration-row.is-active strong,
.video-duration-row.is-active span:last-child {
  color: #ffffff;
}

.video-card--preview {
  padding: 16px;
}

.video-preview {
  position: relative;
  min-height: 360px;
  border-radius: 26px;
  background: #e7edf3;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.video-preview__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #a9b4c2;
}

.video-preview__placeholder .material-symbols-outlined {
  font-size: 50px;
}

.video-preview__placeholder p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}

.video-preview__play {
  position: absolute;
  width: 86px;
  height: 86px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #0a6bda;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(10, 107, 218, 0.22);
}

.video-preview__duration {
  position: absolute;
  right: 18px;
  bottom: 18px;
  color: #ffffff;
  font-size: 28px;
  font-weight: 900;
}

.video-generate-btn {
  min-height: 44px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #0f5fbd 0%, #0a6bda 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 16px 28px rgba(15, 95, 189, 0.2);
  cursor: pointer;
}

.video-works {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.05);
  padding: 28px;
}

.video-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.video-section-head > div {
  display: flex;
  align-items: center;
  gap: 10px;
}

.video-section-head__icon {
  color: #0a6bda;
  font-size: 24px;
}

.video-section-head h2 {
  margin: 0;
  color: #1b2f4a;
  font-size: 24px;
  font-weight: 800;
}

.video-work-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px 18px;
}

.video-work-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
}

.video-work-card__cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 11;
  border-radius: 22px;
  background: #edf2f7;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.video-work-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.55s ease;
}

.video-work-card__cover span {
  position: absolute;
  left: 12px;
  top: 12px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.66);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
}

.video-work-card__play {
  position: absolute;
  right: 14px;
  bottom: 14px;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: #0a6bda;
  cursor: pointer;
}

.video-work-card:hover .video-work-card__cover {
  transform: translateY(-4px);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.14);
}

.video-work-card:hover .video-work-card__cover img {
  transform: scale(1.05);
}

.video-work-card h3 {
  margin: 0;
  color: #2d3337;
  font-size: 14px;
  font-weight: 800;
}

.video-work-card p {
  margin: 0;
  color: #8b97a8;
  font-size: 12px;
  font-weight: 700;
}

.video-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.24);
  backdrop-filter: blur(8px);
}

.video-modal__panel {
  width: min(100%, 1100px);
  max-height: min(88vh, 860px);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 40px 100px rgba(0, 91, 194, 0.08);
  overflow: hidden;
  position: relative;
}

.video-modal__close {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #596063;
  cursor: pointer;
}

.video-modal__panel--detail {
  display: flex;
  max-width: 1100px;
  max-height: min(88vh, 860px);
}

.video-modal__close--detail {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
}

.video-detail-layout {
  display: flex;
  width: 100%;
  min-height: 0;
  height: min(88vh, 860px);
}

.video-detail-player {
  position: relative;
  flex: 1;
  background: #0b0f10;
  overflow: hidden;
  min-height: 0;
}

.video-detail-player img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0.9;
}

.video-detail-player__controls {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
}

.video-detail-player__progress {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  overflow: hidden;
  margin-bottom: 16px;
}

.video-detail-player__progress-bar {
  width: 33%;
  height: 100%;
  background: #005bc4;
}

.video-detail-player__control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
}

.video-detail-player__control-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.video-detail-player__control-left button,
.video-detail-player__control-row > button {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.video-detail-player__control-left span:last-child {
  font-size: 14px;
  font-weight: 600;
}

.video-detail-player__play-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-detail-player__play-btn {
  width: 80px;
  height: 80px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.24);
}

.video-detail-player__play-btn .material-symbols-outlined {
  font-size: 40px;
  font-variation-settings: "FILL" 1;
}

.video-detail-side {
  width: 400px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
  overflow-y: auto;
  min-height: 0;
}

.video-detail-side__content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.video-detail-side__section,
.video-detail-side__meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.video-detail-side__label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #000000;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.video-detail-side__prompt {
  border: 1px solid rgba(172, 179, 183, 0.15);
  border-radius: 16px;
  background: #f1f4f6;
  padding: 20px;
}

.video-detail-side__prompt p {
  margin: 0;
  color: #000000;
  font-size: 16px;
  line-height: 1.8;
  font-style: italic;
}

.video-detail-side__meta p {
  margin: 0;
  color: #000000;
  font-size: 14px;
  font-weight: 600;
}

.video-detail-side__footer {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #eaeef1;
}

.video-detail-download-btn {
  width: 100%;
  min-height: 56px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #005bc4 0%, #004fad 100%);
  color: #f9f8ff;
  font-size: 16px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 18px 34px rgba(0, 91, 194, 0.2);
  cursor: pointer;
}

.video-detail-side__footer p {
  margin: 16px 0 0;
  color: #596063;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 1500px) {
  .video-workbench {
    grid-template-columns: minmax(0, 1fr) 500px;
  }

  .video-work-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .video-modal__panel--detail {
    max-width: 980px;
    max-height: min(84vh, 760px);
  }

  .video-detail-side {
    width: 340px;
    padding: 22px;
  }

  .video-detail-layout {
    height: min(84vh, 760px);
  }

  .video-detail-player__controls {
    padding: 18px;
  }

  .video-detail-player__play-btn {
    width: 68px;
    height: 68px;
  }

  .video-detail-side__content {
    gap: 22px;
  }

  .video-detail-side__prompt {
    padding: 16px;
  }

  .video-detail-side__prompt p {
    font-size: 14px;
  }

  .video-detail-download-btn {
    min-height: 50px;
    font-size: 14px;
  }
}

@media (max-width: 1300px) {
  .video-shell {
    padding: 24px 24px 44px;
  }

  .video-hero__content h1 {
    font-size: 36px;
  }

  .video-workbench {
    grid-template-columns: minmax(0, 1fr);
  }

  .video-work-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .video-modal__panel--detail {
    flex-direction: column;
    max-height: min(88vh, 760px);
  }

  .video-detail-player {
    min-height: 260px;
  }

  .video-detail-side {
    width: 100%;
    padding: 18px 18px 22px;
  }

  .video-detail-layout {
    height: min(88vh, 760px);
  }
}
</style>
