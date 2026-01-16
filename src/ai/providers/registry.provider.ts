import type { AIProvider } from './provider.type.ts'
import { OpenAIProvider } from './openai.provider.ts'
import { ClaudeProvider } from './claude.provider.ts'
import { GeminiProvider } from './gemini.provider.ts'
import { MistralProvider } from './mistral.provider.ts'
import { GroqProvider } from './groq.provider.ts'

/**
 * Registry centralisé des providers IA
 * Gère l'enregistrement et la récupération des providers disponibles
 */
export class RegistryProvider {
  private readonly providers = new Map<string, AIProvider>()

  constructor() {
    // Enregistrement des providers disponibles
    this.register(new OpenAIProvider())
    this.register(new ClaudeProvider())
    this.register(new GeminiProvider())
    this.register(new MistralProvider())
    this.register(new GroqProvider())
  }

  /**
   * Enregistre un provider dans le registry
   */
  private register(provider: AIProvider): void {
    this.providers.set(provider.metadata.id, provider)
  }

  /**
   * Récupère un provider par son ID
   * @param id - L'ID du provider (ex: "openai", "claude")
   * @returns Le provider ou undefined s'il n'existe pas
   */
  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id)
  }

  /**
   * Liste tous les providers disponibles
   * @returns Tableau de tous les providers enregistrés
   */
  listProviders(): AIProvider[] {
    return Array.from(this.providers.values())
  }

  /**
   * Récupère uniquement les métadonnées de tous les providers
   * Utile pour l'UI (sélecteur de provider)
   * @returns Tableau des métadonnées de tous les providers
   */
  getProvidersMetadata() {
    return this.listProviders().map(p => p.metadata)
  }
}
