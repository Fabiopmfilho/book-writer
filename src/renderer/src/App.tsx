import { useEffect, useState } from 'react'

import './assets/main.css'

import CharacterEditor from './components/editor/CharacterEditor'
import Editor from './components/editor/Editor'
import LocationEditor from './components/editor/LocationEditor'

import Sidebar from './components/sidebar/Sidebar'

import type { CharacterEditableField, LocationEditableField } from './database/models'

import { useBookData } from './hooks/useBookData'

import {
  createChapterRecord,
  createSceneRecord,
  getDocumentDeletionMessage,
  moveSceneRecord,
  removeDocumentRecord,
  reorderDocumentRecords,
  updateDocumentRecord
} from './services/documentService'

import {
  commitCharacterNameRecord,
  commitLocationNameRecord,
  createCharacterRecord,
  createLocationRecord,
  removeCharacterRecord,
  removeLocationRecord,
  updateCharacterRecord,
  updateLocationRecord
} from './services/entityService'

import type { Chapter } from './types/book'
import HomePage from './components/HomePage'
import Inspector from './components/Inspector'

type Selection =
  | { type: 'home' }
  | { type: 'document'; id: string }
  | { type: 'character'; id: string }
  | { type: 'location'; id: string }

function App() {
  const [selection, setSelection] = useState<Selection>({
    type: 'home'
  })
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [inspectorVisible, setInspectorVisible] = useState(false)

  const { activeBookId, book, documents, characters, locations, loading } = useBookData()

  useEffect(() => {
    const documentMissing =
      selection.type === 'document' && !documents.some((document) => document.id === selection.id)

    const characterMissing =
      selection.type === 'character' &&
      !characters.some((character) => character.id === selection.id)

    const locationMissing =
      selection.type === 'location' && !locations.some((location) => location.id === selection.id)

    if (documentMissing || characterMissing || locationMissing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelection({ type: 'home' })
    }
  }, [documents, characters, locations, selection])

  const activeDocument =
    selection.type === 'document'
      ? documents.find((document) => document.id === selection.id)
      : undefined

  const activeCharacter =
    selection.type === 'character'
      ? characters.find((character) => character.id === selection.id)
      : undefined

  const activeLocation =
    selection.type === 'location'
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

    await updateDocumentRecord(activeDocument.id, field, value)
  }

  async function createChapter() {
    if (!activeBookId) return

    const chapter = await createChapterRecord(activeBookId, documents)

    setSelection({
      type: 'document',
      id: chapter.id
    })
  }

  async function createScene(parentChapterId: string) {
    if (!activeBookId) return

    const scene = await createSceneRecord(activeBookId, parentChapterId, documents)

    setSelection({
      type: 'document',
      id: scene.id
    })
  }

  async function deleteDocument(documentId: string) {
    const message = getDocumentDeletionMessage(documentId, documents)

    if (!message || !window.confirm(message)) {
      return
    }

    const deletedIds = await removeDocumentRecord(documentId, documents)

    if (selection.type === 'document' && deletedIds.has(selection.id)) {
      setSelection({ type: 'home' })
    }
  }

  async function reorderDocuments(documentIds: string[]) {
    await reorderDocumentRecords(documentIds)
  }

  async function moveScene(sceneId: string, targetChapterId: string) {
    await moveSceneRecord(sceneId, targetChapterId, documents)
  }

  async function createCharacter() {
    if (!activeBookId) return

    const character = await createCharacterRecord(activeBookId, characters.length)

    setSelection({
      type: 'character',
      id: character.id
    })
  }

  async function updateCharacter(field: CharacterEditableField, value: string) {
    if (!activeCharacter) return

    await updateCharacterRecord(activeCharacter.id, field, value)
  }

  async function commitCharacterName() {
    if (!activeCharacter) return

    await commitCharacterNameRecord(activeCharacter.id, activeCharacter.name)
  }

  async function createLocation() {
    if (!activeBookId) return

    const location = await createLocationRecord(activeBookId, locations.length)

    setSelection({
      type: 'location',
      id: location.id
    })
  }

  async function updateLocation(field: LocationEditableField, value: string) {
    if (!activeLocation) return

    await updateLocationRecord(activeLocation.id, field, value)
  }

  async function commitLocationName() {
    if (!activeLocation) return

    await commitLocationNameRecord(activeLocation.id, activeLocation.name)
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

  if (loading || !book) {
    return <div className="app-loading">Carregando livro...</div>
  }

  const appClassName = [
    'app',
    !sidebarVisible ? 'sidebar-hidden' : '',
    !inspectorVisible ? 'inspector-hidden' : ''
  ]
    .filter(Boolean)
    .join(' ')

  async function deleteCharacter(characterId: string) {
    const character = characters.find((currentCharacter) => currentCharacter.id === characterId)

    if (!character) return

    const name = character.name || 'Personagem sem nome'

    if (
      !window.confirm(
        `Excluir o personagem "${name}"?\n\nAs menções existentes permanecerão no texto, mas não abrirão mais a ficha.`
      )
    ) {
      return
    }

    await removeCharacterRecord(characterId)

    if (selection.type === 'character' && selection.id === characterId) {
      setSelection({ type: 'home' })
    }
  }

  async function deleteLocation(locationId: string) {
    const location = locations.find((currentLocation) => currentLocation.id === locationId)

    if (!location) return

    const name = location.name || 'Lugar sem nome'

    if (
      !window.confirm(
        `Excluir o lugar "${name}"?\n\nAs menções existentes permanecerão no texto, mas não abrirão mais a ficha.`
      )
    ) {
      return
    }

    await removeLocationRecord(locationId)

    if (selection.type === 'location' && selection.id === locationId) {
      setSelection({ type: 'home' })
    }
  }

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
        homeActive={selection.type === 'home'}
        onSelectHome={() => setSelection({ type: 'home' })}
        bookTitle={book.title}
        chapters={documents}
        characters={characters}
        locations={locations}
        activeChapterId={selection.type === 'document' ? selection.id : null}
        activeCharacterId={selection.type === 'character' ? selection.id : null}
        activeLocationId={selection.type === 'location' ? selection.id : null}
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
        onDeleteCharacter={(characterId) => void deleteCharacter(characterId)}
        onDeleteLocation={(locationId) => void deleteLocation(locationId)}
      />

      {selection.type === 'home' && (
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
            key={activeCharacter.id}
            character={activeCharacter}
            characters={characters}
            locations={locations}
            documents={documents}
            onOpenDocument={(documentId) =>
              setSelection({
                type: 'document',
                id: documentId
              })
            }
            onUpdate={(field, value) => updateCharacter(field, value)}
            onCommitName={() => commitCharacterName()}
            onOpenReference={openReference}
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
            documents={documents}
            characters={characters}
            locations={locations}
            onUpdate={(field, value) => updateLocation(field, value)}
            onCommitName={() => commitLocationName()}
            onOpenDocument={(documentId) =>
              setSelection({
                type: 'document',
                id: documentId
              })
            }
            onOpenReference={openReference}
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
