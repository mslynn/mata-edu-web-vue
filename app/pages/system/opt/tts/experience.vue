<template>
  <div class="tts-workbench-page" :class="workbenchDensityClass">
    <div class="tts-workbench-shell">
      <nav class="tts-workbench-breadcrumb" aria-label="面包屑">
        <button type="button" @click="goBackToIntro">AI 实践中心</button>
        <span>/</span>
        <button type="button" @click="goBackToIntro">语音合成</button>
        <span>/</span>
        <strong>立即体验</strong>
      </nav>

      <header class="tts-workbench-header">
        <div>
          <h1>语音合成工作台</h1>
          <p>将您的文字转化为自然、富有情感的高质量音频流</p>
        </div>
      </header>

      <main class="tts-workbench-main">
        <section class="tts-workbench-left">
          <div class="tts-text-panel">
            <textarea
              v-model="demoText"
              maxlength="5000"
              placeholder="请输入需要转换的文本... 为了获得最佳效果，建议保持段落连贯并使用正确的标点符号。"
            ></textarea>
            <div class="tts-text-panel__footer">
              <span>字符数: {{ demoText.length }} / 5000</span>
              <div>
                <button type="button" @click="clearText">清空</button>
                <button type="button" @click="triggerTextImport">导入文本</button>
              </div>
            </div>
            <input
              ref="textFileInputRef"
              class="tts-text-panel__file"
              type="file"
              accept=".txt,text/plain"
              @change="handleTextImport"
            />
          </div>

          <div class="tts-player-card">
            <button
              class="tts-player-card__play"
              type="button"
              :disabled="!speechSupported"
              @click="toggleSpeechPlayback"
            >
              {{ playerButtonText }}
            </button>
            <div class="tts-player-card__progress">
              <div class="tts-player-card__track">
                <i :style="{ width: `${speechProgress}%` }"></i>
              </div>
              <div class="tts-player-card__time">
                <span>{{ elapsedTimeText }}</span>
                <span>{{ estimatedTimeText }}</span>
              </div>
            </div>
            <button class="tts-player-card__volume" type="button">♬</button>
          </div>

          <div class="tts-workbench-actions">
            <button class="tts-workbench-actions__primary" type="button" @click="handleSpeak">
              <span>✦</span>
              {{ primaryActionText }}
            </button>
            <button class="tts-workbench-actions__secondary" type="button" @click="handleDownload">
              <span>↓</span>
              下载语音文件
            </button>
          </div>
        </section>

        <aside class="tts-param-panel">
          <h2>
            <span>⚙</span>
            语音参数
          </h2>

          <div v-for="item in parameterItems" :key="item.label" class="tts-param-item">
            <div class="tts-param-item__head">
              <label>
                <span :class="`is-${item.theme}`">{{ item.icon }}</span>
                {{ item.label }}
              </label>
              <strong :class="`is-${item.theme}`">{{ item.value }}</strong>
            </div>
            <input
              :max="item.max"
              :min="item.min"
              :step="item.step"
              :value="item.rawValue"
              type="range"
              @input="updateParameter(item.key, $event)"
            />
            <div class="tts-param-item__scale">
              <span>{{ item.left }}</span>
              <span>{{ item.center }}</span>
              <span>{{ item.right }}</span>
            </div>
          </div>
        </aside>
      </main>

      <section class="tts-voice-section">
        <div class="tts-voice-section__head">
          <h2>
            <span>◉</span>
            常用音色选择
          </h2>
        </div>

        <div class="tts-voice-grid">
          <article
            v-for="voice in voiceItems"
            :key="voice.id"
            class="tts-voice-card"
            :class="{ 'tts-voice-card--active': voice.active }"
            @click="selectVoice(voice.id)"
          >
            <div class="tts-voice-card__avatar" :class="`is-${voice.theme}`">
              {{ voice.icon }}
            </div>
            <strong>{{ voice.name }}</strong>
            <span>{{ voice.desc }}</span>
          </article>
        </div>
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
  title: "语音合成体验",
  htmlAttrs: {
    lang: "zh-CN",
  },
});

