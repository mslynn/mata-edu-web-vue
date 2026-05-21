<template>
  <div
    ref="storyPageRef"
    class="story-page"
    :class="{ 'story-page--embedded': embedded }"
    :style="pageAdaptiveStyle"
  >
    <div class="story-shell">
      <header v-if="!embedded" class="story-header">
        <div class="story-breadcrumb">
          <button
            type="button"
            class="story-breadcrumb__link"
            @click="goToAICenter"
          >
            {{ t("story.aiPracticeCenter") }}
          </button>
          <span class="material-symbols-outlined story-breadcrumb__icon">chevron_right</span>
          <span class="story-breadcrumb__current">{{ t("story.aiStoryCreation") }}</span>
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
            <h1>{{ t("story.heroTitle") }}</h1>
            <p>{{ t("story.heroDesc") }}</p>
          </div>
        </section>

        <section class="story-workflow">
          <div class="story-workflow__header">
            <div>
              <h2>{{ t("story.personalizeTitle") }}</h2>
              <p>{{ t("story.personalizeDesc") }}</p>
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
                <h3>{{ t("story.setProtagonist") }}</h3>
              </div>

              <div class="story-form-stack">
                <label class="story-field">
                  <span>{{ t("story.protagonistName") }}</span>
                  <input v-model="protagonistName" :placeholder="t('story.protagonistNamePlaceholder')" type="text" />
                </label>

                <div class="story-field">
                  <span>{{ t("story.selectRoleType") }}</span>
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
                  <span>{{ t("story.customRoleIdentity") }}</span>
                  <input
                    v-model="customRole"
                    :placeholder="t('story.customRolePlaceholder')"
                    :disabled="!isCustomRoleSelected"
                    :class="{ 'is-disabled': !isCustomRoleSelected }"
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
                <h3>{{ t("story.selectStoryScene") }}</h3>
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
                <span>{{ t("story.customSceneDesc") }}</span>
                <textarea
                  v-model="customScene"
                  :placeholder="t('story.customScenePlaceholder')"
                  :disabled="!isCustomSceneSelected"
                  :class="{ 'is-disabled': !isCustomSceneSelected }"
                ></textarea>
              </label>
            </section>

            <section class="story-card story-card--details">
              <div class="story-card__title-row">
                <div class="story-card__title-main">
                  <div class="story-card__icon story-card__icon--tertiary">
                    <span class="material-symbols-outlined">auto_stories</span>
                  </div>
                  <h3>{{ t("story.storyDetailsTitle") }}</h3>
                </div>
                <button
                  type="button"
                  class="story-card__link"
                  @click="handleOpenBookshelf"
                >
                  <span>{{ t("story.myBookshelf") }}</span>
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <div class="detail-grid">
                <div class="detail-column">
                  <div class="story-field story-field--keywords">
                    <span>{{ t("story.plotKeywords") }}</span>
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
                        {{ t("story.addTag") }}
                      </button>
                    </div>
                    <input
                      v-model="keyword"
                      :placeholder="t('story.keywordPlaceholder')"
                      type="text"
                      @keyup.enter="addKeyword"
                    />
                  </div>

                  <button type="button" class="generate-button" @click="handleGenerate">
                    {{ t("story.generateStory") }}
                    <span class="material-symbols-outlined">bolt</span>
                  </button>
                </div>

                <label class="story-field story-field--outline">
                  <span>{{ t("story.storyDescription") }}</span>
                  <textarea
                    v-model="storyOutline"
                    :placeholder="t('story.storyDescPlaceholder')"
                  ></textarea>
                </label>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>

    <div
      v-if="showBookshelfModal"
      class="story-bookshelf-modal"
      @click="closeBookshelfModal"
    >
      <div
        class="story-bookshelf-modal__panel"
        @click.stop
      >
        <div class="story-bookshelf-modal__topbar">
          <div class="story-bookshelf-modal__title">
            <span class="material-symbols-outlined">auto_stories</span>
            <h3>{{ t("story.myBookshelf") }}</h3>
          </div>
          <button
            type="button"
            class="story-bookshelf-modal__close"
            @click="closeBookshelfModal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="story-bookshelf-modal__body">
          <div v-if="bookshelfLoading" class="story-bookshelf-modal__empty">书架加载中...</div>
          <div v-else-if="bookshelfList.length === 0" class="story-bookshelf-modal__empty">暂无书架内容</div>
          <div v-else class="story-bookshelf-grid">
            <article
              v-for="book in bookshelfList"
              :key="book.id"
              class="story-bookshelf-card"
              @click="handleOpenBookshelfBook(book)"
            >
              <div class="story-bookshelf-card__cover">
                <div
                  class="story-bookshelf-card__cover-surface"
                  :style="getBookshelfCoverStyle(book)"
                ></div>
              </div>
              <h4>{{ book.title }}</h4>
              <p>{{ book.date }}</p>
            </article>
          </div>
        </div>

        <div class="story-bookshelf-modal__footer">
          <button
            type="button"
            class="story-bookshelf-modal__btn"
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
import { resolveStoryBookshelfCover } from "~/utils/storyBookshelfCover";

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  {
    embedded: false,
  }
);

