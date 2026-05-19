<template>
  <div class="hand-intro-page">
    <div class="hand-intro-shell">
      <div class="hand-intro-breadcrumb">
        <button type="button" class="hand-intro-breadcrumb__link" @click="handleBackToAiCenter">
          AI 实践中心
        </button>
        <span>/</span>
        <span class="hand-intro-breadcrumb__current">手势识别</span>
      </div>

      <main class="hand-intro-stage">
        <section class="hand-intro-hero">
          <div class="hand-intro-copy">
            <div class="hand-intro-copy__stack">
              <div class="hand-intro-copy__card">
                <h1>
                  <span class="hand-intro-copy__title-line hand-intro-copy__title-line--accent">手势识别</span>
                </h1>
                <p>
                  基于 MediaPipe 深度学习模型，实时检测手部 21 个关键点，精准识别多种手势动作。支持握拳、张开手掌、比V、竖大拇指等常见手势，让 AI「看懂」你的手语。
                </p>
              </div>

              <button
                type="button"
                class="hand-intro-copy__action"
                @click="handleStartExperience"
              >
                <span>立即开始体验</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span class="hand-intro-copy__action-shine"></span>
              </button>
            </div>
          </div>

          <div class="hand-intro-visual">
            <div class="hand-intro-visual__glow hand-intro-visual__glow--top"></div>
            <div class="hand-intro-visual__glow hand-intro-visual__glow--bottom"></div>
            <div class="hand-intro-visual-card">
              <div class="hand-intro-visual-card__hand-svg">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="160" r="8" fill="#4f75ff" opacity="0.9">
                    <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <line x1="100" y1="160" x2="80" y2="120" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="100" y1="160" x2="100" y2="110" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="100" y1="160" x2="120" y2="115" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="100" y1="160" x2="135" y2="125" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="100" y1="160" x2="65" y2="135" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="80" y1="120" x2="70" y2="80" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="100" y1="110" x2="100" y2="55" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="120" y1="115" x2="125" y2="60" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="135" y1="125" x2="145" y2="80" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <line x1="65" y1="135" x2="45" y2="120" stroke="#4f75ff" stroke-width="2.5" opacity="0.7" />
                  <circle cx="70" cy="80" r="5" fill="#7bd5ff">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="100" cy="55" r="5" fill="#7bd5ff">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" begin="0.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="125" cy="60" r="5" fill="#7bd5ff">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" begin="0.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="145" cy="80" r="5" fill="#7bd5ff">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="45" cy="120" r="5" fill="#7bd5ff">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" begin="0.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="80" cy="120" r="4" fill="#4f75ff" />
                  <circle cx="100" cy="110" r="4" fill="#4f75ff" />
                  <circle cx="120" cy="115" r="4" fill="#4f75ff" />
                  <circle cx="135" cy="125" r="4" fill="#4f75ff" />
                  <circle cx="65" cy="135" r="4" fill="#4f75ff" />
                </svg>
              </div>
              <div class="hand-intro-visual-card__grid"></div>
              <div class="hand-intro-visual-card__scanline"></div>

              <div class="hand-intro-visual-card__badge">
                <span class="hand-intro-visual-card__badge-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 11.5V14m0-2.5v-3a1.5 1.5 0 0 1 3 0m-3 3a1.5 1.5 0 0 0-3 0v2.5a6.5 6.5 0 0 0 13 0V9a1.5 1.5 0 0 0-3 0m-4-0.5v-3a1.5 1.5 0 0 1 3 0v3m-3 0v1m3-1v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <div>
                  <strong>手势已识别</strong>
                  <span>21 个关键点</span>
                </div>
              </div>

              <div class="hand-intro-visual-card__panel">
                <div class="hand-intro-visual-card__panel-head">
                  <div class="hand-intro-visual-card__panel-copy">
                    <span class="hand-intro-visual-card__panel-label">手势分析</span>
                    <strong>✌️ Victory</strong>
                  </div>
                  <span class="hand-intro-visual-card__panel-side">置信度</span>
                </div>
                <div class="hand-intro-visual-card__progress">
                  <span></span>
                </div>
                <div class="hand-intro-visual-card__panel-tags">
                  <span><i></i>关键点追踪</span>
                  <span><i></i>实时检测</span>
                </div>
              </div>

              <span class="hand-intro-visual-card__corner hand-intro-visual-card__corner--top-left"></span>
              <span class="hand-intro-visual-card__corner hand-intro-visual-card__corner--top-right"></span>
              <span class="hand-intro-visual-card__corner hand-intro-visual-card__corner--bottom-left"></span>
              <span class="hand-intro-visual-card__corner hand-intro-visual-card__corner--bottom-right"></span>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "手势识别",
});

