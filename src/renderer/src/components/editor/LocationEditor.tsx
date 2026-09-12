import type { CharacterRecord, LocationRecord } from '../../database/models'
import EntityEditor from './EntityEditor'

type LocationEditorProps = {
  location: LocationRecord
  characters: CharacterRecord[]
  locations: LocationRecord[]
  onUpdate: (
    field: keyof Pick<LocationRecord, 'name' | 'description'>,
    value: string
  ) => void | Promise<void>
  onCommitName: () => void | Promise<void>
  onOpenReference: (entityId: string) => void
}

function LocationEditor({
  location,
  characters,
  locations,
  onUpdate,
  onCommitName,
  onOpenReference
}: LocationEditorProps) {
  return (
    <EntityEditor
      entity={location}
      entityLabel="Lugar"
      namePlaceholder="Nome do lugar"
      descriptionClassName="location-document"
      characters={characters}
      locations={locations}
      onUpdate={onUpdate}
      onCommitName={onCommitName}
      onOpenReference={onOpenReference}
    />
  )
}

export default LocationEditor
