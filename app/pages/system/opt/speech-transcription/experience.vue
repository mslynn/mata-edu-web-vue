<template>
  <div class="speech-page">
    <div class="speech-shell">
      <nav class="speech-breadcrumb" aria-label="面包屑">
        <button type="button" @click="goBackToCenter">AI 实践中心</button>
        <span>/</span>
        <button type="button" @click="goBackToCenter">语音转写体验</button>
        <span>/</span>
        <strong>Web Speech API Demo</strong>
      </nav>

      <header class="speech-hero">
        <div>
          <p class="speech-hero__eyebrow">免费浏览器能力体验</p>
          <h1>语音转写体验</h1>
          <p>
            使用浏览器原生 Web Speech API 识别麦克风输入，支持中文普通话和英文实时转写。
          </p>
        </div>
        <div class="speech-status" :class="statusClass">
          <span></span>
          {{ statusText }}
        </div>
      </header>

      <main class="speech-main">
        <section class="speech-control-card">
          <div class="speech-section-head">
            <div>
              <h2>识别设置</h2>
              <p>开始前选择识别语言，识别中切换语言会自动停止当前任务。</p>
            </div>
          </div>

          <label class="speech-field">
            <span>识别语言</span>
            <select v-model="selectedLanguage" :disabled="isListening" @change="handleLanguageChange">
              <option v-for="item in languageOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <div class="speech-upload-panel">
            <div class="speech-upload-panel__head">
              <div>
                <h3>上传本地 MP3</h3>
                <p>选择本地音频后可直接播放，方便配合麦克风或虚拟声卡测试识别。</p>
              </div>
              <button
                v-if="audioUrl"
                class="speech-upload-panel__clear"
                type="button"
                @click="clearAudioFile"
              >
                移除
              </button>
            </div>

            <label class="speech-upload-drop">
              <input
                ref="audioInputRef"
                accept="audio/mpeg,.mp3"
                type="file"
                @change="handleAudioFileChange"
              />
              <span class="speech-upload-drop__icon">🎧</span>
              <strong>{{ audioFileName || "选择 MP3 文件" }}</strong>
              <em>{{ audioFileHint }}</em>
            </label>

            <audio
              v-if="audioUrl"
              :src="audioUrl"
              class="speech-audio-player"
              controls
            ></audio>
          </div>

          <div v-if="!isSupported" class="speech-alert speech-alert--warning">
            当前浏览器不支持 Web Speech API，请使用 Chrome 浏览器体验。
          </div>
          <div v-else-if="errorMessage" class="speech-alert speech-alert--error">
            {{ errorMessage }}
          </div>
          <div v-else class="speech-alert">
            Web Speech API 只识别麦克风输入；测试 MP3 时请外放音频或使用系统虚拟声卡。
          </div>

          <div class="speech-actions">
            <button
              class="speech-button speech-button--primary"
              type="button"
              :disabled="!isSupported || isListening"
              @click="startRecognition"
            >
              开始识别
            </button>
            <button
              class="speech-button"
              type="button"
              :disabled="!isListening"
              @click="stopRecognition"
            >
              停止识别
            </button>
            <button class="speech-button" type="button" @click="clearTranscript">
              清空结果
            </button>
            <button
              class="speech-button"
              type="button"
              :disabled="!finalTranscript.trim()"
              @click="copyTranscript"
            >
              复制文本
            </button>
          </div>
        </section>

        <section class="speech-result-card">
          <div class="speech-section-head">
            <div>
              <h2>实时识别</h2>
              <p>这里展示浏览器返回的临时识别结果。</p>
            </div>
            <span v-if="isListening" class="speech-live-dot">识别中</span>
          </div>
          <div class="speech-result-box speech-result-box--interim">
            {{ interimTranscript || "等待语音输入..." }}
          </div>
        </section>
      </main>

      <section class="speech-final-card">
        <div class="speech-section-head">
          <div>
            <h2>最终文本</h2>
            <p>确认后的识别文本会持续累积在这里。</p>
          </div>
          <span>{{ finalTranscript.length }} 字符</span>
        </div>
        <textarea
          v-model="finalTranscript"
          class="speech-final-textarea"
          placeholder="点击开始识别后，说出的内容会显示在这里。"
        ></textarea>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "语音转写体验",
  htmlAttrs: {
    lang: "zh-CN",
  },
});

type WebSpeechRecognitionConstructor = new () => WebSpeechRecognition;

type WebSpeechRecognition = EventTarget & {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
};

type WebSpeechRecognitionAlternative = {
  transcript: string;
};

type WebSpeechRecognitionResult = {
  isFinal: boolean;
  0: WebSpeechRecognitionAlternative;
};

type WebSpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: WebSpeechRecognitionResult[];
};

type WebSpeechRecognitionErrorEvent = Event & {
  error: string;
  message?: string;
};

declare global {
  interface Window {
    SpeechRecognition?: WebSpeechRecognitionConstructor;
    webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
  }
}

const router = useRouter();

