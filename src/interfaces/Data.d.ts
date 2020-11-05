import { Draft } from 'immer'
export type ID = string | number

export interface File {
  id: ID
  path: string
  isNew: boolean
  name: string
  content: string
  createdAt: number
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
}
