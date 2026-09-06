import type { Chapter } from '../types/book'

type EditorProps = {
  chapter: Chapter
  wordCount: number
  onUpdate: (field: 'title' | 'content', value: string) => void
}

function Editor({ chapter, wordCount, onUpdate }: EditorProps) {
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

        <textarea
          className="editor-text"
          value={chapter.content}
          onChange={(event) => onUpdate('content', event.target.value)}
          placeholder="Comece a escrever..."
          spellCheck
        />
      </div>

      <footer className="editor-footer">
        <span>{wordCount.toLocaleString('pt-BR')} palavras</span>

        <span>Salvo</span>
      </footer>
    </main>
  )
}

export default Editor
