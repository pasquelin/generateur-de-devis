import { type Control, useWatch } from 'react-hook-form'
import type { SettingsFormData } from '../settings.schema.ts'
import { validateApiKey } from '../utils/apiValidation.ts'

export const useApiFormValidation = (control: Control<SettingsFormData>) => {
  const apiProvider = useWatch({ control, name: 'api.provider' })
  const apiOpenaiKey = useWatch({ control, name: 'api.openaiKey' })
  const apiClaudeKey = useWatch({ control, name: 'api.claudeKey' })
  const apiGeminiKey = useWatch({ control, name: 'api.geminiKey' })
  const apiMistralKey = useWatch({ control, name: 'api.mistralKey' })
  const apiGroqKey = useWatch({ control, name: 'api.groqKey' })

  const hasApiErrors = (): boolean => {
    const provider = apiProvider || 'openai'
    return validateApiKey(
      provider,
      apiOpenaiKey,
      apiClaudeKey,
      apiGeminiKey,
      apiMistralKey,
      apiGroqKey,
    )
  }

  return { apiProvider, hasApiErrors }
}
