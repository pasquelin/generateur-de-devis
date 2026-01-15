import { z } from 'zod'

const templateStyleSchema = z.object({
  primaryColor: z.string().min(1, 'Couleur primaire requise'),
  textColor: z.string().min(1, 'Couleur texte requise'),
  backgroundColor: z.string().min(1, 'Couleur fond requise'),
  accentColor: z.string().min(1, 'Couleur accent requise'),
  borderColor: z.string().min(1, 'Couleur bordure requise'),
  font: z.string().min(1, 'Police requise'),
  logoWidth: z.number().min(20).max(200),
  basePadding: z.number().min(10).max(100),
})

export const templateConfigSchema = z.object({
  name: z.string().min(1, 'Nom du template requis'),
  description: z.string().optional(),
  styles: templateStyleSchema,
})

export const templateInfoSchema = z.object({
  activeTemplate: z.string().min(1, 'Template actif requis'),
  templates: z.record(z.string(), templateConfigSchema),
})
