import type { GameState } from './types'
import { getCardData } from './cardData'
import { HERO_CLASSES } from './heroClasses'
import { playedZone } from './keywords'

// Spectrum: zdolność działa tylko wtedy, gdy masz co najmniej 3 klasy Bohaterów
// wśród kart zagranych w tej turze i kart w ręce. Karty bez klas (szare S.H.I.E.L.D.,
// HYDRA Allies, New Recruits, Sidekicki) niczego nie dodają, bo liczymy wyłącznie HERO_CLASSES.
export const SPECTRUM_CLASSES_REQUIRED = 3

export function countSpectrumClasses(state: GameState): number {
  const classes = new Set<string>()
  // Karta, której zdolność właśnie się wykonuje, leży już w state.played, więc liczy się jako zagrana
  for (const card of [...state.hand, ...playedZone(state)]) {
    const data = getCardData(state, card)
    if (data.kind === 'wound') continue
    const copiedId = state.copiedCardIds?.[card.instanceId]
    const types = [...(data.type ?? []), ...(copiedId ? (state.cards[copiedId]?.type ?? []) : [])]
    for (const type of types) {
      if ((HERO_CLASSES as readonly string[]).includes(type)) classes.add(type)
    }
  }
  return classes.size
}

export function canUseSpectrum(state: GameState): boolean {
  return countSpectrumClasses(state) >= SPECTRUM_CLASSES_REQUIRED
}
