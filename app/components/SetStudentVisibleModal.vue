<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <span class="modal-title">设置学生可见资源（学生可在课前、课后查看资源）</span>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="left-panel">
          <!-- 搜索框 -->
          <div class="search-box">
            <input type="text" v-model="searchKeyword" placeholder="可输入资源名称快速搜索" />
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <!-- 资源树 -->
          <div class="resource-tree">
            <!-- 暂无数据 -->
            <div v-if="filteredResourceGroups.length === 0" class="empty-state">
              <svg viewBox="0 0 100 100" fill="none">
                <rect x="20" y="25" width="60" height="50" rx="4" stroke="#d9d9d9" stroke-width="2" fill="none"/>
                <line x1="30" y1="40" x2="70" y2="40" stroke="#d9d9d9" stroke-width="2"/>
                <line x1="30" y1="50" x2="60" y2="50" stroke="#d9d9d9" stroke-width="2"/>
                <line x1="30" y1="60" x2="50" y2="60" stroke="#d9d9d9" stroke-width="2"/>
              </svg>
              <span>暂无数据</span>
            </div>
            
            <div v-for="group in filteredResourceGroups" :key="group.id" class="tree-group">
              <div class="tree-group-header" @click="toggleGroup(group)">
                <input type="checkbox" :checked="isGroupChecked(group)" @click.stop="toggleGroupCheck(group)" />
                <svg class="expand-icon" :class="{ expanded: group.expanded }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>{{ group.name }}</span>
              </div>
              
              <div v-if="group.expanded" class="tree-children">
                <div v-for="category in getFilteredCategories(group)" :key="category.id" class="tree-category">
                  <div class="tree-category-header" @click="toggleCategory(category)">
                    <input type="checkbox" :checked="isCategoryChecked(category)" @click.stop="toggleCategoryCheck(category)" />
                    <svg class="expand-icon" :class="{ expanded: category.expanded }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    <span>{{ category.name }}</span>
                  </div>
                  
                  <div v-if="category.expanded" class="tree-items">
                    <div v-for="item in getFilteredItems(category)" :key="item.id" class="tree-item">
                      <input type="checkbox" :checked="selectedIds.includes(item.id)" @change="toggleItem(item)" />
                      <div class="item-icon" :class="getIconClass(item.type)">
                        <span>{{ getIconText(item.type) }}</span>
                      </div>
                      <span class="item-name" :title="item.name">{{ item.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="right-panel">
          <div class="selected-header">已选资源（{{ selectedItems.length }}）</div>
          <div class="selected-list">
            <div v-for="item in selectedItems" :key="item.id" class="selected-item">
              <div class="item-icon" :class="getIconClass(item.type)">
                <span>{{ getIconText(item.type) }}</span>
              </div>
              <span class="item-name">{{ item.name }}</span>
              <div class="item-tags">
                <span class="tag tag-green">{{ item.groupName }}</span>
                <span class="tag tag-outline">{{ item.categoryName }}</span>
              </div>
              <button class="remove-btn" @click="removeItem(item)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-cancel" @click="handleClose">取 消</button>
        <button class="btn-confirm" @click="handleConfirm">确 定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ResourceItem {
  id: number
  name: string
  type: string
  groupName?: string
  categoryName?: string
}

interface Category {
  id: number
  name: string
  expanded: boolean
  items: ResourceItem[]
}

interface ResourceGroup {
  id: number
  name: string
  expanded: boolean
  children: Category[]
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', ids: number[]): void
}>()

const searchKeyword = ref('')
const selectedIds = ref<number[]>([2, 3, 4, 5, 6])

// 模拟资源数据
const resourceGroups = ref<ResourceGroup[]>([
  {
    id: 1,
    name: '教学设计',
    expanded: false,
    children: [
      {
        id: 11,
        name: '教案',
        expanded: false,
        items: [
          { id: 1, name: '主题01-"悟空"来了...', type: 'ppt' }
        ]
      }
    ]
  },
  {
    id: 2,
    name: '教学资源',
    expanded: true,
    children: [
      {
        id: 21,
        name: '课件',
        expanded: true,
        items: [
          { id: 2, name: '主题01-"悟空"来了（课件）V1.5.pptx', type: 'ppt' }
        ]
      },
      {
        id: 22,
        name: '教师程序',
        expanded: true,
        items: [
          { id: 3, name: '1-1参考程序.ucd', type: 'ucd' },
          { id: 4, name: '1-2参考程序.ucd', type: 'ucd' }
        ]
      },
      {
        id: 23,
        name: '学生手册',
        expanded: true,
        items: [
          { id: 5, name: '主题01-"悟空"来了（学生手册）V1.5.docx', type: 'word' }
        ]
      }
    ]
  },
  {
    id: 3,
    name: '个人资源',
    expanded: false,
    children: [
      {
        id: 31,
        name: '课程资源',
        expanded: false,
        items: [
          { id: 6, name: '万正洋-SAP SD顾问.pdf', type: 'pdf' }
        ]
      }
    ]
  }
])

// 获取所有资源项的扁平列表
const allItems = computed(() => {
  const items: ResourceItem[] = []
  resourceGroups.value.forEach(group => {
    group.children.forEach(category => {
      category.items.forEach(item => {
        items.push({
          ...item,
          groupName: group.name,
          categoryName: category.name
        })
      })
    })
  })
  return items
})

// 已选中的资源列表
const selectedItems = computed(() => {
  return allItems.value.filter(item => selectedIds.value.includes(item.id))
})

// 根据搜索关键词过滤资源组
const filteredResourceGroups = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return resourceGroups.value
  
  return resourceGroups.value.filter(group => {
    // 检查组内是否有匹配的项
    return group.children.some(category => 
      category.items.some(item => item.name.toLowerCase().includes(keyword))
    )
  })
})

