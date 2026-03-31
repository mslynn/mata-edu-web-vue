<template>
  <div class="flex-1 flex items-center justify-center p-4 md:p-8">
    <div class="flex flex-col md:flex-row gap-8 md:gap-20">
      <!-- 数据中心卡片 -->
      <div class="card-wrapper cursor-pointer group" @click="goToDataCenter">
        <div class="card-border">
          <div class="card-content bg-[#FFFFFF]">
            <img
              src="~/assets/images/datacenter.png"
              alt="数据中心"
              class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div class="card-title">{{ $t("city.datacenter") }}</div>
        </div>
      </div>

      <!-- 学校管理卡片 -->
      <div class="card-wrapper cursor-pointer group" @click="goToSchoolManage">
        <div class="card-border">
          <div class="card-content bg-[#FFFFFF]">
            <img
              src="~/assets/images/manage.png"
              alt="学校管理"
              class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div class="card-title">{{ manageTitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useAuth } from "~/composables/api/useAuth";

definePageMeta({
  layout: "default",
});

const router = useRouter();
const { t } = useI18n();
const { user } = useAuth();

// 根据角色显示不同的标题
const manageTitle = computed(() => {
  return user.value?.role_key === "district_admin"
    ? t("school.schoolManage")
    : t("city.districtManage");
});

const goToDataCenter = () => {
  router.push("/datacenter");
};

const goToSchoolManage = () => {
  // city_admin 跳转到市管理页面，其它角色跳转学校管理
  if (user.value?.role_key === "city_admin") {
    router.push("/city");
  } else {
    router.push("/school");
  }
};
</script>

<style scoped>
.card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-border {
  width: 280px;
  height: 340px;
  /* border: 2px dashed #D0D0D0; */
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.card-content {
  width: 240px;
  height: 240px;
  border-radius: 8px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

/* 中等屏幕及以上恢复原尺寸 */
@media (min-width: 768px) {
  .card-border {
    width: 350px;
    height: 420px;
    padding: 20px;
  }

  .card-content {
    width: 306px;
    height: 306px;
    padding: 22px;
    margin-bottom: 42px;
  }
}

.card-title {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
  text-align: center;
}

.card-wrapper:hover .card-border {
  border-color: #999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
