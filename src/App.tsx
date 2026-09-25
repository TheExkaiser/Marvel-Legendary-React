import { useState } from 'react'
import type { GameSetup } from './engine/types'
import { ALL_SETS } from './data/sets'
import { SetupMenu } from './components/SetupMenu'
import GameScreen from './GameScreen'

// Dwa ekrany: menu setupu albo gra. Wynik menu (GameSetup) trafia do GameScreen.
function App() {
  const [setup, setSetup] = useState<GameSetup | null>(null)
  // Zmiana klucza wymusza remount GameScreen (czyli świeży useGame(setup)) bez zmiany setupu.
  const [gameKey, setGameKey] = useState(0)

  if (!setup) return <SetupMenu sets={ALL_SETS} onStart={setSetup} />
  return (
    <GameScreen
      key={gameKey}
      setup={setup}
      onExit={() => setSetup(null)}
      onRestart={() => setGameKey((k) => k + 1)}
    />
  )
}

export default App
