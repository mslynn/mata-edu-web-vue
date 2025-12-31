<template>
  <Teleport to="body">
    <!-- 删除确认弹窗 -->
    <Transition name="confirm-fade">
      <div v-if="showDeleteConfirm" class="confirm-overlay" @click.self="cancelDelete">
        <Transition name="confirm-scale" appear>
          <div v-if="showDeleteConfirm" class="confirm-container">
            <button class="confirm-close-btn" @click="cancelDelete">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 class="confirm-title">{{ $t('course.deleteChapterReminder') }}</h3>
            <p class="confirm-content" v-html="$t('course.deleteChapterContent')"></p>
            <div class="confirm-footer">
              <button class="confirm-btn-cancel" @click="cancelDelete">{{ $t('common.cancel') }}</button>
              <button class="confirm-btn-delete" @click="confirmDelete">{{ $t('common.delete') }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- 关闭确认弹窗 -->
    <Transition name="confirm-fade">
      <div v-if="showCloseConfirm" class="confirm-overlay" @click.self="cancelClose">
        <Transition name="confirm-scale" appear>
          <div v-if="showCloseConfirm" class="confirm-container">
            <button class="confirm-close-btn" @click="cancelClose">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 class="confirm-title">{{ $t('course.closeReminder') }}</h3>
            <p class="confirm-content">{{ $t('course.closeReminderContent') }}</p>
            <div class="confirm-footer">
              <button class="confirm-btn-cancel" @click="cancelClose">{{ $t('common.cancel') }}</button>
              <button class="confirm-btn-delete" @click="confirmClose">{{ $t('course.exit') }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="handleCancel">
        <Transition name="modal-scale" appear>
          <div v-if="modelValue" class="modal-container">
            <!-- 关闭按钮 -->
            <button class="close-btn" @click="handleCancel">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- 标题 -->
            <h2 class="modal-title">{{ isEditMode ? $t('course.editCourse') : $t('course.createCourse') }}</h2>

            <!-- 加载状态 -->
            <div v-if="detailLoading" class="loading-overlay">
              <div class="loading-spinner"></div>
              <span class="loading-text">{{ $t('common.loading') }}</span>
            </div>

            <!-- 内容区域 -->
            <div class="modal-content" :class="{ 'opacity-50 pointer-events-none': detailLoading }">
              <!-- 课程名称 -->
              <div class="form-row">
                <label class="form-label"><span class="required">*</span>{{ $t('course.courseName') }}：</label>
                <div class="form-input-wrapper">
                  <input
                    v-model="formData.name"
                    type="text"
                    :placeholder="$t('course.pleaseInputCourseName')"
                    maxlength="20"
                    class="form-input"
                    :class="{ 'input-error': errors.name }"
                    @input="clearError('name')"
                  />
                  <span class="char-count">{{ formData.name.length }} / 20</span>
                  <Transition name="error-fade">
                    <p v-if="errors.name" class="error-tip">{{ errors.name }}</p>
                  </Transition>
                </div>
              </div>

              <!-- 封面 -->
              <div class="form-row items-start">
                <label class="form-label mt-4">{{ $t('course.cover') }}：</label>
                <div class="cover-section">
                  <div class="cover-preview">
                    <img v-if="formData.coverUrl" :src="formData.coverUrl" :alt="$t('common.courseCover')" class="cover-img" />
                    <img v-else src="../assets/images/two.png" :alt="$t('common.courseCover')" class="cover-img" />
                  </div>
                  <div class="cover-info">
                    <button class="upload-btn" :disabled="uploading" @click="triggerUpload">
                      {{ uploading ? $t('course.uploading') : $t('course.changeCover') }}
                    </button>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg"
                      class="hidden"
                      @change="handleFileChange"
                    />
                    <p class="cover-tip">{{ $t('course.coverTip') }}</p>
                  </div>
                </div>
              </div>

              <!-- 课程章节 -->
              <div class="form-row items-start">
                <label class="form-label mt-3"><span class="required">*</span>{{ $t('course.courseChapter') }}：</label>
                <div class="form-input-wrapper">
                  <div class="chapters-wrapper" :class="{ 'wrapper-error': errors.chapters }">
                    <button class="add-chapter-btn" @click="addChapter">
                      <span class="plus">+</span>
                      <span>{{ $t('course.createChapter') }}</span>
                    </button>
                    <div class="chapters-list">
                      <div
                        v-for="(chapter, index) in visibleChapters"
                        :key="chapter.id"
                        class="chapter-item"
                        draggable="true"
                        @dragstart="handleDragStart($event, index)"
                        @dragover.prevent="handleDragOver($event, index)"
                        @drop="handleDrop($event, index)"
                        @dragend="handleDragEnd"
                        :class="{ 'dragging': dragIndex === index, 'drag-over': dragOverIndex === index && dragIndex !== index }"
                      >
                        <input
                          v-model="chapter.name"
                          type="text"
                          :placeholder="$t('course.pleaseInputChapterName')"
                          maxlength="20"
                          class="chapter-input"
                          @input="clearError('chapters')"
                        />
                        <span class="chapter-count">{{ chapter.name.length }} / 20</span>
                        <div v-if="index > 0" class="chapter-actions">
                          <span class="drag-handle">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                            </svg>
                          </span>
                          <button class="delete-chapter-btn" @click="removeChapter(index)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Transition name="error-fade">
                    <p v-if="errors.chapters" class="error-tip">{{ errors.chapters }}</p>
                  </Transition>
                </div>
              </div>

              <!-- 简介 -->
              <div class="form-row items-start">
                <label class="form-label mt-3">{{ $t('course.description') }}：</label>
                <div class="form-input-wrapper">
                  <textarea
                    v-model="formData.description"
                    :placeholder="$t('course.pleaseInputDesc')"
                    maxlength="100"
                    rows="4"
                    class="form-textarea"
                  ></textarea>
                  <span class="char-count textarea-count">{{ formData.description.length }} / 100</span>
                </div>
              </div>

              <!-- 课程权限 -->
              <div class="form-row">
                <label class="form-label">{{ $t('course.coursePermission') }}：</label>
                <div class="permission-section">
                  <label class="radio-label">
                    <input v-model="formData.permission" type="radio" value="private" class="radio-input" />
                    <span class="radio-circle"></span>
                    <span>{{ $t('course.privateOnly') }}</span>
                  </label>
                  <label class="radio-label">
                    <input v-model="formData.permission" type="radio" value="public" class="radio-input" />
                    <span class="radio-circle"></span>
                    <span>{{ $t('course.publicToSchool') }}</span>
                  </label>
                  <span class="permission-tip">{{ $t('course.permissionTip') }}<span class="highlight">{{ $t('course.privateOnly') }}</span>{{ $t('course.permissionTip2') }}</span>
                </div>
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="modal-footer">
              <button class="btn-cancel" @click="handleCancel">{{ $t('common.cancel') }}</button>
              <button class="btn-confirm" @click="handleConfirm">{{ isEditMode ? $t('course.saveChanges') : $t('course.completeCreate') }}</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { cursorAdmin } from '~/composables/api/curosr'

const { t } = useI18n()

interface CourseData {
  id?: number | string
  name: string
  description: string
  permission: string
  chapters: { id: number; name: string; chapterId?: number }[]
  coverUrl?: string
  hours?: number
}

interface Props {
  modelValue: boolean
  editData?: CourseData | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: typeof formData.value]
  cancel: []
}>()

const { uploadOSS, getCursorDetail } = cursorAdmin()

// 加载状态
const detailLoading = ref(false)

let chapterId = 1

// 上传相关
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

const formData = ref({
  name: '',
  description: '',
  permission: 'private',
  coverUrl: '',
  chapters: [{ id: chapterId++, name: '', delFlag: 0 }] as { id: number; name: string; chapterId?: number; delFlag: number }[],
})

// 触发文件选择
const triggerUpload = () => {
  fileInputRef.value?.click()
}

// 处理文件选择和上传
const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 校验文件类型
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']
  if (!allowedTypes.includes(file.type)) {
    alert('请上传 png、jpg、jpeg 格式的图片')
    return
  }

  // 校验文件大小（10M）
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过 10M')
    return
  }

  try {
    uploading.value = true
    // 上传文件获取 url
    const uploadRes = await uploadOSS(file)
    // 直接使用返回的 url
    formData.value.coverUrl = uploadRes.url
  } catch (error: any) {
    console.error('上传失败:', error)
    alert(error.message || '上传失败，请重试')
  } finally {
    uploading.value = false
    // 清空 input，允许重复选择同一文件
    target.value = ''
  }
}

