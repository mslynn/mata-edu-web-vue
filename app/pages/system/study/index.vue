<template>
  <div
    class="study-center-page"
    :class="{ 'study-center-page--student': isStudentSelfView }"
  >
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
        <div v-if="!isStudentSelfView" class="filter-group">
          <span class="filter-label">页面：</span>
          <div class="filter-control-mselect">
            <img :src="studyMenuIcon" alt="" class="control-icon" />
            <MSelect
              v-model="selectedPage"
              :options="availableStudyPageOptions"
              value-key="value"
              label-key="label"
              class="study-filter-select study-filter-select-with-icon"
            />
          </div>
        </div>

        <div v-if="!isSchoolPage && !isStudentSelfView" class="filter-group">
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
          v-for="metric in displayMetrics"
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

      <div
        class="main-grid"
        :class="{
          'main-grid-school': activeTab === 'data' && isSchoolPage,
          'main-grid-student': activeTab === 'data' && isStudentPage,
          'main-grid-grade': activeTab === 'data' && isGradePage,
        }"
      >
        <section class="panel panel-large">
          <div class="panel-header">
            <div class="panel-title">{{ displayEvaluationTitle }}</div>
            <div class="panel-meta">
              平均成绩：
              <strong>{{ displayAverageValue }}</strong>
            </div>
          </div>

          <div class="panel-toolbar">
            <div
              v-if="activeTab === 'data' && isSchoolPage"
              class="toolbar-select-mselect school-task-select"
            >
              <MSelect
                v-model="selectedSchoolCourseId"
                :options="schoolCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="请选择课程"
                class="study-filter-select study-panel-select"
              />
            </div>
            <div
              v-else-if="activeTab === 'data' && isGradePage"
              class="toolbar-select-mselect school-task-select"
            >
              <MSelect
                v-model="selectedGradeCourseId"
                :options="gradeCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="请选择课程"
                class="study-filter-select study-panel-select"
              />
            </div>
            <div
              v-else-if="activeTab === 'data' && isClassPage"
              class="toolbar-select-mselect school-task-select"
            >
              <MSelect
                v-model="selectedClassCourseId"
                :options="classCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="请选择课程"
                class="study-filter-select study-panel-select"
              />
            </div>
            <div
              v-else-if="activeTab === 'data' && isStudentPage"
              class="toolbar-select-mselect school-task-select"
            >
              <MSelect
                v-model="selectedStudentCourseId"
                :options="studentCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="请选择课程"
                class="study-filter-select study-panel-select"
              />
            </div>
            <div v-else class="toolbar-select">
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

          <div
            v-if="activeTab === 'data' && shouldShowAILiteracyChart"
            class="school-ai-radar-panel"
            :title="`总分：${formatSchoolAILiteracyValue(displayAILiteracyFinalScore)}`"
          >
            <VChart
              class="school-ai-radar-chart"
              :option="displayAILiteracyRadarOption"
              autoresize
            />
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>{{ currentDashboard.emptyText }}</span>
          </div>
        </section>

        <section
          class="panel panel-table"
          :class="{
            'panel-table-compact-course': activeTab === 'data' && isClassPage,
            'student-main-panel-course': activeTab === 'data' && isStudentPage,
            'class-main-panel-course': activeTab === 'data' && isClassPage,
            'grade-main-panel-table': activeTab === 'data' && isGradePage,
          }"
        >
          <div class="panel-header">
            <div class="panel-title">{{ displayCourseListTitle }}</div>
          </div>

          <template v-if="activeTab === 'data' && (isSchoolPage || isGradePage)">
            <div v-if="hasTeachingStatsData" class="school-teaching-content">
              <div class="school-teaching-summary">
                <div class="school-teaching-grid">
                  <div class="school-teaching-metric school-teaching-metric-prepare">
                    <span class="school-teaching-metric-label">备课次数</span>
                    <strong class="school-teaching-metric-value">
                      {{ displayTeachingStats.prepareCount }}
                    </strong>
                  </div>

                  <div class="school-teaching-metric school-teaching-metric-teach">
                    <span class="school-teaching-metric-label">授课次数</span>
                    <strong class="school-teaching-metric-value">
                      {{ displayTeachingStats.teachCount }}
                    </strong>
                  </div>
                </div>

                <div class="school-teaching-duration-card">
                  <div class="school-teaching-duration-head">
                    <span class="school-teaching-duration-label">累计授课时长</span>
                    <span class="school-teaching-duration-minutes">
                      {{ displayTeachingStats.teachDurationMinutes }} 分钟
                    </span>
                  </div>
                  <div class="school-teaching-duration-value">
                    {{ displayTeachingStats.teachDuration }}
                  </div>
                  <div class="school-teaching-comparison">
                    <div class="school-teaching-comparison-row">
                      <div class="school-teaching-comparison-head">
                        <span>备课</span>
                        <strong>{{ displayTeachingStats.prepareCount }}</strong>
                      </div>
                      <div class="school-teaching-comparison-track">
                        <div
                          class="school-teaching-comparison-fill school-teaching-comparison-fill-prepare"
                          :style="{ width: `${schoolTeachingPrepareBarWidth}%` }"
                        ></div>
                      </div>
                    </div>

                    <div class="school-teaching-comparison-row">
                      <div class="school-teaching-comparison-head">
                        <span>授课</span>
                        <strong>{{ displayTeachingStats.teachCount }}</strong>
                      </div>
                      <div class="school-teaching-comparison-track">
                        <div
                          class="school-teaching-comparison-fill school-teaching-comparison-fill-teach"
                          :style="{ width: `${schoolTeachingTeachBarWidth}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <img :src="emptyStateImage" alt="" class="empty-state-image" />
              <span>数据为空哦~</span>
            </div>
          </template>

          <template v-else-if="activeTab === 'data' && isClassPage">
            <div v-if="hasClassCourseListData" class="school-course-table">
              <div class="school-course-table-head">
                <span>课程</span>
                <span>上课时间</span>
              </div>

              <div class="school-course-list school-course-list-table">
                <div
                  v-for="item in classCourseList"
                  :key="item.key"
                  class="school-course-item school-course-item-table"
                >
                  <span :title="item.name">{{ item.name }}</span>
                  <span :title="item.time">{{ item.time }}</span>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </template>

          <template v-else-if="activeTab === 'data' && isStudentPage">
            <div v-if="hasStudentCourseListData" class="school-course-table">
              <div class="school-course-table-head">
                <span>课程</span>
                <span>上课时间</span>
              </div>

              <div class="school-course-list school-course-list-table">
                <div
                  v-for="item in studentCourseList"
                  :key="item.key"
                  class="school-course-item school-course-item-table"
                >
                  <span :title="item.name">{{ item.name }}</span>
                  <span :title="item.time">{{ item.time }}</span>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <img :src="emptyStateImage" alt="" class="empty-state-image" />
              <span>数据为空哦~</span>
            </div>
          </template>

          <div v-else class="table-wrapper">
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

        <section
          class="panel panel-progress"
          :class="{
            'panel-progress-class': activeTab === 'data' && isClassPage,
            'panel-student-lesson-stats': activeTab === 'data' && isStudentPage,
            'student-main-panel-stats': activeTab === 'data' && isStudentPage,
            'class-main-panel-progress': activeTab === 'data' && isClassPage,
            'grade-main-panel-progress': activeTab === 'data' && isGradePage,
          }"
        >
          <div class="panel-header">
            <div class="panel-title">{{ displayProgressTitle }}</div>
          </div>

          <div
            v-if="activeTab === 'data' && isClassPage"
            class="panel-toolbar"
          >
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedClassProgressCourseId"
                :options="classProgressCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="请选择课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div
            v-else-if="
              activeTab !== 'data' ||
              (!isSchoolPage && !isGradePage && !isClassPage && !isStudentPage)
            "
            class="panel-toolbar"
          >
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

          <div
            v-if="
              activeTab === 'data' &&
              isStudentPage &&
              hasStudentLessonStatsData
            "
            class="student-lesson-stats-content"
          >
            <article
              v-for="card in studentLessonStatsCards"
              :key="card.key"
              class="student-lesson-stat-card"
              :class="`student-lesson-stat-card-${card.theme}`"
            >
              <div class="student-lesson-stat-main">
                <div class="student-lesson-stat-label">{{ card.label }}</div>
                <div class="student-lesson-stat-value-row">
                  <strong class="student-lesson-stat-value">{{ card.value }}</strong>
                  <span
                    v-if="card.suffix"
                    class="student-lesson-stat-suffix"
                  >
                    {{ card.suffix }}
                  </span>
                </div>
              </div>

              <div class="student-lesson-stat-icon">
                <svg
                  v-if="card.icon === 'calendar'"
                  viewBox="0 0 64 64"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect x="12" y="16" width="40" height="34" rx="10" fill="currentColor" opacity="0.18" />
                  <rect x="18" y="22" width="28" height="22" rx="6" fill="currentColor" opacity="0.92" />
                  <path d="M22 28H42" stroke="#fff" stroke-width="3" stroke-linecap="round" />
                  <path d="M25 16V23" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                  <path d="M39 16V23" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
                  <path d="M25 36L30 40L39 31" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg
                  v-else-if="card.icon === 'attendance'"
                  viewBox="0 0 64 64"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="32" cy="32" r="20" fill="currentColor" opacity="0.18" />
                  <path d="M32 18C39.732 18 46 24.268 46 32" stroke="currentColor" stroke-width="10" stroke-linecap="round" />
                  <path d="M32 18C24.268 18 18 24.268 18 32C18 39.732 24.268 46 32 46C36.28 46 40.111 44.08 42.68 41.06" stroke="currentColor" stroke-width="10" stroke-linecap="round" opacity="0.45" />
                  <path d="M32 26V33L37 36" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 64 64"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect x="10" y="18" width="30" height="22" rx="6" fill="currentColor" opacity="0.22" />
                  <rect x="14" y="22" width="22" height="14" rx="3" fill="currentColor" opacity="0.9" />
                  <circle cx="44" cy="40" r="12" fill="currentColor" opacity="0.82" />
                  <path d="M44 34V40L48 43" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </article>
          </div>

          <div
            v-else-if="
              activeTab === 'data' &&
              (isSchoolPage || isGradePage) &&
              hasDisplayGradeDistributionData
            "
            class="school-grade-distribution-content"
          >
            <VChart
              class="school-grade-distribution-chart"
              :option="schoolGradeDistributionOption"
              autoresize
            />
          </div>

          <div
            v-else-if="activeTab === 'data' && (isSchoolPage || isGradePage)"
            class="empty-state"
          >
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>

          <div
            v-else-if="activeTab === 'data' && isClassPage && !hasClassTeachingProgressData"
            class="empty-state"
          >
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>

          <div
            v-else-if="activeTab === 'data' && isStudentPage"
            class="empty-state"
          >
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>

          <div v-else class="progress-content">
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
                <strong>{{ displayProgressFinishedCount }}</strong>
                <span>{{ currentDashboard.progressFinishedLabel }}</span>
              </div>

              <div class="donut-label donut-label-bottom">
                <strong>{{ displayProgressPendingCount }}</strong>
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
      </div>

      <div class="bottom-grid">
        <section class="panel">
          <div class="panel-header">
            <div class="panel-title">{{ displayAttendanceTitle }}</div>
            <div
              v-if="
                activeTab !== 'data' ||
                (!isSchoolPage && !isGradePage && !isClassPage && !isStudentPage)
              "
              class="panel-subtitle"
            >
              最近 6 次课堂表现
            </div>
          </div>

          <div
            v-if="activeTab === 'data' && (isClassPage || isStudentPage)"
            class="school-works-content"
          >
            <div v-if="hasDisplayWorksCountData" class="school-works-chart-wrap">
              <VChart
                class="school-works-chart"
                :option="schoolWorksCountOption"
                autoresize
              />
              <div class="school-works-center-label">总量</div>
              <div class="school-works-center-value">{{ displayWorksCountTotal }}</div>
            </div>

            <div v-else class="empty-state">
              <img :src="emptyStateImage" alt="" class="empty-state-image" />
              <span>数据为空哦~</span>
            </div>
          </div>

          <div
            v-else-if="
              activeTab === 'data' &&
              (isSchoolPage || isGradePage) &&
              hasDisplayWorksCountData
            "
            class="school-works-content"
          >
            <div class="school-works-chart-wrap">
              <VChart
                class="school-works-chart"
                :option="schoolWorksCountOption"
                autoresize
              />
              <div class="school-works-center-label">总量</div>
              <div class="school-works-center-value">{{ displayWorksCountTotal }}</div>
            </div>
          </div>

          <div
            v-else-if="activeTab === 'data' && (isSchoolPage || isGradePage)"
            class="empty-state"
          >
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>

          <div v-else class="bar-chart">
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
          <div
            class="panel-header"
            :class="{
              'panel-header-inline-select':
                activeTab === 'data' &&
                (isSchoolPage || isGradePage || isClassPage || isStudentPage),
            }"
          >
            <div class="panel-title">{{ displayPracticeTitle }}</div>
            <div
              v-if="
                activeTab === 'data' &&
                (isSchoolPage || isGradePage || isClassPage || isStudentPage)
              "
              class="toolbar-select-mselect school-task-select"
            >
              <MSelect
                v-if="isClassPage"
                v-model="selectedClassAttendanceCourseId"
                :options="classCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="选择课程"
                class="study-filter-select study-panel-select"
              />
              <MSelect
                v-else-if="isGradePage"
                v-model="selectedGradeAttendanceCourseId"
                :options="gradeCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="选择课程"
                class="study-filter-select study-panel-select"
              />
              <MSelect
                v-else-if="isStudentPage"
                v-model="selectedStudentExerciseCourseId"
                :options="studentCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="全部课程"
                class="study-filter-select study-panel-select"
              />
              <MSelect
                v-else
                v-model="selectedSchoolAttendanceCourseId"
                :options="schoolCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="选择课程"
                class="study-filter-select study-panel-select"
              />
            </div>
            <div v-else class="panel-subtitle">
              按维度统计当前完成情况
            </div>
          </div>

          <div
            v-if="
              activeTab === 'data' &&
              (isSchoolPage || isGradePage || isClassPage) &&
              hasDisplayAttendanceData
            "
            class="school-attendance-content"
          >
            <VChart
              class="school-attendance-chart"
              :option="schoolAttendanceOption"
              autoresize
            />
          </div>

          <div
            v-else-if="
              activeTab === 'data' &&
              isStudentPage &&
              hasStudentExerciseAccuracyData
            "
            class="school-attendance-content"
          >
            <VChart
              class="school-attendance-chart"
              :option="studentExerciseAccuracyOption"
              autoresize
            />
          </div>

          <div
            v-else-if="activeTab === 'data' && (isSchoolPage || isGradePage || isClassPage)"
            class="empty-state"
          >
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>

          <div
            v-else-if="activeTab === 'data' && isStudentPage"
            class="empty-state"
          >
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>

          <div v-else class="progress-list">
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

      <div v-if="activeTab === 'data' && isSchoolPage" class="school-extra-grid">
        <section class="panel school-course-panel school-extra-grid-wide">
          <div class="panel-header panel-header-inline-select">
            <div class="panel-title">授课课程</div>
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedSchoolCourseListCourseId"
                :options="schoolCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="请选择课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div v-if="hasSchoolCourseListData" class="school-course-table">
            <div class="school-course-table-head">
              <span>课程</span>
              <span>上课时间</span>
            </div>

            <div class="school-course-list school-course-list-table">
              <div
                v-for="item in filteredSchoolCourseList"
                :key="item.key"
                class="school-course-item school-course-item-table"
              >
                <span :title="item.name">{{ item.name }}</span>
                <span :title="item.time">{{ item.time }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </section>

        <section class="panel school-task-panel">
          <div class="panel-header panel-header-inline-select">
            <div class="panel-title">任务完成情况</div>
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedSchoolTaskCourseId"
                :options="schoolCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="全部课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div
            v-if="hasSchoolTaskCompletionData"
            class="school-task-completion-content"
          >
            <VChart
              class="school-task-completion-chart"
              :option="schoolTaskCompletionOption"
              autoresize
            />
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </section>

        <section class="panel school-task-panel">
          <div class="panel-header panel-header-inline-select">
            <div class="panel-title">任务批改情况</div>
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedSchoolTaskGradingCourseId"
                :options="schoolCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="全部课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div v-if="hasSchoolTaskGradingData" class="school-task-completion-content">
            <VChart
              class="school-task-completion-chart"
              :option="schoolTaskGradingOption"
              autoresize
            />
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </section>
      </div>

      <div v-else-if="activeTab === 'data' && isGradePage" class="school-extra-grid">
        <section class="panel school-course-panel school-extra-grid-wide">
          <div class="panel-header panel-header-inline-select">
            <div class="panel-title">授课课程</div>
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedGradeCourseListCourseId"
                :options="gradeCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="全部课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div v-if="hasGradeCourseListData" class="school-course-table">
            <div class="school-course-table-head">
              <span>课程</span>
              <span>上课时间</span>
            </div>

            <div class="school-course-list school-course-list-table">
              <div
                v-for="item in gradeCourseList"
                :key="item.key"
                class="school-course-item school-course-item-table"
              >
                <span :title="item.name">{{ item.name }}</span>
                <span :title="item.time">{{ item.time }}</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </section>

        <section class="panel school-task-panel">
          <div class="panel-header panel-header-inline-select">
            <div class="panel-title">任务完成情况</div>
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedGradeTaskCourseId"
                :options="gradeCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="全部课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div
            v-if="hasGradeTaskCompletionData"
            class="school-task-completion-content"
          >
            <VChart
              class="school-task-completion-chart"
              :option="gradeTaskCompletionOption"
              autoresize
            />
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </section>

        <section class="panel school-task-panel">
          <div class="panel-header panel-header-inline-select">
            <div class="panel-title">任务批改情况</div>
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedGradeTaskGradingCourseId"
                :options="gradeCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="全部课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div v-if="hasGradeTaskGradingData" class="school-task-completion-content">
            <VChart
              class="school-task-completion-chart"
              :option="gradeTaskGradingOption"
              autoresize
            />
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </section>
      </div>

      <div v-else-if="activeTab === 'data' && isClassPage" class="school-extra-grid">
        <section class="panel school-task-panel school-extra-grid-wide">
          <div class="panel-header panel-header-inline-select">
            <div class="panel-title">任务完成情况</div>
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedClassTaskCourseId"
                :options="classCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="全部课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div
            v-if="hasClassTaskCompletionData"
            class="school-task-completion-content"
          >
            <VChart
              class="school-task-completion-chart"
              :option="classTaskCompletionOption"
              autoresize
            />
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </section>
      </div>

      <div v-else-if="activeTab === 'data' && isStudentPage" class="school-extra-grid">
        <section class="panel school-task-panel school-extra-grid-wide">
          <div class="panel-header panel-header-inline-select">
            <div class="panel-title">任务完成情况</div>
            <div class="toolbar-select-mselect school-task-select">
              <MSelect
                v-model="selectedStudentTaskCourseId"
                :options="studentCourseOptions"
                value-key="value"
                label-key="label"
                placeholder="全部课程"
                class="study-filter-select study-panel-select"
              />
            </div>
          </div>

          <div
            v-if="hasStudentLessonCompletionData"
            class="school-task-completion-content student-task-completion-content"
          >
            <VChart
              class="school-task-completion-chart"
              :option="studentLessonCompletionOption"
              autoresize
            />
          </div>

          <div v-else class="empty-state">
            <img :src="emptyStateImage" alt="" class="empty-state-image" />
            <span>数据为空哦~</span>
          </div>
        </section>
      </div>

      <Teleport to="body">
        <transition name="study-back-top">
          <button
            v-if="showBackToTop"
            type="button"
            class="study-back-top-button"
            aria-label="回到顶部"
            @click="scrollStudyPageToTop"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3.75 9.75L8 5.5L12.25 9.75"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>回到顶部</span>
          </button>
        </transition>
      </Teleport>
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
import type {
  StudyAILiteracyData,
  StudyAILiteracyDimensionItem,
  StudySchoolAttendanceItem,
  StudyTaskCompletionChapterItem,
  StudySchoolTeachingStatsData,
  StudyGradeDistributionItem,
  StudyCourseChapterCascadeItem,
  StudySchoolCourseItem,
  StudySchoolOverviewData,
  StudySchoolWorksCountItem,
  StudyStudentExerciseAccuracyItem,
  StudyStudentLessonStatsData,
  SituationCascadeType,
} from "~/composables/api/study";

import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart, PieChart, RadarChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
} from "echarts/components";
import SemesterSettingsModal from "~/components/study/SemesterSettingsModal.vue";
import { studyApi } from "~/composables/api/study";
import { useAuth } from "~/composables/api/useAuth";
import dataCenterImage from "~/assets/images/datacenter.png";
import evaluationImage from "~/assets/images/ceping.png";
import emptyStateImage from "~/assets/images/datacenter.png";
import studyMenuIcon from "~/assets/images/study.png";
import trendImage from "~/assets/images/xueqing.png";

