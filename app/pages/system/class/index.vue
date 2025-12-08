<template>
  <div class="class-page flex bg-[#FAFAFA]">
    <!-- 左侧教师导航（固定） -->
    <aside class="teacher-nav hidden lg:flex w-[220px] xl:w-[260px] 2xl:w-[295px] flex-col flex-shrink-0">

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
              : 'text-gray-700 hover:bg-gray-50 cursor-pointer text-sm'
          ]"
          :style="isActiveItem(item) ? { fontSize: '20px' } : {}"
          @click="!isActiveItem(item) && go(item.path)"
        >
          <div class="w-9 h-9 flex items-center justify-center">
            <img
              v-if="item.icon || item.iconSelected"
              :src="isActiveItem(item) ? (item.iconSelected || item.icon) : item.icon"
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
      <section class="grade-panel w-full lg:w-[280px] xl:w-[309px] flex-shrink-0 p-3 flex flex-col">
        <MButton 
          type="primary" 
          class="mb-3 w-[142px] h-[50px] flex-shrink-0" 
          size="small" 
          @click="handleSelectAll"
          style="border-radius: 20px; font-size: 16px; background-color: #FF9900; border-color: #FF9900;"
        >
          全部班级
        </MButton>
        <div class="bg-[#FFFFFF] shadow-sm flex-1 flex flex-col min-h-0">
          <!-- 有数据时显示树 -->
          <template v-if="treeData.length">
            <div class="flex-1 overflow-y-auto p-2">
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
                        class="w-6 h-6 cursor-pointer"
                        @click.stop="handleEditClass(node)"
                      />
                      <img
                        src="~/assets/images/del.png"
                        alt="删除"
                        class="w-6 h-6 cursor-pointer"
                        @click.stop="handleDeleteClass(node)"
                      />
                    </div>
                  </template>
                </template>
              </MTree>
            </div>
            <!-- 创建班级按钮固定在底部 -->
            <div class="flex-shrink-0 p-3 border-t border-gray-100 flex justify-center">
              <button 
                class="w-[142px] h-[50px] flex items-center justify-center gap-2 bg-[#FF9900] text-white rounded-[20px] text-[16px]"
                @click="handleCreateNewClass(null)"
              >
                <span class="text-xl">+</span>
                <span>创建班级</span>
              </button>
            </div>
          </template>
          <!-- 无数据时显示空状态 -->
          <div v-else class="flex-1 flex flex-col items-center justify-center p-4">
            <p class="text-gray-400 text-sm mb-6">暂无班级记录</p>
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
      <section class="main-panel flex-1 min-w-0 p-4">
        <!-- Tab 切换 -->
        <MTabs
          v-model="activeTab"
          :tabs="tabList"
          class="mb-4"
        />

        <!-- 搜索 + 操作按钮 + 表格 -->
        <div class="bg-[#FFFFFF] rounded-lg p-4">
          <!-- 搜索 + 统一密码 + 操作按钮 -->
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <!-- 左侧：搜索框 + 提示 -->
            <div class="flex items-center gap-3">
              <MInput
                v-model="searchKeyword"
                placeholder="输入学生账号或姓名进行查找"
                clearable
                class="w-[200px] xl:w-[270px]"
                @enter="handleSearch"
              >
                <template #prefix>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </template>
              </MInput>
              <span class="hidden lg:inline-block w-[180px] xl:w-[200px] text-sm text-[#CBCBCB]">学生统一密码为：msa0987e</span>
            </div>
            <!-- 右侧：按钮组 -->
            <div class="flex items-center gap-2 xl:gap-3">
              <button 
                class="w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap bg-[#FF9900] text-white"
                @click="handleCreateAction()"
              >+ 创建学生</button>
              <button 
                :class="[
                  'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'quickLogin' ? 'bg-[#FF9900] text-white' : 'bg-[#FFF1DD] text-[#4D4D4D]'
                ]"
                @click="handleQuickLogin"
              >启用快捷登录</button>
              <button 
                :class="[
                  'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'export' ? 'bg-[#FF9900] text-white' : 'bg-[#FFF1DD] text-[#4D4D4D]'
                ]"
                @click="handleExport"
              >导出学生信息</button>
              <button 
                :class="[
                  'w-[100px] xl:w-[132px] h-[36px] xl:h-[40px] flex items-center justify-center rounded-[20px] text-[12px] xl:text-[14px] whitespace-nowrap transition-colors',
                  activeAction === 'batch' ? 'bg-[#FF9900] text-white' : 'bg-[#FFF1DD] text-[#4D4D4D]'
                ]"
                @click="handleBatchAction"
              >批量操作</button>
            </div>
          </div>

          <!-- 表格 -->
          <div class="overflow-x-auto">
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
                <div class="flex items-center justify-center gap-2">
                  <MButton size="small" @click="handleResetPassword(row)">重置密码</MButton>
                  <MButton size="small" @click="handleTransfer(row)">移班</MButton>
                  <MButton type="danger" size="small" @click="handleDeleteStudent(row)">删除</MButton>
                </div>
              </template>
            </MTable>
          </div>

          <!-- 批量操作栏 - 表格底部 -->
          <div v-if="activeAction === 'batch'" class="flex items-center justify-between mt-3 p-3 bg-[#FFF2DD] border-t border-gray-200">
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
              <span class="text-sm text-[#4D4D4D]">已选 <span class="text-[#FF9900]">{{ selectedStudentIds.length }}</span> 项</span>
            </div>
            <div class="flex items-center gap-4">
              <button 
                class="text-sm text-[#4D4D4D] hover:text-[#FF9900]"
                @click="handleBatchResetPassword"
              >批量重置密码</button>
              <button 
                class="text-sm text-[#4D4D4D] hover:text-[#FF9900]"
                @click="handleBatchDelete"
              >批量删除</button>
              <button 
                class="text-sm text-[#4D4D4D] hover:text-[#FF9900]"
                @click="handleClearSelection"
              >取消批量操作</button>
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
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- 标题居中 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">添加学生</h3>
        
        <!-- 添加方式切换 -->
        <div class="flex justify-center gap-3 mb-6">
          <button 
            :class="[
              'w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors',
              addStudentMode === 'batch' 
                ? 'bg-[#FF9900] text-white' 
                : 'border border-gray-300 text-[#FF9900]'
            ]"
            @click="addStudentMode = 'batch'"
          >批量导入添加</button>
          <button 
            :class="[
              'w-[136px] h-[40px] rounded-lg text-[14px] font-medium transition-colors',
              addStudentMode === 'manual' 
                ? 'bg-[#FF9900] text-white' 
                : 'border border-gray-300 text-[#FF9900]'
            ]"
            @click="addStudentMode = 'manual'"
          >手动添加</button>
        </div>
        
        <!-- 批量导入模式 -->
        <template v-if="addStudentMode === 'batch'">
          <div class="flex justify-center gap-3 mb-6">
            <button 
              class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500"
              @click="handleImportStudents"
            >导入学生信息</button>
            <button 
              class="w-[136px] h-[40px] rounded-lg text-[14px] bg-gray-200 text-gray-500"
              @click="handleDownloadTemplate"
            >下载导入模版</button>
          </div>
          
          <p class="text-sm text-gray-400 flex-1">
            批量导入学生信息后，系统将自动创建学生账号，该班级学生默认密码统一为：XXXXXXX
          </p>
        </template>
        
        <!-- 手动添加模式 -->
        <template v-else>
          <div class="space-y-4 flex-1">
            <MInput v-model="createForm.name" placeholder="学生姓名" />
        
          </div>
        </template>
        
        <!-- 按钮 -->
        <div class="flex items-center justify-center gap-4 mt-auto pt-4">
          <button 
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showCreateModal = false"
          >取消</button>
          <button 
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleCreateStudent"
          >确定</button>
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
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- 标题居中 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">创建班级</h3>
        
        <!-- 表单 -->
        <div class="space-y-4 px-2">
          <MSelect
            v-model="createClassForm.gradeId"
            :options="gradeOptions"
            placeholder="年级"
          />
          <MInput 
            v-model="createClassForm.className" 
            placeholder="班级" 
          />
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
          >取消</button>
          <button 
            class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmCreateClass"
          >确定</button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { MMessage } from '~/components/ui'
