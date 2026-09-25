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

type StatsPanelProps = {
  turn: number
  attack: number
  recruit: number
  victoryPoints: number
  onVictoryClick?: () => void
}

export function StatsPanel({ turn, attack, recruit, victoryPoints, onVictoryClick }: StatsPanelProps) {
  return (
    <div className="stats-panel">
      <div className="stat-turn">Tura {turn}</div>
      <Stat icon="attack.png" label="Attacks" value={attack} />
      <Stat icon="recruit.png" label="Recruits" value={recruit} />
      <Stat icon="victory.png" label="VP" value={victoryPoints} onClick={onVictoryClick} />
    </div>
  )
}