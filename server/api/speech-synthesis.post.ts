import { EdgeTTS } from "edge-tts-universal";

type SpeechBody = {
  text?: string;
  voice?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<SpeechBody>(event);
  const text = String(body.text || "").trim();

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: "请先输入要合成的文本",
    });
  }

  if (text.length > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: "合成文本不能超过 1000 字",
    });
  }

  try {
    const result = await new EdgeTTS(text, body.voice || "zh-CN-XiaoxiaoNeural", {
      rate: body.rate || "+0%",
      pitch: body.pitch || "+0Hz",
      volume: body.volume || "+0%",
    }).synthesize();
    const audioBuffer = Buffer.from(await result.audio.arrayBuffer());

    setHeader(event, "Content-Type", "audio/mpeg");
    setHeader(event, "Content-Disposition", "attachment; filename=\"speech-synthesis.mp3\"");
    setHeader(event, "Cache-Control", "no-store");

    return new Uint8Array(audioBuffer);
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "语音合成失败，请稍后重试",
    });
  }
});
