<template>
  <MModal
    :model-value="modelValue"
    custom-width="860px"
    :show-footer="false"
    :show-close="false"
    content-class="!px-8 !py-0"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="semester-modal">
      <div class="semester-modal-header">
        <h3 class="semester-modal-title">{{ t("study.homePage.semesterModalTitle") }}</h3>
        <button
          type="button"
          class="semester-modal-close"
          @click="emit('update:modelValue', false)"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="semester-modal-toolbar">
        <button type="button" class="semester-add-btn" @click="startCreate">
          {{ t("study.homePage.semesterAdd") }}
        </button>
      </div>

      <div class="semester-table-card">
        <div class="semester-table-scroll">
          <MTable
            :columns="tableColumns"
            :data="tableRows"
            row-key="id"
            :show-index="true"
            :stripe="true"
          >
            <template #operation="{ row }">
              <div class="semester-row-actions">
                <button
                  type="button"
                  class="semester-ghost-btn"
                  @click.stop="startEdit(row.raw)"
                >
                  {{ t("study.homePage.semesterEdit") }}
                </button>
                <button
                  type="button"
                  class="semester-ghost-btn"
                  @click.stop="openDeleteConfirm(row.raw)"
                >
                  {{ t("study.homePage.semesterDelete") }}
                </button>
              </div>
            </template>

            <template #empty>
              <div class="semester-empty">{{ t("study.homePage.semesterEmpty") }}</div>
            </template>
          </MTable>
        </div>
      </div>
    </div>
  </MModal>

  <MModal
    :model-value="showEditorModal"
    custom-width="460px"
    :show-footer="false"
    :show-close="false"
    content-class="!px-0 !py-0"
    @update:model-value="handleEditorVisibility"
  >
    <div class="semester-editor">
      <div class="semester-editor-header">
        <h3 class="semester-editor-title">
          {{ editorMode === "create" ? t("study.homePage.semesterEditorCreate") : t("study.homePage.semesterEditorEdit") }}
        </h3>
        <button
          type="button"
          class="semester-editor-close"
          @click="cancelEdit"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="semester-editor-body">
        <input
          v-model.trim="editingForm.label"
          type="text"
          class="semester-editor-input"
          :placeholder="t('study.homePage.semesterNamePlaceholder')"
        >

        <ElConfigProvider :locale="elementLocale">
          <ElDatePicker
            v-model="editingRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            date-format="YYYY-MM-DD"
            range-separator="→"
            :start-placeholder="t('study.homePage.startDatePlaceholder')"
            :end-placeholder="t('study.homePage.endDatePlaceholder')"
            :teleported="false"
            class="semester-editor-date"
          />
        </ElConfigProvider>

        <div class="semester-editor-actions">
          <button type="button" class="semester-secondary-btn" @click="cancelEdit">
            {{ t("study.homePage.semesterCancel") }}
          </button>
          <button type="button" class="semester-primary-btn" @click="saveEdit">
            {{ t("study.homePage.semesterConfirm") }}
          </button>
        </div>
      </div>
    </div>
  </MModal>

  <MModal
    :model-value="showDeleteConfirmModal"
    custom-width="381px"
    :show-footer="false"
    :show-close="false"
    content-class="!px-0 !py-0"
    @update:model-value="handleDeleteModalVisibility"
  >
    <div class="semester-delete-modal">
      <div class="semester-delete-header">
        <h3 class="semester-delete-title">{{ t("study.homePage.semesterDeleteConfirmTitle") }}</h3>
        <button
          type="button"
          class="semester-delete-close"
          @click="cancelDelete"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="semester-delete-body">
        <p class="semester-delete-text">
          {{ t("study.homePage.semesterDeleteConfirmText", { name: pendingDeleteItem?.label || t("study.homePage.semesterDeleteFallback") }) }}
        </p>

        <div class="semester-delete-actions">
          <button type="button" class="semester-secondary-btn" @click="cancelDelete">
            {{ t("study.homePage.semesterCancel") }}
          </button>
          <button type="button" class="semester-primary-btn" @click="confirmDelete">
            {{ t("study.homePage.semesterDelete") }}
          </button>
        </div>
      </div>
    </div>
  </MModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElConfigProvider, ElDatePicker, ElMessage } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import enLocale from "element-plus/es/locale/lang/en";
