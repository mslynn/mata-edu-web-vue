<template>
  <div class="tts-workbench-page" :class="workbenchDensityClass">
    <div class="tts-workbench-shell">
      <nav class="tts-workbench-breadcrumb" aria-label="面包屑">
        <button type="button" @click="goBackToAiCenter">AI 实践中心</button>
        <span>/</span>
        <button type="button" @click="goBackToIntro">语音合成</button>
        <span>/</span>
        <strong>立即体验</strong>
      </nav>

      <header class="tts-workbench-header">
        <div>
          <h1>语音合成工作台</h1>
          <p>在线试听，在线生成 MP3 下载</p>
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
              accept=".txt,.md,.text,text/plain,text/markdown"
              @change="handleTextImport"
            />
          </div>

          <div class="tts-player-card">
            <button
              class="tts-player-card__play"
              type="button"
              :disabled="!canUsePlayer"
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
            <button
              class="tts-workbench-actions__primary"
              type="button"
              :disabled="isPrimaryActionDisabled"
              @click="handleSpeak"
            >
              <span>✦</span>
              {{ primaryActionText }}
            </button>
            <button
              class="tts-workbench-actions__secondary"
              type="button"
              :disabled="isDownloading"
              @click="handleDownload"
            >
              <span>↓</span>
              {{ downloadButtonText }}
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
            :class="{
              'tts-voice-card--active': voice.active,
              'tts-voice-card--disabled': !voice.available,
            }"
            @click="selectVoice(voice.id)"
          >
            <div class="tts-voice-card__avatar" :class="`is-${voice.theme}`">
              {{ voice.icon }}
            </div>
            <strong>{{ voice.name }}</strong>
            <span>{{ voice.desc }}</span>
            <em v-if="!voice.available">待接入</em>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { LOCAL_TTS_VOICES, type LocalTtsVoice } from "~/config/tts";

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
  available: boolean;
  active?: boolean;
};

const VOICE_MAP: Record<string, { edge: string; nativeKeywords: string[] }> = {
  "warm-female": {
    edge: "zh-CN-XiaoxiaoNeural",
    nativeKeywords: ["xiaoxiao", "xiaoyi", "female", "woman", "huihui", "xia"],
  },
  "solemn-male": {
    edge: "zh-CN-YunyangNeural",
    nativeKeywords: ["yunyang", "yunjian", "male", "man", "kang"],
  },
  "lively-child": {
    edge: "zh-CN-XiaoyiNeural",
    nativeKeywords: ["xiaoyi", "xiaoxiao", "female", "xia"],
  },
  "professional-broadcast": {
    edge: "zh-CN-YunjianNeural",
    nativeKeywords: ["yunjian", "yunyang", "male", "man", "kang"],
  },
  "soft-narration": {
    edge: "zh-CN-XiaoxiaoNeural",
    nativeKeywords: ["xiaoxiao", "xiaoyi", "female", "huihui", "xia"],
  },
  "magnetic-male": {
    edge: "zh-CN-YunxiNeural",
    nativeKeywords: ["yunxi", "yunjian", "male", "man", "kang"],
  },
  "sweet-female": {
    edge: "zh-CN-XiaoyiNeural",
    nativeKeywords: ["xiaoyi", "xiaoxiao", "female", "xia"],
  },
  "news-broadcast": {
    edge: "zh-CN-YunyangNeural",
    nativeKeywords: ["yunyang", "yunjian", "male", "man", "kang"],
  },
  audiobook: {
    edge: "zh-CN-XiaoxiaoNeural",
    nativeKeywords: ["xiaoxiao", "female", "huihui", "xia"],
  },
  "knowledge-explain": {
    edge: "zh-CN-XiaoxiaoNeural",
    nativeKeywords: ["xiaoxiao", "female", "huihui", "xia"],
  },
};

const fallbackVoice = LOCAL_TTS_VOICES[0] as LocalTtsVoice;

const demoText = ref("");
const textFileInputRef = ref<HTMLInputElement | null>(null);
const selectedVoiceId = ref(LOCAL_TTS_VOICES[0]?.id || "");
const speechRate = ref(1);
const speechPitch = ref(0);
const speechVolume = ref(85);
const isSpeaking = ref(false);
const isPaused = ref(false);
const elapsedSeconds = ref(0);
const estimatedSeconds = ref(0);
const speechProgress = ref(0);
const hasSpokenOnce = ref(false);
const isDownloading = ref(false);
const isGeneratingPreview = ref(false);
const lastPlayableText = ref("");
const lastPlayedKey = ref("");

const workbenchWindowWidth = ref(1920);
let speechTimer: number | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl = "";

const syncWorkbenchWindowWidth = () => {
  if (typeof window === "undefined") return;
  workbenchWindowWidth.value = window.outerWidth || window.innerWidth || 1920;
};

const workbenchDensityClass = computed(() => ({
  "tts-workbench-page--compact": workbenchWindowWidth.value <= 1700,
  "tts-workbench-page--dense": workbenchWindowWidth.value <= 1500,
}));

