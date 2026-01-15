/**
 * Store Zustand pour gérer la conversation vocale bidirectionnelle
 */
import { create } from 'zustand'

type VoiceChatState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

interface VoiceChatStore {
  // État de la conversation
  state: VoiceChatState

  // Transcription en cours
  currentTranscript: string | null

  // Réponse de l'IA en cours de lecture
  currentResponse: string | null

  // Erreur éventuelle
  error: string | null

  // Historique de la conversation
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>

  // Référence au service de reconnaissance vocale
  recognitionService: (() => void) | null

  // Mode auto (continue d'écouter après la réponse)
  autoMode: boolean

  // Actions
  setState: (state: VoiceChatState) => void
  setTranscript: (transcript: string | null) => void
  setResponse: (response: string | null) => void
  setError: (error: string | null) => void
  addToHistory: (role: 'user' | 'assistant', content: string) => void
  clearHistory: () => void
  setRecognitionService: (service: (() => void) | null) => void
  toggleAutoMode: () => void
  reset: () => void
}

export const useVoiceChatStore = create<VoiceChatStore>((set, get) => ({
  // État initial
  state: 'idle',
  currentTranscript: null,
  currentResponse: null,
  error: null,
  conversationHistory: [],
  recognitionService: null,
  autoMode: false,

  // Définir l'état
  setState: state => {
    set({ state, error: state === 'error' ? get().error : null })
  },

  // Définir la transcription
  setTranscript: transcript => {
    set({ currentTranscript: transcript })
  },

  // Définir la réponse
  setResponse: response => {
    set({ currentResponse: response })
  },

  // Définir une erreur
  setError: error => {
    set({ error, state: 'error' })
  },

  // Ajouter à l'historique
  addToHistory: (role, content) => {
    set(state => ({
      conversationHistory: [...state.conversationHistory, { role, content, timestamp: new Date() }],
    }))
  },

  // Effacer l'historique
  clearHistory: () => {
    set({ conversationHistory: [], currentTranscript: null, currentResponse: null })
  },

  // Enregistrer le service de reconnaissance
  setRecognitionService: service => {
    set({ recognitionService: service })
  },

  // Basculer le mode auto
  toggleAutoMode: () => {
    set(state => ({ autoMode: !state.autoMode }))
  },

  // Réinitialiser
  reset: () => {
    const { recognitionService } = get()

    // Arrêter le service si actif
    if (recognitionService) {
      try {
        recognitionService()
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error)
      }
    }

    set({
      state: 'idle',
      currentTranscript: null,
      currentResponse: null,
      error: null,
      recognitionService: null,
    })
  },
}))
