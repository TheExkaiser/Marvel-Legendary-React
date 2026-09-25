import { useState } from 'react'
import { SlideDrawer } from './SlideDrawer'

interface GameInfoPanelProps {
  // Uwaga: nie mam schemeRegistry.ts, więc zgaduję pole z opisem (text / description).
  // Jeśli w Twoim typie Scheme nazywa się inaczej, podmień poniżej w schemeText.
  scheme: { name: string; text?: string; description?: string }
  turn: number
  twistsRevealed: number
  twistCount: number
  counters: Record<string, number>
  wounds: number
  bystanders: number
  ko: number
}

export function GameInfoPanel({
  scheme,
  turn,
  twistsRevealed,
  twistCount,
  counters,
  wounds,
  bystanders,
  ko,
}: GameInfoPanelProps) {
  const [showScheme, setShowScheme] = useState(false)
  const schemeText = scheme.text ?? scheme.description ?? ''

  return (
    <>
      <SlideDrawer edge="right" tabLabel="Info">
        <h3>Rozgrywka</h3>

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
      </SlideDrawer>

      {showScheme && (
        <div className="modal-overlay" onClick={() => setShowScheme(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{scheme.name}</h3>
            {schemeText ? <p>{schemeText}</p> : <p>(brak opisu)</p>}
            <button onClick={() => setShowScheme(false)}>Zamknij</button>
          </div>
        </div>
      )}
    </>
  )
}