const handleStartExperience = async () => {
  await navigateTo("/system/opt/hand/experience");
};

const handleBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};
</script>

<style scoped>
.hand-intro-page {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  color: #163257;
}

.hand-intro-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 48px 24px 24px;
  box-sizing: border-box;
}

.hand-intro-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1480px;
  color: #adb7d3;
  font-size: 12px;
  font-weight: 500;
}

.hand-intro-breadcrumb span {
  color: #c5cce0;
}

.hand-intro-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #c5cce0;
  font-size: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.hand-intro-breadcrumb__link:hover {
  color: #8ea3ff;
}

.hand-intro-breadcrumb__current {
  color: #6d7eff !important;
  font-weight: 600;
}

.hand-intro-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hand-intro-hero {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(40px, 6vw, 100px);
  margin: 0 auto;
  width: 100%;
  max-width: 1480px;
  min-height: 0;
}

.hand-intro-copy {
  display: flex;
  justify-content: center;
  flex: 0 1 520px;
}

.hand-intro-copy__stack {
  max-width: 620px;
}

.hand-intro-copy__card {
  margin-top: 26px;
}

.hand-intro-copy__card h1 {
  margin: 0;
  font-size: clamp(42px, 4.15vw, 60px);
  line-height: 1.04;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.hand-intro-copy__title-line {
  display: block;
  white-space: nowrap;
}

.hand-intro-copy__title-line--accent {
  margin-top: 4px;
  background: linear-gradient(135deg, #5370ff 0%, #3f72ff 58%, #6f90ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.hand-intro-copy__card p {
  margin: 24px 0 0;
  max-width: 560px;
  font-size: clamp(14px, 1.15vw, 17px);
  line-height: 1.9;
  color: #7080a3;
}

.hand-intro-copy__action {
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-width: 182px;
  height: 56px;
  margin-top: 38px;
  padding: 0 24px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #6580ff 0%, #4f68fb 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 18px 34px rgba(80, 106, 252, 0.28);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hand-intro-copy__action:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 40px rgba(74, 103, 255, 0.32);
}

.hand-intro-copy__action svg,
.hand-intro-copy__action > span:first-child {
  position: relative;
  z-index: 1;
}

.hand-intro-copy__action svg {
  width: 16px;
  height: 16px;
}

.hand-intro-copy__action-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(255,255,255,0) 12%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 88%);
  transform: translateX(-120%);
  transition: transform 0.7s ease;
}

.hand-intro-copy__action:hover .hand-intro-copy__action-shine {
  transform: translateX(120%);
}

.hand-intro-visual {
  position: relative;
  width: 100%;
  flex: 0 0 520px;
  max-width: 520px;
}

.hand-intro-visual__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

.hand-intro-visual__glow--top {
  top: -6%;
  right: -10%;
  width: 40%;
  aspect-ratio: 1;
  background: rgba(79, 117, 255, 0.14);
}

.hand-intro-visual__glow--bottom {
  left: -10%;
  bottom: -10%;
  width: 48%;
  aspect-ratio: 1;
  background: rgba(79, 117, 255, 0.16);
}

.hand-intro-visual-card {
  position: relative;
  z-index: 1;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 34px;
  overflow: hidden;
  background: #020712;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 34px 90px -28px rgba(79, 117, 255, 0.28);
}

.hand-intro-visual-card__hand-svg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hand-intro-visual-card__hand-svg svg {
  width: 70%;
  height: 70%;
}

.hand-intro-visual-card__grid {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  z-index: 1;
}

