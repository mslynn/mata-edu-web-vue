<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <div class="modal-header">
        <span class="modal-title">关联平台资源</span>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="tip-text">请选择对应本地个人文件上传或关联作品中心文件：</p>

        <!-- 资源类型按钮 -->
        <div class="resource-type-tabs">
          <button
            v-for="tab in resourceTabs"
            :key="tab.value"
            class="type-tab"
            :class="{ active: activeResourceTab === tab.value }"
            @click="activeResourceTab = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <template v-if="activeResourceTab === 'works'">
          <div class="works-toolbar">
            <div class="works-tool-tabs">
              <button
                v-for="tool in workToolTabs"
                :key="tool.value"
                class="works-tool-tab"
                :class="{ active: activeWorksTool === tool.value }"
                @click="activeWorksTool = tool.value"
              >
                {{ tool.label }}
              </button>
            </div>

            <div class="works-search-wrap">
              <input
                v-model="worksKeyword"
                type="text"
                placeholder="作品名称"
                class="works-search-input"
                @keyup.enter="searchWorks"
              />
              <div class="works-search-actions">
                <button
                  class="works-search-btn works-search-btn--primary"
                  @click="searchWorks"
                >
                  搜索
                </button>
                <button
                  class="works-search-btn works-search-btn--ghost"
                  @click="resetWorksSearch"
                >
                  重置
                </button>
              </div>
            </div>
          </div>

          <div class="works-table-wrap">
            <table class="works-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>作品名称</th>
                  <th>是否课中作业</th>
                  <th>更新时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="worksLoading">
                  <td colspan="5" class="works-empty">加载中...</td>
                </tr>
                <tr v-else-if="worksList.length === 0">
                  <td colspan="5" class="works-empty">暂无历史作品</td>
                </tr>
                <tr
                  v-for="(work, index) in worksList"
                  v-else
                  :key="work.opusId || work.id || index"
                >
                  <td>{{ (worksPageNum - 1) * worksPageSize + index + 1 }}</td>
                  <td>{{ work.opusName || "-" }}</td>
                  <td>{{ getWorkClassworkLabel(work) }}</td>
                  <td>{{ work.updateTime || work.createTime || "-" }}</td>
                  <td class="works-action-group">
                    <button
                      class="works-row-btn"
                      :class="
                        work.linked ? 'works-row-btn--unlink' : 'works-row-btn--link'
                      "
                      @click="work.linked ? handleUnlinkWork(work) : handleLinkWork(work)"
                    >
                      {{ work.linked ? "取消关联" : "关联" }}
                    </button>
                    <button
                      v-if="work.linked"
                      class="works-row-btn"
                      :class="
                        work.hasLiteracy
                          ? 'works-row-btn--config'
                          : 'works-row-btn--config-idle'
                      "
                      @click="handleConfigWorkLiteracy(work)"
                    >
                      {{ work.hasLiteracy ? "修改素养评价" : "配置素养评价" }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="works-footer">
            <div class="works-pagination">
              <span>共{{ worksTotal }}条</span>
              <button
                class="works-page-btn"
                :disabled="worksPageNum <= 1"
                @click="changeWorksPage(worksPageNum - 1)"
              >
                ‹
              </button>
              <span class="works-page-current">{{ worksPageNum }}</span>
              <button
                class="works-page-btn"
                :disabled="worksPageNum * worksPageSize >= worksTotal"
                @click="changeWorksPage(worksPageNum + 1)"
              >
                ›
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="activeResourceTab === 'exercise'">
          <div class="exercise-search-row">
            <div class="exercise-search-box">
              <input
                v-model="exerciseKeyword"
                type="text"
                placeholder="请输入练习题名称"
                @keyup.enter="handleExerciseSearch"
              />
              <button class="exercise-search-btn" @click="handleExerciseSearch">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>
          </div>

          <div class="exercise-table-wrap">
            <div class="exercise-table-head">
              <div class="col-index">序号</div>
              <div class="col-title">练习题名称</div>
              <div class="col-count">题目数量</div>
              <div class="col-score">总分</div>
              <div class="col-action">操作</div>
            </div>

            <div class="exercise-table-body">
              <div v-if="exerciseLoading" class="exercise-empty">加载中...</div>
              <div v-else-if="exerciseRows.length === 0" class="exercise-empty">
                暂无练习题
              </div>
              <div
                v-for="(row, index) in exerciseRows"
                v-else
                :key="row.id"
                class="exercise-table-row"
              >
                <div class="col-index">
                  {{ (exercisePageNum - 1) * exercisePageSize + index + 1 }}
                </div>
                <div class="col-title">{{ row.exerciseName }}</div>
                <div class="col-count">{{ row.questionCount }}</div>
                <div class="col-score">{{ row.totalScore }}</div>
                <div class="col-action action-group">
                  <button
                    class="action-btn"
                    :class="
                      row.hasLiteracy ? 'action-btn--config' : 'action-btn--config-idle'
                    "
                    @click="handleConfigLiteracy(row)"
                  >
                    {{ row.hasLiteracy ? "修改素养评价" : "配置素养评价" }}
                  </button>
                  <button
                    class="action-btn"
                    :class="row.linked ? 'action-btn--unlink' : 'action-btn--link'"
                    @click="
                      row.linked ? handleUnlinkExercise(row) : handleLinkExercise(row)
                    "
                  >
                    {{ row.linked ? "取消关联" : "关联" }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="exercise-pagination">
            <span>共 {{ exerciseTotal }} 条</span>
            <button
              class="page-btn"
              :disabled="exercisePageNum <= 1"
              @click="changeExercisePage(exercisePageNum - 1)"
            >
              &lt;
            </button>
            <span class="page-current">{{ exercisePageNum }}</span>
            <button
              class="page-btn"
              :disabled="exercisePageNum * exercisePageSize >= exerciseTotal"
              @click="changeExercisePage(exercisePageNum + 1)"
            >
              &gt;
            </button>
          </div>
        </template>

        <template v-else>
          <!-- 种类筛选 -->
          <div class="category-filter">
            <span class="filter-label">种类：</span>
            <div class="category-tabs">
              <button
                v-for="cat in displayedCategories"
                :key="cat.value"
                class="category-tab"
                :class="{ active: activeCategory === cat.value }"
                @click="activeCategory = cat.value"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- 资源卡片列表 - 可滚动区域 -->
          <div class="resource-scroll-area">
            <div v-if="aiTrainingLoading" class="resource-empty">加载中...</div>
            <div
              v-else-if="
                activeResourceTab !== 'material' && filteredResources.length === 0
              "
              class="resource-empty"
            >
              暂无资源
            </div>
            <div v-else class="resource-grid">
              <button
                v-if="activeResourceTab === 'material'"
                type="button"
                class="resource-card resource-card--create"
                @click.stop="handleCreateMaterialModel"
              >
                <div class="resource-create-body">
                  <span class="resource-create-icon">+</span>
                  <span class="resource-create-text">新建训练项目</span>
                </div>
              </button>
              <div
                v-for="item in filteredResources"
                :key="item.id"
                class="resource-card"
                :class="{
                  'resource-card--material': activeResourceTab === 'material',
                  selected: selectedIds.includes(item.id) || !!item.linked,
                  'resource-card--loading': isAiResourceActionLoading(item),
                }"
                @click="toggleSelect(item)"
              >
                <div
                  class="card-image"
                  :class="{
                    'card-image--material': activeResourceTab === 'material',
                    'card-image--ai-training': activeResourceTab === 'aiTraining',
                  }"
                >
                  <img
                    v-if="item.cover"
                    :src="item.cover"
                    :alt="item.name"
                    :class="{
                      'card-image-img--material': activeResourceTab === 'material',
                      'card-image-img--ai-training': activeResourceTab === 'aiTraining',
                    }"
                  />
                  <div v-else class="card-image-placeholder">{{ item.name }}</div>
                  <span
                    v-if="item.linked"
                    class="tag tag-linked"
                  >
                    已关联
                  </span>
                  <span
                    v-else-if="activeResourceTab !== 'aiTraining' && item.isNew"
                    class="tag tag-new"
                  >
                    推荐
                  </span>
                  <span
                    v-if="activeResourceTab !== 'aiTraining' && activeResourceTab === 'material'"
                    class="tag tag-exp"
                  >
                    体验
                  </span>
                </div>
                <div
                  class="card-info"
                  :class="{ 'card-info--with-description': activeResourceTab === 'aiTraining' }"
                >
                  <div class="card-text-group">
                    <span
                      class="card-name"
                      :class="{ 'card-name--ai-training': activeResourceTab === 'aiTraining' }"
                    >
                      {{ item.name }}
                    </span>
                    <span
                      v-if="activeResourceTab === 'aiTraining' && item.description"
                      class="card-desc"
                    >
                      {{ item.description }}
                    </span>
                  </div>
                  <div v-if="activeResourceTab === 'material'" class="card-more">
                    <button
                      type="button"
                      class="card-more-trigger"
                      @click.stop="toggleMaterialMenu(item)"
                    >
                      <span></span>
                      <span></span>
                      <span></span>
                    </button>
                    <div
                      v-if="activeMaterialMenuId === getAiResourceOptId(item)"
                      class="material-card-menu"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="material-card-menu-item"
                        @click.stop="handleRenameMaterialModel(item)"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M12 20h9" />
                          <path
                            d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                          />
                        </svg>
                        <span>重命名</span>
                      </button>
                      <button
                        type="button"
                        class="material-card-menu-item"
                        @click.stop="handleEditMaterialModel(item)"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M12 20h9" />
                          <path
                            d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
                          />
                        </svg>
                        <span>编辑模型</span>
                      </button>
                      <button
                        type="button"
                        class="material-card-menu-item material-card-menu-item--danger"
                        :class="{ 'is-disabled': item.linked }"
                        :disabled="item.linked"
                        @click.stop="handleDeleteMaterialModel(item)"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                        <span>删除模型</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button
          v-if="activeResourceTab === 'exercise'"
          class="btn-create"
          @click="handleCreateExercise"
        >
          创建练习题
        </button>
        <button class="btn-close" @click="handleClose">关闭</button>
      </div>
    </div>

    <div
      v-if="showToolIframeModal"
      class="iframe-modal-overlay"
      @click.self="closeToolIframeModal"
    >
      <div class="iframe-modal-container">
        <div class="iframe-modal-header">
          <span class="iframe-modal-title">{{
            currentToolName || currentWorkOpus?.opusName || "MatataCode"
          }}</span>
          <button class="iframe-close-btn" @click="closeToolIframeModal">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="iframe-modal-body">
          <div v-if="toolIframeLoading" class="iframe-loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">加载中...</span>
          </div>
          <iframe
            ref="toolIframeRef"
            :src="currentToolUrl"
            class="tool-iframe"
            :class="{ hidden: toolIframeLoading }"
            frameborder="0"
            allowfullscreen
            allow="camera; microphone; bluetooth; serial"
            @load="onToolIframeLoad"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showMaterialCreateModal"
      class="material-create-overlay"
      @click.self="closeMaterialCreateModal"
    >
      <div class="material-create-modal">
        <div class="material-create-modal__header">
          <span class="material-create-modal__title">{{
            currentMaterialTool?.label
          }}</span>
          <button
            type="button"
            class="material-create-modal__close"
            @click="closeMaterialCreateModal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div class="material-create-modal__body">
          <div class="material-create-form-item">
            <label class="material-create-form-label">模型名称</label>
            <input
              v-model="materialCreateName"
              type="text"
              class="material-create-form-input"
              placeholder="请输入模型名称"
              maxlength="50"
              @keyup.enter="confirmCreateMaterialModel"
            />
          </div>
        </div>
        <div class="material-create-modal__footer">
          <button
            type="button"
            class="material-create-modal__btn material-create-modal__btn--ghost"
            @click="closeMaterialCreateModal"
          >
            取消
          </button>
          <button
            type="button"
            class="material-create-modal__btn material-create-modal__btn--primary"
            @click="confirmCreateMaterialModel"
          >
            确定
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showMaterialRenameModal"
      class="material-rename-overlay"
      @click.self="closeMaterialRenameModal"
    >
      <div class="material-rename-modal">
        <div class="material-rename-modal__header">
          <span class="material-rename-modal__title">重命名</span>
          <button
            type="button"
            class="material-rename-modal__close"
            @click="closeMaterialRenameModal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div class="material-rename-modal__body">
          <p class="material-rename-modal__desc">请输入新的模型名称</p>
          <input
            v-model="materialRenameName"
            type="text"
            class="material-rename-modal__input"
            placeholder="请输入新的模型名称"
            maxlength="50"
            @keyup.enter="confirmRenameMaterialModel"
          />
        </div>
        <div class="material-rename-modal__footer">
          <button
            type="button"
            class="material-rename-modal__btn material-rename-modal__btn--ghost"
            :disabled="materialRenameLoading"
            @click="closeMaterialRenameModal"
          >
            取消
          </button>
          <button
            type="button"
            class="material-rename-modal__btn material-rename-modal__btn--primary"
            :disabled="materialRenameLoading"
            @click="confirmRenameMaterialModel"
          >
            {{ materialRenameLoading ? "保存中..." : "确定" }}
          </button>
        </div>
      </div>
    </div>

    <LiteracyConfigModal
      :visible="literacyModalVisible"
      :exercise-id="currentLiteracyRow?.id"
      :source-type="literacySourceType"
      :resource-title="currentLiteracyRow?.fileName"
      :initial-config-data="currentLiteracyRow?.evalConfigData ?? currentLiteracyRow"
      :has-literacy="currentLiteracyRow?.hasLiteracy || false"
      @close="literacyModalVisible = false"
      @config="handleLiteracyConfigConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import LiteracyConfigModal from "~/components/taskmanagement/LiteracyConfigModal.vue";
