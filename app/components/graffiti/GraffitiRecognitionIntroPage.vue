<template>
  <div
    ref="graffitiPageRef"
    class="graffiti-page"
    :style="pageAdaptiveStyle"
  >
    <div class="page-header">
      <nav
        class="graffiti-breadcrumb"
        :aria-label="t('graffitiRecognition.breadcrumbAria')"
      >
        <button
          type="button"
          class="graffiti-breadcrumb__link"
          @click="handleBackToAiCenter"
        >
          {{ t("graffitiRecognition.aiPracticeCenter") }}
        </button>
        <span class="graffiti-breadcrumb__separator">/</span>
        <span class="graffiti-breadcrumb__current">
          {{ t("graffitiRecognition.doodleRecognition") }}
        </span>
      </nav>
    </div>

    <div class="content-area">
      <div class="graffiti-shell">
      <main class="graffiti-main">
        <section class="graffiti-hero">
          <div class="graffiti-hero__intro">
            <div class="graffiti-hero__copy">
              <h1>{{ t("graffitiRecognition.heroTitle") }}</h1>
              <p>{{ t("graffitiRecognition.heroDesc") }}</p>

              <button type="button" class="graffiti-primary-btn">
                {{ t("graffitiRecognition.startExperience") }}
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div
              class="graffiti-hero__visual"
              :aria-label="t('graffitiRecognition.visualAriaLabel')"
            >
              <img
                class="graffiti-hero__image"
                :src="heroImage"
                :alt="t('graffitiRecognition.heroImageAlt')"
              />
            </div>
          </div>
        </section>

        <section class="graffiti-overview">
          <div class="graffiti-overview__content">
            <div class="graffiti-section-head">
              <h2>{{ t("graffitiRecognition.whatIsTitle") }}</h2>
              <div class="graffiti-section-head__line"></div>
            </div>

            <p>{{ t("graffitiRecognition.whatIsDesc1") }}</p>
            <p>{{ t("graffitiRecognition.whatIsDesc2") }}</p>

            <div class="graffiti-stats">
              <article class="graffiti-stat-card graffiti-stat-card--secondary">
                <strong>345+</strong>
                <span>{{ t("graffitiRecognition.statCategories") }}</span>
              </article>
              <article class="graffiti-stat-card graffiti-stat-card--tertiary">
                <strong>50M+</strong>
                <span>{{ t("graffitiRecognition.statDrawings") }}</span>
              </article>
            </div>
          </div>

          <aside class="graffiti-overview__visual">
            <div class="graffiti-overview__image-card">
              <img
                :src="overviewImage"
                :alt="t('graffitiRecognition.overviewImageAlt')"
              />
            </div>
          </aside>
        </section>
      </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

useHead({
  title: computed(() => t("graffitiRecognition.pageTitle")),
  htmlAttrs: {},
});

const graffitiPageRef = ref<HTMLElement | null>(null);
const graffitiLayoutWidth = ref(1360);
let graffitiResizeObserver: ResizeObserver | null = null;

const heroImage = "/images/ai-practice/graffiti-hero.svg";

const overviewImage = "/images/ai-practice/55555.png";

const getGraffitiLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = graffitiPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(
    width => width > 0
  );
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);

  return Math.max(1280, Math.round(boundedWidth));
};

const syncGraffitiLayoutWidth = () => {
  graffitiLayoutWidth.value = getGraffitiLayoutWidth();
};

const graffitiShellWidth = computed(() => {
  if (graffitiLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(graffitiLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(graffitiLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--graffiti-shell-width": graffitiShellWidth.value,
}));

const handleBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};

onMounted(() => {
  if (typeof window === "undefined") return;

  syncGraffitiLayoutWidth();
  window.addEventListener("resize", syncGraffitiLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncGraffitiLayoutWidth);

  if (window.ResizeObserver && graffitiPageRef.value) {
    graffitiResizeObserver = new window.ResizeObserver(() => {
      syncGraffitiLayoutWidth();
    });
    graffitiResizeObserver.observe(graffitiPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncGraffitiLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncGraffitiLayoutWidth);
  graffitiResizeObserver?.disconnect();
  graffitiResizeObserver = null;
});
</script>

<style scoped>
.graffiti-page,
.graffiti-page * {
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
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.graffiti-page {
  min-height: calc(100vh - 70px);
  padding: 28px 0 72px;
  background: #f7f9fb;
  color: #2d3337;
  overflow-x: hidden;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--graffiti-shell-width));
  margin: 0 auto;
  box-sizing: border-box;
}

.page-header {
  padding: 0 32px 14px;
}

.content-area {
  padding: 0 32px;
}

.graffiti-shell {
  width: 100%;
}

.graffiti-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8790;
  font-size: 13px;
  font-weight: 500;
}

