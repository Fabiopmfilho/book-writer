import { useEffect, useRef } from 'react'
import Mention from '@tiptap/extension-mention'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import type { CharacterRecord } from '../database/models'
import type { Chapter } from '../types/book'

type EditorProps = {
  chapter: Chapter
  characters: CharacterRecord[]
  wordCount: number
  onUpdate: (field: 'title' | 'content', value: string) => void
  onOpenCharacter: (characterId: string) => void
}

type MentionItem = {
  id: string
  label: string
}

function Editor({ chapter, characters, wordCount, onUpdate, onOpenCharacter }: EditorProps) {
  const charactersRef = useRef(characters)
  const openCharacterRef = useRef(onOpenCharacter)

  useEffect(() => {
    openCharacterRef.current = onOpenCharacter
  }, [onOpenCharacter])

  useEffect(() => {
    charactersRef.current = characters
  }, [characters])

  const editor = useEditor({
    extensions: [
      StarterKit,

      // eslint-disable-next-line react-hooks/refs
      Mention.configure({
        HTMLAttributes: {
          class: 'character-mention'
        },

        renderText({ node }) {
          return node.attrs.label
        },

        renderHTML({ node, options }) {
          return [
            'span',
            {
              ...options.HTMLAttributes,
              'data-type': 'mention',
              'data-id': node.attrs.id,
              'data-label': node.attrs.label
            },
            node.attrs.label
          ]
        },

        suggestion: {
          char: '@',

          items({ query }): MentionItem[] {
            const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

            return charactersRef.current
              .filter((character) =>
                character.name.toLocaleLowerCase('pt-BR').includes(normalizedQuery)
              )
              .slice(0, 8)
              .map((character) => ({
                id: character.id,
                label: character.name
              }))
          },

          render() {
            let popup: HTMLDivElement | null = null
            let buttons: HTMLButtonElement[] = []
            let selectedIndex = 0

            function updateSelectedItem() {
              buttons.forEach((button, index) => {
                button.classList.toggle('selected', index === selectedIndex)
              })

              buttons[selectedIndex]?.scrollIntoView({
                block: 'nearest'
              })
            }

            function drawPopup(
              items: MentionItem[],
              chooseItem: (item: MentionItem) => void,
              position: DOMRect | null | undefined
            ) {
              if (!popup) {
                return
              }

              popup.replaceChildren()
              buttons = []

              if (items.length === 0) {
                const emptyMessage = document.createElement('div')
                emptyMessage.className = 'mention-suggestion-empty'
                emptyMessage.textContent = 'Nenhum personagem encontrado'
                popup.appendChild(emptyMessage)
              } else {
                items.forEach((item, index) => {
                  const button = document.createElement('button')

                  button.type = 'button'
                  button.className = 'mention-suggestion-item'
                  button.textContent = item.label

                  button.addEventListener('mouseenter', () => {
                    selectedIndex = index
                    updateSelectedItem()
                  })

                  button.addEventListener('mousedown', (event) => {
                    event.preventDefault()
                    chooseItem(item)
                  })

                  popup?.appendChild(button)
                  buttons.push(button)
                })
              }

              selectedIndex = 0
              updateSelectedItem()

              if (position) {
                popup.style.left = `${position.left}px`
                popup.style.top = `${position.bottom + 6}px`
              }
            }

            return {
              onStart(props) {
                popup = document.createElement('div')
                popup.className = 'mention-suggestion'
                document.body.appendChild(popup)

                drawPopup(
                  props.items as MentionItem[],
                  (item) => props.command(item),
                  props.clientRect?.()
                )
              },

              onUpdate(props) {
                drawPopup(
                  props.items as MentionItem[],
                  (item) => props.command(item),
                  props.clientRect?.()
                )
              },

              onKeyDown({ event }) {
                if (event.key === 'Escape') {
                  popup?.remove()
                  popup = null
                  return true
                }

                if (buttons.length === 0) {
                  return false
                }

                if (event.key === 'ArrowDown') {
                  selectedIndex = (selectedIndex + 1) % buttons.length
                  updateSelectedItem()
                  return true
                }

                if (event.key === 'ArrowUp') {
                  selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length

                  updateSelectedItem()
                  return true
                }

                if (event.key === 'Enter') {
                  buttons[selectedIndex]?.dispatchEvent(
                    new MouseEvent('mousedown', {
                      bubbles: true,
                      cancelable: true
                    })
                  )

                  return true
                }

                return false
              },

              onExit() {
                popup?.remove()
                popup = null
                buttons = []
              }
            }
          }
        }
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

        const characterId = node.attrs.id

        if (typeof characterId !== 'string') {
          return false
        }

        openCharacterRef.current(characterId)
        return true
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
