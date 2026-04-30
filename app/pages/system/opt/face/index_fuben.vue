<!--
 * @Author: your name
 * @Date: 2026-04-16 10:32:36
 * @LastEditTime: 2026-04-16 10:32:36
 * @LastEditors: lynn
 * @Description: In User Settings Edit
 * @FilePath: \mata-edu-web\app\pages\system\ai\face\index_fuben.vue
-->
<template>
  <div class="face-intro-page">
    <div class="face-intro-shell">
      <div class="face-intro-breadcrumb">
        AI实践中心
        <span>/</span>
        <span class="face-intro-breadcrumb__current">人脸识别</span>
      </div>

      <main class="face-intro-stage">
        <section class="face-intro-hero">
          <div class="face-intro-copy">
            <div class="face-intro-copy__stack">
              <span class="face-intro-copy__eyebrow">视觉智能系统</span>
              <div class="face-intro-copy__card">
                <h1>
                  <span class="face-intro-copy__title-line">开启智慧校园的</span>
                  <span
                    class="face-intro-copy__title-line face-intro-copy__title-line--accent"
                  >
                    非感官视觉门户
                  </span>
                </h1>
                <p>
                  基于最先进的深度学习算法，实现毫秒级响应的学生识别与管理。为您打造无感考勤、
                  安全门禁、课堂参与度分析等全场景智能闭环。
                </p>
              </div>

              <button
                type="button"
                class="face-intro-copy__action"
                @click="handleStartExperience"
              >
                <span>立即开始体验</span>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                  <path
                    d="M13 6l6 6-6 6"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="face-intro-copy__action-shine"></span>
              </button>
            </div>
          </div>

          <div class="face-intro-visual">
            <div class="face-intro-visual__glow face-intro-visual__glow--top"></div>
            <div class="face-intro-visual__glow face-intro-visual__glow--bottom"></div>
            <div class="face-intro-visual-card">
              <img
                class="face-intro-visual-card__portrait"
                src="/face-demo/stitch-hero-main.jpg"
                alt="人脸识别演示人物"
              />
              <div class="face-intro-visual-card__grid"></div>
              <div class="face-intro-visual-card__scanline"></div>
              <span
                class="face-intro-visual-card__point face-intro-visual-card__point--left-eye"
              ></span>
              <span
                class="face-intro-visual-card__point face-intro-visual-card__point--right-eye"
              ></span>
              <span
                class="face-intro-visual-card__point face-intro-visual-card__point--nose"
              ></span>
              <span
                class="face-intro-visual-card__point face-intro-visual-card__point--left-mouth"
              ></span>
              <span
                class="face-intro-visual-card__point face-intro-visual-card__point--right-mouth"
              ></span>

              <div class="face-intro-visual-card__badge">
                <span class="face-intro-visual-card__badge-icon">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 3l6.5 2.6V11c0 4.5-2.8 8.5-6.5 10-3.7-1.5-6.5-5.5-6.5-10V5.6L12 3Z"
                      fill="currentColor"
                    />
                    <path
                      d="M9.5 12.2l1.7 1.7 3.5-3.8"
                      stroke="#ffffff"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <strong>身份已验证</strong>
                  <span>准入权限：全校区</span>
                </div>
              </div>

              <div class="face-intro-visual-card__panel">
                <div class="face-intro-visual-card__panel-head">
                  <div class="face-intro-visual-card__panel-copy">
                    <span class="face-intro-visual-card__panel-label">生物特征分析</span>
                    <strong>99.8%</strong>
                  </div>
                  <span class="face-intro-visual-card__panel-side">匹配度</span>
                </div>
                <div class="face-intro-visual-card__progress">
                  <span></span>
                </div>
                <div class="face-intro-visual-card__panel-tags">
                  <span><i></i>骨骼对齐</span>
                  <span><i></i>活体检测</span>
                </div>
              </div>

              <span
                class="face-intro-visual-card__corner face-intro-visual-card__corner--top-left"
              ></span>
              <span
                class="face-intro-visual-card__corner face-intro-visual-card__corner--top-right"
              ></span>
              <span
                class="face-intro-visual-card__corner face-intro-visual-card__corner--bottom-left"
              ></span>
              <span
                class="face-intro-visual-card__corner face-intro-visual-card__corner--bottom-right"
              ></span>
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
  title: "人脸识别体验",
  htmlAttrs: {
    lang: "zh-CN",
  },
});

const handleStartExperience = async () => {
  await navigateTo("/system/ai/face/experience2");
};
</script>

