/**
 * Compress and resize an image file to base64
 * @param file - The image file to process
 * @param maxWidth - Maximum width in pixels
 * @param maxHeight - Maximum height in pixels
 * @param quality - Compression quality (0-1)
 * @returns Promise with base64 string
 */
export async function compressImage(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400,
  quality: number = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64
        const base64 = canvas.toDataURL('image/jpeg', quality)
        resolve(base64)
      }

      img.onerror = () => {
        reject(new Error("Erreur lors du chargement de l'image"))
      }

      if (e.target?.result && typeof e.target.result === 'string') {
        img.src = e.target.result
      } else {
        reject(new Error('Erreur lors de la lecture du fichier'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file type
 * @param file - The file to validate
 * @returns true if valid image type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * Validate image file size
 * @param file - The file to validate
 * @param maxSizeKB - Maximum size in KB
 * @returns true if size is valid
 */
export function isValidImageSize(file: File, maxSizeKB: number = 5000): boolean {
  return file.size <= maxSizeKB * 1024
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
