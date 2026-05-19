<template>
  <div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Row 1: Breadcrumb & Custom Exercise Button (White Background) -->
    <div class="pl-[6%] pr-[5%] py-4 flex items-center justify-between">
      <div class="flex items-center text-sm text-gray-500">
        <span
          class="hover:text-gray-700 transition-colors cursor-pointer"
          @click="goHome"
          >{{ $t("nav.home") }}</span
        >
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="text-gray-900 font-medium">{{ $t("taskManagement.title") }}</span>
      </div>
      <MButton
        type="primary"
        class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] shadow-md shadow-orange-500/20 active:scale-95 transition-all"
        @click="handleCustomTask"
      >
        {{ $t("taskManagement.customExercise") }}
      </MButton>
    </div>

    <!-- Row 2: Pending Review Cards (Separate Background Block) -->
    <div
      v-if="pendingReviewTasks.length > 0"
      class="mx-[6%] mr-[5%] mb-3 bg-[#e3ebf3]/60 rounded-xl px-5 py-4"
    >
      <div class="flex flex-wrap gap-3">
        <div
          v-for="(task, index) in pendingReviewTasks"
          :key="task.resourceId || index"
          class="bg-white rounded-lg px-4 py-3 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
          @click="handlePendingReviewSelect(index, task)"
        >
          <!-- 待批改标签 - 右上角斜角 -->
          <div
            class="absolute -right-6 -top-1 bg-[#FF9900] text-white text-xs px-8 py-1 rotate-[30deg] origin-center"
          >
            {{ $t("taskManagement.pendingReview") }}
          </div>

          <div class="pr-12">
            <span class="text-gray-800 font-medium text-base block">{{
              task.className
            }}</span>
            <span class="text-sm text-gray-400 mt-1 block">{{ task.taskName }}</span>
          </div>

          <!-- 选中时底部的主题色线条 -->
          <div
            v-if="selectedPendingIndex === index"
            class="absolute bottom-0 left-4 right-4 h-1 bg-[#FF9900] rounded-full"
          ></div>
        </div>
      </div>
    </div>

    <!-- Row 3: Filters & Main Content (Separate Background Block) -->
    <div
      class="flex-1 flex flex-col overflow-hidden mx-[6%] mr-[5%] mb-4 bg-[#e3ebf3]/60 rounded-xl"
    >
      <!-- Filters Row -->
      <div class="px-5 py-4 relative z-50">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600">{{
              $t("class.className")
            }}</span>
            <MSelect
              v-model="filters.class"
              :options="classOptions"
              class="w-[200px]"
              :placeholder="$t('taskManagement.selectClass')"
              @change="handleClassChange"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-600">{{
              $t("course.courseName")
            }}</span>
            <MSelect
              v-model="filters.course"
              :options="courseOptions"
              class="w-[200px]"
              :placeholder="$t('taskManagement.selectCourse')"
              :disabled="!filters.class"
              @change="handleCourseChange"
            />
          </div>
          <div v-if="!isAssessmentTab" class="flex items-center gap-2">
            <MSelect
              v-model="filters.topic"
              :options="topicOptions"
              class="w-[240px]"
              :placeholder="$t('taskManagement.selectChapter')"
              :disabled="!filters.course"
            />
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex overflow-hidden px-5 pb-5 gap-5">
        <!-- Left Sidebar -->
        <div class="w-[200px] flex flex-col bg-white rounded-xl overflow-hidden shrink-0">
          <div class="p-4 border-b border-gray-100 flex flex-col gap-3">
            <!-- Custom Underline Tabs -->
            <div class="flex">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                :class="[
                  'px-3 py-1.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.value
                    ? 'text-[#FF9900] border-[#FF9900]'
                    : 'text-gray-500 border-transparent hover:text-gray-700',
                ]"
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
            <MTree
              v-if="hasSidebarTasks"
              :data="treeData"
              node-key="id"
              label-key="label"
              :selected-key="selectedTaskKey"
              :expanded-keys="expandedKeys"
              @select="handleNodeSelect"
              @expand="handleNodeExpand"
              class="text-gray-700"
            >
            </MTree>
            <div
              v-else
              class="flex h-full min-h-[120px] items-center justify-center text-sm text-gray-400"
            >
              {{ $t("taskManagement.noTask") }}
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col bg-white rounded-xl relative overflow-hidden">
          <div class="flex-1 w-full overflow-hidden">
            <div class="h-full w-full flex flex-col">
              <div
                v-if="!hasSidebarTasks"
                class="flex-1 flex items-center justify-center w-full h-full bg-white"
              >
                <div
                  class="flex w-full max-w-[560px] flex-col items-center px-6 text-center"
                >
                  <Transition name="icon-fade" mode="out-in">
                    <svg
                      width="100"
                      height="100"
                      viewBox="0 0 64 64"
                      fill="none"
                      class="mb-[34px] text-black"
                    >
                      <rect
                        x="16"
                        y="9"
                        width="24"
                        height="36"
                        rx="4.8"
                        stroke="currentColor"
                        stroke-width="3.6"
                      />
                      <path
                        d="M23 19h10M21 27.5h14M23 36h8"
                        stroke="currentColor"
                        stroke-width="3.6"
                        stroke-linecap="round"
                      />
                      <circle
                        cx="43"
                        cy="39"
                        r="11"
                        fill="white"
                        stroke="currentColor"
                        stroke-width="3.6"
                      />
                      <path
                        d="M38.7 39.2l2.9 3.1 6-7"
                        stroke="currentColor"
                        stroke-width="3.6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </Transition>

                  <h2 class="text-[24px] font-bold leading-none text-[#122B49]">
                    {{ $t("taskManagement.noTask") }}
                  </h2>
                </div>
              </div>

              <!-- Cards Grid (Free Creation / Tools) - Only show when task not issued -->
              <div
                v-else-if="isFreeCoding && !isTaskIssued"
                class="h-full w-full bg-[#F3F3F3] flex flex-col items-center px-6 pt-6 text-center"
              >
                <div class="text-[#444] leading-[1.35] mb-6">
                  <div class="text-[16px] font-medium">
                    {{ $t("taskManagement.description1") }}
                  </div>
                  <div class="text-[16px] font-medium">
                    {{ $t("taskManagement.description2") }}
                  </div>
                </div>

                <div
                  class="w-full max-w-[720px] flex flex-wrap justify-center gap-x-10 gap-y-6"
                >
                  <div
                    v-for="editor in editorsList"
                    :key="editor.id"
                    class="flex flex-col items-center"
                  >
                    <div
                      class="w-[190px] rounded-[14px] overflow-hidden cursor-pointer border transition-all duration-200 bg-white"
                      :class="
                        selectedEditor === editor.id
                          ? 'border-[#2EA9DF] shadow-[0_8px_20px_rgba(46,169,223,0.2)]'
                          : 'border-[#BDBDBD] hover:border-[#95CAE3]'
                      "
                      @click="selectedEditor = editor.id"
                    >
                      <div
                        class="h-[128px] bg-[#F5F5F5] flex items-center justify-center"
                      >
                        <img
                          :src="editor.cover"
                          :alt="editor.name"
                          class="w-[72px] h-[72px] object-contain"
                        />
                      </div>
                      <div
                        class="h-[56px] bg-[#EAEAEA] px-3 flex items-center justify-center"
                      >
                        <div
                          class="text-[16px] leading-[1.15] text-[#3B3B3B] whitespace-pre-line"
                        >
                          {{ editor.name }}
                        </div>
                      </div>
                    </div>

                    <label
                      class="mt-2.5 flex items-center gap-1.5 cursor-pointer select-none"
                      @click.stop="selectedEditor = editor.id"
                    >
                      <div
                        class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                        :class="
                          selectedEditor === editor.id
                            ? 'border-[#2EA9DF] bg-[#2EA9DF]'
                            : 'border-[#BDBDBD] bg-white'
                        "
                      >
                        <svg
                          v-if="selectedEditor === editor.id"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12l4 4 10-10"
                            stroke="white"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                      <span class="text-[14px] text-[#666]">{{
                        $t("taskManagement.pushToStudents")
                      }}</span>
                    </label>
                  </div>
                </div>

                <div class="mt-6 pb-4">
                  <MButton
                    type="primary"
                    class="!bg-[#2EA9DF] !text-white hover:!bg-[#1e9bd3] !h-9 !px-6 !text-[14px] shadow-md active:scale-95 transition-all"
                    :class="{
                      '!bg-gray-200 !text-gray-400 !shadow-none !cursor-not-allowed hover:!bg-gray-200':
                        !selectedEditor || freeCodingIssuing,
                    }"
                    :disabled="!selectedEditor || freeCodingIssuing"
                    @click="handleFreeCodingIssue"
                  >
                    {{ $t("taskManagement.issueTask") }}
                  </MButton>
                </div>
              </div>

              <!-- Task Issued View (for AI Chat) -->
              <div
                v-else-if="isTaskIssued"
                class="w-full flex-1 flex flex-col min-h-0 overflow-visible"
              >
                <!-- Header Stats & Actions -->
                <div
                  class="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 overflow-visible relative z-50"
                >
                  <div class="flex items-center text-sm text-gray-600">
                    <span
                      >{{
                        issueType === "group"
                          ? $t("taskManagement.currentGroupSubmitted")
                          : $t("taskManagement.currentStudentSubmitted")
                      }}：</span
                    >
                    <span class="text-[#1890FF] font-medium mx-1">{{
                      submittedCount
                    }}</span>
                    <span
                      >{{ $t("taskManagement.itemUnit") }}，{{
                        $t("taskManagement.unsubmitted")
                      }}：</span
                    >
                    <span class="text-[#FF4D4F] font-medium mx-1">{{
                      unsubmittedCount
                    }}</span>
                    <span>{{ $t("taskManagement.itemUnit") }}</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <!-- Exercise Actions -->
                    <template v-if="isExerciseTask">
                      <!-- Batch Mode: Only show Cancel button -->
                      <template v-if="isBatchMode && !isAssessmentTab">
                        <MButton
                          class="!bg-white !text-[#FF4D4F] !border-[#FF4D4F] hover:!bg-red-50 px-4 py-1.5 h-9 shadow-sm"
                          @click="exitBatchMode"
                        >
                          {{ $t("user.cancelBatchOperation") }}
                        </MButton>
                      </template>

                      <!-- Normal Mode: Show all buttons -->
                      <template v-else>
                        <!-- Answer Analysis Toggle -->
                        <div
                          v-if="!isAssessmentTab"
                          class="flex items-center gap-2 text-sm text-gray-600 relative group"
                        >
                          <span>{{ $t("taskManagement.answerAnalysis") }}</span>
                          <button
                            @click="toggleAnswerAnalysis"
                            class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                            :class="
                              answerAnalysisEnabled ? 'bg-[#FF9900]' : 'bg-gray-300'
                            "
                          >
                            <span
                              class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-200"
                              :class="answerAnalysisEnabled ? 'left-6' : 'left-1'"
                            ></span>
                          </button>
                          <!-- Tooltip -->
                          <div
                            class="absolute top-full left-0 mt-2 z-[9999] hidden group-hover:block pointer-events-none"
                          >
                            <div
                              class="bg-black/90 text-white text-sm px-4 py-2.5 rounded-md shadow-lg relative text-center whitespace-nowrap"
                            >
                              <!-- Arrow -->
                              <div
                                class="absolute -top-1 left-16 w-2 h-2 bg-black/90 rotate-45"
                              ></div>
                              {{ $t("taskManagement.answerAnalysisTip") }}
                            </div>
                          </div>
                        </div>

                        <MButton
                          v-if="isAssessmentTab"
                          class="!bg-white !text-[#39A9FF] !border-[#A8D7FF] hover:!bg-[#F3FAFF] hover:!border-[#7EC4FF] px-4 py-1.5 h-9 shadow-sm"
                          @click="handleViewTaskDetail"
                        >
                          {{ $t("taskManagement.viewExamDetails") }}
                        </MButton>

                        <!-- Withdraw -->
                        <MButton
                          class="!bg-white !text-[#FF4D4F] !border-gray-200 hover:!bg-red-50 hover:!border-red-200 px-4 py-1.5 h-9 shadow-sm"
                          @click="showWithdrawModal = true"
                        >
                          {{
                            isAssessmentTab
                              ? $t("taskManagement.withdrawExamPaper")
                              : $t("taskManagement.withdrawTask")
                          }}
                        </MButton>

                        <!-- Batch Operation -->
                        <MButton
                          v-if="!isAssessmentTab"
                          class="!bg-white !text-gray-600 !border-gray-200 hover:!bg-gray-50 px-4 py-1.5 h-9 shadow-sm"
                          @click="enterBatchMode"
                        >
                          {{ $t("taskManagement.batchOperation") }}
                        </MButton>

                        <!-- Refresh Button with Tooltip -->
                        <div class="relative group">
                          <MButton
                            class="!bg-white !text-[#FF9900] !border-gray-200 hover:!bg-orange-50 hover:!border-[#FF9900] px-4 py-1.5 h-9 shadow-sm"
                            @click="handleRefreshList"
                          >
                            {{ $t("taskManagement.refreshList") }}
                          </MButton>
                          <!-- Tooltip -->
                          <div
                            class="absolute top-full right-0 mt-2 z-[9999] hidden group-hover:block pointer-events-none"
                          >
                            <div
                              class="bg-black/90 text-white text-sm px-4 py-2.5 rounded-md shadow-lg relative text-center whitespace-nowrap"
                            >
                              <!-- Arrow -->
                              <div
                                class="absolute -top-1 right-8 w-2 h-2 bg-black/90 rotate-45"
                              ></div>
                              {{ $t("taskManagement.refreshTip") }}
                            </div>
                          </div>
                        </div>
                      </template>
                    </template>

                    <!-- Upload / AI Practice Task Actions: Withdraw, Refresh -->
                    <template
                      v-else-if="isUploadTask || isFreeCodingLikeTask || isAiPracticeTask"
                    >
                      <!-- Withdraw -->
                      <MButton
                        class="!bg-white !text-[#FF4D4F] !border-gray-200 hover:!bg-red-50 hover:!border-red-200 px-4 py-1.5 h-9 shadow-sm"
                        @click="showWithdrawModal = true"
                      >
                        {{ $t("taskManagement.withdrawTask") }}
                      </MButton>

                      <!-- Refresh Button with Tooltip -->
                      <div class="relative group">
                        <button
                          class="px-4 py-1.5 h-9 bg-white text-[#FF9900] border border-gray-200 text-sm rounded-md hover:bg-orange-50 hover:border-[#FF9900] transition-colors font-medium shadow-sm"
                          @click="handleRefreshList"
                        >
                          {{ $t("taskManagement.refreshList") }}
                        </button>
                        <!-- Tooltip -->
                        <div
                          class="absolute top-full right-0 mt-2 z-50 hidden group-hover:block w-max max-w-[200px] whitespace-normal text-center"
                        >
                          <div
                            class="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-md shadow-lg relative"
                          >
                            <div
                              class="absolute -top-1 right-6 w-2 h-2 bg-black/80 rotate-45"
                            ></div>
                            {{ $t("taskManagement.refreshTip") }}
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Training Task Actions: Badge, Refresh, More Actions -->
                    <template v-else>
                      <!-- QA Assistant Status -->
                      <div
                        class="px-3 py-1.5 bg-gray-50 text-gray-400 text-sm rounded-md border border-gray-200 flex items-center gap-2 cursor-not-allowed select-none h-9"
                      >
                        <span
                          class="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium"
                          >AI</span
                        >
                        {{ $t("taskManagement.qaPushed") }}
                      </div>

                      <!-- Refresh Button with Tooltip -->
                      <div class="relative group">
                        <button
                          class="px-4 py-1.5 h-9 bg-white text-[#FF9900] border border-gray-200 text-sm rounded-md hover:bg-orange-50 hover:border-[#FF9900] transition-colors font-medium shadow-sm"
                          @click="handleRefreshList"
                        >
                          {{ $t("taskManagement.refreshList") }}
                        </button>
                        <!-- Tooltip -->
                        <div
                          class="absolute top-full right-0 mt-2 z-50 hidden group-hover:block w-max max-w-[200px] whitespace-normal text-center"
                        >
                          <div
                            class="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-md shadow-lg relative"
                          >
                            <div
                              class="absolute -top-1 right-6 w-2 h-2 bg-black/80 rotate-45"
                            ></div>
                            {{ $t("taskManagement.refreshTip") }}
                          </div>
                        </div>
                      </div>

                      <!-- More Actions Dropdown -->
                      <div class="w-[105px]">
                        <MSelect
                          v-model="moreActionValue"
                          :options="moreActionOptions"
                          :placeholder="$t('taskManagement.moreActions')"
                          trigger="hover"
                          placement="bottom-center"
                          dropdown-class="w-[160px]"
                          @update:model-value="handleMoreAction"
                        />
                      </div>
                    </template>
                  </div>
                </div>

                <!-- Table -->
                <div class="flex-1 flex flex-col min-h-0 bg-white">
                  <!-- Blue Hint Bar for Upload Tasks -->
                  <!-- <div v-if="(isUploadTask || isFreeCodingLikeTask) && isTaskIssued" class="mx-6 mt-4 px-4 py-2.5 bg-[#E6F7FF] border border-[#91D5FF] rounded-md flex items-center gap-2">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#1890FF] shrink-0">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                     </svg>
                     <span class="text-sm text-[#1890FF]">{{ $t('taskManagement.uploadTaskHint') }}</span>
                  </div> -->

                  <div
                    class="flex-1 px-6 py-4 overflow-hidden flex flex-col min-h-0 relative"
                  >
                    <!-- Loading Overlay -->
                    <div
                      v-if="refreshing"
                      class="absolute inset-0 z-20 bg-white/70 flex items-center justify-center rounded-lg"
                    >
                      <div class="flex flex-col items-center gap-2">
                        <svg
                          class="animate-spin h-8 w-8 text-[#FF9900]"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          />
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      </div>
                    </div>
                    <MTable
                      :columns="currentColumns"
                      :data="groupTaskData"
                      class="rounded-lg overflow-hidden border border-gray-100 task-student-table"
                      :show-index="true"
                      :selectable="isBatchMode && isExerciseTask"
                      :selected-keys="selectedRowKeys"
                      :selectable-filter="batchSelectableFilter"
                      @select="handleTableSelect"
                      @select-all="handleTableSelectAll"
                    >
                      <!-- Custom Header for Submission Status Filter -->
                      <template #header-submissionStatus="{ column }">
                        <MFilterPopover
                          v-model="submissionFilter"
                          :options="submissionFilterOptions"
                        >
                          <template #trigger>
                            <div
                              class="flex items-center justify-center gap-1 cursor-pointer hover:text-[#FF9900] transition-colors"
                            >
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
                                class="transition-transform duration-200 group-hover:rotate-180"
                              >
                                <path d="M1 1l4 4 4-4" />
                              </svg>
                            </div>
                          </template>
                        </MFilterPopover>
                      </template>

                      <!-- Custom Header for Grade with Tooltip -->
                      <template #header-grade="{ column }">
                        <div
                          class="relative group flex items-center justify-center gap-1"
                        >
                          <span>{{ column.title }}</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#999"
                            stroke-width="2"
                            class="cursor-help"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <!-- Grade Tooltip -->
                          <div
                            class="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 hidden group-hover:block"
                          >
                            <div
                              class="bg-black/90 text-white text-xs px-4 py-3 rounded-md shadow-lg relative text-center w-[280px]"
                            >
                              <!-- Arrow -->
                              <div
                                class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45"
                              ></div>
                              <div class="mb-2 leading-relaxed">
                                {{ $t("taskManagement.gradeTooltipTitle") }}
                              </div>
                              <div class="space-y-0.5 text-gray-300">
                                <div>[1%-10%] 0.5颗</div>
                                <div>[11%-20%] 1颗</div>
                                <div>[21%-30%] 1.5颗</div>
                                <div>[31%-40%] 2颗</div>
                                <div>[41%-50%] 2.5颗</div>
                                <div>[51%-60%] 3颗</div>
                                <div>[61%-70%] 3.5颗</div>
                                <div>[71%-80%] 4颗</div>
                                <div>[81%-90%] 4.5颗</div>
                                <div>[91%-100%] 5颗</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>

                      <!-- Custom Cell for Submission Status -->
                      <template #cell-submissionStatus="{ row }">
                        <span
                          class="px-2 py-1 rounded text-xs"
                          :class="
                            row.submissionStatus === 'submitted'
                              ? 'bg-[#E6F7FF] text-[#1890FF]'
                              : 'bg-[#FFF1F0] text-[#FF4D4F]'
                          "
                        >
                          {{
                            row.submissionStatus === "submitted"
                              ? $t("taskManagement.submitted")
                              : $t("taskManagement.unsubmitted")
                          }}
                        </span>
                      </template>

                      <!-- Custom Cell for Score/Total -->
                      <template #cell-scoreTotal="{ row }">
                        <span class="text-sm text-gray-600">{{
                          row.scoreTotal || "-"
                        }}</span>
                      </template>

                      <template #cell-reviewStatus="{ row }">
                        <span
                          class="px-2 py-1 rounded text-xs"
                          :class="
                            row.reviewStatus === 'reviewed'
                              ? 'bg-[#E6F7FF] text-[#1890FF]'
                              : 'bg-[#FFF7E6] text-[#FA8C16]'
                          "
                        >
                          {{
                            row.reviewStatus === "reviewed"
                              ? $t("taskManagement.reviewed")
                              : $t("taskManagement.unreviewed")
                          }}
                        </span>
                      </template>

                      <!-- Custom Cell for Grade (Star Rating) -->
                      <template #cell-grade="{ row }">
                        <StarRating
                          :model-value="row.grade || 0"
                          :size="16"
                          wrapper-class="justify-center"
                          readonly
                        />
                      </template>

                      <!-- Custom Cell for Teacher Score (Star Rating) -->
                      <template #cell-teacherScore="{ row }">
                        <span class="text-sm text-gray-600">
                          {{ formatTeacherScoreDisplay(row.teacherScore) }}
                        </span>
                      </template>

                      <!-- Custom Cell for Actions -->
                      <template #cell-action="{ row }">
                        <div
                          class="flex flex-nowrap items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <template
                            v-if="isAssessmentTab && row.submissionStatus === 'submitted'"
                          >
                            <button
                              class="inline-flex h-8 min-w-[88px] shrink-0 items-center justify-center rounded-md bg-[#FF9900] px-3 text-sm font-medium text-white whitespace-nowrap transition-colors hover:bg-[#f39000]"
                              @click="handleViewAndGrade(row)"
                            >
                              {{ $t("taskManagement.reviewAndView") }}
                            </button>
                            <button
                              class="inline-flex h-8 min-w-[88px] shrink-0 items-center justify-center rounded-md border border-[#FF9900] bg-white px-3 text-sm font-medium text-[#FF9900] whitespace-nowrap transition-colors hover:bg-[#FFF7E6]"
                              @click="openAssessmentActionModal(row)"
                            >
                              {{ getAssessmentActionLabel(row) }}
                            </button>
                          </template>
                          <!-- Custom Exercise: 查看 + 打回重做 -->
                          <template
                            v-else-if="
                              isExerciseTask && row.submissionStatus === 'submitted'
                            "
                          >
                            <button
                              class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                              @click="handleViewAndGrade(row)"
                            >
                              {{ $t("taskManagement.view") }}
                            </button>
                            <button
                              class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                              @click="handleReturnToRedo(row)"
                            >
                              {{ $t("taskManagement.returnToRedo") }}
                            </button>
                          </template>
                          <!-- Free Coding: 查看并评分 -->
                          <template
                            v-else-if="
                              isFreeCodingLikeTask && row.submissionStatus === 'submitted'
                            "
                          >
                            <button
                              class="px-4 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                              @click="handleViewAndScore(row)"
                            >
                              {{ $t("taskManagement.viewAndScore") }}
                            </button>
                          </template>
                        </div>
                      </template>

                      <template #empty>
                        <div class="flex flex-col items-center justify-center py-20">
                          <!-- Empty State Icon matching screenshot -->
                          <div
                            class="w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full flex items-center justify-center mb-4 relative"
                          >
                            <!-- Document with magnifier icon -->
                            <svg
                              width="56"
                              height="56"
                              viewBox="0 0 64 64"
                              fill="none"
                              class="text-[#91D5FF]"
                            >
                              <!-- Document base -->
                              <rect
                                x="12"
                                y="8"
                                width="32"
                                height="40"
                                rx="4"
                                fill="#E6F7FF"
                                stroke="#91D5FF"
                                stroke-width="2"
                              />
                              <!-- Document lines -->
                              <path
                                d="M20 18h16M20 26h12M20 34h8"
                                stroke="#91D5FF"
                                stroke-width="2"
                                stroke-linecap="round"
                              />
                              <!-- Magnifier circle -->
                              <circle
                                cx="44"
                                cy="44"
                                r="12"
                                fill="#E6F7FF"
                                stroke="#91D5FF"
                                stroke-width="2"
                              />
                              <!-- Magnifier handle -->
                              <path
                                d="M52 52l6 6"
                                stroke="#91D5FF"
                                stroke-width="3"
                                stroke-linecap="round"
                              />
                              <!-- Check mark in magnifier -->
                              <path
                                d="M39 44l3 3 6-6"
                                stroke="#69C0FF"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </div>
                          <div class="text-gray-400 text-sm">
                            {{ $t("common.noData") }}
                          </div>
                        </div>
                      </template>
                    </MTable>
                  </div>

                  <!-- Batch Operation Footer Bar -->
                  <div
                    v-if="isBatchMode && isExerciseTask"
                    class="shrink-0 border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <label
                        class="flex items-center gap-2 cursor-pointer text-sm text-gray-600"
                      >
                        <div
                          class="w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors"
                          :class="
                            isAllSelected
                              ? 'bg-[#FF9900] border-[#FF9900]'
                              : 'border-gray-300 bg-white'
                          "
                          @click="handleSelectAllCheckbox"
                        >
                          <svg
                            v-if="isAllSelected"
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            fill="none"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        </div>
                        {{ $t("class.selectAll") }}
                      </label>
                      <span class="text-sm text-gray-500">
                        {{
                          $t("taskManagement.selectedCount", {
                            count: selectedRowKeys.length,
                          })
                        }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3">
                      <button
                        class="flex items-center gap-1.5 px-4 py-1.5 text-sm text-[#FF9900] hover:text-[#e68a00] transition-colors"
                        @click="handleBatchReturnToRedo"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                        {{ $t("taskManagement.batchReturnToRedo") }}
                      </button>
                      <button
                        class="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        @click="exitBatchMode"
                      >
                        {{ $t("user.cancelBatchOperation") }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State for AI Chat Model (Task Not Issued) -->
              <div
                v-else
                class="flex-1 flex items-center justify-center w-full h-full bg-white"
              >
                <div
                  class="flex w-full max-w-[560px] flex-col items-center px-6 text-center"
                >
                  <template v-if="isAssessmentTab">
                    <Transition name="icon-fade" mode="out-in">
                      <div
                        :key="selectedTaskKey"
                        class="mb-[26px] flex h-[170px] w-[170px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(197,237,255,0.95),rgba(226,245,255,0.82)_58%,rgba(255,255,255,0)_59%)]"
                      >
                        <svg width="118" height="118" viewBox="0 0 118 118" fill="none">
                          <circle
                            cx="59"
                            cy="59"
                            r="50"
                            fill="url(#assessment-empty-bg)"
                          />
                          <g filter="url(#assessment-empty-shadow)">
                            <rect
                              x="37"
                              y="30"
                              width="42"
                              height="56"
                              rx="8"
                              transform="rotate(-4 37 30)"
                              fill="white"
                            />
                            <path
                              d="M49 47H69"
                              stroke="#7ABEFF"
                              stroke-width="4.5"
                              stroke-linecap="round"
                            />
                            <path
                              d="M48 58H68"
                              stroke="#7ABEFF"
                              stroke-width="4.5"
                              stroke-linecap="round"
                            />
                            <path
                              d="M47 69H61"
                              stroke="#7ABEFF"
                              stroke-width="4.5"
                              stroke-linecap="round"
                            />
                          </g>
                          <g filter="url(#assessment-empty-pen-shadow)">
                            <path
                              d="M78.4 68.4L87.8 77.8L71.6 94L62.2 94.6L62.8 85.2L78.4 68.4Z"
                              fill="#69B8FF"
                            />
                            <path
                              d="M61.8 85.8L70.4 94.4"
                              stroke="#3A9CFF"
                              stroke-width="3.4"
                              stroke-linecap="round"
                            />
                          </g>
                          <circle cx="86" cy="33" r="12" fill="white" />
                          <path
                            d="M82.5 36.5L89.5 29.5"
                            stroke="#A4D4FF"
                            stroke-width="3"
                            stroke-linecap="round"
                          />
                          <defs>
                            <linearGradient
                              id="assessment-empty-bg"
                              x1="24"
                              y1="22"
                              x2="98"
                              y2="96"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#D8F2FF" />
                              <stop offset="1" stop-color="#9ED1FF" />
                            </linearGradient>
                            <filter
                              id="assessment-empty-shadow"
                              x="28"
                              y="22"
                              width="60"
                              height="73"
                              filterUnits="userSpaceOnUse"
                              color-interpolation-filters="sRGB"
                            >
                              <feFlood flood-opacity="0" result="BackgroundImageFix" />
                              <feColorMatrix
                                in="SourceAlpha"
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                result="hardAlpha"
                              />
                              <feOffset dy="3" />
                              <feGaussianBlur stdDeviation="3" />
                              <feColorMatrix
                                type="matrix"
                                values="0 0 0 0 0.47451 0 0 0 0 0.745098 0 0 0 0 1 0 0 0 0.22 0"
                              />
                              <feBlend
                                mode="normal"
                                in2="BackgroundImageFix"
                                result="effect1_dropShadow_1_1"
                              />
                              <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="effect1_dropShadow_1_1"
                                result="shape"
                              />
                            </filter>
                            <filter
                              id="assessment-empty-pen-shadow"
                              x="56"
                              y="64"
                              width="38"
                              height="38"
                              filterUnits="userSpaceOnUse"
                              color-interpolation-filters="sRGB"
                            >
                              <feFlood flood-opacity="0" result="BackgroundImageFix" />
                              <feColorMatrix
                                in="SourceAlpha"
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                result="hardAlpha"
                              />
                              <feOffset dy="2" />
                              <feGaussianBlur stdDeviation="2" />
                              <feColorMatrix
                                type="matrix"
                                values="0 0 0 0 0.231373 0 0 0 0 0.611765 0 0 0 0 1 0 0 0 0.28 0"
                              />
                              <feBlend
                                mode="normal"
                                in2="BackgroundImageFix"
                                result="effect1_dropShadow_1_1"
                              />
                              <feBlend
                                mode="normal"
                                in="SourceGraphic"
                                in2="effect1_dropShadow_1_1"
                                result="shape"
                              />
                            </filter>
                          </defs>
                        </svg>
                      </div>
                    </Transition>

                    <h2
                      class="mb-[16px] text-[24px] font-bold leading-none text-[#122B49]"
                    >
                      {{ $t("taskManagement.assessmentNotIssued") }}
                    </h2>
                    <p
                      class="mb-[42px] max-w-[560px] text-[14px] leading-[2.1] text-[#364A63]"
                    >
                      {{ $t("taskManagement.assessmentNotIssuedDesc") }}
                    </p>

                    <div class="flex items-center gap-5">
                      <MButton
                        type="primary"
                        class="!h-[40px] !w-[118px] !rounded-[8px] !border-0 !bg-[#39A9FF] !px-0 !text-[16px] !font-medium !text-white hover:!bg-[#249dff]"
                        @click="openIssueModal"
                      >
                        {{ $t("taskManagement.issueExam") }}
                      </MButton>

                      <MButton
                        class="!h-[40px] !w-[118px] !rounded-[8px] !border !border-[#A8D7FF] !bg-white !px-0 !text-[16px] !font-medium !text-[#39A9FF] hover:!border-[#7EC4FF] hover:!bg-[#F3FAFF]"
                        @click="handleViewTaskDetail"
                      >
                        {{ $t("taskManagement.viewExamFile") }}
                      </MButton>
                    </div>
                  </template>

                  <template v-else>
                    <Transition name="icon-fade" mode="out-in">
                      <svg
                        :key="selectedTaskKey"
                        width="100"
                        height="100"
                        viewBox="0 0 64 64"
                        fill="none"
                        class="mb-[34px] text-black"
                      >
                        <rect
                          x="16"
                          y="9"
                          width="24"
                          height="36"
                          rx="4.8"
                          stroke="currentColor"
                          stroke-width="3.6"
                        />
                        <path
                          d="M23 19h10M21 27.5h14M23 36h8"
                          stroke="currentColor"
                          stroke-width="3.6"
                          stroke-linecap="round"
                        />
                        <circle
                          cx="43"
                          cy="39"
                          r="11"
                          fill="white"
                          stroke="currentColor"
                          stroke-width="3.6"
                        />
                        <path
                          d="M38.7 39.2l2.9 3.1 6-7"
                          stroke="currentColor"
                          stroke-width="3.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </Transition>

                    <h2
                      class="mb-[22px] text-[24px] font-bold leading-none text-[#122B49]"
                    >
                      {{ $t("taskManagement.taskNotIssued") }}
                    </h2>
                    <p
                      class="mb-[48px] max-w-[500px] text-[14px] leading-[2.3] text-[#364A63]"
                    >
                      {{ $t("taskManagement.taskNotIssuedDesc") }}
                    </p>

                    <div class="flex items-center gap-[22px]">
                      <MButton
                        type="primary"
                        class="!h-[40px] !w-[122px] !rounded-[4px] !border-0 !bg-[#FF9F14] !px-0 !text-[16px] !font-medium !text-white hover:!bg-[#f39000]"
                        @click="openIssueModal"
                      >
                        {{ $t("taskManagement.issueTask") }}
                      </MButton>

                      <MButton
                        class="!h-[40px] !w-[122px] !rounded-[4px] !border !border-[#D9DEE7] !bg-white !px-0 !text-[16px] !font-medium !text-[#2F3D52] hover:!border-[#c7ced8] hover:!bg-[#f8fafc]"
                        @click="handleViewTaskDetail"
                      >
                        {{ $t("taskManagement.viewDetails") }}
                      </MButton>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TaskIssueModal
      v-model="showIssueModal"
      :class-name="currentClassName"
      :task-name="currentTaskLabel"
      :has-ai-settings="!isUploadTask && !isExerciseTask"
      :is-free-coding="isFreeCoding"
      :editor-name="selectedEditor"
      @confirm-group="handleIssueGroup"
      @confirm-student="handleIssueStudent"
    />

    <AssessmentIssueExamModal
      v-model:visible="showAssessmentIssueModal"
      :course-id="String(filters.course || '')"
      :class-id="String(filters.class || '')"
      :exercise-id="currentExerciseId"
      :title="assessmentIssueModalTitle"
      :submit-text="assessmentIssueModalSubmitText"
      @submit="handleAssessmentIssueSubmit"
    />

    <TaskWithdrawModal v-model="showWithdrawModal" @confirm="handleWithdrawConfirm" />

    <ExerciseDetailModal
      v-model="showExerciseDetailModal"
      :exercise-id="currentExerciseId"
      :evaluation-id="currentEvaluationId"
      :task-id="viewTaskId"
      :detail-source="exerciseDetailSource"
    />

    <div
      v-if="showTaskAiIframeModal"
      class="iframe-modal-overlay"
      @click.self="closeTaskAiIframeModal"
    >
      <div class="iframe-modal-container">
        <div class="iframe-modal-header">
          <span class="iframe-modal-title">{{
            currentTaskAiProjectName || currentTaskLabel
          }}</span>
          <button class="iframe-close-btn" @click="closeTaskAiIframeModal">
            <svg
              width="20"
              height="20"
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
        <div class="iframe-modal-body">
          <div v-if="taskAiIframeLoading" class="iframe-loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">{{ $t("common.loading") }}</span>
          </div>
          <iframe
            ref="taskAiIframeRef"
            :src="currentTaskAiUrl"
            class="tool-iframe"
            :class="{ hidden: taskAiIframeLoading }"
            frameborder="0"
            allowfullscreen
            allow="camera; microphone; bluetooth; serial"
            @load="onTaskAiIframeLoad"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showTaskToolIframeModal"
      class="iframe-modal-overlay"
      @click.self="closeTaskToolIframeModal"
    >
      <div class="iframe-modal-container">
        <div class="iframe-modal-header">
          <span class="iframe-modal-title">{{
            currentTaskToolName || currentTaskLabel
          }}</span>
          <button class="iframe-close-btn" @click="closeTaskToolIframeModal">
            <svg
              width="20"
              height="20"
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
        <div class="iframe-modal-body">
          <div v-if="taskToolIframeLoading" class="iframe-loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">{{ $t("common.loading") }}</span>
          </div>
          <iframe
            ref="taskToolIframeRef"
            :src="currentTaskToolUrl"
            class="tool-iframe"
            :class="{ hidden: taskToolIframeLoading }"
            frameborder="0"
            allowfullscreen
            allow="camera; microphone; bluetooth; serial"
            @load="onTaskToolIframeLoad"
          />
        </div>
      </div>
    </div>

    <ViewAndScoreModal
      :visible="showViewScoreModal"
      :row-data="currentScoreRow"
      :detail-data="currentProgrammingTaskDetail"
      :loading="viewScoreLoading"
      :can-open-editor="!!currentProgrammingTaskDetail?.taskUrl"
      :has-next-submission="hasNextSubmission"
      @close="handleViewScoreClose"
      @open-editor="handleOpenProgrammingEditor"
      @save="handleScoreSave"
      @next="handleScoreNext"
    />

    <!-- 打回重做确认弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showReturnToRedoModal"
          class="fixed inset-0 z-[1000] flex items-center justify-center"
        >
          <div
            class="absolute inset-0 bg-black/50"
            @click="showReturnToRedoModal = false"
          />
          <div class="relative bg-white rounded-lg w-[420px] p-6">
            <button
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              @click="showReturnToRedoModal = false"
            >
              <svg
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <h3 class="text-lg font-bold text-center mb-6">
              {{ $t("taskManagement.returnToRedoConfirmTitle") }}
            </h3>
            <p class="text-center text-gray-600 mb-8 whitespace-pre-line">
              {{ $t("taskManagement.returnToRedoConfirmContent") }}
            </p>
            <div class="flex justify-center gap-4">
              <button
                class="px-8 py-2 border border-[#FF9900] text-[#FF9900] rounded hover:bg-[#FFF7E6]"
                @click="showReturnToRedoModal = false"
              >
                {{ $t("common.cancel") }}
              </button>
              <button
                class="px-8 py-2 bg-[#FF9900] text-white rounded hover:bg-[#e68a00]"
                @click="confirmReturnToRedo"
              >
                {{ $t("common.confirm") }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useI18n } from "vue-i18n";
import { aiAdmin } from "~/composables/api/ai";
import { cursorAdmin } from "~/composables/api/curosr";
import { taskmanagementcenterApi } from "~/composables/api/taskmanagement";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";
import { scoreToStars } from "~/utils/star-rating";
import tool1Cover from "~/assets/images/tool1.png";
import tool5Cover from "~/assets/images/tool5.svg";
const { t, locale } = useI18n();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const taskApi = taskmanagementcenterApi();
const { startDistribute, withdrawExam } = cursorAdmin();
const { ssoLogin, createAi, updateAi } = aiAdmin();
const {
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  toUploadFile,
  uploadFileToOSS,
  downloadFileFromOSS,
  isMessageFromIframe,
  postFileBufferToIframe,
} = useIframeFileBridge();

// --- Filter Data & State ---
const filters = ref({
  class: null as string | null,
  course: null as string | null,
  topic: null as string | null,
});

// 接口返回的原始数据
const chapterData = ref<any[]>([]);

// 班级选项 - 从接口数据中提取
const classOptions = computed(() => {
  return chapterData.value.map((item: any) => ({
    label: item.className,
    value: item.classId,
  }));
});

// 课程选项 - 根据选中的班级过滤
const courseOptions = computed(() => {
  if (!filters.value.class) return [];
  const classItem = chapterData.value.find(
    (item: any) => item.classId === filters.value.class
  );
  if (!classItem?.courseList) return [];
  return classItem.courseList.map((course: any) => ({
    label: course.courseName,
    value: course.courseId,
  }));
});

// 章节选项 - 根据选中的课程过滤
const topicOptions = computed(() => {
  if (!filters.value.class || !filters.value.course) return [];
  const classItem = chapterData.value.find(
    (item: any) => item.classId === filters.value.class
  );
  if (!classItem?.courseList) return [];
  const courseItem = classItem.courseList.find(
    (c: any) => c.courseId === filters.value.course
  );
  if (!courseItem?.chapterList) return [];
  return courseItem.chapterList.map((chapter: any) => ({
    label: chapter.chapterName,
    value: chapter.chapterId,
  }));
});

// 班级变化 → 默认选中第一个课程和章节
const handleClassChange = (classId: string | number | null) => {
  filters.value.course = null;
  filters.value.topic = null;
  if (!classId) return;
  const classItem = chapterData.value.find((item: any) => item.classId === classId);
  if (classItem?.courseList?.length > 0) {
    filters.value.course = classItem.courseList[0].courseId;
    if (isAssessmentTab.value) {
      return;
    }
    if (classItem.courseList[0].chapterList?.length > 0) {
      filters.value.topic = classItem.courseList[0].chapterList[0].chapterId;
    }
  }
};

// 课程变化 → 默认选中第一个章节
const handleCourseChange = (courseId: string | number | null) => {
  filters.value.topic = null;
  if (!courseId || !filters.value.class) return;
  if (isAssessmentTab.value) return;
  const classItem = chapterData.value.find(
    (item: any) => item.classId === filters.value.class
  );
  const courseItem = classItem?.courseList?.find((c: any) => c.courseId === courseId);
  if (courseItem?.chapterList?.length > 0) {
    filters.value.topic = courseItem.chapterList[0].chapterId;
  }
};

// 加载三级联动数据
const fetchChapterData = async () => {
  try {
    const data = await taskApi.getChapter();
    chapterData.value = data || [];
    // 默认选中第一个班级
    if (chapterData.value.length > 0) {
      filters.value.class = chapterData.value[0].classId;
      // 默认选中第一个课程
      const firstClass = chapterData.value[0];
      if (firstClass.courseList?.length > 0) {
        filters.value.course = firstClass.courseList[0].courseId;
        // 默认选中第一个章节
        if (firstClass.courseList[0].chapterList?.length > 0) {
          filters.value.topic = firstClass.courseList[0].chapterList[0].chapterId;
        }
      }
    }
  } catch (error) {
    console.error("获取授课章节数据失败", error);
  }
};

// --- Sidebar Data & State ---
const activeTab = ref("tasks");
const tabs = computed(() => [
  { label: t("taskManagement.courseTasks"), value: "tasks" },
  { label: t("taskManagement.courseAssessment"), value: "assessment" },
]);
const isAssessmentTab = computed(() => activeTab.value === "assessment");

const selectedTaskKey = ref<string | number>("");
const expandedKeys = ref<(string | number)[]>([]);

// 任务列表原始数据
const taskListData = ref<any[]>([]);

// 从接口数据构建树形结构
const treeData = computed(() => {
  return taskListData.value.map((category: any) => ({
    id: `category_${category.resourceCategory}`,
    label: category.resourceName,
    children: (category.resourceList || []).map((resource: any) => ({
      id: resource.resourceId,
      label: resource.fileName || resource.resourceName,
      ...resource,
    })),
  }));
});

const hasSidebarTasks = computed(() => {
  return taskListData.value.some(
    (category: any) =>
      Array.isArray(category?.resourceList) && category.resourceList.length > 0
  );
});

const clearCurrentListState = () => {
  taskListData.value = [];
  expandedKeys.value = [];
  selectedTaskKey.value = "";
  groupTaskData.value = [];
  isBatchMode.value = false;
  selectedRowKeys.value = [];
};

const applyTaskListData = (list: any[]) => {
  taskListData.value = list;
  expandedKeys.value = taskListData.value.map(
    (c: any) => `category_${c.resourceCategory}`
  );

  const currentKey = String(selectedTaskKey.value || "");
  let matchedTask: any = null;
  if (currentKey) {
    for (const category of taskListData.value) {
      const found = (category.resourceList || []).find(
        (r: any) => String(r.resourceId) === currentKey
      );
      if (found) {
        matchedTask = found;
        break;
      }
    }
  }

  if (matchedTask) {
    selectedTaskKey.value = matchedTask.resourceId;
    if (isIssuedDistributeType(matchedTask.distributeType)) {
      fetchStudentTaskList();
    } else {
      groupTaskData.value = [];
    }
    return;
  }

  if (taskListData.value.length > 0 && taskListData.value[0].resourceList?.length > 0) {
    const firstTask = taskListData.value[0].resourceList[0];
    selectedTaskKey.value = firstTask.resourceId;
    if (isIssuedDistributeType(firstTask.distributeType)) {
      fetchStudentTaskList();
    } else {
      groupTaskData.value = [];
    }
    return;
  }

  selectedTaskKey.value = "";
  groupTaskData.value = [];
};

// 加载任务列表
const fetchTaskList = async () => {
  if (!filters.value.topic) return;
  try {
    const data = await taskApi.getTaskList({
      chapterId: String(filters.value.topic),
      classId: String(filters.value.class || ""),
    });
    applyTaskListData(data || []);
  } catch (error) {
    console.error("获取任务列表失败", error);
    clearCurrentListState();
  }
};

const normalizeEvaluationItem = (item: any) => {
  const exerciseId = String(
    item?.exerciseId ?? item?.resourceId ?? item?.id ?? item?.evaluationId ?? ""
  ).trim();
  const status = Number(item?.status ?? 0);
  return {
    ...item,
    resourceId: exerciseId,
    exerciseId,
    fileName: item?.exerciseName || item?.resourceName || item?.fileName || "-",
    resourceName: item?.exerciseName || item?.resourceName || item?.fileName || "-",
    resourceCategory: 11,
    distributeType: status > 0 ? 1 : null,
  };
};

const fetchEvaluationList = async () => {
  const courseId = String(filters.value.course || "").trim();
  const classId = String(filters.value.class || "").trim();
  if (!courseId || !classId) {
    clearCurrentListState();
    return;
  }
  try {
    const data = await taskApi.getEvaluationList({ courseId, classId });
    const normalizedList = (Array.isArray(data) ? data : [])
      .map((group: any, index: number) => {
        const resourceList = (Array.isArray(group?.evaluationList)
          ? group.evaluationList
          : []
        ).map((item: any) => ({
          ...normalizeEvaluationItem(item),
          evaluationCategory: group?.evaluationCategory,
        }));

        return {
          resourceCategory: 11,
          resourceName:
            group?.evaluationName ||
            group?.resourceName ||
            `${t("taskManagement.courseAssessment")}${index + 1}`,
          evaluationCategory: group?.evaluationCategory,
          resourceList,
        };
      })
      .filter(
        (group: any) =>
          Array.isArray(group?.resourceList) && group.resourceList.length > 0
      );
    applyTaskListData(normalizedList);
  } catch (error) {
    console.error("获取测评列表失败", error);
    clearCurrentListState();
  }
};

const loadCurrentTabList = async () => {
  if (isAssessmentTab.value) {
    await fetchEvaluationList();
    return;
  }

  if (!filters.value.topic) {
    clearCurrentListState();
    return;
  }

  await fetchTaskList();
};

watch(
  () => activeTab.value,
  (tab) => {
    if (tab !== "tasks") return;
    if (filters.value.topic) return;
    if (!filters.value.class || !filters.value.course) return;

    const classItem = chapterData.value.find(
      (item: any) => item.classId === filters.value.class
    );
    const courseItem = classItem?.courseList?.find(
      (item: any) => item.courseId === filters.value.course
    );
    if (courseItem?.chapterList?.length > 0) {
      filters.value.topic = courseItem.chapterList[0].chapterId;
    }
  }
);

watch(
  [
    () => activeTab.value,
    () => filters.value.class,
    () => filters.value.course,
    () => filters.value.topic,
  ],
  async () => {
    if (!filters.value.class || !filters.value.course) {
      clearCurrentListState();
      return;
    }

    if (!isAssessmentTab.value && !filters.value.topic) {
      clearCurrentListState();
      return;
    }

    await loadCurrentTabList();
  }
);

const handleNodeSelect = (node: any) => {
  // 分类节点仅用于展开，不作为任务项选择
  if (node?.children !== undefined) {
    return;
  }
  selectedTaskKey.value = node.id;
  // 如果任务已下发，加载学生任务列表；否则清空
  if (isIssuedDistributeType(node.distributeType)) {
    fetchStudentTaskList();
  } else {
    groupTaskData.value = [];
  }
};

const handleNodeExpand = (key: string | number, expanded: boolean) => {
  if (expanded) {
    if (!expandedKeys.value.includes(key)) {
      expandedKeys.value.push(key);
    }
  } else {
    expandedKeys.value = expandedKeys.value.filter((k) => k !== key);
  }
};

import { ElMessage } from "element-plus";

// --- Main Content Data & State ---
const selectedEditor = ref("vincibot");
const showIssueModal = ref(false);
const showAssessmentIssueModal = ref(false);
const freeCodingIssuing = ref(false);
const distributeTypeOverrides = ref<Record<string, number>>({});
const showTaskAiIframeModal = ref(false);
const taskAiIframeLoading = ref(true);
const currentTaskAiUrl = ref("");
const currentTaskAiProjectName = ref("");
const currentTaskAiToolKey = ref("");
const currentTaskAiOptType = ref("");
const currentTaskAiOptId = ref("");
const currentTaskAiFile = ref<File | null>(null);
const taskAiIframeRef = ref<HTMLIFrameElement | null>(null);
const showTaskToolIframeModal = ref(false);
const taskToolIframeLoading = ref(true);
const currentTaskToolUrl = ref("");
const currentTaskToolName = ref("");
const currentTaskToolFile = ref<File | null>(null);
const taskToolIframeRef = ref<HTMLIFrameElement | null>(null);

const pushTaskToolDebugLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  console.log(`[taskmanagement iframe] [${timestamp}] ${message}`);
};

const setDistributeTypeOverride = (
  resourceId: string | number,
  distributeType: number
) => {
  distributeTypeOverrides.value[String(resourceId)] = distributeType;
};

const clearDistributeTypeOverride = (resourceId: string | number) => {
  delete distributeTypeOverrides.value[String(resourceId)];
};

const isIssuedDistributeType = (distributeType: any) => {
  const dt = Number(distributeType);
  return dt === 1 || dt === 2;
};

// 根据接口返回的 distributeType 判断任务是否已下发
// distributeType: 1=学生, 2=小组, null=未下发
const isTaskIssued = computed({
  get: () => {
    return isIssuedDistributeType(selectedTask.value?.distributeType);
  },
  set: () => {
    // 下发后重新加载任务列表即可
  },
});

const issueTypeFromApi = computed(() => {
  const dt = Number(selectedTask.value?.distributeType);
  if (dt === 2) return "group";
  if (dt === 1) return "student";
  return "group";
});

const editorsList = computed(() => [
  { id: "vincibot", name: "Matatacode\n(VinciBot)", cover: tool1Cover },
  { id: "nous", name: "Matatacode\n(Nous)", cover: tool5Cover },
]);

const handleCustomTask = () => {
  router.push("/taskmanagement/custom-exercise");
};

// Helper to find label by key in treeData
const findLabel = (nodes: any[], key: string | number): string => {
  for (const node of nodes) {
    if (node.id === key) return node.label;
    if (node.children) {
      const found = findLabel(node.children, key);
      if (found) return found;
    }
  }
  return "";
};

const currentTaskLabel = computed(() => {
  return findLabel(treeData.value, selectedTaskKey.value);
});

// 当前选中班级名称
const currentClassName = computed(() => {
  const classItem = chapterData.value.find(
    (item: any) => item.classId === filters.value.class
  );
  return classItem?.className || "";
});

const openIssueModal = () => {
  if (isAssessmentTab.value) {
    assessmentIssueMode.value = "create";
    assessmentIssueEvaluationIds.value = [];
    showAssessmentIssueModal.value = true;
    return;
  }
  showIssueModal.value = true;
};

// 统一解析当前任务可用的资源ID，兼容不同字段命名
function resolveSelectedResourceId(): string | null {
  const task = selectedTask.value as any;
  const candidates = [task?.resourceId, task?.id, task?.taskId, selectedTaskKey.value];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const value = String(candidate).trim();
    if (!value || value.startsWith("category_")) continue;
    return value;
  }
  return null;
}

