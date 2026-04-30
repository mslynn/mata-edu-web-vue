<template>
  <div ref="aiwendaPageRef" class="aiwenda-page" :style="pageAdaptiveStyle">
    <div class="aiwenda-layout">
      <TeacherSidebar />

      <main class="aiwenda-main">
        <nav class="aiwenda-breadcrumb" aria-label="面包屑">
          <NuxtLink to="/system/opt" class="aiwenda-breadcrumb__back">
            <!-- <span class="material-symbols-outlined">arrow_back</span> -->
            <span>AI实践中心</span>
          </NuxtLink>
          <span class="material-symbols-outlined aiwenda-breadcrumb__separator">
            chevron_right
          </span>
          <span class="aiwenda-breadcrumb__current">AI自由对话</span>
        </nav>

        <div class="aiwenda-content-grid">
          <section class="aiwenda-workspace">
          <div class="aiwenda-roles">
            <div class="aiwenda-role-head">
              <div class="aiwenda-section-title">推荐角色 AI ROLES</div>
              <button type="button" class="aiwenda-role-view-all" @click="openRoleDialog">
                查看全部
              </button>
            </div>
            <div class="aiwenda-role-list">
              <button
                v-for="role in roleCards"
                :key="role.key"
                type="button"
                class="aiwenda-role-card"
                :class="{ 'is-active': activeRoleKey === role.key }"
                @click="handleRoleClick(role.key)"
              >
                <span class="aiwenda-role-card__icon" :class="`is-${role.key}`">
                  <span class="material-symbols-outlined">{{ role.icon }}</span>
                </span>
                <span class="aiwenda-role-card__text">
                  <strong>{{ role.name }}</strong>
                  <small>{{ role.desc }}</small>
                </span>
              </button>
            </div>
          </div>

          <div class="aiwenda-chat-list">
            <div
              v-for="message in chatMessages"
              :key="message.id"
              class="aiwenda-message"
              :class="`is-${message.role}`"
            >
              <div v-if="message.role === 'assistant'" class="aiwenda-avatar is-assistant">
                <span class="material-symbols-outlined">smart_toy</span>
              </div>

              <div class="aiwenda-message__body">
                <div class="aiwenda-message__bubble">
                  <p>{{ message.content }}</p>
                  <button type="button" class="aiwenda-message__more" aria-label="更多">
                    <span class="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
                <time>{{ message.time }}</time>
              </div>

              <div v-if="message.role === 'user'" class="aiwenda-avatar is-user">
                <img :src="teacherAvatar" alt="用户头像" />
              </div>
            </div>
          </div>

          <div class="aiwenda-composer">
            <button type="button" class="aiwenda-composer__icon" title="上传附件" aria-label="上传附件">
              <span class="material-symbols-outlined">attach_file</span>
            </button>
            <textarea
              class="aiwenda-composer__input"
              rows="1"
              placeholder="输入消息开始对话..."
            ></textarea>
            <button type="button" class="aiwenda-composer__voice" title="语音输入" aria-label="语音输入">
              <span class="material-symbols-outlined">mic</span>
            </button>
            <button type="button" class="aiwenda-composer__send" title="发送" aria-label="发送">
              <span class="material-symbols-outlined">send</span>
            </button>
          </div>
          </section>

          <aside class="aiwenda-history">
          <div class="aiwenda-history__title">历史对话记录</div>
          <div class="aiwenda-history__list">
            <button
              v-for="item in historyCards"
              :key="item.id"
              type="button"
              class="aiwenda-history-card"
              :class="{ 'is-active': item.active }"
            >
              <div class="aiwenda-history-card__head">
                <span>{{ item.title }}</span>
              </div>
              <p>{{ item.content }}</p>
              <span class="aiwenda-history-card__more" aria-label="更多操作">
                <span class="material-symbols-outlined">more_horiz</span>
              </span>
              <span class="aiwenda-history-menu">
                <span class="aiwenda-history-menu__item">
                  <span class="material-symbols-outlined">edit</span>
                  <span>重命名</span>
                </span>
                <span class="aiwenda-history-menu__item">
                  <span class="material-symbols-outlined">push_pin</span>
                  <span>置顶聊天</span>
                </span>
                <span class="aiwenda-history-menu__item is-danger">
                  <span class="material-symbols-outlined">delete</span>
                  <span>删除</span>
                </span>
              </span>
            </button>
          </div>
          <button type="button" class="aiwenda-new-chat">
            <span class="material-symbols-outlined">add</span>
            <span>发起新对话</span>
          </button>
          </aside>
        </div>
      </main>
    </div>

    <Teleport to="body">
      <div v-if="showRoleDialog" class="aiwenda-role-dialog-mask">
        <div class="aiwenda-role-dialog-backdrop" @click="closeRoleDialog"></div>
        <section class="aiwenda-role-dialog" role="dialog" aria-modal="true" aria-label="推荐角色中心">
          <button type="button" class="aiwenda-role-dialog__close" aria-label="关闭" @click="closeRoleDialog">
            <span class="material-symbols-outlined">close</span>
          </button>
          <header class="aiwenda-role-dialog__header">
            <h2>推荐角色中心</h2>
            <p>选择一个最适合当前学习需求的 AI 导师</p>
          </header>

          <div class="aiwenda-role-dialog__grid">
            <button
              v-for="role in extendedRoleCards"
              :key="role.key"
              type="button"
              class="aiwenda-role-dialog-card"
              :class="{ 'is-active': pendingDialogRoleKey === role.key }"
              @click="selectDialogRole(role.key)"
            >
              <strong>{{ role.name }}</strong>
              <p>{{ role.desc }}</p>
              <span
                class="aiwenda-role-config-entry"
                @click.stop="openRoleConfigDialog(role.name)"
              >
                <span class="material-symbols-outlined">tune</span>
                修改角色配置
              </span>
            </button>
          </div>

          <footer class="aiwenda-role-dialog__footer">
            <button type="button" class="aiwenda-role-dialog__confirm" @click="confirmDialogRole">
              确认并开始对话
            </button>
            <button type="button" class="aiwenda-role-dialog__cancel" @click="closeRoleDialog">
              取消
            </button>
          </footer>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showRoleConfigDialog" class="aiwenda-config-dialog-mask">
        <div class="aiwenda-config-dialog-backdrop" @click="closeRoleConfigDialog"></div>
        <section class="aiwenda-config-dialog" role="dialog" aria-modal="true" :aria-label="roleConfigDialogTitle">
          <button type="button" class="aiwenda-config-dialog__close" aria-label="关闭" @click="closeRoleConfigDialog">
            <span class="material-symbols-outlined">close</span>
          </button>

          <header class="aiwenda-config-dialog__header">
            <h2>{{ roleConfigDialogTitle }}</h2>
            <p>{{ roleConfigDialogDesc }}</p>
          </header>

          <form class="aiwenda-config-form">
            <label class="aiwenda-config-field">
              <span>角色名称</span>
              <div class="aiwenda-config-input-wrap">
                <input :placeholder="roleConfigNamePlaceholder" />
                <span class="material-symbols-outlined">edit_note</span>
              </div>
            </label>

            <label class="aiwenda-config-field">
              <span>
                <span>角色介绍/提示词</span>
                <em>推荐模板</em>
              </span>
              <textarea placeholder="请详细描述该角色的工作流程、常用语气以及必须遵守的规则..."></textarea>
            </label>

            <p class="aiwenda-config-tip">
              <span class="material-symbols-outlined">info</span>
              提示词质量直接影响AI的输出效果，建议使用“你是XXX，负责XXX”的结构。
            </p>

            <div class="aiwenda-config-actions">
              <button type="button" class="aiwenda-config-save" @click="closeRoleConfigDialog">
                <span class="material-symbols-outlined">save</span>
                {{ roleConfigSaveText }}
              </button>
              <button type="button" class="aiwenda-config-reset">
                重置角色配置
              </button>
            </div>
          </form>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import TeacherSidebar from "~/components/layout/TeacherSidebar.vue";
