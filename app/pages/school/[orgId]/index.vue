<template>
  <div class="h-full bg-[#F5F7FA] p-4 lg:p-6 overflow-hidden">
    <div class="max-w-[1600px] mx-auto h-full">
      <!-- 白色卡片容器 -->
      <div class="bg-white rounded-lg shadow-sm p-4 lg:p-6 h-full flex flex-col">
        <!-- 顶部：返回按钮 + 标题 -->
        <div class="flex items-center gap-4 mb-6 flex-shrink-0">
          <button 
            class="flex items-center gap-2 text-[#4D4D4D] hover:text-[#FF9900] transition-colors"
            @click="handleBack"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>返回</span>
          </button>
          <h2 class="text-lg font-medium text-[#4D4D4D]">{{ schoolInfo?.orgName || '校管理员管理' }}</h2>
        </div>

        <!-- 搜索栏和操作按钮 -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div class="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[320px]">
              <MInput 
                v-model="searchKeyword" 
                placeholder="请输入管理员姓名或账号"
                clearable
                @enter="handleSearch"
              >
                <template #prefix>
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </template>
              </MInput>
            </div>
            <span class="hidden md:inline-block text-xs lg:text-sm text-[#CBCBCB]">
              教师统一密码为：<span class="text-[#FF9900]">{{ teacherPassword || 'xxxxxxxx' }}</span>
            </span>
          </div>

          <div class="flex gap-2">
            <MButton type="primary" class="!bg-[#FE9900] hover:!bg-[#e88a00] whitespace-nowrap" @click="handleCreateAdmin">
              创建管理员
            </MButton>
            <MButton type="primary" class="!bg-[#FE9900] hover:!bg-[#e88a00] whitespace-nowrap" @click="handleExport">
              导出数据
            </MButton>
          </div>
        </div>

        <!-- 表格 -->
        <div class="flex-1 overflow-auto min-h-0">
          <MTable 
            :columns="teacherTableColumns" 
            :data="tableData" 
            :loading="loading"
            show-index
            row-key="userId"
            class="!shadow-none !rounded-none"
          >
            <template #action="{ row }">
              <div class="flex items-center justify-center gap-1 lg:gap-2 whitespace-nowrap">
                <button
                  class="px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]"
                  @click="handleTransferTeacherClass(row)"
                >
                  转让
                </button>
                <button
                  class="px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]"
                  @click="handleResetTeacherPassword(row)"
                >
                  重置
                </button>
                <button
                  class="px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors text-[#4D4D4D] border-[#CBCBCB] hover:border-[#FF9900] hover:text-[#FF9900]"
                  @click="handleEditTeacher(row)"
                >
                  编辑
                </button>
                <button
                  class="px-1.5 lg:px-2 xl:px-3 py-1 text-xs lg:text-sm border rounded-[7px] transition-colors text-[#FF0000] border-[#CBCBCB] hover:border-[#FF0000]"
                  @click="handleDeleteTeacher(row)"
                >
                  删除
                </button>
              </div>
            </template>
          </MTable>
        </div>

        <!-- 分页 - 右下角 -->
        <div class="mt-4 flex justify-end flex-shrink-0">
          <MPagination 
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            show-quick-jumper
          />
        </div>
      </div>
    </div>

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
        
        <div class="px-2">
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
          <MInput v-model="transferTeacherSearch" placeholder="请输入可转让教师姓名" clearable>
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
  </div>
</template>

<script setup lang="ts">
import { districtAdmin } from '~/composables/api/districtAdmin'
import { MMessage } from '~/components/ui'
import { useSchoolUser, type Teacher } from '~/composables/api/useSchoolUser'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { getSchoolDetail } = districtAdmin()
const schoolUserApi = useSchoolUser()

// 学校ID
const orgId = computed(() => route.params.orgId as string)

// 学校信息
const schoolInfo = ref<any>(null)

// 搜索
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 教师统一密码
const teacherPassword = ref('')

// 表格列配置
const teacherTableColumns = [
  { key: 'nickName', title: '校管理员名称', minWidth: '100px' },
  { key: 'userName', title: '账号', minWidth: '120px' },
  { key: 'phonenumber', title: '手机号码', minWidth: '120px' },
  { key: 'createTime', title: '创建时间', minWidth: '160px' },
  { key: 'action', title: '操作', width: '320px', align: 'center' as const }
]

// 表格数据
const tableData = ref<any[]>([])

// 教师弹窗
const showTeacherModal = ref(false)
const showDeleteTeacherModal = ref(false)
const showResetTeacherModal = ref(false)
const showTransferTeacherModal = ref(false)
const isEditTeacher = ref(false)
const teacherForm = reactive({ id: '', teacherName: '', phone: '' })
const deleteTeacherConfirmText = ref('')
const deleteTeacherIds = ref<string[]>([])
const resetTeacherConfirmText = ref('')
const resetTeacherIds = ref<string[]>([])

// 转让相关
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

