/**
 * Store Zustand pour gérer l'état de la reconnaissance vocale
 */
import { create } from 'zustand'

interface VoiceState {
  // État de l'écoute
  isListening: boolean

  // Transcription en cours
  transcript: string | null

  // Erreur éventuelle
  error: string | null

  // Référence au service de reconnaissance vocale
  recognitionService: (() => void) | null

  // Actions
  startListening: () => void
  stopListening: () => void
  setTranscript: (transcript: string | null) => void
  setError: (error: string | null) => void
  setRecognitionService: (service: (() => void) | null) => void
  reset: () => void
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  // État initial
  isListening: false,
  transcript: null,
  error: null,
  recognitionService: null,

  // Démarrer l'écoute
  startListening: () => {
    set({
      isListening: true,
      transcript: null,
      error: null,
    })
  },

  // Arrêter l'écoute
  stopListening: () => {
    const { recognitionService } = get()

    // Arrêter le service si actif
    if (recognitionService) {
      try {
        recognitionService()
      } catch (error) {
        console.error("Erreur lors de l'arrêt de la reconnaissance vocale:", error)
      }
    }

    set({
      isListening: false,
      recognitionService: null,
    })
  },

  // Définir la transcription
  setTranscript: (transcript: string | null) => {
    set({ transcript })
  },

  // Définir une erreur
  setError: (error: string | null) => {
    set({
      error,
      isListening: false,
      recognitionService: null,
    })
  },

  // Enregistrer le service de reconnaissance
  setRecognitionService: (service: (() => void) | null) => {
    set({ recognitionService: service })
  },

  // Réinitialiser l'état
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
      isListening: false,
      transcript: null,
      error: null,
      recognitionService: null,
    })
  },
}))
