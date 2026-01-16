import { useEffect } from 'react'
import { useDocumentStore } from '../features/preview/document.store'
import { useTemplateEditorStore } from '../stores/templateEditor.store.ts'

export const useTemplateEditorAutoOpen = () => {
  const { hasBeenOpenedOnce, openDrawer, markAsOpened } = useTemplateEditorStore()
  const { data } = useDocumentStore()

  useEffect(() => {
    // Si l'utilisateur a modifié des données avancées et n'a jamais ouvert le drawer
    if (!hasBeenOpenedOnce && data && Object.keys(data).length > 5) {
      // Détection d'un "usage avancé" (ici si plus de 5 champs remplis)
      // Vous pouvez adapter cette logique selon vos besoins
      openDrawer()
      markAsOpened()
    }
  }, [data, hasBeenOpenedOnce, openDrawer, markAsOpened])
}
