<template>
  <div class="study-center-page">
    <div class="dashboard-shell">
      <div class="top-tabs">
        <button
          v-for="(tab, index) in tabs"
          :key="tab.key"
          type="button"
          class="top-tab"
          :class="[getTabShapeClass(index), { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <svg
            class="top-tab-bg"
            :viewBox="getTabShapeConfig(index).viewBox"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              class="top-tab-shape"
              :d="getTabShapeConfig(index).path"
              :fill="activeTab === tab.key ? '#FF9900' : '#fbfcfe'"
              :stroke="activeTab === tab.key ? 'transparent' : '#d6e0ea'"
              stroke-width="2"
              stroke-linejoin="round"
              stroke-linecap="round"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <span class="top-tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">页面：</span>
          <div class="filter-control-mselect">
            <img :src="studyMenuIcon" alt="" class="control-icon" />
            <MSelect
              v-model="selectedPage"
              :options="studyPageOptions"
              value-key="value"
              label-key="label"
              class="study-filter-select study-filter-select-with-icon"
            />
          </div>
        </div>

        <div v-if="!isSchoolPage" class="filter-group">
          <span class="filter-label">选择：</span>
          <div
            v-if="!isCascadePage"
            class="filter-control-mselect filter-control-target-mselect"
          >
            <MSelect
              v-model="selectedTarget"
              :options="currentTargetOptions"
              value-key="value"
              label-key="label"
              class="study-filter-select study-filter-target-select"
            />
          </div>
          <div
            v-else
            ref="targetPickerRef"
            class="class-target-picker"
            :class="{ 'class-target-picker-student': isStudentPage }"
          >
            <button
              type="button"
              class="class-target-trigger"
              :class="{ open: isCascadeTargetOpen }"
              @click="toggleCascadeTargetOpen"
            >
              <span class="class-target-text">{{ selectedTargetLabel }}</span>
              <svg
                class="class-target-arrow"
                :class="{ open: isCascadeTargetOpen }"
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

            <div
              v-if="isCascadeTargetOpen"
              class="class-target-dropdown"
              :class="{ 'class-target-dropdown-student': isStudentPage }"
            >
              <div class="class-target-groups">
                <button
                  v-for="group in isClassPage ? classTargetGroups : studentTargetGrades"
                  :key="group.value"
                  type="button"
                  class="class-target-group"
                  :class="{
                    active: isClassPage
                      ? selectedClassGroup === group.value
                      : selectedStudentGrade === group.value,
                  }"
                  @click="
                    isClassPage
                      ? selectClassGroup(group.value)
                      : selectStudentGrade(group.value)
                  "
                >
                  <span>{{ group.label }}</span>
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div
                class="class-target-options"
                :class="{ 'class-target-middle': isStudentPage }"
              >
                <template v-if="isClassPage">
                  <button
                    v-for="option in activeClassGroup?.children || []"
                    :key="option.value"
                    type="button"
                    class="class-target-option"
                    :class="{ active: selectedTarget === option.value }"
                    @click="selectCascadeTarget(option)"
                  >
                    <span>{{ option.label }}</span>
                    <svg
                      v-if="selectedTarget === option.value"
                      class="class-target-check"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 8.25L6.5 11.25L12.5 5.25"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </template>

                <button
                  v-for="option in isStudentPage
                    ? activeStudentGrade?.children || []
                    : []"
                  :key="option.value"
                  type="button"
                  class="class-target-option class-target-option-parent"
                  :class="{ active: selectedStudentClass === option.value }"
                  @click="selectStudentClass(option.value)"
                >
                  <span>{{ option.label }}</span>
                  <svg
                    class="class-target-chevron"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      stroke-width="1.7"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div v-if="isStudentPage" class="class-target-options class-target-leaf">
                <button
                  v-for="option in activeStudentClass?.children || []"
                  :key="option.value"
                  type="button"
                  class="class-target-option"
                  :class="{ active: selectedTarget === option.value }"
                  @click="selectCascadeTarget(option)"
                >
                  <span>{{ option.label }}</span>
                  <svg
                    v-if="selectedTarget === option.value"
                    class="class-target-check"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.5 8.25L6.5 11.25L12.5 5.25"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="filter-group filter-group-date">
          <span class="filter-label">时间</span>
          <MDateRangePicker
            v-model="selectedDateRange"
            :presets="studyDatePresets"
            @semester-click="openSemesterSettingsModal"
            class="study-date-filter"
          />
        </div>
      </div>

      <div class="metric-grid">
        <article
          v-for="metric in currentDashboard.metrics"
          :key="metric.label"
          class="metric-card"
          :class="metric.theme"
        >
          <div class="metric-card-inner">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
          </div>
          <img :src="metric.image" alt="" class="metric-illustration" />
        </article>
      </div>

      <div class="main-grid">
        <section class="panel panel-large">
          <div class="panel-header">
            <div class="panel-title">{{ currentDashboard.evaluationTitle }}</div>
            <div class="panel-meta">
              平均成绩：
              <strong>{{ currentDashboard.averageValue }}</strong>
            </div>
          </div>

          <div class="panel-toolbar">
            <div class="toolbar-select">
              <select v-model="selectedEvaluationScope">
                <option
                  v-for="option in evaluationScopeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <span class="control-arrow">⌄</span>
            </div>
          </div>

          <div class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>{{ currentDashboard.emptyText }}</span>
          </div>
        </section>

        <section class="panel panel-progress">
          <div class="panel-header">
            <div class="panel-title">{{ currentDashboard.progressTitle }}</div>
          </div>

          <div class="panel-toolbar">
            <div class="toolbar-select toolbar-select-wide">
              <select v-model="selectedCourse">
                <option
                  v-for="item in currentDashboard.courseList"
                  :key="item.name"
                  :value="item.name"
                >
                  {{ item.name }}
                </option>
              </select>
              <span class="control-arrow">⌄</span>
            </div>
          </div>

          <div class="progress-content">
            <div class="progress-legend">
              <span class="legend-item">
                <i class="legend-dot legend-dot-finished"></i>
                {{ currentDashboard.progressFinishedLabel }}
              </span>
              <span class="legend-item">
                <i class="legend-dot legend-dot-pending"></i>
                {{ currentDashboard.progressPendingLabel }}
              </span>
            </div>

            <div class="donut-wrap">
              <div class="donut-label donut-label-top">
                <strong>{{ currentDashboard.finishedCount }}</strong>
                <span>{{ currentDashboard.progressFinishedLabel }}</span>
              </div>

              <div class="donut-label donut-label-bottom">
                <strong>{{ currentDashboard.pendingCount }}</strong>
                <span>{{ currentDashboard.progressPendingLabel }}</span>
              </div>

              <div class="donut-ring" :style="ringStyle">
                <div class="donut-center">
                  <div class="donut-value">{{ completionRateText }}%</div>
                  <div class="donut-text">{{ currentDashboard.rateLabel }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="panel panel-table">
          <div class="panel-header">
            <div class="panel-title">{{ currentDashboard.courseListTitle }}</div>
          </div>

          <div class="table-wrapper">
            <div class="table-head">
              <span>课程</span>
              <span>上课时间</span>
            </div>

            <div class="table-body">
              <div
                v-for="item in currentDashboard.courseList"
                :key="item.name"
                class="table-row"
              >
                <span>{{ item.name }}</span>
                <span>{{ item.time }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="bottom-grid">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">{{ currentDashboard.attendanceTitle }}</div>
            <div class="panel-subtitle">最近 6 次课堂表现</div>
          </div>

          <div class="bar-chart">
            <div
              v-for="item in currentDashboard.attendance"
              :key="item.label"
              class="bar-item"
            >
              <div class="bar-value">{{ item.value }}%</div>
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: `${item.value}%` }"></div>
              </div>
              <div class="bar-label">{{ item.label }}</div>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">{{ currentDashboard.practiceTitle }}</div>
            <div class="panel-subtitle">按维度统计当前完成情况</div>
          </div>

          <div class="progress-list">
            <div
              v-for="item in currentDashboard.practice"
              :key="item.label"
              class="progress-row"
            >
              <div class="progress-row-head">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}%</strong>
              </div>
              <div class="progress-line">
                <div
                  class="progress-line-fill"
                  :style="{ width: `${item.value}%` }"
                ></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <SemesterSettingsModal
      v-model="showSemesterSettingsModal"
      :items="semesterItems"
      @save="handleSemesterSave"
    />
  </div>
