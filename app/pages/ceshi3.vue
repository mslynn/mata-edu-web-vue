<template>
  <div class="stitch-home-shell">
    <div class="stitch-home-page" :class="{ 'stitch-home-page--pending': !tailwindReady }">
      <aside
        class="stitch-home-sidebar h-screen w-64 fixed top-0 bg-[#f2f4f5] flex flex-col py-6 px-4 z-50"
      >
        <div class="text-2xl font-black text-[#2e3335] mb-8 px-4 flex items-center gap-3">
          <span
            class="material-symbols-outlined text-primary text-3xl stitch-icon--filled"
          >
            school
          </span>
          <div class="flex flex-col">
            <span class="leading-none">教育平台</span>
            <span class="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider mt-1">
              数字馆长系统
            </span>
          </div>
        </div>

        <nav class="flex-1 space-y-2">
          <button
            v-for="item in sideNavItems"
            :key="item.label"
            type="button"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left group"
            :class="
              item.active
                ? 'text-[#005bc2] font-bold border-r-4 border-[#005bc2] bg-white/50'
                : 'text-[#2e3335] hover:bg-[#dee3e5]'
            "
          >
            <span
              class="material-symbols-outlined"
              :class="item.active ? 'stitch-icon--filled text-[#005bc2]' : 'text-on-surface-variant group-hover:text-primary'"
            >
              {{ item.icon }}
            </span>
            <span
              class="font-headline text-sm"
              :class="item.active ? 'font-bold' : 'font-medium'"
            >
              {{ item.label }}
            </span>
          </button>
        </nav>

        <div class="mt-auto px-4 pt-6 border-t border-outline-variant/10">
          <div class="flex items-center gap-3 bg-surface-container-lowest p-3 rounded-2xl">
            <img
              alt="教师头像"
              class="w-10 h-10 rounded-full bg-primary-container object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDR0EHEsckca4JuG6FYiQ5PMDfHBVDZCzHIRbaUwtyiOTN-KXkBuU4-ne0P6Ct_N8IL_RrT8CyubYvaMXeLnhBLqvtkZiKprSMdhH241SiuA3cvJi65m-fJ8pFqRd4BZa6BLYvOWH9Ma7Ee-FYvnhDlRSkGxFtA6a52xYV7huqoEX6gpvKdInDXIG3T7fGQr1R-Sqtmuil9tqbvrNfS16EAfOmD4SG7_CC-p2ckuO8pChG4Twa4HS0q5ajVnuDYfWxqnv9Xgesh"
            />
            <div class="overflow-hidden">
              <p class="text-xs font-bold truncate">王明老师</p>
              <p class="text-[10px] text-on-surface-variant">高级讲师</p>
            </div>
          </div>
        </div>
      </aside>

      <header
        class="stitch-home-header fixed top-0 h-16 flex justify-between items-center px-8 bg-[#f8f9fa]/80 backdrop-blur-md z-40"
      >
        <div class="stitch-home-header__left flex items-center gap-4">
          <h1 class="text-xl font-bold text-[#2e3335] font-headline">智慧教育云平台</h1>
          <div class="stitch-home-search ml-8 relative">
            <span
              class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm"
            >
              search
            </span>
            <input
              class="stitch-home-search__input bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 text-sm w-96 focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="搜索课程、工具或资源..."
              type="text"
            />
          </div>
        </div>

        <div class="stitch-home-header__right flex items-center gap-6">
          <div class="flex items-center gap-4 text-on-surface-variant">
            <button
              v-for="icon in topActionIcons"
              :key="icon"
              type="button"
              class="hover:text-[#005bc2] transition-colors"
            >
              <span class="material-symbols-outlined">{{ icon }}</span>
            </button>
          </div>

          <div class="h-8 w-px bg-outline-variant/20 mx-2"></div>

          <div class="stitch-home-profile flex items-center gap-3">
            <img
              alt="教师个人资料"
              class="w-8 h-8 rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3IO4h70HXKBCdIeO1xVTlo1mNIuvnMrKaeTjFTERPLOGL_ZN5APeXQfa23eS5nw3aRdED-sVQukCK9aHioefGckk9Qo7IDCcj8hcQMxJpM5CULWBNBleaC_xDn1lvKqGTWMpg65CCfpkGpXD1D3e1_x8cZ3aN9Tgb_R-myQYtyY_AX-Mz0hjZKF8S94R4EAMzsTjnDrNNvKczd0JSJY0ICZdYrE2oqfLehVJ1o4DOQLirHBmQnHgFxw9TcYxhJVbUtQaX_Y44"
            />
            <span class="text-sm font-medium">王明老师</span>
          </div>
        </div>
      </header>

      <main class="stitch-home-main ml-64 mt-16 p-10 min-h-screen">
        <div class="stitch-home-overview grid grid-cols-12 gap-8 mb-12">
          <section
            class="stitch-home-hero col-span-8 bg-gradient-to-br from-primary to-primary-dim rounded-3xl p-12 relative overflow-hidden flex items-center min-h-[400px]"
          >
            <div class="stitch-home-hero__content relative z-10 w-3/5">
              <h2 class="text-5xl font-black text-white mb-6 leading-tight">
                欢迎回来，开启今天的
                <br />
                智慧教学之旅
              </h2>
              <p class="text-white/80 text-xl mb-10 font-medium">
                您的 AI 助教已经准备就绪，随时为您提供课程支持。
              </p>
              <div class="stitch-home-hero__actions flex gap-4">
                <button
                  v-for="action in heroActions"
                  :key="action.label"
                  type="button"
                  class="px-10 py-5 rounded-2xl font-bold flex items-center gap-3 transition-all"
                  :class="
                    action.primary
                      ? 'bg-white text-primary shadow-xl hover:scale-105 transition-transform'
                      : 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30'
                  "
                >
                  <span class="material-symbols-outlined">{{ action.icon }}</span>
                  {{ action.label }}
                </button>
              </div>
            </div>

            <div class="stitch-home-hero__image absolute right-0 bottom-0 h-full w-2/5 flex items-end justify-end p-8">
              <img
                alt="可爱机器人吉祥物"
                class="h-[90%] object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHggtglKLASeWLwG5S9ZcgiP5IIMMXI2tsOBhE_RibbLFTFr6puFwq9rfXHBAPhCdjzYtMTMBznxhSROZdSwJum19chdSEDoLUMAruqrjimzZgVdTo_a1I1y3K6vbdc3BSmf85WYEPQNzc34MmOTw1ahqVqSjQjPjaHLgC6h8p6m-wx7TcXvEnROhSIyxtCgWMMB0Q5r7uRsya0W2n_x-MANXu7TbysCyC26Ag9hqmYBLER4kU3Yu-Yb0ZM2dKUAc1SWdXmOPQ"
              />
            </div>

            <div class="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-secondary/20 rounded-full blur-2xl"></div>
          </section>

          <section class="stitch-home-info-grid col-span-4 grid grid-cols-2 gap-6">
            <div
              v-for="card in infoCards"
              :key="card.label"
              class="bg-white p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                :class="card.bgClass"
              >
                <span
                  class="material-symbols-outlined text-3xl stitch-icon--filled"
                  :class="card.iconClass"
                >
                  {{ card.icon }}
                </span>
              </div>
              <div>
                <p class="text-on-surface-variant text-base font-medium">{{ card.label }}</p>
                <p class="text-4xl font-black text-on-surface">{{ card.value }}</p>
              </div>
            </div>
          </section>
        </div>

        <section class="mb-12">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h3 class="text-3xl font-bold text-on-surface">工具中心</h3>
              <p class="text-on-surface-variant text-lg font-medium mt-1">
                配套智能教具，激发无限创意
              </p>
            </div>
            <button
              type="button"
              class="text-primary font-bold text-lg flex items-center gap-1 hover:underline"
            >
              查看全部
              <span class="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          <div class="stitch-home-tools-grid grid grid-cols-3 gap-8">
            <div
              v-for="tool in toolCards"
              :key="tool.title"
              class="bg-white p-10 rounded-3xl flex flex-col items-center text-center group hover:bg-primary transition-all cursor-pointer border border-outline-variant/10"
            >
              <div
                class="w-32 h-32 bg-surface-container-low rounded-3xl flex items-center justify-center mb-8 group-hover:bg-white/20 transition-colors"
              >
                <img
                  :alt="tool.title"
                  class="w-20 h-20 object-contain"
                  :src="tool.image"
                />
              </div>
              <h4 class="text-xl font-bold group-hover:text-white">{{ tool.title }}</h4>
              <p class="text-on-surface-variant text-base mt-3 group-hover:text-white/80">
                {{ tool.description }}
              </p>
            </div>
          </div>
        </section>

        <section class="mb-12">
          <div class="flex justify-between items-end mb-8">
            <div>
              <h3 class="text-3xl font-bold text-on-surface">AI 实践中心</h3>
              <p class="text-on-surface-variant text-lg font-medium mt-1">
                通过机器学习，让机器变得更“聪明”
              </p>
            </div>
          </div>

          <div class="stitch-home-ai-grid grid grid-cols-4 gap-8">
            <div
              v-for="card in aiCards"
              :key="card.title"
              class="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group border border-outline-variant/10"
            >
              <div class="h-52 relative overflow-hidden" :class="card.bgClass">
                <img
                  :alt="card.title"
                  class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                  :src="card.image"
                />
                <div class="absolute inset-0 bg-gradient-to-t to-transparent" :class="card.overlayClass"></div>
              </div>
              <div class="p-6">
                <h4 class="font-bold text-xl">{{ card.title }}</h4>
              </div>
            </div>
          </div>
        </section>

        <section class="pb-16">
          <div class="stitch-home-record-header flex justify-between items-center mb-10">
            <div>
              <h3 class="text-3xl font-bold text-on-surface">授课记录</h3>
              <p class="text-on-surface-variant text-lg font-medium mt-1">
                延续您的教学进度，高效开展后续课程
              </p>
            </div>

            <div class="stitch-home-record-filters flex gap-6">
              <select
                class="bg-white border-none rounded-2xl px-8 py-4 text-base font-bold shadow-sm focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                <option v-for="item in classOptions" :key="item" :value="item">{{ item }}</option>
              </select>
              <select
                class="bg-white border-none rounded-2xl px-8 py-4 text-base font-bold shadow-sm focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
              >
                <option v-for="item in lessonOptions" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
          </div>

          <div class="stitch-home-record-grid grid grid-cols-5 gap-8">
            <div
              v-for="card in recordCards"
              :key="card.title"
              class="card-pattern bg-white rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all border border-outline-variant/30 flex flex-col gap-6 relative overflow-hidden"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none"
                :class="card.overlayClass"
              ></div>
              <div class="flex justify-between items-start relative z-10">
                <span
                  class="text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider"
                  :class="card.statusClass"
                >
                  {{ card.status }}
                </span>
                <button
                  type="button"
                  class="text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <h5 class="font-bold text-xl text-on-surface relative z-10 leading-snug">
                {{ card.title }}
              </h5>
              <div class="grid grid-cols-2 gap-3 mt-auto relative z-10">
                <button
                  type="button"
                  class="bg-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-dim transition-colors shadow-sm"
                >
                  去上课
                </button>
                <button
                  type="button"
                  class="bg-white/90 backdrop-blur-sm text-primary py-3 rounded-xl text-sm font-bold hover:bg-surface-container-high transition-colors border border-primary/20"
                >
                  去备课
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <button
        type="button"
        class="stitch-home-fab fixed w-20 h-20 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-50"
      >
        <span class="material-symbols-outlined text-4xl">smart_toy</span>
      </button>
    </div>

    <div v-if="!tailwindReady" class="stitch-home-loading">
      <div class="stitch-home-loading__panel">正在加载 Stitch 页面样式...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

