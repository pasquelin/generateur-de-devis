/**
 * Service de synthèse vocale (Text-to-Speech)
 * Permet de convertir du texte en audio
 */

export interface TTSOptions {
  lang?: string
  rate?: number // Vitesse (0.1 à 10)
  pitch?: number // Tonalité (0 à 2)
  volume?: number // Volume (0 à 1)
  voice?: string // Nom de la voix spécifique
}

export interface TTSService {
  speak: (text: string, options?: TTSOptions) => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  getVoices: () => SpeechSynthesisVoice[]
  isSpeaking: () => boolean
  isPaused: () => boolean
}

class TextToSpeechService implements TTSService {
  private readonly synthesis: SpeechSynthesis
  private voicesLoaded = false
  private onEndCallback: (() => void) | null = null

  constructor() {
    this.synthesis = globalThis.speechSynthesis

    // Les voix sont chargées de manière asynchrone
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.voicesLoaded = true
      }
    }
  }

  /**
   * Récupère les voix disponibles
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices()
  }

  /**
   * Trouve la meilleure voix française disponible
   */
  private getBestFrenchVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices()

    // Priorités pour les voix françaises
    const priorities = [
      'Google français', // Chrome
      'Thomas', // Safari FR
      'Microsoft Hortense', // Edge FR
      'fr-FR', // Générique
    ]

    for (const priority of priorities) {
      const voice = voices.find((v) => v.name.includes(priority) || v.lang.startsWith('fr'))
      if (voice) return voice
    }

    // Fallback: première voix française trouvée
    return voices.find((v) => v.lang.startsWith('fr')) || null
  }

  /**
   * Convertit du texte en parole
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // Arrêter la lecture en cours
      this.stop()

      // Attendre que les voix soient chargées
      if (!this.voicesLoaded && this.getVoices().length === 0) {
        setTimeout(() => this.speak(text, options), 100)
        return
      }

      // Créer l'énoncé
      const utterance = new SpeechSynthesisUtterance(text)

      // Configuration
      utterance.lang = options.lang || 'fr-FR'
      utterance.rate = options.rate ?? 1
      utterance.pitch = options.pitch ?? 1
      utterance.volume = options.volume ?? 1

      // Sélection de la voix
      if (options.voice) {
        const voices = this.getVoices()
        const selectedVoice = voices.find((v) => v.name === options.voice)
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      } else {
        // Utiliser la meilleure voix française
        const bestVoice = this.getBestFrenchVoice()
        if (bestVoice) {
          utterance.voice = bestVoice
        }
      }

      // Événements
      utterance.onend = () => {
        if (this.onEndCallback) {
          this.onEndCallback()
        }
        resolve()
      }

      utterance.onerror = (event) => {
        reject(new Error(`Erreur TTS: ${event.error}`))
      }

      // Lancer la synthèse
      this.synthesis.speak(utterance)
    })
  }

  /**
   * Arrête la lecture en cours
   */
  stop(): void {
    this.synthesis.cancel()
  }

  /**
   * Met en pause la lecture
   */
  pause(): void {
    if (this.synthesis.speaking) {
      this.synthesis.pause()
    }
  }

  /**
   * Reprend la lecture
   */
  resume(): void {
    if (this.synthesis.paused) {
      this.synthesis.resume()
    }
  }

  /**
   * Vérifie si une lecture est en cours
   */
  isSpeaking(): boolean {
    return this.synthesis.speaking
  }

  /**
   * Vérifie si la lecture est en pause
   */
  isPaused(): boolean {
    return this.synthesis.paused
  }

  /**
   * Définit un callback appelé à la fin de la lecture
   */
  setOnEndCallback(callback: (() => void) | null): void {
    this.onEndCallback = callback
  }
}

// Instance singleton
export const ttsService = new TextToSpeechService()