import { useTeacherNav } from '~/composables/useTeacherNav'

definePageMeta({
  layout: 'default'
})

// 左侧教师导航（登录后请求一次并缓存）
const route = useRoute()
const { menuItems, loadMenus } = useTeacherNav()

// 规范化路径，去掉末尾的 /index 方便匹配
const normalizePath = (p: string) => p.replace(/\/index$/, '')
const isActivePath = (path: string) => {
  const current = normalizePath(route.path)
  const target = normalizePath(path)
  return current === target || current.startsWith(target + '/')
}
const isActiveItem = (item: any) => {
  if (!item) return false
  if (item.activeMenu && route.path.includes(item.activeMenu)) return true
  return isActivePath(item.path || '')
}
const go = (path: string) => navigateTo(normalizePath(path))

// Tab 数据
const tabList = [
  { label: '学生管理', value: 'student' },
  { label: '小组管理', value: 'group' }
]
const activeTab = ref('student')

// 搜索关键词
const searchKeyword = ref('')

// 加载状态
const loading = ref(false)

// 当前选中的班级
const selectedClass = ref<any>(null)

// 展开的节点
const expandedKeys = ref<(string | number)[]>([1])

// 年级班级数据（树形结构）
const treeData = ref([
  // { 
  //   id: 1, 
  //   name: '三年级', 
  //   children: [
  //     { id: 11, name: '一班' },
  //     { id: 12, name: '二班' },
  //   ]
  // },
  // { id: 2, name: '四年级', children: [] },
  // { id: 3, name: '五年级', children: [] },
  // { id: 4, name: '六年级', children: [] },
  // { id: 5, name: '七年级', children: [] },
  // { id: 6, name: '八年级', children: [] },
])

