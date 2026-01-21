<template>
  <Teleport to="body">
    <!-- 开课设置弹窗 -->
    <Transition name="modal-fade">
      <div v-if="visible && !showTip" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="handleClose">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 1L1 13M1 1L13 13" stroke="#999" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- 标题 -->
          <h2 class="modal-title">{{ t('teacher.startClassSettings') }}</h2>

          <!-- 班级选择下拉框 -->
          <div class="class-select-wrapper">
            <div class="class-select" @click="toggleClassDropdown">
              <svg class="class-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span class="select-text">{{ selectedClass?.className || t('teacher.pleaseSelectClass') }}</span>
              <svg class="arrow-icon" :class="{ expanded: showClassDropdown }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <div v-if="showClassDropdown" class="dropdown-menu">
              <div 
                v-for="cls in classList" 
                :key="cls.classId" 
                class="dropdown-item"
                :class="{ active: selectedClass?.classId === cls.classId }"
                @click="selectClass(cls)"
              >
                {{ cls.className }}
              </div>
            </div>
          </div>

          <!-- 课程和章节选择 -->
          <div class="selection-area">
            <!-- 左侧：课程树形列表 -->
            <div class="selection-column">
              <div class="column-header">{{ t('teacher.pleaseSelectCourse') }}</div>
              <div class="column-list">
                <!-- 渲染扁平化的树形结构 -->
                <template v-if="flattenedTree.length > 0">
                  <template v-for="item in flattenedTree" :key="item.key">
                    <!-- 分组标题 -->
                    <div 
                      v-if="item.type === 'menu'"
                      class="menu-header" 
                      :style="{ paddingLeft: (item.level * 16 + 16) + 'px' }"
                      @click="toggleMenu(item.key)"
                    >
                      <svg 
                        class="expand-icon" 
                        :class="{ expanded: expandedMenus.has(item.key) }" 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        stroke-width="2"
                      >
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                      <span class="menu-name">{{ item.name }}</span>
                    </div>
                    <!-- 课程项 -->
                    <div 
                      v-else-if="item.type === 'course' && item.course"
                      class="list-item course-item"
                      :class="{ active: selectedCourse?.courseId === item.course.courseId }"
                      :style="{ paddingLeft: (item.level * 16 + 16) + 'px' }"
                      @click="selectCourse(item.course)"
                    >
                      {{ item.course.courseName }}
                    </div>
                  </template>
                </template>
                <!-- 兼容旧的扁平列表 -->
                <template v-else-if="courseList.length > 0">
                  <div 
                    v-for="course in courseList" 
                    :key="course.courseId" 
                    class="list-item"
                    :class="{ active: selectedCourse?.courseId === course.courseId }"
                    @click="selectCourse(course)"
                  >
                    {{ course.courseName }}
                  </div>
                </template>
              </div>
            </div>

            <!-- 右侧：章节列表 -->
            <div class="selection-column">
              <div class="column-header">{{ t('teacher.pleaseSelectChapter') }}</div>
              <div class="column-list">
                <div 
                  v-for="chapter in chapterList" 
                  :key="chapter.chapterId" 
                  class="list-item"
                  :class="{ active: selectedChapter?.chapterId === chapter.chapterId }"
                  @click="selectChapter(chapter)"
                >
                  <span class="item-text">{{ chapter.chapterName }}</span>
                  <span v-if="chapter.isLastClass" class="last-class-tag">{{ t('teacher.lastClassTag') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="handleClose">{{ t('common.cancel') }}</button>
            <button class="btn-confirm" @click="handleConfirm">{{ t('common.confirm') }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 提示弹窗 -->
    <Transition name="modal-fade">
      <div v-if="showTip" class="modal-overlay">
        <div class="tip-container">
          <!-- 关闭按钮 -->
          <button class="close-btn" @click="handleTipClose">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 1L1 13M1 1L13 13" stroke="#999" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>

          <h2 class="tip-title">{{ t('common.tips') }}</h2>
          
          <!-- 插图 -->
          <div class="tip-image">
            <img src="~/assets/images/kecheng.png" alt="开始上课" />
          </div>

          <p class="tip-text">{{ t('teacher.classStartTip') }}</p>

          <button class="btn-tip-confirm" @click="handleTipConfirm">{{ t('common.confirm') }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface ClassItem {
  classId: string
  className: string
}

interface CourseItem {
  courseId: string
  courseName: string
}

interface MenuGroup {
  menuId: number | string | null
  menuName: string
  courseList?: CourseItem[]
  children?: MenuGroup[]
}

interface ChapterItem {
  chapterId: string
  chapterName: string
  isLastClass?: boolean
}

interface Props {
  visible: boolean
  classList?: ClassItem[]
  courseList?: CourseItem[]
  courseTree?: MenuGroup[]
  initialCourseId?: string
  initialChapterId?: string
}

const props = withDefaults(defineProps<Props>(), {
  classList: () => [],
  courseList: () => [],
  courseTree: () => []
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': [data: { classId: string; courseId: string; chapterId: string }]
  'course-change': [courseId: string, classId: string]
  'class-change': [classId: string]
}>()

const showClassDropdown = ref(false)
const showTip = ref(false)
const selectedClass = ref<ClassItem | null>(null)
const selectedCourse = ref<CourseItem | null>(null)
const selectedChapter = ref<ChapterItem | null>(null)
const chapterList = ref<ChapterItem[]>([])
const confirmData = ref<{ classId: string; courseId: string; chapterId: string } | null>(null)
const expandedMenus = ref<Set<string>>(new Set())

// 扁平化树形结构
const flattenedTree = computed(() => {
  const result: Array<{
    type: 'menu' | 'course'
    key: string
    name?: string
    course?: CourseItem
    level: number
    parentKey?: string
  }> = []

  const flatten = (nodes: MenuGroup[], level: number, parentKey?: string) => {
    nodes.forEach(node => {
      const menuKey = node.menuId ? String(node.menuId) : node.menuName
      
      // 添加菜单项
      result.push({
        type: 'menu',
        key: menuKey,
        name: node.menuName,
        level,
        parentKey
      })

      // 如果展开，添加子内容
      if (expandedMenus.value.has(menuKey)) {
        // 添加子菜单
        if (node.children && node.children.length > 0) {
          flatten(node.children, level + 1, menuKey)
        }
        
        // 添加课程
        if (node.courseList && node.courseList.length > 0) {
          node.courseList.forEach(course => {
            result.push({
              type: 'course',
              key: `course-${course.courseId}`,
              course,
              level: level + 1,
              parentKey: menuKey
            })
          })
        }
      }
    })
  }

  if (props.courseTree.length > 0) {
    flatten(props.courseTree, 0)
  }

  return result
})

const toggleClassDropdown = () => {
  showClassDropdown.value = !showClassDropdown.value
}

const toggleMenu = (menuKey: string) => {
  if (expandedMenus.value.has(menuKey)) {
    expandedMenus.value.delete(menuKey)
  } else {
    expandedMenus.value.add(menuKey)
  }
}

const selectClass = (cls: ClassItem) => {
  selectedClass.value = cls
  showClassDropdown.value = false
  selectedCourse.value = null
  selectedChapter.value = null
  chapterList.value = []
  emit('class-change', cls.classId)
}

const selectCourse = (course: CourseItem) => {
  selectedCourse.value = course
  selectedChapter.value = null
  if (selectedClass.value) {
    emit('course-change', course.courseId, selectedClass.value.classId)
  }
}

const selectChapter = (chapter: ChapterItem) => {
  selectedChapter.value = chapter
}

const handleClose = () => {
  emit('update:visible', false)
  showClassDropdown.value = false
  showTip.value = false
}

const handleConfirm = () => {
  if (!selectedClass.value || !selectedCourse.value || !selectedChapter.value) {
    return
  }
  confirmData.value = {
    classId: selectedClass.value.classId,
    courseId: selectedCourse.value.courseId,
    chapterId: selectedChapter.value.chapterId
  }
  showTip.value = true
}

const handleTipClose = () => {
  showTip.value = false
  handleClose()
}

const handleTipConfirm = () => {
  if (confirmData.value) {
    emit('confirm', confirmData.value)
  }
  showTip.value = false
  handleClose()
}

const setChapterList = (list: ChapterItem[]) => {
  chapterList.value = list
}

// 监听弹窗显示
watch(() => props.visible, (val) => {
  if (!val) {
    selectedClass.value = null
    selectedCourse.value = null
    selectedChapter.value = null
    chapterList.value = []
    expandedMenus.value.clear()
  } else {
    // 弹窗打开时，递归展开所有分组
    expandedMenus.value.clear()
    const expandAllMenus = (menus: MenuGroup[]) => {
      menus.forEach(menu => {
        const key = menu.menuId ? String(menu.menuId) : menu.menuName
        expandedMenus.value.add(key)
        if (menu.children && menu.children.length > 0) {
          expandAllMenus(menu.children)
        }
      })
    }
    if (props.courseTree.length > 0) {
      expandAllMenus(props.courseTree)
    }
  }
})

// 监听班级列表变化，默认选中第一个
watch(() => props.classList, (list) => {
  if (props.visible && list.length > 0 && !selectedClass.value) {
    selectedClass.value = list[0] || null
    if (selectedCourse.value && list[0]) {
      emit('course-change', selectedCourse.value.courseId, list[0].classId)
    }
  }
}, { immediate: true })

// 监听课程列表变化，默认选中第一个并加载章节
watch(() => props.courseList, (list) => {
  if (props.visible && list.length > 0 && !selectedCourse.value) {
    const course = props.initialCourseId 
      ? list.find(c => c.courseId === props.initialCourseId) || list[0]
      : list[0]
    if (course) {
      selectedCourse.value = course
      if (selectedClass.value) {
        emit('course-change', course.courseId, selectedClass.value.classId)
      }
    }
  }
}, { immediate: true })

// 监听章节列表变化，默认选中第一个
watch(chapterList, (list) => {
  if (props.visible && list.length > 0 && !selectedChapter.value) {
    selectedChapter.value = list[0] || null
  }
})

defineExpose({ setChapterList })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  position: relative;
  width: 580px;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 24px 28px 28px;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover svg path {
  stroke: #666;
}

.modal-title {
  text-align: center;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
}

/* 班级选择 */
.class-select-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.class-select {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #FFFFFF;
  border: 1px dashed #D9D9D9;
  border-radius: 6px;
  cursor: pointer;
}

.class-select:hover {
  border-color: #BFBFBF;
}

.select-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.arrow-icon {
  transition: transform 0.2s;
}

.arrow-icon.expanded {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-item {
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #F5F5F5;
}

.dropdown-item.active {
  color: #FF9900;
  background: #FFF7E6;
}

/* 选择区域 */
.selection-area {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  height: 300px;
}

.selection-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.column-header {
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  background: #FAFAFA;
  border-radius: 6px 6px 0 0;
}

.column-list {
  flex: 1;
  overflow-y: auto;
  background: #FAFAFA;
  border-radius: 0 0 6px 6px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.list-item:hover {
  background: #F0F0F0;
}

.list-item.active {
  color: #FF9900;
}

/* 树形菜单样式 */
.menu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  background: #FAFAFA;
}

.menu-header:hover {
  background: #F5F5F5;
}

.expand-icon {
  transition: transform 0.2s;
  color: #999;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.menu-name {
  flex: 1;
}

.course-item {
  background: #FFFFFF;
}

.item-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-class-tag {
  flex-shrink: 0;
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 12px;
  color: #52C41A;
  border: 1px solid #52C41A;
  border-radius: 3px;
}

/* 底部按钮 */
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cancel,
.btn-confirm {
  min-width: 100px;
  height: 40px;
  padding: 0 28px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #FFFFFF;
  border: 1px dashed #D9D9D9;
  color: #666;
}

.btn-cancel:hover {
  border-color: #FF9900;
  color: #FF9900;
}

.btn-confirm {
  background: #FF9900;
  border: none;
  color: white;
}

.btn-confirm:hover {
  background: #E68A00;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 提示弹窗 */
.tip-container {
  position: relative;
  width: 420px;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 28px 32px 32px;
  text-align: center;
}

.tip-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.tip-image {
  width: 240px;
  height: 180px;
  margin: 0 auto 24px;
}

.tip-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tip-text {
  font-size: 15px;
  color: #666;
  margin-bottom: 28px;
}

.btn-tip-confirm {
  min-width: 140px;
  height: 44px;
  padding: 0 40px;
  background: #FF9900;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-tip-confirm:hover {
  background: #E68A00;
}
</style>
