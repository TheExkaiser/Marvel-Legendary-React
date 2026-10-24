import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { CardData } from '../engine/types'
import { CardImage } from './CardImage'
import { teamName } from '../data/teams'
import './FocusButton.css'
import { KeywordText } from './KeywordText'

interface CardViewProps {
  data: CardData
  onClick?: () => void
  flipId?: string
  flipFrom?: string // id talii (data-deck-id), z której nowa karta ma przyjechać
  effectiveStrength?: number // aktualna siła (po ewentualnym modyfikatorze), liczona przez getEffectiveStrength
  strengthResource?: 'attack' | 'recruit' // zasób wymagany do walki z tą kartą
  capturedCards?: CardData[] // złapani bystanderzy + ewentualna przypięta karta bohatera
  effectiveCost?: number // aktualny koszt karty w HQ (po modyfikatorze, np. Underground Riches)
  costResource?: 'attack' | 'recruit' // zasób wymagany do rekrutacji tej karty
  focusButton?: { cost: number; onClick: () => void } // złoty przycisk Focus na karcie (tylko zagrane karty)
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
      <span>: <KeywordText text={data.conditionText} /></span>
    </div>
  )
}

// Mała odznaka na karcie (attack.png + wartość) pokazująca AKTUALNĄ siłę, gdy odbiega od bazowej.
function AttackModifierBadge({ data, effectiveStrength, strengthResource = 'attack' }: { data: CardData; effectiveStrength?: number; strengthResource?: 'attack' | 'recruit' }) {
  const baseStrength = data.strength
  let text: string
  let color: string

  if (baseStrength === undefined) {
    if (effectiveStrength === undefined) return null
    text = String(effectiveStrength)
    color = '#ffd93d'
  } else {
    if (effectiveStrength === undefined || (effectiveStrength === baseStrength && strengthResource === 'attack')) return null
    text = String(effectiveStrength)
    color = strengthResource === 'recruit' ? '#ffd93d' : effectiveStrength > baseStrength ? '#ff6b6b' : '#4ade80'
  }

  const usesGenericCostIcon = strengthResource === 'recruit'

  return (
    <div className={`attack-modifier-badge${usesGenericCostIcon ? ' cost-resource-badge' : ''}`}>
      <img
        className={`attack-modifier-icon${usesGenericCostIcon ? ' cost-icon' : ''}`}
        src={`${import.meta.env.BASE_URL}icons/${usesGenericCostIcon ? 'cost' : strengthResource}.png`}
        alt={usesGenericCostIcon ? 'Cost' : 'Attack'}
      />
      <span className="attack-modifier-value" style={{ color }}>{text}</span>
    </div>
  )
}

// Odznaka z AKTUALNYM kosztem karty w HQ (recruit.png + wartość), gdy odbiega od bazowego: zielony = taniej, czerwony = drożej.
function CostModifierBadge({ data, effectiveCost, costResource = 'recruit' }: { data: CardData; effectiveCost?: number; costResource?: 'attack' | 'recruit' }) {
  if (data.cost === undefined || effectiveCost === undefined || (effectiveCost === data.cost && costResource === 'recruit')) return null
  const color = costResource === 'attack' ? '#ffd93d' : effectiveCost < data.cost ? '#4ade80' : '#ff6b6b'
  return (
    <div className="attack-modifier-badge">
      <img
        className="attack-modifier-icon cost-icon"
        src={`${import.meta.env.BASE_URL}icons/cost.png`}
        alt="Cost"
      />
      <span className="attack-modifier-value" style={{ color }}>{effectiveCost}</span>
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
      {data.img && <CardImage src={data.img} alt={data.name} className="zoom-image" large />}
      <div className="zoom-details">
        {data.hero !== undefined && (
          <p><strong>Hero:</strong> {data.hero}</p>
        )}
        {(data.team ?? []).length > 0 && (
          <p><strong>Team:</strong> {(data.team ?? []).map(teamName).join(', ')}</p>
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
            <p><KeywordText text={data.text} /></p>
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
      <div className="modal-content zoom-content">
        <h3>{data.name}</h3>
        <CardZoomContent data={data} capturedCards={capturedCards} />
        <p className="dismiss-hint">Press anywhere to close</p>
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
          <CardImage src={data.img} alt={data.name} />
        ) : (
          <div className="captured-thumb-fallback">{data.name}</div>
        )}
      </div>

      {zoomed && <CardZoomModal data={data} onClose={() => setZoomed(false)} />}
    </>
  )
}

export function CardView({ data, onClick, flipId, flipFrom, effectiveStrength, strengthResource, capturedCards, focusButton, effectiveCost, costResource }: CardViewProps) {
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
        <AttackModifierBadge data={data} effectiveStrength={effectiveStrength} strengthResource={strengthResource} />
        <CostModifierBadge data={data} effectiveCost={effectiveCost} costResource={costResource} />

        {focusButton && (
          <button
            className="focus-button"
            onClick={(e) => {
              e.stopPropagation() // żeby kliknięcie Focusa nie odpaliło też onClick karty
              focusButton.onClick()
            }}
          >
            Focus ({focusButton.cost})
          </button>
        )}

        {data.img ? (
          <CardImage src={data.img} alt={data.name} />
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