useHead({
  title: "智慧教育平台主页 - 最终优化版",
  htmlAttrs: {
    lang: "zh-CN",
  },
  meta: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0",
    },
  ],
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap",
    },
  ],
});

type StitchTailwindRuntime = {
  config?: Record<string, unknown>;
  refresh?: () => void;
};

const sideNavItems = [
  { label: "首页", icon: "home", active: true },
  { label: "班级管理", icon: "group", active: false },
  { label: "课程中心", icon: "menu_book", active: false },
  { label: "工具中心", icon: "construction", active: false },
  { label: "AI 实践中心", icon: "psychology", active: false },
  { label: "教师成长", icon: "trending_up", active: false },
  { label: "竞赛中心", icon: "emoji_events", active: false },
];

const topActionIcons = ["notifications", "help", "settings"];

const heroActions = [
  { label: "去上课", icon: "play_circle", primary: true },
  { label: "去备课", icon: "edit_note", primary: false },
  { label: "任务管理", icon: "assignment", primary: false },
];

const infoCards = [
  {
    label: "班级数",
    value: "3",
    icon: "groups",
    bgClass: "bg-secondary-container",
    iconClass: "text-secondary",
  },
  {
    label: "授课课时",
    value: "4",
    icon: "history_edu",
    bgClass: "bg-primary-container",
    iconClass: "text-primary",
  },
  {
    label: "提交作品数",
    value: "0",
    icon: "palette",
    bgClass: "bg-tertiary-container",
    iconClass: "text-tertiary",
  },
  {
    label: "学生人数",
    value: "60",
    icon: "person_pin",
    bgClass: "bg-error-container/20",
    iconClass: "text-error",
  },
];

