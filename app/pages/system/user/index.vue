<template>
  <div class="user-page flex-1 flex min-w-0 overflow-hidden">
    <!-- 中间内容：左侧面板 + 主内容 -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0 min-w-0 overflow-hidden">
      <!-- 左侧面板：Tab切换 + 内容 -->
      <section
        class="left-panel w-full lg:w-[180px] xl:w-[200px] 2xl:w-[260px] 3xl:w-[309px] flex-shrink-0 p-3 flex flex-col">
        <!-- Tab 切换 -->
        <MTabs v-model="activeNav" :tabs="navTabs" class="mb-3 flex-shrink-0" @change="handleNavChange" />

        <!-- 教师管理时显示学校名称 -->
        <template v-if="activeNav === 'teacher'">
          <div class="bg-white rounded-lg shadow-md flex-1 flex flex-col min-h-0">
            <div 
              class="p-4 cursor-pointer rounded-lg transition-colors hover:bg-[#FFF8F0]" 
              v-for="item in schoolList" 
              :key="item.id"
            >
              <div class="text-[16px] text-[#4D4D4D] font-medium">{{ item.label }}</div>
            </div>
          </div>
        </template>

        <!-- 班级管理时显示班级树 -->
        <template v-else-if="activeNav === 'class'">
       
          <div class="bg-[#FFFFFF] shadow-sm flex-1 flex flex-col min-h-0">
            <!-- 有数据时显示树 -->
            <div v-if="treeData.length" class="flex-1 overflow-y-auto p-2">
              <MTree :data="treeData" :selected-key="selectedClass?.id" :expanded-keys="expandedKeys" label-key="name"
                :children-key="'children'" @select="handleTreeSelect" @expand="handleTreeExpand">
                <template #actions="{ node }">
                  <template v-if="node.children"></template>
                  <template v-else>
                    <div class="flex items-center gap-2">
                      <img src="~/assets/images/edit.png" :alt="$t('common.edit')" class="w-5 h-5 cursor-pointer"
                        @click.stop="handleEditClass(node)" />
                      <img src="~/assets/images/del.png" :alt="$t('common.delete')" class="w-5 h-5 cursor-pointer"
                        @click.stop="handleDeleteClass(node)" />
                    </div>
                  </template>
                </template>
              </MTree>
            </div>
            <!-- 无数据时显示空状态 -->
            <div v-else class="flex-1 flex flex-col items-center justify-center p-4">
              <p class="text-gray-400 text-sm">{{ $t('class.noClassRecord') }}</p>
            </div>
            <!-- 创建班级按钮始终固定在底部 -->
            <div class="flex-shrink-0 p-3 border-t border-gray-100 flex justify-center">
              <button
                class="w-[142px] h-[50px] flex items-center justify-center gap-2 bg-[#FF9900] text-white rounded-[20px] text-[16px]"
                @click="handleCreateNewClass(null)">
                <span class="text-xl">+</span>
                <span>{{ $t('class.createClass') }}</span>
              </button>
            </div>
          </div>
        </template>
      </section>

      <!-- 右侧主内容 -->
      <section class="main-panel flex-1 min-w-0 p-4 flex flex-col overflow-hidden">
        <!-- 教师管理 Tab -->
        <template v-if="activeNav === 'teacher'">
          <!-- 顶部区域：Tab标题 + 人数 -->
          <div class="flex items-center justify-between gap-4 mb-4 flex-shrink-0 min-w-0">
            <MTabs v-model="teacherActiveTab" :tabs="teacherTabList" class="flex-shrink-0" />
            <span class="text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{{
              $t('user.teacherCount') }}<span class="text-[#FF9900] font-medium ml-1">{{ teacherPagination.total
                }}</span> {{ $t('schoolAdmin.person') }}</span>
          </div>

          <!-- 主内容区 -->
          <div class="bg-white rounded-lg p-4 flex-1 flex flex-col min-h-0 shadow-sm">
            <!-- 搜索 + 统一密码 + 操作按钮 -->
            <div
              class="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center justify-between gap-3 mb-4 flex-shrink-0 min-w-0">
              <!-- 左侧：搜索框 + 密码提示 -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full lg:w-auto min-w-0 flex-shrink">
                <MInput v-model="teacherSearchKeyword" :placeholder="$t('user.searchAccountOrName')" clearable
                  class="w-full sm:w-[160px] lg:w-[180px] xl:w-[220px] 2xl:w-[240px] flex-shrink-0"
                  @enter="handleTeacherSearch" @clear="handleTeacherSearch">
                  <template #prefix>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </template>
                </MInput>
                <span class="hidden xl:inline-block text-sm text-[#999] whitespace-nowrap">
                  {{ $t('user.teacherDefaultPassword') }}<span class="text-[#4D4D4D]">{{ teacherPassword || 'xxxxxxxx'
                    }}</span>
                </span>
              </div>

              <!-- 右侧：按钮组 -->
              <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto flex-shrink-0">
                <button :class="[
                  'h-[36px] px-4 flex items-center justify-center gap-1 rounded-[10px] text-sm whitespace-nowrap transition-colors',
                  teacherActiveAction === 'batch' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FF9900] text-white hover:bg-[#E68A00]'
                ]" :disabled="teacherActiveAction === 'batch'" @click="handleCreateTeacher">
                  <span>+</span>
                  <span>{{ $t('user.createTeacher') }}</span>
                </button>
                <button :class="[
                  'h-[36px] px-4 flex items-center justify-center rounded-[10px] text-sm whitespace-nowrap transition-colors border',
                  teacherActiveAction === 'batch' ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-[#E5E5E5]' : 'bg-[#FAFAFA] text-[#4D4D4D] hover:bg-[#FAFAFA] border-[#E5E5E5]'
                ]" :disabled="teacherActiveAction === 'batch'" @click="handleExportTeacher">
                  {{ $t('user.export') }}
                </button>
                <button :class="[
                  'h-[36px] px-4 flex items-center justify-center rounded-[10px] text-sm whitespace-nowrap transition-colors',
                  teacherActiveAction === 'batch' ? 'bg-[#FF9900] text-white' : 'bg-[#FAFAFA] text-[#4D4D4D] hover:bg-[#FAFAFA] border-[#E5E5E5]'
                ]" @click="handleTeacherBatchAction">
                  {{ teacherActiveAction === 'batch' ? $t('user.cancelBatch') : $t('user.batchOperation') }}
                </button>
              </div>
            </div>

            <!-- 表格 -->
            <div class="flex-1 overflow-x-auto overflow-y-auto min-h-0">
              <MTable :columns="teacherTableColumns" :data="teacherList" :loading="teacherLoading"
                :selected-keys="selectedTeacherIds" :selectable="teacherActiveAction === 'batch'" row-key="userId"
                show-index class="teacher-table min-w-[700px]" @select="handleTeacherSelect" @select-all="handleTeacherSelectAll">
                <template #teacherName="{ row }">
                  <span class="truncate block max-w-[100px]">{{ row.teacherName || '-' }}</span>
                </template>
                <template #teacherAccount="{ row }">
                  <span class="truncate block max-w-[120px]">{{ row.teacherAccount || '-' }}</span>
                </template>
                <template #phone="{ row }">
                  <span>{{ row.phone || '-' }}</span>
                </template>
                <template #createTime="{ row }">
                  <span>{{ row.createTime || '-' }}</span>
                </template>
                <template #action="{ row }">
                  <div class="flex items-center justify-center gap-1 xl:gap-2 flex-nowrap">
                    <button :class="[
                      'px-1.5 xl:px-2 2xl:px-3 py-1 text-xs xl:text-sm border rounded-[7px] transition-colors whitespace-nowrap',
                      teacherActiveAction === 'batch' ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]'
                    ]" :disabled="teacherActiveAction === 'batch'" @click="handleTransferTeacherClass(row)">
                      {{ $t('user.transfer') }}
                    </button>
                    <button :class="[
                      'px-1.5 xl:px-2 2xl:px-3 py-1 text-xs xl:text-sm border rounded-[7px] transition-colors whitespace-nowrap',
                      teacherActiveAction === 'batch' ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]'
                    ]" :disabled="teacherActiveAction === 'batch'" @click="handleResetTeacherPassword(row)">
                      {{ $t('user.reset') }}
                    </button>
                    <button :class="[
                      'px-1.5 xl:px-2 2xl:px-3 py-1 text-xs xl:text-sm border rounded-[7px] transition-colors whitespace-nowrap',
                      teacherActiveAction === 'batch' ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]'
                    ]" :disabled="teacherActiveAction === 'batch'" @click="handleEditTeacher(row)">
                      {{ $t('common.edit') }}
                    </button>
                    <button :class="[
                      'px-1.5 xl:px-2 2xl:px-3 py-1 text-xs xl:text-sm border rounded-[7px] transition-colors whitespace-nowrap',
                      teacherActiveAction === 'batch' ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#FF0000] border-[#CBCBCB] hover:border-[#FF0000]'
                    ]" :disabled="teacherActiveAction === 'batch'" @click="handleDeleteTeacher(row)">
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </template>
              </MTable>
            </div>

            <!-- 批量操作栏 -->
            <div v-if="teacherActiveAction === 'batch'"
              class="flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] rounded-lg">
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" :checked="isAllTeacherSelected" class="w-4 h-4 accent-[#FF9900]"
                    @change="handleTeacherSelectAllToggle" />
                  <span class="text-sm text-[#4D4D4D]">{{ $t('class.selectAll') }}</span>
                </label>
                <span class="text-sm text-[#4D4D4D]">
                  {{ $t('class.selected') }} <span class="text-[#FF9900]">{{ selectedTeacherIds.length }}</span> {{
                    $t('class.items') }}
                </span>
              </div>
              <div class="flex items-center gap-4">
                <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchResetTeacherPassword">
                  {{ $t('user.batchResetPassword') }}
                </button>
                <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDeleteTeacher">
                  {{ $t('user.batchDelete') }}
                </button>
                <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleTeacherBatchAction">
                  {{ $t('user.cancelBatchOperation') }}
                </button>
              </div>
            </div>

            <!-- 分页 -->
            <div class="mt-4 flex-shrink-0">
              <MPagination v-model:current-page="teacherPagination.page" v-model:page-size="teacherPagination.pageSize"
                :total="teacherPagination.total" :show-size-changer="true" :show-total="true"
                @change="handleTeacherPageChange" />
            </div>
          </div>
        </template>

        <!-- 班级管理 Tab -->
        <template v-else-if="activeNav === 'class'">
          <!-- Tab 切换 - 固定 -->
          <div class="mb-4 flex-shrink-0 flex items-center justify-between gap-4 min-w-0">
            <MTabs v-model="activeTab" :tabs="tabList" class="flex-shrink-0" @change="handleTabChange" />
            <span class="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{{
              $t('user.studentCount') }}<span class="text-[#FF9900] font-medium ml-1">{{ studentList.length }}</span></span>
          </div>

          <!-- 学生管理 Tab -->
          <div v-if="activeTab === 'student'" class="bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
            <!-- 搜索 + 统一密码 + 操作按钮 - 固定 -->
            <div
              class="flex flex-col lg:flex-row lg:flex-wrap items-start lg:items-center justify-between gap-3 mb-3 flex-shrink-0 min-w-0">
              <!-- 左侧：搜索框 + 提示 -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto min-w-0 flex-shrink">
                <MInput v-model="searchKeyword" :placeholder="$t('user.searchStudentPlaceholder')" clearable
                  class="w-full sm:w-[160px] lg:w-[160px] xl:w-[180px] 2xl:w-[220px] 3xl:w-[240px] flex-shrink-0"
                  @enter="handleSearch" @clear="handleSearch">
                  <template #prefix>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </template>
                </MInput>
                <span
                  class="hidden xl:inline-block text-xs lg:text-sm text-[#CBCBCB] whitespace-nowrap">{{
                    $t('user.studentDefaultPassword') }}{{
                    studentPassword ||
                    '-' }}</span>
              </div>
              <!-- 右侧：按钮组 -->
              <div class="flex flex-wrap items-center gap-1 lg:gap-2 w-full lg:w-auto flex-shrink-0">
                <button :class="[
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch' || isCurrentClassQuickLogin
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FF9900] text-white',
                ]" :disabled="activeAction === 'batch' || isCurrentClassQuickLogin" @click="handleCreateAction()">
                  + <span class="hidden xl:inline">{{ $t('user.createStudent') }}</span><span class="xl:hidden">{{
                    $t('class.create') }}</span>
                </button>
                <div class="relative group">
                  <button :class="[
                    'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                    activeAction === 'batch' || isOtherClassQuickLogin
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isCurrentClassQuickLogin
                        ? 'bg-[#FF9900] text-white'
                        : 'bg-[#FFF1DD] text-[#4D4D4D]',
                  ]" :disabled="activeAction === 'batch' || isOtherClassQuickLogin" @click="handleQuickLogin">
                    <span class="hidden xl:inline">{{ isCurrentClassQuickLogin ? $t('user.disableQuickLogin') :
                      $t('user.quickLogin') }}</span>
                    <span class="xl:hidden">{{ isCurrentClassQuickLogin ? $t('user.disableQuickLogin') :
                      $t('user.quickLogin')
                      }}</span>
                  </button>
                  <!-- 自定义tooltip -->
                  <div v-if="isOtherClassQuickLogin"
                    class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {{ $t('class.quickLoginTip') }}
                    <div
                      class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800">
                    </div>
                  </div>
                </div>
                <button :class="[
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]" :disabled="activeAction === 'batch'" @click="handleExport">
                  <span class="hidden xl:inline">{{ $t('user.exportStudent') }}</span>
                  <span class="xl:hidden">{{ $t('user.export') }}</span>
                </button>
                <button :class="[
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch'
                    ? 'bg-[#FF9900] text-white'
                    : isCurrentClassQuickLogin
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]" :disabled="isCurrentClassQuickLogin && activeAction !== 'batch'" @click="handleBatchAction">
                  {{ activeAction === "batch" ? $t('user.cancelBatch') : $t('user.batch') }}
                </button>
              </div>
            </div>

            <!-- 快捷登录信息栏 -->
            <div v-if="isCurrentClassQuickLogin"
              class="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 mb-3 bg-[#FF9900] rounded-lg text-white text-xs sm:text-sm">
              <span class="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">NEW</span>

              <span class="border-l border-white/30 pl-2 sm:pl-4">{{ $t('user.classCode') }}{{ quickLoginData.classCode
                || '-'
                }}</span>
              <span class="hidden sm:inline">{{ $t('user.unifiedPassword') }}{{ quickLoginData.classCodePwd || '-'
                }}</span>
              <span class="sm:hidden">{{ $t('user.unifiedPassword') }}{{ quickLoginData.classCodePwd || '-' }}</span>
              <button
                class="px-1.5 sm:px-2 py-0.5 sm:py-1 border border-white/50 rounded text-[10px] sm:text-xs hover:bg-white/10"
                @click="copyToClipboard(quickLoginData.classCodePwd)">
                {{ $t('common.copy') }}
              </button>
              <span class="hidden md:flex items-center gap-1 text-white/80 text-xs ml-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ({{ $t('user.validFor2Hours') }}{{ quickLoginData.expirationDate || '' }}{{ $t('user.expire') }})
              </span>
              <button class="p-1 hover:bg-white/10 rounded ml-auto md:ml-0" @click="handleRefreshQuickLogin">
                <svg class="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <!-- 表格 - 可滚动区域 -->
            <div class="flex-1 overflow-auto min-h-0 min-w-0">
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
                  <div class="flex items-center justify-center gap-1 lg:gap-2 whitespace-nowrap">
                    <button :class="[
                      'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900]'
                    ]" :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                      @click="handleResetPassword(row)">
                      {{ $t('user.reset') }}
                    </button>
                    <button :class="[
                      'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900]'
                    ]" :disabled="activeAction === 'batch' || isCurrentClassQuickLogin" @click="handleTransfer(row)">
                      {{ $t('user.transferStudent') }}
                    </button>
                    <button :class="[
                      'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                      activeAction === 'batch' || isCurrentClassQuickLogin
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#FF0000] border-[#CBCBCB] hover:border-[#FF0000]'
                    ]" :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                      @click="handleDeleteStudent(row)">
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </template>
              </MTable>
            </div>

            <!-- 批量操作栏 - 表格底部 -->
            <div v-if="activeAction === 'batch'"
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-3 p-2 sm:p-3 bg-[#FFF2DD] border-t border-gray-200 rounded-b-lg">
              <div class="flex items-center gap-3 sm:gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" :checked="isAllSelected" class="w-4 h-4 accent-[#FF9900]"
                    @change="handleSelectAllToggle" />
                  <span class="text-xs sm:text-sm text-[#4D4D4D]">{{ $t('class.selectAll') }}</span>
                </label>
                <span class="text-xs sm:text-sm text-[#4D4D4D]">{{ $t('class.selected') }}
                  <span class="text-[#FF9900]">{{
                    selectedStudentIds.length
                  }}</span>
                  {{ $t('class.items') }}</span>
              </div>
              <div class="flex flex-wrap items-center gap-2 sm:gap-4">
                <button class="text-xs sm:text-sm text-[#4D4D4D] hover:text-[#FF9900]"
                  @click="handleBatchResetPassword">
                  {{ $t('class.batchResetPassword') }}
                </button>
                <button class="text-xs sm:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchTransfer">
                  {{ $t('class.batchTransfer') }}
                </button>
                <button class="text-xs sm:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDelete">
                  {{ $t('class.batchDelete') }}
                </button>
                <button class="text-xs sm:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchAction">
                  {{ $t('common.cancel') }}
                </button>
              </div>
            </div>
          </div>

          <!-- 小组管理 Tab -->
          <div v-else-if="activeTab === 'group'" class="bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0">
            <!-- 搜索 + 操作按钮 -->
            <div
              class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 mb-3 flex-shrink-0">
              <!-- 左侧：搜索框 -->
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <MInput v-model="groupSearchKeyword" :placeholder="$t('user.searchGroupPlaceholder')" clearable
                  class="w-full sm:w-[140px] lg:w-[150px] xl:w-[180px] 3xl:w-[220px] 2xl:w-[240px]"
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
              <div class="flex flex-wrap items-center gap-1 lg:gap-2 w-full sm:w-auto">
                <button :class="[
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  groupActiveAction === 'batch'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FF9900] text-white',
                ]" :disabled="groupActiveAction === 'batch'" @click="handleCreateGroup">
                  + <span class="hidden xl:inline">{{ $t('user.createGroup') }}</span><span class="xl:hidden">{{
                    $t('class.create') }}</span>
                </button>
                <button :class="[
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  groupActiveAction === 'batch'
                    ? 'bg-[#FF9900] text-white'
                    : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]" @click="handleGroupBatchAction">
                  {{ groupActiveAction === 'batch' ? $t('user.cancelBatch') : $t('user.batch') }}
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
                  <div class="flex items-center justify-center gap-1 lg:gap-2 whitespace-nowrap">
                    <button :class="[
                      'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                      groupActiveAction === 'batch'
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900]'
                    ]" :disabled="groupActiveAction === 'batch'" @click="handleEditGroup(row)">
                      {{ $t('common.edit') }}
                    </button>
                    <button :class="[
                      'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                      groupActiveAction === 'batch'
                        ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'text-[#FF0000] border-[#CBCBCB] hover:border-[#FF0000]'
                    ]" :disabled="groupActiveAction === 'batch'" @click="handleDeleteGroup(row)">
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </template>
              </MTable>
            </div>

            <!-- 批量操作栏 -->
            <div v-if="groupActiveAction === 'batch'"
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-3 p-2 lg:p-3 bg-[#FFF2DD] border-t border-gray-200 rounded-b-lg">
              <div class="flex items-center gap-2 lg:gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" :checked="isAllGroupSelected" class="w-4 h-4 accent-[#FF9900]"
                    @change="handleGroupSelectAllToggle" />
                  <span class="text-xs lg:text-sm text-[#4D4D4D]">{{ $t('class.selectAll') }}</span>
                </label>
                <span class="text-xs lg:text-sm text-[#4D4D4D]">
                  {{ $t('class.selected') }} <span class="text-[#FF9900]">{{ selectedGroupIds.length }}</span> {{ $t('class.items') }}
                </span>
              </div>
              <div class="flex items-center gap-2 lg:gap-4">
                <button class="text-xs lg:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDeleteGroup">
                  {{ $t('common.delete') }}
                </button>
                <button class="text-xs lg:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleGroupBatchAction">
                  {{ $t('common.cancel') }}
                </button>
              </div>
            </div>
          </div>
        </template>
      </section>
    </div>

    <!-- ==================== 教师管理弹窗 ==================== -->
    <!-- 添加/编辑教师弹窗 -->
    <MModal v-model="showTeacherModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative m-3 rounded-lg bg-white ">
        <!-- 关闭按钮 -->
        <button class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[#999] hover:text-[#666] transition-colors" @click="showTeacherModal = false">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-[18px] font-medium text-[#333] mb-6">
          {{ isEditTeacher ? $t('user.editTeacher') : $t('user.addTeacher') }}
        </h3>

        <!-- Tab 切换（编辑时不显示） -->
        <div v-if="!isEditTeacher" class="flex gap-3 mb-6">
          <button :class="[
            'flex-1 h-[50px] text-[15px] font-medium rounded-[10px] transition-all',
            addTeacherTab === 'import' 
              ? 'bg-[#FF9900] text-white' 
              : 'bg-[#FFF8F0] text-[#333] hover:bg-[#FFEDCC]'
          ]" @click="addTeacherTab = 'import'">
            {{ $t('user.batchImportAdd') }}
          </button>
          <button :class="[
            'flex-1 h-[50px] text-[15px] font-medium rounded-[10px] transition-all',
            addTeacherTab === 'manual' 
              ? 'bg-[#FF9900] text-white' 
              : 'bg-[#FFF8F0] text-[#333] hover:bg-[#FFEDCC]'
          ]" @click="addTeacherTab = 'manual'">
            {{ $t('user.manualAdd') }}
          </button>
        </div>

        <!-- 批量导入内容 -->
        <div v-if="!isEditTeacher && addTeacherTab === 'import'">
          <div class="flex gap-3 mb-6">
            <button
              class="flex-1 h-[50px] bg-[#F5F5F5] border border-[#E5E5E5] rounded-[8px] flex items-center justify-center text-[#333] hover:bg-[#EFEFEF] transition-all"
              @click="triggerTeacherFileInput">
              <span class="text-[15px]">{{ $t('user.importTeacherInfo') }}</span>
            </button>
            <button
              class="flex-1 h-[50px] bg-[#F5F5F5] border border-[#E5E5E5] rounded-[8px] flex items-center justify-center text-[#333] hover:bg-[#EFEFEF] transition-all"
              @click="handleDownloadTeacherTemplate">
              <span class="text-[15px]">{{ $t('user.downloadTemplate') }}</span>
            </button>
          </div>
          <input ref="teacherFileInputRef" type="file" accept=".xlsx,.xls" class="hidden"
            @change="handleTeacherFileChange" />
          <p class="text-[13px] text-[#999] leading-relaxed">{{ $t('user.batchImportTeacherTip') }}</p>
          <p class="text-[13px] text-[#999] mt-1">{{ teacherPassword || 'XXXXXXX' }}</p>
        </div>

        <!-- 手动添加内容 -->
        <div v-if="isEditTeacher || addTeacherTab === 'manual'">
          <div class="space-y-4">
            <input 
              v-model="teacherForm.teacherName" 
              type="text"
              :placeholder="$t('user.inputTeacherName')"
              class="w-full h-[50px] px-4 border border-[#E5E5E5] rounded-full text-[15px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF9900] transition-colors"
            />
            <div class="flex items-center h-[50px] border border-[#E5E5E5] rounded-full bg-white">
              <div class="px-4 border-r border-[#E5E5E5] h-full flex items-center">
                <CountryCodeSelector v-model="teacherForm.countryCode" />
              </div>
              <input 
                v-model="teacherForm.phone" 
                type="tel" 
                :placeholder="$t('user.inputTeacherPhone')"
                class="flex-1 h-full px-3 text-[15px] text-[#333] placeholder-[#999] outline-none bg-transparent rounded-r-full"
              />
            </div>
          </div>
          <p class="text-[13px] text-[#999] mt-5 leading-relaxed">{{ $t('user.manualAddTeacherTip') }}</p>
          <p class="text-[13px] text-[#999] mt-1">{{ teacherPassword || 'XXXXXXX' }}</p>
        </div>

        <!-- 底部按钮 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[136px] h-[50px] bg-white border border-[#E5E5E5] rounded-[8px] text-[#333] hover:border-[#999] text-[15px] transition-all"
            @click="showTeacherModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[50px] bg-[#FF9900] text-white rounded-[8px] hover:bg-[#E68A00] text-[15px] transition-all"
            @click="handleConfirmTeacher">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 删除教师确认弹窗 -->
    <MModal v-model="showDeleteTeacherModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showDeleteTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <p class="text-[15px] text-[#4D4D4D] leading-relaxed" :class="isBatchDeleteTeacher ? 'mb-5 text-left' : 'mb-6 text-center'">{{ deleteTeacherConfirmText }}</p>
        <input 
          v-if="isBatchDeleteTeacher"
          v-model="deleteTeacherPassword"
          type="password"
          :placeholder="t('user.pleaseInputTeacherPassword')"
          class="w-full h-[50px] px-4 border border-[#E5E5E5] rounded-[10px] text-[15px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF9900] transition-colors mb-6"
        />
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteTeacherModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteTeacher">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 重置教师密码确认弹窗 -->
    <MModal v-model="showResetTeacherModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showResetTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <p class="text-[15px] text-[#4D4D4D] leading-relaxed text-center" :class="isBatchResetTeacher ? 'mb-5 text-left' : 'mb-6'">{{ resetTeacherConfirmText }}</p>
        <input 
          v-if="isBatchResetTeacher"
          v-model="resetTeacherPassword"
          type="password"
          :placeholder="t('user.pleaseInputTeacherPassword')"
          class="w-full h-[50px] px-4 border border-[#E5E5E5] rounded-[10px] text-[15px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF9900] transition-colors mb-6"
        />
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showResetTeacherModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmResetTeacher">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 导入教师弹窗 -->
    <MModal v-model="showImportTeacherModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[300px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showImportTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ $t('user.importTeacherInfo') }}</h3>
        <div class="flex justify-center gap-3 mb-6">
          <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500 hover:bg-gray-300"
            @click="handleSelectTeacherFile">{{ $t('user.selectFileImport') }}</button>
          <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500 hover:bg-gray-300"
            @click="handleDownloadTeacherTemplate">{{ $t('user.downloadTemplate') }}</button>
        </div>
        <p v-if="importTeacherFileName" class="text-sm text-[#4CB9CF] text-center mb-4">{{ $t('user.selectedFile', { name: importTeacherFileName }) }}
        </p>
        <p class="text-sm text-gray-400 flex-1">{{ $t('user.batchImportTeacherTip') }}{{ teacherPassword }}</p>
        <div class="flex items-center justify-center gap-4 mt-auto pt-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showImportTeacherModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            :disabled="!importTeacherFile" :class="{ 'opacity-50 cursor-not-allowed': !importTeacherFile }"
            @click="handleConfirmImportTeacher">{{ $t('user.confirmImport') }}</button>
        </div>
        <input ref="teacherFileInputRef" type="file" accept=".xlsx,.xls" class="hidden"
          @change="handleTeacherFileChange" />
      </div>
    </MModal>

    <!-- 班级转让弹窗 -->
    <MModal v-model="showTransferTeacherModal" custom-width="500px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showTransferTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ $t('user.classTransfer') }}</h3>

        <!-- 搜索框 -->
        <div class="mb-4">
          <MInput v-model="transferTeacherSearch" :placeholder="t('user.pleaseInputTransferTeacherName')" clearable
            @enter="handleTransferTeacherSearchChange" @clear="handleTransferTeacherSearchChange">
            <template #suffix>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MInput>
        </div>

        <!-- 教师列表表格 -->
        <div class="border border-gray-200 rounded-lg mb-4 max-h-[200px] overflow-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left text-[#4D4D4D] font-medium">{{ $t('common.serialNumber') }}</th>
                <th class="px-3 py-2 text-left text-[#4D4D4D] font-medium">{{ $t('user.name') }}</th>
                <th class="px-3 py-2 text-left text-[#4D4D4D] font-medium">{{ $t('user.account') }}</th>
                <th class="px-3 py-2 text-center text-[#4D4D4D] font-medium">{{ $t('user.select') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(teacher, index) in filteredTransferTeachers" :key="teacher.userId"
                class="border-t border-gray-100">
                <td class="px-3 py-2 text-[#4D4D4D]">{{ index + 1 }}</td>
                <td class="px-3 py-2 text-[#4D4D4D]">{{ teacher.nickName }}</td>
                <td class="px-3 py-2 text-[#4D4D4D]">{{ teacher.userName }}</td>
                <td class="px-3 py-2 text-center">
                  <label class="custom-checkbox" @click="handleSelectTransferTeacher(teacher.userId)">
                    <span 
                      class="checkbox-box"
                      :class="{ checked: transferTeacherForm.targetTeacherId === teacher.userId }"
                    >
                      <svg v-if="transferTeacherForm.targetTeacherId === teacher.userId" class="checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </label>
                </td>
              </tr>
              <tr v-if="filteredTransferTeachers.length === 0">
                <td colspan="4" class="px-3 py-4 text-center text-gray-400">{{ $t('schoolAdmin.noTransferableTeacher') }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 选择班级 -->
        <div class="mb-4">
          <p class="text-sm text-[#4D4D4D] mb-3">{{ $t('user.selectTransferClass') }}</p>
          <div class="space-y-3">
            <MSelect v-model="transferClassForm.gradeId" :options="transferGradeOptions" :placeholder="t('class.grade')"
              @change="handleTransferGradeChange" />
            <MSelect v-model="transferClassForm.classId" :options="transferClassOptions" :placeholder="t('class.className')" value-key="id"
              label-key="name" />
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showTransferTeacherModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmTransferTeacher">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- ==================== 班级管理弹窗 ==================== -->
    <!-- 添加学生弹窗 -->
    <MModal v-model="showCreateModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[428px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showCreateModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ $t('user.addStudent') }}</h3>
        <div class="flex justify-center gap-3 mb-6">
          <button
            :class="['w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors', addStudentMode === 'batch' ? 'bg-[#FF9900] text-white' : 'border border-gray-300 text-[#FF9900]']"
            @click="addStudentMode = 'batch'">{{ $t('user.batchImportAdd') }}</button>
          <button
            :class="['w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors', addStudentMode === 'manual' ? 'bg-[#FF9900] text-white' : 'border border-gray-300 text-[#FF9900]']"
            @click="addStudentMode = 'manual'">{{ $t('user.manualAdd') }}</button>
        </div>
        <template v-if="addStudentMode === 'batch'">
          <div class="flex justify-center gap-3 mb-6">
            <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500"
              @click="handleImportStudents">{{ $t('user.importStudentInfo') }}</button>
            <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500"
              @click="handleDownloadTemplate">{{ $t('user.downloadTemplate') }}</button>
          </div>
          <p class="text-sm text-gray-400 flex-1">{{ $t('user.batchImportStudentTip') }}{{ studentPassword }}</p>
        </template>
        <template v-else>
          <div class="flex flex-col items-center gap-3 flex-1">
            <MInput v-model="createForm.name" :placeholder="t('class.studentName')" class="w-[275px]" />
            <p class="text-sm text-gray-400">{{ $t('user.studentDefaultPasswordIs') }}{{ studentPassword }}</p>
          </div>
        </template>
        <div class="flex items-center justify-center gap-4 mt-auto pt-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showCreateModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleCreateStudent">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 创建班级弹窗 -->
    <MModal v-model="showCreateClassModal" custom-width="380px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showCreateClassModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ isEditClass ? t('class.editClass') : t('class.createClass') }}</h3>
        <div class="space-y-4 px-2">
          <MSelect v-model="createClassForm.gradeId" :options="gradeOptions" :placeholder="t('class.grade')" />
          <MInput v-model="createClassForm.className" :placeholder="t('class.className')" />
          <MInput v-model="createClassForm.teacherName" :placeholder="t('class.teacher')" disabled />
        </div>
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showCreateClassModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmCreateClass">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 删除班级确认弹窗 -->
    <MModal v-model="showDeleteClassModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showDeleteClassModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ $t('user.confirmDeleteClass') }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteClassModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteClass">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 重置密码确认弹窗 -->
    <MModal v-model="showResetPasswordModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showResetPasswordModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ $t('class.confirmResetPassword', { name: resettingStudent?.studentName }) }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showResetPasswordModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmResetPassword">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 移班弹窗 -->
    <MModal v-model="showTransferModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showTransferModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ $t('user.transferStudent') }}</h3>
        <div class="space-y-4 px-2">
          <MSelect v-model="transferForm.gradeId" :options="gradeOptions" :placeholder="t('class.selectGrade')"
            @update:model-value="handleTransferGradeChange" />
          <MSelect v-model="transferForm.classId" :options="transferClassOptions" :placeholder="t('class.selectClass')"
            :disabled="!transferForm.gradeId" @change="handleTransferClassChange" />
        </div>
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showTransferModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmTransfer">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>


    <!-- 删除学生确认弹窗 -->
    <MModal v-model="showDeleteStudentModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showDeleteStudentModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ $t('class.confirmDeleteStudent', { name: deletingStudent?.name }) }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteStudentModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteStudent">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 批量重置密码确认弹窗 -->
    <MModal v-model="showBatchResetPasswordModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showBatchResetPasswordModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ $t('class.confirmBatchResetPassword', { names: selectedStudentNames }) }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchResetPasswordModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchResetPassword">{{ $t('common.confirm') }}</button>
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
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ $t('class.confirmBatchDelete', { count: selectedStudentIds.length }) }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchDeleteModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchDelete">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 批量移班弹窗 -->
    <MModal v-model="showBatchTransferModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showBatchTransferModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('class.batchTransfer') }}</h3>
        <p class="text-sm text-gray-500 text-center mb-4">{{ $t('user.batchTransferTip', { count: selectedStudentIds.length }) }}</p>
        <div class="space-y-4 px-2">
          <MSelect v-model="batchTransferForm.gradeId" :options="gradeOptions" :placeholder="t('class.selectGrade')"
            @update:model-value="handleBatchTransferGradeChange" />
          <MSelect v-model="batchTransferForm.classId" :options="batchTransferClassOptions" :placeholder="t('class.selectClass')"
            :disabled="!batchTransferForm.gradeId" />
        </div>
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showBatchTransferModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmBatchTransfer">{{ $t('common.confirm') }}</button>
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
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex flex-col items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D] mb-2">{{ $t('class.passwordResetSuccess') }}</p>
          <p class="text-[18px] text-[#FF9900] font-medium">{{ $t('class.newPassword') }}{{ newPassword }}</p>
        </div>
        <div class="flex items-center justify-center">
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="showNewPasswordModal = false">{{ $t('common.confirm') }}</button>
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
        <h3 class="text-center text-lg font-medium text-[#E5E5E5D] mb-6">{{ $t('class.enableQuickLogin') }}</h3>
        <p class="text-center text-[#4D4D4D] mb-6">{{ $t('class.quickLoginDesc') }}</p>
        <div class="flex items-center justify-center gap-2 text-[#999] text-sm mb-8">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ $t('class.quickLoginWarning') }}</span>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showQuickLoginModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmQuickLogin">{{ $t('common.create') }}</button>
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
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ isEditGroupMode ? t('class.editGroup') : t('class.createGroup') }}</h3>
        <div class="mb-6">
          <p class="text-[#4D4D4D] font-medium mb-4">{{ $t('user.stepOneGroupInfo') }}</p>
          <div class="space-y-4 pl-4">
            <div class="flex items-center gap-2 whitespace-nowrap">
              <span class="text-red-500">*</span>
              <span class="text-[#4D4D4D]">{{ $t('user.groupName') }}：</span>
              <MInput v-model="groupForm.name" :placeholder="t('class.pleaseInputGroupName')" class="w-[280px]" />
            </div>
            <div class="flex items-center gap-2 whitespace-nowrap">
              <span class="text-transparent">*</span>
              <span class="text-[#4D4D4D]">{{ $t('user.groupDesc') }}：</span>
              <MInput v-model="groupForm.remarks" :placeholder="t('class.pleaseInputGroupName')" class="w-[280px]" />
            </div>
          </div>
        </div>
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <p class="text-[#4D4D4D] font-medium whitespace-nowrap">{{ $t('user.stepTwoAddMembers') }}<span
                class="text-[#FF9900] text-sm font-normal">{{ $t('user.rememberSelectLeader') }}</span></p>
            <button class="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm hover:bg-[#E68A00] whitespace-nowrap"
              @click="handleAddGroupMember">+ {{ $t('user.addMember') }}</button>
          </div>
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <table class="w-full">
              <thead class="bg-[#FFF1DD]">
                <tr>
                  <th class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D]">{{ $t('common.serialNumber') }}
                  </th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D]">{{ $t('user.account') }}</th>
                  <th class="px-3 py-2 text-left text-sm font-medium text-[#4D4D4D]">{{ $t('user.name') }}</th>
                  <th class="px-3 py-2 text-center text-sm font-medium text-[#4D4D4D]">{{ $t('user.isLeader') }}</th>
                  <th class="px-3 py-2 text-center text-sm font-medium text-[#4D4D4D]">{{ $t('common.operation') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in groupForm.members" :key="member.id" class="border-t border-gray-100">
                  <td class="px-3 py-2 text-sm text-[#4D4D4D]">{{ index + 1 }}</td>
                  <td class="px-3 py-2 text-sm text-[#4D4D4D]">{{ member.studentNumber }}</td>
                  <td class="px-3 py-2 text-sm text-[#4D4D4D]">{{ member.studentName }}</td>
                  <td class="px-3 py-2 text-center">
                    <input type="radio" :name="'group-leader'" :checked="groupForm.leaderId === member.id"
                      class="w-4 h-4 accent-[#FF9900]" @change="groupForm.leaderId = member.id" />
                  </td>
                  <td class="px-3 py-2 text-center">
                    <button class="text-red-500 text-sm hover:text-red-600"
                      @click="handleRemoveGroupMember(index)">{{ $t('common.delete') }}</button>
                  </td>
                </tr>
                <tr v-if="!groupForm.members.length">
                  <td colspan="5" class="px-4 py-8 text-center">
                    <div class="flex flex-col items-center gap-2 text-gray-400">
                      <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span class="text-sm">{{ $t('common.noData') }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showGroupModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmGroup">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 添加成员弹窗 -->
    <MModal v-model="showAddMemberModal" custom-width="620px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showAddMemberModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ $t('user.selectMembers') }}</h3>
        <div class="mb-2">
          <MInput v-model="memberSearchKeyword" :placeholder="t('class.searchStudentPlaceholder')" clearable class="w-full"
            @enter="handleMemberSearch" @clear="handleMemberSearch">
            <template #prefix>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MInput>
        </div>

        <div class="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
          <table class="w-full">
            <thead class="bg-[#FFF1DD] sticky top-0">
              <tr>
                <th class="w-10 px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">
                  <input type="checkbox" :checked="isAllMemberSelected" class="w-4 h-4 accent-[#FF9900]"
                    @change="toggleAllMemberSelection" />
                </th>
                <th class="w-16 px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">{{ $t('common.serialNumber') }}
                </th>
                <th class="px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">{{ $t('user.account') }}</th>
                <th class="px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">{{ $t('user.name') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in filteredAvailableStudents" :key="student.id"
                class="border-b border-gray-100 last:border-b-0 hover:bg-[#FFF1DD] cursor-pointer"
                @click="toggleStudentSelection(student)">
                <td class="px-2 py-3">
                  <input type="checkbox" :checked="selectedMemberIds.includes(student.id)"
                    class="w-4 h-4 accent-[#FF9900]" @click.stop @change="toggleStudentSelection(student)" />
                </td>
                <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ index + 1 }}</td>
                <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ student.studentNumber || '-' }}</td>
                <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ student.studentName || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!filteredAvailableStudents.length" class="px-4 py-8 text-center text-gray-400">{{ $t('user.noStudentsToAdd') }}</div>
        </div>
        <div v-if="selectedMemberIds.length" class="mt-3 p-3 bg-[#F5F5F5] rounded-lg">
          <div class="flex flex-wrap gap-2">
            <div v-for="id in selectedMemberIds" :key="id"
              class="group inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-[#4D4D4D] hover:border-[#FF9900] hover:bg-[#FFF1DD] cursor-pointer transition-colors">
              <span>{{ getStudentNameById(id) }}</span>
              <button
                class="w-4 h-4 items-center justify-center text-gray-400 hover:text-[#FF0000] transition-colors hidden group-hover:flex"
                @click="removeSelectedMember(id)">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showAddMemberModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmAddMembers">{{ $t('common.confirm') }}</button>
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
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ isBatchDeleteGroup ? $t('class.confirmBatchDeleteGroup', { count: selectedGroupIds.length }) :
            $t('class.confirmDeleteGroup', { name: deletingGroup?.teamName }) }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showDeleteGroupModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmDeleteGroup">{{ $t('common.confirm') }}</button>
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
import { useSchoolUser, type Teacher } from '~/composables/api/useSchoolUser'

