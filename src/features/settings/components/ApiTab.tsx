import { useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { ExternalLink, Eye, EyeOff, Key } from 'lucide-react'

import type { SettingsFormData } from '../settings.schema'
import { aiService } from '../../../ai/ai.service'

export const ApiTab = () => {
  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<SettingsFormData>()

  const [showKey, setShowKey] = useState(false)

  // Provider sélectionné
  const selectedProvider = watch('api.provider') || 'openai'

  // Liste des providers disponibles
  const providers = useMemo(() => aiService.getAvailableProviders(), [])

  // Métadonnées du provider actif
  const currentProviderMeta = useMemo(
    () => providers.find(p => p.id === selectedProvider),
    [providers, selectedProvider],
  )

  // Nom du champ de clé API dynamique (ex: "api.openaiKey")
  type ApiKeyField =
    | 'api.openaiKey'
    | 'api.claudeKey'
    | 'api.geminiKey'
    | 'api.mistralKey'
    | 'api.groqKey'
  const apiKeyFieldName = `api.${selectedProvider}Key` as ApiKeyField

  // Nom du champ pour les erreurs (ex: "openaiKey")
  const apiKeyErrorFieldName = `${selectedProvider}Key` as
    | 'openaiKey'
    | 'claudeKey'
    | 'geminiKey'
    | 'mistralKey'
    | 'groqKey'

  // Forcer la mise à jour de la valeur quand le provider change
  useEffect(() => {
    const currentValue = getValues(apiKeyFieldName)
    setValue(apiKeyFieldName, currentValue || '', { shouldValidate: false })
  }, [selectedProvider, apiKeyFieldName, setValue, getValues])

  return (
    <div className="space-y-6">
      {/* Information sur la clé API */}
      <div className="alert alert-soft alert-warning">
        <Key className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Note de sécurité</p>
          <p className="text-sm">Votre clé API est stockée localement dans votre navigateur.</p>
        </div>
      </div>

      {/* Sélection du provider */}
      <div className="form-control w-full space-y-1">
        <label className="label pt-0">
          <span className="label-text font-medium">Le fournisseur IA</span>
        </label>
        <select {...register('api.provider')} className="select select-bordered w-full">
          {providers.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
        {currentProviderMeta && (
          <label className="label">
            <span className="label-text-alt text-base-content/60 text-xs">
              {currentProviderMeta.description}
            </span>
          </label>
        )}
      </div>

      {/* Clé API (champ dynamique) */}
      {currentProviderMeta && (
        <div className="form-control w-full space-y-1">
          <label className="label pt-0">
            <span className="label-text font-medium">{currentProviderMeta.apiKeyLabel}</span>
          </label>
          <div className="relative">
            <input
              key={selectedProvider}
              type={showKey ? 'text' : 'password'}
              {...register(apiKeyFieldName)}
              className={`input input-bordered w-full pr-12 ${
                errors.api?.[apiKeyErrorFieldName] ? 'input-error' : ''
              }`}
              placeholder={currentProviderMeta.apiKeyPlaceholder}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="btn btn-ghost btn-sm btn-circle absolute top-1/2 right-3 -translate-y-1/2"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.api?.[apiKeyErrorFieldName] ? (
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.api[apiKeyErrorFieldName]?.message}
              </span>
            </label>
          ) : (
            <div className="label">
              <span className="label-text-alt text-base-content/60 text-xs">
                Utilisée pour la génération de devis via IA
              </span>
            </div>
          )}
        </div>
      )}

      {/* Lien vers la plateforme du provider */}
      {currentProviderMeta && (
        <div className="card bg-base-200 border-base-300 border">
          <div className="card-body">
            <h3 className="card-title text-sm">Pas de clé API ?</h3>
            <p className="text-base-content/70 text-sm">
              Vous pouvez créer une clé API gratuitement sur la plateforme{' '}
              {currentProviderMeta.name}.
            </p>
            <div className="card-actions mt-2">
              <a
                href={currentProviderMeta.apiKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline gap-2"
              >
                Créer une clé sur {currentProviderMeta.name}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
