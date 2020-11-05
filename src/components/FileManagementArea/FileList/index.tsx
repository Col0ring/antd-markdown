import React, { useState } from 'react'
import pathModule from 'path'
import { List } from 'antd'
import { ID } from '@/interfaces/Data'
import { settingsStore } from '@/utils/store'
import styles from './FileList.module.less'
import FileItem, { FileItemProps } from '../FileItem'
import useLayout from '@/hooks/useLayout'
import fileHelper from '@/utils/fileHelper'
import { obj2Arr } from '@/utils/help'
const path = window.require('path') as typeof pathModule
const { remote } = window.require('electron')
const savedLocation =
  (settingsStore.get('savedFileLocation') as string) ||
  remote.app.getPath('documents')
export interface FileListProps {}

const FileList: React.FC<FileListProps> = () => {
  const [editingId, setEditingId] = useState<ID>('')
  const { layout, setLayout, throwError } = useLayout()
  const { files, searchFiles } = layout
  const fileArr = obj2Arr(searchFiles)

  const onFileClick: FileItemProps['onClick'] = (id) => {
    // onCloseTab(id)
  }

  const onFileDelete = async (id: ID) => {
    const { [id]: value, ...otherFiles } = files
    if (files[id].isNew) {
      setLayout((draft) => {
        draft.files = otherFiles
      })
    } else {
      const res = await fileHelper.deleteFile(files[id].path)
      if (res) {
        // onCloseTab(id)
      } else {
        throwError('删除文件失败')
      }
      setLayout((draft) => {
        draft.files = otherFiles
      })
    }
  }

  const onEditingStart: FileItemProps['onEditingStart'] = (id: ID) => {
    setEditingId(id)
  }

  const onEditingChange: FileItemProps['onEditingChange'] = async (id, val) => {
    const file = searchFiles[id]
    await onSaveEdit(id, val, !!file.isNew)
    setEditingId('')
  }
  const onSaveEdit = async (id: ID, name: string, isNew: boolean) => {
    if (!name.trim() || files[id].name === name) {
      if (isNew) {
        await onFileDelete(id)
      }
      return
    }
    const newPath = isNew
      ? path.join(savedLocation, `${name}.md`)
      : path.join(path.dirname(files[id].path), `${name}.md`)
    const modifiedFile = { ...files[id], name, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    let res: boolean = false
    if (isNew) {
      res = await fileHelper.writeFile(newPath, files[id].content || '')
    } else {
      const oldPath = files[id].path
      res = await fileHelper.renameFile(oldPath, newPath)
    }
    if (res) {
      setLayout((draft) => {
        draft.files = newFiles
        draft.activeFileId = id
      })
    } else {
      throwError(`${isNew ? '新增' : '修改'}文件失败`)
      await onFileDelete(id)
    }
  }

  return (
    <List
      className={styles.list}
      dataSource={fileArr}
      renderItem={(item) => {
        return (
          <List.Item
            className={styles.fileListItemWrap}
            data-name={item.name}
            data-id={item.id}
          >
            <FileItem
              id={item.id}
              onClick={onFileClick}
              onEditingStart={onEditingStart}
              isEditing={!!item.isNew || editingId === item.id}
              name={item.name}
              onEditingChange={onEditingChange}
            />
          </List.Item>
        )
      }}
    />
  )
}

export default FileList
