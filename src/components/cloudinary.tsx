import Image from 'next/image'
import { useState } from 'react'

interface CloudinaryImageProps {
  src?: string | null
  alt: string
  className?: string
  transformation?: {
    width?: number
    height?: number
    crop?: string
    gravity?: string
  }
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export function CloudinaryImage({
  src,
  alt,
  className = '',
  transformation,
  onError
}: CloudinaryImageProps) {
  const [hasError, setHasError] = useState(false)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    if (onError) {
      onError(e)
    }
  }

  // Eğer src yoksa veya hata varsa default kullan
  if (!src || hasError) {
    return (
      <img
        src="/default-business.svg"
        alt={alt}
        className={className}
        onError={handleError}
      />
    )
  }

  // Eğer zaten tam URL ise direkt kullan
  if (src.startsWith('http') || src.startsWith('/')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
      />
    )
  }

  // Eğer Cloudinary ID'si ise tam URL'e çevir
  const { width = 600, height = 400, crop = 'fill', gravity = 'auto' } = transformation || {}
  const cloudinaryUrl = `https://res.cloudinary.com/ddapurgju/image/upload/w_${width},h_${height},c_${crop},g_${gravity},q_auto,f_auto/${src}`

  return (
    <img
      src={cloudinaryUrl}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}
