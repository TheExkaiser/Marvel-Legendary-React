import { useRef, useState } from 'react'
import type { CardData } from '../engine/types'
import { CardImage } from './CardImage'
import { ZoomModal } from './ZoomModal'
import { teamName } from '../data/teams'
import './FocusButton.css'
import './CardExtras.css'
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
  highlight?: 'buy' | 'attack' // obrys: złoty = stać nas na kupno, czerwony = stać nas na atak
  dimmed?: boolean // przyciemnienie: zwykłe zagrane karty w Played (Focus i aktywne Artifacty zostają jasne)
  shards?: number // liczba Shardów leżących na złoczyńcy / masterminedzie
  artifactButtons?: { label: string; onClick: () => void }[] // przyciski zdolności "raz na turę" artefaktu
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

// Odznaka z AKTUALNYM kosztem karty w HQ, gdy odbiega od bazowego: zielony = taniej, czerwony = drożej.
// Ikona zależy od zasobu: recruit = cost.png, attack (Pull Reality) = attack.png.
function CostModifierBadge({ data, effectiveCost, costResource = 'recruit' }: { data: CardData; effectiveCost?: number; costResource?: 'attack' | 'recruit' }) {
  if (data.cost === undefined || effectiveCost === undefined || (effectiveCost === data.cost && costResource === 'recruit')) return null
  const usesAttackIcon = costResource === 'attack'
  const color = usesAttackIcon ? '#ffd93d' : effectiveCost < data.cost ? '#4ade80' : '#ff6b6b'
  return (
    <div className="attack-modifier-badge">
      <img
        className={`attack-modifier-icon${usesAttackIcon ? '' : ' cost-icon'}`}
        src={`${import.meta.env.BASE_URL}icons/${usesAttackIcon ? 'attack' : 'cost'}.png`}
        alt={usesAttackIcon ? 'Attack' : 'Cost'}
      />
      <span className="attack-modifier-value" style={{ color }}>{effectiveCost}</span>
    </div>
  )
}

// Odznaka Shardów na karcie (każdy Shard = +1 Attack; siła w odznace siły już to uwzględnia).
function ShardBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <div className="shard-badge" title={`Shards: ${count} (+${count} Attack)`}>
      <img className="shard-badge-icon" src={`${import.meta.env.BASE_URL}icons/shard.png`} alt="" />
      <span className="shard-badge-count">{count}</span>
    </div>
  )
}

// Przyciski zdolności artefaktu (styl jak Focus). Każdy to osobna zdolność "raz na turę".
function ArtifactButtons({ buttons }: { buttons?: { label: string; onClick: () => void }[] }) {
  if (!buttons?.length) return null
  return (
    <div className="artifact-buttons">
      {buttons.map((button, i) => (
        <button
          key={i}
          className="focus-button"
          onClick={(e) => {
            e.stopPropagation() // żeby kliknięcie przycisku nie odpaliło też onClick karty
            button.onClick()
          }}
        >
          {button.label}
        </button>
      ))}
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

// Popup zoomu karty: powłoka ZoomModal + szczegóły karty. Używany też przez miniaturki złapanych kart.
function CardZoomModal({
  data,
  capturedCards,
  onClose,
}: {
  data: CardData
  capturedCards?: CardData[]
  onClose: () => void
}) {
  return (
    <ZoomModal
      title={data.name}
      onClose={onClose}
      image={data.img ? <CardImage src={data.img} alt={data.name} className="zoom-image" large /> : undefined}
    >
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
    </ZoomModal>
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

const HOLD_MS = 450 // jak długo trzymać kartę, żeby otworzyć zoom
const HOLD_MOVE_TOLERANCE = 10 // px; większy ruch palca = to scroll, nie hold

export function CardView({ data, onClick, flipId, flipFrom, effectiveStrength, strengthResource, capturedCards, focusButton, effectiveCost, costResource, highlight, dimmed, shards, artifactButtons }: CardViewProps) {
  const [zoomed, setZoomed] = useState(false)
  const capturedCount = capturedCards?.length ?? 0

  const holdTimer = useRef<number | null>(null)
  const holdStart = useRef<{ x: number; y: number } | null>(null)
  const heldRef = useRef(false) // true, jeśli hold właśnie otworzył zoom (wtedy pomijamy kliknięcie karty)
  const touchRef = useRef(false) // czy ostatni dotyk na karcie był palcem

  const clearHold = () => {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    holdStart.current = null
  }

  const handleClick = () => {
    if (heldRef.current) {
      heldRef.current = false
      return
    }
    onClick?.()
  }

  return (
    <>
      <div
        className={['card', onClick ? 'clickable' : '', highlight ? `highlight-${highlight}` : '', dimmed ? 'card-dimmed' : ''].filter(Boolean).join(' ')}
        onClick={onClick ? handleClick : undefined}
        title={data.name}
        data-flip-id={flipId}
        data-flip-from={flipFrom}
        onPointerDown={(e) => {
          touchRef.current = e.pointerType === 'touch'
          heldRef.current = false
          clearHold()
          if (!touchRef.current) return
          holdStart.current = { x: e.clientX, y: e.clientY }
          holdTimer.current = window.setTimeout(() => {
            holdTimer.current = null
            heldRef.current = true
            setZoomed(true)
          }, HOLD_MS)
        }}
        onPointerMove={(e) => {
          const s = holdStart.current
          if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > HOLD_MOVE_TOLERANCE) clearHold()
        }}
        onPointerUp={clearHold}
        onPointerCancel={clearHold}
        onContextMenu={(e) => {
          // Android wysyła contextmenu przy długim przytrzymaniu: drugi, niezależny od licznika sposób na hold.
          // Blokujemy też systemowe menu / zaznaczanie / wyszukiwanie obrazem.
          if (!touchRef.current) return
          e.preventDefault()
          clearHold()
          heldRef.current = true
          setZoomed(true)
        }}
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
        <ShardBadge count={shards ?? 0} />
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

        <ArtifactButtons buttons={artifactButtons} />

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
