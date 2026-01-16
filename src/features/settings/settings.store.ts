import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  ApiInfo,
  BankingInfo,
  CompanyInfo,
  CompanySettings,
  DiscountsInfo,
  InsuranceInfo,
  ProductsInfo,
  TemplateInfo,
  TermsInfo,
} from './settings.types'
import ReactGA from 'react-ga4'

interface SettingsStore {
  settings: CompanySettings
  isModalOpen: boolean
  activeTab: number
  hasValidApiConfig: () => boolean
  updateSettings: (settings: CompanySettings) => void
  updateCompany: (company: Partial<CompanyInfo>) => void
  updateBanking: (banking: Partial<BankingInfo>) => void
  updateInsurance: (insurance: Partial<InsuranceInfo>) => void
  updateTerms: (terms: Partial<TermsInfo>) => void
  updateApi: (api: Partial<ApiInfo>) => void
  updateProducts: (products: Partial<ProductsInfo>) => void
  updateDiscounts: (discounts: Partial<DiscountsInfo>) => void
  updateTemplate: (template: Partial<TemplateInfo>) => void
  resetSettings: () => void
  openModal: () => void
  closeModal: () => void
  setActiveTab: (tab: number) => void
}

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
  api: {
    provider: 'openai',
  },
  products: {
    items: [],
  },
  discounts: {
    items: [],
  },
  template: {
    activeTemplate: 'default',
    templates: {
      default: {
        name: 'Classique',
        description: 'Template standard',
        styles: {
          primaryColor: '#2563eb',
          textColor: '#1f2937',
          backgroundColor: '#f9fafb',
          accentColor: '#f59e0b',
          borderColor: '#e5e7eb',
          font: 'Helvetica',
          logoWidth: 80,
          basePadding: 40,
        },
      },
    },
  },
}

const migrateSettings = (savedSettings: CompanySettings): CompanySettings => {
  const migrated = { ...savedSettings }

  // Ensure template structure exists for older data
  if (!migrated.template) {
    migrated.template = DEFAULT_SETTINGS.template
  }

  // Ensure discounts structure exists for older data
  if (!migrated.discounts) {
    migrated.discounts = DEFAULT_SETTINGS.discounts
  }

  return migrated
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isModalOpen: false,
      activeTab: 0,

      // Getter pour vérifier si l'API est configurée
      hasValidApiConfig: () => {
        const { api } = get().settings
        const provider = api.provider

        if (!provider) return false

        const apiKey = api[`${provider}Key` as keyof ApiInfo]
        return Boolean(apiKey)
      },

      updateSettings: settings => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateSettings',
        })

        set({ settings })
      },

      updateCompany: company => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateCompany',
        })

        set(state => ({
          settings: {
            ...state.settings,
            company: { ...state.settings.company, ...company },
          },
        }))
      },

      updateBanking: banking => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateBanking',
        })

        set(state => ({
          settings: {
            ...state.settings,
            banking: { ...state.settings.banking, ...banking },
          },
        }))
      },

      updateInsurance: insurance => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateInsurance',
        })

        set(state => ({
          settings: {
            ...state.settings,
            insurance: { ...state.settings.insurance, ...insurance },
          },
        }))
      },

      updateTerms: terms => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateTerms',
        })

        set(state => ({
          settings: {
            ...state.settings,
            terms: { ...state.settings.terms, ...terms },
          },
        }))
      },

      updateApi: api => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateApi',
        })

        set(state => ({
          settings: {
            ...state.settings,
            api: { ...state.settings.api, ...api },
          },
        }))
      },

      updateProducts: products => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateProducts',
        })

        set(state => ({
          settings: {
            ...state.settings,
            products: { ...state.settings.products, ...products },
          },
        }))
      },

      updateDiscounts: discounts => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateDiscounts',
        })

        set(state => ({
          settings: {
            ...state.settings,
            discounts: { ...state.settings.discounts, ...discounts },
          },
        }))
      },

      updateTemplate: template => {
        ReactGA.event({
          category: 'Settings',
          action: 'UpdateTemplate',
        })

        set(state => ({
          settings: {
            ...state.settings,
            template: { ...state.settings.template, ...template },
          },
        }))
      },

      resetSettings: () => {
        ReactGA.event({
          category: 'Settings',
          action: 'ResetSettings',
        })

        set({ settings: DEFAULT_SETTINGS })
      },

      openModal: () => {
        ReactGA.event({
          category: 'Settings',
          action: 'OpenModal',
        })

        set({ isModalOpen: true })
      },

      closeModal: () => {
        ReactGA.event({
          category: 'Settings',
          action: 'CloseModal',
        })

        set({ isModalOpen: false, activeTab: 0 })
      },

      setActiveTab: tab => set({ activeTab: tab }),
    }),
    {
      name: 'company-settings-storage',
      partialize: state => ({ settings: state.settings }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.settings = migrateSettings(state.settings)
        }
      },
    },
  ),
)
