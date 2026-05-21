<template>
  <div ref="aiwendaPageRef" class="aiwenda-page" :style="pageAdaptiveStyle">
    <div class="aiwenda-layout">
      <TeacherSidebar />

      <main class="aiwenda-main">
        <nav class="aiwenda-breadcrumb" :aria-label="t('aiwenda.breadcrumbAria')">
          <NuxtLink to="/system/opt" class="aiwenda-breadcrumb__back">
            <span>{{ t("aiwenda.aiPracticeCenter") }}</span>
          </NuxtLink>
          <span class="material-symbols-outlined aiwenda-breadcrumb__separator">
            chevron_right
          </span>
          <span class="aiwenda-breadcrumb__current">{{ t("aiwenda.freeChat") }}</span>
        </nav>

        <div class="aiwenda-content-grid">
          <section class="aiwenda-workspace">
          <div class="aiwenda-roles">
            <div class="aiwenda-role-head">
              <div class="aiwenda-section-title">{{ t("aiwenda.recommendedRoles") }}</div>
              <button type="button" class="aiwenda-role-view-all" @click="openRoleDialog">
                {{ t("aiwenda.viewAll") }}
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
                  <small>{{ role.roleDesc }}</small>
                </span>
              </button>
            </div>
          </div>

          <div ref="chatListRef" class="aiwenda-chat-list">
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
                  <div v-if="message.fileName" class="aiwenda-message__file">
                    <span class="material-symbols-outlined">description</span>
                    <span>{{ message.fileName }}</span>
                  </div>
                </div>
                <div v-if="message.role === 'assistant' && !message.pending" class="aiwenda-message__actions">
                  <span v-if="message.stopped" class="aiwenda-message__stopped-tag">({{ t("aiwenda.stopped") }})</span>
                  <button type="button" @click="copyMessageContent(message.content)" :title="t('aiwenda.copy')">
                    <span class="material-symbols-outlined">content_copy</span>
                    <span>{{ t("aiwenda.copy") }}</span>
                  </button>
                  <button type="button" @click="retryMessage(message)" :title="t('aiwenda.retry')">
                    <span class="material-symbols-outlined">refresh</span>
                    <span>{{ t("aiwenda.retry") }}</span>
                  </button>
                  <span class="aiwenda-message__actions-spacer"></span>
                  <button v-if="!message.stopped" type="button" class="aiwenda-message__like" :title="t('aiwenda.helpful')">
                    <span class="material-symbols-outlined">thumb_up</span>
                  </button>
                  <button v-if="!message.stopped" type="button" class="aiwenda-message__dislike" :title="t('aiwenda.notHelpful')">
                    <span class="material-symbols-outlined">thumb_down</span>
                  </button>
                </div>
                <time>{{ message.time }}</time>
              </div>

              <div v-if="message.role === 'user'" class="aiwenda-avatar is-user">
                <img :src="teacherAvatar" :alt="t('aiwenda.userAvatar')" />
              </div>
            </div>

            <div v-if="suggestedQuestions.length && !chatRequesting" class="aiwenda-suggestions">
              <p class="aiwenda-suggestions__label">{{ t("aiwenda.suggestionLabel") }}</p>
              <button
                v-for="(q, i) in suggestedQuestions"
                :key="i"
                type="button"
                class="aiwenda-suggestions__item"
                @click="composerText = q; void handleSendMessage()"
              >
                {{ q }}
              </button>
            </div>
          </div>

          <div v-if="showScrollUp || showScrollDown" class="aiwenda-scroll-btns">
            <button v-if="showScrollUp" type="button" class="aiwenda-scroll-btn" :title="t('aiwenda.backToTop')" @click="scrollChatToTop">
              <span class="material-symbols-outlined">arrow_upward</span>
            </button>
            <button v-if="showScrollDown" type="button" class="aiwenda-scroll-btn" :title="t('aiwenda.backToBottom')" @click="scrollChatToBottom">
              <span class="material-symbols-outlined">arrow_downward</span>
            </button>
          </div>

          <div v-if="chatRequesting" class="aiwenda-stop-wrap">
            <button type="button" class="aiwenda-stop-btn" @click="handleStopChat">
              <span class="material-symbols-outlined">pause_circle</span>
              {{ t("aiwenda.stopAnswer") }}
            </button>
          </div>

          <div class="aiwenda-toolbar">
            <button
              v-if="lastAssistantMessage && !chatRequesting"
              type="button"
              class="aiwenda-toolbar__btn is-retry"
              @click="retryMessage(lastAssistantMessage!)"
            >
              <span class="material-symbols-outlined">refresh</span>
              {{ t("aiwenda.regenerate") }}
            </button>
            <div
              class="aiwenda-quota-wrap"
              @mouseenter="showQuotaPopover = true; loadQuotaInfo()"
              @mouseleave="showQuotaPopover = false"
            >
              <button type="button" class="aiwenda-toolbar__btn">
                <span class="material-symbols-outlined">bolt</span>
                {{ t("aiwenda.quotaDetails") }}
              </button>
              <div v-if="showQuotaPopover" class="aiwenda-quota-popover">
                <div v-if="!quotaItems.length" class="aiwenda-quota-popover__row">
                  <span>{{ t("aiwenda.noQuota") }}</span>
                </div>
                <div v-for="item in quotaItems" :key="item.name" class="aiwenda-quota-popover__row">
                  <span>{{ item.name }}</span>
                  <strong>{{ item.limit }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="aiwenda-composer">
            <div class="aiwenda-composer__row-input">
              <span class="aiwenda-composer__ai-icon">
                <span class="material-symbols-outlined">smart_toy</span>
              </span>
              <textarea
                v-model="composerText"
                class="aiwenda-composer__input"
                rows="1"
                :placeholder="t('aiwenda.composerPlaceholder')"
                :disabled="chatRequesting"
                maxlength="3000"
                @keydown="handleComposerKeydown"
              ></textarea>
            </div>
            <div v-if="aiUploadFile" class="aiwenda-upload-file">
              <div class="aiwenda-upload-file__icon">
                <span class="material-symbols-outlined">{{ aiUploadFile.fileType === 'image' ? 'image' : 'description' }}</span>
              </div>
              <div class="aiwenda-upload-file__info">
                <span class="aiwenda-upload-file__name">{{ aiUploadFile.name }}</span>
                <span v-if="aiUploading" class="aiwenda-upload-file__status">{{ t("aiwenda.uploading") }}</span>
                <span v-else-if="aiUploadError" class="aiwenda-upload-file__status is-error">{{ aiUploadError }}</span>
              </div>
              <button type="button" class="aiwenda-upload-file__remove" @click="handleRemoveFile">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="aiwenda-composer__row-toolbar">
              <span class="aiwenda-composer__info">
                <span class="aiwenda-composer__hint">{{ t("aiwenda.composerHint") }}</span>
                <span class="aiwenda-composer__count">{{ composerText.length }} / 3000</span>
              </span>
              <span class="aiwenda-composer__tools">
                <button
                  type="button"
                  class="aiwenda-thinking-btn"
                  :class="{ 'is-on': enableThinking }"
                  @click="enableThinking = !enableThinking"
                >
                  <span class="material-symbols-outlined">psychology</span>
                  <span>{{ t("aiwenda.deepThinking") }}</span>
                </button>
                <div class="aiwenda-upload-wrap">
                  <button
                    type="button"
                    class="aiwenda-upload-btn"
                    :disabled="aiUploading"
                    :aria-label="t('aiwenda.uploadAttachment')"
                    @click="triggerUpload"
                  >
                    <span class="material-symbols-outlined">upload_file</span>
                  </button>
                  <div class="aiwenda-upload-tooltip">
                    {{ t("aiwenda.uploadTooltip") }}
                  </div>
                  <input
                    ref="uploadInputRef"
                    type="file"
                    :accept="AI_UPLOAD_ACCEPT"
                    class="aiwenda-upload-input"
                    @change="handleFileChange"
                  />
                </div>
                <button
                  type="button"
                  class="aiwenda-send-btn"
                  :disabled="!canSendMessage"
                  @click="handleSendMessage"
                >
                  {{ t("aiwenda.startQuestion") }}
                  <span class="material-symbols-outlined">arrow_forward</span>
                </button>
              </span>
            </div>
          </div>
          </section>

          <aside class="aiwenda-history">
          <div class="aiwenda-history__title">{{ t("aiwenda.historyTitle") }}</div>
          <div class="aiwenda-history__list">
            <div v-if="!historyCards.length" class="aiwenda-history__empty">{{ t("aiwenda.noHistory") }}</div>
            <button
              v-for="(item, idx) in historyCards"
              :key="item.id"
              type="button"
              class="aiwenda-history-card"
              :class="{ 'is-active': item.active, 'menu-up': idx >= historyCards.length - 2 }"
              @click="handleHistoryClick(item)"
            >
              <div class="aiwenda-history-card__head">
                <span>{{ item.title }}</span>
              </div>
              <span
                ref="moreRefs"
                class="aiwenda-history-card__more"
                :aria-label="t('aiwenda.moreActions')"
                @mouseenter="openMenuAt(item.id, $event)"
                @mouseleave="scheduleCloseMenu"
              >
                <span class="material-symbols-outlined">more_horiz</span>
              </span>
            </button>
          </div>
          <button type="button" class="aiwenda-new-chat" @click="handleNewChatFromHistory">
            <span class="material-symbols-outlined">add</span>
            <span>{{ t("aiwenda.newChat") }}</span>
          </button>
          </aside>
        </div>
      </main>
    </div>

    <Teleport to="body">
      <div
        v-show="hoverMenuId"
        class="aiwenda-history-menu-fixed"
        :style="menuFixedStyle"
        @mouseenter="cancelCloseMenu"
        @mouseleave="scheduleCloseMenu"
        @click.stop
      >
        <span class="aiwenda-history-menu__item" @click="handleHistoryRename(menuTargetCard!)">
          <span class="material-symbols-outlined">edit</span>
          <span>{{ t("aiwenda.rename") }}</span>
        </span>
        <span class="aiwenda-history-menu__item" @click="handleHistoryPin(menuTargetCard!)">
          <span class="material-symbols-outlined">push_pin</span>
          <span>{{ menuTargetCard?.pinned ? t('aiwenda.unpin') : t('aiwenda.pin') }}</span>
        </span>
        <span class="aiwenda-history-menu__item is-danger" @click="handleHistoryDelete(menuTargetCard!)">
          <span class="material-symbols-outlined">delete</span>
          <span>{{ t("aiwenda.delete") }}</span>
        </span>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showRoleDialog" class="aiwenda-dialog-mask aiwenda-role-dialog-mask">
        <div class="aiwenda-dialog-backdrop" @click="closeRoleDialog"></div>
        <section class="aiwenda-dialog aiwenda-role-dialog" role="dialog" aria-modal="true" :aria-label="t('aiwenda.roleCenter')">
          <button type="button" class="aiwenda-dialog__close" :aria-label="t('aiwenda.close')" @click="closeRoleDialog">
            <span class="material-symbols-outlined">close</span>
          </button>
          <header class="aiwenda-dialog__header">
            <h2>{{ t("aiwenda.roleCenter") }}</h2>
            <p>{{ t("aiwenda.roleCenterDesc") }}</p>
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
              <span
                v-if="role.roleId && !role.isBuiltin"
                class="aiwenda-role-delete-btn"
                @click.stop="handleDeleteRole(role)"
              >
                <span class="material-symbols-outlined">close</span>
              </span>
              <strong>{{ role.name }}</strong>
              <p :title="role.desc">{{ role.desc }}</p>
              <span
                v-if="role.roleId && !role.isBuiltin"
                class="aiwenda-role-config-entry"
                @click.stop="openRoleConfigDialog(role)"
              >
                <span class="material-symbols-outlined">tune</span>
                {{ t("aiwenda.editRoleConfig") }}
              </span>
            </button>
          </div>

          <footer class="aiwenda-role-dialog__footer">
            <button type="button" class="aiwenda-role-dialog__confirm" @click="confirmDialogRole">
              {{ t("aiwenda.confirmStartChat") }}
            </button>
            <button type="button" class="aiwenda-role-dialog__cancel" @click="closeRoleDialog">
              {{ t("aiwenda.cancel") }}
            </button>
          </footer>
        </section>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showRoleConfigDialog" class="aiwenda-dialog-mask aiwenda-config-dialog-mask">
        <div class="aiwenda-dialog-backdrop" @click="closeRoleConfigDialog"></div>
        <section class="aiwenda-dialog aiwenda-config-dialog" role="dialog" aria-modal="true" :aria-label="roleConfigDialogTitle">
          <button type="button" class="aiwenda-dialog__close" :aria-label="t('aiwenda.close')" @click="closeRoleConfigDialog">
            <span class="material-symbols-outlined">close</span>
          </button>

          <header class="aiwenda-dialog__header">
            <h2>{{ roleConfigDialogTitle }}</h2>
            <p>{{ roleConfigDialogDesc }}</p>
          </header>

          <form class="aiwenda-config-form" @submit.prevent="handleCreateRoleSubmit">
            <label class="aiwenda-config-field">
              <span>{{ t("aiwenda.roleName") }}</span>
              <div class="aiwenda-config-input-wrap">
                <input
                  v-model.trim="roleConfigForm.roleName"
                  :placeholder="roleConfigNamePlaceholder"
                  :disabled="roleConfigSubmitting"
                  maxlength="30"
                />
                <span class="material-symbols-outlined">edit_note</span>
              </div>
            </label>

            <label class="aiwenda-config-field">
              <span>
                <span>{{ t("aiwenda.rolePrompt") }}</span>
              </span>
              <textarea
                v-model.trim="roleConfigForm.prompt"
                :placeholder="t('aiwenda.rolePromptPlaceholder')"
                :disabled="roleConfigSubmitting"
                maxlength="1000"
              ></textarea>
            </label>

            <p class="aiwenda-config-tip">
              <span class="material-symbols-outlined">info</span>
              {{ t("aiwenda.rolePromptTip") }}
            </p>

            <div class="aiwenda-config-actions">
              <button
                type="submit"
                class="aiwenda-config-save"
                :disabled="roleConfigSubmitting"
              >
                <span class="material-symbols-outlined">save</span>
                {{ roleConfigSubmitting ? t("aiwenda.saving") : roleConfigSaveText }}
              </button>
              <button
                type="button"
                class="aiwenda-config-reset"
                :disabled="roleConfigSubmitting"
                @click="resetRoleConfigForm"
              >
                {{ t("aiwenda.resetRoleConfig") }}
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
import { aiAdmin } from "~/composables/api/ai";
import { useAiUpload, AI_UPLOAD_ACCEPT, AI_UPLOAD_TOOLTIP } from "~/composables/useAiUpload";
import type { AiUploadFile } from "~/composables/useAiUpload";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";

definePageMeta({
  layout: false,
});

const aiwendaPageRef = ref<HTMLElement | null>(null);
const { t, locale } = useI18n();
let aiwendaPageResizeObserver: ResizeObserver | null = null;
const aiwendaLayoutWidth = ref(1360);

const getAiwendaLayoutWidth = () => {
  if (typeof window === "undefined") return 1360;
  const width = aiwendaPageRef.value?.clientWidth || document.documentElement.clientWidth || 1360;
  return Math.max(1280, Math.round(width));
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

const { getOptList, createOptQa, editOptQa, delOptQa, createOptAiChat, stopAiOptQa, getAiQuotaDetail, uploadAI, getFiles, deleteFiles, getOptQaSessions, getOptQaDeatil, titleOptQa, topOptQa, delAiOptQa } = aiAdmin();

type AiwendaRoleCard = {
  key: string;
  name: string;
  roleName?: string;
  roleDesc: string;
  desc: string;
  prompt?: string;
  icon: string;
  roleId?: string;
  isBuiltin?: boolean;
};

type AiwendaChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  time: string;
  pending?: boolean;
  stopped?: boolean;
  fileName?: string;
};

const roleIconList = ["chat", "school", "person_raised_hand", "groups"];

const optRoleCards = ref<AiwendaRoleCard[]>([]);
const optAllRoleCards = ref<AiwendaRoleCard[]>([]);

const getRoleField = (item: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
};


const normalizeOptRoleRows = (rows: unknown, mode: "recommend" | "all"): unknown[] => {
  if (Array.isArray(rows)) return rows;
  if (!rows || typeof rows !== "object") return [];
  const obj = rows as Record<string, unknown>;
  if (Array.isArray(obj.recommendRoles)) {
    const list = [...obj.recommendRoles];
    if (mode === "all" && Array.isArray(obj.customRoles)) list.push(...obj.customRoles);
    return list;
  }
  if (Array.isArray(obj.rows)) return obj.rows;
  if (Array.isArray(obj.data)) return obj.data;
  return [];
};

const normalizeOptRoleList = (rows: unknown, mode: "recommend" | "all" = "recommend"): AiwendaRoleCard[] => {
  const list = normalizeOptRoleRows(rows, mode);

  return list
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item, index) => {
      const key =
        getRoleField(item, ["roleId", "id", "value", "key", "roleKey"]) || `role-${index}`;
      const name = getRoleField(item, ["roleName", "name", "label", "title"]) || t("aiwenda.unnamedRole");
      const roleDesc = getRoleField(item, ["roleDesc"]) || t("aiwenda.customRole");
      const desc = getRoleField(item, ["prompt", "desc", "description", "remark"]) || roleDesc;
      const icon = getRoleField(item, ["icon", "roleIcon"]) || roleIconList[index % roleIconList.length] || "chat";
      const prompt = getRoleField(item, ["prompt"]) || "";
      return {
        key,
        name,
        roleName: name,
        roleDesc,
        desc,
        prompt,
        icon,
        roleId: getRoleField(item, ["roleId", "id"]) || key,
        isBuiltin: Number(item.isBuiltin ?? 0) === 1,
      };
    });
};

