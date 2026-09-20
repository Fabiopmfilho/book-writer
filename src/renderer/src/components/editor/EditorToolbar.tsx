import type { Editor } from '@tiptap/react'

type EditorToolbarProps = {
  editor: Editor | null
}

function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null
  }

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatação do texto">
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Desfazer (Ctrl+Z)"
        aria-label="Desfazer"
      >
        ↶
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Refazer (Ctrl+Shift+Z)"
        aria-label="Refazer"
      >
        ↷
      </button>

      <span className="editor-toolbar-divider" />

      <button
        type="button"
        className={editor.isActive('bold') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Negrito (Ctrl+B)"
        aria-label="Negrito"
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        className={editor.isActive('italic') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Itálico (Ctrl+I)"
        aria-label="Itálico"
      >
        <em>I</em>
      </button>

      <button
        type="button"
        className={editor.isActive('strike') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Tachado"
        aria-label="Tachado"
      >
        <s>S</s>
      </button>

      <span className="editor-toolbar-divider" />

      <button
        type="button"
        className={editor.isActive('paragraph') ? 'active' : ''}
        onClick={() => editor.chain().focus().setParagraph().run()}
        title="Parágrafo"
        aria-label="Parágrafo"
      >
        ¶
      </button>

      <button
        type="button"
        className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Título 1"
        aria-label="Título 1"
      >
        H1
      </button>

      <button
        type="button"
        className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Título 2"
        aria-label="Título 2"
      >
        H2
      </button>

      <button
        type="button"
        className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Título 3"
        aria-label="Título 3"
      >
        H3
      </button>

      <span className="editor-toolbar-divider" />

      <button
        type="button"
        className={editor.isActive('bulletList') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Lista com marcadores"
        aria-label="Lista com marcadores"
      >
        •
      </button>

      <button
        type="button"
        className={editor.isActive('orderedList') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Lista numerada"
        aria-label="Lista numerada"
      >
        1.
      </button>

      <button
        type="button"
        className={editor.isActive('blockquote') ? 'active' : ''}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Citação"
        aria-label="Citação"
      >
        “
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Separador horizontal"
        aria-label="Separador horizontal"
      >
        ―
      </button>
    </div>
  )
}

export default EditorToolbar
