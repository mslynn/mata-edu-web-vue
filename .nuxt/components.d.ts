
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const AgreementCheckbox: typeof import("../app/components/AgreementCheckbox.vue")['default']
export const CampusLoginForm: typeof import("../app/components/CampusLoginForm.vue")['default']
export const ClassCodeLoginForm: typeof import("../app/components/ClassCodeLoginForm.vue")['default']
export const CountryCodeSelector: typeof import("../app/components/CountryCodeSelector.vue")['default']
export const ForgotPasswordForm: typeof import("../app/components/ForgotPasswordForm.vue")['default']
export const LoginTabs: typeof import("../app/components/LoginTabs.vue")['default']
export const Modal: typeof import("../app/components/Modal.vue")['default']
export const OtherLoginOptions: typeof import("../app/components/OtherLoginOptions.vue")['default']
export const PhoneLoginForm: typeof import("../app/components/PhoneLoginForm.vue")['default']
export const TrialAccountForm: typeof import("../app/components/TrialAccountForm.vue")['default']
export const MButton: typeof import("../app/components/ui/MButton.vue")['default']
export const MInput: typeof import("../app/components/ui/MInput.vue")['default']
export const MMessage: typeof import("../app/components/ui/MMessage")['default']
export const MModal: typeof import("../app/components/ui/MModal.vue")['default']
export const MPagination: typeof import("../app/components/ui/MPagination.vue")['default']
export const MSelect: typeof import("../app/components/ui/MSelect.vue")['default']
export const MTable: typeof import("../app/components/ui/MTable.vue")['default']
export const MTabs: typeof import("../app/components/ui/MTabs.vue")['default']
export const MTree: typeof import("../app/components/ui/MTree.vue")['default']
export const Ui: typeof import("../app/components/ui/index")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAgreementCheckbox: LazyComponent<typeof import("../app/components/AgreementCheckbox.vue")['default']>
export const LazyCampusLoginForm: LazyComponent<typeof import("../app/components/CampusLoginForm.vue")['default']>
export const LazyClassCodeLoginForm: LazyComponent<typeof import("../app/components/ClassCodeLoginForm.vue")['default']>
export const LazyCountryCodeSelector: LazyComponent<typeof import("../app/components/CountryCodeSelector.vue")['default']>
export const LazyForgotPasswordForm: LazyComponent<typeof import("../app/components/ForgotPasswordForm.vue")['default']>
export const LazyLoginTabs: LazyComponent<typeof import("../app/components/LoginTabs.vue")['default']>
export const LazyModal: LazyComponent<typeof import("../app/components/Modal.vue")['default']>
export const LazyOtherLoginOptions: LazyComponent<typeof import("../app/components/OtherLoginOptions.vue")['default']>
export const LazyPhoneLoginForm: LazyComponent<typeof import("../app/components/PhoneLoginForm.vue")['default']>
export const LazyTrialAccountForm: LazyComponent<typeof import("../app/components/TrialAccountForm.vue")['default']>
export const LazyMButton: LazyComponent<typeof import("../app/components/ui/MButton.vue")['default']>
export const LazyMInput: LazyComponent<typeof import("../app/components/ui/MInput.vue")['default']>
export const LazyMMessage: LazyComponent<typeof import("../app/components/ui/MMessage")['default']>
export const LazyMModal: LazyComponent<typeof import("../app/components/ui/MModal.vue")['default']>
export const LazyMPagination: LazyComponent<typeof import("../app/components/ui/MPagination.vue")['default']>
export const LazyMSelect: LazyComponent<typeof import("../app/components/ui/MSelect.vue")['default']>
export const LazyMTable: LazyComponent<typeof import("../app/components/ui/MTable.vue")['default']>
export const LazyMTabs: LazyComponent<typeof import("../app/components/ui/MTabs.vue")['default']>
export const LazyMTree: LazyComponent<typeof import("../app/components/ui/MTree.vue")['default']>
export const LazyUi: LazyComponent<typeof import("../app/components/ui/index")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
