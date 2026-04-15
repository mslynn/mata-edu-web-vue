import type { FaceDemoProfile } from "./useFaceDemoStorage";

export interface FaceDemoBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDemoMatchResult {
  profile: FaceDemoProfile | null;
  distance: number;
  confidence: number;
}

export interface FaceDemoDetection {
  box: FaceDemoBox;
  descriptor: number[];
  score: number;
}

type FaceDetectScene = "capture" | "recognize";

interface FaceApiTensorEnv {
  flagRegistry?: Record<string, unknown>;
  set: (name: string, value: unknown) => void;
}

interface FaceApiTensor {
  setBackend: (backend: string) => Promise<boolean | void>;
  ready: () => Promise<void>;
  getBackend?: () => string;
  enableProdMode?: () => void;
  env?: () => FaceApiTensorEnv;
}

interface FaceApiGlobal {
  tf?: FaceApiTensor;
  nets: {
    tinyFaceDetector: {
      loadFromUri: (uri: string) => Promise<void>;
    };
    faceLandmark68TinyNet: {
      loadFromUri: (uri: string) => Promise<void>;
    };
    faceRecognitionNet: {
      loadFromUri: (uri: string) => Promise<void>;
    };
  };
  TinyFaceDetectorOptions: new (options?: {
    inputSize?: number;
    scoreThreshold?: number;
  }) => unknown;
  detectSingleFace: (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options?: unknown,
  ) => {
    withFaceLandmarks: (useTinyLandmarkNet?: boolean) => {
      withFaceDescriptor: () => Promise<any>;
    };
  };
  detectAllFaces: (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options?: unknown,
  ) => {
    withFaceLandmarks: (useTinyLandmarkNet?: boolean) => {
      withFaceDescriptors: () => Promise<any[]>;
    };
  };
}

declare global {
  interface Window {
    faceapi?: FaceApiGlobal;
  }
}

const FACE_API_SCRIPT_ID = "face-demo-face-api-runtime-script";
const FACE_API_SCRIPT_SRC = "/face-demo/face-api.js";
const FACE_API_MODEL_URI = "/face-demo/model";

export const FACE_DEMO_DESCRIPTOR_VERSION = "face-api-local-recognition-v1";
export const DEFAULT_FACE_MATCH_THRESHOLD = 0.4;
export const DEFAULT_FACE_MATCH_CONFIDENCE = 0.6;

let faceApiPromise: Promise<FaceApiGlobal> | null = null;
let faceApiModelPromise: Promise<FaceApiGlobal> | null = null;

const normalizeDetection = (result: any): FaceDemoDetection => {
  const box = result?.detection?.box || {};
  const descriptor = Array.from(result?.descriptor || []) as number[];

  return {
    box: {
      x: Number(box.x || 0),
      y: Number(box.y || 0),
      width: Number(box.width || 0),
      height: Number(box.height || 0),
    },
    descriptor,
    score: Number(result?.detection?.score || 0),
  };
};

const ensureFaceApiLoaded = async () => {
  if (!import.meta.client) {
    throw new Error("人脸识别仅支持在浏览器环境运行");
  }

  const currentRuntimeScript = document.getElementById(FACE_API_SCRIPT_ID);

  if (window.faceapi && currentRuntimeScript) {
    return window.faceapi;
  }

  if (!faceApiPromise) {
    faceApiPromise = new Promise<FaceApiGlobal>((resolve, reject) => {
      const existing = document.getElementById(FACE_API_SCRIPT_ID) as HTMLScriptElement | null;

      if (existing) {
        if (window.faceapi) {
          resolve(window.faceapi);
          return;
        }

        existing.addEventListener(
          "load",
          () => {
            if (window.faceapi) {
              resolve(window.faceapi);
              return;
            }

            reject(new Error("face-api 脚本加载完成，但全局对象不可用"));
          },
          { once: true },
        );

        existing.addEventListener(
          "error",
          () => {
            reject(new Error("face-api 脚本加载失败"));
          },
          { once: true },
        );

        return;
      }

      const script = document.createElement("script");
      script.id = FACE_API_SCRIPT_ID;
      script.src = FACE_API_SCRIPT_SRC;
      script.async = true;

      script.onload = () => {
        if (window.faceapi) {
          resolve(window.faceapi);
          return;
        }

        reject(new Error("face-api 脚本已加载，但全局对象缺失"));
      };

      script.onerror = () => {
        reject(new Error("face-api 脚本加载失败"));
      };

      document.head.appendChild(script);
    }).catch((error) => {
      faceApiPromise = null;
      throw error;
    });
  }

  return faceApiPromise;
};

const prepareFaceApiRuntime = async (faceapi: FaceApiGlobal) => {
  if (!faceapi.tf) {
    return;
  }

  const preferredBackends = ["webgl", "cpu"];
  let backendReady = false;

  for (const backend of preferredBackends) {
    try {
      const switched = await faceapi.tf.setBackend(backend);
      await faceapi.tf.ready();

      if (switched !== false) {
        backendReady = true;
        break;
      }
    } catch (error) {
      console.warn(`初始化 face-api ${backend} 后端失败`, error);
    }
  }

  if (!backendReady) {
    throw new Error("初始化本地人脸识别引擎失败");
  }

  const env = faceapi.tf.env?.();

  if (env?.flagRegistry?.CANVAS2D_WILL_READ_FREQUENTLY) {
    env.set("CANVAS2D_WILL_READ_FREQUENTLY", true);
  }

  if (env?.flagRegistry?.WEBGL_EXP_CONV) {
    env.set("WEBGL_EXP_CONV", true);
  }

  faceapi.tf.enableProdMode?.();
  await faceapi.tf.ready();
};