definePageMeta({
  layout: "sidebar",
});

const getStoredStudyUserInfo = () => {
  if (!import.meta.client) return null;

  try {
    const rawUserInfo = localStorage.getItem("user_info");
    return rawUserInfo ? JSON.parse(rawUserInfo) : null;
  } catch {
    return null;
  }
};

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
]);

const STUDY_BACK_TOP_VISIBLE_THRESHOLD = 40;
const LEGACY_STUDY_OUTER_SCROLL_CLASS = "study-page-use-outer-scroll";
const SCHOOL_ALL_COURSE_VALUE = "all";
const SCHOOL_ALL_GRADE_VALUE = "__all_grade__";
const SCHOOL_ALL_COURSE_OPTION = {
  label: "全部课程",
  value: SCHOOL_ALL_COURSE_VALUE,
};
const SCHOOL_ALL_GRADE_OPTION = {
  label: "全部年级",
  value: SCHOOL_ALL_GRADE_VALUE,
};
const SCHOOL_AI_LITERACY_RADAR_LINE_COLOR = "#FF9900";
const SCHOOL_GRADE_DISTRIBUTION_COLORS = [
  "#4E6EF2",
  "#31D5E0",
  "#FFBF3C",
  "#62D78F",
  "#FF5A9B",
  "#FF8C5A",
  "#8C87FF",
  "#5CC1FF",
  "#2FD3C8",
] as const;
const SCHOOL_TASK_COMPLETION_COLORS = [
  "#4E73DF",
  "#F5862A",
  "#F6C343",
  "#34C759",
  "#8E7BFF",
  "#2EC9C3",
  "#FF6B8A",
  "#5DA8FF",
] as const;
const STUDENT_TASK_COMPLETION_COLORS = ["#4F72FF", "#31D5E0"] as const;
const STUDENT_WORKS_PLATFORM_CONFIG = [
  { key: "nous", label: "Matatacode(Nous)" },
  { key: "vincibot", label: "Matatacode(vincibot)" },
] as const;
const SCHOOL_AI_LITERACY_MOCK_DATA: StudyAILiteracyData = {
  finalScore: 94.15,
  grade: "A",
  dimensions: [
    {
      quotaName: "人工智能认知",
      score: 82.14,
      weight: 0.9,
    },
    {
      quotaName: "人工智能社会责任",
      score: 60.13,
      weight: 0.15,
    },
    {
      quotaName: "人工智能思维",
      score: 94.17,
      weight: 0.25,
    },
    {
      quotaName: "人工智能应用",
      score: 94.17,
      weight: 0.2,
    },
    {
      quotaName: "人工智能技术",
      score: 94.15,
      weight: 0.2,
    },
  ],
};
const SCHOOL_GRADE_DISTRIBUTION_MOCK_DATA: StudyGradeDistributionItem[] = [
  { gradeName: "1年级", studentCount: 585 },
  { gradeName: "2年级", studentCount: 65 },
  { gradeName: "3年级", studentCount: 90 },
  { gradeName: "4年级", studentCount: 70 },
  { gradeName: "5年级", studentCount: 265 },
  { gradeName: "6年级", studentCount: 34 },
];

const {
  getSituationCascade,
  getCourseChapterCascade,
  getGradeCourses,
  getGradeOverview,
  getGradeAILiteracy,
  getGradeAttendance,
  getGradeClassDistribution,
  getGradeTaskCompletion,
  getGradeTaskGrading,
  getGradeTaskCount,
  getGradeTeachingStats,
  getSchoolAttendance,
  getSchoolTaskCompletion,
  getSchoolTaskGrading,
  getSchoolTeachingStats,
  getSchoolOverview,
  getSchoolAILiteracy,
  getSchoolGradeDistribution,
  getSchoolCourses,
  getSchoolWorksCount,
  getClassAILiteracy,
  getClassAttendance,
  getClassCourses,
  getClassTaskCompletion,
  getClassTeachingProgress,
  getClassWorksCount,
  getClassOverview,
  getStudentAILiteracy,
  getStudentCourses,
  getStudentExerciseAccuracy,
  getStudentLessonCompletion,
  getStudentLessonStats,
  getStudentOverview,
  getStudentWorksCount,
} = studyApi();

type DashboardTab = "data" | "report" | "aiReport";
type TabShapeKey = "start" | "middle" | "end";

interface OptionItem {
  label: string;
  value: string;
  courseId?: string;
  // courseId?: string;
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

interface SchoolGradeDistributionChartItem {
  name: string;
  value: number;
  color: string;
}

interface SchoolCourseListItem {
  key: string;
  id: string;
  name: string;
  gradeValue: string;
  gradeLabel: string;
  time: string;
}

interface SchoolWorksCountChartItem {
  name: string;
  value: number;
  color: string;
}

interface SchoolAttendanceChartItem {
  name: string;
  value: number;
}

interface StudentExerciseAccuracyChartItem {
  courseId: string;
  name: string;
  value: number;
  correctCount: number;
  totalQuestions: number;
}

interface SchoolTeachingStatsViewModel {
  prepareCount: number;
  teachCount: number;
  teachDuration: string;
  teachDurationMinutes: number;
}

interface ClassTeachingProgressViewModel {
  finishedCount: number;
  pendingCount: number;
  completionRate: number;
}

interface StudentLessonStatsViewModel {
  lessonCount: number;
  attendanceRate: number;
  platformDuration: string;
  platformDurationMinutes: number;
}

interface StudentLessonCompletionSummaryViewModel {
  completionRate: number;
  pendingRate: number;
  taskCount: number;
}

interface SchoolTaskCompletionTask {
  taskName: string;
  completionRate: number;
}

interface SchoolTaskCompletionChapter {
  chapterId: string;
  chapterName: string;
  sortOrder: number;
  tasks: SchoolTaskCompletionTask[];
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

const gradeTargetOptions = ref<OptionItem[]>([]);
const classTargetGroups = ref<ClassTargetGroup[]>([]);
const studentTargetGrades = ref<StudentTargetGrade[]>([]);
const schoolCourseOptions = ref<OptionItem[]>([]);
const gradeCourseOptions = ref<OptionItem[]>([]);
const schoolGradeOptions = ref<OptionItem[]>([]);
const studentCourseOptions = ref<OptionItem[]>([SCHOOL_ALL_COURSE_OPTION]);
const { user } = useAuth();
const userRoleKey = computed(() => {
  const storedUserInfo = getStoredStudyUserInfo();
  return String(
    user.value?.role_key ||
      user.value?.roleKey ||
      storedUserInfo?.role_key ||
      storedUserInfo?.roleKey ||
      ""
  ).trim();
});
const isTeacherAccount = computed(() => userRoleKey.value === "teacher");
const isStudentAccount = computed(() => userRoleKey.value === "student");
const isStudentSelfView = computed(() => isStudentAccount.value);
const currentStudentStudyId = computed(() => {
  const storedUserInfo = getStoredStudyUserInfo();
  const rawValue =
    user.value?.user_id ||
    user.value?.userId ||
    user.value?.id ||
    storedUserInfo?.user_id ||
    storedUserInfo?.userId ||
    storedUserInfo?.id ||
    "";

  return rawValue === undefined || rawValue === null ? "" : String(rawValue).trim();
});
const availableStudyPageOptions = computed<OptionItem[]>(() =>
  isStudentSelfView.value
    ? studyPageOptions.filter((item) => item.value === "student")
    : isTeacherAccount.value
      ? studyPageOptions.filter(
          (item) => item.value === "class" || item.value === "student"
        )
      : studyPageOptions
);

if (import.meta.client) {
  setPageLayout(userRoleKey.value === "student" ? "default" : "sidebar");
  watch(
    userRoleKey,
    (roleKey) => {
      setPageLayout(roleKey === "student" ? "default" : "sidebar");
    },
    { immediate: true }
  );
}

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
const selectedPage = ref(isStudentSelfView.value ? "student" : studyPageOptions[0]?.value || "");
const selectedTarget = ref(isStudentSelfView.value ? currentStudentStudyId.value : "");
const selectedClassGroup = ref("");
const selectedStudentGrade = ref("");
const selectedStudentClass = ref("");
const selectedEvaluationScope = ref(evaluationScopeOptions[0]?.value || "");
const selectedSchoolCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedClassCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedClassProgressCourseId = ref("");
const selectedClassAttendanceCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedClassTaskCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedGradeCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedGradeAttendanceCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedGradeCourseListCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedGradeTaskCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedGradeTaskGradingCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedSchoolCourseListCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedSchoolAttendanceCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedSchoolTaskCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedSchoolTaskGradingCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedSchoolGradeId = ref(SCHOOL_ALL_GRADE_VALUE);
const selectedStudentCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedStudentExerciseCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedStudentTaskCourseId = ref(SCHOOL_ALL_COURSE_VALUE);
const selectedCourse = ref("");
const selectedDateRange = ref<[string, string]>(["2021-04-27", today]);
const isCascadeTargetOpen = ref(false);
const showBackToTop = ref(false);
const targetPickerRef = ref<HTMLElement | null>(null);

if (import.meta.client) {
  watch(
    [isStudentSelfView, currentStudentStudyId],
    ([enabled, studentId]) => {
      if (!enabled) return;

      selectedPage.value = "student";
      selectedTarget.value = studentId;
      selectedClassGroup.value = "";
      selectedStudentGrade.value = "";
      selectedStudentClass.value = "";
    },
    { immediate: true }
  );
}

const classOverviewMetrics = ref<MetricItem[]>([]);
const schoolOverviewMetrics = ref<MetricItem[]>([]);
const gradeOverviewMetrics = ref<MetricItem[]>([]);
const studentOverviewMetrics = ref<MetricItem[]>([]);
const classCourseOptions = ref<OptionItem[]>([]);
const studentLessonStats = ref<StudentLessonStatsViewModel | null>(null);
const classAILiteracyGradeValue = ref("-");
const classAILiteracyFinalScore = ref(0);
const classAILiteracyDimensions = ref<StudyAILiteracyDimensionItem[]>([]);
const classTeachingProgress = ref<ClassTeachingProgressViewModel | null>(null);
const schoolAILiteracyGradeValue = ref("-");
const schoolAILiteracyFinalScore = ref(0);
const schoolAILiteracyDimensions = ref<StudyAILiteracyDimensionItem[]>([]);
const gradeAILiteracyGradeValue = ref("-");
const gradeAILiteracyFinalScore = ref(0);
const gradeAILiteracyDimensions = ref<StudyAILiteracyDimensionItem[]>([]);
const studentAILiteracyGradeValue = ref("-");
const studentAILiteracyFinalScore = ref(0);
const studentAILiteracyDimensions = ref<StudyAILiteracyDimensionItem[]>([]);
const studentLessonCompletion = ref<StudentLessonCompletionSummaryViewModel | null>(
  null
);
const studentExerciseAccuracy = ref<StudentExerciseAccuracyChartItem[]>([]);
const schoolGradeDistribution = ref<StudyGradeDistributionItem[]>([]);
const gradeClassDistribution = ref<StudyGradeDistributionItem[]>([]);
const classWorksCount = ref<StudySchoolWorksCountItem[]>([]);
const gradeWorksCount = ref<StudySchoolWorksCountItem[]>([]);
const studentWorksCount = ref<StudySchoolWorksCountItem[]>([]);
const classAttendance = ref<StudySchoolAttendanceItem[]>([]);
const schoolAttendance = ref<StudySchoolAttendanceItem[]>([]);
const gradeAttendance = ref<StudySchoolAttendanceItem[]>([]);
const schoolTeachingStats = ref<SchoolTeachingStatsViewModel | null>(null);
const gradeTeachingStats = ref<SchoolTeachingStatsViewModel | null>(null);
const classTaskCompletion = ref<SchoolTaskCompletionChapter[]>([]);
const gradeTaskCompletion = ref<SchoolTaskCompletionChapter[]>([]);
const gradeTaskGrading = ref<SchoolTaskCompletionChapter[]>([]);
const schoolTaskCompletion = ref<SchoolTaskCompletionChapter[]>([]);
const schoolTaskGrading = ref<SchoolTaskCompletionChapter[]>([]);
const schoolWorksCount = ref<StudySchoolWorksCountItem[]>([]);
const classCourseList = ref<SchoolCourseListItem[]>([]);
const gradeCourseList = ref<SchoolCourseListItem[]>([]);
const schoolCourseList = ref<SchoolCourseListItem[]>([]);
const studentCourseList = ref<SchoolCourseListItem[]>([]);
let schoolOverviewRequestId = 0;
let gradeOverviewRequestId = 0;
let classOverviewRequestId = 0;
let studentOverviewRequestId = 0;
let classCourseOptionsRequestId = 0;
let schoolCourseOptionsRequestId = 0;
let gradeCourseOptionsRequestId = 0;
let studentLessonStatsRequestId = 0;
let classAILiteracyRequestId = 0;
let classTeachingProgressRequestId = 0;
let schoolAILiteracyRequestId = 0;
let gradeAILiteracyRequestId = 0;
let studentAILiteracyRequestId = 0;
let studentLessonCompletionRequestId = 0;
let studentExerciseAccuracyRequestId = 0;
let schoolGradeDistributionRequestId = 0;
let gradeClassDistributionRequestId = 0;
let classWorksCountRequestId = 0;
let gradeWorksCountRequestId = 0;
let studentWorksCountRequestId = 0;
let classAttendanceRequestId = 0;
let schoolAttendanceRequestId = 0;
let gradeAttendanceRequestId = 0;
let schoolTeachingStatsRequestId = 0;
let gradeTeachingStatsRequestId = 0;
let classTaskCompletionRequestId = 0;
let gradeTaskCompletionRequestId = 0;
let gradeTaskGradingRequestId = 0;
let schoolTaskCompletionRequestId = 0;
let schoolTaskGradingRequestId = 0;
let schoolWorksCountRequestId = 0;
let gradeCourseListRequestId = 0;
let schoolCourseListRequestId = 0;
let studentCourseOptionsRequestId = 0;
let studentCourseListRequestId = 0;
let isSyncingClassCourseOptions = false;
let isRefreshingClassCardContext = false;
let isSyncingSchoolCourseOptions = false;
let isSyncingGradeCourseOptions = false;
let isSyncingStudentCourseOptions = false;
let isRefreshingStudentCardContext = false;
let studyPageResizeObserver: ResizeObserver | null = null;
const loadedCascadeTypes = reactive<Record<SituationCascadeType, boolean>>({
  grade: false,
  class: false,
  student: false,
});
const cascadeLoadingTasks: Record<SituationCascadeType, Promise<void> | null> = {
  grade: null,
  class: null,
  student: null,
};

const getCascadeArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getCascadeChildren = (node: any): any[] => {
  if (Array.isArray(node?.children)) return node.children;
  if (Array.isArray(node?.classList)) return node.classList;
  if (Array.isArray(node?.studentList)) return node.studentList;
  if (Array.isArray(node?.list)) return node.list;
  if (Array.isArray(node?.rows)) return node.rows;
  return [];
};

const getCascadeNodeLabel = (node: any, fallback: string) => {
  const candidates = [
    node?.label,
    node?.name,
    node?.gradeName,
    node?.className,
    node?.studentName,
    node?.nickName,
    node?.userName,
    node?.title,
  ];
  const hit = candidates.find((item) => typeof item === "string" && item.trim());
  return hit?.trim() || fallback;
};

const getCascadeNodeValue = (node: any, fallback: string) => {
  const rawValue =
    node?.value ??
    node?.id ??
    node?.gradeId ??
    node?.classId ??
    node?.studentId ??
    node?.userId ??
    node?.studentNumber ??
    fallback;
  return String(rawValue);
};

const getStudentTargetValue = (node: any, fallback: string) => {
  const rawValue =
    node?.studentId ??
    node?.userId ??
    node?.studentNumber ??
    node?.value ??
    node?.id ??
    fallback;
  return String(rawValue);
};

const normalizeGradeTargetOptions = (payload: any): OptionItem[] =>
  getCascadeArray(payload)
    .map((grade, index) => {
      const rawValue = grade?.grade ?? grade?.value ?? grade?.id ?? grade?.gradeId;
      return {
        label: getCascadeNodeLabel(grade, `年级${index + 1}`),
        value: rawValue === undefined || rawValue === null ? "" : String(rawValue).trim(),
      };
    })
    .filter((item) => item.value);

const normalizeClassTargetGroups = (payload: any): ClassTargetGroup[] =>
  getCascadeArray(payload).map((grade, gradeIndex) => ({
    label: getCascadeNodeLabel(grade, `年级${gradeIndex + 1}`),
    value: getCascadeNodeValue(grade, `grade-${gradeIndex + 1}`),
    children: getCascadeChildren(grade).map((classItem, classIndex) => ({
      label: getCascadeNodeLabel(classItem, `班级${classIndex + 1}`),
      value: getCascadeNodeValue(classItem, `class-${gradeIndex + 1}-${classIndex + 1}`),
    })),
  }));

const normalizeStudentTargetGrades = (payload: any): StudentTargetGrade[] =>
  getCascadeArray(payload).map((grade, gradeIndex) => ({
    label: getCascadeNodeLabel(grade, `年级${gradeIndex + 1}`),
    value: getCascadeNodeValue(grade, `student-grade-${gradeIndex + 1}`),
    children: getCascadeChildren(grade).map((classItem, classIndex) => ({
      label: getCascadeNodeLabel(classItem, `班级${classIndex + 1}`),
      value: getCascadeNodeValue(
        classItem,
        `student-class-${gradeIndex + 1}-${classIndex + 1}`
      ),
      children: getCascadeChildren(classItem).map((student, studentIndex) => ({
        label: getCascadeNodeLabel(student, `学生${studentIndex + 1}`),
        value: getStudentTargetValue(
          student,
          `student-${gradeIndex + 1}-${classIndex + 1}-${studentIndex + 1}`
        ),
      })),
    })),
  }));

const getCourseCascadeNodeLabel = (node: any, fallback: string) => {
  const candidates = [node?.courseName, node?.label, node?.name, node?.title];
  const hit = candidates.find((item) => typeof item === "string" && item.trim());
  return hit?.trim() || fallback;
};

const getCourseCascadeNodeValue = (node: any, fallback: string) => {
  const rawValue = node?.courseId ?? node?.value ?? node?.id ?? fallback;
  return String(rawValue);
};

const getCourseCascadeCursorId = (node: any) => {
  const rawValue =
    node?.courseId ?? node?.courseId ?? node?.courseId ?? node?.value ?? node?.id;
  return rawValue === undefined || rawValue === null ? "" : String(rawValue).trim();
};

const normalizeSchoolCourseOptions = (
  payload:
    | StudyCourseChapterCascadeItem[]
    | StudySchoolCourseItem[]
    | Record<string, any>
    | undefined
): OptionItem[] => {
  const options = getCascadeArray(payload)
    .map((course, index) => {
      const value = getCourseCascadeNodeValue(course, `course-${index + 1}`);
      return {
        label: getCourseCascadeNodeLabel(course, `课程${index + 1}`),
        value,
        courseId: value,
        // courseId: getCourseCascadeCursorId(course),
      };
    })
    .filter((item) => item.value);

  const uniqueOptions = options.filter(
    (item, index, list) =>
      list.findIndex((option) => option.value === item.value) === index
  );

  return [SCHOOL_ALL_COURSE_OPTION, ...uniqueOptions];
};

const getDefaultClassSelection = () => {
  const firstGroup =
    classTargetGroups.value.find((group) => group.children.length > 0) ||
    classTargetGroups.value[0];
  return {
    groupValue: firstGroup?.value || "",
    targetValue: firstGroup?.children[0]?.value || "",
  };
};

const getDefaultStudentSelection = () => {
  for (const grade of studentTargetGrades.value) {
    for (const classItem of grade.children) {
      if (classItem.children.length > 0) {
        return {
          gradeValue: grade.value,
          classValue: classItem.value,
          targetValue: classItem.children[0]?.value || "",
        };
      }
    }
  }

  const firstGrade = studentTargetGrades.value[0];
  const firstClass = firstGrade?.children[0];
  return {
    gradeValue: firstGrade?.value || "",
    classValue: firstClass?.value || "",
    targetValue: firstClass?.children[0]?.value || "",
  };
};

const loadSituationCascade = async (type: SituationCascadeType) => {
  const data = await getSituationCascade({ type });

  if (type === "grade") {
    gradeTargetOptions.value = normalizeGradeTargetOptions(data);
    schoolGradeOptions.value = normalizeGradeTargetOptions(data);

    if (
      selectedSchoolGradeId.value &&
      selectedSchoolGradeId.value !== SCHOOL_ALL_GRADE_VALUE &&
      !schoolGradeOptions.value.some((item) => item.value === selectedSchoolGradeId.value)
    ) {
      selectedSchoolGradeId.value = SCHOOL_ALL_GRADE_VALUE;
    }
  }

  if (type === "class") {
    classTargetGroups.value = normalizeClassTargetGroups(data);
  }

  if (type === "student") {
    studentTargetGrades.value = normalizeStudentTargetGrades(data);
  }

  loadedCascadeTypes[type] = true;
};

const ensureSituationCascade = async (type: SituationCascadeType) => {
  if (loadedCascadeTypes[type]) return;
  if (!cascadeLoadingTasks[type]) {
    cascadeLoadingTasks[type] = loadSituationCascade(type).finally(() => {
      cascadeLoadingTasks[type] = null;
    });
  }
  await cascadeLoadingTasks[type];
};

const formatSchoolOverviewMetricValue = (value?: number) => {
  const count = Number(value ?? 0);
  return String(Number.isFinite(count) ? count : 0);
};

const createSchoolOverviewMetrics = (payload?: StudySchoolOverviewData): MetricItem[] => [
  {
    label: "学生人数",
    value: formatSchoolOverviewMetricValue(payload?.studentCount),
    image: dataCenterImage,
    theme: "theme-blue",
  },
  {
    label: "创建作品数量",
    value: formatSchoolOverviewMetricValue(payload?.worksCount),
    image: evaluationImage,
    theme: "theme-cyan",
  },
  {
    label: "累计授课次数",
    value: formatSchoolOverviewMetricValue(payload?.teachCount),
    image: trendImage,
    theme: "theme-violet",
  },
];

const formatStudentOverviewScoreValue = (payload?: StudySchoolOverviewData) => {
  const gradeText = String(payload?.courseGrade ?? "").trim();
  if (gradeText) return gradeText;

  const scoreValue = payload?.courseScore;
  if (scoreValue === undefined || scoreValue === null || scoreValue === "") return "-";

  const numericValue = Number(scoreValue);
  if (!Number.isFinite(numericValue)) {
    return String(scoreValue).trim() || "-";
  }

  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(1).replace(/\.0$/, "");
};

const formatStudentOverviewRateValue = (value: unknown) => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return "0%";
  return `${Number.isInteger(numericValue) ? numericValue : Number(numericValue.toFixed(1))}%`;
};

const createStudentOverviewMetrics = (payload?: StudySchoolOverviewData): MetricItem[] => [
  {
    label: "课程成绩",
    value: formatStudentOverviewScoreValue(payload),
    image: evaluationImage,
    theme: "theme-blue",
  },
  {
    label: "创建作品数量",
    value: formatSchoolOverviewMetricValue(payload?.worksCount),
    image: dataCenterImage,
    theme: "theme-cyan",
  },
  {
    label: "任务完成情况",
    value: formatStudentOverviewRateValue(payload?.taskCompletionRate),
    image: trendImage,
    theme: "theme-violet",
  },
];

const formatSchoolAILiteracyValue = (value: unknown) => {
  if (value === undefined || value === null) return "-";

  const text = String(value).trim();
  if (!text) return "-";

  const numericValue = Number(text);
  if (!Number.isFinite(numericValue)) return text;

  return Number.isInteger(numericValue)
    ? String(numericValue)
    : numericValue.toFixed(1).replace(/\.0$/, "");
};

const getSchoolAILiteracyGradeValue = (payload: any) =>
  formatSchoolAILiteracyValue(payload?.grade);

const normalizeSchoolAILiteracyFinalScore = (value: unknown) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const normalizeSchoolAILiteracyDimensions = (
  payload: StudyAILiteracyDimensionItem[] | undefined
) =>
  Array.isArray(payload)
    ? payload.map((item) => ({
        quotaName: String(item?.quotaName || "").trim(),
        score: Number(item?.score ?? 0),
        weight: Number(item?.weight ?? 0),
      }))
    : [];

const normalizeSchoolGradeDistribution = (
  payload: StudyGradeDistributionItem[] | undefined
): StudyGradeDistributionItem[] =>
  Array.isArray(payload)
    ? payload.map((item, index) => ({
        gradeName:
          String(
            item?.gradeName ??
              item?.className ??
              item?.name ??
              item?.label ??
              item?.grade ??
              item?.classId ??
              ""
          ).trim() || `年级${index + 1}`,
        count: Number(
          item?.count ?? item?.studentCount ?? item?.total ?? item?.value ?? 0
        ),
      }))
    : [];

const normalizeSchoolWorksCount = (
  payload: StudySchoolWorksCountItem[] | Record<string, any> | undefined
): StudySchoolWorksCountItem[] =>
  getCascadeArray(payload)
    .map((item, index) => ({
      platformName: String(item?.platformName ?? item?.platformLabel ?? "").trim(),
      platformType: item?.platformType,
      gradeName:
        String(
          item?.platformName ??
            item?.platformLabel ??
            item?.platformType ??
          item?.gradeName ??
            item?.className ??
            item?.name ??
            item?.label ??
            item?.grade ??
            item?.classId ??
            ""
        ).trim() || `年级${index + 1}`,
      worksCount: Number(
        item?.worksCount ?? item?.count ?? item?.total ?? item?.value ?? 0
      ),
    }))
    .filter((item) => Number.isFinite(item.worksCount));

const normalizeStudentWorksPlatformKey = (item: StudySchoolWorksCountItem) => {
  const platformType = String(item?.platformType ?? "").trim().toLowerCase();
  if (platformType === "1") return "nous";
  if (platformType === "2") return "vincibot";

  const candidateText = String(
    item?.platformName ??
      item?.platformLabel ??
      item?.platformType ??
      item?.gradeName ??
      item?.name ??
      item?.label ??
      ""
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (!candidateText) return "";
  if (candidateText === "1") return "nous";
  if (candidateText === "2") return "vincibot";
  if (candidateText.includes("vincibot") || candidateText.includes("vinci")) {
    return "vincibot";
  }
  if (candidateText.includes("nous")) {
    return "nous";
  }

  return "";
};

const createEmptySchoolTeachingStats = (): SchoolTeachingStatsViewModel => ({
  prepareCount: 0,
  teachCount: 0,
  teachDuration: "0分钟",
  teachDurationMinutes: 0,
});

const normalizeSchoolTeachingStatsNumber = (value: unknown) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
};

const formatSchoolTeachingDuration = (minutesValue: unknown, fallbackText?: unknown) => {
  const text = String(fallbackText ?? "").trim();
  if (text) return text;

  const totalMinutes = normalizeSchoolTeachingStatsNumber(minutesValue);
  if (totalMinutes <= 0) return "0分钟";

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  const parts = [
    days > 0 ? `${days}天` : "",
    hours > 0 ? `${hours}小时` : "",
    minutes > 0 ? `${minutes}分钟` : "",
  ].filter(Boolean);

  return parts.join(" ") || "0分钟";
};

const normalizeSchoolTeachingStats = (
  payload: StudySchoolTeachingStatsData | Record<string, any> | undefined
): SchoolTeachingStatsViewModel => {
  const prepareCount = normalizeSchoolTeachingStatsNumber(payload?.prepareCount);
  const teachCount = normalizeSchoolTeachingStatsNumber(payload?.teachCount);
  const teachDurationMinutes = normalizeSchoolTeachingStatsNumber(
    payload?.teachDurationMinutes
  );

  return {
    prepareCount,
    teachCount,
    teachDuration: formatSchoolTeachingDuration(
      teachDurationMinutes,
      payload?.teachDuration
    ),
    teachDurationMinutes,
  };
};

const normalizeClassTeachingProgressCount = (value: unknown) => {
  const numericValue = Number(value ?? 0);
  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : 0;
};

const normalizeClassTeachingProgressRate = (value: unknown) => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(Math.max(numericValue, 0), 100);
};

