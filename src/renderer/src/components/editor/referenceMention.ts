import Mention from '@tiptap/extension-mention'

import { createReferenceSuggestion } from './referenceSuggestion'

type ReferenceMentionOptions = {
  getCharacters: () => Array<{ id: string; name: string }>
  getLocations?: () => Array<{ id: string; name: string }>
}

export function createReferenceMention({ getCharacters, getLocations }: ReferenceMentionOptions) {
  const suggestions = [
    createReferenceSuggestion('@', () =>
      getCharacters().map((character) => ({
        id: character.id,
        label: character.name
      }))
    )
  ]

  if (getLocations) {
    suggestions.push(
      createReferenceSuggestion('#', () =>
        getLocations().map((location) => ({
          id: location.id,
          label: location.name
        }))
      )
    )
  }

  return Mention.configure({
    HTMLAttributes: {
      class: 'character-mention'
    },

    renderText({ node }) {
      return node.attrs.label
    },

    renderHTML({ node, options }) {
      return [
        'span',
        {
          ...options.HTMLAttributes,
          'data-type': 'mention',
          'data-id': node.attrs.id,
          'data-label': node.attrs.label,
          'data-mention-suggestion-char': node.attrs.mentionSuggestionChar ?? '@'
        },
        node.attrs.label
      ]
    },

    suggestions
  })
}
