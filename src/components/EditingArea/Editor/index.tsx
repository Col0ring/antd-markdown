import React from 'react'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
import { File, ID } from '@/interfaces/Data'
import styles from './Editor.module.less'
import { formatTime } from '@/utils/help'

export interface EditorProps {
  editingFile: File
  onChange: (id: ID, value: string) => void
}

const Editor: React.FC<EditorProps> = ({ editingFile, onChange }) => {
  return (
    <div className={styles.editor}>
      <div className={styles.label}>{editingFile.path}</div>
      <SimpleMDE
        key={editingFile.id}
        value={editingFile.content}
        onChange={(value) => onChange(editingFile.id, value)}
        options={{
          autofocus: true,
          maxHeight: 'calc(100vh - 190px)',
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
      {editingFile.isSynced && editingFile.updatedAt && (
        <div className={styles.saveTime}>
          已同步保存于 {formatTime(editingFile.updatedAt!)}
        </div>
      )}
    </div>
  )
}

export default Editor
