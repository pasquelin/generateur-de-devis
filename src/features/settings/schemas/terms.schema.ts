import { z } from 'zod'

export const termsSchema = z.object({
  vatNotApplicable: z.boolean(),
  defaultVatRate: z.string().min(1, 'Le taux de TVA est requis'),
  quoteValidityDays: z
    .number()
    .min(1, "La validité doit être d'au moins 1 jour")
    .max(365, 'La validité ne peut excéder 365 jours'),
  paymentTerms: z.string().min(1, 'Les conditions de paiement sont requises'),
  paymentMethods: z.string().min(1, 'Les modes de paiement sont requis'),
  depositRequired: z.boolean(),
  depositPercentage: z
    .number()
    .min(0, 'Le pourcentage ne peut être négatif')
    .max(100, 'Le pourcentage ne peut excéder 100'),
  latePenaltyRate: z.string().min(1, 'Le taux de pénalité est requis'),
  recoveryFee: z
    .number()
    .min(
      40,
      "L'indemnité forfaitaire minimum est de 40€ (art. L441-6 et D441-5 du Code de commerce)",
    )
    .max(10000, 'Le montant semble anormalement élevé'),
  customFooterText: z.string().optional(),
})
