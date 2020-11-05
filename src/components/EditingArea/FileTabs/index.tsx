import React from 'react'
import { Tabs } from 'antd'
import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons'
import styles from './FileTabs.module.less'
import classnames from 'classnames'
import { File, ID } from '@/interfaces/Data'

export interface FileTabsProps {
  files: File[]
  activeId: ID
  unsavedIds: ID[]
  onCloseTab: (id: ID) => void
  onTabClick: (id: ID) => void
}

const FileTabs: React.FC<FileTabsProps> = ({
  files = [],
  activeId,
  unsavedIds = [],
  onCloseTab,
  onTabClick
}) => {
  return (
    <Tabs
      hideAdd
      onChange={onTabClick}
      activeKey={String(activeId)}
      type="editable-card"
    >
      {files.map((file) => {
        const withUnsavedMark = unsavedIds.includes(file.id)
        const tabClassName = classnames(styles.tabPaneContent, {
          [styles.active]: file.id === activeId,
          [styles.unSavedMark]: withUnsavedMark
        })
        return (
          <Tabs.TabPane
            tab={
              <span className={tabClassName}>
                {file.name}
                {withUnsavedMark && (
                  <span className={styles.unSaved}>
                    <InfoCircleOutlined />
                  </span>
                )}
                <span
                  className={styles.close}
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseTab(file.id)
                  }}
                >
                  <CloseOutlined />
                </span>
              </span>
            }
            key={file.id}
            closable={false}
          />
        )
      })}
    </Tabs>
  )
}

export default FileTabs