const loadOptRoleList = async () => {
  try {
    const roleListResult = await getOptList();
    optRoleCards.value = normalizeOptRoleList(roleListResult, "recommend");
    optAllRoleCards.value = normalizeOptRoleList(roleListResult, "all");
    const firstRoleKey = roleCards.value.find((item) => item.key !== "config")?.key || "";
    if (firstRoleKey && !roleCards.value.some((item) => item.key === activeRoleKey.value)) {
      activeRoleKey.value = firstRoleKey;
    }
  } catch (error: unknown) {
    optRoleCards.value = [];
    optAllRoleCards.value = [];
  }
};

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
  void loadOptRoleList();
  void loadQuotaInfo();
  void loadHistorySessions();
  nextTick(() => {
    chatListRef.value?.addEventListener("scroll", updateScrollButtons, { passive: true });
  });
});

watch(locale, () => {
  void loadOptRoleList();
  void loadQuotaInfo();
  void loadHistorySessions();
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("resize", syncAiwendaLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncAiwendaLayoutWidth);
  aiwendaPageResizeObserver?.disconnect();
  aiwendaPageResizeObserver = null;
  chatListRef.value?.removeEventListener("scroll", updateScrollButtons);
});

const roleCards = computed<AiwendaRoleCard[]>(() => [
  ...optRoleCards.value,
  { key: "config", name: t("aiwenda.newRole"), roleDesc: t("aiwenda.customRole"), desc: t("aiwenda.customRole"), icon: "add" },
]);

