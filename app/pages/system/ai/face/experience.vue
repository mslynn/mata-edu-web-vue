<template>
  <div
    class="face-demo-workspace"
    :class="{ 'face-demo-workspace--intro': currentStep === 'intro' }"
  >
    <div class="face-demo-page">
      <div
        class="face-demo-shell"
        :class="{ 'face-demo-shell--wide': currentStep === 'method' }"
      >
        <div v-if="currentStep === 'intro'" class="face-demo-breadcrumb">
          控制台
          <span>/</span>
          <span class="face-demo-breadcrumb__current">ai实践中心</span>
        </div>

        <main
          class="face-demo-stage"
          :class="{ 'face-demo-stage--intro': currentStep === 'intro' }"
        >
          <section v-if="currentStep === 'intro'" class="scene scene--intro">
            <div class="intro-copy">
              <div class="intro-copy__stack">
                <span class="intro-copy__eyebrow">视觉智能系统</span>
                <div class="intro-copy__card">
                  <h2>
                    <span class="intro-copy__title-line">开启智慧校园的</span>
                    <span class="intro-copy__title-line intro-copy__title-line--accent"
                      >非感官视觉门户</span
                    >
                  </h2>
                  <p>
                    基于最先进的深度学习算法，实现毫秒级响应的学生识别与管理。为您打造无感考勤、
                    安全门禁、课堂参与度分析等全场景智能闭环。
                  </p>
                </div>

                <button
                  type="button"
                  class="intro-copy__action"
                  :disabled="savingProfile"
                  @click="handleStartExperience"
                >
                  <span>立即开始体验</span>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12h14"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M13 6l6 6-6 6"
                      stroke="currentColor"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span class="intro-copy__action-shine"></span>
                </button>
              </div>
            </div>

            <div class="intro-visual">
              <div class="intro-visual__glow intro-visual__glow--top"></div>
              <div class="intro-visual__glow intro-visual__glow--bottom"></div>
              <div class="intro-visual-card">
                <img
                  class="intro-visual-card__portrait"
                  src="/face-demo/stitch-hero-main.jpg"
                  alt="人脸识别演示人物"
                />
                <div class="intro-visual-card__grid"></div>
                <div class="intro-visual-card__scanline"></div>
                <span
                  class="intro-visual-card__point intro-visual-card__point--left-eye"
                ></span>
                <span
                  class="intro-visual-card__point intro-visual-card__point--right-eye"
                ></span>
                <span
                  class="intro-visual-card__point intro-visual-card__point--nose"
                ></span>
                <span
                  class="intro-visual-card__point intro-visual-card__point--left-mouth"
                ></span>
                <span
                  class="intro-visual-card__point intro-visual-card__point--right-mouth"
                ></span>

                <div class="intro-visual-card__badge">
                  <span class="intro-visual-card__badge-icon">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 3l6.5 2.6V11c0 4.5-2.8 8.5-6.5 10-3.7-1.5-6.5-5.5-6.5-10V5.6L12 3Z"
                        fill="currentColor"
                      />
                      <path
                        d="M9.5 12.2l1.7 1.7 3.5-3.8"
                        stroke="#ffffff"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <strong>身份已验证</strong>
                    <span>准入权限：全校区</span>
                  </div>
                </div>

                <div class="intro-visual-card__panel">
                  <div class="intro-visual-card__panel-head">
                    <div class="intro-visual-card__panel-copy">
                      <span class="intro-visual-card__panel-label">生物特征分析</span>
                      <strong>99.8%</strong>
                    </div>
                    <span class="intro-visual-card__panel-side">匹配度</span>
                  </div>
                  <div class="intro-visual-card__progress">
                    <span></span>
                  </div>
                  <div class="intro-visual-card__panel-tags">
                    <span><i></i>骨骼对齐</span>
                    <span><i></i>活体检测</span>
                  </div>
                </div>

                <span
                  class="intro-visual-card__corner intro-visual-card__corner--top-left"
                ></span>
                <span
                  class="intro-visual-card__corner intro-visual-card__corner--top-right"
                ></span>
                <span
                  class="intro-visual-card__corner intro-visual-card__corner--bottom-left"
                ></span>
                <span
                  class="intro-visual-card__corner intro-visual-card__corner--bottom-right"
                ></span>
              </div>
            </div>
          </section>

          <section v-else-if="currentStep === 'name'" class="scene scene--name">
            <div class="campus-stage">
              <div class="campus-stage__sky"></div>
              <div class="campus-stage__ground"></div>
              <div class="campus-stage__school">
                <div class="campus-stage__building campus-stage__building--left"></div>
                <div class="campus-stage__building campus-stage__building--center"></div>
                <div class="campus-stage__building campus-stage__building--right"></div>
                <div class="campus-stage__roof"></div>
                <div class="campus-stage__flagpole"></div>
                <div class="campus-stage__flag"></div>
                <div class="campus-stage__sign">AI 学校</div>
              </div>
              <img
                class="campus-stage__robot"
                src="/stitch/ceshi2/03-robot-mascot.png"
                alt="机器人"
              />

              <div class="campus-stage__panel">
                <div class="name-side-panel">
                  <div class="name-side-panel__card name-side-panel__card--identity">
                    <div class="name-side-panel__identity-head">
                      <span class="name-side-panel__identity-icon" aria-hidden="true">
                        <svg viewBox="0 0 48 48" fill="none">
                          <circle
                            cx="24"
                            cy="15.5"
                            r="7"
                            fill="currentColor"
                            opacity="0.18"
                          />
                          <circle
                            cx="24"
                            cy="15.5"
                            r="7"
                            stroke="currentColor"
                            stroke-width="3"
                          />
                          <path
                            d="M12 37c1.6-6.1 6.7-10 12-10s10.4 3.9 12 10"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                          />
                        </svg>
                      </span>
                      <div class="name-side-panel__identity-copy">
                        <h2>身份标记</h2>
                        <p>请完善目标姓名信息</p>
                      </div>
                    </div>

                    <div class="name-side-panel__field">
                      <label class="name-side-panel__label" for="face-demo-name-input">
                        姓名
                      </label>
                      <div class="name-side-panel__input-shell">
                        <input
                          id="face-demo-name-input"
                          v-model.trim="draftName"
                          class="name-side-panel__input"
                          type="text"
                          maxlength="20"
                          placeholder="请输入学生或人员姓名"
                          @keydown.enter="handleConfirmName"
                        />
                      </div>
                    </div>

                    <div class="name-side-panel__actions">
                      <button
                        type="button"
                        class="secondary-button"
                        @click="handleReturnHome"
                      >
                        返回
                      </button>
                      <button
                        type="button"
                        class="primary-button"
                        @click="handleConfirmName"
                      >
                        确定
                      </button>
                    </div>
                  </div>

                  <div class="name-side-panel__card name-side-panel__card--records">
                    <div class="name-side-panel__records-head">
                      <h3>已录入人脸信息</h3>
                      <button
                        v-if="profiles.length"
                        type="button"
                        class="name-side-panel__text-action"
                        @click="handleClearProfiles"
                      >
                        清空
                      </button>
                    </div>

                    <div class="name-side-panel__records-list">
                      <article
                        v-if="profiles.length"
                        v-for="profile in profiles"
                        :key="profile.id"
                        class="name-side-panel__record"
                      >
                        <div class="name-side-panel__record-avatar-shell">
                          <img
                            :src="profile.avatarDataUrl"
                            :alt="profile.name"
                            class="name-side-panel__record-avatar"
                          />
                        </div>
                        <div class="name-side-panel__record-copy">
                          <strong>{{ profile.name }}</strong>
                          <span>{{ formatProfileTime(profile.createdAt) }}</span>
                        </div>
                        <div class="name-side-panel__record-actions">
                          <button
                            type="button"
                            class="name-side-panel__record-action name-side-panel__record-action--edit"
                            disabled
                            title="重新录入"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25Z"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M13.88 7.12l2.75 2.75"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            class="name-side-panel__record-action name-side-panel__record-action--delete"
                            :aria-label="'删除' + profile.name"
                            title="删除当前人脸"
                            @click="handleDeleteProfile(profile.id)"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M8.5 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M12 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M15.5 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M5 6.5h14"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M9.5 6.5V5.2c0-.66.54-1.2 1.2-1.2h2.6c.66 0 1.2.54 1.2 1.2v1.3"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M7 6.5l.7 11.06c.04.74.66 1.31 1.4 1.31h5.8c.74 0 1.36-.57 1.4-1.31L17 6.5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </article>

                      <article
                        v-else
                        class="name-side-panel__record name-side-panel__record--placeholder"
                      >
                        <div class="name-side-panel__record-avatar-shell">
                          <div
                            class="name-side-panel__record-avatar name-side-panel__record-avatar--empty"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle
                                cx="12"
                                cy="8"
                                r="3.6"
                                stroke="currentColor"
                                stroke-width="1.8"
                              />
                              <path
                                d="M5.5 18c.94-3.18 3.54-5.2 6.5-5.2s5.56 2.02 6.5 5.2"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                        <div class="name-side-panel__record-copy">
                          <strong>未命名目标 01</strong>
                          <span>等待输入姓名...</span>
                        </div>
                        <div class="name-side-panel__record-actions">
                          <button
                            type="button"
                            class="name-side-panel__record-action name-side-panel__record-action--edit"
                            disabled
                            title="重新录入"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25Z"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M13.88 7.12l2.75 2.75"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            class="name-side-panel__record-action name-side-panel__record-action--delete"
                            disabled
                            title="删除"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M8.5 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M12 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M15.5 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M5 6.5h14"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M9.5 6.5V5.2c0-.66.54-1.2 1.2-1.2h2.6c.66 0 1.2.54 1.2 1.2v1.3"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M7 6.5l.7 11.06c.04.74.66 1.31 1.4 1.31h5.8c.74 0 1.36-.57 1.4-1.31L17 6.5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-else-if="currentStep === 'method'" class="scene scene--method">
            <div class="method-scene">
              <div class="method-scene__header">
                <div class="method-scene__header-copy">
                  <nav class="method-scene__breadcrumb">
                    <span>AI 实践中心</span>
                    <span class="method-scene__breadcrumb-separator">/</span>
                    <span class="method-scene__breadcrumb-current">人脸识别</span>
                  </nav>
                  <h2>人脸数据采集及录入</h2>
                  <p>通过上传图片或开启摄像头快速完成人脸数据采集</p>
                </div>

                <div class="method-scene__header-actions">
                  <button
                    type="button"
                    class="secondary-button"
                    @click="handleReturnHome"
                  >
                    返回首页
                  </button>
                  <button
                    type="button"
                    class="secondary-button"
                    @click="currentStep = 'name'"
                  >
                    上一步
                  </button>
                  <button
                    type="button"
                    class="secondary-button"
                    @click="handleToggleFullscreen"
                  >
                    全屏
                  </button>
                </div>
              </div>

              <div class="method-scene__body">
                <div class="method-scene__stage">
                  <div class="method-scene__board">
                    <p class="method-scene__greeting">
                      {{ playerName }}，你好，下面请选择你的人脸录入方式吧
                    </p>

                    <div class="method-grid">
                      <button
                        type="button"
                        class="method-card method-card--upload"
                        @click="handleSelectMethod('upload')"
                      >
                        <div class="method-card__icon method-card__icon--upload">
                          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                            <rect
                              x="11"
                              y="10"
                              width="26"
                              height="28"
                              rx="5"
                              stroke="currentColor"
                              stroke-width="3"
                            />
                            <path
                              d="M18 25l6-7 6 7"
                              stroke="currentColor"
                              stroke-width="3"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M24 18v16"
                              stroke="currentColor"
                              stroke-width="3"
                              stroke-linecap="round"
                            />
                            <path
                              d="M16 33h16"
                              stroke="currentColor"
                              stroke-width="3"
                              stroke-linecap="round"
                            />
                          </svg>
                        </div>
                        <div class="method-card__copy">
                          <strong>上传本地图片</strong>
                          <span>支持 JPG、PNG 格式，可批量选择本地清晰人脸照片</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        class="method-card method-card--camera"
                        @click="handleSelectMethod('camera')"
                      >
                        <div class="method-card__icon method-card__icon--camera">
                          <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                            <rect
                              x="9"
                              y="14"
                              width="30"
                              height="22"
                              rx="6"
                              fill="currentColor"
                              opacity="0.12"
                            />
                            <rect
                              x="13"
                              y="16"
                              width="22"
                              height="18"
                              rx="4"
                              stroke="currentColor"
                              stroke-width="3"
                            />
                            <circle
                              cx="24"
                              cy="25"
                              r="6"
                              stroke="currentColor"
                              stroke-width="3"
                            />
                            <path
                              d="M18 12h12"
                              stroke="currentColor"
                              stroke-width="3"
                              stroke-linecap="round"
                            />
                          </svg>
                        </div>
                        <div class="method-card__copy">
                          <strong>开启摄像头</strong>
                          <span>实时视频捕获，适合现场快速采集和即时提取面部特征</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div class="method-scene__actions">
                    <button
                      type="button"
                      class="primary-button primary-button--large method-scene__primary"
                      :disabled="!profiles.length"
                      @click="handleEnterRecognition"
                    >
                      直接进入识别
                    </button>
                  </div>
                </div>

                <aside class="method-panel">
                  <div class="method-panel__card method-panel__card--identity">
                    <div class="method-panel__identity-head">
                      <span class="method-panel__identity-icon" aria-hidden="true">
                        <svg viewBox="0 0 48 48" fill="none">
                          <circle
                            cx="24"
                            cy="15.5"
                            r="7"
                            fill="currentColor"
                            opacity="0.18"
                          />
                          <circle
                            cx="24"
                            cy="15.5"
                            r="7"
                            stroke="currentColor"
                            stroke-width="3"
                          />
                          <path
                            d="M12 37c1.6-6.1 6.7-10 12-10s10.4 3.9 12 10"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                          />
                        </svg>
                      </span>
                      <div class="method-panel__identity-copy">
                        <h3>身份标记</h3>
                        <p>请完善目标姓名信息</p>
                      </div>
                    </div>

                    <div class="method-panel__field">
                      <div class="method-panel__field-head">
                        <label class="method-panel__label" for="face-demo-method-name">
                          姓名
                        </label>
                        <button
                          type="button"
                          class="method-panel__text-action"
                          @click="handleOpenNameStep"
                        >
                          重新填写
                        </button>
                      </div>
                      <div class="method-panel__input-shell">
                        <input
                          id="face-demo-method-name"
                          class="method-panel__input"
                          :value="playerName"
                          type="text"
                          readonly
                          placeholder="请输入您的姓名"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="method-panel__card method-panel__card--records">
                    <div class="method-panel__records-head">
                      <h4>已录入人脸信息</h4>
                      <button
                        v-if="profiles.length"
                        type="button"
                        class="method-panel__text-action"
                        @click="handleClearProfiles"
                      >
                        清空
                      </button>
                    </div>

                    <div v-if="profiles.length" class="method-panel__records-list">
                      <article
                        v-for="profile in profiles"
                        :key="profile.id"
                        class="method-panel__record"
                      >
                        <div class="method-panel__record-avatar-shell">
                          <img
                            :src="profile.avatarDataUrl"
                            :alt="profile.name"
                            class="method-panel__record-avatar"
                          />
                        </div>
                        <div class="method-panel__record-copy">
                          <strong>{{ profile.name }}</strong>
                          <span>{{ formatProfileTime(profile.createdAt) }}</span>
                        </div>
                        <div class="method-panel__record-actions">
                          <button
                            type="button"
                            class="method-panel__record-action method-panel__record-action--edit"
                            disabled
                            title="重新录入"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25Z"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M13.88 7.12l2.75 2.75"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            class="method-panel__record-action method-panel__record-action--delete"
                            :aria-label="'删除' + profile.name"
                            title="删除当前人脸"
                            @click="handleDeleteProfile(profile.id)"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M8.5 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M12 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M15.5 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M5 6.5h14"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M9.5 6.5V5.2c0-.66.54-1.2 1.2-1.2h2.6c.66 0 1.2.54 1.2 1.2v1.3"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M7 6.5l.7 11.06c.04.74.66 1.31 1.4 1.31h5.8c.74 0 1.36-.57 1.4-1.31L17 6.5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </article>
                    </div>

                    <div v-else class="method-panel__records-list">
                      <article
                        class="method-panel__record method-panel__record--placeholder"
                      >
                        <div class="method-panel__record-avatar-shell">
                          <div
                            class="method-panel__record-avatar method-panel__record-avatar--empty"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <circle
                                cx="12"
                                cy="8"
                                r="3.6"
                                stroke="currentColor"
                                stroke-width="1.8"
                              />
                              <path
                                d="M5.5 18c.94-3.18 3.54-5.2 6.5-5.2s5.56 2.02 6.5 5.2"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                            </svg>
                          </div>
                        </div>
                        <div class="method-panel__record-copy">
                          <strong>未命名目标 01</strong>
                          <span>等待输入姓名...</span>
                        </div>
                        <div class="method-panel__record-actions">
                          <button
                            type="button"
                            class="method-panel__record-action method-panel__record-action--edit"
                            disabled
                            title="重新录入"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M4 17.25V20h2.75L17.81 8.94l-2.75-2.75L4 17.25Z"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                              <path
                                d="M13.88 7.12l2.75 2.75"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            class="method-panel__record-action method-panel__record-action--delete"
                            disabled
                            title="删除"
                          >
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path
                                d="M8.5 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M12 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M15.5 9.5v7"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M5 6.5h14"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M9.5 6.5V5.2c0-.66.54-1.2 1.2-1.2h2.6c.66 0 1.2.54 1.2 1.2v1.3"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                              />
                              <path
                                d="M7 6.5l.7 11.06c.04.74.66 1.31 1.4 1.31h5.8c.74 0 1.36-.57 1.4-1.31L17 6.5"
                                stroke="currentColor"
                                stroke-width="1.8"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </article>
                    </div>
                  </div>
                </aside>
              </div>

              <div class="method-scene__tip">
                <span class="method-scene__tip-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="1.8"
                    />
                    <path
                      d="M12 10.2v5.1"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                    <circle cx="12" cy="7.2" r="1.1" fill="currentColor" />
                  </svg>
                </span>
                <div>
                  <h5>采集提示</h5>
                  <p>
                    建议在光线柔和的环境下采集，人脸正对镜头可获得更精准的特征提取。系统将自动过滤模糊影像。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section v-else-if="currentStep === 'capture'" class="scene scene--capture">
            <div class="capture-scene">
              <div class="capture-scene__header">
                <div>
                  <p class="capture-scene__eyebrow">{{ playerName }} 的人脸录入</p>
                  <h2>{{ captureStepTitle }}</h2>
                  <p class="capture-scene__desc">{{ captureStepDesc }}</p>
                </div>

                <div class="capture-scene__header-actions">
                  <button
                    type="button"
                    class="secondary-button"
                    @click="handleBackToMethod"
                  >
                    切换方式
                  </button>
                  <button
                    type="button"
                    class="secondary-button"
                    @click="handleReturnHome"
                  >
                    回首页
                  </button>
                </div>
              </div>

              <div class="capture-scene__body">
                <div class="capture-preview">
                  <div class="capture-preview__frame">
                    <video
                      v-if="captureMode === 'camera' && !capturePreview"
                      ref="captureVideoRef"
                      class="capture-preview__media"
                      :class="{
                        'capture-preview__media--mirrored': captureMode === 'camera',
                      }"
                      autoplay
                      muted
                      playsinline
                    ></video>

                    <img
                      v-else-if="capturePreview"
                      class="capture-preview__media"
                      :class="{
                        'capture-preview__media--mirrored': captureMode === 'camera',
                      }"
                      :src="capturePreview"
                      alt="录入预览"
                    />

                    <div v-else class="capture-preview__placeholder">
                      <div class="capture-preview__placeholder-icon">
                        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                          <path
                            d="M22 29l10-10 10 10"
                            stroke="currentColor"
                            stroke-width="4"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                          <path
                            d="M32 21v22"
                            stroke="currentColor"
                            stroke-width="4"
                            stroke-linecap="round"
                          />
                          <rect
                            x="14"
                            y="16"
                            width="36"
                            height="32"
                            rx="10"
                            stroke="currentColor"
                            stroke-width="4"
                          />
                        </svg>
                      </div>
                      <strong>等待录入素材</strong>
                      <span>{{
                        captureMode === "camera"
                          ? "先打开摄像头，再点击拍照"
                          : "上传一张清晰正脸照片"
                      }}</span>
                    </div>

                    <div class="capture-preview__guide">
                      请尽量保持单人正脸、光线充足、无遮挡
                    </div>
                  </div>

                  <canvas ref="captureCanvasRef" class="hidden-canvas"></canvas>
                </div>

                <aside class="capture-panel">
                  <div class="status-card">
                    <span class="status-card__label">运行状态</span>
                    <strong>{{ modelStatusText }}</strong>
                    <p>{{ runtimeNotice }}</p>
                  </div>

                  <div v-if="captureMode === 'camera'" class="capture-panel__group">
                    <label class="capture-panel__label" for="face-demo-camera"
                      >摄像头</label
                    >
                    <select
                      id="face-demo-camera"
                      v-model="selectedDeviceId"
                      class="capture-panel__select"
                    >
                      <option
                        v-for="device in cameraDevices"
                        :key="device.deviceId"
                        :value="device.deviceId"
                      >
                        {{ device.label || "未命名摄像头" }}
                      </option>
                    </select>
                  </div>

                  <div class="capture-panel__actions">
                    <button
                      v-if="captureMode === 'camera'"
                      type="button"
                      class="secondary-button"
                      :disabled="loadingModels"
                      @click="handleOpenCaptureCamera"
                    >
                      {{ captureVideoReady ? "重新打开摄像头" : "打开摄像头" }}
                    </button>

                    <button
                      v-if="captureMode === 'camera'"
                      type="button"
                      class="secondary-button"
                      :disabled="!captureVideoReady"
                      @click="handleTakeSnapshot"
                    >
                      拍照
                    </button>

                    <button
                      v-if="captureMode === 'upload'"
                      type="button"
                      class="secondary-button"
                      @click="triggerUploadPicker"
                    >
                      选择本地图片
                    </button>

                    <button
                      v-if="capturePreview"
                      type="button"
                      class="secondary-button"
                      @click="handleResetCapturePreview"
                    >
                      重来一次
                    </button>

                    <button
                      type="button"
                      class="primary-button"
                      :disabled="!canEnrollFace || savingProfile || loadingModels"
                      @click="handleEnrollFace"
                    >
                      {{
                        savingProfile
                          ? "录入中..."
                          : captureMode === "camera" && !capturePreview
                          ? "拍照并录入"
                          : "开始录入"
                      }}
                    </button>
                  </div>

                  <p v-if="captureError" class="capture-panel__error">
                    {{ captureError }}
                  </p>

                  <div class="capture-panel__tips">
                    <strong>录入建议</strong>
                    <ul>
                      <li>一次画面里只保留一个人脸</li>
                      <li>尽量正对镜头，不要强逆光</li>
                      <li>建议每个人录一张最清晰的头像</li>
                    </ul>
                  </div>
                </aside>
              </div>

              <input
                ref="uploadInputRef"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                class="hidden-input"
                @change="handleUploadChange"
              />
            </div>
          </section>

          <section v-else class="scene scene--recognition">
            <div class="recognition-scene">
              <div class="recognition-scene__header">
                <div>
                  <p class="capture-scene__eyebrow">实时识别中</p>
                  <h2>{{ recognitionHeadline }}</h2>
                  <p class="capture-scene__desc">{{ recognitionSubline }}</p>
                </div>

                <div class="recognition-scene__actions">
                  <button
                    type="button"
                    class="secondary-button"
                    @click="handleRestartRecognition"
                  >
                    重新打开摄像头
                  </button>
                  <button
                    type="button"
                    class="secondary-button"
                    @click="handleReturnHome"
                  >
                    结束识别
                  </button>
                </div>
              </div>

              <div class="recognition-board">
                <div class="recognition-board__stage">
                  <div
                    class="recognition-video-shell"
                    :style="recognitionVideoShellStyle"
                  >
                    <video
                      ref="recognitionVideoRef"
                      class="recognition-video-shell__video"
                      :class="{ 'recognition-video-shell__video--mirrored': true }"
                      autoplay
                      muted
                      playsinline
                    ></video>
                    <canvas
                      ref="recognitionCanvasRef"
                      class="recognition-video-shell__canvas"
                    ></canvas>
                    <div class="assistant-panel">
                      <img
                        class="assistant-panel__robot"
                        src="/stitch/ceshi2/03-robot-mascot.png"
                        alt="机器人"
                      />
                      <div class="assistant-panel__bubble">
                        <strong>{{ assistantBubbleTitle }}</strong>
                        <p v-if="assistantBubbleDesc">{{ assistantBubbleDesc }}</p>
                        <button
                          type="button"
                          class="primary-button assistant-panel__button"
                          @click="handleAssistantAction"
                        >
                          {{ assistantActionLabel }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="recognition-board__status">
                  <div class="status-chip">
                    <span class="status-chip__label">已录入</span>
                    <strong>{{ profiles.length }} 人</strong>
                  </div>
                  <div class="status-chip">
                    <span class="status-chip__label">当前匹配</span>
                    <strong>{{ bestMatchedName }}</strong>
                  </div>
                  <div class="status-chip">
                    <span class="status-chip__label">最高置信度</span>
                    <strong>{{ bestMatchedConfidence }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer
          v-if="currentStep !== 'intro' && currentStep !== 'method'"
          class="face-demo-toolbar"
        >
          <div class="face-demo-toolbar__profiles">
            <span class="face-demo-toolbar__title">已录入的人脸</span>

            <div v-if="profiles.length" class="face-demo-toolbar__profile-list">
              <article v-for="profile in profiles" :key="profile.id" class="profile-chip">
                <img
                  :src="profile.avatarDataUrl"
                  :alt="profile.name"
                  class="profile-chip__avatar"
                />
                <div class="profile-chip__meta">
                  <strong>{{ profile.name }}</strong>
                  <span>{{ formatProfileTime(profile.createdAt) }}</span>
                </div>
                <button
                  type="button"
                  class="profile-chip__delete"
                  @click="handleDeleteProfile(profile.id)"
                >
                  删除
                </button>
              </article>
            </div>

            <p v-else class="face-demo-toolbar__empty">还没有录入任何人脸</p>
          </div>

          <div class="face-demo-toolbar__actions">
            <button type="button" class="toolbar-button" @click="handleReturnHome">
              首页
            </button>
            <button
              type="button"
              class="toolbar-button"
              :disabled="!profiles.length"
              @click="handleEnterRecognition"
            >
              识别
            </button>
            <button
              type="button"
              class="toolbar-button"
              :disabled="!profiles.length"
              @click="handleOpenNameStep"
            >
              录入新人
            </button>
            <button type="button" class="toolbar-button" @click="handleToggleFullscreen">
              全屏
            </button>
            <button
              type="button"
              class="toolbar-button toolbar-button--danger"
              :disabled="!profiles.length"
              @click="handleClearProfiles"
            >
              清空本地库
            </button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type {
  FaceDemoDetection,
  FaceDemoMatchResult,
} from "~/composables/useFaceApiDemo";
import {
  FACE_DEMO_DESCRIPTOR_VERSION,
  useFaceApiDemo,
} from "~/composables/useFaceApiDemo";
import type { FaceDemoProfile } from "~/composables/useFaceDemoStorage";
import { useFaceDemoStorage } from "~/composables/useFaceDemoStorage";

definePageMeta({
  layout: "sidebar",
});

useHead({
  title: "人脸识别机器人 Demo",
  htmlAttrs: {
    lang: "zh-CN",
  },
  meta: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0, viewport-fit=cover",
    },
  ],
});

