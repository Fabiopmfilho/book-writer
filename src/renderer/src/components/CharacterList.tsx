import type { CharacterRecord } from '../database/models'

type CharacterListProps = {
  characters: CharacterRecord[]
  activeCharacterId: string | null
  onSelectCharacter: (id: string) => void
}

function CharacterList({ characters, activeCharacterId, onSelectCharacter }: CharacterListProps) {
  if (characters.length === 0) {
    return <p className="sidebar-empty">Nenhum personagem</p>
  }

  return (
    <div className="chapters">
      {characters.map((character) => (
        <button
          key={character.id}
          type="button"
          className={`chapter ${character.id === activeCharacterId ? 'active' : ''}`}
          onClick={() => onSelectCharacter(character.id)}
        >
          <span>♙</span>
          <span>{character.name || 'Personagem sem nome'}</span>
        </button>
      ))}
    </div>
  )
}

export default CharacterList
