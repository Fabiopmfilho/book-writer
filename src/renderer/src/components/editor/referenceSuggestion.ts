import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import type { SuggestionOptions } from '@tiptap/suggestion'

export type ReferenceItem = {
  id: string
  label: string
}

export function createReferenceSuggestion(
  char: '@' | '#',
  getItems: () => ReferenceItem[]
): Omit<SuggestionOptions<ReferenceItem, MentionNodeAttrs>, 'editor'> {
  return {
    char,

    items({ query }) {
      const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')

      return getItems()
        .filter((item) => item.label.toLocaleLowerCase('pt-BR').includes(normalizedQuery))
        .slice(0, 8)
    },

    render() {
      let popup: HTMLDivElement | null = null
      let buttons: HTMLButtonElement[] = []
      let selectedIndex = 0

      function updateSelection() {
        buttons.forEach((button, index) => {
          button.classList.toggle('selected', index === selectedIndex)
        })

        buttons[selectedIndex]?.scrollIntoView({
          block: 'nearest'
        })
      }

      function draw(
        items: ReferenceItem[],
        choose: (item: ReferenceItem) => void,
        position: DOMRect | null | undefined
      ) {
        if (!popup) return

        popup.replaceChildren()
        buttons = []

        if (items.length === 0) {
          const empty = document.createElement('div')
          empty.className = 'mention-suggestion-empty'
          empty.textContent =
            char === '@' ? 'Nenhum personagem encontrado' : 'Nenhum lugar encontrado'

          popup.appendChild(empty)
        } else {
          items.forEach((item, index) => {
            const button = document.createElement('button')

            button.type = 'button'
            button.className = 'mention-suggestion-item'
            button.textContent = item.label

            button.addEventListener('mouseenter', () => {
              selectedIndex = index
              updateSelection()
            })

            button.addEventListener('mousedown', (event) => {
              event.preventDefault()
              choose(item)
            })

            popup?.appendChild(button)
            buttons.push(button)
          })
        }

        selectedIndex = 0
        updateSelection()

        if (position) {
          popup.style.left = `${position.left}px`
          popup.style.top = `${position.bottom + 6}px`
        }
      }

      return {
        onStart(props) {
          popup = document.createElement('div')
          popup.className = 'mention-suggestion'
          document.body.appendChild(popup)

          draw(props.items, (item) => props.command(item as MentionNodeAttrs), props.clientRect?.())
        },

        onUpdate(props) {
          draw(props.items, (item) => props.command(item as MentionNodeAttrs), props.clientRect?.())
        },

        onKeyDown({ event }) {
          if (event.key === 'Escape') {
            popup?.remove()
            popup = null
            return true
          }

          if (buttons.length === 0) return false

          if (event.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % buttons.length
            updateSelection()
            return true
          }

          if (event.key === 'ArrowUp') {
            selectedIndex = (selectedIndex - 1 + buttons.length) % buttons.length

            updateSelection()
            return true
          }

          if (event.key === 'Enter') {
            buttons[selectedIndex]?.dispatchEvent(
              new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true
              })
            )

            return true
          }

          return false
        },

        onExit() {
          popup?.remove()
          popup = null
          buttons = []
        }
      }
    }
  }
}
