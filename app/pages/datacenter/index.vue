<template>
  <div
    class="data-center-page"
    :class="{ 'data-center-page--scaled': isLargeScreenScaled }"
  >
    <div class="data-center-grid-bg"></div>
    <div v-if="hasViewportOverride" class="viewport-debug-badge">
      {{ viewportDebugText }}
    </div>
    <div class="data-center-shell" :style="dataCenterShellStyle">
      <section class="dashboard-body">
        <aside class="left-rail">
          <div class="left-panel left-panel--period">
            <div class="period-switcher">
              <button
                type="button"
                class="period-arrow"
                :disabled="selectedPeriodIndex <= 0"
                @click="switchPeriod(selectedPeriodIndex - 1)"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div class="period-display">
                <span class="period-date">{{ currentPeriod.start }}</span>
                <span class="period-separator">至</span>
                <span class="period-date">{{ currentPeriod.end }}</span>
              </div>
              <button
                type="button"
                class="period-arrow"
                :disabled="selectedPeriodIndex >= periods.length - 1"
                @click="switchPeriod(selectedPeriodIndex + 1)"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div class="left-panel left-panel--overview">
            <div class="left-panel-title-wrap">
              <div class="left-panel-title">{{ currentPeriod.left.panelTitle }}</div>
            </div>

            <div class="overview-top-grid">
              <div class="overview-top-stat">
                <span class="overview-top-label">提供课程数量</span>
                <span class="overview-top-value overview-top-value--pink">
                  {{ currentPeriod.left.resourceBuild.providedCourses }}
                </span>
              </div>
              <div class="overview-top-stat">
                <span class="overview-top-label">竞赛获奖次数</span>
                <span class="overview-top-value overview-top-value--gold">
                  {{ currentPeriod.left.resourceBuild.competitionCount }}
                </span>
              </div>
            </div>

            <div class="gauge-chart-wrap">
              <ClientOnly>
                <VChart
                  class="left-chart left-chart--gauge"
                  :option="leftGaugeOption"
                  autoresize
                />
              </ClientOnly>
              <div class="gauge-center-caption">各类教学资源数量</div>
              <div class="gauge-center-value">
                {{ currentPeriod.left.resourceBuild.total }}
              </div>
            </div>

            <div ref="liveCourseListRef" class="live-course-list">
              <div
                v-for="course in currentPeriod.left.liveCourses"
                :key="course.name"
                class="live-course-item"
              >
                <span class="live-course-bullet"></span>
                <span class="live-course-name">{{ course.name }}</span>
                <span class="live-course-status">{{ course.status }}</span>
              </div>
            </div>

            <div class="rollout-grid">
              <div
                v-for="metric in currentPeriod.left.rolloutMetrics"
                :key="metric.label"
                class="rollout-card"
              >
                <div class="rollout-label">{{ metric.label }}</div>
                <div class="rollout-value" :style="{ color: metric.color }">
                  {{ metric.value }}
                </div>
                <div class="rollout-delta">{{ metric.delta }}</div>
              </div>
            </div>

            <div class="rollout-rate-strip">
              <div class="rollout-rate-item">
                <div class="rollout-rate-label">任务提交率</div>
                <div class="rollout-rate-value">{{ currentPeriod.left.taskRate }}%</div>
              </div>
              <div class="rollout-rate-divider"></div>
              <div class="rollout-rate-item">
                <div class="rollout-rate-label">任务完成率</div>
                <div class="rollout-rate-value">
                  {{ currentPeriod.left.activityRate }}%
                </div>
              </div>
            </div>

            <div class="works-combo-panel">
              <div class="mini-chart-title mini-chart-title--center">
                各工具创作作品数量
              </div>
              <div class="works-combo-content">
                <div class="works-ring-wrap">
                  <ClientOnly>
                    <VChart
                      class="mini-chart mini-chart--ring"
                      :option="worksRingOption"
                      autoresize
                    />
                  </ClientOnly>
                  <div class="works-ring-center-label">作品总量</div>
                  <div class="works-ring-center-value">
                    {{ currentPeriod.left.works.total }}
                  </div>
                </div>
                <div class="works-right-side">
                  <div class="works-top-list">
                    <div
                      v-for="item in currentPeriod.left.works.top"
                      :key="item.label"
                      class="works-top-item"
                    >
                      <span class="works-top-item__label">{{ item.label }}</span>
                      <span class="works-top-item__value">{{ item.value }}</span>
                      <span class="works-top-item__name">{{ item.name }}</span>
                    </div>
                  </div>
                  <div class="works-legend-row">
                    <span
                      v-for="item in currentPeriod.left.works.items"
                      :key="item.name"
                      class="works-legend-item"
                    >
                      <i class="works-legend-dot" :style="{ background: item.color }"></i>
                      {{ getWorksLegendLabel(item.name) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="left-dual-charts">
              <div class="mini-chart-panel mini-chart-panel--plain">
                <div class="mini-chart-title">区域备课/开课时长时间热度图</div>
                <ClientOnly>
                  <VChart class="mini-chart" :option="leftTrendOption" autoresize />
                </ClientOnly>
              </div>

              <div
                class="mini-chart-panel mini-chart-panel--plain mini-chart-panel--rank"
              >
                <div class="mini-chart-title">开课时长top5排名</div>
                <ClientOnly>
                  <VChart class="mini-chart" :option="leftRankOption" autoresize />
                </ClientOnly>
              </div>
            </div>
          </div>
        </aside>

        <section class="center-stage panel">
          <div class="center-hero-title">
            <h1 class="header-title">AI数据驾驶舱</h1>
          </div>
          <div class="center-summary-row">
            <div
              v-for="card in currentPeriod.summaryCards"
              :key="card.label"
              class="center-summary-card"
              :class="card.theme"
            >
              <div class="center-summary-card__value">{{ card.value }}</div>
              <div class="center-summary-card__label">{{ card.label }}</div>
            </div>
          </div>
          <div class="center-map-stage">
            <div class="center-map-toolbar">
              <div class="center-map-toolbar__left">
                <div class="center-map-corner-label">{{ currentMapCornerLabel }}</div>
                <div v-if="canGoBack" class="center-map-corner-hint">
                  {{ currentMapSubtitle }}
                </div>
              </div>
              <button
                v-if="canGoBack"
                type="button"
                class="map-back-button"
                @click="handleMapBack"
              >
                {{ mapBackButtonText }}
              </button>
            </div>
            <ClientOnly>
              <VChart
                class="chart chart--map"
                :option="chinaMapOption"
                autoresize
                @click="handleMapClick"
              />
            </ClientOnly>
          </div>
          <div class="center-award-board">
            <div class="center-award-board__head">
              <div class="center-award-board__title">竞赛获奖看台</div>
              <div class="center-award-board__action">查看更多 &gt;</div>
            </div>
            <div class="center-award-board__table">
              <div class="center-award-board__row center-award-board__row--head">
                <span>赛事类型</span>
                <span>赛事名称</span>
                <span>届次</span>
                <span>获奖队伍</span>
                <span>获奖学生</span>
                <span>获奖学校</span>
                <span>覆盖区域</span>
              </div>
              <div
                v-for="row in centerAwardRows"
                :key="`${row.type}-${row.name}-${row.student}`"
                class="center-award-board__row"
              >
                <span>{{ row.type }}</span>
                <span>{{ row.name }}</span>
                <span>{{ row.stage }}</span>
                <span>{{ row.team }}</span>
                <span>{{ row.student }}</span>
                <span>{{ row.school }}</span>
                <span>{{ row.scope }}</span>
              </div>
            </div>
          </div>
        </section>

        <aside class="right-rail">
          <div class="panel right-panel">
            <div class="panel-head panel-head--right">
              <div class="panel-title">学生能力评测与评价</div>
              <div class="right-panel-link">AI等级测评认证报告详情 &gt;</div>
            </div>
            <div class="right-panel-radar-title">学生AI素质评价</div>
            <ClientOnly>
              <VChart
                class="chart chart--radar"
                :option="studentRadarOption"
                autoresize
              />
            </ClientOnly>
            <div class="right-panel-metrics">
              <div class="right-panel-metric">
                <div class="right-panel-metric__label">认证参与人数</div>
                <div class="right-panel-metric__value">
                  {{ currentPeriod.right.certCount }}
                </div>
              </div>
              <div class="right-panel-metric right-panel-metric--split">
                <div class="right-panel-metric__label">学生认证通过率</div>
                <div class="right-panel-metric__value right-panel-metric__value--gold">
                  {{ formatDecimal(currentPeriod.right.reachRate) }}%
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import chinaGeoJson from "~/data/china-map.json";
import cockpitMock from "~/data/datacenter-mock.json";
import VChart from "vue-echarts";
import { registerMap, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  BarChart,
  GaugeChart,
  LineChart,
  MapChart,
  PieChart,
  RadarChart,
  ScatterChart,
} from "echarts/charts";
import {
  GeoComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
} from "echarts/components";

definePageMeta({
  layout: "blank",
});

const route = useRoute();

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  RadarChart,
  GaugeChart,
  MapChart,
  ScatterChart,
  GridComponent,
  GeoComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
]);

