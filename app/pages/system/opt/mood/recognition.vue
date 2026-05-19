<template>
  <div ref="moodRecognitionPageRef" class="mood-recognition-page" :style="pageAdaptiveStyle">
    <div class="page-header">
      <nav class="mood-recognition-breadcrumb" :aria-label="t('moodWorkbench.breadcrumbAria')">
        <button type="button" class="mood-recognition-breadcrumb__link" @click="handleBackToAiCenter">
          {{ t("moodWorkbench.aiPracticeCenter") }}
        </button>
        <span class="mood-recognition-breadcrumb__separator">/</span>
        <button type="button" class="mood-recognition-breadcrumb__link" @click="handleBackToIntro">
          {{ t("moodWorkbench.currentPage") }}
        </button>
        <span class="mood-recognition-breadcrumb__separator">/</span>
        <span class="mood-recognition-breadcrumb__current">{{ t("moodWorkbench.currentStage") }}</span>
      </nav>
    </div>

    <div class="content-area">
      <main class="mood-recognition-shell">
        <MoodRecognitionWorkbenchPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import MoodRecognitionWorkbenchPage from "~/components/mood/MoodRecognitionWorkbenchPage.vue";

definePageMeta({
  layout: "sidebar",
});

const router = useRouter();
const { t } = useI18n();

const moodRecognitionPageRef = ref<HTMLElement | null>(null);
const moodRecognitionLayoutWidth = ref(1360);
let moodRecognitionResizeObserver: ResizeObserver | null = null;

useHead({
  title: computed(() => t("moodWorkbench.pageTitle")),
  htmlAttrs: {},
});

const getMoodRecognitionLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = moodRecognitionPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter((width) => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);

  return Math.max(1280, Math.round(boundedWidth));
};

const syncMoodRecognitionLayoutWidth = () => {
  moodRecognitionLayoutWidth.value = getMoodRecognitionLayoutWidth();
};

const moodRecognitionShellWidth = computed(() => {
  if (moodRecognitionLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(moodRecognitionLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(moodRecognitionLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--mood-recognition-shell-width": moodRecognitionShellWidth.value,
}));

const handleBackToAiCenter = async () => {
  await router.push("/system/opt");
};

const handleBackToIntro = async () => {
  await router.push("/system/opt/mood");
};

const scrollRecognitionPageToTop = () => {
  if (typeof window === "undefined") return;

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const sidebarShell = moodRecognitionPageRef.value?.closest(".sidebar-shell") as HTMLElement | null;
  if (sidebarShell) {
    sidebarShell.scrollTo({ top: 0, left: 0, behavior: "auto" });
    sidebarShell.scrollTop = 0;
  }
};

onMounted(() => {
  if (typeof window === "undefined") return;

  syncMoodRecognitionLayoutWidth();
  scrollRecognitionPageToTop();
  requestAnimationFrame(() => {
    scrollRecognitionPageToTop();
  });
  window.addEventListener("resize", syncMoodRecognitionLayoutWidth, { passive: true });
  window.visualViewport?.addEventListener("resize", syncMoodRecognitionLayoutWidth);

  if (window.ResizeObserver && moodRecognitionPageRef.value) {
    moodRecognitionResizeObserver = new window.ResizeObserver(() => {
      syncMoodRecognitionLayoutWidth();
    });
    moodRecognitionResizeObserver.observe(moodRecognitionPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncMoodRecognitionLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncMoodRecognitionLayoutWidth);
  moodRecognitionResizeObserver?.disconnect();
  moodRecognitionResizeObserver = null;
});
</script>

<style scoped>
.mood-recognition-page,
.mood-recognition-page * {
  box-sizing: border-box;
}

.mood-recognition-page {
  min-height: calc(100vh - 70px);
  padding: 24px 0 40px;
  background: #f7f9fb;
  color: #2d3337;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--mood-recognition-shell-width));
  margin: 0 auto;
}

.page-header {
  padding: 0 30px 12px;
}

.content-area {
  padding: 0 30px;
}

.mood-recognition-shell {
  width: 100%;
}

.mood-recognition-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8790;
  font-size: 13px;
}

.mood-recognition-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #005bc4;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.mood-recognition-breadcrumb__link:hover {
  color: #2d3337;
}

.mood-recognition-breadcrumb__separator {
  color: #b5bfd0;
}

.mood-recognition-breadcrumb__current {
  color: #2d3337;
  font-weight: 600;
}

@media (max-width: 1500px) {
  .page-header,
  .content-area {
    padding-left: 24px;
    padding-right: 24px;
  }
}
</style>
