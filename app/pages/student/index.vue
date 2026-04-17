<template>
  <div class="student-home-page">
    <!-- 上课通知弹窗 -->
    <Teleport to="body">
      <div v-if="showClassNotification" class="class-notification-overlay">
        <div class="class-notification-modal">
          <div class="notification-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF9900"
              stroke-width="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h2 class="notification-title">老师开始上课啦！</h2>
          <p class="notification-desc">{{ classInfo.className || "课堂" }} 正在进行中</p>
          <!-- <div class="notification-actions">
            <button class="btn-later" @click="laterEnter">稍后进入</button>
            <button class="btn-enter" @click="enterClassroom">立即进入</button>
          </div> -->
        </div>
      </div>
    </Teleport>

    <div class="student-home-shell">
      <header class="student-home-header">
        <NuxtLink to="/student" class="student-home-logo">
          <img :src="studentLogo" alt="玛塔创想AI智学云" />
        </NuxtLink>

        <div class="student-home-actions">
          <div class="student-user-entry" ref="dropdownRef">
            <button type="button" class="student-user-trigger" @click="toggleDropdown">
              <img
                :src="resolvedAvatar"
                alt="用户头像"
                class="student-user-avatar"
                @error="handleAvatarError"
              />
              <span class="student-user-name">{{ displayUserName }}</span>
            </button>

            <Transition name="dropdown">
              <div v-if="showDropdown" class="student-user-dropdown">
                <div class="student-user-dropdown-head">
                  <p class="student-user-dropdown-name">{{ displayUserName }}</p>
                </div>

                <button
                  v-if="showModuleSwitch"
                  type="button"
                  class="student-user-dropdown-item"
                  @click="handleModuleSwitch"
                >
                  模块切换
                </button>
                <button
                  type="button"
                  class="student-user-dropdown-item"
                  @click="handleProfile"
                >
                  个人中心
                </button>
                <button
                  type="button"
                  class="student-user-dropdown-item student-user-dropdown-item--danger"
                  @click="handleLogout"
                >
                  退出登录
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- 两栏布局容器 -->
      <div class="main-content">
        <!-- 左侧 - 学习与任务中心 -->
        <aside class="left-panel">
          <div
            class="learning-center-card"
            :style="learningCenterCardStyle"
            @click="goLessonsRecord"
          >
            <div class="learning-center-title">学习与任务中心</div>

            <div class="learning-center-stack">
              <div class="learning-center-item">
                <div class="learning-center-label">上次课程</div>
                <div class="learning-center-value learning-center-value--chapter">
                  {{ learningCenterData.chapterName }}
                </div>
              </div>

              <div class="learning-center-item">
                <div class="learning-center-label">未完成任务</div>
                <div class="learning-center-value">
                  {{ learningCenterData.unCommitTaskNum }} 个
                </div>
              </div>

              <div class="learning-center-item">
                <div class="learning-center-label">未完成评测</div>
                <div class="learning-center-value">
                  {{ learningCenterData.unCommitTestNum }} 个
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 右侧大区域 -->
        <div class="right-area">
          <div class="student-top-panels">
            <div class="tool-card student-panel-card">
              <div class="student-panel-title">玛塔工具中心</div>
              <div class="student-panel-icons">
                <button
                  v-for="item in studentDashboardToolCards"
                  :key="item.key"
                  type="button"
                  class="student-panel-icon"
                  @click="handleOpenTool(item.key)"
                >
                  <div class="student-panel-icon-figure">
                    <img :src="item.image" :alt="item.label" />
                  </div>
                  <span class="student-panel-icon-label">{{ item.label }}</span>
                </button>
              </div>
            </div>

            <div class="tool-card student-panel-card">
              <div class="student-panel-title">AI实践中心</div>
              <div class="student-panel-icons">
                <button
                  v-for="item in studentDashboardAICards"
                  :key="item.key"
                  type="button"
                  class="student-panel-icon"
                  @click="handleOpenStudentAIModal(item.key)"
                >
                  <div class="student-panel-icon-figure">
                    <img :src="item.image" :alt="item.label" />
                  </div>
                  <span class="student-panel-icon-label">{{ item.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="center-cards">
            <NuxtLink to="/student/course" class="center-card student-panel-card">
              <div class="center-card-title">课程中心</div>
              <div class="center-icon">
                <img
                  :src="studentCourseCenterIcon"
                  alt="课程中心"
                  class="w-full h-full object-contain"
                />
              </div>
            </NuxtLink>

            <div
              class="center-card student-panel-card"
              @click="handleUnavailableCenterClick"
            >
              <div class="center-card-title">测评中心</div>
              <div class="center-icon">
                <img
                  :src="studentEvaluationCenterIcon"
                  alt="测评中心"
                  class="w-full h-full object-contain"
                />
              </div>
            </div>

            <div
              class="center-card student-panel-card"
              @click="goStudyCenter"
            >
              <div class="center-card-title">学情中心</div>
              <div class="center-icon">
                <img
                  :src="studentStudyCenterIcon"
                  alt="学情中心"
                  class="w-full h-full object-contain"
                />
              </div>
            </div>

            <div
              class="center-card student-panel-card"
              @click="handleUnavailableCenterClick"
            >
              <div class="center-card-title">拓展中心</div>
              <div class="center-icon">
                <img
                  :src="studentExpandCenterIcon"
                  alt="拓展中心"
                  class="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showStudentAIModelSelectModal"
      class="modal-overlay"
      @click="closeStudentAIModelSelectModal"
    >
      <div class="modal-content model-select-modal" @click.stop>
        <div class="modal-header">
          <span class="modal-title">{{ currentStudentAIModel?.label || "" }}</span>
          <button class="close-btn" @click="closeStudentAIModelSelectModal">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 1l12 12M13 1l-12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body model-select-body">
          <div class="model-select-section">
            <div class="model-select-section-head">
              <div>
                <div class="model-select-section-title">新建模型</div>
                <div class="model-select-section-desc">
                  从空白开始创建一个新的模型项目。
                </div>
              </div>
              <button class="btn-confirm model-select-create-btn" @click="openStudentAICreateModal">
                创建项目
              </button>
            </div>
          </div>

          <div class="model-select-section">
            <div class="model-select-section-head model-select-section-head--stack">
              <div class="model-select-section-title-row">
                <div class="model-select-section-title">我的模型</div>
                <span v-if="savedStudentAIModels.length" class="model-select-count">
                  {{ savedStudentAIModels.length }}
                </span>
              </div>
              <div class="model-select-section-desc">继续编辑你已创建的模型。</div>
            </div>

            <div v-if="savedStudentAIModelsLoading" class="model-list-empty">加载中...</div>
            <div v-else-if="!savedStudentAIModels.length" class="model-list-empty">
              暂无已创建模型
            </div>
            <div v-else class="model-card-grid">
              <div
                v-for="item in savedStudentAIModels"
                :key="item.id"
                class="model-card"
                @click="handleOpenStudentAISavedModel(item)"
              >
                <button
                  class="model-card-delete"
                  type="button"
                  @click.stop="handleDeleteStudentAISavedModel(item)"
                >
                  删除
                </button>
                <div class="model-card-cover">
                  <img :src="getSavedStudentAIModelCover(item.toolKey)" alt="" />
                </div>
                <div class="model-card-body">
                  <div class="model-card-name">{{ item.name }}</div>
                  <div class="model-card-time">
                    {{ item.updatedAt ? formatSavedStudentAIModelTime(item.updatedAt) : "-" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer modal-footer--single">
          <button class="btn-cancel" @click="closeStudentAIModelSelectModal">取消</button>
        </div>
      </div>
    </div>

    <div
      v-if="showStudentAICreateModal"
      class="modal-overlay"
      @click="closeStudentAICreateModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <span class="modal-title">
            {{ currentStudentAIModel ? `新建${currentStudentAIModel.label}` : "新建模型" }}
          </span>
          <button class="close-btn" @click="closeStudentAICreateModal">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 1l12 12M13 1l-12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-item">
            <span class="form-label">名称</span>
            <input
              v-model="studentAIModelName"
              type="text"
              class="form-input"
              placeholder="请输入模型名称"
              @keyup.enter="handleStudentAIConfirm"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeStudentAICreateModal">取消</button>
          <button class="btn-confirm" @click="handleStudentAIConfirm">确定</button>
        </div>
      </div>
    </div>

    <div
      v-if="showWorkbenchIframeModal"
      class="iframe-modal-overlay"
      @click.self="closeWorkbenchIframeModal"
    >
      <div class="iframe-modal-container">
        <div class="iframe-modal-header">
          <span class="iframe-modal-title">{{ currentWorkbenchName || "工作台" }}</span>
          <button class="iframe-close-btn" @click="closeWorkbenchIframeModal">
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
          <div v-if="workbenchIframeLoading" class="iframe-loading">
            <div class="loading-spinner"></div>
            <span class="loading-text">加载中...</span>
          </div>
          <iframe
            ref="workbenchIframeRef"
            :src="currentWorkbenchUrl"
            class="tool-iframe"
            :class="{ hidden: workbenchIframeLoading }"
            frameborder="0"
            allowfullscreen
            allow="camera; microphone; bluetooth; serial"
            @load="onWorkbenchIframeLoad"
          />
        </div>
      </div>
    </div>

    <button
      v-if="showBackToClassroomEntry"
      class="back-classroom-entry"
      @click="goBackToClassroom"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>返回课堂</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ElMessageBox } from "element-plus";
import { useAuth } from "~/composables/api/useAuth";
import { aiAdmin } from "~/composables/api/ai";
import { personalcenterApi } from "~/composables/api/personalcenter";
import { student } from "~/composables/api/student";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";
import { ElMessage } from "~/components/ui";
import defaultAvatar from "~/assets/newimages/user.png";
import studentLogo from "~/assets/newimages/logo.svg";
import tool2Icon from "~/assets/images/tool2.png";
import tool1Icon from "~/assets/images/tool1.png";
import tool4Icon from "~/assets/images/too4.png";
import aigcCover1 from "~/assets/images/1.svg";
import aigcCover2 from "~/assets/images/2.svg";
import aigcCover3 from "~/assets/images/3.svg";
import aigcCover4 from "~/assets/images/4.svg";
import studentCourseCenterIcon from "~/assets/newimages/1.png";
import studentEvaluationCenterIcon from "~/assets/newimages/2.png";
import studentStudyCenterIcon from "~/assets/newimages/3.png";
import studentExpandCenterIcon from "~/assets/newimages/4.png";
import learningCenterBg from "~/assets/newimages/bg3.png";

definePageMeta({
  layout: "blank",
});

const config = useRuntimeConfig();
const { logout, user } = useAuth();
const { ssoLogin, getAiList, createAi, updateAi, deleteAi, deleteOss } = aiAdmin();
const { addOpus, uploadOSS } = personalcenterApi();
const { getStudentList } = student();
const {
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  toZipFile,
  toWorkFile,
  toUploadFile,
  uploadFileToOSS,
  downloadFileFromOSS,
  isMessageFromIframe,
  postFileBufferToIframe,
} = useIframeFileBridge();
const router = useRouter();
const STUDENT_ONGOING_CLASSROOM_KEY = "student_ongoing_classroom";
const STUDENT_PAUSE_AUTO_ENTER_KEY = "student_pause_auto_enter_classroom";
const STUDENT_CLASS_TIMER_STATE_KEY = "student_classroom_timer_state";
const STUDENT_LESSON_ENTER_STATE_KEY = "student_classroom_lesson_enter";
const STUDENT_CLASSROOM_CONFIRM_TIMEOUT = 10000;
const STUDENT_NOTIFY_HEARTBEAT_INTERVAL = 30000;
const STUDENT_TALEMAP_URL =
  "https://www.mediafire.com/file_premium/rz1j080mpbsdhus/MatataCode-TaleMap-v1.0.0-win-x64.exe/file";

type StudentDashboardToolKey = "vincibot" | "nous" | "talemap";
type StudentDashboardAIKey =
  | "imageClassModel"
  | "gestureClassModel"
  | "voiceClassModel"
  | "poseClassModel";

type StudentDashboardAICardItem = {
  key: StudentDashboardAIKey;
  label: string;
  image: string;
};

type SavedStudentAIModelRecord = {
  id: string;
  toolKey: StudentDashboardAIKey;
  name: string;
  updatedAt: number;
  fileName: string;
  mimeType: string;
  size: number;
  zipBlob: Blob;
  ossId?: string;
  optType?: string;
  url?: string;
};

type SavedStudentAIModelListItem = {
  id: string;
  toolKey: StudentDashboardAIKey;
  name: string;
  updatedAt: number;
  fileName: string;
  mimeType: string;
  size: number;
  ossId?: string;
  optType?: string;
  url?: string;
};

const learningCenterData = reactive({
  chapterName: "暂无",
  unCommitTaskNum: 0,
  unCommitTestNum: 0,
});
const learningCenterCardStyle = {
  "--learning-center-bg": `url(${learningCenterBg})`,
} as Record<string, string>;
const showDropdown = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const studentDashboardToolCards: Array<{
  key: StudentDashboardToolKey;
  label: string;
  image: string;
}> = [
  {
    key: "vincibot",
    label: "VinciBot",
    image: tool1Icon,
  },
  {
    key: "nous",
    label: "Nous",
    image: tool2Icon,
  },
  {
    key: "talemap",
    label: "MatataCode(TaleMap)",
    image: tool4Icon,
  },
];
const studentDashboardAICards: StudentDashboardAICardItem[] = [
  {
    key: "imageClassModel",
    label: "图像分类训练",
    image: aigcCover1,
  },
  {
    key: "gestureClassModel",
    label: "手势分类训练",
    image: aigcCover2,
  },
  {
    key: "voiceClassModel",
    label: "语音分类训练",
    image: aigcCover3,
  },
  {
    key: "poseClassModel",
    label: "姿态分类训练",
    image: aigcCover4,
  },
];
const studentDashboardToolCardMap = Object.fromEntries(
  studentDashboardToolCards.map((item) => [item.key, item])
) as Record<StudentDashboardToolKey, typeof studentDashboardToolCards[number]>;
const studentDashboardAICardMap = Object.fromEntries(
  studentDashboardAICards.map((item) => [item.key, item])
) as Record<StudentDashboardAIKey, typeof studentDashboardAICards[number]>;
const STUDENT_HOME_AI_TYPE_MAP: Record<StudentDashboardAIKey, number> = {
  imageClassModel: 1,
  gestureClassModel: 2,
  voiceClassModel: 3,
  poseClassModel: 4,
};
const STUDENT_HOME_AI_OPT_TYPE_MAP: Record<StudentDashboardAIKey, string> = {
  imageClassModel: "image_cls",
  gestureClassModel: "gesture_cls",
  voiceClassModel: "audio_cls",
  poseClassModel: "pose_cls",
};
const STUDENT_AI_MODEL_DB_NAME = "mata-ai-models-db";
const STUDENT_AI_MODEL_STORE_NAME = "models";
const STUDENT_AI_TM_ZIP_RECEIVE_MESSAGE_TYPE = "receive-tm-zip";
const showWorkbenchIframeModal = ref(false);
const currentWorkbenchUrl = ref("");
const currentWorkbenchName = ref("");
const currentWorkbenchKind = ref<"tool" | "ai" | "">("");
const currentWorkbenchToolId = ref<StudentDashboardToolKey | "">("");
const currentWorkbenchAiOptType = ref("");
const currentWorkbenchAiProjectName = ref("");
const currentWorkbenchCacheKey = ref("");
const workbenchIframeLoading = ref(true);
const workbenchIframeRef = ref<HTMLIFrameElement | null>(null);
const savingWorkbench = ref(false);
const savedStudentAIProjectZipCache = new Map<string, File>();
const showStudentAIModelSelectModal = ref(false);
const showStudentAICreateModal = ref(false);
const currentStudentAIModel = ref<StudentDashboardAICardItem | null>(null);
const studentAIModelName = ref("");
const currentEditingStudentAIModelId = ref("");
const currentEditingStudentAIOssId = ref("");
const isEditingStudentAIModel = ref(false);
const savedStudentAIModels = ref<SavedStudentAIModelListItem[]>([]);
const savedStudentAIModelsLoading = ref(false);

interface StudentClassroomInfo {
  classId?: string;
  className?: string;
  teacherPeerId?: string;
  courseId?: string;
  chapterId?: string;
  chapterName?: string;
}

const firstNonEmptyString = (...values: any[]) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const displayUserName = computed(() => {
  return (
    user.value?.nickName ||
    user.value?.userName ||
    user.value?.nickname ||
    user.value?.nick_name ||
    user.value?.user_name ||
    "用户"
  );
});

const showModuleSwitch = computed(() => {
  const roleKey = user.value?.role_key;
  return roleKey === "city_admin" || roleKey === "district_admin";
});

const resolvedAvatar = computed(() => {
  const avatar = String(
    user.value?.avatar ||
    user.value?.avatarUrl ||
    user.value?.headImg ||
    user.value?.headimg ||
    ""
  ).trim();
  return avatar || defaultAvatar;
});

// 上课通知弹窗
const showClassNotification = ref(false);
const classInfo = ref<StudentClassroomInfo>({
  classId: "",
  className: "",
  teacherPeerId: "", // 教师的 PeerJS ID
  courseId: "",
  chapterId: "",
  chapterName: "",
});
const showBackToClassroomEntry = ref(false);
const hasConfirmedOngoingClassroom = ref(false);
let storedClassroomValidationTimer: ReturnType<typeof setTimeout> | null = null;

// WebSocket 连接
let notifyWs: WebSocket | null = null;
let notifyHeartbeatTimer: ReturnType<typeof setInterval> | null = null;
const signalingUrl =
  (config.public.signalingUrl as string) || "ws://192.168.0.55:8001/resource/websocket";

const loadLearningCenterData = async () => {
  try {
    const data = await getStudentList();
    const source = data || {};
    learningCenterData.chapterName = String(source.chapterName || "暂无");
    learningCenterData.unCommitTaskNum = Number(source.unCommitTaskNum ?? 0) || 0;
    learningCenterData.unCommitTestNum = Number(source.unCommitTestNum ?? 0) || 0;
  } catch (error) {
    console.error("获取学习与任务中心数据失败:", error);
  }
};

const getCurrentUserId = () => {
  if (!import.meta.client) {
    return "";
  }

  try {
    const rawUserInfo = localStorage.getItem("user_info");
    if (!rawUserInfo) {
      return "";
    }

    const userInfo = JSON.parse(rawUserInfo);
    return String(userInfo?.user_id || userInfo?.userId || userInfo?.id || "");
  } catch {
    return "";
  }
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

const buildStudentToolIframeUrl = async (toolId: "vincibot" | "nous") => {
  const baseUrl =
    toolId === "nous"
      ? String(config.public.nousCreateUrl || "").trim()
      : String(config.public.vincibotCreateUrl || "").trim();

  if (!baseUrl) {
    throw new Error("当前未配置工具地址");
  }

  const token = await getToolAccessToken();
  const lang = toolId === "vincibot" ? "zh-CN" : "zh";
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}token=${encodeURIComponent(token)}&lang=${lang}&ch=aiedu`;
};

const buildStudentAiIframeUrl = async (
  toolKey: StudentDashboardAIKey,
  projectName: string,
  optId = ""
) => {
  const type = STUDENT_HOME_AI_TYPE_MAP[toolKey];
  if (!type) {
    throw new Error("当前未配置 AI 模型类型");
  }

  const token = await getToolAccessToken();
  return `https://pre.matatalab.com/?token=${encodeURIComponent(
    token
  )}&type=${type}&projectName=${encodeURIComponent(
    projectName
  )}&lang=zh&ch=aiedu&type2=opt${optId ? `&optId=${encodeURIComponent(optId)}` : ""}`;
};

const downloadZipFile = (zipFile: File) => {
  const downloadUrl = URL.createObjectURL(zipFile);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = zipFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
};

const openStudentAIModelDb = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("当前环境不支持 IndexedDB"));
      return;
    }

    const request = window.indexedDB.open(STUDENT_AI_MODEL_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STUDENT_AI_MODEL_STORE_NAME)) {
        db.createObjectStore(STUDENT_AI_MODEL_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("打开本地模型库失败"));
  });
};

const saveStudentAIModelRecord = async (record: SavedStudentAIModelRecord) => {
  const db = await openStudentAIModelDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STUDENT_AI_MODEL_STORE_NAME, "readwrite");
    const store = transaction.objectStore(STUDENT_AI_MODEL_STORE_NAME);

    store.put(record);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error || new Error("保存本地模型失败"));
    };
  });
};

const getStudentAIModelRecord = async (modelId: string) => {
  const db = await openStudentAIModelDb();

  return new Promise<SavedStudentAIModelRecord | null>((resolve, reject) => {
    const transaction = db.transaction(STUDENT_AI_MODEL_STORE_NAME, "readonly");
    const store = transaction.objectStore(STUDENT_AI_MODEL_STORE_NAME);
    const request = store.get(modelId);

    request.onsuccess = () =>
      resolve((request.result as SavedStudentAIModelRecord | undefined) || null);
    request.onerror = () => reject(request.error || new Error("读取模型文件失败"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () =>
      reject(transaction.error || new Error("读取模型文件失败"));
  });
};

const deleteStudentAIModelRecord = async (modelId: string) => {
  const db = await openStudentAIModelDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STUDENT_AI_MODEL_STORE_NAME, "readwrite");
    const store = transaction.objectStore(STUDENT_AI_MODEL_STORE_NAME);
    const request = store.delete(modelId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error("删除本地模型失败"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () =>
      reject(transaction.error || new Error("删除本地模型失败"));
  });
};

const generateStudentAIModelId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `student-ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getStudentAICacheKey = (toolKey: StudentDashboardAIKey, modelId: string) =>
  `ai:${toolKey}:${modelId}`;

const getSavedStudentAIModelCover = (toolKey: StudentDashboardAIKey) => {
  return studentDashboardAICardMap[toolKey]?.image || aigcCover1;
};

const formatSavedStudentAIModelTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("zh-CN", {
    hour12: false,
  });
};

const getStudentAIToolKeyByOptType = (optType?: string) => {
  const toolKeyMap: Record<string, StudentDashboardAIKey> = {
    image_cls: "imageClassModel",
    gesture_cls: "gestureClassModel",
    audio_cls: "voiceClassModel",
    pose_cls: "poseClassModel",
  };

  return optType ? toolKeyMap[optType] || null : null;
};

const getStudentAIFileNameFromUrl = (url?: string, fallbackName = "project.zip") => {
  if (!url) {
    return fallbackName;
  }

  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split("/").filter(Boolean).pop();
    return lastSegment ? decodeURIComponent(lastSegment) : fallbackName;
  } catch {
    return fallbackName;
  }
};

