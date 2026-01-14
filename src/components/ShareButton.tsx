// ShareButton.tsx
import React, { useState } from 'react'
import { Share2 } from 'lucide-react'
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
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

export const ShareButton: React.FC<ShareButtonProps> = ({
  url = typeof window !== 'undefined' ? window.location.href : '',
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

  // Fallback : boutons réseaux sociaux
  return (
    <div className={`share-buttons-fallback ${className}`}>
      <FacebookShareButton url={url} title={title} onClick={() => onShareSuccess?.()}>
        <FacebookIcon size={iconSize} round />
      </FacebookShareButton>

      <TwitterShareButton url={url} title={title} onClick={() => onShareSuccess?.()}>
        <TwitterIcon size={iconSize} round />
      </TwitterShareButton>

      <LinkedinShareButton
        url={url}
        title={title}
        summary={description}
        onClick={() => onShareSuccess?.()}
      >
        <LinkedinIcon size={iconSize} round />
      </LinkedinShareButton>

      <WhatsappShareButton
        url={url}
        title={title}
        separator=" - "
        onClick={() => onShareSuccess?.()}
      >
        <WhatsappIcon size={iconSize} round />
      </WhatsappShareButton>
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
