import type { CharacterRecord } from '../database/models'

type CharacterEditorProps = {
  character: CharacterRecord
  onUpdate: (field: keyof Pick<CharacterRecord, 'name' | 'description'>, value: string) => void
}

function CharacterEditor({ character, onUpdate }: CharacterEditorProps) {
  return (
    <main className="editor-area">
      <header className="editor-header">
        <span>Personagem</span>
      </header>

      <div className="editor character-editor">
        <input
          className="chapter-title"
          value={character.name}
          onChange={(event) => onUpdate('name', event.target.value)}
          placeholder="Nome do personagem"
        />

        <label className="character-field">
          <span>Descrição</span>

          <textarea
            value={character.description}
            onChange={(event) => onUpdate('description', event.target.value)}
            placeholder="Personalidade, aparência, história e outras informações..."
          />
        </label>
      </div>

      <footer className="editor-footer">
        <span>Ficha de personagem</span>
        <span>Salvo</span>
      </footer>
    </main>
  )
}

export default CharacterEditor
