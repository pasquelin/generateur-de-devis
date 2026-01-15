import type { AIMessage, AIResponse, AIServiceConfig } from './ai.types'
import type { Product, ApiInfo } from '../features/settings/settings.types'
import type { AIProvider } from './providers/provider.type.ts'
import { ProviderRegistry } from './registry/provider.registry'
import { SYSTEM_PROMPT } from '../prompts/system.prompt'
import { useSettingsStore } from '../features/settings/settings.store'

/**
 * Service IA orchestrateur
 * Gère la sélection du provider et délègue les opérations
 */
class AIService {
  private readonly registry: ProviderRegistry
  private currentProvider: AIProvider | null = null
  private currentProviderId: string = 'openai' // Provider par défaut

  constructor() {
    this.registry = new ProviderRegistry()
    // Charge le provider par défaut
    this.setProvider(this.currentProviderId)
  }

  /**
   * Change le provider actif
   * @param providerId - ID du provider ("openai", "claude", etc.)
   * @returns true si le changement a réussi
   */
  setProvider(providerId: string): boolean {
    const provider = this.registry.getProvider(providerId)
    if (!provider) {
      console.error(`Provider "${providerId}" non trouvé`)
      return false
    }
    this.currentProvider = provider
    this.currentProviderId = providerId
    return true
  }

  /**
   * Configure la clé API du provider actif
   * @param apiKey - La clé API à configurer
   */
  setApiKey(apiKey: string): void {
    if (!this.currentProvider) {
      throw new Error('Aucun provider actif')
    }
    this.currentProvider.setApiKey(apiKey)
  }

  /**
   * Configure provider + clé API en une seule opération
   * @param providerId - ID du provider
   * @param apiKey - Clé API
   * @returns true si la configuration a réussi
   */
  configure(providerId: string, apiKey: string): boolean {
    const success = this.setProvider(providerId)
    if (success && apiKey) {
      this.setApiKey(apiKey)
    }
    return success
  }

  /**
   * Liste tous les providers disponibles (métadonnées uniquement)
   * Utile pour l'UI de sélection
   * @returns Tableau des métadonnées de tous les providers
   */
  getAvailableProviders() {
    return this.registry.getProvidersMetadata()
  }

  /**
   * Génère un document à partir de l'historique de conversation
   * Configure automatiquement le provider selon les settings
   * Délègue l'appel au provider actif
   */
  async generateDocument(
    conversationHistory: AIMessage[],
    config?: Partial<AIServiceConfig>,
    products?: Product[],
  ): Promise<AIResponse> {
    // Récupérer les settings depuis le store
    const { settings } = useSettingsStore.getState()
    const { api } = settings

    // Déterminer le provider actif
    const providerId = api.provider || 'openai'

    // Récupérer la clé API du provider actif
    const apiKey = api[`${providerId}Key` as keyof ApiInfo]

    // Vérifier que la clé existe
    if (!apiKey) {
      const providerName = providerId.charAt(0).toUpperCase() + providerId.slice(1)
      return {
        success: false,
        error: `Clé API ${providerName} manquante. Veuillez la configurer dans les paramètres.`,
      }
    }

    // Configurer le provider avec la clé (si nécessaire)
    const configSuccess = this.configure(providerId, apiKey)
    if (!configSuccess) {
      return {
        success: false,
        error: `Provider "${providerId}" non disponible`,
      }
    }

    // Vérifier que le provider est bien configuré
    if (!this.currentProvider?.isConfigured()) {
      return {
        success: false,
        error: 'Erreur de configuration du provider IA',
      }
    }

    try {
      return await this.currentProvider.generateDocument(
        conversationHistory,
        SYSTEM_PROMPT,
        products,
        config,
      )
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