const extendedRoleCards = computed<AiwendaRoleCard[]>(() => optAllRoleCards.value);

const activeRoleKey = ref("assistant");
const activeRole = computed(() => {
  return (
    roleCards.value.find((item) => item.key === activeRoleKey.value) ||
    extendedRoleCards.value.find((item) => item.key === activeRoleKey.value) ||
    roleCards.value.find((item) => item.key !== "config") ||
    null
  );
});
const pendingDialogRoleKey = ref("");
const showRoleDialog = ref(false);
const showRoleConfigDialog = ref(false);
const roleConfigEditingRoleId = ref("");
const roleConfigTargetName = ref("");
const roleConfigSubmitting = ref(false);
const roleConfigForm = reactive({
  roleName: "",
  prompt: "",
  
});
const isEditingRoleConfig = computed(() => Boolean(roleConfigEditingRoleId.value));
const roleConfigDialogTitle = computed(() => {
  return isEditingRoleConfig.value ? t("aiwenda.editRole") : t("aiwenda.newRole");
});
const roleConfigDialogDesc = computed(() => {
  return isEditingRoleConfig.value
    ? t("aiwenda.editRoleDesc")
    : t("aiwenda.newRoleDesc");
});
const roleConfigSaveText = computed(() => {
  return isEditingRoleConfig.value ? t("aiwenda.saveEdit") : t("aiwenda.saveRoleConfig");
});
const roleConfigNamePlaceholder = computed(() => {
  return roleConfigTargetName.value
    ? t("aiwenda.roleNamePlaceholderWithName", { name: roleConfigTargetName.value })
    : t("aiwenda.roleNamePlaceholder");
});

