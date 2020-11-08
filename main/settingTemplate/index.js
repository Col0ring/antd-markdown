const { remote, ipcRenderer, browserWindow } = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({ name: 'antd-markdown-settings' })
const qiniuConfigArr = [
  '#savedFileLocation',
  '#accessKey',
  '#secretKey',
  '#bucketName',
]
const defaultPath = remote.app.getPath('documents')

const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {
  let savedLocation = settingsStore.get('savedFileLocation') || defaultPath
  if (savedLocation) {
    $('#savedFileLocation').value = savedLocation
  }
  // get the saved config data and fill in the inputs
  qiniuConfigArr.forEach((selector) => {
    const savedValue = settingsStore.get(selector.substr(1))
    if (savedValue) {
      $(selector).value = savedValue
    }
  })
  $('#select-new-location').addEventListener('click', async () => {
    const res = await remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的存储路径',
    })
    if (res.filePaths.length > 0) {
      $('#savedFileLocation').value = res.filePaths[0]
    }
  })
  $('#settings-form').addEventListener('submit', (e) => {
    e.preventDefault()
    qiniuConfigArr.forEach((selector) => {
      if ($(selector)) {
        let { id, value } = $(selector)
        if (id === 'savedFileLocation') {
          const path = value ? value : defaultPath
          settingsStore.set(id, path)
          remote.ipcMain.emit('savedFileLocation', path)
        } else {
          settingsStore.set(id, value ? value : '')
        }
      }
    })
    // sent a event back to main process to enable menu items if qiniu is configured
    ipcRenderer.send('configure-is-saved')
    remote.getCurrentWindow().close()
  })
  $('.nav-tabs').addEventListener('click', (e) => {
    e.preventDefault()
    $('.nav-link').forEach((element) => {
      element.classList.remove('active')
    })
    e.target.classList.add('active')
    $('.config-area').forEach((element) => {
      element.style.display = 'none'
    })
    $(e.target.dataset.tab).style.display = 'block'
  })
})
