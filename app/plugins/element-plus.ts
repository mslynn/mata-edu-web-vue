import { ElSelect, ElOption, ElDatePicker, ElTimePicker, ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ElSelect', ElSelect)
  nuxtApp.vueApp.component('ElOption', ElOption)
  nuxtApp.vueApp.component('ElDatePicker', ElDatePicker)
  nuxtApp.vueApp.component('ElTimePicker', ElTimePicker)
  nuxtApp.vueApp.component('ElConfigProvider', ElConfigProvider)
  
  // 设置中文语言
  nuxtApp.vueApp.provide('locale', zhCn)
})

