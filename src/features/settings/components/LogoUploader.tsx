import { useRef, useState } from 'react'

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      <label className="label pt-0">
        <span className="label-text font-medium">Logo de l'entreprise</span>
      </label>

      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Preview or placeholder */}
        <div
          className={`relative flex items-center justify-center w-40 h-40 border-2 border-dashed rounded-box ${
            displayError ? 'border-error' : 'border-base-300'
          } bg-base-200 overflow-hidden shrink-0`}
        >
          {value ? (
            <>
              <img src={value} alt="Logo" className="w-full h-full object-contain p-1" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-3 right-3 btn btn-circle btn-xs btn-error shadow-lg"
                disabled={isProcessing}
                title="Supprimer le logo"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-16 h-16 text-base-content/20" />
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
                <span className="loading loading-spinner loading-xs" />
                Traitement...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
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

          <div className="text-xs text-base-content/60 space-y-1">
            <p>• Format accepté : JPG, PNG, WebP</p>
            <p>• Taille maximale : 5 MB</p>
            <p>• Dimensions recommandées : 400x400 px</p>
          </div>

          {displayError && (
            <div className="alert alert-error py-2 px-3 text-xs">
              <span>{displayError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
