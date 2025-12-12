<template>
  <div class="class-page flex bg-[#FAFAFA]">
    <!-- 左侧教师导航（固定） -->
    <aside
      class="teacher-nav hidden lg:flex w-[220px] xl:w-[260px] 2xl:w-[295px] flex-col flex-shrink-0"
    >
      <nav class="flex-1 overflow-auto py-2">
        <button
          v-for="item in menuItems"
          :key="item.path"
          type="button"
          :disabled="isActiveItem(item)"
          :class="[
            'w-full text-left flex items-center h-[50px] gap-3 px-4 py-3 transition-colors',
            isActiveItem(item)
              ? 'bg-[#FF9900] text-white font-normal cursor-default rounded-lg '
              : 'text-gray-700 hover:bg-gray-50 cursor-pointer text-sm',
          ]"
          :style="isActiveItem(item) ? { fontSize: '20px' } : {}"
          @click="!isActiveItem(item) && go(item.path)"
        >
          <div class="w-9 h-9 flex items-center justify-center">
            <img
              v-if="item.icon || item.iconSelected"
              :src="
                isActiveItem(item) ? item.iconSelected || item.icon : item.icon
              "
              alt=""
              class="w-9 h-9 object-contain"
            />
            <span v-else>•</span>
          </div>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- 中间内容：年级树 + 主内容 -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
      <!-- 年级/班级树 -->
      <section
        class="grade-panel w-full lg:w-[280px] xl:w-[309px] flex-shrink-0 p-3 flex flex-col"
      >
        <MButton
          type="primary"
          class="mb-3 w-[142px] h-[50px] flex-shrink-0"
          size="small"
          @click="handleSelectAll"
          style="
            border-radius: 20px;
            font-size: 16px;
            background-color: #ff9900;
            border-color: #ff9900;
          "
        >
          全部班级
        </MButton>
        <div class="bg-[#FFFFFF] shadow-sm flex-1 flex flex-col min-h-0">
          <!-- 有数据时显示树 -->
          <div v-if="treeData.length" class="flex-1 overflow-y-auto p-2">
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
              <template #actions="{ node }">
                <template v-if="node.children"></template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <img
                      src="~/assets/images/edit.png"
                      alt="编辑"
                      class="w-5 h-5 cursor-pointer"
                      @click.stop="handleEditClass(node)"
                    />
                    <img
                      src="~/assets/images/del.png"
                      alt="删除"
                      class="w-5 h-5 cursor-pointer"
                      @click.stop="handleDeleteClass(node)"
                    />
                  </div>
                </template>
              </template>
            </MTree>
          </div>
          <!-- 无数据时显示空状态 -->
          <div
            v-else
            class="flex-1 flex flex-col items-center justify-center p-4"
          >
            <p class="text-gray-400 text-sm">暂无班级记录</p>
          </div>
          <!-- 创建班级按钮始终固定在底部 -->
          <div
            class="flex-shrink-0 p-3 border-t border-gray-100 flex justify-center"
          >
            <button
              class="w-[142px] h-[50px] flex items-center justify-center gap-2 bg-[#FF9900] text-white rounded-[20px] text-[16px]"
              @click="handleCreateNewClass(null)"
            >
              <span class="text-xl">+</span>
              <span>创建班级</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 右侧主内容 -->
      <section class="main-panel flex-1 min-w-0 p-4 flex flex-col">
        <!-- Tab 切换 - 固定 -->
        <MTabs v-model="activeTab" :tabs="tabList" class="mb-4 flex-shrink-0" />

        <!-- 搜索 + 操作按钮 + 表格 -->
        <div class="bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0">
          <!-- 搜索 + 统一密码 + 操作按钮 - 固定 -->
          <div
            class="flex flex-wrap items-center justify-between gap-3 mb-3 flex-shrink-0"
          >
            <!-- 左侧：搜索框 + 提示 -->
            <div class="flex items-center gap-3">
              <MInput
                v-model="searchKeyword"
                placeholder="输入学生账号或姓名进行查找"
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
              <span
                class="hidden lg:inline-block w-[180px] xl:w-[200px] text-sm text-[#CBCBCB]"
                >学生统一密码为：{{ studentPassword || '-' }}</span
              >
            </div>
            <!-- 右侧：按钮组 -->
            <div class="flex items-center gap-2 xl:gap-3">
              <button
                :class="[
                  'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch' || isCurrentClassQuickLogin
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FF9900] text-white',
                ]"
                :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                @click="handleCreateAction()"
              >
                + 创建学生
              </button>
              <div class="relative group">
                <button
                  :class="[
                    'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                    activeAction === 'batch' || isOtherClassQuickLogin
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isCurrentClassQuickLogin
                      ? 'bg-[#FF9900] text-white'
                      : 'bg-[#FFF1DD] text-[#4D4D4D]',
                  ]"
                  :disabled="activeAction === 'batch' || isOtherClassQuickLogin"
                  @click="handleQuickLogin"
                >
                  {{ isCurrentClassQuickLogin ? "停用快捷登录" : "启用快捷登录" }}
                </button>
                <!-- 自定义tooltip -->
                <div
                  v-if="isOtherClassQuickLogin"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                >
                  您已经在其他班级创建了班级码
                  <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
              <button
                :class="[
                  'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]"
                :disabled="activeAction === 'batch'"
                @click="handleExport"
              >
                导出学生信息
              </button>
              <button
                :class="[
                  'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch'
                    ? 'bg-[#FF9900] text-white'
                    : isCurrentClassQuickLogin
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]"
                :disabled="isCurrentClassQuickLogin && activeAction !== 'batch'"
                @click="handleBatchAction"
              >
                {{ activeAction === "batch" ? "取消批量操作" : "批量操作" }}
              </button>
            </div>
          </div>

          <!-- 快捷登录信息栏 -->
          <div
            v-if="isCurrentClassQuickLogin"
            class="flex items-center gap-4 px-4 py-3 mb-3 bg-[#FF9900] rounded-lg text-white text-sm"
          >
            <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded">NEW</span>
    
            <span class="border-l border-white/30 pl-4">班级码：{{ quickLoginData.classCode || '-' }}</span>
            <span>统一登录密码：{{ quickLoginData.classCodePwd || '-' }}</span>
            <button
              class="px-2 py-1 border border-white/50 rounded text-xs hover:bg-white/10"
              @click="copyToClipboard(quickLoginData.classCodePwd)"
            >
              复制
            </button>
            <span class="flex items-center gap-1 text-white/80 text-s ml-auto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              (有效时长为2小时，{{ quickLoginData.expirationDate || '' }}过期)
            </span>
            <button
              class="p-1 hover:bg-white/10 rounded"
              @click="handleRefreshQuickLogin"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- 表格 - 可滚动区域 -->
          <div class="flex-1 overflow-auto min-h-0">
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
              <template #action="{ row }">
                <div
                  class="flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <button
                    class="px-3 py-1 text-sm text-[#4D4D4D] border border-[#CBCBCB] rounded-[7px] hover:border-[#FF9900] transition-colors"
                    @click="handleResetPassword(row)"
                  >
                    重置密码
                  </button>
                  <button
                    class="px-3 py-1 text-sm text-[#4D4D4D] border border-[#CBCBCB] rounded-[7px] hover:border-[#FF9900] transition-colors"
                    @click="handleTransfer(row)"
                  >
                    移班
                  </button>
                  <button
                    class="px-3 py-1 text-sm text-[#FF0000] border border-[#CBCBCB] rounded-[7px] hover:border-[#FF0000] transition-colors"
                    @click="handleDeleteStudent(row)"
                  >
                    删除
                  </button>
                </div>
              </template>
            </MTable>
          </div>

          <!-- 批量操作栏 - 表格底部 -->
          <div
            v-if="activeAction === 'batch'"
            class="flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] border-t border-gray-200"
          >
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  class="w-4 h-4 accent-[#FF9900]"
                  @change="handleSelectAllToggle"
                />
                <span class="text-sm text-[#4D4D4D]">全选</span>
              </label>
              <span class="text-sm text-[#4D4D4D]"
                >已选
                <span class="text-[#FF9900]">{{
                  selectedStudentIds.length
                }}</span>
                项</span
              >
            </div>
            <div class="flex items-center gap-4">
              <button
                class="text-sm text-[#4D4D4D] hover:text-[#FF9900]"
                @click="handleBatchResetPassword"
              >
                批量重置密码
              </button>
              <button
                class="text-sm text-[#4D4D4D] hover:text-[#FF9900]"
                @click="handleBatchTransfer"
              >
                批量移班
              </button>
              <button
                class="text-sm text-[#4D4D4D] hover:text-[#FF9900]"
                @click="handleBatchDelete"
              >
                批量删除
              </button>
              <button
                class="text-sm text-[#4D4D4D] hover:text-[#FF9900]"
                @click="handleClearSelection"
              >
                取消批量操作
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 添加学生弹窗 -->
    <MModal
      v-model="showCreateModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[428px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showCreateModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题居中 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          添加学生
        </h3>

        <!-- 添加方式切换 -->
        <div class="flex justify-center gap-3 mb-6">
          <button
            :class="[
              'w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors',
              addStudentMode === 'batch'
                ? 'bg-[#FF9900] text-white'
                : 'border border-gray-300 text-[#FF9900]',
            ]"
            @click="addStudentMode = 'batch'"
          >
            批量导入添加
          </button>
          <button
            :class="[
              'w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors',
              addStudentMode === 'manual'
                ? 'bg-[#FF9900] text-white'
                : 'border border-gray-300 text-[#FF9900]',
            ]"
            @click="addStudentMode = 'manual'"
          >
            手动添加
          </button>
        </div>

        <!-- 批量导入模式 -->
        <template v-if="addStudentMode === 'batch'">
          <div class="flex justify-center gap-3 mb-6">
            <button
              class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500"
              @click="handleImportStudents"
            >
              导入学生信息
            </button>
            <button
              class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500"
              @click="handleDownloadTemplate"
            >
              下载导入模版
            </button>
          </div>

          <p class="text-sm text-gray-400 flex-1">
            批量导入学生信息后，系统将自动创建学生账号，该班级学生默认密码统一为：{{studentPassword}}
          </p>
        </template>

        <!-- 手动添加模式 -->
        <template v-else>
          <div class="flex justify-center flex-1">
            <MInput
              v-model="createForm.name"
              placeholder="学生姓名"
              class="w-[275px]"
            />
          </div>
        </template>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-auto pt-4">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showCreateModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleCreateStudent"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 创建班级弹窗 -->
    <MModal
      v-model="showCreateClassModal"
      custom-width="380px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showCreateClassModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题居中 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          {{ isEditClass ? "编辑班级" : "创建班级" }}
        </h3>

        <!-- 表单 -->
        <div class="space-y-4 px-2">
          <MSelect
            v-model="createClassForm.gradeId"
            :options="gradeOptions"
            placeholder="年级"
          />
          <MInput v-model="createClassForm.className" placeholder="班级" />
          <MInput
            v-model="createClassForm.teacherName"
            placeholder="老师"
            disabled
          />
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button
            class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showCreateClassModal = false"
          >
            取消
          </button>
          <button
            class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmCreateClass"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除班级确认弹窗 -->
    <MModal
      v-model="showDeleteClassModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[249px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showDeleteClassModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          提示
        </h3>

        <!-- 内容居中 -->
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">确认要删除此班级吗？</p>
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteClassModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteClass"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 重置密码确认弹窗 -->
    <MModal
      v-model="showResetPasswordModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[249px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showResetPasswordModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          提示
        </h3>

        <!-- 内容居中 -->
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">
            确认重置{{ resettingStudent?.name }}的密码吗？
          </p>
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showResetPasswordModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmResetPassword"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 移班弹窗 -->
    <MModal
      v-model="showTransferModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showTransferModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          移班
        </h3>

        <!-- 表单 -->
        <div class="space-y-4 px-2">
          <MSelect
            v-model="transferForm.gradeId"
            :options="gradeOptions"
            placeholder="选择年级"
            @update:model-value="handleTransferGradeChange"
          />
          <MSelect
            v-model="transferForm.classId"
            :options="transferClassOptions"
            placeholder="选择班级"
            :disabled="!transferForm.gradeId"
            @change="handleTransferClassChange"
          />
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showTransferModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmTransfer"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除学生确认弹窗 -->
    <MModal
      v-model="showDeleteStudentModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[249px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showDeleteStudentModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          提示
        </h3>

        <!-- 内容居中 -->
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">
            确认要删除{{ deletingStudent?.name }}吗？
          </p>
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteStudentModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteStudent"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量重置密码确认弹窗 -->
    <MModal
      v-model="showBatchResetPasswordModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[249px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showBatchResetPasswordModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          提示
        </h3>

        <!-- 内容居中 -->
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D] text-center px-4">
            确定将{{ selectedStudentNames }}学生的密码重置吗？
          </p>
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchResetPasswordModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchResetPassword"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量删除确认弹窗 -->
    <MModal
      v-model="showBatchDeleteModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[249px] p-6 relative flex flex-col">
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showBatchDeleteModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          提示
        </h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D] text-center px-4">
            确认删除选中的 {{ selectedStudentIds.length }} 名学生吗？
          </p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchDeleteModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchDelete"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量移班弹窗 -->
    <MModal
      v-model="showBatchTransferModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <!-- 关闭按钮 -->
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showBatchTransferModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          批量移班
        </h3>

        <!-- 提示文字 -->
        <p class="text-sm text-gray-500 text-center mb-4">
          已选中{{
            selectedStudentIds.length
          }}位学生，请选择所要移至的班级，完成批量移班
        </p>

        <!-- 表单 -->
        <div class="space-y-4 px-2">
          <MSelect
            v-model="batchTransferForm.gradeId"
            :options="gradeOptions"
            placeholder="选择年级"
            @update:model-value="handleBatchTransferGradeChange"
          />
          <MSelect
            v-model="batchTransferForm.classId"
            :options="batchTransferClassOptions"
            placeholder="选择班级"
            :disabled="!batchTransferForm.gradeId"
          />
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchTransferModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchTransfer"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 新密码展示弹窗 -->
    <MModal
      v-model="showNewPasswordModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[249px] p-6 relative flex flex-col">
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showNewPasswordModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          提示
        </h3>
        <div class="flex-1 flex flex-col items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D] mb-2">密码重置成功</p>
          <p class="text-[18px] text-[#FF9900] font-medium">
            新密码：{{ newPassword }}
          </p>
        </div>
        <div class="flex items-center justify-center">
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="showNewPasswordModal = false"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 快捷登录弹窗 -->
    <MModal
      v-model="showQuickLoginModal"
      custom-width="420px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showQuickLoginModal = false"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          启用快捷登录
        </h3>
        <p class="text-center text-[#4D4D4D] mb-6">
          学生可通过「快捷登录链接」免账号登录，或者使用「班级码+密码」登录。
        </p>
        <div
          class="flex items-center justify-center gap-2 text-[#999] text-sm mb-8"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>班级码使用期间，无法调整当前班级学生账号</span>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showQuickLoginModal = false"
          >
            取消
          </button>
          <button
            class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmQuickLogin"
          >
            创建
          </button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { MMessage } from "~/components/ui";
