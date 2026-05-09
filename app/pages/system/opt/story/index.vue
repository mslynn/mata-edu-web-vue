<template>
  <div ref="storyPageRef" class="story-page" :style="pageAdaptiveStyle">
    <div class="story-shell">
      <header class="story-header">
        <div class="story-breadcrumb">
          <span>AI实践中心</span>
          <span class="material-symbols-outlined story-breadcrumb__icon">chevron_right</span>
          <span class="story-breadcrumb__current">AI故事创作</span>
        </div>
      </header>

      <main class="story-canvas">
        <section class="story-hero">
          <div class="story-hero__image"></div>
          <div class="story-hero__shade"></div>
          <div class="story-hero__content">
            <div class="story-hero__badge">
              <span class="material-symbols-outlined">auto_awesome</span>
              AI POWERED CREATIVITY
            </div>
            <h1>AI故事创作工坊</h1>
            <p>释放你的想象力，只需简单几步即可构建宏大的史诗故事或温馨的童话篇章。</p>
          </div>
        </section>

        <section class="story-workflow">
          <div class="story-workflow__header">
            <div>
              <h2>个性化你的故事</h2>
              <p>配置你的角色、场景和故事情节，为你的独特故事奠定基调。</p>
            </div>
            <div class="story-steps" aria-hidden="true">
              <span class="is-active"></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <div class="story-grid">
            <section class="story-card story-card--character">
              <div class="story-card__title-row">
                <div class="story-card__icon story-card__icon--primary">
                  <span class="material-symbols-outlined">person_pin</span>
                </div>
                <h3>设定主角</h3>
              </div>

              <div class="story-form-stack">
                <label class="story-field">
                  <span>主角姓名</span>
                  <input v-model="protagonistName" placeholder="给你的英雄取个名字..." type="text" />
                </label>

                <div class="story-field">
                  <span>选择角色类型</span>
                  <div class="role-grid">
                    <button
                      v-for="role in roles"
                      :key="role.key"
                      type="button"
                      class="role-option"
                      :class="{ 'is-selected': selectedRole === role.key }"
                      @click="selectedRole = role.key"
                    >
                      <span class="role-option__icon">
                        <span class="material-symbols-outlined">{{ role.icon }}</span>
                      </span>
                      <span class="role-option__label">{{ role.label }}</span>
                    </button>
                  </div>
                </div>

                <label class="story-field story-field--dashed">
                  <span>自定义角色身份 (可选)</span>
                  <input
                    v-model="customRole"
                    placeholder="例如：一个迷失在时间里的星际矿工..."
                    type="text"
                  />
                </label>
              </div>
            </section>

            <section class="story-card story-card--scene">
              <div class="story-card__title-row">
                <div class="story-card__icon story-card__icon--secondary">
                  <span class="material-symbols-outlined">landscape</span>
                </div>
                <h3>选择故事场景</h3>
              </div>

              <div class="scene-grid">
                <button
                  v-for="scene in scenes"
                  :key="scene.key"
                  type="button"
                  class="scene-option"
                  :class="{ 'is-selected': selectedScene === scene.key }"
                  @click="selectedScene = scene.key"
                >
                  <span
                    v-if="scene.image"
                    class="scene-option__image"
                    :style="{ backgroundImage: `url(${scene.image})` }"
                  ></span>
                  <span class="scene-option__content">
                    <span class="scene-option__top">
                      <strong>{{ scene.label }}</strong>
                      <span
                        v-if="selectedScene === scene.key"
                        class="material-symbols-outlined scene-option__check"
                      >
                        check_circle
                      </span>
                    </span>
                    <small>{{ scene.en }}</small>
                  </span>
                </button>
              </div>

              <label class="story-field story-field--scene story-field--dashed">
                <span>自定义场景描述</span>
                <textarea
                  v-model="customScene"
                  placeholder="描述一个你心中独特的场景，例如：漂浮在云端的蒸汽朋克城市..."
                ></textarea>
              </label>
            </section>

            <section class="story-card story-card--details">
              <div class="story-card__title-row">
                <div class="story-card__icon story-card__icon--tertiary">
                  <span class="material-symbols-outlined">auto_stories</span>
                </div>
                <h3>故事详情设定</h3>
              </div>

              <div class="detail-grid">
                <div class="detail-column">
                  <div class="story-field story-field--keywords">
                    <span>故事情节关键词</span>
                    <div class="tag-row">
                      <button
                        v-for="tag in storyTags"
                        :key="tag"
                        type="button"
                        class="story-tag"
                        @click="removeTag(tag)"
                      >
                        {{ tag }}
                        <span class="material-symbols-outlined">close</span>
                      </button>
                      <button type="button" class="story-tag story-tag--add" @click="addKeyword">
                        + 添加标签
                      </button>
                    </div>
                    <input
                      v-model="keyword"
                      placeholder="输入关键词并按回车..."
                      type="text"
                      @keyup.enter="addKeyword"
                    />
                  </div>

                  <button type="button" class="generate-button" @click="handleGenerate">
                    生成我的故事
                    <span class="material-symbols-outlined">bolt</span>
                  </button>
                </div>

                <label class="story-field story-field--outline">
                  <span>故事描述</span>
                  <textarea
                    v-model="storyOutline"
                    placeholder="在这里简要描述你的故事大纲或核心冲突。我们的 AI 将围绕这段文字展开创作..."
                  ></textarea>
                </label>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "AI故事创作工坊",
  htmlAttrs: {
    lang: "zh-CN",
  },
  bodyAttrs: {
    class: "story-creator-route",
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

interface StoryRole {
  key: string;
  label: string;
  icon: string;
}

interface StoryScene {
  key: string;
  label: string;
  en: string;
  image?: string;
}

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwYcturX7qIuQB2oYeWkRB56ep6tkvdJIkDy6XwB4XtYIccfsKqR8IsZjdyxYxG0IL7cDldkMQfYp_Z3SWA1uS3qKYxYnYhX4DQ2ylEYCDXz7aoc-ls5FvEIliJus5cl7uS-SrMxsKuYkQYjf4x1uNAyyojedXPsL1s0NzStaZ-EmMtbhrjEXLLS-VHGze518DZJFJ7zMGi7ilS6m5wHaNB2dTQbl2t6KnMxQUqnwbRrZe-4I3X-rh2yCR0Bv5jt4RR35uJE4yZRE";
const FOREST_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAbJzOtF5w13TZ-R-AF4jq86sMzoQlSCLNdqupcOybY2p7jdSun1QMxPygkpsxNfbS2gu5q9twbciA5yuagibVJQwVf3-V-EhvSPWQQdO4KgMhbaJ5_fBCTlRlTsF4VigJcHgYCPHAs1qLVSRybSJ-_-zfJfKxIwhAigBimHZlI6lPHJDGIDeKNCbbfxAfxmLcyjJ-9Vv92tuHa3jjYZbpMDZPzo1SixJb3kdlBLkuerTelE3wi1xITg2ZmKFpPM_dFbVXZ-A1pa5w";
const SPACE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBZbwPQmDGtRCarth996M_lO8DoQixmApJJkU-tlWbrF8FERSK49kGfAfZqm1djVtVkCgDa2Xn1yMpTjN5oPwGaCMkvWqsrZwEJEn1yVczuUxgH6-8zQCFfunFUFsMkBZtwoI8IJQttf53sTw1Fw1HcnWfPPff3VqA5eABsOCVWNkpBTvAcm5qhnZ5Ib0Xf1AajUBVaok-_pMi7uPtxQv4V-ngeOL7UWeBrg3UX-6d1ffru3HTYbNe-l63bRInwpbGQzPoOBICniTQ";

const roles: StoryRole[] = [
  { key: "hero", label: "英雄", icon: "shield" },
  { key: "princess", label: "公主", icon: "potted_plant" },
  { key: "robot", label: "机器人", icon: "smart_toy" },
  { key: "wizard", label: "魔法师", icon: "auto_fix_high" },
  { key: "custom", label: "自定义", icon: "edit_note" },
];

const scenes: StoryScene[] = [
  { key: "forest", label: "魔法森林", en: "Magic Forest", image: FOREST_IMAGE },
  { key: "space", label: "深邃太空", en: "Deep Space", image: SPACE_IMAGE },
  { key: "castle", label: "古堡秘境", en: "Mysterious Castle", image: HERO_IMAGE },
  { key: "custom", label: "自定义", en: "Custom Scene" },
];

interface StoryDraftPayload {
  protagonistName: string;
  customRole: string;
  roleKey: string;
  roleLabel: string;
  sceneKey: string;
  sceneLabel: string;
  customScene: string;
  tags: string[];
  outline: string;
  createdAt: string;
}

const STORY_DRAFT_STORAGE_KEY = "mata-story-draft";
const router = useRouter();
const storyPageRef = ref<HTMLElement | null>(null);
let storyResizeObserver: ResizeObserver | null = null;

const storyLayoutWidth = ref(1360);
const protagonistName = ref("");
const customRole = ref("");
const selectedRole = ref("hero");
const selectedScene = ref("forest");
const customScene = ref("");
const keyword = ref("");
const storyTags = ref(["勇气", "背叛", "古老预言"]);
const storyOutline = ref("");

const getStoryLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = storyPageRef.value?.clientWidth || 0;
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

const syncStoryLayoutWidth = () => {
  storyLayoutWidth.value = getStoryLayoutWidth();
};

const storyShellWidth = computed(() => {
  if (storyLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(storyLayoutWidth.value))}px`;
  }

  return `${Math.min(1920, Math.max(1280, Math.round(storyLayoutWidth.value * 0.9)))}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--story-shell-width": storyShellWidth.value,
  "--story-hero-image": `url(${HERO_IMAGE})`,
}));

