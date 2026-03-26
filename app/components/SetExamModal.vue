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

          <h2 class="modal-title">设置考试</h2>

          <div class="modal-body">
            <!-- 左侧班级树 -->
            <div class="class-tree">
              <div v-if="loading" class="tree-status">加载中...</div>
              <div v-else-if="loadError" class="tree-status">{{ loadError }}</div>
              <div v-else-if="gradeList.length === 0" class="tree-status">
                暂无班级数据
              </div>
              <template v-else>
                <div v-for="grade in gradeList" :key="grade.grade" class="grade-item">
                  <div class="grade-header" @click="toggleGrade(grade.grade)">
                    <svg
                      class="arrow-icon"
                      :class="{ expanded: expandedGrades.includes(grade.grade) }"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                    <span>{{ grade.gradeName }}</span>
                  </div>
                  <div v-if="expandedGrades.includes(grade.grade)" class="class-list">
                    <div
                      v-for="cls in grade.classList"
                      :key="cls.classId"
                      class="class-item"
                      :class="{ active: selectedClass === cls.classId }"
                      @click="selectClass(cls)"
                    >
                      <span class="status-tag" :class="getStatusClass(cls.status)">{{
                        getStatusText(cls.status)
                      }}</span>
                      <span class="class-name">{{ cls.className }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <!-- 右侧表单/详情 -->
            <div class="exam-form">
              <template v-if="currentClass">
                <template v-if="!currentClassSent">
                  <div class="form-item">
                    <label class="form-label">考试日期</label>
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
                    <label class="form-label">考试时间</label>
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
                    <label class="form-label">考试时长</label>
                    <input
                      type="text"
                      v-model="examForm.duration"
                      inputmode="numeric"
                      maxlength="3"
                      placeholder="分钟"
                      class="form-input"
                      @input="handleDurationInput"
                    />
                  </div>
                </template>

                <template v-else>
                  <div class="form-item">
                    <label class="form-label">考试日期</label>
                    <div class="form-value">{{ currentClassData?.date || "-" }}</div>
                  </div>

                  <div class="form-item">
                    <label class="form-label">考试时间</label>
                    <div class="form-value">{{ currentClassData?.time || "-" }}</div>
                  </div>

                  <div class="form-item">
                    <label class="form-label">考试时长</label>
                    <div class="form-value">
                      {{
                        currentClassData?.duration
                          ? currentClassData.duration + "分钟"
                          : "-"
                      }}
                    </div>
                  </div>
                </template>
              </template>
              <div v-else class="empty-form-state">请先选择班级</div>
            </div>
          </div>

          <div class="modal-footer" v-if="currentClass">
            <button v-if="!currentClassSent" class="btn-submit" @click="handleSubmit">
              下发考试
            </button>
            <button v-else class="btn-withdraw" @click="handleWithdraw">撤回考试</button>
          </div>
        </div>
      </el-config-provider>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { cursorAdmin } from "~/composables/api/curosr";

interface ExamClassItem {
  classId: string;
  className: string;
  examDate: string | null;
  examTime: string | null;
  examDuration: string | number | null;
  status: number;
  evaluationIds?: Array<string | number> | null;
}

interface ExamGradeItem {
  grade: number;
  gradeName: string;
  classList: ExamClassItem[];
}

const props = defineProps<{
  visible: boolean;
  courseId: string;
  exerciseId?: string | null;
}>();

const emit = defineEmits(["update:visible", "submit", "withdraw"]);
const { setCourseEvaluationList } = cursorAdmin();

const gradeList = ref<ExamGradeItem[]>([]);
const loading = ref(false);
const loadError = ref("");

const expandedGrades = ref<number[]>([]);
const selectedClass = ref<string | null>(null);

const examForm = reactive({
  date: "",
  time: "",
  duration: "",
});

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

const findClassById = (classId: string | null) => {
  if (!classId) return null;
  for (const grade of gradeList.value) {
    const cls = grade.classList.find((item) => item.classId === classId);
    if (cls) return cls;
  }
  return null;
};

const syncExamForm = (cls: ExamClassItem | null) => {
  examForm.date = cls?.examDate || "";
  examForm.time = cls?.examTime || "";
  examForm.duration =
    cls?.examDuration === null || cls?.examDuration === undefined
      ? ""
      : String(cls.examDuration);
};

const toggleGrade = (gradeId: number) => {
  const index = expandedGrades.value.indexOf(gradeId);
  if (index > -1) {
    expandedGrades.value.splice(index, 1);
  } else {
    expandedGrades.value.push(gradeId);
  }
};

const selectClass = (cls: ExamClassItem) => {
  selectedClass.value = cls.classId;
  syncExamForm(cls);
};

const handleClose = () => {
  emit("update:visible", false);
};

const currentClass = computed(() => findClassById(selectedClass.value));

const currentClassSent = computed(() => Number(currentClass.value?.status || 0) === 1);

const currentClassData = computed(() => {
  if (!currentClass.value) return null;
  return {
    date: currentClass.value.examDate || "",
    time: currentClass.value.examTime || "",
    duration:
      currentClass.value.examDuration === null ||
      currentClass.value.examDuration === undefined
        ? ""
        : String(currentClass.value.examDuration),
  };
});

const getStatusClass = (status: number) => (Number(status) === 1 ? "sent" : "unsent");

const getStatusText = (status: number) => (Number(status) === 1 ? "已下发" : "未下发");

const loadExamSettingList = async () => {
  if (!props.courseId || !props.exerciseId) {
    gradeList.value = [];
    expandedGrades.value = [];
    selectedClass.value = null;
    syncExamForm(null);
    return;
  }

  loading.value = true;
  loadError.value = "";

  try {
    const data = await setCourseEvaluationList({
      courseId: props.courseId,
      exerciseId: props.exerciseId,
    });
    gradeList.value = Array.isArray(data) ? data : [];
    expandedGrades.value = gradeList.value[0] ? [gradeList.value[0].grade] : [];

    const current = findClassById(selectedClass.value);
    if (current) {
      syncExamForm(current);
      return;
    }

    const firstClass = gradeList.value.flatMap((item) => item.classList || [])[0] || null;
    selectedClass.value = firstClass?.classId || null;
    syncExamForm(firstClass);
  } catch (error) {
    console.error("加载设置考试列表失败:", error);
    loadError.value = "加载设置考试列表失败";
    gradeList.value = [];
    expandedGrades.value = [];
    selectedClass.value = null;
    syncExamForm(null);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      loadExamSettingList();
    }
  }
);