const toolCards = [
  {
    title: "MatataCode (VinciBot)",
    description: "专为 VinciBot 设计的图形化编程环境",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7wS2Z_qXzRTP6tF_2coEoN0IWmvpTAU4bdSlmJKAiz1srkEqAEe9WkNNeG7kUGBcSYRefbgfTA--0Gg41VsO3gfWghyDCge5RWBqtlJ8Tap3X09uPVy6DNX7GjU0iBbZNhZ6BCExauw4EqAybdtx2iq8V-gmVTXEjus8VPFIkrn3Gq80YiLl_iGh4IOAIkwCHuAxNxtzhYI5xYXnHd2RM63M5DtMpLAdu1ZWEVv-wDXJqCB7dFYW2q-cbW9sS7jht6XWbJx4R",
  },
  {
    title: "MatataCode (Nous)",
    description: "深度学习与神经科学启蒙工具",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2nDfl0MzlNFmb-wGI9Y9P1VPvhkxqVzYq6pTsVzUdHr2m_yjjQw0w52hnUSnA3q-8ZMcOEZGm3xaU67d6h2JHgmbBh__fCDFM5VOr13rNcLGSdF-gvEXxxgvbj1pIz-VNpT4LBDJBgSeshC2GOc-IIxdWMTIj_w1U53ORZxGzG-JnitLpJ6cafmb--GjNMvnRcC6Q60HEx167VaCglUWuUnanhrMK2TBIJc-d4iUFZQsJbdm-VLzjJS6NOsU6heNPARptHYMD",
  },
  {
    title: "MatataCode (TaleMap)",
    description: "将编程与故事创作完美结合",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBO_UlMLy0mmxV9Xe__lHEzG0KYL1l2MqvYega_6DPAy0ywDpVrSG6P7tA81o88OSpeZrvDZiJnec08zrUx3FfFOgNp7RLtLiqRKJ71jt89Ggc-60bT_lk05npqf66zUklu8pOsqeIY91vQL9Q3qO0EWM00Ubv7ZAWrHzH4Nya53_5CTHXSlscuy0AzATuR5BhDVoMKp6tlrRdBgep07MzBU5wRQrILV63hmTIwWXFuwOJmvFxdFHSKG0jXBLTuTwcFITDazCiA",
  },
];