const addKeyword = () => {
  const nextKeyword = keyword.value.trim();
  if (!nextKeyword) return;
  if (!storyTags.value.includes(nextKeyword)) {
    storyTags.value.push(nextKeyword);
  }
  keyword.value = "";
};

const removeTag = (targetTag: string) => {
  storyTags.value = storyTags.value.filter(tag => tag !== targetTag);
};

const handleGenerate = async () => {
  const selectedRoleOption = roles.find(role => role.key === selectedRole.value);
  const selectedSceneOption = scenes.find(scene => scene.key === selectedScene.value);
  const payload: StoryDraftPayload = {
    protagonistName: protagonistName.value.trim(),
    customRole: customRole.value.trim(),
    roleKey: selectedRole.value,
    roleLabel: selectedRoleOption?.label || "英雄",
    sceneKey: selectedScene.value,
    sceneLabel: selectedSceneOption?.label || "魔法森林",
    customScene: customScene.value.trim(),
    tags: [...storyTags.value],
    outline: storyOutline.value.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORY_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    }
    await router.push("/system/opt/story/storyreading");
  } catch (error) {
    console.error("story 保存故事草稿失败:", error);
    ElMessage.error("进入故事阅读页失败，请稍后重试");
  }
};

onMounted(() => {
  if (typeof window === "undefined") return;

  syncStoryLayoutWidth();
  window.addEventListener("resize", syncStoryLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncStoryLayoutWidth);

  if (window.ResizeObserver && storyPageRef.value) {
    storyResizeObserver = new window.ResizeObserver(() => {
      syncStoryLayoutWidth();
    });
    storyResizeObserver.observe(storyPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncStoryLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncStoryLayoutWidth);
  storyResizeObserver?.disconnect();
  storyResizeObserver = null;
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

.story-page {
  min-height: calc(100vh - 70px);
  overflow: visible;
  background: #f7f9fb;
  color: #2d3337;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.story-shell {
  width: min(100%, 1800px, var(--story-shell-width));
  min-width: 1024px;
  margin: 0 auto;
  box-sizing: border-box;
}

.story-header {
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 40px;
}

.story-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
}

.story-breadcrumb__icon {
  width: auto;
  height: auto;
  font-size: 14px;
}

.story-breadcrumb__current {
  color: #005bc2;
  font-weight: 800;
}

.story-canvas {
  padding: 0 40px 56px;
}

.story-hero {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 40px;
  background: #0f172a;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.1);
}

.story-hero__image {
  position: absolute;
  inset: 0;
  background-image: var(--story-hero-image);
  background-position: center;
  background-size: cover;
  transition: transform 0.7s ease;
}

.story-hero:hover .story-hero__image {
  transform: scale(1.05);
}

.story-hero__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 58, 129, 0.82) 0%,
    rgba(0, 58, 129, 0.44) 45%,
    rgba(0, 58, 129, 0) 100%
  );
}

