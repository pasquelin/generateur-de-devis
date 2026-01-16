/**
 * Types pour le service IA
 */

export type AIDiscountType = 'percentage' | 'fixed'

export interface AIDiscount {
  type: AIDiscountType
  value: number
  label?: string
}

export interface AIClientInfo {
  name: string
  address: string
  email: string
}

export interface AIDocumentLine {
  description: string
  quantity: number
  unitPrice: number
  discount?: AIDiscount
}

export interface AIDocumentData {
  title: string
  client: AIClientInfo
  lines: AIDocumentLine[]
  notes?: string
  responseAudio?: string
  globalDiscount?: AIDiscount
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
