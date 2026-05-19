<template>
  <div ref="storyReadingPageRef" class="story-reading-page" :style="pageAdaptiveStyle">
    <div class="story-reading-shell">
      <main class="story-reading-canvas">
        <header class="story-reading-header">
          <div class="story-reading-breadcrumb">
            <button
              type="button"
              class="story-reading-breadcrumb__link"
              @click="goToAICenter"
            >
              {{ t("story.aiPracticeCenter") }}
            </button>
            <span class="material-symbols-outlined story-reading-breadcrumb__icon"
              >chevron_right</span
            >
            <button
              type="button"
              class="story-reading-breadcrumb__link"
              @click="handleBackEdit"
            >
              {{ t("story.aiStoryCreation") }}
            </button>
            <span class="material-symbols-outlined story-reading-breadcrumb__icon"
              >chevron_right</span
            >
            <span class="story-reading-breadcrumb__current">{{
              t("story.storyReadingPage")
            }}</span>
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
              {{ t("story.achievementBadge") }}
            </div>
            <h1>{{ t("story.congratsTitle") }}</h1>
            <p class="story-reading-hero__desc">
              {{ t("story.congratsDesc") }}
            </p>

            <div class="story-reading-hero__actions">
              <button
                type="button"
                class="story-reading-primary-btn"
                @click="handleDownloadBook"
              >
                <span class="material-symbols-outlined">download</span>
                {{ t("story.downloadEbook") }}
              </button>
            </div>
          </div>
        </section>

        <section class="story-reading-main">
          <article
            class="story-reading-article"
            :class="{
              'story-reading-article--filled':
                storyParagraphs.length > 0 && !isStoryGenerating,
              'story-reading-article--streaming':
                storyParagraphs.length > 0 && isStoryGenerating,
            }"
          >
            <div class="story-reading-article__header">
              <h2 v-if="resolvedStoryTitle">{{ resolvedStoryTitle }}</h2>
            </div>

            <div class="story-reading-article__body">
              <p
                v-if="isStoryGenerating && !storyParagraphs.length"
                class="story-reading-article__loading"
              >
                故事生成中，请稍候...
              </p>
              <p
                v-else
                v-for="(paragraph, index) in storyParagraphs"
                :key="`${index}-${paragraph}`"
              >
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
              {{ t("story.editPlot") }}
            </button>
            <!-- <button
              type="button"
              class="story-reading-action-btn story-reading-action-btn--primary"
              @click="openContinueChapterModal"
            >
              <span class="material-symbols-outlined">auto_awesome</span>
              {{ t("story.continueNextChapter") }}
            </button> -->
          </div>

          <section v-if="!isStoryGenerating" class="story-reading-shelf">
            <div class="story-reading-shelf__header">
              <h3>{{ t("story.myBookshelf") }}</h3>
              <button
                type="button"
                class="story-reading-shelf__link"
                @click="openBookshelfModal"
              >
                {{ t("story.viewAll") }}
                <span class="material-symbols-outlined">chevron_right</span>
              </button>
            </div>

            <div class="story-shelf">
              <div v-if="bookshelfLoading" class="story-shelf__empty">书架加载中...</div>
              <div v-else-if="bookshelfItems.length === 0" class="story-shelf__empty">
                暂无书架内容
              </div>
              <article
                v-else
                v-for="book in bookshelfItems"
                :key="book.id"
                class="story-shelf__item"
                @click="handleOpenBookshelfBook(book)"
              >
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
      <div
        class="story-reading-modal__panel story-reading-modal__panel--continue"
        @click.stop
      >
        <div class="story-reading-modal__header story-reading-modal__header--continue">
          <div class="story-reading-modal__icon story-reading-modal__icon--blue">
            <span class="material-symbols-outlined">auto_awesome</span>
          </div>
          <div class="story-reading-modal__title-block">
            <h3>{{ t("story.continueNextChapter") }}</h3>
            <p>{{ t("story.continueChapterDesc") }}</p>
          </div>
        </div>

        <div class="story-reading-modal__body">
          <div class="story-reading-modal__field">
            <label>{{ t("story.nextChapterConflict") }}</label>
            <textarea
              v-model="continueChapterOutline"
              :placeholder="t('story.nextChapterPlaceholder')"
            ></textarea>
          </div>

          <div class="story-reading-modal__field">
            <label>{{ t("story.plotKeywordsLabel") }}</label>
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
                :placeholder="t('story.customKeywordPlaceholder')"
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
            {{ t("story.cancel") }}
          </button>
          <button
            type="button"
            class="story-reading-modal__btn story-reading-modal__btn--primary"
            @click="confirmContinueChapter"
          >
            {{ t("story.confirmAndContinue") }}
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
      <div
        class="story-reading-modal__panel story-reading-modal__panel--edit"
        @click.stop
      >
        <div class="story-reading-modal__topbar">
          <div>
            <h3>{{ t("story.editStoryPlot") }}</h3>
            <p>{{ t("story.editStoryDesc", { title: storyTitle }) }}</p>
          </div>
          <button
            type="button"
            class="story-reading-modal__close"
            @click="closeEditStoryModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="story-reading-modal__edit-layout">
          <div class="story-reading-modal__edit-article">
            <textarea v-model="editingStoryContent"></textarea>
          </div>

          <aside class="story-reading-modal__edit-side">
            <section
              class="story-reading-modal__edit-card story-reading-modal__edit-card--prompt"
            >
              <div class="story-reading-modal__edit-card-title">
                <span class="material-symbols-outlined">tips_and_updates</span>
                {{ t("story.inputEditDesc") }}
              </div>
              <textarea
                v-model="editStoryPrompt"
                :placeholder="t('story.editDescPlaceholder')"
              ></textarea>
              <button
                type="button"
                class="story-reading-modal__optimize-btn"
                :disabled="revisingStory"
                @click="handleOptimizeStoryContent"
              >
                <span class="material-symbols-outlined">bolt</span>
                {{ revisingStory ? "优化中..." : t("story.startSmartOptimize") }}
              </button>
            </section>

            <section
              class="story-reading-modal__edit-card story-reading-modal__edit-card--history"
            >
              <div class="story-reading-modal__edit-card-title">
                <span class="material-symbols-outlined">history</span>
                {{ t("story.historyVersions") }}
              </div>

              <div class="story-reading-history-list">
                <div v-if="editHistoryLoading" class="story-reading-history-empty">
                  历史版本加载中...
                </div>
                <div
                  v-else-if="editHistoryRecords.length === 0"
                  class="story-reading-history-empty"
                >
                  暂无历史版本
                </div>
                <article
                  v-else
                  v-for="record in editHistoryRecords"
                  :key="record.id"
                  class="story-reading-history-item"
                  :class="{ 'is-active': activeEditVersionId === record.id }"
                  @click="handleSelectHistoryVersion(record)"
                >
                  <div class="story-reading-history-item__title">{{ record.title }}</div>
                  <div class="story-reading-history-item__time">{{ record.time }}</div>
                </article>
              </div>
            </section>
          </aside>
        </div>

        <div class="story-reading-modal__footer story-reading-modal__footer--edit">
          <button
            type="button"
            class="story-reading-modal__btn story-reading-modal__btn--ghost"
            @click="closeEditStoryModal"
          >
            {{ t("story.cancel") }}
          </button>
          <button
            type="button"
            class="story-reading-modal__btn story-reading-modal__btn--primary"
            :disabled="applyingEditVersion"
            @click="confirmEditStory"
          >
            {{ applyingEditVersion ? "应用中..." : t("story.confirmAndApply") }}
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
      <div
        class="story-reading-modal__panel story-reading-modal__panel--bookshelf"
        @click.stop
      >
        <div class="story-reading-modal__topbar">
          <div class="story-reading-modal__bookshelf-title">
            <span class="material-symbols-outlined">auto_stories</span>
            <h3>{{ t("story.myBookshelf") }}</h3>
          </div>
          <button
            type="button"
            class="story-reading-modal__close"
            @click="closeBookshelfModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="story-reading-bookshelf-grid">
          <div v-if="bookshelfLoading" class="story-reading-history-empty">
            书架加载中...
          </div>
          <div
            v-else-if="allBookshelfItems.length === 0"
            class="story-reading-history-empty"
          >
            暂无书架内容
          </div>
          <article
            v-else
            v-for="book in allBookshelfItems"
            :key="`bookshelf-${book.id}`"
            class="story-reading-bookshelf-card"
            @click="handleOpenBookshelfBook(book)"
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
            {{ t("story.confirm") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { aiAdmin } from "~/composables/api/ai";

const { t } = useI18n();
const { getBookDetail, createAiChatChapters, reviseAiChatChapters, continueAiChatChapters, getBookVersions, getBookVersionsDetail, exportBookVersionsDetail, getBookList, applyBookVersionsDetail } = aiAdmin();

useHead({
  title: computed(() => t("story.storyReadingPage")),
  htmlAttrs: {},
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
  bookId?: string;
  chapterId?: string;
  generatedContent?: string;
  pendingGenerate?: boolean;
}

interface BookshelfItem {
  id: string;
  title: string;
  date: string;
  coverUrl: string;
}

interface EditHistoryRecord {
  id: string;
  title: string;
  desc: string;
  time: string;
  versionId?: string;
}

interface ContinueKeywordOption {
  label: string;
  tone: "blue" | "pink" | "green" | "gray";
}

const STORY_DRAFT_STORAGE_KEY = "mata-story-draft";
const route = useRoute();
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
  { label: t("story.keywordMagicDuel"), tone: "blue" },
  { label: t("story.keywordIdentityMystery"), tone: "pink" },
  { label: t("story.tagBetrayal"), tone: "green" },
  { label: t("story.keywordPlotTwist"), tone: "gray" },
]);
const continueChapterSelectedTags = ref<string[]>([t("story.keywordMagicDuel"), t("story.tagBetrayal")]);
const editStoryPrompt = ref("");
const editHistoryRecords = ref<EditHistoryRecord[]>([]);
const editHistoryLoading = ref(false);
const revisingStory = ref(false);
const continuingChapter = ref(false);
const bookshelfLoading = ref(false);
const bookshelfList = ref<BookshelfItem[]>([]);
const activeEditVersionId = ref("");
const applyingEditVersion = ref(false);

const createDefaultDraft = (): StoryDraftPayload => ({
  protagonistName: t("story.defaultProtagonist"),
  customRole: "",
  roleKey: "hero",
  roleLabel: t("story.roleHero"),
  sceneKey: "forest",
  sceneLabel: t("story.sceneMagicForest"),
  customScene: "",
  tags: [t("story.tagCourage"), t("story.tagBetrayal"), t("story.tagAncientProphecy")],
  outline: t("story.defaultOutline"),
  createdAt: new Date().toISOString(),
});

const storyDraft = ref<StoryDraftPayload>(createDefaultDraft());
const storyBodyParagraphs = ref<string[]>([]);
const storyStreamingText = ref("");
const isStoryGenerating = ref(false);
const typingTargetText = ref("");
const storyResolvedTitle = ref("");
let storyTypingTimer: ReturnType<typeof setInterval> | null = null;
let storyChapterAbortController: AbortController | null = null;

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

const protagonistDisplay = computed(() => storyDraft.value.protagonistName.trim() || t("story.defaultProtagonist"));
const roleDisplay = computed(() => storyDraft.value.customRole.trim() || storyDraft.value.roleLabel || t("story.roleHero"));
const sceneDisplay = computed(() => storyDraft.value.customScene.trim() || storyDraft.value.sceneLabel || t("story.sceneMagicForest"));
const storyKeywordSummary = computed(() =>
  storyDraft.value.tags.length ? storyDraft.value.tags.join(", ") : t("story.defaultKeywordsFallback")
);
const heroImage = computed(() => sceneImageMap[storyDraft.value.sceneKey] || HERO_IMAGE);
const storyTitle = computed(() => t("story.storyTitleTemplate", { protagonist: protagonistDisplay.value, scene: sceneDisplay.value }));
const resolvedStoryTitle = computed(() => storyResolvedTitle.value.trim());

const storyParagraphs = computed(() => {
  const streamingParagraphs = splitStoryParagraphs(storyStreamingText.value);
  if (streamingParagraphs.length) {
    return streamingParagraphs;
  }
  return storyBodyParagraphs.value;
});

const editingStoryContent = ref("");

const bookshelfItems = computed(() => bookshelfList.value.slice(0, 5));

const allBookshelfItems = computed(() => bookshelfList.value);

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
    const generatedContent = String(parsedDraft.generatedContent || "").trim();
    if (generatedContent) {
      storyBodyParagraphs.value = splitStoryParagraphs(generatedContent);
    }
    isStoryGenerating.value = Boolean(parsedDraft.pendingGenerate);
  } catch (error) {
    console.error("storyreading 读取故事草稿失败:", error);
  }
};

