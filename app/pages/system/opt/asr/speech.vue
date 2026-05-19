<template>
  <div class="asr-speech-page">
    <div class="asr-speech-shell">
      <nav class="asr-speech-breadcrumb" :aria-label="t('asrDemo.breadcrumbAria')">
        <button
          type="button"
          class="asr-speech-breadcrumb__link"
          @click="goBackToCenter"
        >
          {{ t("asrDemo.aiPracticeCenter") }}
        </button>
        <span class="asr-speech-breadcrumb__separator">/</span>
        <button
          type="button"
          class="asr-speech-breadcrumb__link"
          @click="goBackToIntro"
        >
          {{ t("asrDemo.speechTranscription") }}
        </button>
        <span class="asr-speech-breadcrumb__separator">/</span>
        <strong class="asr-speech-breadcrumb__current">{{ t("asrDemo.experienceLabel") }}</strong>
      </nav>

      <aside class="asr-speech-library">
        <header class="asr-speech-library__head">
          <h2>{{ t("asrDemo.voiceLibrary") }}</h2>
          <button type="button" @click="resetWorkspace">
            <span class="asr-symbol">↻</span>
          </button>
        </header>

        <div class="asr-speech-library__list">
          <article
            v-for="item in audioLibrary"
            :key="item.id"
            class="asr-audio-card"
            :class="[
              `is-${item.theme}`,
              {
                'is-selected': selectedLibraryItemId === item.id,
                'is-playing': playingLibraryItemId === item.id,
              },
            ]"
            @click="selectLibraryItem(item.id)"
          >
            <div class="asr-audio-card__meta">
              <button
                type="button"
                class="asr-audio-card__play"
                @click.stop="toggleLibraryPlayback(item.id)"
              >
                <span class="asr-symbol">{{ playingLibraryItemId === item.id ? "❚❚" : "▶" }}</span>
              </button>
              <div>
                <h3>{{ item.name }}</h3>
                <p>
                  <span class="asr-symbol is-small">◷</span>
                  {{ item.duration }}
                  <i></i>
                  {{ item.language }}
                </p>
              </div>
            </div>
            <div class="asr-audio-card__track">
              <span :style="{ width: `${getLibraryProgress(item.id, item.progress)}%` }"></span>
            </div>
          </article>
        </div>
      </aside>

      <main class="asr-speech-workspace">
        <section class="asr-speech-panel">
          <div class="asr-speech-tabs">
            <button
              v-for="tab in sourceTabs"
              :key="tab.value"
              type="button"
              :class="{ 'is-active': activeSourceTab === tab.value }"
              @click="activeSourceTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="asr-record-box">
            <div class="asr-record-box__inner">
              <template v-if="activeSourceTab === 'record'">
                <div class="asr-record-box__status">
                  <div class="asr-record-box__mic">
                    <span class="asr-symbol">●</span>
                  </div>
                  <p>
                    <i></i>
                    {{ recordingStatusText }}
                  </p>
                </div>

                <p class="asr-record-box__hint">
                  {{ recognitionLanguageHint }}
                </p>

                <div class="asr-record-diagnostics">
                  <span :class="{ 'is-ok': speechRecognitionSupported }">
                    {{ t("asrDemo.micRecordingLabel") }}{{ speechRecognitionSupported ? t("asrDemo.micRecordingSupported") : t("asrDemo.micRecordingNotSupported") }}
                  </span>
                  <span :class="{ 'is-ok': isSecureRecognitionContext }">
                    {{ t("asrDemo.accessEnvLabel") }}{{ isSecureRecognitionContext ? t("asrDemo.accessEnvOk") : t("asrDemo.accessEnvLimited") }}
                  </span>
                  <span :class="{ 'is-ok': microphoneLevel > 2 }">
                    {{ t("asrDemo.micInputLabel") }}{{ microphoneLevelText }}
                  </span>
                  <span :class="{ 'is-ok': Boolean(selectedMicrophoneName) }">
                    {{ t("asrDemo.inputDeviceLabel") }}{{ selectedMicrophoneName || t("asrDemo.inputDeviceWaiting") }}
                  </span>
                  <span :class="{ 'is-ok': !lastRecognitionError }">
                    {{ t("asrDemo.lastStatusLabel") }}{{ lastRecognitionError || t("asrDemo.lastStatusWaiting") }}
                  </span>
                </div>

                <label class="asr-microphone-select">
                  <span>{{ t("asrDemo.micDeviceLabel") }}</span>
                  <select
                    v-model="selectedMicrophoneId"
                    :disabled="isRecognizing || !microphoneDevices.length"
                  >
                    <option value="">{{ t("asrDemo.micDeviceDefault") }}</option>
                    <option
                      v-for="device in microphoneDevices"
                      :key="device.deviceId"
                      :value="device.deviceId"
                    >
                      {{ device.label }}
                    </option>
                  </select>
                </label>

                <audio
                  v-if="recordedAudioUrl"
                  class="asr-record-player"
                  :src="recordedAudioUrl"
                  controls
                ></audio>
                <p v-if="recordedAudioUrl" class="asr-record-player__hint">
                  {{ t("asrDemo.recordPlaybackHint") }}
                </p>
              </template>

              <template v-else>
                <label class="asr-upload-box">
                  <input
                    ref="audioInputRef"
                    type="file"
                    accept="audio/mpeg,.mp3,audio/wav,.wav,audio/x-m4a,.m4a,audio/webm,.webm"
                    @change="handleAudioUpload"
                  />
                  <div class="asr-upload-box__icon">
                    <span class="asr-symbol">↑</span>
                  </div>
                  <strong>{{ uploadedAudioName || t("asrDemo.uploadLocalAudio") }}</strong>
                  <p>{{ uploadHintText }}</p>
                </label>
              </template>

              <div class="asr-record-box__bar">
                <span :style="{ width: `${recordProgress}%` }"></span>
              </div>

              <div class="asr-record-box__time">
                <strong>{{ recordElapsedText }}</strong>
                <span v-if="activeSourceTab === 'record'">/ {{ recordLimitText }}</span>
                <span v-else>{{ uploadMetaText }}</span>
              </div>
            </div>
          </div>

          <div class="asr-speech-actions">
            <button
              class="asr-speech-actions__primary"
              type="button"
              :disabled="primaryActionDisabled"
              @click="handlePrimaryAction"
            >
              <span class="asr-symbol">✦</span>
              {{ primaryActionText }}
            </button>
          </div>
        </section>

        <section class="asr-result-panel">
          <header class="asr-result-panel__head">
            <h2>
              <span></span>
              {{ t("asrDemo.transcriptResult") }}
            </h2>
            <button type="button" @click="exportTranscript">
              <span class="asr-symbol">↓</span>
              {{ t("asrDemo.exportText") }}
            </button>
          </header>

          <div class="asr-result-panel__body">
            <template v-if="transcriptItems.length">
              <p
                v-for="item in transcriptItems"
                :key="item.time + item.text"
                :class="{ 'is-active': item.active }"
              >
                <strong v-if="item.active">{{ item.text }}</strong>
                <template v-else>{{ item.text }}</template>
              </p>
              <div v-if="isRecognizing || isTranscribingFile" class="asr-result-panel__pending">
                <span class="asr-symbol">↻</span>
                {{ resultPendingText }}
              </div>
            </template>
            <div v-else class="asr-result-panel__empty">
              {{ emptyResultText }}
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import { createModel } from "vosk-browser";
import type { KaldiRecognizer, Model } from "vosk-browser";

