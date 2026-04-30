<template>
  <div ref="cityPageRef" class="city-page" :style="pageAdaptiveStyle">
    <div class="city-shell">
      <!-- 页面标题 -->
      <section class="city-page-header">
        <div class="city-page-header__copy">
          <h1 class="city-page-header__title">
            {{ $t("city.districtManage") }}
          </h1>
        </div>
        <div class="city-stat-card">
          <span class="city-stat-card__label">{{ $t("city.adminCount") }}：</span>
          <strong class="city-stat-card__value">{{ total }}</strong>
          <span class="city-stat-card__unit">人</span>
        </div>
      </section>

      <!-- 内容区域（搜索栏 + 表格 + 分页） -->
      <div class="city-card">
        <!-- 搜索栏 -->
        <div class="city-toolbar">
          <!-- 搜索框 -->
          <div class="city-search">
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
            class="city-export-btn"
            @click="handleExport"
          >
            {{ $t("city.exportData") }}
          </MButton>
        </div>

        <!-- 表格 -->
        <div class="city-table-wrap">
          <MTable
            :columns="columns"
            :data="tableData"
            :loading="loading"
            show-index
            row-key="id"
            class="city-table"
          >
            <template #actions="{ row }">
              <div class="city-action-group">
                <button
                  class="city-action-btn"
                  @click="handleViewDetail(row)"
                >
                  {{ $t("city.viewDetail") }}
                </button>
                <button
                  class="city-action-btn"
                  @click="handleResetPassword(row)"
                >
                  {{ $t("city.resetPassword") }}
                </button>
              </div>
            </template>
          </MTable>
        </div>

        <!-- 分页 -->
        <div class="city-pagination">
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
      <div class="city-modal city-modal--detail p-6 relative">
        <!-- 关闭按钮 -->
        <button
          class="city-modal__close absolute top-3 right-3 text-gray-400 hover:text-gray-600"
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
        <h3 class="city-modal__title text-center text-lg font-medium text-[#4D4D4D] mb-4">
          {{ $t("city.viewAdminTitle") }}
        </h3>

        <!-- 内容区域 -->
        <div class="city-modal-info rounded-lg p-5 space-y-3 mb-6">
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{ $t("city.name") }}</span>
            <span class="text-[#4D4D4D]">{{ currentAdmin?.nickName || "-" }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{
              $t("city.manageArea")
            }}</span>
            <span class="text-[#4D4D4D]">{{
              currentAdmin?.orgName  || "-"
            }}</span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{
              $t("city.schoolCount")
            }}</span>
            <span :class="currentAdmin?.schoolCount == null ? 'text-[#4D4D4D]' : 'city-theme-number font-medium'">
              {{ currentAdmin?.schoolCount ?? "-" }}
            </span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{
              $t("city.teacherCount")
            }}</span>
            <span :class="currentAdmin?.teacherCount == null ? 'text-[#4D4D4D]' : 'city-theme-number font-medium'">
              {{ currentAdmin?.teacherCount ?? "-" }}
            </span>
          </div>
          <div class="flex">
            <span class="text-[#4D4D4D] w-20 flex-shrink-0">{{
              $t("city.studentCount")
            }}</span>
            <span :class="currentAdmin?.studentCount == null ? 'text-[#4D4D4D]' : 'city-theme-number font-medium'">
              {{ currentAdmin?.studentCount ?? "-" }}
            </span>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="flex items-center justify-center gap-4">
          <button
            class="city-modal-btn city-modal-btn--ghost w-[136px] h-[40px] border border-gray-300 rounded-full text-[#4D4D4D] hover:bg-gray-50 transition-colors"
            @click="detailModalVisible = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="city-modal-btn city-modal-btn--primary w-[136px] h-[40px] text-white rounded-full transition-colors"
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
      <div class="city-modal city-modal--confirm h-[249px] p-6 relative flex flex-col">
        <button
          class="city-modal__close absolute top-3 right-3 text-gray-400 hover:text-gray-600"
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
        <h3 class="city-modal__title text-center text-lg font-medium text-[#4D4D4D] mb-4">
          {{ $t("common.tips") }}
        </h3>
        <div class="flex-1 flex items-center justify-center px-4">
          <p class="text-[16px] text-[#4D4D4D] text-center leading-relaxed">
            {{ resetPasswordConfirmText }}
          </p>
        </div>
        <div class="flex items-center justify-center gap-4">
          <button
            class="city-modal-btn city-modal-btn--ghost w-[136px] h-[40px] border border-gray-300 rounded-lg text-[#4D4D4D] hover:bg-gray-50"
            @click="showResetPasswordModal = false"
          >
            {{ $t("common.cancel") }}
          </button>
          <button
            class="city-modal-btn city-modal-btn--primary w-[136px] h-[40px] text-white rounded-lg"
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
      <div class="city-modal city-modal--success h-[195px] p-6 relative flex flex-col justify-center">
        <button
          class="city-modal__close absolute top-3 right-3 text-gray-400 hover:text-gray-600"
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
        <h3 class="city-modal__title text-center text-lg font-medium text-[#4D4D4D] mb-4">
          {{ $t("city.resetPasswordSuccess") }}
        </h3>
        <div class="city-modal-info rounded-lg px-6 py-3 flex items-center justify-center">
          <p class="text-center text-[16px] text-[#4D4D4D]">
            <span>{{ $t("city.newPasswordIs") }}</span>
            <span
              class="city-theme-number cursor-pointer transition-colors select-all"
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