const extractBookDetailRecord = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== "object") return null;
  if (Array.isArray(payload)) {
    const firstRecord = payload.find(item => item && typeof item === "object");
    return firstRecord && typeof firstRecord === "object" ? firstRecord as Record<string, unknown> : null;
  }
  return payload as Record<string, unknown>;
};

const resolveChapterIdFromBookDetail = (payload: unknown) => {
  const record = extractBookDetailRecord(payload);
  if (!record) return "";

  const directCandidateKeys = [
    "chapterId",
    "chapter_id",
    "firstChapterId",
    "first_chapter_id",
    "currentChapterId",
    "current_chapter_id",
  ];

  for (const key of directCandidateKeys) {
    const value = String(record[key] ?? "").trim();
    if (value) {
      return value;
    }
  }

  const nestedListKeys = ["chapters", "chapterList", "chapter_list", "records", "list"];
  for (const key of nestedListKeys) {
    const rows = record[key];
    if (!Array.isArray(rows)) continue;
    const firstChapter = rows.find(item => item && typeof item === "object") as Record<string, unknown> | undefined;
    if (!firstChapter) continue;
    const nestedKeys = ["chapterId", "chapter_id", "id"];
    for (const nestedKey of nestedKeys) {
      const value = String(firstChapter[nestedKey] ?? "").trim();
      if (value) {
        return value;
      }
    }
  }

  const nestedObjectKeys = ["firstChapter", "chapter", "currentChapter"];
  for (const key of nestedObjectKeys) {
    const target = record[key];
    if (!target || typeof target !== "object") continue;
    const nestedRecord = target as Record<string, unknown>;
    const nestedKeys = ["chapterId", "chapter_id", "id"];
    for (const nestedKey of nestedKeys) {
      const value = String(nestedRecord[nestedKey] ?? "").trim();
      if (value) {
        return value;
      }
    }
  }

  return "";
};

