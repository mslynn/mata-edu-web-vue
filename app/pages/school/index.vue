<template>
  <div class="h-full bg-[#FAFAFA] py-4 lg:py-6 overflow-auto">
    <div class="w-[92%] mx-auto">
      <!-- 页面标题和学校数量（白色卡片外面） -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-base font-medium text-gray-800">{{ $t('school.schoolManage') }}</h1>
        <div class="text-gray-600 text-sm">
          {{ $t('school.schoolCount') }}：<span class="text-[#FF9900] font-medium">{{ total }}个</span>
        </div>
      </div>

      <!-- 内容区域（白色卡片） -->
      <div class="bg-[#FFFFFF] rounded-[20px] p-6 shadow-mg">
        <!-- 搜索栏 -->
        <div class="flex items-center justify-between mb-4">
          <!-- 搜索框 -->
          <div class="w-[240px]">
            <MInput 
              v-model="searchKeyword" 
              :placeholder="$t('school.searchPlaceholder')"
              clearable
              @enter="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
            </MInput>
          </div>

          <!-- 导出按钮 -->
          <MButton 
            type="primary" 
            class="!bg-[#FAFAFA] px-6 !text-[#4D4D4D] border border-[#E5E5E5]"
            @click="handleExport"
          >
            {{ $t('school.exportData') }}
          </MButton>
        </div>

        <!-- 表格 -->
        <div class="h-[480px] overflow-auto">
          <MTable 
            :columns="columns" 
            :data="tableData" 
            :loading="loading"
            show-index
            row-key="id"
            class="school-table"
          >
            <template #actions="{ row }">
              <div class="flex items-center justify-center gap-2">
                <button 
                  class="px-3 py-1 text-xs border text-[#4D4D4D] rounded hover:bg-[#FFF8F0] transition-colors"
                  @click="handleViewDetail(row)"
                >
                  {{ $t('school.viewDetail') }}
                </button>
                <button 
                  class="px-3 py-1 text-xs border text-[#4D4D4D] rounded hover:bg-[#FFF8F0] transition-colors"
                  @click="handleSchoolManage(row)"
                >
                  {{ $t('school.schoolManage') }}
                </button>
                <button 
                  class="px-3 py-1 text-xs border  text-[#4D4D4D] rounded hover:bg-[#FFF8F0] transition-colors"
                  @click="handleAdminManage(row)"
                >
                  {{ $t('school.adminManage') }}
                </button>
              </div>
            </template>
          </MTable>
        </div>

        <!-- 分页 -->
        <div class="mt-6 flex justify-center">
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
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="p-6 relative">
        <!-- 关闭按钮 -->
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="detailModalVisible = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('school.viewSchoolTitle') }}</h3>
        
        <!-- 内容区域 -->
        <div class="bg-[#FEF2DB] rounded-lg p-5 space-y-3 mb-6">
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.schoolNameLabel') }}</span>
            <span class="text-[#4D4D4D]">{{ currentSchool?.orgName || '-' }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.schoolNumberLabel') }}</span>
            <span class="text-[#4D4D4D]">{{ currentSchool?.orgNumber || '-' }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.country') }}</span>
            <span class="text-[#4D4D4D]">{{ currentSchool?.country || '-' }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.area') }}</span>
            <span class="text-[#4D4D4D]">{{ currentSchool?.area || '-' }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-26 flex-shrink-0">{{ $t('school.adminCount') }}</span>
            <span :class="currentSchool?.schoolAdminCount == null ? 'text-[#4D4D4D]' : 'text-[#FF9900] font-medium'">
              {{ currentSchool?.schoolAdminCount ?? '-' }}
            </span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.teacherCount') }}</span>
            <span :class="currentSchool?.teacherCount == null ? 'text-[#4D4D4D]' : 'text-[#FF9900] font-medium'">
              {{ currentSchool?.teacherCount ?? '-' }}
            </span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.studentCount') }}</span>
            <span :class="currentSchool?.studentCount == null ? 'text-[#4D4D4D]' : 'text-[#FF9900] font-medium'">
              {{ currentSchool?.studentCount ?? '-' }}
            </span>
          </div>
        </div>
        
        <!-- 按钮组 -->
        <div class="flex items-center justify-center gap-4">
          <button 
            class="w-[136px] h-[40px] border border-gray-300 rounded-full text-[#4D4D4D] hover:bg-gray-50 transition-colors" 
            @click="detailModalVisible = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-full hover:bg-[#E68A00] transition-colors" 
            @click="detailModalVisible = false"
          >
            {{ $t('common.confirm') }}
          </button>
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
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ $t('school.editSchoolTitle') }}</h3>

        <!-- 学校名称输入框 -->
        <div class="mb-6">
          <MInput 
            v-model="editSchoolForm.orgName" 
            :placeholder="$t('school.inputSchoolName')"
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
            {{ $t('common.cancel') }}
          </button>
          <button 
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00] transition-colors" 
            @click="handleConfirmEditSchool"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { districtAdmin } from '~/composables/api/districtAdmin'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
const { getSchooleList, getSchoolDetail, updateSchool, exportSchoolInfo } = districtAdmin()

// 搜索
const searchKeyword = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 表格列配置
const columns = computed(() => [
  { key: 'orgName', title: t('school.schoolName'), minWidth: '150px', align: 'center' as const },
  { key: 'orgNumber', title: t('school.schoolNumber'), minWidth: '100px', align: 'center' as const },
  { key: 'createTime', title: t('school.createTime'), minWidth: '150px', align: 'center' as const },
  { key: 'actions', title: t('school.operation'), minWidth: '280px', align: 'center' as const }
])

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
      nickPhone: searchKeyword.value?.trim() || undefined,
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
  } catch (error: any) {
    ElMessage.error(error.message || t('common.exportFailed'))
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
    ElMessage.warning(t('school.pleaseInputSchoolName'))
    return
  }

  editSchoolLoading.value = true
  try {
    await updateSchool({
      orgId: editSchoolForm.value.orgId,
      orgName: editSchoolForm.value.orgName.trim()
    })
    editSchoolModalVisible.value = false
    // 显示成功提示
    // 这个提示为啥不出现
    ElMessage.success(t('school.updateSuccess'))
    // 刷新列表
    fetchSchoolList()
  } catch (error: any) {
    ElMessage.error(error.message || t('school.updateFailed'))
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
/* 覆盖 MTable 表头背景色 */
.school-table :deep(thead) {
  background-color: #FAFAFA !important;
}

.school-table :deep(thead th) {
  background-color: transparent !important;
}

/* 去掉表格圆角和阴影 */
.school-table {
  box-shadow: none !important;
  border-radius: 8px;
  overflow: hidden;
}

/* 表格行间距样式 - 卡片效果 */
.school-table :deep(tbody tr) {
  background-color: #FFFFFF;
  border-bottom: 8px solid #F5F5F5 !important;
}

.school-table :deep(tbody tr:last-child) {
  border-bottom: none !important;
}

.school-table :deep(tbody td) {
  border-bottom: none !important;
  padding-top: 16px;
  padding-bottom: 16px;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
