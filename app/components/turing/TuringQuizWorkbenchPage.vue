<template>
  <div class="turing-quiz-workbench">
    <div class="turing-quiz-workbench__header">
      <div>
        <h1>{{ t("turingWorkbench.title") }}</h1>
      </div>

      <div class="turing-quiz-workbench__meta">
        <div class="turing-quiz-workbench__scoreboard">
          <div class="turing-quiz-workbench__score-item">
            <span class="material-symbols-outlined">smart_toy</span>
            <div>
              <small>{{ t("turingWorkbench.robot") }}</small>
              <strong>{{ robotScore }}</strong>
            </div>
          </div>
          <div class="turing-quiz-workbench__score-item">
            <span class="material-symbols-outlined turing-quiz-workbench__score-item--secondary">person</span>
            <div>
              <small>{{ t("turingWorkbench.human") }}</small>
              <strong>{{ humanScore }}</strong>
            </div>
          </div>
        </div>

        <div class="turing-quiz-workbench__status-group">
          <div class="turing-quiz-workbench__timer">
            <span class="material-symbols-outlined">timer</span>
            <strong>{{ timeLeft }}s</strong>
          </div>
          <div class="turing-quiz-workbench__progress">
            {{ t("turingWorkbench.progress", { current: currentStep, total: totalSteps }) }}
          </div>
        </div>
      </div>
    </div>

    <section class="turing-question-card">
      <div class="turing-question-card__badge">{{ t("turingWorkbench.questionBadge") }}</div>
      <h2>{{ currentQuestion.question }}</h2>
    </section>

    <section class="turing-answer-grid">
      <article
        v-for="answer in currentQuestion.answers"
        :key="answer.key"
        class="turing-answer-card"
        :class="getAnswerCardClass(answer)"
        @click="selectAnswer(answer.key)"
      >
        <div class="turing-answer-card__head">
          <span class="turing-answer-card__tag">{{ answer.key }}</span>
          <span v-if="showAnalysis && isWrongAnswer(answer)" class="turing-answer-card__status is-error">
            {{ t("turingWorkbench.analysis.wrongOption") }}
          </span>
          <span v-else-if="showAnalysis && isCorrectAnswer(answer)" class="turing-answer-card__status is-success">
            {{ t("turingWorkbench.analysis.correctOption") }}
          </span>
        </div>
        <p>{{ answer.content }}</p>
        <div class="turing-answer-card__footer">
          <span>{{ getAnswerFooterText(answer) }}</span>
          <span class="turing-answer-card__radio">
            <i v-if="selectedAnswerKey === answer.key && !showAnalysis"></i>
            <span
              v-else-if="showAnalysis && isCorrectAnswer(answer)"
              class="material-symbols-outlined turing-answer-card__feedback is-success"
            >
              check
            </span>
            <span
              v-else-if="showAnalysis && isWrongAnswer(answer)"
              class="material-symbols-outlined turing-answer-card__feedback is-error"
            >
              close
            </span>
          </span>
        </div>
      </article>
    </section>

    <section v-if="showAnalysis" class="turing-analysis-card">
      <h3>
        <span class="material-symbols-outlined">auto_awesome</span>
        {{ t("turingWorkbench.analysis.title") }}
      </h3>
      <div class="turing-analysis-card__content">
        <p>{{ t("turingWorkbench.analysis.desc1") }}</p>
        <p>{{ t("turingWorkbench.analysis.desc2") }}</p>
        <p class="turing-analysis-card__note">{{ t("turingWorkbench.analysis.note") }}</p>
      </div>
    </section>

    <div class="turing-quiz-workbench__actions">
      <button
        type="button"
        class="turing-quiz-workbench__submit"
        :disabled="!selectedAnswerKey && !showAnalysis"
        @click="submitAnswer"
      >
        <span>{{ showAnalysis ? t("turingWorkbench.analysis.nextQuestion") : t("turingWorkbench.submit") }}</span>
        <span class="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>

    <div v-if="resultModal.visible" class="turing-result-modal" role="dialog" aria-modal="true">
      <div
        class="turing-result-modal__card"
        :class="resultModal.success ? 'is-success' : 'is-fail'"
      >
        <div class="turing-result-modal__icon-wrap">
          <div class="turing-result-modal__icon-outer"></div>
          <div class="turing-result-modal__icon-middle"></div>
          <div class="turing-result-modal__icon-inner">
            <span class="material-symbols-outlined">
              {{ resultModal.success ? "verified" : "sentiment_dissatisfied" }}
            </span>
          </div>
        </div>

        <h3>{{ resultModal.success ? t("turingWorkbench.result.successTitle") : t("turingWorkbench.result.failTitle") }}</h3>
        <p>{{ resultModal.success ? t("turingWorkbench.result.successDesc") : t("turingWorkbench.result.failDesc") }}</p>

        <div class="turing-result-modal__meta">
          <div class="turing-result-modal__meta-item">
            <span class="material-symbols-outlined">schedule</span>
            <span>{{ t("turingWorkbench.result.duration", { value: formattedElapsedTime }) }}</span>
          </div>
          <div class="turing-result-modal__meta-item">
            <span class="material-symbols-outlined">monitoring</span>
            <span>{{ t("turingWorkbench.result.accuracy", { value: resultModal.success ? '100%' : '0%' }) }}</span>
          </div>
        </div>

        <button type="button" class="turing-result-modal__action" @click="closeResultModal">
          {{ resultModal.success ? t("turingWorkbench.result.nextQuestion") : t("turingWorkbench.result.viewAnalysis") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

type AnswerOption = {
  key: "A" | "B";
  content: string;
  isHuman: boolean;
};

type QuestionItem = {
  question: string;
  answers: AnswerOption[];
};

const { t } = useI18n();

const robotScore = ref(0);
const humanScore = ref(0);
const timeLeft = ref(60);
const currentStep = ref(1);
const totalSteps = 5;
const selectedAnswerKey = ref<"A" | "B" | "">("");
const resultModal = ref({
  visible: false,
  success: false,
});
let countdownTimer: ReturnType<typeof setInterval> | null = null;
const showAnalysis = ref(false);
const pendingShowAnalysis = ref(false);

const currentQuestion = ref<QuestionItem>({
  question:
    "“如果你能感觉到‘亮度’，那你怎么定义它？是用波长还是用某种情感？”",
  answers: [
    {
      key: "A",
      content:
        "“对我而言，亮度更多是一种‘信息的清晰度’。就像当你突然理解了一个复杂的数学公式，或者在黑暗中找到了一根蜡烛。它既是物理的，也是认知的。”",
      isHuman: true,
    },
    {
      key: "B",
      content:
        "“亮度是通过视网膜接收到的电磁波强度，通常在400至700纳米之间。但在文学隐喻中，它代表着希望与觉醒。我倾向于将其视为一种可量化的感知指标。”",
      isHuman: false,
    },
  ],
});

const selectAnswer = (key: "A" | "B") => {
  if (resultModal.value.visible || showAnalysis.value) {
    return;
  }
  selectedAnswerKey.value = key;
};

const elapsedSeconds = computed(() => 60 - timeLeft.value);

const formattedElapsedTime = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60);
  const seconds = elapsedSeconds.value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

const startCountdown = () => {
  stopCountdown();
  countdownTimer = setInterval(() => {
    if (resultModal.value.visible || showAnalysis.value) {
      return;
    }

    if (timeLeft.value <= 1) {
      timeLeft.value = 0;
      robotScore.value += 1;
      openResultModal(false);
      return;
    }

    timeLeft.value -= 1;
  }, 1000);
};

const openResultModal = (success: boolean) => {
  stopCountdown();
  resultModal.value = {
    visible: true,
    success,
  };
};

const closeResultModal = () => {
  resultModal.value.visible = false;
  if (pendingShowAnalysis.value) {
    pendingShowAnalysis.value = false;
    showAnalysis.value = true;
    return;
  }

  if (resultModal.value.success) {
    currentStep.value = Math.min(totalSteps, currentStep.value + 1);
    selectedAnswerKey.value = "";
    timeLeft.value = 60;
    startCountdown();
  }
};

const isCorrectAnswer = (answer: AnswerOption) => answer.isHuman;
const isWrongAnswer = (answer: AnswerOption) => selectedAnswerKey.value === answer.key && !answer.isHuman;

const getAnswerCardClass = (answer: AnswerOption) => ({
  "is-selected": selectedAnswerKey.value === answer.key && !showAnalysis.value,
  "is-correct": showAnalysis.value && isCorrectAnswer(answer) && false,
  "is-wrong": showAnalysis.value && isWrongAnswer(answer),
});

const getAnswerFooterText = (answer: AnswerOption) => {
  if (!showAnalysis.value) {
    return t("turingWorkbench.answerHint");
  }

  return isCorrectAnswer(answer)
    ? t("turingWorkbench.analysis.humanAnswer")
    : t("turingWorkbench.analysis.aiAnswer");
};

const submitAnswer = () => {
  if (showAnalysis.value) {
    currentStep.value = Math.min(totalSteps, currentStep.value + 1);
    selectedAnswerKey.value = "";
    showAnalysis.value = false;
    timeLeft.value = 60;
    startCountdown();
    return;
  }

  if (resultModal.value.visible) {
    return;
  }
  const selected = currentQuestion.value.answers.find((item) => item.key === selectedAnswerKey.value);
  if (!selected) {
    return;
  }

  if (selected.isHuman) {
    humanScore.value += 1;
    openResultModal(true);
  } else {
    robotScore.value += 1;
    pendingShowAnalysis.value = true;
    openResultModal(false);
  }
};

onMounted(() => {
  startCountdown();
});

onBeforeUnmount(() => {
  stopCountdown();
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

.turing-quiz-workbench {
  width: 100%;
}

.turing-quiz-workbench__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  margin-bottom: 28px;
}

.turing-quiz-workbench__header h1 {
  margin: 0;
  color: #10233f;
  font-size: 40px;
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.turing-quiz-workbench__meta {
  display: flex;
  align-items: center;
  gap: 22px;
}

.turing-quiz-workbench__scoreboard {
  display: flex;
  gap: 12px;
  padding: 8px 18px 8px 8px;
  border-radius: 18px;
  background: #e3e9ec;
}

.turing-quiz-workbench__score-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.turing-quiz-workbench__score-item .material-symbols-outlined {
  color: #005bc4;
  font-size: 22px;
}

.turing-quiz-workbench__score-item--secondary {
  color: #a53173 !important;
}

.turing-quiz-workbench__score-item small {
  display: block;
  margin-bottom: 4px;
  color: #7d8790;
  font-size: 10px;
  font-weight: 700;
}

.turing-quiz-workbench__score-item strong {
  color: #2d3337;
  font-size: 18px;
  font-weight: 800;
}

.turing-quiz-workbench__status-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.turing-quiz-workbench__timer,
.turing-quiz-workbench__progress {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 0 18px;
  border-radius: 18px;
  font-weight: 800;
}

.turing-quiz-workbench__timer {
  color: #005a3c;
  background: rgba(105, 246, 184, 0.18);
  border: 1px solid rgba(0, 109, 74, 0.1);
}

.turing-quiz-workbench__progress {
  color: #005bc4;
  background: rgba(0, 91, 196, 0.06);
  border: 1px solid rgba(0, 91, 196, 0.08);
}

.turing-question-card {
  margin-bottom: 28px;
  padding: 34px 36px;
  border-radius: 32px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.1);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.04);
}

.turing-question-card__badge {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 14px;
  margin-bottom: 18px;
  border-radius: 999px;
  background: rgba(0, 91, 196, 0.1);
  color: #005bc4;
  font-size: 12px;
  font-weight: 800;
}

.turing-question-card h2 {
  margin: 0;
  color: #2d3337;
  text-align: center;
  font-size: 32px;
  line-height: 1.6;
  font-weight: 800;
}

.turing-answer-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.turing-answer-card {
  display: flex;
  flex-direction: column;
  min-height: 420px;
  padding: 34px;
  border-radius: 32px;
  border: 2px solid transparent;
  background: #f1f4f6;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.turing-answer-card:hover,
.turing-answer-card.is-selected {
  background: #ffffff;
  border-color: rgba(0, 91, 196, 0.18);
  box-shadow: 0 18px 34px rgba(0, 91, 196, 0.08);
}

.turing-answer-card.is-wrong {
  background: #fff1f0;
  border-color: rgba(172, 52, 52, 0.1);
}

.turing-answer-card__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 26px;
}

.turing-answer-card__tag {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #005bc4;
  font-size: 20px;
  font-weight: 900;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.turing-answer-card__status {
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 800;
}

.turing-answer-card__status.is-error {
  color: #ac3434;
  background: rgba(172, 52, 52, 0.1);
}

.turing-answer-card__status.is-success {
  color: #006d4a;
  background: rgba(0, 109, 74, 0.1);
}

.turing-answer-card p {
  flex: 1;
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  line-height: 1.95;
  font-style: italic;
}

.turing-answer-card__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(172, 179, 183, 0.2);
}

.turing-answer-card.is-wrong .turing-answer-card__footer {
  border-top-color: rgba(172, 52, 52, 0.1);
}

.turing-answer-card__footer span:first-child {
  color: #596063;
  font-size: 16px;
  font-weight: 800;
}

.turing-answer-card__radio {
  width: 30px;
  height: 30px;
  border: 2px solid #acb3b7;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.turing-answer-card.is-selected .turing-answer-card__radio {
  border-color: #005bc4;
  background: #005bc4;
}

.turing-answer-card__radio i {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #ffffff;
}

.turing-answer-card__feedback {
  font-size: 18px;
}

.turing-answer-card__feedback.is-success {
  color: #006d4a;
}

.turing-answer-card__feedback.is-error {
  color: #ac3434;
}

.turing-answer-card.is-correct .turing-answer-card__radio {
  border-color: #006d4a;
  background: rgba(0, 109, 74, 0.08);
}

.turing-answer-card.is-wrong .turing-answer-card__radio {
  border-color: #ac3434;
  background: #ffffff;
}

.turing-analysis-card {
  margin-top: 28px;
  padding: 36px 40px;
  border-radius: 32px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.1);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.04);
}

