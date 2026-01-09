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
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// 正在进行的课堂信息
const ongoingClass = ref<{
  classId: string
  courseId: string
  chapterId: string
  expireAt?: number
} | null>(null)

// 用户角色
const userRole = ref<string | null>(null)

// 课堂已结束弹窗
const showExpiredModal = ref(false)

// 是否显示按钮（排除课堂页面和登录页面）
const showButton = computed(() => {
  // 只有老师才显示
  if (userRole.value !== 'teacher') return false
  // 课堂页面不显示
  if (route.path.includes('/system/classroom/')) return false
  // 登录页面不显示（首页、根路径）
  if (route.path === '/' || route.path === '/index') return false
  return true
})

// 跳转到课堂
const goToClassroom = () => {
  if (!ongoingClass.value) return
  
  // 检查是否过期
  if (ongoingClass.value.expireAt && Date.now() > ongoingClass.value.expireAt) {
    // 已过期，显示弹窗并清除缓存
    showExpiredModal.value = true
    localStorage.removeItem('ongoing_classroom')
    ongoingClass.value = null
    return
  }
  
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

// 从 localStorage 读取正在进行的课堂信息
const checkOngoingClass = () => {
  if (userRole.value !== 'teacher') {
    ongoingClass.value = null
    return
  }
  
  try {
    const stored = localStorage.getItem('ongoing_classroom')
    if (stored) {
      const data = JSON.parse(stored)
      // 检查是否已过期，过期则清除
      if (data.expireAt && Date.now() > data.expireAt) {
        localStorage.removeItem('ongoing_classroom')
        ongoingClass.value = null
      } else {
        ongoingClass.value = data
      }
    } else {
      ongoingClass.value = null
    }
  } catch (error) {
    console.error('读取课堂信息失败:', error)
    ongoingClass.value = null
  }
}

// 获取用户角色
const getUserRole = () => {
  try {
    const userStr = localStorage.getItem('user_info')
    console.log('[BackToClassroom] user_info from localStorage:', userStr)
    if (userStr) {
      const user = JSON.parse(userStr)
      userRole.value = user?.role_key || user?.roleKey || null
      console.log('[BackToClassroom] userRole:', userRole.value)
    }
  } catch (error) {
    console.error('[BackToClassroom] getUserRole error:', error)
    userRole.value = null
  }
}

// 监听路由变化，刷新状态
watch(() => route.fullPath, () => {
  console.log('[BackToClassroom] route changed:', route.fullPath)
  getUserRole()
  checkOngoingClass()
}, { immediate: true })

onMounted(() => {
  console.log('[BackToClassroom] mounted')
  getUserRole()
  checkOngoingClass()
  console.log('[BackToClassroom] showButton:', showButton.value, 'ongoingClass:', ongoingClass.value)
  
  // 监听 storage 事件，其他标签页更新时同步
  window.addEventListener('storage', (e) => {
    if (e.key === 'ongoing_classroom') {
      checkOngoingClass()
    }
    if (e.key === 'user_info') {
      getUserRole()
    }
  })
})

// 暴露刷新方法，供外部调用
defineExpose({
  refresh: checkOngoingClass
})
</script>

<style scoped>
.back-to-classroom-btn {
  position: fixed;
  left: 24px;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: #FF9900;
  border-radius: 50px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 153, 0, 0.4);
  transition: all 0.3s ease;
  z-index: 9999;
}

.back-to-classroom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 153, 0, 0.5);
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
  background: white;
  border-radius: 16px;
  padding: 32px 40px;
  text-align: center;
  max-width: 360px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-icon {
  margin-bottom: 16px;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px;
}

.modal-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px;
  line-height: 1.5;
}

.modal-btn {
  padding: 12px 48px;
  background: #FF9900;
  border: none;
  border-radius: 24px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-btn:hover {
  background: #E68A00;
}
</style>
