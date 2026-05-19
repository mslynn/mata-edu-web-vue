<template>
  <div
    class="student-task-page flex-1 flex flex-col overflow-hidden"
    :class="{ 'student-task-page--embedded': embedded }"
  >
    <div class="task-shell flex-1 overflow-hidden">
      <div class="task-header" :class="{ 'task-header--embedded': embedded }">
        <div v-if="!embedded" class="header-left">
          <button class="back-btn" @click="goBack">
            <svg
              class="w-5 h-5 text-[#6B7280]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <MSelect
            v-if="chapterList.length > 0"
            :model-value="currentChapterId"
            :options="chapterList"
            value-key="id"
            label-key="name"
            :placeholder="currentChapterName"
            class="chapter-select"
            @change="handleChapterSelectChange"
          />
          <span v-else class="chapter-name">{{ currentChapterName }}</span>
        </div>

        <div class="header-title">{{ embedded ? "课堂任务" : "我的任务" }}</div>
        <div v-if="!embedded" class="header-right"></div>
      </div>

      <div class="task-body">
        <aside class="task-sidebar">
          <template v-if="!taskListLoading && taskGroups.length > 0">
            <div v-for="group in taskGroups" :key="group.key" class="task-group">
              <button class="task-group-title" @click="toggleGroup(group.key)">
                <svg
                  class="task-group-arrow"
                  :class="{ expanded: expandedGroups[group.key] }"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span>{{ group.name }}</span>
              </button>

              <div v-show="expandedGroups[group.key]" class="task-group-list">
                <button
                  v-for="item in group.items"
                  :key="item.key"
                  class="task-item"
                  :class="{ active: item.key === selectedTaskKey }"
                  @click="selectedTaskKey = item.key"
                >
                  <span class="task-status-pill" :class="taskStatusClass(item.status)">
                    {{ taskStatusLabel(item.status) }}
                  </span>
                  <span class="task-item-name">{{ item.menuName }}</span>
                </button>
              </div>
            </div>
          </template>

          <div
            v-else-if="!taskListLoading"
            class="h-full text-sm text-[#9CA3AF] flex items-center justify-center"
          >
            当前章节暂无任务
          </div>

          <div v-else class="task-sidebar-skeleton">
            <el-skeleton v-for="idx in 6" :key="idx" animated>
              <template #template>
                <el-skeleton-item variant="text" style="width: 100%; height: 28px" />
              </template>
            </el-skeleton>
          </div>
        </aside>

        <main class="task-main">
          <template v-if="taskListLoading">
            <div class="task-main-card">
              <el-skeleton animated>
                <template #template>
                  <div class="task-main-skeleton">
                    <el-skeleton-item variant="text" style="width: 120px; height: 24px" />
                    <el-skeleton-item variant="text" style="width: 220px; height: 16px" />
                    <el-skeleton-item
                      variant="rect"
                      style="width: 220px; height: 210px; border-radius: 12px"
                    />
                    <el-skeleton-item
                      variant="button"
                      style="width: 116px; height: 36px; border-radius: 8px"
                    />
                  </div>
                </template>
              </el-skeleton>
            </div>
          </template>

          <template v-else-if="selectedTask">
            <div class="task-main-card">
              <template v-if="isExerciseLikeTask">
                <div class="exercise-stepper">
                  <div
                    class="exercise-step"
                    :class="{
                      'exercise-step--active': !isExerciseResultStep,
                      'exercise-step--done': isExerciseResultStep,
                    }"
                  >
                    <span class="exercise-step-dot">{{
                      isExerciseResultStep ? "✓" : "1"
                    }}</span>
                    <span class="exercise-step-text">提交任务</span>
                  </div>
                  <div
                    class="exercise-step-line"
                    :class="{ 'exercise-step-line--active': isExerciseResultStep }"
                  ></div>
                  <div
                    class="exercise-step"
                    :class="{ 'exercise-step--active': isExerciseResultStep }"
                  >
                    <span class="exercise-step-dot">2</span>
                    <span class="exercise-step-text">查看结果</span>
                  </div>
                </div>

                <p class="task-submit-desc task-submit-desc--exercise">
                  {{
                    isSelectedTaskSubmitted
                      ? isExerciseResultStep
                        ? "当前为查看结果步骤，可点击查看详情"
                        : "任务已提交，可查看详情或进入下一步"
                      : "请完成以下任务，完成后点击提交"
                  }}
                </p>

                <template v-if="!isExerciseResultStep">
                  <button
                    class="exercise-preview-card"
                    type="button"
                    @click="handleExerciseCardClick"
                  >
                    <div class="exercise-preview-body">
                      <div class="exercise-scroll-icon">
                        <span class="exercise-scroll-fold"></span>
                        <span class="exercise-scroll-line"></span>
                        <span class="exercise-scroll-line"></span>
                        <span class="exercise-scroll-line"></span>
                      </div>
                      <span class="exercise-pointer" aria-hidden="true">
                        <span class="exercise-pointer-ripple"></span>
                        <span class="exercise-pointer-icon">👈</span>
                      </span>
                    </div>
                    <div class="exercise-preview-name">{{ selectedTask.taskName }}</div>
                  </button>

                  <div v-if="isSelectedTaskSubmitted" class="exercise-action-row">
                    <button
                      class="task-submit-btn task-submit-btn--exercise task-submit-btn--detail"
                      :disabled="doingTask"
                      @click="handleViewDetail"
                    >
                      {{ doingTask ? "处理中..." : "查看详情" }}
                    </button>
                    <button
                      class="task-submit-btn task-submit-btn--exercise task-submit-btn--next"
                      :disabled="isExerciseResultStep"
                      @click="handleNextStep"
                    >
                      {{ isExerciseResultStep ? "已下一步" : "下一步" }}
                    </button>
                  </div>
                  <button
                    v-else
                    class="task-submit-btn task-submit-btn--exercise"
                    :disabled="doingTask"
                    @click="handleDoTask"
                  >
                    {{ doingTask ? "处理中..." : "做任务" }}
                  </button>
                </template>

                <template v-else>
                  <div class="exercise-result-table">
                    <div class="exercise-result-head">
                      <div>练习名称</div>
                      <div>提交时间</div>
                      <div>状态</div>
                      <div>得分</div>
                      <div>操作</div>
                    </div>

                    <div class="exercise-result-row">
                      <div class="exercise-result-name" :title="selectedTask.taskName">
                        {{ selectedTask.taskName }}
                      </div>
                      <div>{{ selectedTaskSubmitTime }}</div>
                      <div>{{ selectedTaskReviewStatus }}</div>
                      <div>
                        <div class="exercise-score-box">
                          <StarRating
                            :model-value="selectedTaskScoreStar"
                            :size="16"
                            :gap="1"
                            fill-color="#f7b84b"
                            empty-color="#e6dfd1"
                            readonly
                          />
                        </div>
                      </div>
                      <div>
                        <button
                          class="exercise-result-detail-btn"
                          @click="handleViewDetail"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    class="task-submit-btn task-submit-btn--exercise task-submit-btn--detail"
                    @click="handlePrevStep"
                  >
                    上一步
                  </button>
                </template>
              </template>

              <template v-else>
                <template v-if="isAiPracticeTask">
                  <h2 class="task-submit-title">
                    {{ isSelectedTaskSubmitted ? "查看任务" : "提交任务" }}
                  </h2>
                  <p class="task-submit-desc">
                    {{
                      isSelectedTaskSubmitted
                        ? "当前任务已提交，可点击下方按钮重新提交"
                        : "请完成以下任务，完成后点击提交"
                    }}
                  </p>

                  <div class="task-preview-card">
                    <div class="task-preview-icon">AI</div>
                    <div class="task-preview-name">{{ selectedTask.taskName }}</div>
                  </div>

                  <button
                    class="task-submit-btn"
                    :disabled="doingTask || submittingTaskAi"
                    @click="isSelectedTaskSubmitted ? handleEditAiTask() : handleDoTask()"
                  >
                    {{
                      doingTask || submittingTaskAi
                        ? "处理中..."
                        : isSelectedTaskSubmitted
                          ? "重新提交"
                          : "做任务"
                    }}
                  </button>
                </template>

                <template v-else-if="isSelectedTaskSubmitted">
                  <div class="submitted-task-view">
                    <h2 class="submitted-task-title">查看任务</h2>
                    <p class="submitted-task-desc">
                      请提交已完成的任务，支持提交工程文件、视频、图片
                    </p>

                    <div class="submitted-task-tabs">
                      <button
                        v-for="tab in submittedTaskTabs"
                        :key="tab.key"
                        class="submitted-task-tab"
                        :class="{ active: activeSubmissionAssetTab === tab.key }"
                        @click="activeSubmissionAssetTab = tab.key"
                      >
                        <span v-if="tab.key === 'project'" class="submitted-task-tab-star"
                          >*</span
                        >
                        {{ tab.label }}
                      </button>
                    </div>

                    <input
                      ref="videoRecordInputRef"
                      type="file"
                      accept="video/*"
                      capture="environment"
                      style="display: none"
                      @change="handleVideoInputChange"
                    />
                    <input
                      ref="videoUploadInputRef"
                      type="file"
                      accept="video/*"
                      style="display: none"
                      @change="handleVideoInputChange"
                    />
                    <input
                      ref="imageCaptureInputRef"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style="display: none"
                      @change="handleImageInputChange"
                    />
                    <input
                      ref="imageUploadInputRef"
                      type="file"
                      accept="image/*"
                      multiple
                      style="display: none"
                      @change="handleImageInputChange"
                    />

                    <div class="submitted-task-preview-wrap">
                      <button
                        v-if="activeSubmissionAssetTab === 'project'"
                        class="submitted-task-relate-btn"
                        @click="openHistoryOpusModal"
                      >
                        重新关联作品文件
                      </button>

                      <div
                        class="submitted-task-preview-card"
                        :class="{
                          'submitted-task-preview-card--clickable':
                            activeSubmissionAssetTab === 'project',
                        }"
                        @click="
                          activeSubmissionAssetTab === 'project' &&
                            handleEditProgramTask()
                        "
                      >
                        <div
                          v-if="activeSubmissionAssetTab === 'project'"
                          class="submitted-task-badge"
                        >
                          {{ submittedTaskToolLabel }}
                        </div>

                        <template v-if="activeSubmissionAssetTab === 'project'">
                          <img
                            v-if="submittedProjectCoverUrl"
                            :src="submittedProjectCoverUrl"
                            :alt="submittedTaskDisplayName"
                            class="submitted-task-preview-image"
                          />
                          <div v-else class="submitted-task-preview-placeholder">
                            <div class="submitted-task-placeholder-icon">MC</div>
                            <div class="submitted-task-placeholder-name">
                              {{ submittedTaskDisplayName }}
                            </div>
                          </div>
                        </template>

                        <template v-else-if="activeSubmissionAssetTab === 'video'">
                          <div
                            v-if="displayVideoUrl"
                            class="submitted-task-video-panel submitted-task-video-panel--filled"
                          >
                            <button
                              v-if="displayVideoUrl"
                              class="submitted-task-media-delete"
                              @click="clearPendingVideo"
                            >
                              ×
                            </button>
                            <video
                              :src="displayVideoUrl"
                              class="submitted-task-preview-video"
                              controls
                            ></video>
                          </div>
                          <div
                            v-else-if="
                              showCameraCaptureModal && cameraCaptureMode === 'video'
                            "
                            class="submitted-task-video-panel"
                          >
                            <div
                              v-if="cameraCaptureUnavailable"
                              class="submitted-task-camera-empty"
                            >
                              <div class="submitted-task-camera-empty-title">
                                未检测到摄像头
                              </div>
                              <div class="submitted-task-camera-empty-desc">
                                请在系统设置中开启摄像头权限，并确保没有其他桌面应用占用摄像头
                              </div>
                              <button
                                class="submitted-task-camera-back"
                                @click="closeCameraCapturePanel"
                              >
                                返回
                              </button>
                            </div>
                            <div
                              v-else-if="cameraCaptureLoading"
                              class="submitted-task-camera-empty"
                            >
                              <div class="submitted-task-camera-empty-title">
                                正在打开摄像头...
                              </div>
                            </div>
                            <div v-else class="submitted-task-camera-live">
                              <video
                                ref="cameraVideoRef"
                                class="submitted-task-camera-video"
                                autoplay
                                playsinline
                                muted
                              ></video>
                              <div class="submitted-task-camera-actions">
                                <button
                                  class="submitted-task-secondary-btn"
                                  @click="closeCameraCapturePanel"
                                >
                                  返回
                                </button>
                                <button
                                  class="submitted-task-secondary-btn submitted-task-secondary-btn--primary"
                                  :disabled="cameraActionPending"
                                  @click="handleCameraRecordingAction"
                                >
                                  {{
                                    cameraActionPending
                                      ? "处理中..."
                                      : cameraRecording
                                        ? "停止录制"
                                        : "开始录制"
                                  }}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div v-else class="submitted-task-video-panel">
                            <div class="submitted-task-video-hint">
                              请选择上传本地视频或者直接点击录制视频按钮，
                              <br />
                              调用摄像头进行视频录制；默认只能提交一份视频。
                            </div>
                            <div class="submitted-task-video-actions">
                              <button
                                class="submitted-task-secondary-btn"
                                :disabled="mediaSubmitting"
                                @click="triggerVideoRecord"
                              >
                                {{ mediaSubmitting ? "提交中..." : "点击录制视频" }}
                              </button>
                              <button
                                class="submitted-task-secondary-btn"
                                :disabled="mediaSubmitting"
                                @click="triggerVideoUpload"
                              >
                                {{ mediaSubmitting ? "提交中..." : "上传本地视频" }}
                              </button>
                            </div>
                          </div>
                        </template>

                        <template v-else>
                          <div class="submitted-task-image-strip">
                            <button
                              v-for="(_, index) in imageUploadSlots"
                              :key="index"
                              class="submitted-task-image-slot"
                              :class="{
                                active:
                                  index === activeImageIndex &&
                                  activeSubmissionAssetTab === 'image',
                              }"
                              @click="selectImageSlot(index)"
                            >
                              <img
                                v-if="displayImageUrls[index]"
                                :src="displayImageUrls[index]"
                                :alt="`提交图片${index + 1}`"
                                class="submitted-task-image-slot-preview"
                              />
                              <button
                                v-if="displayImageUrls[index]"
                                class="submitted-task-image-delete"
                                @click.stop="removePendingImage(index)"
                              >
                                ×
                              </button>
                              <div v-else class="submitted-task-image-slot-placeholder">
                                <svg
                                  width="42"
                                  height="32"
                                  viewBox="0 0 42 32"
                                  fill="none"
                                >
                                  <rect
                                    x="2.5"
                                    y="2.5"
                                    width="37"
                                    height="27"
                                    rx="2.5"
                                    stroke="#D5DDF0"
                                    stroke-width="3"
                                  />
                                  <circle cx="30.5" cy="10.5" r="4.5" fill="#D5DDF0" />
                                  <path
                                    d="M7 24L17 15L23 20L28 16L35 24"
                                    stroke="#D5DDF0"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                  />
                                </svg>
                              </div>
                            </button>
                          </div>

                          <div
                            v-if="activeDisplayImageUrl"
                            class="submitted-task-image-panel submitted-task-image-panel--filled"
                          >
                            <img
                              :src="activeDisplayImageUrl"
                              alt="提交图片"
                              class="submitted-task-display-image"
                              :style="{ transform: `rotate(${activeImageRotation}deg)` }"
                            />
                            <button
                              class="submitted-task-rotate-btn"
                              @click="rotateActiveImage"
                            >
                              旋转
                            </button>
                          </div>
                          <div
                            v-else-if="
                              showCameraCaptureModal && cameraCaptureMode === 'image'
                            "
                            class="submitted-task-image-panel"
                          >
                            <div
                              v-if="cameraCaptureUnavailable"
                              class="submitted-task-camera-empty"
                            >
                              <div class="submitted-task-camera-empty-title">
                                未检测到摄像头
                              </div>
                              <div class="submitted-task-camera-empty-desc">
                                请在系统设置中开启摄像头权限，并确保没有其他桌面应用占用摄像头
                              </div>
                              <button
                                class="submitted-task-camera-back"
                                @click="closeCameraCapturePanel"
                              >
                                返回
                              </button>
                            </div>
                            <div
                              v-else-if="cameraCaptureLoading"
                              class="submitted-task-camera-empty"
                            >
                              <div class="submitted-task-camera-empty-title">
                                正在打开摄像头...
                              </div>
                            </div>
                            <div v-else class="submitted-task-camera-live">
                              <video
                                ref="cameraVideoRef"
                                class="submitted-task-camera-video"
                                autoplay
                                playsinline
                                muted
                              ></video>
                              <div class="submitted-task-camera-actions">
                                <button
                                  class="submitted-task-secondary-btn"
                                  @click="closeCameraCapturePanel"
                                >
                                  返回
                                </button>
                                <button
                                  class="submitted-task-secondary-btn submitted-task-secondary-btn--primary"
                                  :disabled="cameraActionPending"
                                  @click="captureCameraImage"
                                >
                                  {{ cameraActionPending ? "处理中..." : "拍照" }}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div v-else class="submitted-task-image-panel">
                            <div class="submitted-task-video-hint">
                              请选择上传本地图片或者直接点击拍摄照片按钮，
                              <br />
                              调用摄像头进行视频照片拍摄；默认最多可上传6张图片。
                            </div>
                            <div class="submitted-task-video-actions">
                              <button
                                class="submitted-task-secondary-btn"
                                :disabled="mediaSubmitting"
                                @click="triggerImageCapture"
                              >
                                {{ mediaSubmitting ? "提交中..." : "点击拍摄图片" }}
                              </button>
                              <button
                                class="submitted-task-secondary-btn"
                                :disabled="mediaSubmitting"
                                @click="triggerImageUpload"
                              >
                                {{ mediaSubmitting ? "提交中..." : "上传本地图片" }}
                              </button>
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>

                    <p
                      v-if="activeSubmissionAssetTab === 'video' && !displayVideoUrl"
                      class="submitted-task-footnote"
                    >
                      *当前最多可上传一个视频，请点击右上角按钮先删除当前视频后重新上传
                    </p>
                    <p
                      v-if="
                        activeSubmissionAssetTab === 'image' && !activeDisplayImageUrl
                      "
                      class="submitted-task-footnote"
                    >
                      *当前最多可上传6张图片，请点击缩略图区进行替换或重新上传
                    </p>

                    <button
                      v-if="activeSubmissionAssetTab === 'project'"
                      class="submitted-task-edit-btn"
                      :disabled="doingTask"
                      @click="handleEditProgramTask"
                    >
                      {{ doingTask ? "处理中..." : "编辑任务" }}
                    </button>
                    <button
                      v-else-if="activeSubmissionAssetTab === 'video'"
                      class="submitted-task-edit-btn"
                      :disabled="mediaSubmitting"
                      @click="submitSelectedVideo"
                    >
                      {{ mediaSubmitting ? "提交中..." : "提交视频" }}
                    </button>
                    <button
                      v-else-if="activeSubmissionAssetTab === 'image'"
                      class="submitted-task-edit-btn"
                      :disabled="mediaSubmitting"
                      @click="submitSelectedImages"
                    >
                      {{ mediaSubmitting ? "提交中..." : "提交图片" }}
                    </button>
                  </div>
                </template>

                <template v-else>
                  <h2 class="task-submit-title">提交任务</h2>
                  <p class="task-submit-desc">请完成以下任务，完成后点击提交</p>

                  <div class="task-preview-card">
                    <div class="task-preview-icon">AI</div>
                    <div class="task-preview-name">{{ selectedTask.taskName }}</div>
                  </div>

                  <button
                    class="task-submit-btn"
                    :disabled="doingTask"
                    @click="handleDoTask"
                  >
                    {{ doingTask ? "处理中..." : "做任务" }}
                  </button>
                </template>
              </template>
            </div>
          </template>

          <template v-else>
            <div class="task-main-card task-empty">请选择左侧任务</div>
          </template>
        </main>
      </div>
    </div>

    <StudentTaskAnswerModal
      v-model="taskAnswerVisible"
      :task-id="activeTaskId"
      :task-name="activeTaskName"
      :readonly="taskAnswerReadonly"
      @submitted="handleTaskSubmitted"
    />

    <div
      v-if="showTaskAiIframeModal"
      class="iframe-modal-overlay"
      @click.self="handleCloseTaskAiModal"
    >
      <div class="iframe-modal-container">
        <div class="iframe-modal-header">
          <span class="iframe-modal-title">{{
            currentTaskAiProjectName || selectedTask?.taskName || "AI Model"
          }}</span>
          <button class="iframe-close-btn" @click="handleCloseTaskAiModal">
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
            <span class="loading-text">加载中...</span>
          </div>
          <AiImageTaskWorkbench
            v-if="currentTaskAiToolKey === 'aiPainting' && !taskAiIframeLoading"
            embedded
            :selected-session-id="currentTaskAiSelectedSessionId"
            @generate-start="handleAiPaintingGenerateStart"
            @open-history-gallery="openTaskAiHistoryGallery"
            @session-loaded="handleAiPaintingSessionLoaded"
            @generated="handleAiPaintingGenerated"
          />
          <AiQaTaskWorkbench
            v-else-if="currentTaskAiToolKey === 'smartQA' && !taskAiIframeLoading"
            embedded
            @chat-session-ready="handleAiQaSessionReady"
          />
          <iframe
            v-else
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
        <div
          v-if="currentTaskAiToolKey === 'aiPainting' || currentTaskAiToolKey === 'smartQA'"
          class="iframe-modal-footer iframe-modal-footer--ai-painting"
        >
          <span class="iframe-modal-footer__hint">{{ taskAiSubmitHint }}</span>
          <button
            class="iframe-submit-btn"
            :disabled="currentTaskAiToolKey === 'aiPainting' ? !canSubmitTaskAiPainting : !canSubmitTaskAiQa"
            @click="currentTaskAiToolKey === 'aiPainting' ? submitAiPaintingTask() : submitAiQaTask()"
          >
            {{ submittingTaskAi ? "提交中..." : "提交任务" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showTaskAiHistoryGallery"
      class="iframe-modal-overlay iframe-modal-overlay--gallery"
      @click.self="closeTaskAiHistoryGallery"
    >
      <div class="iframe-modal-container iframe-modal-container--gallery">
        <AiImageHistoryPage
          embedded
          :selected-session-id="currentTaskAiGeneratedPayload?.sessionId || currentTaskAiOptId"
          @close="closeTaskAiHistoryGallery"
          @select="handleTaskAiHistorySelect"
        />
      </div>
    </div>

    <div
      v-if="showToolIframeModal"
      class="iframe-modal-overlay"
      @click.self="closeToolIframeModal"
    >
      <div class="iframe-modal-container">
        <div class="iframe-modal-header">
          <span class="iframe-modal-title">{{
            currentToolName || selectedTask?.taskName || "MatataCode"
          }}</span>
          <button class="iframe-close-btn" @click="closeToolIframeModal">
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
          <div v-if="toolIframeLoading" class="iframe-loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">加载中...</span>
          </div>
          <iframe
            ref="toolIframeRef"
            :src="currentToolUrl"
            class="tool-iframe"
            :class="{ hidden: toolIframeLoading }"
            frameborder="0"
            allowfullscreen
            allow="camera; microphone; bluetooth; serial"
            @load="onToolIframeLoad"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showHistoryOpusModal"
      class="history-opus-overlay"
      @click.self="closeHistoryOpusModal"
    >
      <div class="history-opus-modal">
        <button class="history-opus-close" @click="closeHistoryOpusModal">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h3 class="history-opus-title">提交历史作品</h3>

        <div class="history-opus-toolbar">
          <div class="history-opus-tag">{{ submittedTaskToolLabel }}</div>
          <div class="history-opus-search">
            <input
              v-model="historyOpusKeyword"
              type="text"
              placeholder="作品名称"
              class="history-opus-input"
              @keyup.enter="searchHistoryOpus"
            />
          </div>
          <div class="history-opus-actions">
            <button
              class="history-opus-btn history-opus-btn--primary"
              @click="searchHistoryOpus"
            >
              搜索
            </button>
            <button
              class="history-opus-btn history-opus-btn--ghost"
              @click="resetHistoryOpusSearch"
            >
              重置
            </button>
          </div>
        </div>

        <div class="history-opus-table-wrap">
          <table class="history-opus-table">
            <thead>
              <tr>
                <th class="history-opus-col-select"></th>
                <th>序号</th>
                <th>作品名称</th>
                <th>是否课中作业</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="historyOpusLoading">
                <td colspan="6" class="history-opus-empty">加载中...</td>
              </tr>
              <tr v-else-if="historyOpusList.length === 0">
                <td colspan="6" class="history-opus-empty">暂无历史作品</td>
              </tr>
              <tr
                v-for="(work, index) in historyOpusList"
                v-else
                :key="work.opusId || work.id || index"
                :class="{
                  selected:
                    selectedHistoryOpusId === String(work.opusId || work.id || ''),
                }"
                @click="selectHistoryOpus(work)"
              >
                <td class="history-opus-col-select">
                  <span
                    class="history-opus-radio"
                    :class="{
                      selected:
                        selectedHistoryOpusId === String(work.opusId || work.id || ''),
                    }"
                  ></span>
                </td>
                <td>{{ (historyOpusPageNum - 1) * historyOpusPageSize + index + 1 }}</td>
                <td>{{ work.opusName || "-" }}</td>
                <td>{{ getHistoryOpusTaskLabel(work) }}</td>
                <td>{{ work.updateTime || work.createTime || "-" }}</td>
                <td>
                  <button
                    class="history-opus-row-btn"
                    @click.stop="openHistoryOpusEditor(work)"
                  >
                    编辑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="history-opus-footer">
          <div class="history-opus-pagination">
            <span>共{{ historyOpusTotal }}条</span>
            <button
              class="history-opus-page-btn"
              :disabled="historyOpusPageNum <= 1"
              @click="changeHistoryOpusPage(historyOpusPageNum - 1)"
            >
              ‹
            </button>
            <span class="history-opus-page-current">{{ historyOpusPageNum }}</span>
            <button
              class="history-opus-page-btn"
              :disabled="historyOpusPageNum * historyOpusPageSize >= historyOpusTotal"
              @click="changeHistoryOpusPage(historyOpusPageNum + 1)"
            >
              ›
            </button>
          </div>

          <button
            v-if="selectedHistoryOpusId"
            class="history-opus-submit-btn"
            @click="submitHistoryOpus"
          >
            提交
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import { aiAdmin } from "~/composables/api/ai";
import { personalcenterApi } from "~/composables/api/personalcenter";
import { student } from "~/composables/api/student";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";
import AiImageTaskWorkbench from "~/components/ai/AiImageTaskWorkbench.vue";
import AiImageHistoryPage from "~/components/ai/AiImageHistoryPage.vue";
import AiQaTaskWorkbench from "~/components/ai/AiQaTaskWorkbench.vue";
import StudentTaskAnswerModal from "~/components/student/StudentTaskAnswerModal.vue";
import StarRating from "~/components/ui/StarRating.vue";
import { normalizeRatePercent, percentToStars, scoreToStars } from "~/utils/star-rating";

