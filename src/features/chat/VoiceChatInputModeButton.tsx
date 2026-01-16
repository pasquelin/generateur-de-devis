import { type FC } from 'react'

// eslint-disable-next-line no-shadow-restricted-names
import { MousePointerClick, Infinity } from 'lucide-react'

/**
 * Composant pour le bouton de mode
 */
interface VoiceChatInputModeButtonProps {
  autoMode: boolean
  isDisabled: boolean
  onToggle: () => void
}

export const VoiceChatInputModeButton: FC<VoiceChatInputModeButtonProps> = ({
  autoMode,
  isDisabled,
  onToggle,
}) => {
  const buttonClass = `btn btn-sm ${autoMode ? 'btn-primary' : 'btn-secondary'} ${isDisabled ? 'btn-disabled' : ''}`

  const getTitle = (): string => {
    if (isDisabled) return 'Configuration API requise'
    return autoMode ? 'Mode continu activé' : 'Mode manuel'
  }

  return (
    <button onClick={onToggle} disabled={isDisabled} className={buttonClass} title={getTitle()}>
      {autoMode ? (
        <>
          <Infinity size={14} />
          <span className="hidden sm:inline">Continu</span>
        </>
      ) : (
        <>
          <MousePointerClick size={14} />
          <span className="hidden sm:inline">Manuel</span>
        </>
      )}
    </button>
  )
}