.story-hero__content {
  position: relative;
  z-index: 1;
  height: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 64px;
  color: #ffffff;
}

.story-hero__badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 5px 12px;
  border-radius: 999px;
  background: #ffd8e7;
  color: #942265;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.story-hero__badge .material-symbols-outlined {
  width: auto;
  height: auto;
  font-size: 16px;
  font-variation-settings:
    "FILL" 1,
    "wght" 500,
    "GRAD" 0,
    "opsz" 16;
}

.story-hero h1 {
  margin: 0 0 16px;
  font-size: 60px;
  font-weight: 900;
  line-height: 1.06;
  letter-spacing: -0.06em;
}

.story-hero p {
  max-width: 640px;
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 20px;
  font-weight: 500;
  line-height: 1.72;
}

.story-workflow {
  margin-top: 48px;
}

.story-workflow__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
}

.story-workflow__header h2 {
  margin: 0 0 8px;
  color: #2d3337;
  font-size: 32px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.story-workflow__header p {
  max-width: 560px;
  margin: 0;
  color: #596063;
  font-size: 16px;
  line-height: 1.7;
}

.story-steps {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
}

.story-steps span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e3e9ec;
}

.story-steps span.is-active {
  background: #005bc4;
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
}

.story-card {
  border: 1px solid rgba(172, 179, 183, 0.12);
  border-radius: 32px;
  background: #ffffff;
  box-shadow: 0 12px 32px rgba(45, 51, 55, 0.045);
}