type ParameterItem = {
  key: "rate" | "pitch" | "volume";
  label: string;
  icon: string;
  value: string;
  rawValue: number;
  min: string;
  max: string;
  step: string;
  left: string;
  center: string;
  right: string;
  theme: "primary" | "secondary" | "tertiary";
};

type VoiceItem = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  theme: "primary" | "secondary" | "tertiary" | "neutral" | "error";
  active?: boolean;
};

const demoText = ref("");
const textFileInputRef = ref<HTMLInputElement | null>(null);
const speechSupported = ref(false);
const browserVoices = ref<SpeechSynthesisVoice[]>([]);
const selectedVoiceId = ref("");
const speechRate = ref(1);
const speechPitch = ref(0);
const speechVolume = ref(85);
const isSpeaking = ref(false);
const isPaused = ref(false);
const elapsedSeconds = ref(0);
const estimatedSeconds = ref(30);
const speechProgress = ref(0);

const workbenchWindowWidth = ref(1920);
let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechTimer: number | null = null;
let cancelingSpeech = false;

const syncWorkbenchWindowWidth = () => {
  if (typeof window === "undefined") return;
  workbenchWindowWidth.value = window.outerWidth || window.innerWidth || 1920;
};

const workbenchDensityClass = computed(() => ({
  "tts-workbench-page--compact": workbenchWindowWidth.value <= 1700,
  "tts-workbench-page--dense": workbenchWindowWidth.value <= 1500,
}));

const nativePitch = computed(() => Math.max(0, Math.min(2, (speechPitch.value + 10) / 10)));
const nativeVolume = computed(() => Math.max(0, Math.min(1, speechVolume.value / 100)));
const selectedVoice = computed(() =>
  browserVoices.value.find((voice) => getVoiceId(voice) === selectedVoiceId.value) || null
);

const elapsedTimeText = computed(() => formatSeconds(elapsedSeconds.value));
const estimatedTimeText = computed(() => formatSeconds(estimatedSeconds.value));
const playerButtonText = computed(() => {
  if (isSpeaking.value && !isPaused.value) return "Ⅱ";
  return "▶";
});
const primaryActionText = computed(() => (isSpeaking.value ? "重新合成" : "开始合成"));

onMounted(() => {
  syncWorkbenchWindowWidth();
  window.addEventListener("resize", syncWorkbenchWindowWidth);
  window.visualViewport?.addEventListener("resize", syncWorkbenchWindowWidth);
  initBrowserSpeech();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncWorkbenchWindowWidth);
  window.visualViewport?.removeEventListener("resize", syncWorkbenchWindowWidth);
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.removeEventListener("voiceschanged", syncBrowserVoices);
    window.speechSynthesis.cancel();
  }
  clearSpeechTimer();
});

const parameterItems = computed<ParameterItem[]>(() => [
  {
    key: "rate",
    label: "语速 (Speed)",
    icon: "↔",
    value: `${speechRate.value.toFixed(1)}x`,
    rawValue: speechRate.value,
    min: "0.5",
    max: "2",
    step: "0.1",
    left: "慢 (0.5x)",
    center: "标准",
    right: "快 (2.0x)",
    theme: "primary",
  },
  {
    key: "pitch",
    label: "语调 (Pitch)",
    icon: "≈",
    value: `${speechPitch.value}`,
    rawValue: speechPitch.value,
    min: "-10",
    max: "10",
    step: "1",
    left: "深沉 (-10)",
    center: "平衡",
    right: "高昂 (+10)",
    theme: "secondary",
  },
  {
    key: "volume",
    label: "音量 (Volume)",
    icon: "♪",
    value: `${speechVolume.value}%`,
    rawValue: speechVolume.value,
    min: "0",
    max: "100",
    step: "5",
    left: "静音",
    center: "舒适",
    right: "响亮",
    theme: "tertiary",
  },
]);

