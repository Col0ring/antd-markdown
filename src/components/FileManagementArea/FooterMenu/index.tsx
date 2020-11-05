import React from 'react'
import { Button } from 'antd'
import { ImportOutlined, FileAddOutlined } from '@ant-design/icons'
import styles from './FooterMenu.module.less'

export interface FooterMenuProps {
  onCreateFile: () => void
  onImportFiles: () => void
}
const FooterMenu: React.FC<FooterMenuProps> = ({
  onCreateFile,
  onImportFiles,
}) => {
  return (
    <div className={styles.footerMenuContainer}>
      <div>
        <Button
          icon={<FileAddOutlined />}
          block
          type="primary"
          onClick={() => onCreateFile && onCreateFile()}
        >
          新建
        </Button>
      </div>
      <div>
        <Button
          block
          icon={<ImportOutlined />}
          onClick={() => onImportFiles && onImportFiles()}
        >
          导入
        </Button>
      </div>
    </div>
  )
}

export default FooterMenu
