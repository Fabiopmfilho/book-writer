import { db } from './db'
import type { BookRecord } from './models'

export async function ensureInitialBook(): Promise<string> {
  return db.transaction('rw', db.books, db.documents, async () => {
    const existingBook = await db.books.toCollection().first()

    if (existingBook) {
      return existingBook.id
    }

    const bookId = crypto.randomUUID()
    const now = new Date()

    const book: BookRecord = {
      id: bookId,
      title: 'Meu Livro',
      subtitle: '',
      author: '',
      genre: '',
      language: 'Português',
      synopsis: '',
      seriesName: '',
      volumeNumber: '',
      targetWordCount: 0,
      createdAt: now,
      updatedAt: now
    }

    await db.books.add(book)

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
