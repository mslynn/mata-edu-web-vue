import { listVoices } from "edge-tts-universal";

export default defineEventHandler(async () => {
  try {
    const voices = await listVoices();

    return voices
      .filter((voice) => voice.Locale.toLowerCase().startsWith("zh"))
      .map((voice) => ({
        name: voice.Name,
        shortName: voice.ShortName,
        friendlyName: voice.FriendlyName,
        gender: voice.Gender,
        locale: voice.Locale,
      }));
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "音色列表获取失败",
    });
  }
});
