import type { AIMessage, AIResponse, AIServiceConfig } from '../ai.types'

/**
 * Métadonnées d'un provider
 */
export interface ProviderMetadata {
  id: string // "openai", "claude", etc.
  name: string // "OpenAI (ChatGPT)"
  description: string // Description courte
  apiKeyLabel: string // "Clé API OpenAI"
  apiKeyPlaceholder: string // "sk-..."
  apiKeyUrl: string // URL pour obtenir la clé
  defaultModel: string // Modèle par défaut
  availableModels: string[] // Liste des modèles
}

/**
 * Interface que tous les providers doivent implémenter
 */
export interface AIProvider {
  /**
   * Métadonnées du provider
   */
  readonly metadata: ProviderMetadata

  /**
   * Configure le provider avec une clé API
   */
  setApiKey(apiKey: string): void

  /**
   * Vérifie si le provider est configuré
   */
  isConfigured(): boolean

  /**
   * Génère un document à partir de l'historique de conversation
   */
  generateDocument(
    conversationHistory: AIMessage[],
    systemPrompt: string,
    config?: Partial<AIServiceConfig>,
  ): Promise<AIResponse>

  /**
   * Test de connexion
   */
  testConnection(): Promise<{ success: boolean; error?: string }>
}
