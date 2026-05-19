<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <button class="close-btn" @click="$emit('close')">
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

      <h2 class="modal-title">{{ t("studentManage.title") }}</h2>

      <div class="modal-header">
        <MTabs v-model="activeTab" :tabs="tabList">
          <template #tab-student>
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
            </svg>
            <span>{{ t("studentManage.title") }}</span>
          </template>
          <template #tab-group>
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
            <span>{{ t("studentManage.groupManage") }}</span>
          </template>
        </MTabs>

        <div class="header-right">
          <MInput
            v-if="activeTab === 'student'"
            v-model="searchKeyword"
            :placeholder="t('studentManage.searchStudentPlaceholder')"
            clearable
            class="search-input"
          >
            <template #prefix>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </template>
          </MInput>
          <MInput
            v-else
            v-model="groupSearchKeyword"
            :placeholder="t('studentManage.searchGroupPlaceholder')"
            clearable
            class="search-input"
          >
            <template #prefix>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </template>
          </MInput>
          <MButton
            v-if="activeTab === 'student'"
            type="text"
            class="quick-login-btn"
            @click="toggleQuickLogin"
          >
            {{
              quickLoginEnabled
                ? t("studentManage.disableQuickLogin")
                : t("studentManage.enableQuickLogin")
            }}
          </MButton>
        </div>
      </div>

      <!-- 学生管理内容 -->
      <template v-if="activeTab === 'student'">
        <div v-if="quickLoginEnabled" class="quick-login-bar">
          <span class="new-tag">NEW</span>
          <span class="bar-item"
            >{{ t("studentManage.classCode") }}<strong>{{ classCode }}</strong></span
          >
          <span class="bar-item"
            >{{ t("studentManage.loginPassword")
            }}<strong>{{ loginPassword }}</strong></span
          >
          <MButton type="text" size="small" class="copy-btn" @click="copyClassInfo">
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
            <span>{{ t("studentManage.copy") }}</span>
          </MButton>
          <span class="bar-item expire-info">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            {{ t("studentManage.validFor2Hours") }}{{ expireTime
            }}{{ t("studentManage.expire") }}
          </span>
        </div>

        <div class="stats-bar-wrapper">
          <div class="stats-bar">
            <span
              >{{ t("studentManage.loggedInCount")
              }}<span class="count logged">{{ loggedCount }}</span>
              {{ t("studentManage.person") }}</span
            >
            <span
              >{{ t("studentManage.notLoggedInCount")
              }}<span class="count not-logged">{{ notLoggedCount }}</span>
              {{ t("studentManage.person") }}</span
            >
          </div>
          <MButton type="default" size="small" @click="refreshList">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path
                d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
              />
            </svg>
          </MButton>
        </div>

        <div class="table-wrapper">
          <MTable
            :columns="studentColumns"
            :data="filteredStudents"
            row-key="id"
            show-index
          >
            <template #loginStatus="{ row }">
              <div class="status-cell">
                <span
                  :class="['status', row.loginStatus === 1 ? 'logged' : 'not-logged']"
                >
                  {{
                    row.loginStatus === 1
                      ? t("studentManage.loggedIn")
                      : t("studentManage.notLoggedIn")
                  }}
                </span>
                <button
                  v-if="row.loginStatus === 1"
                  class="kick-btn"
                  @click="handleKickStudent(row)"
                >
                  {{ t("studentManage.kickOut") }}
                </button>
              </div>
            </template>
          </MTable>
        </div>
      </template>

      <!-- 小组管理内容 -->
      <template v-else>
        <!-- 搜索 + 操作按钮 -->
        <div class="group-header-bar">
          <div class="group-btn-right">
            <button
              :class="[
                'group-action-btn',
                groupActiveAction === 'batch' ? 'disabled' : 'primary',
              ]"
              :disabled="groupActiveAction === 'batch'"
              @click="handleCreateGroup"
            >
              {{ t("studentManage.createGroup") }}
            </button>
            <button
              :class="[
                'group-action-btn',
                groupActiveAction === 'batch' ? 'primary' : 'default',
              ]"
              @click="handleGroupBatchAction"
            >
              {{
                groupActiveAction === "batch"
                  ? t("studentManage.cancelBatch")
                  : t("studentManage.batchOperation")
              }}
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <MTable
            :columns="groupColumns"
            :data="filteredGroups"
            row-key="id"
            show-index
            :selectable="groupActiveAction === 'batch'"
            :selected-keys="selectedGroupIds"
            @select="handleGroupSelect"
            @select-all="handleGroupSelectAll"
          >
            <template #teamName="{ row }">
              {{ row.name || "-" }}
            </template>
            <template #leaderName="{ row }">
              <span
                class="block max-w-[140px] truncate"
                :title="row.leaderName || ''"
              >
                {{ formatLimitedLeaderName(row.leaderName) || "-" }}
              </span>
            </template>
            <template #members="{ row }">
              {{ row.members || "-" }}
            </template>
            <template #remarks="{ row }">
              {{ row.description || "-" }}
            </template>
            <template #action="{ row }">
              <div class="action-btns">
                <button
                  :class="[
                    'table-action-btn',
                    groupActiveAction === 'batch' ? 'disabled' : '',
                  ]"
                  :disabled="groupActiveAction === 'batch'"
                  @click="handleEditGroup(row)"
                >
                  {{ t("studentManage.edit") }}
                </button>
                <button
                  :class="[
                    'table-action-btn delete',
                    groupActiveAction === 'batch' ? 'disabled' : '',
                  ]"
                  :disabled="groupActiveAction === 'batch'"
                  @click="handleDeleteGroup(row)"
                >
                  {{ t("studentManage.delete") }}
                </button>
              </div>
            </template>
          </MTable>
        </div>

        <!-- 批量操作栏 -->
        <div v-if="groupActiveAction === 'batch'" class="batch-action-bar">
          <div class="batch-left">
            <label class="select-all-label">
              <input
                type="checkbox"
                :checked="isAllGroupSelected"
                class="checkbox"
                @change="handleGroupSelectAllToggle"
              />
              <span>{{ t("studentManage.selectAll") }}</span>
            </label>
            <span class="selected-count"
              >{{ t("studentManage.selected") }}
              <span class="count-num">{{ selectedGroupIds.length }}</span>
              {{ t("studentManage.items") }}</span
            >
          </div>
          <div class="batch-right">
            <button class="batch-btn" @click="handleBatchDeleteGroup">
              {{ t("studentManage.batchDelete") }}
            </button>
            <button class="batch-btn" @click="handleGroupBatchAction">
              {{ t("studentManage.cancelBatch") }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- 停用快捷登录弹窗 -->
  <DisableQuickLoginModal
    v-model="showDisableQuickLoginModal"
    :title="t('studentManage.disableQuickLoginTitle')"
    :content="t('studentManage.disableQuickLoginContent')"
    :tip="t('studentManage.disableQuickLoginTip')"
    :cancel-text="t('common.cancel')"
    :confirm-text="t('common.confirm')"
    @confirm="handleConfirmDisableQuickLogin"
  />

  <!-- 启用快捷登录弹窗 -->
  <MModal
    v-model="showEnableQuickLoginModal"
    custom-width="420px"
    :show-footer="false"
    :show-close="false"
    content-class="!p-0"
  >
    <div class="p-6 relative">
      <button
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        @click="showEnableQuickLoginModal = false"
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
        {{ t("studentManage.enableQuickLoginTitle") }}
      </h3>
      <p class="text-center text-[#4D4D4D] mb-6">
        {{ t("studentManage.enableQuickLoginContent") }}
      </p>
      <div class="flex items-center justify-center gap-2 text-[#999] text-sm mb-8">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{{ t("studentManage.enableQuickLoginTip") }}</span>
      </div>
      <div class="flex items-center justify-center gap-4">
        <button
          class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
          @click="showEnableQuickLoginModal = false"
        >
          {{ t("common.cancel") }}
        </button>
        <button
          class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
          @click="handleConfirmEnableQuickLogin"
        >
          {{ t("studentManage.create") }}
        </button>
      </div>
    </div>
  </MModal>

  <!-- 创建/编辑小组弹窗 -->
  <MModal
    v-model="showGroupModal"
    custom-width="620px"
    :show-footer="false"
    :show-close="false"
    content-class="!p-0"
  >
    <div class="p-6 relative">
      <button
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
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

      <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
        {{
          isEditGroupMode
            ? t("studentManage.editGroupTitle")
            : t("studentManage.createGroupTitle")
        }}
      </h3>

      <!-- 第一步：填写小组信息 -->
      <div class="mb-6">
        <p class="text-[#4D4D4D] font-medium mb-4">{{ t("studentManage.step1") }}</p>
        <div class="space-y-4 pl-4">
          <div class="flex items-center gap-2">
            <span class="text-red-500 w-2">*</span>
            <span class="text-[#4D4D4D]" style="width: 140px; flex-shrink: 0">{{
              t("studentManage.groupName")
            }}</span>
            <MInput
              v-model="groupForm.name"
              :placeholder="t('studentManage.groupNamePlaceholder')"
              style="flex: 1; max-width: 320px"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-transparent w-2">*</span>
            <span class="text-[#4D4D4D]" style="width: 140px; flex-shrink: 0">{{
              t("studentManage.groupDesc")
            }}</span>
            <MInput
              v-model="groupForm.remarks"
              :placeholder="t('studentManage.groupDescPlaceholder')"
              style="flex: 1; max-width: 320px"
            />
          </div>
        </div>
      </div>

      <!-- 第二步：添加小组成员 -->
      <div class="mb-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <p
            class="text-[#4D4D4D] font-medium leading-relaxed flex-1"
            style="word-break: break-word"
          >
            {{ t("studentManage.step2")
            }}<span class="text-[#FF9900] text-sm font-normal ml-1">{{
              t("studentManage.rememberLeader")
            }}</span>
          </p>
          <button
            class="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm hover:bg-[#E68A00] whitespace-nowrap shrink-0"
            @click="handleAddGroupMember"
          >
            {{ t("studentManage.addMember") }}
          </button>
        </div>

        <!-- 成员表格 -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <table class="w-full">
            <thead class="bg-[#FFF1DD]">
              <tr>
                <th
                  class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D] whitespace-nowrap"
                >
                  {{ t("studentManage.serialNumber") }}
                </th>
                <th
                  class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D] whitespace-nowrap"
                >
                  {{ t("studentManage.account") }}
                </th>
                <th
                  class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D] whitespace-nowrap"
                >
                  {{ t("studentManage.name") }}
                </th>
                <th
                  class="px-3 py-2 text-center text-sm font-medium text-[#4D4D4D] leading-tight min-w-[100px]"
                >
                  {{ t("studentManage.isLeader") }}
                </th>
                <th
                  class="px-3 py-2 text-center text-sm font-medium text-[#4D4D4D] whitespace-nowrap"
                >
                  {{ t("studentManage.operation") }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(member, index) in groupForm.members"
                :key="member.id"
                class="border-t border-gray-100"
              >
                <td class="px-3 py-2 text-sm text-[#4D4D4D]">{{ index + 1 }}</td>
                <td class="px-3 py-2 text-sm text-[#4D4D4D]">
                  {{ member.studentNumber }}
                </td>
                <td class="px-3 py-2 text-sm text-[#4D4D4D]">{{ member.studentName }}</td>
                <td class="px-3 py-2 text-center">
                  <input
                    type="radio"
                    :name="'group-leader'"
                    :checked="groupForm.leaderId === member.id"
                    class="w-4 h-4 accent-[#FF9900]"
                    @change="groupForm.leaderId = member.id"
                  />
                </td>
                <td class="px-3 py-2 text-center">
                  <button
                    class="text-red-500 text-sm hover:text-red-600"
                    @click="handleRemoveGroupMember(index)"
                  >
                    {{ t("studentManage.delete") }}
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
                    <span class="text-sm">{{ t("studentManage.noData") }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex items-center justify-center gap-4">
        <button
          class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
          @click="showGroupModal = false"
        >
          {{ t("common.cancel") }}
        </button>
        <button
          class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
          @click="handleConfirmGroup"
        >
          {{ t("common.confirm") }}
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
    <div class="p-6 relative">
      <button
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
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

      <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
        {{ t("studentManage.selectMember") }}
      </h3>

      <!-- 搜索栏 -->
      <div class="mb-2">
        <MInput
          v-model="memberSearchKeyword"
          :placeholder="t('studentManage.searchStudentPlaceholder')"
          clearable
          class="w-full"
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
      <div class="mb-2 text-sm text-[#4D4D4D]">
        {{
          t("studentManage.totalStudents", { count: filteredAvailableStudents.length })
        }}
      </div>

      <!-- 学生列表表格 -->
      <div class="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
        <table class="w-full">
          <thead class="bg-[#FFF1DD] sticky top-0">
            <tr>
              <th class="w-10 px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">
                <input
                  type="checkbox"
                  :checked="isAllMemberSelected"
                  class="w-4 h-4 accent-[#FF9900]"
                  @change="toggleAllMemberSelection"
                />
              </th>
              <th class="w-16 px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">
                {{ t("studentManage.serialNumber") }}
              </th>
              <th class="px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">
                {{ t("studentManage.account") }}
              </th>
              <th class="px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">
                {{ t("studentManage.name") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(student, index) in filteredAvailableStudents"
              :key="student.id"
              class="border-b border-gray-100 last:border-b-0 hover:bg-[#FFF1DD] cursor-pointer"
              @click="toggleStudentSelection(student)"
            >
              <td class="px-2 py-3">
                <input
                  type="checkbox"
                  :checked="selectedMemberIds.includes(student.id)"
                  class="w-4 h-4 accent-[#FF9900]"
                  @click.stop
                  @change="toggleStudentSelection(student)"
                />
              </td>
              <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ index + 1 }}</td>
              <td class="px-2 py-3 text-sm text-[#4D4D4D]">
                {{ student.studentNumber || "-" }}
              </td>
              <td class="px-2 py-3 text-sm text-[#4D4D4D]">
                {{ student.studentName || "-" }}
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="!filteredAvailableStudents.length"
          class="px-4 py-8 text-center text-gray-400"
        >
          {{ t("studentManage.noStudentsToAdd") }}
        </div>
      </div>

      <!-- 已选学生标签 -->
      <div v-if="selectedMemberIds.length" class="mt-3 p-3 bg-[#F5F5F5] rounded-lg">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="id in selectedMemberIds"
            :key="id"
            class="group inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-[#4D4D4D] hover:border-[#FF9900] hover:bg-[#FFF1DD] cursor-pointer transition-colors"
          >
            <span>{{ getStudentNameById(id) }}</span>
            <button
              class="w-4 h-4 items-center justify-center text-gray-400 hover:text-[#FF0000] transition-colors hidden group-hover:flex"
              @click="removeSelectedMember(id)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div class="flex items-center justify-center gap-4 mt-6">
        <button
          class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
          @click="showAddMemberModal = false"
        >
          {{ t("common.cancel") }}
        </button>
        <button
          class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
          @click="handleConfirmAddMembers"
        >
          {{ t("common.confirm") }}
        </button>
      </div>
    </div>
  </MModal>

  <!-- 删除小组确认弹窗 -->
  <MModal
    v-model="showDeleteGroupModal"
    custom-width="381px"
    :show-footer="false"
    :show-close="false"
    content-class="!p-0"
  >
    <div class="h-[249px] p-6 relative flex flex-col">
      <button
        class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        @click="showDeleteGroupModal = false"
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

      <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
        {{ t("common.tips") }}
      </h3>

      <div class="flex-1 flex items-center justify-center">
        <p class="text-[16px] text-[#4D4D4D]">
          {{
            isBatchDeleteGroup
              ? t("studentManage.batchDeleteGroupConfirm", {
                  count: selectedGroupIds.length,
                })
              : t("studentManage.deleteGroupConfirm", { name: deletingGroup?.name })
          }}
        </p>
      </div>

      <div class="flex items-center justify-center gap-4">
        <button
          class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
          @click="showDeleteGroupModal = false"
        >
          {{ t("common.cancel") }}
        </button>
        <button
          class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
          @click="handleConfirmDeleteGroup"
        >
          {{ t("common.confirm") }}
        </button>
      </div>
    </div>
  </MModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useTeacher } from "~/composables/api/useTeacher";
import { ElMessage } from "~/components/ui";

const { t } = useI18n();

interface Student {
  id: string;
  name: string;
  account: string;
  createTime: string;
  loginStatus: number;
}

interface Group {
  id: string;
  name: string;
  leaderName: string;
  members: string;
  description: string;
  createTime: string;
}

const props = defineProps<{
  visible: boolean;
  classId?: string;
  initialQuickLoginData?: {
    classCode: string;
    classCodePwd: string;
    expirationDate: string;
  };
}>();

type QuickLoginChangePayload = {
  classCode: string;
  classCodePwd: string;
  expirationDate: string;
};

const emit = defineEmits<{
  close: [];
  quickLoginChange: [data?: QuickLoginChangePayload | null];
}>();

const {
  getStudentList,
  getGroupList,
  stopQuickLogin,
  getQuickLoginInfo,
  createQuickLogin,
  kickoutStudent,
  addGroup,
  updateGroup,
  deleteGroup,
  getAddStudentList,
  getGroupMemberList,
} = useTeacher();

const activeTab = ref("student");
const searchKeyword = ref("");
const groupSearchKeyword = ref("");
const quickLoginEnabled = ref(false);
const showDisableQuickLoginModal = ref(false);
const showEnableQuickLoginModal = ref(false);
const classCode = ref("");
const loginPassword = ref("");
const expireTime = ref("");
const loading = ref(false);

const tabList = computed(() => [
  { label: t("studentManage.title"), value: "student" },
  { label: t("studentManage.groupManage"), value: "group" },
]);

const studentColumns = computed(() => [
  { key: "name", title: t("studentManage.studentName") },
  { key: "account", title: t("studentManage.studentAccount") },
  { key: "createTime", title: t("studentManage.createTime") },
  { key: "loginStatus", title: t("studentManage.loginStatus") },
]);

const groupColumns = computed(() => [
  { key: "teamName", title: t("studentManage.groupNameCol"), minWidth: "80px" },
  { key: "leaderName", title: t("studentManage.leader"), minWidth: "60px" },
  { key: "members", title: t("studentManage.members"), minWidth: "100px" },
  { key: "remarks", title: t("studentManage.remarks"), minWidth: "100px" },
  { key: "createTime", title: t("studentManage.createTime"), minWidth: "120px" },
  {
    key: "action",
    title: t("studentManage.operation"),
    width: "160px",
    align: "center" as const,
  },
]);

const students = ref<Student[]>([]);
const groups = ref<Group[]>([]);

// ===== 小组管理相关 =====
type GroupActionType = "batch" | null;
const groupActiveAction = ref<GroupActionType>(null);
const selectedGroupIds = ref<string[]>([]);
const showGroupModal = ref(false);
const showDeleteGroupModal = ref(false);
const showAddMemberModal = ref(false);
const isEditGroupMode = ref(false);
const isBatchDeleteGroup = ref(false);
const deletingGroup = ref<Group | null>(null);
const originalMembers = ref<any[]>([]);
const memberSearchKeyword = ref("");
const selectedMemberIds = ref<string[]>([]);
const availableStudents = ref<any[]>([]);

const exitGroupBatchMode = () => {
  groupActiveAction.value = null;
  selectedGroupIds.value = [];
};

const groupForm = reactive({
  id: "",
  name: "",
  remarks: "",
  leaderId: "" as string,
  members: [] as any[],
});

const filteredStudents = computed(() => {
  if (!searchKeyword.value) return students.value;
  const keyword = searchKeyword.value.toLowerCase();
  return students.value.filter(
    (s) =>
      s.name.toLowerCase().includes(keyword) || s.account.toLowerCase().includes(keyword)
  );
});

const filteredGroups = computed(() => {
  if (!groupSearchKeyword.value) return groups.value;
  const keyword = groupSearchKeyword.value.toLowerCase();
  return groups.value.filter(
    (g) =>
      g.name.toLowerCase().includes(keyword) ||
      g.leaderName.toLowerCase().includes(keyword)
  );
});

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

// 添加成员全选
const isAllMemberSelected = computed(() => {
  if (!filteredAvailableStudents.value.length) return false;
  return filteredAvailableStudents.value.every((s) =>
    selectedMemberIds.value.includes(s.id)
  );
});

// 小组全选
const isAllGroupSelected = computed(() => {
  if (!groups.value.length) return false;
  return groups.value.every((item) => selectedGroupIds.value.includes(item.id));
});

const loggedCount = computed(
  () => students.value.filter((s) => s.loginStatus === 1).length
);
const notLoggedCount = computed(
  () => students.value.filter((s) => s.loginStatus !== 1).length
);

// 加载学生列表
const loadStudents = async () => {
  if (!props.classId) return;
  loading.value = true;
  try {
    const data = await getStudentList({ classId: props.classId });
    if (data && Array.isArray(data)) {
      students.value = data.map((item: any) => ({
        id: String(item.id || item.studentId),
        name: item.studentName || item.name || "",
        account: item.studentNumber || item.account || "",
        createTime: item.createTime || "",
        loginStatus: item.loginStatus || 0,
      }));
    }
  } catch (error) {
    console.error("加载学生列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 加载小组列表
const loadGroups = async () => {
  if (!props.classId) return;
  try {
    const data = await getGroupList({ classId: props.classId });
    if (data && Array.isArray(data)) {
      groups.value = data.map((item: any) => ({
        id: String(item.id),
        name: item.teamName || "",
        leaderName: item.leaderName || "",
        members: item.members || "",
        description: item.remarks || "",
        createTime: item.createTime || "",
      }));
    }
  } catch (error) {
    console.error("加载小组列表失败:", error);
  }
};

// 加载可添加的学生列表
const loadAvailableStudents = async () => {
  if (!props.classId) return;
  try {
    const data = await getAddStudentList(props.classId);
    availableStudents.value = data || [];
  } catch (error) {
    console.error("获取可添加学生列表失败:", error);
    availableStudents.value = [];
  }
};

// 加载快捷登录信息
const loadQuickLoginInfo = async () => {
  try {
    const data = await getQuickLoginInfo();
    if (data) {
      classCode.value = data.classCode || "";
      loginPassword.value = data.classCodePwd || "";
      expireTime.value = data.expirationDate || "";
      quickLoginEnabled.value = !!data.classCode;
    }
  } catch (error) {
    console.error("加载快捷登录信息失败:", error);
  }
};

const toggleQuickLogin = () => {
  if (quickLoginEnabled.value) {
    showDisableQuickLoginModal.value = true;
  } else {
    showEnableQuickLoginModal.value = true;
  }
};

const handleConfirmDisableQuickLogin = async () => {
  if (!props.classId) return;
  try {
    await stopQuickLogin(props.classId);
    quickLoginEnabled.value = false;
    classCode.value = "";
    loginPassword.value = "";
    expireTime.value = "";
    showDisableQuickLoginModal.value = false;
    ElMessage.success("已停用快捷登录");
    emit("quickLoginChange", null);
  } catch (error: any) {
    console.error("停用快捷登录失败:", error);
  }
};

// 确认启用快捷登录
const handleConfirmEnableQuickLogin = async () => {
  if (!props.classId) return;
  try {
    const data = await createQuickLogin(props.classId);
    showEnableQuickLoginModal.value = false;
    ElMessage.success("已启用快捷登录");
    if (data && data.classCode) {
      classCode.value = data.classCode;
      loginPassword.value = data.classCodePwd || "";
      expireTime.value = data.expirationDate || "";
      quickLoginEnabled.value = true;
      emit("quickLoginChange", {
        classCode: data.classCode,
        classCodePwd: data.classCodePwd || "",
        expirationDate: data.expirationDate || "",
      });
      return;
    }
    emit("quickLoginChange");
  } catch (error: any) {
    console.error("启用快捷登录失败:", error);
  }
};

const copyClassInfo = () => {
  const text = `班级码：${classCode.value}\n统一登录密码：${loginPassword.value}`;
  navigator.clipboard.writeText(text);
  ElMessage.success("班级信息已复制");
};

const refreshList = () => {
  loadStudents();
};

// 踢出登录
const handleKickStudent = async (student: Student) => {
  try {
    await kickoutStudent(student.id);
    ElMessage.success(`已踢出 ${student.name}`);
    // 刷新列表
    loadStudents();
  } catch (error: any) {
    console.error("踢出学生失败:", error);
  }
};

// ===== 小组管理方法 =====

// 创建小组
const handleCreateGroup = () => {
  isEditGroupMode.value = false;
  groupForm.id = "";
  groupForm.name = "";
  groupForm.remarks = "";
  groupForm.leaderId = "";
  groupForm.members = [];
  showGroupModal.value = true;
};

// 编辑小组
const handleEditGroup = async (row: Group) => {
  try {
    // 通过接口获取小组详情（包含成员列表）
    const detail = await getGroupMemberList(row.id);
    const memberList = Array.isArray(detail?.studentList) ? detail.studentList : [];

    isEditGroupMode.value = true;
    groupForm.id = detail?.id || row.id;
    groupForm.name = detail?.teamName || row.name;
    groupForm.remarks = detail?.remarks || row.description || "";
    // 从成员列表中找组长
    const leader = memberList.find((m: any) => m.isLeader === 1);
    groupForm.leaderId = leader?.studentNumber || "";
    // 深拷贝成员列表，添加 id 字段用于标识
    groupForm.members = memberList.map((m: any) => ({
      ...m,
      id: m.studentNumber,
    }));
    originalMembers.value = JSON.parse(JSON.stringify(groupForm.members));
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

  try {
    if (isEditGroupMode.value) {
      // 编辑时需要 delFlag
      const currentMemberIds = groupForm.members.map((m) => m.id);
      const currentMembers = groupForm.members.map((m) => ({
        studentNumber: m.studentNumber,
        studentName: m.studentName,
        isLeader: (m.id === groupForm.leaderId ? 1 : 0) as 0 | 1,
        delFlag: 0 as 0 | 1,
      }));
      // 被删除的成员
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
        classId: props.classId || "",
        teamName: groupForm.name,
        remarks: groupForm.remarks || undefined,
        studentList: [...currentMembers, ...deletedMembers],
      };
      await updateGroup(editData);
      ElMessage.success("编辑成功");
    } else {
      // 新增
      const addData = {
        classId: props.classId || "",
        teamName: groupForm.name,
        remarks: groupForm.remarks || undefined,
        studentList: groupForm.members.map((m) => ({
          studentNumber: m.studentNumber,
          studentName: m.studentName,
          isLeader: m.id === groupForm.leaderId ? 1 : 0,
        })) as { studentNumber: string; studentName: string; isLeader: 0 | 1 }[],
      };
      await addGroup(addData);
      ElMessage.success("创建成功");
    }
    showGroupModal.value = false;
    loadGroups();
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

// 切换全选
const toggleAllMemberSelection = () => {
  if (isAllMemberSelected.value) {
    const filteredIds = filteredAvailableStudents.value.map((s) => s.id);
    selectedMemberIds.value = selectedMemberIds.value.filter(
      (id) => !filteredIds.includes(id)
    );
  } else {
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
const handleDeleteGroup = (row: Group) => {
  isBatchDeleteGroup.value = false;
  deletingGroup.value = row;
  showDeleteGroupModal.value = true;
};

// 确认删除小组
const handleConfirmDeleteGroup = async () => {
  try {
    if (isBatchDeleteGroup.value) {
      await deleteGroup(selectedGroupIds.value);
      exitGroupBatchMode();
    } else {
      if (deletingGroup.value?.id) {
        await deleteGroup([deletingGroup.value.id]);
      }
    }
    showDeleteGroupModal.value = false;
    ElMessage.success("删除成功");
    loadGroups();
  } catch (error) {
    console.error("删除失败:", error);
  }
};

// 小组批量操作
const handleGroupBatchAction = () => {
  if (groupActiveAction.value === "batch") {
    exitGroupBatchMode();
  } else {
    if (!groups.value.length) {
      ElMessage.warning("当前无小组数据，请先创建小组");
      return;
    }
    groupActiveAction.value = "batch";
  }
};

// 批量删除小组
const handleBatchDeleteGroup = () => {
  if (!selectedGroupIds.value.length) {
    ElMessage.warning("请先选择小组");
    return;
  }
  isBatchDeleteGroup.value = true;
  showDeleteGroupModal.value = true;
};

// 选择小组
const handleGroupSelect = (keys: (string | number)[]) => {
  selectedGroupIds.value = keys.map((k) => String(k));
};

// 小组全选
const handleGroupSelectAll = (selected: boolean) => {
  if (selected) {
    selectedGroupIds.value = groups.value.map((item) => item.id);
  } else {
    selectedGroupIds.value = [];
  }
};

// 小组全选切换
const handleGroupSelectAllToggle = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked;
  handleGroupSelectAll(checked);
};

// 监听弹窗显示
watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadStudents();
      loadGroups();
      if (props.initialQuickLoginData?.classCode) {
        classCode.value = props.initialQuickLoginData.classCode;
        loginPassword.value = props.initialQuickLoginData.classCodePwd || "";
        expireTime.value = props.initialQuickLoginData.expirationDate || "";
        quickLoginEnabled.value = true;
      } else {
        loadQuickLoginInfo();
      }
    }
  }
);

// 监听 Tab 切换
watch(activeTab, (val) => {
  if (val === "group") {
    loadGroups();
  } else {
    loadStudents();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  position: relative;
  width: 900px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.close-btn:hover {
  color: #666;
}

.modal-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 300px;
}

.quick-login-btn {
  color: #ff9900;
  white-space: nowrap;
}

.quick-login-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: #fff8e6;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
}

.bar-label {
  color: #333;
}

.new-tag {
  padding: 2px 8px;
  background: #ff9900;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.bar-item {
  color: #666;
}

.bar-item strong {
  color: #333;
}

.copy-btn {
  color: #ff9900;
  padding: 0 4px;
}

.expire-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
}

.stats-bar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  color: #666;
}

.count {
  font-weight: 600;
}

.count.logged {
  color: #ff9900;
}

.count.not-logged {
  color: #999;
}

.count.primary {
  color: #ff9900;
}

.group-stats-bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}

.status {
  font-size: 13px;
}

.status.logged {
  color: #52c41a;
}

.status.not-logged {
  color: #999;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.kick-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: #ff6b6b;
  background: transparent;
  border: 1px solid #ff6b6b;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.kick-btn:hover {
  background: #fff0f0;
}

/* 小组管理样式 */
.group-header-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.group-btn-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.group-action-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
}

.group-action-btn.primary {
  background: #ff9900;
  color: white;
}

.group-action-btn.primary:hover {
  background: #e68a00;
}

.group-action-btn.default {
  background: #fff1dd;
  color: #4d4d4d;
}

.group-action-btn.default:hover {
  background: #ffe4c4;
}

.group-action-btn.disabled {
  background: #e5e5e5;
  color: #999;
  cursor: not-allowed;
}

.action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.table-action-btn {
  padding: 4px 12px;
  font-size: 13px;
  border: 1px solid #cbcbcb;
  border-radius: 7px;
  background: transparent;
  color: #4d4d4d;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.table-action-btn:hover {
  border-color: #ff9900;
}

.table-action-btn.delete {
  color: #ff0000;
}

.table-action-btn.delete:hover {
  border-color: #ff0000;
}

.table-action-btn.disabled {
  color: #999;
  border-color: #e5e5e5;
  cursor: not-allowed;
}

.table-action-btn.disabled:hover {
  border-color: #e5e5e5;
}

/* 批量操作栏 */
.batch-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff2dd;
  border-top: 1px solid #e5e5e5;
  margin-top: 12px;
}

.batch-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4d4d4d;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #ff9900;
}

.selected-count {
  font-size: 14px;
  color: #4d4d4d;
}

.count-num {
  color: #ff9900;
  font-weight: 600;
}

.batch-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.batch-btn {
  font-size: 14px;
  color: #4d4d4d;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.batch-btn:hover {
  color: #ff9900;
}
</style>
