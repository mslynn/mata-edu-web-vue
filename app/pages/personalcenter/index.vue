<template>
  <div class="personalcenter">
    <!-- Back Button -->
    <div class="back-btn" @click="handleBack">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </div>

    <!-- Content Wrapper -->
    <div class="content-wrapper">
      <!-- User Info -->
      <div class="user-section">
        <div class="user-avatar">
          <img :src="resolvedAvatarUrl" alt="" @error="handleAvatarError" />
          <span class="role-tag">{{ displayRoleName }}</span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-school">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {{ schoolName }}
          </div>
          <div class="user-tags">
            <span class="tag-orange"
              >{{ $t("personalCenter.accountId") }}：{{ accountId }}</span
            >
            <span class="tag-white">{{ $t("personalCenter.phone") }}：{{ phone }}</span>
            <button class="help-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Panel -->
      <div class="main-panel">
        <!-- Left Sidebar -->
        <div class="sidebar">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="sidebar-item"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            <svg
              v-if="tab.value === 'works'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <!-- Right Content -->
        <div class="content">
          <template v-if="activeTab === 'works'">
            <!-- Tool Tabs Row -->
            <div class="tab-row">
              <div class="tool-tabs">
                <button
                  v-for="tool in tools"
                  :key="tool.value"
                  class="tool-tab"
                  :class="{ active: activeTool === tool.value }"
                  @click="activeTool = tool.value"
                >
                  {{ tool.label }}
                </button>
              </div>
              <button
                class="grid-toggle"
                @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
              >
                <svg
                  v-if="viewMode === 'grid'"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>

            <!-- Filter Bar -->
            <div class="filter-bar">
              <div class="search-box">
                <input
                  v-model="searchKeyword"
                  type="text"
                  :placeholder="$t('personalCenter.searchPlaceholder')"
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div class="filter-right">
                <button
                  v-if="activeTool !== 'crealand'"
                  class="upload-btn"
                  @click="showUploadModal = true"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {{ $t("personalCenter.uploadWork") }}
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="works.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="60" r="55" fill="#e6f4ff" />
                  <rect x="30" y="45" width="60" height="40" rx="4" fill="#b5e0ff" />
                  <circle cx="45" cy="58" r="6" fill="#7ec8ff" />
                  <path d="M30 75 L50 60 L70 72 L90 55 L90 85 L30 85 Z" fill="#7ec8ff" />
                  <circle cx="75" cy="35" r="4" fill="#b5e0ff" />
                  <path
                    d="M55 30 L58 33 L55 36"
                    stroke="#b5e0ff"
                    stroke-width="2"
                    fill="none"
                  />
                  <circle cx="48" cy="28" r="1.5" fill="#b5e0ff" />
                  <circle cx="52" cy="28" r="1.5" fill="#b5e0ff" />
                  <circle cx="56" cy="28" r="1.5" fill="#b5e0ff" />
                </svg>
              </div>
              <p class="empty-text">
                {{ $t("personalCenter.noWorksYet") }}
                <a
                  href="javascript:;"
                  class="empty-link"
                  @click="showUploadModal = false"
                  >{{ $t("personalCenter.startCreate") }}</a
                >
              </p>
            </div>

            <!-- Works Grid View -->
            <div v-else-if="viewMode === 'grid'" class="works-grid">
              <div v-for="work in works" :key="work.opusId" class="work-card">
                <div class="work-preview">
                  <div
                    v-if="isSvgCoverUrl(work.coverUrl)"
                    class="work-cover-svg"
                    :style="getSvgCoverStyle(work.coverUrl)"
                  ></div>
                  <img
                    v-else-if="work.coverUrl"
                    :src="work.coverUrl"
                    alt=""
                    class="work-cover-img"
                  />
                </div>
                <div class="work-info">
                  <h4 class="work-name">{{ work.opusName }}</h4>
                  <div class="work-date">{{ work.updateTime || work.createTime }}</div>
                  <div class="work-actions">
                    <button class="action-link" @click="openWorkEditModal(work.opusId)">
                      编辑
                    </button>
                    <button class="action-link" @click="openProgramModal(work.opusId)">
                      打开程序
                    </button>
                    <div class="more-dropdown">
                      <button class="more-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="5" cy="12" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </button>
                      <div class="dropdown-menu">
                        <button class="dropdown-item" @click="handleDownloadWork(work)">
                          {{ $t("personalCenter.download") }}
                        </button>
                        <button
                          class="dropdown-item delete"
                          @click="openDeleteWorkModal(work.opusId)"
                        >
                          {{ $t("personalCenter.delete") }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Works List View -->
            <div v-else class="works-list">
              <div class="list-header">
                <span class="col-index">{{ $t("personalCenter.index") }}</span>
                <span class="col-name">{{ $t("personalCenter.workName") }}</span>
                <span class="col-date">{{ $t("personalCenter.updateTime") }}</span>
                <span class="col-actions">{{ $t("personalCenter.actions") }}</span>
              </div>
              <div v-for="(work, index) in works" :key="work.opusId" class="list-row">
                <span class="col-index">{{ index + 1 }}</span>
                <span class="col-name">{{ work.opusName }}</span>
                <span class="col-date">{{ work.updateTime || work.createTime }}</span>
                <span class="col-actions">
                  <button class="list-action" @click="openWorkEditModal(work.opusId)">
                    编辑
                  </button>
                  <button class="list-action" @click="openProgramModal(work.opusId)">
                    打开程序
                  </button>
                  <div class="list-more-dropdown">
                    <button class="list-action">{{ $t("personalCenter.more") }}</button>
                    <div class="list-dropdown-menu">
                      <button class="dropdown-item" @click="handleDownloadWork(work)">
                        {{ $t("personalCenter.download") }}
                      </button>
                      <button
                        class="dropdown-item delete"
                        @click="openDeleteWorkModal(work.opusId)"
                      >
                        {{ $t("personalCenter.delete") }}
                      </button>
                    </div>
                  </div>
                </span>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="works.length > 0" class="works-pagination">
              <MPagination
                v-model:current-page="pagination.pageNum"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                :show-total="true"
                :show-size-changer="false"
                show-quick-jumper
                @change="handlePageChange"
              />
            </div>
          </template>

          <!-- Settings Tab -->
          <template v-else-if="activeTab === 'settings'">
            <h3 class="settings-title">{{ $t("personalCenter.accountSettings") }}</h3>
            <div class="settings-list">
              <!-- Password Setting -->
              <div class="settings-row">
                <span class="settings-label"
                  >{{ $t("personalCenter.passwordSetting") }}：</span
                >
                <div class="settings-row-content">
                  <svg
                    class="settings-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF9900"
                    stroke-width="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <a
                    href="javascript:;"
                    class="settings-link"
                    @click="showPasswordModal = true"
                    >{{ $t("personalCenter.changePassword") }}</a
                  >
                  <span class="settings-hint">{{
                    $t("personalCenter.changePasswordHint")
                  }}</span>
                </div>
              </div>
              <!-- Delete Account -->
              <div class="settings-row">
                <span class="settings-label"
                  >{{ $t("personalCenter.deleteAccount") }}：</span
                >
                <div class="settings-row-content">
                  <svg
                    class="settings-icon delete"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF9900"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <a
                    href="javascript:;"
                    class="settings-link"
                    @click="showDeleteModal = true"
                    >{{ $t("personalCenter.deleteAccount") }}</a
                  >
                  <span class="settings-hint delete">{{
                    $t("personalCenter.deleteAccountHint")
                  }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
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
            currentToolName || currentIframeOpus?.opusName || "MatataCode"
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

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="closeUploadModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{
              isEditMode ? $t("personalCenter.editWork") : $t("personalCenter.uploadWork")
            }}
          </h3>
          <button class="modal-close" @click="closeUploadModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-left">
            <!-- Upload Type Tabs -->
            <div class="upload-tabs">
              <button
                v-for="tab in uploadTabs"
                :key="tab.value"
                class="upload-tab"
                :class="{ active: uploadType === tab.value }"
                @click="changeUploadType(tab.value)"
              >
                {{ tab.label }}
              </button>
            </div>
            <!-- Preview Area -->
            <div class="upload-preview">
              <!-- Image Carousel -->
              <template v-if="uploadType === 'image' && uploadForm.imageList.length > 0">
                <img
                  :src="uploadForm.imageList[currentImageIndex]?.url"
                  alt=""
                  class="preview-image full"
                />
                <button
                  v-if="uploadForm.imageList.length > 1"
                  class="carousel-btn prev"
                  @click="prevImage"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  v-if="uploadForm.imageList.length > 1"
                  class="carousel-btn next"
                  @click="nextImage"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </template>
              <template v-else-if="uploadType === 'video' && uploadForm.previewUrl">
                <video
                  :src="uploadForm.previewUrl"
                  class="preview-video full"
                  controls
                  preload="metadata"
                  playsinline
                ></video>
              </template>
              <template v-else>
                <img
                  v-if="uploadForm.workFileName"
                  src="~/assets/images/tool3.svg"
                  alt=""
                  class="preview-image full"
                />
                <img
                  v-else
                  src="~/assets/images/tool3.svg"
                  alt=""
                  class="preview-image full"
                  style="opacity: 0.5"
                />
              </template>
            </div>
            <!-- File Upload - Work -->
            <div v-if="uploadType === 'work'" class="file-upload-section">
              <p class="upload-label">
                {{ $t("personalCenter.addWork", { tool: currentToolLabel }) }}
              </p>
              <div
                class="file-upload-box"
                :class="{
                  uploaded: uploadForm.workFileName,
                  'file-upload-box--uploading': isWorkChunkUploading,
                }"
                @click="triggerWorkUpload"
              >
                <div
                  v-if="isWorkChunkUploading || workChunkStatus === 'error'"
                  class="file-upload-progress-mask"
                >
                  <div
                    class="file-upload-progress-card"
                    :class="{ 'file-upload-progress-card--error': workChunkStatus === 'error' }"
                  >
                    <div class="file-upload-progress-ring">
                      <svg viewBox="0 0 72 72" aria-hidden="true">
                        <circle class="file-upload-progress-track" cx="36" cy="36" :r="UPLOAD_PROGRESS_RADIUS" />
                        <circle
                          class="file-upload-progress-value"
                          cx="36"
                          cy="36"
                          :r="UPLOAD_PROGRESS_RADIUS"
                          :stroke-dasharray="UPLOAD_PROGRESS_CIRCUMFERENCE"
                          :stroke-dashoffset="workProgressOffset"
                        />
                      </svg>
                      <strong>{{ workProgressPercent }}%</strong>
                    </div>
                    <span v-if="workChunkStatus === 'error'" class="file-upload-progress-text">
                      上传失败
                    </span>
                    <button
                      v-if="isWorkChunkUploading"
                      type="button"
                      class="file-upload-cancel"
                      @click.stop="handleCancelWorkUpload"
                    >
                      取消上传
                    </button>
                  </div>
                </div>
                <template v-if="uploadForm.workFileName">
                  <img src="~/assets/images/tool3.svg" alt="" class="file-preview-img" />
                  <div class="file-overlay">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{{ $t("personalCenter.reupload") }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="file-upload-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span class="file-upload-text">{{
                    $t("personalCenter.clickUpload")
                  }}</span>
                  <span class="file-upload-hint">{{ getWorkExtension() }}</span>
                </template>
              </div>
              <input
                ref="workFileInput"
                type="file"
                :accept="getWorkExtension()"
                style="display: none"
                @change="handleWorkFileChange"
              />
              <p v-if="workChunkStatus === 'error' && workChunkErrorMessage" class="upload-status-tip upload-status-tip--error">
                {{ workChunkErrorMessage }}
              </p>
            </div>
            <!-- File Upload - Video -->
            <div v-else-if="uploadType === 'video'" class="file-upload-section">
              <p class="upload-label">
                {{ $t("personalCenter.addVideo")
                }}<span class="upload-label-hint">{{
                  $t("personalCenter.videoHint")
                }}</span>
              </p>
              <div
                class="file-upload-box"
                :class="{
                  uploaded: uploadForm.videoFileName,
                  'file-upload-box--uploading': isVideoChunkUploading,
                }"
                @click="triggerVideoUpload"
              >
                <div
                  v-if="isVideoChunkUploading || videoChunkStatus === 'error'"
                  class="file-upload-progress-mask"
                >
                  <div
                    class="file-upload-progress-card"
                    :class="{ 'file-upload-progress-card--error': videoChunkStatus === 'error' }"
                  >
                    <div class="file-upload-progress-ring">
                      <svg viewBox="0 0 72 72" aria-hidden="true">
                        <circle class="file-upload-progress-track" cx="36" cy="36" :r="UPLOAD_PROGRESS_RADIUS" />
                        <circle
                          class="file-upload-progress-value"
                          cx="36"
                          cy="36"
                          :r="UPLOAD_PROGRESS_RADIUS"
                          :stroke-dasharray="UPLOAD_PROGRESS_CIRCUMFERENCE"
                          :stroke-dashoffset="videoProgressOffset"
                        />
                      </svg>
                      <strong>{{ videoProgressPercent }}%</strong>
                    </div>
                    <span v-if="videoChunkStatus === 'error'" class="file-upload-progress-text">
                      上传失败
                    </span>
                    <button
                      v-if="isVideoChunkUploading"
                      type="button"
                      class="file-upload-cancel"
                      @click.stop="handleCancelVideoUpload"
                    >
                      取消上传
                    </button>
                  </div>
                </div>
                <template v-if="uploadForm.videoFileName">
                  <button
                    v-if="!isVideoChunkUploading"
                    class="file-delete-btn"
                    type="button"
                    aria-label="删除视频"
                    @click.stop="removeVideoFile"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                  <video
                    v-if="uploadForm.previewUrl"
                    :src="uploadForm.previewUrl"
                    class="file-preview-video"
                    preload="metadata"
                    muted
                    playsinline
                  ></video>
                  <img v-else src="~/assets/images/tool3.svg" alt="" class="file-preview-img" />
                  <div class="file-overlay">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{{ $t("personalCenter.reupload") }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="file-upload-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" />
                    </svg>
                  </div>
                  <span class="file-upload-text">{{
                    $t("personalCenter.clickUpload")
                  }}</span>
                  <span class="file-upload-hint">MP4 / MOV</span>
                </template>
              </div>
              <input
                ref="videoFileInput"
                type="file"
                accept=".mp4,.mov"
                style="display: none"
                @change="handleVideoFileChange"
              />
              <p v-if="videoChunkStatus === 'error' && videoChunkErrorMessage" class="upload-status-tip upload-status-tip--error">
                {{ videoChunkErrorMessage }}
              </p>
            </div>
            <!-- File Upload - Image (Multi) -->
            <div v-else-if="uploadType === 'image'" class="file-upload-section">
              <p class="upload-label">
                {{ $t("personalCenter.addImage")
                }}<span class="upload-label-hint">{{
                  $t("personalCenter.imageMultiHint")
                }}</span>
              </p>
              <div class="image-upload-list">
                <!-- Uploaded Images -->
                <div
                  v-for="(img, index) in uploadForm.imageList"
                  :key="index"
                  class="image-upload-item"
                >
                  <img :src="img.url" alt="" />
                  <button class="image-delete-btn" @click="removeImage(index)">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="#ff4d4f" />
                      <path
                        d="M15 9l-6 6M9 9l6 6"
                        stroke="white"
                        stroke-width="2"
                        fill="none"
                      />
                    </svg>
                  </button>
                </div>
                <!-- Upload Button -->
                <div
                  v-if="uploadForm.imageList.length < 6"
                  class="image-upload-add"
                  :class="{ 'file-upload-box--uploading': isImageChunkUploading }"
                  @click="triggerImageUpload"
                >
                  <div
                    v-if="isImageChunkUploading || imageChunkStatus === 'error'"
                    class="file-upload-progress-mask"
                  >
                    <div
                      class="file-upload-progress-card"
                      :class="{ 'file-upload-progress-card--error': imageChunkStatus === 'error' }"
                    >
                      <div class="file-upload-progress-ring">
                        <svg viewBox="0 0 72 72" aria-hidden="true">
                          <circle class="file-upload-progress-track" cx="36" cy="36" :r="UPLOAD_PROGRESS_RADIUS" />
                          <circle
                            class="file-upload-progress-value"
                            cx="36"
                            cy="36"
                            :r="UPLOAD_PROGRESS_RADIUS"
                            :stroke-dasharray="UPLOAD_PROGRESS_CIRCUMFERENCE"
                            :stroke-dashoffset="imageProgressOffset"
                          />
                        </svg>
                        <strong>{{ imageProgressPercent }}%</strong>
                      </div>
                      <span v-if="imageChunkStatus === 'error'" class="file-upload-progress-text">
                        上传失败
                      </span>
                      <button
                        v-if="isImageChunkUploading"
                        type="button"
                        class="file-upload-cancel"
                        @click.stop="handleCancelImageUpload"
                      >
                        取消上传
                      </button>
                    </div>
                  </div>
                  <span class="add-btn">{{ $t("personalCenter.clickUpload") }}</span>
                </div>
              </div>
              <input
                ref="imageFileInput"
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                multiple
                style="display: none"
                @change="handleImageFileChange"
              />
              <p v-if="imageChunkStatus === 'error' && imageChunkErrorMessage" class="upload-status-tip upload-status-tip--error">
                {{ imageChunkErrorMessage }}
              </p>
            </div>
          </div>
          <div class="modal-right">
            <!-- Work Name -->
            <div class="form-item">
              <label class="form-label required">{{
                $t("personalCenter.workName")
              }}</label>
              <div class="form-input-wrapper">
                <input
                  v-model="uploadForm.name"
                  type="text"
                  class="form-input"
                  :placeholder="$t('personalCenter.workNamePlaceholder')"
                  maxlength="40"
                />
                <span class="input-count">{{ uploadForm.name.length }} / 40</span>
              </div>
            </div>
            <!-- Work Description -->
            <div class="form-item">
              <label class="form-label">{{ $t("personalCenter.workDescription") }}</label>
              <div class="form-input-wrapper">
                <textarea
                  v-model="uploadForm.description"
                  class="form-textarea"
                  :placeholder="$t('personalCenter.workDescriptionPlaceholder')"
                  maxlength="600"
                ></textarea>
                <span class="textarea-count"
                  >{{ uploadForm.description.length }} / 600</span
                >
              </div>
            </div>
            <!-- Operation Guide -->
            <div class="form-item">
              <label class="form-label">{{ $t("personalCenter.operationGuide") }}</label>
              <div class="form-input-wrapper">
                <textarea
                  v-model="uploadForm.guide"
                  class="form-textarea small"
                  :placeholder="$t('personalCenter.operationGuidePlaceholder')"
                  maxlength="300"
                ></textarea>
                <span class="textarea-count">{{ uploadForm.guide.length }} / 300</span>
              </div>
            </div>
            <!-- Cover Upload -->
            <div class="form-item">
              <label class="form-label required">{{
                $t("personalCenter.workCover")
              }}</label>
              <div
                class="cover-upload-box"
                :class="{
                  uploaded: uploadForm.coverUrl,
                  'file-upload-box--uploading': isCoverChunkUploading,
                }"
                @click="triggerCoverUpload"
              >
                <div
                  v-if="isCoverChunkUploading || coverChunkStatus === 'error'"
                  class="file-upload-progress-mask"
                >
                  <div
                    class="file-upload-progress-card"
                    :class="{ 'file-upload-progress-card--error': coverChunkStatus === 'error' }"
                  >
                    <div class="file-upload-progress-ring">
                      <svg viewBox="0 0 72 72" aria-hidden="true">
                        <circle class="file-upload-progress-track" cx="36" cy="36" :r="UPLOAD_PROGRESS_RADIUS" />
                        <circle
                          class="file-upload-progress-value"
                          cx="36"
                          cy="36"
                          :r="UPLOAD_PROGRESS_RADIUS"
                          :stroke-dasharray="UPLOAD_PROGRESS_CIRCUMFERENCE"
                          :stroke-dashoffset="coverProgressOffset"
                        />
                      </svg>
                      <strong>{{ coverProgressPercent }}%</strong>
                    </div>
                    <span v-if="coverChunkStatus === 'error'" class="file-upload-progress-text">
                      上传失败
                    </span>
                    <button
                      v-if="isCoverChunkUploading"
                      type="button"
                      class="file-upload-cancel"
                      @click.stop="handleCancelCoverUpload"
                    >
                      取消上传
                    </button>
                  </div>
                </div>
                <template v-if="uploadForm.coverUrl">
                  <img :src="uploadForm.coverUrl" alt="" class="cover-preview" />
                  <div class="cover-overlay">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{{ $t("personalCenter.reupload") }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="cover-upload-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <span class="cover-upload-text">{{
                    $t("personalCenter.clickUpload")
                  }}</span>
                  <span class="cover-upload-hint">JPG / PNG</span>
                </template>
              </div>
              <input
                ref="coverFileInput"
                type="file"
                accept=".jpg,.jpeg,.png"
                style="display: none"
                @change="handleCoverFileChange"
              />
              <p v-if="coverChunkStatus === 'error' && coverChunkErrorMessage" class="upload-status-tip upload-status-tip--error">
                {{ coverChunkErrorMessage }}
              </p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeUploadModal">
            {{ $t("common.cancel") }}
          </button>
          <button class="btn-submit" :disabled="uploading" @click="handleSubmitWork">
            {{ $t("common.submit") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <div
      v-if="showPasswordModal"
      class="modal-overlay"
      @click.self="showPasswordModal = false"
    >
      <div class="password-modal">
        <button class="password-modal-close" @click="showPasswordModal = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h3 class="password-modal-title">{{ $t("personalCenter.changePassword") }}</h3>
        <div class="password-form">
          <div class="password-field">
            <div
              class="password-input-box"
              :class="{ error: passwordErrors.oldPassword }"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                v-model="passwordForm.oldPassword"
                :type="showOldPassword ? 'text' : 'password'"
                minlength="6"
                maxlength="30"
                :placeholder="$t('personalCenter.oldPassword')"
              />
              <button
                type="button"
                class="password-eye-btn"
                @click="showOldPassword = !showOldPassword"
              >
                <svg
                  v-if="showOldPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF9900"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF9900"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <p v-if="passwordErrors.oldPassword" class="field-error">
              {{ passwordErrors.oldPassword }}
            </p>
          </div>
          <div class="password-field">
            <div
              class="password-input-box"
              :class="{ error: passwordErrors.newPassword }"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                minlength="6"
                maxlength="30"
                :placeholder="$t('personalCenter.newPasswordPlaceholder')"
              />
              <button
                type="button"
                class="password-eye-btn"
                @click="showNewPassword = !showNewPassword"
              >
                <svg
                  v-if="showNewPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF9900"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF9900"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <p v-if="passwordErrors.newPassword" class="field-error">
              {{ passwordErrors.newPassword }}
            </p>
          </div>
          <div class="password-field">
            <div
              class="password-input-box"
              :class="{ error: passwordErrors.confirmPassword }"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                minlength="6"
                maxlength="30"
                :placeholder="$t('personalCenter.confirmNewPassword')"
              />
              <button
                type="button"
                class="password-eye-btn"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg
                  v-if="showConfirmPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF9900"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF9900"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <p v-if="passwordErrors.confirmPassword" class="field-error">
              {{ passwordErrors.confirmPassword }}
            </p>
          </div>
          <p class="password-hint">{{ $t("personalCenter.passwordRule") }}</p>
          <div class="password-actions">
            <button class="btn-password-cancel" @click="showPasswordModal = false">
              {{ $t("common.cancel") }}
            </button>
            <button class="btn-password-save" @click="handleSavePassword">
              {{ $t("common.save") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="showDeleteModal = false"
    >
      <div class="password-modal">
        <button class="password-modal-close" @click="showDeleteModal = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h3 class="password-modal-title">{{ $t("personalCenter.deleteAccount") }}</h3>
        <p class="delete-modal-desc">{{ $t("personalCenter.deleteAccountDesc") }}</p>
        <div class="password-form">
          <div class="password-field">
            <div class="password-input-box" :class="{ error: deleteAccountError }">
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                v-model="deleteAccountPassword"
                :type="showDeletePassword ? 'text' : 'password'"
                minlength="6"
                maxlength="30"
                :placeholder="$t('personalCenter.inputAccountPassword')"
              />
              <button
                class="toggle-password"
                @click="showDeletePassword = !showDeletePassword"
              >
                <svg
                  v-if="showDeletePassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF9900"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FF9900"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <p v-if="deleteAccountError" class="field-error">{{ deleteAccountError }}</p>
          </div>
          <div class="password-actions">
            <button class="btn-password-cancel" @click="showDeleteModal = false">
              {{ $t("common.cancel") }}
            </button>
            <button class="btn-password-save" @click="handleDeleteAccount">
              {{ $t("common.confirm") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Work Modal -->
    <div
      v-if="showDeleteWorkModal"
      class="modal-overlay"
      @click.self="showDeleteWorkModal = false"
    >
      <div class="confirm-modal">
        <button class="confirm-modal-close" @click="showDeleteWorkModal = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <h3 class="confirm-modal-title">{{ $t("personalCenter.tips") }}</h3>
        <div class="confirm-modal-content">
          <p class="confirm-main-text">{{ $t("personalCenter.confirmDeleteWork") }}</p>
          <p class="confirm-sub-text">{{ $t("personalCenter.deleteWorkHint1") }}</p>
          <p class="confirm-sub-text">{{ $t("personalCenter.deleteWorkHint2") }}</p>
        </div>
        <div class="confirm-modal-actions">
          <button class="btn-confirm-cancel" @click="showDeleteWorkModal = false">
            {{ $t("common.cancel") }}
          </button>
          <button class="btn-confirm-ok" @click="confirmDeleteWork">
            {{ $t("common.confirm") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useAuth } from "~/composables/api/useAuth";
import { useI18n } from "vue-i18n";
import { personalcenterApi } from "~/composables/api/personalcenter";
import { aiAdmin } from "~/composables/api/ai";
import { useChunkUpload } from "~/composables/useChunkUpload";
import { useIframeFileBridge } from "~/composables/useIframeFileBridge";
import { ElMessage } from "element-plus";
import defaultAvatar from "~/assets/newimages/user.png";

definePageMeta({ layout: false });

const router = useRouter();
const runtimeConfig = useRuntimeConfig();

const { user, logout, syncUserInfo } = useAuth();
const { t } = useI18n();
const { ssoLogin, deleteOss } = aiAdmin();
const {
  uploadOSS,
  addOpus,
  editOpus,
  getProfileopus,
  getOpusDetail,
  deleteOpus,
  downloadOSS,
  getProfile,
  updatePwd,
  account,
} = personalcenterApi();
const {
  downloadFileFromOSS,
  postFileBufferToIframe,
  parseMessageData,
  getMessageType,
  pickMessagePayload,
  pickMessageFileName,
  isMessageFromIframe,
  toZipFile,
  toWorkFile,
} = useIframeFileBridge();

// 用户信息
const userProfile = ref<any>(null);
const userName = computed(
  () => userProfile.value?.user?.nickName || userProfile.value?.user?.userName || ""
);
const schoolName = computed(() => userProfile.value?.user?.orgName || "");
const accountId = computed(() => userProfile.value?.user?.userName || "");
const phone = computed(() => userProfile.value?.user?.phonenumber || "");
const avatarUrl = computed(() => String(userProfile.value?.user?.avatar || "").trim());
const resolvedAvatarUrl = computed(() => avatarUrl.value || defaultAvatar);
const displayRoleName = computed(() => {
  const roleKey =
    user.value?.role_key ||
    userProfile.value?.user?.roleKey ||
    userProfile.value?.user?.role_key ||
    "";
  const currentRoleName =
    user.value?.role_name ||
    userProfile.value?.user?.roleName ||
    userProfile.value?.user?.role_name ||
    "";

  if (
    roleKey === "city_admin" ||
    currentRoleName === "市管理员" ||
    currentRoleName === "市级管理员"
  ) {
    return t("personalCenter.cityAdmin");
  }

  if (
    roleKey === "district_admin" ||
    roleKey === "district" ||
    currentRoleName === "区管理员" ||
    currentRoleName === "区级管理员"
  ) {
    return t("personalCenter.districtAdmin");
  }

  if (
    roleKey === "school_admin" ||
    roleKey === "school" ||
    currentRoleName === "校管理员" ||
    currentRoleName === "学校管理员" ||
    currentRoleName === "校级管理员"
  ) {
    return t("personalCenter.schoolAdmin");
  }

  if (roleKey === "student" || currentRoleName === "学生") {
    return t("personalCenter.student");
  }

  if (roleKey === "teacher" || currentRoleName === "教师") {
    return t("personalCenter.teacher");
  }

  return currentRoleName || t("personalCenter.anonymous");
});
const isCityOrDistrictAdmin = computed(() => {
  const roleKey =
    user.value?.role_key ||
    userProfile.value?.user?.roleKey ||
    userProfile.value?.user?.role_key;
  const currentRoleName =
    user.value?.role_name ||
    userProfile.value?.user?.roleName ||
    userProfile.value?.user?.role_name;
  return (
    roleKey === "city_admin" ||
    roleKey === "district_admin" ||
    currentRoleName === "市管理员" ||
    currentRoleName === "区管理员"
  );
});

const activeTab = ref(isCityOrDistrictAdmin.value ? "settings" : "works");
const activeTool = ref("vinci");
const searchKeyword = ref("");
const viewMode = ref("grid"); // 'grid' or 'list'
const showToolIframeModal = ref(false);
const currentToolUrl = ref("");
const currentToolName = ref("");
const currentToolFile = ref<File | null>(null);
const toolIframeLoading = ref(true);
const toolIframeRef = ref<HTMLIFrameElement | null>(null);
const currentIframeOpus = ref<any | null>(null);
const savingIframeOpus = ref(false);
const showUploadModal = ref(false);
const isEditMode = ref(false);
const editOpusId = ref("");
const uploadType = ref("work");
const showPasswordModal = ref(false);
const showDeleteModal = ref(false);
const showDeleteWorkModal = ref(false);
const deleteWorkId = ref("");
const deleteAccountPassword = ref("");
const deleteAccountError = ref("");
const showDeletePassword = ref(false);
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const worksList = ref<any[]>([]);
const worksLoading = ref(false);
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});
const uploading = ref(false);
const currentImageIndex = ref(0);
const imageUploadCancelled = ref(false);
const UPLOAD_PROGRESS_RADIUS = 24;
const UPLOAD_PROGRESS_CIRCUMFERENCE = 2 * Math.PI * UPLOAD_PROGRESS_RADIUS;
const {
  status: workChunkStatus,
  progressPercent: workProgressPercent,
  errorMessage: workChunkErrorMessage,
  isUploading: isWorkChunkUploading,
  start: startWorkChunkUpload,
  cancel: cancelWorkChunkUpload,
  reset: resetWorkChunkUpload,
} = useChunkUpload({
  chunkSize: 5 * 1024 * 1024,
  defaultErrorMessage: "作品文件分片上传失败，请重试",
});
const {
  status: videoChunkStatus,
  progressPercent: videoProgressPercent,
  errorMessage: videoChunkErrorMessage,
  isUploading: isVideoChunkUploading,
  start: startVideoChunkUpload,
  cancel: cancelVideoChunkUpload,
  reset: resetVideoChunkUpload,
} = useChunkUpload({
  chunkSize: 5 * 1024 * 1024,
  defaultErrorMessage: "视频分片上传失败，请重试",
});
const {
  status: coverChunkStatus,
  progressPercent: coverProgressPercent,
  errorMessage: coverChunkErrorMessage,
  isUploading: isCoverChunkUploading,
  start: startCoverChunkUpload,
  cancel: cancelCoverChunkUpload,
  reset: resetCoverChunkUpload,
} = useChunkUpload({
  chunkSize: 5 * 1024 * 1024,
  defaultErrorMessage: "封面图片分片上传失败，请重试",
});
const {
  status: imageChunkStatus,
  progressPercent: imageProgressPercent,
  errorMessage: imageChunkErrorMessage,
  isUploading: isImageChunkUploading,
  start: startImageChunkUpload,
  cancel: cancelImageChunkUpload,
  reset: resetImageChunkUpload,
} = useChunkUpload({
  chunkSize: 5 * 1024 * 1024,
  defaultErrorMessage: "图片分片上传失败，请重试",
});
const workProgressOffset = computed(
  () => UPLOAD_PROGRESS_CIRCUMFERENCE * (1 - workProgressPercent.value / 100)
);
const videoProgressOffset = computed(
  () => UPLOAD_PROGRESS_CIRCUMFERENCE * (1 - videoProgressPercent.value / 100)
);
const coverProgressOffset = computed(
  () => UPLOAD_PROGRESS_CIRCUMFERENCE * (1 - coverProgressPercent.value / 100)
);
const imageProgressOffset = computed(
  () => UPLOAD_PROGRESS_CIRCUMFERENCE * (1 - imageProgressPercent.value / 100)
);
const isAnyChunkUploading = computed(
  () =>
    isWorkChunkUploading.value ||
    isVideoChunkUploading.value ||
    isCoverChunkUploading.value ||
    isImageChunkUploading.value
);

// File input refs
const workFileInput = ref<HTMLInputElement | null>(null);
const coverFileInput = ref<HTMLInputElement | null>(null);
const videoFileInput = ref<HTMLInputElement | null>(null);
const imageFileInput = ref<HTMLInputElement | null>(null);

const uploadForm = ref({
  name: "",
  description: "",
  guide: "",
  workFileName: "",
  workOssId: "",
  coverUrl: "",
  coverOssId: "",
  previewUrl: "",
  videoFileName: "",
  videoOssId: "",
  imageList: [] as { url: string; ossId: string }[],
});

const revokeUploadPreviewUrl = () => {
  if (typeof window === "undefined") return;

  const previewUrl = String(uploadForm.value.previewUrl || "");
  if (previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
};

const revokeBlobPreviewUrl = (url: unknown) => {
  if (typeof window === "undefined") return;

  const previewUrl = String(url || "");
  if (previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
};

const resolveUploadedImageUrl = (result: any, file: File) => {
  const remoteUrl = String(result?.url || "").trim();
  if (remoteUrl) {
    return remoteUrl;
  }
  if (typeof window !== "undefined") {
    return URL.createObjectURL(file);
  }
  return "";
};

const revokeSupplementalPreviewUrls = () => {
  revokeBlobPreviewUrl(uploadForm.value.coverUrl);
  uploadForm.value.imageList.forEach((item) => revokeBlobPreviewUrl(item.url));
};

const handleCancelWorkUpload = async () => {
  if (!isWorkChunkUploading.value) return;

  try {
    const cancelled = await cancelWorkChunkUpload();
    if (!cancelled) return;

    ElMessage.success("取消上传成功");
  } catch (error: any) {
    ElMessage.error(error.message || "取消上传失败");
  } finally {
    if (workFileInput.value) {
      workFileInput.value.value = "";
    }
    uploading.value = false;
    resetWorkChunkUpload();
  }
};

const handleCancelVideoUpload = async () => {
  if (!isVideoChunkUploading.value) return;

  try {
    const cancelled = await cancelVideoChunkUpload();
    if (!cancelled) return;

    ElMessage.success("取消上传成功");
  } catch (error: any) {
    ElMessage.error(error.message || "取消上传失败");
  } finally {
    if (videoFileInput.value) {
      videoFileInput.value.value = "";
    }
    uploading.value = false;
    resetVideoChunkUpload();
  }
};

const handleCancelCoverUpload = async () => {
  if (!isCoverChunkUploading.value) return;

  try {
    const cancelled = await cancelCoverChunkUpload();
    if (!cancelled) return;

    ElMessage.success("取消上传成功");
  } catch (error: any) {
    ElMessage.error(error.message || "取消上传失败");
  } finally {
    if (coverFileInput.value) {
      coverFileInput.value.value = "";
    }
    uploading.value = false;
    resetCoverChunkUpload();
  }
};

const handleCancelImageUpload = async () => {
  if (!isImageChunkUploading.value) return;

  imageUploadCancelled.value = true;
  try {
    const cancelled = await cancelImageChunkUpload();
    if (!cancelled) return;

    ElMessage.success("取消上传成功");
  } catch (error: any) {
    ElMessage.error(error.message || "取消上传失败");
  } finally {
    uploading.value = false;
    if (imageFileInput.value) {
      imageFileInput.value.value = "";
    }
    resetImageChunkUpload();
  }
};

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordErrors = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const validatePassword = () => {
  let isValid = true;
  passwordErrors.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
  const isPasswordLengthValid = (value: string) =>
    value.length >= 6 && value.length <= 30;

  if (!passwordForm.value.oldPassword) {
    passwordErrors.value.oldPassword = t("personalCenter.pleaseInputOldPassword");
    isValid = false;
  } else if (!isPasswordLengthValid(passwordForm.value.oldPassword)) {
    passwordErrors.value.oldPassword = t("personalCenter.passwordFormatError");
    isValid = false;
  }

  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = t("personalCenter.pleaseInputPassword");
    isValid = false;
  } else if (!isPasswordLengthValid(passwordForm.value.newPassword)) {
    passwordErrors.value.newPassword = t("personalCenter.passwordFormatError");
    isValid = false;
  } else if (passwordForm.value.newPassword === passwordForm.value.oldPassword) {
    passwordErrors.value.newPassword = t("personalCenter.passwordSameError");
    isValid = false;
  }

  if (!passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = t("personalCenter.pleaseInputConfirmPassword");
    isValid = false;
  } else if (!isPasswordLengthValid(passwordForm.value.confirmPassword)) {
    passwordErrors.value.confirmPassword = t("personalCenter.passwordFormatError");
    isValid = false;
  } else if (passwordForm.value.confirmPassword !== passwordForm.value.newPassword) {
    passwordErrors.value.confirmPassword = t("personalCenter.passwordNotMatch");
    isValid = false;
  }

  return isValid;
};

const handleSavePassword = async () => {
  if (!validatePassword()) return;

  try {
    uploading.value = true;
    await updatePwd({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });
    showPasswordModal.value = false;
    // 清空表单
    passwordForm.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
    // 显示倒计时提示，3秒后重新登录
    let countdown = 3;
    ElMessage.success(t("personalCenter.passwordChangedRelogin", { seconds: countdown }));
    const timer = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        ElMessage.success(
          t("personalCenter.passwordChangedRelogin", { seconds: countdown })
        );
      } else {
        clearInterval(timer);
        logout();
      }
    }, 1000);
  } catch (error: any) {
    console.error("修改密码失败:", error);
  } finally {
    uploading.value = false;
  }
};

const handleDeleteAccount = async () => {
  deleteAccountError.value = "";
  if (!deleteAccountPassword.value) {
    deleteAccountError.value = t("personalCenter.pleaseInputPassword");
    return;
  }
  if (deleteAccountPassword.value.length < 6 || deleteAccountPassword.value.length > 30) {
    deleteAccountError.value = t("personalCenter.passwordFormatError");
    return;
  }

  try {
    uploading.value = true;
    await account({ password: deleteAccountPassword.value });
    ElMessage.success(t("personalCenter.deleteAccountSuccess"));
    showDeleteModal.value = false;
    deleteAccountPassword.value = "";
    // 注销成功后退出登录
    await logout();
  } catch (error: any) {
    deleteAccountError.value = error.message || t("personalCenter.deleteAccountFailed");
  } finally {
    uploading.value = false;
  }
};

// 关闭上传弹窗并清空表单
const closeUploadModal = () => {
  if (isAnyChunkUploading.value) {
    ElMessage.warning("文件还在上传中，请先取消上传");
    return;
  }

  revokeUploadPreviewUrl();
  revokeSupplementalPreviewUrls();
  imageUploadCancelled.value = false;
  resetWorkChunkUpload();
  resetVideoChunkUpload();
  resetCoverChunkUpload();
  resetImageChunkUpload();
  showUploadModal.value = false;
  isEditMode.value = false;
  editOpusId.value = "";
  uploadType.value = "work";
  uploadForm.value = {
    name: "",
    description: "",
    guide: "",
    workFileName: "",
    workOssId: "",
    coverUrl: "",
    coverOssId: "",
    previewUrl: "",
    videoFileName: "",
    videoOssId: "",
    imageList: [],
  };
  currentImageIndex.value = 0;
};

// 切换上传类型
const changeUploadType = (type: string) => {
  if (isAnyChunkUploading.value) {
    ElMessage.warning("文件还在上传中，请先取消上传");
    return;
  }
  uploadType.value = type;
  console.log("切换到:", type, "uploadType.value:", uploadType.value);
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

const getOpusToolId = (detail: any): "vincibot" | "nous" => {
  return normalizeToolId(detail?.opusType || activeTool.value) || "vincibot";
};

const getOpusFileName = (detail: any) => {
  const fileName = detail?.opusUrl
    ? String(detail.opusUrl).split("/").pop()
    : detail?.opusName;
  if (fileName && /\.[^.]+$/i.test(fileName)) {
    return fileName;
  }
  const baseName = String(fileName || detail?.opusName || "project");
  return `${baseName}.${getOpusToolId(detail) === "nous" ? "sb3" : "mc"}`;
};

const getToolReceiveMessageType = (fileName: string) => {
  if (/\.mc$/i.test(fileName)) {
    return "receive-works-mc";
  }
  if (/\.sb3$/i.test(fileName)) {
    return "receive-works-sb3";
  }
  return "ZIP_DATA";
};

const splitResourceValues = (value: unknown) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getResourceFileName = (url: unknown, fallback: string) => {
  const rawUrl = String(url || "").trim();
  if (!rawUrl) return fallback;

  const cleanUrl = rawUrl.split("?")[0] || rawUrl;
  const fileName = cleanUrl.split("/").pop();
  return fileName || fallback;
};

const buildEditImageList = (detail: any): Array<{ url: string; ossId: string }> => {
  const imageOssIds = splitResourceValues(detail?.picOssIds);
  const arraySource = Array.isArray(detail?.imageList)
    ? detail.imageList
    : Array.isArray(detail?.picUrlList)
      ? detail.picUrlList
      : [];

  if (arraySource.length > 0) {
    return arraySource
      .map((item: any, index: number) => {
        if (typeof item === "string") {
          return {
            url: item,
            ossId: imageOssIds[index] || "",
          };
        }

        return {
          url: String(item?.url || item?.picUrl || item?.resourceUrl || "").trim(),
          ossId: String(item?.ossId || item?.picOssId || imageOssIds[index] || "").trim(),
        };
      })
      .filter((item: { url: string; ossId: string }) => item.url);
  }

  const imageUrls = splitResourceValues(detail?.picUrl || detail?.picUrls);
  return imageUrls.map((url, index) => ({
    url,
    ossId: imageOssIds[index] || "",
  }));
};

const fillUploadFormForEdit = (detail: any, opusId: string) => {
  revokeUploadPreviewUrl();
  revokeSupplementalPreviewUrls();
  imageUploadCancelled.value = false;
  resetWorkChunkUpload();
  resetVideoChunkUpload();
  resetCoverChunkUpload();
  resetImageChunkUpload();

  const nextToolValue = getOpusToolId(detail) === "nous" ? "nous" : "vinci";
  const imageList = buildEditImageList(detail);
  const hasWorkFile = Boolean(detail?.opusOssId);
  const hasVideoFile = Boolean(detail?.videoOssId || detail?.videoUrl);

  activeTool.value = nextToolValue;
  isEditMode.value = true;
  editOpusId.value = String(detail?.opusId || opusId);
  uploadType.value = hasWorkFile ? "work" : hasVideoFile ? "video" : "image";
  currentImageIndex.value = 0;
  uploadForm.value = {
    name: String(detail?.opusName || "").trim(),
    description: String(detail?.opusDesc || "").trim(),
    guide: String(detail?.opusGuide || "").trim(),
    workFileName: hasWorkFile ? getOpusFileName(detail) : "",
    workOssId: String(detail?.opusOssId || "").trim(),
    coverUrl: String(detail?.coverUrl || "").trim(),
    coverOssId: String(detail?.coverOssId || "").trim(),
    previewUrl: String(detail?.videoUrl || "").trim(),
    videoFileName: hasVideoFile
      ? getResourceFileName(detail?.videoUrl, `${String(detail?.opusName || "video").trim() || "video"}.mp4`)
      : "",
    videoOssId: String(detail?.videoOssId || "").trim(),
    imageList,
  };
};

const closeToolIframeModal = () => {
  showToolIframeModal.value = false;
  currentToolUrl.value = "";
  currentToolName.value = "";
  currentToolFile.value = null;
  currentIframeOpus.value = null;
  toolIframeLoading.value = true;
  savingIframeOpus.value = false;
};

const postCurrentToolFileToIframe = async () => {
  if (!currentToolFile.value || !currentToolUrl.value) {
    console.warn("个人中心未发送到编程平台：缺少作品文件或 iframe 地址", {
      hasFile: Boolean(currentToolFile.value),
      iframeUrl: currentToolUrl.value,
    });
    return;
  }

  const messageType = getToolReceiveMessageType(currentToolFile.value.name);
  console.log("个人中心准备发送作品到编程平台：", {
    type: messageType,
    fileName: currentToolFile.value.name,
    fileSize: currentToolFile.value.size,
    iframeUrl: currentToolUrl.value,
  });

  const postResult = await postFileBufferToIframe({
    file: currentToolFile.value,
    iframeUrl: currentToolUrl.value,
    iframeWindow: toolIframeRef.value?.contentWindow,
    type: messageType,
  });

  console.log("个人中心发送作品到编程平台完成：", postResult);
};

const onToolIframeLoad = () => {
  toolIframeLoading.value = false;
  if (!currentToolFile.value) return;
  window.setTimeout(() => {
    void postCurrentToolFileToIframe();
  }, 300);
};

const openWorkEditModal = async (opusId: string) => {
  try {
    uploading.value = true;
    const detail = await getOpusDetail(opusId);
    fillUploadFormForEdit(detail, opusId);
    showUploadModal.value = true;
  } catch (error: any) {
    console.error("打开作品编辑弹窗失败:", error);
    ElMessage.error(error.message || "打开编辑弹窗失败");
  } finally {
    uploading.value = false;
  }
};

// 打开程序
const openProgramModal = async (opusId: string) => {
  try {
    uploading.value = true;
    const detail = await getOpusDetail(opusId);
    if (!detail?.opusOssId) {
      ElMessage.warning("当前作品缺少程序文件");
      return;
    }

    const toolId = getOpusToolId(detail);
    currentIframeOpus.value = detail;
    currentToolName.value =
      toolId === "nous" ? "MatataCode (Nous)" : "MatataCode (VinciBot)";
    currentToolFile.value = await downloadFileFromOSS(
      String(detail.opusOssId),
      getOpusFileName(detail),
      "application/octet-stream"
    );
    currentToolUrl.value = await buildToolIframeUrl(toolId);
    toolIframeLoading.value = true;
    showToolIframeModal.value = true;
  } catch (error: any) {
    console.error("打开程序失败:", error);
    ElMessage.error(error.message || "打开程序失败");
  } finally {
    uploading.value = false;
  }
};

// 打开删除确认弹窗
const openDeleteWorkModal = (opusId: string) => {
  deleteWorkId.value = opusId;
  showDeleteWorkModal.value = true;
};

// 确认删除作品
const confirmDeleteWork = async () => {
  try {
    uploading.value = true;
    await deleteOpus(deleteWorkId.value);
    ElMessage.success(t("personalCenter.deleteSuccess"));
    showDeleteWorkModal.value = false;
    deleteWorkId.value = "";
    loadWorksList();
  } catch (error: any) {
    console.error("删除作品失败:", error);
  } finally {
    uploading.value = false;
  }
};

// 下载作品
const handleDownloadWork = async (work: any) => {
  try {
    if (!work.opusOssId) {
      ElMessage.warning(t("personalCenter.noWorkFile"));
      return;
    }
    const blobUrl = await downloadOSS(work.opusOssId);
    const link = document.createElement("a");
    link.href = blobUrl;
    // 从 opusUrl 获取文件名，或使用作品名称
    const fileName = work.opusUrl
      ? work.opusUrl.split("/").pop()
      : `${work.opusName}.ucdx`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    ElMessage.success(t("personalCenter.downloadSuccess"));
  } catch (error: any) {
    ElMessage.error(error.message || t("personalCenter.downloadFailed"));
  }
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
    if (!zipFile) {
      return;
    }

    try {
      downloadZipFile(zipFile);
      ElMessage.success(`项目已保存：${zipFile.name}`);
    } catch (error) {
      console.error("下载项目文件失败:", error);
      ElMessage.error("下载项目文件失败");
    }
    return;
  }

  if (messageType !== "send-works-sb3" && messageType !== "send-works-mc") {
    return;
  }

  if (!currentIframeOpus.value?.opusId) {
    ElMessage.warning("当前作品缺少 opusId");
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

  if (!workFile || !coverFile || savingIframeOpus.value) {
    if (!coverFile) {
      ElMessage.warning("当前作品缺少封面文件，无法保存");
    }
    return;
  }

  savingIframeOpus.value = true;
  try {
    const {
      opusOssId,
      coverOssId,
      opusId,
      opusGuide,
      opusDesc,
      opusName,
      opusType,
    } = currentIframeOpus.value;

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
    const nextOpusType =
      normalizeToolId(opusType || activeTool.value) === "nous" ? "nous" : "vinci";

    if (!uploadResult?.ossId || !coverUploadResult?.ossId) {
      throw new Error("作品保存参数不完整");
    }

    await editOpus({
      opusId: String(opusId),
      opusName: nextOpusName,
      opusOssId: String(uploadResult.ossId),
      coverOssId: String(coverUploadResult.ossId),
      opusType: nextOpusType,
      opusGuide,
      opusDesc,
    } as any);

    ElMessage.success(t("common.editSuccess"));
    closeToolIframeModal();
    await loadWorksList();
  } catch (error: any) {
    console.error("保存作品失败:", error);
    ElMessage.error(error.message || "保存作品失败");
  } finally {
    savingIframeOpus.value = false;
  }
};

// 触发作品文件上传
const triggerWorkUpload = () => {
  if (isAnyChunkUploading.value) {
    ElMessage.warning("请等待当前上传完成或先取消上传");
    return;
  }
  workFileInput.value?.click();
};

// 触发封面上传
const triggerCoverUpload = () => {
  if (isAnyChunkUploading.value) {
    ElMessage.warning("请等待当前上传完成或先取消上传");
    return;
  }
  coverFileInput.value?.click();
};

// 触发视频上传
const triggerVideoUpload = () => {
  if (isAnyChunkUploading.value) {
    ElMessage.warning("请等待当前上传完成或先取消上传");
    return;
  }
  videoFileInput.value?.click();
};

// 触发图片上传
const triggerImageUpload = () => {
  if (isAnyChunkUploading.value) {
    ElMessage.warning("请等待当前上传完成或先取消上传");
    return;
  }
  imageFileInput.value?.click();
};

// 获取作品文件允许的扩展名（根据工具类型）
const getWorkExtension = () => {
  switch (activeTool.value) {
    case "vinci":
      return ".mc";
    case "nous":
      return ".sb3";
    default:
      return "";
  }
};

// 处理作品文件选择
const handleWorkFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // 检查文件类型
  const allowedExt = getWorkExtension();
  if (allowedExt && !file.name.toLowerCase().endsWith(allowedExt)) {
    ElMessage.warning(t("personalCenter.onlyAllowedFile", { ext: allowedExt }));
    input.value = "";
    return;
  }

  try {
    uploading.value = true;
    const result = await startWorkChunkUpload(file);
    if (!result) {
      return;
    }
    uploadForm.value.workFileName = file.name;
    uploadForm.value.workOssId = result.ossId;
    ElMessage.success(t("personalCenter.uploadSuccess"));
  } catch (error: any) {
    ElMessage.error(error.message || t("personalCenter.uploadFailed"));
  } finally {
    uploading.value = false;
    input.value = "";
  }
};

// 处理视频文件选择
const handleVideoFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  resetVideoChunkUpload();

  // 检查文件类型
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".mp4") && !fileName.endsWith(".mov")) {
    ElMessage.warning(t("personalCenter.onlyVideoFile"));
    input.value = "";
    return;
  }

  // 检查文件大小（200MB）
  if (file.size > 200 * 1024 * 1024) {
    ElMessage.warning(t("personalCenter.videoSizeLimit"));
    input.value = "";
    return;
  }

  try {
    uploading.value = true;
    const result = await startVideoChunkUpload(file);
    if (!result) {
      return;
    }
    revokeUploadPreviewUrl();
    uploadForm.value.videoFileName = file.name;
    uploadForm.value.videoOssId = result.ossId;
    uploadForm.value.previewUrl =
      typeof window !== "undefined" ? URL.createObjectURL(file) : "";
    ElMessage.success(t("personalCenter.uploadSuccess"));
  } catch (error: any) {
    ElMessage.error(error.message || t("personalCenter.uploadFailed"));
  } finally {
    uploading.value = false;
    input.value = "";
  }
};

