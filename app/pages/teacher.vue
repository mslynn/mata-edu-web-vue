<template>
  <div class="teacher-page">
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧主内容 -->
      <section class="left-section">
        <!-- 顶部三个授课卡片 -->
        <div class="top-cards">
          <!-- 备课 -->
          <div class="action-card" @click="goToLessons">
            <img src="~/assets/images/one.png" :alt="$t('teacher.prepare')" class="card-icon" />
            <span class="card-label">{{ $t('teacher.prepare') }}</span>
          </div>

          <!-- 授课 -->
          <div class="action-card" @click="handleGoToClass">
            <img src="~/assets/images/two.png" :alt="$t('teacher.teach')" class="card-icon" />
            <span class="card-label">{{ $t('teacher.teach') }}</span>
          </div>

          <!-- 作业 -->
          <div class="action-card">
            <img src="~/assets/images/three.png" :alt="$t('teacher.homework')" class="card-icon" />
            <span class="card-label">{{ $t('teacher.homework') }}</span>
          </div>
        </div>

        <!-- 下方内容区 -->
        <div class="bottom-section">
          <!-- 左侧：授课记录 -->
          <div class="lesson-record">
            <!-- 有授课记录时显示 -->
            <template v-if="teachList.length > 0">
              <div class="section-header">
                <span class="section-title">{{ $t('teacher.teachingRecord') }}</span>
                <MSelect 
                  v-model="selectedClassId" 
                  :options="classOptions" 
                  value-key="value" 
                  label-key="label"
                  :placeholder="$t('teacher.selectClass')"
                  class="class-select"
                />
              </div>
              
              <MSelect 
                v-model="selectedCourseId" 
                :options="courseOptions" 
                value-key="value" 
                label-key="label"
                :placeholder="$t('teacher.selectCourse')"
                class="course-select"
              />
              
              <div class="lesson-card" @click="goToCourse">
                <img 
                  v-if="selectedCourse?.courseCoverUrl" 
                  :src="selectedCourse.courseCoverUrl" 
                  :alt="$t('common.courseCover')" 
                  class="lesson-cover"
                />
                <div v-else class="lesson-cover lesson-cover-placeholder"></div>
              </div>
            </template>
            <!-- 无授课记录时显示 -->
            <template v-else>
              <div class="section-header">
                <span class="section-title">{{ $t('teacher.teachingRecord') }}</span>
              </div>
              <div class="empty-record">{{ $t('teacher.noTeachingRecord') }}</div>
            </template>
          </div>
          
          <!-- 中间：章节列表 -->
          <div class="chapter-section">
            <div class="section-header">
              <div class="login-btn-wrapper" @mouseenter="showLoginPopover = true" @mouseleave="showLoginPopover = false">
                <MButton size="medium" class="quick-login-btn" @click="handleQuickLoginBtnClick">
                  {{ quickLoginCode ? $t('teacher.viewLoginStatus') : $t('teacher.studentQuickLogin') }}
                </MButton>
                <!-- 气泡弹窗 -->
                <div v-show="showLoginPopover" class="login-popover">
                  <div class="popover-arrow"></div>
                  <div class="popover-content">
                    <!-- 未开启快捷登录时显示提示 -->
                    <template v-if="!quickLoginCode">
                      <div class="popover-tip">{{ $t('teacher.quickLoginTip') }}</div>
                    </template>
                    <!-- 已开启快捷登录时显示详情 -->
                    <template v-else>
                      <div class="popover-title">{{ selectedClassName }}</div>
                      <div class="popover-expire">（{{ $t('teacher.validFor2Hours') }}{{ quickLoginExpire }}{{ $t('teacher.expire') }}）</div>
                      <div class="popover-info-card">
                        <div class="popover-info-text">
                          <div>{{ $t('teacher.classCode') }}{{ quickLoginCode }}</div>
                          <div>{{ $t('teacher.unifiedPassword') }}{{ quickLoginPwd }}</div>
                        </div>
                        <button class="copy-btn" @click="copyCode">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          {{ $t('common.copy') }}
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
            <div class="chapter-grid-wrapper">
              <div class="chapter-grid">
                <div 
                  v-for="chapter in chapterList" 
                  :key="chapter.chapterId" 
                  class="chapter-item"
                  :class="{ 'is-selected': selectedChapterId === chapter.chapterId }"
                  @click="selectedChapterId = chapter.chapterId"
                >
                  <div class="chapter-card">
                    <span 
                      class="status-tag"
                      :class="{
                        'status-ended': getChapterStatus(chapter) === 0,
                        'status-not-started': getChapterStatus(chapter) === 1,
                        'status-last': getChapterStatus(chapter) === 2,
                        'status-ongoing': getChapterStatus(chapter) === 3
                      }"
                    >
                      {{ getChapterStatusText(chapter) }}
                    </span>
                    <span class="chapter-name" v-html="formatChapterName(chapter.chapterName)"></span>
                    <div class="chapter-actions">
                      <button class="action-btn teach-btn" @click.stop="goToTeach(chapter)">
                        {{ chapter.teachStatus === 1 ? $t('teacher.backToClassroom') : (chapter.teachStatus === 2 ? $t('teacher.classAgain') : $t('teacher.goToClass')) }}
                      </button>
                      <button v-if="chapter.teachStatus !== 1" class="action-btn prepare-btn" @click.stop="goToPrepare(chapter)">
                        {{ chapter.teachStatus === 2 ? $t('teacher.continuePrepare') : $t('teacher.goToPrepare') }}
                      </button>
                    </div>
                  </div>
                </div>
                <div v-if="chapterList.length === 0" class="empty-chapter">{{ $t('teacher.noChapter') }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧边栏 -->
      <aside class="right-sidebar">
        <!-- 玛塔工具中心 -->
        <div class="sidebar-card">
          <div class="sidebar-header">
            <span class="sidebar-title">{{ $t('teacher.mataToolCenter') }}</span>
            <img src="~/assets/images/diandian.png" alt="more" class="more-icon" @click="goToToolCenter" />
          </div>
          <div class="tool-list">
            <div class="tool-item" @click="handleOpenTool('vincibot')">
              <div class="tool-icon">
                <img src="../assets/images/tool1.png" alt="VinciBot" />
              </div>
              <span class="tool-name">VinciBot</span>
            </div>
            
            <div class="tool-item" @click="handleOpenTool('nous')">
              <div class="tool-icon">
                <img src="../assets/images/tool2.png" alt="Nous" />
              </div>
              <span class="tool-name">Nous</span>
            </div>
               <div class="tool-item">
              <div class="tool-icon">
                <img src="../assets/images/tool3.png" alt="Nous" />
              </div>
              <span class="tool-name">MatataCode</span>
            </div>
          </div>
        </div>

        <!-- AI实践中心 -->
        <div class="sidebar-card">
          <div class="sidebar-header">
            <span class="sidebar-title">{{ $t('teacher.aiPracticeCenter') }}</span>
            <img src="~/assets/images/diandian.png" alt="more" class="more-icon" />
          </div>
          <div class="tool-list">
            <div class="tool-item" @click="handleOpenAIModal('imageClassModel')">
              <div class="tool-icon">
                <img src="~/assets/images/1.svg" alt="图像分类" />
              </div>
              <span class="tool-name">{{ $t('ai.imageClassModel') }}</span>
            </div>
            <div class="tool-item" @click="handleOpenAIModal('gestureClassModel')">
              <div class="tool-icon">
                <img src="~/assets/images/2.svg" alt="手势分类" />
              </div>
              <span class="tool-name">{{ $t('ai.gestureClassModel') }}</span>
            </div>
            <div class="tool-item" @click="handleOpenAIModal('voiceClassModel')">
              <div class="tool-icon">
                <img src="~/assets/images/3.svg" alt="语音分类" />
              </div>
              <span class="tool-name">{{ $t('ai.voiceClassModel') }}</span>
            </div>
            <div class="tool-item" @click="handleOpenAIModal('poseClassModel')">
              <div class="tool-icon">
                <img src="~/assets/images/4.svg" alt="姿态分类" />
              </div>
              <span class="tool-name">{{ $t('ai.poseClassModel') }}</span>
            </div>
          </div>
        </div>

        <!-- AI 项目名称输入弹窗 -->
        <div v-if="showAIModal" class="modal-overlay" @click.self="showAIModal = false">
          <div class="modal-content">
            <div class="modal-header">
              <span class="modal-title">{{ $t('ai.createProject') }}</span>
              <button class="close-btn" @click="showAIModal = false">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-item">
                <span class="form-label">{{ $t('ai.modelName') }}</span>
                <input 
                  v-model="aiModelName" 
                  type="text" 
                  class="form-input" 
                  :placeholder="$t('ai.inputModelName')"
                  @keyup.enter="handleAIConfirm"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-cancel" @click="showAIModal = false">{{ $t('common.cancel') }}</button>
              <button class="btn-confirm" @click="handleAIConfirm">{{ $t('common.confirm') }}</button>
            </div>
          </div>
        </div>

        <!-- 信息栏 -->
        <div class="info-section">
          <div class="sidebar-title mb-3">{{ $t('teacher.infoBar') }}</div>
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">{{ $t('teacher.classCount') }}</div>
              <div class="info-value">8</div>
            </div>
            <div class="info-card">
              <div class="info-label">{{ $t('teacher.submittedWorks') }}</div>
              <div class="info-value">1208</div>
            </div>
            <div class="info-card">
              <div class="info-label">{{ $t('teacher.teachingHours') }}</div>
              <div class="info-value">50</div>
            </div>
            <div class="info-card">
              <div class="info-label">{{ $t('teacher.studentCount') }}</div>
              <div class="info-value">80</div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 开课设置弹窗 -->
    <StartClassModal 
      v-model:visible="showStartClassModal"
      :class-list="startClassData.classList"
      :course-list="startClassData.courseList"
      :course-tree="startClassData.courseTree"
      :initial-course-id="startClassData.initialCourseId"
      :initial-chapter-id="startClassData.initialChapterId"
      ref="startClassModalRef"
      @class-change="handleClassChange"
      @course-change="handleCourseChange"
      @confirm="handleStartClassConfirm"
    />

    <!-- 快捷登录弹窗 -->
    <MModal
      v-model="showQuickLoginModal"
      :title="$t('teacher.quickLoginModal')"
      size="medium"
      :show-footer="false"
    >
      <div class="quick-login-modal">
        <div class="modal-tip">{{ $t('teacher.selectClassTip') }}</div>
        
        <div v-if="quickLoginLoading" class="loading-state">{{ $t('common.loading') }}</div>
        
        <div v-else class="class-list">
          <div 
            v-for="item in quickLoginClassList" 
            :key="item.classId"
            class="class-item"
            :class="{ 'is-selected': selectedQuickLoginClassId === item.classId }"
            @click="selectedQuickLoginClassId = item.classId"
          >
            <span class="class-name">{{ item.className }}</span>
            <svg v-if="selectedQuickLoginClassId === item.classId" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div v-if="quickLoginClassList.length === 0" class="empty-state">{{ $t('teacher.noClass') }}</div>
        </div>
        
        <div class="modal-actions">
          <MButton @click="showQuickLoginModal = false">{{ $t('common.cancel') }}</MButton>
          <MButton 
            class="confirm-btn"
            :disabled="!selectedQuickLoginClassId"
            @click="handleQuickLoginConfirm"
          >
            {{ $t('common.create') }}
          </MButton>
        </div>
      </div>
    </MModal>

    <!-- 快捷登录结果弹窗 -->
    <MModal
      v-model="showQuickLoginResultModal"
      title=""
      size="medium"
      :show-footer="false"
      :show-close="true"
    >
      <div class="quick-login-result">
        <div class="result-title">{{ $t('teacher.quickLoginMethod') }}</div>
        <div class="result-class-name">{{ quickLoginResultData.className }}</div>
        <div class="result-expire">（{{ $t('teacher.validFor2Hours') }}{{ quickLoginResultData.expirationDate }}{{ $t('teacher.expire') }}）</div>
        
        <div class="result-info-card">
          <div class="info-row">
            <span>{{ $t('teacher.classCode') }}{{ quickLoginResultData.classCode }}</span>
          </div>
          <div class="info-row">
            <span>{{ $t('teacher.unifiedPassword') }}{{ quickLoginResultData.classCodePwd }}</span>
          </div>
          <button class="copy-btn-inline" @click="copyQuickLoginInfo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {{ $t('common.copy') }}
          </button>
        </div>
        
        <div class="result-actions">
          <MButton class="view-login-btn" @click="goToClassPage">
            {{ $t('teacher.viewLoginStatus') }}
          </MButton>
        </div>
      </div>
    </MModal>

    <!-- 工具 iframe 弹窗 -->
    <div v-if="showToolIframeModal" class="iframe-modal-overlay" @click.self="closeToolIframeModal">
      <div class="iframe-modal-container">
        <div class="iframe-modal-header">
          <span class="iframe-modal-title">{{ currentToolName }}</span>
          <button class="iframe-close-btn" @click="closeToolIframeModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="iframe-modal-body">
          <div v-if="toolIframeLoading" class="iframe-loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">{{ $t('common.loading') }}</span>
          </div>
          <iframe 
            :src="currentToolUrl" 
            class="tool-iframe" 
            :class="{ hidden: toolIframeLoading }"
            frameborder="0" 
            allowfullscreen
            @load="onToolIframeLoad"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useTeacher } from '~/composables/api/useTeacher'