const resetRoleConfigForm = () => {
  roleConfigForm.roleName = "";
  roleConfigForm.prompt = "";
};

const resetChatSession = () => {
  activeChatSessionId.value = "";
  chatMessages.value = [];
  suggestedQuestions.value = [];
  composerText.value = "";
  activeChatAbortController.value?.abort();
  activeChatAbortController.value = null;
  chatRequesting.value = false;
  historyCards.value.forEach((c) => { c.active = false; });
};

const handleRoleClick = (key: string) => {
  if (key === "config") {
    openRoleConfigDialog();
    return;
  }
  if (key === activeRoleKey.value) return;
  activeRoleKey.value = key;
  resetChatSession();
};

const openRoleDialog = () => {
  pendingDialogRoleKey.value = extendedRoleCards.value[0]?.key || "";
  showRoleDialog.value = true;
};

const selectDialogRole = (key: string) => {
  pendingDialogRoleKey.value = key;
  confirmDialogRole();
  // 选中角色后用角色提示词自动发起对话
  nextTick(() => {
    const role = activeRole.value;
    composerText.value = role?.prompt || t("aiwenda.hello");
    void handleSendMessage();
  });
};

const closeRoleDialog = () => {
  showRoleDialog.value = false;
};

const confirmDialogRole = () => {
  if (pendingDialogRoleKey.value && pendingDialogRoleKey.value !== activeRoleKey.value) {
    activeRoleKey.value = pendingDialogRoleKey.value;
    resetChatSession();
  }
  closeRoleDialog();
};

