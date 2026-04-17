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
      <div v-if="modelValue" class="create-course-overlay" @click.self="handleCancel">
        <Transition name="modal-scale" appear>
          <div v-if="modelValue" class="create-course-modal" :class="{ 'create-course-modal--en': isEnglish }">
            <!-- 关闭按钮 -->
            <button class="create-course-close-btn" @click="handleCancel">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- 标题 -->
            <h2 class="create-course-title">{{ isEditMode ? $t('course.editCourse') : $t('course.createCourse') }}</h2>

            <!-- 加载状态 -->
            <div v-if="detailLoading" class="create-course-loading-overlay">
              <div class="create-course-loading-spinner"></div>
              <span class="create-course-loading-text">{{ $t('common.loading') }}</span>
            </div>

            <!-- 内容区域 -->
            <div class="create-course-content" :class="{ 'opacity-50 pointer-events-none': detailLoading }">
              <!-- 课程名称 -->
              <div class="form-row">
                <label class="create-course-form-label"><span class="required">*</span>{{ $t('course.courseName') }}：</label>
                <div class="form-input-wrapper">
                  <input v-model="formData.name" type="text" :placeholder="$t('course.pleaseInputCourseName')"
                    maxlength="20" class="create-course-input" :class="{ 'input-error': errors.name }"
                    @input="clearError('name')" />
                  <span class="char-count">{{ formData.name.length }} / 20</span>
                  <Transition name="error-fade">
                    <p v-if="errors.name" class="error-tip">{{ errors.name }}</p>
                  </Transition>
                </div>
              </div>

              <!-- 封面 -->
              <div class="form-row items-start">
                <label class="create-course-form-label mt-4">{{ $t('common.courseCover') }}：</label>
                <div class="cover-section">
                  <div class="cover-preview">
                    <img v-if="formData.coverUrl" :src="formData.coverUrl" :alt="$t('common.courseCover')"
                      class="cover-img" />
                    <p v-else class="cover-img" />
                  </div>
                  <div class="cover-info">
                    <button class="upload-btn" :disabled="uploading" @click="triggerUpload">
                      {{ uploading ? $t('course.uploading') : $t('course.changeCover') }}
                    </button>
                    <input ref="fileInputRef" type="file" accept="image/png,image/jpg,image/jpeg" class="hidden"
                      @change="handleFileChange" />
                    <p class="cover-tip">{{ $t('course.coverTip') }}</p>
                  </div>
                </div>
              </div>

              <!-- 课程章节 -->
              <div class="form-row items-start">
                <label class="create-course-form-label mt-3"><span class="required">*</span>{{ $t('course.courseChapter') }}：</label>
                <div class="form-input-wrapper">
                  <div class="chapters-wrapper" :class="{ 'wrapper-error': errors.chapters }">
                    <div class="chapters-header">
                      <button class="add-chapter-btn" @click="addChapter">
                        <span class="plus">+</span>
                        <span>{{ $t('course.createChapter') }}</span>
                      </button>
                    </div>
                    <div class="chapters-list">
                      <div v-for="(chapter, index) in visibleChapters" :key="chapter.id" class="create-course-chapter-item"
                        draggable="true" @dragstart="handleDragStart($event, index)"
                        @dragover.prevent="handleDragOver($event, index)" @drop="handleDrop($event, index)"
                        @dragend="handleDragEnd"
                        :class="{ 'dragging': dragIndex === index, 'drag-over': dragOverIndex === index && dragIndex !== index }">
                        <input v-model="chapter.name" type="text" :placeholder="$t('course.pleaseInputChapterName')"
                          maxlength="20" class="chapter-input" @input="clearError('chapters')" />
                        <span class="chapter-count">{{ chapter.name.length }} / 20</span>
                        <div v-if="index > 0" class="create-course-chapter-actions">
                          <span class="drag-handle">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 8h16M4 16h16" />
                            </svg>
                          </span>
                          <button class="delete-chapter-btn" @click="removeChapter(index)">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
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
                <label class="create-course-form-label mt-3">{{ $t('course.description') }}：</label>
                <div class="form-input-wrapper">
                  <textarea v-model="formData.description" :placeholder="$t('course.pleaseInputDesc')" maxlength="500"
                    rows="4" class="form-textarea"></textarea>
                  <span class="char-count textarea-count">{{ formData.description.length }} / 500</span>
                </div>
              </div>

              <!-- 课程权限 -->
              <div class="form-row">
                <label class="create-course-form-label">{{ $t('course.coursePermission') }}：</label>
                <div class="permission-section">
                  <div class="permission-radios">
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
                  </div>
                  <span class="permission-tip">{{ $t('course.permissionTip') }}<span class="highlight">{{
                    $t('course.privateOnly') }}</span>{{ $t('course.permissionTip2') }}</span>
                </div>
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="create-course-footer">
              <button class="create-course-btn-cancel" @click="handleCancel">{{ $t('common.cancel') }}</button>
              <button class="create-course-btn-confirm" @click="handleConfirm">{{ isEditMode ? $t('course.saveChanges') :
                $t('course.completeCreate') }}</button>
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

