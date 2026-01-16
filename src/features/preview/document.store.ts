import { create } from 'zustand'

import { type DocumentData, type DocumentLine, type Discount } from '../../types'

interface DocumentStore {
  data: DocumentData
  documentNumber: string
  setData: (data: DocumentData) => void
  generateDocumentNumber: () => void
  updateClient: (field: keyof DocumentData['client'], value: string) => void
  updateLine: (lineId: string, field: keyof DocumentLine, value: string | number) => void
  deleteLine: (lineId: string) => void
  updateTitle: (title: string) => void
  updateLineDiscount: (lineId: string, discount: Discount | undefined) => void
  removeLineDiscount: (lineId: string) => void
  updateGlobalDiscount: (discount: Discount | undefined) => void
  removeGlobalDiscount: () => void
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

/**
 * Calcule le montant de la remise pour une ligne
 */
const calculateDiscountAmount = (subtotal: number, discount: Discount | undefined): number => {
  if (!discount) return 0

  if (discount.type === 'percentage') {
    return (subtotal * discount.value) / 100
  }

  return discount.value
}

/**
 * Calcule les montants pour une ligne avec remise
 */
const calculateLineAmounts = (
  quantity: number,
  unitPrice: number,
  discount: Discount | undefined,
): { subtotal: number; discountAmount: number; total: number } => {
  const subtotal = quantity * unitPrice
  const discountAmount = calculateDiscountAmount(subtotal, discount)
  const total = subtotal - discountAmount

  return { subtotal, discountAmount, total }
}

/**
 * Recalcule tous les totaux du document avec remises
 */
const recalculateDocument = (data: DocumentData): DocumentData => {
  // Recalculer les lignes avec leurs remises
  const updatedLines = data.lines.map(line => {
    const amounts = calculateLineAmounts(line.quantity, line.unitPrice, line.discount)
    return {
      ...line,
      subtotal: amounts.subtotal,
      discountAmount: amounts.discountAmount,
      total: amounts.total,
    }
  })

  // Calculer le sous-total (somme des totaux des lignes)
  const subtotal = updatedLines.reduce((sum, line) => sum + line.total, 0)

  // Calculer la remise globale
  const globalDiscountAmount = calculateDiscountAmount(subtotal, data.globalDiscount)

  // Total final
  const total = subtotal - globalDiscountAmount

  return {
    ...data,
    lines: updatedLines,
    total,
  }
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

export const useDocumentStore = create<DocumentStore>(set => ({
  data: defaultData,
  documentNumber: generateNumber(),

  setData: data =>
    set(() => ({
      data: recalculateDocument(data),
    })),

  generateDocumentNumber: () => set({ documentNumber: generateNumber() }),

  updateClient: (field, value) =>
    set(state => ({
      data: {
        ...state.data,
        client: {
          ...state.data.client,
          [field]: value,
        },
      },
    })),

  updateLine: (lineId, field, value) =>
    set(state => {
      const updatedLines = state.data.lines.map(line => {
        if (line.id === lineId) {
          const updatedLine = { ...line, [field]: value }

          // Recalculer les montants si quantity ou unitPrice change
          if (field === 'quantity' || field === 'unitPrice') {
            const amounts = calculateLineAmounts(
              updatedLine.quantity,
              updatedLine.unitPrice,
              updatedLine.discount,
            )
            updatedLine.subtotal = amounts.subtotal
            updatedLine.discountAmount = amounts.discountAmount
            updatedLine.total = amounts.total
          }

          return updatedLine
        }
        return line
      })

      return {
        data: recalculateDocument({
          ...state.data,
          lines: updatedLines,
        }),
      }
    }),

  deleteLine: lineId =>
    set(state => {
      const updatedLines = state.data.lines.filter(line => line.id !== lineId)

      return {
        data: recalculateDocument({
          ...state.data,
          lines: updatedLines,
        }),
      }
    }),

  updateTitle: title =>
    set(state => ({
      data: {
        ...state.data,
        title,
      },
    })),

  updateLineDiscount: (lineId, discount) =>
    set(state => {
      const updatedLines = state.data.lines.map(line => {
        if (line.id === lineId) {
          const amounts = calculateLineAmounts(line.quantity, line.unitPrice, discount)
          return {
            ...line,
            discount,
            subtotal: amounts.subtotal,
            discountAmount: amounts.discountAmount,
            total: amounts.total,
          }
        }
        return line
      })

      return {
        data: recalculateDocument({
          ...state.data,
          lines: updatedLines,
        }),
      }
    }),

  removeLineDiscount: lineId =>
    set(state => {
      const updatedLines = state.data.lines.map(line => {
        if (line.id === lineId) {
          const amounts = calculateLineAmounts(line.quantity, line.unitPrice, undefined)
          return {
            ...line,
            discount: undefined,
            subtotal: amounts.subtotal,
            discountAmount: amounts.discountAmount,
            total: amounts.total,
          }
        }
        return line
      })

      return {
        data: recalculateDocument({
          ...state.data,
          lines: updatedLines,
        }),
      }
    }),

  updateGlobalDiscount: discount =>
    set(state => ({
      data: recalculateDocument({
        ...state.data,
        globalDiscount: discount,
      }),
    })),

  removeGlobalDiscount: () =>
    set(state => ({
      data: recalculateDocument({
        ...state.data,
        globalDiscount: undefined,
      }),
    })),
}))
