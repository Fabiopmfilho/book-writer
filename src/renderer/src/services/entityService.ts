import { db } from '../database/db'
import type { CharacterRecord, LocationRecord } from '../database/models'
import { updateEntityReferences } from '../database/references'

export async function createCharacterRecord(
  bookId: string,
  characterCount: number
): Promise<CharacterRecord> {
  const now = new Date()

  const character: CharacterRecord = {
    id: crypto.randomUUID(),
    bookId,
    name: `Personagem ${characterCount + 1}`,
    description: '',
    createdAt: now,
    updatedAt: now
  }

  await db.characters.add(character)

  return character
}

export async function updateCharacterRecord(
  characterId: string,
  field: keyof Pick<CharacterRecord, 'name' | 'description'>,
  value: string
): Promise<void> {
  await db.characters.update(characterId, {
    [field]: value,
    updatedAt: new Date()
  })
}

export async function commitCharacterNameRecord(characterId: string, name: string): Promise<void> {
  await updateEntityReferences(characterId, name)
}

export async function createLocationRecord(
  bookId: string,
  locationCount: number
): Promise<LocationRecord> {
  const now = new Date()

  const location: LocationRecord = {
    id: crypto.randomUUID(),
    bookId,
    name: `Lugar ${locationCount + 1}`,
    description: '',
    createdAt: now,
    updatedAt: now
  }

  await db.locations.add(location)

  return location
}

export async function updateLocationRecord(
  locationId: string,
  field: keyof Pick<LocationRecord, 'name' | 'description'>,
  value: string
): Promise<void> {
  await db.locations.update(locationId, {
    [field]: value,
    updatedAt: new Date()
  })
}

export async function commitLocationNameRecord(locationId: string, name: string): Promise<void> {
  await updateEntityReferences(locationId, name)
}

export async function removeCharacterRecord(characterId: string): Promise<void> {
  await db.characters.delete(characterId)
}

export async function removeLocationRecord(locationId: string): Promise<void> {
  await db.locations.delete(locationId)
}
