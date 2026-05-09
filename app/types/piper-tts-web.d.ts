declare module "piper-tts-web" {
  export type PiperGenerateResult = {
    file: Blob;
    duration: number;
    phonemeData: unknown;
  };

  export class PiperWebEngine {
    constructor(options?: Record<string, unknown>);
    generate(text: string, voice: string, speaker?: number): Promise<PiperGenerateResult>;
    destroy(): void;
  }

  export class OnnxWebRuntime {
    constructor(options?: Record<string, unknown>);
    destroy(): void;
  }

  export class PhonemizeWebRuntime {
    constructor(options?: Record<string, unknown>);
    destroy(): void;
  }

  export class RemoteVoiceProvider {
    constructor(options?: Record<string, unknown>);
    fetch(voice: string): Promise<[Record<string, unknown>, string]>;
    list(): Promise<unknown>;
    destroy(): void;
  }
}
