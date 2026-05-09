<template>
  <div class="ceshi2-page">
    <aside class="platform-sidebar">
      <div class="platform-brand">
        <span class="material-symbols-rounded symbol symbol--brand symbol--filled">school</span>
        <div>
          <p class="platform-brand__title">教育平台</p>
          <p class="platform-brand__subtitle">数字馆长系统</p>
        </div>
      </div>

      <nav class="platform-nav" aria-label="平台导航">
        <a
          v-for="item in navItems"
          :key="item.label"
          :class="['platform-nav__item', { 'is-active': item.active }]"
          href="#"
        >
          <span class="material-symbols-rounded symbol" :class="{ 'symbol--filled': item.active }">
            {{ item.icon }}
          </span>
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <div class="platform-sidebar__footer">
        <div class="teacher-card">
          <img alt="教师头像" class="teacher-card__avatar" src="/stitch/ceshi2/01-teacher-avatar.png" />
          <div class="teacher-card__meta">
            <p class="teacher-card__name">王明老师</p>
            <p class="teacher-card__role">高级讲师</p>
          </div>
        </div>
      </div>
    </aside>

    <div class="platform-main">
      <header class="platform-topbar">
        <div class="platform-topbar__title">智慧教育云平台</div>

        <label class="search-box" for="platform-search">
          <span class="material-symbols-rounded symbol">search</span>
          <input
            id="platform-search"
            v-model="searchKeyword"
            autocomplete="off"
            placeholder="搜索课程、工具或资源..."
            type="text"
          />
        </label>

        <div class="platform-topbar__actions">
          <button
            v-for="item in headerActions"
            :key="item.icon"
            :aria-label="item.label"
            class="icon-button"
            type="button"
          >
            <span class="material-symbols-rounded symbol">{{ item.icon }}</span>
          </button>

          <div class="platform-profile">
            <img alt="教师个人资料" class="platform-profile__avatar" src="/stitch/ceshi2/02-teacher-profile.png" />
            <span class="platform-profile__name">王明老师</span>
          </div>
        </div>
      </header>

      <main class="platform-content">
        <section class="overview-section">
          <article class="hero-card">
            <div class="hero-card__copy">
              <h1 class="hero-card__title">欢迎回来，开启今天的智慧教学之旅</h1>
              <p class="hero-card__description">您的 AI 助教已经准备就绪，随时为您提供课程支持。</p>

              <div class="hero-card__actions">
                <button
                  v-for="item in heroActions"
                  :key="item.label"
                  :class="['hero-action', `hero-action--${item.variant}`]"
                  type="button"
                >
                  <span class="material-symbols-rounded symbol symbol--filled hero-action__icon">
                    {{ item.icon }}
                  </span>
                  <span class="hero-action__text">{{ item.label }}</span>
                </button>
              </div>
            </div>

            <div class="hero-card__visual">
              <img alt="首页主视觉插图" class="hero-card__image" src="/stitch/ceshi2/03-robot-mascot.png" />
            </div>
          </article>

          <div class="stats-grid">
            <article
              v-for="item in statCards"
              :key="item.label"
              :class="['stats-card', `stats-card--${item.tone}`]"
            >
              <div class="stats-card__icon">
                <span class="material-symbols-rounded symbol symbol--filled">{{ item.icon }}</span>
              </div>
              <p class="stats-card__label">{{ item.label }}</p>
              <p class="stats-card__value">{{ item.value }}</p>
            </article>
          </div>
        </section>

        <section class="content-section">
          <div class="section-heading">
            <div>
              <h2 class="section-heading__title">工具中心</h2>
              <p class="section-heading__subtitle">配套智能教具，激发无限创意</p>
            </div>

            <a class="section-link" href="#">
              <span>查看全部</span>
              <span class="material-symbols-rounded symbol">arrow_forward</span>
            </a>
          </div>

          <div class="tool-grid">
            <article v-for="item in toolCards" :key="item.title" class="tool-card">
              <div class="tool-card__image-wrap">
                <img :alt="item.title" class="tool-card__image" :src="item.image" />
              </div>
              <h3 class="tool-card__title">{{ item.title }}</h3>
              <p class="tool-card__description">{{ item.description }}</p>
            </article>
          </div>
        </section>

        <section class="content-section">
          <div class="section-heading">
            <div>
              <h2 class="section-heading__title">AI 实践中心</h2>
              <p class="section-heading__subtitle">通过机器学习，让机器变得更“聪明”</p>
            </div>
          </div>

          <div class="ai-grid">
            <article v-for="item in aiCards" :key="item.title" class="ai-card">
              <div class="ai-card__image-wrap">
                <img :alt="item.title" class="ai-card__image" :src="item.image" />
              </div>
              <div class="ai-card__body">
                <h3 class="ai-card__title">{{ item.title }}</h3>
                <div class="ai-card__tags">
                  <span
                    v-for="tag in item.tags"
                    :key="`${item.title}-${tag.text}`"
                    :class="['ai-tag', `ai-tag--${tag.tone}`]"
                  >
                    {{ tag.text }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="content-section">
          <div class="section-heading section-heading--history">
            <div>
              <h2 class="section-heading__title">教学历史</h2>
              <p class="section-heading__subtitle">延续您的教学进度，高效开展后续课程</p>
            </div>

            <div class="history-filters">
              <label class="history-filter">
                <select v-model="selectedGrade">
                  <option v-for="item in gradeOptions" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
                <span class="material-symbols-rounded symbol">expand_more</span>
              </label>

              <label class="history-filter">
                <select v-model="selectedCourse">
                  <option v-for="item in courseOptions" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
                <span class="material-symbols-rounded symbol">expand_more</span>
              </label>
            </div>
          </div>

          <div class="history-grid">
            <article
              v-for="item in historyCards"
              :key="item.title"
              :class="['history-card', { 'history-card--done': item.done }]"
            >
              <span :class="['history-card__status', item.done ? 'is-done' : 'is-pending']">
                {{ item.done ? "ALREADY FINISHED" : "NOT STARTED" }}
              </span>
              <h3 class="history-card__title">{{ item.title }}</h3>
              <div class="history-card__actions">
                <button class="history-card__button history-card__button--primary" type="button">去上课</button>
                <button class="history-card__button history-card__button--secondary" type="button">去备课</button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>

    <button aria-label="AI 助手" class="assistant-button" type="button">
      <span class="material-symbols-rounded symbol symbol--filled">smart_toy</span>
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

useHead({
  title: "智慧教育平台主页 - 质感课程版",
  htmlAttrs: {
    lang: "zh-CN",
  },
  meta: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
    },
  ],
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
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Manrope:wght@400;500;600;700&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,0",
    },
  ],
});