type DemoStep = "intro" | "name" | "method" | "capture" | "recognize";
type CaptureMode = "camera" | "upload";
type CameraScene = "capture" | "recognize";
type RecognitionDetectionWithMatch = FaceDemoDetection & {
  match: FaceDemoMatchResult;
};

const { listProfiles, saveProfile, removeProfile, clearProfiles } = useFaceDemoStorage();
const { ensureReady, detectAllFaces, matchDescriptor } = useFaceApiDemo();
const route = useRoute();

const currentStep = ref<DemoStep>("name");
const draftName = ref("");
const playerName = ref("");
const captureMode = ref<CaptureMode>("camera");
const capturePreview = ref("");
const captureError = ref("");
const runtimeNotice = ref("首次使用会加载本地模型，通常需要几秒。");
const recognitionNotice = ref("打开摄像头后会自动开始识别。");
const loadingModels = ref(false);
const modelsReady = ref(false);
const savingProfile = ref(false);
const profiles = ref<FaceDemoProfile[]>([]);
const cameraDevices = ref<MediaDeviceInfo[]>([]);
const selectedDeviceId = ref("");
const captureVideoReady = ref(false);
const recognitionVideoReady = ref(false);
const recognitionRunning = ref(false);
const recognitionDetections = ref<RecognitionDetectionWithMatch[]>([]);
const recognitionVideoAspectRatio = ref("4 / 3");

