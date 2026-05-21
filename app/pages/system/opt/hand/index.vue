<template>
  <div
    ref="handPageRef"
    class="hand-page"
    :style="pageAdaptiveStyle"
  >
    <div class="page-header">
      <nav class="hand-breadcrumb" aria-label="面包屑导航">
        <button
          type="button"
          class="hand-breadcrumb__link"
          @click="handleBackToAiCenter"
        >{{ t("gestureIntroPage.aiPracticeCenter") }}</button>
        <span class="hand-breadcrumb__separator">/</span>
        <span class="hand-breadcrumb__current">{{ t("gestureIntroPage.currentPage") }}</span>
      </nav>
    </div>

    <div class="content-area">
      <main class="hand-main">
        <section class="hand-hero">
          <div class="hand-hero__content">
            <div class="hand-hero__copy">
              <span class="hand-hero__badge">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
                {{ t("gestureIntroPage.heroBadge") }}
              </span>
              <h1>{{ t("gestureIntroPage.heroTitle") }}</h1>
              <p>
                {{ t("gestureIntroPage.heroDesc") }}
              </p>

              <button
                type="button"
                class="hand-primary-btn"
                @click="handleStartExperience"
              >{{ t("gestureIntroPage.startExperience") }}</button>
            </div>

            <div class="hand-hero__visual" aria-hidden="true">
              <img
                class="hand-hero__image"
                :src="heroImage"
                :alt="t('gestureIntroPage.heroImageAlt')"
              />
            </div>
          </div>
        </section>

        <section class="hand-scenarios">
          <div class="hand-section-head">
            <h2>{{ t("gestureIntroPage.scenariosTitle") }}</h2>
            <div class="hand-section-head__line"></div>
          </div>

          <div class="hand-scenario-grid">
            <article
              v-for="item in scenarioCards"
              :key="item.title"
              class="hand-scenario-card"
            >
              <div class="hand-scenario-card__media">
                <img :src="item.image" :alt="item.imageAlt" />
                <div class="hand-scenario-card__overlay"></div>
                <span
                  class="hand-scenario-card__tag"
                  :class="item.tagClass"
                >{{ item.tag }}</span>
              </div>
              <div class="hand-scenario-card__body">
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

definePageMeta({
  layout: "sidebar",
});

const { t } = useI18n();

useHead(() => ({
  title: t("gestureIntroPage.pageTitle"),
}));

const heroImage =
  "/stitch/hand/hero.png";

const scenarioCards = [
  {
    title: t("gestureIntroPage.scenes.interaction.title"),
    desc: t("gestureIntroPage.scenes.interaction.desc"),
    tag: t("gestureIntroPage.scenes.interaction.tag"),
    tagClass: "hand-scenario-card__tag--primary",
    image:
      "/stitch/hand/card-interaction.png",
    imageAlt: t("gestureIntroPage.images.interactionAlt"),
  },
  {
    title: t("gestureIntroPage.scenes.accessibility.title"),
    desc: t("gestureIntroPage.scenes.accessibility.desc"),
    tag: t("gestureIntroPage.scenes.accessibility.tag"),
    tagClass: "hand-scenario-card__tag--secondary",
    image:
      "/stitch/hand/card-accessibility.png",
    imageAlt: t("gestureIntroPage.images.accessibilityAlt"),
  },
  {
    title: t("gestureIntroPage.scenes.virtualLab.title"),
    desc: t("gestureIntroPage.scenes.virtualLab.desc"),
    tag: t("gestureIntroPage.scenes.virtualLab.tag"),
    tagClass: "hand-scenario-card__tag--tertiary",
    image:
      "/stitch/hand/card-lab.png",
    imageAlt: t("gestureIntroPage.images.virtualLabAlt"),
  },
] as const;

const handPageRef = ref<HTMLElement | null>(null);
const handLayoutWidth = ref(1360);
let handResizeObserver: ResizeObserver | null = null;

const getHandLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = handPageRef.value?.clientWidth || 0;
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

const syncHandLayoutWidth = () => {
  handLayoutWidth.value = getHandLayoutWidth();
};

