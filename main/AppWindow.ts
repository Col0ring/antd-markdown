import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

const basicConfig: BrowserWindowConstructorOptions = {
  width: 800,
  height: 600,
  webPreferences: {
    // 加上这个就可以在渲染进程使用 window.require 引入 electron 模块
    nodeIntegration: true,
    enableRemoteModule: true,
  },
  show: false,
  backgroundColor: '#fff',
}

class AppWindow extends BrowserWindow {
  urlLocation: string
  constructor(config: BrowserWindowConstructorOptions, urlLocation: string) {
    const finalConfig: BrowserWindowConstructorOptions = {
      ...basicConfig,
      ...config,
    }
    super(finalConfig)
    this.urlLocation = urlLocation
    this.initWindow().catch(console.error)
  }
  async initWindow() {
    // 需要先箭头再 loadURL
    this.once('ready-to-show', () => {
      this.show()
    })
    await this.loadURL(this.urlLocation)
  }
}

export default AppWindow
