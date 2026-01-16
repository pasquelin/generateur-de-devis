import { useEffect } from 'react'
import { useTemplateEditorStore } from '../stores/templateEditor.store.ts'

export const useTemplateEditorAutoClose = () => {
  const { isOpen, closeDrawer } = useTemplateEditorStore()

  useEffect(() => {
    const handleResize = () => {
      // Fermer automatiquement sur mobile si ouvert
      if (isOpen) {
        closeDrawer()
      }
    }

    // Écouter les changements de taille
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, closeDrawer])
}