const aiCards = [
  {
    title: "图像分类训练",
    bgClass: "bg-[#e4dfff]",
    overlayClass: "from-secondary/40",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbwKlXwUDTdzZ3X30hT925P3iDZNg-WaHvFRc5d0t3FiiS1CPnPHWa0MtZvrh9sOqWzMVJQ8BW36ZdxxGdPk529aFXVqYq0oZqauklXe_5vFRUBbKv_4eHST_VPYFHNhVnIq7D2kpi6rimQ0JxcRVFHsk8HB1XefaZj5cDgc95seP46yDaokMwhA5Ni2mkUig0ErmZSfKgnPkUeMPe46MRW2eyzQ_3P6BlGy58_2uSw34zHBZpNILtchGETYZK6qk7A2cgTHfq",
  },
  {
    title: "手势分类训练",
    bgClass: "bg-primary-container",
    overlayClass: "from-primary/40",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBb8Odb9ik_O-x2VEqYrH7Jbqv_wiI6OvcS1z4uoR_9o4aLM9CCnn7Ai6bMXJ00iyfmDo7OAMTrGoXHwBQxtzluMFafXpS01A9khRZjpsE9J53qAL7JUa-50bpSroqE2Ok_t3g4xx99lDRiVXYvrDOf94ghh_DRYsISZD3SPMI786P_kDGelrHSFjLfUm_cvhATLrEVr6HLJ-iZ-u-Nak3bt372AUk5KMl-kaiqAH10wK-6zNcI7KmoVXfNvNXoMuTuX3fKZqIm",
  },
  {
    title: "语音分类训练",
    bgClass: "bg-tertiary-container",
    overlayClass: "from-tertiary/40",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfOR9lomyxeb5YLQEOXK_JlDAN_bw9Ch3t6nBD2evb24XNdC1OMSQA98pOUNNYG6AQ2dLLXmZf1FP8Gnp5guWyOPtmFaZErVDsGMrY0Izestm3MyyiOX1WD_QGOM_yaVnJCAx2Ic-ykdrUneu57MKvUOAmKixZ4NU35v2T9WdfiLUYS7fMAaZm8q6s2AI-XV7gUxPmirZuwo_tS-CNvKxXEoJBOgJyURajt_VpJzY7qjs8GIG44OSuh9855IsQPPtBbZLn5P3O",
  },
  {
    title: "姿态分类训练",
    bgClass: "bg-error-container",
    overlayClass: "from-error/40",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB86rWP6EJD4x93Nrw1_2Esgjqs_HtRThsba22jQcPHtC-RrEfWxBmf0uvFnN6ZvQRfpGqZKghJy_5F68v9W01sUvEahraAkerC8PWVKS28qKcsAwkKoSaZma-8pTIzKTOzjihVXzjuDAO65S08wODtbD5G2dTH9-xE3jcZoLfvpxgDZvlB7KJLLyVIOJetcnbeVg6rOITLD1JPc_blIxBDyVU6HJSk8JLktEp6rB28T6qXTHtUMDZx1M7_Ri6JOwWvzTA7IVQ9",
  },
];

