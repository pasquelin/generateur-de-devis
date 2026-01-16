import { useEffect } from 'react'

export const useEscapeKey = (callback: () => void, isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        callback()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [callback, isActive])
}