.turing-analysis-card h3 {
  margin: 0 0 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #005bc4;
  font-size: 24px;
  font-weight: 800;
}

.turing-analysis-card__content {
  color: #596063;
  font-size: 18px;
  line-height: 1.9;
}

.turing-analysis-card__content p {
  margin: 0 0 16px;
}

.turing-analysis-card__note {
  margin-top: 12px !important;
  padding-top: 16px;
  border-top: 1px solid rgba(172, 179, 183, 0.1);
  color: #9aa3ad;
  font-size: 14px;
}

.turing-quiz-workbench__actions {
  display: flex;
  justify-content: center;
  padding: 20px 0 8px;
}

.turing-quiz-workbench__submit {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 40px;
  border: none;
  border-radius: 999px;
  background: #005bc4;
  color: #f9f8ff;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(0, 91, 196, 0.22);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.turing-quiz-workbench__submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.turing-quiz-workbench__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.turing-result-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(11, 15, 16, 0.18);
  backdrop-filter: blur(10px);
}

.turing-result-modal__card {
  width: min(100%, 404px);
  min-height: 412px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 0 0;
  border-radius: 32px;
  background: #ffffff;
  box-shadow: 0 26px 60px rgba(16, 35, 63, 0.16);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.turing-result-modal__card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 6px;
}

