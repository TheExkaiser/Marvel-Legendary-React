import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { CardData } from '../engine/types'

interface CardViewProps {
  data: CardData
  onClick?: () => void
  flipId?: string
  flipFrom?: string // id talii (data-deck-id), z której nowa karta ma przyjechać
  effectiveStrength?: number // aktualna siła (po ewentualnym modyfikatorze), liczona przez getEffectiveStrength
  capturedCards?: CardData[] // złapani bystanderzy + ewentualna przypięta karta bohatera
}

function ConditionLine({ data }: { data: CardData }) {
  if (!data.conditionIcons?.length || !data.conditionText) return null
  return (
    <div className="condition-line">
      {data.conditionIcons.map((icon, i) => (
        <img
          key={i}
          className="condition-icon"
          src={`${import.meta.env.BASE_URL}icons/${icon}.png`}
          alt={icon}
        />
      ))}
      <span>: {data.conditionText}</span>
    </div>
  )
}

// Mała odznaka na karcie (attack.png + wartość) pokazująca AKTUALNĄ siłę, gdy odbiega od bazowej.
function AttackModifierBadge({ data, effectiveStrength }: { data: CardData; effectiveStrength?: number }) {
  const baseStrength = data.strength
  let text: string
  let color: string

  if (baseStrength === undefined) {
    if (effectiveStrength === undefined) return null
    text = String(effectiveStrength)
    color = '#ffd93d'
  } else {
    if (effectiveStrength === undefined || effectiveStrength === baseStrength) return null
    text = String(effectiveStrength)
    color = effectiveStrength > baseStrength ? '#ff6b6b' : '#4ade80'
  }

  return (
    <div className="attack-modifier-badge">
      <img
        className="attack-modifier-icon"
        src={`${import.meta.env.BASE_URL}icons/attack.png`}
        alt="Attack"
      />
      <span className="attack-modifier-value" style={{ color }}>{text}</span>
    </div>
  )
}

// Mała odznaka (lewy górny róg): liczba "złapanych" kart (bystanderzy + przypięta karta).
function CapturedBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <div className="captured-badge" title={`Captured cards: ${count}`}>
      <span className="captured-badge-value">{count}</span>
    </div>
  )
}

// Treść popupu zoomu — współdzielona przez główną kartę i miniaturki złapanych kart.
function CardZoomContent({ data, capturedCards }: { data: CardData; capturedCards?: CardData[] }) {
  return (
    <div className="zoom-body">
      {data.img && <img src={data.img} alt={data.name} className="zoom-image" />}
      <div className="zoom-details">
        {data.hero !== undefined && (
          <p><strong>Hero:</strong> {data.hero}</p>
        )}
        {(data.team ?? []).length > 0 && (
          <p><strong>Team:</strong> {(data.team ?? []).join(', ')}</p>
        )}
        {(data.type ?? []).length > 0 && (
          <p><strong>Type:</strong> {(data.type ?? []).join(', ')}</p>
        )}
        {data.strength !== undefined && <p><strong>Attacks:</strong> {data.strength}</p>}
        {data.attack !== undefined && <p><strong>Attacks:</strong> {data.attack}</p>}
        {data.cost !== undefined && <p><strong>Cost:</strong> {data.cost}</p>}
        {data.vp !== undefined && <p><strong>VP:</strong> {data.vp}</p>}
        {data.text && (
          <div className="card-text-block">
            <strong>Text:</strong>
            <p>{data.text}</p>
          </div>
        )}
        <ConditionLine data={data} />
        {data.flavor && (
          <p className="card-flavor-text" style={{ fontStyle: 'italic' }}>
            {data.flavor}
          </p>
        )}
        {capturedCards && capturedCards.length > 0 && (
          <div className="captured-cards-row">
            {capturedCards.map((c, i) => (
              <CapturedCardThumbnail key={i} data={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Pełny popup zoomu (nagłówek + zamknięcie + treść), w portalu.
function CardZoomModal({
  data,
  capturedCards,
  onClose,
}: {
  data: CardData
  capturedCards?: CardData[]
  onClose: () => void
}) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content zoom-content" onClick={(e) => e.stopPropagation()}>
        <h3>{data.name}</h3>
        <button className="close-button" onClick={onClose}>✕</button>
        <CardZoomContent data={data} capturedCards={capturedCards} />
      </div>
    </div>,
    document.body,
  )
}

// Miniaturka złapanej karty: powiększa się po najechaniu, klik otwiera jej własny zoom.
function CapturedCardThumbnail({ data }: { data: CardData }) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <>
      <div
        className="captured-thumb"
        title={data.name}
        onClick={(e) => {
          e.stopPropagation()
          setZoomed(true)
        }}
      >
        {data.img ? (
          <img src={data.img} alt={data.name} />
        ) : (
          <div className="captured-thumb-fallback">{data.name}</div>
        )}
      </div>

      {zoomed && <CardZoomModal data={data} onClose={() => setZoomed(false)} />}
    </>
  )
}

export function CardView({ data, onClick, flipId, flipFrom, effectiveStrength, capturedCards }: CardViewProps) {
  const [zoomed, setZoomed] = useState(false)
  const capturedCount = capturedCards?.length ?? 0

  return (
    <>
      <div
        className={onClick ? 'card clickable' : 'card'}
        onClick={onClick}
        title={data.name}
        data-flip-id={flipId}
        data-flip-from={flipFrom}
      >
        <button
          className="zoom-button"
          onClick={(e) => {
            e.stopPropagation() // żeby kliknięcie lupki nie odpaliło też onClick karty
            setZoomed(true)
          }}
        >
          🔍
        </button>

        <CapturedBadge count={capturedCount} />
        <AttackModifierBadge data={data} effectiveStrength={effectiveStrength} />

        {data.img ? (
          <img src={data.img} alt={data.name} />
        ) : (
          <div className="card-text">
            <strong>{data.name}</strong>
            {data.cost !== undefined && <div>Koszt: {data.cost}</div>}
            {data.strength !== undefined && <div>Siła: {data.strength}</div>}
            <div>Attack: {data.attack ?? 0}</div>
            <div>Recruit: {data.recruit ?? 0}</div>
            <ConditionLine data={data} />
          </div>
        )}
      </div>

      {zoomed && (
        <CardZoomModal data={data} capturedCards={capturedCards} onClose={() => setZoomed(false)} />
      )}
    </>
  )
}