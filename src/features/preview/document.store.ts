import { create } from 'zustand'

import { type DocumentData, type DocumentLine, type Discount } from '../../types'

// Types pour les sauvegardes
export interface SavedDocument {
  id: string
  title: string
  data: DocumentData
  documentNumber: string
  savedAt: string
  updatedAt: string
}

interface SaveFilter {
  searchTerm?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  clientName?: string
}

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
  hasChange: () => boolean

  // Gestion des sauvegardes
  reset: () => void
  save: (saveTitle: string) => string
  load: (saveId: string) => boolean
  getSavedDocuments: () => SavedDocument[]
  deleteSavedDocument: (saveId: string) => void
  updateSavedDocument: (saveId: string, saveTitle?: string) => boolean

  // Recherche et filtres
  searchDocuments: (searchTerm: string) => SavedDocument[]
  filterDocuments: (filter: SaveFilter) => SavedDocument[]

  // Export
  exportToJSON: (saveId?: string) => void
  exportAllToJSON: () => void
  exportToCSV: (saveIds?: string[]) => void
  importFromJSON: (jsonString: string) => boolean
}

const STORAGE_KEY = 'gosecure_documents'

const generateNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `DEV-${year}${month}-${random}`
}

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
  const updatedLines = data.lines.map(line => {
    const amounts = calculateLineAmounts(line.quantity, line.unitPrice, line.discount)
    return {
      ...line,
      subtotal: amounts.subtotal,
      discountAmount: amounts.discountAmount,
      total: amounts.total,
    }
  })

  const subtotal = updatedLines.reduce((sum, line) => sum + line.total, 0)
  const globalDiscountAmount = calculateDiscountAmount(subtotal, data.globalDiscount)
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

/**
 * Récupère toutes les sauvegardes depuis le localStorage
 */
const getAllSavedDocuments = (): Record<string, SavedDocument> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Erreur lors de la lecture des sauvegardes:', error)
    return {}
  }
}

/**
 * Sauvegarde tous les documents dans le localStorage
 */
const saveAllDocuments = (documents: Record<string, SavedDocument>): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    throw new Error('Impossible de sauvegarder le document')
  }
}

/**
 * Filtre les documents selon les critères
 */
const applyFilters = (documents: SavedDocument[], filter: SaveFilter): SavedDocument[] => {
  return documents.filter(doc => {
    // Recherche par terme
    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase()
      const matchTitle = doc.title.toLowerCase().includes(term)
      const matchClient = doc.data.client.name.toLowerCase().includes(term)
      const matchDocNumber = doc.documentNumber.toLowerCase().includes(term)
      if (!matchTitle && !matchClient && !matchDocNumber) return false
    }

    // Filtre par client
    if (filter.clientName) {
      const clientMatch = doc.data.client.name
        .toLowerCase()
        .includes(filter.clientName.toLowerCase())
      if (!clientMatch) return false
    }

    // Filtre par date
    if (filter.dateFrom) {
      const docDate = new Date(doc.savedAt)
      const fromDate = new Date(filter.dateFrom)
      if (docDate < fromDate) return false
    }

    if (filter.dateTo) {
      const docDate = new Date(doc.savedAt)
      const toDate = new Date(filter.dateTo)
      toDate.setHours(23, 59, 59, 999)
      if (docDate > toDate) return false
    }

    // Filtre par montant
    if (filter.minAmount !== undefined && doc.data.total < filter.minAmount) return false
    if (filter.maxAmount !== undefined && doc.data.total > filter.maxAmount) return false

    return true
  })
}

/**
 * Convertit les documents en CSV
 */
