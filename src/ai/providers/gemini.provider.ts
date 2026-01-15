import type { AIProvider, ProviderMetadata } from './provider.type.ts'
import type { AIDocumentData, AIMessage, AIResponse, AIServiceConfig } from '../ai.types'

export class GeminiProvider implements AIProvider {
  private apiKey: string | null = null

  readonly metadata: ProviderMetadata = {
    id: 'gemini',
    name: 'Google (Gemini)',
    description: 'Gemini Pro',
    apiKeyLabel: 'Clé API Google AI',
    apiKeyPlaceholder: 'AIza...',
    apiKeyUrl: 'https://makersuite.google.com/app/apikey',
    defaultModel: 'gemini-1.5-flash',
    availableModels: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
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
        error: 'Clé API Gemini manquante',
      }
    }

    try {
      // Gemini utilise un format différent
      const contents = this.convertToGeminiFormat(conversationHistory, systemPrompt)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const model = config?.model || this.metadata.defaultModel
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: config?.temperature ?? 0.3,
                maxOutputTokens: config?.maxTokens || 2000,
                responseMimeType: 'application/json',
              },
            }),
            signal: controller.signal,
          },
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error?.message || `Erreur API: ${response.status}`)
        }

        const data = await response.json()
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text

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
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`,
      )

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

  private convertToGeminiFormat(
    messages: AIMessage[],
    systemPrompt: string,
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    // Gemini n'a pas de rôle "system", on l'ajoute comme premier message user
    const geminiMessages: Array<{ role: string; parts: Array<{ text: string }> }> = []

    // Ajouter le system prompt comme premier message utilisateur
    if (systemPrompt) {
      geminiMessages.push({
        role: 'user',
        parts: [{ text: systemPrompt }],
      })
      // Ajouter une réponse fictive du modèle pour respecter le format alternance user/model
      geminiMessages.push({
        role: 'model',
        parts: [{ text: 'Compris, je vais suivre ces instructions.' }],
      })
    }

    // Convertir les messages
    for (const msg of messages) {
      if (msg.role === 'system') continue // Skip system messages

      geminiMessages.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })
    }

    return geminiMessages
  }

  private parseResponse(content: string): AIResponse {
    try {
      let cleanContent = content.trim()

      // Extraire le JSON si entouré de texte
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
