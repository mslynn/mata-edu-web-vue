<template>
  <div ref="turingTestPageRef" class="turing-test-page" :style="pageAdaptiveStyle">
    <div class="page-header">
      <nav class="turing-test-breadcrumb" :aria-label="t('turingWorkbench.breadcrumbAria')">
        <button type="button" class="turing-test-breadcrumb__link" @click="handleBackToAiCenter">
          {{ t("turingWorkbench.aiPracticeCenter") }}
        </button>
        <span class="turing-test-breadcrumb__separator">/</span>
        <button type="button" class="turing-test-breadcrumb__link" @click="handleBackToTuringIntro">
          {{ t("turingWorkbench.currentPage") }}
        </button>
        <span class="turing-test-breadcrumb__separator">/</span>
        <span class="turing-test-breadcrumb__current">{{ t("turingWorkbench.currentStage") }}</span>
      </nav>
    </div>

    <div class="content-area">
      <main class="turing-test-shell">
        <TuringQuizWorkbenchPage />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import TuringQuizWorkbenchPage from "~/components/turing/TuringQuizWorkbenchPage.vue";

definePageMeta({
  layout: "sidebar",
});

const router = useRouter();
const { t } = useI18n();
const turingTestPageRef = ref<HTMLElement | null>(null);
const turingTestLayoutWidth = ref(1360);
let turingTestResizeObserver: ResizeObserver | null = null;

useHead({
  title: computed(() => t("turingWorkbench.pageTitle")),
  htmlAttrs: {},
});

const getTuringTestLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = turingTestPageRef.value?.clientWidth || 0;
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

const syncTuringTestLayoutWidth = () => {
  turingTestLayoutWidth.value = getTuringTestLayoutWidth();
};

const turingTestShellWidth = computed(() => {
  if (turingTestLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(turingTestLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(turingTestLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--turing-test-shell-width": turingTestShellWidth.value,
}));

const scrollTuringTestPageToTop = () => {
  if (typeof window === "undefined") return;

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  const sidebarShell = document.querySelector(".sidebar-shell");
  if (sidebarShell instanceof HTMLElement) {
    sidebarShell.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  const sidebarContent = document.querySelector(".sidebar-shell-content");
  if (sidebarContent instanceof HTMLElement) {
    sidebarContent.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
};

const handleBackToTuringIntro = async () => {
  await router.push("/system/opt/turing");
};

const handleBackToAiCenter = async () => {
  await router.push("/system/opt");
};

onMounted(() => {
  if (typeof window === "undefined") return;

  nextTick(() => {
    scrollTuringTestPageToTop();
  });

  syncTuringTestLayoutWidth();
  window.addEventListener("resize", syncTuringTestLayoutWidth, { passive: true });

  if (window.ResizeObserver && turingTestPageRef.value) {
    turingTestResizeObserver = new window.ResizeObserver(() => {
      syncTuringTestLayoutWidth();
    });
    turingTestResizeObserver.observe(turingTestPageRef.value);
  }
});

onActivated(() => {
  nextTick(() => {
    scrollTuringTestPageToTop();
  });
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncTuringTestLayoutWidth);
  turingTestResizeObserver?.disconnect();
  turingTestResizeObserver = null;
});
</script>

<style scoped>
.turing-test-page,
.turing-test-page * {
  box-sizing: border-box;
}

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
  font-style: normal;
  font-weight: 400;
  font-size: 22px;
  line-height: 1;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.turing-test-page {
  min-height: calc(100vh - 70px);
  padding: 24px 0 40px;
  background: #f7f9fb;
  color: #2d3337;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--turing-test-shell-width));
  margin: 0 auto;
}

.page-header {
  padding: 0 30px 12px;
}

.content-area {
  padding: 0 30px;
}

.turing-test-shell {
  width: 100%;
}

.turing-test-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8790;
  font-size: 13px;
}

.turing-test-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.turing-test-breadcrumb__link:hover {
  color: #005bc4;
}

.turing-test-breadcrumb__separator {
  color: #b5bfd0;
}

.turing-test-breadcrumb__current {
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
