/**
 * UI 组件库导出
 * 
 * 在 Nuxt 中，components/ui 目录下的组件会自动注册
 * 可以直接在模板中使用：<MButton>、<MInput> 等
 * 
 * 如果需要手动导入：
 * import { ElMessage } from '~/components/ui'
 */

// 函数式组件需要手动导入
export { ElMessage } from 'element-plus'

// Vue 组件（Nuxt 自动导入，无需手动导出）
// MButton - 按钮组件
// MInput - 输入框组件
// MTable - 表格组件
// MTabs - 标签页组件
// MTree - 树形组件
// MModal - 弹窗组件
// MSelect - 下拉选择组件
// MPagination - 分页组件

