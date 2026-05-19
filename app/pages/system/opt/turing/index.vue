<template>
  <div ref="turingPageRef" class="turing-page" :style="pageAdaptiveStyle">
    <div class="page-header">
      <nav class="turing-breadcrumb" :aria-label="t('turingPage.breadcrumbAria')">
        <button type="button" class="turing-breadcrumb__link" @click="handleBackToAiCenter">
          {{ t("turingPage.aiPracticeCenter") }}
        </button>
        <span class="turing-breadcrumb__separator">/</span>
        <span class="turing-breadcrumb__current">{{ t("turingPage.currentPage") }}</span>
      </nav>
    </div>

    <div class="content-area">
      <main class="turing-shell">
        <section class="turing-hero">
          <div class="turing-hero__media">
            <img
              class="turing-hero__portrait"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV2YYYkoh6h35pfFPdfuZZoNIWbD2d_THjHgdOCRHLc7onLhVNa0ilq-CzGED0uNasSCfoFXsuNv3OPa9MxrVCGCOPl39dwnw-xMWH9mdE_YFCwbJjdsnYyJTtJO07gYtm3lQM6KQMcxN8SQxYFYc5TUUFr66bkRrsQqu4QmPEO6vEBH7FMT0gCyQd55EYA37WUtKCEb0kpAMjC6ZK116xlRj8D1ghK16MAKaWVy80PGC2KwwxfjBiq8-Adui14Zs55z7amzI9DM4"
              :alt="t('turingPage.heroPortraitAlt')"
            />
          </div>

          <div class="turing-hero__copy">
            <h1>{{ t("turingPage.heroTitle") }}</h1>
            <p>{{ t("turingPage.heroDesc") }}</p>
            <button type="button" class="turing-hero__cta" @click="handleStartTest">
              {{ t("turingPage.startNow") }}
            </button>
          </div>
        </section>

        <section class="turing-section">
          <div class="turing-section__head">
            <div>
              <h2>{{ t("turingPage.coreConceptsTitle") }}</h2>
              <p>{{ t("turingPage.coreConceptsDesc") }}</p>
            </div>
          </div>

          <div class="turing-grid">
            <article class="turing-card turing-card--large">
              <div class="turing-card__icon turing-card__icon--secondary">
                <span class="material-symbols-outlined">extension</span>
              </div>
              <h3>{{ t("turingPage.cards.imitationGame.title") }}</h3>
              <p>{{ t("turingPage.cards.imitationGame.desc") }}</p>
            </article>

            <article class="turing-card turing-card--accent">
              <div class="turing-card__icon turing-card__icon--tertiary">
                <span class="material-symbols-outlined">bolt</span>
              </div>
              <h3>{{ t("turingPage.cards.cognitiveBlindSpots.title") }}</h3>
              <p>{{ t("turingPage.cards.cognitiveBlindSpots.desc") }}</p>
            </article>

            <article class="turing-card">
              <div class="turing-card__icon turing-card__icon--primary">
                <span class="material-symbols-outlined">interpreter_mode</span>
              </div>
              <h3>{{ t("turingPage.cards.languageFluency.title") }}</h3>
              <p>{{ t("turingPage.cards.languageFluency.desc") }}</p>
            </article>

            <article class="turing-card turing-card--horizontal">
              <div class="turing-card__horizontal-copy">
                <h3>{{ t("turingPage.cards.agiPath.title") }}</h3>
                <p>{{ t("turingPage.cards.agiPath.desc") }}</p>
              </div>
              <div class="turing-card__thumb">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAD51J7yWNz4OsSDw2qbzLeHodKHlgI_NTBK1blj0LWPAdoJYxGS2RQnAV4yKSmrMJ9veGMm28y3SdGujqpoQnkXuT4PbP9slz0GLgXs-P47y5PHa2dcc-x6Q24pW4klnZQ8c3_r5FNEdxNaruox_QECoLmDSbAnVUHBOgeq0kWZNqbcmjpepo7BfA8CFhDDUrspARVOi9rn5a8gi1JQ0p1GWj39liVWW6Sp6zP3slPTWLqrVmh0gu4hDl-UA5qp9lEhGDX9w-DOVY"
                  :alt="t('turingPage.agiImageAlt')"
                />
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

definePageMeta({
  layout: "sidebar",
});

const router = useRouter();
const { t } = useI18n();
const turingPageRef = ref<HTMLElement | null>(null);
const turingLayoutWidth = ref(1360);
let turingResizeObserver: ResizeObserver | null = null;

useHead({
  title: computed(() => t("turingPage.pageTitle")),
  htmlAttrs: {},
});

const getTuringLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = turingPageRef.value?.clientWidth || 0;
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

const syncTuringLayoutWidth = () => {
  turingLayoutWidth.value = getTuringLayoutWidth();
};