.turing-result-modal__card.is-success::before {
  background: #10b981;
}

.turing-result-modal__card.is-fail::before {
  background: #d6555f;
}

.turing-result-modal__icon-wrap {
  position: relative;
  width: 114px;
  height: 114px;
  margin-top: 6px;
  margin-bottom: 20px;
}

.turing-result-modal__icon-outer,
.turing-result-modal__icon-middle,
.turing-result-modal__icon-inner {
  position: absolute;
  inset: 0;
  border-radius: 999px;
}

.turing-result-modal__icon-outer {
  transform: scale(1);
  opacity: 0.12;
}

.turing-result-modal__card.is-success .turing-result-modal__icon-outer {
  background: #10b981;
}

.turing-result-modal__card.is-fail .turing-result-modal__icon-outer {
  background: #c0266d;
}

.turing-result-modal__icon-middle {
  inset: 16px;
  opacity: 0.18;
}

.turing-result-modal__card.is-success .turing-result-modal__icon-middle {
  background: #10b981;
}

.turing-result-modal__card.is-fail .turing-result-modal__icon-middle {
  background: #c0266d;
}

.turing-result-modal__icon-inner {
  inset: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.14);
}

.turing-result-modal__card.is-success .turing-result-modal__icon-inner {
  background: #10b981;
}

