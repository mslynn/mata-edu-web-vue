<template>
  <div class="h-full bg-[#FAFAFA] p-4 lg:p-6 overflow-auto">
    <div class="w-[90%] mx-auto">
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-lg font-medium text-gray-800 mb-4">
          {{ $t("city.districtManage") }}
        </h1>
        <div class="text-gray-600 text-sm">
          {{ $t("city.adminCount") }}：{{ total }}个
        </div>
      </div>

      <!-- 内容区域（搜索栏 + 表格 + 分页） -->
      <div class="bg-[#FFFFFF] rounded-[20px] p-6 shadow-sm">
        <!-- 搜索栏 -->
        <div class="flex items-center justify-between mb-4">
          <!-- 搜索框 -->
          <div class="w-[320px] max-w-full">
            <MInput
              v-model="searchKeyword"
              :placeholder="$t('city.searchAdminPlaceholder')"
              clearable
              @enter="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix>
                <svg
                  class="w-4 h-4 text-gray-400"
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

          <!-- 导出按钮 -->
          <MButton
            type="primary"
            class="!bg-[#FAFAFA] px-6 !text-[#4D4D4D] border border-[#E5E5E5] hover:!bg-[#F0F0F0]"
            @click="handleExport"
          >
            {{ $t("city.exportData") }}
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
            class="city-table"
          >
            <template #actions="{ row }">
              <div class="flex items-center justify-center gap-2">
                <button
                  class="px-3 py-1 text-xs border rounded hover:bg-[#FFF8F0] transition-colors"
                  @click="handleViewDetail(row)"
                >
                  {{ $t("city.viewDetail") }}
                </button>
                <button
                  class="px-3 py-1 text-xs border rounded hover:bg-[#FFF8F0] transition-colors"
                  @click="handleResetPassword(row)"
                >
                  {{ $t("city.resetPassword") }}
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
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="detailModalVisible = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 标题 -->
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          {{ $t("city.viewAdminTitle") }}
        </h3>

        <!-- 内容区域 -->
        <div class="bg-[#FEF2DB] rounded-lg p-5 space-y-3 mb-6">
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{ $t("city.name") }}</span>
            <span class="text-[#4D4D4D]">{{ currentAdmin?.nickName || "-" }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{
              $t("city.manageArea")
            }}</span>
            <span class="text-[#4D4D4D]">{{
              currentAdmin?.areaName || currentAdmin?.deptName || "-"
            }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{
              $t("city.schoolCount")
            }}</span>
            <span class="text-[#4D4D4D]">{{ currentAdmin?.schoolCount ?? "-" }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{
              $t("city.teacherCount")
            }}</span>
            <span class="text-[#4D4D4D]">{{ currentAdmin?.teacherCount ?? "-" }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{
              $t("city.studentCount")
            }}</span>
            <span class="text-[#4D4D4D]">{{ currentAdmin?.studentCount ?? "-" }}</span>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-full text-[#4D4D4D] hover:bg-gray-50 transition-colors"
            @click="detailModalVisible = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-full hover:bg-[#E68A00] transition-colors"
            @click="detailModalVisible = false"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 重置密码确认弹窗 -->
    <MModal
      v-model="showResetPasswordModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[249px] p-6 relative flex flex-col">
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showResetPasswordModal = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          {{ $t("common.tips") }}
        </h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">
            {{ resetPasswordConfirmText }}
          </p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button
            class="w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showResetPasswordModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="w-[136px] h-[40px] bg-[#FF9900] text-white rounded-lg hover:bg-[#E68A00]"
            @click="handleConfirmResetPassword"
          >
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </MModal>

    <!-- 重置密码成功弹窗 -->
    <MModal
      v-model="showResetSuccessModal"
      custom-width="381px"
      :show-footer="false"
      :show-close="false"
      content-class="!p-0"
    >
      <div class="h-[195px] p-6 relative flex flex-col justify-center">
        <button
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          @click="showResetSuccessModal = false"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 class="text-center text-lg font-medium text-[#4D4D4D] mb-4">
          {{ $t("city.resetPasswordSuccess") }}
        </h3>
        <div class="bg-[#FEF2DB] rounded-lg px-6 py-3 flex items-center justify-center">
          <p class="text-center text-[16px] text-[#4D4D4D]">
            <span>{{ $t("city.newPasswordIs") }}</span>
            <span
              class="cursor-pointer hover:text-[#FF9900] transition-colors select-all"
              @click="handleCopyPassword"
              :title="$t('common.clickToCopy')"
              >{{ newPassword }}</span
            >
          </p>
        </div>
      </div>
    </MModal>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "~/components/ui";
import { useI18n } from "vue-i18n";
import { cityAdmin } from "~/composables/api/city";

const { t } = useI18n();
const {
  getCityAdminList,
  getCityAdminDetail,
  resetCityAdminPassword,
  exportCityAdminInfo,
} = cityAdmin();

definePageMeta({
  layout: "default",
});

// 搜索条件
const searchKeyword = ref("");

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);

// 表格列配置
const columns = computed(() => [
  {
    key: "areaName",
    title: t("city.belongArea"),
    minWidth: "120px",
    align: "center" as const,
  },
  {
    key: "adminName",
    title: t("city.adminName"),
    minWidth: "140px",
    align: "center" as const,
  },
  {
    key: "account",
    title: t("city.account"),
    minWidth: "140px",
    align: "center" as const,
  },
  {
    key: "phone",
    title: t("city.phone"),
    minWidth: "140px",
    align: "center" as const,
  },
  {
    key: "createTime",
    title: t("city.createTime"),
    minWidth: "180px",
    align: "center" as const,
  },
  {
    key: "actions",
    title: t("city.operation"),
    minWidth: "200px",
    align: "center" as const,
  },
]);

// 表格数据
const tableData = ref<any[]>([]);

// 详情弹窗
const detailModalVisible = ref(false);
const currentAdmin = ref<any>(null);

// 重置密码弹窗
const showResetPasswordModal = ref(false);
const resetPasswordConfirmText = ref("");
const resetUserId = ref<string[]>([]);

// 重置密码成功弹窗
const showResetSuccessModal = ref(false);
const newPassword = ref("");

// 获取列表
const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getCityAdminList({
      nickName: searchKeyword.value.trim() || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });

    const list = (res?.list || []) as any[];
    tableData.value = list.map((item, index) => ({
      id: item.userId || index + 1,
      areaName: item.areaName || item.deptName || "-",
      adminName: item.nickName || "-",
      account: item.userName || "-",
      phone: item.phonenumber || "-",
      createTime: item.createTime || "-",
    }));
    total.value = res?.total || 0;
  } catch (error: any) {
    console.error("获取列表失败：", error);
    ElMessage.error(error.message || t("city.getListFailed"));
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchList();
};

