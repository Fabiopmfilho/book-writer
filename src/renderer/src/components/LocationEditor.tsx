import { useEffect, useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import type { CharacterRecord, LocationRecord } from '../database/models'
import { createReferenceMention } from './referenceMention'

type LocationEditorProps = {
  location: LocationRecord
  characters: CharacterRecord[]
  onUpdate: (field: keyof Pick<LocationRecord, 'name' | 'description'>, value: string) => void
  onCommitName: () => void
  onOpenCharacter: (characterId: string) => void
}

function LocationEditor({
  location,
  characters,
  onUpdate,
  onCommitName,
  onOpenCharacter
}: LocationEditorProps) {
  const charactersRef = useRef(characters)
  const openCharacterRef = useRef(onOpenCharacter)

  useEffect(() => {
    charactersRef.current = characters
  }, [characters])

  useEffect(() => {
    openCharacterRef.current = onOpenCharacter
  }, [onOpenCharacter])

  const editor = useEditor({
    extensions: [
      StarterKit,
      createReferenceMention({
        getCharacters: () => charactersRef.current
      })
    ],

    content: location.description || '<p></p>',

    editorProps: {
      attributes: {
        class: 'editor-document location-document',
        spellcheck: 'true'
      },

      handleClickOn(_view, _position, node) {
        if (node.type.name !== 'mention') return false

        const characterId = node.attrs.id

        if (typeof characterId !== 'string') return false

        openCharacterRef.current(characterId)
        return true
      }
    },

    onUpdate({ editor: currentEditor }) {
      onUpdate('description', currentEditor.getHTML())
    }
  })

  useEffect(() => {
    if (!editor) return

    const nextContent = location.description || '<p></p>'

    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false
      })
    }
  }, [editor, location.id, location.description])

  return (
    <main className="editor-area">
      <header className="editor-header">
        <span>Lugar</span>
      </header>

      <div className="editor character-editor">
        <input
          className="chapter-title"
          value={location.name}
          onChange={(event) => onUpdate('name', event.target.value)}
          onBlur={onCommitName}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
          placeholder="Nome do lugar"
        />

        <div className="character-field">
          <span>Descrição</span>

          <div className="reference-description-editor">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <footer className="editor-footer">
        <span>Use @ para mencionar personagens</span>
        <span>Salvo</span>
      </footer>
    </main>
  )
}

export default LocationEditor