import { useI18n } from 'vue-i18n'

const { t: $t, locale } = useI18n()
const router = useRouter()

definePageMeta({
  layout: 'sidebar'
})

const { getClassListNoPage, getCourseMenuTree, getTeachChapterList, beginClass, getTeachList } = useTeacher()

const goToLessons = () => {
  router.push('/lessons')
}

// 点击课程封面跳转到课程详情
const goToCourse = () => {
  if (selectedCourseId.value) {
    navigateTo(`/system/course/${selectedCourseId.value}`)
  }
}

// 复制班级码
const copyCode = () => {
  const text = `${$t('teacher.classCode')}${quickLoginCode.value}\n${$t('teacher.unifiedPassword')}${quickLoginPwd.value}`
  navigator.clipboard.writeText(text)
  alert($t('teacher.copied'))
}

// 加载快捷登录信息
const { getQuickLoginInfo } = useTeacher()
const loadQuickLoginInfo = async () => {
  try {
    const data = await getQuickLoginInfo()
    if (data) {
      quickLoginCode.value = data.classCode || ''
      quickLoginPwd.value = data.classCodePwd || ''
      quickLoginExpire.value = data.expirationDate || ''
    }
  } catch (error) {
    console.error('加载快捷登录信息失败:', error)
  }
}

