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
            <!-- 加载中 -->
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <span>加载中...</span>
            </div>
            
            <!-- 暂无数据 -->
            <div v-else-if="filteredResourceGroups.length === 0" class="empty-state">
              <svg viewBox="0 0 100 100" fill="none">
                <rect x="20" y="25" width="60" height="50" rx="4" stroke="#d9d9d9" stroke-width="2" fill="none"/>
                <line x1="30" y1="40" x2="70" y2="40" stroke="#d9d9d9" stroke-width="2"/>
                <line x1="30" y1="50" x2="60" y2="50" stroke="#d9d9d9" stroke-width="2"/>
                <line x1="30" y1="60" x2="50" y2="60" stroke="#d9d9d9" stroke-width="2"/>
              </svg>
              <span>暂无数据</span>
            </div>
            
            <div v-else v-for="group in filteredResourceGroups" :key="group.resourceName" class="tree-group">
              <div class="tree-group-header" @click="toggleGroup(group.resourceName)">
                <svg class="expand-icon" :class="{ expanded: expandedGroups[group.resourceName] }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <span>{{ group.resourceName }} ({{ group.resourceList?.length || 0 }})</span>
              </div>
              
              <div v-if="expandedGroups[group.resourceName]" class="tree-items">
                <div 
                  v-for="item in getFilteredItems(group)" 
                  :key="item.resourceId" 
                  class="tree-item"
                  :class="{ selected: isSelected(item.resourceId) }"
                  @click="selectItem(item)"
                >
                  <div class="item-checkbox" :class="{ checked: isSelected(item.resourceId) }">
                    <svg v-if="isSelected(item.resourceId)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div class="item-icon" :class="getIconClass(getFileType(item.fileName))">
                    <span>{{ getIconText(getFileType(item.fileName)) }}</span>
                  </div>
                  <span class="item-name" :title="item.fileName">{{ item.fileName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="right-panel">
          <div class="selected-header">已选资源（{{ selectedItems.length }}）</div>
          <div class="selected-list">
            <template v-if="selectedItems.length > 0">
              <div v-for="item in selectedItems" :key="item.resourceId" class="selected-item">
                <div class="item-icon" :class="getIconClass(getFileType(item.fileName))">
                  <span>{{ getIconText(getFileType(item.fileName)) }}</span>
                </div>
                <span class="item-name">{{ item.fileName }}</span>
                <div class="item-tags">
                  <span class="tag tag-green">{{ item.resourceName }}</span>
                </div>
                <button class="remove-btn" @click="removeItem(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </button>
              </div>
            </template>
            <div v-else class="empty-selected">
              <span>请从左侧选择资源</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-cancel" @click="handleClose">取 消</button>
        <button class="btn-confirm" :disabled="saving" @click="handleConfirm">
          {{ saving ? '保存中...' : '确 定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { cursorAdmin } from '~/composables/api/curosr'

interface ResourceItem {
  resourceId: number
  chapterId: string
  resourceType: number
  resourceCategory: number
  resourceName: string
  ossId: string
  fileName: string
  modifyNum: number
  resourceUrl?: string
  isVisible?: number  // 1=学生可见, 0=不可见
}

interface ResourceGroup {
  resourceCategory: number | null
  resourceName: string
  resourceList: ResourceItem[]
}

const props = defineProps<{
  visible: boolean
  chapterId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', resourceIds: number[]): void
}>()

const { getChapterResourceList, setChapterResourceVisibleStudent } = cursorAdmin()

const searchKeyword = ref('')
const loading = ref(false)
const saving = ref(false)
const selectedResourceIds = ref<number[]>([])
const resourceGroups = ref<ResourceGroup[]>([])
const expandedGroups = reactive<Record<string, boolean>>({})

// 根据文件名获取文件类型
const getFileType = (fileName: string) => {
  const ext = fileName?.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    doc: 'word', docx: 'word',
    ppt: 'ppt', pptx: 'ppt',
    xls: 'excel', xlsx: 'excel',
    pdf: 'pdf',
    ucd: 'ucd',
    mc: 'mc',
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image',
    mp4: 'video', mov: 'video', webm: 'video'
  }
  return typeMap[ext] || 'default'
}

// 获取所有资源项的扁平列表（附带分组名）
const allItems = computed(() => {
  const items: (ResourceItem & { groupName: string })[] = []
  resourceGroups.value.forEach(group => {
    group.resourceList?.forEach(item => {
      items.push({
        ...item,
        groupName: group.resourceName
      })
    })
  })
  return items
})

// 当前选中的资源列表
const selectedItems = computed(() => {
  return allItems.value.filter(i => selectedResourceIds.value.includes(i.resourceId))
})

// 根据搜索关键词过滤资源组
const filteredResourceGroups = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return resourceGroups.value
  
  return resourceGroups.value.filter(group => {
    return group.resourceList?.some(item => 
      item.fileName.toLowerCase().includes(keyword)
    )
  })
})

// 获取过滤后的资源项
const getFilteredItems = (group: ResourceGroup) => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return group.resourceList || []
  
  return (group.resourceList || []).filter(item => 
    item.fileName.toLowerCase().includes(keyword)
  )
}

