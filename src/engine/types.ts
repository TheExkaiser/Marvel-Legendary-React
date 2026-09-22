// ============================================================
// KARTY
// ============================================================

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
  kind?: 'wound' | 'bystander' | 'twist'
  team?: string[]
  type?: string[]
  text?: string
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
}

// ============================================================
// STAN GRY
// ============================================================

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

  officerDeck: CardInstance[]        // NOWE
  officerCardId: string              // NOWE

  villainDeck: CardInstance[]
  city: (CardInstance | null)[]
  cityMarkers: string[][]
  escaped: CardInstance[]
  captives: Record<string, CardInstance[]>

  mastermind: CardInstance
  tactics: CardInstance[]

  defeated: CardInstance[]
  wounds: CardInstance[]
  bystanders: CardInstance[]
  ko: CardInstance[]

  schemeId: string
  counters: Record<string, number>
  twistsRevealed: number

  log: string[]                      // NOWE

  attack: number
  recruit: number
  turn: number
  extraTurnsQueued: number
  bonusDrawNextTurn: number
  status: GameStatus
}

// ============================================================
// PRZYGOTOWANIE GRY I SCHEME
// ============================================================

export interface GameSetup {
  startingCards: DeckEntry[]
  heroCards: DeckEntry[]
  officerCards: DeckEntry            // NOWE
  villainCards: DeckEntry[]
  mastermind: MastermindData
  wounds: DeckEntry
  bystanders: DeckEntry
  bystandersInVillainDeck: number
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
  onTwist?: (state: GameState, twistNumber: number) => void
  onVillainEntered?: (state: GameState, villain: CardInstance) => void
  onVillainEscaped?: (state: GameState, villain: CardInstance) => void
  checkLoss?: (state: GameState) => boolean
}

// ============================================================
// ZESTAWY KART
// ============================================================

export interface SetData {
  id: string
  name: string
  schemes: SchemeDef[]
}