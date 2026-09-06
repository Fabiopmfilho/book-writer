import type { CharacterRecord, LocationRecord } from '../database/models'
import type { Chapter } from '../types/book'

import ChapterList from './ChapterList'
import CharacterList from './CharacterList'
import LocationList from './LocationList'

type SidebarProps = {
  bookTitle: string
  chapters: Chapter[]
  characters: CharacterRecord[]
  locations: LocationRecord[]
  activeChapterId: string | null
  activeCharacterId: string | null
  activeLocationId: string | null
  onSelectChapter: (id: string) => void
  onSelectCharacter: (id: string) => void
  onSelectLocation: (id: string) => void
  onCreateChapter: () => void
  onCreateCharacter: () => void
  onCreateLocation: () => void
  onCreateScene: (chapterId: string) => void
}

function Sidebar({
  bookTitle,
  chapters,
  characters,
  locations,
  activeChapterId,
  activeCharacterId,
  activeLocationId,
  onSelectChapter,
  onSelectCharacter,
  onSelectLocation,
  onCreateChapter,
  onCreateCharacter,
  onCreateLocation,
  onCreateScene
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Book Writer</h1>
      </div>

      <div className="project-name">
        <span>📖</span>
        {bookTitle}
      </div>

      <div className="sidebar-section-header">
        <span>Manuscrito</span>
        <button type="button" onClick={onCreateChapter}>
          +
        </button>
      </div>

      <ChapterList
        chapters={chapters}
        activeChapterId={activeChapterId ?? ''}
        onSelectChapter={onSelectChapter}
        onCreateScene={onCreateScene}
      />

      <div className="sidebar-section-header">
        <span>Personagens</span>
        <button type="button" onClick={onCreateCharacter}>
          +
        </button>
      </div>

      <CharacterList
        characters={characters}
        activeCharacterId={activeCharacterId}
        onSelectCharacter={onSelectCharacter}
      />

      <div className="sidebar-section-header">
        <span>Lugares</span>
        <button type="button" onClick={onCreateLocation}>
          +
        </button>
      </div>

      <LocationList
        locations={locations}
        activeLocationId={activeLocationId}
        onSelectLocation={onSelectLocation}
      />
    </aside>
  )
}

export default Sidebar
