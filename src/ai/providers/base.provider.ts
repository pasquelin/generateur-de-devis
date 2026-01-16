import type { AIProvider, ProviderMetadata } from './provider.type.ts'
import type { AIDocumentData, AIMessage, AIResponse, AIServiceConfig } from '../ai.types'

/**
 * Classe abstraite de base pour tous les providers IA.
 * Centralise le code commun : gestion API key, timeout, parsing, validation, erreurs.
 */
export abstract class BaseAIProvider implements AIProvider {
  protected apiKey: string | null = null

  /**
   * Métadonnées du provider (à définir dans chaque implémentation)
   */
  abstract readonly metadata: ProviderMetadata

  /**
   * Construit la requête HTTP pour générer un document
   */
  protected abstract buildGenerateRequest(
    conversationHistory: AIMessage[],
    systemPrompt: string,
    config?: Partial<AIServiceConfig>,
  ): { url: string; options: RequestInit }

  /**
   * Extrait le contenu textuel de la réponse API
   */
  protected abstract extractContent(data: unknown): string | null

  /**
   * Construit la requête HTTP pour tester la connexion
   */
  protected abstract buildTestRequest(): { url: string; options: RequestInit }

  // ============================================================================
  // Méthodes communes (peuvent être overridées si besoin)
  // ============================================================================

  setApiKey(apiKey: string): void {
    this.apiKey = this.sanitizeApiKey(apiKey)
  }

  /**
   * Nettoie la clé API pour éviter les erreurs d'encodage dans les en-têtes HTTP.
   * Override dans ClaudeProvider pour une regex légèrement différente.
   */
  protected sanitizeApiKey(apiKey: string): string {
    return apiKey
      .trim()
      .replace(/[\r\n\t]/g, '')
      .replace(/[^\x20-\x7E]/g, '')
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
        error: this.getMissingApiKeyError(),
      }
    }

    try {
      const { url, options } = this.buildGenerateRequest(conversationHistory, systemPrompt, config)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            (errorData as { error?: { message?: string } }).error?.message ||
              `Erreur API: ${response.status}`,
          )
        }

        const data = await response.json()
        const content = this.extractContent(data)

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
      const { url, options } = this.buildTestRequest()
      const response = await fetch(url, options)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error:
            (errorData as { error?: { message?: string } }).error?.message ||
            `Erreur: ${response.status}`,
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

  /**
   * Parse la réponse JSON de l'IA.
   * Override dans Claude/Gemini pour ajouter l'extraction JSON.
   */
  protected parseResponse(content: string): AIResponse {
    try {
      let cleanContent = content.trim()

      // Hook pour pré-traitement (extraction JSON pour Claude/Gemini)
      cleanContent = this.preProcessContent(cleanContent)

      // Suppression des balises markdown si présentes
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '')
      }

      cleanContent = cleanContent.trim()

      const parsed = JSON.parse(cleanContent) as AIDocumentData

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
        rawResponse: content,
      }
    } catch {
      return {
        success: false,
        error: 'Impossible de parser la réponse JSON',
        rawResponse: content,
      }
    }
  }

  /**
   * Hook pour pré-traitement du contenu avant parsing.
   * Override dans Claude/Gemini pour extraction JSON.
   */
  protected preProcessContent(content: string): string {
    return content
  }

  protected isValidDocumentData(data: unknown): data is AIDocumentData {
    if (!data || typeof data !== 'object') return false

    const doc = data as Partial<AIDocumentData>

    if (typeof doc.title !== 'string') return false

    if (!doc.client || typeof doc.client !== 'object') return false

    return Array.isArray(doc.lines)
  }

  protected handleError(error: unknown): AIResponse {
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

  /**
   * Message d'erreur pour clé API manquante.
   * Peut être override pour personnaliser le message.
   */
  protected getMissingApiKeyError(): string {
    return `Clé API ${this.metadata.name.split(' ')[0]} manquante`
  }
}