const normalizeStudentAIModelTimestamp = (
  value: unknown,
  fallbackValue = Date.now()
) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? fallbackValue : parsed;
  }

  return fallbackValue;
};

const resetStudentAIModelState = (clearCurrentModel = true) => {
  showStudentAIModelSelectModal.value = false;
  showStudentAICreateModal.value = false;
  studentAIModelName.value = "";
  savedStudentAIModels.value = [];
  savedStudentAIModelsLoading.value = false;

  if (clearCurrentModel) {
    currentStudentAIModel.value = null;
    currentEditingStudentAIModelId.value = "";
    currentEditingStudentAIOssId.value = "";
    isEditingStudentAIModel.value = false;
  }
};

const loadSavedStudentAIModels = async () => {
  if (!currentStudentAIModel.value) {
    savedStudentAIModels.value = [];
    return;
  }

  savedStudentAIModelsLoading.value = true;

  try {
    const targetOptType = STUDENT_HOME_AI_OPT_TYPE_MAP[currentStudentAIModel.value.key] || "";
    const userId = getCurrentUserId();
    const response = await getAiList({
      optType: targetOptType,
      userId,
    });
    const list = Array.isArray(response)
      ? response
      : response?.rows || response?.list || response?.records || [];

    savedStudentAIModels.value = list
      .filter((item: any) => !targetOptType || item.optType === targetOptType)
      .map((item: any) => {
        const modelName = item.optName || item.name || item.projectName || "-";
        const toolKey =
          getStudentAIToolKeyByOptType(item.optType) || currentStudentAIModel.value?.key;

        return {
          id: String(
            item.optId || item.id || item.aiId || item.ossId || generateStudentAIModelId()
          ),
          toolKey: toolKey || currentStudentAIModel.value?.key || "imageClassModel",
          name: modelName,
          updatedAt: normalizeStudentAIModelTimestamp(
            item.updateTime || item.updatedAt || item.createTime,
            0
          ),
          fileName:
            item.fileName || getStudentAIFileNameFromUrl(item.url, `${modelName}.zip`),
          mimeType: item.mimeType || "application/octet-stream",
          size: Number(item.size || 0),
          ossId: item.ossId ? String(item.ossId) : "",
          optType: item.optType || "",
          url: item.url || "",
        } satisfies SavedStudentAIModelListItem;
      })
      .sort(
        (a: SavedStudentAIModelListItem, b: SavedStudentAIModelListItem) =>
          b.updatedAt - a.updatedAt
      );
  } catch (error) {
    console.error("加载学生首页 AI 模型列表失败:", error);
    savedStudentAIModels.value = [];
  } finally {
    savedStudentAIModelsLoading.value = false;
  }
};