// 获取过滤后的分类
const getFilteredCategories = (group: ResourceGroup) => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return group.children
  
  return group.children.filter(category => 
    category.items.some(item => item.name.toLowerCase().includes(keyword))
  )
}

// 获取过滤后的资源项
const getFilteredItems = (category: Category) => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return category.items
  
  return category.items.filter(item => item.name.toLowerCase().includes(keyword))
}

const getIconClass = (type: string) => {
  return {
    word: 'icon-word',
    ppt: 'icon-ppt',
    pdf: 'icon-pdf',
    ucd: 'icon-ucd'
  }[type] || 'icon-default'
}

const getIconText = (type: string) => {
  return {
    word: 'W',
    ppt: 'P',
    pdf: 'PDF',
    ucd: 'ucd'
  }[type] || '?'
}

const toggleGroup = (group: ResourceGroup) => {
  group.expanded = !group.expanded
}

const toggleCategory = (category: Category) => {
  category.expanded = !category.expanded
}

const isGroupChecked = (group: ResourceGroup) => {
  const allIds = group.children.flatMap(c => c.items.map(i => i.id))
  return allIds.length > 0 && allIds.every(id => selectedIds.value.includes(id))
}

const isCategoryChecked = (category: Category) => {
  const allIds = category.items.map(i => i.id)
  return allIds.length > 0 && allIds.every(id => selectedIds.value.includes(id))
}

const toggleGroupCheck = (group: ResourceGroup) => {
  const allIds = group.children.flatMap(c => c.items.map(i => i.id))
  const allChecked = isGroupChecked(group)
  if (allChecked) {
    selectedIds.value = selectedIds.value.filter(id => !allIds.includes(id))
  } else {
    allIds.forEach(id => {
      if (!selectedIds.value.includes(id)) {
        selectedIds.value.push(id)
      }
    })
  }
}

const toggleCategoryCheck = (category: Category) => {
  const allIds = category.items.map(i => i.id)
  const allChecked = isCategoryChecked(category)
  if (allChecked) {
    selectedIds.value = selectedIds.value.filter(id => !allIds.includes(id))
  } else {
    allIds.forEach(id => {
      if (!selectedIds.value.includes(id)) {
        selectedIds.value.push(id)
      }
    })
  }
}

const toggleItem = (item: ResourceItem) => {
  const index = selectedIds.value.indexOf(item.id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(item.id)
  }
}

const removeItem = (item: ResourceItem) => {
  const index = selectedIds.value.indexOf(item.id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleConfirm = () => {
  emit('confirm', selectedIds.value)
  emit('update:visible', false)
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
  width: 1180px;
  max-width: 95vw;
  height: 700px;
  max-height: 90vh;
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
  color: #2cb0ff;
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

.close-btn:hover { color: #666; }
.close-btn svg { width: 100%; height: 100%; }

.modal-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 20px;
  gap: 20px;
}

.left-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.search-box {
  position: relative;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.search-box input {
  width: 100%;
  padding: 8px 36px 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.search-box input:focus { border-color: #2cb0ff; }

.search-icon {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #2cb0ff;
}

.resource-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.empty-state svg {
  width: 60px;
  height: 60px;
  margin-bottom: 12px;
}

.tree-group-header,
.tree-category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.tree-group-header:hover,
.tree-category-header:hover { background: #f5f7fa; }

.tree-category-header { padding-left: 32px; }

.expand-icon {
  width: 16px;
  height: 16px;
  color: #999;
  transition: transform 0.2s;
  transform: rotate(-90deg);
}

.expand-icon.expanded { transform: rotate(0deg); }

.tree-items { padding-left: 52px; }

.tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: #333;
}

.tree-item:hover { background: #f5f7fa; }

.item-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  flex-shrink: 0;
}

.icon-word { background: #2B5797; color: white; }
.icon-ppt { background: #D04423; color: white; }
.icon-pdf { background: #E53935; color: white; }
.icon-ucd { background: #ff6b6b; color: white; }

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.selected-header {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.selected-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.selected-item:last-child { border-bottom: none; }

.selected-item .item-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.item-tags {
  display: flex;
  gap: 8px;
}

.tag {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
}

.tag-green {
  background: #e6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.tag-outline {
  background: white;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.remove-btn {
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #ff4d4f;
  flex-shrink: 0;
}

.remove-btn:hover { opacity: 0.8; }
.remove-btn svg { width: 100%; height: 100%; }

.modal-footer {
  padding: 16px 32px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cancel {
  padding: 10px 40px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover { border-color: #2cb0ff; color: #2cb0ff; }

.btn-confirm {
  padding: 10px 40px;
  background: #2cb0ff;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover { background: #1a9fe8; }

input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  border: 2px solid #d9d9d9;
  border-radius: 3px;
  background: white;
  position: relative;
}

input[type="checkbox"]:checked {
  background: #FF9900;
  border-color: #FF9900;
}

input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
</style>
