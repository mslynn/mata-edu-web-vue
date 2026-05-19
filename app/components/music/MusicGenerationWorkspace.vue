<template>
  <section class="music-workspace">
    <div class="music-compose">
      <article class="music-card music-card--prompt" :class="{ 'is-generating': songGenerating }">
        <div class="music-card__header">
          <span class="music-card__icon material-symbols-outlined">auto_fix_high</span>
          <div>
            <h2>{{ t("music.promptCardTitle") }}</h2>
            <p>{{ t("music.promptCardDesc") }}</p>
          </div>
        </div>

        <label class="music-field">
          <span>{{ t("music.promptFieldLabel") }}</span>
          <textarea
            v-model="promptModel"
            class="music-textarea music-textarea--large"
            :disabled="songGenerating"
            :placeholder="t('music.promptPlaceholder')"
          ></textarea>
        </label>

        <div class="music-tags">
          <button
            v-for="tag in promptTags"
            :key="tag"
            type="button"
            class="music-tag"
            :disabled="songGenerating"
            @click="emit('append-tag', tag)"
          >
            # {{ tag }}
          </button>
        </div>
      </article>

      <article class="music-card" :class="{ 'is-generating': songGenerating }">
        <div class="music-card__header">
          <span class="music-card__icon music-card__icon--rose material-symbols-outlined">
            edit_note
          </span>
          <div>
            <h2>{{ t("music.lyricsCardTitle") }}</h2>
            <p>{{ t("music.lyricsCardDesc") }}</p>
          </div>
        </div>

        <label class="music-field">
          <span>{{ t("music.songNameLabel") }}</span>
          <input
            v-model="songTitleModel"
            class="music-input"
            type="text"
            :disabled="songGenerating"
            :placeholder="t('music.songNamePlaceholder')"
          />
        </label>

        <div class="music-field-group">
          <div class="music-field-group__head">
            <span>{{ t("music.lyricsLabel") }}</span>
            <button
              type="button"
              class="music-link-button"
              :disabled="lyricsGenerating || songGenerating"
              @click="emit('generate-lyrics')"
            >
              <span class="material-symbols-outlined">bolt</span>
              <span>{{ lyricsGenerating ? "生成中..." : t("music.aiFillLyrics") }}</span>
            </button>
          </div>
          <textarea
            v-model="lyricsModel"
            class="music-textarea music-textarea--lyrics"
            :disabled="songGenerating"
            :placeholder="t('music.lyricsPlaceholder')"
          ></textarea>
        </div>
      </article>

      <div class="music-generate" :class="{ 'is-generating': songGenerating }">
        <button
          type="button"
          class="music-hero__button"
          :disabled="songGenerating"
          @click="emit('generate-song')"
        >
          <span>{{ songGenerating ? "生成中..." : t("music.generateMusic") }}</span>
          <span class="material-symbols-outlined">play_circle</span>
        </button>
        <div v-if="songGenerating" class="music-generate-status" aria-live="polite">
          <div class="music-notes" aria-hidden="true">
            <span class="music-note music-note--one">♪</span>
            <span class="music-note music-note--two">♫</span>
            <span class="music-note music-note--three">♪</span>
            <span class="music-note music-note--four">♬</span>
          </div>
          <span class="music-generate-status__text">AI 正在编排旋律与节奏...</span>
        </div>
        <p>{{ songGenerateHint }}</p>
      </div>
    </div>

    <aside class="music-params">
      <div class="music-card music-card--sticky" :class="{ 'is-generating': songGenerating }">
        <div class="music-card__header">
          <span class="music-card__icon music-card__icon--green material-symbols-outlined">
            tune
          </span>
          <div>
            <h2>{{ t("music.paramsTitle") }}</h2>
            <p>{{ t("music.paramsDesc") }}</p>
          </div>
        </div>

        <div class="music-param-group">
          <h3>{{ t("music.musicStyleLabel") }} <span v-if="t('music.musicStyleSub')">{{ t("music.musicStyleSub") }}</span></h3>
          <div class="music-chip-list">
            <button
              v-for="item in styleOptions"
              :key="item.key"
              type="button"
              class="music-chip"
              :disabled="songGenerating"
              :class="{ 'is-active': selectedStyleModel === item.key }"
              @click="selectedStyleModel = item.key"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="music-param-group">
          <h3>{{ t("music.emotionLabel") }} <span v-if="t('music.emotionSub')">{{ t("music.emotionSub") }}</span></h3>
          <div class="music-chip-list">
            <button
              v-for="item in emotionOptions"
              :key="item.key"
              type="button"
              class="music-chip"
              :disabled="songGenerating"
              :class="{ 'is-active': selectedEmotionModel === item.key }"
              @click="selectedEmotionModel = item.key"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="music-param-group">
          <h3>{{ t("music.sceneLabel") }} <span v-if="t('music.sceneSub')">{{ t("music.sceneSub") }}</span></h3>
          <div class="music-chip-list">
            <button
              v-for="item in sceneOptions"
              :key="item.key"
              type="button"
              class="music-chip"
              :disabled="songGenerating"
              :class="{ 'is-active': selectedSceneModel === item.key }"
              @click="selectedSceneModel = item.key"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface MusicOption {
  key: string;
  label: string;
}