function resolveSelectedExerciseId(): string | null {
  const task = selectedTask.value as any;
  const candidates = [
    task?.exerciseId,
    task?.resourceId,
    task?.id,
    task?.taskId,
    selectedTaskKey.value,
  ];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const value = String(candidate).trim();
    if (!value || value.startsWith("category_")) continue;
    return value;
  }
  return null;
}

const getCurrentUserId = () => {
  if (!import.meta.client) {
    return "";
  }

  try {
    const rawUserInfo = localStorage.getItem("user_info");
    if (!rawUserInfo) {
      return "";
    }

    const userInfo = JSON.parse(rawUserInfo);
    return userInfo?.user_id || userInfo?.userId || userInfo?.id || "";
  } catch {
    return "";
  }
};

const TASK_AI_TOOL_KEY_MAP: Record<string, string> = {
  image_cls: "imageClassModel",
  audio_cls: "voiceClassModel",
  pose_cls: "poseClassModel",
  gesture_cls: "gestureClassModel",
};

const TASK_AI_TYPE_MAP: Record<string, number> = {
  imageClassModel: 1,
  gestureClassModel: 2,
  voiceClassModel: 3,
  poseClassModel: 4,
};

const resolveSelectedTaskName = () => {
  const task = selectedTask.value as any;
  return (
    task?.taskName ||
    task?.fileName ||
    task?.resourceName ||
    task?.name ||
    currentTaskLabel.value ||
    ""
  );
};