// 获取学校信息
const fetchSchoolInfo = async () => {
  try {
    const detail = await getSchoolDetail(orgId.value)
    schoolInfo.value = detail
  } catch (error) {
    console.error('获取学校信息失败:', error)
  }
}

// 获取教师统一密码
const fetchTeacherPassword = async () => {
  try {
    const pwd = await schoolUserApi.getTeacherPassword()
    teacherPassword.value = pwd || 'xxxxxxxx'
  } catch (error) {
    console.error('获取教师密码失败', error)
  }
}

// 获取管理员列表
const fetchTeacherList = async () => {
  loading.value = true
  try {
    const result = await schoolUserApi.getTeacherList({
      orgId: orgId.value,
      userNick: searchKeyword.value?.trim() || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    tableData.value = result.list
    total.value = result.total
  } catch (error: any) {
    MMessage.error(error.message || '获取管理员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTeacherList()
}

// 返回
const handleBack = () => {
  router.back()
}

// 创建管理员
const handleCreateAdmin = () => {
  isEditTeacher.value = false
  teacherForm.id = ''
  teacherForm.teacherName = ''
  teacherForm.phone = ''
  showTeacherModal.value = true
}

// 编辑教师
const handleEditTeacher = (row: any) => {
  isEditTeacher.value = true
  teacherForm.id = row.userId
  teacherForm.teacherName = row.nickName
  teacherForm.phone = row.phonenumber
  showTeacherModal.value = true
}

// 确认添加/编辑教师
const handleConfirmTeacher = async () => {
  if (!teacherForm.teacherName.trim()) { MMessage.warning('请输入教师姓名'); return }
  if (!teacherForm.phone.trim()) { MMessage.warning('请输入手机号'); return }
  try {
    if (isEditTeacher.value) {
      await schoolUserApi.updateTeacher({ userId: teacherForm.id, nickName: teacherForm.teacherName, phonenumber: teacherForm.phone })
      MMessage.success('编辑成功')
    } else {
      await schoolUserApi.createTeacher({ orgId: orgId.value, nickName: teacherForm.teacherName, phonenumber: teacherForm.phone })
      MMessage.success('创建成功')
    }
    showTeacherModal.value = false
    fetchTeacherList()
  } catch (error: any) { MMessage.error(error.message || '操作失败') }
}

// 删除教师
const handleDeleteTeacher = (row: any) => {
  deleteTeacherIds.value = [row.userId]
  deleteTeacherConfirmText.value = `确认要删除教师"${row.nickName}"吗？`
  showDeleteTeacherModal.value = true
}

const handleConfirmDeleteTeacher = async () => {
  try {
    await schoolUserApi.deleteTeacher(deleteTeacherIds.value)
    MMessage.success('删除成功')
    showDeleteTeacherModal.value = false
    fetchTeacherList()
  } catch (error: any) { MMessage.error(error.message || '删除失败') }
}

// 重置密码
const handleResetTeacherPassword = (row: any) => {
  resetTeacherIds.value = [row.userId]
  resetTeacherConfirmText.value = `确认重置教师"${row.nickName}"的密码吗？`
  showResetTeacherModal.value = true
}

const handleConfirmResetTeacher = async () => {
  try {
    await schoolUserApi.resetTeacherPassword(resetTeacherIds.value)
    MMessage.success('重置密码成功')
    showResetTeacherModal.value = false
  } catch (error: any) { MMessage.error(error.message || '重置密码失败') }
}

// 班级转让
const handleTransferTeacherClass = async (row: any) => {
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

const handleSelectTransferTeacher = (userId: string) => {
  transferTeacherForm.targetTeacherId = userId
}

const handleTransferGradeChange = async (gradeId: string | number | null) => {
  if (!gradeId) return
  transferClassForm.classId = ''
  transferClassOptions.value = []
  try {
    const classList = await schoolUserApi.transferClassList({
      teacherId: transferTeacherForm.teacherId,
      grade: String(gradeId),
      schoolId: orgId.value
    })
    transferClassOptions.value = (classList || []).map((c: any) => ({
      id: c.classId || c.id,
      name: c.className || c.name
    }))
  } catch (error) {
    transferClassOptions.value = []
  }
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
      schoolId: orgId.value,
      className: selectedClass?.name || ''
    })
    MMessage.success('班级转让成功')
    showTransferTeacherModal.value = false
    fetchTeacherList()
  } catch (error: any) { MMessage.error(error.message || '班级转让失败') }
}

// 导出
const handleExport = async () => {
  try {
    await schoolUserApi.exportTeacherInfo()
    MMessage.success('导出成功')
  } catch (error: any) {
    MMessage.error(error.message || '导出失败')
  }
}

// 初始化加载
onMounted(() => {
  fetchSchoolInfo()
  fetchTeacherPassword()
  fetchTeacherList()
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchTeacherList()
})
</script>

<style scoped>
/* 响应式调整 */
@media (max-width: 1200px) {
  .max-w-\[1600px\] {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
