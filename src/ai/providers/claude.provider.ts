import type { AIProvider, ProviderMetadata } from './provider.type.ts'
import type { AIDocumentData, AIMessage, AIResponse, AIServiceConfig } from '../ai.types'

export class ClaudeProvider implements AIProvider {
  private apiKey: string | null = null

  readonly metadata: ProviderMetadata = {
    id: 'claude',
    name: 'Anthropic (Claude)',
    description: 'Claude 3.5',
    apiKeyLabel: 'Clé API Anthropic',
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-3-5-sonnet-20241022',
    availableModels: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ],
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0
  }

  async generateDocument(
    conversationHistory: AIMessage[],
    systemPrompt: string,
    config?: Partial<AIServiceConfig>,
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Clé API Claude manquante',
      }
    }

    try {
      // Claude utilise un format différent : system séparé des messages
      const userMessages = conversationHistory.filter(m => m.role !== 'system')

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: config?.model || this.metadata.defaultModel,
            system: systemPrompt,
            messages: userMessages,
            max_tokens: config?.maxTokens || 2000,
            temperature: config?.temperature ?? 0.3,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error?.message || `Erreur API: ${response.status}`)
        }

        const data = await response.json()
        const content = data.content?.[0]?.text

        if (!content) {
          throw new Error("Réponse vide de l'API")
        }

        return this.parseResponse(content)
      } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof Error && error.name === 'AbortError') {
          return {
            success: false,
            error: "Délai d'attente dépassé. Veuillez réessayer.",
          }
        }

        throw error
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'Clé API manquante' }
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.metadata.defaultModel,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error?.message || `Erreur: ${response.status}`,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    }
  }

  private parseResponse(content: string): AIResponse {
    try {
      let cleanContent = content.trim()

      // Claude peut retourner du JSON entouré de texte ou de balises
      // Extraire le JSON si entouré
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanContent = jsonMatch[0]
      }

      // Suppression des balises markdown si présentes
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '')
      }

      cleanContent = cleanContent.trim()

      const parsed = JSON.parse(cleanContent) as AIDocumentData

      // Validation basique
      if (!this.isValidDocumentData(parsed)) {
        return {
          success: false,
          error: "Structure de données invalide reçue de l'IA",
          rawResponse: content,
        }
      }

      return {
        success: true,
        data: parsed,
      }
    } catch {
      return {
        success: false,
        error: 'Impossible de parser la réponse JSON',
        rawResponse: content,
      }
    }
  }

  private isValidDocumentData(data: unknown): data is AIDocumentData {
    if (!data || typeof data !== 'object') return false

    const doc = data as Partial<AIDocumentData>

    if (typeof doc.title !== 'string') return false

    if (!doc.client || typeof doc.client !== 'object') return false
    if (typeof doc.client.name !== 'string') return false
    if (typeof doc.client.address !== 'string') return false
    if (typeof doc.client.email !== 'string') return false

    if (!Array.isArray(doc.lines)) return false

    for (const line of doc.lines) {
      if (typeof line.description !== 'string') return false
      if (typeof line.quantity !== 'number') return false
      if (typeof line.unitPrice !== 'number') return false
    }

    return true
  }

  private handleError(error: unknown): AIResponse {
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'Erreur de connexion. Vérifiez votre connexion internet.',
        }
      }

      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Une erreur inconnue est survenue',
    }
  }
}