const documentsToCSV = (documents: SavedDocument[]): string => {
  const headers = [
    'ID',
    'Titre',
    'Numéro',
    'Client',
    'Email',
    'Total',
    'Nb Lignes',
    'Date Création',
    'Date Modification',
  ]

  const rows = documents.map(doc => [
    doc.id,
    `"${doc.title}"`,
    doc.documentNumber,
    `"${doc.data.client.name}"`,
    doc.data.client.email,
    doc.data.total.toFixed(2),
    doc.data.lines.length,
    new Date(doc.savedAt).toLocaleString('fr-FR'),
    new Date(doc.updatedAt).toLocaleString('fr-FR'),
  ])

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Télécharge un fichier
 */
const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
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

  hasChange: () => {
    const state = get()

    return !(
      state.data.title === defaultData.title &&
      state.data.client.name === defaultData.client.name &&
      state.data.client.address === defaultData.client.address &&
      state.data.client.email === defaultData.client.email &&
      state.data.lines.length === defaultData.lines.length &&
      state.data.total === defaultData.total &&
      state.data.globalDiscount === undefined
    )
  },

  /**
   * Réinitialise le document aux valeurs par défaut
   */
  reset: () =>
    set(() => ({
      data: defaultData,
      documentNumber: generateNumber(),
    })),

  /**
   * Sauvegarde le document actuel avec un titre
   * @returns L'ID de la sauvegarde créée
   */
  save: (saveTitle: string) => {
    const state = get()
    const documents = getAllSavedDocuments()
    const id = generateId()
    const now = new Date().toISOString()

    const savedDocument: SavedDocument = {
      id,
      title: saveTitle,
      data: state.data,
      documentNumber: state.documentNumber,
      savedAt: now,
      updatedAt: now,
    }

    documents[id] = savedDocument
    saveAllDocuments(documents)

    return id
  },

  /**
   * Charge un document sauvegardé
   */
  load: (saveId: string) => {
    const documents = getAllSavedDocuments()
    const savedDocument = documents[saveId]

    if (!savedDocument) {
      console.error(`Document "${saveId}" introuvable`)
      return false
    }

    set(() => ({
      data: recalculateDocument(savedDocument.data),
      documentNumber: savedDocument.documentNumber,
    }))

    return true
  },

  /**
   * Retourne la liste de tous les documents sauvegardés
   */
  getSavedDocuments: () => {
    const documents = getAllSavedDocuments()
    return Object.values(documents).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  },

  /**
   * Supprime un document sauvegardé
   */
  deleteSavedDocument: (saveId: string) => {
    const documents = getAllSavedDocuments()
    delete documents[saveId]
    saveAllDocuments(documents)
  },

  /**
   * Met à jour un document sauvegardé existant
   */
  updateSavedDocument: (saveId: string, saveTitle?: string) => {
    const state = get()
    const documents = getAllSavedDocuments()
    const existingDoc = documents[saveId]

    if (!existingDoc) {
      console.error(`Document "${saveId}" introuvable`)
      return false
    }

    documents[saveId] = {
      ...existingDoc,
      title: saveTitle || existingDoc.title,
      data: state.data,
      documentNumber: state.documentNumber,
      updatedAt: new Date().toISOString(),
    }

    saveAllDocuments(documents)
    return true
  },

  /**
   * Recherche des documents par terme
   */
  searchDocuments: (searchTerm: string) => {
    const documents = get().getSavedDocuments()
    return applyFilters(documents, { searchTerm })
  },

  /**
   * Filtre les documents selon plusieurs critères
   */
  filterDocuments: (filter: SaveFilter) => {
    const documents = get().getSavedDocuments()
    return applyFilters(documents, filter)
  },

  /**
   * Exporte un document en JSON
   */
  exportToJSON: (saveId?: string) => {
    const state = get()

    if (saveId) {
      const documents = getAllSavedDocuments()
      const doc = documents[saveId]
      if (!doc) {
        console.error(`Document "${saveId}" introuvable`)
        return
      }
      const filename = `${doc.title.replace(/[^a-z0-9]/gi, '_')}_${doc.documentNumber}.json`
      downloadFile(JSON.stringify(doc, null, 2), filename, 'application/json')
    } else {
      // Export du document actuel
      const currentDoc: SavedDocument = {
        id: generateId(),
        title: state.data.title,
        data: state.data,
        documentNumber: state.documentNumber,
        savedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const filename = `${state.data.title.replace(/[^a-z0-9]/gi, '_')}_${state.documentNumber}.json`
      downloadFile(JSON.stringify(currentDoc, null, 2), filename, 'application/json')
    }
  },

  /**
   * Exporte tous les documents en JSON
   */
  exportAllToJSON: () => {
    const documents = getAllSavedDocuments()
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `gosecure_documents_${timestamp}.json`
    downloadFile(JSON.stringify(documents, null, 2), filename, 'application/json')
  },

  /**
   * Exporte un ou plusieurs documents en CSV
   */
  exportToCSV: (saveIds?: string[]) => {
    const allDocuments = get().getSavedDocuments()
    const documentsToExport = saveIds
      ? allDocuments.filter(doc => saveIds.includes(doc.id))
      : allDocuments

    if (documentsToExport.length === 0) {
      console.error('Aucun document à exporter')
      return
    }

    const csv = documentsToCSV(documentsToExport)
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `gosecure_documents_${timestamp}.csv`
    downloadFile(csv, filename, 'text/csv;charset=utf-8;')
  },

  /**
   * Importe des documents depuis un JSON
   */
  importFromJSON: (jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString)
      const documents = getAllSavedDocuments()

      // Si c'est un seul document
      if (imported.id && imported.data) {
        const newId = generateId()
        documents[newId] = {
          ...imported,
          id: newId,
          savedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }
      // Si c'est un export complet
      else if (typeof imported === 'object') {
        Object.values(imported as Record<string, SavedDocument>).forEach(doc => {
          const newId = generateId()
          documents[newId] = {
            ...doc,
            id: newId,
            savedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        })
      }

      saveAllDocuments(documents)
      return true
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      return false
    }
  },
}))
