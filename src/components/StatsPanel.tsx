import { useState } from 'react'

type StatProps = {
  icon: string // nazwa pliku w public, np. 'attack.png'
  label: string // tekst zastępczy, gdy ikony nie ma
  value: number
}

function Stat({ icon, label, value }: StatProps) {
  // useState = "pamięć" komponentu. Zaczynamy od false, a gdy obrazek się nie wczyta, ustawiamy true
  const [iconFailed, setIconFailed] = useState(false)

  return (
    <div className="stat">
      {iconFailed ? (
        <span className="stat-label">{label}:</span>
      ) : (
        <img
          className="stat-icon"
          src={`${import.meta.env.BASE_URL}${icon}`}
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
}

export function StatsPanel({ turn, attack, recruit, victoryPoints }: StatsPanelProps) {
  return (
    <div className="stats-panel">
      <div className="stat-turn">Tura {turn}</div>
      <Stat icon="attack.png" label="Attacks" value={attack} />
      <Stat icon="recruit.png" label="Recruits" value={recruit} />
      <Stat icon="vp.png" label="VP" value={victoryPoints} />
    </div>
  )
}