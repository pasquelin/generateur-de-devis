import { type FC } from 'react'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

/**
 * Composant pour l'affichage de l'état
 */
interface VoiceChatInputStateDisplayProps {
  state: VoiceState
  error: string | null
  isDisabled: boolean
  stateText: string
  currentTranscript: string | null
  onOpenModal: () => void
}

export const VoiceChatInputStateDisplay: FC<VoiceChatInputStateDisplayProps> = ({
  state,
  error,
  isDisabled,
  stateText,
  currentTranscript,
  onOpenModal,
}) => {
  if (state === 'error' && error) {
    return <span className="text-error truncate text-xs">{error}</span>
  }

  if (isDisabled) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="text-warning truncate text-xs">⚠️ Configuration API requise</div>
        <button className="btn btn-xs btn-warning" onClick={onOpenModal}>
          Modifier
        </button>
      </div>
    )
  }

  return (
    <>
      <span className="text-muted-foreground text-xs">{stateText}</span>
      {state === 'listening' && currentTranscript && (
        <span className="text-primary/70 truncate text-xs italic">"{currentTranscript}"</span>
      )}
    </>
  )
}
