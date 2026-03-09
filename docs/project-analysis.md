# mata-edu-web 项目结构与现状分析

更新时间：2026-03-04

## 1. 项目概览

`mata-edu-web` 是一个基于 Nuxt 4 + Vue 3 的教育平台前端项目，采用前后端分离模式，当前为纯客户端渲染（`ssr: false`）。

项目主要覆盖以下业务域：

- 教师端：首页、班级管理、课程中心、课堂上课、任务管理、工具中心、AI实践中心、成长中心
- 学生端：首页、课堂、课程、学习记录、任务作答
- 管理端：市/区/校管理相关页面

## 2. 技术栈与关键配置

## 2.1 核心框架

- Nuxt 4（路由基于文件系统）
- Vue 3 + TypeScript
- Tailwind CSS
- Element Plus
- vue-i18n（中英文）

## 2.2 关键能力

- 统一请求封装：`app/composables/api/useHttp.ts`
- 登录与鉴权：`app/composables/api/useAuth.ts`
- 课堂实时通信：WebSocket + PeerJS（并保留 WebRTC/STOMP 方案代码）
- 任务管理与作答：`taskmanagement` + `student/task` 相关页面和组件

## 2.3 构建与输出

- 开发：`npm run dev`
- 构建：`npm run build` / `npm run build:dev`
- 构建输出目录：`dist/`（在 `nuxt.config.ts` 中配置）

## 3. 顶层目录说明

- `app/`：主业务代码（页面、组件、API、布局、插件、工具）
- `docs/`：项目文档
- `i18n/`：多语言资源文件
- `scripts/`：翻译与文案提取脚本
- `server/`：本地信令服务脚本
- `public/`：静态资源（favicon、robots）
- `dist/`：构建产物
- `.vscode/`：工作区编辑器配置
- `.github/`：CI 目录（当前为空）
- `src/`：当前未使用

## 4. app 目录详细说明

## 4.1 入口与布局

- `app/app.vue`：全局页面容器、加载条、全局“回到课堂”组件挂载
- `app/error.vue`：全局错误页
- `app/layouts/auth.vue`：登录页布局
- `app/layouts/default.vue`：通用布局
- `app/layouts/sidebar.vue`：教师管理侧边栏布局
- `app/layouts/blank.vue`：空布局（课堂/预览等场景）

## 4.2 插件与工具

- `app/plugins/i18n.ts`：i18n 初始化
- `app/plugins/fetch-interceptor.ts`：全局 `$fetch` 请求头处理
- `app/plugins/element-plus.ts`：Element Plus 组件注册
- `app/utils/crypto.ts`：AES 相关能力
- `app/utils/jsencrypt.ts`：RSA 加密能力

## 4.3 业务页面（pages）

### 认证与入口

- `app/pages/index.vue`：登录主页（账号/验证码/班级码/试用/找回密码）
- `app/pages/district.vue`：模块切换入口页

### 教师核心

- `app/pages/teacher.vue`：教师首页
- `app/pages/system/class/index.vue`：班级管理（学生/小组/快捷登录/批量操作）
- `app/pages/system/course/index.vue`：课程中心首页
- `app/pages/system/course/[id].vue`：课程详情
- `app/pages/system/course/prepare/[id].vue`：备课页面
- `app/pages/system/classroom/[id].vue`：教师课堂页（上课实时互动）
- `app/pages/taskmanagement/index.vue`：任务管理主页面
- `app/pages/taskmanagement/custom-exercise.vue`：自定义练习题列表
- `app/pages/taskmanagement/add-custom-question/index.vue`：练习题新增/编辑

### 教师扩展

- `app/pages/system/tool/index.vue`：工具中心（外链与 iframe）
- `app/pages/system/ai/index.vue`：AI实践中心
- `app/pages/system/ai/material/index.vue`：AI素材页（当前为占位）
- `app/pages/system/event/index.vue`：赛事中心（iframe）
- `app/pages/system/growth/*`：教师成长中心（课程、社区、图书）

### 学生核心