const getIconClass = (type: string) => {
  return {
    word: 'icon-word',
    ppt: 'icon-ppt',
    pdf: 'icon-pdf',
    ucd: 'icon-ucd',
    mc: 'icon-mc',
    excel: 'icon-excel',
    image: 'icon-image',
    video: 'icon-video'
  }[type] || 'icon-default'
}

const getIconText = (type: string) => {
  return {
    word: 'W',
    ppt: 'P',
    pdf: 'PDF',
    ucd: 'ucd',
    mc: 'mc',
    excel: 'X',
    image: '图',
    video: '视'
  }[type] || '?'
}

const toggleGroup = (groupName: string) => {
  expandedGroups[groupName] = !expandedGroups[groupName]
}

const selectItem = (item: ResourceItem) => {
  // 如果已选中则不重复添加
  if (!selectedResourceIds.value.includes(item.resourceId)) {
    selectedResourceIds.value.push(item.resourceId)
  }
}

const removeItem = (item: ResourceItem & { groupName: string }) => {
  const index = selectedResourceIds.value.indexOf(item.resourceId)
  if (index > -1) {
    selectedResourceIds.value.splice(index, 1)
  }
}

// 判断资源是否已选中
const isSelected = (resourceId: number) => {
  return selectedResourceIds.value.includes(resourceId)
}

// 加载资源数据
const loadResources = async () => {
  if (!props.chapterId) return
  
  loading.value = true
  try {
    // 不传 resourceType，获取所有类型的资源
    const data = await getChapterResourceList(props.chapterId)
    resourceGroups.value = data || []
    
    // 默认展开所有分组
    resourceGroups.value.forEach(group => {
      expandedGroups[group.resourceName] = true
    })
    
    // 根据 isVisible 初始化已选状态
    selectedResourceIds.value = []
    resourceGroups.value.forEach(group => {
      group.resourceList?.forEach(item => {
        if (item.isVisible === 1) {
          selectedResourceIds.value.push(item.resourceId)
        }
      })
    })
  } catch (error) {
    console.error('加载资源失败:', error)
    ElMessage.error('加载资源失败')
  } finally {
    loading.value = false
  }
}

// 监听弹窗打开
watch(() => props.visible, (newVal) => {
  if (newVal) {
    searchKeyword.value = ''
    loadResources()  // loadResources 会根据 isVisible 初始化已选状态
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleConfirm = async () => {
  saving.value = true
  try {
    // 构建所有资源的可见状态：已选的 isVisible=1，未选的 isVisible=0
    const resourceList = allItems.value.map(item => ({
      resourceId: String(item.resourceId),
      isVisible: selectedResourceIds.value.includes(item.resourceId) ? 1 : 0
    }))
    
    await setChapterResourceVisibleStudent({ resourceList })
    ElMessage.success('设置成功')
    
    // 提交成功后重新加载列表
    await loadResources()
    
    emit('confirm', selectedResourceIds.value)
    emit('update:visible', false)
  } catch (error) {
    console.error('设置失败:', error)
    ElMessage.error('设置失败')
  } finally {
    saving.value = false
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
  width: 900px;
  max-width: 95vw;
  height: 600px;
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
  color: #FF9900;
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
  width: 400px;
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

.search-box input:focus { border-color: #FF9900; }

.search-icon {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #FF9900;
}

.resource-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

.loading-state .spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f0f0f0;
  border-top-color: #FF9900;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  width: 60px;
  height: 60px;
  margin-bottom: 12px;
}

.tree-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background: #fafafa;
}

.tree-group-header:hover { background: #f0f0f0; }

.expand-icon {
  width: 16px;
  height: 16px;
  color: #999;
  transition: transform 0.2s;
  transform: rotate(-90deg);
}

.expand-icon.expanded { transform: rotate(0deg); }

.tree-items { padding: 4px 0; }

.tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 8px 28px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.tree-item:hover { background: #f5f7fa; }
.tree-item.selected { background: #e6f7ff; }

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
.icon-mc { background: #9c27b0; color: white; }
.icon-excel { background: #217346; color: white; }
.icon-image { background: #4caf50; color: white; }
.icon-video { background: #ff9800; color: white; }
.icon-default { background: #999; color: white; }

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
  background: #f9f9f9;
  border-radius: 6px;
}

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

.empty-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

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

.btn-cancel:hover { border-color: #FF9900; color: #FF9900; }

.btn-confirm {
  padding: 10px 40px;
  background: #FF9900;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover { background: #E68A00; }
.btn-confirm:disabled { background: #ccc; cursor: not-allowed; }

.item-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #d9d9d9;
  border-radius: 3px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.item-checkbox.checked {
  background: #FF9900;
  border-color: #FF9900;
}

.item-checkbox svg {
  width: 12px;
  height: 12px;
  color: white;
}
</style>
