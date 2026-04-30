<template>
  <div ref="schoolAdminPageRef" class="school-admin-page" :style="pageAdaptiveStyle">
    <div class="school-admin-shell">
      <!-- 页面标题和管理员人数（白色卡片外面） -->
      <div class="school-admin-page-header">
        <div class="school-admin-breadcrumb">
          <span class="school-admin-breadcrumb__back" @click="handleBack">{{ $t('school.schoolManage') }}</span>
          <span class="text-gray-400">></span>
          <span>{{ $t('schoolAdmin.title') }}</span>
        </div>
        <div class="school-admin-stat-card">
          {{ $t('schoolAdmin.adminCount') }}：<span class="school-admin-stat-card__value">{{ total }}</span><span>{{ $t('schoolAdmin.person') }}</span>
        </div>
      </div>

      <!-- 内容区域（白色卡片） -->
      <div class="school-admin-card">
        <!-- 搜索栏和操作按钮 -->
        <div class="school-admin-page-header">
          <div class="school-admin-toolbar-left">
            <!-- 搜索框 -->
            <div class="school-admin-search">
              <MInput v-model="searchKeyword" :placeholder="$t('schoolAdmin.searchPlaceholder')" clearable @enter="handleSearch">
                <template #prefix>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </template>
              </MInput>
            </div>
            <!-- 密码提示 -->
            <span class="school-admin-password-tip">
              {{ $t('schoolAdmin.teacherPassword') }}<span class="school-admin-password-value">{{ teacherPassword || 'xxxxx' }}</span>
            </span>
          </div>

          <div class="school-admin-toolbar-actions">
            <MButton type="primary" class="school-admin-create-btn"
              @click="handleCreateAdmin">
              + {{ $t('schoolAdmin.createAdmin') }}
            </MButton>
            <MButton class="school-admin-export-btn" @click="handleExport">
              {{ $t('school.exportData') }}
            </MButton>
          </div>
        </div>

        <!-- 表格 -->
        <div class="school-admin-table-wrap">
          <MTable :columns="teacherTableColumns" :data="tableData" :loading="loading" show-index row-key="userId"
            class="admin-table">
            <template #action="{ row }">
              <div class="school-admin-action-group">
                <button
                  class="school-admin-action-btn"
                  @click="handleResetTeacherPassword(row)">
                  {{ $t('schoolAdmin.resetPassword') }}
                </button>
                <button
                  class="school-admin-action-btn"
                  @click="handleEditTeacher(row)">
                  {{ $t('common.edit') }}
                </button>
                <button
                  class="school-admin-action-btn"
                  @click="handleDeleteTeacher(row)">
                  {{ $t('common.delete') }}
                </button>
              </div>
            </template>
          </MTable>
        </div>

        <!-- 分页 -->
        <div class="school-admin-pagination">
          <MPagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
            show-quick-jumper />
        </div>
      </div>
    </div>

    <!-- 添加/编辑校管理员弹窗 -->
    <MModal v-model="showTeacherModal" custom-width="420px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="school-admin-modal p-8 relative">
        <!-- 关闭按钮 -->
        <button class="school-admin-modal__close absolute top-4 right-4 text-gray-400 hover:text-gray-600" @click="showTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- 标题 -->
        <h3 class="school-admin-modal__title text-center text-lg font-medium text-[#4D4D4D] mb-8">
          {{ isEditTeacher ? $t('schoolAdmin.editAdmin') : $t('schoolAdmin.addAdmin') }}
        </h3>

        <!-- 表单 -->
        <div class="space-y-4">
          <!-- 姓名输入框 -->
          <input 
            v-model="teacherForm.teacherName" 
            type="text"
            :placeholder="$t('schoolAdmin.inputAdminName')"
            class="school-admin-form-input w-full px-4 py-3 border rounded-full text-sm placeholder-[#999] outline-none"
          />
          
          <!-- 手机号输入框 -->
          <div class="school-admin-phone-input flex items-center border rounded-full relative">
            <div class="pl-4 pr-1 py-3">
              <CountryCodeSelector 
                ref="countryCodeRef"
                v-model="teacherForm.countryCode"
                @change="handleCountryChange"
              />
            </div>
            <input 
              v-model="teacherForm.phone" 
              type="tel" 
              inputmode="numeric"
              :maxlength="phoneMaxLength"
              @input="handlePhoneInput"
              :placeholder="$t('schoolAdmin.inputAdminPhone')"
              class="flex-1 px-2 py-3 text-sm text-[#4D4D4D] placeholder-[#999] outline-none bg-transparent rounded-r-full"
            />
          </div>
        </div>

        <!-- 提示文字 -->
        <p class="text-sm text-[#999] mt-6 leading-relaxed">
          {{ $t('schoolAdmin.adminCreateTip') }}{{ teacherPassword || 'XXXXXX' }}
        </p>

        <p
          v-if="!isEditTeacher && shouldShowRemainingAdminCount"
          class="text-sm text-[#FF4D4F] mt-4 leading-relaxed"
        >
          *剩余可添加校管理员人数:{{ remainingAdminCount }}人
        </p>

        <!-- 按钮组 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button 
            class="school-admin-modal-btn school-admin-modal-btn--ghost w-[120px] h-[44px] border rounded-full transition-colors"
            @click="showTeacherModal = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            class="school-admin-modal-btn school-admin-modal-btn--primary w-[120px] h-[44px] text-white rounded-full transition-colors"
            @click="handleConfirmTeacher"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </MModal>

    <MModal
      v-model="showAdminLimitModal"
      custom-width="420px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="school-admin-modal p-8 relative">
        <button
          class="school-admin-modal__close absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          @click="showAdminLimitModal = false"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 class="text-center text-[18px] font-medium text-[#4D4D4D] mb-8">提示</h3>

        <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed px-4">
          可创建校管理员账号已达最大限制，请联系管理员人员申请开通更多账号。
        </p>

        <div class="flex justify-center mt-8">
          <button
            class="w-[136px] h-[44px] bg-[#40A9FF] text-white rounded-[8px] hover:bg-[#2f96eb] transition-colors"
            @click="showAdminLimitModal = false"
          >
            确定
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除教师确认弹窗 -->
    <MModal v-model="showDeleteTeacherModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="school-admin-modal h-[249px] p-6 relative flex flex-col">
        <button class="school-admin-modal__close absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showDeleteTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="school-admin-modal__title text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ deleteTeacherConfirmText }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="school-admin-modal-btn school-admin-modal-btn--ghost w-[136px] h-[40px] border rounded-lg"
            @click="showDeleteTeacherModal = false">{{ $t('common.cancel') }}</button>
          <button class="school-admin-modal-btn school-admin-modal-btn--primary w-[136px] h-[40px] text-white rounded-lg"
            @click="handleConfirmDeleteTeacher">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

    <!-- 重置教师密码确认弹窗 -->
    <MModal v-model="showResetTeacherModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="school-admin-modal h-[249px] p-6 relative flex flex-col">
        <button class="school-admin-modal__close absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showResetTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="school-admin-modal__title text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ resetTeacherConfirmText }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="school-admin-modal-btn school-admin-modal-btn--ghost w-[136px] h-[40px] border rounded-lg"
            @click="showResetTeacherModal = false">{{ $t('common.cancel') }}</button>
          <button class="school-admin-modal-btn school-admin-modal-btn--primary w-[136px] h-[40px] text-white rounded-lg"
            @click="handleConfirmResetTeacher">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>

  </div>