const resolveIssuedTaskName = () => {
  const task = selectedTask.value as any;
  return String(task?.fileName || "").trim();
};

const resolveFreeCodingFileType = (): "vinci" | "nous" =>
  selectedEditor.value === "nous" ? "nous" : "vinci";

const normalizeFreeCodingToolId = (value: unknown): "vincibot" | "nous" | "" => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalizedValue) return "";
  if (normalizedValue.includes("nous")) return "nous";
  if (
    normalizedValue.includes("vincibot") ||
    normalizedValue.includes("vinci") ||
    normalizedValue.includes("ucode4")
  ) {
    return "vincibot";
  }
  return "";
};

const resolveSelectedFreeCodingToolId = (): "vincibot" | "nous" => {
  const task = selectedTask.value as any;
  const candidates = [
    task?.fileType,
    task?.toolType,
    task?.editorType,
    task?.editor,
    task?.fileName,
    task?.taskName,
    task?.resourceName,
    task?.raw?.fileType,
    task?.raw?.toolType,
    task?.raw?.editorType,
    task?.raw?.editor,
    task?.raw?.fileName,
    task?.raw?.taskName,
    task?.raw?.resourceName,
    selectedEditor.value,
  ];

  for (const candidate of candidates) {
    const toolId = normalizeFreeCodingToolId(candidate);
    if (toolId) {
      return toolId;
    }
  }

  return "vincibot";
};

