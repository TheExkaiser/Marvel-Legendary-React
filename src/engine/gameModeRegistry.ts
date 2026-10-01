import type { GameModeDef, GameState } from './types'

// Rejestr: id game mode'u -> jego definicja (jak Dictionary w C#)
const registry = new Map<string, GameModeDef>()

export function registerGameMode(mode: GameModeDef): void {
  registry.set(mode.id, mode)
}

export function getGameMode(state: GameState): GameModeDef {
  const mode = registry.get(state.gameModeId)
  if (!mode) throw new Error(`Nieznany game mode: ${state.gameModeId}`)
  return mode
}