.hand-intro-visual-card__scanline {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(79,117,255,0) 0%, #4f75ff 50%, rgba(79,117,255,0) 100%);
  box-shadow: 0 0 20px #4f75ff;
  z-index: 2;
  animation: hand-intro-scan 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.hand-intro-visual-card__badge,
.hand-intro-visual-card__panel {
  position: absolute;
  z-index: 4;
  color: #ffffff;
  backdrop-filter: blur(18px);
}

.hand-intro-visual-card__badge {
  top: 26px;
  left: 26px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(18, 28, 58, 0.82);
  border: 1px solid rgba(79, 117, 255, 0.24);
  box-shadow: 0 16px 32px rgba(16, 24, 48, 0.22);
}

.hand-intro-visual-card__badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #4f75ff;
  box-shadow: 0 8px 18px rgba(79, 117, 255, 0.26);
}

.hand-intro-visual-card__badge-icon svg {
  width: 16px;
  height: 16px;
  color: #fff;
}

.hand-intro-visual-card__badge strong {
  display: block;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.1;
}

.hand-intro-visual-card__badge span {
  display: block;
  margin-top: 2px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
}

.hand-intro-visual-card__panel {
  right: 24px;
  bottom: 24px;
  min-width: 200px;
  padding: 16px 18px 18px;
  border-radius: 18px;
  background: rgba(16, 24, 48, 0.88);
  border: 1px solid rgba(92, 112, 198, 0.2);
  box-shadow: 0 18px 36px rgba(8, 15, 35, 0.28);
}

.hand-intro-visual-card__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.hand-intro-visual-card__panel-label {
  display: block;
  font-size: 9px;
  font-weight: 800;
  color: #5575ff;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hand-intro-visual-card__panel-side {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  padding-bottom: 2px;
}

.hand-intro-visual-card__panel strong {
  display: block;
  margin-top: 8px;
  font-size: 22px;
  line-height: 1;
  font-weight: 800;
}

.hand-intro-visual-card__progress {
  margin-top: 14px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.hand-intro-visual-card__progress span {
  display: block;
  width: 93%;
  height: 100%;
  background: linear-gradient(90deg, #4f73ff 0%, #7bd5ff 100%);
  box-shadow: 0 0 18px rgba(123, 213, 255, 0.4);
  animation: hand-intro-progress 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.hand-intro-visual-card__panel-tags {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.hand-intro-visual-card__panel-tags span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.72);
  font-size: 9px;
  font-weight: 700;
}

.hand-intro-visual-card__panel-tags span i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

.hand-intro-visual-card__corner {
  position: absolute;
  width: 42px;
  height: 42px;
  border-color: rgba(79, 117, 255, 0.5);
  border-style: solid;
  z-index: 4;
}

.hand-intro-visual-card__corner--top-left {
  top: 26px; left: 26px;
  border-width: 2px 0 0 2px;
  border-top-left-radius: 14px;
}

.hand-intro-visual-card__corner--top-right {
  top: 26px; right: 26px;
  border-width: 2px 2px 0 0;
  border-top-right-radius: 14px;
}

.hand-intro-visual-card__corner--bottom-left {
  bottom: 26px; left: 26px;
  border-width: 0 0 2px 2px;
  border-bottom-left-radius: 14px;
}

.hand-intro-visual-card__corner--bottom-right {
  right: 26px; bottom: 26px;
  border-width: 0 2px 2px 0;
  border-bottom-right-radius: 14px;
}

@keyframes hand-intro-scan {
  0% { top: 5%; opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { top: 95%; opacity: 0; }
}

@keyframes hand-intro-progress {
  0% { width: 0%; }
  100% { width: 93%; }
}

@media (max-width: 1500px) {
  .hand-intro-shell { padding: 22px 20px 20px; }
  .hand-intro-hero { gap: 40px; }
  .hand-intro-copy { flex: 0 1 420px; }
  .hand-intro-visual { flex: 0 0 460px; max-width: 460px; }
}

@media (max-width: 1300px) {
  .hand-intro-shell { padding: 18px 20px 18px; }
  .hand-intro-hero {
    flex-direction: column;
    gap: 40px;
    text-align: center;
  }
  .hand-intro-copy { flex: none; max-width: 100%; }
  .hand-intro-visual { flex: none; max-width: 400px; }
  .hand-intro-copy__card h1 { font-size: 38px; }
  .hand-intro-copy__card p { max-width: 420px; font-size: 14px; line-height: 1.8; }
}
</style>