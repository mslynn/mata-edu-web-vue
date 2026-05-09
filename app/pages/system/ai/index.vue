<template>
  <div ref="aiAssistantPageRef" class="ai-assistant-page" :style="pageAdaptiveStyle">
    <div class="ai-assistant-container">
      <TeacherSidebar />

      <div class="ai-assistant-content">
        <div
          class="ai-assistant-shell"
          :class="{
            'ai-assistant-shell--chat': isChatMode,
            'ai-assistant-shell--code': isCodeAssistantMode,
          }"
        >
          <section
            v-if="showBreadcrumb"
            class="ai-assistant-breadcrumb"
            aria-label="面包屑"
          >
            <button
              type="button"
              class="ai-assistant-breadcrumb__entry"
              @click="handleBreadcrumbRootClick"
            >
              {{ breadcrumbRootLabel }}
            </button>
            <template v-if="showBreadcrumbCurrent">
              <span class="material-symbols-outlined ai-assistant-breadcrumb__icon">
                chevron_right
              </span>
              <span class="ai-assistant-breadcrumb__current">
                {{ assistantCurrentTitle }}
              </span>
            </template>
          </section>

          <section
            v-if="!isChatMode && !isLessonPlanMode && !isAnalysisMode && !isImageMode"
            class="ai-assistant-hero"
          >
            <h1 class="ai-assistant-hero__title">AI助手</h1>
            <div class="ai-assistant-hero__desc-row">
              <p class="ai-assistant-hero__desc">全方位的智慧教育辅助工具</p>
              <div class="ai-assistant-hero__line" aria-hidden="true"></div>
            </div>
          </section>

          <section
            v-if="isChatMode"
            class="ai-assistant-chat"
            :class="{ 'is-code-assistant': isCodeAssistantMode }"
          >
            <div v-if="!isCodeAssistantMode" class="ai-assistant-chat__header">
              <div class="ai-assistant-chat__title-wrap">
                <h2 class="ai-assistant-chat__title">{{ chatModeTitle }}</h2>
                <p class="ai-assistant-chat__subtitle">
                  {{ chatModeSubtitle }}
                </p>
              </div>
              <!-- <button type="button" class="ai-assistant-chat__new" @click="startNewChat">
                <span class="material-symbols-outlined">add</span>
                <span>新建会话</span>
              </button> -->
            </div>

            <div
              v-if="lessonPlanChatActive"
              ref="lessonChatEditorRef"
              class="ai-chat-lesson-editor"
            >
              <button
                type="button"
                class="ai-chat-lesson-editor__head"
                @click="toggleLessonChatEditor"
              >
                <div class="ai-chat-lesson-editor__head-left">
                  <span class="material-symbols-outlined">description</span>
                  <strong>{{ lessonPlanSummaryText }}</strong>
                </div>
                <span class="material-symbols-outlined">
                  {{ lessonChatEditorExpanded ? "expand_less" : "expand_more" }}
                </span>
              </button>

              <div v-if="lessonChatEditorExpanded" class="ai-chat-lesson-editor__body">
                <div class="ai-chat-lesson-editor__scroll">
                <label v-if="shouldShowLessonGrade" class="ai-assistant-lesson__label">
                  <span>
                    <span class="ai-assistant-lesson__required">*</span>
                    <span>选择年级</span>
                  </span>
                  <MSelect
                    v-model="lessonPlanForm.grade"
                    :options="lessonPlanGradeOptions"
                    placeholder="请选择面向学生所属年级"
                    class="ai-assistant-lesson__mselect"
                    dropdown-class="ai-lesson-select-dropdown"
                  />
                </label>

                <div
                  v-if="lessonPlanSessionType === 4"
                  class="ai-assistant-lesson__row ai-chat-lesson-editor__row"
                >
                  <span class="ai-assistant-lesson__label-text">
                    <span class="ai-assistant-lesson__required">*</span>
                    <span>题目种类</span>
                  </span>
                  <label class="ai-assistant-lesson__radio">
                    <input
                      v-model="lessonPlanForm.questionKind"
                      type="radio"
                      value="scene"
                    />
                    <span>情境类</span>
                  </label>
                  <label class="ai-assistant-lesson__radio">
                    <input
                      v-model="lessonPlanForm.questionKind"
                      type="radio"
                      value="knowledge"
                    />
                    <span>知识类</span>
                  </label>
                </div>

                <div
                  v-if="lessonPlanSessionType === 2"
                  class="ai-assistant-lesson__row ai-chat-lesson-editor__row"
                >
                  <span class="ai-assistant-lesson__label-text">
                    <span class="ai-assistant-lesson__required">*</span>
                    <span>单元类型</span>
                  </span>
                  <label class="ai-assistant-lesson__radio">
                    <input
                      v-model="lessonPlanForm.unitType"
                      type="radio"
                      value="single"
                    />
                    <span>单一课时</span>
                  </label>
                  <label class="ai-assistant-lesson__radio">
                    <input
                      v-model="lessonPlanForm.unitType"
                      type="radio"
                      value="unit"
                    />
                    <span>单元教学</span>
                  </label>
                </div>

                <label
                  v-if="lessonPlanSessionType === 2 && lessonPlanForm.unitType === 'unit'"
                  class="ai-assistant-lesson__label"
                >
                  <span>
                    <span class="ai-assistant-lesson__required">*</span>
                    <span>课时数</span>
                  </span>
                  <MSelect
                    v-model="lessonPlanForm.periodCount"
                    :options="lessonPlanPeriodOptions"
                    placeholder="请选择课时数"
                    class="ai-assistant-lesson__mselect"
                    dropdown-class="ai-lesson-select-dropdown"
                  />
                </label>

                <label class="ai-assistant-lesson__label">
                    <span>
                      <span class="ai-assistant-lesson__required">*</span>
                      <span>{{ lessonPlanModeSubjectLabel }}</span>
                    </span>
                  <div class="ai-assistant-lesson__textarea-wrap">
                    <textarea
                      v-model="lessonPlanForm.subject"
                      class="ai-assistant-lesson__input ai-assistant-lesson__textarea"
                      :maxlength="LESSON_PLAN_SUBJECT_MAX_LENGTH"
                      placeholder="请简短描述课程主题方向"
                      rows="3"
                    ></textarea>
                    <span class="ai-assistant-lesson__count">
                      {{ lessonPlanSubjectLength }} / {{ LESSON_PLAN_SUBJECT_MAX_LENGTH }}
                    </span>
                  </div>
                </label>

                <label class="ai-assistant-lesson__label">
                  <span>
                    <span v-if="lessonPlanSessionType === 4" class="ai-assistant-lesson__required">*</span>
                    <span>情境选择</span>
                  </span>
                  <MSelect
                    v-model="lessonPlanForm.scenario"
                    :options="lessonPlanScenarioOptions"
                    placeholder="请选择或自行输入情境"
                    class="ai-assistant-lesson__mselect"
                    dropdown-class="ai-lesson-select-dropdown"
                    filterable
                  />
                </label>

                <label
                  v-if="lessonPlanSessionType === 4"
                  class="ai-assistant-lesson__label"
                >
                  <span class="ai-assistant-lesson__label-text">
                    <span class="ai-assistant-lesson__required">*</span>
                    <span>题目类型及数量</span>
                  </span>
                  <div class="ai-assistant-lesson__question-types">
                    <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--single">
                      <span class="ai-assistant-lesson__question-chip">单选题</span>
                      <MSelect
                        v-model="lessonPlanForm.singleCount"
                        :options="lessonPlanQuestionCountOptions"
                        class="ai-assistant-lesson__question-count-select"
                        dropdown-class="ai-lesson-select-dropdown"
                      />
                    </div>
                    <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--multiple">
                      <span class="ai-assistant-lesson__question-chip">多选题</span>
                      <MSelect
                        v-model="lessonPlanForm.multipleCount"
                        :options="lessonPlanQuestionCountOptions"
                        class="ai-assistant-lesson__question-count-select"
                        dropdown-class="ai-lesson-select-dropdown"
                      />
                    </div>
                    <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--judge">
                      <span class="ai-assistant-lesson__question-chip">判断题</span>
                      <MSelect
                        v-model="lessonPlanForm.judgeCount"
                        :options="lessonPlanQuestionCountOptions"
                        class="ai-assistant-lesson__question-count-select"
                        dropdown-class="ai-lesson-select-dropdown"
                      />
                    </div>
                    <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--blank">
                      <span class="ai-assistant-lesson__question-chip">填空题</span>
                      <MSelect
                        v-model="lessonPlanForm.blankCount"
                        :options="lessonPlanQuestionCountOptions"
                        class="ai-assistant-lesson__question-count-select"
                        dropdown-class="ai-lesson-select-dropdown"
                      />
                    </div>
                    <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--connect">
                      <span class="ai-assistant-lesson__question-chip">连线题</span>
                      <MSelect
                        v-model="lessonPlanForm.connectCount"
                        :options="lessonPlanQuestionCountOptions"
                        class="ai-assistant-lesson__question-count-select"
                        dropdown-class="ai-lesson-select-dropdown"
                      />
                    </div>
                  </div>
                </label>

                <div class="ai-assistant-lesson__double">
                  <label class="ai-assistant-lesson__label">
                    <span>教具选择</span>
                    <MSelect
                      v-model="lessonPlanForm.teachTool"
                      :options="lessonPlanToolOptions"
                      placeholder="请选择教具"
                      class="ai-assistant-lesson__mselect"
                      dropdown-class="ai-lesson-select-dropdown"
                    />
                  </label>
                  <label class="ai-assistant-lesson__label">
                    <span>硬件</span>
                    <MSelect
                      v-model="lessonPlanForm.hardware"
                      :options="lessonPlanHardwareOptions"
                      placeholder="请选择硬件"
                      class="ai-assistant-lesson__mselect"
                      dropdown-class="ai-lesson-select-dropdown"
                    />
                  </label>
                </div>

                <label class="ai-assistant-lesson__label">
                  <div
                    ref="lessonRequirementTipsRef"
                    class="ai-assistant-lesson__label-with-helper"
                  >
                    <span>特殊需求</span>
                    <button
                      v-if="lessonPlanSessionType === 2"
                      type="button"
                      class="ai-assistant-lesson__helper-entry"
                      @click.stop="toggleLessonRequirementTips"
                    >
                      <span>常用提示词</span>
                      <span class="material-symbols-outlined">contact_support</span>
                    </button>

                    <div
                      v-if="lessonPlanSessionType === 2 && lessonRequirementTipsVisible"
                      class="ai-assistant-lesson__helper-panel"
                    >
                      <p class="ai-assistant-lesson__helper-title">特殊需求示例：</p>
                      <button
                        v-for="item in lessonRequirementTips"
                        :key="`${item.tag}-${item.text}`"
                        type="button"
                        class="ai-assistant-lesson__helper-item"
                        @click.stop="insertLessonRequirementTip(item)"
                      >
                        <span class="ai-assistant-lesson__helper-item-text">
                          【{{ item.tag }}】{{ item.text }}
                        </span>
                        <span class="material-symbols-outlined">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div class="ai-assistant-lesson__textarea-wrap">
                    <textarea
                      v-model="lessonPlanForm.specialRequirement"
                      class="ai-assistant-lesson__input ai-assistant-lesson__textarea"
                      :maxlength="LESSON_PLAN_REQUIREMENT_MAX_LENGTH"
                      placeholder="可输入教学目标、教学方法或需要包含的特定内容"
                      rows="3"
                    ></textarea>
                    <span class="ai-assistant-lesson__count">
                      {{ lessonPlanRequirementLength }} / {{ LESSON_PLAN_REQUIREMENT_MAX_LENGTH }}
                    </span>
                  </div>
                </label>

                <label class="ai-assistant-lesson__label">
                  <span>依据的标准</span>
                  <div
                    ref="lessonStandardSelectRef"
                    class="ai-assistant-lesson__multi-select"
                  >
                    <button
                      type="button"
                      class="ai-assistant-lesson__multi-trigger"
                      :class="{ 'is-open': lessonStandardDropdownVisible }"
                      @click.stop="toggleLessonStandardDropdown"
                    >
                      <div
                        v-if="lessonPlanForm.standard.length > 0"
                        class="ai-assistant-lesson__multi-values"
                      >
                        <span
                          v-for="value in lessonPlanForm.standard"
                          :key="value"
                          class="ai-assistant-lesson__multi-tag"
                        >
                          <span>{{ value }}</span>
                          <button
                            type="button"
                            class="ai-assistant-lesson__multi-tag-remove"
                            @click.stop="removeLessonStandardOption(value)"
                          >
                            <span class="material-symbols-outlined">close</span>
                          </button>
                        </span>
                      </div>
                      <span v-else class="ai-assistant-lesson__multi-placeholder">
                        {{ lessonPlanModeStandardPlaceholder }}
                      </span>
                      <span class="material-symbols-outlined ai-assistant-lesson__multi-arrow">
                        {{ lessonStandardDropdownVisible ? "expand_less" : "expand_more" }}
                      </span>
                    </button>

                    <div
                      v-if="lessonStandardDropdownVisible"
                      class="ai-assistant-lesson__multi-dropdown"
                    >
                      <button
                        v-for="option in lessonPlanStandardOptions"
                        :key="option.value"
                        type="button"
                        class="ai-assistant-lesson__multi-option"
                        :class="{ 'is-selected': lessonPlanForm.standard.includes(option.value) }"
                        @click.stop="toggleLessonStandardOption(option.value)"
                      >
                        <span>{{ option.label }}</span>
                        <span
                          v-if="lessonPlanForm.standard.includes(option.value)"
                          class="material-symbols-outlined"
                        >
                          done
                        </span>
                      </button>
                    </div>
                  </div>
                </label>

                <div class="ai-assistant-lesson-upload">
                  <div class="ai-assistant-lesson-upload__label-wrap">
                    <span class="ai-assistant-lesson-upload__label">上传文件</span>
                    <div class="ai-assistant-lesson-upload__help">
                      <span class="material-symbols-outlined">help</span>
                      <div
                        class="ai-assistant-upload__tooltip ai-assistant-upload__tooltip--lesson"
                      >
                        {{ AI_UPLOAD_TOOLTIP_TEXT }}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="ai-assistant-lesson-upload__button"
                    :disabled="isAiUploading"
                    @click="triggerLessonUpload"
                  >
                    <span class="material-symbols-outlined">add</span>
                  </button>
                  <input
                    ref="lessonUploadInputRef"
                    type="file"
                    :accept="AI_UPLOAD_ACCEPT"
                    class="ai-assistant-upload__input"
                    @change="handleAiFileChange"
                  />
                </div>

                <div
                  v-if="lessonPlanChatActive && aiUploadFile"
                  class="ai-assistant-upload-file ai-assistant-upload-file--lesson"
                >
                  <div class="ai-assistant-upload-file__icon">
                    <span class="material-symbols-outlined">
                      {{ resolveAiUploadIcon(aiUploadFile.name) }}
                    </span>
                  </div>
                  <div class="ai-assistant-upload-file__content">
                    <strong class="ai-assistant-upload-file__name">
                      {{ formatAiUploadFileName(aiUploadFile.name) }}
                    </strong>
                    <span
                      class="ai-assistant-upload-file__status"
                      :class="{ 'is-error': aiUploadStatus === 'error' }"
                    >
                      {{ isAiUploading ? aiUploadStatusText : formatAiUploadFileSize(aiUploadFile.size) }}
                    </span>
                  </div>
                  <div v-if="isAiUploading" class="ai-assistant-upload-file__progress">
                    <svg viewBox="0 0 72 72" aria-hidden="true">
                      <circle
                        class="ai-assistant-upload-file__progress-track"
                        cx="36"
                        cy="36"
                        :r="UPLOAD_PROGRESS_RADIUS"
                      />
                      <circle
                        class="ai-assistant-upload-file__progress-value"
                        cx="36"
                        cy="36"
                        :r="UPLOAD_PROGRESS_RADIUS"
                        :stroke-dasharray="UPLOAD_PROGRESS_CIRCUMFERENCE"
                        :stroke-dashoffset="aiUploadProgressOffset"
                      />
                    </svg>
                    <strong>{{ aiUploadProgressPercent }}%</strong>
                  </div>
                  <button
                    v-if="isAiUploading"
                    type="button"
                    class="ai-assistant-upload-file__close is-cancel"
                    @click="handleCancelAiUpload"
                  >
                    <span class="material-symbols-outlined">close</span>
                  </button>
                  <button
                    v-else
                    type="button"
                    class="ai-assistant-upload-file__close"
                    @click="handleRemoveAiUploadFile"
                  >
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
                </div>

                <div class="ai-chat-lesson-editor__actions">
                  <button
                    type="button"
                    class="ai-assistant-lesson__submit ai-chat-lesson-editor__submit"
                    :disabled="!canRegenerateLessonPlan"
                    @click="handleLessonPlanSubmit"
                  >
                    重新生成
                  </button>
                </div>
              </div>
            </div>

            <div
              ref="aiChatListRef"
              class="ai-assistant-chat__list"
              :class="{ 'is-code-assistant': isCodeAssistantMode }"
              @scroll="handleChatListScroll"
            >
              <div v-if="isCodeAssistantMode" class="ai-code-assistant-layout">
                <div class="ai-code-assistant ai-code-assistant--top">
                  <h3 class="ai-code-assistant__title">代码编程助手</h3>

                  <div class="ai-code-assistant__panel">
                    <div class="ai-code-assistant__mascot">
                      <div class="ai-code-assistant__mascot-icon">
                        <span class="material-symbols-outlined">smart_toy</span>
                      </div>
                    </div>

                    <div class="ai-code-assistant__panel-main">
                      <p class="ai-code-assistant__hero-text">
                        我是代码编程助手，你可以通过选中代码进行操作，也可以直接描述需求让我生成代码。
                      </p>

                      <div class="ai-code-assistant__mode-list">
                        <button
                          v-for="item in CODE_ASSISTANT_MODE_OPTIONS"
                          :key="item.value"
                          type="button"
                          class="ai-code-assistant__mode-card"
                          :class="[
                            `is-${item.value}`,
                            { 'is-active': codeAssistantForm.mode === item.value },
                          ]"
                          @click="handleCodeAssistantModeClick(item.value)"
                        >
                          <div class="ai-code-assistant__mode-icon">
                            <span class="material-symbols-outlined">{{ item.icon }}</span>
                          </div>
                          <div class="ai-code-assistant__mode-body">
                            <strong>{{ item.title }}</strong>
                            <span>{{ item.desc }}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-for="item in chatMessages"
                :key="item.id"
                class="ai-chat-message"
                :class="`is-${item.role}`"
              >
                <div
                  v-if="item.role === 'assistant'"
                  class="ai-chat-message__avatar is-assistant"
                >
                  <span class="material-symbols-outlined">smart_toy</span>
                </div>

                <div class="ai-chat-message__bubble-wrap">
                  <div class="ai-chat-message__bubble">
                    <div
                      v-if="item.role === 'assistant' && shouldShowThinkingPanel(item)"
                      class="ai-chat-thinking-card"
                    >
                      <button
                        type="button"
                        class="ai-chat-thinking-card__head"
                        @click="toggleThinkingPanel(item)"
                      >
                        <span
                          class="material-symbols-outlined ai-chat-thinking-card__head-icon"
                        >
                          sync
                        </span>
                        <strong>{{ item.pending ? "思考中..." : "思考已停止" }}</strong>
                        <span
                          class="material-symbols-outlined ai-chat-thinking-card__head-arrow"
                        >
                          {{ item.thinkingCollapsed ? "expand_more" : "expand_less" }}
                        </span>
                      </button>
                      <div
                        v-if="!item.thinkingCollapsed"
                        class="ai-chat-thinking-card__body"
                      >
                        <div v-if="item.pending" class="ai-chat-thinking-card__loading">
                          <span class="ai-chat-thinking-card__spinner"></span>
                        </div>
                        <div
                        v-if="item.content && item.content !== '正在思考中...'"
                        class="ai-chat-thinking-card__markdown"
                        v-html="renderMarkdown(item.content)"
                        @click="handleMarkdownActionClick"
                      ></div>
                      </div>
                    </div>
                    <div
                      v-else-if="item.role === 'assistant'"
                      class="ai-chat-message__markdown"
                      v-html="renderMarkdown(item.content)"
                      @click="handleMarkdownActionClick"
                    ></div>
                    <p v-else class="ai-chat-message__text">
                      {{ item.content }}
                    </p>
                    <div v-if="item.file" class="ai-chat-message__file">
                      <span class="material-symbols-outlined">
                        {{ resolveAiUploadIcon(item.file.name) }}
                      </span>
                      <span>{{ item.file.name }}</span>
                    </div>
                  </div>

                  <div
                    v-if="item.role === 'assistant' && !item.pending && !item.stopped"
                    class="ai-chat-message__actions"
                  >
                    <button
                      type="button"
                      class="ai-chat-message__action"
                      @click="copyChatMessage(item.content)"
                    >
                      <span class="material-symbols-outlined">content_copy</span>
                      <span>复制</span>
                    </button>
                    <button
                      type="button"
                      class="ai-chat-message__action"
                      @click="retryLatestQuestion"
                    >
                      <span class="material-symbols-outlined">refresh</span>
                      <span>再试一次</span>
                    </button>
                    <div
                      v-if="chatSessionType === 6"
                      class="ai-chat-message__generate"
                    >
                      <button
                        type="button"
                        class="ai-chat-message__action"
                        @click="handleGenerateFileAction('ppt-new')"
                      >
                        <span class="material-symbols-outlined">open_in_new</span>
                        <span>生成PPT</span>
                      </button>
                    </div>
                    <div
                      v-else-if="chatSessionType !== 5"
                      class="ai-chat-message__generate"
                      @mouseenter="openGenerateFileMenu(item.id)"
                      @mouseleave="closeGenerateFileMenu(item.id)"
                    >
                      <button
                        type="button"
                        class="ai-chat-message__action"
                      >
                        <span class="material-symbols-outlined">open_in_new</span>
                        <span>{{
                          isPptGenerateMode
                            ? "生成PPT"
                            : isExerciseGenerateMode
                              ? "生成习题"
                              : "生成文件"
                        }}</span>
                      </button>
                      <div
                        v-if="activeGenerateFileMenuMessageId === item.id"
                        class="ai-chat-message__generate-menu"
                      >
                        <template v-if="isPptGenerateMode">
                          <div class="ai-chat-message__generate-group">
                            <button
                              type="button"
                              @click="handleGenerateFileAction('ppt-existing')"
                            >
                              在已有的课程中打开
                            </button>
                            <button type="button" @click="handleGenerateFileAction('ppt-new')">
                              创建新课程并打开
                            </button>
                          </div>
                        </template>
                        <template v-else-if="isExerciseGenerateMode">
                          <div class="ai-chat-message__generate-group">
                            <button
                              type="button"
                              @click="handleGenerateFileAction('exercise-existing')"
                            >
                              修改关联课程
                            </button>
                            <button
                              type="button"
                              @click="handleGenerateFileAction('exercise-new')"
                            >
                              自定义编辑习题
                            </button>
                          </div>
                        </template>
                        <template v-else>
                          <div class="ai-chat-message__generate-group">
                            <strong>教案</strong>
                            <button
                              type="button"
                              @click="handleGenerateFileAction('lesson-existing')"
                            >
                              在已有课程中打开
                            </button>
                            <button
                              type="button"
                              @click="handleGenerateFileAction('lesson-new')"
                            >
                              创建新课程并打开
                            </button>
                          </div>
                          <div class="ai-chat-message__generate-group">
                            <strong>课件</strong>
                            <button
                              type="button"
                              @click="handleGenerateFileAction('ppt-existing')"
                            >
                              在已有的课程中打开
                            </button>
                            <button type="button" @click="handleGenerateFileAction('ppt-new')">
                              创建新课程并打开
                            </button>
                          </div>
                          <div class="ai-chat-message__generate-group">
                            <strong>习题</strong>
                            <button
                              type="button"
                              @click="handleGenerateFileAction('exercise-new')"
                            >
                              生成习题
                            </button>
                          </div>
                        </template>
                      </div>
                    </div>
                    <div class="ai-chat-message__feedback">
                      <button type="button" class="ai-chat-message__icon-btn">
                        <span class="material-symbols-outlined">thumb_up</span>
                      </button>
                      <button type="button" class="ai-chat-message__icon-btn">
                        <span class="material-symbols-outlined">thumb_down</span>
                      </button>
                    </div>
                  </div>

                  <div
                    v-if="item.role === 'assistant' && item.stopped"
                    class="ai-chat-message__stopped"
                  >
                    <span class="ai-chat-message__stopped-label">(已停止)</span>
                    <button
                      type="button"
                      class="ai-chat-message__retry-stop"
                      @click="retryLatestQuestion"
                    >
                      <span class="material-symbols-outlined">refresh</span>
                      <span>再试一次</span>
                    </button>
                  </div>

                  <div
                    v-if="
                      item.id === latestAssistantMessageId &&
                      !item.stopped &&
                      resolveMessageSuggestions(item).length > 0
                    "
                    class="ai-chat-message__suggestions"
                  >
                    <p class="ai-chat-message__suggestions-label">您还可以这样问：</p>
                    <div class="ai-chat-message__suggestions-list">
                      <button
                        v-for="suggestion in resolveMessageSuggestions(item)"
                        :key="suggestion"
                        type="button"
                        class="ai-chat-message__suggestion"
                        @click="handleChatSuggestion(suggestion)"
                      >
                        {{ suggestion }}
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="item.role === 'user'" class="ai-chat-message__avatar is-user">
                  <span class="material-symbols-outlined">person</span>
                </div>
              </div>
            </div>

            <div v-if="chatScrollActionKind" class="ai-chat-scroll-actions">
              <button
                type="button"
                class="ai-chat-scroll-actions__btn"
                @click="handleChatScrollAction"
              >
                <span class="material-symbols-outlined">
                  {{
                    chatScrollActionKind === "down" ? "arrow_downward" : "arrow_upward"
                  }}
                </span>
              </button>
            </div>

            <div v-if="isStreamingReply" class="ai-chat-toolbar">
              <button type="button" class="ai-chat-toolbar__stop" @click="stopAiReply">
                <span class="material-symbols-outlined">pause_circle</span>
                <span>停止回答</span>
              </button>
            </div>
            <div v-else-if="canRetryStoppedMessage" class="ai-chat-toolbar">
              <button
                type="button"
                class="ai-chat-toolbar__retry"
                @click="retryLatestQuestion"
              >
                <span class="material-symbols-outlined">refresh</span>
                <span>重新回答</span>
              </button>
            </div>
          </section>

          <section v-else-if="isLessonPlanMode" class="ai-assistant-lesson">
            <div class="ai-assistant-lesson__header">
              <!-- <button
                type="button"
                class="ai-assistant-lesson__back"
                @click="exitLessonPlanView"
              >
                <span class="material-symbols-outlined">arrow_back</span>
                <span>返回AI助手</span>
              </button> -->
              <h2 class="ai-assistant-lesson__title">{{ lessonPlanModeTitle }}</h2>
              <div class="ai-assistant-lesson__header-actions">
                <div
                  class="ai-assistant-quota"
                  @mouseenter="handleQuotaMouseEnter"
                  @mouseleave="handleQuotaMouseLeave"
                >
                  <button type="button" class="ai-assistant-quota-entry">
                    <span
                      class="material-symbols-outlined ai-assistant-quota-entry__icon"
                    >
                      bolt
                    </span>
                    <span>额度详情</span>
                  </button>

                  <Transition name="ai-quota-fade">
                    <div v-if="showQuotaDetail" class="ai-assistant-quota-popover">
                      <div v-if="quotaLoading" class="ai-assistant-quota-popover__status">
                        正在加载额度详情...
                      </div>
                      <div
                        v-else-if="quotaError"
                        class="ai-assistant-quota-popover__status is-error"
                      >
                        {{ quotaError }}
                      </div>
                      <div
                        v-else-if="!quotaDetail.length"
                        class="ai-assistant-quota-popover__status"
                      >
                        暂无额度数据
                      </div>
                      <template v-else>
                        <div
                          v-for="(item, index) in quotaDetail"
                          :key="`${item.quotaName}-${index}`"
                          class="ai-assistant-quota-popover__line"
                        >
                          <span>{{ item.quotaName }}</span>
                          <strong>{{ item.userLimit }}</strong>
                        </div>
                      </template>
                    </div>
                  </Transition>
                </div>

                <button
                  v-if="!shouldHideImageHistoryEntry"
                  type="button"
                  class="ai-assistant-history-entry"
                  @click="handleOpenHistory"
                >
                  <span
                    class="material-symbols-outlined ai-assistant-history-entry__icon"
                  >
                    history
                  </span>
                  <span>历史记录</span>
                </button>
              </div>
            </div>

            <div class="ai-assistant-lesson__form">
              <label v-if="shouldShowLessonGrade" class="ai-assistant-lesson__label">
                <span>
                  <span class="ai-assistant-lesson__required">*</span>
                  <span>选择年级</span>
                </span>
                <MSelect
                  v-model="lessonPlanForm.grade"
                  :options="lessonPlanGradeOptions"
                  placeholder="请选择面向学生所属年级"
                  class="ai-assistant-lesson__mselect"
                  dropdown-class="ai-lesson-select-dropdown"
                />
              </label>

              <div v-if="lessonPlanSessionType === 4" class="ai-assistant-lesson__row">
                <span class="ai-assistant-lesson__label-text">
                  <span class="ai-assistant-lesson__required">*</span>
                  <span>题目种类</span>
                </span>
                <label class="ai-assistant-lesson__radio">
                  <input
                    v-model="lessonPlanForm.questionKind"
                    type="radio"
                    value="scene"
                  />
                  <span>情境类</span>
                </label>
                <label class="ai-assistant-lesson__radio">
                  <input
                    v-model="lessonPlanForm.questionKind"
                    type="radio"
                    value="knowledge"
                  />
                  <span>知识类</span>
                </label>
              </div>

              <div v-if="lessonPlanSessionType === 2" class="ai-assistant-lesson__row">
                <span class="ai-assistant-lesson__label-text">
                  <span class="ai-assistant-lesson__required">*</span>
                  <span>单元类型</span>
                </span>
                <label class="ai-assistant-lesson__radio">
                  <input
                    v-model="lessonPlanForm.unitType"
                    type="radio"
                    value="single"
                  />
                  <span>单一课时</span>
                </label>
                <label class="ai-assistant-lesson__radio">
                  <input
                    v-model="lessonPlanForm.unitType"
                    type="radio"
                    value="unit"
                  />
                  <span>单元教学</span>
                </label>
              </div>

              <label
                v-if="lessonPlanSessionType === 2 && lessonPlanForm.unitType === 'unit'"
                class="ai-assistant-lesson__label"
              >
                <span>
                  <span class="ai-assistant-lesson__required">*</span>
                  <span>课时数</span>
                </span>
                <MSelect
                  v-model="lessonPlanForm.periodCount"
                  :options="lessonPlanPeriodOptions"
                  placeholder="请选择课时数"
                  class="ai-assistant-lesson__mselect"
                  dropdown-class="ai-lesson-select-dropdown"
                />
              </label>

              <label class="ai-assistant-lesson__label">
                <span>
                  <span class="ai-assistant-lesson__required">*</span>
                  <span>{{ lessonPlanModeSubjectLabel }}</span>
                </span>
                <div class="ai-assistant-lesson__textarea-wrap">
                  <textarea
                    v-model="lessonPlanForm.subject"
                    class="ai-assistant-lesson__input ai-assistant-lesson__textarea"
                    :maxlength="LESSON_PLAN_SUBJECT_MAX_LENGTH"
                    placeholder="请简短描述课程主题方向"
                    rows="3"
                  ></textarea>
                  <span class="ai-assistant-lesson__count">
                    {{ lessonPlanSubjectLength }} / {{ LESSON_PLAN_SUBJECT_MAX_LENGTH }}
                  </span>
                </div>
              </label>

              <label class="ai-assistant-lesson__label">
                <span>
                  <span v-if="lessonPlanSessionType === 4" class="ai-assistant-lesson__required">*</span>
                  <span>情境选择</span>
                </span>
                <MSelect
                  v-model="lessonPlanForm.scenario"
                  :options="lessonPlanScenarioOptions"
                  placeholder="请选择或自行输入情境"
                  class="ai-assistant-lesson__mselect"
                  dropdown-class="ai-lesson-select-dropdown"
                  filterable
                />
              </label>

              <label
                v-if="lessonPlanSessionType === 4"
                class="ai-assistant-lesson__label"
              >
                <span class="ai-assistant-lesson__label-text">
                  <span class="ai-assistant-lesson__required">*</span>
                  <span>题目类型及数量</span>
                </span>
                <div class="ai-assistant-lesson__question-types">
                  <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--single">
                    <span class="ai-assistant-lesson__question-chip">单选题</span>
                    <MSelect
                      v-model="lessonPlanForm.singleCount"
                      :options="lessonPlanQuestionCountOptions"
                      class="ai-assistant-lesson__question-count-select"
                      dropdown-class="ai-lesson-select-dropdown"
                    />
                  </div>
                  <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--multiple">
                    <span class="ai-assistant-lesson__question-chip">多选题</span>
                    <MSelect
                      v-model="lessonPlanForm.multipleCount"
                      :options="lessonPlanQuestionCountOptions"
                      class="ai-assistant-lesson__question-count-select"
                      dropdown-class="ai-lesson-select-dropdown"
                    />
                  </div>
                  <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--judge">
                    <span class="ai-assistant-lesson__question-chip">判断题</span>
                    <MSelect
                      v-model="lessonPlanForm.judgeCount"
                      :options="lessonPlanQuestionCountOptions"
                      class="ai-assistant-lesson__question-count-select"
                      dropdown-class="ai-lesson-select-dropdown"
                    />
                  </div>
                  <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--blank">
                    <span class="ai-assistant-lesson__question-chip">填空题</span>
                    <MSelect
                      v-model="lessonPlanForm.blankCount"
                      :options="lessonPlanQuestionCountOptions"
                      class="ai-assistant-lesson__question-count-select"
                      dropdown-class="ai-lesson-select-dropdown"
                    />
                  </div>
                  <div class="ai-assistant-lesson__question-item ai-assistant-lesson__question-item--connect">
                    <span class="ai-assistant-lesson__question-chip">连线题</span>
                    <MSelect
                      v-model="lessonPlanForm.connectCount"
                      :options="lessonPlanQuestionCountOptions"
                      class="ai-assistant-lesson__question-count-select"
                      dropdown-class="ai-lesson-select-dropdown"
                    />
                  </div>
                </div>
              </label>

              <div class="ai-assistant-lesson__double">
                <label class="ai-assistant-lesson__label">
                  <span>教具选择</span>
                  <MSelect
                    v-model="lessonPlanForm.teachTool"
                    :options="lessonPlanToolOptions"
                    placeholder="请选择教具"
                    class="ai-assistant-lesson__mselect"
                    dropdown-class="ai-lesson-select-dropdown"
                  />
                </label>
                <label class="ai-assistant-lesson__label">
                  <span>硬件</span>
                  <MSelect
                    v-model="lessonPlanForm.hardware"
                    :options="lessonPlanHardwareOptions"
                    placeholder="请选择硬件"
                    class="ai-assistant-lesson__mselect"
                    dropdown-class="ai-lesson-select-dropdown"
                  />
                </label>
              </div>

              <label class="ai-assistant-lesson__label">
                <div
                  ref="lessonRequirementTipsRef"
                  class="ai-assistant-lesson__label-with-helper"
                >
                  <span>特殊需求</span>
                  <button
                    v-if="lessonPlanSessionType === 2"
                    type="button"
                    class="ai-assistant-lesson__helper-entry"
                    @click.stop="toggleLessonRequirementTips"
                  >
                    <span>常用提示词</span>
                    <span class="material-symbols-outlined">contact_support</span>
                  </button>

                  <div
                    v-if="lessonPlanSessionType === 2 && lessonRequirementTipsVisible"
                    class="ai-assistant-lesson__helper-panel"
                  >
                    <p class="ai-assistant-lesson__helper-title">特殊需求示例：</p>
                    <button
                      v-for="item in lessonRequirementTips"
                      :key="`${item.tag}-${item.text}`"
                      type="button"
                      class="ai-assistant-lesson__helper-item"
                      @click.stop="insertLessonRequirementTip(item)"
                    >
                      <span class="ai-assistant-lesson__helper-item-text">
                        【{{ item.tag }}】{{ item.text }}
                      </span>
                      <span class="material-symbols-outlined">content_copy</span>
                    </button>
                  </div>
                </div>
                <div class="ai-assistant-lesson__textarea-wrap">
                  <textarea
                    v-model="lessonPlanForm.specialRequirement"
                    class="ai-assistant-lesson__input ai-assistant-lesson__textarea"
                    :maxlength="LESSON_PLAN_REQUIREMENT_MAX_LENGTH"
                    placeholder="可输入教学目标、教学方法或需要包含的特定内容"
                    rows="3"
                  ></textarea>
                  <span class="ai-assistant-lesson__count">
                    {{ lessonPlanRequirementLength }} / {{ LESSON_PLAN_REQUIREMENT_MAX_LENGTH }}
                  </span>
                </div>
              </label>

              <label class="ai-assistant-lesson__label">
                <span>依据的标准</span>
                <div
                  ref="lessonStandardSelectRef"
                  class="ai-assistant-lesson__multi-select"
                >
                  <button
                    type="button"
                    class="ai-assistant-lesson__multi-trigger"
                    :class="{ 'is-open': lessonStandardDropdownVisible }"
                    @click.stop="toggleLessonStandardDropdown"
                  >
                    <div
                      v-if="lessonPlanForm.standard.length > 0"
                      class="ai-assistant-lesson__multi-values"
                    >
                      <span
                        v-for="value in lessonPlanForm.standard"
                        :key="value"
                        class="ai-assistant-lesson__multi-tag"
                      >
                        <span>{{ value }}</span>
                        <button
                          type="button"
                          class="ai-assistant-lesson__multi-tag-remove"
                          @click.stop="removeLessonStandardOption(value)"
                        >
                          <span class="material-symbols-outlined">close</span>
                        </button>
                      </span>
                    </div>
                    <span v-else class="ai-assistant-lesson__multi-placeholder">
                      {{ lessonPlanModeStandardPlaceholder }}
                    </span>
                    <span class="material-symbols-outlined ai-assistant-lesson__multi-arrow">
                      {{ lessonStandardDropdownVisible ? "expand_less" : "expand_more" }}
                    </span>
                  </button>

                  <div
                    v-if="lessonStandardDropdownVisible"
                    class="ai-assistant-lesson__multi-dropdown"
                  >
                    <button
                      v-for="option in lessonPlanStandardOptions"
                      :key="option.value"
                      type="button"
                      class="ai-assistant-lesson__multi-option"
                      :class="{ 'is-selected': lessonPlanForm.standard.includes(option.value) }"
                      @click.stop="toggleLessonStandardOption(option.value)"
                    >
                      <span>{{ option.label }}</span>
                      <span
                        v-if="lessonPlanForm.standard.includes(option.value)"
                        class="material-symbols-outlined"
                      >
                        done
                      </span>
                    </button>
                  </div>
                </div>
              </label>

              <div class="ai-assistant-lesson-upload">
                <div class="ai-assistant-lesson-upload__label-wrap">
                  <span class="ai-assistant-lesson-upload__label">上传文件</span>
                  <div class="ai-assistant-lesson-upload__help">
                    <span class="material-symbols-outlined">help</span>
                    <div class="ai-assistant-upload__tooltip ai-assistant-upload__tooltip--lesson">
                      {{ AI_UPLOAD_TOOLTIP_TEXT }}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="ai-assistant-lesson-upload__button"
                  :disabled="isAiUploading"
                  @click="triggerLessonUpload"
                >
                  <span class="material-symbols-outlined">add</span>
                </button>
                <input
                  ref="lessonUploadInputRef"
                  type="file"
                  :accept="AI_UPLOAD_ACCEPT"
                  class="ai-assistant-upload__input"
                  @change="handleAiFileChange"
                />
              </div>

              <div
                v-if="(isLessonPlanMode || lessonPlanChatActive) && aiUploadFile"
                class="ai-assistant-upload-file ai-assistant-upload-file--lesson"
              >
                <div class="ai-assistant-upload-file__icon">
                  <span class="material-symbols-outlined">
                    {{ resolveAiUploadIcon(aiUploadFile.name) }}
                  </span>
                </div>
                <div class="ai-assistant-upload-file__content">
                  <strong class="ai-assistant-upload-file__name">
                    {{ formatAiUploadFileName(aiUploadFile.name) }}
                  </strong>
                  <span
                    class="ai-assistant-upload-file__status"
                    :class="{ 'is-error': aiUploadStatus === 'error' }"
                  >
                    {{ isAiUploading ? aiUploadStatusText : formatAiUploadFileSize(aiUploadFile.size) }}
                  </span>
                </div>
                <div v-if="isAiUploading" class="ai-assistant-upload-file__progress">
                  <svg viewBox="0 0 72 72" aria-hidden="true">
                    <circle
                      class="ai-assistant-upload-file__progress-track"
                      cx="36"
                      cy="36"
                      :r="UPLOAD_PROGRESS_RADIUS"
                    />
                    <circle
                      class="ai-assistant-upload-file__progress-value"
                      cx="36"
                      cy="36"
                      :r="UPLOAD_PROGRESS_RADIUS"
                      :stroke-dasharray="UPLOAD_PROGRESS_CIRCUMFERENCE"
                      :stroke-dashoffset="aiUploadProgressOffset"
                    />
                  </svg>
                  <strong>{{ aiUploadProgressPercent }}%</strong>
                </div>
                <button
                  v-if="isAiUploading"
                  type="button"
                  class="ai-assistant-upload-file__close is-cancel"
                  @click="handleCancelAiUpload"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
                <button
                  v-else
                  type="button"
                  class="ai-assistant-upload-file__close"
                  @click="handleRemoveAiUploadFile"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div class="ai-assistant-lesson__footer">
              <button
                type="button"
                class="ai-assistant-lesson__submit"
                :disabled="!canSubmitLessonPlan || chatRequesting"
                @click="handleLessonPlanSubmit"
              >
                开始生成
              </button>
            </div>
          </section>

          <section v-else-if="isAnalysisMode" class="ai-analysis">
            <div class="ai-assistant-lesson__header">
              <!-- <button
                type="button"
                class="ai-assistant-lesson__back"
                @click="exitAnalysisView"
              >
                <span class="material-symbols-outlined">arrow_back</span>
                <span>返回AI助手</span>
              </button> -->
              <h2 class="ai-assistant-lesson__title">AI学情分析</h2>
              <div class="ai-assistant-lesson__header-actions">
                <div
                  class="ai-assistant-quota"
                  @mouseenter="handleQuotaMouseEnter"
                  @mouseleave="handleQuotaMouseLeave"
                >
                  <button type="button" class="ai-assistant-quota-entry">
                    <span
                      class="material-symbols-outlined ai-assistant-quota-entry__icon"
                    >
                      bolt
                    </span>
                    <span>额度详情</span>
                  </button>

                  <Transition name="ai-quota-fade">
                    <div v-if="showQuotaDetail" class="ai-assistant-quota-popover">
                      <div v-if="quotaLoading" class="ai-assistant-quota-popover__status">
                        正在加载额度详情...
                      </div>
                      <div
                        v-else-if="quotaError"
                        class="ai-assistant-quota-popover__status is-error"
                      >
                        {{ quotaError }}
                      </div>
                      <div
                        v-else-if="!quotaDetail.length"
                        class="ai-assistant-quota-popover__status"
                      >
                        暂无额度数据
                      </div>
                      <template v-else>
                        <div
                          v-for="(item, index) in quotaDetail"
                          :key="`${item.quotaName}-${index}`"
                          class="ai-assistant-quota-popover__line"
                        >
                          <span>{{ item.quotaName }}</span>
                          <strong>{{ item.userLimit }}</strong>
                        </div>
                      </template>
                    </div>
                  </Transition>
                </div>

                <button
                  v-if="!shouldHideImageHistoryEntry"
                  type="button"
                  class="ai-assistant-history-entry"
                  @click="handleOpenHistory"
                >
                  <span
                    class="material-symbols-outlined ai-assistant-history-entry__icon"
                  >
                    history
                  </span>
                  <span>历史记录</span>
                </button>
              </div>
            </div>

            <div class="ai-analysis__form">
              <label class="ai-analysis__label">
                <span class="ai-assistant-lesson__label-text">
                  <span class="ai-assistant-lesson__required">*</span>
                  <span>日期范围</span>
                </span>
                <MDateRangePicker
                  v-model="analysisForm.dateRange"
                  :presets="analysisDatePresets"
                  :show-semester-action="false"
                  class="ai-analysis__date-picker"
                />
              </label>

              <label class="ai-analysis__label">
                <span class="ai-assistant-lesson__label-text">
                  <span class="ai-assistant-lesson__required">*</span>
                  <span>年级和班级</span>
                </span>
                <div ref="analysisTargetPickerRef" class="ai-analysis-target">
                  <button
                    type="button"
                    class="ai-analysis-target__trigger"
                    :class="{ 'is-open': analysisTargetDropdownVisible }"
                    @click.stop="toggleAnalysisTargetDropdown"
                  >
                    <div
                      v-if="analysisSelectedTagList.length > 0"
                      class="ai-analysis-target__values"
                    >
                      <span
                        v-for="tag in analysisSelectedTagList"
                        :key="`${tag.type}-${tag.key}`"
                        class="ai-analysis-target__tag"
                      >
                        <span class="ai-analysis-target__tag-text">{{ tag.label }}</span>
                        <button
                          type="button"
                          class="ai-analysis-target__tag-remove"
                          @click.stop="removeAnalysisTag(tag)"
                        >
                          <span class="material-symbols-outlined">close</span>
                        </button>
                      </span>
                    </div>
                    <span v-else class="ai-analysis-target__placeholder">
                      请选择分析范围（年级和班级）
                    </span>
                    <span class="material-symbols-outlined ai-analysis-target__arrow">
                      {{ analysisTargetDropdownVisible ? "expand_less" : "expand_more" }}
                    </span>
                  </button>

                  <div v-if="analysisTargetDropdownVisible" class="ai-analysis-target__dropdown">
                    <div class="ai-analysis-target__head">
                      <label class="ai-analysis-target__check-row">
                        <input
                          type="checkbox"
                          :checked="analysisIsAllSelected"
                          @change="toggleAnalysisAllGrade"
                        />
                        <span>全选全部年级和班级</span>
                      </label>
                    </div>

                    <div v-if="analysisCascadeLoading" class="ai-analysis-target__status">
                      年级班级加载中...
                    </div>
                    <div v-else-if="!analysisGradeOptions.length" class="ai-analysis-target__status">
                      暂无年级班级数据
                    </div>
                    <div v-else class="ai-analysis-target__body">
                      <div class="ai-analysis-target__grades">
                        <button
                          v-for="grade in analysisGradeOptions"
                          :key="grade.value"
                          type="button"
                          class="ai-analysis-target__grade-item"
                          :class="{ 'is-active': analysisActiveGradeId === grade.value }"
                          @click.stop="analysisActiveGradeId = grade.value"
                        >
                          <span>{{ grade.label }}</span>
                          <label class="ai-analysis-target__check-row" @click.stop>
                            <input
                              type="checkbox"
                              :checked="analysisForm.selectedGradeIds.includes(grade.value)"
                              @change.stop="toggleAnalysisGradeSelection(grade)"
                            />
                          </label>
                        </button>
                      </div>

                      <div class="ai-analysis-target__classes">
                        <template v-if="analysisActiveGrade">
                          <button
                            v-for="classItem in analysisActiveGrade.classes"
                            :key="classItem.value"
                            type="button"
                            class="ai-analysis-target__class-item"
                            :class="{
                              'is-selected': analysisForm.selectedClassIds.includes(classItem.value),
                            }"
                            @click.stop="toggleAnalysisClassSelection(analysisActiveGrade, classItem.value)"
                          >
                            <span>{{ classItem.label }}</span>
                            <label class="ai-analysis-target__check-row" @click.stop>
                              <input
                                type="checkbox"
                                :checked="analysisForm.selectedClassIds.includes(classItem.value)"
                                @change.stop="
                                  toggleAnalysisClassSelection(analysisActiveGrade, classItem.value)
                                "
                              />
                            </label>
                          </button>
                        </template>
                        <div v-else class="ai-analysis-target__status">请先选择年级</div>
                      </div>
                    </div>
                  </div>
                </div>
              </label>

              <label class="ai-analysis__label">
                <span class="ai-assistant-lesson__label-text">特殊需求</span>
                <div class="ai-assistant-lesson__textarea-wrap">
                  <textarea
                    v-model="analysisForm.specialRequirement"
                    class="ai-assistant-lesson__input ai-assistant-lesson__textarea ai-analysis__textarea"
                    :maxlength="ANALYSIS_REQUIREMENT_MAX_LENGTH"
                    placeholder="可输入重点关注维度、输出风格或分析重点"
                    rows="3"
                  ></textarea>
                  <span class="ai-assistant-lesson__count">
                    {{ analysisRequirementLength }} / {{ ANALYSIS_REQUIREMENT_MAX_LENGTH }}
                  </span>
                </div>
              </label>
            </div>

            <div class="ai-assistant-lesson__footer">
              <button
                type="button"
                class="ai-assistant-lesson__submit"
                :disabled="!canSubmitAnalysis || chatRequesting || analysisCascadeLoading"
                @click="handleAnalysisSubmit"
              >
                {{ chatRequesting ? "生成中..." : "开始生成" }}
              </button>
            </div>
          </section>

          <section v-else-if="isImageMode" class="ai-image">
            <div class="ai-image__topbar">
              <div class="ai-assistant-lesson__header-actions">
                <div
                  class="ai-assistant-quota"
                  @mouseenter="handleQuotaMouseEnter"
                  @mouseleave="handleQuotaMouseLeave"
                >
                  <button type="button" class="ai-assistant-quota-entry">
                    <span
                      class="material-symbols-outlined ai-assistant-quota-entry__icon"
                    >
                      bolt
                    </span>
                    <span>额度详情</span>
                  </button>

                  <Transition name="ai-quota-fade">
                    <div v-if="showQuotaDetail" class="ai-assistant-quota-popover">
                      <div v-if="quotaLoading" class="ai-assistant-quota-popover__status">
                        正在加载额度详情...
                      </div>
                      <div
                        v-else-if="quotaError"
                        class="ai-assistant-quota-popover__status is-error"
                      >
                        {{ quotaError }}
                      </div>
                      <div
                        v-else-if="!quotaDetail.length"
                        class="ai-assistant-quota-popover__status"
                      >
                        暂无额度数据
                      </div>
                      <template v-else>
                        <div
                          v-for="(item, index) in quotaDetail"
                          :key="`${item.quotaName}-${index}`"
                          class="ai-assistant-quota-popover__line"
                        >
                          <span>{{ item.quotaName }}</span>
                          <strong>{{ item.userLimit }}</strong>
                        </div>
                      </template>
                    </div>
                  </Transition>
                </div>

                <button
                  v-if="!shouldHideImageHistoryEntry"
                  type="button"
                  class="ai-assistant-history-entry"
                  @click="handleOpenHistory"
                >
                  <span
                    class="material-symbols-outlined ai-assistant-history-entry__icon"
                  >
                    history
                  </span>
                  <span>历史记录</span>
                </button>
              </div>
            </div>

            <div class="ai-image__content">
              <aside class="ai-image__panel">
                <label class="ai-image__panel-block ai-image__label">
                  <span class="ai-image__block-head">
                    <span class="ai-image__label-text">
                      <span class="ai-assistant-lesson__required">*</span>
                      <span>输入描述</span>
                    </span>
                    <span class="ai-image__label-caption">
                      {{ imagePromptLength }} / {{ IMAGE_PROMPT_MAX_LENGTH }}
                    </span>
                  </span>
                  <div class="ai-image__textarea-wrap">
                    <textarea
                      v-model="imageForm.prompt"
                      class="ai-image__textarea"
                      :maxlength="IMAGE_PROMPT_MAX_LENGTH"
                      placeholder="写下你想要的画面内容，建议描述主体、场景、光影和风格。"
                      rows="5"
                    ></textarea>
                    <div class="ai-image__prompt-tags">
                      <button
                        v-for="item in IMAGE_PROMPT_PRESET_TAGS"
                        :key="item.value"
                        type="button"
                        class="ai-image__prompt-tag"
                        :class="item.className"
                        @click="handleAppendImagePromptTag(item.value)"
                      >
                        {{ item.label }}
                      </button>
                      <button
                        type="button"
                        class="ai-image__prompt-tag ai-image__prompt-tag--ghost"
                        :class="{ 'is-active': showImagePromptTagEditor }"
                        @click="openImagePromptTagEditor"
                      >
                        <span class="material-symbols-outlined">add</span>
                        <span>添加标签</span>
                      </button>
                    </div>
                    <div v-if="showImagePromptTagEditor" class="ai-image__prompt-tag-editor">
                      <input
                        ref="imagePromptCustomTagInputRef"
                        v-model.trim="imagePromptCustomTag"
                        type="text"
                        class="ai-image__prompt-tag-input"
                        :maxlength="IMAGE_PROMPT_CUSTOM_TAG_MAX_LENGTH"
                        placeholder="输入标签，例如 国风、水彩、电影感"
                        @keydown.enter.prevent="confirmImagePromptCustomTag"
                        @keydown.esc.prevent="closeImagePromptTagEditor"
                      />
                      <button
                        type="button"
                        class="ai-image__prompt-tag-action ai-image__prompt-tag-action--primary"
                        @click="confirmImagePromptCustomTag"
                      >
                        加入
                      </button>
                      <button
                        type="button"
                        class="ai-image__prompt-tag-action"
                        @click="closeImagePromptTagEditor"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </label>

                <div class="ai-image__panel-block ai-image__upload">
                  <div class="ai-image__block-head">
                    <span class="ai-image__label-text">上传参考图</span>
                    <span class="ai-image__label-caption">选填</span>
                  </div>
                  <div class="ai-image__upload-body">
                    <button
                      v-if="!aiUploadFile || !isAiImageFile(aiUploadFile.name)"
                      type="button"
                      class="ai-image__upload-trigger"
                      :disabled="isAiUploading"
                      @click="triggerImageUpload"
                    >
                      <span class="material-symbols-outlined">add_photo_alternate</span>
                      <strong>点击上传参考图</strong>
                      <small>支持 JPG、PNG、WEBP，帮助 AI 更接近你的画面想法</small>
                    </button>
                    <div v-else class="ai-image__upload-card">
                      <img
                        v-if="resolveAiUploadPreviewUrl(aiUploadFile)"
                        :src="resolveAiUploadPreviewUrl(aiUploadFile)"
                        class="ai-image__upload-preview"
                        alt="参考图预览"
                      />
                      <div v-else class="ai-image__upload-placeholder">
                        <span class="material-symbols-outlined">image</span>
                      </div>
                      <div class="ai-image__upload-info">
                        <strong>{{ formatAiUploadFileName(aiUploadFile.name, 16) }}</strong>
                        <span>{{ isAiUploading ? aiUploadStatusText : formatAiUploadFileSize(aiUploadFile.size) }}</span>
                      </div>
                      <button
                        type="button"
                        class="ai-image__upload-remove"
                        :disabled="isAiUploading"
                        @click="handleRemoveAiUploadFile"
                      >
                        <span class="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="ai-image__panel-block ai-image__size">
                  <div class="ai-image__block-head">
                    <span class="ai-image__label-text">选择尺寸</span>
                    <span class="ai-image__label-caption">推荐按展示场景选择</span>
                  </div>
                  <div class="ai-image__size-list">
                    <button
                      v-for="item in IMAGE_SIZE_OPTIONS"
                      :key="item.value"
                      type="button"
                      class="ai-image__size-item"
                      :class="{ 'is-active': imageForm.size === item.value }"
                      @click="imageForm.size = item.value"
                    >
                      <span class="ai-image__size-preview" aria-hidden="true">
                        <span
                          class="ai-image__size-shape"
                          :style="{
                            width: `${item.previewWidth}px`,
                            height: `${item.previewHeight}px`,
                          }"
                        ></span>
                      </span>
                      <span class="ai-image__size-name">{{ item.label }}</span>
                    </button>
                  </div>
                </div>

                <div class="ai-image__footer">
                  <p class="ai-image__quota-text">今日剩余额度：{{ imageQuotaRemainText }}</p>
                  <button
                    type="button"
                    class="ai-image__submit"
                    :disabled="!canSubmitImageGenerate"
                    @click="handleImageGenerate"
                  >
                    {{ imageGenerating ? "生成中..." : "立即生成图片" }}
                  </button>
                </div>
              </aside>

              <section class="ai-image__preview">
                <div class="ai-image__preview-stage">
                  <div
                    v-if="imageHistoryLoading"
                    class="ai-image__empty"
                  >
                    <span class="material-symbols-outlined ai-image__empty-icon">progress_activity</span>
                    <p>正在加载生图记录...</p>
                    <small>稍等片刻，马上为你恢复最近的创作内容</small>
                  </div>
                  <div
                    v-else-if="imageGenerating && !hasImageResult"
                    class="ai-image__loading"
                  >
                    <div class="ai-image__loading-bar">
                      <div
                        class="ai-image__loading-value"
                        :style="{ width: `${imageGenerateProgressPercent}%` }"
                      ></div>
                    </div>
                    <p class="ai-image__loading-text">{{ imageGenerateProgressText }}</p>
                    <small>图片生成中，请稍候</small>
                  </div>
                  <div
                    v-else-if="imageResultUrls.length === 0"
                    class="ai-image__empty"
                  >
                    <span class="material-symbols-outlined ai-image__empty-icon">palette</span>
                    <p>先在左侧输入提示词，生成你的第一张 AI 图片</p>
                    <small>也可以上传参考图，让生成结果更贴近你的想法</small>
                  </div>
                  <div v-else class="ai-image__result-wrap">
                    <div class="ai-image__result-card">
                      <img
                        ref="imageResultMainRef"
                        :src="currentImageDisplayUrl"
                        class="ai-image__result-main"
                        alt="AI生图结果"
                      />
                    </div>
                  </div>
                </div>

                <div class="ai-image__gallery">
                  <div class="ai-image__gallery-head">
                    <span class="ai-image__gallery-title">最近创作</span>
                    <button
                      type="button"
                      class="ai-image__gallery-more"
                      @click="handleOpenHistory"
                    >
                      <span>查看更多</span>
                      <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>

                  <div v-if="imageRecentHistoryList.length > 0" class="ai-image__thumb-list">
                    <button
                      v-for="item in imageRecentHistoryList"
                      :key="item.id"
                      type="button"
                      class="ai-image__thumb-item"
                      :class="{ 'is-active': String(chatSessionId || '').trim() === item.sessionId }"
                      :title="item.content"
                      @click="handleSelectImagePreviewHistory(item)"
                    >
                      <img
                        v-if="item.imageUrl"
                        :src="buildAiImageProxyUrl(item.imageUrl)"
                        class="ai-image__thumb"
                        alt="AI生图历史缩略图"
                      />
                      <div v-else class="ai-image__thumb-placeholder">
                        <span class="material-symbols-outlined">image</span>
                      </div>
                    </button>
                  </div>
                  <div v-else class="ai-image__thumb-list ai-image__thumb-list--placeholder">
                    <div
                      v-for="index in 4"
                      :key="`image-placeholder-${index}`"
                      class="ai-image__thumb-placeholder"
                    >
                      <span class="material-symbols-outlined">image</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <input
              ref="imageUploadInputRef"
              type="file"
              :accept="AI_IMAGE_UPLOAD_ACCEPT"
              class="ai-assistant-upload__input"
              @change="handleImageRefFileChange"
            />
          </section>

          <section
            v-if="!isLessonPlanMode && !isAnalysisMode && !isImageMode"
            class="ai-assistant-search"
            :class="{ 'is-chat': isChatMode }"
          >
            <div v-if="!isCodeAssistantMode" class="ai-assistant-search__head">
              <div class="ai-assistant-search__head-actions">
                <button
                  v-if="isChatMode"
                  type="button"
                  class="ai-assistant-new-chat-entry"
                  @click="startNewChat(chatSessionType)"
                >
                  <span
                    class="material-symbols-outlined ai-assistant-new-chat-entry__icon"
                  >
                    add
                  </span>
                  <span>新建会话</span>
                </button>

                <div
                  class="ai-assistant-quota"
                  @mouseenter="handleQuotaMouseEnter"
                  @mouseleave="handleQuotaMouseLeave"
                >
                  <button type="button" class="ai-assistant-quota-entry">
                    <span
                      class="material-symbols-outlined ai-assistant-quota-entry__icon"
                    >
                      bolt
                    </span>
                    <span>额度详情</span>
                  </button>

                  <Transition name="ai-quota-fade">
                    <div v-if="showQuotaDetail" class="ai-assistant-quota-popover">
                      <div v-if="quotaLoading" class="ai-assistant-quota-popover__status">
                        正在加载额度详情...
                      </div>
                      <div
                        v-else-if="quotaError"
                        class="ai-assistant-quota-popover__status is-error"
                      >
                        {{ quotaError }}
                      </div>
                      <div
                        v-else-if="!quotaDetail.length"
                        class="ai-assistant-quota-popover__status"
                      >
                        暂无额度数据
                      </div>
                      <template v-else>
                        <div
                          v-for="(item, index) in quotaDetail"
                          :key="`${item.quotaName}-${index}`"
                          class="ai-assistant-quota-popover__line"
                        >
                          <span>{{ item.quotaName }}</span>
                          <strong>{{ item.userLimit }}</strong>
                        </div>
                      </template>
                    </div>
                  </Transition>
                </div>

                <button
                  v-if="!shouldHideImageHistoryEntry"
                  type="button"
                  class="ai-assistant-history-entry"
                  @click="handleOpenHistory"
                >
                  <span
                    class="material-symbols-outlined ai-assistant-history-entry__icon"
                  >
                    history
                  </span>
                  <span>历史记录</span>
                </button>

                <button
                  v-if="isChatMode"
                  type="button"
                  class="ai-assistant-close-chat"
                  title="退出当前对话"
                  aria-label="退出当前对话"
                  @click="handleCloseChat"
                >
                  <span class="material-symbols-outlined ai-assistant-close-chat__icon">
                    close
                  </span>
                </button>
              </div>
            </div>

            <div v-if="isCodeAssistantMode" class="ai-code-assistant__bottom">
              <div class="ai-assistant-search__head ai-assistant-search__head--code">
                <div class="ai-assistant-search__head-actions">
                  <button
                    v-if="isChatMode"
                    type="button"
                    class="ai-assistant-new-chat-entry"
                    @click="startNewChat(chatSessionType)"
                  >
                    <span
                      class="material-symbols-outlined ai-assistant-new-chat-entry__icon"
                    >
                      add
                    </span>
                    <span>新建会话</span>
                  </button>

                  <div
                    class="ai-assistant-quota"
                    @mouseenter="handleQuotaMouseEnter"
                    @mouseleave="handleQuotaMouseLeave"
                  >
                    <button type="button" class="ai-assistant-quota-entry">
                      <span
                        class="material-symbols-outlined ai-assistant-quota-entry__icon"
                      >
                        bolt
                      </span>
                      <span>额度详情</span>
                    </button>

                    <Transition name="ai-quota-fade">
                      <div v-if="showQuotaDetail" class="ai-assistant-quota-popover">
                        <div v-if="quotaLoading" class="ai-assistant-quota-popover__status">
                          正在加载额度详情...
                        </div>
                        <div
                          v-else-if="quotaError"
                          class="ai-assistant-quota-popover__status is-error"
                        >
                          {{ quotaError }}
                        </div>
                        <div
                          v-else-if="!quotaDetail.length"
                          class="ai-assistant-quota-popover__status"
                        >
                          暂无额度数据
                        </div>
                        <template v-else>
                          <div
                            v-for="(item, index) in quotaDetail"
                            :key="`${item.quotaName}-${index}`"
                            class="ai-assistant-quota-popover__line"
                          >
                            <span>{{ item.quotaName }}</span>
                            <strong>{{ item.userLimit }}</strong>
                          </div>
                        </template>
                      </div>
                    </Transition>
                  </div>

                  <button
                    v-if="!shouldHideImageHistoryEntry"
                    type="button"
                    class="ai-assistant-history-entry"
                    @click="handleOpenHistory"
                  >
                    <span
                      class="material-symbols-outlined ai-assistant-history-entry__icon"
                    >
                      history
                    </span>
                    <span>历史记录</span>
                  </button>

                  <button
                    v-if="isChatMode"
                    type="button"
                    class="ai-assistant-close-chat"
                    title="退出当前对话"
                    aria-label="退出当前对话"
                    @click="handleCloseChat"
                  >
                    <span class="material-symbols-outlined ai-assistant-close-chat__icon">
                      close
                    </span>
                  </button>
                </div>
              </div>

              <div class="ai-code-assistant__composer">
                <textarea
                  v-model="codeAssistantForm.requirement"
                  class="ai-code-assistant__composer-input"
                  :maxlength="CODE_ASSISTANT_REQUIREMENT_MAX_LENGTH"
                  :placeholder="codeAssistantRequirementPlaceholder"
                  rows="1"
                  @keydown="handleCodeAssistantKeydown"
                ></textarea>
                <div class="ai-code-assistant__composer-footer">
                  <span class="ai-code-assistant__composer-count">
                    {{ codeAssistantRequirementLength }} / {{ CODE_ASSISTANT_REQUIREMENT_MAX_LENGTH }}
                  </span>
                  <button
                    type="button"
                    class="ai-code-assistant__submit"
                    :disabled="!canSubmitCodeAssistant"
                    @click="handleCodeAssistantSubmit"
                  >
                    <span class="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>

              <p class="ai-code-assistant__hint">
                内容由 AI 生成，仅供参考；代码返回时会尽量保留代码块格式，方便直接复制。
              </p>
            </div>

            <template v-else>
              <div class="ai-assistant-search__panel">
                <div class="ai-assistant-search__main">
                  <div class="ai-assistant-search__prefix">
                    <span
                      class="material-symbols-outlined ai-assistant-search__prefix-icon"
                    >
                      smart_toy
                    </span>
                  </div>
                  <textarea
                    v-model="searchKeyword"
                    class="ai-assistant-search__input"
                    placeholder="请输入您想咨询的教学问题..."
                    :maxlength="SEARCH_KEYWORD_MAX_LENGTH"
                    rows="1"
                    @keydown="handleSearchKeydown"
                  ></textarea>
                </div>
                <div class="ai-assistant-search__footer">
                  <span class="ai-assistant-search__hint">按 Shift+Enter 换行</span>
                  <span class="ai-assistant-search__count">
                    {{ searchKeywordLength }} / {{ SEARCH_KEYWORD_MAX_LENGTH }}
                  </span>
                  <button
                    type="button"
                    class="ai-assistant-search__thinking"
                    :class="{ 'is-active': enableDeepThinking }"
                    @click="toggleDeepThinking"
                  >
                    <span class="material-symbols-outlined">neurology</span>
                    <span>深度思考</span>
                  </button>
                  <div class="ai-assistant-upload">
                    <button
                      type="button"
                      class="ai-assistant-upload__button"
                      :disabled="isAiUploading"
                      @click="triggerAiUpload"
                    >
                      <span class="material-symbols-outlined">upload</span>
                    </button>
                    <div class="ai-assistant-upload__tooltip">
                      {{ AI_UPLOAD_TOOLTIP_TEXT }}
                    </div>
                  </div>
                  <button
                    type="button"
                    class="ai-assistant-search__button"
                    :disabled="!canSubmitChat"
                    @click="handleSearch"
                  >
                    <span>{{ isChatMode ? "发送" : "开始提问" }}</span>
                    <span
                      class="material-symbols-outlined ai-assistant-search__button-icon"
                    >
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
              <input
                ref="aiUploadInputRef"
                type="file"
                :accept="AI_UPLOAD_ACCEPT"
                class="ai-assistant-upload__input"
                @change="handleAiFileChange"
              />
            </template>

            <div
              v-if="aiUploadFile && !lessonPlanChatActive && !isCodeAssistantMode"
              class="ai-assistant-upload-file"
            >
              <div class="ai-assistant-upload-file__icon">
                <span class="material-symbols-outlined">
                  {{ resolveAiUploadIcon(aiUploadFile.name) }}
                </span>
              </div>
              <div class="ai-assistant-upload-file__content">
                <strong class="ai-assistant-upload-file__name">
                  {{ formatAiUploadFileName(aiUploadFile.name) }}
                </strong>
                <span
                  class="ai-assistant-upload-file__status"
                  :class="{ 'is-error': aiUploadStatus === 'error' }"
                >
                  {{ aiUploadStatusText }}
                </span>
              </div>
              <div class="ai-assistant-upload-file__progress">
                <svg viewBox="0 0 72 72" aria-hidden="true">
                  <circle
                    class="ai-assistant-upload-file__progress-track"
                    cx="36"
                    cy="36"
                    :r="UPLOAD_PROGRESS_RADIUS"
                  />
                  <circle
                    class="ai-assistant-upload-file__progress-value"
                    cx="36"
                    cy="36"
                    :r="UPLOAD_PROGRESS_RADIUS"
                    :stroke-dasharray="UPLOAD_PROGRESS_CIRCUMFERENCE"
                    :stroke-dashoffset="aiUploadProgressOffset"
                  />
                </svg>
                <strong>{{ aiUploadProgressPercent }}%</strong>
              </div>
              <button
                v-if="isAiUploading"
                type="button"
                class="ai-assistant-upload-file__close is-cancel"
                @click="handleCancelAiUpload"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
              <button
                v-else
                type="button"
                class="ai-assistant-upload-file__close"
                @click="handleRemoveAiUploadFile"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div
              v-if="!isChatMode && !isImageMode && hotQuestions.length > 0"
              class="ai-assistant-hot"
            >
              <span class="ai-assistant-hot__label">热门话题:</span>
              <button
                v-for="item in hotQuestions"
                :key="item"
                type="button"
                class="ai-assistant-hot__item"
                @click="handleHotQuestion(item)"
              >
                {{ item }}
              </button>
            </div>
          </section>

          <section
            v-if="!isChatMode && !isLessonPlanMode && !isAnalysisMode && !isImageMode"
            class="ai-assistant-grid"
            aria-label="AI助手能力卡片"
          >
            <article
              v-for="item in normalCards"
              :key="item.key"
              class="ai-assistant-card"
              @click="handleFeatureClick(item)"
            >
              <div class="ai-assistant-card__watermark">
                <span class="material-symbols-outlined">{{ item.icon }}</span>
              </div>

              <div class="ai-assistant-card__icon-wrap">
                <span class="material-symbols-outlined ai-assistant-card__icon">
                  {{ item.icon }}
                </span>
              </div>

              <h3 class="ai-assistant-card__title">{{ item.title }}</h3>
              <p class="ai-assistant-card__desc">{{ item.desc }}</p>
              <button
                type="button"
                class="ai-assistant-card__action"
                @click.stop="handleFeatureClick(item)"
              >
                <span>{{ item.action }}</span>
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </article>

            <article
              class="ai-assistant-card ai-assistant-card--highlight"
              @click="handleFeatureClick(highlightCard)"
            >
              <div class="ai-assistant-card__highlight-glow" aria-hidden="true"></div>

              <div class="ai-assistant-card__highlight-head">
                <div
                  class="ai-assistant-card__icon-wrap ai-assistant-card__icon-wrap--highlight"
                >
                  <span
                    class="material-symbols-outlined ai-assistant-card__icon ai-assistant-card__icon--light"
                  >
                    {{ highlightCard.icon }}
                  </span>
                </div>
                <span class="ai-assistant-card__tag">Premium Feature</span>
              </div>

              <h3 class="ai-assistant-card__title ai-assistant-card__title--light">
                {{ highlightCard.title }}
              </h3>
              <p class="ai-assistant-card__desc ai-assistant-card__desc--light">
                {{ highlightCard.desc }}
              </p>

              <button
                type="button"
                class="ai-assistant-card__cta"
                @click.stop="handleFeatureClick(highlightCard)"
              >
                开启沉浸体验
              </button>
            </article>
          </section>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showHistoryPanel" class="ai-history-overlay" @click="closeHistoryPanel">
        <div class="ai-history-panel" @click.stop>
          <div class="ai-history-panel__header">
            <div class="ai-history-panel__title-wrap">
              <h2 class="ai-history-panel__title">历史会话</h2>
              <p class="ai-history-panel__subtitle">快速找回之前的提问记录</p>
            </div>
            <div class="ai-history-panel__actions">
              <span class="ai-history-panel__count"
                >共 {{ filteredHistoryList.length }} 条</span
              >
              <button
                type="button"
                class="ai-history-panel__close"
                @click="closeHistoryPanel"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <div class="ai-history-toolbar">
            <MSelect
              v-model="historyTypeFilter"
              :options="historyTypeOptions"
              placeholder="全部类型"
              class="ai-history-select"
              dropdown-class="ai-history-select-dropdown"
            />
          </div>

          <div class="ai-history-list-wrap">
            <div v-if="historyLoading" class="ai-history-empty">
              <span class="material-symbols-outlined ai-history-empty__icon"
                >progress_activity</span
              >
              <p class="ai-history-empty__text">历史会话加载中...</p>
            </div>
            <div v-else-if="historyError" class="ai-history-empty">
              <span class="material-symbols-outlined ai-history-empty__icon">error</span>
              <p class="ai-history-empty__text">{{ historyError }}</p>
            </div>
            <ul v-else-if="filteredHistoryList.length > 0" class="ai-history-list">
              <li
                v-for="item in filteredHistoryList"
                :key="item.id"
                class="ai-history-item"
                :class="{ 'is-active': item.id === activeHistoryId }"
                @click="handleSelectHistory(item)"
              >
                <div class="ai-history-item__main">
                  <span class="ai-history-item__tag">{{ item.type }}</span>
                  <p class="ai-history-item__text">{{ item.content }}</p>
                </div>
                <div class="ai-history-item__side">
                  <span class="ai-history-item__date">{{ item.date }}</span>
                  <button
                    type="button"
                    class="ai-history-item__delete"
                    :disabled="historyDeletingId === item.id"
                    @click.stop="handleDeleteHistory(item.id)"
                  >
                    <span class="material-symbols-outlined">
                      {{ historyDeletingId === item.id ? "hourglass_top" : "delete" }}
                    </span>
                  </button>
                </div>
              </li>
            </ul>
            <div v-else class="ai-history-empty">
              <span class="material-symbols-outlined ai-history-empty__icon"
                >history</span
              >
              <p class="ai-history-empty__text">当前筛选下暂无历史会话</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showExistingLessonCourseDialog"
        class="ai-existing-course-overlay"
        @click="closeExistingLessonCourseDialog"
      >
        <div class="ai-existing-course-modal" @click.stop>
          <div class="ai-existing-course-modal__header">
            <h3 class="ai-existing-course-modal__title">选择课程</h3>
            <button
              type="button"
              class="ai-existing-course-modal__close"
              @click="closeExistingLessonCourseDialog"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="ai-existing-course-modal__body">
            <p class="ai-existing-course-modal__tip">请选择课程和章节</p>
            <div class="ai-existing-course-modal__type-tabs">
              <button
                type="button"
                class="ai-existing-course-modal__type-tab"
                :class="{ 'is-active': existingCourseType === 'official' }"
                @click="switchExistingCourseType('official')"
              >
                官方课程
              </button>
              <button
                type="button"
                class="ai-existing-course-modal__type-tab"
                :class="{ 'is-active': existingCourseType === 'custom' }"
                @click="switchExistingCourseType('custom')"
              >
                自定义课程
              </button>
            </div>

            <div
              v-if="existingCourseType === 'official'"
              class="ai-existing-course-modal__menu-tabs"
            >
              <button
                v-for="item in existingOfficialCourseMenuOptions"
                :key="item.value"
                type="button"
                class="ai-existing-course-modal__menu-tab"
                :class="{ 'is-active': selectedExistingCourseMenuId === item.value }"
                @click="switchExistingCourseMenu(item.value)"
              >
                {{ item.label }}
              </button>
            </div>

            <div class="ai-existing-course-modal__panel-wrap">
              <section class="ai-existing-course-modal__panel">
                <p class="ai-existing-course-modal__panel-title">请选择课程</p>
                <div class="ai-existing-course-modal__search-wrap">
                  <input
                    v-model="existingCourseSearchKeyword"
                    type="text"
                    class="ai-existing-course-modal__search"
                    placeholder="输入关键字搜索课程"
                  />
                  <span class="material-symbols-outlined">search</span>
                </div>
                <div class="ai-existing-course-modal__list">
                  <div
                    v-if="existingCourseMenuLoading && existingCourseType === 'official'"
                    class="ai-existing-course-modal__empty"
                  >
                    课程分类加载中...
                  </div>
                  <div v-else-if="existingCourseLoading" class="ai-existing-course-modal__empty">
                    课程加载中...
                  </div>
                  <div
                    v-else-if="filteredExistingCourseOptions.length === 0"
                    class="ai-existing-course-modal__empty"
                  >
                    暂无课程数据
                  </div>
                  <button
                    v-for="item in filteredExistingCourseOptions"
                    :key="item.courseId"
                    type="button"
                    class="ai-existing-course-modal__item"
                    :class="{ 'is-active': selectedExistingCourseId === item.courseId }"
                    @click="handleSelectExistingCourse(item.courseId)"
                  >
                    {{ item.courseName }}
                  </button>
                </div>
              </section>

              <section class="ai-existing-course-modal__panel">
                <p class="ai-existing-course-modal__panel-title">请选择章节</p>
                <div class="ai-existing-course-modal__search-wrap">
                  <input
                    v-model="existingChapterSearchKeyword"
                    type="text"
                    class="ai-existing-course-modal__search"
                    placeholder="输入关键字搜索章节"
                    :disabled="!selectedExistingCourseId"
                  />
                  <span class="material-symbols-outlined">search</span>
                </div>
                <div class="ai-existing-course-modal__list">
                  <div
                    v-if="!selectedExistingCourseId"
                    class="ai-existing-course-modal__empty"
                  >
                    请先在左侧选择课程
                  </div>
                  <div
                    v-else-if="existingChapterLoading"
                    class="ai-existing-course-modal__empty"
                  >
                    章节加载中...
                  </div>
                  <div
                    v-else-if="filteredExistingChapterOptions.length === 0"
                    class="ai-existing-course-modal__empty"
                  >
                    当前课程暂无章节
                  </div>
                  <button
                    v-for="item in filteredExistingChapterOptions"
                    :key="item.chapterId"
                    type="button"
                    class="ai-existing-course-modal__item"
                    :class="{ 'is-active': selectedExistingChapterId === item.chapterId }"
                    @click="selectedExistingChapterId = item.chapterId"
                  >
                    {{ item.chapterName }}
                  </button>
                </div>
              </section>
            </div>
          </div>

          <div class="ai-existing-course-modal__footer">
            <button
              type="button"
              class="ai-existing-course-modal__confirm"
              :disabled="!canConfirmExistingLessonCourse || existingOpenSubmitting"
              @click="handleConfirmExistingLessonCourse"
            >
              {{ existingOpenSubmitting ? "处理中..." : "确认" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <LinkCourseModal
      :visible="showExerciseLinkCourseDialog"
      :exercise-id="exerciseLinkExerciseId || undefined"
      submit-mode="external"
      :refresh-token="exerciseLinkRefreshToken"
      :external-link-request="handleExerciseExternalLinkRequest"
      @close="closeExerciseLinkCourseDialog"
    />

  </div>
</template>

<script setup lang="ts">
import { aiAdmin } from "~/composables/api/ai";
import { taskmanagementcenterApi } from "~/composables/api/taskmanagement";
import { studyApi } from "~/composables/api/study";
import { useChunkUpload } from "~/composables/useChunkUpload";
import { ElMessage } from "~/components/ui";
import LinkCourseModal from "~/components/taskmanagement/LinkCourseModal.vue";

definePageMeta({
  layout: "blank",
});
const route = useRoute();
const router = useRouter();

useHead({
  title: "AI助手",
  link: [
    {
      rel: "preload",
      href: "/fonts/material-symbols-outlined-full.ttf",
      as: "font",
      type: "font/ttf",
      crossorigin: "",
    },
  ],
});

type AssistantCard = {
  key: string;
  title: string;
  desc: string;
  action: string;
  icon: string;
};

type HistoryRecord = {
  id: string;
  sessionId: string;
  sessionType: string;
  type: string;
  content: string;
  date: string;
};

type ImageHistoryPreviewItem = {
  id: string;
  recordId: string;
  sessionId: string;
  messageId: string;
  content: string;
  date: string;
  imageUrl: string;
};

type QuotaDetailItem = {
  quotaName: string;
  userLimit: string;
};

type AiChatRole = "user" | "assistant";

type AiUploadFile = {
  name: string;
  ossId: string;
  url: string;
  previewUrl?: string;
  fileType: string;
  size?: number;
};

type AiChatMessage = {
  id: string;
  role: AiChatRole;
  content: string;
  file: AiUploadFile | null;
  suggestions?: string[];
  pending?: boolean;
  stopped?: boolean;
  thinkingMode?: boolean;
  thinkingCollapsed?: boolean;
};

type ExistingCourseOption = {
  courseId: string;
  courseName: string;
  chapters: ExistingChapterOption[];
};

type ExistingChapterOption = {
  chapterId: string;
  chapterName: string;
};

type ExistingCourseMenuItem = {
  menuId: number | null;
  menuName: string;
  children?: ExistingCourseMenuItem[];
};

type AnalysisGradeClassOption = {
  value: string;
  label: string;
};

type AnalysisGradeOption = {
  value: string;
  label: string;
  classes: AnalysisGradeClassOption[];
};

type AnalysisSelectedTag = {
  key: string;
  label: string;
  type: "all" | "grade" | "class";
};

type ImageSizeOption = {
  value: string;
  label: string;
  previewWidth: number;
  previewHeight: number;
};

type CodeAssistantMode = "generate" | "explain" | "debug";

type CodeAssistantModeOption = {
  value: CodeAssistantMode;
  title: string;
  desc: string;
  icon: string;
};

type CodeAssistantQuickExample = {
  requirement: string;
  code: string;
  error: string;
};

const searchKeyword = ref("");
const {
  getAiQuotaDetail,
  createAiChat,
  getHotAiList,
  getAiSessions,
  getImageList,
  getSessions,
  deleteSession,
  stopSession,
  uploadAI,
  getFiles,
  deleteFiles,
  getExistingCursor,
  getNewCursor,
  getPptExistingCursor,
  getPptNewCursor,
  getExerciseExistingCursor,
  getExerciseNewCursorEdit,
} = aiAdmin();
const { getSituationCascade } = studyApi();
const { getExerciseCourseMenuTree, getCursorList, getChapterList } = taskmanagementcenterApi();
const aiUploadInputRef = ref<HTMLInputElement | null>(null);
const lessonUploadInputRef = ref<HTMLInputElement | null>(null);
const imageUploadInputRef = ref<HTMLInputElement | null>(null);
const aiChatListRef = ref<HTMLElement | null>(null);
const lessonChatEditorRef = ref<HTMLElement | null>(null);
const chatListScrollTop = ref(0);
const chatListScrollHeight = ref(0);
const chatListClientHeight = ref(0);
const aiAssistantPageRef = ref<HTMLElement | null>(null);
let aiAssistantPageResizeObserver: ResizeObserver | null = null;
const aiAssistantLayoutWidth = ref(1360);
const showHistoryPanel = ref(false);
const historyLoading = ref(false);
const historyError = ref("");
const historyDeletingId = ref("");
const historyTypeFilter = ref("");
const activeHistoryId = ref("");
const showQuotaDetail = ref(false);
const quotaLoading = ref(false);
const quotaError = ref("");
const quotaFetchedAt = ref(0);
const quotaDetail = ref<QuotaDetailItem[]>([]);
const aiUploadFile = ref<AiUploadFile | null>(null);
const isChatMode = ref(false);
const isLessonPlanMode = ref(false);
const isAnalysisMode = ref(false);
const isImageMode = ref(false);
const chatSessionType = ref<1 | 5 | 6 | 7>(1);
const lessonPlanSessionType = ref<2 | 3 | 4>(2);
const lessonPlanChatActive = ref(false);
const lessonChatEditorExpanded = ref(false);
const imageGenerating = ref(false);
const imageHistoryLoading = ref(false);
const activeGenerateFileMenuMessageId = ref("");
const showExistingLessonCourseDialog = ref(false);
const showExerciseLinkCourseDialog = ref(false);
const exerciseLinkExerciseId = ref("");
const exerciseLinkRefreshToken = ref(0);
const pendingExerciseLinkSessionId = ref("");
const existingCourseLoading = ref(false);
const existingOpenSubmitting = ref(false);
const existingCourseSearchKeyword = ref("");
const existingChapterSearchKeyword = ref("");
const existingChapterLoading = ref(false);
const existingChapterCacheMap = ref<Record<string, ExistingChapterOption[]>>({});
const existingCourseOptions = ref<ExistingCourseOption[]>([]);
const existingChapterOptions = ref<ExistingChapterOption[]>([]);
const existingCourseType = ref<"official" | "custom">("official");
const existingCourseMenuLoading = ref(false);
const existingCourseMenuTree = ref<ExistingCourseMenuItem[]>([]);
const selectedExistingCourseMenuId = ref("");
const selectedExistingCourseId = ref("");
const selectedExistingChapterId = ref("");
const pendingExistingLessonSessionId = ref("");
const pendingExistingOpenType = ref<"lesson" | "ppt">("lesson");
const lessonPlanGradeOptions = [
  { value: "一年级", label: "一年级" },
  { value: "二年级", label: "二年级" },
  { value: "三年级", label: "三年级" },
  { value: "四年级", label: "四年级" },
  { value: "五年级", label: "五年级" },
  { value: "六年级", label: "六年级" },
  { value: "七年级", label: "七年级" },
  { value: "八年级", label: "八年级" },
  { value: "九年级", label: "九年级" },
];
const lessonPlanScenarioOptions = [
  { value: "家居", label: "家居" },
  { value: "交通", label: "交通" },
  { value: "医疗", label: "医疗" },
  { value: "教育", label: "教育" },
  { value: "安防", label: "安防" },
  { value: "机器人", label: "机器人" },
  { value: "饮食", label: "饮食" },
  { value: "服装", label: "服装" },
  { value: "艺术", label: "艺术" },
  { value: "环保", label: "环保" },
];
const lessonPlanToolOptions = [
  { value: "Matatacode（VinicBot）", label: "Matatacode（VinicBot）" },
  { value: "Matatacode（Nous）", label: "Matatacode（Nous）" },
];
const lessonPlanHardwareOptions = [
  { value: "TaleBot pro", label: "TaleBot pro" },
  { value: "Coding Set", label: "Coding Set" },
  { value: "VinciBot", label: "VinciBot" },
  { value: "Nous AI Set", label: "Nous AI Set" },
];
const lessonPlanStandardOptions = [
  {
    value: "《义务教育信息科技课程标准（2022年版）》",
    label: "《义务教育信息科技课程标准（2022年版）》",
  },
  {
    value: "《普通高中信息技术课程标准(2017年版2020年修订)》",
    label: "《普通高中信息技术课程标准(2017年版2020年修订)》",
  },
  { value: "《中小学人工智能课程指南》", label: "《中小学人工智能课程指南》" },
  { value: "《义务教育课程方案（2022版）》", label: "《义务教育课程方案（2022版）》" },
  {
    value: "《中小学人工智能技术与素养框架（中央电化教育馆编）》",
    label: "《中小学人工智能技术与素养框架（中央电化教育馆编）》",
  },
  { value: "《中小学人工智能课程开发标准》", label: "《中小学人工智能课程开发标准》" },
  { value: "《AI4K12》", label: "《AI4K12》" },
];
const lessonPlanPeriodOptions = [
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6" },
];
const lessonPlanQuestionCountOptions = Array.from({ length: 21 }, (_, index) => ({
  value: String(index),
  label: String(index),
}));
const LESSON_PLAN_SUBJECT_MAX_LENGTH = 100;
const LESSON_PLAN_REQUIREMENT_MAX_LENGTH = 100;
const ANALYSIS_REQUIREMENT_MAX_LENGTH = 100;
const IMAGE_PROMPT_MAX_LENGTH = 100;
const ANALYSIS_ALL_GRADE_VALUE = "__all_grade__";
const ANALYSIS_DATE_START = "2021-04-27";
const todayText = new Date().toISOString().slice(0, 10);
const IMAGE_SIZE_OPTIONS: ImageSizeOption[] = [
  { value: "1:1", label: "1:1", previewWidth: 20, previewHeight: 20 },
  { value: "3:4", label: "3:4", previewWidth: 18, previewHeight: 24 },
  { value: "4:3", label: "4:3", previewWidth: 26, previewHeight: 20 },
  { value: "16:9", label: "16:9", previewWidth: 30, previewHeight: 17 },
  { value: "9:16", label: "9:16", previewWidth: 17, previewHeight: 30 },
];
const IMAGE_PROMPT_PRESET_TAGS = [
  {
    label: "#赛博朋克",
    value: "赛博朋克",
    className: "ai-image__prompt-tag--primary",
  },
  {
    label: "#4K画质",
    value: "4K画质",
    className: "ai-image__prompt-tag--secondary",
  },
] as const;
const IMAGE_PROMPT_CUSTOM_TAG_MAX_LENGTH = 12;
const CODE_ASSISTANT_MODE_OPTIONS: CodeAssistantModeOption[] = [
  {
    value: "generate",
    title: "代码生成",
    desc: "生成一个冒泡排序算法",
    icon: "code_blocks",
  },
  {
    value: "explain",
    title: "代码解释",
    desc: "选中代码，可帮你进行代码解释",
    icon: "article",
  },
  {
    value: "debug",
    title: "代码纠错",
    desc: "选中代码，可帮你进行代码纠错",
    icon: "rule_settings",
  },
];
const CODE_ASSISTANT_EXPLAIN_DEBUG_CODE =
  "public class Demo { public static void main(String[] args) { String s = null; System.out.println(s.length()); } }";
const CODE_ASSISTANT_QUICK_EXAMPLES: Record<CodeAssistantMode, CodeAssistantQuickExample> = {
  generate: {
    requirement: "生成一个冒泡排序算法",
    code: "",
    error: "",
  },
  explain: {
    requirement: "请解释以下代码",
    code: CODE_ASSISTANT_EXPLAIN_DEBUG_CODE,
    error: "",
  },
  debug: {
    requirement: "分析报错原因并给出修复后的代码",
    code: CODE_ASSISTANT_EXPLAIN_DEBUG_CODE,
    error: "NullPointerException",
  },
};
const CODE_ASSISTANT_LANGUAGE_OPTIONS = [
  { value: "Java", label: "Java" },
  { value: "Python", label: "Python" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "C", label: "C" },
  { value: "C++", label: "C++" },
  { value: "Go", label: "Go" },
  { value: "Scratch", label: "Scratch" },
];
const CODE_ASSISTANT_REQUIREMENT_MAX_LENGTH = 3000;
const CODE_ASSISTANT_CODE_MAX_LENGTH = 12000;
const CODE_ASSISTANT_ERROR_MAX_LENGTH = 500;
const lessonPlanForm = reactive({
  grade: "",
  unitType: "single",
  questionKind: "scene" as "scene" | "knowledge",
  singleCount: "0",
  multipleCount: "0",
  judgeCount: "0",
  blankCount: "0",
  connectCount: "0",
  periodCount: "",
  subject: "",
  scenario: "",
  teachTool: "",
  hardware: "",
  specialRequirement: "",
  standard: [] as string[],
});
const analysisForm = reactive({
  dateRange: [ANALYSIS_DATE_START, todayText] as [string, string],
  specialRequirement: "",
  selectedGradeIds: [] as string[],
  selectedClassIds: [] as string[],
});
const imageForm = reactive({
  prompt: "",
  size: "1:1",
  referenceImageUrl: "",
});
const codeAssistantForm = reactive({
  mode: "generate" as CodeAssistantMode,
  language: "",
  requirement: "",
  code: "",
  error: "",
});
const imageResultUrls = ref<string[]>([]);
const imageResultText = ref("");
const imageRecentHistoryList = ref<ImageHistoryPreviewItem[]>([]);
const imageResultMainRef = ref<HTMLImageElement | null>(null);
const imagePromptCustomTagInputRef = ref<HTMLInputElement | null>(null);
const showImagePromptTagEditor = ref(false);
const imagePromptCustomTag = ref("");
const imageGenerateProgressPercent = ref(0);
const imageGenerateProgressTimer = ref<number | null>(null);
const analysisTargetPickerRef = ref<HTMLElement | null>(null);
const analysisTargetDropdownVisible = ref(false);
const analysisCascadeLoading = ref(false);
const analysisGradeOptions = ref<AnalysisGradeOption[]>([]);
const analysisActiveGradeId = ref("");
const lessonRequirementTipsVisible = ref(false);
const lessonRequirementTipsRef = ref<HTMLElement | null>(null);
const lessonStandardDropdownVisible = ref(false);
const lessonStandardSelectRef = ref<HTMLElement | null>(null);
const lessonRequirementTips = [
  { tag: "教学方法", text: "教学过程采用5E教学法" },
  { tag: "学生学情", text: "本班学生基础比较薄弱，没有学习过编程" },
  { tag: "学生学情", text: "本班30%学生有Python编程基础，需设计分层任务" },
  {
    tag: "学生学情",
    text: "针对班级内个别对人工智能有特别浓厚兴趣的学生，教案里设计专属的进阶学习任务和指导建议",
  },
  {
    tag: "教学环节",
    text: "教学过程中加入小组合作学习环节，合理分配小组成员，明确分工，培养学生的团队协作能力",
  },
  {
    tag: "教学材料",
    text: "学校设备有限，需要实体教具的部分请用其他多媒体资源（图片、视频等）代替",
  },
];
const chatSessionId = ref("");
const chatMessages = ref<AiChatMessage[]>([]);
const chatRequesting = ref(false);
const isStreamingReply = ref(false);
const activeChatAbortController = ref<AbortController | null>(null);
const pendingStopSessionRequest = ref(false);
const pendingStopFallbackTimer = ref<number | null>(null);
const enableDeepThinking = ref(false);
const hotQuestions = ref<string[]>([]);
const AI_UPLOAD_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".tiff",
  ".ico",
  ".icns",
  ".sgi",
  ".jp2",
  ".heic",
  ".heif",
];
const AI_UPLOAD_VIDEO_EXTENSIONS = [".mp4", ".avi", ".mov"];
const AI_UPLOAD_PDF_EXTENSIONS = [".pdf"];
const AI_UPLOAD_ACCEPT = [
  ...AI_UPLOAD_IMAGE_EXTENSIONS,
  ...AI_UPLOAD_VIDEO_EXTENSIONS,
  ...AI_UPLOAD_PDF_EXTENSIONS,
].join(",");
const AI_IMAGE_UPLOAD_ACCEPT = AI_UPLOAD_IMAGE_EXTENSIONS.join(",");
const AI_UPLOAD_TOOLTIP_TEXT =
  "最多上传一个文件，支持图片（jpg、jpeg、png、gif、webp、bmp、tiff、ico、icns、sgi、jp2、heic、heif）、视频（mp4、avi、mov）和PDF（pdf），单文件最大15MB。";
const AI_UPLOAD_POLL_INTERVAL_MS = 1200;
const AI_UPLOAD_POLL_MAX_RETRY = 50;
const SEARCH_KEYWORD_MAX_LENGTH = 3000;
const UPLOAD_PROGRESS_RADIUS = 24;
const UPLOAD_PROGRESS_CIRCUMFERENCE = 2 * Math.PI * UPLOAD_PROGRESS_RADIUS;
const aiUploadStatus = ref<"idle" | "uploading" | "success" | "error">("idle");
const aiUploadProgressPercent = ref(0);
const aiUploadErrorMessage = ref("");
const aiUploadAbortController = ref<AbortController | null>(null);
const {
  progressPercent: imageRefChunkProgressPercent,
  errorMessage: imageRefChunkErrorMessage,
  isUploading: isImageRefChunkUploading,
  start: startImageRefChunkUpload,
  cancel: cancelImageRefChunkUpload,
  reset: resetImageRefChunkUpload,
} = useChunkUpload({
  chunkSize: 5 * 1024 * 1024,
  defaultErrorMessage: "参考图分片上传失败，请重试",
});
const isAiUploading = computed(() => aiUploadStatus.value === "uploading");
const aiUploadProgressOffset = computed(
  () => UPLOAD_PROGRESS_CIRCUMFERENCE * (1 - aiUploadProgressPercent.value / 100)
);
const aiUploadStatusText = computed(() => {
  if (aiUploadStatus.value === "error") {
    return aiUploadErrorMessage.value || "上传失败";
  }
  if (isAiUploading.value) {
    const percent = Math.max(0, Math.min(100, Math.round(aiUploadProgressPercent.value)));
    return percent > 0 ? `上传中...${percent}%` : "上传中...";
  }
  if (aiUploadStatus.value === "success" && (aiUploadFile.value?.ossId || aiUploadFile.value?.url)) {
    return "上传完成";
  }
  return "";
});
const searchKeywordLength = computed(() => searchKeyword.value.length);
const lessonPlanSubjectLength = computed(() => lessonPlanForm.subject.length);
const lessonPlanRequirementLength = computed(
  () => lessonPlanForm.specialRequirement.length
);
const lessonPlanQuestionCountTotal = computed(() => {
  const values = [
    lessonPlanForm.singleCount,
    lessonPlanForm.multipleCount,
    lessonPlanForm.judgeCount,
    lessonPlanForm.blankCount,
    lessonPlanForm.connectCount,
  ];
  return values.reduce((sum, value) => sum + Number(value || 0), 0);
});
const shouldShowLessonGrade = computed(
  () => lessonPlanSessionType.value !== 4 || lessonPlanForm.questionKind === "scene"
);
const canSubmitLessonPlan = computed(() => {
  if (lessonPlanSessionType.value === 4) {
    if (!lessonPlanForm.questionKind) {
      return false;
    }
    if (!lessonPlanForm.scenario) {
      return false;
    }
    if (shouldShowLessonGrade.value && !lessonPlanForm.grade) {
      return false;
    }
    if (lessonPlanForm.subject.trim().length === 0) {
      return false;
    }
    if (lessonPlanQuestionCountTotal.value <= 0) {
      return false;
    }
    return true;
  }
  if (!lessonPlanForm.grade || lessonPlanForm.subject.trim().length === 0) {
    return false;
  }
  if (lessonPlanForm.unitType === "unit" && !lessonPlanForm.periodCount) {
    return false;
  }
  return true;
});
const analysisRequirementLength = computed(() => analysisForm.specialRequirement.length);
const analysisDatePresets = computed(() => {
  const now = new Date();
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
  const previousMonthStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
  const previousMonthStart = `${previousMonthStartDate.getFullYear()}-${String(
    previousMonthStartDate.getMonth() + 1
  ).padStart(2, "0")}-01`;
  const previousMonthEnd = `${previousMonthEndDate.getFullYear()}-${String(
    previousMonthEndDate.getMonth() + 1
  ).padStart(2, "0")}-${String(previousMonthEndDate.getDate()).padStart(2, "0")}`;
  return [
    { key: "all", label: "全部日期", start: ANALYSIS_DATE_START, end: todayText },
    { key: "last-month", label: "上月", start: previousMonthStart, end: previousMonthEnd },
    { key: "this-month", label: "本月", start: currentMonthStart, end: todayText },
    { key: "custom", label: "自定义", mode: "custom" as const },
  ];
});
const analysisGradeIds = computed(() => analysisGradeOptions.value.map((item) => item.value));
const analysisAllClassIds = computed(() =>
  analysisGradeOptions.value.flatMap((item) => item.classes.map((classItem) => classItem.value))
);
const analysisClassLabelMap = computed(() => {
  const map: Record<string, string> = {};
  analysisGradeOptions.value.forEach((grade) => {
    grade.classes.forEach((classItem) => {
      map[classItem.value] = classItem.label;
    });
  });
  return map;
});
const analysisGradeLabelMap = computed(() => {
  const map: Record<string, string> = {};
  analysisGradeOptions.value.forEach((grade) => {
    map[grade.value] = grade.label;
  });
  return map;
});
const analysisIsAllSelected = computed(() => {
  if (!analysisGradeIds.value.length || !analysisAllClassIds.value.length) return false;
  const gradeSet = new Set(analysisForm.selectedGradeIds);
  const classSet = new Set(analysisForm.selectedClassIds);
  return (
    analysisGradeIds.value.every((item) => gradeSet.has(item)) &&
    analysisAllClassIds.value.every((item) => classSet.has(item))
  );
});
const analysisSelectedTagList = computed<AnalysisSelectedTag[]>(() => {
  if (analysisIsAllSelected.value) {
    return [{ key: ANALYSIS_ALL_GRADE_VALUE, label: "全部年级", type: "all" }];
  }
  const classTags = analysisForm.selectedClassIds
    .map((item) => ({
      key: item,
      label: analysisClassLabelMap.value[item] || item,
      type: "class" as const,
    }))
    .filter((item) => item.label)
    .slice(0, 6);
  if (classTags.length) {
    return classTags;
  }
  return analysisForm.selectedGradeIds
    .map((item) => ({
      key: item,
      label: analysisGradeLabelMap.value[item] || item,
      type: "grade" as const,
    }))
    .filter((item) => item.label)
    .slice(0, 6);
});
const analysisActiveGrade = computed(
  () =>
    analysisGradeOptions.value.find((item) => item.value === analysisActiveGradeId.value) ||
    analysisGradeOptions.value[0] ||
    null
);
const analysisHasDateRange = computed(() => {
  const [startDate, endDate] = analysisForm.dateRange || ["", ""];
  return Boolean(String(startDate || "").trim()) && Boolean(String(endDate || "").trim());
});
const canSubmitAnalysis = computed(() => {
  if (!analysisHasDateRange.value) return false;
  return analysisForm.selectedClassIds.length > 0;
});
const imagePromptLength = computed(() => imageForm.prompt.length);
const currentImageResultUrl = computed(() => imageResultUrls.value[0] || "");
const buildAiImageProxyUrl = (url: string) => {
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
const currentImageDisplayUrl = computed(() => buildAiImageProxyUrl(currentImageResultUrl.value));
const hasImageResult = computed(() => !!currentImageResultUrl.value);
const imageGenerateProgressText = computed(() => {
  const percent = Math.max(0, Math.min(100, Math.round(imageGenerateProgressPercent.value)));
  return percent > 0 ? `正在生成图片...${percent}%` : "正在生成图片...";
});
const imageQuotaRemainText = computed(() => {
  const target = quotaDetail.value.find((item) =>
    /生图|图片|图像|image/i.test(String(item.quotaName || ""))
  );
  if (!target) return "--";
  return String(target.userLimit || "--");
});
const isCodeAssistantMode = computed(() => isChatMode.value && chatSessionType.value === 5);
const codeAssistantRequirementLength = computed(() => codeAssistantForm.requirement.length);
const codeAssistantRequirementPlaceholder = computed(() => {
  if (codeAssistantForm.mode === "generate") {
    return "请输入您的需求，AI可为您自动生成代码";
  }
  if (codeAssistantForm.mode === "debug") {
    return "请输入待纠错代码，最后一行可写：报错：NullPointerException";
  }
  return "请输入要解释的代码";
});
const canSubmitCodeAssistant = computed(() => {
  if (chatRequesting.value) return false;
  return codeAssistantForm.requirement.trim().length > 0;
});
const canSubmitImageGenerate = computed(() => {
  if (chatRequesting.value || imageGenerating.value) return false;
  if (isAiUploading.value) return false;
  return imageForm.prompt.trim().length > 0;
});
const canSubmitChat = computed(() => {
  const hasKeyword = searchKeyword.value.trim().length > 0;
  const hasUpload = !!aiUploadFile.value;
  return !chatRequesting.value && (hasKeyword || hasUpload);
});
const showChatScrollToTop = computed(() => {
  const canScroll = chatListScrollHeight.value - chatListClientHeight.value > 40;
  return canScroll && chatListScrollTop.value > 120;
});
const showChatScrollToBottom = computed(() => {
  const canScroll = chatListScrollHeight.value - chatListClientHeight.value > 40;
  if (!canScroll) return false;
  const distanceToBottom =
    chatListScrollHeight.value - chatListClientHeight.value - chatListScrollTop.value;
  return distanceToBottom > 120;
});
const chatScrollActionKind = computed<"up" | "down" | "">(() => {
  if (showChatScrollToBottom.value) return "down";
  if (showChatScrollToTop.value) return "up";
  return "";
});
const latestAssistantMessageId = computed(() => {
  for (let index = chatMessages.value.length - 1; index >= 0; index -= 1) {
    const item = chatMessages.value[index];
    if (item.role === "assistant" && !item.pending && !item.stopped) {
      return item.id;
    }
  }
  return "";
});

const canRetryStoppedMessage = computed(() => {
  if (chatRequesting.value) return false;
  return chatMessages.value.some((item) => item.role === "assistant" && item.stopped);
});

const canRegenerateLessonPlan = computed(
  () =>
    lessonPlanChatActive.value &&
    !chatRequesting.value &&
    !isStreamingReply.value &&
    canSubmitLessonPlan.value
);

const filteredExistingCourseOptions = computed(() => {
  const keyword = existingCourseSearchKeyword.value.trim().toLowerCase();
  if (!keyword) return existingCourseOptions.value;
  return existingCourseOptions.value.filter((item) =>
    item.courseName.toLowerCase().includes(keyword)
  );
});

const existingOfficialCourseMenuOptions = computed(() => {
  return existingCourseMenuTree.value
    .filter((item) => item.menuId !== null)
    .map((item) => ({
      value: String(item.menuId),
      label: item.menuName,
    }));
});

const filteredExistingChapterOptions = computed(() => {
  const keyword = existingChapterSearchKeyword.value.trim().toLowerCase();
  if (!keyword) return existingChapterOptions.value;
  return existingChapterOptions.value.filter((item) =>
    item.chapterName.toLowerCase().includes(keyword)
  );
});

const canConfirmExistingLessonCourse = computed(
  () => !!selectedExistingCourseId.value && !!selectedExistingChapterId.value
);
const isPptGenerateMode = computed(
  () => lessonPlanChatActive.value && lessonPlanSessionType.value === 3
);
const isExerciseGenerateMode = computed(
  () => lessonPlanChatActive.value && lessonPlanSessionType.value === 4
);

const lessonPlanModeTitle = computed(() => {
  if (lessonPlanSessionType.value === 3) return "生成课件PPT";
  if (lessonPlanSessionType.value === 4) return "生成习题";
  return "生成教案";
});
const lessonPlanModeSubjectLabel = computed(() =>
  lessonPlanSessionType.value === 3 ? "课件主题" : "课程主题"
);
const lessonPlanModeStandardPlaceholder = computed(() =>
  lessonPlanSessionType.value === 3
    ? "请选择生成的课件期望以什么标准为依据"
    : lessonPlanSessionType.value === 4
      ? "请选择生成的习题期望以什么标准为依据"
      : "请选择生成的教案期望以什么标准为依据"
);
const chatModeTitle = computed(() => {
  if (lessonPlanChatActive.value) return lessonPlanModeTitle.value;
  if (chatSessionType.value === 5) return "代码编程助手";
  if (chatSessionType.value === 6) return "AI学情分析";
  if (chatSessionType.value === 7) return "AI智能生图";
  return "AI自由问答";
});
const chatModeSubtitle = computed(() => {
  if (chatSessionType.value === 5) {
    return "当前对话聚焦编程教学与代码问题";
  }
  if (chatSessionType.value === 6) {
    return "当前对话聚焦学情报告生成与解读";
  }
  if (chatSessionType.value === 7) {
    return "当前对话聚焦教学场景图片创作";
  }
  return "当前对话就在本页继续，不弹窗，也不跳转";
});
const assistantCurrentTitle = computed(() => {
  if (isChatMode.value) return chatModeTitle.value;
  if (isLessonPlanMode.value) return lessonPlanModeTitle.value;
  if (isAnalysisMode.value) return "AI学情分析";
  if (isImageMode.value) return "AI智能生图";
  return "AI助手";
});

const breadcrumbRootLabel = computed(() =>
  route.path.startsWith("/system/opt") ? "AI实践中心" : "AI助手"
);

const showBreadcrumbCurrent = computed(
  () => assistantCurrentTitle.value !== breadcrumbRootLabel.value
);

const showBreadcrumb = computed(() => {
  return isChatMode.value || isLessonPlanMode.value || isAnalysisMode.value || isImageMode.value;
});

const lessonPlanSummaryText = computed(() => {
  const gradeText = shouldShowLessonGrade.value ? lessonPlanForm.grade || "未选年级" : "无年级";
  const topicText = lessonPlanForm.subject.trim() || "未填主题";
  if (lessonPlanSessionType.value === 4) {
    const kindText = lessonPlanForm.questionKind === "knowledge" ? "知识类" : "情境类";
    return `${lessonPlanModeTitle.value} · ${kindText} · ${gradeText} — ${topicText}`;
  }
  return `${lessonPlanModeTitle.value} · ${gradeText} — ${topicText}`;
});

watch(
  () => lessonPlanForm.unitType,
  (value) => {
    if (value !== "unit") {
      lessonPlanForm.periodCount = "";
    }
  }
);

watch(
  () => lessonPlanForm.questionKind,
  (value) => {
    if (value === "knowledge") {
      lessonPlanForm.grade = "";
    }
  }
);

const chatSuggestionList = computed(() => {
  const latestUserMessage = [...chatMessages.value]
    .reverse()
    .find((item) => item.role === "user");
  const keyword = String(latestUserMessage?.content || "").trim();
  if (!keyword) {
    return [
      "请给我一份更详细的教学设计",
      "帮我把这个问题拆成课堂活动步骤",
      "请再提供3个可直接使用的追问",
    ];
  }
  return [
    `请围绕“${keyword.slice(0, 16)}”生成课堂目标`,
    `请把“${keyword.slice(0, 16)}”整理成教学步骤`,
    `请给“${keyword.slice(0, 16)}”再补充3个延伸问题`,
  ];
});
const historyList = ref<HistoryRecord[]>([]);

const normalCards: AssistantCard[] = [
  {
    key: "lesson-plan",
    title: "教案生成",
    desc: "智能构建标准化、个性化教学方案，深度契合各学科教学大纲。",
    action: "立即开始",
    icon: "description",
  },
  {
    key: "ppt",
    title: "课件PPT生成",
    desc: "一键生成精美教学课件，多套教育模版可选，极大提升备课效率。",
    action: "智能生成",
    icon: "present_to_all",
  },
  {
    key: "quiz",
    title: "习题生成",
    desc: "根据知识点自动产出各难度层级的练习题，支持多种题型库导出。",
    action: "布置作业",
    icon: "assignment",
  },
  {
    key: "code",
    title: "代码编程助手",
    desc: "辅助编程教学，提供实时代码指导、自动纠错与逻辑优化方案。",
    action: "开启环境",
    icon: "terminal",
  },
  {
    key: "analysis",
    title: "AI学情分析",
    desc: "大数据驱动的精准学情诊断，可视化展示每个学生的成长轨迹。",
    action: "查看报告",
    icon: "analytics",
  },
  {
    key: "image",
    title: "AI智能生图",
    desc: "释放创意，为教学素材提供无限可能的视觉化内容，图文并茂。",
    action: "创作素材",
    icon: "image",
  },
];

const highlightCard: AssistantCard = {
  key: "immersive",
  title: "AI沉浸式交互课堂",
  desc:
    "将任何主题或文档转化为沉浸式的 AI 驱动学习体验，多智能体编排技术让 AI 教师与同学在实时互动课堂中协同授课。",
  action: "开启沉浸体验",
  icon: "image",
};

const AI_SESSION_TYPE_LABEL_MAP: Record<string, string> = {
  "1": "AI自由问答",
  "2": "生成教案",
  "3": "生成课件PPT",
  "4": "生成习题",
  "5": "代码编程助手",
  "6": "AI学情分析",
  "7": "智能生图",
};

const AI_SESSION_TYPE_OPTIONS = [
  { value: "", label: "全部类型" },
  { value: "1", label: "AI自由问答" },
  { value: "2", label: "生成教案" },
  { value: "3", label: "生成课件PPT" },
  { value: "4", label: "生成习题" },
  { value: "5", label: "代码编程助手" },
  { value: "6", label: "AI学情分析" },
  { value: "7", label: "智能生图" },
];

const AI_CHAT_STATE_STORAGE_KEY = "mata-ai-chat-state-v1";
const AI_FORCE_HOME_ONCE_KEY = "mata-ai-force-home-once";
const AI_CHAT_LAST_SNAPSHOT_KEY = "mata-ai-last-session-snapshot-v1";
const AI_CHAT_STATE_MAX_MESSAGES = 40;
const AI_ROUTE_QUERY_VIEW_KEY = "aiView";
const AI_ROUTE_QUERY_HISTORY_ID_KEY = "aiHistoryId";
const AI_ROUTE_QUERY_SESSION_ID_KEY = "aiSessionId";
const AI_ROUTE_QUERY_SESSION_TYPE_KEY = "aiSessionType";

const normalizeLessonPlanSessionType = (value: unknown): 2 | 3 | 4 => {
  const numericValue = Number(value || 0);
  if (numericValue === 3) return 3;
  if (numericValue === 4) return 4;
  return 2;
};

const normalizeChatSessionType = (value: unknown): 1 | 5 | 6 | 7 => {
  const numericValue = Number(value || 0);
  if (numericValue === 7) return 7;
  if (numericValue === 6) return 6;
  return numericValue === 5 ? 5 : 1;
};

const getAnalysisCascadeArray = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Record<string, unknown> => !!item && typeof item === "object"
    );
  }
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  const candidates = [record.list, record.rows, record.data];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Record<string, unknown> => !!item && typeof item === "object"
      );
    }
  }
  return [];
};

const getAnalysisCascadeChildren = (node: Record<string, unknown>) => {
  const candidates = [node.children, node.classList, node.list, node.rows];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Record<string, unknown> => !!item && typeof item === "object"
      );
    }
  }
  return [] as Record<string, unknown>[];
};

const getAnalysisCascadeNodeLabel = (node: Record<string, unknown>, fallback: string) => {
  const candidates = [
    node.label,
    node.name,
    node.gradeName,
    node.className,
    node.title,
    node.nickName,
  ];
  const hit = candidates.find((item) => typeof item === "string" && item.trim());
  return typeof hit === "string" ? hit.trim() : fallback;
};

const getAnalysisCascadeNodeValue = (node: Record<string, unknown>, fallback: string) => {
  const candidates = [node.value, node.id, node.gradeId, node.classId, node.grade];
  const hit = candidates.find((item) => item !== undefined && item !== null && `${item}`.trim());
  return hit === undefined || hit === null ? fallback : String(hit).trim();
};

const normalizeAnalysisGradeOptions = (payload: unknown): AnalysisGradeOption[] => {
  return getAnalysisCascadeArray(payload)
    .map((gradeNode, gradeIndex) => {
      const value = getAnalysisCascadeNodeValue(gradeNode, `grade-${gradeIndex + 1}`);
      const label = getAnalysisCascadeNodeLabel(gradeNode, `年级${gradeIndex + 1}`);
      const classes = getAnalysisCascadeChildren(gradeNode)
        .map((classNode, classIndex) => ({
          value: getAnalysisCascadeNodeValue(
            classNode,
            `class-${gradeIndex + 1}-${classIndex + 1}`
          ),
          label: getAnalysisCascadeNodeLabel(classNode, `班级${classIndex + 1}`),
        }))
        .filter((item) => item.value);
      return {
        value,
        label,
        classes,
      };
    })
    .filter((item) => item.value);
};

const selectAllAnalysisGradeAndClass = () => {
  analysisForm.selectedGradeIds = [...analysisGradeIds.value];
  analysisForm.selectedClassIds = [...analysisAllClassIds.value];
};

const syncAnalysisSelectionWithOptions = () => {
  const validGradeSet = new Set(analysisGradeIds.value);
  const validClassSet = new Set(analysisAllClassIds.value);
  const classSelectedSet = new Set(
    analysisForm.selectedClassIds.filter((item) => validClassSet.has(item))
  );
  const gradeSelectedSet = new Set(
    analysisForm.selectedGradeIds.filter((item) => validGradeSet.has(item))
  );
  analysisGradeOptions.value.forEach((grade) => {
    const classIds = grade.classes.map((item) => item.value);
    if (!classIds.length) return;
    const allClassChecked = classIds.every((item) => classSelectedSet.has(item));
    if (allClassChecked) {
      gradeSelectedSet.add(grade.value);
    } else {
      gradeSelectedSet.delete(grade.value);
    }
  });
  analysisForm.selectedGradeIds = Array.from(gradeSelectedSet);
  analysisForm.selectedClassIds = Array.from(classSelectedSet);
};

const loadAnalysisGradeOptions = async () => {
  if (analysisCascadeLoading.value) return;
  analysisCascadeLoading.value = true;
  try {
    const data = await getSituationCascade({ type: "class" } as any);
    analysisGradeOptions.value = normalizeAnalysisGradeOptions(data);
    if (
      !analysisActiveGradeId.value ||
      !analysisGradeOptions.value.some((item) => item.value === analysisActiveGradeId.value)
    ) {
      analysisActiveGradeId.value = analysisGradeOptions.value[0]?.value || "";
    }
    if (!analysisForm.selectedGradeIds.length && !analysisForm.selectedClassIds.length) {
      selectAllAnalysisGradeAndClass();
    } else {
      syncAnalysisSelectionWithOptions();
    }
  } catch (error: unknown) {
    ElMessage.error(
      error instanceof Error && error.message ? error.message : "加载年级班级失败"
    );
  } finally {
    analysisCascadeLoading.value = false;
  }
};

const toggleAnalysisTargetDropdown = () => {
  if (!analysisGradeOptions.value.length && !analysisCascadeLoading.value) {
    void loadAnalysisGradeOptions();
  }
  analysisTargetDropdownVisible.value = !analysisTargetDropdownVisible.value;
};

const closeAnalysisTargetDropdown = () => {
  analysisTargetDropdownVisible.value = false;
};

const toggleAnalysisAllGrade = () => {
  if (analysisIsAllSelected.value) {
    analysisForm.selectedGradeIds = [];
    analysisForm.selectedClassIds = [];
    return;
  }
  selectAllAnalysisGradeAndClass();
};

const toggleAnalysisGradeSelection = (grade: AnalysisGradeOption) => {
  const selectedSet = new Set(analysisForm.selectedGradeIds);
  const classSelectedSet = new Set(analysisForm.selectedClassIds);
  const classIds = grade.classes.map((item) => item.value);
  if (selectedSet.has(grade.value)) {
    selectedSet.delete(grade.value);
    classIds.forEach((item) => classSelectedSet.delete(item));
  } else {
    selectedSet.add(grade.value);
    classIds.forEach((item) => classSelectedSet.add(item));
  }
  analysisForm.selectedGradeIds = Array.from(selectedSet);
  analysisForm.selectedClassIds = Array.from(classSelectedSet);
};

const toggleAnalysisClassSelection = (grade: AnalysisGradeOption, classValue: string) => {
  const classSelectedSet = new Set(analysisForm.selectedClassIds);
  if (classSelectedSet.has(classValue)) {
    classSelectedSet.delete(classValue);
  } else {
    classSelectedSet.add(classValue);
  }
  const selectedSet = new Set(analysisForm.selectedGradeIds);
  const classIds = grade.classes.map((item) => item.value);
  const allClassChecked = classIds.length > 0 && classIds.every((item) => classSelectedSet.has(item));
  if (allClassChecked) {
    selectedSet.add(grade.value);
  } else {
    selectedSet.delete(grade.value);
  }
  analysisForm.selectedGradeIds = Array.from(selectedSet);
  analysisForm.selectedClassIds = Array.from(classSelectedSet);
};

const removeAnalysisTag = (tag: AnalysisSelectedTag) => {
  if (tag.type === "all") {
    analysisForm.selectedGradeIds = [];
    analysisForm.selectedClassIds = [];
    return;
  }
  if (tag.type === "grade") {
    const target = analysisGradeOptions.value.find((item) => item.value === tag.key);
    if (target) {
      toggleAnalysisGradeSelection(target);
    }
    return;
  }
  const targetGrade = analysisGradeOptions.value.find((item) =>
    item.classes.some((classItem) => classItem.value === tag.key)
  );
  if (targetGrade) {
    toggleAnalysisClassSelection(targetGrade, tag.key);
  }
};

const getAIAssistantLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = aiAssistantPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(
    (width) => width > 0
  );
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const syncAIAssistantLayoutWidth = () => {
  aiAssistantLayoutWidth.value = getAIAssistantLayoutWidth();
};

const aiAssistantShellWidth = computed(() => {
  if (aiAssistantLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(aiAssistantLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(aiAssistantLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--ai-assistant-shell-width": aiAssistantShellWidth.value,
}));

const isValidFieldValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  return text.length > 0 && text !== "null" && text !== "undefined";
};

const createLowerCaseMap = (source: Record<string, unknown>) => {
  const map = new Map<string, unknown>();
  Object.entries(source).forEach(([key, value]) => {
    map.set(key.toLowerCase(), value);
  });
  return map;
};

const pickByKeys = (map: Map<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = map.get(key.toLowerCase());
    if (isValidFieldValue(value)) {
      return value;
    }
  }
  return undefined;
};

const toCountText = (value: unknown) => {
  if (!isValidFieldValue(value)) return "--";
  return String(value).trim();
};

const escapeMarkdownHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderInlineMarkdown = (value: string) => {
  return value
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>");
};

const AI_PIPE_ROW_MARKER = "@@AI_PIPE_ROW@@";

const isNumericLikeValue = (value: string) =>
  /^[+-]?\d+(?:\.\d+)?(?:%|万|亿|万元|亿元)?$/.test(value);

const normalizePipeCellText = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/^[|]+|[|]+$/g, "")
    .trim();

const isLikelyRegionText = (value: string) => {
  if (value.length > 18) return false;
  return /(省|市|区|县|州|盟|自治区|自治州|地区)$/.test(value);
};

const formatPipeRowBlock = (indexText: string, rawBlock: string) => {
  const cells = rawBlock
    .split("|")
    .map((item) => normalizePipeCellText(item))
    .filter(Boolean);

  if (!cells.length) {
    return `\n\n## ${indexText}`;
  }

  const [title, secondary, ...restCells] = cells;
  const lines = [`## ${indexText}. ${title}`];

  if (secondary) {
    if (isNumericLikeValue(secondary)) {
      lines.push(`- 数值：${secondary}`);
    } else if (/^[^：:]{1,16}[：:]/.test(secondary)) {
      lines.push(`- ${secondary}`);
    } else {
      lines.push(`- 信息：${secondary}`);
    }
  }

  restCells.forEach((cell, cellIndex) => {
    if (!cell) return;
    if (/^[^：:]{1,20}[：:]/.test(cell)) {
      lines.push(`- ${cell}`);
      return;
    }

    if (cellIndex === 0 && isLikelyRegionText(cell)) {
      lines.push(`- 地区：${cell}`);
      return;
    }

    if (cell.length <= 20 && !/[，。；！？]/.test(cell)) {
      lines.push(`- 补充：${cell}`);
      return;
    }

    lines.push(`- 说明：${cell}`);
  });

  return `\n\n${lines.join("\n")}\n`;
};

const formatDensePipeRows = (value: string) => {
  const markedValue = value
    .replace(/\|{2,}\s*(\d+)\s*\|/g, `\n\n${AI_PIPE_ROW_MARKER}$1|`)
    .replace(/(^|\n)\s*(\d+)\s*\|(?=[^|\n]+\|[^|\n]+\|)/g, `$1${AI_PIPE_ROW_MARKER}$2|`);

  if (!markedValue.includes(AI_PIPE_ROW_MARKER)) {
    return value;
  }

  const rowPattern = new RegExp(`${AI_PIPE_ROW_MARKER}(\\d+)\\|`, "g");
  const blocks: Array<{ index: string; start: number; end: number }> = [];
  let matched = rowPattern.exec(markedValue);

  while (matched) {
    blocks.push({
      index: matched[1],
      start: matched.index,
      end: matched.index + matched[0].length,
    });
    matched = rowPattern.exec(markedValue);
  }

  if (!blocks.length) {
    return value;
  }

  let result = "";
  let cursor = 0;

  blocks.forEach((block, blockIndex) => {
    const nextBlockStart = blocks[blockIndex + 1]?.start ?? markedValue.length;
    result += markedValue.slice(cursor, block.start);
    result += formatPipeRowBlock(
      block.index,
      markedValue.slice(block.end, nextBlockStart)
    );
    cursor = nextBlockStart;
  });

  result += markedValue.slice(cursor);
  return result.replace(new RegExp(AI_PIPE_ROW_MARKER, "g"), "");
};

const CODE_BLOCK_LANGUAGE_ALIAS_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  yml: "yaml",
  csharp: "csharp",
};

const normalizeCodeBlockLanguage = (value: string) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return CODE_BLOCK_LANGUAGE_ALIAS_MAP[normalized] || normalized;
};

const isLikelyCodeBlockContent = (value: string) => {
  const text = String(value || "").trim();
  if (text.length < 24) {
    return false;
  }
  if (/[{};]/.test(text)) {
    return true;
  }
  return /(?:public\s+class|class\s+\w+|interface\s+\w+|enum\s+\w+|System\.out\.println|console\.log|function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|if\s*\(|for\s*\(|while\s*\(|return\s+|import\s+[\w{*]|package\s+[\w.]+|SELECT\s+.+\s+FROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|<\w+[^>]*>)/i.test(
    text
  );
};

const extractCodeBlockLanguageAndContent = (value: string) => {
  let code = String(value || "").trim();
  let language = "";

  const combinedLanguageMatch = code.match(
    /^(java|javascript|typescript|python|csharp|cpp|c|go|rust|sql|html|css|json|xml|bash|shell|sh|vue|jsx|tsx)(?=(?:package|import|public|class|interface|enum|function|const|let|var|if|for|while|return|System\.|console\.|SELECT|INSERT|UPDATE|DELETE|<))/i
  );
  if (combinedLanguageMatch?.[1]) {
    language = normalizeCodeBlockLanguage(combinedLanguageMatch[1]);
    code = code.slice(combinedLanguageMatch[1].length).trimStart();
    return { language, code };
  }

  const separatedLanguageMatch = code.match(
    /^(java|javascript|typescript|python|csharp|cpp|c|go|rust|sql|html|css|json|xml|bash|shell|sh|vue|jsx|tsx)\s+([\s\S]+)$/i
  );
  if (separatedLanguageMatch?.[1] && separatedLanguageMatch[2]) {
    const normalizedCode = separatedLanguageMatch[2].trim();
    if (isLikelyCodeBlockContent(normalizedCode)) {
      language = normalizeCodeBlockLanguage(separatedLanguageMatch[1]);
      code = normalizedCode;
    }
  }

  return { language, code };
};

const formatInlineCodeBlocks = (value: string) => {
  const lines = value.split("\n");
  const result: string[] = [];
  let inCodeFence = false;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("```")) {
      inCodeFence = !inCodeFence;
      result.push(line);
      return;
    }

    if (inCodeFence) {
      result.push(line);
      return;
    }

    const inlineCodeMatch = line.match(/^(.*?)`{1,2}([^`\n]+)`{1,2}(.*)$/);
    if (!inlineCodeMatch) {
      result.push(line);
      return;
    }

    const beforeText = inlineCodeMatch[1]?.trimEnd() || "";
    const afterText = inlineCodeMatch[3]?.trim() || "";
    const { language, code } = extractCodeBlockLanguageAndContent(inlineCodeMatch[2] || "");
    if (!isLikelyCodeBlockContent(code)) {
      result.push(line);
      return;
    }

    if (beforeText) {
      result.push(beforeText);
    }
    result.push(`\`\`\`${language}`);
    result.push(code);
    result.push("```");
    if (afterText) {
      result.push(afterText);
    }
  });

  return result.join("\n");
};

const normalizeMarkdownHeadingMarks = (value: string) =>
  String(value || "").replace(/＃/g, "#");

const normalizeMarkdownInvisibleChars = (value: string) =>
  String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "");

const normalizeMarkdownControlLines = (value: string) => {
  const lines = value.split("\n");
  let inCodeFence = false;

  return lines
    .map((rawLine) => {
      const sanitizedLine = normalizeMarkdownInvisibleChars(rawLine);
      const trimmedLine = sanitizedLine.trim();
      if (trimmedLine.startsWith("```")) {
        inCodeFence = !inCodeFence;
        return sanitizedLine;
      }

      if (inCodeFence) {
        return sanitizedLine;
      }

      const codeWrappedHeadingMatch = sanitizedLine.match(
        /^(\s*)`([#＃]{1,6})`\s*(.+?)\s*$/u
      );
      if (codeWrappedHeadingMatch?.[2] && codeWrappedHeadingMatch[3]?.trim()) {
        return `${codeWrappedHeadingMatch[1]}${normalizeMarkdownHeadingMarks(
          codeWrappedHeadingMatch[2]
        )} ${codeWrappedHeadingMatch[3].trim()}`;
      }

      const headingMatch = sanitizedLine.match(
        /^(\s*)[`"'“”‘’]*\s*([#＃]{1,6})\s*(.+?)\s*[`"'“”‘’]*\s*$/u
      );
      if (headingMatch?.[2] && headingMatch[3]?.trim()) {
        return `${headingMatch[1]}${normalizeMarkdownHeadingMarks(
          headingMatch[2]
        )} ${headingMatch[3].trim()}`;
      }

      const dividerMatch = sanitizedLine.match(
        /^(\s*)[`"'“”‘’]*\s*((?:-{3,}|\*{3,}|_{3,}))\s*[`"'“”‘’]*\s*$/u
      );
      if (dividerMatch?.[2]) {
        return `${dividerMatch[1]}${dividerMatch[2]}`;
      }

      return sanitizedLine;
    })
    .join("\n");
};

const formatMarkdownSource = (value: string) => {
  const codeBlocks: string[] = [];
  const protectedValue = value.replace(/```[\s\S]*?```/g, (block) => {
    const marker = `@@AI_CODE_BLOCK_${codeBlocks.length}@@`;
    codeBlocks.push(block);
    return marker;
  });
  const normalizedValue = formatDensePipeRows(
    normalizeMarkdownControlLines(protectedValue.replace(/\r\n/g, "\n"))
  );

  const formattedValue = formatInlineCodeBlocks(
    normalizedValue
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\s*([#＃]{1,6})(?=\S)/g, "$1\n\n$2")
    .replace(/(^|\n)([#＃]{1,6})(\S)/g, "$1$2 $3")
    .replace(/([：:。；;）)])\s*(\d+\.\s+)/g, "$1\n$2")
    .replace(/([^\n])\s*(\d+\.\s+\*\*[^*]+\*\*:)/g, "$1\n$2")
    .replace(/([^\n])\s*([○•·])\s+/g, "$1\n- ")
    .replace(/([^\n])\s*(-\s*经济特点：)/g, "$1\n$2")
    .replace(/[ \t]*\|[ \t]*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
  );

  return formattedValue.replace(/@@AI_CODE_BLOCK_(\d+)@@/g, (_match, indexText) => {
    const index = Number(indexText);
    return codeBlocks[index] || "";
  });
};

const normalizeRenderedMarkdownHtml = (value: string) => {
  return value
    .replace(
      /<(p|div)>(?:\s|&nbsp;)*(?:<code>)?([#＃]{1,6})(?:<\/code>)?(?:\s|&nbsp;)*([\s\S]*?)<\/\1>/g,
      (_match, tagName: string, headingMarks: string, headingContent: string) => {
        const normalizedMarks = normalizeMarkdownHeadingMarks(headingMarks);
        const level = Math.min(String(normalizedMarks || "").length || 1, 6);
        const content = String(headingContent || "").trim();
        if (!content) {
          return _match;
        }
        return `<h${level}>${content}</h${level}>`;
      }
    )
    .replace(
      /<p>(?:<code>)?([#＃]{1,6})(?:<\/code>)?\s*([\s\S]*?)<\/p>/g,
      (_match, headingMarks: string, headingContent: string) => {
        const normalizedMarks = normalizeMarkdownHeadingMarks(headingMarks);
        const level = Math.min(String(normalizedMarks || "").length || 1, 6);
        const content = String(headingContent || "").trim();
        if (!content) {
          return _match;
        }
        return `<h${level}>${content}</h${level}>`;
      }
    )
    .replace(
      /<p>(?:<code>)?((?:-{3,}|\*{3,}|_{3,}))(?:<\/code>)?\s*<\/p>/g,
      '<hr class="ai-chat-message__divider" />'
    );
};

const renderMarkdown = (value: string) => {
  const source = formatMarkdownSource(String(value || ""));
  if (!source.trim()) {
    return "";
  }

  const lines = source.split("\n");
  const htmlParts: string[] = [];
  let listBuffer: string[] = [];
  let listTag: "ul" | "ol" | "" = "";
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLanguage = "";

  const flushList = () => {
    if (!listBuffer.length) return;
    htmlParts.push(
      `<${listTag}>${listBuffer
        .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
        .join("")}</${listTag}>`
    );
    listBuffer = [];
    listTag = "";
  };

  const flushCodeBlock = () => {
    const languageText = codeBlockLanguage ? escapeMarkdownHtml(codeBlockLanguage) : "";
    const codeText = escapeMarkdownHtml(codeBlockLines.join("\n"));
    htmlParts.push(
      `<div class="ai-chat-message__code-block-wrap"><div class="ai-chat-message__code-block-head">${
        languageText
          ? `<span class="ai-chat-message__code-language">${languageText}</span>`
          : `<span class="ai-chat-message__code-language is-empty"></span>`
      }<button type="button" class="ai-chat-message__code-copy">复制代码</button></div><pre class="ai-chat-message__code-block"><code>${codeText}</code></pre></div>`
    );
    codeBlockLines = [];
    codeBlockLanguage = "";
  };

  lines.forEach((rawLine) => {
    const trimmedRaw = rawLine.trim();
    if (trimmedRaw.startsWith("```")) {
      flushList();
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        codeBlockLanguage = normalizeCodeBlockLanguage(trimmedRaw.slice(3).trim().split(/\s+/)[0] || "");
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      return;
    }

    const line = escapeMarkdownHtml(rawLine.trimEnd());
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (listMatch) {
      const listContent = listMatch[1];
      if (!listContent) {
        return;
      }
      if (listTag && listTag !== "ul") {
        flushList();
      }
      listTag = "ul";
      listBuffer.push(listContent);
      return;
    }

    const orderedListMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (orderedListMatch) {
      const orderedListContent = orderedListMatch[1];
      if (!orderedListContent) {
        return;
      }
      if (listTag && listTag !== "ol") {
        flushList();
      }
      listTag = "ol";
      listBuffer.push(orderedListContent);
      return;
    }

    flushList();

    const horizontalRuleMatch = trimmed.match(/^(?:-{3,}|\*{3,}|_{3,})$/);
    if (horizontalRuleMatch) {
      htmlParts.push('<hr class="ai-chat-message__divider" />');
      return;
    }

    const headingMatch = trimmed.match(/^([#＃]{1,6})\s*(.+)$/);
    if (headingMatch) {
      const headingLevel = normalizeMarkdownHeadingMarks(headingMatch[1]);
      const headingContent = headingMatch[2];
      if (!headingLevel || !headingContent) {
        return;
      }
      const level = Math.min(headingLevel.length, 6);
      htmlParts.push(`<h${level}>${renderInlineMarkdown(headingContent)}</h${level}>`);
      return;
    }

    const quoteMatch = trimmed.match(/^&gt;\s+(.+)/);
    if (quoteMatch) {
      const quoteContent = quoteMatch[1];
      if (!quoteContent) {
        return;
      }
      htmlParts.push(`<blockquote>${renderInlineMarkdown(quoteContent)}</blockquote>`);
      return;
    }

    htmlParts.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  });

  flushList();
  if (inCodeBlock) {
    flushCodeBlock();
  }
  return normalizeRenderedMarkdownHtml(htmlParts.join(""));
};

const getFormattedChatCopyText = (content: string) =>
  formatMarkdownSource(String(content || "")).trim();

const getFormattedChatCopyHtml = (content: string) => {
  const html = renderMarkdown(content);
  return html ? `<div>${html}</div>` : "";
};

const normalizeHotAiQuestionList = (rows: unknown): string[] => {
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return list
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }
      if (!item || typeof item !== "object") {
        return "";
      }
      const rowMap = createLowerCaseMap(item as Record<string, unknown>);
      return String(
        pickByKeys(rowMap, [
          "title",
          "sessionTitle",
          "hotTitle",
          "question",
          "content",
          "name",
        ]) || ""
      ).trim();
    })
    .filter(Boolean)
    .slice(0, 8);
};

const unwrapAiRows = (rows: unknown): unknown[] => {
  if (Array.isArray(rows)) {
    return rows;
  }
  if (!rows || typeof rows !== "object") {
    return [];
  }

  const record = rows as Record<string, unknown>;
  const directKeys = ["rows", "list", "items", "records", "messages", "data"];

  for (const key of directKeys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  for (const key of directKeys) {
    const nestedValue = record[key];
    if (nestedValue && typeof nestedValue === "object") {
      const nestedRows = unwrapAiRows(nestedValue);
      if (nestedRows.length) {
        return nestedRows;
      }
    }
  }

  return [record];
};

const formatHistoryDate = (value: unknown) => {
  if (!isValidFieldValue(value)) return "--";
  const text = String(value).trim();
  const matched = text.match(/(\d{1,2})[-/月](\d{1,2})/);
  if (matched) {
    return `${matched[1].padStart(2, "0")}月${matched[2].padStart(2, "0")}日`;
  }

  const date = new Date(text);
  if (!Number.isNaN(date.getTime())) {
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${month}月${day}日`;
  }

  return text;
};

const resolveAiSessionTypeLabel = (value: unknown) => {
  const text = String(value ?? "").trim();
  if (!text) return "AI会话";
  return AI_SESSION_TYPE_LABEL_MAP[text] || text;
};

const normalizeAiSessionList = (rows: unknown): HistoryRecord[] => {
  return unwrapAiRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const rowMap = createLowerCaseMap(item);
      const historyId = String(
        pickByKeys(rowMap, ["id", "sessionRecordId", "recordId"]) || ""
      ).trim();
      const sessionId = String(
        pickByKeys(rowMap, ["sessionId", "session_id", "conversationId"]) ||
          historyId ||
          createAiChatMessageId()
      ).trim();
      const sessionTypeValue = pickByKeys(rowMap, ["sessionType", "type"]);
      const content =
        String(
          pickByKeys(rowMap, [
            "sessionTitle",
            "title",
            "question",
            "content",
            "message",
            "name",
          ]) || ""
        ).trim() || "未命名会话";

      return {
        id: historyId || sessionId,
        sessionId,
        sessionType: String(sessionTypeValue ?? "").trim(),
        type: resolveAiSessionTypeLabel(sessionTypeValue),
        content,
        date: formatHistoryDate(
          pickByKeys(rowMap, [
            "updateTime",
            "updatedAt",
            "createTime",
            "createdAt",
            "time",
          ])
        ),
      };
    })
    .filter((item) => item.sessionId);
};

const normalizeAiImageHistoryList = (rows: unknown): HistoryRecord[] => {
  return unwrapAiRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const rowMap = createLowerCaseMap(item);
      const sessionId = String(
        pickByKeys(rowMap, [
          "sessionId",
          "session_id",
          "conversationId",
          "conversation_id",
          "id",
          "imageId",
          "image_id",
          "recordId",
          "record_id",
        ]) || ""
      ).trim();
      const content =
        String(
          pickByKeys(rowMap, [
            "prompt",
            "sessionTitle",
            "title",
            "question",
            "content",
            "message",
            "name",
          ]) || ""
        ).trim() || "未命名生图记录";

      return {
        id: sessionId,
        sessionId,
        sessionType: "7",
        type: "AI智能生图",
        content,
        date: formatHistoryDate(
          pickByKeys(rowMap, [
            "updateTime",
            "updatedAt",
            "createTime",
            "createdAt",
            "time",
          ])
        ),
      };
    })
    .filter((item) => item.sessionId);
};

const normalizeAiImagePreviewList = (rows: unknown): ImageHistoryPreviewItem[] => {
  return unwrapAiRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const rowMap = createLowerCaseMap(item);
      const recordId = String(
        pickByKeys(rowMap, ["recordId", "record_id", "id", "sessionRecordId"]) || ""
      ).trim();
      const sessionId = String(
        pickByKeys(rowMap, ["sessionId", "session_id", "conversationId", "conversation_id"]) || ""
      ).trim();
      const messageId = String(
        pickByKeys(rowMap, ["messageId", "message_id", "id"]) || ""
      ).trim();
      const imageUrl = extractAiImageUrls(item)[0] || "";
      const content =
        String(
          pickByKeys(rowMap, [
            "title",
            "prompt",
            "sessionTitle",
            "question",
            "content",
            "message",
            "name",
          ]) || ""
        ).trim() || "未命名生图记录";

      return {
        id: recordId || sessionId || messageId,
        recordId,
        sessionId,
        messageId,
        content,
        date: formatHistoryDate(
          pickByKeys(rowMap, [
            "updateTime",
            "updatedAt",
            "createTime",
            "createdAt",
            "time",
          ])
        ),
        imageUrl,
      };
    })
    .filter((item) => item.sessionId);
};

const resolveAiSessionMessageRole = (value: unknown, index: number): AiChatRole => {
  if (value === 1 || value === "1") return "user";
  if (value === 2 || value === "2") return "assistant";

  const text = String(value ?? "")
    .trim()
    .toLowerCase();

  if (
    text.includes("assistant") ||
    text.includes("bot") ||
    text.includes("model") ||
    text.includes("ai")
  ) {
    return "assistant";
  }

  if (text.includes("user") || text.includes("human") || text.includes("teacher")) {
    return "user";
  }

  return index % 2 === 0 ? "user" : "assistant";
};

const normalizeAiSessionMessages = (rows: unknown): AiChatMessage[] => {
  return unwrapAiRows(rows)
    .map((item, index) => {
      if (typeof item === "string") {
        const content = item.trim();
        if (!content) return null;
        return {
          id: createAiChatMessageId(),
          role: resolveAiSessionMessageRole("", index),
          content,
          file: null,
        } as AiChatMessage;
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const rowMap = createLowerCaseMap(item as Record<string, unknown>);
      const content = extractAiChatText(
        pickByKeys(rowMap, [
          "content",
          "message",
          "question",
          "answer",
          "reply",
          "text",
          "result",
          "outputText",
        ]) ?? item
      ).trim();

      if (!content) {
        return null;
      }

      return {
        id: String(
          pickByKeys(rowMap, ["messageId", "id", "chatId"]) || createAiChatMessageId()
        ),
        role: resolveAiSessionMessageRole(
          pickByKeys(rowMap, [
            "role",
            "messageRole",
            "senderRole",
            "speaker",
            "senderType",
            "type",
          ]),
          index
        ),
        content,
        file: null,
      } as AiChatMessage;
    })
    .filter((item): item is AiChatMessage => !!item);
};

const normalizeExistingCourseOptions = (rows: unknown): ExistingCourseOption[] => {
  const seen = new Set<string>();
  const result: ExistingCourseOption[] = [];

  unwrapAiRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .forEach((item) => {
      const rowMap = createLowerCaseMap(item);
      const courseId = String(
        pickByKeys(rowMap, ["courseId", "id", "cursorId", "resourceId"]) || ""
      ).trim();
      const courseName = String(
        pickByKeys(rowMap, ["courseName", "name", "title", "label"]) || ""
      ).trim();
      const chapters = normalizeExistingChapterOptions(
        pickByKeys(rowMap, ["chapterList", "chapters", "chapter_list"])
      );
      if (!courseId || !courseName || seen.has(courseId)) return;
      seen.add(courseId);
      result.push({ courseId, courseName, chapters });
    });

  return result;
};

const normalizeExistingChapterOptions = (rows: unknown): ExistingChapterOption[] => {
  const seen = new Set<string>();
  const result: ExistingChapterOption[] = [];

  unwrapAiRows(rows)
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .forEach((item) => {
      const rowMap = createLowerCaseMap(item);
      const chapterId = String(
        pickByKeys(rowMap, ["chapterId", "id", "resourceId"]) || ""
      ).trim();
      const chapterName = String(
        pickByKeys(rowMap, ["chapterName", "name", "title", "label"]) || ""
      ).trim();
      if (!chapterId || !chapterName || seen.has(chapterId)) return;
      seen.add(chapterId);
      result.push({ chapterId, chapterName });
    });

  return result;
};

const fetchExistingCourseChapters = async (courseId: string) => {
  if (!courseId) return [] as ExistingChapterOption[];
  const cached = existingChapterCacheMap.value[courseId];
  if (cached && cached.length) {
    return cached;
  }

  const rows = await getChapterList({
    courseId: courseId as unknown as number,
  });
  const normalized = normalizeExistingChapterOptions(rows);
  existingChapterCacheMap.value = {
    ...existingChapterCacheMap.value,
    [courseId]: normalized,
  };
  existingCourseOptions.value = existingCourseOptions.value.map((item) =>
    item.courseId === courseId ? { ...item, chapters: normalized } : item
  );
  return normalized;
};

const applyExistingCourseChapters = async (courseId: string, autoSelectFirst = false) => {
  if (!courseId) {
    existingChapterOptions.value = [];
    selectedExistingChapterId.value = "";
    return;
  }

  const course = existingCourseOptions.value.find((item) => item.courseId === courseId);
  let chapters = course?.chapters || [];

  if (!chapters.length) {
    existingChapterLoading.value = true;
    try {
      chapters = await fetchExistingCourseChapters(courseId);
    } catch (error: unknown) {
      chapters = [];
      if (showExistingLessonCourseDialog.value && selectedExistingCourseId.value === courseId) {
        ElMessage.error(
          error instanceof Error && error.message ? error.message : "章节加载失败"
        );
      }
    } finally {
      if (selectedExistingCourseId.value === courseId) {
        existingChapterLoading.value = false;
      }
    }
  } else {
    existingChapterLoading.value = false;
  }

  if (selectedExistingCourseId.value !== courseId) {
    return;
  }

  existingChapterOptions.value = chapters;
  if (autoSelectFirst) {
    selectedExistingChapterId.value = existingChapterOptions.value[0]?.chapterId || "";
    return;
  }
  if (
    selectedExistingChapterId.value &&
    !existingChapterOptions.value.some(
      (item) => item.chapterId === selectedExistingChapterId.value
    )
  ) {
    selectedExistingChapterId.value = "";
  }
};

const isLessonPlanHistoryRecord = (item: HistoryRecord) => {
  const sessionType = String(item.sessionType || "").trim();
  return (
    sessionType === "2" ||
    sessionType === "3" ||
    sessionType === "4" ||
    item.type === "生成教案" ||
    item.type === "生成课件PPT" ||
    item.type === "生成习题"
  );
};

const resolveLessonPlanSessionTypeByHistory = (item: HistoryRecord): 2 | 3 | 4 => {
  const sessionType = String(item.sessionType || "").trim();
  if (sessionType === "4" || item.type === "生成习题") {
    return 4;
  }
  if (sessionType === "3" || item.type === "生成课件PPT") {
    return 3;
  }
  return 2;
};

const isImageHistoryRecord = (item: HistoryRecord) => {
  const sessionType = String(item.sessionType || "").trim();
  return sessionType === "7" || item.type === "智能生图" || item.type === "AI智能生图";
};

const resolveChatSessionTypeByHistory = (item: HistoryRecord): 1 | 5 | 6 | 7 => {
  const sessionType = String(item.sessionType || "").trim();
  if (sessionType === "5" || item.type === "代码编程助手") {
    return 5;
  }
  if (sessionType === "6" || item.type === "AI学情分析") {
    return 6;
  }
  if (isImageHistoryRecord(item)) {
    return 7;
  }
  return 1;
};

const parseLessonPlanFormFromSessionRows = (rows: unknown) => {
  const records = unwrapAiRows(rows).filter(
    (item): item is Record<string, unknown> => !!item && typeof item === "object"
  );
  if (!records.length) return null;

  const parseUnitType = (value: unknown) => {
    const text = String(value || "").trim();
    if (!text) return "";
    if (text === "unit" || text.includes("单元")) return "unit";
    if (text === "single" || text.includes("单一")) return "single";
    return "";
  };
  const parseQuestionKind = (value: unknown) => {
    const text = String(value || "").trim().toLowerCase();
    if (!text) return "scene" as const;
    if (text === "knowledge" || text.includes("知识")) return "knowledge" as const;
    return "scene" as const;
  };
  const parseQuestionCount = (value: unknown) => {
    const numericValue = Number(value || 0);
    if (!Number.isFinite(numericValue) || numericValue < 0) return "0";
    return String(Math.floor(numericValue));
  };

  const parseStandardList = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item || "").trim()).filter(Boolean);
    }
    const text = String(value || "").trim();
    if (!text) return [] as string[];
    return text
      .split(/[\n,，;；、]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  for (const row of records) {
    const rowMap = createLowerCaseMap(row);
    const formDataRaw = pickByKeys(rowMap, ["formData", "form_data"]);
    if (!formDataRaw) continue;

    try {
      const formData =
        typeof formDataRaw === "string"
          ? (JSON.parse(formDataRaw) as Record<string, unknown>)
          : typeof formDataRaw === "object"
            ? (formDataRaw as Record<string, unknown>)
            : null;
      if (!formData) continue;

      const parsedUnitType = parseUnitType(formData.unitType);
      const parsedStandard = parseStandardList(formData.standard);
      const parsedQuestionCounts =
        formData.questionCounts && typeof formData.questionCounts === "object"
          ? (formData.questionCounts as Record<string, unknown>)
          : null;
      const parsedQuestionTypes =
        formData.questionTypes && typeof formData.questionTypes === "object"
          ? (formData.questionTypes as Record<string, unknown>)
          : null;

      return {
        grade: String(formData.grade || "").trim(),
        unitType: (parsedUnitType || lessonPlanForm.unitType) as "single" | "unit",
        questionKind: parseQuestionKind(
          formData.questionCategory || formData.questionKind || formData.kind || formData.exerciseType
        ),
        singleCount: parseQuestionCount(
          formData.singleCount ||
            parsedQuestionTypes?.singleChoice ||
            parsedQuestionCounts?.single ||
            parsedQuestionCounts?.singleCount
        ),
        multipleCount: parseQuestionCount(
          formData.multipleCount ||
            parsedQuestionTypes?.multipleChoice ||
            parsedQuestionCounts?.multiple ||
            parsedQuestionCounts?.multipleCount
        ),
        judgeCount: parseQuestionCount(
          formData.judgeCount ||
            parsedQuestionTypes?.trueOrFalse ||
            parsedQuestionCounts?.judge ||
            parsedQuestionCounts?.judgeCount
        ),
        blankCount: parseQuestionCount(
          formData.blankCount ||
            parsedQuestionTypes?.fillInBlank ||
            parsedQuestionCounts?.blank ||
            parsedQuestionCounts?.blankCount
        ),
        connectCount: parseQuestionCount(
          formData.connectCount ||
            parsedQuestionTypes?.matching ||
            parsedQuestionCounts?.connect ||
            parsedQuestionCounts?.connectCount
        ),
        periodCount: String(formData.periodCount || "").trim(),
        subject: String(formData.topic || formData.subject || "").trim(),
        scenario: String(formData.situation || formData.scenario || "").trim(),
        teachTool: String(formData.tool || formData.teachTool || "").trim(),
        hardware: String(formData.hardware || "").trim(),
        specialRequirement: String(formData.special || formData.specialRequirement || "").trim(),
        standard: parsedStandard,
      };
    } catch {
      // 历史里 formData 非 JSON 时跳过，保持原值
    }
  }

  return null;
};

const parseAnalysisFormFromSessionRows = (rows: unknown) => {
  const records = unwrapAiRows(rows).filter(
    (item): item is Record<string, unknown> => !!item && typeof item === "object"
  );
  if (!records.length) return null;

  for (const row of records) {
    const rowMap = createLowerCaseMap(row);
    const formDataRaw = pickByKeys(rowMap, ["formData", "form_data"]);
    const messageText = String(pickByKeys(rowMap, ["message", "content"]) || "").trim();
    const fallbackRequirementText = messageText === "生成学情分析报告" ? "" : messageText;
    if (!formDataRaw) continue;

    try {
      const formData =
        typeof formDataRaw === "string"
          ? (JSON.parse(formDataRaw) as Record<string, unknown>)
          : typeof formDataRaw === "object"
            ? (formDataRaw as Record<string, unknown>)
            : null;
      if (!formData) continue;

      const rangeFromArray = Array.isArray(formData.dateRange)
        ? formData.dateRange.map((item) => String(item || "").trim())
        : [];
      const startDate = String(
        formData.startDate || formData.beginDate || rangeFromArray[0] || ""
      ).trim();
      const endDate = String(
        formData.endDate || formData.finishDate || rangeFromArray[1] || ""
      ).trim();

      const classIds = Array.isArray(formData.classIds)
        ? formData.classIds.map((item) => String(item || "").trim()).filter(Boolean)
        : [];
      const gradeIds = Array.isArray(formData.gradeIds)
        ? formData.gradeIds.map((item) => String(item || "").trim()).filter(Boolean)
        : [];

      return {
        dateRange: [startDate, endDate] as [string, string],
        specialRequirement: String(
          formData.special ||
            formData.specialRequirement ||
            formData.requirement ||
            fallbackRequirementText
        ).trim(),
        selectedClassIds: classIds,
        selectedGradeIds: gradeIds,
      };
    } catch {
      // 历史里 formData 非 JSON 时跳过，保持原值
    }
  }

  return null;
};

const parseCodeAssistantFormFromSessionRows = (rows: unknown) => {
  const records = unwrapAiRows(rows).filter(
    (item): item is Record<string, unknown> => !!item && typeof item === "object"
  );
  if (!records.length) return null;

  let latestUserText = "";

  for (let index = 0; index < records.length; index += 1) {
    const row = records[index];
    const rowMap = createLowerCaseMap(row);
    const role = resolveAiSessionMessageRole(
      pickByKeys(rowMap, ["role", "messageRole", "senderRole", "speaker", "senderType", "type"]),
      index
    );
    const messageText = extractAiChatText(
      pickByKeys(rowMap, [
        "content",
        "message",
        "question",
        "answer",
        "reply",
        "text",
        "result",
        "outputText",
      ]) ?? row
    ).trim();
    if (role === "user" && messageText) {
      latestUserText = messageText;
    }

    const formDataRaw = pickByKeys(rowMap, ["formData", "form_data"]);
    if (!formDataRaw) continue;

    try {
      const formData =
        typeof formDataRaw === "string"
          ? (JSON.parse(formDataRaw) as Record<string, unknown>)
          : typeof formDataRaw === "object"
            ? (formDataRaw as Record<string, unknown>)
            : null;
      if (!formData) continue;

      const parsedMode = String(formData.mode || "").trim().toLowerCase();
      const mode: CodeAssistantMode =
        parsedMode === "explain" || parsedMode === "debug" ? parsedMode : "generate";
      const language = String(formData.language || "").trim();

      return {
        mode,
        language: CODE_ASSISTANT_LANGUAGE_OPTIONS.some((item) => item.value === language) ? language : "",
        requirement:
          mode === "generate"
            ? String(formData.requirement || "").trim()
            : mode === "debug"
              ? [String(formData.code || "").trim(), `报错：${String(formData.error || "").trim()}`]
                  .filter(Boolean)
                  .join("\n")
              : String(formData.code || "").trim(),
        code: String(formData.code || "").trim(),
        error: String(formData.error || "").trim(),
      };
    } catch {
      // 历史里 formData 非 JSON 时跳过，保持原值
    }
  }

  if (!latestUserText) return null;
  return {
    mode: "generate" as CodeAssistantMode,
    language: "",
    requirement: latestUserText,
    code: "",
    error: "",
  };
};

const parseImageFormFromSessionRows = (rows: unknown) => {
  const normalizeImageSizeValue = (value: unknown) => {
    const text = String(value || "").trim();
    if (!text) return "";
    return text.replace(/^["']+|["']+$/g, "").trim();
  };

  const applyImageFormData = (
    formDataRaw: unknown,
    current: { size: string; referenceImageUrl: string }
  ) => {
    if (!formDataRaw) return current;

    try {
      let formData: unknown = formDataRaw;
      if (typeof formData === "string") {
        formData = JSON.parse(formData);
      }
      if (typeof formData === "string") {
        // 兼容后端返回双重序列化字符串
        formData = JSON.parse(formData);
      }
      if (!formData || typeof formData !== "object") {
        return current;
      }

      const formDataRecord = formData as Record<string, unknown>;
      const parsedSize = normalizeImageSizeValue(formDataRecord.size);
      const parsedReferenceImageUrl = String(
        formDataRecord.referenceImageUrl ||
          formDataRecord.reference_image_url ||
          formDataRecord.imageUrl ||
          ""
      ).trim();

      return {
        size: parsedSize || current.size,
        referenceImageUrl: parsedReferenceImageUrl || current.referenceImageUrl,
      };
    } catch {
      // formData 非 JSON 时忽略
      return current;
    }
  };

  const records = unwrapAiRows(rows).filter(
    (item): item is Record<string, unknown> => !!item && typeof item === "object"
  );

  let prompt = "";
  let size = "1:1";
  let referenceImageUrl = "";
  let text = "";
  const urls: string[] = [];

  // 先解析会话对象层的 formData（接口常把 size 放在这一层）
  if (rows && typeof rows === "object" && !Array.isArray(rows)) {
    const rootMap = createLowerCaseMap(rows as Record<string, unknown>);
    const rootFormDataRaw = pickByKeys(rootMap, ["formData", "form_data"]);
    const rootApplied = applyImageFormData(rootFormDataRaw, { size, referenceImageUrl });
    size = rootApplied.size;
    referenceImageUrl = rootApplied.referenceImageUrl;

    const dataNode = (rows as Record<string, unknown>).data;
    if (dataNode && typeof dataNode === "object" && !Array.isArray(dataNode)) {
      const dataMap = createLowerCaseMap(dataNode as Record<string, unknown>);
      const dataFormDataRaw = pickByKeys(dataMap, ["formData", "form_data"]);
      const dataApplied = applyImageFormData(dataFormDataRaw, { size, referenceImageUrl });
      size = dataApplied.size;
      referenceImageUrl = dataApplied.referenceImageUrl;
    }
  }

  records.forEach((row, index) => {
    const rowMap = createLowerCaseMap(row);
    const role = resolveAiSessionMessageRole(
      pickByKeys(rowMap, ["role", "messageRole", "senderRole", "speaker", "senderType", "type"]),
      index
    );
    const messageText = extractAiChatText(
      pickByKeys(rowMap, [
        "content",
        "message",
        "question",
        "answer",
        "reply",
        "text",
        "result",
        "outputText",
      ]) ?? row
    ).trim();
    if (role === "user" && messageText) {
      prompt = messageText;
    }
    if (role === "assistant" && messageText) {
      text = messageText;
    }

    const formDataRaw = pickByKeys(rowMap, ["formData", "form_data"]);
    if (formDataRaw) {
      const applied = applyImageFormData(formDataRaw, { size, referenceImageUrl });
      size = applied.size;
      referenceImageUrl = applied.referenceImageUrl;
    }

    if (!referenceImageUrl) {
      const fileRefs = pickByKeys(rowMap, ["fileRefs", "file_refs"]);
      if (Array.isArray(fileRefs)) {
        const matchedRef = fileRefs.find(
          (item) =>
            item &&
            typeof item === "object" &&
            /image/i.test(
              String((item as Record<string, unknown>).fileType || (item as Record<string, unknown>).type || "")
            )
        ) as Record<string, unknown> | undefined;
        if (matchedRef) {
          referenceImageUrl = String(
            matchedRef.fileId || matchedRef.fileUrl || matchedRef.url || ""
          ).trim();
        }
      }
    }

    const rowUrls = extractAiImageUrls(row);
    if (rowUrls.length) {
      urls.push(...rowUrls);
    }
  });

  return {
    prompt,
    size: IMAGE_SIZE_OPTIONS.some((item) => item.value === size) ? size : "1:1",
    referenceImageUrl,
    urls: Array.from(new Set(urls)),
    text,
  };
};

const createAiChatMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const updateChatListScrollMetrics = () => {
  const target = aiChatListRef.value;
  if (!target) {
    chatListScrollTop.value = 0;
    chatListScrollHeight.value = 0;
    chatListClientHeight.value = 0;
    return;
  }

  chatListScrollTop.value = target.scrollTop;
  chatListScrollHeight.value = target.scrollHeight;
  chatListClientHeight.value = target.clientHeight;
};

const handleChatListScroll = () => {
  updateChatListScrollMetrics();
};

const scrollChatToTop = () => {
  const target = aiChatListRef.value;
  if (!target) return;
  target.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  window.setTimeout(() => {
    updateChatListScrollMetrics();
  }, 260);
};

const handleChatScrollAction = () => {
  if (chatScrollActionKind.value === "down") {
    scrollChatToBottom();
    return;
  }
  if (chatScrollActionKind.value === "up") {
    scrollChatToTop();
  }
};

const scrollChatToBottom = () => {
  nextTick(() => {
    const target = aiChatListRef.value;
    if (!target) return;
    target.scrollTo({
      top: target.scrollHeight,
      behavior: "smooth",
    });
    window.setTimeout(() => {
      updateChatListScrollMetrics();
    }, 260);
  });
};

const toggleDeepThinking = () => {
  enableDeepThinking.value = !enableDeepThinking.value;
};

const handleSearchKeydown = async (event: KeyboardEvent) => {
  if (event.key !== "Enter" || event.shiftKey) {
    return;
  }

  event.preventDefault();
  if (!canSubmitChat.value) {
    return;
  }

  await handleSearch();
};

const handleCodeAssistantKeydown = async (event: KeyboardEvent) => {
  if (event.key !== "Enter" || event.shiftKey) {
    return;
  }

  event.preventDefault();
  if (!canSubmitCodeAssistant.value) {
    return;
  }

  await handleCodeAssistantSubmit();
};

const getAiUploadExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
};

const isAiImageFile = (fileName: string) =>
  AI_UPLOAD_IMAGE_EXTENSIONS.includes(getAiUploadExtension(fileName));

const resolveAiUploadIcon = (fileName: string) =>
  isAiImageFile(fileName) ? "image" : "description";

const revokeBlobPreviewUrl = (url: unknown) => {
  if (typeof window === "undefined") return;
  const previewUrl = String(url || "").trim();
  if (previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
};

const resolveAiUploadPreviewUrl = (file: AiUploadFile | null) => {
  if (!file) return "";
  const previewUrl = String(file.previewUrl || "").trim();
  if (previewUrl) return previewUrl;
  return String(file.url || "").trim();
};

const buildImageReferenceUploadFile = (url: string): AiUploadFile | null => {
  const normalizedUrl = String(url || "").trim();
  if (!normalizedUrl) return null;

  const sanitizedUrl = normalizedUrl.split("?")[0] || normalizedUrl;
  const fileName = sanitizedUrl.split("/").pop() || "参考图";

  return {
    name: fileName,
    ossId: "",
    url: normalizedUrl,
    previewUrl: normalizedUrl,
    fileType: "image",
  };
};

const formatAiUploadFileName = (fileName: string, maxLength = 28) => {
  if (fileName.length <= maxLength) return fileName;
  const extension = getAiUploadExtension(fileName);
  const baseName = extension ? fileName.slice(0, -extension.length) : fileName;
  const safeBaseLength = Math.max(8, maxLength - extension.length - 1);
  return `${baseName.slice(0, safeBaseLength)}...${extension}`;
};

const formatAiUploadFileSize = (size?: number) => {
  if (!size || size <= 0) return "--";
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`;
  return `${(size / 1024 / 1024).toFixed(2)}MB`;
};

const validateAiUploadFile = (file: File) => {
  const extension = getAiUploadExtension(file.name);
  const fileSizeMb = file.size / 1024 / 1024;

  if (AI_UPLOAD_IMAGE_EXTENSIONS.includes(extension)) {
    if (fileSizeMb > 15) {
      return "文件大小不能超过15MB";
    }
    return "";
  }

  if (AI_UPLOAD_VIDEO_EXTENSIONS.includes(extension)) {
    if (fileSizeMb > 15) {
      return "文件大小不能超过15MB";
    }
    return "";
  }

  if (AI_UPLOAD_PDF_EXTENSIONS.includes(extension)) {
    if (fileSizeMb > 15) {
      return "文件大小不能超过15MB";
    }
    return "";
  }

  return "当前仅支持图片、视频（mp4、avi、mov）和PDF格式";
};

const extractAiUploadFileId = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  return String(
    record.fileId ||
      record.file_id ||
      record.id ||
      (record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>).fileId ||
          (record.data as Record<string, unknown>).file_id ||
          (record.data as Record<string, unknown>).id
        : "") ||
      ""
  ).trim();
};

const extractAiUploadFileStatus = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  return String(
    record.fileStatus ||
      record.file_status ||
      record.status ||
      record.state ||
      (record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>).fileStatus ||
          (record.data as Record<string, unknown>).file_status ||
          (record.data as Record<string, unknown>).status ||
          (record.data as Record<string, unknown>).state
        : "") ||
      ""
  )
    .trim()
    .toLowerCase();
};

const extractAiUploadFileType = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  return String(
    record.fileType ||
      record.file_type ||
      record.type ||
      (record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>).fileType ||
          (record.data as Record<string, unknown>).file_type ||
          (record.data as Record<string, unknown>).type
        : "") ||
      ""
  )
    .trim()
    .toLowerCase();
};

const extractAiUploadOssId = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  return String(
    record.ossId ||
      record.oss_id ||
      record.fileId ||
      record.file_id ||
      (record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>).ossId ||
          (record.data as Record<string, unknown>).oss_id ||
          (record.data as Record<string, unknown>).fileId ||
          (record.data as Record<string, unknown>).file_id
        : "") ||
      ""
  ).trim();
};

const extractAiUploadFileUrl = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  return String(
    record.url ||
      record.fileUrl ||
      record.file_url ||
      (record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>).url ||
          (record.data as Record<string, unknown>).fileUrl ||
          (record.data as Record<string, unknown>).file_url
        : "") ||
      ""
  ).trim();
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForAiFileActive = async (fileId: string, abortController: AbortController) => {
  if (!fileId) {
    throw new Error("文件ID为空，无法确认上传状态");
  }

  for (let index = 0; index < AI_UPLOAD_POLL_MAX_RETRY; index += 1) {
    if (abortController.signal.aborted) {
      throw new DOMException("上传已取消", "AbortError");
    }

    const fileInfo = await getFiles(fileId);
    const fileStatus = extractAiUploadFileStatus(fileInfo);
    if (fileStatus === "active") {
      return fileInfo;
    }

    if (fileStatus && fileStatus !== "processing" && fileStatus !== "pending") {
      throw new Error(`文件处理失败(${fileStatus})`);
    }

    await sleep(AI_UPLOAD_POLL_INTERVAL_MS);
  }

  throw new Error("文件处理中，请稍后重试");
};

const extractAiChatText = (payload: unknown): string => {
  if (typeof payload === "string") {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => extractAiChatText(item))
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;
  const directKeys = [
    "content",
    "message",
    "answer",
    "reply",
    "text",
    "result",
    "outputText",
  ];

  for (const key of directKeys) {
    const resolved = extractAiChatText(record[key]);
    if (resolved) {
      return resolved;
    }
  }

  const nestedKeys = ["data", "output", "choices", "messages"];
  for (const key of nestedKeys) {
    const resolved = extractAiChatText(record[key]);
    if (resolved) {
      return resolved;
    }
  }

  return "";
};

const normalizeAiSuggestions = (value: unknown): string[] => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  const deduped = new Set<string>();

  list.forEach((item) => {
    if (typeof item === "string") {
      const text = item.trim();
      if (text) {
        deduped.add(text);
      }
      return;
    }

    if (!item || typeof item !== "object") {
      return;
    }

    const rowMap = createLowerCaseMap(item as Record<string, unknown>);
    const text = String(
      pickByKeys(rowMap, ["title", "question", "content", "text", "name"]) || ""
    ).trim();
    if (text) {
      deduped.add(text);
    }
  });

  return Array.from(deduped).slice(0, 8);
};

const extractAiSuggestions = (payload: unknown): string[] => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    for (let index = payload.length - 1; index >= 0; index -= 1) {
      const resolved = extractAiSuggestions(payload[index]);
      if (resolved.length) {
        return resolved;
      }
    }
    return [];
  }

  if (typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const directSuggestions = normalizeAiSuggestions(
    record.suggestions || record.followUps || record.followUpQuestions
  );
  if (directSuggestions.length) {
    return directSuggestions;
  }

  if (Array.isArray(record.chunks)) {
    const chunkSuggestions = extractAiSuggestions(record.chunks);
    if (chunkSuggestions.length) {
      return chunkSuggestions;
    }
  }

  const nestedKeys = ["data", "output", "result", "response", "message"];
  for (const key of nestedKeys) {
    const nestedSuggestions = extractAiSuggestions(record[key]);
    if (nestedSuggestions.length) {
      return nestedSuggestions;
    }
  }

  return [];
};

const normalizeAiImageUrl = (value: unknown) => {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.startsWith("data:image/")) return text;
  if (text.startsWith("//")) return `https:${text}`;
  if (/^https?:\/\//i.test(text)) return text;
  return "";
};

const extractAiImageUrlsFromText = (text: string): string[] => {
  const source = String(text || "").trim();
  if (!source) return [];
  const result = new Set<string>();
  const markdownMatches = source.matchAll(/!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/gi);
  for (const match of markdownMatches) {
    const url = normalizeAiImageUrl(match[1]);
    if (url) {
      result.add(url);
    }
  }
  const urlMatches = source.matchAll(/https?:\/\/[^\s"'<>）)]+/gi);
  for (const match of urlMatches) {
    const url = normalizeAiImageUrl(match[0]);
    if (url) {
      result.add(url);
    }
  }
  return Array.from(result);
};

const extractAiImageUrls = (payload: unknown): string[] => {
  if (!payload) return [];

  if (typeof payload === "string") {
    return extractAiImageUrlsFromText(payload);
  }

  if (Array.isArray(payload)) {
    const result = new Set<string>();
    payload.forEach((item) => {
      extractAiImageUrls(item).forEach((url) => result.add(url));
    });
    return Array.from(result);
  }

  if (typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const result = new Set<string>();
  const directUrlKeys = [
    "url",
    "imageUrl",
    "imageURL",
    "image_url",
    "fileUrl",
    "file_url",
    "src",
  ];
  directUrlKeys.forEach((key) => {
    const url = normalizeAiImageUrl(record[key]);
    if (url) {
      result.add(url);
    }
  });

  const listKeys = [
    "urls",
    "imageUrls",
    "image_urls",
    "images",
    "imageList",
    "outputs",
    "results",
    "data",
    "output",
    "message",
    "choices",
    "chunks",
  ];
  listKeys.forEach((key) => {
    extractAiImageUrls(record[key]).forEach((url) => result.add(url));
  });

  const text = extractAiChatText(record);
  extractAiImageUrlsFromText(text).forEach((url) => result.add(url));
  return Array.from(result);
};

const resolveAiChatSessionId = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return "";
  const record = payload as Record<string, unknown>;
  const chunks = Array.isArray(record.chunks) ? record.chunks : [];
  for (const chunk of chunks) {
    const chunkSessionId = resolveAiChatSessionId(chunk);
    if (chunkSessionId) {
      return chunkSessionId;
    }
  }
  return String(
    record.sessionId ||
      record.session_id ||
      record.id ||
      (record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>).sessionId ||
          (record.data as Record<string, unknown>).session_id ||
          (record.data as Record<string, unknown>).id
        : "") ||
      ""
  ).trim();
};

const buildAiFallbackReply = (question: string, file: AiUploadFile | null) => {
  const questionText = question.trim();
  const filePrefix = file ? `我已经收到附件《${file.name}》。` : "";
  if (!questionText) {
    return `${filePrefix}请告诉我你希望我如何使用这份内容，例如提炼重点、生成教案、设计习题或整理课堂活动。`;
  }

  return `${filePrefix}我已收到你的问题：“${questionText}”。如果你希望，我可以继续帮你从教学目标、课堂流程、互动活动和作业设计这几个方向展开。`;
};

const buildHistoryFallbackMessages = (item: HistoryRecord): AiChatMessage[] => [
  {
    id: createAiChatMessageId(),
    role: "user",
    content: item.content,
    file: null,
  },
  {
    id: createAiChatMessageId(),
    role: "assistant",
    content: buildAiFallbackReply(item.content, null),
    file: null,
    stopped: false,
    thinkingMode: false,
    thinkingCollapsed: false,
  },
];

const normalizePersistedChatMessages = (rows: unknown): AiChatMessage[] => {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const row = item as Record<string, unknown>;
      const role = row.role === "assistant" ? "assistant" : "user";
      const pending = Boolean(row.pending);
      const stopped = pending ? true : Boolean(row.stopped);
      const contentText = String(row.content || "").trim();
      const fallbackContent =
        pending && !contentText
          ? "已中断当前回答，你可以点击“重新回答”继续。"
          : contentText;
      const fileRecord =
        row.file && typeof row.file === "object"
          ? (row.file as Record<string, unknown>)
          : null;
      const file =
        fileRecord &&
        (isValidFieldValue(fileRecord.name) ||
          isValidFieldValue(fileRecord.ossId) ||
          isValidFieldValue(fileRecord.url) ||
          isValidFieldValue(fileRecord.previewUrl) ||
          isValidFieldValue(fileRecord.fileType))
          ? {
              name: String(fileRecord.name || "").trim(),
              ossId: String(fileRecord.ossId || "").trim(),
              url: String(fileRecord.url || "").trim(),
              previewUrl: String(fileRecord.previewUrl || "").trim(),
              fileType: String(fileRecord.fileType || "").trim(),
            }
          : null;
      const suggestions = normalizeAiSuggestions(row.suggestions);

      if (!fallbackContent && !file) {
        return null;
      }

      return {
        id: String(row.id || createAiChatMessageId()),
        role,
        content: fallbackContent,
        file,
        suggestions,
        pending: false,
        stopped,
        thinkingMode: Boolean(row.thinkingMode),
        thinkingCollapsed: Boolean(row.thinkingCollapsed),
      } as AiChatMessage;
    })
    .filter((item): item is AiChatMessage => !!item);
};

const hasPersistedLessonPlanDraft = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return false;
  const row = payload as Record<string, unknown>;
  const standardList = Array.isArray(row.standard)
    ? row.standard.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const unitType = String(row.unitType || "").trim();
  const questionCountValues = [
    String(row.singleCount || "").trim(),
    String(row.multipleCount || "").trim(),
    String(row.judgeCount || "").trim(),
    String(row.blankCount || "").trim(),
    String(row.connectCount || "").trim(),
  ];
  const hasExerciseCount = questionCountValues.some((item) => Number(item || 0) > 0);
  return [
    String(row.grade || "").trim(),
    String(row.periodCount || "").trim(),
    String(row.questionKind || "").trim(),
    ...questionCountValues,
    String(row.subject || "").trim(),
    String(row.scenario || "").trim(),
    String(row.teachTool || "").trim(),
    String(row.hardware || "").trim(),
    String(row.specialRequirement || "").trim(),
    unitType === "unit" ? "unit" : "",
    hasExerciseCount ? "exerciseCount" : "",
    standardList.length > 0 ? "standard" : "",
  ].some(Boolean);
};

const hasPersistedAnalysisDraft = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return false;
  const row = payload as Record<string, unknown>;
  const dateRange = Array.isArray(row.dateRange)
    ? row.dateRange.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const classIds = Array.isArray(row.selectedClassIds)
    ? row.selectedClassIds.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const gradeIds = Array.isArray(row.selectedGradeIds)
    ? row.selectedGradeIds.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  return (
    dateRange.length > 0 ||
    classIds.length > 0 ||
    gradeIds.length > 0 ||
    String(row.specialRequirement || "").trim().length > 0
  );
};

const getAiRouteSessionType = () => {
  if (!isChatMode.value) {
    if (isLessonPlanMode.value) return lessonPlanSessionType.value;
    if (isAnalysisMode.value) return 6;
    if (isImageMode.value) return 7;
    return 0;
  }
  return lessonPlanChatActive.value ? lessonPlanSessionType.value : chatSessionType.value;
};

const buildAiRouteQuery = () => {
  const nextQuery = {} as Record<string, string | undefined>;
  delete nextQuery[AI_ROUTE_QUERY_VIEW_KEY];
  delete nextQuery[AI_ROUTE_QUERY_HISTORY_ID_KEY];
  delete nextQuery[AI_ROUTE_QUERY_SESSION_ID_KEY];
  delete nextQuery[AI_ROUTE_QUERY_SESSION_TYPE_KEY];

  if (isChatMode.value) {
    nextQuery[AI_ROUTE_QUERY_VIEW_KEY] = "chat";
    const sessionType = getAiRouteSessionType();
    if (sessionType) {
      nextQuery[AI_ROUTE_QUERY_SESSION_TYPE_KEY] = String(sessionType);
    }
    if (activeHistoryId.value) {
      nextQuery[AI_ROUTE_QUERY_HISTORY_ID_KEY] = String(activeHistoryId.value);
    } else if (chatSessionId.value) {
      nextQuery[AI_ROUTE_QUERY_SESSION_ID_KEY] = String(chatSessionId.value);
    }
    return nextQuery;
  }

  if (isLessonPlanMode.value) {
    nextQuery[AI_ROUTE_QUERY_VIEW_KEY] = "form";
    nextQuery[AI_ROUTE_QUERY_SESSION_TYPE_KEY] = String(lessonPlanSessionType.value);
    return nextQuery;
  }

  if (isAnalysisMode.value) {
    nextQuery[AI_ROUTE_QUERY_VIEW_KEY] = "form";
    nextQuery[AI_ROUTE_QUERY_SESSION_TYPE_KEY] = "6";
    return nextQuery;
  }

  if (isImageMode.value) {
    nextQuery[AI_ROUTE_QUERY_VIEW_KEY] = "form";
    nextQuery[AI_ROUTE_QUERY_SESSION_TYPE_KEY] = "7";
    if (activeHistoryId.value) {
      nextQuery[AI_ROUTE_QUERY_HISTORY_ID_KEY] = String(activeHistoryId.value);
    } else if (chatSessionId.value) {
      nextQuery[AI_ROUTE_QUERY_SESSION_ID_KEY] = String(chatSessionId.value);
    }
    return nextQuery;
  }

  return nextQuery;
};

const readAiRouteStateFromLocation = () => {
  if (typeof window === "undefined") {
    return {
      view: String(route.query[AI_ROUTE_QUERY_VIEW_KEY] || ""),
      historyId: String(route.query[AI_ROUTE_QUERY_HISTORY_ID_KEY] || ""),
      sessionId: String(route.query[AI_ROUTE_QUERY_SESSION_ID_KEY] || ""),
      sessionType: String(route.query[AI_ROUTE_QUERY_SESSION_TYPE_KEY] || ""),
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    view: String(params.get(AI_ROUTE_QUERY_VIEW_KEY) || ""),
    historyId: String(params.get(AI_ROUTE_QUERY_HISTORY_ID_KEY) || ""),
    sessionId: String(params.get(AI_ROUTE_QUERY_SESSION_ID_KEY) || ""),
    sessionType: String(params.get(AI_ROUTE_QUERY_SESSION_TYPE_KEY) || ""),
  };
};

const isSameAiRouteQuery = (nextQuery: Record<string, string | undefined>) => {
  const currentRouteState = readAiRouteStateFromLocation();
  return (
    currentRouteState.view === String(nextQuery[AI_ROUTE_QUERY_VIEW_KEY] || "") &&
    currentRouteState.historyId === String(nextQuery[AI_ROUTE_QUERY_HISTORY_ID_KEY] || "") &&
    currentRouteState.sessionId === String(nextQuery[AI_ROUTE_QUERY_SESSION_ID_KEY] || "") &&
    currentRouteState.sessionType === String(nextQuery[AI_ROUTE_QUERY_SESSION_TYPE_KEY] || "")
  );
};

const resolveAiRouteBasePath = () => {
  if (route.path.startsWith("/system/opt/ai-painting")) {
    return "/system/opt/ai-painting";
  }
  if (route.path.startsWith("/system/opt/smart-qa")) {
    return "/system/opt/smart-qa";
  }
  return "/system/ai";
};

const isOptAiPaintingCreateEntry = (routeState?: {
  view?: string;
  historyId?: string;
  sessionId?: string;
  sessionType?: string;
}) => {
  const currentRouteState = routeState || readAiRouteStateFromLocation();
  return (
    route.path.startsWith("/system/opt/ai-painting") &&
    String(currentRouteState.view || "").trim() === "form" &&
    String(currentRouteState.sessionType || "").trim() === "7" &&
    !String(currentRouteState.historyId || "").trim() &&
    !String(currentRouteState.sessionId || "").trim()
  );
};

const shouldHideImageHistoryEntry = computed(() => {
  return isImageMode.value && route.path.startsWith("/system/opt/ai-painting");
});

const syncAiRouteState = async () => {
  if (typeof window === "undefined") return;
  const nextQuery = buildAiRouteQuery();
  if (isSameAiRouteQuery(nextQuery)) return;
  try {
    const url = new URL(window.location.href);
    url.pathname = resolveAiRouteBasePath();
    url.search = "";
    Object.entries(nextQuery).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    // 路由同步失败时不影响主流程
  }
};

const resolveSessionIdFromSessionRows = (rows: unknown, fallback = "") => {
  const records = unwrapAiRows(rows).filter(
    (item): item is Record<string, unknown> => !!item && typeof item === "object"
  );
  for (const row of records) {
    const rowMap = createLowerCaseMap(row);
    const sessionId = String(
      pickByKeys(rowMap, ["sessionId", "session_id", "conversationId", "id"]) || ""
    ).trim();
    if (sessionId) {
      return sessionId;
    }
  }
  return String(fallback || "").trim();
};

const hydrateChatMessagesByHistoryId = async (
  historyId: string,
  options?: {
    lessonHistory?: boolean;
    lessonSessionType?: 2 | 3 | 4;
    fallbackSessionId?: string;
  }
) => {
  const targetHistoryId = String(historyId || "").trim();
  if (!targetHistoryId) return;

  try {
    const rows = await getSessions(targetHistoryId);

    const isLessonHistory = Boolean(options?.lessonHistory);
    if (isLessonHistory) {
      lessonPlanSessionType.value = normalizeLessonPlanSessionType(options?.lessonSessionType);
      const parsedLessonForm = parseLessonPlanFormFromSessionRows(rows);
      if (parsedLessonForm) {
        lessonPlanForm.grade = parsedLessonForm.grade;
        lessonPlanForm.unitType = parsedLessonForm.unitType;
        lessonPlanForm.questionKind = parsedLessonForm.questionKind;
        lessonPlanForm.singleCount = parsedLessonForm.singleCount;
        lessonPlanForm.multipleCount = parsedLessonForm.multipleCount;
        lessonPlanForm.judgeCount = parsedLessonForm.judgeCount;
        lessonPlanForm.blankCount = parsedLessonForm.blankCount;
        lessonPlanForm.connectCount = parsedLessonForm.connectCount;
        lessonPlanForm.periodCount = parsedLessonForm.periodCount;
        lessonPlanForm.subject = parsedLessonForm.subject;
        lessonPlanForm.scenario = parsedLessonForm.scenario;
        lessonPlanForm.teachTool = parsedLessonForm.teachTool;
        lessonPlanForm.hardware = parsedLessonForm.hardware;
        lessonPlanForm.specialRequirement = parsedLessonForm.specialRequirement;
        lessonPlanForm.standard = parsedLessonForm.standard;
      }
    }
    if (!isLessonHistory && chatSessionType.value === 5) {
      const parsedCodeAssistantForm = parseCodeAssistantFormFromSessionRows(rows);
      if (parsedCodeAssistantForm) {
        codeAssistantForm.mode = parsedCodeAssistantForm.mode;
        codeAssistantForm.language = parsedCodeAssistantForm.language;
        codeAssistantForm.requirement = parsedCodeAssistantForm.requirement;
        codeAssistantForm.code = parsedCodeAssistantForm.code;
        codeAssistantForm.error = parsedCodeAssistantForm.error;
      }
    }

    const normalizedMessages = normalizeAiSessionMessages(rows);
    if (normalizedMessages.length) {
      chatMessages.value = normalizedMessages;
    }
    const resolvedSessionId = resolveSessionIdFromSessionRows(
      rows,
      options?.fallbackSessionId || chatSessionId.value
    );
    if (resolvedSessionId) {
      chatSessionId.value = resolvedSessionId;
    }
    persistAiChatState();
  } catch {
    // 刷新兜底恢复失败时静默，不影响现有会话继续操作
  } finally {
    chatRequesting.value = false;
    scrollChatToBottom();
  }
};

const restoreAiChatStateByRoute = async () => {
  const routeState = readAiRouteStateFromLocation();
  const routeView = String(routeState.view || "").trim();
  const routeHistoryId = String(routeState.historyId || "").trim();
  const routeSessionId = String(routeState.sessionId || "").trim();
  const routeSessionTypeNumber = Number(routeState.sessionType || 0);
  const routeLessonSessionType = normalizeLessonPlanSessionType(routeSessionTypeNumber);
  const routeChatSessionType = normalizeChatSessionType(routeSessionTypeNumber);
  const isRouteLessonSessionType =
    routeSessionTypeNumber === 2 || routeSessionTypeNumber === 3 || routeSessionTypeNumber === 4;

  if (!routeView) return false;

  if (routeView === "form") {
    if (routeSessionTypeNumber === 7) {
      if (isOptAiPaintingCreateEntry(routeState)) {
        openImageView();
        return true;
      }
      openImageView({ keepDraft: true });
      const resolvedHistoryId = routeHistoryId || routeSessionId;
      if (resolvedHistoryId) {
        activeHistoryId.value = resolvedHistoryId;
        chatSessionId.value = routeSessionId || resolvedHistoryId;
        await hydrateImageModeByHistoryId(resolvedHistoryId, routeSessionId || resolvedHistoryId);
        return true;
      }
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(AI_CHAT_STATE_STORAGE_KEY);
          if (raw) {
            const payload = JSON.parse(raw) as Record<string, unknown>;
            const restoredImageForm =
              payload.imageForm && typeof payload.imageForm === "object"
                ? (payload.imageForm as Record<string, unknown>)
                : null;
            const restoredImageResultUrls = Array.isArray(payload.imageResultUrls)
              ? payload.imageResultUrls.map((item) => String(item || "").trim()).filter(Boolean)
              : [];
            if (restoredImageForm) {
              imageForm.prompt = String(restoredImageForm.prompt || "").slice(
                0,
                IMAGE_PROMPT_MAX_LENGTH
              );
              const restoredSize = String(restoredImageForm.size || "").trim();
              imageForm.size = IMAGE_SIZE_OPTIONS.some((item) => item.value === restoredSize)
                ? restoredSize
                : "1:1";
              imageForm.referenceImageUrl = String(
                restoredImageForm.referenceImageUrl || restoredImageForm.reference_image_url || ""
              ).trim();
              aiUploadFile.value = buildImageReferenceUploadFile(imageForm.referenceImageUrl);
            }
            imageResultUrls.value = restoredImageResultUrls;
            imageResultText.value = String(payload.imageResultText || "").trim();
            chatSessionId.value = String(payload.chatSessionId || "").trim();
            activeHistoryId.value = String(payload.activeHistoryId || "").trim();
          }
        } catch {
          // 本地恢复失败时不影响主流程
        }
      }
      return true;
    }
    if (routeSessionTypeNumber === 6) {
      openAnalysisView();
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(AI_CHAT_STATE_STORAGE_KEY);
          if (raw) {
            const payload = JSON.parse(raw) as Record<string, unknown>;
            const restoredAnalysisForm =
              payload.analysisForm && typeof payload.analysisForm === "object"
                ? (payload.analysisForm as Record<string, unknown>)
                : null;
            if (restoredAnalysisForm) {
              const restoredDateRange = Array.isArray(restoredAnalysisForm.dateRange)
                ? restoredAnalysisForm.dateRange.map((item) => String(item || "").trim())
                : [];
              analysisForm.dateRange = [
                String(restoredDateRange[0] || ANALYSIS_DATE_START).trim(),
                String(restoredDateRange[1] || todayText).trim(),
              ];
              analysisForm.selectedGradeIds = Array.isArray(
                restoredAnalysisForm.selectedGradeIds
              )
                ? restoredAnalysisForm.selectedGradeIds
                    .map((item) => String(item || "").trim())
                    .filter(Boolean)
                : [];
              analysisForm.selectedClassIds = Array.isArray(
                restoredAnalysisForm.selectedClassIds
              )
                ? restoredAnalysisForm.selectedClassIds
                    .map((item) => String(item || "").trim())
                    .filter(Boolean)
                : [];
              analysisForm.specialRequirement = String(
                restoredAnalysisForm.specialRequirement || ""
              ).trim();
              void loadAnalysisGradeOptions();
            }
          }
        } catch {
          // 本地恢复失败时不影响主流程
        }
      }
      return true;
    }
    openLessonPlanView(routeLessonSessionType);
    return true;
  }

  if (routeView === "chat" && (routeHistoryId || routeSessionId)) {
    const resolvedHistoryId = routeHistoryId || routeSessionId;
    if (!resolvedHistoryId) {
      return false;
    }
    if (routeChatSessionType === 7) {
      openImageView({ keepDraft: true });
      activeHistoryId.value = resolvedHistoryId;
      chatSessionId.value = routeSessionId || resolvedHistoryId;
      await hydrateImageModeByHistoryId(resolvedHistoryId, routeSessionId || resolvedHistoryId);
      return true;
    }
    isLessonPlanMode.value = false;
    isAnalysisMode.value = false;
    isImageMode.value = false;
    isChatMode.value = true;
    chatSessionType.value = routeChatSessionType;
    lessonPlanChatActive.value = isRouteLessonSessionType;
    lessonPlanSessionType.value = routeLessonSessionType;
    lessonChatEditorExpanded.value = false;
    activeGenerateFileMenuMessageId.value = "";
    activeHistoryId.value = resolvedHistoryId;
    chatSessionId.value = routeSessionId || resolvedHistoryId;
    chatRequesting.value = true;
    chatMessages.value = [
      {
        id: createAiChatMessageId(),
        role: "assistant",
        content: "正在恢复当前会话...",
        file: null,
        pending: true,
      },
    ];
    await hydrateChatMessagesByHistoryId(resolvedHistoryId, {
      lessonHistory: lessonPlanChatActive.value,
      lessonSessionType: lessonPlanSessionType.value,
      fallbackSessionId: routeSessionId || resolvedHistoryId,
    });
    return true;
  }

  if (routeView === "chat") {
    if (routeChatSessionType === 7) {
      openImageView({ keepDraft: true });
      return true;
    }
    isLessonPlanMode.value = false;
    isAnalysisMode.value = false;
    isImageMode.value = false;
    isChatMode.value = true;
    chatSessionType.value = routeChatSessionType;
    lessonPlanChatActive.value = false;
    lessonPlanSessionType.value = 2;
    lessonChatEditorExpanded.value = false;
    return true;
  }

  return false;
};

const readLastSessionSnapshot = () => {
  if (typeof window === "undefined") return null;

  try {
    const rawSnapshot = window.sessionStorage.getItem(AI_CHAT_LAST_SNAPSHOT_KEY);
    if (!rawSnapshot) return null;
    return JSON.parse(rawSnapshot) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const restoreChatFromSnapshot = (snapshot: Record<string, unknown> | null) => {
  if (!snapshot) return false;

  const sessionId = String(snapshot.chatSessionId || "").trim();
  if (!sessionId) return false;

  isLessonPlanMode.value = false;
  isAnalysisMode.value = false;
  isImageMode.value = false;
  isChatMode.value = true;
  activeHistoryId.value = String(snapshot.activeHistoryId || "").trim();
  chatSessionType.value = normalizeChatSessionType(snapshot.chatSessionType);
  lessonPlanChatActive.value = Boolean(snapshot.lessonPlanChatActive);
  lessonPlanSessionType.value = normalizeLessonPlanSessionType(snapshot.lessonPlanSessionType);
  lessonChatEditorExpanded.value = false;
  chatSessionId.value = sessionId;
  chatMessages.value = [];
  chatRequesting.value = true;
  void hydrateChatMessagesByHistoryId(String(snapshot.activeHistoryId || sessionId), {
    lessonHistory: lessonPlanChatActive.value,
    lessonSessionType: lessonPlanSessionType.value,
    fallbackSessionId: sessionId,
  });
  return true;
};

const restoreChatFromLastSnapshot = () => {
  return restoreChatFromSnapshot(readLastSessionSnapshot());
};

const persistAiChatSessionSnapshot = () => {
  if (typeof window === "undefined") return;
  try {
    const snapshot = {
      activeHistoryId: activeHistoryId.value,
      chatSessionId: chatSessionId.value,
      chatSessionType: chatSessionType.value,
      lessonPlanSessionType: lessonPlanSessionType.value,
      lessonPlanChatActive: lessonPlanChatActive.value,
      isChatMode: isChatMode.value,
      isLessonPlanMode: isLessonPlanMode.value,
      isAnalysisMode: isAnalysisMode.value,
      isImageMode: isImageMode.value,
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(AI_CHAT_LAST_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // 快照失败时不影响主流程
  }
};

const persistAiChatState = () => {
  if (typeof window === "undefined") return;

  try {
    const payload = {
      isChatMode: isChatMode.value,
      isLessonPlanMode: isLessonPlanMode.value,
      isAnalysisMode: isAnalysisMode.value,
      isImageMode: isImageMode.value,
      activeHistoryId: activeHistoryId.value,
      chatSessionType: chatSessionType.value,
      lessonPlanSessionType: lessonPlanSessionType.value,
      lessonPlanChatActive: lessonPlanChatActive.value,
      lessonChatEditorExpanded: lessonChatEditorExpanded.value,
      chatSessionId: chatSessionId.value,
      enableDeepThinking: enableDeepThinking.value,
      searchKeyword: searchKeyword.value,
      analysisForm: {
        dateRange: [...analysisForm.dateRange],
        selectedGradeIds: [...analysisForm.selectedGradeIds],
        selectedClassIds: [...analysisForm.selectedClassIds],
        specialRequirement: analysisForm.specialRequirement,
      },
      imageForm: {
        prompt: imageForm.prompt,
        size: imageForm.size,
        referenceImageUrl: imageForm.referenceImageUrl,
      },
      imageResultUrls: [...imageResultUrls.value],
      imageResultText: imageResultText.value,
      lessonPlanForm: {
        grade: lessonPlanForm.grade,
        unitType: lessonPlanForm.unitType,
        questionKind: lessonPlanForm.questionKind,
        singleCount: lessonPlanForm.singleCount,
        multipleCount: lessonPlanForm.multipleCount,
        judgeCount: lessonPlanForm.judgeCount,
        blankCount: lessonPlanForm.blankCount,
        connectCount: lessonPlanForm.connectCount,
        periodCount: lessonPlanForm.periodCount,
        subject: lessonPlanForm.subject,
        scenario: lessonPlanForm.scenario,
        teachTool: lessonPlanForm.teachTool,
        hardware: lessonPlanForm.hardware,
        specialRequirement: lessonPlanForm.specialRequirement,
        standard: [...lessonPlanForm.standard],
      },
      chatMessages: chatMessages.value.slice(-AI_CHAT_STATE_MAX_MESSAGES).map((item) => ({
        id: item.id,
        role: item.role,
        content: item.content,
        file: item.file,
        suggestions: item.suggestions || [],
        pending: item.pending,
        stopped: item.stopped,
        thinkingMode: item.thinkingMode,
        thinkingCollapsed: item.thinkingCollapsed,
      })),
      savedAt: Date.now(),
    };

    window.localStorage.setItem(AI_CHAT_STATE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // 本地存储失败时静默，不影响主流程
  }
  persistAiChatSessionSnapshot();
};

const restoreAiChatState = () => {
  if (typeof window === "undefined") return;

  try {
    const latestSnapshot = readLastSessionSnapshot();
    const shouldForceHome =
      window.sessionStorage.getItem(AI_FORCE_HOME_ONCE_KEY) === "1";
    if (shouldForceHome) {
      window.sessionStorage.removeItem(AI_FORCE_HOME_ONCE_KEY);
      window.sessionStorage.removeItem(AI_CHAT_LAST_SNAPSHOT_KEY);
      window.localStorage.removeItem(AI_CHAT_STATE_STORAGE_KEY);
      isLessonPlanMode.value = false;
      isAnalysisMode.value = false;
      isImageMode.value = false;
      lessonPlanSessionType.value = 2;
      isChatMode.value = false;
      chatSessionType.value = 1;
      activeHistoryId.value = "";
      lessonPlanChatActive.value = false;
      lessonChatEditorExpanded.value = false;
      chatSessionId.value = "";
      chatMessages.value = [];
      searchKeyword.value = "";
      analysisForm.dateRange = [ANALYSIS_DATE_START, todayText];
      analysisForm.selectedGradeIds = [];
      analysisForm.selectedClassIds = [];
      analysisForm.specialRequirement = "";
      imageForm.prompt = "";
      imageForm.size = "1:1";
      imageForm.referenceImageUrl = "";
      imageResultUrls.value = [];
      imageResultText.value = "";
      return;
    }

    const routeState = readAiRouteStateFromLocation();
    const routeView = String(routeState.view || "").trim();
    // 首页态刷新时不做会话恢复，保持停留在 AI 助手首页
    if (!routeView) {
      return;
    }

    const snapshotSessionId = String(latestSnapshot?.chatSessionId || "").trim();
    const snapshotWantsChatView =
      Boolean(latestSnapshot?.isChatMode) &&
      !Boolean(latestSnapshot?.isLessonPlanMode) &&
      !Boolean(latestSnapshot?.isAnalysisMode) &&
      !Boolean(latestSnapshot?.isImageMode);
    if (snapshotSessionId && snapshotWantsChatView) {
      restoreChatFromSnapshot(latestSnapshot);
      return;
    }

    const raw = window.localStorage.getItem(AI_CHAT_STATE_STORAGE_KEY);
    if (!raw) {
      restoreChatFromSnapshot(latestSnapshot);
      return;
    }

    const payload = JSON.parse(raw) as Record<string, unknown>;
    const restoredMessages = normalizePersistedChatMessages(payload.chatMessages);
    const restoredAnalysisForm =
      payload.analysisForm && typeof payload.analysisForm === "object"
        ? (payload.analysisForm as Record<string, unknown>)
        : null;
    const restoredImageForm =
      payload.imageForm && typeof payload.imageForm === "object"
        ? (payload.imageForm as Record<string, unknown>)
        : null;
    const restoredLessonForm =
      payload.lessonPlanForm && typeof payload.lessonPlanForm === "object"
        ? (payload.lessonPlanForm as Record<string, unknown>)
        : null;
    const restoredImageResultUrls = Array.isArray(payload.imageResultUrls)
      ? payload.imageResultUrls.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    const restoredAnalysisMode =
      Boolean(payload.isAnalysisMode) ||
      (!Boolean(payload.isChatMode) &&
        !Boolean(payload.isLessonPlanMode) &&
        restoredMessages.length === 0 &&
        hasPersistedAnalysisDraft(restoredAnalysisForm));
    const restoredImageMode =
      Boolean(payload.isImageMode) ||
      (!Boolean(payload.isChatMode) &&
        !Boolean(payload.isLessonPlanMode) &&
        !restoredAnalysisMode &&
        restoredMessages.length === 0 &&
        (Boolean(restoredImageResultUrls.length) ||
          String(restoredImageForm?.prompt || "").trim().length > 0));
    const restoredLessonMode =
      Boolean(payload.isLessonPlanMode) ||
      (!Boolean(payload.isChatMode) &&
        !restoredAnalysisMode &&
        !restoredImageMode &&
        restoredMessages.length === 0 &&
        hasPersistedLessonPlanDraft(restoredLessonForm));
    const restoredChatMode =
      (Boolean(payload.isChatMode) ||
        restoredMessages.length > 0 ||
        Boolean(payload.lessonPlanChatActive)) &&
      !restoredLessonMode &&
      !restoredAnalysisMode &&
      !restoredImageMode;

    isLessonPlanMode.value = restoredLessonMode;
    isAnalysisMode.value = restoredAnalysisMode;
    isImageMode.value = restoredImageMode;
    lessonPlanSessionType.value = normalizeLessonPlanSessionType(payload.lessonPlanSessionType);
    isChatMode.value = restoredChatMode;
    chatSessionType.value = normalizeChatSessionType(payload.chatSessionType);
    activeHistoryId.value = String(payload.activeHistoryId || "").trim();
    lessonPlanChatActive.value = Boolean(payload.lessonPlanChatActive) && restoredChatMode;
    lessonChatEditorExpanded.value = restoredLessonMode
      ? true
      : Boolean(payload.lessonChatEditorExpanded) && lessonPlanChatActive.value;
    chatSessionId.value = String(payload.chatSessionId || "").trim();
    enableDeepThinking.value = Boolean(payload.enableDeepThinking);
    searchKeyword.value = String(payload.searchKeyword || "");
    chatMessages.value = restoredMessages;
    if (isChatMode.value && chatSessionId.value && chatMessages.value.length === 0) {
      chatRequesting.value = true;
      void hydrateChatMessagesByHistoryId(activeHistoryId.value || chatSessionId.value, {
        lessonHistory: lessonPlanChatActive.value,
        lessonSessionType: lessonPlanSessionType.value,
        fallbackSessionId: chatSessionId.value,
      });
    }

    if (restoredLessonForm) {
      lessonPlanForm.grade = String(restoredLessonForm.grade || "");
      lessonPlanForm.unitType = restoredLessonForm.unitType === "unit" ? "unit" : "single";
      lessonPlanForm.questionKind =
        String(restoredLessonForm.questionKind || "").trim() === "knowledge"
          ? "knowledge"
          : "scene";
      lessonPlanForm.singleCount = String(restoredLessonForm.singleCount || "0");
      lessonPlanForm.multipleCount = String(restoredLessonForm.multipleCount || "0");
      lessonPlanForm.judgeCount = String(restoredLessonForm.judgeCount || "0");
      lessonPlanForm.blankCount = String(restoredLessonForm.blankCount || "0");
      lessonPlanForm.connectCount = String(restoredLessonForm.connectCount || "0");
      lessonPlanForm.periodCount = String(restoredLessonForm.periodCount || "");
      lessonPlanForm.subject = String(restoredLessonForm.subject || "");
      lessonPlanForm.scenario = String(restoredLessonForm.scenario || "");
      lessonPlanForm.teachTool = String(restoredLessonForm.teachTool || "");
      lessonPlanForm.hardware = String(restoredLessonForm.hardware || "");
      lessonPlanForm.specialRequirement = String(
        restoredLessonForm.specialRequirement || ""
      );
      lessonPlanForm.standard = Array.isArray(restoredLessonForm.standard)
        ? restoredLessonForm.standard
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        : [];
    }

    if (restoredAnalysisForm) {
      const restoredDateRange = Array.isArray(restoredAnalysisForm.dateRange)
        ? restoredAnalysisForm.dateRange.map((item) => String(item || "").trim())
        : [];
      const startDate = String(restoredDateRange[0] || ANALYSIS_DATE_START).trim();
      const endDate = String(restoredDateRange[1] || todayText).trim();
      analysisForm.dateRange = [startDate, endDate];
      analysisForm.selectedGradeIds = Array.isArray(restoredAnalysisForm.selectedGradeIds)
        ? restoredAnalysisForm.selectedGradeIds
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        : [];
      analysisForm.selectedClassIds = Array.isArray(restoredAnalysisForm.selectedClassIds)
        ? restoredAnalysisForm.selectedClassIds
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        : [];
      analysisForm.specialRequirement = String(
        restoredAnalysisForm.specialRequirement || ""
      ).trim();
      if (isAnalysisMode.value) {
        void loadAnalysisGradeOptions();
      }
    }
    if (restoredImageForm) {
      imageForm.prompt = String(restoredImageForm.prompt || "").slice(0, IMAGE_PROMPT_MAX_LENGTH);
      const restoredSize = String(restoredImageForm.size || "").trim();
      imageForm.size = IMAGE_SIZE_OPTIONS.some((item) => item.value === restoredSize)
        ? restoredSize
        : "1:1";
      imageForm.referenceImageUrl = String(
        restoredImageForm.referenceImageUrl || restoredImageForm.reference_image_url || ""
      ).trim();
      aiUploadFile.value = buildImageReferenceUploadFile(imageForm.referenceImageUrl);
    }
    imageResultUrls.value = restoredImageResultUrls;
    imageResultText.value = String(payload.imageResultText || "").trim();
    if (isImageMode.value && (activeHistoryId.value || chatSessionId.value)) {
      void hydrateImageModeByHistoryId(
        activeHistoryId.value || chatSessionId.value,
        chatSessionId.value
      );
    }
  } catch {
    // 解析失败时忽略，避免阻塞页面
    restoreChatFromLastSnapshot();
  }
};

const startNewChat = (sessionType: 1 | 5 | 6 | 7 = 1) => {
  // 若旧会话仍在流式回复，先停止推理，避免新建后后端还在生成
  if (isStreamingReply.value) {
    stopAiReply();
  }
  // 保持留在对话窗口，仅清空会话上下文开启新一轮问答
  isLessonPlanMode.value = false;
  isAnalysisMode.value = false;
  isImageMode.value = false;
  lessonPlanSessionType.value = 2;
  lessonPlanChatActive.value = false;
  chatSessionType.value = sessionType;
  activeHistoryId.value = "";
  lessonChatEditorExpanded.value = false;
  activeGenerateFileMenuMessageId.value = "";
  isChatMode.value = true;
  chatSessionId.value = "";
  chatMessages.value = [];
  chatRequesting.value = false;
  isStreamingReply.value = false;
  activeChatAbortController.value = null;
  searchKeyword.value = "";
  clearAiUploadFile();
  resetImageModeState();
  resetCodeAssistantState();
};

const shouldShowThinkingPanel = (message: AiChatMessage) =>
  message.role === "assistant" &&
  !!message.thinkingMode &&
  (Boolean(message.pending) || Boolean(message.stopped));

const toggleThinkingPanel = (message: AiChatMessage) => {
  message.thinkingCollapsed = !message.thinkingCollapsed;
};

const clearPendingStopFallbackTimer = () => {
  if (typeof window === "undefined") return;
  if (pendingStopFallbackTimer.value !== null) {
    window.clearTimeout(pendingStopFallbackTimer.value);
    pendingStopFallbackTimer.value = null;
  }
};

const triggerStopSessionRequest = (sessionId: string) => {
  const activeSessionId = String(sessionId || "").trim();
  if (!activeSessionId) return;
  pendingStopSessionRequest.value = false;
  clearPendingStopFallbackTimer();
  void stopSession(activeSessionId).catch(() => {
    // 停止接口失败不影响前端中断体验，静默处理
  });
};

const stopAiReply = () => {
  if (!isStreamingReply.value) return;
  pendingStopSessionRequest.value = true;
  const activeSessionId = String(chatSessionId.value || "").trim();
  // 已拿到会话 id 时，先请求后端停止，再中断前端流
  if (activeSessionId) {
    triggerStopSessionRequest(activeSessionId);
    activeChatAbortController.value?.abort();
    return;
  }
  // 会话 id 可能在首个 chunk 返回，先等待短暂时间补发停止请求
  clearPendingStopFallbackTimer();
  if (typeof window !== "undefined") {
    pendingStopFallbackTimer.value = window.setTimeout(() => {
      if (!pendingStopSessionRequest.value) return;
      activeChatAbortController.value?.abort();
      pendingStopSessionRequest.value = false;
      pendingStopFallbackTimer.value = null;
    }, 1200);
  }
};

// 退出当前对话回到 AI 助手首页，彻底清空对话状态
const exitChatMode = () => {
  // 若仍在流式回复中，先停止推理
  if (isStreamingReply.value) {
    stopAiReply();
  }
  isLessonPlanMode.value = false;
  isAnalysisMode.value = false;
  isImageMode.value = false;
  lessonPlanSessionType.value = 2;
  lessonPlanChatActive.value = false;
  chatSessionType.value = 1;
  activeHistoryId.value = "";
  lessonChatEditorExpanded.value = false;
  activeGenerateFileMenuMessageId.value = "";
  isChatMode.value = false;
  chatSessionId.value = "";
  chatMessages.value = [];
  chatRequesting.value = false;
  isStreamingReply.value = false;
  activeChatAbortController.value = null;
  searchKeyword.value = "";
  clearAiUploadFile();
};

const openLessonPlanView = (sessionType: 2 | 3 | 4 = 2) => {
  if (isStreamingReply.value) {
    stopAiReply();
  }
  resetLessonPlanModeState();
  lessonPlanSessionType.value = sessionType;
  isChatMode.value = false;
  isLessonPlanMode.value = true;
  isAnalysisMode.value = false;
  isImageMode.value = false;
  searchKeyword.value = "";
  ensureHotAiQuestionList();
};

const exitLessonPlanView = () => {
  isLessonPlanMode.value = false;
  isAnalysisMode.value = false;
  isImageMode.value = false;
  activeHistoryId.value = "";
  lessonChatEditorExpanded.value = false;
  lessonRequirementTipsVisible.value = false;
  lessonStandardDropdownVisible.value = false;
};

const openAnalysisView = () => {
  if (isStreamingReply.value) {
    stopAiReply();
  }
  resetAnalysisModeState();
  isChatMode.value = false;
  isLessonPlanMode.value = false;
  isAnalysisMode.value = true;
  isImageMode.value = false;
  searchKeyword.value = "";
  ensureHotAiQuestionList();
  void loadAnalysisGradeOptions();
};

const exitAnalysisView = () => {
  isAnalysisMode.value = false;
  isImageMode.value = false;
  activeHistoryId.value = "";
  closeAnalysisTargetDropdown();
};

const resetCodeAssistantState = () => {
  codeAssistantForm.mode = "generate";
  codeAssistantForm.language = "";
  codeAssistantForm.requirement = "";
  codeAssistantForm.code = "";
  codeAssistantForm.error = "";
};

const resetLessonPlanModeState = () => {
  lessonPlanForm.grade = "";
  lessonPlanForm.unitType = "single";
  lessonPlanForm.questionKind = "scene";
  lessonPlanForm.singleCount = "0";
  lessonPlanForm.multipleCount = "0";
  lessonPlanForm.judgeCount = "0";
  lessonPlanForm.blankCount = "0";
  lessonPlanForm.connectCount = "0";
  lessonPlanForm.periodCount = "";
  lessonPlanForm.subject = "";
  lessonPlanForm.scenario = "";
  lessonPlanForm.teachTool = "";
  lessonPlanForm.hardware = "";
  lessonPlanForm.specialRequirement = "";
  lessonPlanForm.standard.splice(0, lessonPlanForm.standard.length);
  lessonPlanChatActive.value = false;
  lessonChatEditorExpanded.value = false;
  lessonRequirementTipsVisible.value = false;
  lessonStandardDropdownVisible.value = false;
  chatSessionId.value = "";
  chatMessages.value = [];
  activeHistoryId.value = "";
  clearAiUploadFile();
};

const handleCloseChat = async () => {
  if (route.path.startsWith("/system/opt/smart-qa")) {
    exitChatMode();
    await router.push("/system/opt");
    return;
  }
  exitChatMode();
};

const resetAnalysisModeState = () => {
  analysisForm.dateRange = [ANALYSIS_DATE_START, todayText];
  analysisForm.specialRequirement = "";
  analysisForm.selectedGradeIds = [];
  analysisForm.selectedClassIds = [];
  analysisActiveGradeId.value = "";
  chatSessionId.value = "";
  chatMessages.value = [];
  activeHistoryId.value = "";
  clearAiUploadFile();
  closeAnalysisTargetDropdown();
};

const resetImageModeState = () => {
  stopImageGenerateProgress();
  imageForm.prompt = "";
  imageForm.size = "1:1";
  imageForm.referenceImageUrl = "";
  imageResultUrls.value = [];
  imageResultText.value = "";
  showImagePromptTagEditor.value = false;
  imagePromptCustomTag.value = "";
  imageHistoryLoading.value = false;
  imageGenerating.value = false;
};

const normalizeImagePromptTag = (value: string) =>
  String(value || "")
    .replace(/^#+/, "")
    .replace(/[，,、]+/g, " ")
    .trim();

const buildImagePromptWithTag = (tag: string) => {
  const normalizedTag = normalizeImagePromptTag(tag);
  if (!normalizedTag) {
    return null;
  }

  const currentPrompt = imageForm.prompt.trim();
  if (currentPrompt.includes(normalizedTag)) {
    return {
      ok: false as const,
      reason: "duplicate",
      value: currentPrompt,
    };
  }

  const nextPrompt = currentPrompt
    ? `${currentPrompt}${/[，,、；;。.!！？?]$/.test(currentPrompt) ? "" : "，"}${normalizedTag}`
    : normalizedTag;

  if (nextPrompt.length > IMAGE_PROMPT_MAX_LENGTH) {
    return {
      ok: false as const,
      reason: "overflow",
      value: currentPrompt,
    };
  }

  return {
    ok: true as const,
    value: nextPrompt,
  };
};

const handleAppendImagePromptTag = (tag: string) => {
  const result = buildImagePromptWithTag(tag);
  if (!result) {
    ElMessage.warning("标签内容不能为空");
    return false;
  }
  if (!result.ok) {
    if (result.reason === "duplicate") {
      ElMessage.info("这个标签已经在提示词里了");
      return false;
    }
    ElMessage.warning(`加入后会超过 ${IMAGE_PROMPT_MAX_LENGTH} 字上限`);
    return false;
  }
  imageForm.prompt = result.value;
  return true;
};

const openImagePromptTagEditor = async () => {
  showImagePromptTagEditor.value = true;
  await nextTick();
  imagePromptCustomTagInputRef.value?.focus();
  imagePromptCustomTagInputRef.value?.select();
};

const closeImagePromptTagEditor = () => {
  showImagePromptTagEditor.value = false;
  imagePromptCustomTag.value = "";
};

const confirmImagePromptCustomTag = () => {
  const rawTag = imagePromptCustomTag.value;
  if (!normalizeImagePromptTag(rawTag)) {
    ElMessage.warning("请输入标签内容");
    return;
  }
  const appended = handleAppendImagePromptTag(rawTag);
  if (appended) {
    closeImagePromptTagEditor();
  }
};

const selectCodeAssistantMode = (mode: CodeAssistantMode) => {
  if (codeAssistantForm.mode === mode) return;
  codeAssistantForm.mode = mode;
  codeAssistantForm.requirement = "";
  codeAssistantForm.code = "";
  codeAssistantForm.error = "";
};

const applyCodeAssistantQuickExample = (mode: CodeAssistantMode) => {
  const example = CODE_ASSISTANT_QUICK_EXAMPLES[mode];
  codeAssistantForm.mode = mode;
  codeAssistantForm.requirement = example.requirement;
  codeAssistantForm.code = example.code;
  codeAssistantForm.error = example.error;
};

const handleCodeAssistantModeClick = async (mode: CodeAssistantMode) => {
  if (chatRequesting.value) {
    ElMessage.warning("上一条消息还在处理中");
    return;
  }
  applyCodeAssistantQuickExample(mode);
  await handleCodeAssistantSubmit();
};

const stopImageGenerateProgress = (options?: { keepValue?: boolean; complete?: boolean }) => {
  if (typeof window !== "undefined" && imageGenerateProgressTimer.value !== null) {
    window.clearInterval(imageGenerateProgressTimer.value);
  }
  imageGenerateProgressTimer.value = null;
  if (options?.complete) {
    imageGenerateProgressPercent.value = 100;
    return;
  }
  if (!options?.keepValue) {
    imageGenerateProgressPercent.value = 0;
  }
};

const startImageGenerateProgress = () => {
  stopImageGenerateProgress();
  imageGenerateProgressPercent.value = 8;
  if (typeof window === "undefined") return;
  imageGenerateProgressTimer.value = window.setInterval(() => {
    const current = imageGenerateProgressPercent.value;
    if (current >= 92) return;
    const step = current < 40 ? 9 : current < 70 ? 5 : 2;
    imageGenerateProgressPercent.value = Math.min(92, current + step);
  }, 450);
};

const selectImageResult = (targetUrl: string) => {
  const normalizedTarget = String(targetUrl || "").trim();
  if (!normalizedTarget) return;
  const nextList = imageResultUrls.value.filter((item) => item !== normalizedTarget);
  imageResultUrls.value = [normalizedTarget, ...nextList];
};

const handleSelectImagePreviewHistory = async (item: ImageHistoryPreviewItem) => {
  const targetSessionId = String(item.sessionId || "").trim();
  if (!targetSessionId) return;
  activeHistoryId.value = targetSessionId;
  chatSessionType.value = 7;
  chatSessionId.value = targetSessionId;
  searchKeyword.value = "";
  clearAiUploadFile();
  void syncAiRouteState();
  await hydrateImageModeBySessionId(targetSessionId);
  persistAiChatState();
};

const resolveImageDownloadName = (url: string) => {
  const normalizedUrl = String(url || "").trim();
  const filePath = normalizedUrl.split("?")[0] || "";
  const matched = filePath.match(/\.([a-zA-Z0-9]+)$/);
  const extension = matched?.[1] ? matched[1].toLowerCase() : "png";
  const safeExtension = ["jpg", "jpeg", "png", "webp", "gif", "bmp"].includes(extension)
    ? extension
    : "png";
  return `AI生图-${Date.now()}.${safeExtension}`;
};

const canvasToPngBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });

const renderImageSourceToPngBlob = async (
  source: CanvasImageSource,
  width: number,
  height: number
) => {
  if (width <= 0 || height <= 0) return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(source, 0, 0, width, height);
  return canvasToPngBlob(canvas);
};

const normalizeImageBlobForClipboard = async (blob: Blob) => {
  if (blob.type === "image/png") {
    return blob;
  }

  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    try {
      return await renderImageSourceToPngBlob(bitmap, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  }

  const objectUrl = window.URL.createObjectURL(blob);
  try {
    const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("图片读取失败"));
      image.src = objectUrl;
    });

    return await renderImageSourceToPngBlob(
      imageElement,
      imageElement.naturalWidth || imageElement.width,
      imageElement.naturalHeight || imageElement.height
    );
  } finally {
    window.URL.revokeObjectURL(objectUrl);
  }
};

const getPreviewImageClipboardBlob = async () => {
  const imageElement = imageResultMainRef.value;
  if (!imageElement) return null;

  const width = imageElement.naturalWidth || imageElement.width;
  const height = imageElement.naturalHeight || imageElement.height;
  return renderImageSourceToPngBlob(imageElement, width, height);
};

const handleCopyImageResult = async () => {
  const targetUrl = currentImageResultUrl.value.trim();
  if (!targetUrl) return;
  const proxyUrl = buildAiImageProxyUrl(targetUrl);

  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      ElMessage.error("当前浏览器不支持直接复制图片");
      return;
    }

    let clipboardBlob: Blob | null = null;

    try {
      const response = await fetch(proxyUrl, {
        cache: "no-store",
      });
      if (response.ok) {
        const targetBlob = await response.blob();
        clipboardBlob = await normalizeImageBlobForClipboard(targetBlob);
      }
    } catch {
      // 网络或跨域失败时，继续尝试从当前预览图复制
    }

    if (!clipboardBlob && imageResultMainRef.value?.complete) {
      try {
        clipboardBlob = await getPreviewImageClipboardBlob();
      } catch {
        // 预览图像素读取失败时继续走统一失败提示
      }
    }

    if (!clipboardBlob) {
      ElMessage.error("当前图片暂不支持直接复制，请使用下载");
      return;
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": clipboardBlob,
      }),
    ]);
    ElMessage.success("图片已复制");
  } catch {
    ElMessage.error("当前图片暂不支持直接复制，请使用下载");
  }
};

const handleDownloadImageResult = async () => {
  const targetUrl = currentImageResultUrl.value.trim();
  if (!targetUrl) return;
  const proxyUrl = buildAiImageProxyUrl(targetUrl);

  const fallbackDownload = () => {
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = resolveImageDownloadName(targetUrl);
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      fallbackDownload();
      ElMessage.success("开始下载");
      return;
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = resolveImageDownloadName(targetUrl);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
    ElMessage.success("开始下载");
  } catch {
    fallbackDownload();
    ElMessage.success("开始下载");
  }
};

const mergeImageResultUrls = (incomingUrls: string[]) => {
  if (!incomingUrls.length) return;
  const merged = [...imageResultUrls.value];
  incomingUrls.forEach((url) => {
    const normalizedUrl = String(url || "").trim();
    if (!normalizedUrl) return;
    if (!merged.includes(normalizedUrl)) {
      merged.push(normalizedUrl);
    }
  });
  imageResultUrls.value = merged;
};

const hydrateImageModeBySessionId = async (sessionId: string) => {
  const targetSessionId = String(sessionId || "").trim();
  if (!targetSessionId) return;
  imageHistoryLoading.value = true;
  chatRequesting.value = true;
  try {
    const rows = await getSessions(targetSessionId);
    const resolvedSessionId = resolveSessionIdFromSessionRows(rows, targetSessionId);
    if (resolvedSessionId) {
      chatSessionId.value = resolvedSessionId;
    }
    const parsed = parseImageFormFromSessionRows(rows);
    if (parsed.prompt) {
      imageForm.prompt = parsed.prompt.slice(0, IMAGE_PROMPT_MAX_LENGTH);
    }
    imageForm.size = IMAGE_SIZE_OPTIONS.some((item) => item.value === parsed.size)
      ? parsed.size
      : "1:1";
    imageForm.referenceImageUrl = parsed.referenceImageUrl || "";
    aiUploadFile.value = buildImageReferenceUploadFile(imageForm.referenceImageUrl);
    imageResultText.value = parsed.text || "";
    imageResultUrls.value = [...parsed.urls];
    persistAiChatState();
  } catch (error: unknown) {
    ElMessage.error(
      error instanceof Error && error.message ? error.message : "历史生图记录加载失败"
    );
  } finally {
    imageHistoryLoading.value = false;
    chatRequesting.value = false;
  }
};

const hydrateImageModeByHistoryId = async (historyId: string, fallbackSessionId = "") => {
  const targetSessionId = String(fallbackSessionId || historyId || "").trim();
  if (!targetSessionId) return;
  await hydrateImageModeBySessionId(targetSessionId);
};

const openImageView = (options?: { keepDraft?: boolean }) => {
  if (isStreamingReply.value) {
    stopAiReply();
  }
  isChatMode.value = false;
  isLessonPlanMode.value = false;
  isAnalysisMode.value = false;
  isImageMode.value = true;
  lessonPlanChatActive.value = false;
  chatSessionType.value = 7;
  activeHistoryId.value = "";
  activeGenerateFileMenuMessageId.value = "";
  lessonRequirementTipsVisible.value = false;
  lessonStandardDropdownVisible.value = false;
  closeAnalysisTargetDropdown();
  searchKeyword.value = "";
  if (!options?.keepDraft) {
    resetImageModeState();
    clearAiUploadFile();
    chatSessionId.value = "";
    chatMessages.value = [];
  }
};

const exitImageView = () => {
  isImageMode.value = false;
  activeHistoryId.value = "";
  stopImageGenerateProgress();
  imageGenerating.value = false;
  imageHistoryLoading.value = false;
  ensureHotAiQuestionList();
};

const handleBreadcrumbRootClick = async () => {
  if (route.path.startsWith("/system/opt")) {
    await router.push("/system/opt");
    return;
  }
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(AI_FORCE_HOME_ONCE_KEY);
    window.sessionStorage.removeItem(AI_CHAT_LAST_SNAPSHOT_KEY);
    window.localStorage.removeItem(AI_CHAT_STATE_STORAGE_KEY);
  }
  exitChatMode();
  resetLessonPlanModeState();
  resetAnalysisModeState();
  resetImageModeState();
  resetCodeAssistantState();
  await router.push("/system/ai");
};

const toggleLessonRequirementTips = () => {
  lessonStandardDropdownVisible.value = false;
  lessonRequirementTipsVisible.value = !lessonRequirementTipsVisible.value;
};

const toggleLessonStandardDropdown = () => {
  lessonRequirementTipsVisible.value = false;
  lessonStandardDropdownVisible.value = !lessonStandardDropdownVisible.value;
};

const toggleLessonStandardOption = (value: string) => {
  const index = lessonPlanForm.standard.indexOf(value);
  if (index >= 0) {
    lessonPlanForm.standard.splice(index, 1);
    return;
  }
  lessonPlanForm.standard.push(value);
};

const removeLessonStandardOption = (value: string) => {
  const index = lessonPlanForm.standard.indexOf(value);
  if (index >= 0) {
    lessonPlanForm.standard.splice(index, 1);
  }
};

const insertLessonRequirementTip = (item: { tag: string; text: string }) => {
  const nextLine = `【${item.tag}】${item.text}`;
  const currentText = lessonPlanForm.specialRequirement.trim();
  const mergedText = currentText ? `${currentText}\n${nextLine}` : nextLine;
  lessonPlanForm.specialRequirement = mergedText.slice(0, LESSON_PLAN_REQUIREMENT_MAX_LENGTH);
  lessonRequirementTipsVisible.value = false;
};

const handleLessonRequirementTipsOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node | null;
  if (!target) return;
  if (
    lessonRequirementTipsVisible.value &&
    !lessonRequirementTipsRef.value?.contains(target)
  ) {
    lessonRequirementTipsVisible.value = false;
  }
  if (
    lessonStandardDropdownVisible.value &&
    !lessonStandardSelectRef.value?.contains(target)
  ) {
    lessonStandardDropdownVisible.value = false;
  }
  if (
    analysisTargetDropdownVisible.value &&
    !analysisTargetPickerRef.value?.contains(target)
  ) {
    analysisTargetDropdownVisible.value = false;
  }
  if (activeGenerateFileMenuMessageId.value) {
    const element = target instanceof Element ? target : (target.parentElement as Element | null);
    if (!element || !element.closest(".ai-chat-message__generate")) {
      activeGenerateFileMenuMessageId.value = "";
    }
  }
};

const toggleLessonChatEditor = () => {
  lessonChatEditorExpanded.value = !lessonChatEditorExpanded.value;
};

const openGenerateFileMenu = (messageId: string) => {
  activeGenerateFileMenuMessageId.value = messageId;
};

const closeGenerateFileMenu = (messageId?: string) => {
  if (!messageId || activeGenerateFileMenuMessageId.value === messageId) {
    activeGenerateFileMenuMessageId.value = "";
  }
};

const resetExistingLessonCourseDialogState = () => {
  existingCourseType.value = "official";
  existingCourseSearchKeyword.value = "";
  existingChapterSearchKeyword.value = "";
  existingChapterLoading.value = false;
  existingChapterCacheMap.value = {};
  selectedExistingCourseId.value = "";
  selectedExistingChapterId.value = "";
  existingCourseOptions.value = [];
  existingChapterOptions.value = [];
};

const closeExistingLessonCourseDialog = () => {
  showExistingLessonCourseDialog.value = false;
  existingOpenSubmitting.value = false;
  pendingExistingLessonSessionId.value = "";
  pendingExistingOpenType.value = "lesson";
  resetExistingLessonCourseDialogState();
};

const loadExistingCourseMenuTree = async () => {
  existingCourseMenuLoading.value = true;
  try {
    const rows = await getExerciseCourseMenuTree({ fix: "no" });
    existingCourseMenuTree.value = Array.isArray(rows)
      ? (rows as ExistingCourseMenuItem[])
      : [];
    if (!selectedExistingCourseMenuId.value) {
      selectedExistingCourseMenuId.value =
        existingOfficialCourseMenuOptions.value[0]?.value || "";
    }
  } catch (error: unknown) {
    existingCourseMenuTree.value = [];
    selectedExistingCourseMenuId.value = "";
    ElMessage.error(
      error instanceof Error && error.message ? error.message : "课程分类加载失败"
    );
  } finally {
    existingCourseMenuLoading.value = false;
  }
};

const loadExistingCourseOptions = async () => {
  existingCourseLoading.value = true;
  try {
    let rows: unknown[] | Record<string, unknown> = [];
    if (existingCourseType.value === "custom") {
      rows = await getCursorList({ courseType: 1 });
    } else {
      const menuId = Number(selectedExistingCourseMenuId.value || 0);
      if (!menuId) {
        existingCourseOptions.value = [];
        return;
      }
      rows = await getCursorList({ menuId });
    }
    existingCourseOptions.value = normalizeExistingCourseOptions(rows);
    selectedExistingCourseId.value = existingCourseOptions.value[0]?.courseId || "";
    await applyExistingCourseChapters(selectedExistingCourseId.value, true);
  } catch (error: unknown) {
    existingCourseOptions.value = [];
    selectedExistingCourseId.value = "";
    selectedExistingChapterId.value = "";
    existingChapterOptions.value = [];
    ElMessage.error(
      error instanceof Error && error.message ? error.message : "课程列表加载失败"
    );
  } finally {
    existingCourseLoading.value = false;
  }
};

const switchExistingCourseType = async (type: "official" | "custom") => {
  if (existingCourseType.value === type) return;
  existingCourseType.value = type;
  selectedExistingCourseId.value = "";
  selectedExistingChapterId.value = "";
  existingChapterOptions.value = [];
  existingCourseSearchKeyword.value = "";
  existingChapterSearchKeyword.value = "";

  if (type === "official" && !existingCourseMenuTree.value.length) {
    await loadExistingCourseMenuTree();
  }
  await loadExistingCourseOptions();
};

const switchExistingCourseMenu = async (menuId: string) => {
  if (!menuId || selectedExistingCourseMenuId.value === menuId) return;
  selectedExistingCourseMenuId.value = menuId;
  selectedExistingCourseId.value = "";
  selectedExistingChapterId.value = "";
  existingChapterOptions.value = [];
  existingCourseSearchKeyword.value = "";
  existingChapterSearchKeyword.value = "";
  await loadExistingCourseOptions();
};

const handleSelectExistingCourse = async (courseId: string) => {
  if (!courseId || selectedExistingCourseId.value === courseId) return;
  selectedExistingCourseId.value = courseId;
  existingChapterSearchKeyword.value = "";
  await applyExistingCourseChapters(courseId, true);
};

const openExistingLessonCourseDialog = async (
  sessionId: string,
  openType: "lesson" | "ppt" = "lesson"
) => {
  pendingExistingOpenType.value = openType;
  pendingExistingLessonSessionId.value = sessionId;
  resetExistingLessonCourseDialogState();
  showExistingLessonCourseDialog.value = true;
  await loadExistingCourseMenuTree();
  if (!selectedExistingCourseMenuId.value) {
    selectedExistingCourseMenuId.value = existingOfficialCourseMenuOptions.value[0]?.value || "";
  }
  await loadExistingCourseOptions();
};

const resolvePrepareTargetFromResponse = (
  payload: unknown,
  fallback?: { courseId?: string; chapterId?: string }
) => {
  const resultRow =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const resultData =
    resultRow.data && typeof resultRow.data === "object"
      ? (resultRow.data as Record<string, unknown>)
      : resultRow;
  const resultDataMap = createLowerCaseMap(resultData);

  const courseId = String(
    pickByKeys(resultDataMap, ["courseId", "cursorId", "id"]) || fallback?.courseId || ""
  ).trim();
  const chapterId = String(
    pickByKeys(resultDataMap, ["chapterId", "chapterid"]) || fallback?.chapterId || ""
  ).trim();
  const resourceId = String(
    pickByKeys(resultDataMap, ["resourceId", "resourceid"])
  ).trim();

  return {
    courseId,
    chapterId,
    resourceId,
  };
};

const handleConfirmExistingLessonCourse = async () => {
  if (!canConfirmExistingLessonCourse.value || !pendingExistingLessonSessionId.value) return;
  existingOpenSubmitting.value = true;
  try {
    const result =
      pendingExistingOpenType.value === "ppt"
        ? await getPptExistingCursor({
            sessionId: pendingExistingLessonSessionId.value,
            courseId: selectedExistingCourseId.value,
            chapterId: selectedExistingChapterId.value,
          })
        : await getExistingCursor({
            sessionId: pendingExistingLessonSessionId.value,
            courseId: selectedExistingCourseId.value,
            chapterId: selectedExistingChapterId.value,
          });

    const { courseId: targetCourseId, chapterId: targetChapterId, resourceId: targetResourceId } =
      resolvePrepareTargetFromResponse(result, {
        courseId: selectedExistingCourseId.value,
        chapterId: selectedExistingChapterId.value,
      });

    closeExistingLessonCourseDialog();
    await router.push({
      path: `/system/course/prepare/${targetCourseId}`,
      query: {
        chapterId: targetChapterId,
        tab: "resource",
        ...(targetResourceId ? { resourceId: targetResourceId } : {}),
      },
    });
  } catch (error: unknown) {
    ElMessage.error(
      error instanceof Error && error.message
        ? error.message
        : pendingExistingOpenType.value === "ppt"
          ? "打开已有课件失败"
          : "打开已有课程失败"
    );
  } finally {
    existingOpenSubmitting.value = false;
  }
};

const closeExerciseLinkCourseDialog = () => {
  showExerciseLinkCourseDialog.value = false;
};

const handleExerciseExternalLinkRequest = async (
  rows: Array<{ courseId: string; chapterId: string }>
) => {
  const activeSessionId = String(pendingExerciseLinkSessionId.value || "").trim();
  if (!activeSessionId) {
    throw new Error("当前会话未生成完成，请稍后再试");
  }
  if (!rows.length) {
    throw new Error("请先选择要关联的章节");
  }

  let resolvedExerciseId = String(exerciseLinkExerciseId.value || "").trim();
  for (const item of rows) {
    const result = await getExerciseExistingCursor({
      sessionId: activeSessionId,
      courseId: item.courseId,
      chapterId: item.chapterId,
    } as any);
    const currentExerciseId = resolveExerciseIdFromResponse(result);
    if (currentExerciseId) {
      resolvedExerciseId = currentExerciseId;
    }
  }

  if (!resolvedExerciseId) {
    throw new Error("未获取到习题ID，无法刷新关联列表");
  }
  exerciseLinkExerciseId.value = resolvedExerciseId;
  exerciseLinkRefreshToken.value = Date.now();
  return {
    exerciseId: resolvedExerciseId,
  };
};

const resolveOpenUrlFromResponse = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return "";
  const row = payload as Record<string, unknown>;
  const candidate = [
    row.url,
    row.openUrl,
    row.editorUrl,
    row.courseUrl,
    row.link,
    row.data && typeof row.data === "object" ? (row.data as Record<string, unknown>).url : "",
  ]
    .map((item) => String(item || "").trim())
    .find(Boolean);
  return candidate || "";
};

const resolveExerciseIdFromResponse = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return "";
  const row = payload as Record<string, unknown>;
  const data =
    row.data && typeof row.data === "object"
      ? (row.data as Record<string, unknown>)
      : row;
  const rowMap = createLowerCaseMap(data);
  return String(pickByKeys(rowMap, ["exerciseId", "resourceId", "id"]) || "").trim();
};

const openGeneratedTarget = (payload: unknown, fallbackText: string) => {
  const targetUrl = resolveOpenUrlFromResponse(payload);
  if (targetUrl) {
    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank");
    }
    return;
  }
  ElMessage.success(fallbackText);
};

const handleGenerateFileAction = async (
  action:
    | "lesson-existing"
    | "lesson-new"
    | "ppt-existing"
    | "ppt-new"
    | "exercise-existing"
    | "exercise-new"
) => {
  activeGenerateFileMenuMessageId.value = "";
  const activeSessionId = String(chatSessionId.value || "").trim();
  if (!activeSessionId) {
    ElMessage.warning("当前会话未生成完成，请稍后再试");
    return;
  }

  try {
    if (action === "lesson-existing") {
      await openExistingLessonCourseDialog(activeSessionId, "lesson");
      return;
    }
    if (action === "ppt-existing") {
      await openExistingLessonCourseDialog(activeSessionId, "ppt");
      return;
    }
    if (action === "exercise-existing") {
      if (pendingExerciseLinkSessionId.value !== activeSessionId) {
        pendingExerciseLinkSessionId.value = activeSessionId;
        exerciseLinkExerciseId.value = "";
        exerciseLinkRefreshToken.value = 0;
      }
      showExerciseLinkCourseDialog.value = true;
      return;
    }
    if (action === "lesson-new") {
      const result = await getNewCursor({ sessionId: activeSessionId });
      const { courseId, chapterId, resourceId } = resolvePrepareTargetFromResponse(result);
      if (courseId) {
        await router.push({
          path: `/system/course/prepare/${courseId}`,
          query: {
            tab: "resource",
            ...(chapterId ? { chapterId } : {}),
            ...(resourceId ? { resourceId } : {}),
          },
        });
        return;
      }
      openGeneratedTarget(result, "教案已生成");
      return;
    }
    if (action === "ppt-new") {
      const result = await getPptNewCursor({ sessionId: activeSessionId });
      const { courseId, chapterId, resourceId } = resolvePrepareTargetFromResponse(result);
      if (courseId) {
        await router.push({
          path: `/system/course/prepare/${courseId}`,
          query: {
            tab: "resource",
            ...(chapterId ? { chapterId } : {}),
            ...(resourceId ? { resourceId } : {}),
          },
        });
        return;
      }
      openGeneratedTarget(result, "课件已生成");
      return;
    }
    const result = await getExerciseNewCursorEdit({ sessionId: activeSessionId });
    const exerciseId = resolveExerciseIdFromResponse(result);
    if (exerciseId) {
      await router.push(`/taskmanagement/add-custom-question?id=${exerciseId}`);
      return;
    }
    openGeneratedTarget(result, "习题已生成");
  } catch (error: unknown) {
    ElMessage.error(
      error instanceof Error && error.message ? error.message : "生成文件失败"
    );
  }
};

const resolveLessonUnitType = () => {
  if (lessonPlanForm.unitType === "unit") {
    const periodText = lessonPlanForm.periodCount ? `（共${lessonPlanForm.periodCount}课时）` : "";
    return `指针对某一主题或单元，在连续多课时中开展的系统化教学活动设计${periodText}。`;
  }
  return "指针对某一教学内容，在一节课约40-45 分钟左右进行的教学活动设计。";
};

const resolveLessonPlanStandardList = () => {
  if (Array.isArray(lessonPlanForm.standard)) {
    return lessonPlanForm.standard.map((item) => String(item || "").trim()).filter(Boolean);
  }
  const singleValue = String((lessonPlanForm.standard as any) || "").trim();
  return singleValue ? [singleValue] : [];
};

const resolveExerciseQuestionTypePayload = () => ({
  singleChoice: Number(lessonPlanForm.singleCount || 0),
  multipleChoice: Number(lessonPlanForm.multipleCount || 0),
  trueOrFalse: Number(lessonPlanForm.judgeCount || 0),
  fillInBlank: Number(lessonPlanForm.blankCount || 0),
  matching: Number(lessonPlanForm.connectCount || 0),
});

const resolveExerciseQuestionTypeText = () => {
  const list = [
    `单选题 ${lessonPlanForm.singleCount || 0} 道`,
    `多选题 ${lessonPlanForm.multipleCount || 0} 道`,
    `判断题 ${lessonPlanForm.judgeCount || 0} 道`,
    `填空题 ${lessonPlanForm.blankCount || 0} 道`,
    `连线题 ${lessonPlanForm.connectCount || 0} 道`,
  ];
  return list.join("；");
};

const resolveExerciseQuestionKindText = () =>
  lessonPlanForm.questionKind === "knowledge" ? "知识类" : "情境类";

const buildLessonPlanFormData = () => {
  const basePayload = {
    grade: shouldShowLessonGrade.value ? lessonPlanForm.grade : "",
    topic: lessonPlanForm.subject.trim(),
    situation: lessonPlanForm.scenario,
    tool: lessonPlanForm.teachTool,
    hardware: lessonPlanForm.hardware,
    special: lessonPlanForm.specialRequirement.trim(),
    standard: resolveLessonPlanStandardList().join("、"),
  };

  if (lessonPlanSessionType.value === 4) {
    const questionTypes = resolveExerciseQuestionTypePayload();
    return JSON.stringify({
      questionCategory: resolveExerciseQuestionKindText(),
      situation: lessonPlanForm.scenario,
      grade: shouldShowLessonGrade.value ? lessonPlanForm.grade : "",
      topic: lessonPlanForm.subject.trim(),
      questionTypes,
      tool: lessonPlanForm.teachTool,
      special: lessonPlanForm.specialRequirement.trim(),
      standard: resolveLessonPlanStandardList().join("、"),
    });
  }

  return JSON.stringify({
    ...basePayload,
    ...(lessonPlanSessionType.value === 2 ? { unitType: resolveLessonUnitType() } : {}),
  });
};

const resolveLessonPlanMessageTitle = () =>
  lessonPlanSessionType.value === 3
    ? "生成课件PPT"
    : lessonPlanSessionType.value === 4
      ? "生成习题"
      : "生成教案";
const resolveLessonPlanMessageSubjectLabel = () =>
  lessonPlanSessionType.value === 3 ? "课件主题" : "课程主题";
const resolveLessonPlanCompleteText = () =>
  lessonPlanSessionType.value === 3
    ? "课件生成完成。"
    : lessonPlanSessionType.value === 4
      ? "习题生成完成。"
      : "教案生成完成。";

const buildLessonPlanMessage = () => {
  const standardText = resolveLessonPlanStandardList().join("、");
  const specialText = lessonPlanForm.specialRequirement.trim();
  const lines = [resolveLessonPlanMessageTitle()];
  if (lessonPlanSessionType.value === 4) {
    lines.push(`题目种类：${resolveExerciseQuestionKindText()}`);
    lines.push(`情境选择：${lessonPlanForm.scenario || "未填写"}`);
    if (shouldShowLessonGrade.value) {
      lines.push(`选择年级：${lessonPlanForm.grade || "未填写"}`);
    }
    lines.push(`课程主题：${lessonPlanForm.subject.trim() || "未填写"}`);
    lines.push(`题目类型及数量：${resolveExerciseQuestionTypeText()}`);
  } else {
    lines.push(`年级：${lessonPlanForm.grade}`);
    lines.push(`${resolveLessonPlanMessageSubjectLabel()}：${lessonPlanForm.subject.trim()}`);
  }
  lines.push(`特殊需求：${specialText || "无"}`);
  lines.push(`依据的标准：${standardText || "无"}`);
  return lines.join("\n");
};

const buildAnalysisTargetGroupList = () => {
  const classSelectedSet = new Set(analysisForm.selectedClassIds);
  return analysisGradeOptions.value
    .map((grade) => {
      const selectedClasses = grade.classes.filter((item) => classSelectedSet.has(item.value));
      if (!selectedClasses.length) return null;
      return {
        gradeId: grade.value,
        gradeName: grade.label,
        classIds: selectedClasses.map((item) => item.value),
        classNames: selectedClasses.map((item) => item.label),
      };
    })
    .filter((item): item is NonNullable<typeof item> => !!item);
};

const buildAnalysisTargetText = () => {
  if (analysisIsAllSelected.value) return "全部年级";
  const groups = buildAnalysisTargetGroupList();
  if (!groups.length) return "未选择";
  return groups
    .map((item) => {
      const classText = item.classNames.join("、");
      return classText ? `${item.gradeName}（${classText}）` : item.gradeName;
    })
    .join("；");
};

const buildAnalysisFormData = () => {
  const [startDate, endDate] = analysisForm.dateRange || ["", ""];
  return JSON.stringify({
    startDate: String(startDate || "").trim(),
    endDate: String(endDate || "").trim(),
    classIds: analysisForm.selectedClassIds
      .map((item) => {
        const normalized = String(item || "").trim();
        if (!normalized) return "";
        const numericValue = Number(normalized);
        return Number.isNaN(numericValue) ? normalized : numericValue;
      })
      .filter((item) => item !== ""),
    special: analysisForm.specialRequirement.trim(),
  });
};

const buildAnalysisRequestMessage = () => {
  const specialText = analysisForm.specialRequirement.trim();
  return specialText || "生成学情分析报告";
};

const unwrapCodeAssistantCodeText = (value: string) => {
  const text = String(value || "").trim();
  if (!text) return "";
  const fencedMatch = text.match(/^```[\w-]*\s*\r?\n([\s\S]*?)\r?\n```$/);
  return fencedMatch ? fencedMatch[1].trim() : text;
};

const resolveCodeAssistantInputPayload = () => {
  const normalizedInput = codeAssistantForm.requirement.trim();

  if (codeAssistantForm.mode === "generate") {
    return {
      requirement: normalizedInput,
      code: "",
      error: "",
    };
  }

  if (codeAssistantForm.mode === "explain") {
    return {
      requirement: "请解释以下代码",
      code: unwrapCodeAssistantCodeText(codeAssistantForm.code.trim() || normalizedInput),
      error: "",
    };
  }

  const rawDebugText = codeAssistantForm.code.trim() || normalizedInput;
  const errorMatch = rawDebugText.match(/(?:^|\n)\s*(?:报错|错误|error)\s*[:：]\s*([^\n]+)\s*$/i);
  const parsedError = codeAssistantForm.error.trim() || String(errorMatch?.[1] || "").trim();
  const parsedCode = unwrapCodeAssistantCodeText(
    errorMatch ? rawDebugText.slice(0, errorMatch.index).trim() : rawDebugText
  );

  return {
    requirement: "分析报错原因并给出修复后的代码",
    code: parsedCode,
    error: parsedError,
  };
};

const buildCodeAssistantFormData = () => {
  const payload = resolveCodeAssistantInputPayload();
  if (codeAssistantForm.mode === "generate") {
    return JSON.stringify({
      mode: "generate",
      requirement: payload.requirement,
    });
  }

  if (codeAssistantForm.mode === "explain") {
    return JSON.stringify({
      mode: "explain",
      code: payload.code,
      requirement: payload.requirement,
    });
  }

  return JSON.stringify({
    mode: "debug",
    code: payload.code,
    error: payload.error,
    requirement: payload.requirement,
  });
};

const buildCodeAssistantUserPrompt = () => {
  const payload = resolveCodeAssistantInputPayload();
  const lines = [
    `类型：${
      CODE_ASSISTANT_MODE_OPTIONS.find((item) => item.value === codeAssistantForm.mode)?.title ||
      "代码助手"
    }`,
  ];

  if (codeAssistantForm.mode === "generate") {
    lines.push(`需求：${payload.requirement}`);
    return lines.join("\n");
  }

  const codeLineCount = payload.code.split(/\r?\n/).filter(Boolean).length;
  lines.push(`代码：已提交${codeLineCount || 1}行`);

  if (codeAssistantForm.mode === "debug") {
    lines.push(`报错：${payload.error}`);
  }

  return lines.join("\n");
};

const buildCodeAssistantFallbackReply = () => {
  if (codeAssistantForm.mode === "generate") {
    return "代码生成完成，你可以继续让我补充注释、优化复杂度或改成其他语言。";
  }
  if (codeAssistantForm.mode === "debug") {
    return "代码纠错完成，你可以继续让我解释修复点或补充测试用例。";
  }
  return "代码解释完成，你可以继续让我把这段代码改写成更易懂的版本。";
};

const handleImageGenerate = async () => {
  const prompt = imageForm.prompt.trim();
  if (!prompt) {
    ElMessage.warning("请先输入描述");
    return;
  }
  if (chatRequesting.value || imageGenerating.value) {
    ElMessage.warning("上一条任务还在处理中");
    return;
  }
  if (isAiUploading.value) {
    ElMessage.warning("参考图上传中，请稍后");
    return;
  }

  const imageRefUrl = String(
    imageForm.referenceImageUrl ||
      (aiUploadFile.value && isAiImageFile(aiUploadFile.value.name)
        ? extractAiUploadFileUrl(aiUploadFile.value)
        : "")
  ).trim();
  if (aiUploadFile.value && isAiImageFile(aiUploadFile.value.name) && !imageRefUrl) {
    ElMessage.warning("参考图上传结果缺少地址，请重新上传");
    return;
  }

  chatSessionType.value = 7;
  lessonPlanChatActive.value = false;
  imageGenerating.value = true;
  startImageGenerateProgress();
  chatRequesting.value = true;
  isStreamingReply.value = true;
  const abortController = new AbortController();
  activeChatAbortController.value = abortController;
  imageResultUrls.value = [];
  imageResultText.value = "";

  try {
    const payload: Record<string, unknown> = {
      sessionId: chatSessionId.value || null,
      sessionType: 7,
      message: prompt,
      formData: JSON.stringify({
        size: imageForm.size,
        ...(imageRefUrl ? { referenceImageUrl: imageRefUrl } : {}),
      }),
      enableThinking: false,
    };

    const response = await createAiChat(payload as any, {
      signal: abortController.signal,
      onChunk: (chunkPayload, fullText) => {
        if (!chatSessionId.value) {
          const chunkSessionId = resolveAiChatSessionId(chunkPayload);
          if (chunkSessionId) {
            chatSessionId.value = chunkSessionId;
          }
        }
        if (pendingStopSessionRequest.value) {
          const activeSessionId = String(chatSessionId.value || "").trim();
          if (activeSessionId) {
            triggerStopSessionRequest(activeSessionId);
            activeChatAbortController.value?.abort();
          }
          return;
        }
        const chunkUrls = extractAiImageUrls(chunkPayload);
        if (chunkUrls.length) {
          mergeImageResultUrls(chunkUrls);
        }
        if (fullText) {
          imageResultText.value = fullText;
        }
      },
    });

    const resolvedSessionId = resolveAiChatSessionId(response);
    if (resolvedSessionId) {
      chatSessionId.value = resolvedSessionId;
    }
    const finalUrls = extractAiImageUrls(response);
    if (finalUrls.length) {
      mergeImageResultUrls(finalUrls);
    }
    imageResultText.value =
      String((response as Record<string, unknown>)?.text || "").trim() ||
      extractAiChatText(response) ||
      imageResultText.value;
    if (!imageResultUrls.value.length && imageResultText.value) {
      const textUrls = extractAiImageUrlsFromText(imageResultText.value);
      if (textUrls.length) {
        mergeImageResultUrls(textUrls);
      }
    }
    if (!imageResultUrls.value.length) {
      ElMessage.warning("暂未解析到图片地址，请稍后在历史记录中查看");
    }
    await fetchAiSessionList(true);
    if (chatSessionId.value) {
      const matchedHistory = historyList.value.find(
        (item) => String(item.sessionId || "").trim() === String(chatSessionId.value || "").trim()
      );
      if (matchedHistory?.id) {
        activeHistoryId.value = matchedHistory.id;
      }
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? String(error.message || "").trim() : String(error || "").trim();
    if (errorMessage) {
      ElMessage.error(errorMessage);
    }
  } finally {
    stopImageGenerateProgress({ complete: true });
    pendingStopSessionRequest.value = false;
    clearPendingStopFallbackTimer();
    activeChatAbortController.value = null;
    imageGenerating.value = false;
    chatRequesting.value = false;
    isStreamingReply.value = false;
    persistAiChatState();
  }
};

const handleCodeAssistantSubmit = async () => {
  const payload = resolveCodeAssistantInputPayload();
  if (codeAssistantForm.mode === "generate" && !payload.requirement) {
    ElMessage.warning("请填写代码需求");
    return;
  }
  if (codeAssistantForm.mode === "explain" && !payload.code) {
    ElMessage.warning("请填写待解释代码");
    return;
  }
  if (codeAssistantForm.mode === "debug" && !payload.code) {
    ElMessage.warning("请填写待排查代码");
    return;
  }
  if (codeAssistantForm.mode === "debug" && !payload.error) {
    ElMessage.warning("请在最后一行补充报错，例如：报错：NullPointerException");
    return;
  }
  if (chatRequesting.value) {
    ElMessage.warning("上一条消息还在处理中");
    return;
  }

  const userPrompt = buildCodeAssistantUserPrompt();
  const pendingAssistantMessage = reactive<AiChatMessage>({
    id: createAiChatMessageId(),
    role: "assistant",
    content: "正在思考中...",
    file: null,
    pending: true,
    stopped: false,
    thinkingMode: false,
    thinkingCollapsed: false,
  });
  const abortController = new AbortController();

  isLessonPlanMode.value = false;
  isAnalysisMode.value = false;
  isImageMode.value = false;
  isChatMode.value = true;
  lessonPlanChatActive.value = false;
  chatSessionType.value = 5;
  chatRequesting.value = true;
  isStreamingReply.value = true;
  activeGenerateFileMenuMessageId.value = "";

  chatMessages.value.push(
    reactive<AiChatMessage>({
      id: createAiChatMessageId(),
      role: "user",
      content: userPrompt,
      file: null,
    }),
    pendingAssistantMessage
  );
  activeChatAbortController.value = abortController;
  scrollChatToBottom();

  try {
    const payload: Record<string, unknown> = {
      sessionId: chatSessionId.value || null,
      sessionType: 5,
      message: userPrompt,
      formData: buildCodeAssistantFormData(),
      enableThinking: false,
    };

    const response = await createAiChat(payload as any, {
      signal: abortController.signal,
      onChunk: (_payload, fullText) => {
        if (!chatSessionId.value) {
          const chunkSessionId = resolveAiChatSessionId(_payload);
          if (chunkSessionId) {
            chatSessionId.value = chunkSessionId;
          }
        }
        if (pendingStopSessionRequest.value) {
          const activeSessionId = String(chatSessionId.value || "").trim();
          if (activeSessionId) {
            triggerStopSessionRequest(activeSessionId);
            activeChatAbortController.value?.abort();
          }
          return;
        }
        if (!fullText) return;
        pendingAssistantMessage.content = fullText;
        scrollChatToBottom();
      },
    });

    const resolvedText =
      String((response as Record<string, unknown>)?.text || "").trim() ||
      extractAiChatText(response) ||
      buildCodeAssistantFallbackReply();
    const resolvedSuggestions = extractAiSuggestions(response);
    const resolvedSessionId = resolveAiChatSessionId(response);
    if (resolvedSessionId) {
      chatSessionId.value = resolvedSessionId;
    }
    if (pendingStopSessionRequest.value && chatSessionId.value) {
      triggerStopSessionRequest(chatSessionId.value);
    }

    pendingAssistantMessage.content = resolvedText;
    pendingAssistantMessage.suggestions = resolvedSuggestions;
    pendingAssistantMessage.pending = false;
    pendingAssistantMessage.stopped = false;
    void fetchAiSessionList(true);
  } catch (error: any) {
    const isAbortError = error instanceof DOMException && error.name === "AbortError";
    if (isAbortError) {
      if (
        !pendingAssistantMessage.content ||
        pendingAssistantMessage.content === "正在思考中..."
      ) {
        pendingAssistantMessage.content = "已停止当前回答，你可以点击“重新回答”继续。";
      }
      pendingAssistantMessage.stopped = true;
      pendingAssistantMessage.thinkingCollapsed = false;
    } else {
      pendingAssistantMessage.content =
        error instanceof Error && error.message
          ? `当前未获取到接口回复，已为你保留本次提问。\n\n${error.message}`
          : "当前未获取到接口回复，已为你保留本次提问。";
      pendingAssistantMessage.stopped = false;
    }
    pendingAssistantMessage.pending = false;
  } finally {
    pendingStopSessionRequest.value = false;
    clearPendingStopFallbackTimer();
    chatRequesting.value = false;
    isStreamingReply.value = false;
    activeChatAbortController.value = null;
    scrollChatToBottom();
  }
};

const buildAnalysisMessage = () => {
  const [startDate, endDate] = analysisForm.dateRange || ["", ""];
  const lines = ["生成学情分析报告"];
  lines.push(`日期范围：${startDate || "未填写"} 至 ${endDate || "未填写"}`);
  lines.push(`年级和班级：${buildAnalysisTargetText()}`);
  lines.push(`特殊需求：${analysisForm.specialRequirement.trim() || "无"}`);
  return lines.join("\n");
};

const handleAnalysisSubmit = async () => {
  const [startDate, endDate] = analysisForm.dateRange || ["", ""];
  if (!String(startDate || "").trim() || !String(endDate || "").trim()) {
    ElMessage.warning("请选择日期范围");
    return;
  }
  if (!analysisForm.selectedClassIds.length) {
    ElMessage.warning("请选择年级和班级");
    return;
  }
  if (chatRequesting.value) {
    ElMessage.warning("上一条消息还在处理中");
    return;
  }

  const userPrompt = buildAnalysisMessage();
  const requestMessage = buildAnalysisRequestMessage();
  const pendingAssistantMessage = reactive<AiChatMessage>({
    id: createAiChatMessageId(),
    role: "assistant",
    content: "正在思考中...",
    file: null,
    pending: true,
    stopped: false,
    thinkingMode: false,
    thinkingCollapsed: false,
  });
  const abortController = new AbortController();

  isAnalysisMode.value = false;
  isLessonPlanMode.value = false;
  isImageMode.value = false;
  isChatMode.value = true;
  lessonPlanChatActive.value = false;
  chatSessionType.value = 6;
  chatRequesting.value = true;
  isStreamingReply.value = true;
  activeGenerateFileMenuMessageId.value = "";
  closeAnalysisTargetDropdown();

  chatMessages.value.push(
    reactive<AiChatMessage>({
      id: createAiChatMessageId(),
      role: "user",
      content: userPrompt,
      file: null,
    }),
    pendingAssistantMessage
  );
  activeChatAbortController.value = abortController;
  scrollChatToBottom();

  try {
    const payload: Record<string, unknown> = {
      sessionId: chatSessionId.value || null,
      sessionType: 6,
      message: requestMessage,
      formData: buildAnalysisFormData(),
      enableThinking: false,
    };

    const response = await createAiChat(payload as any, {
      signal: abortController.signal,
      onChunk: (_payload, fullText) => {
        if (!chatSessionId.value) {
          const chunkSessionId = resolveAiChatSessionId(_payload);
          if (chunkSessionId) {
            chatSessionId.value = chunkSessionId;
          }
        }
        if (pendingStopSessionRequest.value) {
          const activeSessionId = String(chatSessionId.value || "").trim();
          if (activeSessionId) {
            triggerStopSessionRequest(activeSessionId);
            activeChatAbortController.value?.abort();
          }
          return;
        }
        if (!fullText) return;
        pendingAssistantMessage.content = fullText;
        scrollChatToBottom();
      },
    });

    const resolvedText =
      String((response as Record<string, unknown>)?.text || "").trim() ||
      extractAiChatText(response) ||
      "学情分析生成完成。";
    const resolvedSuggestions = extractAiSuggestions(response);
    const resolvedSessionId = resolveAiChatSessionId(response);
    if (resolvedSessionId) {
      chatSessionId.value = resolvedSessionId;
    }
    if (pendingStopSessionRequest.value && chatSessionId.value) {
      triggerStopSessionRequest(chatSessionId.value);
    }

    pendingAssistantMessage.content = resolvedText;
    pendingAssistantMessage.suggestions = resolvedSuggestions;
    pendingAssistantMessage.pending = false;
    pendingAssistantMessage.stopped = false;
    void fetchAiSessionList(true);
  } catch (error: any) {
    const isAbortError = error instanceof DOMException && error.name === "AbortError";
    if (isAbortError) {
      if (
        !pendingAssistantMessage.content ||
        pendingAssistantMessage.content === "正在思考中..."
      ) {
        pendingAssistantMessage.content = "已停止当前回答，你可以点击“重新回答”继续。";
      }
      pendingAssistantMessage.stopped = true;
      pendingAssistantMessage.thinkingCollapsed = false;
    } else {
      pendingAssistantMessage.content =
        error instanceof Error && error.message
          ? `当前未获取到接口回复，已为你保留本次提问。\n\n${error.message}`
          : "当前未获取到接口回复，已为你保留本次提问。";
      pendingAssistantMessage.stopped = false;
    }
    pendingAssistantMessage.pending = false;
  } finally {
    pendingStopSessionRequest.value = false;
    clearPendingStopFallbackTimer();
    chatRequesting.value = false;
    isStreamingReply.value = false;
    activeChatAbortController.value = null;
    scrollChatToBottom();
  }
};

const handleLessonPlanSubmit = async () => {
  if (lessonPlanSessionType.value === 4) {
    if (!lessonPlanForm.questionKind) {
      ElMessage.warning("请选择题目种类");
      return;
    }
    if (!lessonPlanForm.scenario) {
      ElMessage.warning("请选择情境");
      return;
    }
    if (shouldShowLessonGrade.value && !lessonPlanForm.grade) {
      ElMessage.warning("请选择年级");
      return;
    }
    if (lessonPlanQuestionCountTotal.value <= 0) {
      ElMessage.warning("请至少设置一道题目");
      return;
    }
  } else {
    if (!lessonPlanForm.grade) {
      ElMessage.warning("请选择年级");
      return;
    }
    if (lessonPlanSessionType.value === 2 && lessonPlanForm.unitType === "unit" && !lessonPlanForm.periodCount) {
      ElMessage.warning("请选择课时数");
      return;
    }
  }
  if (!lessonPlanForm.subject.trim()) {
    ElMessage.warning("请填写课程主题");
    return;
  }
  if (chatRequesting.value) {
    ElMessage.warning("上一条消息还在处理中");
    return;
  }

  const normalizedFile = aiUploadFile.value ? { ...aiUploadFile.value } : null;
  const userPrompt = buildLessonPlanMessage();
  const pendingAssistantMessage = reactive<AiChatMessage>({
    id: createAiChatMessageId(),
    role: "assistant",
    content: "正在思考中...",
    file: null,
    pending: true,
    stopped: false,
    thinkingMode: false,
    thinkingCollapsed: false,
  });
  const abortController = new AbortController();

  isLessonPlanMode.value = false;
  isAnalysisMode.value = false;
  isImageMode.value = false;
  isChatMode.value = true;
  lessonPlanChatActive.value = true;
  lessonChatEditorExpanded.value = false;
  lessonRequirementTipsVisible.value = false;
  lessonStandardDropdownVisible.value = false;
  chatRequesting.value = true;
  isStreamingReply.value = true;

  chatMessages.value.push(
    reactive<AiChatMessage>({
      id: createAiChatMessageId(),
      role: "user",
      content: userPrompt,
      file: normalizedFile,
    }),
    pendingAssistantMessage
  );
  activeChatAbortController.value = abortController;
  scrollChatToBottom();

  try {
    const payload: Record<string, unknown> = {
      sessionId: chatSessionId.value || null,
      sessionType: lessonPlanSessionType.value,
      message: buildLessonPlanMessage(),
      formData: buildLessonPlanFormData(),
      enableThinking: false,
    };

    if (normalizedFile?.ossId) {
      let resolvedFileType = String(normalizedFile.fileType || "").trim();
      if (!resolvedFileType) {
        try {
          const latestFileInfo = await getFiles(normalizedFile.ossId);
          resolvedFileType = extractAiUploadFileType(latestFileInfo);
        } catch {
          // 忽略查询失败，按无附件类型继续兜底
        }
      }
      if (resolvedFileType) {
        payload.fileRefs = [
          {
            fileId: normalizedFile.ossId,
            fileType: resolvedFileType,
          },
        ];
      } else {
        ElMessage.warning("附件还在处理中，本次先按无附件生成");
      }
    }

    const response = await createAiChat(payload as any, {
      signal: abortController.signal,
      onChunk: (_payload, fullText) => {
        if (!chatSessionId.value) {
          const chunkSessionId = resolveAiChatSessionId(_payload);
          if (chunkSessionId) {
            chatSessionId.value = chunkSessionId;
          }
        }
        if (pendingStopSessionRequest.value) {
          const activeSessionId = String(chatSessionId.value || "").trim();
          if (activeSessionId) {
            triggerStopSessionRequest(activeSessionId);
            activeChatAbortController.value?.abort();
          }
          return;
        }
        if (!fullText) return;
        pendingAssistantMessage.content = fullText;
        scrollChatToBottom();
      },
    });

    const resolvedText =
      String((response as Record<string, unknown>)?.text || "").trim() ||
      extractAiChatText(response) ||
      resolveLessonPlanCompleteText();
    const resolvedSuggestions = extractAiSuggestions(response);
    const resolvedSessionId = resolveAiChatSessionId(response);
    if (resolvedSessionId) {
      chatSessionId.value = resolvedSessionId;
    }
    if (pendingStopSessionRequest.value && chatSessionId.value) {
      triggerStopSessionRequest(chatSessionId.value);
    }

    pendingAssistantMessage.content = resolvedText;
    pendingAssistantMessage.suggestions = resolvedSuggestions;
    pendingAssistantMessage.pending = false;
    pendingAssistantMessage.stopped = false;
    void fetchAiSessionList(true);
  } catch (error: any) {
    const isAbortError = error instanceof DOMException && error.name === "AbortError";
    if (isAbortError) {
      if (
        !pendingAssistantMessage.content ||
        pendingAssistantMessage.content === "正在思考中..."
      ) {
        pendingAssistantMessage.content = "已停止当前回答，你可以点击“重新回答”继续。";
      }
      pendingAssistantMessage.stopped = true;
      pendingAssistantMessage.thinkingCollapsed = false;
    } else {
      pendingAssistantMessage.content =
        error instanceof Error && error.message
          ? `当前未获取到接口回复，已为你保留本次提问。\n\n${error.message}`
          : "当前未获取到接口回复，已为你保留本次提问。";
      pendingAssistantMessage.stopped = false;
    }
    pendingAssistantMessage.pending = false;
  } finally {
    pendingStopSessionRequest.value = false;
    clearPendingStopFallbackTimer();
    chatRequesting.value = false;
    isStreamingReply.value = false;
    activeChatAbortController.value = null;
    scrollChatToBottom();
  }
};

const sendAiChatMessage = async (messageText: string, file: AiUploadFile | null) => {
  const normalizedText = messageText.trim();
  const normalizedFile = file ? { ...file } : null;
  const shouldKeepLessonPlanChat = lessonPlanChatActive.value;
  const effectiveSessionType = shouldKeepLessonPlanChat
    ? lessonPlanSessionType.value
    : chatSessionType.value;

  if (!normalizedText && !normalizedFile) {
    ElMessage.warning("请输入问题或上传一个附件");
    return;
  }

  if (chatRequesting.value) {
    ElMessage.warning("上一条消息还在处理中");
    return;
  }

  isChatMode.value = true;
  lessonPlanChatActive.value = shouldKeepLessonPlanChat;
  lessonChatEditorExpanded.value = false;
  activeGenerateFileMenuMessageId.value = "";
  chatRequesting.value = true;
  isStreamingReply.value = true;

  const userMessage = reactive<AiChatMessage>({
    id: createAiChatMessageId(),
    role: "user",
    content: normalizedText || "请帮我分析这个附件",
    file: normalizedFile,
  });
  const pendingAssistantMessage = reactive<AiChatMessage>({
    id: createAiChatMessageId(),
    role: "assistant",
    content: "正在思考中...",
    file: null,
    pending: true,
    stopped: false,
    thinkingMode: enableDeepThinking.value,
    thinkingCollapsed: false,
  });
  const abortController = new AbortController();

  chatMessages.value.push(userMessage, pendingAssistantMessage);
  activeChatAbortController.value = abortController;
  searchKeyword.value = "";
  clearAiUploadFile();
  scrollChatToBottom();

  try {
    const payload: Record<string, unknown> = {
      sessionId: chatSessionId.value || null,
      sessionType: effectiveSessionType,
      message: normalizedText || "请帮我分析这个附件",
      enableThinking: enableDeepThinking.value,
    };

    if (normalizedFile?.ossId) {
      if (!normalizedFile.fileType) {
        throw new Error("附件类型识别失败，请重新上传附件");
      }
      payload.fileRefs = [
        {
          fileId: normalizedFile.ossId,
          fileType: normalizedFile.fileType,
        },
      ];
    }

    const response = await createAiChat(payload as any, {
      signal: abortController.signal,
      onChunk: (_payload, fullText) => {
        // 实时从 chunk 中解析 sessionId，以便中途停止时能通知后端
        if (!chatSessionId.value) {
          const chunkSessionId = resolveAiChatSessionId(_payload);
          if (chunkSessionId) {
            chatSessionId.value = chunkSessionId;
          }
        }
        if (pendingStopSessionRequest.value) {
          const activeSessionId = String(chatSessionId.value || "").trim();
          if (activeSessionId) {
            triggerStopSessionRequest(activeSessionId);
            activeChatAbortController.value?.abort();
          }
          return;
        }
        if (!fullText) return;
        pendingAssistantMessage.content = fullText;
        scrollChatToBottom();
      },
    });
    const resolvedText =
      String((response as Record<string, unknown>)?.text || "").trim() ||
      extractAiChatText(response) ||
      buildAiFallbackReply(normalizedText, normalizedFile);
    const resolvedSuggestions = extractAiSuggestions(response);
    const resolvedSessionId = resolveAiChatSessionId(response);
    if (resolvedSessionId) {
      chatSessionId.value = resolvedSessionId;
    }
    if (pendingStopSessionRequest.value && chatSessionId.value) {
      triggerStopSessionRequest(chatSessionId.value);
    }

    pendingAssistantMessage.content = resolvedText;
    pendingAssistantMessage.suggestions = resolvedSuggestions;
    pendingAssistantMessage.pending = false;
    pendingAssistantMessage.stopped = false;
    void fetchAiSessionList(true);
  } catch (error: any) {
    const isAbortError = error instanceof DOMException && error.name === "AbortError";
    if (isAbortError) {
      if (
        !pendingAssistantMessage.content ||
        pendingAssistantMessage.content === "正在思考中..."
      ) {
        pendingAssistantMessage.content = "已停止当前回答，你可以点击“重新回答”继续。";
      }
      pendingAssistantMessage.stopped = true;
      pendingAssistantMessage.thinkingCollapsed = false;
    } else {
      pendingAssistantMessage.content =
        error instanceof Error && error.message
          ? `当前未获取到接口回复，已为你保留本次提问。\n\n${buildAiFallbackReply(
              normalizedText,
              normalizedFile
            )}`
          : buildAiFallbackReply(normalizedText, normalizedFile);
      pendingAssistantMessage.stopped = false;
    }
    pendingAssistantMessage.pending = false;
  } finally {
    pendingStopSessionRequest.value = false;
    clearPendingStopFallbackTimer();
    chatRequesting.value = false;
    isStreamingReply.value = false;
    activeChatAbortController.value = null;
    scrollChatToBottom();
  }
};

const normalizeAiQuotaDetail = (rows: unknown): QuotaDetailItem[] => {
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return list
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const rowMap = createLowerCaseMap(item);
      return {
        quotaName: toCountText(
          pickByKeys(rowMap, ["quotaName", "name", "label", "quotaCode"])
        ),
        userLimit: toCountText(pickByKeys(rowMap, ["userLimit"])),
      };
    });
};

const historyTypes = computed(() => {
  return Array.from(new Set(historyList.value.map((item) => item.type)));
});

const historyTypeOptions = computed(() => {
  return AI_SESSION_TYPE_OPTIONS;
});

const filteredHistoryList = computed(() => {
  if (!historyTypeFilter.value) return historyList.value;
  return historyList.value.filter((item) => item.sessionType === historyTypeFilter.value);
});

const shouldUseImageHistoryList = () => {
  if (historyTypeFilter.value === "7") return true;
  return !historyTypeFilter.value && isImageMode.value;
};

watch(historyTypeFilter, async () => {
  await fetchAiSessionList(true);
  activeHistoryId.value = filteredHistoryList.value[0]?.id || "";
});

const handleSearch = async () => {
  await sendAiChatMessage(searchKeyword.value, aiUploadFile.value);
};

const resetAiUploadState = () => {
  aiUploadStatus.value = "idle";
  aiUploadProgressPercent.value = 0;
  aiUploadErrorMessage.value = "";
  resetImageRefChunkUpload();
};

const triggerAiUpload = () => {
  if (isAiUploading.value) return;
  aiUploadInputRef.value?.click();
};

const triggerLessonUpload = () => {
  if (isAiUploading.value) return;
  lessonUploadInputRef.value?.click();
};

const triggerImageUpload = () => {
  if (isAiUploading.value) return;
  imageUploadInputRef.value?.click();
};

const clearAiUploadFile = () => {
  const currentUploadFile = aiUploadFile.value;
  if (currentUploadFile) {
    revokeBlobPreviewUrl(currentUploadFile.previewUrl);
    revokeBlobPreviewUrl(currentUploadFile.url);
  }
  aiUploadFile.value = null;
  if (isImageMode.value) {
    imageForm.referenceImageUrl = "";
  }
  resetAiUploadState();
  aiUploadAbortController.value = null;
  if (aiUploadInputRef.value) {
    aiUploadInputRef.value.value = "";
  }
  if (lessonUploadInputRef.value) {
    lessonUploadInputRef.value.value = "";
  }
  if (imageUploadInputRef.value) {
    imageUploadInputRef.value.value = "";
  }
};

const handleRemoveAiUploadFile = async () => {
  if (isAiUploading.value) {
    await handleCancelAiUpload();
    return;
  }
  const currentFile = aiUploadFile.value;
  if (!currentFile) return;
  const fileId = String(currentFile.ossId || currentFile.url || "").trim();
  if (fileId) {
    try {
      await deleteFiles(fileId);
    } catch (error: unknown) {
      ElMessage.error(
        error instanceof Error && error.message ? error.message : "删除文件失败"
      );
      return;
    }
  }
  clearAiUploadFile();
};

const handleCancelAiUpload = async () => {
  if (!isAiUploading.value) return;
  if (isImageMode.value && isImageRefChunkUploading.value) {
    try {
      await cancelImageRefChunkUpload();
    } catch (error: any) {
      ElMessage.error(error?.message || "取消上传失败");
      return;
    }
  } else {
    aiUploadAbortController.value?.abort();
  }
  clearAiUploadFile();
  ElMessage.success("取消上传成功");
};

const handleAiFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];

  if (!file) return;

  if (isAiUploading.value) {
    ElMessage.warning("文件上传中，请先取消上传");
    if (input) {
      input.value = "";
    }
    return;
  }

  const validationMessage = validateAiUploadFile(file);
  if (validationMessage) {
    ElMessage.warning(validationMessage);
    if (input) {
      input.value = "";
    }
    return;
  }

  resetAiUploadState();
  aiUploadStatus.value = "uploading";
  aiUploadProgressPercent.value = 20;
  aiUploadFile.value = {
    name: file.name,
    ossId: "",
    url: "",
    fileType: "",
    size: file.size,
  };
  const abortController = new AbortController();
  aiUploadAbortController.value = abortController;

  try {
    const result = await uploadAI(file, { signal: abortController.signal });
    if (!result) {
      clearAiUploadFile();
      return;
    }

    const fileId = extractAiUploadFileId(result);
    aiUploadProgressPercent.value = 60;
    const fileInfo = await waitForAiFileActive(fileId, abortController);
    const fileType = extractAiUploadFileType(result) || extractAiUploadFileType(fileInfo);

    aiUploadProgressPercent.value = 100;
    aiUploadStatus.value = "success";
    if (isImageMode.value) {
      imageForm.referenceImageUrl = String((result as any).url || (fileInfo as any)?.url || "").trim();
    }
    aiUploadFile.value = {
      name: String(
        (result as any).fileName || (fileInfo as any)?.fileName || file.name || ""
      ),
      ossId: String(
        (result as any).ossId ||
          (fileInfo as any)?.ossId ||
          (fileInfo as any)?.fileId ||
          fileId ||
          ""
      ),
      url: String((result as any).url || (fileInfo as any)?.url || ""),
      fileType: String(fileType || ""),
      size: file.size,
    };
    ElMessage.success("上传成功");
  } catch (error: any) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
    aiUploadStatus.value = "error";
    aiUploadProgressPercent.value = 0;
    aiUploadErrorMessage.value = error?.message || "上传失败";
    if (isImageMode.value) {
      imageForm.referenceImageUrl = "";
    }
    aiUploadFile.value = {
      name: file.name,
      ossId: "",
      url: "",
      fileType: "",
      size: file.size,
    };
    ElMessage.error(aiUploadErrorMessage.value);
  } finally {
    aiUploadAbortController.value = null;
    if (input) {
      input.value = "";
    }
  }
};

const fetchQuotaDetail = async (force = false) => {
  if (quotaLoading.value) return;

  const shouldUseCache =
    !force && quotaFetchedAt.value > 0 && Date.now() - quotaFetchedAt.value < 60 * 1000;
  if (shouldUseCache) return;

  quotaLoading.value = true;
  quotaError.value = "";

  try {
    const rows = await getAiQuotaDetail();
    quotaDetail.value = normalizeAiQuotaDetail(rows);
    quotaFetchedAt.value = Date.now();
  } catch (error: unknown) {
    quotaError.value =
      error instanceof Error && error.message ? error.message : "额度详情获取失败";
  } finally {
    quotaLoading.value = false;
  }
};

const fetchHotAiQuestionList = async () => {
  try {
    const rows = await getHotAiList();
    const normalizedList = normalizeHotAiQuestionList(rows);
    if (normalizedList.length > 0) {
      hotQuestions.value = normalizedList;
    }
  } catch {
    // 热门话题接口失败时保留本地兜底，避免首页空白
  }
};

const ensureHotAiQuestionList = () => {
  if (isImageMode.value || hotQuestions.value.length > 0) return;
  void fetchHotAiQuestionList();
};

const fetchAiSessionList = async (silent = false) => {
  if (historyLoading.value) return;

  historyLoading.value = true;
  historyError.value = "";

  try {
    if (shouldUseImageHistoryList()) {
      const rows = await getImageList();
      historyList.value = normalizeAiImageHistoryList(rows);
      imageRecentHistoryList.value = normalizeAiImagePreviewList(rows).slice(0, 12);
    } else {
      const rows = await getAiSessions(historyTypeFilter.value || undefined);
      historyList.value = normalizeAiSessionList(rows);
    }
    if (
      !activeHistoryId.value ||
      !historyList.value.some((item) => item.id === activeHistoryId.value)
    ) {
      activeHistoryId.value = historyList.value[0]?.id || "";
    }
  } catch (error: unknown) {
    historyError.value =
      error instanceof Error && error.message ? error.message : "历史记录获取失败";
    if (!silent) {
      ElMessage.error(historyError.value);
    }
  } finally {
    historyLoading.value = false;
  }
};

const handleQuotaMouseEnter = () => {
  showQuotaDetail.value = true;
  void fetchQuotaDetail();
};

const handleQuotaMouseLeave = () => {
  showQuotaDetail.value = false;
};

const handleOpenHistory = async () => {
  if (isImageMode.value && route.path.startsWith("/system/opt/ai-painting")) {
    const nextQuery: Record<string, string> = {};
    const sessionId = String(chatSessionId.value || activeHistoryId.value || "").trim();
    if (sessionId) {
      nextQuery.aiSessionId = sessionId;
    }
    await router.push({
      path: "/system/opt/ai-painting-history",
      query: nextQuery,
    });
    return;
  }
  showHistoryPanel.value = true;
  await fetchAiSessionList(true);
  const firstId = filteredHistoryList.value[0]?.id || historyList.value[0]?.id || "";
  activeHistoryId.value = firstId;
};

const closeHistoryPanel = () => {
  showHistoryPanel.value = false;
};

const handleDeleteHistory = async (id: string) => {
  if (!id || historyDeletingId.value) return;

  historyDeletingId.value = id;
  try {
    await deleteSession(id);
    historyList.value = historyList.value.filter((item) => item.id !== id);
    if (chatSessionId.value === id) {
      chatSessionId.value = "";
    }
    if (activeHistoryId.value === id) {
      activeHistoryId.value = filteredHistoryList.value[0]?.id || "";
    }
    ElMessage.success({
      message: "删除成功",
      zIndex: 3001,
    });
  } catch (error: unknown) {
    ElMessage.error(
      error instanceof Error && error.message ? error.message : "历史会话删除失败"
    );
  } finally {
    historyDeletingId.value = "";
  }
};

const handleSelectHistory = async (item: HistoryRecord) => {
  activeHistoryId.value = item.id;
  showHistoryPanel.value = false;
  const isImageHistory = isImageHistoryRecord(item);
  if (isImageHistory) {
    const targetSessionId = String(item.sessionId || item.id || "").trim();
    if (!targetSessionId) return;
    openImageView({ keepDraft: true });
    activeHistoryId.value = targetSessionId;
    chatSessionType.value = 7;
    chatSessionId.value = targetSessionId;
    searchKeyword.value = "";
    clearAiUploadFile();
    void syncAiRouteState();
    await hydrateImageModeByHistoryId(targetSessionId, targetSessionId);
    persistAiChatState();
    return;
  }
  isLessonPlanMode.value = false;
  isAnalysisMode.value = false;
  isImageMode.value = false;
  isChatMode.value = true;
  chatSessionType.value = resolveChatSessionTypeByHistory(item);
  const isLessonHistory = isLessonPlanHistoryRecord(item);
  lessonPlanSessionType.value = isLessonHistory
    ? resolveLessonPlanSessionTypeByHistory(item)
    : 2;
  lessonPlanChatActive.value = isLessonHistory;
  lessonChatEditorExpanded.value = false;
  activeGenerateFileMenuMessageId.value = "";
  chatSessionId.value = item.sessionId;
  void syncAiRouteState();
  searchKeyword.value = "";
  clearAiUploadFile();
  chatRequesting.value = true;
  chatMessages.value = [
    {
      id: createAiChatMessageId(),
      role: "assistant",
      content: "正在加载历史会话...",
      file: null,
      pending: true,
    },
  ];

  try {
    const rows = await getSessions(item.id);
    const resolvedSessionId = resolveSessionIdFromSessionRows(rows, item.sessionId);
    if (resolvedSessionId) {
      chatSessionId.value = resolvedSessionId;
    }
    if (isLessonHistory) {
      const parsedLessonForm = parseLessonPlanFormFromSessionRows(rows);
      if (parsedLessonForm) {
        lessonPlanForm.grade = parsedLessonForm.grade;
        lessonPlanForm.unitType = parsedLessonForm.unitType;
        lessonPlanForm.questionKind = parsedLessonForm.questionKind;
        lessonPlanForm.singleCount = parsedLessonForm.singleCount;
        lessonPlanForm.multipleCount = parsedLessonForm.multipleCount;
        lessonPlanForm.judgeCount = parsedLessonForm.judgeCount;
        lessonPlanForm.blankCount = parsedLessonForm.blankCount;
        lessonPlanForm.connectCount = parsedLessonForm.connectCount;
        lessonPlanForm.periodCount = parsedLessonForm.periodCount;
        lessonPlanForm.subject = parsedLessonForm.subject;
        lessonPlanForm.scenario = parsedLessonForm.scenario;
        lessonPlanForm.teachTool = parsedLessonForm.teachTool;
        lessonPlanForm.hardware = parsedLessonForm.hardware;
        lessonPlanForm.specialRequirement = parsedLessonForm.specialRequirement;
        lessonPlanForm.standard = parsedLessonForm.standard;
      }
    }
    if (chatSessionType.value === 5) {
      const parsedCodeAssistantForm = parseCodeAssistantFormFromSessionRows(rows);
      if (parsedCodeAssistantForm) {
        codeAssistantForm.mode = parsedCodeAssistantForm.mode;
        codeAssistantForm.language = parsedCodeAssistantForm.language;
        codeAssistantForm.requirement = parsedCodeAssistantForm.requirement;
        codeAssistantForm.code = parsedCodeAssistantForm.code;
        codeAssistantForm.error = parsedCodeAssistantForm.error;
      }
    }
    if (chatSessionType.value === 6) {
      const parsedAnalysisForm = parseAnalysisFormFromSessionRows(rows);
      if (parsedAnalysisForm) {
        const [startDate, endDate] = parsedAnalysisForm.dateRange;
        analysisForm.dateRange = [startDate || ANALYSIS_DATE_START, endDate || todayText];
        analysisForm.selectedGradeIds = [...parsedAnalysisForm.selectedGradeIds];
        analysisForm.selectedClassIds = [...parsedAnalysisForm.selectedClassIds];
        analysisForm.specialRequirement = parsedAnalysisForm.specialRequirement;
        void loadAnalysisGradeOptions();
      }
    }
    const normalizedMessages = normalizeAiSessionMessages(rows);
    chatMessages.value = normalizedMessages.length
      ? normalizedMessages
      : buildHistoryFallbackMessages(item);
  } catch (error: unknown) {
    chatMessages.value = buildHistoryFallbackMessages(item);
    ElMessage.error(
      error instanceof Error && error.message ? error.message : "历史会话加载失败"
    );
  } finally {
    chatRequesting.value = false;
    scrollChatToBottom();
    persistAiChatState();
  }
};

const handleImageRefFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];

  if (!file) return;

  if (isAiUploading.value) {
    ElMessage.warning("文件上传中，请先取消上传");
    if (input) {
      input.value = "";
    }
    return;
  }

  const extension = getAiUploadExtension(file.name);
  if (!AI_UPLOAD_IMAGE_EXTENSIONS.includes(extension)) {
    ElMessage.warning("参考图仅支持图片格式");
    if (input) {
      input.value = "";
    }
    return;
  }

  const validationMessage = validateAiUploadFile(file);
  if (validationMessage) {
    ElMessage.warning(validationMessage);
    if (input) {
      input.value = "";
    }
    return;
  }

  clearAiUploadFile();
  resetAiUploadState();
  aiUploadStatus.value = "uploading";
  aiUploadProgressPercent.value = 0;
  aiUploadFile.value = {
    name: file.name,
    ossId: "",
    url: "",
    previewUrl: typeof window !== "undefined" ? URL.createObjectURL(file) : "",
    fileType: "image",
    size: file.size,
  };
  const stopSyncProgress = watch(
    imageRefChunkProgressPercent,
    (value) => {
      aiUploadProgressPercent.value = Math.max(0, Math.min(99, Number(value || 0)));
    },
    { immediate: true }
  );

  try {
    const result = await startImageRefChunkUpload(file);
    if (!result) {
      clearAiUploadFile();
      return;
    }

    const uploadedUrl = extractAiUploadFileUrl(result);
    const uploadedOssId = extractAiUploadOssId(result);
    if (!uploadedUrl) {
      throw new Error("上传成功，但未返回图片地址");
    }

    aiUploadProgressPercent.value = 100;
    aiUploadStatus.value = "success";
    aiUploadErrorMessage.value = "";
    imageForm.referenceImageUrl = uploadedUrl;
    aiUploadFile.value = {
      name: file.name,
      ossId: uploadedOssId,
      url: uploadedUrl,
      previewUrl: uploadedUrl,
      fileType: "image",
      size: file.size,
    };
  } catch (error: any) {
    aiUploadStatus.value = "error";
    aiUploadProgressPercent.value = 0;
    aiUploadErrorMessage.value =
      imageRefChunkErrorMessage.value || error?.message || "上传失败";
    imageForm.referenceImageUrl = "";
    aiUploadFile.value = {
      name: file.name,
      ossId: "",
      url: "",
      previewUrl: typeof window !== "undefined" ? URL.createObjectURL(file) : "",
      fileType: "image",
      size: file.size,
    };
    ElMessage.error(aiUploadErrorMessage.value);
  } finally {
    stopSyncProgress();
    resetImageRefChunkUpload();
    if (input) {
      input.value = "";
    }
  }
};

const handleHotQuestion = (question: string) => {
  searchKeyword.value = question;
};

const handleChatSuggestion = async (question: string) => {
  searchKeyword.value = question;
  await handleSearch();
};

const resolveMessageSuggestions = (item: AiChatMessage) => {
  if (item.suggestions && item.suggestions.length > 0) {
    return item.suggestions;
  }
  return chatSuggestionList.value;
};

const copyChatMessage = async (content: string) => {
  const text = getFormattedChatCopyText(content);
  if (!text) return;

  try {
    const html = getFormattedChatCopyHtml(content);
    if (html && navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        }),
      ]);
    } else {
      await navigator.clipboard.writeText(text);
    }
    ElMessage.success("复制成功");
  } catch {
    ElMessage.error("复制失败");
  }
};

const handleMarkdownActionClick = async (event: MouseEvent) => {
  const target = event.target instanceof Element ? event.target : null;
  const copyButton = target?.closest(".ai-chat-message__code-copy");
  if (!copyButton) {
    return;
  }

  const wrapper = copyButton.closest(".ai-chat-message__code-block-wrap");
  const codeElement = wrapper?.querySelector("code");
  const codeText = codeElement?.textContent?.trim() || "";
  if (!codeText) {
    return;
  }

  try {
    await navigator.clipboard.writeText(codeText);
    ElMessage.success("代码已复制");
  } catch {
    ElMessage.error("复制失败");
  }
};

const retryLatestQuestion = async () => {
  if (chatSessionType.value === 5) {
    await handleCodeAssistantSubmit();
    return;
  }
  const latestUserMessage = [...chatMessages.value]
    .reverse()
    .find((item) => item.role === "user");
  if (!latestUserMessage) return;
  await sendAiChatMessage(latestUserMessage.content, latestUserMessage.file);
};

watch(
  [
    isChatMode,
    isLessonPlanMode,
    isAnalysisMode,
    isImageMode,
    activeHistoryId,
    chatSessionType,
    lessonPlanSessionType,
    lessonPlanChatActive,
    lessonChatEditorExpanded,
    chatSessionId,
    enableDeepThinking,
    searchKeyword,
    chatRequesting,
    isStreamingReply,
  ],
  () => {
    persistAiChatState();
    void syncAiRouteState();
  }
);

watch(
  chatMessages,
  () => {
    persistAiChatState();
    nextTick(() => {
      updateChatListScrollMetrics();
    });
  },
  { deep: true }
);

watch(
  lessonPlanForm,
  () => {
    persistAiChatState();
  },
  { deep: true }
);

watch(
  analysisForm,
  () => {
    persistAiChatState();
  },
  { deep: true }
);

watch(
  imageForm,
  () => {
    persistAiChatState();
  },
  { deep: true }
);

watch(
  [imageResultUrls, imageResultText],
  () => {
    persistAiChatState();
  },
  { deep: true }
);

const handleFeatureClick = (item: AssistantCard) => {
  if (item.key === "lesson-plan") {
    openLessonPlanView(2);
    return;
  }
  if (item.key === "ppt") {
    openLessonPlanView(3);
    return;
  }
  if (item.key === "quiz") {
    openLessonPlanView(4);
    return;
  }
  if (item.key === "code") {
    startNewChat(5);
    return;
  }
  if (item.key === "analysis") {
    openAnalysisView();
    return;
  }
  if (item.key === "image") {
    openImageView();
    return;
  }
  if (item.key === "immersive") {
    if (import.meta.client) {
      window.location.href = "https://open.maic.chat/";
    }
    return;
  }
  ElMessage.info(`${item.title} 功能即将上线`);
};

onMounted(() => {
  void (async () => {
    const restoredByRoute = await restoreAiChatStateByRoute();
    if (!restoredByRoute) {
      restoreAiChatState();
    }
    if (isImageMode.value) {
      await fetchAiSessionList(true);
    } else if (!restoredByRoute && !activeHistoryId.value) {
      await fetchAiSessionList(true);
    }
    ensureHotAiQuestionList();
  })();
  syncAIAssistantLayoutWidth();
  void fetchQuotaDetail();
  nextTick(() => {
    updateChatListScrollMetrics();
  });
  window.addEventListener("beforeunload", persistAiChatState);
  window.addEventListener("pagehide", persistAiChatState);
  window.addEventListener("resize", syncAIAssistantLayoutWidth);
  document.addEventListener("click", handleLessonRequirementTipsOutsideClick);
  window.visualViewport?.addEventListener("resize", syncAIAssistantLayoutWidth);
  if (window.ResizeObserver && aiAssistantPageRef.value) {
    aiAssistantPageResizeObserver = new window.ResizeObserver(() => {
      syncAIAssistantLayoutWidth();
    });
    aiAssistantPageResizeObserver.observe(aiAssistantPageRef.value);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  stopImageGenerateProgress();
  if (isAiUploading.value) {
    if (isImageRefChunkUploading.value) {
      void cancelImageRefChunkUpload().catch(() => undefined);
    }
    aiUploadAbortController.value?.abort();
  }
  clearPendingStopFallbackTimer();
  persistAiChatState();
  window.removeEventListener("beforeunload", persistAiChatState);
  window.removeEventListener("pagehide", persistAiChatState);
  window.removeEventListener("resize", syncAIAssistantLayoutWidth);
  document.removeEventListener("click", handleLessonRequirementTipsOutsideClick);
  window.visualViewport?.removeEventListener("resize", syncAIAssistantLayoutWidth);
  aiAssistantPageResizeObserver?.disconnect();
  aiAssistantPageResizeObserver = null;
});
</script>

<style scoped>
@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 100 700;
  src: url("/fonts/material-symbols-outlined-full.ttf") format("truetype");
  font-display: block;
}

.material-symbols-outlined {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  overflow: hidden;
  font-family: "Material Symbols Outlined", sans-serif !important;
  font-style: normal;
  font-weight: 400;
  font-size: 1.5rem;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  flex-shrink: 0;
  user-select: none;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  font-feature-settings: "liga";
  -webkit-font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
}

.ai-assistant-page {
  --ai-assistant-min-width: 1280px;
  --ai-assistant-max-width: 1920px;
  --ai-assistant-shell-width: var(--ai-assistant-min-width);
  --ai-assistant-sidebar-width: 256px;
  --ai-assistant-ui-scale: 0.9;
  min-width: var(--ai-assistant-min-width);
  height: 100vh;
  background: #f7f9fc;
  overflow-x: auto;
  overflow-y: auto;
}

.ai-assistant-page::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.ai-assistant-page::-webkit-scrollbar-track {
  background: rgba(220, 227, 233, 0.45);
}

.ai-assistant-page::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(79, 117, 255, 0.32);
}

.ai-assistant-container {
  display: grid;
  grid-template-columns: var(--ai-assistant-sidebar-width) minmax(0, 1fr);
  width: min(
    var(--ai-assistant-max-width),
    max(var(--ai-assistant-min-width), var(--ai-assistant-shell-width))
  );
  min-width: var(--ai-assistant-min-width);
  min-height: 100vh;
  margin: 0 auto;
  background: #f7f9fc;
}

.ai-assistant-content {
  min-width: 0;
}

.ai-assistant-shell {
  width: calc(100% / var(--ai-assistant-ui-scale));
  padding: 30px clamp(20px, 2.4vw, 40px) 42px;
  transform: scale(var(--ai-assistant-ui-scale));
  transform-origin: top left;
}

.ai-assistant-shell--chat {
  height: calc((100vh - 24px) / var(--ai-assistant-ui-scale));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-assistant-shell--code {
  height: calc((100vh - 24px) / var(--ai-assistant-ui-scale));
  overflow: hidden;
}

.ai-assistant-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 22px;
  font-size: 12px;
  font-weight: 600;
}

.ai-assistant-breadcrumb__entry {
  border: none;
  padding: 0;
  background: transparent;
  color: #95a0ab;
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease;
}

.ai-assistant-breadcrumb__entry:hover {
  color: #4f75ff;
}

.ai-assistant-breadcrumb__icon {
  color: #c2c9d1;
  font-size: 14px;
}

.ai-assistant-breadcrumb__current {
  color: #4f75ff;
}

.ai-assistant-hero {
  margin-bottom: 18px;
}

.ai-assistant-hero__title {
  margin: 0;
  color: #21262c;
  font-size: clamp(34px, 2.5vw, 44px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.ai-assistant-hero__desc-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
}

.ai-assistant-hero__desc {
  margin: 0;
  color: #5d6771;
  font-size: 18px;
  font-weight: 500;
}

.ai-assistant-hero__line {
  height: 1px;
  flex: 1;
  background: linear-gradient(90deg, rgba(220, 227, 233, 0.9), rgba(220, 227, 233, 0));
}

.ai-assistant-chat {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.ai-assistant-chat.is-code-assistant {
  gap: 18px;
  padding: 24px;
  border: 1px solid rgba(225, 232, 244, 0.92);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(248, 250, 255, 0.92) 100%);
  box-shadow: 0 18px 42px rgba(95, 121, 255, 0.08);
  overflow: hidden;
}

.ai-code-assistant-layout {
  flex-shrink: 0;
  margin-bottom: 0;
}

.ai-assistant-search__head--code {
  margin-bottom: 12px;
}

.ai-assistant-chat__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.ai-assistant-chat__title-wrap {
  min-width: 0;
}

.ai-assistant-chat__title {
  margin: 0;
  color: #1f2937;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.2;
}

.ai-assistant-chat__subtitle {
  margin: 8px 0 0;
  color: #7b8794;
  font-size: 14px;
  font-weight: 500;
}

.ai-assistant-chat__new {
  flex-shrink: 0;
  height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(79, 117, 255, 0.24);
  border-radius: 999px;
  background: #ffffff;
  color: #3159e3;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.ai-assistant-chat__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ai-assistant-chat__list.is-code-assistant {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 10px 0 0;
}

.ai-chat-lesson-editor {
  margin-bottom: 12px;
  border: 1px solid #d5e1f2;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(30, 64, 175, 0.08);
  overflow: hidden;
}

.ai-chat-lesson-editor__head {
  width: 100%;
  border: none;
  background: #f6f9ff;
  color: #1f2937;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.ai-chat-lesson-editor__head-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ai-chat-lesson-editor__head-left .material-symbols-outlined {
  color: #7c6be8;
}

.ai-chat-lesson-editor__head strong {
  font-size: 16px;
  font-weight: 700;
}

.ai-chat-lesson-editor__body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: min(430px, 48vh);
  overflow: hidden;
}

.ai-chat-lesson-editor__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-chat-lesson-editor__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ai-chat-lesson-editor__row {
  margin: 0;
}

.ai-chat-lesson-editor__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #1f2b3d;
  font-size: 14px;
  font-weight: 600;
}

.ai-chat-lesson-editor__radio-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ai-chat-lesson-editor__actions {
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  margin-top: 2px;
  padding: 10px 0 2px;
  border-top: 1px solid #eef3fb;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, #ffffff 32%);
}

.ai-chat-lesson-editor__submit {
  min-width: 132px;
  height: 42px;
}

.ai-assistant-lesson {
  margin-bottom: 18px;
  border-radius: 20px;
  border: 1px solid #d8e4f7;
  background: linear-gradient(180deg, #f8fbff 0%, #f5f9ff 100%);
  padding: 20px;
}

.ai-assistant-lesson__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.ai-assistant-lesson__header-actions {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.ai-assistant-lesson__back {
  border: 1px solid #cbdcf7;
  border-radius: 999px;
  background: #ffffff;
  height: 32px;
  padding: 0 10px;
  color: #3159e3;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.ai-assistant-lesson__title {
  margin: 0;
  color: #1f2937;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
}

.ai-assistant-lesson__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-assistant-lesson__label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #1f2b3d;
  font-size: 14px;
  font-weight: 600;
}

.ai-assistant-lesson__label-with-helper {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.ai-assistant-lesson__helper-entry {
  border: none;
  background: transparent;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
}

.ai-assistant-lesson__helper-entry .material-symbols-outlined {
  font-size: 16px;
}

.ai-assistant-lesson__helper-panel {
  position: absolute;
  left: 120px;
  top: -8px;
  z-index: 12;
  width: min(760px, calc(100vw - 280px));
  border: 1px solid #dde6f5;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-assistant-lesson__helper-title {
  margin: 0 0 4px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 700;
}

.ai-assistant-lesson__helper-item {
  border: none;
  background: transparent;
  width: 100%;
  padding: 4px 0;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  text-align: left;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
}

.ai-assistant-lesson__helper-item:hover {
  color: #1d4ed8;
}

.ai-assistant-lesson__helper-item-text {
  flex: 1;
}

.ai-assistant-lesson__helper-item .material-symbols-outlined {
  margin-top: 2px;
  font-size: 14px;
}

.ai-assistant-lesson__label-text {
  color: #1f2b3d;
  font-size: 14px;
  font-weight: 600;
}

.ai-assistant-lesson__required {
  color: #ff4d4f;
  font-weight: 700;
  margin-right: 4px;
}

.ai-assistant-lesson__input {
  width: 100%;
  border: 1px solid #cedcf0;
  border-radius: 12px;
  background: #ffffff;
  color: #1f2b3d;
  font-size: 14px;
  line-height: 1.5;
  padding: 10px 12px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-assistant-lesson__input:focus {
  border-color: #4f75ff;
  box-shadow: 0 0 0 3px rgba(79, 117, 255, 0.12);
}

.ai-assistant-lesson__mselect {
  width: 100%;
}

:deep(.ai-assistant-lesson__mselect > div) {
  height: 44px !important;
  border-radius: 12px !important;
  border: 1px solid #cedcf0 !important;
  background: #ffffff !important;
  box-shadow: none !important;
  padding: 0 12px !important;
}

:deep(.ai-assistant-lesson__mselect > div:hover) {
  border-color: #4f75ff !important;
}

:deep(.ai-assistant-lesson__mselect > div.ring-2) {
  border-color: #4f75ff !important;
  box-shadow: 0 0 0 3px rgba(79, 117, 255, 0.14) !important;
}

:deep(.ai-assistant-lesson__mselect > div > span) {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #1f2c41 !important;
}

:deep(.ai-assistant-lesson__mselect > div > span.text-gray-400) {
  color: #9aa8bc !important;
  font-weight: 500 !important;
}

.ai-assistant-lesson__multi-select {
  position: relative;
}

.ai-assistant-lesson__multi-trigger {
  width: 100%;
  min-height: 44px;
  border: 1px solid #cedcf0;
  border-radius: 12px;
  background: #ffffff;
  padding: 6px 12px;
  color: #1f2c41;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-assistant-lesson__multi-trigger:hover {
  border-color: #4f75ff;
}

.ai-assistant-lesson__multi-trigger.is-open {
  border-color: #4f75ff;
  box-shadow: 0 0 0 3px rgba(79, 117, 255, 0.14);
}

.ai-assistant-lesson__multi-values {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-assistant-lesson__multi-tag {
  max-width: 100%;
  border: 1px solid #d6e2f5;
  border-radius: 8px;
  background: #f7faff;
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ai-assistant-lesson__multi-tag > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-assistant-lesson__multi-tag-remove {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #7b8794;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.ai-assistant-lesson__multi-tag-remove .material-symbols-outlined {
  font-size: 12px;
}

.ai-assistant-lesson__multi-placeholder {
  flex: 1;
  text-align: left;
  color: #9aa8bc;
  font-size: 14px;
  font-weight: 500;
}

.ai-assistant-lesson__multi-arrow {
  color: #8ea0ba;
  font-size: 18px;
}

.ai-assistant-lesson__multi-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 6px);
  z-index: 14;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #d6e2f4;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(30, 64, 175, 0.14);
  padding: 8px 0;
}

.ai-assistant-lesson__multi-option {
  width: calc(100% - 12px);
  margin: 0 6px 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  text-align: left;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.ai-assistant-lesson__multi-option:hover {
  background: rgba(79, 117, 255, 0.1);
  color: #3159e3;
}

.ai-assistant-lesson__multi-option.is-selected {
  background: rgba(79, 117, 255, 0.14);
  color: #3159e3;
}

.ai-assistant-lesson__multi-option .material-symbols-outlined {
  font-size: 16px;
}

.ai-assistant-lesson-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-assistant-lesson-upload__label-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ai-assistant-lesson-upload__label {
  color: #1f2b3d;
  font-size: 14px;
  font-weight: 600;
}

.ai-assistant-lesson-upload__help {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #8ea0ba;
  cursor: default;
}

.ai-assistant-lesson-upload__help .material-symbols-outlined {
  font-size: 16px;
}

.ai-assistant-lesson-upload__button {
  width: 46px;
  height: 46px;
  border: 1px solid #dce4f0;
  border-radius: 10px;
  background: #f8fbff;
  color: #9ba8bd;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ai-assistant-lesson-upload__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-assistant-upload__tooltip--lesson {
  min-width: 330px;
  max-width: 420px;
  left: -10px;
  bottom: calc(100% + 12px);
}

.ai-assistant-upload__tooltip--lesson::after {
  left: 20px;
}

.ai-assistant-lesson-upload__help:hover .ai-assistant-upload__tooltip--lesson {
  opacity: 1;
  visibility: visible;
}

.ai-assistant-lesson__row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.ai-assistant-lesson__question-types {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.ai-assistant-lesson__question-item {
  min-height: 42px;
  border: 1px solid #dce4f2;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.ai-assistant-lesson__question-chip {
  height: 100%;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #22344a;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.ai-assistant-lesson__question-item--single .ai-assistant-lesson__question-chip {
  background: #e8ecff;
}

.ai-assistant-lesson__question-item--multiple .ai-assistant-lesson__question-chip {
  background: #ece9ff;
}

.ai-assistant-lesson__question-item--judge .ai-assistant-lesson__question-chip {
  background: #f2e8ff;
}

.ai-assistant-lesson__question-item--blank .ai-assistant-lesson__question-chip {
  background: #e8f4ff;
}

.ai-assistant-lesson__question-item--connect .ai-assistant-lesson__question-chip {
  background: #fff1df;
}

.ai-assistant-lesson__question-count-select {
  width: 100%;
}

:deep(.ai-assistant-lesson__question-count-select > div) {
  height: 100% !important;
  min-height: 40px !important;
  border: none !important;
  border-left: 1px solid #dce4f2 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 10px !important;
}

:deep(.ai-assistant-lesson__question-count-select > div:hover) {
  border-color: transparent !important;
  border-left-color: #dce4f2 !important;
}

:deep(.ai-assistant-lesson__question-count-select > div.ring-2) {
  border-color: transparent !important;
  border-left-color: #dce4f2 !important;
  box-shadow: none !important;
}

:deep(.ai-assistant-lesson__question-count-select > div > span) {
  font-size: 14px !important;
  font-weight: 700 !important;
}

.ai-assistant-lesson__radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #34495f;
  font-size: 14px;
  font-weight: 500;
}

.ai-assistant-lesson__radio input {
  margin: 0;
}

.ai-assistant-lesson__textarea-wrap {
  position: relative;
}

.ai-assistant-lesson__textarea {
  min-height: 90px;
  resize: vertical;
  padding-bottom: 28px;
}

.ai-assistant-lesson__count {
  position: absolute;
  right: 12px;
  bottom: 8px;
  color: #98a4b5;
  font-size: 12px;
  font-weight: 500;
}

.ai-assistant-lesson__double {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.ai-assistant-lesson__footer {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.ai-assistant-lesson__submit {
  min-width: 180px;
  height: 42px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #4f75ff 0%, #3159e3 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.ai-assistant-lesson__submit:disabled {
  background: #bcc9df;
  cursor: not-allowed;
}

.ai-analysis {
  margin-bottom: 18px;
  border-radius: 20px;
  border: 1px solid #d8e4f7;
  background: linear-gradient(180deg, #f8fbff 0%, #f5f9ff 100%);
  padding: 20px;
}

.ai-analysis__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-analysis__label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #1f2b3d;
  font-size: 14px;
  font-weight: 600;
}

.ai-analysis__date-picker {
  width: 100%;
}

:deep(.ai-analysis__date-picker .m-date-range-trigger) {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid #cedcf0;
}

:deep(.ai-analysis__date-picker .m-date-range-trigger.open) {
  border-color: #4f75ff;
  box-shadow: 0 0 0 3px rgba(79, 117, 255, 0.12);
}

:deep(.ai-analysis__date-picker .m-date-range-input) {
  color: #1f2c41;
  font-size: 14px;
  font-weight: 600;
}

:deep(.ai-analysis__date-picker .m-date-range-input::placeholder) {
  color: #9aa8bc;
  font-weight: 500;
}

:deep(.ai-analysis__date-picker .m-date-range-panel) {
  z-index: 18;
}

.ai-analysis__textarea {
  min-height: 90px;
}

.ai-analysis-target {
  position: relative;
}

.ai-analysis-target__trigger {
  width: 100%;
  min-height: 44px;
  border: 1px solid #cedcf0;
  border-radius: 12px;
  background: #ffffff;
  color: #1f2c41;
  text-align: left;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-analysis-target__trigger:hover {
  border-color: #4f75ff;
}

.ai-analysis-target__trigger.is-open {
  border-color: #4f75ff;
  box-shadow: 0 0 0 3px rgba(79, 117, 255, 0.14);
}

.ai-analysis-target__values {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-analysis-target__tag {
  max-width: 100%;
  border: 1px solid #d6e2f5;
  border-radius: 8px;
  background: #f7faff;
  color: #1f2937;
  font-size: 13px;
  font-weight: 500;
  padding: 2px 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ai-analysis-target__tag-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-analysis-target__tag-remove {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #7b8794;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.ai-analysis-target__tag-remove .material-symbols-outlined {
  font-size: 12px;
}

.ai-analysis-target__placeholder {
  flex: 1;
  color: #9aa8bc;
  font-size: 14px;
  font-weight: 500;
}

.ai-analysis-target__arrow {
  color: #8ea0ba;
  font-size: 18px;
}

.ai-analysis-target__dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 14;
  border: 1px solid #d6e2f4;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(30, 64, 175, 0.14);
  overflow: hidden;
}

.ai-analysis-target__head {
  padding: 10px 12px;
  border-bottom: 1px solid #edf2fb;
}

.ai-analysis-target__check-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.ai-analysis-target__check-row input {
  margin: 0;
  accent-color: #3159e3;
}

.ai-analysis-target__body {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 260px;
  max-height: 320px;
}

.ai-analysis-target__grades {
  border-right: 1px solid #edf2fb;
  padding: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-analysis-target__grade-item {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #334155;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.ai-analysis-target__grade-item:hover {
  background: rgba(79, 117, 255, 0.08);
}

.ai-analysis-target__grade-item.is-active {
  border-color: #d6e4ff;
  background: rgba(79, 117, 255, 0.12);
  color: #3159e3;
}

.ai-analysis-target__classes {
  padding: 8px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-analysis-target__class-item {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #334155;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.ai-analysis-target__class-item:hover {
  background: rgba(79, 117, 255, 0.08);
}

.ai-analysis-target__class-item.is-selected {
  border-color: #d6e4ff;
  background: rgba(79, 117, 255, 0.12);
  color: #3159e3;
}

.ai-analysis-target__status {
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a99b0;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 12px;
}

.ai-image {
  margin-bottom: 18px;
  border-radius: 32px;
  border: 1px solid #e2e8f3;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 30%),
    linear-gradient(180deg, #fbfcff 0%, #f4f7fb 100%);
  padding: 24px;
  box-shadow: 0 18px 44px rgba(148, 163, 184, 0.12);
}

.ai-image__topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.ai-image__topbar .ai-assistant-lesson__header-actions {
  margin-left: auto;
}

.ai-image__content {
  display: grid;
  grid-template-columns: minmax(0, 430px) minmax(0, 1fr);
  gap: 18px;
  height: clamp(520px, calc((100vh - 208px) / var(--ai-assistant-ui-scale)), 620px);
  align-items: stretch;
}

.ai-image__panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
  border: 1px solid #e7edf7;
  border-radius: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 18px 42px rgba(148, 163, 184, 0.12);
  padding: 16px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-image__panel-block {
  border: 1px solid #edf2f7;
  border-radius: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  padding: 12px;
  box-shadow: 0 8px 18px rgba(148, 163, 184, 0.06);
}

.ai-image__block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ai-image__label {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-image__label-text {
  color: #1e293b;
  font-size: 18px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ai-image__label-caption {
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.ai-image__preview {
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 10px;
}

.ai-image__preview-stage {
  min-height: 0;
  width: 100%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.ai-image__empty {
  height: 100%;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  text-align: center;
}

.ai-image__empty-icon {
  font-size: 52px;
  color: #7b8aa6;
}

.ai-image__empty p {
  margin: 0;
  color: #1e293b;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.ai-image__empty small {
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.7;
  max-width: 420px;
}

.ai-image__loading {
  height: 100%;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 0 48px;
  text-align: center;
}

.ai-image__loading-bar {
  width: min(560px, 100%);
  height: 14px;
  border-radius: 999px;
  background: #edf2fb;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(148, 163, 184, 0.16);
}

.ai-image__loading-value {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #7b66ff 0%, #5f73ff 52%, #5db8ff 100%);
  transition: width 0.4s ease;
}

.ai-image__loading-text {
  margin: 0;
  color: #1e293b;
  font-size: 30px;
  font-weight: 800;
}

.ai-image__loading small {
  color: #7f8ea7;
  font-size: 14px;
  font-weight: 600;
}

.ai-image__result-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
}

.ai-image__result-card {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-image__result-main {
  max-width: min(100%, 520px);
  max-height: 100%;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
}

.ai-image__gallery {
  border-top: 1px solid rgba(148, 163, 184, 0.24);
  min-height: 128px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-image__gallery-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.ai-image__gallery-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #9d174d;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ai-image__gallery-title::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #3b82f6;
}

.ai-image__gallery-more {
  border: none;
  background: transparent;
  color: #3558db;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding: 0;
}

.ai-image__gallery-more .material-symbols-outlined {
  font-size: 16px;
}

.ai-image__thumb-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 2px;
  min-height: 92px;
}

.ai-image__thumb-item {
  flex: 0 0 92px;
  width: 92px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.ai-image__thumb {
  display: block;
  flex: 0 0 92px;
  width: 92px;
  height: 92px;
  border-radius: 16px;
  border: 2px solid transparent;
  object-fit: cover;
  cursor: pointer;
  background: #f5f8ff;
  box-shadow: 0 8px 18px rgba(148, 163, 184, 0.1);
}

.ai-image__thumb.is-active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.ai-image__thumb-item.is-active .ai-image__thumb,
.ai-image__thumb-item.is-active .ai-image__thumb-placeholder {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.ai-image__thumb-list--placeholder {
  overflow: hidden;
}

.ai-image__thumb-placeholder {
  flex: 0 0 92px;
  width: 92px;
  height: 92px;
  border-radius: 16px;
  border: 1px dashed #d9e2ef;
  background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c5cfdd;
}

.ai-image__thumb-placeholder .material-symbols-outlined {
  font-size: 22px;
}

.ai-image__textarea-wrap {
  border: 1px solid #d9e4f3;
  border-radius: 32px;
  background: #ffffff;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-image__textarea-wrap:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.ai-image__textarea {
  width: 100%;
  min-height: 88px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #1e293b;
  font-size: 14px;
  line-height: 1.6;
  padding: 0;
  resize: none;
  outline: none;
}

.ai-image__textarea:focus {
  box-shadow: none;
}

.ai-image__prompt-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid #eef3f7;
}

.ai-image__prompt-tag {
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  height: 30px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease,
    border-color 0.2s ease;
}

.ai-image__prompt-tag:hover {
  transform: translateY(-1px);
}

.ai-image__prompt-tag--primary {
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  box-shadow: 0 8px 18px rgba(59, 130, 246, 0.12);
}

.ai-image__prompt-tag--secondary {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  box-shadow: 0 8px 18px rgba(16, 185, 129, 0.12);
}

.ai-image__prompt-tag--ghost {
  border-color: #d8e2f0;
  background: #f8fafc;
  color: #475569;
}

.ai-image__prompt-tag--ghost.is-active {
  border-color: rgba(59, 130, 246, 0.34);
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}

.ai-image__prompt-tag .material-symbols-outlined {
  font-size: 16px;
}

.ai-image__prompt-tag-editor {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ai-image__prompt-tag-input {
  flex: 1 1 220px;
  min-width: 0;
  height: 38px;
  border: 1px solid #d8e2f0;
  border-radius: 999px;
  background: #ffffff;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  padding: 0 14px;
  outline: none;
}

.ai-image__prompt-tag-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.ai-image__prompt-tag-action {
  height: 36px;
  border: 1px solid #d8e2f0;
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  padding: 0 14px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.ai-image__prompt-tag-action:hover {
  transform: translateY(-1px);
}

.ai-image__prompt-tag-action--primary {
  border-color: transparent;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
}

.ai-image__upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-image__upload-body {
  display: flex;
  align-items: stretch;
}

.ai-image__upload-trigger {
  width: 100%;
  min-height: 92px;
  border: 1px dashed #cdd8e8;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  color: #3b82f6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.ai-image__upload-trigger .material-symbols-outlined {
  font-size: 24px;
}

.ai-image__upload-trigger strong {
  color: #1e293b;
  font-size: 13px;
  font-weight: 800;
}

.ai-image__upload-trigger small {
  max-width: 210px;
  color: #94a3b8;
  font-size: 10px;
  line-height: 1.4;
  font-weight: 600;
  text-align: center;
}

.ai-image__upload-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ai-image__upload-trigger:not(:disabled):hover {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 18px 36px rgba(59, 130, 246, 0.12);
  transform: translateY(-1px);
}

.ai-image__upload-card {
  width: 100%;
  border: 1px solid #dbe5f4;
  border-radius: 20px;
  background: #ffffff;
  padding: 12px;
  display: grid;
  grid-template-columns: 60px 1fr auto;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 20px rgba(148, 163, 184, 0.08);
}

.ai-image__upload-preview,
.ai-image__upload-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  background: #f4f8ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ai-image__upload-placeholder .material-symbols-outlined {
  font-size: 28px;
  color: #8fa2bf;
}

.ai-image__upload-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-image__upload-info strong {
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
}

.ai-image__upload-info span {
  color: #8a9ab4;
  font-size: 11px;
  font-weight: 600;
}

.ai-image__upload-remove {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: #f2f6ff;
  color: #607086;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ai-image__upload-remove:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.ai-image__size {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-image__size-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
}

.ai-image__size-item {
  min-height: 60px;
  border: 1px solid #d6e1f1;
  border-radius: 16px;
  background: #ffffff;
  color: #5f6f87;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px 6px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease,
    color 0.2s ease;
}

.ai-image__size-preview {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: #f3f5fb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ai-image__size-shape {
  display: block;
  border-radius: 3px;
  background: #c8cede;
  transition: background-color 0.2s ease;
}

.ai-image__size-name {
  line-height: 1;
}

.ai-image__size-item.is-active {
  border-color: #7b66ff;
  color: #3159e3;
  background: #f9fbff;
  box-shadow: 0 0 0 2px rgba(123, 102, 255, 0.1);
}

.ai-image__size-item.is-active .ai-image__size-preview {
  background: rgba(123, 102, 255, 0.08);
}

.ai-image__size-item.is-active .ai-image__size-shape {
  background: #6175ea;
}

.ai-image__footer {
  margin-top: auto;
  border-top: 1px solid #edf2f7;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-image__submit {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(37, 99, 235, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.ai-image__submit:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 24px 42px rgba(37, 99, 235, 0.24);
}

.ai-image__submit:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.ai-image__quota-text {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

.ai-chat-toolbar {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.ai-chat-scroll-actions {
  position: absolute;
  right: 28px;
  bottom: 72px;
  z-index: 8;
}

.ai-chat-scroll-actions__btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: rgba(241, 246, 255, 0.92);
  color: #5f76a6;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(104, 125, 162, 0.18);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.ai-chat-scroll-actions__btn:hover {
  background: rgba(79, 117, 255, 0.14);
  color: #3159e3;
  transform: translateY(-1px);
}

.ai-chat-toolbar__stop,
.ai-chat-toolbar__retry {
  height: 36px;
  border: none;
  border-radius: 999px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
}

.ai-chat-toolbar__stop {
  background: rgba(121, 139, 173, 0.2);
  color: #34496f;
}

.ai-chat-toolbar__retry {
  background: rgba(79, 117, 255, 0.16);
  color: #3159e3;
}

.ai-chat-message {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.ai-chat-message.is-user {
  justify-content: flex-end;
}

.ai-chat-message__avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-chat-message__avatar.is-assistant {
  background: linear-gradient(180deg, #eef4ff 0%, #dfeaff 100%);
  color: #4f75ff;
}

.ai-chat-message__avatar.is-user {
  background: linear-gradient(180deg, #ecebff 0%, #dde2ff 100%);
  color: #6b7cff;
}

.ai-chat-message__bubble-wrap {
  max-width: min(920px, 78%);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-chat-message.is-user .ai-chat-message__bubble-wrap {
  align-items: flex-end;
}

.ai-chat-message__bubble {
  border-radius: 22px;
  padding: 18px 20px;
  box-shadow: 0 12px 28px rgba(79, 117, 255, 0.08);
}

.ai-chat-message.is-user .ai-chat-message__bubble {
  background: linear-gradient(135deg, #ecebff 0%, #dfe5ff 100%);
  color: #55637b;
}

.ai-chat-message.is-assistant .ai-chat-message__bubble {
  background: #ffffff;
  border: 1px solid #e4ecf7;
  color: #1f2937;
}

.ai-chat-message__text {
  margin: 0;
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.ai-chat-message__markdown {
  color: inherit;
  font-size: 16px;
  line-height: 1.8;
  word-break: break-word;
}

.ai-chat-thinking-card {
  border-radius: 16px;
  border: 1px solid #dfe7f7;
  background: #f8fbff;
  overflow: hidden;
}

.ai-chat-thinking-card__head {
  width: 100%;
  height: 40px;
  border: none;
  background: transparent;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #2f3e5f;
  font-size: 14px;
  font-weight: 700;
}

.ai-chat-thinking-card__head-icon {
  color: #4f75ff;
  font-size: 18px;
}

.ai-chat-thinking-card__head-arrow {
  margin-left: auto;
  color: #617598;
  font-size: 18px;
}

.ai-chat-thinking-card__body {
  border-top: 1px solid #e4ebf8;
  padding: 10px 12px 12px;
}

.ai-chat-thinking-card__loading {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.ai-chat-thinking-card__spinner {
  width: 22px;
  height: 22px;
  border: 2px solid rgba(79, 117, 255, 0.18);
  border-top-color: #4f75ff;
  border-radius: 50%;
  animation: ai-thinking-spin 0.8s linear infinite;
}

.ai-chat-thinking-card__markdown {
  color: #2f3e5f;
  font-size: 15px;
  line-height: 1.75;
}

.ai-chat-thinking-card__markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.ai-chat-message__stopped {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #637795;
  font-size: 14px;
}

.ai-chat-message__stopped-label {
  color: #7f8ea4;
}

.ai-chat-message__retry-stop {
  border: none;
  background: transparent;
  color: #3159e3;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
}

.ai-chat-message__markdown :deep(h1),
.ai-chat-message__markdown :deep(h2),
.ai-chat-message__markdown :deep(h3) {
  margin: 0 0 10px;
  color: #1f2937;
  font-weight: 800;
  line-height: 1.4;
}

.ai-chat-message__markdown :deep(h1) {
  font-size: 22px;
}

.ai-chat-message__markdown :deep(h2) {
  font-size: 19px;
}

.ai-chat-message__markdown :deep(h3) {
  font-size: 17px;
}

.ai-chat-message__markdown :deep(p),
.ai-chat-message__markdown :deep(ul),
.ai-chat-message__markdown :deep(blockquote) {
  margin: 0 0 10px;
}

.ai-chat-message__markdown :deep(ul) {
  padding-left: 20px;
}

.ai-chat-message__markdown :deep(ol) {
  margin: 0 0 10px;
  padding-left: 22px;
}

.ai-chat-message__markdown :deep(li) {
  margin-bottom: 6px;
}

.ai-chat-message__markdown :deep(hr) {
  margin: 14px 0;
  border: none;
  border-top: 1px solid #d9e4f5;
}

.ai-chat-message__markdown :deep(blockquote) {
  padding-left: 12px;
  border-left: 3px solid #c9d7f6;
  color: #4c5d7a;
}

.ai-chat-message__markdown :deep(code) {
  padding: 2px 6px;
  border-radius: 6px;
  background: #eef3fb;
  color: #3159e3;
  font-size: 14px;
  font-family: Consolas, "Courier New", monospace;
}

.ai-chat-message__code-block {
  margin: 0 0 10px;
  border-radius: 14px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px 16px;
  overflow-x: auto;
}

.ai-chat-message__code-block code {
  display: block;
  padding: 0;
  background: transparent;
  color: inherit;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre;
  font-family: Consolas, "Courier New", monospace;
}

.ai-chat-message__code-block-wrap {
  margin: 0 0 10px;
  border-radius: 14px;
  background: #0f172a;
  overflow: hidden;
}

.ai-chat-message__code-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px 0;
}

.ai-chat-message__code-language {
  min-width: 0;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.ai-chat-message__code-language.is-empty {
  visibility: hidden;
}

.ai-chat-message__code-copy {
  flex-shrink: 0;
  border: 1px solid rgba(148, 163, 184, 0.32);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 7px 12px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.ai-chat-message__code-copy:hover {
  border-color: rgba(96, 165, 250, 0.64);
  background: rgba(30, 41, 59, 0.92);
}

.ai-chat-message__code-block-wrap .ai-chat-message__code-block {
  margin-bottom: 0;
  padding-top: 12px;
}

.ai-chat-message__markdown :deep(p:last-child),
.ai-chat-message__markdown :deep(ul:last-child),
.ai-chat-message__markdown :deep(ol:last-child),
.ai-chat-message__markdown :deep(blockquote:last-child),
.ai-chat-message__code-block:last-child,
.ai-chat-message__code-block-wrap:last-child {
  margin-bottom: 0;
}

@keyframes ai-thinking-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ai-chat-message__file {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(79, 117, 255, 0.08);
  color: #3159e3;
  font-size: 13px;
  font-weight: 700;
}

.ai-chat-message__actions {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 4px;
  min-height: 28px;
}

.ai-chat-message__generate {
  position: relative;
  display: inline-flex;
  align-items: center;
  isolation: isolate;
}

.ai-chat-message__generate-menu {
  position: absolute;
  left: 0;
  bottom: 100%;
  top: auto;
  z-index: 1200;
  width: 228px;
  border: 1px solid #d6e0ef;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
  padding: 8px;
}

.ai-chat-message__generate-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-chat-message__generate-group + .ai-chat-message__generate-group {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #e5edf7;
}

.ai-chat-message__generate-group strong {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
}

.ai-chat-message__generate-group button {
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1f2937;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  padding: 7px 8px;
  cursor: pointer;
}

.ai-chat-message__generate-group button:hover {
  background: rgba(79, 117, 255, 0.12);
  color: #3159e3;
}

.ai-chat-message__action {
  border: none;
  background: transparent;
  color: #3159e3;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 0;
}

.ai-chat-message__feedback {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ai-chat-message__icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #5a6b86;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ai-chat-message__icon-btn:hover {
  background: rgba(79, 117, 255, 0.08);
  color: #3159e3;
}

.ai-chat-message__action .material-symbols-outlined,
.ai-chat-message__icon-btn .material-symbols-outlined {
  font-size: 18px;
}

.ai-chat-message__suggestions {
  padding-left: 4px;
}

.ai-chat-message__suggestions-label {
  margin: 0 0 10px;
  color: #778497;
  font-size: 13px;
  font-weight: 600;
}

.ai-chat-message__suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.ai-chat-message__suggestion {
  border: none;
  border-radius: 12px;
  background: #e9eef8;
  color: #2f3c52;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 16px;
  cursor: pointer;
}

.ai-assistant-search {
  margin-bottom: 26px;
}

.ai-assistant-search.is-chat {
  margin-top: auto;
  margin-bottom: 0;
  padding-top: 18px;
  background: linear-gradient(180deg, rgba(247, 249, 252, 0) 0%, #f7f9fc 22%);
}

.ai-assistant-search__head {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
}

.ai-assistant-search__head-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.ai-assistant-quota {
  position: relative;
}

.ai-assistant-quota::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 12px;
}

.ai-assistant-quota-entry {
  height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(79, 117, 255, 0.26);
  border-radius: 999px;
  background: rgba(79, 117, 255, 0.08);
  color: #3159e3;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.ai-assistant-quota-entry:hover {
  background: rgba(79, 117, 255, 0.14);
  border-color: rgba(79, 117, 255, 0.4);
}

.ai-assistant-quota-entry__icon {
  font-size: 16px;
}

.ai-assistant-quota-popover {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  width: 290px;
  border-radius: 10px;
  border: 1px solid #dbe5f4;
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.14);
  padding: 12px 14px 10px;
  z-index: 22;
}

.ai-assistant-quota-popover::before {
  content: "";
  position: absolute;
  top: -6px;
  right: 20px;
  width: 12px;
  height: 12px;
  border-left: 1px solid #dbe5f4;
  border-top: 1px solid #dbe5f4;
  background: #ffffff;
  transform: rotate(45deg);
}

.ai-assistant-quota-popover__line,
.ai-assistant-quota-popover__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #5f6872;
  font-size: 15px;
  line-height: 1.9;
}

.ai-assistant-quota-popover__line strong,
.ai-assistant-quota-popover__footer strong {
  color: #303946;
  font-weight: 700;
}

.ai-assistant-quota-popover__footer {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #d2dbe8;
}

.ai-assistant-quota-popover__status {
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

.ai-assistant-quota-popover__status.is-error {
  color: #c2410c;
}

.ai-quota-fade-enter-active,
.ai-quota-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.ai-quota-fade-enter-from,
.ai-quota-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.ai-assistant-history-entry {
  height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(79, 117, 255, 0.26);
  border-radius: 999px;
  background: rgba(79, 117, 255, 0.08);
  color: #3159e3;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.ai-assistant-history-entry:hover {
  background: rgba(79, 117, 255, 0.14);
  border-color: rgba(79, 117, 255, 0.4);
}

.ai-assistant-history-entry__icon {
  font-size: 16px;
}

.ai-assistant-new-chat-entry {
  height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(79, 117, 255, 0.26);
  border-radius: 999px;
  background: linear-gradient(135deg, #5d72ff, #4f75ff);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-assistant-new-chat-entry:hover {
  background: linear-gradient(135deg, #4f63f7, #4259ff);
  box-shadow: 0 6px 18px rgba(79, 117, 255, 0.3);
}

.ai-assistant-new-chat-entry__icon {
  font-size: 18px;
}

.ai-assistant-close-chat {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(245, 108, 108, 0.28);
  border-radius: 999px;
  background: rgba(245, 108, 108, 0.08);
  color: #f56c6c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.ai-assistant-close-chat:hover {
  background: rgba(245, 108, 108, 0.16);
  border-color: rgba(245, 108, 108, 0.45);
}

.ai-assistant-close-chat__icon {
  font-size: 18px;
}

.ai-assistant-search__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 14px 12px 16px;
  border: 1px solid #e8edf4;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 4px 18px rgba(12, 67, 207, 0.08);
}

.ai-code-assistant {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ai-code-assistant--top {
  gap: 16px;
}

.ai-code-assistant__title {
  margin: 0;
  color: #1f2b3d;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
}

.ai-code-assistant__panel {
  display: flex;
  align-items: stretch;
  gap: 18px;
  width: 100%;
  min-height: 292px;
  padding: 22px 24px;
  border: 1px solid rgba(232, 237, 244, 0.96);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.ai-code-assistant__mascot {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 56px;
  padding-top: 4px;
}

.ai-code-assistant__mascot-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: linear-gradient(180deg, #e7f2ff 0%, #ece6ff 100%);
  color: #4f75ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(111, 153, 255, 0.16);
}

.ai-code-assistant__mascot-icon .material-symbols-outlined {
  font-size: 26px;
  line-height: 46px;
}

.ai-code-assistant__panel-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 16px;
}

.ai-code-assistant__hero-text {
  margin: 0;
  color: #6b7a90;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.6;
  max-width: 760px;
}

.ai-code-assistant__mode-list {
  width: min(380px, 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-code-assistant__mode-card {
  border: 1px solid #dce5f3;
  border-radius: 16px;
  background: #ffffff;
  min-height: 82px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-code-assistant__mode-card:hover {
  transform: translateY(-1px);
  border-color: #bfd0f6;
  box-shadow: 0 12px 24px rgba(79, 117, 255, 0.1);
}

.ai-code-assistant__mode-card.is-active {
  border-color: #7fa5ff;
  box-shadow: 0 14px 28px rgba(79, 117, 255, 0.12);
}

.ai-code-assistant__mode-card.is-generate {
  background: linear-gradient(135deg, #fff1fb 0%, #f7f0ff 100%);
}

.ai-code-assistant__mode-card.is-explain {
  background: linear-gradient(135deg, #ebf8ff 0%, #f3fbff 100%);
}

.ai-code-assistant__mode-card.is-debug {
  background: linear-gradient(135deg, #f1efff 0%, #f8f5ff 100%);
}

.ai-code-assistant__mode-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.78);
  color: #5d72ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-code-assistant__mode-icon .material-symbols-outlined {
  font-size: 24px;
}

.ai-code-assistant__mode-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ai-code-assistant__mode-body strong {
  color: #1f2937;
  font-size: 16px;
  font-weight: 800;
}

.ai-code-assistant__mode-body span {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.ai-code-assistant__detail {
  flex: 1;
  min-width: 0;
  min-height: 286px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 22px;
  border: 1px solid #edf1f7;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
}

.ai-code-assistant__detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.ai-code-assistant__detail-mode {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ai-code-assistant__detail-mode strong {
  color: #1f2b3d;
  font-size: 18px;
  font-weight: 800;
}

.ai-code-assistant__detail-mode span {
  color: #6f7f95;
  font-size: 13px;
  line-height: 1.5;
}

.ai-code-assistant__language {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #738298;
  font-size: 12px;
  font-weight: 700;
}

.ai-code-assistant__select {
  width: 100%;
}

:deep(.ai-code-assistant__select > div) {
  height: 42px !important;
  border-radius: 14px !important;
  border: 1px solid #cedcf0 !important;
  background: #ffffff !important;
  box-shadow: none !important;
  padding: 0 12px !important;
}

:deep(.ai-code-assistant__select > div:hover) {
  border-color: #4f75ff !important;
}

:deep(.ai-code-assistant__select > div.ring-2) {
  border-color: #4f75ff !important;
  box-shadow: 0 0 0 3px rgba(79, 117, 255, 0.14) !important;
}

:deep(.ai-code-assistant__select > div > span) {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #1f2c41 !important;
}

.ai-code-assistant__detail-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 22px 24px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(100, 126, 255, 0.08) 0%, rgba(75, 191, 255, 0.08) 100%);
}

.ai-code-assistant__detail-placeholder strong {
  color: #25324a;
  font-size: 18px;
  font-weight: 800;
}

.ai-code-assistant__detail-placeholder p {
  margin: 0;
  color: #6d7a91;
  font-size: 14px;
  line-height: 1.7;
}

.ai-code-assistant__editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-code-assistant__editor-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.ai-code-assistant__editor-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-code-assistant__editor-title {
  color: #1f2b3d;
  font-size: 14px;
  font-weight: 700;
}

.ai-code-assistant__editor-tip {
  color: #7a879a;
  font-size: 12px;
  line-height: 1.5;
}

.ai-code-assistant__editor-count {
  flex-shrink: 0;
  color: #98a4b5;
  font-size: 12px;
  font-weight: 600;
}

.ai-code-assistant__textarea {
  width: 100%;
  border: 1px solid #cedcf0;
  border-radius: 16px;
  background: #ffffff;
  color: #1f2b3d;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px 14px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ai-code-assistant__textarea:focus {
  border-color: #4f75ff;
  box-shadow: 0 0 0 3px rgba(79, 117, 255, 0.12);
}

.ai-code-assistant__textarea--code {
  min-height: 210px;
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
  white-space: pre;
}

.ai-code-assistant__composer {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 14px 16px 14px 20px;
  border: 2px solid rgba(136, 153, 255, 0.7);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(123, 146, 255, 0.12);
}

.ai-code-assistant__bottom {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-code-assistant__composer-input {
  flex: 1;
  min-width: 0;
  min-height: 54px;
  max-height: 160px;
  border: none;
  background: transparent;
  color: #2c3338;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.7;
  resize: none;
  outline: none;
  padding-top: 10px;
  font-family: inherit;
}

.ai-code-assistant__composer-input::placeholder {
  color: #a3adb8;
}

.ai-code-assistant__composer-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 6px;
}

.ai-code-assistant__composer-count {
  color: #7e8aa0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.ai-code-assistant__hint {
  margin: 0;
  text-align: center;
  color: #7c8aa5;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
}

.ai-code-assistant__submit {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  padding: 0;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #8c72ff 0%, #6bbaff 100%);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.ai-code-assistant__submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(111, 153, 255, 0.28);
}

.ai-code-assistant__submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.ai-assistant-search__main {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.ai-assistant-search__prefix {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(79, 117, 255, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-assistant-search__prefix-icon {
  color: #4f75ff;
  font-size: 24px;
  font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
}

.ai-assistant-search__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  color: #2c3338;
  font-size: 18px;
  font-weight: 500;
  background: transparent;
  resize: none;
  min-height: 52px;
  max-height: 160px;
  line-height: 1.7;
  padding-top: 10px;
  font-family: inherit;
}

.ai-assistant-search__input::placeholder {
  color: #a3adb8;
}

.ai-assistant-search__footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.ai-assistant-search__hint {
  margin-right: auto;
  color: #a3adb8;
  font-size: 12px;
  font-weight: 600;
}

.ai-assistant-search__count {
  color: #7e8aa0;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.ai-assistant-search__thinking {
  height: 40px;
  padding: 0 14px;
  border: 1px solid #dce3ef;
  border-radius: 12px;
  background: #f6f8fc;
  color: #58657c;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;
  white-space: nowrap;
}

.ai-assistant-search__thinking:hover {
  border-color: #b8caf7;
  background: #eef4ff;
  color: #3159e3;
}

.ai-assistant-search__thinking.is-active {
  border-color: #b8caf7;
  background: #eef4ff;
  color: #3159e3;
  box-shadow: 0 10px 22px rgba(79, 117, 255, 0.12);
}

.ai-assistant-search__thinking .material-symbols-outlined {
  font-size: 18px;
}

.ai-assistant-upload {
  position: relative;
  flex-shrink: 0;
}

.ai-assistant-upload__button {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #71a8ff 0%, #6f7cff 100%);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(93, 121, 255, 0.22);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.ai-assistant-upload__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(93, 121, 255, 0.28);
}

.ai-assistant-upload__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.ai-assistant-upload__button .material-symbols-outlined {
  font-size: 20px;
}

.ai-assistant-upload__tooltip {
  position: absolute;
  right: -18px;
  bottom: calc(100% + 14px);
  width: 284px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(50, 51, 56, 0.92);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.6;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.22);
  opacity: 0;
  pointer-events: none;
  transform: translateY(6px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 20;
}

.ai-assistant-upload__tooltip::after {
  content: "";
  position: absolute;
  right: 28px;
  top: 100%;
  border-width: 8px 8px 0;
  border-style: solid;
  border-color: rgba(50, 51, 56, 0.92) transparent transparent;
}

.ai-assistant-upload:hover .ai-assistant-upload__tooltip,
.ai-assistant-upload:focus-within .ai-assistant-upload__tooltip {
  opacity: 1;
  transform: translateY(0);
}

.ai-assistant-upload__input {
  display: none;
}

.ai-assistant-search__button {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 16px;
  padding: 13px 28px;
  background: #4f75ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
  white-space: nowrap;
}

.ai-assistant-search__button:hover {
  background: #0c43cf;
}

.ai-assistant-search__button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.ai-assistant-search__button:active {
  transform: scale(0.98);
}

.ai-assistant-search__button-icon {
  font-size: 18px;
}

.ai-assistant-upload-file {
  position: relative;
  margin-top: 14px;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
  max-width: min(520px, 100%);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px 14px 14px;
  border-radius: 16px;
  border: 1px solid rgba(164, 179, 255, 0.36);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 14px 34px rgba(94, 112, 255, 0.16);
}

.ai-assistant-upload-file--lesson {
  margin-top: 6px;
  margin-left: 0;
  margin-right: 0;
  width: min(460px, 100%);
  border-radius: 10px;
  padding: 10px 12px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}

.ai-assistant-upload-file__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(180deg, #edf4ff 0%, #dcebff 100%);
  color: #5d79ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-assistant-upload-file__icon .material-symbols-outlined {
  font-size: 24px;
}

.ai-assistant-upload-file__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-assistant-upload-file__name {
  color: #1f2937;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-assistant-upload-file__status {
  color: #7b8794;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.ai-assistant-upload-file__status.is-error {
  color: #ef4444;
}

.ai-assistant-upload-file__progress {
  position: relative;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  margin-left: auto;
}

.ai-assistant-upload-file__progress svg {
  width: 46px;
  height: 46px;
  transform: rotate(-90deg);
}

.ai-assistant-upload-file__progress-track,
.ai-assistant-upload-file__progress-value {
  fill: none;
  stroke-width: 6;
}

.ai-assistant-upload-file__progress-track {
  stroke: rgba(76, 120, 255, 0.18);
}

.ai-assistant-upload-file__progress-value {
  stroke: #57b8ff;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.2s ease;
}

.ai-assistant-upload-file__progress strong {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5f6ee4;
  font-size: 12px;
  font-weight: 700;
}

.ai-assistant-upload-file__close {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 999px;
  background: #f36f88;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(243, 111, 136, 0.28);
}

.ai-assistant-upload-file__close .material-symbols-outlined {
  font-size: 14px;
}

.ai-assistant-upload-file__close.is-cancel {
  background: #ff6b81;
}

.ai-assistant-hot {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding: 0 8px;
}

.ai-assistant-hot__label {
  color: #a0a9b2;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ai-assistant-hot__item {
  border: none;
  border-radius: 999px;
  background: #eef3f8;
  color: #5d6771;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.ai-assistant-hot__item:hover {
  background: rgba(79, 117, 255, 0.14);
  color: #3159e3;
}

.ai-assistant-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(14px, 1.2vw, 20px);
}

.ai-assistant-card {
  position: relative;
  min-height: 238px;
  border: 2px solid #4f75ff;
  border-radius: 20px;
  background: #ffffff;
  overflow: hidden;
  padding: 24px 22px 20px;
  display: flex;
  flex-direction: column;
  transition: transform 0.24s ease, box-shadow 0.24s ease;
  cursor: pointer;
}

.ai-assistant-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(36, 81, 220, 0.08);
}

.ai-assistant-card__watermark {
  position: absolute;
  top: 10px;
  right: 12px;
  opacity: 0.04;
}

.ai-assistant-card__watermark .material-symbols-outlined {
  font-size: 80px;
}

.ai-assistant-card__icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(79, 117, 255, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

.ai-assistant-card__icon {
  color: #4f75ff;
  font-size: 24px;
}

.ai-assistant-card__title {
  margin: 0 0 10px;
  color: #1f252d;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.22;
}

.ai-assistant-card__desc {
  margin: 0;
  color: #5f6872;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.65;
  flex: 1;
}

.ai-assistant-card__action {
  margin-top: 16px;
  border: none;
  background: transparent;
  padding: 0;
  color: #4f75ff;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
}

.ai-assistant-card__action .material-symbols-outlined {
  font-size: 14px;
}

.ai-assistant-card--highlight {
  grid-column: span 2;
  border: none;
  background: linear-gradient(135deg, #4f75ff 0%, #0c43cf 100%);
  box-shadow: 0 18px 42px rgba(12, 67, 207, 0.24);
}

.ai-assistant-card__highlight-glow {
  position: absolute;
  right: -92px;
  bottom: -92px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.26);
  filter: blur(90px);
}

.ai-assistant-card__highlight-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.ai-assistant-card__icon-wrap--highlight {
  background: rgba(255, 255, 255, 0.14);
}

.ai-assistant-card__icon--light {
  color: #ffffff;
}

.ai-assistant-card__tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.06em;
  white-space: nowrap;
  padding: 6px 12px;
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.ai-assistant-card__title--light {
  color: #ffffff;
  font-size: 34px;
  margin-bottom: 8px;
}

.ai-assistant-card__desc--light {
  color: rgba(255, 255, 255, 0.84);
  max-width: 90%;
}

.ai-assistant-card__cta {
  margin-top: 16px;
  border: none;
  border-radius: 12px;
  background: #ffffff;
  color: #4f75ff;
  font-size: 13px;
  font-weight: 800;
  padding: 10px 16px;
  align-self: flex-start;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.ai-assistant-card__cta:active {
  transform: scale(0.98);
}

.ai-history-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.34);
  backdrop-filter: blur(8px);
  z-index: 1800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
}

.ai-history-panel {
  width: min(1100px, calc(100vw - 56px));
  height: min(740px, calc(100vh - 56px));
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #d7e1f1;
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(29, 78, 216, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-history-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 28px 14px;
}

.ai-history-panel__title-wrap {
  min-width: 0;
}

.ai-history-panel__title {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.ai-history-panel__subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.ai-history-panel__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.ai-history-panel__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #dce7f7;
  background: #edf4ff;
  color: #3159e3;
  font-size: 13px;
  font-weight: 700;
}

.ai-history-panel__close {
  width: 36px;
  height: 36px;
  border: 1px solid #d6e0ee;
  border-radius: 10px;
  background: #ffffff;
  color: #667085;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.ai-history-panel__close:hover {
  border-color: #bfd3f7;
  background: #f4f8ff;
  color: #3159e3;
}

.ai-history-toolbar {
  padding: 0 28px 14px;
}

.ai-history-select {
  width: 200px;
}

.ai-history-list-wrap {
  margin: 0 28px 28px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid #dae5f4;
  background: linear-gradient(180deg, #f6f9ff 0%, #f3f7ff 100%);
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.ai-history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.ai-history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #dce7f6;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.ai-history-item.is-active {
  border-color: #9cb8f3;
  background: #f6faff;
  box-shadow: 0 10px 22px rgba(49, 89, 227, 0.12);
}

.ai-history-item:hover {
  border-color: #bdd2f4;
  background: #fafdff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(49, 89, 227, 0.1);
}

.ai-history-item__main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-history-item__side {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.ai-history-item__tag {
  border-radius: 999px;
  border: 1px solid #cfe0fb;
  background: #e8f1ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 8px 12px;
  white-space: nowrap;
}

.ai-history-item__text {
  margin: 0;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ai-history-item__date {
  color: #8b96a7;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.ai-history-item__delete {
  border: 1px solid transparent;
  background: transparent;
  color: #6f7d90;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.45;
  transition: opacity 0.2s ease, background-color 0.2s ease, border-color 0.2s ease,
    color 0.2s ease;
  cursor: pointer;
}

.ai-history-item:hover .ai-history-item__delete,
.ai-history-item.is-active .ai-history-item__delete {
  opacity: 1;
}

.ai-history-item__delete:hover {
  border-color: #cfe0fb;
  background: #edf4ff;
  color: #3159e3;
}

.ai-history-item__delete:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ai-history-item__delete .material-symbols-outlined {
  font-size: 18px;
}

.ai-history-empty {
  flex: 1;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.ai-history-empty__icon {
  font-size: 40px;
  color: #8ea5d8;
}

.ai-history-empty__text {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  font-weight: 600;
}

:deep(.ai-history-select > div) {
  height: 40px !important;
  border-radius: 12px !important;
  border: 1px solid #d4dfef !important;
  background: #ffffff !important;
  box-shadow: none !important;
  padding: 0 12px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #1f2c41 !important;
}

:deep(.ai-history-select > div.ring-2) {
  box-shadow: 0 0 0 2px rgba(79, 117, 255, 0.18) !important;
  border-color: #4f75ff !important;
}

:global(.ai-history-select-dropdown) {
  border-radius: 12px !important;
  border: 1px solid #d8e3f2 !important;
  box-shadow: 0 14px 36px rgba(30, 64, 175, 0.14) !important;
  padding: 6px 0 !important;
}

:global(.ai-history-select-dropdown > div.py-1 > div) {
  padding: 9px 14px !important;
  margin: 0 6px 4px !important;
  border-radius: 8px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
}

:global(.ai-history-select-dropdown > div.py-1 > div:not(.text-gray-700)) {
  background-color: #4f75ff !important;
  color: #ffffff !important;
}

:global(.ai-history-select-dropdown > div.py-1 > div.text-gray-700:hover) {
  background-color: rgba(79, 117, 255, 0.1) !important;
  color: #3159e3 !important;
}

:global(.ai-lesson-select-dropdown) {
  border-radius: 12px !important;
  border: 1px solid #d6e2f4 !important;
  box-shadow: 0 16px 34px rgba(30, 64, 175, 0.14) !important;
  background: #ffffff !important;
  padding: 8px 0 !important;
}

:global(.ai-lesson-select-dropdown > div.py-1 > div) {
  padding: 10px 14px !important;
  margin: 0 6px 4px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #334155 !important;
}

:global(.ai-lesson-select-dropdown > div.py-1 > div:not(.text-gray-700)) {
  background-color: rgba(79, 117, 255, 0.14) !important;
  color: #3159e3 !important;
}

:global(.ai-lesson-select-dropdown > div.py-1 > div.text-gray-700:hover) {
  background-color: rgba(79, 117, 255, 0.1) !important;
  color: #3159e3 !important;
}

.ai-existing-course-overlay {
  position: fixed;
  inset: 0;
  z-index: 1900;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
}

.ai-existing-course-modal {
  width: min(980px, calc(100vw - 56px));
  max-height: min(760px, calc(100vh - 56px));
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #d7e1f1;
  box-shadow: 0 24px 70px rgba(29, 78, 216, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-existing-course-modal__header {
  position: relative;
  height: 74px;
  border-bottom: 1px solid #e3ebf7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 22px;
}

.ai-existing-course-modal__title {
  margin: 0;
  color: #0f172a;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.ai-existing-course-modal__close {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #8a96a8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ai-existing-course-modal__close:hover {
  background: #f3f7ff;
  color: #3159e3;
}

.ai-existing-course-modal__body {
  flex: 1;
  min-height: 0;
  padding: 18px 24px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-existing-course-modal__tip {
  margin: 0;
  color: #69778f;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
}

.ai-existing-course-modal__type-tabs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.ai-existing-course-modal__type-tab {
  min-width: 96px;
  height: 34px;
  border: none;
  border-radius: 999px;
  background: #eef2f8;
  color: #5e6b80;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.ai-existing-course-modal__type-tab.is-active {
  background: #ff9900;
  color: #ffffff;
}

.ai-existing-course-modal__menu-tabs {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 2px;
}

.ai-existing-course-modal__menu-tab {
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  line-height: 28px;
  cursor: pointer;
}

.ai-existing-course-modal__menu-tab.is-active {
  color: #ff9900;
  border-bottom-color: #ff9900;
}

.ai-existing-course-modal__panel-wrap {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.ai-existing-course-modal__panel {
  min-height: 0;
  border: 1px solid #e0e8f4;
  border-radius: 14px;
  background: #f9fbff;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ai-existing-course-modal__panel-title {
  margin: 0;
  color: #1f2b3d;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
}

.ai-existing-course-modal__search-wrap {
  position: relative;
}

.ai-existing-course-modal__search-wrap .material-symbols-outlined {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 18px;
}

.ai-existing-course-modal__search {
  width: 100%;
  height: 38px;
  border: 1px solid #d5dfed;
  border-radius: 10px;
  background: #ffffff;
  color: #1f2937;
  padding: 0 36px 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.ai-existing-course-modal__search:focus {
  outline: none;
  border-color: #4f75ff;
  box-shadow: 0 0 0 3px rgba(79, 117, 255, 0.14);
}

.ai-existing-course-modal__search:disabled {
  cursor: not-allowed;
  background: #f3f4f6;
  color: #98a5b9;
}

.ai-existing-course-modal__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-radius: 10px;
  border: 1px solid #d9e3f2;
  background: #ffffff;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ai-existing-course-modal__item {
  width: 100%;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #1f2937;
  text-align: left;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.ai-existing-course-modal__item:hover {
  background: rgba(79, 117, 255, 0.1);
  color: #3159e3;
}

.ai-existing-course-modal__item.is-active {
  background: #dbeafe;
  color: #1d4ed8;
}

.ai-existing-course-modal__empty {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a99b0;
  font-size: 14px;
  font-weight: 600;
}

.ai-existing-course-modal__footer {
  border-top: 1px solid #e4ecf7;
  padding: 14px 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-existing-course-modal__confirm {
  min-width: 132px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #49bff5 0%, #6175ea 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.ai-existing-course-modal__confirm:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 1680px) {
  .ai-assistant-card__title {
    font-size: 20px;
  }

  .ai-assistant-card__title--light {
    font-size: 30px;
  }

  .ai-assistant-upload-file {
    margin-left: auto;
    margin-right: auto;
    max-width: min(500px, 100%);
  }

  .ai-assistant-chat__title {
    font-size: 28px;
  }

  .ai-assistant-lesson__title {
    font-size: 26px;
  }
}

@media (max-width: 1500px) {
  .ai-image {
    padding: 20px;
    border-radius: 28px;
  }

  .ai-image__content {
    grid-template-columns: minmax(0, 390px) minmax(0, 1fr);
    gap: 18px;
    height: clamp(510px, calc((100vh - 214px) / var(--ai-assistant-ui-scale)), 600px);
  }

  .ai-image__topbar {
    margin-bottom: 18px;
  }

  .ai-image__panel {
    padding: 18px 18px 16px;
    gap: 12px;
  }

  .ai-image__panel-title {
    font-size: 34px;
  }

  .ai-image__panel-block {
    padding: 13px;
  }

  .ai-image__thumb,
  .ai-image__thumb-placeholder {
    flex-basis: 112px;
    width: 112px;
    height: 112px;
  }

}

@media (max-width: 1320px) {
  .ai-assistant-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ai-assistant-card--highlight {
    grid-column: span 2;
  }

  .ai-history-panel {
    width: min(980px, calc(100vw - 32px));
    height: min(680px, calc(100vh - 32px));
  }

  .ai-history-panel__header {
    padding: 20px 20px 12px;
  }

  .ai-history-toolbar {
    padding: 0 20px 12px;
  }

  .ai-history-list-wrap {
    margin: 0 20px 20px;
  }

  .ai-history-panel__title {
    font-size: 24px;
  }

  .ai-history-panel__subtitle {
    font-size: 13px;
  }

  .ai-history-item__text {
    font-size: 14px;
  }

  .ai-history-item__date {
    font-size: 12px;
  }

  .ai-assistant-search__panel {
    flex-wrap: wrap;
  }

  .ai-assistant-search__input {
    min-width: 220px;
  }

  .ai-assistant-search__footer {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .ai-assistant-search__hint {
    width: 100%;
    margin-right: 0;
  }

  .ai-assistant-upload-file {
    margin-left: auto;
    margin-right: auto;
    max-width: min(500px, 100%);
  }

  .ai-assistant-chat__header {
    flex-wrap: wrap;
  }

  .ai-chat-message__bubble-wrap {
    max-width: 100%;
  }

  .ai-code-assistant__title {
    font-size: 28px;
  }

  .ai-assistant-chat.is-code-assistant {
    padding: 18px;
  }

  .ai-code-assistant__panel {
    min-height: auto;
    flex-direction: column;
    padding: 18px;
  }

  .ai-code-assistant__mascot {
    width: auto;
    padding-top: 0;
  }

  .ai-code-assistant__mode-list {
    width: 100%;
  }

  .ai-code-assistant__composer {
    flex-wrap: wrap;
    padding: 14px;
  }

  .ai-code-assistant__composer-input {
    width: 100%;
  }

  .ai-code-assistant__composer-footer {
    width: 100%;
    justify-content: flex-end;
    padding-bottom: 0;
  }

  .ai-assistant-lesson__double {
    grid-template-columns: 1fr;
  }

  .ai-image__content {
    grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
    height: clamp(500px, calc((100vh - 214px) / var(--ai-assistant-ui-scale)), 580px);
  }

  .ai-analysis-target__body {
    grid-template-columns: 1fr;
    max-height: 420px;
  }

  .ai-analysis-target__grades {
    max-height: 180px;
    border-right: none;
    border-bottom: 1px solid #edf2fb;
  }

  .ai-analysis-target__classes {
    max-height: 240px;
  }

  .ai-assistant-lesson__row {
    gap: 12px;
  }

  .ai-assistant-lesson__question-types {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ai-assistant-lesson__helper-panel {
    left: 0;
    top: 22px;
    width: min(680px, calc(100vw - 80px));
  }

  .ai-chat-lesson-editor__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1180px) {
  .ai-image__topbar {
    flex-wrap: wrap;
  }

  .ai-image__topbar .ai-assistant-lesson__header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .ai-image__content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .ai-image__preview {
    order: -1;
    height: auto;
    display: flex;
    flex-direction: column;
  }

  .ai-image__preview-stage {
    flex-basis: 380px;
    min-height: 380px;
  }

  .ai-image__empty {
    min-height: 360px;
  }

  .ai-image__panel {
    height: auto;
    min-height: auto;
  }

  .ai-image__size-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

}
</style>