const voiceItems = computed<VoiceItem[]>(() => {
  if (!speechSupported.value) {
    return [
      {
        id: "unsupported",
        name: "不可用",
        desc: "当前浏览器不支持",
        icon: "!",
        theme: "neutral",
      },
    ];
  }

  const chineseVoices = browserVoices.value.filter((voice) =>
    voice.lang.toLowerCase().startsWith("zh")
  );
  const sourceVoices = (chineseVoices.length ? chineseVoices : browserVoices.value).slice(0, 10);

  if (!sourceVoices.length) {
    return [
      {
        id: "default",
        name: "默认音色",
        desc: "系统默认",
        icon: "●",
        theme: "neutral",
        active: !selectedVoiceId.value,
      },
    ];
  }

  const themes: VoiceItem["theme"][] = [
    "primary",
    "primary",
    "secondary",
    "neutral",
    "secondary",
    "neutral",
    "error",
    "tertiary",
    "secondary",
    "primary",
  ];
  const icons = ["♀", "♂", "☺", "●", "◌", "◆", "✿", "▣", "☰", "✦"];

  return sourceVoices.map((voice, index) => ({
    id: getVoiceId(voice),
    name: formatVoiceName(voice.name),
    desc: voice.lang || "本地音色",
    icon: icons[index] || "●",
    theme: themes[index] || "neutral",
    active: getVoiceId(voice) === selectedVoiceId.value,
  }));
});

const goBackToIntro = async () => {
  await navigateTo("/system/opt/tts");
};

const getVoiceId = (voice: SpeechSynthesisVoice) => voice.voiceURI || `${voice.name}-${voice.lang}`;

const formatVoiceName = (name: string) =>
  name
    .replace(/^Microsoft\s+/i, "")
    .replace(/\s+Online\s+\(Natural\).*$/i, "")
    .replace(/\s+-\s+Chinese.*$/i, "")
    .replace(/\s*\(.*?\)\s*$/g, "")
    .trim()
    .slice(0, 12) || "本地音色";

const syncBrowserVoices = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  browserVoices.value = voices;
  if (!selectedVoiceId.value && voices.length) {
    const preferredVoice =
      voices.find((voice) => voice.lang.toLowerCase() === "zh-cn") ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("zh")) ||
      voices[0];
    selectedVoiceId.value = preferredVoice ? getVoiceId(preferredVoice) : "";
  }
};

const initBrowserSpeech = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    speechSupported.value = false;
    return;
  }

  speechSupported.value = true;
  syncBrowserVoices();
  window.speechSynthesis.addEventListener("voiceschanged", syncBrowserVoices);
};

const formatSeconds = (value: number) => {
  const safeValue = Math.max(0, Math.floor(value));
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const estimateSpeechSeconds = (text: string) => {
  const chineseLength = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const latinWordLength = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  const punctuationPause = (text.match(/[，。！？；,.!?;]/g) || []).length * 0.35;
  const baseSeconds = chineseLength / 4.2 + latinWordLength / 2.5 + punctuationPause;
  return Math.max(3, Math.ceil(baseSeconds / speechRate.value));
};

const clearSpeechTimer = () => {
  if (speechTimer !== null) {
    window.clearInterval(speechTimer);
    speechTimer = null;
  }
};

const startSpeechTimer = () => {
  clearSpeechTimer();
  speechTimer = window.setInterval(() => {
    if (isPaused.value) return;
    elapsedSeconds.value += 1;
    speechProgress.value = Math.min(
      98,
      Math.max(speechProgress.value, (elapsedSeconds.value / estimatedSeconds.value) * 100)
    );
  }, 1000);
};

const resetSpeechState = () => {
  clearSpeechTimer();
  currentUtterance = null;
  isSpeaking.value = false;
  isPaused.value = false;
};

const clearText = () => {
  demoText.value = "";
};

const triggerTextImport = () => {
  textFileInputRef.value?.click();
};

const handleTextImport = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    demoText.value = (await file.text()).slice(0, 5000);
  } catch {
    ElMessage.error("文本导入失败");
  } finally {
    input.value = "";
  }
};

const updateParameter = (key: ParameterItem["key"], event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  if (key === "rate") {
    speechRate.value = value;
  } else if (key === "pitch") {
    speechPitch.value = value;
  } else {
    speechVolume.value = value;
  }
};

const selectVoice = (id: string) => {
  if (id === "unsupported") {
    ElMessage.warning("当前浏览器不支持原生语音合成");
    return;
  }
  selectedVoiceId.value = id === "default" ? "" : id;
};

