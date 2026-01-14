import { FileDown, Settings } from 'lucide-react'

import { ChatPanel } from '../features/chat/ChatPanel'
import { PreviewPanel } from '../features/preview/PreviewPanel'
import { useDocumentStore } from '../features/preview/document.store'
import { SettingsModal } from '../features/settings/components/SettingsModal'
import { useSettingsStore } from '../features/settings/settings.store'
import { usePdfExport } from '../hooks/usePdfExport.tsx'
import { ShareButton } from '../components/ShareButton.tsx'

export const MainLayout = () => {
  const { openModal } = useSettingsStore()
  const { data } = useDocumentStore()
  const { exportPdf } = usePdfExport(data)

  const handleExportPdf = () => {
    void exportPdf('devis.pdf')
  }

  return (
    <>
      <div className="bg-base-300 flex h-screen flex-col">
        <div className="navbar bg-base-100 px-4">
          <div className="flex flex-1 flex-row items-center gap-2">
            <img
              src="/images/logo-small.png"
              height={50}
              width={72}
              alt="Logo - générateur de devis"
            />
            <h1 className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent text-shadow-blue-50">
              Générateur de devis
            </h1>
            <span className="-rotate-6 animate-pulse align-baseline text-sm font-light text-white">
              BETA
            </span>
          </div>
          <div className="flex flex-none flex-row items-center gap-4">
            <button className="btn btn-warning" onClick={openModal}>
              <Settings size={22} />
              Paramètres
            </button>
            <button className="btn btn-primary" onClick={handleExportPdf}>
              <FileDown size={20} />
              Exporter votre devis en PDF
            </button>
          </div>
        </div>
        <main className="grow p-4">
          <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="relative lg:col-span-5">
              <ChatPanel />
            </div>
            <div className="lg:col-span-7">
              <PreviewPanel />
            </div>
          </div>
        </main>
        <footer className="footer sm:footer-horizontal bg-base-100 items-center p-4">
          <aside className="grid-flow-col items-center">
            Copyright © {new Date().getFullYear()} - All right reserved
          </aside>
          <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
            <ShareButton title="Partager moi" />
          </nav>
        </footer>
      </div>
      <SettingsModal />
    </>
  )
}
