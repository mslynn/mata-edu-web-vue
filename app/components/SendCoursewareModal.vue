<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <button class="close-btn" @click="$emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <h2 class="modal-title">{{ t('classroom.sendCoursewareTitle') }}</h2>
      
      <div class="tip-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ t('classroom.sendCoursewareTip') }}</span>
      </div>
      
      <div class="content-area">
        <!-- 左侧：未发送课件 -->
        <div class="panel left-panel">
          <div class="panel-header">
            <label class="checkbox-wrapper" :class="{ disabled: localUnsentList.length === 0 }">
              <input type="checkbox" :checked="isAllUnsent" :disabled="localUnsentList.length === 0" @change="toggleAllUnsent" />
              <span class="checkmark"></span>
            </label>
            <span>{{ t('classroom.unsentCourseware') }}</span>
          </div>
          <div class="panel-list">
            <div v-if="localUnsentList.length === 0" class="empty-state">
              <svg class="empty-icon success" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#52C41A" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12l3 3 5-6"/>
              </svg>
              <p class="empty-text success-text">{{ t('classroom.allCoursewareSent') }}</p>
            </div>
            <div 
              v-else
              v-for="item in localUnsentList" 
              :key="item.id" 
              class="list-item"
            >
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="item.checked" />
                <span class="checkmark"></span>
              </label>
              <img :src="getFileIcon(item.name)" alt="" class="file-icon" />
              <span class="file-name" :title="item.name">{{ item.name }}</span>
            </div>
          </div>
          <div class="panel-footer">
            <button class="send-btn" @click="sendSelected" :disabled="!hasSelectedUnsent || sending">
              {{ sending ? t('classroom.sending') : t('classroom.sendCourseware') }}
            </button>
          </div>
        </div>
        
        <!-- 右侧：已发送课件 -->
        <div class="panel right-panel">
          <div class="panel-header">
            <label class="checkbox-wrapper" :class="{ disabled: localSentList.length === 0 }">
              <input type="checkbox" :checked="isAllSent" :disabled="localSentList.length === 0" @change="toggleAllSent" />
              <span class="checkmark"></span>
            </label>
            <span>{{ t('classroom.sentCourseware') }}</span>
          </div>
          <div class="panel-list">
            <div v-if="localSentList.length === 0" class="empty-state">
              <img src="~/assets/images/account.png" alt="" class="empty-img" />
              <p class="empty-text">{{ t('classroom.noSentCoursewareLine1') }}</p>
              <p class="empty-text">{{ t('classroom.noSentCoursewareLine2') }}</p>
            </div>
            <div 
              v-else
              v-for="item in localSentList" 
              :key="item.id" 
              class="list-item"
            >
              <label class="checkbox-wrapper">
                <input type="checkbox" v-model="item.checked" />
                <span class="checkmark"></span>
              </label>
              <img :src="getFileIcon(item.name)" alt="" class="file-icon" />
              <span class="file-name" :title="item.name">{{ item.name }}</span>
            </div>
          </div>
          <div class="panel-footer">
            <button class="recall-btn" @click="recallSelected" :disabled="!hasSelectedSent || recalling">
              {{ recalling ? t('classroom.recalling') : t('classroom.recallCourseware') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeacher } from '~/composables/api/useTeacher'

const { t } = useI18n()

interface CoursewareItem {
  id: string
  name: string
  resourceUrl?: string
  checked?: boolean
}

const props = defineProps<{
  visible: boolean
  classId: string
  peerId: string
  unsentList: CoursewareItem[]
  sentList: CoursewareItem[]
}>()

const emit = defineEmits<{
  close: []
  send: [ids: string[]]
  recall: [ids: string[]]
}>()

const { sendCourseware, withdrawSend } = useTeacher()

// 状态
const sending = ref(false)
const recalling = ref(false)

// 本地列表（带 checked 状态）
const localUnsentList = ref<(CoursewareItem & { checked: boolean })[]>([])
const localSentList = ref<(CoursewareItem & { checked: boolean })[]>([])

// 监听弹窗打开，初始化本地列表
watch(() => props.visible, (val) => {
  if (val) {
    localUnsentList.value = props.unsentList.map(item => ({ ...item, checked: false }))
    localSentList.value = props.sentList.map(item => ({ ...item, checked: false }))
  }
})

// 计算属性
const isAllUnsent = computed(() => localUnsentList.value.length > 0 && localUnsentList.value.every(item => item.checked))
const isAllSent = computed(() => localSentList.value.length > 0 && localSentList.value.every(item => item.checked))
const hasSelectedUnsent = computed(() => localUnsentList.value.some(item => item.checked))
const hasSelectedSent = computed(() => localSentList.value.some(item => item.checked))

// 全选/取消全选
const toggleAllUnsent = () => {
  const newVal = !isAllUnsent.value
  localUnsentList.value.forEach(item => item.checked = newVal)
}

const toggleAllSent = () => {
  const newVal = !isAllSent.value
  localSentList.value.forEach(item => item.checked = newVal)
}

// 发送选中的课件
const sendSelected = async () => {
  const selected = localUnsentList.value.filter(item => item.checked)
  if (selected.length === 0) return
  
  sending.value = true
  try {
    await sendCourseware({
      classId: props.classId,
      peerId: props.peerId,
      coursewareList: selected.map(item => ({
        resourceId: item.id,
        fileName: item.name,
        resourceUrl: item.resourceUrl || ''
      }))
    })
    
    // 通知父组件更新状态
    emit('send', selected.map(item => item.id))
    
    // 更新本地列表
    selected.forEach(item => {
      item.checked = false
      localSentList.value.push({ ...item, checked: false })
    })
    localUnsentList.value = localUnsentList.value.filter(item => !selected.find(s => s.id === item.id))
  } catch (error) {
    console.error('发送课件失败:', error)
  } finally {
    sending.value = false
  }
}

// 撤回选中的课件
const recallSelected = async () => {
  const selected = localSentList.value.filter(item => item.checked)
  if (selected.length === 0) return
  
  recalling.value = true
  try {
    await withdrawSend({
      classId: props.classId,
      peerId: props.peerId,
      coursewareList: selected.map(item => ({
        resourceId: item.id,
        fileName: item.name,
        resourceUrl: item.resourceUrl || ''
      }))
    })
    
    // 通知父组件更新状态
    emit('recall', selected.map(item => item.id))
    
    // 更新本地列表
    selected.forEach(item => {
      item.checked = false
      localUnsentList.value.push({ ...item, checked: false })
    })
    localSentList.value = localSentList.value.filter(item => !selected.find(s => s.id === item.id))
  } catch (error) {
    console.error('撤回课件失败:', error)
  } finally {
    recalling.value = false
  }
}

// 获取文件图标
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    pptx: '/images/icon-ppt.png',
    ppt: '/images/icon-ppt.png',
    ucd: '/images/icon-ucd.png',
    doc: '/images/icon-word.png',
    docx: '/images/icon-word.png',
    pdf: '/images/icon-pdf.png',
    xls: '/images/icon-excel.png',
    xlsx: '/images/icon-excel.png'
  }
  return iconMap[ext] || '/images/icon-file.png'
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

.empty-icon {
  margin-bottom: 16px;
}

.empty-icon.success {
  color: #52C41A;
}

.empty-text {
  font-size: 13px;
  color: #999;
  line-height: 1.6;
  margin: 0;
}

.empty-text.success-text {
  color: #52C41A;
  font-size: 14px;
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
