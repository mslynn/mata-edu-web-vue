<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <button class="close-btn" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <h2 class="modal-title">学生管理</h2>
      
      <div class="modal-header">
        <MTabs v-model="activeTab" :tabs="tabList">
          <template #tab-student>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <span>学生管理</span>
          </template>
          <template #tab-group>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>小组管理</span>
          </template>
        </MTabs>
        
        <div class="header-right">
          <MInput 
            v-if="activeTab === 'student'"
            v-model="searchKeyword" 
            placeholder="请输入学生账号及学生姓名"
            clearable
            class="search-input"
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </template>
          </MInput>
          <MInput 
            v-else
            v-model="groupSearchKeyword" 
            placeholder="请输入小组名称及学生姓名"
            clearable
            class="search-input"
          >
            <template #prefix>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </template>
          </MInput>
          <MButton v-if="activeTab === 'student'" type="text" class="quick-login-btn" @click="toggleQuickLogin">
            {{ quickLoginEnabled ? '停用快捷登录' : '启用快捷登录' }}
          </MButton>
        </div>
      </div>
      
      <!-- 学生管理内容 -->
      <template v-if="activeTab === 'student'">
        <div class="quick-login-bar">
          <span class="bar-label">学生快捷登录方式：</span>
          <span class="new-tag">NEW</span>
          <span class="bar-item">快捷登录链接：</span>
          <MButton type="text" size="small" class="copy-btn" @click="copyLoginLink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>复制</span>
          </MButton>
          <span class="bar-item">班级码：<strong>{{ classCode }}</strong></span>
          <span class="bar-item">统一登录密码：<strong>{{ loginPassword }}</strong></span>
          <MButton type="text" size="small" class="copy-btn" @click="copyClassInfo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span>复制</span>
          </MButton>
          <span class="bar-item expire-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
            （有效时长为2小时，{{ expireTime }}过期）
          </span>
        </div>
        
        <div class="stats-bar-wrapper">
          <div class="stats-bar">
            <span>已登录：<span class="count logged">{{ loggedCount }}</span> 人</span>
            <span>未登录：<span class="count not-logged">{{ notLoggedCount }}</span> 人</span>
          </div>
          <MButton type="default" size="small" @click="refreshList">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </MButton>
        </div>
        
        <div class="table-wrapper">
          <MTable :columns="studentColumns" :data="filteredStudents" row-key="id" show-index>
            <template #loginStatus="{ row }">
              <span :class="['status', row.loginStatus === 1 ? 'logged' : 'not-logged']">
                {{ row.loginStatus === 1 ? '已登录' : '未登录' }}
              </span>
            </template>
          </MTable>
        </div>
      </template>
      
      <!-- 小组管理内容 -->
      <template v-else>
        <div class="group-action-bar">
          <div class="stats-bar">
            <span>小组数量：<span class="count primary">{{ groups.length }}</span> 组</span>
          </div>
          <div class="action-btns">
            <button 
              :class="[
                'h-[36px] px-4 flex items-center justify-center gap-1 rounded-[20px] text-sm whitespace-nowrap transition-colors',
                groupActiveAction === 'batch'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#FF9900] text-white hover:bg-[#E68A00]'
              ]"
              :disabled="groupActiveAction === 'batch'"
              @click="handleCreateGroup"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>创建小组</span>
            </button>
            <button 
              :class="[
                'h-[36px] px-4 flex items-center justify-center rounded-[20px] text-sm whitespace-nowrap transition-colors',
                groupActiveAction === 'batch'
                  ? 'bg-[#FF9900] text-white'
                  : 'bg-[#FFF1DD] text-[#4D4D4D] hover:bg-[#FFE4B8]'
              ]"
              @click="handleGroupBatchAction"
            >
              {{ groupActiveAction === 'batch' ? '取消批量' : '批量操作' }}
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
            <template #description="{ row }">
              {{ row.description || '-' }}
            </template>
            <template #action="{ row }">
              <div class="action-cell whitespace-nowrap">
                <button 
                  :class="[
                    'px-3 py-1 text-sm border rounded-[7px] transition-colors',
                    groupActiveAction === 'batch'
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900]'
                  ]"
                  :disabled="groupActiveAction === 'batch'"
                  @click="handleEditGroup(row)"
                >编辑</button>
                <button 
                  :class="[
                    'ml-2 px-3 py-1 text-sm border rounded-[7px] transition-colors',
                    groupActiveAction === 'batch'
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-[#FF0000] border-[#CBCBCB] hover:border-[#FF0000]'
                  ]"
                  :disabled="groupActiveAction === 'batch'"
                  @click="handleDeleteGroup(row)"
                >删除</button>
              </div>
            </template>
          </MTable>
        </div>

        <!-- 批量操作栏 -->
        <div v-if="groupActiveAction === 'batch'"
          class="flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] rounded-lg">
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" :checked="isAllGroupSelected" class="w-4 h-4 accent-[#FF9900]"
                @change="handleGroupSelectAllToggle" />
              <span class="text-sm text-[#4D4D4D]">全选</span>
            </label>
            <span class="text-sm text-[#4D4D4D]">
              已选择 <span class="text-[#FF9900]">{{ selectedGroupIds.length }}</span> 项
            </span>
          </div>
          <div class="flex items-center gap-4">
            <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleBatchDeleteGroup">
              批量删除
            </button>
            <button class="text-sm text-[#4D4D4D] hover:text-[#FF9900]" @click="handleGroupBatchAction">
              取消批量
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>

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
        <p class="text-[16px] text-[#4D4D4D]">
          {{ isBatchDeleteGroup ? `确定要删除选中的 ${selectedGroupIds.length} 个小组吗？` : `确定要删除小组"${deletingGroup?.name}"吗？` }}
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

  <!-- 启用快捷登录弹窗 -->
  <MModal v-model="showQuickLoginModal" custom-width="420px" :show-footer="false" :show-close="false" content-class="!p-0">
    <div class="p-6 relative">
      <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showQuickLoginModal = false">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
        启用学生快捷登录
      </h3>
      <p class="text-center text-[#4D4D4D] mb-6">
        启用后，学生可通过班级码和统一密码快速登录，无需单独注册账号。
      </p>
      <div class="flex items-center justify-center gap-2 text-[#999] text-sm mb-8">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>快捷登录有效期为2小时，过期后需重新启用</span>
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

  <!-- 停用快捷登录弹窗 -->
  <MModal v-model="showDisableQuickLoginModal" custom-width="420px" :show-footer="false" :show-close="false" content-class="!p-0">
    <div class="p-6 relative">
      <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showDisableQuickLoginModal = false">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">
        停用快捷登录
      </h3>
      <p class="text-center text-[#4D4D4D] mb-6">
        停用后，快捷登录方式失效，是否确定停用？
      </p>
      <div class="flex items-center justify-center gap-2 text-[#999] text-sm mb-8">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>已经登录的学生不会退出登录</span>
      </div>
      <div class="flex items-center justify-center gap-4">
        <button class="w-[136px] h-[44px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
          @click="showDisableQuickLoginModal = false">
          取消
        </button>
        <button class="w-[136px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
          @click="handleConfirmDisableQuickLogin">
          确定
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
            <MInput v-model="groupForm.name" placeholder="请输入小组名称" class="w-[280px]" />
          </div>
          <div class="flex items-center gap-2 whitespace-nowrap">
            <span class="text-transparent">*</span>
            <span class="text-[#4D4D4D]">小组描述：</span>
            <MInput v-model="groupForm.remarks" placeholder="请输入小组描述" class="w-[280px]" />
          </div>
        </div>
      </div>

      <!-- 第二步：添加小组成员 -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <p class="text-[#4D4D4D] font-medium whitespace-nowrap">
            第二步：添加小组成员<span class="text-[#FF9900] text-sm font-normal">（记得选择组长哦）</span>
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
                <th class="px-3 py-2 text-center text-sm font-medium text-[#4D4D4D]">是否组长</th>
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
                    name="group-leader"
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
          placeholder="请输入学生账号或姓名搜索"
          clearable
          class="w-full"
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
        共 {{ filteredAvailableStudents.length }} 名学生
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
              <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ student.account || '-' }}</td>
              <td class="px-2 py-3 text-sm text-[#4D4D4D]">{{ student.name || '-' }}</td>
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
              @click.stop="removeSelectedMember(id)"
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
</template>