const resolveProgrammingDetailToolId = (detail: any): "vincibot" | "nous" => {
  const candidates = [
    detail?.fileType,
    detail?.toolType,
    detail?.editorType,
    detail?.editor,
    detail?.opus?.opusType,
    detail?.resourceName,
    detail?.taskName,
  ];

  for (const candidate of candidates) {
    const toolId = normalizeFreeCodingToolId(candidate);
    if (toolId) {
      return toolId;
    }
  }

  return "vincibot";
};

const resolveProgrammingDetailFileName = (detail: any) => {
  const taskUrl = String(detail?.taskUrl || detail?.opus?.opusUrl || "").trim();
  const urlFileName = taskUrl.split("/").pop() || "";
  if (/\.[^.]+$/i.test(urlFileName)) {
    return urlFileName;
  }

  const baseName =
    String(
      detail?.taskName || detail?.opus?.opusName || detail?.resourceName || "project"
    ).trim() || "project";
  const ext = resolveProgrammingDetailToolId(detail) === "nous" ? ".sb3" : ".mc";
  return /\.[^.]+$/i.test(baseName) ? baseName : `${baseName}${ext}`;
};

const downloadProgrammingDetailTaskFile = async (detail: any) => {
  const taskUrl = String(detail?.taskUrl || detail?.opus?.opusUrl || "").trim();
  const fileName = resolveProgrammingDetailFileName(detail);

  if (!taskUrl || !/^https?:\/\//i.test(taskUrl)) {
    return null;
  }

  const response = await fetch(taskUrl);
  if (!response.ok) {
    throw new Error(`下载编程任务文件失败: ${response.status}`);
  }

  const blob = await response.blob();
  return new File([blob], fileName, {
    type: blob.type || "application/octet-stream",
    lastModified: Date.now(),
  });
};

