import { z } from 'zod'

export const companySchema = z.object({
  logo: z.string().optional(),
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  legalForm: z.string().optional(),
  address: z.string().min(1, "L'adresse est requise"),
  postalCode: z
    .string()
    .min(1, 'Le code postal est requis')
    .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),
  city: z.string().min(1, 'La ville est requise'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/.test(val),
      "Le numéro de téléphone n'est pas valide",
    ),
  email: z.string().min(1, "L'email est requis").email("L'email n'est pas valide"),
  siret: z
    .string()
    .min(1, 'Le SIRET est requis')
    .regex(/^\d{14}$/, 'Le SIRET doit contenir 14 chiffres'),
  vatNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^FR\d{11}$/.test(val),
      'Le numéro de TVA doit être au format FR + 11 chiffres',
    ),
  rcs: z.string().optional(),
  capital: z.string().optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>
