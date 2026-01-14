import { useFormContext } from 'react-hook-form'

import type { SettingsFormData } from '../settings.schema'
import { VAT_RATES } from '../settings.types'

export const TermsTab = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SettingsFormData>()

  const vatNotApplicable = watch('terms.vatNotApplicable')
  const depositRequired = watch('terms.depositRequired')

  return (
    <div className="space-y-6">
      {/* Section TVA */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">TVA</h3>

        {/* TVA non applicable */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3 py-3">
            <input type="checkbox" {...register('terms.vatNotApplicable')} className="checkbox" />
            <div>
              <span className="label-text font-medium">TVA non applicable (Micro-entreprise)</span>
              <p className="text-xs text-base-content/60 mt-1">
                Article 293 B du CGI - Si vous êtes auto-entrepreneur ou micro-entrepreneur,
                <br />
                cochez cette case pour ne pas appliquer de TVA sur vos devis.
              </p>
            </div>
          </label>
        </div>

        {/* Taux de TVA par défaut */}
        {!vatNotApplicable && (
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">
                Taux de TVA par défaut <span className="text-error">*</span>
              </span>
            </label>
            <select
              {...register('terms.defaultVatRate')}
              className={`select select-bordered w-full ${errors.terms?.defaultVatRate ? 'select-error' : ''}`}
            >
              {VAT_RATES.map((rate) => (
                <option key={rate.value} value={rate.value}>
                  {rate.label}
                </option>
              ))}
            </select>
            {errors.terms?.defaultVatRate && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.terms.defaultVatRate.message}
                </span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Section Validité et paiement */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Validité et paiement
        </h3>

        {/* Validité du devis */}
        <div className="grid grid-cols-3 gap-4">
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">
                Validité du devis (jours) <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="number"
              {...register('terms.quoteValidityDays', { valueAsNumber: true })}
              className={`input input-bordered w-full ${errors.terms?.quoteValidityDays ? 'input-error' : ''}`}
              placeholder="30"
              min="1"
              max="365"
            />
            {errors.terms?.quoteValidityDays && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.terms.quoteValidityDays.message}
                </span>
              </label>
            )}
          </div>

          {/* Conditions de paiement */}
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">
                Conditions de paiement <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              {...register('terms.paymentTerms')}
              className={`input input-bordered w-full ${errors.terms?.paymentTerms ? 'input-error' : ''}`}
              placeholder="À réception de facture"
            />
            {errors.terms?.paymentTerms && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.terms.paymentTerms.message}
                </span>
              </label>
            )}
          </div>

          {/* Modes de paiement acceptés */}
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">
                Modes de paiement acceptés <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              {...register('terms.paymentMethods')}
              className={`input input-bordered w-full ${errors.terms?.paymentMethods ? 'input-error' : ''}`}
              placeholder="Virement bancaire, chèque"
            />
            {errors.terms?.paymentMethods && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.terms.paymentMethods.message}
                </span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Section Acompte */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Acompte
        </h3>

        {/* Acompte requis */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3 py-3">
            <input type="checkbox" {...register('terms.depositRequired')} className="checkbox" />
            <span className="label-text font-medium">Acompte requis à la commande</span>
          </label>
        </div>

        {/* Pourcentage d'acompte */}
        {depositRequired && (
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">Pourcentage d'acompte</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                {...register('terms.depositPercentage', { valueAsNumber: true })}
                className={`input input-bordered flex-1 ${errors.terms?.depositPercentage ? 'input-error' : ''}`}
                placeholder="30"
                min="0"
                max="100"
              />
              <span className="text-lg font-medium">%</span>
            </div>
            {errors.terms?.depositPercentage && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.terms.depositPercentage.message}
                </span>
              </label>
            )}
          </div>
        )}
      </div>

      {/* Section Pénalités de retard */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Pénalités de retard
        </h3>

        {/* Taux de pénalité */}
        <div className="form-control w-full">
          <label className="label pt-0">
            <span className="label-text font-medium">
              Taux de pénalité <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="text"
            {...register('terms.latePenaltyRate')}
            className={`input input-bordered w-full ${errors.terms?.latePenaltyRate ? 'input-error' : ''}`}
            placeholder="3 fois le taux d'intérêt légal en vigueur"
          />
          {errors.terms?.latePenaltyRate && (
            <label className="label">
              <span className="label-text-alt text-error">
                {errors.terms.latePenaltyRate.message}
              </span>
            </label>
          )}
        </div>

        {/* Indemnité forfaitaire */}
        <div className="form-control w-full">
          <label className="label pt-0">
            <span className="label-text font-medium">
              Indemnité forfaitaire de recouvrement (€) <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="number"
            {...register('terms.recoveryFee', { valueAsNumber: true })}
            className={`input input-bordered w-full ${errors.terms?.recoveryFee ? 'input-error' : ''}`}
            placeholder="40"
            min="40"
          />
          {errors.terms?.recoveryFee ? (
            <label className="label">
              <span className="label-text-alt text-error">{errors.terms.recoveryFee.message}</span>
            </label>
          ) : (
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Minimum légal : 40 € (art. L441-6 et D441-5 du Code de commerce)
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Section Texte personnalisé */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Texte personnalisé
        </h3>

        {/* Texte personnalisé */}
        <div className="form-control w-full">
          <label className="label pt-0">
            <span className="label-text font-medium">Pied de devis (optionnel)</span>
          </label>
          <textarea
            {...register('terms.customFooterText')}
            className="textarea textarea-bordered w-full h-32 resize-none"
            placeholder="Texte libre qui apparaîtra en bas de vos devis..."
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Exemple : conditions particulières, informations sur votre activité, etc.
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
