import type { ApiInfo } from '../settings.types'

const API_PROVIDERS = ['openai', 'claude', 'gemini', 'mistral', 'groq'] as const

/**
 * Nettoie les données API en ne conservant que la clé du provider actif
 * tout en préservant les clés existantes des autres providers
 */
export const cleanApiData = (formApi: ApiInfo, currentApiSettings: ApiInfo): ApiInfo => {
  const provider = formApi.provider || 'openai'
  const keyField = `${provider}Key` as keyof ApiInfo

  const cleanedApiData: Partial<ApiInfo> = {
    provider,
  }

  // Ne sauvegarder que la clé du provider sélectionné
  if (formApi[keyField]) {
    cleanedApiData[keyField] = formApi[keyField]
  }

  // Garder les clés existantes des autres providers (ne pas les écraser)
  API_PROVIDERS.forEach(p => {
    const key = `${p}Key` as keyof ApiInfo
    if (p !== provider && currentApiSettings[key]) {
      cleanedApiData[key] = currentApiSettings[key]
    }
  })

  return cleanedApiData as ApiInfo
}
