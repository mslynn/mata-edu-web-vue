<template>
  <div class="object-recognition-page">
    <div class="object-recognition-shell">
      <nav class="object-recognition-breadcrumb" aria-label="面包屑">
        <button
          type="button"
          class="object-recognition-breadcrumb__link"
          @click="handleBackToAiCenter"
        >
          AI 实践中心
        </button>
        <span class="object-recognition-breadcrumb__separator">/</span>
        <span class="object-recognition-breadcrumb__current">物品识别</span>
      </nav>

      <main class="object-recognition-main">
        <section class="object-recognition-hero">
          <div class="object-recognition-hero__intro">
            <div class="object-recognition-hero__copy">
              <h1>物品识别</h1>
              <p>
                基于人工智能与计算机视觉技术的应用，通过对图像或视频中的物体进行特征提取与分析，
                实现对物品类别的自动判断与识别。其核心依赖于深度学习模型，尤其是卷积神经网络，
                能够准确识别日常生活中的各类物体。
              </p>
              <p>
                该技术广泛应用于智能安防、无人零售、自动驾驶、教育互动等场景，
                不仅提升了信息处理效率，也为智能化应用提供了重要支撑。
              </p>

              <NuxtLink
                to="/system/ai/material/experience"
                class="object-recognition-primary"
              >
                立即体验
              </NuxtLink>
            </div>

            <div class="object-recognition-hero__visual" aria-label="物品识别示意图">
              <div class="object-recognition-image-card">
                <img
                  src="/images/ai-practice/practice-23-7c2c96bc.webp"
                  alt="物品识别镜头示意图"
                />
              </div>
            </div>
          </div>

          <aside class="object-recognition-match-card">
            <h2>模型匹配与分类</h2>
            <p>
              提取的特征将与本地预训练模型进行比对，
              通过概率计算确定模型已支持物品的类别与属性。
            </p>
            <div class="object-recognition-meter">
              <div class="object-recognition-meter__head">
                <span>匹配相似度</span>
                <strong>96%</strong>
              </div>
              <div class="object-recognition-meter__track">
                <i></i>
              </div>
            </div>
          </aside>
        </section>

        <section class="object-recognition-workflow">
          <div class="object-recognition-section-head">
            <div>
              <h2>工作流程</h2>
              <p>从样本采集到模型推理，帮助学生理解图像识别的完整链路。</p>
            </div>
          </div>

          <div class="object-recognition-steps">
            <article
              v-for="step in workflowSteps"
              :key="step.index"
              class="object-recognition-step"
            >
              <div class="object-recognition-step__image">
                <img :src="step.image" :alt="step.title" />
              </div>
              <div class="object-recognition-step__body">
                <span>{{ step.index }}</span>
                <div>
                  <h3>{{ step.title }}</h3>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </article>
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
  title: "物品识别体验",
  htmlAttrs: {
    lang: "zh-CN",
  },
});

const workflowSteps = [
  {
    index: "01",
    title: "数据采集",
    description:
      "支持高精图像采集，对各类物品进行多维度特征标注与分类管理，为模型提供高质量训练样本。",
    image:
      "/images/ai-practice/practice-24-488ee045.webp",
  },
  {
    index: "02",
    title: "模型训练",
    description:
      "基于已采集的数据集，利用卷积神经网络架构训练深度学习模型，实现对物品特征的精准提取。",
    image:
      "/images/ai-practice/practice-25-9df2aa4e.webp",
  },
  {
    index: "03",
    title: "识别结果",
    description:
      "即时通过本地模型进行匹配，输出已支持物品的名称及其对应的置信度评分。",
    image:
      "/images/ai-practice/practice-26-48d56026.webp",
  },
];

const handleBackToAiCenter = async () => {
  await navigateTo("/system/opt");
};
</script>

<style scoped>
.object-recognition-page {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: #1f2f46;
  background: #f7f9fb;
}

.object-recognition-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: 24px 42px 18px;
  box-sizing: border-box;
}

.object-recognition-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1280px;
  margin: 0 auto 18px;
  color: #97a3b8;
  font-size: 13px;
  font-weight: 500;
}

.object-recognition-breadcrumb__separator {
  color: #b5bfd0;
}

