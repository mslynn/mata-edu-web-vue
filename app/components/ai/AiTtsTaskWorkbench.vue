<template>
  <div class="ai-tts-workbench">
    <div class="ai-tts-workbench__main">
      <section class="ai-tts-workbench__left">
        <div class="ai-tts-workbench__editor">
          <textarea
            v-model="demoText"
            :maxlength="MAX_TTS_TEXT_LENGTH"
            :placeholder="t('ttsDemo.textareaPlaceholder')"
          ></textarea>

          <div class="ai-tts-workbench__editor-footer">
            <span>{{
              t("ttsDemo.charCount", {
                current: demoText.length,
                max: MAX_TTS_TEXT_LENGTH,
              })
            }}</span>

            <div class="ai-tts-workbench__editor-actions">
              <button type="button" @click="clearText">{{ t("ttsDemo.clearText") }}</button>
              <button type="button" @click="triggerTextImport">
                {{ t("ttsDemo.importText") }}
              </button>
            </div>
          </div>

          <input
            ref="textFileInputRef"
            class="ai-tts-workbench__file"
            type="file"
            accept=".txt,.md,.text,text/plain,text/markdown"
            @change="handleTextImport"
          />
        </div>

        <div class="ai-tts-workbench__player">
          <button
            class="ai-tts-workbench__player-toggle"
            type="button"
            :disabled="!canUsePlayer"
            @click="toggleSpeechPlayback"
          >
            {{ playerButtonText }}
          </button>

          <div class="ai-tts-workbench__player-progress">
            <div class="ai-tts-workbench__player-track">
              <i :style="{ width: `${speechProgress}%` }"></i>
            </div>

            <div class="ai-tts-workbench__player-time">
              <span>{{ elapsedTimeText }}</span>
              <span>{{ estimatedTimeText }}</span>
            </div>
          </div>

          <span class="ai-tts-workbench__player-note">{{ t("ttsDemo.speechSynthesis") }}</span>
        </div>

        <div class="ai-tts-workbench__actions">
          <button
            class="ai-tts-workbench__primary"
            type="button"
            :disabled="isPrimaryActionDisabled"
            @click="handleSpeak"
          >
            <span>✦</span>
            {{ primaryActionText }}
          </button>

          <button
            class="ai-tts-workbench__secondary"
            type="button"
            :disabled="isDownloading"
            @click="handleDownload"
          >
            <span>↓</span>
            {{ downloadButtonText }}
          </button>
        </div>
      </section>

      <aside class="ai-tts-workbench__panel">
        <h3 class="ai-tts-workbench__panel-title">
          <span>⚙</span>
          {{ t("ttsDemo.voiceParams") }}
        </h3>

        <div
          v-for="item in parameterItems"
          :key="item.label"
          class="ai-tts-workbench__param-item"
        >
          <div class="ai-tts-workbench__param-head">
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

          <div class="ai-tts-workbench__param-scale">
            <span>{{ item.left }}</span>
            <span>{{ item.center }}</span>
            <span>{{ item.right }}</span>
          </div>
        </div>
      </aside>
    </div>

    <section class="ai-tts-workbench__voices">
      <div class="ai-tts-workbench__voices-head">
        <h3>
          <span>◉</span>
          {{ t("ttsDemo.voiceSelection") }}
        </h3>
      </div>

      <div class="ai-tts-workbench__voice-grid">
        <article
          v-for="voice in voiceItems"
          :key="voice.id"
          class="ai-tts-workbench__voice-card"
          :class="{
            'ai-tts-workbench__voice-card--active': voice.active,
            'ai-tts-workbench__voice-card--disabled': !voice.available,
          }"
          @click="selectVoice(voice.id)"
        >
          <div class="ai-tts-workbench__voice-avatar" :class="`is-${voice.theme}`">
            {{ voice.icon }}
          </div>
          <strong>{{ voice.name }}</strong>
          <span>{{ voice.desc }}</span>
          <em v-if="!voice.available">{{ t("ttsDemo.pendingAccess") }}</em>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { LOCAL_TTS_VOICES, type LocalTtsVoice } from "~/config/tts";

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

const MAX_TTS_TEXT_LENGTH = 1000;