const periods = cockpitMock.periods;
const LARGE_SCREEN_DESIGN_WIDTH = 1920;
const LARGE_SCREEN_DESIGN_HEIGHT = 1080;
const selectedPeriodIndex = ref(periods.length - 1);
const liveCourseListRef = ref<HTMLElement | null>(null);
let liveCourseScrollTimer: ReturnType<typeof setInterval> | null = null;
const viewportWidth = ref(LARGE_SCREEN_DESIGN_WIDTH);
const viewportHeight = ref(LARGE_SCREEN_DESIGN_HEIGHT);
const selectedProvinceName = ref("广东省");
const drillProvinceName = ref<string | null>(null);
const drillProvinceAdcode = ref<string | null>(null);
const drillCityName = ref<string | null>(null);
const drillCityAdcode = ref<string | null>(null);
const provinceGeoJsonCache = ref<Record<string, any>>({});
const cityGeoJsonCache = ref<Record<string, any>>({});
const worksLegendLabelMap: Record<string, string> = {
  uCode图形化: "vinci",
  uCode3: "nous",
};
const provinceMapModuleLoaders = import.meta.glob("../../data/china-provinces/*.json", {
  import: "default",
});
const filteredChinaGeoJson = {
  ...(chinaGeoJson as any),
  features: ((chinaGeoJson as any).features || []).filter((feature: any) => {
    const properties = feature?.properties || {};
    return properties.adchar !== "JD" && properties.adcode !== "100000_JD";
  }),
};
registerMap("china", filteredChinaGeoJson as any);
const provinceAdcodeMap = new Map(
  (filteredChinaGeoJson.features || [])
    .map((feature: any) => [feature?.properties?.name, String(feature?.properties?.adcode || "")])
    .filter(([name, adcode]: any) => name && adcode)
);
const provinceMapLoaderMap = new Map(
  Object.entries(provinceMapModuleLoaders)
    .map(([path, loader]) => {
      const match = path.match(/\/(\d+)\.json$/);
      return match ? [match[1], loader] : null;
    })
    .filter(Boolean) as [string, () => Promise<any>][]
);
const provinceCoordinateMap = new Map(
  (filteredChinaGeoJson.features || [])
    .map((feature: any) => [
      feature?.properties?.name,
      feature?.properties?.centroid || feature?.properties?.center,
    ])
    .filter(([name, coord]: any) => name && Array.isArray(coord) && coord.length === 2)
);

const switchPeriod = (nextIndex: number) => {
  if (nextIndex < 0 || nextIndex >= periods.length) return;
  selectedPeriodIndex.value = nextIndex;
};

const currentPeriod = computed(() => periods[selectedPeriodIndex.value] || periods[0]);
const getWorksLegendLabel = (name: string) => worksLegendLabelMap[name] || name;
const parseMetricValue = (value: string | number) =>
  Number(String(value ?? 0).replace(/,/g, "")) || 0;
const formatMetricValue = (value: string | number) =>
  parseMetricValue(value).toLocaleString("zh-CN");
const formatDecimal = (value: string | number, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return "0";
  return num.toFixed(digits).replace(/\.?0+$/, "");
};
const getProvinceShortName = (name: string) =>
  name.replace(/特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|省|市/g, "");