import MModal from "~/components/ui/MModal.vue";
import MTable from "~/components/ui/MTable.vue";

const { t, locale } = useI18n();
const elementLocale = computed(() => locale.value === "en" ? enLocale : zhCn);

export interface SemesterItem {
  key: string;
  label: string;
  start: string;
  end: string;
}

interface SemesterForm {
  key: string | null;
  label: string;
}

const props = defineProps<{
  modelValue: boolean;
  items: SemesterItem[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  save: [items: SemesterItem[]];
}>();

const localItems = ref<SemesterItem[]>([]);
const showEditorModal = ref(false);
const showDeleteConfirmModal = ref(false);
const editorMode = ref<"create" | "edit">("create");
const editingForm = ref<SemesterForm>({
  key: null,
  label: "",
});
const editingRange = ref<[string, string] | []>([]);
const pendingDeleteItem = ref<SemesterItem | null>(null);

const cloneItems = (items: SemesterItem[]) =>
  items.map((item) => ({ ...item }));

const tableColumns = computed(() => [
  { key: "label", title: t("study.homePage.semesterColumnLabel"), minWidth: "180px" },
  { key: "rangeText", title: t("study.homePage.semesterColumnRange"), minWidth: "260px" },
  { key: "operation", title: t("study.homePage.semesterColumnAction"), width: "180px" },
]);

const tableRows = computed(() =>
  localItems.value.map((item) => ({
    id: item.key,
    label: item.label,
    rangeText: formatRange(item.start, item.end),
    operation: item.key,
    raw: item,
  }))
);

const createEmptyForm = (): SemesterForm => ({
  key: null,
  label: "",
});

const startCreate = () => {
  editorMode.value = "create";
  editingForm.value = createEmptyForm();
  editingRange.value = [];
  showEditorModal.value = true;
};

const startEdit = (item: SemesterItem) => {
  editorMode.value = "edit";
  editingForm.value = {
    key: item.key,
    label: item.label,
  };
  editingRange.value = [item.start, item.end];
  showEditorModal.value = true;
};

const cancelEdit = () => {
  showEditorModal.value = false;
  editingForm.value = createEmptyForm();
  editingRange.value = [];
};

const openDeleteConfirm = (item: SemesterItem) => {
  pendingDeleteItem.value = { ...item };
  showDeleteConfirmModal.value = true;
};

const cancelDelete = () => {
  showDeleteConfirmModal.value = false;
  pendingDeleteItem.value = null;
};

const handleDeleteModalVisibility = (value: boolean) => {
  if (value) {
    showDeleteConfirmModal.value = true;
    return;
  }

  cancelDelete();
};

const handleEditorVisibility = (value: boolean) => {
  if (value) {
    showEditorModal.value = true;
    return;
  }

  cancelEdit();
};

const saveEdit = () => {
  const label = editingForm.value.label.trim();
  if (!label || editingRange.value.length !== 2) return;

  const [start, end] = editingRange.value;
  if (!start || !end) return;

  const nextItem: SemesterItem = {
    key: editingForm.value.key || `semester_${Date.now()}`,
    label,
    start,
    end,
  };

  const existingIndex = localItems.value.findIndex((item) => item.key === nextItem.key);
  if (existingIndex >= 0) {
    localItems.value.splice(existingIndex, 1, nextItem);
  } else {
    localItems.value.push(nextItem);
  }

  localItems.value = [...localItems.value].sort((a, b) => a.start.localeCompare(b.start));
  emit("save", cloneItems(localItems.value));
  ElMessage.success(editorMode.value === "create" ? t("study.homePage.semesterCreateSuccess") : t("study.homePage.semesterEditSuccess"));
  cancelEdit();
};

const confirmDelete = () => {
  if (!pendingDeleteItem.value) return;

  const { key } = pendingDeleteItem.value;
  localItems.value = localItems.value.filter((item) => item.key !== key);
  emit("save", cloneItems(localItems.value));
  ElMessage.success(t("study.homePage.semesterDeleteSuccess"));

  if (editingForm.value?.key === key) {
    cancelEdit();
  }

  cancelDelete();
};

const formatRange = (start: string, end: string) => {
  const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return t("study.homePage.semesterDateFormat", { year, month, day });
  };

  return `${formatDate(start)}-${formatDate(end)}`;
};

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) {
      cancelEdit();
      cancelDelete();
      return;
    }
    localItems.value = cloneItems(props.items);
    cancelEdit();
    cancelDelete();
  },
  { immediate: true }
);
</script>