const normalizeAiTaskOptType = (value: unknown) => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();
  const typeMap: Record<string, string> = {
    image_cls: "image_cls",
    audio_cls: "audio_cls",
    pose_cls: "pose_cls",
    gesture_cls: "gesture_cls",
    image: "image_cls",
    audio: "audio_cls",
    voice: "audio_cls",
    pose: "pose_cls",
    hand: "gesture_cls",
    gesture: "gesture_cls",
  };

  return typeMap[normalizedValue] || "";
};

const inferAiTaskOptType = () => {
  const task = selectedTask.value as any;
  const candidates = [
    task?.fileType,
    task?.optType,
    task?.resourceType,
    task?.modelType,
    task?.raw?.fileType,
    task?.raw?.optType,
    task?.raw?.resourceType,
    task?.raw?.modelType,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeAiTaskOptType(candidate);
    if (normalized) {
      return normalized;
    }
  }

  const nameSource = [
    resolveSelectedTaskName(),
    String(selectedTask.value?.fileName || ""),
    String(selectedTask.value?.resourceName || ""),
  ]
    .join(" ")
    .toLowerCase();

  if (nameSource.includes("图像") || nameSource.includes("image")) return "image_cls";
  if (
    nameSource.includes("语音") ||
    nameSource.includes("音频") ||
    nameSource.includes("audio") ||
    nameSource.includes("voice")
  )
    return "audio_cls";
  if (nameSource.includes("姿态") || nameSource.includes("pose")) return "pose_cls";
  if (
    nameSource.includes("手势") ||
    nameSource.includes("gesture") ||
    nameSource.includes("hand")
  )
    return "gesture_cls";

  return "";
};

const resolveSelectedAiTaskResourceUrl = () => {
  const task = selectedTask.value as any;
  return String(task?.resourceUrl || task?.raw?.resourceUrl || "").trim();
};

const resolveSelectedAiTaskOssId = () => {
  const task = selectedTask.value as any;
  return String(
    task?.resourceOssId ||
      task?.ossId ||
      task?.raw?.resourceOssId ||
      task?.raw?.ossId ||
      ""
  ).trim();
};

const resolveSelectedAiTaskOptId = () => {
  const task = selectedTask.value as any;
  return String(
    task?.optId || task?.aiId || task?.modelId || task?.resourceId || task?.id || ""
  ).trim();
};

const resolveSelectedAiTaskFileName = () => {
  const baseName = resolveSelectedTaskName();
  if (!baseName) {
    return "project.zip";
  }
  return /\.zip$/i.test(baseName) ? baseName : `${baseName}.zip`;
};

const resolveSelectedFreeCodingResourceUrl = () => {
  const task = selectedTask.value as any;
  return String(task?.resourceUrl || task?.raw?.resourceUrl || "").trim();
};

const resolveSelectedFreeCodingOssId = () => {
  const task = selectedTask.value as any;
  return String(
    task?.resourceOssId ||
      task?.ossId ||
      task?.raw?.resourceOssId ||
      task?.raw?.ossId ||
      ""
  ).trim();
};

const resolveSelectedFreeCodingFileName = () => {
  const task = selectedTask.value as any;
  const baseName = String(
    task?.fileName || task?.resourceName || currentTaskLabel.value || "project.zip"
  ).trim();

  if (!baseName) {
    return "project.zip";
  }

  return /\.[^.]+$/i.test(baseName) ? baseName : `${baseName}.zip`;
};

const buildTaskAiIframeUrl = async (toolKey: string, projectName: string, optId = "") => {
  const tokenData = await ssoLogin();
  const accessToken =
    (typeof tokenData === "string" ? tokenData : "") ||
    tokenData?.accessToken ||
    tokenData?.token ||
    tokenData?.access_token ||
    "";

  if (!accessToken) {
    throw new Error("获取AI工具 Token 失败");
  }

  const type = TASK_AI_TYPE_MAP[toolKey];
  if (!type) {
    throw new Error("当前任务缺少可识别的 AI 模型类型");
  }

  const lang = locale.value === "zh" ? "zh" : "en";
  return `https://pre.matatalab.com/?token=${encodeURIComponent(
    accessToken
  )}&type=${type}&projectName=${encodeURIComponent(
    projectName
  )}&lang=${lang}&ch=aiedu&type2=opt${
    optId ? `&optId=${encodeURIComponent(optId)}` : ""
  }`;
};

const getToolAccessToken = async () => {
  const tokenData = await ssoLogin();
  const accessToken =
    (typeof tokenData === "string" ? tokenData : "") ||
    tokenData?.accessToken ||
    tokenData?.token ||
    tokenData?.access_token ||
    "";

  if (!accessToken) {
    throw new Error("获取工具 Token 失败");
  }

  return accessToken;
};

const buildFreeCodingIframeUrl = async (toolId: "vincibot" | "nous") => {
  const baseUrl =
    toolId === "nous"
      ? String(runtimeConfig.public.nousCreateUrl || "").trim()
      : String(runtimeConfig.public.vincibotCreateUrl || "").trim();

  if (!baseUrl) {
    throw new Error("当前未配置自由编程工具地址");
  }

  const token = await getToolAccessToken();
  const lang =
    toolId === "vincibot"
      ? locale.value === "zh"
        ? "zh-CN"
        : "en"
      : locale.value === "zh"
      ? "zh"
      : "en";
  const separator = baseUrl.includes("?") ? "&" : "?";

  return `${baseUrl}${separator}token=${encodeURIComponent(token)}&lang=${lang}&ch=aiedu`;
};

const downloadAiTaskFile = async () => {
  const resourceUrl = resolveSelectedAiTaskResourceUrl();
  const ossId = resolveSelectedAiTaskOssId();
  const fileName = resolveSelectedAiTaskFileName();

  if (ossId) {
    return downloadFileFromOSS(ossId, fileName, "application/zip");
  }

  if (!resourceUrl) {
    return null;
  }

  const response = await fetch(resourceUrl);
  if (!response.ok) {
    throw new Error(`下载AI模型文件失败: ${response.status}`);
  }

  const blob = await response.blob();
  return new File([blob], fileName, {
    type: blob.type || "application/zip",
    lastModified: Date.now(),
  });
};

const downloadFreeCodingTaskFile = async () => {
  const resourceUrl = resolveSelectedFreeCodingResourceUrl();
  const ossId = resolveSelectedFreeCodingOssId();
  const fileName = resolveSelectedFreeCodingFileName();

  if (ossId) {
    return downloadFileFromOSS(ossId, fileName, "application/octet-stream");
  }

  if (!resourceUrl) {
    return null;
  }

  const response = await fetch(resourceUrl);
  if (!response.ok) {
    throw new Error(`下载自由编程文件失败: ${response.status}`);
  }

  const blob = await response.blob();
  return new File([blob], fileName, {
    type: blob.type || "application/octet-stream",
    lastModified: Date.now(),
  });
};

const postCurrentAiFileToIframe = async () => {
  const iframeWindow = taskAiIframeRef.value?.contentWindow;
  if (!currentTaskAiFile.value || !iframeWindow || !currentTaskAiUrl.value) {
    return;
  }

  const origin = new URL(currentTaskAiUrl.value).origin;
  const payload = await currentTaskAiFile.value.arrayBuffer();
  iframeWindow.postMessage(
    {
      type: "receive-tm-zip",
      payload,
      optId: currentTaskAiOptId.value || undefined,
    },
    origin,
    [payload]
  );
};

const postCurrentToolFileToIframe = async () => {
  if (!currentTaskToolFile.value || !currentTaskToolUrl.value) {
    pushTaskToolDebugLog("未发送：缺少当前工具文件或 iframe 地址");
    return;
  }

  const messageType = /\.mc$/i.test(currentTaskToolFile.value.name)
    ? "receive-works-sb3"
    : "ZIP_DATA";

  pushTaskToolDebugLog(
    `准备发送到 iframe，type=${messageType}，file=${currentTaskToolFile.value.name}`
  );

  const postResult = await postFileBufferToIframe({
    file: currentTaskToolFile.value,
    iframeUrl: currentTaskToolUrl.value,
    iframeWindow: taskToolIframeRef.value?.contentWindow,
    type: messageType,
  });

  if (postResult) {
    pushTaskToolDebugLog(
      `已发送到 iframe，type=${messageType}，file=${postResult.fileName}，size=${postResult.size}`
    );
  } else {
    pushTaskToolDebugLog(`发送失败，type=${messageType}`);
  }
};

const closeTaskAiIframeModal = () => {
  showTaskAiIframeModal.value = false;
  taskAiIframeLoading.value = true;
  currentTaskAiUrl.value = "";
  currentTaskAiProjectName.value = "";
  currentTaskAiToolKey.value = "";
  currentTaskAiOptType.value = "";
  currentTaskAiOptId.value = "";
  currentTaskAiFile.value = null;
};