import { useTeacherNav } from "@/composables/api/useTeacherNav";
import { useTeacher } from "@/composables/api/useTeacher";
import { title } from "process";
import { _minWidth } from "#tailwind-config/theme";

definePageMeta({
  layout: "default",
});

// 左侧教师导航（登录后请求一次并缓存）
const route = useRoute();
const { menuItems, loadMenus } = useTeacherNav();
const {
  getGradeDict,
  getClassList,
  getClassByGrade,
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
  importStudent
} = useTeacher();

// 规范化路径，去掉末尾的 /index 方便匹配
const normalizePath = (p: string) => p.replace(/\/index$/, "");
const isActivePath = (path: string) => {
  const current = normalizePath(route.path);
  const target = normalizePath(path);
  return current === target || current.startsWith(target + "/");
};
const isActiveItem = (item: any) => {
  if (!item) return false;
  if (item.activeMenu && route.path.includes(item.activeMenu)) return true;
  return isActivePath(item.path || "");
};
const go = (path: string) => navigateTo(normalizePath(path));

// Tab 数据
const tabList = [
  { label: "学生管理", value: "student" },
  { label: "小组管理", value: "group" },
];
const activeTab = ref("student");

// 搜索关键词
const searchKeyword = ref("");

// 学生统一密码
const studentPassword = ref("");