const { t, locale } = useI18n()

// 是否英文环境
const isEnglish = computed(() => locale.value === 'en')

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
.confirm-overlay,
.create-course-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(12, 15, 16, 0.42);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.confirm-overlay {
  z-index: 1100;
}

.create-course-overlay {
  z-index: 1000;
}

.confirm-container,
.create-course-modal {
  position: relative;
  background: #ffffff;
  border: 1px solid rgba(222, 227, 229, 0.96);
  box-shadow: 0 18px 48px rgba(46, 51, 53, 0.12);
}

.confirm-container {
  width: min(440px, calc(100vw - 48px));
  padding: 30px 28px 26px;
  border-radius: 20px;
  text-align: center;
}

.confirm-close-btn,
.create-course-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #8d9496;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-close-btn:hover,
.create-course-close-btn:hover {
  border-color: rgba(0, 91, 194, 0.18);
  background: #f8fbff;
  color: #005bc2;
}

.confirm-title {
  margin: 0 0 16px;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.confirm-content {
  margin: 0 0 24px;
  color: #5a6062;
  font-size: 14px;
  line-height: 1.8;
}

.confirm-footer {
  display: grid;
  grid-template-columns: repeat(2, 112px);
  justify-content: center;
  gap: 14px;
}

.confirm-btn-cancel,
.confirm-btn-delete,
.create-course-btn-cancel,
.create-course-btn-confirm,
.upload-btn,
.add-chapter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  appearance: none;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn-cancel,
.confirm-btn-delete {
  width: 112px;
  min-width: 112px;
  height: 40px;
  padding: 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
}

.confirm-btn-cancel {
  border: 1px solid rgba(174, 179, 181, 0.3);
  background: #ffffff;
  color: #5a6062;
}

.confirm-btn-cancel:hover {
  border-color: rgba(0, 91, 194, 0.18);
  background: #f8fbff;
  color: #005bc2;
}

.confirm-btn-delete,
.create-course-btn-confirm,
.upload-btn,
.add-chapter-btn {
  background: #005bc2;
  color: #ffffff;
  box-shadow: none;
}

.confirm-btn-delete:hover {
  background: #004fa8;
}

.create-course-btn-cancel {
  min-width: 120px;
  min-height: 42px;
  padding: 0 22px;
  border: 1px solid rgba(0, 91, 194, 0.18);
  border-radius: 12px;
  background: #ffffff;
  color: #005bc2;
  font-size: 14px;
  font-weight: 700;
}

.create-course-btn-cancel:hover {
  border-color: rgba(0, 91, 194, 0.28);
  background: rgba(0, 91, 194, 0.05);
}

.create-course-btn-confirm,
.upload-btn,
.add-chapter-btn {
  min-height: 42px;
  padding: 0 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
}

.create-course-btn-confirm:hover,
.upload-btn:hover,
.add-chapter-btn:hover {
  transform: none;
  background: #004fa8;
  box-shadow: none;
}

.create-course-modal {
  width: 660px;
  max-width: min(92vw, 660px);
  height: auto;
  max-height: calc(100vh - 56px);
  padding: 26px 30px 24px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  font-family: "Manrope", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif;
}

.create-course-modal--en {
  width: 760px;
  max-width: min(94vw, 760px);
}

.create-course-modal--en .create-course-form-label {
  width: 140px;
}

.create-course-title {
  margin: 0 0 22px;
  color: #2e3335;
  font-family: "Plus Jakarta Sans", "PingFang SC", sans-serif;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.15;
  text-align: center;
}

.create-course-content {
  flex: none;
  overflow: visible;
  padding-right: 0;
}

.form-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.create-course-form-label {
  width: 88px;
  flex-shrink: 0;
  padding-top: 10px;
  color: #2e3335;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  text-align: right;
  white-space: nowrap;
}

.required {
  margin-right: 4px;
  color: #e5484d;
}

.form-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 0;
}

