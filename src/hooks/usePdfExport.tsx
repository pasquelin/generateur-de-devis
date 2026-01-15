import { useCallback } from 'react'

import { pdf } from '@react-pdf/renderer'

import { DocumentPdf } from '../features/preview/DocumentPdf'
import { useDocumentStore } from '../features/preview/document.store'
import { type DocumentData } from '../types'

export const usePdfExport = (data: DocumentData) => {
  const { documentNumber } = useDocumentStore()

  const exportPdf = useCallback(
    async (filename?: string) => {
      try {
        const finalFilename = filename || `${documentNumber}.pdf`

        const blob = await pdf(<DocumentPdf data={data} />).toBlob()

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = finalFilename
        link.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Erreur lors de l'export PDF:", error)
      }
    },
    [data, documentNumber],
  )

  return { exportPdf }
}
