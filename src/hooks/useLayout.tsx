import React, { createContext, useContext } from 'react'
import { useImmer } from 'use-immer'
import { LayoutProps, LayoutProviderProps } from '@/interfaces/Data'

const initialState: LayoutProps = {
  activeFileId: '',
  openedFileIds: [],
  unsavedFileIds: [],
  files: {},
  searchFiles: {},
}
const LayoutContext = createContext<LayoutProviderProps>({
  layout: {
    ...initialState,
  },
  setLayout: () => {},
})

export const LayoutProvider: React.FC = ({ children }) => {
  const [layout, setLayout] = useImmer<LayoutProps>({
    ...initialState,
  })
  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  )
}

const useLayout = () => {
  return useContext(LayoutContext)
}

export default useLayout
