import { useEffect, useState } from 'react'
import type { GameSetup } from './engine/types'
import type { GameLogMeta } from './gameLog'
import { ALL_SETS } from './data/sets'
import { SetupMenu } from './components/SetupMenu'
import GameScreen from './GameScreen'
import DevNoticePopup from './components/DevNoticePopup'

interface ActiveGame {
  setup: GameSetup
  logMeta: GameLogMeta
}

// Dwa ekrany: menu setupu albo gra. Wynik menu (GameSetup + GameLogMeta) trafia do GameScreen.
function App() {
  const [game, setGame] = useState<ActiveGame | null>(null)
  // Zmiana klucza wymusza remount GameScreen (czyli świeży useGame(setup)) bez zmiany setupu.
  const [gameKey, setGameKey] = useState(0)

  useEffect(() => {
    const isMobileLike = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900
    if (!isMobileLike) return

    const enterFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => undefined)
      }
      screen.orientation?.lock?.('landscape')?.catch(() => undefined)
      document.removeEventListener('pointerdown', enterFullscreen, true)
      document.removeEventListener('keydown', enterFullscreen, true)
    }

    document.addEventListener('pointerdown', enterFullscreen, true)
    document.addEventListener('keydown', enterFullscreen, true)
    return () => {
      document.removeEventListener('pointerdown', enterFullscreen, true)
      document.removeEventListener('keydown', enterFullscreen, true)
    }
  }, [])

  return (
    <>
      <DevNoticePopup />
      {game ? (
        <GameScreen
          key={gameKey}
          setup={game.setup}
          logMeta={game.logMeta}
          onExit={() => setGame(null)}
          onRestart={() => setGameKey((k) => k + 1)}
        />
      ) : (
        <SetupMenu
          sets={ALL_SETS}
          onStart={(setup, logMeta) => setGame({ setup, logMeta })}
        />
      )}
    </>
  )
}

export default App
