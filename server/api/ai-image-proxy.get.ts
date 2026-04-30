export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const targetUrl = String(query.url || "").trim();

  if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
    throw createError({
      statusCode: 400,
      statusMessage: "无效的图片地址",
    });
  }

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "图片拉取失败",
    });
  }

  if (!response.ok) {
    throw createError({
      statusCode: response.status || 502,
      statusMessage: "图片拉取失败",
    });
  }

  const contentType = String(response.headers.get("content-type") || "").trim();
  if (contentType) {
    setHeader(event, "Content-Type", contentType);
  }

  const contentLength = String(response.headers.get("content-length") || "").trim();
  if (contentLength) {
    setHeader(event, "Content-Length", contentLength);
  }

  setHeader(event, "Cache-Control", "public, max-age=600");
  setHeader(event, "Content-Disposition", "inline");

  return new Uint8Array(await response.arrayBuffer());
});