const openRoleConfigDialog = (role?: AiwendaRoleCard) => {
  roleConfigEditingRoleId.value = role?.roleId || "";
  roleConfigTargetName.value = role?.name || "";
  resetRoleConfigForm();
  roleConfigForm.roleName = role?.name || "";
  roleConfigForm.prompt = role?.desc || "";
  showRoleConfigDialog.value = true;
};

const handleDeleteRole = async (role: AiwendaRoleCard) => {
  if (!role.roleId) return;
  try {
    await ElMessageBox.confirm(
      t("aiwenda.deleteRoleMessage", { name: role.name }),
      t("aiwenda.deleteRoleTitle"),
      { confirmButtonText: t("aiwenda.confirmDelete"), cancelButtonText: t("aiwenda.cancel"), type: "warning" },
    );
  } catch {
    return;
  }
  try {
    await delOptQa(role.roleId);
    ElMessage.success(t("aiwenda.roleDeleted"));
    void loadOptRoleList();
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error && error.message ? error.message : t("aiwenda.deleteRoleFailed"));
  }
};

const closeRoleConfigDialog = () => {
  if (roleConfigSubmitting.value) return;
  showRoleConfigDialog.value = false;
  roleConfigEditingRoleId.value = "";
  roleConfigTargetName.value = "";
  resetRoleConfigForm();
};

