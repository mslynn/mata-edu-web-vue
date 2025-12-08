<template>
  <NuxtLoadingIndicator color="#FFA54D" />
  
  <!-- 全局加载动画 -->
  <Transition name="fade">
    <div v-if="loading" class="global-loading-overlay">
      <div class="global-loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">加载中...</p>
      </div>
    </div>
  </Transition>
  
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts">
const { loading, showLoading, hideLoading } = useLoading()
const route = useRoute()

// 监听路由变化，显示加载动画
watch(() => route.path, () => {
  showLoading()
  // 延迟隐藏，让动画更丝滑
  setTimeout(() => {
    hideLoading()
  }, 300)
}, { immediate: false })

// 页面首次加载
onMounted(() => {
  showLoading()
  setTimeout(() => {
    hideLoading()
  }, 500)
})
</script>

<style>
/* 全局加载动画样式 */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.global-loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FFA54D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
