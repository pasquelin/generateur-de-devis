import { useCallback, useEffect } from 'react'

import { Mic, VolumeX } from 'lucide-react'

import { startAdvancedSpeechRecognition } from '../../services/speech-advanced.service'
import { ttsService } from '../../services/textToSpeech.service'
import { useVoiceChatStore } from '../../stores/voice-chat.store'
import { useSettingsStore } from '../settings/settings.store'
import { useApiModal } from '../settings/hooks/useApiModal.ts'
import { VoiceChatInputModeButton } from './VoiceChatInputModeButton.tsx'
import { VoiceChatInputStateDisplay, type VoiceState } from './VoiceChatInputStateDisplay.tsx'

interface VoiceChatInputProps {
  onSendMessage: (message: string) => Promise<string | undefined>
}

/**
 * Retourne les classes CSS du bouton micro selon l'état
 */
const getButtonClasses = (state: VoiceState, isDisabled: boolean): string => {
  const baseClasses =
    'relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300'

  if (isDisabled) {
    return `${baseClasses} bg-neutral/50 text-neutral-content/50 cursor-not-allowed`
  }

  const stateClasses: Record<VoiceState, string> = {
    idle: 'bg-neutral hover:bg-muted/80 text-neutral-content cursor-pointer',
    listening: 'bg-primary text-primary-content',
    processing: 'bg-error text-error-content',
    speaking: 'bg-secondary text-secondary-content',
    error: 'bg-error text-error-content',
  }

  return `${baseClasses} ${stateClasses[state]} hover:scale-105 active:scale-95`
}

/**
 * Retourne le texte d'état à afficher
 */
const getStateText = (state: VoiceState): string => {
  const stateTexts: Record<VoiceState, string> = {
    idle: 'Appuyez pour parler',
    listening: 'Je vous écoute…',
    processing: 'Analyse en cours…',
    speaking: 'Réponse vocale',
    error: '',
  }
  return stateTexts[state]
}

