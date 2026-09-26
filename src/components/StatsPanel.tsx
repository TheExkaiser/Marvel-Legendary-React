import { useState } from 'react'
import { createPortal } from 'react-dom'

type StatProps = {
  icon: string
  label: string
  value: number
  onClick?: () => void
}

function Stat({ icon, label, value, onClick }: StatProps) {
  const [iconFailed, setIconFailed] = useState(false)

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
    </div>
  )
}

type SchemeInfo = { name: string; img?: string; text?: string; description?: string }

type StatsPanelProps = {
  turn: number
  attack: number
  recruit: number
  victoryPoints: number
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
        <Stat icon="attack.png" label="Attacks" value={attack} />
        <Stat icon="recruit.png" label="Recruits" value={recruit} />
        <Stat icon="victory.png" label="VP" value={victoryPoints} onClick={onVictoryClick} />
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

      {showScheme &&
        createPortal(
          <div className="modal-overlay" onClick={closeScheme}>
            <div className="modal-content zoom-content" onClick={(e) => e.stopPropagation()}>
              <h3>{scheme.name}</h3>
              <button className="close-button" onClick={closeScheme}>
                ✕
              </button>
              <div className="zoom-body">
                {scheme.img && <img src={scheme.img} alt={scheme.name} className="zoom-image" />}
                <div className="zoom-details">
                  {schemeText
                    ? schemeText.split('\n').map((line, i) => <p key={i}>{line}</p>)
                    : <p>(brak opisu)</p>}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}