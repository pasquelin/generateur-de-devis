import { useFieldArray, useFormContext } from 'react-hook-form'

import { AlertCircle, Plus, Trash2 } from 'lucide-react'

import type { SettingsFormData } from '../settings.schema'

export const DiscountsTab = () => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<SettingsFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'discounts.items',
  })

  const handleAddDiscount = () => {
    append({
      id: crypto.randomUUID(),
      label: '',
      type: 'percentage',
      value: 0,
    })
  }

  return (
    <div className="space-y-6">
      {/* Information importante */}
      <div className="alert alert-soft alert-info">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Information</p>
          <p className="text-sm">
            Ces remises prédéfinies serviront de référence rapide. L'IA pourra les suggérer et vous
            pourrez les appliquer facilement dans vos devis.
          </p>
        </div>
      </div>

      {/* Liste des remises */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-base-content/60 py-8 text-center">
            <p>Aucune remise prédéfinie</p>
            <p className="mt-1 text-sm">Cliquez sur le bouton ci-dessous pour ajouter une remise</p>
          </div>
        ) : (
          fields.map((field, index) => {
            const type = watch(`discounts.items.${index}.type`)

            return (
              <div key={field.id} className="card bg-base-200 border-base-300 space-y-4 border p-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">Remise {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="btn btn-square btn-sm btn-error"
                    title="Supprimer cette remise"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Label */}
                  <div className="form-control w-full space-y-1">
                    <label className="label pt-0">
                      <span className="label-text font-medium">
                        Label <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      {...register(`discounts.items.${index}.label`)}
                      className={`input input-bordered w-full ${errors.discounts?.items?.[index]?.label ? 'input-error' : ''}`}
                      placeholder="Ex: Remise fidélité"
                    />
                    {errors.discounts?.items?.[index]?.label && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.discounts.items[index]?.label?.message}
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Type de remise */}
                  <div className="form-control w-full space-y-1">
                    <label className="label pt-0">
                      <span className="label-text font-medium">
                        Type <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      {...register(`discounts.items.${index}.type`)}
                      className="select select-bordered w-full"
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (€)</option>
                    </select>
                  </div>
                </div>

                {/* Valeur */}
                <div className="form-control w-full space-y-1">
                  <label className="label pt-0">
                    <span className="label-text font-medium">
                      Valeur {type === 'percentage' ? '(%)' : '(€)'}{' '}
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    step={type === 'percentage' ? '1' : '0.01'}
                    min="0"
                    {...register(`discounts.items.${index}.value`, {
                      valueAsNumber: true,
                    })}
                    className={`input input-bordered w-full ${errors.discounts?.items?.[index]?.value ? 'input-error' : ''}`}
                    placeholder={type === 'percentage' ? '10' : '50.00'}
                  />
                  {errors.discounts?.items?.[index]?.value && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.discounts.items[index]?.value?.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Bouton ajouter */}
      <div className="flex justify-center">
        <button type="button" onClick={handleAddDiscount} className="btn btn-outline gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une remise
        </button>
      </div>
    </div>
  )
}
