<template>
  <Teleport to="body">
    <Transition name="turnstile-dialog">
      <div
        v-if="modelValue"
        class="turnstile-dialog__overlay"
        @click.self="handleClose"
      >
        <div class="turnstile-dialog__panel">
          <button
            type="button"
            class="turnstile-dialog__close"
            @click="handleClose"
          >
            &times;
          </button>
          <div class="turnstile-dialog__badge">Cloudflare Turnstile</div>
          <h3 class="turnstile-dialog__title">{{ t("auth.turnstileDialogTitle") }}</h3>
          <p class="turnstile-dialog__description">
            {{ t("auth.turnstileDialogDescription") }}
          </p>
          <div
            class="turnstile-dialog__status"
            :class="`is-${statusType}`"
          >
            {{ statusMessage }}
          </div>
          <div class="turnstile-dialog__widget-shell">
            <div
              v-if="isWidgetLoading"
              class="turnstile-dialog__loading"
            >
              {{ t("common.loading") }}
            </div>
            <div
              ref="widgetRef"
              class="turnstile-dialog__widget"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

type TurnstileStatus = "info" | "success" | "error";

interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  language?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("浏览器环境不可用"));
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const handleLoad = () => resolve();
    const handleError = () => {
      turnstileScriptPromise = null;
      reject(new Error("安全校验加载失败，请稍后重试"));
    };

    const existingScript = document.getElementById(
      TURNSTILE_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.turnstile) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

interface Props {
  modelValue: boolean;
  siteKey: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [token: string];
}>();

const { $i18n } = useNuxtApp();
const t = (key: string) => String($i18n.t(key));

const widgetRef = ref<HTMLDivElement | null>(null);
const widgetId = ref<string | null>(null);
const isWidgetLoading = ref(false);
const statusType = ref<TurnstileStatus>("info");
const statusMessage = ref(t("auth.turnstileVerifyPrompt"));

const setStatus = (key: string, type: TurnstileStatus = "info") => {
  statusType.value = type;
  statusMessage.value = t(key);
};

const clearWidget = () => {
  if (typeof window !== "undefined" && window.turnstile && widgetId.value) {
    try {
      window.turnstile.remove(widgetId.value);
    } catch {
      try {
        window.turnstile.reset(widgetId.value);
      } catch {
        // 忽略组件销毁阶段的重复清理错误
      }
    }
  }

  widgetId.value = null;

  if (widgetRef.value) {
    widgetRef.value.innerHTML = "";
  }
};

const renderTurnstile = async () => {
  if (!props.modelValue) {
    return;
  }

  if (!props.siteKey) {
    setStatus("auth.turnstileSiteKeyMissing", "error");
    return;
  }

  await nextTick();

  if (!widgetRef.value) {
    return;
  }

  clearWidget();
  setStatus("auth.turnstileVerifyPrompt");
  isWidgetLoading.value = true;

  try {
    await loadTurnstileScript();

    if (!props.modelValue || !widgetRef.value || !window.turnstile) {
      return;
    }

    widgetId.value = window.turnstile.render(widgetRef.value, {
      sitekey: props.siteKey,
      theme: "light",
      language: "auto",
      callback: (token: string) => {
        setStatus("auth.turnstileVerifySuccess", "success");
        emit("success", token);
      },
      "expired-callback": () => {
        setStatus("auth.turnstileExpired", "error");
        if (widgetId.value && window.turnstile) {
          window.turnstile.reset(widgetId.value);
        }
      },
      "error-callback": () => {
        setStatus("auth.turnstileVerifyFailed", "error");
      },
    });
  } catch {
    setStatus("auth.turnstileLoadFailed", "error");
  } finally {
    isWidgetLoading.value = false;
  }
};

const handleClose = () => {
  emit("update:modelValue", false);
};

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      renderTurnstile();
      return;
    }

    clearWidget();
    isWidgetLoading.value = false;
    setStatus("auth.turnstileVerifyPrompt");
  },
  { flush: "post" }
);

watch(
  () => props.siteKey,
  (siteKey) => {
    if (props.modelValue && siteKey) {
      renderTurnstile();
    }
  }
);

onBeforeUnmount(() => {
  clearWidget();
});
</script>

<style scoped>
.turnstile-dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.45);
  backdrop-filter: blur(4px);
}

.turnstile-dialog__panel {
  position: relative;
  width: 100%;
  max-width: 420px;
  border-radius: 24px;
  padding: 28px 28px 24px;
  background:
    linear-gradient(180deg, rgba(255, 247, 230, 0.92) 0%, rgba(255, 255, 255, 0.98) 38%),
    #ffffff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
}

.turnstile-dialog__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.9);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.turnstile-dialog__close:hover {
  color: #4b5563;
  background: #ffffff;
}

.turnstile-dialog__badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 153, 0, 0.12);
  color: #d97706;
  font-size: 12px;
  line-height: 1;
}

.turnstile-dialog__title {
  margin: 18px 0 8px;
  color: #1f2937;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

.turnstile-dialog__description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.turnstile-dialog__status {
  margin-top: 18px;
  min-height: 20px;
  font-size: 13px;
  line-height: 20px;
  transition: color 0.2s ease;
}

.turnstile-dialog__status.is-info {
  color: #6b7280;
}

.turnstile-dialog__status.is-success {
  color: #059669;
}

.turnstile-dialog__status.is-error {
  color: #dc2626;
}

.turnstile-dialog__widget-shell {
  position: relative;
  margin-top: 16px;
  min-height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #fed7aa;
  border-radius: 18px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.92);
}

.turnstile-dialog__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 18px;
}

.turnstile-dialog__widget {
  display: flex;
  justify-content: center;
  width: 100%;
}

.turnstile-dialog-enter-active,
.turnstile-dialog-leave-active {
  transition: opacity 0.24s ease;
}

.turnstile-dialog-enter-active .turnstile-dialog__panel,
.turnstile-dialog-leave-active .turnstile-dialog__panel {
  transition: transform 0.24s ease, opacity 0.24s ease;
}

.turnstile-dialog-enter-from,
.turnstile-dialog-leave-to {
  opacity: 0;
}

.turnstile-dialog-enter-from .turnstile-dialog__panel,
.turnstile-dialog-leave-to .turnstile-dialog__panel {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}
</style>
