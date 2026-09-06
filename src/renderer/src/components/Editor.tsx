import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import type { CharacterRecord } from '../database/models'

import type { Chapter } from '../types/book'

type EditorProps = {
  chapter: Chapter
  characters: CharacterRecord[]
  wordCount: number
  onUpdate: (field: 'title' | 'content', value: string) => void
}

function Editor({ chapter, characters, wordCount, onUpdate }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'character-mention'
        },
        renderText({ node }) {
          return `@${node.attrs.label}`
        },
        renderHTML({ node, HTMLAttributes }) {
          return [
            'span',
            {
              ...HTMLAttributes,
              'data-type': 'mention',
              'data-id': node.attrs.id,
              'data-label': node.attrs.label
            },
            `@${node.attrs.label}`
          ]
        }
      })
    ],
    content: chapter.content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'editor-document',
        spellcheck: 'true'
      }
    },
    onUpdate({ editor: currentEditor }) {
      onUpdate('content', currentEditor.getHTML())
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
          value={chapter.title}
          onChange={(event) => onUpdate('title', event.target.value)}
          placeholder="Título do capítulo"
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

          <select
            className="character-reference-select"
            defaultValue=""
            onChange={(event) => {
              const character = characters.find((item) => item.id === event.target.value)

              if (!character || !editor) {
                return
              }

              editor
                .chain()
                .focus()
                .insertContent([
                  {
                    type: 'mention',
                    attrs: {
                      id: character.id,
                      label: character.name
                    }
                  },
                  {
                    type: 'text',
                    text: ' '
                  }
                ])
                .run()

              event.target.value = ''
            }}
          >
            <option value="" disabled>
              Inserir personagem…
            </option>

            {characters.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>

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
        <span>Salvo</span>
      </footer>
    </main>
  )
}

export default Editor