const sanitizeStoryMarkdownText = (value: unknown) => {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/```+/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/!\[[^\]]*]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim();
};

const splitStoryParagraphs = (value: unknown) => {
  const text = sanitizeStoryMarkdownText(value);
  if (!text) return [];
  return text
    .split(/\r?\n+/)
    .map(item => item.trim())
    .filter(Boolean);
};

const createLowerCaseMap = (source: Record<string, unknown>) => {
  const map = new Map<string, unknown>();
  Object.entries(source).forEach(([key, value]) => {
    map.set(key.toLowerCase(), value);
  });
  return map;
};

const isValidFieldValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  return text.length > 0 && text !== "null" && text !== "undefined";
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

const unwrapRows = (rows: unknown): unknown[] => {
  if (Array.isArray(rows)) return rows;
  if (!rows || typeof rows !== "object") return [];

  const record = rows as Record<string, unknown>;
  const listKeys = ["rows", "list", "items", "records", "data"];
  for (const key of listKeys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }
  return [record];
};

const formatHistoryDate = (value: unknown) => {
  const text = String(value || "").trim();
  if (!text) return t("story.justNow");
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;

  const now = Date.now();
  const diffMinutes = Math.max(1, Math.round((now - date.getTime()) / 60000));
  if (diffMinutes < 60) {
    return t("story.minutesAgo", { n: diffMinutes });
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${month}-${day}`;
};

