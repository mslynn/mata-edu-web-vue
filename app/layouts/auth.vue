<template>
  <div ref="authLayoutRef" class="auth-shell" :style="pageAdaptiveStyle">
    <div class="auth-shell__stage">
      <main class="auth-shell__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const authLayoutRef = ref<HTMLElement | null>(null);
const authLayoutWidth = ref(1360);
let authResizeObserver: ResizeObserver | null = null;

const getAuthLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const layoutClientWidth = authLayoutRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, layoutClientWidth].filter(width => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const syncAuthLayoutWidth = () => {
  authLayoutWidth.value = getAuthLayoutWidth();
};

const authShellWidth = computed(() => {
  if (authLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(authLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(authLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--auth-shell-width": authShellWidth.value,
}));

onMounted(() => {
  syncAuthLayoutWidth();
  window.addEventListener("resize", syncAuthLayoutWidth);
  if (typeof ResizeObserver !== "undefined") {
    authResizeObserver = new ResizeObserver(() => {
      syncAuthLayoutWidth();
    });
    if (authLayoutRef.value) {
      authResizeObserver.observe(authLayoutRef.value);
    }
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", syncAuthLayoutWidth);
  }
  authResizeObserver?.disconnect();
  authResizeObserver = null;
});
</script>

<style scoped>
.auth-shell {
  --auth-min-width: 1280px;
  --auth-max-width: 1920px;
  --auth-shell-width: var(--auth-min-width);
  min-width: 0;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #ffffff;
  color: #182132;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
}

.auth-shell__stage {
  width: min(100%, 1600px);
  min-height: 100vh;
  margin: 0 auto;
  padding: clamp(18px, 3vh, 40px) clamp(18px, 3vw, 40px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.auth-shell__main {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