</template>

<script setup lang="ts">
import { districtAdmin } from '~/composables/api/districtAdmin'

import { useSchoolUser } from '~/composables/api/useSchoolUser'
import { useTeacher } from '~/composables/api/useTeacher'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()

const route = useRoute()
const router = useRouter()
// const { getSchoolDetail } = districtAdmin()
const schoolUserApi = useSchoolUser()
const { getStudentPassword, getLimit } = useTeacher()

const schoolAdminPageRef = ref<HTMLElement | null>(null)
let schoolAdminPageResizeObserver: ResizeObserver | null = null
const schoolAdminLayoutWidth = ref(1360)

// 学校ID
const orgId = computed(() => route.params.orgId as string)

const getSchoolAdminLayoutWidth = () => {
  if (typeof window === 'undefined') {
    return 1360
  }

  const clientWidth = document.documentElement?.clientWidth || 0
  const pageClientWidth = schoolAdminPageRef.value?.clientWidth || 0
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

const syncSchoolAdminLayoutWidth = () => {
  schoolAdminLayoutWidth.value = getSchoolAdminLayoutWidth()
}

const schoolAdminShellWidth = computed(() => {
  if (schoolAdminLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(schoolAdminLayoutWidth.value))}px`
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(schoolAdminLayoutWidth.value * 0.9))
  )}px`
})

