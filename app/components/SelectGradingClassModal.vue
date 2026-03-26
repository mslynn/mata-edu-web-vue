<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <button class="close-btn" @click="handleClose">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <h2 class="modal-title">选择批改班级</h2>

        <div class="modal-body">
          <div v-if="loading" class="empty-state">加载中...</div>
          <div v-else-if="options.length === 0" class="empty-state">暂无可批改班级</div>
          <MSelect
            v-else
            v-model="selectedClassId"
            :options="options"
            placeholder="请选择班级"
            class="w-full"
            @change="handleChange"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface ClassOption {
  value: string;
  label: string;
}

const props = defineProps<{
  visible: boolean;
  loading?: boolean;
  options: ClassOption[];
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  select: [option: ClassOption];
}>();

const selectedClassId = ref<string | null>(null);

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      selectedClassId.value = null;
      return;
    }
    selectedClassId.value = props.options[0]?.value || null;
  }
);

watch(
  () => props.options,
  (options) => {
    if (!props.visible) return;
    if (!options.some((item) => item.value === selectedClassId.value)) {
      selectedClassId.value = options[0]?.value || null;
    }
  }
);

const handleClose = () => {
  emit("update:visible", false);
};

const handleChange = (value: string | number | null) => {
  const option = props.options.find((item) => item.value === String(value || ""));
  if (!option) return;
  emit("select", option);
  emit("update:visible", false);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  position: relative;
  width: 460px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 28px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.16);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #666;
}

.modal-title {
  margin: 0 0 28px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-body {
  min-height: 92px;
  display: flex;
  align-items: flex-start;
}

.empty-state {
  width: 100%;
  padding: 24px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
