export interface FaceDemoProfile {
  id: string;
  name: string;
  avatarDataUrl: string;
  descriptor: number[];
  descriptorVersion?: string;
  createdAt: number;
}

const FACE_DEMO_DB_NAME = "mata-face-demo";
const FACE_DEMO_STORE_NAME = "profiles";
const FACE_DEMO_DB_VERSION = 1;

const openFaceDemoDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!import.meta.client || typeof indexedDB === "undefined") {
      reject(new Error("当前环境不支持 IndexedDB"));
      return;
    }

    const request = indexedDB.open(FACE_DEMO_DB_NAME, FACE_DEMO_DB_VERSION);

    request.onerror = () => {
      reject(request.error || new Error("打开本地人脸库失败"));
    };

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(FACE_DEMO_STORE_NAME)) {
        db.createObjectStore(FACE_DEMO_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
};

const runStoreAction = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: unknown) => void) => void,
) => {
  const db = await openFaceDemoDB();

  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(FACE_DEMO_STORE_NAME, mode);
    const store = transaction.objectStore(FACE_DEMO_STORE_NAME);
    let settled = false;
    let hasResult = false;
    let resultValue: T;

    const resolveOnComplete = (value: T) => {
      hasResult = true;
      resultValue = value;
    };

    const rejectOnce = (reason?: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      db.close();
      reject(reason);
    };

    transaction.onabort = () => {
      rejectOnce(transaction.error || new Error("本地人脸库操作失败"));
    };

    transaction.onerror = () => {
      rejectOnce(transaction.error || new Error("本地人脸库操作失败"));
    };

    transaction.oncomplete = () => {
      if (settled) {
        return;
      }

      settled = true;
      db.close();

      if (hasResult) {
        resolve(resultValue);
        return;
      }

      reject(new Error("本地人脸库操作未返回结果"));
    };

    action(store, resolveOnComplete, rejectOnce);
  });
};

export const useFaceDemoStorage = () => {
  const listProfiles = async () => {
    const profiles = await runStoreAction<FaceDemoProfile[]>(
      "readonly",
      (store, resolve, reject) => {
        const request = store.getAll();

        request.onerror = () => {
          reject(request.error || new Error("读取本地人脸库失败"));
        };

        request.onsuccess = () => {
          const result = Array.isArray(request.result) ? request.result : [];
          result.sort((left, right) => right.createdAt - left.createdAt);
          resolve(result);
        };
      },
    );

    return profiles;
  };

  const saveProfile = async (profile: FaceDemoProfile) => {
    await runStoreAction<void>("readwrite", (store, resolve, reject) => {
      const request = store.put(profile);

      request.onerror = () => {
        reject(request.error || new Error("保存本地人脸失败"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  const removeProfile = async (id: string) => {
    await runStoreAction<void>("readwrite", (store, resolve, reject) => {
      const request = store.delete(id);

      request.onerror = () => {
        reject(request.error || new Error("删除本地人脸失败"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  const clearProfiles = async () => {
    await runStoreAction<void>("readwrite", (store, resolve, reject) => {
      const request = store.clear();

      request.onerror = () => {
        reject(request.error || new Error("清空本地人脸库失败"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  };

  return {
    listProfiles,
    saveProfile,
    removeProfile,
    clearProfiles,
  };
};
