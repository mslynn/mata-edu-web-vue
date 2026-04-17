<template>
  <ClientOnly>
    <div 
      v-if="showButton && ongoingClass" 
      class="back-to-classroom-btn"
      @click="goToClassroom"
    >
      <span class="btn-text">{{ t('teacher.backToClass') }}</span>
      <div class="audio-bars">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>
    </div>
    
    <!-- 课堂已结束弹窗 -->
    <div v-if="showExpiredModal" class="modal-overlay" @click="closeExpiredModal">
      <div class="modal-content" @click.stop>
        <div class="modal-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#005bc2" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h3 class="modal-title">{{ t('teacher.classEnded') }}</h3>
        <p class="modal-desc">{{ t('teacher.classExpiredDesc') }}</p>
        <button class="modal-btn" @click="closeExpiredModal">{{ t('common.confirm') }}</button>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeacher } from '~/composables/api/useTeacher'
import { useAuth } from '~/composables/api/useAuth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { getTeacherStatus } = useTeacher()
const { user } = useAuth()

// 正在进行的课堂信息
const ongoingClass = ref<{
  classId: string
  courseId: string
  chapterId: string
} | null>(null)

// 课堂已结束弹窗
const showExpiredModal = ref(false)

const getStoredUserRole = () => {
  try {
    const userStr = localStorage.getItem('user_info')
    if (!userStr) return null

    const storedUser = JSON.parse(userStr)
    return storedUser?.role_key || storedUser?.roleKey || null
  } catch {
    return null
  }
}

const userRole = computed(() => {
  return (
    user.value?.role_key ||
    user.value?.roleKey ||
    getStoredUserRole() ||
    null
  )
})

const canShowBackToClass = computed(() => {
  if (ongoingClass.value) return true
  return userRole.value === 'teacher' || userRole.value === 'school_admin'
})

// 是否显示按钮（排除课堂页面和登录页面）
const showButton = computed(() => {
  if (!canShowBackToClass.value) return false
  // 课堂页面不显示
  if (route.path.includes('/system/classroom/')) return false
  // 登录页面不显示（首页、根路径）
  if (route.path === '/' || route.path === '/index') return false
  return true
})

// 跳转到课堂
const goToClassroom = () => {
  if (!ongoingClass.value) return
  
  router.push({
    path: `/system/classroom/${ongoingClass.value.chapterId}`,
    query: {
      classId: ongoingClass.value.classId,
      courseId: ongoingClass.value.courseId,
      from: 'global'
    }
  })
}

// 关闭过期弹窗
const closeExpiredModal = () => {
  showExpiredModal.value = false
}

// 从接口获取开课中的课堂
const fetchOngoingClass = async () => {
  if (
    userRole.value &&
    userRole.value !== 'teacher' &&
    userRole.value !== 'school_admin'
  ) {
    ongoingClass.value = null
    return
  }
  
  // 先检查 localStorage 缓存，没有缓存就不调接口
  const stored = localStorage.getItem('ongoing_classroom')
  if (!stored) {
    ongoingClass.value = null
    return
  }
  
  try {
    const data = JSON.parse(stored)
    // 检查是否过期
    if (data.expireAt && Date.now() > data.expireAt) {
      localStorage.removeItem('ongoing_classroom')
      ongoingClass.value = null
      return
    }
    
    // 有缓存，先显示按钮
    ongoingClass.value = data

    const status = await getTeacherStatus()
    if (!status?.isTeach) {
      // 课堂已结束，清除缓存
      localStorage.removeItem('ongoing_classroom')
      ongoingClass.value = null
      showExpiredModal.value = true
    }
  } catch (error) {
    // 接口异常，保持当前状态
    console.error('验证课堂状态失败:', error)
  }
}

const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'ongoing_classroom' || e.key === 'user_info') {
    void fetchOngoingClass()
  }
}

const handleWindowFocus = () => {
  void fetchOngoingClass()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    void fetchOngoingClass()
  }
}

// 监听路由变化，刷新状态
watch(() => route.fullPath, () => {
  void fetchOngoingClass()
})

onMounted(() => {
  void fetchOngoingClass()

  // 监听 storage 事件，其他标签页更新时同步
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// 暴露刷新方法，供外部调用
defineExpose({
  refresh: fetchOngoingClass
})
</script>

<style scoped>
.back-to-classroom-btn {
  position: fixed;
  left: 24px;
  bottom: 120px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: #005bc2;
  border-radius: 50px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 91, 194, 0.4);
  transition: all 0.3s ease;
  z-index: 9999;
}

@media (min-width: 1024px) {
  .back-to-classroom-btn {
    left: 148px;
  }
}

@media (max-height: 860px) {
  .back-to-classroom-btn {
    bottom: 108px;
  }
}

.back-to-classroom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 91, 194, 0.5);
}

.btn-text {
  white-space: nowrap;
}

.audio-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
}

.bar {
  width: 4px;
  background: white;
  border-radius: 2px;
  animation: audioWave 1s ease-in-out infinite;
}

.bar:nth-child(1) {
  height: 8px;
  animation-delay: 0s;
}

.bar:nth-child(2) {
  height: 16px;
  animation-delay: 0.2s;
}

.bar:nth-child(3) {
  height: 12px;
  animation-delay: 0.4s;
}

.bar:nth-child(4) {
  height: 20px;
  animation-delay: 0.6s;
}

@keyframes audioWave {
  0%, 100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  width: min(420px, calc(100vw - 32px));
  background: #ffffff;
  border-radius: 24px;
  padding: 36px 40px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 18px 48px rgba(17, 24, 39, 0.18);
}

.modal-icon {
  width: 76px;
  height: 76px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F0F7FF;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 14px;
}

.modal-desc {
  font-size: 14px;
  color: #606266;
  margin: 0 0 28px;
  line-height: 1.7;
}

.modal-btn {
  min-width: 136px;
  height: 44px;
  padding: 0 28px;
  background: #005bc2;
  border: none;
  border-radius: 999px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-btn:hover {
  background: #004696;
}
</style>
