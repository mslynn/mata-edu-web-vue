<template>
  <div class="class-page flex bg-[#FAFAFA]">
    <!-- 左侧教师导航（固定） -->
    <aside class="teacher-nav hidden lg:flex w-[220px] xl:w-[260px] 2xl:w-[295px] flex-col flex-shrink-0">
      <nav class="flex-1 overflow-auto py-2">
        <button v-for="item in menuItems" :key="item.path" type="button" :disabled="isActiveItem(item)" :class="[
          'w-full text-left flex items-center h-[50px] gap-3 px-4 py-3 transition-colors',
          isActiveItem(item)
            ? 'bg-[#FF9900] text-white font-normal cursor-default rounded-lg '
            : 'text-gray-700 hover:bg-gray-50 cursor-pointer text-sm',
        ]" :style="isActiveItem(item) ? { fontSize: '20px' } : {}" @click="!isActiveItem(item) && go(item.path)">
          <div class="w-9 h-9 flex items-center justify-center">
            <img v-if="item.icon || item.iconSelected" :src="isActiveItem(item) ? item.iconSelected || item.icon : item.icon
              " alt="" class="w-9 h-9 object-contain" />
            <span v-else>•</span>
          </div>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- 中间内容：年级树 + 主内容 -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
      <!-- 年级/班级树 -->
      <section class="grade-panel w-full lg:w-[280px] xl:w-[309px] flex-shrink-0 p-3 flex flex-col">
        <MButton type="primary" class="mb-3 w-[142px] h-[50px] flex-shrink-0" size="small" @click="handleSelectAll"
          style="
            border-radius: 10px;
            font-size: 16px;
            background-color: #ff9900;
            border-color: #ff9900;
          ">
          全部班级
        </MButton>
        <div class="bg-[#FFFFFF] shadow-sm flex-1 flex flex-col min-h-0">
          <!-- 有数据时显示树 -->
          <div v-if="treeData.length" class="flex-1 overflow-y-auto p-2">
            <MTree :data="treeData" :selected-key="selectedClass?.id" :expanded-keys="expandedKeys" label-key="name"
              :children-key="'children'" @select="handleTreeSelect" @expand="handleTreeExpand"
              @create-class="handleCreateNewClass">
              <template #actions="{ node }">
                <template v-if="node.children"></template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <img src="~/assets/images/edit.png" alt="编辑" class="w-5 h-5 cursor-pointer"
                      @click.stop="handleEditClass(node)" />
                    <img src="~/assets/images/del.png" alt="删除" class="w-5 h-5 cursor-pointer"
                      @click.stop="handleDeleteClass(node)" />
                  </div>
                </template>
              </template>
            </MTree>
          </div>
          <!-- 无数据时显示空状态 -->
          <div v-else class="flex-1 flex flex-col items-center justify-center p-4">
            <p class="text-gray-400 text-sm">暂无班级记录</p>
          </div>
          <!-- 创建班级按钮始终固定在底部 -->
          <div class="flex-shrink-0 p-3 border-t border-gray-100 flex justify-center">
            <button
              class="w-[142px] h-[50px] flex items-center justify-center gap-2 bg-[#FF9900] text-white rounded-[20px] text-[16px]"
              @click="handleCreateNewClass(null)">
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

        <!-- 学生管理 Tab -->
        <div v-if="activeTab === 'student'" class="bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0">
          <!-- 搜索 + 统一密码 + 操作按钮 - 固定 -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3 flex-shrink-0">
            <!-- 左侧：搜索框 + 提示 -->
            <div class="flex items-center gap-3">
              <MInput v-model="searchKeyword" placeholder="输入学生账号或姓名进行查找" clearable class="w-[200px] xl:w-[270px]"
                @enter="handleSearch" @clear="handleSearch">
                <template #prefix>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </template>
              </MInput>
              <span class="hidden lg:inline-block w-[180px] xl:w-[200px] text-sm text-[#CBCBCB]">学生统一密码为：{{
                studentPassword ||
                '-' }}</span>
            </div>
            <!-- 右侧：按钮组 -->
            <div class="flex items-center gap-2 xl:gap-3">
              <button :class="[
                'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                activeAction === 'batch' || isCurrentClassQuickLogin
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FF9900] text-white',
              ]" :disabled="activeAction === 'batch' || isCurrentClassQuickLogin" @click="handleCreateAction()">
                + 创建学生
              </button>
              <div class="relative group">
                <button :class="[
                  'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch' || isOtherClassQuickLogin
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isCurrentClassQuickLogin
                      ? 'bg-[#FF9900] text-white'
                      : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]" :disabled="activeAction === 'batch' || isOtherClassQuickLogin" @click="handleQuickLogin">
                  {{ isCurrentClassQuickLogin ? "停用快捷登录" : "启用快捷登录" }}
                </button>
                <!-- 自定义tooltip -->
                <div v-if="isOtherClassQuickLogin"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  您已经在其他班级创建了班级码
                  <div
                    class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800">
                  </div>
                </div>
              </div>
              <button :class="[
                'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                activeAction === 'batch'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FFF1DD] text-[#4D4D4D]',
              ]" :disabled="activeAction === 'batch'" @click="handleExport">
                导出学生信息
              </button>
              <button :class="[
                'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                activeAction === 'batch'
                  ? 'bg-[#FF9900] text-white'
                  : isCurrentClassQuickLogin
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFF1DD] text-[#4D4D4D]',
              ]" :disabled="isCurrentClassQuickLogin && activeAction !== 'batch'" @click="handleBatchAction">
                {{ activeAction === "batch" ? "取消批量操作" : "批量操作" }}
              </button>
            </div>
          </div>

          <!-- 快捷登录信息栏 -->
          <div v-if="isCurrentClassQuickLogin"
            class="flex items-center gap-4 px-4 py-3 mb-3 bg-[#FF9900] rounded-lg text-white text-sm">
            <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded">NEW</span>

            <span class="border-l border-white/30 pl-4">班级码：{{ quickLoginData.classCode || '-' }}</span>
            <span>统一登录密码：{{ quickLoginData.classCodePwd || '-' }}</span>
            <button class="px-2 py-1 border border-white/50 rounded text-xs hover:bg-white/10"
              @click="copyToClipboard(quickLoginData.classCodePwd)">
              复制
            </button>
            <span class="flex items-center gap-1 text-white/80 text-s ml-auto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              (有效时长为2小时，{{ quickLoginData.expirationDate || '' }}过期)
            </span>
            <button class="p-1 hover:bg-white/10 rounded" @click="handleRefreshQuickLogin">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- 表格 - 可滚动区域 -->
          <div class="flex-1 overflow-auto min-h-0">
            <MTable :columns="tableColumns" :data="studentList" :loading="loading" :selected-keys="selectedStudentIds"
              show-index :selectable="activeAction === 'batch'" stripe @select="handleStudentSelect"
              @select-all="handleStudentSelectAll">
              <template #studentName="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[120px]">{{ row.studentName || '-' }}</span>
                  <div v-if="row.studentName" class="tooltip-content">
                    {{ row.studentName }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #studentNumber="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[150px]">{{ row.studentNumber || '-' }}</span>
                  <div v-if="row.studentNumber" class="tooltip-content">
                    {{ row.studentNumber }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #createTime="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[150px]">{{ row.createTime || '-' }}</span>
                  <div v-if="row.createTime" class="tooltip-content">
                    {{ row.createTime }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #action="{ row }">
                <div class="flex items-center justify-center gap-2 whitespace-nowrap">
                  <button
                    :class="[
                      'px-3 py-1 text-sm border rounded-[7px] transition-colors',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900]'
                    ]"
                    :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                    @click="handleResetPassword(row)">
                    重置密码
                  </button>
                  <button
                    :class="[
                      'px-3 py-1 text-sm border rounded-[7px] transition-colors',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900]'
                    ]"
                    :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                    @click="handleTransfer(row)">
                    移班
                  </button>
                  <button
                    :class="[
                      'px-3 py-1 text-sm border rounded-[7px] transition-colors',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#FF0000] border-[#CBCBCB] hover:border-[#FF0000]'
                    ]"
                    :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                    @click="handleDeleteStudent(row)">
                    删除
                  </button>
                </div>
              </template>
            </MTable>
          </div>

          <!-- 批量操作栏 - 表格底部 -->
          <div v-if="activeAction === 'batch'"
            class="flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] border-t border-gray-200">
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :checked="isAllSelected" class="w-4 h-4 accent-[#FF9900]"
                  @change="handleSelectAllToggle" />
                <span class="text-sm text-[#4D4D4D]">全选</span>
              </label>
              <span class="text-sm text-[#4D4D4D]">已选
                <span class="text-[#FF9900]">{{
                  selectedStudentIds.length
                }}</span>
                项</span>
            </div>
            <div class="flex items-center gap-4">
              <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchResetPassword">
                批量重置密码
              </button>
              <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchTransfer">
                批量移班
              </button>
              <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDelete">
                批量删除
              </button>
              <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchAction">
                取消批量操作
              </button>
            </div>
          </div>
        </div>

        <!-- 小组管理 Tab -->
        <div v-else-if="activeTab === 'group'" class="bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0">
          <!-- 搜索 + 操作按钮 -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3 flex-shrink-0">
            <!-- 左侧：搜索框 -->
            <div class="flex items-center gap-3">
              <MInput v-model="groupSearchKeyword" placeholder="请输入小组名称及学生姓名" clearable class="w-[200px] xl:w-[270px]"
                @enter="handleGroupSearch" @clear="handleGroupSearch">
                <template #prefix>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </template>
              </MInput>
            </div>
            <!-- 右侧：按钮组 -->
            <div class="flex items-center gap-2 xl:gap-3">
              <button :class="[
                'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                groupActiveAction === 'batch'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FF9900] text-white',
              ]" :disabled="groupActiveAction === 'batch'" @click="handleCreateGroup">
                + 创建小组
              </button>
              <button :class="[
                'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                groupActiveAction === 'batch'
                  ? 'bg-[#FF9900] text-white'
                  : 'bg-[#FFF1DD] text-[#4D4D4D]',
              ]" @click="handleGroupBatchAction">
                {{ groupActiveAction === 'batch' ? '取消批量操作' : '批量操作' }}
              </button>
            </div>
          </div>

          <!-- 表格 -->
          <div class="flex-1 overflow-auto min-h-0">
            <MTable :columns="groupTableColumns" :data="groupList" :loading="groupLoading"
              :selected-keys="selectedGroupIds" show-index :selectable="groupActiveAction === 'batch'" stripe
              @select="handleGroupSelect" @select-all="handleGroupSelectAll">
              <template #teamName="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[60px]">{{ row.teamName || '-' }}</span>
                  <div v-if="row.teamName" class="tooltip-content">
                    {{ row.teamName }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #leaderName="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[40px]">{{ row.leaderName || '-' }}</span>
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
                  <span class="truncate block max-w-[80px]">{{ row.remarks || '-' }}</span>
                  <div v-if="row.remarks" class="tooltip-content">
                    {{ row.remarks }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #createTime="{ row }">
                <div class="tooltip-wrapper group relative">
                  <span class="truncate block max-w-[100px]">{{ row.createTime || '-' }}</span>
                  <div v-if="row.createTime" class="tooltip-content">
                    {{ row.createTime }}
                    <span class="tooltip-arrow"></span>
                  </div>
                </div>
              </template>
              <template #action="{ row }">
                <div class="flex items-center justify-center gap-2 whitespace-nowrap">
                  <button
                    :class="[
                      'px-3 py-1 text-sm border rounded-[7px] transition-colors',
                      groupActiveAction === 'batch'
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900]'
                    ]"
                    :disabled="groupActiveAction === 'batch'"
                    @click="handleEditGroup(row)">
                    编辑
                  </button>
                  <button
                    :class="[
                      'px-3 py-1 text-sm border rounded-[7px] transition-colors',
                      groupActiveAction === 'batch'
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#FF0000] border-[#CBCBCB] hover:border-[#FF0000]'
                    ]"
                    :disabled="groupActiveAction === 'batch'"
                    @click="handleDeleteGroup(row)">
                    删除
                  </button>
                </div>
              </template>
            </MTable>
          </div>

          <!-- 批量操作栏 -->
          <div v-if="groupActiveAction === 'batch'"
            class="flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] border-t border-gray-200">
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" :checked="isAllGroupSelected" class="w-4 h-4 accent-[#FF9900]"
                  @change="handleGroupSelectAllToggle" />
                <span class="text-sm text-[#4D4D4D]">全选</span>
              </label>
              <span class="text-sm text-[#4D4D4D]">
                已选 <span class="text-[#FF9900]">{{ selectedGroupIds.length }}</span> 项
              </span>
            </div>
            <div class="flex items-center gap-4">
              <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDeleteGroup">
                批量删除
              </button>
              <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleGroupBatchAction">
                取消批量操作
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 添加学生弹窗 -->
    <MModal v-model="showCreateModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[428px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showCreateModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 标题居中 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          添加学生
        </h3>

        <!-- 添加方式切换 -->
        <div class="flex justify-center gap-3 mb-6">
          <button :class="[
            'w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors',
            addStudentMode === 'batch'
              ? 'bg-[#FF9900] text-white'
              : 'border border-gray-300 text-[#FF9900]',
          ]" @click="addStudentMode = 'batch'">
            批量导入添加
          </button>
          <button :class="[
            'w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors',
            addStudentMode === 'manual'
              ? 'bg-[#FF9900] text-white'
              : 'border border-gray-300 text-[#FF9900]',
          ]" @click="addStudentMode = 'manual'">
            手动添加
          </button>
        </div>

        <!-- 批量导入模式 -->
        <template v-if="addStudentMode === 'batch'">
          <div class="flex justify-center gap-3 mb-6">
            <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500"
              @click="handleImportStudents">
              导入学生信息
            </button>
            <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500"
              @click="handleDownloadTemplate">
              下载导入模版
            </button>
          </div>

          <p class="text-sm text-gray-400 flex-1">
            批量导入学生信息后，系统将自动创建学生账号，该班级学生默认密码统一为：{{ studentPassword }}
          </p>
        </template>

        <!-- 手动添加模式 -->
        <template v-else>
          <div class="flex flex-col items-center gap-3 flex-1">
            <MInput v-model="createForm.name" placeholder="学生姓名" class="w-[275px]" />
            <p class="text-sm text-gray-400">学生默认密码为: {{ studentPassword }}</p>
          </div>
        </template>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-auto pt-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showCreateModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleCreateStudent">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 创建班级弹窗 -->
    <MModal v-model="showCreateClassModal" custom-width="380px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showCreateClassModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 标题居中 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          {{ isEditClass ? "编辑班级" : "创建班级" }}
        </h3>

        <!-- 表单 -->
        <div class="space-y-4 px-2">
          <MSelect v-model="createClassForm.gradeId" :options="gradeOptions" placeholder="年级" />
          <MInput v-model="createClassForm.className" placeholder="班级" />
          <MInput v-model="createClassForm.teacherName" placeholder="老师" disabled />
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showCreateClassModal = false">
            取消
          </button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmCreateClass">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除班级确认弹窗 -->
    <MModal v-model="showDeleteClassModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showDeleteClassModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteClassModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteClass">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 重置密码确认弹窗 -->
    <MModal v-model="showResetPasswordModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showResetPasswordModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          提示
        </h3>

        <!-- 内容居中 -->
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">
            确认重置{{ resettingStudent?.studentName }}的密码吗？
          </p>
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showResetPasswordModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmResetPassword">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 移班弹窗 -->
    <MModal v-model="showTransferModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showTransferModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          移班
        </h3>

        <!-- 表单 -->
        <div class="space-y-4 px-2">
          <MSelect v-model="transferForm.gradeId" :options="gradeOptions" placeholder="选择年级"
            @update:model-value="handleTransferGradeChange" />
          <MSelect v-model="transferForm.classId" :options="transferClassOptions" placeholder="选择班级"
            :disabled="!transferForm.gradeId" @change="handleTransferClassChange" />
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showTransferModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmTransfer">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除学生确认弹窗 -->
    <MModal v-model="showDeleteStudentModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showDeleteStudentModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteStudentModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteStudent">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量重置密码确认弹窗 -->
    <MModal v-model="showBatchResetPasswordModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showBatchResetPasswordModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchResetPasswordModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchResetPassword">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量删除确认弹窗 -->
    <MModal v-model="showBatchDeleteModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showBatchDeleteModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchDeleteModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchDelete">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 批量移班弹窗 -->
    <MModal v-model="showBatchTransferModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showBatchTransferModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
          <MSelect v-model="batchTransferForm.gradeId" :options="gradeOptions" placeholder="选择年级"
            @update:model-value="handleBatchTransferGradeChange" />
          <MSelect v-model="batchTransferForm.classId" :options="batchTransferClassOptions" placeholder="选择班级"
            :disabled="!batchTransferForm.gradeId" />
        </div>

        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchTransferModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchTransfer">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 新密码展示弹窗 -->
    <MModal v-model="showNewPasswordModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showNewPasswordModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="showNewPasswordModal = false">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 快捷登录弹窗 -->
    <MModal v-model="showQuickLoginModal" custom-width="420px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showQuickLoginModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          启用快捷登录
        </h3>
        <p class="text-center text-[#4D4D4D] mb-6">
          学生可通过「快捷登录链接」免账号登录，或者使用「班级码+密码」登录。
        </p>
        <div class="flex items-center justify-center gap-2 text-[#999] text-sm mb-8">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>班级码使用期间，无法调整当前班级学生账号</span>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showQuickLoginModal = false">
            取消
          </button>
          <button class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmQuickLogin">
            创建
          </button>
        </div>
      </div>
    </MModal>

    <!-- 创建/编辑小组弹窗 -->
    <MModal v-model="showGroupModal" custom-width="620px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showGroupModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          {{ isEditGroupMode ? '编辑小组' : '创建小组' }}
        </h3>

        <!-- 第一步：填写小组信息 -->
        <div class="mb-6">
          <p class="text-[#4D4D4D] font-medium mb-4">第一步：填写小组信息：</p>
          <div class="space-y-4 pl-4">
            <div class="flex items-center gap-2 whitespace-nowrap">
              <span class="text-red-500">*</span>
              <span class="text-[#4D4D4D]">小组名称：</span>
              <MInput v-model="groupForm.name" placeholder="请输入" class="w-[280px]" />
            </div>
            <div class="flex items-center gap-2 whitespace-nowrap">
              <span class="text-transparent">*</span>
              <span class="text-[#4D4D4D]">小组描述：</span>
              <MInput v-model="groupForm.remarks" placeholder="请输入" class="w-[280px]" />
            </div>
          </div>
        </div>

        <!-- 第二步：添加小组成员 -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <p class="text-[#4D4D4D] font-medium whitespace-nowrap">
              第二步：添加小组成员：<span class="text-[#FF9900] text-sm font-normal">（请记得选择组长哦）</span>
            </p>
            <button
              class="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm hover:bg-[#E68A00] whitespace-nowrap"
              @click="handleAddGroupMember"
            >
              + 添加成员
            </button>
          </div>
          
          <!-- 成员表格 -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead class="bg-[#FFF1DD]">
                <tr>
                  <th class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D]">序号</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D]">账号</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D]">姓名</th>
                  <th class="px-3 py-2 text-center text-sm font-medium text-[#4D4D4D]">是否为组长</th>
                  <th class="px-3 py-2 text-center text-sm font-medium text-[#4D4D4D]">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in groupForm.members" :key="member.id" class="border-t border-gray-100">
                  <td class="px-3 py-2 text-sm text-[#4D4D4D]">{{ index + 1 }}</td>
                  <td class="px-3 py-2 text-sm text-[#4D4D4D]">{{ member.studentNumber }}</td>
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
                    <button class="text-red-500 text-sm hover:text-red-600" @click="handleRemoveGroupMember(index)">
                      删除
                    </button>
                  </td>
                </tr>
                <!-- 空数据 -->
                <tr v-if="!groupForm.members.length">
                  <td colspan="5" class="px-4 py-8 text-center">
                    <div class="flex flex-col items-center gap-2 text-gray-400">
                      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="text-sm">暂无数据</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4">
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showGroupModal = false">
            取消
          </button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmGroup">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 添加成员弹窗 -->
    <MModal v-model="showAddMemberModal" custom-width="620px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showAddMemberModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">选择成员</h3>

        <!-- 搜索栏 -->
        <div class="mb-2">
          <MInput
            v-model="memberSearchKeyword"
            placeholder="输入学生账号或姓名进行查找"
            clearable
            class="w-full"
            @enter="handleMemberSearch"
            @clear="handleMemberSearch"
          >
            <template #prefix>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MInput>
        </div>

        <!-- 学生统计 -->
        <div class="mb-2 text-sm text-[#4D4D4D]">
          共 <span class="text-[#FF9900]">{{ filteredAvailableStudents.length }}</span> 名学生
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
                <th class="w-16 px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">序号</th>
                <th class="px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">账号</th>
                <th class="px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">姓名</th>
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
                <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ student.studentNumber || '-' }}</td>
                <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ student.studentName || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!filteredAvailableStudents.length" class="px-4 py-8 text-center text-gray-400">
            暂无可添加的学生
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showAddMemberModal = false">
            取消
          </button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmAddMembers">
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除小组确认弹窗 -->
    <MModal v-model="showDeleteGroupModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showDeleteGroupModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>

        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">
            {{ isBatchDeleteGroup ? `确认要删除选中的${selectedGroupIds.length}个小组吗？` : `确认要删除"${deletingGroup?.name}"吗？` }}
          </p>
        </div>

        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteGroupModal = false">
            取消
          </button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteGroup">
            确定
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
import { useAuth } from "@/composables/api/useAuth";
import { title } from "process";
import { _minWidth } from "#tailwind-config/theme";

