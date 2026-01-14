/**
 * Service IA pour l'intégration OpenAI
 */
import { SYSTEM_PROMPT } from '../prompts/system.prompt'
import { AI_CONFIG } from './ai.config'
import type { AIDocumentData, AIMessage, AIResponse, AIServiceConfig } from './ai.types'
import type { Product } from '../features/settings/settings.types.ts'

/**
 * Classe principale pour gérer les interactions avec l'API OpenAI
 */
class AIService {
  private apiKey: string | null = null

  /**
   * Configure le service avec une clé API
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey.length > 0
  }

  /**
   * Génère un document à partir de l'historique de conversation
   */
  async generateDocument(
    conversationHistory: AIMessage[],
    config?: Partial<AIServiceConfig>,
    products?: Product[],
  ): Promise<AIResponse> {
    // Vérification de la clé API
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Clé API manquante. Veuillez la configurer dans les paramètres.',
      }
    }

    try {
      // Construction des messages avec le prompt système
      const productsText = products?.length
        ? '\n\nProduits disponibles:\n' +
          products
            .map(
              (p) =>
                `- ${p.title} (${p.price}€)${p.description ? ': ' + p.description : ''}`,
            )
            .join('\n')
        : '\n\nAucun produit défini.'

      const messages: AIMessage[] = [
        {
          role: 'system',
          content: SYSTEM_PROMPT + productsText,
        },
        ...conversationHistory,
      ]

      console.log(messages)

      // Appel à l'API OpenAI
      return await this.callOpenAI(messages, config)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Appel direct à l'API OpenAI
   */
  private async callOpenAI(
    messages: AIMessage[],
    config?: Partial<AIServiceConfig>,
  ): Promise<AIResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout)

    try {
      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: config?.model || AI_CONFIG.model,
          messages: messages,
          max_tokens: config?.maxTokens || AI_CONFIG.maxTokens,
          temperature: config?.temperature ?? AI_CONFIG.temperature,
          response_format: AI_CONFIG.responseFormat,
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

      // Parse et validation du JSON
      return this.parseAIResponse(content)
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
  }

  /**
   * Parse et valide la réponse JSON de l'IA
   */
  private parseAIResponse(content: string): AIResponse {
    try {
      // Nettoyage de la réponse (au cas où l'IA ajoute du markdown)
      let cleanContent = content.trim()

      // Suppression des balises markdown si présentes
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '')
      }

      cleanContent = cleanContent.trim()

      // Parse du JSON
      const parsed = JSON.parse(cleanContent) as AIDocumentData

      // Validation basique de la structure
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
        error: `Impossible de parser la réponse JSON de l'IA`,
        rawResponse: content,
      }
    }
  }

  /**
   * Valide la structure des données du document
   */
  private isValidDocumentData(data: unknown): data is AIDocumentData {
    if (!data || typeof data !== 'object') return false

    const doc = data as Partial<AIDocumentData>

    // Vérification des champs obligatoires
    if (typeof doc.title !== 'string') return false

    if (!doc.client || typeof doc.client !== 'object') return false
    if (typeof doc.client.name !== 'string') return false
    if (typeof doc.client.address !== 'string') return false
    if (typeof doc.client.email !== 'string') return false

    if (!Array.isArray(doc.lines)) return false

    // Vérification de chaque ligne
    for (const line of doc.lines) {
      if (typeof line.description !== 'string') return false
      if (typeof line.quantity !== 'number') return false
      if (typeof line.unitPrice !== 'number') return false
    }

    return true
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: unknown): AIResponse {
    console.error('Erreur AI Service:', error)

    if (error instanceof Error) {
      // Erreurs réseau
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'Erreur de connexion. Vérifiez votre connexion internet.',
        }
      }

      // Erreur API
      if (error.message.includes('API')) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: false,
        error: `Erreur: ${error.message}`,
      }
    }

    return {
      success: false,
      error: 'Une erreur inconnue est survenue',
    }
  }

  /**
   * Test de la connexion API
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Clé API manquante',
      }
    }

    try {
      const response = await this.callOpenAI([
        {
          role: 'user',
          content: 'Test',
        },
      ])

      return {
        success: response.success,
        error: response.error,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }
    }
  }
}

// Instance singleton
export const aiService = new AIService()

// Export du type pour usage externe
export type { AIService }
