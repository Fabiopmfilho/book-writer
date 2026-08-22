import './assets/main.css'

function App() {
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