const normalizeClassTeachingProgress = (
  payload: Record<string, any> | undefined
): ClassTeachingProgressViewModel => {
  const finishedCount = normalizeClassTeachingProgressCount(
    payload?.completed ??
      payload?.finishedCount ??
      payload?.completedCount ??
      payload?.teachCount ??
      payload?.taughtCount ??
      payload?.alreadyCount ??
      payload?.doneCount
  );
  const totalCount = normalizeClassTeachingProgressCount(
    payload?.totalChapters ?? payload?.totalCount ?? payload?.courseCount ?? payload?.chapterCount
  );
  const pendingCount = normalizeClassTeachingProgressCount(
    payload?.uncompleted ??
      payload?.pendingCount ??
      payload?.unfinishedCount ??
      payload?.untaughtCount ??
      payload?.unTeachCount ??
      payload?.remainingCount ??
      payload?.todoCount ??
      (totalCount > 0 ? totalCount - finishedCount : 0)
  );
  const completionRateFromPayload = normalizeClassTeachingProgressRate(
    payload?.completionRate ?? payload?.progressRate ?? payload?.rate ?? payload?.percent
  );
  const calculatedRate =
    finishedCount + pendingCount > 0
      ? (finishedCount / (finishedCount + pendingCount)) * 100
      : 0;

  return {
    finishedCount,
    pendingCount,
    completionRate:
      completionRateFromPayload > 0 || finishedCount + pendingCount <= 0
        ? completionRateFromPayload
        : calculatedRate,
  };
};

const normalizeStudentLessonStats = (
  payload: StudyStudentLessonStatsData | Record<string, any> | undefined
): StudentLessonStatsViewModel => {
  const lessonCount = normalizeClassTeachingProgressCount(
    payload?.lessonCount ??
      payload?.lessonTimes ??
      payload?.totalLessonTimes ??
      payload?.attendCount ??
      payload?.attendanceCount ??
      payload?.completed ??
      payload?.finishedCount ??
      payload?.completedCount ??
      payload?.finishedLessonCount ??
      payload?.completedLessonCount ??
      payload?.doneCount ??
      payload?.attendedCount
  );
  const attendanceRate = Math.min(
    normalizeSchoolAttendanceValue(
    payload?.attendanceRate ??
      payload?.courseAttendanceRate ??
      payload?.lessonAttendanceRate ??
      payload?.completionRate ??
      payload?.progressRate ??
      payload?.rate ??
      payload?.percent
    ),
    100
  );
  const platformDurationMinutes = normalizeSchoolTeachingStatsNumber(
    payload?.platformDurationMinutes ??
      payload?.platformUseDurationMinutes ??
      payload?.useDurationMinutes ??
      payload?.durationMinutes ??
      payload?.lessonDurationMinutes
  );
  const platformDurationText = String(
    payload?.platformDuration ??
      payload?.platformUseDuration ??
      payload?.useDuration ??
      payload?.duration ??
      ""
  ).trim();
  const platformDuration =
    platformDurationText || platformDurationMinutes > 0
      ? formatSchoolTeachingDuration(platformDurationMinutes, platformDurationText)
      : "-";

  return {
    lessonCount,
    attendanceRate,
    platformDuration,
    platformDurationMinutes,
  };
};

const normalizeSchoolTaskCompletionValue = (value: unknown) => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return 0;
  if (numericValue >= 0 && numericValue <= 1) {
    return Number((numericValue * 100).toFixed(2));
  }
  return Number(numericValue.toFixed(2));
};

const getTaskCompletionTasks = (item: any): any[] => {
  if (Array.isArray(item?.tasks)) return item.tasks;
  if (Array.isArray(item?.taskList)) return item.taskList;
  if (Array.isArray(item?.children)) return item.children;
  return [];
};

const normalizeSchoolTaskCompletion = (
  payload: StudyTaskCompletionChapterItem[] | Record<string, any> | undefined
): SchoolTaskCompletionChapter[] =>
  getCascadeArray(payload)
    .map((item, chapterIndex) => ({
      chapterId: String(item?.chapterId ?? item?.id ?? chapterIndex + 1),
      chapterName:
        String(
          item?.chapterName ?? item?.name ?? item?.label ?? item?.title ?? ""
        ).trim() || `第${chapterIndex + 1}课`,
      sortOrder: Number(item?.sortOrder ?? chapterIndex),
      tasks: getTaskCompletionTasks(item)
        .map((task, taskIndex) => ({
          taskName:
            String(task?.taskName ?? task?.name ?? task?.label ?? "").trim() ||
            `任务${taskIndex + 1}`,
          completionRate: normalizeSchoolTaskCompletionValue(
            task?.completionRate ??
              task?.gradingRate ??
              task?.rate ??
              task?.percent ??
              task?.value
          ),
        }))
        .filter((task) => task.taskName),
    }))
    .sort((prev, next) => prev.sortOrder - next.sortOrder);

const normalizeStudentLessonCompletionSummary = (
  payload: StudyTaskCompletionChapterItem[] | Record<string, any> | undefined
): StudentLessonCompletionSummaryViewModel => {
  const completedCount = normalizeSchoolTeachingStatsNumber(
    (payload as any)?.completed ??
      (payload as any)?.finishedCount ??
      (payload as any)?.completedCount ??
      (payload as any)?.doneCount
  );
  const uncompletedCount = normalizeSchoolTeachingStatsNumber(
    (payload as any)?.uncompleted ??
      (payload as any)?.unfinishedCount ??
      (payload as any)?.pendingCount ??
      (payload as any)?.uncompletedCount ??
      (payload as any)?.todoCount
  );
  const explicitTaskCount = normalizeSchoolTeachingStatsNumber(
    (payload as any)?.taskCount ??
      (payload as any)?.totalCount ??
      (payload as any)?.totalTaskCount ??
      (payload as any)?.count
  );
  const taskCount =
    explicitTaskCount > 0 ? explicitTaskCount : completedCount + uncompletedCount;

  let completionRate = Math.min(
    Math.max(
      normalizeSchoolAttendanceValue(
        (payload as any)?.completionRate ??
          (payload as any)?.rate ??
          (payload as any)?.percent ??
          (payload as any)?.value
      ),
      0
    ),
    100
  );

  if (taskCount > 0 && completionRate <= 0) {
    completionRate = Number(((completedCount / taskCount) * 100).toFixed(2));
  }

  if (taskCount > 0) {
    const pendingRate =
      uncompletedCount > 0
        ? Number(((uncompletedCount / taskCount) * 100).toFixed(2))
        : Number(Math.max(0, 100 - completionRate).toFixed(2));

    return {
      completionRate,
      pendingRate,
      taskCount,
    };
  }

  const chapters = normalizeSchoolTaskCompletion(payload);
  const taskRates = chapters.flatMap((chapter) =>
    chapter.tasks.map((task) =>
      Math.min(
        Math.max(normalizeSchoolAttendanceValue(task.completionRate ?? 0), 0),
        100
      )
    )
  );
  const legacyTaskCount = taskRates.length;
  const legacyCompletionRate = legacyTaskCount
    ? Number(
        (
          taskRates.reduce((total, value) => total + value, 0) / legacyTaskCount
        ).toFixed(2)
      )
    : 0;

  return {
    completionRate: legacyCompletionRate,
    pendingRate: Number(Math.max(0, 100 - legacyCompletionRate).toFixed(2)),
    taskCount: legacyTaskCount,
  };
};

const normalizeSchoolAttendanceValue = (value: unknown) => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return 0;
  if (numericValue >= 0 && numericValue <= 1) {
    return Number((numericValue * 100).toFixed(2));
  }
  return numericValue;
};

const normalizeSchoolAttendance = (
  payload: StudySchoolAttendanceItem[] | Record<string, any> | undefined
): SchoolAttendanceChartItem[] =>
  getCascadeArray(payload)
    .map((item, index) => ({
      name:
        String(
          item?.chapterName ??
            item?.lessonName ??
            item?.name ??
            item?.label ??
            item?.title ??
            ""
        ).trim() || `第${index + 1}项`,
      value: normalizeSchoolAttendanceValue(
        item?.attendanceRate ?? item?.rate ?? item?.percent ?? item?.value
      ),
    }))
    .filter((item) => item.name);

const normalizeStudentExerciseAccuracy = (
  payload: StudyStudentExerciseAccuracyItem[] | Record<string, any> | undefined
): StudentExerciseAccuracyChartItem[] =>
  getCascadeArray(payload)
    .map((item, index) => ({
      courseId: String(item?.courseId ?? item?.questionId ?? index + 1),
      name:
        String(
          item?.courseName ??
            item?.questionName ??
            item?.exerciseName ??
            item?.taskName ??
            item?.name ??
            item?.label ??
            item?.title ??
            ""
        ).trim() || `课程${index + 1}`,
      value: normalizeSchoolAttendanceValue(
        item?.accuracy ??
        item?.accuracyRate ??
          item?.correctRate ??
          item?.rate ??
          item?.percent ??
          item?.value
      ),
      correctCount: normalizeSchoolTeachingStatsNumber(item?.correctCount),
      totalQuestions: normalizeSchoolTeachingStatsNumber(item?.totalQuestions),
    }))
    .filter((item) => item.name);

const getTextCandidate = (...candidates: unknown[]) => {
  const hit = candidates.find((item) => typeof item === "string" && item.trim());
  return typeof hit === "string" ? hit.trim() : "";
};

const normalizePlainText = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "");

const getResolvedGradeTargetValue = (value = selectedTarget.value) => {
  const normalizedValue = normalizePlainText(value);
  if (
    normalizedValue &&
    gradeTargetOptions.value.some((item) => item.value === normalizedValue)
  ) {
    return normalizedValue;
  }

  return gradeTargetOptions.value[0]?.value || "";
};

const extractGradeKeyword = (value: unknown) => {
  const normalized = normalizePlainText(value);
  if (!normalized) return "";

  const match = normalized.match(/(?:小学|初中|高中)?[一二三四五六七八九十0-9]+年级/);
  return match?.[0] || normalized;
};

const getSchoolCourseIdValue = (item: any, fallback: string) => {
  const rawValue = item?.courseId ?? item?.id ?? item?.value ?? fallback;
  return String(rawValue);
};

const getSchoolCourseName = (item: any, index: number) =>
  getTextCandidate(
    typeof item === "string" ? item : "",
    item?.courseName,
    item?.name,
    item?.title,
    item?.courseTitle
  ) || `课程${index + 1}`;

const getSchoolCourseGradeValue = (item: any) => {
  const rawValue =
    item?.gradeId ?? item?.grade ?? item?.gradeValue ?? item?.classGradeId ?? "";
  return rawValue === undefined || rawValue === null ? "" : String(rawValue).trim();
};

const getSchoolCourseGradeLabel = (item: any) =>
  getTextCandidate(
    item?.gradeName,
    item?.gradeLabel,
    typeof item?.grade === "string" ? item.grade : ""
  );

const formatSchoolCourseTime = (item: any) => {
  const directText = getTextCandidate(
    item?.teachTime,
    item?.timeRange,
    item?.time,
    item?.lessonTime,
    item?.classTime
  );
  if (directText) return directText;

  const startText = getTextCandidate(item?.startDate, item?.startTime);
  const endText = getTextCandidate(item?.endDate, item?.endTime);
  if (startText && endText) return `${startText} - ${endText}`;

  return startText || endText || "-";
};

const normalizeSchoolCourseList = (
  payload: StudySchoolCourseItem[] | Record<string, any> | undefined
): SchoolCourseListItem[] =>
  getCascadeArray(payload)
    .map((item, index) => {
      const id = getSchoolCourseIdValue(item, `school-course-${index + 1}`);
      const name = getSchoolCourseName(item, index);
      const gradeValue = getSchoolCourseGradeValue(item);
      const gradeLabel = getSchoolCourseGradeLabel(item);
      const key =
        [id, gradeValue, gradeLabel, name].filter(Boolean).join("__") ||
        `school-course-${index + 1}`;

      return {
        key,
        id,
        name,
        gradeValue,
        gradeLabel,
        time: formatSchoolCourseTime(item),
      };
    })
    .filter(
      (item, index, list) => list.findIndex((course) => course.key === item.key) === index
    );

