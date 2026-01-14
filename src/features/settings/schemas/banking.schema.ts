import { z } from 'zod'

export const bankingSchema = z.object({
  bankName: z.string().optional(),
  iban: z
    .string()
    .optional()
    .refine(
      val => !val || /^FR\d{2}\s?(\d{4}\s?){5}\d{3}$/.test(val.replace(/\s/g, '')),
      "L'IBAN doit être au format français (FR + 25 chiffres)",
    ),
  bic: z
    .string()
    .optional()
    .refine(
      val => !val || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(val),
      "Le BIC/SWIFT n'est pas valide",
    ),
})