definePageMeta({
  layout: "default",
});

// 左侧教师导航（登录后请求一次并缓存）
const route = useRoute();
const { menuItems, loadMenus } = useTeacherNav();
const { user } = useAuth();

// 当前用户名称
const currentUserName = computed(() => user.value?.nickName || user.value?.userName || "");
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
  importStudent,
  getGroupList,
  addGroup,
  getAddStudentList,
  deleteGroup,
  updateGroup,
  getGroupMemberList,
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
  treeData.value.forEach((grade: any) => {
    grade.children?.forEach((cls: any) => {
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

// ===== 小组管理相关 =====
const groupSearchKeyword = ref("");
const groupLoading = ref(false);
const groupList = ref<any[]>([]);
const selectedGroupIds = ref<string[]>([]);
type GroupActionType = "batch" | null;
const groupActiveAction = ref<GroupActionType>(null);

// 小组表格列配置
const groupTableColumns = [
  { key: "teamName", title: "小组名称", minWidth: "80px" },
  { key: "leaderName", title: "组长", minWidth: "60px" },
  { key: "members", title: "组内成员", minWidth: "100px" },
  { key: "remarks", title: "描述", minWidth: "100px" },
  { key: "createTime", title: "创建时间", minWidth: "120px" },
  { key: "action", title: "操作", width: "100px", align: "center" as const },
];

// 小组弹窗
const showGroupModal = ref(false);
const showDeleteGroupModal = ref(false);
const isEditGroupMode = ref(false);
const isBatchDeleteGroup = ref(false);
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
  return filteredAvailableStudents.value.every((s) => selectedMemberIds.value.includes(s.id));
});

// 切换全选
const toggleAllMemberSelection = () => {
  if (isAllMemberSelected.value) {
    // 取消全选：移除当前过滤列表中的所有学生
    const filteredIds = filteredAvailableStudents.value.map((s) => s.id);
    selectedMemberIds.value = selectedMemberIds.value.filter((id) => !filteredIds.includes(id));
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
    const params = {
      classId: id,
      numberName: keyword || undefined,
    };
    console.log(params, '参数');

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
  createClassForm.gradeId = String(node.grade) || null;
  createClassForm.className = node.name || "";
  createClassForm.teacherName = node.teacherName || selectedClass.value?.teacherName || "";
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
  createClassForm.teacherName = selectedClass.value?.teacherName || currentUserName.value || "";
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
  console.log("batchTransferForm:", batchTransferForm);
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
    (c: any) => c.id === batchTransferForm.classId
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
    value: cls.id,
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
    .filter((s) => selectedStudentIds.value.includes(String(s.id)))
    .map((s) => s.studentName)
    .join(",");
});

// 确认批量重置密码
const handleConfirmBatchResetPassword = async () => {
  try {
    const data = await resetPassword(selectedStudentIds.value);
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
  console.log(resettingStudent.value)
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

// 根据年级加载年级列表（移班用）
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
    console.log("batchTransferClassList:", data);
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

// ===== 小组管理方法 =====

// 加载小组列表
const loadGroupList = async () => {
  if (!selectedClass.value?.id) return;

  groupLoading.value = true;
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
    MMessage.warning("请先选择班级");
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
    MMessage.error("获取小组成员失败");
  }
};

// 确认创建/编辑小组
const handleConfirmGroup = async () => {
  if (!groupForm.name.trim()) {
    MMessage.warning("请输入小组名称");
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
      MMessage.success("编辑成功");
    } else {
      // 新增时不需要 delFlag
      const addData = {
        classId: selectedClass.value?.id || "",
        teamName: groupForm.name,
        remarks: groupForm.remarks || undefined,
        studentList: groupForm.members.map((m) => ({
          studentNumber: m.studentNumber,
          studentName: m.studentName,
          isLeader: m.id === groupForm.leaderId ? 0 : 1,
        })) as { studentNumber: string; studentName: string; isLeader: 0 | 1 }[],
      };
      await addGroup(addData);
      MMessage.success("创建成功");
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
  deletingGroup.value = row;
  showDeleteGroupModal.value = true;
};

// 确认删除小组
const handleConfirmDeleteGroup = async () => {
  try {
    if (isBatchDeleteGroup.value) {
      // 批量删除
      await deleteGroup(selectedGroupIds.value);
      MMessage.success("批量删除成功");
      selectedGroupIds.value = [];
    } else {
      // 单个删除
      if (deletingGroup.value?.id) {
        await deleteGroup([deletingGroup.value.id]);
        MMessage.success("删除成功");
      }
    }
    showDeleteGroupModal.value = false;
    loadGroupList();
  } catch (error) {
    console.error("删除失败:", error);
  }
};

// 小组批量操作
const handleGroupBatchAction = () => {
  if (groupActiveAction.value === "batch") {
    groupActiveAction.value = null;
    selectedGroupIds.value = [];
  } else {
    groupActiveAction.value = "batch";
  }
};

// 批量删除小组
const handleBatchDeleteGroup = () => {
  if (!selectedGroupIds.value.length) {
    MMessage.warning("请先选择要删除的小组");
    return;
  }
  isBatchDeleteGroup.value = true;
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
  groupActiveAction.value = null;
  selectedGroupIds.value = [];
};

// 监听Tab切换，加载对应数据
watch(activeTab, (newTab) => {
  if (newTab === "group" && selectedClass.value?.id) {
    loadGroupList();
  }
});
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

/* 自定义 Tooltip 样式 */
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
  font-size: 14px;
  border-radius: 6px;
  white-space: nowrap;
  max-width: 300px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
  pointer-events: none;
}

/* 小箭头 */
.tooltip-arrow {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: #4a4a4a transparent transparent transparent;
}

/* 鼠标悬停显示 */
.tooltip-wrapper:hover .tooltip-content {
  opacity: 1;
  visibility: visible;
}
</style>
