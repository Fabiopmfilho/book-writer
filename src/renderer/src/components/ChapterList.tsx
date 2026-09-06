import { useEffect, useState } from 'react'

import type { Chapter } from '../types/book'

type ChapterListProps = {
  chapters: Chapter[]
  activeChapterId: string
  onSelectChapter: (id: string) => void
  onCreateScene: (chapterId: string) => void
}

function ChapterList({
  chapters,
  activeChapterId,
  onSelectChapter,
  onCreateScene
}: ChapterListProps) {
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(new Set())

  const rootChapters = chapters
    .filter((document) => document.type === 'chapter' && document.parentId === null)
    .sort((first, second) => first.order - second.order)

  useEffect(() => {
    setExpandedChapterIds((currentIds) => {
      const nextIds = new Set(currentIds)

      rootChapters.forEach((chapter) => {
        if (!nextIds.has(chapter.id)) {
          nextIds.add(chapter.id)
        }
      })

      return nextIds
    })
  }, [chapters])

  function toggleChapter(chapterId: string) {
    setExpandedChapterIds((currentIds) => {
      const nextIds = new Set(currentIds)

      if (nextIds.has(chapterId)) {
        nextIds.delete(chapterId)
      } else {
        nextIds.add(chapterId)
      }

      return nextIds
    })
  }

  return (
    <div className="chapters">
      {rootChapters.map((chapter, chapterIndex) => {
        const scenes = chapters
          .filter((document) => document.type === 'scene' && document.parentId === chapter.id)
          .sort((first, second) => first.order - second.order)

        const expanded = expandedChapterIds.has(chapter.id)

        return (
          <div key={chapter.id} className="document-group">
            <div className="document-row">
              <button
                type="button"
                className="chapter-toggle"
                onClick={() => toggleChapter(chapter.id)}
                title={expanded ? 'Recolher capítulo' : 'Expandir capítulo'}
              >
                {expanded ? '▾' : '▸'}
              </button>

              <button
                type="button"
                className={`chapter document-title ${
                  chapter.id === activeChapterId ? 'active' : ''
                }`}
                onClick={() => onSelectChapter(chapter.id)}
              >
                <span>▤</span>

                <span>{chapter.title || `Capítulo ${chapterIndex + 1}`}</span>
              </button>

              <button
                type="button"
                className="document-add-button"
                onClick={() => {
                  setExpandedChapterIds((currentIds) => {
                    const nextIds = new Set(currentIds)
                    nextIds.add(chapter.id)
                    return nextIds
                  })

                  onCreateScene(chapter.id)
                }}
                title="Nova cena"
              >
                +
              </button>
            </div>

            {expanded && (
              <div className="scene-list">
                {scenes.map((scene, sceneIndex) => (
                  <button
                    key={scene.id}
                    type="button"
                    className={`chapter scene ${scene.id === activeChapterId ? 'active' : ''}`}
                    onClick={() => onSelectChapter(scene.id)}
                  >
                    <span>◦</span>

                    <span>{scene.title || `Cena ${sceneIndex + 1}`}</span>
                  </button>
                ))}

                {scenes.length === 0 && <p className="scene-empty">Nenhuma cena</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ChapterList
