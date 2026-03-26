<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <el-config-provider :locale="zhCn">
        <div class="modal-container">
          <button class="close-btn" @click="handleClose">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <h2 class="modal-title">{{ title }}</h2>

          <div class="modal-body">
            <div class="form-item">
              <el-date-picker
                v-model="examForm.date"
                type="date"
                placeholder="考试日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </div>

            <div class="form-item">
              <el-time-picker
                v-model="examForm.time"
                placeholder="考试时间"
                format="HH:mm"
                value-format="HH:mm"
                :disabled-hours="disabledHours"
                :disabled-minutes="disabledMinutes"
                :disabled-seconds="disabledSeconds"
                style="width: 100%"
              />
            </div>

            <div class="form-item">
              <div class="duration-input">
                <svg
                  class="duration-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l2.5 2.5" />
                  <path d="M9 3h6" />
                </svg>
                <input
                  v-model="examForm.duration"
                  type="text"
                  inputmode="numeric"
                  placeholder="考试时长"
                  class="duration-field"
                />
                <span class="duration-unit">分钟</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="handleClose">取消</button>
            <button class="btn-submit" @click="handleSubmit">{{ submitText }}</button>
          </div>
        </div>
      </el-config-provider>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const props = defineProps<{
  visible: boolean;
  courseId: string;
  classId: string;
  exerciseId?: string | null;
  title?: string;
  submitText?: string;
}>();

const emit = defineEmits<{
  "update:visible": [value: boolean];
  submit: [
    data: {
      courseId: string;
      exerciseId: string;
      classId: string;
      examDate: string;
      examTime: string;
      examDuration: number;
    },
  ];
}>();

const title = computed(() => props.title || "下发考试");
const submitText = computed(() => props.submitText || "下发考试");

const examForm = reactive({
  date: "",
  time: "",
  duration: "",
});

const resetForm = () => {
  examForm.date = "";
  examForm.time = "";
  examForm.duration = "";
};

watch(
  () => [props.visible, props.exerciseId, props.classId],
  ([visible]) => {
    if (visible) {
      resetForm();
    }
  }
);

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isTodaySelected = computed(() => {
  if (!examForm.date) return false;
  return examForm.date === formatDate(new Date());
});

const handleClose = () => {
  emit("update:visible", false);
};

const handleSubmit = () => {
  const courseId = String(props.courseId || "").trim();
  const exerciseId = String(props.exerciseId || "").trim();
  const classId = String(props.classId || "").trim();

  if (!courseId || !exerciseId || !classId) {
    ElMessage.warning("当前考试缺少下发参数");
    return;
  }

  if (!examForm.date || !examForm.time || !String(examForm.duration).trim()) {
    ElMessage.warning("请填写完整的考试信息");
    return;
  }

  const duration = Number(String(examForm.duration).trim());
  if (!Number.isInteger(duration) || duration <= 0) {
    ElMessage.warning("考试时长请输入正整数");
    return;
  }

  if (isTodaySelected.value) {
    const now = new Date();
    const [hour = 0, minute = 0] = String(examForm.time)
      .split(":")
      .map((value) => Number(value));
    const selectedTime = hour * 60 + minute;
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (!Number.isFinite(selectedTime) || selectedTime <= currentTime) {
      ElMessage.warning("考试时间只能选择当前时间之后");
      return;
    }
  }

  emit("submit", {
    courseId,
    exerciseId,
    classId,
    examDate: examForm.date,
    examTime: examForm.time,
    examDuration: duration,
  });
};

const disabledHours = () => {
  if (!isTodaySelected.value) return [];
  const currentHour = new Date().getHours();
  return Array.from({ length: currentHour }, (_, index) => index);
};

const disabledMinutes = (selectedHour: number) => {
  if (!isTodaySelected.value) return [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (selectedHour !== currentHour) return [];
  return Array.from({ length: currentMinute + 1 }, (_, index) => index);
};

const disabledSeconds = (selectedHour: number, selectedMinute: number) => {
  if (!isTodaySelected.value) return [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (selectedHour !== currentHour || selectedMinute !== currentMinute) return [];
  return Array.from({ length: 60 }, (_, index) => index);
};

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
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
  width: 520px;
  background: #fff;
  border-radius: 16px;
  padding: 28px 40px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.16);
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
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
  margin: 0;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.modal-body {
  margin-top: 28px;
}

.form-item + .form-item {
  margin-top: 14px;
}

.duration-input {
  display: flex;
  align-items: center;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #dbe7f5;
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.duration-input:focus-within {
  border-color: #ff9900;
  box-shadow: 0 0 0 1px rgba(255, 153, 0, 0.15);
}

.duration-icon {
  flex-shrink: 0;
  color: #7b93b2;
}

.duration-field {
  flex: 1;
  min-width: 0;
  height: 100%;
  margin: 0 12px;
  border: none;
  outline: none;
  font-size: 14px;
  color: #333;
  background: transparent;
}

.duration-field::placeholder {
  color: #b8c2cf;
}

.duration-unit {
  flex-shrink: 0;
  font-size: 14px;
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 38px;
}

.btn-cancel,
.btn-submit {
  min-width: 130px;
  height: 40px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #fff;
  color: #ff9900;
  border: 1px solid #ffcc80;
}

.btn-cancel:hover {
  background: #fff7e6;
  border-color: #ff9900;
}

.btn-submit {
  color: #fff;
  background: #ff9900;
  box-shadow: 0 8px 20px rgba(255, 153, 0, 0.22);
}

.btn-submit:hover {
  background: #e68a00;
}

:deep(.el-input__wrapper) {
  height: 42px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dbe7f5 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #ffcc80 inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #ff9900 inset;
}

:deep(.el-input__inner::placeholder) {
  color: #b8c2cf;
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
