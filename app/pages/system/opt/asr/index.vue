<template>
  <div class="asr-intro-page">
    <div class="asr-intro-shell">
      <nav class="asr-intro-breadcrumb" :aria-label="t('asrDemo.breadcrumbAria')">
        <button
          type="button"
          class="asr-intro-breadcrumb__link"
          @click="handleBackToAiCenter"
        >
          {{ t("asrDemo.aiPracticeCenter") }}
        </button>
        <span class="asr-intro-breadcrumb__separator">/</span>
        <span class="asr-intro-breadcrumb__current">{{ t("asrDemo.speechTranscription") }}</span>
      </nav>

      <main class="asr-intro-main">
        <section class="asr-intro-hero">
          <h1>
            {{ t("asrDemo.titleAsr") }}<span>{{ t("asrDemo.asrAbbr") }}</span>
          </h1>

          <p>
            {{ t("asrDemo.introDesc") }}
          </p>

          <button
            class="asr-intro-primary"
            type="button"
            :disabled="!canEnterExperience"
            @click="handleEnterExperience"
          >
            <span>{{ primaryButtonText }}</span>
            <span class="asr-intro-primary__arrow">→</span>
          </button>

          <div class="asr-intro-model-status" :class="`is-${asrStatus}`">
            <span class="asr-intro-model-status__dot"></span>
            <span>{{ modelStatusText }}</span>
          </div>
        </section>

        <section class="asr-intro-workflow">
          <div class="asr-intro-steps">
            <article
              v-for="step in workflowSteps"
              :key="step.title"
              class="asr-intro-step"
              :class="`asr-intro-step--${step.theme}`"
            >
              <div class="asr-intro-step__icon">
                <span>{{ step.icon }}</span>
              </div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </article>
          </div>
        </section>
      </main>

      <div class="asr-intro-ring" aria-hidden="true"></div>
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
  title: computed(() => t("asrDemo.pageTitle")),
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
    title: t("asrDemo.stepAudioCollection"),
    description: t("asrDemo.stepAudioCollectionDesc"),
    icon: "◉",
    theme: "primary",
  },
  {
    title: t("asrDemo.stepFeatureExtraction"),
    description: t("asrDemo.stepFeatureExtractionDesc"),
    icon: "≋",
    theme: "primary",
  },
  {
    title: t("asrDemo.stepAcousticModeling"),
    description: t("asrDemo.stepAcousticModelingDesc"),
    icon: "△",
    theme: "secondary",
  },
  {
    title: t("asrDemo.stepLanguageDecoding"),
    description: t("asrDemo.stepLanguageDecodingDesc"),
    icon: "✦",
    theme: "secondary",
  },
  {
    title: t("asrDemo.stepRealtimeOutput"),
    description: t("asrDemo.stepRealtimeOutputDesc"),
    icon: "☰",
    theme: "tertiary",
  },
  {
    title: t("asrDemo.stepResultArchive"),
    description: t("asrDemo.stepResultArchiveDesc"),
    icon: "▣",
    theme: "tertiary",
  },
]);

const canEnterExperience = computed(() => true);
const asrStatus = ref("ready");

const primaryButtonText = computed(() => t("asrDemo.startExperience"));
const modelStatusText = computed(() => t("asrDemo.modelStatusReady"));

const handleBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};

const handleEnterExperience = async () => {
  if (!canEnterExperience.value) return;
  await navigateTo("/system/opt/asr/speech");
};
</script>

<style scoped>
.asr-intro-page {
  height: calc(100% - 28px);
  min-height: 0;
  overflow: hidden;
  color: #2d3337;
  background: #f7f9fb;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.asr-intro-shell {
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

.asr-intro-breadcrumb {
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

.asr-intro-breadcrumb__separator {
  color: #b5bfd0;
}

.asr-intro-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #005bc2;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
}

.asr-intro-breadcrumb__link:hover,
.asr-intro-breadcrumb__current {
  color: #2d3337;
}

.asr-intro-main {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  height: calc(100% - 28px);
  min-height: 0;
  margin: 0 auto;
}

.asr-intro-hero {
  display: flex;
  min-height: 210px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px 14px;
  text-align: center;
}

.asr-intro-hero h1 {
  margin: 0 0 14px;
  color: #2d3337;
  font-size: clamp(52px, 4.2vw, 72px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.075em;
}

.asr-intro-hero h1 span {
  margin-left: 8px;
  color: #005bc2;
}

.asr-intro-hero p {
  max-width: 460px;
  margin: 10px 0 22px;
  color: rgba(89, 96, 99, 0.9);
  font-size: 13px;
  line-height: 1.85;
}

.asr-intro-primary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  min-width: 180px;
  height: 52px;
  padding: 0 28px;
  border-radius: 999px;
  background: #005bc2;
  color: #ffffff;
  border: none;
  font-size: 15px;
  font-weight: 900;
  box-shadow: 0 18px 38px rgba(0, 91, 194, 0.26);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.asr-intro-primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 44px rgba(0, 91, 194, 0.3);
}

.asr-intro-primary:disabled {
  cursor: not-allowed;
  background: #9aa6b2;
  opacity: 0.62;
  box-shadow: none;
}

.asr-intro-primary__arrow {
  font-size: 24px;
  line-height: 1;
}

.asr-intro-model-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  margin-top: 12px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(209, 250, 229, 0.88);
  color: #047857;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.asr-intro-model-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #047857;
}

.asr-intro-workflow {
  position: relative;
  z-index: 1;
}

.asr-intro-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.asr-intro-step {
  display: flex;
  min-height: 164px;
  flex-direction: column;
  gap: 12px;
  padding: 22px 22px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow:
    0 16px 40px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.asr-intro-step__icon {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 900;
}

.asr-intro-step--primary .asr-intro-step__icon {
  background: rgba(0, 91, 194, 0.1);
  color: #005bc2;
}

.asr-intro-step--secondary .asr-intro-step__icon {
  background: rgba(90, 103, 216, 0.12);
  color: #5948d3;
}

.asr-intro-step--tertiary .asr-intro-step__icon {
  background: rgba(28, 188, 124, 0.14);
  color: #059669;
}

.asr-intro-step h3 {
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  font-weight: 800;
}

.asr-intro-step p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.8;
}

.asr-intro-ring {
  position: absolute;
  right: -110px;
  bottom: -120px;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(0, 91, 194, 0.16) 0%, rgba(0, 91, 194, 0) 68%);
  pointer-events: none;
}

@media (max-width: 1400px) {
  .asr-intro-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .asr-intro-shell {
    height: auto;
    padding: 24px 18px 28px;
    overflow: visible;
  }

  .asr-intro-main {
    height: auto;
  }

  .asr-intro-hero {
    min-height: auto;
    padding: 12px 0 20px;
  }

  .asr-intro-hero h1 {
    font-size: 40px;
  }

  .asr-intro-steps {
    grid-template-columns: 1fr;
  }
}
</style>
