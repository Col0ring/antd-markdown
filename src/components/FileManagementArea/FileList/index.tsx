import React, { useCallback, useState } from 'react'
import pathModule from 'path'
import fsModule from 'fs'
import { List } from 'antd'
import { ID } from '@/interfaces/Data'
import { settingsStore } from '@/utils/store'
import FileItem, { FileItemProps } from '../FileItem'
import useLayout from '@/hooks/useLayout'
import fileHelper from '@/utils/fileHelper'
import { getParentNode, obj2Arr } from '@/utils/help'
import useContextMenu from '@/hooks/useContextMenu'
const path = window.require('path') as typeof pathModule
const { remote } = window.require('electron')
const fs = window.require('fs') as typeof fsModule
const savedLocation =
  (settingsStore.get('savedFileLocation') as string) ||
  remote.app.getPath('documents')
export interface FileListProps {}

const FileList: React.FC<FileListProps> = () => {
  const [editingId, setEditingId] = useState<ID>('')
  const { layout, setLayout, throwError, deleteFile } = useLayout()
  const { files, searchFiles } = layout
  const fileArr = obj2Arr(searchFiles)

  const onFileDelete = useCallback(
    async (id: ID) => {
      await deleteFile(id)
    },
    [deleteFile]
  )

  const onFileClick: FileItemProps['onClick'] = useCallback(
    async (id) => {
      setLayout((draft) => {
        draft.activeFileId = id
      })
    },
    [setLayout]
  )

  const onEditingStart: FileItemProps['onEditingStart'] = useCallback(
    (id: ID) => {
      setEditingId(id)
    },
    []
  )

  const onSaveEdit = useCallback(
    async (id: ID, name: string, isNew: boolean) => {
      if (!name.trim() || files[id].name === name) {
        if (isNew) {
          await onFileDelete(id)
        }
        setEditingId('')
        return
      }
      const newPath = isNew
        ? path.join(savedLocation, `${name}.md`)
        : path.join(path.dirname(files[id].path), `${name}.md`)
      if (fs.existsSync(newPath)) {
        throwError('目标文件已存在')
        setEditingId('')
        isNew && (await onFileDelete(id))
        return
      }

      const modifiedFile = { ...files[id], name, isNew: false, path: newPath }
      const newFiles = { ...files, [id]: modifiedFile }
      let res: boolean | string = false
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
        setEditingId('')
      } else {
        throwError(`${isNew ? '新增' : '修改'}文件失败`)
        await onFileDelete(id)
      }
    },
    [files, onFileDelete, setLayout, throwError]
  )

  const onEditingChange: FileItemProps['onEditingChange'] = useCallback(
    async (id, val) => {
      const file = searchFiles[id]
      await onSaveEdit(id, val, !!file.isNew)
    },
    [onSaveEdit, searchFiles]
  )

  const currentClickElement = useContextMenu(
    [
      {
        label: '打开',
        click() {
          onContextClick((parentElement) => {
            if (parentElement) {
              onFileClick(parentElement.dataset.id as string)
            }
          })
        },
      },
      {
        label: '重命名',
        click() {
          onContextClick((parentElement) => {
            if (parentElement) {
              setEditingId(parentElement.dataset.id as string)
            }
          })
        },
      },
      {
        label: '删除',
        click() {
          onContextClick((parentElement) => {
            if (parentElement) {
              onFileDelete(parentElement.dataset.id as string)
            }
          })
        },
      },
    ],
    {
      targetSelector: '.context-menu-target-list',
    }
  )
  const onContextClick = useCallback(
    (cb: (parentNode: HTMLElement | null) => void) => {
      cb(
        getParentNode(
          currentClickElement.current,
          'context-menu-target-list-item'
        )
      )
    },
    [currentClickElement]
  )
  return (
    <List
      className="context-menu-target-list"
      dataSource={fileArr}
      renderItem={(item) => {
        return (
          <List.Item
            className="context-menu-target-list-item"
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
