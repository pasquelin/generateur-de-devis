import { type ChangeEvent, useRef, useState } from 'react'

import { Image as ImageIcon, Upload, X } from 'lucide-react'

import {
  compressImage,
  formatFileSize,
  isValidImageSize,
  isValidImageType,
} from '../../../utils/image.utils'

interface LogoUploaderProps {
  value?: string
  onChange: (base64: string | undefined) => void
  error?: string
}

export const LogoUploader = ({ value, onChange, error }: LogoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadError, setUploadError] = useState<string | undefined>()

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadError(undefined)

    // Validate file type
    if (!isValidImageType(file)) {
      setUploadError('Le fichier doit être une image (JPG, PNG, WebP)')
      return
    }

    // Validate file size (5MB max)
    if (!isValidImageSize(file, 5000)) {
      setUploadError(
        `Le fichier est trop volumineux (${formatFileSize(file.size)}). Maximum : 5 MB`,
      )
      return
    }

    try {
      setIsProcessing(true)
      const compressed = await compressImage(file, 400, 400, 0.8)
      onChange(compressed)
    } catch (err) {
      setUploadError("Erreur lors du traitement de l'image")
      console.error('Image processing error:', err)
    } finally {
      setIsProcessing(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange(undefined)
    setUploadError(undefined)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const displayError = error || uploadError

  return (
    <div className="form-control w-full">
      <div className="flex flex-col items-center gap-6 md:flex-row">
        {/* Preview or placeholder */}
        <div
          className={`rounded-box relative flex h-36 w-36 items-center justify-center border-2 border-dashed ${
            displayError ? 'border-error' : 'border-base-300'
          } bg-base-200 shrink-0 overflow-hidden`}
        >
          {value ? (
            <>
              <img src={value} alt="Logo" className="h-full w-full object-contain p-1" />
              <button
                type="button"
                onClick={handleRemove}
                className="btn btn-circle btn-xs btn-error absolute top-3 right-3 shadow-lg"
                disabled={isProcessing}
                title="Supprimer le logo"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <ImageIcon className="text-base-content/20 h-16 w-16" />
          )}
        </div>

        {/* Upload button and info */}
        <div className="flex-1 space-y-3">
          <button
            type="button"
            onClick={handleClick}
            disabled={isProcessing}
            className="btn btn-outline btn-sm gap-2"
          >
            {isProcessing ? (
              <>
                <span className="loading loading-spinner loading-xs" /> Traitement...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {value ? 'Changer le logo' : 'Télécharger un logo'}
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-base-content/60 space-y-1 text-xs">
            <p>• Format accepté : JPG, PNG, WebP</p>
            <p>• Taille maximale : 5 MB</p>
            <p>• Dimensions recommandées : 400x400 px</p>
          </div>

          {displayError && (
            <div className="alert alert-error px-3 py-2 text-xs">
              <span>{displayError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