const elapsedTimeText = computed(() => formatSeconds(elapsedSeconds.value));
const estimatedTimeText = computed(() => formatSeconds(estimatedSeconds.value));
const selectedVoice = computed<LocalTtsVoice>(
  () => LOCAL_TTS_VOICES.find((voice) => voice.id === selectedVoiceId.value) || fallbackVoice
);
const canUsePlayer = computed(() => Boolean(demoText.value.trim() || lastPlayableText.value));
const isPrimaryActionDisabled = computed(
  () => isGeneratingPreview.value || (isSpeaking.value && !isPaused.value)
);
const playerButtonText = computed(() => {
  if (isSpeaking.value && !isPaused.value) return "Ⅱ";
  return "▶";
});
const primaryActionText = computed(() => {
  if (isGeneratingPreview.value) return "正在生成";
  if (isSpeaking.value && !isPaused.value) return "正在播放";
  return hasSpokenOnce.value ? "重新合成" : "开始合成";
});
const downloadButtonText = computed(() => (isDownloading.value ? "正在生成 MP3" : "下载语音文件"));
onMounted(() => {
  syncWorkbenchWindowWidth();
  window.addEventListener("resize", syncWorkbenchWindowWidth);
  window.visualViewport?.addEventListener("resize", syncWorkbenchWindowWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncWorkbenchWindowWidth);
  window.visualViewport?.removeEventListener("resize", syncWorkbenchWindowWidth);
  stopAudioPlayback();
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
  return LOCAL_TTS_VOICES.map((voice) => ({
    id: voice.id,
    name: voice.name,
    desc: voice.desc,
    icon: voice.icon,
    theme: voice.theme,
    available: voice.available,
    active: voice.id === selectedVoiceId.value,
  }));
});

const getPlayableText = () => demoText.value.trim() || lastPlayableText.value;

const goBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};

const goBackToIntro = async () => {
  await navigateTo("/system/opt/tts");
};

const formatSeconds = (value: number) => {
  const safeValue = Math.max(0, Math.floor(value));
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
  isSpeaking.value = false;
  isPaused.value = false;
};

const revokeCurrentAudioUrl = () => {
  if (!currentAudioUrl) return;
  URL.revokeObjectURL(currentAudioUrl);
  currentAudioUrl = "";
};

const stopAudioPlayback = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onplay = null;
    currentAudio.onpause = null;
    currentAudio.ontimeupdate = null;
    currentAudio.onended = null;
    currentAudio.onerror = null;
  }
  currentAudio = null;
  resetSpeechState();
};

const clearText = () => {
  if (isSpeaking.value || isPaused.value) {
    stopAudioPlayback();
  }
  lastPlayableText.value = "";
  lastPlayedKey.value = "";
  revokeCurrentAudioUrl();
  demoText.value = "";
};

const triggerTextImport = () => {
  textFileInputRef.value?.click();
};

const readTextFileAsUtf8 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  return new TextDecoder("utf-8").decode(buffer);
};

const handleTextImport = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const lowerName = file.name.toLowerCase();
    const isTextFile =
      file.type.startsWith("text/") ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md") ||
      lowerName.endsWith(".text");

    if (!isTextFile) {
      ElMessage.warning("仅支持导入 TXT 或 Markdown 文本文件");
      return;
    }

    const importedText = (await readTextFileAsUtf8(file)).replace(/\r\n/g, "\n").trim();
    if (!importedText) {
      ElMessage.warning("导入的文本内容为空");
      return;
    }

    demoText.value = importedText.slice(0, 5000);

    if (importedText.length > 5000) {
      ElMessage.warning("文本已导入，超过 5000 字的部分已自动截断");
      return;
    }

    ElMessage.success("文本导入成功");
  } catch {
    ElMessage.error("文本导入失败，请确认文件为 UTF-8 编码");
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
  const voice = LOCAL_TTS_VOICES.find((voiceItem) => voiceItem.id === id);
  if (!voice) return;

  if (!voice.available) {
    ElMessage.warning(`${voice.name} 暂未内置本地模型`);
    return;
  }

  selectedVoiceId.value = id;
  speechRate.value = voice.rate;
  speechPitch.value = voice.pitch;
  speechVolume.value = voice.volume;

  if (isSpeaking.value || isPaused.value) {
    handleSpeak();
  }
};

const getEdgeVoiceName = () => {
  return VOICE_MAP[selectedVoice.value.id]?.edge || "zh-CN-XiaoxiaoNeural";
};

const toEdgeRate = () => {
  const ratePercent = Math.round((speechRate.value - 1) * 100);
  return `${ratePercent >= 0 ? "+" : ""}${ratePercent}%`;
};

const toEdgePitch = () => `${speechPitch.value >= 0 ? "+" : ""}${speechPitch.value}Hz`;

const toEdgeVolume = () => {
  const volumePercent = Math.round(speechVolume.value - 100);
  return `${volumePercent >= 0 ? "+" : ""}${volumePercent}%`;
};

const getSpeechPayload = (text: string) => ({
  text,
  voice: getEdgeVoiceName(),
  rate: toEdgeRate(),
  pitch: toEdgePitch(),
  volume: toEdgeVolume(),
});