definePageMeta({
  layout: "sidebar",
});

const { t } = useI18n();
const route = useRoute();
const { user } = useAuth();
const schoolUserApi = useSchoolUser()

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

// ==================== 左侧面板 Tab 导航 ====================
const activeNav = ref('teacher')
const navTabs = computed(() => [
  { label: t('user.teacherManagement'), value: 'teacher' },
  { label: t('user.classManagement'), value: 'class' }
])

// Tab 切换处理 - 页面内切换，不跳转
const handleNavChange = async (value: string) => {
  activeNav.value = value
  if (value === 'class') {
    // 参考 class/index.vue，使用 Promise.all 并行加载所有数据
    await Promise.all([
      loadGradeOptions(),
      loadClassList(),
      loadQuickLoginStatus(),
      loadStudentPassword(),
    ])
  }
}

// ==================== 教师管理相关 ====================
const teacherTabList = computed(() => [{ label: t('user.teacherManagement'), value: 'teacher' }])
const teacherActiveTab = ref('teacher')
const teacherSearchKeyword = ref('')
const teacherPassword = ref('')
type TeacherActionType = 'normal' | 'batch'
const teacherActiveAction = ref<TeacherActionType>('normal')
const teacherLoading = ref(false)
const teacherList = ref<Teacher[]>([])
const schoolList = ref<any>([])
const selectedTeacherIds = ref<string[]>([])
const teacherPagination = reactive({ page: 1, pageSize: 10, total: 0 })


