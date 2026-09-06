import { useState } from 'react'

import './assets/main.css'

import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import Inspector from './components/Inspector'

import type { Book, Chapter } from './types/book'

const initialBook: Book = {
  id: crypto.randomUUID(),
  title: 'Meu Livro',

  chapters: [
    {
      id: crypto.randomUUID(),
      title: 'Capítulo 1',
      content: '',
      notes: ''
    },
    {
      id: crypto.randomUUID(),
      title: 'Capítulo 2',
      content: '',
      notes: ''
    },
    {
      id: crypto.randomUUID(),
      title: 'Capítulo 3',
      content: '',
      notes: ''
    }
  ]
}

function App() {
  const [book, setBook] = useState<Book>(initialBook)

  const [activeChapterId, setActiveChapterId] = useState(book.chapters[0].id)

  const activeChapter = book.chapters.find((chapter) => chapter.id === activeChapterId)

  const wordCount = activeChapter?.content.trim()
    ? activeChapter.content.trim().split(/\s+/).length
    : 0

  const characterCount = activeChapter?.content.length ?? 0

  function updateChapter(field: keyof Pick<Chapter, 'title' | 'content' | 'notes'>, value: string) {
    setBook((currentBook) => ({
      ...currentBook,

      chapters: currentBook.chapters.map((chapter) =>
        chapter.id === activeChapterId
          ? {
              ...chapter,
              [field]: value
            }
          : chapter
      )
    }))
  }

  function createChapter() {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: `Capítulo ${book.chapters.length + 1}`,
      content: '',
      notes: ''
    }

    setBook((currentBook) => ({
      ...currentBook,

      chapters: [...currentBook.chapters, newChapter]
    }))

    setActiveChapterId(newChapter.id)
  }

  if (!activeChapter) {
    return null
  }

  return (
    <div className="app">
      <Sidebar
        bookTitle={book.title}
        chapters={book.chapters}
        activeChapterId={activeChapterId}
        onSelectChapter={setActiveChapterId}
        onCreateChapter={createChapter}
      />

      <Editor
        chapter={activeChapter}
        wordCount={wordCount}
        onUpdate={(field, value) => updateChapter(field, value)}
      />

      <Inspector
        chapter={activeChapter}
        wordCount={wordCount}
        characterCount={characterCount}
        onUpdateNotes={(notes) => updateChapter('notes', notes)}
      />
    </div>
  )
}

export default App
