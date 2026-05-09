<template>
  <div class="asr-intro-page">
    <div class="asr-intro-shell">
      <nav class="asr-intro-breadcrumb" aria-label="面包屑">
        <button
          type="button"
          class="asr-intro-breadcrumb__link"
          @click="handleBackToAiCenter"
        >
          AI 实践中心
        </button>
        <span class="asr-intro-breadcrumb__separator">/</span>
        <span class="asr-intro-breadcrumb__current">语音转写</span>
      </nav>

      <main class="asr-intro-main">
        <section class="asr-intro-hero">
          <h1>
            语音转写<span>(ASR)</span>
          </h1>

          <p>
            语音转写（ASR）是一种将人类语音自动识别并转换为文本的人工智能技术，
            能够帮助课堂记录、语音检索、口语训练与教学内容沉淀更加高效。
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
definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "语音转写",
  htmlAttrs: {
    lang: "zh-CN",
  },
});

type WorkflowStep = {
  title: string;
  description: string;
  icon: string;
  theme: "primary" | "secondary" | "tertiary";
};

const workflowSteps: WorkflowStep[] = [
  {
    title: "语音采集",
    description: "从麦克风或音频源中采集语音信号，并完成基础降噪、增益与分段处理。",
    icon: "◉",
    theme: "primary",
  },
  {
    title: "特征提取",
    description: "将连续声波转换为便于模型识别的时频特征，保留语音中的关键发音信息。",
    icon: "≋",
    theme: "primary",
  },
  {
    title: "声学建模",
    description: "通过神经网络分析音频特征，判断每一段语音更接近哪些音素或字词候选。",
    icon: "△",
    theme: "secondary",
  },
  {
    title: "语言解码",
    description: "结合上下文与语言模型，对候选结果进行排序与修正，生成连贯可读的文本。",
    icon: "✦",
    theme: "secondary",
  },
  {
    title: "实时输出",
    description: "将临时识别结果与最终转写文本实时展示，方便课堂记录与后续整理。",
    icon: "☰",
    theme: "tertiary",
  },
  {
    title: "结果沉淀",
    description: "识别结果可复制、整理或继续用于教学分析、内容归档与知识检索。",
    icon: "▣",
    theme: "tertiary",
  },
];

const canEnterExperience = computed(() => true);
const asrStatus = ref("ready");

const primaryButtonText = computed(() => "立即体验");
const modelStatusText = computed(() => "浏览器实时识别体验已就绪。");

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
