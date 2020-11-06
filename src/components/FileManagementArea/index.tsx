import React, { useCallback, useState } from 'react'
import { usePrevious } from 'ahooks'
import FileSearch, { FileSearchProps } from '../FileSearch'
import FileList from './FileList'
import FooterMenu from './FooterMenu'
import styles from './FileManagementArea.module.less'
import useLayout from '@/hooks/useLayout'
import { flattenFiles, obj2Arr } from '@/utils/help'
export interface FileManagementArea {}

const FileManagementArea: React.FC<FileManagementArea> = () => {
  const [searchLoading, setSearchLoading] = useState(false)
  const { layout, setLayout, createNewFile, importFiles } = useLayout()
  const { files, searchValue } = layout
  const preSearchValue = usePrevious(searchValue)
  const filesArr = obj2Arr(files)
  const onFileSearch: FileSearchProps['onSearch'] = useCallback(
    (value) => {
      if (preSearchValue === searchValue) {
        return
      }
      setSearchLoading(true)
      const newFiles = flattenFiles(
        filesArr.filter((file) => file.name.includes(value))
      )
      setLayout((draft) => {
        draft.searchValue = value
        draft.searchFiles = newFiles
      })
      setSearchLoading(false)
    },
    [filesArr, preSearchValue, searchValue, setLayout]
  )
  const onSearchChange: FileSearchProps['onChange'] = useCallback(
    (value) => {
      setLayout((draft) => {
        draft.searchValue = value
      })
    },
    [setLayout]
  )

  const onCreateFile = useCallback(() => {
    createNewFile()
    setLayout((draft) => {
      draft.searchValue = ''
    })
  }, [createNewFile, setLayout])

  const onImportFiles = useCallback(async () => {
    const res = await importFiles()
    if (res) {
      setLayout((draft) => {
        draft.searchValue = ''
      })
    }
  }, [importFiles, setLayout])

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