const teacherTableColumns = computed(() => [
  { key: 'nickName', title: t('user.teacherName'), minWidth: '70px' },
  { key: 'userName', title: t('user.teacherAccount'), minWidth: '90px' },
  { key: 'phonenumber', title: t('user.phone'), minWidth: '90px' },
  { key: 'createTime', title: t('class.createTime'), minWidth: '100px' },
  { key: 'action', title: t('common.operation'), minWidth: '180px', align: 'center' as const }
])

// 教师弹窗
const showTeacherModal = ref(false)
const showDeleteTeacherModal = ref(false)
const showResetTeacherModal = ref(false)
const showImportTeacherModal = ref(false)
const showTransferTeacherModal = ref(false)

const isEditTeacher = ref(false)
const addTeacherTab = ref<'import' | 'manual'>('import')
const teacherForm = reactive({ id: '', orgId: '', teacherName: '', phone: '', countryCode: '86' })
const deleteTeacherConfirmText = ref('')
const deleteTeacherIds = ref<string[]>([])
const deleteTeacherPassword = ref('')
const isBatchDeleteTeacher = ref(false)
const resetTeacherConfirmText = ref('')
const resetTeacherIds = ref<string[]>([])
const resetTeacherPassword = ref('')
const isBatchResetTeacher = ref(false)
const teacherFileInputRef = ref<HTMLInputElement>()
const importTeacherFile = ref<File | null>(null)
const importTeacherFileName = ref('')
const transferTeacherForm = reactive({ teacherId: '', teacherName: '', targetTeacherId: '' as string | null })
const transferTeacherOptions = ref<Teacher[]>([])
const transferTeacherSearch = ref('')
const transferClassForm = reactive({ gradeId: '', classId: '' })
const transferClassOptions = ref<any[]>([])
const transferGradeOptions = ref<any[]>([])

