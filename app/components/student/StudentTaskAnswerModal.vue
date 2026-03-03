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
                  {{ index + 1 }}. {{ question.title }}
                </h3>

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
                    <span class="task-answer-option-text">{{ option.label }}. {{ option.text || "-" }}</span>
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
                    <span class="task-answer-option-text">{{ option.label }}. {{ option.text || "-" }}</span>
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
                      v-model="blankAnswers[question.id][part.blankIndex]"
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
                        <span class="task-answer-connect-label">{{ source.text || source.label }}</span>
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
                        <span class="task-answer-connect-label">{{ target.text || target.label }}</span>
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

interface QuestionOption {
  id: string;
  label: string;
  text: string;
  groupType: string;
}

interface QuestionItem {
  id: string;
  title: string;
  type: "single" | "multiple" | "judge" | "blank" | "connect";
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
  taskName?: string;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submitted: [];
}>();

const { getTaskIdDetail } = taskmanagementcenterApi();
const { submitStudentTask } = student();

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
  };
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
        blankCount: blankCount > 0 ? blankCount : 1,
        options: (Array.isArray(question?.options) ? question.options : []).map(normalizeOption),
        raw: question,
      };
    })
    .filter((question) => !!question.id);
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
    detailData.value?.taskInfo?.taskName,
    detailData.value?.taskName,
    props.taskName,
    "任务练习"
  );
});

const normalizeRatePercent = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace("%", "");
  if (!text) return null;
  const num = Number(text);
  if (Number.isNaN(num)) return null;
  const rate = num > 0 && num <= 1 ? num * 100 : num;
  return Math.max(0, Math.min(100, rate));
};

const rateToStars = (rate: number): number => {
  if (rate <= 0) return 0;
  if (rate <= 10) return 0.5;
  if (rate <= 20) return 1;
  if (rate <= 30) return 1.5;
  if (rate <= 40) return 2;
  if (rate <= 50) return 2.5;
  if (rate <= 60) return 3;
  if (rate <= 70) return 3.5;
  if (rate <= 80) return 4;
  if (rate <= 90) return 4.5;
  return 5;
};

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
    return rateToStars(directRate);
  }

  const score = Number(taskInfo?.score ?? rootData?.score);
  const totalScore = Number(taskInfo?.totalScore ?? rootData?.totalScore);
  if (Number.isNaN(score) || Number.isNaN(totalScore) || totalScore <= 0) {
    return 0;
  }

  const rate = Math.round((score / totalScore) * 100);
  return rateToStars(rate);
});

const showStudentMeta = computed(() => {
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

const setConnectBoardRef = (questionId: string, element: HTMLElement | null) => {
  if (element) {
    if (connectBoardRefs[questionId] !== element) {
      connectBoardRefs[questionId] = element;
    }
  } else if (connectBoardRefs[questionId]) {
    delete connectBoardRefs[questionId];
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
  if (!props.taskId) return;
  loading.value = true;
  try {
    detailData.value = await getTaskIdDetail(String(props.taskId));
    questions.value = normalizeQuestions(detailData.value);
    fillAnswerStateFromDetail();
    await nextTick();
    refreshConnectLayout();
  } catch (error: any) {
    console.error("获取任务题目失败", error);
    ElMessage.error(error?.message || "获取任务题目失败");
    detailData.value = null;
    questions.value = [];
    clearAnswerState();
    refreshConnectLayout();
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit("update:modelValue", false);
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

  if (!props.taskId) {
    ElMessage.warning("任务ID缺失");
    return;
  }

  const incompleteCount = getIncompleteQuestionCount();
  if (incompleteCount > 0) {
    try {
      await ElMessageBox.confirm("您还没有答完，是否确定要提交？", "提示", {
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
    await submitStudentTask({
      taskId: props.taskId,
      answers,
    });
    ElMessage.success("提交成功");
    emit("submitted");
    closeModal();
  } catch (error: any) {
    console.error("提交任务失败", error);
    ElMessage.error(error?.message || "提交任务失败");
  } finally {
    submitting.value = false;
  }
};

const handleWindowResize = () => {
  refreshConnectLayout();
};

onMounted(() => {
  window.addEventListener("resize", handleWindowResize);
});

onBeforeUnmount(() => {
  finishConnectDrag();
  window.removeEventListener("resize", handleWindowResize);
});

watch(
  () => [props.modelValue, props.taskId] as const,
  ([visible, taskId]) => {
    if (!visible) {
      finishConnectDrag();
      return;
    }
    if (!taskId) {
      detailData.value = null;
      questions.value = [];
      clearAnswerState();
      refreshConnectLayout();
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

.task-answer-input {
  width: 18px;
  height: 18px;
  accent-color: #ff9900;
  cursor: pointer;
}

.task-answer-option-text {
  color: #111827;
  font-size: 22px;
  font-weight: 400;
  line-height: 1.3;
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
  gap: 64px;
}

.task-answer-connect-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.task-answer-connect-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  background: linear-gradient(180deg, #67df79 0%, #43cf72 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
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

  .task-answer-option-text {
    font-size: 18px;
  }

  .task-answer-blank-index,
  .task-answer-blank-text,
  .task-answer-connect-label {
    font-size: 16px;
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
    gap: 22px;
  }

  .task-answer-connect-row {
    min-height: 36px;
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