const downloadStudentAIModelZipFile = async (item: SavedStudentAIModelListItem) => {
  const fallbackFileName =
    item.fileName || getStudentAIFileNameFromUrl(item.url, `${item.name || "project"}.zip`);

  if (item.url) {
    const response = await fetch(item.url);
    if (!response.ok) {
      throw new Error(`下载模型文件失败: ${response.status}`);
    }

    const blob = await response.blob();
    return new File([blob], fallbackFileName, {
      type: item.mimeType || blob.type || "application/zip",
      lastModified: item.updatedAt || Date.now(),
    });
  }

  if (item.ossId) {
    return downloadFileFromOSS(
      item.ossId,
      fallbackFileName,
      item.mimeType || "application/zip"
    );
  }

  return null;
};

const openStudentAIIframe = async (
  tool: StudentDashboardAICardItem,
  projectName: string,
  modelId: string
) => {
  currentWorkbenchKind.value = "ai";
  currentWorkbenchToolId.value = "";
  currentWorkbenchAiOptType.value = STUDENT_HOME_AI_OPT_TYPE_MAP[tool.key] || "";
  currentWorkbenchAiProjectName.value = projectName;
  currentWorkbenchName.value = tool.label;
  currentWorkbenchCacheKey.value = getStudentAICacheKey(tool.key, modelId);
  currentWorkbenchUrl.value = await buildStudentAiIframeUrl(
    tool.key,
    projectName,
    isEditingStudentAIModel.value ? modelId : ""
  );
  workbenchIframeLoading.value = true;
  showStudentAIModelSelectModal.value = false;
  showStudentAICreateModal.value = false;
  showWorkbenchIframeModal.value = true;
};