// 错误信息
const errors = ref<{ name?: string; chapters?: string }>({})

const resetForm = () => {
  chapterId = 1
  formData.value = {
    name: '',
    description: '',
    permission: 'private',
    coverUrl: '',
    chapters: [{ id: chapterId++, name: '', delFlag: 0 }] as { id: number; name: string; chapterId?: number; delFlag: number }[],
  }
  errors.value = {}
}

// 是否编辑模式
const isEditMode = computed(() => !!props.editData)

// 可见的章节列表（过滤掉已删除的）
const visibleChapters = computed(() => {
  return formData.value.chapters.filter(c => c.delFlag !== 1)
})

// 加载课程详情
const loadCourseDetail = async (courseId: string | number) => {
  detailLoading.value = true
  try {
    const data = await getCursorDetail(String(courseId))
    if (data) {
      formData.value = {
        name: data.courseName || '',
        description: data.courseDesc || '',
        permission: data.coursePermission === 1 ? 'public' : 'private',
        coverUrl: data.courseCoverUrl || '',
        chapters: data.chapterList?.length
          ? data.chapterList.map((c: any) => ({ 
              id: chapterId++, 
              name: c.chapterName || '',
              chapterId: c.chapterId,
              delFlag: 0 // 默认未删除
            }))
          : [{ id: chapterId++, name: '', delFlag: 0 }],
      }
    }
  } catch (error) {
    console.error('获取课程详情失败:', error)
  } finally {
    detailLoading.value = false
  }
}

