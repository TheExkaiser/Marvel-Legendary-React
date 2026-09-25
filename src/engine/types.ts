import type { UiAdapter } from './ui'

export interface CardData {
  id: string
  name: string
  img: string
  hero?: string
  cost?: number
  attack?: number
  recruit?: number
  strength?: number
  vp?: number
  kind?: 'wound' | 'bystander' | 'twist' | 'masterstrike'
  team?: string[]
  type?: string[]
  text?: string
  conditionIcons?: string[]   // ikony warunku "jeśli zagrano X w tej turze" (może być kilka, np. ['strength','strength'])
  conditionText?: string      // efekt, który zachodzi przy spełnionym warunku
  henchman?: boolean   // podtyp villaina: grupa 3 identycznych kart
}

export interface CardInstance {
  instanceId: string
  cardId: string
}

export interface DeckEntry {
  card: CardData
  count: number
}

export interface MastermindData {
  card: CardData
  tactics: CardData[]
  masterStrikeId: string   // id, pod którym zarejestrowana jest umiejętność Master Strike
  masterStrikeText?: string   // opis efektu Master Strike, pokazywany w podglądzie
}

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  cards: Record<string, CardData>

  deck: CardInstance[]
  hand: CardInstance[]
  played: CardInstance[]
  discard: CardInstance[]
  cardsPlayedThisTurn: CardInstance[]

  heroDeck: CardInstance[]
  hq: (CardInstance | null)[]

  officerDeck: CardInstance[]
  officerCardId: string

  villainDeck: CardInstance[]
  city: (CardInstance | null)[]
  cityMarkers: string[][]
  escaped: CardInstance[]
  captives: Record<string, CardInstance[]>

  mastermind: CardInstance
  tactics: CardInstance[]
  masterStrikeId: string

  defeated: CardInstance[]
  wounds: CardInstance[]
  bystanders: CardInstance[]
  ko: CardInstance[]

  schemeId: string
  counters: Record<string, number>
  twistsRevealed: number

  log: string[]

  attack: number
  recruit: number
  defeatRecruitBonus?: number
  turn: number
  extraTurnsQueued: number
  bonusDrawNextTurn: number
  status: GameStatus
}

export interface GameSetup {
  startingCards: DeckEntry[]
  heroCards: DeckEntry[]
  officerCards: DeckEntry
  villainCards: DeckEntry[]
  mastermind: MastermindData
  wounds: DeckEntry
  bystanders: DeckEntry
  bystandersInVillainDeck: number
  masterStrikeCard: CardData   // NOWE: generyczna karta "Master Strike" (jak Scheme Twist)
  masterStrikeCount: number    // NOWE: standardowo 5
  scheme: SchemeDef
  twist: CardData
}

export interface SchemeDef {
  id: string
  name: string
  img: string
  twistCount: number
  escapeLimit?: number

  setup?: (state: GameState) => void
  onTwist?: (state: GameState, twistNumber: number, ui: UiAdapter) => void | Promise<void>
  onVillainEntered?: (state: GameState, villain: CardInstance) => void
  onVillainEscaped?: (state: GameState, villain: CardInstance) => void
  checkLoss?: (state: GameState) => boolean

  // Nadpisania domyślnych reguł setupu (patrz engine/setupRules.ts)
  setupRules?: Partial<SetupRules>
}

/** Grupa kart wybierana w setupie: bohater, grupa villainów albo grupa henchmenów. */
export interface CardGroup {
  id: string
  name: string
  cards: DeckEntry[]
}

/** Karty wspólne dla całej gry (zwykle z Core Setu). */
export interface SharedCards {
  startingCards: DeckEntry[]
  officer: DeckEntry
  wounds: DeckEntry
  bystanders: DeckEntry
  twist: CardData
  masterStrikeCard: CardData
  masterStrikeCount: number
}

export interface SetData {
  id: string
  name: string
  schemes: SchemeDef[]
  heroes: CardGroup[]
  villainGroups: CardGroup[]
  henchmenGroups: CardGroup[]
  masterminds: MastermindData[]
  shared?: SharedCards   // tylko zestawy, które je dostarczają (Core Set)
}

/** Ile czego trzeba wybrać w setupie. Scheme może nadpisać część pól. */
export interface SetupRules {
  heroes: number
  villainGroups: number
  henchmenGroups: number
  bystandersInVillainDeck: number
  requiredHeroes: string[]
  requiredVillainGroups: string[]
  requiredHenchmenGroups: string[]
}

/** Wybory gracza z menu (albo preset debug). Same id, żadnych kart. */
export interface SetupChoices {
  schemeId: string
  mastermindId: string
  heroIds: string[]
  villainGroupIds: string[]
  henchmenGroupIds: string[]
}
