<template>
  <div class="tts-intro-page">
    <div class="tts-intro-shell">
      <nav class="tts-intro-breadcrumb" :aria-label="t('ttsDemo.breadcrumbAria')">
        <button
          type="button"
          class="tts-intro-breadcrumb__link"
          @click="handleBackToAiCenter"
        >
          {{ t("ttsDemo.aiPracticeCenter") }}
        </button>
        <span class="tts-intro-breadcrumb__separator">/</span>
        <span class="tts-intro-breadcrumb__current">{{ t("ttsDemo.speechSynthesis") }}</span>
      </nav>

      <main class="tts-intro-main">
        <section class="tts-intro-hero">
          <h1>
            {{ t("ttsDemo.titleTts") }}<span>{{ t("ttsDemo.ttsAbbr") }}</span>
          </h1>

          <p>
            {{ t("ttsDemo.introDesc") }}
          </p>

          <button
            class="tts-intro-primary"
            type="button"
            :disabled="!canEnterExperience"
            @click="handleEnterExperience"
          >
            <span>{{ primaryButtonText }}</span>
            <span class="tts-intro-primary__arrow">→</span>
          </button>

          <div class="tts-intro-model-status" :class="`is-${localTtsStatus}`">
            <span class="tts-intro-model-status__dot"></span>
            <span>{{ modelStatusText }}</span>
          </div>
        </section>

        <section id="tts-workflow" class="tts-intro-workflow">
          <div class="tts-intro-steps">
            <article
              v-for="step in workflowSteps"
              :key="step.title"
              class="tts-intro-step"
              :class="`tts-intro-step--${step.theme}`"
            >
              <div class="tts-intro-step__icon">
                <span>{{ step.icon }}</span>
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </article>
          </div>
        </section>
      </main>

      <div class="tts-intro-ring" aria-hidden="true"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: computed(() => t("ttsDemo.pageTitle")),
  htmlAttrs: {},
});

type WorkflowStep = {
  title: string;
  description: string;
  icon: string;
  theme: "primary" | "secondary" | "tertiary";
};

const workflowSteps = computed<WorkflowStep[]>(() => [
  {
    title: t("ttsDemo.stepTextPreprocessing"),
    description: t("ttsDemo.stepTextPreprocessingDesc"),
    icon: "≡",
    theme: "primary",
  },
  {
    title: t("ttsDemo.stepFeatureExtraction"),
    description: t("ttsDemo.stepFeatureExtractionDesc"),
    icon: "Y",
    theme: "primary",
  },
  {
    title: t("ttsDemo.stepPhonemeConversion"),
    description: t("ttsDemo.stepPhonemeConversionDesc"),
    icon: "◎",
    theme: "primary",
  },
  {
    title: t("ttsDemo.stepProsodyModeling"),
    description: t("ttsDemo.stepProsodyModelingDesc"),
    icon: "≋",
    theme: "secondary",
  },
  {
    title: t("ttsDemo.stepAcousticModeling"),
    description: t("ttsDemo.stepAcousticModelingDesc"),
    icon: "♬",
    theme: "tertiary",
  },
  {
    title: t("ttsDemo.stepVocoder"),
    description: t("ttsDemo.stepVocoderDesc"),
    icon: "≈",
    theme: "tertiary",
  },
]);

const canEnterExperience = computed(() => true);
const localTtsStatus = ref("ready");

const primaryButtonText = computed(() => {
  return t("ttsDemo.startExperience");
});

const modelStatusText = computed(() => {
  return t("ttsDemo.modelStatusReady");
});

const canEnterExperience = computed(() => true);
const localTtsStatus = ref("ready");

const primaryButtonText = computed(() => {
  return "立即体验";
});

const modelStatusText = computed(() => {
  return "在线试听与在线 MP3 下载已就绪。";
});

const handleBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};

const handleEnterExperience = async () => {
  if (!canEnterExperience.value) return;
  await navigateTo("/system/opt/tts/experience");
};
</script>

<style scoped>
.tts-intro-page {
  height: calc(100% - 28px);
  min-height: 0;
  overflow: hidden;
  color: #2d3337;
  background: #f7f9fb;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.tts-intro-shell {
  position: relative;
  width: 100%;
  height: calc(100% - 28px);
  min-height: 0;
  overflow: hidden;
  padding: 28px 42px 26px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 91% 17%, rgba(165, 193, 255, 0.28), transparent 25%),
    radial-gradient(circle at 0 82%, rgba(105, 246, 184, 0.18), transparent 26%),
    #f7f9fb;
}


.tts-intro-breadcrumb {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1280px;
  margin: 0 auto 8px;
  color: #97a3b8;
  font-size: 13px;
  font-weight: 500;
}

