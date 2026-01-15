import { z } from 'zod'

export const apiSchema = z
  .object({
    // Provider IA sélectionné
    provider: z.string().optional(),

    // Clés API pour chaque provider
    openaiKey: z.string().optional(),
    claudeKey: z.string().optional(),
    geminiKey: z.string().optional(),
    mistralKey: z.string().optional(),
    groqKey: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Valider uniquement la clé du provider actif
    const provider = data.provider || 'openai'
    const keyFieldName = `${provider}Key` as keyof typeof data
    const keyValue = data[keyFieldName] as string

    // Pas de validation si vide
    if (!keyValue) return

    // Fonction pour détecter le type de clé
    const detectKeyType = (key: string): string | null => {
      if (key.startsWith('sk-ant-')) return 'Claude'
      if (key.startsWith('sk-')) return 'OpenAI'
      if (key.startsWith('AIza')) return 'Gemini'
      if (key.startsWith('gsk_')) return 'Groq'
      return null
    }

    const detectedType = detectKeyType(keyValue)

    // Validation par provider avec détection cross-provider
    switch (provider) {
      case 'openai':
        if (detectedType && detectedType !== 'OpenAI') {
          ctx.addIssue({
            code: 'custom',
            message: `Cette clé semble être une clé ${detectedType}, pas OpenAI`,
            path: ['openaiKey'],
          })
        } else if (!keyValue.startsWith('sk-')) {
          ctx.addIssue({
            code: 'custom',
            message: "La clé API OpenAI doit commencer par 'sk-'",
            path: ['openaiKey'],
          })
        }
        break

      case 'claude':
        if (detectedType && detectedType !== 'Claude') {
          ctx.addIssue({
            code: 'custom',
            message: `Cette clé semble être une clé ${detectedType}, pas Claude`,
            path: ['claudeKey'],
          })
        } else if (!keyValue.startsWith('sk-ant-')) {
          ctx.addIssue({
            code: 'custom',
            message: "La clé API Claude doit commencer par 'sk-ant-'",
            path: ['claudeKey'],
          })
        }
        break

      case 'gemini':
        if (detectedType && detectedType !== 'Gemini') {
          ctx.addIssue({
            code: 'custom',
            message: `Cette clé semble être une clé ${detectedType}, pas Gemini`,
            path: ['geminiKey'],
          })
        } else if (!keyValue.startsWith('AIza')) {
          ctx.addIssue({
            code: 'custom',
            message: "La clé API Gemini doit commencer par 'AIza'",
            path: ['geminiKey'],
          })
        }
        break

      case 'groq':
        if (detectedType && detectedType !== 'Groq') {
          ctx.addIssue({
            code: 'custom',
            message: `Cette clé semble être une clé ${detectedType}, pas Groq`,
            path: ['groqKey'],
          })
        } else if (!keyValue.startsWith('gsk_')) {
          ctx.addIssue({
            code: 'custom',
            message: "La clé API Groq doit commencer par 'gsk_'",
            path: ['groqKey'],
          })
        }
        break

      case 'mistral':
        if (detectedType) {
          ctx.addIssue({
            code: 'custom',
            message: `Cette clé semble être une clé ${detectedType}, pas Mistral`,
            path: ['mistralKey'],
          })
        } else if (keyValue.length < 10) {
          ctx.addIssue({
            code: 'custom',
            message: 'La clé API Mistral semble trop courte (minimum 10 caractères)',
            path: ['mistralKey'],
          })
        }
        break
    }
  })
