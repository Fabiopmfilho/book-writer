import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import './assets/main.css'

import CharacterEditor from './components/CharacterEditor'
import Editor from './components/Editor'
import HomePage from './components/HomePage'
import Inspector from './components/Inspector'
import LocationEditor from './components/LocationEditor'
import Sidebar from './components/Sidebar'
import { db } from './database/db'
import type { CharacterRecord, LocationRecord } from './database/models'
import { updateEntityReferences } from './database/references'
import { ensureInitialBook } from './database/seed'
import type { Chapter } from './types/book'

type Selection =
  | { type: 'home' }
  | { type: 'document'; id: string }
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
        setSelection({ type: 'home' })
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

  const documents = useLiveQuery(
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
    if (!selection) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelection({ type: 'home' })
      return
    }

    const documentMissing =
      selection.type === 'document' && !documents.some((document) => document.id === selection.id)

    const characterMissing =
      selection.type === 'character' &&
      !characters.some((character) => character.id === selection.id)

    const locationMissing =
      selection.type === 'location' && !locations.some((location) => location.id === selection.id)

    if (documentMissing || characterMissing || locationMissing) {
      setSelection({ type: 'home' })
    }
  }, [documents, characters, locations, selection])

  const activeDocument =
    selection?.type === 'document'
      ? documents.find((document) => document.id === selection.id)
      : undefined

  const activeCharacter =
    selection?.type === 'character'
      ? characters.find((character) => character.id === selection.id)
      : undefined

  const activeLocation =
    selection?.type === 'location'
      ? locations.find((location) => location.id === selection.id)
      : undefined

  const plainText = activeDocument
    ? (new DOMParser()
        .parseFromString(activeDocument.content, 'text/html')
        .body.textContent?.trim() ?? '')
    : ''

  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const characterCount = plainText.length

  async function updateDocument(
    field: keyof Pick<Chapter, 'title' | 'content' | 'notes'>,
    value: string
  ) {
    if (!activeDocument) return

    await db.documents.update(activeDocument.id, {
      [field]: value,
      updatedAt: new Date()
    })
  }

  async function createChapter() {
    if (!activeBookId) return

    const rootChapters = documents.filter(
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
    setSelection({ type: 'document', id: chapter.id })
  }

  async function createScene(parentChapterId: string) {
    if (!activeBookId) return

    const siblingScenes = documents.filter(
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
    setSelection({ type: 'document', id: scene.id })
  }

  async function deleteDocument(documentId: string) {
    const documentRecord = documents.find((document) => document.id === documentId)

    if (!documentRecord) return

    const childScenes =
      documentRecord.type === 'chapter'
        ? documents.filter((document) => document.parentId === documentRecord.id)
        : []

    const message =
      documentRecord.type === 'chapter'
        ? childScenes.length > 0
          ? `Excluir "${documentRecord.title}" e suas ${childScenes.length} cenas?`
          : `Excluir o capítulo "${documentRecord.title}"?`
        : `Excluir a cena "${documentRecord.title}"?`

    if (!window.confirm(message)) {
      return
    }

    const deletedIds = new Set([documentRecord.id, ...childScenes.map((scene) => scene.id)])

    await db.transaction('rw', db.documents, async () => {
      if (childScenes.length > 0) {
        await db.documents.bulkDelete(childScenes.map((scene) => scene.id))
      }

      await db.documents.delete(documentRecord.id)

      const remainingDocuments = await db.documents
        .where('bookId')
        .equals(documentRecord.bookId)
        .toArray()

      const siblings = remainingDocuments
        .filter(
          (document) =>
            document.type === documentRecord.type && document.parentId === documentRecord.parentId
        )
        .sort((first, second) => first.order - second.order)

      for (const [index, sibling] of siblings.entries()) {
        if (sibling.order !== index) {
          await db.documents.update(sibling.id, {
            order: index,
            updatedAt: new Date()
          })
        }
      }
    })

    if (selection?.type === 'document' && deletedIds.has(selection.id)) {
      setSelection({ type: 'home' })
    }
  }

  async function reorderDocuments(documentIds: string[]) {
    const now = new Date()

    await db.transaction('rw', db.documents, async () => {
      for (const [index, documentId] of documentIds.entries()) {
        await db.documents.update(documentId, {
          order: index,
          updatedAt: now
        })
      }
    })
  }

  async function moveScene(sceneId: string, targetChapterId: string) {
    const scene = documents.find((document) => document.id === sceneId && document.type === 'scene')

    const targetChapter = documents.find(
      (document) => document.id === targetChapterId && document.type === 'chapter'
    )

    if (!scene || !targetChapter || scene.parentId === targetChapterId) {
      return
    }

    const sourceScenes = documents
      .filter(
        (document) =>
          document.type === 'scene' &&
          document.parentId === scene.parentId &&
          document.id !== scene.id
      )
      .sort((first, second) => first.order - second.order)

    const targetScenes = documents
      .filter((document) => document.type === 'scene' && document.parentId === targetChapterId)
      .sort((first, second) => first.order - second.order)

    const now = new Date()

    await db.transaction('rw', db.documents, async () => {
      for (const [index, sourceScene] of sourceScenes.entries()) {
        await db.documents.update(sourceScene.id, {
          order: index,
          updatedAt: now
        })
      }

      await db.documents.update(scene.id, {
        parentId: targetChapterId,
        order: targetScenes.length,
        updatedAt: now
      })
    })
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
        homeActive={selection?.type === 'home'}
        onSelectHome={() => setSelection({ type: 'home' })}
        bookTitle={book.title}
        chapters={documents}
        characters={characters}
        locations={locations}
        activeChapterId={selection?.type === 'document' ? selection.id : null}
        activeCharacterId={selection?.type === 'character' ? selection.id : null}
        activeLocationId={selection?.type === 'location' ? selection.id : null}
        onSelectChapter={(id) => setSelection({ type: 'document', id })}
        onSelectCharacter={(id) => setSelection({ type: 'character', id })}
        onSelectLocation={(id) => setSelection({ type: 'location', id })}
        onCreateChapter={() => void createChapter()}
        onCreateScene={(chapterId) => void createScene(chapterId)}
        onDeleteDocument={(documentId) => void deleteDocument(documentId)}
        onCreateCharacter={() => void createCharacter()}
        onCreateLocation={() => void createLocation()}
        onReorderDocuments={(documentIds) => void reorderDocuments(documentIds)}
        onMoveScene={(sceneId, targetChapterId) => void moveScene(sceneId, targetChapterId)}
      />

      {selection?.type === 'home' && (
        <>
          <HomePage
            documents={documents}
            onOpenChapter={(id) => setSelection({ type: 'document', id })}
            onCreateChapter={() => void createChapter()}
          />

          <aside className="inspector">
            <div className="inspector-header">
              <h2>Projeto</h2>
            </div>

            <div className="inspector-section">
              <label>Capítulos</label>

              <strong>
                {
                  documents.filter(
                    (document) => document.type === 'chapter' && document.parentId === null
                  ).length
                }
              </strong>
            </div>

            <div className="inspector-section">
              <label>Cenas</label>

              <strong>{documents.filter((document) => document.type === 'scene').length}</strong>
            </div>

            <div className="inspector-section">
              <label>Personagens</label>
              <strong>{characters.length}</strong>
            </div>

            <div className="inspector-section">
              <label>Lugares</label>
              <strong>{locations.length}</strong>
            </div>
          </aside>
        </>
      )}

      {activeDocument && (
        <>
          <Editor
            key={activeDocument.id}
            chapter={activeDocument}
            characters={characters}
            locations={locations}
            wordCount={wordCount}
            onUpdate={(field, value) => updateDocument(field, value)}
            onOpenReference={openReference}
          />

          <Inspector
            chapter={activeDocument}
            wordCount={wordCount}
            characterCount={characterCount}
            onUpdateNotes={(notes) => void updateDocument('notes', notes)}
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
