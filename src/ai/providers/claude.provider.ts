import type { ProviderMetadata } from './provider.type.ts'
import type { AIMessage, AIServiceConfig } from '../ai.types'
import { BaseAIProvider } from './base.provider.ts'

export class ClaudeProvider extends BaseAIProvider {
  readonly metadata: ProviderMetadata = {
    id: 'claude',
    name: 'Anthropic (Claude)',
    description: 'Claude 3.5',
    apiKeyLabel: 'Clé API Anthropic',
    apiKeyPlaceholder: 'sk-ant-...',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-3-5-sonnet-20241022',
    availableModels: [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
    ],
  }

  protected override buildGenerateRequest(
    conversationHistory: AIMessage[],
    systemPrompt: string,
    config?: Partial<AIServiceConfig>,
  ): { url: string; options: RequestInit } {
    // Claude utilise un format différent : system séparé des messages
    const userMessages = conversationHistory.filter(m => m.role !== 'system')

    return {
      url: 'https://api.anthropic.com/v1/messages',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config?.model || this.metadata.defaultModel,
          system: systemPrompt,
          messages: userMessages,
          max_tokens: config?.maxTokens || 2000,
          temperature: config?.temperature ?? 0.3,
        }),
      },
    }
  }

  protected override extractContent(data: unknown): string | null {
    const response = data as { content?: Array<{ text?: string }> }
    return response.content?.[0]?.text || null
  }

  protected override buildTestRequest(): { url: string; options: RequestInit } {
    return {
      url: 'https://api.anthropic.com/v1/messages',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.metadata.defaultModel,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10,
        }),
      },
    }
  }

  /**
   * Claude peut retourner du JSON entouré de texte ou de balises.
   * Extraction du JSON avant le parsing standard.
   */
  protected override preProcessContent(content: string): string {
    const jsonMatch = new RegExp(/\{[\s\S]*}/).exec(content)
    return jsonMatch ? jsonMatch[0] : content
  }
}