const languageOptions = [
  { label: "中文普通话", value: "zh-CN" },
  { label: "English", value: "en-US" },
];

const selectedLanguage = ref("zh-CN");
const isSupported = ref(false);
const isListening = ref(false);
const recognition = shallowRef<WebSpeechRecognition | null>(null);
const audioInputRef = ref<HTMLInputElement | null>(null);
const audioUrl = ref("");
const audioFileName = ref("");
const interimTranscript = ref("");
const finalTranscript = ref("");
const errorMessage = ref("");

const audioFileHint = computed(() => {
  return audioFileName.value
    ? "已载入本地音频，可点击下方播放器试听。"
    : "仅用于本地播放预览，Web Speech API 仍通过麦克风识别。";
});

const statusText = computed(() => {
  if (!isSupported.value) return "浏览器不支持";
  if (isListening.value) return "正在识别";
  if (errorMessage.value) return "识别异常";
  return "准备就绪";
});

const statusClass = computed(() => ({
  "speech-status--active": isListening.value,
  "speech-status--error": Boolean(errorMessage.value) || !isSupported.value,
}));

const createRecognition = () => {
  if (!import.meta.client) return null;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;

  const instance = new Recognition();
  instance.continuous = true;
  instance.interimResults = true;
  instance.lang = selectedLanguage.value;

  instance.onstart = () => {
    isListening.value = true;
    errorMessage.value = "";
  };

  instance.onend = () => {
    isListening.value = false;
    interimTranscript.value = "";
  };

  instance.onerror = (event) => {
    isListening.value = false;
    errorMessage.value = getRecognitionErrorMessage(event.error);
  };

  instance.onresult = (event) => {
    let interimText = "";
    let finalText = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0]?.transcript || "";
      if (result.isFinal) {
        finalText += transcript;
      } else {
        interimText += transcript;
      }
    }

    if (finalText.trim()) {
      finalTranscript.value = `${finalTranscript.value}${finalText}`;
    }
    interimTranscript.value = interimText;
  };

  return instance;
};

const getRecognitionErrorMessage = (error: string) => {
  const errorMap: Record<string, string> = {
    "not-allowed": "麦克风权限未授权，请允许浏览器使用麦克风后重试。",
    "service-not-allowed": "浏览器语音识别服务不可用，请检查浏览器设置或网络环境。",
    "no-speech": "没有检测到语音，请靠近麦克风后重试。",
    "audio-capture": "无法获取麦克风，请确认设备已连接且未被其他应用占用。",
    network: "语音识别服务网络异常，请稍后重试。",
    aborted: "识别已停止。",
  };
  return errorMap[error] || "识别异常，请停止后重新开始。";
};

const startRecognition = () => {
  if (!isSupported.value) return;
  if (isListening.value) return;

  errorMessage.value = "";
  interimTranscript.value = "";
  recognition.value?.abort();
  recognition.value = createRecognition();

  try {
    recognition.value?.start();
  } catch (error) {
    errorMessage.value = "启动识别失败，请刷新页面后重试。";
  }
};

const stopRecognition = () => {
  recognition.value?.stop();
  isListening.value = false;
};

const clearTranscript = () => {
  interimTranscript.value = "";
  finalTranscript.value = "";
  errorMessage.value = "";
};

const copyTranscript = async () => {
  if (!finalTranscript.value.trim()) return;

  try {
    await navigator.clipboard.writeText(finalTranscript.value);
    ElMessage.success("已复制识别文本");
  } catch (error) {
    ElMessage.error("复制失败，请手动选择文本复制");
  }
};

const revokeAudioUrl = () => {
  if (!audioUrl.value) return;
  URL.revokeObjectURL(audioUrl.value);
  audioUrl.value = "";
};

const clearAudioFile = () => {
  revokeAudioUrl();
  audioFileName.value = "";
  if (audioInputRef.value) {
    audioInputRef.value.value = "";
  }
};

const handleAudioFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const isMp3 = file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3");
  if (!isMp3) {
    ElMessage.warning("请上传 MP3 格式的音频文件");
    input.value = "";
    return;
  }

  revokeAudioUrl();
  audioFileName.value = file.name;
  audioUrl.value = URL.createObjectURL(file);
};

const handleLanguageChange = () => {
  if (!isListening.value) return;
  stopRecognition();
};

const goBackToCenter = () => {
  router.push("/system/opt");
};

onMounted(() => {
  isSupported.value = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
});

onBeforeUnmount(() => {
  recognition.value?.abort();
  revokeAudioUrl();
});
</script>

<style scoped>
.speech-page {
  min-height: 100vh;
  padding: 28px;
  background:
    radial-gradient(circle at 12% 8%, rgba(0, 91, 194, 0.1), transparent 30%),
    linear-gradient(135deg, #f8f9fa 0%, #f4f8ff 100%);
  color: #162033;
}

.speech-shell {
  width: min(1440px, 100%);
  margin: 0 auto;
}

.speech-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #7a8799;
  font-size: 14px;
}

.speech-breadcrumb button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #005bc2;
  cursor: pointer;
}