const handShellWidth = computed(() => {
  if (handLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(handLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(handLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--hand-shell-width": handShellWidth.value,
}));

const scrollHandPageToTop = () => {
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

const handleStartExperience = async () => {
  await navigateTo("/system/opt/hand/experience");
};

const handleBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};

onMounted(() => {
  if (typeof window === "undefined") return;

  nextTick(() => {
    scrollHandPageToTop();
  });

  syncHandLayoutWidth();
  window.addEventListener("resize", syncHandLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncHandLayoutWidth);

  if (window.ResizeObserver && handPageRef.value) {
    handResizeObserver = new window.ResizeObserver(() => {
      syncHandLayoutWidth();
    });
    handResizeObserver.observe(handPageRef.value);
  }
});

onActivated(() => {
  nextTick(() => {
    scrollHandPageToTop();
  });
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncHandLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncHandLayoutWidth);
  handResizeObserver?.disconnect();
  handResizeObserver = null;
});
</script>

<style scoped>
.hand-page,
.hand-page * {
  box-sizing: border-box;
}

.hand-page {
  min-height: calc(100vh - 70px);
  padding: 28px 0 72px;
  background:
    radial-gradient(circle at top right, rgba(165, 193, 255, 0.18), transparent 22%),
    linear-gradient(180deg, #f8f9fa 0%, #f7f9fb 100%);
  color: #2d3337;
  overflow-x: hidden;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--hand-shell-width));
  margin: 0 auto;
}

.page-header {
  padding: 0 30px 14px;
}

.content-area {
  padding: 0 30px;
}

.hand-main {
  width: 100%;
}

.hand-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8790;
  font-size: 13px;
  font-weight: 500;
}

.hand-breadcrumb__separator {
  color: #b5bfd0;
}

.hand-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.hand-breadcrumb__link:hover {
  color: #005bc2;
}

.hand-breadcrumb__current {
  color: #005bc2;
  font-weight: 700;
}

.hand-hero {
  margin-bottom: 30px;
}

.hand-hero__content {
  position: relative;
  overflow: hidden;
  display: flex;
  min-height: 460px;
  padding: 48px;
  border-radius: 24px;
  background: #0052d9;
  box-shadow: 0 20px 60px -15px rgba(59, 130, 246, 0.2);
}

.hand-hero__copy,
.hand-hero__visual {
  position: relative;
  z-index: 1;
}

.hand-hero__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: center;
  flex: 1 1 50%;
  min-width: 0;
  max-width: 50%;
  color: #ffffff;
}

.hand-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.95);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.hand-hero__badge svg {
  width: 16px;
  height: 16px;
}

.hand-hero__copy h1 {
  margin: 24px 0;
  font-size: clamp(42px, 3.8vw, 56px);
  line-height: 1.08;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.hand-hero__copy p {
  max-width: 560px;
  margin: 0;
  color: rgba(239, 246, 255, 0.8);
  font-size: 18px;
  line-height: 1.75;
}

.hand-primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin-top: 40px;
  padding: 16px 32px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #0052d9;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(8, 36, 96, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.hand-primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px rgba(8, 36, 96, 0.22);
  filter: brightness(1.02);
}

.hand-hero__visual {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.hand-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hand-section-head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 40px;
}

.hand-section-head h2 {
  margin: 0;
  color: #1a2540;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.hand-section-head__line {
  flex: 1;
  height: 1px;
  background: #d9e0ea;
}

.hand-scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.hand-scenario-card {
  overflow: hidden;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.hand-scenario-card:hover {
  transform: translateY(-4px);
  border-color: #e5e7eb;
  box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18);
}

.hand-scenario-card__media {
  position: relative;
  height: 224px;
  overflow: hidden;
}

.hand-scenario-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.hand-scenario-card:hover .hand-scenario-card__media img {
  transform: scale(1.08);
}

.hand-scenario-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 38%, rgba(0, 0, 0, 0.4) 100%);
}

.hand-scenario-card__tag {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hand-scenario-card__tag--primary {
  background: #005bc4;
}

.hand-scenario-card__tag--secondary {
  background: #a53173;
}

.hand-scenario-card__tag--tertiary {
  background: #006d4a;
}

.hand-scenario-card__body {
  padding: 32px;
}

.hand-scenario-card__body h3 {
  margin: 0 0 12px;
  color: #1a2540;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 800;
}

.hand-scenario-card__body p {
  margin: 0;
  color: #5b6677;
  font-size: 14px;
  line-height: 1.8;
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

  .hand-hero__content {
    padding: 36px;
  }

  .hand-scenario-grid {
    gap: 20px;
  }
}

@media (max-width: 1180px) {
  .hand-hero__content {
    display: block;
    min-height: unset;
  }

  .hand-hero__copy {
    max-width: 100%;
  }

  .hand-hero__visual {
    position: relative;
    width: 100%;
    height: 320px;
    margin-top: 28px;
  }

  .hand-scenario-grid {
    grid-template-columns: 1fr;
  }
}
</style>
