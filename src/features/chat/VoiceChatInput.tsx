import { useCallback, useEffect } from 'react'

import { Mic, VolumeX, Repeat, MousePointerClick } from 'lucide-react'

import { startAdvancedSpeechRecognition } from '../../services/speech-advanced.service'
import { ttsService } from '../../services/textToSpeech.service'
import { useVoiceChatStore } from '../../stores/voice-chat.store'
import { useSettingsStore } from '../settings/settings.store'

interface VoiceChatInputProps {
  onSendMessage: (message: string) => Promise<string | undefined>
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

  const { settings } = useSettingsStore()

  /**
   * Démarre l'écoute de l'utilisateur
   */
  const startListening = () => {
    setState('listening')
    setTranscript(null)
    setError(null)

    const stopRecognition = startAdvancedSpeechRecognition({
      // Transcription intermédiaire (en cours)
      onInterim: (interimText) => {
        setTranscript(interimText)
      },
      // Transcription finale
      onFinal: (finalText) => {
        setTranscript(finalText)
        addToHistory('user', finalText)

        // Traiter avec l'IA en utilisant le système de ChatPanel
        void processUserInput(finalText)
      },
      // Erreur
      onError: (err) => {
        console.error('❌ Erreur reconnaissance vocale:', err)
        setError(err.message)
        setState('error')
      },

      onEnd: () => {
        console.log('🛑 Écoute arrêtée automatiquement')

        // ⚠️ Si on n'est PAS en train de parler ou traiter
        const { state, autoMode } = useVoiceChatStore.getState()

        if (state === 'listening') {
          if (autoMode) {
            // Optionnel : relancer automatiquement
            startListening()
          } else {
            setState('idle') // 👈 bouton revient à l'état normal
          }
        }
      },
    })

    setRecognitionService(stopRecognition)
  }

  /**
   * Traite l'input utilisateur en utilisant le système du ChatPanel
   */
  const processUserInput = async (userInput: string) => {
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
      // Cela gère automatiquement :
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
  }

  /**
   * Lit la réponse via synthèse vocale
   */
  const speakResponse = async (text: string) => {
    setState('speaking')

    try {
      // Configurer le callback de fin
      ttsService.setOnEndCallback(() => {
        console.log('🔊 Lecture terminée')

        // En mode auto, relancer l'écoute
        if (autoMode) {
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
  }

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

  return (
    <div className="flex items-center gap-4 bg-neutral/20 px-4 py-3 rounded-box">
      {/* Bouton micro */}
      <div className="relative flex items-center justify-center shrink-0">
        {state === 'listening' && (
          <>
            <span className="absolute w-16 h-16 rounded-full bg-primary/20 animate-ping" />
            <span className="absolute w-14 h-14 rounded-full border border-primary/40 animate-pulse" />
          </>
        )}

        {state === 'speaking' && (
          <span className="absolute w-14 h-14 rounded-full border border-secondary/40 animate-pulse" />
        )}

        <button
          onClick={state === 'idle' ? startListening : stopConversation}
          disabled={!settings.api.openaiKey}
          className={`
        relative z-10 w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-300
        ${
          state === 'idle'
            ? 'bg-neutral hover:bg-muted/80 text-neutral-content cursor-pointer'
            : state === 'listening'
              ? 'bg-primary text-primary-content'
              : state === 'speaking'
                ? 'bg-secondary text-secondary-content'
                : 'bg-error text-error-content'
        }
        hover:scale-105 active:scale-95
      `}
        >
          {state === 'speaking' ? <VolumeX size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {/* Texte central */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* État / erreur */}
        {state === 'error' && error ? (
          <span className="text-xs text-error truncate">{error}</span>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">
              {state === 'idle' && 'Appuyez pour parler'}
              {state === 'listening' && 'Je vous écoute…'}
              {state === 'processing' && 'Analyse en cours…'}
              {state === 'speaking' && 'Réponse vocale'}
            </span>

            {state === 'listening' && currentTranscript && (
              <span className="text-xs italic text-primary/70 truncate">“{currentTranscript}”</span>
            )}
          </>
        )}
      </div>

      {/* Mode */}
      <button
        onClick={toggleAutoMode}
        className={`btn  btn-sm
    ${autoMode ? 'btn-primary' : 'btn-secondary'}
  `}
        title={autoMode ? 'Mode continu activé' : 'Mode manuel'}
      >
        {autoMode ? (
          <>
            <Repeat size={14} />
            <span className="hidden sm:inline">Continu</span>
          </>
        ) : (
          <>
            <MousePointerClick size={14} />
            <span className="hidden sm:inline">Manuel</span>
          </>
        )}
      </button>

      {/* Warning clé API */}
      {!settings.api.openaiKey && <span className="shrink-0 text-xs text-warning">⚠️ Clé API</span>}
    </div>
  )
}