.create-course-input,
.form-textarea {
  width: 100%;
  border: 1px solid rgba(174, 179, 181, 0.26);
  background: #ffffff;
  color: #2e3335;
  box-shadow: none;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.create-course-input {
  min-height: 40px;
  padding: 0 74px 0 16px;
  border-radius: 12px;
  font-size: 14px;
}

.create-course-input:hover,
.create-course-input:focus,
.form-textarea:hover,
.form-textarea:focus,
.chapters-wrapper:hover {
  border-color: rgba(0, 91, 194, 0.28);
}

.create-course-input:focus,
.form-textarea:focus {
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.08);
}

.create-course-input.input-error,
.create-course-input.input-error:focus,
.wrapper-error {
  border-color: #e5484d !important;
  box-shadow: 0 0 0 3px rgba(229, 72, 77, 0.08);
}

.create-course-input::placeholder,
.chapter-input::placeholder,
.form-textarea::placeholder {
  color: #aeb3b5;
}

.char-count {
  position: absolute;
  top: 20px;
  right: 16px;
  transform: translateY(-50%);
  color: #aeb3b5;
  font-size: 12px;
  font-weight: 600;
}

.error-tip {
  margin-top: 6px;
  padding-left: 2px;
  color: #e5484d;
  font-size: 12px;
  line-height: 1.4;
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.2s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.cover-section {
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 16px;
}

.cover-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 92px;
  height: 116px;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px dashed rgba(0, 91, 194, 0.2);
  border-radius: 16px;
  background: #f8fbff;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

p.cover-img {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(0, 91, 194, 0.08);
}

p.cover-img::before,
p.cover-img::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  background: #005bc2;
  border-radius: 999px;
  transform: translate(-50%, -50%);
}

p.cover-img::before {
  width: 16px;
  height: 2px;
}

p.cover-img::after {
  width: 2px;
  height: 16px;
}

.cover-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding-top: 2px;
}

.upload-btn {
  width: fit-content;
}

.upload-btn:disabled {
  transform: none;
  background: #aeb3b5;
  box-shadow: none;
  cursor: not-allowed;
}

.cover-tip,
.permission-tip {
  color: #8d9496;
  font-size: 12px;
  line-height: 1.7;
}

.chapters-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 170px;
  max-height: 170px;
  padding: 16px;
  border: 1px solid rgba(174, 179, 181, 0.2);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.chapters-header {
  flex-shrink: 0;
  margin-bottom: 12px;
}

.add-chapter-btn {
  gap: 6px;
  padding: 0 16px;
}

.add-chapter-btn .plus {
  font-size: 18px;
  line-height: 1;
}

.chapters-list {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
  overflow-x: hidden;
  overflow-y: auto;
}

.chapters-list::-webkit-scrollbar {
  width: 6px;
}

.chapters-list::-webkit-scrollbar-track {
  background: transparent;
}

.chapters-list::-webkit-scrollbar-thumb {
  background: rgba(174, 179, 181, 0.36);
  border-radius: 999px;
}

.create-course-chapter-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(174, 179, 181, 0.16);
  border-radius: 12px;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
}

.create-course-chapter-item:hover {
  border-color: rgba(0, 91, 194, 0.18);
  box-shadow: none;
}

.create-course-chapter-item.dragging {
  opacity: 0.55;
}

.create-course-chapter-item.drag-over {
  border-color: rgba(0, 91, 194, 0.32);
  box-shadow: 0 0 0 2px rgba(0, 91, 194, 0.08);
}

.create-course-chapter-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.create-course-chapter-item:hover .create-course-chapter-actions {
  opacity: 1;
}

.drag-handle,
.delete-chapter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #aeb3b5;
  transition: all 0.2s ease;
}

.drag-handle {
  cursor: grab;
}

.drag-handle:hover {
  background: #f4f8ff;
  color: #005bc2;
}

.drag-handle:active {
  cursor: grabbing;
}

.delete-chapter-btn:hover {
  background: rgba(229, 72, 77, 0.08);
  color: #e5484d;
}

.chapter-input {
  flex: 1;
  width: auto;
  min-width: 0;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  color: #2e3335;
  font-size: 14px;
  font-weight: 600;
  outline: none;
}

.chapter-count {
  flex-shrink: 0;
  color: #aeb3b5;
  font-size: 12px;
  font-weight: 600;
}

.form-textarea {
  min-height: 88px;
  padding: 12px 16px 34px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  resize: none;
}

