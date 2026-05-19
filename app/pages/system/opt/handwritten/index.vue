<template>
  <div ref="handwrittenPageRef" class="handwritten-page" :style="pageAdaptiveStyle">
    <div class="page-header">
      <nav class="handwritten-breadcrumb" aria-label="breadcrumb">
        <button
          type="button"
          class="handwritten-breadcrumb__link"
          @click="handleBackToAICenter"
        >
          {{ t("menu.aiCenter") }}
        </button>
        <svg
          class="handwritten-breadcrumb__icon"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 3.5L10.5 8L6 12.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="handwritten-breadcrumb__current">
          {{ t("ai.handwrittenDigit") }}
        </span>
      </nav>
    </div>

    <div class="content-area">
      <div class="handwritten-shell">
        <section class="handwritten-hero">
            <div class="handwritten-hero__copy">
              <span class="handwritten-hero__eyebrow">
                {{ t("ai.handwrittenPage.heroEyebrow") }}
              </span>
              <h1 class="handwritten-hero__title">
                {{ t("ai.handwrittenPage.heroTitle") }}
              </h1>
              <p class="handwritten-hero__desc">
                {{ t("ai.handwrittenPage.heroDesc") }}
              </p>
              <button
                type="button"
                class="handwritten-hero__cta"
                @click="handleStartExperience"
              >
                <span>{{ t("ai.handwrittenPage.startNow") }}</span>
                <svg class="handwritten-button__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div class="handwritten-hero__visual" aria-hidden="true">
              <div
                v-for="digit in heroDigits"
                :key="digit.text"
                class="handwritten-hero__digit-card"
                :class="digit.className"
              >
                {{ digit.text }}
              </div>
            </div>
        </section>

        <section class="handwritten-section handwritten-section--intro">
            <div class="handwritten-section__content">
              <div class="handwritten-section__header">
                <span class="handwritten-section__accent"></span>
                <h2 class="handwritten-section__title">
                  {{ t("ai.handwrittenPage.sections.whatIs.title") }}
                </h2>
              </div>
              <p class="handwritten-section__desc">
                {{ t("ai.handwrittenPage.sections.whatIs.desc") }}
              </p>

              <div class="handwritten-stats">
                <article
                  v-for="item in mnistStats"
                  :key="item.key"
                  class="handwritten-stat-card"
                >
                  <strong class="handwritten-stat-card__value">{{ item.value }}</strong>
                  <span class="handwritten-stat-card__label">{{ item.label }}</span>
                </article>
              </div>

              <button
                type="button"
                class="handwritten-inline-cta"
                @click="handleStartExperience"
              >
                <span>{{ t("ai.handwrittenPage.startNow") }}</span>
                <svg class="handwritten-button__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div class="handwritten-section__media">
              <img
                class="handwritten-section__image"
                :src="mnistGridImage"
                :alt="t('ai.handwrittenPage.images.mnistGridAlt')"
              />
            </div>
        </section>

        <section class="handwritten-section handwritten-section--network">
            <div class="handwritten-section__header">
              <span class="handwritten-section__accent handwritten-section__accent--green"></span>
              <h2 class="handwritten-section__title">
                {{ t("ai.handwrittenPage.sections.cnn.title") }}
              </h2>
            </div>

            <div class="handwritten-network-card">
              <img
                class="handwritten-network-card__image"
                :src="cnnImage"
                :alt="t('ai.handwrittenPage.images.cnnAlt')"
              />

              <div class="handwritten-network-card__grid">
                <article
                  v-for="item in cnnSteps"
                  :key="item.key"
                  class="handwritten-network-card__item"
                >
                  <div
                    class="handwritten-network-card__item-head"
                    :class="`is-${item.tone}`"
                  >
                    <span class="material-symbols-outlined">{{ item.icon }}</span>
                    <h3>{{ item.title }}</h3>
                  </div>
                  <p>{{ item.desc }}</p>
                </article>
              </div>
            </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";

definePageMeta({
  layout: "sidebar",
});

const router = useRouter();
const { t } = useI18n();
const handwrittenPageRef = ref<HTMLElement | null>(null);
let handwrittenResizeObserver: ResizeObserver | null = null;
const handwrittenLayoutWidth = ref(1360);

const heroDigits = [
  { text: "3", className: "is-soft" },
  { text: "5", className: "is-mid" },
  { text: "8", className: "is-soft" },
  { text: "1", className: "is-strong" },
  { text: "0", className: "is-soft" },
  { text: "7", className: "is-mid" },
];

const mnistGridImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuACXTLS5p8J3IseZvQJWW6fy41sjY3wjq-Nk3K_r0OZf3-LFw1UB_Kfa8CmdZ3Ll2txTfXAI775NBlGXHvNokFzAsB3Y4E3sFYijDpDHMy3SQoq6xpg7CM12e4DlSPYvAe7fNQNklAOaE8Nclmk_WKt51y09c2uLI-RYJOHpAjuVMm9ECPMV1WVRVPYiQb-kcj8QeIFnAuNh4y8JWaJPVcpOvlSEJRYyaSr7HVGanlRC1XssxfR7FV97tRDmKdqO0WYB-PyOWFUJE4";
const cnnImage =
  "https://lh3.googleusercontent.com/aida/ADBb0uhg6ddQlaNbPMknWcMTuLEacAv61tW_ZBkPHP6L8fP8JesCbYpaa29TBexIHGTqe5i10DbGxwJMCsElDgFM4YqgjfEK_2-iSJBjW2sC4L8kmUJXT-t9nWC9cNrghGl8GTgh4HcWzJLu4rmt8wUO54sbeBM2OkuBBQUnSc3HO1wSHO9ylNXKCFE91uY5S2dmOCGSRpq8rJV1xkpVFAyElqJIPmd5HCT-RKblGCBoAaU1JII2NmMeouZ2zno";

const mnistStats = computed(() => [
  { key: "train", value: "60K", label: t("ai.handwrittenPage.stats.trainSamples") },
  { key: "test", value: "10K", label: t("ai.handwrittenPage.stats.testSamples") },
]);

const cnnSteps = computed(() => [
  {
    key: "vector",
    icon: "login",
    tone: "blue",
    title: t("ai.handwrittenPage.sections.cnn.steps.vector.title"),
    desc: t("ai.handwrittenPage.sections.cnn.steps.vector.desc"),
  },
  {
    key: "feature",
    icon: "blur_on",
    tone: "purple",
    title: t("ai.handwrittenPage.sections.cnn.steps.feature.title"),
    desc: t("ai.handwrittenPage.sections.cnn.steps.feature.desc"),
  },
  {
    key: "output",
    icon: "grading",
    tone: "green",
    title: t("ai.handwrittenPage.sections.cnn.steps.output.title"),
    desc: t("ai.handwrittenPage.sections.cnn.steps.output.desc"),
  },
]);

const getHandwrittenLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = handwrittenPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(
    (width) => width > 0
  );
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);

  return Math.max(1280, Math.round(boundedWidth));
};

const syncHandwrittenLayoutWidth = () => {
  handwrittenLayoutWidth.value = getHandwrittenLayoutWidth();
};

const handwrittenShellWidth = computed(() => {
  if (handwrittenLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(handwrittenLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(handwrittenLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--handwritten-shell-width": handwrittenShellWidth.value,
}));

const handleBackToAICenter = async () => {
  await router.push("/system/opt");
};

const handleStartExperience = async () => {
  await router.push("/system/opt/handwritten/workbench");
};

onMounted(() => {
  syncHandwrittenLayoutWidth();
  window.addEventListener("resize", syncHandwrittenLayoutWidth, { passive: true });

  if (typeof ResizeObserver !== "undefined" && handwrittenPageRef.value) {
    handwrittenResizeObserver = new ResizeObserver(() => {
      syncHandwrittenLayoutWidth();
    });
    handwrittenResizeObserver.observe(handwrittenPageRef.value);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", syncHandwrittenLayoutWidth);
  handwrittenResizeObserver?.disconnect();
  handwrittenResizeObserver = null;
});
</script>

<style scoped>
.handwritten-page,
.handwritten-page * {
  box-sizing: border-box;
}

.handwritten-page {
  min-height: calc(100vh - 70px);
  padding: 28px 0 72px;
  background: #f8f9fa;
  color: #2d3337;
  overflow: visible;
}

.page-header,
.content-area {
  width: min(100%, 1800px, var(--handwritten-shell-width));
  margin: 0 auto;
  box-sizing: border-box;
}

.page-header {
  padding: 0 32px 14px;
}

.content-area {
  padding: 0 32px;
}

.handwritten-shell {
  width: 100%;
}

.handwritten-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  color: #7d8790;
  font-size: 13px;
}

.handwritten-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.handwritten-breadcrumb__link:hover {
  color: #005bc4;
}

.handwritten-breadcrumb__icon {
  width: 14px;
  height: 14px;
  color: #aeb6bc;
  flex-shrink: 0;
}

.handwritten-breadcrumb__current {
  color: #2d3337;
  font-weight: 600;
}

.handwritten-hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  min-height: 228px;
  padding: 34px 38px;
  border-radius: 24px;
  background: linear-gradient(135deg, #005bc4 0%, #1f74da 55%, #4b8eff 100%);
  box-shadow: 0 14px 34px rgba(0, 91, 196, 0.14);
}

.handwritten-hero::before,
.handwritten-hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  filter: blur(110px);
  opacity: 0.28;
  pointer-events: none;
}

.handwritten-hero::before {
  width: 260px;
  height: 260px;
  left: 40px;
  top: 30px;
  background: #69f6b8;
}

.handwritten-hero::after {
  width: 360px;
  height: 360px;
  right: 80px;
  bottom: -30px;
  background: #a5c1ff;
}

.handwritten-hero__copy,
.handwritten-hero__visual {
  position: relative;
  z-index: 1;
}

.handwritten-hero__copy {
  max-width: 540px;
}

.handwritten-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  height: 30px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.handwritten-hero__title {
  margin: 16px 0 12px;
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.handwritten-hero__desc {
  margin: 0;
  max-width: 470px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  line-height: 1.85;
}

.handwritten-hero__cta,
.handwritten-inline-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 22px;
  border: none;
  border-radius: 999px;
  padding: 0 20px;
  height: 40px;
  background: #005bc4;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 22px rgba(0, 91, 196, 0.22);
}

.handwritten-hero__cta:hover,
.handwritten-inline-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(0, 91, 196, 0.24);
}

