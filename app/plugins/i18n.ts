import { createI18n } from 'vue-i18n'
import zh from '../../i18n/locales/zh.json'
import en from '../../i18n/locales/en.json'

const messages = { zh, en }

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: 'zh',
    fallbackLocale: 'zh',
    messages
  })

  nuxtApp.vueApp.use(i18n)
  
  return {
    provide: {
      i18n: i18n.global
    }
  }
})
