import { useEffect, useRef } from 'react'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import type { CharacterRecord, LocationRecord } from '../../database/models'
import { useDebouncedSave } from '../../hooks/useDebouncedSave'
import { createReferenceMention } from './referenceMention'
import EditorToolbar from './EditorToolbar'

export type EditorSaveStatus = 'editing' | 'saving' | 'saved' | 'error'

type RichTextEditorProps = {
  content: string
  characters: CharacterRecord[]
  locations: LocationRecord[]
  className?: string
  placeholder?: string
  showToolbar?: boolean
  onSave: (content: string) => void | Promise<void>
  onOpenReference: (entityId: string) => void
  onSaveStatusChange?: (status: EditorSaveStatus) => void
}

function RichTextEditor({
  content,
  characters,
  locations,
  className = '',
  placeholder = 'Comece a escrever...',
  showToolbar = true,
  onSave,
  onOpenReference,
  onSaveStatusChange
}: RichTextEditorProps) {
  const charactersRef = useRef(characters)
  const locationsRef = useRef(locations)
  const openReferenceRef = useRef(onOpenReference)

  useEffect(() => {
    charactersRef.current = characters
  }, [characters])

  useEffect(() => {
    locationsRef.current = locations
  }, [locations])

  useEffect(() => {
    openReferenceRef.current = onOpenReference
  }, [onOpenReference])

  const { status, scheduleSave } = useDebouncedSave(onSave, 500)

  useEffect(() => {
    onSaveStatusChange?.(status)
  }, [status, onSaveStatusChange])

  const editor = useEditor({
    extensions: [
      StarterKit,
      // eslint-disable-next-line react-hooks/refs
      createReferenceMention({
        getCharacters: () => charactersRef.current,
        getLocations: () => locationsRef.current
      })
    ],

    content: content || '<p></p>',

    editorProps: {
      attributes: {
        class: `editor-document ${className}`.trim(),
        spellcheck: 'true',
        'data-placeholder': placeholder
      },

      handleClickOn(_view, _position, node) {
        if (node.type.name !== 'mention') {
          return false
        }

        const entityId = node.attrs.id

        if (typeof entityId !== 'string') {
          return false
        }

        openReferenceRef.current(entityId)

        return true
      }
    },

    onUpdate({ editor: currentEditor }) {
      scheduleSave(currentEditor.getHTML())
    }
  })

  return (
    <>
      {showToolbar && <EditorToolbar editor={editor} />}

      <div className="rich-text-editor">
        <EditorContent editor={editor} />
      </div>
    </>
  )
}

export default RichTextEditor
