import { useDocumentStore } from '../features/preview/document.store'
import { type DocumentData } from '../types'
import { useDocumentConfig } from '../features/preview/document.config.ts'
import { useSettingsStore } from '../features/settings/settings.store.ts'

export const useDocumentPdf = (data: DocumentData) => {
  const { settings } = useSettingsStore()
  const { documentNumber } = useDocumentStore()
  const config = useDocumentConfig(data, settings, documentNumber)

  return {
    headerSection: config.sections.find(s => s.type === 'header'),
    clientSection: config.sections.find(s => s.type === 'client'),
    linesSection: config.sections.find(s => s.type === 'lines'),
    totalsSection: config.sections.find(s => s.type === 'totals'),
    paymentSection: config.sections.find(s => s.type === 'payment'),
    bankingSection: config.sections.find(s => s.type === 'banking'),
    insuranceSection: config.sections.find(s => s.type === 'insurance'),
    customSection: config.sections.find(s => s.type === 'custom'),
    legalSection: config.sections.find(s => s.type === 'legal'),
    config,
  }
}