const { t } = useI18n();

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: computed(() => t("asrDemo.experiencePageTitle")),
  htmlAttrs: {},
});

type SourceTabValue = "record" | "upload";
type RecognitionLanguageValue = "zh-CN" | "en-US";

type AudioLibraryItem = {
  id: string;
  name: string;
  duration: string;
  language: string;
  progress: number;
  src: string;
  theme: "primary" | "secondary" | "tertiary" | "neutral";
};

type TranscriptItem = {
  time: string;
  text: string;
  active?: boolean;
};

type MicrophoneDevice = {
  deviceId: string;
  label: string;
};

type RecognitionLanguageConfig = {
  label: string;
  value: RecognitionLanguageValue;
  hint: string;
  modelUrl: string;
  sampleRate: number;
};

const sourceTabs = computed<Array<{ label: string; value: SourceTabValue }>>(() => [
  { label: t("asrDemo.tabRecord"), value: "record" },
  { label: t("asrDemo.tabUpload"), value: "upload" },
]);

const recognitionLanguages = computed<RecognitionLanguageConfig[]>(() => [
  {
    label: t("asrDemo.langChinese"),
    value: "zh-CN",
    hint: t("asrDemo.langChineseHint"),
    modelUrl: "https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-cn-0.3.tar.gz",
    sampleRate: 16000,
  },
  {
    label: "English",
    value: "en-US",
    hint: t("asrDemo.langEnglishHint"),
    modelUrl: "https://ccoreilly.github.io/vosk-browser/models/vosk-model-small-en-us-0.15.tar.gz",
    sampleRate: 16000,
  },
]);

const audioLibrary: AudioLibraryItem[] = [
  { id: "lecture-01", name: "lecture-english-01.wav", duration: "00:11", language: "en", progress: 100, src: "/asr-demo/lecture-english-01.wav", theme: "primary" },
  { id: "discussion-01", name: "classroom-chinese-01.wav", duration: "00:11", language: "zh", progress: 100, src: "/asr-demo/classroom-chinese-01.wav", theme: "tertiary" },
  { id: "customer-01", name: "discussion-chinese-02.wav", duration: "00:11", language: "zh", progress: 100, src: "/asr-demo/discussion-chinese-02.wav", theme: "secondary" },
  { id: "meeting-01", name: "meeting-chinese-03.wav", duration: "00:11", language: "zh", progress: 100, src: "/asr-demo/meeting-chinese-03.wav", theme: "primary" },
  { id: "test-01", name: "interview-english-02.wav", duration: "00:09", language: "en", progress: 100, src: "/asr-demo/interview-english-02.wav", theme: "neutral" },
];

const activeSourceTab = ref<SourceTabValue>("upload");
const recognitionLanguage = ref<RecognitionLanguageValue>("zh-CN");
const selectedLibraryItemId = ref<string | null>(null);
const transcriptItems = ref<TranscriptItem[]>([]);
const finalizedTranscriptItems = ref<TranscriptItem[]>([]);
const interimTranscript = ref("");
const uploadedAudioName = ref("");
const uploadDurationText = ref("--:--");
const recordedAudioUrl = ref("");
const selectedMicrophoneId = ref("");
const selectedMicrophoneName = ref("");
const microphoneDevices = ref<MicrophoneDevice[]>([]);
const recordElapsedSeconds = ref(0);
const recordLimitSeconds = ref(300);
const selectedAudioFile = ref<File | null>(null);
const audioInputRef = ref<HTMLInputElement | null>(null);
const modelLoadingMap = reactive<Record<RecognitionLanguageValue, boolean>>({
  "zh-CN": false,
  "en-US": false,
});
const isModelReady = ref(false);
const isRecognizing = ref(false);
const isTranscribingFile = ref(false);
const hasRecordedAudio = ref(false);
const modelLoadError = ref("");
const sessionStartedAt = ref<number | null>(null);
const recordTimer = ref<ReturnType<typeof setInterval> | null>(null);
const microphoneLevelTimer = ref<ReturnType<typeof setInterval> | null>(null);
const createEmptyModelCache = (): Record<RecognitionLanguageValue, Model | null> => ({
  "zh-CN": null,
  "en-US": null,
});
const modelPromiseMap = new Map<RecognitionLanguageValue, Promise<Model | null>>();
const modelCacheRef = shallowRef<Record<RecognitionLanguageValue, Model | null>>(createEmptyModelCache());
const modelRef = shallowRef<Model | null>(null);
const recognizerRef = shallowRef<KaldiRecognizer | null>(null);
const mediaStreamRef = shallowRef<MediaStream | null>(null);
const microphoneAnalyserRef = shallowRef<AnalyserNode | null>(null);
const microphoneSourceRef = shallowRef<MediaStreamAudioSourceNode | null>(null);
const recordingSourceRef = shallowRef<MediaStreamAudioSourceNode | null>(null);
const recordingProcessorRef = shallowRef<ScriptProcessorNode | null>(null);
const recordingGainRef = shallowRef<GainNode | null>(null);
const audioContextRef = shallowRef<AudioContext | null>(null);
const realtimeRecognizerRef = shallowRef<KaldiRecognizer | null>(null);
const libraryAudioRef = shallowRef<HTMLAudioElement | null>(null);
const recognizerSampleRateRef = ref<number | null>(null);
const recordedAudioChunksRef = ref<Float32Array[]>([]);
const recordedAudioSampleRate = ref(16000);
const playingLibraryItemId = ref<string | null>(null);
const libraryProgressMap = ref<Record<string, number>>(
  Object.fromEntries(audioLibrary.map((item) => [item.id, item.progress])),
);
const lastRecognitionError = ref("");
const preferredMicrophoneName = "麦克风 (Realtek(R) Audio)";

const selectedRecognitionLanguage = computed(() =>
  recognitionLanguages.value.find((item) => item.value === recognitionLanguage.value) ?? recognitionLanguages.value[0],
);

const isModelLoading = computed(() => modelLoadingMap[recognitionLanguage.value]);
const speechRecognitionSupported = computed(() => {
  if (!import.meta.client) return true;
  return typeof AudioContext !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
});
const isSecureRecognitionContext = computed(() => {
  if (!import.meta.client) return true;
  return window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";
});

