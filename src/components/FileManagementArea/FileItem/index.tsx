import React, { useState } from 'react'
import styles from './FileItem.module.less'
import { Tooltip, Typography } from 'antd'
import { ID } from '@/interfaces/Data'
export interface FileItemProps {
  id: ID
  name: string
  isEditing: boolean
  onEditingChange: (id: ID, value: string) => void
  onClick: (id: ID) => void
  onEditingStart: (id: ID) => void
}
const FileItem: React.FC<FileItemProps> = ({
  name,
  isEditing,
  onEditingChange,
  id,
  onClick,
  onEditingStart,
}) => {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className={styles.fileListItem}
      onClick={() => {
        onClick(id)
      }}
    >
      <div className={styles.name}>
        <Tooltip
          onVisibleChange={setVisible}
          visible={isEditing ? false : visible}
          placement="rightTop"
          title={name}
        >
          <Typography.Text
            editable={{
              editing: isEditing,
              onChange: (value) => onEditingChange(id, value),
              onStart: () => {
                onEditingStart(id)
                setVisible(false)
              },
              tooltip: false,
            }}
            ellipsis
          >
            {name}
          </Typography.Text>
        </Tooltip>
      </div>
    </div>
  )
}

export default FileItem
