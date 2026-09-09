import { db } from '../database/db'
import type { Chapter } from '../types/book'

type EditableDocumentField = keyof Pick<Chapter, 'title' | 'content' | 'notes'>

export function getDocumentDeletionMessage(
  documentId: string,
  documents: Chapter[]
): string | null {
  const documentRecord = documents.find((document) => document.id === documentId)

  if (!documentRecord) {
    return null
  }

  const childScenes =
    documentRecord.type === 'chapter'
      ? documents.filter((document) => document.parentId === documentRecord.id)
      : []

  if (documentRecord.type === 'scene') {
    return `Excluir a cena "${documentRecord.title}"?`
  }

  if (childScenes.length > 0) {
    return `Excluir "${documentRecord.title}" e suas ${childScenes.length} cenas?`
  }

  return `Excluir o capítulo "${documentRecord.title}"?`
}

export async function updateDocumentRecord(
  documentId: string,
  field: EditableDocumentField,
  value: string
): Promise<void> {
  await db.documents.update(documentId, {
    [field]: value,
    updatedAt: new Date()
  })
}

export async function createChapterRecord(bookId: string, documents: Chapter[]): Promise<Chapter> {
  const rootChapters = documents.filter(
    (document) => document.type === 'chapter' && document.parentId === null
  )

  const now = new Date()

  const chapter: Chapter = {
    id: crypto.randomUUID(),
    bookId,
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

  return chapter
}

export async function createSceneRecord(
  bookId: string,
  parentChapterId: string,
  documents: Chapter[]
): Promise<Chapter> {
  const siblingScenes = documents.filter(
    (document) => document.type === 'scene' && document.parentId === parentChapterId
  )

  const now = new Date()

  const scene: Chapter = {
    id: crypto.randomUUID(),
    bookId,
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

  return scene
}

export async function removeDocumentRecord(
  documentId: string,
  documents: Chapter[]
): Promise<Set<string>> {
  const documentRecord = documents.find((document) => document.id === documentId)

  if (!documentRecord) {
    return new Set()
  }

  const childScenes =
    documentRecord.type === 'chapter'
      ? documents.filter((document) => document.parentId === documentRecord.id)
      : []

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

    const now = new Date()

    for (const [index, sibling] of siblings.entries()) {
      if (sibling.order !== index) {
        await db.documents.update(sibling.id, {
          order: index,
          updatedAt: now
        })
      }
    }
  })

  return deletedIds
}

export async function reorderDocumentRecords(documentIds: string[]): Promise<void> {
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

export async function moveSceneRecord(
  sceneId: string,
  targetChapterId: string,
  documents: Chapter[]
): Promise<void> {
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
