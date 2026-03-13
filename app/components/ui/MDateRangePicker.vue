<template>
  <div ref="rootRef" class="m-date-range-picker" :class="{ open: isOpen }">
    <div class="m-date-range-trigger" :class="{ open: isOpen }" @click="openPanel()">
      <span class="m-date-range-values">
        <span
          class="m-date-range-input-shell"
          @click.stop="openPanel('start')"
        >
          <input
            :value="inputValue[0]"
            type="text"
            class="m-date-range-input"
            :placeholder="props.startPlaceholder"
            @focus="openPanel('start')"
            @input="handleInputChange(0, $event)"
            @keydown.enter.prevent="commitInputRange"
            @blur="handleInputBlur"
          />
        </span>

        <span class="m-date-range-separator">至</span>

        <span
          class="m-date-range-input-shell"
          @click.stop="openPanel('end')"
        >
          <input
            :value="inputValue[1]"
            type="text"
            class="m-date-range-input"
            :placeholder="props.endPlaceholder"
            @focus="openPanel('end')"
            @input="handleInputChange(1, $event)"
            @keydown.enter.prevent="commitInputRange"
            @blur="handleInputBlur"
          />
        </span>
      </span>

      <button type="button" class="m-date-range-arrow-button" @click.stop="toggleOpen">
        <svg
          class="m-date-range-arrow"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4.25 9.5L8 5.75L11.75 9.5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="isOpen"
      class="m-date-range-panel"
      :class="{ 'is-single': isSinglePanel }"
      @click="handlePanelClick"
    >
      <ElConfigProvider :locale="zhCn">
        <ElDatePickerPanel
          v-model="panelRange"
          class="m-date-range-element-panel"
          :class="panelClass"
          type="daterange"
          value-format="YYYY-MM-DD"
          date-format="YYYY-MM-DD"
          :border="false"
          :show-confirm="false"
          :show-footer="false"
          :unlink-panels="false"
          :disabled-date="mergedDisabledDate"
          @calendar-change="handleCalendarChange"
          @panel-change="handlePanelChange"
          @pick="handleRangePick"
        >
          <template #sidebar="{ class: sidebarClass }">
            <slot
              name="sidebar"
              :class="sidebarClass"
              :presets="presetList"
              :active-preset-key="activePresetKey"
              :select-preset="selectPreset"
              :semester-action-text="semesterActionText"
              :emit-semester-click="() => emit('semester-click')"
            >
              <div :class="[sidebarClass, 'm-date-range-sidebar']">
                <button
                  v-for="preset in presetList"
                  :key="preset.key"
                  type="button"
                  class="m-date-range-preset"
                  :class="{ active: activePresetKey === preset.key }"
                  @click="selectPreset(preset.key)"
                >
                  {{ preset.label }}
                </button>

                <button
                  v-if="showSemesterAction"
                  type="button"
                  class="m-date-range-semester"
                  @click="handleSemesterClick"
                >
                  {{ semesterActionText }}
                </button>
              </div>
            </slot>
          </template>
        </ElDatePickerPanel>
      </ElConfigProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { ElDatePickerPanel } from "element-plus";
import dayjs from "dayjs";
import zhCn from "element-plus/es/locale/lang/zh-cn";

type DateRangeValue = [string, string];
type ActiveField = "start" | "end";
type PanelSide = "left" | "right";

interface DateRangePreset {
  key: string;
  label: string;
  start?: string;
  end?: string;
  mode?: "preset" | "custom";
}

const props = withDefaults(
  defineProps<{
    modelValue: string[] | null;
    presets?: DateRangePreset[];
    disabledDate?: (date: Date) => boolean;
    semesterActionText?: string;
    showSemesterAction?: boolean;
    startPlaceholder?: string;
    endPlaceholder?: string;
  }>(),
  {
    presets: () => [],
    disabledDate: undefined,
    semesterActionText: "学期设置",
    showSemesterAction: true,
    startPlaceholder: "开始日期",
    endPlaceholder: "结束日期",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: [string, string]];
  change: [value: [string, string]];
  "semester-click": [];
}>();

const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const activeField = ref<ActiveField>("start");
const committedRange = ref<DateRangeValue>(["", ""]);
const inputValue = ref<DateRangeValue>(["", ""]);
const panelRange = ref<DateRangeValue>(["", ""]);
const isSinglePanel = ref(false);

const presetList = computed(() => props.presets);
const selectedPresetKey = ref("custom");
const activePresetKey = computed(() => selectedPresetKey.value);

const panelClass = computed(() => ({
  "is-single-left": isSinglePanel.value && activeField.value === "start",
  "is-single-right": isSinglePanel.value && activeField.value === "end",
}));