const filteredTransferTeachers = computed(() => {
  // 过滤掉当前正在转让的教师（不能转让给自己）
  let list = transferTeacherOptions.value.filter(t => t.userId !== transferTeacherForm.teacherId)
  
  // 搜索过滤
  if (transferTeacherSearch.value) {
    const keyword = transferTeacherSearch.value.toLowerCase()
    list = list.filter(t =>
      t.nickName?.toLowerCase().includes(keyword) || t.userName?.toLowerCase().includes(keyword)
    )
  }
  return list
})

const handleTransferTeacherSearchChange = () => {
  // 搜索时自动过滤，computed 已处理
}

// 选择目标教师
const handleSelectTransferTeacher = async (userId: string) => {
  transferTeacherForm.targetTeacherId = userId
  
  // 选择目标老师后，获取目标老师的年级列表
  transferClassForm.gradeId = ''
  transferClassForm.classId = ''
  transferClassOptions.value = []
  
  try {
    const schoolId = schoolList.value?.[0]?.id || ''
    const gradeList = await schoolUserApi.transferGrade(userId, schoolId)
    transferGradeOptions.value = (gradeList || []).map((g: any) => ({
      label: g.gradeName,
      value: g.grade
    }))
  } catch (error) {
    transferGradeOptions.value = []
  }
}