const handleCreateRoleSubmit = async () => {
  const roleName = roleConfigForm.roleName.trim();
  const prompt = roleConfigForm.prompt.trim();

  if (!roleName) {
    ElMessage.warning(t("aiwenda.inputRoleName"));
    return;
  }

  if (!prompt) {
    ElMessage.warning(t("aiwenda.inputRolePrompt"));
    return;
  }

  roleConfigSubmitting.value = true;
  try {
    if (isEditingRoleConfig.value) {
      await editOptQa({
        roleId: roleConfigEditingRoleId.value,
        roleName,
        prompt,
      });
      ElMessage.success(t("aiwenda.roleUpdated"));
    } else {
      await createOptQa({
        roleName,
        prompt,
      });
      ElMessage.success(t("aiwenda.roleSaved"));
    }
    showRoleConfigDialog.value = false;
    roleConfigEditingRoleId.value = "";
    roleConfigTargetName.value = "";
    resetRoleConfigForm();
    void loadOptRoleList();
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error && error.message ? error.message : t("aiwenda.saveRoleFailed"));
  } finally {
    roleConfigSubmitting.value = false;
  }
};

const chatListRef = ref<HTMLElement | null>(null);
const composerText = ref("");
const chatRequesting = ref(false);

// ---- 上传（composable） ----
const {
  uploadInputRef, aiUploadFile, aiUploading, aiUploadError,
  triggerUpload, clearUploadFile, handleRemoveFile, handleFileChange,
} = useAiUpload({ uploadAI, getFiles, deleteFiles });
// ---- 上传 end ----
const activeChatSessionId = ref("");
const activeChatAbortController = ref<AbortController | null>(null);