import { taskmanagementcenterApi } from "~/composables/api/taskmanagement";
import { personalcenterApi } from "~/composables/api/personalcenter";
import { aiAdmin } from "~/composables/api/ai";
import { cursorAdmin } from "~/composables/api/curosr";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";
import myModelGraphicCover from "~/assets/images/my_model_graphic.svg";
import myModelAudioCover from "~/assets/images/my_model_audio.svg";
import myModelPoseCover from "~/assets/images/my_model_pose.svg";
import myModelHandCover from "~/assets/images/my_model_hand.svg";
import aiTrainingImageCover from "~/assets/images/1.svg";
import aiTrainingGestureCover from "~/assets/images/2.svg";
import aiTrainingVoiceCover from "~/assets/images/3.svg";
import aiTrainingPoseCover from "~/assets/images/4.svg";

interface Resource {
  id: string | number;
  name: string;
  cover: string;
  description?: string;
  category: string;
  type: string;
  isNew?: boolean;
  linked?: boolean;
  raw?: any;
}

interface CategoryOption {
  label: string;
  value: string;
}

interface MaterialToolConfig {
  key: string;
  label: string;
  optType: string;
  type: number;
  cover: string;
}

type AiTrainingCategoryKey = "image" | "voice" | "pose" | "gesture";

const props = defineProps<{
  visible: boolean;
  chapterId?: string;
  linkedExerciseIds?: Array<string | number>;
  linkedWorkResources?: any[];
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "linked", ids: number[]): void;
  (e: "confirm"): void;
}>();

const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const api = taskmanagementcenterApi();
const { editOpus, uploadOSS } = personalcenterApi();
const { ssoLogin, deleteOss, createAi, updateAi } = aiAdmin();
const {
  saveLiteracyConfig,
  getResourceeDictEvalconfig,
  getExerciseListPage,
  getChapterResourceOpusListPage,
  toggleChapterResource,
  getCursorOptList,
  getCursorOptListNoModel,
  toggleChapterOpt,
  toggleChapterOptNoModel,
  editCursorOpt,
  deleteCursorOpt,
} = cursorAdmin();
const {
  downloadFileFromOSS,
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  isMessageFromIframe,
  toZipFile,
  toUploadFile,
  toWorkFile,
} = useIframeFileBridge();
const activeResourceTab = ref("aiTraining");
const activeCategory = ref("image");
const DEFAULT_IFRAME_ZIP_MESSAGE_TYPE = "ZIP_DATA";
const TM_ZIP_RECEIVE_MESSAGE_TYPE = "receive-tm-zip";
const TM_ZIP_RESPONSE_MESSAGE_TYPE = "send-tm-zip";
const selectedIds = ref<Array<string | number>>([]);
const exerciseKeyword = ref("");
const exerciseLoading = ref(false);
const exerciseRows = ref<any[]>([]);
const exerciseTotal = ref(0);
const exercisePageNum = ref(1);
const exercisePageSize = ref(10);
const literacyModalVisible = ref(false);
const currentExerciseRow = ref<any>(null);
const currentWorkRow = ref<any>(null);
const currentLiteracyRow = ref<any>(null);
const literacySourceType = ref<"exercise" | "resource">("exercise");
const linkedExerciseIdsState = ref<string[]>([]);
const activeWorksTool = ref<"vinci" | "nous">("vinci");
const worksKeyword = ref("");
const worksLoading = ref(false);
const worksList = ref<any[]>([]);
const worksTotal = ref(0);
const worksPageNum = ref(1);
const worksPageSize = ref(10);
const aiTrainingLoading = ref(false);
const aiTrainingLinkedOptTypes = ref<string[]>([]);
const aiResourceActionLoadingIds = ref<string[]>([]);
const activeMaterialMenuId = ref("");
const showMaterialCreateModal = ref(false);
const materialCreateName = ref("");
const currentMaterialTool = ref<MaterialToolConfig | null>(null);
const currentEditingMaterialModelId = ref("");
const currentEditingMaterialOssId = ref("");
const currentMaterialProjectName = ref("");
const currentToolContext = ref<"works" | "ai">("works");
const currentToolMessageType = ref(DEFAULT_IFRAME_ZIP_MESSAGE_TYPE);
const currentToolAdditionalData = ref<Record<string, unknown>>({});
const savingAiModel = ref(false);
const showMaterialRenameModal = ref(false);
const materialRenameName = ref("");
const materialRenameLoading = ref(false);
const currentRenameMaterialItem = ref<Resource | null>(null);
const cursorResources = ref<Resource[]>([]);
const linkedWorkResourcesState = ref<any[]>([]);
const showToolIframeModal = ref(false);
const currentToolUrl = ref("");
const currentToolName = ref("");
const currentToolFile = ref<File | null>(null);
const toolIframeLoading = ref(true);
const toolIframeReady = ref(false);
const toolIframeRef = ref<HTMLIFrameElement | null>(null);
const pendingToolZipDelivery = ref(false);
const pendingToolIframeMessage = ref<{
  type: string;
  payload: ArrayBuffer;
  optId?: string;
  transfer?: Transferable[];
} | null>(null);
const currentWorkOpus = ref<any | null>(null);
const savingWorkOpus = ref(false);
const isHandlingToolTmZip = ref(false);
const workToolTabs = [
  { label: "MatataCode (VinciBot)", value: "vinci" as const },
  { label: "MatataCode(Nous)", value: "nous" as const },
];

const resourceTabs = [
  { label: "关联AI实训资源", value: "aiTraining" },
  { label: "关联作品管理文件", value: "works" },
  { label: "关联自定义练习题", value: "exercise" },
  { label: "关联素材模型", value: "material" },
];

const aiTrainingCategories: CategoryOption[] = [
  { label: "图像识别", value: "image" },
  { label: "语音识别", value: "voice" },
  { label: "姿态识别", value: "pose" },
  { label: "手势识别", value: "gesture" },
];

const materialCategories: CategoryOption[] = [
  { label: "图像", value: "image" },
  { label: "音频", value: "audio" },
  { label: "姿态", value: "pose" },
  { label: "手势", value: "gesture" },
];

const MATERIAL_MODEL_COVER_MAP: Record<string, string> = {
  image: myModelGraphicCover,
  audio: myModelAudioCover,
  pose: myModelPoseCover,
  gesture: myModelHandCover,
};

const AI_TRAINING_CARD_META: Record<
  AiTrainingCategoryKey,
  {
    name: string;
    description: string;
    cover: string;
  }
