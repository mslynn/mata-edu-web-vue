<template>
  <Teleport to="body">
    <Transition name="task-answer-fade">
      <div v-if="modelValue" class="task-answer-overlay">
        <button class="task-answer-close" @click="closeModal" aria-label="关闭">
          <svg class="task-answer-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="task-answer-panel">
          <header class="task-answer-header">
            <h2 class="task-answer-title">{{ displayTitle }}</h2>
            <div v-if="showStudentMeta" class="task-answer-student-meta">
              <span class="task-answer-student-name" :title="studentDisplayName || '学生'">{{
                studentDisplayName || "学生"
              }}</span>
              <span class="task-answer-student-sep">:</span>
              <span class="task-answer-student-stars">
                <StarRating
                  :model-value="studentScoreStars"
                  :size="18"
                  :gap="2"
                  fill-color="#f7b84b"
                  empty-color="#d5dbe3"
                  readonly
                />
              </span>
            </div>
          </header>

          <div class="task-answer-content">
            <div v-if="loading" class="task-answer-loading">
              <el-skeleton v-for="idx in 2" :key="`skeleton_${idx}`" animated>
                <template #template>
                  <div class="task-answer-skeleton-item">
                    <el-skeleton-item variant="text" style="width: 220px; height: 24px" />
                    <el-skeleton-item v-for="line in 4" :key="line" variant="text" style="width: 320px; height: 18px" />
                  </div>
                </template>
              </el-skeleton>
            </div>

            <div v-else-if="questions.length > 0" class="task-answer-question-list">
              <section v-for="(question, index) in questions" :key="question.id" class="task-answer-question">
                <h3 v-if="question.type !== 'blank'" class="task-answer-question-title">
                  <span>{{ index + 1 }}. {{ question.title }}</span>
                  <span
                    v-if="question.score !== null && question.score !== undefined"
                    class="task-answer-question-score"
                  >
                    {{ question.score }}分
                  </span>
                </h3>
                <div v-if="question.imageUrl" class="task-answer-question-image-wrap">
                  <img :src="question.imageUrl" class="task-answer-question-image" alt="题目图片" />
                </div>

                <div
                  v-if="question.type === 'single' || question.type === 'judge'"
                  class="task-answer-option-list"
                >
                  <label
                    v-for="option in question.options"
                    :key="option.id"
                    class="task-answer-option-item"
                  >
                    <input
                      v-model="singleAnswers[question.id]"
                      class="task-answer-input"
                      type="radio"
                      :name="`single_${question.id}`"
                      :value="option.id"
                      :disabled="readonly"
                    />
                    <div class="task-answer-option-content">
                      <span class="task-answer-option-text">{{ option.label }}.</span>
                      <span v-if="option.text" class="task-answer-option-text">{{ option.text }}</span>
                      <img
                        v-if="option.imageUrl"
                        :src="option.imageUrl"
                        class="task-answer-option-image"
                        alt="选项图片"
                      />
                    </div>
                  </label>
                </div>

                <div v-else-if="question.type === 'multiple'" class="task-answer-option-list">
                  <label
                    v-for="option in question.options"
                    :key="option.id"
                    class="task-answer-option-item"
                  >
                    <input
                      v-model="multipleAnswers[question.id]"
                      class="task-answer-input"
                      type="checkbox"
                      :value="option.id"
                      :disabled="readonly"
                    />
                    <div class="task-answer-option-content">
                      <span class="task-answer-option-text">{{ option.label }}.</span>
                      <span v-if="option.text" class="task-answer-option-text">{{ option.text }}</span>
                      <img
                        v-if="option.imageUrl"
                        :src="option.imageUrl"
                        class="task-answer-option-image"
                        alt="选项图片"
                      />
                    </div>
                  </label>
                </div>

                <div v-else-if="question.type === 'blank'" class="task-answer-blank-inline">
                  <span class="task-answer-blank-index">{{ index + 1 }}.</span>
                  <template
                    v-for="(part, partIndex) in getBlankRenderParts(question)"
                    :key="`blank_part_${question.id}_${partIndex}`"
                  >
                    <span v-if="part.text" class="task-answer-blank-text">{{ part.text }}</span>
                    <input
                      v-if="part.blankIndex"
                      v-model="ensureBlankAnswers(question.id)[part.blankIndex]"
                      class="task-answer-blank-inline-input"
                      type="text"
                      :placeholder="`第${part.blankIndex}空`"
                      :readonly="readonly"
                    />
                  </template>
                </div>

                <div
                  v-else-if="question.type === 'connect'"
                  class="task-answer-connect-board"
                  :ref="(el) => setConnectBoardRef(question.id, el as HTMLElement | null)"
                >
                  <svg class="task-answer-connect-svg" preserveAspectRatio="none">
                    <line
                      v-for="line in getConnectLines(question)"
                      :key="`line_${question.id}_${line.sourceId}_${line.targetId}`"
                      class="task-answer-connect-line"
                      :x1="line.x1"
                      :y1="line.y1"
                      :x2="line.x2"
                      :y2="line.y2"
                    />
                    <line
                      v-if="getDraggingLine(question.id)"
                      class="task-answer-connect-line task-answer-connect-line--dragging"
                      :x1="getDraggingLine(question.id)?.x1"
                      :y1="getDraggingLine(question.id)?.y1"
                      :x2="getDraggingLine(question.id)?.x2"
                      :y2="getDraggingLine(question.id)?.y2"
                    />
                  </svg>

                  <div class="task-answer-connect-columns">
                    <div class="task-answer-connect-column">
                      <div
                        v-for="source in getSourceOptions(question)"
                        :key="`source_${question.id}_${source.id}`"
                        class="task-answer-connect-row"
                      >
                        <div class="task-answer-connect-content">
                          <img
                            v-if="source.imageUrl"
                            :src="source.imageUrl"
                            class="task-answer-connect-image"
                            alt="连线题选项图片"
                            @load="handleConnectAssetLoaded"
                            @error="handleConnectAssetLoaded"
                          />
                          <span
                            v-if="source.text || !source.imageUrl"
                            class="task-answer-connect-label"
                          >
                            {{ source.text || source.label }}
                          </span>
                        </div>
                        <button
                          type="button"
                          class="task-answer-connect-dot task-answer-connect-dot--source"
                          :class="{ 'is-linked': !!connectAnswers[question.id]?.[source.id] }"
                          :ref="
                            (el) =>
                              setConnectPointRef(
                                question.id,
                                'source',
                                source.id,
                                el as HTMLElement | null
                              )
                          "
                          :disabled="readonly"
                          @pointerdown="handleConnectPointerDown($event, question.id, source.id)"
                        >
                          <span
                            v-if="connectAnswers[question.id]?.[source.id]"
                            class="task-answer-connect-dot-core"
                          ></span>
                        </button>
                      </div>
                    </div>

                    <div class="task-answer-connect-column task-answer-connect-column--target">
                      <div
                        v-for="target in getTargetOptions(question)"
                        :key="`target_${question.id}_${target.id}`"
                        class="task-answer-connect-row"
                      >
                        <button
                          type="button"
                          class="task-answer-connect-dot task-answer-connect-dot--target"
                          :class="{ 'is-linked': isTargetLinked(question.id, target.id) }"
                          :data-question-id="question.id"
                          :data-connect-target-id="target.id"
                          :ref="
                            (el) =>
                              setConnectPointRef(
                                question.id,
                                'target',
                                target.id,
                                el as HTMLElement | null
                              )
                          "
                        >
                          <span
                            v-if="isTargetLinked(question.id, target.id)"
                            class="task-answer-connect-dot-core"
                          ></span>
                        </button>
                        <div class="task-answer-connect-content">
                          <img
                            v-if="target.imageUrl"
                            :src="target.imageUrl"
                            class="task-answer-connect-image"
                            alt="连线题选项图片"
                            @load="handleConnectAssetLoaded"
                            @error="handleConnectAssetLoaded"
                          />
                          <span
                            v-if="target.text || !target.imageUrl"
                            class="task-answer-connect-label"
                          >
                            {{ target.text || target.label }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div v-else class="task-answer-empty">暂无题目</div>
          </div>

          <footer v-if="!readonly" class="task-answer-footer">
            <button
              class="task-answer-submit"
              :disabled="loading || submitting || questions.length === 0"
              @click="handleSubmit"
            >
              {{ submitting ? "提交中..." : "提交" }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { student, type StudentTaskAnswer } from "~/composables/api/student";
import { taskmanagementcenterApi } from "~/composables/api/taskmanagement";
import StarRating from "~/components/ui/StarRating.vue";

const STUDENT_TASK_ANSWER_MESSAGE_Z_INDEX = 2400;

const showSuccessMessage = (message: string) =>
  ElMessage({ message, type: "success", zIndex: STUDENT_TASK_ANSWER_MESSAGE_Z_INDEX });

const showWarningMessage = (message: string) =>
  ElMessage({ message, type: "warning", zIndex: STUDENT_TASK_ANSWER_MESSAGE_Z_INDEX });

const showConfirmDialog = (
  message: string,
  title: string,
  options: Record<string, unknown> = {},
) => ElMessageBox.confirm(message, title, { ...options, zIndex: STUDENT_TASK_ANSWER_MESSAGE_Z_INDEX });
import { normalizeRatePercent, percentToStars, scoreToStars } from "~/utils/star-rating";

interface QuestionOption {
  id: string;
  label: string;
  text: string;
  groupType: string;
  image?: string;
  imageUrl?: string;
}

interface QuestionItem {
  id: string;
  title: string;
  type: "single" | "multiple" | "judge" | "blank" | "connect";
  imageUrl?: string;
  score?: number | null;
  blankCount: number;
  options: QuestionOption[];
  raw: any;
}

interface BlankRenderPart {
  text: string;
  blankIndex: number | null;
}

interface ConnectLine {
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ConnectDragState {
  active: boolean;
  questionId: string;
  sourceId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

type ConnectPointSide = "source" | "target";

const props = defineProps<{
  modelValue: boolean;
  taskId?: string | null;
  evaluationId?: string | null;
  taskName?: string;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submitted: [];
}>();

const { getTaskIdDetail, getEvaluationWithAnswers } = taskmanagementcenterApi();
const { submitStudentTask, submitEvaluation } = student();

const loading = ref(false);
const submitting = ref(false);
const detailData = ref<any>(null);
const questions = ref<QuestionItem[]>([]);
const singleAnswers = reactive<Record<string, string>>({});
const multipleAnswers = reactive<Record<string, string[]>>({});
const blankAnswers = reactive<Record<string, Record<number, string>>>({});
const connectAnswers = reactive<Record<string, Record<string, string>>>({});
const connectBoardRefs = reactive<Record<string, HTMLElement | null>>({});
const connectPointRefs = reactive<Record<string, HTMLElement | null>>({});
const connectLayoutVersion = ref(0);
const connectBoardResizeObserver = ref<ResizeObserver | null>(null);
const connectDragState = reactive<ConnectDragState>({
  active: false,
  questionId: "",
  sourceId: "",
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
});

const firstNonEmptyString = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const firstIdString = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const blankPlaceholderRegex = /_{2,}|＿{2,}|﹍{2,}|（\s*）|\(\s*\)/g;

const getBlankRenderParts = (question: QuestionItem): BlankRenderPart[] => {
  const title = String(question.title || "");
  const placeholders = title.match(blankPlaceholderRegex) || [];
  const parts = title.split(blankPlaceholderRegex);
  const slotCount = Math.max(question.blankCount, placeholders.length);
  const result: BlankRenderPart[] = [];

  if (placeholders.length > 0) {
    parts.forEach((part, index) => {
      if (part) {
        result.push({ text: part, blankIndex: null });
      }
      if (index < placeholders.length) {
        result.push({ text: "", blankIndex: index + 1 });
      }
    });
    for (let idx = placeholders.length + 1; idx <= slotCount; idx += 1) {
      result.push({ text: "", blankIndex: idx });
    }
    return result;
  }

  if (title) {
    result.push({ text: title, blankIndex: null });
  }
  for (let idx = 1; idx <= slotCount; idx += 1) {
    result.push({ text: "", blankIndex: idx });
  }
  return result;
};

const normalizeQuestionType = (value: any): QuestionItem["type"] => {
  const text = String(value ?? "").toLowerCase();
  if (text === "single" || text === "1" || text.includes("单选")) return "single";
  if (text === "multiple" || text === "2" || text.includes("多选")) return "multiple";
  if (text === "judge" || text === "3" || text.includes("判断")) return "judge";
  if (text === "blank" || text === "4" || text.includes("填空")) return "blank";
  return "connect";
};

const normalizeOption = (option: any, index: number): QuestionOption => {
  const label = firstNonEmptyString(option?.optionLabel, option?.label);
  return {
    id: firstIdString(option?.optionId, option?.id, option?.tempId, option?.optionTempId, index + 1),
    label: label || String.fromCharCode(65 + index),
    text: firstNonEmptyString(option?.optionText, option?.text, option?.content, option?.name),
    groupType: firstNonEmptyString(option?.groupType).toLowerCase(),
    image: firstNonEmptyString(option?.imageOssId, option?.ossId, option?.image),
    imageUrl: firstNonEmptyString(option?.imageUrl, option?.optionImageUrl, option?.imgUrl, option?.url),
  };
};

const normalizeQuestionScore = (value: any): number | null => {
  const score = Number(value);
  if (Number.isNaN(score)) return null;
  return score;
};

const normalizeQuestions = (data: any): QuestionItem[] => {
  const list = Array.isArray(data?.questions) ? data.questions : [];
  return list
    .map((question: any, index: number) => {
      const answers = Array.isArray(question?.answers) ? question.answers : [];
      const blankCount = Math.max(
        Number(question?.blankCount ?? 0),
        Number(question?.blankNumber ?? 0),
        answers.length
      );
      return {
        id: firstIdString(question?.questionId, question?.id, question?.tempId, index + 1),
        title: firstNonEmptyString(question?.questionName, question?.title, question?.name, "未命名题目"),
        type: normalizeQuestionType(question?.questionType ?? question?.type),
        imageUrl: firstNonEmptyString(question?.imageUrl, question?.questionImageUrl, question?.imgUrl),
        score: normalizeQuestionScore(question?.score ?? question?.questionScore),
        blankCount: blankCount > 0 ? blankCount : 1,
        options: (Array.isArray(question?.options) ? question.options : []).map(normalizeOption),
        raw: question,
      };
    })
    .filter((question: QuestionItem) => !!question.id);
};

const clearRecord = (target: Record<string, any>) => {
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
};

const clearAnswerState = () => {
  clearRecord(singleAnswers);
  clearRecord(multipleAnswers);
  clearRecord(blankAnswers);
  clearRecord(connectAnswers);
};

const fillAnswerStateFromDetail = () => {
  clearAnswerState();
  questions.value.forEach((question) => {
    const key = question.id;
    if (question.type === "multiple") {
      multipleAnswers[key] = [];
    } else if (question.type === "blank") {
      blankAnswers[key] = {};
    } else if (question.type === "connect") {
      connectAnswers[key] = {};
    } else {
      singleAnswers[key] = "";
    }

    const studentAnswer = question.raw?.studentAnswer;
    if (!studentAnswer) return;

    if (question.type === "single" || question.type === "judge") {
      const optionId = firstIdString(
        studentAnswer?.optionId,
        studentAnswer?.optionid,
        studentAnswer?.optionID
      );
      if (optionId) singleAnswers[key] = optionId;
      return;
    }

    if (question.type === "multiple") {
      const optionIds = Array.isArray(studentAnswer?.optionIds) ? studentAnswer.optionIds : [];
      multipleAnswers[key] = optionIds.map((item: any) => firstIdString(item)).filter(Boolean);
      return;
    }

    if (question.type === "blank") {
      const list = Array.isArray(studentAnswer?.blankAnswers) ? studentAnswer.blankAnswers : [];
      const answerMap: Record<number, string> = {};
      list.forEach((item: any) => {
        const index = Number(item?.index);
        if (index > 0) {
          answerMap[index] = String(item?.text ?? "");
        }
      });
      blankAnswers[key] = answerMap;
      return;
    }

    const list = Array.isArray(studentAnswer?.connectAnswers) ? studentAnswer.connectAnswers : [];
    const answerMap: Record<string, string> = {};
    list.forEach((item: any) => {
      const sourceOptionId = firstIdString(item?.sourceOptionId);
      const targetOptionId = firstIdString(item?.targetOptionId);
      if (sourceOptionId && targetOptionId) {
        answerMap[sourceOptionId] = targetOptionId;
      }
    });
    connectAnswers[key] = answerMap;
  });
};

const displayTitle = computed(() => {
  return firstNonEmptyString(
    detailData.value?.evaluationName,
    detailData.value?.exerciseName,
    detailData.value?.taskInfo?.taskName,
    detailData.value?.taskName,
    props.taskName,
    "任务练习"
  );
});

const studentDisplayName = computed(() => {
  return firstNonEmptyString(
    detailData.value?.taskInfo?.studentName,
    detailData.value?.studentName,
    detailData.value?.taskInfo?.userName,
    detailData.value?.userName
  );
});

const studentScoreStars = computed(() => {
  const taskInfo = detailData.value?.taskInfo || {};
  const rootData = detailData.value || {};
  const directRate =
    normalizeRatePercent(taskInfo?.correctRate) ??
    normalizeRatePercent(rootData?.correctRate) ??
    normalizeRatePercent(taskInfo?.accuracy) ??
    normalizeRatePercent(rootData?.accuracy) ??
    normalizeRatePercent(taskInfo?.accuracyRate) ??
    normalizeRatePercent(rootData?.accuracyRate);

  if (directRate !== null) {
    return percentToStars(directRate);
  }

  return scoreToStars(taskInfo?.score ?? rootData?.score, taskInfo?.totalScore ?? rootData?.totalScore);
});

const showStudentMeta = computed(() => {
  if (props.evaluationId) {
    return false;
  }
  return props.readonly || !!studentDisplayName.value || studentScoreStars.value > 0;
});

const ensureMultipleAnswers = (questionId: string) => {
  if (!Array.isArray(multipleAnswers[questionId])) {
    multipleAnswers[questionId] = [];
  }
  return multipleAnswers[questionId];
};

const ensureBlankAnswers = (questionId: string) => {
  if (!blankAnswers[questionId]) {
    blankAnswers[questionId] = {};
  }
  return blankAnswers[questionId];
};

const ensureConnectAnswers = (questionId: string) => {
  if (!connectAnswers[questionId]) {
    connectAnswers[questionId] = {};
  }
  return connectAnswers[questionId];
};

const connectPointKey = (
  questionId: string,
  side: ConnectPointSide,
  optionId: string
) => `${questionId}__${side}__${optionId}`;

const refreshConnectLayout = () => {
  connectLayoutVersion.value += 1;
};

const scheduleConnectLayoutRefresh = () => {
  refreshConnectLayout();
  if (typeof window !== "undefined") {
    window.requestAnimationFrame(() => {
      refreshConnectLayout();
      window.requestAnimationFrame(() => {
        refreshConnectLayout();
      });
    });
  }
};

const handleConnectAssetLoaded = () => {
  scheduleConnectLayoutRefresh();
};

const setConnectBoardRef = (questionId: string, element: HTMLElement | null) => {
  const previousElement = connectBoardRefs[questionId];
  if (element) {
    if (previousElement !== element) {
      if (previousElement && connectBoardResizeObserver.value) {
        connectBoardResizeObserver.value.unobserve(previousElement);
      }
      connectBoardRefs[questionId] = element;
      if (connectBoardResizeObserver.value) {
        connectBoardResizeObserver.value.observe(element);
      }
      scheduleConnectLayoutRefresh();
    }
  } else if (previousElement) {
    if (connectBoardResizeObserver.value) {
      connectBoardResizeObserver.value.unobserve(previousElement);
    }
    delete connectBoardRefs[questionId];
    scheduleConnectLayoutRefresh();
  }
};

const setConnectPointRef = (
  questionId: string,
  side: ConnectPointSide,
  optionId: string,
  element: HTMLElement | null
) => {
  const key = connectPointKey(questionId, side, optionId);
  if (element) {
    if (connectPointRefs[key] !== element) {
      connectPointRefs[key] = element;
    }
  } else if (connectPointRefs[key]) {
    delete connectPointRefs[key];
  }
};

const getRelativeCenterPoint = (board: HTMLElement, pointElement: HTMLElement) => {
  const boardRect = board.getBoundingClientRect();
  const pointRect = pointElement.getBoundingClientRect();
  return {
    x: pointRect.left - boardRect.left + pointRect.width / 2,
    y: pointRect.top - boardRect.top + pointRect.height / 2,
  };
};

const getConnectLine = (
  questionId: string,
  sourceId: string,
  targetId: string
): ConnectLine | null => {
  const board = connectBoardRefs[questionId];
  const sourcePoint = connectPointRefs[connectPointKey(questionId, "source", sourceId)];
  const targetPoint = connectPointRefs[connectPointKey(questionId, "target", targetId)];
  if (!board || !sourcePoint || !targetPoint) return null;
  const sourcePos = getRelativeCenterPoint(board, sourcePoint);
  const targetPos = getRelativeCenterPoint(board, targetPoint);
  return {
    sourceId,
    targetId,
    x1: sourcePos.x,
    y1: sourcePos.y,
    x2: targetPos.x,
    y2: targetPos.y,
  };
};

const getConnectAnswerMap = (questionId: string): Record<string, string> => {
  return connectAnswers[questionId] || {};
};

const getConnectLines = (question: QuestionItem): ConnectLine[] => {
  connectLayoutVersion.value;
  const answerMap = getConnectAnswerMap(question.id);
  return Object.entries(answerMap)
    .map(([sourceId, targetId]) =>
      getConnectLine(question.id, sourceId, firstIdString(targetId))
    )
    .filter((line): line is ConnectLine => !!line);
};

const getDraggingLine = (questionId: string): ConnectLine | null => {
  connectLayoutVersion.value;
  if (!connectDragState.active || connectDragState.questionId !== questionId) {
    return null;
  }
  return {
    sourceId: connectDragState.sourceId,
    targetId: "",
    x1: connectDragState.x1,
    y1: connectDragState.y1,
    x2: connectDragState.x2,
    y2: connectDragState.y2,
  };
};

const isTargetLinked = (questionId: string, targetId: string) => {
  const answerMap = getConnectAnswerMap(questionId);
  return Object.values(answerMap).some((value) => firstIdString(value) === targetId);
};

const updateDraggingPoint = (clientX: number, clientY: number) => {
  const board = connectBoardRefs[connectDragState.questionId];
  if (!board) return;
  const boardRect = board.getBoundingClientRect();
  connectDragState.x2 = clientX - boardRect.left;
  connectDragState.y2 = clientY - boardRect.top;
  refreshConnectLayout();
};

const finishConnectDrag = () => {
  connectDragState.active = false;
  connectDragState.questionId = "";
  connectDragState.sourceId = "";
  connectDragState.x1 = 0;
  connectDragState.y1 = 0;
  connectDragState.x2 = 0;
  connectDragState.y2 = 0;
  if (typeof window !== "undefined") {
    window.removeEventListener("pointermove", onConnectPointerMove);
    window.removeEventListener("pointerup", onConnectPointerUp);
    window.removeEventListener("pointercancel", onConnectPointerUp);
  }
  refreshConnectLayout();
};

const applyConnectAnswer = (questionId: string, sourceId: string, targetId: string) => {
  if (!questionId || !sourceId || !targetId) return;
  const answerMap = ensureConnectAnswers(questionId);
  Object.keys(answerMap).forEach((currentSourceId) => {
    if (currentSourceId !== sourceId && firstIdString(answerMap[currentSourceId]) === targetId) {
      delete answerMap[currentSourceId];
    }
  });
  answerMap[sourceId] = targetId;
  refreshConnectLayout();
};

const onConnectPointerMove = (event: PointerEvent) => {
  if (!connectDragState.active) return;
  updateDraggingPoint(event.clientX, event.clientY);
};

const onConnectPointerUp = (event: PointerEvent) => {
  if (!connectDragState.active) return;
  const questionId = connectDragState.questionId;
  const sourceId = connectDragState.sourceId;
  const hitElement = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
  const targetElement = hitElement?.closest("[data-connect-target-id]") as HTMLElement | null;
  if (targetElement) {
    const targetQuestionId = firstNonEmptyString(targetElement.dataset.questionId);
    const targetId = firstNonEmptyString(targetElement.dataset.connectTargetId);
    if (targetQuestionId === questionId && targetId) {
      applyConnectAnswer(questionId, sourceId, targetId);
    }
  }
  finishConnectDrag();
};

const startConnectDrag = (
  event: PointerEvent,
  questionId: string,
  sourceId: string
) => {
  if (typeof window === "undefined") return;
  const board = connectBoardRefs[questionId];
  const sourcePoint = connectPointRefs[connectPointKey(questionId, "source", sourceId)];
  if (!board || !sourcePoint) return;

  const sourcePos = getRelativeCenterPoint(board, sourcePoint);
  connectDragState.active = true;
  connectDragState.questionId = questionId;
  connectDragState.sourceId = sourceId;
  connectDragState.x1 = sourcePos.x;
  connectDragState.y1 = sourcePos.y;
  connectDragState.x2 = sourcePos.x;
  connectDragState.y2 = sourcePos.y;

  window.addEventListener("pointermove", onConnectPointerMove);
  window.addEventListener("pointerup", onConnectPointerUp);
  window.addEventListener("pointercancel", onConnectPointerUp);
  updateDraggingPoint(event.clientX, event.clientY);
  event.preventDefault();
};

const handleConnectPointerDown = (
  event: PointerEvent,
  questionId: string,
  sourceId: string
) => {
  if (props.readonly) return;
  startConnectDrag(event, questionId, sourceId);
};

const getSourceOptions = (question: QuestionItem) => {
  const sourceOptions = question.options.filter((option) => option.groupType === "source");
  if (sourceOptions.length > 0) return sourceOptions;
  const mid = Math.ceil(question.options.length / 2);
  return question.options.slice(0, mid);
};

const getTargetOptions = (question: QuestionItem) => {
  const targetOptions = question.options.filter((option) => option.groupType === "target");
  if (targetOptions.length > 0) return targetOptions;
  const mid = Math.ceil(question.options.length / 2);
  return question.options.slice(mid);
};

const fetchTaskDetail = async () => {
  if (!props.taskId && !props.evaluationId) return;
  loading.value = true;
  try {
    if (props.evaluationId) {
      detailData.value = await getEvaluationWithAnswers(String(props.evaluationId));
    } else {
      detailData.value = await getTaskIdDetail(String(props.taskId));
    }
    questions.value = normalizeQuestions(detailData.value);
    fillAnswerStateFromDetail();
    await nextTick();
    scheduleConnectLayoutRefresh();
  } catch (error: any) {
    console.error("获取任务题目失败", error);
    detailData.value = null;
    questions.value = [];
    clearAnswerState();
    scheduleConnectLayoutRefresh();
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit("update:modelValue", false);
};

const resolveSubmitTargetId = () => {
  return firstIdString(
    detailData.value?.taskInfo?.taskId,
    detailData.value?.taskId,
    detailData.value?.taskid,
    detailData.value?.taskID,
    props.taskId
  );
};

const buildSubmitAnswers = (): StudentTaskAnswer[] => {
  const answers: StudentTaskAnswer[] = [];
  questions.value.forEach((question) => {
    if (!question.id) return;

    if (question.type === "single" || question.type === "judge") {
      const optionId = firstIdString(singleAnswers[question.id]);
      if (optionId) {
        answers.push({ questionId: question.id, optionId });
      }
      return;
    }

    if (question.type === "multiple") {
      const optionIds = ensureMultipleAnswers(question.id).map((item) => firstIdString(item)).filter(Boolean);
      if (optionIds.length > 0) {
        answers.push({ questionId: question.id, optionIds });
      }
      return;
    }

    if (question.type === "blank") {
      const answerMap = ensureBlankAnswers(question.id);
      const blankAnswersPayload = Object.entries(answerMap)
        .map(([index, text]) => ({
          index: Number(index),
          text: String(text ?? "").trim(),
        }))
        .filter((item) => item.index > 0 && !!item.text);
      if (blankAnswersPayload.length > 0) {
        answers.push({
          questionId: question.id,
          blankAnswers: blankAnswersPayload,
        });
      }
      return;
    }

    const answerMap = ensureConnectAnswers(question.id);
    const connectAnswersPayload = Object.entries(answerMap)
      .map(([sourceOptionId, targetOptionId]) => ({
        sourceOptionId,
        targetOptionId: firstIdString(targetOptionId),
      }))
      .filter((item) => item.sourceOptionId && item.targetOptionId);

    if (connectAnswersPayload.length > 0) {
      answers.push({
        questionId: question.id,
        connectAnswers: connectAnswersPayload,
      });
    }
  });
  return answers;
};

const isQuestionCompleted = (question: QuestionItem): boolean => {
  if (question.type === "single" || question.type === "judge") {
    return !!firstIdString(singleAnswers[question.id]);
  }

  if (question.type === "multiple") {
    const optionIds = ensureMultipleAnswers(question.id).map((item) => firstIdString(item)).filter(Boolean);
    return optionIds.length > 0;
  }

  if (question.type === "blank") {
    const answerMap = ensureBlankAnswers(question.id);
    for (let blankIndex = 1; blankIndex <= question.blankCount; blankIndex += 1) {
      if (!String(answerMap[blankIndex] ?? "").trim()) {
        return false;
      }
    }
    return true;
  }

  const sourceOptions = getSourceOptions(question);
  if (sourceOptions.length === 0) return false;
  const answerMap = getConnectAnswerMap(question.id);
  return sourceOptions.every((source) => !!firstIdString(answerMap[source.id]));
};

const getIncompleteQuestionCount = (): number => {
  return questions.value.filter((question) => !isQuestionCompleted(question)).length;
};

const handleSubmit = async () => {
  if (props.readonly) {
    return;
  }

  const submitTargetId = resolveSubmitTargetId();
  if (props.evaluationId && !String(props.evaluationId).trim()) {
    showWarningMessage("当前测评缺少提交标识");
    return;
  }

  if (!props.evaluationId && !submitTargetId) {
    showWarningMessage("任务ID缺失");
    return;
  }

  const incompleteCount = getIncompleteQuestionCount();
  if (incompleteCount > 0) {
    try {
      await showConfirmDialog("您还没有答完，是否确定要提交？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        closeOnPressEscape: false,
      });
    } catch {
      return;
    }
  }

  const answers = buildSubmitAnswers();
  submitting.value = true;
  try {
    if (props.evaluationId) {
      await submitEvaluation({
        evaluationId: props.evaluationId,
        answers,
      });
    } else {
      await submitStudentTask({
        taskId: submitTargetId,
        answers,
      });
    }
    showSuccessMessage("提交成功");
    emit("submitted");
    closeModal();
  } catch (error: any) {
    console.error("提交任务失败", error);
  } finally {
    submitting.value = false;
  }
};

const handleWindowResize = () => {
  scheduleConnectLayoutRefresh();
};

onMounted(() => {
  window.addEventListener("resize", handleWindowResize);
  if (typeof window !== "undefined" && "ResizeObserver" in window) {
    connectBoardResizeObserver.value = new ResizeObserver(() => {
      scheduleConnectLayoutRefresh();
    });
    Object.values(connectBoardRefs).forEach((element) => {
      if (element) {
        connectBoardResizeObserver.value?.observe(element);
      }
    });
  }
  scheduleConnectLayoutRefresh();
});

onBeforeUnmount(() => {
  finishConnectDrag();
  window.removeEventListener("resize", handleWindowResize);
  if (connectBoardResizeObserver.value) {
    connectBoardResizeObserver.value.disconnect();
    connectBoardResizeObserver.value = null;
  }
});

watch(
  () => [props.modelValue, props.taskId, props.evaluationId] as const,
  ([visible, taskId, evaluationId]) => {
    if (!visible) {
      finishConnectDrag();
      return;
    }
    if (!taskId && !evaluationId) {
      detailData.value = null;
      questions.value = [];
      clearAnswerState();
      scheduleConnectLayoutRefresh();
      return;
    }
    fetchTaskDetail();
  },
  { immediate: true }
);
</script>

<style scoped>
.task-answer-fade-enter-active,
.task-answer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.task-answer-fade-enter-from,
.task-answer-fade-leave-to {
  opacity: 0;
}

.task-answer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1900;
  background: rgba(17, 24, 39, 0.42);
  padding-left: 40px;
}

.task-answer-panel {
  width: 100%;
  height: 100%;
  background: #d8dde4;
  display: flex;
  flex-direction: column;
}

.task-answer-close {
  position: absolute;
  left: 0;
  top: 52px;
  width: 40px;
  height: 40px;
  border: none;
  background: #ef476f;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.task-answer-close-icon {
  width: 20px;
  height: 20px;
}

.task-answer-header {
  position: relative;
  padding: 40px 16px 22px;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.46) 0%, rgba(216, 221, 228, 0) 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.24);
}

.task-answer-title {
  margin: 0;
  text-align: center;
  color: #111827;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.1;
}

.task-answer-student-meta {
  position: absolute;
  right: 18px;
  top: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(203, 213, 225, 0.62);
  backdrop-filter: blur(4px);
}

.task-answer-student-name {
  max-width: 168px;
  color: #0f172a;
  font-size: 16px;
  line-height: 1;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-answer-student-sep {
  color: #94a3b8;
  font-size: 16px;
  line-height: 1;
}

.task-answer-student-stars {
  display: inline-flex;
  align-items: center;
}

.task-answer-content {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 0 40px 16px;
}

.task-answer-question-list {
  width: min(100%, 1580px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-answer-question {
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  padding: 18px 28px;
}

.task-answer-question-title {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 500;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.task-answer-question-score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #ffbb66;
  background: #fff6e8;
  color: #ff8f00;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
}

.task-answer-question-image-wrap {
  margin-top: 10px;
  margin-bottom: 10px;
}

.task-answer-question-image {
  display: block;
  width: min(100%, 760px);
  height: auto;
  border-radius: 10px;
  border: 1px solid #dbe3eb;
  object-fit: contain;
  background: #ffffff;
}

.task-answer-option-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-answer-option-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-answer-option-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.task-answer-input {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin: 0;
  display: inline-block;
  position: relative;
  flex-shrink: 0;
  border: 2px solid #9ca3af;
  background: #ffffff;
  cursor: pointer;
}

.task-answer-input[type="radio"] {
  border-radius: 999px;
}

.task-answer-input[type="checkbox"] {
  border-radius: 4px;
}

.task-answer-input:checked {
  border-color: #ff9900;
  background: #ff9900;
}

.task-answer-input[type="radio"]::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #ffffff;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.15s ease;
}

.task-answer-input[type="radio"]:checked::after {
  transform: translate(-50%, -50%) scale(1);
}

.task-answer-input[type="checkbox"]::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid #ffffff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transform-origin: center;
  transition: transform 0.15s ease;
}

.task-answer-input[type="checkbox"]:checked::after {
  transform: rotate(45deg) scale(1);
}

.task-answer-input:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.task-answer-option-text {
  color: #111827;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.3;
}

.task-answer-option-image {
  width: auto;
  height: auto;
  max-width: 220px;
  max-height: 140px;
  border-radius: 8px;
  border: 1px solid #dbe3eb;
  object-fit: contain;
  background: #ffffff;
}

.task-answer-blank-inline {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 10px;
}

.task-answer-blank-index,
.task-answer-blank-text {
  color: #111827;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.35;
}

.task-answer-blank-text {
  white-space: pre-wrap;
}

.task-answer-blank-inline-input {
  width: 210px;
  height: 34px;
  border: none;
  border-bottom: 2px solid #9ca3af;
  background: transparent;
  outline: none;
  padding: 0 4px;
  color: #111827;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
}

.task-answer-blank-inline-input:focus {
  border-bottom-color: #ff9900;
}

.task-answer-connect-board {
  position: relative;
  margin-top: 18px;
  border-radius: 10px;
  background: #eef2f6;
  padding: 18px 22px;
  user-select: none;
  overflow-x: auto;
}

.task-answer-connect-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.task-answer-connect-line {
  stroke: #49c06a;
  stroke-width: 3.5;
  stroke-linecap: round;
}

.task-answer-connect-line--dragging {
  stroke: #94a3b8;
  stroke-dasharray: 7 5;
}

.task-answer-connect-columns {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  gap: 110px;
  width: min(100%, 920px);
}

.task-answer-connect-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.task-answer-connect-row {
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.task-answer-connect-column--target .task-answer-connect-row {
  justify-content: flex-start;
}

.task-answer-connect-label {
  color: #6b7280;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.25;
}

.task-answer-connect-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.task-answer-connect-image {
  width: 150px;
  height: 110px;
  border-radius: 8px;
  border: 1px solid #dbe3eb;
  object-fit: contain;
  background: #ffffff;
}

.task-answer-connect-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #9ca3af;
  background: #ffffff;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.task-answer-connect-dot.is-linked {
  border-color: #35b769;
}

.task-answer-connect-dot-core {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #2ea6ff;
}

.task-answer-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 16px;
}

.task-answer-loading {
  width: min(100%, 1580px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-answer-skeleton-item {
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  padding: 22px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.task-answer-footer {
  padding: 20px 16px 36px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.task-answer-submit {
  width: 98px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #ff9900;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.task-answer-submit:hover:not(:disabled) {
  background: #e68a00;
}

.task-answer-submit:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 1280px) {
  .task-answer-header {
    padding-top: 28px;
    padding-bottom: 16px;
  }

  .task-answer-title {
    font-size: 28px;
  }

  .task-answer-student-meta {
    right: 10px;
    top: 6px;
    gap: 4px;
    height: 28px;
    padding: 0 9px;
  }

  .task-answer-student-name {
    max-width: 110px;
    font-size: 14px;
  }

  .task-answer-student-sep {
    font-size: 14px;
  }

  .task-answer-student-stars {
    transform: scale(0.84);
    transform-origin: left center;
  }

  .task-answer-content {
    padding: 0 20px 12px;
  }

  .task-answer-question {
    padding: 16px 18px;
  }

  .task-answer-question-title {
    font-size: 22px;
  }

  .task-answer-question-score {
    height: 24px;
    min-width: 44px;
    padding: 0 8px;
    font-size: 14px;
  }

  .task-answer-question-image {
    width: min(100%, 520px);
  }

  .task-answer-option-text {
    font-size: 18px;
  }

  .task-answer-option-image {
    max-width: 150px;
    max-height: 100px;
  }

  .task-answer-blank-index,
  .task-answer-blank-text,
  .task-answer-connect-label {
    font-size: 16px;
  }

  .task-answer-connect-image {
    width: 120px;
    height: 90px;
  }

  .task-answer-blank-inline-input {
    width: 130px;
    height: 30px;
    font-size: 14px;
  }

  .task-answer-connect-board {
    padding: 12px;
  }

  .task-answer-connect-columns {
    gap: 36px;
    width: 100%;
  }

  .task-answer-connect-row {
    min-height: 42px;
  }

  .task-answer-connect-dot {
    width: 18px;
    height: 18px;
  }

  .task-answer-connect-dot-core {
    width: 8px;
    height: 8px;
  }

  .task-answer-submit {
    width: 88px;
    height: 34px;
    font-size: 16px;
  }
}
</style>
