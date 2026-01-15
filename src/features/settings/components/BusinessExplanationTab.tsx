import { useFormContext } from 'react-hook-form'

import type { SettingsFormData } from '../settings.schema'

export const BusinessExplanationTab = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<SettingsFormData>()

  return (
    <div className="space-y-6">
      {/* Explication du métier */}
      <div className="form-control w-full space-y-1">
        <label className="label pt-0">
          <span className="label-text font-medium">Explication du métier / Services</span>
        </label>
        <textarea
          {...register('company.businessExplanation')}
          className={`textarea textarea-bordered h-96 w-full resize-none font-mono text-sm ${errors.company?.businessExplanation ? 'textarea-error' : ''}`}
          placeholder={`Exemple:
L'entreprise réalise des prestations liées aux échappements automobiles, notamment :
- X-pipe
- Downpipe
- Ligne complète
- Silencieux
- Décatalyseur
- Modification ou fabrication sur mesure
- Soudures
- Adaptation d'échappement
- Suppression FAP (UNIQUEMENT si mentionnée explicitement)
- Matériaux : inox, titane, acier
- Véhicules : marques, modèles, motorisations, années`}
        />
        {errors.company?.businessExplanation && (
          <label className="label">
            <span className="label-text-alt text-error">
              {errors.company.businessExplanation.message}
            </span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt text-base-content/60 text-xs">
            Décrivez vos services, vos spécialités et votre domaine d'activité. Ces informations
            seront utilisées par l'IA pour mieux comprendre votre métier.
          </span>
        </label>
      </div>
    </div>
  )
}