const pageAdaptiveStyle = computed(() => ({
  '--school-admin-shell-width': schoolAdminShellWidth.value
}))

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
const remainingAdminCount = ref<number | null>(null)
const showAdminLimitModal = ref(false)
const shouldShowRemainingAdminCount = computed(
  () => remainingAdminCount.value !== null && remainingAdminCount.value > 0
)

// 表格列配置
const teacherTableColumns = computed(() => [
  { key: 'nickName', title: t('schoolAdmin.adminName'), minWidth: '100px' },
  { key: 'userName', title: t('schoolAdmin.account'), minWidth: '120px' },
  { key: 'phonenumber', title: t('schoolAdmin.phone'), minWidth: '120px' },
  { key: 'createTime', title: t('school.createTime'), minWidth: '160px' },
  { key: 'action', title: t('common.operation'), width: '240px', align: 'center' as const }
])

// 表格数据
const tableData = ref<any[]>([])

// 教师弹窗
const showTeacherModal = ref(false)
const showDeleteTeacherModal = ref(false)
const showResetTeacherModal = ref(false)
const isEditTeacher = ref(false)
const teacherForm = reactive({ id: '', teacherName: '', phone: '', countryCode: '86' })
const countryCodeRef = ref<any>(null)
const phoneMaxLength = ref(11)
const deleteTeacherConfirmText = ref('')
const deleteTeacherIds = ref<string[]>([])
const resetTeacherConfirmText = ref('')
const resetTeacherIds = ref<string[]>([])

const getPhoneMaxLength = (countryCode: string) => {
  const countries = countryCodeRef.value?.countries || []
  const matched = countries.find((country: any) => country.code === countryCode)
  return Number(matched?.maxLength) || 11
}

const handlePhoneInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
    .replace(/\D/g, '')
    .slice(0, phoneMaxLength.value)
  teacherForm.phone = value
}

// 国家区号变更
const handleCountryChange = (country: any) => {
  phoneMaxLength.value = Number(country?.maxLength) || 11
  teacherForm.phone = (teacherForm.phone || '').replace(/\D/g, '').slice(0, phoneMaxLength.value)
}

// 获取学校信息
// const fetchSchoolInfo = async () => {
//   try {
//     const detail = await getSchoolDetail(orgId.value)
//     schoolInfo.value = detail
//   } catch (error) {
//     console.error('获取学校信息失败:', error)
//   }
// }

// 获取教师统一密码（使用班级管理的学生密码接口）
const fetchTeacherPassword = async () => {
  try {
    const pwd = await getStudentPassword(orgId.value)
    teacherPassword.value = pwd.teacherPwd || 'xxxxxxxx'
  } catch (error) {
    console.error('获取教师密码失败', error)
  }
}

const parseRemainingAdminCount = (data: any) => {
  if (data == null) return null

  const rawValue =
    typeof data === 'number' || typeof data === 'string'
      ? Number(data)
      : Number.NaN

  if (Number.isFinite(rawValue)) {
    return rawValue
  }

  const directCandidates = [
    data?.remainCount,
    data?.remainingCount,
    data?.remainNum,
    data?.remainingNum,
    data?.surplusNum,
    data?.leftNum,
    data?.adminRemainCount,
    data?.schoolAdminRemainCount,
    data?.schoolAdminRemainingCount,
  ]

  for (const candidate of directCandidates) {
    const value = Number(candidate)
    if (Number.isFinite(value)) {
      return value
    }
  }

  const limitCandidates = [
    data?.limit,
    data?.maxCount,
    data?.maxNum,
    data?.adminLimit,
    data?.schoolAdminLimit,
  ]

  for (const candidate of limitCandidates) {
    const value = Number(candidate)
    if (Number.isFinite(value)) {
      return Math.max(value - total.value, 0)
    }
  }

  return null
}

