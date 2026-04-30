const fs = require("node:fs");
const path = require("node:path");
const { EventEmitter } = require("node:events");
const { syncBuiltinESMExports } = require("node:module");

if (!global.__MATA_NUXT_FS_WATCH_PATCHED__) {
  global.__MATA_NUXT_FS_WATCH_PATCHED__ = true;

  const originalWatch = fs.watch.bind(fs);
  const disabledWatchTargets = new Set();

  const toAbsolutePath = (target) => {
    if (target instanceof URL) {
      return path.resolve(target.pathname);
    }
    return path.resolve(String(target));
  };

  const isNuxtDistDir = (targetPath) => {
    const normalized = targetPath.replace(/\//g, "\\").toLowerCase();
    return normalized.includes("\\.nuxt\\dist");
  };

  const createNoopWatcher = () => {
    const watcher = new EventEmitter();
    watcher.close = () => {};
    watcher.ref = () => watcher;
    watcher.unref = () => watcher;
    return watcher;
  };

  const createNuxtDistPollingWatcher = (targetPath) => {
    const watcher = new EventEmitter();
    let closed = false;
    let hadTarget = fs.existsSync(targetPath);
    const interval = setInterval(() => {
      if (closed) return;
      const exists = fs.existsSync(targetPath);

      // 目录从存在 -> 不存在：通知 Nuxt 重启
      if (hadTarget && !exists) {
        watcher.emit("change", "rename", "");
      }

      hadTarget = exists;
    }, 500);

    watcher.close = () => {
      closed = true;
      clearInterval(interval);
    };
    watcher.ref = () => {
      if (typeof interval.ref === "function") interval.ref();
      return watcher;
    };
    watcher.unref = () => {
      if (typeof interval.unref === "function") interval.unref();
      return watcher;
    };
    return watcher;
  };

  fs.watch = function patchedWatch(target, options, listener) {
    const targetPath = toAbsolutePath(target);
    const watchNuxtDist = isNuxtDistDir(targetPath);

    if (watchNuxtDist) {
      if (!disabledWatchTargets.has(targetPath)) {
        disabledWatchTargets.add(targetPath);
        console.warn(
          `[nuxt-watch-patch] 使用轮询监听 .nuxt/dist（规避 Windows EPERM）: ${targetPath}`,
        );
      }
      return createNuxtDistPollingWatcher(targetPath);
    }

    try {
      return originalWatch(target, options, listener);
    } catch (error) {
      if (
        error &&
        error.code === "EPERM" &&
        error.syscall === "watch"
      ) {
        console.warn(
          `[nuxt-watch-patch] 已回退为 noop watcher: ${targetPath}`,
        );
        return createNoopWatcher();
      }

      throw error;
    }
  };

  syncBuiltinESMExports();
}