</template>

<script setup lang="ts">
import type { SemesterItem } from "~/components/study/SemesterSettingsModal.vue";

import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import SemesterSettingsModal from "~/components/study/SemesterSettingsModal.vue";
import dataCenterImage from "~/assets/images/datacenter.png";
import evaluationImage from "~/assets/images/ceping.png";
import emptyStateImage from "~/assets/images/datacenter.png";
import studyMenuIcon from "~/assets/images/study.png";
import trendImage from "~/assets/images/xueqing.png";

definePageMeta({
  layout: "sidebar",
});

type DashboardTab = "data" | "report" | "aiReport";
type TabShapeKey = "start" | "middle" | "end";

interface OptionItem {
  label: string;
  value: string;
}

interface ClassTargetGroup {
  label: string;
  value: string;
  children: OptionItem[];
}

interface StudentTargetClass {
  label: string;
  value: string;
  children: OptionItem[];
}

interface StudentTargetGrade {
  label: string;
  value: string;
  children: StudentTargetClass[];
}

interface MetricItem {
  label: string;
  value: string;
  image: string;
  theme: string;
}

interface CourseItem {
  name: string;
  time: string;
}

interface RatioItem {
  label: string;
  value: number;
}

interface DashboardConfig {
  metrics: MetricItem[];
  evaluationTitle: string;
  averageValue: string;
  emptyText: string;
  progressTitle: string;
  progressFinishedLabel: string;
  progressPendingLabel: string;
  rateLabel: string;
  finishedCount: number;
  pendingCount: number;
  courseListTitle: string;
  courseList: CourseItem[];
  attendanceTitle: string;
  attendance: RatioItem[];
  practiceTitle: string;
  practice: RatioItem[];
}

const tabs: Array<{ key: DashboardTab; label: string }> = [
  { key: "data", label: "学情数据" },
  { key: "report", label: "学情报告" },
  { key: "aiReport", label: "AI等级测评报告" },
];

