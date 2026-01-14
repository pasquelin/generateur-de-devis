import type { AIProvider } from '../providers/provider.type.ts'
import { OpenAIProvider } from '../providers/openai.provider'
import { ClaudeProvider } from '../providers/claude.provider'
import { GeminiProvider } from '../providers/gemini.provider'
import { MistralProvider } from '../providers/mistral.provider'
import { GroqProvider } from '../providers/groq.provider'

/**
 * Registry centralisé des providers IA
 * Gère l'enregistrement et la récupération des providers disponibles
 */
export class ProviderRegistry {
  private providers = new Map<string, AIProvider>()

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
    return this.listProviders().map((p) => p.metadata)
  }

  /**
   * Vérifie si un provider existe
   * @param id - L'ID du provider à vérifier
   * @returns true si le provider existe
   */
  hasProvider(id: string): boolean {
    return this.providers.has(id)
  }
}
