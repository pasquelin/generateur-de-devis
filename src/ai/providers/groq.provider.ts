import type { ProviderMetadata } from './provider.type.ts'
import type { AIMessage, AIServiceConfig } from '../ai.types'
import { BaseAIProvider } from './base.provider.ts'

export class GroqProvider extends BaseAIProvider {
  readonly metadata: ProviderMetadata = {
    id: 'groq',
    name: 'Groq',
    description: 'Llama 3 sur LPU',
    apiKeyLabel: 'Clé API Groq',
    apiKeyPlaceholder: 'gsk_...',
    apiKeyUrl: 'https://console.groq.com/keys',
    defaultModel: 'llama-3.3-70b-versatile',
    availableModels: [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
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
      url: 'https://api.groq.com/openai/v1/chat/completions',
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
      url: 'https://api.groq.com/openai/v1/models',
      options: {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey!}`,
        },
      },
    }
  }
}
