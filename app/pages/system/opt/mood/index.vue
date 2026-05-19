<template>
  <div ref="moodPageRef" class="mood-page" :style="pageAdaptiveStyle">
    <div class="page-header">
      <nav class="mood-breadcrumb" :aria-label="t('moodPage.breadcrumbAria')">
        <button type="button" class="mood-breadcrumb__link" @click="handleBackToAiCenter">
          {{ t("moodPage.aiPracticeCenter") }}
        </button>
        <span class="mood-breadcrumb__separator">/</span>
        <span class="mood-breadcrumb__current">{{ t("moodPage.currentPage") }}</span>
      </nav>
    </div>

    <div class="content-area">
      <main class="mood-shell">
        <section class="mood-hero">
          <div class="mood-hero__copy">
            <h1>{{ t("moodPage.title") }}</h1>
            <h2>{{ t("moodPage.englishTitle") }}</h2>
            <p>{{ t("moodPage.description") }}</p>
            <button type="button" class="mood-hero__cta" @click="handleStartExperience">
              <span>{{ t("moodPage.startExperience") }}</span>
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div class="mood-hero__media">
            <img
              class="mood-hero__image"
              :src="heroImage"
              :alt="t('moodPage.heroImageAlt')"
            />
          </div>
        </section>

        <section class="mood-overview">
          <article class="mood-summary-card">
            <div class="mood-summary-card__head">
              <div class="mood-summary-card__icon">
                <span class="material-symbols-outlined">sentiment_satisfied</span>
              </div>
              <span class="mood-summary-card__eyebrow">{{ t("moodPage.recognitionDepth") }}</span>
            </div>

            <div class="mood-summary-card__stat">{{ t("moodPage.supportedCount") }}</div>
            <div class="mood-summary-card__label">{{ t("moodPage.supportedLabel") }}</div>

            <div class="mood-tags">
              <span
                v-for="item in emotionTags"
                :key="item.key"
                class="mood-tag"
                :class="`mood-tag--${item.key}`"
              >
                {{ item.label }}
              </span>
            </div>
          </article>

          <section class="mood-scenarios">
            <div class="mood-scenarios__title">{{ t("moodPage.scenariosTitle") }}</div>

            <div class="mood-scenarios__grid">
              <article class="mood-scene-card mood-scene-card--education">
                <div class="mood-scene-card__media">
                  <span class="material-symbols-outlined">school</span>
                </div>
                <div class="mood-scene-card__body">
                  <div class="mood-scene-card__title">{{ t("moodPage.scenes.education.title") }}</div>
                  <p>{{ t("moodPage.scenes.education.desc") }}</p>
                </div>
              </article>

              <article class="mood-scene-card mood-scene-card--mental">
                <div class="mood-scene-card__media">
                  <span class="material-symbols-outlined">favorite</span>
                </div>
                <div class="mood-scene-card__body">
                  <div class="mood-scene-card__title">{{ t("moodPage.scenes.mental.title") }}</div>
                  <p>{{ t("moodPage.scenes.mental.desc") }}</p>
                </div>
              </article>

              <article class="mood-scene-card mood-scene-card--interaction mood-scene-card--wide">
                <div class="mood-scene-card__media mood-scene-card__media--wide">
                  <span class="material-symbols-outlined">smart_toy</span>
                </div>
                <div class="mood-scene-card__body">
                  <div class="mood-scene-card__title">{{ t("moodPage.scenes.interaction.title") }}</div>
                  <p>{{ t("moodPage.scenes.interaction.desc") }}</p>
                </div>
              </article>
            </div>
          </section>
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

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCq42du1z51lnk_oRECmIIMdGlo8z91HXxYVembnpHDwlCRZ2QJ1ym66y5KBRt_CZpjRCzc8iPehCLXF4ufoLlVsm1MzdnFwt2jysgAiOeUVZc0lqzlge-iKNbLlorsdQb3zY_dq-FKZ7m-jYpFQtcoPmUkqkJ_A_tNNZIEuNbxaMr2ORKTnckj83kmTUBejzxcNZj8yrCuWP1BCReh4YLuhq1ixT1dTbCHLwu3oa-OH5T9Om0u2wMCG-87yOTORC-nPSMqxzeW41U";

const moodPageRef = ref<HTMLElement | null>(null);
const moodLayoutWidth = ref(1360);
let moodResizeObserver: ResizeObserver | null = null;