const classOptions = ["一年级(1)班", "一年级(2)班", "二年级(3)班"];
const lessonOptions = ["L1 基础课", "L2 进阶课", "AI 实践课"];

const recordCards = [
  {
    title: "01 课 你好，玛塔机器人",
    status: "Already Finished",
    statusClass: "bg-green-100 text-green-700",
    overlayClass: "from-primary/10",
  },
  {
    title: "02 课 农场动物在哪里",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-secondary/10",
  },
  {
    title: "03 课 颜色大冒险",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-tertiary/10",
  },
  {
    title: "04 课 森林舞会",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-error/10",
  },
  {
    title: "05 课 形状大变身",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-primary/10",
  },
  {
    title: "06 课 数字小英雄",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-secondary/10",
  },
  {
    title: "07 课 海洋探秘",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-tertiary/10",
  },
  {
    title: "08 课 太空之旅",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-error/10",
  },
  {
    title: "09 课 逻辑大迷宫",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-primary/10",
  },
  {
    title: "10 课 毕业设计展",
    status: "Not Started",
    statusClass: "bg-orange-100 text-orange-700",
    overlayClass: "from-secondary/10",
  },
];

const tailwindReady = ref(false);

const stitchTailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-error-container": "#65000b",
        "surface-container-low": "#f2f4f5",
        "on-secondary-container": "#4b38c5",
        "primary-dim": "#0050ab",
        "error-container": "#f56965",
        outline: "#767c7e",
        "tertiary-fixed-dim": "#f3953a",
        "surface-container-high": "#e5e9eb",
        "primary-container": "#a4c1ff",
        "on-tertiary-container": "#552c00",
        "primary-fixed": "#a4c1ff",
        "on-error": "#fff7f6",
        error: "#ac3434",
        "surface-container-lowest": "#ffffff",
        "outline-variant": "#aeb3b5",
        "on-secondary-fixed": "#381eb3",
        primary: "#005bc2",
        "error-dim": "#70030f",
        background: "#f8f9fa",
        "surface-container-highest": "#dee3e5",
        "inverse-surface": "#0c0f10",
        "on-background": "#2e3335",
        "on-secondary": "#fcf7ff",
        "surface-container": "#ebeef0",
        "surface-tint": "#005bc2",
        "on-surface": "#2e3335",
        "on-primary-fixed-variant": "#004291",
        "surface-variant": "#dee3e5",
        "on-secondary-fixed-variant": "#5543cf",
        "inverse-on-surface": "#9b9d9e",
        "primary-fixed-dim": "#8eb3ff",
        "on-tertiary-fixed-variant": "#623400",
        surface: "#f8f9fa",
        "tertiary-container": "#ffa44f",
        "on-primary": "#f9f8ff",
        secondary: "#5948d3",
        "on-primary-fixed": "#002658",
        "inverse-primary": "#4b8eff",
        "on-primary-container": "#003a80",
        "secondary-fixed-dim": "#d5cfff",
        "secondary-container": "#e4dfff",
        "surface-dim": "#d5dbdd",
        "on-tertiary": "#fff7f4",
        "tertiary-fixed": "#ffa44f",
        "secondary-dim": "#4d39c7",
        "tertiary-dim": "#7f4400",
        tertiary: "#904e00",
        "secondary-fixed": "#e4dfff",
        "on-surface-variant": "#5a6062",
        "surface-bright": "#f8f9fa",
        "on-tertiary-fixed": "#351900",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "PingFang SC", "sans-serif"],
        body: ["Manrope", "PingFang SC", "sans-serif"],
        label: ["Manrope", "PingFang SC", "sans-serif"],
      },
    },
  },
};