const normalizeBookVersions = (rows: unknown): EditHistoryRecord[] => {
  return unwrapRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item, index) => {
      const rowMap = createLowerCaseMap(item);
      const versionId = String(
        pickByKeys(rowMap, ["versionId", "version_id", "id"]) || ""
      ).trim();

      return {
        id: versionId || `version-${index}`,
        versionId,
        title: String(
          pickByKeys(rowMap, ["versionName", "versionTitle", "title"]) ||
          t("story.versionLabel", { n: index + 1 })
        ).trim(),
        desc: String(
          pickByKeys(rowMap, ["titleSnapshot", "title_snapshot", "modifyCommand", "description", "desc", "content"]) || ""
        ).trim(),
        time: formatHistoryDate(
          pickByKeys(rowMap, ["createTime", "createdAt", "updateTime", "updatedAt", "time"])
        ),
      };
    });
};

const normalizeBookshelfList = (rows: unknown): BookshelfItem[] => {
  return unwrapRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item, index) => {
      const rowMap = createLowerCaseMap(item);
      return {
        id: String(pickByKeys(rowMap, ["bookId", "book_id", "id"]) || `book-${index}`).trim(),
        title: String(pickByKeys(rowMap, ["title", "bookTitle", "name"]) || "未命名故事").trim(),
        date: formatHistoryDate(
          pickByKeys(rowMap, ["createTime", "createdAt", "updateTime", "updatedAt", "time"])
        ),
        coverUrl: String(pickByKeys(rowMap, ["coverUrl", "cover", "cover_url"]) || "").trim(),
      };
    });
};

const resolveVersionDetailContent = (payload: unknown) => {
  const record = extractBookDetailRecord(payload);
  if (!record) return "";
  return sanitizeStoryMarkdownText(
    record.content ||
    record.storyContent ||
    record.chapterContent ||
    record.versionContent ||
    ""
  );
};