const handleSpeak = () => {
  if (!speechSupported.value || typeof window === "undefined") {
    ElMessage.warning("当前浏览器不支持原生语音合成");
    return;
  }

  const text = demoText.value.trim();
  if (!text) {
    ElMessage.warning("请先输入要合成的文本");
    return;
  }

  cancelingSpeech = true;
  window.speechSynthesis.cancel();
  cancelingSpeech = false;
  resetSpeechState();

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;
  utterance.lang = selectedVoice.value?.lang || "zh-CN";
  utterance.voice = selectedVoice.value;
  utterance.rate = speechRate.value;
  utterance.pitch = nativePitch.value;
  utterance.volume = nativeVolume.value;
  elapsedSeconds.value = 0;
  estimatedSeconds.value = estimateSpeechSeconds(text);
  speechProgress.value = 0;

  utterance.onstart = () => {
    isSpeaking.value = true;
    isPaused.value = false;
    startSpeechTimer();
  };
  utterance.onboundary = (event) => {
    if (!event.charIndex || !text.length) return;
    speechProgress.value = Math.min(98, (event.charIndex / text.length) * 100);
  };
  utterance.onend = () => {
    if (currentUtterance !== utterance) return;
    speechProgress.value = 100;
    elapsedSeconds.value = Math.max(elapsedSeconds.value, estimatedSeconds.value);
    resetSpeechState();
  };
  utterance.onerror = () => {
    if (currentUtterance !== utterance) return;
    resetSpeechState();
    if (!cancelingSpeech) {
      ElMessage.error("语音播放失败，请更换浏览器或音色后重试");
    }
  };

  window.speechSynthesis.speak(utterance);
};

const toggleSpeechPlayback = () => {
  if (!speechSupported.value || typeof window === "undefined") {
    ElMessage.warning("当前浏览器不支持原生语音合成");
    return;
  }

  if (!isSpeaking.value) {
    handleSpeak();
    return;
  }

  if (isPaused.value) {
    window.speechSynthesis.resume();
    isPaused.value = false;
    startSpeechTimer();
  } else {
    window.speechSynthesis.pause();
    isPaused.value = true;
    clearSpeechTimer();
  }
};

const handleDownload = () => {
  ElMessage.info("浏览器原生语音合成只能播放，不能直接下载音频文件");
};
</script>

<style scoped>
.tts-workbench-page {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: #f7f9fb;
  color: #2d3337;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.tts-workbench-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 28px 42px 24px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 90% 12%, rgba(165, 193, 255, 0.23), transparent 25%),
    radial-gradient(circle at 4% 82%, rgba(105, 246, 184, 0.14), transparent 24%),
    #f7f9fb;
}

.tts-workbench-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1280px;
  margin: 0 auto 18px;
  color: #97a3b8;
  font-size: 13px;
  font-weight: 500;
}

.tts-workbench-breadcrumb button {
  border: none;
  background: transparent;
  padding: 0;
  color: #005bc2;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.tts-workbench-breadcrumb strong {
  color: #2d3337;
  font-weight: 700;
}

.tts-workbench-header {
  max-width: 1280px;
  margin: 0 auto 24px;
}

.tts-workbench-header h1 {
  margin: 0 0 8px;
  color: #2d3337;
  font-size: 27px;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.tts-workbench-header p {
  margin: 0;
  color: #596063;
  font-size: 14px;
}

.tts-workbench-main {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(340px, 0.9fr);
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto 28px;
}

.tts-workbench-left {
  min-width: 0;
}

.tts-text-panel,
.tts-param-panel,
.tts-player-card,
.tts-voice-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(172, 179, 183, 0.1);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.045);
}

.tts-text-panel {
  display: flex;
  min-height: 360px;
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px;
}

.tts-text-panel textarea {
  flex: 1;
  width: 100%;
  resize: none;
  border: none;
  outline: none;
  padding: 28px;
  background: transparent;
  color: #2d3337;
  font-size: 17px;
  line-height: 1.7;
  box-sizing: border-box;
}

.tts-text-panel textarea::placeholder {
  color: #acb3b7;
}

.tts-text-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-top: 1px solid rgba(172, 179, 183, 0.1);
  background: rgba(241, 244, 246, 0.44);
  color: #596063;
  font-size: 12px;
  font-weight: 600;
}

.tts-text-panel__footer div {
  display: flex;
  gap: 8px;
}