- `app/pages/student/index.vue`：学生首页（课堂通知、返回课堂入口）
- `app/pages/student/classroom/index.vue`：学生课堂页
- `app/pages/student/lessonsrecord/index.vue`：学习记录页（课程轮播、章节任务）
- `app/pages/student/task/index.vue`：学生任务主页面
- `app/pages/student/course/index.vue`：课程列表
- `app/pages/student/course/[id].vue`：课程详情
- `app/pages/student/course/preview/[id].vue`：课程预览
- `app/pages/student/studentcourse/index.vue`：占位页面

### 管理端页面

- `app/pages/city/index.vue`：区管理人员页面
- `app/pages/school/index.vue`：学校列表
- `app/pages/school/[orgId]/index.vue`：学校内管理员管理
- `app/pages/system/user/index.vue`：学校用户管理

## 4.4 核心组件（components）

### 布局组件

- `app/components/layout/AppHeader.vue`
- `app/components/layout/AppSidebar.vue`

### 任务与课堂关键组件

- `app/components/student/StudentTaskAnswerModal.vue`：学生答题弹窗（单选/多选/判断/填空/连线）
- `app/components/StudentManageModal.vue`：班级学生与小组管理弹窗
- `app/components/StartClassModal.vue`：开课设置
- `app/components/SendCoursewareModal.vue`：课件发送与撤回

### 基础 UI 组件

- `app/components/ui/MButton.vue`：通用按钮组件，支持 `primary/default/danger/text` 四种风格、三档尺寸和禁用态
- `app/components/ui/MInput.vue`：通用输入框，支持前后缀插槽、清空按钮、错误态，以及 `focus/blur/enter` 事件
- `app/components/ui/MSelect.vue`：自定义下拉选择器，支持搜索过滤、点击/悬停展开、`Teleport` 浮层定位和自定义选项渲染
- `app/components/ui/MTable.vue`：表格组件，支持加载遮罩、斑马纹、序号列、复选选择、整表全选和单元格插槽扩展
- `app/components/ui/MModal.vue`：通用弹窗，支持标题/内容/底部按钮插槽、尺寸控制、遮罩关闭、`Esc` 关闭和多弹窗栈管理
- `app/components/ui/MPagination.vue`：分页组件，支持总数展示、每页条数切换、省略页码和页码跳转
- `app/components/ui/MTabs.vue`：标签切换组件，适合登录页或列表页的状态切换，支持徽标数和等宽铺满
- `app/components/ui/MTooltip.vue`：轻量提示浮层，鼠标悬停展示，支持上/下/左/右四个方向
- `app/components/ui/MTree.vue`：递归树形组件，支持节点展开收起、当前选中态，以及节点图标/操作区插槽
- `app/components/ui/MFilterPopover.vue`：悬停式筛选浮层，常用于表头或工具栏里的快速筛选选项切换
- `app/components/ui/ImageUploader.vue`：图片上传组件，封装文件类型/大小校验、上传中状态、缩略图预览、重新上传和删除
- `app/components/ui/ImagePreviewModal.vue`：图片预览弹窗，配合 `ImageUploader` 使用，用于放大查看上传结果
- `app/components/ui/StarRating.vue`：星级评分组件，支持只读展示和可编辑评分，支持半星选择
- `app/components/ui/MMessage.ts`：函数式全局消息提示，提供 `success/error/warning/info` 四类反馈
- `app/components/ui/index.ts`：UI 组件导出入口，目前主要统一导出 `ElMessage`

### 登录与认证组件

- `app/components/CampusLoginForm.vue`：账号密码登录表单，负责用户名/密码输入、错误态回填，以及“忘记密码”入口触发
- `app/components/PhoneLoginForm.vue`：手机号验证码登录表单，集成区号选择、手机号格式校验、验证码发送倒计时，并支持切回密码登录
- `app/components/ClassCodeLoginForm.vue`：班级码登录表单，输入班级码和班级密码，用于快捷进入特定班级场景
- `app/components/ForgotPasswordForm.vue`：重置密码表单，串起手机号校验、短信验证码、新密码与确认密码校验，最终向父组件提交重置数据
- `app/components/TrialAccountForm.vue`：试用账号申请表单，收集姓名、手机号、验证码、学校/机构名称、试用目的和感兴趣产品，并暴露提交校验方法给父组件调用
- `app/components/CountryCodeSelector.vue`：国家/地区区号选择器，内置搜索、常用区号列表和手机号规则校验，被手机号登录、忘记密码、试用申请等表单复用

