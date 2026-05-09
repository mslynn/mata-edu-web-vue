<template>
  <div ref="musicPageRef" class="music-page" :style="pageAdaptiveStyle">
    <div class="music-shell">
      <nav class="music-breadcrumb" aria-label="面包屑">
        <button type="button" class="music-breadcrumb__link" @click="handleBackToAiCenter">
          AI 实践中心
        </button>
        <span class="music-breadcrumb__separator">/</span>
        <span class="music-breadcrumb__current">AI 歌曲创作</span>
      </nav>

      <main class="music-main">
        <section class="music-hero">
          <div class="music-hero__content">
            <span class="music-kicker">Music Generation Suite</span>
            <h1>释放你的音乐灵感</h1>
            <p>
              基于先进的神经网络技术，为您提供全方位的歌曲创作支持。无论是专业词曲作者还是初学者，
              都能在这里快速搭建一首完整作品的风格、歌词与情绪表达。
            </p>
          </div>
        </section>

        <section class="music-workspace">
          <div class="music-compose">
            <article class="music-card music-card--prompt">
              <div class="music-card__header">
                <span class="music-card__icon material-symbols-outlined">auto_fix_high</span>
                <div>
                  <h2>描述生成区</h2>
                  <p>用一句话描述音乐风格、场景或情绪，AI 会据此生成创作方向。</p>
                </div>
              </div>

              <label class="music-field">
                <span>描述你想要的音乐风格或意境</span>
                <textarea
                  v-model="prompt"
                  class="music-textarea music-textarea--large"
                  placeholder="例如：一首融合赛博朋克风格的快节奏电子乐，带有深沉贝斯和清脆合成器声，营造雨夜霓虹都市的孤独与希望..."
                ></textarea>
              </label>

              <div class="music-tags">
                <button
                  v-for="tag in promptTags"
                  :key="tag"
                  type="button"
                  class="music-tag"
                  @click="appendPromptTag(tag)"
                >
                  # {{ tag }}
                </button>
              </div>
            </article>

            <article class="music-card">
              <div class="music-card__header">
                <span class="music-card__icon music-card__icon--rose material-symbols-outlined">
                  edit_note
                </span>
                <div>
                  <h2>歌词与曲名自定义</h2>
                  <p>支持手动输入，也可以先保留空白，由 AI 根据描述自动补全。</p>
                </div>
              </div>

              <label class="music-field">
                <span>歌曲名称</span>
                <input
                  v-model="songTitle"
                  class="music-input"
                  type="text"
                  placeholder="给你的作品起个好名字"
                />
              </label>

              <div class="music-field-group">
                <div class="music-field-group__head">
                  <span>歌词内容</span>
                  <button type="button" class="music-link-button" @click="fillDemoLyrics">
                    <span class="material-symbols-outlined">bolt</span>
                    <span>AI 自动填词</span>
                  </button>
                </div>
                <textarea
                  v-model="lyrics"
                  class="music-textarea music-textarea--lyrics"
                  placeholder="输入你的歌词，或者点击右上方 AI 自动填词..."
                ></textarea>
              </div>
            </article>

            <div class="music-generate">
              <button type="button" class="music-hero__button" @click="handleGenerate">
                <span>开始生成音乐</span>
                <span class="material-symbols-outlined">play_circle</span>
              </button>
              <p>AI 将生成词曲结构草案、Demo melody 与风格建议</p>
            </div>
          </div>

          <aside class="music-params">
            <div class="music-card music-card--sticky">
              <div class="music-card__header">
                <span class="music-card__icon music-card__icon--green material-symbols-outlined">
                  tune
                </span>
                <div>
                  <h2>音乐风格参数</h2>
                  <p>选择越明确，生成结果越容易贴近预期。</p>
                </div>
              </div>

              <div class="music-param-group">
                <h3>音乐风格 <span>Music Style</span></h3>
                <div class="music-chip-list">
                  <button
                    v-for="item in styleOptions"
                    :key="item"
                    type="button"
                    class="music-chip"
                    :class="{ 'is-active': selectedStyle === item }"
                    @click="selectedStyle = item"
                  >
                    {{ item }}
                  </button>
                </div>
              </div>

              <div class="music-param-group">
                <h3>情感表达 <span>Emotional</span></h3>
                <div class="music-chip-list">
                  <button
                    v-for="item in emotionOptions"
                    :key="item"
                    type="button"
                    class="music-chip"
                    :class="{ 'is-active': selectedEmotion === item }"
                    @click="selectedEmotion = item"
                  >
                    {{ item }}
                  </button>
                </div>
              </div>

              <div class="music-param-group">
                <h3>应用场景 <span>Scenarios</span></h3>
                <div class="music-chip-list">
                  <button
                    v-for="item in sceneOptions"
                    :key="item"
                    type="button"
                    class="music-chip"
                    :class="{ 'is-active': selectedScene === item }"
                    @click="selectedScene = item"
                  >
                    {{ item }}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section class="music-works">
          <div class="music-section-head">
            <div>
              <span class="music-section-head__icon material-symbols-outlined">
                library_music
              </span>
              <h2>我的音乐作品</h2>
            </div>
            <button type="button" class="music-view-all" @click="openWorksModal">
              查看全部
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div class="music-work-grid">
            <article
              v-for="work in musicWorks"
              :key="work.title"
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
                  aria-label="播放"
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
          aria-label="我的音乐作品"
          @click.stop
        >
          <header class="music-modal__header">
            <div class="music-modal__title-wrap">
              <i></i>
              <h2>我的音乐作品</h2>
            </div>
            <button
              type="button"
              class="music-modal__close"
              aria-label="关闭"
              @click="closeWorksModal"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>

          <div class="music-modal__grid">
            <article
              v-for="work in allMusicWorks"
              :key="`modal-${work.title}`"
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
              关闭
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "AI 歌曲创作",
  htmlAttrs: {
    lang: "zh-CN",
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
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800;900&display=swap",
    },
  ],
});