const props = defineProps<{
  prompt: string;
  songTitle: string;
  lyrics: string;
  lyricsGenerating: boolean;
  songGenerating: boolean;
  songGenerateHint: string;
  promptTags: string[];
  styleOptions: MusicOption[];
  emotionOptions: MusicOption[];
  sceneOptions: MusicOption[];
  selectedStyle: string;
  selectedEmotion: string;
  selectedScene: string;
}>();

const emit = defineEmits<{
  (event: "update:prompt", value: string): void;
  (event: "update:songTitle", value: string): void;
  (event: "update:lyrics", value: string): void;
  (event: "update:selectedStyle", value: string): void;
  (event: "update:selectedEmotion", value: string): void;
  (event: "update:selectedScene", value: string): void;
  (event: "append-tag", value: string): void;
  (event: "generate-lyrics"): void;
  (event: "generate-song"): void;
}>();

const { t } = useI18n();

const promptModel = computed({
  get: () => props.prompt,
  set: (value: string) => emit("update:prompt", value),
});

const songTitleModel = computed({
  get: () => props.songTitle,
  set: (value: string) => emit("update:songTitle", value),
});

const lyricsModel = computed({
  get: () => props.lyrics,
  set: (value: string) => emit("update:lyrics", value),
});

const selectedStyleModel = computed({
  get: () => props.selectedStyle,
  set: (value: string) => emit("update:selectedStyle", value),
});

const selectedEmotionModel = computed({
  get: () => props.selectedEmotion,
  set: (value: string) => emit("update:selectedEmotion", value),
});

const selectedSceneModel = computed({
  get: () => props.selectedScene,
  set: (value: string) => emit("update:selectedScene", value),
});
</script>

<style scoped>
@font-face {
  font-family: "Material Symbols Outlined Full";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("/fonts/material-symbols-outlined-full.ttf") format("truetype");
}

.material-symbols-outlined {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  overflow: hidden;
  font-family: "Material Symbols Outlined Full";
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}

.music-workspace {
  display: grid;
  grid-template-columns: minmax(0, 2.65fr) minmax(320px, 0.92fr);
  gap: 24px;
  align-items: start;
}

.music-compose {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.music-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.045);
  padding: 24px 26px;
}

.music-card.is-generating::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.4) 0%, rgba(236, 242, 249, 0.68) 100%);
  pointer-events: none;
  z-index: 0;
}

.music-card--prompt::after {
  content: "";
  position: absolute;
  top: -30px;
  right: -30px;
  width: 118px;
  height: 118px;
  border-radius: 0 0 0 72px;
  background: rgba(165, 193, 255, 0.28);
  pointer-events: none;
  transition: transform 0.45s ease;
}

.music-card--prompt:hover::after {
  transform: scale(1.08);
}

.music-card--sticky {
  position: sticky;
  top: 20px;
}

.music-card__header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.music-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: #a5c1ff;
  color: #003a81;
  font-size: 24px;
}

.music-card__icon--rose {
  background: #ffd8e7;
  color: #942265;
}

.music-card__icon--green {
  background: #69f6b8;
  color: #005a3c;
}

.music-card__header h2 {
  margin: 0;
  color: #2d3337;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.music-card__header p {
  margin: 4px 0 0;
  color: #697276;
  font-size: 12px;
  line-height: 1.55;
}

