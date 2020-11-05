import React, { createContext, useCallback, useContext, useEffect } from 'react'
import { useImmer } from 'use-immer'
import { LayoutProps, LayoutProviderProps } from '@/interfaces/Data'
import { saveFiles2Store } from '@/utils/store'
import { Modal } from 'antd'

const files = {
  '1': {
    id: '1',
    path: 'string',
    isNew: false,
    name: 'stringstringstringstringstringstring',
    content: 'string',
  },
  '2': {
    id: '2',
    path: 'dass',
    isNew: false,
    name: 'adsadas',
    content: 'string',
  },
}

const initialState: LayoutProps = {
  activeFileId: '1',
  openedFileIds: ['1'],
  unsavedFileIds: [],
  files: files,
  searchFiles: files,
}
const LayoutContext = createContext<LayoutProviderProps>({
  layout: {
    ...initialState,
  },
  throwError: () => {},
  setLayout: () => {},
})

export const LayoutProvider: React.FC = ({ children }) => {
  const [layout, setLayout] = useImmer<LayoutProps>({
    ...initialState,
  })
  const throwError = useCallback((message: string) => {
    Modal.error({
      centered: true,
      okText: '确定',
      content: message,
    })
  }, [])
  useEffect(() => {
    setLayout((draft) => {
      draft.searchFiles = layout.files
    })
    saveFiles2Store(layout.files)
  }, [layout.files, setLayout])
  useEffect(() => {
    if (!layout.openedFileIds.includes(layout.activeFileId)) {
      setLayout((draft) => {
        draft.openedFileIds.push(layout.activeFileId)
      })
    }
  }, [layout.activeFileId, layout.openedFileIds, setLayout])
  return (
    <LayoutContext.Provider value={{ layout, setLayout, throwError }}>
      {children}
    </LayoutContext.Provider>
  )
}

const useLayout = () => {
  return useContext(LayoutContext)
}

export default useLayout
