import type { GameState, CardData, CardInstance } from './types'

/** Dane karty z uwzględnieniem nadpisań per instancja. Używaj zamiast state.cards[cardId] tam, gdzie liczy się "czym ta karta jest teraz". */
export function getCardData(state: GameState, instance: { instanceId: string; cardId: string }): CardData {
  const base = state.cards[instance.cardId]
  const override = state.instanceOverrides?.[instance.instanceId]
  return override ? { ...base, ...override.data } : base
}

/** Zamienia kartę Villaina w szarego Bohatera (wygląda jak Villain, działa jak Hero). Nie przenosi karty, robi to wywołujący. */
export function gainVillainAsHero(
  state: GameState,
  instance: CardInstance,
  opts: { attack?: number; recruit?: number; cost?: number; abilityId?: string } = {},
): void {
  const base = state.cards[instance.cardId]
  state.instanceOverrides = {
    ...state.instanceOverrides,
    [instance.instanceId]: {
      abilityId: opts.abilityId,
      data: {
        hero: base.name,
        attack: opts.attack ?? base.strength ?? 0,
        recruit: opts.recruit,
        cost: opts.cost ?? 0,
        strength: undefined,
        villainGroup: undefined,
        henchman: undefined,
        kind: undefined,
        type: [],
        team: [],
        text: undefined,
        conditionIcons: undefined,
        conditionText: undefined,
        keywords: undefined,
      },
    },
  }
}

/** Stos punktowany na koniec gry: Victory Pile + zdobyte Villainy, które leżą w taliach (Mind Control: "you still get its VP"). */
export function victoryPile(state: GameState): CardInstance[] {
  const owned = [...state.deck, ...state.hand, ...state.played, ...state.discard, ...(state.teleported ?? [])]
  return [...state.defeated, ...owned.filter((c) => state.instanceOverrides?.[c.instanceId])]
}

/** Strona Hero karty Villaina, który po pokonaniu trafia do talii gracza jako Bohater (np. Ultimate Avengers). */
export type VillainHeroSide = Partial<
  Pick<CardData, 'attack' | 'recruit' | 'cost' | 'type' | 'team' | 'text' | 'conditionIcons' | 'conditionText' | 'keywords'>
> & { abilityId?: string }

const villainHeroSides = new Map<string, VillainHeroSide>()

export function registerVillainHeroSide(cardId: string, side: VillainHeroSide): void {
  villainHeroSides.set(cardId, side)
}

/** Zamienia Villaina ze słowem kluczowym 'villain-hero' w Bohatera według jego zarejestrowanej strony Hero.
 * W odróżnieniu od gainVillainAsHero nic nie bierze z Villaina (Attack = siła), poza nazwą i obrazkiem. Nie przenosi karty. */
export function gainVillainWithHeroSide(state: GameState, instance: CardInstance): void {
  const side = villainHeroSides.get(instance.cardId)
  if (!side) throw new Error(`Brak strony Hero dla ${instance.cardId} (registerVillainHeroSide)`)
  const base = state.cards[instance.cardId]
  state.instanceOverrides = {
    ...state.instanceOverrides,
    [instance.instanceId]: {
      abilityId: side.abilityId ?? instance.cardId,
      data: {
        hero: base.name,
        attack: side.attack,
        recruit: side.recruit,
        cost: side.cost ?? 0,
        strength: undefined,
        villainGroup: undefined,
        henchman: undefined,
        kind: undefined,
        type: side.type ?? [],
        team: side.team ?? [],
        text: side.text,
        conditionIcons: side.conditionIcons,
        conditionText: side.conditionText,
        keywords: side.keywords,
      },
    },
  }
}
