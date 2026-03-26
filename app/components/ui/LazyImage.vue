<template>
  <span ref="containerRef" :class="['lazy-image-shell', wrapperClass]">
    <img
      v-if="visible"
      :src="src"
      :alt="alt"
      :class="imgClass"
      loading="lazy"
      decoding="async"
      fetchpriority="low"
    />
  </span>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

defineProps<{
  src: string;
  alt?: string;
  imgClass?: string;
  wrapperClass?: string;
}>();

const visible = ref(false);
const containerRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!("IntersectionObserver" in window) || !containerRef.value) {
    visible.value = true;
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (!entry?.isIntersecting) return;
      visible.value = true;
      observer?.disconnect();
      observer = null;
    },
    {
      rootMargin: "240px 0px",
      threshold: 0.01,
    }
  );

  observer.observe(containerRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<style scoped>
.lazy-image-shell {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}
</style>