// 加载状态
const loading = ref(false);

// 当前选中的班级
const selectedClass = ref<any>(null);

// 展开的节点
const expandedKeys = ref<(string | number)[]>([1]);

// 年级班级数据（树形结构）
const treeData = ref<any[]>([]);

// 班级选项（用于下拉选择）
const classOptions = computed(() => {
  const options: { label: string; value: number }[] = [];
  treeData.value.forEach((grade) => {
    grade.children?.forEach((cls) => {
      options.push({ label: `${grade.name}${cls.name}`, value: cls.id });
    });
  });
  return options;
});

// 表格列配置
const tableColumns = [
  { key: "studentName", title: "学生姓名", minWidth: "120px" },
  { key: "studentNumber", title: "学生账号", minWidth: "150px" },
  { key: "createTime", title: "创建时间", minWidth: "150px" },
  { key: "action", title: "操作", width: "220px", align: "center" as const },
];

// 学生列表
const studentList = ref<any[]>([]);

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
  teacherName: "", // 老师名称，禁用输入
});

// 删除班级确认弹窗
const showDeleteClassModal = ref(false);
const deletingClass = ref<any>(null);

// 快捷登录弹窗
const showQuickLoginModal = ref(false);
const isQuickLoginEnabled = ref(false); // 快捷登录是否已启用
const quickLoginData = ref<{ classCode?: string; classId?: string; classCodePwd?: string; expirationDate?: string }>({});
const quickLoginClassId = ref<string | null>(null); // 记录启用快捷登录的班级ID
// 快捷登录链接
const quickLoginUrl = computed(() => {
  if (!quickLoginData.value.classCode) return '';
  return `${window.location.origin}/student?code=${quickLoginData.value.classCode}`;
});
// 当前班级是否是启用快捷登录的班级
const isCurrentClassQuickLogin = computed(() => {
  return !!(quickLoginClassId.value && quickLoginClassId.value === selectedClass.value?.id);
});
// 是否在其他班级启用了快捷登录
const isOtherClassQuickLogin = computed(() => {
  return !!(quickLoginClassId.value && quickLoginClassId.value !== selectedClass.value?.id);
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

// 删除学生确认弹窗
const showDeleteStudentModal = ref(false);
const deletingStudent = ref<any>(null);

// 批量重置密码确认弹窗
const showBatchResetPasswordModal = ref(false);

// 批量删除确认弹窗
const showBatchDeleteModal = ref(false);

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

// 老师选项
const teacherOptions = [
  { label: "张老师", value: 1 },
  { label: "李老师", value: 2 },
  { label: "王老师", value: 3 },
];

// 批量选择
const selectedStudentIds = ref<number[]>([]);

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

// ===== 事件处理 =====

// 选择全部班级
const handleSelectAll = () => {
  selectedClass.value = null;
  MMessage.info("已选择全部班级");
};
// 加载年级字典
const loadGradeOptions = async () => {
  try {
    const data = await getGradeDict();
    console.log(data, "年级字典列表");
    gradeOptions.value = (data || []).map((item: any) => ({
      label: item.dictLabel,
      value: item.dictValue,
    }));
  } catch (error) {
    console.error("获取年级字典失败:", error);
  }
};
// 加载班级列表
const loadClassList = async () => {
  loading.value = true;
  try {
    let data = await getClassList();
    console.log(data, "班级列表");
    // 转换成树形结构
    treeData.value = (data || []).map((item: any) => ({
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

    // 默认选中第一个年级的第一个班级
    if (treeData.value.length > 0 && treeData.value[0].children?.length > 0) {
      const firstGrade = treeData.value[0];
      const firstClass = firstGrade.children[0];
      selectedClass.value = firstClass;
      // 展开第一个年级
      if (!expandedKeys.value.includes(firstGrade.id)) {
        expandedKeys.value.push(firstGrade.id);
      }
      // 加载第一个班级的学生列表
      loadStudentList(firstClass.id);
    }
  } catch (error) {
    console.error("获取班级列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 获取学生列表
const loadStudentList = async (classId?: string) => {
  const id = classId || selectedClass.value?.id;
  if (!id) return;

  loading.value = true;
  try {
    const keyword = searchKeyword.value?.trim();
    // 判断是学号还是姓名：纯数字或字母数字组合视为学号，否则视为姓名
    const isStudentNumber = keyword && /^[a-zA-Z0-9]+$/.test(keyword);

    const data = await getStudentList({
      classId: id,
      studentName: !isStudentNumber && keyword ? keyword : undefined,
      studentNumber: isStudentNumber ? keyword : undefined,
    });
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
onMounted(() => {
  loadMenus();
  loadGradeOptions();
  loadClassList();
  loadQuickLoginStatus();
  loadStudentPassword();
});

// 加载学生统一密码
const loadStudentPassword = async () => {
  try {
    const data = await getStudentPassword();
    studentPassword.value = data || "";
  } catch (error) {
    console.error("获取学生统一密码失败:", error);
  }
};

// 加载快捷登录状态
const loadQuickLoginStatus = async () => {
  try {
    const data = await getQuickLoginInfo();
    console.log('快捷登录状态:', data);
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
    // 只有班级（叶子节点）才能选中
    selectedClass.value = node;
    // 加载该班级的学生列表
    loadStudentList(node.id);
    // 不在切换班级时检查快捷登录状态，保持之前的状态
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
  createClassForm.gradeId = node.grade || null;
  createClassForm.className = node.name;
  createClassForm.teacherName = node.teacherName || "";
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
    let res = await deleteClass(deletingClass.value.id);
    if (res.code == 200) {
      MMessage.success(`已删除班级：${deletingClass.value.name}`);
      // 刷新班级列表
      loadClassList();
    } else {
    }
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
  createClassForm.teacherName = "";
  // 如果有传入年级节点，预设年级
  if (gradeNode) {
    createClassForm.gradeId = gradeNode.id;
  }
  showCreateClassModal.value = true;
};

// 确认创建/编辑班级
const handleConfirmCreateClass = async () => {
  if (!createClassForm.gradeId) {
    MMessage.error("请选择年级");
    return;
  }
  if (!createClassForm.className) {
    MMessage.error("请输入班级名称");
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
      MMessage.success("编辑班级成功");
    } else {
      // 创建班级
      await createClass({
        className: createClassForm.className,
        grade: Number(createClassForm.gradeId),
        gradeName: selectedGrade?.label || "",
      });
      MMessage.success("创建班级成功");
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

// 创建学生 - 始终打开弹窗，不参与互斥切换
const handleCreateAction = () => {
  showCreateModal.value = true;
};

// 快捷登录or停用快捷登录
const handleQuickLogin = async () => {
  if (isCurrentClassQuickLogin.value) {
    // 当前班级已启用，点击停用
    try {
      await stopQuickLogin(selectedClass.value.id);
      isQuickLoginEnabled.value = false;
      quickLoginClassId.value = null;
      quickLoginData.value = {};
      MMessage.info("快捷登录已停用");
    } catch (error) {
      console.error("停用快捷登录失败:", error);
    }
  } else if (!isOtherClassQuickLogin.value) {
    // 没有其他班级启用，打开弹窗
    showQuickLoginModal.value = true;
  }
};

// 确认创建快捷登录
const handleConfirmQuickLogin = async () => {
  if (!selectedClass.value?.id) {
    MMessage.error("请先选择班级");
    return;
  }
  try {
    const data = await createQuickLogin(selectedClass.value.id);
    console.log('快捷登录数据:', data);
    quickLoginData.value = data || {};
    quickLoginClassId.value = selectedClass.value.id;
    MMessage.success("快捷登录已启用");
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
const copyToClipboard = async (text?: string) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    MMessage.success("复制成功");
  } catch (error) {
    MMessage.error("复制失败");
  }
};

// 刷新快捷登录
const handleRefreshQuickLogin = async () => {
  if (!selectedClass.value?.id) return;
  try {
    const data = await createQuickLogin(selectedClass.value.id);
    quickLoginData.value = data || {};
    MMessage.success("已刷新");
  } catch (error) {
    console.error("刷新快捷登录失败:", error);
  }
};

// 导出
const handleExport = async () => {
  try {
    MMessage.info("正在导出学生信息...");
    await exportStudentInfo();
    MMessage.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    MMessage.error("导出失败");
  }
};

// 批量操作
const handleBatchAction = () => {
  if (activeAction.value === "batch") {
    activeAction.value = null;
    selectedStudentIds.value = [];
    MMessage.info("已退出批量操作模式");
  } else {
    activeAction.value = "batch";
    MMessage.info("已进入批量操作模式，请勾选学生");
  }
};

// 学生选择
const handleStudentSelect = (keys: number[], rows: any[]) => {
  selectedStudentIds.value = keys;
};

// 全选
const handleStudentSelectAll = (selected: boolean) => {
  if (selected) {
    selectedStudentIds.value = studentList.value.map((s) => s.id);
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
    MMessage.warning("暂未选择任何学生，请在列表左侧进行勾选");
    return;
  }
  showBatchDeleteModal.value = true;
};

// 确认批量删除
const handleConfirmBatchDelete = async () => {
  try {
    await removeStudent(selectedStudentIds.value.map(String));
    MMessage.success(`已删除 ${selectedStudentIds.value.length} 名学生`);
    selectedStudentIds.value = [];
    // 刷新学生列表
    loadStudentList();
  } catch (error) {
    console.error("批量删除失败:", error);
  } finally {
    showBatchDeleteModal.value = false;
  }
};

// 批量移班
const handleBatchTransfer = () => {
  if (selectedStudentIds.value.length === 0) {
    MMessage.warning("暂未选择任何学生，请在列表左侧进行勾选");
    return;
  }
  batchTransferForm.gradeId = null;
  batchTransferForm.classId = null;
  showBatchTransferModal.value = true;
};

// 确认批量移班
const handleConfirmBatchTransfer = async () => {
  if (!batchTransferForm.gradeId) {
    MMessage.error("请选择年级");
    return;
  }
  if (!batchTransferForm.classId) {
    MMessage.error("请选择班级");
    return;
  }

  // 从batchTransferClassList获取目标班级的teacherId
  const targetClass = batchTransferClassList.value.find(
    (c: any) => c.classId === batchTransferForm.classId
  );

  try {
    await transferClass({
      ids: selectedStudentIds.value.map(String),
      classId: batchTransferForm.classId as string,
      teacherId: targetClass?.teacherId || "",
    });
    MMessage.success(
      `已将 ${selectedStudentIds.value.length} 名学生移至新班级`
    );
    // 刷新学生列表
    loadStudentList();
  } catch (error) {
    console.error("批量移班失败:", error);
  } finally {
    showBatchTransferModal.value = false;
  }
};

// 根据年级获取批量移班的班级选项
const batchTransferClassOptions = computed(() => {
  return batchTransferClassList.value.map((cls: any) => ({
    label: cls.className,
    value: cls.classId,
  }));
});

// 批量重置密码
const handleBatchResetPassword = () => {
  if (selectedStudentIds.value.length === 0) {
    MMessage.warning("暂未选择任何学生，请在列表左侧进行勾选");
    return;
  }
  showBatchResetPasswordModal.value = true;
};

// 获取选中学生的名字列表
const selectedStudentNames = computed(() => {
  return studentList.value
    .filter((s) => selectedStudentIds.value.includes(s.id))
    .map((s) => s.name)
    .join(",");
});

// 确认批量重置密码
const handleConfirmBatchResetPassword = async () => {
  try {
    const data = await resetPassword(selectedStudentIds.value.map(String));
    showBatchResetPasswordModal.value = false;
    // 显示新密码弹窗
    newPassword.value = data || "";
    showNewPasswordModal.value = true;
  } catch (error) {
    console.error("批量重置密码失败:", error);
    showBatchResetPasswordModal.value = false;
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
  if (!resettingStudent.value) {
    showResetPasswordModal.value = false;
    return;
  }

  try {
    const data = await resetPassword([resettingStudent.value.id]);
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
  // transferForm.classId = null;
  // transferForm.id = null;
  transferForm.teacherId = null;
  transferClassList.value = [];
  showTransferModal.value = true;
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
const handleTransferClassChange = (
  value: string | number | null,
  option: any
) => {
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
    MMessage.error("请选择年级");
    return;
  }
  if (!transferForm.classId) {
    MMessage.error("请选择班级");
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
    MMessage.success(
      `已将 ${transferringStudent.value.studentName} 移至新班级`
    );
    // 刷新学生列表
    loadStudentList();
  } catch (error) {
    console.error("移班失败:", error);
  } finally {
    showTransferModal.value = false;
    transferringStudent.value = null;
  }
};

// 根据年级加载班级列表（移班用）
const loadTransferClassList = async (grade: string) => {
  try {
    const data = await getClassByGrade(grade);
    console.log("班级列表API返回:", data);
    transferClassList.value = data || [];
    console.log("transferClassOptions:", transferClassOptions.value);
  } catch (error) {
    console.error("获取班级列表失败:", error);
    transferClassList.value = [];
  }
};

// 根据年级加载班级列表（批量移班用）
const loadBatchTransferClassList = async (grade: string) => {
  try {
    const data = await getClassByGrade(grade);
    batchTransferClassList.value = data || [];
  } catch (error) {
    console.error("获取班级列表失败:", error);
    batchTransferClassList.value = [];
  }
};

// 根据年级获取班级选项
const transferClassOptions = computed(() => {
  return transferClassList.value.map((cls: any) => ({
    label: cls.className,
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
    MMessage.success(`已删除学生：${deletingStudent.value.studentName}`);
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
    MMessage.error("请先选择班级");
    return;
  }
  // 创建隐藏的文件输入框
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      MMessage.info("正在导入学生信息...");
      await importStudent(file, selectedClass.value.id);
      MMessage.success("导入成功");
      // 刷新学生列表
      loadStudentList();
      showCreateModal.value = false;
    } catch (error: any) {
      console.error("导入失败:", error);
      MMessage.error(error.message || "导入失败");
    }
  };
  input.click();
};

// 下载导入模板
const handleDownloadTemplate = async () => {
  try {
    MMessage.info("正在下载导入模板...");
    await downloadTemplate();
    MMessage.success("下载成功");
  } catch (error) {
    console.error("下载失败:", error);
    MMessage.error("下载失败");
  }
};

// 创建学生
const handleCreateStudent = async () => {
  if (addStudentMode.value === "manual") {
    if (!selectedClass.value?.id) {
      MMessage.error("请先选择班级");
      return;
    }
    if (!createForm.name) {
      MMessage.error("请填写学生姓名");
      return;
    }
    try {
      await addStudent({
        classId: selectedClass.value.id,
        studentName: createForm.name,
      });
      MMessage.success("创建学生成功");
      // 刷新学生列表
      loadStudentList();
    } catch (error) {
      console.error("创建学生失败:", error);
      return;
    }
  } else {
    MMessage.success("批量导入成功");
  }
  showCreateModal.value = false;
  // 重置表单
  createForm.name = "";
  addStudentMode.value = "batch";
};
</script>

<style scoped>
.class-page {
  height: calc(100vh - 70px - 20px);
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 20px;
  display: flex;
  justify-content: center;
  overflow: hidden;
  max-width: 100vw;
}

/* 平板及以上 */
@media (min-width: 768px) {
  .class-page {
    height: calc(100vh - 70px - 30px);
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 30px;
  }
}

/* 中等屏幕 */
@media (min-width: 1280px) {
  .class-page {
    padding-left: 40px;
    padding-right: 40px;
  }
}

/* 大屏幕 */
@media (min-width: 1536px) {
  .class-page {
    padding-left: 60px;
    padding-right: 60px;
  }
}

.left-panel {
  background: white;
}

.right-panel {
  background: #f5f5f5;
}

/* 主内容区 - 不滚动，让内部表格滚动 */
.main-panel {
  overflow: hidden;
}

/* 年级树面板 - 占满高度，不显示滚动条 */
.grade-panel {
  height: 100%;
  overflow: hidden;
}
</style>