.story-card--character {
  grid-column: span 7;
  padding: 40px;
}

.story-card--scene {
  grid-column: span 5;
  display: flex;
  flex-direction: column;
  padding: 40px;
}

.story-card--details {
  grid-column: span 12;
  padding: 40px;
}

.story-card__title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.story-card__title-row h3 {
  margin: 0;
  color: #2d3337;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.story-card__icon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 14px;
}

.story-card__icon .material-symbols-outlined {
  width: auto;
  height: auto;
  font-size: 30px;
  font-variation-settings:
    "FILL" 1,
    "wght" 500,
    "GRAD" 0,
    "opsz" 30;
}

.story-card__icon--primary {
  background: rgba(0, 91, 196, 0.1);
  color: #005bc4;
}

.story-card__icon--secondary {
  background: rgba(165, 49, 115, 0.1);
  color: #a53173;
}

.story-card__icon--tertiary {
  background: rgba(0, 109, 74, 0.1);
  color: #006d4a;
}

.story-form-stack {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.story-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.story-field > span {
  color: #596063;
  font-size: 14px;
  font-weight: 800;
}

.story-field input,
.story-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 0;
  outline: none;
  border-radius: 20px;
  background: #f1f4f6;
  color: #2d3337;
  font-family: inherit;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.story-field input {
  height: 58px;
  padding: 0 24px;
  font-size: 17px;
}

.story-field textarea {
  min-height: 100px;
  resize: none;
  padding: 16px 18px;
  font-size: 14px;
  line-height: 1.7;
}

.story-field input::placeholder,
.story-field textarea::placeholder {
  color: #8f999f;
  font-weight: 500;
}

.story-field input:focus,
.story-field textarea:focus {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(165, 193, 255, 0.8);
}

.story-field--dashed input,
.story-field--dashed textarea {
  border: 2px dashed rgba(172, 179, 183, 0.32);
  background: #f1f4f6;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.role-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-height: 116px;
  padding: 16px 10px;
  border: 2px solid transparent;
  border-radius: 20px;
  background: #eaeef1;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.role-option:hover {
  border-color: rgba(165, 193, 255, 0.65);
  transform: translateY(-1px);
}

.role-option.is-selected {
  border-color: #005bc4;
  background: rgba(0, 91, 196, 0.05);
}

.role-option__icon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffffff;
  color: #596063;
  box-shadow: 0 8px 18px rgba(45, 51, 55, 0.08);
  transition: transform 0.2s ease;
}

.role-option:hover .role-option__icon {
  transform: scale(1.08);
}

.role-option.is-selected .role-option__icon,
.role-option.is-selected .role-option__label {
  color: #005bc4;
}

.role-option__icon .material-symbols-outlined {
  width: auto;
  height: auto;
  font-size: 25px;
}

