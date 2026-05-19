import * as tf from "@tensorflow/tfjs";

export type DoodleProbabilityItem = {
  key: string;
  confidence: number;
  confidenceText: string;
  primary?: boolean;
};

export type DoodleRecognitionResult = {
  key: string;
  confidence: number;
  confidenceText: string;
  probabilities: DoodleProbabilityItem[];
};

const MODEL_URL = "/models/doodlenet/model.json";
const CLASS_NAMES_URL = "/models/doodlenet/class_names.txt";
const INPUT_SIZE = 28;
const FOREGROUND_THRESHOLD = 24;

let cachedModel: tf.LayersModel | null = null;
let cachedClassNames: string[] | null = null;

const softmax = (values: number[]) => {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const sum = exps.reduce((total, value) => total + value, 0);
  return exps.map((value) => value / sum);
};

const getGrayscale = (pixels: Uint8ClampedArray, offset: number) =>
  (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;

const detectBackgroundGrayscale = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number
) => {
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

const detectBounds = (
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
  const bounds = detectBounds(
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

  normalizedContext.fillStyle = backgroundIsLight ? "#ffffff" : "#000000";
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

  return { input, bounds };
};

const loadClassNames = async () => {
  if (cachedClassNames) {
    return cachedClassNames;
  }

  const text = await fetch(CLASS_NAMES_URL).then((response) => {
    if (!response.ok) {
      throw new Error("无法加载类别文件");
    }
    return response.text();
  });

  cachedClassNames = text
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean);

  return cachedClassNames;
};

const ensureModel = async () => {
  if (cachedModel) {
    return cachedModel;
  }

  cachedModel = await tf.loadLayersModel(MODEL_URL);
  return cachedModel;
};

export const useDoodleRecognizer = () => {
  const recognizeCanvas = async (
    sourceCanvas: HTMLCanvasElement
  ): Promise<DoodleRecognitionResult> => {
    if (!import.meta.client) {
      throw new Error("仅支持浏览器环境");
    }

    const [model, classNames] = await Promise.all([ensureModel(), loadClassNames()]);
    const { input } = preprocessCanvas(sourceCanvas);

    const inputTensor = tf.tensor4d(input, [1, INPUT_SIZE, INPUT_SIZE, 1]);
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const logits = Array.from(await prediction.data());

    inputTensor.dispose();
    prediction.dispose();

    // If the model's last layer is softmax, the output already sums to ~1 — skip re-applying.
    const logitsSum = logits.reduce((total, value) => total + value, 0);
    const alreadyProbabilities =
      logits.every((value) => value >= 0 && value <= 1) &&
      Math.abs(logitsSum - 1) < 0.05;
    const probabilities = alreadyProbabilities ? logits : softmax(logits);
    const topEntries = probabilities
      .map((confidence, index) => ({
        key: classNames[index] || String(index),
        confidence,
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);

    const top = topEntries[0];

    return {
      key: top?.key || "unknown",
      confidence: top?.confidence || 0,
      confidenceText: `${(((top?.confidence || 0) * 100).toFixed(1))}%`,
      probabilities: topEntries.map((item) => ({
        key: item.key,
        confidence: item.confidence,
        confidenceText: `${(item.confidence * 100).toFixed(1)}%`,
        primary: item.key === top?.key,
      })),
    };
  };

  return {
    recognizeCanvas,
  };
};