// 授课记录数据
interface CourseItem {
  courseId: string
  courseName: string
  courseCoverUrl: string
}

interface TeachItem {
  classId: string
  className: string
  gradeName: string
  courseList: CourseItem[]
}

const teachList = ref<TeachItem[]>([])
const selectedClassId = ref<string | null>(null)
const selectedCourseId = ref<string | null>(null)
const selectedChapterId = ref<string | null>(null)

// 快捷登录相关
const showLoginPopover = ref(false)
const quickLoginCode = ref('')
const quickLoginPwd = ref('')
const quickLoginExpire = ref('')

// 工具 iframe 弹窗相关
const showToolIframeModal = ref(false)
const currentToolUrl = ref('')
const currentToolName = ref('')
const toolIframeLoading = ref(true)

const toolUrls: Record<string, { url: string; nameKey: string }> = {
  vincibot: { url: 'https://vinci.matatastudio.com/', nameKey: 'teacher.vincibot' },
  nous: { url: 'https://nous.matatastudio.com/', nameKey: 'teacher.nous' }
}

// 打开工具 iframe
const handleOpenTool = (toolId: string) => {
  const tool = toolUrls[toolId]
  if (tool) {
    let url = tool.url
    // 动态添加语言参数
    if (toolId === 'vincibot') {
      const lang = locale.value === 'zh' ? 'zh-CN' : 'en'
      url = `${url}?lang=${lang}`
    } else if (toolId === 'nous') {
      const lang = locale.value === 'zh' ? 'zh' : 'en'
      url = `${url}?lang=${lang}`
    }

    currentToolUrl.value = url
    currentToolName.value = $t(tool.nameKey)
    toolIframeLoading.value = true
    showToolIframeModal.value = true
  }
}