const createMessageId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const formatMessageTime = () => {
  const now = new Date();
  const period = now.getHours() < 12 ? t("aiwenda.morning") : t("aiwenda.afternoon");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${period} ${hour}:${minute}`;
};

const scrollChatToBottom = async () => {
  await nextTick();
  const target = chatListRef.value;
  if (!target) return;
  target.scrollTo({ top: target.scrollHeight, behavior: "smooth" });
};

const scrollChatToTop = () => {
  const target = chatListRef.value;
  if (!target) return;
  target.scrollTo({ top: 0, behavior: "smooth" });
};

const showScrollUp = ref(false);
const showScrollDown = ref(false);

const updateScrollButtons = () => {
  const el = chatListRef.value;
  if (!el) {
    showScrollUp.value = false;
    showScrollDown.value = false;
    return;
  }
  const threshold = 50;
  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  const canScroll = el.scrollHeight > el.clientHeight + threshold;
  // 不在底部 → 显示↓；在底部且有滚动空间 → 显示↑
  showScrollDown.value = !atBottom;
  showScrollUp.value = atBottom && canScroll;
};

const resolveOptQaSessionId = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  const directValue = record.sessionId || record.id;
  if (directValue) return String(directValue).trim();
  const data = record.data;
  if (data && typeof data === "object") {
    return resolveOptQaSessionId(data);
  }
  return "";
};

const enableThinking = ref(false);
const suggestedQuestions = ref<string[]>([]);

const defaultSuggestions = [
  t("aiwenda.defaultSuggestion1"),
  t("aiwenda.defaultSuggestion2"),
  t("aiwenda.defaultSuggestion3"),
];

const chatMessages = ref<AiwendaChatMessage[]>([]);

const canSendMessage = computed(
  () => (Boolean(composerText.value.trim()) || Boolean(aiUploadFile.value?.ossId)) && !chatRequesting.value
);

const lastAssistantMessage = computed(() => {
  for (let i = chatMessages.value.length - 1; i >= 0; i--) {
    if (chatMessages.value[i].role === "assistant") return chatMessages.value[i];
  }
  return null;
});

const handleSendMessage = async () => {
  const messageText = composerText.value.trim();
  const currentFile = aiUploadFile.value ? { ...aiUploadFile.value } : null;
  if (!messageText && !currentFile?.ossId) {
    ElMessage.warning(t("aiwenda.inputMessageOrUpload"));
    return;
  }
  if (chatRequesting.value) return;

  const currentRole = activeRole.value;
  const abortController = new AbortController();
  const assistantMessage = reactive<AiwendaChatMessage>({
    id: createMessageId(),
    role: "assistant",
    content: t("aiwenda.thinking"),
    time: formatMessageTime(),
    pending: true,
  });

  chatMessages.value.push(
    {
      id: createMessageId(),
      role: "user",
      content: messageText || t("aiwenda.analyzeAttachment"),
      time: formatMessageTime(),
      ...(currentFile?.name ? { fileName: currentFile.name } : {}),
    },
    assistantMessage,
  );
  composerText.value = "";
  clearUploadFile();
  chatRequesting.value = true;
  suggestedQuestions.value = [];
  activeChatAbortController.value = abortController;
  await scrollChatToBottom();

  try {
    const response = await createOptAiChat(
      {
        sessionId: activeChatSessionId.value || undefined,
        roleId: currentRole?.roleId || undefined,
        message: messageText || t("aiwenda.analyzeAttachment"),
        enableThinking: enableThinking.value,
        ...(currentFile?.ossId ? { fileRefs: [{ fileId: currentFile.ossId, fileType: currentFile.fileType }] } : {}),
      } as any,
      {
        signal: abortController.signal,
        onChunk: (payload, fullText) => {
          if (!activeChatSessionId.value) {
            const sessionId = resolveOptQaSessionId(payload);
            if (sessionId) {
              activeChatSessionId.value = sessionId;
            }
          }
          if (!fullText) return;
          assistantMessage.content = fullText;
          void scrollChatToBottom();
        },
      },
    );

    const resolvedSessionId = resolveOptQaSessionId(response);
    if (resolvedSessionId) {
      activeChatSessionId.value = resolvedSessionId;
    }
    const resolvedText = String((response as any)?.text || "").trim();
    if (resolvedText) {
      assistantMessage.content = resolvedText;
    }
    assistantMessage.pending = false;
    suggestedQuestions.value = defaultSuggestions;
  } catch (error: unknown) {
    assistantMessage.pending = false;
    const isAbort = error instanceof DOMException && error.name === "AbortError";
    if (isAbort) {
      assistantMessage.stopped = true;
      if (!assistantMessage.content || assistantMessage.content === t("aiwenda.thinking")) {
        assistantMessage.content = t("aiwenda.answerStopped");
      }
    } else {
      assistantMessage.content =
        error instanceof Error && error.message
          ? t("aiwenda.replyFailedWithMessage", { message: error.message })
          : t("aiwenda.replyFailed");
    }
  } finally {
    chatRequesting.value = false;
    activeChatAbortController.value = null;
    void scrollChatToBottom();
    void loadHistorySessions();
  }
};

const handleComposerKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Enter" || event.shiftKey) return;
  event.preventDefault();
  void handleSendMessage();
};

const handleStopChat = async () => {
  activeChatAbortController.value?.abort();
  activeChatAbortController.value = null;
  chatRequesting.value = false;
  if (activeChatSessionId.value) {
    try {
      await stopAiOptQa(activeChatSessionId.value);
    } catch {
      // 静默处理
    }
  }
};


const copyMessageContent = async (content: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    ElMessage.success(t("aiwenda.copied"));
  } catch {
    ElMessage.error(t("aiwenda.copyFailed"));
  }
};

const retryMessage = async (message: AiwendaChatMessage) => {
  const idx = chatMessages.value.findIndex((m) => m.id === message.id);
  if (idx < 1) return;
  const userMsg = chatMessages.value[idx - 1];
  if (!userMsg || userMsg.role !== "user") return;
  composerText.value = userMsg.content;
  suggestedQuestions.value = [];
  await nextTick();
  void handleSendMessage();
};

const showQuotaPopover = ref(false);
const quotaItems = ref<{ name: string; limit: string }[]>([]);

const loadQuotaInfo = async () => {
  try {
    const rows = await getAiQuotaDetail();
    const list = Array.isArray(rows) ? rows : [];
    quotaItems.value = list
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item) => ({
        name: String(item.quotaName || item.name || t("aiwenda.unknown")),
        limit: String(item.teacherLimit ?? item.userLimit ?? item.limit ?? 0),
      }));
  } catch {
    // 静默处理
  }
};

// ---- 历史记录 ----
type HistoryCard = {
  id: string;
  title: string;
  content: string;
  active?: boolean;
  pinned?: boolean;
};

const historyCards = ref<HistoryCard[]>([]);
const hoverMenuId = ref("");
const menuPosition = ref({ top: 0, left: 0 });
let closeMenuTimer: ReturnType<typeof setTimeout> | null = null;

const menuTargetCard = computed(() =>
  historyCards.value.find((c) => c.id === hoverMenuId.value) || null
);

const menuFixedStyle = computed(() => ({
  position: "fixed" as const,
  top: `${menuPosition.value.top}px`,
  left: `${menuPosition.value.left}px`,
  zIndex: 9999,
}));

const openMenuAt = (id: string, event: MouseEvent) => {
  cancelCloseMenu();
  hoverMenuId.value = id;
  const el = (event.currentTarget as HTMLElement);
  const rect = el.getBoundingClientRect();
  const menuHeight = 120;
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow < menuHeight) {
    menuPosition.value = { top: rect.top - menuHeight - 4, left: rect.right - 140 };
  } else {
    menuPosition.value = { top: rect.bottom + 4, left: rect.right - 140 };
  }
};

const scheduleCloseMenu = () => {
  closeMenuTimer = setTimeout(() => { hoverMenuId.value = ""; }, 120);
};
const cancelCloseMenu = () => {
  if (closeMenuTimer) { clearTimeout(closeMenuTimer); closeMenuTimer = null; }
};

const loadHistorySessions = async () => {
  try {
    const data = await getOptQaSessions();
    const list = Array.isArray(data) ? data : (data as any)?.rows || (data as any)?.data || [];
    historyCards.value = list
      .filter((item: any) => !!item && typeof item === "object" && (item.sessionId || item.id))
      .map((item: any) => ({
        id: String(item.sessionId || item.id || ""),
        title: String(item.title || item.sessionTitle || t("aiwenda.unnamedChat")),
        content: String(item.lastMessage || item.summary || item.content || ""),
        pinned: Boolean(item.pinned || item.isTop || item.top),
      }));
    // 标记当前活跃会话
    if (activeChatSessionId.value) {
      historyCards.value.forEach((c) => {
        c.active = c.id === activeChatSessionId.value;
      });
    }
  } catch {
    // 静默
  }
};

const handleHistoryClick = async (card: HistoryCard) => {
  if (card.id === activeChatSessionId.value) return;
  activeChatAbortController.value?.abort();
  activeChatAbortController.value = null;
  chatRequesting.value = false;

  try {
    const detail = await getOptQaDeatil(card.id);
    activeChatSessionId.value = card.id;

    // 同步角色选中状态
    const detailObj = (detail && typeof detail === "object" ? detail : {}) as Record<string, unknown>;
    const sessionRoleId = String(detailObj.roleId || "").trim();
    if (sessionRoleId) {
      const matchedRole =
        roleCards.value.find((r) => r.roleId === sessionRoleId) ||
        extendedRoleCards.value.find((r) => r.roleId === sessionRoleId);
      if (matchedRole) {
        activeRoleKey.value = matchedRole.key;
      }
    }

    const messages: any[] = Array.isArray(detail)
      ? detail
      : (detailObj.messages || detailObj.data || []) as any[];
    chatMessages.value = messages
      .filter((m: any) => !!m && typeof m === "object")
      .map((m: any) => ({
        id: String(m.id || m.messageId || createMessageId()),
        role: String(m.role || "user") as "assistant" | "user",
        content: String(m.content || m.message || ""),
        time: String(m.time || m.createTime || ""),
      }));
    suggestedQuestions.value = chatMessages.value.length ? defaultSuggestions : [];
    historyCards.value.forEach((c) => { c.active = c.id === card.id; });
    await scrollChatToBottom();
  } catch (error: any) {
    ElMessage.error(error?.message || t("aiwenda.loadSessionFailed"));
  }
};

const handleHistoryRename = async (card: HistoryCard) => {
  hoverMenuId.value = "";
  let newTitle = "";
  try {
    const { value } = await ElMessageBox.prompt(t("aiwenda.renamePrompt"), t("aiwenda.renameTitle"), {
      confirmButtonText: t("aiwenda.confirm"),
      cancelButtonText: t("aiwenda.cancel"),
      inputValue: card.title,
      inputValidator: (v) => !!v?.trim() || t("aiwenda.nameRequired"),
    });
    newTitle = value.trim();
  } catch { return; }
  try {
    await titleOptQa(card.id, newTitle);
    await loadHistorySessions();
    ElMessage.success(t("aiwenda.renameSuccess"));
  } catch (error: any) {
    ElMessage.error(error?.message || t("aiwenda.renameFailed"));
  }
};

const handleHistoryPin = async (card: HistoryCard) => {
  hoverMenuId.value = "";
  try {
    await topOptQa(card.id, card.pinned ? 0 : 1);
    await loadHistorySessions();
    ElMessage.success(card.pinned ? t("aiwenda.unpinSuccess") : t("aiwenda.pinSuccess"));
  } catch (error: any) {
    ElMessage.error(error?.message || t("aiwenda.operationFailed"));
  }
};

const handleHistoryDelete = async (card: HistoryCard) => {
  hoverMenuId.value = "";
  try {
    await ElMessageBox.confirm(t("aiwenda.deleteHistoryMessage"), t("aiwenda.tip"), {
      confirmButtonText: t("aiwenda.delete"),
      cancelButtonText: t("aiwenda.cancel"),
      type: "warning",
    });
  } catch { return; }
  try {
    await delAiOptQa(card.id);
    if (card.id === activeChatSessionId.value) {
      activeChatSessionId.value = "";
      chatMessages.value = [];
      suggestedQuestions.value = [];
    }
    await loadHistorySessions();
    ElMessage.success(t("aiwenda.deleteSuccess"));
  } catch (error: any) {
    ElMessage.error(error?.message || t("aiwenda.deleteFailed"));
  }
};

const handleNewChatFromHistory = () => {
  resetChatSession();
  // 恢复默认角色
  const defaultKey = roleCards.value.find((r) => r.key !== "config")?.key || "assistant";
  activeRoleKey.value = defaultKey;
};
// ---- 历史记录 end ----
</script>

<style scoped src="./aiwenda.scoped.css"></style>
<style src="./aiwenda.global.css"></style>


