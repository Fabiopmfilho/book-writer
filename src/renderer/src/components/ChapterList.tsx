import type { Chapter } from '../types/book'

type ChapterListProps = {
  chapters: Chapter[]
  activeChapterId: string
  onSelectChapter: (id: string) => void
}

function ChapterList({ chapters, activeChapterId, onSelectChapter }: ChapterListProps) {
  return (
    <div className="chapters">
      {chapters.map((chapter, index) => (
        <button
          key={chapter.id}
          type="button"
          className={`chapter ${chapter.id === activeChapterId ? 'active' : ''}`}
          onClick={() => onSelectChapter(chapter.id)}
        >
          <span>▸</span>

          <span>{chapter.title || `Capítulo ${index + 1}`}</span>
        </button>
      ))}
    </div>
  )
}

export default ChapterList
