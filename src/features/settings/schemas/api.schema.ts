import { z } from 'zod'

export const apiSchema = z.object({
  openaiKey: z
    .string()
    .optional()
    .refine((val) => !val || val.startsWith('sk-'), "La clé API OpenAI doit commencer par 'sk-'"),
})

export type ApiFormData = z.infer<typeof apiSchema>
