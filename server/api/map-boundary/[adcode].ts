const globalMapCache = globalThis as typeof globalThis & {
  __mapBoundaryCache__?: Map<string, any>;
};

const mapBoundaryCache =
  globalMapCache.__mapBoundaryCache__ || (globalMapCache.__mapBoundaryCache__ = new Map());

const getPolygonCenter = (polygons: any[]) => {
  const points = polygons.flat(2) as [number, number][];
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);

  return [
    Number(((Math.min(...xs) + Math.max(...xs)) / 2).toFixed(6)),
    Number(((Math.min(...ys) + Math.max(...ys)) / 2).toFixed(6)),
  ];
};

// 阿里云深圳区级边界未拆分大鹏新区，这里基于龙岗区的东侧独立面做一次本地修正。
const normalizeShenzhenDistrictGeoJson = (adcode: string, geoJson: any) => {
  if (adcode !== "440300" || !geoJson?.features?.length) {
    return geoJson;
  }

  if (geoJson.features.some((feature: any) => feature?.properties?.name === "大鹏新区")) {
    return geoJson;
  }

  const longgangFeatureIndex = geoJson.features.findIndex(
    (feature: any) => String(feature?.properties?.adcode || "") === "440307"
  );

  if (longgangFeatureIndex < 0) {
    return geoJson;
  }

  const longgangFeature = geoJson.features[longgangFeatureIndex];
  const longgangPolygons =
    longgangFeature?.geometry?.type === "MultiPolygon"
      ? [...longgangFeature.geometry.coordinates]
      : [];

  if (longgangPolygons.length < 2) {
    return geoJson;
  }

  const eastPolygonIndex = longgangPolygons.reduce((bestIndex: number, polygon: any, index: number) => {
    const center = getPolygonCenter(polygon);
    const bestCenter = getPolygonCenter(longgangPolygons[bestIndex]);
    return center[0] > bestCenter[0] ? index : bestIndex;
  }, 0);
  const dapengPolygons = [longgangPolygons[eastPolygonIndex]];
  const nextLonggangPolygons = longgangPolygons.filter((_, index) => index !== eastPolygonIndex);

  if (!dapengPolygons.length || !nextLonggangPolygons.length) {
    return geoJson;
  }

  const nextLonggangCenter = getPolygonCenter(nextLonggangPolygons);
  const dapengCenter = getPolygonCenter(dapengPolygons);
  const nextFeatures = [...geoJson.features];

  nextFeatures[longgangFeatureIndex] = {
    ...longgangFeature,
    geometry: {
      type: "MultiPolygon",
      coordinates: nextLonggangPolygons,
    },
    properties: {
      ...longgangFeature.properties,
      center: nextLonggangCenter,
      centroid: nextLonggangCenter,
    },
  };

  nextFeatures.splice(longgangFeatureIndex + 1, 0, {
    ...longgangFeature,
    geometry: {
      type: "MultiPolygon",
      coordinates: dapengPolygons,
    },
    properties: {
      ...longgangFeature.properties,
      name: "大鹏新区",
      adcode: 440312,
      level: "district",
      childrenNum: 0,
      center: dapengCenter,
      centroid: dapengCenter,
    },
  });

  return {
    ...geoJson,
    features: nextFeatures,
  };
};

export default defineEventHandler(async (event) => {
  const adcode = getRouterParam(event, "adcode");

  if (!adcode || !/^\d{6}$/.test(adcode)) {
    throw createError({
      statusCode: 400,
      statusMessage: "无效的地图区域编码",
    });
  }

  if (mapBoundaryCache.has(adcode)) {
    const cachedGeoJson = normalizeShenzhenDistrictGeoJson(adcode, mapBoundaryCache.get(adcode));
    mapBoundaryCache.set(adcode, cachedGeoJson);
    return cachedGeoJson;
  }

  try {
    const geoJson = await $fetch<any>(
      `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`,
      {
        headers: {
          referer: "https://datav.aliyun.com/",
        },
      }
    );

    if (!geoJson?.features?.length) {
      throw new Error("地图数据为空");
    }

    const normalizedGeoJson = normalizeShenzhenDistrictGeoJson(adcode, geoJson);

    mapBoundaryCache.set(adcode, normalizedGeoJson);
    return normalizedGeoJson;
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: "未找到对应区域地图数据",
    });
  }
});
