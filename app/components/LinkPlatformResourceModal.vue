<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <span class="modal-title">关联平台资源</span>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <p class="tip-text">请选择对应本地个人文件上传或关联作品中心文件：</p>
        
        <!-- 资源类型按钮 -->
        <div class="resource-type-tabs">
          <button 
            v-for="tab in resourceTabs" 
            :key="tab.value" 
            class="type-tab"
            :class="{ active: activeResourceTab === tab.value }"
            @click="activeResourceTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <!-- 种类筛选 -->
        <div class="category-filter">
          <span class="filter-label">种类：</span>
          <div class="category-tabs">
            <button 
              v-for="cat in categories" 
              :key="cat.value" 
              class="category-tab"
              :class="{ active: activeCategory === cat.value }"
              @click="activeCategory = cat.value"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>
        
        <!-- 资源卡片列表 - 可滚动区域 -->
        <div class="resource-scroll-area">
          <div class="resource-grid">
            <div 
              v-for="item in filteredResources" 
              :key="item.id" 
              class="resource-card"
              :class="{ selected: selectedIds.includes(item.id) }"
              @click="toggleSelect(item)"
            >
              <div class="card-image">
                <img :src="item.cover" :alt="item.name" />
                <span v-if="item.isNew" class="tag tag-new">推荐</span>
                <span class="tag tag-exp">体验</span>
              </div>
              <div class="card-info">
                <span class="card-name">{{ item.name }}</span>
                <span v-if="item.linked" class="linked-tag">已关联</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-close" @click="handleClose">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Resource {
  id: number
  name: string
  cover: string
  category: string
  type: string
  isNew?: boolean
  linked?: boolean
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'linked', ids: number[]): void
}>()

const activeResourceTab = ref('aiTraining')
const activeCategory = ref('aigc')
const selectedIds = ref<number[]>([])

const resourceTabs = [
  { label: '关联AI实训资源', value: 'aiTraining' },
  { label: '关联作品管理文件', value: 'works' },
  { label: '关联自定义练习题', value: 'exercise' },
  { label: '关联素材模型', value: 'material' }
]

const categories = [
  { label: 'AIGC', value: 'aigc' },
  { label: '图像识别', value: 'image' },
  { label: '语音识别', value: 'voice' },
  { label: '机器学习', value: 'ml' },
  { label: '人脸识别', value: 'face' },
  { label: '自然语言处理', value: 'nlp' },
  { label: '姿态识别', value: 'pose' },
  { label: '涂鸦识别', value: 'doodle' }
]

// 模拟资源数据
const resources = ref<Resource[]>([
  { id: 1, name: 'AI虚拟人', cover: 'https://picsum.photos/200/150?random=1', category: 'aigc', type: 'aiTraining', isNew: true, linked: true },
  { id: 2, name: 'AI画图', cover: 'https://picsum.photos/200/150?random=2', category: 'aigc', type: 'aiTraining', linked: true },
  { id: 3, name: 'AI涂鸦生图', cover: 'https://picsum.photos/200/150?random=3', category: 'aigc', type: 'aiTraining', linked: true },
  { id: 4, name: 'AI对话大模型', cover: 'https://picsum.photos/200/150?random=4', category: 'aigc', type: 'aiTraining' },
  { id: 5, name: 'AI风景生成', cover: 'https://picsum.photos/200/150?random=5', category: 'aigc', type: 'aiTraining' },
  { id: 6, name: '图像分类', cover: 'https://picsum.photos/200/150?random=6', category: 'image', type: 'aiTraining' },
  { id: 7, name: '目标检测', cover: 'https://picsum.photos/200/150?random=7', category: 'image', type: 'aiTraining' },
  { id: 8, name: '语音转文字', cover: 'https://picsum.photos/200/150?random=8', category: 'voice', type: 'aiTraining' }
])

const filteredResources = computed(() => {
  return resources.value.filter(r => 
    r.type === activeResourceTab.value && 
    r.category === activeCategory.value
  )
})

const handleClose = () => {
  emit('update:visible', false)
}

const toggleSelect = (item: Resource) => {
  const index = selectedIds.value.indexOf(item.id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(item.id)
  }
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
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tip-text {
  font-size: 14px;
  color: #333;
  margin: 0 0 20px 0;
  flex-shrink: 0;
}

.resource-type-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.type-tab {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  border: 1px solid #d9d9d9;
  color: #333;
}

.type-tab:hover {
  border-color: #FF9900;
  color: #FF9900;
}

.type-tab.active {
  background: #FF9900;
  border-color: #FF9900;
  color: white;
}

.category-filter {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.filter-label {
  font-size: 14px;
  color: #666;
  margin-right: 12px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  border: 1px solid transparent;
  color: #666;
}

.category-tab:hover {
  color: #2cb0ff;
}

.category-tab.active {
  background: #2cb0ff;
  color: white;
}

.resource-scroll-area {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding-bottom: 10px;
}

.resource-card {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-card.selected {
  border-color: #2cb0ff;
}

.card-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag {
  position: absolute;
  padding: 2px 8px;
  font-size: 12px;
  color: white;
  border-radius: 2px;
}

.tag-new {
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
}

.tag-exp {
  top: 8px;
  right: 8px;
  background: #ff7a45;
}

.card-info {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}

.card-name {
  font-size: 14px;
  color: #333;
}

.linked-tag {
  padding: 2px 8px;
  background: #e6f7ff;
  color: #2cb0ff;
  font-size: 12px;
  border-radius: 4px;
}

.modal-footer {
  padding: 16px 32px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

.btn-close {
  padding: 10px 60px;
  background: #2cb0ff;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #1a9fe8;
}
</style>
