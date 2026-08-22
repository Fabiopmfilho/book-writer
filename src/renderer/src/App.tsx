import { useMemo, useState } from 'react'
import './assets/main.css'

type Chapter = {
  id: string
  title: string
  content: string
  notes: string
}

const initialChapters: Chapter[] = [
  {
    id: '1',
    title: 'Capítulo 1',
    content: '',
    notes: ''
  },
  {
    id: '2',
    title: 'Capítulo 2',
    content: '',
    notes: ''
  },
  {
    id: '3',
    title: 'Capítulo 3',
    content: '',
    notes: ''
  }
]

const App = () => {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [activeChapterId, setActiveChapterId] = useState('chapter-1')

  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId)

  const wordCount = useMemo(() => {
    if (!activeChapter?.content.trim()) {
      return 0
    }

    return activeChapter.content.trim().split(/\s+/).length
  }, [activeChapter?.content])

  const characterCount = activeChapter?.content.length ?? 0

  function updateActiveChapter(field: keyof Chapter, value: string) {
    setChapters((currentChapters) =>
      currentChapters.map((chapter) =>
        chapter.id === activeChapterId
          ? {
              ...chapter,
              [field]: value
            }
          : chapter
      )
    )
  }

  function createChapter() {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Capítulo ${chapters.length + 1}`,
      content: '',
      notes: ''
    }

    setChapters((currentChapters) => [...currentChapters, newChapter])

    setActiveChapterId(newChapter.id)
  }

  if (!activeChapter) {
    return null
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Book Writer</h1>
          <button>+</button>
        </div>

        <div className="project-name">
          <span>📖</span>
          Meu Livro
        </div>

        <div className="chapters">
          <div className="chapter active">
            <span>▸</span>
            Capítulo 1
          </div>

          <div className="chapter">
            <span>▸</span>
            Capítulo 2
          </div>

          <div className="chapter">
            <span>▸</span>
            Capítulo 3
          </div>
        </div>
      </aside>

      <main className="editor-area">
        <header className="editor-header">
          <span>Capítulo 1</span>
        </header>

        <div className="editor">
          <input className="chapter-title" defaultValue="Capítulo 1" />

          <textarea className="editor-text" placeholder="Comece a escrever..." />
        </div>

        <footer className="editor-footer">
          <span>0 palavras</span>
          <span>Salvo</span>
        </footer>
      </main>

      <aside className="inspector">
        <div className="inspector-header">
          <h2>Informações</h2>
        </div>

        <div className="inspector-section">
          <label>Palavras</label>
          <strong>0</strong>
        </div>

        <div className="inspector-section">
          <label>Caracteres</label>
          <strong>0</strong>
        </div>

        <div className="inspector-section">
          <label>Notas</label>

          <textarea placeholder="Adicione uma nota..." />
        </div>
      </aside>
    </div>
  )
}

export default App