> = {
  image: {
    name: "图像分类训练",
    description: "使用摄像头或上传图片进行图像的分类训练与模型应用。",
    cover: aiTrainingImageCover,
  },
  voice: {
    name: "语音分类模型",
    description: "使用麦克风进行声音的分类训练与模型应用。",
    cover: aiTrainingVoiceCover,
  },
  pose: {
    name: "姿态分类模型",
    description: "使用摄像头或上传图片进行人体姿态训练与模型应用。",
    cover: aiTrainingPoseCover,
  },
  gesture: {
    name: "手势分类模型",
    description: "使用摄像头或上传图片进行手势训练与模型应用。",
    cover: aiTrainingGestureCover,
  },
};

const getAiTrainingMetaByCategory = (category: string) => {
  if (category === "image") return AI_TRAINING_CARD_META.image;
  if (category === "voice") return AI_TRAINING_CARD_META.voice;
  if (category === "pose") return AI_TRAINING_CARD_META.pose;
  if (category === "gesture") return AI_TRAINING_CARD_META.gesture;
  return null;
};

const displayedCategories = computed(() => {
  return activeResourceTab.value === "material"
    ? materialCategories
    : aiTrainingCategories;
});

const CURSOR_OPT_TYPE_MAP: Record<string, string> = {
  image: "image_cls",
  voice: "audio_cls",
  audio: "audio_cls",
  pose: "pose_cls",
  gesture: "gesture_cls",
};

const getAiTrainingOptTypeByCategory = (category: string) => {
  return CURSOR_OPT_TYPE_MAP[category] || "";
};

const AI_TOOL_KEY_BY_OPT_TYPE: Record<string, string> = {
  image_cls: "imageClassModel",
  audio_cls: "voiceClassModel",
  pose_cls: "poseClassModel",
  gesture_cls: "gestureClassModel",
};

const MATERIAL_TOOL_CONFIG_MAP: Record<string, MaterialToolConfig> = {
  image: {
    key: "imageClassModel",
    label: "图像分类训练",
    optType: "image_cls",
    type: 1,
    cover: myModelGraphicCover,
  },
  audio: {
    key: "voiceClassModel",
    label: "音频分类训练",
    optType: "audio_cls",
    type: 3,
    cover: myModelAudioCover,
  },
  pose: {
    key: "poseClassModel",
    label: "姿态分类训练",
    optType: "pose_cls",
    type: 4,
    cover: myModelPoseCover,
  },
  gesture: {
    key: "gestureClassModel",
    label: "手势分类训练",
    optType: "gesture_cls",
    type: 2,
    cover: myModelHandCover,
  },
};

const aiTrainingStaticResources: Resource[] = [
  {
    id: "ai-training-image",
    name: AI_TRAINING_CARD_META.image.name,
    description: AI_TRAINING_CARD_META.image.description,
    cover: AI_TRAINING_CARD_META.image.cover,
    category: "image",
    type: "aiTraining",
    isNew: true,
    linked: false,
  },
  {
    id: "ai-training-voice",
    name: AI_TRAINING_CARD_META.voice.name,
    description: AI_TRAINING_CARD_META.voice.description,
    cover: AI_TRAINING_CARD_META.voice.cover,
    category: "voice",
    type: "aiTraining",
    isNew: true,
    linked: false,
  },
  {
    id: "ai-training-pose",
    name: AI_TRAINING_CARD_META.pose.name,
    description: AI_TRAINING_CARD_META.pose.description,
    cover: AI_TRAINING_CARD_META.pose.cover,
    category: "pose",
    type: "aiTraining",
    isNew: true,
    linked: false,
  },
  {
    id: "ai-training-gesture",
    name: AI_TRAINING_CARD_META.gesture.name,
    description: AI_TRAINING_CARD_META.gesture.description,
    cover: AI_TRAINING_CARD_META.gesture.cover,
    category: "gesture",
    type: "aiTraining",
    isNew: true,
    linked: false,
  },
];

const aiTrainingResources = computed(() => {
  return aiTrainingStaticResources.map((resource) => ({
    ...resource,
    linked: aiTrainingLinkedOptTypes.value.includes(
      getAiTrainingOptTypeByCategory(resource.category)
    ),
  }));
});

const getActiveCursorOptType = () => {
  return CURSOR_OPT_TYPE_MAP[activeCategory.value] || "";
};

const normalizeCategoryForTab = (tab: string, category: string) => {
  if (tab === "material") {
    if (category === "voice") return "audio";
    return materialCategories.some((item) => item.value === category)
      ? category
      : "image";
  }

  if (tab === "aiTraining") {
    if (category === "audio") return "voice";
    return aiTrainingCategories.some((item) => item.value === category)
      ? category
      : "image";
  }

  return category;
};

const ensureActiveCategoryForTab = (tab: string) => {
  const nextCategory = normalizeCategoryForTab(tab, activeCategory.value);
  if (nextCategory === activeCategory.value) return false;
  activeCategory.value = nextCategory;
  return true;
};

const filteredResources = computed(() => {
  if (activeResourceTab.value === "aiTraining") {
    return aiTrainingResources.value.filter(
      (resource) => resource.category === activeCategory.value
    );
  }

  if (activeResourceTab.value === "material") {
    return cursorResources.value.filter(
      (resource) =>
        resource.type === activeResourceTab.value &&
        resource.category === activeCategory.value
    );
  }
  return [];
});

const resolveCursorResourceCover = (item: any) => {
  const coverCandidates = [
    item?.coverUrl,
    item?.cover,
    item?.imageUrl,
    item?.imgUrl,
    item?.thumbnailUrl,
    item?.thumbUrl,
  ];

  return coverCandidates.find((value) => typeof value === "string" && value.trim()) || "";
};

const getMaterialModelCover = (category: string, item?: any) => {
  const optType = String(item?.optType || "")
    .trim()
    .toLowerCase();
  if (optType === "audio_cls") return MATERIAL_MODEL_COVER_MAP.audio;
  if (optType === "pose_cls") return MATERIAL_MODEL_COVER_MAP.pose;
  if (optType === "gesture_cls") return MATERIAL_MODEL_COVER_MAP.gesture;
  if (optType === "image_cls") return MATERIAL_MODEL_COVER_MAP.image;
  return MATERIAL_MODEL_COVER_MAP[category] || "";
};

const getAiTrainingCover = (category: string, item?: any) => {
  const optType = String(item?.optType || "")
    .trim()
    .toLowerCase();
  if (optType === "audio_cls") return AI_TRAINING_CARD_META.voice.cover;
  if (optType === "pose_cls") return AI_TRAINING_CARD_META.pose.cover;
  if (optType === "gesture_cls") return AI_TRAINING_CARD_META.gesture.cover;
  if (optType === "image_cls") return AI_TRAINING_CARD_META.image.cover;
  return getAiTrainingMetaByCategory(category)?.cover || "";
};

const getAiTrainingDescription = (category: string, item?: any) => {
  const optType = String(item?.optType || "")
    .trim()
    .toLowerCase();
  if (optType === "audio_cls") return AI_TRAINING_CARD_META.voice.description;
  if (optType === "pose_cls") return AI_TRAINING_CARD_META.pose.description;
  if (optType === "gesture_cls") return AI_TRAINING_CARD_META.gesture.description;
  if (optType === "image_cls") return AI_TRAINING_CARD_META.image.description;
  return getAiTrainingMetaByCategory(category)?.description || "";
};

const getAiTrainingDefaultName = (category: string, item?: any) => {
  const optType = String(item?.optType || "")
    .trim()
    .toLowerCase();
  if (optType === "audio_cls") return AI_TRAINING_CARD_META.voice.name;
  if (optType === "pose_cls") return AI_TRAINING_CARD_META.pose.name;
  if (optType === "gesture_cls") return AI_TRAINING_CARD_META.gesture.name;
  if (optType === "image_cls") return AI_TRAINING_CARD_META.image.name;
  return getAiTrainingMetaByCategory(category)?.name || "-";
};

const loadAiTrainingLinkedState = async () => {
  if (!props.chapterId) {
    aiTrainingLinkedOptTypes.value = [];
    return;
  }

  aiTrainingLoading.value = true;
  try {
    const result = await getCursorOptListNoModel(String(props.chapterId));
    const rows = Array.isArray(result?.rows) ? result.rows : [];
    aiTrainingLinkedOptTypes.value = rows
      .map((item: any) =>
        typeof item === "string" ? item.trim() : String(item?.optType || "").trim()
      )
      .filter(Boolean);
  } catch (error) {
    console.error("加载AI实训关联状态失败:", error);
    aiTrainingLinkedOptTypes.value = [];
    ElMessage.error("加载AI实训关联状态失败");
  } finally {
    aiTrainingLoading.value = false;
  }
};

const getCurrentMaterialToolConfig = () => {
  return MATERIAL_TOOL_CONFIG_MAP[activeCategory.value] || null;
};

const getCurrentUserId = () => {
  if (!import.meta.client) return "";
  try {
    const rawUserInfo = localStorage.getItem("user_info");
    if (!rawUserInfo) return "";
    const userInfo = JSON.parse(rawUserInfo);
    return userInfo?.user_id || userInfo?.userId || userInfo?.id || "";
  } catch {
    return "";
  }
};

const buildMaterialAiIframeUrl = async (
  tool: MaterialToolConfig,
  projectName: string,
  optId = ""
) => {
  const ssoData = await ssoLogin();
  const accessToken =
    (typeof ssoData === "string" ? ssoData : "") ||
    ssoData?.accessToken ||
    ssoData?.token ||
    ssoData?.access_token ||
    "";

  if (!accessToken) {
    throw new Error("获取AI工具Token失败");
  }

  return `https://pre.matatalab.com/?token=${encodeURIComponent(accessToken)}&type=${
    tool.type
  }&projectName=${encodeURIComponent(projectName)}&lang=zh&ch=aiedu&type2=opt${
    optId ? `&optId=${encodeURIComponent(optId)}` : ""
  }`;
};

const syncSelectedIdsFromResources = (items: Resource[]) => {
  selectedIds.value = items.filter((item) => item.linked).map((item) => item.id);
};

const getAiResourceOptId = (item: Resource) => {
  return String(item?.raw?.optId || item?.raw?.id || item?.id || "").trim();
};

const getAiResourceOptType = (item: Resource) => {
  return String(item?.raw?.optType || getActiveCursorOptType() || "").trim();
};