const matchesSchoolCourseGrade = (
  item: SchoolCourseListItem,
  selectedGradeId: string,
  selectedGradeLabel: string
) => {
  const normalizedSelectedGradeId = normalizePlainText(selectedGradeId);
  const normalizedItemGradeValue = normalizePlainText(item.gradeValue);
  if (
    normalizedSelectedGradeId &&
    normalizedItemGradeValue &&
    normalizedSelectedGradeId === normalizedItemGradeValue
  ) {
    return true;
  }

  const normalizedSelectedGradeLabel = normalizePlainText(selectedGradeLabel);
  if (!normalizedSelectedGradeLabel) return false;

  const selectedGradeKeyword = extractGradeKeyword(selectedGradeLabel);
  const candidateTexts = [
    item.gradeLabel,
    extractGradeKeyword(item.gradeLabel),
    item.name,
    extractGradeKeyword(item.name),
  ]
    .map((text) => normalizePlainText(text))
    .filter(Boolean);

  return candidateTexts.some(
    (text) =>
      text.includes(normalizedSelectedGradeLabel) ||
      (!!selectedGradeKeyword && text.includes(selectedGradeKeyword))
  );
};

const syncSchoolOverview = async () => {
  const requestId = ++schoolOverviewRequestId;

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getSchoolOverview({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolOverviewRequestId) return;

    schoolOverviewMetrics.value = createSchoolOverviewMetrics(data);
  } catch (error) {
    if (requestId !== schoolOverviewRequestId) return;

    console.error("获取全校概览统计失败:", error);
    schoolOverviewMetrics.value = createSchoolOverviewMetrics();
  }
};

const syncSchoolCourseOptions = async () => {
  const requestId = ++schoolCourseOptionsRequestId;

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getCourseChapterCascade({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolCourseOptionsRequestId) return;

    const options = normalizeSchoolCourseOptions(data);
    schoolCourseOptions.value = options;

    isSyncingSchoolCourseOptions = true;
    if (!options.some((item) => item.value === selectedSchoolCourseId.value)) {
      selectedSchoolCourseId.value = options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedSchoolCourseListCourseId.value)) {
      selectedSchoolCourseListCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedSchoolAttendanceCourseId.value)) {
      selectedSchoolAttendanceCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedSchoolTaskCourseId.value)) {
      selectedSchoolTaskCourseId.value = options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedSchoolTaskGradingCourseId.value)) {
      selectedSchoolTaskGradingCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
  } catch (error) {
    if (requestId !== schoolCourseOptionsRequestId) return;

    console.error("获取学校课程下拉失败:", error);
    schoolCourseOptions.value = [SCHOOL_ALL_COURSE_OPTION];

    isSyncingSchoolCourseOptions = true;
    selectedSchoolCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedSchoolCourseListCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedSchoolAttendanceCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedSchoolTaskCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedSchoolTaskGradingCourseId.value = SCHOOL_ALL_COURSE_VALUE;
  } finally {
    isSyncingSchoolCourseOptions = false;
  }
};

const syncGradeCourseOptions = async (grade = selectedTarget.value) => {
  const requestId = ++gradeCourseOptionsRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeCourseOptions.value = [SCHOOL_ALL_COURSE_OPTION];
    gradeCourseList.value = [];

    isSyncingGradeCourseOptions = true;
    selectedGradeCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedGradeAttendanceCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedGradeCourseListCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedGradeTaskCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedGradeTaskGradingCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    isSyncingGradeCourseOptions = false;
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeCourses({
      grade: normalizedGrade,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeCourseOptionsRequestId) return;

    const options = normalizeSchoolCourseOptions(data);
    gradeCourseOptions.value = options;

    isSyncingGradeCourseOptions = true;
    if (!options.some((item) => item.value === selectedGradeCourseId.value)) {
      selectedGradeCourseId.value = options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedGradeAttendanceCourseId.value)) {
      selectedGradeAttendanceCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedGradeCourseListCourseId.value)) {
      selectedGradeCourseListCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedGradeTaskCourseId.value)) {
      selectedGradeTaskCourseId.value = options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedGradeTaskGradingCourseId.value)) {
      selectedGradeTaskGradingCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
  } catch (error) {
    if (requestId !== gradeCourseOptionsRequestId) return;

    console.error("获取年级课程下拉失败:", error);
    gradeCourseOptions.value = [SCHOOL_ALL_COURSE_OPTION];

    isSyncingGradeCourseOptions = true;
    selectedGradeCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedGradeAttendanceCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedGradeCourseListCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedGradeTaskCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedGradeTaskGradingCourseId.value = SCHOOL_ALL_COURSE_VALUE;
  } finally {
    isSyncingGradeCourseOptions = false;
  }
};

const syncGradeCourseList = async (
  courseId = selectedGradeCourseListCourseId.value,
  grade = selectedTarget.value
) => {
  const requestId = ++gradeCourseListRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeCourseList.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeCourses({
      grade: normalizedGrade,
      courseId:
        courseId && courseId !== SCHOOL_ALL_COURSE_VALUE ? courseId : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeCourseListRequestId) return;

    gradeCourseList.value = normalizeSchoolCourseList(data);
  } catch (error) {
    if (requestId !== gradeCourseListRequestId) return;

    console.error("获取年级授课课程失败:", error);
    gradeCourseList.value = [];
  }
};

const syncGradeOverview = async (grade = selectedTarget.value) => {
  const requestId = ++gradeOverviewRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeOverviewMetrics.value = createSchoolOverviewMetrics();
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeOverview({
      grade: normalizedGrade,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeOverviewRequestId) return;

    gradeOverviewMetrics.value = createSchoolOverviewMetrics(data);
  } catch (error) {
    if (requestId !== gradeOverviewRequestId) return;

    console.error("获取年级概览统计失败:", error);
    gradeOverviewMetrics.value = createSchoolOverviewMetrics();
  }
};