definePageMeta({ layout: "default" });

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
    courseId?: string;
    chapterId?: string;
    chapterName?: string;
    refreshToken?: number;
  }>(),
  {
    embedded: false,
    courseId: "",
    chapterId: "",
    chapterName: "",
    refreshToken: 0,
  }
);

const emit = defineEmits<{
  close: [];
  updated: [];
}>();

type TaskStatus = 0 | 1;

interface ChapterItem {
  id: string;
  name: string;
}

interface TaskItem {
  key: string;
  taskId: string;
  menuName: string;
  taskName: string;
  status: TaskStatus;
  resourceCategory: number;
  raw: any;
}

interface TaskGroup {
  key: string;
  name: string;
  items: TaskItem[];
}

interface GeneratedAiPaintingPayload {
  sessionId: string;
  imageUrls: string[];
  prompt: string;
}

type SubmissionAssetTab = "project" | "video" | "image";

const route = useRoute();
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const { locale } = useI18n();
const {
  getStudentTaskChapterList,
  getStudentTaskList,
  startStudentTask,
  studentSubmitTask,
  getStudentTaskChapterDetail,
} = student();
const { ssoLogin, deleteOss, createAi, updateAi } = aiAdmin();
const { uploadOSS, getProfileopus, editOpus } = personalcenterApi();
const {
  downloadFileFromOSS,
  postFileBufferToIframe,
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  isMessageFromIframe,
  toZipFile,
  toWorkFile,
  toUploadFile,
  uploadFileToOSS,
  createUploadFormData,
} = useIframeFileBridge();

const chapterList = ref<ChapterItem[]>([]);
const currentChapterId = ref("");
const taskGroups = ref<TaskGroup[]>([]);
const expandedGroups = ref<Record<string, boolean>>({});
const selectedTaskKey = ref("");
const taskListLoading = ref(false);
const doingTask = ref(false);
const taskAnswerVisible = ref(false);
const activeTaskId = ref("");
const activeTaskName = ref("");
const taskAnswerReadonly = ref(false);
const exerciseStep = ref<1 | 2>(1);
const showTaskAiIframeModal = ref(false);
const taskAiIframeLoading = ref(true);
const currentTaskAiUrl = ref("");
const currentTaskAiProjectName = ref("");
const currentTaskAiOptType = ref("");
const currentTaskAiOptId = ref("");
const currentTaskAiTaskId = ref("");
const currentTaskAiToolKey = ref("");
const currentTaskAiFile = ref<File | null>(null);
const currentTaskAiGeneratedPayload = ref<GeneratedAiPaintingPayload | null>(null);
const currentTaskAiSelectedSessionId = ref("");
const currentTaskAiChatSessionId = ref("");
const taskAiIframeRef = ref<HTMLIFrameElement | null>(null);
const submittingTaskAi = ref(false);
const showTaskAiHistoryGallery = ref(false);
const showToolIframeModal = ref(false);
const currentToolUrl = ref("");
const currentToolName = ref("");
const currentToolFile = ref<File | null>(null);
const toolIframeLoading = ref(true);
const toolIframeRef = ref<HTMLIFrameElement | null>(null);
const currentToolTaskId = ref("");
const submittingToolTask = ref(false);
const currentToolEditMode = ref(false);
const activeSubmissionAssetTab = ref<SubmissionAssetTab>("project");
const localVideoUrl = ref("");
const localImageUrls = ref<string[]>([]);
const localVideoFile = ref<File | null>(null);
const localImageFiles = ref<File[]>([]);
const localImageRotations = ref<number[]>([]);
const hiddenVideoPreview = ref(false);
const hiddenImageUrls = ref<string[]>([]);
const activeImageIndex = ref(0);
const showCameraCaptureModal = ref(false);
const cameraCaptureMode = ref<"video" | "image">("video");
const cameraVideoRef = ref<HTMLVideoElement | null>(null);
const cameraCaptureLoading = ref(false);
const cameraCaptureUnavailable = ref(false);
const cameraPreviewReady = ref(false);
const cameraActionPending = ref(false);
const cameraRecording = ref(false);
const cameraStream = ref<MediaStream | null>(null);
const mediaRecorderRef = ref<MediaRecorder | null>(null);
const recordedVideoChunks = ref<BlobPart[]>([]);
const videoRecordInputRef = ref<HTMLInputElement | null>(null);
const videoUploadInputRef = ref<HTMLInputElement | null>(null);
const imageCaptureInputRef = ref<HTMLInputElement | null>(null);