const fetchRemainingAdminCount = async () => {
  if (!orgId.value) {
    remainingAdminCount.value = null
    return
  }

  try {
    const data = await getLimit({ orgId: orgId.value })
    remainingAdminCount.value = parseRemainingAdminCount(data)
  } catch (error) {
    console.error('获取校管理员剩余人数失败:', error)
    remainingAdminCount.value = null
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
    await fetchRemainingAdminCount()
  } catch (error: any) {
    console.error('获取校管理员列表失败:', error)
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
  if (remainingAdminCount.value === 0) {
    showAdminLimitModal.value = true
    return
  }

  isEditTeacher.value = false
  teacherForm.id = ''
  teacherForm.teacherName = ''
  teacherForm.phone = ''
  teacherForm.countryCode = '86'
  phoneMaxLength.value = getPhoneMaxLength(teacherForm.countryCode)
  showTeacherModal.value = true
}

// 编辑教师
const handleEditTeacher = (row: any) => {
  isEditTeacher.value = true
  teacherForm.id = row.userId
  teacherForm.teacherName = row.nickName
  teacherForm.countryCode = row.countryCode || '86'
  phoneMaxLength.value = getPhoneMaxLength(teacherForm.countryCode)
  teacherForm.phone = (row.phonenumber || '').replace(/\D/g, '').slice(0, phoneMaxLength.value)
  showTeacherModal.value = true
}

// 确认添加/编辑教师
const handleConfirmTeacher = async () => {
  if (!teacherForm.teacherName.trim()) { ElMessage.warning(t('schoolAdmin.pleaseInputTeacherName')); return }
  if (!teacherForm.phone.trim()) { ElMessage.warning(t('schoolAdmin.pleaseInputPhone')); return }
  
  // 使用 CountryCodeSelector 组件验证手机号格式
  if (countryCodeRef.value) {
    const validation = countryCodeRef.value.validatePhone(teacherForm.phone.trim())
    if (!validation.valid) {
      ElMessage.warning(t(validation.message))
      return
    }
  }
  
  try {
    if (isEditTeacher.value) {
      await schoolUserApi.updateTeacher({ 
        userId: teacherForm.id, 
        nickName: teacherForm.teacherName, 
        phonenumber: teacherForm.phone,
        countryCode: teacherForm.countryCode
      })
      ElMessage.success(t('common.editSuccess'))
    } else {
      await schoolUserApi.createTeacher({ 
        orgId: orgId.value, 
        nickName: teacherForm.teacherName, 
        phonenumber: teacherForm.phone,
        countryCode: teacherForm.countryCode
      })
      ElMessage.success(t('common.createSuccess'))
    }
    showTeacherModal.value = false
    await fetchTeacherList()
  } catch (error: any) { 
    // 错误提示由全局处理，这里不重复显示
  }
}

// 删除教师
const handleDeleteTeacher = (row: any) => {
  deleteTeacherIds.value = [row.userId]
  deleteTeacherConfirmText.value = t('schoolAdmin.confirmDeleteTeacher', { name: row.nickName })
  showDeleteTeacherModal.value = true
}

const handleConfirmDeleteTeacher = async () => {
  try {
    await schoolUserApi.deleteTeacher(deleteTeacherIds.value, undefined, orgId.value)
    ElMessage.success(t('common.deleteSuccess'))
    showDeleteTeacherModal.value = false
    await fetchTeacherList()
  } catch (error: any) {
    console.error('删除校管理员失败:', error)
  }
}

// 重置密码
const handleResetTeacherPassword = (row: any) => {
  resetTeacherIds.value = [row.userId]
  resetTeacherConfirmText.value = t('schoolAdmin.confirmResetPassword', { name: row.nickName })
  showResetTeacherModal.value = true
}

const handleConfirmResetTeacher = async () => {
  try {
    await schoolUserApi.resetTeacherPassword(resetTeacherIds.value, undefined, orgId.value)
    ElMessage.success(t('schoolAdmin.resetPasswordSuccess'))
    showResetTeacherModal.value = false
  } catch (error: any) {
    console.error('重置校管理员密码失败:', error)
  }
}

// 导出
const handleExport = async () => {
  try {
    await schoolUserApi.exportTeacherInfo('校管理员账号信息.xlsx', orgId.value)
    ElMessage.success(t('common.exportSuccess'))
  } catch (error: any) {
    ElMessage.error(error.message || t('common.exportFailed'))
  }
}

// 初始化加载
onMounted(async () => {
  syncSchoolAdminLayoutWidth()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncSchoolAdminLayoutWidth)
    window.visualViewport?.addEventListener('resize', syncSchoolAdminLayoutWidth)
    if (window.ResizeObserver && schoolAdminPageRef.value) {
      schoolAdminPageResizeObserver = new window.ResizeObserver(() => {
        syncSchoolAdminLayoutWidth()
      })
      schoolAdminPageResizeObserver.observe(schoolAdminPageRef.value)
    }
  }
  //   new Promise((resolve) => {
  //   Promise.all([

  //   ]).then(() => {
  //     resolve()
  //   })
  // })
  // fetchSchoolInfo(),
  await fetchTeacherPassword()
  await fetchTeacherList()
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', syncSchoolAdminLayoutWidth)
  window.visualViewport?.removeEventListener('resize', syncSchoolAdminLayoutWidth)
  schoolAdminPageResizeObserver?.disconnect()
  schoolAdminPageResizeObserver = null
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchTeacherList()
})
</script>