const studentRadarDimensionNames = [
  "人工智能意识",
  "人工智能社会责任",
  "人工智能思维",
  "人工智能能力",
  "人工智能应用",
];
const studentRadarIndicators = computed(() =>
  studentRadarDimensionNames.map((name, index) => ({
    name,
    max: 100,
    value: Number(currentPeriod.value.right.radar[index] ?? 0),
  }))
);
const parseViewportQuery = (value: unknown) => {
  const normalized = Array.isArray(value) ? value[0] : value;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
};
const queryViewportWidth = computed(() => parseViewportQuery(route.query.screenWidth));
const queryViewportHeight = computed(() => parseViewportQuery(route.query.screenHeight));
const simulatedViewportWidth = computed(() => {
  if (queryViewportWidth.value) return queryViewportWidth.value;
  if (queryViewportHeight.value) {
    return Math.round(
      (queryViewportHeight.value * LARGE_SCREEN_DESIGN_WIDTH) / LARGE_SCREEN_DESIGN_HEIGHT
    );
  }

  return null;
});
const simulatedViewportHeight = computed(() => {
  if (queryViewportHeight.value) return queryViewportHeight.value;
  if (queryViewportWidth.value) {
    return Math.round(
      (queryViewportWidth.value * LARGE_SCREEN_DESIGN_HEIGHT) / LARGE_SCREEN_DESIGN_WIDTH
    );
  }

  return null;
});
const hasViewportOverride = computed(
  () => simulatedViewportWidth.value !== null || simulatedViewportHeight.value !== null
);
const requestedViewportWidth = computed(
  () => simulatedViewportWidth.value ?? viewportWidth.value
);
const requestedViewportHeight = computed(
  () => simulatedViewportHeight.value ?? viewportHeight.value
);
const isViewportOverrideLimited = computed(
  () =>
    hasViewportOverride.value &&
    (requestedViewportWidth.value > viewportWidth.value ||
      requestedViewportHeight.value > viewportHeight.value)
);
const effectiveViewportWidth = computed(() =>
  hasViewportOverride.value
    ? Math.min(requestedViewportWidth.value, viewportWidth.value)
    : viewportWidth.value
);
const effectiveViewportHeight = computed(() =>
  hasViewportOverride.value
    ? Math.min(requestedViewportHeight.value, viewportHeight.value)
    : viewportHeight.value
);
const largeScreenScale = computed(() =>
  Number(
    Math.max(
      1,
      Math.min(
        effectiveViewportWidth.value / LARGE_SCREEN_DESIGN_WIDTH,
        effectiveViewportHeight.value / LARGE_SCREEN_DESIGN_HEIGHT
      )
    ).toFixed(4)
  )
);
const isLargeScreenScaled = computed(() => largeScreenScale.value > 1.02);
const viewportDebugText = computed(
  () => {
    if (isViewportOverrideLimited.value) {
      return `模拟 ${requestedViewportWidth.value} x ${requestedViewportHeight.value} | 当前窗口不足，建议用 capture 脚本截图`;
    }

    return `模拟分辨率 ${effectiveViewportWidth.value} x ${effectiveViewportHeight.value} | 缩放 ${largeScreenScale.value}x`;
  }
);
const dataCenterShellStyle = computed(() => {
  if (!isLargeScreenScaled.value) return {};

  return {
    width: `${LARGE_SCREEN_DESIGN_WIDTH}px`,
    height: `${LARGE_SCREEN_DESIGN_HEIGHT}px`,
    transform: `scale(${largeScreenScale.value})`,
    transformOrigin: "center top",
  };
});
const canGoBack = computed(() => Boolean(drillProvinceName.value));
const currentMapSubtitle = computed(() => {
  if (drillCityName.value && drillProvinceName.value) {
    return `点击左上角返回${getProvinceShortName(drillProvinceName.value)}视图`;
  }

  if (drillProvinceName.value) {
    return "点击左上角返回全国视图";
  }

  return "学校规模分布、区域覆盖热度与重点省份联动情况";
});
const currentMapCornerLabel = computed(() => {
  if (drillCityName.value) {
    return getProvinceShortName(drillCityName.value);
  }

  if (drillProvinceName.value) {
    return getProvinceShortName(drillProvinceName.value);
  }

  return "中国";
});
const currentMapLayoutCenter = computed<[string, string]>(() => {
  if (drillCityName.value) {
    return ["50%", "50%"];
  }

  if (drillProvinceName.value) {
    return ["50%", "50%"];
  }

  return ["50%", "56%"];
});
const currentMapLayoutSize = computed(() => {
  if (drillCityName.value) {
    return "84%";
  }

  if (drillProvinceName.value) {
    return "88%";
  }

  return "92%";
});
const mapBackButtonText = computed(() => {
  if (drillCityName.value && drillProvinceName.value) {
    return `返回${getProvinceShortName(drillProvinceName.value)}`;
  }

  return "返回全国";
});
const updateViewportSize = () => {
  if (typeof window === "undefined") return;
  viewportWidth.value = window.innerWidth || LARGE_SCREEN_DESIGN_WIDTH;
  viewportHeight.value = window.innerHeight || LARGE_SCREEN_DESIGN_HEIGHT;
};
const tooltipSafePosition = (
  point: number[],
  _params: any,
  _dom: HTMLElement,
  _rect: any,
  size: any
) => {
  const [x, y] = point;
  const [contentWidth, contentHeight] = size.contentSize;
  const [viewWidth, viewHeight] = size.viewSize;
  const offset = 14;
  const left =
    x + offset + contentWidth > viewWidth ? x - contentWidth - offset : x + offset;
  const top = y - contentHeight - offset < 0 ? y + offset : y - contentHeight - offset;

  return [
    Math.max(8, Math.min(left, viewWidth - contentWidth - 8)),
    Math.max(8, Math.min(top, viewHeight - contentHeight - 8)),
  ];
};
const centerSummaryTotals = computed(() => ({
  schools: parseMetricValue(
    currentPeriod.value.summaryCards.find((item) => item.label === "学校总数")?.value ?? 0
  ),
  teachers: parseMetricValue(
    currentPeriod.value.summaryCards.find((item) => item.label === "教师人数")?.value ?? 0
  ),
  students: parseMetricValue(
    currentPeriod.value.summaryCards.find((item) => item.label === "学生人数")?.value ?? 0
  ),
}));
const centerAwardRows = computed(() => currentPeriod.value.center.awards || []);
const currentProvinceMetrics = computed(() => {
  const totalSchools = centerSummaryTotals.value.schools || 1;

  return currentPeriod.value.center.provinceMetrics
    .map((item: any) => {
      const coordinate = provinceCoordinateMap.get(item.name);
      if (!coordinate) return null;

      return {
        ...item,
        coordinate,
        shortName: getProvinceShortName(item.name),
        teacherCount: Math.round((item.value / totalSchools) * centerSummaryTotals.value.teachers),
        studentCount: Math.round((item.value / totalSchools) * centerSummaryTotals.value.students),
      };
    })
    .filter(Boolean);
});
const currentProvinceMetricMap = computed(
  () =>
    new Map(
      currentProvinceMetrics.value.map((item: any) => [
        item.name,
        item,
      ])
    )
);
const allProvinceMapData = computed(() =>
  (filteredChinaGeoJson.features || [])
    .map((feature: any) => {
      const name = feature?.properties?.name;
      if (!name) return null;

      return {
        name,
        value: currentProvinceMetricMap.value.get(name)?.value ?? 0,
        metric: currentProvinceMetricMap.value.get(name) || null,
        selected: name === selectedProvinceName.value,
      };
    })
    .filter(Boolean)
);
const currentDrillMapKey = computed(() =>
  drillCityAdcode.value
    ? `city-${drillCityAdcode.value}`
    : drillProvinceAdcode.value
      ? `province-${drillProvinceAdcode.value}`
      : "china"
);
const currentDrillGeoJson = computed(() => {
  if (drillCityAdcode.value) {
    return cityGeoJsonCache.value[drillCityAdcode.value] || null;
  }

  if (drillProvinceAdcode.value) {
    return provinceGeoJsonCache.value[drillProvinceAdcode.value] || null;
  }

  return null;
});
const currentDrillFeatureMetaMap = computed(
  () =>
    new Map(
      ((currentDrillGeoJson.value?.features || []) as any[])
        .map((feature: any) => {
          const properties = feature?.properties || {};
          const name = properties.name;
          const adcode = String(properties.adcode || "");

          if (!name || !adcode) return null;

          return [
            name,
            {
              adcode,
              childrenNum: Number(properties.childrenNum || 0),
              level: properties.level || "",
            },
          ];
        })
        .filter(Boolean) as [string, { adcode: string; childrenNum: number; level: string }][]
    )
);
const loadProvinceGeoJson = async (adcode: string) => {
  if (provinceGeoJsonCache.value[adcode]) {
    return provinceGeoJsonCache.value[adcode];
  }

  const loader = provinceMapLoaderMap.get(adcode);
  if (!loader) return null;

  const geoJson = await loader();
  provinceGeoJsonCache.value = {
    ...provinceGeoJsonCache.value,
    [adcode]: geoJson,
  };
  registerMap(`province-${adcode}`, geoJson as any);
  return geoJson;
};
const loadCityGeoJson = async (adcode: string) => {
  if (cityGeoJsonCache.value[adcode]) {
    return cityGeoJsonCache.value[adcode];
  }

  let geoJson: any = null;

  try {
    geoJson = await $fetch<any>(`/api/map-boundary/${adcode}`);
  } catch {
    return null;
  }

  if (!geoJson) return null;

  cityGeoJsonCache.value = {
    ...cityGeoJsonCache.value,
    [adcode]: geoJson,
  };
  registerMap(`city-${adcode}`, geoJson as any);
  return geoJson;
};
const handleMapClick = async (params: any) => {
  if (params?.componentSubType !== "map" || !params?.name) {
    return;
  }

  if (!drillProvinceAdcode.value) {
    const adcode = provinceAdcodeMap.get(params.name);
    if (!adcode) return;

    const geoJson = await loadProvinceGeoJson(adcode);
    if (!geoJson) return;

    selectedProvinceName.value = params.name;
    drillProvinceName.value = params.name;
    drillProvinceAdcode.value = adcode;
    drillCityName.value = null;
    drillCityAdcode.value = null;
    return;
  }

  if (drillCityAdcode.value) {
    return;
  }

  const featureMeta = currentDrillFeatureMetaMap.value.get(params.name);
  if (!featureMeta?.adcode || featureMeta.childrenNum <= 0) {
    return;
  }

  const geoJson = await loadCityGeoJson(featureMeta.adcode);
  if (!geoJson) return;

  drillCityName.value = params.name;
  drillCityAdcode.value = featureMeta.adcode;
};
const handleMapBack = () => {
  if (drillCityAdcode.value) {
    drillCityName.value = null;
    drillCityAdcode.value = null;
    return;
  }

  drillProvinceName.value = null;
  drillProvinceAdcode.value = null;
  drillCityName.value = null;
  drillCityAdcode.value = null;
};
const trendChartData = computed(() => {
  const trend = currentPeriod.value.left.periodTrend;
  const segmentSize = 7;
  const categories = Array.from({ length: trend.labels.length * segmentSize }, () => "");
  const prepareSeries = Array.from({ length: categories.length }, () => 0);
  const classSeries = Array.from({ length: categories.length }, () => 0);
  const preparePattern = [0, 0, 0.18, 0.62, 0.38, 0.92, 0.56];
  const classPattern = [0, 0, 0.12, 0.34, 0.22, 0.58, 0.3];

  trend.labels.forEach((label, labelIndex) => {
    const startIndex = labelIndex * segmentSize;
    categories[startIndex] = label;

    preparePattern.forEach((rate, patternIndex) => {
      prepareSeries[startIndex + patternIndex] = Math.round((trend.bar[labelIndex] || 0) * rate);
      classSeries[startIndex + patternIndex] = Math.round(
        (trend.line[labelIndex] || 0) * classPattern[patternIndex]
      );
    });
  });

  const maxValue = Math.max(...prepareSeries, ...classSeries, 0);

  return {
    categories,
    prepareSeries,
    classSeries,
    maxValue: Math.max(80, Math.ceil(maxValue / 20) * 20),
  };
});
const rankChartMax = computed(() => {
  const maxValue = Math.max(...currentPeriod.value.left.openClassRank.values, 0);
  return Math.max(200, Math.ceil(maxValue / 40) * 40);
});

const leftGaugeOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: { trigger: "item" },
  series: [
    {
      type: "pie",
      startAngle: 180,
      clockwise: true,
      radius: ["56%", "76%"],
      center: ["50%", "78%"],
      avoidLabelOverlap: true,
      itemStyle: {
        borderWidth: 0,
      },
      label: {
        show: true,
        color: "#C9D8FA",
        fontSize: 11,
        lineHeight: 15,
        formatter: (params: any) => {
          if (!params.name) return "";
          return `${params.name}\n(${params.value})`;
        },
      },
      labelLine: {
        show: true,
        length: 10,
        length2: 18,
        lineStyle: {
          width: 1.5,
        },
      },
      data: [
        ...currentPeriod.value.left.resourceBuild.items.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color },
        })),
        {
          value: currentPeriod.value.left.resourceBuild.items.reduce(
            (sum, item) => sum + item.value,
            0
          ),
          name: "",
          itemStyle: {
            color: "transparent",
          },
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
          emphasis: {
            disabled: true,
          },
          tooltip: {
            show: false,
          },
        },
      ],
    },
  ],
}));

const worksRingOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "item",
    appendTo: "body",
    backgroundColor: "rgba(8, 21, 63, 0.96)",
    borderColor: "rgba(125, 140, 255, 0.34)",
    borderWidth: 1,
    textStyle: {
      color: "#EAF3FF",
      fontSize: 12,
    },
    extraCssText:
      "border-radius: 10px; box-shadow: 0 10px 24px rgba(2, 8, 24, 0.28); padding: 8px 10px; white-space: nowrap; z-index: 999999;",
    formatter: (params: any) =>
      `${getWorksLegendLabel(params.name)}<br/>作品数量：${params.value}`,
    position: tooltipSafePosition,
  },
  series: [
    {
      type: "pie",
      radius: ["64%", "82%"],
      center: ["50%", "50%"],
      label: { show: false },
      itemStyle: {
        borderColor: "rgba(8, 21, 63, 0.98)",
        borderWidth: 2,
      },
      data: currentPeriod.value.left.works.items.map((item) => ({
        value: item.value,
        name: item.name,
        itemStyle: { color: item.color },
      })),
    },
  ],
}));

const leftTrendOption = computed(() => ({
  backgroundColor: "transparent",
  animationDuration: 600,
  grid: { top: 18, left: 10, right: 8, bottom: 26, containLabel: true },
  legend: {
    bottom: 0,
    left: "center",
    itemWidth: 10,
    itemHeight: 6,
    textStyle: { color: "#AFC8FF", fontSize: 10 },
    data: ["备课", "授课"],
  },
  tooltip: {
    trigger: "axis",
    appendTo: "body",
    backgroundColor: "rgba(8, 21, 63, 0.96)",
    borderColor: "rgba(125, 140, 255, 0.34)",
    borderWidth: 1,
    textStyle: { color: "#EAF3FF", fontSize: 12 },
  },
  xAxis: {
    type: "category",
    boundaryGap: true,
    data: trendChartData.value.categories,
    axisTick: { show: false },
    axisLine: { lineStyle: { color: "rgba(40, 159, 255, 0.48)", width: 1.5 } },
    axisLabel: {
      color: "#6CCBFF",
      fontSize: 10,
      interval: 0,
      hideOverlap: false,
      formatter: (value: string) => value || "",
    },
  },
  yAxis: {
    type: "value",
    min: 0,
    max: trendChartData.value.maxValue,
    interval: trendChartData.value.maxValue / 4,
    splitLine: { lineStyle: { color: "rgba(52, 157, 255, 0.1)" } },
    axisTick: { show: false },
    axisLine: {
      show: true,
      lineStyle: { color: "rgba(40, 159, 255, 0.48)", width: 1.5 },
    },
    axisLabel: { color: "#6CCBFF", fontSize: 10 },
  },
  series: [
    {
      name: "备课",
      type: "bar",
      barWidth: 6,
      barGap: "-65%",
      itemStyle: {
        borderRadius: 0,
        color: "#FF8FE0",
      },
      emphasis: { focus: "series" },
      data: trendChartData.value.prepareSeries,
    },
    {
      name: "授课",
      type: "bar",
      barWidth: 5,
      itemStyle: {
        borderRadius: 0,
        color: "#FFD45C",
      },
      emphasis: { focus: "series" },
      data: trendChartData.value.classSeries,
    },
  ],
}));

