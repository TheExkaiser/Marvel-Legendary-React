import { useEffect, useState } from 'react'

// 'cards/x/y.png' -> 'cards-small/x/y.webp' (to samo, co robi skrypt make-proxies)
export function toSmallSrc(src: string): string {
  return src.replace('/cards/', '/cards-small/').replace(/\.\w+$/, '.webp')
}

interface CardImageProps {
  src: string
  alt: string
  large?: boolean // true = po załadowaniu podmień proxy na pełny obrazek
  className?: string
}

export function CardImage({ src, alt, large = false, className }: CardImageProps) {
  const small = toSmallSrc(src)
  const [loadedLarge, setLoadedLarge] = useState<string | null>(null)
  const [failedSmall, setFailedSmall] = useState<string | null>(null)

  // Gdy potrzebny jest duży obrazek, ładujemy go w tle (poza ekranem)
  useEffect(() => {
    if (!large) return
    const img = new Image()
    img.onload = () => setLoadedLarge(src)
    img.src = src
    return () => {
      img.onload = null
    }
  }, [large, src])

  const largeReady = large && loadedLarge === src
  const smallBroken = failedSmall === small
  const shown = largeReady || smallBroken ? src : small

  return (
    <img
      className={className}
      src={shown}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (shown === small) setFailedSmall(small) // brak proxy -> wróć do oryginału
      }}
    />
  )
}