import { useEffect } from 'react'

interface KeyboardShortcutOptions {
  focusMode: boolean
  onToggleFocusMode: () => void
  onExitFocusMode: () => void
  onCreateChapter: () => void
  onToggleSidebar: () => void
  onToggleInspector: () => void
}

export function useKeyboardShortcuts({
  focusMode,
  onToggleFocusMode,
  onExitFocusMode,
  onCreateChapter,
  onToggleSidebar,
  onToggleInspector
}: KeyboardShortcutOptions): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      const modifier = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (!modifier) {
        if (event.key === 'Escape' && focusMode) {
          onExitFocusMode()
        }
        return
      }

      if (event.shiftKey && key === 'f') {
        event.preventDefault()
        onToggleFocusMode()
        return
      }

      if (event.shiftKey && key === 'n') {
        event.preventDefault()
        onCreateChapter()
        return
      }

      if (event.shiftKey && key === 'b') {
        event.preventDefault()
        onToggleSidebar()
        return
      }

      if (event.altKey && key === 'i') {
        event.preventDefault()
        onToggleInspector()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    focusMode,
    onToggleFocusMode,
    onExitFocusMode,
    onCreateChapter,
    onToggleSidebar,
    onToggleInspector
  ])
}
