<template>
  <div ref="storyReadingPageRef" class="story-reading-page" :style="pageAdaptiveStyle">
    <div class="story-reading-shell">
      <main class="story-reading-canvas">
        <header class="story-reading-header">
          <div class="story-reading-breadcrumb">
            <button type="button" class="story-reading-breadcrumb__link" @click="goToAICenter">
              AI实践中心
            </button>
            <span class="material-symbols-outlined story-reading-breadcrumb__icon">chevron_right</span>
            <button type="button" class="story-reading-breadcrumb__link" @click="handleBackEdit">
              AI故事创作
            </button>
            <span class="material-symbols-outlined story-reading-breadcrumb__icon">chevron_right</span>
            <span class="story-reading-breadcrumb__current">故事阅读页</span>
          </div>
        </header>

        <section class="story-reading-hero">
          <div class="story-reading-hero__media"></div>
          <div class="story-reading-hero__shade"></div>
          <div class="story-reading-hero__medal">
            <span class="material-symbols-outlined">military_tech</span>
          </div>

          <div class="story-reading-hero__content">
            <div class="story-reading-hero__badge">
              <span class="material-symbols-outlined">workspace_premium</span>
              成就达成
            </div>
            <h1>恭喜你！完成了这篇精彩的故事</h1>
            <p class="story-reading-hero__desc">
              你已经成功将创意构思转化为完整故事。现在可以保存作品、下载电子书，
              或继续扩展新的章节内容。
            </p>

            <div class="story-reading-hero__actions">
              <button type="button" class="story-reading-primary-btn" @click="handleSaveLibrary">
                <span class="material-symbols-outlined">library_add</span>
                保存至图书馆
              </button>
              <button type="button" class="story-reading-secondary-btn" @click="handleDownloadBook">
                <span class="material-symbols-outlined">download</span>
                下载电子书
              </button>
            </div>
          </div>
        </section>

        <section class="story-reading-main">
          <article class="story-reading-article">
            <div class="story-reading-article__header">
              <h2>{{ storyTitle }}</h2>
            </div>

            <div class="story-reading-article__body">
              <p v-for="(paragraph, index) in storyParagraphs" :key="`${index}-${paragraph}`">
                {{ paragraph }}
              </p>
            </div>
          </article>

          <div class="story-reading-actions">
            <button
              type="button"
              class="story-reading-action-btn story-reading-action-btn--ghost"
              @click="openEditStoryModal"
            >
              <span class="material-symbols-outlined">edit_note</span>
              修改故事情节
            </button>
            <button
              type="button"
              class="story-reading-action-btn story-reading-action-btn--primary"
              @click="openContinueChapterModal"
            >
              <span class="material-symbols-outlined">auto_awesome</span>
              续写下一章节
            </button>
          </div>

          <section class="story-reading-shelf">
            <div class="story-reading-shelf__header">
              <h3>我的书架</h3>
              <button
                type="button"
                class="story-reading-shelf__link"
                @click="openBookshelfModal"
              >
                查看全部
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div class="story-shelf">
              <article v-for="book in bookshelfItems" :key="book.title" class="story-shelf__item">
                <div class="story-shelf__cover">
                  <div
                    class="story-shelf__cover-surface"
                    :style="getBookCoverStyle(book)"
                  ></div>
                </div>
                <h4>{{ book.title }}</h4>
              </article>
            </div>
          </section>
        </section>
      </main>
    </div>

    <div
      v-if="showContinueChapterModal"
      class="story-reading-modal"
      @click="closeContinueChapterModal"
    >
      <div class="story-reading-modal__panel story-reading-modal__panel--continue" @click.stop>
        <div class="story-reading-modal__header story-reading-modal__header--continue">
          <div class="story-reading-modal__icon story-reading-modal__icon--blue">
            <span class="material-symbols-outlined">auto_awesome</span>
          </div>
          <div class="story-reading-modal__title-block">
            <h3>续写下一章节</h3>
            <p>告诉 AI 助手您的创作蓝图，我们将协助您构建更精彩的故事情节</p>
          </div>
        </div>

        <div class="story-reading-modal__body">
          <div class="story-reading-modal__field">
            <label>下一章节核心冲突 / 情节</label>
            <textarea
              v-model="continueChapterOutline"
              placeholder="例如：艾伦在石塔内遇到了一位神秘的守护者，双方展开了关于真相的辩论..."
            ></textarea>
          </div>

          <div class="story-reading-modal__field">
            <label>情节关键词</label>
            <div class="story-reading-keyword-row">
              <button
                v-for="tag in continueChapterKeywordOptions"
                :key="tag.label"
                type="button"
                class="story-reading-keyword-tag"
                :class="[
                  `story-reading-keyword-tag--${tag.tone}`,
                  { 'is-selected': continueChapterSelectedTags.includes(tag.label) },
                ]"
                @click="toggleContinueChapterTag(tag.label)"
              >
                <span v-if="continueChapterSelectedTags.includes(tag.label)">+</span>
                {{ tag.label }}
              </button>
              <input
                v-model="continueChapterKeywordInput"
                class="story-reading-keyword-input"
                type="text"
                placeholder="自定义关键词..."
                @keyup.enter="addContinueChapterKeyword"
              />
            </div>
          </div>
        </div>

        <div class="story-reading-modal__footer story-reading-modal__footer--center">
          <button
            type="button"
            class="story-reading-modal__btn story-reading-modal__btn--ghost"
            @click="closeContinueChapterModal"
          >
            取消
          </button>
          <button
            type="button"
            class="story-reading-modal__btn story-reading-modal__btn--primary"
            @click="confirmContinueChapter"
          >
            确认并开始续写
            <span class="material-symbols-outlined">bolt</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showEditStoryModal"
      class="story-reading-modal"
      @click="closeEditStoryModal"
    >
      <div class="story-reading-modal__panel story-reading-modal__panel--edit" @click.stop>
        <div class="story-reading-modal__topbar">
          <div>
            <h3>编辑故事情节</h3>
            <p>修改《{{ storyTitle }}》的内容与设定</p>
          </div>
          <button type="button" class="story-reading-modal__close" @click="closeEditStoryModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="story-reading-modal__edit-layout">
          <div class="story-reading-modal__edit-article">
            <textarea v-model="editingStoryContent"></textarea>
          </div>

          <aside class="story-reading-modal__edit-side">
            <section class="story-reading-modal__edit-card story-reading-modal__edit-card--prompt">
              <div class="story-reading-modal__edit-card-title">
                <span class="material-symbols-outlined">tips_and_updates</span>
                输入修改描述
              </div>
              <textarea
                v-model="editStoryPrompt"
                placeholder="例如：让故事更具科幻感，或者增加主角与神秘人物之间的人工智能对话情节。"
              ></textarea>
              <button
                type="button"
                class="story-reading-modal__optimize-btn"
                @click="handleOptimizeStoryContent"
              >
                <span class="material-symbols-outlined">bolt</span>
                开始智能优化
              </button>
            </section>

            <section class="story-reading-modal__edit-card story-reading-modal__edit-card--history">
              <div class="story-reading-modal__edit-card-title">
                <span class="material-symbols-outlined">history</span>
                历史修改版本
              </div>

              <div class="story-reading-history-list">
                <article
                  v-for="record in editHistoryRecords"
                  :key="record.id"
                  class="story-reading-history-item"
                >
                  <div class="story-reading-history-item__title">{{ record.title }}</div>
                  <div class="story-reading-history-item__desc">{{ record.desc }}</div>
                  <div class="story-reading-history-item__time">{{ record.time }}</div>
                </article>
              </div>
            </section>
          </aside>
        </div>

        <div class="story-reading-modal__footer">
          <button
            type="button"
            class="story-reading-modal__btn story-reading-modal__btn--ghost"
            @click="closeEditStoryModal"
          >
            取消
          </button>
          <button
            type="button"
            class="story-reading-modal__btn story-reading-modal__btn--primary"
            @click="confirmEditStory"
          >
            确认并应用修改
            <span class="material-symbols-outlined">arrow_circle_right</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showBookshelfModal"
      class="story-reading-modal"
      @click="closeBookshelfModal"
    >
      <div class="story-reading-modal__panel story-reading-modal__panel--bookshelf" @click.stop>
        <div class="story-reading-modal__topbar">
          <div class="story-reading-modal__bookshelf-title">
            <span class="material-symbols-outlined">auto_stories</span>
            <h3>我的书架</h3>
          </div>
          <button type="button" class="story-reading-modal__close" @click="closeBookshelfModal">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="story-reading-bookshelf-grid">
          <article
            v-for="book in allBookshelfItems"
            :key="`bookshelf-${book.title}`"
            class="story-reading-bookshelf-card"
          >
            <div class="story-reading-bookshelf-card__cover">
              <div
                class="story-reading-bookshelf-card__cover-surface"
                :style="getBookCoverStyle(book)"
              ></div>
              <div class="story-reading-bookshelf-card__cover-mask"></div>
            </div>
            <h4>{{ book.title }}</h4>
            <p>
              <span class="material-symbols-outlined">schedule</span>
              {{ book.date }}
            </p>
          </article>
        </div>

        <div class="story-reading-modal__footer story-reading-modal__footer--bookshelf">
          <button
            type="button"
            class="story-reading-modal__btn story-reading-modal__btn--primary"
            @click="closeBookshelfModal"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "故事阅读页",
  htmlAttrs: {
    lang: "zh-CN",
  },
  bodyAttrs: {
    class: "story-reading-route",
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

interface BookshelfItem {
  title: string;
  cover: string;
  date: string;
  image?: string;
}

interface EditHistoryRecord {
  id: string;
  title: string;
  desc: string;
  time: string;
}

interface ContinueKeywordOption {
  label: string;
  tone: "blue" | "pink" | "green" | "gray";
}

const STORY_DRAFT_STORAGE_KEY = "mata-story-draft";
const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwYcturX7qIuQB2oYeWkRB56ep6tkvdJIkDy6XwB4XtYIccfsKqR8IsZjdyxYxG0IL7cDldkMQfYp_Z3SWA1uS3qKYxYnYhX4DQ2ylEYCDXz7aoc-ls5FvEIliJus5cl7uS-SrMxsKuYkQYjf4x1uNAyyojedXPsL1s0NzStaZ-EmMtbhrjEXLLS-VHGze518DZJFJ7zMGi7ilS6m5wHaNB2dTQbl2t6KnMxQUqnwbRrZe-4I3X-rh2yCR0Bv5jt4RR35uJE4yZRE";
const FOREST_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAbJzOtF5w13TZ-R-AF4jq86sMzoQlSCLNdqupcOybY2p7jdSun1QMxPygkpsxNfbS2gu5q9twbciA5yuagibVJQwVf3-V-EhvSPWQQdO4KgMhbaJ5_fBCTlRlTsF4VigJcHgYCPHAs1qLVSRybSJ-_-zfJfKxIwhAigBimHZlI6lPHJDGIDeKNCbbfxAfxmLcyjJ-9Vv92tuHa3jjYZbpMDZPzo1SixJb3kdlBLkuerTelE3wi1xITg2ZmKFpPM_dFbVXZ-A1pa5w";
const SPACE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBZbwPQmDGtRCarth996M_lO8DoQixmApJJkU-tlWbrF8FERSK49kGfAfZqm1djVtVkCgDa2Xn1yMpTjN5oPwGaCMkvWqsrZwEJEn1yVczuUxgH6-8zQCFfunFUFsMkBZtwoI8IJQttf53sTw1Fw1HcnWfPPff3VqA5eABsOCVWNkpBTvAcm5qhnZ5Ib0Xf1AajUBVaok-_pMi7uPtxQv4V-ngeOL7UWeBrg3UX-6d1ffru3HTYbNe-l63bRInwpbGQzPoOBICniTQ";
const PORTAL_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAMTDzkQSHu-OxIOIjqc6dL6S8-9RpvdRyp8578HGvUo2lAqeAo87aU-aNyCOgu80dx3vwncN0TUXOZ87hYmL-mVB7Z6LYg8hC_v0IAmDI6PuOxMXQrKdRCgNU4XnTBDiCJlLV6mL3BYqXLJhnIre2_DU60IGvZ_NKLATPDmoveJ0Xf79qMz0_c8adw2LySLc_vpR89XY3UTFqKcoaBhAMskluOB_UeRsmXYbrMvo6t39MtdcZdXKzMKgYg63yErxCzMXnAVX2ECDY";
const MAGIC_FOREST_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBNVGDoikG371xB-ongkajJ0M9p03-vOnDre47qpox9ZJdTIrEZsuB8DbbRefkZqZPRwXV2JDCxu-n_rjZuFoNWmTXGF8vdxICughSn87qdgAnrgJnTUyHUqRlfAkabcgDrz06BYKfoRz4aWE7FcLtcVphgHd8eNVDFdhQTnfE0k0_43r5ZwF2TquVSdaFiaCDMLt2pQRp8zxNEeEFxNktOR9iQ_cumXzKpFckDn7aXAgRdG9vUoyVAZJT8_qJ2hdW00vVYOVn3yxw";
const FUTURE_CITY_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAi6yc3uWRRu0qcY-pS6rI15wJG6qYrsu9-4NJJblJ3KiURanzKCYAvriGvReoAtAq4YhZGpXW9JEkNGpSnFwUedB9lZmk6rBNx8xvsVHstWS2VLWo4H71ipPjx4Khe4S4jp7gUisisvyJJhJUUULMsgJvCDlG5v5Mo6oH7I2IuljQaPWLGT9K9vltpUHL6wAQ3BaFxWS3iJ301d6ZimrtlFDPL2m2Nnvntg4Sxg9vnhtYik7EE8KGzMbg3vQdd_ygQM5SgNyMP3Es";
const OCEAN_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCRdJMcNC2JamFKy4rjPcpPmU7f-EH3o7zFYQVsgRX-AbAvW3iePyhRaT4XbiOzPNcJTSl_fvsLdsFrGO4L4ttRUFw4ceQCueCbn25JIQ0crYsrm7SLFNaQxfbG__di3BCTnoQC5BqZXtP4FC0FmkRrVayLvSg5nHy2Mdnx0U4FHUxpeiT9_MI3XrKwFFg40jm97TLt-jsi0WNBKN46NksIYrvGMzntAwgIhaJI0x5brbGSAanoVzaMg501BuaRdNp-Bv-H7vU4TXE";
const CRYSTAL_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjLZ-h-zWvk881bdNyDYNOmK_gwdWGGt7sWkuN8wXqYTmvd9VckUWHRAKxLwE1VTr3uNndk3f1-6R2673-y2kl43YNiaWq39sRFxZeBSJMlNJtRnqXFuuSuLMAk9EvuoiVXESjZOr8jDbvRYmuR5dzN8RgVhXMK5UsTRUUc-ls0U1tB9K-1m7z1OiN-zVOdsF8ICGRlrSbL5s7yPGse8xXWHUdYQ3l-HVKgEficzENRw1ofukvcAqncRxL1OZVmnrLzfD4SpuL1SQ";

const router = useRouter();
const storyReadingPageRef = ref<HTMLElement | null>(null);
let storyReadingResizeObserver: ResizeObserver | null = null;
let storyReadingScrollResetTimer: ReturnType<typeof setTimeout> | null = null;
const storyReadingLayoutWidth = ref(1360);
const showContinueChapterModal = ref(false);
const showEditStoryModal = ref(false);
const showBookshelfModal = ref(false);
const continueChapterOutline = ref("");
const continueChapterKeywordInput = ref("");
const continueChapterKeywordOptions = ref<ContinueKeywordOption[]>([
  { label: "魔法对决", tone: "blue" },
  { label: "身世之谜", tone: "pink" },
  { label: "背叛", tone: "green" },
  { label: "反转", tone: "gray" },
]);
const continueChapterSelectedTags = ref<string[]>(["魔法对决", "背叛"]);
const editStoryPrompt = ref("");
const editHistoryRecords = ref<EditHistoryRecord[]>([
  {
    id: "record-1",
    title: "版本 3",
    desc: "增强了星际学院的氛围描写，增加了徽章共鸣时的音效细节。",
    time: "3 分钟前",
  },
  {
    id: "record-2",
    title: "版本 2",
    desc: "补充了林晓父亲留下的线索，让背景设定更有悬念。",
    time: "7 分钟前",
  },
]);

const createDefaultDraft = (): StoryDraftPayload => ({
  protagonistName: "林晓",
  customRole: "",
  roleKey: "hero",
  roleLabel: "英雄",
  sceneKey: "forest",
  sceneLabel: "魔法森林",
  customScene: "",
  tags: ["勇气", "背叛", "古老预言"],
  outline:
    "在一所神秘的星际学院里，一位普通学生意外触发了被封印千年的遗迹力量，并被卷入一场决定学院命运的冒险。",
  createdAt: new Date().toISOString(),
});

const storyDraft = ref<StoryDraftPayload>(createDefaultDraft());

const sceneImageMap: Record<string, string> = {
  forest: FOREST_IMAGE,
  space: SPACE_IMAGE,
  castle: HERO_IMAGE,
  custom: HERO_IMAGE,
};

const getStoryReadingLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = storyReadingPageRef.value?.clientWidth || 0;
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

const syncStoryReadingLayoutWidth = () => {
  storyReadingLayoutWidth.value = getStoryReadingLayoutWidth();
};

const storyReadingShellWidth = computed(() => {
  if (storyReadingLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(storyReadingLayoutWidth.value))}px`;
  }

  return `${Math.min(1920, Math.max(1280, Math.round(storyReadingLayoutWidth.value * 0.9)))}px`;
});

const protagonistDisplay = computed(() => storyDraft.value.protagonistName.trim() || "林晓");
const roleDisplay = computed(() => storyDraft.value.customRole.trim() || storyDraft.value.roleLabel || "英雄");
const sceneDisplay = computed(() => storyDraft.value.customScene.trim() || storyDraft.value.sceneLabel || "魔法森林");
const storyKeywordSummary = computed(() =>
  storyDraft.value.tags.length ? storyDraft.value.tags.join("、") : "勇气、友情、成长"
);
const heroImage = computed(() => sceneImageMap[storyDraft.value.sceneKey] || HERO_IMAGE);
const storyTitle = computed(() => `${protagonistDisplay.value}与${sceneDisplay.value}的秘密`);

const storyParagraphs = computed(() => [
  `${protagonistDisplay.value}原本只是${sceneDisplay.value}边缘最不起眼的一名${roleDisplay.value}，直到那枚泛着微光的徽章在月色下自行点亮。它像是在召唤，又像是在提醒，让${protagonistDisplay.value}意识到，自己正在被卷入一场和${storyKeywordSummary.value}有关的巨大谜局。`,
  `沿着徽章投下的蓝色轨迹，${protagonistDisplay.value}走进了被尘封已久的回廊。回廊两侧的壁画不断变化，像是在重演久远年代的秘密。每前进一步，${protagonistDisplay.value}都更确信，真正需要面对的并不是外部的黑暗，而是内心对未知的犹疑与选择。`,
  storyDraft.value.outline.trim() ||
    `一位名叫${protagonistDisplay.value}的${roleDisplay.value}在${sceneDisplay.value}中展开了一场关于${storyKeywordSummary.value}的冒险。`,
  `当最后一扇门缓缓开启，隐藏在${sceneDisplay.value}深处的真相终于显现。${protagonistDisplay.value}没有选择退缩，而是带着新的勇气将谜题拼合成完整的答案。故事在这里告一段落，但新的线索也悄然留下，等待下一章节继续展开。`,
]);

const editingStoryContent = ref("");

const bookshelfItems = computed<BookshelfItem[]>(() => [
  {
    title: "星际学院的秘密代码",
    cover: "radial-gradient(circle at 50% 48%, #58d4ff 0%, #183d97 34%, #071733 72%, #020817 100%)",
    date: "2024-05-20",
    image: PORTAL_IMAGE,
  },
  {
    title: "远古神兽的觉醒",
    cover: "linear-gradient(180deg, #0b1f2d 0%, #164b4b 42%, #f576a8 100%)",
    date: "2024-05-18",
    image: MAGIC_FOREST_IMAGE,
  },
  {
    title: "未来城市的蓝图",
    cover: "linear-gradient(180deg, #051826 0%, #0f4f74 50%, #6de6ff 100%)",
    date: "2024-05-15",
    image: FUTURE_CITY_IMAGE,
  },
  {
    title: "深海之下的文明",
    cover: "linear-gradient(180deg, #76dcff 0%, #1a88b8 36%, #0f3349 100%)",
    date: "2024-05-12",
    image: OCEAN_IMAGE,
  },
  {
    title: "AI：人类的新伙伴",
    cover: "linear-gradient(180deg, #cad8df 0%, #8899a2 60%, #55616b 100%)",
    date: "2024-05-10",
    image: CRYSTAL_IMAGE,
  },
]);

const allBookshelfItems = computed(() => bookshelfItems.value);

const pageAdaptiveStyle = computed(() => ({
  "--story-reading-shell-width": storyReadingShellWidth.value,
  "--story-reading-hero-image": `url(${heroImage.value})`,
}));

const loadStoryDraft = () => {
  if (typeof window === "undefined") {
    return;
  }

  const cachedDraft = window.sessionStorage.getItem(STORY_DRAFT_STORAGE_KEY);
  if (!cachedDraft) {
    return;
  }

  try {
    const parsedDraft = JSON.parse(cachedDraft) as Partial<StoryDraftPayload>;
    storyDraft.value = {
      ...createDefaultDraft(),
      ...parsedDraft,
      tags: Array.isArray(parsedDraft.tags) && parsedDraft.tags.length
        ? parsedDraft.tags.map(tag => String(tag))
        : createDefaultDraft().tags,
    };
  } catch (error) {
    console.error("storyreading 读取故事草稿失败:", error);
  }
};

const syncEditingStoryContent = () => {
  editingStoryContent.value = storyParagraphs.value.join("\n\n");
};

const scrollStoryReadingToTop = () => {
  if (typeof window === "undefined") {
    return;
  }

  const scrollTargets = new Set<HTMLElement>();
  const pageElement = storyReadingPageRef.value;

  if (pageElement) {
    scrollTargets.add(pageElement);

    const sidebarShell = pageElement.closest(".sidebar-shell");
    const sidebarContent = pageElement.closest(".sidebar-shell-content");

    if (sidebarShell instanceof HTMLElement) {
      scrollTargets.add(sidebarShell);
    }

    if (sidebarContent instanceof HTMLElement) {
      scrollTargets.add(sidebarContent);
    }

    let parentElement = pageElement.parentElement;
    while (parentElement) {
      const style = window.getComputedStyle(parentElement);
      const isScrollable = /(auto|scroll)/.test(
        `${style.overflow}${style.overflowY}${style.overflowX}`
      );

      if (isScrollable) {
        scrollTargets.add(parentElement);
      }

      parentElement = parentElement.parentElement;
    }
  }

  scrollTargets.forEach(target => {
    target.scrollTo?.({
      top: 0,
      left: 0,
      behavior: "auto",
    });
    target.scrollTop = 0;
    target.scrollLeft = 0;
  });

  storyReadingPageRef.value?.scrollTo?.({
    top: 0,
    behavior: "auto",
  });

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

const goToAICenter = () => {
  router.push("/system/opt");
};

const getBookCoverStyle = (book: BookshelfItem) => ({
  background: book.cover,
  backgroundImage: book.image ? `url(${book.image})` : undefined,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

const handleBackEdit = () => {
  router.push("/system/opt/story");
};

const openBookshelfModal = () => {
  showBookshelfModal.value = true;
};

const closeBookshelfModal = () => {
  showBookshelfModal.value = false;
};

const openContinueChapterModal = () => {
  continueChapterOutline.value ||= `围绕${sceneDisplay.value}中的新线索展开，重点突出${protagonistDisplay.value}即将面对的抉择与冲突。`;
  showContinueChapterModal.value = true;
};

const closeContinueChapterModal = () => {
  showContinueChapterModal.value = false;
};

const addContinueChapterKeyword = () => {
  const nextKeyword = continueChapterKeywordInput.value.trim();
  if (!nextKeyword) {
    return;
  }

  const exists = continueChapterKeywordOptions.value.some(tag => tag.label === nextKeyword);
  if (!exists) {
    continueChapterKeywordOptions.value.push({
      label: nextKeyword,
      tone: "gray",
    });
  }

  if (!continueChapterSelectedTags.value.includes(nextKeyword)) {
    continueChapterSelectedTags.value.push(nextKeyword);
  }

  continueChapterKeywordInput.value = "";
};

const toggleContinueChapterTag = (targetTag: string) => {
  if (continueChapterSelectedTags.value.includes(targetTag)) {
    continueChapterSelectedTags.value = continueChapterSelectedTags.value.filter(
      tag => tag !== targetTag
    );
    return;
  }

  continueChapterSelectedTags.value.push(targetTag);
};

const confirmContinueChapter = () => {
  if (!continueChapterOutline.value.trim()) {
    ElMessage.warning("请先输入下一章节的核心情节");
    return;
  }

  if (!continueChapterSelectedTags.value.length) {
    ElMessage.warning("请至少选择一个情节关键词");
    return;
  }

  closeContinueChapterModal();
  ElMessage.success("已开始续写下一章节");
};

const openEditStoryModal = () => {
  syncEditingStoryContent();
  editStoryPrompt.value ||= "让故事更有悬念感，并强化主角与神秘守护者之间的冲突。";
  showEditStoryModal.value = true;
};

const closeEditStoryModal = () => {
  showEditStoryModal.value = false;
};

const handleOptimizeStoryContent = () => {
  const optimizePrompt = editStoryPrompt.value.trim();
  if (!optimizePrompt) {
    ElMessage.warning("请先输入修改描述");
    return;
  }

  editingStoryContent.value = `${editingStoryContent.value}\n\n【优化建议已应用】${optimizePrompt}`;
  editHistoryRecords.value = [
    {
      id: `record-${Date.now()}`,
      title: `版本 ${editHistoryRecords.value.length + 2}`,
      desc: optimizePrompt,
      time: "刚刚",
    },
    ...editHistoryRecords.value,
  ];
  ElMessage.success("智能优化已完成");
};

const confirmEditStory = () => {
  if (!editingStoryContent.value.trim()) {
    ElMessage.warning("故事内容不能为空");
    return;
  }

  closeEditStoryModal();
  ElMessage.success("故事修改已应用");
};

const handleSaveLibrary = () => {
  ElMessage.success("已保存至图书馆");
};

const handleDownloadBook = () => {
  if (typeof window === "undefined") {
    return;
  }

  const content = [`《${storyTitle.value}》`, "", ...storyParagraphs.value].join("\n\n");
  const fileBlob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const fileUrl = window.URL.createObjectURL(fileBlob);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = `${storyTitle.value}.txt`;
  link.click();
  window.URL.revokeObjectURL(fileUrl);
  ElMessage.success("电子书已开始下载");
};

const handleContinueChapter = () => {
  ElMessage.info("下一章节入口已预留，可继续扩展续写流程");
};

onMounted(() => {
  if (typeof window === "undefined") {
    return;
  }

  loadStoryDraft();
  syncEditingStoryContent();
  syncStoryReadingLayoutWidth();
  scrollStoryReadingToTop();
  requestAnimationFrame(() => {
    scrollStoryReadingToTop();
  });
  storyReadingScrollResetTimer = setTimeout(() => {
    scrollStoryReadingToTop();
  }, 120);
  window.addEventListener("resize", syncStoryReadingLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncStoryReadingLayoutWidth);

  if (window.ResizeObserver && storyReadingPageRef.value) {
    storyReadingResizeObserver = new window.ResizeObserver(() => {
      syncStoryReadingLayoutWidth();
    });
    storyReadingResizeObserver.observe(storyReadingPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") {
    return;
  }

  window.removeEventListener("resize", syncStoryReadingLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncStoryReadingLayoutWidth);
  storyReadingResizeObserver?.disconnect();
  storyReadingResizeObserver = null;
  if (storyReadingScrollResetTimer) {
    clearTimeout(storyReadingScrollResetTimer);
    storyReadingScrollResetTimer = null;
  }
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

.story-reading-page {
  --story-reading-min-width: 1280px;
  --story-reading-max-width: 1920px;
  --story-reading-shell-width: var(--story-reading-min-width);
  --story-reading-hero-image: none;
  min-height: 100vh;
  min-width: var(--story-reading-min-width);
  overflow-x: auto;
  overflow-y: visible;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.12), transparent 24%),
    linear-gradient(180deg, #f6f9fd 0%, #f9fbfe 100%);
  color: #12304f;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.story-reading-page::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

.story-reading-page::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.24);
  border-radius: 999px;
}

.story-reading-shell {
  width: min(
    var(--story-reading-max-width),
    max(var(--story-reading-min-width), var(--story-reading-shell-width))
  );
  min-width: var(--story-reading-min-width);
  margin: 0 auto;
  padding: 34px 40px 60px;
  box-sizing: border-box;
}

.story-reading-canvas {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.story-reading-header {
  display: flex;
  align-items: center;
}

.story-reading-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: #7b8ca3;
  font-size: 14px;
  font-weight: 600;
}

.story-reading-breadcrumb__link {
  display: inline-flex;
  align-items: center;
  border: none;
  background: transparent;
  padding: 0;
  color: #60748f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
  font-family: inherit;
}

.story-reading-breadcrumb__link:hover {
  color: #0f5fbd;
}

.story-reading-breadcrumb__icon {
  font-size: 16px;
  color: #a5b4c7;
}

.story-reading-breadcrumb__current {
  color: #2563eb;
}

.story-reading-hero {
  position: relative;
  overflow: hidden;
  min-height: 220px;
  border-radius: 24px;
  background: linear-gradient(135deg, #0f5fbd 0%, #0d67ce 56%, #0a58b2 100%);
  box-shadow: 0 16px 38px rgba(15, 95, 189, 0.16);
}

.story-reading-hero__media,
.story-reading-hero__shade {
  position: absolute;
  inset: 0;
}

.story-reading-hero__media {
  background-image: var(--story-reading-hero-image);
  background-position: right center;
  background-size: cover;
  opacity: 0.1;
}

.story-reading-hero__shade {
  background:
    linear-gradient(90deg, rgba(10, 53, 107, 0.88) 0%, rgba(12, 98, 200, 0.76) 55%, rgba(24, 124, 230, 0.28) 100%),
    radial-gradient(circle at 88% 14%, rgba(255, 255, 255, 0.16), transparent 14%);
}

.story-reading-hero__medal {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 1;
  color: rgba(255, 255, 255, 0.22);
  font-size: 58px;
}

.story-reading-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 220px;
  max-width: 720px;
  margin: 0 auto;
  padding: 28px 48px;
  color: #ffffff;
  text-align: center;
}

.story-reading-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 12px;
  font-weight: 800;
}

.story-reading-hero h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.24;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.story-reading-hero__desc {
  margin: 0;
  max-width: 560px;
  color: rgba(255, 255, 255, 0.84);
  font-size: 13px;
  line-height: 1.8;
}

.story-reading-hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.story-reading-primary-btn,
.story-reading-secondary-btn,
.story-reading-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.story-reading-primary-btn {
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: #ffffff;
  color: #0f5fbd;
  box-shadow: 0 10px 22px rgba(15, 95, 189, 0.14);
}

.story-reading-secondary-btn {
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  backdrop-filter: blur(8px);
}

.story-reading-primary-btn:hover,
.story-reading-secondary-btn:hover,
.story-reading-action-btn:hover {
  transform: translateY(-2px);
}

.story-reading-main {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.story-reading-article {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 14px 38px rgba(15, 23, 42, 0.05);
  padding: 32px 44px 40px;
}

.story-reading-article__header {
  display: flex;
  justify-content: center;
  padding-bottom: 18px;
}

.story-reading-article__header h2 {
  margin: 0;
  color: #102a43;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 800;
  text-align: center;
}

.story-reading-article__body {
  padding-top: 6px;
}

.story-reading-article__body p {
  margin: 0;
  color: #1f3653;
  font-size: 14px;
  line-height: 2.05;
  text-indent: 2em;
}

.story-reading-article__body p + p {
  margin-top: 18px;
}

.story-reading-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
}

.story-reading-action-btn {
  min-width: 164px;
  min-height: 42px;
}

.story-reading-action-btn--ghost {
  border: 1px solid #7db4ff;
  background: #ffffff;
  color: #0f5fbd;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.08);
}

.story-reading-action-btn--primary {
  border: none;
  background: linear-gradient(135deg, #0f5fbd 0%, #0a6bda 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(15, 95, 189, 0.2);
}

.story-reading-shelf {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.story-reading-shelf__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.story-reading-shelf__header h3 {
  margin: 0;
  color: #102a43;
  font-size: 20px;
  font-weight: 800;
}

.story-reading-shelf__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 0;
  color: #0a6bda;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.story-shelf {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.story-shelf__item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.story-shelf__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 0.72;
  overflow: hidden;
  border-radius: 14px;
  background: #eef2f7;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.34),
    0 10px 26px rgba(15, 23, 42, 0.08);
}

.story-shelf__cover-surface,
.story-reading-bookshelf-card__cover-surface {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.story-shelf__item h4 {
  margin: 0;
  color: #17375a;
  font-size: 12px;
  line-height: 1.5;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.story-reading-modal {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(10px);
}

.story-reading-modal__panel {
  width: min(100%, 1120px);
  border-radius: 34px;
  background: #ffffff;
  box-shadow: 0 36px 80px rgba(15, 23, 42, 0.18);
}

.story-reading-modal__panel--continue {
  max-width: 980px;
  padding: 28px 32px 28px;
}

.story-reading-modal__panel--edit {
  max-width: 1280px;
  padding: 0;
  overflow: hidden;
  max-height: min(88vh, 900px);
  display: flex;
  flex-direction: column;
}

.story-reading-modal__panel--bookshelf {
  max-width: 960px;
  padding: 0;
  overflow: hidden;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 40px 100px rgba(0, 91, 194, 0.08);
  max-height: min(86vh, 900px);
  display: flex;
  flex-direction: column;
}

.story-reading-modal__header {
  display: flex;
  align-items: center;
  gap: 18px;
}

.story-reading-modal__header--continue {
  padding: 6px 6px 24px;
}

.story-reading-modal__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.story-reading-modal__icon--blue {
  background: linear-gradient(135deg, #d7e8ff 0%, #c0d9ff 100%);
  color: #0f5fbd;
}

.story-reading-modal__title-block h3,
.story-reading-modal__topbar h3 {
  margin: 0;
  color: #1b2f4a;
  font-size: 18px;
  font-weight: 800;
}

.story-reading-modal__title-block p,
.story-reading-modal__topbar p {
  margin: 6px 0 0;
  color: #8a97a9;
  font-size: 13px;
  line-height: 1.6;
}

.story-reading-modal__body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.story-reading-modal__field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.story-reading-modal__field label {
  color: #354b68;
  font-size: 14px;
  font-weight: 700;
}

.story-reading-modal__field textarea,
.story-reading-modal__edit-card textarea,
.story-reading-modal__edit-article textarea {
  width: 100%;
  border: 1px solid rgba(203, 213, 225, 0.58);
  border-radius: 22px;
  background: #f4f7fb;
  color: #193250;
  font-family: inherit;
  box-sizing: border-box;
  resize: none;
  outline: none;
}

.story-reading-modal__field textarea {
  min-height: 170px;
  padding: 22px 24px;
  font-size: 14px;
  line-height: 1.8;
}

.story-reading-keyword-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.story-reading-keyword-tag {
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0 16px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.story-reading-keyword-tag:hover {
  transform: translateY(-1px);
}

.story-reading-keyword-tag span {
  margin-right: 2px;
  font-weight: 800;
}

.story-reading-keyword-tag--blue {
  background: #edf5ff;
  border-color: #bfdbfe;
}

.story-reading-keyword-tag--pink {
  background: #ffeaf4;
  border-color: #f8cfe0;
}

.story-reading-keyword-tag--green {
  background: #e3fff0;
  border-color: #b7f0cd;
}

.story-reading-keyword-tag--gray {
  background: #f1f5f9;
  border-color: #dbe2ea;
}

.story-reading-keyword-tag.is-selected {
  color: #0f5fbd;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.12);
}

.story-reading-keyword-input {
  min-width: 220px;
  flex: 1;
  min-height: 38px;
  border: 1px dashed rgba(203, 213, 225, 0.9);
  border-radius: 999px;
  background: #f4f7fb;
  padding: 0 18px;
  color: #193250;
  font-size: 13px;
  font-family: inherit;
  outline: none;
}

.story-reading-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  padding: 22px 32px 30px;
  flex-shrink: 0;
}

.story-reading-modal__footer--center {
  justify-content: center;
  padding: 28px 0 0;
}

.story-reading-modal__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 122px;
  min-height: 44px;
  border-radius: 999px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}

.story-reading-modal__btn--ghost {
  border: 1px solid rgba(203, 213, 225, 0.86);
  background: #ffffff;
  color: #64748b;
}

.story-reading-modal__btn--primary {
  border: none;
  background: linear-gradient(135deg, #0f5fbd 0%, #0a6bda 100%);
  color: #ffffff;
  box-shadow: 0 14px 26px rgba(15, 95, 189, 0.2);
}

.story-reading-modal__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 28px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.story-reading-modal__bookshelf-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.story-reading-modal__bookshelf-title h3 {
  margin: 0;
  color: #2d3337;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.story-reading-modal__bookshelf-title .material-symbols-outlined {
  color: #0a6bda;
  font-size: 28px;
  font-variation-settings: "FILL" 1;
}

.story-reading-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #596063;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.story-reading-modal__close:hover {
  background: #e3e9ec;
}

.story-reading-modal__edit-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) 320px;
  min-height: 0;
  overflow: hidden;
  flex: 1;
}

.story-reading-modal__edit-article {
  padding: 26px;
  border-right: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
  min-height: 0;
  overflow: auto;
}

.story-reading-modal__edit-article textarea {
  height: 100%;
  min-height: 0;
  padding: 22px 24px;
  background: #ffffff;
  border: none;
  border-radius: 0;
  font-size: 14px;
  line-height: 2;
}

.story-reading-modal__edit-side {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px 18px;
  background: #f8fafc;
  min-height: 0;
  overflow: auto;
}

.story-reading-modal__edit-card {
  border-radius: 22px;
  background: #ffffff;
  padding: 18px 16px;
  box-shadow: 0 12px 26px rgba(148, 163, 184, 0.08);
}

.story-reading-modal__edit-card--prompt {
  padding-bottom: 16px;
}

.story-reading-modal__edit-card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5f728c;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 12px;
}

.story-reading-modal__edit-card textarea {
  min-height: 112px;
  padding: 16px 18px;
  font-size: 13px;
  line-height: 1.8;
}

.story-reading-modal__optimize-btn {
  width: 100%;
  min-height: 42px;
  margin-top: 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #0f5fbd 0%, #0a6bda 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}

.story-reading-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.story-reading-history-item {
  border-radius: 18px;
  background: #f8fafc;
  padding: 14px 14px 12px;
}

.story-reading-history-item__title {
  color: #d946ef;
  font-size: 12px;
  font-weight: 800;
}

.story-reading-history-item__desc {
  margin-top: 6px;
  color: #334155;
  font-size: 12px;
  line-height: 1.7;
}

.story-reading-history-item__time {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 11px;
  text-align: right;
}

.story-reading-bookshelf-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px 24px;
  padding: 28px;
  overflow-y: auto;
  min-height: 0;
  flex: 1;
}

.story-reading-bookshelf-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.story-reading-bookshelf-card__cover {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 16px;
  background: #eef2f7;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  transition:
    transform 0.32s ease,
    box-shadow 0.32s ease;
}

.story-reading-bookshelf-card__cover-surface {
  transition:
    transform 0.55s ease,
    filter 0.55s ease;
}

.story-reading-bookshelf-card__cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 48%, rgba(0, 0, 0, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.story-reading-bookshelf-card__cover::after {
  content: "";
  position: absolute;
  inset: -18% auto -18% -42%;
  width: 34%;
  background: linear-gradient(
    115deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.16) 35%,
    rgba(255, 255, 255, 0.72) 50%,
    rgba(255, 255, 255, 0.16) 65%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-185%) skewX(-24deg);
  opacity: 0;
  pointer-events: none;
}

.story-reading-bookshelf-card h4 {
  margin: 0;
  color: #2d3337;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
}

.story-reading-bookshelf-card p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #596063;
  font-size: 12px;
  font-weight: 700;
}

.story-reading-bookshelf-card p .material-symbols-outlined {
  font-size: 14px;
}

.story-reading-bookshelf-card:hover .story-reading-bookshelf-card__cover {
  transform: translateY(-8px);
  box-shadow: 0 24px 42px rgba(15, 23, 42, 0.2);
}

.story-reading-bookshelf-card:hover .story-reading-bookshelf-card__cover-surface {
  transform: scale(1.08);
  filter: saturate(1.08) contrast(1.02);
}

.story-reading-bookshelf-card:hover .story-reading-bookshelf-card__cover-mask {
  opacity: 1;
}

.story-reading-bookshelf-card:hover .story-reading-bookshelf-card__cover::after {
  opacity: 1;
  animation: story-bookshelf-sheen 0.95s ease;
}

.story-reading-modal__footer--bookshelf {
  flex-shrink: 0;
  justify-content: center;
  margin-top: 0;
  padding: 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
}

.story-reading-modal__footer--bookshelf .story-reading-modal__btn--primary {
  min-width: 132px;
  min-height: 48px;
  padding: 0 28px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(0, 91, 194, 0.2);
}

@media (max-width: 1500px) {
  .story-reading-hero h1 {
    font-size: 30px;
  }

  .story-shelf {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .story-reading-modal__edit-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .story-reading-modal__edit-article {
    border-right: none;
    border-bottom: 1px solid rgba(226, 232, 240, 0.9);
    max-height: 38vh;
  }

  .story-reading-modal__edit-side {
    max-height: 28vh;
  }

  .story-reading-bookshelf-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px 18px;
    padding: 22px;
  }

  .story-reading-bookshelf-card {
    gap: 10px;
  }

  .story-reading-bookshelf-card__cover {
    border-radius: 14px;
  }

  .story-reading-bookshelf-card h4 {
    font-size: 13px;
  }

  .story-reading-bookshelf-card p {
    font-size: 11px;
  }
}

@media (max-width: 1300px) {
  .story-reading-modal__panel--edit {
    max-width: 1120px;
    max-height: min(84vh, 760px);
  }

  .story-reading-modal__panel--bookshelf {
    max-width: 860px;
    max-height: min(82vh, 760px);
  }

  .story-reading-modal__topbar {
    padding: 18px 22px;
  }

  .story-reading-modal__bookshelf-title h3 {
    font-size: 20px;
  }

  .story-reading-modal__bookshelf-title .material-symbols-outlined {
    font-size: 24px;
  }

  .story-reading-bookshelf-grid {
    gap: 18px 16px;
    padding: 18px 20px;
  }

  .story-reading-modal__edit-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .story-reading-modal__edit-article {
    padding: 20px;
    max-height: 34vh;
  }

  .story-reading-modal__edit-side {
    gap: 14px;
    padding: 18px 16px;
    max-height: 24vh;
  }

  .story-reading-modal__footer {
    padding: 18px 22px 22px;
  }

  .story-reading-bookshelf-card {
    gap: 8px;
  }

  .story-reading-bookshelf-card__cover {
    border-radius: 12px;
  }

  .story-reading-bookshelf-card h4 {
    font-size: 12px;
  }

  .story-reading-bookshelf-card p {
    font-size: 10px;
  }

  .story-reading-modal__footer--bookshelf {
    padding: 18px 20px;
  }

  .story-reading-modal__footer--bookshelf .story-reading-modal__btn--primary {
    min-width: 112px;
    min-height: 42px;
    font-size: 13px;
  }
}

@keyframes story-bookshelf-sheen {
  0% {
    transform: translateX(-185%) skewX(-24deg);
  }
  100% {
    transform: translateX(420%) skewX(-24deg);
  }
}
</style>