const isAiResourceActionLoading = (item: Resource) => {
  const optId = getAiResourceOptId(item);
  return !!optId && aiResourceActionLoadingIds.value.includes(optId);
};

const markResourceSelected = (itemId: string | number, linked: boolean) => {
  const index = selectedIds.value.findIndex((id) => String(id) === String(itemId));
  if (linked) {
    if (index === -1) {
      selectedIds.value.push(itemId);
    }
    return;
  }
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  }
};

const loadAiTrainingResources = async () => {
  const optType = getActiveCursorOptType();
  if (!optType) {
    cursorResources.value = [];
    return;
  }

  if (!props.chapterId) {
    cursorResources.value = [];
    return;
  }

  aiTrainingLoading.value = true;
  try {
    const result = await getCursorOptList({
      chapterId: String(props.chapterId),
      optType,
    });
    const rows = Array.isArray(result?.rows) ? result.rows : [];
    const currentTab = activeResourceTab.value;
    const currentCategory = activeCategory.value;
    const mappedResources = rows.map((item: any, index: number) => ({
      id: String(
        item?.optId || item?.id || item?.aiId || item?.ossId || `${optType}-${index}`
      ),
      name:
        item?.optName ||
        item?.name ||
        item?.projectName ||
        getAiTrainingDefaultName(currentCategory, item),
      description:
        currentTab === "aiTraining"
          ? getAiTrainingDescription(currentCategory, item)
          : "",
      cover:
        resolveCursorResourceCover(item) ||
        (currentTab === "material"
          ? getMaterialModelCover(currentCategory, item)
          : getAiTrainingCover(currentCategory, item)),
      category: currentCategory,
      type: currentTab,
      linked: normalizeBindState(item?.isBind),
      isNew: normalizeBindState(item?.isNew || item?.isRecommend),
      raw: item,
    }));
    cursorResources.value = mappedResources;
    syncSelectedIdsFromResources(mappedResources);
  } catch (error) {
    console.error("加载AI实训资源失败:", error);
    cursorResources.value = [];
    selectedIds.value = [];
    ElMessage.error("加载AI实训资源失败");
  } finally {
    aiTrainingLoading.value = false;
  }
};

const openMaterialCreateModal = () => {
  materialCreateName.value = "";
  showMaterialCreateModal.value = true;
};

const closeMaterialCreateModal = () => {
  if (savingAiModel.value) return;
  showMaterialCreateModal.value = false;
  materialCreateName.value = "";
};

const openMaterialAiEditor = async (
  model: { id?: string; name: string; ossId?: string; url?: string } | null
) => {
  if (!currentMaterialTool.value) {
    ElMessage.warning("当前分类暂不支持创建模型");
    return;
  }

  try {
    currentToolContext.value = "ai";
    currentWorkOpus.value = null;
    currentToolName.value = currentMaterialTool.value.label;
    currentMaterialProjectName.value = model?.name || materialCreateName.value.trim();
    currentEditingMaterialModelId.value = model?.id ? String(model.id) : "";
    currentEditingMaterialOssId.value = model?.ossId ? String(model.ossId) : "";
    currentToolMessageType.value = model?.id
      ? TM_ZIP_RECEIVE_MESSAGE_TYPE
      : DEFAULT_IFRAME_ZIP_MESSAGE_TYPE;
    currentToolAdditionalData.value = model?.id ? { optId: String(model.id) } : {};
    toolIframeReady.value = false;
    pendingToolIframeMessage.value = null;
    currentToolFile.value = null;
    pendingToolZipDelivery.value = false;
    currentToolUrl.value = "";
    toolIframeLoading.value = true;
    showToolIframeModal.value = true;

    console.log("准备打开AI模型编辑器:", {
      mode: model?.id ? "edit" : "create",
      modelId: model?.id || "",
      projectName: currentMaterialProjectName.value,
      toolKey: currentMaterialTool.value.key,
      optType: currentMaterialTool.value.optType,
    });

    if (model?.ossId) {
      currentToolFile.value = await downloadFileFromOSS(
        String(model.ossId),
        `${model.name}.zip`,
        "application/zip"
      );
    } else if (model?.url) {
      const response = await fetch(model.url);
      if (!response.ok) {
        throw new Error(`下载模型文件失败: ${response.status}`);
      }
      const blob = await response.blob();
      currentToolFile.value = new File([blob], `${model.name}.zip`, {
        type: blob.type || "application/zip",
        lastModified: Date.now(),
      });
    }

    pendingToolZipDelivery.value = !!currentToolFile.value;

    currentToolUrl.value = await buildMaterialAiIframeUrl(
      currentMaterialTool.value,
      currentMaterialProjectName.value,
      currentEditingMaterialModelId.value
    );
    showMaterialCreateModal.value = false;
    console.log("AI模型编辑器地址已就绪:", {
      mode: model?.id ? "edit" : "create",
      modelId: currentEditingMaterialModelId.value,
      hasFile: !!currentToolFile.value,
      iframeUrl: currentToolUrl.value,
    });
  } catch (error) {
    console.error("打开AI模型编辑器失败:", error);
    closeToolIframeModal();
    ElMessage.error(error instanceof Error ? error.message : "打开AI模型编辑器失败");
  }
};

const handleCreateMaterialModel = async () => {
  const toolConfig = getCurrentMaterialToolConfig();
  if (!toolConfig) {
    ElMessage.warning("当前分类暂不支持创建模型");
    return;
  }

  currentMaterialTool.value = toolConfig;
  currentEditingMaterialModelId.value = "";
  currentEditingMaterialOssId.value = "";
  currentMaterialProjectName.value = "";
  materialCreateName.value = "";
  showMaterialCreateModal.value = true;
};

const confirmCreateMaterialModel = async () => {
  const nextName = materialCreateName.value.trim();
  if (!nextName) {
    ElMessage.warning("模型名称不能为空");
    return;
  }

  await openMaterialAiEditor({
    name: nextName,
  });
};

const toggleMaterialMenu = (item: Resource) => {
  const optId = getAiResourceOptId(item);
  if (!optId) return;
  activeMaterialMenuId.value = activeMaterialMenuId.value === optId ? "" : optId;
};

const handleRenameMaterialModel = (item: Resource) => {
  const optId = getAiResourceOptId(item);
  if (!optId) {
    ElMessage.warning("当前模型缺少 optId");
    return;
  }

  activeMaterialMenuId.value = "";
  currentRenameMaterialItem.value = item;
  materialRenameName.value = item.name;
  showMaterialRenameModal.value = true;
};

const closeMaterialRenameModal = () => {
  if (materialRenameLoading.value) return;
  showMaterialRenameModal.value = false;
  materialRenameName.value = "";
  currentRenameMaterialItem.value = null;
};