<style scoped>
.school-admin-page {
  --school-admin-min-width: 1280px;
  --school-admin-max-width: 1920px;
  --school-admin-shell-width: var(--school-admin-min-width);
  width: 100%;
  height: 100%;
  min-width: var(--school-admin-min-width);
  min-height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 18px 0 20px;
  background: linear-gradient(180deg, #f3f6fb 0%, #eef3fb 100%);
}

.school-admin-shell {
  width: min(
    var(--school-admin-max-width),
    max(var(--school-admin-min-width), var(--school-admin-shell-width))
  );
  min-width: var(--school-admin-min-width);
  margin: 0 auto;
  padding: 0 clamp(32px, 3vw, 56px);
  box-sizing: border-box;
}

.school-admin-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 14px;
}

.school-admin-breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #16233d;
}

.school-admin-breadcrumb__back {
  color: #16233d;
  cursor: pointer;
  transition: color 0.2s ease;
}

.school-admin-breadcrumb__back:hover {
  color: #005bc2;
}

.school-admin-stat-card {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  color: #26344f;
  font-size: 14px;
}

.school-admin-stat-card__value {
  color: #005bc2;
  font-weight: 600;
}

.school-admin-card {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 166px);
  min-height: 0;
  padding: 16px 18px 16px;
  border: 1px solid #dfe8f5;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 20px 48px rgba(38, 76, 130, 0.1);
}

.school-admin-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.school-admin-toolbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: nowrap;
  min-width: 0;
}

.school-admin-search {
  width: min(240px, 100%);
}

.school-admin-search :deep(input) {
  min-height: 40px;
  border-color: #d6e2f0 !important;
  border-radius: 12px !important;
  background: #ffffff !important;
  color: #1f2a37;
}

.school-admin-search :deep(input:focus) {
  border-color: #4b8eff !important;
  box-shadow: 0 0 0 4px rgba(75, 142, 255, 0.12);
}

.school-admin-password-tip {
  color: #8a96a3;
  font-size: 14px;
  white-space: nowrap;
  flex-shrink: 0;
}

.school-admin-password-value {
  color: #26344f;
}

.school-admin-toolbar-actions {
  display: flex;
  gap: 12px;
}

.school-admin-create-btn {
  min-height: 38px;
  padding: 0 18px !important;
  border: 1px solid #005bc2 !important;
  border-radius: 12px !important;
  background: #005bc2 !important;
  color: #ffffff !important;
}

.school-admin-create-btn:hover {
  border-color: #004a9f !important;
  background: #004a9f !important;
}

.school-admin-export-btn {
  min-height: 38px;
  padding: 0 18px !important;
  border: 1px solid #d6e2f0 !important;
  border-radius: 12px !important;
  background: #ffffff !important;
  color: #13223a !important;
}

.school-admin-export-btn:hover {
  border-color: #4b8eff !important;
  background: #f4f8ff !important;
  color: #005bc2 !important;
}

.school-admin-table-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid #dfe8f5;
  border-radius: 22px;
  background: #ffffff;
}

.school-admin-action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.school-admin-action-btn {
  min-width: 74px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #d8e4f2;
  border-radius: 10px;
  background: #ffffff;
  color: #005bc2;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.school-admin-action-btn:hover {
  border-color: #4b8eff;
  background: #f4f8ff;
}