const leftRankOption = computed(() => ({
  backgroundColor: "transparent",
  animationDuration: 600,
  grid: { top: 12, left: 4, right: 10, bottom: 28, containLabel: true },
  legend: {
    bottom: 0,
    left: 0,
    itemWidth: 10,
    itemHeight: 6,
    textStyle: { color: "#AFC8FF", fontSize: 10 },
    data: ["开课时长"],
  },
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    appendTo: "body",
    backgroundColor: "rgba(8, 21, 63, 0.96)",
    borderColor: "rgba(125, 140, 255, 0.34)",
    borderWidth: 1,
    textStyle: { color: "#EAF3FF", fontSize: 12 },
  },
  xAxis: {
    type: "value",
    min: 0,
    max: rankChartMax.value,
    interval: rankChartMax.value / 4,
    axisTick: {
      show: true,
      length: 6,
      lineStyle: { color: "rgba(40, 159, 255, 0.7)", width: 1.2 },
    },
    axisLine: {
      show: true,
      lineStyle: { color: "rgba(40, 159, 255, 0.48)", width: 1.5 },
    },
    axisLabel: {
      color: "#6CCBFF",
      fontSize: 9,
      hideOverlap: false,
      margin: 8,
      formatter: (value: number) => String(Math.round(value)),
    },
    splitLine: { show: false },
  },
  yAxis: {
    type: "category",
    inverse: true,
    axisTick: { show: false },
    axisLine: {
      show: true,
      lineStyle: { color: "rgba(40, 159, 255, 0.48)", width: 1.5 },
    },
    axisLabel: {
      color: "#D7E5FF",
      fontSize: 10,
      width: 70,
      margin: 6,
      overflow: "truncate",
    },
    data: currentPeriod.value.left.openClassRank.labels,
  },
  series: [
    {
      name: "开课时长",
      type: "bar",
      barWidth: 8,
      itemStyle: {
        borderRadius: 0,
        color: "#FF8FE0",
      },
      data: currentPeriod.value.left.openClassRank.values,
    },
  ],
}));

const chinaMapOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    trigger: "item",
    appendTo: "body",
    backgroundColor: "rgba(8, 21, 63, 0.96)",
    borderColor: "rgba(125, 140, 255, 0.34)",
    borderWidth: 1,
    textStyle: {
      color: "#EAF3FF",
      fontSize: 12,
    },
    extraCssText:
      "border-radius: 10px; box-shadow: 0 10px 24px rgba(2, 8, 24, 0.28); padding: 8px 10px; white-space: nowrap; z-index: 999999;",
    formatter: (params: any) => {
      if (drillProvinceName.value) {
        return `${params.name}`;
      }

      const metric =
        currentProvinceMetricMap.value.get(params.name) || params.data?.metric || null;

      if (!metric) {
        return `${getProvinceShortName(params.name || "当前区域")}<br/>暂未接入省级数据`;
      }

      return [
        `${metric.shortName}`,
        `学校总数：${formatMetricValue(metric.value)}`,
        `教师覆盖：${formatMetricValue(metric.teacherCount)}`,
        `学生覆盖：${formatMetricValue(metric.studentCount)}`,
      ].join("<br/>");
    },
    position: tooltipSafePosition,
  },
  geo: {
    map: currentDrillMapKey.value,
    roam: false,
    layoutCenter: currentMapLayoutCenter.value,
    layoutSize: currentMapLayoutSize.value,
    zoom: 1,
    label: {
      show: false,
    },
    itemStyle: {
      areaColor: "rgba(28, 82, 176, 0.9)",
      borderColor: "rgba(83, 207, 255, 0.88)",
      borderWidth: 1.4,
      shadowColor: "rgba(27, 112, 255, 0.28)",
      shadowBlur: 18,
    },
    emphasis: {
      label: {
        show: false,
      },
      itemStyle: {
        areaColor: "rgba(228, 68, 92, 0.92)",
        borderColor: "rgba(255, 187, 198, 0.98)",
        borderWidth: 1.9,
        shadowColor: "rgba(228, 68, 92, 0.36)",
        shadowBlur: 24,
      },
    },
    select: {
      label: {
        show: false,
      },
      itemStyle: {
        areaColor: "rgba(228, 68, 92, 0.92)",
        borderColor: "rgba(255, 187, 198, 0.98)",
        borderWidth: 1.9,
        shadowColor: "rgba(228, 68, 92, 0.36)",
        shadowBlur: 24,
      },
    },
  },
  series: drillProvinceName.value && currentDrillGeoJson.value
    ? [
        {
          type: "map",
          map: currentDrillMapKey.value,
          geoIndex: 0,
          selectedMode: false,
          roam: false,
          aspectScale: 0.95,
          itemStyle: {
            areaColor: "rgba(28, 82, 176, 0.9)",
            borderColor: "rgba(83, 207, 255, 0.88)",
            borderWidth: 1.4,
            shadowColor: "rgba(27, 112, 255, 0.28)",
            shadowBlur: 18,
          },
          emphasis: {
            label: {
              show: false,
            },
            itemStyle: {
              areaColor: "rgba(228, 68, 92, 0.92)",
              borderColor: "rgba(255, 187, 198, 0.98)",
              borderWidth: 1.9,
              shadowColor: "rgba(228, 68, 92, 0.36)",
              shadowBlur: 24,
            },
          },
          data: (currentDrillGeoJson.value.features || [])
            .map((feature: any) => feature?.properties?.name)
            .filter(Boolean)
            .map((name: string) => ({
              name,
              value: 0,
            })),
          label: {
            show: false,
          },
        },
      ]
    : [
        {
          type: "map",
          map: "china",
          geoIndex: 0,
          selectedMode: "single",
          roam: false,
          aspectScale: 0.95,
          itemStyle: {
            areaColor: "rgba(28, 82, 176, 0.9)",
            borderColor: "rgba(83, 207, 255, 0.88)",
            borderWidth: 1.4,
            shadowColor: "rgba(27, 112, 255, 0.28)",
            shadowBlur: 18,
          },
          emphasis: {
            label: {
              show: false,
            },
            itemStyle: {
              areaColor: "rgba(228, 68, 92, 0.92)",
              borderColor: "rgba(255, 187, 198, 0.98)",
              borderWidth: 1.9,
              shadowColor: "rgba(228, 68, 92, 0.36)",
              shadowBlur: 24,
            },
          },
          select: {
            label: {
              show: false,
            },
            itemStyle: {
              areaColor: "rgba(228, 68, 92, 0.92)",
              borderColor: "rgba(255, 187, 198, 0.98)",
              borderWidth: 1.9,
              shadowColor: "rgba(228, 68, 92, 0.36)",
              shadowBlur: 24,
            },
          },
          data: allProvinceMapData.value,
          label: {
            show: false,
          },
        },
        {
          type: "scatter",
          coordinateSystem: "geo",
          zlevel: 3,
          silent: true,
          symbolSize: 8,
          itemStyle: {
            color: "#52EAFF",
            borderColor: "rgba(200, 249, 255, 0.96)",
            borderWidth: 1.5,
            shadowBlur: 12,
            shadowColor: "rgba(82, 234, 255, 0.28)",
          },
          data: currentProvinceMetrics.value.map((item: any) => ({
            name: item.name,
            value: item.coordinate,
            metric: item,
          })),
        },
        {
          type: "scatter",
          coordinateSystem: "geo",
          zlevel: 4,
          silent: true,
          symbolSize: 1,
          itemStyle: {
            color: "transparent",
          },
          tooltip: {
            show: false,
          },
          label: {
            show: true,
            position: "inside",
            formatter: (params: any) => `{value|${formatMetricValue(params.data.metric.value)}}`,
            padding: [3, 7],
            borderRadius: 4,
            backgroundColor: "#E94966",
            borderWidth: 0,
            shadowColor: "rgba(233, 73, 102, 0.34)",
            shadowBlur: 10,
            rich: {
              value: {
                color: "#FFFFFF",
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 12,
              },
            },
          },
          data: currentProvinceMetrics.value
            .filter((item: any) => item.showLabel)
            .map((item: any) => ({
              name: item.name,
              value: item.coordinate,
              metric: item,
              label: {
                offset: item.labelOffset || [0, 0],
              },
            })),
        },
      ],
}));

const studentRadarOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    show: false,
  },
  radar: {
    center: ["50%", "53%"],
    radius: "64%",
    startAngle: 90,
    splitNumber: 5,
    indicator: studentRadarIndicators.value.map(({ name, max }) => ({ name, max })),
    axisNameGap: 6,
    axisName: {
      color: "#C4D1FF",
      fontSize: 12,
      formatter: (name: string) => {
        const current = studentRadarIndicators.value.find((item) => item.name === name);
        return `{name|${name}}\n{value|${formatDecimal(current?.value ?? 0)}}`;
      },
      rich: {
        name: {
          color: "#E9F1FF",
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 16,
          align: "center",
        },
        value: {
          color: "#FFC83D",
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 16,
          align: "center",
        },
      },
    },
    splitLine: { lineStyle: { color: "rgba(83, 112, 207, 0.32)" } },
    splitArea: {
      areaStyle: {
        color: [
          "rgba(48, 88, 194, 0.16)",
          "rgba(40, 72, 166, 0.14)",
          "rgba(30, 58, 138, 0.11)",
          "rgba(21, 41, 104, 0.08)",
          "rgba(15, 28, 72, 0.05)",
        ],
      },
    },
    axisLine: { lineStyle: { color: "rgba(83, 112, 207, 0.24)" } },
  },
  series: [
    {
      type: "radar",
      symbol: "circle",
      symbolSize: 5,
      data: [
        {
          value: currentPeriod.value.right.radar,
          areaStyle: { color: "rgba(31, 83, 214, 0.24)" },
          lineStyle: { color: "#FFC83D", width: 2 },
          itemStyle: {
            color: "#FFC83D",
            borderColor: "#FFE7A0",
            borderWidth: 1,
          },
        },
      ],
    },
  ],
}));

const startLiveCourseAutoScroll = () => {
  if (liveCourseScrollTimer) {
    clearInterval(liveCourseScrollTimer);
  }

  liveCourseScrollTimer = setInterval(() => {
    const container = liveCourseListRef.value;
    if (!container) return;

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    if (maxScrollTop <= 0) return;

    const nextTop = container.scrollTop + 24;
    container.scrollTo({
      top: nextTop > maxScrollTop ? 0 : nextTop,
      behavior: "smooth",
    });
  }, 1800);
};

onMounted(() => {
  updateViewportSize();
  window.addEventListener("resize", updateViewportSize);
  startLiveCourseAutoScroll();
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateViewportSize);
  }
  if (liveCourseScrollTimer) {
    clearInterval(liveCourseScrollTimer);
    liveCourseScrollTimer = null;
  }
});
</script>

