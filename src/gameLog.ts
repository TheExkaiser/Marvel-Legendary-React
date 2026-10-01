import type { SetupChoices } from './engine/types'

export interface GameLogMeta {
  choices: SetupChoices // do "Add To Next Setup"
  gameModeName: string
  schemeName: string
  mastermindName: string
  heroNames: string[]
  villainGroupNames: string[]
  henchmenGroupNames: string[]
}

export interface GameLogEntry extends GameLogMeta {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:MM, 24h, strefa czasowa przeglądarki
  result: 'Lose' | number // number = Victory Points z Victory Pool przy wygranej
}

const LOG_STORAGE_KEY = 'legendary-game-log'
const NEXT_SETUP_STORAGE_KEY = 'legendary-next-setup-choices'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function loadGameLog(): GameLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function appendGameLogEntry(entry: GameLogEntry): void {
  try {
    const log = loadGameLog()
    log.unshift(entry) // najnowsze na górze
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(log))
  } catch {
    // np. tryb prywatny bez dostępu do localStorage — ignorujemy
  }
}

export function exportGameLog(log: GameLogEntry[]): void {
  const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `legendary-game-log-${formatDate(new Date())}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function savePendingSetupChoices(choices: SetupChoices): void {
  try {
    localStorage.setItem(NEXT_SETUP_STORAGE_KEY, JSON.stringify(choices))
  } catch {
    // ignorujemy
  }
}

export function consumePendingSetupChoices(): SetupChoices | null {
  try {
    const raw = localStorage.getItem(NEXT_SETUP_STORAGE_KEY)
    if (!raw) return null
    localStorage.removeItem(NEXT_SETUP_STORAGE_KEY)
    return JSON.parse(raw)
  } catch {
    return null
  }
}