const musicPageRef = ref<HTMLElement | null>(null);
let musicPageResizeObserver: ResizeObserver | null = null;
const musicLayoutWidth = ref(1360);
const showWorksModal = ref(false);

interface MusicWorkItem {
  title: string;
  badge?: string;
  style: string;
  date: string;
  accent: string;
  cover: string;
}

const prompt = ref("");
const songTitle = ref("");
const lyrics = ref("");
const selectedStyle = ref("流行 Pop");
const selectedEmotion = ref("充满活力");
const selectedScene = ref("冥想");

const promptTags = ["复古未来主义", "晨间咖啡馆", "深海潜行"];
const styleOptions = [
  "流行 Pop",
  "电子 Electronic",
  "摇滚 Rock",
  "爵士 Jazz",
  "民谣 Folk",
  "古典 Classical",
  "氛围 Ambient",
  "蓝调 Blues",
  "金属 Metal",
  "嘻哈 Hip-hop",
  "乡村 Country",
  "迪斯科 Disco",
];
const emotionOptions = [
  "开心",
  "悲伤",
  "充满活力",
  "平静",
  "放松",
  "舒缓",
  "专注",
  "积极",
  "励志",
];
const sceneOptions = ["健身", "学习", "派对", "冥想", "驾驶", "睡眠", "旅行", "瑜伽", "游戏"];

const musicWorks: MusicWorkItem[] = [
  {
    title: "深蓝回声",
    badge: "已完成",
    style: "POP",
    date: "2026. 05. 20",
    accent: "#005bc2",
    cover: "/images/ai-practice/practice-23-7c2c96bc.webp",
  },
  {
    title: "夜色涟漪",
    badge: "进行中",
    style: "LO-FI",
    date: "2026. 05. 18",
    accent: "#2d3337",
    cover: "/images/ai-practice/practice-24-488ee045.webp",
  },
  {
    title: "晨光线条",
    badge: "已完成",
    style: "ELECTRONIC",
    date: "2026. 05. 16",
    accent: "#0f9f6e",
    cover: "/images/ai-practice/practice-25-9df2aa4e.webp",
  },
  {
    title: "爵域封面",
    badge: "草稿",
    style: "AMBIENT",
    date: "2026. 05. 12",
    accent: "#8c5b17",
    cover: "/images/ai-practice/practice-26-48d56026.webp",
  },
];

const allMusicWorks: MusicWorkItem[] = [
  ...musicWorks,
  {
    title: "苍穹之光 (Ethereal Light)",
    style: "POP",
    date: "2023-11-24",
    accent: "#2563eb",
    cover: "/images/ai-practice/practice-01-eb90e4621.webp",
  },
  {
    title: "雨后慵懒的宁静",
    style: "LO-FI",
    date: "2023-11-20",
    accent: "#2f855a",
    cover: "/images/ai-practice/practice-05-f6a05d9d.webp",
  },
  {
    title: "霓虹序曲 (Neon Overture)",
    style: "ELECTRONIC",
    date: "2023-11-15",
    accent: "#a53173",
    cover: "/images/ai-practice/practice-02-2aa5c253.webp",
  },
  {
    title: "深海呼吸",
    style: "AMBIENT",
    date: "2023-11-08",
    accent: "#4b8eff",
    cover: "/images/ai-practice/practice-06-b311ccf2.webp",
  },
  {
    title: "四季：春之前",
    style: "CLASSICAL",
    date: "2023-10-29",
    accent: "#c084fc",
    cover: "/images/ai-practice/practice-21-de26116a.webp",
  },
  {
    title: "城市脉动",
    style: "CYBERPUNK",
    date: "2023-10-22",
    accent: "#0f9f6e",
    cover: "/images/ai-practice/practice-03-10ed00a3.webp",
  },
  {
    title: "远山的呼唤",
    style: "FOLK",
    date: "2023-10-15",
    accent: "#f472b6",
    cover: "/images/ai-practice/practice-22-2fa0b7b3.webp",
  },
  {
    title: "月光练习曲",
    style: "PIANO",
    date: "2023-10-05",
    accent: "#60a5fa",
    cover: "/images/ai-practice/practice-17-a5b3aeef.webp",
  },
];

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

