import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '../database/db'
import type { CharacterRecord, LocationRecord } from '../database/models'
import { ensureInitialBook } from '../database/seed'
import type { Chapter } from '../types/book'

export function useBookData() {
  const [activeBookId, setActiveBookId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    void ensureInitialBook().then((bookId) => {
      if (mounted) {
        setActiveBookId(bookId)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  const book = useLiveQuery(async () => {
    if (!activeBookId) {
      return undefined
    }

    return db.books.get(activeBookId)
  }, [activeBookId])

  const documents = useLiveQuery(
    async (): Promise<Chapter[]> => {
      if (!activeBookId) {
        return []
      }

      return db.documents.where('bookId').equals(activeBookId).sortBy('order')
    },
    [activeBookId],
    [] as Chapter[]
  )

  const characters = useLiveQuery(
    async (): Promise<CharacterRecord[]> => {
      if (!activeBookId) {
        return []
      }

      return db.characters.where('bookId').equals(activeBookId).sortBy('name')
    },
    [activeBookId],
    [] as CharacterRecord[]
  )

  const locations = useLiveQuery(
    async (): Promise<LocationRecord[]> => {
      if (!activeBookId) {
        return []
      }

      return db.locations.where('bookId').equals(activeBookId).sortBy('name')
    },
    [activeBookId],
    [] as LocationRecord[]
  )

  return {
    activeBookId,
    book,
    documents,
    characters,
    locations,
    loading: !activeBookId || book === undefined
  }
}
