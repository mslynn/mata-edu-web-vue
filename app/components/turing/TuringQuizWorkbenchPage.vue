<template>
  <div class="turing-quiz-workbench">
    <div v-if="loading" class="turing-quiz-workbench__placeholder">
      <span class="material-symbols-outlined">progress_activity</span>
      <p>{{ t("turingWorkbench.loading") }}</p>
    </div>

    <div v-else-if="loadError" class="turing-quiz-workbench__placeholder is-error">
      <span class="material-symbols-outlined">error</span>
      <p>{{ loadError }}</p>
      <button type="button" class="turing-quiz-workbench__retry" @click="initQuiz">
        {{ t("turingWorkbench.retry") }}
      </button>
    </div>

    <div v-else-if="!questions.length" class="turing-quiz-workbench__placeholder">
      <span class="material-symbols-outlined">inbox</span>
      <p>{{ t("turingWorkbench.empty") }}</p>
    </div>

    <template v-else-if="phase === 'review'">
      <div class="turing-review">
        <div class="turing-review__intro">
          <span class="turing-review__intro-emoji">😊</span>
          <span>{{ t("turingWorkbench.analysis.intro") }}</span>
        </div>

        <div class="turing-review__tabs">
          <button
            v-for="(question, index) in questions"
            :key="question.questionId"
            type="button"
            class="turing-review__tab"
            :class="getTabClass(question, index)"
            @click="reviewIndex = index"
          >
            {{ index + 1 }}
          </button>
        </div>

        <div v-if="currentReview" class="turing-review__panel">
          <div class="turing-review__question">
            <span class="turing-review__avatar">
              <span class="material-symbols-outlined">face</span>
            </span>
            <p>{{ currentReview.questionName }}</p>
          </div>

          <img
            v-if="currentReview.imageUrl"
            :src="currentReview.imageUrl"
            class="turing-review__question-image"
            alt=""
          />

          <div class="turing-review__options">
            <div
              v-for="option in getQuestionOptions(currentReview)"
              :key="option.optionCode"
              class="turing-review__option"
              :class="getReviewOptionClass(currentReview, option)"
            >
              <span class="turing-review__option-icon">
                <span class="material-symbols-outlined">help</span>
              </span>
              <div class="turing-review__option-body">
                <p>{{ option.answerText }}</p>
                <img
                  v-if="option.answerUrl"
                  :src="option.answerUrl"
                  class="turing-review__option-image"
                  alt=""
                />
              </div>
              <div class="turing-review__option-radio-row">
                <span
                  class="turing-review__radio"
                  :class="{ 'is-on': option.optionCode === getUserChoice(currentReview) }"
                >
                  <i v-if="option.optionCode === getUserChoice(currentReview)"></i>
                </span>
                <span>{{ t("turingWorkbench.analysis.humanAnswer") }}</span>
              </div>
            </div>
          </div>

          <div v-if="currentReview.analysis" class="turing-review__analysis">
            <strong>{{ t("turingWorkbench.analysis.analysisPrefix") }}</strong>
            <span>{{ currentReview.analysis }}</span>
          </div>
        </div>

        <button
          type="button"
          class="turing-review__nav turing-review__nav--prev"
          :disabled="reviewIndex === 0"
          @click="reviewIndex = Math.max(0, reviewIndex - 1)"
          :aria-label="t('turingWorkbench.analysis.prev')"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button
          type="button"
          class="turing-review__nav turing-review__nav--next"
          :disabled="reviewIndex >= questions.length - 1"
          @click="reviewIndex = Math.min(questions.length - 1, reviewIndex + 1)"
          :aria-label="t('turingWorkbench.analysis.next')"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>

        <div class="turing-review__footer">
          <button type="button" class="turing-review__retry" @click="restartQuiz">
            {{ t("turingWorkbench.analysis.tryAgain") }}
          </button>
        </div>
      </div>
    </template>

    <template v-else>
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

      <section v-if="currentQuestion" class="turing-question-card">
        <div class="turing-question-card__badge">{{ t("turingWorkbench.questionBadge") }}</div>
        <h2>{{ currentQuestion.questionName }}</h2>
        <img
          v-if="currentQuestion.imageUrl"
          :src="currentQuestion.imageUrl"
          class="turing-question-card__image"
          alt=""
        />
      </section>

      <section v-if="currentQuestion" class="turing-answer-grid">
        <article
          v-for="option in getQuestionOptions(currentQuestion)"
          :key="option.optionCode"
          class="turing-answer-card"
          :class="{ 'is-selected': selectedAnswerKey === option.optionCode }"
          @click="selectAnswer(option.optionCode)"
        >
          <div class="turing-answer-card__head">
            <span class="turing-answer-card__tag">{{ option.optionCode }}</span>
          </div>
          <p>{{ option.answerText }}</p>
          <img
            v-if="option.answerUrl"
            :src="option.answerUrl"
            class="turing-answer-card__image"
            alt=""
          />
          <div class="turing-answer-card__footer">
            <span>{{ t("turingWorkbench.answerHint") }}</span>
            <span class="turing-answer-card__radio">
              <i v-if="selectedAnswerKey === option.optionCode"></i>
            </span>
          </div>
        </article>
      </section>

      <div class="turing-quiz-workbench__actions">
        <button
          type="button"
          class="turing-quiz-workbench__submit"
          :disabled="!selectedAnswerKey || submitting"
          @click="handleSubmitClick"
        >
          <span>{{ submitButtonLabel }}</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </template>

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

        <h3>
          {{
            resultModal.success
              ? t("turingWorkbench.result.successTitle")
              : t("turingWorkbench.result.failTitle")
          }}
        </h3>
        <p>
          {{
            resultModal.success
              ? t("turingWorkbench.result.successDesc")
              : t("turingWorkbench.result.failDesc")
          }}
        </p>

        <div class="turing-result-modal__meta">
          <div class="turing-result-modal__meta-item">
            <span class="material-symbols-outlined">schedule</span>
            <span>{{ t("turingWorkbench.result.duration", { value: resultModal.duration }) }}</span>
          </div>
          <div class="turing-result-modal__meta-item">
            <span class="material-symbols-outlined">monitoring</span>
            <span>{{ t("turingWorkbench.result.accuracy", { value: resultModal.accuracy }) }}</span>
          </div>
        </div>

        <button type="button" class="turing-result-modal__action" @click="enterReview">
          {{ t("turingWorkbench.result.viewAnalysis") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { aiAdmin } from "~/composables/api/ai";

type TuringOption = {
  optionCode: string;
  answerText: string;
  answerUrl?: string | null;
};

type TuringQuestion = {
  questionId: string | number;
  questionName: string;
  imageUrl?: string | null;
  leftOption: TuringOption;
  rightOption: TuringOption;
  selectedOptionCode?: string;
  correctOptionCode?: string;
  correct?: boolean;
  analysis?: string;
};

type TuringAnswer = {
  questionId: string | number;
  humanOptionCode: string;
};

type TuringQuestionResult = TuringQuestion & {
  selectedOptionCode?: string;
  correctOptionCode?: string;
  correct?: boolean;
  analysis?: string;
};

type TuringSubmitResult = {
  pass?: boolean;
  accuracy?: number;
  correctCount?: number;
  totalCount?: number;
  durationSeconds?: number;
  questionResults?: TuringQuestionResult[];
};

const QUESTION_DURATION = 60;

const { t } = useI18n();
const { getTuringQuestions, submitTuringAnswers } = aiAdmin();

const questions = ref<TuringQuestion[]>([]);
const answers = ref<TuringAnswer[]>([]);
const currentIndex = ref(0);
const reviewIndex = ref(0);
const selectedAnswerKey = ref<string>("");
const timeLeft = ref(QUESTION_DURATION);
const loading = ref(false);
const loadError = ref<string>("");
const submitting = ref(false);
const phase = ref<"quiz" | "review">("quiz");
const startedAt = ref<number>(0);
const totalElapsedSeconds = ref<number>(0);
const robotScore = ref(0);
const humanScore = ref(0);

const resultModal = ref({
  visible: false,
  success: false,
  duration: "00:00",
  accuracy: "0%",
});

let countdownTimer: ReturnType<typeof setInterval> | null = null;

const totalSteps = computed(() => questions.value.length);
const currentStep = computed(() => Math.min(currentIndex.value + 1, totalSteps.value || 1));
const currentQuestion = computed(() => questions.value[currentIndex.value]);
const currentReview = computed(() => questions.value[reviewIndex.value]);
const isLastQuestion = computed(() =>
  totalSteps.value > 0 && currentIndex.value === totalSteps.value - 1
);

const getTabClass = (question: TuringQuestion, index: number) => ({
  "is-active": reviewIndex.value === index,
  "is-success": isQuestionCorrect(question),
  "is-error": hasGraded(question) && !isQuestionCorrect(question),
});
const submitButtonLabel = computed(() => {
  if (submitting.value) return t("turingWorkbench.submitting");
  return isLastQuestion.value
    ? t("turingWorkbench.submit")
    : t("turingWorkbench.analysis.nextQuestion");
});

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

const startCountdown = () => {
  stopCountdown();
  timeLeft.value = QUESTION_DURATION;
  countdownTimer = setInterval(() => {
    if (resultModal.value.visible || phase.value !== "quiz" || submitting.value) {
      return;
    }
    if (timeLeft.value <= 1) {
      timeLeft.value = 0;
      handleTimeout();
      return;
    }
    timeLeft.value -= 1;
  }, 1000);
};

const getQuestionOptions = (question: TuringQuestion): TuringOption[] => {
  const list: TuringOption[] = [];
  if (question?.leftOption) list.push(question.leftOption);
  if (question?.rightOption) list.push(question.rightOption);
  return list;
};

const handleTimeout = () => {
  const question = currentQuestion.value;
  if (!question) return;
  const options = getQuestionOptions(question);
  const fallbackCode =
    selectedAnswerKey.value || options[0]?.optionCode || "";
  selectedAnswerKey.value = fallbackCode;
  void advance();
};

const selectAnswer = (code: string) => {
  if (resultModal.value.visible || submitting.value) return;
  selectedAnswerKey.value = code;
};

const recordAnswer = () => {
  const question = currentQuestion.value;
  if (!question) return;
  const options = getQuestionOptions(question);
  const fallbackCode =
    selectedAnswerKey.value || options[0]?.optionCode || "";
  const existing = answers.value.find((a) => a.questionId === question.questionId);
  if (existing) {
    existing.humanOptionCode = fallbackCode;
  } else {
    answers.value.push({
      questionId: question.questionId,
      humanOptionCode: fallbackCode,
    });
  }
};

const advance = async () => {
  recordAnswer();
  if (isLastQuestion.value) {
    await finishAndSubmit();
    return;
  }
  currentIndex.value += 1;
  selectedAnswerKey.value = "";
  startCountdown();
};

const handleSubmitClick = () => {
  if (!selectedAnswerKey.value || submitting.value) return;
  void advance();
};

const formatDuration = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

const computeAccuracyText = (correct: number, total: number) => {
  if (!total) return "0%";
  return `${Math.round((correct / total) * 100)}%`;
};

const localCorrectCount = computed(() => {
  return questions.value.reduce((sum, question) => {
    const userChoice = answers.value.find(
      (a) => a.questionId === question.questionId
    )?.humanOptionCode;
    if (userChoice && userChoice === question.correctOptionCode) {
      return sum + 1;
    }
    return sum;
  }, 0);
});

const reviewCorrectCount = ref(0);
const reviewAccuracy = ref("0%");
const reviewDuration = ref("00:00");

const finishAndSubmit = async () => {
  stopCountdown();
  submitting.value = true;
  totalElapsedSeconds.value = startedAt.value
    ? Math.round((Date.now() - startedAt.value) / 1000)
    : 0;
  try {
    const result: TuringSubmitResult =
      (await submitTuringAnswers({ answers: answers.value as any })) || {};
    const total = result.totalCount ?? questions.value.length;
    const correct = result.correctCount ?? localCorrectCount.value;
    const passed =
      typeof result.pass === "boolean" ? result.pass : correct === total && total > 0;
    const durationSeconds = result.durationSeconds ?? totalElapsedSeconds.value;
    const accuracyText =
      typeof result.accuracy === "number"
        ? `${result.accuracy}%`
        : computeAccuracyText(correct, total);

    if (Array.isArray(result.questionResults) && result.questionResults.length) {
      questions.value = result.questionResults as TuringQuestion[];
    }

    humanScore.value = correct;
    robotScore.value = Math.max(0, total - correct);
    reviewCorrectCount.value = correct;
    reviewAccuracy.value = accuracyText;
    reviewDuration.value = formatDuration(durationSeconds);

    resultModal.value = {
      visible: true,
      success: passed,
      duration: formatDuration(durationSeconds),
      accuracy: accuracyText,
    };
  } catch (error: any) {
    console.error("[turing] submit failed", error);
    loadError.value = error?.message || t("turingWorkbench.submitFailed");
    selectedAnswerKey.value =
      answers.value.find((a) => a.questionId === currentQuestion.value?.questionId)
        ?.humanOptionCode || "";
    startCountdown();
  } finally {
    submitting.value = false;
  }
};

const enterReview = () => {
  resultModal.value.visible = false;
  reviewIndex.value = 0;
  phase.value = "review";
};

const getUserChoice = (question: TuringQuestion) => {
  const local = answers.value.find((a) => a.questionId === question.questionId)?.humanOptionCode;
  return local || question.selectedOptionCode || "";
};

const hasGraded = (question: TuringQuestion) =>
  typeof question.correct === "boolean" || !!question.correctOptionCode;

const isQuestionCorrect = (question: TuringQuestion) => {
  if (typeof question.correct === "boolean") return question.correct;
  const userChoice = getUserChoice(question);
  return !!userChoice && !!question.correctOptionCode && userChoice === question.correctOptionCode;
};

const getReviewOptionClass = (question: TuringQuestion, option: TuringOption) => {
  const isUserChoice = option.optionCode === getUserChoice(question);
  const isCorrect =
    !!question.correctOptionCode && option.optionCode === question.correctOptionCode;
  return {
    "is-correct": isCorrect,
    "is-user": isUserChoice,
    "is-wrong-user": isUserChoice && !!question.correctOptionCode && !isCorrect,
  };
};

const resetState = () => {
  stopCountdown();
  questions.value = [];
  answers.value = [];
  currentIndex.value = 0;
  reviewIndex.value = 0;
  selectedAnswerKey.value = "";
  timeLeft.value = QUESTION_DURATION;
  phase.value = "quiz";
  resultModal.value = { visible: false, success: false, duration: "00:00", accuracy: "0%" };
  loadError.value = "";
  totalElapsedSeconds.value = 0;
  robotScore.value = 0;
  humanScore.value = 0;
};

const initQuiz = async () => {
  resetState();
  loading.value = true;
  try {
    const data = await getTuringQuestions();
    const list = Array.isArray(data) ? data : Array.isArray(data?.list) ? data.list : [];
    questions.value = list as TuringQuestion[];
    if (questions.value.length) {
      startedAt.value = Date.now();
      startCountdown();
    }
  } catch (error: any) {
    console.error("[turing] load questions failed", error);
    loadError.value = error?.message || t("turingWorkbench.loadFailed");
  } finally {
    loading.value = false;
  }
};

const restartQuiz = () => {
  void initQuiz();
};

onMounted(() => {
  void initQuiz();
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

.turing-question-card__image {
  display: block;
  margin: 18px auto 0;
  max-width: 100%;
  max-height: 280px;
  border-radius: 16px;
  object-fit: contain;
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

.turing-answer-card__image {
  display: block;
  margin-top: 16px;
  max-width: 100%;
  max-height: 220px;
  border-radius: 14px;
  object-fit: contain;
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

.turing-quiz-workbench__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 320px;
  padding: 60px 24px;
  border-radius: 32px;
  background: #ffffff;
  color: #596063;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid rgba(172, 179, 183, 0.12);
}

.turing-quiz-workbench__placeholder.is-error {
  color: #ac3434;
}

.turing-quiz-workbench__placeholder .material-symbols-outlined {
  font-size: 36px;
  color: #005bc4;
}

.turing-quiz-workbench__placeholder.is-error .material-symbols-outlined {
  color: #ac3434;
}

.turing-quiz-workbench__retry {
  margin-top: 8px;
  height: 40px;
  padding: 0 22px;
  border: none;
  border-radius: 999px;
  background: #005bc4;
  color: #ffffff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(0, 91, 196, 0.18);
}

.turing-review {
  position: relative;
  padding: 28px 56px 32px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.18);
  box-shadow: 0 18px 40px rgba(16, 35, 63, 0.06);
}

.turing-review__intro {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
  color: #2d3337;
  font-size: 18px;
  font-weight: 800;
}

.turing-review__intro-emoji {
  font-size: 22px;
}

.turing-review__tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 22px;
}

.turing-review__tab {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: rgba(125, 135, 144, 0.16);
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.turing-review__tab.is-success {
  background: #10b981;
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.32);
}

.turing-review__tab.is-error {
  background: #d6555f;
  box-shadow: 0 6px 14px rgba(214, 85, 95, 0.32);
}

.turing-review__tab.is-active {
  transform: scale(1.18);
  outline: 3px solid rgba(0, 91, 196, 0.18);
}

.turing-review__panel {
  position: relative;
  padding: 24px 28px;
  border-radius: 20px;
  background: #f7faff;
  border: 1px solid rgba(0, 91, 196, 0.08);
}

.turing-review__question {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.turing-review__avatar {
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 91, 196, 0.1);
  color: #005bc4;
  box-shadow: 0 6px 14px rgba(0, 91, 196, 0.16);
}

.turing-review__avatar .material-symbols-outlined {
  font-size: 26px;
}

.turing-review__question p {
  flex: 1;
  margin: 0;
  padding: 16px 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 91, 196, 0.1);
  color: #2d3337;
  font-size: 18px;
  line-height: 1.6;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 91, 196, 0.05);
}

.turing-review__question-image {
  display: block;
  margin: 0 auto 22px;
  max-width: 100%;
  max-height: 240px;
  border-radius: 16px;
  object-fit: contain;
}

.turing-review__options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.turing-review__option {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px 22px 18px;
  border-radius: 18px;
  background: #eef1f5;
  border: 2px solid transparent;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.turing-review__option.is-correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.42);
}

