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
  businessExplanation?: string
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
  provider?: string
  openaiKey?: string
  claudeKey?: string
  geminiKey?: string
  mistralKey?: string
  groqKey?: string
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

export interface PredefinedDiscount {
  id: string
  label: string
  type: 'percentage' | 'fixed'
  value: number
}

export interface DiscountsInfo {
  items: PredefinedDiscount[]
}

export interface TemplateStyle {
  primaryColor: string
  textColor: string
  backgroundColor: string
  accentColor: string
  borderColor: string
  font: string
  logoWidth: number
  basePadding: number
}

export interface TemplateConfig {
  name: string
  description?: string
  styles: TemplateStyle
}

export interface TemplateInfo {
  activeTemplate: string
  templates: Record<string, TemplateConfig>
}

export interface CompanySettings {
  company: CompanyInfo
  banking: BankingInfo
  insurance: InsuranceInfo
  terms: TermsInfo
  api: ApiInfo
  products: ProductsInfo
  discounts: DiscountsInfo
  template: TemplateInfo
}
