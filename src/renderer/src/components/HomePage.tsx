import type { Chapter } from '../types/book'

type HomePageProps = {
  documents: Chapter[]
  onOpenChapter: (id: string) => void
  onCreateChapter: () => void
}

function getWordCount(content: string): number {
  const text = new DOMParser().parseFromString(content, 'text/html').body.textContent?.trim() ?? ''

  return text ? text.split(/\s+/).length : 0
}

function HomePage({ documents, onOpenChapter, onCreateChapter }: HomePageProps) {
  const chapters = documents
    .filter((document) => document.type === 'chapter' && document.parentId === null)
    .sort((first, second) => first.order - second.order)

  return (
    <main className="home-area">
      <header className="editor-header">
        <span>Visão geral</span>
      </header>

      <div className="home-content">
        <div className="home-heading">
          <div>
            <h1>Capítulos</h1>
            <p>Organize e acompanhe o progresso do seu livro.</p>
          </div>

          <button type="button" onClick={onCreateChapter}>
            Novo capítulo
          </button>
        </div>

        {chapters.length > 0 ? (
          <div className="chapter-board">
            {chapters.map((chapter, index) => {
              const scenes = documents.filter(
                (document) => document.type === 'scene' && document.parentId === chapter.id
              )

              const chapterWords =
                getWordCount(chapter.content) +
                scenes.reduce((total, scene) => total + getWordCount(scene.content), 0)

              return (
                <button
                  key={chapter.id}
                  type="button"
                  className={`chapter-card color-${index % 4}`}
                  onClick={() => onOpenChapter(chapter.id)}
                >
                  <span className="chapter-card-number">Capítulo {index + 1}</span>

                  <strong>{chapter.title || `Capítulo ${index + 1}`}</strong>

                  <p>{chapter.notes.trim() || 'Nenhuma anotação adicionada.'}</p>

                  <footer>
                    <span>
                      {scenes.length} {scenes.length === 1 ? 'cena' : 'cenas'}
                    </span>

                    <span>{chapterWords.toLocaleString('pt-BR')} palavras</span>
                  </footer>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="home-empty">
            <h2>Comece seu manuscrito</h2>
            <p>Crie o primeiro capítulo para começar a escrever.</p>

            <button type="button" onClick={onCreateChapter}>
              Criar capítulo
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default HomePage
