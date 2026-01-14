export interface CompanyInfo {
  logo?: string
  name: string
  legalForm?: string
  address: string
  postalCode: string
  city: string
  phone?: string
  email: string
  siret: string
  vatNumber?: string
  rcs?: string
  capital?: string
}

export interface BankingInfo {
  bankName?: string
  iban?: string
  bic?: string
}

export interface InsuranceInfo {
  insurerName?: string
  policyNumber?: string
  coverageZone?: string
}

export interface TermsInfo {
  vatNotApplicable: boolean
  defaultVatRate: string
  quoteValidityDays: number
  paymentTerms: string
  paymentMethods: string
  depositRequired: boolean
  depositPercentage: number
  latePenaltyRate: string
  recoveryFee: number
  customFooterText?: string
}

export interface ApiInfo {
  openaiKey?: string
}

export interface Product {
  id: string
  title: string
  description?: string
  price: number
}

export interface ProductsInfo {
  items: Product[]
}

export interface CompanySettings {
  company: CompanyInfo
  banking: BankingInfo
  insurance: InsuranceInfo
  terms: TermsInfo
  api: ApiInfo
  products: ProductsInfo
}

export const LEGAL_FORMS = [
  { value: 'sarl', label: 'SARL' },
  { value: 'sas', label: 'SAS' },
  { value: 'sasu', label: 'SASU' },
  { value: 'eurl', label: 'EURL' },
  { value: 'ei', label: 'Entreprise Individuelle' },
  { value: 'micro', label: 'Micro-entreprise' },
  { value: 'sa', label: 'SA' },
  { value: 'sci', label: 'SCI' },
  { value: 'autre', label: 'Autre' },
]

export const VAT_RATES = [
  { value: '20', label: '20% (Taux normal)' },
  { value: '10', label: '10% (Taux intermédiaire - Travaux rénovation)' },
  { value: '5.5', label: '5,5% (Taux réduit - Travaux amélioration énergétique)' },
  { value: '2.1', label: '2,1% (Taux super réduit)' },
]

export const DEFAULT_SETTINGS: CompanySettings = {
  company: {
    name: '',
    address: '',
    postalCode: '',
    city: '',
    email: '',
    siret: '',
  },
  banking: {},
  insurance: {},
  terms: {
    vatNotApplicable: false,
    defaultVatRate: '20',
    quoteValidityDays: 30,
    paymentTerms: 'À réception de facture',
    paymentMethods: 'Virement bancaire, chèque',
    depositRequired: false,
    depositPercentage: 30,
    latePenaltyRate: "3 fois le taux d'intérêt légal en vigueur",
    recoveryFee: 40,
  },
  api: {},
  products: {
    items: [],
  },
}