const removeVideoFile = () => {
  revokeUploadPreviewUrl();
  resetVideoChunkUpload();
  uploadForm.value.videoFileName = "";
  uploadForm.value.videoOssId = "";
  uploadForm.value.previewUrl = "";
  if (videoFileInput.value) {
    videoFileInput.value.value = "";
  }
};

// 处理图片文件选择（多图上传）
const handleImageFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  // 检查数量限制
  const remainingSlots = 6 - uploadForm.value.imageList.length;
  if (files.length > remainingSlots) {
    ElMessage.warning(t("personalCenter.imageMaxLimit"));
    input.value = "";
    return;
  }

  const candidateFiles = Array.from(files);
  let successCount = 0;

  imageUploadCancelled.value = false;

  for (const file of candidateFiles) {
    // 检查文件类型
    const fileName = file.name.toLowerCase();
    if (
      !fileName.endsWith(".jpg") &&
      !fileName.endsWith(".jpeg") &&
      !fileName.endsWith(".png") &&
      !fileName.endsWith(".gif")
    ) {
      ElMessage.warning(t("personalCenter.onlyImageFileGif"));
      continue;
    }

    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning(t("personalCenter.imageSizeLimit"));
      continue;
    }

    try {
      uploading.value = true;
      const result = await startImageChunkUpload(file);
      if (!result) {
        if (imageUploadCancelled.value) {
          break;
        }
        continue;
      }
      const previewUrl = resolveUploadedImageUrl(result, file);
      uploadForm.value.imageList.push({
        url: previewUrl,
        ossId: result.ossId,
      });
      currentImageIndex.value = uploadForm.value.imageList.length - 1;
      successCount++;
    } catch (error: any) {
      ElMessage.error(error.message || t("personalCenter.uploadFailed"));
      break;
    }
  }

  uploading.value = false;
  input.value = "";
  if (successCount > 0 && !imageUploadCancelled.value) {
    ElMessage.success(t("personalCenter.uploadSuccess"));
  }
  imageUploadCancelled.value = false;
};