const captureVideoRef = ref<HTMLVideoElement | null>(null);
const captureCanvasRef = ref<HTMLCanvasElement | null>(null);
const recognitionVideoRef = ref<HTMLVideoElement | null>(null);
const recognitionCanvasRef = ref<HTMLCanvasElement | null>(null);
const uploadInputRef = ref<HTMLInputElement | null>(null);

let activeStream: MediaStream | null = null;
let recognitionTimer: number | null = null;
let recognitionBusy = false;
let legacyProfilesWarned = false;

const resolveDemoStep = (value: unknown): DemoStep => {
  if (
    value === "intro" ||
    value === "name" ||
    value === "method" ||
    value === "capture" ||
    value === "recognize"
  ) {
    return value;
  }

  return "name";
};

const resetRuntimeNotice = () => {
  runtimeNotice.value = modelsReady.value
    ? "模型准备完成，可以开始录入和识别了。"
    : "首次使用会加载本地模型，通常需要几秒。";
};

const modelStatusText = computed(() => {
  if (loadingModels.value) {
    return "模型加载中";
  }

  return modelsReady.value ? "本地模型已就绪" : "等待初始化";
});

const captureStepTitle = computed(() => {
  return captureMode.value === "camera"
    ? "请将面部对准画面，保持光线充足"
    : "请上传一张清晰的正脸照片";
});

const captureStepDesc = computed(() => {
  return captureMode.value === "camera"
    ? "打开摄像头后点击“拍照”，确认画面清晰后再录入。"
    : "上传成功后会先做一次人脸检测，必须保证图中只有一个人。";
});

const recognitionVideoShellStyle = computed(() => {
  return {
    aspectRatio: recognitionVideoAspectRatio.value,
  };
});

const canEnrollFace = computed(() => {
  if (captureMode.value === "camera") {
    return captureVideoReady.value || Boolean(capturePreview.value);
  }

  return Boolean(capturePreview.value);
});

const hasCompatibleProfiles = computed(() => {
  return profiles.value.some(
    (profile) => profile.descriptorVersion === FACE_DEMO_DESCRIPTOR_VERSION
  );
});

const sortedRecognitions = computed(() => {
  return [...recognitionDetections.value].sort(
    (left, right) => right.match.confidence - left.match.confidence
  );
});

const bestDetection = computed(() => {
  return sortedRecognitions.value.find((item) => item.match.profile) || null;
});

const bestMatchedName = computed(() => {
  return bestDetection.value?.match.profile?.name || "未匹配到";
});

const bestMatchedConfidence = computed(() => {
  const confidence = bestDetection.value?.match.confidence || 0;
  return confidence ? `${Math.round(confidence * 100)}%` : "--";
});

const recognitionHeadline = computed(() => {
  if (bestDetection.value?.match.profile) {
    return `你好，${bestDetection.value.match.profile.name}`;
  }

  if (!profiles.value.length) {
    return "请先录入至少一个人脸";
  }

  if (!hasCompatibleProfiles.value) {
    return "请清空旧数据后重新录入";
  }

  if (!recognitionDetections.value.length) {
    return "请把面部移动到画面中";
  }

  return "检测到人脸，但还没有匹配上";
});

const recognitionSubline = computed(() => {
  if (bestDetection.value?.match.profile) {
    const distance = bestDetection.value.match.distance.toFixed(3);
    return `本地比对成功，当前距离值 ${distance}，可以继续移动测试。`;
  }

  if (profiles.value.length && !hasCompatibleProfiles.value) {
    return "当前浏览器里还是旧版人脸数据，和现在的识别引擎不兼容。";
  }

  return "识别只会和当前浏览器里已录入的人脸做比对。";
});

const assistantBubbleTitle = computed(() => {
  if (bestDetection.value?.match.profile) {
    return `你是 ${bestDetection.value.match.profile.name}!`;
  }

  return recognitionHeadline.value;
});

const assistantBubbleDesc = computed(() => {
  if (bestDetection.value?.match.profile) {
    return "";
  }

  return recognitionNotice.value;
});

const assistantActionLabel = computed(() => {
  return bestDetection.value?.match.profile ? "结束识别" : "再录入一个人";
});

const loadProfiles = async () => {
  try {
    profiles.value = await listProfiles();

    const hasLegacyProfiles = profiles.value.some((profile) => {
      return profile.descriptorVersion !== FACE_DEMO_DESCRIPTOR_VERSION;
    });

    if (hasLegacyProfiles) {
      runtimeNotice.value = "检测到旧版录入数据，建议清空本地库后重新录入。";

      if (!legacyProfilesWarned) {
        legacyProfilesWarned = true;
        ElMessage.warning("检测到旧版人脸数据，请清空本地库后重新录入");
      }
    } else {
      legacyProfilesWarned = false;
      resetRuntimeNotice();
    }
  } catch (error) {
    console.error("读取本地人脸库失败:", error);
    ElMessage.error("读取本地人脸库失败");
  }
};

