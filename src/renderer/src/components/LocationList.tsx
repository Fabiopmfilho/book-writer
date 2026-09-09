import type { LocationRecord } from '../database/models'

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
  if (locations.length === 0) {
    return <p className="sidebar-empty">Nenhum lugar</p>
  }

  return (
    <div className="chapters">
      {locations.map((location) => {
        const name = location.name || 'Lugar sem nome'

        return (
          <div key={location.id} className="entity-row">
            <button
              type="button"
              className={`chapter entity-title ${location.id === activeLocationId ? 'active' : ''}`}
              onClick={() => onSelectLocation(location.id)}
            >
              <span>⌖</span>
              <span>{name}</span>
            </button>

            <button
              type="button"
              className="document-delete-button"
              onClick={() => onDeleteLocation(location.id)}
              title="Excluir lugar"
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

export default LocationList
