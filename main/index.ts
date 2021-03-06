import {
  app,
  dialog,
  BrowserWindowConstructorOptions,
  ipcMain,
  BrowserWindow,
} from 'electron'
import Store from 'electron-store'
import path from 'path'
import fs from 'fs'
import isDev from 'electron-is-dev'
import AppWindow from './AppWindow'
import buildAppMenu from './appMenu'
import QiniuManager from './QIniuManager'
import { File } from '@/interfaces/Data'
let mainWin: AppWindow | null = null
let settingWin: AppWindow | null = null
const defaultPath = app.getPath('documents')
const settingsStore = new Store({ name: 'antd-markdown-settings' })
const fileStore = new Store({ name: 'antd-markdown-data' })
const createManager = () => {
  const accessKey = (settingsStore.get('accessKey') as string) || ''
  const secretKey = (settingsStore.get('secretKey') as string) || ''
  const bucketName = (settingsStore.get('bucketName') as string) || ''
  return new QiniuManager(accessKey, secretKey, bucketName)
}

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
      './settingTemplate/index.html'
    )}`
    settingWin = new AppWindow(settingsWindowConfig, settingsFileLocation)
    settingWin.removeMenu()
    settingWin.on('closed', () => {
      settingWin = null
    })
  })
}

function createQiniuEvents(win: BrowserWindow) {
  ipcMain.on('upload-file', (event, data: { key: string; path: string }) => {
    if (!fs.existsSync(data.path)) {
      return dialog.showErrorBox(
        '同步失败',
        '有文件已被删除或不存在,请重启应用重试'
      )
    }
    const manager = createManager()
    manager
      .uploadFile(data.key, data.path)
      .then(() => {
        win.webContents.send('active-file-uploaded')
      })
      .catch(() => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
      })
  })
  ipcMain.on('download-file', (event, data) => {
    const manager = createManager()
    const filesObj = (fileStore.get('files') as GLobalObject<File>) || {}
    const { key, path, id } = data
    manager.getStat(data.key).then(
      (res) => {
        // putTime 是 100 纳秒为单位的
        const serverUpdatedTime = Math.round(res.putTime / 10000)
        const localUpdatedTime = filesObj[id].updatedAt || 0
        // 如果没有本地时间，就是没有上传过
        if (serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
          const res = dialog.showMessageBoxSync({
            type: 'question',
            title: '提示',
            message: '远端有新的内容，是否要覆盖掉本地文件？',
            buttons: ['是', '否'],
          })
          if (res === 0) {
            manager.downloadFile(key, path).then(() => {
              win.webContents.send('file-downloaded', {
                status: 'download-success',
                id,
              })
            })
          } else {
            win.webContents.send('file-downloaded', {
              status: 'no-download',
              id,
            })
          }
        } else {
          win.webContents.send('file-downloaded', {
            status: 'no-new-file',
            id,
          })
        }
      },
      (error: GLobalObject) => {
        if (error.statusCode === 612) {
          win.webContents.send('file-downloaded', {
            status: 'no-file',
            id,
          })
        }
      }
    )
  })
  ipcMain.on('delete-file', (e, { key }: { key: string }) => {
    win.webContents.send('loading-status', true)

    const manager = createManager()
    manager
      .deleteFile(key)
      .then(() => {
        win.webContents.send('file-deleted')
      })
      .catch(() => {
        dialog.showErrorBox('远端删除失败', '请检查七牛云参数是否正确')
      })
      .finally(() => {
        win.webContents.send('loading-status', false)
      })
  })

  ipcMain.on(
    'rename-file',
    (e, { key, id, newName }: { id: string; newName: string; key: string }) => {
      win.webContents.send('loading-status', true)

      const manager = createManager()
      manager
        .renameFile(key, newName)
        .then(() => {
          win.webContents.send('file-renamed', id)
        })
        .catch(() => {
          dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        })
        .finally(() => {
          win.webContents.send('loading-status', false)
        })
    }
  )

  ipcMain.on('download-all-from-qiniu', () => {
    win.webContents.send('loading-status', true)
    const manager = createManager()
    const fileObj = (fileStore.get('files') as GLobalObject<File>) || {}
    const localFiles = Object.keys(fileObj)
      .map((key) => fileObj[key])
      .reduce<GLobalObject<File>>((pre, next) => {
        const name = next.name
        pre[name] = next
        return pre
      }, {})
    const savedLocation =
      (settingsStore.get('savedFileLocation') as string) || defaultPath
    manager
      .getFileList()
      .then((res: any) => {
        const remoteFiles = res.items
        const filterRemoteFiles = remoteFiles.filter((item: any) => {
          const strArr = item.key.split('.')
          const fileName = strArr.slice(0, strArr.length - 1).join('.')
          if (localFiles[fileName]) {
            const localFile = localFiles[fileName]
            // putTime 是 100 纳秒为单位的
            const serverUpdatedTime = Math.round(item.putTime / 10000)
            const localUpdatedTime = localFile.updatedAt || 0
            return serverUpdatedTime > localUpdatedTime
          }
          return true
        })

        const downloadPromiseArr = filterRemoteFiles.map((item: any) => {
          const key = item.key
          return manager.downloadFile(key, savedLocation + '/' + key)
        })
        Promise.all(downloadPromiseArr)
          .then((res) => {
            if ((res.length as number) === 0) {
              dialog.showMessageBoxSync({
                type: 'info',
                title: '所有文件已经是最新',
                message: '所有文件已经是最新',
              })
              return
            }
            // show uploaded message
            dialog.showMessageBoxSync({
              type: 'info',
              title: `成功下载了${res.length}个文件`,
              message: `成功下载了${res.length}个文件`,
            })
            win.webContents.send(
              'files-downloaded',
              filterRemoteFiles,
              savedLocation
            )
          })
          .catch((err) => {
            dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
          })
          .finally(() => {
            win.webContents.send('loading-status', false)
          })
      })
      .catch((err) => {
        dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
      })
      .finally(() => {
        win.webContents.send('loading-status', false)
      })
  })

  ipcMain.on('upload-all-to-qiniu', () => {
    win.webContents.send('loading-status', true)
    const manager = createManager()
    const filesObj = (fileStore.get('files') as GLobalObject<File>) || {}
    const uploadPromiseArr = Object.keys(filesObj).map((key) => {
      const file = filesObj[key]

      return manager.uploadFile(`${file.name}.md`, file.path)
    })
    Promise.all(uploadPromiseArr)
      .then((result) => {
        // show uploaded message
        dialog.showMessageBoxSync({
          type: 'info',
          title: `成功上传了${result.length}个文件`,
          message: `成功上传了${result.length}个文件`,
        })
        win.webContents.send('files-uploaded')
      })
      .catch((err) => {
        if (err === 'no file') {
          dialog.showErrorBox(
            '同步失败',
            '有文件已被删除或不存在,请重启应用重试'
          )
        } else {
          dialog.showErrorBox('同步失败', '请检查七牛云参数是否正确')
        }
      })
      .finally(() => {
        win.webContents.send('loading-status', false)
      })
  })
}

function createMainWindow() {
  const mainWindowConfig: BrowserWindowConstructorOptions = {
    width: 1024,
    height: 700,
  }
  const urlLocation = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, './index.html')}`
  // 创建浏览器窗口。
  mainWin = new AppWindow(mainWindowConfig, urlLocation)
  buildAppMenu()
  // 当 window 被关闭，触发该事件
  mainWin.on('closed', () => {
    mainWin = null
  })
  createQiniuEvents(mainWin)
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
