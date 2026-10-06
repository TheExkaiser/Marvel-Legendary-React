import { useState } from 'react'
import type { CardData } from '../engine/types'

// Rewers próbujemy wczytać w tej kolejności; jeśli oba pliki zawiodą, pokazujemy gradient
const BACK_SOURCES = ['cardback.webp', 'cardback.png']
const EDGE_COLORS = ['#f4eedb', '#d8d0b8'] // na przemian jasny i ciemny = wrażenie stosu kartek
const MAX_THICKNESS = 9 // px

export function DeckPile({
  count,
  deckId,
  topCard,
  onClick,
  label,
}: {
  count: number
  deckId?: string
  topCard?: CardData
  onClick?: () => void
  label?: string
}) {
  const [srcIndex, setSrcIndex] = useState(0)

  // Pusta talia: przerywany kontur zamiast rewersu
  if (count === 0) {
    return (
      <div className="deck-pile deck-empty" data-deck-id={deckId}onClick={onClick}>
        <span className="deck-count">0</span>
      </div>
    )
  }

  // Grubość zależy od liczby kart: mała talia jest cienka, duża gruba
  const thickness = Math.min(MAX_THICKNESS, 2 + Math.ceil(count / 5))

  // Białe "ścianki" z lewej i od dołu: kolejne cienie przesunięte o 1 px w lewo i w dół
  const edges = Array.from({ length: thickness }, (_, i) => {
    const step = i + 1
    return `${-step}px ${step}px 0 ${EDGE_COLORS[step % 2]}`
  })
  const dropShadow = `${-thickness - 2}px ${thickness + 10}px 24px rgba(0, 0, 0, 0.5)`

  return (
<div
  className={onClick ? 'deck-pile clickable' : 'deck-pile'}
  data-deck-id={deckId}
  onClick={onClick}
>
      <div className="deck-face" style={{ boxShadow: [...edges, dropShadow].join(', ') }}>
        {topCard ? (
  topCard.img ? (
    <img src={topCard.img} alt={topCard.name} />
  ) : (
    <div className="deck-back-fallback">
      <strong>{topCard.name}</strong>
    </div>
  )
) : srcIndex < BACK_SOURCES.length ? (
  <img
    src={`${import.meta.env.BASE_URL}${BACK_SOURCES[srcIndex]}`}
    alt=""
    onError={() => setSrcIndex(srcIndex + 1)}
  />
) : (
  <div className="deck-back-fallback" />
)}
        <span className="deck-count">{count}</span>
      </div>
      {label && <div className="deck-label">{label}</div>}
    </div>
  )
}