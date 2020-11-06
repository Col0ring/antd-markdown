import React, { useCallback, useState } from 'react'
import { usePrevious } from 'ahooks'
import FileSearch, { FileSearchProps } from './FileSearch'
import FileList from './FileList'
import FooterMenu from './FooterMenu'
import styles from './FileManagementArea.module.less'
import useLayout from '@/hooks/useLayout'
import { flattenFiles, obj2Arr } from '@/utils/help'
export interface FileManagementArea {}

const FileManagementArea: React.FC<FileManagementArea> = () => {
  const [searchValue, setSearchValue] = useState('')
  const preSearchValue = usePrevious(searchValue)
  const [searchLoading, setSearchLoading] = useState(false)
  const { layout, setLayout, createNewFile, importFiles } = useLayout()
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
    createNewFile()
    setSearchValue('')
  }, [createNewFile])

  const onImportFiles = useCallback(async () => {
    const res = await importFiles()
    if (res) {
      setSearchValue('')
    }
  }, [importFiles])

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
