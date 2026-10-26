import { useEffect, useState } from 'react'
import { ZoomModal } from './ZoomModal'

type StatProps = {
  icon: string
  label: string
  value: number
  delta?: number
  deltaEventId?: number
  onClick?: () => void
}

function Stat({ icon, label, value, delta, deltaEventId, onClick }: StatProps) {
  const [iconFailed, setIconFailed] = useState(false)
  const [animations, setAnimations] = useState<Array<{ id: number; value: number }>>([])

  useEffect(() => {
    if (!deltaEventId || delta === undefined || delta === 0) return

    const animation = { id: deltaEventId, value: delta }
    setAnimations((current) => [...current, animation])
    window.setTimeout(() => {
      setAnimations((current) => current.filter((entry) => entry.id !== animation.id))
    }, 1000)
  }, [deltaEventId, delta])

  return (
    <div className={onClick ? 'stat stat-clickable' : 'stat'} onClick={onClick}>
      {iconFailed ? (
        <span className="stat-label">{label}:</span>
      ) : (
        <img
          className="stat-icon"
          src={`${import.meta.env.BASE_URL}icons/${icon}`}
          alt={label}
          title={label}
          onError={() => setIconFailed(true)}
        />
      )}
      <span className="stat-value">{value}</span>
      {animations.map((animation) => (
        <span key={animation.id} className={`stat-delta ${animation.value > 0 ? 'positive' : 'negative'}`}>
          <img src={`${import.meta.env.BASE_URL}icons/${icon}`} alt="" />
          {animation.value > 0 ? '+' : ''}{animation.value}
        </span>
      ))}
    </div>
  )
}

type SchemeInfo = { name: string; img?: string; text?: string; description?: string }

type StatsPanelProps = {
  turn: number
  attack: number
  recruit: number
  victoryPoints: number
  resourceDeltas?: Partial<Record<'attack' | 'recruit' | 'victory', number>>
  resourceDeltaEventId?: number
  onVictoryClick?: () => void
  scheme: SchemeInfo
  twistsRevealed: number
  twistCount: number
  counters: Record<string, number>
  wounds: number
  bystanders: number
  ko: number
  onKoClick?: () => void
  initialSchemeOpen?: boolean // otwiera popup schematu od razu przy pierwszym renderze
  onSchemeIntroClose?: () => void // wywoływane, gdy popup schematu się zamyka
}

export function StatsPanel({
  turn,
  attack,
  recruit,
  victoryPoints,
  resourceDeltas,
  resourceDeltaEventId,
  onVictoryClick,
  scheme,
  twistsRevealed,
  twistCount,
  counters,
  wounds,
  bystanders,
  ko,
  onKoClick,
  initialSchemeOpen = false,
  onSchemeIntroClose,
}: StatsPanelProps) {
  const [showScheme, setShowScheme] = useState(initialSchemeOpen)
  const schemeText = scheme.text ?? scheme.description ?? ''

  function closeScheme() {
    setShowScheme(false)
    onSchemeIntroClose?.()
  }

  return (
    <div className="stats-panel">
      <div className="stat-row">
        <div className="stat-info-icon" title="Więcej informacji">
          i
        </div>
        <Stat icon="attack.png" label="Attacks" value={attack} delta={resourceDeltas?.attack} deltaEventId={resourceDeltaEventId} />
        <Stat icon="recruit.png" label="Recruits" value={recruit} delta={resourceDeltas?.recruit} deltaEventId={resourceDeltaEventId} />
        <Stat icon="victory.png" label="VP" value={victoryPoints} delta={resourceDeltas?.victory} deltaEventId={resourceDeltaEventId} onClick={onVictoryClick} />
      </div>

      <div className="stats-panel-extra">
        <button className="info-scheme-button" onClick={() => setShowScheme(true)}>
          Scheme: {scheme.name}
        </button>
        <p>Tura: {turn}</p>
        <p>
          Twisty: {twistsRevealed} / {twistCount}
        </p>
        {Object.entries(counters).map(([name, value]) => (
          <p key={name}>
            {name}: {value}
          </p>
        ))}
        <p>Stos ran: {wounds}</p>
        <p>Stos bystanderów: {bystanders}</p>
        <button className="info-scheme-button" onClick={onKoClick}>
          KO: {ko}
        </button>
      </div>

      {showScheme && (
        <ZoomModal
          title={scheme.name}
          onClose={closeScheme}
          image={scheme.img ? <img src={scheme.img} alt={scheme.name} className="zoom-image" /> : undefined}
        >
          {schemeText
            ? schemeText.split('\n').map((line, i) => <p key={i}>{line}</p>)
            : <p>(No description)</p>}
        </ZoomModal>
      )}
    </div>
  )
}
