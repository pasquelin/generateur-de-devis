import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TemplateEditorStore {
  isOpen: boolean
  hasBeenOpenedOnce: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  markAsOpened: () => void
}

export const useTemplateEditorStore = create<TemplateEditorStore>()(
  persist(
    set => ({
      isOpen: false,
      hasBeenOpenedOnce: false,

      openDrawer: () => set({ isOpen: true }),

      closeDrawer: () => set({ isOpen: false }),

      toggleDrawer: () => set(state => ({ isOpen: !state.isOpen })),

      markAsOpened: () => set({ hasBeenOpenedOnce: true }),
    }),
    {
      name: 'template-editor-storage',
    },
  ),
)
