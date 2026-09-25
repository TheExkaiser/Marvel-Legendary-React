import { useState } from 'react'

type StatProps = {
  icon: string // nazwa pliku w public/icons, np. 'attack.png'
  label: string // tekst zastępczy, gdy ikony nie ma
  value: number
  onClick?: () => void
}

function Stat({ icon, label, value, onClick }: StatProps) {
  // useState = "pamięć" komponentu. Zaczynamy od false, a gdy obrazek się nie wczyta, ustawiamy true
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

// Uwaga: nie mam schemeRegistry.ts, więc zgaduję pole z opisem (text / description).
// Jeśli w Twoim typie Scheme nazywa się inaczej, podmień w schemeText poniżej.
type SchemeInfo = { name: string; text?: string; description?: string }

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
}: StatsPanelProps) {
  const [showScheme, setShowScheme] = useState(false)
  const schemeText = scheme.text ?? scheme.description ?? ''

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

      {/* Dodatkowe informacje: widoczne po najechaniu na cały panel (patrz App.css) */}
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
        <p>KO: {ko}</p>
      </div>

      {showScheme && (
        <div className="modal-overlay" onClick={() => setShowScheme(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{scheme.name}</h3>
            {schemeText ? <p>{schemeText}</p> : <p>(brak opisu)</p>}
            <button onClick={() => setShowScheme(false)}>Zamknij</button>
          </div>
        </div>
      )}
    </div>
  )
}
