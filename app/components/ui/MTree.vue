<template>
  <div class="tree">
    <template v-for="node in data" :key="node[nodeKey]">
      <div class="tree-node group">
        <!-- 节点内容 -->
        <div 
          :class="[
            'flex items-center justify-between py-2 px-2 cursor-pointer rounded transition-colors',
            selectedKey === node[nodeKey] ? 'bg-[#4CB9CF]/10 text-[#4CB9CF]' : 'hover:bg-[#FFF3DD]'
          ]"
          :style="{ paddingLeft: `${level * 16 + 8}px` }"
          @click="handleNodeClick(node)"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <!-- 展开/折叠图标 -->
            <span 
              v-if="node[childrenKey] !== undefined"
              class="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
              @click.stop="toggleExpand(node)"
            >
              <svg 
                :class="['w-3 h-3 transition-transform', isExpanded(node) ? 'rotate-90' : '']" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span v-else class="w-4 flex-shrink-0"></span>
            
            <!-- 图标插槽 -->
            <slot name="icon" :node="node" :expanded="isExpanded(node)">
              <span v-if="node.icon" class="flex-shrink-0">{{ node.icon }}</span>
            </slot>
            
            <!-- 标签 -->
            <span class="truncate text-[18px] text-[#4D4D4D]">{{ node[labelKey] }}</span>
          </div>
          
          <!-- 操作按钮 -->
          <div class="flex items-center gap-1 flex-shrink-0" @click.stop>
            <slot name="actions" :node="node" />
          </div>
        </div>
        
        <!-- 子节点 -->
        <Transition name="tree-expand">
          <div v-if="node[childrenKey] !== undefined && isExpanded(node)">
            <!-- 有子节点 -->
            <MTree 
              v-if="node[childrenKey]?.length"
              :data="node[childrenKey]"
              :node-key="nodeKey"
              :label-key="labelKey"
              :children-key="childrenKey"
              :selected-key="selectedKey"
              :expanded-keys="expandedKeys"
              :level="level + 1"
              @select="handleChildSelect"
              @expand="handleChildExpand"
              @create-class="handleCreateClass"
            >
              <!-- 传递插槽给子树 -->
              <template #icon="slotProps">
                <slot name="icon" v-bind="slotProps" />
              </template>
              <template #actions="slotProps">
                <slot name="actions" v-bind="slotProps" />
              </template>
              <template #empty="slotProps">
                <slot name="empty" v-bind="slotProps" />
              </template>
            </MTree>
            <!-- 无子节点时显示空状态 -->
            <div v-else class="py-3 text-center" :style="{ paddingLeft: `${(level + 1) * 16 + 8}px` }">
              <slot name="empty" :node="node">
                <span class="text-gray-400 text-sm">暂无班级记录</span>
                <button 
                  class="ml-2 text-[#FF9900] text-sm hover:underline"
                  @click.stop="handleCreateClass(node)"
                >
                  创建班级
                </button>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface TreeNode {
  [key: string]: any
}

const props = withDefaults(defineProps<{
  data: TreeNode[]
  nodeKey?: string
  labelKey?: string
  childrenKey?: string
  selectedKey?: string | number | null
  expandedKeys?: (string | number)[]
  level?: number
}>(), {
  nodeKey: 'id',
  labelKey: 'label',
  childrenKey: 'children',
  selectedKey: null,
  expandedKeys: () => [],
  level: 0
})

const emit = defineEmits<{
  select: [node: TreeNode]
  expand: [key: string | number, expanded: boolean]
  createClass: [node: TreeNode]
}>()

const isExpanded = (node: TreeNode) => {
  return props.expandedKeys.includes(node[props.nodeKey])
}

const handleNodeClick = (node: TreeNode) => {
  emit('select', node)
}

const toggleExpand = (node: TreeNode) => {
  const key = node[props.nodeKey]
  emit('expand', key, !isExpanded(node))
}

// 子组件事件转发
const handleChildSelect = (node: TreeNode) => {
  emit('select', node)
}

const handleChildExpand = (key: string | number, expanded: boolean) => {
  emit('expand', key, expanded)
}

const handleCreateClass = (node: TreeNode) => {
  emit('createClass', node)
}
</script>

<style scoped>
.tree-expand-enter-active,
.tree-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

