<template>
  <div class="ai-song-task-workbench">
    <button
      v-if="currentWork"
      type="button"
      class="ai-song-task-workbench__back"
      @click="handleBack"
      aria-label="返回上一步"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <MusicPlayerPage
      v-if="currentWork"
      embedded
      :work="currentWork"
      @back="handleBack"
      @deleted="handleDeleted"
    />
    <MusicPage
      v-else
      embedded
      @open-player="handleOpenPlayer"
      @song-ready="handleSongReady"
    />
  </div>
</template>

<script setup lang="ts">
import MusicPage from "~/pages/system/opt/music/index.vue";
import MusicPlayerPage from "~/pages/system/opt/music/player.vue";

type MusicTaskWork = {
  songId?: string;
  title: string;
  badge?: string;
  style: string;
  date: string;
  accent: string;
  cover: string;
  audioUrl?: string;
  lyricsContent?: string;
  taskStatus?: string;
};

const currentWork = ref<MusicTaskWork | null>(null);

const handleOpenPlayer = (payload: { work: MusicTaskWork }) => {
  currentWork.value = payload.work;
};

const handleSongReady = (payload: { songId: string; work: MusicTaskWork | null }) => {
  if (payload.work) {
    currentWork.value = payload.work;
    return;
  }

  currentWork.value = {
    songId: payload.songId,
    title: "AI歌曲作品",
    badge: "已完成",
    style: "POP",
    date: new Date().toISOString().slice(0, 10),
    accent: "#005bc2",
    cover: "/images/ai-practice/practice-23-7c2c96bc.webp",
  };
};

const handleBack = () => {
  currentWork.value = null;
};

const handleDeleted = () => {
  currentWork.value = null;
};
</script>

<style scoped>
.ai-song-task-workbench {
  position: relative;
  min-height: 0;
  height: 100%;
}

.ai-song-task-workbench__back {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #1d4f91;
  box-shadow: 0 6px 18px rgba(31, 79, 145, 0.1);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.ai-song-task-workbench__back:hover {
  background: #f4f8ff;
  border-color: #93c5fd;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(31, 79, 145, 0.16);
}

.ai-song-task-workbench__back svg {
  width: 18px;
  height: 18px;
}
</style>