useHead({
  title: computed(() => t("moodPage.pageTitle")),
  htmlAttrs: {},
});

const emotionTags = computed(() => [
  { key: "anger", label: t("moodPage.tags.anger") },
  { key: "disgust", label: t("moodPage.tags.disgust") },
  { key: "fear", label: t("moodPage.tags.fear") },
  { key: "happy", label: t("moodPage.tags.happy") },
  { key: "calm", label: t("moodPage.tags.calm") },
  { key: "sad", label: t("moodPage.tags.sad") },
  { key: "surprise", label: t("moodPage.tags.surprise") },
  { key: "confused", label: t("moodPage.tags.confused") },
]);

const getMoodLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = moodPageRef.value?.clientWidth || 0;
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

const syncMoodLayoutWidth = () => {
  moodLayoutWidth.value = getMoodLayoutWidth();
};

const moodShellWidth = computed(() => {
  if (moodLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(moodLayoutWidth.value))}px`;
  }

  return `${Math.min(1920, Math.max(1280, Math.round(moodLayoutWidth.value * 0.9)))}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--mood-shell-width": moodShellWidth.value,
}));

const handleBackToAiCenter = async () => {
  await router.push("/system/opt");
};

const handleStartExperience = async () => {
  await router.push("/system/opt/mood/recognition");
};

const scrollMoodPageToTop = () => {
  if (typeof window === "undefined") return;

  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  const sidebarShell = moodPageRef.value?.closest(".sidebar-shell") as HTMLElement | null;
  if (sidebarShell) {
    sidebarShell.scrollTo({ top: 0, left: 0, behavior: "auto" });
    sidebarShell.scrollTop = 0;
  }
};

onMounted(() => {
  if (typeof window === "undefined") return;

  syncMoodLayoutWidth();
  scrollMoodPageToTop();
  requestAnimationFrame(() => {
    scrollMoodPageToTop();
  });
  window.addEventListener("resize", syncMoodLayoutWidth, { passive: true });
  window.visualViewport?.addEventListener("resize", syncMoodLayoutWidth);

  if (window.ResizeObserver && moodPageRef.value) {
    moodResizeObserver = new window.ResizeObserver(() => {
      syncMoodLayoutWidth();
    });
    moodResizeObserver.observe(moodPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncMoodLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncMoodLayoutWidth);
  moodResizeObserver?.disconnect();
  moodResizeObserver = null;
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
  font-style: normal;
  font-weight: 400;
  font-size: 22px;
  line-height: 1;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.mood-page,
.mood-page * {
  box-sizing: border-box;
}

.mood-page {
  min-height: calc(100vh - 70px);
  padding: 24px 0 56px;
  background: #f7f9fb;
  color: #2d3337;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--mood-shell-width));
  margin: 0 auto;
}

.page-header {
  padding: 0 30px 12px;
}

.content-area {
  padding: 0 30px;
}

.mood-shell {
  width: 100%;
}

.mood-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8790;
  font-size: 13px;
}

.mood-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #005bc4;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.mood-breadcrumb__link:hover {
  color: #2d3337;
}

.mood-breadcrumb__separator {
  color: #b5bfd0;
}

.mood-breadcrumb__current {
  color: #2d3337;
  font-weight: 600;
}

.mood-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  min-height: 278px;
  margin-bottom: 30px;
  padding: 36px 38px;
  border-radius: 40px;
  overflow: hidden;
  background: rgba(165, 193, 255, 0.1);
}

.mood-hero__copy {
  position: relative;
  z-index: 1;
  width: 44%;
  padding-right: 12px;
}

.mood-hero__copy h1 {
  margin: 0;
  color: #10233f;
  font-size: 40px;
  line-height: 1.08;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.mood-hero__copy h2 {
  margin: 6px 0 0;
  color: #4b8eff;
  font-size: 28px;
  line-height: 1.14;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.mood-hero__copy p {
  max-width: 420px;
  margin: 18px 0 0;
  color: #596063;
  font-size: 14px;
  line-height: 1.9;
}

.mood-hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
  height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #005bc4 0%, #004fad 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 16px 28px rgba(0, 91, 196, 0.2);
  cursor: pointer;
}

.mood-hero__cta .material-symbols-outlined {
  font-size: 18px;
}

.mood-hero__media {
  position: relative;
  z-index: 1;
  width: 42%;
  display: flex;
  justify-content: flex-end;
}

.mood-hero__image {
  width: min(100%, 482px);
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(16, 35, 63, 0.16);
  display: block;
}

.mood-overview {
  display: grid;
  grid-template-columns: minmax(290px, 0.95fr) minmax(0, 2.05fr);
  gap: 30px;
  align-items: stretch;
}

.mood-summary-card {
  min-height: 680px;
  border-radius: 32px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.1);
  box-shadow: 0 10px 40px rgba(0, 91, 196, 0.04);
  padding: 28px 28px 30px;
}

