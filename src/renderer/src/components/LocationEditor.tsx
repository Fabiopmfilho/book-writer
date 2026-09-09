import { useState } from 'react'

import type { CharacterRecord, LocationRecord } from '../database/models'
import RichTextEditor, { type EditorSaveStatus } from './RichTextEditor'

type LocationEditorProps = {
  location: LocationRecord
  characters: CharacterRecord[]
  locations: LocationRecord[]
  onUpdate: (
    field: keyof Pick<LocationRecord, 'name' | 'description'>,
    value: string
  ) => void | Promise<void>
  onCommitName: () => void | Promise<void>
  onOpenReference: (entityId: string) => void
}

function LocationEditor({
  location,
  characters,
  locations,
  onUpdate,
  onCommitName,
  onOpenReference
}: LocationEditorProps) {
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>('saved')

  const saveStatusLabel = {
    editing: 'Editando…',
    saving: 'Salvando…',
    saved: 'Salvo',
    error: 'Erro ao salvar'
  }[saveStatus]

  return (
    <main className="editor-area">
      <header className="editor-header">
        <span>Lugar</span>
      </header>

      <div className="editor character-editor">
        <input
          className="chapter-title"
          value={location.name}
          onChange={(event) => {
            void onUpdate('name', event.target.value)
          }}
          onBlur={() => {
            void onCommitName()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
          placeholder="Nome do lugar"
        />

        <div className="character-field">
          <span>Descrição</span>

          <RichTextEditor
            content={location.description}
            characters={characters}
            locations={locations}
            className="location-document"
            showToolbar
            onSave={(description) => onUpdate('description', description)}
            onOpenReference={onOpenReference}
            onSaveStatusChange={setSaveStatus}
          />
        </div>
      </div>

      <footer className="editor-footer">
        <span>Use @ para personagens e # para lugares</span>

        <span className={`save-status ${saveStatus}`}>{saveStatusLabel}</span>
      </footer>
    </main>
  )
}

export default LocationEditor
