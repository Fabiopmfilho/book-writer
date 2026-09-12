import type { CharacterRecord } from '../../database/models'
import EntityList from './EntityList'

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
  return (
    <EntityList
      items={characters}
      activeItemId={activeCharacterId}
      icon="♙"
      emptyMessage="Nenhum personagem"
      fallbackName="Personagem sem nome"
      deleteTitle="Excluir personagem"
      onSelect={onSelectCharacter}
      onDelete={onDeleteCharacter}
    />
  )
}

export default CharacterList