const navItems = [
  { icon: "home", label: "首页", active: true },
  { icon: "group", label: "班级管理", active: false },
  { icon: "menu_book", label: "课程中心", active: false },
  { icon: "construction", label: "工具中心", active: false },
  { icon: "psychology", label: "AI实践中心", active: false },
  { icon: "trending_up", label: "教师成长", active: false },
  { icon: "emoji_events", label: "竞赛中心", active: false },
];

const headerActions = [
  { icon: "notifications", label: "通知" },
  { icon: "help", label: "帮助" },
  { icon: "settings", label: "设置" },
];

const heroActions = [
  { icon: "play_circle", label: "去上课", variant: "primary" },
  { icon: "edit_note", label: "去备课", variant: "glass" },
  { icon: "assignment", label: "任务管理", variant: "glass" },
];

const statCards = [
  { icon: "groups", label: "班级数", value: "3", tone: "violet" },
  { icon: "history_edu", label: "授课课时", value: "4", tone: "blue" },
  { icon: "palette", label: "提交作品数", value: "0", tone: "orange" },
  { icon: "person_pin", label: "学生人数", value: "60", tone: "rose" },
];

const toolCards = [
  {
    title: "MatataCode (VinciBot)",
    description: "提供AI模型训练、图形化编程和Python文本编程，满足不同年龄段学生的认知水平和学习需求。内置AI、摄像头、乐器等趣味功能。",
    image: "/stitch/ceshi2/04-vincibot-logo.png",
  },
  {
    title: "MatataCode (Nous)",
    description: "面向更高阶的人工智能编程学习平台，深度融合图形化与Python，提供丰富的AI功能体验。支持摄像头、传感器、多感官交互编程玩法。",
    image: "/stitch/ceshi2/05-nous-logo.png",
  },
  {
    title: "MatataCode (TaleMap)",
    description: "故事地图设计平台，用户可自行创建无限的交互式地图和场景，将编程融入叙事艺术中。",
    image: "/stitch/ceshi2/06-talemap-logo.png",
  },
];