<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { MMessage } from '~/components/ui'

interface Student {
  id: string
  name: string
  account: string
  createTime: string
  loginStatus: number
}

interface Group {
  id: string
  name: string
  leaderName: string
  members: string
  description: string
  createTime: string
}

interface GroupMember {
  id: string
  studentNumber: string
  studentName: string
}

defineProps<{
  visible: boolean
}>()

defineEmits<{
  close: []
}>()

const activeTab = ref('student')
const searchKeyword = ref('')
const groupSearchKeyword = ref('')
const quickLoginEnabled = ref(true)
const showQuickLoginModal = ref(false)
const showDisableQuickLoginModal = ref(false)
const classCode = ref('75688')
const loginPassword = ref('518222')
const expireTime = ref('19:41')

// 小组弹窗相关
const showGroupModal = ref(false)
const showAddMemberModal = ref(false)
const showDeleteGroupModal = ref(false)
const isEditGroupMode = ref(false)
const isBatchDeleteGroup = ref(false)
const memberSearchKeyword = ref('')
const selectedMemberIds = ref<string[]>([])
const selectedGroupIds = ref<string[]>([])
const deletingGroup = ref<Group | null>(null)
type GroupActionType = 'batch' | null
const groupActiveAction = ref<GroupActionType>(null)