// 删除图片
const removeImage = (index: number) => {
  revokeBlobPreviewUrl(uploadForm.value.imageList[index]?.url);
  uploadForm.value.imageList.splice(index, 1);
  if (currentImageIndex.value >= uploadForm.value.imageList.length) {
    currentImageIndex.value = Math.max(0, uploadForm.value.imageList.length - 1);
  }
};

// 轮播图上一张
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = uploadForm.value.imageList.length - 1;
  }
};

// 轮播图下一张
const nextImage = () => {
  if (currentImageIndex.value < uploadForm.value.imageList.length - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

// 处理封面文件选择
const handleCoverFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // 检查文件类型
  const fileName = file.name.toLowerCase();
  if (
    !fileName.endsWith(".jpg") &&
    !fileName.endsWith(".jpeg") &&
    !fileName.endsWith(".png")
  ) {
    ElMessage.warning(t("personalCenter.onlyImageFile"));
    input.value = "";
    return;
  }

  try {
    uploading.value = true;
    const result = await startCoverChunkUpload(file);
    if (!result) {
      return;
    }
    revokeBlobPreviewUrl(uploadForm.value.coverUrl);
    uploadForm.value.coverUrl = resolveUploadedImageUrl(result, file);
    uploadForm.value.coverOssId = result.ossId;
    ElMessage.success(t("personalCenter.uploadSuccess"));
  } catch (error: any) {
    ElMessage.error(error.message || t("personalCenter.uploadFailed"));
  } finally {
    uploading.value = false;
    input.value = "";
  }
};

// 提交作品
const handleSubmitWork = async () => {
  if (isAnyChunkUploading.value) {
    ElMessage.warning("文件还在上传中，请稍后再提交");
    return;
  }

  if (!uploadForm.value.name) {
    ElMessage.warning(t("personalCenter.pleaseInputWorkName"));
    return;
  }

  // 至少要上传一种内容（作品/视频/图片）
  if (
    !uploadForm.value.workOssId &&
    !uploadForm.value.videoOssId &&
    uploadForm.value.imageList.length === 0
  ) {
    ElMessage.warning(t("personalCenter.pleaseUploadContent"));
    return;
  }

  if (!uploadForm.value.coverOssId) {
    ElMessage.warning(t("personalCenter.pleaseUploadCover"));
    return;
  }

  try {
    uploading.value = true;

    // 构建提交数据
    const submitData: any = {
      opusName: uploadForm.value.name,
      coverOssId: uploadForm.value.coverOssId,
      opusGuide: uploadForm.value.guide,
      opusDesc: uploadForm.value.description,
      opusType: activeTool.value,
    };

    // 根据实际上传的内容添加对应字段
    if (uploadForm.value.workOssId) {
      submitData.opusOssId = uploadForm.value.workOssId;
    }
    if (uploadForm.value.videoOssId) {
      submitData.videoOssId = uploadForm.value.videoOssId;
    }
    if (uploadForm.value.imageList.length > 0) {
      // 图片用逗号隔开
      submitData.picOssIds = uploadForm.value.imageList.map((img) => img.ossId).join(",");
    }

    console.log("submitData:", submitData);

    if (isEditMode.value) {
      // 编辑模式
      submitData.opusId = editOpusId.value;
      await editOpus(submitData);
      ElMessage.success(t("common.editSuccess"));
    } else {
      // 新增模式
      await addOpus(submitData);
      ElMessage.success(t("personalCenter.submitSuccess"));
    }

    closeUploadModal();
    // 刷新列表
    loadWorksList();
  } catch (error: any) {
    console.error("提交作品失败:", error);
  } finally {
    uploading.value = false;
  }
};

const uploadTabs = computed(() => [
  { value: "work", label: `*${currentToolLabel.value}${t("personalCenter.works")}` },
  { value: "video", label: t("personalCenter.video") },
  { value: "image", label: t("personalCenter.image") },
]);

const currentToolLabel = computed(() => {
  const tool = tools.find((t) => t.value === activeTool.value);
  return tool ? tool.label : "vinci";
});

const tabs = computed(() => {
  if (isCityOrDistrictAdmin.value) {
    return [{ value: "settings", label: t("personalCenter.accountSettings") }];
  }
  return [
    { value: "works", label: t("personalCenter.myWorks") },
    { value: "settings", label: t("personalCenter.accountSettings") },
  ];
});

const tools = [
  { value: "vinci", label: "MatataCode(VinciBot)" },
  { value: "nous", label: "MatataCode(Nous)" },
];

// 获取作品列表
const loadWorksList = async () => {
  if (isCityOrDistrictAdmin.value) {
    worksList.value = [];
    pagination.value.total = 0;
    return;
  }
  try {
    worksLoading.value = true;
    const res = await getProfileopus(
      pagination.value.pageSize,
      pagination.value.pageNum,
      searchKeyword.value || undefined,
      activeTool.value
    );
    worksList.value = res.rows || [];
    pagination.value.total = res.total || 0;
  } catch (error: any) {
    console.error("获取作品列表失败:", error);
    worksList.value = [];
  } finally {
    worksLoading.value = false;
  }
};

// 监听工具切换、筛选条件变化
watch([activeTool, searchKeyword], () => {
  if (isCityOrDistrictAdmin.value) return;
  pagination.value.pageNum = 1;
  loadWorksList();
});

watch(isCityOrDistrictAdmin, (isAdmin) => {
  if (!isAdmin) return;
  activeTab.value = "settings";
  showUploadModal.value = false;
  worksList.value = [];
  pagination.value.total = 0;
});

// 分页变化
const handlePageChange = () => {
  if (isCityOrDistrictAdmin.value) return;
  loadWorksList();
};

// 加载用户信息
const loadUserProfile = async () => {
  try {
    const data = await getProfile();
    userProfile.value = data;
    syncUserInfo(data?.user || null);
  } catch (error: any) {
    console.error("获取用户信息失败:", error);
  }
};

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement | null;
  if (!target) return;
  target.src = defaultAvatar;
};

