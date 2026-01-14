/**
 * Types pour le service IA
 */

export interface AIClientInfo {
  name: string
  address: string
  email: string
}

export interface AIDocumentLine {
  description: string
  quantity: number
  unitPrice: number
}

export interface AIDocumentData {
  title: string
  client: AIClientInfo
  lines: AIDocumentLine[]
  notes?: string
  responseAudio?: string
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  success: boolean
  data?: AIDocumentData
  error?: string
  rawResponse?: string
}

export interface AIServiceConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
}
