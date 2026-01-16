import type { ProviderMetadata } from './provider.type.ts'
import type { AIMessage, AIServiceConfig } from '../ai.types'
import { BaseAIProvider } from './base.provider.ts'

export class MistralProvider extends BaseAIProvider {
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

  protected override buildGenerateRequest(
    conversationHistory: AIMessage[],
    systemPrompt: string,
    config?: Partial<AIServiceConfig>,
  ): { url: string; options: RequestInit } {
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
    ]

    return {
      url: 'https://api.mistral.ai/v1/chat/completions',
      options: {
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
      },
    }
  }

  protected override extractContent(data: unknown): string | null {
    const response = data as { choices?: Array<{ message?: { content?: string } }> }
    return response.choices?.[0]?.message?.content || null
  }

  protected override buildTestRequest(): { url: string; options: RequestInit } {
    return {
      url: 'https://api.mistral.ai/v1/models',
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey!}`,
        },
      },
    }
  }
}