// 初始化加载
onMounted(async () => {
  await loadUserProfile();
  if (!isCityOrDistrictAdmin.value) {
    loadWorksList();
  }
  window.addEventListener("message", handleToolIframeMessage);
});

onBeforeUnmount(() => {
  revokeUploadPreviewUrl();
  revokeSupplementalPreviewUrls();
  window.removeEventListener("message", handleToolIframeMessage);
});

const works = computed(() => worksList.value);

const isSvgCoverUrl = (value: unknown) =>
  /\.svg(?:$|\?)/i.test(String(value || "").trim());
const getSvgCoverStyle = (value: unknown) => {
  const url = String(value || "")
    .trim()
    .replace(/"/g, '\\"');
  return {
    backgroundImage: `url("${url}")`,
  };
};

const handleBack = () => router.back();
</script>

<style scoped>
.personalcenter {
  min-height: 100vh;
  background: url("~/assets/images/bg_center.png") no-repeat center top;
  background-size: 100% auto;
  background-color: #f1f5f8;
  position: relative;
}

/* Back Button */
.back-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.back-btn svg {
  width: 16px;
  height: 16px;
  color: #666;
}

.back-btn:hover {
  background: #f5f5f5;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 120px 40px 40px 60px;
}

/* User Section */
.user-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 20px;
}

