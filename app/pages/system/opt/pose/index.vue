<template>
  <div
    ref="posePageRef"
    class="pose-page"
    :style="pageAdaptiveStyle"
  >
    <div class="page-header">
      <nav class="pose-breadcrumb" :aria-label="t('ai.poseIntroPage.breadcrumbLabel')">
        <button
          type="button"
          class="pose-breadcrumb__link"
          @click="handleBackToAiCenter"
        >
          {{ t("menu.aiCenter") }}
        </button>
        <span class="pose-breadcrumb__separator">/</span>
        <span class="pose-breadcrumb__current">{{ t("ai.poseIntroPage.breadcrumbCurrent") }}</span>
      </nav>
    </div>

    <div class="content-area">
      <main class="pose-main">
        <section class="pose-hero">
          <div class="pose-hero__content">
            <div class="pose-hero__copy">
              <span class="pose-hero__badge">
                <svg class="pose-hero__badge-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M2.25 12s3.75-6 9.75-6s9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="2.8"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
                {{ t("ai.poseIntroPage.heroBadge") }}
              </span>
              <h1>{{ t("ai.poseIntroPage.heroTitle") }}</h1>
              <p>
                {{ t("ai.poseIntroPage.heroDesc") }}
              </p>

              <button
                type="button"
                class="pose-primary-btn"
                @click="handleStartExperience"
              >
                {{ t("ai.poseIntroPage.startButton") }}
              </button>
            </div>

            <div class="pose-hero__visual" aria-hidden="true">
              <img
                class="pose-hero__image"
                :src="heroImage"
                :alt="t('ai.poseIntroPage.images.heroAlt')"
              />
            </div>
          </div>
        </section>

        <section class="pose-scenarios">
          <div class="pose-section-head">
            <h2>{{ t("ai.poseIntroPage.scenariosTitle") }}</h2>
            <div class="pose-section-head__line"></div>
          </div>

          <div class="pose-scenario-grid">
            <article
              v-for="item in scenarioCards"
              :key="item.key"
              class="pose-scenario-card"
            >
              <div class="pose-scenario-card__media">
                <img :src="item.image" :alt="item.imageAlt" />
                <div class="pose-scenario-card__overlay"></div>
                <span
                  class="pose-scenario-card__tag"
                  :class="item.tagClass"
                >{{ item.tag }}</span>
              </div>
              <div class="pose-scenario-card__body">
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
  title: t("ai.poseIntroPage.pageTitle"),
}));

const heroImage = "/stitch/pose/hero.png";

const scenarioCards = computed(() => [
  {
    key: "teaching",
    title: t("ai.poseIntroPage.cards.teaching.title"),
    desc: t("ai.poseIntroPage.cards.teaching.desc"),
    tag: t("ai.poseIntroPage.cards.teaching.tag"),
    tagClass: "pose-scenario-card__tag--primary",
    image: "/stitch/pose/card-sport.png",
    imageAlt: t("ai.poseIntroPage.images.classroomAlt"),
  },
  {
    key: "sports",
    title: t("ai.poseIntroPage.cards.sports.title"),
    desc: t("ai.poseIntroPage.cards.sports.desc"),
    tag: t("ai.poseIntroPage.cards.sports.tag"),
    tagClass: "pose-scenario-card__tag--secondary",
    image: "/stitch/pose/card-art.png",
    imageAlt: t("ai.poseIntroPage.images.sportsAlt"),
  },
  {
    key: "performance",
    title: t("ai.poseIntroPage.cards.performance.title"),
    desc: t("ai.poseIntroPage.cards.performance.desc"),
    tag: t("ai.poseIntroPage.cards.performance.tag"),
    tagClass: "pose-scenario-card__tag--tertiary",
    image: "/stitch/pose/card-medical.png",
    imageAlt: t("ai.poseIntroPage.images.performanceAlt"),
  },
]);

const posePageRef = ref<HTMLElement | null>(null);
const poseLayoutWidth = ref(1360);
let poseResizeObserver: ResizeObserver | null = null;

const getPoseLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = posePageRef.value?.clientWidth || 0;
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

const syncPoseLayoutWidth = () => {
  poseLayoutWidth.value = getPoseLayoutWidth();
};