const closeTaskToolIframeModal = () => {
  showTaskToolIframeModal.value = false;
  taskToolIframeLoading.value = true;
  currentTaskToolUrl.value = "";
  currentTaskToolName.value = "";
  currentTaskToolFile.value = null;
  pushTaskToolDebugLog("工具 iframe 已关闭");
};

const onTaskAiIframeLoad = () => {
  taskAiIframeLoading.value = false;
  if (!currentTaskAiFile.value) {
    return;
  }

  window.setTimeout(() => {
    void postCurrentAiFileToIframe();
  }, 300);
};

const onTaskToolIframeLoad = () => {
  taskToolIframeLoading.value = false;
  pushTaskToolDebugLog("工具 iframe 加载完成");
  if (!currentTaskToolFile.value) {
    pushTaskToolDebugLog("当前没有可回传的文件");
    return;
  }

  window.setTimeout(() => {
    void postCurrentToolFileToIframe();
  }, 300);
};

const openSelectedAiTaskDetail = async () => {
  const optType = inferAiTaskOptType();
  const toolKey = TASK_AI_TOOL_KEY_MAP[optType];
  if (!toolKey) {
    throw new Error("当前任务缺少 fileType，无法匹配 AI 模型");
  }

  const projectName = resolveSelectedTaskName() || "AI Model";
  const resourceUrl = resolveSelectedAiTaskResourceUrl();

  currentTaskAiToolKey.value = toolKey;
  currentTaskAiOptType.value = optType;
  currentTaskAiProjectName.value = projectName;
  currentTaskAiOptId.value = resourceUrl ? resolveSelectedAiTaskOptId() : "";
  currentTaskAiFile.value = resourceUrl ? await downloadAiTaskFile() : null;
  currentTaskAiUrl.value = await buildTaskAiIframeUrl(
    toolKey,
    projectName,
    resourceUrl ? currentTaskAiOptId.value : ""
  );
  taskAiIframeLoading.value = true;
  showTaskAiIframeModal.value = true;
};

const openSelectedFreeCodingTaskDetail = async () => {
  const toolId = resolveSelectedFreeCodingToolId();
  currentTaskToolName.value =
    toolId === "nous" ? "MatataCode (Nous)" : "MatataCode (VinciBot)";
  currentTaskToolFile.value = await downloadFreeCodingTaskFile();
  currentTaskToolUrl.value = await buildFreeCodingIframeUrl(toolId);
  taskToolIframeLoading.value = true;
  showTaskToolIframeModal.value = true;
};