const aiCards = [
  {
    title: "图像分类训练",
    image: "/stitch/ceshi2/07-image-classification.png",
    tags: [
      { text: "计算机视觉", tone: "violet" },
      { text: "初级", tone: "violet" },
    ],
  },
  {
    title: "手势分类训练",
    image: "/stitch/ceshi2/08-gesture-classification.png",
    tags: [
      { text: "人机交互", tone: "blue" },
      { text: "中级", tone: "blue" },
    ],
  },
  {
    title: "语音分类训练",
    image: "/stitch/ceshi2/09-audio-classification.png",
    tags: [
      { text: "音频处理", tone: "orange" },
      { text: "初级", tone: "orange" },
    ],
  },
  {
    title: "姿态分类训练",
    image: "/stitch/ceshi2/10-pose-classification.png",
    tags: [
      { text: "骨架跟踪", tone: "rose" },
      { text: "高级", tone: "rose" },
    ],
  },
];

const historyCards = [
  { title: "01 课 你好，玛塔机器人", done: true },
  { title: "02 课 农场动物在哪里", done: false },
  { title: "03 课 颜色大冒险", done: false },
  { title: "04 课 森林舞会", done: false },
  { title: "05 课 形状大变身", done: false },
  { title: "06 课 数字小英雄", done: false },
  { title: "07 课 海洋探秘", done: false },
  { title: "08 课 太空之旅", done: false },
  { title: "09 课 逻辑大迷宫", done: false },
  { title: "10 课 毕业设计展", done: false },
];

const gradeOptions = ["一年级(1)班"];
const courseOptions = ["L1 基础课"];

const selectedGrade = ref(gradeOptions[0]);
const selectedCourse = ref(courseOptions[0]);
const searchKeyword = ref("");
</script>

<style scoped>
.ceshi2-page {
  --page-bg: #f7f8fb;
  --surface: #ffffff;
  --surface-soft: #f1f3f7;
  --surface-muted: #edf0f3;
  --line-soft: rgba(145, 156, 180, 0.15);
  --text-strong: #2f363f;
  --text-body: #616973;
  --text-muted: #8b929b;
  --brand-blue: #0f61c9;
  --brand-blue-dark: #0b56b4;
  --brand-blue-soft: rgba(15, 97, 201, 0.16);
  --violet-soft: #dcd4ff;
  --violet-text: #6858d9;
  --orange-soft: #ffd18f;
  --orange-text: #b46c0b;
  --rose-soft: #f7d6d8;
  --rose-text: #c3565e;
  --green-soft: #d8f4e4;
  --green-text: #248d52;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  background:
    radial-gradient(circle at top left, rgba(15, 97, 201, 0.05), transparent 28%),
    radial-gradient(circle at right center, rgba(104, 88, 217, 0.04), transparent 24%),
    var(--page-bg);
  color: var(--text-strong);
  font-family: "Manrope", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.platform-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 36px 24px 28px;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(18px);
  border-right: 1px solid var(--line-soft);
}

.platform-brand {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 8px 0;
}

.platform-brand__title,
.platform-topbar__title,
.hero-card__title,
.section-heading__title,
.tool-card__title,
.ai-card__title,
.history-card__title {
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.platform-brand__title {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.platform-brand__subtitle {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--text-body);
}

.platform-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-nav__item {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 72px;
  padding: 0 18px 0 20px;
  border-radius: 22px;
  color: var(--text-strong);
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.platform-nav__item:hover {
  background: rgba(15, 97, 201, 0.06);
  transform: translateX(2px);
}

.platform-nav__item.is-active {
  background: var(--surface);
  color: var(--brand-blue);
  box-shadow:
    inset -4px 0 0 var(--brand-blue),
    0 16px 32px rgba(18, 31, 53, 0.06);
}

.platform-sidebar__footer {
  margin-top: auto;
}

.teacher-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  border-radius: 24px;
  background: var(--surface);
  box-shadow: 0 18px 36px rgba(18, 31, 53, 0.05);
}

.teacher-card__avatar,
.platform-profile__avatar {
  border-radius: 999px;
  object-fit: cover;
  box-shadow: 0 12px 24px rgba(18, 31, 53, 0.12);
}

.teacher-card__avatar {
  width: 68px;
  height: 68px;
}

.teacher-card__name,
.platform-profile__name {
  margin: 0;
  font-weight: 800;
}

.teacher-card__role {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--text-body);
}

.platform-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.platform-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: auto minmax(280px, 640px) auto;
  align-items: center;
  gap: 24px;
  padding: 28px 32px 20px;
  background: rgba(247, 248, 251, 0.86);
  backdrop-filter: blur(20px);
}

