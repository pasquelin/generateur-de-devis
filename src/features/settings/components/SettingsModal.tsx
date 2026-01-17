import type { ComponentType } from 'react'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building,
  CreditCard,
  FileText,
  Key,
  Package,
  Percent,
  Shield,
  Briefcase,
  X,
} from 'lucide-react'

import { type SettingsFormData, settingsSchema } from '../settings.schema'
import { useSettingsStore } from '../settings.store'
import { ApiTab } from './ApiTab'
import { BankingTab } from './BankingTab'
import { CompanyTab } from './CompanyTab'
import { DiscountsTab } from './DiscountsTab'
import { InsuranceTab } from './InsuranceTab'
import { ProductsTab } from './ProductsTab'
import { TermsTab } from './TermsTab'
import { BusinessExplanationTab } from './BusinessExplanationTab'
import { useApiFormValidation } from '../hooks/useApiFormValidation.ts'
import { cleanApiData } from '../utils/cleanApiData.ts'
import { cn } from '../../../utils/cn.util.ts'

interface TabConfig {
  id: number
  label: string
  icon: ComponentType<{ className?: string }>
  component: ComponentType
}

const TABS: TabConfig[] = [
  { id: 0, label: 'API', icon: Key, component: ApiTab },
  { id: 1, label: 'Entreprise', icon: Building, component: CompanyTab },
  { id: 2, label: 'Bancaire', icon: CreditCard, component: BankingTab },
  { id: 3, label: 'Assurance', icon: Shield, component: InsuranceTab },
  { id: 4, label: 'Conditions', icon: FileText, component: TermsTab },
  { id: 5, label: 'Produits', icon: Package, component: ProductsTab },
  { id: 6, label: 'Remises', icon: Percent, component: DiscountsTab },
  { id: 7, label: 'Métier', icon: Briefcase, component: BusinessExplanationTab },
]

export const SettingsModal = () => {
  const { isModalOpen, closeModal, settings, updateSettings, activeTab, setActiveTab } =
    useSettingsStore()

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
    mode: 'onBlur',
  })

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = methods

  const { hasApiErrors } = useApiFormValidation(control)

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const cleanedApi = cleanApiData(data.api, settings.api)
      updateSettings({
        ...data,
        api: cleanedApi,
      })
      closeModal()
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleClose = () => {
    reset(settings)
    closeModal()
  }

  // Check if a tab has errors
  const hasTabErrors = (tabId: number): boolean => {
    switch (tabId) {
      case 0:
        return hasApiErrors() // Validation réactive pour API
      case 1:
        return !!errors.company
      case 2:
        return !!errors.company?.businessExplanation
      case 3:
        return !!errors.banking
      case 4:
        return !!errors.insurance
      case 5:
        return !!errors.terms
      case 6:
        return !!errors.products
      case 7:
        return !!errors.template
      default:
        return false
    }
  }

  // Resynchroniser le formulaire quand les settings du store changent
  useEffect(() => {
    reset(settings)
  }, [settings, reset])

  if (!isModalOpen) return null

  const ActiveTabComponent = TABS[activeTab].component

  return (
    <div className="modal modal-open">
      <div className="modal-box flex max-h-[90vh] max-w-4xl flex-col p-0">
        {/* Header */}
        <div className="border-base-300 flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Building className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">Paramètres Entreprise</h3>
          </div>
          <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div>
          <div className="border-base-300 bg-base-200 scrollbar-hide h-10 overflow-x-auto overflow-y-hidden border-b px-6">
            <div role="tablist" className="tabs tabs-bordered flex-nowrap">
              {TABS.map(tab => {
                const Icon = tab.icon
                const hasError = hasTabErrors(tab.id)
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    type="button"
                    className={cn('tab flex-nowrap gap-2', activeTab === tab.id && 'tab-active')}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {hasError && (
                      <div className="badge badge-error badge-xs" title="Erreurs de validation" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 grow flex-col overflow-hidden"
          >
            <div className="scrollbar-hide scrollbar-hide grow overflow-y-auto p-6">
              <ActiveTabComponent />
            </div>

            {/* Footer Actions */}
            <div className="border-base-300 flex justify-end gap-3 border-t px-6 py-4">
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
      </div>

      {/* Backdrop */}
      <button
        type="button"
        className="modal-backdrop"
        onClick={handleClose}
        aria-label="Fermer la modale"
      />
    </div>
  )
}
