import { useState } from 'react'
import type { GameSetup } from './engine/types'
import { ALL_SETS } from './data/sets'
import { SetupMenu } from './components/SetupMenu'
import GameScreen from './GameScreen'

// Dwa ekrany: menu setupu albo gra. Wynik menu (GameSetup) trafia do GameScreen.
function App() {
  const [setup, setSetup] = useState<GameSetup | null>(null)

  if (!setup) return <SetupMenu sets={ALL_SETS} onStart={setSetup} />
  return <GameScreen setup={setup} onExit={() => setSetup(null)} />
}

export default App