// AI 弹窗逻辑
const showAIModal = ref(false)
const aiModelName = ref('')
const currentAIKey = ref('')

const handleOpenAIModal = (key: string) => {
  currentAIKey.value = key
  aiModelName.value = ''
  showAIModal.value = true
}

const handleAIConfirm = () => {
  if (!aiModelName.value.trim()) return

  const token = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ7XCJ0b2tlblR5cGVcIjpcImFjY2Vzc190b2tlblwiLFwidXNlcklkXCI6MTE1MzIsXCJ1c2VybmFtZVwiOlwiMzI4NzI1Nzk0QHFxLmNvbVwifSIsImV4cCI6MTc3MDQzODM0MSwiaWF0IjoxNzY3ODQ2MzQxNDU0LCJqdGkiOiI0YzBmYWQ1ZC1mYjVjLTRjMTMtOTUwNi1kOGVlOGI0YWUzMTAifQ.MKTjQtiuXvbl1TDvp3AF8j0qllvMX-Hr6wwqjkzKW3LpUlM7A882MhYX78l2DoqrxrRPQ1gAzm8uZ_anCgzlrg'
  const typeMap: Record<string, number> = {
    'imageClassModel': 1,
    'gestureClassModel': 2,
    'voiceClassModel': 3,
    'poseClassModel': 4
  }
  const type = typeMap[currentAIKey.value] || 1
  const lang = locale.value === 'zh' ? 'zh' : 'en'
  const url = `https://pre.matatalab.com/?token=${token}&type=${type}&projectName=${aiModelName.value}&lang=${lang}`
  
  currentToolUrl.value = url
  
  const titleMap: Record<string, string> = {
     'imageClassModel': $t('ai.imageClassModel'),
     'gestureClassModel': $t('ai.gestureClassModel'),
     'voiceClassModel': $t('ai.voiceClassModel'),
     'poseClassModel': $t('ai.poseClassModel'),
  }

  currentToolName.value = titleMap[currentAIKey.value] || ''
  toolIframeLoading.value = true
  showToolIframeModal.value = true
  
  showAIModal.value = false
}

// iframe 加载完成
const onToolIframeLoad = () => {
  toolIframeLoading.value = false
}

// 关闭工具 iframe 弹窗
const closeToolIframeModal = () => {
  showToolIframeModal.value = false
  currentToolUrl.value = ''
  currentToolName.value = ''
  toolIframeLoading.value = true
}

// 跳转到工具中心
const goToToolCenter = () => {
  navigateTo('/system/tool')
}

// 快捷登录弹窗
const showQuickLoginModal = ref(false)
const quickLoginClassList = ref<{ classId: string; className: string }[]>([])
const selectedQuickLoginClassId = ref<string | null>(null)
const quickLoginLoading = ref(false)

// 快捷登录结果弹窗
const showQuickLoginResultModal = ref(false)
const quickLoginResultData = ref({
  className: '',
  classCode: '',
  classCodePwd: '',
  expirationDate: ''
})

