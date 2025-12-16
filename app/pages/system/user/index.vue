<template>
  <div class="user-page flex bg-[#FAFAFA]">
    <!-- 左侧教师导航（固定） -->
    <aside class="teacher-nav hidden lg:flex w-[160px] xl:w-[180px] 3xl:w-[220px] 2xl:w-[295px] flex-col flex-shrink-0">
      <nav class="flex-1 overflow-auto py-2">
        <button
          v-for="item in menuItems"
          :key="item.path"
          type="button"
          :disabled="isActiveItem(item)"
          :class="[
            'w-full text-left flex items-center h-[50px] gap-3 px-4 py-3 transition-colors',
            isActiveItem(item)
              ? 'bg-[#FF9900] text-white font-normal cursor-default rounded-lg'
              : 'text-gray-700 hover:bg-gray-50 cursor-pointer text-sm',
          ]"
          :style="isActiveItem(item) ? { fontSize: '20px' } : {}"
          @click="!isActiveItem(item) && go(item.path)"
        >
          <div class="w-9 h-9 flex items-center justify-center">
            <img
              v-if="item.icon || item.iconSelected"
              :src="isActiveItem(item) ? item.iconSelected || item.icon : item.icon"
              alt=""
              class="w-9 h-9 object-contain"
            />
            <span v-else>•</span>
          </div>
          <span>{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- 中间内容：左侧面板 + 主内容 -->
    <div class="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
      <!-- 左侧面板：Tab切换 + 内容 -->
      <section class="left-panel w-full lg:w-[200px] xl:w-[220px] 3xl:w-[260px] 2xl:w-[309px] flex-shrink-0 p-3 flex flex-col">
        <!-- Tab 切换 -->
        <MTabs v-model="activeNav" :tabs="navTabs" class="mb-3 flex-shrink-0" @change="handleNavChange" />
        
        <!-- 教师管理时显示学校名称 -->
        <template v-if="activeNav === 'teacher'">
          <div class="bg-white rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
            <div class="p-4" v-for="item in schoolList">
              <div class="text-[16px] text-[#4D4D4D] font-medium">{{ item.label }}</div>
            </div>
          </div>
        </template>

        <!-- 班级管理时显示班级树 -->
        <template v-else-if="activeNav === 'class'">
          <MButton type="primary" class="mb-3 w-[142px] h-[50px] flex-shrink-0" size="small" @click="handleSelectAll"
            style="border-radius: 10px; font-size: 16px; background-color: #ff9900; border-color: #ff9900;">
            全部班级
          </MButton>
          <div class="bg-[#FFFFFF] shadow-sm flex-1 flex flex-col min-h-0">
            <!-- 有数据时显示树 -->
            <div v-if="treeData.length" class="flex-1 overflow-y-auto p-2">
              <MTree :data="treeData" :selected-key="selectedClass?.id" :expanded-keys="expandedKeys" label-key="name"
                :children-key="'children'" @select="handleTreeSelect" @expand="handleTreeExpand">
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
        </template>
      </section>

      <!-- 右侧主内容 -->
      <section class="main-panel flex-1 min-w-0 p-4 flex flex-col">
        <!-- 教师管理 Tab -->
        <template v-if="activeNav === 'teacher'">
          <!-- 教师管理 Tab 标题 -->
          <MTabs v-model="teacherActiveTab" :tabs="teacherTabList" class="mb-4 flex-shrink-0" />

          <!-- 主内容区 -->
          <div class="bg-white rounded-lg p-4 flex-1 flex flex-col min-h-0 shadow-sm">
            <!-- 搜索 + 统一密码 + 操作按钮 -->
            <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
              <!-- 左侧：搜索框 + 密码提示 -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                <MInput 
                  v-model="teacherSearchKeyword" 
                  placeholder="输入账号或姓名查找" 
                  clearable 
                  class="w-full sm:w-[140px] lg:w-[150px] xl:w-[180px] 3xl:w-[220px] 2xl:w-[280px]"
                  @enter="handleTeacherSearch"
                  @clear="handleTeacherSearch"
                >
                  <template #prefix>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </template>
                </MInput>
                <span class="hidden md:inline-block text-xs lg:text-sm text-[#CBCBCB]">
                  教师统一密码为：<span class="text-[#FF9900]">{{ teacherPassword || 'xxxxxxxx' }}</span>
                </span>
              </div>

              <!-- 右侧：按钮组 -->
              <div class="flex flex-wrap items-center gap-1 lg:gap-2 w-full sm:w-auto">
                <button
                  :class="[
                    'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center gap-1 rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                    teacherActiveAction === 'batch' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FF9900] text-white hover:bg-[#FF9900]'
                  ]"
                  :disabled="teacherActiveAction === 'batch'"
                  @click="handleCreateTeacher"
                >
                  <span class="text-sm lg:text-base xl:text-lg">+</span>
                  <span class="hidden lg:inline">创建教师</span>
                  <span class="lg:hidden">创建</span>
                </button>
                <button
                  :class="[
                    'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                    teacherActiveAction === 'batch' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFF1DD] text-[#4D4D4D] hover:bg-[#FFE4C4]'
                  ]"
                  :disabled="teacherActiveAction === 'batch'"
                  @click="handleExportTeacher"
                >
                  导出
                </button>
                <button
                  :class="[
                    'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                    teacherActiveAction === 'batch' ? 'bg-[#FF9900] text-white' : 'bg-[#FFF1DD] text-[#4D4D4D] hover:bg-[#FFE4C4]'
                  ]"
                  @click="handleTeacherBatchAction"
                >
                  {{ teacherActiveAction === 'batch' ? '取消批量' : '批量操作' }}
                </button>
              </div>
            </div>

            <!-- 表格 -->
            <div class="flex-1 overflow-auto min-h-0">
              <MTable
                :columns="teacherTableColumns"
                :data="teacherList"
                :loading="teacherLoading"
                :selected-keys="selectedTeacherIds"
                :selectable="teacherActiveAction === 'batch'"
                row-key="userId"
                show-index
                stripe
                @select="handleTeacherSelect"
                @select-all="handleTeacherSelectAll"
              >
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
                  <div class="flex items-center justify-center gap-1 lg:gap-2 whitespace-nowrap">
                    <button
                      :class="[
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                        teacherActiveAction === 'batch' ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]'
                      ]"
                      :disabled="teacherActiveAction === 'batch'"
                      @click="handleTransferTeacherClass(row)"
                    >
                      转让
                    </button>
                    <button
                      :class="[
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                        teacherActiveAction === 'batch' ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]'
                      ]"
                      :disabled="teacherActiveAction === 'batch'"
                      @click="handleResetTeacherPassword(row)"
                    >
                      重置
                    </button>
                    <button
                      :class="[
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                        teacherActiveAction === 'batch' ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]'
                      ]"
                      :disabled="teacherActiveAction === 'batch'"
                      @click="handleEditTeacher(row)"
                    >
                      编辑
                    </button>
                    <button
                      :class="[
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                        teacherActiveAction === 'batch' ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-[#FF0000] border-[#CBCBCB] hover:border-[#FF0000]'
                      ]"
                      :disabled="teacherActiveAction === 'batch'"
                      @click="handleDeleteTeacher(row)"
                    >
                      删除
                    </button>
                  </div>
                </template>
              </MTable>
            </div>

            <!-- 批量操作栏 -->
            <div
              v-if="teacherActiveAction === 'batch'"
              class="flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] rounded-lg"
            >
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="isAllTeacherSelected"
                    class="w-4 h-4 accent-[#FF9900]"
                    @change="handleTeacherSelectAllToggle"
                  />
                  <span class="text-sm text-[#4D4D4D]">全选</span>
                </label>
                <span class="text-sm text-[#4D4D4D]">
                  已选 <span class="text-[#FF9900]">{{ selectedTeacherIds.length }}</span> 项
                </span>
              </div>
              <div class="flex items-center gap-4">
                <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchResetTeacherPassword">
                  批量重置密码
                </button>
                <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDeleteTeacher">
                  批量删除
                </button>
                <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleTeacherBatchAction">
                  取消批量操作
                </button>
              </div>
            </div>

            <!-- 分页 -->
            <div class="mt-4 flex-shrink-0">
              <MPagination
                v-model:current-page="teacherPagination.page"
                v-model:page-size="teacherPagination.pageSize"
                :total="teacherPagination.total"
                :show-size-changer="true"
                :show-total="true"
                @change="handleTeacherPageChange"
              />
            </div>
          </div>
        </template>

        <!-- 班级管理 Tab -->
        <template v-else-if="activeNav === 'class'">
          <!-- Tab 切换 - 固定 -->
          <MTabs v-model="activeTab" :tabs="tabList" class="mb-4 flex-shrink-0" />

          <!-- 学生管理 Tab -->
          <div v-if="activeTab === 'student'" class="bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0">
            <!-- 搜索 + 统一密码 + 操作按钮 - 固定 -->
            <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 mb-3 flex-shrink-0">
              <!-- 左侧：搜索框 + 提示 -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <MInput v-model="searchKeyword" placeholder="输入学生账号或姓名进行查找" clearable class="w-full sm:w-[160px] md:w-[180px] xl:w-[200px] 3xl:w-[240px] 2xl:w-[270px]"
                  @enter="handleSearch" @clear="handleSearch">
                  <template #prefix>
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </template>
                </MInput>
                <span class="hidden md:inline-block text-xs lg:text-sm text-[#CBCBCB] lg:w-[160px] xl:w-[180px] 3xl:w-[200px]">学生统一密码为：{{
                  studentPassword ||
                  '-' }}</span>
              </div>
              <!-- 右侧：按钮组 -->
              <div class="flex flex-wrap items-center gap-1 lg:gap-2 w-full sm:w-auto">
                <button :class="[
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch' || isCurrentClassQuickLogin
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FF9900] text-white',
                ]" :disabled="activeAction === 'batch' || isCurrentClassQuickLogin" @click="handleCreateAction()">
                  + <span class="hidden xl:inline">创建学生</span><span class="xl:hidden">创建</span>
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
                    <span class="hidden xl:inline">{{ isCurrentClassQuickLogin ? "停用快捷登录" : "快捷登录" }}</span>
                    <span class="xl:hidden">{{ isCurrentClassQuickLogin ? "停用" : "快捷" }}</span>
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
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]" :disabled="activeAction === 'batch'" @click="handleExport">
                  <span class="hidden xl:inline">导出学生</span>
                  <span class="xl:hidden">导出</span>
                </button>
                <button :class="[
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch'
                    ? 'bg-[#FF9900] text-white'
                    : isCurrentClassQuickLogin
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]" :disabled="isCurrentClassQuickLogin && activeAction !== 'batch'" @click="handleBatchAction">
                  {{ activeAction === "batch" ? "取消" : "批量" }}
                </button>
              </div>
            </div>

            <!-- 快捷登录信息栏 -->
            <div v-if="isCurrentClassQuickLogin"
              class="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 mb-3 bg-[#FF9900] rounded-lg text-white text-xs sm:text-sm">
              <span class="bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded">NEW</span>

              <span class="border-l border-white/30 pl-2 sm:pl-4">班级码：{{ quickLoginData.classCode || '-' }}</span>
              <span class="hidden sm:inline">统一登录密码：{{ quickLoginData.classCodePwd || '-' }}</span>
              <span class="sm:hidden">密码：{{ quickLoginData.classCodePwd || '-' }}</span>
              <button class="px-1.5 sm:px-2 py-0.5 sm:py-1 border border-white/50 rounded text-[10px] sm:text-xs hover:bg-white/10"
                @click="copyToClipboard(quickLoginData.classCodePwd)">
                复制
              </button>
              <span class="hidden md:flex items-center gap-1 text-white/80 text-xs ml-auto">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                (有效时长为2小时，{{ quickLoginData.expirationDate || '' }}过期)
              </span>
              <button class="p-1 hover:bg-white/10 rounded ml-auto md:ml-0" @click="handleRefreshQuickLogin">
                <svg class="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div class="flex items-center justify-center gap-1 lg:gap-2 whitespace-nowrap">
                    <button
                      :class="[
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
                        activeAction === 'batch' || isCurrentClassQuickLogin
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900]'
                      ]"
                      :disabled="activeAction === 'batch' || isCurrentClassQuickLogin"
                      @click="handleResetPassword(row)">
                      重置
                    </button>
                    <button
                      :class="[
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
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
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
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
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-3 p-2 sm:p-3 bg-[#FFF2DD] border-t border-gray-200 rounded-b-lg">
              <div class="flex items-center gap-3 sm:gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" :checked="isAllSelected" class="w-4 h-4 accent-[#FF9900]"
                    @change="handleSelectAllToggle" />
                  <span class="text-xs sm:text-sm text-[#4D4D4D]">全选</span>
                </label>
                <span class="text-xs sm:text-sm text-[#4D4D4D]">已选
                  <span class="text-[#FF9900]">{{
                    selectedStudentIds.length
                  }}</span>
                  项</span>
              </div>
              <div class="flex flex-wrap items-center gap-2 sm:gap-4">
                <button class="text-xs sm:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchResetPassword">
                  <span class="hidden sm:inline">批量</span>重置密码
                </button>
                <button class="text-xs sm:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchTransfer">
                  <span class="hidden sm:inline">批量</span>移班
                </button>
                <button class="text-xs sm:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDelete">
                  <span class="hidden sm:inline">批量</span>删除
                </button>
                <button class="text-xs sm:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchAction">
                  取消
                </button>
              </div>
            </div>
          </div>

          <!-- 小组管理 Tab -->
          <div v-else-if="activeTab === 'group'" class="bg-[#FFFFFF] rounded-lg p-4 flex-1 flex flex-col min-h-0">
            <!-- 搜索 + 操作按钮 -->
            <div class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 mb-3 flex-shrink-0">
              <!-- 左侧：搜索框 -->
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <MInput v-model="groupSearchKeyword" placeholder="输入小组名称或姓名" clearable class="w-full sm:w-[140px] lg:w-[150px] xl:w-[180px] 3xl:w-[220px] 2xl:w-[240px]"
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
                  + <span class="hidden xl:inline">创建小组</span><span class="xl:hidden">创建</span>
                </button>
                <button :class="[
                  'h-[32px] lg:h-[34px] xl:h-[40px] px-2 lg:px-3 xl:px-4 flex items-center justify-center rounded-[20px] text-[11px] lg:text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  groupActiveAction === 'batch'
                    ? 'bg-[#FF9900] text-white'
                    : 'bg-[#FFF1DD] text-[#4D4D4D]',
                ]" @click="handleGroupBatchAction">
                  {{ groupActiveAction === 'batch' ? '取消' : '批量' }}
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
                    <button
                      :class="[
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
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
                        'px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors',
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
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-3 p-2 lg:p-3 bg-[#FFF2DD] border-t border-gray-200 rounded-b-lg">
              <div class="flex items-center gap-2 lg:gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" :checked="isAllGroupSelected" class="w-4 h-4 accent-[#FF9900]"
                    @change="handleGroupSelectAllToggle" />
                  <span class="text-xs lg:text-sm text-[#4D4D4D]">全选</span>
                </label>
                <span class="text-xs lg:text-sm text-[#4D4D4D]">
                  已选 <span class="text-[#FF9900]">{{ selectedGroupIds.length }}</span> 项
                </span>
              </div>
              <div class="flex items-center gap-2 lg:gap-4">
                <button class="text-xs lg:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDeleteGroup">
                  删除
                </button>
                <button class="text-xs lg:text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleGroupBatchAction">
                  取消
                </button>
              </div>
            </div>
          </div>
        </template>
      </section>
    </div>

    <!-- ==================== 教师管理弹窗 ==================== -->
    <!-- 添加/编辑教师弹窗 -->
    <MModal v-model="showTeacherModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
          {{ isEditTeacher ? '编辑教师' : '添加教师' }}
        </h3>
        
        <!-- Tab 切换（编辑时不显示） -->
        <div v-if="!isEditTeacher" class="flex justify-center gap-2 mb-6">
          <button
            :class="[
              'px-4 py-2 rounded-full text-sm transition-colors',
              addTeacherTab === 'import' ? 'bg-[#FF9900] text-white' : 'bg-gray-100 text-[#4D4D4D] hover:bg-gray-200'
            ]"
            @click="addTeacherTab = 'import'"
          >
            批量导入添加
          </button>
          <button
            :class="[
              'px-4 py-2 rounded-full text-sm transition-colors',
              addTeacherTab === 'manual' ? 'bg-[#FF9900] text-white' : 'bg-gray-100 text-[#4D4D4D] hover:bg-gray-200'
            ]"
            @click="addTeacherTab = 'manual'"
          >
            手动添加
          </button>
        </div>

        <!-- 批量导入内容 -->
        <div v-if="!isEditTeacher && addTeacherTab === 'import'" class="px-2">
          <div class="flex gap-4 mb-4">
            <button
              class="flex-1 h-[80px]  rounded-lg flex flex-col items-center justify-center gap-1 text-[#4D4D4D] hover:bg-[#FFF8F0] transition-colors"
              @click="triggerTeacherFileInput"
            >
              <span class="text-sm font-medium">导入教师信息</span>
              <span v-if="importTeacherFileName" class="text-xs text-[#FF9900] truncate max-w-[100px]">{{ importTeacherFileName }}</span>
            </button>
            <button
              class="flex-1 h-[80px] border border-gray-200 rounded-lg flex items-center justify-center text-[#4D4D4D] hover:bg-gray-50 transition-colors"
              @click="handleDownloadTeacherTemplate"
            >
              <span class="text-sm">下载导入模板</span>
            </button>
          </div>
          <input ref="teacherFileInputRef" type="file" accept=".xlsx,.xls" class="hidden" @change="handleTeacherFileChange" />
          <p class="text-sm text-[#999] mb-1">批量导入教师信息后，系统将自动创建教师账号</p>
          <p class="text-sm text-[#999]">该学校教师默认密码统一为：<span class="text-[#4D4D4D]">{{ teacherPassword || 'xxxxxxxx' }}</span></p>
        </div>

        <!-- 手动添加内容 -->
        <div v-if="isEditTeacher || addTeacherTab === 'manual'" class="px-2">
          <div class="space-y-4">
            <div>
              <MInput v-model="teacherForm.teacherName" placeholder="请输入教师姓名" />
              <p class="text-xs text-[#999] mt-1">*只支持中英文及数字的输入，最高限制15个字符</p>
            </div>
            <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <span class="px-3 py-2 bg-gray-50 text-[#4D4D4D] text-sm border-r border-gray-200">+86 ▾</span>
              <input
                v-model="teacherForm.phone"
                type="tel"
                placeholder="请输入教师手机号"
                class="flex-1 px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
          <p class="text-sm text-[#999] mt-4 mb-1">输入教师信息后，系统将自动创建教师账号</p>
          <p class="text-sm text-[#999]">该学校教师默认密码统一为：<span class="text-[#4D4D4D]">{{ teacherPassword || 'xxxxxxxx' }}</span></p>
        </div>

        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showTeacherModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmTeacher">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 删除教师确认弹窗 -->
    <MModal v-model="showDeleteTeacherModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showDeleteTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">{{ deleteTeacherConfirmText }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showDeleteTeacherModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmDeleteTeacher">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 重置教师密码确认弹窗 -->
    <MModal v-model="showResetTeacherModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showResetTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">{{ resetTeacherConfirmText }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showResetTeacherModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmResetTeacher">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 导入教师弹窗 -->
    <MModal v-model="showImportTeacherModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[300px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showImportTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">导入教师信息</h3>
        <div class="flex justify-center gap-3 mb-6">
          <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500 hover:bg-gray-300" @click="handleSelectTeacherFile">选择文件导入</button>
          <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500 hover:bg-gray-300" @click="handleDownloadTeacherTemplate">下载导入模版</button>
        </div>
        <p v-if="importTeacherFileName" class="text-sm text-[#4CB9CF] text-center mb-4">已选择：{{ importTeacherFileName }}</p>
        <p class="text-sm text-gray-400 flex-1">批量导入教师信息后，系统将自动创建教师账号，教师默认密码统一为：{{ teacherPassword }}</p>
        <div class="flex items-center justify-center gap-4 mt-auto pt-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showImportTeacherModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" :disabled="!importTeacherFile" :class="{ 'opacity-50 cursor-not-allowed': !importTeacherFile }" @click="handleConfirmImportTeacher">确定导入</button>
        </div>
        <input ref="teacherFileInputRef" type="file" accept=".xlsx,.xls" class="hidden" @change="handleTeacherFileChange" />
      </div>
    </MModal>

    <!-- 班级转让弹窗 -->
    <MModal v-model="showTransferTeacherModal" custom-width="500px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showTransferTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">班级转让</h3>
        
        <!-- 搜索框 -->
        <div class="mb-4">
          <MInput v-model="transferTeacherSearch" placeholder="请输入可转让教师姓名" clearable @enter="handleTransferTeacherSearchChange" @clear="handleTransferTeacherSearchChange">
            <template #suffix>
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MInput>
        </div>

        <!-- 教师列表表格 -->
        <div class="border border-gray-200 rounded-lg mb-4 max-h-[200px] overflow-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-3 py-2 text-left text-[#4D4D4D] font-medium">序号</th>
                <th class="px-3 py-2 text-left text-[#4D4D4D] font-medium">姓名</th>
                <th class="px-3 py-2 text-left text-[#4D4D4D] font-medium">账号</th>
                <th class="px-3 py-2 text-center text-[#4D4D4D] font-medium">选择</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(teacher, index) in filteredTransferTeachers" :key="teacher.userId" class="border-t border-gray-100">
                <td class="px-3 py-2 text-[#4D4D4D]">{{ index + 1 }}</td>
                <td class="px-3 py-2 text-[#4D4D4D]">{{ teacher.nickName }}</td>
                <td class="px-3 py-2 text-[#4D4D4D]">{{ teacher.userName }}</td>
                <td class="px-3 py-2 text-center">
                  <input
                    type="radio"
                    :checked="transferTeacherForm.targetTeacherId === teacher.userId"
                    class="w-4 h-4 accent-[#FF9900]"
                    @change="handleSelectTransferTeacher(teacher.userId)"
                  />
                </td>
              </tr>
              <tr v-if="filteredTransferTeachers.length === 0">
                <td colspan="4" class="px-3 py-4 text-center text-gray-400">暂无可转让教师</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 选择班级 -->
        <div class="mb-4">
          <p class="text-sm text-[#4D4D4D] mb-3">请选择要转让的班级</p>
          <div class="space-y-3">
            <MSelect v-model="transferClassForm.gradeId" :options="transferGradeOptions" placeholder="年级" @change="handleTransferGradeChange" />
            <MSelect v-model="transferClassForm.classId" :options="transferClassOptions" placeholder="班级" value-key="id" label-key="name" />
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showTransferTeacherModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmTransferTeacher">确定</button>
        </div>
      </div>
    </MModal>

    <!-- ==================== 班级管理弹窗 ==================== -->
    <!-- 添加学生弹窗 -->
    <MModal v-model="showCreateModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[428px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showCreateModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">添加学生</h3>
        <div class="flex justify-center gap-3 mb-6">
          <button :class="['w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors', addStudentMode === 'batch' ? 'bg-[#FF9900] text-white' : 'border border-gray-300 text-[#FF9900]']" @click="addStudentMode = 'batch'">批量导入添加</button>
          <button :class="['w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors', addStudentMode === 'manual' ? 'bg-[#FF9900] text-white' : 'border border-gray-300 text-[#FF9900]']" @click="addStudentMode = 'manual'">手动添加</button>
        </div>
        <template v-if="addStudentMode === 'batch'">
          <div class="flex justify-center gap-3 mb-6">
            <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500" @click="handleImportStudents">导入学生信息</button>
            <button class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500" @click="handleDownloadTemplate">下载导入模版</button>
          </div>
          <p class="text-sm text-gray-400 flex-1">批量导入学生信息后，系统将自动创建学生账号，该班级学生默认密码统一为：{{ studentPassword }}</p>
        </template>
        <template v-else>
          <div class="flex flex-col items-center gap-3 flex-1">
            <MInput v-model="createForm.name" placeholder="学生姓名" class="w-[275px]" />
            <p class="text-sm text-gray-400">学生默认密码为: {{ studentPassword }}</p>
          </div>
        </template>
        <div class="flex items-center justify-center gap-4 mt-auto pt-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showCreateModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleCreateStudent">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 创建班级弹窗 -->
    <MModal v-model="showCreateClassModal" custom-width="380px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showCreateClassModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ isEditClass ? "编辑班级" : "创建班级" }}</h3>
        <div class="space-y-4 px-2">
          <MSelect v-model="createClassForm.gradeId" :options="gradeOptions" placeholder="年级" />
          <MInput v-model="createClassForm.className" placeholder="班级" />
          <MInput v-model="createClassForm.teacherName" placeholder="老师" disabled />
        </div>
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showCreateClassModal = false">取消</button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmCreateClass">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 删除班级确认弹窗 -->
    <MModal v-model="showDeleteClassModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showDeleteClassModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">确认要删除此班级吗？</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showDeleteClassModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmDeleteClass">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 重置密码确认弹窗 -->
    <MModal v-model="showResetPasswordModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showResetPasswordModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">确认重置{{ resettingStudent?.studentName }}的密码吗？</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showResetPasswordModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmResetPassword">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 移班弹窗 -->
    <MModal v-model="showTransferModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showTransferModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">移班</h3>
        <div class="space-y-4 px-2">
          <MSelect v-model="transferForm.gradeId" :options="gradeOptions" placeholder="选择年级" @update:model-value="handleTransferGradeChange" />
          <MSelect v-model="transferForm.classId" :options="transferClassOptions" placeholder="选择班级" :disabled="!transferForm.gradeId" @change="handleTransferClassChange" />
        </div>
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showTransferModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmTransfer">确定</button>
        </div>
      </div>
    </MModal>


    <!-- 删除学生确认弹窗 -->
    <MModal v-model="showDeleteStudentModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showDeleteStudentModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">确认要删除{{ deletingStudent?.name }}吗？</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showDeleteStudentModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmDeleteStudent">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 批量重置密码确认弹窗 -->
    <MModal v-model="showBatchResetPasswordModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showBatchResetPasswordModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D] text-center px-4">确定将{{ selectedStudentNames }}学生的密码重置吗？</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showBatchResetPasswordModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmBatchResetPassword">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 批量删除确认弹窗 -->
    <MModal v-model="showBatchDeleteModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showBatchDeleteModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D] text-center px-4">确认删除选中的 {{ selectedStudentIds.length }} 名学生吗？</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showBatchDeleteModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmBatchDelete">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 批量移班弹窗 -->
    <MModal v-model="showBatchTransferModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showBatchTransferModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">批量移班</h3>
        <p class="text-sm text-gray-500 text-center mb-4">已选中{{ selectedStudentIds.length }}位学生，请选择所要移至的班级，完成批量移班</p>
        <div class="space-y-4 px-2">
          <MSelect v-model="batchTransferForm.gradeId" :options="gradeOptions" placeholder="选择年级" @update:model-value="handleBatchTransferGradeChange" />
          <MSelect v-model="batchTransferForm.classId" :options="batchTransferClassOptions" placeholder="选择班级" :disabled="!batchTransferForm.gradeId" />
        </div>
        <div class="flex items-center justify-center gap-4 mt-8">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showBatchTransferModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmBatchTransfer">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 新密码展示弹窗 -->
    <MModal v-model="showNewPasswordModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showNewPasswordModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex flex-col items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D] mb-2">密码重置成功</p>
          <p class="text-[18px] text-[#FF9900] font-medium">新密码：{{ newPassword }}</p>
        </div>
        <div class="flex items-center justify-center">
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="showNewPasswordModal = false">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 快捷登录弹窗 -->
    <MModal v-model="showQuickLoginModal" custom-width="420px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="p-6 relative">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showQuickLoginModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">启用快捷登录</h3>
        <p class="text-center text-[#4D4D4D] mb-6">学生可通过「快捷登录链接」免账号登录，或者使用「班级码+密码」登录。</p>
        <div class="flex items-center justify-center gap-2 text-[#999] text-sm mb-8">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>班级码使用期间，无法调整当前班级学生账号</span>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showQuickLoginModal = false">取消</button>
          <button class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmQuickLogin">创建</button>
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
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ isEditGroupMode ? '编辑小组' : '创建小组' }}</h3>
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
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <p class="text-[#4D4D4D] font-medium whitespace-nowrap">第二步：添加小组成员：<span class="text-[#FF9900] text-sm font-normal">（请记得选择组长哦）</span></p>
            <button class="px-4 py-2 bg-[#FF9900] text-white rounded-lg text-sm hover:bg-[#E68A00] whitespace-nowrap" @click="handleAddGroupMember">+ 添加成员</button>
          </div>
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
                    <input type="radio" :name="'group-leader'" :checked="groupForm.leaderId === member.id" class="w-4 h-4 accent-[#FF9900]" @change="groupForm.leaderId = member.id" />
                  </td>
                  <td class="px-3 py-2 text-center">
                    <button class="text-red-500 text-sm hover:text-red-600" @click="handleRemoveGroupMember(index)">删除</button>
                  </td>
                </tr>
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
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showGroupModal = false">取消</button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmGroup">确定</button>
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
        <div class="mb-2">
          <MInput v-model="memberSearchKeyword" placeholder="输入学生账号或姓名进行查找" clearable class="w-full" @enter="handleMemberSearch" @clear="handleMemberSearch">
            <template #prefix>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MInput>
        </div>
       
        <div class="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg">
          <table class="w-full">
            <thead class="bg-[#FFF1DD] sticky top-0">
              <tr>
                <th class="w-10 px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">
                  <input type="checkbox" :checked="isAllMemberSelected" class="w-4 h-4 accent-[#FF9900]" @change="toggleAllMemberSelection" />
                </th>
                <th class="w-16 px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">序号</th>
                <th class="px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">账号</th>
                <th class="px-2 py-3 text-left text-sm font-medium text-[#4D4D4D]">姓名</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(student, index) in filteredAvailableStudents" :key="student.id" class="border-b border-gray-100 last:border-b-0 hover:bg-[#FFF1DD] cursor-pointer" @click="toggleStudentSelection(student)">
                <td class="px-2 py-3">
                  <input type="checkbox" :checked="selectedMemberIds.includes(student.id)" class="w-4 h-4 accent-[#FF9900]" @click.stop @change="toggleStudentSelection(student)" />
                </td>
                <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ index + 1 }}</td>
                <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ student.studentNumber || '-' }}</td>
                <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ student.studentName || '-' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!filteredAvailableStudents.length" class="px-4 py-8 text-center text-gray-400">暂无可添加的学生</div>
        </div>
        <div v-if="selectedMemberIds.length" class="mt-3 p-3 bg-[#F5F5F5] rounded-lg">
          <div class="flex flex-wrap gap-2">
            <div v-for="id in selectedMemberIds" :key="id" class="group inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-[#4D4D4D] hover:border-[#FF9900] hover:bg-[#FFF1DD] cursor-pointer transition-colors">
              <span>{{ getStudentNameById(id) }}</span>
              <button class="w-4 h-4 items-center justify-center text-gray-400 hover:text-[#FF0000] transition-colors hidden group-hover:flex" @click="removeSelectedMember(id)">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-center gap-4 mt-6">
          <button class="w-[120px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showAddMemberModal = false">取消</button>
          <button class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmAddMembers">确定</button>
        </div>
      </div>
    </MModal>

    <!-- 删除小组确认弹窗 -->
    <MModal v-model="showDeleteGroupModal" custom-width="381px" :show-footer="false" :show-close="false" content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showDeleteGroupModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">提示</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">{{ isBatchDeleteGroup ? `确认要删除选中的${selectedGroupIds.length}个小组吗？` : `确认要删除"${deletingGroup?.name}"吗？` }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showDeleteGroupModal = false">取消</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmDeleteGroup">确定</button>
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
import { useSchoolUser, type Teacher } from '~/composables/api/useSchoolUser'

definePageMeta({
  layout: "default",
});

// 左侧教师导航（登录后请求一次并缓存）
const route = useRoute();
const { menuItems, loadMenus } = useTeacherNav();
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

// ==================== 左侧面板 Tab 导航 ====================
const activeNav = ref('teacher')
const navTabs = [
  { label: '教师管理', value: 'teacher' },
  { label: '班级管理', value: 'class' }
]

// Tab 切换处理 - 页面内切换，不跳转
const handleNavChange = (value: string) => {
  activeNav.value = value
  if (value === 'class') {
    loadClassList()
    loadGradeOptions()
    loadStudentPassword()
    loadQuickLoginStatus()
  }
}

// ==================== 教师管理相关 ====================
const teacherTabList = [{ label: '教师管理', value: 'teacher' }]
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


const teacherTableColumns = [
  { key: 'nickName', title: '教师姓名', minWidth: '100px' },
  { key: 'userName', title: '教师账号', minWidth: '120px' },
  { key: 'phonenumber', title: '手机号', minWidth: '120px' },
  { key: 'createTime', title: '创建时间', minWidth: '160px' },
  { key: 'action', title: '操作', width: '320px', align: 'center' as const }
]

// 教师弹窗
const showTeacherModal = ref(false)
const showDeleteTeacherModal = ref(false)
const showResetTeacherModal = ref(false)
const showImportTeacherModal = ref(false)
const showTransferTeacherModal = ref(false)

const isEditTeacher = ref(false)
const addTeacherTab = ref<'import' | 'manual'>('import')
const teacherForm = reactive({ id: '', orgId: '', teacherName: '', phone: '' })
const deleteTeacherConfirmText = ref('')
const deleteTeacherIds = ref<string[]>([])
const resetTeacherConfirmText = ref('')
const resetTeacherIds = ref<string[]>([])
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
  if (!transferTeacherSearch.value) return transferTeacherOptions.value
  const keyword = transferTeacherSearch.value.toLowerCase()
  return transferTeacherOptions.value.filter(t => 
    t.nickName?.toLowerCase().includes(keyword) || t.userName?.toLowerCase().includes(keyword)
  )
})

