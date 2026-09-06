export type Chapter = {
  id: string
  title: string
  content: string
  notes: string
}

export type Book = {
  id: string
  title: string
  chapters: Chapter[]
}
