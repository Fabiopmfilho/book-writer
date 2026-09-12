import type { LocationRecord } from '../database/models'
import EntityList from './EntityList'

type LocationListProps = {
  locations: LocationRecord[]
  activeLocationId: string | null
  onSelectLocation: (id: string) => void
  onDeleteLocation: (id: string) => void
}

function LocationList({
  locations,
  activeLocationId,
  onSelectLocation,
  onDeleteLocation
}: LocationListProps) {
  return (
    <EntityList
      items={locations}
      activeItemId={activeLocationId}
      icon="⌖"
      emptyMessage="Nenhum lugar"
      fallbackName="Lugar sem nome"
      deleteTitle="Excluir lugar"
      onSelect={onSelectLocation}
      onDelete={onDeleteLocation}
    />
  )
}

export default LocationList
