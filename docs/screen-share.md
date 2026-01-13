# 屏幕分享功能说明

## 技术方案

使用 PeerJS 实现老师端屏幕分享，学生端接收。

- PeerJS 服务器：`peerjs.matatastudio.com:443`
- 信令通知：WebSocket

## PeerId 格式

- 老师端：`{classId}`（如 `1996788444002480128`）
- 学生端：`student_{classId}_{userId}`（如 `student_1996788444002480128_123456`）

## 核心流程

### 老师开始分享
1. 调用 `getDisplayMedia` 获取屏幕流
2. 呼叫等待列表中的学生（`pendingStudents`）
3. 发送 `SCREEN_SHARE_START` WebSocket 通知

### 学生接收分享
1. 收到 `CLASS_BEGIN` 后初始化 PeerJS
2. 连接老师发送 `REQUEST_SCREEN` 请求
3. 老师收到请求后呼叫学生
4. 学生应答呼叫，接收屏幕流

### 老师停止分享
1. 停止屏幕流
2. 把当前连接的学生加回 `pendingStudents`（关键！）
3. 关闭所有呼叫
4. 发送 `SCREEN_SHARE_STOP` WebSocket 通知

### 老师再次分享
1. 获取新的屏幕流
2. 呼叫 `pendingStudents` 中的学生（不依赖 WebSocket 通知）

## 关键文件

- `app/composables/usePeerJS.ts` - PeerJS 封装
- `app/pages/system/classroom/[id].vue` - 老师端课堂
- `app/pages/student/classroom/index.vue` - 学生端课堂

## 踩坑记录

1. **第二次分享学生收不到**：老师停止分享时要把学生加回等待列表，下次分享时主动呼叫
2. **多学生冲突**：学生 peerId 要包含 userId，不能只用 classId
3. **ID is taken 错误**：同一个 peerId 重复初始化会报错，需要先 destroy 再初始化