const closeWorkbenchIframeModal = () => {
  const shouldRestoreAIModelSelect =
    currentWorkbenchKind.value === "ai" && Boolean(currentStudentAIModel.value);

  showWorkbenchIframeModal.value = false;
  currentWorkbenchUrl.value = "";
  currentWorkbenchName.value = "";
  currentWorkbenchKind.value = "";
  currentWorkbenchToolId.value = "";
  currentWorkbenchAiOptType.value = "";
  currentWorkbenchAiProjectName.value = "";
  currentWorkbenchCacheKey.value = "";
  workbenchIframeLoading.value = true;
  savingWorkbench.value = false;

  if (shouldRestoreAIModelSelect) {
    showStudentAIModelSelectModal.value = true;
    void loadSavedStudentAIModels();
  }
};

const postCachedStudentAIZipToWorkbenchIframe = async () => {
  if (currentWorkbenchKind.value !== "ai" || !currentWorkbenchCacheKey.value) {
    return;
  }

  const zipFile = savedStudentAIProjectZipCache.get(currentWorkbenchCacheKey.value);
  if (!zipFile) {
    return;
  }

  await postFileBufferToIframe({
    file: zipFile,
    iframeUrl: currentWorkbenchUrl.value,
    iframeWindow: workbenchIframeRef.value?.contentWindow,
    type: STUDENT_AI_TM_ZIP_RECEIVE_MESSAGE_TYPE,
    additionalData: {
      optId: currentEditingStudentAIModelId.value || undefined,
    },
  });
};

const onWorkbenchIframeLoad = () => {
  workbenchIframeLoading.value = false;
  window.setTimeout(() => {
    void postCachedStudentAIZipToWorkbenchIframe();
  }, 300);
};

