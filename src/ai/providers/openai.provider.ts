import type { ProviderMetadata } from './provider.type.ts'
import type { AIMessage, AIServiceConfig } from '../ai.types'
import { BaseAIProvider } from './base.provider.ts'

export class OpenAIProvider extends BaseAIProvider {
  readonly metadata: ProviderMetadata = {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    description: 'GPT-4 et GPT-4o',
    apiKeyLabel: 'Clé API OpenAI',
    apiKeyPlaceholder: 'sk-...',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-5.2',
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-5.2'],
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
      url: 'https://api.openai.com/v1/chat/completions',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: config?.model || this.metadata.defaultModel,
          messages,
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
      url: 'https://api.openai.com/v1/models',
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
    }
  }
}