const emit = defineEmits<{
  (event: "generated", payload: { bookId: string }): void;
  (event: "open-book", payload: { bookId: string }): void;
}>();

const { t } = useI18n();
const { creatBook, getBookList, createAiChatChapters } = aiAdmin();
const embedded = computed(() => props.embedded);

useHead({
  title: computed(() => t("story.heroTitle")),
  htmlAttrs: {},
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

interface BookshelfItem {
  id: string;
  title: string;
  date: string;
  coverUrl: string;
}

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDwYcturX7qIuQB2oYeWkRB56ep6tkvdJIkDy6XwB4XtYIccfsKqR8IsZjdyxYxG0IL7cDldkMQfYp_Z3SWA1uS3qKYxYnYhX4DQ2ylEYCDXz7aoc-ls5FvEIliJus5cl7uS-SrMxsKuYkQYjf4x1uNAyyojedXPsL1s0NzStaZ-EmMtbhrjEXLLS-VHGze518DZJFJ7zMGi7ilS6m5wHaNB2dTQbl2t6KnMxQUqnwbRrZe-4I3X-rh2yCR0Bv5jt4RR35uJE4yZRE";
const FOREST_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAbJzOtF5w13TZ-R-AF4jq86sMzoQlSCLNdqupcOybY2p7jdSun1QMxPygkpsxNfbS2gu5q9twbciA5yuagibVJQwVf3-V-EhvSPWQQdO4KgMhbaJ5_fBCTlRlTsF4VigJcHgYCPHAs1qLVSRybSJ-_-zfJfKxIwhAigBimHZlI6lPHJDGIDeKNCbbfxAfxmLcyjJ-9Vv92tuHa3jjYZbpMDZPzo1SixJb3kdlBLkuerTelE3wi1xITg2ZmKFpPM_dFbVXZ-A1pa5w";
const SPACE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBZbwPQmDGtRCarth996M_lO8DoQixmApJJkU-tlWbrF8FERSK49kGfAfZqm1djVtVkCgDa2Xn1yMpTjN5oPwGaCMkvWqsrZwEJEn1yVczuUxgH6-8zQCFfunFUFsMkBZtwoI8IJQttf53sTw1Fw1HcnWfPPff3VqA5eABsOCVWNkpBTvAcm5qhnZ5Ib0Xf1AajUBVaok-_pMi7uPtxQv4V-ngeOL7UWeBrg3UX-6d1ffru3HTYbNe-l63bRInwpbGQzPoOBICniTQ";

const roles = computed<StoryRole[]>(() => [
  { key: "hero", label: t("story.roleHero"), icon: "shield" },
  { key: "princess", label: t("story.rolePrincess"), icon: "potted_plant" },
  { key: "robot", label: t("story.roleRobot"), icon: "smart_toy" },
  { key: "wizard", label: t("story.roleWizard"), icon: "auto_fix_high" },
  { key: "custom", label: t("story.roleCustom"), icon: "edit_note" },
]);

const scenes = computed<StoryScene[]>(() => [
  { key: "forest", label: t("story.sceneMagicForest"), en: t("story.sceneMagicForestEn"), image: FOREST_IMAGE },
  { key: "space", label: t("story.sceneDeepSpace"), en: t("story.sceneDeepSpaceEn"), image: SPACE_IMAGE },
  { key: "castle", label: t("story.sceneMysteriousCastle"), en: t("story.sceneMysteriousCastleEn"), image: HERO_IMAGE },
  { key: "custom", label: t("story.sceneCustom"), en: t("story.sceneCustomEn") },
]);

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
const storyTags = ref([t("story.tagCourage"), t("story.tagBetrayal"), t("story.tagAncientProphecy")]);
const storyOutline = ref("");
const isGeneratingStory = ref(false);
const isCustomRoleSelected = computed(() => selectedRole.value === "custom");
const isCustomSceneSelected = computed(() => selectedScene.value === "custom");
const showBookshelfModal = ref(false);
const bookshelfLoading = ref(false);
const bookshelfList = ref<BookshelfItem[]>([]);

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

const goToAICenter = () => {
  router.push("/system/opt");
};

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

const resolveStoryRoleType = () => {
  if (isCustomRoleSelected.value && customRole.value.trim()) {
    return "custom";
  }

  return selectedRole.value;
};

const resolveStoryRoleValue = () => {
  const selectedRoleOption = roles.value.find(role => role.key === selectedRole.value);
  if (isCustomRoleSelected.value && customRole.value.trim()) {
    return customRole.value.trim();
  }
  return selectedRoleOption?.label || t("story.roleHero");
};

const resolveStorySceneValue = () => {
  if (isCustomSceneSelected.value && customScene.value.trim()) {
    return customScene.value.trim();
  }

  const selectedSceneOption = scenes.value.find(scene => scene.key === selectedScene.value);
  return selectedSceneOption?.label || t("story.sceneMagicForest");
};

const resolveCreatedBookId = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;
  const candidateKeys = [
    "bookId",
    "book_id",
    "id",
    "dataId",
  ];

  for (const key of candidateKeys) {
    const value = String(record[key] ?? "").trim();
    if (value) {
      return value;
    }
  }

  return "";
};

const resolveGeneratedChapterId = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;
  const candidateKeys = ["chapterId", "chapter_id", "id"];

  for (const key of candidateKeys) {
    const value = String(record[key] ?? "").trim();
    if (value) {
      return value;
    }
  }

  return "";
};