// 打开快捷登录弹窗
const openQuickLoginModal = async () => {
  showQuickLoginModal.value = true
  quickLoginLoading.value = true
  selectedQuickLoginClassId.value = null
  
  try {
    const data = await getClassListNoPage()
    if (data && Array.isArray(data)) {
      quickLoginClassList.value = data.map((item: any) => ({
        classId: String(item.classId || item.id),
        className: item.className
      }))
    } else {
      quickLoginClassList.value = []
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    quickLoginClassList.value = []
  } finally {
    quickLoginLoading.value = false
  }
}

// 确认创建快捷登录
const { createQuickLogin } = useTeacher()
const handleQuickLoginConfirm = async () => {
  if (!selectedQuickLoginClassId.value) return
  
  try {
    const result = await createQuickLogin(selectedQuickLoginClassId.value)
    showQuickLoginModal.value = false
    
    // 获取选中的班级名称
    const selectedClass = quickLoginClassList.value.find(c => c.classId === selectedQuickLoginClassId.value)
    
    // 设置结果数据并显示结果弹窗
    quickLoginResultData.value = {
      className: selectedClass?.className || '',
      classCode: result?.classCode || '',
      classCodePwd: result?.classCodePwd || '',
      expirationDate: result?.expirationDate || ''
    }
    showQuickLoginResultModal.value = true
    
    // 刷新快捷登录信息
    await loadQuickLoginInfo()
  } catch (error) {
    console.error('创建快捷登录失败:', error)
  }
}

// 复制班级码信息
const copyQuickLoginInfo = () => {
  const text = `${$t('teacher.classCode')}${quickLoginResultData.value.classCode}\n${$t('teacher.unifiedPassword')}${quickLoginResultData.value.classCodePwd}`
  navigator.clipboard.writeText(text)
  alert($t('teacher.copied'))
}

// 跳转到班级管理页面
const goToClassPage = () => {
  showQuickLoginResultModal.value = false
  navigateTo('/system/class')
}

// 快捷登录按钮点击处理
const handleQuickLoginBtnClick = () => {
  if (quickLoginCode.value) {
    // 已开启快捷登录，跳转到班级管理页面
    navigateTo('/system/class')
  } else {
    // 未开启，打开选择班级弹窗
    openQuickLoginModal()
  }
}

// 当前选中的班级名称
const selectedClassName = computed(() => {
  const selectedClass = teachList.value.find(item => item.classId === selectedClassId.value)
  return selectedClass?.className || ''
})

// 检测是否有开课中的章节
const ongoingClass = computed(() => {
  return chapterList.value.find(chapter => chapter.teachStatus === 1)
})

// 班级选项
const classOptions = computed(() => {
  return teachList.value.map(item => ({
    value: item.classId,
    label: item.className
  }))
})

// 当前选中班级的课程列表
const courseOptions = computed(() => {
  const selectedClass = teachList.value.find(item => item.classId === selectedClassId.value)
  if (!selectedClass || !selectedClass.courseList) return []
  return selectedClass.courseList.map(course => ({
    value: course.courseId,
    label: course.courseName
  }))
})

// 当前选中的课程信息（用于显示封面）
const selectedCourse = computed(() => {
  const selectedClass = teachList.value.find(item => item.classId === selectedClassId.value)
  if (!selectedClass || !selectedClass.courseList) return null
  return selectedClass.courseList.find(course => course.courseId === selectedCourseId.value)
})

// 章节列表
interface ChapterItem {
  chapterId: string
  chapterName: string
  teachStatus: number // 0-未开课, 1-开课中, 2-结束
  isLatestTeach: number // 0否 1是 最近一次上课的章节（上节课）
}
const chapterList = ref<ChapterItem[]>([])

// 获取章节状态：0-已结束, 1-未开始, 2-上节课, 3-开课中
const getChapterStatus = (chapter: ChapterItem) => {
  if (chapter.teachStatus === 0) return 1 // 未开始
  if (chapter.teachStatus === 1) return 3 // 开课中
  if (chapter.teachStatus === 2) {
    // 已结束，判断是否是上节课
    if (chapter.isLatestTeach === 1) return 2 // 上节课
    return 0 // 已结束
  }
  return 1 // 默认未开始
}

// 获取章节状态文本
const getChapterStatusText = (chapter: ChapterItem) => {
  const status = getChapterStatus(chapter)
  switch (status) {
    case 0: return $t('teacher.ended')
    case 1: return $t('teacher.notStarted')
    case 2: return $t('teacher.lastClass')
    case 3: return $t('teacher.ongoing')
    default: return $t('teacher.notStarted')
  }
}

// 格式化章节名称：将 "-" 替换为换行，不显示 "-"
const formatChapterName = (name: string) => {
  if (!name) return ''
  // 按 "-" 分割，过滤空字符串，用 <br> 连接
  const parts = name.split('-').map(p => p.trim()).filter(p => p)
  return parts.join('<br>')
}

// 加载章节列表
const loadChapterList = async () => {
  if (!selectedCourseId.value || !selectedClassId.value) {
    chapterList.value = []
    return
  }
  
  try {
    const data = await getTeachChapterList(selectedCourseId.value, selectedClassId.value)
    if (data && Array.isArray(data)) {
      chapterList.value = data.map((c: any) => ({
        chapterId: String(c.chapterId),
        chapterName: c.chapterName,
        teachStatus: c.teachStatus ?? 0,
        isLatestTeach: c.isLatestTeach ?? 0
      }))
    } else {
      chapterList.value = []
    }
  } catch (error) {
    console.error('加载章节列表失败:', error)
    chapterList.value = []
  }
}

// 班级切换时，重置课程选择并默认选中第一个课程
watch(selectedClassId, (newClassId) => {
  if (newClassId) {
    const selectedClass = teachList.value.find(item => item.classId === newClassId)
    if (selectedClass?.courseList && selectedClass.courseList.length > 0) {
      selectedCourseId.value = selectedClass.courseList[0]?.courseId || null
    } else {
      selectedCourseId.value = null
    }
  } else {
    selectedCourseId.value = null
  }
})

// 课程切换时，加载章节列表
watch(selectedCourseId, () => {
  loadChapterList()
})

// 去上课 - 从授课记录直接进入课堂
const goToTeach = async (chapter: ChapterItem) => {
  if (!selectedClassId.value || !selectedCourseId.value) return
  
  const classId = selectedClassId.value
  const courseId = selectedCourseId.value
  const chapterId = chapter.chapterId
  
  // 如果是开课中状态，直接跳转，不调用 beginClass 接口
  if (chapter.teachStatus === 1) {
    navigateTo(`/system/classroom/${chapterId}?classId=${classId}&courseId=${courseId}&from=teacher`)
    return
  }
  
  // 未开课或已结束，调用接口开课
  try {
    await beginClass({ 
      classId, 
      courseId, 
      chapterId, 
      peerId: classId 
    })
    console.log('开始上课成功')
    navigateTo(`/system/classroom/${chapterId}?classId=${classId}&courseId=${courseId}&from=teacher`)
  } catch (error: any) {
    console.error('开始上课失败:', error)
  }
}

// 去备课
const goToPrepare = (chapter: ChapterItem) => {
  if (!selectedCourseId.value) return
  navigateTo(`/system/course/prepare/${selectedCourseId.value}?chapterId=${chapter.chapterId}`)
}

// 加载授课记录
const loadTeachList = async () => {
  try {
    const data = await getTeachList()
    if (data && Array.isArray(data)) {
      teachList.value = data.map((item: any) => ({
        classId: String(item.classId),
        className: item.className,
        gradeName: item.gradeName,
        courseList: (item.courseList || []).map((course: any) => ({
          courseId: course.courseId ? String(course.courseId) : null,
          courseName: course.courseName,
          courseCoverUrl: course.courseCoverUrl || ''
        }))
      }))
      
      // 默认选中第一个班级
      if (teachList.value.length > 0 && teachList.value[0]) {
        selectedClassId.value = teachList.value[0].classId
      }
    }
  } catch (error) {
    console.error('加载授课记录失败:', error)
  }
}

onMounted(() => {
  loadTeachList()
  loadQuickLoginInfo()
})

// 开课设置弹窗
const showStartClassModal = ref(false)
const startClassModalRef = ref<any>(null)
const startClassData = reactive({
  classList: [] as { classId: string; className: string }[],
  courseList: [] as { courseId: string; courseName: string }[],
  courseTree: [] as { menuId: string | null; menuName: string; courseList: { courseId: string; courseName: string }[] }[],
  initialCourseId: '',
  initialChapterId: ''
})

// 去授课 - 打开开课弹窗
const handleGoToClass = async () => {
  // 清空初始值
  startClassData.initialCourseId = ''
  startClassData.initialChapterId = ''

  // 并行调用两个独立的接口
  try { 
    const [classListRes, courseTreeRes] = await Promise.all([
      getClassListNoPage(),
      getCourseMenuTree()
    ])

    // 设置班级列表
    if (classListRes && Array.isArray(classListRes)) {
      startClassData.classList = classListRes.map((item: any) => ({
        classId: String(item.classId || item.id),
        className: item.className
      }))
    } else {
      startClassData.classList = []
    }

    // 设置课程列表（从分组结构中提取所有课程）
    // 设置课程树形结构
    if (courseTreeRes && Array.isArray(courseTreeRes)) {
      // 递归提取所有课程（用于扁平列表兼容）
      const extractAllCourses = (nodes: any[]): { courseId: string; courseName: string }[] => {
        let courses: { courseId: string; courseName: string }[] = []
        nodes.forEach((node: any) => {
          // 提取当前节点的课程
          if (node.courseList && Array.isArray(node.courseList)) {
            node.courseList.forEach((course: any) => {
              courses.push({
                courseId: String(course.courseId),
                courseName: course.courseName
              })
            })
          }
          // 递归提取子节点的课程
          if (node.children && Array.isArray(node.children)) {
            courses = courses.concat(extractAllCourses(node.children))
          }
        })
        return courses
      }

      // 设置树形结构（保持原始结构）
      startClassData.courseTree = courseTreeRes

      // 设置扁平列表（兼容）
      startClassData.courseList = extractAllCourses(courseTreeRes)
    } else {
      startClassData.courseTree = []
      startClassData.courseList = []
    }
  } catch (error) {
    console.error('获取开课设置失败:', error)
    startClassData.classList = []
    startClassData.courseTree = []
    startClassData.courseList = []
  }

  // 打开弹窗
  showStartClassModal.value = true
}

// 班级切换
const handleClassChange = (classId: string) => {
  // 清空已选章节
  if (startClassModalRef.value) {
    startClassModalRef.value.setChapterList([])
  }
}

// 课程切换时加载章节列表
const handleCourseChange = async (courseId: string, classId: string) => {
  try {
    const data = await getTeachChapterList(courseId, classId)
    if (data && startClassModalRef.value) {
      const chapters = (Array.isArray(data) ? data : []).map((c: any) => ({
        chapterId: String(c.chapterId),
        chapterName: c.chapterName,
        isLastClass: c.isLastClass || false
      }))
      startClassModalRef.value.setChapterList(chapters)
    }
  } catch (error) {
    console.error('加载章节列表失败:', error)
    if (startClassModalRef.value) {
      startClassModalRef.value.setChapterList([])
    }
  }
}

// 确认开课
const handleStartClassConfirm = async (data: { classId: string; courseId: string; chapterId: string }) => {
  console.log('开课数据:', data)
  
  const peerId = data.classId
  
  try {
    await beginClass({ 
      classId: data.classId, 
      courseId: data.courseId, 
      chapterId: data.chapterId, 
      peerId 
    })
    console.log('开始上课成功')
    // 接口成功，跳转到上课页面，from=teacher 标识从教师首页进入
    navigateTo(`/system/classroom/${data.chapterId}?classId=${data.classId}&courseId=${data.courseId}&from=teacher`)
  } catch (error: any) {
    console.error('开始上课失败:', error)
  }
}
</script>

<style scoped>
.teacher-page {
  min-height: calc(100vh - 70px);
  overflow-y: auto;
  padding: 20px 24px;
}

.main-content {
  display: flex;
  gap: 40px;
  min-height: 100%;
}

/* 左侧主内容 */
.left-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 顶部三个卡片 */
.top-cards {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.action-card {
  width: 260px;
  height: 396px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 210px;
  height: 210px;
  object-fit: contain;
  margin-bottom: 20px;
}

.card-label {
  font-size: 14px;
  color: #666;
}

/* 下方内容区 */
.bottom-section {
  display: flex;
  gap: 32px;
  flex: 1;
  min-height: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  color: #666;
}

.class-select {
  width: 140px;
}

/* 登录按钮和气泡 */
.login-btn-wrapper {
  position: relative;
}

.quick-login-btn {
  background: #FF9900 !important;
  color: white !important;
  border: none !important;
  padding: 10px 24px !important;
  font-size: 14px !important;
  border-radius: 6px !important;
}

.quick-login-btn:hover {
  background: #E68A00 !important;
}

.login-popover {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding-top: 12px;
  z-index: 100;
}

.popover-arrow {
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid rgba(58, 63, 71, 0.6);
}

.popover-content {
  background: rgba(58, 63, 71, 0.8);
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  color: white;
  text-align: center;
}

.popover-tip {
  font-size: 14px;
  color: white;
  line-height: 1.6;
}

.popover-title {
  font-size: 18px;
  font-weight: 500;
  color: white;
  margin-bottom: 4px;
}

.popover-expire {
  font-size: 13px;
  color: #ccc;
  margin-bottom: 16px;
}

.popover-info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
}

.popover-info-text {
  text-align: left;
  font-size: 14px;
  line-height: 1.8;
}

.popover-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-size: 14px;
}