const tabShapeConfigs: Record<TabShapeKey, { viewBox: string; path: string }> = {
  start: {
    viewBox: "0 0 210 58",
    path:
      "M18 1H170Q178 1 181 8L204 50Q207 57 199 57H18C8.611 57 1 49.389 1 40V18C1 8.611 8.611 1 18 1Z",
  },
  middle: {
    viewBox: "0 0 194 58",
    path: "M12 1H156Q164 1 167 8L189 50Q192 57 184 57H38Q30 57 27 50L5 8Q2 1 10 1Z",
  },
  end: {
    viewBox: "0 0 262 58",
    path:
      "M12 1H244C253.389 1 261 8.611 261 18V40C261 49.389 253.389 57 244 57H36Q28 57 25 50L3 8Q0 1 8 1Z",
  },
};

const studyPageOptions: OptionItem[] = [
  { label: "全校数据", value: "school" },
  { label: "年级数据", value: "grade" },
  { label: "班级数据", value: "class" },
  { label: "学生数据", value: "student" },
];

// const schoolTargetOptions: OptionItem[] = [
//   { label: "玛塔实验学校", value: "school-main" },
// ];

const gradeTargetOptions: OptionItem[] = [
  { label: "1年级", value: "grade-1" },
  { label: "2年级", value: "grade-2" },
  { label: "3年级", value: "grade-3" },
];

const classTargetGroups: ClassTargetGroup[] = [
  {
    label: "1年级",
    value: "group-grade-1",
    children: [
      { label: "1年级1111111", value: "class-1-1" },
      { label: "1年级22222", value: "class-1-2" },
      { label: "1年级A1", value: "class-1-3" },
      { label: "1年级A2", value: "class-1-4" },
      { label: "1年级A3", value: "class-1-5" },
    ],
  },
  {
    label: "12年级",
    value: "group-grade-12",
    children: [
      { label: "12年级1班", value: "class-12-1" },
      { label: "12年级2班", value: "class-12-2" },
      { label: "12年级A1", value: "class-12-3" },
      { label: "12年级A2", value: "class-12-4" },
    ],
  },
];

const studentTargetGrades: StudentTargetGrade[] = [
  {
    label: "1年级",
    value: "student-grade-1",
    children: [
      {
        label: "1年级1111111",
        value: "student-class-1-1",
        children: [
          { label: "lynn", value: "student-1-1-1" },
          { label: "jack", value: "student-1-1-2" },
          { label: "wang", value: "student-1-1-3" },
          { label: "tony", value: "student-1-1-4" },
          { label: "lynn", value: "student-1-1-5" },
        ],
      },
      {
        label: "1年级22222",
        value: "student-class-1-2",
        children: [
          { label: "mia", value: "student-1-2-1" },
          { label: "leo", value: "student-1-2-2" },
          { label: "anna", value: "student-1-2-3" },
        ],
      },
      {
        label: "1年级A1",
        value: "student-class-1-3",
        children: [
          { label: "coco", value: "student-1-3-1" },
          { label: "nina", value: "student-1-3-2" },
          { label: "max", value: "student-1-3-3" },
        ],
      },
      {
        label: "1年级A2",
        value: "student-class-1-4",
        children: [
          { label: "luke", value: "student-1-4-1" },
          { label: "iris", value: "student-1-4-2" },
          { label: "zoe", value: "student-1-4-3" },
        ],
      },
      {
        label: "1年级A3",
        value: "student-class-1-5",
        children: [
          { label: "yuki", value: "student-1-5-1" },
          { label: "momo", value: "student-1-5-2" },
          { label: "evan", value: "student-1-5-3" },
        ],
      },
    ],
  },
  {
    label: "12年级",
    value: "student-grade-12",
    children: [
      {
        label: "12年级1班",
        value: "student-class-12-1",
        children: [
          { label: "abby", value: "student-12-1-1" },
          { label: "eric", value: "student-12-1-2" },
          { label: "dylan", value: "student-12-1-3" },
        ],
      },
      {
        label: "12年级2班",
        value: "student-class-12-2",
        children: [
          { label: "olivia", value: "student-12-2-1" },
          { label: "lucas", value: "student-12-2-2" },
          { label: "ruby", value: "student-12-2-3" },
        ],
      },
      {
        label: "12年级A1",
        value: "student-class-12-3",
        children: [
          { label: "noah", value: "student-12-3-1" },
          { label: "emma", value: "student-12-3-2" },
          { label: "miles", value: "student-12-3-3" },
        ],
      },
      {
        label: "12年级A2",
        value: "student-class-12-4",
        children: [
          { label: "grace", value: "student-12-4-1" },
          { label: "ryan", value: "student-12-4-2" },
          { label: "ella", value: "student-12-4-3" },
        ],
      },
    ],
  },
];

const evaluationScopeOptions: OptionItem[] = [
  { label: "全部课程", value: "all" },
  { label: "AI创作", value: "creation" },
  { label: "AI编程", value: "coding" },
];

