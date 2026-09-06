import { db } from './db'

function replaceReferenceName(
  content: string,
  entityId: string,
  entityName: string
): string | null {
  if (!content.includes(entityId)) {
    return null
  }

  const parsedContent = new DOMParser().parseFromString(content, 'text/html')

  const mentions = parsedContent.querySelectorAll('[data-type="mention"]')

  let changed = false

  mentions.forEach((mention) => {
    if (mention.getAttribute('data-id') !== entityId) {
      return
    }

    mention.setAttribute('data-label', entityName)
    mention.textContent = entityName
    changed = true
  })

  return changed ? parsedContent.body.innerHTML : null
}

export async function updateEntityReferences(entityId: string, newName: string): Promise<void> {
  const displayName = newName.trim() || 'Sem nome'
  const documents = await db.documents.toArray()
  const locations = await db.locations.toArray()
  const now = new Date()

  await db.transaction('rw', db.documents, db.locations, async () => {
    for (const documentRecord of documents) {
      const content = replaceReferenceName(documentRecord.content, entityId, displayName)

      if (content) {
        await db.documents.update(documentRecord.id, {
          content,
          updatedAt: now
        })
      }
    }

    for (const location of locations) {
      const description = replaceReferenceName(location.description, entityId, displayName)

      if (description) {
        await db.locations.update(location.id, {
          description,
          updatedAt: now
        })
      }
    }
  })
}
