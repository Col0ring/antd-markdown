import React from 'react'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import { File, ID } from '@/interfaces/Data'
export interface EditorProps {
  activeFile: File
  onChange: (id: ID, value: string) => void
}

const Editor: React.FC<EditorProps> = ({ activeFile, onChange }) => {
  return (
    <SimpleMDE
      key={activeFile.id}
      value={activeFile.content}
      onChange={(value) => onChange(activeFile.id, value)}
      options={{
        autofocus: !!activeFile.content,
        minHeight: '450px',
        spellChecker: false,
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