const getFieldIndex = (field: ActiveField) => (field === "start" ? 0 : 1);

const formatDateValue = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return dayjs(value).format("YYYY-MM-DD");
  if (typeof value === "number") return dayjs(value).format("YYYY-MM-DD");
  if (dayjs.isDayjs(value)) return value.format("YYYY-MM-DD");
  return "";
};

const normalizeRange = (value: unknown[] | null | undefined): DateRangeValue => {
  if (!Array.isArray(value)) return ["", ""];
  return [formatDateValue(value[0]), formatDateValue(value[1])];
};

const isSameRange = (
  left: string[] | null | undefined,
  right: string[] | null | undefined
) => {
  const [leftStart, leftEnd] = normalizeRange(left);
  const [rightStart, rightEnd] = normalizeRange(right);
  return leftStart === rightStart && leftEnd === rightEnd;
};

const getPresetRange = (presetKey: string): DateRangeValue => {
  const preset = presetList.value.find((item) => item.key === presetKey);
  if (!preset || preset.mode === "custom") return ["", ""];
  return [preset.start || "", preset.end || ""];
};

const getAllDateRange = (): DateRangeValue => {
  const allPreset =
    presetList.value.find((item) => item.key === "all") ||
    presetList.value.find((item) => item.mode !== "custom");

  if (!allPreset || allPreset.mode === "custom") {
    return ["", ""];
  }

  return [allPreset.start || "", allPreset.end || ""];
};

const allowedDateRange = computed(() => getAllDateRange());

const mergedDisabledDate = (date: Date) => {
  const [allowedStart, allowedEnd] = allowedDateRange.value;
  const current = dayjs(date).format("YYYY-MM-DD");

  if (allowedStart && current < allowedStart) return true;
  if (allowedEnd && current > allowedEnd) return true;

  return props.disabledDate?.(date) || false;
};

const getMatchedPresetKey = (range: DateRangeValue) => {
  const [start, end] = range;
  if (!start || !end) return "custom";

  const matchedPreset = presetList.value.find(
    (preset) => preset.mode !== "custom" && preset.start === start && preset.end === end
  );

  return matchedPreset?.key || "custom";
};

// 统一同步：已确认值、输入框值、面板值
const applyRange = (range: DateRangeValue) => {
  committedRange.value = [...range] as DateRangeValue;
  inputValue.value = [...range] as DateRangeValue;
  panelRange.value = [...range] as DateRangeValue;
  selectedPresetKey.value = getMatchedPresetKey(range);

  if (!isSameRange(range, props.modelValue)) {
    emit("update:modelValue", range);
    emit("change", range);
  }
};

// 只更新输入框展示，不直接提交给外部
const updateInputPreview = (field: ActiveField, value: unknown) => {
  const formatted = formatDateValue(value);
  if (!formatted) return;

  const next = [...inputValue.value] as DateRangeValue;
  next[getFieldIndex(field)] = formatted;
  inputValue.value = next;
};

const resetPanelRange = () => {
  const [start, end] = committedRange.value;
  if (start && end) {
    panelRange.value = [start, end];
    return;
  }

  panelRange.value = getAllDateRange();
};

const openPanel = (field?: ActiveField) => {
  if (field) {
    activeField.value = field;
  }
  isOpen.value = true;
  isSinglePanel.value = false;
  resetPanelRange();
};

const toggleOpen = () => {
  if (isOpen.value) {
    commitPreviewRangeOnClose();
    isOpen.value = false;
    isSinglePanel.value = false;
    return;
  }

  isOpen.value = true;
  isSinglePanel.value = false;
  resetPanelRange();
};

const isValidDateString = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = dayjs(value);
  return parsed.isValid() && parsed.format("YYYY-MM-DD") === value;
};

const isDateWithinAllowedRange = (value: string) => {
  const [allowedStart, allowedEnd] = allowedDateRange.value;
  if (allowedStart && value < allowedStart) return false;
  if (allowedEnd && value > allowedEnd) return false;
  return true;
};

const commitInputRange = () => {
  const nextRange = normalizeRange(inputValue.value);
  const [start, end] = nextRange;

  if (!start && !end) {
    committedRange.value = ["", ""];
    panelRange.value = getAllDateRange();
    selectedPresetKey.value = "custom";
    emit("update:modelValue", ["", ""]);
    emit("change", ["", ""]);
    return;
  }

  if (!start || !end) {
    inputValue.value = [...committedRange.value] as DateRangeValue;
    return;
  }

  if (!isValidDateString(start) || !isValidDateString(end)) {
    inputValue.value = [...committedRange.value] as DateRangeValue;
    return;
  }

  if (start > end) {
    inputValue.value = [...committedRange.value] as DateRangeValue;
    return;
  }

  if (!isDateWithinAllowedRange(start) || !isDateWithinAllowedRange(end)) {
    inputValue.value = [...committedRange.value] as DateRangeValue;
    return;
  }

  applyRange(nextRange);
};

