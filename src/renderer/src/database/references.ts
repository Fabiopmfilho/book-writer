import { db } from './db'

export async function updateCharacterReferences(
  characterId: string,
  characterName: string
): Promise<void> {
  const displayName = characterName.trim() || 'Personagem sem nome'

  const documents = await db.documents
    .filter((document) => document.content.includes(characterId))
    .toArray()

  await db.transaction('rw', db.documents, async () => {
    for (const documentRecord of documents) {
      const parsedContent = new DOMParser().parseFromString(documentRecord.content, 'text/html')

      const mentions = parsedContent.querySelectorAll('[data-type="mention"]')

      let changed = false

      mentions.forEach((mention) => {
        if (mention.getAttribute('data-id') !== characterId) {
          return
        }

        mention.setAttribute('data-label', displayName)
        mention.textContent = `@${displayName}`
        changed = true
      })

      if (changed) {
        await db.documents.update(documentRecord.id, {
          content: parsedContent.body.innerHTML,
          updatedAt: new Date()
        })
      }
    }
  })
}
