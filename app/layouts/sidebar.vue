<template>
  <div
    ref="sidebarShellRef"
    class="sidebar-shell"
    :style="sidebarAdaptiveStyle"
  >
    <div
      class="sidebar-shell-body"
      :class="{ 'sidebar-shell-body--page-owned-sidebar': pageOwnsSidebar }"
    >
      <!-- 固定的左侧导航 -->
      <TeacherSidebar
        v-if="!pageOwnsSidebar"
        class="hidden lg:flex flex-shrink-0"
      />

      <div class="sidebar-shell-main">
        <div class="sidebar-shell-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const sidebarShellRef = ref<HTMLElement | null>(null);
const sidebarLayoutWidth = ref(1360);
let sidebarResizeObserver: ResizeObserver | null = null;

const pageOwnedSidebarPaths = new Set([
  "/teacher",
  "/system/ai",
  "/system/opt/aiwenda",
]);

const pageOwnsSidebar = computed(() => pageOwnedSidebarPaths.has(route.path));

const getSidebarLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const shellClientWidth = sidebarShellRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth =
    outerWidth ||
    innerWidth ||
    clientWidth ||
    1360;
  const visibleWidthCandidates = [clientWidth, shellClientWidth].filter(width => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const syncSidebarLayoutWidth = () => {
  sidebarLayoutWidth.value = getSidebarLayoutWidth();
};

const sidebarShellWidth = computed(() => {
  if (sidebarLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(sidebarLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(sidebarLayoutWidth.value * 0.9))
  )}px`;
});

const sidebarAdaptiveStyle = computed(() => ({
  "--sidebar-shell-width": sidebarShellWidth.value,
}));

onMounted(() => {
  if (typeof window === "undefined") return;
  syncSidebarLayoutWidth();
  window.addEventListener("resize", syncSidebarLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncSidebarLayoutWidth);
  if (window.ResizeObserver && sidebarShellRef.value) {
    sidebarResizeObserver = new window.ResizeObserver(() => {
      syncSidebarLayoutWidth();
    });
    sidebarResizeObserver.observe(sidebarShellRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("resize", syncSidebarLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncSidebarLayoutWidth);
  sidebarResizeObserver?.disconnect();
  sidebarResizeObserver = null;
});
</script>

<style scoped>
.sidebar-shell {
  --sidebar-min-width: 1280px;
  --sidebar-max-width: 1920px;
  --sidebar-shell-width: var(--sidebar-min-width);
  --sidebar-width: 256px;
  height: 100vh;
  min-width: var(--sidebar-min-width);
  overflow-x: auto;
  overflow-y: auto;
  background: #f8f9fa;
}

.sidebar-shell::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar-shell::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-shell::-webkit-scrollbar-thumb {
  background-color: rgba(174, 179, 181, 0.3);
  border-radius: 3px;
}

.sidebar-shell::-webkit-scrollbar-thumb:hover {
  background-color: rgba(174, 179, 181, 0.5);
}

.sidebar-shell-body {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100%;
  box-sizing: border-box;
  width: min(
    var(--sidebar-max-width),
    max(var(--sidebar-min-width), var(--sidebar-shell-width))
  );
  min-width: var(--sidebar-min-width);
  margin: 0 auto;
  background: #f8f9fa;
}

.sidebar-shell-body--page-owned-sidebar {
  display: block;
}

.sidebar-shell-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: visible;
  margin-right: 0;
}

.sidebar-shell-content {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: visible;
}

@media (min-width: 1024px) {
}

@media (min-width: 1280px) {
}

@media (min-width: 1536px) {
}
</style>