const recordProgress = computed(() => {
  if (activeSourceTab.value === "upload" && selectedAudioFile.value) return 100;
  return Math.min(100, Math.round((recordElapsedSeconds.value / recordLimitSeconds.value) * 100));
});

const recordElapsedText = computed(() => formatTime(recordElapsedSeconds.value));
const recordLimitText = computed(() => formatTime(recordLimitSeconds.value));
const uploadMetaText = computed(() => uploadedAudioName.value ? uploadDurationText.value : t("asrDemo.uploadMetaFormat"));
const microphoneLevel = ref(0);
const microphoneLevelText = computed(() => {
  if (!isRecognizing.value) return t("asrDemo.micInputWaiting");
  if (microphoneLevel.value > 12) return t("asrDemo.micInputClear");
  if (microphoneLevel.value > 2) return t("asrDemo.micInputLow");
  return t("asrDemo.micInputNone");
});

const recordingStatusText = computed(() => {
  if (isTranscribingFile.value) return t("asrDemo.statusTranscribingFile");
  if (isRecognizing.value) return t("asrDemo.statusRealtimeTranscribing");
  if (hasRecordedAudio.value && activeSourceTab.value === "record") {
    return t("asrDemo.statusRecordDone", { name: uploadedAudioName.value || "recorded-audio.wav" });
  }
  return t("asrDemo.statusIdleRecord");
});

const recognitionLanguageHint = computed(() => {
  return t("asrDemo.realtimeHint");
});

const uploadHintText = computed(() => {
  if (!selectedAudioFile.value) return t("asrDemo.uploadFormatHint");
  return t("asrDemo.uploadReadyHint");
});

const primaryActionDisabled = computed(() => {
  if (isTranscribingFile.value) return true;

  if (activeSourceTab.value === "record") {
    if (isRecognizing.value) return false;
    if (selectedAudioFile.value) return isModelLoading.value || !isModelReady.value;
    return !speechRecognitionSupported.value || !isSecureRecognitionContext.value || isModelLoading.value;
  }

  if (!selectedAudioFile.value) return false;
  return isModelLoading.value || !isModelReady.value;
});

const primaryActionText = computed(() => {
  if (activeSourceTab.value === "record") {
    if (isTranscribingFile.value) return t("asrDemo.actionTranscribing");
    if (isRecognizing.value) return t("asrDemo.actionStopTranscribe");
    if (selectedAudioFile.value) return isModelLoading.value ? t("asrDemo.actionModelLoading") : t("asrDemo.actionTranscribeRecording");
    return isModelLoading.value ? t("asrDemo.actionModelLoading") : t("asrDemo.actionStartRealtime");
  }
  if (!selectedAudioFile.value) return t("asrDemo.actionSelectFile");
  if (isTranscribingFile.value) return t("asrDemo.actionTranscribing");
  if (isModelLoading.value) return t("asrDemo.actionModelLoading");
  if (!isModelReady.value) return t("asrDemo.actionStartTranscribe");
  return t("asrDemo.actionStartTranscribe");
});

const resultPendingText = computed(() => {
  if (isRecognizing.value) return t("asrDemo.transcribingRealtime");
  if (isTranscribingFile.value) return t("asrDemo.transcribingFile");
  return t("asrDemo.processingGeneric");
});

const emptyResultText = computed(() => {
  if (modelLoadError.value) return modelLoadError.value;
  if (activeSourceTab.value === "upload") {
    if (!isModelReady.value) return t("asrDemo.emptyUploadNoModel");
    return t("asrDemo.emptyUploadReady");
  }
  if (selectedAudioFile.value && hasRecordedAudio.value) {
    return t("asrDemo.emptyRecordDone");
  }
  return t("asrDemo.emptyRecordIdle");
});

const getLibraryProgress = (id: string, fallback: number) => libraryProgressMap.value[id] ?? fallback;
const getRecognitionLanguageFromLibraryItem = (item: AudioLibraryItem): RecognitionLanguageValue =>
  item.language === "en" ? "en-US" : "zh-CN";
const getRecognitionLanguageConfig = (value: RecognitionLanguageValue) =>
  recognitionLanguages.value.find((item) => item.value === value) ?? recognitionLanguages.value[0];

const formatTime = (value: number) => {
  const safe = Math.max(0, Math.floor(value));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatTimelineTime = (value: number) => {
  const safe = Math.max(0, Math.floor(value));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const syncTranscriptItems = () => {
  const nextItems = [...finalizedTranscriptItems.value];
  const interim = interimTranscript.value.trim();
  if (interim) {
    nextItems.push({
      time: formatTimelineTime(recordElapsedSeconds.value),
      text: interim,
      active: true,
    });
  }
  transcriptItems.value = nextItems;
};

const clearTranscriptItems = () => {
  finalizedTranscriptItems.value = [];
  interimTranscript.value = "";
  transcriptItems.value = [];
};

const clearRecordedAudioUrl = () => {
  if (!recordedAudioUrl.value) return;
  URL.revokeObjectURL(recordedAudioUrl.value);
  recordedAudioUrl.value = "";
};

const appendTranscriptItem = (text: string, seconds = recordElapsedSeconds.value) => {
  const safeText = text.trim();
  if (!safeText) return;
  finalizedTranscriptItems.value.push({
    time: formatTimelineTime(seconds),
    text: safeText,
  });
};

const stopRecordTimer = () => {
  if (!recordTimer.value) return;
  clearInterval(recordTimer.value);
  recordTimer.value = null;
};

const stopMicrophoneLevelMonitor = () => {
  if (microphoneLevelTimer.value) {
    clearInterval(microphoneLevelTimer.value);
    microphoneLevelTimer.value = null;
  }
  microphoneSourceRef.value?.disconnect();
  microphoneAnalyserRef.value?.disconnect();
  microphoneSourceRef.value = null;
  microphoneAnalyserRef.value = null;
  microphoneLevel.value = 0;
};

const startMicrophoneLevelMonitor = async (stream: MediaStream) => {
  stopMicrophoneLevelMonitor();

  const audioContext = audioContextRef.value ?? new AudioContext();
  audioContextRef.value = audioContext;
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 512;
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  microphoneSourceRef.value = source;
  microphoneAnalyserRef.value = analyser;

  const samples = new Uint8Array(analyser.fftSize);
  microphoneLevelTimer.value = setInterval(() => {
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) {
      const centered = sample - 128;
      sum += centered * centered;
    }
    microphoneLevel.value = Math.round(Math.sqrt(sum / samples.length));
  }, 120);
};

const startRecordTimer = () => {
  stopRecordTimer();
  sessionStartedAt.value = Date.now() - recordElapsedSeconds.value * 1000;
  recordTimer.value = setInterval(() => {
    if (!sessionStartedAt.value) return;
    recordElapsedSeconds.value = Math.floor((Date.now() - sessionStartedAt.value) / 1000);
  }, 250);
};

const mergeAudioSamples = (chunks: Float32Array[]) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
};

