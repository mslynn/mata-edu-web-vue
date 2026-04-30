<template>
  <div class="class-page class-ui-shell flex-1 flex">
    <!-- 页面初始化加载状态 -->
    <div v-if="!pageInitialized" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div
          class="w-8 h-8 border-3 border-[#FF9900] border-t-transparent rounded-full animate-spin"
        ></div>
        <span class="text-gray-400 text-sm">{{ $t("common.loading") }}</span>
      </div>
    </div>

    <!-- 中间内容：年级树 + 主内容 -->
    <div v-else class="class-layout-shell flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
      <!-- 年级/班级树 -->
      <section
        class="grade-panel class-grade-panel w-full lg:w-[240px] xl:w-[280px] flex-shrink-0 p-3 flex flex-col"
      >
        <div class="class-grade-card bg-[#FFFFFF] shadow-sm flex-1 flex flex-col min-h-0">
          <button type="button" class="class-grade-header" @click="handleSelectAll">
            <span class="class-grade-header__title">{{ $t("class.allClass") }}</span>
          </button>
          <!-- 有数据时显示树 -->
          <div v-if="treeData.length" class="class-grade-tree-wrap flex-1 overflow-y-auto p-2">
            <MTree
              :data="treeData"
              :selected-key="selectedClass?.id"
              :expanded-keys="expandedKeys"
              label-key="name"
              :children-key="'children'"
              @select="handleTreeSelect"
              @expand="handleTreeExpand"
              @create-class="handleCreateNewClass"
            >
              <template #icon="{ node, expanded }">
                <span v-if="node.children" class="class-tree-folder-icon">
                  <svg
                    v-if="expanded"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 7.5C3 6.67157 3.67157 6 4.5 6H9.2C9.59782 6 9.97936 6.15804 10.2607 6.43934L11.5607 7.73934C11.842 8.02064 12.2235 8.17868 12.6213 8.17868H19.5C20.3284 8.17868 21 8.85025 21 9.67868V10.2H3V7.5Z"
                      fill="#0D5BC4"
                      fill-opacity="0.15"
                    />
                    <path
                      d="M4.5 7.25H9.1L10.85 9H19.5C19.9142 9 20.25 9.33579 20.25 9.75V16.5C20.25 17.3284 19.5784 18 18.75 18H5.25C4.42157 18 3.75 17.3284 3.75 16.5V8C3.75 7.58579 4.08579 7.25 4.5 7.25Z"
                      stroke="#0D5BC4"
                      stroke-width="1.6"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.75 8C3.75 7.58579 4.08579 7.25 4.5 7.25H8.9236C9.32142 7.25 9.70296 7.40804 9.98426 7.68934L11.2893 8.99439C11.5706 9.27569 11.9522 9.43373 12.35 9.43373H19.5C19.9142 9.43373 20.25 9.76952 20.25 10.1837V16.5C20.25 17.3284 19.5784 18 18.75 18H5.25C4.42157 18 3.75 17.3284 3.75 16.5V8Z"
                      stroke="#94A3B8"
                      stroke-width="1.6"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span
                  v-else
                  class="class-tree-leaf-icon"
                  :class="{ 'is-selected': String(selectedClass?.id || '') === String(node.id || '') }"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 4L3 8.5L12 13L21 8.5L12 4Z"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M7 10.6V14.2L12 16.8L17 14.2V10.6"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M18.8 9.6V14.1"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                    <path
                      d="M18.8 14.1C18.8 14.7075 18.3075 15.2 17.7 15.2C17.0925 15.2 16.6 14.7075 16.6 14.1C16.6 13.4925 17.0925 13 17.7 13C18.3075 13 18.8 13.4925 18.8 14.1Z"
                      stroke="currentColor"
                      stroke-linejoin="round"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              </template>
              <template #actions="{ node }">
                <template v-if="node.children"></template>
                <template v-else>
                  <div class="class-tree-node-actions flex items-center gap-2">
                    <img
                      src="~/assets/images/edit.png"
                      :alt="$t('common.edit')"
                      class="w-5 h-5 cursor-pointer"
                      @click.stop="handleEditClass(node)"
                    />
                    <img
                      src="~/assets/images/del.png"
                      :alt="$t('common.delete')"
                      class="class-tree-delete-icon w-5 h-5 cursor-pointer"
                      @click.stop="handleDeleteClass(node)"
                    />
                  </div>
                </template>
              </template>
            </MTree>
          </div>
          <!-- 无数据时显示空状态 -->
          <div v-else class="flex-1 flex flex-col items-center justify-center p-4">
            <p class="text-gray-400 text-sm">{{ $t("class.noClassRecord") }}</p>
          </div>
          <!-- 创建班级按钮始终固定在底部 -->
          <div class="class-grade-create-wrap flex-shrink-0 p-3 border-t border-gray-100 flex justify-center">
            <button
              class="class-grade-create-btn w-[142px] h-[50px] flex items-center justify-center gap-2 bg-[#FF9900] text-white rounded-[20px] text-[16px]"
              @click="handleCreateNewClass(null)"
            >
              <span class="text-xl">+</span>
              <span>{{ $t("class.createClass") }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 右侧主内容 -->
      <section class="main-panel class-main-panel flex-1 min-w-0 p-4 flex flex-col">
        <!-- 学生管理 Tab -->
        <div
          v-show="activeTab === 'student'"
          class="class-card class-student-card bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0"
        >
          <div class="class-panel-head flex-shrink-0">
            <div class="class-panel-topline">
              <div class="class-tabs-shell">
                <MTabs
                  v-model="activeTab"
                  :tabs="tabList"
                  class="class-tabs-native"
                  @change="handleTabChange"
                />
              </div>

              <div class="class-toolbar-actions class-toolbar-actions--top flex items-center gap-1.5 xl:gap-3">
                <div class="relative group">
                  <button
                    :class="[
                      'class-action-btn class-action-btn--ghost',
                      activeAction === 'batch' || isOtherClassQuickLogin
                        ? 'is-disabled'
                        : isCurrentClassQuickLogin
                        ? 'is-active'
                        : '',
                    ]"
                    :disabled="activeAction === 'batch' || isOtherClassQuickLogin"
                    @click="handleQuickLogin"
                  >
                    <span class="class-action-btn__icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 12.5C5.8 8.83333 8.46667 7 12 7C15.5333 7 18.2 8.83333 20 12.5C18.2 16.1667 15.5333 18 12 18C8.46667 18 5.8 16.1667 4 12.5Z"
                          stroke="currentColor"
                          stroke-width="1.8"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <circle cx="12" cy="12.5" r="2.5" stroke="currentColor" stroke-width="1.8" />
                      </svg>
                    </span>
                    {{ isCurrentClassQuickLogin ? $t("class.disableQuickLogin") : $t("class.enableQuickLogin") }}
                  </button>
                  <div
                    v-if="isOtherClassQuickLogin"
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                  >
                    {{ $t("class.quickLoginTip") }}
                    <div
                      class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"
                    ></div>
                  </div>
                </div>
                <button
                  :class="[
                    'class-action-btn class-action-btn--ghost',
                    isCurrentClassQuickLogin
                      ? 'is-disabled'
                      : activeAction === 'batch'
                      ? 'is-active'
                      : '',
                  ]"
                  :disabled="isCurrentClassQuickLogin"
                  @click="handleBatchAction"
                >
                  <span class="class-action-btn__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 6H19"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M7 12H19"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M7 18H19"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <circle cx="5" cy="6" r="1" fill="currentColor" />
                      <circle cx="5" cy="12" r="1" fill="currentColor" />
                      <circle cx="5" cy="18" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  {{
                    activeAction === "batch"
                      ? $t("class.cancelBatch")
                      : $t("class.batchOperation")
                  }}
                </button>
                <button
                  :class="[
                    'class-action-btn class-action-btn--primary',
                    activeAction === 'batch' || isCurrentClassQuickLogin ? 'is-disabled' : '',
                  ]"
                  :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                  @click="handleCreateAction()"
                >
                  <span class="class-action-btn__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M15.5 18.5V17C15.5 15.6193 14.3807 14.5 13 14.5H8C6.61929 14.5 5.5 15.6193 5.5 17V18.5"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <circle cx="10.5" cy="9" r="3" stroke="currentColor" stroke-width="1.8" />
                      <path
                        d="M18.5 8V14"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M15.5 11H21.5"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                  </span>
                  {{ $t("class.createStudent") }}
                </button>
                <button
                  :class="[
                    'class-action-btn class-action-btn--ghost',
                    activeAction === 'batch' ? 'is-disabled' : '',
                  ]"
                  :disabled="activeAction === 'batch'"
                  @click="handleExport"
                >
                  <span class="class-action-btn__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 4V14"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M8.5 10.5L12 14L15.5 10.5"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5 18H19"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                  </span>
                  {{ $t("class.exportStudentInfo") }}
                </button>
              </div>
            </div>

            <div class="class-panel-subline">
              <div class="class-toolbar-search class-toolbar-search--wide">
                <MInput
                  v-model="searchKeyword"
                  :placeholder="$t('class.searchStudentPlaceholder')"
                  clearable
                  class="w-[200px] xl:w-[270px]"
                  @enter="handleSearch"
                  @clear="handleSearch"
                >
                  <template #prefix>
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </template>
                </MInput>
              </div>
              <span class="class-toolbar-password">
                {{ $t("class.studentDefaultPassword") }}{{ studentPassword || "-" }}
              </span>
              <span class="class-toolbar-stat">
                {{ $t("class.studentCount") }}
                <span class="class-toolbar-stat__num">{{ studentList.length }}</span>
                {{ $t("class.person") }}
              </span>
            </div>
          </div>

          <!-- 快捷登录信息栏 -->
          <div
            v-if="isCurrentClassQuickLogin"
            class="class-quick-login-banner flex items-center gap-4 px-4 py-3 mb-3 bg-[#FF9900] rounded-lg text-white text-sm"
          >
            <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded">NEW</span>

            <span class="border-l border-white/30 pl-4"
              >{{ $t("class.classCode") }}{{ quickLoginData.classCode || "-" }}</span
            >
            <span
              >{{ $t("class.unifiedPassword")
              }}{{ quickLoginData.classCodePwd || "-" }}</span
            >
            <button
              class="px-2 py-1 border border-white/50 rounded text-xs hover:bg-white/10"
              @click="copyQuickLoginInfo"
            >
              {{ $t("common.copy") }}
            </button>
            <span class="flex items-center gap-1 text-white/80 text-s ml-auto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              ({{ $t("class.validFor2Hours") }}{{ quickLoginData.expirationDate || ""
              }}{{ $t("class.expire") }})
            </span>
            <button
              class="p-1 hover:bg-white/10 rounded"
              @click="handleRefreshQuickLogin"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          <!-- 表格 - 可滚动区域 -->
          <div class="class-table-wrap flex-1 overflow-auto min-h-0">
            <MTable
              :columns="tableColumns"
              :data="studentList"
              :loading="loading"
              :selected-keys="selectedStudentIds"
              show-index
              :selectable="activeAction === 'batch'"
              stripe
              @select="handleStudentSelect"
              @select-all="handleStudentSelectAll"
            >
              <template #studentName="{ row }">
                <div class="class-student-cell tooltip-wrapper group relative">
                  <span
                    class="class-student-avatar"
                    :style="{
                      backgroundColor: getStudentAvatarTheme(row.studentName || row.name).bg,
                      color: getStudentAvatarTheme(row.studentName || row.name).text,
                    }"
                  >
                    {{ getStudentAvatarText(row.studentName || row.name) }}
                  </span>
                  <span class="class-student-name truncate block max-w-[120px]">{{
                    row.studentName || "-"
                  }}</span>
                  <div v-if="row.studentName" class="tooltip-content">
                    {{ row.studentName }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #studentNumber="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[150px]">{{
                    row.studentNumber || "-"
                  }}</span>
                  <div v-if="row.studentNumber" class="tooltip-content">
                    {{ row.studentNumber }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #createTime="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[150px]">{{
                    row.createTime || "-"
                  }}</span>
                  <div v-if="row.createTime" class="tooltip-content">
                    {{ row.createTime }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #loginStatus="{ row }">
                <span
                  :class="
                    Number(row.loginStatus) === 1 ? 'text-[#52C41A]' : 'text-[#999999]'
                  "
                >
                  {{
                    Number(row.loginStatus) === 1
                      ? $t('class.loggedIn')
                      : $t('class.notLoggedIn')
                  }}
                </span>
              </template>
              <template #action="{ row }">
                <div class="class-row-actions">
                  <button
                    :class="[
                      'class-row-action',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'is-disabled'
                        : '',
                    ]"
                    :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                    @click="handleResetPassword(row)"
                  >
                    {{ $t("class.resetPassword") }}
                  </button>
                  <button
                    :class="[
                      'class-row-action',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'is-disabled'
                        : '',
                    ]"
                    :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                    @click="handleTransfer(row)"
                  >
                    {{ $t("class.transfer") }}
                  </button>
                  <button
                    :class="[
                      'class-row-action is-danger',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'is-disabled'
                        : '',
                    ]"
                    :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                    @click="handleDeleteStudent(row)"
                  >
                    {{ $t("common.delete") }}
                  </button>
                </div>
              </template>
            </MTable>
          </div>

          <!-- 批量操作栏 - 表格底部 -->
          <div
            v-if="activeAction === 'batch'"
            class="class-batch-bar flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] border-t border-gray-200"
          >
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  class="sr-only"
                  @change="handleSelectAllToggle"
                />
                <span
                  class="class-batch-bar__checkbox w-4 h-4 rounded border flex items-center justify-center transition-colors"
                  :class="
                    isAllSelected
                      ? 'is-checked'
                      : ''
                  "
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
                </span>
                <span class="text-sm text-[#4D4D4D]">{{ $t("class.selectAll") }}</span>
              </label>
              <span class="class-batch-bar__summary text-sm text-[#4D4D4D]"
                >{{ $t("class.selected") }}
                <span class="class-batch-bar__count">{{ selectedStudentIds.length }}</span>
                {{ $t("class.items") }}</span
              >
            </div>
            <div class="class-batch-bar__actions flex items-center gap-4">
              <button
                class="class-batch-bar__action text-sm"
                @click="handleBatchResetPassword"
              >
                {{ $t("class.batchResetPassword") }}
              </button>
              <button
                class="class-batch-bar__action text-sm"
                @click="handleBatchTransfer"
              >
                {{ $t("class.batchTransfer") }}
              </button>
              <button
                class="class-batch-bar__action class-batch-bar__action--danger text-sm"
                @click="handleBatchDelete"
              >
                {{ $t("class.batchDelete") }}
              </button>
              <button
                class="class-batch-bar__action text-sm"
                @click="handleBatchAction"
              >
                {{ $t("class.cancelBatch") }}
              </button>
            </div>
          </div>
        </div>

        <!-- 小组管理 Tab -->
        <div
          v-show="activeTab === 'group'"
          class="class-card class-group-card bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0"
        >
          <div class="class-panel-head flex-shrink-0">
            <div class="class-panel-topline">
              <div class="class-tabs-shell">
                <MTabs
                  v-model="activeTab"
                  :tabs="tabList"
                  class="class-tabs-native"
                  @change="handleTabChange"
                />
              </div>

              <div class="class-toolbar-actions class-toolbar-actions--top flex items-center gap-2 xl:gap-3">
                <button
                  :class="[
                    'class-action-btn class-action-btn--primary',
                    groupActiveAction === 'batch' ? 'is-active-primary' : '',
                  ]"
                  :disabled="groupActiveAction === 'batch'"
                  @click="handleCreateGroup"
                >
                  <span class="class-action-btn__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7.5 12.5C8.88071 12.5 10 11.3807 10 10C10 8.61929 8.88071 7.5 7.5 7.5C6.11929 7.5 5 8.61929 5 10C5 11.3807 6.11929 12.5 7.5 12.5Z"
                        stroke="currentColor"
                        stroke-width="1.8"
                      />
                      <path
                        d="M16.5 12.5C17.8807 12.5 19 11.3807 19 10C19 8.61929 17.8807 7.5 16.5 7.5C15.1193 7.5 14 8.61929 14 10C14 11.3807 15.1193 12.5 16.5 12.5Z"
                        stroke="currentColor"
                        stroke-width="1.8"
                      />
                      <path
                        d="M3.5 18C3.5 16.3431 4.84315 15 6.5 15H8.5C10.1569 15 11.5 16.3431 11.5 18"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M12.5 18C12.5 16.3431 13.8431 15 15.5 15H17.5C19.1569 15 20.5 16.3431 20.5 18"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                  </span>
                  {{ $t("class.createGroup") }}
                </button>
                <button
                  :class="[
                    'class-action-btn class-action-btn--ghost',
                    groupActiveAction === 'batch' ? 'is-active' : '',
                  ]"
                  @click="handleGroupBatchAction"
                >
                  <span class="class-action-btn__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M7 6H19"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M7 12H19"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <path
                        d="M7 18H19"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                      <circle cx="5" cy="6" r="1" fill="currentColor" />
                      <circle cx="5" cy="12" r="1" fill="currentColor" />
                      <circle cx="5" cy="18" r="1" fill="currentColor" />
                    </svg>
                  </span>
                  {{
                    groupActiveAction === "batch"
                      ? $t("class.cancelBatch")
                      : $t("class.batchOperation")
                  }}
                </button>
              </div>
            </div>

            <div class="class-panel-subline">
              <div class="class-toolbar-search class-toolbar-search--group">
                <MInput
                  v-model="groupSearchKeyword"
                  :placeholder="$t('class.searchGroupPlaceholder')"
                  clearable
                  class="w-[260px] xl:w-[320px]"
                  @enter="handleGroupSearch"
                  @clear="handleGroupSearch"
                >
                  <template #prefix>
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </template>
                </MInput>
              </div>
              <span class="class-toolbar-stat">
                {{ $t("class.groupCount") }}
                <span class="class-toolbar-stat__num">{{ groupList.length }}</span>
                {{ $t("class.groupUnit") }}
              </span>
            </div>
          </div>

          <!-- 表格 -->
          <div class="class-table-wrap flex-1 overflow-auto min-h-0">
            <MTable
              :columns="groupTableColumns"
              :data="groupList"
              :loading="groupLoading"
              :selected-keys="selectedGroupIds"
              show-index
              :selectable="groupActiveAction === 'batch'"
              stripe
              @select="handleGroupSelect"
              @select-all="handleGroupSelectAll"
            >
              <template #teamName="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[100px]">{{
                    row.teamName || "-"
                  }}</span>
                  <div v-if="row.teamName" class="tooltip-content">
                    {{ row.teamName }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #leaderName="{ row }">
                <div class="class-group-leader-cell tooltip-wrapper group relative">
                  <span
                    class="class-student-avatar"
                    :style="{
                      backgroundColor: getStudentAvatarTheme(formatLimitedLeaderName(row.leaderName) || '-').bg,
                      color: getStudentAvatarTheme(formatLimitedLeaderName(row.leaderName) || '-').text,
                    }"
                  >
                    {{ getStudentAvatarText(formatLimitedLeaderName(row.leaderName) || "-") }}
                  </span>
                  <span class="block max-w-[120px] truncate">{{
                    formatLimitedLeaderName(row.leaderName) || "-"
                  }}</span>
                  <div v-if="row.leaderName" class="tooltip-content">
                    {{ row.leaderName }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #members="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[80px]">{{ row.members }}</span>
                  <div v-if="row.members?.length" class="tooltip-content">
                    {{ row.members }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #remarks="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[80px]">{{
                    row.remarks || "-"
                  }}</span>
                  <div v-if="row.remarks" class="tooltip-content">
                    {{ row.remarks }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #createTime="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="block whitespace-nowrap min-w-[152px]">{{
                    row.createTime || "-"
                  }}</span>
                  <div v-if="row.createTime" class="tooltip-content">
                    {{ row.createTime }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #action="{ row }">
                <div class="class-row-actions class-row-actions--group">
                  <button
                    :class="[
                      'class-row-action',
                      groupActiveAction === 'batch' ? 'is-disabled' : '',
                    ]"
                    :disabled="groupActiveAction === 'batch'"
                    @click="handleEditGroup(row)"
                  >
                    {{ $t("common.edit") }}
                  </button>
                  <button
                    :class="[
                      'class-row-action is-danger',
                      groupActiveAction === 'batch' ? 'is-disabled' : '',
                    ]"
                    :disabled="groupActiveAction === 'batch'"
                    @click="handleDeleteGroup(row)"
                  >
                    {{ $t("common.delete") }}
                  </button>
                </div>
              </template>
            </MTable>
          </div>

          <!-- 批量操作栏 -->
          <div
            v-if="groupActiveAction === 'batch'"
            class="class-batch-bar flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] border-t border-gray-200"
          >
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  :checked="isAllGroupSelected"
                  class="sr-only"
                  @change="handleGroupSelectAllToggle"
                />
                <span
                  class="class-batch-bar__checkbox w-4 h-4 rounded border flex items-center justify-center transition-colors"
                  :class="
                    isAllGroupSelected
                      ? 'is-checked'
                      : ''
                  "
                >
                  <svg
                    v-if="isAllGroupSelected"
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
                </span>
                <span class="text-sm text-[#4D4D4D]">{{ $t("class.selectAll") }}</span>
              </label>
              <span class="class-batch-bar__summary text-sm text-[#4D4D4D]">
                {{ $t("class.selected") }}
                <span class="class-batch-bar__count">{{ selectedGroupIds.length }}</span>
                {{ $t("class.items") }}
              </span>
            </div>
            <div class="class-batch-bar__actions flex items-center gap-4">
              <button
                class="class-batch-bar__action class-batch-bar__action--danger text-sm"
                @click="handleBatchDeleteGroup"
              >
                {{ $t("class.batchDelete") }}
              </button>
              <button
                class="class-batch-bar__action text-sm"
                @click="handleGroupBatchAction"
              >
                {{ $t("class.cancelBatch") }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 添加学生弹窗 -->
    <MModal
      v-model="showCreateModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--student-create relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="createForm.name = ''; showCreateModal = false"
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

        <!-- 标题居中 -->
        <h3 class="class-theme-modal__title text-center">
          {{ $t("class.addStudent") }}
        </h3>

        <!-- 添加方式切换 -->
        <div class="class-theme-modal__mode-switch">
          <button
            :class="[
              'class-theme-modal__mode-btn',
              addStudentMode === 'batch'
                ? 'is-active'
                : '',
            ]"
            @click="addStudentMode = 'batch'"
          >
            {{ $t("class.batchImport") }}
          </button>
          <button
            :class="[
              'class-theme-modal__mode-btn',
              addStudentMode === 'manual'
                ? 'is-active'
                : '',
            ]"
            @click="addStudentMode = 'manual'"
          >
            {{ $t("class.manualAdd") }}
          </button>
        </div>

        <!-- 批量导入模式 -->
        <template v-if="addStudentMode === 'batch'">
          <div class="class-theme-modal__import-actions">
            <button
              class="class-theme-modal__secondary-action"
              @click="handleImportStudents"
            >
              {{ $t("class.importStudentInfo") }}
            </button>
            <button
              class="class-theme-modal__secondary-action"
              @click="handleDownloadTemplate"
            >
              {{ $t("class.downloadTemplate") }}
            </button>
          </div>

          <p class="class-theme-modal__tip flex-1">
            {{ $t("class.batchImportTip") }}{{ studentPassword }}
          </p>
        </template>

        <!-- 手动添加模式 -->
        <template v-else>
          <div class="class-theme-modal__manual-form flex-1">
            <MInput
              v-model="createForm.name"
              :placeholder="$t('class.studentName')"
              class="class-theme-modal__field class-theme-modal__input"
              maxlength="10"
            />
            <p class="class-theme-modal__tip class-theme-modal__tip--center">
              {{ $t("class.studentDefaultPasswordIs") }}{{ studentPassword }}
            </p>
          </div>
        </template>

        <!-- 按钮 -->
        <div class="class-theme-modal__actions mt-auto">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="createForm.name = ''; showCreateModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleCreateStudent"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 创建班级弹窗 -->
    <MModal
      v-model="showCreateClassModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--form relative">
        <!-- 关闭按钮 -->
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showCreateClassModal = false"
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

        <!-- 标题居中 -->
        <h3 class="class-theme-modal__title text-center">
          {{ isEditClass ? $t("class.editClass") : $t("class.createClass") }}
        </h3>

        <!-- 表单 -->
        <div class="class-theme-modal__form">
          <MSelect
            v-model="createClassForm.gradeId"
            :options="gradeOptions"
            :placeholder="$t('class.grade')"
            class="class-theme-modal__field class-theme-modal__select"
            dropdown-class="class-theme-modal__dropdown"
          />
          <MInput
            v-model="createClassForm.className"
            :placeholder="$t('class.className')"
            class="class-theme-modal__field class-theme-modal__input"
          />
          <MInput
            v-model="createClassForm.teacherName"
            :placeholder="$t('class.teacher')"
            disabled
            class="class-theme-modal__field class-theme-modal__input class-theme-modal__input--disabled"
          />
        </div>

        <!-- 按钮 -->
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showCreateClassModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmCreateClass"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 创建班级成功提示弹窗 -->
    <MModal
      v-model="showClassCreatedTip"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--tip relative flex flex-col">
        <button class="class-theme-modal__close absolute top-5 right-5" @click="showClassCreatedTip = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="class-theme-modal__title text-center">{{ $t('common.tips') }}</h3>
        <p class="class-theme-modal__desc class-theme-modal__desc--center">{{ $t('class.classCreatedTip') }}</p>
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showClassCreatedTip = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="showClassCreatedTip = false; addStudentMode = 'manual'; createForm.name = ''; showCreateModal = true"
          >
            {{ $t('class.addStudentBtn') }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除班级确认弹窗 -->
    <MModal
      v-model="showDeleteClassModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--confirm relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showDeleteClassModal = false"
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

        <!-- 标题 -->
        <h3 class="class-theme-modal__title text-center">
          {{ $t("common.tips") }}
        </h3>

        <!-- 内容居中 -->
        <div class="class-theme-modal__confirm-body">
          <p class="class-theme-modal__desc class-theme-modal__desc--center">
            {{ $t("class.confirmDeleteClass") }}
          </p>
        </div>

        <!-- 按钮 -->
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showDeleteClassModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmDeleteClass"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 重置密码确认弹窗 -->
    <MModal
      v-model="showResetPasswordModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--confirm relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showResetPasswordModal = false"
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

        <!-- 标题 -->
        <h3 class="class-theme-modal__title text-center">
          {{ $t("common.tips") }}
        </h3>

        <!-- 内容居中 -->
        <div class="class-theme-modal__confirm-body">
          <p class="class-theme-modal__desc class-theme-modal__desc--center">
            {{
              $t("class.confirmResetPassword", { name: resettingStudent?.studentName })
            }}
          </p>
        </div>

        <!-- 按钮 -->
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showResetPasswordModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmResetPassword"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 移班弹窗 -->
    <MModal
      v-model="showTransferModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--form relative">
        <!-- 关闭按钮 -->
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showTransferModal = false"
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

        <!-- 标题 -->
        <h3 class="class-theme-modal__title text-center">
          {{ $t("class.transfer") }}
        </h3>

        <!-- 表单 -->
        <div class="class-theme-modal__form">
          <MSelect
            v-model="transferForm.gradeId"
            :options="transferGradeOptions"
            :placeholder="$t('class.selectGrade')"
            class="class-theme-modal__field class-theme-modal__select"
            dropdown-class="class-theme-modal__dropdown"
            @update:model-value="handleTransferGradeChange"
          />
          <MSelect
            v-model="transferForm.classId"
            :options="transferClassOptions"
            :placeholder="$t('class.selectClass')"
            :disabled="!transferForm.gradeId"
            class="class-theme-modal__field class-theme-modal__select"
            dropdown-class="class-theme-modal__dropdown"
            @change="handleTransferClassChange"
          />
        </div>

        <!-- 按钮 -->
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showTransferModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmTransfer"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除学生确认弹窗 -->
    <MModal
      v-model="showDeleteStudentModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--confirm relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showDeleteStudentModal = false"
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

        <!-- 标题 -->
        <h3 class="class-theme-modal__title text-center">
          {{ $t("common.tips") }}
        </h3>

        <!-- 内容居中 -->
        <div class="class-theme-modal__confirm-body">
          <p class="class-theme-modal__desc class-theme-modal__desc--center">
            {{
              $t("class.confirmDeleteStudent", {
                name: deletingStudent?.studentName || deletingStudent?.name || "-",
              })
            }}
          </p>
        </div>

        <!-- 按钮 -->
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showDeleteStudentModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmDeleteStudent"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量重置密码确认弹窗 -->
    <MModal
      v-model="showBatchResetPasswordModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--password relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="closeBatchResetPasswordModal"
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

        <!-- 标题 -->
        <h3 class="class-theme-modal__title text-center">
          {{ $t("common.tips") }}
        </h3>

        <!-- 内容居中 -->
        <p class="class-theme-modal__desc class-theme-modal__desc--center class-theme-modal__desc--spaced">
          {{ $t("class.confirmBatchResetPassword", { names: selectedStudentNames }) }}
        </p>
        <div class="class-theme-modal__password-wrap">
          <input
            v-model="batchResetPassword"
            :type="showBatchResetPassword ? 'text' : 'password'"
            minlength="6"
            maxlength="30"
            :placeholder="t('user.pleaseInputTeacherPassword')"
            class="class-theme-modal__plain-input"
          />
          <button
            type="button"
            class="class-theme-modal__password-toggle"
            @click="showBatchResetPassword = !showBatchResetPassword"
          >
            <svg
              v-if="showBatchResetPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
              />
              <path
                d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
              />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>

        <!-- 按钮 -->
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="closeBatchResetPasswordModal"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmBatchResetPassword"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量删除确认弹窗 -->
    <MModal
      v-model="showBatchDeleteModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--password relative flex flex-col">
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="closeBatchDeleteModal"
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
        <h3 class="class-theme-modal__title text-center">
          {{ $t("common.tips") }}
        </h3>
        <p class="class-theme-modal__desc class-theme-modal__desc--center class-theme-modal__desc--spaced">
          {{ $t("class.confirmBatchDelete", { count: selectedStudentIds.length }) }}
        </p>
        <div class="class-theme-modal__password-wrap">
          <input
            v-model="batchDeletePassword"
            :type="showBatchDeletePassword ? 'text' : 'password'"
            minlength="6"
            maxlength="30"
            autocomplete="new-password"
            :placeholder="t('user.pleaseInputTeacherPassword')"
            class="class-theme-modal__plain-input"
          />
          <button
            type="button"
            class="class-theme-modal__password-toggle"
            @click="showBatchDeletePassword = !showBatchDeletePassword"
          >
            <svg
              v-if="showBatchDeletePassword"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
              />
              <path
                d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
              />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="closeBatchDeleteModal"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmBatchDelete"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量移班弹窗 -->
    <MModal
      v-model="showBatchTransferModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--form relative">
        <!-- 关闭按钮 -->
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showBatchTransferModal = false"
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

        <!-- 标题 -->
        <h3 class="class-theme-modal__title text-center">
          {{ $t("class.batchTransfer") }}
        </h3>

        <!-- 提示文字 -->
        <p class="class-theme-modal__desc class-theme-modal__desc--center class-theme-modal__desc--spaced-sm">
          {{ $t("class.confirmBatchTransfer", { count: selectedStudentIds.length }) }}
        </p>

        <!-- 表单 -->
        <div class="class-theme-modal__form">
          <MSelect
            v-model="batchTransferForm.gradeId"
            :options="transferGradeOptions"
            :placeholder="$t('class.selectGrade')"
            class="class-theme-modal__field class-theme-modal__select"
            dropdown-class="class-theme-modal__dropdown"
            @update:model-value="handleBatchTransferGradeChange"
          />
          <MSelect
            v-model="batchTransferForm.classId"
            :options="batchTransferClassOptions"
            :placeholder="$t('class.selectClass')"
            :disabled="!batchTransferForm.gradeId"
            class="class-theme-modal__field class-theme-modal__select"
            dropdown-class="class-theme-modal__dropdown"
          />
        </div>

        <!-- 按钮 -->
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showBatchTransferModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmBatchTransfer"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 新密码展示弹窗 -->
    <MModal
      v-model="showNewPasswordModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--confirm relative flex flex-col">
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showNewPasswordModal = false"
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
        <h3 class="class-theme-modal__title text-center">
          {{ $t("common.tips") }}
        </h3>
        <div class="class-theme-modal__confirm-body class-theme-modal__confirm-body--stack">
          <p class="class-theme-modal__desc class-theme-modal__desc--center class-theme-modal__desc--tight">
            {{ $t("class.passwordResetSuccess") }}
          </p>
          <p class="class-theme-modal__value">
            {{ $t("class.newPassword") }}{{ newPassword }}
          </p>
        </div>
        <div class="class-theme-modal__actions class-theme-modal__actions--single">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="showNewPasswordModal = false"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 快捷登录弹窗 -->
    <MModal
      v-model="showQuickLoginModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--tip relative">
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showQuickLoginModal = false"
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
        <h3 class="class-theme-modal__title text-center">
          {{ $t("class.enableQuickLoginTitle") }}
        </h3>
        <p class="class-theme-modal__desc class-theme-modal__desc--center class-theme-modal__desc--spaced">
          {{ $t("class.quickLoginDesc") }}
        </p>
        <div class="class-theme-modal__notice">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ $t("class.quickLoginWarning") }}</span>
        </div>
        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showQuickLoginModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmQuickLogin"
          >
            {{ $t("class.create") }}
          </button>
        </div>
      </div>
    </MModal>

    <DisableQuickLoginModal
      v-model="showDisableQuickLoginModal"
      :title="$t('studentManage.disableQuickLoginTitle')"
      :content="$t('studentManage.disableQuickLoginContent')"
      :tip="$t('studentManage.disableQuickLoginTip')"
      :cancel-text="$t('common.cancel')"
      :confirm-text="$t('common.confirm')"
      @confirm="handleConfirmDisableQuickLogin"
    />

    <!-- 创建/编辑小组弹窗 -->
    <MModal
      v-model="showGroupModal"
      custom-width="620px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--group relative">
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showGroupModal = false"
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

        <h3 class="class-theme-modal__title text-center">
          {{ isEditGroupMode ? $t("class.editGroup") : $t("class.createGroup") }}
        </h3>

        <!-- 第一步：填写小组信息 -->
        <div class="class-group-modal__section">
          <p class="class-group-modal__section-title">
            {{ $t("class.stepOneGroupInfo") }}
          </p>
          <div class="class-group-modal__form">
            <div class="class-group-modal__row">
              <span class="class-group-modal__required">*</span>
              <span class="class-group-modal__label">{{ $t("class.groupName") }}：</span>
              <MInput
                v-model="groupForm.name"
                :placeholder="$t('class.pleaseInputGroupName')"
                maxlength="10"
                class="class-group-modal__field class-theme-modal__input"
              />
            </div>
            <div class="class-group-modal__row">
              <span class="class-group-modal__required class-group-modal__required--empty">*</span>
              <span class="class-group-modal__label">{{ $t("class.groupDesc") }}：</span>
              <MInput
                v-model="groupForm.remarks"
                :placeholder="$t('class.pleaseInputGroupName')"
                maxlength="100"
                class="class-group-modal__field class-theme-modal__input"
              />
            </div>
          </div>
        </div>

        <!-- 第二步：添加小组成员 -->
        <div class="class-group-modal__section">
          <div class="class-group-modal__section-head">
            <div class="flex-1">
              <p class="class-group-modal__section-title class-group-modal__section-title--compact">
                {{ $t("class.stepTwoAddMembers") }}
              </p>
              <p class="class-group-modal__hint">
                {{ $t("class.rememberSelectLeader") }}
              </p>
            </div>
            <button
              class="class-group-modal__add-btn"
              @click="handleAddGroupMember"
            >
              + {{ $t("class.addMember") }}
            </button>
          </div>

          <!-- 成员表格 -->
          <div class="class-group-modal__table-wrap">
            <table class="w-full">
              <thead class="class-group-modal__table-head">
                <tr>
                  <th
                    class="class-group-modal__th px-3 py-2 text-left whitespace-nowrap"
                  >
                    {{ $t("class.serialNumber") }}
                  </th>
                  <th
                    class="class-group-modal__th px-3 py-2 text-left whitespace-nowrap"
                  >
                    {{ $t("class.account") }}
                  </th>
                  <th
                    class="class-group-modal__th px-3 py-2 text-left whitespace-nowrap"
                  >
                    {{ $t("class.name") }}
                  </th>
                  <th
                    class="class-group-modal__th px-3 py-2 text-center leading-tight min-w-[100px]"
                  >
                    {{ $t("class.isLeader") }}
                  </th>
                  <th
                    class="class-group-modal__th px-3 py-2 text-center whitespace-nowrap"
                  >
                    {{ $t("common.operation") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(member, index) in groupForm.members"
                  :key="member.id"
                  class="class-group-modal__tr border-t border-gray-100"
                >
                  <td class="class-group-modal__td px-3 py-2">{{ index + 1 }}</td>
                  <td class="class-group-modal__td px-3 py-2">
                    {{ member.studentNumber }}
                  </td>
                  <td class="class-group-modal__td px-3 py-2">
                    {{ member.studentName }}
                  </td>
                  <td class="class-group-modal__td px-3 py-2 text-center">
                    <input
                      type="radio"
                      :name="'group-leader'"
                      :checked="groupForm.leaderId === member.id"
                      class="class-group-modal__radio"
                      @change="groupForm.leaderId = member.id"
                    />
                  </td>
                  <td class="class-group-modal__td px-3 py-2 text-center">
                    <button
                      class="class-group-modal__delete-btn"
                      @click="handleRemoveGroupMember(index)"
                    >
                      {{ $t("common.delete") }}
                    </button>
                  </td>
                </tr>
                <!-- 空数据 -->
                <tr v-if="!groupForm.members.length">
                  <td colspan="5" class="px-4 py-8 text-center">
                    <div class="flex flex-col items-center gap-2 text-gray-400">
                      <svg
                        class="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span class="text-sm">{{ $t("common.noData") }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showGroupModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmGroup"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 添加成员弹窗 -->
    <MModal
      v-model="showAddMemberModal"
      custom-width="620px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="class-theme-modal class-theme-modal--group relative">
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="showAddMemberModal = false"
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

        <h3 class="class-theme-modal__title text-center">
          {{ $t("class.selectMembers") }}
        </h3>

        <!-- 搜索栏 -->
        <div class="class-group-modal__search">
          <MInput
            v-model="memberSearchKeyword"
            :placeholder="$t('class.searchStudentPlaceholder')"
            clearable
            class="class-group-modal__search-input"
            @enter="handleMemberSearch"
            @clear="handleMemberSearch"
          >
            <template #prefix>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </template>
          </MInput>
        </div>

        <!-- 学生统计 -->
        <div class="class-group-modal__meta">
          {{ $t("class.totalStudents", { count: filteredAvailableStudents.length }) }}
        </div>

        <!-- 学生列表表格 -->
        <div class="class-group-modal__table-wrap class-group-modal__table-wrap--scroll">
          <table class="w-full">
            <thead class="class-group-modal__table-head sticky top-0">
              <tr>
                <th class="class-group-modal__th w-10 px-2 py-3 text-left">
                  <input
                    type="checkbox"
                    :checked="isAllMemberSelected"
                    class="class-group-modal__checkbox"
                    @change="toggleAllMemberSelection"
                  />
                </th>
                <th class="class-group-modal__th w-16 px-2 py-3 text-left">
                  {{ $t("class.serialNumber") }}
                </th>
                <th class="class-group-modal__th px-2 py-3 text-left">
                  {{ $t("class.account") }}
                </th>
                <th class="class-group-modal__th px-2 py-3 text-left">
                  {{ $t("class.name") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(student, index) in filteredAvailableStudents"
                :key="student.id"
                class="class-group-modal__tr border-b border-gray-100 last:border-b-0 cursor-pointer"
                @click="toggleStudentSelection(student)"
              >
                <td class="class-group-modal__td px-2 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedMemberIds.includes(student.id)"
                    class="class-group-modal__checkbox"
                    @click.stop
                    @change="toggleStudentSelection(student)"
                  />
                </td>
                <td class="class-group-modal__td px-2 py-3">{{ index + 1 }}</td>
                <td class="class-group-modal__td px-2 py-3">
                  {{ student.studentNumber || "-" }}
                </td>
                <td class="class-group-modal__td px-2 py-3">
                  {{ student.studentName || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
          <div
            v-if="!filteredAvailableStudents.length"
            class="px-4 py-8 text-center text-gray-400"
          >
            {{ $t("class.noStudentsToAdd") }}
          </div>
        </div>

        <!-- 已选学生标签 -->
        <div v-if="selectedMemberIds.length" class="class-group-modal__selected">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="id in selectedMemberIds"
              :key="id"
              class="class-group-modal__tag group inline-flex items-center gap-1 px-3 py-1 cursor-pointer"
            >
              <span>{{ getStudentNameById(id) }}</span>
              <button
                class="class-group-modal__tag-remove w-4 h-4 items-center justify-center hidden group-hover:flex"
                @click="removeSelectedMember(id)"
              >
                <svg
                  class="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="class-theme-modal__actions mt-6">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="showAddMemberModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmAddMembers"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除小组确认弹窗 -->
    <MModal
      v-model="showDeleteGroupModal"
      custom-width="392px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div
        class="class-theme-modal relative flex flex-col"
        :class="isBatchDeleteGroup ? 'class-theme-modal--password' : 'class-theme-modal--confirm'"
      >
        <button
          class="class-theme-modal__close absolute top-5 right-5"
          @click="closeDeleteGroupModal"
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

        <h3 class="class-theme-modal__title text-center">
          {{ $t("common.tips") }}
        </h3>

        <div v-if="!isBatchDeleteGroup" class="class-theme-modal__confirm-body">
          <p class="class-theme-modal__desc class-theme-modal__desc--center">
            {{ $t("class.confirmDeleteGroup", { name: deletingGroup?.teamName }) }}
          </p>
        </div>
        <template v-else>
          <p class="class-theme-modal__desc class-theme-modal__desc--center class-theme-modal__desc--spaced">
            {{ $t("class.confirmBatchDeleteGroup", { count: selectedGroupIds.length }) }}
          </p>
          <div class="class-theme-modal__password-wrap">
            <input
              v-model="batchDeleteGroupPassword"
              :type="showBatchDeleteGroupPassword ? 'text' : 'password'"
              minlength="6"
              maxlength="30"
              :placeholder="t('user.pleaseInputTeacherPassword')"
              class="class-theme-modal__plain-input"
            />
            <button
              type="button"
              class="class-theme-modal__password-toggle"
              @click="showBatchDeleteGroupPassword = !showBatchDeleteGroupPassword"
            >
              <svg
                v-if="showBatchDeleteGroupPassword"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                />
                <path
                  d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </template>

        <div class="class-theme-modal__actions">
          <button
            class="class-theme-modal__btn class-theme-modal__btn--ghost"
            @click="closeDeleteGroupModal"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="class-theme-modal__btn class-theme-modal__btn--primary"
            @click="handleConfirmDeleteGroup"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "~/components/ui";
import { useTeacher } from "@/composables/api/useTeacher";
import { useAuth } from "@/composables/api/useAuth";
import { title } from "process";
import { _minWidth } from "#tailwind-config/theme";

definePageMeta({
  layout: "sidebar",
});

const route = useRoute();
const { t } = useI18n();
const { user } = useAuth();
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 30;
const isPasswordLengthValid = (value: string) => {
  const length = (value || "").trim().length;
  return length >= PASSWORD_MIN_LENGTH && length <= PASSWORD_MAX_LENGTH;
};

// 当前用户名称
const currentUserName = computed(() => {
  const currentUser = user.value || {};
  return (
    currentUser.nickName ||
    currentUser.userName ||
    currentUser.nickname ||
    currentUser.nick_name ||
    currentUser.user_name ||
    currentUser.username ||
    ""
  );
});
const {
  getGradeDict,
  getClassList,
  getGradeClassList,
  createClass,
  updateClass,
  deleteClass,
  getStudentList,
  addStudent,
  resetPassword,
  transferClass,
  removeStudent,
  createQuickLogin,
  getQuickLoginInfo,
  stopQuickLogin,
  getStudentPassword,
  exportStudentInfo,
  downloadTemplate,
  importStudent,
  getGroupList,
  addGroup,
  getAddStudentList,
  deleteGroup,
  updateGroup,
  getGroupMemberList,
} = useTeacher();

// Tab 数据
const tabList = computed(() => [
  { label: t("class.studentManagement"), value: "student" },
  { label: t("class.groupManagement"), value: "group" },
]);
const activeTab = ref("student");

// 搜索关键词
const searchKeyword = ref("");

// 学生统一密码
const studentPassword = ref("");

// 加载状态
const loading = ref(false);
// 页面初始化状态（用于防止闪烁）
const pageInitialized = ref(false);

// 当前选中的班级
const selectedClass = ref<any>(null);

// 展开的节点
const expandedKeys = ref<(string | number)[]>([1]);

// 年级班级数据（树形结构）
const treeData = ref<any[]>([]);

// 班级选项（用于下拉选择）
const classOptions = computed(() => {
  const options: { label: string; value: number }[] = [];
  treeData.value.forEach((grade: any) => {
    grade.children?.forEach((cls: any) => {
      options.push({ label: `${grade.name}${cls.name}`, value: cls.id });
    });
  });
  return options;
});

// 表格列配置
const tableColumns = computed(() => [
  { key: "studentName", title: t("class.studentName"), minWidth: "148px" },
  { key: "studentNumber", title: t("class.studentAccount"), minWidth: "120px" },
  { key: "createTime", title: t("class.createTime"), minWidth: "130px" },
  ...(isCurrentClassQuickLogin.value
    ? [
        {
          key: "loginStatus",
          title: t("class.loginStatus"),
          width: "140px",
          align: "center" as const,
        },
      ]
    : []),
  {
    key: "action",
    title: t("common.operation"),
    width: "148px",
    align: "center" as const,
  },
]);

const studentAvatarThemes = [
  { bg: "#dbeafe", text: "#2563eb" },
  { bg: "#ede9fe", text: "#7c3aed" },
  { bg: "#ffedd5", text: "#ea580c" },
  { bg: "#ccfbf1", text: "#0f766e" },
  { bg: "#fee2e2", text: "#dc2626" },
  { bg: "#fef3c7", text: "#d97706" },
];

const getStudentAvatarTheme = (name: string) => {
  const safeName = String(name || "").trim();
  const seed = safeName
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return studentAvatarThemes[seed % studentAvatarThemes.length];
};

const getStudentAvatarText = (name: string) => {
  const safeName = String(name || "").trim();
  return safeName.charAt(0) || "?";
};

// 学生列表
const studentList = ref<any[]>([]);

// ===== 小组管理相关 =====
const groupSearchKeyword = ref("");
const groupLoading = ref(false);
const groupList = ref<any[]>([]);
const selectedGroupIds = ref<string[]>([]);
type GroupActionType = "batch" | null;
const groupActiveAction = ref<GroupActionType>(null);

// 小组表格列配置
const groupTableColumns = computed(() => [
  { key: "teamName", title: t("class.groupName"), minWidth: "112px" },
  { key: "leaderName", title: t("class.groupLeader"), minWidth: "124px" },
  { key: "members", title: t("class.groupMembers"), minWidth: "132px" },
  { key: "remarks", title: t("class.groupRemarks"), minWidth: "120px" },
  { key: "createTime", title: t("class.createTime"), minWidth: "136px" },
  {
    key: "action",
    title: t("common.operation"),
    width: "92px",
    align: "center" as const,
  },
]);

// 小组弹窗
const showGroupModal = ref(false);
const showDeleteGroupModal = ref(false);
const isEditGroupMode = ref(false);
const isBatchDeleteGroup = ref(false);
const batchDeleteGroupPassword = ref("");
const showBatchDeleteGroupPassword = ref(false);
const deletingGroup = ref<any>(null);
const originalMembers = ref<any[]>([]); // 编辑时记录原始成员，用于计算删除的成员
const groupForm = reactive({
  id: "",
  name: "",
  remarks: "",
  leaderId: "" as string,
  members: [] as any[],
});

// 添加成员弹窗
const showAddMemberModal = ref(false);
const selectedMemberIds = ref<string[]>([]);
const memberSearchKeyword = ref("");
const availableStudents = ref<any[]>([]);

// 加载可添加的学生列表
const loadAvailableStudents = async () => {
  if (!selectedClass.value?.id) return;
  try {
    const data = await getAddStudentList(selectedClass.value.id);
    availableStudents.value = data || [];
  } catch (error) {
    console.error("获取可添加学生列表失败:", error);
    availableStudents.value = [];
  }
};

// 过滤后的可添加学生（根据搜索关键词，排除已添加的成员）
const filteredAvailableStudents = computed(() => {
  const addedIds = groupForm.members.map((m) => m.id);
  const filtered = availableStudents.value.filter((s) => !addedIds.includes(s.id));
  const keyword = memberSearchKeyword.value.trim().toLowerCase();
  if (!keyword) return filtered;
  return filtered.filter(
    (s) =>
      s.studentName?.toLowerCase().includes(keyword) ||
      s.studentNumber?.toLowerCase().includes(keyword)
  );
});

// 成员搜索
const handleMemberSearch = () => {
  // 搜索由 computed 自动处理
};

// 添加成员全选
const isAllMemberSelected = computed(() => {
  if (!filteredAvailableStudents.value.length) return false;
  return filteredAvailableStudents.value.every((s) =>
    selectedMemberIds.value.includes(s.id)
  );
});

// 切换全选
const toggleAllMemberSelection = () => {
  if (isAllMemberSelected.value) {
    // 取消全选：移除当前过滤列表中的所有学生
    const filteredIds = filteredAvailableStudents.value.map((s) => s.id);
    selectedMemberIds.value = selectedMemberIds.value.filter(
      (id) => !filteredIds.includes(id)
    );
  } else {
    // 全选：添加当前过滤列表中的所有学生
    const filteredIds = filteredAvailableStudents.value.map((s) => s.id);
    const newIds = filteredIds.filter((id) => !selectedMemberIds.value.includes(id));
    selectedMemberIds.value.push(...newIds);
  }
};

// 根据ID获取学生姓名
const getStudentNameById = (id: string) => {
  const student = availableStudents.value.find((s) => s.id === id);
  return student?.studentName || student?.name || id;
};

const formatLimitedLeaderName = (name?: string | null) => {
  if (!name) return "";
  return name.length > 10 ? name.slice(0, 10) : name;
};

// 移除已选学生
const removeSelectedMember = (id: string) => {
  const index = selectedMemberIds.value.indexOf(id);
  if (index > -1) {
    selectedMemberIds.value.splice(index, 1);
  }
};

// 小组全选
const isAllGroupSelected = computed(() => {
  if (!groupList.value.length) return false;
  return groupList.value.every((item) => selectedGroupIds.value.includes(item.id));
});

// 格式化小组成员列表（数组转逗号分隔字符串）
// const formatMembers = (members: any[]) => {
//   if (!members || !Array.isArray(members) || members.length === 0) {
//     return "-";
//   }
//   return members.map((s) => s.studentName || s.name).join("、");
// };

// 创建班级成功后提示弹窗
const showClassCreatedTip = ref(false);

// 创建学生弹窗
const showCreateModal = ref(false);
const addStudentMode = ref<"batch" | "manual">("batch");
const createForm = reactive({
  name: "",
  account: "",
  classId: null as number | null,
});

// 创建/编辑班级弹窗
const showCreateClassModal = ref(false);
const isEditClass = ref(false); // 是否编辑模式
const editingClassId = ref<string | null>(null); // 编辑中的班级ID
const createClassForm = reactive({
  gradeId: null as string | null,
  className: "",
  teacherName: "",
});

// 删除班级确认弹窗
const showDeleteClassModal = ref(false);
const deletingClass = ref<any>(null);

// 快捷登录弹窗
const showQuickLoginModal = ref(false);
const showDisableQuickLoginModal = ref(false);
const isQuickLoginEnabled = ref(false); // 快捷登录是否已启用
const quickLoginData = ref<{
  classCode?: string;
  classId?: string;
  classCodePwd?: string;
  expirationDate?: string;
}>({});
const quickLoginClassId = ref<string | null>(null); // 记录启用快捷登录的班级ID
// 快捷登录链接
const quickLoginUrl = computed(() => {
  if (!quickLoginData.value.classCode) return "";
  return `${window.location.origin}/student?code=${quickLoginData.value.classCode}`;
});
// 当前班级是否是启用快捷登录的班级
const isCurrentClassQuickLogin = computed(() => {
  return !!(
    quickLoginClassId.value && quickLoginClassId.value === selectedClass.value?.id
  );
});
// 是否在其他班级启用了快捷登录
const isOtherClassQuickLogin = computed(() => {
  return !!(
    quickLoginClassId.value && quickLoginClassId.value !== selectedClass.value?.id
  );
});

// 重置密码确认弹窗
const showResetPasswordModal = ref(false);
const resettingStudent = ref<any>(null);

// 移班弹窗
const showTransferModal = ref(false);
const transferringStudent = ref<any>(null);
const transferForm = reactive({
  gradeId: null as string | null,
  classId: null as string | null,
  id: null as string | null, // 选中班级的classId
  teacherId: null as string | null, // 选中班级的teacherId
});
const transferClassList = ref<any[]>([]); // 移班弹窗的班级列表
const transferGradeClassData = ref<any[]>([]);

// 删除学生确认弹窗
const showDeleteStudentModal = ref(false);
const deletingStudent = ref<any>(null);

// 批量重置密码确认弹窗
const showBatchResetPasswordModal = ref(false);
const batchResetPassword = ref("");
const showBatchResetPassword = ref(false);

// 批量删除确认弹窗
const showBatchDeleteModal = ref(false);
const batchDeletePassword = ref("");
const showBatchDeletePassword = ref(false);

// 批量移班弹窗
const showBatchTransferModal = ref(false);
const batchTransferForm = reactive({
  gradeId: null as string | null,
  classId: null as string | null,
});
const batchTransferClassList = ref<any[]>([]); // 批量移班弹窗的班级列表

// 新密码展示弹窗
const showNewPasswordModal = ref(false);
const newPassword = ref("");

// 年级选项
const gradeOptions = ref<{ label: string; value: string }[]>([]);
const transferGradeOptions = computed(() =>
  transferGradeClassData.value.map((item: any) => ({
    label: item.gradeName,
    value: String(item.grade),
  }))
);

// 老师选项
const teacherOptions = [
  { label: "张老师", value: 1 },
  { label: "李老师", value: 2 },
  { label: "王老师", value: 3 },
];

// 批量选择
const selectedStudentIds = ref<string[]>([]);

// 是否全选
const isAllSelected = computed(() => {
  return (
    studentList.value.length > 0 &&
    selectedStudentIds.value.length === studentList.value.length
  );
});

// 按钮状态 - 互斥选择
type ActionType = "create" | "quickLogin" | "export" | "batch" | null;
const activeAction = ref<ActionType>(null);

const exitStudentBatchMode = () => {
  activeAction.value = null;
  selectedStudentIds.value = [];
};

const exitGroupBatchMode = () => {
  groupActiveAction.value = null;
  selectedGroupIds.value = [];
};

// ===== 事件处理 =====

// 选择全部班级
const handleSelectAll = () => {
  selectedClass.value = null;
  ElMessage.info(t("class.selectedAllClass"));
};
// 加载年级字典
const loadGradeOptions = async () => {
  try {
    const data = await getGradeDict();
    console.log(data, "年级字典列表");
    gradeOptions.value = (data || []).map((item: any) => ({
      label: item.gradeName,
      value: String(item.grade),
    }));
  } catch (error) {
    console.error("获取年级字典失败:", error);
  }
};
// 加载班级列表
const loadClassList = async (
  targetClassId?: string,
  createdClassMeta?: { className?: string; grade?: string | number | null }
) => {
  loading.value = true;
  try {
    let data = await getClassList();
    const gradeList = data?.my || data || [];
    treeData.value = (gradeList).map((item: any) => ({
      id: `grade_${item.grade}`,
      name: item.gradeName,
      grade: item.grade,
      children: (item.classList || []).map((cls: any) => ({
        id: cls.classId,
        name: cls.className,
        teacherId: cls.teacherId,
        teacherName: cls.teacherName,
        grade: item.grade,
        gradeName: item.gradeName,
      })),
    }));

    // 尝试选中指定班级，否则选第一个
    let targetClass: any = null;
    let targetGrade: any = null;
    if (targetClassId) {
      for (const grade of treeData.value) {
        const found = grade.children?.find((cls: any) => String(cls.id) === String(targetClassId));
        if (found) {
          targetClass = found;
          targetGrade = grade;
          break;
        }
      }
    }
    if (!targetClass && createdClassMeta?.className && createdClassMeta?.grade !== null && createdClassMeta?.grade !== undefined) {
      const targetGradeValue = String(createdClassMeta.grade);
      const targetClassName = createdClassMeta.className.trim();
      for (const grade of treeData.value) {
        if (String(grade.grade) !== targetGradeValue) continue;
        const candidates = Array.isArray(grade.children) ? [...grade.children].reverse() : [];
        const found = candidates.find(
          (cls: any) => String(cls.name || "").trim() === targetClassName
        );
        if (found) {
          targetClass = found;
          targetGrade = grade;
          break;
        }
      }
    }
    if (!targetClass && treeData.value.length > 0 && treeData.value[0].children?.length > 0) {
      targetGrade = treeData.value[0];
      targetClass = targetGrade.children[0];
    }
    if (targetClass && targetGrade) {
      const isNewClass = selectedClass.value?.id !== targetClass.id;
      selectedClass.value = targetClass;
      if (isNewClass) {
        activeAction.value = null;
        selectedStudentIds.value = [];
        groupActiveAction.value = null;
        selectedGroupIds.value = [];
        searchKeyword.value = "";
      }
      if (!expandedKeys.value.includes(targetGrade.id)) {
        expandedKeys.value.push(targetGrade.id);
      }
      loadStudentList(targetClass.id, activeTab.value === "student");
      loadGroupList(activeTab.value === "group");
    }
  } catch (error) {
    console.error("获取班级列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 获取学生列表
const loadStudentList = async (classId?: string, showLoading = true) => {
  const id = classId || selectedClass.value?.id;
  if (!id) return;

  if (showLoading && studentList.value.length === 0) {
    loading.value = true;
  }
  try {
    const keyword = searchKeyword.value?.trim();
    const params = {
      classId: id,
      numberName: keyword || undefined,
    };
    console.log(params, "参数");

    const data = await getStudentList(params);
    console.log(data, "学生列表");
    studentList.value = data || [];
  } catch (error) {
    console.error("获取学生列表失败:", error);
    studentList.value = [];
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(async () => {
  await Promise.all([
    loadGradeOptions(),
    loadClassList(),
    loadQuickLoginStatus(),
    loadStudentPassword(),
  ]);
  pageInitialized.value = true;
});

// 加载学生统一密码
const loadStudentPassword = async () => {
  try {
    const data = await getStudentPassword();
    studentPassword.value = data.studentPwd || "";
  } catch (error) {
    console.error("获取学生统一密码失败:", error);
  }
};

// 加载快捷登录状态
const loadQuickLoginStatus = async () => {
  try {
    const data = await getQuickLoginInfo();
    console.log("快捷登录状态:", data);
    if (data && data.classCode) {
      quickLoginData.value = data;
      quickLoginClassId.value = data.classId;
      isQuickLoginEnabled.value = true;
    }
  } catch (error) {
    console.error("获取快捷登录状态失败:", error);
  }
};

// 树节点选择
const handleTreeSelect = (node: any) => {
  if (!node.children) {
    const isNewClass = selectedClass.value?.id !== node.id;
    selectedClass.value = node;
    if (isNewClass) {
      studentList.value = [];
      groupList.value = [];
      activeAction.value = null;
      selectedStudentIds.value = [];
      groupActiveAction.value = null;
      selectedGroupIds.value = [];
      searchKeyword.value = "";
    }
    loadStudentList(node.id, activeTab.value === "student");
    loadGroupList(activeTab.value === "group");
  }
};

// 树节点展开/折叠
const handleTreeExpand = (key: string | number, expanded: boolean) => {
  if (expanded) {
    expandedKeys.value.push(key);
  } else {
    expandedKeys.value = expandedKeys.value.filter((k) => k !== key);
  }
};

// 编辑班级
const handleEditClass = (node: any) => {
  console.log(node, "班级信息");
  isEditClass.value = true;
  editingClassId.value = node.id;
  // 设置年级（使用班级节点上的grade字段）
  createClassForm.gradeId = String(node.grade) || null;
  createClassForm.className = node.name || "";
  createClassForm.teacherName =
    node.teacherName || selectedClass.value?.teacherName || currentUserName.value || "";
  showCreateClassModal.value = true;
};

// 删除班级
const handleDeleteClass = (node: any) => {
  deletingClass.value = node;
  showDeleteClassModal.value = true;
};

// 确认删除班级
const handleConfirmDeleteClass = async () => {
  if (!deletingClass.value) {
    showDeleteClassModal.value = false;
    return;
  }

  try {
    await deleteClass(deletingClass.value.id);
    ElMessage.success(`已删除班级：${deletingClass.value.name}`);
    // 刷新班级列表
    await loadClassList();
  } catch (error) {
    console.error("删除班级失败:", error);
  } finally {
    showDeleteClassModal.value = false;
    deletingClass.value = null;
  }
};

// 创建班级
const handleCreateNewClass = (gradeNode: any) => {
  isEditClass.value = false;
  editingClassId.value = null;
  createClassForm.gradeId = null;
  createClassForm.className = "";
  createClassForm.teacherName =
    selectedClass.value?.teacherName || currentUserName.value || "";
  // 如果有传入年级节点，预设年级
  if (gradeNode) {
    createClassForm.gradeId = gradeNode.id;
  }
  showCreateClassModal.value = true;
};

// 确认创建/编辑班级
const handleConfirmCreateClass = async () => {
  if (!createClassForm.gradeId) {
    ElMessage.error(t("class.pleaseSelectGrade"));
    return;
  }
  if (!createClassForm.className) {
    ElMessage.error(t("class.pleaseInputClassName"));
    return;
  }

  // 获取选中年级的label
  const selectedGrade = gradeOptions.value.find(
    (item) => item.value === createClassForm.gradeId
  );

  try {
    if (isEditClass.value && editingClassId.value) {
      // 编辑班级
      await updateClass({
        id: editingClassId.value,
        className: createClassForm.className,
        grade: Number(createClassForm.gradeId),
        gradeName: selectedGrade?.label || "",
      });
      ElMessage.success(t("common.editSuccess"));
    } else {
      // 创建班级
      const createdClassMeta = {
        className: createClassForm.className,
        grade: createClassForm.gradeId,
      };
      const newClassData = await createClass({
        className: createClassForm.className,
        grade: Number(createClassForm.gradeId),
        gradeName: selectedGrade?.label || "",
      });
      ElMessage.success(t("common.createSuccess"));
      const newClassId = newClassData?.classId || newClassData?.id;
      await loadClassList(newClassId ? String(newClassId) : undefined, createdClassMeta);
      showCreateClassModal.value = false;
      isEditClass.value = false;
      editingClassId.value = null;
      createClassForm.gradeId = null;
      createClassForm.className = "";
      showClassCreatedTip.value = true;
      return;
    }
    // 刷新班级列表
    loadClassList();
    showCreateClassModal.value = false;
    // 重置表单
    isEditClass.value = false;
    editingClassId.value = null;
    createClassForm.gradeId = null;
    createClassForm.className = "";
    createClassForm.teacherName = "";
  } catch (error) {
    console.error("操作失败:", error);
  }
};

// 搜索
const handleSearch = () => {
  loadStudentList();
};

const noClassDataWarning = "当前无班级数据，请先创建班级";
const noStudentDataWarning = "当前无学生数据，请先创建学生";

const hasAnyClassData = computed(() =>
  treeData.value.some(
    (grade: any) => Array.isArray(grade.children) && grade.children.length > 0
  )
);

const ensureClassDataReady = () => {
  if (hasAnyClassData.value) {
    return true;
  }
  ElMessage.warning(noClassDataWarning);
  return false;
};

// 创建学生 - 始终打开弹窗，不参与互斥切换
const handleCreateAction = () => {
  if (!ensureClassDataReady()) {
    return;
  }
  showCreateModal.value = true;
};

// 检查当前班级是否有学生（搜索状态下兜底查全量）
const checkCurrentClassHasStudents = async () => {
  const classId = selectedClass.value?.id;
  if (!classId) return false;

  // 未搜索时，直接使用当前列表
  if (!searchKeyword.value?.trim()) {
    return studentList.value.length > 0;
  }

  // 搜索状态下，补查一次全量，避免“有学生但当前搜索为空”被误判
  try {
    const data = await getStudentList({ classId });
    return Array.isArray(data) ? data.length > 0 : !!data?.length;
  } catch (error) {
    console.error("检查班级学生数据失败:", error);
    return studentList.value.length > 0;
  }
};

const ensureStudentActionReady = async (options?: {
  openCreateModalOnEmptyStudent?: boolean;
}) => {
  if (!ensureClassDataReady()) {
    return false;
  }

  if (!selectedClass.value?.id) {
    ElMessage.warning(t("class.pleaseSelectClassFirst"));
    return false;
  }

  const hasStudents = await checkCurrentClassHasStudents();
  if (hasStudents) {
    return true;
  }

  ElMessage.warning(noStudentDataWarning);
  if (options?.openCreateModalOnEmptyStudent) {
    showCreateModal.value = true;
  }
  return false;
};

// 快捷登录or停用快捷登录
const handleQuickLogin = async () => {
  if (isCurrentClassQuickLogin.value) {
    showDisableQuickLoginModal.value = true;
  } else if (!isOtherClassQuickLogin.value) {
    const canContinue = await ensureStudentActionReady({
      openCreateModalOnEmptyStudent: true,
    });
    if (!canContinue) {
      return;
    }
    showQuickLoginModal.value = true;
  }
};

const handleConfirmDisableQuickLogin = async () => {
  if (!selectedClass.value?.id) {
    showDisableQuickLoginModal.value = false;
    return;
  }

  try {
    await stopQuickLogin(selectedClass.value.id);
    isQuickLoginEnabled.value = false;
    quickLoginClassId.value = null;
    quickLoginData.value = {};
    if (typeof window !== "undefined") {
      localStorage.removeItem("teacher_quick_login_info");
    }
    showDisableQuickLoginModal.value = false;
    ElMessage.info(t("class.quickLoginDisabled"));
  } catch (error) {
    console.error("停用快捷登录失败:", error);
  }
};

// 确认创建快捷登录
const handleConfirmQuickLogin = async () => {
  if (!selectedClass.value?.id) {
    ElMessage.warning(t("class.noStudentDataPleaseCreate"));
    return;
  }
  try {
    const data = await createQuickLogin(selectedClass.value.id);
    console.log("快捷登录数据:", data);
    quickLoginData.value = data || {};
    quickLoginClassId.value = selectedClass.value.id;
    ElMessage.success(t("class.quickLoginEnabled"));
    isQuickLoginEnabled.value = true;
    showQuickLoginModal.value = false;
  } catch (error) {
    console.error("创建快捷登录失败:", error);
  }
};

// 检查快捷登录状态
const checkQuickLoginStatus = async (classId: string) => {
  try {
    const data = await createQuickLogin(classId);
    if (data && data.classCode) {
      quickLoginData.value = data;
      quickLoginClassId.value = data.classId || classId;
      isQuickLoginEnabled.value = true;
    } else {
      // 当前班级没有快捷登录，但不清除其他班级的状态
      if (quickLoginClassId.value === classId) {
        quickLoginData.value = {};
        quickLoginClassId.value = null;
        isQuickLoginEnabled.value = false;
      }
    }
  } catch (error) {
    // 当前班级没有快捷登录
    if (quickLoginClassId.value === classId) {
      quickLoginData.value = {};
      quickLoginClassId.value = null;
      isQuickLoginEnabled.value = false;
    }
  }
};

// 复制到剪贴板
const fallbackCopyText = (text: string) => {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  document.body.removeChild(textarea);
  return copied;
};

const copyToClipboard = async (text?: string) => {
  if (!text) return;
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      ElMessage.success(t("common.copySuccess"));
      return;
    }
    if (fallbackCopyText(text)) {
      ElMessage.success(t("common.copySuccess"));
      return;
    }
    ElMessage.error(t("common.copyFailed"));
  } catch (error) {
    if (fallbackCopyText(text)) {
      ElMessage.success(t("common.copySuccess"));
      return;
    }
    console.error("复制失败:", error);
    ElMessage.error(t("common.copyFailed"));
  }
};

// 复制快捷登录完整信息
const copyQuickLoginInfo = async () => {
  const classCode = quickLoginData.value.classCode || "";
  const password = quickLoginData.value.classCodePwd || "";
  const text = `${t("class.classCode")}${classCode} ${t(
    "class.unifiedPassword"
  )}${password}`;
  await copyToClipboard(text);
};

// 刷新学生列表
const handleRefreshQuickLogin = async () => {
  if (!selectedClass.value?.id) return;
  try {
    await loadStudentList(selectedClass.value.id, false);
    ElMessage.success(t("common.refreshed"));
  } catch (error) {
    console.error("刷新学生列表失败:", error);
  }
};

// 导出
const handleExport = async () => {
  const canContinue = await ensureStudentActionReady();
  if (!canContinue) {
    return;
  }

  try {
    ElMessage.info(t("common.exporting"));
    // 文件名格式：年级+班级+学生账号信息.xlsx
    const gradeName = selectedClass.value?.gradeName || "";
    const className = selectedClass.value?.name || "";
    const filename = `${gradeName}${className}学生账号信息.xlsx`;
    await exportStudentInfo(filename);
    ElMessage.success(t("common.exportSuccess"));
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error(t("common.exportFailed"));
  }
};

// 批量操作
const handleBatchAction = async () => {
  if (activeAction.value === "batch") {
    exitStudentBatchMode();
    ElMessage.info(t("class.exitBatchMode"));
    return;
  }

  if (isCurrentClassQuickLogin.value) {
    return;
  }

  const canContinue = await ensureStudentActionReady();
  if (!canContinue) {
    return;
  }

  activeAction.value = "batch";
  ElMessage.info(t("class.enterBatchMode"));
};

// 学生选择
const handleStudentSelect = (keys: (string | number)[], rows: any[]) => {
  selectedStudentIds.value = keys.map((k) => String(k));
};

// 全选
const handleStudentSelectAll = (selected: boolean) => {
  if (selected) {
    selectedStudentIds.value = studentList.value.map((s) => String(s.id));
  } else {
    selectedStudentIds.value = [];
  }
};

// 底部全选切换
const handleSelectAllToggle = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  handleStudentSelectAll(checked);
};

// 取消选择
const handleClearSelection = () => {
  selectedStudentIds.value = [];
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedStudentIds.value.length === 0) {
    ElMessage.warning(t("class.noStudentSelected"));
    return;
  }
  batchDeletePassword.value = "";
  showBatchDeletePassword.value = false;
  showBatchDeleteModal.value = true;
};

const closeBatchDeleteModal = () => {
  showBatchDeleteModal.value = false;
  batchDeletePassword.value = "";
  showBatchDeletePassword.value = false;
};

// 确认批量删除
const handleConfirmBatchDelete = async () => {
  if (!batchDeletePassword.value.trim()) {
    ElMessage.warning(t("user.pleaseInputTeacherPassword"));
    return;
  }
  if (!isPasswordLengthValid(batchDeletePassword.value)) {
    ElMessage.warning(t("auth.passwordRule"));
    return;
  }
  try {
    const selectedCount = selectedStudentIds.value.length;
    await removeStudent(selectedStudentIds.value.map(String), batchDeletePassword.value);
    ElMessage.success(t("class.deletedStudents", { count: selectedCount }));
    exitStudentBatchMode();
    // 刷新学生列表
    loadStudentList();
  } catch (error) {
    console.error("批量删除失败:", error);
  } finally {
    closeBatchDeleteModal();
  }
};

// 批量移班
const handleBatchTransfer = () => {
  if (selectedStudentIds.value.length === 0) {
    ElMessage.warning(t("class.noStudentSelected"));
    return;
  }
  batchTransferForm.gradeId = null;
  batchTransferForm.classId = null;
  batchTransferClassList.value = [];
  showBatchTransferModal.value = true;
  loadTransferGradeClassData();
};

// 确认批量移班
const handleConfirmBatchTransfer = async () => {
  console.log("batchTransferForm:", batchTransferForm);
  if (!batchTransferForm.gradeId) {
    ElMessage.error(t("class.pleaseSelectGrade"));
    return;
  }
  if (!batchTransferForm.classId) {
    ElMessage.error(t("class.pleaseSelectClass"));
    return;
  }

  // 从batchTransferClassList获取目标班级的teacherId
  const targetClass = batchTransferClassList.value.find(
    (c: any) => c.id === batchTransferForm.classId
  );

  try {
    const selectedCount = selectedStudentIds.value.length;
    await transferClass({
      ids: selectedStudentIds.value.map(String),
      classId: batchTransferForm.classId as string,
      teacherId: targetClass?.teacherId || "",
    });
    ElMessage.success(t("class.transferredStudents", { count: selectedCount }));
    exitStudentBatchMode();
    // 刷新学生列表
    loadStudentList();
  } catch (error) {
    console.error("批量移班失败:", error);
  } finally {
    showBatchTransferModal.value = false;
  }
};

// 根据年级获取批量移班的班级选项
const formatTransferClassLabel = (cls: any) => cls.teacherName ? `${cls.className}(${cls.teacherName})` : cls.className;

const batchTransferClassOptions = computed(() => {
  return batchTransferClassList.value.map((cls: any) => ({
    label: formatTransferClassLabel(cls),
    value: cls.id,
  }));
});

// 批量重置密码
const handleBatchResetPassword = () => {
  if (selectedStudentIds.value.length === 0) {
    ElMessage.warning(t("class.noStudentSelected"));
    return;
  }
  batchResetPassword.value = studentPassword.value || "";
  showBatchResetPassword.value = false;
  showBatchResetPasswordModal.value = true;
};

const closeBatchResetPasswordModal = () => {
  showBatchResetPasswordModal.value = false;
  batchResetPassword.value = "";
  showBatchResetPassword.value = false;
};

// 获取选中学生的名字列表
const selectedStudentNames = computed(() => {
  return studentList.value
    .filter((s) => selectedStudentIds.value.includes(String(s.id)))
    .map((s) => s.studentName)
    .join(",");
});

// 确认批量重置密码
const handleConfirmBatchResetPassword = async () => {
  if (!batchResetPassword.value.trim()) {
    ElMessage.warning(t("user.pleaseInputTeacherPassword"));
    return;
  }
  if (!isPasswordLengthValid(batchResetPassword.value)) {
    ElMessage.warning(t("auth.passwordRule"));
    return;
  }
  try {
    const data = await resetPassword(selectedStudentIds.value, batchResetPassword.value);
    closeBatchResetPasswordModal();
    // 显示新密码弹窗
    newPassword.value = data || "";
    showNewPasswordModal.value = true;
  } catch (error) {
    console.error("批量重置密码失败:", error);
  }
};

// 重置密码
const handleResetPassword = (row: any) => {
  console.log(row);
  resettingStudent.value = row;
  showResetPasswordModal.value = true;
};

// 确认重置密码
const handleConfirmResetPassword = async () => {
  console.log(resettingStudent.value);
  if (!resettingStudent.value) {
    showResetPasswordModal.value = false;
    return;
  }

  try {
    const data = await resetPassword([String(resettingStudent.value.id)]);
    showResetPasswordModal.value = false;
    resettingStudent.value = null;
    // 显示新密码弹窗
    newPassword.value = data || "";
    showNewPasswordModal.value = true;
  } catch (error) {
    console.error("重置密码失败:", error);
    showResetPasswordModal.value = false;
    resettingStudent.value = null;
  }
};

// 移班
const handleTransfer = (row: any) => {
  console.log(row);
  transferringStudent.value = row;
  transferForm.gradeId = null;
  transferForm.classId = null;
  transferForm.id = null;
  transferForm.teacherId = null;
  transferClassList.value = [];
  showTransferModal.value = true;
  loadTransferGradeClassData();
};

// 移班年级变化处理
const handleTransferGradeChange = (grade: string | number | null) => {
  console.log("年级变化:", grade);
  transferForm.classId = null;
  transferForm.id = null;
  transferForm.teacherId = null;
  transferClassList.value = [];
  if (grade) {
    loadTransferClassList(String(grade));
  }
};

// 移班班级变化处理
const handleTransferClassChange = (value: string | number | null, option: any) => {
  console.log("班级变化:", value, option);
  if (value) {
    transferForm.id = String(value);
    transferForm.teacherId = option?.teacherId || null;
  } else {
    transferForm.id = null;
    transferForm.teacherId = null;
  }
};

// 批量移班年级变化处理
const handleBatchTransferGradeChange = (grade: string | number | null) => {
  batchTransferForm.classId = null;
  batchTransferClassList.value = [];
  if (grade) {
    loadBatchTransferClassList(String(grade));
  }
};

// 确认移班
const handleConfirmTransfer = async () => {
  console.log("transferForm:", transferForm);
  if (!transferForm.gradeId) {
    ElMessage.error("请选择年级");
    return;
  }
  if (!transferForm.classId) {
    ElMessage.error("请选择班级");
    return;
  }
  if (!transferringStudent.value) {
    showTransferModal.value = false;
    return;
  }

  try {
    await transferClass({
      ids: [transferringStudent.value.id],
      classId: transferForm.id as string,
      teacherId: transferForm.teacherId || "",
    });
    ElMessage.success(`已将 ${transferringStudent.value.studentName} 移至新班级`);
    // 刷新学生列表
    loadStudentList();
  } catch (error) {
    console.error("移班失败:", error);
  } finally {
    showTransferModal.value = false;
    transferringStudent.value = null;
  }
};

const normalizeTransferGradeClassData = (data: any[], currentClassId?: string | null) => {
  return (data || []).map((item: any) => ({
    grade: item.grade,
    gradeName: item.gradeName,
    classList: (item.classList || [])
      .map((cls: any) => ({
        id: String(cls.classId || cls.id || ""),
        className: cls.className || cls.name || "",
        teacherId: cls.teacherId ? String(cls.teacherId) : "",
        teacherName: cls.teacherName || "",
      }))
      .filter((cls: any) => cls.id && cls.id !== String(currentClassId || "")),
  }));
};

const getTransferClassesByGrade = (grade: string) => {
  return (
    transferGradeClassData.value.find((item: any) => String(item.grade) === String(grade))
      ?.classList || []
  );
};

const loadTransferGradeClassData = async () => {
  if (!selectedClass.value?.id) {
    transferGradeClassData.value = [];
    return;
  }
  try {
    const data = await getGradeClassList(String(selectedClass.value.id));
    transferGradeClassData.value = normalizeTransferGradeClassData(data, selectedClass.value.id);
  } catch (error) {
    console.error("获取移班年级班级列表失败:", error);
    transferGradeClassData.value = [];
  }
};

// 根据年级加载班级列表（移班用）
const loadTransferClassList = (grade: string) => {
  transferClassList.value = getTransferClassesByGrade(grade);
};

// 根据年级加载班级列表（批量移班用）
const loadBatchTransferClassList = (grade: string) => {
  batchTransferClassList.value = getTransferClassesByGrade(grade);
};

// 根据年级获取班级选项
const transferClassOptions = computed(() => {
  return transferClassList.value.map((cls: any) => ({
    label: formatTransferClassLabel(cls),
    value: cls.id,
    teacherId: cls.teacherId,
  }));
});

// 删除学生
const handleDeleteStudent = (row: any) => {
  deletingStudent.value = row;
  showDeleteStudentModal.value = true;
};

// 确认删除学生
const handleConfirmDeleteStudent = async () => {
  if (!deletingStudent.value) {
    showDeleteStudentModal.value = false;
    return;
  }

  try {
    await removeStudent([deletingStudent.value.id]);
    ElMessage.success(
      `已删除学生：${
        deletingStudent.value.studentName || deletingStudent.value.name || "-"
      }`
    );
    // 刷新学生列表
    loadStudentList();
  } catch (error) {
    console.error("删除学生失败:", error);
  } finally {
    showDeleteStudentModal.value = false;
    deletingStudent.value = null;
  }
};

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  console.log("分页变化:", page, pageSize);
  // TODO: 重新加载数据
};

// 导入学生信息
const handleImportStudents = () => {
  if (!selectedClass.value?.id) {
    ElMessage.error("请先选择班级");
    return;
  }
  // 创建隐藏的文件输入框
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx,.xls";
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      ElMessage.info("正在导入学生信息...");
      await importStudent(file, selectedClass.value.id);
      ElMessage.success("导入成功");
      // 刷新学生列表
      loadStudentList();
      showCreateModal.value = false;
    } catch (error: any) {
      console.error("导入失败:", error);
    }
  };
  input.click();
};

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    ElMessage.info("正在下载导入模板...");
    await downloadTemplate();
    ElMessage.success("下载成功");
  } catch (error) {
    console.error("下载失败:", error);
    ElMessage.error("下载失败");
  }
};

// 创建学生
const handleCreateStudent = async () => {
  if (addStudentMode.value === "manual") {
    if (!selectedClass.value?.id) {
      ElMessage.error("请先选择班级");
      return;
    }
    const studentName = createForm.name.trim();
    if (!studentName) {
      ElMessage.warning("请填写学生姓名");
      return;
    }
    if (studentName.length > 10) {
      ElMessage.warning(t("auth.nameLengthLimit"));
      return;
    }
    try {
      await addStudent({
        classId: selectedClass.value.id,
        studentName,
      });
      ElMessage.success("创建学生成功");
      // 刷新学生列表
      loadStudentList();
    } catch (error) {
      console.error("创建学生失败:", error);
      return;
    }
  } else {
    createForm.name = "";
    addStudentMode.value = "batch";
    showCreateModal.value = false;
    return;
  }
  showCreateModal.value = false;
  // 重置表单
  createForm.name = "";
  addStudentMode.value = "batch";
};

// ===== 小组管理方法 =====

// 加载小组列表
const loadGroupList = async (showLoading = true) => {
  if (!selectedClass.value?.id) return;

  // 只有在没有数据或明确要求时才显示 loading
  if (showLoading && groupList.value.length === 0) {
    groupLoading.value = true;
  }
  try {
    const keyword = groupSearchKeyword.value?.trim();
    const params = {
      classId: selectedClass.value.id,
      teamLeader: keyword || undefined,
    };
    const data = await getGroupList(params);
    console.log("小组列表:", data);
    groupList.value = data || [];
  } catch (error) {
    console.error("加载小组列表失败:", error);
    groupList.value = [];
  } finally {
    groupLoading.value = false;
  }
};

// 小组搜索
const handleGroupSearch = () => {
  loadGroupList();
};

// 创建小组
const handleCreateGroup = () => {
  if (!selectedClass.value?.id) {
    ElMessage.warning("请先选择班级");
    return;
  }
  isEditGroupMode.value = false;
  groupForm.id = "";
  groupForm.name = "";
  groupForm.remarks = "";
  groupForm.leaderId = "";
  groupForm.members = [];
  showGroupModal.value = true;
};

// 编辑小组
const handleEditGroup = async (row: any) => {
  try {
    // 通过接口获取小组详情（包含成员列表）
    const detail = await getGroupMemberList(row.id);
    // 成员列表在 studentList 字段中
    const memberList = Array.isArray(detail?.studentList) ? detail.studentList : [];

    isEditGroupMode.value = true;
    groupForm.id = detail?.id || row.id;
    groupForm.name = detail?.teamName || row.teamName;
    groupForm.remarks = detail?.remarks || row.remarks || "";
    // 从成员列表中找组长
    const leader = memberList.find((m: any) => m.isLeader === 1);
    groupForm.leaderId = leader?.studentNumber || "";
    // 深拷贝成员列表，添加 id 字段用于标识
    groupForm.members = memberList.map((m: any) => ({
      ...m,
      id: m.studentNumber, // 用 studentNumber 作为 id
    }));
    originalMembers.value = JSON.parse(JSON.stringify(groupForm.members)); // 保存原始成员
    showGroupModal.value = true;
  } catch (error) {
    console.error("获取小组成员失败:", error);
  }
};

// 确认创建/编辑小组
const handleConfirmGroup = async () => {
  if (!groupForm.name.trim()) {
    ElMessage.warning("请输入小组名称");
    return;
  }
  if (groupForm.name.trim().length > 10) {
    ElMessage.warning(t("auth.nameLengthLimit"));
    return;
  }
  if (groupForm.remarks.trim().length > 100) {
    ElMessage.warning(t("class.groupDescLengthLimit"));
    return;
  }

  try {
    if (isEditGroupMode.value) {
      // 编辑时需要 delFlag（0=未删除，1=删除）
      // 当前成员列表（delFlag: 0 表示未删除）
      const currentMemberIds = groupForm.members.map((m) => m.id);
      const currentMembers = groupForm.members.map((m) => ({
        studentNumber: m.studentNumber,
        studentName: m.studentName,
        isLeader: (m.id === groupForm.leaderId ? 1 : 0) as 0 | 1,
        delFlag: 0 as 0 | 1,
      }));
      // 被删除的成员（delFlag: 1 表示删除）
      const deletedMembers = originalMembers.value
        .filter((m) => !currentMemberIds.includes(m.id))
        .map((m) => ({
          studentNumber: m.studentNumber,
          studentName: m.studentName,
          isLeader: 0 as 0 | 1,
          delFlag: 1 as 0 | 1,
        }));
      const editData = {
        id: groupForm.id,
        classId: selectedClass.value?.id || "",
        teamName: groupForm.name,
        remarks: groupForm.remarks || undefined,
        studentList: [...currentMembers, ...deletedMembers],
      };
      await updateGroup(editData);
      ElMessage.success("编辑成功");
    } else {
      // 新增时不需要 delFlag
      const hasSingleMember = groupForm.members.length === 1;
      const addData = {
        classId: selectedClass.value?.id || "",
        teamName: groupForm.name,
        remarks: groupForm.remarks || undefined,
        studentList: groupForm.members.map((m) => ({
          studentNumber: m.studentNumber,
          studentName: m.studentName,
          isLeader: (hasSingleMember || m.id === groupForm.leaderId ? 1 : 0) as 0 | 1,
        })) as { studentNumber: string; studentName: string; isLeader: 0 | 1 }[],
      };
      await addGroup(addData);
      ElMessage.success("创建成功");
    }
    showGroupModal.value = false;
    loadGroupList();
  } catch (error) {
    console.error("操作失败:", error);
  }
};

// 添加成员按钮点击
const handleAddGroupMember = async () => {
  selectedMemberIds.value = [];
  memberSearchKeyword.value = "";
  await loadAvailableStudents();
  showAddMemberModal.value = true;
};

// 切换学生选择状态
const toggleStudentSelection = (student: any) => {
  const index = selectedMemberIds.value.indexOf(student.id);
  if (index > -1) {
    selectedMemberIds.value.splice(index, 1);
  } else {
    selectedMemberIds.value.push(student.id);
  }
};

// 确认添加成员
const handleConfirmAddMembers = () => {
  const newMembers = availableStudents.value.filter((s) =>
    selectedMemberIds.value.includes(s.id)
  );
  groupForm.members.push(...newMembers);
  // 如果没有组长且有成员，默认第一个为组长
  if (!groupForm.leaderId && groupForm.members.length > 0) {
    groupForm.leaderId = groupForm.members[0].id;
  }
  showAddMemberModal.value = false;
};

// 移除成员
const handleRemoveGroupMember = (index: number) => {
  const removed = groupForm.members.splice(index, 1)[0];
  // 如果移除的是组长，自动将第一个成员设为新组长
  if (removed && groupForm.leaderId === removed.id) {
    groupForm.leaderId = groupForm.members.length > 0 ? groupForm.members[0].id : "";
  }
};

// 删除小组
const handleDeleteGroup = (row: any) => {
  isBatchDeleteGroup.value = false;
  batchDeleteGroupPassword.value = "";
  showBatchDeleteGroupPassword.value = false;
  deletingGroup.value = row;
  showDeleteGroupModal.value = true;
};

const closeDeleteGroupModal = () => {
  showDeleteGroupModal.value = false;
  batchDeleteGroupPassword.value = "";
  showBatchDeleteGroupPassword.value = false;
};

// 确认删除小组
const handleConfirmDeleteGroup = async () => {
  if (isBatchDeleteGroup.value && !batchDeleteGroupPassword.value.trim()) {
    ElMessage.warning(t("user.pleaseInputTeacherPassword"));
    return;
  }
  if (isBatchDeleteGroup.value && !isPasswordLengthValid(batchDeleteGroupPassword.value)) {
    ElMessage.warning(t("auth.passwordRule"));
    return;
  }
  try {
    if (isBatchDeleteGroup.value) {
      // 批量删除
      await deleteGroup(selectedGroupIds.value, batchDeleteGroupPassword.value);
      //  ElMessage.success(t('common.batchDeleteSuccess'));
      exitGroupBatchMode();
    } else {
      // 单个删除
      if (deletingGroup.value?.id) {
        await deleteGroup([deletingGroup.value.id]);
        //  ElMessage.success(t('common.deleteSuccess'));
      }
    }
    closeDeleteGroupModal();
    loadGroupList();
  } catch (error) {
    console.error("删除失败:", error);
  }
};

// 小组批量操作
const handleGroupBatchAction = () => {
  if (groupActiveAction.value === "batch") {
    exitGroupBatchMode();
  } else {
    if (!groupList.value.length) {
      ElMessage.warning("当前无小组数据，请先创建小组");
      return;
    }
    groupActiveAction.value = "batch";
  }
};

// 批量删除小组
const handleBatchDeleteGroup = () => {
  if (!selectedGroupIds.value.length) {
    ElMessage.warning(t("class.noGroupSelected"));
    return;
  }
  isBatchDeleteGroup.value = true;
  batchDeleteGroupPassword.value = "";
  showBatchDeleteGroupPassword.value = false;
  showDeleteGroupModal.value = true;
};

// 选择小组
const handleGroupSelect = (keys: (string | number)[], rows: any[]) => {
  selectedGroupIds.value = keys.map((k) => String(k));
};

// 小组全选
const handleGroupSelectAll = (selected: boolean) => {
  if (selected) {
    selectedGroupIds.value = groupList.value.map((item) => item.id);
  } else {
    selectedGroupIds.value = [];
  }
};

// 小组全选切换
const handleGroupSelectAllToggle = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  handleGroupSelectAll(checked);
};

// 清除小组选择
const handleClearGroupSelection = () => {
  exitGroupBatchMode();
};

// Tab 切换处理
const handleTabChange = (newTab: string) => {
  if (!selectedClass.value?.id) return;
  // 如果目标 Tab 已有数据，不再重新加载，直接显示已有数据
  if (newTab === "group") {
    if (groupList.value.length === 0) {
      loadGroupList(false); // 静默加载，不显示 loading
    }
  } else {
    if (studentList.value.length === 0) {
      loadStudentList(selectedClass.value.id, false); // 静默加载
    }
  }
};
</script>

<style scoped>
@font-face {
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 100 700;
  src: url("/fonts/material-symbols-outlined-teacher2.woff2") format("woff2");
}

.class-material-symbols {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "Material Symbols Outlined";
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  white-space: nowrap;
  direction: ltr;
  font-feature-settings: "liga";
  -webkit-font-smoothing: antialiased;
  font-variation-settings: "FILL" 0, "wght" 500, "GRAD" 0, "opsz" 24;
}

.class-page {
  --class-bg: #f8f9fa;
  --class-surface-low: #f2f4f5;
  --class-surface-lowest: #ffffff;
  --class-border: rgba(174, 179, 181, 0.18);
  --class-border-soft: rgba(174, 179, 181, 0.12);
  --class-shadow: 0 12px 32px rgba(46, 51, 53, 0.06);
  --class-primary: #005bc2;
  --class-primary-dim: #0050ab;
  --class-primary-soft: rgba(0, 91, 194, 0.06);
  --class-text-main: #2e3335;
  --class-text-sub: #5a6062;
  height: calc(100vh - 70px);
  overflow: hidden;
  background: var(--class-bg);
}

.class-layout-shell {
  height: 100%;
  gap: 24px;
  padding: 28px 32px 32px;
}

.main-panel {
  overflow: hidden;
}

.grade-panel {
  height: 100%;
  overflow: hidden;
  padding: 0 !important;
}

.class-grade-panel {
  width: 288px;
  max-width: 288px;
}

.class-grade-card {
  border-radius: 24px;
  border: 1px solid var(--class-border);
  background: var(--class-surface-lowest);
  box-shadow: var(--class-shadow);
  overflow: hidden;
}

.class-grade-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 24px 24px 10px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.class-grade-header__title {
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--class-text-main);
}