import teacherAvatar from "~/assets/newimages/user.png";

definePageMeta({
  layout: false,
});

const aiwendaPageRef = ref<HTMLElement | null>(null);
let aiwendaPageResizeObserver: ResizeObserver | null = null;
const aiwendaLayoutWidth = ref(1360);

// 沿用 teacher2 首页缩放适配：以浏览器外层宽度作为参考，缩放档位不切换布局。
const getAiwendaLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = aiwendaPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(width => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const syncAiwendaLayoutWidth = () => {
  aiwendaLayoutWidth.value = getAiwendaLayoutWidth();
};

const aiwendaShellWidth = computed(() => {
  if (aiwendaLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(aiwendaLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(aiwendaLayoutWidth.value * 0.9)),
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--aiwenda-shell-width": aiwendaShellWidth.value,
}));

onMounted(() => {
  if (typeof window === "undefined") return;
  syncAiwendaLayoutWidth();
  window.addEventListener("resize", syncAiwendaLayoutWidth);
  window.visualViewport?.addEventListener("resize", syncAiwendaLayoutWidth);
  if (window.ResizeObserver && aiwendaPageRef.value) {
    aiwendaPageResizeObserver = new window.ResizeObserver(() => {
      syncAiwendaLayoutWidth();
    });
    aiwendaPageResizeObserver.observe(aiwendaPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("resize", syncAiwendaLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncAiwendaLayoutWidth);
  aiwendaPageResizeObserver?.disconnect();
  aiwendaPageResizeObserver = null;
});

const roleCards = [
  { key: "assistant", name: "自由问答", desc: "通用答疑", icon: "chat" },
  { key: "teacher", name: "教师", desc: "教学评估", icon: "school" },
  { key: "student", name: "好学生", desc: "学习陪伴", icon: "person_raised_hand" },
  { key: "planner", name: "班主任", desc: "班级管理", icon: "groups" },
  { key: "config", name: "配置新角色", desc: "自定义角色", icon: "add" },
];

const extendedRoleCards = [
  {
    key: "science-teacher",
    name: "全科教师",
    desc: "耐心、专业的教学伙伴，能够针对不同水平的学生制定个性化的知识点讲解与课后辅导方案。",
  },
  {
    key: "lab-scientist",
    name: "实验科学家",
    desc: "专注于物理、化学及生物实验设计，协助你进行严谨的数据分析，假设推导与科学报告撰写。",
  },
  {
    key: "resource-architect",
    name: "资源架构师",
    desc: "不仅能帮你改 Bug，还能深入浅出地讲解数据结构、算法逻辑，助你构建稳健的系统工程。",
  },
  {
    key: "history-note",
    name: "历史评论家",
    desc: "穿越时空的知识向导，为你剖析历史事件背后的社会脉络，培养批判性思维与宏观视角。",
  },
  {
    key: "aesthetic-mentor",
    name: "创意美学导师",
    desc: "从色彩理论到现代流派，为你提供灵感火花，支持 Prompt 优化，助你将脑海中的画面完美实现。",
  },
  {
    key: "psychology-consultant",
    name: "学习心理顾问",
    desc: "关注你的学习状态与焦虑，提供专业的情绪疏导与高效学习法建议，让学习不再成为负担。",
  },
];

const activeRoleKey = ref("assistant");
const pendingDialogRoleKey = ref(extendedRoleCards[0]?.key || "");
const showRoleDialog = ref(false);
const showRoleConfigDialog = ref(false);
const roleConfigTargetName = ref("");
const isEditingRoleConfig = computed(() => Boolean(roleConfigTargetName.value));
const roleConfigDialogTitle = computed(() => {
  return isEditingRoleConfig.value ? "编辑角色" : "配置新角色";
});
const roleConfigDialogDesc = computed(() => {
  return isEditingRoleConfig.value
    ? "调整当前推荐角色的行为模式、语气和专业知识范围"
    : "设定新AI角色的行为模式、语气和专业知识范围";
});
const roleConfigSaveText = computed(() => {
  return isEditingRoleConfig.value ? "保存编辑" : "保存角色配置";
});
const roleConfigNamePlaceholder = computed(() => {
  return roleConfigTargetName.value ? `例如：${roleConfigTargetName.value}` : "例如：资深数学竞赛导师";
});

const handleRoleClick = (key: string) => {
  if (key === "config") {
    openRoleConfigDialog("");
    return;
  }
  activeRoleKey.value = key;
};

const openRoleDialog = () => {
  pendingDialogRoleKey.value = extendedRoleCards[0]?.key || "";
  showRoleDialog.value = true;
};

const selectDialogRole = (key: string) => {
  pendingDialogRoleKey.value = key;
};

const closeRoleDialog = () => {
  showRoleDialog.value = false;
};

const confirmDialogRole = () => {
  if (pendingDialogRoleKey.value) {
    activeRoleKey.value = pendingDialogRoleKey.value;
  }
  closeRoleDialog();
};

const openRoleConfigDialog = (roleName: string) => {
  roleConfigTargetName.value = roleName;
  showRoleConfigDialog.value = true;
};

const closeRoleConfigDialog = () => {
  showRoleConfigDialog.value = false;
};

const chatMessages = [
  {
    id: "assistant-1",
    role: "assistant",
    content:
      "您好！我是教学交互 AI 助教，有强大的数据理解、讲解与文本生成能力。请问今天我可以如何帮助你？",
    time: "上午 09:41 AM",
  },
  {
    id: "user-1",
    role: "user",
    content:
      "请深入浅出地说明一下三年级学生如何用简单电路实验，理解一个开关控制一盏灯的基本原理。",
    time: "上午 09:42 AM",
  },
  {
    id: "assistant-2",
    role: "assistant",
    content:
      "当然可以！建议准备小灯泡、导线、电池和开关。先让学生观察开关闭合前后灯泡状态变化，再引导他们理解电流需要形成完整回路，开关负责控制回路是否连通。",
    time: "上午 09:43 AM",
  },
];

const historyCards = [
  {
    id: "history-1",
    title: "教学计划",
    content: "基于学情生成本周教学安排，并拆分课前、课中、课后任务。",
    active: true,
  },
  {
    id: "history-2",
    title: "问答",
    content: "Python 列表推导式和普通循环有什么区别？",
  },
  {
    id: "history-3",
    title: "作业",
    content: "学生实验记录：金属导体和绝缘体课堂总结。",
  },
];
</script>

<style scoped>
@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 100 700;
  src: url("/fonts/material-symbols-outlined-full.ttf") format("truetype");
  font-display: block;
}

.material-symbols-outlined {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  overflow: hidden;
  font-family: "Material Symbols Outlined", sans-serif !important;
  font-style: normal;
  font-weight: 400;
  font-size: 1.5rem;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  flex-shrink: 0;
  user-select: none;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  -webkit-font-smoothing: antialiased;
}

.aiwenda-page {
  --aiwenda-sidebar-width: 256px;
  --aiwenda-page-min: 1280px;
  --aiwenda-page-max: 1920px;
  --aiwenda-shell-width: var(--aiwenda-page-min);
  min-width: var(--aiwenda-page-min);
  height: 100vh;
  overflow-x: auto;
  overflow-y: auto;
  background: #f4f6f8;
  color: #121826;
}

.aiwenda-layout {
  display: grid;
  grid-template-columns: var(--aiwenda-sidebar-width) minmax(0, 1fr);
  width: min(
    var(--aiwenda-page-max),
    max(var(--aiwenda-page-min), var(--aiwenda-shell-width))
  );
  min-width: var(--aiwenda-page-min);
  min-height: 100vh;
  margin: 0 auto;
  background: #f4f6f8;
}

.aiwenda-main {
  min-width: 0;
  min-height: 100vh;
  height: 100vh;
  padding: clamp(28px, 1.9vw, 36px) clamp(24px, 1.8vw, 34px) clamp(22px, 1.45vw, 26px) clamp(18px, 1.35vw, 22px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.aiwenda-breadcrumb {
  min-height: 28px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #7a8798;
  font-size: 13px;
  font-weight: 700;
}

.aiwenda-breadcrumb__back {
  border: none;
  color: #667386;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
}

.aiwenda-breadcrumb__back:hover {
  color: #005bc2;
}

.aiwenda-breadcrumb__back .material-symbols-outlined {
  font-size: 17px;
}

.aiwenda-breadcrumb__separator {
  color: #b6c0cf;
  font-size: 15px;
}

.aiwenda-breadcrumb__current {
  color: #005bc2;
}

.aiwenda-content-grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 314px;
  gap: 20px;
  overflow: hidden;
}

.aiwenda-workspace,
.aiwenda-history {
  min-height: 0;
  border-radius: 22px;
  background: #ffffff;
}

.aiwenda-workspace {
  display: flex;
  flex-direction: column;
  padding: 26px 28px 18px;
  overflow: hidden;
}

.aiwenda-section-title,
.aiwenda-history__title {
  color: #151b28;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.aiwenda-role-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.aiwenda-role-view-all {
  border: 0;
  color: #005bc2;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
}

.aiwenda-role-view-all:hover {
  color: #00499b;
}

.aiwenda-role-list {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.aiwenda-role-card {
  height: 58px;
  border: 1px solid #e7edf4;
  border-radius: 10px;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  text-align: left;
  cursor: pointer;
}

.aiwenda-role-card:hover {
  border-color: rgba(0, 91, 194, 0.3);
  box-shadow: 0 10px 24px rgba(0, 91, 194, 0.08);
}

.aiwenda-role-card.is-active {
  border-color: rgba(0, 91, 194, 0.3);
  box-shadow: 0 10px 24px rgba(0, 91, 194, 0.08);
}

.aiwenda-role-card__icon {
  width: 28px;
  height: 28px;
  border-radius: 9px;
  color: #005bc2;
  background: #eaf3ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.aiwenda-role-card__icon.is-teacher {
  color: #2563eb;
  background: #e8f0ff;
}

.aiwenda-role-card__icon.is-student {
  color: #e84f8a;
  background: #fff0f6;
}

.aiwenda-role-card__icon.is-planner {
  color: #0ca678;
  background: #e9fbf4;
}

.aiwenda-role-card__icon.is-config {
  color: #005bc2;
  background: #f1f6ff;
}

.aiwenda-role-card__icon .material-symbols-outlined {
  font-size: 17px;
}

.aiwenda-role-card__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.aiwenda-role-card__text strong {
  color: #182235;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.aiwenda-role-card__text small {
  color: #8a95a6;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.2;
}

.aiwenda-chat-list {
  flex: 1;
  min-height: 0;
  margin-top: 28px;
  padding: 6px 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  overflow-y: auto;
}

.aiwenda-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.aiwenda-message.is-user {
  justify-content: flex-end;
}

.aiwenda-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex: 0 0 auto;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aiwenda-avatar.is-assistant {
  color: #ffffff;
  background: linear-gradient(135deg, #006be6, #004db5);
  box-shadow: 0 8px 18px rgba(0, 91, 194, 0.24);
}

.aiwenda-avatar.is-user img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.aiwenda-message__body {
  max-width: min(620px, 72%);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.aiwenda-message.is-user .aiwenda-message__body {
  align-items: flex-end;
}

.aiwenda-message__body time {
  color: #98a3b3;
  font-size: 10px;
  font-weight: 700;
}

.aiwenda-message__bubble {
  position: relative;
  min-height: 46px;
  border-radius: 10px;
  padding: 13px 42px 13px 16px;
  color: #273449;
  background: #f2f5f8;
  line-height: 1.7;
  font-size: 13px;
  font-weight: 600;
}

.aiwenda-message__bubble p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.aiwenda-message.is-user .aiwenda-message__bubble {
  color: #ffffff;
  background: linear-gradient(135deg, #0067dc 0%, #005bc2 100%);
  box-shadow: 0 10px 24px rgba(0, 91, 194, 0.24);
}

.aiwenda-message__more {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  padding: 0;
  color: currentColor;
  opacity: 0.55;
  background: transparent;
}

.aiwenda-message__more .material-symbols-outlined {
  font-size: 18px;
}

.aiwenda-composer {
  min-height: 52px;
  border: 1px solid #e5ebf3;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(28, 45, 76, 0.08);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 9px 8px 14px;
}

.aiwenda-composer button {
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.aiwenda-composer__icon,
.aiwenda-composer__voice {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: transparent;
  color: #9aa6b8;
}

.aiwenda-composer__input {
  flex: 1;
  min-width: 0;
  height: 32px;
  max-height: 90px;
  border: none;
  outline: none;
  resize: none;
  color: #263245;
  background: transparent;
  font: inherit;
  font-size: 13px;
  line-height: 32px;
}

.aiwenda-composer__input::placeholder {
  color: #a9b4c4;
}

.aiwenda-composer__send {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #ffffff;
  background: #005bc2;
  box-shadow: 0 8px 18px rgba(0, 91, 194, 0.26);
}

.aiwenda-composer__send .material-symbols-outlined {
  font-size: 18px;
}

.aiwenda-history {
  padding: 26px 18px 18px;
  background: #e9eef3;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.aiwenda-history__list {
  flex: 1;
  min-height: 0;
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.aiwenda-history-card {
  position: relative;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 10px;
  background: #ffffff;
  padding: 13px 38px 13px 14px;
  text-align: left;
  cursor: pointer;
}

.aiwenda-history-card:hover,
.aiwenda-history-card.is-active {
  border-color: rgba(0, 91, 194, 0.24);
  box-shadow: 0 10px 20px rgba(47, 68, 96, 0.08);
}

.aiwenda-history-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #005bc2;
  font-size: 11px;
  font-weight: 800;
}

.aiwenda-history-card p {
  margin: 8px 0 0;
  color: #253247;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.55;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.aiwenda-history-card__more {
  position: absolute;
  right: 12px;
  top: 13px;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  color: #8a95a6;
  background: rgba(242, 245, 248, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: opacity 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.aiwenda-history-card:hover .aiwenda-history-card__more,
.aiwenda-history-card.is-active .aiwenda-history-card__more {
  color: #005bc2;
  background: #eaf3ff;
}

.aiwenda-history-card__more .material-symbols-outlined {
  font-size: 18px;
}

.aiwenda-history-menu {
  position: absolute;
  right: 8px;
  top: 40px;
  z-index: 10;
  width: 142px;
  border: 1px solid #e3eaf2;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
  padding: 7px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
}

.aiwenda-history-card:hover .aiwenda-history-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.aiwenda-history-menu__item {
  height: 34px;
  border-radius: 8px;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.aiwenda-history-menu__item:hover {
  background: #f2f6fb;
}

.aiwenda-history-menu__item.is-danger {
  color: #e54848;
}

.aiwenda-history-menu__item .material-symbols-outlined {
  font-size: 18px;
}

.aiwenda-new-chat {
  height: 46px;
  margin-top: 16px;
  border: none;
  border-radius: 10px;
  background: #005bc2;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(0, 91, 194, 0.25);
}

.aiwenda-new-chat .material-symbols-outlined {
  font-size: 17px;
}

.aiwenda-role-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.aiwenda-role-dialog-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.2);
  backdrop-filter: blur(8px);
}

.aiwenda-role-dialog {
  position: relative;
  width: min(860px, calc(100vw - 80px));
  border-radius: 42px;
  background: #ffffff;
  padding: 36px 36px 30px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.22);
}

.aiwenda-role-dialog__close {
  position: absolute;
  top: 28px;
  right: 30px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  color: #5f6b7d;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.aiwenda-role-dialog__close:hover {
  background: #f2f5f8;
}

.aiwenda-role-dialog__close .material-symbols-outlined {
  font-size: 20px;
}

.aiwenda-role-dialog__header h2 {
  margin: 0;
  color: #111827;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.aiwenda-role-dialog__header p {
  margin: 8px 0 0;
  color: #697586;
  font-size: 14px;
  font-weight: 600;
}

.aiwenda-role-dialog__grid {
  margin-top: 34px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.aiwenda-role-dialog-card {
  min-height: 150px;
  border: 1px solid #e3eaf2;
  border-radius: 12px;
  background: #f8fafc;
  padding: 22px 22px 18px;
  text-align: left;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease,
    transform 0.2s ease;
}

.aiwenda-role-dialog-card:hover,
.aiwenda-role-dialog-card.is-active {
  border-color: rgba(0, 91, 194, 0.35);
  background: #ffffff;
  box-shadow: 0 14px 32px rgba(0, 91, 194, 0.1);
  transform: translateY(-1px);
}

.aiwenda-role-dialog-card strong {
  color: #182235;
  font-size: 17px;
  font-weight: 900;
  line-height: 1.25;
}

.aiwenda-role-dialog-card p {
  margin: 16px 0 0;
  color: #4a5568;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.65;
}

.aiwenda-role-config-entry {
  margin-top: auto;
  padding-top: 14px;
  color: #005bc2;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  cursor: pointer;
}

.aiwenda-role-config-entry:hover {
  color: #004a9f;
}

.aiwenda-role-config-entry .material-symbols-outlined {
  font-size: 14px;
}

.aiwenda-role-dialog__footer {
  margin-top: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.aiwenda-role-dialog__confirm,
.aiwenda-role-dialog__cancel {
  height: 44px;
  border-radius: 999px;
  padding: 0 28px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
}

.aiwenda-role-dialog__confirm {
  border: none;
  color: #ffffff;
  background: #005bc2;
  box-shadow: 0 12px 26px rgba(0, 91, 194, 0.28);
}

.aiwenda-role-dialog__cancel {
  border: 1px solid #d9e1ec;
  color: #4a5568;
  background: #ffffff;
}

.aiwenda-config-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.aiwenda-config-dialog-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(8px);
}

.aiwenda-config-dialog {
  position: relative;
  width: min(620px, calc(100vw - 80px));
  border-radius: 34px;
  background: #ffffff;
  padding: 36px 36px 30px;
  box-shadow: 0 32px 90px rgba(15, 23, 42, 0.28);
}

.aiwenda-config-dialog__close {
  position: absolute;
  top: 28px;
  right: 30px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  color: #5f6b7d;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.aiwenda-config-dialog__close:hover {
  background: #f2f5f8;
}

.aiwenda-config-dialog__close .material-symbols-outlined {
  font-size: 20px;
}

.aiwenda-config-dialog__header h2 {
  margin: 0;
  color: #111827;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.aiwenda-config-dialog__header p {
  margin: 8px 0 0;
  color: #697586;
  font-size: 14px;
  font-weight: 600;
}

.aiwenda-config-form {
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.aiwenda-config-field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aiwenda-config-field > span {
  color: #1f2937;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.aiwenda-config-field em {
  min-width: 58px;
  height: 24px;
  border-radius: 999px;
  background: #eaf3ff;
  color: #005bc2;
  font-style: normal;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.aiwenda-config-input-wrap {
  height: 52px;
  border-radius: 14px;
  background: #f1f4f7;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
}

.aiwenda-config-input-wrap input,
.aiwenda-config-field textarea {
  width: 100%;
  border: none;
  outline: none;
  color: #243044;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
}

.aiwenda-config-input-wrap input::placeholder,
.aiwenda-config-field textarea::placeholder {
  color: #9aa6b8;
}

.aiwenda-config-input-wrap .material-symbols-outlined {
  color: #b0bac8;
  font-size: 20px;
}

.aiwenda-config-field textarea {
  min-height: 158px;
  resize: none;
  border-radius: 14px;
  background: #f1f4f7;
  padding: 16px;
  line-height: 1.6;
}

.aiwenda-config-tip {
  margin: -4px 0 16px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.aiwenda-config-tip .material-symbols-outlined {
  color: #7d8796;
  font-size: 15px;
}

.aiwenda-config-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 150px;
  gap: 14px;
}

.aiwenda-config-save,
.aiwenda-config-reset {
  height: 52px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.aiwenda-config-save {
  border: none;
  color: #ffffff;
  background: #005bc2;
  box-shadow: 0 14px 28px rgba(0, 91, 194, 0.28);
}

.aiwenda-config-save .material-symbols-outlined {
  font-size: 18px;
}

.aiwenda-config-reset {
  border: 1px solid #e3eaf2;
  color: #4b5563;
  background: #ffffff;
}

@media (max-width: 1500px) {
  .aiwenda-main {
    gap: 16px;
    padding: 28px 24px 22px 18px;
  }

  .aiwenda-content-grid {
    grid-template-columns: minmax(0, 1fr) 286px;
    gap: 16px;
  }

  .aiwenda-workspace {
    padding: 22px 24px 16px;
  }

  .aiwenda-role-list {
    gap: 10px;
  }

  .aiwenda-message__body {
    max-width: min(560px, 76%);
  }
}
</style>
