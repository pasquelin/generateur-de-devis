import type { DocumentData } from '../../types'
import { useSettingsStore } from '../settings/settings.store'
import { DocumentPreview as DefaultDocumentPreview } from './templates/default/DocumentPreview'

interface DocumentPreviewProps {
  data: DocumentData
}

export const DocumentPreview = ({ data }: DocumentPreviewProps) => {
  const { settings } = useSettingsStore()
  const { activeTemplate } = settings.template

  // Router: charge le bon template en fonction de activeTemplate
  switch (activeTemplate) {
    case 'default':
      return <DefaultDocumentPreview data={data} />
    // Ajoutez d'autres templates ici au fur et à mesure
    default:
      return <DefaultDocumentPreview data={data} />
  }
}