const dashboards: Record<DashboardTab, DashboardConfig> = {
  data: {
    metrics: [
      { label: "学生人数", value: "10", image: dataCenterImage, theme: "theme-blue" },
      { label: "创建作品数量", value: "17", image: evaluationImage, theme: "theme-cyan" },
      { label: "累计授课次数", value: "89", image: trendImage, theme: "theme-violet" },
    ],
    evaluationTitle: "班级AI素养评价",
    averageValue: "-",
    emptyText: "数据为空哦~",
    progressTitle: "授课进度",
    progressFinishedLabel: "已上课程",
    progressPendingLabel: "未上课程",
    rateLabel: "完成率",
    finishedCount: 1,
    pendingCount: 14,
    courseListTitle: "授课课程",
    courseList: [
      { name: "AI的幕后英雄-Python（体验课）", time: "2025年12月至今" },
      { name: "AI未来实验室（硬件版）", time: "2026年1月至今" },
      { name: "AI上神奇动物", time: "2025年12月至今" },
      { name: "AI上智慧生活", time: "2025年12月至今" },
      { name: "AI在变形工坊", time: "2025年12月至今" },
      { name: "Robo Genius 2023 智造未来（初中组）竞赛课程", time: "2025年12月至今" },
    ],
    attendanceTitle: "课程出勤率",
    attendance: [
      { label: "第1次", value: 96 },
      { label: "第2次", value: 92 },
      { label: "第3次", value: 88 },
      { label: "第4次", value: 94 },
      { label: "第5次", value: 90 },
      { label: "第6次", value: 97 },
    ],
    practiceTitle: "练习完成情况",
    practice: [
      { label: "图像识别", value: 82 },
      { label: "逻辑表达", value: 74 },
      { label: "模型训练", value: 68 },
      { label: "创意实践", value: 91 },
    ],
  },
  report: {
    metrics: [
      {
        label: "已生成学情报告",
        value: "12",
        image: evaluationImage,
        theme: "theme-blue",
      },
      { label: "待查看报告", value: "04", image: dataCenterImage, theme: "theme-cyan" },
      { label: "重点关注学生", value: "03", image: trendImage, theme: "theme-violet" },
    ],
    evaluationTitle: "班级学情报告概览",
    averageValue: "82.5",
    emptyText: "当前筛选条件下暂无可展示的报告详情",
    progressTitle: "报告覆盖率",
    progressFinishedLabel: "已生成",
    progressPendingLabel: "待生成",
    rateLabel: "覆盖率",
    finishedCount: 11,
    pendingCount: 5,
    courseListTitle: "最新报告",
    courseList: [
      { name: "一班 2026 春季阶段报告", time: "2026-03-10" },
      { name: "一班 2026 AI作品分析报告", time: "2026-03-08" },
      { name: "创新实验班 课程表现报告", time: "2026-03-05" },
      { name: "启航班 学习习惯追踪报告", time: "2026-03-03" },
      { name: "一班 Python体验课阶段报告", time: "2026-02-28" },
      { name: "创新实验班 项目协作表现报告", time: "2026-02-20" },
    ],
    attendanceTitle: "报告阅读率",
    attendance: [
      { label: "周一", value: 78 },
      { label: "周二", value: 85 },
      { label: "周三", value: 88 },
      { label: "周四", value: 92 },
      { label: "周五", value: 81 },
      { label: "周六", value: 76 },
    ],
    practiceTitle: "报告维度表现",
    practice: [
      { label: "学习投入度", value: 84 },
      { label: "课堂互动度", value: 77 },
      { label: "任务达成率", value: 89 },
      { label: "作品完成度", value: 72 },
    ],
  },
  aiReport: {
    metrics: [
      { label: "已测评学生", value: "23", image: trendImage, theme: "theme-blue" },
      { label: "平均等级", value: "B+", image: evaluationImage, theme: "theme-cyan" },
      { label: "优秀人数", value: "09", image: dataCenterImage, theme: "theme-violet" },
    ],
    evaluationTitle: "AI等级测评结果",
    averageValue: "B+",
    emptyText: "当前筛选条件下暂无可展示的测评画像",
    progressTitle: "测评完成率",
    progressFinishedLabel: "已测评",
    progressPendingLabel: "未测评",
    rateLabel: "完成率",
    finishedCount: 23,
    pendingCount: 5,
    courseListTitle: "测评记录",
    courseList: [
      { name: "AI素养基础等级测评", time: "2026-03-11" },
      { name: "图像智能应用等级测评", time: "2026-03-07" },
      { name: "AI创作表达能力测评", time: "2026-03-03" },
      { name: "Python逻辑思维等级测评", time: "2026-02-26" },
      { name: "智能体协作项目测评", time: "2026-02-19" },
      { name: "综合应用能力阶段测评", time: "2026-02-12" },
    ],
    attendanceTitle: "测评参与率",
    attendance: [
      { label: "A班", value: 91 },
      { label: "B班", value: 87 },
      { label: "C班", value: 94 },
      { label: "D班", value: 89 },
      { label: "E班", value: 86 },
      { label: "F班", value: 92 },
    ],
    practiceTitle: "能力维度表现",
    practice: [
      { label: "问题拆解", value: 86 },
      { label: "模型理解", value: 79 },
      { label: "数据意识", value: 74 },
      { label: "创意表达", value: 93 },
    ],
  },
};

const today = new Date().toISOString().slice(0, 10);

const showSemesterSettingsModal = ref(false);

const semesterItems = ref<SemesterItem[]>([
  {
    key: "2025-fall",
    label: "2025秋季学期",
    start: "2025-07-01",
    end: "2026-01-09",
  },
  {
    key: "2026-spring",
    label: "2026春季学期",
    start: "2026-03-01",
    end: "2026-06-30",
  },
]);

const studyDatePresets = computed(() => [
  { key: "all", label: "全部日期", start: "2021-04-27", end: today },
  { key: "custom", label: "自定义", mode: "custom" as const },
  ...semesterItems.value.map((item) => ({
    key: item.key,
    label: item.label,
    start: item.start,
    end: item.end,
  })),
]);

