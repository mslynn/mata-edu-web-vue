<template>
  <div ref="schoolPageRef" class="school-page" :style="pageAdaptiveStyle">
    <div class="school-shell">
      <!-- 页面标题和学校数量（白色卡片外面） -->
      <div class="school-page-header">
        <h1 class="school-page-header__title">{{ $t('school.schoolManage') }}</h1>
        <div class="school-stat-card">
          <span class="school-stat-card__label">{{ $t('school.schoolCount') }}：</span><strong class="school-stat-card__value">{{ total }}</strong><span class="school-stat-card__unit">所</span>
        </div>
      </div>

      <!-- 内容区域（白色卡片） -->
      <div class="school-card">
        <!-- 搜索栏 -->
        <div class="school-toolbar">
          <!-- 搜索框 -->
          <div class="school-search">
            <MInput 
              v-model="searchKeyword" 
              placeholder="请输入学校名称或编号"
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
            class="school-export-btn"
            @click="handleExport"
          >
            {{ $t('school.exportData') }}
          </MButton>
        </div>

        <!-- 表格 -->
        <div class="school-table-wrap">
          <MTable 
            :columns="columns" 
            :data="tableData" 
            :loading="loading"
            show-index
            row-key="id"
            class="school-table"
          >
            <template #actions="{ row }">
              <div class="school-action-group">
                <button 
                  class="school-action-btn"
                  @click="handleViewDetail(row)"
                >
                  {{ $t('school.viewDetail') }}
                </button>
                <button 
                  class="school-action-btn"
                  @click="handleSchoolManage(row)"
                >
                  {{ $t('school.schoolManage') }}
                </button>
                <button 
                  class="school-action-btn"
                  @click="handleAdminManage(row)"
                >
                  {{ $t('school.adminManage') }}
                </button>
              </div>
            </template>
          </MTable>
        </div>

        <!-- 分页 -->
        <div class="school-pagination">
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
      <div class="school-modal school-modal--detail p-6 relative">
        <!-- 关闭按钮 -->
        <button class="school-modal__close absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="detailModalVisible = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- 标题 -->
        <h3 class="school-modal__title text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('school.viewSchoolTitle') }}</h3>
        
        <!-- 内容区域 -->
        <div class="school-modal-info rounded-lg p-5 space-y-3 mb-6">
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.schoolNameLabel') }}</span>
            <span class="text-[#4D4D4D]">{{ currentSchool?.orgName || '-' }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">编号：</span>
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
            <span :class="currentSchool?.schoolAdminCount == null ? 'text-[#4D4D4D]' : 'school-theme-number font-medium'">
              {{ currentSchool?.schoolAdminCount ?? '-' }}
            </span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.teacherCount') }}</span>
            <span :class="currentSchool?.teacherCount == null ? 'text-[#4D4D4D]' : 'school-theme-number font-medium'">
              {{ currentSchool?.teacherCount ?? '-' }}
            </span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-24 flex-shrink-0">{{ $t('school.studentCount') }}</span>
            <span :class="currentSchool?.studentCount == null ? 'text-[#4D4D4D]' : 'school-theme-number font-medium'">
              {{ currentSchool?.studentCount ?? '-' }}
            </span>
          </div>
        </div>
        
        <!-- 按钮组 -->
        <div class="flex items-center justify-center gap-4">
          <button 
            class="school-modal-btn school-modal-btn--ghost w-[136px] h-[40px] border border-gray-300 rounded-full text-[#4D4D4D] hover:bg-gray-50 transition-colors" 
            @click="detailModalVisible = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            class="school-modal-btn school-modal-btn--primary w-[136px] h-[40px] text-white rounded-full transition-colors" 
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
      <div class="school-modal school-modal--edit p-6 relative">
        <!-- 关闭按钮 -->
        <button 
          class="school-modal__close absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors" 
          @click="editSchoolModalVisible = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="school-modal__title text-center text-lg font-medium text-[#4D4D4D] mb-6">{{ $t('school.editSchoolTitle') }}</h3>

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
            class="school-modal-btn school-modal-btn--ghost w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50 transition-colors" 
            @click="editSchoolModalVisible = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            class="school-modal-btn school-modal-btn--primary w-[136px] h-[40px] text-white rounded-lg transition-colors" 
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

const schoolPageRef = ref<HTMLElement | null>(null)
let schoolPageResizeObserver: ResizeObserver | null = null
const schoolLayoutWidth = ref(1360)

const getSchoolLayoutWidth = () => {
  if (typeof window === 'undefined') {
    return 1360
  }

  const clientWidth = document.documentElement?.clientWidth || 0
  const pageClientWidth = schoolPageRef.value?.clientWidth || 0
  const outerWidth = window.outerWidth || 0
  const innerWidth = window.innerWidth || 0
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(width => width > 0)
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth
  const boundedWidth = Math.min(referenceWidth, visibleWidth)
  return Math.max(1280, Math.round(boundedWidth))
}

const syncSchoolLayoutWidth = () => {
  schoolLayoutWidth.value = getSchoolLayoutWidth()
}

const schoolShellWidth = computed(() => {
  if (schoolLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(schoolLayoutWidth.value))}px`
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(schoolLayoutWidth.value * 0.9))
  )}px`
})

const pageAdaptiveStyle = computed(() => ({
  '--school-shell-width': schoolShellWidth.value
}))

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
  { key: 'orgNumber', title: '编号', minWidth: '100px', align: 'center' as const },
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
  syncSchoolLayoutWidth()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncSchoolLayoutWidth)
    window.visualViewport?.addEventListener('resize', syncSchoolLayoutWidth)
    if (window.ResizeObserver && schoolPageRef.value) {
      schoolPageResizeObserver = new window.ResizeObserver(() => {
        syncSchoolLayoutWidth()
      })
      schoolPageResizeObserver.observe(schoolPageRef.value)
    }
  }
  fetchSchoolList()
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', syncSchoolLayoutWidth)
  window.visualViewport?.removeEventListener('resize', syncSchoolLayoutWidth)
  schoolPageResizeObserver?.disconnect()
  schoolPageResizeObserver = null
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
    console.error('更新学校信息失败:', error)
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
.school-page {
  --school-min-width: 1280px;
  --school-max-width: 1920px;
  --school-shell-width: var(--school-min-width);
  width: 100%;
  height: 100%;
  min-width: var(--school-min-width);
  min-height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  padding: 30px 0 40px;
  background: linear-gradient(180deg, #f3f6fb 0%, #eef3fb 100%);
}

.school-shell {
  width: min(
    var(--school-max-width),
    max(var(--school-min-width), var(--school-shell-width))
  );
  min-width: var(--school-min-width);
  margin: 0 auto;
  padding: 0 clamp(48px, 4vw, 72px);
  box-sizing: border-box;
}

.school-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.school-page-header__title {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 600;
  color: #16233d;
}

.school-stat-card {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: #26344f;
  font-size: 14px;
}

.school-stat-card__label,
.school-stat-card__unit {
  color: #26344f;
  font-weight: 500;
}

.school-stat-card__value {
  color: #005bc2;
  font-weight: 600;
}

.school-card {
  min-height: 610px;
  padding: 24px 28px 34px;
  border: 1px solid #dfe8f5;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 20px 48px rgba(38, 76, 130, 0.1);
}

.school-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.school-search {
  width: min(372px, 100%);
  max-width: 100%;
}

.school-search :deep(input) {
  min-height: 42px;
  border-color: #d6e2f0 !important;
  border-radius: 12px !important;
  background: #ffffff !important;
  color: #1f2a37;
  box-shadow: none;
}

.school-search :deep(input:focus) {
  border-color: #4b8eff !important;
  box-shadow: 0 0 0 4px rgba(75, 142, 255, 0.12);
}

.school-export-btn {
  min-width: 130px;
  min-height: 42px;
  padding: 0 24px !important;
  border: 1px solid #d6e2f0 !important;
  border-radius: 14px !important;
  background: #ffffff !important;
  color: #13223a !important;
  box-shadow: none !important;
}

.school-export-btn:hover {
  background: #f4f8ff !important;
  border-color: #4b8eff !important;
  color: #005bc2 !important;
}

.school-table-wrap {
  overflow: auto;
  border: 1px solid #dfe8f5;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.school-action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.school-action-btn {
  min-width: 88px;
  height: 38px;
  padding: 0 14px;
  border: 1px solid #d8e4f2;
  border-radius: 999px;
  background: #ffffff;
  color: #005bc2;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.school-action-btn:hover {
  border-color: #4b8eff;
  background: #f4f8ff;
}

.school-pagination {
  display: flex;
  justify-content: center;
  margin-top: 26px;
}

.school-page :deep(.m-pagination) {
  gap: 8px;
  color: #51617a;
}

.school-page :deep(.m-pagination button),
.school-page :deep(.m-pagination .page-btn) {
  border-color: #d6e2f0;
  border-radius: 14px;
  color: #51617a;
}

.school-page :deep(.m-pagination button:not(:disabled):hover) {
  border-color: #005bc2 !important;
  color: #005bc2 !important;
}

.school-page :deep(.m-pagination select),
.school-page :deep(.m-pagination input) {
  border-color: #d6e2f0 !important;
  border-radius: 8px;
  color: #13223a;
}

.school-page :deep(.m-pagination select:focus),
.school-page :deep(.m-pagination input:focus) {
  border-color: #005bc2 !important;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.school-page :deep(.m-pagination button[class*="bg-"]) {
  border-color: #005bc2 !important;
  background-color: #005bc2 !important;
  color: #ffffff !important;
}

.school-table {
  box-shadow: none !important;
  border-radius: 22px;
  overflow: hidden;
}

.school-table :deep(.m-table) {
  box-shadow: none !important;
  border-radius: 22px;
}

.school-table :deep(thead) {
  background: #f5f8fc !important;
}

.school-table :deep(thead th) {
  height: 60px;
  background-color: transparent !important;
  color: #51617a !important;
  font-size: 14px;
  font-weight: 700 !important;
  border-bottom: 1px solid #dfe8f5;
}

.school-table :deep(tbody tr) {
  background-color: #ffffff;
  border-bottom: none !important;
}

.school-table :deep(tbody tr:hover) {
  background-color: #f4f8ff !important;
}

.school-table :deep(tbody td) {
  height: 70px;
  color: #13223a;
  font-size: 14px;
  border-top: 1px solid #eef3f8;
  border-bottom: none !important;
}

.school-table :deep(tbody td:first-child) {
  color: #6f7f92;
  font-weight: 600;
}

.school-theme-number {
  color: #005bc2 !important;
}

.school-modal {
  border-radius: 18px;
  background: #ffffff;
}

.school-modal__title {
  color: #16233d !important;
  font-weight: 600 !important;
}

.school-modal__close {
  color: #8a96a3 !important;
}

.school-modal__close:hover {
  color: #005bc2 !important;
}

.school-modal-info {
  border: 1px solid #dfe8f5 !important;
  background: #f5f8fc !important;
  border-radius: 14px !important;
}

.school-modal-info span {
  color: #26344f;
}

.school-modal :deep(input) {
  border-color: #d6e2f0 !important;
  border-radius: 12px !important;
}

.school-modal :deep(input:focus) {
  border-color: #005bc2 !important;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.school-modal-btn {
  border-radius: 999px !important;
  font-weight: 600;
  transition: all 0.2s ease;
}

.school-modal-btn--ghost {
  border-color: #d6e2f0 !important;
  background: #ffffff !important;
  color: #26344f !important;
}

.school-modal-btn--ghost:hover {
  border-color: #005bc2 !important;
  background: #f4f8ff !important;
  color: #005bc2 !important;
}

.school-modal-btn--primary {
  border: 1px solid #005bc2 !important;
  background: #005bc2 !important;
  color: #ffffff !important;
}

.school-modal-btn--primary:hover {
  border-color: #004a9f !important;
  background: #004a9f !important;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 768px) {
  .school-page {
    padding: 20px 0 28px;
  }

  .school-shell {
    padding: 0 16px;
  }

  .school-page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .school-card {
    padding: 20px;
    border-radius: 24px;
  }

  .school-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .school-search {
    width: 100%;
  }

  .school-export-btn {
    width: 100%;
  }
}
</style>
