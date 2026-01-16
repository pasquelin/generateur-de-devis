export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

export type DiscountType = 'percentage' | 'fixed'

export interface Discount {
  type: DiscountType
  value: number
  label?: string
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
  globalDiscount?: Discount
}

export interface DocumentLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discount?: Discount
  subtotal: number
  discountAmount: number
  total: number
}
