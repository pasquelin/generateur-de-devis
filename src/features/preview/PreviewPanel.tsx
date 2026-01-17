import { Panel } from '../../components/Panel'
import { useDocumentStore } from './document.store'
import { useSettingsStore } from '../settings/settings.store.ts'
import { DocumentPreview as DefaultDocumentPreview } from './templates/default/DocumentPreview.tsx'
import { Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../chat/chat.store.ts'
import { DocumentManager } from './DocumentManager.tsx'
import { BuyButton } from '../../components/BuyButton.tsx'
import { hasAccess, PRODUCT_IDS } from '../../utils/access.util.ts'

export const PreviewPanel = () => {
  const { data, hasChange, reset } = useDocumentStore()
  const { clearChat } = useChatStore()
  const { settings } = useSettingsStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const handleReset = () => {
    reset()
    clearChat()
  }

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const containerHeight = containerRef.current.offsetHeight
        const contentWidth = contentRef.current.offsetWidth
        const contentHeight = contentRef.current.offsetHeight

        const scaleX = containerWidth / contentWidth
        const scaleY = containerHeight / contentHeight

        const newScale = Math.min(1, scaleX, scaleY)
        setScale(newScale)
      }
    }

    updateScale()

    const resizeObserver = new ResizeObserver(updateScale)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <Panel className="flex flex-col gap-4">
      <DocumentManager />
      <div className="relative grow">
        <div className="absolute inset-0">
          <div
            ref={containerRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out',
              }}
            >
              {hasChange() && (
                <button
                  onClick={handleReset}
                  className="btn btn-error btn-circle btn-lg tooltip tooltip-left tooltip-error absolute -top-4 -right-4 z-10 shadow-lg"
                  data-tip="Supprimer le devis"
                >
                  <Trash2 size={22} />
                </button>
              )}

              {settings.template.activeTemplate === 'default' && (
                <DefaultDocumentPreview data={data} contentRef={contentRef} />
              )}

              {!hasAccess(PRODUCT_IDS.NO_SIGNE.product_id) && (
                <div className="absolute right-0 bottom-4 left-0 flex justify-center">
                  <div className="text-primary flex flex-col justify-center gap-1">
                    <div className="text-center">
                      <BuyButton link={PRODUCT_IDS.NO_SIGNE.link} className="btn-xs btn-warning">
                        Supprimer la signature
                      </BuyButton>
                    </div>
                    Généré sur https://generateur-de-devis.fr
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Panel>
  )
}