const getPlaybackKey = (text: string) => JSON.stringify(getSpeechPayload(text));

const requestSpeechAudio = async (text: string) => {
  const response = await fetch("/api/speech-synthesis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getSpeechPayload(text)),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.statusMessage || errorBody?.message || response.statusText || "语音文件生成失败";
    throw new Error(message);
  }

  return response.blob();
};

const bindAudioEvents = (audio: HTMLAudioElement, text: string) => {
  audio.onplay = () => {
    currentAudio = audio;
    lastPlayableText.value = text;
    hasSpokenOnce.value = true;
    isSpeaking.value = true;
    isPaused.value = false;
    startSpeechTimer();
    if (!estimatedSeconds.value && Number.isFinite(audio.duration)) {
      estimatedSeconds.value = Math.max(1, Math.ceil(audio.duration));
    }
  };
  audio.onpause = () => {
    if (!currentAudio) return;
    if (audio.ended || Math.abs(audio.currentTime) < 0.001) return;
    isSpeaking.value = false;
    isPaused.value = true;
  };
  audio.ontimeupdate = () => {
    elapsedSeconds.value = Math.floor(audio.currentTime);
    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : estimatedSeconds.value;
    if (duration > 0) {
      estimatedSeconds.value = Math.max(1, Math.ceil(duration));
      speechProgress.value = Math.min(100, (audio.currentTime / duration) * 100);
    }
  };
  audio.onended = () => {
    speechProgress.value = 100;
    elapsedSeconds.value = estimatedSeconds.value;
    isPaused.value = false;
    isSpeaking.value = false;
    resetSpeechState();
  };
  audio.onerror = () => {
    currentAudio = null;
    resetSpeechState();
    ElMessage.error("语音播放失败，请稍后重试");
  };
};

const handleSpeak = async () => {
  if (typeof window === "undefined") return;

  const text = getPlayableText();
  if (!text) {
    ElMessage.warning("请先输入要合成的文本");
    return;
  }

  const playbackKey = getPlaybackKey(text);
  isGeneratingPreview.value = true;
  elapsedSeconds.value = 0;
  estimatedSeconds.value = Math.max(3, Math.ceil(text.length / 5));
  speechProgress.value = 0;

  try {
    if (currentAudio && lastPlayedKey.value === playbackKey) {
      currentAudio.currentTime = 0;
      bindAudioEvents(currentAudio, text);
      await currentAudio.play();
      return;
    }

    stopAudioPlayback();
    revokeCurrentAudioUrl();

    const audioBlob = await requestSpeechAudio(text);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    currentAudio = audio;
    currentAudioUrl = audioUrl;
    lastPlayedKey.value = playbackKey;
    bindAudioEvents(audio, text);
    await audio.play();
  } catch (error) {
    currentAudio = null;
    revokeCurrentAudioUrl();
    resetSpeechState();
    ElMessage.error(error instanceof Error ? error.message : "语音生成失败，请稍后重试");
  } finally {
    isGeneratingPreview.value = false;
  }
};

const toggleSpeechPlayback = () => {
  if (!isSpeaking.value && !hasSpokenOnce.value) {
    handleSpeak();
    return;
  }

  if (!isSpeaking.value && hasSpokenOnce.value) {
    if (currentAudio && lastPlayedKey.value === getPlaybackKey(getPlayableText())) {
      currentAudio.currentTime = 0;
      bindAudioEvents(currentAudio, getPlayableText());
      currentAudio.play().catch(() => {
        ElMessage.error("语音播放失败，请稍后重试");
      });
      return;
    }
    handleSpeak();
    return;
  }

  if (isPaused.value) {
    currentAudio?.play().catch(() => {
      ElMessage.error("语音播放失败，请稍后重试");
    });
    return;
  }

  currentAudio?.pause();
};

const handleDownload = async () => {
  const text = demoText.value.trim();
  if (!text) {
    ElMessage.warning("请先输入要下载的文本");
    return;
  }

  isDownloading.value = true;
  try {
    const audioBlob = await requestSpeechAudio(text);
    const downloadUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `语音合成-${Date.now()}.mp3`;
    link.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
    ElMessage.success("语音文件已生成");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "语音文件生成失败，请稍后重试");
  } finally {
    isDownloading.value = false;
  }
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
  align-self: start;
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tts-voice-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 14px;
}

.tts-voice-card {
  position: relative;
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

.tts-voice-card--disabled {
  cursor: not-allowed;
  opacity: 0.48;
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

.tts-voice-card em {
  position: absolute;
  top: 8px;
  right: 8px;
  border-radius: 999px;
  padding: 2px 6px;
  background: rgba(89, 96, 99, 0.1);
  color: #596063;
  font-size: 8px;
  font-style: normal;
  font-weight: 900;
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
  height: auto;
  max-height: none;
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
  height: auto;
  max-height: none;
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

.tts-workbench-page--dense .tts-voice-card em {
  top: 2px;
  right: 3px;
  padding: 1px 3px;
  font-size: 6px;
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
