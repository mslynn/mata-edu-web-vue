import { ref, onUnmounted } from "vue";

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseResult {
  name: string;
  nameZh: string;
  confidence: number;
  landmarks: PoseLandmark[];
}

const POSE_CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
  [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
  [15, 17], [15, 19], [15, 21], [17, 19],
  [16, 18], [16, 20], [16, 22], [18, 20],
  [9, 10],
];

const KEY_POINTS = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
};

function isVisible(p: PoseLandmark | undefined): boolean {
  return !!p && (p.visibility === undefined || p.visibility > 0.5);
}

function angle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const dot = v1x * v2x + v1y * v2y;
  const m1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const m2 = Math.sqrt(v2x * v2x + v2y * v2y);
  if (m1 === 0 || m2 === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (m1 * m2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function recognizePose(landmarks: PoseLandmark[]): PoseResult {
  const lShoulder = landmarks[KEY_POINTS.leftShoulder];
  const rShoulder = landmarks[KEY_POINTS.rightShoulder];
  const lElbow = landmarks[KEY_POINTS.leftElbow];
  const rElbow = landmarks[KEY_POINTS.rightElbow];
  const lWrist = landmarks[KEY_POINTS.leftWrist];
  const rWrist = landmarks[KEY_POINTS.rightWrist];
  const lHip = landmarks[KEY_POINTS.leftHip];
  const rHip = landmarks[KEY_POINTS.rightHip];
  const lKnee = landmarks[KEY_POINTS.leftKnee];
  const rKnee = landmarks[KEY_POINTS.rightKnee];
  const lAnkle = landmarks[KEY_POINTS.leftAnkle];
  const rAnkle = landmarks[KEY_POINTS.rightAnkle];

  if (!isVisible(lShoulder) || !isVisible(rShoulder)) {
    return {
      name: "Unknown",
      nameZh: "未识别",
      confidence: 0.5,
      landmarks,
    };
  }

  const leftHandUp =
    isVisible(lWrist) && isVisible(lShoulder) && lWrist!.y < lShoulder!.y;
  const rightHandUp =
    isVisible(rWrist) && isVisible(rShoulder) && rWrist!.y < rShoulder!.y;

  if (leftHandUp && rightHandUp) {
    return {
      name: "Hands Up",
      nameZh: "双手举起",
      confidence: 0.94,
      landmarks,
    };
  }

  if (
    isVisible(lWrist) && isVisible(rWrist) &&
    isVisible(lShoulder) && isVisible(rShoulder)
  ) {
    const shoulderY = (lShoulder!.y + rShoulder!.y) / 2;
    const leftArmHorizontal =
      Math.abs(lWrist!.y - shoulderY) < 0.08 &&
      lWrist!.x < lShoulder!.x;
    const rightArmHorizontal =
      Math.abs(rWrist!.y - shoulderY) < 0.08 &&
      rWrist!.x > rShoulder!.x;
    if (leftArmHorizontal && rightArmHorizontal) {
      return {
        name: "T-Pose",
        nameZh: "T 字姿势",
        confidence: 0.92,
        landmarks,
      };
    }
  }

  if (leftHandUp && !rightHandUp) {
    return {
      name: "Left Hand Up",
      nameZh: "举起左手",
      confidence: 0.9,
      landmarks,
    };
  }
  if (rightHandUp && !leftHandUp) {
    return {
      name: "Right Hand Up",
      nameZh: "举起右手",
      confidence: 0.9,
      landmarks,
    };
  }

  if (
    isVisible(lWrist) && isVisible(rWrist) &&
    isVisible(lHip) && isVisible(rHip)
  ) {
    const leftHandOnHip =
      Math.abs(lWrist!.x - lHip!.x) < 0.1 &&
      Math.abs(lWrist!.y - lHip!.y) < 0.1;
    const rightHandOnHip =
      Math.abs(rWrist!.x - rHip!.x) < 0.1 &&
      Math.abs(rWrist!.y - rHip!.y) < 0.1;
    if (leftHandOnHip && rightHandOnHip) {
      return {
        name: "Akimbo",
        nameZh: "叉腰",
        confidence: 0.86,
        landmarks,
      };
    }
  }

  if (
    isVisible(lWrist) && isVisible(rWrist) &&
    isVisible(lShoulder) && isVisible(rShoulder)
  ) {
    const armsCrossed =
      lWrist!.x > rShoulder!.x &&
      rWrist!.x < lShoulder!.x &&
      lWrist!.y > lShoulder!.y &&
      rWrist!.y > rShoulder!.y;
    if (armsCrossed) {
      return {
        name: "Arms Crossed",
        nameZh: "双手抱胸",
        confidence: 0.85,
        landmarks,
      };
    }
  }

  if (
    isVisible(lHip) && isVisible(lKnee) && isVisible(lAnkle) &&
    isVisible(rHip) && isVisible(rKnee) && isVisible(rAnkle)
  ) {
    const leftKneeAngle = angle(lHip!, lKnee!, lAnkle!);
    const rightKneeAngle = angle(rHip!, rKnee!, rAnkle!);
    if (leftKneeAngle < 130 && rightKneeAngle < 130) {
      return {
        name: "Squat",
        nameZh: "深蹲",
        confidence: 0.88,
        landmarks,
      };
    }
  }

  if (
    isVisible(lHip) && isVisible(rHip) &&
    isVisible(lAnkle) && isVisible(rAnkle)
  ) {
    const hipY = (lHip!.y + rHip!.y) / 2;
    const ankleY = (lAnkle!.y + rAnkle!.y) / 2;
    if (ankleY - hipY > 0.3) {
      return {
        name: "Standing",
        nameZh: "站立",
        confidence: 0.82,
        landmarks,
      };
    }
  }

  return {
    name: "Detected",
    nameZh: "检测到人体",
    confidence: 0.7,
    landmarks,
  };
}

function drawPose(
  ctx: CanvasRenderingContext2D,
  landmarks: PoseLandmark[],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);

  for (const conn of POSE_CONNECTIONS) {
    const p1 = landmarks[conn[0]!];
    const p2 = landmarks[conn[1]!];
    if (!isVisible(p1) || !isVisible(p2)) continue;
    ctx.beginPath();
    ctx.moveTo(p1!.x * width, p1!.y * height);
    ctx.lineTo(p2!.x * width, p2!.y * height);
    ctx.strokeStyle = "rgba(245, 105, 101, 0.85)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  for (const point of landmarks) {
    if (!isVisible(point)) continue;
    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#f56965";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

export function usePoseDetection() {
  const isModelLoaded = ref(false);
  const isDetecting = ref(false);
  const currentPose = ref<PoseResult | null>(null);
  const error = ref<string | null>(null);

  let pose: any = null;
  let animationId: number | null = null;
  let videoEl: HTMLVideoElement | null = null;
  let canvasEl: HTMLCanvasElement | null = null;
  let isProcessingFrame = false;

  async function loadModel() {
    try {
      const { Pose } = await import("@mediapipe/pose");
      pose = new Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });
      pose.onResults(onResults);
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

    if (results.poseLandmarks && results.poseLandmarks.length > 0) {
      const landmarks: PoseLandmark[] = results.poseLandmarks;
      drawPose(ctx, landmarks, width, height);
      currentPose.value = recognizePose(landmarks);
    } else {
      ctx.clearRect(0, 0, width, height);
      currentPose.value = null;
    }
  }

  async function detect() {
    if (!pose || !videoEl || !isDetecting.value) return;
    if (videoEl.readyState >= 2 && !isProcessingFrame) {
      isProcessingFrame = true;
      try {
        await pose.send({ image: videoEl });
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
    currentPose.value = null;
  }

  onUnmounted(() => {
    stopDetection();
    if (pose) {
      pose.close();
      pose = null;
    }
  });

  return {
    isModelLoaded,
    isDetecting,
    currentPose,
    error,
    loadModel,
    startDetection,
    stopDetection,
  };
}
