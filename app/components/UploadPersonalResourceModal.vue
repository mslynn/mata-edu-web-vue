<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <span class="modal-title">{{ $t('prepare.addPersonalResource') }}</span>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <p class="upload-tip">{{ $t('prepare.uploadOrLinkTip') }}</p>
        
        <button class="upload-btn" @click="showUploadDialog = true">
          <span>{{ $t('prepare.clickToUpload') }}</span>
        </button>
        
        <div class="warning-box">
          <div class="warning-header">
            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ $t('prepare.warmTip') }}</span>
            <div class="tooltip-wrapper">
              <a href="javascript:;" class="link">{{ $t('prepare.viewUploadRequirements') }}</a>
              <div class="tooltip-content">
                <p>1、文件大小&lt;=20MB</p>
                <p>jpg、jpeg、png、gif</p>
                <p>xip、ucd、ucdx、ipynb、py、upy、usim</p>
                <p>2、文件大小&lt;=100MB</p>
                <p>doc、docx、xls、xlsx</p>
                <p>3、文件大小&lt;=200MB</p>
                <p>mp4、mov、ppt、pptx、pdf</p>
                <p>其他文件大小不超过200M,其他格式</p>
                <p>文件在平台前端需要下载查看</p>
              </div>
            </div>
          </div>
          <p class="warning-text">{{ $t('prepare.uploadWarningText') }}</p>
        </div>
        
        <!-- 文件列表表格 - 始终显示表头 -->
        <div class="file-table">
          <div class="table-header">
            <div class="col-index">{{ $t('common.serialNumber') }}</div>
            <div class="col-name">{{ $t('prepare.fileName') }}</div>
            <div class="col-progress">{{ $t('prepare.uploadProgress') }}</div>
            <div class="col-type">{{ $t('prepare.resourceTypeCol') }}</div>
            <div class="col-action">{{ $t('common.operation') }}</div>
          </div>
          
          <!-- 表格内容区域 - 固定高度 -->
          <div class="table-content">
            <template v-if="uploadFiles.length > 0 || resourceList.length > 0">
              <div v-for="(item, index) in uploadFiles" :key="`upload-${item.id}`" class="table-row">
                <div class="col-index">{{ index + 1 }}</div>
                <div class="col-name" :title="item.name">{{ item.name }}</div>
                <div class="col-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :class="{
                        'progress-fill--error': item.status === 'error',
                        'progress-fill--canceling': item.status === 'cancelling',
                      }"
                      :style="{ width: `${item.progress}%` }"
                    ></div>
                  </div>
                  <span
                    class="progress-text"
                    :class="{
                      complete: item.status === 'success',
                      error: item.status === 'error',
                      pending: item.status === 'pending' || item.status === 'cancelling',
                    }"
                  >
                    {{ getUploadProgressText(item) }}
                  </span>
                </div>
                <div class="col-type">
                  <span class="type-text">{{ item.fileTypeName || '-' }}</span>
                </div>
                <div class="col-action">
                  <button
                    v-if="item.status === 'uploading'"
                    class="action-btn cancel-upload-btn"
                    @click="cancelUpload(item)"
                  >
                    取消上传
                  </button>
                  <span v-else-if="item.status === 'cancelling'" class="action-status-text">取消中...</span>
                  <button
                    v-else-if="item.status === 'error'"
                    class="action-btn delete-btn"
                    @click="removeUploadFileById(item.id)"
                  >
                    {{ $t('common.delete') }}
                  </button>
                  <span v-else class="action-status-text">处理中...</span>
                </div>
              </div>

              <div v-for="(item, index) in resourceList" :key="`resource-${item.resourceId}`" class="table-row">
                <div class="col-index">{{ uploadFiles.length + index + 1 }}</div>
                <div class="col-name" :title="item.fileName">{{ item.fileName }}</div>
                <div class="col-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 100%"></div>
                  </div>
                  <span class="progress-text complete">100%</span>
                </div>
                <div class="col-type">
                  <span class="type-text">{{ item.fileTypeName || '-' }}</span>
                </div>
                <div class="col-action">
                  <button class="action-btn delete-btn" @click="deleteResource(item)">{{ $t('common.delete') }}</button>
                  <button class="action-btn config-btn" @click="configEvaluation(item)">{{ getConfigEvaluationLabel(item) }}</button>
                </div>
              </div>
            </template>
            
            <!-- 无数据时显示空状态 -->
            <div v-else class="table-empty">
              <div class="empty-icon">
                <svg viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="50" fill="#FFF8F0"/>
                  <rect x="30" y="35" width="60" height="50" rx="6" fill="white" stroke="#FFB84D" stroke-width="2"/>
                  <circle cx="45" cy="50" r="4" fill="#FFB84D"/>
                  <circle cx="55" cy="50" r="4" fill="#FFB84D"/>
                  <circle cx="65" cy="50" r="4" fill="#FFB84D"/>
                  <rect x="38" y="60" width="44" height="4" rx="2" fill="#FFD699"/>
                  <rect x="38" y="68" width="30" height="4" rx="2" fill="#FFD699"/>
                  <circle cx="95" cy="75" r="18" fill="#FFF8F0" stroke="#FFB84D" stroke-width="2"/>
                  <text x="95" y="80" text-anchor="middle" font-size="20" fill="#FFB84D">?</text>
                </svg>
              </div>
              <p class="empty-text">{{ $t('common.noData') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传文件弹窗 -->
    <div v-if="showUploadDialog" class="upload-dialog-overlay" @click.self="closeUploadDialog">
      <div class="upload-dialog">
        <div class="upload-dialog-header">
          <span>{{ $t('prepare.uploadLocalResource') }}</span>
          <button class="close-btn" @click="closeUploadDialog">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="upload-dialog-body">
          <!-- mc 文件需要选择资源类型 -->
          <div v-if="pendingMcFiles.length > 0" class="form-item">
            <label>{{ $t('prepare.resourceType') }} <span class="required">*</span></label>
            <MSelect
              v-model="selectedResourceType"
              :options="resourceTypeList"
              value-key="dictValue"
              label-key="dictLabel"
              placeholder="$t('prepare.pleaseSelectType')"
            />
            <p class="mc-tip">{{ $t('prepare.mcFileTip') }}</p>
            <div class="mc-file-list">
              <span v-for="file in pendingMcFiles" :key="file.name" class="mc-file-tag">{{ file.name }}</span>
            </div>
            <div class="dialog-footer">
              <button class="cancel-btn" @click="closeUploadDialog">{{ $t('common.cancel') }}</button>
              <button class="confirm-btn" @click="confirmMcUpload" :disabled="!selectedResourceType">{{ $t('prepare.confirmUpload') }}</button>
            </div>
          </div>
          <!-- 非 mc 文件直接选择上传 -->
          <div v-else class="form-item">
            <label>{{ $t('prepare.selectFile') }}</label>
            <button class="select-file-btn" @click="triggerFileInput">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{{ $t('prepare.selectFile') }}</span>
            </button>
            <input 
              ref="fileInputRef" 
              type="file" 
              multiple 
              accept=".doc,.docx,.ppt,.pptx,.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.ucd,.mc"
              style="display: none" 
              @change="handleFileSelect"
            />
          </div>
        </div>
      </div>
    </div>

    <LiteracyConfigModal
      :visible="literacyModalVisible"
      :exercise-id="currentConfigRow?.resourceId"
      source-type="resource"
      :resource-title="currentConfigRow?.fileName"
      :initial-config-data="currentConfigRow?.evalConfigData ?? currentConfigRow"
      :has-literacy="Number(currentConfigRow?.updateStatus) === 1"
      @close="literacyModalVisible = false"
      @config="handleLiteracyConfigConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import LiteracyConfigModal from '~/components/taskmanagement/LiteracyConfigModal.vue'
import { cursorAdmin } from '~/composables/api/curosr'
import { useChunkUpload } from '~/composables/useChunkUpload'

interface UploadFile {
  id: number
  name: string
  file: File
  progress: number
  resourceType: string
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelling'
  ossId?: string
  url?: string
  fileType?: string
  fileTypeName?: string
  errorMessage?: string
  cancelRequested?: boolean
  cancelUploadTask?: () => Promise<boolean>
  cleanupTask?: () => void
}

interface DictItem {
  dictValue: string
  dictLabel: string
}

const props = defineProps<{
  visible: boolean
  chapterId: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'uploaded', files: UploadFile[]): void
}>()

const {
  createChapterResource,
  getResourceeDict,
  getChapterResourceListPage,
  deleteChapterResource,
  saveLiteracyConfig,
  getResourceeDictEvalconfig
} = cursorAdmin()
const { t } = useI18n()

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadFiles = ref<UploadFile[]>([])
const showUploadDialog = ref(false)
const selectedResourceType = ref('')
const resourceTypeList = ref<DictItem[]>([])
const pendingMcFiles = ref<File[]>([])
const literacyModalVisible = ref(false)
const currentConfigRow = ref<ResourceItem | null>(null)

// 资源列表
interface ResourceItem {
  resourceId: number
  fileName: string
  fileType?: string
  fileTypeName?: string
  updateStatus?: number | string | null
  evalConfigData?: any
}
const resourceList = ref<ResourceItem[]>([])

// 加载资源列表
const loadResourceList = async () => {
  if (!props.chapterId) return
  try {
    const data = await getChapterResourceListPage({
      chapterId: props.chapterId,
      resourceType: 3, // 个人资源
      page: 1,
      pageSize: 100
    })
    console.log(data,'个人资源列表')
    resourceList.value = data || []
  } catch (error) {
    console.error('加载资源列表失败:', error)
  }
}

// 删除资源
const deleteResource = async (item: ResourceItem) => {
  try {
    await deleteChapterResource(String(item.resourceId))
    // 刷新列表
    await loadResourceList()
    // 通知父组件
    emit('uploaded', [])
  } catch (error) {
    console.error('删除资源失败:', error)
  }
}

// 取消上传


const getConfigEvaluationLabel = (item: ResourceItem) => {
  return Number(item.updateStatus) === 1
    ? t('prepare.editEvaluation')
    : t('prepare.configEvaluation')
}

// 配置素养评价
const configEvaluation = async (item: ResourceItem) => {
  try {
    let configData: any = item
    if (Number(item.updateStatus) === 1 && item.resourceId) {
      const result = await getResourceeDictEvalconfig(item.resourceId, 2)
      configData = {
        ...item,
        evalConfigData: result
      }
    }

    currentConfigRow.value = configData
    literacyModalVisible.value = true
  } catch (error) {
    console.error('加载资源素养评价配置失败:', error)
    ElMessage.error('加载资源素养评价配置失败')
  }
}

const handleLiteracyConfigConfirm = async (data: {
  configList: Array<{
    questionId: string | number
    quotaIds: Array<string | number>
  }>
}) => {
  if (!currentConfigRow.value?.resourceId) {
    ElMessage.warning('当前资源缺少 resourceId')
    return
  }

  try {
    await saveLiteracyConfig({
      objectType: 2,
      configList: data.configList.map((item) => ({
        objectId: item.questionId,
        quotaIds: item.quotaIds || []
      }))
    })
    literacyModalVisible.value = false
    ElMessage.success(t('common.editSuccess'))
    await loadResourceList()
    emit('uploaded', [])
  } catch (error) {
    console.error('保存素养评价配置失败:', error)
    ElMessage.error('保存素养评价配置失败')
  }
}

// 加载资源类型字典
const loadResourceTypeDict = async () => {
  try {
    const data = await getResourceeDict()
    resourceTypeList.value = data || []
    if (resourceTypeList.value.length > 0 && resourceTypeList.value[0]) {
      selectedResourceType.value = resourceTypeList.value[0].dictValue
    }
  } catch (error) {
    console.error('加载资源类型字典失败:', error)
  }
}

// 关闭上传弹窗
const closeUploadDialog = () => {
  showUploadDialog.value = false
  pendingMcFiles.value = []
}

// 监听弹窗打开，加载数据
watch(() => props.visible, (val) => {
  if (val) {
    loadResourceList()
  }
})

onMounted(() => {
  loadResourceTypeDict()
  if (props.visible) {
    loadResourceList()
  }
})
onBeforeUnmount(() => {
  uploadFiles.value.forEach((file) => {
    file.cleanupTask?.()
  })
})
let fileIdCounter = 0

const handleClose = () => {
  if (uploadFiles.value.some((item) => item.status === 'uploading' || item.status === 'cancelling')) {
    ElMessage.warning('文件上传中，请先取消上传')
    return
  }
  emit('update:visible', false)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 判断是否是 mc 文件
const isMcFile = (fileName: string) => {
  return fileName.toLowerCase().endsWith('.mc')
}

// 文件大小限制 200MB
const MAX_FILE_SIZE = 200 * 1024 * 1024

const clearUploadTask = (uploadFile: UploadFile) => {
  uploadFile.cleanupTask?.()
  uploadFile.cleanupTask = undefined
  uploadFile.cancelUploadTask = undefined
}

const removeUploadFileById = (id: number) => {
  const index = uploadFiles.value.findIndex((item) => item.id === id)
  if (index === -1) return

  clearUploadTask(uploadFiles.value[index])
  uploadFiles.value.splice(index, 1)
}

const getUploadProgressText = (uploadFile: UploadFile) => {
  if (uploadFile.status === 'error') {
    return '上传失败'
  }
  if (uploadFile.status === 'cancelling') {
    return '取消中'
  }
  return `${uploadFile.progress}%`
}

const createChunkUploader = (uploadFile: UploadFile) => {
  const uploader = useChunkUpload({
    chunkSize: 5 * 1024 * 1024,
    defaultErrorMessage: '资源分片上传失败，请重试'
  })

  const stopProgressWatch = watch(
    uploader.progressPercent,
    (value) => {
      uploadFile.progress = value
    },
    { immediate: true }
  )

  const stopErrorWatch = watch(
    uploader.errorMessage,
    (value) => {
      uploadFile.errorMessage = value || ''
    },
    { immediate: true }
  )

  const stopStatusWatch = watch(
    uploader.status,
    (value) => {
      if (value === 'uploading' && uploadFile.status !== 'cancelling') {
        uploadFile.status = 'uploading'
        return
      }
      if (value === 'success') {
        uploadFile.status = 'success'
        return
      }
      if (value === 'error') {
        uploadFile.status = 'error'
      }
    },
    { immediate: true }
  )

  uploadFile.cancelUploadTask = () => uploader.cancel()
  uploadFile.cleanupTask = () => {
    stopProgressWatch()
    stopErrorWatch()
    stopStatusWatch()
    uploader.reset()
  }

  return uploader
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  
  const files = Array.from(input.files)
  
  // 检查文件大小
  const oversizedFiles = files.filter(f => f.size > MAX_FILE_SIZE)
  if (oversizedFiles.length > 0) {
    ElMessage.warning(`文件大小不能超过200MB，以下文件超出限制：${oversizedFiles.map(f => f.name).join('、')}`)
    // 过滤掉超出大小的文件
    const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE)
    if (validFiles.length === 0) {
      input.value = ''
      return
    }
  }
  
  const validFiles = files.filter(f => f.size <= MAX_FILE_SIZE)
  const mcFiles = validFiles.filter(f => isMcFile(f.name))
  const otherFiles = validFiles.filter(f => !isMcFile(f.name))
  
  // 非 mc 文件直接上传
  otherFiles.forEach(file => {
    const uploadFile = reactive<UploadFile>({
      id: ++fileIdCounter,
      name: file.name,
      file: file,
      progress: 0,
      resourceType: '',
      status: 'pending'
    })
    uploadFiles.value.push(uploadFile)
    doUpload(uploadFile)
  })
  
  // mc 文件需要选择类型
  if (mcFiles.length > 0) {
    pendingMcFiles.value = mcFiles
  } else {
    // 没有 mc 文件，关闭弹窗
    showUploadDialog.value = false
  }
  
  // 清空 input 以便重复选择同一文件
  input.value = ''
}

// 确认上传 mc 文件
const confirmMcUpload = () => {
  if (!selectedResourceType.value) return
  
  // 获取选中的资源类型名称
  const selectedItem = resourceTypeList.value.find(d => d.dictValue === selectedResourceType.value)
  const fileTypeName = selectedItem?.dictLabel || ''
  
  pendingMcFiles.value.forEach(file => {
    const uploadFile = reactive<UploadFile>({
      id: ++fileIdCounter,
      name: file.name,
      file: file,
      progress: 0,
      resourceType: selectedResourceType.value,
      status: 'pending',
      fileType: selectedResourceType.value,
      fileTypeName: fileTypeName
    })
    uploadFiles.value.push(uploadFile)
    doUpload(uploadFile)
  })
  
  // 清空并关闭
  pendingMcFiles.value = []
  showUploadDialog.value = false
}

// 分片上传文件并在成功后创建章节资源
const doUpload = async (uploadFile: UploadFile) => {
  uploadFile.status = 'uploading'
  uploadFile.progress = 0
  uploadFile.errorMessage = ''
  uploadFile.cancelRequested = false
  const uploader = createChunkUploader(uploadFile)
  
  try {
    // 1. 分片上传到 OSS（带真实进度）
    const result = await uploader.start(uploadFile.file)
    if (!result) {
      if (uploadFile.cancelRequested) {
        removeUploadFileById(uploadFile.id)
      } else {
        clearUploadTask(uploadFile)
      }
      return
    }
    
    uploadFile.status = 'success'
    uploadFile.progress = 100
    uploadFile.ossId = result.ossId
    uploadFile.url = result.url
    
    // 2. 调用 createChapterResource 创建章节资源
    if (props.chapterId && result.ossId) {
      const params: any = {
        chapterId: props.chapterId,
        resourceType: 3, // 个人资源
        ossId: result.ossId,
        fileName: uploadFile.name
      }
      // mc 文件需要传 fileType 和 fileTypeName
      if (uploadFile.fileType) {
        params.fileType = uploadFile.fileType
        params.fileTypeName = uploadFile.fileTypeName
      }
      await createChapterResource(params)
      // 刷新资源列表
      await loadResourceList()
      // 通知父组件刷新资源列表
      emit('uploaded', [uploadFile])
      removeUploadFileById(uploadFile.id)
    }
  } catch (error) {
    uploadFile.status = 'error'
    uploadFile.errorMessage = error instanceof Error ? error.message : '上传失败'
    clearUploadTask(uploadFile)
    console.error('上传失败:', error)
  }
}

const cancelUpload = async (uploadFile: UploadFile) => {
  if (!uploadFile.cancelUploadTask || uploadFile.status !== 'uploading') return

  uploadFile.status = 'cancelling'
  uploadFile.cancelRequested = true

  try {
    const cancelled = await uploadFile.cancelUploadTask()
    if (!cancelled) {
      uploadFile.status = 'uploading'
      uploadFile.cancelRequested = false
      return
    }

    ElMessage.success('取消上传成功')
  } catch (error: any) {
    uploadFile.status = 'uploading'
    uploadFile.cancelRequested = false
    ElMessage.error(error?.message || '取消上传失败')
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
  overflow-y: auto;
  flex: 1;
}

.upload-tip {
  font-size: 14px;
  color: #333;
  margin: 0 0 16px 0;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: white;
  border: 1px solid #FF9900;
  border-radius: 4px;
  color: #FF9900;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #fff8f0;
}

.warning-box {
  margin-top: 16px;
  margin-bottom: 16px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.warning-icon {
  width: 14px;
  height: 14px;
  color: #faad14;
}

.warning-header span {
  font-size: 13px;
  color: #333;
}

.link {
  font-size: 13px;
  color: #FF9900;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* 悬浮提示框 */
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  display: none;
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 8px;
  background: rgba(50, 50, 50, 0.95);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.tooltip-content p {
  margin: 0;
}

.tooltip-wrapper:hover .tooltip-content {
  display: block;
}

.warning-text {
  font-size: 12px;
  color: #999;
  margin: 0;
  line-height: 1.6;
}

.file-table {
  border-top: 1px solid #f0f0f0;
  width: 100%;
}

.table-header {
  display: flex;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
  width: 100%;
}

.table-header > div,
.table-row > div {
  padding: 14px 8px;
  display: flex;
  align-items: center;
}

.col-index { width: 60px; flex-shrink: 0; justify-content: center; }
.col-name { flex: 1; min-width: 0; }
.col-progress { width: 140px; flex-shrink: 0; gap: 8px; }
.col-type { width: 100px; flex-shrink: 0; justify-content: center; }
.col-action { width: 280px; justify-content: center; gap: 6px; flex-wrap: nowrap; flex-shrink: 0; }

.table-content {
  height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
  color: #333;
  width: 100%;
}

.table-row:last-child {
  border-bottom: none;
}

.col-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-fill--error {
  background: linear-gradient(90deg, #ff7875, #ff4d4f);
}

.progress-fill--canceling {
  background: linear-gradient(90deg, #faad14, #ffcc66);
}

.progress-text {
  font-size: 12px;
  color: #999;
  min-width: 45px;
  text-align: right;
}

.progress-text.complete {
  color: #52c41a;
}

.progress-text.error {
  color: #ff4d4f;
}

.progress-text.pending {
  color: #fa8c16;
}

.type-text {
  font-size: 13px;
  color: #333;
}

.type-select {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  background: white;
  cursor: pointer;
}

.type-select:focus {
  outline: none;
  border-color: #FF9900;
}

/* 操作按钮通用样式 */
.action-btn {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.delete-btn {
  background: white;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}

.delete-btn:hover {
  background: #fff1f0;
}

.cancel-upload-btn {
  background: white;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
}

.cancel-upload-btn:hover {
  background: #fff1f0;
}

.config-btn {
  background: white;
  border: 1px solid #FF9900;
  color: #FF9900;
}

.config-btn:hover {
  background: #fff7e6;
}

.action-status-text {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.progress-complete {
  color: #999;
  font-size: 13px;
}

/* 空状态 */
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 上传文件弹窗 */
.upload-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.upload-dialog {
  background: white;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.upload-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.upload-dialog-body {
  padding: 24px 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.form-item .type-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
}

.form-item .type-select:focus {
  outline: none;
  border-color: #FF9900;
}

.select-file-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #FF9900;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.select-file-btn:hover {
  background: #e68a00;
}

.select-file-btn svg {
  width: 18px;
  height: 18px;
}

/* MC 文件上传相关样式 */
.required {
  color: #ff4d4f;
}

.mc-tip {
  font-size: 12px;
  color: #999;
  margin: 8px 0 12px 0;
}

.mc-file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.mc-file-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.cancel-btn {
  padding: 8px 20px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  border-color: #FF9900;
  color: #FF9900;
}

.confirm-btn {
  padding: 8px 20px;
  background: #FF9900;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover {
  background: #e68a00;
}

.confirm-btn:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style>
