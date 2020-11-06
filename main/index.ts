import { app, BrowserWindowConstructorOptions, ipcMain, Menu } from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'
import AppWindow from './AppWindow'
import menuTemplate from './menuTemplate'

let mainWin: AppWindow | null = null
let settingWin: AppWindow | null = null

function createSettingWindow(
  parentWin: BrowserWindowConstructorOptions['parent']
) {
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig: BrowserWindowConstructorOptions = {
      width: 500,
      height: 400,
      parent: parentWin,
    }
    const settingsFileLocation = `file://${path.join(
      __dirname,
      './settings/index.html'
    )}`
    settingWin = new AppWindow(settingsWindowConfig, settingsFileLocation)
    settingWin.removeMenu()
    settingWin.on('closed', () => {
      settingWin = null
    })
  })
}

function createMainWindow() {
  const mainWindowConfig: BrowserWindowConstructorOptions = {
    width: 1024,
    height: 680,
  }
  const urlLocation = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, './index.html')}`
  // 创建浏览器窗口。
  mainWin = new AppWindow(mainWindowConfig, urlLocation)

  // 当 window 被关闭，触发该事件
  mainWin.on('closed', () => {
    mainWin = null
  })
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
  createSettingWindow(mainWin)
}

app.on('ready', createMainWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', async () => {
  if (mainWin === null) {
    createMainWindow()
  }
})