.class-grade-tree-wrap {
  padding: 0 14px 14px;
}

.class-grade-create-wrap {
  margin-top: auto;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--class-border-soft);
}

.class-grade-create-btn {
  width: 100% !important;
  height: 50px !important;
  border-radius: 16px !important;
  font-size: 13px !important;
  font-weight: 700;
  background: var(--class-primary) !important;
  box-shadow: 0 14px 28px rgba(0, 91, 194, 0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.class-main-panel {
  padding: 0 !important;
  min-width: 0;
}

.class-card {
  border: 1px solid var(--class-border);
  border-radius: 24px !important;
  background: var(--class-surface-lowest) !important;
  box-shadow: var(--class-shadow);
  padding: 0 !important;
  overflow: hidden;
}

.class-panel-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 22px 24px 16px;
}

.class-panel-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.class-tabs-shell {
  display: inline-flex;
  align-items: center;
  padding: 0;
  background: var(--class-surface-low);
  border-radius: 16px;
}

.class-tabs-native {
  width: 100%;
}

.class-tabs-native :deep(.flex) {
  gap: 4px !important;
}

.class-tabs-native :deep(button) {
  min-width: 116px;
  height: 38px;
  border-radius: 12px !important;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 13px !important;
  font-weight: 700 !important;
  box-shadow: none;
}

.class-tabs-native :deep(button[class*="bg-[#FF9900]"]) {
  background: #ffffff !important;
  color: var(--class-primary) !important;
  box-shadow: 0 6px 16px rgba(46, 51, 53, 0.08) !important;
}

.class-tabs-native :deep(button[class*="bg-[#FAFAFA]"]) {
  background: transparent !important;
  color: #7b838e !important;
  border: none !important;
}

.class-toolbar-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.class-toolbar-actions--top {
  justify-content: flex-end;
}

.class-action-btn {
  min-height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.class-action-btn--ghost {
  background: var(--class-surface-low);
  color: var(--class-text-main);
}

.class-action-btn--ghost:hover {
  background: #dee3e5;
}

.class-action-btn--primary {
  background: var(--class-primary);
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(0, 91, 194, 0.2);
}

.class-action-btn--primary:hover {
  background: var(--class-primary-dim);
}

.class-action-btn.is-active {
  background: rgba(0, 91, 194, 0.1);
  color: var(--class-primary);
}

.class-action-btn.is-active-primary {
  background: #d9e8ff;
  color: #7b8ca8;
  box-shadow: none;
  cursor: not-allowed;
}

.class-action-btn.is-disabled {
  background: #eceff1;
  color: #a6adb5;
  cursor: not-allowed;
  box-shadow: none;
}

.class-action-btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.class-action-btn__icon svg {
  width: 14px;
  height: 14px;
  display: block;
}

.class-panel-subline {
  display: flex;
  align-items: center;
  gap: 14px;
}

.class-toolbar-search {
  display: flex;
  align-items: center;
}

.class-toolbar-search--wide {
  flex: 0 0 272px;
  max-width: 272px;
}

.class-toolbar-search--group {
  flex: 0 0 300px;
  max-width: 300px;
}

.class-toolbar-password {
  font-size: 13px;
  font-weight: 700;
  color: #a3acb7;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.class-toolbar-stat {
  margin-left: auto;
  font-size: 13px;
  font-weight: 700;
  color: #64707c;
  white-space: nowrap;
}

.class-toolbar-stat__num {
  color: var(--class-primary);
}

.class-quick-login-banner {
  margin: 0 24px 14px !important;
  border-radius: 16px !important;
  background: linear-gradient(135deg, #1f7df0 0%, #005bc2 60%, #004da4 100%) !important;
}

.class-table-wrap {
  flex: 1;
  min-height: 0;
  padding: 0 20px 20px;
  border: none;
  background: transparent;
}

.class-batch-bar {
  margin: 8px 20px 20px !important;
  padding: 14px 18px !important;
  border: 1px solid rgba(164, 193, 255, 0.3) !important;
  border-radius: 16px;
  background: #f7fbff !important;
}

.class-batch-bar__checkbox {
  border-color: rgba(174, 179, 181, 0.32);
  background: #ffffff;
}

.class-batch-bar__checkbox.is-checked {
  background: var(--class-primary);
  border-color: var(--class-primary);
}

.class-batch-bar__summary {
  color: var(--class-text-main);
}

.class-batch-bar__count {
  color: var(--class-primary);
  font-weight: 700;
}

.class-batch-bar__actions {
  gap: 18px;
}

.class-batch-bar__action {
  color: var(--class-text-sub);
  transition: color 0.2s ease;
}

.class-batch-bar__action:hover {
  color: var(--class-primary);
}

.class-batch-bar__action--danger:hover {
  color: #ac3434;
}

.class-row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 12px;
  white-space: nowrap;
}

.class-row-actions--group {
  gap: 16px;
}

.class-row-action {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--class-primary);
  transition: color 0.2s ease;
}

.class-row-action:hover {
  color: var(--class-primary-dim);
}

.class-row-action.is-danger {
  color: #ac3434;
}

.class-row-action.is-danger:hover {
  color: #70030f;
}

.class-row-action.is-disabled {
  color: #c2c9d1;
  cursor: not-allowed;
}

.class-student-cell,
.class-student-cell.tooltip-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  width: 100%;
}

