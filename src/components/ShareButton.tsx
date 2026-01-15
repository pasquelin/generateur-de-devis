import { type FC, useState } from 'react'
import { Share2 } from 'lucide-react'
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
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
    <div className={cn('flex items-center gap-3', className)}>
      <div className="transition-transform duration-200 hover:scale-110">
        <FacebookShareButton
          url={url}
          title={title}
          onClick={onShareSuccess}
          className="btn btn-circle"
        >
          <FacebookIcon size={iconSize} round />
        </FacebookShareButton>
      </div>

      <div className="transition-transform duration-200 hover:scale-110">
        <TwitterShareButton
          url={url}
          title={title}
          onClick={onShareSuccess}
          className="btn btn-circle"
        >
          <TwitterIcon size={iconSize} round />
        </TwitterShareButton>
      </div>

      <div className="transition-transform duration-200 hover:scale-110">
        <LinkedinShareButton
          url={url}
          title={title}
          summary={description}
          onClick={onShareSuccess}
          className="btn btn-circle"
        >
          <LinkedinIcon size={iconSize} round />
        </LinkedinShareButton>
      </div>

      <div className="transition-transform duration-200 hover:scale-110">
        <WhatsappShareButton
          url={url}
          title={title}
          separator=" - "
          onClick={onShareSuccess}
          className="btn btn-circle"
        >
          <WhatsappIcon size={iconSize} round />
        </WhatsappShareButton>
      </div>

      {/* Bouton natif de partage */}
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <div className="transition-transform duration-200 hover:scale-110">
          <button
            onClick={handleNativeShare}
            disabled={isSharing}
            className={cn('btn btn-circle btn-accent', className)}
            aria-label="Autres"
          >
            <Share2 size={22} />
          </button>
        </div>
      )}
    </div>
  )
}
