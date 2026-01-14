import type { ComponentType } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building, CreditCard, FileText, Package, Shield, X } from 'lucide-react'

import { type SettingsFormData, settingsSchema } from '../settings.schema'
import { useSettingsStore } from '../settings.store'
import { BankingTab } from './BankingTab'
import { CompanyTab } from './CompanyTab'
import { InsuranceTab } from './InsuranceTab'
import { ProductsTab } from './ProductsTab'
import { TermsTab } from './TermsTab'
import { Panel } from '../../../components/Panel.tsx'

interface TabConfig {
  id: number
  label: string
  icon: ComponentType<{ className?: string }>
  component: ComponentType
}

const TABS: TabConfig[] = [
  { id: 0, label: 'Entreprise', icon: Building, component: CompanyTab },
  { id: 1, label: 'Bancaire', icon: CreditCard, component: BankingTab },
  { id: 2, label: 'Assurance', icon: Shield, component: InsuranceTab },
  { id: 3, label: 'Conditions', icon: FileText, component: TermsTab },
  { id: 4, label: 'Produits', icon: Package, component: ProductsTab },
]

export const SettingsTabs = () => {
  const { settings, updateSettings, activeTab, setActiveTab } = useSettingsStore()

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
    mode: 'onBlur',
  })

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = methods

  const onSubmit = async (data: SettingsFormData) => {
    try {
      updateSettings(data)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleClose = () => {
    reset(settings)
  }

  // Check if a tab has errors
  const hasTabErrors = (tabId: number): boolean => {
    switch (tabId) {
      case 0:
        return !!errors.company
      case 1:
        return !!errors.banking
      case 2:
        return !!errors.insurance
      case 3:
        return !!errors.terms
      case 4:
        return !!errors.products
      default:
        return false
    }
  }

  const ActiveTabComponent = TABS[activeTab].component

  return (
    <Panel className="overflow-auto h-full">
      {/* Tabs */}
      <div className="border-b border-base-300 px-6">
        <div role="tablist" className="tabs tabs-bordered">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const hasError = hasTabErrors(tab.id)
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {hasError && (
                  <div className="badge badge-error badge-xs" title="Erreurs de validation" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <ActiveTabComponent />
          </div>

          {/* Footer Actions */}
          <div className="border-t border-base-300 p-6 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="btn btn-ghost">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary gap-2">
              {isSubmitting && <span className="loading loading-spinner loading-sm" />}
              Sauvegarder
            </button>
          </div>
        </form>
      </FormProvider>
    </Panel>
  )
}
