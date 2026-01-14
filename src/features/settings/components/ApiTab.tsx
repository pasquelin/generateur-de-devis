import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { ExternalLink, Eye, EyeOff, Key } from 'lucide-react'

import type { SettingsFormData } from '../settings.schema'

export const ApiTab = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<SettingsFormData>()

  const [showKey, setShowKey] = useState(false)

  return (
    <div className="space-y-6">
      {/* Information sur la clé API */}
      <div className="alert alert-soft alert-warning">
        <Key className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-semibold">Note de sécurité</p>
          <p className="text-sm">
            Votre clé API est stockée localement dans votre navigateur. Elle n'est jamais envoyée à
            nos serveurs.
          </p>
        </div>
      </div>

      {/* Clé API */}
      <div className="form-control w-full space-y-1">
        <label className="label pt-0">
          <span className="label-text font-medium">Clé API OpenAI</span>
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            {...register('api.openaiKey')}
            className={`input input-bordered w-full pr-12 ${errors.api?.openaiKey ? 'input-error' : ''}`}
            placeholder="sk-..."
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.api?.openaiKey ? (
          <label className="label">
            <span className="label-text-alt text-error">{errors.api.openaiKey.message}</span>
          </label>
        ) : (
          <label className="label">
            <span className="label-text-alt text-base-content/60 text-xs">
              Utilisée pour l'assistant vocal en temps réel (optionnel)
            </span>
          </label>
        )}
      </div>

      {/* Lien vers OpenAI */}
      <div className="card bg-base-200 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-sm">Pas de clé API ?</h3>
          <p className="text-sm text-base-content/70">
            Vous pouvez créer une clé API OpenAI gratuitement sur leur plateforme.
          </p>
          <div className="card-actions mt-2">
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline gap-2"
            >
              Créer une clé sur OpenAI
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Information sur l'usage */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h3 className="card-title text-sm">💡 Pourquoi une clé API ?</h3>
          <p className="text-sm text-base-content/70">
            L'assistant vocal utilise l'API OpenAI pour la synthèse et la reconnaissance vocale en
            temps réel. Sans clé API, cette fonctionnalité ne sera pas disponible, mais vous pourrez
            toujours utiliser l'application normalement pour créer vos devis.
          </p>
        </div>
      </div>
    </div>
  )
}