const canSubmitTaskAiPainting = computed(() => {
  return (
    currentTaskAiToolKey.value === "aiPainting" &&
    !submittingTaskAi.value &&
    Array.isArray(currentTaskAiGeneratedPayload.value?.imageUrls) &&
    currentTaskAiGeneratedPayload.value!.imageUrls.length > 0
  );
});

const canSubmitTaskAiQa = computed(() => {
  return (
    currentTaskAiToolKey.value === "smartQA" &&
    !submittingTaskAi.value &&
    Boolean(String(currentTaskAiChatSessionId.value || "").trim())
  );
});

const taskAiSubmitHint = computed(() => {
  if (currentTaskAiToolKey.value === "smartQA") {
    if (submittingTaskAi.value) {
      return "正在提交 AI 问答任务...";
    }
    if (currentTaskAiChatSessionId.value) {
      return "已完成 AI 问答，确认无误后点击右侧提交任务";
    }
    return "请先完成 AI 问答，再提交任务";
  }
  const imageCount = currentTaskAiGeneratedPayload.value?.imageUrls.length || 0;
  if (submittingTaskAi.value) {
    return "正在上传生成图片并提交任务...";
  }
  if (imageCount > 0) {
    return `已生成 ${imageCount} 张图片，确认无误后点击右侧提交任务`;
  }
  return "请先完成 AI 画图，生成图片后再提交任务";
});
const imageUploadInputRef = ref<HTMLInputElement | null>(null);
const showHistoryOpusModal = ref(false);
const historyOpusLoading = ref(false);
const historyOpusKeyword = ref("");
const historyOpusList = ref<any[]>([]);
const historyOpusTotal = ref(0);
const historyOpusPageNum = ref(1);
const historyOpusPageSize = ref(10);
const selectedHistoryOpusId = ref("");
const currentHistoryOpus = ref<any | null>(null);
const reopenHistoryOpusAfterToolClose = ref(false);
const mediaSubmitting = ref(false);
const uploadToolWorkFileToOSS = async (file: File) =>
  uploadFileToOSS(file, "上传作品文件失败");

const embedded = computed(() => props.embedded);

const courseId = computed(() => {
  if (props.courseId) return String(props.courseId);
  const value = route.query.courseId;
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
});

const chapterIdFromSource = computed(() => {
  if (props.chapterId) return String(props.chapterId);
  const value = route.query.chapterId;
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
});

const chapterNameFromQuery = computed(() => {
  if (props.chapterName) return String(props.chapterName);
  const value = route.query.chapterName;
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
});

const currentChapterName = computed(() => {
  const chapter = chapterList.value.find((item) => item.id === currentChapterId.value);
  return chapter?.name || chapterNameFromQuery.value || "请选择章节";
});

const selectedTask = computed(() => {
  for (const group of taskGroups.value) {
    const found = group.items.find((item) => item.key === selectedTaskKey.value);
    if (found) return found;
  }
  return null;
});

const selectedTaskId = computed(() =>
  firstNonEmptyString(
    selectedTask.value?.raw?.taskId,
    selectedTask.value?.raw?.taskid,
    selectedTask.value?.raw?.taskID,
    selectedTask.value?.taskId
  )
);

const isExerciseLikeTask = computed(() => {
  const category = Number(selectedTask.value?.resourceCategory ?? -1);
  return category === 11 || category === 6;
});

const isAiPracticeTask = computed(() => {
  return Number(selectedTask.value?.resourceCategory ?? -1) === 10;
});

const isSelectedTaskSubmitted = computed(() => {
  return Number(selectedTask.value?.status ?? 0) === 1;
});

const isExerciseResultStep = computed(() => {
  return isSelectedTaskSubmitted.value && exerciseStep.value === 2;
});

const formatTaskTime = (value: any) => {
  if (value === null || value === undefined) return "-";
  const text = String(value).trim();
  if (!text) return "-";

  if (/^\d{10,13}$/.test(text)) {
    const timestamp = text.length === 13 ? Number(text) : Number(text) * 1000;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return text;
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }
  return text;
};

const selectedTaskSubmitTime = computed(() => {
  const raw = selectedTask.value?.raw;
  return formatTaskTime(raw?.taskEndTime);
});

const selectedTaskReviewStatus = computed(() => {
  const raw = selectedTask.value?.raw;
  const reviewText = firstNonEmptyString(
    raw?.reviewStatusName,
    raw?.reviewStatusText,
    raw?.correctStatusName,
    raw?.checkStatusName,
    raw?.statusName
  );
  if (reviewText) return reviewText;
  return isSelectedTaskSubmitted.value ? "已提交" : "未提交";
});

const selectedTaskScoreStar = computed(() => {
  const raw = selectedTask.value?.raw || {};
  const directRate =
    normalizeRatePercent(raw?.correctRate) ??
    normalizeRatePercent(raw?.accuracy) ??
    normalizeRatePercent(raw?.accuracyRate) ??
    normalizeRatePercent(raw?.rightRate) ??
    normalizeRatePercent(raw?.correctPercent);

  if (directRate !== null) {
    return percentToStars(directRate);
  }

  return scoreToStars(raw?.score, raw?.totalScore);
});

const firstNonEmptyString = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const TASK_AI_TOOL_KEY_MAP: Record<string, string> = {
  ai_draw: "aiPainting",
  ai_qa: "smartQA",
  image_cls: "imageClassModel",
  gesture_cls: "gestureClassModel",
  audio_cls: "voiceClassModel",
  pose_cls: "poseClassModel",
};

const TASK_AI_TYPE_MAP: Record<string, number> = {
  aiPainting: 7,
  smartQA: 1,
  imageClassModel: 1,
  gestureClassModel: 2,
  voiceClassModel: 3,
  poseClassModel: 4,
};

const normalizeStudentAiTaskOptType = (value: unknown) => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();
  const typeMap: Record<string, string> = {
    ai_draw: "ai_draw",
    ai_qa: "ai_qa",
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
    aipainting: "ai_draw",
    smartqa: "ai_qa",
  };

  return typeMap[normalizedValue] || "";
};

const inferStudentAiTaskOptType = (task: any, startData?: any) => {
  const candidates = [
    task?.fileType,
    task?.optType,
    task?.resourceType,
    task?.modelType,
    task?.raw?.fileType,
    task?.raw?.optType,
    task?.raw?.resourceType,
    task?.raw?.modelType,
    startData?.fileType,
    startData?.optType,
    startData?.resourceType,
    startData?.modelType,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeStudentAiTaskOptType(candidate);
    if (normalized) {
      return normalized;
    }
  }

  const nameSource = [
    String(task?.taskName || ""),
    String(task?.raw?.taskName || ""),
    String(task?.raw?.resourceName || ""),
  ]
    .join(" ")
    .toLowerCase();

  if (nameSource.includes("图像") || nameSource.includes("image")) return "image_cls";
  if (
    nameSource.includes("语音") ||
    nameSource.includes("音频") ||
    nameSource.includes("audio") ||
    nameSource.includes("voice")
  ) {
    return "audio_cls";
  }
  if (nameSource.includes("姿态") || nameSource.includes("pose")) return "pose_cls";
  if (
    nameSource.includes("手势") ||
    nameSource.includes("gesture") ||
    nameSource.includes("hand")
  ) {
    return "gesture_cls";
  }

  return "";
};

const resolveStudentAiTaskResourceUrl = (task: any, startData?: any) => {
  return firstNonEmptyString(
    task?.raw?.taskUrl,
    task?.raw?.resourceUrl,
    startData?.taskUrl,
    startData?.resourceUrl
  );
};

const resolveStudentAiTaskOssId = (task: any, startData?: any) => {
  return firstNonEmptyString(
    task?.raw?.resourceOssId,
    task?.raw?.ossId,
    startData?.resourceOssId,
    startData?.ossId
  );
};

const resolveStudentAiTaskOptId = (task: any, startData?: any) => {
  return firstNonEmptyString(
    task?.raw?.optId,
    task?.raw?.aiId,
    task?.raw?.modelId,
    task?.raw?.resourceId,
    task?.raw?.id,
    startData?.optId,
    startData?.aiId,
    startData?.modelId,
    startData?.resourceId,
    startData?.id
  );
};

const resolveStudentAiTaskFileName = (task: any) => {
  const baseName = firstNonEmptyString(
    task?.taskName,
    task?.raw?.taskName,
    task?.raw?.resourceName,
    "ai-model"
  );
  return /\.zip$/i.test(baseName) ? baseName : `${baseName}.zip`;
};

const getHistoryOpusFilterType = () => {
  const label = String(submittedTaskToolLabel.value || "")
    .trim()
    .toLowerCase();
  if (label === "nous") return "nous";
  if (label === "mc") return "vinci";
  if (label.includes("ucode4")) return "vinci";
  return undefined;
};

const loadHistoryOpusList = async (preferredSelectionId = "") => {
  historyOpusLoading.value = true;
  try {
    const result = await getProfileopus(
      historyOpusPageSize.value,
      historyOpusPageNum.value,
      historyOpusKeyword.value || undefined,
      getHistoryOpusFilterType()
    );
    historyOpusList.value = result.rows || [];
    historyOpusTotal.value = result.total || 0;

    if (historyOpusList.value.length === 0) {
      selectedHistoryOpusId.value = "";
      return;
    }

    const targetId = preferredSelectionId || selectedHistoryOpusId.value;
    const matched = historyOpusList.value.find(
      (item) => String(item.opusId || item.id || "") === targetId
    );
    selectedHistoryOpusId.value = String(
      matched?.opusId ||
        matched?.id ||
        historyOpusList.value[0]?.opusId ||
        historyOpusList.value[0]?.id ||
        ""
    );
  } catch (error) {
    console.error("获取历史作品列表失败", error);
    historyOpusList.value = [];
    historyOpusTotal.value = 0;
    selectedHistoryOpusId.value = "";
  } finally {
    historyOpusLoading.value = false;
  }
};

const openHistoryOpusModal = async () => {
  selectedHistoryOpusId.value = "";
  historyOpusPageNum.value = 1;
  showHistoryOpusModal.value = true;
  await loadHistoryOpusList();
};

const closeHistoryOpusModal = () => {
  showHistoryOpusModal.value = false;
};

const searchHistoryOpus = async () => {
  historyOpusPageNum.value = 1;
  await loadHistoryOpusList();
};

const resetHistoryOpusSearch = async () => {
  historyOpusKeyword.value = "";
  historyOpusPageNum.value = 1;
  await loadHistoryOpusList();
};

const changeHistoryOpusPage = async (page: number) => {
  if (page < 1 || page === historyOpusPageNum.value) return;
  historyOpusPageNum.value = page;
  await loadHistoryOpusList();
};

const selectHistoryOpus = (work: any) => {
  selectedHistoryOpusId.value = String(work.opusId || work.id || "");
};

const getHistoryOpusTaskLabel = (work: any) => {
  return Number(work?.classwork) === 1 ? "是" : "否";
};

const resolveHistoryOpusToolId = (work: any): "vincibot" | "nous" => {
  return (
    normalizeFreeCodingToolId(
      firstNonEmptyString(work?.opusType, work?.fileType, submittedTaskToolLabel.value)
    ) || "vincibot"
  );
};

const getHistoryOpusFileName = (work: any) => {
  const fileName = firstNonEmptyString(
    work?.opusUrl ? String(work.opusUrl).split("/").pop() : "",
    work?.fileName,
    work?.opusName,
    "project"
  );

  if (/\.[^.]+$/i.test(fileName)) {
    return fileName;
  }

  return `${fileName}.${resolveHistoryOpusToolId(work) === "nous" ? "sb3" : "mc"}`;
};

const openHistoryOpusEditor = async (work: any) => {
  const opusId = String(work?.opusId || work?.id || "").trim();
  const opusOssId = firstNonEmptyString(work?.opusOssId, work?.ossId);
  if (!opusId || !opusOssId) {
    ElMessage.warning("当前作品缺少可编辑文件");
    return;
  }

  const toolId = resolveHistoryOpusToolId(work);
  const fileName = getHistoryOpusFileName(work);

  try {
    selectedHistoryOpusId.value = opusId;
    currentHistoryOpus.value = work;
    reopenHistoryOpusAfterToolClose.value = true;
    currentToolEditMode.value = true;
    currentToolName.value =
      toolId === "nous" ? "MatataCode (Nous)" : "MatataCode (VinciBot)";
    currentToolFile.value = await downloadFileFromOSS(
      opusOssId,
      fileName,
      "application/octet-stream"
    );
    currentToolTaskId.value = "";
    currentToolUrl.value = await buildStudentToolIframeUrl(toolId);
    toolIframeLoading.value = true;
    showHistoryOpusModal.value = false;
    showToolIframeModal.value = true;
  } catch (error) {
    currentHistoryOpus.value = null;
    reopenHistoryOpusAfterToolClose.value = false;
    currentToolEditMode.value = false;
    console.error("打开历史作品编辑失败", error);
    ElMessage.error(error instanceof Error ? error.message : "打开历史作品编辑失败");
  }
};

const submitHistoryOpus = async () => {
  const opus = historyOpusList.value.find(
    (item) => String(item.opusId || item.id || "") === selectedHistoryOpusId.value
  );
  if (!opus || !selectedTaskId.value) {
    ElMessage.warning("请选择要关联的作品");
    return;
  }

  try {
    await studentSubmitTask({
      taskId: selectedTaskId.value,
      opusName: opus.opusName,
      coverOssId: opus.coverOssId,
      opusOssId: opus.opusOssId,
    });

    closeHistoryOpusModal();
    await refreshSelectedTaskDetail(selectedTaskId.value);
    ElMessage.success("关联成功");
  } catch (error) {
    console.error("关联历史作品失败", error);
    ElMessage.error(error instanceof Error ? error.message : "关联历史作品失败");
  }
};

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

const resolveStudentToolId = (task: any, startData?: any): "vincibot" | "nous" | "" => {
  const candidates = [
    startData?.fileType,
    startData?.toolType,
    startData?.editorType,
    startData?.editor,
    task?.raw?.fileType,
    task?.raw?.toolType,
    task?.raw?.editorType,
    task?.raw?.editor,
    task?.raw?.fileTypeName,
    task?.raw?.taskName,
    task?.raw?.fileName,
    task?.raw?.resourceName,
    task?.taskName,
  ];

  for (const candidate of candidates) {
    const toolId = normalizeFreeCodingToolId(candidate);
    if (toolId) {
      return toolId;
    }
  }

  return "";
};

const resolveStudentTaskFileName = (task: any, startData?: any) => {
  const fileName = firstNonEmptyString(
    startData?.fileName,
    startData?.resourceName,
    task?.raw?.fileName,
    task?.raw?.resourceName,
    task?.raw?.taskName,
    task?.taskName,
    "project"
  );

  if (/\.[^.]+$/i.test(fileName)) {
    return fileName;
  }

  const toolId = resolveStudentToolId(task, startData);
  const category = Number(task?.resourceCategory ?? -1);
  if (toolId || category === 7 || category === 12) {
    return `${fileName}.mc`;
  }

  return fileName;
};

const resolveStudentTaskResourceUrl = (task: any, startData?: any) => {
  return firstNonEmptyString(
    startData?.resourceUrl,
    startData?.taskUrl,
    task?.raw?.resourceUrl,
    task?.raw?.taskUrl
  );
};

const resolveStudentTaskOssId = (task: any, startData?: any) => {
  return firstNonEmptyString(
    startData?.resourceOssId,
    startData?.ossId,
    task?.raw?.resourceOssId,
    task?.raw?.ossId
  );
};

const isMcTask = (task: any, startData?: any) => {
  const candidates = [
    startData?.fileName,
    startData?.resourceName,
    task?.raw?.fileName,
    task?.raw?.resourceName,
    task?.raw?.taskName,
    task?.taskName,
    resolveStudentTaskResourceUrl(task, startData),
    task?.raw?.fileTypeName,
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase());

  return candidates.some((item) => item.includes(".mc"));
};

