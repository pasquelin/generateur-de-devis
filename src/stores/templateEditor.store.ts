import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import ReactGA from 'react-ga4'

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

      openDrawer: () => {
        ReactGA.event({
          category: 'TemplateEditor',
          action: 'OpenDrawer',
        })

        set({ isOpen: true })
      },

      closeDrawer: () => {
        ReactGA.event({
          category: 'TemplateEditor',
          action: 'CloseDrawer',
        })

        set({ isOpen: false })
      },

      toggleDrawer: () => {
        ReactGA.event({
          category: 'TemplateEditor',
          action: 'ToggleDrawer',
        })

        set(state => ({ isOpen: !state.isOpen }))
      },

      markAsOpened: () => {
        ReactGA.event({
          category: 'TemplateEditor',
          action: 'MarkAsOpened',
        })

        set({ hasBeenOpenedOnce: true })
      },
    }),
    {
      name: 'template-editor-storage',
    },
  ),
)
