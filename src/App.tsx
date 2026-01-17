import { FileDown, Settings, Menu, MessageSquare, FileText } from 'lucide-react'

import { ChatPanel } from './features/chat/ChatPanel.tsx'
import { PreviewPanel } from './features/preview/PreviewPanel.tsx'
import { useDocumentStore } from './features/preview/document.store.ts'
import { SettingsModal } from './features/settings/components/SettingsModal.tsx'
import { TemplateEditor } from './features/settings/components/TemplateEditor.tsx'
import { useSettingsStore } from './features/settings/settings.store.ts'
import { usePdfExport } from './hooks/usePdfExport.tsx'
import { useTemplateEditorAutoClose } from './hooks/useTemplateEditorAutoClose.ts'
import { ShareButton } from './components/ShareButton.tsx'
import { ApiModal } from './features/settings/components/ApiModal.tsx'
import { useTemplateEditorStore } from './stores/templateEditor.store.ts'
import { useEscapeKey } from './hooks/useEscapeKey.ts'
import { cn } from './utils/cn.util.ts'
import { useEffect, useState } from 'react'
import ReactGA from 'react-ga4'
import { useAuth } from './hooks/useAuth.ts'
import { authService } from './services/auth.service.ts'

export const App = () => {
  const { openModal } = useSettingsStore()
  const { data } = useDocumentStore()
  const { exportPdf } = usePdfExport(data)
  const { isOpen, toggleDrawer, closeDrawer } = useTemplateEditorStore()
  const [showPreview, setShowPreview] = useState(false)

  // 🔐 Initialisation de l'authentification transparente
  useAuth()

  useTemplateEditorAutoClose()

  useEscapeKey(closeDrawer, isOpen)

  const handleExportPdf = () => {
    ReactGA.event({
      category: 'PDF',
      action: 'Export',
      label: 'Devis',
    })

    void exportPdf('devis.pdf')
  }

  const switchView = () => {
    setShowPreview(prev => {
      ReactGA.event({
        category: 'App',
        action: 'Switch',
        label: prev ? 'Go to chat' : 'Go to preview',
      })

      return !prev
    })
  }

  useEffect(() => {
    window.createLemonSqueezy()
    window.LemonSqueezy.Setup({
      eventHandler: event => {
        if (event === 'Checkout.Success') {
          void authService.refreshPaymentData()
        }
      },
    })
  }, [])

  return (
    <>
      <div className="flex h-svh min-w-95 overflow-hidden">
        <div className={cn('bg-base-300 from-primary/10 flex flex-1 flex-col bg-linear-to-br')}>
          <header className="bg-base-100 shadow-lg">
            <div className="m-auto flex max-w-470 flex-col gap-3 p-3 sm:gap-4 sm:p-4 md:flex-row md:py-2">
              <div className="inline-flex flex-1 items-center justify-center gap-2 md:justify-start">
                <img
                  src="/images/logo-small.png"
                  height={50}
                  width={72}
                  alt="Logo - générateur de devis"
                  className="h-10 w-auto sm:h-12"
                />
                <h1 className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-xl font-bold text-transparent text-shadow-blue-50 sm:text-2xl lg:text-3xl">
                  Générateur de devis
                </h1>
                <span className="-rotate-6 animate-pulse align-baseline text-xs font-light text-white sm:text-sm">
                  BETA
                </span>
              </div>

              <div className="inline-flex flex-none flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button className="btn btn-warning btn-sm lg:btn-md" onClick={openModal}>
                  <Settings size={18} className="xs:block hidden sm:h-5 sm:w-5" />
                  Paramètres
                </button>

                <button className="btn btn-primary btn-sm lg:btn-md" onClick={handleExportPdf}>
                  <FileDown size={18} className="sm:h-5 sm:w-5" />
                  Exporter votre devis en PDF
                </button>
                <button
                  className="btn btn-sm lg:btn-md btn-square btn-neutral 2xl:hidden"
                  onClick={toggleDrawer}
                >
                  <Menu size={18} className="sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Main avec layout adaptatif */}
          <main
            className={cn(
              'relative m-auto w-full max-w-470 grow overflow-hidden p-4',
              !isOpen && 'scrollbar-hide overflow-y-auto',
            )}
          >
            <div
              className={cn(
                'flex h-full gap-4 transition-all duration-300 sm:gap-6',
                isOpen ? 'mr-0 md:mr-96' : '',
              )}
            >
              {/* Grid pour ChatPanel et PreviewPanel */}
              <div
                className={cn(
                  'relative grid flex-1 grid-cols-1 gap-4 sm:gap-6',
                  !isOpen && 'lg:grid-cols-2',
                )}
              >
                {/* ChatPanel */}
                <div
                  className={cn(
                    'absolute inset-0 bottom-14 min-h-96 lg:relative',
                    isOpen && 'md:hidden',
                    showPreview ? 'hidden md:block' : 'z-50 block',
                  )}
                >
                  <ChatPanel />
                </div>

                {/* PreviewPanel */}
                <div
                  className={cn(
                    'absolute inset-0 bottom-14 min-h-96 lg:relative',
                    showPreview ? 'z-50 block' : 'hidden md:block',
                  )}
                >
                  <PreviewPanel />
                </div>
              </div>

              {/* TemplateEditor - Visible uniquement sur 2XL avec largeur fixe */}
              <div className="hidden w-80 shrink-0 2xl:block">
                <TemplateEditor />
              </div>
            </div>

            <button
              className="btn btn-secondary btn-md absolute right-4 bottom-4 left-4 lg:hidden"
              onClick={switchView}
            >
              {showPreview ? (
                <>
                  <MessageSquare className="size-4" />
                  Revenir à la discussion
                </>
              ) : (
                <>
                  <FileText className="size-4" />
                  Voir l'aperçu du devis
                </>
              )}
            </button>

            <div
              className={cn(
                'bg-base-300 border-base-300 absolute top-0 right-0 z-50 h-full w-full transform border-l shadow-2xl transition-transform duration-300 md:w-96 2xl:hidden',
                isOpen ? 'translate-x-0' : 'translate-x-full',
              )}
            >
              <div className="flex h-full flex-col gap-4 p-4">
                {/* Contenu du drawer */}
                <div className="scrollbar-hide flex-1 overflow-auto">
                  <TemplateEditor />
                </div>

                {/* Footer du drawer avec bouton de validation (mobile) */}
                <div className="border-base-300 border-t md:hidden">
                  <button className="btn btn-primary btn-block" onClick={closeDrawer}>
                    Appliquer et fermer
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="footer sm:footer-horizontal sm text-primary relative m-auto h-12 max-w-470 justify-center p-3 px-4 text-xs sm:pt-2 sm:text-sm">
            Copyright © {new Date().getFullYear()} - Tous droits réservés
            <ShareButton title="Partager moi" />
          </footer>
        </div>
      </div>
      <SettingsModal />
      <ApiModal />
    </>
  )
}
