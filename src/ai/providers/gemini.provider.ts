import type { ProviderMetadata } from './provider.type.ts'
import type { AIMessage, AIServiceConfig } from '../ai.types'
import { BaseAIProvider } from './base.provider.ts'

export class GeminiProvider extends BaseAIProvider {
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

  protected override buildGenerateRequest(
    conversationHistory: AIMessage[],
    systemPrompt: string,
    config?: Partial<AIServiceConfig>,
  ): { url: string; options: RequestInit } {
    const contents = this.convertToGeminiFormat(conversationHistory, systemPrompt)
    const model = config?.model || this.metadata.defaultModel

    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      options: {
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
      },
    }
  }

  protected override extractContent(data: unknown): string | null {
    const response = data as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    return response.candidates?.[0]?.content?.parts?.[0]?.text || null
  }

  protected override buildTestRequest(): { url: string; options: RequestInit } {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`,
      options: {
        method: 'GET',
      },
    }
  }

  /**
   * Gemini peut retourner du JSON entouré de texte.
   * Extraction du JSON avant le parsing standard.
   */
  protected override preProcessContent(content: string): string {
    const jsonMatch = new RegExp(/\{[\s\S]*}/).exec(content)
    return jsonMatch ? jsonMatch[0] : content
  }

  /**
   * Convertit les messages au format Gemini.
   * Gemini n'a pas de rôle "system", on l'ajoute comme premier message user.
   */
  private convertToGeminiFormat(
    messages: AIMessage[],
    systemPrompt: string,
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    const geminiMessages: Array<{ role: string; parts: Array<{ text: string }> }> = []

    // Ajouter le system prompt comme premier message utilisateur
    if (systemPrompt) {
      geminiMessages.push(
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Compris, je vais suivre ces instructions.' }],
        },
      )
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
}
