import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import './assets/main.css'

import CharacterEditor from './components/CharacterEditor'
import Editor from './components/Editor'
import Inspector from './components/Inspector'
import LocationEditor from './components/LocationEditor'
import Sidebar from './components/Sidebar'
import { db } from './database/db'
import type { CharacterRecord, LocationRecord } from './database/models'
import { updateEntityReferences } from './database/references'
import { ensureInitialBook } from './database/seed'
import type { Chapter } from './types/book'

type Selection =
  | { type: 'chapter'; id: string }
  | { type: 'character'; id: string }
  | { type: 'location'; id: string }

function App() {
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [inspectorVisible, setInspectorVisible] = useState(true)

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

  const locations = useLiveQuery(
    async (): Promise<LocationRecord[]> => {
      if (!activeBookId) {
        return []
      }

      return db.locations.where('bookId').equals(activeBookId).sortBy('name')
    },
    [activeBookId],
    [] as LocationRecord[]
  )

  useEffect(() => {
    if (!selection && chapters.length > 0) {
      setSelection({ type: 'chapter', id: chapters[0].id })
      return
    }

    const chapterMissing =
      selection?.type === 'chapter' && !chapters.some((chapter) => chapter.id === selection.id)

    const characterMissing =
      selection?.type === 'character' &&
      !characters.some((character) => character.id === selection.id)

    const locationMissing =
      selection?.type === 'location' && !locations.some((location) => location.id === selection.id)

    if ((chapterMissing || characterMissing || locationMissing) && chapters.length > 0) {
      setSelection({ type: 'chapter', id: chapters[0].id })
    }
  }, [chapters, characters, locations, selection])

  const activeChapter =
    selection?.type === 'chapter'
      ? chapters.find((chapter) => chapter.id === selection.id)
      : undefined

  const activeCharacter =
    selection?.type === 'character'
      ? characters.find((character) => character.id === selection.id)
      : undefined

  const activeLocation =
    selection?.type === 'location'
      ? locations.find((location) => location.id === selection.id)
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
    if (!activeChapter) return

    await db.documents.update(activeChapter.id, {
      [field]: value,
      updatedAt: new Date()
    })
  }

  async function createChapter() {
    if (!activeBookId) return

    const rootChapters = chapters.filter(
      (document) => document.type === 'chapter' && document.parentId === null
    )

    const now = new Date()

    const chapter: Chapter = {
      id: crypto.randomUUID(),
      bookId: activeBookId,
      parentId: null,
      type: 'chapter',
      title: `Capítulo ${rootChapters.length + 1}`,
      content: '',
      notes: '',
      order: rootChapters.length,
      createdAt: now,
      updatedAt: now
    }

    await db.documents.add(chapter)
    setSelection({ type: 'chapter', id: chapter.id })
  }

  async function createScene(parentChapterId: string) {
    if (!activeBookId) return

    const siblingScenes = chapters.filter(
      (document) => document.type === 'scene' && document.parentId === parentChapterId
    )

    const now = new Date()

    const scene: Chapter = {
      id: crypto.randomUUID(),
      bookId: activeBookId,
      parentId: parentChapterId,
      type: 'scene',
      title: `Cena ${siblingScenes.length + 1}`,
      content: '',
      notes: '',
      order: siblingScenes.length,
      createdAt: now,
      updatedAt: now
    }

    await db.documents.add(scene)
    setSelection({ type: 'chapter', id: scene.id })
  }

  async function createCharacter() {
    if (!activeBookId) return

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
    if (!activeCharacter) return

    await db.characters.update(activeCharacter.id, {
      [field]: value,
      updatedAt: new Date()
    })
  }

  async function commitCharacterName() {
    if (!activeCharacter) return

    await updateEntityReferences(activeCharacter.id, activeCharacter.name)
  }

  async function commitLocationName() {
    if (!activeLocation) return

    await updateEntityReferences(activeLocation.id, activeLocation.name)
  }

  function openReference(entityId: string) {
    if (characters.some((character) => character.id === entityId)) {
      setSelection({ type: 'character', id: entityId })
      return
    }

    if (locations.some((location) => location.id === entityId)) {
      setSelection({ type: 'location', id: entityId })
    }
  }

  async function createLocation() {
    if (!activeBookId) return

    const now = new Date()

    const location: LocationRecord = {
      id: crypto.randomUUID(),
      bookId: activeBookId,
      name: `Lugar ${locations.length + 1}`,
      description: '',
      createdAt: now,
      updatedAt: now
    }

    await db.locations.add(location)
    setSelection({ type: 'location', id: location.id })
  }

  async function updateLocation(
    field: keyof Pick<LocationRecord, 'name' | 'description'>,
    value: string
  ) {
    if (!activeLocation) return

    await db.locations.update(activeLocation.id, {
      [field]: value,
      updatedAt: new Date()
    })
  }

  if (!book) {
    return <div className="app-loading">Carregando livro...</div>
  }

  const appClassName = [
    'app',
    !sidebarVisible ? 'sidebar-hidden' : '',
    !inspectorVisible ? 'inspector-hidden' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={appClassName}>
      <button
        type="button"
        className="panel-toggle sidebar-panel-toggle"
        onClick={() => setSidebarVisible((visible) => !visible)}
        title={sidebarVisible ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
        aria-label={sidebarVisible ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
      >
        {sidebarVisible ? '‹‹' : '››'}
      </button>

      <button
        type="button"
        className="panel-toggle inspector-panel-toggle"
        onClick={() => setInspectorVisible((visible) => !visible)}
        title={inspectorVisible ? 'Ocultar inspetor' : 'Mostrar inspetor'}
        aria-label={inspectorVisible ? 'Ocultar inspetor' : 'Mostrar inspetor'}
      >
        {inspectorVisible ? '››' : '‹‹'}
      </button>

      <Sidebar
        bookTitle={book.title}
        chapters={chapters}
        characters={characters}
        locations={locations}
        activeChapterId={selection?.type === 'chapter' ? selection.id : null}
        activeCharacterId={selection?.type === 'character' ? selection.id : null}
        activeLocationId={selection?.type === 'location' ? selection.id : null}
        onSelectChapter={(id) => setSelection({ type: 'chapter', id })}
        onSelectCharacter={(id) => setSelection({ type: 'character', id })}
        onSelectLocation={(id) => setSelection({ type: 'location', id })}
        onCreateChapter={() => void createChapter()}
        onCreateScene={(chapterId) => void createScene(chapterId)}
        onCreateCharacter={() => void createCharacter()}
        onCreateLocation={() => void createLocation()}
      />

      {activeChapter && (
        <>
          <Editor
            key={activeChapter.id}
            chapter={activeChapter}
            characters={characters}
            locations={locations}
            wordCount={wordCount}
            onUpdate={(field, value) => updateChapter(field, value)}
            onOpenReference={openReference}
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

      {activeLocation && (
        <>
          <LocationEditor
            key={activeLocation.id}
            location={activeLocation}
            characters={characters}
            onUpdate={(field, value) => updateLocation(field, value)}
            onCommitName={() => void commitLocationName()}
            onOpenCharacter={(characterId) =>
              setSelection({
                type: 'character',
                id: characterId
              })
            }
          />

          <aside className="inspector">
            <div className="inspector-header">
              <h2>Referências</h2>
            </div>

            <div className="inspector-section">
              <label>Como mencionar</label>
              <strong className="reference-name">#{activeLocation.name}</strong>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

export default App