const handleTransferGradeChange = async (gradeId: string) => {
  if (!gradeId) return
  if (!transferTeacherForm.targetTeacherId) return
  
  transferClassForm.classId = ''
  transferClassOptions.value = []
  
  // 根据目标老师和年级获取班级列表
  const schoolId = schoolList.value?.[0]?.id || ''
  try {
    const classList = await schoolUserApi.transferClassList({
      teacherId: transferTeacherForm.targetTeacherId,
      grade: gradeId,
      schoolId
    })
    transferClassOptions.value = (classList || []).map((c: any) => ({
      id: c.classId || c.id,
      name: c.className || c.name
    }))
  } catch (error) {
    transferClassOptions.value = []
  }
}

const isAllTeacherSelected = computed(() => teacherList.value.length > 0 && selectedTeacherIds.value.length === teacherList.value.length)

// 教师管理方法
const fetchTeacherList = async () => {
  teacherLoading.value = true
  try {
    const result = await schoolUserApi.getTeacherList({
      userNick: teacherSearchKeyword.value?.trim() || undefined,
      pageNum: teacherPagination.page,
      pageSize: teacherPagination.pageSize
    })
    teacherList.value = result.list
    teacherPagination.total = result.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取教师列表失败')
  } finally {
    teacherLoading.value = false
  }
}

const handleTeacherSearch = () => {
  teacherPagination.page = 1
  fetchTeacherList()
}

const fetchTeacherPassword = async () => {
  try {
    const pwd = await schoolUserApi.getTeacherPassword()
    teacherPassword.value = pwd || 'xxxxxxxx'
  } catch (error) {
    console.error('获取教师密码失败', error)
  }
}

const fetchSchoolInfo = async () => {
  try {
    const info = await schoolUserApi.getOrgTree()
    schoolList.value = info || []
  } catch (error) {
    console.error('获取学校列表失败', error)
  }
}



const handleTeacherPageChange = () => { fetchTeacherList() }
const handleTeacherBatchAction = () => {
  if (teacherActiveAction.value === 'batch') { teacherActiveAction.value = 'normal'; selectedTeacherIds.value = [] }
  else { teacherActiveAction.value = 'batch' }
}
const handleTeacherSelect = (keys: (string | number)[]) => { selectedTeacherIds.value = keys.map(k => String(k)) }
const handleTeacherSelectAll = (selected: boolean) => {
  if (selected) { selectedTeacherIds.value = teacherList.value.map(t => t.userId) }
  else { selectedTeacherIds.value = [] }
}
const handleTeacherSelectAllToggle = (e: Event) => { handleTeacherSelectAll((e.target as HTMLInputElement).checked) }

const handleCreateTeacher = () => {
  isEditTeacher.value = false
  addTeacherTab.value = 'import'
  teacherForm.id = ''
  teacherForm.teacherName = ''
  teacherForm.phone = ''
  importTeacherFile.value = null
  importTeacherFileName.value = ''
  showTeacherModal.value = true
}
const handleEditTeacher = (row: Teacher) => {
  console.log(row)
  isEditTeacher.value = true
  teacherForm.id = row.userId
  teacherForm.teacherName = row.nickName
  teacherForm.phone = row.phonenumber
  showTeacherModal.value = true
}

const triggerTeacherFileInput = () => {
  teacherFileInputRef.value?.click()
}
// const handleTeacherFileChange = (e: Event) => {
//   const file = (e.target as HTMLInputElement).files?.[0]
//   if (file) {
//     importTeacherFile.value = file
//     importTeacherFileName.value = file.name
//   }
// }
// const handleDownloadTeacherTemplate = async () => {
//   try {
//     await schoolUserApi.downloadTeacherTemplate()
//     ElMessage.success('下载成功')
//   } catch (error: any) {
//     ElMessage.error(error.message || '下载失败')
//   }
// }

const handleConfirmTeacher = async () => {
  // 编辑模式或手动添加模式
  if (isEditTeacher.value || addTeacherTab.value === 'manual') {
    if (!teacherForm.teacherName.trim()) { ElMessage.warning(t('user.pleaseInputTeacherName')); return }
    if (!teacherForm.phone.trim()) { ElMessage.warning(t('user.pleaseInputPhone')); return }
    try {
      if (isEditTeacher.value) {
        await schoolUserApi.updateTeacher({ userId: teacherForm.id, nickName: teacherForm.teacherName, phonenumber: teacherForm.phone })
        ElMessage.success(t('common.editSuccess'))
      } else {
        // 获取第一个组织的 id 作为 orgId
        const orgId = schoolList.value?.[0]?.id || ''
        await schoolUserApi.createTeacher({ orgId, nickName: teacherForm.teacherName, phonenumber: teacherForm.phone })
        ElMessage.success(t('common.createSuccess'))
      }
      showTeacherModal.value = false
      fetchTeacherList()
    } catch (error: any) { ElMessage.error(error.message || t('common.failed')) }
  } else {
    // 批量导入模式
    if (!importTeacherFile.value) { ElMessage.warning(t('user.pleaseSelectFile')); return }
    try {
      const orgId = schoolList.value?.[0]?.id || ''
      await schoolUserApi.importTeacher(importTeacherFile.value, orgId)
      ElMessage.success(t('common.importSuccess'))
      showTeacherModal.value = false
      fetchTeacherList()
    } catch (error: any) { ElMessage.error(error.message || t('common.importFailed')) }
  }
}

const handleDeleteTeacher = (row: Teacher) => {
  deleteTeacherIds.value = [row.userId]
  deleteTeacherConfirmText.value = t('user.confirmDeleteTeacher', { name: row.nickName })
  isBatchDeleteTeacher.value = false
  showDeleteTeacherModal.value = true
}
const handleBatchDeleteTeacher = () => {
  if (selectedTeacherIds.value.length === 0) { ElMessage.warning(t('user.noTeacherToDelete')); return }
  deleteTeacherIds.value = [...selectedTeacherIds.value]
  deleteTeacherConfirmText.value = t('user.batchDeleteConfirmText', { count: selectedTeacherIds.value.length })
  deleteTeacherPassword.value = ''
  isBatchDeleteTeacher.value = true
  showDeleteTeacherModal.value = true
}
const handleConfirmDeleteTeacher = async () => {
  // 批量删除需要验证密码
  if (isBatchDeleteTeacher.value && !deleteTeacherPassword.value.trim()) {
    ElMessage.warning(t('user.pleaseInputTeacherPassword'))
    return
  }
  try {
    if (isBatchDeleteTeacher.value) {
      await schoolUserApi.deleteTeacher(deleteTeacherIds.value, deleteTeacherPassword.value)
    } else {
      await schoolUserApi.deleteTeacher(deleteTeacherIds.value)
    }
    ElMessage.success(t('common.deleteSuccess'))
    showDeleteTeacherModal.value = false
    selectedTeacherIds.value = []
    deleteTeacherPassword.value = ''
    fetchTeacherList()
  } catch (error: any) { ElMessage.error(error.message || t('common.failed')) }
}