const handleTaskAiIframeMessage = async (event: MessageEvent) => {
  if (
    !isMessageFromIframe({
      event,
      iframeWindow: taskAiIframeRef.value?.contentWindow,
      iframeUrl: currentTaskAiUrl.value,
    })
  ) {
    return;
  }

  const messageData = parseMessageData(event.data) as any;
  const messageType = getMessageType(messageData);
  if (
    !messageData ||
    (typeof messageData !== "object" && typeof messageData !== "string") ||
    messageType !== "send-tm-zip"
  ) {
    return;
  }

  try {
    const rawPayload = pickMessagePayload(messageData, [
      "payload",
      "data",
      "file",
      "blob",
      "arrayBuffer",
      "result",
    ]);
    const uploadFile = toUploadFile(rawPayload, pickMessageFileName(messageData));
    if (!uploadFile) {
      throw new Error("AI模型文件格式不正确");
    }

    const uploadResult = await uploadFileToOSS(uploadFile, "上传AI模型文件失败");
    const userId = getCurrentUserId();
    const optName =
      (typeof messageData?.projectName === "string" && messageData.projectName.trim()) ||
      currentTaskAiProjectName.value ||
      uploadFile.name.replace(/\.[^.]+$/, "");

    if (!uploadResult?.ossId || !userId || !currentTaskAiOptType.value) {
      throw new Error("AI模型保存参数不完整");
    }

    if (currentTaskAiOptId.value) {
      await updateAi({
        optId: currentTaskAiOptId.value,
        optName,
        optType: currentTaskAiOptType.value,
        userId,
        ossId: uploadResult.ossId,
      });
    } else {
      const createResult = await createAi({
        optName,
        optType: currentTaskAiOptType.value,
        userId,
        ossId: uploadResult.ossId,
      });
      currentTaskAiOptId.value = String(
        createResult?.optId || createResult?.id || currentTaskAiOptId.value
      );
    }

    currentTaskAiProjectName.value = optName;
    currentTaskAiFile.value = uploadFile;
    ElMessage.success("保存成功");
    await fetchTaskList();
  } catch (error) {
    console.error("保存 AI 实践任务失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "保存 AI 实践任务失败");
  }
};

const handleFreeCodingIssue = async () => {
  if (freeCodingIssuing.value) return;
  const resourceId = resolveSelectedResourceId();
  const classId = filters.value.class;
  if (!resourceId) {
    console.warn(
      "[taskmanagement] 缺少可用 resourceId，当前任务数据：",
      selectedTask.value
    );
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  if (classId === null || classId === undefined || String(classId).trim() === "") {
    ElMessage.warning(t("taskManagement.selectClass"));
    return;
  }
  showIssueModal.value = true;
  return;
  freeCodingIssuing.value = true;
  try {
    await taskApi.bindDistributer({
      classId: String(classId),
      resourceId: String(resourceId),
      taskName: resolveIssuedTaskName(),
      distributeType: 1,
    });
    setDistributeTypeOverride(String(resourceId), 1);
    ElMessage.success(t("taskManagement.issueTaskSuccess"));
    await fetchTaskList();
    await fetchStudentTaskList();
  } catch (error: any) {
    console.error("自由编程任务下发失败:", error);
  } finally {
    freeCodingIssuing.value = false;
  }
};

const handleIssueGroup = async (taskName?: string) => {
  const resourceId = resolveSelectedResourceId();
  if (!resourceId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  try {
    if (isFreeCoding.value) {
      await taskApi.bindFreeDistribute({
        classId: String(filters.value.class || ""),
        resourceId,
        taskName: String(taskName || "").trim(),
        fileType: resolveFreeCodingFileType(),
        distributeType: 2,
      });
      setDistributeTypeOverride(resourceId, 2);
      showIssueModal.value = false;
      ElMessage.success(t("taskManagement.issueTaskSuccess"));
      await fetchTaskList();
      fetchStudentTaskList();
      return;
    }
    await taskApi.bindDistributer({
      classId: String(filters.value.class || ""),
      resourceId,
      taskName: resolveIssuedTaskName(),
      distributeType: 2,
    });
    setDistributeTypeOverride(resourceId, 2);
    showIssueModal.value = false;
    ElMessage.success(t("taskManagement.issueTaskSuccess"));
    // 重新加载任务列表，让 distributeType 从接口更新
    await fetchTaskList();
    fetchStudentTaskList();
  } catch (error: any) {
    console.error("小组任务下发失败:", error);
  }
};

const handleIssueStudent = async (taskName?: string) => {
  const resourceId = resolveSelectedResourceId();
  if (!resourceId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  try {
    if (isFreeCoding.value) {
      await taskApi.bindFreeDistribute({
        classId: String(filters.value.class || ""),
        resourceId,
        taskName: String(taskName || "").trim(),
        fileType: resolveFreeCodingFileType(),
        distributeType: 1,
      });
      setDistributeTypeOverride(resourceId, 1);
      showIssueModal.value = false;
      ElMessage.success(t("taskManagement.issueTaskSuccess"));
      await fetchTaskList();
      fetchStudentTaskList();
      return;
    }
    await taskApi.bindDistributer({
      classId: String(filters.value.class || ""),
      resourceId,
      taskName: resolveIssuedTaskName(),
      distributeType: 1,
    });
    setDistributeTypeOverride(resourceId, 1);
    showIssueModal.value = false;
    ElMessage.success(t("taskManagement.issueTaskSuccess"));
    // 重新加载任务列表，让 distributeType 从接口更新
    await fetchTaskList();
    fetchStudentTaskList();
  } catch (error: any) {
    console.error("学生任务下发失败:", error);
  }
};

// Group Task Columns matching the screenshot
const groupTaskColumns = computed(() => [
  {
    key: "groupName",
    title: t("taskManagement.groupName"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "leader",
    title: t("taskManagement.leader"),
    align: "center" as const,
    width: "100px",
  },
  {
    key: "members",
    title: t("taskManagement.members"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "submissionStatus",
    title: t("taskManagement.submissionStatus"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "duration",
    title: t("taskManagement.durationMinutes"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "submissionTime",
    title: t("taskManagement.submissionTime"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "qaStatus",
    title: t("taskManagement.qaPushStatus"),
    align: "center" as const,
    width: "130px",
  },
  {
    key: "action",
    title: t("common.operation"),
    align: "center" as const,
    width: "100px",
  },
]);

// Student Task Columns
const studentTaskColumns = computed(() => [
  {
    key: "studentName",
    title: t("taskManagement.studentName"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "studentAccount",
    title: t("taskManagement.studentAccount"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "submissionStatus",
    title: t("taskManagement.submissionStatus"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "duration",
    title: t("taskManagement.durationMinutes"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "submissionTime",
    title: t("taskManagement.submissionTime"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "qaStatus",
    title: t("taskManagement.qaPushStatus"),
    align: "center" as const,
    width: "130px",
  },
  {
    key: "action",
    title: t("common.operation"),
    align: "center" as const,
    width: "100px",
  },
]);

// AI实践任务列：去掉“已推送答疑助手”
const aiPracticeStudentColumns = computed(() =>
  studentTaskColumns.value.filter((col: any) => col.key !== "qaStatus")
);
const aiPracticeGroupColumns = computed(() =>
  groupTaskColumns.value.filter((col: any) => col.key !== "qaStatus")
);

// Student Task Columns for Custom Exercise (matching screenshot)
const customExerciseColumns = computed(() => [
  {
    key: "studentName",
    title: t("taskManagement.studentName"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "studentAccount",
    title: t("taskManagement.studentAccount"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "submissionStatus",
    title: t("taskManagement.submissionStatus"),
    align: "center" as const,
    width: "100px",
  },
  {
    key: "scoreTotal",
    title: t("taskManagement.scoreTotal"),
    align: "center" as const,
    width: "100px",
  },
  {
    key: "duration",
    title: t("taskManagement.durationMinutes"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "submissionTime",
    title: t("taskManagement.submissionTime"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "grade",
    title: t("taskManagement.grade"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "action",
    title: t("common.operation"),
    align: "center" as const,
    width: "180px",
  },
]);

const assessmentColumns = computed(() => [
  {
    key: "studentName",
    title: t("taskManagement.studentShort"),
    align: "center" as const,
    width: "140px",
  },
  {
    key: "submissionStatus",
    title: t("taskManagement.submissionOverview"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "examTime",
    title: t("taskManagement.examTime"),
    align: "center" as const,
    width: "180px",
  },
  {
    key: "reviewStatus",
    title: t("taskManagement.reviewStatus"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "scoreTotal",
    title: t("taskManagement.assessmentScoreTotal"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "grade",
    title: t("taskManagement.grade"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "action",
    title: t("common.operation"),
    align: "center" as const,
    width: "210px",
  },
]);

// Upload Task Columns for Student (Personal Upload / Free Coding)
const uploadTaskStudentColumns = computed(() => [
  {
    key: "studentName",
    title: t("taskManagement.studentName"),
    align: "center" as const,
    width: "120px",
  },
  {
    key: "studentAccount",
    title: t("taskManagement.studentAccount"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "submissionStatus",
    title: t("taskManagement.submissionStatus"),
    align: "center" as const,
    width: "100px",
  },
  {
    key: "duration",
    title: t("taskManagement.durationMinutes"),
    align: "center" as const,
    width: "100px",
  },
  {
    key: "submissionTime",
    title: t("taskManagement.submissionTime"),
    align: "center" as const,
    width: "160px",
  },
  {
    key: "teacherScore",
    title: t("taskManagement.teacherScore"),
    align: "center" as const,
    width: "160px",
  },
  {
    key: "action",
    title: t("common.operation"),
    align: "center" as const,
    width: "120px",
  },
]);

// Upload Task Columns for Group (Personal Upload / Free Coding)
const uploadTaskGroupColumns = computed(() => [
  {
    key: "groupName",
    title: t("taskManagement.groupName"),
    align: "center" as const,
    width: "150px",
  },
  {
    key: "submissionStatus",
    title: t("taskManagement.submissionStatus"),
    align: "center" as const,
    width: "100px",
  },
  {
    key: "duration",
    title: t("taskManagement.durationMinutes"),
    align: "center" as const,
    width: "100px",
  },
  {
    key: "submissionTime",
    title: t("taskManagement.submissionTime"),
    align: "center" as const,
    width: "160px",
  },
  {
    key: "teacherScore",
    title: t("taskManagement.teacherScore"),
    align: "center" as const,
    width: "160px",
  },
  {
    key: "action",
    title: t("common.operation"),
    align: "center" as const,
    width: "120px",
  },
]);

// 获取当前选中任务的完整数据
const selectedTask = computed(() => {
  const currentKey = String(selectedTaskKey.value);
  for (const category of taskListData.value) {
    const found = (category.resourceList || []).find(
      (r: any) => String(r.resourceId) === currentKey
    );
    if (found) {
      const rid = String(found.resourceId);
      const overrideDt = distributeTypeOverrides.value[rid];
      return {
        ...found,
        distributeType:
          overrideDt === 1 || overrideDt === 2 ? overrideDt : found.distributeType,
        resourceCategory: category.resourceCategory,
      };
    }
  }
  return null;
});

// 自定义练习题类型（resourceCategory: 11）
const isCustomExercise = computed(() => {
  return Number(selectedTask.value?.resourceCategory) === 11;
});

// 随堂练习类型（resourceCategory: 6）
const isClassExercise = computed(() => {
  return Number(selectedTask.value?.resourceCategory) === 6;
});

// 练习题统一类型（自定义练习题 + 随堂练习）
const isExerciseTask = computed(() => {
  return isCustomExercise.value || isClassExercise.value;
});

// AI实践任务（resourceCategory: 10）
const isAiPracticeTask = computed(() => {
  return Number(selectedTask.value?.resourceCategory) === 10;
});

// Check if current task is upload task
const isUploadTask = computed(() => {
  // 个人程序类型（resourceCategory: 9）
  return Number(selectedTask.value?.resourceCategory) === 9;
});

// Check if current task is free coding
const isFreeCoding = computed(() => {
  // 自由编程类型（resourceCategory: 12）
  return Number(selectedTask.value?.resourceCategory) === 12;
});
const isStudentCodingTask = computed(() => {
  // 学生编程任务类型（resourceCategory: 7）
  return Number(selectedTask.value?.resourceCategory) === 7;
});
const isFreeCodingLikeTask = computed(() => {
  return isFreeCoding.value || isStudentCodingTask.value;
});

const issueType = computed({
  get: () => issueTypeFromApi.value,
  set: () => {
    // 下发后重新加载任务列表即可
  },
});
const currentColumns = computed(() => {
  if (isAssessmentTab.value) {
    return assessmentColumns.value;
  }
  // Exercise tasks use special columns
  if (isExerciseTask.value) {
    return customExerciseColumns.value;
  }
  // Upload Task (Personal Upload / Free Coding) uses upload columns
  if (isUploadTask.value || isFreeCodingLikeTask.value) {
    return issueType.value === "group"
      ? uploadTaskGroupColumns.value
      : uploadTaskStudentColumns.value;
  }
  // AI实践任务：隐藏“已推送答疑助手”列
  if (isAiPracticeTask.value) {
    return issueType.value === "group"
      ? aiPracticeGroupColumns.value
      : aiPracticeStudentColumns.value;
  }
  const baseCols =
    issueType.value === "group" ? groupTaskColumns.value : studentTaskColumns.value;
  return baseCols;
});

// Filter State
const submissionFilter = ref("all");
const submissionFilterOptions = computed(() => {
  const options = [
    { label: t("common.all"), value: "all" },
    { label: t("taskManagement.submitted"), value: "submitted" },
    { label: t("taskManagement.unsubmitted"), value: "unsubmitted" },
  ];
  // Upload tasks have additional "resubmitted" option
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
    showWithdrawModal.value = true;
  }
  moreActionValue.value = "";
};

// 学生任务列表数据
const groupTaskData = ref<any[]>([]);
const assessmentIssueMode = ref<"create" | "returnToRedo" | "redistribute">("create");
const assessmentIssueEvaluationIds = ref<string[]>([]);

const normalizeAssessmentSubmissionStatus = (item: any) => {
  const status = Number(
    item?.status ?? item?.submitStatus ?? item?.evaluationStatus ?? -1
  );
  if (status === 1 || status === 2) {
    return "submitted";
  }
  if (
    String(item?.submitTime || item?.submissionTime || item?.taskEndTime || "").trim()
  ) {
    return "submitted";
  }
  if (item?.score !== null && item?.score !== undefined) {
    return "submitted";
  }
  return "unsubmitted";
};

const normalizeAssessmentReviewStatus = (item: any) => {
  const statusCandidates = [
    item?.reviewStatus,
    item?.correctStatus,
    item?.gradingStatus,
    item?.markStatus,
    item?.judgeStatus,
    item?.teacherScoreStatus,
  ];

  for (const candidate of statusCandidates) {
    const normalized = String(candidate ?? "").trim();
    if (!normalized) continue;
    if (["1", "2", "已批改", "已阅卷", "reviewed"].includes(normalized)) {
      return "reviewed";
    }
    if (["0", "未批改", "未阅卷", "unreviewed"].includes(normalized)) {
      return "unreviewed";
    }
  }

  if (item?.teacherScore !== null && item?.teacherScore !== undefined) {
    return "reviewed";
  }

  if (
    item?.score !== null &&
    item?.score !== undefined &&
    String(item?.submitTime || item?.submissionTime || "").trim()
  ) {
    return "reviewed";
  }

  return "unreviewed";
};

const normalizeTeacherScore = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string" && !value.trim()) {
    return null;
  }
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0) {
    return null;
  }
  return score;
};

const formatTeacherScoreDisplay = (value: unknown) => {
  const score = normalizeTeacherScore(value);
  if (score === null) return "-";
  return `${Number(score.toFixed(1))}${t("viewScore.point")}`;
};

const parseAssessmentDateTime = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text || text === "-") return null;
  const parsed = new Date(text.replace(/-/g, "/"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const splitAssessmentTimeRange = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text) return [];

  const separator = [" ~ ", " - ", " 至 ", "—", "–"].find((token) =>
    text.includes(token)
  );
  if (!separator) {
    return [text];
  }

  return text
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
};

const resolveAssessmentExamStart = (row: any) => {
  const raw = row?._raw || {};
  const directStart = parseAssessmentDateTime(raw.examStartTime || raw.startTime);
  if (directStart) return directStart;

  const examTimeText = String(raw.examTime || row?.examTime || "").trim();
  if (examTimeText) {
    const [startText] = splitAssessmentTimeRange(examTimeText);
    const directExamTime = parseAssessmentDateTime(startText);
    if (directExamTime) return directExamTime;
  }

  const examDate = String(raw.examDate || "").trim();
  const examClock = String(
    raw.examClockTime || raw.examTimePoint || raw.examTime || ""
  ).trim();
  if (examDate && examClock && !examClock.includes("-")) {
    return parseAssessmentDateTime(`${examDate} ${examClock}`);
  }

  return null;
};

const resolveAssessmentExamEnd = (row: any) => {
  const raw = row?._raw || {};
  const directEnd = parseAssessmentDateTime(raw.examEndTime || raw.endTime);
  if (directEnd) return directEnd;

  const examTimeText = String(raw.examTime || row?.examTime || "").trim();
  const [, endText] = splitAssessmentTimeRange(examTimeText);
  const rangeEnd = parseAssessmentDateTime(endText);
  if (rangeEnd) return rangeEnd;

  const start = resolveAssessmentExamStart(row);
  const duration = Number(raw.examDuration ?? row?.duration ?? 0);
  if (!start || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  return new Date(start.getTime() + duration * 60 * 1000);
};

const isAssessmentInExamTime = (row: any) => {
  const start = resolveAssessmentExamStart(row);
  const end = resolveAssessmentExamEnd(row);
  if (!start || !end) return false;
  const now = Date.now();
  return now >= start.getTime() && now <= end.getTime();
};

const getAssessmentActionLabel = (row: any) => {
  return isAssessmentInExamTime(row)
    ? t("taskManagement.returnToRedo")
    : t("taskManagement.redistributeExam");
};

const assessmentIssueModalTitle = computed(() => {
  if (assessmentIssueMode.value === "returnToRedo") {
    return t("taskManagement.returnToRedo");
  }
  if (assessmentIssueMode.value === "redistribute") {
    return t("taskManagement.redistributeExam");
  }
  return t("taskManagement.issueExam");
});

const assessmentIssueModalSubmitText = computed(() => {
  if (assessmentIssueMode.value === "returnToRedo") {
    return t("taskManagement.returnToRedo");
  }
  if (assessmentIssueMode.value === "redistribute") {
    return t("taskManagement.redistributeExam");
  }
  return t("taskManagement.issueExam");
});

// 加载学生任务列表
const fetchStudentTaskList = async () => {
  const classId = String(filters.value.class || "");
  if (!classId) return;

  if (isAssessmentTab.value) {
    const courseId = String(filters.value.course || "").trim();
    const exerciseId = String(resolveSelectedExerciseId() || "").trim();
    if (!courseId || !exerciseId) return;
    try {
      const data = await taskApi.getStudentEvaluationList({
        courseId,
        classId,
        exerciseId,
      });
      groupTaskData.value = (data || []).map((item: any, index: number) => ({
        id:
          item.evaluationId ||
          item.id ||
          item.taskId ||
          `${item.studentNumber || item.studentId || index}`,
        studentName: item.studentName || "-",
        studentAccount: item.studentNumber || "-",
        submissionStatus: normalizeAssessmentSubmissionStatus(item),
        examTime:
          item.examTime ||
          item.submitTime ||
          item.submissionTime ||
          item.taskEndTime ||
          "-",
        className: item.className || currentClassName.value || "-",
        reviewStatus: normalizeAssessmentReviewStatus(item),
        scoreTotal:
          item.score !== null && item.score !== undefined
            ? `${item.score}/${item.totalScore ?? "-"}`
            : "-",
        duration: item.examDuration || item.taskDuration || "-",
        submissionTime: item.submitTime || item.submissionTime || item.taskEndTime || "-",
        grade: scoreToStars(item.score, item.totalScore),
        teacherScore: item.teacherScore ?? null,
        graded: Boolean(item.graded) || item.score !== null,
        _raw: item,
      }));
    } catch (error) {
      console.error("获取学生测评列表失败", error);
      groupTaskData.value = [];
    }
    return;
  }

  const resourceId = resolveSelectedResourceId();
  if (!resourceId) return;
  try {
    const data = await taskApi.getStudentTaskList({ resourceId, classId });
    groupTaskData.value = (data || []).map((item: any) => ({
      id: item.taskId,
      studentName: item.studentName,
      studentAccount: item.studentNumber,
      submissionStatus: item.status === 1 ? "submitted" : "unsubmitted",
      scoreTotal:
        item.score !== null &&
        item.score !== undefined &&
        item.totalScore !== null &&
        item.totalScore !== undefined
          ? `${item.score}/${item.totalScore}`
          : item.totalScore !== null && item.totalScore !== undefined
            ? `-/${item.totalScore}`
            : "-",
      duration: item.taskDuration || "-",
      submissionTime: item.taskEndTime || "-",
      grade: scoreToStars(item.score, item.totalScore),
      teacherScore:
        normalizeTeacherScore(item.score ?? item.teacherScore),
      graded:
        item.score !== null && item.score !== undefined
          ? true
          : item.teacherScore !== null && item.teacherScore !== undefined
            ? true
            : Boolean(item.graded),
      _raw: item,
    }));
  } catch (error) {
    console.error("获取学生任务列表失败", error);
    groupTaskData.value = [];
  }
};

// Withdraw Modal State
const showWithdrawModal = ref(false);

// Exercise Detail Modal State
const showExerciseDetailModal = ref(false);
const viewTaskId = ref<string | null>(null);
const currentEvaluationId = ref<string | null>(null);
const exerciseDetailSource = ref<
  "task" | "courseEvaluation" | "evaluationDetail" | "evaluationWithAnswers"
>("task");
const currentExerciseId = computed(() => resolveSelectedExerciseId());

// View and Score Modal State
const showViewScoreModal = ref(false);
const currentScoreRow = ref<any>(null);
const currentProgrammingTaskDetail = ref<any>(null);
const viewScoreLoading = ref(false);

// Check if there's a next submission to score
const hasNextSubmission = computed(() => {
  if (!currentScoreRow.value) return false;
  const currentIndex = groupTaskData.value.findIndex(
    (r) => r.id === currentScoreRow.value?.id
  );
  return groupTaskData.value
    .slice(currentIndex + 1)
    .some((r) => r.submissionStatus === "submitted");
});

// Answer Analysis Toggle
const answerAnalysisEnabled = ref(false);

// Refresh student task list
const refreshing = ref(false);
const handleRefreshList = async () => {
  refreshing.value = true;
  try {
    await fetchStudentTaskList();
  } finally {
    refreshing.value = false;
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

// Computed counts for submitted/unsubmitted
const submittedCount = computed(() => {
  return groupTaskData.value.filter((item) => item.submissionStatus === "submitted")
    .length;
});

const unsubmittedCount = computed(() => {
  return groupTaskData.value.filter((item) => item.submissionStatus !== "submitted")
    .length;
});

// Pending review count (submitted but not graded)
const pendingReviewCount = computed(() => {
  return groupTaskData.value.filter(
    (item) => item.submissionStatus === "submitted" && !item.graded
  ).length;
});

type PendingReviewTaskItem = {
  className: string;
  courseName: string;
  chapterName: string;
  resourceId: string;
  taskName: string;
};

const normalizePendingReviewText = (value: unknown) => String(value ?? "").trim();

const normalizePendingReviewTask = (item: any): PendingReviewTaskItem => {
  const className = normalizePendingReviewText(item?.className) || "-";
  const courseName = normalizePendingReviewText(item?.courseName);
  const chapterName = normalizePendingReviewText(item?.chapterName);

  return {
    className,
    courseName,
    chapterName,
    resourceId: normalizePendingReviewText(item?.resourceId || item?.id),
    taskName: [courseName, chapterName].filter(Boolean).join("/"),
  };
};

const pendingReviewTasks = ref<PendingReviewTaskItem[]>([]);

// Selected pending review task index (default first one)
const selectedPendingIndex = ref(0);

const fetchCorrectTaskList = async () => {
  try {
    const data = await taskApi.getCorrectTaskList();
    pendingReviewTasks.value = (Array.isArray(data) ? data : []).map((item: any) =>
      normalizePendingReviewTask(item)
    );

    if (pendingReviewTasks.value.length === 0) {
      selectedPendingIndex.value = 0;
      return;
    }

    if (selectedPendingIndex.value >= pendingReviewTasks.value.length) {
      selectedPendingIndex.value = 0;
    }
  } catch (error) {
    console.error("获取待批改任务列表失败", error);
    pendingReviewTasks.value = [];
    selectedPendingIndex.value = 0;
  }
};

const handlePendingReviewSelect = async (index: number, task: PendingReviewTaskItem) => {
  selectedPendingIndex.value = index;
  activeTab.value = "tasks";
  const previousClass = filters.value.class;
  const previousCourse = filters.value.course;
  const previousTopic = filters.value.topic;
  selectedTaskKey.value = task.resourceId;

  if (chapterData.value.length === 0) {
    await fetchChapterData();
  }

  const classItem = chapterData.value.find(
    (item: any) => normalizePendingReviewText(item?.className) === task.className
  );
  const courseItem = classItem?.courseList?.find(
    (item: any) => normalizePendingReviewText(item?.courseName) === task.courseName
  );
  const chapterItem = courseItem?.chapterList?.find(
    (item: any) => normalizePendingReviewText(item?.chapterName) === task.chapterName
  );

  if (classItem?.classId !== undefined) {
    filters.value.class = classItem.classId;
  }
  if (courseItem?.courseId !== undefined) {
    filters.value.course = courseItem.courseId;
  }
  if (chapterItem?.chapterId !== undefined) {
    filters.value.topic = chapterItem.chapterId;
  }

  const isSameContext =
    previousClass === filters.value.class &&
    previousCourse === filters.value.course &&
    previousTopic === filters.value.topic;

  if (isSameContext && task.resourceId) {
    await fetchStudentTaskList();
  }
};

const goHome = () => {
  router.push("/teacher");
};
// Action handlers
const handleViewAndGrade = (row: any) => {
  if (isAssessmentTab.value) {
    viewTaskId.value = null;
    currentEvaluationId.value = row._raw?.evaluationId || row.id || null;
    exerciseDetailSource.value = "evaluationWithAnswers";
    showExerciseDetailModal.value = true;
    return;
  }
  currentEvaluationId.value = null;
  exerciseDetailSource.value = "task";
  viewTaskId.value = row._raw?.taskId || row.id || null;
  showExerciseDetailModal.value = true;
};

const openAssessmentActionModal = (row: any) => {
  const evaluationId = String(row?._raw?.evaluationId || row?.id || "").trim();
  if (!evaluationId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }

  assessmentIssueMode.value = isAssessmentInExamTime(row)
    ? "returnToRedo"
    : "redistribute";
  assessmentIssueEvaluationIds.value = [evaluationId];
  showAssessmentIssueModal.value = true;
};

const handleViewTaskDetail = async () => {
  if (isAssessmentTab.value) {
    viewTaskId.value = null;
    currentEvaluationId.value = null;
    exerciseDetailSource.value = "evaluationDetail";
    showExerciseDetailModal.value = true;
    return;
  }

  if (isFreeCoding.value || isStudentCodingTask.value || isUploadTask.value) {
    try {
      await openSelectedFreeCodingTaskDetail();
    } catch (error: any) {
      console.error("打开编程平台失败:", error);
      ElMessage.error(error instanceof Error ? error.message : "打开编程平台失败");
    }
    return;
  }

  if (isAiPracticeTask.value) {
    try {
      await openSelectedAiTaskDetail();
    } catch (error: any) {
      console.error("打开 AI 实践任务失败:", error);
      ElMessage.error(error instanceof Error ? error.message : "打开 AI 实践任务失败");
    }
    return;
  }

  currentEvaluationId.value = null;
  exerciseDetailSource.value = "task";
  viewTaskId.value = null;
  showExerciseDetailModal.value = true;
};

const loadProgrammingTaskDetail = async (row: any) => {
  const taskId = String(row?._raw?.taskId || row?.id || "").trim();
  if (!taskId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }

  viewScoreLoading.value = true;
  try {
    currentProgrammingTaskDetail.value = await taskApi.getProgrammingTaskDetail(taskId);
  } catch (error: any) {
    console.error("获取编程任务详情失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "获取编程任务详情失败");
  } finally {
    viewScoreLoading.value = false;
  }
};

const handleOpenProgrammingEditor = async () => {
  const detail = currentProgrammingTaskDetail.value;
  if (!detail?.taskUrl) {
    ElMessage.warning("当前作品缺少 taskUrl");
    pushTaskToolDebugLog("打开编程平台失败：缺少 taskUrl");
    return;
  }

  try {
    const toolId = resolveProgrammingDetailToolId(detail);
    pushTaskToolDebugLog(
      `打开编程平台，tool=${toolId}，taskUrl=${String(detail.taskUrl)}`
    );
    currentTaskToolName.value =
      toolId === "nous" ? "MatataCode (Nous)" : "MatataCode (VinciBot)";
    currentTaskToolFile.value = await downloadProgrammingDetailTaskFile(detail);
    pushTaskToolDebugLog(
      currentTaskToolFile.value
        ? `已下载任务文件：${currentTaskToolFile.value.name}`
        : "没有下载到任务文件"
    );
    currentTaskToolUrl.value = await buildFreeCodingIframeUrl(toolId);
    taskToolIframeLoading.value = true;
    showTaskToolIframeModal.value = true;
  } catch (error: any) {
    console.error("打开编程平台失败:", error);
    pushTaskToolDebugLog(
      `打开编程平台失败：${error instanceof Error ? error.message : "未知错误"}`
    );
    ElMessage.error(error instanceof Error ? error.message : "打开编程平台失败");
  }
};

const handleViewAndScore = async (row: any) => {
  currentScoreRow.value = row;
  currentProgrammingTaskDetail.value = null;
  showViewScoreModal.value = true;
  await loadProgrammingTaskDetail(row);
};

const handleViewScoreClose = () => {
  showViewScoreModal.value = false;
  currentProgrammingTaskDetail.value = null;
  viewScoreLoading.value = false;
};

const handleScoreSave = async (data: any) => {
  const taskId = String(
    currentProgrammingTaskDetail.value?.taskId ||
      currentScoreRow.value?._raw?.taskId ||
      currentScoreRow.value?.id ||
      ""
  ).trim();

  if (!taskId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }

  try {
    await taskApi.bindFreeScore({
      taskId,
      score: Number(data?.totalScore || 0),
      comment: String(data?.comment || "").trim(),
    });
    ElMessage.success(t("common.saveSuccess") || "保存成功");
    await Promise.all([fetchStudentTaskList(), fetchCorrectTaskList()]);
    handleViewScoreClose();
  } catch (error: any) {
    console.error("保存编程评分失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "保存编程评分失败");
  }
};

const handleScoreNext = async () => {
  // Find next submitted row
  const currentIndex = groupTaskData.value.findIndex(
    (r) => r.id === currentScoreRow.value?.id
  );
  const nextRow = groupTaskData.value
    .slice(currentIndex + 1)
    .find((r) => r.submissionStatus === "submitted");
  if (nextRow) {
    currentScoreRow.value = nextRow;
    currentProgrammingTaskDetail.value = null;
    await loadProgrammingTaskDetail(nextRow);
  } else {
    ElMessage.info(t("taskManagement.noMoreSubmissions") || "没有更多待评分的作业了");
    handleViewScoreClose();
  }
};

const handleReturnToRedo = (row: any) => {
  returnToRedoRow.value = row;
  showReturnToRedoModal.value = true;
};

const showReturnToRedoModal = ref(false);
const returnToRedoRow = ref<any>(null);

const confirmReturnToRedo = async () => {
  if (!returnToRedoRow.value) return;
  try {
    if (isAssessmentTab.value) {
      const evaluationId =
        returnToRedoRow.value._raw?.evaluationId || returnToRedoRow.value.id;
      await taskApi.bindEvaluationReject([String(evaluationId)]);
    } else {
      const taskId = returnToRedoRow.value._raw?.taskId || returnToRedoRow.value.id;
      await taskApi.bindReject([String(taskId)]);
    }
    showReturnToRedoModal.value = false;
    ElMessage.success(t("taskManagement.returnToRedoSuccess"));
    fetchStudentTaskList();
  } catch (error: any) {
    console.error("打回重做失败:", error);
  }
};

const handleWithdrawConfirm = async () => {
  try {
    if (isAssessmentTab.value) {
      const exerciseId = String(resolveSelectedExerciseId() || "").trim();
      if (!exerciseId) {
        ElMessage.warning(t("taskManagement.noDataSelectedTip"));
        return;
      }
      await withdrawExam({
        classId: String(filters.value.class || ""),
        exerciseId,
      });
      ElMessage.success(t("taskManagement.withdrawSuccess"));
      await fetchEvaluationList();
      groupTaskData.value = [];
      return;
    }

    const resourceId = resolveSelectedResourceId();
    if (!resourceId) {
      ElMessage.warning(t("taskManagement.noDataSelectedTip"));
      return;
    }
    await taskApi.bindWithdrawr({
      classId: String(filters.value.class || ""),
      resourceId,
      distributeType: issueTypeFromApi.value === "group" ? 2 : 1,
    });
    clearDistributeTypeOverride(resourceId);
    ElMessage.success(t("taskManagement.withdrawSuccess"));
    // 撤回后重新加载任务列表，让 distributeType 从接口更新
    await fetchTaskList();
    groupTaskData.value = [];
  } catch (error: any) {
    console.error("撤回任务失败:", error);
  }
};

const handleAssessmentIssueSubmit = async (data: {
  courseId: string;
  exerciseId: string;
  classId: string;
  examDate: string;
  examTime: string;
  examDuration: number;
}) => {
  try {
    const payload = assessmentIssueEvaluationIds.value.length
      ? {
          ...data,
          evaluationIds: assessmentIssueEvaluationIds.value,
        }
      : data;

    await startDistribute(payload);
    showAssessmentIssueModal.value = false;
    const successMessage =
      assessmentIssueMode.value === "returnToRedo"
        ? t("taskManagement.returnToRedoSuccess")
        : assessmentIssueMode.value === "redistribute"
        ? t("taskManagement.redistributeSuccess")
        : t("taskManagement.issueTaskSuccess");
    ElMessage.success(successMessage);
    assessmentIssueMode.value = "create";
    assessmentIssueEvaluationIds.value = [];
    await fetchEvaluationList();
  } catch (error) {
    console.error("下发测评失败:", error);
    ElMessage.error("下发测评失败");
  }
};

// Batch Operation State
const isBatchMode = ref(false);
const selectedRowKeys = ref<(string | number)[]>([]);

// Only submitted rows can be selected in batch mode
const batchSelectableFilter = (row: any) => row.submissionStatus === "submitted";

const selectableRows = computed(() =>
  groupTaskData.value.filter((row) => row.submissionStatus === "submitted")
);

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

const handleTableSelect = (keys: (string | number)[], rows: any[]) => {
  selectedRowKeys.value = keys;
};

const handleTableSelectAll = (selected: boolean) => {
  if (selected) {
    selectedRowKeys.value = selectableRows.value.map((row) => row.id);
  } else {
    selectedRowKeys.value = [];
  }
};

const handleSelectAllCheckbox = () => {
  if (isAllSelected.value) {
    selectedRowKeys.value = [];
  } else {
    selectedRowKeys.value = selectableRows.value.map((row) => row.id);
  }
};

const handleBatchReturnToRedo = async () => {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  try {
    if (isAssessmentTab.value) {
      const evaluationIds = selectedRowKeys.value.map((key) => {
        const row = groupTaskData.value.find((r) => r.id === key);
        return String(row?._raw?.evaluationId || key);
      });
      await taskApi.bindEvaluationReject(evaluationIds);
    } else {
      const taskIds = selectedRowKeys.value.map((key) => {
        const row = groupTaskData.value.find((r) => r.id === key);
        return String(row?._raw?.taskId || key);
      });
      await taskApi.bindReject(taskIds);
    }
    ElMessage.success(t("taskManagement.batchReturnSuccess"));
    exitBatchMode();
    fetchStudentTaskList();
  } catch (error: any) {
    console.error("批量打回重做失败:", error);
  }
};

// 初始化
onMounted(async () => {
  await fetchChapterData();
  await fetchCorrectTaskList();
  window.addEventListener("message", handleTaskAiIframeMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleTaskAiIframeMessage);
});
</script>

<style scoped>
/* Ensure the page takes full height of its container if setup in a layout */

/* 任务学生列表：表头固定，内容滚动 */
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

.iframe-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.iframe-modal-container {
  width: 95vw;
  height: 90vh;
  max-width: 1400px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.iframe-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #ffffff;
}

.iframe-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.iframe-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.iframe-close-btn:hover {
  background: #f5f5f5;
  color: #333333;
}

.iframe-modal-body {
  flex: 1;
  position: relative;
}

.tool-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.tool-iframe.hidden {
  visibility: hidden;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.96);
  z-index: 2;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f3f3f3;
  border-top-color: #ff9900;
  border-radius: 50%;
  animation: task-iframe-spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #666666;
}

@keyframes task-iframe-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