const resampleAudioSamples = (input: Float32Array, sourceRate: number, targetRate: number) => {
  if (sourceRate === targetRate) return input;
  const ratio = sourceRate / targetRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);
  for (let index = 0; index < outputLength; index += 1) {
    const sourceIndex = index * ratio;
    const leftIndex = Math.floor(sourceIndex);
    const rightIndex = Math.min(leftIndex + 1, input.length - 1);
    const weight = sourceIndex - leftIndex;
    output[index] = input[leftIndex] * (1 - weight) + input[rightIndex] * weight;
  }
  return output;
};

const encodeWavBlob = (samples: Float32Array, sampleRate: number) => {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: "audio/wav" });
};

const refreshMicrophoneDevices = async () => {
  if (!import.meta.client || !navigator.mediaDevices?.enumerateDevices) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputDevices = devices
      .filter((device) => device.kind === "audioinput")
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || t("asrDemo.microphoneIndexLabel", { index: index + 1 }),
      }));
    microphoneDevices.value = audioInputDevices;
    const selectedDeviceExists = audioInputDevices.some((device) => device.deviceId === selectedMicrophoneId.value);
    if (!selectedMicrophoneId.value || !selectedDeviceExists) {
      const preferredDevice = audioInputDevices.find((device) => device.label === preferredMicrophoneName);
      if (preferredDevice) {
        selectedMicrophoneId.value = preferredDevice.deviceId;
        selectedMicrophoneName.value = preferredDevice.label;
      }
    }
  } catch {
    microphoneDevices.value = [];
  }
};

const destroyRecognizer = () => {
  if (realtimeRecognizerRef.value && realtimeRecognizerRef.value !== recognizerRef.value) {
    realtimeRecognizerRef.value.remove();
  }
  realtimeRecognizerRef.value = null;
  recognizerRef.value?.remove();
  recognizerRef.value = null;
  recognizerSampleRateRef.value = null;
};

const syncActiveModel = (language = recognitionLanguage.value) => {
  destroyRecognizer();
  modelRef.value = modelCacheRef.value[language];
  isModelReady.value = Boolean(modelRef.value);
  if (!modelRef.value) {
    return null;
  }
  const config = getRecognitionLanguageConfig(language);
  return createRecognizer(config.sampleRate);
};

const destroyModel = () => {
  destroyRecognizer();
  for (const language of recognitionLanguages.value) {
    modelCacheRef.value[language.value]?.terminate();
  }
  modelPromiseMap.clear();
  modelCacheRef.value = createEmptyModelCache();
  modelRef.value = null;
  isModelReady.value = false;
};

const createRecognizer = (sampleRate = selectedRecognitionLanguage.value.sampleRate) => {
  if (!modelRef.value) return null;
  destroyRecognizer();
  const recognizer = new modelRef.value.KaldiRecognizer(sampleRate);
  recognizer.setWords(true);

  recognizer.on("result", (message) => {
    const text = message.result.text?.trim() ?? "";
    if (!text) return;
    const words = message.result.result ?? [];
    const seconds = words.length ? words[0].start : recordElapsedSeconds.value;
    appendTranscriptItem(text, seconds);
    interimTranscript.value = "";
    if (activeSourceTab.value === "record") {
      hasRecordedAudio.value = true;
      if (isTranscribingFile.value) {
        isTranscribingFile.value = false;
        lastRecognitionError.value = t("asrDemo.recordTranscribeDone");
      }
    }
    syncTranscriptItems();
  });

  recognizer.on("partialresult", (message) => {
    interimTranscript.value = message.result.partial?.trim() ?? "";
    if (activeSourceTab.value === "record" && interimTranscript.value) {
      hasRecordedAudio.value = true;
    }
    syncTranscriptItems();
  });

  recognizer.on("error", (message) => {
    modelLoadError.value = message.error || t("asrDemo.recognizerError");
    ElMessage.error(modelLoadError.value);
  });

  recognizerRef.value = recognizer;
  recognizerSampleRateRef.value = sampleRate;
  return recognizer;
};

const ensureRecognizer = (sampleRate = selectedRecognitionLanguage.value.sampleRate) => {
  if (!recognizerRef.value) {
    return createRecognizer(sampleRate);
  }

  if (recognizerSampleRateRef.value !== sampleRate) {
    return createRecognizer(sampleRate);
  }

  return recognizerRef.value;
};

const loadModelByLanguage = async (
  language: RecognitionLanguageValue,
  options: { activate?: boolean; silentSuccess?: boolean; silentError?: boolean } = {},
) => {
  if (modelCacheRef.value[language]) {
    if (options.activate && recognitionLanguage.value === language) {
      modelLoadError.value = "";
      syncActiveModel(language);
    }
    return modelCacheRef.value[language];
  }

  if (modelPromiseMap.has(language)) {
    const cachedPromise = modelPromiseMap.get(language)!;
    const cachedModel = await cachedPromise;
    if (options.activate && recognitionLanguage.value === language) {
      modelLoadError.value = "";
      syncActiveModel(language);
    }
    return cachedModel;
  }

  modelLoadingMap[language] = true;
  const config = getRecognitionLanguageConfig(language);
  const loadPromise = (async () => {
    try {
      const model = await createModel(config.modelUrl);
      modelCacheRef.value = {
        ...modelCacheRef.value,
        [language]: model,
      };
      if (options.activate && recognitionLanguage.value === language) {
        modelLoadError.value = "";
        syncActiveModel(language);
      }
      if (!options.silentSuccess) {
        ElMessage.success(t("asrDemo.modelLoadedSuccess", { label: config.label }));
      }
      return model;
    } catch (error) {
      const message = error instanceof Error ? error.message : t("asrDemo.modelLoadFailed");
      if (options.activate && recognitionLanguage.value === language) {
        modelLoadError.value = t("asrDemo.modelLoadFailedDetail", { message });
        isModelReady.value = false;
        modelRef.value = null;
      }
      if (!options.silentError) {
        ElMessage.error(t("asrDemo.modelLoadFailedDetail", { message }));
      }
      return null;
    } finally {
      modelLoadingMap[language] = false;
      modelPromiseMap.delete(language);
    }
  })();

  modelPromiseMap.set(language, loadPromise);
  return loadPromise;
};

const loadCurrentModel = async (options: { silentSuccess?: boolean; silentError?: boolean } = {}) => {
  modelLoadError.value = "";
  const model = await loadModelByLanguage(recognitionLanguage.value, {
    activate: true,
    silentSuccess: options.silentSuccess,
    silentError: options.silentError,
  });
  if (!model && recognitionLanguage.value) {
    syncActiveModel(recognitionLanguage.value);
  }
  return model;
};

const preloadRecognitionModels = async () => {
  const preloadTasks = recognitionLanguages.value.map((item) =>
    loadModelByLanguage(item.value, {
      activate: item.value === recognitionLanguage.value,
      silentSuccess: true,
      silentError: item.value !== recognitionLanguage.value,
    }),
  );
  await Promise.all(preloadTasks);
  syncActiveModel(recognitionLanguage.value);
};

