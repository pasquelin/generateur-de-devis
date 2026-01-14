import { useFieldArray, useFormContext } from 'react-hook-form'

import { AlertCircle, Plus, Trash2 } from 'lucide-react'

import type { SettingsFormData } from '../settings.schema'

export const ProductsTab = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SettingsFormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products.items',
  })

  const handleAddProduct = () => {
    append({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      price: 0,
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
            Ces produits serviront de référence pour l'IA lors de la génération de devis. Vous
            pouvez ajouter des produits récurrents avec leur prix indicatif.
          </p>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-base-content/60 py-8 text-center">
            <p>Aucun produit configuré</p>
            <p className="mt-1 text-sm">Cliquez sur le bouton ci-dessous pour ajouter un produit</p>
          </div>
        ) : (
          fields.map((field, index) => (
            <div key={field.id} className="card bg-base-200 border-base-300 space-y-4 border p-4">
              <div className="flex items-start justify-between">
                <h4 className="font-medium">Produit {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="btn btn-square btn-sm btn-error"
                  title="Supprimer ce produit"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Titre */}
                <div className="form-control w-full space-y-1">
                  <label className="label pt-0">
                    <span className="label-text font-medium">
                      Titre <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    {...register(`products.items.${index}.title`)}
                    className={`input input-bordered w-full ${errors.products?.items?.[index]?.title ? 'input-error' : ''}`}
                    placeholder="Ex: Installation électrique complète"
                  />
                  {errors.products?.items?.[index]?.title && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.products.items[index]?.title?.message}
                      </span>
                    </label>
                  )}
                </div>

                {/* Prix */}
                <div className="form-control w-full space-y-1">
                  <label className="label pt-0">
                    <span className="label-text font-medium">
                      Prix (€) <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register(`products.items.${index}.price`, {
                      valueAsNumber: true,
                    })}
                    className={`input input-bordered w-full ${errors.products?.items?.[index]?.price ? 'input-error' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.products?.items?.[index]?.price && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.products.items[index]?.price?.message}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="form-control w-full space-y-1">
                <label className="label pt-0">
                  <span className="label-text font-medium">Description (optionnel)</span>
                </label>
                <textarea
                  {...register(`products.items.${index}.description`)}
                  className="textarea textarea-bordered w-full"
                  placeholder="Détails supplémentaires sur ce produit..."
                  rows={2}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bouton ajouter */}
      <div className="flex justify-center">
        <button type="button" onClick={handleAddProduct} className="btn btn-outline gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </button>
      </div>
    </div>
  )
}
