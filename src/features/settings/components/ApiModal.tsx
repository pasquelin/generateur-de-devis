import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Key, X } from 'lucide-react'

import { type SettingsFormData, settingsSchema } from '../settings.schema'
import { useSettingsStore } from '../settings.store'
import { useApiModal } from '../hooks/useApiModal'
import { ApiTab } from './ApiTab'
import { validateApiKey } from '../utils/apiValidation'
import type { ApiInfo } from '../settings.types'
import { useEffect } from 'react'

export const ApiModal = () => {
  const { isModalOpen, closeModal } = useApiModal()
  const { settings, updateApi } = useSettingsStore()

  const methods = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...settings,
    },
    mode: 'onBlur',
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
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

      // Mettre à jour l'API avec les données nettoyées
      updateApi(cleanedApiData as ApiInfo)

      closeModal()
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleClose = () => {
    reset(settings)
    closeModal()
  }

  if (!isModalOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box flex max-h-[90vh] max-w-2xl flex-col p-0">
        {/* Header */}
        <div className="border-base-300 flex items-center justify-between border-b p-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Key className="text-primary h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">Configuration API</h3>
          </div>
          <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <ApiTab />
            </div>

            {/* Footer Actions */}
            <div className="border-base-300 flex justify-end gap-3 border-t p-6">
              <button type="button" onClick={handleClose} className="btn btn-ghost">
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || hasApiErrors()}
                className="btn btn-primary gap-2"
              >
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