.platform-topbar__title {
  font-size: 26px;
  font-weight: 800;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
  padding: 0 18px;
  border-radius: 999px;
  background: #edf1f4;
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 600;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.platform-topbar__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.icon-button {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-body);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.icon-button:hover {
  color: var(--brand-blue);
  background: rgba(15, 97, 201, 0.08);
  transform: translateY(-1px);
}

.platform-profile {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: 8px;
  padding-left: 18px;
  border-left: 1px solid var(--line-soft);
}

.platform-profile__avatar {
  width: 52px;
  height: 52px;
}

.platform-profile__name {
  font-size: 16px;
}

.platform-content {
  padding: 8px 32px 48px;
}

.overview-section,
.content-section {
  max-width: 1720px;
  margin: 0 auto;
}

.overview-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  align-items: stretch;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 440px;
  gap: 28px;
  min-height: 620px;
  padding: 48px;
  border-radius: 34px;
  background:
    radial-gradient(circle at 20% 100%, rgba(144, 194, 255, 0.12), transparent 22%),
    linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%);
  color: #ffffff;
  box-shadow: 0 28px 64px rgba(8, 44, 94, 0.2);
}

.hero-card__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hero-card__title {
  max-width: 7ch;
  margin: 12px 0 0;
  font-size: clamp(54px, 5vw, 74px);
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.hero-card__description {
  max-width: 12ch;
  margin: 28px 0 0;
  font-size: 18px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.82);
}

.hero-card__actions {
  display: flex;
  align-items: stretch;
  gap: 22px;
  margin-top: auto;
  padding-top: 36px;
}

.hero-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 188px;
  min-height: 258px;
  border-radius: 30px;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.hero-action:hover {
  transform: translateY(-4px);
}

.hero-action--primary {
  background: var(--surface);
  color: var(--brand-blue);
  box-shadow: 0 18px 40px rgba(18, 31, 53, 0.16);
}

.hero-action--glass {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.14));
  border-color: rgba(255, 255, 255, 0.22);
  color: #ffffff;
  backdrop-filter: blur(18px);
}

.hero-action__icon {
  font-size: 34px;
}

.hero-action__text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 0.18em;
  font-size: 20px;
  font-weight: 800;
}

.hero-card__visual {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.hero-card__image {
  width: 100%;
  max-width: 440px;
  border-radius: 0;
  object-fit: cover;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.stats-card {
  min-height: 298px;
  padding: 34px 28px 30px;
  border-radius: 34px;
  background: var(--surface);
  box-shadow:
    0 24px 48px rgba(18, 31, 53, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.65);
}

.stats-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 30px;
}

.stats-card__label {
  margin: 92px 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-body);
}

.stats-card__value {
  margin: 0;
  font-size: 64px;
  line-height: 1;
  font-weight: 800;
  color: var(--text-strong);
}

.stats-card--violet .stats-card__icon {
  background: var(--violet-soft);
  color: var(--violet-text);
}

.stats-card--blue .stats-card__icon {
  background: #aecaFF;
  color: var(--brand-blue);
}

.stats-card--orange .stats-card__icon {
  background: #ffbe73;
  color: #8a4a00;
}

.stats-card--rose .stats-card__icon {
  background: #f8d7d8;
  color: #c55a64;
}

.content-section {
  margin-top: 56px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.section-heading__title {
  margin: 0;
  font-size: clamp(34px, 2.6vw, 48px);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.section-heading__subtitle {
  margin: 12px 0 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-body);
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--brand-blue);
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

.tool-card {
  padding: 34px 30px 32px;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 24px 52px rgba(18, 31, 53, 0.05);
  text-align: center;
}

.tool-card__image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 170px;
  aspect-ratio: 1;
  margin: 0 auto 28px;
  border-radius: 28px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f6 100%);
}

.tool-card__image {
  width: 108px;
  height: 108px;
  object-fit: contain;
}

.tool-card__title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.tool-card__description {
  margin: 14px auto 0;
  max-width: 24ch;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-body);
}

.ai-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.ai-card {
  overflow: hidden;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 22px 48px rgba(18, 31, 53, 0.05);
}

.ai-card__image-wrap {
  aspect-ratio: 1.2;
  background: #141926;
}

.ai-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ai-card__body {
  padding: 24px 24px 26px;
}

.ai-card__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.ai-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.ai-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
}

.ai-tag--violet {
  background: var(--violet-soft);
  color: var(--violet-text);
}

.ai-tag--blue {
  background: #aecaFF;
  color: var(--brand-blue);
}

.ai-tag--orange {
  background: #ffb45f;
  color: #995a00;
}

.ai-tag--rose {
  background: #f7d6d8;
  color: #bd4f58;
}

