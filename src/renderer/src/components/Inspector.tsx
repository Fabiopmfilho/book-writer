import type { Chapter } from '../types/book'

type InspectorProps = {
  chapter: Chapter
  wordCount: number
  characterCount: number
  onUpdateNotes: (notes: string) => void
}

function Inspector({ chapter, wordCount, characterCount, onUpdateNotes }: InspectorProps) {
  return (
    <aside className="inspector">
      <div className="inspector-header">
        <h2>Informações</h2>
      </div>

      <div className="inspector-section">
        <label>Palavras</label>

        <strong>{wordCount.toLocaleString('pt-BR')}</strong>
      </div>

      <div className="inspector-section">
        <label>Caracteres</label>

        <strong>{characterCount.toLocaleString('pt-BR')}</strong>
      </div>

      <div className="inspector-section">
        <label>Notas</label>

        <textarea
          value={chapter.notes}
          onChange={(event) => onUpdateNotes(event.target.value)}
          placeholder="Adicione uma nota..."
        />
      </div>
    </aside>
  )
}

export default Inspector