const switchRecognitionLanguage = async (value: RecognitionLanguageValue) => {
  recognitionLanguage.value = value;
  modelLoadError.value = "";
  syncActiveModel(value);
  if (isModelReady.value) {
    return true;
  }
  const model = await loadCurrentModel({ silentSuccess: true, silentError: false });
  return Boolean(model);
};

const decodeAudioFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = audioContextRef.value ?? new AudioContext();
  audioContextRef.value = audioContext;
  const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  return decoded;
};

const resampleDecodedAudio = async (audioBuffer: AudioBuffer, targetSampleRate: number) => {
  if (audioBuffer.sampleRate === targetSampleRate && audioBuffer.numberOfChannels === 1) {
    return audioBuffer;
  }

  const frameCount = Math.max(1, Math.ceil(audioBuffer.duration * targetSampleRate));
  const offlineContext = new OfflineAudioContext(1, frameCount, targetSampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);
  return offlineContext.startRendering();
};

const renderTranscriptFromWords = (words: Array<{ start: number; end: number; word: string }>) => {
  if (!words.length) return;

  const groups: Array<{ time: number; text: string[] }> = [];
  for (const word of words) {
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || word.start - lastGroup.time > 8 || lastGroup.text.length >= 16) {
      groups.push({
        time: word.start,
        text: [word.word],
      });
      continue;
    }
    lastGroup.text.push(word.word);
  }

  finalizedTranscriptItems.value = groups.map((group) => ({
    time: formatTimelineTime(group.time),
    text: group.text.join(" ").trim(),
  }));
  transcriptItems.value = [...finalizedTranscriptItems.value];
};

const transcribeAudioFile = async (file: File) => {
  if (!isModelReady.value) {
    await loadCurrentModel();
  }
  if (!isModelReady.value) return;

  isTranscribingFile.value = true;
  clearTranscriptItems();
  recordElapsedSeconds.value = 0;
  interimTranscript.value = "";

  try {
    const decoded = await decodeAudioFile(file);
    const targetSampleRate = selectedRecognitionLanguage.value.sampleRate;
    const normalizedAudio = await resampleDecodedAudio(decoded, targetSampleRate);
    const recognizer = createRecognizer(targetSampleRate);
    if (!recognizer) {
      ElMessage.error(t("asrDemo.recognizerInitFailed"));
      return;
    }

    uploadDurationText.value = formatTime(decoded.duration);
    recordElapsedSeconds.value = Math.floor(decoded.duration);
    lastRecognitionError.value = t("asrDemo.transcribingStatus", { rate: targetSampleRate / 1000 });

    recognizer.acceptWaveform(normalizedAudio);
    recognizer.retrieveFinalResult();

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const hasFinalText = finalizedTranscriptItems.value.some((item) => item.text.trim());
      const hasRenderedText = transcriptItems.value.some((item) => item.text.trim());
      const hasInterimText = Boolean(interimTranscript.value.trim());
      if (hasFinalText || hasRenderedText || hasInterimText) {
        break;
      }
    }

    if (finalizedTranscriptItems.value.length) {
      ElMessage.success(t("asrDemo.transcribeSuccess"));
      return;
    }

    const fallbackText = transcriptItems.value.map((item) => item.text).join(" ").trim();
    if (fallbackText) {
      ElMessage.success(t("asrDemo.transcribeSuccess"));
      return;
    }

    ElMessage.warning(t("asrDemo.transcribeNoResult"));
  } catch (error) {
    const message = error instanceof Error ? error.message : t("asrDemo.transcribeFileFailed");
    ElMessage.error(message);
  } finally {
    isTranscribingFile.value = false;
  }
};

const stopLibraryPlayback = () => {
  if (!libraryAudioRef.value) return;
  libraryAudioRef.value.pause();
  libraryAudioRef.value.currentTime = 0;
  playingLibraryItemId.value = null;
};

const ensureLibraryAudio = () => {
  if (libraryAudioRef.value) return libraryAudioRef.value;

  const audio = new Audio();
  audio.preload = "auto";

  audio.addEventListener("timeupdate", () => {
    const currentId = playingLibraryItemId.value;
    if (!currentId || !audio.duration) return;
    libraryProgressMap.value = {
      ...libraryProgressMap.value,
      [currentId]: Math.min(100, Math.round((audio.currentTime / audio.duration) * 100)),
    };
  });

  audio.addEventListener("ended", () => {
    const currentId = playingLibraryItemId.value;
    if (currentId) {
      libraryProgressMap.value = {
        ...libraryProgressMap.value,
        [currentId]: 100,
      };
    }
    playingLibraryItemId.value = null;
  });

  audio.addEventListener("pause", () => {
    if (!audio.ended) {
      playingLibraryItemId.value = null;
    }
  });

  libraryAudioRef.value = audio;
  return audio;
};

const toggleLibraryPlayback = async (id: string) => {
  const current = audioLibrary.find((item) => item.id === id);
  if (!current) return;

  const audio = ensureLibraryAudio();

  if (playingLibraryItemId.value === id) {
    audio.pause();
    return;
  }

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.src = current.src;
    libraryProgressMap.value = {
      ...libraryProgressMap.value,
      [id]: 0,
    };
    await audio.play();
    playingLibraryItemId.value = id;
  } catch (error) {
    playingLibraryItemId.value = null;
    const message = error instanceof Error ? error.message : t("asrDemo.audioPlayFailed");
    ElMessage.error(message);
  }
};

const stopRecognition = async () => {
  if (!isRecognizing.value) return;
  stopRecordTimer();
  stopMicrophoneLevelMonitor();
  isRecognizing.value = false;
  lastRecognitionError.value = t("asrDemo.stopRecordGenerating");

  if (recordingProcessorRef.value) {
    recordingProcessorRef.value.onaudioprocess = null;
  }
  recordingProcessorRef.value?.disconnect();
  recordingSourceRef.value?.disconnect();
  recordingGainRef.value?.disconnect();
  mediaStreamRef.value?.getTracks().forEach((track) => track.stop());
  recordingProcessorRef.value = null;
  recordingSourceRef.value = null;
  recordingGainRef.value = null;
  mediaStreamRef.value = null;

  try {
    const sourceSamples = mergeAudioSamples(recordedAudioChunksRef.value);
    recordedAudioChunksRef.value = [];
    if (!sourceSamples.length) {
      lastRecognitionError.value = t("asrDemo.noAudioCaptured");
      ElMessage.warning(t("asrDemo.noValidSound"));
      return;
    }

    const targetSampleRate = selectedRecognitionLanguage.value.sampleRate;
    const wavSamples = resampleAudioSamples(sourceSamples, recordedAudioSampleRate.value, targetSampleRate);
    const audioBlob = encodeWavBlob(wavSamples, targetSampleRate);
    const file = new File([audioBlob], `recorded-audio-${Date.now()}.wav`, { type: "audio/wav" });
    destroyRecognizer();
    clearRecordedAudioUrl();
    recordedAudioUrl.value = URL.createObjectURL(audioBlob);
    await loadAudioFileToWorkspace(file);
    hasRecordedAudio.value = true;
    lastRecognitionError.value = t("asrDemo.recordDoneStatus", { rate: targetSampleRate / 1000 });
    ElMessage.success(t("asrDemo.recordDoneMessage"));
  } catch (error) {
    lastRecognitionError.value = error instanceof Error ? error.message : t("asrDemo.recordFileFailed");
    ElMessage.error(lastRecognitionError.value);
  }
};

