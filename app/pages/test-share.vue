<template>
  <div class="test-share">
    <h1>屏幕分享测试</h1>
    
    <div class="status">
      <p>连接状态: <span :class="isConnected ? 'green' : 'red'">{{ isConnected ? '已连接' : '未连接' }}</span></p>
      <p>我的 ID: <strong>{{ myPeerId || '等待中...' }}</strong></p>
    </div>

    <div class="tabs">
      <button :class="{ active: role === 'teacher' }" @click="role = 'teacher'">我是教师</button>
      <button :class="{ active: role === 'student' }" @click="role = 'student'">我是学生</button>
    </div>

    <!-- 教师端 -->
    <div v-if="role === 'teacher'" class="teacher-panel">
      <h2>教师端</h2>
      
      <div class="form-group">
        <label>我的教师 ID:</label>
        <input v-model="teacherId" placeholder="输入教师ID（如 teacher001）" />
        <button @click="initTeacher" :disabled="isConnected">连接</button>
      </div>

      <div v-if="isConnected" class="actions">
        <button v-if="!isScreenSharing" @click="startShare" class="btn-primary">
          开始屏幕分享
        </button>
        <button v-else @click="stopShare" class="btn-danger">
          停止分享
        </button>
      </div>

      <div v-if="isScreenSharing" class="call-student">
        <h3>呼叫学生</h3>
        <input v-model="targetStudentId" placeholder="输入学生ID" />
        <button @click="callStudent" class="btn-success">发送屏幕给学生</button>
        <p class="hint">已连接学生: {{ connectedPeers.size }} 人</p>
      </div>

      <!-- 本地预览 -->
      <div v-if="localStream" class="preview">
        <h3>本地预览</h3>
        <video ref="localVideo" autoplay muted playsinline></video>
      </div>
    </div>

    <!-- 学生端 -->
    <div v-if="role === 'student'" class="student-panel">
      <h2>学生端</h2>
      
      <div class="form-group">
        <label>我的学生 ID:</label>
        <input v-model="studentId" placeholder="输入学生ID（如 student001）" />
        <button @click="initStudent" :disabled="isConnected">连接</button>
      </div>

      <div v-if="isConnected" class="waiting">
        <p v-if="!remoteStream">等待教师分享屏幕...</p>
        <p class="hint">把你的 ID「<strong>{{ myPeerId }}</strong>」告诉教师</p>
      </div>

      <!-- 远程视频 -->
      <div v-if="remoteStream" class="remote-video">
        <h3>教师屏幕</h3>
        <video ref="remoteVideo" autoplay playsinline></video>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="instructions">
      <h3>使用方法</h3>
      <ol>
        <li>打开两个浏览器窗口</li>
        <li>窗口1：选择「我是教师」，输入 ID 如 <code>teacher001</code>，点击连接</li>
        <li>窗口2：选择「我是学生」，输入 ID 如 <code>student001</code>，点击连接</li>
        <li>教师点击「开始屏幕分享」</li>
        <li>教师输入学生ID <code>student001</code>，点击「发送屏幕给学生」</li>
        <li>学生端会自动显示教师的屏幕！</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { usePeerScreenShare } from '~/composables/usePeerScreenShare'

definePageMeta({ layout: 'blank' })

const {
  myPeerId,
  isConnected,
  isScreenSharing,
  localStream,
  remoteStream,
  connectedPeers,
  initialize,
  startScreenShare,
  callStudent: callPeer,
  stopScreenShare,
  destroy
} = usePeerScreenShare()

const role = ref<'teacher' | 'student'>('teacher')
const teacherId = ref('teacher001')
const studentId = ref('student001')
const targetStudentId = ref('student001')

const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideo = ref<HTMLVideoElement | null>(null)

// 教师初始化
const initTeacher = async () => {
  try {
    await initialize(teacherId.value)
  } catch (err) {
    console.error('初始化失败:', err)
    alert('连接失败，请刷新重试')
  }
}

// 学生初始化
const initStudent = async () => {
  try {
    await initialize(studentId.value)
  } catch (err) {
    console.error('初始化失败:', err)
    alert('连接失败，请刷新重试')
  }
}

// 开始分享
const startShare = async () => {
  const success = await startScreenShare()
  if (success) {
    console.log('屏幕分享已开始')
  }
}

// 停止分享
const stopShare = () => {
  stopScreenShare()
}

// 呼叫学生
const callStudent = () => {
  if (!targetStudentId.value) {
    alert('请输入学生ID')
    return
  }
  const success = callPeer(targetStudentId.value)
  if (success) {
    alert(`已发送屏幕给 ${targetStudentId.value}`)
  }
}

// 监听本地流变化，绑定到 video
watch(localStream, (stream) => {
  if (localVideo.value && stream) {
    localVideo.value.srcObject = stream
  }
})

// 监听远程流变化，绑定到 video
watch(remoteStream, (stream) => {
  if (remoteVideo.value && stream) {
    remoteVideo.value.srcObject = stream
  }
})
</script>

<style scoped>
.test-share {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

h2 {
  color: #FF9900;
  border-bottom: 2px solid #FF9900;
  padding-bottom: 10px;
}

.status {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.green { color: #4CAF50; font-weight: bold; }
.red { color: #f44336; font-weight: bold; }

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 15px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.tabs button.active {
  border-color: #FF9900;
  background: #FFF8F0;
  color: #FF9900;
  font-weight: bold;
}

.form-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.form-group label {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.form-group input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-group button {
  padding: 10px 20px;
  background: #FF9900;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.form-group button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.actions {
  margin: 20px 0;
}

.btn-primary {
  padding: 15px 30px;
  background: linear-gradient(135deg, #FF9900, #FFB347);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.4);
}

.btn-danger {
  padding: 15px 30px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
}

.btn-success {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.call-student {
  background: #f0f9ff;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.call-student input {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-right: 10px;
  width: 200px;
}

.hint {
  color: #666;
  font-size: 14px;
  margin-top: 10px;
}

.preview, .remote-video {
  margin-top: 20px;
}

video {
  width: 100%;
  max-height: 400px;
  background: #000;
  border-radius: 8px;
}

.waiting {
  text-align: center;
  padding: 40px;
  background: #f5f5f5;
  border-radius: 8px;
}

.instructions {
  margin-top: 40px;
  padding: 20px;
  background: #FFF8F0;
  border-radius: 8px;
  border: 1px solid #FFE0B2;
}

.instructions h3 {
  color: #FF9900;
  margin-top: 0;
}

.instructions ol {
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 8px;
}

.instructions code {
  background: #FFE0B2;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>