const extractGeneratedStoryResult = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return {
      content: String(payload || "").trim(),
      chapterId: "",
    };
  }

  const record = payload as Record<string, unknown>;
  const nestedPayload =
    (record.data && typeof record.data === "object"
      ? record.data
      : record) as Record<string, unknown>;
  const content = String(
    record.text ||
      nestedPayload.content ||
      nestedPayload.storyContent ||
      nestedPayload.chapterContent ||
      "",
  ).trim();

  return {
    content,
    chapterId: resolveGeneratedChapterId(nestedPayload) || resolveGeneratedChapterId(record),
  };
};

const handleOpenBookshelf = () => {
  showBookshelfModal.value = true;
  void fetchBookshelfList();
};

const closeBookshelfModal = () => {
  showBookshelfModal.value = false;
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
    const text = String(value ?? "").trim();
    if (text) {
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

const formatBookshelfDate = (value: unknown) => {
  const text = String(value || "").trim();
  if (!text) return "--";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeBookshelfList = (rows: unknown): BookshelfItem[] => {
  return unwrapRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item, index) => {
      const rowMap = createLowerCaseMap(item);
      const title = String(pickByKeys(rowMap, ["title", "bookTitle", "name"]) || "未命名故事").trim();
      return {
        id: String(pickByKeys(rowMap, ["bookId", "book_id", "id"]) || `book-${index}`).trim(),
        title,
        date: formatBookshelfDate(
          pickByKeys(rowMap, ["createTime", "createdAt", "updateTime", "updatedAt", "time"])
        ),
        coverUrl: resolveStoryBookshelfCover(item, index, title),
      };
    });
};

const fetchBookshelfList = async () => {
  if (bookshelfLoading.value) return;

  try {
    bookshelfLoading.value = true;
    const rows = await getBookList({
      pageSize: "12",
      pageNum: "1",
      orderByColumn: "createTime",
      isAsc: "desc",
      title: "",
    });
    bookshelfList.value = normalizeBookshelfList(rows);
  } catch (error) {
    console.error("story 读取书架失败:", error);
    bookshelfList.value = [];
    ElMessage.error(error instanceof Error && error.message ? error.message : "读取书架失败");
  } finally {
    bookshelfLoading.value = false;
  }
};

const getBookshelfCoverStyle = (book: BookshelfItem) => ({
  background: undefined,
  backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined,
  backgroundSize: "cover",
  backgroundPosition: "center",
});

const handleOpenBookshelfBook = async (book: BookshelfItem) => {
  if (!book.id) return;

  try {
    closeBookshelfModal();
    if (embedded.value) {
      emit("open-book", { bookId: book.id });
      return;
    }
    await router.push({
      path: "/system/opt/story/storyreading",
      query: {
        bookId: book.id,
      },
    });
  } catch (error) {
    console.error("story 打开书架故事失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : "打开书架故事失败");
  }
};

const handleGenerate = async () => {
  if (isGeneratingStory.value) return;

  const roleName = protagonistName.value.trim();
  if (!roleName) {
    ElMessage.warning(t("story.protagonistNamePlaceholder"));
    return;
  }

  if (!storyTags.value.length) {
    ElMessage.warning(t("story.selectAtLeastOneKeyword"));
    return;
  }

  const selectedRoleOption = roles.value.find(role => role.key === selectedRole.value);
  const selectedSceneOption = scenes.value.find(scene => scene.key === selectedScene.value);
  const payload: StoryDraftPayload = {
    protagonistName: roleName,
    customRole: customRole.value.trim(),
    roleKey: selectedRole.value,
    roleLabel: selectedRoleOption?.label || t("story.roleHero"),
    sceneKey: selectedScene.value,
    sceneLabel: selectedSceneOption?.label || t("story.sceneMagicForest"),
    customScene: customScene.value.trim(),
    tags: [...storyTags.value],
    outline: storyOutline.value.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    isGeneratingStory.value = true;
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORY_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    }

    const response = await creatBook({
      roleName,
      roleType: resolveStoryRoleValue(),
      storyScene: resolveStorySceneValue(),
      storyKeywords: [...storyTags.value] as [string],
      storyDesc: storyOutline.value.trim(),
      autoGenerateFirstChapter: true,
    });

    const bookId = resolveCreatedBookId(response);
    if (!bookId) {
      throw new Error("创建故事书成功，但未返回 bookId");
    }

    let generatedContent = "";
    const generateResponse = await createAiChatChapters(
      {
        bookId,
        enableThinking: false,
      },
      {
        onChunk: (_payload, fullText) => {
          generatedContent = fullText;
        },
      },
    );
    const generatedResult = extractGeneratedStoryResult(generateResponse);
    generatedContent = generatedResult.content || generatedContent;

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        STORY_DRAFT_STORAGE_KEY,
        JSON.stringify({
          ...payload,
          bookId,
          chapterId: generatedResult.chapterId,
          generatedContent,
          pendingGenerate: false,
        } satisfies StoryDraftPayload),
      );
    }

    if (embedded.value) {
      emit("generated", { bookId });
      return;
    }

    await router.push({
      path: "/system/opt/story/storyreading",
      query: {
        bookId,
      },
    });
  } catch (error) {
    console.error("story 创建故事书失败:", error);
    ElMessage.error(error instanceof Error && error.message ? error.message : t("story.enterReadingFailed"));
  } finally {
    isGeneratingStory.value = false;
  }
};

