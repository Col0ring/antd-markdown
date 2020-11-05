import React, { useCallback, useState } from 'react'
import pathModule from 'path'
import { v4 as uuid } from 'uuid'
import { usePrevious } from 'ahooks'
import FileSearch, { FileSearchProps } from './FileSearch'
import FileList from './FileList'
import FooterMenu from './FooterMenu'
import styles from './FileManagementArea.module.less'
import useLayout from '@/hooks/useLayout'
import { flattenFiles, obj2Arr } from '@/utils/help'
const { remote } = window.require('electron')
const path = window.require('path') as typeof pathModule
export interface FileManagementArea {}

const FileManagementArea: React.FC<FileManagementArea> = () => {
  const [searchValue, setSearchValue] = useState('')
  const preSearchValue = usePrevious(searchValue)
  const [searchLoading, setSearchLoading] = useState(false)
  const { layout, setLayout, throwError } = useLayout()
  const { files } = layout
  const filesArr = obj2Arr(files)

  const onFileSearch: FileSearchProps['onSearch'] = useCallback(
    (value) => {
      if (preSearchValue === value) {
        return
      }
      setSearchLoading(true)
      setSearchValue(value)
      const newFiles = flattenFiles(
        filesArr.filter((file) => file.name.includes(value))
      )
      setLayout((draft) => {
        draft.searchFiles = newFiles
      })
      setSearchLoading(false)
    },
    [filesArr, preSearchValue, setLayout]
  )
  const onSearchChange: FileSearchProps['onChange'] = useCallback((value) => {
    setSearchValue(value)
  }, [])

  const onCreateFile = useCallback(() => {
    const newId = uuid()
    const newFile = {
      id: newId,
      isNew: true,
      name: '',
      content: '',
      path: '',
    }

    setLayout((draft) => {
      draft.files = { ...draft.files, [newId]: newFile }
    })
    setSearchValue('')
  }, [setLayout])
  const onImportFiles = useCallback(async () => {
    try {
      const res = await remote.dialog.showOpenDialog({
        title: '请选择要导入的 Markdown 文件',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Markdown Files', extensions: ['md'] }],
      })
      if (res.filePaths.length > 0) {
        const filterPaths = res.filePaths.filter((pathname) => {
          return !Object.keys(files).find(
            (filePath) => files[filePath].path === pathname
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
        setSearchValue('')
        if (importFilesArr.length === 1) {
          setLayout((draft) => {
            draft.activeFileId = importFilesArr[0].id
          })
        }
      }
    } catch (error) {
      throwError('导入文件失败，请确保导入的 md 格式文件')
    }
  }, [files, setLayout, throwError])

  return (
    <div className={styles.fileManagementAreaContainer}>
      <div className={styles.header}>
        <FileSearch
          onSearch={onFileSearch}
          onChange={onSearchChange}
          value={searchValue}
          loading={searchLoading}
        />
      </div>
      <div className={styles.fileListContainer}>
        <FileList />
      </div>
      <div className={styles.footer}>
        <FooterMenu onCreateFile={onCreateFile} onImportFiles={onImportFiles} />
      </div>
    </div>
  )
}
export default FileManagementArea