watch(
  () => props.exerciseId,
  () => {
    if (props.visible) {
      loadExamSettingList();
    }
  }
);

watch(
  () => props.courseId,
  () => {
    if (props.visible) {
      loadExamSettingList();
    }
  }
);

const handleSubmit = () => {
  if (!currentClass.value) return;

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
    const [hour, minute] = String(examForm.time)
      .split(":")
      .map((value) => Number(value));
    const selectedTime = hour * 60 + minute;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    if (!Number.isFinite(selectedTime) || selectedTime <= currentTime) {
      ElMessage.warning("考试时间只能选择当前时间之后");
      return;
    }
  }

  const payload: Record<string, any> = {
    courseId: props.courseId,
    exerciseId: props.exerciseId,
    classId: currentClass.value.classId,
    examDate: examForm.date,
    examTime: examForm.time,
    examDuration: duration,
  };

  if (currentClass.value.evaluationIds && currentClass.value.evaluationIds.length > 0) {
    payload.evaluationIds = currentClass.value.evaluationIds;
  }

  emit("submit", payload);
};

const handleDurationInput = () => {
  examForm.duration = String(examForm.duration || "")
    .replace(/\D/g, "")
    .slice(0, 3);
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

const handleWithdraw = () => {
  if (!currentClass.value) return;

  emit("withdraw", {
    exerciseId: props.exerciseId,
    classId: currentClass.value.classId,
  });
};

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 650px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
}
.close-btn:hover {
  color: #666;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0 0 24px;
}

.modal-body {
  display: flex;
  gap: 24px;
  min-height: 300px;
}

.class-tree {
  width: 240px;
  flex-shrink: 0;
  max-height: 350px;
  overflow-y: auto;
}

.tree-status {
  padding: 32px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.grade-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.arrow-icon {
  transition: transform 0.2s;
}
.arrow-icon.expanded {
  transform: rotate(180deg);
}

.class-list {
  padding-left: 24px;
}

.class-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 6px;
  border-left: 3px solid transparent;
}
.class-item:hover {
  background: #fff7e6;
}
.class-item.active {
  background: #e6f4ff;
  border-left-color: #40a9ff;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.status-tag.unsent {
  background: #fff0f0;
  color: #ff6b6b;
}
.status-tag.sent {
  background: #e6ffe6;
  color: #52c41a;
}

.class-name {
  font-size: 14px;
  color: #333;
}

.exam-form {
  flex: 1;
  padding-left: 24px;
  border-left: 1px solid #f0f0f0;
}

.form-item {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #ff9900;
}
.form-input::placeholder {
  color: #bbb;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #ddd inset;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #ff9900 inset;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #ff9900 inset;
}

.modal-footer {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.btn-submit {
  padding: 12px 48px;
  background: #ff9900;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}
.btn-submit:hover {
  background: #e68a00;
}

.btn-withdraw {
  padding: 12px 48px;
  background: white;
  border: 1px solid #ff9900;
  border-radius: 6px;
  color: #ff9900;
  font-size: 14px;
  cursor: pointer;
}
.btn-withdraw:hover {
  background: #fff7e6;
}

.form-value {
  padding: 10px 12px;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
}

.empty-form-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

/* 弹窗动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}
</style>