const handleOpenTool = (toolId: StudentDashboardToolKey) => {
  const tool = studentDashboardToolCardMap[toolId];
  if (!tool) {
    return;
  }

  void (async () => {
    if (toolId === "talemap") {
      window.open(STUDENT_TALEMAP_URL, "_blank");
      return;
    }

    currentWorkbenchKind.value = "tool";
    currentWorkbenchToolId.value = toolId;
    currentWorkbenchAiOptType.value = "";
    currentWorkbenchAiProjectName.value = "";
    currentWorkbenchCacheKey.value = "";
    currentWorkbenchName.value = tool.label;
    currentWorkbenchUrl.value = await buildStudentToolIframeUrl(toolId);
    workbenchIframeLoading.value = true;
    showWorkbenchIframeModal.value = true;
  })().catch((error) => {
    console.error("打开学生首页工具失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "打开工具失败");
  });
};

const handleOpenStudentAIModal = (key: StudentDashboardAIKey) => {
  const aiCard = studentDashboardAICardMap[key];
  if (!aiCard) {
    return;
  }

  currentStudentAIModel.value = aiCard;
  studentAIModelName.value = "";
  savedStudentAIModels.value = [];
  showStudentAIModelSelectModal.value = true;
  void loadSavedStudentAIModels();
};

const closeStudentAIModelSelectModal = () => {
  resetStudentAIModelState();
};

const openStudentAICreateModal = () => {
  studentAIModelName.value = "";
  showStudentAIModelSelectModal.value = false;
  showStudentAICreateModal.value = true;
};

const closeStudentAICreateModal = () => {
  showStudentAICreateModal.value = false;
  studentAIModelName.value = "";

  if (currentStudentAIModel.value) {
    showStudentAIModelSelectModal.value = true;
    return;
  }

  resetStudentAIModelState();
};

const handleStudentAIConfirm = async () => {
  if (!currentStudentAIModel.value) {
    return;
  }

  const trimmedName = studentAIModelName.value.trim();
  if (!trimmedName) {
    ElMessage.warning("请输入模型名称");
    return;
  }

  isEditingStudentAIModel.value = false;
  currentEditingStudentAIModelId.value = generateStudentAIModelId();
  currentEditingStudentAIOssId.value = "";

  try {
    await openStudentAIIframe(
      currentStudentAIModel.value,
      trimmedName,
      currentEditingStudentAIModelId.value
    );
  } catch (error) {
    console.error("打开学生首页 AI 创建弹窗失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "打开 AI 实践失败");
  }
};

const handleOpenStudentAISavedModel = async (item: SavedStudentAIModelListItem) => {
  if (!currentStudentAIModel.value) {
    return;
  }

  try {
    const cacheKey = getStudentAICacheKey(item.toolKey, item.id);
    const cachedFile = savedStudentAIProjectZipCache.get(cacheKey);
    if (cachedFile) {
      isEditingStudentAIModel.value = true;
      currentEditingStudentAIModelId.value = item.id;
      currentEditingStudentAIOssId.value = item.ossId || "";
      await openStudentAIIframe(currentStudentAIModel.value, item.name, item.id);
      return;
    }

    const localRecord = await getStudentAIModelRecord(item.id);
    if (localRecord) {
      const localFile = new File([localRecord.zipBlob], localRecord.fileName, {
        type: localRecord.mimeType || "application/octet-stream",
        lastModified: localRecord.updatedAt,
      });
      savedStudentAIProjectZipCache.set(cacheKey, localFile);
      isEditingStudentAIModel.value = true;
      currentEditingStudentAIModelId.value = item.id;
      currentEditingStudentAIOssId.value = item.ossId || localRecord.ossId || "";
      await openStudentAIIframe(currentStudentAIModel.value, item.name, item.id);
      return;
    }

    const remoteFile = await downloadStudentAIModelZipFile(item);
    if (remoteFile) {
      savedStudentAIProjectZipCache.set(cacheKey, remoteFile);
      await saveStudentAIModelRecord({
        id: item.id,
        toolKey: item.toolKey,
        name: item.name,
        updatedAt: item.updatedAt || Date.now(),
        fileName: remoteFile.name,
        mimeType: remoteFile.type || item.mimeType || "application/octet-stream",
        size: remoteFile.size,
        zipBlob: remoteFile,
        ossId: item.ossId || "",
        optType: item.optType || "",
        url: item.url || "",
      });
      isEditingStudentAIModel.value = true;
      currentEditingStudentAIModelId.value = item.id;
      currentEditingStudentAIOssId.value = item.ossId || "";
      await openStudentAIIframe(currentStudentAIModel.value, item.name, item.id);
      return;
    }

    ElMessage.error("读取模型文件失败");
  } catch (error) {
    console.error("学生首页读取 AI 模型文件失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "读取模型文件失败");
  }
};

const handleDeleteStudentAISavedModel = async (item: SavedStudentAIModelListItem) => {
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
    await deleteAi(item.id);
    await deleteStudentAIModelRecord(item.id);
    savedStudentAIProjectZipCache.delete(getStudentAICacheKey(item.toolKey, item.id));
    savedStudentAIModels.value = savedStudentAIModels.value.filter(
      (model) => model.id !== item.id
    );
    ElMessage.success("删除成功");
  } catch (error) {
    console.error("学生首页删除 AI 模型失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "删除失败");
  }
};

const handleWorkbenchToolMessage = async (messageData: any, messageType: string) => {
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
    if (!zipFile) {
      return;
    }

    try {
      downloadZipFile(zipFile);
      ElMessage.success(`项目已下载：${zipFile.name}`);
    } catch (error) {
      console.error("下载学生首页项目文件失败:", error);
      ElMessage.error("下载项目文件失败");
    }
    return;
  }

  if (messageType !== "send-works-sb3" && messageType !== "send-works-mc") {
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

  if (!workFile) {
    return;
  }

  if (!coverFile) {
    ElMessage.warning("当前作品缺少封面文件，无法保存");
    return;
  }

  if (savingWorkbench.value) {
    return;
  }

  savingWorkbench.value = true;
  try {
    const uploadResult = await uploadFileToOSS(workFile, "上传作品文件失败");
    const coverUploadResult = await uploadOSS(coverFile);
    const opusName =
      (typeof messageData?.projectName === "string" && messageData.projectName.trim()) ||
      workFile.name.replace(/\.[^.]+$/, "");
    const opusType = currentWorkbenchToolId.value === "nous" ? "nous" : "vinci";

    if (!uploadResult?.ossId || !coverUploadResult?.ossId) {
      throw new Error("作品保存参数不完整");
    }

    await addOpus({
      opusName,
      opusOssId: String(uploadResult.ossId),
      coverOssId: String(coverUploadResult.ossId),
      opusType,
    });

    ElMessage.success("作品已保存到个人中心");
    closeWorkbenchIframeModal();
  } catch (error) {
    console.error("保存学生首页作品失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "保存作品失败");
  } finally {
    savingWorkbench.value = false;
  }
};

const handleWorkbenchAIMessage = async (messageData: any, messageType: string) => {
  if (messageType !== "send-tm-zip") {
    return;
  }

  if (savingWorkbench.value) {
    return;
  }

  savingWorkbench.value = true;
  try {
    const rawPayload = pickMessagePayload(messageData, [
      "payload",
      "data",
      "file",
      "blob",
      "arrayBuffer",
      "result",
    ]);
    const uploadFile =
      toUploadFile(rawPayload, pickMessageFileName(messageData)) ||
      toUploadFile(rawPayload, `${currentWorkbenchAiProjectName.value || "project"}.zip`);

    if (!uploadFile) {
      throw new Error("AI模型文件格式不正确");
    }

    const activeToolKey = currentStudentAIModel.value?.key;
    const saveMode = isEditingStudentAIModel.value ? "edit" : "create";
    if (!activeToolKey) {
      throw new Error("当前 AI 模型上下文不存在");
    }

    const previousCacheKey = currentWorkbenchCacheKey.value;
    if (previousCacheKey) {
      savedStudentAIProjectZipCache.set(previousCacheKey, uploadFile);
    }

    if (isEditingStudentAIModel.value && currentEditingStudentAIOssId.value) {
      try {
        await deleteOss(currentEditingStudentAIOssId.value);
      } catch (error) {
        console.warn("学生首页删除旧 OSS 对象失败，继续上传新文件:", error);
      }
    }

    const uploadResult = await uploadFileToOSS(uploadFile, "上传AI模型文件失败");
    const userId = getCurrentUserId();
    const optName =
      (typeof messageData?.projectName === "string" && messageData.projectName.trim()) ||
      currentWorkbenchAiProjectName.value ||
      uploadFile.name.replace(/\.[^.]+$/, "");

    if (!uploadResult?.ossId || !userId || !currentWorkbenchAiOptType.value) {
      throw new Error("AI模型保存参数不完整");
    }

    let finalModelId = currentEditingStudentAIModelId.value || generateStudentAIModelId();
    if (isEditingStudentAIModel.value && currentEditingStudentAIModelId.value) {
      await updateAi({
        optId: currentEditingStudentAIModelId.value,
        optName,
        optType: currentWorkbenchAiOptType.value,
        userId,
        ossId: uploadResult.ossId,
      });
      finalModelId = currentEditingStudentAIModelId.value;
    } else {
      const createResult = await createAi({
        optName,
        optType: currentWorkbenchAiOptType.value,
        userId,
        ossId: uploadResult.ossId,
      });
      finalModelId = String(
        createResult?.optId || createResult?.id || currentEditingStudentAIModelId.value || finalModelId
      );
    }

    const finalCacheKey = getStudentAICacheKey(activeToolKey, finalModelId);
    currentEditingStudentAIModelId.value = finalModelId;
    currentEditingStudentAIOssId.value = String(uploadResult.ossId);
    currentWorkbenchCacheKey.value = finalCacheKey;
    currentWorkbenchAiProjectName.value = optName;
    savedStudentAIProjectZipCache.set(finalCacheKey, uploadFile);
    if (previousCacheKey && previousCacheKey !== finalCacheKey) {
      savedStudentAIProjectZipCache.delete(previousCacheKey);
    }

    await saveStudentAIModelRecord({
      id: finalModelId,
      toolKey: activeToolKey,
      name: optName,
      updatedAt: Date.now(),
      fileName: uploadFile.name,
      mimeType: uploadFile.type || "application/octet-stream",
      size: uploadFile.size,
      zipBlob: uploadFile,
      ossId: String(uploadResult.ossId),
      optType: currentWorkbenchAiOptType.value,
      url: uploadResult?.url || "",
    });

    isEditingStudentAIModel.value = true;
    await loadSavedStudentAIModels();
    ElMessage.success(saveMode === "edit" ? "保存成功" : "创建成功");
  } catch (error) {
    console.error("保存学生首页 AI 模型失败:", error);
    ElMessage.error(error instanceof Error ? error.message : "保存 AI 模型失败");
  } finally {
    savingWorkbench.value = false;
  }
};

const handleWorkbenchIframeMessage = async (event: MessageEvent) => {
  if (
    !showWorkbenchIframeModal.value ||
    !isMessageFromIframe({
      event,
      iframeWindow: workbenchIframeRef.value?.contentWindow,
      iframeUrl: currentWorkbenchUrl.value,
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
    closeWorkbenchIframeModal();
    return;
  }

  if (currentWorkbenchKind.value === "tool") {
    await handleWorkbenchToolMessage(messageData, messageType);
    return;
  }

  if (currentWorkbenchKind.value === "ai") {
    await handleWorkbenchAIMessage(messageData, messageType);
  }
};

const getStoredClassroomInfo = () => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STUDENT_ONGOING_CLASSROOM_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    const expireAt = Number(parsed?.expireAt || 0);
    if (expireAt && expireAt < Date.now()) {
      localStorage.removeItem(STUDENT_ONGOING_CLASSROOM_KEY);
      localStorage.removeItem(STUDENT_CLASS_TIMER_STATE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STUDENT_ONGOING_CLASSROOM_KEY);
    localStorage.removeItem(STUDENT_CLASS_TIMER_STATE_KEY);
    return null;
  }
};

const clearStoredClassroomValidationTimer = () => {
  if (storedClassroomValidationTimer) {
    clearTimeout(storedClassroomValidationTimer);
    storedClassroomValidationTimer = null;
  }
};

const clearNotifyHeartbeatTimer = () => {
  if (notifyHeartbeatTimer) {
    clearInterval(notifyHeartbeatTimer);
    notifyHeartbeatTimer = null;
  }
};

const startNotifyHeartbeat = () => {
  clearNotifyHeartbeatTimer();
  notifyHeartbeatTimer = setInterval(() => {
    if (!notifyWs || notifyWs.readyState !== WebSocket.OPEN) {
      return;
    }

    const heartbeatMsg = JSON.stringify({ type: "HEARTBEAT" });
    notifyWs.send(heartbeatMsg);
    console.log(
      `[学生端] 心跳发送（每${STUDENT_NOTIFY_HEARTBEAT_INTERVAL / 1000}秒）:`,
      heartbeatMsg,
      new Date().toLocaleTimeString("zh-CN", { hour12: false })
    );
  }, STUDENT_NOTIFY_HEARTBEAT_INTERVAL);
};

const clearStudentLessonEnterState = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STUDENT_LESSON_ENTER_STATE_KEY);
};

const updateBackToClassroomEntry = () => {
  const hasStoredClassroom = !!getStoredClassroomInfo();
  showBackToClassroomEntry.value =
    hasStoredClassroom &&
    (hasConfirmedOngoingClassroom.value || isPauseAutoEnterClassroom());
};

const normalizeClassroomInfo = (
  info?: StudentClassroomInfo,
  fallback?: StudentClassroomInfo | null
) => {
  return {
    classId: firstNonEmptyString(info?.classId, fallback?.classId),
    className: firstNonEmptyString(info?.className, fallback?.className),
    teacherPeerId: firstNonEmptyString(info?.teacherPeerId, fallback?.teacherPeerId),
    courseId: firstNonEmptyString(info?.courseId, fallback?.courseId),
    chapterId: firstNonEmptyString(info?.chapterId, fallback?.chapterId),
    chapterName: firstNonEmptyString(info?.chapterName, fallback?.chapterName),
  };
};

const saveOngoingClassroom = (info?: StudentClassroomInfo) => {
  if (typeof window === "undefined") return;
  const nextInfo = normalizeClassroomInfo(info, getStoredClassroomInfo());
  localStorage.setItem(
    STUDENT_ONGOING_CLASSROOM_KEY,
    JSON.stringify({
      ...nextInfo,
      expireAt: Date.now() + 2 * 60 * 60 * 1000,
    })
  );
  updateBackToClassroomEntry();
};

const confirmOngoingClassroom = (info?: StudentClassroomInfo) => {
  hasConfirmedOngoingClassroom.value = true;
  clearStoredClassroomValidationTimer();
  saveOngoingClassroom(info);
};

const clearOngoingClassroom = () => {
  if (typeof window === "undefined") return;
  hasConfirmedOngoingClassroom.value = false;
  clearStoredClassroomValidationTimer();
  localStorage.removeItem(STUDENT_ONGOING_CLASSROOM_KEY);
  updateBackToClassroomEntry();
};

const clearClassTimerState = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STUDENT_CLASS_TIMER_STATE_KEY);
};

const isPauseAutoEnterClassroom = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STUDENT_PAUSE_AUTO_ENTER_KEY) === "1";
};