<style scoped>
.face-intro-page {
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  color: #163257;
  /* background: linear-gradient(180deg, #fbfbff 0%, #f8f9fe 52%, #f9fafc 100%); */
}

.face-intro-shell {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 48px 24px 24px;
  box-sizing: border-box;
}

.face-intro-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  /* margin: 0 auto clamp(20px, 2.5vw, 40px); */
  max-width: 1480px;
  color: #adb7d3;
  font-size: 12px;
  font-weight: 500;
}

.face-intro-breadcrumb span {
  color: #c5cce0;
}

.face-intro-breadcrumb__current {
  color: #6d7eff !important;
  font-weight: 600;
}

.face-intro-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.face-intro-hero {
  /* width: 100%; */
  max-width: 1480px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(480px, 1fr) minmax(360px, 520px);
  gap: clamp(16px, 1.8vw, 28px);
  align-items: center;
  min-height: 0;
}

.face-intro-copy {
  display: flex;
  justify-content: center;
}

.face-intro-copy__stack {
  max-width: 620px;
}

.face-intro-copy__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(93, 122, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(93, 122, 255, 0.16);
  color: #5f76ff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.face-intro-copy__card {
  margin-top: 26px;
}

.face-intro-copy__card h1 {
  margin: 0;
  font-size: clamp(42px, 4.15vw, 60px);
  line-height: 1.04;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: #121d39;
}

.face-intro-copy__title-line {
  display: block;
  white-space: nowrap;
}

.face-intro-copy__title-line--accent {
  margin-top: 4px;
  background: linear-gradient(135deg, #5370ff 0%, #3f72ff 58%, #6f90ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.face-intro-copy__card p {
  margin: 24px 0 0;
  max-width: 560px;
  font-size: clamp(14px, 1.15vw, 17px);
  line-height: 1.9;
  color: #7080a3;
}

.face-intro-copy__action {
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

.face-intro-copy__action:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 40px rgba(74, 103, 255, 0.32);
}

.face-intro-copy__action svg,
.face-intro-copy__action > span:first-child {
  position: relative;
  z-index: 1;
}

.face-intro-copy__action svg {
  width: 16px;
  height: 16px;
}

.face-intro-copy__action-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 12%,
    rgba(255, 255, 255, 0.22) 50%,
    rgba(255, 255, 255, 0) 88%
  );
  transform: translateX(-120%);
  transition: transform 0.7s ease;
}

.face-intro-copy__action:hover .face-intro-copy__action-shine {
  transform: translateX(120%);
}

.face-intro-visual {
  position: relative;
  width: 100%;
  max-width: 520px;
  justify-self: end;
}

.face-intro-visual__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

.face-intro-visual__glow--top {
  top: -6%;
  right: -10%;
  width: 40%;
  aspect-ratio: 1;
  background: rgba(79, 117, 255, 0.14);
}

.face-intro-visual__glow--bottom {
  left: -10%;
  bottom: -10%;
  width: 48%;
  aspect-ratio: 1;
  background: rgba(79, 117, 255, 0.16);
}

.face-intro-visual-card {
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

.face-intro-visual-card__portrait,
.face-intro-visual-card__grid {
  position: absolute;
  inset: 0;
}

.face-intro-visual-card__portrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.94;
}

.face-intro-visual-card__grid {
  background: linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  z-index: 1;
}

.face-intro-visual-card__scanline {
  position: absolute;
  left: 0;
  right: 0;
  top: 35%;
  height: 3px;
  background: linear-gradient(
    90deg,
    rgba(79, 117, 255, 0) 0%,
    #4f75ff 50%,
    rgba(79, 117, 255, 0) 100%
  );
  box-shadow: 0 0 20px #4f75ff;
  z-index: 2;
}

.face-intro-visual-card__point {
  position: absolute;
  border-radius: 50%;
  background: #4f75ff;
  box-shadow: 0 0 15px #4f75ff;
  z-index: 3;
  animation: face-intro-pulse 2.6s infinite ease-in-out;
}

.face-intro-visual-card__point--left-eye,
.face-intro-visual-card__point--right-eye {
  width: 12px;
  height: 12px;
  top: 32%;
}

.face-intro-visual-card__point--left-eye {
  left: 42%;
}

.face-intro-visual-card__point--right-eye {
  left: 58%;
  animation-delay: 0.18s;
}

.face-intro-visual-card__point--nose,
.face-intro-visual-card__point--left-mouth,
.face-intro-visual-card__point--right-mouth {
  width: 9px;
  height: 9px;
}