const ensureRuntimeReady = async () => {
  if (modelsReady.value) {
    return;
  }

  loadingModels.value = true;
  runtimeNotice.value = "正在加载本地模型，请稍等...";

  try {
    await ensureReady();
    modelsReady.value = true;
    runtimeNotice.value = "模型准备完成，可以开始录入和识别了。";
  } catch (error) {
    console.error("加载本地模型失败:", error);
    runtimeNotice.value = "模型加载失败，请刷新页面后重试。";
    throw error;
  } finally {
    loadingModels.value = false;
  }
};

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(reader.error || new Error("读取文件失败"));
    };

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("读取文件失败"));
    };

    reader.readAsDataURL(file);
  });
};

const createImageElement = (dataUrl: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = dataUrl;
  });
};

const waitForVideoReady = (video: HTMLVideoElement) => {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
    };

    video.onloadedmetadata = async () => {
      try {
        await video.play();
        cleanup();
        resolve();
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("视频流加载失败"));
    };
  });
};

const clearRecognitionCanvas = () => {
  const canvas = recognitionCanvasRef.value;
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
};

const stopRecognitionLoop = () => {
  recognitionRunning.value = false;
  recognitionBusy = false;

  if (recognitionTimer !== null) {
    window.clearTimeout(recognitionTimer);
    recognitionTimer = null;
  }
};

const updateRecognitionVideoAspectRatio = (video: HTMLVideoElement) => {
  if (!video.videoWidth || !video.videoHeight) {
    return;
  }

  recognitionVideoAspectRatio.value = `${video.videoWidth} / ${video.videoHeight}`;
};

const stopActiveStream = () => {
  stopRecognitionLoop();

  if (activeStream) {
    for (const track of activeStream.getTracks()) {
      track.stop();
    }
  }

  activeStream = null;
  captureVideoReady.value = false;
  recognitionVideoReady.value = false;

  if (captureVideoRef.value) {
    captureVideoRef.value.srcObject = null;
  }

  if (recognitionVideoRef.value) {
    recognitionVideoRef.value.srcObject = null;
  }

  clearRecognitionCanvas();
};

const refreshCameraDevices = async () => {
  if (!import.meta.client || !navigator.mediaDevices?.enumerateDevices) {
    return;
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoInputs = devices.filter((device) => device.kind === "videoinput");
  cameraDevices.value = videoInputs;

  if (!videoInputs.length) {
    selectedDeviceId.value = "";
    return;
  }

  if (
    !selectedDeviceId.value ||
    !videoInputs.some((device) => device.deviceId === selectedDeviceId.value)
  ) {
    selectedDeviceId.value = videoInputs[0]?.deviceId ?? "";
  }
};

const startCamera = async (scene: CameraScene) => {
  if (!import.meta.client || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("当前浏览器不支持摄像头调用");
  }

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: selectedDeviceId.value
      ? {
          deviceId: { exact: selectedDeviceId.value },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        }
      : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
  };

  stopActiveStream();

  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  activeStream = stream;

  await nextTick();

  const targetVideo =
    scene === "capture" ? captureVideoRef.value : recognitionVideoRef.value;

  if (!targetVideo) {
    throw new Error("摄像头载体未准备完成");
  }

  targetVideo.srcObject = stream;
  await waitForVideoReady(targetVideo);

  if (scene === "capture") {
    captureVideoReady.value = true;
  } else {
    updateRecognitionVideoAspectRatio(targetVideo);
    recognitionVideoReady.value = true;
  }

  await refreshCameraDevices();
};

const drawRecognitionOverlay = (detections: RecognitionDetectionWithMatch[]) => {
  const canvas = recognitionCanvasRef.value;
  const video = recognitionVideoRef.value;

  if (!canvas || !video || !video.videoWidth || !video.videoHeight) {
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.lineWidth = 2.5;
  context.font = "18px sans-serif";
  context.textBaseline = "top";

  for (const item of detections) {
    const isMatched = Boolean(item.match.profile);
    const color = isMatched ? "#ff5b2e" : "#7ad9ff";
    const label = isMatched
      ? `${item.match.profile?.name} ${Math.round(item.match.confidence * 100)}%`
      : "未录入";
    const mirroredBoxX = canvas.width - item.box.x - item.box.width;

    context.strokeStyle = color;
    context.fillStyle = color;
    context.strokeRect(mirroredBoxX, item.box.y, item.box.width, item.box.height);

    const labelWidth = Math.max(88, label.length * 10 + 24);
    const labelY = Math.max(0, item.box.y - 28);
    const labelX = Math.max(0, Math.min(mirroredBoxX, canvas.width - labelWidth));
    context.fillRect(labelX, labelY, labelWidth, 24);
    context.fillStyle = "#ffffff";
    context.fillText(label, labelX + 8, labelY + 3);
  }
};

const startRecognitionLoop = async () => {
  const video = recognitionVideoRef.value;

  if (!video || !recognitionVideoReady.value) {
    return;
  }

  stopRecognitionLoop();
  recognitionRunning.value = true;
  recognitionNotice.value = "正在持续分析画面中的人脸...";

  const tick = async () => {
    if (!recognitionRunning.value) {
      return;
    }

    if (recognitionBusy || !recognitionVideoReady.value || !recognitionVideoRef.value) {
      recognitionTimer = window.setTimeout(tick, 300);
      return;
    }

    recognitionBusy = true;

    try {
      const detections = await detectAllFaces(recognitionVideoRef.value);
      const matchedDetections = detections.map((item) => ({
        ...item,
        match: matchDescriptor(item.descriptor, profiles.value),
      }));

      recognitionDetections.value = matchedDetections;
      drawRecognitionOverlay(matchedDetections);

      if (!matchedDetections.length) {
        recognitionNotice.value = "请将面部放到镜头中央区域。";
      } else if (matchedDetections.some((item) => item.match.profile)) {
        const names = matchedDetections
          .filter((item) => item.match.profile)
          .map((item) => item.match.profile?.name)
          .filter(Boolean)
          .join("、");

        recognitionNotice.value = `已识别到：${names}`;
      } else {
        recognitionNotice.value = "检测到了人脸，但和本地人脸库还没有匹配上。";
      }
    } catch (error) {
      console.error("实时识别失败:", error);
      recognitionNotice.value = "识别过程中出现异常，请重新打开摄像头。";
    } finally {
      recognitionBusy = false;

      if (recognitionRunning.value) {
        recognitionTimer = window.setTimeout(tick, 450);
      }
    }
  };

  await tick();
};

const takeSnapshotFromVideo = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
  if (!video.videoWidth || !video.videoHeight) {
    throw new Error("摄像头画面尚未准备完成");
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("截图画布初始化失败");
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.92);
};

const handleStartExperience = async () => {
  draftName.value = playerName.value;
  await navigateTo({
    path: "/system/ai/face/experience",
    query: { step: "name" },
  });
};

const handleOpenNameStep = () => {
  stopActiveStream();
  capturePreview.value = "";
  captureError.value = "";
  currentStep.value = "name";
};

const handleConfirmName = () => {
  const name = draftName.value.trim();

  if (!name) {
    ElMessage.warning("请先输入名字");
    return;
  }

  playerName.value = name;
  currentStep.value = "method";
};

const handleBackToMethod = () => {
  stopActiveStream();
  capturePreview.value = "";
  captureError.value = "";
  currentStep.value = "method";
};

const handleSelectMethod = async (mode: CaptureMode) => {
  captureMode.value = mode;
  capturePreview.value = "";
  captureError.value = "";
  currentStep.value = "capture";

  try {
    await ensureRuntimeReady();

    if (mode === "camera") {
      await startCamera("capture");
    } else {
      stopActiveStream();
    }
  } catch (error: any) {
    console.error("初始化录入环境失败:", error);
    ElMessage.error(error?.message || "初始化录入环境失败");
  }
};

const handleOpenCaptureCamera = async () => {
  captureError.value = "";

  try {
    await ensureRuntimeReady();
    await startCamera("capture");
  } catch (error: any) {
    console.error("打开摄像头失败:", error);
    captureError.value = error?.message || "打开摄像头失败";
    ElMessage.error(captureError.value);
  }
};

const handleTakeSnapshot = () => {
  if (!captureVideoRef.value || !captureCanvasRef.value || !captureVideoReady.value) {
    ElMessage.warning("请先打开摄像头");
    return;
  }

  try {
    capturePreview.value = takeSnapshotFromVideo(
      captureVideoRef.value,
      captureCanvasRef.value
    );
    captureError.value = "";
  } catch (error: any) {
    captureError.value = error?.message || "拍照失败";
    ElMessage.error(captureError.value);
  }
};

const triggerUploadPicker = () => {
  uploadInputRef.value?.click();
};

const handleUploadChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
    ElMessage.warning("仅支持 png、jpg、jpeg 格式");
    input.value = "";
    return;
  }

  try {
    capturePreview.value = await readFileAsDataUrl(file);
    captureError.value = "";
  } catch (error) {
    console.error("读取上传图片失败:", error);
    captureError.value = "读取上传图片失败";
    ElMessage.error(captureError.value);
  } finally {
    input.value = "";
  }
};

const handleResetCapturePreview = async () => {
  capturePreview.value = "";
  captureError.value = "";

  if (captureMode.value === "camera" && !captureVideoReady.value) {
    await handleOpenCaptureCamera();
  }
};

const handleEnrollFace = async () => {
  let enrollmentPreview = capturePreview.value;

  if (!enrollmentPreview && captureMode.value === "camera") {
    if (!captureVideoRef.value || !captureCanvasRef.value || !captureVideoReady.value) {
      ElMessage.warning("请先打开摄像头");
      return;
    }

    try {
      enrollmentPreview = takeSnapshotFromVideo(
        captureVideoRef.value,
        captureCanvasRef.value
      );
      capturePreview.value = enrollmentPreview;
    } catch (error: any) {
      captureError.value = error?.message || "拍照失败";
      ElMessage.error(captureError.value);
      return;
    }
  }

  if (!enrollmentPreview) {
    ElMessage.warning("请先准备一张人脸图片");
    return;
  }

  savingProfile.value = true;
  captureError.value = "";

  try {
    await ensureRuntimeReady();
    const image = await createImageElement(enrollmentPreview);
    let allFaces = await detectAllFaces(image, "capture");

    if (
      !allFaces.length &&
      captureMode.value === "camera" &&
      captureVideoRef.value &&
      captureVideoReady.value
    ) {
      allFaces = await detectAllFaces(captureVideoRef.value, "capture");
    }

    if (!allFaces.length) {
      throw new Error("没有检测到人脸，请把整张脸放进画面中央，再试一张更清晰的正脸图");
    }

    if (allFaces.length > 1) {
      throw new Error("检测到多个人脸，请只保留一个人再录入");
    }

    const enrolledFace = allFaces[0];

    if (!enrolledFace) {
      throw new Error("当前人脸数据不可用，请重新录入");
    }

    const profile: FaceDemoProfile = {
      id: crypto.randomUUID(),
      name: playerName.value,
      avatarDataUrl: enrollmentPreview,
      descriptor: enrolledFace.descriptor,
      descriptorVersion: FACE_DEMO_DESCRIPTOR_VERSION,
      createdAt: Date.now(),
    };

    await saveProfile(profile);
    await loadProfiles();

    capturePreview.value = "";
    ElMessage.success("录入成功，已写入当前浏览器本地人脸库");

    await handleEnterRecognition();
  } catch (error: any) {
    console.error("录入人脸失败:", error);
    captureError.value = error?.message || "录入人脸失败";
    ElMessage.error(captureError.value);
  } finally {
    savingProfile.value = false;
  }
};

