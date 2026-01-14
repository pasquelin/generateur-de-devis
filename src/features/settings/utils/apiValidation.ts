/**
 * Détecte le type de clé API en fonction de son préfixe
 */
function detectKeyType(key: string): string | null {
  if (key.startsWith('sk-ant-')) return 'Claude'
  if (key.startsWith('sk-')) return 'OpenAI'
  if (key.startsWith('AIza')) return 'Gemini'
  if (key.startsWith('gsk_')) return 'Groq'
  return null
}

/**
 * Valide la clé API en fonction du provider sélectionné
 * Détecte les erreurs de clé cross-provider et format invalide
 */
export function validateApiKey(
  provider: string,
  apiOpenaiKey?: string,
  apiClaudeKey?: string,
  apiGeminiKey?: string,
  apiMistralKey?: string,
  apiGroqKey?: string,
): boolean {
  const keyValue = (() => {
    switch (provider) {
      case 'openai':
        return apiOpenaiKey || ''
      case 'claude':
        return apiClaudeKey || ''
      case 'gemini':
        return apiGeminiKey || ''
      case 'groq':
        return apiGroqKey || ''
      case 'mistral':
        return apiMistralKey || ''
      default:
        return ''
    }
  })()

  if (!keyValue) return false

  const detectedType = detectKeyType(keyValue)

  // Vérification cross-provider pour tous
  if (detectedType) {
    const providerTypeMap: Record<string, string> = {
      openai: 'OpenAI',
      claude: 'Claude',
      gemini: 'Gemini',
      groq: 'Groq',
    }

    const expectedType = providerTypeMap[provider] ?? null

    // Pour Mistral : si on détecte une clé d'un autre provider, c'est une erreur
    if (provider === 'mistral') {
      return true
    }

    // Pour les autres : si le type détecté ne correspond pas
    if (expectedType && detectedType !== expectedType) {
      return true // Mauvais type de clé
    }
  }

  // Validation du format selon le provider
  switch (provider) {
    case 'openai':
      return !keyValue.startsWith('sk-')
    case 'claude':
      return !keyValue.startsWith('sk-ant-')
    case 'gemini':
      return !keyValue.startsWith('AIza')
    case 'groq':
      return !keyValue.startsWith('gsk_')
    case 'mistral':
      return keyValue.length < 10
    default:
      return false
  }
}