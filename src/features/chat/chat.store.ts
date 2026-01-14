import { create } from 'zustand'

import { type Message } from '../../types'

interface ChatStore {
  messages: Message[]
  addMessage: (content: string, role: 'user' | 'assistant') => void
  clearChat: () => void
}

export const useChatStore = create<ChatStore>(set => ({
  messages: [],
  addMessage: (content, role) =>
    set(state => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          role,
          content,
          timestamp: new Date(),
        },
      ],
    })),
  clearChat: () => set({ messages: [] }),
}))