const VOICE_MAP: Record<string, { edge: string }> = {
  "warm-female": { edge: "zh-CN-XiaoxiaoNeural" },
  "solemn-male": { edge: "zh-CN-YunyangNeural" },
  "lively-child": { edge: "zh-CN-XiaoyiNeural" },
  "professional-broadcast": { edge: "zh-CN-YunjianNeural" },
  "soft-narration": { edge: "zh-CN-XiaoxiaoNeural" },
  "magnetic-male": { edge: "zh-CN-YunxiNeural" },
  "sweet-female": { edge: "zh-CN-XiaoyiNeural" },
  "news-broadcast": { edge: "zh-CN-YunyangNeural" },
  audiobook: { edge: "zh-CN-XiaoxiaoNeural" },
  "knowledge-explain": { edge: "zh-CN-XiaoxiaoNeural" },
};

const { t } = useI18n();

const emit = defineEmits<{
  (
    event: "ready-change",
    payload: {
      ready: boolean;
      text: string;
    }
  ): void;
}>();

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

let speechTimer: number | null = null;
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl = "";

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
  if (isGeneratingPreview.value) return t("ttsDemo.generating");
  if (isSpeaking.value && !isPaused.value) return t("ttsDemo.playing");
  return hasSpokenOnce.value ? t("ttsDemo.reSynthesize") : t("ttsDemo.startSynthesize");
});
const downloadButtonText = computed(() =>
  isDownloading.value ? t("ttsDemo.generatingMp3") : t("ttsDemo.downloadVoiceFile")
);
const canSubmitTask = computed(() => {
  const currentText = demoText.value.trim();
  if (!currentText) return false;
  return hasSpokenOnce.value && currentText === lastPlayableText.value.trim();
});

const parameterItems = computed<ParameterItem[]>(() => [
  {
    key: "rate",
    label: t("ttsDemo.speedLabel"),
    icon: "↔",
    value: `${speechRate.value.toFixed(1)}x`,
    rawValue: speechRate.value,
    min: "0.5",
    max: "2",
    step: "0.1",
    left: t("ttsDemo.speedSlow"),
    center: t("ttsDemo.speedNormal"),
    right: t("ttsDemo.speedFast"),
    theme: "primary",
  },
  {
    key: "pitch",
    label: t("ttsDemo.pitchLabel"),
    icon: "≈",
    value: `${speechPitch.value}`,
    rawValue: speechPitch.value,
    min: "-10",
    max: "10",
    step: "1",
    left: t("ttsDemo.pitchLow"),
    center: t("ttsDemo.pitchBalance"),
    right: t("ttsDemo.pitchHigh"),
    theme: "secondary",
  },
  {
    key: "volume",
    label: t("ttsDemo.volumeLabel"),
    icon: "♪",
    value: `${speechVolume.value}%`,
    rawValue: speechVolume.value,
    min: "0",
    max: "100",
    step: "5",
    left: t("ttsDemo.volumeMute"),
    center: t("ttsDemo.volumeComfort"),
    right: t("ttsDemo.volumeLoud"),
    theme: "tertiary",
  },
]);

const voiceItems = computed<VoiceItem[]>(() =>
  LOCAL_TTS_VOICES.map((voice) => ({
    id: voice.id,
    name: voice.name,
    desc: voice.desc,
    icon: voice.icon,
    theme: voice.theme,
    available: voice.available,
    active: voice.id === selectedVoiceId.value,
  }))
);

watch(
  canSubmitTask,
  (ready) => {
    emit("ready-change", {
      ready,
      text: lastPlayableText.value.trim(),
    });
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopAudioPlayback();
  clearSpeechTimer();
  revokeCurrentAudioUrl();
});

