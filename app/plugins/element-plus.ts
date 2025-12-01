import { ElSelect, ElOption } from 'element-plus'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ElSelect', ElSelect)
  nuxtApp.vueApp.component('ElOption', ElOption)
})

