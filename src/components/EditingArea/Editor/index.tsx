import React from 'react'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import { File, ID } from '@/interfaces/Data'
export interface EditorProps {
  editingFile: File
  onChange: (id: ID, value: string) => void
}

const Editor: React.FC<EditorProps> = ({ editingFile, onChange }) => {
  return (
    <SimpleMDE
      key={editingFile.id}
      value={editingFile.content}
      onChange={(value) => onChange(editingFile.id, value)}
      options={{
        autofocus: true,
        maxHeight: 'calc(100vh - 175px)',
        spellChecker: true,
        toolbar: [
          'bold',
          'italic',
          'heading',
          '|',
          'quote',
          'code',
          'table',
          'horizontal-rule',
          'unordered-list',
          'ordered-list',
          '|',
          'link',
          'image',
          '|',
          'side-by-side',
          'fullscreen',
          '|',
          'guide',
        ],
      }}
    />
  )
}

export default Editor
