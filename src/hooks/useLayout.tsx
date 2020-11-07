import React, { createContext, useCallback, useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'
import { Modal, Spin } from 'antd'
import { v4 as uuid } from 'uuid'
import pathModule from 'path'
import fsModule from 'fs'
import { flattenFiles, obj2Arr } from '@/utils/help'
import { saveFiles2Store, fileStore } from '@/utils/store'
import { ID, LayoutProps, LayoutProviderProps, File } from '@/interfaces/Data'
import fileHelper from '@/utils/fileHelper'
import useIpcRenderer from '@/hooks/useIpcRenderer'
const { remote } = window.require('electron')
const path = window.require('path') as typeof pathModule
const fs = window.require('fs') as typeof fsModule
const originFiles = flattenFiles(
  obj2Arr((fileStore.get('files') as GLobalObject<File>) || {}).filter((file) =>
    fs.existsSync(file.path)
  )
)

const initialState: LayoutProps = {
  searchValue: '',
  activeFileId: '',
  editingFileId: '',
  fileLoading: false,
  globalLoading: false,
  openedFileIds: [],
  unsavedFileIds: [],
  files: originFiles,
  searchFiles: originFiles,
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
  deleteFile: async () => false,
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
        const newFiles = { ...layout.files, ...flattenFiles(importFilesArr) }
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

  const deleteFile = useCallback(
    async (id: ID, isTrue = true) => {
      const { [id]: value, ...otherFiles } = layout.files
      if (layout.files[id].isNew) {
        setLayout((draft) => {
          draft.files = otherFiles
        })
      } else {
        return new Promise<boolean>((resolve) => {
          if (isTrue) {
            Modal.confirm({
              title: '提示',
              centered: true,
              content: '确认删除文件？',
              okText: '确定',
              cancelText: '取消',
              async onOk() {
                const res = await fileHelper.deleteFile(layout.files[id].path)
                if (!res) {
                  throwError('删除文件失败')
                  resolve(false)
                }
                closeTab(id)
                setLayout((draft) => {
                  draft.files = otherFiles
                })
                resolve(true)
              },
            })
          } else {
            closeTab(id)
            setLayout((draft) => {
              draft.files = otherFiles
            })
          }
        })
      }
      return true
    },
    [closeTab, layout.files, setLayout, throwError]
  )

  const loadFile = useCallback(
    async (id: ID) => {
      const loadFile = layout.files[id]
      if (!loadFile) {
        return false
      }

      if (!loadFile.isLoaded) {
        setLayout((draft) => {
          draft.fileLoading = true
        })
        const res = await fileHelper.readFile(loadFile.path)
        setLayout((draft) => {
          draft.fileLoading = false
        })
        if (res) {
          const value = typeof res === 'boolean' ? '' : res
          const newFile = {
            ...layout.files[id],
            content: value,
            originContent: value,
            isLoaded: true,
          }
          setLayout((draft) => {
            draft.files[id] = newFile
          })
        } else {
          throwError('打开文件失败')
          await deleteFile(id)
          return false
        }
      }
      return true
    },
    [deleteFile, layout.files, setLayout, throwError]
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

  useEffect(() => {
    if (layout.activeFileId) {
      loadFile(layout.activeFileId).then((res) => {
        if (res) {
          setLayout((draft) => {
            draft.editingFileId = layout.activeFileId
          })
        }
      })
    }
  }, [layout.activeFileId, loadFile, setLayout])

  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
  })
  return (
    <LayoutContext.Provider
      value={{
        layout,
        setLayout,
        throwError,
        createNewFile,
        importFiles,
        closeTab,
        deleteFile,
      }}
    >
      <Spin spinning={layout.globalLoading} tip="正在加载中..">
        {children}
      </Spin>
    </LayoutContext.Provider>
  )
}

const useLayout = () => {
  return useContext(LayoutContext)
}

export default useLayout