.turing-result-modal__card.is-fail .turing-result-modal__icon-inner {
  background: #c0266d;
}

.turing-result-modal__icon-inner .material-symbols-outlined {
  font-size: 28px;
}

.turing-result-modal__card h3 {
  margin: 0 24px 14px;
  color: #2d3337;
  font-size: 28px;
  line-height: 1.28;
  font-weight: 900;
}

.turing-result-modal__card p {
  margin: 0 24px;
  max-width: 296px;
  color: rgba(89, 96, 99, 0.82);
  font-size: 14px;
  line-height: 1.8;
}

.turing-result-modal__meta {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
  padding: 18px 24px;
  background: rgba(241, 244, 246, 0.72);
  border-top: 1px solid rgba(172, 179, 183, 0.08);
  color: rgba(89, 96, 99, 0.62);
  font-size: 13px;
}

.turing-result-modal__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.turing-result-modal__meta-item .material-symbols-outlined {
  font-size: 18px;
}

.turing-result-modal__action {
  margin: 20px 0 24px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 999px;
  background: #005bc4;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(0, 91, 196, 0.18);
}

@media (max-width: 1180px) {
  .turing-quiz-workbench__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .turing-answer-grid {
    grid-template-columns: 1fr;
  }

  .turing-answer-card {
    min-height: 320px;
  }
}
</style>