.popover-row:last-child {
  margin-bottom: 0;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #3EAEFF;
  font-size: 13px;
  cursor: pointer;
}

.copy-btn:hover {
  color: #5BC0FF;
}

/* 授课记录 */
.lesson-record {
  flex-shrink: 0;
}

.empty-record {
  width: 200px;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

/* AI 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 480px;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease;
}

.modal-header {
  background: #FF9900;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  opacity: 0.8;
  transition: opacity 0.2s;
  display: flex;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 40px 48px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  color: #333;
  width: 70px;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  height: 40px;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #FF9900;
}

.modal-footer {
  padding: 20px 48px 40px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-confirm {
  background: #FF9900;
  color: white;
  border: none;
  border-radius: 4px;
  width: 120px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm:hover {
  background: #E68A00;
}

.btn-cancel {
  background: white;
  color: #666;
  border: 1px solid #E5E5E5;
  border-radius: 4px;
  width: 120px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #999;
  color: #333;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.lesson-card {
  width: 200px;
  height: 250px;
}

.lesson-cover {
  width: 100%;
  height: 100%;
  /* height: 250px; */
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.lesson-cover:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.lesson-cover-placeholder {
  background: linear-gradient(135deg, #F5A67D 0%, #E8956A 100%);
}

.course-select {
  width: 100%;
  margin-bottom: 12px;
}

/* 章节列表 */
.chapter-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  max-height: 400px;
}

.chapter-grid-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding-bottom: 16px;
}

