/**
 * 全局加载状态管理
 */
export const useLoading = () => {
  const loading = useState('global-loading', () => false)

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const showLoading = () => {
    loading.value = true
  }

  const hideLoading = () => {
    loading.value = false
  }

  return {
    loading: computed(() => loading.value),
    setLoading,
    showLoading,
    hideLoading
  }
}