.handwritten-button__icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.handwritten-hero__visual {
  min-width: 260px;
  display: grid;
  grid-template-columns: repeat(3, 66px);
  gap: 14px;
  transform: rotate(12deg) translateX(-12px);
}

.handwritten-hero__digit-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 66px;
  height: 66px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 28px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
}

.handwritten-hero__digit-card.is-soft {
  background: rgba(255, 255, 255, 0.12);
}

.handwritten-hero__digit-card.is-mid {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(10px);
}

.handwritten-hero__digit-card.is-strong {
  background: rgba(255, 255, 255, 0.24);
}

.handwritten-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 28px;
  margin-top: 28px;
}

.handwritten-section--intro {
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: 34px;
}

.handwritten-section__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.handwritten-section__accent {
  width: 30px;
  height: 3px;
  border-radius: 999px;
  background: #a53173;
}

.handwritten-section__accent--green {
  background: #006d4a;
}

.handwritten-section__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #20262d;
}

.handwritten-section__desc {
  margin: 0;
  color: #596063;
  font-size: 13px;
  line-height: 1.95;
}

.handwritten-section__image {
  width: 100%;
  display: block;
  border-radius: 22px;
  border: 1px solid rgba(172, 179, 183, 0.18);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.05);
}

.handwritten-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 22px;
  max-width: 600px;
}

.handwritten-stat-card {
  padding: 22px 24px;
  border-radius: 22px;
  background: #f1f4f6;
}

.handwritten-stat-card__value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #005bc4;
  line-height: 1;
}

.handwritten-stat-card__label {
  display: block;
  margin-top: 10px;
  color: #757c7f;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.handwritten-network-card {
  overflow: hidden;
  border-radius: 24px;
  background: #fff;
  border: 1px solid rgba(172, 179, 183, 0.16);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.04);
}

.handwritten-network-card__image {
  width: 100%;
  display: block;
}

.handwritten-network-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  padding: 24px 26px 28px;
  background: #f1f4f6;
}

.handwritten-network-card__item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 700;
}

.handwritten-network-card__item-head.is-blue {
  color: #005bc4;
}

.handwritten-network-card__item-head.is-purple {
  color: #a53173;
}

.handwritten-network-card__item-head.is-green {
  color: #006d4a;
}

.handwritten-network-card__item p {
  margin: 0;
  color: #596063;
  font-size: 13px;
  line-height: 1.75;
}

@media (max-width: 1440px) {
  .page-header,
  .content-area {
    width: min(100%, 1600px, var(--handwritten-shell-width));
  }

  .handwritten-hero {
    padding: 32px;
  }

  .handwritten-hero__title {
    font-size: 26px;
  }

  .handwritten-section--intro {
    grid-template-columns: 1fr;
  }

  .handwritten-hero__visual {
    min-width: 220px;
  }
}

@media (max-width: 1280px) {
  .handwritten-page {
    padding: 22px 0 48px;
  }

  .page-header,
  .content-area {
    padding-left: 24px;
    padding-right: 24px;
  }
}
</style>
