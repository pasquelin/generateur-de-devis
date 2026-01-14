import { useFormContext } from 'react-hook-form'

import { Info } from 'lucide-react'

import type { SettingsFormData } from '../settings.schema'

export const InsuranceTab = () => {
  const { register } = useFormContext<SettingsFormData>()

  return (
    <div className="space-y-6">
      {/* Information assurance décennale */}
      <div className="alert alert-soft alert-info">
        <Info className="h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Assurance décennale</p>
          <p className="text-sm">
            Obligatoire pour les artisans du bâtiment. Ces informations seront affichées sur tous
            vos devis.
          </p>
        </div>
      </div>

      {/* Section informations assurance */}
      <div className="space-y-4">
        {/* Nom de l'assureur */}
        <div className="form-control w-full space-y-1">
          <label className="label pt-0">
            <span className="label-text font-medium">Nom de l'assureur</span>
          </label>
          <input
            type="text"
            {...register('insurance.insurerName')}
            className="input input-bordered w-full"
            placeholder="AXA France, MAAF, Allianz..."
          />
        </div>

        {/* N° de police / contrat */}
        <div className="form-control w-full space-y-1">
          <label className="label pt-0">
            <span className="label-text font-medium">N° de police / contrat</span>
          </label>
          <input
            type="text"
            {...register('insurance.policyNumber')}
            className="input input-bordered w-full"
            placeholder="123456789"
          />
        </div>

        {/* Zone de couverture géographique */}
        <div className="form-control w-full space-y-1">
          <label className="label pt-0">
            <span className="label-text font-medium">Zone de couverture géographique</span>
          </label>
          <input
            type="text"
            {...register('insurance.coverageZone')}
            className="input input-bordered w-full"
            placeholder="France entière"
          />
        </div>
      </div>
    </div>
  )
}
