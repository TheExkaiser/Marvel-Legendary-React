import type { GameState, SchemeDef } from './types'

// Rejestr: id scheme'u -> jego definicja (jak Dictionary w C#)
const registry = new Map<string, SchemeDef>()

export function registerScheme(scheme: SchemeDef): void {
  registry.set(scheme.id, scheme)
}

export function getScheme(state: GameState): SchemeDef {
  const scheme = registry.get(state.schemeId)
  if (!scheme) throw new Error(`Nieznany scheme: ${state.schemeId}`)
  return scheme
}