// 班级选项（用于下拉选择）
const classOptions = computed(() => {
  const options: { label: string; value: number }[] = []
  treeData.value.forEach(grade => {
    grade.children?.forEach(cls => {
      options.push({ label: `${grade.name}${cls.name}`, value: cls.id })
    })
  })
  return options
})

// 表格列配置
const tableColumns = [
  { key: 'name', title: '学生姓名', minWidth: '120px' },
  { key: 'account', title: '学生账号', minWidth: '150px' },
  { key: 'createTime', title: '创建时间', width: '180px' },
  { key: 'action', title: '操作', width: '220px', align: 'center' as const }
]

// 学生列表
const studentList = ref([
  { id: 1, name: '学生1', account: 'xuesheng1xxxx', createTime: '2025-11-18 10:36' },
  { id: 2, name: '学生2', account: 'xuesheng2xxxx', createTime: '2025-11-18 10:36' },
  { id: 3, name: '学生3', account: 'xuesheng3xxxx', createTime: '2025-11-18 10:36' },
  { id: 4, name: '学生4', account: 'xuesheng4xxxx', createTime: '2025-11-18 10:36' },
  { id: 5, name: '学生5', account: 'xuesheng5xxxx', createTime: '2025-11-18 10:36' },
  { id: 6, name: '学生6', account: 'xuesheng6xxxx', createTime: '2025-11-18 10:36' },
  { id: 7, name: '学生7', account: 'xuesheng7xxxx', createTime: '2025-11-18 10:36' },
  { id: 8, name: '学生8', account: 'xuesheng8xxxx', createTime: '2025-11-18 10:36' },
  { id: 9, name: '学生9', account: 'xuesheng9xxxx', createTime: '2025-11-18 10:36' },
  // { id: 10, name: '学生10', account: 'xuesheng10xxxx', createTime: '2025-11-18 10:36' },
  // { id: 11, name: '学生11', account: 'xuesheng11xxxx', createTime: '2025-11-18 10:36' },
  // { id: 12, name: '学生12', account: 'xuesheng12xxxx', createTime: '2025-11-18 10:36' },
])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 100
})

// 创建学生弹窗
const showCreateModal = ref(false)
const addStudentMode = ref<'batch' | 'manual'>('batch')
const createForm = reactive({
  name: '',
  account: '',
  classId: null as number | null
})

// 创建班级弹窗
const showCreateClassModal = ref(false)
const createClassForm = reactive({
  gradeId: null as number | null,
  className: '',
  teacherName: '' // 老师名称，禁用输入
})

// 年级选项
const gradeOptions = [
  { label: '一年级', value: 1 },
  { label: '二年级', value: 2 },
  { label: '三年级', value: 3 },
  { label: '四年级', value: 4 },
  { label: '五年级', value: 5 },
  { label: '六年级', value: 6 },
]

// 老师选项
const teacherOptions = [
  { label: '张老师', value: 1 },
  { label: '李老师', value: 2 },
  { label: '王老师', value: 3 },
]

// 批量选择
const selectedStudentIds = ref<number[]>([])

// 是否全选
const isAllSelected = computed(() => {
  return studentList.value.length > 0 && selectedStudentIds.value.length === studentList.value.length
})

// 按钮状态 - 互斥选择
type ActionType = 'create' | 'quickLogin' | 'export' | 'batch' | null
const activeAction = ref<ActionType>(null)

// ===== 事件处理 =====

// 选择全部班级
const handleSelectAll = () => {
  selectedClass.value = null
  MMessage.info('已选择全部班级')
}

// 初始化菜单
onMounted(() => {
  loadMenus()
  // 若当前就在班级管理路由，导航高亮
  // isActive 依赖 route.path，加载后会自动生效
})

// 树节点选择
const handleTreeSelect = (node: any) => {
  if (!node.children) {
    // 只有班级（叶子节点）才能选中
    selectedClass.value = node
    MMessage.success(`已选择：${node.name}`)
  }
}

// 树节点展开/折叠
const handleTreeExpand = (key: string | number, expanded: boolean) => {
  if (expanded) {
    expandedKeys.value.push(key)
  } else {
    expandedKeys.value = expandedKeys.value.filter(k => k !== key)
  }
}