const cityPageRef = ref<HTMLElement | null>(null);
let cityPageResizeObserver: ResizeObserver | null = null;
const cityLayoutWidth = ref(1360);

const getCityLayoutWidth = () => {
  if (typeof window === "undefined") {
    return 1360;
  }

  const clientWidth = document.documentElement?.clientWidth || 0;
  const pageClientWidth = cityPageRef.value?.clientWidth || 0;
  const outerWidth = window.outerWidth || 0;
  const innerWidth = window.innerWidth || 0;
  const referenceWidth = outerWidth || innerWidth || clientWidth || 1360;
  const visibleWidthCandidates = [clientWidth, pageClientWidth].filter(width => width > 0);
  const visibleWidth = visibleWidthCandidates.length
    ? Math.min(...visibleWidthCandidates)
    : referenceWidth;
  const boundedWidth = Math.min(referenceWidth, visibleWidth);
  return Math.max(1280, Math.round(boundedWidth));
};

const syncCityLayoutWidth = () => {
  cityLayoutWidth.value = getCityLayoutWidth();
};

const cityShellWidth = computed(() => {
  if (cityLayoutWidth.value <= 1700) {
    return `${Math.max(1280, Math.round(cityLayoutWidth.value))}px`;
  }

  return `${Math.min(
    1920,
    Math.max(1280, Math.round(cityLayoutWidth.value * 0.9))
  )}px`;
});

const pageAdaptiveStyle = computed(() => ({
  "--city-shell-width": cityShellWidth.value,
}));

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
    key: "orgName",
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
      nickPhone: searchKeyword.value.trim() || undefined,
      pageNum: currentPage.value,
      pageSize: pageSize.value,
    });

    const list = (res?.list || []) as any[];
    tableData.value = list.map((item, index) => ({
      id: item.userId || index + 1,
      orgName: item.orgName || "-",
      adminName: item.nickName || "-",
      account: item.userName || "-",
      phone: item.phonenumber || "-",
      createTime: item.createTime || "-",
    }));
    total.value = res?.total || 0;
  } catch (error: any) {
    console.error("获取列表失败：", error);
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
    console.error("重置区管理员密码失败:", error);
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
  syncCityLayoutWidth();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", syncCityLayoutWidth);
    window.visualViewport?.addEventListener("resize", syncCityLayoutWidth);
    if (window.ResizeObserver && cityPageRef.value) {
      cityPageResizeObserver = new window.ResizeObserver(() => {
        syncCityLayoutWidth();
      });
      cityPageResizeObserver.observe(cityPageRef.value);
    }
  }
  fetchList();
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("resize", syncCityLayoutWidth);
  window.visualViewport?.removeEventListener("resize", syncCityLayoutWidth);
  cityPageResizeObserver?.disconnect();
  cityPageResizeObserver = null;
});

// 分页变化监听
watch([currentPage, pageSize], () => {
  fetchList();
});
</script>

