import { db } from '../database/db'
import type { BookEditableField, BookRecord } from '../database/models'

export async function updateBookRecord(
  bookId: string,
  field: BookEditableField,
  value: string | number
): Promise<void> {
  await db.books.update(bookId, {
    [field]: value,
    updatedAt: new Date()
  } as Partial<BookRecord>)
}
