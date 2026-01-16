// 教师成长中心状态管理
const activeMenu = ref('training')

export const useGrowthState = () => {
  const setActiveMenu = (menu: string) => {
    activeMenu.value = menu
  }

  const getActiveMenu = () => {
    return activeMenu.value
  }

  return {
    activeMenu,
    setActiveMenu,
    getActiveMenu
  }
}
