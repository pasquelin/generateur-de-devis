import type { DocumentData } from '../../types'
import type { CompanySettings } from '../settings/settings.types'

export interface HeaderSectionData {
  logo?: string
  companyName: string
  legalForm?: string
  capital?: string
  address: string
  postalCode: string
  city: string
  phone?: string
  email: string
  siret: string
  vatNumber?: string
  rcs?: string
  documentNumber: string
  emissionDate: string
  validityDate: string
}

export type ClientSectionData = DocumentData['client']
export type LinesSectionData = DocumentData['lines']

export interface TotalsSectionData {
  subtotal: number
  globalDiscountAmount: number
  totalAfterDiscount: number
  vatNotApplicable: boolean
  vatRate: string
  vatAmount: number
  totalTTC: number
  depositRequired: boolean
  depositPercentage: number
  depositAmount: number
}

export interface PaymentSectionData {
  paymentTerms: string
  paymentMethods: string
  depositRequired: boolean
  depositPercentage: number
}

export type BankingSectionData = CompanySettings['banking']
export type InsuranceSectionData = CompanySettings['insurance']

export interface CustomSectionData {
  text?: string
}

export interface LegalSectionData {
  latePenaltyRate: string
  recoveryFee: number
  quoteValidityDays: number
}

export interface DocumentSectionDataMap {
  header: HeaderSectionData
  client: ClientSectionData
  lines: LinesSectionData
  totals: TotalsSectionData
  payment: PaymentSectionData
  banking: BankingSectionData
  insurance: InsuranceSectionData
  custom: CustomSectionData
  legal: LegalSectionData
}

export type DocumentSection = {
  [K in keyof DocumentSectionDataMap]: {
    id: string
    type: K
    visible: boolean
    data: DocumentSectionDataMap[K]
  }
}[keyof DocumentSectionDataMap]

export interface DocumentCalculations {
  subtotal: number
  globalDiscountAmount: number
  totalAfterDiscount: number
  vatRate: number
  vatAmount: number
  totalTTC: number
  depositAmount: number
}

export interface DocumentMetadata {
  documentNumber: string
  emissionDate: string
  validityDate: string
}

export interface MissingField {
  field: string
  label: string
  required: boolean
}

export const useDocumentConfig = (
  data: DocumentData,
  settings: CompanySettings,
  documentNumber: string,
) => {
  // Calculate totals
  const subtotal = data.lines.reduce((sum, line) => sum + line.total, 0)

  // Calculate global discount amount
  let globalDiscountAmount = 0
  if (data.globalDiscount) {
    if (data.globalDiscount.type === 'percentage') {
      globalDiscountAmount = (subtotal * data.globalDiscount.value) / 100
    } else {
      globalDiscountAmount = data.globalDiscount.value
    }
  }

  const totalAfterDiscount = subtotal - globalDiscountAmount

  const vatRate = settings.terms.vatNotApplicable
    ? 0
    : Number.parseFloat(settings.terms.defaultVatRate) / 100

  const vatAmount = totalAfterDiscount * vatRate
  const totalTTC = totalAfterDiscount + vatAmount
  const depositAmount = settings.terms.depositRequired
    ? (totalTTC * settings.terms.depositPercentage) / 100
    : 0

  const calculations: DocumentCalculations = {
    subtotal,
    globalDiscountAmount,
    totalAfterDiscount,
    vatRate,
    vatAmount,
    totalTTC,
    depositAmount,
  }

  // Generate metadata
  const now = new Date()
  const metadata: DocumentMetadata = {
    documentNumber: documentNumber,
    emissionDate: now.toLocaleDateString('fr-FR'),
    validityDate: new Date(
      now.getTime() + settings.terms.quoteValidityDays * 24 * 60 * 60 * 1000,
    ).toLocaleDateString('fr-FR'),
  }

  // Check for missing required fields
  const missingFields: MissingField[] = []

  if (!settings.company.name) {
    missingFields.push({ field: 'name', label: 'Nom entreprise', required: true })
  }
  if (!settings.company.address) {
    missingFields.push({ field: 'address', label: 'Adresse', required: true })
  }
  if (!settings.company.postalCode) {
    missingFields.push({ field: 'postalCode', label: 'Code postal', required: true })
  }
  if (!settings.company.city) {
    missingFields.push({ field: 'city', label: 'Ville', required: true })
  }
  if (!settings.company.email) {
    missingFields.push({ field: 'email', label: 'Email', required: true })
  }
  if (!settings.company.siret) {
    missingFields.push({ field: 'siret', label: 'SIRET', required: true })
  }

  // Build sections structure
  const sections: DocumentSection[] = [
    {
      id: 'header',
      type: 'header',
      visible: true,
      data: {
        logo: settings.company.logo,
        companyName: settings.company.name || 'VOTRE ENTREPRISE',
        legalForm: settings.company.legalForm,
        capital: settings.company.capital,
        address: settings.company.address || "⚠️ Configurer l'adresse",
        postalCode: settings.company.postalCode || '?????',
        city: settings.company.city || '???',
        phone: settings.company.phone,
        email: settings.company.email || '⚠️ Configurer email',
        siret: settings.company.siret || '⚠️ OBLIGATOIRE',
        vatNumber: settings.company.vatNumber,
        rcs: settings.company.rcs,
        documentNumber: metadata.documentNumber,
        emissionDate: metadata.emissionDate,
        validityDate: metadata.validityDate,
      },
    },
    {
      id: 'client',
      type: 'client',
      visible: true,
      data: data.client,
    },
    {
      id: 'lines',
      type: 'lines',
      visible: true,
      data: data.lines,
    },
    {
      id: 'totals',
      type: 'totals',
      visible: true,
      data: {
        subtotal: calculations.subtotal,
        globalDiscountAmount: calculations.globalDiscountAmount,
        totalAfterDiscount: calculations.totalAfterDiscount,
        vatNotApplicable: settings.terms.vatNotApplicable,
        vatRate: settings.terms.defaultVatRate,
        vatAmount: calculations.vatAmount,
        totalTTC: calculations.totalTTC,
        depositRequired: settings.terms.depositRequired,
        depositPercentage: settings.terms.depositPercentage,
        depositAmount: calculations.depositAmount,
      },
    },
    {
      id: 'payment',
      type: 'payment',
      visible: true,
      data: {
        paymentTerms: settings.terms.paymentTerms || '⚠️ Non renseigné',
        paymentMethods: settings.terms.paymentMethods || '⚠️ Non renseigné',
        depositRequired: settings.terms.depositRequired,
        depositPercentage: settings.terms.depositPercentage,
      },
    },
    {
      id: 'banking',
      type: 'banking',
      visible: !!(settings.banking.bankName || settings.banking.iban || settings.banking.bic),
      data: settings.banking,
    },
    {
      id: 'insurance',
      type: 'insurance',
      visible: !!(settings.insurance.insurerName || settings.insurance.policyNumber),
      data: settings.insurance,
    },
    {
      id: 'custom',
      type: 'custom',
      visible: !!settings.terms.customFooterText,
      data: {
        text: settings.terms.customFooterText,
      },
    },
    {
      id: 'legal',
      type: 'legal',
      visible: true,
      data: {
        latePenaltyRate: settings.terms.latePenaltyRate || '⚠️ Non renseigné',
        recoveryFee: settings.terms.recoveryFee,
        quoteValidityDays: settings.terms.quoteValidityDays,
      },
    },
  ]

  return {
    calculations,
    metadata,
    missingFields,
    sections: sections.filter(s => s.visible),
  }
}
