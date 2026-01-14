import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  ApiInfo,
  BankingInfo,
  CompanyInfo,
  CompanySettings,
  InsuranceInfo,
  ProductsInfo,
  TermsInfo,
} from './settings.types'
import { DEFAULT_SETTINGS } from './settings.types'

interface SettingsStore {
  settings: CompanySettings
  isModalOpen: boolean
  activeTab: number

  // Actions
  updateSettings: (settings: CompanySettings) => void
  updateCompany: (company: Partial<CompanyInfo>) => void
  updateBanking: (banking: Partial<BankingInfo>) => void
  updateInsurance: (insurance: Partial<InsuranceInfo>) => void
  updateTerms: (terms: Partial<TermsInfo>) => void
  updateApi: (api: Partial<ApiInfo>) => void
  updateProducts: (products: Partial<ProductsInfo>) => void
  resetSettings: () => void

  // Modal actions
  openModal: () => void
  closeModal: () => void
  setActiveTab: (tab: number) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      isModalOpen: false,
      activeTab: 0,

      updateSettings: (settings) => set({ settings }),

      updateCompany: (company) =>
        set((state) => ({
          settings: {
            ...state.settings,
            company: { ...state.settings.company, ...company },
          },
        })),

      updateBanking: (banking) =>
        set((state) => ({
          settings: {
            ...state.settings,
            banking: { ...state.settings.banking, ...banking },
          },
        })),

      updateInsurance: (insurance) =>
        set((state) => ({
          settings: {
            ...state.settings,
            insurance: { ...state.settings.insurance, ...insurance },
          },
        })),

      updateTerms: (terms) =>
        set((state) => ({
          settings: {
            ...state.settings,
            terms: { ...state.settings.terms, ...terms },
          },
        })),

      updateApi: (api) =>
        set((state) => ({
          settings: {
            ...state.settings,
            api: { ...state.settings.api, ...api },
          },
        })),

      updateProducts: (products) =>
        set((state) => ({
          settings: {
            ...state.settings,
            products: { ...state.settings.products, ...products },
          },
        })),

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      openModal: () => set({ isModalOpen: true }),

      closeModal: () => set({ isModalOpen: false, activeTab: 0 }),

      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'company-settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
)
