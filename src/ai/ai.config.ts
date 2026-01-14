/**
 * Configuration du service IA
 */

export const AI_CONFIG = {
  /**
   * Modèle OpenAI à utiliser
   * gpt-4o-mini : plus rapide et moins cher
   * gpt-4o : plus puissant
   */
  model: 'gpt-4o-mini',

  /**
   * Nombre maximum de tokens pour la réponse
   */
  maxTokens: 2000,

  /**
   * Température (créativité)
   * 0 = déterministe, 1 = créatif
   * Pour la génération de devis, on veut du déterministe
   */
  temperature: 0.3,

  /**
   * URL de l'API OpenAI
   */
  apiUrl: 'https://api.openai.com/v1/chat/completions',

  /**
   * Timeout pour les requêtes (ms)
   */
  timeout: 30000,

  /**
   * Format de réponse (pour forcer le JSON)
   */
  responseFormat: { type: 'json_object' as const },
}