const setPauseAutoEnterClassroom = (paused: boolean) => {
  if (typeof window === "undefined") return;
  if (paused) {
    localStorage.setItem(STUDENT_PAUSE_AUTO_ENTER_KEY, "1");
  } else {
    localStorage.removeItem(STUDENT_PAUSE_AUTO_ENTER_KEY);
  }
};

const scheduleStoredClassroomValidation = () => {
  clearStoredClassroomValidationTimer();

  const stored = getStoredClassroomInfo();
  if (!stored) {
    hasConfirmedOngoingClassroom.value = false;
    updateBackToClassroomEntry();
    return;
  }

  hasConfirmedOngoingClassroom.value = false;
  updateBackToClassroomEntry();

  storedClassroomValidationTimer = setTimeout(() => {
    if (hasConfirmedOngoingClassroom.value) return;
    console.log("[学生端首页] 未收到当前课堂确认，清理旧课堂缓存");
    clearOngoingClassroom();
    clearClassTimerState();
    setPauseAutoEnterClassroom(false);
  }, STUDENT_CLASSROOM_CONFIRM_TIMEOUT);
};

const buildStudentClassroomPath = (info?: StudentClassroomInfo) => {
  const search = new URLSearchParams();
  if (info?.classId) search.set("classId", String(info.classId));
  if (info?.teacherPeerId) search.set("teacherPeerId", String(info.teacherPeerId));
  if (info?.className) search.set("className", String(info.className));
  if (info?.courseId) search.set("courseId", String(info.courseId));
  if (info?.chapterId) search.set("chapterId", String(info.chapterId));
  if (info?.chapterName) search.set("chapterName", String(info.chapterName));
  const query = search.toString();
  return query ? `/student/classroom?${query}` : "/student/classroom";
};

const isClassBeginMessage = (message: any) => {
  const type = String(message?.type || "")
    .trim()
    .toUpperCase();
  return type === "CLASS_BEGIN" || type === "CLASS_START";
};

const goBackToClassroom = () => {
  const info = getStoredClassroomInfo();
  setPauseAutoEnterClassroom(false);
  router.push(buildStudentClassroomPath(info || undefined));
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleModuleSwitch = () => {
  showDropdown.value = false;
  router.push("/district");
};

const handleProfile = () => {
  showDropdown.value = false;
  router.push("/personalcenter");
};

const handleLogout = () => {
  showDropdown.value = false;
  if (notifyWs) {
    notifyWs.close();
    notifyWs = null;
  }
  clearOngoingClassroom();
  clearClassTimerState();
  clearStudentLessonEnterState();
  setPauseAutoEnterClassroom(false);
  logout();
};

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
};

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement | null;
  if (!target) return;
  target.src = defaultAvatar;
};

// 连接 WebSocket 监听上课通知
onMounted(() => {
  connectNotifyWebSocket();
  loadLearningCenterData();
  updateBackToClassroomEntry();
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("message", handleWorkbenchIframeMessage);
});

onUnmounted(() => {
  clearStoredClassroomValidationTimer();
  clearNotifyHeartbeatTimer();
  if (notifyWs) {
    notifyWs.close();
    notifyWs = null;
  }
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("message", handleWorkbenchIframeMessage);
});