const shouldOpenToolIframe = (task: any, startData?: any) => {
  const category = Number(task?.resourceCategory ?? -1);
  if (category === 7 || category === 12) return true;
  return isMcTask(task, startData) || !!resolveStudentToolId(task, startData);
};

const submittedTaskTabs = computed(() => [
  { key: "project" as const, label: "提交工程文件" },
  { key: "video" as const, label: "提交视频" },
  { key: "image" as const, label: "提交图片" },
]);

const selectedTaskRaw = computed(() => selectedTask.value?.raw || {});

const splitUrlList = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text) return [];
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const submittedProjectCoverUrl = computed(() =>
  firstNonEmptyString(
    selectedTaskRaw.value?.opus?.coverUrl,
    selectedTaskRaw.value?.coverUrl,
    selectedTaskRaw.value?.cover,
    selectedTaskRaw.value?.opusCoverUrl,
    selectedTaskRaw.value?.imgUrl,
    selectedTaskRaw.value?.imageUrl
  )
);

const submittedVideoUrl = computed(() =>
  firstNonEmptyString(
    selectedTaskRaw.value?.opus?.videoUrl,
    selectedTaskRaw.value?.videoUrl,
    selectedTaskRaw.value?.taskVideoUrl
  )
);

const submittedVideoOssId = computed(() => {
  if (hiddenVideoPreview.value) {
    return "";
  }
  return firstNonEmptyString(
    selectedTaskRaw.value?.opus?.videoOssId,
    selectedTaskRaw.value?.videoOssId
  );
});

const submittedImageUrls = computed(() => {
  const opusPicUrlList = splitUrlList(selectedTaskRaw.value?.opus?.picUrl);
  if (opusPicUrlList.length > 0) {
    return opusPicUrlList;
  }

  const rawPicUrlList = splitUrlList(selectedTaskRaw.value?.picUrl);
  if (rawPicUrlList.length > 0) {
    return rawPicUrlList;
  }

  const rawImages = [
    selectedTaskRaw.value?.picUrls,
    selectedTaskRaw.value?.imageUrls,
    selectedTaskRaw.value?.images,
  ].find((item) => Array.isArray(item));

  if (Array.isArray(rawImages)) {
    return rawImages.map((item: any) => String(item?.url || item || "")).filter(Boolean);
  }

  const singleImage = firstNonEmptyString(
    selectedTaskRaw.value?.imageUrl,
    selectedTaskRaw.value?.coverUrl
  );
  return singleImage ? [singleImage] : [];
});

const submittedImageOssIds = computed(() => {
  const rawIds = splitUrlList(
    firstNonEmptyString(
      selectedTaskRaw.value?.opus?.picOssIds,
      selectedTaskRaw.value?.picOssIds
    )
  );
  if (rawIds.length === 0) {
    return [];
  }

  const rawUrls = submittedImageUrls.value;
  if (hiddenImageUrls.value.length === 0 || rawIds.length !== rawUrls.length) {
    return rawIds;
  }

  return rawIds.filter(
    (_, index) => !hiddenImageUrls.value.includes(rawUrls[index] || "")
  );
});

const submittedTaskToolLabel = computed(() => {
  const category = Number(selectedTask.value?.resourceCategory ?? -1);
  if (category === 7) {
    return "mc";
  }

  const toolType = firstNonEmptyString(
    selectedTaskRaw.value?.opus?.opusType,
    selectedTaskRaw.value?.fileTypeName,
    selectedTaskRaw.value?.fileType
  ).toLowerCase();

  if (toolType.includes("nous")) {
    return "Nous";
  }
  if (toolType.includes("vinci")) {
    return "uCode4";
  }

  return "uCode4";
});

const submittedTaskDisplayName = computed(() => {
  return (
    firstNonEmptyString(
      selectedTaskRaw.value?.opus?.opusName,
      selectedTaskRaw.value?.opusName,
      selectedTaskRaw.value?.taskName,
      selectedTask.value?.taskName
    ) || "未命名作品"
  );
});

const displayVideoUrl = computed(() => {
  if (hiddenVideoPreview.value) {
    return "";
  }
  return localVideoUrl.value || submittedVideoUrl.value || "";
});
const visibleRemoteImageUrls = computed(() => {
  if (hiddenImageUrls.value.length === 0) {
    return submittedImageUrls.value;
  }
  return submittedImageUrls.value.filter((url) => !hiddenImageUrls.value.includes(url));
});
const displayImageUrls = computed(() => {
  return [...visibleRemoteImageUrls.value, ...localImageUrls.value];
});
const activeDisplayImageUrl = computed(
  () => displayImageUrls.value[activeImageIndex.value] || ""
);
const activeImageRotation = computed(() => {
  const localIndex = activeImageIndex.value - visibleRemoteImageUrls.value.length;
  if (localIndex < 0) {
    return 0;
  }
  return localImageRotations.value[localIndex] || 0;
});
const imageUploadSlots = computed(() => Array.from({ length: 6 }, (_, index) => index));
const hasPendingVideoUpload = computed(() => !!localVideoFile.value);
const hasPendingImageUpload = computed(() => localImageFiles.value.length > 0);

const resetSubmissionAssetState = () => {
  closeCameraCapturePanel();
  localVideoUrl.value = "";
  localVideoFile.value = null;
  localImageUrls.value = [];
  localImageFiles.value = [];
  localImageRotations.value = [];
  hiddenVideoPreview.value = false;
  hiddenImageUrls.value = [];
  activeImageIndex.value = 0;
};

const stopCameraStream = () => {
  cameraStream.value?.getTracks().forEach((track) => track.stop());
  cameraStream.value = null;
  if (cameraVideoRef.value) {
    cameraVideoRef.value.srcObject = null;
  }
};

const closeCameraCapturePanel = () => {
  if (cameraRecording.value && mediaRecorderRef.value?.state === "recording") {
    mediaRecorderRef.value.stop();
  }
  stopCameraStream();
  showCameraCaptureModal.value = false;
  cameraCaptureLoading.value = false;
  cameraCaptureUnavailable.value = false;
  cameraPreviewReady.value = false;
  cameraActionPending.value = false;
  cameraRecording.value = false;
  recordedVideoChunks.value = [];
  mediaRecorderRef.value = null;
};

const waitForCameraVideoReady = (video: HTMLVideoElement) => {
  return new Promise<void>((resolve, reject) => {
    if ((video.videoWidth || 0) > 0 && (video.videoHeight || 0) > 0 && video.readyState >= 2) {
      resolve();
      return;
    }

    let settled = false;
    let timeoutId = 0;

    const cleanup = () => {
      video.removeEventListener("loadedmetadata", handleReady);
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("canplay", handleReady);
      video.removeEventListener("error", handleError);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };

    const finish = (handler: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      handler();
    };

    const handleReady = () => finish(resolve);
    const handleError = () => finish(() => reject(new Error("摄像头画面加载失败")));

    video.addEventListener("loadedmetadata", handleReady);
    video.addEventListener("loadeddata", handleReady);
    video.addEventListener("canplay", handleReady);
    video.addEventListener("error", handleError);

    timeoutId = window.setTimeout(() => {
      finish(() => reject(new Error("摄像头预览加载超时")));
    }, 5000);
  });
};

const attachCameraStreamToVideo = async () => {
  if (!cameraVideoRef.value || !cameraStream.value) {
    return false;
  }

  const video = cameraVideoRef.value;
  if (video.srcObject !== cameraStream.value) {
    video.srcObject = cameraStream.value;
  }

  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;

  try {
    await video.play();
    await waitForCameraVideoReady(video);
  } catch (error) {
    console.warn("摄像头预览未就绪", error);
  }

  return (video.videoWidth || 0) > 0 && (video.videoHeight || 0) > 0;
};

const ensureCameraPreviewReady = async () => {
  if (cameraPreviewReady.value) {
    return true;
  }

  await nextTick();
  const ready = await attachCameraStreamToVideo();
  cameraPreviewReady.value = ready;
  return ready;
};

const openCameraCapturePanel = async (mode: "video" | "image") => {
  cameraCaptureMode.value = mode;
  showCameraCaptureModal.value = true;
  cameraCaptureLoading.value = true;
  cameraCaptureUnavailable.value = false;
  cameraPreviewReady.value = false;
  cameraActionPending.value = false;
  cameraRecording.value = false;
  recordedVideoChunks.value = [];
  stopCameraStream();

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraCaptureLoading.value = false;
    cameraCaptureUnavailable.value = true;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: mode === "video",
    });
    cameraStream.value = stream;
    cameraCaptureLoading.value = false;
    await nextTick();
    cameraPreviewReady.value = await attachCameraStreamToVideo();
  } catch (error) {
    console.error("打开摄像头失败", error);
    cameraCaptureLoading.value = false;
    cameraCaptureUnavailable.value = true;
  }
};

const triggerVideoRecord = () => {
  void openCameraCapturePanel("video");
};

const triggerVideoUpload = () => {
  videoUploadInputRef.value?.click();
};

const triggerImageCapture = () => {
  void openCameraCapturePanel("image");
};

const triggerImageUpload = () => {
  imageUploadInputRef.value?.click();
};

const clearPendingVideo = () => {
  localVideoFile.value = null;
  localVideoUrl.value = "";
  hiddenVideoPreview.value = true;
};

const removePendingImage = (index: number) => {
  if (index < 0 || index >= displayImageUrls.value.length) return;

  const targetUrl = displayImageUrls.value[index] || "";
  const remoteCount = visibleRemoteImageUrls.value.length;

  if (index < remoteCount) {
    if (targetUrl && !hiddenImageUrls.value.includes(targetUrl)) {
      hiddenImageUrls.value = [...hiddenImageUrls.value, targetUrl];
    }
  } else {
    const localIndex = index - remoteCount;
    if (localIndex >= 0 && localIndex < localImageFiles.value.length) {
      localImageFiles.value.splice(localIndex, 1);
      localImageUrls.value.splice(localIndex, 1);
      localImageRotations.value.splice(localIndex, 1);
    }
  }
  if (activeImageIndex.value >= displayImageUrls.value.length - 1) {
    activeImageIndex.value = Math.max(0, displayImageUrls.value.length - 2);
  }
};

const rotateActiveImage = () => {
  const localIndex = activeImageIndex.value - visibleRemoteImageUrls.value.length;
  if (localIndex < 0) return;
  const current = localImageRotations.value[localIndex] || 0;
  localImageRotations.value[localIndex] = current + 90;
};

const startCameraRecording = () => {
  if (!cameraStream.value || cameraRecording.value || !cameraPreviewReady.value) return;

  recordedVideoChunks.value = [];
  const recorder = new MediaRecorder(cameraStream.value);
  recorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedVideoChunks.value.push(event.data);
    }
  };
  recorder.onstop = () => {
    const videoBlob = new Blob(recordedVideoChunks.value, {
      type: recorder.mimeType || "video/webm",
    });
    const videoFile = new File(
      [videoBlob],
      `record-${Date.now()}.${recorder.mimeType.includes("mp4") ? "mp4" : "webm"}`,
      {
        type: recorder.mimeType || "video/webm",
        lastModified: Date.now(),
      }
    );
    localVideoFile.value = videoFile;
    localVideoUrl.value = URL.createObjectURL(videoFile);
    hiddenVideoPreview.value = false;
    closeCameraCapturePanel();
  };
  mediaRecorderRef.value = recorder;
  recorder.start();
  cameraRecording.value = true;
};

const handleCameraRecordingAction = async () => {
  if (cameraRecording.value) {
    stopCameraRecording();
    return;
  }

  if (!cameraStream.value || cameraActionPending.value) {
    return;
  }

  cameraActionPending.value = true;
  try {
    const ready = await ensureCameraPreviewReady();
    if (!ready) {
      ElMessage.warning("摄像头预览尚未就绪");
      return;
    }
    startCameraRecording();
  } finally {
    cameraActionPending.value = false;
  }
};

const stopCameraRecording = () => {
  if (!mediaRecorderRef.value || mediaRecorderRef.value.state !== "recording") {
    return;
  }
  mediaRecorderRef.value.stop();
  cameraRecording.value = false;
};

const captureCameraImage = async () => {
  if (cameraActionPending.value) {
    return;
  }

  if (!cameraVideoRef.value || !cameraPreviewReady.value) {
    cameraActionPending.value = true;
    const ready = await ensureCameraPreviewReady();
    cameraActionPending.value = false;
    if (!ready || !cameraVideoRef.value) {
      ElMessage.warning("摄像头预览尚未就绪");
      return;
    }
  }

  if (!cameraVideoRef.value || !cameraPreviewReady.value) {
    ElMessage.warning("摄像头预览尚未就绪");
    return;
  }
  const video = cameraVideoRef.value;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 720;
  canvas.height = video.videoHeight || 1280;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92)
  );
  if (!blob) return;

  const remainCount = Math.max(
    0,
    6 - visibleRemoteImageUrls.value.length - localImageFiles.value.length
  );
  if (remainCount <= 0) {
    ElMessage.warning("最多只能上传6张图片");
    closeCameraCapturePanel();
    return;
  }

  const imageFile = new File([blob], `capture-${Date.now()}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
  const startIndex = localImageFiles.value.length;
  localImageFiles.value = [...localImageFiles.value, imageFile];
  localImageUrls.value = [...localImageUrls.value, URL.createObjectURL(imageFile)];
  localImageRotations.value = [...localImageRotations.value, 0];
  activeImageIndex.value = visibleRemoteImageUrls.value.length + startIndex;
  closeCameraCapturePanel();
};

const handleVideoInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) {
    input.value = "";
    return;
  }

  localVideoFile.value = file;
  localVideoUrl.value = URL.createObjectURL(file);
  hiddenVideoPreview.value = false;
  input.value = "";
};

const handleImageInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (files.length === 0) {
    input.value = "";
    return;
  }

  const remainCount = Math.max(
    0,
    6 - visibleRemoteImageUrls.value.length - localImageFiles.value.length
  );
  if (remainCount <= 0) {
    ElMessage.warning("最多只能上传6张图片");
    input.value = "";
    return;
  }

  const appendFiles = files.slice(0, remainCount);
  if (appendFiles.length < files.length) {
    ElMessage.warning("最多只能上传6张图片，超出的图片已忽略");
  }

  const startIndex = localImageFiles.value.length;
  localImageFiles.value = [...localImageFiles.value, ...appendFiles];
  localImageUrls.value = [
    ...localImageUrls.value,
    ...appendFiles.map((file) => URL.createObjectURL(file)),
  ];
  localImageRotations.value = [...localImageRotations.value, ...appendFiles.map(() => 0)];
  activeImageIndex.value = visibleRemoteImageUrls.value.length + startIndex;
  input.value = "";
};

const submitSelectedVideo = async () => {
  if (!selectedTaskId.value) {
    ElMessage.warning("当前任务缺少提交标识");
    return;
  }

  if (!localVideoFile.value && !submittedVideoOssId.value) {
    ElMessage.warning("请先选择视频");
    return;
  }

  mediaSubmitting.value = true;
  try {
    let targetVideoOssId = submittedVideoOssId.value;
    if (localVideoFile.value) {
      const uploadResult = await uploadOSS(localVideoFile.value);
      if (!uploadResult?.ossId) {
        throw new Error("视频上传失败");
      }
      targetVideoOssId = String(uploadResult.ossId);
    }

    await studentSubmitTask({
      taskId: selectedTaskId.value,
      videoOssId: targetVideoOssId,
    });

    await refreshSelectedTaskDetail(selectedTaskId.value);
    ElMessage.success("视频提交成功");
  } catch (error) {
    console.error("提交视频失败", error);
    ElMessage.error(error instanceof Error ? error.message : "提交视频失败");
  } finally {
    mediaSubmitting.value = false;
  }
};

const submitSelectedImages = async () => {
  if (!selectedTaskId.value) {
    ElMessage.warning("当前任务缺少提交标识");
    return;
  }

  if (localImageFiles.value.length === 0 && submittedImageOssIds.value.length === 0) {
    ElMessage.warning("请先选择图片");
    return;
  }

  mediaSubmitting.value = true;
  try {
    let targetImageOssIds = [...submittedImageOssIds.value];
    if (localImageFiles.value.length > 0) {
      const uploadResults = await Promise.all(
        localImageFiles.value.map((file) => uploadOSS(file))
      );
      const ossIds = uploadResults
        .map((item: any) => String(item?.ossId || "").trim())
        .filter(Boolean);

      if (ossIds.length === 0) {
        throw new Error("图片上传失败");
      }
      targetImageOssIds = [...targetImageOssIds, ...ossIds];
    }

    await studentSubmitTask({
      taskId: selectedTaskId.value,
      picOssIds: targetImageOssIds.join(","),
    });

    localImageFiles.value = [];
    localImageUrls.value = [];
    localImageRotations.value = [];
    await refreshSelectedTaskDetail(selectedTaskId.value);
    ElMessage.success("图片提交成功");
  } catch (error) {
    console.error("提交图片失败", error);
    ElMessage.error(error instanceof Error ? error.message : "提交图片失败");
  } finally {
    mediaSubmitting.value = false;
  }
};

const selectImageSlot = (index: number) => {
  activeImageIndex.value = index;
};

const getToolAccessToken = async () => {
  const ssoData = await ssoLogin();
  const accessToken =
    (typeof ssoData === "string" ? ssoData : "") ||
    ssoData?.accessToken ||
    ssoData?.token ||
    ssoData?.access_token ||
    "";

  if (!accessToken) {
    throw new Error("获取工具Token失败");
  }

  return accessToken;
};

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

const buildStudentAiIframeUrl = async (
  toolKey: string,
  projectName: string,
  optId = ""
) => {
  const type = TASK_AI_TYPE_MAP[toolKey];
  if (!type) {
    throw new Error("当前任务缺少可识别的 AI 模型类型");
  }

  const token = await getToolAccessToken();
  const lang = locale.value === "zh" ? "zh" : "en";
  return `https://pre.matatalab.com/?token=${encodeURIComponent(
    token
  )}&type=${type}&projectName=${encodeURIComponent(
    projectName
  )}&lang=${lang}&ch=aiedu&type2=opt${
    optId ? `&optId=${encodeURIComponent(optId)}` : ""
  }`;
};

const downloadStudentAiTaskFile = async (task: any, startData?: any) => {
  const fileName = resolveStudentAiTaskFileName(task);
  const ossId = resolveStudentAiTaskOssId(task, startData);
  const resourceUrl = resolveStudentAiTaskResourceUrl(task, startData);

  if (ossId) {
    return downloadFileFromOSS(ossId, fileName, "application/zip");
  }

  if (!resourceUrl || !/^https?:\/\//i.test(resourceUrl)) {
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

const buildStudentToolIframeUrl = async (toolId: "vincibot" | "nous") => {
  const baseUrl =
    toolId === "nous"
      ? String(runtimeConfig.public.nousCreateUrl || "").trim()
      : String(runtimeConfig.public.vincibotCreateUrl || "").trim();

  if (!baseUrl) {
    throw new Error("当前未配置工具地址");
  }

  const token = await getToolAccessToken();
  const lang = toolId === "vincibot" ? "zh-CN" : "zh";
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}token=${encodeURIComponent(token)}&lang=${lang}&ch=aiedu`;
};

