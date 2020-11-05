import { obj2Arr } from '@/utils/help'
import ElectronStore from 'electron-store'
import { File } from '@/interfaces/Data'
const Store = window.require('electron-store') as typeof ElectronStore
export const fileStore = new Store({ name: 'antd-markdown-data' })
export const settingsStore = new Store({ name: 'antd-markdown-settings' })
export const saveFiles2Store = (files: GLobalObject<File>) => {
  const filesArr = obj2Arr(files)
  if (filesArr.find((file) => file.isNew)) {
    return
  }
  const filesStoreObj = filesArr.reduce<GLobalObject<File>>((res, file) => {
    const { id, path, name } = file
    res[id] = {
      id,
      path,
      name,
    }
    return res
  }, {})

  fileStore.set('files', filesStoreObj)
}