const handleEnterRecognition = async () => {
  if (!profiles.value.length) {
    ElMessage.warning("请先录入至少一个人脸");
    return;
  }

  if (!hasCompatibleProfiles.value) {
    ElMessage.warning("检测到旧版人脸数据，请先清空本地库后重新录入");
    return;
  }

  currentStep.value = "recognize";
  recognitionDetections.value = [];
  recognitionNotice.value = "正在准备摄像头...";

  try {
    await ensureRuntimeReady();
    await startCamera("recognize");
    await startRecognitionLoop();
  } catch (error: any) {
    console.error("进入识别失败:", error);
    ElMessage.error(error?.message || "进入识别失败");
    recognitionNotice.value = error?.message || "进入识别失败";
  }
};

const handleRestartRecognition = async () => {
  try {
    await startCamera("recognize");
    await startRecognitionLoop();
  } catch (error: any) {
    console.error("重新打开识别失败:", error);
    ElMessage.error(error?.message || "重新打开识别失败");
  }
};

const handleDeleteProfile = async (id: string) => {
  try {
    await removeProfile(id);
    await loadProfiles();

    if (!profiles.value.length && currentStep.value === "recognize") {
      handleReturnHome();
    }
  } catch (error) {
    console.error("删除本地人脸失败:", error);
    ElMessage.error("删除本地人脸失败");
  }
};

const handleClearProfiles = async () => {
  if (!profiles.value.length) {
    return;
  }

  if (!window.confirm("确认清空当前浏览器中的全部人脸数据吗？")) {
    return;
  }

  try {
    await clearProfiles();
    await loadProfiles();
    resetRuntimeNotice();
    handleReturnHome();
    ElMessage.success("本地人脸库已清空");
  } catch (error) {
    console.error("清空本地人脸库失败:", error);
    ElMessage.error("清空本地人脸库失败");
  }
};

const handleToggleFullscreen = async () => {
  if (!import.meta.client) {
    return;
  }

  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  } catch (error) {
    console.error("切换全屏失败:", error);
    ElMessage.error("切换全屏失败");
  }
};

const handleReturnHome = () => {
  stopActiveStream();
  capturePreview.value = "";
  captureError.value = "";
  recognitionDetections.value = [];
  currentStep.value = "name";
  recognitionNotice.value = "打开摄像头后会自动开始识别。";
  void navigateTo("/system/ai/face", { replace: true });
};

const handleAssistantAction = () => {
  if (bestDetection.value?.match.profile) {
    handleReturnHome();
    return;
  }

  handleOpenNameStep();
};

const formatProfileTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");

  return `${month}-${day} ${hour}:${minute}`;
};

watch(
  () => route.query.step,
  (step) => {
    const nextStep = resolveDemoStep(step);

    if (nextStep === currentStep.value) {
      return;
    }

    if (nextStep === "name") {
      draftName.value = playerName.value;
    }

    currentStep.value = nextStep;
  },
  { immediate: true }
);

onMounted(async () => {
  await loadProfiles();
  await refreshCameraDevices();

  if (import.meta.client && navigator.mediaDevices?.addEventListener) {
    navigator.mediaDevices.addEventListener("devicechange", refreshCameraDevices);
  }
});

onBeforeUnmount(() => {
  stopActiveStream();

  if (import.meta.client && navigator.mediaDevices?.removeEventListener) {
    navigator.mediaDevices.removeEventListener("devicechange", refreshCameraDevices);
  }
});
</script>

<style scoped>
.face-demo-workspace {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  /* background: radial-gradient(
      circle at 2% 18%,
      rgba(111, 138, 255, 0.18) 0,
      rgba(111, 138, 255, 0.08) 20%,
      rgba(111, 138, 255, 0) 44%
    ),
    radial-gradient(
      circle at 98% 20%,
      rgba(111, 138, 255, 0.18) 0,
      rgba(111, 138, 255, 0.08) 20%,
      rgba(111, 138, 255, 0) 44%
    ),
    linear-gradient(180deg, #fbfbff 0%, #f8f9fe 52%, #f9fafc 100%); */
  color: #163257;
}

.face-demo-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  padding: 64px 24px 38px;
  box-sizing: border-box;
}

.face-demo-shell {
  width: 100%;
  max-width: 1180px;
  min-height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.face-demo-shell--wide {
  max-width: 1580px;
}

.face-demo-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: clamp(44px, 5vw, 84px);
  color: #adb7d3;
  font-size: 12px;
  font-weight: 500;
}

.face-demo-breadcrumb span {
  color: #c5cce0;
}

.face-demo-breadcrumb__current {
  color: #6d7eff !important;
  font-weight: 600;
}

.face-demo-stage {
  flex: 1;
  min-height: calc(100vh - 140px);
}

.face-demo-stage--intro {
  display: flex;
  align-items: center;
}

.scene {
  min-height: calc(100vh - 210px);
  border-radius: 28px;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  border: none;
  overflow: hidden;
}

.scene--intro {
  display: grid;
  grid-template-columns: minmax(360px, 420px) minmax(460px, 560px);
  align-items: center;
  justify-content: space-between;
  gap: clamp(48px, 5vw, 82px);
  min-height: clamp(620px, calc(100vh - 190px), 780px);
  padding: 0;
  overflow: visible;
}

.face-demo-workspace--intro {
  overflow: hidden;
}

.face-demo-workspace--intro .face-demo-page {
  padding-right: 0;
  padding-bottom: 24px;
  overflow: hidden;
}

.face-demo-workspace--intro .face-demo-shell {
  flex: 1;
  min-height: 0;
  max-width: none;
}

.face-demo-workspace--intro .face-demo-breadcrumb {
  flex: 0 0 auto;
  margin-bottom: clamp(20px, 2.5vw, 40px);
}

.face-demo-workspace--intro .face-demo-stage {
  min-height: 0;
  overflow: hidden;
}

.face-demo-workspace--intro .scene {
  min-height: 0;
}

.face-demo-workspace--intro .scene--intro {
  /* flex: 1; */
  min-height: 0;
  grid-template-columns: minmax(480px, 1fr) minmax(360px, 520px);
  justify-content: stretch;
  gap: clamp(12px, 1.8vw, 28px);
  /* align-content: center; */
}

.face-demo-workspace--intro .intro-copy__stack {
  max-width: 620px;
}

.face-demo-workspace--intro .intro-copy__card p {
  max-width: 560px;
}

.face-demo-workspace--intro .intro-visual {
  width: 100%;
  max-width: 520px;
  margin-left: 0;
  margin-right: 0;
  justify-self: end;
}

.intro-visual,
.intro-copy {
  display: flex;
  flex-direction: column;
}

.intro-copy {
  justify-content: center;
  align-items: flex-start;
}

.intro-copy__stack {
  max-width: 420px;
}

.intro-copy__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(93, 122, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(93, 122, 255, 0.16);
  color: #5f76ff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.intro-copy__card {
  padding: 0;
  margin-top: 26px;
  background: transparent;
  border: none;
  box-shadow: none;
}

.intro-copy__card h2 {
  margin: 0;
  max-width: none;
  font-size: clamp(42px, 4.15vw, 60px);
  line-height: 1.04;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: #121d39;
}

.intro-copy__title-line {
  display: block;
  white-space: nowrap;
}

.intro-copy__title-line--accent {
  margin-top: 4px;
  background: linear-gradient(135deg, #5370ff 0%, #3f72ff 58%, #6f90ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

.intro-copy__card p {
  margin: 24px 0 0;
  max-width: 370px;
  font-size: clamp(14px, 1.15vw, 17px);
  line-height: 1.9;
  color: #7080a3;
}

.intro-copy__action {
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-width: 182px;
  height: 56px;
  margin-top: 38px;
  padding: 0 24px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #6580ff 0%, #4f68fb 100%);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 18px 34px rgba(80, 106, 252, 0.28);
  transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
}

.intro-copy__action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 24px 40px rgba(74, 103, 255, 0.32);
}

.intro-copy__action:disabled {
  opacity: 0.56;
  cursor: not-allowed;
  box-shadow: none;
}

.intro-copy__action svg {
  position: relative;
  z-index: 1;
  width: 16px;
  height: 16px;
}

.intro-copy__action > span:first-child {
  position: relative;
  z-index: 1;
}

.intro-copy__action-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0) 12%,
    rgba(255, 255, 255, 0.22) 50%,
    rgba(255, 255, 255, 0) 88%
  );
  transform: translateX(-120%);
  transition: transform 0.7s ease;
}

.intro-copy__action:hover:not(:disabled) .intro-copy__action-shine {
  transform: translateX(120%);
}

.intro-visual {
  position: relative;
  width: 100%;
  max-width: 538px;
  margin-left: auto;
}

.intro-visual__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
}

.intro-visual__glow--top {
  top: -6%;
  right: -10%;
  width: 40%;
  aspect-ratio: 1;
  background: rgba(79, 117, 255, 0.14);
}

.intro-visual__glow--bottom {
  left: -10%;
  bottom: -10%;
  width: 48%;
  aspect-ratio: 1;
  background: rgba(79, 117, 255, 0.16);
}

.intro-visual-card {
  position: relative;
  z-index: 1;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 34px;
  overflow: hidden;
  background: #020712;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 34px 90px -28px rgba(79, 117, 255, 0.28);
}

.intro-visual-card__portrait {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.94;
}

.intro-visual-card__grid {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  z-index: 1;
}

.intro-visual-card__scanline {
  position: absolute;
  left: 0;
  right: 0;
  top: 35%;
  height: 3px;
  background: linear-gradient(
    90deg,
    rgba(79, 117, 255, 0) 0%,
    rgba(79, 117, 255, 1) 50%,
    rgba(79, 117, 255, 0) 100%
  );
  box-shadow: 0 0 20px #4f75ff;
  z-index: 2;
}

.intro-visual-card__point {
  position: absolute;
  border-radius: 50%;
  background: #4f75ff;
  box-shadow: 0 0 15px #4f75ff;
  z-index: 3;
  animation: face-demo-pulse 2.6s infinite ease-in-out;
}

.intro-visual-card__point--left-eye,
.intro-visual-card__point--right-eye {
  width: 12px;
  height: 12px;
  top: 32%;
}

.intro-visual-card__point--left-eye {
  left: 42%;
}

.intro-visual-card__point--right-eye {
  left: 58%;
  animation-delay: 0.18s;
}

.intro-visual-card__point--nose,
.intro-visual-card__point--left-mouth,
.intro-visual-card__point--right-mouth {
  width: 9px;
  height: 9px;
}

.intro-visual-card__point--nose {
  top: 52%;
  left: 50%;
  animation-delay: 0.32s;
}

.intro-visual-card__point--left-mouth {
  top: 62%;
  left: 40%;
  animation-delay: 0.5s;
}

.intro-visual-card__point--right-mouth {
  top: 62%;
  left: 60%;
  animation-delay: 0.7s;
}

.intro-visual-card__badge {
  position: absolute;
  top: 26px;
  left: 26px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(18, 28, 58, 0.82);
  border: 1px solid rgba(79, 117, 255, 0.24);
  box-shadow: 0 16px 32px rgba(16, 24, 48, 0.22);
  backdrop-filter: blur(18px);
  color: #ffffff;
}

.intro-visual-card__badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #4f75ff;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(79, 117, 255, 0.26);
}

.intro-visual-card__badge-icon svg {
  width: 16px;
  height: 16px;
}

.intro-visual-card__badge strong {
  display: block;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.1;
}

