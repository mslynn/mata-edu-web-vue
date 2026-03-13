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
          :key="index"
          class="bg-white rounded-lg px-4 py-3 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
          @click="selectedPendingIndex = index"
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
          <div class="flex items-center gap-2">
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
          </div>
        </div>

        <div class="flex-1 flex flex-col bg-white rounded-xl relative overflow-hidden">
          <div class="flex-1 w-full overflow-hidden">
            <div class="h-full w-full flex flex-col">
              <!-- Cards Grid (Free Creation / Tools) - Only show when task not issued -->
              <div
                v-if="isFreeCodingLikeTask && !isTaskIssued"
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
                      <template v-if="isBatchMode">
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

                        <!-- View Details -->
                        <MButton
                          type="primary"
                          class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-4 py-1.5 h-9 shadow-sm"
                          @click="handleViewTaskDetail"
                        >
                          {{ $t("taskManagement.viewTaskFileDetails") }}
                        </MButton>

                        <!-- Withdraw -->
                        <MButton
                          class="!bg-white !text-[#FF4D4F] !border-gray-200 hover:!bg-red-50 hover:!border-red-200 px-4 py-1.5 h-9 shadow-sm"
                          @click="showWithdrawModal = true"
                        >
                          {{ $t("taskManagement.withdrawTask") }}
                        </MButton>

                        <!-- Batch Operation -->
                        <MButton
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

                    <!-- Upload / AI Practice Task Actions: View Details, Withdraw, Refresh -->
                    <template
                      v-else-if="isUploadTask || isFreeCodingLikeTask || isAiPracticeTask"
                    >
                      <!-- View Details -->
                      <MButton
                        type="primary"
                        class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-4 py-1.5 h-9 shadow-sm"
                        @click="handleViewTaskDetail"
                      >
                        {{ $t("taskManagement.viewTaskFileDetails") }}
                      </MButton>

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
                        <StarRating
                          v-if="
                            row.teacherScore !== undefined && row.teacherScore !== null
                          "
                          :model-value="row.teacherScore"
                          :size="20"
                          wrapper-class="justify-center"
                          readonly
                        />
                        <span v-else class="text-gray-400">-</span>
                      </template>

                      <!-- Custom Cell for Actions -->
                      <template #cell-action="{ row }">
                        <div class="flex items-center justify-center gap-2">
                          <!-- Custom Exercise: 查看 + 打回重做 -->
                          <template
                            v-if="isExerciseTask && row.submissionStatus === 'submitted'"
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
                class="flex-1 flex flex-col items-center justify-center w-full h-full pb-20 max-w-5xl mx-auto text-center"
              >
                <div
                  class="w-64 h-64 bg-blue-50/50 rounded-full flex items-center justify-center mb-8 relative"
                >
                  <div
                    class="absolute inset-0 bg-blue-100/30 rounded-full animate-pulse"
                  ></div>
                  <!-- Placeholder Icon similar to screenshot -->
                  <Transition name="icon-fade" mode="out-in">
                    <svg
                      :key="selectedTaskKey"
                      width="120"
                      height="120"
                      viewBox="0 0 24 24"
                      fill="none"
                      class="text-blue-300 relative z-10"
                    >
                      <rect
                        x="4"
                        y="3"
                        width="16"
                        height="18"
                        rx="2"
                        fill="currentColor"
                        fill-opacity="0.2"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                      <path
                        d="M8 8h8M8 12h8M8 16h5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="6"
                        fill="#EEF2FF"
                        stroke="currentColor"
                        stroke-width="1.5"
                      />
                      <path
                        d="M14.5 15l1 1 2.5-2.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </Transition>
                </div>

                <h2 class="text-xl font-bold text-gray-800 mb-3">
                  {{ $t("taskManagement.taskNotIssued") }}
                </h2>
                <p class="text-gray-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                  {{ $t("taskManagement.taskNotIssuedDesc") }}
                </p>

                <div class="flex items-center gap-6">
                  <MButton
                    type="primary"
                    class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] px-8 py-2.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                    @click="openIssueModal"
                  >
                    {{ $t("taskManagement.issueTask") }}
                  </MButton>

                  <MButton
                    class="!bg-white !text-gray-600 border !border-gray-200 hover:!bg-gray-50 px-8 py-2.5 shadow-sm active:scale-95 transition-all"
                    @click="handleViewTaskDetail"
                  >
                    {{ $t("taskManagement.viewDetails") }}
                  </MButton>
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
      :is-free-coding="isFreeCodingLikeTask"
      :editor-name="selectedEditor"
      @confirm-group="handleIssueGroup"
      @confirm-student="handleIssueStudent"
    />

    <TaskWithdrawModal v-model="showWithdrawModal" @confirm="handleWithdrawConfirm" />

    <ExerciseDetailModal
      v-model="showExerciseDetailModal"
      :exercise-id="currentExerciseId"
      :task-id="viewTaskId"
    />

    <ViewAndScoreModal
      :visible="showViewScoreModal"
      :row-data="currentScoreRow"
      :has-next-submission="hasNextSubmission"
      @close="showViewScoreModal = false"
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
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { taskmanagementcenterApi } from "~/composables/api/taskmanagement";
import { scoreToStars } from "~/utils/star-rating";
import tool1Cover from "~/assets/images/tool1.png";
import tool5Cover from "~/assets/images/tool5.png";
const { t } = useI18n();
const router = useRouter();
const taskApi = taskmanagementcenterApi();

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
    if (classItem.courseList[0].chapterList?.length > 0) {
      filters.value.topic = classItem.courseList[0].chapterList[0].chapterId;
    }
  }
};

