import type { ComponentType } from 'react'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Building, CreditCard, FileText, Key, Package, Shield, X } from 'lucide-react'

import { type SettingsFormData, settingsSchema } from '../settings.schema'
import { useSettingsStore } from '../settings.store'
import { ApiTab } from './ApiTab'
import { BankingTab } from './BankingTab'
import { CompanyTab } from './CompanyTab'
import { InsuranceTab } from './InsuranceTab'
import { ProductsTab } from './ProductsTab'
import { TermsTab } from './TermsTab'
import { validateApiKey } from '../utils/apiValidation'
import type { ApiInfo } from '../settings.types.ts'

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
]

export const SettingsModal = () => {
  const { isModalOpen, closeModal, settings, updateSettings, activeTab, setActiveTab } =
    useSettingsStore()

  console.log('---',settings)

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
    mode: 'onBlur',
  })

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods

  // Resynchroniser le formulaire quand les settings du store changent
  useEffect(() => {
    reset(settings)
  }, [settings, reset])

  // Watch pour validation réactive du tab API
  const apiProvider = watch('api.provider')
  const apiOpenaiKey = watch('api.openaiKey')
  const apiClaudeKey = watch('api.claudeKey')
  const apiGeminiKey = watch('api.geminiKey')
  const apiMistralKey = watch('api.mistralKey')
  const apiGroqKey = watch('api.groqKey')

  const onSubmit = async (data: SettingsFormData) => {
    try {
      // Nettoyage des clés : on ne garde que celle du provider actif
      const cleanedApiData: Partial<ApiInfo> = {
        provider: data.api.provider,
      }

      // Ne sauvegarder que la clé du provider sélectionné
      const provider = data.api.provider || 'openai'
      const keyField = `${provider}Key` as keyof ApiInfo

      if (data.api[keyField]) {
        cleanedApiData[keyField] = data.api[keyField]
      }

      // Garder les clés existantes des autres providers (ne pas les écraser)
      const currentApiSettings = settings.api
      const providers = ['openai', 'claude', 'gemini', 'mistral', 'groq']

      providers.forEach(p => {
        const key = `${p}Key` as keyof ApiInfo
        if (p !== provider && currentApiSettings[key]) {
          cleanedApiData[key] = currentApiSettings[key]
        }
      })

      // Mettre à jour les settings avec les données nettoyées
      updateSettings({
        ...data,
        api: cleanedApiData as ApiInfo,
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

  // Validation personnalisée pour le tab API (réactive)
  const hasApiErrors = (): boolean => {
    const provider = apiProvider || 'openai'
    return validateApiKey(
      provider,
      apiOpenaiKey,
      apiClaudeKey,
      apiGeminiKey,
      apiMistralKey,
      apiGroqKey,
    )
  }

  // Check if a tab has errors
  const hasTabErrors = (tabId: number): boolean => {
    switch (tabId) {
      case 0:
        return hasApiErrors() // Validation réactive pour API
      case 1:
        return !!errors.company
      case 2:
        return !!errors.banking
      case 3:
        return !!errors.insurance
      case 4:
        return !!errors.terms
      case 5:
        return !!errors.products
      default:
        return false
    }
  }

  console.log(settings.api.provider)

  if (!isModalOpen) return null

  const ActiveTabComponent = TABS[activeTab].component

  return (
    <div className="modal modal-open">
      <div className="modal-box flex max-h-[90vh] max-w-4xl flex-col p-0">
        {/* Header */}
        <div className="border-base-300 flex items-center justify-between border-b p-6">
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
        <div className="border-base-300 border-b px-6">
          <div role="tablist" className="tabs tabs-bordered">
            {TABS.map(tab => {
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

        {/* Content */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <ActiveTabComponent />
            </div>

            {/* Footer Actions */}
            <div className="border-base-300 flex justify-end gap-3 border-t p-6">
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
      <div className="modal-backdrop" onClick={handleClose} />
    </div>
  )
}
