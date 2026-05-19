import { ref, onUnmounted } from "vue";

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureResult {
  name: string;
  nameZh: string;
  confidence: number;
  landmarks: HandLandmark[];
  fingerCount: number;
}

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

function distance(a: HandLandmark, b: HandLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function isFingerExtended(landmarks: HandLandmark[], fingerTips: number[], fingerPips: number[], index: number): boolean {
  const tipIdx = fingerTips[index]!;
  const pipIdx = fingerPips[index]!;
  const tip = landmarks[tipIdx]!;
  const pip = landmarks[pipIdx]!;
  if (index === 0) {
    const wrist = landmarks[0]!;
    const indexMcp = landmarks[5]!;
    const thumbTip = landmarks[4]!;
    const thumbIp = landmarks[3]!;
    const thumbMcp = landmarks[2]!;
    const tipToIndex = distance(thumbTip, indexMcp);
    const mcpToIndex = distance(thumbMcp, indexMcp);
    if (tipToIndex < mcpToIndex * 0.9) return false;
    const tipToWrist = distance(thumbTip, wrist);
    const ipToWrist = distance(thumbIp, wrist);
    return tipToWrist > ipToWrist * 1.1;
  }
  return tip.y < pip.y;
}

function recognizeGesture(landmarks: HandLandmark[]): GestureResult {
  const fingerTips = [4, 8, 12, 16, 20];
  const fingerPips = [3, 6, 10, 14, 18];

  const extended = fingerTips.map((_, i) => isFingerExtended(landmarks, fingerTips, fingerPips, i));
  const fingerCount = extended.filter(Boolean).length;

  let name = "Unknown";
  let nameZh = "未知";
  let confidence = 0.8;

  if (fingerCount === 0) {
    name = "Fist";
    nameZh = "握拳";
    confidence = 0.92;
  } else if (fingerCount === 5) {
    name = "Open Palm";
    nameZh = "张开手掌";
    confidence = 0.95;
  } else if (extended[1] && extended[2] && !extended[0] && !extended[3] && !extended[4]) {
    name = "Victory";
    nameZh = "比V / 剪刀";
    confidence = 0.93;
  } else if (extended[0] && !extended[1] && !extended[2] && !extended[3] && !extended[4]) {
    name = "Thumbs Up";
    nameZh = "竖大拇指";
    confidence = 0.91;
  } else if (extended[1] && !extended[0] && !extended[2] && !extended[3] && !extended[4]) {
    name = "Pointing";
    nameZh = "指向";
    confidence = 0.90;
  } else if (extended[0] && extended[1] && !extended[2] && !extended[3] && extended[4]) {
    name = "Rock";
    nameZh = "摇滚";
    confidence = 0.88;
  } else if (extended[0] && !extended[1] && !extended[2] && !extended[3] && extended[4]) {
    name = "Call Me";
    nameZh = "打电话";
    confidence = 0.87;
  } else if (!extended[0] && extended[1] && extended[2] && extended[3] && !extended[4]) {
    name = "Three";
    nameZh = "数字三";
    confidence = 0.89;
  } else if (!extended[0] && extended[1] && extended[2] && extended[3] && extended[4]) {
    name = "Four";
    nameZh = "数字四";
    confidence = 0.89;
  } else {
    name = `${fingerCount} Fingers`;
    nameZh = `${fingerCount} 根手指`;
    confidence = 0.75;
  }

  return { name, nameZh, confidence, landmarks, fingerCount };
}

function drawHand(ctx: CanvasRenderingContext2D, landmarks: HandLandmark[], width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  for (const conn of HAND_CONNECTIONS) {
    const p1 = landmarks[conn[0]!]!;
    const p2 = landmarks[conn[1]!]!;
    ctx.beginPath();
    ctx.moveTo(p1.x * width, p1.y * height);
    ctx.lineTo(p2.x * width, p2.y * height);
    ctx.strokeStyle = "rgba(79, 117, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  for (const point of landmarks) {
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#4f75ff";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

export function useHandGesture() {
  const isModelLoaded = ref(false);
  const isDetecting = ref(false);
  const currentGesture = ref<GestureResult | null>(null);
  const error = ref<string | null>(null);

  let hands: any = null;
  let animationId: number | null = null;
  let videoEl: HTMLVideoElement | null = null;
  let canvasEl: HTMLCanvasElement | null = null;
  let isProcessingFrame = false;

  async function loadModel() {
    try {
      const { Hands } = await import("@mediapipe/hands");
      hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });
      hands.onResults(onResults);
      isModelLoaded.value = true;
    } catch (e: any) {
      error.value = e.message || "模型加载失败";
    }
  }

  function onResults(results: any) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const width = canvasEl.width;
    const height = canvasEl.height;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks: HandLandmark[] = results.multiHandLandmarks[0];
      drawHand(ctx, landmarks, width, height);
      currentGesture.value = recognizeGesture(landmarks);
    } else {
      ctx.clearRect(0, 0, width, height);
      currentGesture.value = null;
    }
  }

  async function detect() {
    if (!hands || !videoEl || !isDetecting.value) return;
    if (videoEl.readyState >= 2 && !isProcessingFrame) {
      isProcessingFrame = true;
      try {
        await hands.send({ image: videoEl });
      } finally {
        isProcessingFrame = false;
      }
    }
    animationId = requestAnimationFrame(detect);
  }

  function startDetection(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    stopDetection();
    videoEl = video;
    canvasEl = canvas;
    isDetecting.value = true;
    detect();
  }

  function stopDetection() {
    isDetecting.value = false;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    isProcessingFrame = false;
    videoEl = null;
    canvasEl = null;
    currentGesture.value = null;
  }

  onUnmounted(() => {
    stopDetection();
    if (hands) {
      hands.close();
      hands = null;
    }
  });

  return {
    isModelLoaded,
    isDetecting,
    currentGesture,
    error,
    loadModel,
    startDetection,
    stopDetection,
  };
}