const loadBookDetail = async (targetBookId?: string) => {
  const bookId = String(targetBookId || route.query.bookId || storyDraft.value.bookId || "").trim();
  if (!bookId) return;

  try {
    const detail = await getBookDetail(bookId);
    const record = extractBookDetailRecord(detail);
    if (!record) return;
    const chapterId = resolveChapterIdFromBookDetail(detail);

    const title = String(record.title || record.bookTitle || "").trim();
    const roleName = String(record.roleName || record.protagonistName || "").trim();
    const roleType = String(record.roleType || record.roleKey || "").trim();
    const storyScene = String(record.storyScene || record.sceneLabel || "").trim();
    const storyDesc = String(record.storyDesc || record.outline || "").trim();
    const storyKeywords = Array.isArray(record.storyKeywords)
      ? record.storyKeywords.map(item => String(item || "").trim()).filter(Boolean)
      : [];
    const storyContent =
      record.storyContent ||
      record.firstChapterContent ||
      record.chapterContent ||
      record.content ||
      "";

    storyDraft.value = {
      ...storyDraft.value,
      bookId,
      protagonistName: roleName || storyDraft.value.protagonistName,
      customRole: roleType === "custom" ? roleName : storyDraft.value.customRole,
      roleKey: roleType || storyDraft.value.roleKey,
      roleLabel: roleName || storyDraft.value.roleLabel,
      sceneLabel: storyScene || storyDraft.value.sceneLabel,
      customScene: storyDraft.value.sceneKey === "custom" ? storyScene : storyDraft.value.customScene,
      tags: storyKeywords.length ? storyKeywords : storyDraft.value.tags,
      outline: storyDesc || title || storyDraft.value.outline,
      createdAt: String(record.createTime || record.createdAt || storyDraft.value.createdAt || ""),
      chapterId: chapterId || storyDraft.value.chapterId,
    };
    storyResolvedTitle.value = title || storyResolvedTitle.value;

    const parsedParagraphs = splitStoryParagraphs(storyContent);
    if (parsedParagraphs.length) {
      storyBodyParagraphs.value = parsedParagraphs;
      if (!isStoryGenerating.value) {
        storyStreamingText.value = "";
      }
    }
  } catch (error) {
    console.error("storyreading 读取故事书详情失败:", error);
  }
};

const handleOpenBookshelfBook = async (book: BookshelfItem) => {
  if (!book.id) return;

  try {
    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("bookId", book.id);
      window.history.replaceState({}, "", nextUrl.toString());
    }

    closeBookshelfModal();
    storyDraft.value = {
      ...storyDraft.value,
      bookId: book.id,
      chapterId: "",
      generatedContent: "",
      pendingGenerate: false,
    };
    storyBodyParagraphs.value = [];
    storyStreamingText.value = "";
    storyResolvedTitle.value = "";
    await loadBookDetail(book.id);
    syncEditingStoryContent();
    scrollStoryReadingToTop();
  } catch (error) {
    console.error("storyreading 打开书架故事失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "打开书架故事失败");
  }
};

const persistStoryDraft = (extra: Partial<StoryDraftPayload> = {}) => {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    STORY_DRAFT_STORAGE_KEY,
    JSON.stringify({
      ...storyDraft.value,
      generatedContent: storyStreamingText.value || storyBodyParagraphs.value.join("\n\n"),
      ...extra,
    } satisfies StoryDraftPayload),
  );
};

const stopStoryTyping = () => {
  if (storyTypingTimer) {
    clearInterval(storyTypingTimer);
    storyTypingTimer = null;
  }
};

const ensureStoryTyping = () => {
  if (storyTypingTimer) return;

  storyTypingTimer = setInterval(() => {
    const currentText = storyStreamingText.value;
    const targetText = typingTargetText.value;

    if (!targetText || currentText.length >= targetText.length) {
      if (!isStoryGenerating.value) {
        stopStoryTyping();
      }
      return;
    }

    const remainLength = targetText.length - currentText.length;
    const appendLength = Math.min(remainLength > 24 ? 4 : 2, remainLength);
    storyStreamingText.value = targetText.slice(0, currentText.length + appendLength);
  }, 32);
};

const resolveStoryChapterTitle = () => {
  return storyDraft.value.outline.trim() || t("story.storyTitleTemplate", {
    protagonist: protagonistDisplay.value,
    scene: sceneDisplay.value,
  });
};

const resolveStoryChapterScene = () => {
  return storyDraft.value.outline.trim() || sceneDisplay.value;
};

const resolveStoryChapterId = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;
  const candidateKeys = [
    "chapterId",
    "chapter_id",
    "id",
  ];

  for (const key of candidateKeys) {
    const value = String(record[key] ?? "").trim();
    if (value) {
      return value;
    }
  }

  return "";
};