.speech-breadcrumb strong {
  color: #162033;
}

.speech-hero,
.speech-control-card,
.speech-result-card,
.speech-final-card {
  border: 1px solid rgba(147, 163, 184, 0.24);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 48px rgba(20, 35, 60, 0.08);
}

.speech-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
  margin-bottom: 24px;
}

.speech-hero__eyebrow {
  margin: 0 0 8px;
  color: #005bc2;
  font-size: 14px;
  font-weight: 700;
}

.speech-hero h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.2;
}

.speech-hero p:last-child {
  max-width: 720px;
  margin: 12px 0 0;
  color: #5c6b80;
  line-height: 1.8;
}

.speech-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #526174;
  font-weight: 700;
  white-space: nowrap;
}

.speech-status span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.speech-status--active {
  background: #e6f4ff;
  color: #005bc2;
}

.speech-status--active span {
  animation: speechPulse 1s ease-in-out infinite;
}

.speech-status--error {
  background: #fff1f0;
  color: #d93026;
}

.speech-main {
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(420px, 1.1fr);
  gap: 24px;
}

.speech-control-card,
.speech-result-card,
.speech-final-card {
  padding: 28px;
}

.speech-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.speech-section-head h2 {
  margin: 0;
  font-size: 22px;
}

.speech-section-head p,
.speech-section-head span {
  margin: 8px 0 0;
  color: #718096;
  line-height: 1.6;
}

.speech-field {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
  font-weight: 700;
}

.speech-field select {
  height: 48px;
  padding: 0 14px;
  border: 1px solid #d7e0ea;
  border-radius: 14px;
  background: #ffffff;
  color: #162033;
  font-size: 15px;
  outline: none;
}

.speech-field select:focus {
  border-color: #005bc2;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.12);
}

.speech-upload-panel {
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid #dbe6f3;
  border-radius: 18px;
  background: #f8fbff;
}

.speech-upload-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.speech-upload-panel__head h3 {
  margin: 0;
  color: #162033;
  font-size: 16px;
}

.speech-upload-panel__head p {
  margin: 6px 0 0;
  color: #718096;
  font-size: 13px;
  line-height: 1.6;
}

.speech-upload-panel__clear {
  border: 0;
  background: transparent;
  color: #005bc2;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.speech-upload-drop {
  display: grid;
  place-items: center;
  gap: 6px;
  min-height: 118px;
  padding: 18px;
  border: 1px dashed #9bb9dc;
  border-radius: 16px;
  background: #ffffff;
  color: #526174;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.speech-upload-drop:hover {
  border-color: #005bc2;
  background: #f4f8ff;
}

.speech-upload-drop input {
  display: none;
}

.speech-upload-drop__icon {
  font-size: 28px;
  line-height: 1;
}

.speech-upload-drop strong {
  max-width: 100%;
  color: #162033;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.speech-upload-drop em {
  max-width: 100%;
  color: #718096;
  font-size: 13px;
  font-style: normal;
  line-height: 1.5;
}

.speech-audio-player {
  width: 100%;
  margin-top: 14px;
}

.speech-alert {
  min-height: 48px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f4f8ff;
  color: #526174;
  line-height: 1.6;
}

.speech-alert--warning {
  background: #fff7e6;
  color: #ad6800;
}

.speech-alert--error {
  background: #fff1f0;
  color: #d93026;
}

.speech-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.speech-button {
  height: 44px;
  border: 1px solid #d7e0ea;
  border-radius: 14px;
  background: #ffffff;
  color: #005bc2;
  font-weight: 700;
  cursor: pointer;
}

.speech-button--primary {
  border-color: #005bc2;
  background: #005bc2;
  color: #ffffff;
}

.speech-button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.speech-live-dot {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #e6f4ff;
  color: #005bc2 !important;
  font-weight: 700;
}

.speech-result-box {
  min-height: 240px;
  padding: 20px;
  border: 1px dashed #b9c8da;
  border-radius: 18px;
  background: #f8fbff;
  color: #1f2a3d;
  font-size: 18px;
  line-height: 1.9;
  white-space: pre-wrap;
}

.speech-result-box--interim {
  color: #526174;
}

.speech-final-card {
  margin-top: 24px;
}

.speech-final-textarea {
  width: 100%;
  min-height: 260px;
  padding: 20px;
  border: 1px solid #d7e0ea;
  border-radius: 18px;
  background: #ffffff;
  color: #162033;
  font-size: 17px;
  line-height: 1.9;
  resize: vertical;
  outline: none;
}

.speech-final-textarea:focus {
  border-color: #005bc2;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

@keyframes speechPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.7);
    opacity: 1;
  }
}

@media (max-width: 980px) {
  .speech-page {
    padding: 18px;
  }

  .speech-hero,
  .speech-main {
    grid-template-columns: 1fr;
  }

  .speech-hero {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .speech-actions {
    grid-template-columns: 1fr;
  }

  .speech-hero h1 {
    font-size: 28px;
  }
}
</style>