// 编辑班级
const handleEditClass = (node: any) => {
  MMessage.info(`编辑班级：${node.name}`)
}

// 删除班级
const handleDeleteClass = (node: any) => {
  MMessage.warning(`确认删除班级：${node.name}？`)
}

// 创建班级
const handleCreateNewClass = (gradeNode: any) => {
  // 如果有传入年级节点，预设年级
  if (gradeNode) {
    createClassForm.gradeId = gradeNode.id
  }
  showCreateClassModal.value = true
}

// 确认创建班级
const handleConfirmCreateClass = () => {
  if (!createClassForm.gradeId) {
    MMessage.error('请选择年级')
    return
  }
  if (!createClassForm.className) {
    MMessage.error('请输入班级名称')
    return
  }
  MMessage.success('创建班级成功')
  showCreateClassModal.value = false
  // 重置表单
  createClassForm.gradeId = null
  createClassForm.className = ''
  createClassForm.teacherId = null
}

// 搜索
const handleSearch = () => {
  MMessage.info(`搜索：${searchKeyword.value}`)
}

// 创建学生 - 始终打开弹窗，不参与互斥切换
const handleCreateAction = () => {
  showCreateModal.value = true
}

// 快捷登录
const handleQuickLogin = () => {
  if (activeAction.value === 'quickLogin') {
    activeAction.value = null
    MMessage.info('快捷登录已关闭')
  } else {
    activeAction.value = 'quickLogin'
    selectedStudentIds.value = []
    MMessage.success('快捷登录已启用')
  }
}

// 导出
const handleExport = () => {
  if (activeAction.value === 'export') {
    activeAction.value = null
  } else {
    activeAction.value = 'export'
    selectedStudentIds.value = []
    MMessage.info('正在导出学生信息...')
  }
}

// 批量操作
const handleBatchAction = () => {
  if (activeAction.value === 'batch') {
    activeAction.value = null
    selectedStudentIds.value = []
    MMessage.info('已退出批量操作模式')
  } else {
    activeAction.value = 'batch'
    MMessage.info('已进入批量操作模式，请勾选学生')
  }
}

// 学生选择
const handleStudentSelect = (keys: number[], rows: any[]) => {
  selectedStudentIds.value = keys
}

// 全选
const handleStudentSelectAll = (selected: boolean) => {
  if (selected) {
    selectedStudentIds.value = studentList.value.map(s => s.id)
  } else {
    selectedStudentIds.value = []
  }
}

// 底部全选切换
const handleSelectAllToggle = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  handleStudentSelectAll(checked)
}

// 取消选择
const handleClearSelection = () => {
  selectedStudentIds.value = []
}

// 批量删除
const handleBatchDelete = () => {
  const count = selectedStudentIds.value.length
  MMessage.warning(`确认删除选中的 ${count} 名学生？`)
  // TODO: 调用删除接口
}

// 批量移班
const handleBatchTransfer = () => {
  const count = selectedStudentIds.value.length
  MMessage.info(`批量移班：${count} 名学生`)
  // TODO: 打开移班弹窗
}

// 批量重置密码
const handleBatchResetPassword = () => {
  const count = selectedStudentIds.value.length
  MMessage.success(`已重置 ${count} 名学生的密码`)
  // TODO: 调用重置密码接口
}

// 重置密码
const handleResetPassword = (row: any) => {
  MMessage.success(`已重置 ${row.name} 的密码`)
}

// 移班
const handleTransfer = (row: any) => {
  MMessage.info(`移班：${row.name}`)
}

// 删除学生
const handleDeleteStudent = (row: any) => {
  MMessage.warning(`确认删除学生：${row.name}？`)
}

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  console.log('分页变化:', page, pageSize)
  // TODO: 重新加载数据
}

// 导入学生信息
const handleImportStudents = () => {
  MMessage.info('请选择要导入的文件')
  // TODO: 打开文件选择器
}

// 下载导入模板
const handleDownloadTemplate = () => {
  MMessage.success('正在下载导入模板...')
  // TODO: 下载模板文件
}

// 创建学生
const handleCreateStudent = () => {
  if (addStudentMode.value === 'manual') {
    if (!createForm.name || !createForm.account) {
      MMessage.error('请填写完整信息')
      return
    }
    MMessage.success('创建学生成功')
  } else {
    MMessage.success('批量导入成功')
  }
  showCreateModal.value = false
  // 重置表单
  createForm.name = ''
  createForm.account = ''
  createForm.classId = null
  addStudentMode.value = 'batch'
}
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

/* 主内容区滚动 */
.main-panel {
  overflow-y: auto;
  overflow-x: hidden;
}

/* 年级树面板 - 占满高度，不显示滚动条 */
.grade-panel {
  height: 100%;
  overflow: hidden;
}
</style>