.role-option__label {
  color: #596063;
  font-size: 12px;
  font-weight: 800;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.scene-option {
  position: relative;
  min-height: 96px;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 20px;
  background: #eaeef1;
  color: #2d3337;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.scene-option:hover {
  border-color: rgba(165, 193, 255, 0.65);
}

.scene-option.is-selected {
  border-color: #005bc4;
  background: rgba(0, 91, 196, 0.05);
}

.scene-option__image {
  position: absolute;
  inset: 0;
  background-position: center;
  background-size: cover;
  opacity: 0.2;
  transition: transform 0.35s ease;
}

.scene-option:hover .scene-option__image {
  transform: scale(1.1);
}

.scene-option__content {
  position: relative;
  z-index: 1;
  min-height: 96px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
}

.scene-option__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.scene-option strong {
  font-size: 14px;
  font-weight: 800;
}

.scene-option small {
  color: #596063;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.scene-option__check {
  width: auto;
  height: auto;
  color: #005bc4;
  font-size: 18px;
  font-variation-settings:
    "FILL" 1,
    "wght" 500,
    "GRAD" 0,
    "opsz" 18;
}

.story-field--scene {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(172, 179, 183, 0.2);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 40px;
}

.detail-column {
  display: flex;
  flex-direction: column;
  gap: 38px;
}

.story-field--keywords > span,
.story-field--outline > span {
  color: #2d3337;
  font-size: 18px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.story-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 91, 196, 0.1);
  color: #005bc4;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.story-tag:hover {
  background: rgba(0, 91, 196, 0.16);
  transform: translateY(-1px);
}

.story-tag .material-symbols-outlined {
  width: auto;
  height: auto;
  font-size: 13px;
}

.story-tag--add {
  border: 2px dashed rgba(0, 91, 196, 0.3);
  background: transparent;
  color: rgba(0, 91, 196, 0.62);
}

.story-tag--add:hover {
  border-color: rgba(0, 91, 196, 0.62);
  background: transparent;
  color: #005bc4;
}

.generate-button {
  width: 100%;
  height: 64px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #005bc4 0%, #004fad 100%);
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 15px 30px rgba(59, 130, 246, 0.2);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.generate-button:hover {
  transform: scale(1.015);
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.24);
}

.generate-button:active {
  transform: scale(0.97);
}

.generate-button .material-symbols-outlined {
  width: auto;
  height: auto;
  font-size: 26px;
  font-variation-settings:
    "FILL" 1,
    "wght" 500,
    "GRAD" 0,
    "opsz" 26;
}

.story-field--outline textarea {
  min-height: 220px;
  padding: 20px 24px;
  font-size: 16px;
}

@media (max-width: 1360px) {
  .story-canvas,
  .story-header {
    padding-left: 32px;
    padding-right: 32px;
  }

  .story-card--character,
  .story-card--scene,
  .story-card--details {
    padding: 34px;
  }

  .story-hero h1 {
    font-size: 54px;
  }
}

@media (max-width: 1024px) {
  .story-shell {
    min-width: 0;
  }

  .story-page {
    min-height: 100vh;
  }

  .story-header,
  .story-canvas {
    padding-left: 18px;
    padding-right: 18px;
  }

  .story-card--character,
  .story-card--scene,
  .story-card--details {
    grid-column: span 12;
  }

  .role-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .story-header {
    height: 64px;
  }

  .story-canvas {
    padding-bottom: 36px;
  }

  .story-hero {
    height: 340px;
    border-radius: 28px;
  }

  .story-hero__content {
    padding: 0 28px;
  }

  .story-hero h1 {
    font-size: 38px;
  }

  .story-hero p {
    font-size: 16px;
  }

  .story-workflow {
    margin-top: 34px;
  }

  .story-workflow__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .story-workflow__header h2 {
    font-size: 28px;
  }

  .story-card--character,
  .story-card--scene,
  .story-card--details {
    padding: 24px;
    border-radius: 26px;
  }

  .role-grid,
  .scene-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<style>
body.story-creator-route .sidebar-shell,
body.story-creator-route .sidebar-shell-body,
body.story-creator-route .sidebar-shell-main,
body.story-creator-route .sidebar-shell-content {
  background: #f7f9fb;
}
</style>