const getPlayableText = () => demoText.value.trim() || lastPlayableText.value;

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
      Math.max(
        speechProgress.value,
        (elapsedSeconds.value / Math.max(estimatedSeconds.value, 1)) * 100
      )
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
  hasSpokenOnce.value = false;
  lastPlayableText.value = "";
  lastPlayedKey.value = "";
  revokeCurrentAudioUrl();
  demoText.value = "";
  elapsedSeconds.value = 0;
  estimatedSeconds.value = 0;
  speechProgress.value = 0;
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
      ElMessage.warning(t("ttsDemo.onlyTxtSupported"));
      return;
    }

    const importedText = (await readTextFileAsUtf8(file)).replace(/\r\n/g, "\n").trim();
    if (!importedText) {
      ElMessage.warning(t("ttsDemo.importedEmpty"));
      return;
    }

    demoText.value = importedText.slice(0, MAX_TTS_TEXT_LENGTH);

    if (importedText.length > MAX_TTS_TEXT_LENGTH) {
      ElMessage.warning(`文本已截断至 ${MAX_TTS_TEXT_LENGTH} 字`);
      return;
    }

    ElMessage.success(t("ttsDemo.importSuccess"));
  } catch {
    ElMessage.error(t("ttsDemo.importFailed"));
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
    ElMessage.warning(t("ttsDemo.voiceNotAvailable", { name: voice.name }));
    return;
  }

  selectedVoiceId.value = id;
  speechRate.value = voice.rate;
  speechPitch.value = voice.pitch;
  speechVolume.value = voice.volume;

  if (isSpeaking.value || isPaused.value) {
    void handleSpeak();
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
      errorBody?.statusMessage ||
      errorBody?.message ||
      response.statusText ||
      t("ttsDemo.speechGenerateFailed");
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
    const duration =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : estimatedSeconds.value;
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
    ElMessage.error(t("ttsDemo.playbackFailed"));
  };
};

const handleSpeak = async () => {
  if (typeof window === "undefined") return;

  const text = getPlayableText();
  if (!text) {
    ElMessage.warning(t("ttsDemo.pleaseInputText"));
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
    ElMessage.error(error instanceof Error ? error.message : t("ttsDemo.synthesisFailed"));
  } finally {
    isGeneratingPreview.value = false;
  }
};

const toggleSpeechPlayback = () => {
  if (!isSpeaking.value && !hasSpokenOnce.value) {
    void handleSpeak();
    return;
  }

  if (!isSpeaking.value && hasSpokenOnce.value) {
    const playableText = getPlayableText();
    if (currentAudio && lastPlayedKey.value === getPlaybackKey(playableText)) {
      currentAudio.currentTime = 0;
      bindAudioEvents(currentAudio, playableText);
      currentAudio.play().catch(() => {
        ElMessage.error(t("ttsDemo.playbackFailed"));
      });
      return;
    }
    void handleSpeak();
    return;
  }

  if (isPaused.value) {
    currentAudio?.play().catch(() => {
      ElMessage.error(t("ttsDemo.playbackFailed"));
    });
    return;
  }

  currentAudio?.pause();
};

const handleDownload = async () => {
  const text = demoText.value.trim();
  if (!text) {
    ElMessage.warning(t("ttsDemo.downloadNoText"));
    return;
  }

  isDownloading.value = true;
  try {
    const audioBlob = await requestSpeechAudio(text);
    const downloadUrl = URL.createObjectURL(audioBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `speech-synthesis-${Date.now()}.mp3`;
    link.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
    ElMessage.success(t("ttsDemo.downloadSuccess"));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t("ttsDemo.downloadFailed"));
  } finally {
    isDownloading.value = false;
  }
};
</script>

<style scoped>
.ai-tts-workbench {
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: 28px 28px 24px;
  background:
    radial-gradient(circle at 92% 10%, rgba(165, 193, 255, 0.22), transparent 24%),
    radial-gradient(circle at 8% 88%, rgba(105, 246, 184, 0.14), transparent 22%),
    #f7f9fb;
}

.ai-tts-workbench__main {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.88fr);
  gap: 24px;
}

.ai-tts-workbench__left,
.ai-tts-workbench__panel {
  min-width: 0;
}

.ai-tts-workbench__editor,
.ai-tts-workbench__panel,
.ai-tts-workbench__player,
.ai-tts-workbench__voice-card {
  border: 1px solid rgba(172, 179, 183, 0.12);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.045);
}

.ai-tts-workbench__editor {
  display: flex;
  min-height: 340px;
  flex-direction: column;
  overflow: hidden;
}

.ai-tts-workbench__editor textarea {
  flex: 1;
  width: 100%;
  resize: none;
  border: none;
  outline: none;
  padding: 24px 26px;
  background: transparent;
  color: #2d3337;
  font-size: 16px;
  line-height: 1.7;
  box-sizing: border-box;
}

.ai-tts-workbench__editor textarea::placeholder {
  color: #acb3b7;
}

.ai-tts-workbench__editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-top: 1px solid rgba(172, 179, 183, 0.12);
  background: rgba(241, 244, 246, 0.44);
  color: #596063;
  font-size: 12px;
  font-weight: 600;
}

