<template>
  <div class="menu-tree-item">
    <!-- 菜单标题 -->
    <div
      class="flex items-center gap-2 px-2 py-2 cursor-pointer rounded transition-colors"
      :class="menuTitleClass"
      :style="{ paddingLeft: `${level * 16 + 8}px` }"
      @click="handleToggle"
    >
      <!-- 展开箭头（有子节点或课程时显示） -->
      <svg
        v-if="hasChildren"
        class="w-4 h-4 transition-transform flex-shrink-0"
        :class="[menuArrowClass, { 'rotate-90': isExpanded }]"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span v-else class="w-4"></span>
      <span class="text-sm truncate" :class="menuTextClass">
        {{ node.menuName }}
      </span>
    </div>

    <!-- 展开内容 -->
    <div v-if="isExpanded">
      <!-- 子菜单（递归） -->
      <MenuTreeItem
        v-for="child in node.children"
        :key="String(child.menuId || child.menuName)"
        :node="child"
        :level="level + 1"
        :expanded-menus="expandedMenus"
        :selected-course-id="selectedCourseId"
        :variant="variant"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
      />

      <!-- 课程列表 -->
      <div
        v-for="course in node.courseList"
        :key="course.courseId"
        class="flex items-center px-2 py-2 text-sm cursor-pointer rounded transition-colors"
        :style="{ paddingLeft: `${(level + 1) * 16 + 24}px` }"
        :class="getCourseClass(course.courseId)"
        @click="$emit('select', course)"
      >
        <span class="truncate">{{ course.courseName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MenuNode {
  menuId: string | number | null
  menuName: string
  courseList?: { courseId: string; courseName: string }[]
  children?: MenuNode[]
}

const props = defineProps<{
  node: MenuNode
  level: number
  expandedMenus: Set<string>
  selectedCourseId?: string
  variant?: 'default' | 'teacher2'
}>()

const emit = defineEmits<{
  toggle: [menuKey: string]
  select: [course: { courseId: string; courseName: string }]
}>()

const menuKey = computed(() => String(props.node.menuId ?? props.node.menuName))

const isExpanded = computed(() => props.expandedMenus.has(menuKey.value))

const hasChildren = computed(() => 
  (props.node.children && props.node.children.length > 0) || 
  (props.node.courseList && props.node.courseList.length > 0)
)

const isTeacher2Variant = computed(() => props.variant === 'teacher2')

const menuTitleClass = computed(() => {
  if (isTeacher2Variant.value) {
    return 'hover:bg-[#EEF4FF]'
  }

  return 'hover:bg-gray-50'
})

const menuArrowClass = computed(() => {
  if (isTeacher2Variant.value) {
    return 'text-[#AEB3B5]'
  }

  return 'text-gray-400'
})

const menuTextClass = computed(() => {
  if (isTeacher2Variant.value) {
    return props.level === 0
      ? 'text-[#2E3335] font-semibold'
      : 'text-[#5A6062]'
  }

  return props.level === 0 ? 'text-gray-700 font-medium' : 'text-gray-600'
})

const getCourseClass = (courseId: string) => {
  if (isTeacher2Variant.value) {
    return props.selectedCourseId === courseId
      ? 'bg-[#EEF4FF] text-[#005BC2] font-semibold'
      : 'text-[#5A6062] hover:bg-[#F4F8FF]'
  }

  return props.selectedCourseId === courseId
    ? 'bg-[#FFF1DD] text-[#FF9900]'
    : 'text-gray-600 hover:bg-gray-50'
}

const handleToggle = () => {
  emit('toggle', menuKey.value)
}
</script>