const groupForm = reactive({
  id: '',
  name: '',
  remarks: '',
  leaderId: '',
  members: [] as GroupMember[]
})

const tabList = [
  { label: '学生管理', value: 'student' },
  { label: '小组管理', value: 'group' }
]

const studentColumns = [
  { key: 'name', title: '学生姓名' },
  { key: 'account', title: '学生账号' },
  { key: 'createTime', title: '创建时间' },
  { key: 'loginStatus', title: '班级码登录状态' }
]

const groupColumns = [
  { key: 'name', title: '小组名称' },
  { key: 'leaderName', title: '组长姓名' },
  { key: 'members', title: '组内成员' },
  { key: 'description', title: '描述' },
  { key: 'createTime', title: '创建时间' },
  { key: 'action', title: '操作', width: '140px' }
]

const students = ref<Student[]>([
  { id: '1', name: '1', account: '4285154', createTime: '2025-12-11 09:28:25', loginStatus: 0 },
  { id: '2', name: '34', account: '42853415', createTime: '2025-12-09 11:26:25', loginStatus: 0 },
  { id: '3', name: '12', account: '42851233', createTime: '2025-12-09 11:26:20', loginStatus: 0 },
  { id: '4', name: '11', account: '42851137', createTime: '2025-12-09 11:26:15', loginStatus: 0 },
  { id: '5', name: '9', account: '4285931', createTime: '2025-12-09 11:26:12', loginStatus: 0 },
  { id: '6', name: '7', account: '4285731', createTime: '2025-12-09 11:26:08', loginStatus: 0 },
  { id: '7', name: '4', account: '4285432', createTime: '2025-12-09 11:14:55', loginStatus: 0 },
  { id: '8', name: '2', account: '4285236', createTime: '2025-12-09 11:14:51', loginStatus: 0 },
  { id: '9', name: '1', account: '4285153', createTime: '2025-12-09 11:14:47', loginStatus: 0 }
])

const groups = ref<Group[]>([
  { id: '1', name: '1', leaderName: '1', members: '1,2', description: '', createTime: '2025-12-11 15:01' }
])

const filteredStudents = computed(() => {
  if (!searchKeyword.value) return students.value
  const keyword = searchKeyword.value.toLowerCase()
  return students.value.filter(s => 
    s.name.toLowerCase().includes(keyword) || 
    s.account.toLowerCase().includes(keyword)
  )
})

const filteredGroups = computed(() => {
  if (!groupSearchKeyword.value) return groups.value
  const keyword = groupSearchKeyword.value.toLowerCase()
  return groups.value.filter(g => 
    g.name.toLowerCase().includes(keyword) || 
    g.leaderName.toLowerCase().includes(keyword)
  )
})