const downloadStudentToolFile = async (task: any, startData?: any) => {
  const fileName = resolveStudentTaskFileName(task, startData);
  const ossId = resolveStudentTaskOssId(task, startData);
  const resourceUrl = resolveStudentTaskResourceUrl(task, startData);

  if (ossId) {
    return downloadFileFromOSS(ossId, fileName, "application/octet-stream");
  }

  if (!resourceUrl || !/^https?:\/\//i.test(resourceUrl)) {
    return null;
  }

  const response = await fetch(resourceUrl);
  if (!response.ok) {
    throw new Error(`下载任务文件失败: ${response.status}`);
  }

  const blob = await response.blob();
  return new File([blob], fileName, {
    type: blob.type || "application/octet-stream",
    lastModified: Date.now(),
  });
};

const postCurrentToolFileToIframe = async () => {
  if (!currentToolFile.value || !currentToolUrl.value) {
    return;
  }

  await postFileBufferToIframe({
    file: currentToolFile.value,
    iframeUrl: currentToolUrl.value,
    iframeWindow: toolIframeRef.value?.contentWindow,
    type: "ZIP_DATA",
  });
};

const downloadStudentToolZipFile = (zipFile: File) => {
  const downloadUrl = URL.createObjectURL(zipFile);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = zipFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
};

const closeTaskAiIframeModal = () => {
  showTaskAiIframeModal.value = false;
  showTaskAiHistoryGallery.value = false;
  taskAiIframeLoading.value = true;
  currentTaskAiUrl.value = "";
  currentTaskAiProjectName.value = "";
  currentTaskAiOptType.value = "";
  currentTaskAiOptId.value = "";
  currentTaskAiTaskId.value = "";
  currentTaskAiToolKey.value = "";
  currentTaskAiFile.value = null;
  currentTaskAiGeneratedPayload.value = null;
  currentTaskAiSelectedSessionId.value = "";
  currentTaskAiChatSessionId.value = "";
  submittingTaskAi.value = false;
};

const handleCloseTaskAiModal = () => {
  closeTaskAiIframeModal();
};

const openTaskAiHistoryGallery = () => {
  showTaskAiHistoryGallery.value = true;
};

const closeTaskAiHistoryGallery = () => {
  showTaskAiHistoryGallery.value = false;
};

const onTaskAiIframeLoad = () => {
  taskAiIframeLoading.value = false;
  if (!currentTaskAiFile.value) return;
  window.setTimeout(() => {
    void postCurrentAiFileToIframe();
  }, 300);
};

const handleAiPaintingGenerateStart = () => {
  currentTaskAiGeneratedPayload.value = null;
  currentTaskAiSelectedSessionId.value = "";
};

const handleAiQaSessionReady = (payload: { sessionId: string }) => {
  currentTaskAiChatSessionId.value = String(payload.sessionId || "").trim();
};

const handleTaskAiHistorySelect = (item: {
  sessionId: string;
  imageUrl: string;
  content: string;
}) => {
  const sessionId = String(item?.sessionId || "").trim();
  if (sessionId) {
    currentTaskAiOptId.value = sessionId;
    currentTaskAiSelectedSessionId.value = sessionId;
  }
  if (item?.content) {
    currentTaskAiProjectName.value = String(item.content).trim();
  }
  closeTaskAiHistoryGallery();
};

const handleAiPaintingSessionLoaded = (payload: {
  sessionId: string;
  imageUrls: string[];
  prompt: string;
}) => {
  currentTaskAiGeneratedPayload.value = {
    sessionId: String(payload.sessionId || "").trim(),
    imageUrls: Array.isArray(payload.imageUrls)
      ? payload.imageUrls.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
    prompt: String(payload.prompt || "").trim(),
  };
  if (payload.sessionId) {
    currentTaskAiOptId.value = String(payload.sessionId).trim();
  }
  if (payload.prompt) {
    currentTaskAiProjectName.value = String(payload.prompt).trim();
  }
  ElMessage.success("已载入画廊作品，可直接提交任务");
};

const buildAiPaintingImageProxyUrl = (url: string) => {
  const normalizedUrl = String(url || "").trim();
  if (!normalizedUrl) return "";
  if (
    normalizedUrl.startsWith("data:") ||
    normalizedUrl.startsWith("blob:") ||
    normalizedUrl.startsWith("/")
  ) {
    return normalizedUrl;
  }
  if (/^https?:\/\//i.test(normalizedUrl)) {
    return `/api/ai-image-proxy?url=${encodeURIComponent(normalizedUrl)}`;
  }
  return normalizedUrl;
};

const resolveAiPaintingImageExtension = (url: string, mimeType = "") => {
  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();
  if (normalizedMimeType === "image/jpeg") return "jpg";
  if (normalizedMimeType === "image/webp") return "webp";
  if (normalizedMimeType === "image/gif") return "gif";
  if (normalizedMimeType === "image/bmp") return "bmp";
  if (normalizedMimeType === "image/svg+xml") return "svg";
  if (normalizedMimeType === "image/png") return "png";

  const pathname = String(url || "").split("?")[0] || "";
  const extension = pathname.split(".").pop()?.toLowerCase() || "";
  return extension || "png";
};

const downloadAiPaintingImageFile = async (url: string, index: number) => {
  const targetUrl = buildAiPaintingImageProxyUrl(url);
  if (!targetUrl) {
    throw new Error("生成图片地址无效");
  }

  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`下载生成图片失败: ${response.status}`);
  }

  const blob = await response.blob();
  const extension = resolveAiPaintingImageExtension(url, blob.type);
  const fileName = `ai-painting-task-${Date.now()}-${index + 1}.${extension}`;
  return new File([blob], fileName, {
    type: blob.type || "image/png",
    lastModified: Date.now(),
  });
};

const handleAiPaintingGenerated = async (payload: {
  sessionId: string;
  imageUrls: string[];
  prompt: string;
}) => {
  if (!currentTaskAiTaskId.value) {
    return;
  }

  const nextImageUrls = Array.isArray(payload.imageUrls)
    ? payload.imageUrls.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  currentTaskAiProjectName.value = payload.prompt || currentTaskAiProjectName.value;
  if (payload.sessionId) {
    currentTaskAiOptId.value = payload.sessionId;
  }
  currentTaskAiGeneratedPayload.value = {
    sessionId: String(payload.sessionId || "").trim(),
    imageUrls: nextImageUrls,
    prompt: String(payload.prompt || "").trim(),
  };
  if (nextImageUrls.length > 0) {
    ElMessage.success("图片生成完成，请点击提交任务");
  }
};

