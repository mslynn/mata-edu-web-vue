import { createI18n } from 'vue-i18n'
import zh from '../../i18n/locales/zh.json'
import en from '../../i18n/locales/en.json'

const messages = { zh, en }
const DEFAULT_LOCALE = 'zh'
const SUPPORTED_LOCALES = ['zh', 'en']

export default defineNuxtPlugin((nuxtApp) => {
  const savedLocale = import.meta.client ? localStorage.getItem('locale') : null
  const initialLocale =
    savedLocale && SUPPORTED_LOCALES.includes(savedLocale) ? savedLocale : DEFAULT_LOCALE

  const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: initialLocale,
    fallbackLocale: DEFAULT_LOCALE,
    messages
  })

  nuxtApp.vueApp.use(i18n)
  
  return {
    provide: {
      i18n: i18n.global
    }
  }
})
