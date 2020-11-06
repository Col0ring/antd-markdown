import React from 'react'
import { Input } from 'antd'

export interface FileSearchProps {
  loading?: boolean
  autoFocus?: boolean
  value: string
  onSearch: (value: string) => void
  onChange: (value: string) => void
}

const FileSearch: React.FC<FileSearchProps> = ({
  loading,
  value,
  onSearch,
  onChange,
  autoFocus = false,
}) => {
  return (
    <Input.Search
      value={value}
      placeholder="请输入搜索内容"
      enterButton
      allowClear
      autoFocus={autoFocus}
      loading={loading}
      onSearch={onSearch}
      onChange={(e) => {
        onChange(e.target.value)
      }}
    />
  )
}

export default FileSearch