.tts-text-panel__footer button {
  border: none;
  border-radius: 999px;
  padding: 7px 12px;
  background: #eaeef1;
  color: #596063;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.tts-text-panel__file {
  display: none;
}

.tts-player-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
  padding: 16px;
  border-radius: 20px;
}

.tts-player-card__play {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: #005bc4;
  color: #ffffff;
  cursor: pointer;
}

.tts-player-card__play:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.tts-player-card__progress {
  flex: 1;
}

.tts-player-card__track {
  position: relative;
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: #eaeef1;
}

.tts-player-card__track i {
  position: absolute;
  inset: 0 auto 0 0;
  width: 30%;
  border-radius: inherit;
  background: #005bc4;
}

.tts-player-card__time {
  display: flex;
  justify-content: space-between;
  margin-top: 7px;
  color: #596063;
  font-size: 10px;
  font-weight: 800;
}

.tts-player-card__volume {
  border: none;
  background: transparent;
  color: #596063;
  font-size: 18px;
  cursor: pointer;
}

.tts-workbench-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 12px;
}

.tts-workbench-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 56px;
  border-radius: 999px;
  font-size: 17px;
  font-weight: 900;
  cursor: pointer;
}

.tts-workbench-actions__primary {
  border: none;
  background: linear-gradient(90deg, #005bc4, #004fad);
  color: #ffffff;
  box-shadow: 0 18px 38px rgba(0, 91, 194, 0.22);
}

.tts-workbench-actions__secondary {
  border: 2px solid #005bc4;
  background: transparent;
  color: #005bc4;
}

.tts-workbench-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.tts-param-panel {
  padding: 28px;
  border-radius: 24px;
}

.tts-param-panel h2,
.tts-voice-section__head h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  font-weight: 900;
}

.tts-param-panel h2 span,
.tts-voice-section__head span {
  color: #005bc4;
}

.tts-param-item {
  margin-top: 30px;
}

.tts-param-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tts-param-item label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2d3337;
  font-size: 17px;
  font-weight: 800;
}

.tts-param-item label span,
.tts-param-item strong {
  border-radius: 7px;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 900;
}

.is-primary {
  background: rgba(165, 193, 255, 0.5);
  color: #003a81;
}

.is-secondary {
  background: rgba(255, 216, 231, 0.72);
  color: #942265;
}

.is-tertiary {
  background: rgba(105, 246, 184, 0.42);
  color: #005a3c;
}

.tts-param-item input {
  width: 100%;
  accent-color: #005bc4;
}

.tts-param-item__scale {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  color: #757c7f;
  font-size: 10px;
  font-weight: 800;
}

.tts-voice-section {
  max-width: 1280px;
  margin: 0 auto;
}

.tts-voice-section__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tts-voice-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 14px;
}

.tts-voice-card {
  display: flex;
  min-width: 0;
  min-height: 120px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 18px;
  text-align: center;
  cursor: pointer;
}

.tts-voice-card--active {
  border: 2px solid #005bc4;
}

.tts-voice-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 18px;
  font-weight: 900;
}

