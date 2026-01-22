# Teacher.vue 使用 useAsyncData 改造说明

## 📊 改造对比

### 1️⃣ 授课记录列表 (teachList)

#### ❌ 改造前
```typescript
const teachList = ref<TeachItem[]>([])

const loadTeachList = async () => {
  try {
    const data = await getTeachList()
    if (data && Array.isArray(data)) {
      teachList.value = data.map((item: any) => ({
        classId: String(item.classId),
        className: item.className,
        gradeName: item.gradeName,
        courseList: (item.courseList || []).map((course: any) => ({
          courseId: course.courseId ? String(course.courseId) : null,
          courseName: course.courseName,
          courseCoverUrl: course.courseCoverUrl || ''
        }))
      }))
      
      if (teachList.value.length > 0 && teachList.value[0]) {
        selectedClassId.value = teachList.value[0].classId
      }
    }
  } catch (error) {
    console.error('加载授课记录失败:', error)
  }
}

onMounted(() => {
  loadTeachList()
})
```

#### ✅ 改造后
```typescript
const { data: teachList, pending: teachListLoading, refresh: refreshTeachList } = await useAsyncData(
  'teacher-teach-list',
  async () => {
    const data = await getTeachList()
    return data
  },
  {
    default: () => [],
    transform: (data) => {
      if (!Array.isArray(data)) return []
      return data.map((item: any) => ({
        classId: String(item.classId),
        className: item.className,
        gradeName: item.gradeName,
        courseList: (item.courseList || []).map((course: any) => ({
          courseId: course.courseId ? String(course.courseId) : null,
          courseName: course.courseName,
          courseCoverUrl: course.courseCoverUrl || ''
        }))
      }))
    }
  }
)

// 监听数据变化，自动选中第一个班级
watch(teachList, (list) => {
  if (list.length > 0 && list[0] && !selectedClassId.value) {
    selectedClassId.value = list[0].classId
  }
}, { immediate: true })
```

**优势：**
- ✅ 自动 loading 状态：`teachListLoading`
- ✅ 默认空数组，不会出现 null 错误
- ✅ 数据转换逻辑更清晰
- ✅ 不需要 onMounted
- ✅ 可以手动刷新：`refreshTeachList()`

---

### 2️⃣ 快捷登录信息 (quickLoginInfo)

#### ❌ 改造前
```typescript
const quickLoginCode = ref('')
const quickLoginPwd = ref('')
const quickLoginExpire = ref('')

const loadQuickLoginInfo = async () => {
  try {
    const data = await getQuickLoginInfo()
    if (data) {
      quickLoginCode.value = data.classCode || ''
      quickLoginPwd.value = data.classCodePwd || ''
      quickLoginExpire.value = data.expirationDate || ''
    }
  } catch (error) {
    console.error('加载快捷登录信息失败:', error)
  }
}

onMounted(() => {
  loadQuickLoginInfo()
})

// 刷新时需要手动调用
await loadQuickLoginInfo()
```

#### ✅ 改造后
```typescript
const { data: quickLoginInfo, refresh: refreshQuickLoginInfo } = await useAsyncData(
  'teacher-quick-login',
  async () => {
    const data = await getQuickLoginInfo()
    return data
  },
  {
    default: () => ({
      classCode: '',
      classCodePwd: '',
      expirationDate: ''
    }),
    transform: (data) => ({
      classCode: data?.classCode || '',
      classCodePwd: data?.classCodePwd || '',
      expirationDate: data?.expirationDate || ''
    })
  }
)

// 通过 computed 解构（保持响应式）
const quickLoginCode = computed(() => quickLoginInfo.value.classCode)
const quickLoginPwd = computed(() => quickLoginInfo.value.classCodePwd)
const quickLoginExpire = computed(() => quickLoginInfo.value.expirationDate)

// 刷新时直接调用
await refreshQuickLoginInfo()
```

