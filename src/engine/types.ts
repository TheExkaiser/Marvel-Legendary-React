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
  flavor?: string
  conditionIcons?: string[]   // ikony warunku "jeśli zagrano X w tej turze" (może być kilka, np. ['strength','strength'])
  conditionText?: string      // efekt, który zachodzi przy spełnionym warunku
  keywords?: string[] // słowa kluczowe karty, np. ['teleport']
  versatile?: number // Versatile N: przy zagraniu wybierasz +N Attack albo +N Recruit
  henchman?: boolean   // podtyp villaina: grupa identycznych kart
  villainGroup?: string
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

export interface LocationDefeatBonus {
  locations: string[] // nazwy lokacji z CITY_NAMES
  recruit?: number
  draw?: number
}

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
  attachedCards: Record<string, CardInstance> // instanceId złoczyńcy -> przypięta karta (Skrull Queen Veranke, Skrull Shapeshifters)

  mastermind: CardInstance
  tactics: CardInstance[]
  masterStrikeId: string

  defeated: CardInstance[]
  wounds: CardInstance[]
  bystanders: CardInstance[]
  ko: CardInstance[]

  schemeId: string
  gameModeId: string
  counters: Record<string, number>
  twistsRevealed: number

  log: string[]

  attack: number
  recruit: number
  defeatRecruitBonus?: number
  koRecruitBonus?: number // Absorb Energies: Recruit za każdą skasowaną (KO) kartę gracza w tej turze
  locationDefeatBonuses?: LocationDefeatBonus[] // Night Hunter, Nowhere to Hide: bonus za pokonanie Villaina w wybranych lokacjach w tej turze
  defeatRescueBonus?: number
  copiedCardIds?: Record<string, string>   // instanceId -> cardId skopiowanej karty (Copy Powers), reset co turę
  turn: number
  extraTurnsQueued: number
  bonusDrawNextTurn: number
  extraCardToHand?: string // instanceId karty zarezerwowanej przez Electromagnetic Bubble
  teleported?: CardInstance[] // Teleport: karty odłożone na bok, na koniec tury wracają do ręki jako dodatkowe
  recruitsToDeckTop?: number // Backflip: ile następnych zrekrutowanych Bohaterów trafia na wierzch talii zamiast do odrzuconych
  versatileBothThisTurn?: boolean // Against All Odds: do końca tury Versatile daje i Attack, i Recruit
  status: GameStatus
  locationAttackModifiers: Record<string, number>
  mastermindAttackModifierThisTurn: number
  recruitCountsAsAttackThisTurn: boolean
  cardsDrawnThisTurn: number
  recruitGainedThisTurn: number
  pendingSurgeOfPower: number // Surge of Power zagrane, zanim próg 8 Recruit został osiągnięty w tej turze
  attackGainedThisTurn: number
  debugUsed: boolean // true, jeśli użyto czegokolwiek z Debug Panelu — taka gra nie trafia do logu
  masterStrikeAutoDrawUsedThisTurn: boolean // Dark City: wymuszone dobranie po Master Strike tylko raz na turę
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
  gameMode: GameModeDef
  twist: CardData
}

export interface SchemeDef {
  id: string
  name: string
  img: string
  twistCount: number
  escapeLimit?: number
  text?: string

  setup?: (state: GameState) => void
  onTwist?: (state: GameState, twistNumber: number, ui: UiAdapter) => void | Promise<void>
  onVillainEntered?: (state: GameState, villain: CardInstance) => void
  onVillainEscaped?: (state: GameState, villain: CardInstance, lostCaptives: CardInstance[]) => void
  checkLoss?: (state: GameState) => boolean

  villainStrengthModifier?: (state: GameState, instance: CardInstance) => number

  // Bystander wylosowany z talii złoczyńców wchodzi do miasta jak zwykły villain
  // (zamiast być captured) — np. Replace Earth's Leaders with Killbots.
  treatBystandersAsVillains?: boolean

  // Nadpisuje BAZOWĄ siłę (zamiast data.strength) dla kart, które normalnie jej nie mają
  // (Bystander-jako-Killbot, Hero-jako-Skrull-Villain itp.)
  villainBaseStrengthOverride?: (state: GameState, instance: CardInstance) => number | undefined

  // Zamiast domyślnego trafienia pokonanej karty do Victory Pool — pozwala np. dać ją
  // graczowi (Secret Invasion: "you gain it").
  onVillainDefeated?: (state: GameState, villain: CardInstance) => void

  setupRules?: Partial<SetupRules>
}

/** Tryb rozgrywki (np. Dark City - Advanced Solo). Nadpisuje domyślne reguły setupu
 * (ale sam jest nadpisywany przez Scheme — patrz resolveRules) i może dorzucać własne
 * reguły w trakcie gry (auto-dobór po Master Strike, dodatkowy efekt Scheme Twist...). */
export interface GameModeDef {
  id: string
  name: string
  setupRules?: Partial<SetupRules>

  onMasterStrikeResolved?: (state: GameState, ui: UiAdapter) => void | Promise<void>
  onSchemeTwistResolved?: (state: GameState, ui: UiAdapter) => void | Promise<void>
}

/** Grupa kart wybierana w setupie: bohater, grupa villainów albo grupa henchmenów. */
export interface CardGroup {
  id: string
  name: string
  cards: DeckEntry[]
  icon?: string // np. 'icons/heroes/spider-man.png' (plik w folderze public/)
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
  icon?: string // np. 'icons/heroes/spider-man.png' (plik w folderze public/)
}

/** Ile czego trzeba wybrać w setupie. Scheme może nadpisać część pól. */
export interface SetupRules {
  heroes: number
  villainGroups: number
  henchmenGroups: number
  henchmenCopiesPerGroup: number // ile kopii jednej karty henchmana trafia do talii złoczyńców (kanonicznie 10)
  bystandersInVillainDeck: number
  requiredHeroes: string[]
  requiredVillainGroups: string[]
  requiredHenchmenGroups: string[]
}

/** Wybory gracza z menu (albo preset debug). Same id, żadnych kart. */
export interface SetupChoices {
  gameModeId: string
  schemeId: string
  mastermindId: string
  heroIds: string[]
  villainGroupIds: string[]
  henchmenGroupIds: string[]
}
