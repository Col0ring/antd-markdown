import { Draft } from 'immer'
export type ID = string | number

export interface File {
  id: ID
  path: string
  isNew?: boolean
  isLoaded?: boolean
  name: string
  content?: string
}

export interface LayoutProps {
  files: GLobalObject<File>
  searchFiles: GLobalObject<File>
  activeFileId: ID
  openedFileIds: ID[]
  unsavedFileIds: ID[]
}

export interface LayoutProviderProps<S extends LayoutProps = LayoutProps> {
  layout: S
  setLayout: (f: (draft: Draft<S>) => void | S) => void
  throwError: (message: string) => void
}