.mood-summary-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}

.mood-summary-card__icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 91, 196, 0.06);
  color: #005bc4;
}

.mood-summary-card__eyebrow {
  color: #a53173;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.mood-summary-card__stat {
  color: #10233f;
  font-size: 68px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.mood-summary-card__label {
  margin-top: 8px;
  color: #596063;
  font-size: 16px;
  font-weight: 700;
}

.mood-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.mood-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 800;
  border: 1px solid transparent;
}

.mood-tag--anger {
  background: #fff0f0;
  border-color: #ffd4d4;
  color: #ef4444;
}

.mood-tag--disgust {
  background: #faf7f5;
  border-color: #e7ddd6;
  color: #7c6b5d;
}

.mood-tag--fear {
  background: #faf5ff;
  border-color: #e9d5ff;
  color: #9333ea;
}

.mood-tag--happy {
  background: #ecfdf5;
  border-color: #bbf7d0;
  color: #10b981;
}

.mood-tag--calm {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #3b82f6;
}

.mood-tag--sad {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #6366f1;
}

.mood-tag--surprise {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #f97316;
}

.mood-tag--confused {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #475569;
}

.mood-scenarios {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.mood-scenarios__title {
  color: #2d3337;
  font-size: 20px;
  font-weight: 800;
  padding: 2px 4px 0;
}

.mood-scenarios__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.mood-scene-card {
  overflow: hidden;
  border-radius: 32px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.1);
  box-shadow: 0 10px 40px rgba(0, 91, 196, 0.04);
  min-height: 290px;
}

.mood-scene-card--wide {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  min-height: 240px;
}

.mood-scene-card__media {
  position: relative;
  min-height: 132px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mood-scene-card__media::after {
  content: "";
  position: absolute;
  left: 28px;
  bottom: 18px;
  width: 6px;
  height: 24px;
  border-radius: 999px;
}

.mood-scene-card__media .material-symbols-outlined {
  font-size: 84px;
  opacity: 0.28;
}

.mood-scene-card__media--wide {
  min-height: auto;
}

.mood-scene-card__body {
  padding: 22px 26px 26px;
}

.mood-scene-card__title {
  color: #2d3337;
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 14px;
}

.mood-scene-card__body p {
  margin: 0;
  color: #596063;
  font-size: 14px;
  line-height: 1.9;
}

.mood-scene-card--education .mood-scene-card__media {
  background: rgba(0, 91, 196, 0.05);
}

.mood-scene-card--education .mood-scene-card__media::after {
  background: #005bc4;
}

.mood-scene-card--education .material-symbols-outlined {
  color: #005bc4;
}

.mood-scene-card--mental .mood-scene-card__media {
  background: rgba(165, 49, 115, 0.05);
}

.mood-scene-card--mental .mood-scene-card__media::after {
  background: #a53173;
}

.mood-scene-card--mental .material-symbols-outlined {
  color: #a53173;
}

.mood-scene-card--interaction .mood-scene-card__media {
  background: rgba(0, 109, 74, 0.05);
}

.mood-scene-card--interaction .mood-scene-card__media::after {
  background: #006d4a;
}

.mood-scene-card--interaction .material-symbols-outlined {
  color: #006d4a;
}

@media (max-width: 1500px) {
  .page-header,
  .content-area {
    padding-left: 24px;
    padding-right: 24px;
  }

  .mood-hero__copy h1 {
    font-size: 36px;
  }

  .mood-hero__copy h2 {
    font-size: 26px;
  }
}

@media (max-width: 1180px) {
  .mood-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .mood-hero__copy,
  .mood-hero__media {
    width: 100%;
  }

  .mood-hero__media {
    justify-content: center;
  }

  .mood-overview {
    grid-template-columns: 1fr;
  }

  .mood-scenarios__grid {
    grid-template-columns: 1fr;
  }

  .mood-scene-card--wide {
    grid-template-columns: 1fr;
  }
}
</style>
