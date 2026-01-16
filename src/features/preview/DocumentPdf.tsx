import type { DocumentData } from '../../types'
import { useSettingsStore } from '../settings/settings.store'
import { DocumentPdf as DefaultDocumentPdf } from './templates/default/DocumentPdf'

interface DocumentPdfProps {
  data: DocumentData
}

export const DocumentPdf = ({ data }: DocumentPdfProps) => {
  const { settings } = useSettingsStore()
  const { activeTemplate } = settings.template

  // Router: charge le bon template en fonction de activeTemplate
  switch (activeTemplate) {
    case 'default':
      return <DefaultDocumentPdf data={data} />
    // Ajoutez d'autres templates ici au fur et à mesure
    default:
      return <DefaultDocumentPdf data={data} />
  }
}