const startRecognition = async () => {
  if (!speechRecognitionSupported.value) {
    lastRecognitionError.value = t("asrDemo.browserNotSupportedShort");
    ElMessage.error(t("asrDemo.browserNotSupported"));
    return;
  }

  if (!isSecureRecognitionContext.value) {
    lastRecognitionError.value = t("asrDemo.secureContextLimited");
    ElMessage.error(t("asrDemo.secureContextRequired"));
    return;
  }

  try {
    if (!isModelReady.value) {
      lastRecognitionError.value = t("asrDemo.loadingModel");
      await loadCurrentModel();
    }
    if (!isModelReady.value) {
      lastRecognitionError.value = t("asrDemo.modelNotReady");
      return;
    }

    lastRecognitionError.value = "";
    clearTranscriptItems();
    recordElapsedSeconds.value = 0;
    uploadedAudioName.value = "";
    uploadDurationText.value = "--:--";
    selectedAudioFile.value = null;
    hasRecordedAudio.value = false;
    microphoneLevel.value = 0;
    selectedMicrophoneName.value = "";
    recordedAudioChunksRef.value = [];
    clearRecordedAudioUrl();

    const targetSampleRate = selectedRecognitionLanguage.value.sampleRate;
    const audioConstraints: MediaTrackConstraints = {
      channelCount: 1,
      sampleRate: targetSampleRate,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
    if (selectedMicrophoneId.value) {
      audioConstraints.deviceId = { exact: selectedMicrophoneId.value };
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
    });
    mediaStreamRef.value = stream;
    selectedMicrophoneName.value = stream.getAudioTracks()[0]?.label || t("asrDemo.defaultMicrophone");
    await refreshMicrophoneDevices();

    const audioContext = audioContextRef.value ?? new AudioContext();
    audioContextRef.value = audioContext;
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    recordedAudioSampleRate.value = audioContext.sampleRate;
    const recognizer = createRecognizer(targetSampleRate);
    if (!recognizer) {
      lastRecognitionError.value = t("asrDemo.recognizerInitFailed");
      ElMessage.error(lastRecognitionError.value);
      stream.getTracks().forEach((track) => track.stop());
      mediaStreamRef.value = null;
      return;
    }
    realtimeRecognizerRef.value = recognizer;
    recordedAudioChunksRef.value = [];
    processor.onaudioprocess = (event) => {
      const input = new Float32Array(event.inputBuffer.getChannelData(0));
      recordedAudioChunksRef.value.push(input);
      const realtimeSamples = resampleAudioSamples(input, recordedAudioSampleRate.value, targetSampleRate);
      const realtimeBuffer = new AudioBuffer({
        length: realtimeSamples.length,
        numberOfChannels: 1,
        sampleRate: targetSampleRate,
      });
      realtimeBuffer.copyToChannel(realtimeSamples, 0);
      realtimeRecognizerRef.value?.acceptWaveform(realtimeBuffer);
    };
    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);
    recordingSourceRef.value = source;
    recordingProcessorRef.value = processor;
    recordingGainRef.value = silentGain;

    await startMicrophoneLevelMonitor(stream);
    startRecordTimer();
    isRecognizing.value = true;
    lastRecognitionError.value = t("asrDemo.realtimeTranscribing");
    ElMessage.success(t("asrDemo.realtimeStarted"));
  } catch (error) {
    stopRecordTimer();
    stopMicrophoneLevelMonitor();
    mediaStreamRef.value?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.value = null;
    recordingProcessorRef.value?.disconnect();
    recordingSourceRef.value?.disconnect();
    recordingGainRef.value?.disconnect();
    recordingProcessorRef.value = null;
    recordingSourceRef.value = null;
    recordingGainRef.value = null;
    realtimeRecognizerRef.value?.remove();
    realtimeRecognizerRef.value = null;
    isRecognizing.value = false;
    lastRecognitionError.value = error instanceof Error ? error.message : t("asrDemo.startFailed");
    const message = error instanceof Error ? error.message : t("asrDemo.micOpenFailed");
    ElMessage.error(message);
  }
};

const handleAudioUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  await loadAudioFileToWorkspace(file);

  ElMessage.success(t("asrDemo.audioFileLoaded"));
  input.value = "";
};

const loadAudioFileToWorkspace = async (file: File, options: { clearTranscript?: boolean } = {}) => {
  selectedAudioFile.value = file;
  uploadedAudioName.value = file.name;
  if (options.clearTranscript !== false) {
    clearTranscriptItems();
  }
  uploadDurationText.value = "--:--";

  try {
    const decoded = await decodeAudioFile(file);
    uploadDurationText.value = formatTime(decoded.duration);
  } catch {
    uploadDurationText.value = t("asrDemo.unknownDuration");
  }
};

const handlePrimaryAction = async () => {
  if (activeSourceTab.value === "record") {
    if (isRecognizing.value) {
      await stopRecognition();
      return;
    }
    if (selectedAudioFile.value) {
      await transcribeAudioFile(selectedAudioFile.value);
      return;
    }
    await startRecognition();
    return;
  }

  if (!selectedAudioFile.value) {
    audioInputRef.value?.click();
    return;
  }

  await transcribeAudioFile(selectedAudioFile.value);
};

