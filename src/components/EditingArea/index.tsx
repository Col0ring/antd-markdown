import React, { useCallback } from 'react'
import Editor, { EditorProps } from './Editor'
import FileTabs, { FileTabsProps } from '../ EditingArea/FileTabs'
import EmptyData, { EmptyDataProps } from './EmptyData'
import useLayout from '@/hooks/useLayout'

const EditingArea: React.FC = () => {
  const { layout } = useLayout()
  const { files, openedFileIds, activeFileId, unsavedFileIds } = layout
  const openedFiles = openedFileIds.map((id) => files[id])
  const activeFile = openedFiles.find((file) => file.id === activeFileId)
  const onCloseTab: FileTabsProps['onCloseTab'] = useCallback(() => {}, [])
  const onTabClick: FileTabsProps['onTabClick'] = useCallback(() => {}, [])
  const onChange: EditorProps['onChange'] = useCallback(() => {}, [])
  const onCreateFile: EmptyDataProps['onCreateFile'] = useCallback(() => {}, [])
  // 关于监听 ctrl + s ,以前是使用编辑器自带的events属性绑定事件，并且使用 useEffect 进行更新，后改为使用electron提供的元素菜单
  return (
    <>
      {activeFile ? (
        <>
          <FileTabs
            files={openedFiles}
            activeId={activeFileId}
            unsavedIds={unsavedFileIds}
            onCloseTab={onCloseTab}
            onTabClick={onTabClick}
          />
          <Editor activeFile={activeFile} onChange={onChange} />
        </>
      ) : (
        <EmptyData onCreateFile={onCreateFile} />
      )}
    </>
  )
}

export default EditingArea
