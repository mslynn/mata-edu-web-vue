<template>
  <div class="h-full bg-[#F5F7FA] p-4 lg:p-6 overflow-hidden">
    <div class="max-w-[1600px] mx-auto h-full">
      <!-- 白色卡片容器 -->
      <div class="bg-white rounded-lg shadow-sm p-4 lg:p-6 h-full flex flex-col">
        <!-- 顶部搜索栏 -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
          <div class="w-full sm:w-auto sm:min-w-[280px] lg:min-w-[320px]">
            <MInput 
              v-model="searchKeyword" 
              placeholder="请输入学校名称或编号"
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
          <MButton type="primary" class="!bg-[#FE9900] hover:!bg-[#e88a00] whitespace-nowrap" @click="handleExport">
            导出数据
          </MButton>
        </div>

        <!-- 表格 -->
        <div class="flex-1 overflow-auto min-h-0">
          <MTable 
            :columns="columns" 
            :data="tableData" 
            :loading="loading"
            show-index
            row-key="id"
            class="!shadow-none !rounded-none"
          >
            <template #actions="{ row }">
              <div class="flex items-center justify-center gap-2 flex-wrap">
                <button 
                  class="px-3 py-1 text-xs border border-[#FE9900] text-[#FE9900] rounded hover:bg-[#FE9900] hover:text-white transition-colors"
                  @click="handleViewDetail(row)"
                >
                  查看详情
                </button>
                <button 
                  class="px-3 py-1 text-xs border border-[#FE9900] text-[#FE9900] rounded hover:bg-[#FE9900] hover:text-white transition-colors"
                  @click="handleSchoolManage(row)"
                >
                  学校管理
                </button>
                <button 
                  class="px-3 py-1 text-xs border border-[#FE9900] text-[#FE9900] rounded hover:bg-[#FE9900] hover:text-white transition-colors"
                  @click="handleAdminManage(row)"
                >
                  校管理员管理
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

    <!-- 查看详情弹窗 -->
    <MModal 
      v-model="detailModalVisible" 
      title="查看学校信息"
      :show-footer="false"
      size="small"
    >
      <div class="bg-[#F5F5F5] rounded-lg p-6 space-y-4">
        <div class="flex">
          <span class="text-gray-800 font-medium w-28 flex-shrink-0">学校名称：</span>
          <span class="text-gray-600">{{ currentSchool?.orgName || '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-28 flex-shrink-0">学校编号：</span>
          <span class="text-gray-600">{{ currentSchool?.orgNumber || '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-28 flex-shrink-0">所属国家：</span>
          <span class="text-gray-600">{{ currentSchool?.country || '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-28 flex-shrink-0">所属地区：</span>
          <span class="text-gray-600">{{ currentSchool?.area || '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-28 flex-shrink-0">校管理员人数：</span>
          <span class="text-gray-600">{{ currentSchool?.adminCount ?? '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-28 flex-shrink-0">教师人数：</span>
          <span class="text-gray-600">{{ currentSchool?.teacherCount ?? '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-28 flex-shrink-0">学生人数：</span>
          <span class="text-gray-600">{{ currentSchool?.studentCount ?? '-' }}</span>
        </div>
      </div>
    </MModal>

    <!-- 编辑学校信息弹窗 -->
    <MModal 
      v-model="editSchoolModalVisible" 
      custom-width="381px"
      :show-footer="false" 
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <!-- 关闭按钮 -->
        <button 
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors" 
          @click="editSchoolModalVisible = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">编辑学校信息</h3>

        <!-- 学校名称输入框 -->
        <div class="mb-6">
          <MInput 
            v-model="editSchoolForm.orgName" 
            placeholder="请输入学校名称"
          >
            <template #prefix>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </template>
          </MInput>
        </div>

        <!-- 按钮组 -->
        <div class="flex items-center justify-center gap-4">
          <button 
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50 transition-colors" 
            @click="editSchoolModalVisible = false"
          >
            取消
          </button>
          <button 
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00] transition-colors" 
            @click="handleConfirmEditSchool"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { districtAdmin } from '~/composables/api/districtAdmin'
import { MMessage } from "~/components/ui";

definePageMeta({
  layout: 'default'
})

const { getSchooleList, getSchoolDetail, updateSchool, exportSchoolInfo } = districtAdmin()

// 搜索
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 表格列配置
const columns = [
  { key: 'orgName', title: '学校名称', minWidth: '150px', align: 'center' as const },
  { key: 'orgNumber', title: '学校编号', minWidth: '100px', align: 'center' as const },
  { key: 'createTime', title: '创建时间', minWidth: '150px', align: 'center' as const },
  { key: 'actions', title: '操作', minWidth: '280px', align: 'center' as const }
]

// 表格数据
const tableData = ref<any[]>([])

// 详情弹窗
const detailModalVisible = ref(false)
const currentSchool = ref<any>(null)
const detailLoading = ref(false)

// 编辑学校弹窗
const editSchoolModalVisible = ref(false)
const editSchoolForm = ref({
  orgId: '',
  orgName: ''
})
const editSchoolLoading = ref(false)

// 获取学校列表
const fetchSchoolList = async () => {
  loading.value = true
  try {
    const res = await getSchooleList({
      numberName: searchKeyword.value?.trim() || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('获取学校列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchSchoolList()
}

// 初始化加载
onMounted(() => {
  fetchSchoolList()
})

// 导出
const handleExport = async () => {
  try {
    await exportSchoolInfo()
    // MMessage.success('导出成功')
  } catch (error: any) {
    MMessage.error(error.message || '导出失败')
  }
}

// 查看详情
const handleViewDetail = async (row: any) => {
  detailModalVisible.value = true
  detailLoading.value = true
  try {
    const detail = await getSchoolDetail(row.orgId)
    currentSchool.value = detail
  } catch (error) {
    console.error('获取学校详情失败:', error)
  } finally {
    detailLoading.value = false
  }
}

// 学校管理
const handleSchoolManage = async (row: any) => {
  editSchoolForm.value.orgId = row.orgId
  editSchoolForm.value.orgName = row.orgName || ''
  editSchoolModalVisible.value = true
}

// 确认编辑学校
const handleConfirmEditSchool = async () => {
  if (!editSchoolForm.value.orgName.trim()) {

    MMessage.warning('请输入学校名称')
    return
  }

  editSchoolLoading.value = true
  try {
    await updateSchool({
      orgId: editSchoolForm.value.orgId,
      orgName: editSchoolForm.value.orgName.trim()
    })
 
    // MMessage.success('更新成功')
    editSchoolModalVisible.value = false
    // 刷新列表
    fetchSchoolList()
  } catch (error: any) {

    MMessage.error(error.message || '更新失败')
  } finally {
    editSchoolLoading.value = false
  }
}

// 管理员管理
const handleAdminManage = (row: any) => {
  navigateTo(`/school/${row.orgId}`)
}

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchSchoolList()
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
