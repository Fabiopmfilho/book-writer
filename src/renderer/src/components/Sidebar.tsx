import { useState } from 'react'

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
  onCreateScene: (chapterId: string) => void
  onCreateCharacter: () => void
  onCreateLocation: () => void
  onDeleteDocument: (id: string) => void
  homeActive: boolean
  onSelectHome: () => void
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
  onCreateScene,
  onDeleteDocument,
  onCreateCharacter,
  onCreateLocation,
  homeActive,
  onSelectHome
}: SidebarProps) {
  const [manuscriptOpen, setManuscriptOpen] = useState(false)
  const [charactersOpen, setCharactersOpen] = useState(false)
  const [locationsOpen, setLocationsOpen] = useState(false)

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Book Writer</h1>
      </div>

      <button
        type="button"
        className={`project-name ${homeActive ? 'active' : ''}`}
        onClick={onSelectHome}
      >
        <span>📖</span>
        <span>{bookTitle}</span>
      </button>

      <div className="sidebar-section-header">
        <button
          type="button"
          className="sidebar-section-toggle"
          onClick={() => setManuscriptOpen((open) => !open)}
          aria-expanded={manuscriptOpen}
        >
          <span className="section-chevron">{manuscriptOpen ? '▾' : '▸'}</span>

          <span>Capítulos</span>
        </button>

        <button
          type="button"
          className="sidebar-section-add"
          onClick={() => {
            setManuscriptOpen(true)
            onCreateChapter()
          }}
          title="Novo capítulo"
        >
          +
        </button>
      </div>

      {manuscriptOpen && (
        <ChapterList
          chapters={chapters}
          activeChapterId={activeChapterId ?? ''}
          onSelectChapter={onSelectChapter}
          onCreateScene={onCreateScene}
          onDeleteDocument={onDeleteDocument}
        />
      )}

      <div className="sidebar-section-header">
        <button
          type="button"
          className="sidebar-section-toggle"
          onClick={() => setCharactersOpen((open) => !open)}
          aria-expanded={charactersOpen}
        >
          <span className="section-chevron">{charactersOpen ? '▾' : '▸'}</span>

          <span>Personagens</span>
        </button>

        <button
          type="button"
          className="sidebar-section-add"
          onClick={() => {
            setCharactersOpen(true)
            onCreateCharacter()
          }}
          title="Novo personagem"
        >
          +
        </button>
      </div>

      {charactersOpen && (
        <CharacterList
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSelectCharacter={onSelectCharacter}
        />
      )}

      <div className="sidebar-section-header">
        <button
          type="button"
          className="sidebar-section-toggle"
          onClick={() => setLocationsOpen((open) => !open)}
          aria-expanded={locationsOpen}
        >
          <span className="section-chevron">{locationsOpen ? '▾' : '▸'}</span>

          <span>Lugares</span>
        </button>

        <button
          type="button"
          className="sidebar-section-add"
          onClick={() => {
            setLocationsOpen(true)
            onCreateLocation()
          }}
          title="Novo lugar"
        >
          +
        </button>
      </div>

      {locationsOpen && (
        <LocationList
          locations={locations}
          activeLocationId={activeLocationId}
          onSelectLocation={onSelectLocation}
        />
      )}
    </aside>
  )
}

export default Sidebar