// 课程变化 → 默认选中第一个章节
const handleCourseChange = (courseId: string | number | null) => {
  filters.value.topic = null;
  if (!courseId || !filters.value.class) return;
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
          // 加载任务列表
          await fetchTaskList();
        }
      }
    }
  } catch (error) {
    console.error("获取授课章节数据失败", error);
  }
};

// 监听章节变化，重新加载任务列表
watch(
  () => filters.value.topic,
  (newVal) => {
    if (newVal) {
      fetchTaskList();
    } else {
      taskListData.value = [];
      selectedTaskKey.value = "";
    }
  }
);

// --- Sidebar Data & State ---
const activeTab = ref("tasks");
const tabs = computed(() => [
  { label: t("taskManagement.courseTasks"), value: "tasks" },
  { label: t("taskManagement.courseAssessment"), value: "assessment" },
]);

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

// 加载任务列表
const fetchTaskList = async () => {
  if (!filters.value.topic) return;
  try {
    const data = await taskApi.getTaskList({
      chapterId: Number(filters.value.topic),
      classId: String(filters.value.class || ""),
    });
    taskListData.value = data || [];
    // 默认展开所有分类
    expandedKeys.value = taskListData.value.map(
      (c: any) => `category_${c.resourceCategory}`
    );
    // 优先保持当前选中的任务；不存在时再回退到第一个
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
    } else if (
      taskListData.value.length > 0 &&
      taskListData.value[0].resourceList?.length > 0
    ) {
      selectedTaskKey.value = taskListData.value[0].resourceList[0].resourceId;
      // 如果该任务已下发，加载学生任务列表
      const firstTask = taskListData.value[0].resourceList[0];
      if (isIssuedDistributeType(firstTask.distributeType)) {
        fetchStudentTaskList();
      } else {
        groupTaskData.value = [];
      }
    } else {
      selectedTaskKey.value = "";
      groupTaskData.value = [];
    }
  } catch (error) {
    console.error("获取任务列表失败", error);
    taskListData.value = [];
  }
};

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
const freeCodingIssuing = ref(false);
const distributeTypeOverrides = ref<Record<string, number>>({});

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
  const candidates = [task?.exerciseId, task?.resourceId, task?.id, task?.taskId, selectedTaskKey.value];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;
    const value = String(candidate).trim();
    if (!value || value.startsWith("category_")) continue;
    return value;
  }
  return null;
}

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
  freeCodingIssuing.value = true;
  try {
    await taskApi.bindDistributer({
      classId: String(classId),
      resourceId: String(resourceId),
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

const handleIssueGroup = async () => {
  const resourceId = resolveSelectedResourceId();
  if (!resourceId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  try {
    await taskApi.bindDistributer({
      classId: String(filters.value.class || ""),
      resourceId,
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

const handleIssueStudent = async () => {
  const resourceId = resolveSelectedResourceId();
  if (!resourceId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  try {
    await taskApi.bindDistributer({
      classId: String(filters.value.class || ""),
      resourceId,
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
  // TODO: 根据实际 resourceCategory 判断上传任务类型
  return false;
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

// 加载学生任务列表
const fetchStudentTaskList = async () => {
  const resourceId = resolveSelectedResourceId();
  const classId = String(filters.value.class || "");
  if (!resourceId) return;
  if (!classId) return;
  try {
    const data = await taskApi.getStudentTaskList({ resourceId, classId });
    groupTaskData.value = (data || []).map((item: any) => ({
      id: item.taskId,
      studentName: item.studentName,
      studentAccount: item.studentNumber,
      submissionStatus: item.status === 1 ? "submitted" : "unsubmitted",
      scoreTotal: item.score !== null ? `${item.score}/${item.totalScore}` : "-",
      duration: item.taskDuration || "-",
      submissionTime: item.taskEndTime || "-",
      grade: scoreToStars(item.score, item.totalScore),
      teacherScore: null,
      graded: false,
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
const currentExerciseId = computed(() => resolveSelectedExerciseId());

// View and Score Modal State
const showViewScoreModal = ref(false);
const currentScoreRow = ref<any>(null);

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

// Pending review tasks list (mock data for demo)
const pendingReviewTasks = ref([
  { className: "1年级1111111", taskName: "AI未来实验室（硬件版）/第2课 你画我猜" },
  { className: "2年级3班", taskName: "Python基础/第5课 循环语句" },
]);

// Selected pending review task index (default first one)
const selectedPendingIndex = ref(0);

const goHome = () => {
  router.push("/teacher");
};
// Action handlers
const handleViewAndGrade = (row: any) => {
  viewTaskId.value = row._raw?.taskId || row.id || null;
  showExerciseDetailModal.value = true;
};

const handleViewTaskDetail = () => {
  viewTaskId.value = null;
  showExerciseDetailModal.value = true;
};

const handleViewAndScore = (row: any) => {
  currentScoreRow.value = row;
  showViewScoreModal.value = true;
};

const handleScoreSave = (data: any) => {
  console.log("Score saved:", data);
  showViewScoreModal.value = false;
};

const handleScoreNext = () => {
  // Find next submitted row
  const currentIndex = groupTaskData.value.findIndex(
    (r) => r.id === currentScoreRow.value?.id
  );
  const nextRow = groupTaskData.value
    .slice(currentIndex + 1)
    .find((r) => r.submissionStatus === "submitted");
  if (nextRow) {
    currentScoreRow.value = nextRow;
  } else {
    ElMessage.info(t("taskManagement.noMoreSubmissions") || "没有更多待评分的作业了");
    showViewScoreModal.value = false;
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
    const taskId = returnToRedoRow.value._raw?.taskId || returnToRedoRow.value.id;
    await taskApi.bindReject([String(taskId)]);
    showReturnToRedoModal.value = false;
    ElMessage.success(t("taskManagement.returnToRedoSuccess"));
    fetchStudentTaskList();
  } catch (error: any) {
    console.error("打回重做失败:", error);
  }
};

const handleWithdrawConfirm = async () => {
  const resourceId = resolveSelectedResourceId();
  if (!resourceId) {
    ElMessage.warning(t("taskManagement.noDataSelectedTip"));
    return;
  }
  try {
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
  // 从选中的行中找到对应的 taskId
  const taskIds = selectedRowKeys.value.map((key) => {
    const row = groupTaskData.value.find((r) => r.id === key);
    return String(row?._raw?.taskId || key);
  });
  try {
    await taskApi.bindReject(taskIds);
    ElMessage.success(t("taskManagement.batchReturnSuccess"));
    exitBatchMode();
    fetchStudentTaskList();
  } catch (error: any) {
    console.error("批量打回重做失败:", error);
  }
};

// 初始化
onMounted(() => {
  fetchChapterData();
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
</style>