.intro-visual-card__badge span {
  display: block;
  margin-top: 2px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
}

.intro-visual-card__panel {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 4;
  min-width: 220px;
  padding: 16px 18px 18px;
  border-radius: 18px;
  background: rgba(16, 24, 48, 0.88);
  border: 1px solid rgba(92, 112, 198, 0.2);
  backdrop-filter: blur(18px);
  color: #ffffff;
  box-shadow: 0 18px 36px rgba(8, 15, 35, 0.28);
}

.intro-visual-card__panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}

.intro-visual-card__panel-copy {
  min-width: 0;
}

.intro-visual-card__panel-label {
  display: block;
  font-size: 9px;
  font-weight: 800;
  color: #5575ff;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.intro-visual-card__panel-side {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  padding-bottom: 2px;
}

.intro-visual-card__panel strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
}

.intro-visual-card__progress {
  margin-top: 14px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.intro-visual-card__progress span {
  display: block;
  width: 99.8%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4f73ff 0%, #7bd5ff 100%);
  box-shadow: 0 0 18px rgba(123, 213, 255, 0.4);
}

.intro-visual-card__panel-tags {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.intro-visual-card__panel-tags span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.72);
  font-size: 9px;
  font-weight: 700;
}

.intro-visual-card__panel-tags span i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

.intro-visual-card__corner {
  position: absolute;
  width: 42px;
  height: 42px;
  border-color: rgba(79, 117, 255, 0.5);
  border-style: solid;
  z-index: 4;
}

.intro-visual-card__corner--top-left {
  top: 26px;
  left: 26px;
  border-width: 2px 0 0 2px;
  border-top-left-radius: 14px;
}

.intro-visual-card__corner--top-right {
  top: 26px;
  right: 26px;
  border-width: 2px 2px 0 0;
  border-top-right-radius: 14px;
}

.intro-visual-card__corner--bottom-left {
  bottom: 26px;
  left: 26px;
  border-width: 0 0 2px 2px;
  border-bottom-left-radius: 14px;
}

.intro-visual-card__corner--bottom-right {
  right: 26px;
  bottom: 26px;
  border-width: 0 2px 2px 0;
  border-bottom-right-radius: 14px;
}

@keyframes face-demo-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.92;
  }

  50% {
    transform: scale(1.18);
    opacity: 1;
  }
}

.campus-illustration,
.campus-stage {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  background: linear-gradient(
    180deg,
    rgba(111, 193, 255, 0.95) 0%,
    rgba(97, 157, 241, 0.94) 100%
  );
}

.campus-illustration {
  min-height: 520px;
}

.campus-illustration__cloud,
.campus-stage::before,
.campus-stage::after {
  position: absolute;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999px;
}

.campus-illustration__cloud::before,
.campus-illustration__cloud::after,
.campus-stage::before,
.campus-stage::after {
  content: "";
  position: absolute;
  background: inherit;
  border-radius: inherit;
}

.campus-illustration__cloud {
  height: 42px;
  width: 160px;
  top: 54px;
}

.campus-illustration__cloud--left {
  left: 8%;
}

.campus-illustration__cloud--left::before {
  width: 80px;
  height: 30px;
  top: -14px;
  left: 30px;
}

.campus-illustration__cloud--right {
  left: 60%;
  top: 36px;
  width: 120px;
  height: 34px;
}

.campus-illustration__cloud--right::before {
  width: 60px;
  height: 24px;
  top: -12px;
  left: 24px;
}

.campus-illustration__school {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 200px;
}

.campus-illustration__roof {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 170px solid transparent;
  border-right: 170px solid transparent;
  border-bottom: 60px solid #e85d3a;
}

.campus-illustration__building {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 140px;
  background: #fff5e6;
  border-radius: 8px 8px 0 0;
}

.campus-illustration__door {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 70px;
  background: #c0522a;
  border-radius: 25px 25px 0 0;
}

.campus-illustration__flagpole {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 80px;
  background: #aaa;
}

.campus-illustration__flag {
  position: absolute;
  top: -40px;
  left: calc(50% + 2px);
  width: 36px;
  height: 24px;
  background: #e53935;
  border-radius: 0 4px 4px 0;
}

.campus-illustration__sign {
  position: absolute;
  top: 72px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 800;
  color: #c0522a;
  white-space: nowrap;
}

.campus-illustration__window {
  position: absolute;
  width: 28px;
  height: 28px;
  background: rgba(135, 206, 250, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

.campus-illustration__window--1 {
  bottom: 90px;
  left: calc(50% - 110px);
}
.campus-illustration__window--2 {
  bottom: 90px;
  left: calc(50% - 70px);
}
.campus-illustration__window--3 {
  bottom: 90px;
  left: calc(50% + 42px);
}
.campus-illustration__window--4 {
  bottom: 90px;
  left: calc(50% + 82px);
}
.campus-illustration__window--5 {
  bottom: 48px;
  left: calc(50% - 110px);
}
.campus-illustration__window--6 {
  bottom: 48px;
  left: calc(50% - 70px);
}
.campus-illustration__window--7 {
  bottom: 48px;
  left: calc(50% + 42px);
}
.campus-illustration__window--8 {
  bottom: 48px;
  left: calc(50% + 82px);
}

.campus-illustration__robot {
  position: absolute;
  bottom: 40px;
  right: 24px;
  width: 120px;
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
  animation: robot-float 3s ease-in-out infinite;
}

@keyframes robot-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ── Name Step: campus-stage ── */

.campus-stage {
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
}

.campus-stage__sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #87ceeb 0%, #b0d8f5 100%);
  z-index: 0;
}

.campus-stage__ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: #8bc34a;
  z-index: 1;
}

.campus-stage__school {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.campus-stage__building {
  position: absolute;
  bottom: 0;
  background: #fff5e6;
  border-radius: 6px 6px 0 0;
}

.campus-stage__building--left {
  left: -120px;
  width: 80px;
  height: 100px;
}

.campus-stage__building--center {
  left: -60px;
  width: 120px;
  height: 140px;
}

.campus-stage__building--right {
  left: 70px;
  width: 80px;
  height: 100px;
}

.campus-stage__roof {
  position: absolute;
  bottom: 140px;
  left: -70px;
  width: 0;
  height: 0;
  border-left: 70px solid transparent;
  border-right: 70px solid transparent;
  border-bottom: 40px solid #e85d3a;
}

.campus-stage__flagpole {
  position: absolute;
  bottom: 140px;
  left: 0;
  width: 3px;
  height: 60px;
  background: #aaa;
}

.campus-stage__flag {
  position: absolute;
  bottom: 196px;
  left: 3px;
  width: 28px;
  height: 18px;
  background: #e53935;
  border-radius: 0 3px 3px 0;
}

.campus-stage__sign {
  position: absolute;
  bottom: 106px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 800;
  color: #c0522a;
  white-space: nowrap;
}

.campus-stage__robot {
  position: absolute;
  bottom: 60px;
  right: 40px;
  width: 100px;
  height: auto;
  z-index: 3;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
  animation: robot-float 3s ease-in-out infinite;
}

.campus-stage::before {
  width: 120px;
  height: 36px;
  top: 40px;
  left: 10%;
  z-index: 1;
}

.campus-stage::after {
  width: 90px;
  height: 28px;
  top: 60px;
  right: 12%;
  z-index: 1;
}

/* ── Speech Card (name input) ── */

.speech-card {
  position: relative;
  z-index: 4;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  padding: 36px 32px 28px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
  max-width: 420px;
  width: 100%;
  text-align: center;
}

.speech-card h2 {
  margin: 0 0 20px;
  font-size: 22px;
  font-weight: 800;
  color: #173558;
}

.speech-card__input {
  display: block;
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #d0dce8;
  border-radius: 14px;
  font-size: 18px;
  color: #163257;
  background: #f5f9ff;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.speech-card__input:focus {
  border-color: #2fa4ea;
}

.speech-card__actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

/* ── Method Step ── */

.method-scene {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100%;
  padding: 0 0 12px;
}

.scene--method {
  min-height: calc(100vh - 188px);
  overflow: visible;
}

.method-scene__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.method-scene__header-copy {
  min-width: 0;
}

.method-scene__breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  color: #596065;
  font-size: 13px;
  font-weight: 500;
}

.method-scene__breadcrumb-current {
  color: #2c3338;
  font-weight: 700;
}

.method-scene__breadcrumb-separator {
  color: #abb3b9;
}

.method-scene__header h2 {
  margin: 0;
  font-size: 40px;
  line-height: 1.15;
  font-weight: 800;
  color: #2c3338;
}

.method-scene__header p {
  margin: 10px 0 0;
  font-size: 16px;
  line-height: 1.7;
  color: #596065;
}

.method-scene__header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-shrink: 0;
}

.method-scene__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 420px);
  gap: 32px;
  align-items: stretch;
  min-height: 0;
}

.method-scene__stage {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.method-scene__board {
  flex: 1;
  min-height: 0;
  padding: 40px 36px;
  border-radius: 32px;
  background: #f0f4f8;
  box-shadow: inset 0 0 0 1px rgba(171, 179, 185, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.method-scene__greeting {
  margin: 0 0 28px;
  font-size: 24px;
  line-height: 1.45;
  font-weight: 700;
  color: #2c3338;
  text-align: center;
}

.method-grid {
  width: 100%;
  max-width: 960px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 308px;
  padding: 32px 28px;
  border-radius: 40px;
  background: #ffffff;
  border: 2px dashed rgba(171, 179, 185, 0.35);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease,
    background 0.25s ease;
  text-align: center;
}

.method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(36, 81, 220, 0.12);
}

.method-card--upload:hover {
  border-color: rgba(36, 81, 220, 0.55);
  background: rgba(36, 81, 220, 0.03);
}

.method-card--camera:hover {
  border-color: rgba(0, 107, 96, 0.45);
  background: rgba(0, 107, 96, 0.03);
}

.method-card__icon {
  width: 84px;
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #2451dc;
  flex-shrink: 0;
}

.method-card__icon--upload {
  background: rgba(36, 81, 220, 0.1);
}

.method-card__icon--camera {
  background: rgba(0, 107, 96, 0.1);
  color: #006b60;
}

.method-card__icon svg {
  width: 48px;
  height: 48px;
}

.method-card__copy {
  max-width: 280px;
}

.method-card strong {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #2c3338;
}

.method-card span {
  display: block;
  margin-top: 10px;
  font-size: 15px;
  color: #596065;
  line-height: 1.8;
}

.method-scene__actions {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}

.method-scene__primary {
  width: min(100%, 960px);
  min-height: 62px;
  border-radius: 20px;
}

.method-panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-height: 0;
}

.method-panel__card {
  border-radius: 28px;
  padding: 28px 24px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(28, 51, 71, 0.035);
  border: 1px solid rgba(171, 179, 185, 0.1);
}

.method-panel__card--identity {
  background: #ffffff;
}

.method-panel__card--records {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f0f4f8;
  box-shadow: none;
  padding: 24px 20px;
}

.method-panel__identity-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}

.method-panel__identity-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: rgba(36, 81, 220, 0.1);
  color: #2451dc;
  flex-shrink: 0;
}

.method-panel__identity-icon svg {
  width: 28px;
  height: 28px;
}

.method-panel__identity-copy {
  min-width: 0;
}

.method-panel__identity-head h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 800;
  color: #2c3338;
}

.method-panel__identity-head p {
  margin: 5px 0 0;
  font-size: 16px;
  line-height: 1.6;
  color: #596065;
}