.tts-voice-card strong {
  max-width: 100%;
  overflow: hidden;
  color: #2d3337;
  font-size: 11px;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tts-voice-card span {
  color: #596063;
  font-size: 10px;
}

.is-neutral {
  background: #dde3e7;
  color: #596063;
}

.is-error {
  background: rgba(245, 105, 101, 0.18);
  color: #ac3434;
}

.tts-workbench-page--compact .tts-workbench-main {
  grid-template-columns: minmax(0, 1.62fr) minmax(292px, 0.72fr);
  gap: 12px;
  margin-bottom: 18px;
}

.tts-workbench-page--compact .tts-text-panel {
  height: 150px;
  min-height: 0;
  max-height: 150px;
}

.tts-workbench-page--compact .tts-text-panel textarea {
  min-height: 0;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 1.4;
}

.tts-workbench-page--compact .tts-text-panel__footer {
  flex-shrink: 0;
  padding: 6px 10px;
}

.tts-workbench-page--compact .tts-param-panel {
  height: 320px;
  max-height: 320px;
  overflow: hidden;
  padding: 14px 16px;
}

.tts-workbench-page--compact .tts-param-item {
  margin-top: 8px;
}

.tts-workbench-page--compact .tts-param-item__head {
  margin-bottom: 2px;
}

.tts-workbench-page--compact .tts-param-item input {
  height: 8px;
}

.tts-workbench-page--compact .tts-param-item__scale {
  margin-top: -2px;
}

.tts-workbench-page--dense .tts-workbench-shell {
  padding: 20px 24px 6px;
}

.tts-workbench-page--dense .tts-workbench-breadcrumb {
  margin-bottom: 2px;
  font-size: 12px;
}

.tts-workbench-page--dense .tts-workbench-header {
  margin-bottom: 4px;
}

.tts-workbench-page--dense .tts-workbench-header h1 {
  margin-bottom: 0;
  font-size: 22px;
  line-height: 1.05;
}

.tts-workbench-page--dense .tts-workbench-header p {
  font-size: 12px;
  line-height: 1.25;
}

.tts-workbench-page--dense .tts-workbench-main {
  grid-template-columns: minmax(0, 1.6fr) minmax(292px, 0.74fr);
  gap: 12px;
  margin-bottom: 18px;
}

.tts-workbench-page--dense .tts-text-panel {
  height: 96px;
  min-height: 0;
  max-height: 96px;
  border-radius: 16px;
}

.tts-workbench-page--dense .tts-text-panel textarea {
  min-height: 0;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.25;
}

.tts-workbench-page--dense .tts-text-panel__footer {
  flex-shrink: 0;
  padding: 3px 8px;
  font-size: 10px;
}

.tts-workbench-page--dense .tts-text-panel__footer button {
  padding: 3px 8px;
  font-size: 10px;
}

.tts-workbench-page--dense .tts-player-card {
  gap: 8px;
  margin-top: 5px;
  padding: 5px 10px;
  border-radius: 14px;
}

.tts-workbench-page--dense .tts-player-card__play {
  width: 24px;
  height: 24px;
  font-size: 11px;
}

.tts-workbench-page--dense .tts-player-card__track {
  height: 3px;
}

.tts-workbench-page--dense .tts-player-card__time {
  margin-top: 1px;
  font-size: 8px;
}

.tts-workbench-page--dense .tts-player-card__volume {
  font-size: 12px;
}

.tts-workbench-page--dense .tts-workbench-actions {
  gap: 8px;
  margin-top: 5px;
}

.tts-workbench-page--dense .tts-workbench-actions button {
  height: 28px;
  gap: 6px;
  font-size: 12px;
}

.tts-workbench-page--dense .tts-param-panel {
  height: 280px;
  max-height: 280px;
  overflow: hidden;
  padding: 10px 12px;
  border-radius: 16px;
}

.tts-workbench-page--dense .tts-param-panel h2,
.tts-workbench-page--dense .tts-voice-section__head h2 {
  font-size: 13px;
}

.tts-workbench-page--dense .tts-param-item {
  margin-top: 8px;
}

.tts-workbench-page--dense .tts-param-item__head {
  margin-bottom: 2px;
}

.tts-workbench-page--dense .tts-param-item label {
  gap: 5px;
  font-size: 10px;
}

.tts-workbench-page--dense .tts-param-item label span,
.tts-workbench-page--dense .tts-param-item strong {
  padding: 1px 5px;
  font-size: 9px;
}

.tts-workbench-page--dense .tts-param-item input {
  height: 8px;
}

.tts-workbench-page--dense .tts-param-item__scale {
  margin-top: -2px;
  font-size: 8px;
}

.tts-workbench-page--dense .tts-voice-section__head {
  margin-bottom: 4px;
}

.tts-workbench-page--dense .tts-voice-grid {
  gap: 6px;
}

.tts-workbench-page--dense .tts-voice-card {
  min-height: 42px;
  gap: 0;
  border-radius: 10px;
}

.tts-workbench-page--dense .tts-voice-card__avatar {
  width: 18px;
  height: 18px;
  font-size: 10px;
}

.tts-workbench-page--dense .tts-voice-card strong {
  font-size: 8px;
  line-height: 1.1;
}

.tts-workbench-page--dense .tts-voice-card span {
  font-size: 7px;
  line-height: 1.1;
}
</style>
