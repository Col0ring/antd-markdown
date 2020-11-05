import React from 'react'
import { List, Typography, Tooltip, Button } from 'antd'
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons'
import { File } from '@/interfaces/Data'
import styles from './FileList.less'

export interface FileListProps {
  files: File[]
}

const FileList: React.FC<FileListProps> = ({ files = [] }) => {
  return (
    <List
      className={styles.list}
      dataSource={files}
      renderItem={(item) => {
        return (
          <List.Item
            className={styles.fileListItemWrap}
            data-name={item.name}
            data-id={item.id}
          >
            <div className={styles.fileListItem}>
              <div className={styles.name}>
                <Tooltip placement="rightTop" title={item.name}>
                  <Typography.Text ellipsis>{item.name}</Typography.Text>
                </Tooltip>
              </div>
            </div>
          </List.Item>
        )
      }}
    />
  )
}

export default FileList