const poseShellWidth = computed(() => {
  if (poseLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(poseLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(poseLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--pose-shell-width": poseShellWidth.value,
}));

const scrollPosePageToTop = () => {
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
  await navigateTo("/system/opt/pose/experience");
};

const handleBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};

onMounted(() => {
  if (typeof window === "undefined") return;

  nextTick(() => {
    scrollPosePageToTop();
  });

  syncPoseLayoutWidth();
  window.addEventListener("resize", syncPoseLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncPoseLayoutWidth);

  if (window.ResizeObserver && posePageRef.value) {
    poseResizeObserver = new window.ResizeObserver(() => {
      syncPoseLayoutWidth();
    });
    poseResizeObserver.observe(posePageRef.value);
  }
});

onActivated(() => {
  nextTick(() => {
    scrollPosePageToTop();
  });
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;

  window.removeEventListener("resize", syncPoseLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncPoseLayoutWidth);
  poseResizeObserver?.disconnect();
  poseResizeObserver = null;
});
</script>

<style scoped>
.pose-page,
.pose-page * {
  box-sizing: border-box;
}

.pose-page {
  min-height: calc(100vh - 70px);
  padding: 28px 0 72px;
  background:
    radial-gradient(circle at top right, rgba(245, 105, 101, 0.16), transparent 24%),
    radial-gradient(circle at left top, rgba(0, 91, 194, 0.08), transparent 26%),
    linear-gradient(180deg, #f8f9fa 0%, #f7f9fb 100%);
  color: #2d3337;
  overflow-x: hidden;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--pose-shell-width));
  margin: 0 auto;
}

.page-header {
  padding: 0 30px 14px;
}

.content-area {
  padding: 0 30px;
}

.pose-main {
  width: 100%;
}

.pose-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7d8790;
  font-size: 13px;
  font-weight: 500;
}

.pose-breadcrumb__separator {
  color: #b5bfd0;
}

.pose-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.pose-breadcrumb__link:hover {
  color: #005bc2;
}

.pose-breadcrumb__current {
  color: #005bc2;
  font-weight: 700;
}

.pose-hero {
  margin-bottom: 30px;
}

.pose-hero__content {
  position: relative;
  overflow: hidden;
  display: flex;
  min-height: 460px;
  padding: 48px;
  border-radius: 24px;
  background: #3b82f6;
  box-shadow: 0 20px 60px -15px rgba(0, 91, 196, 0.2);
}

.pose-hero__copy,
.pose-hero__visual {
  position: relative;
  z-index: 1;
}

.pose-hero__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: center;
  flex: 1 1 50%;
  min-width: 0;
  max-width: 50%;
  color: #ffffff;
}

.pose-hero__badge {
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

.pose-hero__badge-icon {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
}

.pose-hero__copy h1 {
  margin: 24px 0;
  font-size: clamp(48px, 4vw, 64px);
  line-height: 1.08;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.pose-hero__copy p {
  max-width: 560px;
  margin: 0;
  color: rgba(239, 246, 255, 0.84);
  font-size: 18px;
  line-height: 1.7;
}

.pose-primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin-top: 40px;
  padding: 18px 32px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #005bc4;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(8, 36, 96, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.pose-primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px rgba(8, 36, 96, 0.22);
  filter: brightness(1.02);
}

.pose-hero__visual {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  padding: 0 20px 0 0;
}

.pose-hero__image {
  width: auto;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
}

.pose-section-head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 40px;
}

.pose-section-head h2 {
  margin: 0;
  color: #1a2540;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.pose-section-head__line {
  flex: 1;
  height: 1px;
  background: #d9e0ea;
}

.pose-scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.pose-scenario-card {
  overflow: hidden;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    filter 0.3s ease;
}

.pose-scenario-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18);
}

.pose-scenario-card__media {
  position: relative;
  height: 256px;
  overflow: hidden;
}

.pose-scenario-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.pose-scenario-card:hover .pose-scenario-card__media img {
  transform: scale(1.08);
}

.pose-scenario-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 32%, rgba(0, 0, 0, 0.6) 100%);
}

.pose-scenario-card__tag {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.pose-scenario-card__tag--primary {
  background: #005bc4;
}

.pose-scenario-card__tag--secondary {
  background: #a53173;
}

.pose-scenario-card__tag--tertiary {
  background: #006d4a;
}

.pose-scenario-card__body {
  padding: 32px;
}

.pose-scenario-card__body h3 {
  margin: 0 0 16px;
  color: #1a2540;
  font-size: 24px;
  line-height: 1.4;
  font-weight: 800;
}

.pose-scenario-card__body p {
  margin: 0;
  color: #5b6677;
  font-size: 16px;
  line-height: 1.75;
  margin-bottom: 24px;
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

  .pose-hero__content {
    padding: 36px;
  }

  .pose-scenario-grid {
    gap: 20px;
  }
}

@media (max-width: 1180px) {
  .pose-hero__content {
    display: block;
    min-height: unset;
  }

  .pose-hero__copy {
    max-width: 100%;
  }

  .pose-hero__visual {
    position: relative;
    width: 100%;
    height: 320px;
    margin-top: 28px;
  }

  .pose-scenario-grid {
    grid-template-columns: 1fr;
  }
}
</style>