<style scoped>
.city-page {
  --city-min-width: 1280px;
  --city-max-width: 1920px;
  --city-shell-width: var(--city-min-width);
  width: 100%;
  height: 100%;
  min-width: var(--city-min-width);
  min-height: 100%;
  overflow-x: auto;
  overflow-y: auto;
  padding: 30px 0 40px;
  background: linear-gradient(180deg, #f3f6fb 0%, #eef3fb 100%);
}

.city-shell {
  width: min(
    var(--city-max-width),
    max(var(--city-min-width), var(--city-shell-width))
  );
  min-width: var(--city-min-width);
  margin: 0 auto;
  padding: 0 clamp(48px, 4vw, 72px);
  box-sizing: border-box;
}

.city-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.city-page-header__title {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
  font-weight: 600;
  color: #16233d;
}

.city-stat-card {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.city-stat-card__label {
  color: #26344f;
  font-size: 14px;
  font-weight: 500;
}

.city-stat-card__value {
  color: #005bc2;
  font-size: 14px;
  line-height: 1;
  font-weight: 600;
}

.city-stat-card__unit {
  color: #26344f;
  font-size: 14px;
  font-weight: 500;
}

.city-card {
  min-height: 610px;
  padding: 24px 28px 34px;
  border: 1px solid #dfe8f5;
  border-radius: 28px;
  background: #ffffff;
  box-shadow: 0 20px 48px rgba(38, 76, 130, 0.1);
}

.city-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.city-search {
  width: min(372px, 100%);
  max-width: 100%;
}

.city-search :deep(input) {
  min-height: 42px;
  border-color: #d6e2f0 !important;
  border-radius: 12px !important;
  background: #ffffff !important;
  color: #1f2a37;
  box-shadow: none;
}

.city-search :deep(input:focus) {
  border-color: #4b8eff !important;
  box-shadow: 0 0 0 4px rgba(75, 142, 255, 0.12);
}

.city-export-btn {
  min-width: 130px;
  min-height: 42px;
  padding: 0 24px !important;
  border: 1px solid #d6e2f0 !important;
  border-radius: 14px !important;
  background: #ffffff !important;
  color: #13223a !important;
  box-shadow: none !important;
}

.city-export-btn:hover {
  background: #f4f8ff !important;
  border-color: #4b8eff !important;
  color: #005bc2 !important;
}

.city-table-wrap {
  overflow: auto;
  border: 1px solid #dfe8f5;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.city-action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.city-action-btn {
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

.city-action-btn:hover {
  border-color: #4b8eff;
  background: #f4f8ff;
}

.city-pagination {
  display: flex;
  justify-content: center;
  margin-top: 26px;
}

.city-page :deep(.m-pagination) {
  gap: 8px;
  color: #51617a;
}

.city-page :deep(.m-pagination button),
.city-page :deep(.m-pagination .page-btn) {
  border-color: #d6e2f0;
  border-radius: 14px;
  color: #51617a;
}

.city-page :deep(.m-pagination button:not(:disabled):hover) {
  border-color: #005bc2 !important;
  color: #005bc2 !important;
}

.city-page :deep(.m-pagination select),
.city-page :deep(.m-pagination input) {
  border-color: #d6e2f0 !important;
  border-radius: 8px;
  color: #13223a;
}

.city-page :deep(.m-pagination select:focus),
.city-page :deep(.m-pagination input:focus) {
  border-color: #005bc2 !important;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.1);
}

.city-page :deep(.m-pagination button[class*="bg-"]) {
  border-color: #005bc2 !important;
  background-color: #005bc2 !important;
  color: #ffffff !important;
}

.city-theme-number {
  color: #005bc2 !important;
}

.city-modal {
  border-radius: 18px;
  background: #ffffff;
}

.city-modal__title {
  color: #16233d !important;
  font-weight: 600 !important;
}

.city-modal__close {
  color: #8a96a3 !important;
}

.city-modal__close:hover {
  color: #005bc2 !important;
}

.city-modal-info {
  border: 1px solid #dfe8f5 !important;
  background: #f5f8fc !important;
  border-radius: 14px !important;
}

.city-modal-info span {
  color: #26344f;
}

.city-modal-btn {
  border-radius: 999px !important;
  font-weight: 600;
  transition: all 0.2s ease;
}

.city-modal-btn--ghost {
  border-color: #d6e2f0 !important;
  background: #ffffff !important;
  color: #26344f !important;
}

.city-modal-btn--ghost:hover {
  border-color: #005bc2 !important;
  background: #f4f8ff !important;
  color: #005bc2 !important;
}

.city-modal-btn--primary {
  border: 1px solid #005bc2 !important;
  background: #005bc2 !important;
  color: #ffffff !important;
}

.city-modal-btn--primary:hover {
  border-color: #004a9f !important;
  background: #004a9f !important;
}

.city-table {
  box-shadow: none !important;
  border-radius: 22px;
  overflow: hidden;
}

.city-table :deep(.m-table) {
  box-shadow: none !important;
  border-radius: 22px;
}

.city-table :deep(thead) {
  background: #f5f8fc !important;
}

.city-table :deep(thead th) {
  height: 60px;
  background-color: transparent !important;
  color: #51617a !important;
  font-weight: 700 !important;
  border-bottom: 1px solid #dfe8f5;
  font-size: 14px;
}

.city-table :deep(tbody tr:nth-child(odd)) {
  background-color: #ffffff;
}

.city-table :deep(tbody tr:nth-child(even)) {
  background-color: #ffffff;
}

.city-table :deep(tbody tr:hover) {
  background-color: #f4f8ff !important;
}

.city-table :deep(tbody td) {
  height: 70px;
  color: #13223a;
  border-top: 1px solid #eef3f8;
  font-size: 14px;
}

.city-table :deep(tbody td:first-child) {
  color: #6f7f92;
  font-weight: 600;
}

.city-table :deep(.m-table__empty) {
  min-height: 360px;
  color: #8a96a3;
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
  .city-page {
    padding: 20px 0 28px;
  }

  .city-shell {
    padding: 0 16px;
  }

  .city-page-header {
    flex-direction: column;
  }

  .city-card {
    padding: 20px;
    border-radius: 24px;
  }

  .city-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .city-search {
    width: 100%;
  }

  .city-export-btn {
    width: 100%;
  }
}
</style>
