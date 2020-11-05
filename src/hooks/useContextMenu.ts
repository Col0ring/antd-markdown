import { useEffect, useRef } from 'react'
import { MenuItemConstructorOptions } from 'electron'
const { remote } = window.require('electron')
const { MenuItem, Menu } = remote

const useContextMenu = (
  menuArr: MenuItemConstructorOptions[],
  {
    targetSelector,
    target,
  }: {
    targetSelector?: string
    target: HTMLElement
  }
) => {
  const currentClickElement = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const menu = new Menu()
    menuArr.forEach((item) => {
      menu.append(new MenuItem(item))
    })
    const handleContextMenu = (e: MouseEvent) => {
      // 只有 target 包裹的选择器内才会显示
      const eventTarget = e.target as HTMLElement
      if (
        (target && target.contains(eventTarget)) ||
        (targetSelector &&
          document.querySelector(targetSelector)?.contains(eventTarget))
      ) {
        currentClickElement.current = eventTarget
        menu.popup({ window: remote.getCurrentWindow() })
      }
    }
    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [menuArr, targetSelector, target])
  return currentClickElement
}

export default useContextMenu