<style scoped>
.semester-modal,
.semester-editor,
.semester-delete-modal {
  --semester-theme: #ff9900;
  --semester-theme-dark: #e68a00;
  --semester-theme-soft: rgba(255, 153, 0, 0.16);
}

.semester-modal {
  display: flex;
  flex-direction: column;
  height: 560px;
  padding: 28px 0 36px;
}

.semester-modal-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;
}

.semester-modal-title {
  color: #101828;
  font-size: 20px;
  font-weight: 700;
}

.semester-modal-close {
  position: absolute;
  top: -2px;
  right: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: #667085;
  cursor: pointer;
}

.semester-modal-close svg {
  width: 24px;
  height: 24px;
}

.semester-modal-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.semester-add-btn,
.semester-primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--semester-theme) 0%, var(--semester-theme-dark) 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.semester-secondary-btn,
.semester-ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 62px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #d0dae5;
  border-radius: 8px;
  background: #fff;
  color: #475467;
  font-size: 14px;
  cursor: pointer;
}

.semester-table-card {
  flex: 1;
  min-height: 0;
  border: 1px solid #e3ebf4;
  border-radius: 14px;
  overflow: hidden;
}

.semester-table-scroll {
  height: 100%;
  overflow-y: auto;
}

.semester-row-actions {
  display: flex;
  gap: 10px;
}

.semester-empty {
  padding: 40px 0;
  color: #98a2b3;
  text-align: center;
}

.semester-editor {
  padding: 26px 30px 30px;
}

.semester-editor-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 26px;
}

.semester-editor-title {
  color: #101828;
  font-size: 18px;
  font-weight: 700;
}

.semester-editor-close {
  position: absolute;
  top: -2px;
  right: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #667085;
  cursor: pointer;
}

.semester-editor-close svg {
  width: 24px;
  height: 24px;
}

.semester-editor-body {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.semester-editor-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #d0dae5;
  border-radius: 10px;
  background: #fff;
  color: #101828;
  font-size: 15px;
  outline: none;
}

.semester-editor-input:focus {
  border-color: var(--semester-theme);
  box-shadow: 0 0 0 3px var(--semester-theme-soft);
}

.semester-editor-date {
  width: 100%;
}

.semester-editor-date :deep(.el-range-editor.el-input__wrapper) {
  width: 100%;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #d0dae5 inset;
}

.semester-editor-date :deep(.el-range-editor.is-active) {
  box-shadow: 0 0 0 1px var(--semester-theme) inset, 0 0 0 3px var(--semester-theme-soft);
}

.semester-editor-date :deep(.el-range-input) {
  color: #101828;
  font-size: 15px;
}

.semester-editor-date :deep(.el-range-separator) {
  color: var(--semester-theme);
  font-size: 16px;
  font-weight: 700;
}

.semester-editor-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 6px;
}

.semester-editor-actions .semester-secondary-btn,
.semester-editor-actions .semester-primary-btn {
  min-width: 130px;
  height: 40px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
}

.semester-editor-actions .semester-secondary-btn {
  border-color: rgba(255, 153, 0, 0.35);
  color: var(--semester-theme);
}

.semester-delete-modal {
  padding: 24px 24px 26px;
}

.semester-delete-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.semester-delete-title {
  color: #101828;
  font-size: 18px;
  font-weight: 700;
}

.semester-delete-close {
  position: absolute;
  top: -2px;
  right: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #667085;
  cursor: pointer;
}

.semester-delete-close svg {
  width: 24px;
  height: 24px;
}

.semester-delete-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
}

.semester-delete-text {
  color: #475467;
  font-size: 14px;
  line-height: 1.7;
  text-align: center;
}

.semester-delete-actions {
  display: flex;
  gap: 14px;
}

.semester-delete-actions .semester-secondary-btn,
.semester-delete-actions .semester-primary-btn {
  min-width: 118px;
  height: 40px;
}

@media (max-width: 900px) {
  .semester-modal {
    height: auto;
    min-height: 560px;
  }

  .semester-editor {
    padding: 24px 20px 24px;
  }
}
</style>