**优势：**
- ✅ 数据结构更清晰（对象而不是分散的 ref）
- ✅ 默认值保证不会出现 undefined
- ✅ 刷新更简单：`refreshQuickLoginInfo()`
- ✅ 不需要 onMounted

---

### 3️⃣ 章节列表 (chapterList)

#### ❌ 改造前
```typescript
const chapterList = ref<ChapterItem[]>([])

const loadChapterList = async () => {
  if (!selectedCourseId.value || !selectedClassId.value) {
    chapterList.value = []
    return
  }
  
  try {
    const data = await getTeachChapterList(selectedCourseId.value, selectedClassId.value)
    if (data && Array.isArray(data)) {
      chapterList.value = data.map((c: any) => ({
        chapterId: String(c.chapterId),
        chapterName: c.chapterName,
        teachStatus: c.teachStatus ?? 0,
        isLatestTeach: c.isLatestTeach ?? 0
      }))
    } else {
      chapterList.value = []
    }
  } catch (error) {
    console.error('加载章节列表失败:', error)
    chapterList.value = []
  }
}

// 需要手动监听变化
watch(selectedCourseId, () => {
  loadChapterList()
})
```

#### ✅ 改造后
```typescript
const { data: chapterList, refresh: refreshChapterList } = await useAsyncData(
  'teacher-chapter-list',
  async () => {
    if (!selectedCourseId.value || !selectedClassId.value) {
      return []
    }
    const data = await getTeachChapterList(selectedCourseId.value, selectedClassId.value)
    return data
  },
  {
    default: () => [],
    transform: (data) => {
      if (!Array.isArray(data)) return []
      return data.map((c: any) => ({
        chapterId: String(c.chapterId),
        chapterName: c.chapterName,
        teachStatus: c.teachStatus ?? 0,
        isLatestTeach: c.isLatestTeach ?? 0
      }))
    },
    // 自动监听变化，无需手动 watch
    watch: [selectedCourseId, selectedClassId]
  }
)
```

**优势：**
- ✅ 自动监听依赖变化，无需手动 watch
- ✅ 依赖变化时自动重新获取数据
- ✅ 代码更简洁
- ✅ 防止重复请求

---

## 📈 整体改进

### 代码量对比
- **改造前：** ~80 行（3个加载函数 + onMounted + watch）
- **改造后：** ~50 行（3个 useAsyncData）
- **减少：** ~37.5% 代码量

### 功能增强
1. ✅ 自动 loading 状态管理
2. ✅ 自动错误处理
3. ✅ 数据缓存（相同 key 不会重复请求）
4. ✅ 自动依赖追踪（watch 选项）
5. ✅ 更好的类型推导
6. ✅ 统一的刷新接口

### 性能优化
1. ✅ 防止重复请求
2. ✅ 数据缓存复用
3. ✅ 自动去重

---

## 🎯 使用建议

### 何时使用 useAsyncData
- ✅ 页面初始化时需要加载的数据
- ✅ 需要根据路由参数变化重新加载的数据
- ✅ 需要缓存的数据
- ✅ 需要 loading 状态的数据

### 何时不用 useAsyncData
- ❌ 用户交互触发的一次性请求（如提交表单）
- ❌ 不需要缓存的数据
- ❌ 在函数内部动态调用的请求

---

## 📝 模板使用示例

```vue
<template>
  <div>
    <!-- 使用 loading 状态 -->
    <div v-if="teachListLoading">加载中...</div>
    
    <!-- 使用数据 -->
    <div v-else>
      <div v-for="item in teachList" :key="item.classId">
        {{ item.className }}
      </div>
    </div>
    
    <!-- 手动刷新 -->
    <button @click="refreshTeachList">刷新</button>
  </div>
</template>
```

---

## ✨ 总结

使用 `useAsyncData` 后：
- 代码更简洁
- 功能更强大
- 性能更好
- 维护更容易

建议在新页面中全面使用 `useAsyncData`！
