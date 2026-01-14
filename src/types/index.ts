export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

export interface DocumentData {
  title: string
  client: {
    name: string
    address: string
    email: string
  }
  lines: DocumentLine[]
  total: number
  notes?: string
}

export interface DocumentLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Settings {
  apiKey: string
  language: string
  tone: string
}