const submitAiPaintingTask = async () => {
  if (!currentTaskAiTaskId.value) {
    ElMessage.warning("当前任务缺少提交标识");
    return;
  }

  const payload = currentTaskAiGeneratedPayload.value;
  const imageUrls = Array.isArray(payload?.imageUrls) ? payload.imageUrls : [];
  if (imageUrls.length === 0) {
    ElMessage.warning("请先生成图片");
    return;
  }

  if (submittingTaskAi.value) {
    return;
  }

  submittingTaskAi.value = true;
  try {
    const uploadResults = await Promise.all(
      imageUrls.map(async (url, index) => {
        const imageFile = await downloadAiPaintingImageFile(url, index);
        return uploadOSS(imageFile);
      })
    );
    const picOssIds = uploadResults
      .map((item: any) => String(item?.ossId || "").trim())
      .filter(Boolean);

    if (picOssIds.length === 0) {
      throw new Error("生成图片上传失败");
    }

    await studentSubmitTask({
      taskId: currentTaskAiTaskId.value,
      opusName:
        String(payload?.prompt || "").trim() ||
        currentTaskAiProjectName.value ||
        selectedTask.value?.taskName,
      picOssIds: picOssIds.join(","),
    });

    if (currentChapterId.value) {
      await loadTaskList(currentChapterId.value);
    }
    ElMessage.success("任务提交成功");
    closeTaskAiIframeModal();
    emit("updated");
  } catch (error) {
    console.error("提交 AI 画图任务失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "提交 AI 画图任务失败");
  } finally {
    submittingTaskAi.value = false;
  }
};

const submitAiQaTask = async () => {
  if (!currentTaskAiTaskId.value) {
    ElMessage.warning("当前任务缺少提交标识");
    return;
  }

  if (!currentTaskAiChatSessionId.value) {
    ElMessage.warning("请先完成 AI 问答");
    return;
  }

  if (submittingTaskAi.value) {
    return;
  }

  submittingTaskAi.value = true;
  try {
    await studentSubmitTask({
      taskId: currentTaskAiTaskId.value,
    });

    if (currentChapterId.value) {
      await loadTaskList(currentChapterId.value);
    }
    ElMessage.success("任务提交成功");
    closeTaskAiIframeModal();
    emit("updated");
  } catch (error) {
    console.error("提交 AI 问答任务失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "提交 AI 问答任务失败");
  } finally {
    submittingTaskAi.value = false;
  }
};

const closeToolIframeModal = () => {
  const shouldRestoreHistoryOpus = reopenHistoryOpusAfterToolClose.value;
  const preferredHistoryOpusId = String(
    currentHistoryOpus.value?.opusId ||
      currentHistoryOpus.value?.id ||
      selectedHistoryOpusId.value ||
      ""
  );
  showToolIframeModal.value = false;
  currentToolUrl.value = "";
  currentToolName.value = "";
  currentToolFile.value = null;
  currentToolTaskId.value = "";
  currentToolEditMode.value = false;
  currentHistoryOpus.value = null;
  reopenHistoryOpusAfterToolClose.value = false;
  toolIframeLoading.value = true;
  if (shouldRestoreHistoryOpus) {
    showHistoryOpusModal.value = true;
    void loadHistoryOpusList(preferredHistoryOpusId);
  }
};

const onToolIframeLoad = () => {
  toolIframeLoading.value = false;
  if (!currentToolFile.value) return;
  window.setTimeout(() => {
    void postCurrentToolFileToIframe();
  }, 300);
};

const openStudentAiTask = async (task: any, startData?: any) => {
  const optType = inferStudentAiTaskOptType(task, startData);
  const toolKey = TASK_AI_TOOL_KEY_MAP[optType];
  if (!toolKey) {
    throw new Error("当前任务缺少可识别的 AI 模型类型");
  }

  const projectName = firstNonEmptyString(
    task?.taskName,
    task?.raw?.taskName,
    task?.raw?.resourceName,
    "AI Model"
  );
  const taskUrl = firstNonEmptyString(task?.raw?.taskUrl, startData?.taskUrl);

  currentTaskAiProjectName.value = projectName;
  currentTaskAiToolKey.value = toolKey;
  currentTaskAiOptType.value = optType;
  currentTaskAiOptId.value = taskUrl ? resolveStudentAiTaskOptId(task, startData) : "";
  currentTaskAiTaskId.value = firstNonEmptyString(
    task?.raw?.taskId,
    task?.raw?.taskid,
    task?.raw?.taskID,
    task?.taskId
  );
  currentTaskAiGeneratedPayload.value = null;
  currentTaskAiSelectedSessionId.value = "";
  currentTaskAiChatSessionId.value = "";
  if (toolKey === "aiPainting") {
    currentTaskAiUrl.value = "";
    currentTaskAiFile.value = null;
    taskAiIframeLoading.value = false;
    showTaskAiIframeModal.value = true;
    return;
  }
  if (toolKey === "smartQA") {
    currentTaskAiUrl.value = "";
    currentTaskAiFile.value = null;
    taskAiIframeLoading.value = false;
    showTaskAiIframeModal.value = true;
    return;
  }

  currentTaskAiFile.value = taskUrl
    ? await downloadStudentAiTaskFile(task, startData)
    : null;
  currentTaskAiUrl.value = await buildStudentAiIframeUrl(
    toolKey,
    projectName,
    taskUrl ? currentTaskAiOptId.value : ""
  );
  taskAiIframeLoading.value = true;
  showTaskAiIframeModal.value = true;
};

const openStudentToolTask = async (task: any, startData?: any) => {
  const toolId = resolveStudentToolId(task, startData) || "vincibot";
  currentToolName.value =
    toolId === "nous" ? "MatataCode (Nous)" : "MatataCode (VinciBot)";
  currentToolFile.value = await downloadStudentToolFile(task, startData);
  currentToolTaskId.value = firstNonEmptyString(
    task?.raw?.taskId,
    task?.raw?.taskid,
    task?.raw?.taskID,
    task?.taskId
  );
  currentToolUrl.value = await buildStudentToolIframeUrl(toolId);
  toolIframeLoading.value = true;
  showToolIframeModal.value = true;
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
  if (messageType === "close-ai-embedded") {
    closeTaskAiIframeModal();
    return;
  }

  if (
    !messageData ||
    (typeof messageData !== "object" && typeof messageData !== "string") ||
    messageType !== "send-tm-zip"
  ) {
    return;
  }

  if (!currentTaskAiTaskId.value) {
    ElMessage.warning("当前任务缺少提交标识");
    return;
  }

  if (submittingTaskAi.value) {
    return;
  }

  submittingTaskAi.value = true;
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

    await studentSubmitTask({
      taskId: currentTaskAiTaskId.value,
    });

    if (currentChapterId.value) {
      await loadTaskList(currentChapterId.value);
    }
    ElMessage.success("任务提交成功");
    closeTaskAiIframeModal();
    emit("updated");
  } catch (error) {
    console.error("提交 AI 实践任务失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "提交 AI 实践任务失败");
  } finally {
    submittingTaskAi.value = false;
  }
};

const resolveExistingProgramOssIds = () => {
  const raw = currentHistoryOpus.value || selectedTaskRaw.value;
  return {
    opusOssId: firstNonEmptyString(
      raw?.opus?.opusOssId,
      raw?.opusOssId,
      raw?.taskOssId,
      raw?.resourceOssId,
      raw?.ossId
    ),
    coverOssId: firstNonEmptyString(raw?.opus?.coverOssId, raw?.coverOssId),
  };
};

const handleToolIframeMessage = async (event: MessageEvent) => {
  if (
    !isMessageFromIframe({
      event,
      iframeWindow: toolIframeRef.value?.contentWindow,
      iframeUrl: currentToolUrl.value,
    })
  ) {
    return;
  }

  console.log("收到学生任务工具 iframe 原始消息:", {
    origin: event.origin,
    data: event.data,
  });

  const messageData = parseMessageData(event.data) as any;
  const messageType = getMessageType(messageData);

  if (
    !messageData ||
    (typeof messageData !== "object" && typeof messageData !== "string")
  ) {
    return;
  }

  if (messageType === "close-ai-embedded") {
    closeToolIframeModal();
    return;
  }

  if (messageType === "saveProject") {
    const zipPayload = pickMessagePayload(messageData, [
      "payload",
      "data",
      "file",
      "blob",
      "arrayBuffer",
      "result",
    ]);
    const zipFile = toZipFile(zipPayload);
    if (!zipFile) {
      console.warn(
        "收到 saveProject 消息，但 payload 不是可转换的文件类型:",
        messageData
      );
      return;
    }

    const normalizedMessageData = {
      ...messageData,
      payload: zipFile,
      zipFile,
      formData: createUploadFormData(zipFile),
    };

    console.log("收到学生任务工具 iframe saveProject 消息:", normalizedMessageData);

    try {
      downloadStudentToolZipFile(zipFile);
      ElMessage.success(`项目已保存：${zipFile.name}`);
    } catch (error) {
      console.error("下载项目文件失败:", error);
      ElMessage.error("下载项目文件失败");
    }
    return;
  }

  if (messageType !== "send-works-sb3" && messageType !== "send-works-mc") {
    return;
  }

  const editingHistoryOpus = currentToolEditMode.value && currentHistoryOpus.value;

  if (!editingHistoryOpus && !currentToolTaskId.value) {
    ElMessage.warning("当前任务缺少提交标识");
    return;
  }

  const worksPayload = pickMessagePayload(messageData, [
    "payload",
    "data",
    "file",
    "blob",
    "arrayBuffer",
  ]) as any;

  const nestedPayload =
    worksPayload &&
    typeof worksPayload === "object" &&
    !(worksPayload instanceof File) &&
    !(worksPayload instanceof Blob) &&
    !(worksPayload instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(worksPayload)
      ? worksPayload
      : null;

  const workFilePayload = nestedPayload
    ? messageType === "send-works-mc"
      ? nestedPayload.mc || nestedPayload.file || nestedPayload.payload
      : nestedPayload.sb3 || nestedPayload.file || nestedPayload.payload
    : worksPayload;

  const coverFile = nestedPayload?.cover instanceof File ? nestedPayload.cover : null;

  const workFile = toWorkFile(
    workFilePayload,
    pickMessageFileName(messageData),
    messageType === "send-works-mc" ? ".mc" : ".sb3"
  );

  if (!workFile) {
    console.warn(
      `收到 ${messageType} 消息，但作品文件不是可转换的文件类型:`,
      messageData
    );
    return;
  }

  if (!coverFile) {
    console.warn(`收到 ${messageType} 消息，但未找到 cover 图片文件:`, messageData);
  }

  if (editingHistoryOpus && !coverFile) {
    ElMessage.warning("当前作品缺少封面文件，无法保存");
    return;
  }

  const normalizedMessageData = {
    ...messageData,
    payload: workFile,
    workFile,
    coverFile,
    formData: createUploadFormData(workFile),
  };

  console.log(`收到学生任务工具 iframe ${messageType} 消息:`, normalizedMessageData);

  if (submittingToolTask.value) {
    return;
  }

  submittingToolTask.value = true;
  try {
    let programSubmitPayload:
      | {
          taskId: string;
          opusName?: string;
          coverOssId?: string;
          opusOssId?: string;
        }
      | string = currentToolTaskId.value;

    if (coverFile) {
      if (currentToolEditMode.value) {
        const { opusOssId, coverOssId } = resolveExistingProgramOssIds();

        if (opusOssId) {
          try {
            await deleteOss(opusOssId);
            console.log("删除旧作品 OSS 成功:", opusOssId);
          } catch (error) {
            console.warn("删除旧作品 OSS 失败，继续上传新文件:", error);
          }
        }

        if (coverOssId && coverOssId !== opusOssId) {
          try {
            await deleteOss(coverOssId);
            console.log("删除旧封面 OSS 成功:", coverOssId);
          } catch (error) {
            console.warn("删除旧封面 OSS 失败，继续上传新文件:", error);
          }
        }
      }

      const uploadResult = await uploadToolWorkFileToOSS(workFile);
      const coverUploadResult = await uploadOSS(coverFile);
      const opusType = currentToolName.value.includes("VinciBot")
        ? "vinci"
        : currentToolName.value.includes("Nous")
        ? "nous"
        : "";

      if (!uploadResult?.ossId || !coverUploadResult?.ossId || !opusType) {
        throw new Error("作品保存参数不完整");
      }

      const opusName =
        (typeof messageData?.projectName === "string" &&
          messageData.projectName.trim()) ||
        workFile.name.replace(/\.[^.]+$/, "");

      console.log(`学生任务工具 iframe ${messageType} 上传 OSS 成功:`, {
        uploadResult,
        coverUploadResult,
        taskId: currentToolTaskId.value,
        editMode: currentToolEditMode.value,
      });

      if (editingHistoryOpus) {
        const opusId = String(
          currentHistoryOpus.value?.opusId || currentHistoryOpus.value?.id || ""
        ).trim();
        if (!opusId) {
          throw new Error("当前作品缺少 opusId");
        }

        await editOpus({
          opusId,
          opusName,
          opusOssId: String(uploadResult.ossId),
          coverOssId: String(coverUploadResult.ossId),
          opusType,
        });
        currentHistoryOpus.value = {
          ...currentHistoryOpus.value,
          opusId,
          opusName,
          opusOssId: String(uploadResult.ossId),
          coverOssId: String(coverUploadResult.ossId),
          opusType,
        };
        ElMessage.success("作品保存成功");
        closeToolIframeModal();
        return;
      }

      programSubmitPayload = {
        taskId: currentToolTaskId.value,
        opusName,
        coverOssId: String(coverUploadResult.ossId),
        opusOssId: String(uploadResult.ossId),
      };
    }

    await studentSubmitTask(programSubmitPayload);
    console.log("学生编程任务提交成功:", {
      taskId: currentToolTaskId.value,
      messageType,
    });
    await refreshSelectedTaskDetail(currentToolTaskId.value);
    ElMessage.success("任务提交成功");
    closeToolIframeModal();
    emit("updated");
  } catch (error) {
    console.error("提交编程任务失败", error);
    ElMessage.error(error instanceof Error ? error.message : "提交编程任务失败");
  } finally {
    submittingToolTask.value = false;
  }
};

const normalizeTaskStatus = (item: any): TaskStatus => {
  return Number(item?.status ?? item?.taskStatus) === 1 ? 1 : 0;
};

const categoryNameMap: Record<number, string> = {
  12: "个人实训任务",
  7: "个人实训任务",
  10: "个人实训任务",
  2: "个人上传任务",
  11: "自定义练习题",
  6: "自定义练习题",
};

const getCategoryName = (category: number) => {
  return categoryNameMap[category] || "任务";
};

const taskStatusLabel = (status: TaskStatus) => {
  return status === 1 ? "已提交" : "未提交";
};

const taskStatusClass = (status: TaskStatus) => {
  return status === 1 ? "task-status-pill--done" : "task-status-pill--pending";
};

const normalizeTaskItem = (
  item: any,
  index: number,
  fallbackCategory?: number
): TaskItem => {
  const taskId = String(item?.taskId || "");
  const key = taskId || `task_${index}`;
  const taskName = String(item?.taskName || "-");
  const menuName = taskName;
  const status = normalizeTaskStatus(item);
  const resourceCategory = Number(item?.resourceCategory ?? fallbackCategory ?? -1);

  return {
    key,
    taskId,
    menuName,
    taskName,
    status,
    resourceCategory,
    raw: item,
  };
};

const refreshSelectedTaskDetail = async (taskId?: string) => {
  const targetTaskId = String(taskId || selectedTaskId.value || "").trim();
  if (!targetTaskId) return;

  try {
    const detail = await getStudentTaskChapterDetail(targetTaskId);
    taskGroups.value = taskGroups.value.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (String(item.taskId || "") !== targetTaskId) {
          return item;
        }

        const nextRaw = {
          ...(item.raw || {}),
          ...(detail || {}),
        };

        return {
          ...item,
          status: Number(detail?.status) === 1 ? 1 : 0,
          raw: nextRaw,
        };
      }),
    }));
  } catch (error) {
    console.error("获取学生编程任务详情失败", error);
  }
};

const normalizeTaskGroupList = (data: any): TaskGroup[] => {
  if (!Array.isArray(data)) return [];

  const hasGroupedTaskList = data.some(
    (group: any) => Array.isArray(group?.taskList) || Array.isArray(group?.resourceList)
  );
  if (hasGroupedTaskList) {
    return data
      .map((group: any, index: number) => {
        const category = Number(group?.resourceCategory ?? -1);
        const groupName = String(
          group?.resourceName || getCategoryName(category) || `任务分组${index + 1}`
        );
        const taskList = Array.isArray(group?.taskList)
          ? group.taskList
          : Array.isArray(group?.resourceList)
          ? group.resourceList
          : [];
        const items = taskList.map((task: any, taskIndex: number) =>
          normalizeTaskItem(task, taskIndex, category)
        );

        return {
          key: `cat_${category}_${index}`,
          name: groupName,
          items,
        };
      })
      .filter((group: TaskGroup) => group.items.length > 0);
  }

  const groupedMap = new Map<number, TaskGroup>();
  data.forEach((item: any, index: number) => {
    const category = Number(item?.resourceCategory ?? -1);
    if (!groupedMap.has(category)) {
      groupedMap.set(category, {
        key: `cat_${category}`,
        name: String(item?.resourceName || getCategoryName(category)),
        items: [],
      });
    }
    groupedMap.get(category)!.items.push(normalizeTaskItem(item, index, category));
  });

  return [...groupedMap.values()].filter((group) => group.items.length > 0);
};

const normalizeChapterList = (data: any): ChapterItem[] => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.records)
    ? data.records
    : Array.isArray(data?.rows)
    ? data.rows
    : Array.isArray(data?.list)
    ? data.list
    : [];

  return list
    .map((item: any, index: number) => ({
      id: firstNonEmptyString(item?.chapterId, item?.id, item?.recordId, `${index}`),
      name:
        firstNonEmptyString(
          item?.chapterName,
          item?.chapterTitle,
          item?.title,
          item?.name
        ) || `章节${index + 1}`,
    }))
    .filter((item: ChapterItem) => !!item.id);
};

const resetTaskSelection = () => {
  const firstTask = taskGroups.value[0]?.items?.[0];
  selectedTaskKey.value = firstTask ? firstTask.key : "";
};

const loadTaskList = async (chapterId: string) => {
  if (!chapterId) {
    taskGroups.value = [];
    selectedTaskKey.value = "";
    return;
  }

  taskListLoading.value = true;
  try {
    const data = await getStudentTaskList(chapterId);
    taskGroups.value = normalizeTaskGroupList(data);

    const nextExpanded: Record<string, boolean> = {};
    taskGroups.value.forEach((group) => {
      nextExpanded[group.key] = expandedGroups.value[group.key] ?? true;
    });
    expandedGroups.value = nextExpanded;

    const hasSelected = taskGroups.value.some((group) =>
      group.items.some((item) => item.key === selectedTaskKey.value)
    );
    if (!hasSelected) {
      resetTaskSelection();
    }
  } catch (error: any) {
    console.error("获取学生任务列表失败", error);
    taskGroups.value = [];
    selectedTaskKey.value = "";
  } finally {
    taskListLoading.value = false;
  }
};

const loadPageData = async () => {
  const queryChapterId = chapterIdFromSource.value;

  // 左侧菜单数据以 getStudentTaskList 为准，优先使用外部传入的 chapterId
  currentChapterId.value = queryChapterId;
  if (currentChapterId.value) {
    await loadTaskList(currentChapterId.value);
  }

  // 章节列表仅用于顶部切换下拉
  if (!courseId.value) return;
  try {
    const chapterData = await getStudentTaskChapterList(courseId.value);
    chapterList.value = normalizeChapterList(chapterData);
  } catch (error) {
    console.error("获取章节列表失败", error);
    chapterList.value = [];
  }

  if (!currentChapterId.value && chapterList.value.length > 0) {
    currentChapterId.value = chapterList.value[0]!.id;
    await loadTaskList(currentChapterId.value);
    return;
  }

  if (currentChapterId.value && chapterList.value.length > 0) {
    const matched = chapterList.value.find((item) => item.id === currentChapterId.value);
    if (!matched) {
      currentChapterId.value = chapterList.value[0]!.id;
      await loadTaskList(currentChapterId.value);
    }
  }
};

const selectChapter = async (chapter: ChapterItem) => {
  if (chapter.id === currentChapterId.value) {
    return;
  }

  currentChapterId.value = chapter.id;
  selectedTaskKey.value = "";

  if (!embedded.value) {
    await router.replace({
      path: "/student/task",
      query: {
        ...route.query,
        courseId: courseId.value || undefined,
        chapterId: chapter.id,
        chapterName: chapter.name,
      },
    });
  }

  await loadTaskList(chapter.id);
};

const handleChapterSelectChange = async (value: string | number | null, option: any) => {
  const chapterId = String(option?.id ?? option?.value ?? value ?? "");
  if (!chapterId) return;
  const chapterName = String(option?.name ?? option?.label ?? "");
  await selectChapter({ id: chapterId, name: chapterName });
};

const toggleGroup = (groupKey: string) => {
  expandedGroups.value[groupKey] = !expandedGroups.value[groupKey];
};

const handleTaskSubmitted = async () => {
  if (!currentChapterId.value) return;
  exerciseStep.value = 1;
  await loadTaskList(currentChapterId.value);
  emit("updated");
};

const handleViewDetail = () => {
  handleDoTask();
};

const handleNextStep = () => {
  if (!isSelectedTaskSubmitted.value) return;
  exerciseStep.value = 2;
};

const handlePrevStep = () => {
  exerciseStep.value = 1;
};

