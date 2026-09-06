import type { Chapter } from '../types/book'
import ChapterList from './ChapterList'

type SidebarProps = {
  bookTitle: string
  chapters: Chapter[]
  activeChapterId: string
  onSelectChapter: (id: string) => void
  onCreateChapter: () => void
}

function Sidebar({
  bookTitle,
  chapters,
  activeChapterId,
  onSelectChapter,
  onCreateChapter
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Book Writer</h1>

        <button type="button" onClick={onCreateChapter} title="Novo capítulo">
          +
        </button>
      </div>

      <div className="project-name">
        <span>📖</span>
        {bookTitle}
      </div>

      <ChapterList
        chapters={chapters}
        activeChapterId={activeChapterId}
        onSelectChapter={onSelectChapter}
      />
    </aside>
  )
}

export default Sidebar
