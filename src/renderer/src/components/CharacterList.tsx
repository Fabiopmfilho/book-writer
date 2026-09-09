import type { CharacterRecord } from '../database/models'

type CharacterListProps = {
  characters: CharacterRecord[]
  activeCharacterId: string | null
  onSelectCharacter: (id: string) => void
  onDeleteCharacter: (id: string) => void
}

function CharacterList({
  characters,
  activeCharacterId,
  onSelectCharacter,
  onDeleteCharacter
}: CharacterListProps) {
  if (characters.length === 0) {
    return <p className="sidebar-empty">Nenhum personagem</p>
  }

  return (
    <div className="chapters">
      {characters.map((character) => {
        const name = character.name || 'Personagem sem nome'

        return (
          <div key={character.id} className="entity-row">
            <button
              type="button"
              className={`chapter entity-title ${
                character.id === activeCharacterId ? 'active' : ''
              }`}
              onClick={() => onSelectCharacter(character.id)}
            >
              <span>♙</span>
              <span>{name}</span>
            </button>

            <button
              type="button"
              className="document-delete-button"
              onClick={() => onDeleteCharacter(character.id)}
              title="Excluir personagem"
              aria-label={`Excluir ${name}`}
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default CharacterList
