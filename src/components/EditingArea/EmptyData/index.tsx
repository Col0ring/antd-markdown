import React from 'react'
import { Empty, Button } from 'antd'
import styles from './EmptyData.module.less'
import empty from '@/assets/images/empty.svg'

export interface EmptyDataProps {
  onCreateFile: () => void
}

const EmptyData: React.FC<EmptyDataProps> = ({ onCreateFile }) => {
  return (
    <div className={styles.emptyContainer}>
      <Empty
        image={empty}
        imageStyle={{
          height: 60,
        }}
        description={<span>选择或创建新的 MarkDown 文档</span>}
      >
        <Button type="primary" onClick={onCreateFile}>
          新建
        </Button>
      </Empty>
    </div>
  )
}

export default EmptyData