.method-panel__field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-panel__field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.method-panel__label {
  font-size: 16px;
  font-weight: 800;
  color: #2c3338;
}

.method-panel__input-shell {
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 18px;
  border-radius: 18px;
  background: #dce3e9;
  transition: box-shadow 0.2s ease;
}

.method-panel__input {
  width: 100%;
  min-height: 56px;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #2c3338;
  font-size: 18px;
  font-weight: 500;
  outline: none;
  box-sizing: border-box;
}

.method-panel__text-action,
.method-panel__record-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  border: none;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, opacity 0.2s ease,
    transform 0.2s ease;
}

.method-panel__text-action {
  background: transparent;
  color: #2451dc;
  padding: 0;
  min-height: auto;
}

.method-panel__text-action:hover:not(:disabled) {
  color: #163dbe;
}

.method-panel__text-action:disabled,
.method-panel__record-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.method-panel__records-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.method-panel__records-head h4 {
  margin: 0;
  font-size: 12px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: #596065;
}

.method-panel__records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-panel__card--records .method-panel__records-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
}

.method-panel__records-list::-webkit-scrollbar {
  width: 4px;
}

.method-panel__records-list::-webkit-scrollbar-track {
  background: transparent;
}

.method-panel__records-list::-webkit-scrollbar-thumb {
  background: #dce3e9;
  border-radius: 10px;
}

.method-panel__record {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(171, 179, 185, 0.06);
}

.method-panel__record-avatar-shell {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: #dce3e9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.method-panel__record-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.method-panel__record-avatar--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(89, 96, 101, 0.45);
}

.method-panel__record-avatar--empty svg {
  width: 22px;
  height: 22px;
}

.method-panel__record-copy {
  flex: 1;
  min-width: 0;
}

.method-panel__record-copy strong {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: #2c3338;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.method-panel__record-copy span {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: #596065;
}

.method-panel__record-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.method-panel__record-action {
  width: 36px;
  min-width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 999px;
}

.method-panel__record-action--edit {
  background: rgba(36, 81, 220, 0.08);
  color: #2451dc;
}

.method-panel__record-action--delete {
  background: rgba(168, 54, 75, 0.08);
  color: #a8364b;
}

.method-panel__record-action--edit:hover:not(:disabled),
.method-panel__record-action--delete:hover:not(:disabled) {
  transform: translateY(-1px);
}

.method-panel__record-action--edit:hover:not(:disabled) {
  background: rgba(36, 81, 220, 0.14);
}

.method-panel__record-action--delete:hover:not(:disabled) {
  background: rgba(168, 54, 75, 0.14);
}

.method-panel__record-action svg {
  width: 18px;
  height: 18px;
}

.method-panel__record--placeholder .method-panel__record-copy strong {
  color: #2c3338;
}

.method-scene__tip {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 22px 24px;
  border-radius: 24px;
  background: rgba(36, 81, 220, 0.05);
  border: 1px solid rgba(36, 81, 220, 0.1);
}

.method-scene__tip-icon {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: #2451dc;
}

.method-scene__tip-icon svg {
  width: 100%;
  height: 100%;
}

.method-scene__tip h5 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 800;
  color: #2451dc;
}

.method-scene__tip p {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #596065;
}

/* ── Capture Step ── */

.capture-scene {
  padding: 28px 28px 20px;
}

.capture-scene__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.capture-scene__eyebrow {
  font-size: 13px;
  font-weight: 700;
  color: #2fa4ea;
  margin: 0 0 4px;
}

.capture-scene__header h2 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 800;
  color: #173558;
}

.capture-scene__desc {
  margin: 0;
  font-size: 14px;
  color: #5a7a9b;
  line-height: 1.6;
}

.capture-scene__header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.capture-scene__body {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

/* ── Capture Preview ── */

.capture-preview {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 960px;
  justify-self: center;
}

.capture-preview__frame {
  position: relative;
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: #0a1a2e;
  aspect-ratio: 16 / 10;
}

.capture-preview__media {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.capture-preview__media--mirrored {
  transform: scaleX(-1);
  transform-origin: center;
}

.capture-preview__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 24px;
}

.capture-preview__placeholder-icon {
  width: 64px;
  height: 64px;
}

.capture-preview__placeholder-icon svg {
  width: 100%;
  height: 100%;
}

.capture-preview__placeholder strong {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.capture-preview__placeholder span {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.capture-preview__guide {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.55);
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  text-align: center;
  backdrop-filter: blur(4px);
}

/* ── Capture Panel (sidebar) ── */

.capture-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.status-card {
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.status-card__label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #7a9ab8;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.status-card strong {
  display: block;
  font-size: 16px;
  color: #173558;
  margin-bottom: 6px;
}

.status-card p {
  margin: 0;
  font-size: 13px;
  color: #5a7a9b;
  line-height: 1.5;
}

.capture-panel__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.capture-panel__label {
  font-size: 13px;
  font-weight: 700;
  color: #3a5a7a;
}

.capture-panel__select {
  padding: 10px 14px;
  border: 2px solid #d0dce8;
  border-radius: 12px;
  font-size: 14px;
  color: #163257;
  background: #f5f9ff;
  outline: none;
  cursor: pointer;
}

.capture-panel__select:focus {
  border-color: #2fa4ea;
}

.capture-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.capture-panel__error {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(233, 30, 30, 0.08);
  color: #c62828;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid rgba(233, 30, 30, 0.15);
}

.capture-panel__tips {
  padding: 16px 20px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.capture-panel__tips strong {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #3a5a7a;
  margin-bottom: 8px;
}

.capture-panel__tips ul {
  margin: 0;
  padding-left: 16px;
  font-size: 13px;
  color: #5a7a9b;
  line-height: 1.8;
}

/* ── Recognition Step ── */

.recognition-scene {
  padding: 22px 22px 18px;
}

.recognition-scene__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.recognition-scene__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.recognition-board {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1340px;
  margin: 0 auto;
}

.recognition-board__stage {
  display: grid;
  grid-template-columns: minmax(0, 980px);
  justify-content: center;
  align-items: start;
}

.recognition-video-shell {
  position: relative;
  width: 100%;
  max-width: 980px;
  justify-self: center;
  border-radius: 18px;
  overflow: hidden;
  background: #0a1a2e;
  aspect-ratio: 16 / 10;
}

.recognition-video-shell__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recognition-video-shell__video--mirrored {
  transform: scaleX(-1);
  transform-origin: center;
}

.recognition-video-shell__canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* ── Assistant Panel (robot bubble) ── */

.assistant-panel {
  position: absolute;
  left: 22px;
  bottom: 18px;
  z-index: 3;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}

.assistant-panel__robot {
  width: 92px;
  height: auto;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.16));
}

.assistant-panel__bubble {
  min-width: 188px;
  max-width: 220px;
  padding: 18px 18px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 2px solid rgba(28, 40, 59, 0.92);
  box-shadow: 0 14px 30px rgba(22, 50, 87, 0.18);
  text-align: left;
  pointer-events: auto;
  position: relative;
}

.assistant-panel__bubble::before {
  content: "";
  position: absolute;
  left: -12px;
  bottom: 24px;
  width: 18px;
  height: 18px;
  background: rgba(255, 255, 255, 0.96);
  border-left: 2px solid rgba(28, 40, 59, 0.92);
  border-bottom: 2px solid rgba(28, 40, 59, 0.92);
  transform: rotate(45deg);
}

.assistant-panel__bubble strong {
  display: block;
  font-size: 17px;
  font-weight: 800;
  color: #173558;
  margin-bottom: 6px;
}

.assistant-panel__bubble p {
  margin: 0 0 14px;
  font-size: 13px;
  color: #5a7a9b;
  line-height: 1.6;
}

.assistant-panel__button {
  min-width: 138px;
  height: 44px;
  padding: 0 20px;
  border-radius: 999px;
  font-size: 14px;
}

/* ── Recognition Status Chips ── */

.recognition-board__status {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-chip {
  flex: 1;
  min-width: 150px;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.status-chip__label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #7a9ab8;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.status-chip strong {
  font-size: 20px;
  font-weight: 800;
  color: #173558;
}

/* ── Footer Toolbar ── */

.face-demo-toolbar {
  margin-top: 18px;
  padding: 20px 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
}

.face-demo-toolbar__title {
  font-size: 14px;
  font-weight: 700;
  color: #3a5a7a;
  margin-bottom: 12px;
}

.face-demo-toolbar__profile-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.face-demo-toolbar__empty {
  margin: 0 0 16px;
  font-size: 14px;
  color: #7a9ab8;
}

.face-demo-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* ── Profile Chip ── */

.profile-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 8px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.85);
}

.profile-chip__avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}

.profile-chip__meta {
  display: flex;
  flex-direction: column;
}

.profile-chip__meta strong {
  font-size: 14px;
  font-weight: 700;
  color: #173558;
}

.profile-chip__meta span {
  font-size: 12px;
  color: #7a9ab8;
}

.profile-chip__delete {
  margin-left: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 8px;
  background: rgba(233, 30, 30, 0.08);
  color: #c62828;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.profile-chip__delete:hover {
  background: rgba(233, 30, 30, 0.16);
}

/* ── Shared Buttons ── */

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff7043 0%, #ff5b2e 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 6px 20px rgba(255, 91, 46, 0.3);
}

.primary-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(255, 91, 46, 0.4);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-button--large {
  padding: 16px 40px;
  font-size: 18px;
  border-radius: 16px;
}

.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: 2px solid #d0dce8;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  color: #3a5a7a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.95);
  border-color: #2fa4ea;
  color: #2fa4ea;
}

.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.45);
  color: #2a4a6a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.8);
}

.toolbar-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.toolbar-button--danger {
  color: #c62828;
  border-color: rgba(198, 40, 40, 0.2);
}

.toolbar-button--danger:hover:not(:disabled) {
  background: rgba(233, 30, 30, 0.08);
}

/* ── Utility ── */

.hidden-canvas {
  display: none;
}