// 可添加的学生（排除已添加的成员）
const filteredAvailableStudents = computed(() => {
  const addedIds = groupForm.members.map(m => m.id)
  const filtered = students.value.filter(s => !addedIds.includes(s.id))
  const keyword = memberSearchKeyword.value.trim().toLowerCase()
  if (!keyword) return filtered
  return filtered.filter(s => 
    s.name.toLowerCase().includes(keyword) || 
    s.account.toLowerCase().includes(keyword)
  )
})

// 是否全选
const isAllMemberSelected = computed(() => {
  return filteredAvailableStudents.value.length > 0 && 
    filteredAvailableStudents.value.every(s => selectedMemberIds.value.includes(s.id))
})

// 小组是否全选
const isAllGroupSelected = computed(() => {
  return filteredGroups.value.length > 0 && 
    filteredGroups.value.every(g => selectedGroupIds.value.includes(g.id))
})

const loggedCount = computed(() => students.value.filter(s => s.loginStatus === 1).length)
const notLoggedCount = computed(() => students.value.filter(s => s.loginStatus !== 1).length)

const toggleQuickLogin = () => {
  if (quickLoginEnabled.value) {
    // 停用快捷登录 - 显示确认弹窗
    showDisableQuickLoginModal.value = true
  } else {
    // 启用快捷登录 - 显示弹窗
    showQuickLoginModal.value = true
  }
}

// 确认启用快捷登录
const handleConfirmQuickLogin = () => {
  quickLoginEnabled.value = true
  showQuickLoginModal.value = false
  // TODO: 调用接口启用快捷登录
}

// 确认停用快捷登录
const handleConfirmDisableQuickLogin = () => {
  quickLoginEnabled.value = false
  showDisableQuickLoginModal.value = false
  // TODO: 调用接口停用快捷登录
}

const copyLoginLink = () => {
  const link = `${window.location.origin}/login?classCode=${classCode.value}`
  navigator.clipboard.writeText(link)
  alert('登录链接已复制')
}

const copyClassInfo = () => {
  const text = `班级码：${classCode.value}\n统一登录密码：${loginPassword.value}`
  navigator.clipboard.writeText(text)
  alert('班级信息已复制')
}

const refreshList = () => {
  console.log('刷新学生列表')
}

// 创建小组
const handleCreateGroup = () => {
  isEditGroupMode.value = false
  groupForm.id = ''
  groupForm.name = ''
  groupForm.remarks = ''
  groupForm.leaderId = ''
  groupForm.members = []
  showGroupModal.value = true
}

// 编辑小组
const handleEditGroup = (row: Group) => {
  isEditGroupMode.value = true
  groupForm.id = row.id
  groupForm.name = row.name
  groupForm.remarks = row.description || ''
  groupForm.leaderId = ''
  groupForm.members = []
  // TODO: 从接口获取小组成员详情
  showGroupModal.value = true
}

// 确认创建/编辑小组
const handleConfirmGroup = () => {
  if (!groupForm.name.trim()) {
    alert('请输入小组名称')
    return
  }
  console.log('保存小组', groupForm)
  showGroupModal.value = false
  // TODO: 调用接口保存
}

// 添加成员
const handleAddGroupMember = () => {
  memberSearchKeyword.value = ''
  selectedMemberIds.value = []
  showAddMemberModal.value = true
}

// 移除成员
const handleRemoveGroupMember = (index: number) => {
  const removed = groupForm.members.splice(index, 1)[0]
  if (removed && groupForm.leaderId === removed.id) {
    groupForm.leaderId = groupForm.members.length > 0 ? groupForm.members[0]?.id || '' : ''
  }
}

// 切换学生选择
const toggleStudentSelection = (student: Student) => {
  const index = selectedMemberIds.value.indexOf(student.id)
  if (index > -1) {
    selectedMemberIds.value.splice(index, 1)
  } else {
    selectedMemberIds.value.push(student.id)
  }
}

// 全选/取消全选
const toggleAllMemberSelection = () => {
  if (isAllMemberSelected.value) {
    selectedMemberIds.value = []
  } else {
    selectedMemberIds.value = filteredAvailableStudents.value.map(s => s.id)
  }
}

