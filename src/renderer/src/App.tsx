import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import './assets/main.css'

import CharacterEditor from './components/CharacterEditor'
import Editor from './components/Editor'
import Inspector from './components/Inspector'
import Sidebar from './components/Sidebar'
import { db } from './database/db'
import type { CharacterRecord } from './database/models'
import { ensureInitialBook } from './database/seed'
import type { Chapter } from './types/book'
import { updateCharacterReferences } from './database/references'

type Selection = { type: 'chapter'; id: string } | { type: 'character'; id: string }

function App() {
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)

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
    async (): Promise<Chapter[]> => {
      if (!activeBookId) {
        return []
      }

      return db.documents.where('bookId').equals(activeBookId).sortBy('order')
    },
    [activeBookId],
    [] as Chapter[]
  )

  const characters = useLiveQuery(
    async (): Promise<CharacterRecord[]> => {
      if (!activeBookId) {
        return []
      }

      return db.characters.where('bookId').equals(activeBookId).sortBy('name')
    },
    [activeBookId],
    [] as CharacterRecord[]
  )

  useEffect(() => {
    if (!selection && chapters.length > 0) {
      setSelection({ type: 'chapter', id: chapters[0].id })
      return
    }

    if (
      selection?.type === 'chapter' &&
      !chapters.some((chapter) => chapter.id === selection.id) &&
      chapters.length > 0
    ) {
      setSelection({ type: 'chapter', id: chapters[0].id })
    }

    if (
      selection?.type === 'character' &&
      !characters.some((character) => character.id === selection.id) &&
      chapters.length > 0
    ) {
      setSelection({ type: 'chapter', id: chapters[0].id })
    }
  }, [chapters, characters, selection])

  const activeChapter =
    selection?.type === 'chapter'
      ? chapters.find((chapter) => chapter.id === selection.id)
      : undefined

  const activeCharacter =
    selection?.type === 'character'
      ? characters.find((character) => character.id === selection.id)
      : undefined

  const plainText = activeChapter
    ? (new DOMParser()
        .parseFromString(activeChapter.content, 'text/html')
        .body.textContent?.trim() ?? '')
    : ''

  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const characterCount = plainText.length

  async function updateChapter(
    field: keyof Pick<Chapter, 'title' | 'content' | 'notes'>,
    value: string
  ) {
    if (!activeChapter) {
      return
    }

    await db.documents.update(activeChapter.id, {
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
    setSelection({ type: 'chapter', id: chapter.id })
  }

  async function createCharacter() {
    if (!activeBookId) {
      return
    }

    const now = new Date()

    const character: CharacterRecord = {
      id: crypto.randomUUID(),
      bookId: activeBookId,
      name: `Personagem ${characters.length + 1}`,
      description: '',
      createdAt: now,
      updatedAt: now
    }

    await db.characters.add(character)
    setSelection({ type: 'character', id: character.id })
  }

  async function updateCharacter(
    field: keyof Pick<CharacterRecord, 'name' | 'description'>,
    value: string
  ) {
    if (!activeCharacter) {
      return
    }

    await db.characters.update(activeCharacter.id, {
      [field]: value,
      updatedAt: new Date()
    })
  }

  async function commitCharacterName() {
    if (!activeCharacter) {
      return
    }

    await updateCharacterReferences(activeCharacter.id, activeCharacter.name)
  }

  if (!book) {
    return <div className="app-loading">Carregando livro...</div>
  }

  return (
    <div className="app">
      <Sidebar
        bookTitle={book.title}
        chapters={chapters}
        characters={characters}
        activeChapterId={selection?.type === 'chapter' ? selection.id : null}
        activeCharacterId={selection?.type === 'character' ? selection.id : null}
        onSelectChapter={(id) => setSelection({ type: 'chapter', id })}
        onSelectCharacter={(id) => setSelection({ type: 'character', id })}
        onCreateChapter={() => void createChapter()}
        onCreateCharacter={() => void createCharacter()}
      />

      {activeChapter && (
        <>
          <Editor
            chapter={activeChapter}
            characters={characters}
            wordCount={wordCount}
            onUpdate={(field, value) => void updateChapter(field, value)}
          />

          <Inspector
            chapter={activeChapter}
            wordCount={wordCount}
            characterCount={characterCount}
            onUpdateNotes={(notes) => void updateChapter('notes', notes)}
          />
        </>
      )}

      {activeCharacter && (
        <>
          <CharacterEditor
            character={activeCharacter}
            onUpdate={(field, value) => void updateCharacter(field, value)}
            onCommitName={() => void commitCharacterName()}
          />

          <aside className="inspector">
            <div className="inspector-header">
              <h2>Referências</h2>
            </div>

            <div className="inspector-section">
              <label>Como mencionar</label>
              <strong className="reference-name">@{activeCharacter.name}</strong>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

export default App
