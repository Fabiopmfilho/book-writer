import type { CharacterRecord } from '../database/models'
import type { Chapter } from '../types/book'

import ChapterList from './ChapterList'
import CharacterList from './CharacterList'

type SidebarProps = {
  bookTitle: string
  chapters: Chapter[]
  characters: CharacterRecord[]
  activeChapterId: string | null
  activeCharacterId: string | null
  onSelectChapter: (id: string) => void
  onSelectCharacter: (id: string) => void
  onCreateChapter: () => void
  onCreateCharacter: () => void
}

function Sidebar({
  bookTitle,
  chapters,
  characters,
  activeChapterId,
  activeCharacterId,
  onSelectChapter,
  onSelectCharacter,
  onCreateChapter,
  onCreateCharacter
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

        <button type="button" onClick={onCreateChapter} title="Novo capítulo">
          +
        </button>
      </div>

      <ChapterList
        chapters={chapters}
        activeChapterId={activeChapterId ?? ''}
        onSelectChapter={onSelectChapter}
      />

      <div className="sidebar-section-header">
        <span>Personagens</span>

        <button type="button" onClick={onCreateCharacter} title="Novo personagem">
          +
        </button>
      </div>

      <CharacterList
        characters={characters}
        activeCharacterId={activeCharacterId}
        onSelectCharacter={onSelectCharacter}
      />
    </aside>
  )
}

export default Sidebar
