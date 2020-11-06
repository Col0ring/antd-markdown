import React, { useCallback, useState } from 'react'
import { Modal } from 'antd'
import FileSearch from '../FileSearch'
import { flattenFiles, obj2Arr } from '@/utils/help'
import useLayout from '@/hooks/useLayout'
import useIpcRenderer from '@/hooks/useIpcRenderer'

const GlobalFileSearch: React.FC = () => {
  const [value, setValue] = useState('')
  const { setLayout } = useLayout()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const onClosed = useCallback(() => {
    setValue('')
  }, [])
  const onCancel = useCallback(() => {
    setVisible(false)
  }, [])

  const onChange = useCallback((val: string) => {
    setValue(val)
  }, [])

  const onSearch = useCallback(
    (val: string) => {
      if (!val.trim()) {
        return
      }
      setLoading(true)
      setValue(val)
      setLayout((draft) => {
        draft.searchFiles = flattenFiles(
          obj2Arr(draft.files).filter((file) => file.name.includes(value))
        )
        draft.searchValue = val
      })
      setLoading(false)
      setVisible(false)
    },
    [setLayout, value]
  )

  useIpcRenderer({
    'search-file': () => setVisible(true),
  })
  return (
    <Modal
      destroyOnClose
      width={400}
      title="搜索"
      mask={false}
      centered
      visible={visible}
      footer={null}
      afterClose={onClosed}
      onCancel={onCancel}
    >
      <FileSearch
        onChange={onChange}
        onSearch={onSearch}
        loading={loading}
        value={value}
        autoFocus
      />
    </Modal>
  )
}

export default GlobalFileSearch