.tts-intro-breadcrumb__separator {
  color: #b5bfd0;
}

.tts-intro-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #005bc2;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
}

.tts-intro-breadcrumb__link:hover,
.tts-intro-breadcrumb__current {
  color: #2d3337;
}

.tts-intro-main {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  height: calc(100% - 28px);
  min-height: 0;
  margin: 0 auto;
}

.tts-intro-hero {
  display: flex;
  min-height: 210px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px 14px;
  text-align: center;
}

.tts-intro-hero h1 {
  margin: 0 0 14px;
  color: #2d3337;
  font-size: clamp(52px, 4.2vw, 72px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.075em;
}

.tts-intro-hero h1 span {
  margin-left: 8px;
  color: #005bc2;
}

.tts-intro-hero p {
  max-width: 420px;
  margin: 10px 0 22px;
  color: rgba(89, 96, 99, 0.9);
  font-size: 13px;
  line-height: 1.45;
}

.tts-intro-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-width: 136px;
  height: 42px;
  padding: 0 28px;
  border-radius: 999px;
  background: #005bc2;
  color: #ffffff;
  border: none;
  font-size: 15px;
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 18px 38px rgba(0, 91, 194, 0.26);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.tts-intro-primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 44px rgba(0, 91, 194, 0.3);
}

.tts-intro-primary:disabled {
  cursor: not-allowed;
  background: #9aa6b2;
  opacity: 0.62;
  box-shadow: none;
}

.tts-intro-primary__arrow {
  font-size: 24px;
  line-height: 1;
}

.tts-intro-model-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  margin-top: 12px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #6b7785;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.tts-intro-model-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9aa6b2;
}

.tts-intro-model-status.is-loading .tts-intro-model-status__dot,
.tts-intro-model-status.is-idle .tts-intro-model-status__dot {
  background: #005bc2;
  animation: tts-status-pulse 1.1s ease-in-out infinite;
}

.tts-intro-model-status.is-ready {
  color: #047857;
  background: rgba(209, 250, 229, 0.88);
}

.tts-intro-model-status.is-ready .tts-intro-model-status__dot {
  background: #047857;
}

.tts-intro-model-status.is-error {
  color: #b91c1c;
  background: rgba(254, 226, 226, 0.9);
}

.tts-intro-model-status.is-error .tts-intro-model-status__dot {
  background: #dc2626;
}

@keyframes tts-status-pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.tts-intro-workflow {
  position: relative;
  z-index: 1;
  padding-top: 0;
}

.tts-intro-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.tts-intro-step {
  min-height: 122px;
  padding: 22px 26px;
  border: 1px solid transparent;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.045);
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.tts-intro-step:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 91, 194, 0.1);
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.07);
}

.tts-intro-step__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 48px;
  margin-bottom: 22px;
  border-radius: 12px;
}

.tts-intro-step__icon span {
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.tts-intro-step--primary .tts-intro-step__icon {
  background: rgba(165, 193, 255, 0.35);
  color: #005bc2;
}

.tts-intro-step--secondary .tts-intro-step__icon {
  background: rgba(255, 216, 231, 0.62);
  color: #a53173;
}

.tts-intro-step--tertiary .tts-intro-step__icon {
  background: rgba(105, 246, 184, 0.36);
  color: #006d4a;
}

.tts-intro-step h3 {
  margin: 0 0 12px;
  color: #2d3337;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.tts-intro-step p {
  margin: 0;
  color: #596063;
  font-size: 12px;
  line-height: 1.58;
}

.tts-intro-ring {
  position: absolute;
  right: 42px;
  bottom: -190px;
  z-index: 0;
  width: 330px;
  height: 330px;
  border: 64px solid rgba(45, 51, 55, 0.032);
  border-radius: 50%;
  pointer-events: none;
}

@media (max-width: 1400px) {
  .tts-intro-shell {
    padding: 26px 30px 22px;
  }

  
.tts-intro-breadcrumb {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1280px;
  margin: 0 auto 8px;
  color: #97a3b8;
  font-size: 13px;
  font-weight: 500;
}

.tts-intro-breadcrumb__separator {
  color: #b5bfd0;
}

.tts-intro-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #005bc2;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
}

.tts-intro-breadcrumb__link:hover,
.tts-intro-breadcrumb__current {
  color: #2d3337;
}

.tts-intro-main {
    max-width: 1180px;
  }

  .tts-intro-hero {
    min-height: 194px;
    padding-bottom: 12px;
  }

  .tts-intro-hero h1 {
    font-size: 56px;
  }

  .tts-intro-hero p {
    font-size: 13px;
  }

  .tts-intro-step {
    min-height: 108px;
    padding: 16px 20px;
  }
}
</style>
