import { z } from 'zod'

export const productSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être positif'),
})

export const productsSchema = z.object({
  items: z.array(productSchema),
})

export type ProductFormData = z.infer<typeof productSchema>
export type ProductsFormData = z.infer<typeof productsSchema>