.class-group-leader-cell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  width: 100%;
  flex-wrap: nowrap;
}

.class-group-leader-cell.tooltip-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  max-width: 100%;
}

.class-group-leader-cell > span:last-of-type {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.class-student-cell > .class-student-name {
  flex: 1;
  min-width: 0;
}

.class-student-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.class-student-name {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.class-tree-node-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
}

.class-tree-delete-icon {
  filter: invert(31%) sepia(92%) saturate(2671%) hue-rotate(343deg) brightness(102%)
    contrast(93%);
}

.class-tree-folder-icon,
.class-tree-leaf-icon {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.class-tree-folder-icon svg,
.class-tree-leaf-icon svg {
  width: 18px;
  height: 18px;
  display: block;
}

.class-tree-leaf-icon {
  color: #96a1b2;
}

.class-tree-leaf-icon.is-selected {
  color: #0d5bc4;
}

.class-page :deep(.m-tree) {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.class-page :deep(.m-tree__node) {
  margin: 0;
}

.class-page :deep(.m-tree__content) {
  min-height: 34px;
  border: 1px solid transparent;
  border-radius: 10px;
  padding-top: 6px;
  padding-bottom: 6px;
  transition: all 0.2s ease;
}

.class-page :deep(.m-tree__content:hover) {
  background: var(--class-surface-low) !important;
}

.class-page :deep(.m-tree__content .truncate) {
  font-size: 13px !important;
  color: var(--class-text-main) !important;
}

.class-page :deep(.m-tree__content.is-parent .truncate) {
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-weight: 700;
  font-size: 15px !important;
}

.class-page :deep(.m-tree__content.is-leaf .truncate) {
  font-weight: 600;
  font-size: 13px !important;
  color: #52606d !important;
}

.class-page :deep(.m-tree__content.is-leaf.is-selected) {
  background: #f7fbff !important;
  border-color: rgba(0, 91, 194, 0.28);
}

.class-page :deep(.m-tree__content.is-leaf.is-selected .truncate) {
  color: var(--class-primary) !important;
  font-weight: 700;
}

.class-page :deep(.m-tree__content.is-leaf:hover .m-tree__actions),
.class-page :deep(.m-tree__content.is-leaf.is-selected .m-tree__actions) {
  opacity: 1;
}

.class-page :deep(.m-tree__content.is-leaf:hover .class-tree-node-actions),
.class-page :deep(.m-tree__content.is-leaf.is-selected .class-tree-node-actions) {
  opacity: 1;
}

.class-page :deep(.m-tree__content .w-4.h-4) {
  color: #94a3b8;
}

.class-page :deep(.m-tree__content.is-leaf .m-tree__actions) {
  gap: 6px;
}

.class-page :deep(.m-tree__content.is-leaf .m-tree__actions img) {
  width: 12px;
  height: 12px;
}

.class-toolbar-search--wide :deep(input) {
  height: 44px;
  border: none !important;
  border-radius: 16px !important;
  background: var(--class-surface-low) !important;
  padding-left: 48px !important;
  padding-right: 42px !important;
  font-size: 13px !important;
  font-weight: 600;
  color: #475569;
}

.class-toolbar-search--group :deep(input) {
  height: 36px;
  border: none !important;
  border-radius: 14px !important;
  background: var(--class-surface-low) !important;
  padding-left: 40px !important;
  padding-right: 36px !important;
  font-size: 12px !important;
  font-weight: 600;
  color: #607086;
}

.class-toolbar-search--group :deep(input:focus) {
  box-shadow: inset 0 0 0 2px rgba(0, 91, 194, 0.12);
}

.class-toolbar-search--group :deep(.absolute.left-3) {
  left: 12px;
  color: #94a3b8;
}

.class-toolbar-search--wide :deep(input:focus) {
  box-shadow: inset 0 0 0 2px rgba(0, 91, 194, 0.16);
}

.class-toolbar-search--wide :deep(.absolute.left-3) {
  left: 16px;
  color: #94a3b8;
}

.class-page :deep(.m-table) {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: none;
  border: 1px solid rgba(174, 179, 181, 0.12);
}

.class-page :deep(.m-table__table) {
  width: 100%;
}

.class-page :deep(.m-table__head-row) {
  background: rgba(242, 244, 245, 0.7);
}

.class-page :deep(.m-table__head-cell) {
  padding: 14px 16px !important;
  background: transparent !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  color: #9aa4af !important;
  letter-spacing: 0.08em;
}

.class-page :deep(.m-table__row) {
  background: #ffffff !important;
}

.class-page :deep(.m-table__cell) {
  padding: 14px 16px !important;
  font-size: 12px !important;
  color: var(--class-text-main) !important;
  border-top: 1px solid #f0f3f6;
  background: #ffffff;
}

.class-page :deep(.m-table__head-cell:last-child),
.class-page :deep(.m-table__cell:last-child) {
  padding-right: 18px !important;
}

.class-page :deep(.m-table__head-cell > div[class*="bg-[#FF9900]"]),
.class-page :deep(.m-table__cell > div[class*="bg-[#FF9900]"]) {
  background: var(--class-primary) !important;
  border-color: var(--class-primary) !important;
}

.class-page :deep(.m-table__head-cell > div[class*="bg-[#FF9900]"]:hover),
.class-page :deep(.m-table__cell > div[class*="bg-[#FF9900]"]:hover) {
  background: var(--class-primary-dim) !important;
  border-color: var(--class-primary-dim) !important;
}

.class-page :deep(.m-table__head-cell > div.border-gray-300:hover),
.class-page :deep(.m-table__cell > div.border-gray-300:hover) {
  border-color: rgba(0, 91, 194, 0.36) !important;
  background: rgba(0, 91, 194, 0.04) !important;
}

.class-group-card .class-panel-head {
  padding-bottom: 14px;
}

.class-group-card .class-panel-topline {
  align-items: center;
}

.class-group-card .class-toolbar-actions--top {
  margin-left: auto;
}

.class-group-card .class-toolbar-stat {
  font-size: 12px;
}

.class-group-card .class-toolbar-stat__num {
  font-size: 12px;
}

.class-group-card :deep(.m-table__head-cell) {
  font-size: 10px !important;
}

.class-group-card :deep(.m-table__cell) {
  font-size: 12px !important;
}

.class-group-card .tooltip-wrapper .max-w-\[120px\] {
  max-width: 96px !important;
}

.class-group-card .tooltip-wrapper .max-w-\[100px\] {
  max-width: 88px !important;
}

.class-group-card .tooltip-wrapper .max-w-\[80px\] {
  max-width: 72px !important;
}

.class-page :deep(.m-table__row:hover .m-table__cell) {
  background: #fbfdff;
}

.left-panel {
  background: #fff;
}

.right-panel {
  background: var(--class-bg);
}

.tooltip-wrapper {
  display: inline-block;
  max-width: 100%;
}

.tooltip-content {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 12px;
  background-color: #4a4a4a;
  color: #fff;
  font-size: 13px;
  border-radius: 6px;
  white-space: nowrap;
  max-width: 300px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
  pointer-events: none;
}

.tooltip-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: #4a4a4a transparent transparent transparent;
}

.tooltip-wrapper:hover .tooltip-content {
  opacity: 1;
  visibility: visible;
}

.class-theme-modal {
  padding: 24px;
  border: 1px solid rgba(174, 179, 181, 0.2);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(25, 28, 30, 0.08);
}

.class-theme-modal--form {
  padding-top: 28px;
}

.class-theme-modal--confirm,
.class-theme-modal--tip {
  min-height: 228px;
}

.class-theme-modal--password {
  min-height: 288px;
}

.class-theme-modal--student-create {
  min-height: 428px;
}

.class-theme-modal--group {
  min-height: 520px;
}

.class-theme-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #9aa4af;
  background: #f8f9fa;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 999px;
  transition: all 0.2s ease;
}

.class-theme-modal__close:hover {
  color: var(--class-primary, #005bc2);
  background: #f2f6fb;
  border-color: rgba(0, 91, 194, 0.18);
}

.class-theme-modal__title {
  margin-bottom: 20px;
  padding-right: 24px;
  padding-left: 24px;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--class-text-main, #2e3335);
  letter-spacing: -0.01em;
}

.class-theme-modal__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.class-theme-modal__field {
  width: 100%;
}

.class-theme-modal__mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.class-theme-modal__mode-btn {
  height: 42px;
  border: 1px solid rgba(0, 91, 194, 0.2);
  border-radius: 14px;
  background: #ffffff;
  color: var(--class-primary, #005bc2);
  font-size: 14px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.class-theme-modal__mode-btn:hover {
  background: rgba(0, 91, 194, 0.06);
}

.class-theme-modal__mode-btn.is-active {
  border-color: var(--class-primary, #005bc2);
  background: var(--class-primary, #005bc2);
  color: #ffffff;
}

.class-theme-modal__import-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.class-theme-modal__secondary-action {
  height: 42px;
  border: 1px solid rgba(174, 179, 181, 0.24);
  border-radius: 14px;
  background: #f5f7fa;
  color: #64707c;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.class-theme-modal__secondary-action:hover {
  border-color: rgba(0, 91, 194, 0.22);
  background: #eef4fb;
  color: var(--class-primary, #005bc2);
}

.class-theme-modal__select :deep(.cursor-pointer) {
  height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(174, 179, 181, 0.32) !important;
  border-radius: 16px !important;
  background: #ffffff !important;
  box-shadow: none;
}

.class-theme-modal__select :deep(.cursor-pointer:hover) {
  border-color: rgba(0, 91, 194, 0.42) !important;
}

.class-theme-modal__select :deep(.ring-2) {
  border-color: rgba(0, 91, 194, 0.52) !important;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.class-theme-modal__select :deep(span) {
  font-size: 14px;
  color: var(--class-text-main, #2e3335) !important;
}

.class-theme-modal__select :deep(svg) {
  color: #8b96a3;
}

:deep(.class-theme-modal__dropdown) {
  border: 1px solid rgba(174, 179, 181, 0.24) !important;
  border-radius: 16px !important;
  background: #ffffff !important;
  box-shadow: 0 18px 36px rgba(25, 28, 30, 0.08) !important;
  overflow: hidden;
}

:deep(.class-theme-modal__dropdown .py-1) {
  padding-top: 6px;
  padding-bottom: 6px;
}

:deep(.class-theme-modal__dropdown .py-1 > div) {
  margin: 0 6px;
  border-radius: 12px;
  color: var(--class-text-main, #2e3335) !important;
  background: transparent !important;
  transition: background-color 0.2s ease, color 0.2s ease;
}

:deep(.class-theme-modal__dropdown .py-1 > div:hover) {
  color: var(--class-primary, #005bc2) !important;
  background: rgba(0, 91, 194, 0.08) !important;
}

:deep(.class-theme-modal__dropdown .py-1 > div[class*="bg-"]) {
  color: var(--class-primary, #005bc2) !important;
  background: rgba(0, 91, 194, 0.1) !important;
  font-weight: 700;
}

:deep(.class-theme-modal__dropdown::-webkit-scrollbar) {
  width: 8px;
}

:deep(.class-theme-modal__dropdown::-webkit-scrollbar-track) {
  background: #f3f5f7;
}

:deep(.class-theme-modal__dropdown::-webkit-scrollbar-thumb) {
  background: rgba(0, 91, 194, 0.28);
  border-radius: 999px;
}

:deep(.class-theme-modal__dropdown::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 91, 194, 0.42);
}

.class-theme-modal__input :deep(input) {
  height: 48px;
  padding-top: 0;
  padding-bottom: 0;
  border: 1px solid rgba(174, 179, 181, 0.32) !important;
  border-radius: 16px !important;
  background: #ffffff !important;
  font-size: 14px;
  color: var(--class-text-main, #2e3335);
  box-shadow: none;
}

.class-theme-modal__input :deep(input::placeholder) {
  color: #97a1ad;
}

.class-theme-modal__input :deep(input:focus) {
  border-color: rgba(0, 91, 194, 0.52) !important;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.class-theme-modal__input--disabled :deep(input) {
  color: #7b8794 !important;
  background: #f5f7fa !important;
}

.class-theme-modal__confirm-body {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 82px;
  padding: 0 12px 6px;
}

.class-theme-modal__desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--class-text-sub, #5a6062);
}

.class-theme-modal__desc--center {
  text-align: center;
}

.class-theme-modal__desc--spaced {
  margin-bottom: 18px;
}

.class-theme-modal__desc--spaced-sm {
  margin-bottom: 14px;
}

.class-theme-modal__desc--tight {
  margin-bottom: 8px;
}

.class-theme-modal__tip {
  font-size: 14px;
  line-height: 1.75;
  color: #97a1ad;
}

.class-theme-modal__tip--center {
  text-align: center;
}

.class-theme-modal__notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px 14px;
  border: 1px solid rgba(164, 193, 255, 0.3);
  border-radius: 14px;
  background: #f7fbff;
  font-size: 13px;
  line-height: 1.6;
  color: #7b8794;
}

.class-theme-modal__notice svg {
  margin-top: 1px;
  color: var(--class-primary, #005bc2);
}

.class-theme-modal__manual-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.class-theme-modal__manual-form .class-theme-modal__field {
  max-width: 100%;
}

.class-group-modal__section {
  margin-bottom: 22px;
}

.class-group-modal__section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.class-group-modal__section-title {
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.6;
  color: var(--class-text-main, #2e3335);
}

.class-group-modal__section-title--compact {
  margin-bottom: 0;
}

.class-group-modal__hint {
  margin-top: 4px;
  font-size: 13px;
  color: var(--class-primary, #005bc2);
}

.class-group-modal__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-left: 12px;
}

.class-group-modal__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.class-group-modal__required {
  width: 10px;
  color: #ac3434;
  text-align: center;
}

.class-group-modal__required--empty {
  color: transparent;
}

.class-group-modal__label {
  width: 140px;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--class-text-main, #2e3335);
}

.class-group-modal__field {
  flex: 1;
  max-width: 320px;
}

.class-group-modal__add-btn {
  height: 40px;
  padding: 0 18px;
  border-radius: 14px;
  background: var(--class-primary, #005bc2);
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  transition: background-color 0.2s ease;
}

.class-group-modal__add-btn:hover {
  background: var(--class-primary-dim, #0050ab);
}

.class-group-modal__table-wrap {
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.class-group-modal__table-wrap--scroll {
  max-height: 300px;
  overflow-y: auto;
}

.class-group-modal__table-head {
  background: #f7fbff;
}

.class-group-modal__th {
  font-size: 12px;
  font-weight: 700;
  color: #7b8794;
}

.class-group-modal__tr {
  transition: background-color 0.2s ease;
}

.class-group-modal__tr:hover {
  background: rgba(0, 91, 194, 0.04);
}

.class-group-modal__td {
  font-size: 13px;
  color: var(--class-text-main, #2e3335);
}

.class-group-modal__radio,
.class-group-modal__checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--class-primary, #005bc2);
}

.class-group-modal__delete-btn {
  font-size: 13px;
  color: #ac3434;
  transition: color 0.2s ease;
}

.class-group-modal__delete-btn:hover {
  color: #70030f;
}

.class-group-modal__search {
  margin-bottom: 8px;
}

.class-group-modal__search-input :deep(input) {
  height: 44px;
  border: 1px solid rgba(174, 179, 181, 0.24) !important;
  border-radius: 14px !important;
  background: #ffffff !important;
  padding-left: 44px !important;
  color: #607086;
}

.class-group-modal__search-input :deep(input:focus) {
  border-color: rgba(0, 91, 194, 0.42) !important;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.class-group-modal__search-input :deep(.absolute.left-3) {
  left: 14px;
  color: #94a3b8;
}

.class-group-modal__meta {
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--class-text-main, #2e3335);
}

.class-group-modal__selected {
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  background: #f7fbff;
}

.class-group-modal__tag {
  border: 1px solid rgba(174, 179, 181, 0.22);
  border-radius: 12px;
  background: #ffffff;
  color: var(--class-text-main, #2e3335);
  transition: all 0.2s ease;
}

.class-group-modal__tag:hover {
  border-color: rgba(0, 91, 194, 0.28);
  background: rgba(0, 91, 194, 0.06);
}

.class-group-modal__tag-remove {
  color: #9aa4af;
  transition: color 0.2s ease;
}

.class-group-modal__tag-remove:hover {
  color: #ac3434;
}

.class-theme-modal__password-wrap {
  position: relative;
  margin-bottom: 2px;
}

.class-theme-modal__plain-input {
  width: 100%;
  height: 48px;
  padding: 0 48px 0 16px;
  border: 1px solid rgba(174, 179, 181, 0.32);
  border-radius: 16px;
  background: #ffffff;
  font-size: 14px;
  color: var(--class-text-main, #2e3335);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.class-theme-modal__plain-input::placeholder {
  color: #97a1ad;
}

.class-theme-modal__plain-input:focus {
  border-color: rgba(0, 91, 194, 0.52);
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.class-theme-modal__password-toggle {
  position: absolute;
  top: 50%;
  right: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #99a3af;
  transform: translateY(-50%);
  transition: color 0.2s ease;
}

.class-theme-modal__password-toggle:hover {
  color: var(--class-primary, #005bc2);
}

.class-theme-modal__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 24px;
}

.class-theme-modal__actions--single .class-theme-modal__btn {
  min-width: 160px;
}

.class-theme-modal__btn {
  min-width: 136px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.class-theme-modal__btn--ghost {
  border: 1px solid rgba(0, 91, 194, 0.2);
  color: var(--class-primary, #005bc2);
  background: #ffffff;
}

.class-theme-modal__btn--ghost:hover {
  background: rgba(0, 91, 194, 0.06);
  border-color: rgba(0, 91, 194, 0.3);
}

.class-theme-modal__btn--primary {
  color: #ffffff;
  background: var(--class-primary, #005bc2);
  background-image: none;
  box-shadow: none;
}

.class-theme-modal__btn--primary:hover {
  background: var(--class-primary-dim, #0050ab);
  background-image: none;
  box-shadow: none;
}

.class-theme-modal__confirm-body--stack {
  flex-direction: column;
  gap: 4px;
}

.class-theme-modal__value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--class-primary, #005bc2);
  text-align: center;
  word-break: break-all;
}

@media (max-width: 1599px) {
  .class-layout-shell {
    gap: 20px;
    padding: 24px 24px 28px;
  }

  .class-grade-panel {
    width: 272px;
    max-width: 272px;
  }

  .class-panel-head {
    padding: 24px 24px 18px;
  }

  .class-table-wrap {
    padding: 0 18px 18px;
  }

  .class-batch-bar {
    margin: 8px 18px 18px !important;
  }

  .class-group-card .class-panel-subline {
    flex-wrap: wrap;
  }

  .class-group-card .class-toolbar-search--group {
    flex: 1 1 320px;
    max-width: none;
  }
}

@media (max-width: 1439px) {
  .class-group-card .class-panel-topline {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .class-group-card .class-toolbar-actions--top {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 1279px) {
  .class-layout-shell {
    gap: 16px;
    padding: 18px;
  }

  .class-grade-panel {
    width: 248px;
    max-width: 248px;
  }

  .class-panel-topline,
  .class-panel-subline {
    flex-wrap: wrap;
  }

  .class-toolbar-search--wide {
    flex-basis: 280px;
  }

  .class-toolbar-stat {
    margin-left: 0;
  }

  .class-row-actions {
    gap: 16px;
  }

  .class-group-card .class-toolbar-actions--top {
    justify-content: flex-start;
  }
}

@media (max-width: 1023px) {
  .class-layout-shell {
    gap: 14px;
    padding: 14px;
  }

  .class-grade-panel {
    width: 100%;
    max-width: none;
  }

  .class-panel-head {
    padding: 20px 18px 16px;
  }

  .class-tabs-native :deep(button),
  .class-action-btn {
    min-width: 120px;
  }

  .class-quick-login-banner {
    margin: 0 18px 14px !important;
  }

  .class-table-wrap {
    padding: 0 12px 12px;
  }

  .class-batch-bar {
    margin: 8px 12px 12px !important;
    flex-wrap: wrap;
    gap: 12px;
  }

  .class-theme-modal {
    padding: 22px 18px 20px;
  }

  .class-theme-modal__title {
    margin-bottom: 18px;
    padding-right: 16px;
    padding-left: 16px;
    font-size: 18px;
  }

  .class-theme-modal__actions {
    flex-direction: column;
  }

  .class-theme-modal__btn {
    width: 100%;
  }
}
</style>
