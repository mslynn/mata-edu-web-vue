<template>
  <div class="h-full flex flex-col bg-white overflow-hidden">
    <!-- Row 1: Breadcrumb -->
    <div class="pl-[6%] pr-[5%] py-4">
      <div class="flex items-center text-sm text-gray-500">
        <span class="hover:text-gray-700 transition-colors cursor-pointer" @click="goHome">{{ $t('nav.home') }}</span>
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="hover:text-gray-700 transition-colors cursor-pointer" @click="goTaskManagement">{{ $t('taskManagement.title') }}</span>
        <span class="mx-2 text-gray-400">&gt;</span>
        <span class="text-gray-900 font-medium">{{ $t('taskManagement.customExercise') }}</span>
      </div>
    </div>

    <!-- Row 2: Search Bar & New Button -->
    <div class="pl-[6%] pr-[5%] pb-4 flex items-center justify-between">
      <div class="relative inline-block">
        <input 
          v-model="searchKeyword"
          type="text"
          :placeholder="$t('customExercise.searchPlaceholder')"
          class="w-[240px] h-8 pl-3 pr-9 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#FF9900] transition-colors"
          @keyup.enter="handleSearch"
        />
        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 cursor-pointer hover:text-[#FF9900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" @click="handleSearch">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <MButton type="primary" class="!bg-[#FF9900] !text-white hover:!bg-[#e68a00] shadow-md shadow-orange-500/20 active:scale-95 transition-all" @click="handleNewExercise">
        {{ $t('customExercise.newExercise') }}
      </MButton>
    </div>

    <!-- Table Area with Background -->
    <div class="flex-1 overflow-hidden pl-[6%] pr-[5%] pb-6">
      <div class="h-full flex flex-col bg-[#e3ebf3]/60 rounded-xl p-4">
        <!-- Table Container -->
        <div class="flex-1 overflow-auto bg-white rounded-lg">
          <MTable
            :columns="tableColumns"
            :data="exerciseList"
            :loading="loading"
            row-key="id"
            show-index
          >
            <!-- 已关联课程列 - 超长显示省略号和tooltip -->
            <template #linkedCourses="{ row }">
              <MTooltip 
                :content="row.linkedCourses && row.linkedCourses !== '-' ? row.linkedCourses : ''"
                placement="top"
              >
                <div class="truncate max-w-[200px]">{{ row.linkedCourses }}</div>
              </MTooltip>
            </template>
            <!-- 操作列 -->
            <template #operation="{ row }">
              <div class="flex items-center justify-center gap-2">
                <button 
                  class="px-3 py-1 text-xs border rounded transition-colors"
                  :class="row.hasLiteracy 
                    ? 'text-[#FF9900] border-[#FF9900] hover:bg-[#FFF7E6]' 
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'"
                  @click="handleEditScore(row)"
                >
                  {{ row.hasLiteracy ? $t('customExercise.editScoreEvaluation') : $t('customExercise.configureScoreEvaluation') }}
                </button>
                <button 
                  class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                  @click="handleLinkCourse(row)"
                >
                  {{ $t('customExercise.linkCourse') }}
                </button>
                <!-- More Button with Hover Dropdown -->
                <div class="relative group hover:z-[30]">
                  <button 
                    class="px-3 py-1 text-xs text-[#FF9900] border border-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                  >
                    {{ $t('common.more') }}
                  </button>
                  <!-- Dropdown Menu - Show on Hover -->
                  <div class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] min-w-[80px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button 
                      class="w-full px-4 py-2.5 text-sm text-center"
                      :class="row.canEdit ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'"
                      :disabled="!row.canEdit"
                      @click="row.canEdit && handleAction('edit', row)"
                    >
                      {{ $t('common.edit') }}
                    </button>
                    <button 
                      class="w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 text-center"
                      @click="handleAction('copy', row)"
                    >
                      {{ $t('common.copy') }}
                    </button>
                    <button 
                      class="w-full px-4 py-2.5 text-sm text-center"
                      :class="row.canDelete ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'"
                      :disabled="!row.canDelete"
                      @click="row.canDelete && handleAction('delete', row)"
                    >
                      {{ $t('common.delete') }}
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </MTable>
        </div>

        <!-- Pagination -->
        <div class="shrink-0 py-4 flex items-center justify-center">
          <MPagination 
            v-model:currentPage="currentPage"
            v-model:pageSize="pageSize"
            :total="total"
            :show-total="true"
            :show-size-changer="true"
          />
        </div>
      </div>
    </div>

    <!-- Literacy Config Modal -->
    <LiteracyConfigModal 
      :visible="literacyModalVisible" 
      :has-literacy="currentEditRow?.hasLiteracy || false"
      @close="literacyModalVisible = false"
    />

    <!-- Link Course Modal -->
    <LinkCourseModal 
      :visible="linkCourseModalVisible"
      :exercise-id="currentEditRow?.id"
      @close="linkCourseModalVisible = false"
      @confirm="handleLinkCourseConfirm"
    />

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteModalVisible" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50" @click="deleteModalVisible = false"></div>
          <div class="relative bg-white rounded-lg w-[400px] p-6">
            <button 
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              @click="deleteModalVisible = false"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <h3 class="text-lg font-medium text-center mb-4">{{ $t('customExercise.confirmDelete') }}</h3>
            <p class="text-gray-600 text-center mb-6">{{ $t('customExercise.deleteConfirmMessage') }}</p>
            <div class="flex justify-center gap-4">
              <button 
                class="px-8 py-2 border border-[#FF9900] text-[#FF9900] rounded hover:bg-[#FFF7E6] transition-colors"
                @click="deleteModalVisible = false"
              >
                {{ $t('common.cancel') }}
              </button>
              <button 
                class="px-8 py-2 bg-[#FF9900] text-white rounded hover:bg-[#e68a00] transition-colors"
                @click="confirmDelete"
              >
                {{ $t('common.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import LiteracyConfigModal from '../../components/taskmanagement/LiteracyConfigModal.vue'
import LinkCourseModal from '../../components/taskmanagement/LinkCourseModal.vue'
import { taskmanagementcenterApi } from '../../composables/api/taskmanagement'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const router = useRouter()
const { getexerciseList, copyExercise, delExercise } = taskmanagementcenterApi()

// Search
const searchKeyword = ref('')
const literacyModalVisible = ref(false)
const deleteModalVisible = ref(false)
const linkCourseModalVisible = ref(false)
const currentEditRow = ref<any>(null)
const deleteTargetRow = ref<any>(null)
const loading = ref(false)

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 练习题列表
const exerciseList = ref<any[]>([])

// 表格列配置
const tableColumns = computed(() => [
  { key: 'exerciseName', title: t('customExercise.exerciseName'), width: '180px' },
  { key: 'questionCount', title: t('customExercise.questionCount'), width: '100px', align: 'center' as const },
  { key: 'totalScore', title: t('customExercise.totalScore'), width: '80px', align: 'center' as const },
  { key: 'lastEditTime', title: t('customExercise.lastEditTime'), width: '160px', align: 'center' as const },
  { key: 'linkedCourses', title: t('customExercise.linkedCourses') },
  { key: 'operation', title: t('common.operation'), width: '320px', align: 'center' as const }
])

// 加载列表数据
const loadExerciseList = async () => {
  loading.value = true
  try {
    const result = await getexerciseList(
      pageSize.value,
      currentPage.value,
      searchKeyword.value || undefined
    )
    exerciseList.value = result.rows.map((item: any) => ({
      id: item.exerciseId,
      exerciseName: item.exerciseName,
      questionCount: item.questionCount || 0,
      totalScore: item.totalScore || 0,
      lastEditTime: item.updateTime || item.createTime || '-',
      linkedCourses: item.courseNames || '-',
      hasLiteracy: item.updateStatus === 1, // 1表示已配置素养评价，显示"修改"
      canEdit: item.editStatus === 1,
      canDelete: item.deleteStatus === 1
    }))
    total.value = result.total
  } catch (error) {
    console.error('加载练习题列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听分页变化
watch([currentPage, pageSize], () => {
  loadExerciseList()
})

// 初始化加载
onMounted(() => {
  loadExerciseList()
})

// Navigation
const goHome = () => {
  router.push('/teacher')
}

const goTaskManagement = () => {
  router.push('/taskmanagement')
}

// Actions
const handleSearch = () => {
  currentPage.value = 1 // 搜索时重置到第一页
  loadExerciseList()
}

const handleNewExercise = () => {
  router.push('/taskmanagement/add-custom-question')
}

const handleEditScore = (row: any) => {
  console.log('Edit score:', row)
  currentEditRow.value = row
  literacyModalVisible.value = true
}

const handleLinkCourse = (row: any) => {
  console.log('Link course:', row)
  currentEditRow.value = row
  linkCourseModalVisible.value = true
}

// 关联课程确认回调
const handleLinkCourseConfirm = () => {
  // 关联成功后刷新列表
  loadExerciseList()
}

const handleAction = async (action: string, row: any) => {
  console.log('Action:', action, row)
  if (action === 'edit') {
    // 跳转到编辑习题页面，带上id参数
    router.push(`/taskmanagement/add-custom-question?id=${row.id}`)
  } else if (action === 'copy') {
    // 复制练习题
    try {
      await copyExercise(row.id)
       ElMessage.success(t('common.copySuccess'))
      // 复制成功后刷新列表
      await loadExerciseList()
    } catch (error) {
      console.error('复制练习题失败:', error)
    }
  } else if (action === 'delete') {
    // 显示删除确认弹窗
    deleteTargetRow.value = row
    deleteModalVisible.value = true
  }
}

const confirmDelete = async () => {
  if (deleteTargetRow.value) {
    try {
      await delExercise(deleteTargetRow.value.id)
      // 删除成功后重新加载列表
      await loadExerciseList()
      ElMessage.success(t('common.deleteSuccess'))
    } catch (error) {
      console.error('删除练习题失败:', error)
    }
  }
  deleteModalVisible.value = false
  deleteTargetRow.value = null
}
</script>

<style scoped>
:deep(.bg-white.rounded-lg.overflow-hidden) {
  overflow: visible !important;
}
:deep(.overflow-x-auto) {
  overflow: visible !important;
}
</style>