const markReady = async () => {
  await nextTick();
  const runtimeWindow = window as typeof window & { tailwind?: StitchTailwindRuntime };
  if (typeof runtimeWindow.tailwind?.refresh === "function") {
    runtimeWindow.tailwind.refresh();
  }
  tailwindReady.value = true;
};

onMounted(() => {
  const runtimeWindow = window as typeof window & { tailwind?: StitchTailwindRuntime };
  runtimeWindow.tailwind = runtimeWindow.tailwind ?? {};
  runtimeWindow.tailwind.config = stitchTailwindConfig;

  const existingScript = document.getElementById("stitch-tailwind-cdn") as HTMLScriptElement | null;
  if (existingScript) {
    void markReady();
    return;
  }

  const tailwindScript = document.createElement("script");
  tailwindScript.id = "stitch-tailwind-cdn";
  tailwindScript.src = "https://cdn.tailwindcss.com?plugins=forms,container-queries";
  tailwindScript.async = true;
  tailwindScript.onload = () => {
    void markReady();
  };
  tailwindScript.onerror = () => {
    tailwindReady.value = true;
  };

  document.head.appendChild(tailwindScript);
});
</script>

<style scoped>
.stitch-home-shell {
  --stitch-page-width: min(100vw, 1920px);
  --stitch-sidebar-width: 256px;
  --stitch-main-padding: 40px;
  --stitch-section-gap: 32px;
  --stitch-card-gap: 24px;
  min-height: 100vh;
  background: #f8f9fa;
  overflow-x: hidden;
}

.stitch-home-page {
  width: var(--stitch-page-width);
  max-width: 100vw;
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
  background: #f8f9fa;
  font-family: "Manrope", "PingFang SC", sans-serif;
  color: #2e3335;
}

