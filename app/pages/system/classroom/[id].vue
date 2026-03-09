<template>
  <div class="classroom-page">
    <!-- 顶部导航栏 -->
    <header class="classroom-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="class-time">
          <span class="time-label">{{ t("classroom.classTime") }}</span>
          <span class="time-value">{{ formatTime(classTime) }}</span>
        </span>
      </div>
      <div class="header-right">
        <button class="header-btn" @click="showStudentManageModal = true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{{ t("classroom.studentManage") }}</span>
        </button>
        <button
          class="header-btn"
          :class="{ active: isScreenSharing }"
          @click="toggleScreenShare"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span>{{
            isScreenSharing ? t("classroom.stopShare") : t("classroom.screenShare")
          }}</span>
        </button>
        <button
          class="header-btn"
          :class="{ active: isFullscreenControl }"
          @click="toggleFullscreenControl"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
            />
          </svg>
          <span>{{ t("classroom.fullscreenControl") }}</span>
        </button>
        <span class="divider"></span>
        <button
          class="header-btn"
          :class="{ active: isBlackboardMode }"
          @click="toggleBlackboard"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
          <span>{{
            isBlackboardMode
              ? t("classroom.exitBlackboard")
              : t("classroom.switchToBlackboard")
          }}</span>
        </button>
        <span class="divider"></span>
        <button class="end-class-btn" @click="handleEndClass">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>{{ t("classroom.endClass") }}</span>
        </button>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="classroom-body" :class="{ 'blackboard-fullscreen': isBlackboardMode }">
      <!-- 学生快捷登录提示框 -->
      <div
        v-if="showLoginTip"
        class="login-tip-panel"
        :class="{ collapsed: loginTipCollapsed, 'over-modal': showStudentManageModal }"
      >
        <div class="tip-header">
          <div class="tip-header-left">
            <span class="tip-title">{{ t("classroom.studentQuickLogin") }}</span>
            <span class="tip-expire-inline"
              >{{ t("classroom.validFor2Hours") }}{{ expireTime
              }}{{ t("classroom.expire") }}</span
            >
          </div>
          <div class="tip-actions">
            <button
              class="tip-action-btn"
              @click="loginTipCollapsed = !loginTipCollapsed"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path :d="loginTipCollapsed ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'" />
              </svg>
            </button>
            <button class="tip-action-btn" @click="showLoginTip = false">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div v-show="!loginTipCollapsed" class="tip-body">
          <div class="info-card code-card">
            <div class="code-row">
              <span class="code-label">{{ t("classroom.classCode") }}</span>
              <span class="code-value">{{ classCode }}</span>
            </div>
            <div class="code-row">
              <span class="code-label">{{ t("classroom.loginPassword") }}</span>
              <span class="code-value">{{ loginPassword }}</span>
            </div>
            <button class="copy-btn card-copy" @click="copyClassInfo">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{{ t("classroom.copy") }}</span>
            </button>
          </div>
          <p class="tip-footer">{{ t("classroom.viewLoginStatusTip") }}</p>
        </div>
      </div>

      <!-- 左侧边栏：课件 + 任务 (黑板模式隐藏) -->
      <aside
        v-if="!isBlackboardMode"
        class="sidebar-left"
        :class="{ collapsed: leftCollapsed }"
      >
        <div class="sidebar-content">
          <!-- 课件区域 -->
          <div class="section-block">
            <div class="section-title">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{{ t("classroom.courseware") }}</span>
              <button class="send-btn" @click="showSendCoursewareModal = true">
                {{ t("classroom.sendCoursewareToStudent") }}
              </button>
            </div>
            <div class="resource-list">
              <div v-if="resourceLoading" class="resource-loading">
                {{ t("classroom.loading") }}
              </div>
              <div v-else-if="resourceList.length === 0" class="resource-empty">
                {{ t("classroom.noCourseware") }}
              </div>
              <div
                v-else
                v-for="item in resourceList"
                :key="item.id"
                class="resource-item"
                :class="{ active: activeResource === item.id }"
                @click="selectResource(item)"
              >
                <img :src="getResourceIcon(item.type)" alt="" class="resource-icon" />
                <span class="resource-name">{{ item.name }}</span>
              </div>
            </div>
          </div>

          <!-- 任务区域 -->
          <div class="section-block">
            <div class="section-title">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>{{ t("classroom.task") }}</span>
            </div>
            <div class="task-list">
              <div v-if="taskLoading" class="empty-tip">{{ t("classroom.loading") }}</div>
              <div v-else-if="visibleTaskGroups.length === 0" class="empty-tip">
                {{ t("common.noData") }}
              </div>
              <div
                v-else
                v-for="group in visibleTaskGroups"
                :key="getTaskGroupKey(group)"
                class="task-group"
              >
                <div class="group-header" @click="toggleTaskGroup(getTaskGroupKey(group))">
                  <svg
                    class="expand-icon"
                    :class="{ expanded: expandedGroups[getTaskGroupKey(group)] }"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  <span>{{ getTaskGroupLabel(group) }}</span>
                </div>
                <div v-if="expandedGroups[getTaskGroupKey(group)]" class="group-content">
                  <template v-if="(group.resourceList || []).length > 0">
                    <div
                      v-for="(task, taskIndex) in group.resourceList || []"
                      :key="getTaskItemSelectKey(task, group, taskIndex)"
                      class="task-item"
                      :class="{ active: selectedTaskKey === getTaskItemSelectKey(task, group, taskIndex) }"
                      @click="selectTask(task, group, taskIndex)"
                    >
                      <span>{{ getTaskDisplayName(task) }}</span>
                    </div>
                  </template>
                  <div v-else class="empty-tip">{{ getTaskGroupEmptyText(group) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button class="collapse-btn" @click="leftCollapsed = !leftCollapsed">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path :d="leftCollapsed ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'" />
          </svg>
        </button>
      </aside>

      <!-- 中间预览区 -->
      <main class="preview-area">
        <div v-if="activeSidebarPanel !== 'task'" class="preview-toolbar">
          <button class="toolbar-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
        <div class="preview-content">
          <!-- 黑板模式（优先显示，即使在屏幕分享时也显示） -->
          <div v-if="isBlackboardMode" class="blackboard-wrapper">
            <FabricBoard />
            <!-- 屏幕分享状态小提示 -->
            <div v-if="isScreenSharing" class="share-indicator">
              <span class="indicator-dot"></span>
              <span>{{ t("classroom.sharing") }}</span>
            </div>
          </div>
          <!-- 文档预览区域 -->
          <div v-else-if="activeSidebarPanel === 'task'" class="w-full h-full bg-white flex flex-col">
            <div v-if="selectedTask" class="h-full w-full flex flex-col">
              <div
                v-if="isFreeCodingLikeTask && !isTaskIssued"
                class="h-full w-full bg-[#F3F3F3] flex flex-col items-center justify-center px-6 py-6 text-center"
              >
                <div class="text-[#444] leading-[1.35] mb-6">
                  <div class="text-[16px] font-medium">{{ t("taskManagement.description1") }}</div>
                  <div class="text-[16px] font-medium">{{ t("taskManagement.description2") }}</div>
                </div>

                <div class="w-full max-w-[720px] flex flex-wrap justify-center gap-x-10 gap-y-6">
                  <div
                    v-for="editor in editorsList"
                    :key="editor.id"
                    class="flex flex-col items-center"
                  >
                    <div
                      class="w-[190px] rounded-[14px] overflow-hidden cursor-pointer border transition-all duration-200 bg-white"
                      :class="selectedEditor === editor.id ? 'border-[#2EA9DF] shadow-[0_8px_20px_rgba(46,169,223,0.2)]' : 'border-[#BDBDBD] hover:border-[#95CAE3]'"
                      @click="selectedEditor = editor.id"
                    >
                      <div class="h-[128px] bg-[#F5F5F5] flex items-center justify-center">
                        <img :src="editor.cover" :alt="editor.name" class="w-[72px] h-[72px] object-contain" />
                      </div>
                      <div class="h-[56px] bg-[#EAEAEA] px-3 flex items-center justify-center">
                        <div class="text-[16px] leading-[1.15] text-[#3B3B3B] whitespace-pre-line">{{ editor.name }}</div>
                      </div>
                    </div>

                    <label class="mt-2.5 flex items-center gap-1.5 cursor-pointer select-none" @click.stop="selectedEditor = editor.id">
                      <div
                        class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                        :class="selectedEditor === editor.id ? 'border-[#2EA9DF] bg-[#2EA9DF]' : 'border-[#BDBDBD] bg-white'"
                      >
                        <svg v-if="selectedEditor === editor.id" width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12l4 4 10-10" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </div>
                      <span class="text-[14px] text-[#666]">{{ t("taskManagement.pushToStudents") }}</span>
                    </label>
                  </div>
                </div>

                <div class="mt-6">
                  <MButton
                    type="primary"
                    class="!bg-[#2EA9DF] !text-white hover:!bg-[#1e9bd3] !h-9 !px-6 !text-[14px] shadow-md active:scale-95 transition-all"
                    :class="{ '!bg-gray-200 !text-gray-400 !shadow-none !cursor-not-allowed hover:!bg-gray-200': !selectedEditor || taskIssuing }"
                    :disabled="!selectedEditor || taskIssuing"
                    @click="handleFreeCodingIssue"
                  >
                    {{ t("taskManagement.issueTask") }}
                  </MButton>
                </div>
              </div>

              <div v-else-if="isTaskIssued" class="w-full flex-1 flex flex-col min-h-0 overflow-visible">
                <div class="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 overflow-visible relative z-50">
                  <div class="flex items-center text-sm text-gray-600">
                    <span>{{ issueType === "group" ? t("taskManagement.currentGroupSubmitted") : t("taskManagement.currentStudentSubmitted") }}:</span>
                    <span class="text-[#1890FF] font-medium mx-1">{{ submittedCount }}</span>
                    <span>{{ t("taskManagement.itemUnit") }}, {{ t("taskManagement.unsubmitted") }}:</span>
                    <span class="text-[#FF4D4F] font-medium mx-1">{{ unsubmittedCount }}</span>
                    <span>{{ t("taskManagement.itemUnit") }}</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <template v-if="isExerciseTask">
                      <template v-if="isBatchMode">
                        <MButton
                          class="!bg-white !text-[#FF4D4F] !border-[#FF4D4F] hover:!bg-red-50 px-4 py-1.5 h-9 shadow-sm"
                          @click="exitBatchMode"
                        >
                          {{ t("user.cancelBatchOperation") }}
                        </MButton>
                      </template>
                      <template v-else>
                        <div class="flex items-center gap-2 text-sm text-gray-600">
                          <span>{{ t("taskManagement.answerAnalysis") }}</span>
                          <button
                            class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                            :class="answerAnalysisEnabled ? 'bg-[#FF9900]' : 'bg-gray-300'"
                            @click="toggleAnswerAnalysis"
                          >
                            <span
                              class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200"
                              :class="answerAnalysisEnabled ? 'left-6' : 'left-1'"
                            ></span>
                          </button>
                        </div>

                        <MButton
                          type="primary"
                          class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-4 py-1.5 h-9 shadow-sm"
                          @click="handleViewTaskDetail"
                        >
                          {{ t("taskManagement.viewTaskFileDetails") }}
                        </MButton>

                        <MButton
                          class="!bg-white !text-[#FF4D4F] !border-gray-200 hover:!bg-red-50 hover:!border-red-200 px-4 py-1.5 h-9 shadow-sm"
                          @click="showTaskWithdrawModal = true"
                        >
                          {{ t("taskManagement.withdrawTask") }}
                        </MButton>

                        <MButton
                          class="!bg-white !text-gray-600 !border-gray-200 hover:!bg-gray-50 px-4 py-1.5 h-9 shadow-sm"
                          @click="enterBatchMode"
                        >
                          {{ t("taskManagement.batchOperation") }}
                        </MButton>

                        <MButton
                          class="!bg-white !text-[#FF9900] !border-gray-200 hover:!bg-orange-50 hover:!border-[#FF9900] px-4 py-1.5 h-9 shadow-sm"
                          @click="handleRefreshList"
                        >
                          {{ t("taskManagement.refreshList") }}
                        </MButton>
                      </template>
                    </template>

                    <template v-else-if="isUploadTask || isFreeCodingLikeTask || isAiPracticeTask">
                      <MButton
                        type="primary"
                        class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-4 py-1.5 h-9 shadow-sm"
                        @click="handleViewTaskDetail"
                      >
                        {{ t("taskManagement.viewTaskFileDetails") }}
                      </MButton>

                      <MButton
                        class="!bg-white !text-[#FF4D4F] !border-gray-200 hover:!bg-red-50 hover:!border-red-200 px-4 py-1.5 h-9 shadow-sm"
                        @click="showTaskWithdrawModal = true"
                      >
                        {{ t("taskManagement.withdrawTask") }}
                      </MButton>

                      <MButton
                        class="!bg-white !text-[#FF9900] !border-gray-200 hover:!bg-orange-50 hover:!border-[#FF9900] px-4 py-1.5 h-9 shadow-sm"
                        @click="handleRefreshList"
                      >
                        {{ t("taskManagement.refreshList") }}
                      </MButton>
                    </template>

                    <template v-else>
                      <div class="px-3 py-1.5 bg-gray-50 text-gray-400 text-sm rounded-md border border-gray-200 flex items-center gap-2 cursor-not-allowed select-none h-9">
                        <span class="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">AI</span>
                        {{ t("taskManagement.qaPushed") }}
                      </div>

                      <MButton
                        class="!bg-white !text-[#FF9900] !border-gray-200 hover:!bg-orange-50 hover:!border-[#FF9900] px-4 py-1.5 h-9 shadow-sm"
                        @click="handleRefreshList"
                      >
                        {{ t("taskManagement.refreshList") }}
                      </MButton>

                      <div class="w-[105px]">
                        <MSelect
                          v-model="moreActionValue"
                          :options="moreActionOptions"
                          :placeholder="t('taskManagement.moreActions')"
                          trigger="hover"
                          placement="bottom-center"
                          dropdown-class="w-[160px]"
                          @update:model-value="handleMoreAction"
                        />
                      </div>
                    </template>
                  </div>
                </div>

                <div class="flex-1 flex flex-col min-h-0 bg-white">
                  <div v-if="(isUploadTask || isFreeCodingLikeTask) && isTaskIssued" class="mx-6 mt-4 px-4 py-2.5 bg-[#E6F7FF] border border-[#91D5FF] rounded-md flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#1890FF] shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                    <span class="text-sm text-[#1890FF]">{{ t("taskManagement.uploadTaskHint") }}</span>
                  </div>

                  <div class="flex-1 px-6 py-4 overflow-hidden flex flex-col min-h-0 relative">
                    <div v-if="refreshingTaskList" class="absolute inset-0 z-20 bg-white/70 flex items-center justify-center rounded-lg">
                      <svg class="animate-spin h-8 w-8 text-[#FF9900]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>

                    <MTable
                      :columns="currentColumns"
                      :data="filteredTaskData"
                      class="rounded-lg overflow-hidden border border-gray-100 task-student-table"
                      :show-index="true"
                      :selectable="isBatchMode && isExerciseTask"
                      :selected-keys="selectedRowKeys"
                      :selectable-filter="batchSelectableFilter"
                      @select="handleTableSelect"
                      @select-all="handleTableSelectAll"
                    >
                      <template #header-submissionStatus="{ column }">
                        <MFilterPopover v-model="submissionFilter" :options="submissionFilterOptions">
                          <template #trigger>
                            <div class="flex items-center justify-center gap-1 cursor-pointer hover:text-[#FF9900] transition-colors">
                              {{ column.title }}
                              <svg
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <path d="M1 1l4 4 4-4" />
                              </svg>
                            </div>
                          </template>
                        </MFilterPopover>
                      </template>

                      <template #header-grade="{ column }">
                        <div class="relative group flex items-center justify-center gap-1">
                          <span>{{ column.title }}</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" class="cursor-help">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <div class="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 hidden group-hover:block">
                            <div class="bg-black/90 text-white text-xs px-4 py-3 rounded-md shadow-lg relative text-center w-[280px]">
                              <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45"></div>
                              <div class="mb-2 leading-relaxed">{{ t("taskManagement.gradeTooltipTitle") }}</div>
                              <div class="space-y-0.5 text-gray-300">
                                <div>[1%-10%] 0.5</div>
                                <div>[11%-20%] 1</div>
                                <div>[21%-30%] 1.5</div>
                                <div>[31%-40%] 2</div>
                                <div>[41%-50%] 2.5</div>
                                <div>[51%-60%] 3</div>
                                <div>[61%-70%] 3.5</div>
                                <div>[71%-80%] 4</div>
                                <div>[81%-90%] 4.5</div>
                                <div>[91%-100%] 5</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>

                      <template #cell-submissionStatus="{ row }">
                        <span
                          class="px-2 py-1 rounded text-xs"
                          :class="isSubmittedStatus(row.submissionStatus) ? 'bg-[#E6F7FF] text-[#1890FF]' : 'bg-[#FFF1F0] text-[#FF4D4F]'"
                        >
                          {{
                            row.submissionStatus === "resubmitted"
                              ? t("taskManagement.resubmitted")
                              : isSubmittedStatus(row.submissionStatus)
                                ? t("taskManagement.submitted")
                                : t("taskManagement.unsubmitted")
                          }}
                        </span>
                      </template>

                      <template #cell-scoreTotal="{ row }">
                        <span class="text-sm text-gray-600">{{ row.scoreTotal || "-" }}</span>
                      </template>

                      <template #cell-grade="{ row }">
                        <StarRating
                          :model-value="row.grade || 0"
                          :size="16"
                          wrapper-class="justify-center"
                          readonly
                        />
                      </template>

                      <template #cell-teacherScore="{ row }">
                        <StarRating
                          v-if="row.teacherScore !== undefined && row.teacherScore !== null"
                          :model-value="row.teacherScore"
                          :size="20"
                          wrapper-class="justify-center"
                          readonly
                        />
                        <span v-else class="text-gray-400">-</span>
                      </template>

                      <template #cell-action="{ row }">
                        <div class="flex items-center justify-center gap-2">
                          <template v-if="isExerciseTask && isSubmittedStatus(row.submissionStatus)">
                            <button
                              class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                              @click="handleViewAndGrade(row)"
                            >
                              {{ t("taskManagement.view") }}
                            </button>
                            <button
                              class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                              @click="handleReturnToRedo(row)"
                            >
                              {{ t("taskManagement.returnToRedo") }}
                            </button>
                          </template>
                          <template v-else-if="isFreeCodingLikeTask && isSubmittedStatus(row.submissionStatus)">
                            <button
                              class="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              @click="handleViewAndScore(row)"
                            >
                              {{ t("taskManagement.viewAndScore") }}
                            </button>
                          </template>
                          <template v-else-if="isSubmittedStatus(row.submissionStatus)">
                            <button
                              class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                              @click="handleViewTaskDetail(row)"
                            >
                              {{ t("taskManagement.view") }}
                            </button>
                          </template>
                        </div>
                      </template>

                      <template #empty>
                        <div class="flex flex-col items-center justify-center py-20 text-gray-400 text-sm">
                          {{ t("common.noData") }}
                        </div>
                      </template>
                    </MTable>
                  </div>

                  <div v-if="isBatchMode && isExerciseTask" class="shrink-0 border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                        <div
                          class="w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors"
                          :class="isAllSelected ? 'bg-[#FF9900] border-[#FF9900]' : 'border-gray-300 bg-white'"
                          @click="handleSelectAllCheckbox"
                        >
                          <svg v-if="isAllSelected" width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </div>
                        {{ t("class.selectAll") }}
                      </label>
                      <span class="text-sm text-gray-500">
                        {{ t("taskManagement.selectedCount", { count: selectedRowKeys.length }) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3">
                      <button
                        class="flex items-center gap-1.5 px-4 py-1.5 text-sm text-[#FF9900] hover:text-[#e68a00] transition-colors"
                        @click="handleBatchReturnToRedo"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                        {{ t("taskManagement.batchReturnToRedo") }}
                      </button>
                      <button
                        class="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        @click="exitBatchMode"
                      >
                        {{ t("user.cancelBatchOperation") }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="flex-1 flex flex-col items-center justify-center w-full h-full pb-20 max-w-5xl mx-auto text-center">
                <div class="w-64 h-64 bg-blue-50/50 rounded-full flex items-center justify-center mb-8 relative">
                  <div class="absolute inset-0 bg-blue-100/30 rounded-full animate-pulse"></div>
                  <Transition name="icon-fade" mode="out-in">
                    <svg :key="selectedTaskKey" width="120" height="120" viewBox="0 0 24 24" fill="none" class="text-blue-300 relative z-10">
                      <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.5" />
                      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      <circle cx="16" cy="16" r="6" fill="#EEF2FF" stroke="currentColor" stroke-width="1.5" />
                      <path d="M14.5 15l1 1 2.5-2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </Transition>
                </div>
                <h2 class="text-xl font-bold text-gray-800 mb-3">{{ t("taskManagement.taskNotIssued") }}</h2>
                <p class="text-gray-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                  {{ t("taskManagement.taskNotIssuedDesc") }}
                </p>

                <div class="flex items-center gap-6">
                  <MButton
                    type="primary"
                    class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-8 py-2.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                    @click="openIssueModal"
                  >
                    {{ t("taskManagement.issueTask") }}
                  </MButton>
                  <MButton
                    class="!bg-white !text-gray-600 border !border-gray-200 hover:!bg-gray-50 px-8 py-2.5 shadow-sm active:scale-95 transition-all"
                    @click="handleViewTaskDetail"
                  >
                    {{ t("taskManagement.viewDetails") }}
                  </MButton>
                </div>
              </div>
            </div>

            <div v-else class="flex-1 flex items-center justify-center text-sm text-gray-400">
              {{ t("common.noData") }}
            </div>
          </div>
          <!-- 文档预览区域 -->
          <div v-else class="document-viewer">
            <!-- 加载中 -->
            <div v-if="previewLoading" class="preview-loading">
              <div class="spinner"></div>
              <span>{{ t("classroom.loading") }}</span>
            </div>
            <!-- 未选择资源 -->
            <div v-else-if="!selectedResource" class="empty-preview">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ccc"
                stroke-width="1"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>{{ t("classroom.selectCoursewareToPreview") }}</p>
            </div>
            <!-- PPT/Word/PDF/图片 预览 -->
            <div
              v-else-if="previewType === 'iframe' && iframePreviewUrl"
              class="iframe-preview-wrapper"
            >
              <iframe
                :src="iframePreviewUrl"
                class="preview-iframe"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>
            <!-- 视频预览 -->
            <div v-else-if="previewType === 'video'" class="video-preview-wrapper">
              <video
                :src="selectedResource.resourceUrl"
                controls
                class="preview-video"
                preload="metadata"
              ></video>
            </div>
            <!-- UCD 文件 -->
            <div v-else-if="previewType === 'ucd'" class="ucd-preview-wrapper">
              <div class="ucd-preview-card">
                <div class="ucd-icon"><span>ucd</span></div>
                <p class="ucd-filename">{{ selectedResource.name }}</p>
                <button class="ucd-btn" @click="downloadResource(selectedResource)">
                  {{ t("classroom.download") }}
                </button>
              </div>
            </div>
            <!-- MC 文件 -->
            <div v-else-if="previewType === 'mc'" class="ucd-preview-wrapper">
              <div class="ucd-preview-card">
                <div class="ucd-icon mc-icon"><span>mc</span></div>
                <p class="ucd-filename">{{ selectedResource.name }}</p>
                <button class="ucd-btn" @click="downloadResource(selectedResource)">
                  {{ t("classroom.download") }}
                </button>
              </div>
            </div>
            <!-- 不支持预览 -->
            <div v-else class="empty-preview">
              <p>{{ t("classroom.previewNotSupported") }}</p>
              <button class="download-btn" @click="downloadResource(selectedResource)">
                {{ t("classroom.downloadFile") }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 发送课件弹窗 -->
    <SendCoursewareModal
      :visible="showSendCoursewareModal"
      :class-id="route.query.classId as string"
      :peer-id="teacherPeerId"
      :unsent-list="unsentCoursewareList"
      :sent-list="sentCoursewareList"
      @close="showSendCoursewareModal = false"
      @send="(ids) => updateCoursewareSentStatus(ids, true)"
      @recall="(ids) => updateCoursewareSentStatus(ids, false)"
    />

   <!-- 学生管理弹窗 -->
    <StudentManageModal
      :visible="showStudentManageModal"
      :class-id="route.query.classId as string"
      :initial-quick-login-data="quickLoginDataForModal"
      @close="showStudentManageModal = false; quickLoginDataForModal = undefined"
      @quick-login-change="handleQuickLoginChange"
    />

    <TaskIssueModal
      v-model="showTaskIssueModal"
      :class-name="currentClassName"
      :task-name="currentTaskLabel"
      :has-ai-settings="!isUploadTask && !isExerciseTask"
      :is-free-coding="isFreeCodingLikeTask"
      :editor-name="selectedEditor"
      @confirm-group="handleIssueGroup"
      @confirm-student="handleIssueStudent"
    />

    <TaskWithdrawModal
      v-model="showTaskWithdrawModal"
      @confirm="handleWithdrawConfirm"
    />

    <ExerciseDetailModal
      v-model="showTaskExerciseDetailModal"
      :resource-id="currentTaskResourceId"
      :task-id="taskViewTaskId"
    />
    <ViewAndScoreModal
      :visible="showTaskViewScoreModal"
      :row-data="currentTaskScoreRow"
      :has-next-submission="hasNextSubmission"
      @close="showTaskViewScoreModal = false"
      @save="handleScoreSave"
      @next="handleScoreNext"
    />

    <MModal
      v-model="showTaskReturnToRedoModal"
      custom-width="420px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showTaskReturnToRedoModal = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          {{ t("taskManagement.returnToRedoConfirmTitle") }}
        </h3>
        <p class="text-[#4D4D4D] text-center mb-8 px-4 whitespace-pre-line">
          {{ t("taskManagement.returnToRedoConfirmContent") }}
        </p>
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[44px] border border-[#FF9900] rounded-lg text-[#FF9900] hover:bg-[#FFF7E6]"
            @click="showTaskReturnToRedoModal = false"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="confirmTaskReturnToRedo"
          >
            {{ t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 下课确认弹窗 -->
    <MModal
      v-model="showEndClassModal"
      custom-width="420px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showEndClassModal = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          {{ t("classroom.endClassConfirmTitle") }}
        </h3>
        <p class="text-[#4D4D4D] mb-8 px-4">
          {{ t("classroom.endClassConfirmContent") }}
        </p>
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showEndClassModal = false"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="confirmEndClass"
          >
            {{ t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 返回确认弹窗（从教师首页进入时显示） -->
    <MModal
      v-model="showBackConfirmModal"
      custom-width="420px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showBackConfirmModal = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          {{ t("common.tips") }}
        </h3>
        <p class="text-[#4D4D4D] text-center mb-8 px-4">
          {{ t("classroom.backConfirmContent") }}
        </p>
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[44px] border border-[#3EAEFF] rounded-lg text-[#3EAEFF] hover:bg-blue-50"
            @click="showBackConfirmModal = false"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            class="w-[136px] h-[44px] bg-[#3EAEFF] text-white rounded-lg hover:bg-[#2E9EEF]"
            @click="confirmBack"
          >
            {{ t("classroom.leaveClassroom") }}
          </button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { usePeerJS } from "~/composables/usePeerJS";
import { useTeacher } from "~/composables/api/useTeacher";
import { taskmanagementcenterApi } from "~/composables/api/taskmanagement";
import { ElMessage } from "~/components/ui";
import { useI18n } from "vue-i18n";
import { scoreToStars } from "~/utils/star-rating";

import docIcon from "~/assets/images/doc.png";
import pptIcon from "~/assets/images/ppt.png";
import pdfIcon from "~/assets/images/pdf.png";
import xlsIcon from "~/assets/images/xls.png";
import mp4Icon from "~/assets/images/mp4.png";
import pngIcon from "~/assets/images/png.png";
import mcIcon from "~/assets/images/mc.png";
import morenIcon from "~/assets/images/moren.png";
import tool1Cover from "~/assets/images/tool1.png";
import tool5Cover from "~/assets/images/tool5.png";

definePageMeta({ layout: "blank" });

const { t } = useI18n();
const route = useRoute();
const config = useRuntimeConfig();
const taskApi = taskmanagementcenterApi();
const { endClass, stopQuickLogin, createQuickLogin } = useTeacher();
const { getQuickLoginInfo } = useTeacher();

const signalingUrl = (config.public.signalingUrl as string) || 'ws://192.168.0.55:8001/resource/websocket'
const peerJS = usePeerJS();

let notifyWs: WebSocket | null = null
let timer: ReturnType<typeof setInterval> | null = null
const teacherPeerId = ref("");

// 课堂计时（秒）
const classTime = ref(0);

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// 侧边栏折叠
const leftCollapsed = ref(false);

// 屏幕分享状态（使用 PeerJS composable 的状态）
const isScreenSharing = computed(() => peerJS.isScreenSharing.value);

// 黑板模式
const isBlackboardMode = ref(false);

// 全屏管控
const isFullscreenControl = ref(false);

// 发送课件弹窗
const showSendCoursewareModal = ref(false);

// 学生管理弹窗
const showStudentManageModal = ref(false);

// 下课确认弹窗
const showEndClassModal = ref(false);

// 传给学生管理弹窗的快捷登录数据
const quickLoginDataForModal = ref<{ classCode: string; classCodePwd: string; expirationDate: string } | undefined>();

type QuickLoginInfo = {
  classCode: string;
  classCodePwd?: string;
  expirationDate?: string;
};

// 学生快捷登录提示
const showLoginTip = ref(true);
const loginTipCollapsed = ref(false);
const classCode = ref("");
const loginPassword = ref("");
const expireTime = ref("");

const applyQuickLoginInfo = (data?: QuickLoginInfo | null) => {
  if (data && data.classCode) {
    classCode.value = data.classCode || "";
    loginPassword.value = data.classCodePwd || "";
    expireTime.value = data.expirationDate || "";
    showLoginTip.value = true;
    return;
  }

  classCode.value = "";
  loginPassword.value = "";
  expireTime.value = "";
  showLoginTip.value = false;
};

// 加载快捷登录信息
const loadQuickLoginInfo = async () => {
  try {
    const data = await getQuickLoginInfo();
    applyQuickLoginInfo(data);
  } catch (error) {
    console.error('加载快捷登录信息失败:', error)
    showLoginTip.value = false;
  }
};

const handleQuickLoginChange = (data?: QuickLoginInfo | null) => {
  if (data === null) {
    applyQuickLoginInfo(null);
    return;
  }

  if (data?.classCode) {
    applyQuickLoginInfo(data);
    loginTipCollapsed.value = false;
    return;
  }

  loadQuickLoginInfo();
};

// 自动开启快捷登录（从开课流程进入时）
const autoEnableQuickLogin = async () => {
  const classId = route.query.classId as string;
  if (!classId) return;
  try {
    const data = await createQuickLogin(classId);
    if (data && data.classCode) {
      applyQuickLoginInfo(data);
      loginTipCollapsed.value = false;
      quickLoginDataForModal.value = {
        classCode: data.classCode,
        classCodePwd: data.classCodePwd || "",
        expirationDate: data.expirationDate || "",
      };
      showStudentManageModal.value = true;
    }
  } catch (error) {
    console.error("自动开启快捷登录失败:", error);
  }
};

const copyClassInfo = () => {
  const text = `${t("classroom.classCode")}${classCode.value}\n${t(
    "classroom.loginPassword"
  )}${loginPassword.value}`;
  navigator.clipboard.writeText(text);
  alert(t("classroom.classInfoCopied"));
};

const toggleBlackboard = () => {
  isBlackboardMode.value = !isBlackboardMode.value;
};

// 全屏管控 - 向学生端发送全屏指令
const toggleFullscreenControl = () => {
  isFullscreenControl.value = !isFullscreenControl.value;
  const classId = route.query.classId as string;

  if (notifyWs && notifyWs.readyState === WebSocket.OPEN) {
    const msg = JSON.stringify({
      type: "CLASS_INTERACTION",
      peerId: classId,
      action: isFullscreenControl.value ? "fullscreen_enter" : "fullscreen_exit",
    });
    notifyWs.send(msg);
    // 璋冭瘯鏃ュ織
  }

  if (isFullscreenControl.value) {
    // 璋冭瘯鏃ュ織
  } else {
    // 璋冭瘯鏃ュ織
  }
};

const toggleScreenShare = async () => {
  if (isScreenSharing.value) {
    stopScreenShare();
  } else {
    await startScreenShare();
  }
};

const startScreenShare = async () => {
  // 使用 PeerJS 开始屏幕分享
  const success = await peerJS.startScreenShare();
  if (success) {
    const classId = route.query.classId as string;
    // 璋冭瘯鏃ュ織
    // 璋冭瘯鏃ュ織

    // 屏幕分享开始后，通过 WebSocket 通知所有学生
    if (notifyWs && notifyWs.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({
        type: "SCREEN_SHARE_START",
        peerId: classId,
        teacherPeerId: teacherPeerId.value,
      });
      notifyWs.send(msg);
      // 璋冭瘯鏃ュ織
    }

    // 学生收到通知后会主动连接老师请求屏幕分享
    // 老师在 usePeerJS 的 connection 事件中处理学生请求并呼叫学生
    // 璋冭瘯鏃ュ織
  }
};

const stopScreenShare = () => {
  // 使用 PeerJS 停止屏幕分享
  peerJS.stopScreenShare();
  // 璋冭瘯鏃ュ織

  // 通知学生端屏幕分享已停止
  const classId = route.query.classId as string;
  if (notifyWs && notifyWs.readyState === WebSocket.OPEN) {
    const msg = JSON.stringify({
      type: "SCREEN_SHARE_STOP",
      peerId: classId,
    });
    notifyWs.send(msg);
    // 璋冭瘯鏃ュ織
  }
};

// 资源列表（从接口获取）
interface ResourceItem {
  id: string;
  name: string;
  type: string;
  resourceUrl?: string;
  isSent?: boolean;
}
const resourceList = ref<ResourceItem[]>([]);
const resourceLoading = ref(false);

// 未发送和已发送的课件列表（供弹窗使用）
const unsentCoursewareList = computed(() =>
  resourceList.value.filter((item) => !item.isSent)
);
const sentCoursewareList = computed(() =>
  resourceList.value.filter((item) => item.isSent)
);

// 课件接口
const { getCoursewareList } = useTeacher();
const loadResourceList = async () => {
  const chapterId = route.params.id as string;
  const classId = route.query.classId as string;
  if (!chapterId) return;

  resourceLoading.value = true;
  try {
    const data = await getCoursewareList({ chapterId });
    if (data && Array.isArray(data)) {
      resourceList.value = data.map((item: any) => ({
        id: String(item.resourceId),
        name: item.fileName || item.resourceName || t("classroom.unnamedFile"),
        type: getFileExtension(item.fileName || ""),
        resourceUrl: item.resourceUrl || "",
        isSent: item.isSent || false,
      }));

      // 自动选中课件：优先选中上次选中的，否则选中第一个
      if (resourceList.value.length > 0) {
        const storageKey = `classroom_selected_resource_${classId}_${chapterId}`;
        const lastSelectedId = localStorage.getItem(storageKey);

        let targetResource = null;
        if (lastSelectedId) {
          // 尝试找到上次选中的课件
          targetResource = resourceList.value.find((item) => item.id === lastSelectedId);
        }

        // 如果没有上次选中的，或者上次选中的已不存在，选中第一个
        if (!targetResource) {
          targetResource = resourceList.value[0];
        }

        if (targetResource) {
          await selectResource(targetResource);
        }
      }
    }
  } catch (error) {
    console.error('加载课件列表失败:', error)
  } finally {
    resourceLoading.value = false;
  }
};

// 更新课件发送状态
const updateCoursewareSentStatus = (ids: string[], isSent: boolean) => {
  resourceList.value.forEach((item) => {
    if (ids.includes(item.id)) {
      item.isSent = isSent;
    }
  });
};

// 获取文件扩展名
const getFileExtension = (fileName: string) => {
  return fileName.split(".").pop()?.toLowerCase() || "";
};

const activeResource = ref("");

// 预览相关
interface SelectedResourceItem {
  id: string;
  name: string;
  type: string;
  resourceUrl?: string;
  isSent?: boolean;
}
const selectedResource = ref<SelectedResourceItem | null>(null);
const previewLoading = ref(false);
const previewType = ref<"iframe" | "video" | "ucd" | "mc" | "unsupported" | "">("");
const iframePreviewUrl = ref("");

// 根据文件名获取文件类型
const getFileType = (fileName: string) => {
  const ext = fileName?.split(".").pop()?.toLowerCase() || "";
  const typeMap: Record<string, string> = {
    doc: "word",
    docx: "word",
    ppt: "ppt",
    pptx: "ppt",
    xls: "excel",
    xlsx: "excel",
    pdf: "pdf",
    ucd: "ucd",
    mc: "mc",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    bmp: "image",
    webp: "image",
    svg: "image",
    mp4: "video",
    mov: "video",
    webm: "video",
  };
  return typeMap[ext] || "default";
};

// Base64 编码函数
const base64Encode = (str: string): string => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
};

// 获取 PPT 预览链接
const getPptPreviewUrl = (url: string): string => {
  const previewBaseUrl =
    (config.public.previewBaseUrl as string)?.trim() || "http://192.168.0.145:8012";
  return `${previewBaseUrl}/onlinePreview?url=${encodeURIComponent(base64Encode(url))}`;
};

// 下载资源
const downloadResource = (item: SelectedResourceItem) => {
  if (item.resourceUrl) {
    const link = document.createElement("a");
    link.href = item.resourceUrl;
    link.download = item.name;
    link.target = "_blank";
    link.click();
  }
};

// 左侧面板：课件 / 任务
const activeSidebarPanel = ref<"courseware" | "task">("courseware");

// 任务列表（与 taskmanagement 保持同一接口）
interface TaskResourceItem {
  resourceId?: string | number | null;
  id?: string | number | null;
  taskId?: string | number | null;
  fileName?: string;
  resourceName?: string;
  distributeType?: number | null;
  [key: string]: any;
}
interface TaskCategoryGroup {
  resourceCategory: number;
  resourceName?: string;
  resourceList?: TaskResourceItem[];
}

const taskListData = ref<TaskCategoryGroup[]>([]);
const taskLoading = ref(false);
const taskIssuing = ref(false);
const selectedTaskKey = ref("");
const selectedTaskMeta = ref<{ task: TaskResourceItem; category: number } | null>(null);
const distributeTypeOverrides = ref<Record<string, number>>({});

const getTaskIdentity = (task: TaskResourceItem | null | undefined): string | null => {
  const candidates = [task?.resourceId, task?.id, task?.taskId];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const value = String(candidate).trim();
    if (value) return value;
  }
  return null;
};

const setDistributeTypeOverride = (task: TaskResourceItem | null | undefined, distributeType: number) => {
  const key = getTaskIdentity(task);
  if (!key) return;
  distributeTypeOverrides.value[key] = distributeType;
};

const clearDistributeTypeOverride = (task: TaskResourceItem | null) => {
  if (!task) return;
  const key = getTaskIdentity(task);
  if (!key) return;
  delete distributeTypeOverrides.value[key];
};

const selectedEditor = ref("vincibot");
const showTaskIssueModal = ref(false);
const showTaskWithdrawModal = ref(false);
const editorsList = computed(() => [
  { id: "vincibot", name: "Matatacode\n(VinciBot)", cover: tool1Cover },
  { id: "nous", name: "Matatacode\n(Nous)", cover: tool5Cover },
]);

const visibleTaskGroups = computed(() => {
  return taskListData.value.filter((group) => group && group.resourceCategory !== null && group.resourceCategory !== undefined);
});

const taskCategoryLabelMap: Record<number, string> = {
  10: "classroom.aiPracticeTask",
  11: "classroom.customExercise",
  6: "classroom.classExercise",
  12: "classroom.freeCoding",
  7: "classroom.studentCodingTask",
  9: "classroom.personalUploadTask",
};

const taskCategoryEmptyTextMap: Record<number, string> = {
  6: "classroom.noClassExercise",
  7: "classroom.noStudentCodingTask",
  9: "classroom.noPersonalUploadTask",
};

const getTaskGroupKey = (group: TaskCategoryGroup) => {
  return `task_group_${String(group.resourceCategory)}`;
};

const getTaskGroupLabel = (group: TaskCategoryGroup) => {
  if (group.resourceName) return group.resourceName;
  const i18nKey = taskCategoryLabelMap[Number(group.resourceCategory)];
  return i18nKey ? t(i18nKey) : t("classroom.task");
};

const getTaskGroupEmptyText = (group: TaskCategoryGroup) => {
  const i18nKey = taskCategoryEmptyTextMap[Number(group.resourceCategory)];
  return i18nKey ? t(i18nKey) : t("common.noData");
};

const getTaskDisplayName = (task: TaskResourceItem) => {
  return task.fileName || task.resourceName || "-";
};

const getTaskItemSelectKey = (task: TaskResourceItem, group: TaskCategoryGroup, index: number) => {
  const id = task.resourceId ?? task.id ?? task.taskId ?? index;
  return `${group.resourceCategory}_${String(id)}`;
};

const selectedTask = computed(() => {
  if (!selectedTaskMeta.value) return null;
  const task = selectedTaskMeta.value.task;
  const key = getTaskIdentity(task);
  const overrideDistributeType = key ? distributeTypeOverrides.value[key] : undefined;
  return {
    ...task,
    distributeType:
      overrideDistributeType === 1 || overrideDistributeType === 2
        ? overrideDistributeType
        : task.distributeType,
    resourceCategory: selectedTaskMeta.value.category,
  };
});

const currentTaskLabel = computed(() => {
  if (!selectedTaskMeta.value) return "";
  return getTaskDisplayName(selectedTaskMeta.value.task);
});

const currentClassName = computed(() => String(route.query.classId || ""));

const isIssuedDistributeType = (distributeType: any) => {
  const dt = Number(distributeType);
  return dt === 1 || dt === 2;
};

const isTaskIssued = computed(() => isIssuedDistributeType(selectedTask.value?.distributeType));
const issueTypeFromApi = computed(() => {
  const dt = Number(selectedTask.value?.distributeType);
  if (dt === 2) return "group";
  if (dt === 1) return "student";
  return "group";
});
const issueType = computed({
  get: () => issueTypeFromApi.value,
  set: () => {},
});

const isCustomExercise = computed(() => Number(selectedTask.value?.resourceCategory) === 11);
const isClassExercise = computed(() => Number(selectedTask.value?.resourceCategory) === 6);
const isExerciseTask = computed(() => isCustomExercise.value || isClassExercise.value);
const isAiPracticeTask = computed(() => Number(selectedTask.value?.resourceCategory) === 10);
const isUploadTask = computed(() => false);
const isFreeCoding = computed(() => Number(selectedTask.value?.resourceCategory) === 12);
const isStudentCodingTask = computed(() => Number(selectedTask.value?.resourceCategory) === 7);
const isFreeCodingLikeTask = computed(() => isFreeCoding.value || isStudentCodingTask.value);

const isSubmittedStatus = (status: string) => {
  return status === "submitted" || status === "resubmitted";
};

const resolveSelectedResourceId = (): string | null => {
  const task = selectedTask.value as any;
  const candidates = [task?.resourceId, task?.id, task?.taskId];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const value = String(candidate).trim();
    if (!value) continue;
    return value;
  }
  return null;
};

const currentTaskResourceId = computed(() => resolveSelectedResourceId());
const showTaskExerciseDetailModal = ref(false);
const taskViewTaskId = ref<string | null>(null);
const showTaskViewScoreModal = ref(false);
const currentTaskScoreRow = ref<any>(null);
const showTaskReturnToRedoModal = ref(false);
const returnToRedoRow = ref<any>(null);

const groupTaskData = ref<any[]>([]);
const submissionFilter = ref("all");
const filteredTaskData = computed(() => {
  if (submissionFilter.value === "all") return groupTaskData.value;
  return groupTaskData.value.filter((item) => item.submissionStatus === submissionFilter.value);
});

const submittedCount = computed(() => groupTaskData.value.filter((item) => isSubmittedStatus(item.submissionStatus)).length);
const unsubmittedCount = computed(() => groupTaskData.value.filter((item) => !isSubmittedStatus(item.submissionStatus)).length);

const groupTaskColumns = computed(() => [
  { key: "groupName", title: t("taskManagement.groupName"), align: "center" as const, width: "150px" },
  { key: "leader", title: t("taskManagement.leader"), align: "center" as const, width: "100px" },
  { key: "members", title: t("taskManagement.members"), align: "center" as const, width: "150px" },
  { key: "submissionStatus", title: t("taskManagement.submissionStatus"), align: "center" as const, width: "120px" },
  { key: "duration", title: t("taskManagement.durationMinutes"), align: "center" as const, width: "120px" },
  { key: "submissionTime", title: t("taskManagement.submissionTime"), align: "center" as const, width: "150px" },
  { key: "qaStatus", title: t("taskManagement.qaPushStatus"), align: "center" as const, width: "130px" },
  { key: "action", title: t("common.operation"), align: "center" as const, width: "140px" },
]);

const studentTaskColumns = computed(() => [
  { key: "studentName", title: t("taskManagement.studentName"), align: "center" as const, width: "150px" },
  { key: "studentAccount", title: t("taskManagement.studentAccount"), align: "center" as const, width: "150px" },
  { key: "submissionStatus", title: t("taskManagement.submissionStatus"), align: "center" as const, width: "120px" },
  { key: "duration", title: t("taskManagement.durationMinutes"), align: "center" as const, width: "120px" },
  { key: "submissionTime", title: t("taskManagement.submissionTime"), align: "center" as const, width: "150px" },
  { key: "qaStatus", title: t("taskManagement.qaPushStatus"), align: "center" as const, width: "130px" },
  { key: "action", title: t("common.operation"), align: "center" as const, width: "140px" },
]);

const aiPracticeStudentColumns = computed(() => studentTaskColumns.value.filter((col: any) => col.key !== "qaStatus"));
const aiPracticeGroupColumns = computed(() => groupTaskColumns.value.filter((col: any) => col.key !== "qaStatus"));

const customExerciseColumns = computed(() => [
  { key: "studentName", title: t("taskManagement.studentName"), align: "center" as const, width: "120px" },
  { key: "studentAccount", title: t("taskManagement.studentAccount"), align: "center" as const, width: "150px" },
  { key: "submissionStatus", title: t("taskManagement.submissionStatus"), align: "center" as const, width: "100px" },
  { key: "scoreTotal", title: t("taskManagement.scoreTotal"), align: "center" as const, width: "100px" },
  { key: "duration", title: t("taskManagement.durationMinutes"), align: "center" as const, width: "120px" },
  { key: "submissionTime", title: t("taskManagement.submissionTime"), align: "center" as const, width: "150px" },
  { key: "grade", title: t("taskManagement.grade"), align: "center" as const, width: "120px" },
  { key: "action", title: t("common.operation"), align: "center" as const, width: "180px" },
]);

const uploadTaskStudentColumns = computed(() => [
  { key: "studentName", title: t("taskManagement.studentName"), align: "center" as const, width: "120px" },
  { key: "studentAccount", title: t("taskManagement.studentAccount"), align: "center" as const, width: "150px" },
  { key: "submissionStatus", title: t("taskManagement.submissionStatus"), align: "center" as const, width: "100px" },
  { key: "duration", title: t("taskManagement.durationMinutes"), align: "center" as const, width: "100px" },
  { key: "submissionTime", title: t("taskManagement.submissionTime"), align: "center" as const, width: "160px" },
  { key: "teacherScore", title: t("taskManagement.teacherScore"), align: "center" as const, width: "160px" },
  { key: "action", title: t("common.operation"), align: "center" as const, width: "120px" },
]);

const uploadTaskGroupColumns = computed(() => [
  { key: "groupName", title: t("taskManagement.groupName"), align: "center" as const, width: "150px" },
  { key: "submissionStatus", title: t("taskManagement.submissionStatus"), align: "center" as const, width: "100px" },
  { key: "duration", title: t("taskManagement.durationMinutes"), align: "center" as const, width: "100px" },
  { key: "submissionTime", title: t("taskManagement.submissionTime"), align: "center" as const, width: "160px" },
  { key: "teacherScore", title: t("taskManagement.teacherScore"), align: "center" as const, width: "160px" },
  { key: "action", title: t("common.operation"), align: "center" as const, width: "120px" },
]);

const currentColumns = computed(() => {
  if (isExerciseTask.value) {
    return customExerciseColumns.value;
  }
  if (isUploadTask.value || isFreeCodingLikeTask.value) {
    return issueType.value === "group" ? uploadTaskGroupColumns.value : uploadTaskStudentColumns.value;
  }
  if (isAiPracticeTask.value) {
    return issueType.value === "group" ? aiPracticeGroupColumns.value : aiPracticeStudentColumns.value;
  }
  return issueType.value === "group" ? groupTaskColumns.value : studentTaskColumns.value;
});

const submissionFilterOptions = computed(() => {
  const options: Array<{ label: string; value: string }> = [
    { label: t("common.all"), value: "all" },
    { label: t("taskManagement.submitted"), value: "submitted" },
    { label: t("taskManagement.unsubmitted"), value: "unsubmitted" },
  ];
  if (isUploadTask.value || isFreeCodingLikeTask.value) {
    options.push({ label: t("taskManagement.resubmitted"), value: "resubmitted" });
  }
  return options;
});

const moreActionValue = ref("");
const moreActionOptions = computed(() => [
  { label: t("taskManagement.viewTaskFileDetails"), value: "view" },
  { label: t("taskManagement.withdrawTask"), value: "withdraw" },
]);
const handleMoreAction = (val: string | number | null) => {
  if (val === "view") {
    handleViewTaskDetail();
  } else if (val === "withdraw") {
    showTaskWithdrawModal.value = true;
  }
  moreActionValue.value = "";
};

const hasNextSubmission = computed(() => {
  if (!currentTaskScoreRow.value) return false;
  const currentIndex = groupTaskData.value.findIndex((row) => row.id === currentTaskScoreRow.value?.id);
  return groupTaskData.value
    .slice(currentIndex + 1)
    .some((row) => isSubmittedStatus(row.submissionStatus));
});

const answerAnalysisEnabled = ref(false);
const refreshingTaskList = ref(false);

const isBatchMode = ref(false);
const selectedRowKeys = ref<(string | number)[]>([]);
const batchSelectableFilter = (row: any) => isSubmittedStatus(row.submissionStatus);
const selectableRows = computed(() => groupTaskData.value.filter((row) => isSubmittedStatus(row.submissionStatus)));

const enterBatchMode = () => {
  isBatchMode.value = true;
  selectedRowKeys.value = [];
};
const exitBatchMode = () => {
  isBatchMode.value = false;
  selectedRowKeys.value = [];
};
const isAllSelected = computed(() => {
  if (!selectableRows.value.length) return false;
  return selectableRows.value.every((row) => selectedRowKeys.value.includes(row.id));
});
const handleTableSelect = (keys: Array<string | number>) => {
  selectedRowKeys.value = keys;
};
const handleTableSelectAll = (selected: boolean) => {
  selectedRowKeys.value = selected ? selectableRows.value.map((row) => row.id) : [];
};
const handleSelectAllCheckbox = () => {
  selectedRowKeys.value = isAllSelected.value ? [] : selectableRows.value.map((row) => row.id);
};

const fetchStudentTaskList = async () => {
  const resourceId = resolveSelectedResourceId();
  const classId = String(route.query.classId || "");
  if (!resourceId || !classId) return;
  try {
    const data = await taskApi.getStudentTaskList({ resourceId, classId });
    groupTaskData.value = (data || []).map((item: any, index: number) => {
      const status = Number(item.status);
      const submissionStatus =
        status === 1 ? "submitted" : status === 2 ? "resubmitted" : "unsubmitted";
      return {
        id: item.taskId || item.id || `${item.studentNumber || item.studentId || index}`,
        studentName: item.studentName || "-",
        studentAccount: item.studentNumber || "-",
        groupName: item.groupName || "-",
        leader: item.groupLeader || item.leader || "-",
        members: item.groupMembers || item.members || "-",
        submissionStatus,
        scoreTotal: item.score !== null && item.score !== undefined ? `${item.score}/${item.totalScore ?? "-"}` : "-",
        duration: item.taskDuration || "-",
        submissionTime: item.taskEndTime || "-",
        qaStatus: item.qaStatusText || item.qaStatus || "-",
        grade: scoreToStars(item.score, item.totalScore),
        teacherScore: item.teacherScore ?? null,
        graded: Boolean(item.graded),
        _raw: item,
      };
    });
  } catch (error) {
    console.error("加载任务学生列表失败:", error);
    groupTaskData.value = [];
  }
};

const handleRefreshList = async () => {
  refreshingTaskList.value = true;
  try {
    await fetchStudentTaskList();
  } finally {
    refreshingTaskList.value = false;
  }
};

const toggleAnswerAnalysis = () => {
  answerAnalysisEnabled.value = !answerAnalysisEnabled.value;
  if (answerAnalysisEnabled.value) {
    ElMessage.success(t("taskManagement.answerAnalysisEnabled"));
  } else {
    ElMessage.success(t("taskManagement.answerAnalysisDisabled"));
  }
};

const openIssueModal = () => {
  showTaskIssueModal.value = true;
};

const handleIssueGroup = async () => {
  const resourceId = resolveSelectedResourceId();
  const classId = String(route.query.classId || "");
  if (!resourceId || !classId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  taskIssuing.value = true;
  try {
    await taskApi.bindDistributer({ classId, resourceId, distributeType: 2 });
    setDistributeTypeOverride(selectedTaskMeta.value?.task, 2);
    showTaskIssueModal.value = false;
    ElMessage.success(t("taskManagement.issueTaskSuccess"));
    await loadTaskList();
    await fetchStudentTaskList();
  } catch (error: any) {
    ElMessage.error(error.message || t("taskManagement.issueTaskFailed"));
  } finally {
    taskIssuing.value = false;
  }
};

const handleIssueStudent = async () => {
  const resourceId = resolveSelectedResourceId();
  const classId = String(route.query.classId || "");
  if (!resourceId || !classId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  taskIssuing.value = true;
  try {
    await taskApi.bindDistributer({ classId, resourceId, distributeType: 1 });
    setDistributeTypeOverride(selectedTaskMeta.value?.task, 1);
    showTaskIssueModal.value = false;
    ElMessage.success(t("taskManagement.issueTaskSuccess"));
    await loadTaskList();
    await fetchStudentTaskList();
  } catch (error: any) {
    ElMessage.error(error.message || t("taskManagement.issueTaskFailed"));
  } finally {
    taskIssuing.value = false;
  }
};

const handleFreeCodingIssue = async () => {
  const resourceId = resolveSelectedResourceId();
  const classId = String(route.query.classId || "");
  if (!resourceId || !classId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  taskIssuing.value = true;
  try {
    await taskApi.bindDistributer({ classId, resourceId, distributeType: 1 });
    setDistributeTypeOverride(selectedTaskMeta.value?.task, 1);
    ElMessage.success(t("taskManagement.issueTaskSuccess"));
    await loadTaskList();
    await fetchStudentTaskList();
  } catch (error: any) {
    ElMessage.error(error.message || t("taskManagement.issueTaskFailed"));
  } finally {
    taskIssuing.value = false;
  }
};

const handleWithdrawConfirm = async () => {
  const resourceId = resolveSelectedResourceId();
  const classId = String(route.query.classId || "");
  if (!resourceId || !classId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  try {
    await taskApi.bindWithdrawr({
      classId,
      resourceId,
      distributeType: issueTypeFromApi.value === "group" ? 2 : 1,
    });
    clearDistributeTypeOverride(selectedTaskMeta.value?.task || null);
    showTaskWithdrawModal.value = false;
    ElMessage.success(t("taskManagement.withdrawSuccess"));
    await loadTaskList();
    groupTaskData.value = [];
    exitBatchMode();
  } catch (error: any) {
    ElMessage.error(error.message || t("taskManagement.withdrawFailed"));
  }
};

const handleViewAndGrade = (row: any) => {
  taskViewTaskId.value = row?._raw?.taskId ? String(row._raw.taskId) : null;
  showTaskExerciseDetailModal.value = true;
};

const handleViewTaskDetail = (row?: any) => {
  taskViewTaskId.value = row?._raw?.taskId ? String(row._raw.taskId) : null;
  showTaskExerciseDetailModal.value = true;
};

const handleViewAndScore = (row: any) => {
  currentTaskScoreRow.value = row;
  showTaskViewScoreModal.value = true;
};

const handleScoreSave = () => {
  showTaskViewScoreModal.value = false;
};

const handleScoreNext = () => {
  const currentIndex = groupTaskData.value.findIndex((row) => row.id === currentTaskScoreRow.value?.id);
  const nextRow = groupTaskData.value
    .slice(currentIndex + 1)
    .find((row) => isSubmittedStatus(row.submissionStatus));
  if (nextRow) {
    currentTaskScoreRow.value = nextRow;
  } else {
    ElMessage.info(t("taskManagement.noMoreSubmissions"));
    showTaskViewScoreModal.value = false;
  }
};

const handleReturnToRedo = (row: any) => {
  returnToRedoRow.value = row;
  showTaskReturnToRedoModal.value = true;
};

const confirmTaskReturnToRedo = async () => {
  if (!returnToRedoRow.value) return;
  try {
    const taskId = returnToRedoRow.value?._raw?.taskId || returnToRedoRow.value?.id;
    await taskApi.bindReject([String(taskId)]);
    showTaskReturnToRedoModal.value = false;
    ElMessage.success(t("taskManagement.returnToRedoSuccess"));
    await fetchStudentTaskList();
  } catch (error: any) {
    ElMessage.error(error.message || t("taskManagement.returnToRedo"));
  }
};

const handleBatchReturnToRedo = async () => {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  const taskIds = selectedRowKeys.value.map((key) => {
    const row = groupTaskData.value.find((item) => item.id === key);
    return String(row?._raw?.taskId || key);
  });
  try {
    await taskApi.bindReject(taskIds);
    ElMessage.success(t("taskManagement.batchReturnSuccess"));
    exitBatchMode();
    await fetchStudentTaskList();
  } catch (error: any) {
    ElMessage.error(error.message || t("taskManagement.batchReturnSuccess"));
  }
};

const resetTaskPanelState = () => {
  submissionFilter.value = "all";
  moreActionValue.value = "";
  answerAnalysisEnabled.value = false;
  showTaskViewScoreModal.value = false;
  showTaskReturnToRedoModal.value = false;
  currentTaskScoreRow.value = null;
  returnToRedoRow.value = null;
  exitBatchMode();
};

const loadTaskList = async () => {
  const chapterId = Number(route.params.id);
  const classId = String(route.query.classId || "");
  if (!chapterId || !classId) {
    taskListData.value = [];
    selectedTaskKey.value = "";
    selectedTaskMeta.value = null;
    groupTaskData.value = [];
    resetTaskPanelState();
    return;
  }

  taskLoading.value = true;
  try {
    const data = await taskApi.getTaskList({ chapterId, classId });
    taskListData.value = Array.isArray(data) ? data : [];
    for (const group of taskListData.value) {
      const groupKey = getTaskGroupKey(group);
      if (expandedGroups[groupKey] === undefined) {
        expandedGroups[groupKey] = true;
      }
    }

    const entries: Array<{ key: string; task: TaskResourceItem; category: number }> = [];
    taskListData.value.forEach((group) => {
      (group.resourceList || []).forEach((task, index) => {
        entries.push({
          key: getTaskItemSelectKey(task, group, index),
          task,
          category: Number(group.resourceCategory),
        });
      });
    });

    const currentKey = String(selectedTaskKey.value || "");
    const matched = entries.find((item) => item.key === currentKey);
    const fallback = entries[0];
    const target = matched || fallback || null;

    if (target) {
      const taskChanged = target.key !== currentKey;
      selectedTaskKey.value = target.key;
      selectedTaskMeta.value = { task: target.task, category: target.category };
      if (taskChanged) {
        resetTaskPanelState();
      }
      if (activeSidebarPanel.value === "task" && isIssuedDistributeType(target.task.distributeType)) {
        await fetchStudentTaskList();
      } else {
        groupTaskData.value = [];
      }
    } else {
      selectedTaskKey.value = "";
      selectedTaskMeta.value = null;
      groupTaskData.value = [];
      resetTaskPanelState();
    }
  } catch (error) {
    console.error("加载任务列表失败:", error);
    taskListData.value = [];
    selectedTaskKey.value = "";
    selectedTaskMeta.value = null;
    groupTaskData.value = [];
    resetTaskPanelState();
  } finally {
    taskLoading.value = false;
  }
};

// 左侧任务分组展开状态
const expandedGroups = reactive<Record<string, boolean>>({});

const toggleTaskGroup = (groupKey: string) => {
  expandedGroups[groupKey] = !expandedGroups[groupKey];
};

const selectTask = async (task: TaskResourceItem, group: TaskCategoryGroup, taskIndex: number) => {
  selectedTaskKey.value = getTaskItemSelectKey(task, group, taskIndex);
  selectedTaskMeta.value = { task, category: Number(group.resourceCategory) };
  resetTaskPanelState();
  activeSidebarPanel.value = "task";
  if (isTaskIssued.value) {
    await fetchStudentTaskList();
  } else {
    groupTaskData.value = [];
  }
};

const selectResource = async (item: ResourceItem) => {
  activeSidebarPanel.value = "courseware";
  activeResource.value = item.id;

  const chapterId = route.params.id as string;
  const classId = route.query.classId as string;
  const storageKey = `classroom_selected_resource_${classId}_${chapterId}`;
  localStorage.setItem(storageKey, item.id);

  // 更新当前选中资源
  selectedResource.value = {
    id: item.id,
    name: item.name,
    type: item.type,
    resourceUrl: item.resourceUrl,
    isSent: item.isSent,
  };

  previewLoading.value = true;
  previewType.value = "";
  iframePreviewUrl.value = "";

  const fileType = getFileType(item.name);

  try {
    if (
      (fileType === "word" ||
        fileType === "ppt" ||
        fileType === "excel" ||
        fileType === "pdf" ||
        fileType === "image") &&
      item.resourceUrl
    ) {
      previewLoading.value = false
      previewType.value = "iframe";
      iframePreviewUrl.value = getPptPreviewUrl(item.resourceUrl);
      previewLoading.value = false;
    } else if (fileType === "video" && item.resourceUrl) {
    } else if (fileType === 'mc') {
      previewType.value = "video";
      previewLoading.value = false;
    } else if (fileType === "ucd") {
      // UCD 文件
      previewType.value = "ucd";
      previewLoading.value = false;
    } else if (fileType === "mc") {
      // MC 文件
      previewType.value = "mc";
      previewLoading.value = false;
    } else {
      // 不支持预览
      previewType.value = "unsupported";
      previewLoading.value = false;
    }
  } catch (error) {
    console.error('加载预览失败:', error)
    previewType.value = "unsupported";
    previewLoading.value = false;
  }
};

const getResourceIcon = (type: string) => {
  const typeMap: Record<string, string> = {
    doc: "word",
    docx: "word",
    ppt: "ppt",
    pptx: "ppt",
    xls: "excel",
    xlsx: "excel",
    pdf: "pdf",
    ucd: "ucd",
    mc: "mc",
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    bmp: "image",
    webp: "image",
    svg: "image",
    mp4: "video",
    mov: "video",
    webm: "video",
  };
  const fileType = typeMap[type] || "default";

  const iconMap: Record<string, string> = {
    word: docIcon,
    ppt: pptIcon,
    excel: xlsIcon,
    pdf: pdfIcon,
    image: pngIcon,
    video: mp4Icon,
    mc: mcIcon,
    ucd: morenIcon,
    default: morenIcon,
  };
  return iconMap[fileType] || iconMap.default;
};

const handleEndClass = () => {
  showEndClassModal.value = true;
};

const confirmEndClass = async () => {
  const chapterId = route.params.id as string;
  const classId = route.query.classId as string;
  const courseId = route.query.courseId as string;

  try {
    await endClass({
      classId,
      courseId,
      chapterId,
      peerId: teacherPeerId.value,
    });
    if (classId) {
      try {
        await stopQuickLogin(classId);
      } catch (error) {
        console.error("停用快捷登录失败:", error);
      }
    }
    // 璋冭瘯鏃ュ織
    showEndClassModal.value = false
    const classKey = `class_start_${classId}_${chapterId}`;
    localStorage.removeItem(classKey);
    // 清理课堂状态缓存
    localStorage.removeItem("ongoing_classroom");
    showEndClassModal.value = false;
    navigateTo(`/system/course/${courseId}`);
  } catch (error: any) {
    console.error('下课失败:', error)
    ElMessage.error(error.message || t("classroom.endClassFailed"));
  }
};

const handleBack = () => {
  const from = route.query.from as string;
  // 如果是从教师首页进入，显示确认弹窗
  if (from === "teacher") {
    showBackConfirmModal.value = true;
  } else {
    const courseId = route.query.courseId as string;
    navigateTo(`/system/course/${courseId}`);
  }
};

// 返回确认弹窗
const showBackConfirmModal = ref(false);

const confirmBack = () => {
  showBackConfirmModal.value = false;
  navigateTo("/teacher");
};

onMounted(async () => {
  // 获取路由参数
  const chapterId = route.params.id as string;
  const classId = route.query.classId as string;
  const courseId = route.query.courseId as string;
  // 初始化 PeerJS（教师端）
  // 使用 classId 作为 PeerId 的一部分，方便学生连接
  const peerId = classId;

  // 课堂计时 - 使用 localStorage 存储开课时间，支持续上
  const classKey = `class_start_${classId}_${chapterId}`;
  let startTime = localStorage.getItem(classKey);
  if (!startTime) {
    // 首次开课，记录开始时间
    startTime = Date.now().toString();
    localStorage.setItem(classKey, startTime);
  }
  // 计算已上课时间
  const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
  classTime.value = elapsed;

  // 存储正在进行的课堂信息（供全局"回到课堂"按钮使用）
  // 有效时间为2小时
  const expireAt = Date.now() + 2 * 60 * 60 * 1000;
  localStorage.setItem(
    "ongoing_classroom",
    JSON.stringify({
      classId,
      courseId,
      chapterId,
      expireAt,
    })
  );
  // 调试日志

  // 启动课堂计时器
  timer = setInterval(() => {
    classTime.value++;
  }, 1000);

  // 加载快捷登录信息（autoQuickLogin=1 时自动开启）
  if (route.query.autoQuickLogin === '1') {
    showLoginTip.value = false;
    autoEnableQuickLogin();
  } else {
    loadQuickLoginInfo();
  }

  // 加载课件列表
  loadResourceList();

  // 加载任务列表
  loadTaskList();

  try {
    await peerJS.initialize(peerId);
    teacherPeerId.value = peerJS.myPeerId.value;
    // 璋冭瘯鏃ュ織
  } catch (error) {
    console.error('[教师课堂] PeerJS 初始化失败:', error)
  }

  // 连接 WebSocket 监听学生加入
  connectNotifyWebSocket(classId);
});

// 连接通知 WebSocket（监听 STUDENT_JOIN）
const connectNotifyWebSocket = (classId: string) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let wsUrl = signalingUrl;
  if (token) {
    const separator = signalingUrl.includes("?") ? "&" : "?";
    wsUrl = `${signalingUrl}${separator}Authorization=${encodeURIComponent(
      `Bearer ${token}`
    )}`;
  }

  // 璋冭瘯鏃ュ織
  notifyWs = new WebSocket(wsUrl);

  notifyWs.onopen = () => {
    // 璋冭瘯鏃ュ織
  };

  notifyWs.onmessage = async (event) => {
    // 璋冭瘯鏃ュ織
    try {
      const message = JSON.parse(event.data);

      // 学生加入课堂
      if (message.type === "STUDENT_JOIN") {
        // 璋冭瘯鏃ュ織
        // 如果正在分享屏幕，呼叫学生
        if (peerJS.isScreenSharing.value) {
          const studentPeerId = `student_${message.classId || classId}`  // 加 student_ 前缀
          // 璋冭瘯鏃ュ織
          try {
            await peerJS.callPeer(studentPeerId);
            // 璋冭瘯鏃ュ織
          } catch (err) {
            console.error('[教师课堂] 呼叫学生失败:', err)
          }
        } else {
          // 璋冭瘯鏃ュ織
        }
      }

      // 学生准备好接收屏幕分享
      if (message.type === "STUDENT_READY") {
        // 璋冭瘯鏃ュ織
        if (peerJS.isScreenSharing.value && message.studentPeerId) {
          // 璋冭瘯鏃ュ織
          try {
            await peerJS.callPeer(message.studentPeerId);
            // 璋冭瘯鏃ュ織
          } catch (err) {
            console.error('[教师课堂] 呼叫学生失败:', err)
          }
        }
      }
    } catch (e) {
      // 璋冭瘯鏃ュ織
    }
  };

  notifyWs.onclose = () => {
    // 璋冭瘯鏃ュ織
  };
};

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (notifyWs) {
    notifyWs.close();
    notifyWs = null;
  }
  // 销毁 PeerJS 连接
  peerJS.destroy();
});
</script>

<style scoped>
.classroom-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 顶部导航栏 */
.classroom-header {
  height: 50px;
  background: #ff9900;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.class-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 14px;
  margin-right: 8px;
}

.time-label {
  opacity: 0.9;
}

.time-value {
  font-family: monospace;
  font-weight: 500;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.header-btn.active {
  background: #ff6b6b;
}

.header-btn.ai-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 6px 16px;
}

.header-btn.ai-btn .btn-tag {
  background: #52c41a;
  border-radius: 3px;
}

.header-btn.more-btn {
  padding: 6px 10px;
}

.header-btn.more-btn .dots {
  font-size: 16px;
  letter-spacing: 2px;
}

.header-btn svg {
  flex-shrink: 0;
}

.btn-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.btn-tag {
  padding: 2px 6px;
  background: #ff9900;
  border-radius: 3px;
  font-size: 11px;
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
}

.back-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 8px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.end-class-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: white;
  border: none;
  border-radius: 20px;
  color: #ff6b6b;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.end-class-btn svg {
  stroke: #ff6b6b;
}

.end-class-btn:hover {
  background: #fff0f0;
}

/* 主体内容 */
.classroom-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 黑板全屏模式 */
.classroom-body.blackboard-fullscreen .preview-area {
  flex: 1;
}

.classroom-body.blackboard-fullscreen .blackboard-wrapper {
  position: absolute;
  inset: 0;
  border-radius: 0;
}

.classroom-body.blackboard-fullscreen .preview-content {
  padding: 0;
}

/* 左侧边栏 */
.sidebar-left {
  width: 260px;
  background: white;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s;
}

.sidebar-left.collapsed {
  width: 0;
}

.sidebar-left.collapsed .sidebar-content {
  opacity: 0;
  pointer-events: none;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  transition: opacity 0.2s;
}

.collapse-btn {
  position: absolute;
  top: 50%;
  right: -12px;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 区块样式 */
.section-block {
  border-bottom: 1px solid #e5e5e5;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background: #fafafa;
}

.section-title .send-btn {
  margin-left: auto;
  padding: 4px 12px;
  background: #ff9900;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.section-title .send-btn:hover {
  background: #e68a00;
}

/* 资源列表 */
.resource-list {
  padding: 8px 12px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.resource-item:hover {
  background: #f5f5f5;
}

.resource-item.active {
  background: #e6f4ff;
  color: #1890ff;
}

.resource-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  object-fit: contain;
}

.resource-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 任务列表 */
.task-list {
  padding: 8px 12px;
  font-size: 13px;
}

.task-group {
  margin-bottom: 4px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 8px;
  cursor: pointer;
  color: #333;
  border-radius: 4px;
  flex-wrap: wrap;
}

.group-header:hover {
  background: #f5f5f5;
}

.expand-icon {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.group-desc {
  font-size: 11px;
  color: #999;
  margin-left: auto;
  flex-shrink: 0;
}

.group-content {
  padding-left: 18px;
}

.task-item {
  padding: 8px 8px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
}

.task-item:hover {
  background: #f5f5f5;
  color: #333;
}

.task-item.active {
  background: #e6f4ff;
  color: #1890ff;
}

.empty-tip {
  padding: 8px 8px;
  color: #999;
  font-size: 12px;
}

/* 中间预览区 */
.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #e8e8e8;
  position: relative;
}

.preview-toolbar {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: #f5f5f5;
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* padding: 20px; */
}

.document-viewer {
  width: 100%;
  height: 100%;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.empty-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  gap: 16px;
}

.empty-preview p {
  margin: 0;
}

/* 预览加载中 */
.preview-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #666;
}

.preview-loading .spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e5e5;
  border-top-color: #ff9900;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* iframe 预览 */
.iframe-preview-wrapper {
  width: 100%;
  height: 100%;
}

.iframe-preview-wrapper .preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 视频预览 */
.video-preview-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-video {
  max-width: 100%;
  max-height: 100%;
}

/* UCD/MC 文件预览卡片 */
.ucd-preview-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ucd-preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  background: #fafafa;
  border-radius: 12px;
}

.ucd-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff9900 0%, #ffb84d 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.ucd-icon.mc-icon {
  background: linear-gradient(135deg, #3eaeff 0%, #6bc5ff 100%);
}

.ucd-filename {
  font-size: 14px;
  color: #333;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

.ucd-btn {
  padding: 8px 24px;
  background: #ff9900;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.ucd-btn:hover {
  background: #e68a00;
}

/* 下载按钮 */
.download-btn {
  padding: 8px 24px;
  background: #ff9900;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.download-btn:hover {
  background: #e68a00;
}

/* 屏幕分享状态 */
.screen-share-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.share-icon {
  position: relative;
  margin-bottom: 16px;
}

.share-icon .status-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: #ff6b6b;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 1.5s infinite;
}

.share-text {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.share-tip {
  font-size: 14px;
  color: #999;
  margin-bottom: 16px;
}

.connected-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #e8f5e9;
  border-radius: 20px;
  color: #4caf50;
  font-size: 14px;
  margin-bottom: 24px;
}

.connected-count svg {
  color: #4caf50;
}

.stop-share-btn {
  padding: 10px 32px;
  background: #ff6b6b;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.stop-share-btn:hover {
  background: #ff5252;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 黑板模式 */
.blackboard-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

/* 屏幕分享时黑板上的小提示 */
.share-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(62, 174, 255, 0.9);
  border-radius: 20px;
  color: white;
  font-size: 13px;
  z-index: 100;
}

/* 屏幕分享状态提示条 */
.share-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-bottom: 1px solid #a5d6a7;
}

.share-status-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #2e7d32;
}

.stop-share-btn-small {
  padding: 6px 16px;
  background: #ff6b6b;
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.stop-share-btn-small:hover {
  background: #ff5252;
}

/* 连接学生数量徽章 */
.connected-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  background: #ff6b6b;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

/* PDF 工具栏 */
.pdf-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: white;
  border-top: 1px solid #e5e5e5;
}

.pdf-toolbar .toolbar-left,
.pdf-toolbar .toolbar-center,
.pdf-toolbar .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pdf-toolbar .divider {
  width: 1px;
  height: 20px;
  background: #e5e5e5;
  margin: 0 4px;
}

.pdf-toolbar .tool-label {
  font-size: 13px;
  color: #666;
}

.pdf-toolbar .page-info {
  font-size: 13px;
  color: #666;
  min-width: 60px;
  text-align: center;
}

.pdf-toolbar .page-input {
  width: 50px;
  height: 28px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  outline: none;
}

.pdf-toolbar .page-input:focus {
  border-color: #ff9900;
}

.pdf-toolbar .tool-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-toolbar .tool-btn:hover:not(:disabled) {
  background: #e5e5e5;
}

.pdf-toolbar .tool-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pdf-toolbar .tool-btn.icon {
  font-size: 16px;
  padding: 0;
  width: 32px;
}

.pdf-toolbar .tool-btn.icon.active {
  background: #ff9900;
  border-color: #ff9900;
}

.pdf-toolbar .tool-btn.small {
  padding: 0 10px;
}

.pdf-toolbar .color-picker {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
}

.pdf-toolbar .width-select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.pdf-toolbar .zoom-value {
  font-size: 13px;
  color: #666;
  min-width: 45px;
  text-align: center;
}

.preview-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: white;
  border-top: 1px solid #e5e5e5;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e5e5e5;
  margin: 0 8px;
}

.tool-label {
  font-size: 13px;
  color: #666;
}

.page-input {
  width: 50px;
  height: 28px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  text-align: center;
  font-size: 13px;
  outline: none;
}

.page-input:focus {
  border-color: #ff9900;
}

.jump-btn {
  padding: 4px 12px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
}

.jump-btn:hover {
  background: #e5e5e5;
}

.zoom-value {
  font-size: 13px;
  color: #666;
  min-width: 45px;
  text-align: center;
}

.page-btn {
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #e5e5e5;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 学生快捷登录提示框 */
.login-tip-panel {
  position: absolute;
  top: 60px;
  right: 16px;
  width: 340px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  z-index: 100;
  overflow: hidden;
}

.login-tip-panel.over-modal {
  z-index: 1101;
}

.tip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #f8fcff 0%, #ffffff 100%);
}

.tip-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tip-expire-inline {
  font-size: 13px;
  color: #999;
}

.tip-actions {
  display: flex;
  gap: 4px;
}

.tip-action-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.tip-action-btn:hover {
  background: #f0f0f0;
  color: #666;
}

.tip-body {
  padding: 16px 20px;
}

.info-card {
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 12px;
  position: relative;
}

.info-card.link-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-card.code-card {
  padding-right: 80px;
}

.code-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.code-row:last-child {
  margin-bottom: 0;
}

.code-label {
  font-size: 14px;
  color: #666;
  min-width: 80px;
}

.code-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  font-family: "SF Mono", Monaco, monospace;
  letter-spacing: 1px;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #3eaeff;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #e6f4ff;
}

.copy-btn svg {
  stroke: #3eaeff;
}

.card-copy {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
}

.tip-footer {
  font-size: 13px;
  color: #999;
  margin: 4px 0 0;
  text-align: center;
}

.login-tip-panel.collapsed {
  width: auto;
}

.login-tip-panel.collapsed .tip-header {
  border-bottom: none;
  padding: 12px 16px;
}

.task-student-table {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.task-student-table :deep(.overflow-x-auto) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.task-student-table :deep(thead) {
  position: sticky;
  top: 0;
  z-index: 10;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.3s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
