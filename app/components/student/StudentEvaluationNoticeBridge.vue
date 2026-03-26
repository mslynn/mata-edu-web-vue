<template>
  <ExamReadyModal
    v-model:visible="showEvaluationReadyModal"
    :evaluation-name="evaluationNoticeInfo.evaluationName"
    :exam-time="evaluationNoticeInfo.examTime"
    @confirm="goPrepareEvaluation"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const config = useRuntimeConfig();
const router = useRouter();

const showEvaluationReadyModal = ref(false);
const evaluationNoticeInfo = ref({
  courseId: "",
  evaluationId: "",
  evaluationName: "",
  examTime: "",
});

let notifyWs: WebSocket | null = null;
const signalingUrl =
  (config.public.signalingUrl as string) || "ws://192.168.0.55:8001/resource/websocket";

const firstNonEmptyString = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const buildEvaluationNoticeTime = (message: any) => {
  const full = firstNonEmptyString(message?.examTime);
  if (full) return full;

  const start = firstNonEmptyString(message?.examStartTime);
  const end = firstNonEmptyString(message?.examEndTime);
  if (start && end) return `${start}-${end}`;
  return start || end || "-";
};

const applyEvaluationNotice = (message: any) => {
  console.log("[student] 收到测评通知:", message);
  evaluationNoticeInfo.value = {
    courseId: firstNonEmptyString(message?.courseId),
    evaluationId: firstNonEmptyString(message?.evaluationId, message?.exerciseId),
    evaluationName: firstNonEmptyString(message?.evaluationName, message?.taskName),
    examTime: buildEvaluationNoticeTime(message),
  };
  showEvaluationReadyModal.value = true;
};

const goPrepareEvaluation = () => {
  router.push({
    path: "/student/lessonsrecord",
    query: {
      tab: "evaluation",
      courseId: evaluationNoticeInfo.value.courseId || undefined,
      evaluationId: evaluationNoticeInfo.value.evaluationId || undefined,
    },
  });
};

const connectNotifyWebSocket = () => {
  if (typeof window === "undefined") return;

  if (notifyWs) {
    notifyWs.close();
    notifyWs = null;
  }

  const token = localStorage.getItem("token");
  const separator = signalingUrl.includes("?") ? "&" : "?";
  const wsUrl = token
    ? `${signalingUrl}${separator}Authorization=${encodeURIComponent(`Bearer ${token}`)}`
    : signalingUrl;

  notifyWs = new WebSocket(wsUrl);

  notifyWs.onopen = () => {
    const statusMsg = JSON.stringify({ type: "STUDENT_STATUS", status: "online" });
    notifyWs?.send(statusMsg);
  };

  notifyWs.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("[student] WebSocket 消息:", message);
      if (
        message.type === "CLASS_INTERACTION" &&
        (message.action === "evaluation_notice" ||
          (message.action === "question" && message.noticeType === "evaluation")) &&
        message.noticeType === "evaluation"
      ) {
        applyEvaluationNotice(message);
      }
    } catch {
      // ignore non-json messages
    }
  };
};

onMounted(() => {
  connectNotifyWebSocket();
});

onUnmounted(() => {
  if (notifyWs) {
    notifyWs.close();
    notifyWs = null;
  }
});
</script>