.face-intro-visual-card__point--nose {
  top: 52%;
  left: 50%;
  animation-delay: 0.32s;
}

.face-intro-visual-card__point--left-mouth {
  top: 62%;
  left: 40%;
  animation-delay: 0.5s;
}

.face-intro-visual-card__point--right-mouth {
  top: 62%;
  left: 60%;
  animation-delay: 0.7s;
}

.face-intro-visual-card__badge,
.face-intro-visual-card__panel {
  position: absolute;
  z-index: 4;
  color: #ffffff;
  backdrop-filter: blur(18px);
}

.face-intro-visual-card__badge {
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

.face-intro-visual-card__badge-icon {
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

.face-intro-visual-card__badge-icon svg {
  width: 16px;
  height: 16px;
}

.face-intro-visual-card__badge strong {
  display: block;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.1;
}

.face-intro-visual-card__badge span {
  display: block;
  margin-top: 2px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
}

.face-intro-visual-card__panel {
  right: 24px;
  bottom: 24px;
  min-width: 220px;
  padding: 16px 18px 18px;
  border-radius: 18px;
  background: rgba(16, 24, 48, 0.88);
  border: 1px solid rgba(92, 112, 198, 0.2);
  box-shadow: 0 18px 36px rgba(8, 15, 35, 0.28);
}

.face-intro-visual-card__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.face-intro-visual-card__panel-label {
  display: block;
  font-size: 9px;
  font-weight: 800;
  color: #5575ff;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.face-intro-visual-card__panel-side {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  padding-bottom: 2px;
}

.face-intro-visual-card__panel strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
}

.face-intro-visual-card__progress {
  margin-top: 14px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.face-intro-visual-card__progress span {
  display: block;
  width: 99.8%;
  height: 100%;
  background: linear-gradient(90deg, #4f73ff 0%, #7bd5ff 100%);
  box-shadow: 0 0 18px rgba(123, 213, 255, 0.4);
}

.face-intro-visual-card__panel-tags {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.face-intro-visual-card__panel-tags span {
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

.face-intro-visual-card__panel-tags span i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

.face-intro-visual-card__corner {
  position: absolute;
  width: 42px;
  height: 42px;
  border-color: rgba(79, 117, 255, 0.5);
  border-style: solid;
  z-index: 4;
}

.face-intro-visual-card__corner--top-left {
  top: 26px;
  left: 26px;
  border-width: 2px 0 0 2px;
  border-top-left-radius: 14px;
}

.face-intro-visual-card__corner--top-right {
  top: 26px;
  right: 26px;
  border-width: 2px 2px 0 0;
  border-top-right-radius: 14px;
}

.face-intro-visual-card__corner--bottom-left {
  bottom: 26px;
  left: 26px;
  border-width: 0 0 2px 2px;
  border-bottom-left-radius: 14px;
}

.face-intro-visual-card__corner--bottom-right {
  right: 26px;
  bottom: 26px;
  border-width: 0 2px 2px 0;
  border-bottom-right-radius: 14px;
}

@keyframes face-intro-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.92;
  }

  50% {
    transform: scale(1.18);
    opacity: 1;
  }
}

@media (max-width: 1500px) {
  .face-intro-shell {
    padding: 22px 20px 20px;
  }

  .face-intro-hero {
    grid-template-columns: minmax(360px, 1fr) minmax(320px, 460px);
    gap: 16px;
  }

  .face-intro-copy__stack {
    max-width: 560px;
  }

  .face-intro-copy__card p {
    max-width: 500px;
    font-size: 15px;
  }

  .face-intro-copy__action {
    min-width: 176px;
    height: 54px;
    font-size: 16px;
  }

  .face-intro-visual {
    max-width: 460px;
  }
}

@media (max-width: 1300px) {
  .face-intro-shell {
    padding: 18px 20px 18px;
  }

  .face-intro-breadcrumb {
    margin-bottom: 48px;
  }

  .face-intro-hero {
    grid-template-columns: minmax(300px, 1fr) minmax(280px, 400px);
    gap: 14px;
  }

  .face-intro-copy__card h1 {
    font-size: 38px;
  }

  .face-intro-copy__card p {
    max-width: 420px;
    font-size: 14px;
    line-height: 1.8;
  }

  .face-intro-copy__action {
    min-width: 168px;
    height: 52px;
    font-size: 15px;
  }

  .face-intro-visual {
    max-width: 400px;
  }

  .face-intro-visual-card {
    border-radius: 30px;
  }
}
</style>