.music-field {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.music-field > span {
  color: #596063;
  font-size: 12px;
  font-weight: 800;
}

.music-input,
.music-textarea {
  width: 100%;
  border: 0;
  border-radius: 18px;
  background: #f5f8fb;
  color: #2d3337;
  font: inherit;
  outline: none;
  box-sizing: border-box;
  box-shadow: inset 0 0 0 1px #dfe7f2;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.music-input {
  height: 54px;
  padding: 0 22px;
  font-size: 15px;
  font-weight: 600;
}

.music-textarea {
  min-height: 138px;
  padding: 18px 20px;
  resize: vertical;
  line-height: 1.72;
}

.music-textarea--large {
  min-height: 120px;
  font-size: 15px;
}

.music-textarea--lyrics {
  min-height: 150px;
}

.music-input:focus,
.music-textarea:focus {
  background: #ffffff;
  box-shadow:
    inset 0 0 0 1px rgba(0, 91, 194, 0.34),
    0 0 0 4px rgba(0, 91, 194, 0.08);
}

.music-input:disabled,
.music-textarea:disabled {
  cursor: not-allowed;
  color: #8f9baa;
  background: #edf2f7;
  box-shadow: inset 0 0 0 1px #e3e9f1;
}

.music-input:disabled::placeholder,
.music-textarea:disabled::placeholder {
  color: #a7b2c2;
}

.music-tags,
.music-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.music-tags {
  position: relative;
  z-index: 1;
  margin-top: 16px;
}

.music-tag,
.music-chip {
  border: 0;
  border-radius: 999px;
  background: #eaeef1;
  color: #596063;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.music-tag {
  min-height: 32px;
  padding: 0 16px;
}

.music-tag:hover,
.music-chip:hover {
  transform: translateY(-1px);
  background: #dde3e7;
  color: #2d3337;
}

.music-tag:disabled,
.music-chip:disabled {
  cursor: not-allowed;
  opacity: 0.52;
  transform: none;
  background: #e8edf2;
  color: #98a5b6;
}

.music-link-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 3px 0;
  border: 0;
  background: transparent;
  color: #005bc2;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.music-link-button:hover {
  transform: translateY(-1px);
  opacity: 0.88;
}

.music-link-button:disabled {
  cursor: not-allowed;
  color: #92a3bf;
  opacity: 0.74;
  transform: none;
}

.music-link-button .material-symbols-outlined {
  font-size: 18px;
}

.music-field-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.music-field-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 24px;
}

.music-field-group__head > span {
  color: #596063;
  font-size: 12px;
  font-weight: 800;
}

.music-generate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}

.music-generate.is-generating {
  margin-top: 12px;
  padding: 16px 18px 10px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(238, 244, 255, 0.92) 100%);
  box-shadow: inset 0 0 0 1px rgba(165, 193, 255, 0.4);
}

.music-hero__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: 12px;
  min-width: 220px;
  height: 52px;
  padding: 0 32px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #005bc2 0%, #004fad 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  box-shadow: 0 14px 28px rgba(0, 91, 194, 0.22);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.music-hero__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 34px rgba(0, 91, 194, 0.28);
}

.music-hero__button:disabled {
  cursor: not-allowed;
  transform: none;
  background: linear-gradient(135deg, #6b95d8 0%, #4a7ac7 100%);
  box-shadow: 0 10px 22px rgba(74, 122, 199, 0.2);
}

.music-generate-status {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 28px;
  padding: 2px 14px;
  border-radius: 999px;
  background: rgba(0, 91, 194, 0.08);
  color: #005bc2;
}

.music-generate-status__text {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.music-notes {
  display: inline-flex;
  align-items: flex-end;
  gap: 6px;
  min-width: 52px;
}

.music-note {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #005bc2;
  line-height: 1;
  opacity: 0.34;
  transform: translateY(0) scale(0.92);
  animation: music-note-bounce 1.5s ease-in-out infinite;
}

.music-note--one {
  font-size: 16px;
  animation-delay: 0s;
}

.music-note--two {
  font-size: 20px;
  animation-delay: 0.18s;
}

.music-note--three {
  font-size: 17px;
  animation-delay: 0.36s;
}

.music-note--four {
  font-size: 21px;
  animation-delay: 0.54s;
}

.music-generate p {
  margin: 0;
  color: #97a3b8;
  font-size: 11px;
  font-weight: 600;
}

.music-param-group + .music-param-group {
  margin-top: 24px;
}

.music-param-group h3 {
  margin: 0 0 12px;
  color: #2d3337;
  font-size: 13px;
  font-weight: 900;
}

.music-param-group h3 span {
  color: #8a9499;
  font-size: 12px;
  font-weight: 700;
}

.music-chip {
  min-height: 34px;
  padding: 0 13px;
  border-radius: 12px;
}

.music-chip.is-active {
  background: #005bc2;
  color: #ffffff;
}

.music-chip.is-active:disabled {
  background: #7fa8de;
  color: #ffffff;
}

@keyframes music-note-bounce {
  0%,
  100% {
    opacity: 0.32;
    transform: translateY(8px) scale(0.9) rotate(-8deg);
  }
  35% {
    opacity: 1;
    transform: translateY(-8px) scale(1.08) rotate(3deg);
  }
  60% {
    opacity: 0.7;
    transform: translateY(2px) scale(0.98) rotate(-2deg);
  }
}

@media (max-width: 1500px) {
  .music-workspace {
    grid-template-columns: minmax(0, 2.35fr) minmax(300px, 0.92fr);
    gap: 24px;
  }

  .music-card {
    padding: 22px;
  }
}

@media (max-width: 1280px) {
  .music-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .music-card--sticky {
    position: static;
  }
}
</style>