const activeTab = ref<DashboardTab>("data");
const selectedPage = ref(studyPageOptions[0]?.value || "");
const selectedTarget = ref("");
const selectedClassGroup = ref(classTargetGroups[0]?.value || "");
const selectedStudentGrade = ref(studentTargetGrades[0]?.value || "");
const selectedStudentClass = ref(studentTargetGrades[0]?.children[0]?.value || "");
const selectedEvaluationScope = ref(evaluationScopeOptions[0]?.value || "");
const selectedCourse = ref("");
const selectedDateRange = ref<[string, string]>(["2021-04-27", today]);
const isCascadeTargetOpen = ref(false);
const targetPickerRef = ref<HTMLElement | null>(null);

const openSemesterSettingsModal = () => {
  showSemesterSettingsModal.value = true;
};

const handleSemesterSave = (items: SemesterItem[]) => {
  semesterItems.value = items;
};

const currentDashboard = computed(() => dashboards[activeTab.value]);
const isSchoolPage = computed(() => selectedPage.value === "school");
const isClassPage = computed(() => selectedPage.value === "class");
const isStudentPage = computed(() => selectedPage.value === "student");
const isCascadePage = computed(() => isClassPage.value || isStudentPage.value);

const currentTargetOptions = computed(() => {
  // if (selectedPage.value === "school") return schoolTargetOptions;
  if (selectedPage.value === "grade") return gradeTargetOptions;
  return [];
});

const activeClassGroup = computed(
  () =>
    classTargetGroups.find((group) => group.value === selectedClassGroup.value) ||
    classTargetGroups[0]
);

const activeStudentGrade = computed(
  () =>
    studentTargetGrades.find((group) => group.value === selectedStudentGrade.value) ||
    studentTargetGrades[0]
);

const activeStudentClass = computed(
  () =>
    activeStudentGrade.value?.children.find(
      (group) => group.value === selectedStudentClass.value
    ) || activeStudentGrade.value?.children[0]
);

const findClassGroupByTarget = (targetValue: string) =>
  classTargetGroups.find((group) =>
    group.children.some((item) => item.value === targetValue)
  );

const findStudentGradeByTarget = (targetValue: string) =>
  studentTargetGrades.find((grade) =>
    grade.children.some((classItem) =>
      classItem.children.some((student) => student.value === targetValue)
    )
  );

const findStudentClassByTarget = (targetValue: string) => {
  const grade = findStudentGradeByTarget(targetValue);
  return grade?.children.find((classItem) =>
    classItem.children.some((student) => student.value === targetValue)
  );
};

const getDefaultClassTarget = () =>
  classTargetGroups[0]?.children[1]?.value ||
  classTargetGroups[0]?.children[0]?.value ||
  "";

const getDefaultStudentTarget = () =>
  studentTargetGrades[0]?.children[0]?.children[0]?.value || "";

const selectedTargetLabel = computed(() => {
  if (isClassPage.value) {
    const group = findClassGroupByTarget(selectedTarget.value) || activeClassGroup.value;
    const option =
      group?.children.find((item) => item.value === selectedTarget.value) ||
      group?.children[0];

    if (!group || !option) return "请选择";
    return `${group.label} / ${option.label}`;
  }

  if (isStudentPage.value) {
    const grade =
      findStudentGradeByTarget(selectedTarget.value) || activeStudentGrade.value;
    const classItem =
      findStudentClassByTarget(selectedTarget.value) || activeStudentClass.value;
    const student =
      classItem?.children.find((item) => item.value === selectedTarget.value) ||
      classItem?.children[0];

    if (!grade || !classItem || !student) return "请选择";
    return `${grade.label} / ${classItem.label} / ${student.label}`;
  }

  return (
    currentTargetOptions.value.find((item) => item.value === selectedTarget.value)
      ?.label || "请选择"
  );
});

const completionRate = computed(() => {
  const total =
    currentDashboard.value.finishedCount + currentDashboard.value.pendingCount;
  if (!total) return 0;
  return (currentDashboard.value.finishedCount / total) * 100;
});

const completionRateText = computed(() => completionRate.value.toFixed(1));

const ringStyle = computed(() => ({
  background: `conic-gradient(#4F72FF 0 ${completionRate.value}%, #2ED4C7 ${completionRate.value}% 100%)`,
}));

const getTabShapeKey = (index: number): TabShapeKey => {
  if (index === 0) return "start";
  if (index === tabs.length - 1) return "end";
  return "middle";
};

const getTabShapeClass = (index: number) => `tab-shape-${getTabShapeKey(index)}`;

const getTabShapeConfig = (index: number) => tabShapeConfigs[getTabShapeKey(index)];

const toggleCascadeTargetOpen = () => {
  isCascadeTargetOpen.value = !isCascadeTargetOpen.value;
};

const selectClassGroup = (groupValue: string) => {
  selectedClassGroup.value = groupValue;
  const group = classTargetGroups.find((item) => item.value === groupValue);

  if (!group) return;
  if (!group.children.some((item) => item.value === selectedTarget.value)) {
    selectedTarget.value = group.children[0]?.value || "";
  }
};

const selectStudentGrade = (gradeValue: string) => {
  selectedStudentGrade.value = gradeValue;
  const grade = studentTargetGrades.find((item) => item.value === gradeValue);

  if (!grade) return;
  const matchedClass = grade.children.find((classItem) =>
    classItem.children.some((student) => student.value === selectedTarget.value)
  );

  selectedStudentClass.value = matchedClass?.value || grade.children[0]?.value || "";
  if (!matchedClass) {
    selectedTarget.value = grade.children[0]?.children[0]?.value || "";
  }
};

