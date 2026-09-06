import { db } from './db'

export async function ensureInitialBook(): Promise<string> {
  return db.transaction('rw', db.books, db.documents, async () => {
    const existingBook = await db.books.toCollection().first()

    if (existingBook) {
      return existingBook.id
    }

    const bookId = crypto.randomUUID()
    const now = new Date()

    await db.books.add({
      id: bookId,
      title: 'Meu Livro',
      createdAt: now,
      updatedAt: now
    })

    await db.documents.bulkAdd(
      [1, 2, 3].map((number, index) => ({
        id: crypto.randomUUID(),
        bookId,
        parentId: null,
        type: 'chapter' as const,
        title: `Capítulo ${number}`,
        content: '',
        notes: '',
        order: index,
        createdAt: now,
        updatedAt: now
      }))
    )

    return bookId
  })
}