const handleResetTeacherPassword = (row: Teacher) => {
  resetTeacherIds.value = [row.userId]
  resetTeacherConfirmText.value = t('user.confirmResetTeacherPassword', { name: row.nickName })
  isBatchResetTeacher.value = false
  showResetTeacherModal.value = true
}
const handleBatchResetTeacherPassword = () => {
  if (selectedTeacherIds.value.length === 0) { ElMessage.warning(t('user.noTeacherToReset')); return }
  resetTeacherIds.value = [...selectedTeacherIds.value]
  resetTeacherConfirmText.value = t('user.batchResetConfirmText', { count: selectedTeacherIds.value.length })
  resetTeacherPassword.value = ''
  isBatchResetTeacher.value = true
  showResetTeacherModal.value = true
}
const handleConfirmResetTeacher = async () => {
  // 批量重置需要验证密码
  if (isBatchResetTeacher.value && !resetTeacherPassword.value.trim()) {
    ElMessage.warning(t('user.pleaseInputTeacherPassword'))
    return
  }
  try {
    if (isBatchResetTeacher.value) {
      await schoolUserApi.resetTeacherPassword(resetTeacherIds.value, resetTeacherPassword.value)
    } else {
      await schoolUserApi.resetTeacherPassword(resetTeacherIds.value)
    }
    ElMessage.success(t('user.resetPasswordSuccess'))
    showResetTeacherModal.value = false
    resetTeacherPassword.value = ''
  } catch (error: any) { ElMessage.error(error.message || t('user.resetPasswordFailed')) }
}

const handleImportTeacher = () => { importTeacherFile.value = null; importTeacherFileName.value = ''; showImportTeacherModal.value = true }
const handleSelectTeacherFile = () => { teacherFileInputRef.value?.click() }
const handleTeacherFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    importTeacherFile.value = file
    importTeacherFileName.value = file.name
    // 选择文件后立即导入
    try {
      const orgId = schoolList.value?.[0]?.id || ''
      ElMessage.info(t('user.importingTeacher'))
      await schoolUserApi.importTeacher(file, orgId)

      showTeacherModal.value = false
      fetchTeacherList()
    } catch (error: any) {
     console.log(error)
    }
  }
  target.value = ''
}
const handleDownloadTeacherTemplate = async () => {
  try { await schoolUserApi.downloadTeacherTemplate(); ElMessage.success(t('common.downloadSuccess')) }
  catch (error: any) { ElMessage.error(error.message || t('common.downloadFailed')) }
}

const handleExportTeacher = async () => {
  try {
    await schoolUserApi.exportTeacherInfo('教师账号信息.xlsx')
    ElMessage.success(t('common.exportSuccess'))
  } catch (error: any) {
    ElMessage.error(error.message || t('common.exportFailed'))
  }
}
const handleConfirmImportTeacher = async () => {
  if (!importTeacherFile.value) { ElMessage.warning(t('user.pleaseSelectFileFirst')); return }
  try {
    const orgId = schoolList.value?.[0]?.id || ''
    await schoolUserApi.importTeacher(importTeacherFile.value, orgId)
    ElMessage.success(t('common.importSuccess')); showImportTeacherModal.value = false; fetchTeacherList()
  } catch (error: any) { ElMessage.error(error.message || t('common.importFailed')) }
}

const handleTransferTeacherClass = async (row: Teacher) => {
  transferTeacherForm.teacherId = row.userId
  transferTeacherForm.teacherName = row.nickName
  transferTeacherForm.targetTeacherId = null
  transferTeacherSearch.value = ''
  transferClassForm.gradeId = ''
  transferClassForm.classId = ''
  transferClassOptions.value = []
  transferGradeOptions.value = []

  // 获取用户列表用于班级转让
  try {
    const userList = await schoolUserApi.getUserList()
    console.log(userList, 'userList----获取用户列表用于班级转让')
    transferTeacherOptions.value = userList || []
  } catch (error) {
    transferTeacherOptions.value = []
  }

  // 获取当前教师的年级列表
  try {
    const gradeList = await schoolUserApi.transferGrade(row.userId)
    transferGradeOptions.value = (gradeList || []).map((g: any) => ({
      label: g.gradeName,
      value: g.grade
    }))
  } catch (error) {
    transferGradeOptions.value = []
  }

  showTransferTeacherModal.value = true
}
const handleConfirmTransferTeacher = async () => {
  if (!transferTeacherForm.targetTeacherId) { ElMessage.warning(t('user.pleaseSelectTeacher')); return }
  if (!transferClassForm.classId) { ElMessage.warning(t('user.pleaseSelectClassToTransfer')); return }
  try {
    const selectedClass = transferClassOptions.value.find((c: any) => c.id === transferClassForm.classId)
    await schoolUserApi.transferClass({
      teacherId: transferTeacherForm.targetTeacherId as string,  // 目标老师（接收班级的）
      targetTeacherId: transferTeacherForm.teacherId,  // 原老师（被转让的）
      classId: transferClassForm.classId,
      schoolId: schoolList.value?.[0]?.id || '',
      className: selectedClass?.name || ''
    })
    ElMessage.success(t('user.classTransferSuccess'))
    showTransferTeacherModal.value = false
    fetchTeacherList()
  } catch (error: any) { ElMessage.error(error.message || t('user.classTransferFailed')) }
}

// ==================== 班级管理相关（从class页面复制） ====================
// Tab 数据
const tabList = computed(() => [
  { label: t('class.studentManagement'), value: "student" },
  { label: t('class.groupManagement'), value: "group" },
]);
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

// 表格列配置
const tableColumns = computed(() => [
  { key: "studentName", title: t('class.studentName'), minWidth: "120px" },
  { key: "studentNumber", title: t('class.studentAccount'), minWidth: "150px" },
  { key: "createTime", title: t('class.createTime'), minWidth: "150px" },
  { key: "action", title: t('common.operation'), width: "220px", align: "center" as const },
]);

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
  { key: "teamName", title: t('class.groupName'), minWidth: "80px" },
  { key: "leaderName", title: t('class.groupLeader'), minWidth: "60px" },
  { key: "members", title: t('class.groupMembers'), minWidth: "100px" },
  { key: "remarks", title: t('class.groupRemarks'), minWidth: "100px" },
  { key: "createTime", title: t('class.createTime'), minWidth: "120px" },
  { key: "action", title: t('common.operation'), width: "100px", align: "center" as const },
]);

// 小组弹窗
const showGroupModal = ref(false);
const showDeleteGroupModal = ref(false);
const isEditGroupMode = ref(false);
const isBatchDeleteGroup = ref(false);
const deletingGroup = ref<any>(null);
const originalMembers = ref<any[]>([]);
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
const isEditClass = ref(false);
const editingClassId = ref<string | null>(null);
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
const isQuickLoginEnabled = ref(false);
const quickLoginData = ref<{ classCode?: string; classId?: string; classCodePwd?: string; expirationDate?: string }>({});
const quickLoginClassId = ref<string | null>(null);
// 使用 String() 确保类型一致进行比较
const isCurrentClassQuickLogin = computed(() => {
  return !!(quickLoginClassId.value && String(quickLoginClassId.value) === String(selectedClass.value?.id));
});
const isOtherClassQuickLogin = computed(() => {
  return !!(quickLoginClassId.value && String(quickLoginClassId.value) !== String(selectedClass.value?.id));
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
  id: null as string | null,
  teacherId: null as string | null,
});
const transferClassList = ref<any[]>([]);

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
const batchTransferClassList = ref<any[]>([]);

// 新密码展示弹窗
const showNewPasswordModal = ref(false);
const newPassword = ref("");

// 年级选项
const gradeOptions = ref<{ label: string; value: string }[]>([]);

// 批量选择
const selectedStudentIds = ref<string[]>([]);

// 是否全选
const isAllSelected = computed(() => studentList.value.length > 0 && selectedStudentIds.value.length === studentList.value.length);

// 按钮状态 - 互斥选择
type ActionType = "create" | "quickLogin" | "export" | "batch" | null;
const activeAction = ref<ActionType>(null);


const loadGradeOptions = async () => {
  try {
    const data = await getGradeDict();
    gradeOptions.value = (data || []).map((item: any) => ({
      label: item.dictLabel,
      value: item.dictValue,
    }));
  } catch (error) {
    console.error("获取年级字典失败:", error);
  }
};

