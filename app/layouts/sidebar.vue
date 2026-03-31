<template>
  <div class="sidebar-shell">
    <div class="sidebar-shell-body">
      <!-- 固定的左侧导航 -->
      <AppSidebar class="hidden lg:flex flex-shrink-0" />

      <div class="sidebar-shell-main">
        <div class="sidebar-shell-content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.sidebar-shell {
  height: 100vh;
  overflow: hidden;
  background: #f1f1f1;
}

.sidebar-shell-body {
  display: flex;
  height: 100%;
  gap: 12px;
  background: #f1f1f1;
}

.sidebar-shell-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-right: 12px;
}

.sidebar-shell-content {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

@media (min-width: 1024px) {
  .sidebar-shell-body {
    gap: 24px;
  }

  .sidebar-shell-main {
    margin-right: 24px;
  }
}

@media (min-width: 1280px) {
  .sidebar-shell-body {
    gap: 40px;
  }

  .sidebar-shell-main {
    margin-right: 40px;
  }
}

@media (min-width: 1536px) {
  .sidebar-shell-body {
    gap: 68px;
  }

  .sidebar-shell-main {
    margin-right: 68px;
  }
}
</style>
