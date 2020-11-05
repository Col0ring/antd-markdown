import React from 'react'
import { Row, Col } from 'antd'
import styles from './App.module.less'
import { LayoutProvider } from '@/hooks/useLayout'
import FileManagementArea from '@/components/FileManagementArea'
import EditingArea from '@/components/EditingArea'
function App() {
  return (
    <LayoutProvider>
      <div className={styles.app}>
        <Row>
          <Col span={6}>
            <FileManagementArea />
          </Col>
          <Col span={18}>
            <EditingArea />
          </Col>
        </Row>
      </div>
    </LayoutProvider>
  )
}

export default App