## 4.5 组合式函数与 API 封装（composables）

### 统一 API 层（`app/composables/api`）

- `useHttp.ts`：请求基座、token、语言头、错误处理、可选加密
- `useAuth.ts`：登录/登出/短信验证码/重置密码/班级码登录
- `useTeacher.ts`：教师业务 API（班级、学生、小组、开课、快捷登录）
- `taskmanagement.ts`：任务管理 API（下发、撤回、任务列表、详情、打回）
- `student.ts`：学生任务 API（任务列表、开始任务、提交任务）
- `curosr.ts`：课程中心 API（命名有拼写问题，实际为 course 语义）
- `growth.ts`：成长中心 API
- `useSchoolUser.ts`、`city.ts`、`districtAdmin.ts`：管理端 API

### 实时与状态能力

- `usePeerJS.ts`：课堂屏幕分享主链路
- `useSignaling.ts`：原生 WebSocket 信令
- `useWebRTC.ts`、`useStompSignaling.ts`：预留/备用实现
- `useFilePreview.ts`：文件预览统一逻辑
- `useLoading.ts`：全局 loading 状态

## 5. 文档、脚本与国际化

## 5.1 docs

- `docs/screen-share.md`：屏幕分享方案与踩坑记录
- `docs/useAsyncData-migration.md`：数据加载改造说明
- `docs/wendang.md`：历史文档（内容较混杂）
- `docs/project-analysis.md`：当前文档

## 5.2 scripts

- `scripts/translation_tool.js`：i18n JSON 与 Excel 互转
- `scripts/extract-chinese.cjs`：提取中文文案到 CSV

## 5.3 i18n

- `i18n/locales/zh.json`：中文语言包
- `i18n/locales/en.json`：英文语言包
- `i18n/locales/en1.json`：额外英文包（当前未见实际引用）

## 6. 当前程序进度（截至本次分析）

## 6.1 已成型能力

- 教师侧：班级管理、课程中心、课堂页、任务下发链路已打通
- 学生侧：课堂进入、学习记录、任务作答与提交链路已可闭环
- 任务中心：已按 `resourceCategory` 做多资源类型分发处理
- 课堂体验：已具备“返回首页再回课堂”与课堂计时持续能力

## 6.2 最近关键改动状态（代码已体现）

- 教师下课时调用停用快捷登录接口
- 处理了学生回首页与自动入课堂冲突
- 增加学生端“返回课堂”入口
- 学生课堂计时从“递增计数”改为“按起始时间回算”

## 7. 已知风险与技术债

- `build:dev` 过程仍显示 `NODE_ENV` 被切换到 production，环境行为需再收敛
- `nuxt.config.ts` 中存在硬编码网关地址，建议统一走环境变量
- 构建存在大包告警（chunk 体积偏大）
- 有占位页未完成（如 `system/ai/material`、`student/studentcourse`）
- 存在遗留/空壳文件（如 `app/composables/api/tool.ts`、`app/api/auth.ts`）
- `curosr.ts` 命名拼写不规范，建议后续统一
- `.github/workflows` 为空，缺少 CI 自动检查

## 8. 建议的下一步（按优先级）

1. 稳定性优先：统一环境变量与网关配置，避免开发/测试环境混淆
2. 性能优化：按页面和业务域做懒加载与分包
3. 结构治理：清理遗留文件与占位页面，统一命名规范
4. 工程化补齐：增加 CI（构建、类型检查、lint）
5. 文档完善：补充接口映射表、状态流转图、关键页面时序图

---

如需继续补充，可以在本文件后续新增：

- “页面 -> 接口 -> 字段” 对照表
- 教师端与学生端的时序图
- 本地开发与联调排查手册