const appendPromptTag = (tag: string) => {
  const value = prompt.value.trim();
  prompt.value = value ? `${value}，${tag}` : tag;
};

const fillDemoLyrics = () => {
  if (!songTitle.value.trim()) {
    songTitle.value = "霓虹雨夜";
  }
  lyrics.value = `雨落在城市的边界
霓虹把夜色轻轻点亮
我跟着节拍穿过人海
把孤独唱成新的方向`;
};

const handleGenerate = () => {
  if (!prompt.value.trim()) {
    prompt.value = `${selectedStyle.value}，${selectedEmotion.value}，适合${selectedScene.value}场景`;
  }
};

const openWorksModal = () => {
  showWorksModal.value = true;
};

const closeWorksModal = () => {
  showWorksModal.value = false;
};

const openPlayer = async (work: MusicWorkItem) => {
  await navigateTo({
    path: "/system/opt/music/player",
    query: {
      title: work.title,
      badge: work.badge || "",
      style: work.style,
      date: work.date,
      accent: work.accent,
      cover: work.cover,
    },
  });
};

const handleMusicPageKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showWorksModal.value) {
    closeWorksModal();
  }
};

onMounted(() => {
  if (typeof window === "undefined") return;
  syncMusicLayoutWidth();
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

.music-hero__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 12px;
  min-width: 220px;
  height: 52px;
  padding: 0 32px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #005bc2 0%, #004fad 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(0, 91, 194, 0.22);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.music-hero__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 34px rgba(0, 91, 194, 0.28);
}

.music-generate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}

.music-generate p {
  margin: 0;
  color: #97a3b8;
  font-size: 11px;
  font-weight: 600;
}

.music-workspace {
  display: grid;
  grid-template-columns: minmax(0, 2.65fr) minmax(320px, 0.92fr);
  gap: 24px;
  align-items: start;
}

.music-compose {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.music-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.045);
  padding: 24px 26px;
}

.music-card--prompt::after {
  content: "";
  position: absolute;
  top: -30px;
  right: -30px;
  width: 118px;
  height: 118px;
  border-radius: 0 0 0 72px;
  background: rgba(165, 193, 255, 0.28);
  pointer-events: none;
  transition: transform 0.45s ease;
}

.music-card--prompt:hover::after {
  transform: scale(1.08);
}

.music-card--sticky {
  position: sticky;
  top: 20px;
}

.music-card__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.music-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: #a5c1ff;
  color: #003a81;
  font-size: 24px;
}

.music-card__icon--rose {
  background: #ffd8e7;
  color: #942265;
}

.music-card__icon--green {
  background: #69f6b8;
  color: #005a3c;
}

.music-card__header h2 {
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.music-card__header p {
  margin: 4px 0 0;
  color: #697276;
  font-size: 12px;
  line-height: 1.55;
}

.music-field {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.music-field > span {
  color: #596063;
  font-size: 12px;
  font-weight: 800;
}

.music-input,
.music-textarea {
  width: 100%;
  border: 0;
  border-radius: 20px;
  background: #f1f4f6;
  color: #2d3337;
  font: inherit;
  outline: none;
  box-sizing: border-box;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.music-input {
  height: 56px;
  padding: 0 20px;
}

.music-textarea {
  min-height: 138px;
  padding: 18px 20px;
  resize: vertical;
  line-height: 1.72;
}

.music-textarea--large {
  min-height: 120px;
  font-size: 15px;
}

.music-textarea--lyrics {
  min-height: 150px;
}

.music-input:focus,
.music-textarea:focus {
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 91, 194, 0.1);
}

.music-tags,
.music-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.music-tags {
  position: relative;
  z-index: 1;
  margin-top: 16px;
}

.music-tag,
.music-chip {
  border: 0;
  border-radius: 999px;
  background: #eaeef1;
  color: #596063;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.music-tag {
  min-height: 32px;
  padding: 0 16px;
}

.music-tag:hover,
.music-chip:hover {
  transform: translateY(-1px);
  background: #dde3e7;
  color: #2d3337;
}

.music-link-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #005bc2;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.music-link-button .material-symbols-outlined {
  font-size: 18px;
}

.music-field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.music-field-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.music-field-group__head > span {
  color: #596063;
  font-size: 12px;
  font-weight: 800;
}

.music-param-group + .music-param-group {
  margin-top: 24px;
}

.music-param-group h3 {
  margin: 0 0 12px;
  color: #2d3337;
  font-size: 13px;
  font-weight: 900;
}

.music-param-group h3 span {
  color: #8a9499;
  font-size: 12px;
  font-weight: 700;
}

.music-chip {
  min-height: 34px;
  padding: 0 13px;
  border-radius: 12px;
}

.music-chip.is-active {
  background: #005bc2;
  color: #ffffff;
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

  .music-workspace {
    grid-template-columns: minmax(0, 2.35fr) minmax(300px, 0.92fr);
    gap: 24px;
  }

  .music-card {
    padding: 22px;
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

  .music-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .music-work-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .music-modal__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .music-card--sticky {
    position: static;
  }
}
</style>
