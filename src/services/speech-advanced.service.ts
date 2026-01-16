export interface SpeechRecognitionCallbacks {
  onInterim?: (transcript: string) => void // Transcription en cours
  onFinal: (transcript: string) => void // Transcription finale
  onError: (error: Error) => void
  onStart?: () => void
  onEnd?: () => void
}

export const startAdvancedSpeechRecognition = (
  callbacks: SpeechRecognitionCallbacks,
): (() => void) | null => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn("La reconnaissance vocale n'est pas supportée par ce navigateur")
    callbacks.onError(new Error('Reconnaissance vocale non supportée'))
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()

  // Configuration
  recognition.lang = 'fr-FR'
  recognition.continuous = false // S'arrête après une pause
  recognition.interimResults = true // Active les résultats intermédiaires
  recognition.maxAlternatives = 1

  // Événement de démarrage
  recognition.onstart = () => {
    console.log('🎤 Reconnaissance vocale démarrée')
    callbacks.onStart?.()
  }

  // Événement de fin
  recognition.onend = () => {
    console.log('🎤 Reconnaissance vocale terminée')
    callbacks.onEnd?.()
  }

  // Résultats (intermédiaires et finaux)
  recognition.onresult = event => {
    let interimTranscript = ''
    let finalTranscript = ''

    // Parcourir tous les résultats
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript

      if (event.results[i].isFinal) {
        finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }
    }

    // Callback pour les résultats intermédiaires
    if (interimTranscript && callbacks.onInterim) {
      callbacks.onInterim(interimTranscript)
    }

    // Callback pour le résultat final
    if (finalTranscript) {
      callbacks.onFinal(finalTranscript)
    }
  }

  // Gestion des erreurs
  recognition.onerror = event => {
    let errorMessage

    switch (event.error) {
      case 'no-speech':
        errorMessage = 'Aucune parole détectée'
        break
      case 'audio-capture':
        errorMessage = 'Microphone non accessible'
        break
      case 'not-allowed':
        errorMessage = 'Permission microphone refusée'
        break
      case 'network':
        errorMessage = 'Erreur réseau'
        break
      case 'aborted':
        errorMessage = 'Reconnaissance annulée'
        break
      default:
        errorMessage = `Erreur: ${event.error}`
    }

    console.error('❌ Erreur reconnaissance vocale:', errorMessage)
    callbacks.onError(new Error(errorMessage))
  }

  // Démarrer la reconnaissance
  try {
    recognition.start()
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error)
    callbacks.onError(error instanceof Error ? error : new Error('Erreur de démarrage'))
    return null
  }

  // Retourner la fonction d'arrêt
  return () => {
    try {
      recognition.stop()
    } catch (error) {
      console.warn("Erreur lors de l'arrêt:", error)
    }
  }
}
