import { useCallback, useEffect, useRef, useState } from 'react'

export type SaveStatus = 'editing' | 'saving' | 'saved' | 'error'

export function useDebouncedSave(onSave: (value: string) => void | Promise<void>, delay = 500) {
  const [status, setStatus] = useState<SaveStatus>('saved')

  const saveCallbackRef = useRef(onSave)
  const pendingValueRef = useRef<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const revisionRef = useRef(0)

  useEffect(() => {
    saveCallbackRef.current = onSave
  }, [onSave])

  const savePendingValue = useCallback(async () => {
    const value = pendingValueRef.current

    if (value === null) {
      return
    }

    pendingValueRef.current = null
    timerRef.current = null

    const revision = revisionRef.current

    setStatus('saving')

    try {
      await saveCallbackRef.current(value)

      if (revision === revisionRef.current) {
        setStatus('saved')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)

      if (revision === revisionRef.current) {
        setStatus('error')
      }
    }
  }, [])

  const scheduleSave = useCallback(
    (value: string) => {
      revisionRef.current += 1
      pendingValueRef.current = value
      setStatus('editing')

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }

      timerRef.current = window.setTimeout(() => {
        void savePendingValue()
      }, delay)
    },
    [delay, savePendingValue]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }

      const pendingValue = pendingValueRef.current

      if (pendingValue !== null) {
        void saveCallbackRef.current(pendingValue)
      }
    }
  }, [])

  return {
    status,
    scheduleSave
  }
}
