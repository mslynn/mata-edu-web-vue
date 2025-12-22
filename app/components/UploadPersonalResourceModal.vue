<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <span class="modal-title">新增个人资源</span>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <p class="upload-tip">请选择对应本地个人文件上传或关联作品中心文件：</p>
        
        <button class="upload-btn" @click="triggerFileInput">
          <span>点击上传本地资源</span>
        </button>
        <input 
          ref="fileInputRef" 
          type="file" 
          multiple 
          accept=".doc,.docx,.ppt,.pptx,.pdf,.xls,.xlsx"
          style="display: none" 
          @change="handleFileSelect"
        />
        
        <div class="warning-box">
          <div class="warning-header">
            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>温馨提示：</span>
            <div class="tooltip-wrapper">
              <a href="javascript:;" class="link">查看上传要求</a>
              <div class="tooltip-content">
                <p>1、文件大小&lt;=20MB</p>
                <p>jpg、jpeg、png、gif</p>
                <p>xip、ucd、ucdx、ipynb、py、upy、usim</p>
                <p>2、文件大小&lt;=100MB</p>
                <p>doc、docx、xls、xlsx</p>
                <p>3、文件大小&lt;=200MB</p>
                <p>mp4、mov、ppt、pptx、pdf</p>
                <p>其他文件大小不超过200M,其他格式</p>
                <p>文件在平台前端需要下载查看</p>
              </div>
            </div>
          </div>
          <p class="warning-text">PPT/Word中尽量不要包含视频,视频单独作为资源上传预览更流畅;尽量减少PPT中gif图片的数量,作为单独资源上传,保证预览更流畅。</p>
        </div>
        
        <!-- 文件列表表格 - 始终显示表头 -->
        <div class="file-table">
          <div class="table-header">
            <div class="col-index">序号</div>
            <div class="col-name">文件名称</div>
            <div class="col-progress">上传进度</div>
            <div class="col-type">
              <div class="type-dropdown" :class="{ open: typeDropdownOpen }">
                <div class="type-dropdown-trigger" @click.stop="typeDropdownOpen = !typeDropdownOpen">
                  <span>{{ filterResourceType ? getResourceTypeName(filterResourceType) : '资源类型' }}</span>
                  <svg class="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="type-dropdown-menu" v-if="typeDropdownOpen">
                  <div class="type-dropdown-item" :class="{ active: filterResourceType === '' }" @click="selectResourceType('')">全部类型</div>
                  <div class="type-dropdown-item" :class="{ active: filterResourceType === 'courseResource' }" @click="selectResourceType('courseResource')">课程资源</div>
                  <div class="type-dropdown-item" :class="{ active: filterResourceType === 'personalProgram' }" @click="selectResourceType('personalProgram')">个人程序</div>
                  <div class="type-dropdown-item" :class="{ active: filterResourceType === 'aiTraining' }" @click="selectResourceType('aiTraining')">AI实训资源</div>
                  <div class="type-dropdown-item" :class="{ active: filterResourceType === 'customExercise' }" @click="selectResourceType('customExercise')">自定义练习题</div>
                </div>
              </div>
            </div>
            <div class="col-action">操作</div>
          </div>
          
          <!-- 表格内容区域 - 固定高度 -->
          <div class="table-content">
            <!-- 有数据时显示列表 -->
            <template v-if="uploadFiles.length > 0">
              <div v-for="(file, index) in uploadFiles" :key="file.id" class="table-row">
                <div class="col-index">{{ index + 1 }}</div>
                <div class="col-name">{{ file.name }}</div>
                <div class="col-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
                  </div>
                  <span class="progress-text" :class="{ complete: file.progress === 100 }">{{ file.progress }}%</span>
                </div>
                <div class="col-type">
                  <span class="type-text">{{ getResourceTypeName(file.resourceType) }}</span>
                </div>
                <div class="col-action">
                  <button class="delete-btn" @click="removeFile(index)">删 除</button>
                </div>
              </div>
            </template>
            
            <!-- 无数据时显示空状态 -->
            <div v-else class="table-empty">
              <div class="empty-icon">
                <svg viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" fill="#e6f4ff"/>
                  <rect x="30" y="35" width="60" height="50" rx="6" fill="white" stroke="#91caff" stroke-width="2"/>
                  <circle cx="45" cy="50" r="4" fill="#91caff"/>
                  <circle cx="55" cy="50" r="4" fill="#91caff"/>
                  <circle cx="65" cy="50" r="4" fill="#91caff"/>
                  <rect x="38" y="60" width="44" height="4" rx="2" fill="#bae0ff"/>
                  <rect x="38" y="68" width="30" height="4" rx="2" fill="#bae0ff"/>
                  <circle cx="95" cy="75" r="18" fill="#e6f4ff" stroke="#91caff" stroke-width="2"/>
                  <text x="95" y="80" text-anchor="middle" font-size="20" fill="#91caff">?</text>
                </svg>
              </div>
              <p class="empty-text">暂无资源</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface UploadFile {
  id: number
  name: string
  file: File
  progress: number
  resourceType: string
  status: 'pending' | 'uploading' | 'success' | 'error'
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'uploaded', files: UploadFile[]): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadFiles = ref<UploadFile[]>([])
const filterResourceType = ref('')
const typeDropdownOpen = ref(false)
let fileIdCounter = 0

const getResourceTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    courseResource: '课程资源',
    personalProgram: '个人程序',
    aiTraining: 'AI实训资源',
    customExercise: '自定义练习题'
  }
  return typeMap[type] || type
}

const selectResourceType = (type: string) => {
  filterResourceType.value = type
  typeDropdownOpen.value = false
}

// 点击外部关闭下拉框
const closeDropdown = () => {
  typeDropdownOpen.value = false
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))

const handleClose = () => {
  emit('update:visible', false)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  
  Array.from(input.files).forEach(file => {
    const uploadFile: UploadFile = {
      id: ++fileIdCounter,
      name: file.name,
      file: file,
      progress: 0,
      resourceType: 'courseResource',
      status: 'pending'
    }
    uploadFiles.value.push(uploadFile)
    
    // 模拟上传进度
    simulateUpload(uploadFile)
  })
  
  // 清空 input 以便重复选择同一文件
  input.value = ''
}

const simulateUpload = (file: UploadFile) => {
  file.status = 'uploading'
  const interval = setInterval(() => {
    if (file.progress < 100) {
      file.progress += Math.floor(Math.random() * 20) + 10
      if (file.progress > 100) file.progress = 100
    } else {
      file.status = 'success'
      clearInterval(interval)
    }
  }, 200)
}

const removeFile = (index: number) => {
  uploadFiles.value.splice(index, 1)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 1200px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.modal-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 0;
}

.close-btn:hover {
  color: #666;
}

.close-btn svg {
  width: 100%;
  height: 100%;
}

.modal-body {
  padding: 24px 32px;
  overflow-y: auto;
  flex: 1;
}

.upload-tip {
  font-size: 14px;
  color: #333;
  margin: 0 0 16px 0;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: white;
  border: 1px solid #2cb0ff;
  border-radius: 4px;
  color: #2cb0ff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #f0f9ff;
}

.warning-box {
  margin-top: 16px;
  margin-bottom: 16px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.warning-icon {
  width: 14px;
  height: 14px;
  color: #faad14;
}

.warning-header span {
  font-size: 13px;
  color: #333;
}

.link {
  font-size: 13px;
  color: #2cb0ff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* 悬浮提示框 */
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  display: none;
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 8px;
  background: rgba(50, 50, 50, 0.95);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tooltip-content p {
  margin: 0;
}

.tooltip-wrapper:hover .tooltip-content {
  display: block;
}

.warning-text {
  font-size: 12px;
  color: #999;
  margin: 0;
  line-height: 1.6;
}

.file-table {
  border-top: 1px solid #f0f0f0;
}

.table-header {
  display: flex;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
}

.table-header > div,
.table-row > div {
  padding: 14px 12px;
  display: flex;
  align-items: center;
}

.col-index { width: 60px; }
.col-name { flex: 1; min-width: 0; }
.col-progress { width: 280px; gap: 10px; }
.col-type { width: 140px; }
.col-action { width: 80px; justify-content: center; }

/* 自定义下拉框 */
.type-dropdown {
  position: relative;
}

.type-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #666;
  font-size: 13px;
}

.type-dropdown-trigger:hover {
  color: #2cb0ff;
}

.dropdown-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
}

.type-dropdown.open .dropdown-arrow {
  transform: rotate(180deg);
}

.type-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: -12px;
  min-width: 130px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 100;
  padding: 6px 0;
  overflow: hidden;
}

.type-dropdown-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.15s;
}

.type-dropdown-item:hover {
  background: #f5f7fa;
}

.type-dropdown-item.active {
  background: #e6f7ff;
  color: #2cb0ff;
}

.table-content {
  height: 300px;
  overflow-y: auto;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  color: #333;
}

.table-row:last-child {
  border-bottom: none;
}

.col-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #999;
  min-width: 45px;
  text-align: right;
}

.progress-text.complete {
  color: #52c41a;
}

.type-text {
  font-size: 13px;
  color: #333;
}

.type-select {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  background: white;
  cursor: pointer;
}

.type-select:focus {
  outline: none;
  border-color: #2cb0ff;
}

.delete-btn {
  padding: 4px 12px;
  background: white;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  color: #ff4d4f;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fff1f0;
}

/* 空状态 */
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}
</style>
