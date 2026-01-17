import { FormProvider, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { Key, X } from 'lucide-react'

import { type SettingsFormData, settingsSchema } from '../settings.schema'
import { useSettingsStore } from '../settings.store'
import { useApiModal } from '../hooks/useApiModal'
import { ApiTab } from './ApiTab'
import { useEffect } from 'react'
import { useApiFormValidation } from '../hooks/useApiFormValidation.ts'
import { cleanApiData } from '../utils/cleanApiData.ts'

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
    control,
  } = methods

  const { hasApiErrors } = useApiFormValidation(control)

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const cleanedApi = cleanApiData(data.api, settings.api)
      updateApi(cleanedApi)
      closeModal()
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const handleClose = () => {
    reset(settings)
    closeModal()
  }

  // Resynchroniser le formulaire quand les settings du store changent
  useEffect(() => {
    reset(settings)
  }, [settings, reset])

  if (!isModalOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box flex max-h-[90vh] max-w-2xl flex-col p-0">
        {/* Header */}
        <div className="border-base-300 flex items-center justify-between border-b px-6 py-4">
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
            <div className="scrollbar-hide flex-1 overflow-y-auto p-6">
              <ApiTab />
            </div>

            {/* Footer Actions */}
            <div className="border-base-300 flex justify-end gap-3 border-t px-6 py-4">
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
      <button
        type="button"
        className="modal-backdrop"
        onClick={handleClose}
        aria-label="Fermer la modale"
      />
    </div>
  )
}
