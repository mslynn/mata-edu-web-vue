<template>
  <div class="h-full bg-[#F5F7FA] p-4 lg:p-6 overflow-hidden">
    <div class="max-w-[1600px] mx-auto h-full">
      <!-- 白色卡片容器 -->
      <div class="bg-white rounded-lg shadow-sm p-4 lg:p-6 h-full flex flex-col">
        <!-- 顶部搜索栏 -->
        <div
          class="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6 flex-shrink-0"
        >
          <!-- 左侧：搜索条件 -->
          <div
            class="w-full xl:w-auto flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4"
          >
            <div
              class="w-full sm:w-auto sm:min-w-[220px] lg:min-w-[260px] xl:min-w-[280px]"
            >
              <MInput
                v-model="searchName"
                :placeholder="$t('city.searchAdminPlaceholder')"
                clearable
                @enter="handleSearch"
                @clear="handleSearch"
              >
                <template #prefix>
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </template>
              </MInput>
            </div>

            <div
              class="w-full sm:w-auto sm:min-w-[220px] lg:min-w-[240px] xl:min-w-[260px]"
            >
              <MInput
                v-model="searchPhone"
                :placeholder="$t('city.searchPhonePlaceholder')"
                clearable
                @enter="handleSearch"
                @clear="handleSearch"
              >
                <template #prefix>
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 5h2l3 10h10l3-8H8"
                    />
                  </svg>
                </template>
              </MInput>
            </div>

            <div class="flex items-center gap-3 flex-shrink-0">
              <MButton
                type="primary"
                class="!bg-[#FF9900] hover:!bg-[#e88a00] px-6 whitespace-nowrap"
                @click="handleSearch"
              >
                {{ $t('city.query') }}
              </MButton>
              <MButton
                type="primary"
                class="!bg-[#FF9900] hover:!bg-[#e88a00] px-6 whitespace-nowrap"
                @click="handleReset"
              >
                {{ $t('common.reset') }}
              </MButton>
            </div>
          </div>

          <!-- 右侧：导出按钮 -->
          <div class="w-full xl:w-auto flex justify-start xl:justify-end flex-shrink-0">
            <MButton
              type="primary"
              class="!bg-[#FF9900] hover:!bg-[#e88a00] px-6 whitespace-nowrap"
              @click="handleExport"
            >
              {{ $t('city.exportData') }}
            </MButton>
          </div>
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
              <div
                class="flex items-center justify-center gap-2 flex-wrap whitespace-nowrap"
              >
                <button
                  class="px-3 py-1 text-xs border border-[#FF9900] text-[#FF9900] rounded hover:bg-[#FF9900] hover:text-white transition-colors"
                  @click="handleViewDetail(row)"
                >
                  {{ $t('city.viewDetail') }}
                </button>
                <button
                  class="px-3 py-1 text-xs border border-[#FF9900] text-[#FF9900] rounded hover:bg-[#FF9900] hover:text-white transition-colors"
                  @click="handleResetPassword(row)"
                >
                  {{ $t('city.resetPassword') }}
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
      :title="$t('city.viewAdminTitle')"
      :show-footer="false"
      size="small"
    >
      <div class="bg-[#F5F5F5] rounded-lg p-6 space-y-4">
        <div class="flex">
          <span class="text-gray-800 font-medium w-24 flex-shrink-0">{{ $t('city.name') }}</span>
          <span class="text-gray-600">{{ currentAdmin?.nickName || '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-24 flex-shrink-0">{{ $t('city.phoneNumber') }}</span>
          <span class="text-gray-600">{{ currentAdmin?.phonenumber || '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-24 flex-shrink-0">{{ $t('city.schoolCount') }}</span>
          <span class="text-gray-600">{{ currentAdmin?.schoolCount ?? '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-24 flex-shrink-0">{{ $t('city.teacherCount') }}</span>
          <span class="text-gray-600">{{ currentAdmin?.teacherCount ?? '-' }}</span>
        </div>
        <div class="flex">
          <span class="text-gray-800 font-medium w-24 flex-shrink-0">{{ $t('city.studentCount') }}</span>
          <span class="text-gray-600">{{ currentAdmin?.studentCount ?? '-' }}</span>
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
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">{{ $t('common.tips') }}</h3>
        <div class="flex-1 flex items-center justify-center">
          <p class="text-[16px] text-[#4D4D4D]">{{ resetPasswordConfirmText }}</p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50" @click="showResetPasswordModal = false">{{ $t('common.cancel') }}</button>
          <button class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]" @click="handleConfirmResetPassword">{{ $t('common.confirm') }}</button>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { MMessage } from '~/components/ui'
import { useI18n } from 'vue-i18n'
import { cityAdmin } from '~/composables/api/city'

const { t } = useI18n()
const { getCityAdminList, getCityAdminDetail, resetCityAdminPassword, exportCityAdminInfo } = cityAdmin()

definePageMeta({
  layout: 'default',
})

// 搜索条件
const searchName = ref('')
const searchPhone = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 表格列配置（适配不同宽度，使用 minWidth）
const columns = computed(() => [
  { key: 'account', title: t('city.account'), minWidth: '140px', align: 'center' as const },
  { key: 'adminName', title: t('city.adminName'), minWidth: '160px', align: 'center' as const },
  { key: 'phone', title: t('city.phone'), minWidth: '150px', align: 'center' as const },
  { key: 'createTime', title: t('city.createTime'), minWidth: '180px', align: 'center' as const },
  { key: 'actions', title: t('city.operation'), minWidth: '220px', align: 'center' as const },
])



// 表格数据
const tableData = ref<any[]>([])

// 详情弹窗
const detailModalVisible = ref(false)
const currentAdmin = ref<any>(null)

// 重置密码弹窗
const showResetPasswordModal = ref(false)
const resetPasswordConfirmText = ref('')
const resetUserId = ref<string[]>([])

// 获取市管理员列表
const fetchList = async () => {
  loading.value = true
  try {
    const res = await getCityAdminList({
      nickName: searchName.value.trim() || undefined,
      phonenumber: searchPhone.value.trim() ? Number(searchPhone.value.trim()) : undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    })

    const list = (res?.list || []) as any[]
    tableData.value = list.map((item, index) => ({
      id: item.userId || index + 1,
      account: item.userName || '',
      adminName: item.nickName || '',
      phone: item.phonenumber || '',
      createTime: item.createTime || '',
    }))
    total.value = res?.total || 0
  } catch (error: any) {
    console.error('获取市管理员列表失败：', error)
    MMessage.error(error.message || t('city.getListFailed'))
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchList()
}

// 重置
const handleReset = () => {
  searchName.value = ''
  searchPhone.value = ''
  currentPage.value = 1
  fetchList()
}

// 导出
const handleExport = async () => {
  try {
    await exportCityAdminInfo()
  } catch (error: any) {
    MMessage.error(error.message || t('common.exportFailed'))
  }
}

// 查看详情
const handleViewDetail = async (row: any) => {
  detailModalVisible.value = true
  try {
    const detail = await getCityAdminDetail(row.id)
    currentAdmin.value = detail
  } catch (error) {
    console.error('获取详情失败:', error)
  }
}

// 重置密码
const handleResetPassword = (row: any) => {
  resetUserId.value = [row.id]
  resetPasswordConfirmText.value = t('city.confirmResetPassword', { name: row.adminName })
  showResetPasswordModal.value = true
}

// 确认重置密码
const handleConfirmResetPassword = async () => {
  try {
    await resetCityAdminPassword(resetUserId.value)
    MMessage.success(t('city.resetPasswordSuccess'))
    showResetPasswordModal.value = false
  } catch (error: any) {
    MMessage.error(error.message || t('city.resetPasswordFailed'))
  }
}

// 初始化
onMounted(() => {
  fetchList()
})

// 分页变化监听
watch([currentPage, pageSize], () => {
  fetchList()
})
</script>

<style scoped>
/* 适配 1200 / 1300 / 1400 / 1500 宽度时，整体最大宽度控制在 1600 内，保证居中效果 */
@media (max-width: 1200px) {
  .max-w-\[1600px\] {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>