watch(selectedRole, (value) => {
  if (value !== "custom") {
    customRole.value = "";
  }
});

watch(selectedScene, (value) => {
  if (value !== "custom") {
    customScene.value = "";
  }
});

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

.story-page--embedded {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: auto;
}

.story-page--embedded .story-shell {
  width: 100%;
  min-width: 0;
  max-width: none;
  padding: 20px 20px 28px;
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

.story-breadcrumb__link {
  border: none;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.story-breadcrumb__link:hover {
  color: #005bc2;
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
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.story-card__title-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.story-card__title-row h3 {
  margin: 0;
  color: #2d3337;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.story-card__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 0;
  color: #0a6bda;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}

.story-card__link .material-symbols-outlined {
  width: auto;
  height: auto;
  font-size: 16px;
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

.story-field input.is-disabled,
.story-field textarea.is-disabled {
  cursor: not-allowed;
  background: #eef2f5;
  color: #a1a9b3;
  box-shadow: none;
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

.story-bookshelf-modal {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(10px);
}

.story-bookshelf-modal__panel {
  width: min(960px, 100%);
  max-height: min(86vh, 900px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 40px 100px rgba(0, 91, 194, 0.08);
}

.story-bookshelf-modal__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 28px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.story-bookshelf-modal__title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.story-bookshelf-modal__title h3 {
  margin: 0;
  color: #2d3337;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.story-bookshelf-modal__title .material-symbols-outlined {
  width: auto;
  height: auto;
  color: #0a6bda;
  font-size: 28px;
  font-variation-settings: "FILL" 1;
}

.story-bookshelf-modal__close {
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

.story-bookshelf-modal__close:hover {
  background: #e3e9ec;
}

.story-bookshelf-modal__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 28px;
}

.story-bookshelf-modal__empty {
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  padding: 48px 0;
}

.story-bookshelf-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}

.story-bookshelf-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
}

.story-bookshelf-card__cover {
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 16px;
  background: #eef2f7;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
}

.story-bookshelf-card__cover-surface {
  width: 100%;
  height: 100%;
}

.story-bookshelf-card h4 {
  margin: 0;
  color: #2d3337;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;
}

.story-bookshelf-card p {
  margin: 0;
  color: #596063;
  font-size: 12px;
  font-weight: 700;
}

.story-bookshelf-modal__footer {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.9);
  background: #ffffff;
}

.story-bookshelf-modal__btn {
  min-width: 132px;
  min-height: 48px;
  padding: 0 28px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #0f5fbd 0%, #0a6bda 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(0, 91, 194, 0.2);
  cursor: pointer;
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

  .story-bookshelf-grid {
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
