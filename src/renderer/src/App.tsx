import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import './assets/main.css'

import Editor from './components/Editor'
import Inspector from './components/Inspector'
import Sidebar from './components/Sidebar'
import { db } from './database/db'
import { ensureInitialBook } from './database/seed'
import type { Chapter } from './types/book'

function App() {
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    void ensureInitialBook().then((bookId) => {
      if (mounted) {
        setActiveBookId(bookId)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  const book = useLiveQuery(() => {
    if (!activeBookId) {
      return undefined
    }

    return db.books.get(activeBookId)
  }, [activeBookId])

  const chapters = useLiveQuery(
    () => {
      if (!activeBookId) {
        return Promise.resolve([])
      }

      return db.documents.where('bookId').equals(activeBookId).sortBy('order')
    },
    [activeBookId],
    []
  )

  useEffect(() => {
    if (chapters.length > 0 && !chapters.some((chapter) => chapter.id === activeChapterId)) {
      setActiveChapterId(chapters[0].id)
    }
  }, [chapters, activeChapterId])

  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId)

  const wordCount = activeChapter?.content.trim()
    ? activeChapter.content.trim().split(/\s+/).length
    : 0

  const characterCount = activeChapter?.content.length ?? 0

  async function updateChapter(
    field: keyof Pick<Chapter, 'title' | 'content' | 'notes'>,
    value: string
  ) {
    if (!activeChapterId) {
      return
    }

    await db.documents.update(activeChapterId, {
      [field]: value,
      updatedAt: new Date()
    })
  }

  async function createChapter() {
    if (!activeBookId) {
      return
    }

    const chapter: Chapter = {
      id: crypto.randomUUID(),
      bookId: activeBookId,
      parentId: null,
      type: 'chapter',
      title: `Capítulo ${chapters.length + 1}`,
      content: '',
      notes: '',
      order: chapters.length,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await db.documents.add(chapter)
    setActiveChapterId(chapter.id)
  }

  if (!book || !activeChapter) {
    return <div className="app-loading">Carregando livro...</div>
  }

  return (
    <div className="app">
      <Sidebar
        bookTitle={book.title}
        chapters={chapters}
        activeChapterId={activeChapter.id}
        onSelectChapter={setActiveChapterId}
        onCreateChapter={() => void createChapter()}
      />

      <Editor
        chapter={activeChapter}
        wordCount={wordCount}
        onUpdate={(field, value) => void updateChapter(field, value)}
      />

      <Inspector
        chapter={activeChapter}
        wordCount={wordCount}
        characterCount={characterCount}
        onUpdateNotes={(notes) => void updateChapter('notes', notes)}
      />
    </div>
  )
}

export default App