const turingShellWidth = computed(() => {
  if (turingLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(turingLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(turingLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--turing-shell-width": turingShellWidth.value,
}));

const handleBackToAiCenter = async () => {
  await router.push("/system/opt");
};

const handleStartTest = async () => {
  await router.push("/system/opt/turing/test");
};

onMounted(() => {
  if (typeof window === "undefined") return;

  syncTuringLayoutWidth();
  window.addEventListener("resize", syncTuringLayoutWidth, { passive: true });

  if (window.ResizeObserver && turingPageRef.value) {
    turingResizeObserver = new window.ResizeObserver(() => {
      syncTuringLayoutWidth();
    });
    turingResizeObserver.observe(turingPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncTuringLayoutWidth);
  turingResizeObserver?.disconnect();
  turingResizeObserver = null;
});
</script>

<style scoped>
.turing-page,
.turing-page * {
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

.turing-page {
  min-height: calc(100vh - 70px);
  padding: 24px 0 56px;
  background: #f7f9fb;
  color: #2d3337;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--turing-shell-width));
  margin: 0 auto;
}

.page-header {
  padding: 0 30px 16px;
}

.content-area {
  padding: 0 30px;
}

.turing-shell {
  width: 100%;
}

.turing-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8790;
  font-size: 13px;
}

.turing-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.turing-breadcrumb__link:hover {
  color: #005bc4;
}

.turing-breadcrumb__separator {
  color: #b5bfd0;
}

.turing-breadcrumb__current {
  color: #2d3337;
  font-weight: 600;
}

.turing-hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 42px;
  min-height: 320px;
  margin-bottom: 40px;
  padding: 0 48px;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(135deg, #005bc4 0%, #004fad 100%);
  box-shadow: 0 20px 44px rgba(0, 91, 196, 0.16);
}

.turing-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.1;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
  background-size: 40px 40px;
}

.turing-hero__media,
.turing-hero__copy {
  position: relative;
  z-index: 1;
}

.turing-hero__media {
  flex: 0 0 160px;
}

.turing-hero__portrait {
  width: 160px;
  height: 160px;
  object-fit: contain;
  border-radius: 999px;
  padding: 8px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.turing-hero__copy {
  flex: 1;
}

.turing-hero__copy h1 {
  margin: 0 0 14px;
  color: #f9f8ff;
  font-size: 52px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.turing-hero__copy p {
  max-width: 780px;
  margin: 0;
  color: #a5c1ff;
  font-size: 18px;
  line-height: 1.8;
  font-weight: 300;
}

.turing-hero__cta {
  margin-top: 24px;
  height: 48px;
  padding: 0 28px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #005bc4;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.14);
}

.turing-section__head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.turing-section__head h2 {
  margin: 0 0 4px;
  font-size: 30px;
  font-weight: 800;
  color: #2d3337;
}

.turing-section__head p {
  margin: 0;
  color: #596063;
  font-size: 14px;
}

.turing-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 20px;
}

.turing-card {
  grid-column: span 4;
  padding: 24px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
}

.turing-card:hover {
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.08);
}

.turing-card--large {
  grid-column: span 8;
}

.turing-card--accent {
  background: rgba(105, 246, 184, 0.12);
  border-color: rgba(0, 109, 74, 0.08);
}

.turing-card--horizontal {
  grid-column: span 8;
  display: flex;
  align-items: center;
  gap: 24px;
}

.turing-card__icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.turing-card__icon--secondary {
  background: rgba(255, 216, 231, 0.7);
  color: #a53173;
}

.turing-card__icon--tertiary {
  background: rgba(105, 246, 184, 0.7);
  color: #006d4a;
}

.turing-card__icon--primary {
  background: rgba(165, 193, 255, 0.4);
  color: #005bc4;
}

.turing-card h3 {
  margin: 0 0 10px;
  color: #2d3337;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 800;
}

.turing-card--horizontal h3,
.turing-card--accent h3 {
  font-size: 22px;
}

.turing-card p {
  margin: 0;
  color: #596063;
  font-size: 14px;
  line-height: 1.8;
}

.turing-card__horizontal-copy {
  flex: 1;
}

.turing-card__thumb {
  width: 144px;
  height: 96px;
  overflow: hidden;
  border-radius: 16px;
  background: #f1f4f6;
  flex-shrink: 0;
}

.turing-card__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 1500px) {
  .page-header,
  .content-area {
    padding-left: 24px;
    padding-right: 24px;
  }

  .turing-hero__copy h1 {
    font-size: 44px;
  }
}

@media (max-width: 1180px) {
  .turing-hero {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 36px;
    padding-bottom: 36px;
  }

  .turing-grid,
  .turing-card,
  .turing-card--large,
  .turing-card--horizontal,
  .turing-card--accent {
    grid-column: span 12;
  }

  .turing-card--horizontal {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