watch(() => props.modelValue, async (val) => {
  if (val && props.editData?.id) {
    // 编辑模式：调用接口获取详情
    await loadCourseDetail(props.editData.id)
  } else if (!val) {
    resetForm()
  }
})

const addChapter = () => {
  formData.value.chapters.push({ id: chapterId++, name: '', delFlag: 0 })
  clearError('chapters')
}

// 拖拽排序
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const handleDragStart = (e: DragEvent, index: number) => {
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

const handleDragOver = (e: DragEvent, index: number) => {
  e.preventDefault()
  dragOverIndex.value = index
}

const handleDrop = (e: DragEvent, index: number) => {
  e.preventDefault()
  if (dragIndex.value !== null && dragIndex.value !== index) {
    // 找到在原数组中的真实索引
    const draggedVisible = visibleChapters.value[dragIndex.value]
    const targetVisible = visibleChapters.value[index]
    const realDragIndex = formData.value.chapters.findIndex(c => c.id === draggedVisible?.id)
    const realTargetIndex = formData.value.chapters.findIndex(c => c.id === targetVisible?.id)
    
    if (realDragIndex !== -1 && realTargetIndex !== -1) {
      const chapters = formData.value.chapters
      const draggedItem = chapters[realDragIndex]
      if (draggedItem) {
        chapters.splice(realDragIndex, 1)
        // 如果目标位置在拖拽位置之后，需要调整索引
        const adjustedIndex = realTargetIndex > realDragIndex ? realTargetIndex : realTargetIndex
        chapters.splice(adjustedIndex, 0, draggedItem)
      }
    }
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  dragIndex.value = null
  dragOverIndex.value = null
}

// 删除确认弹窗
const showDeleteConfirm = ref(false)
const deleteIndex = ref<number | null>(null)

const removeChapter = (index: number) => {
  deleteIndex.value = index
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deleteIndex.value = null
}

const confirmDelete = () => {
  if (deleteIndex.value !== null && visibleChapters.value.length > 1) {
    // 找到在原数组中的真实索引
    const visibleChapter = visibleChapters.value[deleteIndex.value]
    const realIndex = formData.value.chapters.findIndex(c => c.id === visibleChapter?.id)
    
    if (realIndex !== -1) {
      const chapter = formData.value.chapters[realIndex]
      if (isEditMode.value && chapter?.chapterId) {
        // 编辑模式下，已有的章节标记为删除（delFlag: 1）
        chapter.delFlag = 1
      } else {
        // 新建模式或新增的章节，直接删除
        formData.value.chapters.splice(realIndex, 1)
      }
    }
  }
  showDeleteConfirm.value = false
  deleteIndex.value = null
}

// 清除错误
const clearError = (field: 'name' | 'chapters') => {
  errors.value[field] = undefined
}

// 表单校验
const validate = () => {
  errors.value = {}
  let isValid = true

  // 校验课程名称
  if (!formData.value.name.trim()) {
    errors.value.name = t('course.pleaseInputCourseName')
    isValid = false
  }

  // 校验章节
  const hasValidChapter = formData.value.chapters.some(c => c.name.trim())
  if (!hasValidChapter) {
    errors.value.chapters = t('course.atLeastOneChapter')
    isValid = false
  }

  return isValid
}

const handleConfirm = () => {
  if (!validate()) return
  
  emit('confirm', formData.value)
  emit('update:modelValue', false)
}

// 关闭确认弹窗
const showCloseConfirm = ref(false)

const handleCancel = () => {
  showCloseConfirm.value = true
}

const cancelClose = () => {
  showCloseConfirm.value = false
}

const confirmClose = () => {
  showCloseConfirm.value = false
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
/* 删除确认弹窗 */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.confirm-container {
  background: white;
  border-radius: 16px;
  width: 420px;
  padding: 32px;
  position: relative;
  text-align: center;
}

.confirm-close-btn {
  position: absolute;
  right: 16px;
  top: 16px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.confirm-close-btn:hover {
  color: #333;
}

.confirm-title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-bottom: 24px;
}

.confirm-content {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 32px;
}

.confirm-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.confirm-btn-cancel {
  min-width: 120px;
  padding: 12px 32px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn-cancel:hover {
  border-color: #FF9900;
  color: #FF9900;
}

.confirm-btn-delete {
  min-width: 120px;
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: white;
  background: #FF9900;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn-delete:hover {
  background: #E68A00;
}

/* 确认弹窗动画 */
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.25s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

.confirm-scale-enter-active {
  animation: confirm-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-scale-leave-active {
  animation: confirm-out 0.2s ease-in;
}

@keyframes confirm-in {
  0% {
    opacity: 0;
    transform: scale(0.85);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes confirm-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

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
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 800px;
  max-width: 90vw;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 32px 40px;
}

.close-btn {
  position: absolute;
  right: 20px;
  top: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  text-align: center;
  margin-bottom: 32px;
}

.modal-content {
  flex: 1;
}

.form-row {
  display: flex;
  margin-bottom: 24px;
}

.form-label {
  width: 90px;
  flex-shrink: 0;
  font-size: 14px;
  color: #333;
  line-height: 40px;
  text-align: right;
  padding-right: 12px;
  white-space: nowrap;
}

.required {
  color: #ff4d4f;
  margin-right: 4px;
}

.form-input-wrapper {
  flex: 1;
  position: relative;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 60px 0 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:hover,
.form-input:focus {
  border-color: #FF9900;
}

.form-input.input-error {
  border-color: #ff4d4f;
}

.form-input.input-error:focus {
  border-color: #ff4d4f;
}

.form-input::placeholder {
  color: #bbb;
}

.char-count {
  position: absolute;
  right: 16px;
  top: 20px;
  transform: translateY(-50%);
  font-size: 13px;
  color: #bbb;
}

.error-tip {
  position: absolute;
  left: 0;
  bottom: -20px;
  color: #ff4d4f;
  font-size: 12px;
  padding-left: 2px;
}

.wrapper-error {
  border-color: #ff4d4f !important;
}

/* 错误提示动画 */
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.2s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 封面 */
.cover-section {
  flex: 1;
  display: flex;
  gap: 20px;
}

.cover-preview {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(180deg, #e0f3ff 0%, #b3e0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
}

.upload-btn {
  padding: 8px 20px;
  border: 1px solid #FF9900;
  border-radius: 6px;
  font-size: 14px;
  color: #FF9900;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  width: fit-content;
}

.upload-btn:hover {
  background: #FFF7E6;
}

.cover-tip {
  font-size: 13px;
  color: #999;
  line-height: 1.6;
}

/* 章节 */
.chapters-wrapper {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  min-height: 200px;
  max-height: 200px;
  overflow-y: auto;
  transition: border-color 0.2s;
}

.chapters-wrapper:hover {
  border-color: #FF9900;
}

.add-chapter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: #FFF7E6;
  border: 1px solid #FFD591;
  border-radius: 6px;
  font-size: 14px;
  color: #FF9900;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.add-chapter-btn:hover {
  background: #FFE7BA;
}

.add-chapter-btn .plus {
  font-size: 16px;
  font-weight: 500;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  transition: all 0.2s;
}

.chapter-item.dragging {
  opacity: 0.5;
}

.chapter-item.drag-over {
  border-top: 2px solid #FF9900;
}

.chapter-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.chapter-item:hover .chapter-actions {
  opacity: 1;
}

.drag-handle {
  cursor: grab;
  color: #ccc;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: #999;
}

.drag-handle:active {
  cursor: grabbing;
}

.chapter-input {
  width: 280px;
  height: 36px;
  padding: 0 12px;
  border: none;
  border-bottom: 1px solid #e5e5e5;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  background: transparent;
}

.chapter-input:hover,
.chapter-input:focus {
  border-color: #FF9900;
}

.chapter-input::placeholder {
  color: #bbb;
}

.chapter-count {
  font-size: 13px;
  color: #bbb;
  flex-shrink: 0;
}

.delete-chapter-btn {
  color: #ccc;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
  flex-shrink: 0;
}

.delete-chapter-btn:hover {
  color: #ff4d4f;
}

/* 简介 */
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  resize: none;
  transition: border-color 0.2s;
  line-height: 1.6;
}

.form-textarea:hover,
.form-textarea:focus {
  border-color: #FF9900;
}

.form-textarea::placeholder {
  color: #bbb;
}

.textarea-count {
  top: auto;
  bottom: 12px;
  transform: none;
}

/* 权限 */
.permission-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  line-height: 40px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.radio-input {
  display: none;
}

.radio-circle {
  width: 16px;
  height: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s;
}

.radio-input:checked + .radio-circle {
  border-color: #FF9900;
}

.radio-input:checked + .radio-circle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #FF9900;
  border-radius: 50%;
}

.permission-tip {
  font-size: 13px;
  color: #999;
}

.permission-tip .highlight {
  color: #FF9900;
}

/* 底部按钮 */
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 32px;
}

.btn-cancel {
  min-width: 120px;
  padding: 10px 32px;
  border: 1px solid #FF9900;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #FFF7E6;
}

.btn-confirm {
  min-width: 120px;
  padding: 10px 32px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: white;
  background: #FF9900;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: #E68A00;
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FF9900;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  animation: modal-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  animation: modal-out 0.2s ease-in;
}

@keyframes modal-in {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* 章节列表动画 */
.chapter-list-enter-active {
  animation: chapter-in 0.25s ease-out;
}

.chapter-list-leave-active {
  animation: chapter-out 0.2s ease-in;
}

.chapter-list-move {
  transition: transform 0.25s ease;
}

@keyframes chapter-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes chapter-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateX(20px);
  }
}
</style>