const loadClassList = async () => {
  loading.value = true;
  try {
    let data = await getClassList();
    console.log('班级列表:', data);
    treeData.value = (data || []).map((item: any) => ({
      id: `grade_${item.grade}`,
      name: item.gradeName,
      grade: item.grade,
      children: (item.classList || []).map((cls: any) => ({
        id: String(cls.classId),
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
      console.log('选中班级:', firstClass.id, '快捷登录班级:', quickLoginClassId.value);
      // 展开第一个年级
      if (!expandedKeys.value.includes(firstGrade.id)) {
        expandedKeys.value.push(firstGrade.id);
      }
      // 根据当前 Tab 加载对应数据
      if (activeTab.value === 'group') {
        loadGroupList();
      } else {
        loadStudentList(firstClass.id);
      }
    }
  } catch (error) {
    console.error("获取班级列表失败:", error);
  } finally {
    loading.value = false;
  }
};

const loadStudentList = async (classId?: string) => {
  const id = classId || selectedClass.value?.id;
  if (!id) return;
  loading.value = true;
  try {
    const keyword = searchKeyword.value?.trim();
    const params = { classId: id, numberName: keyword || undefined };
    const data = await getStudentList(params);
    studentList.value = data || [];
  } catch (error) {
    console.error("获取学生列表失败:", error);
    studentList.value = [];
  } finally {
    loading.value = false;
  }
};

const loadStudentPassword = async () => {
  try {
    const data = await getStudentPassword();
    studentPassword.value = data || "";
  } catch (error) {
    console.error("获取学生统一密码失败:", error);
  }
};

const loadQuickLoginStatus = async () => {
  try {
    const data = await getQuickLoginInfo();
    console.log('快捷登录状态:', data);
    if (data && data.classCode) {
      quickLoginData.value = data;
      quickLoginClassId.value = data.classId ? String(data.classId) : null;
      isQuickLoginEnabled.value = true;
    }
  } catch (error) {
    console.error("获取快捷登录状态失败:", error);
  }
};

const handleTreeSelect = (node: any) => {
  if (!node.children) {
    selectedClass.value = node;
    // 根据当前 Tab 加载对应数据
    if (activeTab.value === 'group') {
      loadGroupList();
    } else {
      loadStudentList(node.id);
    }
  }
};

const handleTreeExpand = (key: string | number, expanded: boolean) => {
  if (expanded) { expandedKeys.value.push(key); }
  else { expandedKeys.value = expandedKeys.value.filter((k) => k !== key); }
};

const handleEditClass = (node: any) => {
  isEditClass.value = true;
  editingClassId.value = node.id;
  createClassForm.gradeId = String(node.grade) || null;
  createClassForm.className = node.name || "";
  createClassForm.teacherName = node.teacherName || selectedClass.value?.teacherName || "";
  showCreateClassModal.value = true;
};

const handleDeleteClass = (node: any) => {
  deletingClass.value = node;
  showDeleteClassModal.value = true;
};

const handleConfirmDeleteClass = async () => {
  if (!deletingClass.value) { showDeleteClassModal.value = false; return; }
  try {
    let res = await deleteClass(deletingClass.value.id);
    if (res.code == 200) {
      ElMessage.success(t('class.deletedClass', { name: deletingClass.value.name }));
      loadClassList();
    }
  } catch (error) {
    console.error("删除班级失败:", error);
  } finally {
    showDeleteClassModal.value = false;
    deletingClass.value = null;
  }
};

const handleCreateNewClass = (gradeNode: any) => {
  isEditClass.value = false;
  editingClassId.value = null;
  createClassForm.gradeId = null;
  createClassForm.className = "";
  createClassForm.teacherName = selectedClass.value?.teacherName || currentUserName.value || "";
  if (gradeNode) { createClassForm.gradeId = gradeNode.id; }
  showCreateClassModal.value = true;
};

const handleConfirmCreateClass = async () => {
  if (!createClassForm.gradeId) { ElMessage.error(t('user.pleaseSelectGrade')); return; }
  if (!createClassForm.className) { ElMessage.error(t('user.pleaseInputClassName')); return; }
  const selectedGrade = gradeOptions.value.find((item) => item.value === createClassForm.gradeId);
  try {
    if (isEditClass.value && editingClassId.value) {
      const schoolId = schoolList.value?.[0]?.id || ''
      await updateClass({ id: editingClassId.value, className: createClassForm.className, grade: Number(createClassForm.gradeId), gradeName: selectedGrade?.label || "", schoolId });
      ElMessage.success(t('user.editClassSuccess'));
    } else {
      await createClass({ className: createClassForm.className, grade: Number(createClassForm.gradeId), gradeName: selectedGrade?.label || "" });
      ElMessage.success(t('user.createClassSuccess'));
    }
    loadClassList();
    showCreateClassModal.value = false;
    isEditClass.value = false;
    editingClassId.value = null;
    createClassForm.gradeId = null;
    createClassForm.className = "";
    createClassForm.teacherName = "";
  } catch (error) {
    console.error("操作失败:", error);
  }
};

const handleSearch = () => { loadStudentList(); };
const handleCreateAction = () => { showCreateModal.value = true; };

// 快捷登录
const handleQuickLogin = async () => {
  if (isCurrentClassQuickLogin.value) {
    try {
      await stopQuickLogin(selectedClass.value.id);
      isQuickLoginEnabled.value = false;
      quickLoginClassId.value = null;
      quickLoginData.value = {};
      ElMessage.info(t('user.quickLoginDisabled'));
    } catch (error) { console.error("停用快捷登录失败:", error); }
  } else if (!isOtherClassQuickLogin.value) {
    showQuickLoginModal.value = true;
  }
};

const handleConfirmQuickLogin = async () => {
  if (!selectedClass.value?.id) { ElMessage.error(t('user.pleaseSelectClass')); return; }
  try {
    const data = await createQuickLogin(selectedClass.value.id);
    quickLoginData.value = data || {};
    quickLoginClassId.value = selectedClass.value.id;
    ElMessage.success(t('user.quickLoginEnabled'));
    isQuickLoginEnabled.value = true;
    showQuickLoginModal.value = false;
  } catch (error) { console.error("创建快捷登录失败:", error); }
};

const copyToClipboard = async (text?: string) => {
  if (!text) return;
  try { await navigator.clipboard.writeText(text); ElMessage.success(t('common.copySuccess')); }
  catch (error) { ElMessage.error(t('common.copyFailed')); }
};

const handleRefreshQuickLogin = async () => {
  if (!selectedClass.value?.id) return;
  try {
    const data = await createQuickLogin(selectedClass.value.id);
    quickLoginData.value = data || {};
    ElMessage.success(t('common.refreshed'));
  } catch (error) { console.error("刷新快捷登录失败:", error); }
};

const handleExport = async () => {
  try {
    ElMessage.info(t('user.exportingStudent'));
    // 文件名格式：年级+班级+学生账号信息.xlsx
    const gradeName = selectedClass.value?.gradeName || '';
    const className = selectedClass.value?.name || '';
    const filename = `${gradeName}${className}学生账号信息.xlsx`;
    await exportStudentInfo(filename);
    ElMessage.success(t('common.exportSuccess'));
  } catch (error) { console.error("导出失败:", error); ElMessage.error(t('common.exportFailed')); }
};

const handleBatchAction = () => {
  if (activeAction.value === "batch") { activeAction.value = null; selectedStudentIds.value = []; ElMessage.info(t('user.exitBatchMode')); }
  else { activeAction.value = "batch"; ElMessage.info(t('user.enterBatchMode')); }
};

const handleStudentSelect = (keys: (string | number)[], rows: any[]) => { selectedStudentIds.value = keys.map((k) => String(k)); };
const handleStudentSelectAll = (selected: boolean) => {
  if (selected) { selectedStudentIds.value = studentList.value.map((s) => String(s.id)); }
  else { selectedStudentIds.value = []; }
};
const handleSelectAllToggle = (e: Event) => { handleStudentSelectAll((e.target as HTMLInputElement).checked); };

const handleBatchDelete = () => {
  if (selectedStudentIds.value.length === 0) { ElMessage.warning(t('user.noStudentSelected')); return; }
  showBatchDeleteModal.value = true;
};

const handleConfirmBatchDelete = async () => {
  try {
    await removeStudent(selectedStudentIds.value.map(String));
    ElMessage.success(t('class.deletedStudents', { count: selectedStudentIds.value.length }));
    selectedStudentIds.value = [];
    loadStudentList();
  } catch (error) { console.error("批量删除失败:", error); }
  finally { showBatchDeleteModal.value = false; }
};

const handleBatchTransfer = () => {
  if (selectedStudentIds.value.length === 0) { ElMessage.warning(t('user.noStudentSelected')); return; }
  batchTransferForm.gradeId = null;
  batchTransferForm.classId = null;
  showBatchTransferModal.value = true;
};

const handleConfirmBatchTransfer = async () => {
  if (!batchTransferForm.gradeId) { ElMessage.error(t('class.pleaseSelectGrade')); return; }
  if (!batchTransferForm.classId) { ElMessage.error(t('class.pleaseSelectClass')); return; }
  const targetClass = batchTransferClassList.value.find((c: any) => c.id === batchTransferForm.classId);
  try {
    await transferClass({ ids: selectedStudentIds.value.map(String), classId: batchTransferForm.classId as string, teacherId: targetClass?.teacherId || "" });
    ElMessage.success(t('class.transferredStudents', { count: selectedStudentIds.value.length }));
    loadStudentList();
  } catch (error) { console.error("批量移班失败:", error); }
  finally { showBatchTransferModal.value = false; }
};

const batchTransferClassOptions = computed(() => batchTransferClassList.value.map((cls: any) => ({ label: cls.className, value: cls.id })));

const handleBatchResetPassword = () => {
  if (selectedStudentIds.value.length === 0) { ElMessage.warning(t('user.noStudentSelected')); return; }
  showBatchResetPasswordModal.value = true;
};

const selectedStudentNames = computed(() => studentList.value.filter((s) => selectedStudentIds.value.includes(String(s.id))).map((s) => s.studentName).join(","));

const handleConfirmBatchResetPassword = async () => {
  try {
    const data = await resetPassword(selectedStudentIds.value);
    showBatchResetPasswordModal.value = false;
    newPassword.value = data || "";
    showNewPasswordModal.value = true;
  } catch (error) { console.error("批量重置密码失败:", error); showBatchResetPasswordModal.value = false; }
};

const handleResetPassword = (row: any) => { resettingStudent.value = row; showResetPasswordModal.value = true; };

const handleConfirmResetPassword = async () => {
  if (!resettingStudent.value) { showResetPasswordModal.value = false; return; }
  try {
    const data = await resetPassword([String(resettingStudent.value.id)]);
    showResetPasswordModal.value = false;
    resettingStudent.value = null;
    newPassword.value = data || "";
    showNewPasswordModal.value = true;
  } catch (error) { console.error("重置密码失败:", error); showResetPasswordModal.value = false; resettingStudent.value = null; }
};

const handleTransfer = (row: any) => {
  transferringStudent.value = row;
  transferForm.gradeId = null;
  transferForm.teacherId = null;
  transferClassList.value = [];
  showTransferModal.value = true;
};

// const handleTransferGradeChange = (grade: string | number | null) => {
//   transferForm.classId = null;
//   transferForm.id = null;
//   transferForm.teacherId = null;
//   transferClassList.value = [];
//   if (grade) { loadTransferClassList(String(grade)); }
// };

const handleTransferClassChange = (value: string | number | null, option: any) => {
  if (value) { transferForm.id = String(value); transferForm.teacherId = option?.teacherId || null; }
  else { transferForm.id = null; transferForm.teacherId = null; }
};

const handleBatchTransferGradeChange = (grade: string | number | null) => {
  batchTransferForm.classId = null;
  batchTransferClassList.value = [];
  if (grade) { loadBatchTransferClassList(String(grade)); }
};

const handleConfirmTransfer = async () => {
  if (!transferForm.gradeId) { ElMessage.error(t('class.pleaseSelectGrade')); return; }
  if (!transferForm.classId) { ElMessage.error(t('class.pleaseSelectClass')); return; }
  if (!transferringStudent.value) { showTransferModal.value = false; return; }
  try {
    await transferClass({ ids: [transferringStudent.value.id], classId: transferForm.id as string, teacherId: transferForm.teacherId || "" });
    ElMessage.success(t('class.transferredStudent', { name: transferringStudent.value.studentName }));
    loadStudentList();
  } catch (error) { console.error("移班失败:", error); }
  finally { showTransferModal.value = false; transferringStudent.value = null; }
};

const loadTransferClassList = async (grade: string) => {
  try { const data = await getClassByGrade(grade); transferClassList.value = data || []; }
  catch (error) { console.error("获取班级列表失败:", error); transferClassList.value = []; }
};

const loadBatchTransferClassList = async (grade: string) => {
  try { const data = await getClassByGrade(grade); batchTransferClassList.value = data || []; }
  catch (error) { console.error("获取班级列表失败:", error); batchTransferClassList.value = []; }
};

// const transferClassOptions = computed(() => transferClassList.value.map((cls: any) => ({ label: cls.className, value: cls.id, teacherId: cls.teacherId })));

const handleDeleteStudent = (row: any) => { deletingStudent.value = row; showDeleteStudentModal.value = true; };

const handleConfirmDeleteStudent = async () => {
  if (!deletingStudent.value) { showDeleteStudentModal.value = false; return; }
  try {
    await removeStudent([deletingStudent.value.id]);
    ElMessage.success(`已删除学生：${deletingStudent.value.studentName}`);
    loadStudentList();
  } catch (error) { console.error("删除学生失败:", error); }
  finally { showDeleteStudentModal.value = false; deletingStudent.value = null; }
};

// 导入学生信息
const handleImportStudents = () => {
  if (!selectedClass.value?.id) { ElMessage.error("请先选择班级"); return; }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      ElMessage.info("正在导入学生信息...");
      await importStudent(file, selectedClass.value.id);
    
      loadStudentList();
      showCreateModal.value = false;
    } catch (error: any) { console.error("导入失败:", error) }
  };
  input.click();
};

const handleDownloadTemplate = async () => {
  try { ElMessage.info("正在下载导入模板..."); await downloadTemplate(); ElMessage.success("下载成功"); }
  catch (error) { console.error("下载失败:", error); ElMessage.error("下载失败"); }
};

const handleCreateStudent = async () => {
  if (addStudentMode.value === "manual") {
    if (!selectedClass.value?.id) { ElMessage.error("请先选择班级"); return; }
    if (!createForm.name) { ElMessage.error("请填写学生姓名"); return; }
    try {
      await addStudent({ classId: selectedClass.value.id, studentName: createForm.name });
      ElMessage.success("创建学生成功");
      loadStudentList();
    } catch (error) { console.error("创建学生失败:", error); return; }
  } else { ElMessage.success("批量导入成功"); }
  showCreateModal.value = false;
  createForm.name = "";
  addStudentMode.value = "batch";
};

// ===== 小组管理方法 =====
const loadGroupList = async () => {
  if (!selectedClass.value?.id) return;
  groupLoading.value = true;
  try {
    const keyword = groupSearchKeyword.value?.trim();
    const params = { classId: selectedClass.value.id, teamLeader: keyword || undefined };
    const data = await getGroupList(params);
    groupList.value = data || [];
  } catch (error) { console.error("加载小组列表失败:", error); groupList.value = []; }
  finally { groupLoading.value = false; }
};

const handleGroupSearch = () => { loadGroupList(); };

const handleCreateGroup = () => {
  if (!selectedClass.value?.id) { ElMessage.warning("请先选择班级"); return; }
  isEditGroupMode.value = false;
  groupForm.id = "";
  groupForm.name = "";
  groupForm.remarks = "";
  groupForm.leaderId = "";
  groupForm.members = [];
  showGroupModal.value = true;
};

const handleEditGroup = async (row: any) => {
  try {
    const detail = await getGroupMemberList(row.id);
    const memberList = Array.isArray(detail?.studentList) ? detail.studentList : [];
    isEditGroupMode.value = true;
    groupForm.id = detail?.id || row.id;
    groupForm.name = detail?.teamName || row.teamName;
    groupForm.remarks = detail?.remarks || row.remarks || "";
    const leader = memberList.find((m: any) => m.isLeader === 1);
    groupForm.leaderId = leader?.studentNumber || "";
    groupForm.members = memberList.map((m: any) => ({ ...m, id: m.studentNumber }));
    originalMembers.value = JSON.parse(JSON.stringify(groupForm.members));
    showGroupModal.value = true;
  } catch (error) { console.error("获取小组成员失败:", error); ElMessage.error("获取小组成员失败"); }
};

const handleConfirmGroup = async () => {
  if (!groupForm.name.trim()) { ElMessage.warning("请输入小组名称"); return; }
  try {
    if (isEditGroupMode.value) {
      const currentMemberIds = groupForm.members.map((m) => m.id);
      const currentMembers = groupForm.members.map((m) => ({
        studentNumber: m.studentNumber, studentName: m.studentName,
        isLeader: (m.id === groupForm.leaderId ? 1 : 0) as 0 | 1, delFlag: 0 as 0 | 1,
      }));
      const deletedMembers = originalMembers.value.filter((m) => !currentMemberIds.includes(m.id)).map((m) => ({
        studentNumber: m.studentNumber, studentName: m.studentName, isLeader: 0 as 0 | 1, delFlag: 1 as 0 | 1,
      }));
      const editData = { id: groupForm.id, classId: selectedClass.value?.id || "", teamName: groupForm.name, remarks: groupForm.remarks || undefined, studentList: [...currentMembers, ...deletedMembers] };
      await updateGroup(editData);
      ElMessage.success("编辑成功");
    } else {
      // 如果只有一个成员，默认设置为组长（isLeader: 1）
      const addData = {
        classId: selectedClass.value?.id || "", teamName: groupForm.name, remarks: groupForm.remarks || undefined,
        studentList: groupForm.members.map((m, index) => ({ 
          studentNumber: m.studentNumber, 
          studentName: m.studentName, 
          isLeader: (groupForm.members.length === 1 || m.id === groupForm.leaderId) ? 1 : 0 
        })) as { studentNumber: string; studentName: string; isLeader: 0 | 1 }[],
      };
      await addGroup(addData);
      ElMessage.success("创建成功");
    }
    showGroupModal.value = false;
    loadGroupList();
  } catch (error) { console.error("操作失败:", error); }
};

const loadAvailableStudents = async () => {
  if (!selectedClass.value?.id) return;
  try { const data = await getAddStudentList(selectedClass.value.id); availableStudents.value = data || []; }
  catch (error) { console.error("获取可添加学生列表失败:", error); availableStudents.value = []; }
};

const filteredAvailableStudents = computed(() => {
  const addedIds = groupForm.members.map((m) => m.id);
  const filtered = availableStudents.value.filter((s) => !addedIds.includes(s.id));
  const keyword = memberSearchKeyword.value.trim().toLowerCase();
  if (!keyword) return filtered;
  return filtered.filter((s) => s.studentName?.toLowerCase().includes(keyword) || s.studentNumber?.toLowerCase().includes(keyword));
});

const handleMemberSearch = () => { };
const isAllMemberSelected = computed(() => {
  if (!filteredAvailableStudents.value.length) return false;
  return filteredAvailableStudents.value.every((s) => selectedMemberIds.value.includes(s.id));
});

const toggleAllMemberSelection = () => {
  if (isAllMemberSelected.value) {
    const filteredIds = filteredAvailableStudents.value.map((s) => s.id);
    selectedMemberIds.value = selectedMemberIds.value.filter((id) => !filteredIds.includes(id));
  } else {
    const filteredIds = filteredAvailableStudents.value.map((s) => s.id);
    const newIds = filteredIds.filter((id) => !selectedMemberIds.value.includes(id));
    selectedMemberIds.value.push(...newIds);
  }
};

const getStudentNameById = (id: string) => {
  const student = availableStudents.value.find((s) => s.id === id);
  return student?.studentName || student?.name || id;
};

const removeSelectedMember = (id: string) => {
  const index = selectedMemberIds.value.indexOf(id);
  if (index > -1) { selectedMemberIds.value.splice(index, 1); }
};

const isAllGroupSelected = computed(() => {
  if (!groupList.value.length) return false;
  return groupList.value.every((item) => selectedGroupIds.value.includes(item.id));
});

const handleAddGroupMember = async () => {
  selectedMemberIds.value = [];
  memberSearchKeyword.value = "";
  await loadAvailableStudents();
  showAddMemberModal.value = true;
};

const toggleStudentSelection = (student: any) => {
  const index = selectedMemberIds.value.indexOf(student.id);
  if (index > -1) { selectedMemberIds.value.splice(index, 1); }
  else { selectedMemberIds.value.push(student.id); }
};

const handleConfirmAddMembers = () => {
  const newMembers = availableStudents.value.filter((s) => selectedMemberIds.value.includes(s.id));
  groupForm.members.push(...newMembers);
  if (!groupForm.leaderId && groupForm.members.length > 0) { groupForm.leaderId = groupForm.members[0].id; }
  showAddMemberModal.value = false;
};

const handleRemoveGroupMember = (index: number) => {
  const removed = groupForm.members.splice(index, 1)[0];
  if (removed && groupForm.leaderId === removed.id) {
    groupForm.leaderId = groupForm.members.length > 0 ? groupForm.members[0].id : "";
  }
};

const handleDeleteGroup = (row: any) => {
  isBatchDeleteGroup.value = false;
  deletingGroup.value = row;
  showDeleteGroupModal.value = true;
};

const handleConfirmDeleteGroup = async () => {
  try {
    if (isBatchDeleteGroup.value) {
      await deleteGroup(selectedGroupIds.value);
      ElMessage.success("批量删除成功");
      selectedGroupIds.value = [];
    } else {
      if (deletingGroup.value?.id) { await deleteGroup([deletingGroup.value.id]); ElMessage.success("删除成功"); }
    }
    showDeleteGroupModal.value = false;
    loadGroupList();
  } catch (error) { console.error("删除失败:", error); }
};

const handleGroupBatchAction = () => {
  if (groupActiveAction.value === "batch") { groupActiveAction.value = null; selectedGroupIds.value = []; }
  else { groupActiveAction.value = "batch"; }
};

const handleBatchDeleteGroup = () => {
  if (!selectedGroupIds.value.length) { ElMessage.warning(t('class.noGroupSelected')); return; }
  isBatchDeleteGroup.value = true;
  showDeleteGroupModal.value = true;
};

const handleGroupSelect = (keys: (string | number)[], rows: any[]) => { selectedGroupIds.value = keys.map((k) => String(k)); };
const handleGroupSelectAll = (selected: boolean) => {
  if (selected) { selectedGroupIds.value = groupList.value.map((item) => item.id); }
  else { selectedGroupIds.value = []; }
};
const handleGroupSelectAllToggle = (e: Event) => { handleGroupSelectAll((e.target as HTMLInputElement).checked); };

// Tab 切换处理
const handleTabChange = (newTab: string) => {
  if (!selectedClass.value?.id) return;
  if (newTab === "group") {
    loadGroupList();
  } else {
    loadStudentList(selectedClass.value.id);
  }
};

// 初始化
onMounted(() => {
  fetchTeacherList();
  fetchTeacherPassword();
  fetchSchoolInfo();
  // 预加载快捷登录状态，切换到班级管理时能直接显示
  loadQuickLoginStatus();
});
</script>


<style scoped>
.user-page {
  height: calc(100vh - 70px);
  overflow: hidden;
}

.main-panel {
  overflow-x: auto;
  overflow-y: auto;
}

.left-panel {
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

/* 自定义方形复选框 */
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid #E5E5E5;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
}

.checkbox-box:hover {
  border-color: #FF9900;
}

.checkbox-box.checked {
  background: #FF9900;
  border-color: #FF9900;
}

.checkbox-icon {
  width: 12px;
  height: 12px;
}

/* 教师表格样式 - 斑马纹 */
.teacher-table :deep(thead) {
  background-color: #FAFAFA !important;
}

.teacher-table :deep(thead th) {
  background-color: transparent !important;
}

.teacher-table {
  box-shadow: none !important;
  border-radius: 8px;
  overflow: hidden;
}

.teacher-table :deep(tbody tr:nth-child(odd)) {
  background-color: #FFFFFF;
}

.teacher-table :deep(tbody tr:nth-child(even)) {
  background-color: #F9F9F9;
}

.teacher-table :deep(tbody tr:hover) {
  background-color: #FFF8F0 !important;
}

.teacher-table :deep(tbody td) {
  border-bottom: none !important;
  padding-top: 16px;
  padding-bottom: 16px;
}
</style>