.object-recognition-breadcrumb__link {
  border: none;
  background: transparent;
  padding: 0;
  color: #97a3b8;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.object-recognition-breadcrumb__link:hover,
.object-recognition-breadcrumb__current {
  color: #005bc2;
}

.object-recognition-main {
  max-width: 1280px;
  margin: 0 auto;
}

.object-recognition-hero {
  display: grid;
  grid-template-columns: minmax(0, 2.1fr) minmax(280px, 0.9fr);
  gap: 28px;
  align-items: stretch;
  min-height: 280px;
}

.object-recognition-hero__intro,
.object-recognition-match-card,
.object-recognition-step {
  border: none;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(16, 35, 63, 0.06);
}

.object-recognition-hero__intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 34px;
  align-items: center;
  border-radius: 32px;
  padding: 28px 34px;
}

.object-recognition-hero__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.object-recognition-hero__intro h1 {
  margin: 0 0 16px;
  color: #10233f;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.object-recognition-hero__intro p {
  max-width: 420px;
  margin: 0 0 12px;
  color: #26374f;
  font-size: 13px;
  line-height: 1.75;
  text-indent: 2em;
}

.object-recognition-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 118px;
  height: 40px;
  margin-top: 8px;
  border: none;
  border-radius: 999px;
  background: #3b82f6;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(0, 91, 194, 0.28);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.object-recognition-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 42px rgba(0, 91, 194, 0.34);
}

.object-recognition-hero__visual {
  min-width: 0;
  height: 100%;
}

.object-recognition-image-card {
  position: relative;
  height: 100%;
  min-height: 240px;
  overflow: hidden;
  border-radius: 20px;
  background: #dbe8f8;
  box-shadow: none;
}

.object-recognition-image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.object-recognition-match-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 32px;
  padding: 28px 32px;
  background: #3b82f6;
  color: #fff;
}

.object-recognition-match-card h2 {
  margin: 0 0 20px;
  font-size: 26px;
  line-height: 1.18;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.object-recognition-match-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 13px;
  line-height: 1.75;
}

.object-recognition-meter {
  margin-top: auto;
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.16);
}

.object-recognition-meter__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 700;
}

.object-recognition-meter__track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}

.object-recognition-meter__track i {
  display: block;
  width: 96%;
  height: 100%;
  border-radius: inherit;
  background: #fff;
}

.object-recognition-workflow {
  margin-top: 42px;
}

.object-recognition-section-head {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 20px;
}

.object-recognition-section-head h2 {
  margin: 0 0 4px;
  color: #10233f;
  font-size: 28px;
  font-weight: 800;
}

.object-recognition-section-head p {
  margin: 0;
  color: #6b7890;
  font-size: 14px;
}

.object-recognition-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

.object-recognition-step {
  overflow: hidden;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.object-recognition-step:hover {
  transform: translateY(-4px);
  box-shadow: none;
}

.object-recognition-step__image {
  height: 170px;
  overflow: hidden;
  border-radius: 10px;
}

.object-recognition-step__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s ease;
}

.object-recognition-step:hover .object-recognition-step__image img {
  transform: scale(1.06);
}

.object-recognition-step__body {
  display: flex;
  gap: 14px;
  padding: 14px 0 0;
}

.object-recognition-step__body > span {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid #d8e3f2;
  border-radius: 50%;
  color: #8aa0bf;
  font-size: 14px;
  font-weight: 900;
}

.object-recognition-step:hover .object-recognition-step__body > span {
  border-color: #005bc2;
  color: #005bc2;
}

.object-recognition-step__body h3 {
  margin: 0 0 6px;
  color: #10233f;
  font-size: 14px;
  font-weight: 800;
}

.object-recognition-step__body p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.55;
}

@media (max-width: 1500px) {
  .object-recognition-shell {
    padding: 22px 24px 18px;
  }

  .object-recognition-hero {
    grid-template-columns: minmax(0, 2fr) minmax(260px, 0.78fr);
    gap: 24px;
  }

  .object-recognition-hero__intro {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 30px;
  }

  .object-recognition-match-card {
    min-height: 280px;
  }
}

@media (max-width: 1180px) {
  .object-recognition-hero {
    grid-template-columns: 1fr;
  }

  .object-recognition-match-card {
    min-height: 240px;
  }
}

@media (max-width: 900px) {
  .object-recognition-hero__intro,
  .object-recognition-steps {
    grid-template-columns: 1fr;
  }

  .object-recognition-image-card {
    min-height: 280px;
  }
}
</style>