const handleExerciseCardClick = () => {
  handleDoTask();
};

const handleEditAiTask = async () => {
  if (!selectedTask.value) return;

  const taskId = firstNonEmptyString(
    selectedTask.value.raw?.taskId,
    selectedTask.value.raw?.taskid,
    selectedTask.value.raw?.taskID,
    selectedTask.value.taskId
  );
  if (!taskId) {
    ElMessage.warning("当前任务缺少 taskId");
    return;
  }

  doingTask.value = true;
  try {
    await openStudentAiTask(selectedTask.value, selectedTask.value.raw);
  } catch (error) {
    console.error("重新提交 AI 实践任务失败", error);
    ElMessage.error(
      error instanceof Error ? error.message : "重新提交 AI 实践任务失败"
    );
  } finally {
    doingTask.value = false;
  }
};

const handleEditProgramTask = async () => {
  if (!selectedTask.value) return;

  const taskId = firstNonEmptyString(
    selectedTask.value.raw?.taskId,
    selectedTask.value.raw?.taskid,
    selectedTask.value.raw?.taskID,
    selectedTask.value.taskId
  );
  if (!taskId) {
    ElMessage.warning("当前任务缺少 taskId");
    return;
  }

  const category = Number(selectedTask.value.resourceCategory ?? -1);
  const isCodingTask = category === 12 || category === 7;

  doingTask.value = true;
  try {
    if (isCodingTask) {
      currentToolEditMode.value = true;
      await openStudentToolTask(selectedTask.value, selectedTask.value.raw);
      return;
    }

    const data = await startStudentTask(String(taskId));
    const taskUrl = firstNonEmptyString(
      data?.taskUrl,
      data?.url,
      data?.resourceUrl,
      data?.previewUrl
    );
    if (taskUrl && /^https?:\/\//i.test(taskUrl)) {
      window.open(taskUrl, "_blank", "noopener,noreferrer");
      return;
    }
  } catch (error) {
    console.error("编辑任务失败", error);
    ElMessage.error(error instanceof Error ? error.message : "编辑任务失败");
  } finally {
    doingTask.value = false;
  }
};

const handleDoTask = async () => {
  if (!selectedTask.value) return;

  const taskId = firstNonEmptyString(
    selectedTask.value.raw?.taskId,
    selectedTask.value.raw?.taskid,
    selectedTask.value.raw?.taskID,
    selectedTask.value.taskId
  );
  if (!taskId) {
    ElMessage.warning("当前任务缺少 taskId");
    return;
  }

  if (isExerciseLikeTask.value && selectedTask.value.status === 1) {
    taskAnswerReadonly.value = true;
    activeTaskId.value = String(taskId);
    activeTaskName.value = selectedTask.value.taskName;
    taskAnswerVisible.value = true;
    return;
  }

  if (selectedTask.value.status === 1) {
    if (isAiPracticeTask.value) {
      await handleEditAiTask();
      return;
    }
    ElMessage.warning("任务已提交");
    return;
  }

  doingTask.value = true;
  try {
    const data = await startStudentTask(String(taskId));
    if (isExerciseLikeTask.value) {
      taskAnswerReadonly.value = false;
      activeTaskId.value = String(taskId);
      activeTaskName.value = selectedTask.value.taskName;
      taskAnswerVisible.value = true;
      return;
    }

    if (isAiPracticeTask.value) {
      await openStudentAiTask(selectedTask.value, data);
      return;
    }

    if (shouldOpenToolIframe(selectedTask.value, data)) {
      currentToolEditMode.value = false;
      await openStudentToolTask(selectedTask.value, data);
      return;
    }

    const taskUrl = firstNonEmptyString(
      data?.taskUrl,
      data?.url,
      data?.resourceUrl,
      data?.previewUrl
    );
    if (taskUrl && /^https?:\/\//i.test(taskUrl)) {
      window.open(taskUrl, "_blank", "noopener,noreferrer");
      return;
    }
    ElMessage.success("任务已开始");
  } catch (error: any) {
    console.error("开始任务失败", error);
  } finally {
    doingTask.value = false;
  }
};

const goBack = () => {
  if (embedded.value) {
    emit("close");
    return;
  }
  router.back();
};

onMounted(() => {
  loadPageData();
  window.addEventListener("message", handleTaskAiIframeMessage);
  window.addEventListener("message", handleToolIframeMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleTaskAiIframeMessage);
  window.removeEventListener("message", handleToolIframeMessage);
  closeCameraCapturePanel();
  closeTaskAiIframeModal();
  closeToolIframeModal();
});

watch(
  () => selectedTaskKey.value,
  async () => {
    exerciseStep.value = 1;
    activeSubmissionAssetTab.value = "project";
    resetSubmissionAssetState();

    const category = Number(selectedTask.value?.resourceCategory ?? -1);
    if (category === 7 || category === 12) {
      await refreshSelectedTaskDetail(selectedTaskId.value);
    }
  }
);

watch(
  () => submittedTaskTabs.value.map((tab) => tab.key).join(","),
  () => {
    const currentVisible = submittedTaskTabs.value.some(
      (tab) => tab.key === activeSubmissionAssetTab.value
    );
    if (!currentVisible) {
      activeSubmissionAssetTab.value = submittedTaskTabs.value[0]?.key || "project";
    }
  }
);

watch(
  () => [courseId.value, chapterIdFromSource.value, chapterNameFromQuery.value],
  () => {
    loadPageData();
  }
);

watch(
  () => props.refreshToken,
  async () => {
    if (!embedded.value || !currentChapterId.value) return;
    await loadTaskList(currentChapterId.value);
  }
);
</script>

<style scoped>
.student-task-page {
  height: calc(100vh - 70px);
}

.student-task-page--embedded {
  height: 100%;
}

.task-shell {
  margin: 10px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
}

.task-header {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.task-header--embedded {
  justify-content: center;
}

.header-left {
  width: 280px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.header-title {
  flex: 1;
  text-align: center;
  color: #111827;
  font-size: 20px;
  line-height: 1;
  font-weight: 600;
}

.task-header--embedded .header-title {
  flex: initial;
}

.header-right {
  width: 280px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid #d1d5db;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.iframe-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.iframe-modal-container {
  width: 95vw;
  height: 94vh;
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
  min-height: 0;
}

.iframe-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px 18px;
  border-top: 1px solid #eef2f7;
  background: #ffffff;
}

.iframe-modal-footer--ai-painting {
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.04);
}

.iframe-modal-footer__hint {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.iframe-submit-btn {
  flex-shrink: 0;
  min-width: 140px;
  height: 42px;
  padding: 0 22px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffae2b 0%, #ff9900 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  box-shadow: 0 10px 24px rgba(255, 153, 0, 0.22);
}

.iframe-submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(255, 153, 0, 0.28);
}

.iframe-submit-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
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
  animation: tool-iframe-spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #666666;
}

@keyframes tool-iframe-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.chapter-name {
  color: #111827;
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
}

.chapter-select {
  width: 260px;
}

.chapter-select :deep(.relative > div:first-child) {
  height: 36px;
  border-radius: 10px;
}

.chapter-select :deep(.relative > div:first-child span) {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.task-body {
  min-height: 0;
  flex: 1;
  display: flex;
  gap: 10px;
}

.task-sidebar {
  width: 240px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 8px 0;
  overflow-y: auto;
}

.task-group {
  margin-bottom: 8px;
}

.task-group-title {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
}

.task-group-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.task-group-arrow.expanded {
  transform: rotate(180deg);
}

.task-group-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.task-item {
  width: 100%;
  min-height: 36px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  border-right: 3px solid transparent;
  transition: background-color 0.2s ease;
}

.task-item:hover {
  background: #f9fafb;
}

.task-item.active {
  background: #e6f4ed;
  border-right-color: #4ed17a;
}

.task-status-pill {
  min-width: 56px;
  height: 24px;
  border-radius: 7px;
  font-size: 11px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  flex-shrink: 0;
}

.task-status-pill--pending {
  background: #ffe4ec;
  color: #ff5f8a;
}

.task-status-pill--done {
  background: #e8f8ee;
  color: #31b86f;
}

.task-status-pill--none {
  background: #eceff3;
  color: #98a2b3;
}

.task-item-name {
  flex: 1;
  color: #111827;
  font-size: 13px;
  line-height: 1.35;
}

.task-sidebar-skeleton {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-main {
  min-width: 0;
  flex: 1;
}

.task-main-card {
  height: 100%;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 14px;
}

.exercise-stepper {
  width: 100%;
  max-width: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}

.exercise-step {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
}

.exercise-step--active {
  color: #111827;
}

.exercise-step--done {
  color: #111827;
}

.exercise-step-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  color: #9ca3af;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.exercise-step--active .exercise-step-dot {
  border-color: #4fcb8f;
  background: #4fcb8f;
  color: #ffffff;
}

.exercise-step--done .exercise-step-dot {
  border-color: #4fcb8f;
  background: #ecfff4;
  color: #36c873;
  font-weight: 700;
}

.exercise-step-text {
  font-size: 22px;
  line-height: 1;
  font-weight: 500;
  white-space: nowrap;
}

.exercise-step-line {
  flex: 1;
  max-width: 240px;
  height: 1px;
  background: #d1d5db;
}

.exercise-step-line--active {
  background: #4fcb8f;
}

.task-main-skeleton {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
}

.task-empty {
  color: #9ca3af;
  font-size: 14px;
  justify-content: center;
}

.task-submit-title {
  margin: 0;
  color: #111827;
  font-size: 18px;
  line-height: 1;
  font-weight: 600;
}

.task-submit-desc {
  margin: 12px 0 10px;
  color: #111827;
  font-size: 13px;
  line-height: 1.4;
}

.task-submit-desc--exercise {
  margin-top: 18px;
  margin-bottom: 14px;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 500;
}

.submitted-task-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #12305a;
}

.submitted-task-title {
  margin: 8px 0 30px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  color: #12305a;
}

.submitted-task-desc {
  margin: 0 0 22px;
  font-size: 14px;
  line-height: 1.9;
  color: #12305a;
  text-align: center;
}

.submitted-task-tabs {
  display: inline-flex;
  align-items: center;
  margin-bottom: 34px;
  padding: 1px;
  gap: 1px;
  overflow: hidden;
  background: #d4dde8;
}

.submitted-task-tab {
  min-width: 114px;
  height: 38px;
  padding: 0 18px;
  border: none;
  background: #ffffff;
  color: #3e556d;
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submitted-task-tab.active {
  background: #fff7e6;
  color: #ff9900;
  box-shadow: inset 0 0 0 1px #ff9900;
}

.submitted-task-tab-star {
  color: #ff5f73;
  font-weight: 700;
}

.submitted-task-preview-wrap {
  width: min(100%, 620px);
  position: relative;
  margin-bottom: 138px;
}

.submitted-task-relate-btn {
  position: absolute;
  right: 0;
  top: -2px;
  z-index: 4;
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid #ffe3bf;
  background: #ffffff;
  color: #ff9900;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 10px 26px rgba(255, 153, 0, 0.14);
  cursor: pointer;
  transition: all 0.2s ease;
}

.submitted-task-relate-btn:hover {
  background: #fff7e6;
  border-color: #ffd28d;
}

.submitted-task-preview-card {
  width: 100%;
  min-height: 380px;
  padding-top: 36px;
  position: relative;
}

.submitted-task-preview-card--clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submitted-task-preview-card--clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 40px rgba(255, 153, 0, 0.12);
}

.submitted-task-video-panel,
.submitted-task-image-panel {
  width: 100%;
  min-height: 310px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 42px rgba(18, 48, 90, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 24px;
}

.submitted-task-video-panel--filled,
.submitted-task-image-panel--filled {
  padding: 0;
  overflow: hidden;
  position: relative;
}

.submitted-task-video-hint {
  font-size: 14px;
  line-height: 2;
  color: #4d6482;
  text-align: center;
}

.submitted-task-video-actions {
  margin-top: 58px;
  display: flex;
  align-items: center;
  gap: 18px;
}

.submitted-task-camera-live {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.submitted-task-camera-video {
  width: 100%;
  max-width: 520px;
  height: 260px;
  object-fit: cover;
  border-radius: 14px;
  background: #e9eef5;
}

.submitted-task-camera-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.submitted-task-camera-empty {
  width: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #12305a;
}

.submitted-task-camera-empty-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.submitted-task-camera-empty-desc {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.8;
  color: #4d6482;
}

.submitted-task-camera-back {
  margin-top: 20px;
  min-width: 120px;
  height: 40px;
  padding: 0 20px;
  border: 1px solid #c7d7ea;
  background: #ffffff;
  color: #12305a;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.submitted-task-secondary-btn {
  min-width: 132px;
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid #c7d7ea;
  background: #ffffff;
  color: #12305a;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submitted-task-secondary-btn--primary {
  border-color: #ff9900;
  background: #ff9900;
  color: #ffffff;
}

.submitted-task-secondary-btn:hover {
  border-color: #ff9900;
  color: #ff9900;
  background: #fff7e6;
}

.submitted-task-secondary-btn--primary:hover {
  background: #f39000;
  border-color: #f39000;
  color: #ffffff;
}

.submitted-task-footnote {
  margin: -96px 0 110px;
  font-size: 14px;
  line-height: 1.8;
  color: #1f2f46;
  text-align: center;
}

.submitted-task-image-strip {
  width: 100%;
  margin: 0 0 14px;
  display: grid;
  grid-template-columns: repeat(6, minmax(90px, 1fr));
  gap: 8px;
}

.submitted-task-image-slot {
  position: relative;
  height: 68px;
  border-radius: 8px;
  border: 1px solid #c8d8f1;
  background: #f8fbff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submitted-task-image-slot.active {
  border-color: #ff9900;
  box-shadow: inset 0 0 0 1px #ff9900;
  background: #fff7e6;
}

.submitted-task-image-slot-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #ffffff;
  padding: 4px;
}

.submitted-task-display-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  background: #ffffff;
  display: block;
  margin: auto;
  padding: 10px;
  transition: transform 0.2s ease;
}

.submitted-task-media-delete,
.submitted-task-image-delete {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  border: 1px solid #ffd28d;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #ff9900;
  font-size: 18px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 6px 14px rgba(255, 153, 0, 0.12);
}

.submitted-task-image-delete {
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  font-size: 14px;
}

.submitted-task-rotate-btn {
  position: absolute;
  right: 14px;
  bottom: 14px;
  min-width: 72px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #ffd28d;
  background: rgba(255, 255, 255, 0.95);
  color: #ff9900;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(255, 153, 0, 0.14);
}

.submitted-task-image-slot-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.submitted-task-badge {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;
  min-width: 84px;
  height: 38px;
  padding: 0 18px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background: linear-gradient(135deg, #ffb347 0%, #ff9900 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 22px rgba(255, 153, 0, 0.22);
}

.submitted-task-preview-image,
.submitted-task-preview-video,
.submitted-task-preview-placeholder,
.submitted-task-empty-panel {
  width: 100%;
  height: 310px;
  border-radius: 10px;
  overflow: hidden;
}

.submitted-task-preview-image,
.submitted-task-preview-video {
  display: block;
  object-fit: cover;
  background: #eef3f8;
}

.submitted-task-preview-placeholder {
  background: linear-gradient(180deg, #cc5878 0%, #e1b375 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #ffffff;
}

.submitted-task-placeholder-icon {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.16);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
}

.submitted-task-placeholder-name {
  max-width: 72%;
  font-size: 18px;
  line-height: 1.5;
  font-weight: 600;
  text-align: center;
}

.submitted-task-empty-panel {
  border: 1px dashed #d6dfeb;
  background: #f8fbff;
  color: #8da1b8;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submitted-task-edit-btn {
  min-width: 128px;
  height: 38px;
  padding: 0 28px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffb347 0%, #ff9900 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 153, 0, 0.22);
  transition: all 0.2s ease;
}

.submitted-task-edit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(255, 153, 0, 0.28);
}