// 连接通知 WebSocket
const connectNotifyWebSocket = () => {
  // 如果已经有连接，先关闭
  clearNotifyHeartbeatTimer();
  if (notifyWs) {
    console.log("[学生端] 关闭旧的 WebSocket 连接");
    notifyWs.close();
    notifyWs = null;
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  let wsUrl = signalingUrl;
  if (token) {
    const separator = signalingUrl.includes("?") ? "&" : "?";
    wsUrl = `${signalingUrl}${separator}Authorization=${encodeURIComponent(
      `Bearer ${token}`
    )}`;
  }

  console.log("[学生端] 连接通知 WebSocket");
  notifyWs = new WebSocket(wsUrl);

  notifyWs.onopen = () => {
    console.log("[学生端] WebSocket 连接成功，等待上课通知...");
    // 发送学生在线状态
    const statusMsg = JSON.stringify({ type: "STUDENT_STATUS", status: "online" });
    notifyWs?.send(statusMsg);
    console.log("[学生端] 发送:", statusMsg);
    startNotifyHeartbeat();
    scheduleStoredClassroomValidation();
  };

  notifyWs.onmessage = (event) => {
    console.log("[学生端首页] 收到消息:", event.data);
    try {
      const message = JSON.parse(event.data);

      // 处理上课通知 - 直接跳转到课堂
      if (isClassBeginMessage(message)) {
        console.log("[学生端首页] 收到上课通知，直接进入课堂！");
        const nextClassInfo = normalizeClassroomInfo(
          {
            classId: message.classId || message.roomId,
            className: message.className,
            teacherPeerId: message.peerId || message.teacherPeerId,
            courseId: message.courseId,
            chapterId: message.chapterId,
            chapterName: message.chapterName,
          },
          getStoredClassroomInfo()
        );
        classInfo.value = nextClassInfo;
        confirmOngoingClassroom(nextClassInfo);
        if (isPauseAutoEnterClassroom()) {
          console.log("[学生端首页] 当前为手动返回首页，暂停自动进入课堂");
          return;
        }
        router.push(buildStudentClassroomPath(nextClassInfo));
      }

      // 处理下课通知
      if (message.type === "CLASS_END") {
        console.log("[学生端] 收到下课通知");
        clearOngoingClassroom();
        clearClassTimerState();
        clearStudentLessonEnterState();
        setPauseAutoEnterClassroom(false);
        ElMessage.info("老师已下课");
      }
    } catch (e) {
      console.log("[学生端] 非 JSON 消息:", event.data);
    }
  };

  notifyWs.onclose = () => {
    clearNotifyHeartbeatTimer();
    console.log("[学生端] WebSocket 断开");
  };

  notifyWs.onerror = (error) => {
    console.error("[学生端] WebSocket 错误:", error);
  };
};

const goLessonsRecord = () => {
  router.push("/student/lessonsrecord");
};

const goStudyCenter = () => {
  router.push("/system/study");
};

const handleUnavailableCenterClick = () => {
  ElMessage.info("暂未开放");
};
</script>

<style scoped>
.student-home-page {
  min-height: 100vh;
  overflow-y: auto;
  background: linear-gradient(180deg, #eef4ff 0%, #f7f9ff 26%, #edf4ff 100%);
}

.student-home-shell {
  width: min(1660px, calc(100% - 48px));
  margin: 0 auto;
  padding: 20px 0 40px;
  box-sizing: border-box;
}

.student-home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
}

.student-home-logo {
  display: inline-flex;
  align-items: center;
}

.student-home-logo img {
  width: 200px;
  height: 32px;
  display: block;
  object-fit: contain;
}

.student-home-actions {
  display: inline-flex;
  align-items: center;
  gap: 16px;
}

.student-home-info {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  object-fit: cover;
  cursor: pointer;
}

.student-user-entry {
  position: relative;
}

.student-user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
}

.student-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.student-user-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 176px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  padding: 8px 0;
  z-index: 30;
}

.student-user-dropdown-head {
  padding: 10px 16px 12px;
  border-bottom: 1px solid #f2f2f2;
}

.student-user-dropdown-name {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  color: #303133;
}

.student-user-dropdown-role {
  margin: 2px 0 0;
  font-size: 14px;
  line-height: 1.4;
  color: #909399;
}

.student-user-dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 12px 16px;
  font-size: 14px;
  color: #4d4d4d;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.student-user-dropdown-item:hover {
  background: #f8f8f8;
  color: #ff9900;
}

.student-user-dropdown-item--danger:hover {
  color: #f56c6c;
}

.main-content {
  display: flex;
  align-items: stretch;
  gap: 40px;
  width: 100%;
  max-width: 1660px;
  margin: 0 auto;
}

.back-classroom-entry {
  position: fixed;
  left: 24px;
  bottom: 24px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px;
  border: none;
  border-radius: 20px;
  background: #ff9900;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 8px 20px rgba(255, 153, 0, 0.28);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}

.back-classroom-entry:hover {
  background: #e68a00;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(255, 153, 0, 0.36);
}

.left-panel {
  order: 2;
  width: 500px;
  min-width: 500px;
  flex-shrink: 0;
  padding: 0;
}

.learning-center-card {
  min-height: 500px;
  padding: 30px 36px;
  border-radius: 34px;
  background-color: #9f8cff;
  background-image: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.05),
      rgba(84, 55, 191, 0.06)
    ),
    var(--learning-center-bg);
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 500px auto;
  box-shadow: 0 20px 40px rgba(150, 164, 208, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.learning-center-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 44px rgba(150, 164, 208, 0.24);
}

.learning-center-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.learning-center-stack {
  display: flex;
  flex-direction: column;
  gap: 26px;
  margin-top: 28px;
}

.learning-center-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.learning-center-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.learning-center-value {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: #5e6b83;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  box-shadow: inset 0 0 0 1px rgba(226, 233, 248, 0.9);
}

.learning-center-value--chapter {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.right-area {
  order: 1;
  flex: 1;
  min-width: 0;
  max-width: 1120px;
}

.student-top-panels {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.student-panel-card {
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(212, 225, 245, 0.98);
  box-shadow: 0 18px 38px rgba(176, 192, 222, 0.18);
}

.tool-card {
  width: calc((100% - 40px) / 2);
  min-width: 0;
  min-height: 230px;
  padding: 28px 30px;
  box-sizing: border-box;
}

.student-panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #556178;
}

.student-panel-icons {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: center;
  gap: 24px 36px;
  margin-top: 42px;
}

.student-panel-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.student-panel-icon:hover {
  transform: translateY(-4px);
}

.student-panel-icon:hover .student-panel-icon-figure {
  box-shadow: 0 14px 24px rgba(176, 192, 222, 0.24);
}

.student-panel-icon-figure {
  width: 87px;
  height: 87px;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(176, 192, 222, 0.18);
}

.student-panel-icon-figure img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-panel-icon-label {
  font-size: 15px;
  color: #5d6a83;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
}

.modal-content {
  width: 480px;
  max-width: 90vw;
  overflow: hidden;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.3s ease;
}

.model-select-modal {
  width: 620px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #ff9900;
  color: #ffffff;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  display: flex;
  padding: 4px;
  border: none;
  background: transparent;
  color: #ffffff;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  padding: 40px 48px;
}

.model-select-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 28px 32px;
}

.model-select-section {
  border: 1px solid #f0e4d0;
  border-radius: 14px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #fffdf8 0%, #fff9f0 100%);
}

.model-select-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.model-select-section-head--stack {
  flex-direction: column;
  align-items: stretch;
}

.model-select-section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.model-select-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
}

.model-select-section-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #8a6a3f;
}

.model-select-count {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: #fff1d9;
  color: #ff9900;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.model-select-create-btn {
  width: auto;
  min-width: 120px;
  padding: 0 20px;
  flex-shrink: 0;
}

.model-card-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
  max-height: 280px;
  overflow-y: auto;
}

.model-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #f3d7a7;
  border-radius: 14px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.model-card:hover {
  transform: translateY(-2px);
  border-color: #ff9900;
  box-shadow: 0 10px 18px rgba(255, 153, 0, 0.12);
}

