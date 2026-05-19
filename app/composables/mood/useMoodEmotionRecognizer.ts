import * as ort from "onnxruntime-web";

export type MoodEmotionKey =
  | "neutral"
  | "happy"
  | "surprise"
  | "sad"
  | "anger"
  | "disgust"
  | "fear"
  | "contempt";

export interface MoodEmotionPrediction {
  topLabel: MoodEmotionKey;
  probabilities: Record<MoodEmotionKey, number>;
}

const MODEL_PATH = "/models/emotion-ferplus/emotion-ferplus-8.onnx";
const MODEL_INPUT_SIZE = 64;
const MODEL_INPUT_NAMES = ["Input3", "input", "Input", "data", "x"];

const EMOTION_LABELS: MoodEmotionKey[] = [
  "neutral",
  "happy",
  "surprise",
  "sad",
  "anger",
  "disgust",
  "fear",
  "contempt",
];

let cachedSession: ort.InferenceSession | null = null;
let wasmEnvConfigured = false;

const softmax = (values: number[]) => {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const sum = exps.reduce((total, value) => total + value, 0) || 1;
  return exps.map((value) => value / sum);
};

const resolveInputName = (session: ort.InferenceSession) => {
  const names = session.inputNames || [];
  return MODEL_INPUT_NAMES.find((name) => names.includes(name)) || names[0];
};

const resolveOutputName = (session: ort.InferenceSession) => {
  return session.outputNames?.[0];
};

const toGrayscale = (data: Uint8ClampedArray, offset: number) =>
  0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];

const preprocessFaceCanvas = (sourceCanvas: HTMLCanvasElement) => {
  const normalizedCanvas = document.createElement("canvas");
  normalizedCanvas.width = MODEL_INPUT_SIZE;
  normalizedCanvas.height = MODEL_INPUT_SIZE;
  const normalizedContext = normalizedCanvas.getContext("2d", { willReadFrequently: true });

  if (!normalizedContext) {
    throw new Error("无法初始化情绪识别画布");
  }

  normalizedContext.fillStyle = "#000";
  normalizedContext.fillRect(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  normalizedContext.drawImage(sourceCanvas, 0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

  const imageData = normalizedContext.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
  const input = new Float32Array(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);

  for (let index = 0; index < MODEL_INPUT_SIZE * MODEL_INPUT_SIZE; index += 1) {
    const offset = index * 4;
    const gray = toGrayscale(imageData.data, offset);
    input[index] = (gray - 127.5) / 128;
  }

  return input;
};

export const useMoodEmotionRecognizer = () => {
  const ensureWasmEnv = () => {
    if (wasmEnvConfigured || typeof window === "undefined") {
      return;
    }

    ort.env.wasm.wasmPaths = {
      mjs: `${window.location.origin}/ort/ort-wasm-simd-threaded.mjs`,
      wasm: `${window.location.origin}/ort/ort-wasm-simd-threaded.wasm`,
    };
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.proxy = false;
    wasmEnvConfigured = true;
  };

  const ensureSession = async () => {
    if (cachedSession) {
      return cachedSession;
    }

    ensureWasmEnv();
    cachedSession = await ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    });
    return cachedSession;
  };

  const predictFromFaceCanvas = async (faceCanvas: HTMLCanvasElement): Promise<MoodEmotionPrediction> => {
    const session = await ensureSession();
    const inputName = resolveInputName(session);
    const outputName = resolveOutputName(session);

    if (!inputName || !outputName) {
      throw new Error("情绪识别模型输入输出信息不完整");
    }

    const input = preprocessFaceCanvas(faceCanvas);
    const tensor = new ort.Tensor("float32", input, [1, 1, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);
    const output = await session.run({ [inputName]: tensor });
    const result = output[outputName];
    const logits = Array.from(result.data as Float32Array);
    const probabilities = softmax(logits);

    const mapped = EMOTION_LABELS.reduce((acc, label, index) => {
      acc[label] = Number(((probabilities[index] || 0) * 100).toFixed(1));
      return acc;
    }, {} as Record<MoodEmotionKey, number>);

    const topLabel =
      EMOTION_LABELS.reduce(
        (best, current) => (mapped[current] > mapped[best] ? current : best),
        EMOTION_LABELS[0],
      ) || "neutral";

    return {
      topLabel,
      probabilities: mapped,
    };
  };

  return {
    modelPath: MODEL_PATH,
    predictFromFaceCanvas,
  };
};