.ai-tts-workbench__editor-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.ai-tts-workbench__editor-actions button {
  border: none;
  background: transparent;
  color: #005bc2;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.ai-tts-workbench__file {
  display: none;
}

.ai-tts-workbench__player {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 18px;
  padding: 18px 22px;
}

.ai-tts-workbench__player-toggle {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #005bc2 0%, #4b8eff 100%);
  color: #ffffff;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 24px rgba(0, 91, 194, 0.22);
}

.ai-tts-workbench__player-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  box-shadow: none;
}

.ai-tts-workbench__player-progress {
  flex: 1;
  min-width: 0;
}

.ai-tts-workbench__player-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(191, 219, 254, 0.45);
}

.ai-tts-workbench__player-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(135deg, #005bc2 0%, #62a8ff 100%);
}

.ai-tts-workbench__player-time {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.ai-tts-workbench__player-note {
  flex-shrink: 0;
  color: #1d4f91;
  font-size: 13px;
  font-weight: 700;
}

.ai-tts-workbench__actions {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.ai-tts-workbench__primary,
.ai-tts-workbench__secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 156px;
  height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.ai-tts-workbench__primary {
  border: none;
  background: linear-gradient(135deg, #005bc2 0%, #4b8eff 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(0, 91, 194, 0.2);
}

.ai-tts-workbench__secondary {
  border: 1px solid rgba(0, 91, 194, 0.14);
  background: #ffffff;
  color: #005bc2;
}

.ai-tts-workbench__primary:hover:not(:disabled),
.ai-tts-workbench__secondary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.ai-tts-workbench__primary:disabled,
.ai-tts-workbench__secondary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.ai-tts-workbench__panel {
  padding: 24px 22px;
}

.ai-tts-workbench__panel-title,
.ai-tts-workbench__voices-head h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  font-weight: 800;
}

.ai-tts-workbench__param-item + .ai-tts-workbench__param-item {
  margin-top: 18px;
}

.ai-tts-workbench__param-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.ai-tts-workbench__param-head label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 700;
}

.ai-tts-workbench__param-head label span,
.ai-tts-workbench__param-head strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ai-tts-workbench__param-head strong {
  font-size: 14px;
}

.ai-tts-workbench__param-head .is-primary {
  color: #005bc2;
}

.ai-tts-workbench__param-head .is-secondary {
  color: #1d4ed8;
}

.ai-tts-workbench__param-head .is-tertiary {
  color: #059669;
}

.ai-tts-workbench__param-item input[type="range"] {
  width: 100%;
}

.ai-tts-workbench__param-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 11px;
}

.ai-tts-workbench__voices {
  margin-top: 24px;
}

.ai-tts-workbench__voice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.ai-tts-workbench__voice-card {
  display: flex;
  min-height: 128px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 12px;
  text-align: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.ai-tts-workbench__voice-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 91, 194, 0.28);
}

.ai-tts-workbench__voice-card--active {
  border-color: rgba(0, 91, 194, 0.45);
  box-shadow: 0 18px 30px rgba(0, 91, 194, 0.12);
}

.ai-tts-workbench__voice-card--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.ai-tts-workbench__voice-card strong {
  color: #2d3337;
  font-size: 14px;
  font-weight: 800;
}

.ai-tts-workbench__voice-card span,
.ai-tts-workbench__voice-card em {
  color: #64748b;
  font-size: 12px;
  font-style: normal;
}

.ai-tts-workbench__voice-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 700;
}

.ai-tts-workbench__voice-avatar.is-primary {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.ai-tts-workbench__voice-avatar.is-secondary {
  background: rgba(14, 165, 233, 0.12);
  color: #0284c7;
}

.ai-tts-workbench__voice-avatar.is-tertiary {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.ai-tts-workbench__voice-avatar.is-neutral {
  background: rgba(71, 85, 105, 0.12);
  color: #334155;
}

.ai-tts-workbench__voice-avatar.is-error {
  background: rgba(244, 114, 182, 0.12);
  color: #db2777;
}

@media (max-width: 1100px) {
  .ai-tts-workbench {
    padding: 20px;
  }

  .ai-tts-workbench__main {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .ai-tts-workbench__player,
  .ai-tts-workbench__actions,
  .ai-tts-workbench__editor-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-tts-workbench__player-note {
    text-align: center;
  }

  .ai-tts-workbench__primary,
  .ai-tts-workbench__secondary {
    width: 100%;
  }
}
</style>