/* Main Panel */
.main-panel {
  display: flex;
  gap: 16px;
  height: calc(100vh - 280px);
}

.user-avatar {
  position: relative;
  flex-shrink: 0;
}

.user-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.role-tag {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff9900;
  color: white;
  font-size: 10px;
  padding: 2px 10px;
  border-radius: 4px;
  white-space: nowrap;
}

.user-info {
  padding-top: 4px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.user-school {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 13px;
  margin-top: 4px;
  cursor: pointer;
}

.user-school svg {
  width: 14px;
  height: 14px;
}

.user-school:hover {
  text-decoration: underline;
}

.user-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.tag-orange {
  background: #ff9900;
  color: white;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
}

.tag-white {
  background: white;
  color: #666;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
}

.help-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.help-btn svg {
  width: 12px;
  height: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* Main Panel */
.main-panel {
  display: flex;
  gap: 16px;
}

/* Sidebar */
.sidebar {
  width: 180px;
  background: white;
  border-radius: 12px;
  padding: 8px 0;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.sidebar-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-item svg {
  width: 18px;
  height: 18px;
}

.sidebar-item:hover {
  background: #f5f5f5;
}

.sidebar-item.active {
  background: #e6f7ff;
  color: #ff9900;
}

/* Content */
.content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  min-height: 450px;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* Tab Row */
.tab-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.tool-tabs {
  display: flex;
  gap: 0;
}

.tool-tab {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-left: none;
  background: white;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
}

.tool-tab:first-child {
  border-left: 1px solid #e4e7ed;
  border-radius: 4px 0 0 0;
}

.tool-tab:last-child {
  border-radius: 0 4px 0 0;
}

.tool-tab:hover {
  color: #ff9900;
}

.tool-tab.active {
  background: #ff9900;
  color: white;
  border-color: #ff9900;
}

.grid-toggle {
  width: 32px;
  height: 32px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.grid-toggle:hover {
  border-color: #ff9900;
  color: #ff9900;
}

.grid-toggle svg {
  width: 20px;
  height: 20px;
  color: #999;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box input {
  width: 100%;
  padding: 6px 32px 6px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
}

.search-box input:focus {
  border-color: #ff9900;
}

.search-box svg {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
}

/* Search Box */
.search-box {
  position: relative;
  width: 200px;
}

.search-box input {
  width: 100%;
  padding: 6px 32px 6px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background: white;
}

.search-box input:focus {
  border-color: #ff9900;
}

.search-box svg {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #999;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: #ff9900;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.upload-btn svg {
  width: 14px;
  height: 14px;
}

.upload-btn:hover {
  background: #e68a00;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 160px;
  height: 160px;
  margin-bottom: 20px;
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

.empty-link {
  color: #1890ff;
  text-decoration: none;
  margin-left: 4px;
}

.empty-link:hover {
  text-decoration: underline;
}

/* Works Grid */
.works-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.work-card {
  box-sizing: border-box;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  transition: all 0.3s;
}

.work-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
  border-color: #d0d0d0;
}

.work-preview {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #f5f8fa 0%, #e8eef2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.work-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-cover-svg {
  width: 100%;
  height: 100%;
  display: block;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.preview-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-avatar img {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.work-info {
  padding: 16px;
  background: white;
}

.work-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-date {
  font-size: 12px;
  color: #bbb;
}

.work-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.action-link {
  background: none;
  border: none;
  font-size: 12px;
  color: #ff9900;
  cursor: pointer;
  transition: color 0.2s;
}

.action-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.more-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: #ccc;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.more-btn svg {
  width: 18px;
  height: 18px;
}

.more-btn:hover {
  color: #999;
  background: #f5f5f5;
}

/* More Dropdown */
.more-dropdown {
  position: relative;
  margin-left: auto;
}

.dropdown-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 8px 0;
  min-width: 100px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.2s;
  z-index: 100;
}

.dropdown-menu::after {
  content: "";
  position: absolute;
  bottom: -6px;
  right: 12px;
  width: 12px;
  height: 12px;
  background: white;
  transform: rotate(45deg);
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.05);
}

.more-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 10px 20px;
  border: none;
  background: none;
  text-align: left;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.delete {
  color: #ff4d4f;
}

.dropdown-item.delete:hover {
  background: #fff1f0;
}

/* Settings */
.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.settings-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  color: #666;
  line-height: 24px;
}

.settings-row-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.settings-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.settings-link {
  font-size: 14px;
  color: #ff9900;
  text-decoration: none;
  cursor: pointer;
}

.settings-link:hover {
  text-decoration: underline;
}

.settings-hint {
  font-size: 14px;
  color: #999;
  margin-left: 8px;
}

.settings-hint.delete {
  color: #999;
}

/* Works Pagination */
.works-pagination {
  margin-top: 102px;
  padding-bottom: 16px;
  display: flex;
  justify-content: center;
}

/* Works List View */
.works-list {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: visible;
}

.list-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.list-row {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #333;
  transition: background 0.2s;
  position: relative;
}

.list-row:last-child {
  border-bottom: none;
}

.list-row:hover {
  background: #fafafa;
}

.col-index {
  width: 60px;
  color: #999;
}
.col-name {
  width: 300px;
  font-weight: 500;
  text-align: center;
}
.col-date {
  width: 160px;
  color: #999;
  text-align: center;
}
.col-actions {
  width: 300px;
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.list-action {
  padding: 4px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.list-action:hover {
  border-color: #ff9900;
  color: #ff9900;
}

/* Tool Iframe */
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

/* List More Dropdown */
.list-more-dropdown {
  position: relative;
  margin-left: auto;
}

.list-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 8px 0;
  min-width: 100px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s;
  z-index: 1000;
}

.list-more-dropdown:hover .list-dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Upload Modal */
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

.modal-content {
  background: white;
  border-radius: 12px;
  width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.modal-close svg {
  width: 20px;
  height: 20px;
  color: #999;
}

.modal-close:hover {
  background: #f5f5f5;
}

.modal-close:hover svg {
  color: #666;
}

.modal-body {
  display: flex;
  padding: 24px;
  gap: 24px;
}

.modal-left {
  flex: 1;
}

.modal-right {
  width: 320px;
}

/* Upload Tabs */
.upload-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
}

.upload-tab {
  padding: 8px 20px;
  border: 1px solid #e4e7ed;
  border-right: none;
  background: white;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-tab:first-child {
  border-radius: 4px 0 0 4px;
}

.upload-tab:last-child {
  border-right: 1px solid #e4e7ed;
  border-radius: 0 4px 4px 0;
}

.upload-tab:hover {
  color: #ff9900;
}

.upload-tab.active {
  background: #ff9900;
  border-color: #ff9900;
  color: white;
}

/* Upload Preview */
.upload-preview {
  width: 100%;
  height: 280px;
  background: linear-gradient(135deg, #e8f4fc 0%, #d4ebf7 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

/* Carousel Buttons */
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.carousel-btn:hover {
  background: #f5f5f5;
}

.carousel-btn svg {
  width: 20px;
  height: 20px;
  color: #666;
}

.carousel-btn.prev {
  left: 16px;
}

.carousel-btn.next {
  right: 16px;
}

/* File Upload Section */
.file-upload-section {
  margin-top: 16px;
}

.upload-label {
  font-size: 14px;
  color: #333;
  margin: 0 0 12px 0;
}

/* Image Upload List (Multi) */
.image-upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-upload-item {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: visible;
  position: relative;
  border: 1px solid #e8e8e8;
}

.image-upload-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.image-delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  z-index: 10;
}

.image-delete-btn svg {
  width: 24px;
  height: 24px;
}

.image-upload-add {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.image-upload-add:hover {
  border-color: #ff9900;
}

.add-btn {
  padding: 8px 16px;
  background: #ff9900;
  color: white;
  border-radius: 4px;
  font-size: 13px;
}

.upload-label-hint {
  font-size: 12px;
  color: #999;
}

.upload-btn-primary {
  padding: 8px 20px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.upload-btn-primary:hover {
  background: #40a9ff;
}

.uploaded-file-info {
  margin-top: 12px;
  font-size: 13px;
  color: #52c41a;
}

/* Form Items */
.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.form-label.required::before {
  content: "*";
  color: #ff4d4f;
  margin-right: 4px;
}

.form-input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #ff9900;
}

.input-count {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #999;
}

.form-textarea {
  width: 100%;
  height: 100px;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  resize: none;
  box-sizing: border-box;
}

.form-textarea.small {
  height: 70px;
}

.form-textarea:focus {
  border-color: #ff9900;
}

.textarea-count {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: #999;
}

/* Cover Upload */
.cover-upload-box {
  width: 160px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fafafa;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;
}

.cover-upload-box:hover {
  border-color: #ff9900;
}

.cover-upload-box.uploaded {
  border-style: solid;
  border-color: #d9d9d9;
}

.cover-upload-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ff9900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-upload-icon svg {
  width: 18px;
  height: 18px;
  color: white;
}

.cover-upload-text {
  font-size: 13px;
  color: #666;
}

.cover-upload-hint {
  font-size: 11px;
  color: #bbb;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.cover-upload-box.uploaded:hover .cover-overlay {
  opacity: 1;
}

.cover-overlay svg {
  width: 20px;
  height: 20px;
  color: white;
}

.cover-overlay span {
  font-size: 12px;
  color: white;
}

/* File Upload Box */
.file-upload-box {
  width: 160px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.file-upload-box:hover {
  border-color: #ff9900;
}

.file-upload-box.uploaded {
  border-style: solid;
  border-color: #d9d9d9;
}

.file-upload-box--uploading {
  border-style: solid;
  border-color: rgba(255, 174, 74, 0.78);
  background: linear-gradient(180deg, #fffdfa 0%, #fff8f0 100%);
  box-shadow: 0 10px 24px rgba(255, 153, 0, 0.08);
}

.file-upload-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ff9900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-icon svg {
  width: 18px;
  height: 18px;
  color: white;
}

.file-upload-text {
  font-size: 13px;
  color: #666;
}

.file-upload-hint {
  font-size: 11px;
  color: #bbb;
}

.file-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #ff6b6b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 12;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s, background 0.2s, color 0.2s;
}

.file-delete-btn:hover {
  background: #ff6b6b;
  color: #fff;
  transform: scale(1.05);
}

.file-delete-btn svg {
  width: 12px;
  height: 12px;
}

.file-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-upload-box.uploaded:hover .file-overlay {
  opacity: 1;
}

.file-overlay svg {
  width: 24px;
  height: 24px;
  color: white;
}

.file-overlay span {
  font-size: 12px;
  color: white;
}

.file-upload-progress-mask {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(255, 253, 250, 0.9) 0%, rgba(255, 248, 240, 0.92) 100%);
  backdrop-filter: blur(2px);
}

.file-upload-progress-card {
  width: 88px;
  min-height: 84px;
  padding: 8px 8px 10px;
  border-radius: 16px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #edf1fb 0%, #e7ecf9 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 8px 18px rgba(148, 165, 210, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.file-upload-progress-card--error {
  background: linear-gradient(180deg, #fff1f1 0%, #ffe7e7 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 8px 18px rgba(255, 107, 107, 0.12);
}

.file-upload-progress-ring {
  position: relative;
  width: 48px;
  height: 48px;
}

.file-upload-progress-ring svg {
  width: 48px;
  height: 48px;
  transform: rotate(-90deg);
}

.file-upload-progress-track,
.file-upload-progress-value {
  fill: none;
  stroke-width: 6;
}

.file-upload-progress-track {
  stroke: rgba(255, 179, 87, 0.22);
}

.file-upload-progress-value {
  stroke: #ffad4e;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.2s ease;
}

.file-upload-progress-ring strong {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.file-upload-progress-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: #e05b5b;
}

.file-upload-cancel {
  min-width: 82px;
  height: 28px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #53b7ff 0%, #39a5ff 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(57, 165, 255, 0.18);
  transition: background 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
}

.file-upload-cancel:hover {
  background: linear-gradient(180deg, #45afff 0%, #2497f7 100%);
  transform: translateY(-1px);
}

.upload-status-tip {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.5;
}

.upload-status-tip--error {
  color: #ff4d4f;
}

.preview-image.full {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-video.full {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.file-preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
  display: block;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-cancel {
  padding: 10px 40px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.btn-cancel:hover {
  border-color: #ff9900;
  color: #ff9900;
}

.btn-submit {
  padding: 10px 40px;
  border: none;
  border-radius: 4px;
  background: #ff9900;
  font-size: 14px;
  color: white;
  cursor: pointer;
}

.btn-submit:hover {
  background: #e68a00;
}

/* Password Modal */
.password-modal {
  background: white;
  border-radius: 12px;
  width: 480px;
  padding: 32px 40px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.password-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-modal-close svg {
  width: 24px;
  height: 24px;
  color: #999;
}

.password-modal-close:hover svg {
  color: #666;
}

.password-modal-title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 32px 0;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-field {
  display: flex;
  flex-direction: column;
}

.password-input-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
}

.password-input-box.error {
  border-color: #ff4d6a;
  background: white;
}

.field-error {
  font-size: 13px;
  color: #ff4d6a;
  margin: 6px 0 0 0;
}

.password-input-box svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.password-input-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}

.password-input-box input::placeholder {
  color: #bbb;
}

.password-eye-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-eye-btn svg {
  width: 20px;
  height: 20px;
}

.password-eye-btn:hover svg {
  stroke: #ff9900;
}

.password-input-box:focus-within {
  border-color: #ff9900;
  background: white;
}

.password-hint {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0 0;
}

.password-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
}

.btn-password-cancel {
  padding: 12px 48px;
  border: 1px solid #d9d9d9;
  border-radius: 24px;
  background: white;
  font-size: 16px;
  color: #666;
  cursor: pointer;
}

.btn-password-cancel:hover {
  border-color: #ff9900;
  color: #ff9900;
}

.btn-password-save {
  padding: 12px 48px;
  border: none;
  border-radius: 24px;
  background: #ff9900;
  font-size: 16px;
  color: white;
  cursor: pointer;
}

.btn-password-save:hover {
  background: #e68a00;
}

/* Delete Account Modal */
.delete-modal-desc {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
}

.toggle-password {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

/* Confirm Modal (Delete Work) */
.confirm-modal {
  background: white;
  border-radius: 12px;
  width: 420px;
  padding: 24px;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.confirm-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-modal-close svg {
  width: 20px;
  height: 20px;
  color: #999;
}

.confirm-modal-close:hover svg {
  color: #666;
}

.confirm-modal-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
}

.confirm-modal-content {
  text-align: center;
  margin-bottom: 24px;
}

.confirm-main-text {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
}

.confirm-sub-text {
  font-size: 14px;
  color: #999;
  margin: 0;
  line-height: 1.8;
}

.confirm-modal-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-confirm-cancel {
  padding: 10px 40px;
  border: 1px solid #d9d9d9;
  border-radius: 24px;
  background: white;
  font-size: 15px;
  color: #ff9900;
  cursor: pointer;
}

.btn-confirm-cancel:hover {
  border-color: #ff9900;
}

.btn-confirm-ok {
  padding: 10px 40px;
  border: none;
  border-radius: 24px;
  background: #ff9900;
  font-size: 15px;
  color: white;
  cursor: pointer;
}

.btn-confirm-ok:hover {
  background: #e68a00;
}
</style>