.submitted-task-edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.history-opus-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.history-opus-modal {
  width: min(1400px, 100%);
  min-height: 780px;
  max-height: 92vh;
  overflow: auto;
  position: relative;
  border-radius: 20px;
  background: #ffffff;
  padding: 28px 30px 30px;
  box-shadow: 0 24px 64px rgba(17, 24, 39, 0.18);
}

.history-opus-close {
  position: absolute;
  top: 18px;
  right: 18px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.history-opus-title {
  margin: 0 0 28px;
  text-align: center;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.history-opus-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.history-opus-tag {
  min-width: 106px;
  height: 40px;
  padding: 0 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffb347 0%, #ff9900 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
}

.history-opus-search {
  flex: 1;
  max-width: 320px;
}

.history-opus-input {
  width: 100%;
  height: 40px;
  border: 1px solid #d9e0ea;
  background: #ffffff;
  color: #111827;
  padding: 0 14px;
  font-size: 14px;
  outline: none;
}

.history-opus-input:focus {
  border-color: #ff9900;
  box-shadow: 0 0 0 2px rgba(255, 153, 0, 0.08);
}

.history-opus-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-opus-btn {
  min-width: 128px;
  height: 40px;
  padding: 0 22px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-opus-btn--primary {
  border: 1px solid #ff9900;
  background: #ff9900;
  color: #ffffff;
}

.history-opus-btn--primary:hover {
  background: #f39000;
  border-color: #f39000;
}

.history-opus-btn--ghost {
  border: 1px solid #ffd28d;
  background: #ffffff;
  color: #ff9900;
}

.history-opus-btn--ghost:hover {
  background: #fff7e6;
}

.history-opus-table-wrap {
  border-top: 1px solid #edf2f7;
}

.history-opus-table {
  width: 100%;
  border-collapse: collapse;
}

.history-opus-table thead tr {
  background: #fff7e6;
}

.history-opus-table th,
.history-opus-table td {
  height: 56px;
  padding: 0 14px;
  border-bottom: 1px solid #edf2f7;
  text-align: left;
  font-size: 14px;
  color: #111827;
}

.history-opus-table th {
  font-weight: 700;
}

.history-opus-col-select {
  width: 44px;
}

.history-opus-table tbody tr {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.history-opus-table tbody tr:hover {
  background: #fffaf2;
}

.history-opus-table tbody tr.selected {
  background: #fff7e6;
}

.history-opus-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #cdd5df;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.history-opus-radio.selected {
  border-color: #ff9900;
  box-shadow: inset 0 0 0 5px #ff9900;
}

.history-opus-row-btn {
  min-width: 64px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid #ff9900;
  background: #ffffff;
  color: #ff9900;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.history-opus-row-btn:hover {
  background: #fff7e6;
}

.history-opus-empty {
  text-align: center !important;
  color: #94a3b8 !important;
}

.history-opus-footer {
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 26px;
}

.history-opus-pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #111827;
  font-size: 14px;
}

.history-opus-page-btn,
.history-opus-page-current {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9e0ea;
  background: #ffffff;
  color: #64748b;
}

.history-opus-page-current {
  border-color: #ff9900;
  color: #ff9900;
  font-weight: 700;
}

.history-opus-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.history-opus-submit-btn {
  min-width: 130px;
  height: 40px;
  padding: 0 28px;
  border: none;
  background: linear-gradient(135deg, #ffb347 0%, #ff9900 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 153, 0, 0.22);
}

.history-opus-submit-btn:hover {
  transform: translateY(-1px);
}

.submitted-task-view .submitted-task-preview-wrap {
  margin-bottom: 88px;
}

.submitted-task-view .submitted-task-image-panel {
  min-height: 230px;
}

.submitted-task-view .submitted-task-image-panel.submitted-task-image-panel--filled {
  min-height: 230px;
  height: 230px;
  padding: 8px 10px 14px;
}

.submitted-task-view .submitted-task-video-panel.submitted-task-video-panel--filled {
  min-height: 230px;
  height: 230px;
}

.submitted-task-view .submitted-task-footnote {
  margin: -36px 0 44px;
}

.exercise-result-table {
  width: 100%;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.exercise-result-head,
.exercise-result-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1.2fr 1.2fr;
  align-items: center;
}

.exercise-result-head {
  height: 48px;
  background: #f3f4f6;
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
}

.exercise-result-head > div,
.exercise-result-row > div {
  padding: 0 14px;
}

.exercise-result-row {
  min-height: 58px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
  font-size: 13px;
}

.exercise-result-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exercise-score-box {
  width: 110px;
  height: 32px;
  border-radius: 8px;
  background: #f8f1e5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.exercise-result-detail-btn {
  width: 92px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #cfd8e3;
  background: #ffffff;
  color: #111827;
  font-size: 14px;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.exercise-result-detail-btn:hover {
  border-color: #9bb0c9;
  color: #0f172a;
}

.exercise-preview-card {
  width: 236px;
  border-radius: 16px;
  border: 9px solid #e2e8f0;
  overflow: hidden;
  background: #f8fafc;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.exercise-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.exercise-preview-body {
  height: 182px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.exercise-scroll-icon {
  width: 76px;
  height: 96px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f7b500 0%, #f2a900 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: -9px 9px 0 #f08c00;
}

.exercise-scroll-fold {
  position: absolute;
  left: -12px;
  top: 0;
  width: 12px;
  height: 20px;
  border-top-left-radius: 12px;
  background: #ec8e00;
}

.exercise-scroll-line {
  width: 30px;
  height: 4px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.45);
}

.exercise-pointer {
  position: absolute;
  right: 10px;
  bottom: -2px;
  width: 62px;
  height: 62px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.exercise-pointer-icon {
  position: relative;
  z-index: 2;
  font-size: 42px;
  line-height: 1;
  animation: pointerFloat 1.4s ease-in-out infinite;
}

.exercise-pointer-ripple {
  position: absolute;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(79, 203, 143, 0.28);
  animation: pointerRipple 1.4s ease-out infinite;
}

.exercise-preview-name {
  height: 48px;
  background: #eef2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-preview-card {
  width: 200px;
  height: 184px;
  border-radius: 12px;
  border: 7px solid #dbe2ea;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.task-preview-icon {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  background: #4aa7ff;
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.task-preview-name {
  max-width: 164px;
  text-align: center;
  color: #111827;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 600;
  word-break: break-all;
}

.task-submit-btn {
  margin-top: auto;
  width: 100px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(180deg, #62d86f 0%, #4fcb8f 100%);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
}

.task-submit-btn--exercise {
  width: 128px;
  height: 38px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 18px;
  background: #ff9900;
}

.task-submit-btn--exercise:hover:not(:disabled) {
  background: #e68a00;
}

.exercise-action-row {
  margin-top: auto;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.task-submit-btn--detail {
  margin-bottom: 0;
  background: linear-gradient(180deg, #67df79 0%, #43cf72 100%);
}

.task-submit-btn--detail:hover:not(:disabled) {
  background: linear-gradient(180deg, #5cd46f 0%, #39c368 100%);
}

.task-submit-btn--next {
  margin-bottom: 0;
  background: #ffffff;
  color: #43cf72;
  border: 1px solid #9ae3b2;
}

.task-submit-btn--next:hover:not(:disabled) {
  background: #f4fff8;
}

.task-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submitted-task-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #12305a;
}

.submitted-task-title {
  margin: 8px 0 30px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  color: #12305a;
}

.submitted-task-desc {
  margin: 0 0 22px;
  font-size: 14px;
  line-height: 1.9;
  color: #12305a;
  text-align: center;
}

.submitted-task-tabs {
  display: inline-flex;
  align-items: center;
  margin-bottom: 34px;
  padding: 1px;
  gap: 1px;
  overflow: hidden;
  background: #d4dde8;
}

.submitted-task-tab {
  min-width: 114px;
  height: 38px;
  padding: 0 18px;
  border: none;
  background: #ffffff;
  color: #3e556d;
  font-size: 14px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submitted-task-tab.active {
  background: #fff7e6;
  color: #ff9900;
  box-shadow: inset 0 0 0 1px #ff9900;
}

.submitted-task-tab-star {
  color: #ff5f73;
  font-weight: 700;
}

.submitted-task-preview-wrap {
  width: min(100%, 620px);
  position: relative;
  margin-bottom: 138px;
}

.submitted-task-relate-btn {
  position: absolute;
  right: 0;
  top: -2px;
  height: 36px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid #ffe3bf;
  background: #ffffff;
  color: #ff9900;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 10px 26px rgba(255, 153, 0, 0.14);
  cursor: pointer;
  transition: all 0.2s ease;
}

.submitted-task-relate-btn:hover {
  background: #fff7e6;
  border-color: #ffd28d;
}

.submitted-task-preview-card {
  width: 100%;
  min-height: 380px;
  padding-top: 36px;
  position: relative;
}

.submitted-task-badge {
  position: absolute;
  left: 0;
  top: 0;
  min-width: 84px;
  height: 38px;
  padding: 0 18px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background: linear-gradient(135deg, #ffb347 0%, #ff9900 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 22px rgba(255, 153, 0, 0.22);
}

.submitted-task-preview-image,
.submitted-task-preview-video,
.submitted-task-preview-placeholder,
.submitted-task-empty-panel {
  width: 100%;
  height: 310px;
  border-radius: 10px;
  overflow: hidden;
}

.submitted-task-preview-image,
.submitted-task-preview-video {
  display: block;
  object-fit: cover;
  background: #eef3f8;
}

.submitted-task-preview-placeholder {
  background: linear-gradient(180deg, #cc5878 0%, #e1b375 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #ffffff;
}

.submitted-task-placeholder-icon {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.16);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 1px;
}

.submitted-task-placeholder-name {
  max-width: 72%;
  font-size: 18px;
  line-height: 1.5;
  font-weight: 600;
  text-align: center;
}

.submitted-task-empty-panel {
  border: 1px dashed #d6dfeb;
  background: #f8fbff;
  color: #8da1b8;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submitted-task-edit-btn {
  min-width: 128px;
  height: 38px;
  padding: 0 28px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffb347 0%, #ff9900 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(255, 153, 0, 0.22);
  transition: all 0.2s ease;
}

.submitted-task-edit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(255, 153, 0, 0.28);
}

.submitted-task-edit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@keyframes pointerFloat {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  40% {
    transform: translate(-3px, -3px) rotate(-3deg);
  }
  70% {
    transform: translate(1px, 1px) rotate(2deg);
  }
}

@keyframes pointerRipple {
  0% {
    transform: scale(0.65);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.2);
    opacity: 0.15;
  }
  100% {
    transform: scale(1.35);
    opacity: 0;
  }
}

@media (max-width: 1200px) {
  .task-shell {
    margin: 10px;
    padding: 10px;
  }

  .header-left {
    width: 280px;
  }

  .header-right {
    width: 280px;
  }

  .header-title {
    font-size: 18px;
  }

  .chapter-name {
    font-size: 15px;
  }

  .chapter-select {
    width: 240px;
  }

  .chapter-select :deep(.relative > div:first-child span) {
    font-size: 15px;
  }

  .exercise-step-text {
    font-size: 20px;
  }

  .task-submit-desc--exercise {
    font-size: 20px;
  }

  .submitted-task-preview-wrap {
    width: min(100%, 560px);
    margin-bottom: 120px;
  }

  .submitted-task-image-strip {
    width: calc(100% + 40px);
    margin-left: -20px;
  }

  .submitted-task-preview-image,
  .submitted-task-preview-video,
  .submitted-task-preview-placeholder,
  .submitted-task-empty-panel {
    height: 280px;
  }

  .exercise-result-head,
  .exercise-result-row {
    grid-template-columns: 1.8fr 1.8fr 1fr 1.1fr 1.1fr;
  }

  .exercise-preview-card {
    width: 220px;
    border-width: 8px;
  }

  .exercise-preview-body {
    height: 168px;
  }

  .exercise-preview-name {
    height: 44px;
    font-size: 16px;
  }

  .task-submit-btn--exercise {
    width: 120px;
    height: 36px;
    font-size: 16px;
  }

  .exercise-action-row {
    gap: 10px;
  }
}

@media (max-width: 900px) {
  .task-body {
    flex-direction: column;
  }

  .task-sidebar {
    width: 100%;
    max-height: 280px;
  }

  .header-title {
    font-size: 17px;
  }

  .chapter-name {
    font-size: 13px;
  }

  .chapter-select {
    width: 200px;
  }

  .chapter-select :deep(.relative > div:first-child span) {
    font-size: 13px;
  }

  .task-submit-title {
    font-size: 17px;
  }

  .task-submit-desc {
    font-size: 13px;
  }

  .exercise-stepper {
    gap: 8px;
  }

  .exercise-step-dot {
    width: 22px;
    height: 22px;
    font-size: 12px;
  }

  .exercise-step-text {
    font-size: 14px;
  }

  .task-submit-desc--exercise {
    margin-top: 14px;
    margin-bottom: 12px;
    font-size: 14px;
  }

  .submitted-task-tabs {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .submitted-task-tab {
    min-width: 0;
    padding: 0 8px;
    font-size: 13px;
  }

  .submitted-task-preview-wrap {
    width: 100%;
    margin-bottom: 108px;
  }

  .submitted-task-relate-btn {
    position: static;
    margin: 0 0 14px auto;
    display: inline-flex;
  }

  .submitted-task-preview-card {
    min-height: 280px;
    padding-top: 34px;
  }

  .submitted-task-video-panel,
  .submitted-task-image-panel {
    min-height: 220px;
    padding: 24px 18px;
  }

  .submitted-task-video-actions {
    margin-top: 34px;
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  .submitted-task-secondary-btn {
    width: 100%;
  }

  .submitted-task-image-strip {
    width: 100%;
    margin: 0 0 12px;
    gap: 6px;
  }

  .submitted-task-image-slot {
    height: 54px;
  }

  .submitted-task-preview-image,
  .submitted-task-preview-video,
  .submitted-task-preview-placeholder,
  .submitted-task-empty-panel {
    height: 220px;
  }

  .submitted-task-placeholder-icon {
    width: 68px;
    height: 68px;
    font-size: 22px;
  }

  .submitted-task-placeholder-name {
    font-size: 15px;
  }

  .submitted-task-footnote {
    margin: -74px 0 88px;
    font-size: 13px;
    line-height: 1.7;
  }

  .submitted-task-view .submitted-task-preview-wrap {
    margin-bottom: 64px;
  }

  .submitted-task-view .submitted-task-image-panel.submitted-task-image-panel--filled,
  .submitted-task-view .submitted-task-video-panel.submitted-task-video-panel--filled {
    min-height: 200px;
    height: 200px;
  }

  .exercise-result-table {
    overflow-x: auto;
  }

  .exercise-result-head,
  .exercise-result-row {
    min-width: 760px;
  }

  .exercise-preview-card {
    width: 188px;
    border-width: 7px;
  }

  .exercise-preview-body {
    height: 140px;
  }

  .exercise-scroll-icon {
    width: 60px;
    height: 76px;
    gap: 5px;
    box-shadow: -6px 6px 0 #f08c00;
  }

  .exercise-scroll-fold {
    left: -10px;
    width: 10px;
    height: 18px;
  }

  .exercise-scroll-line {
    width: 24px;
    height: 3px;
  }

  .exercise-pointer {
    right: 8px;
    width: 48px;
    height: 48px;
  }

  .exercise-pointer-icon {
    font-size: 32px;
  }

  .exercise-pointer-ripple {
    width: 26px;
    height: 26px;
  }

  .exercise-preview-name {
    height: 40px;
    font-size: 14px;
  }

  .task-submit-btn--exercise {
    width: 108px;
    height: 34px;
    font-size: 15px;
  }

  .exercise-action-row {
    gap: 8px;
  }
}
</style>
