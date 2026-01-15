import { type FormEvent, useEffect, useState } from 'react'

import { Send } from 'lucide-react'

import { Button } from '../../components/Button'
import { useVoiceStore } from '../../stores/voice.store'
import { useSettingsStore } from '../settings/settings.store.ts'

interface ChatInputProps {
  onSendMessage: (message: string) => void
}

export const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [input, setInput] = useState('')

  const { isListening, transcript, error, setError } = useVoiceStore()
  const { hasValidApiConfig } = useSettingsStore()
  const isDisabled = !hasValidApiConfig()

  /**
   * Gestion des erreurs (side-effect temporel légitime)
   */
  useEffect(() => {
    if (!error) return

    const timer = setTimeout(() => {
      setError(null)
    }, 3000)

    return () => clearTimeout(timer)
  }, [error, setError])

  /**
   * Envoi manuel (clavier)
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isListening) return

    onSendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="space-y-2">
      {/* Indicateur visuel d'écoute */}
      {isListening && (
        <div className="bg-primary/10 flex animate-pulse items-center gap-2 rounded-lg px-4 py-2">
          <div className="bg-primary h-3 w-3 rounded-full" />
          <span className="text-primary text-sm font-medium">
            Écoute en cours… Parlez maintenant
          </span>
        </div>
      )}

      {/* Transcript en cours (métier utilisé) */}
      {isListening && transcript && (
        <div className="text-primary/80 bg-primary/5 rounded-lg px-4 py-2 text-sm italic">
          🎤 {transcript}
        </div>
      )}

      {/* Erreurs */}
      {error && <div className="bg-error/10 text-error rounded-lg px-4 py-2 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isListening ? 'Écoute en cours…' : 'Tapez votre message…'}
          className="input input-bordered flex-1"
          disabled={isListening || isDisabled}
        />
        <Button type="submit" disabled={!input.trim() || isListening || isDisabled}>
          <Send size={20} />
        </Button>
      </form>
    </div>
  )
}