const selectStudentClass = (classValue: string) => {
  selectedStudentClass.value = classValue;
  const classItem = activeStudentGrade.value?.children.find(
    (item) => item.value === classValue
  );

  if (!classItem) return;
  if (!classItem.children.some((item) => item.value === selectedTarget.value)) {
    selectedTarget.value = classItem.children[0]?.value || "";
  }
};

const selectCascadeTarget = (option: OptionItem) => {
  selectedTarget.value = option.value;
  isCascadeTargetOpen.value = false;
};

const syncTargetByPage = (page: string) => {
  if (page === "class") {
    const nextValue = getDefaultClassTarget();
    const nextGroup = findClassGroupByTarget(nextValue) || classTargetGroups[0];

    selectedClassGroup.value = nextGroup?.value || "";
    selectedTarget.value = nextValue;
    return;
  }

  if (page === "student") {
    const nextValue = getDefaultStudentTarget();
    const nextGrade = findStudentGradeByTarget(nextValue) || studentTargetGrades[0];
    const nextClass = findStudentClassByTarget(nextValue) || nextGrade?.children[0];

    selectedStudentGrade.value = nextGrade?.value || "";
    selectedStudentClass.value = nextClass?.value || "";
    selectedTarget.value = nextValue;
    return;
  }

  selectedTarget.value = currentTargetOptions.value[0]?.value || "";
};

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node | null;
  if (!target) return;
  if (targetPickerRef.value?.contains(target)) return;
  isCascadeTargetOpen.value = false;
};

watch(
  currentDashboard,
  (dashboard) => {
    if (!dashboard.courseList.some((item) => item.name === selectedCourse.value)) {
      selectedCourse.value = dashboard.courseList[0]?.name || "";
    }
  },
  { immediate: true }
);

watch(
  selectedPage,
  (page) => {
    isCascadeTargetOpen.value = false;
    syncTargetByPage(page);
  },
  { immediate: true }
);

watch(selectedTarget, (targetValue) => {
  if (isClassPage.value) {
    const group = findClassGroupByTarget(targetValue);
    if (group) {
      selectedClassGroup.value = group.value;
    }
  }

  if (isStudentPage.value) {
    const grade = findStudentGradeByTarget(targetValue);
    const classItem = findStudentClassByTarget(targetValue);

    if (grade) {
      selectedStudentGrade.value = grade.value;
    }

    if (classItem) {
      selectedStudentClass.value = classItem.value;
    }
  }
});

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>