.stitch-home-page--pending {
  visibility: hidden;
}

.stitch-home-sidebar {
  left: max(0px, calc((100vw - var(--stitch-page-width)) / 2));
  width: var(--stitch-sidebar-width);
}

.stitch-home-header {
  left: max(
    var(--stitch-sidebar-width),
    calc((100vw - var(--stitch-page-width)) / 2 + var(--stitch-sidebar-width))
  );
  width: calc(var(--stitch-page-width) - var(--stitch-sidebar-width));
  gap: 20px;
}

.stitch-home-fab {
  right: max(48px, calc((100vw - var(--stitch-page-width)) / 2 + 48px));
  bottom: 48px;
}

.stitch-home-main {
  margin-left: var(--stitch-sidebar-width);
  padding: var(--stitch-main-padding);
}

.stitch-home-overview {
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.95fr);
  align-items: stretch;
}

.stitch-home-hero,
.stitch-home-info-grid {
  grid-column: auto / auto;
}

.stitch-home-overview,
.stitch-home-tools-grid,
.stitch-home-ai-grid,
.stitch-home-record-grid {
  gap: var(--stitch-section-gap);
}

.stitch-home-info-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--stitch-card-gap);
}

.stitch-home-header__left,
.stitch-home-header__right,
.stitch-home-record-header,
.stitch-home-record-filters,
.stitch-home-hero__content,
.stitch-home-hero__actions,
.stitch-home-tools-grid > div,
.stitch-home-ai-grid > div,
.stitch-home-record-grid > div {
  min-width: 0;
}

.stitch-home-header__left {
  flex: 1;
}

.stitch-home-header__right {
  flex-shrink: 0;
}

.stitch-home-search {
  flex: 1;
  max-width: 24rem;
}

.stitch-home-search__input {
  width: 100%;
  max-width: 24rem;
}

.stitch-home-tools-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.stitch-home-ai-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stitch-home-record-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.stitch-home-record-header {
  flex-wrap: wrap;
  gap: 20px;
}

.stitch-home-record-filters {
  flex-wrap: wrap;
}

.stitch-home-record-filters select {
  flex: 1 1 220px;
  min-width: 0;
}

@media (max-width: 1500px) {
  .stitch-home-shell {
    --stitch-sidebar-width: 224px;
    --stitch-main-padding: 32px;
    --stitch-section-gap: 24px;
    --stitch-card-gap: 20px;
  }

  .stitch-home-header {
    padding-inline: 24px;
  }

  .stitch-home-search {
    margin-left: 20px;
  }

  .stitch-home-search__input {
    max-width: 18rem;
  }

  .stitch-home-main {
    padding-top: 32px;
  }

  .stitch-home-overview {
    grid-template-columns: 1fr;
  }

  .stitch-home-hero,
  .stitch-home-info-grid {
    grid-column: 1 / -1;
  }

  .stitch-home-info-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .stitch-home-hero {
    min-height: 360px;
    padding: 36px;
  }

  .stitch-home-hero__content {
    width: 58%;
  }

  .stitch-home-hero h2 {
    font-size: 2.5rem;
    line-height: 1.15;
    margin-bottom: 20px;
  }

  .stitch-home-hero p {
    font-size: 1.0625rem;
    margin-bottom: 28px;
  }

  .stitch-home-hero__actions {
    flex-wrap: wrap;
  }

  .stitch-home-hero__actions button {
    padding-inline: 28px;
    padding-block: 16px;
  }

  .stitch-home-info-grid > div,
  .stitch-home-tools-grid > div,
  .stitch-home-record-grid > div {
    padding: 28px;
  }

  .stitch-home-ai-grid > div > div:last-child {
    padding: 20px;
  }

  .stitch-home-record-grid h5 {
    font-size: 1.0625rem;
  }
}