.graffiti-breadcrumb__separator {
  color: #b5bfd0;
}

.graffiti-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.graffiti-breadcrumb__link:hover {
  color: #005bc2;
}

.graffiti-breadcrumb__current {
  color: #2d3337;
  font-weight: 600;
}

.graffiti-main {
  width: 100%;
}

.graffiti-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  min-height: 248px;
  padding: 34px 38px;
  border-radius: 24px;
  background: linear-gradient(135deg, #005bc4 0%, #1a69d2 55%, #2571d8 100%);
  box-shadow: 0 14px 34px rgba(0, 91, 196, 0.14);
}

.graffiti-hero::before,
.graffiti-hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  filter: blur(110px);
  opacity: 0.24;
  pointer-events: none;
}

.graffiti-hero::before {
  width: 240px;
  height: 240px;
  left: 42px;
  top: 20px;
  background: #6ad4ff;
}

.graffiti-hero::after {
  width: 320px;
  height: 320px;
  right: 36px;
  bottom: -68px;
  background: #8fa3ff;
}

.graffiti-hero__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  width: 100%;
}

.graffiti-hero__copy {
  position: relative;
  z-index: 1;
  max-width: 540px;
  color: #ffffff;
}

.graffiti-hero__copy h1 {
  margin: 0 0 16px;
  font-size: 52px;
  line-height: 1.08;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.graffiti-hero__copy p {
  max-width: 470px;
  margin: 0 0 24px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  line-height: 1.8;
}

.graffiti-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 124px;
  height: 44px;
  padding: 0 22px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #005bc4;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(0, 91, 194, 0.28);
}

.graffiti-primary-btn .material-symbols-outlined {
  width: auto;
  height: auto;
  font-size: 18px;
}

.graffiti-hero__visual {
  position: relative;
  z-index: 1;
  flex: 0 0 500px;
  min-width: 500px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
}

.graffiti-hero__image {
  width: min(100%, 480px);
  height: auto;
  max-height: 248px;
  object-fit: contain;
  object-position: right center;
  display: block;
}

.graffiti-overview {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 28px;
  align-items: start;
  margin-top: 28px;
}

.graffiti-section-head {
  margin-bottom: 18px;
}

.graffiti-section-head h2 {
  margin: 0 0 12px;
  color: #10233f;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.graffiti-section-head__line {
  width: 80px;
  height: 6px;
  border-radius: 999px;
  background: #a53173;
}

.graffiti-overview__content p {
  margin: 0 0 16px;
  color: #26374f;
  font-size: 17px;
  line-height: 1.8;
  text-indent: 2em;
}

.graffiti-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 26px;
}

.graffiti-stat-card {
  border-radius: 26px;
  padding: 30px 28px;
  box-shadow: 0 18px 36px rgba(16, 35, 63, 0.06);
}

.graffiti-stat-card strong {
  display: block;
  font-size: 42px;
  line-height: 1;
  font-weight: 900;
}

.graffiti-stat-card span {
  display: block;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.graffiti-stat-card--secondary {
  background: rgba(165, 49, 115, 0.12);
  border: 1px solid rgba(165, 49, 115, 0.18);
}

.graffiti-stat-card--secondary strong,
.graffiti-stat-card--secondary span {
  color: #a53173;
}

.graffiti-stat-card--tertiary {
  background: rgba(0, 109, 74, 0.12);
  border: 1px solid rgba(0, 109, 74, 0.18);
}

.graffiti-stat-card--tertiary strong,
.graffiti-stat-card--tertiary span {
  color: #006d4a;
}

.graffiti-overview__image-card {
  min-height: 420px;
  overflow: hidden;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(16, 35, 63, 0.06);
}

.graffiti-overview__image-card img {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  display: block;
}

@media (max-width: 1500px) {
  .page-header {
    padding-left: 24px;
    padding-right: 24px;
  }

  .content-area {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (max-width: 1180px) {
  .graffiti-hero__intro {
    flex-direction: column;
    align-items: flex-start;
  }

  .graffiti-hero__visual {
    min-width: 100%;
    width: 100%;
    justify-content: center;
  }

  .graffiti-overview {
    grid-template-columns: 1fr;
  }
}
</style>
