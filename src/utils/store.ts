import { obj2Arr } from '@/utils/help'
import Store from 'electron-store'
import { File } from '@/interfaces/Data'
export const fileStore = new Store({ name: 'antd-markdown-data' })
export const settingsStore = new Store({ name: 'antd-markdown-settings' })
export const saveFiles2Store = (files: GLobalObject<File>) => {
  const filesStoreObj = obj2Arr(files).reduce<
    GLobalObject<Omit<File, 'content' | 'isNew'>>
  >((res, file) => {
    const { id, path, name, createdAt } = file
    res[id] = {
      id,
      path,
      name,
      createdAt,
    }
    return res
  }, {})
  fileStore.set('files', filesStoreObj)
}
