/**
 * 防止浏览器返回的 composable
 * 使用双重防护：路由守卫 + popstate
 * @returns handleLogout - 退出登录时调用，允许页面离开
 */
export const usePreventBack = () => {
  const allowLeave = ref(false)

  // 防护1：路由守卫阻止 Nuxt 路由跳转
  onBeforeRouteLeave(() => {
    if (!allowLeave.value) {
      return false
    }
  })

  // 防护2：popstate 强制前进，不让返回
  const preventBack = () => {
    if (!allowLeave.value) {
      history.forward()
    }
  }

  onMounted(() => {
    // push 3个状态，确保有足够的前进空间
    window.history.pushState(null, '', window.location.href)
    window.history.pushState(null, '', window.location.href)
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', preventBack)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', preventBack)
  })

  // 允许离开页面（退出登录时调用）
  const allowNavigation = () => {
    allowLeave.value = true
    window.removeEventListener('popstate', preventBack)
  }

  return {
    allowNavigation
  }
}