// 导出
const handleExport = async () => {
  try {
    await exportCityAdminInfo();
  } catch (error: any) {
    ElMessage.error(error.message || t("common.exportFailed"));
  }
};

// 查看详情
const handleViewDetail = async (row: any) => {
  detailModalVisible.value = true;
  try {
    const detail = await getCityAdminDetail(row.id);
    currentAdmin.value = detail;
  } catch (error) {
    console.error("获取详情失败:", error);
  }
};

// 重置密码
const handleResetPassword = (row: any) => {
  resetUserId.value = [row.id];
  resetPasswordConfirmText.value = t("city.confirmResetPassword", {
    name: row.adminName,
  });
  showResetPasswordModal.value = true;
};

// 确认重置密码
const handleConfirmResetPassword = async () => {
  try {
    const res = await resetCityAdminPassword(resetUserId.value);
    showResetPasswordModal.value = false;
    // 显示成功弹窗，展示新密码
    newPassword.value = res?.password || res || "12345678";
    showResetSuccessModal.value = true;
  } catch (error: any) {
    ElMessage.error(error.message || t("city.resetPasswordFailed"));
  }
};

// 复制密码
const handleCopyPassword = async () => {
  if (!newPassword.value) return;

  try {
    await navigator.clipboard.writeText(newPassword.value);
    ElMessage.success(t("common.copySuccess"));
  } catch (error) {
    // 降级方案：使用传统方法
    const textArea = document.createElement("textarea");
    textArea.value = newPassword.value;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      ElMessage.success(t("common.copySuccess"));
    } catch (err) {
      ElMessage.error(t("common.copyFailed"));
    }
    document.body.removeChild(textArea);
  }
};

// 初始化
onMounted(() => {
  fetchList();
});

// 分页变化监听
watch([currentPage, pageSize], () => {
  fetchList();
});
</script>

<style scoped>
/* 覆盖 MTable 表头背景色为浅蓝色 */
.city-table :deep(thead) {
  background-color: #fafafa !important;
}

.city-table :deep(thead th) {
  background-color: transparent !important;
}

/* 去掉表格圆角和阴影 */
.city-table {
  box-shadow: none !important;
  border-radius: 8px;
  overflow: hidden;
}

/* 表格行斑马纹 - 交叉间隔色 */
.city-table :deep(tbody tr:nth-child(odd)) {
  background-color: #ffffff;
}

.city-table :deep(tbody tr:nth-child(even)) {
  background-color: #f9f9f9;
}

.city-table :deep(tbody tr:hover) {
  background-color: #fff8f0 !important;
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
