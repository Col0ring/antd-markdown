import React, { useState } from 'react'
import FileSearch, { FileSearchProps } from './FileSearch'
import FileList from './FileList'
import FooterMenu from './FooterMenu'
import styles from './fileManagementArea.module.less'
import useLayout from '@/hooks/useLayout'
import { obj2Arr } from '@/utils/help'

export interface FileManagementArea {}

const FileManagementArea: React.FC<FileManagementArea> = () => {
  const [searchValue, setSearchValue] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const { layout } = useLayout()
  const { files } = layout
  const filesArr = obj2Arr(files)
  const onFileSearch: FileSearchProps['onSearch'] = () => {
    setSearchLoading(true)
  }
  const onSearchChange: FileSearchProps['onChange'] = (value) => {
    setSearchValue(value)
  }
  const onCreateFile = () => {}
  const onImportFiles = () => {}
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
        <FileList files={filesArr} />
      </div>
      <div className={styles.footer}>
        <FooterMenu onCreateFile={onCreateFile} onImportFiles={onImportFiles} />
      </div>
    </div>
  )
}
export default FileManagementArea