export const VoiceChatInput = ({ onSendMessage }: VoiceChatInputProps) => {
  const {
    state,
    currentTranscript,
    error,
    autoMode,
    setState,
    setTranscript,
    setResponse,
    setError,
    addToHistory,
    setRecognitionService,
    toggleAutoMode,
    reset,
  } = useVoiceChatStore()

  const { openModal } = useApiModal()
  const { settings, hasValidApiConfig } = useSettingsStore()
  const isDisabled = !hasValidApiConfig()

  /**
   * Démarre l'écoute de l'utilisateur
   */
  const startListening = useCallback(() => {
    // Empêcher le démarrage si disabled
    if (isDisabled) {
      console.warn('⚠️ Configuration API invalide')
      return
    }

    setState('listening')
    setTranscript(null)
    setError(null)

    const stopRecognition = startAdvancedSpeechRecognition({
      // Transcription intermédiaire (en cours)
      onInterim: interimText => {
        setTranscript(interimText)
      },
      // Transcription finale
      onFinal: finalText => {
        setTranscript(finalText)
        addToHistory('user', finalText)

        // Traiter avec l'IA en utilisant le système de ChatPanel
        void processUserInput(finalText)
      },
      // Erreur
      onError: err => {
        console.error('❌ Erreur reconnaissance vocale:', err)
        setError(err.message)
        setState('error')
      },

      onEnd: () => {
        console.log('🛑 Écoute arrêtée automatiquement')

        // Si on n'est PAS en train de parler ou traiter
        const { state: currentState, autoMode: currentAutoMode } = useVoiceChatStore.getState()

        if (currentState === 'listening') {
          if (currentAutoMode) {
            // Optionnel: relancer automatiquement
            startListening()
          } else {
            setState('idle')
          }
        }
      },
    })

    setRecognitionService(stopRecognition)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled, setState, setTranscript, setError, addToHistory, setRecognitionService])

  /**
   * Lit la réponse via synthèse vocale
   */
  const speakResponse = useCallback(
    async (text: string) => {
      setState('speaking')

      try {
        // Configurer le callback de fin
        ttsService.setOnEndCallback(() => {
          console.log('🔊 Lecture terminée')

          // En mode auto, relancer l'écoute
          if (autoMode && !isDisabled) {
            setTimeout(() => {
              startListening()
            }, 500)
          } else {
            setState('idle')
          }
        })

        // Lancer la lecture
        await ttsService.speak(text, {
          rate: 1,
          pitch: 1,
          volume: 1,
        })
      } catch (err) {
        console.error('❌ Erreur TTS:', err)
        setError(err instanceof Error ? err.message : 'Erreur de synthèse vocale')
        setState('error')
      }
    },
    [autoMode, isDisabled, setState, setError, startListening],
  )

  /**
   * Traite l'input utilisateur en utilisant le système du ChatPanel
   */
  const processUserInput = useCallback(
    async (userInput: string) => {
      setState('processing')

      // Vérifier la clé API
      if (!settings.api.openaiKey) {
        const errorMsg = 'Veuillez configurer votre clé API OpenAI dans les paramètres.'
        setError(errorMsg)
        await speakResponse(errorMsg)
        return
      }

      try {
        // Utiliser le système de ChatPanel via onSendMessage
        // Cela gère automatiquement:
        // - L'ajout du message utilisateur
        // - L'appel à l'IA
        // - La mise à jour du document
        // - L'ajout du message de confirmation
        const responseMessage = await onSendMessage(userInput)

        // Si on a reçu une réponse, la lire
        if (responseMessage) {
          setResponse(responseMessage)
          addToHistory('assistant', responseMessage)

          // Extraire uniquement le responseAudio (première ligne avant les stats)
          const audioText = responseMessage.split('\n\n')[0]

          // Lire le texte audio
          await speakResponse(audioText)
        }
      } catch (err) {
        console.error('❌ Erreur traitement:', err)
        const errorMsg = "Une erreur s'est produite lors du traitement."
        setError(errorMsg)
        await speakResponse(errorMsg)
      }
    },
    [
      settings.api.openaiKey,
      onSendMessage,
      setState,
      setError,
      setResponse,
      addToHistory,
      speakResponse,
    ],
  )

  /**
   * Arrête la conversation
   */
  const stopConversation = useCallback(() => {
    // Arrêter la reconnaissance vocale
    const { recognitionService } = useVoiceChatStore.getState()
    if (recognitionService) {
      recognitionService()
    }

    // Arrêter la lecture audio
    ttsService.stop()

    reset()
  }, [reset])

  /**
   * Gestion des erreurs (auto-dismiss)
   */
  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => {
      if (state === 'error') {
        setState('idle')
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [error, state, setState])

  /**
   * Nettoyage au démontage
   */
  useEffect(() => {
    return () => {
      stopConversation()
    }
  }, [stopConversation])

  /**
   * Arrêter la conversation si la config devient invalide
   */
  useEffect(() => {
    if (isDisabled && state !== 'idle') {
      stopConversation()
    }
  }, [isDisabled, state, stopConversation])

  const handleButtonClick = state === 'idle' ? startListening : stopConversation
  const buttonClasses = getButtonClasses(state, isDisabled)
  const stateText = getStateText(state)
  const showListeningAnimation = state === 'listening' && !isDisabled
  const showSpeakingAnimation = state === 'speaking' && !isDisabled

  return (
    <div className="bg-neutral/20 rounded-box flex items-center gap-4 px-4 py-3">
      {/* Bouton micro */}
      <div className="relative flex shrink-0 items-center justify-center">
        {showListeningAnimation && (
          <>
            <span className="bg-primary/20 absolute h-16 w-16 animate-ping rounded-full" />
            <span className="border-primary/40 absolute h-14 w-14 animate-pulse rounded-full border" />
          </>
        )}

        {showSpeakingAnimation && (
          <span className="border-secondary/40 absolute h-14 w-14 animate-pulse rounded-full border" />
        )}

        <button onClick={handleButtonClick} disabled={isDisabled} className={buttonClasses}>
          {state === 'speaking' ? <VolumeX size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {/* Texte central */}
      <div className="flex min-w-0 flex-1 flex-col">
        <VoiceChatInputStateDisplay
          state={state}
          error={error}
          isDisabled={isDisabled}
          stateText={stateText}
          currentTranscript={currentTranscript}
          onOpenModal={openModal}
        />
      </div>

      {/* Mode */}
      <VoiceChatInputModeButton
        autoMode={autoMode}
        isDisabled={isDisabled}
        onToggle={toggleAutoMode}
      />
    </div>
  )
}