const handleTransferTeacherSearchChange = () => {
  // 搜索时自动过滤，computed 已处理
}

// 选择目标教师
const handleSelectTransferTeacher = (userId: string) => {
  transferTeacherForm.targetTeacherId = userId
}

const handleTransferGradeChange = async (gradeId: string) => {
  transferClassForm.classId = ''
  transferClassOptions.value = []
  // 根据年级获取班级列表
  const schoolId = schoolList.value?.[0]?.id || ''
  try {
    const classList = await schoolUserApi.transferClassList({
      teacherId: transferTeacherForm.teacherId,
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
    MMessage.error(error.message || '获取教师列表失败')
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
//     MMessage.success('下载成功')
//   } catch (error: any) {
//     MMessage.error(error.message || '下载失败')
//   }
// }

const handleConfirmTeacher = async () => {
  // 编辑模式或手动添加模式
  if (isEditTeacher.value || addTeacherTab.value === 'manual') {
    if (!teacherForm.teacherName.trim()) { MMessage.warning('请输入教师姓名'); return }
    if (!teacherForm.phone.trim()) { MMessage.warning('请输入手机号'); return }
    try {
      if (isEditTeacher.value) {
        await schoolUserApi.updateTeacher({ userId: teacherForm.id, nickName: teacherForm.teacherName, phonenumber: teacherForm.phone })
        MMessage.success('编辑成功')
      } else {
        // 获取第一个组织的 id 作为 orgId
        const orgId = schoolList.value?.[0]?.id || ''
        await schoolUserApi.createTeacher({ orgId, nickName: teacherForm.teacherName, phonenumber: teacherForm.phone })
        MMessage.success('创建成功')
      }
      showTeacherModal.value = false
      fetchTeacherList()
    } catch (error: any) { MMessage.error(error.message || '操作失败') }
  } else {
    // 批量导入模式
    if (!importTeacherFile.value) { MMessage.warning('请选择要导入的文件'); return }
    try {
      const orgId = schoolList.value?.[0]?.id || ''
      await schoolUserApi.importTeacher(importTeacherFile.value, orgId)
      MMessage.success('导入成功')
      showTeacherModal.value = false
      fetchTeacherList()
    } catch (error: any) { MMessage.error(error.message || '导入失败') }
  }
}

const handleDeleteTeacher = (row: Teacher) => {
  deleteTeacherIds.value = [row.userId]; deleteTeacherConfirmText.value = `确认要删除教师"${row.nickName}"吗？`
  showDeleteTeacherModal.value = true
}
const handleBatchDeleteTeacher = () => {
  if (selectedTeacherIds.value.length === 0) { MMessage.warning('请先选择要删除的教师'); return }
  deleteTeacherIds.value = [...selectedTeacherIds.value]
  deleteTeacherConfirmText.value = `确认要删除选中的 ${selectedTeacherIds.value.length} 位教师吗？`
  showDeleteTeacherModal.value = true
}
const handleConfirmDeleteTeacher = async () => {
  try {
    await schoolUserApi.deleteTeacher(deleteTeacherIds.value)
    MMessage.success('删除成功'); showDeleteTeacherModal.value = false; selectedTeacherIds.value = []; fetchTeacherList()
  } catch (error: any) { MMessage.error(error.message || '删除失败') }
}

const handleResetTeacherPassword = (row: Teacher) => {
  resetTeacherIds.value = [row.userId]; resetTeacherConfirmText.value = `确认重置教师"${row.nickName}"的密码吗？`
  showResetTeacherModal.value = true
}
const handleBatchResetTeacherPassword = () => {
  if (selectedTeacherIds.value.length === 0) { MMessage.warning('请先选择要重置密码的教师'); return }
  resetTeacherIds.value = [...selectedTeacherIds.value]
  resetTeacherConfirmText.value = `确认重置选中的 ${selectedTeacherIds.value.length} 位教师的密码吗？`
  showResetTeacherModal.value = true
}
const handleConfirmResetTeacher = async () => {
  try {
    await schoolUserApi.resetTeacherPassword(resetTeacherIds.value)
    MMessage.success('重置密码成功'); showResetTeacherModal.value = false
  } catch (error: any) { MMessage.error(error.message || '重置密码失败') }
}

const handleImportTeacher = () => { importTeacherFile.value = null; importTeacherFileName.value = ''; showImportTeacherModal.value = true }
const handleSelectTeacherFile = () => { teacherFileInputRef.value?.click() }
const handleTeacherFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement; const file = target.files?.[0]
  if (file) { importTeacherFile.value = file; importTeacherFileName.value = file.name }
  target.value = ''
}
const handleDownloadTeacherTemplate = async () => {
  try { await schoolUserApi.downloadTeacherTemplate(); MMessage.success('下载成功') }
  catch (error: any) { MMessage.error(error.message || '下载失败') }
}

const handleExportTeacher = async () => {
  try {
    await schoolUserApi.exportTeacherInfo()
    MMessage.success('导出成功')
  } catch (error: any) {
    MMessage.error(error.message || '导出失败')
  }
}
const handleConfirmImportTeacher = async () => {
  if (!importTeacherFile.value) { MMessage.warning('请先选择文件'); return }
  try {
     const orgId = schoolList.value?.[0]?.id || ''
    await schoolUserApi.importTeacher(importTeacherFile.value,orgId)
    MMessage.success('导入成功'); showImportTeacherModal.value = false; fetchTeacherList()
  } catch (error: any) { MMessage.error(error.message || '导入失败') }
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
    console.log(userList,'userList----获取用户列表用于班级转让')
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
  if (!transferTeacherForm.targetTeacherId) { MMessage.warning('请选择要转让的教师'); return }
  if (!transferClassForm.classId) { MMessage.warning('请选择要转让的班级'); return }
  try {
    const selectedClass = transferClassOptions.value.find((c: any) => c.id === transferClassForm.classId)
    await schoolUserApi.transferClass({ 
      teacherId: transferTeacherForm.teacherId, 
      targetTeacherId: transferTeacherForm.targetTeacherId as string,
      classId: transferClassForm.classId,
      schoolId: schoolList.value?.[0]?.id || '',
      className: selectedClass?.name || ''
    })
    MMessage.success('班级转让成功')
    showTransferTeacherModal.value = false
    fetchTeacherList()
  } catch (error: any) { MMessage.error(error.message || '班级转让失败') }
}

// ==================== 班级管理相关（从class页面复制） ====================
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
const isCurrentClassQuickLogin = computed(() => !!(quickLoginClassId.value && quickLoginClassId.value === selectedClass.value?.id));
const isOtherClassQuickLogin = computed(() => !!(quickLoginClassId.value && quickLoginClassId.value !== selectedClass.value?.id));

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

// ===== 班级管理事件处理 =====
const handleSelectAll = () => {
  selectedClass.value = null;
  MMessage.info("已选择全部班级");
};

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
    if (treeData.value.length > 0 && treeData.value[0].children?.length > 0) {
      const firstGrade = treeData.value[0];
      const firstClass = firstGrade.children[0];
      selectedClass.value = firstClass;
      if (!expandedKeys.value.includes(firstGrade.id)) {
        expandedKeys.value.push(firstGrade.id);
      }
      loadStudentList(firstClass.id);
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
    if (data && data.classCode) {
      quickLoginData.value = data;
      quickLoginClassId.value = data.classId;
      isQuickLoginEnabled.value = true;
    }
  } catch (error) {
    console.error("获取快捷登录状态失败:", error);
  }
};

const handleTreeSelect = (node: any) => {
  if (!node.children) {
    selectedClass.value = node;
    loadStudentList(node.id);
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
      MMessage.success(`已删除班级：${deletingClass.value.name}`);
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
  if (!createClassForm.gradeId) { MMessage.error("请选择年级"); return; }
  if (!createClassForm.className) { MMessage.error("请输入班级名称"); return; }
  const selectedGrade = gradeOptions.value.find((item) => item.value === createClassForm.gradeId);
  try {
    if (isEditClass.value && editingClassId.value) {
      await updateClass({ id: editingClassId.value, className: createClassForm.className, grade: Number(createClassForm.gradeId), gradeName: selectedGrade?.label || "" });
      MMessage.success("编辑班级成功");
    } else {
      await createClass({ className: createClassForm.className, grade: Number(createClassForm.gradeId), gradeName: selectedGrade?.label || "" });
      MMessage.success("创建班级成功");
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
      MMessage.info("快捷登录已停用");
    } catch (error) { console.error("停用快捷登录失败:", error); }
  } else if (!isOtherClassQuickLogin.value) {
    showQuickLoginModal.value = true;
  }
};

const handleConfirmQuickLogin = async () => {
  if (!selectedClass.value?.id) { MMessage.error("请先选择班级"); return; }
  try {
    const data = await createQuickLogin(selectedClass.value.id);
    quickLoginData.value = data || {};
    quickLoginClassId.value = selectedClass.value.id;
    MMessage.success("快捷登录已启用");
    isQuickLoginEnabled.value = true;
    showQuickLoginModal.value = false;
  } catch (error) { console.error("创建快捷登录失败:", error); }
};

const copyToClipboard = async (text?: string) => {
  if (!text) return;
  try { await navigator.clipboard.writeText(text); MMessage.success("复制成功"); }
  catch (error) { MMessage.error("复制失败"); }
};

const handleRefreshQuickLogin = async () => {
  if (!selectedClass.value?.id) return;
  try {
    const data = await createQuickLogin(selectedClass.value.id);
    quickLoginData.value = data || {};
    MMessage.success("已刷新");
  } catch (error) { console.error("刷新快捷登录失败:", error); }
};

const handleExport = async () => {
  try {
    MMessage.info("正在导出学生信息...");
    await exportStudentInfo();
    MMessage.success("导出成功");
  } catch (error) { console.error("导出失败:", error); MMessage.error("导出失败"); }
};

const handleBatchAction = () => {
  if (activeAction.value === "batch") { activeAction.value = null; selectedStudentIds.value = []; MMessage.info("已退出批量操作模式"); }
  else { activeAction.value = "batch"; MMessage.info("已进入批量操作模式，请勾选学生"); }
};

const handleStudentSelect = (keys: (string | number)[], rows: any[]) => { selectedStudentIds.value = keys.map((k) => String(k)); };
const handleStudentSelectAll = (selected: boolean) => {
  if (selected) { selectedStudentIds.value = studentList.value.map((s) => String(s.id)); }
  else { selectedStudentIds.value = []; }
};
const handleSelectAllToggle = (e: Event) => { handleStudentSelectAll((e.target as HTMLInputElement).checked); };

const handleBatchDelete = () => {
  if (selectedStudentIds.value.length === 0) { MMessage.warning("暂未选择任何学生，请在列表左侧进行勾选"); return; }
  showBatchDeleteModal.value = true;
};

const handleConfirmBatchDelete = async () => {
  try {
    await removeStudent(selectedStudentIds.value.map(String));
    MMessage.success(`已删除 ${selectedStudentIds.value.length} 名学生`);
    selectedStudentIds.value = [];
    loadStudentList();
  } catch (error) { console.error("批量删除失败:", error); }
  finally { showBatchDeleteModal.value = false; }
};

const handleBatchTransfer = () => {
  if (selectedStudentIds.value.length === 0) { MMessage.warning("暂未选择任何学生，请在列表左侧进行勾选"); return; }
  batchTransferForm.gradeId = null;
  batchTransferForm.classId = null;
  showBatchTransferModal.value = true;
};

const handleConfirmBatchTransfer = async () => {
  if (!batchTransferForm.gradeId) { MMessage.error("请选择年级"); return; }
  if (!batchTransferForm.classId) { MMessage.error("请选择班级"); return; }
  const targetClass = batchTransferClassList.value.find((c: any) => c.id === batchTransferForm.classId);
  try {
    await transferClass({ ids: selectedStudentIds.value.map(String), classId: batchTransferForm.classId as string, teacherId: targetClass?.teacherId || "" });
    MMessage.success(`已将 ${selectedStudentIds.value.length} 名学生移至新班级`);
    loadStudentList();
  } catch (error) { console.error("批量移班失败:", error); }
  finally { showBatchTransferModal.value = false; }
};

const batchTransferClassOptions = computed(() => batchTransferClassList.value.map((cls: any) => ({ label: cls.className, value: cls.id })));

const handleBatchResetPassword = () => {
  if (selectedStudentIds.value.length === 0) { MMessage.warning("暂未选择任何学生，请在列表左侧进行勾选"); return; }
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
  if (!transferForm.gradeId) { MMessage.error("请选择年级"); return; }
  if (!transferForm.classId) { MMessage.error("请选择班级"); return; }
  if (!transferringStudent.value) { showTransferModal.value = false; return; }
  try {
    await transferClass({ ids: [transferringStudent.value.id], classId: transferForm.id as string, teacherId: transferForm.teacherId || "" });
    MMessage.success(`已将 ${transferringStudent.value.studentName} 移至新班级`);
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
    MMessage.success(`已删除学生：${deletingStudent.value.studentName}`);
    loadStudentList();
  } catch (error) { console.error("删除学生失败:", error); }
  finally { showDeleteStudentModal.value = false; deletingStudent.value = null; }
};

// 导入学生信息
const handleImportStudents = () => {
  if (!selectedClass.value?.id) { MMessage.error("请先选择班级"); return; }
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
      loadStudentList();
      showCreateModal.value = false;
    } catch (error: any) { console.error("导入失败:", error); MMessage.error(error.message || "导入失败"); }
  };
  input.click();
};

const handleDownloadTemplate = async () => {
  try { MMessage.info("正在下载导入模板..."); await downloadTemplate(); MMessage.success("下载成功"); }
  catch (error) { console.error("下载失败:", error); MMessage.error("下载失败"); }
};

const handleCreateStudent = async () => {
  if (addStudentMode.value === "manual") {
    if (!selectedClass.value?.id) { MMessage.error("请先选择班级"); return; }
    if (!createForm.name) { MMessage.error("请填写学生姓名"); return; }
    try {
      await addStudent({ classId: selectedClass.value.id, studentName: createForm.name });
      MMessage.success("创建学生成功");
      loadStudentList();
    } catch (error) { console.error("创建学生失败:", error); return; }
  } else { MMessage.success("批量导入成功"); }
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
  if (!selectedClass.value?.id) { MMessage.warning("请先选择班级"); return; }
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
  } catch (error) { console.error("获取小组成员失败:", error); MMessage.error("获取小组成员失败"); }
};

