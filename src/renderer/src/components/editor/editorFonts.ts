export type SelectOption = {
  label: string
  value: string
}

/**
 * Fontes oferecidas no seletor. O valor é o que vai para o CSS (font-family),
 * com alternativas para o caso da fonte não existir no sistema (macOS/Linux).
 *
 * "Padrão" (valor vazio) remove a fonte do trecho e volta à fonte do manuscrito.
 *
 * Para adicionar uma fonte instalada via pacote, por exemplo:
 *   pnpm add @fontsource-variable/literata
 *   import '@fontsource-variable/literata'   (uma vez, no main.tsx)
 *   { label: 'Literata', value: 'Literata Variable, Georgia, serif' }
 */
export const editorFontFamilies: SelectOption[] = [
  { label: 'Padrão', value: '' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, Times, serif' },
  { label: 'Palatino', value: 'Palatino Linotype, Palatino, Book Antiqua, serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Courier New', value: 'Courier New, Courier, monospace' }
]

export const editorFontSizes: SelectOption[] = [
  { label: 'Padrão', value: '' },
  ...[12, 14, 16, 18, 20, 24, 28, 32, 40].map((size) => ({
    label: String(size),
    value: `${size}px`
  }))
]
export function normalizeFontFamily(value: string): string {
  return value
    .replace(/["']/g, '')
    .replace(/\s*,\s*/g, ',')
    .trim()
    .toLowerCase()
}