.model-card-delete {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  min-width: 52px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 77, 79, 0.92);
  color: #ffffff;
  font-size: 12px;
  line-height: 28px;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.model-card:hover .model-card-delete {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.model-card-delete:hover {
  background: #ff4d4f;
}

.model-card-cover {
  height: 96px;
  background: #f3f3f3;
}

.model-card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.student-user-name {
  max-width: 120px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  color: #40566f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card-body {
  padding: 10px 12px 12px;
}

.model-card-name {
  font-size: 13px;
  font-weight: 600;
  color: #333333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-card-time {
  margin-top: 6px;
  font-size: 11px;
  color: #999999;
}

.model-list-empty {
  margin-top: 16px;
  border: 1px dashed #e5d3b6;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: #999999;
  background: rgba(255, 255, 255, 0.7);
}

.form-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.form-label {
  width: 40px;
  flex-shrink: 0;
  font-size: 14px;
  color: #333333;
}

.form-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #ff9900;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px 48px 40px;
}

.modal-footer--single {
  padding-top: 0;
}

.btn-confirm {
  width: 120px;
  height: 40px;
  border: none;
  border-radius: 4px;
  background: #ff9900;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-confirm:hover {
  background: #e68a00;
}

.btn-cancel {
  width: 120px;
  height: 40px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #ffffff;
  color: #666666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  border-color: #999999;
  color: #333333;
}

.iframe-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.iframe-modal-container {
  width: 95vw;
  height: 90vh;
  max-width: 1400px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.iframe-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #ffffff;
}

.iframe-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.iframe-close-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.iframe-close-btn:hover {
  background: #f5f5f5;
  color: #333333;
}

.iframe-modal-body {
  flex: 1;
  position: relative;
}

.tool-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.tool-iframe.hidden {
  visibility: hidden;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.96);
  z-index: 2;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #f3f3f3;
  border-top-color: #ff9900;
  border-radius: 50%;
  animation: tool-iframe-spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  color: #666666;
}

.center-cards {
  display: flex;
  flex-wrap: nowrap;
  gap: 35px;
}

.center-card {
  flex: 1;
  min-width: 0;
  aspect-ratio: 1;
  max-width: calc((100% - 105px) / 4);
  padding: 24px 18px;
  box-sizing: border-box;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.center-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 40px rgba(176, 192, 222, 0.22);
}

.center-card-title {
  font-size: 18px;
  font-weight: 500;
  color: #56657f;
  text-align: center;
}

.center-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  margin: 34px auto 0;
}

@media (max-width: 1720px) {
  .student-home-shell {
    width: min(1660px, calc(100% - 32px));
  }

  .student-panel-icons {
    gap: 32px;
  }
}

@media (max-width: 1440px), (max-height: 820px) {
  .student-home-shell {
    width: min(1500px, calc(100% - 28px));
    padding: 14px 0 24px;
  }

  .student-home-header {
    margin-bottom: 22px;
  }

  .student-home-logo img {
    width: 176px;
    height: 28px;
  }

  .student-home-info,
  .student-user-avatar {
    width: 36px;
    height: 36px;
  }

  .student-user-trigger {
    min-height: 36px;
    gap: 8px;
  }

  .student-user-name {
    max-width: 96px;
    font-size: 14px;
  }

  .main-content {
    gap: 24px;
  }

  .left-panel {
    width: 420px;
    min-width: 420px;
  }

  .learning-center-card {
    min-height: 410px;
    padding: 24px 26px;
    background-size: 420px auto;
    border-radius: 28px;
  }

  .learning-center-title {
    font-size: 17px;
  }

  .learning-center-stack {
    gap: 18px;
    margin-top: 20px;
  }

  .learning-center-item {
    gap: 8px;
  }

  .learning-center-label {
    font-size: 13px;
  }

  .learning-center-value {
    min-height: 42px;
    padding: 0 18px;
    font-size: 17px;
    border-radius: 14px;
  }

  .student-top-panels {
    gap: 24px;
    margin-bottom: 24px;
  }

  .tool-card {
    min-height: 190px;
    padding: 22px 24px;
    border-radius: 26px;
  }

  .student-panel-title,
  .center-card-title {
    font-size: 17px;
  }

  .student-panel-icons {
    gap: 30px;
    margin-top: 26px;
  }

  .student-panel-icon-figure {
    width: 72px;
    height: 72px;
    border-radius: 18px;
  }

  .student-panel-icon-label {
    font-size: 14px;
  }

  .model-select-modal {
    width: calc(100vw - 48px);
  }

  .modal-body,
  .modal-footer {
    padding-left: 28px;
    padding-right: 28px;
  }

  .center-cards {
    gap: 20px;
  }

  .center-card {
    max-width: calc((100% - 60px) / 4);
    padding: 18px 14px;
    border-radius: 26px;
  }

  .center-icon {
    width: 108px;
    height: 108px;
    margin-top: 22px;
  }
}

@media (max-width: 1199px) {
  .student-home-header {
    margin-bottom: 28px;
  }

  .main-content {
    flex-direction: column;
  }

  .left-panel,
  .right-area {
    width: 100%;
    min-width: 0;
    max-width: none;
  }

  .left-panel {
    order: 2;
  }

  .right-area {
    order: 1;
  }

  .student-top-panels {
    flex-direction: column;
  }

  .tool-card {
    width: 100%;
  }

  .learning-center-card {
    background-size: min(500px, 100%) auto;
  }

  .center-cards {
    flex-wrap: wrap;
  }

  .center-card {
    max-width: calc(50% - 17.5px);
  }
}

@media (max-width: 1200px) {
  .student-home-shell {
    width: calc(100% - 24px);
    padding-top: 16px;
  }

  .main-content,
  .student-top-panels {
    gap: 24px;
  }

  .center-cards {
    gap: 24px;
  }

  .center-card {
    max-width: calc(50% - 12px);
    min-height: 240px;
  }

  .learning-center-card {
    min-height: 460px;
    padding: 26px 24px;
  }

  .student-panel-icons {
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .student-home-shell {
    width: calc(100% - 24px);
    padding-top: 16px;
  }

  .student-home-header {
    flex-direction: column;
    align-items: stretch;
  }

  .student-home-logo {
    justify-content: center;
  }

  .student-home-actions {
    align-self: flex-end;
  }

  .main-content,
  .student-top-panels,
  .center-cards {
    gap: 20px;
  }

  .tool-card {
    min-height: 210px;
    padding: 24px 18px;
  }

  .student-panel-title,
  .center-card-title {
    font-size: 16px;
  }

  .student-panel-icons {
    gap: 18px;
    margin-top: 30px;
  }

  .model-select-body,
  .modal-body,
  .modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .model-select-section-head {
    flex-direction: column;
    align-items: stretch;
  }

  .model-select-create-btn,
  .btn-confirm,
  .btn-cancel {
    width: 100%;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .model-card-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .model-card-cover {
    height: 82px;
  }

  .learning-center-card {
    min-height: 420px;
    padding: 24px 20px;
    background-size: 360px auto;
  }

  .learning-center-value {
    font-size: 16px;
  }

  .center-card {
    max-width: 100%;
    aspect-ratio: auto;
    min-height: 250px;
  }

  .center-icon {
    width: 120px;
    height: 120px;
    margin-top: 26px;
  }
}

.dropdown-enter-active {
  transition: all 0.2s ease-out;
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 上课通知弹窗样式 */
.class-notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.class-notification-modal {
  background: white;
  border-radius: 20px;
  padding: 40px 50px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.notification-icon {
  margin-bottom: 20px;
  animation: ring 0.5s ease-in-out infinite alternate;
}

@keyframes ring {
  from {
    transform: rotate(-10deg);
  }
  to {
    transform: rotate(10deg);
  }
}

@keyframes tool-iframe-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.notification-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.notification-desc {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.notification-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn-later {
  padding: 12px 30px;
  border: 1px solid #ddd;
  border-radius: 25px;
  background: white;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-later:hover {
  background: #f5f5f5;
}

.btn-enter {
  padding: 12px 30px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #ff9900, #ffb347);
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(255, 153, 0, 0.4);
}

.btn-enter:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 153, 0, 0.5);
}
</style>
