import { useFormContext } from 'react-hook-form'

import { AlertCircle } from 'lucide-react'

import type { SettingsFormData } from '../settings.schema'

export const BankingTab = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<SettingsFormData>()

  return (
    <div className="space-y-6">
      {/* Information importante */}
      <div className="alert alert-soft alert-warning">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Important</p>
          <p className="text-sm">
            Ces informations apparaîtront sur vos devis pour permettre à vos clients de vous régler
            par virement.
          </p>
        </div>
      </div>

      {/* Section coordonnées bancaires */}
      <div className="space-y-4">
        {/* Nom de la banque */}
        <div className="form-control w-full space-y-1">
          <label className="label pt-0">
            <span className="label-text font-medium">Nom de la banque</span>
          </label>
          <input
            type="text"
            {...register('banking.bankName')}
            className="input input-bordered w-full"
            placeholder="Crédit Agricole, BNP Paribas..."
          />
        </div>

        {/* IBAN */}
        <div className="form-control w-full space-y-1">
          <label className="label pt-0">
            <span className="label-text font-medium">IBAN</span>
          </label>
          <input
            type="text"
            {...register('banking.iban')}
            className={`input input-bordered w-full ${errors.banking?.iban ? 'input-error' : ''}`}
            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
            maxLength={34}
          />
          {errors.banking?.iban ? (
            <label className="label">
              <span className="label-text-alt text-error">{errors.banking.iban.message}</span>
            </label>
          ) : (
            <label className="label">
              <span className="label-text-alt text-base-content/60 text-xs">
                Format français : FR suivi de 25 chiffres
              </span>
            </label>
          )}
        </div>

        {/* BIC / SWIFT */}
        <div className="form-control w-full space-y-1">
          <label className="label pt-0">
            <span className="label-text font-medium">BIC / SWIFT</span>
          </label>
          <input
            type="text"
            {...register('banking.bic')}
            className={`input input-bordered w-full ${errors.banking?.bic ? 'input-error' : ''}`}
            placeholder="AGRIFRPP"
            maxLength={11}
          />
          {errors.banking?.bic ? (
            <label className="label">
              <span className="label-text-alt text-error">{errors.banking.bic.message}</span>
            </label>
          ) : (
            <label className="label">
              <span className="label-text-alt text-base-content/60 text-xs">
                Code d'identification de la banque (8 ou 11 caractères)
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
