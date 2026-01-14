import { FileDown, FileSpreadsheet, Settings } from 'lucide-react'

import { ChatPanel } from '../features/chat/ChatPanel'
import { PreviewPanel } from '../features/preview/PreviewPanel'
import { useDocumentStore } from '../features/preview/document.store'
import { SettingsModal } from '../features/settings/components/SettingsModal'
import { useSettingsStore } from '../features/settings/settings.store'
import { usePdfExport } from '../hooks/usePdfExport.tsx'
import { ShareButton } from '../components/ShareButton.tsx'
import { ThemeSelector } from '../components/ThemeSelector.tsx'

export const MainLayout = () => {
  const { openModal } = useSettingsStore()
  const { data } = useDocumentStore()
  const { exportPdf } = usePdfExport(data)

  const handleExportPdf = () => {
    void exportPdf('devis.pdf')
  }

  return (
    <>
      <div className="h-screen bg-base-300 flex flex-col">
        <div className="navbar bg-base-100 px-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">Générateur de devis (BETA test)</h1>
          </div>
          <div className="flex-none flex flex-row gap-2 items-center">
            <button className="btn" onClick={openModal}>
              <Settings size={18} />
              Paramètres
            </button>
            <ThemeSelector />
            <button className="btn btn-primary ml-6" onClick={handleExportPdf}>
              <FileDown size={18} />
              Exporter votre devis en PDF
            </button>
          </div>
        </div>
        <main className="grow p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            <div className="lg:col-span-5">
              <ChatPanel />
            </div>
            <div className="lg:col-span-7">
              <PreviewPanel />
            </div>
          </div>
        </main>
        <footer className="footer sm:footer-horizontal bg-base-100 items-center p-4">
          <aside className="grid-flow-col items-center">
            <FileSpreadsheet size={36} />
            <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
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