const commitPreviewRangeOnClose = () => {
  const nextRange = normalizeRange(inputValue.value);
  let [start, end] = nextRange;

  if (!start && !end) {
    committedRange.value = ["", ""];
    panelRange.value = getAllDateRange();
    selectedPresetKey.value = "custom";
    emit("update:modelValue", ["", ""]);
    emit("change", ["", ""]);
    return;
  }

  if (!start || !end) {
    inputValue.value = [...committedRange.value] as DateRangeValue;
    return;
  }

  if (!isValidDateString(start) || !isValidDateString(end)) {
    inputValue.value = [...committedRange.value] as DateRangeValue;
    return;
  }

  if (!isDateWithinAllowedRange(start) || !isDateWithinAllowedRange(end)) {
    inputValue.value = [...committedRange.value] as DateRangeValue;
    return;
  }

  if (start > end) {
    if (activeField.value === "start") {
      end = start;
    } else {
      start = end;
    }
  }

  applyRange([start, end]);
};

const handleInputChange = (index: 0 | 1, event: Event) => {
  const target = event.target as HTMLInputElement;
  const next = [...inputValue.value] as DateRangeValue;
  next[index] = target.value.trim();
  inputValue.value = next;
};

const handleInputBlur = () => {
  window.setTimeout(() => {
    // 面板打开时，允许通过点年/月/日持续预览，不要在失焦瞬间回滚
    if (isOpen.value) return;

    const activeElement = document.activeElement;
    if (activeElement && rootRef.value?.contains(activeElement)) return;
    commitInputRange();
  }, 0);
};

const selectPreset = (presetKey: string) => {
  const preset = presetList.value.find((item) => item.key === presetKey);
  if (!preset) return;

  isSinglePanel.value = false;

  if (preset.mode === "custom") {
    committedRange.value = ["", ""];
    inputValue.value = ["", ""];
    panelRange.value = getAllDateRange();
    selectedPresetKey.value = "custom";
    activeField.value = "start";
    emit("update:modelValue", ["", ""]);
    emit("change", ["", ""]);
    return;
  }

  applyRange(getPresetRange(presetKey));
};

const handleRangePick = (value: unknown) => {
  if (!Array.isArray(value)) return;

  const nextRange = normalizeRange(value as unknown[]);
  if (!nextRange[0] || !nextRange[1]) return;

  applyRange(nextRange);
  isSinglePanel.value = false;
  isOpen.value = false;
};

const handleCalendarChange = (value: unknown) => {
  if (!Array.isArray(value)) return;

  const [start, end] = value as unknown[];

  if (start) {
    updateInputPreview("start", start);
  }

  if (end) {
    updateInputPreview("end", end);
    const nextRange = normalizeRange([start, end]);
    if (nextRange[0] && nextRange[1]) {
      applyRange(nextRange);
      isSinglePanel.value = false;
      isOpen.value = false;
    }
    return;
  }

  // 选完开始日期后，自动切到结束日期输入态
  if (start) {
    activeField.value = "end";
  }
};

const handlePanelChange = (value: unknown) => {
  if (!Array.isArray(value)) return;

  const [leftDate, rightDate] = value as unknown[];
  if (activeField.value === "start") {
    updateInputPreview("start", leftDate);
    return;
  }

  updateInputPreview("end", rightDate);
};

const getPanelSide = (target: HTMLElement): PanelSide | null => {
  const panel = target.closest(".el-date-range-picker__content");
  if (!panel) return null;
  if (panel.classList.contains("is-left")) return "left";
  if (panel.classList.contains("is-right")) return "right";
  return null;
};

// 用最直接的方式控制“单双面板”：
// 点年月标题 -> 单面板
// 选年份 -> 还会继续选月份，仍然保持单面板
// 选月份/日期 -> 回到日期视图，恢复双面板
const handlePanelClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const side = getPanelSide(target);
  if (side) {
    activeField.value = side === "left" ? "start" : "end";
  }

  if (target.closest(".el-date-picker__header-label")) {
    if (side) {
      isSinglePanel.value = true;
    }
    return;
  }

  if (target.closest(".el-year-table td")) {
    if (side) {
      isSinglePanel.value = true;
    }
    return;
  }

  if (target.closest(".el-month-table td")) {
    window.setTimeout(() => {
      isSinglePanel.value = false;
    }, 0);
    return;
  }

  if (target.closest(".el-date-table td")) {
    isSinglePanel.value = false;
  }
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null;
  if (!target) return;
  if (rootRef.value?.contains(target)) return;
  commitPreviewRangeOnClose();
  isOpen.value = false;
  isSinglePanel.value = false;
};

