import { type FC, useState } from 'react'
import { Share2, X } from 'lucide-react'
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share'
import { cn } from '../utils/cn.ts'

export interface ShareButtonProps {
  /** URL à partager (défaut: URL actuelle) */
  url?: string
  /** Titre du contenu */
  title: string
  /** Description optionnelle */
  description?: string
  /** Taille des icônes en pixels */
  iconSize?: number
  /** Classe CSS personnalisée */
  className?: string
  /** Callback après partage réussi */
  onShareSuccess?: () => void
  /** Callback en cas d'erreur */
  onShareError?: (error: Error) => void
}

export const ShareButton: FC<ShareButtonProps> = ({
  url = '/',
  title,
  description,
  iconSize = 40,
  className = '',
  onShareSuccess,
  onShareError,
}) => {
  const [isSharing, setIsSharing] = useState(false)

  const handleNativeShare = async () => {
    setIsSharing(true)
    try {
      await navigator.share({
        title,
        text: description || title,
        url,
      })
      onShareSuccess?.()
    } catch (error) {
      // L'utilisateur a annulé le partage
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Erreur de partage:', error)
        onShareError?.(error)
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className={cn('fab fab-flower absolute right-4 bottom-3', className)}>
      {/* a focusable div with tabIndex is necessary to work on all browsers. role="button" is necessary for accessibility */}
      <div tabIndex={0} role="button" className="btn btn-circle btn-info">
        <Share2 size={18} />
      </div>

      {/* close button should not be focusable so it can close the FAB when clicked. It's just a visual placeholder */}
      <div className="fab-close">
        <span className="btn btn-circle btn-lg btn-error">
          <X size={22} />
        </span>
      </div>

      <FacebookShareButton
        url={url}
        title={title}
        onClick={onShareSuccess}
        className="btn btn-circle"
      >
        <FacebookIcon size={iconSize} round />
      </FacebookShareButton>

      <TwitterShareButton
        url={url}
        title={title}
        onClick={onShareSuccess}
        className="btn btn-circle"
      >
        <TwitterIcon size={iconSize} round />
      </TwitterShareButton>

      <LinkedinShareButton
        url={url}
        title={title}
        summary={description}
        onClick={onShareSuccess}
        className="btn btn-circle"
      >
        <LinkedinIcon size={iconSize} round />
      </LinkedinShareButton>

      {/* Bouton natif de partage */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          disabled={isSharing}
          className={cn('btn btn-circle btn-accent', className)}
          aria-label="Autres"
        >
          <Share2 size={22} />
        </button>
      )}
    </div>
  )
}
