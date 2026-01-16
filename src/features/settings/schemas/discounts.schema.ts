import { z } from 'zod'

export const discountSchema = z.object({
  id: z.string(),
  label: z.string().min(1, 'Le label est requis'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0, 'La valeur doit être positive'),
})

export const discountsSchema = z.object({
  items: z.array(discountSchema),
})