.chapter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chapter-card {
  width: 160px;
  height: 180px;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  margin-bottom: 6px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
  padding: 12px;
}

.chapter-card:hover {
  border-color: #D9D9D9;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chapter-item.is-selected .chapter-card {
  border-color: #FF9900;
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.2);
}

.status-tag {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 10px;
  color: white;
  padding: 3px 8px;
  border-radius: 0 6px 0 6px;
}

.status-ended {
  background: #999;
}

.status-not-started {
  background: #3EAEFF;
}

.status-last {
  background: #FF9900;
}

.status-ongoing {
  background: #52C41A;
}

.chapter-name {
  font-size: 13px;
  color: #333;
  text-align: center;
  word-break: break-word;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -40px;
  margin-bottom: 0;
}

.chapter-actions {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-btn {
  width: 100%;
  padding: 5px 0;
  font-size: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.teach-btn {
  background: #FF9900;
  color: white;
}

.teach-btn:hover {
  background: #E68A00;
}

.prepare-btn {
  background: white;
  color: #FF9900;
  border: 1px solid #FF9900;
}

.prepare-btn:hover {
  background: #FFF7E6;
}

.empty-chapter {
  grid-column: 1 / -1;
  font-size: 13px;
  color: #999;
  text-align: center;
  padding: 40px 0;
}

/* 右侧边栏 */
.right-sidebar {
  width: 540px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  height: 250px;
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 16px 20px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.more-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  opacity: 0.6;
}

.tool-list {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.tool-icon {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.tool-icon:hover {
  transform: scale(1.05);
}

.tool-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 信息栏 */
.info-section {
  flex: 1;
  min-height: 0;
}

.mb-3 {
  margin-bottom: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-card {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 16px;
}

.info-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.info-value {
  font-size: 28px;
  font-weight: 500;
  color: #666;
}

/* 响应式 */
@media (max-width: 1600px) {
  .right-sidebar {
    width: 400px;
    gap: 14px;
  }
  
  .sidebar-card {
    height: 200px;
  }
  
  .tool-icon {
    width: 70px;
    height: 70px;
  }
  
  .card-icon {
    width: 120px;
    height: 120px;
  }
  
  .action-card {
    padding: 20px 28px;
    height: 280px;
  }
  
  .class-grid {
    grid-template-columns: repeat(4, 100px);
    gap: 24px;
  }
  
  .class-card {
    width: 100px;
    height: 130px;
  }
}

/* 小高度屏幕优化 */
@media (max-height: 800px) {
  .action-card {
    height: 200px;
  }
  
  .card-icon {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
  }
  
  .sidebar-card {
    height: 140px;
  }
  
  .tool-icon {
    width: 50px;
    height: 50px;
  }

  
  .top-cards {
    gap: 20px;
    margin-bottom: 16px;
  }
}

@media (max-width: 1400px) {
  .right-sidebar {
    width: 320px;
    gap: 20px;
  }
  
  .sidebar-card {
    height: 160px;
  }
  
  .tool-icon {
    width: 56px;
    height: 56px;
  }
  
  .card-icon {
    width: 100px;
    height: 100px;
  }
  
  .action-card {
    padding: 16px 24px;
  }
  
  .class-grid {
    grid-template-columns: repeat(3, 90px);
    gap: 20px;
  }
  
  .class-card {
    width: 90px;
    height: 115px;
  }
  
  .info-value {
    font-size: 24px;
  }
}

@media (max-width: 1200px) {
  .teacher-page {
    height: auto;
    min-height: calc(100vh - 70px);
    overflow-y: auto;
  }
  
  .main-content {
    flex-direction: column;
    height: auto;
  }
  
  .right-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .sidebar-card {
    flex: 1;
    min-width: 280px;
    height: 180px;
  }
  
  .info-section {
    width: 100%;
  }
  
  .class-grid {
    grid-template-columns: repeat(4, 100px);
    gap: 24px;
  }
  
  .class-card {
    width: 100px;
    height: 130px;
  }
}

@media (max-width: 768px) {
  .top-cards {
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }
  
  .action-card {
    padding: 14px 20px;
  }
  
  .card-icon {
    width: 80px;
    height: 80px;
  }
  
  .bottom-section {
    flex-direction: column;
    gap: 20px;
  }
  
  .class-grid {
    grid-template-columns: repeat(2, 100px);
    gap: 16px;
  }
}

/* 快捷登录弹窗样式 */
.quick-login-modal {
  padding: 8px 0;
}

.modal-tip {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.class-list {
  max-height: 300px;
  overflow-y: auto;
}

.class-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.class-item:last-child {
  margin-bottom: 0;
}

.class-item:hover {
  border-color: #FF9900;
  background: #FFF9F0;
}

.class-item.is-selected {
  border-color: #FF9900;
  background: #FFF9F0;
}

.class-name {
  font-size: 14px;
  color: #333;
}

.check-icon {
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #E5E5E5;
}

.confirm-btn {
  background: #FF9900 !important;
  color: white !important;
  border: none !important;
}

.confirm-btn:hover:not(:disabled) {
  background: #E68A00 !important;
}

.confirm-btn:disabled {
  background: #FFD699 !important;
  cursor: not-allowed;
}

/* 快捷登录结果弹窗样式 */
.quick-login-result {
  text-align: center;
  padding: 20px 0;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.result-class-name {
  font-size: 18px;
  color: #333;
  margin-bottom: 4px;
}

.result-expire {
  font-size: 13px;
  color: #999;
  margin-bottom: 24px;
}

.result-info-card {
  background: #F5F5F5;
  border-radius: 8px;
  padding: 16px 20px;
  text-align: left;
  position: relative;
}

.info-row {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.info-row:last-of-type {
  margin-bottom: 0;
}

.copy-btn-inline {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #3EAEFF;
  font-size: 13px;
  cursor: pointer;
}

.copy-btn-inline:hover {
  color: #1890FF;
}

.result-actions {
  margin-top: 24px;
}

.view-login-btn {
  background: #FF9900 !important;
  color: white !important;
  border: none !important;
  padding: 10px 40px !important;
  border-radius: 6px !important;
}

.view-login-btn:hover {
  background: #E68A00 !important;
}

/* 工具 iframe 弹窗样式 */
.iframe-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.iframe-modal-container {
  width: 95vw;
  height: 90vh;
  background: white;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.iframe-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E5E5;
  background: #FAFAFA;
}

.iframe-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.iframe-close-btn {
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
  transition: all 0.2s;
}

.iframe-close-btn:hover {
  background: #F0F0F0;
  color: #666;
}

.iframe-modal-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.tool-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.tool-iframe.hidden {
  opacity: 0;
  position: absolute;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #F0F0F0;
  border-top-color: #FF9900;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* 工具列表样式调整 */
.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.tool-item:hover .tool-icon {
  transform: scale(1.05);
}

.tool-item .tool-name {
  font-size: 12px;
  color: #666;
}
</style>