@media (max-width: 1300px) {
  .stitch-home-shell {
    --stitch-sidebar-width: 208px;
    --stitch-main-padding: 24px;
    --stitch-section-gap: 20px;
    --stitch-card-gap: 16px;
  }

  .stitch-home-sidebar {
    padding-inline: 12px;
  }

  .stitch-home-header {
    height: 60px;
    padding-inline: 20px;
  }

  .stitch-home-header__left h1 {
    font-size: 1rem;
    white-space: nowrap;
  }

  .stitch-home-search {
    margin-left: 16px;
  }

  .stitch-home-search__input {
    max-width: 14rem;
  }

  .stitch-home-header__right {
    gap: 16px;
  }

  .stitch-home-profile {
    gap: 8px;
  }

  .stitch-home-profile span {
    display: none;
  }

  .stitch-home-main {
    margin-top: 60px;
  }

  .stitch-home-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stitch-home-hero {
    display: block;
    min-height: 320px;
    padding: 28px;
  }

  .stitch-home-hero__content {
    width: 100%;
  }

  .stitch-home-hero h2 {
    font-size: 2rem;
    margin-bottom: 16px;
  }

  .stitch-home-hero p {
    font-size: 0.9375rem;
    margin-bottom: 22px;
  }

  .stitch-home-hero__actions {
    gap: 12px;
  }

  .stitch-home-hero__actions button {
    padding-inline: 20px;
    padding-block: 14px;
    font-size: 14px;
  }

  .stitch-home-hero__image {
    position: relative;
    inset: auto;
    width: 100%;
    max-width: 320px;
    height: 220px;
    margin-top: 18px;
    margin-left: auto;
    padding: 0;
  }

  .stitch-home-hero__image img {
    height: 100%;
    max-height: 220px;
  }

  .stitch-home-info-grid > div {
    padding: 24px;
  }

  .stitch-home-info-grid p:last-child {
    font-size: 2rem;
  }

  .stitch-home-tools-grid > div {
    padding: 24px 20px;
  }

  .stitch-home-tools-grid h4,
  .stitch-home-ai-grid h4,
  .stitch-home-record-grid h5 {
    font-size: 1rem;
  }

  .stitch-home-tools-grid p,
  .stitch-home-ai-grid p,
  .stitch-home-record-header p {
    font-size: 0.875rem;
  }

  .stitch-home-ai-grid > div > div:first-child {
    height: 180px;
  }

  .stitch-home-ai-grid > div > div:last-child {
    padding: 16px;
  }

  .stitch-home-record-header {
    gap: 16px;
    align-items: flex-start;
  }

  .stitch-home-record-filters {
    gap: 12px;
  }

  .stitch-home-record-filters select {
    padding-inline: 20px;
    padding-block: 12px;
    font-size: 14px;
  }

  .stitch-home-record-grid > div {
    padding: 20px;
    gap: 18px;
  }

  .stitch-home-record-grid > div > div:last-child {
    grid-template-columns: 1fr;
  }

  .stitch-home-record-grid button {
    font-size: 13px;
  }

  .stitch-home-fab {
    width: 64px;
    height: 64px;
    right: 24px;
    bottom: 24px;
  }

  .stitch-home-fab span {
    font-size: 2rem;
  }
}

@media (max-width: 1100px) {
  .stitch-home-shell {
    --stitch-sidebar-width: 184px;
    --stitch-main-padding: 20px;
  }

  .stitch-home-header {
    padding-inline: 16px;
  }

  .stitch-home-search__input {
    max-width: 11rem;
  }

  .stitch-home-info-grid,
  .stitch-home-tools-grid,
  .stitch-home-ai-grid,
  .stitch-home-record-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.stitch-home-loading {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 249, 250, 0.92);
  z-index: 120;
}

.stitch-home-loading__panel {
  padding: 20px 28px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  color: #2e3335;
  box-shadow: 0 12px 32px rgba(46, 51, 53, 0.08);
  backdrop-filter: blur(16px);
  font-size: 16px;
  font-weight: 600;
}

.material-symbols-outlined {
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
  vertical-align: middle;
}

.stitch-icon--filled {
  font-variation-settings:
    "FILL" 1,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}

.card-pattern {
  background-color: #ffffff;
  background-image: radial-gradient(#005bc225 1.5px, transparent 1.5px);
  background-size: 16px 16px;
}
</style>