.textarea-count {
  top: auto;
  bottom: 12px;
  transform: none;
}

.permission-section {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
}

.permission-radios {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2e3335;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.radio-input {
  display: none;
}

.radio-circle {
  position: relative;
  width: 16px;
  height: 16px;
  border: 1.5px solid rgba(174, 179, 181, 0.9);
  border-radius: 50%;
  background: #ffffff;
  transition: all 0.2s ease;
}

.radio-input:checked + .radio-circle {
  border-color: #005bc2;
  box-shadow: 0 0 0 3px rgba(0, 91, 194, 0.08);
}

.radio-input:checked + .radio-circle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #005bc2;
  transform: translate(-50%, -50%);
}

.permission-tip .highlight {
  color: #005bc2;
  font-weight: 700;
}

.create-course-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(174, 179, 181, 0.14);
}

.create-course-btn-confirm {
  min-width: 136px;
}

.create-course-loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border: 1px solid rgba(174, 179, 181, 0.18);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 28px rgba(46, 51, 53, 0.12);
  backdrop-filter: blur(10px);
  transform: translate(-50%, -50%);
}

.create-course-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(174, 179, 181, 0.24);
  border-top-color: #005bc2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.create-course-loading-text {
  color: #5a6062;
  font-size: 14px;
  font-weight: 600;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.confirm-fade-enter-active,
.confirm-fade-leave-active,
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to,
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.confirm-scale-enter-active {
  animation: confirm-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-scale-leave-active {
  animation: confirm-out 0.2s ease-in;
}

.modal-scale-enter-active {
  animation: modal-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  animation: modal-out 0.2s ease-in;
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

@media (max-width: 760px) {
  .create-course-overlay,
  .confirm-overlay {
    padding: 16px;
  }

  .create-course-modal {
    width: 100%;
    max-width: none;
    height: auto;
    max-height: calc(100vh - 32px);
    padding: 22px 18px 20px;
    border-radius: 24px;
  }

  .form-row {
    flex-direction: column;
    gap: 10px;
  }

  .create-course-form-label,
  .create-course-modal--en .create-course-form-label {
    width: auto;
    padding-top: 0;
    text-align: left;
  }

  .cover-section {
    flex-direction: column;
  }

  .create-course-footer,
  .confirm-footer {
    grid-template-columns: 1fr;
  }

  .confirm-btn-cancel,
  .confirm-btn-delete,
  .create-course-btn-cancel,
  .create-course-btn-confirm {
    width: 100%;
  }
}

@media (max-height: 860px) and (min-width: 761px) {
  .create-course-overlay,
  .confirm-overlay {
    padding: 14px;
  }

  .create-course-modal {
    max-height: calc(100vh - 28px);
    padding: 20px 26px 18px;
  }

  .create-course-title {
    margin-bottom: 14px;
    font-size: 18px;
  }

  .form-row {
    margin-bottom: 12px;
  }

  .create-course-form-label {
    padding-top: 8px;
    font-size: 13px;
  }

  .create-course-input {
    min-height: 38px;
  }

  .char-count {
    top: 19px;
    font-size: 11px;
  }

  .error-tip {
    margin-top: 4px;
    font-size: 11px;
  }

  .cover-preview {
    width: 82px;
    height: 102px;
    border-radius: 14px;
  }

  .cover-info {
    gap: 8px;
  }

  .cover-tip,
  .permission-tip {
    font-size: 11px;
    line-height: 1.5;
  }

  .upload-btn,
  .add-chapter-btn,
  .create-course-btn-cancel,
  .create-course-btn-confirm {
    min-height: 38px;
    font-size: 13px;
  }

  .chapters-wrapper {
    min-height: 138px;
    max-height: 138px;
    padding: 12px;
  }

  .chapters-header {
    margin-bottom: 10px;
  }

  .chapters-list {
    gap: 8px;
  }

  .create-course-chapter-item {
    min-height: 38px;
    padding: 0 10px;
  }

  .chapter-input {
    height: 36px;
    font-size: 13px;
  }

  .chapter-count {
    font-size: 11px;
  }

  .form-textarea {
    min-height: 72px;
    padding: 10px 14px 28px;
  }

  .textarea-count {
    bottom: 10px;
    font-size: 11px;
  }

  .permission-section {
    gap: 6px;
  }

  .permission-radios {
    gap: 20px;
  }

  .radio-label {
    font-size: 13px;
  }

  .create-course-footer {
    margin-top: 14px;
    padding-top: 14px;
  }
}
</style>