// 移除已选成员
const removeSelectedMember = (id: string) => {
  const index = selectedMemberIds.value.indexOf(id)
  if (index > -1) {
    selectedMemberIds.value.splice(index, 1)
  }
}

// 根据ID获取学生姓名
const getStudentNameById = (id: string) => {
  const student = students.value.find(s => s.id === id)
  return student?.name || id
}

// 确认添加成员
const handleConfirmAddMembers = () => {
  const newMembers = students.value
    .filter(s => selectedMemberIds.value.includes(s.id))
    .map(s => ({
      id: s.id,
      studentNumber: s.account,
      studentName: s.name
    }))
  groupForm.members.push(...newMembers)
  
  // 如果没有组长且有成员，默认第一个为组长
  if (!groupForm.leaderId && groupForm.members.length > 0) {
    groupForm.leaderId = groupForm.members[0]?.id || ''
  }
  showAddMemberModal.value = false
}

// 小组批量操作
const handleGroupBatchAction = () => {
  if (groupActiveAction.value === 'batch') {
    groupActiveAction.value = null
    selectedGroupIds.value = []
  } else {
    groupActiveAction.value = 'batch'
  }
}

// 小组选择
const handleGroupSelect = (keys: (string | number)[]) => {
  selectedGroupIds.value = keys.map(k => String(k))
}

// 小组全选
const handleGroupSelectAll = (checked: boolean) => {
  if (checked) {
    selectedGroupIds.value = filteredGroups.value.map(g => g.id)
  } else {
    selectedGroupIds.value = []
  }
}

// 小组全选切换
const handleGroupSelectAllToggle = () => {
  if (isAllGroupSelected.value) {
    selectedGroupIds.value = []
  } else {
    selectedGroupIds.value = filteredGroups.value.map(g => g.id)
  }
}

// 删除小组
const handleDeleteGroup = (row: Group) => {
  isBatchDeleteGroup.value = false
  deletingGroup.value = row
  showDeleteGroupModal.value = true
}

// 批量删除小组
const handleBatchDeleteGroup = () => {
  if (selectedGroupIds.value.length === 0) {
    MMessage.warning('请先选择要删除的小组')
    return
  }
  isBatchDeleteGroup.value = true
  showDeleteGroupModal.value = true
}

// 确认删除小组
const handleConfirmDeleteGroup = () => {
  if (isBatchDeleteGroup.value) {
    groups.value = groups.value.filter(g => !selectedGroupIds.value.includes(g.id))
    selectedGroupIds.value = []
    groupActiveAction.value = null
  } else if (deletingGroup.value) {
    groups.value = groups.value.filter(g => g.id !== deletingGroup.value?.id)
  }
  showDeleteGroupModal.value = false
  // TODO: 调用接口删除
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 1200px;
  height: 700px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #F5F5F5;
  color: #666;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
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
  width: 260px;
}

.quick-login-btn {
  color: #FF9900 !important;
}

.quick-login-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FFF7E6;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.bar-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.new-tag {
  padding: 2px 8px;
  background: #FF9900;
  border-radius: 4px;
  font-size: 11px;
  color: white;
  font-weight: 600;
}

.bar-item {
  font-size: 13px;
  color: #666;
}

.bar-item strong {
  color: #333;
  font-weight: 600;
}

.copy-btn {
  color: #3EAEFF !important;
}

.expire-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
}

.expire-info svg {
  stroke: #999;
}

.stats-bar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stats-bar {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #666;
}

.count {
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.count.logged {
  color: #3EAEFF;
  background: #E6F7FF;
}

.count.not-logged {
  color: #999;
  background: #F5F5F5;
}

.count.primary {
  color: #3EAEFF;
  background: #E6F7FF;
}

.group-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.action-btns {
  display: flex;
  gap: 12px;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  border-radius: 8px;
}

.status {
  font-size: 13px;
}

.status.logged {
  color: #52C41A;
}

.status.not-logged {
  color: #999;
}

.action-cell {
  display: flex;
  gap: 8px;
}
</style>