.turing-review__option.is-wrong-user {
  background: rgba(214, 85, 95, 0.08);
  border-color: rgba(214, 85, 95, 0.36);
}

.turing-review__option-icon {
  position: absolute;
  top: -14px;
  left: 18px;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #4c95f0;
  color: #ffffff;
  box-shadow: 0 6px 14px rgba(76, 149, 240, 0.32);
}

.turing-review__option-icon .material-symbols-outlined {
  font-size: 20px;
}

.turing-review__option-body {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(172, 179, 183, 0.18);
  min-height: 110px;
}

.turing-review__option-body p {
  margin: 0;
  color: #2d3337;
  font-size: 15px;
  line-height: 1.7;
}

.turing-review__option-image {
  display: block;
  margin-top: 10px;
  max-width: 100%;
  max-height: 160px;
  border-radius: 10px;
  object-fit: contain;
}

.turing-review__option-radio-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #596063;
  font-size: 13px;
  font-weight: 700;
}

.turing-review__radio {
  width: 18px;
  height: 18px;
  border: 2px solid #acb3b7;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.turing-review__radio.is-on {
  border-color: #005bc4;
  background: #ffffff;
}

.turing-review__radio i {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #005bc4;
}

.turing-review__analysis {
  margin-top: 22px;
  padding: 16px 20px;
  border-radius: 14px;
  background: rgba(0, 91, 196, 0.04);
  border: 1px solid rgba(0, 91, 196, 0.08);
  color: #596063;
  font-size: 14px;
  line-height: 1.85;
}

.turing-review__analysis strong {
  color: #2d3337;
  font-weight: 800;
}

.turing-review__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: #ffffff;
  color: #005bc4;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(16, 35, 63, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.turing-review__nav .material-symbols-outlined {
  font-size: 24px;
}

.turing-review__nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.turing-review__nav--prev {
  left: 6px;
}

.turing-review__nav--next {
  right: 6px;
}

.turing-review__footer {
  display: flex;
  justify-content: center;
  margin-top: 26px;
}

.turing-review__retry {
  height: 48px;
  padding: 0 36px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffb255 0%, #f78a1c 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.06em;
  cursor: pointer;
  box-shadow: 0 12px 22px rgba(247, 138, 28, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.turing-review__retry:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(247, 138, 28, 0.32);
}

@media (max-width: 1180px) {
  .turing-review__options {
    grid-template-columns: 1fr;
  }

  .turing-review {
    padding: 24px 32px 28px;
  }
}
</style>