.school-admin-pagination {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.school-admin-page :deep(.m-pagination) {
  gap: 8px;
  color: #51617a;
}

.school-admin-page :deep(.m-pagination button),
.school-admin-page :deep(.m-pagination .page-btn) {
  width: 30px;
  height: 30px;
  border-color: #d6e2f0;
  border-radius: 12px;
  color: #51617a;
}

.school-admin-page :deep(.m-pagination button:not(:disabled):hover) {
  border-color: #005bc2 !important;
  color: #005bc2 !important;
}

.school-admin-page :deep(.m-pagination button[class*="bg-"]) {
  border-color: #005bc2 !important;
  background-color: #005bc2 !important;
  color: #ffffff !important;
}

.school-admin-page :deep(.m-pagination select),
.school-admin-page :deep(.m-pagination input) {
  min-height: 30px;
  border-color: #d6e2f0 !important;
  border-radius: 8px;
  color: #13223a;
}

.school-admin-page :deep(.m-pagination select:focus),
.school-admin-page :deep(.m-pagination input:focus) {
  border-color: #005bc2 !important;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.admin-table {
  box-shadow: none !important;
  border-radius: 22px;
  overflow: hidden;
}

.admin-table :deep(.m-table) {
  box-shadow: none !important;
  border-radius: 22px;
}

.admin-table :deep(thead) {
  background: #f5f8fc !important;
}

.admin-table :deep(thead th) {
  height: 48px;
  background-color: transparent !important;
  color: #51617a !important;
  font-size: 14px;
  font-weight: 700 !important;
  border-bottom: 1px solid #dfe8f5;
}

.admin-table :deep(tbody tr) {
  background-color: #ffffff;
}

.admin-table :deep(tbody tr:hover) {
  background-color: #f4f8ff !important;
}

.admin-table :deep(tbody td) {
  height: 46px;
  color: #13223a;
  font-size: 14px;
  border-top: 1px solid #eef3f8;
  border-bottom: none !important;
  padding-top: 6px;
  padding-bottom: 6px;
}

.admin-table :deep(tbody td:first-child) {
  color: #6f7f92;
  font-weight: 600;
}

.school-admin-modal {
  border-radius: 18px;
  background: #ffffff;
}

.school-admin-modal__title {
  color: #16233d !important;
  font-weight: 600 !important;
}

.school-admin-modal__close {
  color: #8a96a3 !important;
}

.school-admin-modal__close:hover {
  color: #005bc2 !important;
}

.school-admin-modal-info {
  border: 1px solid #dfe8f5 !important;
  background: #f5f8fc !important;
  border-radius: 14px !important;
}

.school-admin-form-input,
.school-admin-phone-input {
  border-color: #d6e2f0 !important;
  color: #26344f;
}

.school-admin-form-input:focus,
.school-admin-phone-input:focus-within {
  border-color: #005bc2 !important;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.school-admin-theme-number {
  color: #005bc2 !important;
}

.school-admin-modal-btn {
  border-radius: 999px !important;
  font-weight: 600;
  transition: all 0.2s ease;
}

.school-admin-modal-btn--ghost {
  border-color: #d6e2f0 !important;
  background: #ffffff !important;
  color: #26344f !important;
}

.school-admin-modal-btn--ghost:hover {
  border-color: #005bc2 !important;
  background: #f4f8ff !important;
  color: #005bc2 !important;
}

.school-admin-modal-btn--primary {
  border: 1px solid #005bc2 !important;
  background: #005bc2 !important;
  color: #ffffff !important;
}

.school-admin-modal-btn--primary:hover {
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

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border: 2px solid #d6e2f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
}

.checkbox-box:hover {
  border-color: #005bc2;
}

.checkbox-box.checked {
  background: #005bc2;
  border-color: #005bc2;
}

.checkbox-icon {
  width: 12px;
  height: 12px;
}

@media (max-width: 768px) {
  .school-admin-page {
    padding: 20px 0 28px;
  }

  .school-admin-shell {
    padding: 0 16px;
  }

  .school-admin-page-header,
  .school-admin-toolbar,
  .school-admin-toolbar-left {
    flex-direction: column;
    align-items: stretch;
  }

  .school-admin-toolbar-actions {
    justify-content: stretch;
  }

  .school-admin-create-btn,
  .school-admin-export-btn {
    width: 100%;
  }
}
</style>
