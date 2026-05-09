import {
  LOCAL_TTS_RUNTIME_CONFIG,
  LOCAL_TTS_VOICES,
  type LocalTtsVoice,
} from "~/config/tts";

type LocalTtsStatus = "idle" | "loading" | "ready" | "generating" | "error";

type LocalTtsGenerateOptions = {
  text: string;
  voiceId?: string;
  speaker?: number;
  rate?: number;
  volume?: number;
};

type LocalTtsGenerateResult = {
  blob: Blob;
  audioUrl: string;
  duration: number;
};

type PiperEngine = {
  generate(text: string, voice: string, speaker?: number): Promise<{
    file: Blob;
    duration: number;
  }>;
};

type PiperRuntimeModule = {
  PiperWebEngine: new (options?: Record<string, unknown>) => PiperEngine;
  OnnxWebRuntime: new (options?: Record<string, unknown>) => unknown;
  PhonemizeWebRuntime: new (options?: Record<string, unknown>) => {
    phonemize(text: string, voiceData: [Record<string, unknown>, string]): Promise<{
      phoneme_ids: number[];
      phonemes?: unknown[];
      [key: string]: unknown;
    }>;
    destroy(): void;
  };
  RemoteVoiceProvider: new (options?: Record<string, unknown>) => {
    fetch(voice: string): Promise<[Record<string, unknown>, string]>;
    list(): Promise<unknown>;
    destroy(): void;
  };
};

const localTtsStatus = ref<LocalTtsStatus>("idle");
const localTtsErrorMessage = ref("");
const loadedModelIds = ref<string[]>([]);

let piperEngine: PiperEngine | null = null;
let piperPreloadPromise: Promise<void> | null = null;
let currentRate = 1;
const loadedModelIdSet = new Set<string>();

const defaultVoice = LOCAL_TTS_VOICES[0] as LocalTtsVoice;
const defaultModelId = defaultVoice.modelId;

const getModelCacheKey = (voice: LocalTtsVoice) => `${voice.modelId || defaultModelId}:${voice.speaker}`;

const getUniqueVoices = (voices: LocalTtsVoice[]) => {
  const voiceMap = new Map<string, LocalTtsVoice>();
  voices.forEach((voice) => {
    voiceMap.set(getModelCacheKey(voice), voice);
  });
  return Array.from(voiceMap.values());
};

const allAvailableVoices = getUniqueVoices(LOCAL_TTS_VOICES.filter((voice) => voice.available));

const syncLoadedModelIds = () => {
  loadedModelIds.value = Array.from(loadedModelIdSet);
};

const areVoicesLoaded = (voices: LocalTtsVoice[]) =>
  getUniqueVoices(voices).every((voice) => loadedModelIds.value.includes(getModelCacheKey(voice)));

const cloneVoiceConfig = (voiceConfig: Record<string, unknown>) => {
  if (typeof structuredClone === "function") {
    return structuredClone(voiceConfig);
  }
  return JSON.parse(JSON.stringify(voiceConfig)) as Record<string, unknown>;
};

const resolveErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    if (error.message.includes("Could not fetch")) {
      return "本地语音模型加载失败，请检查网络后重试";
    }
    if (error.message.includes("OrtRun") || error.message.includes("Gather")) {
      return "本地语音模型暂不支持部分字符，请删减特殊符号后重试";
    }
  }
  if (typeof error === "number") {
    return `本地语音模型运行失败，错误码：${error}`;
  }
  if (typeof error === "string" && error) {
    return error;
  }
  return "本地语音模型加载失败，请稍后重试";
};

const getSafeRate = (rate?: number) => Math.max(0.5, Math.min(2, rate || 1));

const getSafeVolume = (volume?: number) => Math.max(0, Math.min(1, volume ?? 1));

const adjustVoiceRate = (voiceConfig: Record<string, unknown>, rate: number) => {
  const nextVoiceConfig = cloneVoiceConfig(voiceConfig);
  const inference = nextVoiceConfig.inference as Record<string, number> | undefined;
  const sourceInference = voiceConfig.inference as Record<string, number> | undefined;

  if (inference && sourceInference?.length_scale) {
    inference.length_scale = sourceInference.length_scale / rate;
  }

  return nextVoiceConfig;
};

const getVoicePhonemeIdLimit = (voiceConfig: Record<string, unknown>) => {
  const phonemeIdMap = voiceConfig.phoneme_id_map as Record<string, number[]> | undefined;
  const phonemeIds = Object.values(phonemeIdMap || {})
    .map((value) => value[0])
    .filter((value): value is number => Number.isFinite(value));

  return phonemeIds.length ? Math.max(...phonemeIds) : Number.POSITIVE_INFINITY;
};

const filterUnsupportedPhonemes = <
  T extends {
    phoneme_ids: number[];
    phonemes?: unknown[];
  },
>(
  phonemeData: T,
  voiceConfig: Record<string, unknown>
) => {
  const maxPhonemeId = getVoicePhonemeIdLimit(voiceConfig);
  if (!Number.isFinite(maxPhonemeId)) return phonemeData;

  const supportedIndexes: number[] = [];
  const phonemeIds = phonemeData.phoneme_ids.filter((phonemeId, index) => {
    const isSupported = phonemeId >= 0 && phonemeId <= maxPhonemeId;
    if (isSupported) {
      supportedIndexes.push(index);
    }
    return isSupported;
  });

  if (phonemeIds.length === phonemeData.phoneme_ids.length) return phonemeData;

  return {
    ...phonemeData,
    phoneme_ids: phonemeIds,
    phonemes: phonemeData.phonemes?.filter((_, index) => supportedIndexes.includes(index)),
  };
};