const handleSemesterClick = () => {
  commitPreviewRangeOnClose();
  isOpen.value = false;
  isSinglePanel.value = false;
  emit("semester-click");
};

watch(
  () => props.modelValue,
  (value) => {
    const nextRange = normalizeRange(value);
    committedRange.value = nextRange;
    inputValue.value = [...nextRange] as DateRangeValue;
    selectedPresetKey.value = getMatchedPresetKey(nextRange);
    resetPanelRange();
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
.m-date-range-picker {
  --m-date-range-theme: #ff9900;
  --m-date-range-theme-soft: rgba(255, 153, 0, 0.14);
  position: relative;
  width: 368px;
  max-width: min(100%, 368px);
}

.m-date-range-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 40px;
  padding: 0 8px 0 14px;
  border: 1px solid #cad7e6;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
  color: #1f2937;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.m-date-range-trigger:hover {
  border-color: var(--m-date-range-theme);
}

.m-date-range-trigger.open {
  border-color: var(--m-date-range-theme);
  box-shadow: 0 0 0 3px var(--m-date-range-theme-soft);
}

.m-date-range-values {
  display: inline-flex;
  align-items: stretch;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.m-date-range-input-shell {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  flex: 0 0 112px;
  min-width: 112px;
  height: 30px;
  padding: 0 2px;
  border-bottom: 2px solid transparent;
  background: transparent;
  transition: border-color 0.2s ease;
}

.m-date-range-input-shell:focus-within {
  border-bottom-color: var(--m-date-range-theme);
}

.m-date-range-input {
  min-width: 0;
  width: 100%;
  height: 28px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
  line-height: 28px;
  outline: none;
}

.m-date-range-input::placeholder {
  color: #94a3b8;
}

.m-date-range-input:focus {
  caret-color: var(--m-date-range-theme);
}

.m-date-range-separator {
  display: inline-flex;
  align-items: center;
  height: 30px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  line-height: 30px;
}

.m-date-range-arrow-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.m-date-range-arrow {
  width: 16px;
  height: 16px;
  color: #27364b;
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.m-date-range-picker.open .m-date-range-arrow {
  transform: rotate(0deg);
}

.m-date-range-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  z-index: 60;
  width: 700px;
  max-width: min(700px, calc(100vw - 56px));
}

.m-date-range-panel.is-single {
  width: 460px;
  max-width: min(460px, calc(100vw - 56px));
}

.m-date-range-element-panel {
  width: 100%;
  border: 1px solid #d7e2ef;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 20px 36px rgba(42, 66, 108, 0.16);
  overflow: hidden;
}

.m-date-range-sidebar {
  display: flex;
  flex-direction: column;
  width: 132px;
  min-width: 132px;
  height: 100%;
  gap: 4px;
  padding: 8px;
  border-right: 1px solid #edf2f8;
  background: #fbfdff;
}

.m-date-range-preset,
.m-date-range-semester {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 34px;
  padding: 0 6px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #3d4b61;
  font-size: 13px;
  line-height: 1.35;
  text-align: left;
  white-space: nowrap;
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.m-date-range-preset:hover,
.m-date-range-semester:hover {
  background: rgba(255, 153, 0, 0.12);
  color: var(--m-date-range-theme);
}

.m-date-range-preset.active {
  background: var(--m-date-range-theme);
  color: #fff;
}

.m-date-range-semester {
  margin-top: auto;
  color: var(--m-date-range-theme);
  font-weight: 600;
}

.m-date-range-element-panel :deep(.el-picker-panel__body-wrapper) {
  display: flex;
}

.m-date-range-element-panel :deep(.el-picker-panel__body) {
  flex: 1;
  padding: 12px 16px 14px;
}

.m-date-range-element-panel :deep(.el-date-range-picker__content) {
  width: 50%;
  padding: 0 14px 0 0;
}

.m-date-range-element-panel :deep(.el-date-range-picker__content.is-left) {
  border-right: 1px solid #edf2f8;
}

.m-date-range-element-panel :deep(.el-date-range-picker__content.is-right) {
  padding: 0 0 0 14px;
}

.m-date-range-element-panel.is-single-left
  :deep(.el-date-range-picker__content.is-right) {
  display: none;
}

.m-date-range-element-panel.is-single-right
  :deep(.el-date-range-picker__content.is-left) {
  display: none;
}

.m-date-range-element-panel.is-single-left :deep(.el-date-range-picker__content.is-left),
.m-date-range-element-panel.is-single-right
  :deep(.el-date-range-picker__content.is-right) {
  width: 100%;
  padding: 0;
  border-right: 0;
}

.m-date-range-element-panel :deep(.el-date-range-picker__time-header) {
  display: none;
}

.m-date-range-element-panel :deep(.el-date-range-picker__header) {
  height: 34px;
  margin-bottom: 8px;
}

.m-date-range-element-panel :deep(.el-date-range-picker__header div) {
  color: #202939;
  font-size: 16px;
  font-weight: 700;
}

.m-date-range-element-panel :deep(.el-date-picker__header-label.active) {
  color: var(--m-date-range-theme);
}

.m-date-range-element-panel :deep(.el-picker-panel__icon-btn) {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 14px;
}

.m-date-range-element-panel :deep(.el-picker-panel__icon-btn:hover) {
  color: var(--m-date-range-theme);
}

.m-date-range-element-panel :deep(.el-date-table th) {
  padding: 8px 0 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.m-date-range-element-panel :deep(.el-date-table td) {
  padding: 3px 0;
}

.m-date-range-element-panel :deep(.el-date-table td .el-date-table-cell) {
  height: 34px;
  padding: 0;
}

.m-date-range-element-panel :deep(.el-date-table td .el-date-table-cell__text) {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  line-height: 30px;
}

.m-date-range-element-panel :deep(.el-date-table td.available:hover) {
  color: var(--m-date-range-theme);
}

.m-date-range-element-panel :deep(.el-date-table td.today .el-date-table-cell__text) {
  color: var(--m-date-range-theme);
  font-weight: 700;
}

.m-date-range-element-panel :deep(.el-date-table td.in-range .el-date-table-cell) {
  background: rgba(255, 153, 0, 0.16);
}

.m-date-range-element-panel :deep(.el-date-table td.start-date .el-date-table-cell__text),
.m-date-range-element-panel :deep(.el-date-table td.end-date .el-date-table-cell__text) {
  background: var(--m-date-range-theme);
  color: #fff;
}

.m-date-range-element-panel :deep(.el-date-table td.next-month),
.m-date-range-element-panel :deep(.el-date-table td.prev-month) {
  color: #c6d1de;
}

.m-date-range-element-panel :deep(.el-month-table td),
.m-date-range-element-panel :deep(.el-year-table td) {
  padding: 8px 0;
}

.m-date-range-element-panel :deep(.el-month-table td .el-date-table-cell),
.m-date-range-element-panel :deep(.el-year-table td .el-date-table-cell) {
  height: 42px;
  padding: 4px 0;
}

.m-date-range-element-panel :deep(.el-month-table td .el-date-table-cell__text),
.m-date-range-element-panel :deep(.el-year-table td .el-date-table-cell__text) {
  width: 72px;
  height: 34px;
  border-radius: 10px;
  line-height: 34px;
}

.m-date-range-element-panel
  :deep(.el-month-table td.current:not(.disabled) .el-date-table-cell__text),
.m-date-range-element-panel
  :deep(.el-year-table td.current:not(.disabled) .el-date-table-cell__text) {
  background: var(--m-date-range-theme);
  color: #fff;
}

@media (max-width: 1100px) {
  .m-date-range-picker {
    width: 100%;
    max-width: none;
  }

  .m-date-range-panel {
    width: min(700px, calc(100vw - 48px));
    max-width: none;
  }

  .m-date-range-panel.is-single {
    width: min(460px, calc(100vw - 48px));
    max-width: none;
  }
}

@media (max-width: 768px) {
  .m-date-range-panel,
  .m-date-range-panel.is-single {
    position: static;
    width: 100%;
    margin-top: 10px;
  }

  .m-date-range-sidebar {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
    min-width: 0;
    border-right: 0;
    border-bottom: 1px solid #edf2f8;
  }

  .m-date-range-semester {
    grid-column: 1 / -1;
    margin-top: 0;
  }

  .m-date-range-element-panel :deep(.el-picker-panel__body-wrapper) {
    flex-direction: column;
  }

  .m-date-range-element-panel :deep(.el-picker-panel__body) {
    padding: 12px;
    overflow-x: auto;
  }

  .m-date-range-element-panel :deep(.el-picker-panel__body) {
    min-width: 540px;
  }
}
</style>
