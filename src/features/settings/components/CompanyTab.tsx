import { useFormContext } from 'react-hook-form'

import type { SettingsFormData } from '../settings.schema'
import { LEGAL_FORMS } from '../settings.types'
import { LogoUploader } from './LogoUploader'

export const CompanyTab = () => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<SettingsFormData>()

  const logoValue = watch('company.logo')

  return (
    <div className="space-y-6">
      {/* Logo */}
      <LogoUploader
        value={logoValue}
        onChange={(base64) => setValue('company.logo', base64)}
        error={errors.company?.logo?.message}
      />

      {/* Section Identité */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Identité
        </h3>

        {/* Nom de l'entreprise */}
        <div className="flex flex-row gap-2">
          <div className="form-control w-full grow">
            <label className="label pt-0">
              <span className="label-text font-medium">
                Nom de l'entreprise <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              {...register('company.name')}
              className={`input input-bordered w-full ${errors.company?.name ? 'input-error' : ''}`}
              placeholder="SARL Dupont Rénovation"
            />
            {errors.company?.name && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.company.name.message}</span>
              </label>
            )}
          </div>

          {/* Forme juridique */}
          <div className="form-control w-72">
            <label className="label pt-0">
              <span className="label-text font-medium">Forme juridique</span>
            </label>
            <select {...register('company.legalForm')} className="select select-bordered w-full">
              <option value="">Sélectionner...</option>
              {LEGAL_FORMS.map((form) => (
                <option key={form.value} value={form.value}>
                  {form.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section Adresse */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Adresse
        </h3>

        {/* Adresse */}
        <div className="form-control w-full">
          <label className="label pt-0">
            <span className="label-text font-medium">
              Adresse <span className="text-error">*</span>
            </span>
          </label>
          <input
            type="text"
            {...register('company.address')}
            className={`input input-bordered w-full ${errors.company?.address ? 'input-error' : ''}`}
            placeholder="123 Rue du Commerce"
          />
          {errors.company?.address && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.company.address.message}</span>
            </label>
          )}
        </div>

        {/* Code postal + Ville */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">
                Code postal <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              {...register('company.postalCode')}
              className={`input input-bordered w-full ${errors.company?.postalCode ? 'input-error' : ''}`}
              placeholder="74000"
              maxLength={5}
            />
            {errors.company?.postalCode && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.company.postalCode.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">
                Ville <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              {...register('company.city')}
              className={`input input-bordered w-full ${errors.company?.city ? 'input-error' : ''}`}
              placeholder="Annecy"
            />
            {errors.company?.city && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.company.city.message}</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Section Contact */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Contact
        </h3>

        {/* Téléphone + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">Téléphone</span>
            </label>
            <input
              type="tel"
              {...register('company.phone')}
              className={`input input-bordered w-full ${errors.company?.phone ? 'input-error' : ''}`}
              placeholder="04 50 00 00 00"
            />
            {errors.company?.phone && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.company.phone.message}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">
                Email <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="email"
              {...register('company.email')}
              className={`input input-bordered w-full ${errors.company?.email ? 'input-error' : ''}`}
              placeholder="contact@entreprise.fr"
            />
            {errors.company?.email && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.company.email.message}</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Section Informations légales */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
          Informations légales
        </h3>

        {/* SIRET + N° TVA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">
                SIRET <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              {...register('company.siret')}
              className={`input input-bordered w-full ${errors.company?.siret ? 'input-error' : ''}`}
              placeholder="123 456 789 00012"
              maxLength={17}
            />
            {errors.company?.siret && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.company.siret.message}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">N° TVA Intracommunautaire</span>
            </label>
            <input
              type="text"
              {...register('company.vatNumber')}
              className={`input input-bordered w-full ${errors.company?.vatNumber ? 'input-error' : ''}`}
              placeholder="FR12345678901"
              maxLength={13}
            />
            {errors.company?.vatNumber && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.company.vatNumber.message}
                </span>
              </label>
            )}
          </div>
        </div>

        {/* RCS + Capital social */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">RCS</span>
            </label>
            <input
              type="text"
              {...register('company.rcs')}
              className="input input-bordered w-full"
              placeholder="RCS Annecy"
            />
          </div>

          <div className="form-control w-full">
            <label className="label pt-0">
              <span className="label-text font-medium">Capital social</span>
            </label>
            <input
              type="text"
              {...register('company.capital')}
              className="input input-bordered w-full"
              placeholder="10 000 €"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
