import React, { useCallback } from 'react'
import { Spin } from 'antd'
import Editor, { EditorProps } from './Editor'
import FileTabs, { FileTabsProps } from './FileTabs'
import EmptyData, { EmptyDataProps } from './EmptyData'
import useLayout from '@/hooks/useLayout'
import fileHelper from '@/utils/fileHelper'
import useIpcRenderer from '@/hooks/useIpcRenderer'
const EditingArea: React.FC = () => {
  const { layout, setLayout, createNewFile, closeTab } = useLayout()
  const {
    files,
    openedFileIds,
    activeFileId,
    fileLoading,
    editingFileId,
    unsavedFileIds,
  } = layout
  const openedFiles = openedFileIds.map((id) => files[id])
  const editingFile = openedFiles.find(
    (file) => file && file.id === editingFileId
  )
  const onCloseTab: FileTabsProps['onCloseTab'] = useCallback(
    (id) => {
      closeTab(id)
    },
    [closeTab]
  )

  const onTabClick: FileTabsProps['onTabClick'] = useCallback(
    (id) => {
      setLayout((draft) => {
        draft.activeFileId = id
      })
    },
    [setLayout]
  )
  const onChange: EditorProps['onChange'] = useCallback(
    (id, value) => {
      if (value !== files[id].originContent) {
        const newFile = { ...files[id], content: value }
        setLayout((draft) => {
          draft.files = { ...draft.files, [id]: newFile }
          if (!unsavedFileIds.includes(id)) {
            draft.unsavedFileIds = [...draft.unsavedFileIds, id]
          }
        })
      } else {
        setLayout((draft) => {
          if (unsavedFileIds.includes(id)) {
            draft.unsavedFileIds = draft.unsavedFileIds.filter(
              (unsavedFileId) => unsavedFileId !== id
            )
          }
        })
      }
    },
    [files, setLayout, unsavedFileIds]
  )
  const onCreateFile: EmptyDataProps['onCreateFile'] = useCallback(() => {
    createNewFile()
  }, [createNewFile])

  const onEditorSave = useCallback(async () => {
    if (!unsavedFileIds.includes(activeFileId)) {
      return
    }
    const activeFile = files[activeFileId]
    const res = await fileHelper.writeFile(
      activeFile.path,
      activeFile.content || ''
    )
    if (res) {
      setLayout((draft) => {
        draft.files[activeFileId].originContent =
          draft.files[activeFileId].content
        draft.unsavedFileIds = draft.unsavedFileIds.filter(
          (unsavedFileId) => unsavedFileId !== activeFileId
        )
      })
    }
  }, [activeFileId, files, setLayout, unsavedFileIds])

  useIpcRenderer({
    'save-edit-file': onEditorSave,
  })

  // 关于监听 ctrl + s ,以前是使用编辑器自带的events属性绑定事件，并且使用 useEffect 进行更新，后改为使用electron提供的元素菜单
  return (
    <Spin spinning={fileLoading}>
      {editingFile ? (
        <>
          <FileTabs
            files={openedFiles}
            activeId={activeFileId}
            unsavedIds={unsavedFileIds}
            onCloseTab={onCloseTab}
            onTabClick={onTabClick}
          />
          <Editor editingFile={editingFile} onChange={onChange} />
        </>
      ) : (
        <EmptyData onCreateFile={onCreateFile} />
      )}
    </Spin>
  )
}

export default EditingArea
