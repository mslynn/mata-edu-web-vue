import * as ort from "onnxruntime-web";

export type MnistPrediction = {
  digit: number;
  confidence: number;
  probabilities: number[];
};

const MODEL_PATH = "/models/mnist.onnx?v=20260512-1";
const INPUT_SIZE = 28;
const INPUT_NAME_CANDIDATES = ["Input3", "input", "Input", "data", "x"];
const FOREGROUND_THRESHOLD = 24;

let cachedSession: ort.InferenceSession | null = null;
let wasmEnvConfigured = false;

const softmax = (values: number[]) => {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const sum = exps.reduce((total, value) => total + value, 0);
  return exps.map((value) => value / sum);
};

const getGrayscale = (pixels: Uint8ClampedArray, offset: number) =>
  (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;

const detectBackgroundGrayscale = (pixels: Uint8ClampedArray, width: number, height: number) => {
  const sampleSize = Math.max(4, Math.min(12, Math.floor(Math.min(width, height) * 0.08)));
  const samplePoints = [
    { startX: 0, startY: 0 },
    { startX: width - sampleSize, startY: 0 },
    { startX: 0, startY: height - sampleSize },
    { startX: width - sampleSize, startY: height - sampleSize },
  ];

  let total = 0;
  let count = 0;

  samplePoints.forEach(({ startX, startY }) => {
    const safeStartX = Math.max(0, startX);
    const safeStartY = Math.max(0, startY);
    for (let y = safeStartY; y < Math.min(height, safeStartY + sampleSize); y += 1) {
      for (let x = safeStartX; x < Math.min(width, safeStartX + sampleSize); x += 1) {
        total += getGrayscale(pixels, (y * width + x) * 4);
        count += 1;
      }
    }
  });

  return count ? total / count : 0;
};

const getForegroundIntensity = (
  pixels: Uint8ClampedArray,
  offset: number,
  backgroundGrayscale: number,
  backgroundIsLight: boolean
) => {
  const grayscale = getGrayscale(pixels, offset);
  const diff = backgroundIsLight
    ? backgroundGrayscale - grayscale
    : grayscale - backgroundGrayscale;
  return Math.max(0, Math.min(255, diff));
};

const centerImage = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  backgroundGrayscale: number,
  backgroundIsLight: boolean
) => {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const intensity = getForegroundIntensity(
        pixels,
        offset,
        backgroundGrayscale,
        backgroundIsLight
      );
      if (intensity > FOREGROUND_THRESHOLD) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 };
  }

  return { minX, minY, maxX, maxY };
};

const preprocessCanvas = (sourceCanvas: HTMLCanvasElement) => {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) {
    throw new Error("无法读取画布内容");
  }

  const imageData = sourceContext.getImageData(0, 0, width, height);
  const backgroundGrayscale = detectBackgroundGrayscale(imageData.data, width, height);
  const backgroundIsLight = backgroundGrayscale >= 127;
  const bounds = centerImage(
    imageData.data,
    width,
    height,
    backgroundGrayscale,
    backgroundIsLight
  );

  const boxWidth = Math.max(1, bounds.maxX - bounds.minX + 1);
  const boxHeight = Math.max(1, bounds.maxY - bounds.minY + 1);
  const scale = Math.min(20 / boxWidth, 20 / boxHeight);
  const scaledWidth = Math.max(1, Math.round(boxWidth * scale));
  const scaledHeight = Math.max(1, Math.round(boxHeight * scale));
  const offsetX = Math.floor((INPUT_SIZE - scaledWidth) / 2);
  const offsetY = Math.floor((INPUT_SIZE - scaledHeight) / 2);

  const normalizedCanvas = document.createElement("canvas");
  normalizedCanvas.width = INPUT_SIZE;
  normalizedCanvas.height = INPUT_SIZE;
  const normalizedContext = normalizedCanvas.getContext("2d", { willReadFrequently: true });
  if (!normalizedContext) {
    throw new Error("无法初始化归一化画布");
  }

  normalizedContext.fillStyle = "#000";
  normalizedContext.fillRect(0, 0, INPUT_SIZE, INPUT_SIZE);
  normalizedContext.imageSmoothingEnabled = true;
  normalizedContext.drawImage(
    sourceCanvas,
    bounds.minX,
    bounds.minY,
    boxWidth,
    boxHeight,
    offsetX,
    offsetY,
    scaledWidth,
    scaledHeight
  );

  const normalizedImage = normalizedContext.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
  const input = new Float32Array(INPUT_SIZE * INPUT_SIZE);

  for (let index = 0; index < INPUT_SIZE * INPUT_SIZE; index += 1) {
    const offset = index * 4;
    const intensity = getForegroundIntensity(
      normalizedImage.data,
      offset,
      backgroundGrayscale,
      backgroundIsLight
    );
    input[index] = intensity / 255;
  }

  return { input, normalizedCanvas };
};

const resolveInputName = (session: ort.InferenceSession) => {
  const names = session.inputNames || [];
  return INPUT_NAME_CANDIDATES.find((name) => names.includes(name)) || names[0];
};

const resolveOutputName = (session: ort.InferenceSession) => {
  return session.outputNames?.[0];
};

export const useMnistRecognizer = () => {
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

  const predictFromCanvas = async (canvas: HTMLCanvasElement): Promise<MnistPrediction> => {
    const session = await ensureSession();
    const inputName = resolveInputName(session);
    const outputName = resolveOutputName(session);

    if (!inputName || !outputName) {
      throw new Error("模型输入输出信息不完整");
    }

    const { input } = preprocessCanvas(canvas);
    const tensor = new ort.Tensor("float32", input, [1, 1, INPUT_SIZE, INPUT_SIZE]);
    const output = await session.run({ [inputName]: tensor });
    const result = output[outputName];
    const logits = Array.from(result.data as Float32Array);
    const probabilities = softmax(logits);

    let digit = 0;
    let confidence = 0;
    probabilities.forEach((value, index) => {
      if (value > confidence) {
        confidence = value;
        digit = index;
      }
    });

    return {
      digit,
      confidence,
      probabilities,
    };
  };

  const fileToImage = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = url;
      });
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const predictFromFile = async (file: File) => {
    const image = await fileToImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("无法初始化图片画布");
    }
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return predictFromCanvas(canvas);
  };

  return {
    modelPath: MODEL_PATH,
    predictFromCanvas,
    predictFromFile,
  };
};
