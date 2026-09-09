import type { CharacterRecord, LocationRecord } from '../database/models'
import EntityEditor from './EntityEditor'

type CharacterEditorProps = {
  character: CharacterRecord
  characters: CharacterRecord[]
  locations: LocationRecord[]
  onUpdate: (
    field: keyof Pick<CharacterRecord, 'name' | 'description'>,
    value: string
  ) => void | Promise<void>
  onCommitName: () => void | Promise<void>
  onOpenReference: (entityId: string) => void
}

function CharacterEditor({
  character,
  characters,
  locations,
  onUpdate,
  onCommitName,
  onOpenReference
}: CharacterEditorProps) {
  return (
    <EntityEditor
      entity={character}
      entityLabel="Personagem"
      namePlaceholder="Nome do personagem"
      descriptionClassName="character-document"
      characters={characters}
      locations={locations}
      onUpdate={onUpdate}
      onCommitName={onCommitName}
      onOpenReference={onOpenReference}
    />
  )
}

export default CharacterEditor
