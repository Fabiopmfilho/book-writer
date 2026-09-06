import Dexie, { type Table } from 'dexie'

import type { BookRecord, CharacterRecord, DocumentRecord, LocationRecord } from './models'

class BookWriterDatabase extends Dexie {
  books!: Table<BookRecord, string>
  documents!: Table<DocumentRecord, string>
  characters!: Table<CharacterRecord, string>
  locations!: Table<LocationRecord, string>

  constructor() {
    super('book-writer')

    this.version(1).stores({
      books: 'id, title, updatedAt',
      documents: 'id, bookId, parentId, type, [bookId+order], updatedAt',
      characters: 'id, bookId, name, [bookId+name]',
      locations: 'id, bookId, name, [bookId+name]'
    })
  }
}

export const db = new BookWriterDatabase()