const selectLibraryItem = async (id: string, options: { silentSuccess?: boolean } = {}) => {
  const current = audioLibrary.find((item) => item.id === id);
  if (!current) return;

  try {
    const nextLanguage = getRecognitionLanguageFromLibraryItem(current);
    if (recognitionLanguage.value !== nextLanguage) {
      const switched = await switchRecognitionLanguage(nextLanguage);
      if (!switched) {
        return;
      }
    }

    const response = await fetch(current.src);
    if (!response.ok) {
      throw new Error(t("asrDemo.demoAudioFailed"));
    }

    const blob = await response.blob();
    const file = new File([blob], current.name, { type: blob.type || "audio/wav" });

    activeSourceTab.value = "upload";
    selectedLibraryItemId.value = current.id;
    await loadAudioFileToWorkspace(file);
    if (!options.silentSuccess) {
      ElMessage.success(t("asrDemo.libraryItemLoaded", { name: current.name }));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : t("asrDemo.demoAudioFailed");
    ElMessage.error(message);
  }
};

const exportTranscript = async () => {
  const text = transcriptItems.value
    .filter((item) => item.text.trim())
    .map((item) => item.text)
    .join("\n");

  if (!text.trim()) {
    ElMessage.warning(t("asrDemo.noExportContent"));
    return;
  }

  try {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    anchor.href = url;
    anchor.download = `asr-transcript-${timestamp}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    ElMessage.success(t("asrDemo.exportSuccess"));
  } catch {
    ElMessage.error(t("asrDemo.exportFailed"));
  }
};

const resetWorkspace = async () => {
  await stopRecognition();
  clearTranscriptItems();
  recordElapsedSeconds.value = 0;
  uploadedAudioName.value = "";
  uploadDurationText.value = "--:--";
  selectedAudioFile.value = null;
  selectedLibraryItemId.value = null;
  hasRecordedAudio.value = false;
  recordedAudioChunksRef.value = [];
  clearRecordedAudioUrl();
  activeSourceTab.value = "upload";
  ElMessage.success(t("asrDemo.workspaceReset"));
};

const clearSourceWorkspaceState = () => {
  clearTranscriptItems();
  recordElapsedSeconds.value = 0;
  interimTranscript.value = "";
  uploadedAudioName.value = "";
  uploadDurationText.value = "--:--";
  selectedAudioFile.value = null;
  selectedLibraryItemId.value = null;
  hasRecordedAudio.value = false;
  recordedAudioChunksRef.value = [];
  clearRecordedAudioUrl();
};

const handleRecognitionLanguageChange = async (value: RecognitionLanguageValue) => {
  if (recognitionLanguage.value === value) return;
  if (isRecognizing.value) {
    ElMessage.warning(t("asrDemo.stopRecognitionFirst"));
    return;
  }

  const switched = await switchRecognitionLanguage(value);
  clearTranscriptItems();
  recordElapsedSeconds.value = 0;
  if (!switched) return;
};

const goBackToCenter = async () => {
  await navigateTo("/system/opt");
};

const goBackToIntro = async () => {
  await navigateTo("/system/opt/asr");
};

watch(activeSourceTab, async (nextValue, previousValue) => {
  if (previousValue === "record" && nextValue !== "record") {
    await stopRecognition();
  }

  if (nextValue !== previousValue) {
    clearSourceWorkspaceState();
    if (nextValue === "record" && recognitionLanguage.value !== "zh-CN") {
      await switchRecognitionLanguage("zh-CN");
    }
    if (nextValue === "upload" && audioLibrary[0]) {
      await selectLibraryItem(audioLibrary[0].id, { silentSuccess: true });
    }
  }
});

watch(selectedMicrophoneId, () => {
  if (isRecognizing.value) return;
  selectedMicrophoneName.value = microphoneDevices.value.find((device) => device.deviceId === selectedMicrophoneId.value)?.label ?? "";
  selectedAudioFile.value = null;
  hasRecordedAudio.value = false;
  clearRecordedAudioUrl();
});

onMounted(async () => {
  await refreshMicrophoneDevices();
  await preloadRecognitionModels();
});

onBeforeUnmount(() => {
  void stopRecognition();
  stopRecordTimer();
  stopMicrophoneLevelMonitor();
  stopLibraryPlayback();
  clearRecordedAudioUrl();
  audioContextRef.value?.close().catch(() => undefined);
  destroyModel();
});
</script>

<style scoped>
.asr-speech-page {
  height: calc(100vh - 76px);
  min-height: 0;
  overflow: hidden;
  background: #f7f9fb;
  color: #2d3337;
  font-family: "Plus Jakarta Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.asr-speech-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    "breadcrumb breadcrumb"
    "library workspace";
  gap: 16px;
  max-width: 1560px;
  height: 100%;
  min-height: 0;
  margin: 0 auto;
  padding: 14px 20px 18px;
  box-sizing: border-box;
}

.asr-speech-breadcrumb {
  grid-area: breadcrumb;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #97a3b8;
  font-size: 13px;
  font-weight: 500;
}

.asr-speech-breadcrumb__separator {
  color: #b5bfd0;
}

.asr-speech-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #005bc4;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
}

.asr-speech-breadcrumb__link:hover,
.asr-speech-breadcrumb__current {
  color: #2d3337;
}

.asr-speech-library {
  grid-area: library;
  display: flex;
  align-self: stretch;
  width: 280px;
  min-height: 0;
  min-width: 280px;
  flex-direction: column;
  gap: 12px;
}

.asr-speech-library__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.asr-speech-library__head h2 {
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  font-weight: 800;
}

.asr-speech-library__head button {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background: #dde3e7;
  color: #596063;
  cursor: pointer;
}

.asr-speech-library__list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding-right: 4px;
}

.asr-audio-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px 12px;
  box-shadow: 0 12px 32px rgba(0, 91, 196, 0.03);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease;
}

.asr-audio-card.is-selected {
  border-color: rgba(0, 91, 196, 0.22);
  background: #f8fbff;
  box-shadow: 0 16px 34px rgba(0, 91, 196, 0.08);
}

.asr-audio-card.is-playing {
  transform: translateY(-1px);
}

.asr-audio-card__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.asr-audio-card__meta > div:last-child {
  min-width: 0;
}

.asr-audio-card__play {
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  padding: 0;
  background: transparent;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.asr-audio-card.is-playing .asr-audio-card__play {
  transform: scale(1.04);
  box-shadow: 0 10px 20px rgba(0, 91, 196, 0.18);
}

.is-primary .asr-audio-card__play {
  background: #a5c1ff;
  color: #005bc4;
}

.is-secondary .asr-audio-card__play {
  background: #ffd8e7;
  color: #a53173;
}

.is-tertiary .asr-audio-card__play {
  background: #69f6b8;
  color: #006d4a;
}

.is-neutral .asr-audio-card__play {
  background: rgba(172, 179, 183, 0.2);
  color: #596063;
}

.asr-audio-card h3 {
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.asr-audio-card p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #596063;
  font-size: 11px;
  font-weight: 600;
}

.asr-audio-card p i {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #acb3b7;
}

.asr-audio-card__track {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  background: #eaeef1;
  overflow: hidden;
}

.asr-audio-card__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.is-primary .asr-audio-card__track span {
  background: #005bc4;
}

.is-secondary .asr-audio-card__track span {
  background: #a53173;
}

.is-tertiary .asr-audio-card__track span {
  background: #006d4a;
}

.is-neutral .asr-audio-card__track span {
  background: #757c7f;
}

.asr-speech-workspace {
  grid-area: workspace;
  display: flex;
  align-self: stretch;
  min-width: 0;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 16px;
}

.asr-speech-panel,
.asr-result-panel {
  border-radius: 24px;
  background: #ffffff;
  padding: 18px 20px;
  box-shadow: 0 24px 64px rgba(0, 91, 196, 0.04);
}

.asr-speech-panel {
  min-height: 372px;
}

.asr-speech-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 14px;
  border-bottom: 2px solid #eaeef1;
}

.asr-speech-tabs button {
  margin-bottom: -2px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  padding: 0 8px 10px;
  color: #757c7f;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.asr-speech-tabs button.is-active {
  border-bottom-color: #005bc4;
  color: #005bc4;
}

.asr-record-box {
  display: flex;
  min-height: 238px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #f1f4f6;
  padding: 18px 20px;
  box-sizing: border-box;
}

.asr-record-box__inner {
  display: flex;
  width: 100%;
  max-width: 760px;
  flex-direction: column;
  align-items: center;
}

.asr-model-status__action:disabled,
.asr-speech-actions__primary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.asr-record-box__status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.asr-record-box__mic {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #005bc4;
  color: #f9f8ff;
  box-shadow: 0 10px 22px rgba(0, 91, 196, 0.28);
}

.asr-record-box__status p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #005bc4;
  font-size: 12px;
  font-weight: 800;
}

.asr-record-box__status p i {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ac3434;
  animation: asr-pulse 1s ease-in-out infinite;
}

.asr-record-box__hint {
  margin: 0 0 12px;
  color: #596063;
  font-size: 12px;
  line-height: 1.7;
  text-align: center;
}

.asr-record-diagnostics {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.asr-record-diagnostics span {
  border-radius: 999px;
  background: rgba(172, 179, 183, 0.14);
  padding: 4px 10px;
  color: #757c7f;
  font-size: 11px;
  font-weight: 600;
}

.asr-record-diagnostics span.is-ok {
  background: rgba(0, 91, 196, 0.1);
  color: #005bc4;
}

.asr-microphone-select {
  display: flex;
  width: min(520px, 100%);
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.asr-microphone-select span {
  flex-shrink: 0;
  color: #596063;
  font-size: 12px;
  font-weight: 700;
}

.asr-microphone-select select {
  flex: 1;
  min-width: 0;
  border: 1px solid rgba(0, 91, 196, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  padding: 7px 12px;
  color: #2d3337;
  font-size: 12px;
  outline: none;
}

.asr-record-player {
  width: min(520px, 100%);
  height: 36px;
  margin-top: 4px;
}

.asr-record-player__hint {
  width: min(520px, 100%);
  margin: 6px 0 0;
  color: #757c7f;
  font-size: 12px;
  line-height: 1.7;
  text-align: left;
}

.asr-upload-box {
  display: flex;
  width: 100%;
  min-height: 120px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px dashed #9fc1f8;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.76);
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
  cursor: pointer;
}

.asr-upload-box input {
  display: none;
}

.asr-upload-box__icon {
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #a5c1ff;
  color: #005bc4;
}

.asr-upload-box strong {
  color: #2d3337;
  font-size: 14px;
  font-weight: 800;
}

.asr-upload-box p {
  margin: 0;
  color: #596063;
  font-size: 12px;
  line-height: 1.8;
}

.asr-record-box__bar {
  width: 100%;
  height: 8px;
  margin-top: 14px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: #dde3e7;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(45, 51, 55, 0.08);
}

.asr-record-box__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(to right, #005bc4, #a5c1ff);
  box-shadow: 0 0 12px rgba(0, 91, 196, 0.3);
}

.asr-record-box__time {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}

.asr-record-box__time strong {
  color: #005bc4;
  font-size: 12px;
  font-weight: 800;
}

.asr-record-box__time span {
  color: #757c7f;
  font-size: 12px;
  font-weight: 800;
}

.asr-speech-actions {
  display: flex;
  justify-content: center;
  margin-top: 14px;
}

.asr-speech-actions__primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 999px;
  background: #005bc4;
  padding: 10px 24px;
  color: #f9f8ff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(0, 91, 196, 0.2);
}

.asr-result-panel {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.asr-result-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.asr-result-panel__head h2 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: #2d3337;
  font-size: 16px;
  font-weight: 800;
}

.asr-result-panel__head h2 span {
  display: inline-block;
  width: 4px;
  height: 18px;
  border-radius: 999px;
  background: #005bc4;
}

.asr-result-panel__head button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 999px;
  background: #a5c1ff;
  padding: 8px 14px;
  color: #003a81;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.asr-result-panel__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
  border: 1px solid rgba(172, 179, 183, 0.18);
  border-radius: 12px;
  background: #f1f4f6;
  padding: 16px;
  color: #596063;
  box-shadow: inset 0 1px 3px rgba(45, 51, 55, 0.04);
}

.asr-result-panel__body p {
  margin: 0 0 10px;
  color: #596063;
  font-size: 13px;
  line-height: 1.8;
}

.asr-result-panel__body p.is-active {
  margin-left: -8px;
  margin-right: -8px;
  border-left: 3px solid #005bc4;
  border-radius: 10px;
  background: rgba(165, 193, 255, 0.2);
  padding: 8px 12px;
}

.asr-result-panel__body p.is-active strong {
  color: #2d3337;
  font-weight: 600;
}

.asr-result-panel__pending {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  color: #005bc4;
  font-size: 13px;
  font-weight: 600;
}

.asr-result-panel__empty {
  display: flex;
  min-height: 120px;
  align-items: center;
  justify-content: center;
  color: #757c7f;
  font-size: 13px;
  text-align: center;
  line-height: 1.8;
}

.asr-symbol {
  font-family: inherit;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
}

.asr-symbol.is-small {
  font-size: 14px;
}

@keyframes asr-pulse {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.86);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 1400px) {
  .asr-speech-shell {
    gap: 16px;
    padding: 14px 18px 18px;
  }

  .asr-speech-library {
    width: 280px;
    min-width: 280px;
  }
}

@media (max-width: 1100px) {
  .asr-speech-page {
    height: auto;
    overflow: visible;
  }

  .asr-speech-shell {
    grid-template-columns: 1fr;
    height: auto;
    grid-template-areas:
      "breadcrumb"
      "library"
      "workspace";
  }

  .asr-speech-library {
    width: 100%;
    min-width: 0;
  }

  .asr-speech-library__list {
    max-height: 360px;
  }
}

@media (max-width: 768px) {
  .asr-speech-shell {
    padding: 18px 16px 24px;
  }

  .asr-speech-panel,
  .asr-result-panel {
    padding: 20px;
    border-radius: 24px;
  }

  .asr-speech-tabs {
    gap: 16px;
    overflow-x: auto;
  }

  .asr-speech-tabs button {
    flex-shrink: 0;
    font-size: 16px;
  }

  .asr-speech-panel {
    min-height: 0;
  }

  .asr-upload-box {
    min-height: 180px;
  }

  .asr-result-panel__body {
    min-height: 280px;
    padding: 20px;
  }

  .asr-result-panel__body p {
    font-size: 15px;
  }

  .asr-result-panel__head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
