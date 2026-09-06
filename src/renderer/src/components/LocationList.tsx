import type { LocationRecord } from '../database/models'

type LocationListProps = {
  locations: LocationRecord[]
  activeLocationId: string | null
  onSelectLocation: (id: string) => void
}

function LocationList({ locations, activeLocationId, onSelectLocation }: LocationListProps) {
  if (locations.length === 0) {
    return <p className="sidebar-empty">Nenhum lugar</p>
  }

  return (
    <div className="chapters">
      {locations.map((location) => (
        <button
          key={location.id}
          type="button"
          className={`chapter ${location.id === activeLocationId ? 'active' : ''}`}
          onClick={() => onSelectLocation(location.id)}
        >
          <span>⌖</span>
          <span>{location.name || 'Lugar sem nome'}</span>
        </button>
      ))}
    </div>
  )
}

export default LocationList
