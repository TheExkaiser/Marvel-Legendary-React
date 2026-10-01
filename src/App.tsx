import { useState } from 'react'
import type { GameSetup } from './engine/types'
import type { GameLogMeta } from './gameLog'
import { ALL_SETS } from './data/sets'
import { SetupMenu } from './components/SetupMenu'
import GameScreen from './GameScreen'

interface ActiveGame {
  setup: GameSetup
  logMeta: GameLogMeta
}

// Dwa ekrany: menu setupu albo gra. Wynik menu (GameSetup + GameLogMeta) trafia do GameScreen.
function App() {
  const [game, setGame] = useState<ActiveGame | null>(null)
  // Zmiana klucza wymusza remount GameScreen (czyli świeży useGame(setup)) bez zmiany setupu.
  const [gameKey, setGameKey] = useState(0)

  if (!game) {
    return (
      <SetupMenu
        sets={ALL_SETS}
        onStart={(setup, logMeta) => setGame({ setup, logMeta })}
      />
    )
  }
  return (
    <GameScreen
      key={gameKey}
      setup={game.setup}
      logMeta={game.logMeta}
      onExit={() => setGame(null)}
      onRestart={() => setGameKey((k) => k + 1)}
    />
  )
}

export default App