const confirmRenameMaterialModel = async () => {
  const item = currentRenameMaterialItem.value;
  if (!item) return;

  const optId = getAiResourceOptId(item);
  const nextName = materialRenameName.value.trim();
  if (!optId) {
    ElMessage.warning("当前模型缺少 optId");
    return;
  }
  if (!nextName) {
    ElMessage.warning("模型名称不能为空");
    return;
  }
  if (nextName === item.name) {
    closeMaterialRenameModal();
    return;
  }

  materialRenameLoading.value = true;
  let renameSuccess = false;
  try {
    await editCursorOpt({
      optId,
      optName: nextName,
    });

    item.name = nextName;
    if (item.raw && typeof item.raw === "object") {
      item.raw.optName = nextName;
      item.raw.name = nextName;
      item.raw.projectName = nextName;
    }
    ElMessage.success("重命名成功");
    renameSuccess = true;
  } catch (error: any) {
    console.error("重命名模型失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "重命名失败");
  } finally {
    materialRenameLoading.value = false;
  }
  if (renameSuccess) {
    closeMaterialRenameModal();
  }
};

const handleEditMaterialModel = async (item: Resource) => {
  const optId = getAiResourceOptId(item);
  if (!optId) {
    ElMessage.warning("当前模型缺少编辑参数");
    return;
  }

  activeMaterialMenuId.value = "";
  currentMaterialTool.value = getCurrentMaterialToolConfig();
  console.log("从素材模型卡片进入编辑模型:", {
    optId,
    name: item.name,
    optType: getAiResourceOptType(item),
    category: activeCategory.value,
  });
  await openMaterialAiEditor({
    id: optId,
    name: item.name,
    ossId: String(item.raw?.ossId || ""),
    url: String(item.raw?.url || ""),
  });
};

const handleDeleteMaterialModel = async (item: Resource) => {
  const optId = getAiResourceOptId(item);
  if (!optId) {
    ElMessage.warning("当前模型缺少 optId");
    return;
  }
  if (item.linked) {
    return;
  }

  activeMaterialMenuId.value = "";
  try {
    await ElMessageBox.confirm(`确认删除模型“${item.name}”吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
  } catch {
    return;
  }

  try {
    await deleteCursorOpt(optId);
    ElMessage.success("删除成功");
    await loadAiTrainingResources();
  } catch (error) {
    console.error("删除模型失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "删除失败");
  }
};

const handleDocumentClick = () => {
  activeMaterialMenuId.value = "";
};

const normalizeToolId = (value: unknown): "vincibot" | "nous" | "" => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalizedValue) return "";
  if (normalizedValue.includes("nous")) return "nous";
  if (
    normalizedValue.includes("vincibot") ||
    normalizedValue.includes("vinci") ||
    normalizedValue.includes("ucode4")
  ) {
    return "vincibot";
  }
  return "";
};

const getHistoryOpusFileType = (work: any): "vinci" | "nous" => {
  const toolId =
    normalizeToolId(work?.opusType || work?.fileType || activeWorksTool.value) ||
    "vincibot";
  return toolId === "nous" ? "nous" : "vinci";
};

const getWorksOpusTypeParam = () => {
  return activeWorksTool.value === "nous" ? "Nous" : "vinci";
};

const normalizeBindState = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  return normalized === "1" || normalized === "true";
};

const resolveLinkedWorkResource = (work: any) => {
  const opusOssId = String(work?.opusOssId || work?.ossId || "").trim();
  const workFileName = getHistoryOpusFileName(work);
  const opusName = String(work?.opusName || "").trim();

  return (
    linkedWorkResourcesState.value.find((item: any) => {
      const resourceOssId = String(item?.ossId || "").trim();
      const resourceFileName = String(item?.fileName || "").trim();
      const resourceName = String(item?.resourceName || "").trim();

      if (opusOssId && resourceOssId && resourceOssId === opusOssId) return true;
      if (workFileName && resourceFileName && resourceFileName === workFileName)
        return true;
      if (opusName && resourceName && resourceName === opusName) return true;
      return false;
    }) || null
  );
};

const getHistoryOpusFileName = (work: any) => {
  const fileName = work?.opusUrl ? String(work.opusUrl).split("/").pop() : work?.opusName;
  if (fileName && /\.[^.]+$/i.test(fileName)) {
    return fileName;
  }
  const baseName = String(fileName || work?.opusName || "project");
  return `${baseName}.${getHistoryOpusFileType(work) === "nous" ? "sb3" : "mc"}`;
};

const getToolAccessToken = async () => {
  const ssoData = await ssoLogin();
  const accessToken =
    (typeof ssoData === "string" ? ssoData : "") ||
    ssoData?.accessToken ||
    ssoData?.token ||
    ssoData?.access_token ||
    "";

  if (!accessToken) {
    throw new Error("获取工具Token失败");
  }

  return accessToken;
};

const buildToolIframeUrl = async (toolId: "vincibot" | "nous") => {
  const baseUrl =
    toolId === "nous"
      ? String(runtimeConfig.public.nousCreateUrl || "").trim()
      : String(runtimeConfig.public.vincibotCreateUrl || "").trim();

  if (!baseUrl) {
    throw new Error("当前未配置工具地址");
  }

  const token = await getToolAccessToken();
  const lang = toolId === "vincibot" ? "zh-CN" : "zh";
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}token=${encodeURIComponent(token)}&lang=${lang}&ch=aiedu`;
};

const getToolReceiveMessageType = (fileName: string) => {
  return /\.(mc|sb3)$/i.test(fileName) ? "receive-works-sb3" : "ZIP_DATA";
};

const createCurrentToolIframeMessage = async (file: File) => {
  const payload = await file.arrayBuffer();
  const additionalOptId =
    typeof currentToolAdditionalData.value.optId === "string"
      ? currentToolAdditionalData.value.optId
      : undefined;
  const messageType =
    currentToolContext.value === "ai"
      ? currentToolMessageType.value
      : getToolReceiveMessageType(file.name);

  return {
    type: messageType,
    payload,
    optId:
      currentToolContext.value === "ai"
        ? additionalOptId || currentEditingMaterialModelId.value || undefined
        : undefined,
    transfer: [payload] as Transferable[],
  };
};

const loadWorksList = async (preferredSelectionId = "") => {
  worksLoading.value = true;
  try {
    const result = await getChapterResourceOpusListPage({
      chapterId: String(props.chapterId || ""),
      opusType: getWorksOpusTypeParam(),
      pageSize: worksPageSize.value,
      pageNum: worksPageNum.value,
    });
    const sourceRows = Array.isArray(result?.rows) ? result.rows : [];
    const filteredRows = worksKeyword.value
      ? sourceRows.filter((item: any) =>
          String(item?.opusName || "")
            .toLowerCase()
            .includes(worksKeyword.value.toLowerCase())
        )
      : sourceRows;

    worksList.value = filteredRows.map((item: any) => {
      const linkedResource = resolveLinkedWorkResource(item);
      const linked = normalizeBindState(item?.isBind);
      return {
        ...item,
        linked,
        linkedResourceId: item?.resourceId
          ? String(item.resourceId)
          : linkedResource?.resourceId
          ? String(linkedResource.resourceId)
          : "",
        hasLiteracy: Number(item?.updateStatus ?? linkedResource?.updateStatus) === 1,
        linkedResourceData: linkedResource || item || null,
      };
    });
    worksTotal.value = worksKeyword.value
      ? filteredRows.length
      : Number(result?.total || filteredRows.length || 0);

    if (worksList.value.length === 0) {
      return;
    }
  } catch (error) {
    console.error("获取历史作品列表失败", error);
    worksList.value = [];
    worksTotal.value = 0;
  } finally {
    worksLoading.value = false;
  }
};

const searchWorks = async () => {
  worksPageNum.value = 1;
  await loadWorksList();
};

const resetWorksSearch = async () => {
  worksKeyword.value = "";
  worksPageNum.value = 1;
  await loadWorksList();
};

const changeWorksPage = async (page: number) => {
  if (page < 1 || page === worksPageNum.value) return;
  worksPageNum.value = page;
  await loadWorksList();
};

const getWorkClassworkLabel = (work: any) => {
  return Number(work?.classwork) === 1 ? "是" : "否";
};

const handleLinkWork = async (work: any) => {
  if (!props.chapterId) {
    ElMessage.warning("缺少章节ID");
    return;
  }
  const opusId = String(work?.opusId || work?.id || "").trim();
  if (!opusId) {
    ElMessage.warning("当前作品缺少 opusId");
    return;
  }

  try {
    await toggleChapterResource({
      opusId,
      chapterId: String(props.chapterId),
      type: 1,
    });
    ElMessage.success("关联成功");
    await loadWorksList(String(work.opusId || work.id || ""));
  } catch (error) {
    console.error("关联作品管理文件失败:", error);
    ElMessage.error("关联作品管理文件失败");
  }
};

const handleUnlinkWork = async (work: any) => {
  const opusId = String(work?.opusId || work?.id || "").trim();
  if (!opusId) {
    ElMessage.warning("当前作品缺少 opusId");
    return;
  }

  try {
    await toggleChapterResource({
      opusId,
      chapterId: String(props.chapterId || ""),
      type: 2,
    });
    ElMessage.success("取消关联成功");
    await loadWorksList(String(work.opusId || work.id || ""));
  } catch (error) {
    console.error("取消关联作品管理文件失败:", error);
    ElMessage.error("取消关联作品管理文件失败");
  }
};

const handleConfigWorkLiteracy = async (work: any) => {
  const resourceId = String(
    work?.linkedResourceId || work?.linkedResourceData?.resourceId || ""
  ).trim();
  if (!resourceId) {
    ElMessage.warning("当前关联资源缺少 resourceId");
    return;
  }

  try {
    let configData = work.linkedResourceData || work;
    if (work.hasLiteracy) {
      const result = await getResourceeDictEvalconfig(resourceId, 2);
      configData = {
        ...configData,
        resourceId,
        fileName: work.opusName || work.fileName,
        evalConfigData: result,
      };
    }
    currentWorkRow.value = {
      ...work,
      ...configData,
      id: resourceId,
      resourceId,
      fileName: work.opusName || configData.fileName || "-",
      hasLiteracy: work.hasLiteracy,
    };
    currentLiteracyRow.value = currentWorkRow.value;
    literacySourceType.value = "resource";
    literacyModalVisible.value = true;
  } catch (error) {
    console.error("加载作品素养评价配置失败:", error);
    ElMessage.error("加载作品素养评价配置失败");
  }
};

const closeToolIframeModal = () => {
  showToolIframeModal.value = false;
  currentToolUrl.value = "";
  currentToolName.value = "";
  currentToolFile.value = null;
  currentToolContext.value = "works";
  currentToolMessageType.value = DEFAULT_IFRAME_ZIP_MESSAGE_TYPE;
  currentToolAdditionalData.value = {};
  currentWorkOpus.value = null;
  toolIframeLoading.value = true;
  toolIframeReady.value = false;
  pendingToolZipDelivery.value = false;
  pendingToolIframeMessage.value = null;
  savingWorkOpus.value = false;
  savingAiModel.value = false;
  isHandlingToolTmZip.value = false;
  currentEditingMaterialModelId.value = "";
  currentEditingMaterialOssId.value = "";
  currentMaterialProjectName.value = "";
};

const postCurrentToolFileToIframe = async () => {
  if (
    !currentToolFile.value ||
    !currentToolUrl.value ||
    !toolIframeRef.value?.contentWindow
  ) {
    return;
  }

  const iframeOrigin = new URL(currentToolUrl.value).origin;
  const message = await createCurrentToolIframeMessage(currentToolFile.value);
  toolIframeRef.value.contentWindow.postMessage(
    {
      type: message.type,
      payload: message.payload,
      optId: message.optId,
    },
    iframeOrigin,
    message.transfer || []
  );
};

const onToolIframeLoad = () => {
  toolIframeLoading.value = false;
  toolIframeReady.value = true;
  window.setTimeout(() => {
    if (
      pendingToolIframeMessage.value &&
      toolIframeRef.value?.contentWindow &&
      currentToolUrl.value
    ) {
      const iframeOrigin = new URL(currentToolUrl.value).origin;
      const message = pendingToolIframeMessage.value;
      pendingToolIframeMessage.value = null;
      toolIframeRef.value.contentWindow.postMessage(
        {
          type: message.type,
          payload: message.payload,
          optId: message.optId,
        },
        iframeOrigin,
        message.transfer || []
      );
      pendingToolZipDelivery.value = false;
      return;
    }

    if (pendingToolZipDelivery.value && currentToolFile.value) {
      void postCurrentToolFileToIframe().then(() => {
        pendingToolZipDelivery.value = false;
      });
    }
  }, 300);
};

const openWorkEditor = async (work: any) => {
  const opusId = String(work?.opusId || work?.id || "").trim();
  const opusOssId = String(work?.opusOssId || work?.ossId || "").trim();
  if (!opusId || !opusOssId) {
    ElMessage.warning("当前作品缺少可编辑文件");
    return;
  }

  try {
    const toolId = getHistoryOpusFileType(work) === "nous" ? "nous" : "vincibot";
    currentToolContext.value = "works";
    currentToolMessageType.value = DEFAULT_IFRAME_ZIP_MESSAGE_TYPE;
    currentToolAdditionalData.value = {};
    toolIframeReady.value = false;
    pendingToolIframeMessage.value = null;
    currentWorkOpus.value = work;
    currentToolName.value =
      toolId === "nous" ? "MatataCode (Nous)" : "MatataCode (VinciBot)";
    currentToolFile.value = await downloadFileFromOSS(
      opusOssId,
      getHistoryOpusFileName(work),
      "application/octet-stream"
    );
    pendingToolZipDelivery.value = !!currentToolFile.value;
    currentToolUrl.value = await buildToolIframeUrl(toolId);
    toolIframeLoading.value = true;
    showToolIframeModal.value = true;
  } catch (error) {
    console.error("打开作品编辑失败:", error);
    ElMessage.error("打开作品编辑失败");
  }
};

const loadExerciseList = async () => {
  exerciseLoading.value = true;
  try {
    const result = await getExerciseListPage({
      chapterId: String(props.chapterId || ""),
      pageSize: exercisePageSize.value,
      pageNum: exercisePageNum.value,
    });

    const sourceRows = Array.isArray(result?.rows) ? result.rows : [];
    const filteredRows = exerciseKeyword.value
      ? sourceRows.filter((item: any) =>
          String(item?.exerciseName || "")
            .toLowerCase()
            .includes(exerciseKeyword.value.toLowerCase())
        )
      : sourceRows;

    const rows = filteredRows.map((item: any) => ({
      id: String(item.exerciseId || item.id || ""),
      exerciseName: item.exerciseName || "-",
      questionCount: item.questionCount || 0,
      totalScore: item.totalScore || 0,
      hasLiteracy: Number(item.updateStatus) === 1,
      linked:
        item?.isBind !== undefined && item?.isBind !== null
          ? normalizeBindState(item.isBind)
          : linkedExerciseIdsState.value.includes(
              String(item.exerciseId || item.id || "")
            ),
    }));
    exerciseRows.value = rows;
    exerciseTotal.value = exerciseKeyword.value
      ? filteredRows.length
      : Number(result?.total || filteredRows.length || 0);
  } catch (error) {
    console.error("加载自定义练习题失败:", error);
    exerciseRows.value = [];
    exerciseTotal.value = 0;
  } finally {
    exerciseLoading.value = false;
  }
};

const handleExerciseSearch = async () => {
  exercisePageNum.value = 1;
  await loadExerciseList();
};

const changeExercisePage = async (page: number) => {
  if (page < 1 || page === exercisePageNum.value) return;
  exercisePageNum.value = page;
  await loadExerciseList();
};

const handleLinkExercise = async (row: any) => {
  if (!props.chapterId) {
    ElMessage.warning("缺少章节ID");
    return;
  }
  try {
    await api.bindExerciseChapter({
      exerciseId: row.id,
      type: 1,
      chapterIds: [String(props.chapterId)],
    });
    if (!linkedExerciseIdsState.value.includes(String(row.id))) {
      linkedExerciseIdsState.value.push(String(row.id));
    }
    row.linked = true;
    ElMessage.success("关联成功");
    await loadExerciseList();
  } catch (error) {
    console.error("关联练习题失败:", error);
    ElMessage.error("关联练习题失败");
  }
};

const handleUnlinkExercise = async (row: any) => {
  if (!props.chapterId) {
    ElMessage.warning("缺少章节ID");
    return;
  }
  try {
    await api.bindExerciseChapter({
      exerciseId: row.id,
      type: 2,
      chapterIds: [String(props.chapterId)],
    });
    linkedExerciseIdsState.value = linkedExerciseIdsState.value.filter(
      (id) => id !== String(row.id)
    );
    row.linked = false;
    ElMessage.success("取消关联成功");
    await loadExerciseList();
  } catch (error) {
    console.error("取消关联练习题失败:", error);
    ElMessage.error("取消关联练习题失败");
  }
};

const handleConfigLiteracy = (row: any) => {
  currentExerciseRow.value = row;
  currentLiteracyRow.value = row;
  literacySourceType.value = "exercise";
  literacyModalVisible.value = true;
};

const handleLiteracyConfigConfirm = async (data: {
  configList: Array<{
    questionId: string | number;
    quotaIds: Array<string | number>;
  }>;
}) => {
  try {
    if (literacySourceType.value === "resource") {
      const resourceId = String(
        currentLiteracyRow.value?.resourceId || currentLiteracyRow.value?.id || ""
      ).trim();
      if (!resourceId) {
        ElMessage.warning("当前资源缺少 resourceId");
        return;
      }

      await saveLiteracyConfig({
        objectType: 2,
        configList: data.configList.map((item) => ({
          objectId: item.questionId,
          quotaIds: item.quotaIds || [],
        })),
      });

      linkedWorkResourcesState.value = linkedWorkResourcesState.value.map((item: any) =>
        String(item?.resourceId || "") === resourceId
          ? { ...item, updateStatus: 1 }
          : item
      );
      await loadWorksList(
        String(currentWorkRow.value?.opusId || currentWorkRow.value?.id || "")
      );
    } else {
      await api.saveExercise({
        configList: data.configList,
      });
      if (currentExerciseRow.value) {
        currentExerciseRow.value.hasLiteracy = true;
      }
      await loadExerciseList();
    }
    literacyModalVisible.value = false;
    ElMessage.success("保存成功");
  } catch (error) {
    console.error("保存素养评价配置失败:", error);
    ElMessage.error("保存素养评价配置失败");
  }
};

const handleCreateExercise = () => {
  emit("update:visible", false);
  router.push("/taskmanagement/add-custom-question");
};

const handleToolIframeMessage = async (event: MessageEvent) => {
  if (
    !isMessageFromIframe({
      event,
      iframeWindow: toolIframeRef.value?.contentWindow,
      iframeUrl: currentToolUrl.value,
    })
  ) {
    return;
  }

  const messageData = parseMessageData(event.data) as any;
  const messageType = getMessageType(messageData);

  if (
    !messageData ||
    (typeof messageData !== "object" && typeof messageData !== "string")
  ) {
    return;
  }

  if (messageType === "close-ai-embedded") {
    closeToolIframeModal();
    return;
  }

  if (messageType === "saveProject") {
    const zipPayload = pickMessagePayload(messageData, [
      "payload",
      "data",
      "file",
      "blob",
      "arrayBuffer",
      "result",
    ]);
    const zipFile = toZipFile(zipPayload);
    if (!zipFile) return;
    return;
  }

  if (currentToolContext.value === "ai" && messageType === TM_ZIP_RESPONSE_MESSAGE_TYPE) {
    const zipPayload = pickMessagePayload(messageData, [
      "payload",
      "data",
      "file",
      "blob",
      "arrayBuffer",
      "result",
    ]);
    const uploadFile = toUploadFile(zipPayload, pickMessageFileName(messageData));
    if (!uploadFile || !currentMaterialTool.value) {
      ElMessage.error("模型文件格式不正确");
      return;
    }
    if (savingAiModel.value || isHandlingToolTmZip.value) {
      return;
    }

    isHandlingToolTmZip.value = true;
    savingAiModel.value = true;
    try {
      const saveMode = currentEditingMaterialModelId.value ? "edit" : "create";
      const pendingModelId =
        currentEditingMaterialModelId.value ||
        `material-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const projectName =
        (typeof messageData?.projectName === "string" &&
          messageData.projectName.trim()) ||
        currentMaterialProjectName.value.trim() ||
        uploadFile.name.replace(/\.[^.]+$/, "");

      console.log("收到 AI iframe send-tm-zip，准备写入本地模型库:", {
        mode: saveMode,
        origin: event.origin,
        type: messageType,
        rawData: event.data,
        data: messageData,
        payload: zipPayload,
        uploadFile,
        modelId: pendingModelId,
        projectName,
        toolKey: currentMaterialTool.value.key,
      });

      if (currentEditingMaterialOssId.value) {
        try {
          await deleteOss(currentEditingMaterialOssId.value);
        } catch (error) {
          console.warn("删除旧AI模型 OSS 失败，继续上传新文件:", error);
        }
      }

      const uploadResult = await uploadOSS(uploadFile);
      const userId = getCurrentUserId();
      const optType = currentMaterialTool.value.optType;
      const optName = projectName;

      if (!uploadResult?.ossId || !userId || !optType) {
        throw new Error("模型保存参数不完整");
      }

      let finalModelId = currentEditingMaterialModelId.value;
      if (currentEditingMaterialModelId.value) {
        await updateAi({
          optId: currentEditingMaterialModelId.value,
          optName,
          optType,
          userId,
          ossId: uploadResult.ossId,
        });
        finalModelId = currentEditingMaterialModelId.value;
      } else {
        const createResult = await createAi({
          optName,
          optType,
          userId,
          ossId: uploadResult.ossId,
        });
        finalModelId = String(createResult?.optId || createResult?.id || "");
      }

      currentEditingMaterialModelId.value = finalModelId;
      currentEditingMaterialOssId.value = String(uploadResult.ossId);
      currentMaterialProjectName.value = optName;
      if (activeResourceTab.value === "material" && props.visible) {
        await loadAiTrainingResources();
      }
      ElMessage.success(
        finalModelId && currentToolMessageType.value === TM_ZIP_RECEIVE_MESSAGE_TYPE
          ? "编辑成功"
          : "创建成功"
      );
      closeToolIframeModal();
    } catch (error) {
      console.error("保存AI模型失败:", error);
      ElMessage.error(error instanceof Error ? error.message : "保存AI模型失败");
    } finally {
      savingAiModel.value = false;
      isHandlingToolTmZip.value = false;
    }
    return;
  }

  if (messageType !== "send-works-sb3" && messageType !== "send-works-mc") {
    return;
  }

  if (!currentWorkOpus.value?.opusId || savingWorkOpus.value) {
    return;
  }

  const worksPayload = pickMessagePayload(messageData, [
    "payload",
    "data",
    "file",
    "blob",
    "arrayBuffer",
  ]) as any;

  const nestedPayload =
    worksPayload &&
    typeof worksPayload === "object" &&
    !(worksPayload instanceof File) &&
    !(worksPayload instanceof Blob) &&
    !(worksPayload instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(worksPayload)
      ? worksPayload
      : null;

  const workFilePayload = nestedPayload
    ? messageType === "send-works-mc"
      ? nestedPayload.mc || nestedPayload.file || nestedPayload.payload
      : nestedPayload.sb3 || nestedPayload.file || nestedPayload.payload
    : worksPayload;

  const coverFile = nestedPayload?.cover instanceof File ? nestedPayload.cover : null;
  const workFile = toWorkFile(
    workFilePayload,
    pickMessageFileName(messageData),
    messageType === "send-works-mc" ? ".mc" : ".sb3"
  );

  if (!workFile || !coverFile) {
    if (!coverFile) {
      ElMessage.warning("当前作品缺少封面文件，无法保存");
    }
    return;
  }

  savingWorkOpus.value = true;
  try {
    const {
      opusOssId,
      coverOssId,
      opusId,
      opusGuide,
      opusDesc,
      opusName,
    } = currentWorkOpus.value;
    if (opusOssId) {
      try {
        await deleteOss(String(opusOssId));
      } catch (error) {
        console.warn("删除旧作品 OSS 失败，继续上传新文件:", error);
      }
    }

    if (coverOssId && coverOssId !== opusOssId) {
      try {
        await deleteOss(String(coverOssId));
      } catch (error) {
        console.warn("删除旧封面 OSS 失败，继续上传新文件:", error);
      }
    }

    const uploadResult = await uploadOSS(workFile);
    const coverUploadResult = await uploadOSS(coverFile);
    const nextOpusName =
      (typeof messageData?.projectName === "string" && messageData.projectName.trim()) ||
      opusName ||
      workFile.name.replace(/\.[^.]+$/, "");
    const nextOpusType = getHistoryOpusFileType(currentWorkOpus.value);

    await editOpus({
      opusId: String(opusId),
      opusName: nextOpusName,
      opusOssId: String(uploadResult.ossId),
      coverOssId: String(coverUploadResult.ossId),
      opusType: nextOpusType,
      opusGuide,
      opusDesc,
    } as any);

    ElMessage.success("作品保存成功");
    closeToolIframeModal();
    await loadWorksList(String(opusId));
  } catch (error) {
    console.error("保存作品失败:", error);
    ElMessage.error("保存作品失败");
  } finally {
    savingWorkOpus.value = false;
  }
};

watch(
  () => props.linkedExerciseIds,
  (value) => {
    linkedExerciseIdsState.value = (value || []).map((id) => String(id));
  },
  { immediate: true }
);

watch(
  () => props.linkedWorkResources,
  (value) => {
    linkedWorkResourcesState.value = Array.isArray(value) ? [...value] : [];
  },
  { immediate: true }
);

watch(
  () => props.visible,
  async (val) => {
    if (!val) {
      activeMaterialMenuId.value = "";
      showMaterialCreateModal.value = false;
      currentMaterialTool.value = null;
      closeMaterialRenameModal();
      return;
    }
    if (activeResourceTab.value === "aiTraining") {
      selectedIds.value = [];
      await loadAiTrainingLinkedState();
    }
    if (activeResourceTab.value === "material") {
      const categoryChanged = ensureActiveCategoryForTab(activeResourceTab.value);
      selectedIds.value = [];
      if (categoryChanged) return;
      await loadAiTrainingResources();
    }
    if (activeResourceTab.value === "works") {
      await loadWorksList();
    }
    if (activeResourceTab.value === "exercise") {
      await loadExerciseList();
    }
  }
);

watch(
  () => activeResourceTab.value,
  async (val) => {
    activeMaterialMenuId.value = "";
    showMaterialCreateModal.value = false;
    currentMaterialTool.value = null;
    closeMaterialRenameModal();
    if (val === "aiTraining" && props.visible) {
      selectedIds.value = [];
      await loadAiTrainingLinkedState();
    }
    if (val === "material" && props.visible) {
      const categoryChanged = ensureActiveCategoryForTab(val);
      selectedIds.value = [];
      if (categoryChanged) return;
      await loadAiTrainingResources();
    }
    if (val === "works" && props.visible) {
      worksPageNum.value = 1;
      await loadWorksList();
    }
    if (val === "exercise" && props.visible) {
      exercisePageNum.value = 1;
      console.log("切换到关联自定义练习题，开始请求 getExerciseListPage");
      await loadExerciseList();
    }
  }
);

watch(
  () => activeCategory.value,
  async () => {
    activeMaterialMenuId.value = "";
    showMaterialCreateModal.value = false;
    currentMaterialTool.value = null;
    closeMaterialRenameModal();
    if (activeResourceTab.value === "aiTraining" && props.visible) {
      selectedIds.value = [];
      await loadAiTrainingLinkedState();
      return;
    }
    if (activeResourceTab.value !== "material" || !props.visible) {
      return;
    }
    selectedIds.value = [];
    await loadAiTrainingResources();
  }
);

watch(
  () => activeWorksTool.value,
  async () => {
    if (activeResourceTab.value !== "works" || !props.visible) return;
    worksPageNum.value = 1;
    await loadWorksList();
  }
);

const handleClose = () => {
  activeMaterialMenuId.value = "";
  showMaterialCreateModal.value = false;
  currentMaterialTool.value = null;
  closeMaterialRenameModal();
  emit("update:visible", false);
};

const toggleSelect = async (item: Resource) => {
  activeMaterialMenuId.value = "";
  if (
    activeResourceTab.value !== "aiTraining" &&
    activeResourceTab.value !== "material"
  ) {
    return;
  }

  if (!props.chapterId) {
    ElMessage.warning("缺少章节ID");
    return;
  }

  if (activeResourceTab.value === "aiTraining") {
    const optType = getAiTrainingOptTypeByCategory(item.category);
    if (!optType) {
      ElMessage.warning("当前资源缺少 optType");
      return;
    }

    if (aiResourceActionLoadingIds.value.includes(optType)) {
      return;
    }

    aiResourceActionLoadingIds.value.push(optType);
    const nextLinked = !item.linked;
    try {
      await toggleChapterOptNoModel({
        optType,
        chapterId: String(props.chapterId),
        type: nextLinked ? 1 : 2,
      });

      if (nextLinked) {
        if (!aiTrainingLinkedOptTypes.value.includes(optType)) {
          aiTrainingLinkedOptTypes.value.push(optType);
        }
      } else {
        aiTrainingLinkedOptTypes.value = aiTrainingLinkedOptTypes.value.filter(
          (value) => value !== optType
        );
      }
      markResourceSelected(item.id, nextLinked);
      ElMessage.success(nextLinked ? "关联成功" : "取消关联成功");
    } catch (error) {
      console.error(
        nextLinked ? "关联AI实训资源失败:" : "取消关联AI实训资源失败:",
        error
      );
      ElMessage.error(nextLinked ? "关联失败" : "取消关联失败");
    } finally {
      aiResourceActionLoadingIds.value = aiResourceActionLoadingIds.value.filter(
        (id) => id !== optType
      );
    }
    return;
  }

  const optId = getAiResourceOptId(item);
  if (!optId) {
    ElMessage.warning("当前资源缺少 optId");
    return;
  }

  if (aiResourceActionLoadingIds.value.includes(optId)) {
    return;
  }

  aiResourceActionLoadingIds.value.push(optId);
  const nextLinked = !item.linked;
  try {
    await toggleChapterOpt({
      optId,
      chapterId: String(props.chapterId),
      type: nextLinked ? 1 : 2,
    });

    item.linked = nextLinked;
    if (item.raw && typeof item.raw === "object") {
      item.raw.isBind = nextLinked ? 1 : 0;
    }
    markResourceSelected(item.id, nextLinked);
    ElMessage.success(nextLinked ? "关联成功" : "取消关联成功");
  } catch (error) {
    console.error(nextLinked ? "关联AI资源失败:" : "取消关联AI资源失败:", error);
    ElMessage.error(nextLinked ? "关联失败" : "取消关联失败");
  } finally {
    aiResourceActionLoadingIds.value = aiResourceActionLoadingIds.value.filter(
      (id) => id !== optId
    );
  }
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      window.addEventListener("message", handleToolIframeMessage);
      document.addEventListener("click", handleDocumentClick);
    } else {
      window.removeEventListener("message", handleToolIframeMessage);
      document.removeEventListener("click", handleDocumentClick);
      activeMaterialMenuId.value = "";
      closeToolIframeModal();
    }
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("message", handleToolIframeMessage);
  document.removeEventListener("click", handleDocumentClick);
});
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
  height: min(820px, 85vh);
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
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tip-text {
  font-size: 14px;
  color: #333;
  margin: 0 0 20px 0;
  flex-shrink: 0;
}

.resource-type-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-shrink: 0;
}

.works-toolbar {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 18px;
}

.works-tool-tabs {
  display: flex;
  gap: 10px;
}

.works-tool-tab {
  min-width: 96px;
  height: 42px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.works-tool-tab:hover {
  border-color: #ff9900;
  color: #ff9900;
}

.works-tool-tab.active {
  background: #ff9900;
  border-color: #ff9900;
  color: #fff;
}

.works-search-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.works-search-input {
  width: 320px;
  height: 42px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 0 14px;
  font-size: 14px;
  outline: none;
}

.works-search-input:focus {
  border-color: #ff9900;
}

.works-search-actions {
  display: flex;
  gap: 12px;
}

.works-search-btn {
  min-width: 116px;
  height: 42px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.works-search-btn--primary {
  border: none;
  background: #ff9900;
  color: #fff;
}

.works-search-btn--primary:hover {
  background: #e68a00;
}

.works-search-btn--ghost {
  border: 1px solid #ff9900;
  background: #fff;
  color: #ff9900;
}

.works-search-btn--ghost:hover {
  background: #fff7e6;
}

.works-table-wrap {
  flex: 1;
  min-height: 0;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.works-table {
  width: 100%;
  border-collapse: collapse;
}

.works-table thead tr {
  background: #fff7e6;
}

.works-table th,
.works-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
  text-align: left;
}

.works-table th:last-child,
.works-table td:last-child {
  width: 210px;
}

.works-table th {
  font-weight: 500;
}

.works-col-select {
  width: 44px;
  text-align: center;
}

.works-table tbody {
  display: block;
  max-height: 420px;
  overflow-y: auto;
  overflow-x: hidden;
}

.works-table thead,
.works-table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.works-table tbody tr.selected {
  background: #fff7e6;
}

.works-action-group {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: nowrap;
}

.works-radio {
  display: inline-flex;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  border: 2px solid #ff9900;
  position: relative;
}

.works-radio.selected::after {
  content: "";
  position: absolute;
  inset: 3px;
  border-radius: 9999px;
  background: #ff9900;
}

.works-row-btn {
  min-width: 92px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #ff9900;
  background: #fff;
  color: #ff9900;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.works-row-btn:hover {
  background: #fff7e6;
}

.works-empty {
  text-align: center;
  color: #999;
  padding: 0 !important;
  height: 260px;
  vertical-align: middle;
}

.works-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding-top: 16px;
}

.works-pagination {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4b5563;
  font-size: 14px;
}

.works-page-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #9ca3af;
  cursor: pointer;
}

.works-page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.works-page-current {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #ff9900;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.works-submit-btn {
  min-width: 132px;
  height: 42px;
  border-radius: 10px;
  border: none;
  background: #ff9900;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(255, 153, 0, 0.18);
  transition: all 0.2s;
}

.works-submit-btn:hover {
  background: #e68a00;
}

.type-tab {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  border: 1px solid #d9d9d9;
  color: #333;
}

.type-tab:hover {
  border-color: #ff9900;
  color: #ff9900;
}

.type-tab.active {
  background: #ff9900;
  border-color: #ff9900;
  color: white;
}

.category-filter {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.filter-label {
  font-size: 14px;
  color: #666;
  margin-right: 12px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tab {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  border: 1px solid transparent;
  color: #666;
}

.category-tab:hover {
  color: #ff9900;
}

.category-tab.active {
  background: #ff9900;
  color: white;
}

.resource-scroll-area {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.resource-empty {
  height: 100%;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.exercise-search-row {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.exercise-search-box {
  position: relative;
  width: 260px;
}

.exercise-search-box input {
  width: 100%;
  padding: 10px 42px 10px 14px;
  border: 1px solid #d9e2ef;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.exercise-search-box input:focus {
  border-color: #ff9900;
}

.exercise-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #7d8da1;
  cursor: pointer;
  padding: 0;
}

.exercise-search-btn svg {
  width: 18px;
  height: 18px;
}

.exercise-table-wrap {
  flex: 1;
  min-height: 0;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.exercise-table-head,
.exercise-table-row {
  display: grid;
  grid-template-columns: 80px 1.8fr 120px 120px 250px;
  align-items: center;
}

.exercise-table-head {
  background: #fafcff;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid #edf2f7;
}

.exercise-table-head > div,
.exercise-table-row > div {
  padding: 14px 16px;
}

.exercise-table-body {
  max-height: 420px;
  overflow-y: auto;
}

.exercise-table-row {
  font-size: 14px;
  color: #1f2937;
  border-bottom: 1px solid #f3f4f6;
}

.exercise-table-row:last-child {
  border-bottom: none;
}

.exercise-empty {
  padding: 80px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
}

.action-btn {
  min-width: 88px;
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn--link {
  border: 1px solid #ff9900;
  background: #fff;
  color: #ff9900;
}

.action-btn--link:hover {
  border-color: #ff9900;
  color: #ff9900;
  background: #fff7e6;
}

.action-btn--unlink,
.action-btn--config {
  border: 1px solid #ff9900;
  background: #fff;
  color: #ff9900;
}

.action-btn--unlink:hover,
.action-btn--config:hover {
  background: #fff7e6;
}

.action-btn--config-idle {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #4b5563;
}

.action-btn--config-idle:hover {
  background: #f9fafb;
}

.exercise-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 0 8px;
  color: #4b5563;
  font-size: 14px;
}

.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d9e2ef;
  border-radius: 6px;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-current {
  min-width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #ff9900;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding-bottom: 10px;
}

.resource-card {
  position: relative;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.resource-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  border: 2px solid transparent;
  pointer-events: none;
  transition: all 0.2s;
}

.resource-card--create {
  min-height: 244px;
  background: #fff;
  border: 2px dashed #cfe8ff;
  padding: 0;
  display: block;
}

.resource-card--create::after {
  display: none;
}

.resource-card--material {
  overflow: visible;
}

.resource-card--create:hover {
  border-color: #7dc2ff;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.16);
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-card.selected {
}

.resource-card.selected::after {
  border-color: #ff9900;
}

.resource-card--loading {
  pointer-events: none;
  opacity: 0.72;
}

.resource-create-body {
  min-height: 244px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.resource-create-icon {
  font-size: 72px;
  line-height: 1;
  color: #40a9ff;
  font-weight: 300;
}

.resource-create-text {
  color: #333;
  font-size: 16px;
}

.card-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.card-image--material {
  background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
}

.card-image--ai-training {
  background: linear-gradient(180deg, #f7fbff 0%, #eef5ff 100%);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-img--material {
  object-fit: contain;
  padding: 12px;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #fff1df 0%, #ffe7bf 100%);
  color: #a46300;
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
}

.tag {
  position: absolute;
  padding: 2px 8px;
  font-size: 12px;
  color: white;
  border-radius: 2px;
}

.tag-new {
  top: 8px;
  left: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
}

.tag-linked {
  top: 8px;
  left: 8px;
  background: #409eff;
}

.tag-exp {
  top: 8px;
  right: 8px;
  background: #ff7a45;
}

.card-info {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  position: relative;
  border-radius: 0 0 12px 12px;
}

.card-info--with-description {
  align-items: flex-start;
  min-height: 86px;
}

.card-text-group {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-name {
  font-size: 14px;
  color: #333;
}

.card-name--ai-training {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}

.card-desc {
  font-size: 12px;
  color: #8a94a6;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-more {
  position: relative;
  flex-shrink: 0;
}

.card-more-trigger {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #a5b4cc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
}

.card-more-trigger:hover {
  background: #f5f9ff;
  color: #7f8ea3;
}

.card-more-trigger span {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: currentColor;
  display: block;
}

.material-card-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: -8px;
  width: 144px;
  padding: 8px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
  z-index: 30;
}

.material-card-menu::before {
  content: "";
  position: absolute;
  top: -6px;
  right: 18px;
  width: 12px;
  height: 12px;
  background: #fff;
  transform: rotate(45deg);
}

.material-card-menu-item {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.material-card-menu-item:hover {
  background: #f8fafc;
}

.material-card-menu-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.material-card-menu-item--danger {
  color: #334155;
}

.material-card-menu-item.is-disabled,
.material-card-menu-item:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.material-card-menu-item.is-disabled:hover,
.material-card-menu-item:disabled:hover {
  background: transparent;
}

.material-rename-overlay {
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.12);
}

.material-create-overlay {
  position: fixed;
  inset: 0;
  z-index: 2250;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.22);
}

.material-create-modal {
  width: min(620px, calc(100vw - 48px));
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.material-create-modal__header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #ffab1f 0%, #ff9900 100%);
}

.material-create-modal__title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.material-create-modal__close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.material-create-modal__close:hover {
  background: rgba(255, 255, 255, 0.14);
}

.material-create-modal__close svg {
  width: 16px;
  height: 16px;
}
.material-create-modal__footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 18px 20px 20px;
}

.material-create-modal__btn--ghost {
  min-width: 120px;
  height: 40px;
  padding: 0 18px;
  border: 1px solid #d7dbe3;
  border-radius: 8px;
  background: #fff;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.material-create-modal__btn--ghost:hover {
  border-color: #ff9900;
  color: #ff9900;
  background: #fffaf0;
}

.material-create-modal__body {
  padding: 22px 20px 8px;
}

.material-create-form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.material-create-form-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.material-create-form-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d7dbe3;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  color: #1f2937;
  transition: all 0.2s;
}

.material-create-form-input:focus {
  border-color: #ff9900;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.12);
}

.material-create-modal__btn--primary {
  min-width: 120px;
  height: 40px;
  padding: 0 18px;
  border: 1px solid #ff9900;
  border-radius: 8px;
  background: #ff9900;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.material-create-modal__btn--primary:hover {
  background: #e68a00;
  border-color: #e68a00;
}

.material-rename-modal {
  width: min(440px, calc(100vw - 48px));
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.material-rename-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 10px;
}

.material-rename-modal__title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.material-rename-modal__close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.material-rename-modal__close:hover {
  background: #fff7e6;
  color: #ff9900;
}

.material-rename-modal__close svg {
  width: 16px;
  height: 16px;
}

.material-rename-modal__body {
  padding: 0 20px 4px;
}

.material-rename-modal__desc {
  margin: 0 0 12px;
  font-size: 14px;
  color: #6b7280;
}

.material-rename-modal__input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: all 0.2s;
}

.material-rename-modal__input:focus {
  border-color: #ff9900;
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.12);
}

.material-rename-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 20px 20px;
}

.material-rename-modal__btn {
  min-width: 72px;
  height: 36px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.material-rename-modal__btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.material-rename-modal__btn--ghost {
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #666;
}

.material-rename-modal__btn--ghost:hover:not(:disabled) {
  border-color: #ff9900;
  color: #ff9900;
  background: #fffaf0;
}

.material-rename-modal__btn--primary {
  border: 1px solid #ff9900;
  background: #ff9900;
  color: #fff;
}

.material-rename-modal__btn--primary:hover:not(:disabled) {
  border-color: #e68a00;
  background: #e68a00;
}

.linked-tag {
  padding: 2px 8px;
  background: #fff7e6;
  color: #ff9900;
  font-size: 12px;
  border-radius: 4px;
}

.modal-footer {
  padding: 16px 32px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn-close {
  padding: 10px 60px;
  background: #ff9900;
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e68a00;
}

.btn-create {
  padding: 10px 24px;
  background: #fff;
  border: 1px solid #ff9900;
  border-radius: 10px;
  color: #ff9900;
  font-size: 14px;
  cursor: pointer;
}

.btn-create:hover {
  background: #fff7e6;
}

.iframe-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(15, 23, 42, 0.42);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.iframe-modal-container {
  width: min(1280px, calc(100vw - 48px));
  height: min(840px, calc(100vh - 48px));
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
}

.iframe-modal-header {
  height: 56px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 0 20px;
  flex-shrink: 0;
}

.iframe-modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.iframe-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.iframe-close-btn:hover {
  background: #f8fafc;
  color: #475569;
}

.iframe-modal-body {
  position: relative;
  flex: 1;
  background: #f8fafc;
}

.tool-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: #fff;
}

.tool-iframe.hidden {
  opacity: 0;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #64748b;
  background: linear-gradient(
    180deg,
    rgba(248, 250, 252, 0.96),
    rgba(248, 250, 252, 0.88)
  );
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #ffe0b2;
  border-top-color: #ff9900;
  animation: tool-iframe-spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
}

@keyframes tool-iframe-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