.hidden-input {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

/* ── Responsive ── */

@media (min-width: 2000px) {
  .face-demo-shell {
    max-width: 1480px;
  }

  .scene--intro {
    grid-template-columns: minmax(400px, 460px) minmax(600px, 680px);
    gap: 104px;
  }

  .intro-copy__stack {
    max-width: 452px;
  }

  .intro-copy__card h2 {
    font-size: 64px;
  }

  .intro-copy__card p {
    max-width: 400px;
    font-size: 18px;
  }

  .intro-visual {
    max-width: 620px;
  }

  .capture-preview {
    max-width: 1100px;
  }

  .recognition-board {
    max-width: 1480px;
  }
}

@media (max-width: 1500px) {
  .face-demo-page {
    padding: 22px 20px 34px;
  }

  .face-demo-workspace--intro .face-demo-page {
    padding-right: 0;
  }

  .face-demo-shell {
    max-width: 1080px;
  }

  .face-demo-shell--wide {
    max-width: 1420px;
  }

  .scene--intro {
    grid-template-columns: minmax(320px, 380px) minmax(420px, 500px);
    gap: 40px;
  }

  .intro-copy__card h2 {
    font-size: 50px;
  }

  .intro-copy__card p {
    max-width: 350px;
    font-size: 15px;
  }

  .intro-copy__action {
    min-width: 176px;
    height: 54px;
    font-size: 16px;
  }

  .intro-visual {
    max-width: 486px;
  }

  .intro-visual-card__badge {
    top: 24px;
    left: 24px;
  }

  .intro-visual-card__panel {
    right: 22px;
    bottom: 22px;
    min-width: 212px;
    padding: 14px 16px 16px;
  }

  .capture-scene__body {
    grid-template-columns: minmax(0, 1fr) 300px;
  }

  .method-scene__header h2 {
    font-size: 34px;
  }

  .method-scene__body {
    grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
    gap: 24px;
  }

  .method-scene__board {
    padding: 32px 28px;
  }

  .method-scene__greeting {
    font-size: 22px;
  }

  .method-card {
    min-height: 280px;
    padding: 28px 24px;
    border-radius: 32px;
  }

  .method-card strong {
    font-size: 24px;
  }

  .method-card span {
    font-size: 14px;
  }

  .method-panel__card {
    padding: 24px 20px;
    border-radius: 24px;
  }

  .face-demo-workspace--intro .scene--intro {
    grid-template-columns: minmax(360px, 1fr) minmax(320px, 460px);
    gap: 16px;
  }

  .face-demo-workspace--intro .intro-copy__stack {
    max-width: 560px;
  }

  .face-demo-workspace--intro .intro-copy__card p {
    max-width: 500px;
  }

  .face-demo-workspace--intro .intro-visual {
    max-width: 460px;
  }
}

@media (max-width: 1300px) {
  .face-demo-page {
    padding: 18px 20px 30px;
  }

  .face-demo-workspace--intro .face-demo-page {
    padding-right: 0;
  }

  .face-demo-breadcrumb {
    margin-bottom: 48px;
  }

  .face-demo-shell {
    max-width: 950px;
  }

  .face-demo-shell--wide {
    max-width: 1240px;
  }

  .scene--intro {
    grid-template-columns: minmax(280px, 320px) minmax(340px, 420px);
    gap: 32px;
    min-height: 520px;
  }

  .intro-copy__card h2 {
    max-width: none;
    font-size: 38px;
  }

  .intro-copy__card p {
    max-width: 300px;
    font-size: 14px;
    line-height: 1.8;
  }

  .intro-copy__action {
    min-width: 168px;
    height: 52px;
    font-size: 15px;
  }

  .intro-visual {
    max-width: 420px;
  }

  .intro-visual-card {
    border-radius: 30px;
  }

  .intro-visual-card__badge {
    top: 22px;
    left: 22px;
    padding: 10px 12px;
    border-radius: 12px;
  }

  .intro-visual-card__badge-icon {
    width: 24px;
    height: 24px;
  }

  .intro-visual-card__badge strong {
    font-size: 11px;
  }

  .intro-visual-card__badge span {
    font-size: 8px;
  }

  .intro-visual-card__panel {
    right: 20px;
    bottom: 20px;
    min-width: 196px;
    padding: 14px 14px 15px;
    border-radius: 16px;
  }

  .intro-visual-card__panel strong {
    font-size: 24px;
  }

  .intro-visual-card__panel-tags {
    gap: 8px;
  }

  .intro-visual-card__panel-tags span {
    min-height: 28px;
  }

  .intro-visual-card__corner {
    width: 36px;
    height: 36px;
  }

  .intro-visual-card__corner--top-left,
  .intro-visual-card__corner--top-right {
    top: 22px;
  }

  .intro-visual-card__corner--bottom-left,
  .intro-visual-card__corner--bottom-right {
    bottom: 22px;
  }

  .intro-visual-card__corner--top-left,
  .intro-visual-card__corner--bottom-left {
    left: 22px;
  }

  .intro-visual-card__corner--top-right,
  .intro-visual-card__corner--bottom-right {
    right: 22px;
  }

  .capture-scene__body,
  .recognition-board__stage {
    grid-template-columns: 1fr;
  }

  .method-scene__header {
    gap: 18px;
  }

  .method-scene__header h2 {
    font-size: 30px;
  }

  .method-scene__header p {
    font-size: 15px;
  }

  .method-scene__body {
    grid-template-columns: minmax(0, 1fr) 312px;
    gap: 20px;
  }

  .method-scene__board {
    padding: 28px 24px;
  }

  .method-scene__greeting {
    margin-bottom: 24px;
    font-size: 20px;
  }

  .method-grid {
    gap: 18px;
  }

  .method-card {
    min-height: 252px;
    padding: 24px 20px;
    border-radius: 28px;
  }

  .method-card__icon {
    width: 72px;
    height: 72px;
  }

  .method-card__icon svg {
    width: 42px;
    height: 42px;
  }

  .method-card strong {
    font-size: 22px;
  }

  .method-scene__primary {
    min-height: 56px;
    font-size: 16px;
  }

  .method-panel__identity-head h3 {
    font-size: 20px;
  }

  .method-panel__record-copy strong {
    font-size: 15px;
  }

  .face-demo-workspace--intro .scene--intro {
    grid-template-columns: minmax(300px, 1fr) minmax(280px, 400px);
    gap: 14px;
  }

  .face-demo-workspace--intro .intro-copy__card p {
    max-width: 420px;
  }

  .face-demo-workspace--intro .intro-visual {
    max-width: 400px;
  }
}

@media (max-width: 1180px) {
  .face-demo-stage--intro {
    display: block;
  }

  .scene--intro {
    grid-template-columns: 1fr;
    gap: 40px;
    min-height: auto;
    padding: 0;
  }

  .intro-copy__stack,
  .intro-copy__card p {
    max-width: none;
  }

  .intro-copy__card h2 {
    max-width: 100%;
    font-size: clamp(40px, 7vw, 56px);
  }

  .intro-copy__card p {
    max-width: 460px;
    font-size: 16px;
  }

  .intro-copy__action {
    min-width: 180px;
    height: 56px;
    font-size: 16px;
  }

  .intro-visual {
    max-width: 520px;
    margin: 12px auto 0;
  }

  .intro-visual-card__badge {
    top: 24px;
    left: 24px;
  }

  .intro-visual-card__panel {
    right: 24px;
    bottom: 24px;
    min-width: 220px;
  }

  .intro-visual-card__corner {
    width: 52px;
    height: 52px;
  }

  .intro-visual-card__corner--top-left,
  .intro-visual-card__corner--top-right {
    top: 24px;
  }

  .intro-visual-card__corner--bottom-left,
  .intro-visual-card__corner--bottom-right {
    bottom: 24px;
  }

  .intro-visual-card__corner--top-left,
  .intro-visual-card__corner--bottom-left {
    left: 24px;
  }

  .intro-visual-card__corner--top-right,
  .intro-visual-card__corner--bottom-right {
    right: 24px;
  }

  .face-demo-workspace--intro {
    overflow: auto;
  }

  .face-demo-workspace--intro .face-demo-page {
    overflow: visible;
  }

  .face-demo-workspace--intro .face-demo-stage {
    overflow: visible;
  }

  .face-demo-workspace--intro .scene--intro {
    grid-template-columns: 1fr;
    min-height: auto;
    gap: 40px;
  }

  .face-demo-workspace--intro .intro-visual {
    max-width: 520px;
  }

  .scene--method {
    min-height: auto;
  }

  .method-scene {
    padding-bottom: 0;
  }

  .method-scene__header,
  .method-scene__body {
    grid-template-columns: 1fr;
    display: grid;
  }

  .method-scene__header {
    gap: 16px;
  }

  .method-scene__header-actions {
    justify-content: flex-start;
  }

  .method-scene__body {
    gap: 18px;
  }

  .method-panel__card--records {
    min-height: 300px;
  }
}

@media (max-width: 900px) {
  .face-demo-page {
    padding: 16px 14px 24px;
  }

  .face-demo-breadcrumb {
    gap: 8px;
    margin-bottom: 24px;
    font-size: 11px;
  }

  .intro-copy__card h2 {
    font-size: clamp(34px, 10vw, 46px);
    max-width: 100%;
  }

  .intro-copy__card p {
    max-width: 100%;
    font-size: 14px;
    line-height: 1.85;
  }

  .intro-copy__eyebrow {
    font-size: 10px;
    letter-spacing: 0.1em;
  }

  .intro-copy__action {
    min-width: 164px;
    height: 50px;
    font-size: 15px;
    border-radius: 16px;
  }

  .intro-visual {
    max-width: 420px;
  }

  .intro-visual-card {
    border-radius: 28px;
  }

  .intro-visual-card__badge {
    top: 18px;
    left: 18px;
    gap: 12px;
    padding: 12px 14px;
  }

  .intro-visual-card__badge-icon {
    width: 34px;
    height: 34px;
  }

  .intro-visual-card__badge strong {
    font-size: 13px;
  }

  .intro-visual-card__badge span {
    font-size: 10px;
  }

  .intro-visual-card__panel {
    right: 18px;
    bottom: 18px;
    left: 18px;
    min-width: 0;
    padding: 16px;
  }

  .intro-visual-card__panel strong {
    font-size: 30px;
  }

  .intro-visual-card__corner {
    width: 40px;
    height: 40px;
  }

  .intro-visual-card__corner--top-left,
  .intro-visual-card__corner--top-right {
    top: 18px;
  }

  .intro-visual-card__corner--bottom-left,
  .intro-visual-card__corner--bottom-right {
    bottom: 18px;
  }

  .intro-visual-card__corner--top-left,
  .intro-visual-card__corner--bottom-left {
    left: 18px;
  }

  .intro-visual-card__corner--top-right,
  .intro-visual-card__corner--bottom-right {
    right: 18px;
  }

  .campus-illustration {
    min-height: 320px;
  }

  .method-grid {
    grid-template-columns: 1fr;
  }

  .method-scene__header h2 {
    font-size: 26px;
  }

  .method-scene__header p,
  .method-scene__greeting {
    font-size: 14px;
  }

  .method-scene__header-actions {
    width: 100%;
  }

  .method-scene__header-actions .secondary-button {
    flex: 1;
    min-width: 0;
  }

  .method-scene__board,
  .method-panel__card {
    padding: 20px 16px;
  }

  .method-card {
    min-height: 220px;
  }

  .method-card strong {
    font-size: 20px;
  }

  .method-panel__field-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .method-scene__tip {
    padding: 18px 16px;
  }
}

@media (max-width: 600px) {
  .face-demo-stage {
    min-height: auto;
  }

  .intro-copy__action {
    height: 54px;
    border-radius: 16px;
    width: 100%;
  }

  .intro-visual-card {
    border-radius: 24px;
  }

  .intro-visual {
    max-width: 100%;
  }

  .intro-visual-card__badge {
    top: 14px;
    left: 14px;
    right: 14px;
    padding: 12px 14px;
  }

  .intro-visual-card__panel {
    right: 14px;
    bottom: 14px;
    left: 14px;
  }

  .intro-visual-card__panel strong {
    font-size: 26px;
  }

  .intro-visual-card__panel-tags {
    grid-template-columns: 1fr;
  }

  .intro-visual-card__corner {
    width: 34px;
    height: 34px;
  }

  .intro-visual-card__corner--top-left,
  .intro-visual-card__corner--top-right {
    top: 14px;
  }

  .intro-visual-card__corner--bottom-left,
  .intro-visual-card__corner--bottom-right {
    bottom: 14px;
  }

  .intro-visual-card__corner--top-left,
  .intro-visual-card__corner--bottom-left {
    left: 14px;
  }

  .intro-visual-card__corner--top-right,
  .intro-visual-card__corner--bottom-right {
    right: 14px;
  }

  .capture-scene {
    padding: 16px 14px 12px;
  }

  .recognition-scene {
    padding: 16px 14px 12px;
  }

  .speech-card {
    padding: 24px 18px 20px;
  }
}
</style>
