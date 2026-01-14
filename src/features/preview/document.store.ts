import { create } from 'zustand'

import { type DocumentData } from '../../types'

interface DocumentStore {
  data: DocumentData
  documentNumber: string
  setData: (data: DocumentData) => void
  generateDocumentNumber: () => void
  updateClient: (field: keyof DocumentData['client'], value: string) => void
  updateLine: (lineId: string, field: keyof import('../../types').DocumentLine, value: string | number) => void
  updateTitle: (title: string) => void
}

const generateNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `DEV-${year}${month}-${random}`
}

const defaultData: DocumentData = {
  title: 'Nouveau Devis',
  client: {
    name: '',
    address: '',
    email: '',
  },
  lines: [],
  total: 0,
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  data: defaultData,
  documentNumber: generateNumber(),
  setData: (data) => set({ data }),
  generateDocumentNumber: () => set({ documentNumber: generateNumber() }),

  updateClient: (field, value) =>
    set((state) => ({
      data: {
        ...state.data,
        client: {
          ...state.data.client,
          [field]: value,
        },
      },
    })),

  updateLine: (lineId, field, value) =>
    set((state) => {
      const updatedLines = state.data.lines.map((line) => {
        if (line.id === lineId) {
          const updatedLine = { ...line, [field]: value }

          // Recalculer le total si quantity ou unitPrice change
          if (field === 'quantity' || field === 'unitPrice') {
            updatedLine.total = updatedLine.quantity * updatedLine.unitPrice
          }

          return updatedLine
        }
        return line
      })

      // Recalculer le total général
      const newTotal = updatedLines.reduce((sum, line) => sum + line.total, 0)

      return {
        data: {
          ...state.data,
          lines: updatedLines,
          total: newTotal,
        },
      }
    }),

  updateTitle: (title) =>
    set((state) => ({
      data: {
        ...state.data,
        title,
      },
    })),
}))
