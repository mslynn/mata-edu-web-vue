<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <button class="close-btn" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <h2 class="modal-title">发送课件给学生</h2>
      
      <div class="tip-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>温馨提示:上课发送的课件,学生只能在上课过程中查看哦~</span>
      </div>
      
      <div class="content-area">
        <!-- 左侧：未发送课件 -->
        <div class="panel left-panel">
          <div class="panel-header">
            <label class="checkbox-wrapper" :class="{ disabled: unsentList.length === 0 }">
              <input type="checkbox" :checked="isAllUnsent" :disabled="unsentList.length === 0" @change="toggleAllUnsent" />
              <span class="checkmark"></span>
            </label>
            <span>未发送课件</span>
          </div>
          <div class="panel-list">
            <div 
              v-for="item in unsentList" 
              :key="item.id" 
              class="list-item"
            >
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="item.checked" />
                <span class="checkmark"></span>
              </label>
              <img :src="getFileIcon(item.type)" alt="" class="file-icon" />
              <span class="file-name" :title="item.name">{{ item.name }}</span>
            </div>
          </div>
          <div class="panel-footer">
            <button class="send-btn" @click="sendSelected" :disabled="!hasSelectedUnsent">发送课件</button>
          </div>
        </div>
        
        <!-- 右侧：已发送课件 -->
        <div class="panel right-panel">
          <div class="panel-header">
            <label class="checkbox-wrapper" :class="{ disabled: sentList.length === 0 }">
              <input type="checkbox" :checked="isAllSent" :disabled="sentList.length === 0" @change="toggleAllSent" />
              <span class="checkmark"></span>
            </label>
            <span>已发送课件</span>
          </div>
          <div class="panel-list">
            <div v-if="sentList.length === 0" class="empty-state">
              <img src="~/assets/images/account.png" alt="" class="empty-img" />
              <p class="empty-text">暂未发送课件给学生,快去</p>
              <p class="empty-text">左侧选择课件吧!</p>
            </div>
            <div 
              v-for="item in sentList" 
              :key="item.id" 
              class="list-item"
            >
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="item.checked" />
                <span class="checkmark"></span>
              </label>
              <img :src="getFileIcon(item.type)" alt="" class="file-icon" />
              <span class="file-name" :title="item.name">{{ item.name }}</span>
            </div>
          </div>
          <div class="panel-footer">
            <button class="recall-btn" @click="recallSelected" :disabled="!hasSelectedSent">撤回课件</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CoursewareItem {
  id: string
  name: string
  type: 'pptx' | 'ucd' | 'word' | 'pdf'
  checked: boolean
}

defineProps<{
  visible: boolean
}>()

defineEmits<{
  close: []
}>()

// 未发送课件列表
const unsentList = ref<CoursewareItem[]>([
  { id: '1', name: '主题01-"悟空"来了（课件）V1.5.pptx', type: 'pptx', checked: false },
  { id: '2', name: '1-1参考程序.ucd', type: 'ucd', checked: false },
  { id: '3', name: '1-2参考程序.ucd', type: 'ucd', checked: false },
  { id: '4', name: '主题01-"悟空"来了（学生手册）V1...', type: 'word', checked: false },
  { id: '5', name: '主题01-"悟空"来了（教师用书）V1...', type: 'word', checked: false },
  { id: '6', name: '主题01-"悟空"来了（教师用书）V1...', type: 'word', checked: false },
  { id: '7', name: '主题01-"悟空"来了（教师用书）V1...', type: 'word', checked: false },
  { id: '8', name: '主题01-"悟空"来了（教师用书）V1...', type: 'word', checked: false }
])

// 已发送课件列表
const sentList = ref<CoursewareItem[]>([])

// 计算属性
const isAllUnsent = computed(() => unsentList.value.length > 0 && unsentList.value.every(item => item.checked))
const isAllSent = computed(() => sentList.value.length > 0 && sentList.value.every(item => item.checked))
const hasSelectedUnsent = computed(() => unsentList.value.some(item => item.checked))
const hasSelectedSent = computed(() => sentList.value.some(item => item.checked))

// 全选/取消全选
const toggleAllUnsent = () => {
  const newVal = !isAllUnsent.value
  unsentList.value.forEach(item => item.checked = newVal)
}

const toggleAllSent = () => {
  const newVal = !isAllSent.value
  sentList.value.forEach(item => item.checked = newVal)
}

// 发送选中的课件
const sendSelected = () => {
  const selected = unsentList.value.filter(item => item.checked)
  selected.forEach(item => {
    item.checked = false
    sentList.value.push({ ...item })
  })
  unsentList.value = unsentList.value.filter(item => !selected.find(s => s.id === item.id))
}

// 撤回选中的课件
const recallSelected = () => {
  const selected = sentList.value.filter(item => item.checked)
  selected.forEach(item => {
    item.checked = false
    unsentList.value.push({ ...item })
  })
  sentList.value = sentList.value.filter(item => !selected.find(s => s.id === item.id))
}

// 获取文件图标
const getFileIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    pptx: '/images/icon-ppt.png',
    ucd: '/images/icon-ucd.png',
    word: '/images/icon-word.png',
    pdf: '/images/icon-pdf.png'
  }
  return iconMap[type] || '/images/icon-file.png'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  width: 800px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  padding: 24px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: #F5F5F5;
  color: #666;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 16px;
}

.tip-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #FFF7E6;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #666;
}

.content-area {
  display: flex;
  gap: 20px;
}

.panel {
  flex: 1;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid #E5E5E5;
  font-size: 14px;
  color: #333;
}

.panel-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
}

.list-item:hover {
  background: #F9F9F9;
}

.file-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #E5E5E5;
  display: flex;
  justify-content: center;
}

.send-btn {
  padding: 8px 32px;
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:not(:disabled):hover {
  background: #FF9900;
  border-color: #FF9900;
  color: white;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recall-btn {
  padding: 8px 32px;
  background: #F5F5F5;
  border: 1px solid #E5E5E5;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.recall-btn:not(:disabled):hover {
  background: #FF6B6B;
  border-color: #FF6B6B;
  color: white;
}

.recall-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
}

.empty-img {
  width: 120px;
  height: auto;
  margin-bottom: 16px;
  opacity: 0.8;
}

.empty-text {
  font-size: 13px;
  color: #999;
  line-height: 1.6;
  margin: 0;
}

/* 自定义复选框 */
.checkbox-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 1px solid #D9D9D9;
  border-radius: 3px;
  background: white;
  transition: all 0.2s;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background: #FF9900;
  border-color: #FF9900;
}

.checkbox-wrapper input:checked ~ .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-wrapper.disabled {
  cursor: not-allowed;
}

.checkbox-wrapper.disabled .checkmark {
  background: #F5F5F5;
  border-color: #E5E5E5;
}
</style>
