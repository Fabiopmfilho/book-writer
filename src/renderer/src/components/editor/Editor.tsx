import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import type { Chapter } from '../../types/book'

import { useDebouncedSave } from '../../hooks/useDebouncedSave'

import type { CharacterRecord, LocationRecord } from '../../database/models'
import { createReferenceMention } from './referenceMention'

type EditorProps = {
  chapter: Chapter
  characters: CharacterRecord[]
  wordCount: number
  locations: LocationRecord[]
  onUpdate: (field: 'title' | 'content', value: string) => void | Promise<void>
  onOpenReference: (entityId: string) => void
}

function Editor({
  chapter,
  characters,
  wordCount,
  onUpdate,
  locations,
  onOpenReference
}: EditorProps) {
  const [title, setTitle] = useState(chapter.title)

  const charactersRef = useRef(characters)
  const locationsRef = useRef(locations)
  const openReferenceRef = useRef(onOpenReference)

  useEffect(() => {
    locationsRef.current = locations
  }, [locations])

  useEffect(() => {
    openReferenceRef.current = onOpenReference
  }, [onOpenReference])

  useEffect(() => {
    charactersRef.current = characters
  }, [characters])

  const { status: contentSaveStatus, scheduleSave: scheduleContentSave } = useDebouncedSave(
    (content) => onUpdate('content', content),
    500
  )

  const { status: titleSaveStatus, scheduleSave: scheduleTitleSave } = useDebouncedSave(
    (nextTitle) => onUpdate('title', nextTitle),
    300
  )

  const saveStatus =
    contentSaveStatus === 'error' || titleSaveStatus === 'error'
      ? 'error'
      : contentSaveStatus === 'saving' || titleSaveStatus === 'saving'
        ? 'saving'
        : contentSaveStatus === 'editing' || titleSaveStatus === 'editing'
          ? 'editing'
          : 'saved'

  const saveStatusLabel = {
    editing: 'Editando…',
    saving: 'Salvando…',
    saved: 'Salvo',
    error: 'Erro ao salvar'
  }[saveStatus]

  const editor = useEditor({
    extensions: [
      StarterKit,

      // eslint-disable-next-line react-hooks/refs
      createReferenceMention({
        getCharacters: () => charactersRef.current,
        getLocations: () => locationsRef.current
      })
    ],

    content: chapter.content || '<p></p>',

    editorProps: {
      attributes: {
        class: 'editor-document',
        spellcheck: 'true'
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
      scheduleContentSave(currentEditor.getHTML())
    }
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    const nextContent = chapter.content || '<p></p>'

    if (editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false
      })
    }
  }, [chapter.id, chapter.content, editor])

  return (
    <main className="editor-area">
      <header className="editor-header">
        <span>{chapter.title}</span>
      </header>

      <div className="editor">
        <input
          className="chapter-title"
          value={title}
          onChange={(event) => {
            const nextTitle = event.target.value

            setTitle(nextTitle)
            scheduleTitleSave(nextTitle)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
          }}
          placeholder={chapter.type === 'scene' ? 'Título da cena' : 'Título do capítulo'}
        />

        <div className="editor-toolbar">
          <button
            type="button"
            className={editor?.isActive('bold') ? 'active' : ''}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Negrito"
          >
            B
          </button>

          <button
            type="button"
            className={editor?.isActive('italic') ? 'active' : ''}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Itálico"
          >
            I
          </button>

          <button
            type="button"
            className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Título"
          >
            H2
          </button>

          <button
            type="button"
            className={editor?.isActive('blockquote') ? 'active' : ''}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            title="Citação"
          >
            “
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>

      <footer className="editor-footer">
        <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
        <span className={`save-status ${saveStatus}`}>{saveStatusLabel}</span>
      </footer>
    </main>
  )
}

export default Editor
