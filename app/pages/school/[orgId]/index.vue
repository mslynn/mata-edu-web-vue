<template>
  <div class="h-full bg-[#FAFAFA] py-4 lg:py-6 overflow-auto">
    <div class="w-[92%] mx-auto">
      <!-- 页面标题和管理员人数（白色卡片外面） -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2 text-base font-medium text-gray-800">
          <span class="cursor-pointer hover:text-[#FF9900]" @click="handleBack">{{ $t('school.schoolManage') }}</span>
          <span class="text-gray-400">></span>
          <span>{{ $t('schoolAdmin.title') }}</span>
        </div>
        <div class="text-gray-600 text-sm">
          {{ $t('schoolAdmin.adminCount') }}：<span class="text-[#FF9900] font-medium">{{ total }}{{ $t('schoolAdmin.person') }}</span>
        </div>
      </div>

      <!-- 内容区域（白色卡片） -->
      <div class="bg-[#FFFFFF] rounded-[20px] p-6 shadow-sm">
        <!-- 搜索栏和操作按钮 -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-4">
            <!-- 搜索框 -->
            <div class="w-[240px]">
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
            <span class="text-sm text-[#999]">
              {{ $t('schoolAdmin.teacherPassword') }}<span class="text-[#4D4D4D]">{{ teacherPassword || 'xxxxx' }}</span>
            </span>
          </div>

          <div class="flex gap-3">
            <MButton type="primary" class="!bg-[#FF9900] hover:!bg-[#e88a00] px-4"
              @click="handleCreateAdmin">
              + {{ $t('schoolAdmin.createAdmin') }}
            </MButton>
            <MButton class="!bg-[#FAFAFA] px-4 !text-[#4D4D4D] border !border-[#E5E5E5]" @click="handleExport">
              {{ $t('school.exportData') }}
            </MButton>
          </div>
        </div>

        <!-- 表格 -->
        <div class="h-[480px] overflow-auto">
          <MTable :columns="teacherTableColumns" :data="tableData" :loading="loading" show-index row-key="userId"
            class="admin-table">
            <template #action="{ row }">
              <div class="flex items-center justify-center gap-2 whitespace-nowrap">
                <button
                  class="px-3 py-1 text-xs border rounded transition-colors text-[#4D4D4D] border-[#E5E5E5] hover:bg-[#FFF8F0]"
                  @click="handleResetTeacherPassword(row)">
                  {{ $t('schoolAdmin.resetPassword') }}
                </button>
                <button
                  class="px-3 py-1 text-xs border rounded transition-colors text-[#4D4D4D] border-[#E5E5E5] hover:bg-[#FFF8F0]"
                  @click="handleEditTeacher(row)">
                  {{ $t('common.edit') }}
                </button>
                <button
                  class="px-3 py-1 text-xs border rounded transition-colors text-[#4D4D4D] border-[#E5E5E5] hover:bg-[#FFF8F0]"
                  @click="handleDeleteTeacher(row)">
                  {{ $t('common.delete') }}
                </button>
              </div>
            </template>
          </MTable>
        </div>

        <!-- 分页 -->
        <div class="mt-6 flex justify-center">
          <MPagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
            show-quick-jumper />
        </div>
      </div>
    </div>

    <!-- 添加/编辑校管理员弹窗 -->
    <MModal v-model="showTeacherModal" custom-width="420px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="p-8 relative">
        <!-- 关闭按钮 -->
        <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600" @click="showTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-8">
          {{ isEditTeacher ? $t('schoolAdmin.editAdmin') : $t('schoolAdmin.addAdmin') }}
        </h3>

        <!-- 表单 -->
        <div class="space-y-4">
          <!-- 姓名输入框 -->
          <input 
            v-model="teacherForm.teacherName" 
            type="text"
            :placeholder="$t('schoolAdmin.inputAdminName')"
            class="w-full px-4 py-3 border border-[#E5E5E5] rounded-full text-sm text-[#4D4D4D] placeholder-[#999] outline-none focus:border-[#FF9900]"
          />
          
          <!-- 手机号输入框 -->
          <div class="flex items-center border border-[#E5E5E5] rounded-full focus-within:border-[#FF9900] relative">
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

        <!-- 按钮组 -->
        <div class="flex items-center justify-center gap-4 mt-8">
          <button 
            class="w-[120px] h-[44px] border border-[#E5E5E5] rounded-full text-[#4D4D4D] hover:bg-gray-50 transition-colors"
            @click="showTeacherModal = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button 
            class="w-[120px] h-[44px] bg-[#FF9900] text-white rounded-full hover:bg-[#E68A00] transition-colors"
            @click="handleConfirmTeacher"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 删除教师确认弹窗 -->
    <MModal v-model="showDeleteTeacherModal" custom-width="381px" :show-footer="false" :show-close="false"
      content-class="!p-0">
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showDeleteTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ deleteTeacherConfirmText }}</p>
        </div>
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
      <div class="h-[249px] p-6 relative flex flex-col">
        <button class="absolute top-3 right-3 text-gray-400 hover:text-gray-600" @click="showResetTeacherModal = false">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">{{ resetTeacherConfirmText }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showResetTeacherModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
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
const { getStudentPassword } = useTeacher()

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
    ElMessage.error(error.message || t('schoolAdmin.getListFailed'))
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
    fetchTeacherList()
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
    await schoolUserApi.deleteTeacher(deleteTeacherIds.value)
    ElMessage.success(t('common.deleteSuccess'))
    showDeleteTeacherModal.value = false
    fetchTeacherList()
  } catch (error: any) { ElMessage.error(error.message || t('schoolAdmin.deleteFailed')) }
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
  } catch (error: any) { ElMessage.error(error.message || t('schoolAdmin.resetPasswordFailed')) }
}

// 导出
const handleExport = async () => {
  try {
    await schoolUserApi.exportTeacherInfo()
    ElMessage.success(t('common.exportSuccess'))
  } catch (error: any) {
    ElMessage.error(error.message || t('common.exportFailed'))
  }
}

// 初始化加载
onMounted(() => {
  //   new Promise((resolve) => {
  //   Promise.all([

  //   ]).then(() => {
  //     resolve()
  //   })
  // })
  // fetchSchoolInfo(),
    fetchTeacherPassword(),
    fetchTeacherList()
})

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchTeacherList()
})
</script>

<style scoped>
/* 覆盖 MTable 表头背景色 */
.admin-table :deep(thead) {
  background-color: #FAFAFA !important;
}

.admin-table :deep(thead th) {
  background-color: transparent !important;
}

/* 去掉表格圆角和阴影 */
.admin-table {
  box-shadow: none !important;
  border-radius: 8px;
  overflow: hidden;
}

/* 表格行斑马纹 - 交叉间隔色 */
.admin-table :deep(tbody tr:nth-child(odd)) {
  background-color: #FFFFFF;
}

.admin-table :deep(tbody tr:nth-child(even)) {
  background-color: #F9F9F9;
}

.admin-table :deep(tbody tr:hover) {
  background-color: #FFF8F0 !important;
}

.admin-table :deep(tbody td) {
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
</style>