const syncClassOverview = async (classId = selectedTarget.value) => {
  const requestId = ++classOverviewRequestId;
  const normalizedClassId = normalizePlainText(classId);

  if (!normalizedClassId) {
    classOverviewMetrics.value = createSchoolOverviewMetrics();
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getClassOverview({
      classId: normalizedClassId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== classOverviewRequestId) return;

    classOverviewMetrics.value = createSchoolOverviewMetrics(data);
  } catch (error) {
    if (requestId !== classOverviewRequestId) return;

    console.error("获取班级概览统计失败:", error);
    classOverviewMetrics.value = createSchoolOverviewMetrics();
  }
};

const syncStudentOverview = async (studentId = selectedTarget.value) => {
  const requestId = ++studentOverviewRequestId;
  const normalizedStudentId = normalizePlainText(studentId);

  if (!normalizedStudentId) {
    studentOverviewMetrics.value = createStudentOverviewMetrics();
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getStudentOverview({
      studentId: normalizedStudentId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== studentOverviewRequestId) return;

    studentOverviewMetrics.value = createStudentOverviewMetrics(data);
  } catch (error) {
    if (requestId !== studentOverviewRequestId) return;

    console.error("获取学生概览统计失败:", error);
    studentOverviewMetrics.value = createStudentOverviewMetrics();
  }
};

const syncStudentCourseOptions = async (studentId = selectedTarget.value) => {
  const requestId = ++studentCourseOptionsRequestId;
  const normalizedStudentId = normalizePlainText(studentId);

  if (!normalizedStudentId) {
    studentCourseOptions.value = [SCHOOL_ALL_COURSE_OPTION];
    isSyncingStudentCourseOptions = true;
    selectedStudentCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedStudentExerciseCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedStudentTaskCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    isSyncingStudentCourseOptions = false;
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getStudentCourses({
      studentId: normalizedStudentId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== studentCourseOptionsRequestId) return;

    const options = normalizeSchoolCourseOptions(data);
    studentCourseOptions.value = options;

    isSyncingStudentCourseOptions = true;
    if (!options.some((item) => item.value === selectedStudentCourseId.value)) {
      selectedStudentCourseId.value = options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedStudentExerciseCourseId.value)) {
      selectedStudentExerciseCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedStudentTaskCourseId.value)) {
      selectedStudentTaskCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
  } catch (error) {
    if (requestId !== studentCourseOptionsRequestId) return;

    console.error("获取学生上课课程下拉失败:", error);
    studentCourseOptions.value = [SCHOOL_ALL_COURSE_OPTION];

    isSyncingStudentCourseOptions = true;
    selectedStudentCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedStudentExerciseCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedStudentTaskCourseId.value = SCHOOL_ALL_COURSE_VALUE;
  } finally {
    isSyncingStudentCourseOptions = false;
  }
};

const syncStudentCourseList = async (studentId = selectedTarget.value) => {
  const requestId = ++studentCourseListRequestId;
  const normalizedStudentId = normalizePlainText(studentId);

  if (!normalizedStudentId) {
    studentCourseList.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getStudentCourses({
      studentId: normalizedStudentId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== studentCourseListRequestId) return;

    studentCourseList.value = normalizeSchoolCourseList(data);
  } catch (error) {
    if (requestId !== studentCourseListRequestId) return;

    console.error("获取学生上课课程列表失败:", error);
    studentCourseList.value = [];
  }
};

const syncStudentAILiteracy = async (
  courseId = selectedStudentCourseId.value,
  studentId = selectedTarget.value
) => {
  const requestId = ++studentAILiteracyRequestId;
  const normalizedStudentId = normalizePlainText(studentId);
  const normalizedCourseId =
    courseId && courseId !== SCHOOL_ALL_COURSE_VALUE
      ? normalizePlainText(courseId)
      : undefined;

  if (!normalizedStudentId) {
    studentAILiteracyGradeValue.value = "-";
    studentAILiteracyFinalScore.value = 0;
    studentAILiteracyDimensions.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getStudentAILiteracy({
      studentId: normalizedStudentId,
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== studentAILiteracyRequestId) return;

    studentAILiteracyGradeValue.value = getSchoolAILiteracyGradeValue(data);
    studentAILiteracyFinalScore.value = normalizeSchoolAILiteracyFinalScore(
      data?.finalScore
    );
    studentAILiteracyDimensions.value = normalizeSchoolAILiteracyDimensions(
      data?.dimensions
    );
  } catch (error) {
    if (requestId !== studentAILiteracyRequestId) return;

    console.error("获取学生AI素养评价失败:", error);
    studentAILiteracyGradeValue.value = "-";
    studentAILiteracyFinalScore.value = 0;
    studentAILiteracyDimensions.value = [];
  }
};

const syncStudentLessonStats = async (studentId = selectedTarget.value) => {
  const requestId = ++studentLessonStatsRequestId;
  const normalizedStudentId = normalizePlainText(studentId);

  if (!normalizedStudentId) {
    studentLessonStats.value = null;
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getStudentLessonStats({
      studentId: normalizedStudentId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== studentLessonStatsRequestId) return;

    studentLessonStats.value = normalizeStudentLessonStats(data);
  } catch (error) {
    if (requestId !== studentLessonStatsRequestId) return;

    console.error("获取学生上课统计失败:", error);
    studentLessonStats.value = null;
  }
};

const syncStudentLessonCompletion = async (
  courseId = selectedStudentTaskCourseId.value,
  studentId = selectedTarget.value
) => {
  const requestId = ++studentLessonCompletionRequestId;
  const normalizedStudentId = normalizePlainText(studentId);
  const normalizedCourseId =
    courseId && courseId !== SCHOOL_ALL_COURSE_VALUE
      ? normalizePlainText(courseId)
      : undefined;

  if (!normalizedStudentId) {
    studentLessonCompletion.value = null;
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getStudentLessonCompletion({
      studentId: normalizedStudentId,
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== studentLessonCompletionRequestId) return;

    studentLessonCompletion.value = normalizeStudentLessonCompletionSummary(data);
  } catch (error) {
    if (requestId !== studentLessonCompletionRequestId) return;

    console.error("获取学生任务完成情况失败:", error);
    studentLessonCompletion.value = null;
  }
};

const syncStudentExerciseAccuracy = async (
  courseId = selectedStudentExerciseCourseId.value,
  studentId = selectedTarget.value
) => {
  const requestId = ++studentExerciseAccuracyRequestId;
  const normalizedStudentId = normalizePlainText(studentId);
  const normalizedCourseId =
    courseId && courseId !== SCHOOL_ALL_COURSE_VALUE
      ? normalizePlainText(courseId)
      : undefined;

  if (!normalizedStudentId) {
    studentExerciseAccuracy.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getStudentExerciseAccuracy({
      studentId: normalizedStudentId,
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== studentExerciseAccuracyRequestId) return;

    studentExerciseAccuracy.value = normalizeStudentExerciseAccuracy(data);
  } catch (error) {
    if (requestId !== studentExerciseAccuracyRequestId) return;

    console.error("获取学生练习题正确率失败:", error);
    studentExerciseAccuracy.value = [];
  }
};

const syncStudentWorksCount = async (studentId = selectedTarget.value) => {
  const requestId = ++studentWorksCountRequestId;
  const normalizedStudentId = normalizePlainText(studentId);

  if (!normalizedStudentId) {
    studentWorksCount.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getStudentWorksCount({
      studentId: normalizedStudentId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== studentWorksCountRequestId) return;

    studentWorksCount.value = normalizeSchoolWorksCount(data);
  } catch (error) {
    if (requestId !== studentWorksCountRequestId) return;

    console.error("获取学生各应用创建数量失败:", error);
    studentWorksCount.value = [];
  }
};

const syncClassCourseOptions = async (classId = selectedTarget.value) => {
  const requestId = ++classCourseOptionsRequestId;
  const normalizedClassId = normalizePlainText(classId);

  if (!normalizedClassId) {
    classCourseOptions.value = [SCHOOL_ALL_COURSE_OPTION];
    classCourseList.value = [];
    isSyncingClassCourseOptions = true;
    selectedClassCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedClassProgressCourseId.value = "";
    selectedClassAttendanceCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedClassTaskCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    isSyncingClassCourseOptions = false;
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getClassCourses({
      classId: normalizedClassId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== classCourseOptionsRequestId) return;

    const options = normalizeSchoolCourseOptions(data);
    const courseList = normalizeSchoolCourseList(data);
    classCourseOptions.value = options;
    classCourseList.value = courseList;
    const progressOptions = options.filter(
      (item) => item.value !== SCHOOL_ALL_COURSE_VALUE
    );

    isSyncingClassCourseOptions = true;
    if (!options.some((item) => item.value === selectedClassCourseId.value)) {
      selectedClassCourseId.value = options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (
      !progressOptions.some(
        (item) => item.value === selectedClassProgressCourseId.value
      )
    ) {
      selectedClassProgressCourseId.value = progressOptions[0]?.value || "";
    }
    if (
      !options.some((item) => item.value === selectedClassAttendanceCourseId.value)
    ) {
      selectedClassAttendanceCourseId.value =
        options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
    if (!options.some((item) => item.value === selectedClassTaskCourseId.value)) {
      selectedClassTaskCourseId.value = options[0]?.value || SCHOOL_ALL_COURSE_VALUE;
    }
  } catch (error) {
    if (requestId !== classCourseOptionsRequestId) return;

    console.error("获取班级课程下拉失败:", error);
    classCourseOptions.value = [SCHOOL_ALL_COURSE_OPTION];
    classCourseList.value = [];

    isSyncingClassCourseOptions = true;
    selectedClassCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedClassProgressCourseId.value = "";
    selectedClassAttendanceCourseId.value = SCHOOL_ALL_COURSE_VALUE;
    selectedClassTaskCourseId.value = SCHOOL_ALL_COURSE_VALUE;
  } finally {
    isSyncingClassCourseOptions = false;
  }
};

const syncClassAILiteracy = async (
  courseId = selectedClassCourseId.value,
  classId = selectedTarget.value
) => {
  const requestId = ++classAILiteracyRequestId;
  const normalizedClassId = normalizePlainText(classId);
  const normalizedCourseId =
    courseId && courseId !== SCHOOL_ALL_COURSE_VALUE
      ? normalizePlainText(courseId)
      : undefined;

  if (!normalizedClassId) {
    classAILiteracyGradeValue.value = "-";
    classAILiteracyFinalScore.value = 0;
    classAILiteracyDimensions.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getClassAILiteracy({
      classId: normalizedClassId,
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== classAILiteracyRequestId) return;

    classAILiteracyGradeValue.value = getSchoolAILiteracyGradeValue(data);
    classAILiteracyFinalScore.value = normalizeSchoolAILiteracyFinalScore(
      data?.finalScore
    );
    classAILiteracyDimensions.value = normalizeSchoolAILiteracyDimensions(
      data?.dimensions
    );
  } catch (error) {
    if (requestId !== classAILiteracyRequestId) return;

    console.error("获取班级AI素养评价失败:", error);
    classAILiteracyGradeValue.value = "-";
    classAILiteracyFinalScore.value = 0;
    classAILiteracyDimensions.value = [];
  }
};

const syncClassTeachingProgress = async (
  courseId = selectedClassProgressCourseId.value,
  classId = selectedTarget.value
) => {
  const requestId = ++classTeachingProgressRequestId;
  const normalizedClassId = normalizePlainText(classId);
  const normalizedCourseId = normalizePlainText(courseId);

  if (!normalizedClassId || !normalizedCourseId) {
    classTeachingProgress.value = null;
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getClassTeachingProgress({
      classId: normalizedClassId,
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== classTeachingProgressRequestId) return;

    classTeachingProgress.value = normalizeClassTeachingProgress(data);
  } catch (error) {
    if (requestId !== classTeachingProgressRequestId) return;

    console.error("获取班级授课进度失败:", error);
    classTeachingProgress.value = null;
  }
};

const syncSchoolAILiteracy = async (courseId: string) => {
  const requestId = ++schoolAILiteracyRequestId;
  const normalizedCourseId =
    courseId && courseId !== SCHOOL_ALL_COURSE_VALUE ? courseId : undefined;

  if (!courseId && !schoolCourseOptions.value.length) {
    schoolAILiteracyGradeValue.value = "-";
    schoolAILiteracyFinalScore.value = 0;
    schoolAILiteracyDimensions.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getSchoolAILiteracy({
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolAILiteracyRequestId) return;

    schoolAILiteracyGradeValue.value = getSchoolAILiteracyGradeValue(data);
    schoolAILiteracyFinalScore.value = normalizeSchoolAILiteracyFinalScore(
      data?.finalScore
    );
    schoolAILiteracyDimensions.value = normalizeSchoolAILiteracyDimensions(
      data?.dimensions
    );
  } catch (error) {
    if (requestId !== schoolAILiteracyRequestId) return;

    console.error("获取学校AI素养评价失败:", error);
    schoolAILiteracyGradeValue.value = "-";
    schoolAILiteracyFinalScore.value = 0;
    schoolAILiteracyDimensions.value = [];
  }
};

const syncGradeAILiteracy = async (
  courseId = selectedGradeCourseId.value,
  grade = selectedTarget.value
) => {
  const requestId = ++gradeAILiteracyRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);
  const normalizedCourseId =
    courseId && courseId !== SCHOOL_ALL_COURSE_VALUE ? courseId : undefined;

  if (!normalizedGrade) {
    gradeAILiteracyGradeValue.value = "-";
    gradeAILiteracyFinalScore.value = 0;
    gradeAILiteracyDimensions.value = [];
    return;
  }

  if (!courseId && !gradeCourseOptions.value.length) {
    gradeAILiteracyGradeValue.value = "-";
    gradeAILiteracyFinalScore.value = 0;
    gradeAILiteracyDimensions.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeAILiteracy({
      grade: normalizedGrade,
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeAILiteracyRequestId) return;

    gradeAILiteracyGradeValue.value = getSchoolAILiteracyGradeValue(data);
    gradeAILiteracyFinalScore.value = normalizeSchoolAILiteracyFinalScore(
      data?.finalScore
    );
    gradeAILiteracyDimensions.value = normalizeSchoolAILiteracyDimensions(
      data?.dimensions
    );
  } catch (error) {
    if (requestId !== gradeAILiteracyRequestId) return;

    console.error("获取年级AI素养评价失败:", error);
    gradeAILiteracyGradeValue.value = "-";
    gradeAILiteracyFinalScore.value = 0;
    gradeAILiteracyDimensions.value = [];
  }
};

const syncSchoolGradeOptions = async () => {
  try {
    await ensureSituationCascade("grade");
  } catch (error) {
    console.error("获取学校年级下拉失败:", error);
    schoolGradeOptions.value = [];
    selectedSchoolGradeId.value = SCHOOL_ALL_GRADE_VALUE;
  }
};

const syncSchoolGradeDistribution = async () => {
  const requestId = ++schoolGradeDistributionRequestId;

  try {
    const data = await getSchoolGradeDistribution();

    if (requestId !== schoolGradeDistributionRequestId) return;

    schoolGradeDistribution.value = normalizeSchoolGradeDistribution(data);
  } catch (error) {
    if (requestId !== schoolGradeDistributionRequestId) return;

    console.error("获取各年级人数分布失败:", error);
    schoolGradeDistribution.value = [];
  }
};

const syncGradeClassDistribution = async (grade = selectedTarget.value) => {
  const requestId = ++gradeClassDistributionRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeClassDistribution.value = [];
    return;
  }

  try {
    const data = await getGradeClassDistribution({ grade: normalizedGrade });

    if (requestId !== gradeClassDistributionRequestId) return;

    gradeClassDistribution.value = normalizeSchoolGradeDistribution(data);
  } catch (error) {
    if (requestId !== gradeClassDistributionRequestId) return;

    console.error("获取年级各班级人数分布失败:", error);
    gradeClassDistribution.value = [];
  }
};

const syncGradeTaskCount = async (grade = selectedTarget.value) => {
  const requestId = ++gradeWorksCountRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeWorksCount.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeTaskCount({
      grade: normalizedGrade,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeWorksCountRequestId) return;

    gradeWorksCount.value = normalizeSchoolWorksCount(data);
  } catch (error) {
    if (requestId !== gradeWorksCountRequestId) return;

    console.error("获取年级创作作品数量失败:", error);
    gradeWorksCount.value = [];
  }
};

const syncClassWorksCount = async (classId = selectedTarget.value) => {
  const requestId = ++classWorksCountRequestId;
  const normalizedClassId = normalizePlainText(classId);

  if (!normalizedClassId) {
    classWorksCount.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getClassWorksCount({
      classId: normalizedClassId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== classWorksCountRequestId) return;

    classWorksCount.value = normalizeSchoolWorksCount(data);
  } catch (error) {
    if (requestId !== classWorksCountRequestId) return;

    console.error("获取班级学生创建作品数量失败:", error);
    classWorksCount.value = [];
  }
};

const syncGradeAttendance = async (
  courseId = selectedGradeAttendanceCourseId.value,
  grade = selectedTarget.value
) => {
  const requestId = ++gradeAttendanceRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeAttendance.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeAttendance({
      grade: normalizedGrade,
      courseId:
        courseId && courseId !== SCHOOL_ALL_COURSE_VALUE ? courseId : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeAttendanceRequestId) return;

    gradeAttendance.value = normalizeSchoolAttendance(data);
  } catch (error) {
    if (requestId !== gradeAttendanceRequestId) return;

    console.error("获取年级课堂出勤率失败:", error);
    gradeAttendance.value = [];
  }
};

const syncClassAttendance = async (
  courseId = selectedClassAttendanceCourseId.value,
  classId = selectedTarget.value
) => {
  const requestId = ++classAttendanceRequestId;
  const normalizedClassId = normalizePlainText(classId);
  const normalizedCourseId =
    courseId && courseId !== SCHOOL_ALL_COURSE_VALUE
      ? normalizePlainText(courseId)
      : undefined;

  if (!normalizedClassId) {
    classAttendance.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getClassAttendance({
      classId: normalizedClassId,
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== classAttendanceRequestId) return;

    classAttendance.value = normalizeSchoolAttendance(data);
  } catch (error) {
    if (requestId !== classAttendanceRequestId) return;

    console.error("获取班级课堂出勤率失败:", error);
    classAttendance.value = [];
  }
};

const syncClassTaskCompletion = async (
  courseId = selectedClassTaskCourseId.value,
  classId = selectedTarget.value
) => {
  const requestId = ++classTaskCompletionRequestId;
  const normalizedClassId = normalizePlainText(classId);
  const normalizedCourseId =
    courseId && courseId !== SCHOOL_ALL_COURSE_VALUE
      ? normalizePlainText(courseId)
      : undefined;

  if (!normalizedClassId) {
    classTaskCompletion.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getClassTaskCompletion({
      classId: normalizedClassId,
      courseId: normalizedCourseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== classTaskCompletionRequestId) return;

    classTaskCompletion.value = normalizeSchoolTaskCompletion(data);
  } catch (error) {
    if (requestId !== classTaskCompletionRequestId) return;

    console.error("获取班级任务完成情况失败:", error);
    classTaskCompletion.value = [];
  }
};

const syncGradeTaskCompletion = async (
  courseId = selectedGradeTaskCourseId.value,
  grade = selectedTarget.value
) => {
  const requestId = ++gradeTaskCompletionRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeTaskCompletion.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeTaskCompletion({
      grade: normalizedGrade,
      courseId:
        courseId && courseId !== SCHOOL_ALL_COURSE_VALUE ? courseId : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeTaskCompletionRequestId) return;

    gradeTaskCompletion.value = normalizeSchoolTaskCompletion(data);
  } catch (error) {
    if (requestId !== gradeTaskCompletionRequestId) return;

    console.error("获取年级任务完成情况失败:", error);
    gradeTaskCompletion.value = [];
  }
};

const syncGradeTaskGrading = async (
  courseId = selectedGradeTaskGradingCourseId.value,
  grade = selectedTarget.value
) => {
  const requestId = ++gradeTaskGradingRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeTaskGrading.value = [];
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeTaskGrading({
      grade: normalizedGrade,
      courseId:
        courseId && courseId !== SCHOOL_ALL_COURSE_VALUE ? courseId : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeTaskGradingRequestId) return;

    gradeTaskGrading.value = normalizeSchoolTaskCompletion(data);
  } catch (error) {
    if (requestId !== gradeTaskGradingRequestId) return;

    console.error("获取年级任务批改情况失败:", error);
    gradeTaskGrading.value = [];
  }
};

const syncSchoolWorksCount = async () => {
  const requestId = ++schoolWorksCountRequestId;

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getSchoolWorksCount({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolWorksCountRequestId) return;

    schoolWorksCount.value = normalizeSchoolWorksCount(data);
  } catch (error) {
    if (requestId !== schoolWorksCountRequestId) return;

    console.error("获取学校学生创建作品数量失败:", error);
    schoolWorksCount.value = [];
  }
};

const syncSchoolAttendance = async () => {
  const requestId = ++schoolAttendanceRequestId;

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const selectedOption = schoolCourseOptions.value.find(
      (item) => item.value === selectedSchoolAttendanceCourseId.value
    );
    const courseId =
      selectedSchoolAttendanceCourseId.value &&
      selectedSchoolAttendanceCourseId.value !== SCHOOL_ALL_COURSE_VALUE
        ? selectedOption?.courseId || selectedSchoolAttendanceCourseId.value
        : undefined;

    const data = await getSchoolAttendance({
      courseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolAttendanceRequestId) return;

    schoolAttendance.value = normalizeSchoolAttendance(data);
  } catch (error) {
    if (requestId !== schoolAttendanceRequestId) return;

    console.error("获取学校课堂出勤率失败:", error);
    schoolAttendance.value = [];
  }
};

const syncSchoolTeachingStats = async () => {
  const requestId = ++schoolTeachingStatsRequestId;

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getSchoolTeachingStats({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolTeachingStatsRequestId) return;

    schoolTeachingStats.value = normalizeSchoolTeachingStats(data);
  } catch (error) {
    if (requestId !== schoolTeachingStatsRequestId) return;

    console.error("获取学校教学统计失败:", error);
    schoolTeachingStats.value = null;
  }
};

const syncGradeTeachingStats = async (grade = selectedTarget.value) => {
  const requestId = ++gradeTeachingStatsRequestId;
  const normalizedGrade = getResolvedGradeTargetValue(grade);

  if (!normalizedGrade) {
    gradeTeachingStats.value = null;
    return;
  }

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const data = await getGradeTeachingStats({
      grade: normalizedGrade,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== gradeTeachingStatsRequestId) return;

    gradeTeachingStats.value = normalizeSchoolTeachingStats(data);
  } catch (error) {
    if (requestId !== gradeTeachingStatsRequestId) return;

    console.error("获取年级教学统计失败:", error);
    gradeTeachingStats.value = null;
  }
};

const syncSchoolTaskCompletion = async () => {
  const requestId = ++schoolTaskCompletionRequestId;

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const courseId =
      selectedSchoolTaskCourseId.value &&
      selectedSchoolTaskCourseId.value !== SCHOOL_ALL_COURSE_VALUE
        ? selectedSchoolTaskCourseId.value
        : undefined;

    const data = await getSchoolTaskCompletion({
      courseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolTaskCompletionRequestId) return;

    schoolTaskCompletion.value = normalizeSchoolTaskCompletion(data);
  } catch (error) {
    if (requestId !== schoolTaskCompletionRequestId) return;

    console.error("获取学校任务完成情况失败:", error);
    schoolTaskCompletion.value = [];
  }
};

const syncSchoolTaskGrading = async () => {
  const requestId = ++schoolTaskGradingRequestId;

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const courseId =
      selectedSchoolTaskGradingCourseId.value &&
      selectedSchoolTaskGradingCourseId.value !== SCHOOL_ALL_COURSE_VALUE
        ? selectedSchoolTaskGradingCourseId.value
        : undefined;

    const data = await getSchoolTaskGrading({
      courseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolTaskGradingRequestId) return;

    schoolTaskGrading.value = normalizeSchoolTaskCompletion(data);
  } catch (error) {
    if (requestId !== schoolTaskGradingRequestId) return;

    console.error("获取学校任务批改情况失败:", error);
    schoolTaskGrading.value = [];
  }
};

const syncSchoolCourseList = async () => {
  const requestId = ++schoolCourseListRequestId;

  try {
    const [startDate, endDate] = selectedDateRange.value || [];
    const grade =
      selectedSchoolGradeId.value &&
      selectedSchoolGradeId.value !== SCHOOL_ALL_GRADE_VALUE
        ? selectedSchoolGradeId.value
        : undefined;
    const courseId =
      selectedSchoolCourseListCourseId.value &&
      selectedSchoolCourseListCourseId.value !== SCHOOL_ALL_COURSE_VALUE
        ? selectedSchoolCourseListCourseId.value
        : undefined;
    const data = await getSchoolCourses({
      grade,
      courseId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    if (requestId !== schoolCourseListRequestId) return;

    schoolCourseList.value = normalizeSchoolCourseList(data);
  } catch (error) {
    if (requestId !== schoolCourseListRequestId) return;

    console.error("获取学校授课课程失败:", error);
    schoolCourseList.value = [];
  }
};

const openSemesterSettingsModal = () => {
  showSemesterSettingsModal.value = true;
};

const handleSemesterSave = (items: SemesterItem[]) => {
  semesterItems.value = items;
};

const wrapChartLabel = (value: string, lineLength = 8) => {
  const text = String(value || "").trim();
  if (!text) return "";

  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += lineLength) {
    chunks.push(text.slice(index, index + lineLength));
  }
  return chunks.join("\n");
};

const currentDashboard = computed(() => dashboards[activeTab.value]);
const isSchoolPage = computed(() => selectedPage.value === "school");
const isGradePage = computed(() => selectedPage.value === "grade");
const displayCourseListTitle = computed(() => {
  if (activeTab.value === "data" && (isSchoolPage.value || isGradePage.value)) {
    return "教学统计";
  }
  if (activeTab.value === "data" && isStudentPage.value) {
    return "上课课程";
  }
  return currentDashboard.value.courseListTitle;
});
const displayTeachingStats = computed<SchoolTeachingStatsViewModel>(() => {
  if (isGradePage.value) {
    return gradeTeachingStats.value || createEmptySchoolTeachingStats();
  }

  return schoolTeachingStats.value || createEmptySchoolTeachingStats();
});
const hasTeachingStatsData = computed(() => {
  if (isGradePage.value) {
    return gradeTeachingStats.value !== null;
  }

  return schoolTeachingStats.value !== null;
});
const schoolTeachingMaxCount = computed(() =>
  Math.max(
    displayTeachingStats.value.prepareCount,
    displayTeachingStats.value.teachCount,
    1
  )
);
const schoolTeachingPrepareBarWidth = computed(() => {
  const value = displayTeachingStats.value.prepareCount;
  if (value <= 0) return 0;
  return Math.max((value / schoolTeachingMaxCount.value) * 100, 18);
});
const schoolTeachingTeachBarWidth = computed(() => {
  const value = displayTeachingStats.value.teachCount;
  if (value <= 0) return 0;
  return Math.max((value / schoolTeachingMaxCount.value) * 100, 18);
});
const displayEvaluationTitle = computed(() => {
  if (activeTab.value === "data" && isSchoolPage.value) {
    return "学校AI素养评价";
  }
  if (activeTab.value === "data" && isGradePage.value) {
    return "年级AI素养评价";
  }
  if (activeTab.value === "data" && isClassPage.value) {
    return "班级AI素养评价";
  }
  if (activeTab.value === "data" && isStudentPage.value) {
    return "学生AI素养评价";
  }
  return currentDashboard.value.evaluationTitle;
});
const displayMetrics = computed(() => {
  if (activeTab.value === "data" && isSchoolPage.value) {
    return schoolOverviewMetrics.value.length
      ? schoolOverviewMetrics.value
      : createSchoolOverviewMetrics();
  }

  if (activeTab.value === "data" && isGradePage.value) {
    return gradeOverviewMetrics.value.length
      ? gradeOverviewMetrics.value
      : createSchoolOverviewMetrics();
  }

  if (activeTab.value === "data" && isClassPage.value) {
    return classOverviewMetrics.value.length
      ? classOverviewMetrics.value
      : createSchoolOverviewMetrics();
  }

  if (activeTab.value === "data" && isStudentPage.value) {
    return studentOverviewMetrics.value.length
      ? studentOverviewMetrics.value
      : createStudentOverviewMetrics();
  }

  return currentDashboard.value.metrics;
});
const shouldUseSchoolAILiteracyMock = computed(() => {
  if (!schoolAILiteracyDimensions.value.length) return true;

  return schoolAILiteracyDimensions.value.every((item) => Number(item.score ?? 0) <= 0);
});
const resolvedSchoolAILiteracyGradeValue = computed(() =>
  shouldUseSchoolAILiteracyMock.value
    ? String(SCHOOL_AI_LITERACY_MOCK_DATA.grade || "-")
    : schoolAILiteracyGradeValue.value
);
const resolvedSchoolAILiteracyFinalScore = computed(() =>
  shouldUseSchoolAILiteracyMock.value
    ? Number(SCHOOL_AI_LITERACY_MOCK_DATA.finalScore ?? 0)
    : schoolAILiteracyFinalScore.value
);
const resolvedSchoolAILiteracyDimensions = computed(() =>
  shouldUseSchoolAILiteracyMock.value
    ? normalizeSchoolAILiteracyDimensions(SCHOOL_AI_LITERACY_MOCK_DATA.dimensions)
    : schoolAILiteracyDimensions.value
);
const classProgressCourseOptions = computed(() =>
  classCourseOptions.value.filter((item) => item.value !== SCHOOL_ALL_COURSE_VALUE)
);
const hasClassAILiteracyData = computed(() => classAILiteracyDimensions.value.length > 0);
const hasClassTeachingProgressData = computed(() => classTeachingProgress.value !== null);
const hasGradeAILiteracyData = computed(() => gradeAILiteracyDimensions.value.length > 0);
const hasStudentAILiteracyData = computed(() => studentAILiteracyDimensions.value.length > 0);
const hasStudentLessonStatsData = computed(() => studentLessonStats.value !== null);
const displayStudentLessonStats = computed<StudentLessonStatsViewModel>(() =>
  studentLessonStats.value || {
    lessonCount: 0,
    attendanceRate: 0,
    platformDuration: "-",
    platformDurationMinutes: 0,
  }
);
const formatStudentLessonStatNumber = (value: number) => String(Math.max(0, value || 0));
const formatStudentLessonStatRate = (value: number) =>
  `${Number.isInteger(value) ? value : Number(value.toFixed(1))}%`;
const formatStudentTaskCompletionRate = (value: number) =>
  `${Number.isInteger(value) ? value : Number(value.toFixed(1))}%`;
const studentLessonStatsCards = computed(() => [
  {
    key: "lesson-count",
    label: "累计上课次数",
    value: formatStudentLessonStatNumber(displayStudentLessonStats.value.lessonCount),
    suffix: "次",
    theme: "warm",
    icon: "calendar",
  },
  {
    key: "attendance-rate",
    label: "课程出勤率",
    value: formatStudentLessonStatRate(displayStudentLessonStats.value.attendanceRate),
    suffix: "",
    theme: "cool",
    icon: "attendance",
  },
  {
    key: "platform-duration",
    label: "平台使用时长",
    value: displayStudentLessonStats.value.platformDuration || "-",
    suffix: "",
    theme: "mint",
    icon: "duration",
  },
]);
const displayAILiteracyGradeValue = computed(() => {
  if (isSchoolPage.value) {
    return resolvedSchoolAILiteracyGradeValue.value;
  }

  if (isClassPage.value) {
    return classAILiteracyGradeValue.value;
  }

  if (isGradePage.value) {
    return gradeAILiteracyGradeValue.value;
  }

  if (isStudentPage.value) {
    return studentAILiteracyGradeValue.value;
  }

  return currentDashboard.value.averageValue;
});
const displayAILiteracyFinalScore = computed(() => {
  if (isSchoolPage.value) {
    return resolvedSchoolAILiteracyFinalScore.value;
  }

  if (isClassPage.value) {
    return classAILiteracyFinalScore.value;
  }

  if (isGradePage.value) {
    return gradeAILiteracyFinalScore.value;
  }

  if (isStudentPage.value) {
    return studentAILiteracyFinalScore.value;
  }

  return 0;
});
const displayAILiteracyDimensions = computed(() => {
  if (isSchoolPage.value) {
    return resolvedSchoolAILiteracyDimensions.value;
  }

  if (isClassPage.value) {
    return classAILiteracyDimensions.value;
  }

  if (isGradePage.value) {
    return gradeAILiteracyDimensions.value;
  }

  if (isStudentPage.value) {
    return studentAILiteracyDimensions.value;
  }

  return [];
});
const shouldShowAILiteracyChart = computed(() => {
  if (activeTab.value !== "data") return false;
  if (isSchoolPage.value) return hasSchoolAILiteracyData.value;
  if (isClassPage.value) return hasClassAILiteracyData.value;
  if (isGradePage.value) return hasGradeAILiteracyData.value;
  if (isStudentPage.value) return hasStudentAILiteracyData.value;
  return false;
});
const displayAverageValue = computed(() => {
  if (activeTab.value === "data" && isSchoolPage.value) {
    return displayAILiteracyGradeValue.value;
  }
  if (activeTab.value === "data" && isClassPage.value) {
    return displayAILiteracyGradeValue.value;
  }
  if (activeTab.value === "data" && isGradePage.value) {
    return displayAILiteracyGradeValue.value;
  }
  if (activeTab.value === "data" && isStudentPage.value) {
    return displayAILiteracyGradeValue.value;
  }
  return currentDashboard.value.averageValue;
});
const displayProgressTitle = computed(() => {
  if (activeTab.value === "data" && isSchoolPage.value) {
    return "各年级人数分布";
  }
  if (activeTab.value === "data" && isGradePage.value) {
    return "各班级人数分布";
  }
  if (activeTab.value === "data" && isStudentPage.value) {
    return "上课统计";
  }
  return currentDashboard.value.progressTitle;
});
const displayProgressFinishedCount = computed(() => {
  if (activeTab.value === "data" && isClassPage.value) {
    return classTeachingProgress.value?.finishedCount ?? 0;
  }

  return currentDashboard.value.finishedCount;
});
const displayProgressPendingCount = computed(() => {
  if (activeTab.value === "data" && isClassPage.value) {
    return classTeachingProgress.value?.pendingCount ?? 0;
  }

  return currentDashboard.value.pendingCount;
});
const displayAttendanceTitle = computed(() => {
  if (activeTab.value === "data" && isSchoolPage.value) {
    return "各年级创作作品数量";
  }
  if (activeTab.value === "data" && isGradePage.value) {
    return "各班级创作作品数量";
  }
  if (activeTab.value === "data" && isClassPage.value) {
    return "学生创建作品数量";
  }
  if (activeTab.value === "data" && isStudentPage.value) {
    return "各应用创建数量";
  }
  return currentDashboard.value.attendanceTitle;
});
const displayPracticeTitle = computed(() => {
  if (activeTab.value === "data" && isSchoolPage.value) {
    return "课堂出勤率";
  }
  if (activeTab.value === "data" && isGradePage.value) {
    return "课堂出勤率";
  }
  if (activeTab.value === "data" && isClassPage.value) {
    return "课堂出勤率";
  }
  if (activeTab.value === "data" && isStudentPage.value) {
    return "各练习题正确率";
  }
  return currentDashboard.value.practiceTitle;
});
const hasSchoolAILiteracyData = computed(
  () => resolvedSchoolAILiteracyDimensions.value.length > 0
);
const shouldUseSchoolGradeDistributionMock = computed(() => {
  if (!schoolGradeDistribution.value.length) return true;

  return schoolGradeDistribution.value.every((item) => Number(item.count ?? 0) <= 0);
});
const resolvedSchoolGradeDistribution = computed(() =>
  shouldUseSchoolGradeDistributionMock.value
    ? normalizeSchoolGradeDistribution(SCHOOL_GRADE_DISTRIBUTION_MOCK_DATA)
    : schoolGradeDistribution.value
);
const hasSchoolGradeDistributionData = computed(
  () => resolvedSchoolGradeDistribution.value.length > 0
);
const hasGradeClassDistributionData = computed(
  () =>
    gradeClassDistribution.value.length > 0 &&
    gradeClassDistribution.value.some((item) => Number(item.count ?? 0) > 0)
);
const displayGradeDistributionData = computed(() => {
  if (isSchoolPage.value) {
    return resolvedSchoolGradeDistribution.value;
  }

  if (isGradePage.value) {
    return gradeClassDistribution.value;
  }

  return [];
});
const hasDisplayGradeDistributionData = computed(() => {
  if (isSchoolPage.value) {
    return hasSchoolGradeDistributionData.value;
  }

  if (isGradePage.value) {
    return hasGradeClassDistributionData.value;
  }

  return false;
});
const displaySchoolGradeFilterOptions = computed<OptionItem[]>(() => [
  SCHOOL_ALL_GRADE_OPTION,
  ...schoolGradeOptions.value,
]);
const selectedSchoolGradeOption = computed(
  () =>
    schoolGradeOptions.value.find((item) => item.value === selectedSchoolGradeId.value) ||
    null
);
const filteredSchoolCourseList = computed(() => {
  const selectedGradeId = selectedSchoolGradeId.value;
  if (!selectedGradeId || selectedGradeId === SCHOOL_ALL_GRADE_VALUE) {
    return schoolCourseList.value;
  }

  const selectedGradeLabel = selectedSchoolGradeOption.value?.label || "";
  const matchedList = schoolCourseList.value.filter((item) =>
    matchesSchoolCourseGrade(item, selectedGradeId, selectedGradeLabel)
  );
  return matchedList.length ? matchedList : schoolCourseList.value;
});
const hasClassCourseListData = computed(() => classCourseList.value.length > 0);
const hasSchoolCourseListData = computed(() => filteredSchoolCourseList.value.length > 0);
const hasGradeCourseListData = computed(() => gradeCourseList.value.length > 0);
const hasStudentCourseListData = computed(() => studentCourseList.value.length > 0);
const hasSchoolWorksCountData = computed(
  () =>
    schoolWorksCount.value.length > 0 &&
    schoolWorksCount.value.some((item) => Number(item.worksCount ?? 0) > 0)
);
const hasGradeWorksCountData = computed(
  () =>
    gradeWorksCount.value.length > 0 &&
    gradeWorksCount.value.some((item) => Number(item.worksCount ?? 0) > 0)
);
const hasClassWorksCountData = computed(
  () => classWorksCount.value.length > 0
);
const hasStudentWorksCountData = computed(
  () =>
    studentWorksCountChartData.value.some((item) => Number(item.value ?? 0) > 0)
);
const displayWorksCountData = computed(() => {
  if (isStudentPage.value) {
    return studentWorksCount.value;
  }

  if (isClassPage.value) {
    return classWorksCount.value;
  }

  if (isGradePage.value) {
    return gradeWorksCount.value;
  }

  if (isSchoolPage.value) {
    return schoolWorksCount.value;
  }

  return [];
});
const hasDisplayWorksCountData = computed(() => {
  if (isStudentPage.value) return hasStudentWorksCountData.value;
  if (isClassPage.value) return hasClassWorksCountData.value;
  if (isGradePage.value) return hasGradeWorksCountData.value;
  if (isSchoolPage.value) return hasSchoolWorksCountData.value;
  return false;
});
const hasSchoolAttendanceData = computed(
  () =>
    schoolAttendance.value.length > 0 &&
    schoolAttendance.value.some((item) => Number(item.value ?? 0) >= 0)
);
const hasGradeAttendanceData = computed(
  () =>
    gradeAttendance.value.length > 0 &&
    gradeAttendance.value.some((item) => Number(item.value ?? 0) >= 0)
);
const hasClassAttendanceData = computed(
  () =>
    classAttendance.value.length > 0 &&
    classAttendance.value.some((item) => Number(item.value ?? 0) >= 0)
);
const displayAttendanceData = computed(() => {
  if (isClassPage.value) {
    return classAttendance.value;
  }

  if (isGradePage.value) {
    return gradeAttendance.value;
  }

  if (isSchoolPage.value) {
    return schoolAttendance.value;
  }

  return [];
});
const hasDisplayAttendanceData = computed(() => {
  if (isClassPage.value) return hasClassAttendanceData.value;
  if (isGradePage.value) return hasGradeAttendanceData.value;
  if (isSchoolPage.value) return hasSchoolAttendanceData.value;
  return false;
});
const hasStudentExerciseAccuracyData = computed(
  () =>
    studentExerciseAccuracy.value.length > 0 &&
    studentExerciseAccuracy.value.some((item) => Number(item.value ?? 0) >= 0)
);
const studentLessonCompletionSummary = computed<StudentLessonCompletionSummaryViewModel>(
  () =>
    studentLessonCompletion.value || {
      completionRate: 0,
      pendingRate: 0,
      taskCount: 0,
    }
);
const getSchoolTaskStatusMaxTaskCount = (chapters: SchoolTaskCompletionChapter[]) =>
  Math.max(...chapters.map((chapter) => chapter.tasks.length), 0);
const hasSchoolTaskStatusData = (chapters: SchoolTaskCompletionChapter[]) =>
  chapters.length > 0 && chapters.some((chapter) => chapter.tasks.length > 0);
const getSchoolTaskStatusYAxisMax = (chapters: SchoolTaskCompletionChapter[]) => {
  const maxValue = Math.max(
    ...chapters.flatMap((chapter) =>
      chapter.tasks.map((task) => Number(task.completionRate ?? 0))
    ),
    0
  );

  if (maxValue <= 0) return 10;
  if (maxValue <= 5) return 5;
  if (maxValue <= 10) return 10;

  return Math.ceil(maxValue / 10) * 10;
};
const createSchoolTaskStatusOption = (
  chapters: SchoolTaskCompletionChapter[],
  valueLabel: string
) => {
  const maxTaskCount = getSchoolTaskStatusMaxTaskCount(chapters);
  const shouldEnableZoom = chapters.length > 4;
  const defaultEndIndex = chapters.length ? Math.min(chapters.length - 1, 3) : 0;

  return {
    backgroundColor: "transparent",
    color: [...SCHOOL_TASK_COMPLETION_COLORS],
    grid: {
      top: 18,
      left: 48,
      right: 24,
      bottom: shouldEnableZoom ? 86 : 58,
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(34, 46, 63, 0.92)",
      borderWidth: 0,
      padding: [8, 12],
      textStyle: {
        color: "#ffffff",
        fontSize: 12,
        lineHeight: 18,
      },
      formatter: (params: any) => {
        const taskName = String(params?.data?.taskName ?? params?.seriesName ?? "-");
        const chapterName = String(params?.data?.chapterName ?? params?.name ?? "-");
        const value = Number(params?.data?.rawValue ?? params?.data?.value ?? 0);
        return `章节：${chapterName}<br/>任务名称：${taskName}<br/>${valueLabel}：${value}%`;
      },
    },
    dataZoom: shouldEnableZoom
      ? [
          {
            type: "inside",
            xAxisIndex: 0,
            startValue: 0,
            endValue: defaultEndIndex,
            filterMode: "none",
          },
          {
            type: "slider",
            xAxisIndex: 0,
            bottom: 10,
            height: 18,
            startValue: 0,
            endValue: defaultEndIndex,
            filterMode: "none",
            brushSelect: false,
            borderColor: "transparent",
            backgroundColor: "#edf2f8",
            fillerColor: "rgba(78, 115, 223, 0.22)",
            dataBackground: {
              lineStyle: {
                color: "#cdd7e5",
              },
              areaStyle: {
                color: "rgba(205, 215, 229, 0.35)",
              },
            },
            selectedDataBackground: {
              lineStyle: {
                color: "#93abf5",
              },
              areaStyle: {
                color: "rgba(147, 171, 245, 0.24)",
              },
            },
            handleSize: 14,
            handleStyle: {
              color: "#4E73DF",
              borderColor: "#ffffff",
              borderWidth: 1,
            },
            textStyle: {
              color: "#7a8aa1",
            },
          },
        ]
      : [],
    xAxis: {
      type: "category",
      data: chapters.map((chapter) => chapter.chapterName),
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "#d5deea",
        },
      },
      axisLabel: {
        color: "#66758c",
        fontSize: 12,
        interval: 0,
        margin: 14,
        formatter: (value: string) => wrapChartLabel(value, 8),
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: getSchoolTaskStatusYAxisMax(chapters),
      splitNumber: 5,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: "#edf2f8",
        },
      },
      axisLabel: {
        color: "#8a98ad",
        fontSize: 11,
      },
    },
    series: Array.from({ length: maxTaskCount }, (_, taskIndex) => ({
      name: `任务${taskIndex + 1}`,
      type: "bar",
      barMaxWidth: 28,
      barMinHeight: 6,
      itemStyle: {
        color: SCHOOL_TASK_COMPLETION_COLORS[
          taskIndex % SCHOOL_TASK_COMPLETION_COLORS.length
        ],
        borderRadius: [6, 6, 0, 0],
      },
      data: chapters.map((chapter) => {
        const matchedTask = chapter.tasks[taskIndex];
        if (!matchedTask) return null;

        return {
          value:
            matchedTask.completionRate > 0 ? matchedTask.completionRate : 0.0001,
          rawValue: matchedTask.completionRate,
          taskName: matchedTask.taskName,
          chapterName: chapter.chapterName,
        };
      }),
    })),
  };
};
const hasSchoolTaskCompletionData = computed(() =>
  hasSchoolTaskStatusData(schoolTaskCompletion.value)
);
const hasSchoolTaskGradingData = computed(() =>
  hasSchoolTaskStatusData(schoolTaskGrading.value)
);
const hasClassTaskCompletionData = computed(() =>
  hasSchoolTaskStatusData(classTaskCompletion.value)
);
const hasStudentLessonCompletionData = computed(
  () => studentLessonCompletionSummary.value.taskCount > 0
);
const hasGradeTaskCompletionData = computed(() =>
  hasSchoolTaskStatusData(gradeTaskCompletion.value)
);
const hasGradeTaskGradingData = computed(() =>
  hasSchoolTaskStatusData(gradeTaskGrading.value)
);
const schoolTaskCompletionOption = computed(() =>
  createSchoolTaskStatusOption(schoolTaskCompletion.value, "完成率")
);
const classTaskCompletionOption = computed(() =>
  createSchoolTaskStatusOption(classTaskCompletion.value, "完成率")
);
const studentLessonCompletionOption = computed(() => ({
  backgroundColor: "transparent",
  legend: {
    show: true,
    top: 8,
    left: "center",
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 20,
    icon: "circle",
    textStyle: {
      color: "#5d6b81",
      fontSize: 13,
    },
    data: ["已完成", "未完成"],
  },
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(34, 46, 63, 0.92)",
    borderWidth: 0,
    padding: [8, 12],
    textStyle: {
      color: "#ffffff",
      fontSize: 12,
      lineHeight: 18,
    },
    formatter: (params: any) =>
      `${params.name}<br/>占比：${formatStudentTaskCompletionRate(
        Number(params?.value ?? 0)
      )}`,
  },
  graphic: [
    {
      type: "text",
      left: "center",
      top: "44%",
      style: {
        text: formatStudentTaskCompletionRate(
          studentLessonCompletionSummary.value.completionRate
        ),
        fill: "#1b2431",
        fontSize: 36,
        fontWeight: 800,
        textAlign: "center",
      },
    },
    {
      type: "text",
      left: "center",
      top: "56%",
      style: {
        text: "完成率",
        fill: "#6b7a90",
        fontSize: 15,
        fontWeight: 500,
        textAlign: "center",
      },
    },
    {
      type: "text",
      left: "center",
      top: "64%",
      style: {
        text: `共 ${studentLessonCompletionSummary.value.taskCount} 个任务`,
        fill: "#97a4b5",
        fontSize: 12,
        textAlign: "center",
      },
    },
  ],
  series: [
    {
      type: "pie",
      radius: ["52%", "70%"],
      center: ["50%", "60%"],
      startAngle: 90,
      minAngle: 4,
      avoidLabelOverlap: true,
      label: {
        show: true,
        position: "outside",
        color: "#4f5f73",
        fontSize: 12,
        lineHeight: 16,
        formatter: (params: any) =>
          `${params.name}\n${formatStudentTaskCompletionRate(
            Number(params?.value ?? 0)
          )}`,
      },
      labelLine: {
        show: true,
        length: 14,
        length2: 8,
        lineStyle: {
          color: "#c8d3e2",
          width: 1,
        },
      },
      itemStyle: {
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      data: [
        {
          value: studentLessonCompletionSummary.value.completionRate,
          name: "已完成",
          itemStyle: {
            color: STUDENT_TASK_COMPLETION_COLORS[0],
          },
        },
        {
          value: studentLessonCompletionSummary.value.pendingRate,
          name: "未完成",
          itemStyle: {
            color: STUDENT_TASK_COMPLETION_COLORS[1],
          },
        },
      ],
    },
  ],
}));
const schoolTaskGradingOption = computed(() =>
  createSchoolTaskStatusOption(schoolTaskGrading.value, "批改率")
);
const gradeTaskCompletionOption = computed(() =>
  createSchoolTaskStatusOption(gradeTaskCompletion.value, "完成率")
);
const gradeTaskGradingOption = computed(() =>
  createSchoolTaskStatusOption(gradeTaskGrading.value, "批改率")
);
const schoolAttendanceOption = computed(() => {
  const labels = displayAttendanceData.value.map((item) => item.name);
  const values = displayAttendanceData.value.map((item) => Number(item.value ?? 0));
  const shouldEnableZoom = labels.length > 6;
  const defaultEndIndex = labels.length
    ? Math.min(labels.length - 1, 5)
    : 0;

  return {
    backgroundColor: "transparent",
    grid: {
      top: 18,
      left: 44,
      right: 24,
      bottom: shouldEnableZoom ? 78 : 36,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(34, 46, 63, 0.92)",
      borderWidth: 0,
      padding: [8, 12],
      textStyle: {
        color: "#ffffff",
        fontSize: 12,
        lineHeight: 18,
      },
      formatter: (params: any[]) => {
        const target = params?.[0];
        if (!target) return "";
        return `${target.axisValue}<br/>出勤率：${target.data}%`;
      },
    },
    dataZoom: shouldEnableZoom
      ? [
          {
            type: "inside",
            xAxisIndex: 0,
            startValue: 0,
            endValue: defaultEndIndex,
            zoomOnMouseWheel: true,
            moveOnMouseMove: true,
            moveOnMouseWheel: true,
            preventDefaultMouseMove: false,
            filterMode: "none",
          },
          {
            type: "slider",
            xAxisIndex: 0,
            bottom: 10,
            height: 20,
            startValue: 0,
            endValue: defaultEndIndex,
            filterMode: "none",
            brushSelect: false,
            borderColor: "transparent",
            backgroundColor: "#edf2f8",
            fillerColor: "rgba(110, 152, 255, 0.24)",
            dataBackground: {
              lineStyle: {
                color: "#cdd7e5",
              },
              areaStyle: {
                color: "rgba(205, 215, 229, 0.35)",
              },
            },
            selectedDataBackground: {
              lineStyle: {
                color: "#8fb1ff",
              },
              areaStyle: {
                color: "rgba(143, 177, 255, 0.22)",
              },
            },
            handleSize: 14,
            handleStyle: {
              color: "#6e98ff",
              borderColor: "#ffffff",
              borderWidth: 1,
              shadowBlur: 4,
              shadowColor: "rgba(110, 152, 255, 0.24)",
            },
            textStyle: {
              color: "#7a8aa1",
            },
          },
        ]
      : [],
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "#d5deea",
        },
      },
      axisLabel: {
        color: "#6d7c92",
        fontSize: 11,
        interval: 0,
        hideOverlap: true,
        formatter: (value: string) =>
          value.length > 8 ? `${value.slice(0, 8)}...` : value,
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: "#edf2f8",
        },
      },
      axisLabel: {
        color: "#8a98ad",
        fontSize: 11,
        formatter: "{value}%",
      },
    },
    series: [
      {
        type: "line",
        smooth: false,
        symbol: "circle",
        symbolSize: 8,
        data: values,
        lineStyle: {
          color: "#6e98ff",
          width: 3,
        },
        itemStyle: {
          color: "#ffffff",
          borderColor: "#6e98ff",
          borderWidth: 2,
        },
        areaStyle: {
          color: "rgba(110, 152, 255, 0.08)",
        },
      },
    ],
  };
});
const studentExerciseAccuracyOption = computed(() => {
  const items = studentExerciseAccuracy.value;
  const labels = items.map((item) => item.name);
  const shouldEnableZoom = labels.length > 6;
  const defaultEndIndex = labels.length ? Math.min(labels.length - 1, 5) : 0;

  return {
    backgroundColor: "transparent",
    grid: {
      top: 18,
      left: 110,
      right: 34,
      bottom: shouldEnableZoom ? 72 : 20,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      backgroundColor: "rgba(34, 46, 63, 0.92)",
      borderWidth: 0,
      padding: [8, 12],
      textStyle: {
        color: "#ffffff",
        fontSize: 12,
        lineHeight: 18,
      },
      formatter: (params: any[]) => {
        const target = params?.[0];
        if (!target) return "";
        const matchedItem = items[target?.dataIndex ?? 0];
        if (!matchedItem) return "";

        return [
          matchedItem.name,
          `正确率：${formatStudentTaskCompletionRate(matchedItem.value)}`,
          `正确题数：${matchedItem.correctCount}`,
          `总题数：${matchedItem.totalQuestions}`,
        ].join("<br/>");
      },
    },
    dataZoom: shouldEnableZoom
      ? [
          {
            type: "inside",
            yAxisIndex: 0,
            startValue: 0,
            endValue: defaultEndIndex,
            filterMode: "empty",
          },
          {
            type: "slider",
            yAxisIndex: 0,
            right: 6,
            width: 12,
            startValue: 0,
            endValue: defaultEndIndex,
            filterMode: "empty",
            brushSelect: false,
            borderColor: "transparent",
            backgroundColor: "#edf2f8",
            fillerColor: "rgba(79, 114, 255, 0.2)",
            dataBackground: {
              lineStyle: {
                color: "#cdd7e5",
              },
              areaStyle: {
                color: "rgba(205, 215, 229, 0.35)",
              },
            },
            selectedDataBackground: {
              lineStyle: {
                color: "#90a8ff",
              },
              areaStyle: {
                color: "rgba(144, 168, 255, 0.2)",
              },
            },
            handleSize: 14,
            handleStyle: {
              color: "#4f72ff",
              borderColor: "#ffffff",
              borderWidth: 1,
            },
            textStyle: {
              color: "transparent",
              fontSize: 0,
            },
          },
        ]
      : [],
    xAxis: {
      type: "value",
      min: 0,
      max: 100,
      interval: 20,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: "#d5deea",
        },
      },
      splitLine: {
        lineStyle: {
          color: "#edf2f8",
        },
      },
      axisLabel: {
        color: "#8a98ad",
        fontSize: 11,
        formatter: "{value}%",
      },
    },
    yAxis: {
      type: "category",
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: "#66758c",
        fontSize: 11,
        interval: 0,
        width: 96,
        overflow: "truncate",
      },
    },
    series: [
      {
        type: "bar",
        barWidth: 22,
        showBackground: true,
        backgroundStyle: {
          color: "#edf2f8",
          borderRadius: 999,
        },
        data: items.map((item) => Number(item.value ?? 0)),
        label: {
          show: true,
          position: "right",
          color: "#4f72ff",
          fontSize: 12,
          fontWeight: 700,
          formatter: ({ value }: any) =>
            formatStudentTaskCompletionRate(Number(value ?? 0)),
        },
        itemStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#59c8ff" },
              { offset: 1, color: "#4f72ff" },
            ],
          },
          borderRadius: 999,
        },
      },
    ],
  };
});
const studentWorksCountChartData = computed<SchoolWorksCountChartItem[]>(() => {
  const platformCountMap = new Map<string, number>(
    STUDENT_WORKS_PLATFORM_CONFIG.map((item) => [item.key, 0])
  );

  studentWorksCount.value.forEach((item) => {
    const platformKey = normalizeStudentWorksPlatformKey(item);
    if (!platformKey) return;

    platformCountMap.set(
      platformKey,
      Number(platformCountMap.get(platformKey) ?? 0) +
        Number(item.worksCount ?? 0)
    );
  });

  return STUDENT_WORKS_PLATFORM_CONFIG.map((item, index) => ({
    name: item.label,
    value: Number(platformCountMap.get(item.key) ?? 0),
    color:
      SCHOOL_GRADE_DISTRIBUTION_COLORS[index % SCHOOL_GRADE_DISTRIBUTION_COLORS.length] ||
      SCHOOL_GRADE_DISTRIBUTION_COLORS[0],
  }));
});
const schoolWorksCountChartData = computed<SchoolWorksCountChartItem[]>(() => {
  if (isStudentPage.value) {
    return studentWorksCountChartData.value;
  }

  return displayWorksCountData.value.map((item, index) => ({
    name: String(item.gradeName || `年级${index + 1}`),
    value: Number(item.worksCount ?? 0),
    color:
      SCHOOL_GRADE_DISTRIBUTION_COLORS[index % SCHOOL_GRADE_DISTRIBUTION_COLORS.length] ||
      SCHOOL_GRADE_DISTRIBUTION_COLORS[0],
  }));
});
const displayWorksCountTotal = computed(() =>
  schoolWorksCountChartData.value.reduce((sum, item) => sum + Number(item.value || 0), 0)
);
const schoolWorksCountOption = computed(() => ({
  backgroundColor: "transparent",
  legend: {
    show: true,
    type: "scroll",
    orient: "horizontal",
    top: 8,
    left: 16,
    right: 16,
    itemWidth: 9,
    itemHeight: 9,
    itemGap: 10,
    icon: "circle",
    textStyle: {
      color: "#5d6b81",
      fontSize: 11,
    },
    pageButtonPosition: "end",
    pageButtonGap: 8,
    pageButtonItemGap: 4,
    pageIconColor: "#8c98ad",
    pageIconInactiveColor: "#d6deea",
    pageTextStyle: {
      color: "#7b899d",
      fontSize: 11,
    },
    data: schoolWorksCountChartData.value.map((item) => item.name),
  },
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(34, 46, 63, 0.92)",
    borderWidth: 0,
    padding: [8, 12],
    textStyle: {
      color: "#ffffff",
      fontSize: 12,
      lineHeight: 18,
    },
    formatter: (params: any) =>
      `${params.name}<br/>作品数：${params.value}<br/>占比：${params.percent}%`,
  },
  series: [
    {
      type: "pie",
      radius: ["46%", "64%"],
      center: ["50%", "62%"],
      minAngle: 6,
      startAngle: 92,
      avoidLabelOverlap: true,
      label: {
        show: true,
        position: "outside",
        color: "#4f5f73",
        fontSize: 11,
        lineHeight: 15,
        alignTo: "edge",
        edgeDistance: 8,
        bleedMargin: 4,
        formatter: (params: any) => `${params.value}\n${params.name}`,
      },
      labelLine: {
        show: true,
        length: 12,
        length2: 8,
        lineStyle: {
          color: "#c8d3e2",
          width: 1,
        },
      },
      itemStyle: {
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      data: schoolWorksCountChartData.value.map((item) => ({
        value: item.value,
        name: item.name,
        itemStyle: {
          color: item.color,
        },
      })),
    },
  ],
}));
const schoolGradeDistributionChartData = computed<SchoolGradeDistributionChartItem[]>(
  () =>
    displayGradeDistributionData.value.map((item, index) => ({
      name: String(item.gradeName || `年级${index + 1}`),
      value: Number(item.count ?? 0),
      color:
        SCHOOL_GRADE_DISTRIBUTION_COLORS[
          index % SCHOOL_GRADE_DISTRIBUTION_COLORS.length
        ] || SCHOOL_GRADE_DISTRIBUTION_COLORS[0],
    }))
);
const schoolGradeDistributionOption = computed(() => ({
  backgroundColor: "transparent",
  legend: {
    show: true,
    type: "scroll",
    orient: "horizontal",
    top: 8,
    left: 16,
    right: 16,
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 12,
    icon: "circle",
    textStyle: {
      color: "#5d6b81",
      fontSize: 12,
    },
    pageButtonPosition: "end",
    pageButtonGap: 10,
    pageButtonItemGap: 6,
    pageIconColor: "#8c98ad",
    pageIconInactiveColor: "#d6deea",
    pageTextStyle: {
      color: "#7b899d",
      fontSize: 12,
    },
    data: schoolGradeDistributionChartData.value.map((item) => item.name),
  },
  tooltip: {
    trigger: "item",
    backgroundColor: "rgba(34, 46, 63, 0.92)",
    borderWidth: 0,
    padding: [8, 12],
    textStyle: {
      color: "#ffffff",
      fontSize: 12,
      lineHeight: 18,
    },
    formatter: (params: any) =>
      `${params.name}<br/>人数：${params.value}<br/>占比：${params.percent}%`,
  },
  series: [
    {
      type: "pie",
      radius: "42%",
      center: ["50%", "62%"],
      minAngle: 6,
      startAngle: 96,
      avoidLabelOverlap: true,
      label: {
        show: true,
        position: "outside",
        color: "#4f5f73",
        fontSize: 11,
        lineHeight: 15,
        alignTo: "edge",
        edgeDistance: 8,
        bleedMargin: 4,
        formatter: (params: any) => `${params.name}\n（${params.value}）`,
      },
      labelLine: {
        show: true,
        length: 14,
        length2: 6,
        lineStyle: {
          color: "#c8d3e2",
          width: 1,
        },
      },
      itemStyle: {
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      data: schoolGradeDistributionChartData.value.map((item) => ({
        value: item.value,
        name: item.name,
        itemStyle: {
          color: item.color,
        },
      })),
    },
  ],
}));
const displayAILiteracyRadarIndicators = computed(() =>
  displayAILiteracyDimensions.value.map((item) => ({
    name: item.quotaName || "未命名维度",
    value: Number(item.score ?? 0),
    max: 100,
  }))
);
const displayAILiteracyRadarOption = computed(() => ({
  backgroundColor: "transparent",
  tooltip: {
    show: true,
    trigger: "item",
    backgroundColor: "rgba(34, 46, 63, 0.92)",
    borderWidth: 0,
    padding: [10, 12],
    textStyle: {
      color: "#ffffff",
      fontSize: 12,
      lineHeight: 18,
    },
    formatter: () =>
      displayAILiteracyRadarIndicators.value
        .map(
          (item) => `${item.name}<br/>分数：${formatSchoolAILiteracyValue(item.value)}`
        )
        .join("<br/><br/>"),
  },
  radar: {
    center: ["50%", "56%"],
    radius: "61%",
    startAngle: 90,
    shape: "polygon",
    splitNumber: 5,
    indicator: displayAILiteracyRadarIndicators.value.map(({ name, max }) => ({
      name,
      max,
    })),
    axisNameGap: 14,
    axisName: {
      color: "#596273",
      fontSize: 12,
      formatter: (name: string) => {
        const current = displayAILiteracyRadarIndicators.value.find(
          (item) => item.name === name
        );
        return `{name|${name}}\n{value|${formatSchoolAILiteracyValue(
          current?.value ?? 0
        )}}`;
      },
      rich: {
        name: {
          color: "#596273",
          fontSize: 12,
          fontWeight: 500,
          lineHeight: 16,
          align: "center",
        },
        value: {
          color: SCHOOL_AI_LITERACY_RADAR_LINE_COLOR,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 18,
          align: "center",
        },
      },
    },
    splitLine: {
      lineStyle: { color: "rgba(214, 221, 230, 0.96)", width: 1 },
    },
    splitArea: {
      areaStyle: {
        color: [
          "rgba(244, 247, 252, 0.96)",
          "rgba(250, 252, 255, 0.98)",
          "rgba(244, 247, 252, 0.96)",
          "rgba(250, 252, 255, 0.98)",
          "rgba(244, 247, 252, 0.96)",
        ],
      },
    },
    axisLine: {
      lineStyle: { color: "rgba(214, 221, 230, 0.96)", width: 1 },
    },
  },
  series: [
    {
      type: "radar",
      symbol: "circle",
      symbolSize: 6,
      data: [
        {
          value: displayAILiteracyRadarIndicators.value.map((item) => item.value),
          areaStyle: { color: "rgba(255, 153, 0, 0.05)" },
          lineStyle: {
            color: SCHOOL_AI_LITERACY_RADAR_LINE_COLOR,
            width: 2.4,
            join: "round",
          },
          itemStyle: {
            color: SCHOOL_AI_LITERACY_RADAR_LINE_COLOR,
            borderColor: "#ffffff",
            borderWidth: 1.5,
          },
        },
      ],
    },
  ],
}));
const isClassPage = computed(() => selectedPage.value === "class");
const isStudentPage = computed(() => selectedPage.value === "student");
const isCascadePage = computed(() => isClassPage.value || isStudentPage.value);

const currentTargetOptions = computed(() => {
  // if (selectedPage.value === "school") return schoolTargetOptions;
  if (selectedPage.value === "grade") return gradeTargetOptions.value;
  return [];
});

const activeClassGroup = computed(
  () =>
    classTargetGroups.value.find((group) => group.value === selectedClassGroup.value) ||
    classTargetGroups.value[0]
);

const activeStudentGrade = computed(
  () =>
    studentTargetGrades.value.find(
      (group) => group.value === selectedStudentGrade.value
    ) || studentTargetGrades.value[0]
);

const activeStudentClass = computed(
  () =>
    activeStudentGrade.value?.children.find(
      (group) => group.value === selectedStudentClass.value
    ) || activeStudentGrade.value?.children[0]
);

const findClassGroupByTarget = (targetValue: string) =>
  classTargetGroups.value.find((group) =>
    group.children.some((item) => item.value === targetValue)
  );

const findStudentGradeByTarget = (targetValue: string) =>
  studentTargetGrades.value.find((grade) =>
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
  if (activeTab.value === "data" && isClassPage.value) {
    return classTeachingProgress.value?.completionRate ?? 0;
  }

  const total = displayProgressFinishedCount.value + displayProgressPendingCount.value;
  if (!total) return 0;
  return (displayProgressFinishedCount.value / total) * 100;
});

const completionRateText = computed(() =>
  Number.isInteger(completionRate.value)
    ? String(completionRate.value)
    : completionRate.value.toFixed(1).replace(/\.0$/, "")
);

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
  const group = classTargetGroups.value.find((item) => item.value === groupValue);

  if (!group) return;
  if (!group.children.some((item) => item.value === selectedTarget.value)) {
    selectedTarget.value = group.children[0]?.value || "";
  }
};

const selectStudentGrade = (gradeValue: string) => {
  selectedStudentGrade.value = gradeValue;
  const grade = studentTargetGrades.value.find((item) => item.value === gradeValue);

  if (!grade) return;
  const matchedClass = grade.children.find((classItem) =>
    classItem.children.some((student) => student.value === selectedTarget.value)
  );

  const firstClassWithStudent =
    matchedClass || grade.children.find((classItem) => classItem.children.length > 0);

  selectedStudentClass.value =
    firstClassWithStudent?.value || grade.children[0]?.value || "";
  if (!matchedClass) {
    selectedTarget.value = firstClassWithStudent?.children[0]?.value || "";
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
    const nextSelection = getDefaultClassSelection();
    selectedClassGroup.value = nextSelection.groupValue;
    selectedTarget.value = nextSelection.targetValue;
    return;
  }

  if (page === "student") {
    const nextSelection = getDefaultStudentSelection();
    selectedStudentGrade.value = nextSelection.gradeValue;
    selectedStudentClass.value = nextSelection.classValue;
    selectedTarget.value = nextSelection.targetValue;
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

const getStudyScrollElements = () => {
  if (typeof document === "undefined") return [] as HTMLElement[];

  return [
    document.querySelector(".sidebar-shell-content"),
  ].filter((item): item is HTMLElement => !!item);
};

const clearLegacyStudyOuterScroll = () => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove(LEGACY_STUDY_OUTER_SCROLL_CLASS);
  document.body.classList.remove(LEGACY_STUDY_OUTER_SCROLL_CLASS);
};

const getStudyPageElement = () => {
  if (typeof document === "undefined") return null;
  return document.querySelector(".study-center-page") as HTMLElement | null;
};

const getStudyPageScrollTop = () => {
  if (typeof window === "undefined") return 0;
  const elementScrollTop = getStudyScrollElements().map((item) => item.scrollTop || 0);

  return Math.max(...elementScrollTop, window.scrollY || 0, 0);
};

const updateBackToTopVisible = () => {
  if (typeof window === "undefined") return;
  showBackToTop.value =
    getStudyPageScrollTop() > STUDY_BACK_TOP_VISIBLE_THRESHOLD;
};

const scrollStudyPageToTop = () => {
  if (typeof window === "undefined") return;
  getStudyScrollElements().forEach((item) => {
    item.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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

watch(selectedSchoolCourseId, async (courseId) => {
  if (isSyncingSchoolCourseOptions) return;
  if (activeTab.value !== "data" || !isSchoolPage.value) return;
  await syncSchoolAILiteracy(courseId);
});

watch(selectedSchoolCourseListCourseId, async () => {
  if (isSyncingSchoolCourseOptions) return;
  if (activeTab.value !== "data" || !isSchoolPage.value) return;
  await syncSchoolCourseList();
});

watch(selectedGradeCourseId, async (courseId) => {
  if (isSyncingGradeCourseOptions) return;
  if (activeTab.value !== "data" || !isGradePage.value) return;
  await syncGradeAILiteracy(courseId);
});

watch(selectedClassCourseId, async (courseId) => {
  if (isSyncingClassCourseOptions || isRefreshingClassCardContext) return;
  if (activeTab.value !== "data" || !isClassPage.value) return;
  await syncClassAILiteracy(courseId);
});

watch(selectedStudentCourseId, async (courseId) => {
  if (isSyncingStudentCourseOptions || isRefreshingStudentCardContext) return;
  if (activeTab.value !== "data" || !isStudentPage.value) return;
  await syncStudentAILiteracy(courseId);
});

watch(selectedStudentExerciseCourseId, async (courseId) => {
  if (isSyncingStudentCourseOptions || isRefreshingStudentCardContext) return;
  if (activeTab.value !== "data" || !isStudentPage.value) return;
  await syncStudentExerciseAccuracy(courseId);
});

watch(selectedStudentTaskCourseId, async (courseId) => {
  if (isSyncingStudentCourseOptions || isRefreshingStudentCardContext) return;
  if (activeTab.value !== "data" || !isStudentPage.value) return;
  await syncStudentLessonCompletion(courseId);
});

watch(selectedClassProgressCourseId, async (courseId) => {
  if (isSyncingClassCourseOptions || isRefreshingClassCardContext) return;
  if (activeTab.value !== "data" || !isClassPage.value) return;
  await syncClassTeachingProgress(courseId);
});

watch(selectedClassAttendanceCourseId, async (courseId) => {
  if (isSyncingClassCourseOptions || isRefreshingClassCardContext) return;
  if (activeTab.value !== "data" || !isClassPage.value) return;
  await syncClassAttendance(courseId);
});

watch(selectedClassTaskCourseId, async (courseId) => {
  if (isSyncingClassCourseOptions || isRefreshingClassCardContext) return;
  if (activeTab.value !== "data" || !isClassPage.value) return;
  await syncClassTaskCompletion(courseId);
});

watch(selectedGradeAttendanceCourseId, async (courseId) => {
  if (isSyncingGradeCourseOptions) return;
  if (activeTab.value !== "data" || !isGradePage.value) return;
  await syncGradeAttendance(courseId);
});

watch(selectedGradeCourseListCourseId, async (courseId) => {
  if (isSyncingGradeCourseOptions) return;
  if (activeTab.value !== "data" || !isGradePage.value) return;
  await syncGradeCourseList(courseId);
});

watch(selectedGradeTaskCourseId, async (courseId) => {
  if (isSyncingGradeCourseOptions) return;
  if (activeTab.value !== "data" || !isGradePage.value) return;
  await syncGradeTaskCompletion(courseId);
});

watch(selectedGradeTaskGradingCourseId, async (courseId) => {
  if (isSyncingGradeCourseOptions) return;
  if (activeTab.value !== "data" || !isGradePage.value) return;
  await syncGradeTaskGrading(courseId);
});

watch(selectedSchoolAttendanceCourseId, async () => {
  if (isSyncingSchoolCourseOptions) return;
  if (activeTab.value !== "data" || !isSchoolPage.value) return;
  await syncSchoolAttendance();
});

watch(selectedSchoolTaskCourseId, async () => {
  if (isSyncingSchoolCourseOptions) return;
  if (activeTab.value !== "data" || !isSchoolPage.value) return;
  await syncSchoolTaskCompletion();
});

watch(selectedSchoolTaskGradingCourseId, async () => {
  if (isSyncingSchoolCourseOptions) return;
  if (activeTab.value !== "data" || !isSchoolPage.value) return;
  await syncSchoolTaskGrading();
});

watch(
  availableStudyPageOptions,
  (options) => {
    if (options.some((item) => item.value === selectedPage.value)) return;
    selectedPage.value = options[0]?.value || "";
  },
  { immediate: true }
);

watch(
  selectedPage,
  async (page) => {
    isCascadeTargetOpen.value = false;

    if (isStudentSelfView.value) {
      if (page !== "student") {
        selectedPage.value = "student";
        return;
      }

      selectedTarget.value = currentStudentStudyId.value;
      return;
    }

    if (page === "grade" || page === "class" || page === "student") {
      await ensureSituationCascade(page);
      if (selectedPage.value !== page) return;
    }

    syncTargetByPage(page);
  },
  { immediate: true }
);

watch(selectedTarget, (targetValue) => {
  if (isStudentSelfView.value) {
    return;
  }

  if (isGradePage.value) {
    const normalizedTarget = getResolvedGradeTargetValue(targetValue);
    if (normalizedTarget && normalizedTarget !== normalizePlainText(targetValue)) {
      selectedTarget.value = normalizedTarget;
      return;
    }
  }

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

watch(
  [
    activeTab,
    selectedPage,
    () => selectedDateRange.value[0],
    () => selectedDateRange.value[1],
  ],
  async ([tab, page]) => {
    if (tab !== "data" || page !== "school") return;
    await Promise.all([
      syncSchoolOverview(),
      syncSchoolTeachingStats(),
      syncSchoolCourseOptions(),
      syncSchoolGradeDistribution(),
      syncSchoolWorksCount(),
      syncSchoolCourseList(),
    ]);
    await Promise.all([
      syncSchoolAILiteracy(selectedSchoolCourseId.value),
      syncSchoolAttendance(),
      syncSchoolTaskCompletion(),
      syncSchoolTaskGrading(),
    ]);
  },
  { immediate: true }
);

watch(
  [
    activeTab,
    selectedPage,
    selectedTarget,
    () => selectedDateRange.value[0],
    () => selectedDateRange.value[1],
  ],
  async ([tab, page, target]) => {
    if (tab !== "data" || page !== "student") return;
    const normalizedTarget = normalizePlainText(String(target || ""));
    isRefreshingStudentCardContext = true;
    try {
      await Promise.all([
        syncStudentCourseOptions(normalizedTarget),
        syncStudentCourseList(normalizedTarget),
      ]);
      await Promise.all([
        syncStudentOverview(normalizedTarget),
        syncStudentLessonStats(normalizedTarget),
        syncStudentAILiteracy(selectedStudentCourseId.value, normalizedTarget),
        syncStudentWorksCount(normalizedTarget),
        syncStudentExerciseAccuracy(
          selectedStudentExerciseCourseId.value,
          normalizedTarget
        ),
        syncStudentLessonCompletion(
          selectedStudentTaskCourseId.value,
          normalizedTarget
        ),
      ]);
    } finally {
      isRefreshingStudentCardContext = false;
    }
  },
  { immediate: true }
);

watch(
  [
    activeTab,
    selectedPage,
    selectedTarget,
    () => selectedDateRange.value[0],
    () => selectedDateRange.value[1],
  ],
  async ([tab, page, target]) => {
    if (tab !== "data" || page !== "class") return;
    const normalizedTarget = normalizePlainText(target);
    isRefreshingClassCardContext = true;
    try {
      await Promise.all([
        syncClassOverview(normalizedTarget),
        syncClassCourseOptions(normalizedTarget),
      ]);
      await Promise.all([
        syncClassAILiteracy(selectedClassCourseId.value, normalizedTarget),
        syncClassTeachingProgress(selectedClassProgressCourseId.value, normalizedTarget),
        syncClassWorksCount(normalizedTarget),
        syncClassAttendance(selectedClassAttendanceCourseId.value, normalizedTarget),
        syncClassTaskCompletion(selectedClassTaskCourseId.value, normalizedTarget),
      ]);
    } finally {
      isRefreshingClassCardContext = false;
    }
  },
  { immediate: true }
);

watch(
  [
    activeTab,
    selectedPage,
    selectedTarget,
    () => selectedDateRange.value[0],
    () => selectedDateRange.value[1],
  ],
  async ([tab, page, target]) => {
    if (tab !== "data" || page !== "grade") return;
    await ensureSituationCascade("grade");

    const normalizedTarget = getResolvedGradeTargetValue(String(target || ""));
    if (!normalizedTarget) return;
    if (normalizedTarget !== normalizePlainText(target)) {
      selectedTarget.value = normalizedTarget;
      return;
    }

    await syncGradeCourseOptions(normalizedTarget);
    await Promise.all([
      syncGradeOverview(normalizedTarget),
      syncGradeClassDistribution(normalizedTarget),
      syncGradeTeachingStats(normalizedTarget),
      syncGradeCourseList(selectedGradeCourseListCourseId.value, normalizedTarget),
      syncGradeTaskCount(normalizedTarget),
      syncGradeAttendance(selectedGradeAttendanceCourseId.value, normalizedTarget),
      syncGradeTaskCompletion(selectedGradeTaskCourseId.value, normalizedTarget),
      syncGradeTaskGrading(selectedGradeTaskGradingCourseId.value, normalizedTarget),
      syncGradeAILiteracy(selectedGradeCourseId.value, normalizedTarget),
    ]);
  },
  { immediate: true }
);

watch(
  [
    activeTab,
    selectedPage,
    selectedTarget,
    () => selectedDateRange.value[0],
    () => selectedDateRange.value[1],
  ],
  async () => {
    await nextTick();
    updateBackToTopVisible();
  }
);

onMounted(() => {
  clearLegacyStudyOuterScroll();
  scrollStudyPageToTop();
  updateBackToTopVisible();
  document.addEventListener("click", handleDocumentClick);
  getStudyScrollElements().forEach((item) =>
    item.addEventListener("scroll", updateBackToTopVisible, {
      passive: true,
    })
  );
  if (typeof ResizeObserver !== "undefined") {
    studyPageResizeObserver = new ResizeObserver(() => {
      updateBackToTopVisible();
    });
    const studyPageElement = getStudyPageElement();
    if (studyPageElement) {
      studyPageResizeObserver.observe(studyPageElement);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleDocumentClick);
  getStudyScrollElements().forEach((item) =>
    item.removeEventListener("scroll", updateBackToTopVisible)
  );
  studyPageResizeObserver?.disconnect();
  studyPageResizeObserver = null;
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
  overflow: visible;
}

.study-center-page--student {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.study-back-top-button {
  position: fixed;
  right: 138px;
  bottom: 96px;
  z-index: 1000;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffb347 0%, #ff9900 100%);
  box-shadow: 0 12px 26px rgba(255, 153, 0, 0.28);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease;
}

.study-back-top-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(255, 153, 0, 0.34);
}

.study-back-top-button:active {
  transform: translateY(0);
}

.study-back-top-button svg {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
}

.study-back-top-enter-active,
.study-back-top-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.study-back-top-enter-from,
.study-back-top-leave-to {
  opacity: 0;
  transform: translateY(12px);
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
  grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.98fr) minmax(0, 0.9fr);
  gap: 18px;
  margin-bottom: 18px;
}

.main-grid-student {
  grid-template-columns: minmax(0, 1.06fr) minmax(260px, 0.88fr) minmax(280px, 0.94fr);
}

.main-grid-school .panel-progress {
  grid-column: 2;
  grid-row: 1;
}

.main-grid-school .panel-table {
  grid-column: 3;
  grid-row: 1;
}

.main-grid-grade .grade-main-panel-progress {
  grid-column: 2;
  grid-row: 1;
}

.main-grid-grade .grade-main-panel-table {
  grid-column: 3;
  grid-row: 1;
}

.student-main-panel-course {
  order: 2;
}

.student-main-panel-stats {
  order: 3;
}

.class-main-panel-progress {
  order: 2;
}

.class-main-panel-course {
  order: 3;
}

.grade-main-panel-table {
  order: 3;
}

.grade-main-panel-progress {
  order: 2;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.school-extra-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.school-extra-grid-wide {
  grid-column: 1 / -1;
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
  height: 438px;
}

.panel-progress,
.panel-table {
  min-height: 438px;
  height: 438px;
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
  line-height: 1.4;
  min-width: 0;
}

.panel-meta,
.panel-subtitle {
  color: var(--text-sub);
  font-size: 13px;
}

.panel-meta {
  flex: 0 0 auto;
  text-align: right;
}

.panel-meta strong {
  color: #f26a3d;
  font-size: 18px;
}

.panel-toolbar {
  padding: 0 20px 14px;
}

.panel-header-inline-select {
  align-items: center;
  flex-wrap: wrap;
}

.panel-header-inline-select .school-task-select {
  margin-left: auto;
  flex: 0 0 auto;
}

.toolbar-select {
  min-width: 156px;
}

.toolbar-select-mselect {
  width: 100%;
  min-width: 156px;
}

.toolbar-select-wide {
  width: 100%;
}

.study-panel-select {
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

.school-ai-radar-panel {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: stretch;
  justify-content: center;
  padding: 8px 20px 24px;
  background: #ffffff;
}

.school-ai-radar-chart {
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
  min-height: 308px;
}

.school-grade-distribution-legend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px 12px;
}

.school-grade-distribution-legend-list {
  display: flex;
  flex: 1;
  flex-wrap: nowrap;
  gap: 8px 14px;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.school-grade-distribution-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  color: #66758c;
  font-size: 12px;
  line-height: 1;
}

.school-grade-distribution-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: 0 0 auto;
}

.school-grade-distribution-legend-pagination {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: 0 0 auto;
  color: #7b899d;
  font-size: 12px;
}

.school-grade-distribution-legend-page-btn {
  width: 18px;
  height: 18px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #7b899d;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
}

.school-grade-distribution-legend-page-btn.disabled {
  visibility: hidden;
  pointer-events: none;
}

.school-grade-distribution-legend-page-text {
  min-width: 28px;
  text-align: center;
}

.school-grade-distribution-content {
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: stretch;
  justify-content: center;
  padding: 0 12px 18px;
}

.school-grade-distribution-chart {
  width: 100%;
  min-width: 0;
  min-height: 320px;
}

.student-lesson-stats-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  padding: 8px 18px 20px;
}

.student-lesson-stat-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 98px;
  padding: 18px 18px 18px 22px;
  border-radius: 18px;
  overflow: hidden;
}

.student-lesson-stat-card::before {
  content: "";
  position: absolute;
  right: -24px;
  bottom: -34px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.24);
}

.student-lesson-stat-card::after {
  content: "";
  position: absolute;
  right: 24px;
  bottom: -28px;
  width: 120px;
  height: 78px;
  border-radius: 999px 999px 0 0;
  background: rgba(255, 255, 255, 0.14);
  transform: rotate(-16deg);
}

.student-lesson-stat-card-warm {
  background: linear-gradient(135deg, #fff2ec 0%, #ffe6d2 100%);
}

.student-lesson-stat-card-cool {
  background: linear-gradient(135deg, #ecf4ff 0%, #dce9ff 100%);
}

.student-lesson-stat-card-mint {
  background: linear-gradient(135deg, #edf9f3 0%, #ddf4eb 100%);
}

.student-lesson-stat-main {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 12px;
}

.student-lesson-stat-label {
  color: #2b3443;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
}

.student-lesson-stat-value-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  min-width: 0;
}

.student-lesson-stat-value {
  color: #1f2937;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.4px;
  word-break: break-all;
}

.student-lesson-stat-card-warm .student-lesson-stat-value,
.student-lesson-stat-card-warm .student-lesson-stat-suffix,
.student-lesson-stat-card-warm .student-lesson-stat-icon {
  color: #f38a47;
}

.student-lesson-stat-card-cool .student-lesson-stat-value,
.student-lesson-stat-card-cool .student-lesson-stat-suffix,
.student-lesson-stat-card-cool .student-lesson-stat-icon {
  color: #5a79f6;
}

.student-lesson-stat-card-mint .student-lesson-stat-value,
.student-lesson-stat-card-mint .student-lesson-stat-suffix,
.student-lesson-stat-card-mint .student-lesson-stat-icon {
  color: #32b892;
}

.student-lesson-stat-suffix {
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}

.student-lesson-stat-icon {
  position: relative;
  z-index: 1;
  display: grid;
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.42);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.36);
}

.student-lesson-stat-icon svg {
  width: 48px;
  height: 48px;
}

.school-teaching-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  padding: 4px 16px 18px;
}

.school-teaching-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 0 0 auto;
}

.school-teaching-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.school-teaching-metric {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 92px;
  padding: 14px 14px 16px;
  border-radius: 18px;
  overflow: hidden;
  color: #ffffff;
  box-shadow: 0 12px 28px rgba(56, 87, 137, 0.14);
}

.school-teaching-metric::after {
  content: "";
  position: absolute;
  right: -26px;
  bottom: -38px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.school-teaching-metric-prepare {
  background: linear-gradient(135deg, #ffb164 0%, #ff8a4d 100%);
}

.school-teaching-metric-teach {
  background: linear-gradient(135deg, #73a9ff 0%, #4f76ff 100%);
}

.school-teaching-metric-label {
  position: relative;
  z-index: 1;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.92;
}

.school-teaching-metric-value {
  position: relative;
  z-index: 1;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
}

.school-teaching-duration-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  padding: 14px 14px 14px;
  border: 1px solid #e4ecf7;
  border-radius: 20px;
  background:
    radial-gradient(circle at top right, rgba(107, 151, 255, 0.1), transparent 34%),
    linear-gradient(180deg, #fbfdff 0%, #f4f8fd 100%);
}

.school-teaching-duration-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #738399;
  font-size: 13px;
  line-height: 1.4;
}

.school-teaching-duration-label {
  font-weight: 700;
  color: #5b6b82;
}

.school-teaching-duration-minutes {
  color: #8a98ad;
  font-size: 12px;
}

.school-teaching-duration-value {
  color: #1f2937;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.4px;
}

.school-teaching-comparison {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: auto;
}

.school-teaching-comparison-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.school-teaching-comparison-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #617186;
  font-size: 13px;
  font-weight: 600;
}

.school-teaching-comparison-head strong {
  color: #1f2937;
  font-size: 14px;
  font-weight: 700;
}

.school-teaching-comparison-track {
  height: 10px;
  border-radius: 999px;
  background: #eaf0f7;
  overflow: hidden;
}

.school-teaching-comparison-fill {
  height: 100%;
  min-width: 0;
  border-radius: inherit;
}

.school-teaching-comparison-fill-prepare {
  background: linear-gradient(90deg, #ffb164 0%, #ff8a4d 100%);
}

.school-teaching-comparison-fill-teach {
  background: linear-gradient(90deg, #73a9ff 0%, #4f76ff 100%);
}

.school-course-toolbar {
  padding-top: 0;
}

.school-course-panel {
  min-height: 360px;
  height: 360px;
}

.school-task-panel {
  min-height: 390px;
  height: 390px;
}

.school-task-toolbar {
  padding-top: 0;
  display: flex;
  justify-content: flex-start;
}

.school-task-select {
  width: 220px;
  min-width: 220px;
}

.school-task-completion-content {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 0 16px 18px;
}

.school-task-completion-chart {
  width: 100%;
  min-width: 0;
  min-height: 270px;
}

.student-task-completion-content {
  justify-content: center;
}

.student-task-completion-content .school-task-completion-chart {
  max-width: 560px;
}

.school-course-table {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.school-course-table-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: center;
  height: 48px;
  padding: 0 20px;
  color: #f4f7fd;
  font-size: 13px;
  font-weight: 700;
  background: #8f9db5;
}

.school-course-table-head span:last-child {
  text-align: right;
}

.school-course-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-top: 1px solid #edf2f8;
  background: linear-gradient(180deg, #f7f9fc 0%, #f3f6fa 100%);
}

.school-course-list-table {
  border-top: 0;
  scrollbar-gutter: stable;
}

.school-course-item {
  display: flex;
  align-items: center;
  min-height: 54px;
  padding: 0 20px;
  border-bottom: 1px solid #e8eef6;
  color: #5f6f84;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.72);
}

.school-course-item:nth-child(odd) {
  background: rgba(247, 250, 252, 0.96);
}

.school-course-item span {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.school-course-item-table {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
  min-height: 64px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.school-course-item-table span:last-child {
  width: auto;
  overflow: visible;
  text-overflow: clip;
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: right;
  justify-self: end;
  color: #738399;
  font-weight: 600;
}

.panel-table-compact-course .school-course-table-head,
.panel-table-compact-course .school-course-item-table {
  grid-template-columns: minmax(0, 1fr) 190px;
  gap: 12px;
}

.panel-table-compact-course .school-course-item-table {
  min-height: 78px;
}

.panel-table-compact-course .school-course-item-table span:first-child {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: clip;
  white-space: normal;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.45;
  word-break: break-all;
}

.panel-table-compact-course .school-course-item-table span:last-child {
  display: -webkit-box;
  text-align: left;
  justify-self: stretch;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.45;
}

.school-works-content {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  align-items: center;
  justify-content: center;
  padding: 4px 12px 20px;
}

.school-works-chart-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.school-works-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.school-works-center-label {
  position: absolute;
  left: 50%;
  top: 54%;
  transform: translate(-50%, -100%);
  /* color: #92a0b5; */
  font-size: 20px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
}

.school-works-center-value {
  position: absolute;
  left: 50%;
  top: 60%;
  transform: translate(-50%, -12%);
  color: #1f2937;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
}

.school-attendance-toolbar {
  padding-top: 0;
}

.school-attendance-content {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 2px 16px 22px;
}

.school-attendance-chart {
  width: 100%;
  min-width: 0;
  min-height: 300px;
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

.panel-progress-class .donut-wrap {
  width: 268px;
  height: 268px;
}

.panel-progress-class .donut-label {
  z-index: 2;
  max-width: 84px;
  line-height: 1.35;
}

.panel-progress-class .donut-label-top {
  top: 18px;
  right: -6px;
}

.panel-progress-class .donut-label-bottom {
  bottom: 12px;
  left: -4px;
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

@media (max-width: 1450px) and (min-width: 1300px) {
  .study-center-page {
    padding: 18px 18px 24px;
  }

  .study-back-top-button {
    right: 128px;
    bottom: 88px;
  }

  .metric-grid,
  .main-grid,
  .bottom-grid,
  .school-extra-grid {
    gap: 14px;
  }

  .main-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 0.94fr);
  }

  .main-grid-student {
    grid-template-columns: minmax(0, 1fr) minmax(230px, 0.88fr) minmax(240px, 0.92fr);
  }

  .panel-header {
    padding: 16px 16px 12px;
  }

  .panel-toolbar {
    padding: 0 16px 12px;
  }

  .panel-title {
    font-size: 15px;
  }

  .panel-meta,
  .panel-subtitle {
    font-size: 12px;
  }

  .panel-meta strong {
    font-size: 16px;
  }

  .school-ai-radar-panel {
    padding: 4px 10px 18px;
  }

  .school-ai-radar-chart {
    min-height: 278px;
  }

  .school-grade-distribution-content {
    padding: 0 8px 16px;
  }

  .school-grade-distribution-chart {
    min-height: 282px;
  }

  .student-lesson-stats-content {
    gap: 12px;
    padding: 6px 12px 16px;
  }

  .student-lesson-stat-card {
    min-height: 90px;
    padding: 16px 16px 16px 18px;
  }

  .student-lesson-stat-label {
    font-size: 14px;
  }

  .student-lesson-stat-value {
    font-size: 24px;
  }

  .student-lesson-stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
  }

  .student-lesson-stat-icon svg {
    width: 42px;
    height: 42px;
  }

  .school-teaching-content {
    gap: 10px;
    padding: 2px 12px 16px;
  }

  .school-teaching-metric {
    min-height: 84px;
    padding: 12px 12px 14px;
  }

  .school-teaching-metric-value {
    font-size: 28px;
  }

  .school-teaching-duration-card {
    gap: 10px;
    padding: 12px 12px 12px;
  }

  .school-teaching-duration-value {
    font-size: 22px;
  }

  .school-works-content {
    padding: 2px 8px 16px;
  }

  .school-works-chart-wrap,
  .school-works-chart {
    min-height: 276px;
  }

  .school-works-center-value {
    font-size: 28px;
  }

  .school-attendance-content {
    padding: 0 12px 18px;
  }

  .school-attendance-chart {
    min-height: 276px;
  }

  .school-course-table-head,
  .school-course-item-table {
    grid-template-columns: minmax(0, 1fr) 280px;
  }

  .school-task-completion-content {
    padding: 0 12px 16px;
  }

  .school-task-panel {
    min-height: 370px;
    height: 370px;
  }

  .school-task-select {
    width: 190px;
    min-width: 190px;
  }

  .school-task-completion-chart {
    min-height: 248px;
  }

  .school-course-item {
    min-height: 50px;
    padding: 0 14px;
    font-size: 13px;
  }

  .panel-progress-class .donut-wrap {
    width: 252px;
    height: 252px;
  }

  .panel-progress-class .donut-label-top {
    right: 4px;
  }

  .panel-progress-class .donut-label-bottom {
    left: 6px;
  }
}

@media (max-width: 1299px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .main-grid-school .panel-progress,
  .main-grid-school .panel-table,
  .main-grid-grade .grade-main-panel-progress,
  .main-grid-grade .grade-main-panel-table {
    grid-column: auto;
    grid-row: auto;
  }

  .panel-large {
    grid-column: auto;
    height: auto;
  }

  .panel-progress,
  .panel-table {
    grid-column: auto;
    min-height: auto;
    height: auto;
  }
}

@media (max-width: 1180px) {
  .school-extra-grid {
    grid-template-columns: 1fr;
  }

  .school-extra-grid-wide {
    grid-column: auto;
  }

  .school-task-panel {
    min-height: auto;
    height: auto;
  }

  .panel-header-inline-select {
    align-items: stretch;
  }

  .school-task-select {
    width: 100%;
    min-width: 0;
  }

  .study-back-top-button {
    right: 24px;
    bottom: 92px;
    min-height: 42px;
    padding-inline: 14px;
  }
}

@media (max-width: 1100px) {
  .metric-grid,
  .bottom-grid,
  .main-grid,
  .school-extra-grid {
    grid-template-columns: 1fr;
  }

  .metric-card,
  .panel,
  .panel-large,
  .panel-progress,
  .panel-table {
    min-height: auto;
    height: auto;
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

  .study-back-top-button {
    right: 20px;
    bottom: 84px;
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

  .school-teaching-grid {
    grid-template-columns: 1fr;
  }

  .student-lesson-stat-card {
    min-height: 88px;
  }

  .student-lesson-stat-value {
    font-size: 22px;
  }

  .student-lesson-stat-label {
    font-size: 14px;
  }

  .school-teaching-metric {
    min-height: 84px;
  }

  .school-teaching-duration-value {
    font-size: 20px;
  }

  .school-course-table-head,
  .school-course-item-table {
    grid-template-columns: minmax(0, 1fr) 220px;
    gap: 10px;
  }

  .school-task-panel {
    min-height: 400px;
    height: auto;
  }

  .school-task-select {
    width: 100%;
    min-width: 0;
  }

  .school-task-completion-chart {
    min-height: 260px;
  }

  .school-course-item {
    padding-inline: 14px;
    font-size: 13px;
  }

  .school-works-chart-wrap,
  .school-works-chart {
    min-height: 260px;
  }

  .school-works-center-value {
    font-size: 26px;
  }

  .school-attendance-chart {
    min-height: 260px;
  }
}
</style>
