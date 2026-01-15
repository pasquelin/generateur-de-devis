import type { AIProvider, ProviderMetadata } from './provider.type.ts'
import type { AIDocumentData, AIMessage, AIResponse, AIServiceConfig } from '../ai.types'

export class MistralProvider implements AIProvider {
  private apiKey: string | null = null

  readonly metadata: ProviderMetadata = {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large - Hébergé en Europe, RGPD compliant',
    apiKeyLabel: 'Clé API Mistral',
    apiKeyPlaceholder: '...',
    apiKeyUrl: 'https://console.mistral.ai/api-keys',
    defaultModel: 'mistral-large-latest',
    availableModels: [
      'mistral-large-latest',
      'mistral-medium-latest',
      'mistral-small-latest',
      'open-mistral-7b',
    ],
  }

  setApiKey(apiKey: string): void {
    this.apiKey = this.sanitizeApiKey(apiKey)
  }

  private sanitizeApiKey(apiKey: string): string {
    // Nettoie la clé API pour éviter les erreurs d'encodage dans les en-têtes HTTP
    return apiKey
      .trim() // Enlève les espaces en début/fin
      .replace(/[\r\n\t]/g, '') // Enlève les retours à la ligne et tabulations
      .replace(/[^\x00-\x7F]/g, '') // Enlève les caractères non-ASCII
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
        error: 'Clé API Mistral manquante',
      }
    }

    try {
      const messages: AIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ]

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey!}`,
          },
          body: JSON.stringify({
            model: config?.model || this.metadata.defaultModel,
            messages,
            max_tokens: config?.maxTokens || 2000,
            temperature: config?.temperature ?? 0.3,
            response_format: { type: 'json_object' },
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error?.message || `Erreur API: ${response.status}`)
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

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
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          Authorization: `Bearer ${this.apiKey!}`,
        },
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
