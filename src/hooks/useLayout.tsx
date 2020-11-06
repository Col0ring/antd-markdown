import React, { createContext, useCallback, useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'
import { Modal } from 'antd'
import { v4 as uuid } from 'uuid'
import pathModule from 'path'
import { flattenFiles } from '@/utils/help'
import { saveFiles2Store, fileStore } from '@/utils/store'
import { ID, LayoutProps, LayoutProviderProps, File } from '@/interfaces/Data'
const { remote } = window.require('electron')
const path = window.require('path') as typeof pathModule

const files = fileStore.get('files') as GLobalObject<File>

const initialState: LayoutProps = {
  activeFileId: '',
  openedFileIds: [],
  unsavedFileIds: [],
  files: files,
  searchFiles: files,
}
const LayoutContext = createContext<LayoutProviderProps>({
  layout: {
    ...initialState,
  },
  throwError: () => {},
  setLayout: () => {},
  createNewFile: () => {},
  importFiles: async () => false,
  closeTab: () => {},
})

export const LayoutProvider: React.FC = ({ children }) => {
  const [layout, setLayout] = useImmer<LayoutProps>({
    ...initialState,
  })
  const throwError = useCallback(
    (message: string, cb?: (close: () => void) => any) => {
      Modal.error({
        centered: true,
        okText: '确定',
        content: message,
        title: '出错了',
        onOk: cb,
      })
    },
    []
  )
  const createNewFile = useCallback(() => {
    const newId = uuid()
    const newFile = {
      id: newId,
      isNew: true,
      name: '',
      content: '',
      originContent: '',
      path: '',
    }
    setLayout((draft) => {
      draft.files = { ...draft.files, [newId]: newFile }
    })
  }, [setLayout])
  const importFiles = useCallback(async () => {
    try {
      const res = await remote.dialog.showOpenDialog({
        title: '请选择要导入的 Markdown 文件',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Markdown Files', extensions: ['md'] }],
      })
      if (res.filePaths.length > 0) {
        const filterPaths = res.filePaths.filter((pathname) => {
          return !Object.keys(layout.files).find(
            (filePath) => layout.files[filePath].path === pathname
          )
        })
        const importFilesArr = filterPaths.map((pathname) => ({
          id: uuid(),
          name: path.basename(pathname, path.extname(pathname)),
          path: pathname,
        }))
        const newFiles = { ...files, ...flattenFiles(importFilesArr) }
        setLayout((draft) => {
          draft.files = newFiles
        })
        if (importFilesArr.length === 1) {
          setLayout((draft) => {
            draft.activeFileId = importFilesArr[0].id
          })
        }
      }
      return true
    } catch (error) {
      throwError('导入文件失败，请确保导入的 md 格式文件')
      return false
    }
  }, [layout.files, setLayout, throwError])

  const closeTab = useCallback(
    (id: ID) => {
      const { openedFileIds, activeFileId } = layout
      const closeIndex = openedFileIds.findIndex((fileId) => fileId === id)
      if (closeIndex > -1) {
        if (activeFileId === id) {
          let newActiveId: ID = ''
          if (closeIndex !== 0) {
            newActiveId = openedFileIds[closeIndex - 1]
          } else {
            newActiveId =
              openedFileIds.length > 1 ? openedFileIds[closeIndex + 1] : ''
          }
          setLayout((draft) => {
            draft.activeFileId = newActiveId
          })
        }

        const newOpenedFileIds = [...openedFileIds]
        newOpenedFileIds.splice(closeIndex, 1)
        setLayout((draft) => {
          draft.openedFileIds = newOpenedFileIds
        })
      }
    },
    [layout, setLayout]
  )

  useEffect(() => {
    setLayout((draft) => {
      draft.searchFiles = draft.files
      draft.openedFileIds = draft.openedFileIds.filter((id) => draft.files[id])
      draft.unsavedFileIds = draft.unsavedFileIds.filter(
        (id) => draft.files[id]
      )
    })
    saveFiles2Store(layout.files)
  }, [layout.files, setLayout])
  useEffect(() => {
    if (
      !layout.openedFileIds.includes(layout.activeFileId) &&
      layout.activeFileId
    ) {
      setLayout((draft) => {
        draft.openedFileIds.push(layout.activeFileId)
      })
    }
  }, [layout.activeFileId, layout.openedFileIds, setLayout])
  return (
    <LayoutContext.Provider
      value={{
        layout,
        setLayout,
        throwError,
        createNewFile,
        importFiles,
        closeTab,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

const useLayout = () => {
  return useContext(LayoutContext)
}

export default useLayout
