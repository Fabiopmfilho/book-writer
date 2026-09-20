import { useMemo } from 'react'

import type { CharacterRecord, DocumentRecord, LocationRecord } from '../../database/models'

type ReferenceSourceType = 'document' | 'character' | 'location'

type EntityReference = {
  key: string
  sourceId: string
  sourceType: ReferenceSourceType
  sourceTitle: string
  sourceLabel: string
  context: string
}

type EntityReferencesProps = {
  entityId: string
  documents: DocumentRecord[]
  characters: CharacterRecord[]
  locations: LocationRecord[]
  onOpenDocument: (documentId: string) => void
  onOpenReference: (entityId: string) => void
}

function findMentionContext(html: string, entityId: string): string | null {
  if (!html) return null

  const parsedDocument = new DOMParser().parseFromString(html, 'text/html')

  const mentions = Array.from(
    parsedDocument.querySelectorAll<HTMLElement>('[data-type="mention"][data-id]')
  )

  const mention = mentions.find((currentMention) => currentMention.dataset.id === entityId)

  if (!mention) {
    return null
  }

  const text = parsedDocument.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''

  if (!text) {
    return 'Referência encontrada'
  }

  const mentionText = mention.textContent?.trim() ?? ''
  const mentionIndex = mentionText ? text.indexOf(mentionText) : -1

  if (mentionIndex < 0) {
    return text.length > 150 ? `${text.slice(0, 150)}…` : text
  }

  const contextStart = Math.max(0, mentionIndex - 60)
  const contextEnd = Math.min(text.length, mentionIndex + mentionText.length + 90)

  const prefix = contextStart > 0 ? '…' : ''
  const suffix = contextEnd < text.length ? '…' : ''

  return `${prefix}${text.slice(contextStart, contextEnd)}${suffix}`
}

function EntityReferences({
  entityId,
  documents,
  characters,
  locations,
  onOpenDocument,
  onOpenReference
}: EntityReferencesProps) {
  const references = useMemo(() => {
    const results: EntityReference[] = []

    for (const document of documents) {
      const context = findMentionContext(document.content, entityId)

      if (!context) continue

      results.push({
        key: `document-${document.id}`,
        sourceId: document.id,
        sourceType: 'document',
        sourceTitle:
          document.title || (document.type === 'scene' ? 'Cena sem título' : 'Capítulo sem título'),
        sourceLabel: document.type === 'scene' ? 'Cena' : 'Capítulo',
        context
      })
    }

    for (const character of characters) {
      if (character.id === entityId) continue

      const descriptionContext = findMentionContext(character.description, entityId)

      if (descriptionContext) {
        results.push({
          key: `character-${character.id}-description`,
          sourceId: character.id,
          sourceType: 'character',
          sourceTitle: character.name || 'Personagem sem nome',
          sourceLabel: 'Personagem · Resumo',
          context: descriptionContext
        })
      }

      const notesContext = findMentionContext(character.notes, entityId)

      if (notesContext) {
        results.push({
          key: `character-${character.id}-notes`,
          sourceId: character.id,
          sourceType: 'character',
          sourceTitle: character.name || 'Personagem sem nome',
          sourceLabel: 'Personagem · Notas',
          context: notesContext
        })
      }
    }

    for (const location of locations) {
      if (location.id === entityId) continue

      const descriptionContext = findMentionContext(location.description, entityId)

      if (descriptionContext) {
        results.push({
          key: `location-${location.id}-description`,
          sourceId: location.id,
          sourceType: 'location',
          sourceTitle: location.name || 'Lugar sem nome',
          sourceLabel: 'Lugar · Descrição',
          context: descriptionContext
        })
      }

      const notesContext = findMentionContext(location.notes, entityId)

      if (notesContext) {
        results.push({
          key: `location-${location.id}-notes`,
          sourceId: location.id,
          sourceType: 'location',
          sourceTitle: location.name || 'Lugar sem nome',
          sourceLabel: 'Lugar · Notas',
          context: notesContext
        })
      }
    }

    return results
  }, [entityId, documents, characters, locations])

  function openReference(reference: EntityReference) {
    if (reference.sourceType === 'document') {
      onOpenDocument(reference.sourceId)
      return
    }

    onOpenReference(reference.sourceId)
  }

  if (references.length === 0) {
    return (
      <div className="entity-references-empty">
        <span>⌕</span>
        <h3>Nenhuma referência encontrada</h3>
        <p>
          Quando esta entidade for mencionada em um capítulo, cena ou ficha, a referência aparecerá
          aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="entity-references">
      <div className="entity-references-summary">
        {references.length}{' '}
        {references.length === 1 ? 'referência encontrada' : 'referências encontradas'}
      </div>

      <div className="entity-reference-list">
        {references.map((reference) => (
          <button
            key={reference.key}
            type="button"
            className="entity-reference-card"
            onClick={() => openReference(reference)}
          >
            <span className="entity-reference-type">{reference.sourceLabel}</span>

            <strong>{reference.sourceTitle}</strong>

            <p>{reference.context}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default EntityReferences