<style scoped>
.data-center-page {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(
      circle at top center,
      rgba(44, 104, 255, 0.18),
      transparent 28%
    ),
    radial-gradient(circle at bottom left, rgba(53, 224, 208, 0.12), transparent 24%),
    linear-gradient(180deg, #07142f 0%, #081a45 48%, #050f2a 100%);
}

.data-center-page--scaled {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.data-center-grid-bg {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(123, 157, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(123, 157, 255, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.24)
  );
  pointer-events: none;
}

.viewport-debug-badge {
  position: absolute;
  top: 14px;
  left: 16px;
  z-index: 3;
  max-width: calc(100% - 32px);
  padding: 6px 12px;
  border: 1px solid rgba(83, 172, 255, 0.34);
  border-radius: 999px;
  background: rgba(6, 18, 54, 0.88);
  color: #72e7ff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  box-shadow: 0 8px 24px rgba(2, 8, 24, 0.28);
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-center-shell {
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 18px 20px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.data-center-page--scaled .data-center-shell {
  flex: none;
}

.header-title {
  margin: 0;
  font-size: 26px;
  line-height: 1;
  color: #f5f9ff;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 0 0 18px rgba(114, 158, 255, 0.42);
}

.dashboard-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 380px minmax(0, 1fr) 330px;
  gap: 14px;
}

.center-hero-title {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  min-width: 420px;
  padding: 12px 34px 16px;
  text-align: center;
  border-radius: 0 0 42px 42px;
  background: linear-gradient(
    180deg,
    rgba(33, 86, 205, 0.95) 0%,
    rgba(24, 60, 154, 0.92) 48%,
    rgba(12, 35, 103, 0.84) 100%
  );
  box-shadow: 0 18px 30px rgba(8, 20, 56, 0.28), inset 0 0 0 1px rgba(126, 191, 255, 0.2);
}

.center-hero-title::before,
.center-hero-title::after {
  content: "";
  position: absolute;
  bottom: -1px;
  width: 76px;
  height: 34px;
  border-bottom: 1px solid rgba(116, 194, 255, 0.32);
  border-radius: 0 0 38px 38px;
}

.center-hero-title::before {
  left: -56px;
  border-left: 1px solid rgba(116, 194, 255, 0.18);
  background: linear-gradient(90deg, rgba(32, 82, 201, 0.32), rgba(32, 82, 201, 0));
}

.center-hero-title::after {
  right: -56px;
  border-right: 1px solid rgba(116, 194, 255, 0.18);
  background: linear-gradient(270deg, rgba(32, 82, 201, 0.32), rgba(32, 82, 201, 0));
}

.left-rail,
.right-rail {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.left-panel {
  border-radius: 22px;
  border: 1px solid rgba(145, 178, 255, 0.16);
  background: rgba(8, 22, 58, 0.88);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.left-panel--period {
  flex-shrink: 0;
  padding: 8px 10px;
}

.period-switcher {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 30px;
  gap: 8px;
  align-items: center;
}

.period-arrow {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(114, 149, 229, 0.2);
  background: rgba(15, 35, 84, 0.9);
  color: #d6e5ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.period-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.period-arrow svg {
  width: 14px;
  height: 14px;
}

.period-display {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(73, 117, 222, 0.34);
  background: linear-gradient(180deg, rgba(18, 42, 102, 0.88), rgba(9, 28, 79, 0.92));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #e8f2ff;
  font-size: 12px;
  font-weight: 600;
}

.period-separator {
  color: #7ca4ff;
}

.left-panel--overview {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 10px 10px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  background: radial-gradient(
      circle at top center,
      rgba(43, 87, 255, 0.12),
      transparent 30%
    ),
    linear-gradient(180deg, rgba(11, 26, 77, 0.96) 0%, rgba(8, 21, 63, 0.98) 100%);
}

.left-panel--overview::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.left-panel-title-wrap {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.left-panel-title {
  min-width: 0;
  width: 100%;
  height: 30px;
  border: 1px solid rgba(82, 129, 255, 0.24);
  border-radius: 10px;
  color: #ddeaff;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.04em;
  background: linear-gradient(180deg, rgba(16, 45, 117, 0.84), rgba(10, 27, 76, 0.8));
}

.overview-top-grid {
  flex-shrink: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 2px;
}

.overview-top-stat {
  position: relative;
  flex: 1 1 0;
  width: 50%;
  padding: 2px 8px;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.overview-top-stat:last-child::before {
  content: "";
  position: absolute;
  left: -4px;
  top: 6px;
  bottom: 4px;
  width: 1px;
  background: rgba(133, 163, 228, 0.22);
}

.overview-top-label {
  display: inline-block;
  color: #97aedf;
  font-size: 11px;
  white-space: nowrap;
  line-height: 1.2;
  flex-shrink: 0;
}

.overview-top-value {
  display: inline-block;
  margin-top: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}

.overview-top-value--pink {
  color: #ff8be2;
}

.overview-top-value--gold {
  color: #ffcf69;
}

.left-chart {
  width: 100%;
  min-height: 0;
}

.left-chart--gauge {
  flex-shrink: 0;
  height: 164px;
}

.gauge-chart-wrap {
  position: relative;
  flex-shrink: 0;
}

.gauge-center-caption {
  position: absolute;
  left: 50%;
  top: 14%;
  transform: translateX(-50%);
  color: #eaf3ff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
}

.gauge-center-value {
  position: absolute;
  left: 50%;
  top: 64%;
  transform: translate(-50%, 0%);
  color: #ffd36b;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  pointer-events: none;
  text-shadow: 0 0 12px rgba(255, 211, 107, 0.18);
}

.gauge-side-value {
  margin-top: 2px;
  color: #8aa4db;
}

.live-course-list {
  flex-shrink: 0;
  margin-top: 2px;
  padding: 6px 4px 4px;
  border-top: 1px solid rgba(111, 138, 214, 0.16);
  border-bottom: 1px solid rgba(111, 138, 214, 0.16);
  height: 64px;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.live-course-list::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.live-course-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 22px;
  font-size: 11px;
  color: #d7e5ff;
}

.live-course-bullet {
  width: 0;
  height: 0;
  border-left: 6px solid #a9bce9;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  flex-shrink: 0;
}

.live-course-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.live-course-status {
  color: #43e8e0;
  flex-shrink: 0;
}

.rollout-grid {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(111, 138, 214, 0.16);
}

.rollout-card {
  min-width: 0;
  position: relative;
  padding: 0 4px;
  text-align: center;
}

.rollout-card:not(:first-child)::before {
  content: "";
  position: absolute;
  left: -3px;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: rgba(125, 149, 214, 0.18);
}

.rollout-label {
  color: #8fa8dd;
  font-size: 9px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
}

.rollout-value {
  margin-top: 2px;
  font-size: 15px;
  font-weight: 700;
}

.rollout-delta {
  margin-top: 1px;
  color: #7e97cf;
  font-size: 9px;
  white-space: nowrap;
}

.rollout-rate-strip {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
  padding: 6px 2px;
}

.rollout-rate-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  min-width: 0;
}

.rollout-rate-label {
  color: #97aedf;
  font-size: 11px;
  white-space: nowrap;
  line-height: 1.2;
}

.rollout-rate-value {
  /* margin-top: 4px; */
  color: #ffd36b;
  font-size: 20px;
  font-weight: 700;
}

.rollout-rate-divider {
  width: 1px;
  height: 28px;
  background: rgba(125, 149, 214, 0.18);
  justify-self: center;
}

.works-combo-panel {
  flex-shrink: 0;
  margin-top: 8px;
  padding: 8px 0 4px;
  border-top: 1px solid rgba(111, 138, 214, 0.16);
}

.works-combo-content {
  display: grid;
  grid-template-columns: 136px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.works-ring-wrap {
  position: relative;
  width: 136px;
  height: 136px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.works-ring-center-label {
  position: absolute;
  left: 50%;
  top: 34%;
  transform: translate(-50%, 0%);
  color: #9cb3e8;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
}

.works-ring-center-value {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -6%);
  color: #ffd36b;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  text-shadow: 0 0 12px rgba(255, 211, 107, 0.18);
  pointer-events: none;
}

.works-right-side {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  min-width: 0;
}

.left-dual-charts {
  flex: 1;
  min-height: 196px;
  display: grid;
  grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
  gap: 10px;
  margin-top: 8px;
}

.mini-chart-panel {
  min-height: 0;
  border: 1px solid rgba(87, 119, 201, 0.1);
  border-radius: 12px;
  padding: 8px 8px 6px;
  background: rgba(11, 24, 67, 0.38);
  display: flex;
  flex-direction: column;
}

.mini-chart-panel--rank {
  min-height: 0;
}

.mini-chart-panel--plain {
  padding: 10px 10px 8px;
  border-color: rgba(57, 121, 221, 0.2);
  background: linear-gradient(180deg, rgba(10, 30, 86, 0.72), rgba(8, 20, 58, 0.58));
  box-shadow: inset 0 0 0 1px rgba(82, 143, 255, 0.06);
}

.mini-chart-title {
  flex-shrink: 0;
  color: #e6f0ff;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.mini-chart-title--center {
  text-align: center;
}

.mini-chart {
  width: 100%;
  min-height: 0;
  flex: 1;
}

.mini-chart--ring {
  width: 136px;
  height: 136px;
  flex: none;
}

.works-top-list {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 0;
  justify-content: center;
}

.works-top-item {
  display: grid;
  grid-template-columns: 32px 42px minmax(0, 1fr);
  gap: 6px;
  color: #c9d8fa;
  font-size: 10px;
}

.works-top-item__label {
  color: #9cb3e8;
}

.works-top-item__value {
  color: #ffd36b;
  font-weight: 700;
}

.works-top-item__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.works-legend-row {
  display: flex;
  align-items: center;
  gap: 6px 10px;
  flex-wrap: wrap;
  white-space: normal;
}

.works-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #c9d8fa;
  font-size: 10px;
  min-width: 0;
}

.works-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.center-stage,
.right-panel {
  min-width: 0;
  min-height: 0;
}

.panel {
  position: relative;
  min-height: 0;
  border-radius: 24px;
  border: 1px solid rgba(145, 178, 255, 0.16);
  background: linear-gradient(
    180deg,
    rgba(10, 23, 59, 0.88) 0%,
    rgba(7, 18, 48, 0.88) 100%
  );
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02), 0 18px 34px rgba(2, 6, 23, 0.24);
  overflow: hidden;
}

.panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(125, 140, 255, 0.3),
    rgba(53, 224, 208, 0.06),
    rgba(255, 179, 71, 0.2)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.panel-head {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 18px 0;
}

.panel-head--center {
  align-items: center;
  padding: 16px 4px 0;
}

.panel-head--right {
  align-items: center;
  padding: 18px 16px 0;
}

.panel-title {
  color: #f4f7ff;
  font-size: 18px;
  font-weight: 600;
}

.panel-subtitle {
  margin-top: 6px;
  color: #8fa4d8;
  font-size: 12px;
  line-height: 1.5;
}

.center-stage {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 88px 18px 16px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  padding-bottom: 12px;
  background:
    linear-gradient(180deg, rgba(19, 54, 150, 0.32), rgba(7, 18, 48, 0.92)),
    linear-gradient(90deg, rgba(79, 117, 220, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(79, 117, 220, 0.08) 1px, transparent 1px);
  background-size: auto, 22px 22px, 22px 22px;
}

.right-panel-link {
  color: #21d8ff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.right-panel-radar-title {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  color: #f3f7ff;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
}

.right-panel-metrics {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 4px 12px 0;
  padding-top: 10px;
  border-top: 1px solid rgba(94, 126, 225, 0.22);
}

.right-panel-metric {
  min-width: 0;
  padding: 0 12px;
}

.right-panel-metric--split {
  border-left: 1px solid rgba(94, 126, 225, 0.22);
}

.right-panel-metric__label {
  color: #d4e1ff;
  font-size: 12px;
  line-height: 1.4;
}

.right-panel-metric__value {
  margin-top: 6px;
  color: #2dd6ff;
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
}

.right-panel-metric__value--gold {
  color: #ffc83d;
}

.center-summary-row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 6px 20px 0;
}

.center-summary-card {
  position: relative;
  padding: 4px 18px 10px;
  text-align: center;
}

.center-summary-card + .center-summary-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 1px;
  background: linear-gradient(
    180deg,
    rgba(126, 167, 255, 0),
    rgba(126, 167, 255, 0.28),
    rgba(126, 167, 255, 0)
  );
}

.center-summary-card__label {
  position: relative;
  z-index: 1;
  margin-top: 6px;
  color: rgba(225, 237, 255, 0.9);
  font-size: 13px;
  font-weight: 600;
}

.center-summary-card__value {
  position: relative;
  z-index: 1;
  color: #f6fbff;
  font-size: clamp(36px, 3vw, 52px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-shadow: 0 0 18px rgba(130, 186, 255, 0.18);
}

.chart {
  width: 100%;
  min-height: 0;
  flex: 1;
}

.center-map-stage {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-top: 32px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(14, 40, 112, 0.14), rgba(9, 22, 63, 0)),
    linear-gradient(90deg, rgba(88, 130, 255, 0.06) 1px, transparent 1px),
    linear-gradient(rgba(88, 130, 255, 0.05) 1px, transparent 1px);
  background-size: auto, 14px 14px, 14px 14px;
  box-shadow: inset 0 0 0 1px rgba(103, 154, 255, 0.06);
}

.center-map-toolbar {
  position: absolute;
  top: 8px;
  left: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  pointer-events: none;
}

.center-map-toolbar__left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.center-map-corner-label {
  color: rgba(223, 239, 255, 0.92);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.center-map-corner-hint {
  color: rgba(141, 167, 222, 0.86);
  font-size: 11px;
  line-height: 1.4;
}

.map-back-button {
  pointer-events: auto;
  height: 28px;
  padding: 0 12px;
  border: 1px solid rgba(92, 172, 255, 0.32);
  border-radius: 999px;
  background: rgba(10, 27, 76, 0.82);
  color: #dbe9ff;
  font-size: 12px;
  cursor: pointer;
}

.center-map-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 50% 58%, rgba(44, 132, 255, 0.2), transparent 36%),
    linear-gradient(180deg, rgba(84, 140, 255, 0.06), rgba(84, 140, 255, 0));
  pointer-events: none;
}

.chart--map {
  position: relative;
  z-index: 1;
  height: 100%;
  min-height: 0;
}

.center-award-board {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  border: 1px solid rgba(92, 146, 255, 0.18);
  border-radius: 18px;
  padding: 10px 12px 12px;
  background: linear-gradient(180deg, rgba(10, 29, 82, 0.9), rgba(6, 18, 55, 0.92));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
}

.center-award-board__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.center-award-board__title {
  color: #f4f8ff;
  font-size: 13px;
  font-weight: 600;
}

.center-award-board__action {
  color: #39d9ff;
  font-size: 11px;
  white-space: nowrap;
}

.center-award-board__table {
  overflow-x: auto;
  scrollbar-width: none;
}

.center-award-board__table::-webkit-scrollbar {
  display: none;
}

.center-award-board__row {
  display: grid;
  grid-template-columns: 72px minmax(150px, 1.4fr) 90px minmax(108px, 1fr) 88px minmax(160px, 1.45fr) 78px;
  gap: 10px;
  align-items: center;
  min-width: 760px;
  padding: 7px 0;
}

.center-award-board__row span {
  overflow: hidden;
  color: #c8d9fb;
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.center-award-board__row--head {
  border-bottom: 1px solid rgba(111, 149, 226, 0.18);
}

.center-award-board__row--head span {
  color: #8ba5dc;
  font-size: 10px;
}

.center-award-board__row + .center-award-board__row {
  border-top: 1px solid rgba(111, 149, 226, 0.08);
}

.chart--radar {
  flex: none;
  height: 286px;
  margin-top: 6px;
}

@media (max-width: 1560px) {
  .dashboard-body {
    grid-template-columns: 350px minmax(0, 1fr) 300px;
  }
}

@media (max-width: 1280px) {
  .data-center-shell {
    padding: 16px 16px 18px;
  }

  .header-title {
    font-size: 22px;
  }

  .dashboard-body {
    grid-template-columns: 1fr;
  }

  .left-rail,
  .right-rail,
  .center-stage {
    min-height: 0;
  }

  .center-stage {
    padding-top: 92px;
  }

  .center-summary-row {
    grid-template-columns: 1fr;
    gap: 6px;
    padding-inline: 0;
  }

  .chart--map {
    min-height: 420px;
  }

  .center-award-board__row {
    min-width: 860px;
  }

}
</style>