.section-heading--history {
  align-items: center;
}

.history-filters {
  display: flex;
  align-items: center;
  gap: 16px;
}

.history-filter {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 176px;
  height: 62px;
  padding: 0 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 36px rgba(18, 31, 53, 0.05);
}

.history-filter select {
  width: 100%;
  border: 0;
  outline: 0;
  appearance: none;
  background: transparent;
  color: var(--text-strong);
  font-size: 15px;
  font-weight: 800;
  padding-right: 28px;
  cursor: pointer;
}

.history-filter .symbol {
  position: absolute;
  right: 14px;
  color: var(--text-body);
  pointer-events: none;
}

.history-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 22px;
}

.history-card {
  position: relative;
  overflow: hidden;
  min-height: 280px;
  padding: 24px;
  border-radius: 28px;
  background:
    radial-gradient(circle, rgba(164, 193, 255, 0.24) 1px, transparent 1px),
    rgba(255, 255, 255, 0.88);
  background-size: 18px 18px, auto;
  box-shadow: 0 18px 40px rgba(18, 31, 53, 0.05);
}

.history-card__status {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.history-card__status.is-done {
  background: var(--green-soft);
  color: var(--green-text);
}

.history-card__status.is-pending {
  background: #ffebcb;
  color: #d16617;
}

.history-card__title {
  margin: 26px 0 0;
  font-size: 22px;
  line-height: 1.45;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.history-card__actions {
  display: flex;
  gap: 12px;
  margin-top: 34px;
}

.history-card__button {
  min-width: 100px;
  height: 52px;
  border-radius: 20px;
  border: 1px solid transparent;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.history-card__button:hover {
  transform: translateY(-2px);
}

.history-card__button--primary {
  background: var(--brand-blue);
  color: #ffffff;
  box-shadow: 0 16px 28px rgba(15, 97, 201, 0.22);
}

.history-card__button--secondary {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(15, 97, 201, 0.14);
  color: var(--brand-blue);
}

.assistant-button {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 86px;
  height: 86px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%);
  color: #ffffff;
  box-shadow: 0 26px 52px rgba(15, 97, 201, 0.28);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.assistant-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 30px 60px rgba(15, 97, 201, 0.34);
}

.symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  line-height: 1;
  font-variation-settings: "FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24;
}

.symbol--filled {
  font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
}

.symbol--brand {
  color: var(--brand-blue);
  font-size: 44px;
}

@media (max-width: 1640px) {
  .overview-section {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .history-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1400px) {
  .hero-card {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-card__copy {
    order: 1;
  }

  .hero-card__visual {
    order: 2;
    justify-content: center;
  }

  .hero-card__title,
  .hero-card__description {
    max-width: none;
  }

  .tool-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ai-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .history-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .ceshi2-page {
    grid-template-columns: 1fr;
  }

  .platform-sidebar {
    position: relative;
    height: auto;
    gap: 22px;
    padding-bottom: 20px;
    border-right: 0;
    border-bottom: 1px solid var(--line-soft);
  }

  .platform-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .platform-nav__item {
    flex: 0 0 auto;
    min-width: 148px;
    min-height: 60px;
  }

  .platform-topbar {
    grid-template-columns: 1fr;
    justify-items: stretch;
  }

  .platform-topbar__actions {
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .platform-content,
  .platform-topbar {
    padding-left: 20px;
    padding-right: 20px;
  }

  .hero-card {
    padding: 28px 22px;
    border-radius: 28px;
  }

  .hero-card__actions {
    flex-direction: column;
  }

  .hero-action {
    width: 100%;
    min-height: 90px;
    flex-direction: row;
  }

  .hero-action__text {
    writing-mode: horizontal-tb;
    letter-spacing: 0.08em;
  }

  .stats-card {
    min-height: 220px;
  }

  .stats-card__label {
    margin-top: 42px;
  }

  .tool-grid,
  .ai-grid,
  .history-grid {
    grid-template-columns: 1fr;
  }

  .section-heading,
  .section-heading--history {
    align-items: flex-start;
    flex-direction: column;
  }

  .history-filters {
    width: 100%;
    flex-direction: column;
  }

  .history-filter {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .platform-brand {
    padding-left: 0;
  }

  .platform-profile {
    gap: 10px;
    margin-left: 0;
    padding-left: 0;
    border-left: 0;
  }

  .platform-profile__name {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stats-card__value {
    font-size: 52px;
  }

  .assistant-button {
    width: 72px;
    height: 72px;
    right: 20px;
    bottom: 20px;
  }
}
</style>
