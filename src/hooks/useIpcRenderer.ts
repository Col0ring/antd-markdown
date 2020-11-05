import { useEffect } from 'react'
import { IpcRendererEvent } from 'electron'
const { ipcRenderer } = window.require('electron')

type Listener = (event: IpcRendererEvent, ...args: any[]) => void

const useIpcRenderer = (keyCallbackMap: GLobalObject<Listener>) => {
  useEffect(() => {
    const keys = Object.keys(keyCallbackMap)
    keys.forEach((key) => {
      ipcRenderer.on(key, keyCallbackMap[key])
    })
    return () => {
      keys.forEach((key) => {
        ipcRenderer.removeListener(key, keyCallbackMap[key])
      })
    }
  })
}

export default useIpcRenderer
