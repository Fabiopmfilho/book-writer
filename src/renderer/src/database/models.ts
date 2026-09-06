export type DocumentType = 'chapter' | 'scene' | 'note'

export type BookRecord = {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export type DocumentRecord = {
  id: string
  bookId: string
  parentId: string | null
  type: DocumentType
  title: string
  content: string
  notes: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export type CharacterRecord = {
  id: string
  bookId: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export type LocationRecord = {
  id: string
  bookId: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}
