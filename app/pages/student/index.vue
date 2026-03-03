<template>
  <div class="flex-1 overflow-auto py-4 w-full">
    <!-- 上课通知弹窗 -->
    <Teleport to="body">
      <div v-if="showClassNotification" class="class-notification-overlay">
        <div class="class-notification-modal">
          <div class="notification-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h2 class="notification-title">老师开始上课啦！</h2>
          <p class="notification-desc">{{ classInfo.className || '课堂' }} 正在进行中</p>
          <!-- <div class="notification-actions">
            <button class="btn-later" @click="laterEnter">稍后进入</button>
            <button class="btn-enter" @click="enterClassroom">立即进入</button>
          </div> -->
        </div>
      </div>
    </Teleport>

    <!-- 两栏布局容器 -->
    <div class="main-content flex">
      
      <!-- 左侧 - 学习与任务中心 585x581 -->
      <aside class="left-panel p-4 flex-shrink-0">
        <div class="border-2 border-dashed border-[#B8D4E8] rounded-lg p-6 h-[581px] cursor-pointer hover:bg-white/50 transition-colors" @click="goLessonsRecord">
          <div class="text-gray-600 text-sm font-medium mb-6">学习与任务中心</div>
          
          <!-- 上次课程 -->
          <div class="mb-6">
            <div class="text-gray-500 text-xs mb-2">上次课程</div>
            <div class="bg-[#F1F1F1] text-[#808080] rounded px-3 py-2 text-sm text-center  cursor-pointer">
              {{ learningCenterData.chapterName }}
            </div>
          </div>
          
          <!-- 未完成任务 -->
          <div class="mb-6">
            <div class="text-gray-500 text-xs mb-2">未完成任务</div>
            <div class="bg-[#F1F1F1] text-[#808080] rounded px-3 py-2 text-sm text-center cursor-pointer">
              {{ learningCenterData.unCommitTaskNum }} 个
        </div>
      </div>

          <!-- 未完成评测 -->
          <div>
            <div class="text-gray-500 text-xs mb-2">未完成评测</div>
            <div class="bg-[#F1F1F1] text-[#808080] rounded px-3 py-2 text-sm text-center cursor-pointer">
              {{ learningCenterData.unCommitTestNum }} 个
            </div>
          </div>
        </div>
      </aside>

      <!-- 右侧大区域 -->
      <div class="right-area flex-1 p-4 min-w-0">
        <!-- 上半部分：玛塔工具中心 + AI实践中心 并排 -->
        <div class="flex gap-4 mb-6 flex-wrap xl:flex-nowrap h-[270px]">
          <!-- 玛塔工具中心 -->
          <div class="tool-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex-1 min-w-[280px] ">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-600 text-sm font-medium">玛塔工具中心</span>
              <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer" />
        </div>
            <div class="flex gap-4 justify-around mt-[60px]">
              <div v-for="i in 3" :key="'tool'+i" class="w-[87px] h-[87px] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                <img src="~/assets/images/four.png" alt="工具" class="w-full h-full object-cover" />
        </div>
      </div>
          </div>

          <!-- AI实践中心 -->
          <div class="tool-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex-1 min-w-[280px]">
            <div class="flex items-center justify-between mb-4">
              <span class="text-gray-600 text-sm font-medium">AI实践中心</span>
              <img src="~/assets/images/diandian.png" alt="more" class="w-4 h-4 cursor-pointer" />
            </div>
            <div class="flex gap-4 justify-around mt-[60px]">
              <div v-for="i in 3" :key="'ai'+i" class="w-[87px] h-[87px] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                <img src="~/assets/images/four.png" alt="AI实践" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <!-- 下半部分：4个功能中心 -->
        <div class="center-cards mb-6">
          <NuxtLink to="/student/course" class="center-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <div class="text-gray-600 text-sm mb-4">课程中心</div>
            <div class="center-icon flex items-center justify-center">
              <img src="~/assets/images/kecheng.png" alt="课程中心" class="w-full h-full object-contain" />
            </div>
          </NuxtLink>
          <div class="center-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <div class="text-gray-600 text-sm mb-4">测评中心</div>
            <div class="center-icon flex items-center justify-center">
              <img src="~/assets/images/ceping.png" alt="测评中心" class="w-full h-full object-contain" />
            </div>
          </div>
          <div class="center-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <div class="text-gray-600 text-sm mb-4">学情中心</div>
            <div class="center-icon flex items-center justify-center">
              <img src="~/assets/images/xueqing.png" alt="学情中心" class="w-full h-full object-contain" />
      </div>
          </div>
          <div class="center-card border-2 border-dashed border-[#B8D4E8] rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <div class="text-gray-600 text-sm mb-4">拓展中心</div>
            <div class="center-icon flex items-center justify-center">
              <img src="~/assets/images/tuozhan.png" alt="拓展中心" class="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        <!-- 底部卡片 -->
        <div class="flex justify-center">
          <div class="border-2 border-dashed border-[#B8D4E8] rounded-lg p-6 w-[180px] h-[180px] flex items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
            <img src="~/assets/images/bottom.png" alt="更多" class="w-[120px] h-[120px] object-contain" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/api/useAuth'
import { student } from '~/composables/api/student'
import { ElMessage } from '~/components/ui'

definePageMeta({
  layout: 'default'
})

const config = useRuntimeConfig()
const { logout } = useAuth()
const { getStudentList } = student()
const router = useRouter()

const learningCenterData = reactive({
  chapterName: '暂无',
  unCommitTaskNum: 0,
  unCommitTestNum: 0
})