const handleConfirmGroup = async () => {
  if (!groupForm.name.trim()) { MMessage.warning("请输入小组名称"); return; }
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
      MMessage.success("编辑成功");
    } else {
      const addData = {
        classId: selectedClass.value?.id || "", teamName: groupForm.name, remarks: groupForm.remarks || undefined,
        studentList: groupForm.members.map((m) => ({ studentNumber: m.studentNumber, studentName: m.studentName, isLeader: m.id === groupForm.leaderId ? 0 : 1 })) as { studentNumber: string; studentName: string; isLeader: 0 | 1 }[],
      };
      await addGroup(addData);
      MMessage.success("创建成功");
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

const handleMemberSearch = () => {};
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
      MMessage.success("批量删除成功");
      selectedGroupIds.value = [];
    } else {
      if (deletingGroup.value?.id) { await deleteGroup([deletingGroup.value.id]); MMessage.success("删除成功"); }
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
  if (!selectedGroupIds.value.length) { MMessage.warning("请先选择要删除的小组"); return; }
  isBatchDeleteGroup.value = true;
  showDeleteGroupModal.value = true;
};

const handleGroupSelect = (keys: (string | number)[], rows: any[]) => { selectedGroupIds.value = keys.map((k) => String(k)); };
const handleGroupSelectAll = (selected: boolean) => {
  if (selected) { selectedGroupIds.value = groupList.value.map((item) => item.id); }
  else { selectedGroupIds.value = []; }
};
const handleGroupSelectAllToggle = (e: Event) => { handleGroupSelectAll((e.target as HTMLInputElement).checked); };