<style scoped>
.study-center-page {
  --page-bg: #f3f6fb;
  --panel-bg: #ffffff;
  --panel-border: #dde6f2;
  --text-main: #1f2937;
  --text-sub: #697586;
  --brand: #2fa8ff;
  --brand-deep: #207ef7;
  min-height: calc(100vh - 70px);
  padding: 24px 28px 32px;
  background: radial-gradient(
      circle at top right,
      rgba(85, 150, 255, 0.08),
      transparent 24%
    ),
    linear-gradient(180deg, #f5f8fc 0%, #eff3f9 100%);
  overflow-y: auto;
}

.dashboard-shell {
  width: 100%;
}

.top-tabs {
  display: flex;
  justify-content: center;
  gap: 0;
  width: fit-content;
  margin: 0 auto 24px;
  padding: 0;
}

.top-tab {
  position: relative;
  display: inline-grid;
  align-items: center;
  justify-content: center;
  min-width: 182px;
  height: 58px;
  padding: 0 20px;
  border: 0;
  background: transparent;
  color: #4e5f75;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;
}

.top-tab + .top-tab {
  margin-left: -10px;
}

.top-tab:hover {
  color: #334155;
}

.top-tab-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.top-tab-shape {
  transition: fill 0.2s ease, stroke 0.2s ease, filter 0.2s ease;
}

.top-tab:hover:not(.active) .top-tab-shape {
  stroke: #c4d2e2;
}

.top-tab-label {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.top-tab.active {
  color: #fff;
}

.top-tab.active .top-tab-bg {
  filter: drop-shadow(0 10px 18px rgba(255, 153, 0, 0.2));
}

.top-tab.active:hover {
  color: #fff;
}

.tab-shape-middle {
  min-width: 170px;
}

.tab-shape-end {
  min-width: 220px;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 18px 36px;
  margin-bottom: 22px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group-date {
  position: relative;
  z-index: 50;
}

.filter-label {
  color: var(--text-main);
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.study-date-filter {
  width: 420px;
}

.filter-control,
.date-range,
.toolbar-select {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 40px;
  border: 1px solid #cad7e6;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
}

.filter-control {
  min-width: 240px;
}

.class-target-picker {
  position: relative;
  min-width: 298px;
}

.class-target-picker-student {
  min-width: 300px;
}

.class-target-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid #cad7e6;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
  color: var(--text-main);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.class-target-trigger:hover {
  border-color: #ffb84d;
}

.class-target-trigger.open {
  border-color: #ff9900;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.18);
}

.class-target-text {
  overflow: hidden;
  color: #8c9ab0;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.class-target-arrow {
  width: 16px;
  height: 16px;
  color: #27364b;
  flex: 0 0 auto;
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.class-target-arrow.open {
  transform: rotate(0deg);
}

.class-target-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: 122px minmax(0, 1fr);
  width: 298px;
  max-width: calc(100vw - 56px);
  min-height: 224px;
  border: 1px solid #d7e2ef;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 20px 36px rgba(42, 66, 108, 0.16);
  overflow: hidden;
}

.class-target-dropdown-student {
  grid-template-columns: 120px 154px 132px;
  width: 406px;
}

.class-target-groups {
  padding: 10px 0;
  border-right: 1px solid #edf2f8;
  background: #fbfdff;
}

.class-target-group,
.class-target-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.class-target-group {
  padding: 12px 14px 12px 16px;
  color: #3d4b61;
  font-size: 14px;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.class-target-group:hover {
  background: #fffaf2;
}

.class-target-group svg {
  width: 14px;
  height: 14px;
  color: #6a7b93;
}

.class-target-group.active {
  background: #fff4e8;
  color: #ff9900;
}

.class-target-group.active svg {
  color: #ff9900;
}

.class-target-options {
  max-height: 260px;
  padding: 8px 0;
  overflow-y: auto;
}

.class-target-middle {
  border-right: 1px solid #edf2f8;
}

.class-target-option {
  gap: 12px;
  padding: 12px 18px;
  color: #364152;
  font-size: 14px;
  text-align: left;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.class-target-option span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.class-target-option:hover {
  background: #fffaf2;
}

.class-target-option.active {
  color: #ff9900;
  background: rgba(255, 153, 0, 0.12);
}

.class-target-option-parent {
  color: #364152;
}

.class-target-option-parent.active {
  color: #ff9900;
  background: rgba(255, 153, 0, 0.12);
}

.class-target-chevron {
  width: 14px;
  height: 14px;
  color: #6a7b93;
  flex: 0 0 auto;
}

.class-target-option-parent.active .class-target-chevron {
  color: #ff9900;
}

.class-target-check {
  width: 16px;
  height: 16px;
  color: #ff9900;
  flex: 0 0 auto;
}

.filter-control-mselect {
  position: relative;
  min-width: 250px;
}

.filter-control-target-mselect {
  min-width: 240px;
}

.filter-control-icon {
  min-width: 250px;
  padding-left: 44px;
}

.control-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  width: 18px;
  height: 18px;
  object-fit: contain;
  opacity: 0.82;
  transform: translateY(-50%);
}

.filter-control-mselect .control-icon {
  z-index: 2;
}

.study-filter-select {
  width: 100%;
}

.study-filter-target-select :deep(div:first-child) {
  padding-left: 14px;
}

.study-filter-select :deep(div:first-child) {
  min-height: 40px;
  border-color: #cad7e6;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.02);
  padding: 0 12px 0 14px;
}

.study-filter-select-with-icon :deep(div:first-child) {
  padding-left: 44px;
}

.study-filter-select :deep(div:first-child > span) {
  color: var(--text-main);
  font-size: 14px;
}

.study-filter-select :deep(div:first-child > svg) {
  width: 16px;
  height: 16px;
  color: #6b7a90;
}

.filter-control select,
.toolbar-select select,
.date-range input {
  width: 100%;
  height: 40px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-main);
  font-size: 14px;
}

.filter-control select,
.toolbar-select select {
  appearance: none;
  padding: 0 38px 0 14px;
  cursor: pointer;
}

.filter-control-icon select {
  padding-left: 0;
}

.date-range {
  gap: 10px;
  padding: 0 12px;
}

.date-range input {
  min-width: 164px;
}

.date-separator {
  color: var(--text-main);
  font-size: 15px;
  font-weight: 600;
}

.control-arrow {
  position: absolute;
  right: 14px;
  color: #6b7a90;
  font-size: 16px;
  line-height: 1;
  pointer-events: none;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.metric-card {
  position: relative;
  min-height: 184px;
  padding: 28px;
  border-radius: 22px;
  overflow: hidden;
  color: #fff;
  box-shadow: 0 18px 40px rgba(60, 99, 163, 0.16);
}

.metric-card::before {
  content: "";
  position: absolute;
  inset: auto auto -72px -24px;
  width: 120%;
  height: 120px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  transform: rotate(-10deg);
}

.metric-card::after {
  content: "";
  position: absolute;
  top: -70px;
  right: -40px;
  width: 220px;
  height: 220px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.28) 0%,
    rgba(255, 255, 255, 0) 72%
  );
}

.metric-card-inner {
  position: relative;
  z-index: 1;
}

.metric-value {
  margin-bottom: 24px;
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
}

.metric-label {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  background: rgba(72, 123, 255, 0.22);
  backdrop-filter: blur(10px);
  font-size: 15px;
  font-weight: 700;
}

.metric-illustration {
  position: absolute;
  right: 22px;
  bottom: 16px;
  width: 160px;
  height: 160px;
  object-fit: contain;
  opacity: 0.34;
  filter: brightness(1.28) saturate(0.86);
}

.theme-blue {
  background: linear-gradient(135deg, #67cdec 0%, #57adf4 50%, #4a73f5 100%);
}

.theme-cyan {
  background: linear-gradient(135deg, #56c6ef 0%, #31b7f2 56%, #1f95f7 100%);
}

.theme-violet {
  background: linear-gradient(135deg, #bba8fb 0%, #ab94f9 44%, #8570f2 100%);
}

.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.75fr) minmax(300px, 0.72fr);
  gap: 18px;
  margin-bottom: 18px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel {
  display: flex;
  flex-direction: column;
  min-height: 280px;
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  background: var(--panel-bg);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.panel-large {
  min-height: 438px;
}

.panel-progress,
.panel-table {
  min-height: 438px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 14px;
}

.panel-title {
  color: var(--text-main);
  font-size: 16px;
  font-weight: 800;
}

.panel-meta,
.panel-subtitle {
  color: var(--text-sub);
  font-size: 13px;
}

.panel-meta strong {
  color: #f26a3d;
  font-size: 18px;
}

.panel-toolbar {
  padding: 0 20px 14px;
}

.toolbar-select {
  min-width: 156px;
}

.toolbar-select-wide {
  width: 100%;
}

.empty-state {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  color: #7a8aa1;
  font-size: 15px;
  background: linear-gradient(180deg, #fbfdff 0%, #f4f7fb 100%);
}

.empty-state-image {
  width: 112px;
  height: 112px;
  object-fit: contain;
  opacity: 0.88;
}

.progress-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  padding: 6px 20px 24px;
}

.progress-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  color: #6a7990;
  font-size: 13px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot-finished {
  background: #4f72ff;
}

.legend-dot-pending {
  background: #2ed4c7;
}

.donut-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 250px;
  height: 250px;
  margin-top: 10px;
}

.donut-ring {
  position: relative;
  display: grid;
  place-items: center;
  width: 182px;
  height: 182px;
  border-radius: 50%;
}

.donut-ring::after {
  content: "";
  position: absolute;
  inset: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(222, 232, 244, 0.8);
}

.donut-center {
  position: relative;
  z-index: 1;
  text-align: center;
}

.donut-value {
  color: #111827;
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
}

.donut-text {
  margin-top: 10px;
  color: #5f6f84;
  font-size: 15px;
  font-weight: 600;
}

.donut-label {
  position: absolute;
  display: flex;
  flex-direction: column;
  color: #6a7b90;
  font-size: 13px;
}

.donut-label strong {
  font-size: 18px;
  font-weight: 800;
}

.donut-label-top {
  top: 20px;
  right: 18px;
  align-items: flex-start;
  color: #4f72ff;
}

.donut-label-bottom {
  bottom: 14px;
  left: 22px;
  align-items: flex-end;
  color: #1abeb2;
}

.table-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 112px;
  gap: 16px;
  padding: 14px 18px;
}

.table-head {
  background: #8d99b1;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.table-row {
  color: #607089;
  font-size: 14px;
  line-height: 1.55;
  border-bottom: 1px solid #edf2f8;
}

.table-row:last-child {
  border-bottom: 0;
}

.bar-chart {
  display: flex;
  flex: 1;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 24px 24px;
}

.bar-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.bar-value {
  color: #4f72ff;
  font-size: 14px;
  font-weight: 700;
}

.bar-track {
  display: flex;
  align-items: flex-end;
  width: 42px;
  height: 168px;
  border-radius: 18px;
  background: #edf4fb;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  border-radius: 18px;
  background: linear-gradient(180deg, #2fb0ff 0%, #3468ff 100%);
  box-shadow: 0 10px 20px rgba(52, 104, 255, 0.18);
}

.bar-label {
  color: #75849a;
  font-size: 13px;
}

.progress-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 18px;
  padding: 10px 24px 24px;
}

.progress-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5b6b80;
  font-size: 14px;
}

.progress-row-head strong {
  color: var(--text-main);
  font-size: 15px;
}

.progress-line {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #ecf2f9;
  overflow: hidden;
}

.progress-line-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #37b8ff 0%, #326bff 100%);
}

@media (max-width: 1400px) {
  .main-grid {
    grid-template-columns: 1fr 1fr;
  }

  .panel-large {
    grid-column: 1 / -1;
  }

  .panel-table {
    grid-column: 1 / -1;
    min-height: 340px;
  }
}

@media (max-width: 1100px) {
  .metric-grid,
  .bottom-grid,
  .main-grid {
    grid-template-columns: 1fr;
  }

  .metric-card,
  .panel,
  .panel-large,
  .panel-progress,
  .panel-table {
    min-height: auto;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-control,
  .class-target-picker,
  .filter-control-mselect,
  .date-range,
  .study-date-filter {
    width: 100%;
  }

  .date-range {
    flex-wrap: wrap;
  }

  .date-range input {
    min-width: 0;
    flex: 1;
  }
}

@media (max-width: 768px) {
  .study-center-page {
    padding: 18px 16px 24px;
  }

  .top-tabs {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .top-tab {
    min-width: 132px;
    flex: 0 0 auto;
  }

  .top-tab + .top-tab {
    margin-left: 0;
  }

  .class-target-dropdown {
    width: 100%;
    max-width: none;
    grid-template-columns: 112px minmax(0, 1fr);
  }

  .class-target-dropdown-student {
    grid-template-columns: 88px minmax(0, 1fr) minmax(0, 1fr);
  }

  .metric-card {
    min-height: 160px;
    padding: 22px;
  }

  .metric-value {
    font-size: 40px;
  }

  .metric-illustration {
    width: 120px;
    height: 120px;
  }

  .bar-chart {
    gap: 12px;
    padding-inline: 16px;
  }

  .bar-track {
    width: 34px;
    height: 140px;
  }

  .table-head,
  .table-row {
    grid-template-columns: 1fr 94px;
    padding-inline: 14px;
    font-size: 13px;
  }
}
</style>