const scaleWavVolume = async (blob: Blob, volume: number) => {
  if (volume >= 0.99) return blob;

  const wavBuffer = await blob.arrayBuffer();
  if (wavBuffer.byteLength <= 44) return blob;

  const wavView = new DataView(wavBuffer);
  for (let offset = 44; offset + 1 < wavBuffer.byteLength; offset += 2) {
    const sample = wavView.getInt16(offset, true);
    const adjustedSample = Math.max(-32768, Math.min(32767, Math.round(sample * volume)));
    wavView.setInt16(offset, adjustedSample, true);
  }

  return new Blob([new Uint8Array(wavBuffer)], { type: "audio/x-wav" });
};

const createPiperEngine = async () => {
  if (piperEngine) return piperEngine;

  const { PiperWebEngine, OnnxWebRuntime, PhonemizeWebRuntime, RemoteVoiceProvider } =
    (await import(/* @vite-ignore */ LOCAL_TTS_RUNTIME_CONFIG.engineModuleUrl)) as PiperRuntimeModule;
  const remoteVoiceProvider = new RemoteVoiceProvider({
    baseUrl: LOCAL_TTS_RUNTIME_CONFIG.voiceBaseUrl,
    separator: "-",
  });
  const basePhonemizeRuntime = new PhonemizeWebRuntime({
    basePath: LOCAL_TTS_RUNTIME_CONFIG.piperBasePath,
  });
  const adjustableVoiceProvider = {
    fetch: async (voice: string) => {
      const [voiceConfig, modelUrl] = await remoteVoiceProvider.fetch(voice);
      return [adjustVoiceRate(voiceConfig, currentRate), modelUrl];
    },
    list: () => remoteVoiceProvider.list(),
    destroy: () => remoteVoiceProvider.destroy(),
  };
  const safePhonemizeRuntime = {
    phonemize: async (text: string, voiceData: [Record<string, unknown>, string]) =>
      filterUnsupportedPhonemes(await basePhonemizeRuntime.phonemize(text, voiceData), voiceData[0]),
    destroy: () => basePhonemizeRuntime.destroy(),
  };

  piperEngine = new PiperWebEngine({
    onnxRuntime: new OnnxWebRuntime({
      basePath: LOCAL_TTS_RUNTIME_CONFIG.onnxBasePath,
      numThreads: Math.max(1, Math.min(4, navigator.hardwareConcurrency || 2)),
    }),
    phonemizeRuntime: safePhonemizeRuntime,
    voiceProvider: adjustableVoiceProvider,
  });

  return piperEngine;
};

export const useLocalTts = () => {
  const isReady = computed(() => localTtsStatus.value === "ready");
  const isLoading = computed(() => localTtsStatus.value === "loading");
  const isGenerating = computed(() => localTtsStatus.value === "generating");
  const isAllReady = computed(() => areVoicesLoaded(allAvailableVoices));
  const loadedModelCount = computed(() => loadedModelIds.value.length);
  const totalModelCount = computed(() => allAvailableVoices.length);

  const preloadVoices = async (voices: LocalTtsVoice[]) => {
    const targetVoices = getUniqueVoices(voices.length ? voices : [defaultVoice]);
    if (areVoicesLoaded(targetVoices)) {
      localTtsStatus.value = "ready";
      return;
    }
    if (piperPreloadPromise) return piperPreloadPromise;

    localTtsStatus.value = "loading";
    localTtsErrorMessage.value = "";
    currentRate = 1;

    piperPreloadPromise = createPiperEngine()
      .then(async (engine) => {
        for (const voice of targetVoices) {
          const cacheKey = getModelCacheKey(voice);
          if (loadedModelIdSet.has(cacheKey)) continue;
          await engine.generate(LOCAL_TTS_RUNTIME_CONFIG.warmupText, voice.modelId || defaultModelId, voice.speaker);
          loadedModelIdSet.add(cacheKey);
          syncLoadedModelIds();
        }
      })
      .then(() => {
        localTtsStatus.value = "ready";
      })
      .catch((error: unknown) => {
        localTtsStatus.value = "error";
        localTtsErrorMessage.value = resolveErrorMessage(error);
        throw error;
      })
      .finally(() => {
        piperPreloadPromise = null;
      });

    return piperPreloadPromise;
  };

  const preload = async (voice: LocalTtsVoice = defaultVoice) => preloadVoices([voice]);

  const preloadAll = async () => preloadVoices(allAvailableVoices);

  const generateSpeech = async ({
    text,
    voiceId = defaultVoice.id,
    speaker = defaultVoice.speaker,
    rate = 1,
    volume = 1,
  }: LocalTtsGenerateOptions): Promise<LocalTtsGenerateResult> => {
    const voice = LOCAL_TTS_VOICES.find((voiceItem) => voiceItem.id === voiceId) || defaultVoice;
    const modelId = voice.modelId || defaultModelId;

    await preload(voice);

    localTtsStatus.value = "generating";
    localTtsErrorMessage.value = "";
    currentRate = getSafeRate(rate);

    try {
      const engine = await createPiperEngine();
      const result = await engine.generate(text, modelId, speaker);
      const blob = await scaleWavVolume(result.file, getSafeVolume(volume));

      localTtsStatus.value = "ready";
      return {
        blob,
        audioUrl: URL.createObjectURL(blob),
        duration: Math.max(1, Math.ceil(result.duration / 1000)),
      };
    } catch (error) {
      localTtsStatus.value = "error";
      localTtsErrorMessage.value = resolveErrorMessage(error);
      throw error;
    } finally {
      currentRate = 1;
    }
  };

  return {
    status: localTtsStatus,
    errorMessage: localTtsErrorMessage,
    isReady,
    isLoading,
    isGenerating,
    isAllReady,
    loadedModelCount,
    totalModelCount,
    preload,
    preloadAll,
    generateSpeech,
  };
};