const extractStoryStreamResult = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return {
      content: String(payload || "").trim(),
      chapterId: "",
    };
  }

  const record = payload as Record<string, unknown>;
  const nestedPayload =
    (record.data && typeof record.data === "object" ? record.data : record) as Record<string, unknown>;
  const content = String(record.text || nestedPayload.content || nestedPayload.storyContent || nestedPayload.chapterContent || "").trim();
  const chapterId = resolveStoryChapterId(nestedPayload) || resolveStoryChapterId(record);

  return {
    content,
    chapterId,
  };
};

const startStoryGeneration = async () => {
  const bookId = String(route.query.bookId || storyDraft.value.bookId || "").trim();
  if (!bookId || !isStoryGenerating.value) return;
  if (storyChapterAbortController) return;

  storyStreamingText.value = "";
  typingTargetText.value = "";
  stopStoryTyping();
  storyChapterAbortController = new AbortController();

  try {
    const response = await createAiChatChapters(
      {
        bookId,
        // chapterTitle: resolveStoryChapterTitle(),
        // chapterScene: resolveStoryChapterScene(),
        enableThinking: false,
      },
      {
        signal: storyChapterAbortController.signal,
        onChunk: (_payload, fullText) => {
          typingTargetText.value = fullText;
          ensureStoryTyping();
          persistStoryDraft({
            bookId,
            pendingGenerate: true,
            generatedContent: fullText,
          });
        },
      },
    );

    const chapterResult = extractStoryStreamResult(response);
    if (chapterResult.content) {
      typingTargetText.value = chapterResult.content;
      ensureStoryTyping();
      storyBodyParagraphs.value = splitStoryParagraphs(chapterResult.content);
      if (!storyResolvedTitle.value.trim()) {
        storyResolvedTitle.value = storyTitle.value;
      }
    }

    storyDraft.value = {
      ...storyDraft.value,
      bookId,
      chapterId: chapterResult.chapterId || storyDraft.value.chapterId,
      generatedContent: chapterResult.content || typingTargetText.value,
      pendingGenerate: false,
    };
    persistStoryDraft({
      bookId,
      chapterId: storyDraft.value.chapterId,
      generatedContent: chapterResult.content || typingTargetText.value,
      pendingGenerate: false,
    });
  } catch (error) {
    console.error("storyreading 流式生成章节失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : t("story.enterReadingFailed"));
  } finally {
    isStoryGenerating.value = false;
    storyChapterAbortController = null;
    if (typingTargetText.value && storyStreamingText.value.length < typingTargetText.value.length) {
      ensureStoryTyping();
    }
  }
};

const syncEditingStoryContent = () => {
  editingStoryContent.value = storyParagraphs.value.join("\n\n");
};

const loadBookVersions = async () => {
  const bookId = String(route.query.bookId || storyDraft.value.bookId || "").trim();
  if (!bookId) {
    editHistoryRecords.value = [];
    return;
  }

  try {
    editHistoryLoading.value = true;
    const rows = await getBookVersions(bookId);
    editHistoryRecords.value = normalizeBookVersions(rows);
    if (!activeEditVersionId.value && editHistoryRecords.value.length > 0) {
      activeEditVersionId.value = editHistoryRecords.value[0].id;
    }
  } catch (error) {
    console.error("storyreading 读取历史版本失败:", error);
    editHistoryRecords.value = [];
  } finally {
    editHistoryLoading.value = false;
  }
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
  background: book.coverUrl
    ? undefined
    : "linear-gradient(180deg, #dbe8ff 0%, #88a7e8 52%, #3c5ea8 100%)",
  backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

const handleBackEdit = () => {
  router.push("/system/opt/story");
};

const openBookshelfModal = () => {
  showBookshelfModal.value = true;
  void fetchBookshelfList();
};

const closeBookshelfModal = () => {
  showBookshelfModal.value = false;
};

const fetchBookshelfList = async () => {
  if (bookshelfLoading.value) return;

  try {
    bookshelfLoading.value = true;
    const rows = await getBookList({
      pageSize: "20",
      pageNum: "1",
      orderByColumn: "createTime",
      isAsc: "desc",
      title: "",
    });
    bookshelfList.value = normalizeBookshelfList(rows);
  } catch (error) {
    console.error("storyreading 读取书架失败:", error);
    bookshelfList.value = [];
  } finally {
    bookshelfLoading.value = false;
  }
};

const openContinueChapterModal = () => {
  continueChapterOutline.value ||= t("story.continueOutlineDefault", { scene: sceneDisplay.value, protagonist: protagonistDisplay.value });
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
  void handleContinueChapter();
};

const handleContinueChapter = async () => {
  if (!continueChapterOutline.value.trim()) {
    ElMessage.warning(t("story.inputNextChapterPlot"));
    return;
  }

  if (!continueChapterSelectedTags.value.length) {
    ElMessage.warning(t("story.selectAtLeastOneKeyword"));
    return;
  }

  const chapterId = String(storyDraft.value.chapterId || route.query.chapterId || "").trim();
  if (!chapterId) {
    ElMessage.warning("当前故事缺少章节信息，暂时无法续写");
    return;
  }

  if (continuingChapter.value) return;

  try {
    continuingChapter.value = true;
    closeContinueChapterModal();
    storyBodyParagraphs.value = [];
    storyStreamingText.value = "";
    typingTargetText.value = "";
    stopStoryTyping();
    scrollStoryReadingToTop();
    const response = await continueAiChatChapters({
      chapterId,
      chapterPlot: continueChapterOutline.value.trim(),
      chapterKeywords: [...continueChapterSelectedTags.value] as [string],
      enableThinking: false,
    }, {
      onChunk: (_payload, fullText) => {
        const nextContent = sanitizeStoryMarkdownText(fullText);
        if (nextContent) {
          typingTargetText.value = nextContent;
          ensureStoryTyping();
          storyBodyParagraphs.value = splitStoryParagraphs(nextContent);
        }
      },
    });

    const nextContent = resolveVersionDetailContent(response);
    if (nextContent) {
      storyBodyParagraphs.value = splitStoryParagraphs(nextContent);
      storyStreamingText.value = "";
      persistStoryDraft({
        generatedContent: nextContent,
      });
    }
    ElMessage.success(t("story.startedContinueWriting"));
  } catch (error) {
    console.error("storyreading 续写章节失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "续写章节失败");
  } finally {
    continuingChapter.value = false;
  }
};

const openEditStoryModal = () => {
  syncEditingStoryContent();
  editStoryPrompt.value ||= t("story.editPromptDefault");
  showEditStoryModal.value = true;
  if (!storyDraft.value.chapterId) {
    void loadBookDetail().then(() => {
      void loadBookVersions();
    });
    return;
  }
  void loadBookVersions();
};

const closeEditStoryModal = () => {
  showEditStoryModal.value = false;
};

const handleOptimizeStoryContent = () => {
  void handleReviseStory();
};

const confirmEditStory = () => {
  void handleApplyEditVersion();
};

const handleApplyEditVersion = async () => {
  const chapterId = String(storyDraft.value.chapterId || route.query.chapterId || "").trim();
  const sourceVersionId = String(activeEditVersionId.value || "").trim();
  const content = editingStoryContent.value.trim();

  if (!content) {
    ElMessage.warning(t("story.storyContentEmpty"));
    return;
  }

  const bookId = String(route.query.bookId || storyDraft.value.bookId || "").trim();

  if (!bookId) {
    ElMessage.warning("当前故事缺少书籍信息，暂时无法应用修改");
    return;
  }

  if (!sourceVersionId) {
    ElMessage.warning("请先选择一个历史版本后再应用修改");
    return;
  }

  if (applyingEditVersion.value) return;

  try {
    applyingEditVersion.value = true;
    const response = await applyBookVersionsDetail(bookId, content, sourceVersionId);
    const appliedContent = resolveVersionDetailContent(response) || content;
    storyBodyParagraphs.value = splitStoryParagraphs(appliedContent);
    storyStreamingText.value = "";
    persistStoryDraft({
      generatedContent: appliedContent,
      pendingGenerate: false,
    });
    await loadBookDetail();
    await loadBookVersions();
    closeEditStoryModal();
    ElMessage.success(t("story.storyEditApplied"));
  } catch (error) {
    console.error("storyreading 应用故事版本失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "应用故事修改失败");
  } finally {
    applyingEditVersion.value = false;
  }
};

const handleReviseStory = async () => {
  const optimizePrompt = editStoryPrompt.value.trim();
  const chapterId = String(storyDraft.value.chapterId || route.query.chapterId || "").trim();

  if (!optimizePrompt) {
    ElMessage.warning(t("story.inputEditDescFirst"));
    return;
  }

  const bookId = String(route.query.bookId || storyDraft.value.bookId || "").trim();

  if (!bookId) {
    ElMessage.warning("当前故事缺少书籍信息，暂时无法智能优化");
    return;
  }

  if (revisingStory.value) return;

  try {
    revisingStory.value = true;
    editingStoryContent.value = "";
    const response = await reviseAiChatChapters({
      bookId,
      modifyCommand: optimizePrompt,
      enableThinking: false,
    }, {
      onChunk: (_payload, fullText) => {
        const nextContent = sanitizeStoryMarkdownText(fullText);
        if (nextContent) {
          editingStoryContent.value = nextContent;
        }
      },
    });

    const nextContent = resolveVersionDetailContent(response);
    if (nextContent) {
      editingStoryContent.value = nextContent;
    }
    await loadBookVersions();
    ElMessage.success(t("story.smartOptimizeDone"));
  } catch (error) {
    console.error("storyreading 智能优化失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : t("story.enterReadingFailed"));
  } finally {
    revisingStory.value = false;
  }
};

const handleSelectHistoryVersion = async (record: EditHistoryRecord) => {
  const bookId = String(route.query.bookId || storyDraft.value.bookId || "").trim();
  const versionId = String(record.versionId || record.id || "").trim();
  if (!bookId || !versionId) return;

  try {
    activeEditVersionId.value = record.id;
    const response = await getBookVersionsDetail(bookId, versionId);
    const nextContent = resolveVersionDetailContent(response);
    if (nextContent) {
      editingStoryContent.value = nextContent;
    }
  } catch (error) {
    console.error("storyreading 读取版本详情失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "读取历史版本失败");
  }
};

const handleDownloadBook = async () => {
  const bookId = String(route.query.bookId || storyDraft.value.bookId || "").trim();
  if (!bookId) {
    ElMessage.warning("当前故事缺少图书信息，暂时无法下载");
    return;
  }

  try {
    const response = await exportBookVersionsDetail(bookId);
    const fileName = String(
      (response as any)?.fileName ||
      (response as any)?.filename ||
      `${storyTitle.value || "故事"}.txt`
    ).trim();
    const fileContent = String(
      (response as any)?.content ||
      (response as any)?.text ||
      ""
    );

    if (typeof window !== "undefined" && fileContent) {
      const fileBlob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
      const fileUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || `${storyTitle.value || "故事"}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);
    }
    ElMessage.success(t("story.ebookDownloadStarted"));
  } catch (error) {
    console.error("storyreading 导出故事文本失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "下载电子书失败");
  }
};

onMounted(() => {
  if (typeof window === "undefined") {
    return;
  }

  loadStoryDraft();
  void loadBookDetail();
  void fetchBookshelfList();
  void startStoryGeneration();
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
  storyChapterAbortController?.abort();
  storyChapterAbortController = null;
  stopStoryTyping();
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
  background: radial-gradient(
      circle at top left,
      rgba(96, 165, 250, 0.12),
      transparent 24%
    ),
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
  background: linear-gradient(
      90deg,
      rgba(10, 53, 107, 0.88) 0%,
      rgba(12, 98, 200, 0.76) 55%,
      rgba(24, 124, 230, 0.28) 100%
    ),
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

.story-reading-article--filled {
  max-height: 720px;
  display: flex;
  flex-direction: column;
}

.story-reading-article--streaming {
  display: block;
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

.story-reading-article--filled .story-reading-article__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 10px;
}

.story-reading-article__body p {
  margin: 0;
  color: #1f3653;
  font-size: 14px;
  line-height: 2.05;
  text-indent: 2em;
}

.story-reading-article__loading {
  color: #64748b;
  text-align: center;
  text-indent: 0;
}

.story-reading-article--filled .story-reading-article__body::-webkit-scrollbar {
  width: 8px;
}

.story-reading-article--filled .story-reading-article__body::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
  border-radius: 999px;
}

.story-reading-article--filled .story-reading-article__body::-webkit-scrollbar-track {
  background: transparent;
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
  cursor: pointer;
}

.story-shelf__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 0.72;
  overflow: hidden;
  border-radius: 14px;
  background: #eef2f7;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.34),
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
  text-align: center;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
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

.story-reading-modal__footer--edit {
  justify-content: center;
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
  overflow: hidden;
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
  overflow-y: auto;
  overflow-x: hidden;
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
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.story-reading-history-item:hover {
  background: #eef4fb;
  transform: translateY(-1px);
}

.story-reading-history-item.is-active {
  background: #edf4ff;
  box-shadow: inset 0 0 0 1px rgba(15, 95, 189, 0.16);
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

.story-reading-history-empty {
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
  padding: 18px 0;
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
  cursor: pointer;
}

.story-reading-bookshelf-card__cover {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 16px;
  background: #eef2f7;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  transition: transform 0.32s ease, box-shadow 0.32s ease;
}

.story-reading-bookshelf-card__cover-surface {
  transition: transform 0.55s ease, filter 0.55s ease;
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

  .story-reading-article--filled {
    max-height: 660px;
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
  .story-reading-article--filled {
    max-height: 600px;
  }

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