const ensureFaceApiModelsLoaded = async () => {
  if (!faceApiModelPromise) {
    faceApiModelPromise = (async () => {
      const faceapi = await ensureFaceApiLoaded();

      await prepareFaceApiRuntime(faceapi);
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODEL_URI),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(FACE_API_MODEL_URI),
        faceapi.nets.faceRecognitionNet.loadFromUri(FACE_API_MODEL_URI),
      ]);

      return faceapi;
    })().catch((error) => {
      faceApiModelPromise = null;
      throw error;
    });
  }

  return faceApiModelPromise;
};

const createDetectorOptionsList = async (scene: FaceDetectScene = "recognize") => {
  const faceapi = await ensureFaceApiModelsLoaded();
  const optionConfigs =
    scene === "capture"
      ? [
          { inputSize: 416, scoreThreshold: 0.18 },
          { inputSize: 320, scoreThreshold: 0.2 },
          { inputSize: 512, scoreThreshold: 0.14 },
        ]
      : [
          { inputSize: 512, scoreThreshold: 0.25 },
          { inputSize: 416, scoreThreshold: 0.3 },
          { inputSize: 320, scoreThreshold: 0.35 },
        ];

  return optionConfigs.map((options) => new faceapi.TinyFaceDetectorOptions(options));
};

const createFastSingleDetectorOptionsList = async () => {
  const faceapi = await ensureFaceApiModelsLoaded();
  const optionConfigs = [
    { inputSize: 256, scoreThreshold: 0.18 },
    { inputSize: 320, scoreThreshold: 0.16 },
  ];

  return optionConfigs.map((options) => new faceapi.TinyFaceDetectorOptions(options));
};

const computeDistance = (source: number[], target: number[]) => {
  if (!source.length || source.length !== target.length) {
    return Number.POSITIVE_INFINITY;
  }

  let total = 0;

  for (let index = 0; index < source.length; index += 1) {
    total += ((source[index] ?? 0) - (target[index] ?? 0)) ** 2;
  }

  return Math.sqrt(total);
};

const computeConfidence = (distance: number) => {
  if (!Number.isFinite(distance)) {
    return 0;
  }

  return Math.max(0, Math.min(0.99, 1 - distance));
};

const isProfileCompatible = (profile: FaceDemoProfile, descriptorLength: number) => {
  return (
    profile.descriptorVersion === FACE_DEMO_DESCRIPTOR_VERSION &&
    Array.isArray(profile.descriptor) &&
    profile.descriptor.length === descriptorLength
  );
};

export const useFaceApiDemo = () => {
  const ensureReady = async () => {
    return ensureFaceApiModelsLoaded();
  };

  const detectSingleFace = async (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    scene: FaceDetectScene = "recognize",
  ) => {
    const faceapi = await ensureFaceApiModelsLoaded();
    const detectorOptionsList = await createDetectorOptionsList(scene);

    for (const options of detectorOptionsList) {
      const result = await faceapi
        .detectSingleFace(input, options)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (result) {
        return normalizeDetection(result);
      }
    }

    return null;
  };

  const detectSingleFaceFast = async (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  ) => {
    const faceapi = await ensureFaceApiModelsLoaded();
    const detectorOptionsList = await createFastSingleDetectorOptionsList();

    for (const options of detectorOptionsList) {
      const result = await faceapi
        .detectSingleFace(input, options)
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (result) {
        return normalizeDetection(result);
      }
    }

    return null;
  };

  const detectAllFaces = async (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    scene: FaceDetectScene = "recognize",
  ) => {
    const faceapi = await ensureFaceApiModelsLoaded();
    const detectorOptionsList = await createDetectorOptionsList(scene);

    for (const options of detectorOptionsList) {
      const result = await faceapi
        .detectAllFaces(input, options)
        .withFaceLandmarks(true)
        .withFaceDescriptors();

      if (result.length) {
        return result.map(normalizeDetection);
      }
    }

    return [];
  };

  const matchDescriptor = (
    descriptor: number[],
    profiles: FaceDemoProfile[],
    threshold = DEFAULT_FACE_MATCH_THRESHOLD,
  ): FaceDemoMatchResult => {
    let bestProfile: FaceDemoProfile | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const profile of profiles) {
      if (!isProfileCompatible(profile, descriptor.length)) {
        continue;
      }

      const distance = computeDistance(descriptor, profile.descriptor);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestProfile = profile;
      }
    }

    const confidence = computeConfidence(bestDistance);

    if (
      !bestProfile ||
      !Number.isFinite(bestDistance) ||
      bestDistance > threshold ||
      confidence < DEFAULT_FACE_MATCH_CONFIDENCE
    ) {
      return {
        profile: null,
        distance: bestDistance,
        confidence: 0,
      };
    }

    return {
      profile: bestProfile,
      distance: bestDistance,
      confidence,
    };
  };

  return {
    ensureReady,
    detectSingleFace,
    detectSingleFaceFast,
    detectAllFaces,
    matchDescriptor,
  };
};