// 监听Tab切换，加载对应数据
watch(activeTab, (newTab) => {
  if (newTab === "group" && selectedClass.value?.id) { loadGroupList(); }
});

// 初始化
onMounted(() => {
  loadMenus();
  fetchTeacherList();
//   fetchTeacherPassword();
  fetchSchoolInfo();
});
</script>


<style scoped>
.user-page {
  height: calc(100vh - 70px - 20px);
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 20px;
  display: flex;
  justify-content: center;
  overflow: hidden;
  max-width: 100vw;
}

@media (min-width: 768px) {
  .user-page {
    height: calc(100vh - 70px - 30px);
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 30px;
  }
}

@media (min-width: 1024px) {
  .user-page {
    padding-left: 20px;
    padding-right: 20px;
  }
}

@media (min-width: 1200px) {
  .user-page {
    padding-left: 24px;
    padding-right: 24px;
  }
}

@media (min-width: 1280px) {
  .user-page {
    padding-left: 30px;
    padding-right: 30px;
  }
}

@media (min-width: 1400px) {
  .user-page {
    padding-left: 40px;
    padding-right: 40px;
  }
}

@media (min-width: 1536px) {
  .user-page {
    padding-left: 60px;
    padding-right: 60px;
  }
}

.main-panel {
  overflow: hidden;
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
</style>