// 上课通知弹窗
const showClassNotification = ref(false)
const classInfo = ref({
  classId: '',
  className: '',
  teacherPeerId: ''  // 教师的 PeerJS ID
})

// WebSocket 连接
let notifyWs: WebSocket | null = null
const signalingUrl = (config.public.signalingUrl as string) || 'ws://192.168.0.55:8001/resource/websocket'

const loadLearningCenterData = async () => {
  try {
    const data = await getStudentList()
    const source = data || {}
    learningCenterData.chapterName = String(source.chapterName || '暂无')
    learningCenterData.unCommitTaskNum = Number(source.unCommitTaskNum ?? 0) || 0
    learningCenterData.unCommitTestNum = Number(source.unCommitTestNum ?? 0) || 0
  } catch (error) {
    console.error('获取学习与任务中心数据失败:', error)
  }
}

// 连接 WebSocket 监听上课通知
onMounted(() => {
  connectNotifyWebSocket()
  loadLearningCenterData()
})

onUnmounted(() => {
  if (notifyWs) {
    notifyWs.close()
    notifyWs = null
  }
})

// 连接通知 WebSocket
const connectNotifyWebSocket = () => {
  // 如果已经有连接，先关闭
  if (notifyWs) {
    console.log('[学生端] 关闭旧的 WebSocket 连接')
    notifyWs.close()
    notifyWs = null
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  let wsUrl = signalingUrl
  if (token) {
    const separator = signalingUrl.includes('?') ? '&' : '?'
    wsUrl = `${signalingUrl}${separator}Authorization=${encodeURIComponent(`Bearer ${token}`)}`
  }

  console.log('[学生端] 连接通知 WebSocket')
  notifyWs = new WebSocket(wsUrl)

  notifyWs.onopen = () => {
    console.log('[学生端] WebSocket 连接成功，等待上课通知...')
    // 发送学生在线状态
    const statusMsg = JSON.stringify({ type: 'STUDENT_STATUS', status: 'online' })
    notifyWs?.send(statusMsg)
    console.log('[学生端] 发送:', statusMsg)
  }

  notifyWs.onmessage = (event) => {
    console.log('[学生端首页] 收到消息:', event.data)
    try {
      const message = JSON.parse(event.data)
      
      // 处理上课通知 - 直接跳转到课堂
      if (message.type === 'CLASS_BEGIN') {
        console.log('[学生端首页] 收到上课通知，直接进入课堂！')
        
        // 直接跳转到课堂页面，不带参数
        router.push('/student/classroom')
      }
      
      // 处理下课通知
      if (message.type === 'CLASS_END') {
        console.log('[学生端] 收到下课通知')
        ElMessage.info('老师已下课')
      }
    } catch (e) {
      console.log('[学生端] 非 JSON 消息:', event.data)
    }
  }

  notifyWs.onclose = () => {
    console.log('[学生端] WebSocket 断开')
  }

  notifyWs.onerror = (error) => {
    console.error('[学生端] WebSocket 错误:', error)
  }
}

const goLessonsRecord = () => {
  router.push('/student/lessonsrecord')
}

const handleLogout = () => {
  if (notifyWs) {
    notifyWs.close()
    notifyWs = null
  }
  logout()
}
</script>

<style scoped>
/* ===== 响应式两栏布局 ===== */

/* 主容器 */
.main-content {
  /* display: flex;
  justify-content: flex-start;
  padding-right: 120px; */
  display: flex;
    width: 95%;
    margin: 0 auto;
}

/* 左侧面板 585x581 */
.left-panel {
  width: 585px;
  min-height: 581px;
  flex-shrink: 0;
}

/* 右侧区域 */
.right-area {
  flex: 1;
  min-width: 0;
}

/* 大屏幕 1600px+ */
@media (min-width: 1600px) {
  .left-panel { 
    width: 585px; 
    min-height: 581px;
  }
}

/* 笔记本 1280px - 1600px */
@media (max-width: 1600px) and (min-width: 1024px) {
  .main-content {
    padding-right: 60px;
  }
  .left-panel { 
    width: 400px;
    min-height: auto;
  }
}

/* 平板 768px - 1024px */
@media (max-width: 1024px) and (min-width: 768px) {
  .main-content {
    padding: 0 20px;
    flex-wrap: wrap;
  }
  .left-panel { 
    width: 280px;
    min-height: auto;
  }
}

/* 手机 < 768px：单栏布局 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 0 12px;
  }
  .left-panel {
    width: 100%;
    min-height: auto;
    order: 2;
  }
  .right-area {
    width: 100%;
    order: 1;
  }
}
/* 4个功能中心卡片 - 不换行，自动缩放 */
.center-cards {
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 20px;
}

.center-card {
  flex: 1;
  min-width: 0;
  aspect-ratio: 1;
  max-width: 274px;
  max-height: 274px;
}

.center-icon {
  width: 60%;
  height: 60%;
}

/* 上课通知弹窗样式 */
.class-notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.class-notification-modal {
  background: white;
  border-radius: 20px;
  padding: 40px 50px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.notification-icon {
  margin-bottom: 20px;
  animation: ring 0.5s ease-in-out infinite alternate;
}

@keyframes ring {
  from { transform: rotate(-10deg); }
  to { transform: rotate(10deg); }
}

.notification-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.notification-desc {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.notification-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn-later {
  padding: 12px 30px;
  border: 1px solid #ddd;
  border-radius: 25px;
  background: white;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-later:hover {
  background: #f5f5f5;
}

.btn-enter {
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #FF9900, #FFB347);
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.4);
}

.btn-enter:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 153, 0, 0.5);
}
</style>

