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
  kind?: 'wound' | 'bystander' | 'twist' | 'masterstrike' | 'token'
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
  masterStrikeId: string
  masterStrikeText?: string
  alwaysLeads?: { villainGroupId?: string; henchmenGroupId?: string } // id z CardGroup, np. 'darkcity_marauders'
}

export type GameStatus = 'playing' | 'won' | 'lost'

export interface LocationDefeatBonus {
  locations: string[] // nazwy lokacji z CITY_NAMES
  recruit?: number
  draw?: number
}

/** Nadpisanie danych jednej konkretnej karty (np. zdobyty Villain, który działa jak Bohater). */
export interface InstanceOverride {
  data: Partial<CardData>
  abilityId?: string // zdolność, którą karta ma mieć (domyślnie: żadna)
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
  demonGoblins?: CardInstance[] // Transform Citizens Into Demons: Bystanderzy ułożeni obok schematu jako Demon Goblin
  schemeTokens?: CardInstance[] // tokeny leżące na karcie scheme'u (np. dziecko w Capture Baby Hope)
  hqExplosions?: number[] // Detonate the Helicarrier: liczba Eksplozji na każdym miejscu HQ
  hqDestroyed?: boolean[] // Detonate the Helicarrier: zniszczone miejsca HQ (nie przyjmują Bohaterów)

  mastermind: CardInstance
  tactics: CardInstance[]
  stackedMasterStrikes?: CardInstance[] // Stryfe: Master Strike'i ułożone obok mastermina
  masterStrikeId: string
    ledVillainGroup?: string // główna grupa złoczyńców tej gry (nazwa z villainGroup), np. dla taktyk Apocalypse'a zamiast "Four Horsemen"

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
  teleportGrantedThisTurn?: string[] // Azazel: instanceId kart z ręki, które w tej turze mają Teleport
  recruitsToDeckTop?: number // Backflip: ile następnych zrekrutowanych Bohaterów trafia na wierzch talii zamiast do odrzuconych
  recruitsToHand?: number // Silent Meditation: ile następnych zrekrutowanych Bohaterów trafia do ręki zamiast do odrzuconych
  rescueRecruitBonus?: number // Jean Grey: +Recruit za każdego uratowanego Bystandera w tej turze
  rescueAttackBonus?: number // Jean Grey: +Attack za każdego uratowanego Bystandera w tej turze
  rescueDrawBonus?: number // Jean Grey: dobranie karty za każdego uratowanego Bystandera w tej turze
  enemyEffectDepth?: number // >0 w trakcie efektu Villaina / Master Strike'a / Taktyki (Impenetrable Ice Wall)
  mindControlThisTurn?: boolean // Professor X (Mind Control): po pokonaniu Villaina możesz go zdobyć
  instanceOverrides?: Record<string, InstanceOverride> // instanceId -> nadpisane dane karty
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
  villainDeckHeroCards: DeckEntry[] // bohaterowie wrzuceni do talii złoczyńców (Transform Citizens Into Demons, X-Cutioner's Song)
  mastermind: MastermindData
  wounds: DeckEntry
  bystanders: DeckEntry
  bystandersInVillainDeck: number
  bystandersInHeroDeck: number
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
  onTwist?: (state: GameState, twistNumber: number, ui: UiAdapter, twist: CardInstance) => void | Promise<void>

  // true: karta Twista NIE trafia automatycznie do KO. Scheme sam decyduje, gdzie ją położyć (dostaje ją jako 4. argument onTwist)
  keepsTwistCard?: boolean

  // Jeńcy uratowani przez pokonanie Villaina. Zwraca tych, którzy mają trafić do Victory Pile; resztą zajmuje się scheme.
  // Przy walce z Mastermindem zwraca jeńców, którzy mają przy nim zostać (domyślnie wszyscy).
  onCaptivesRescued?: (state: GameState, villain: CardInstance, captives: CardInstance[]) => CardInstance[]
  // Karta z talii złoczyńców, zanim silnik rozpatrzy ją domyślnie (wejście do miasta, jeniec itp.).
  // Zwraca true, jeśli scheme rozpatrzył ją sam (X-Cutioner's Song: Bohater z talii złoczyńców zostaje jeńcem).
  onVillainDeckCard?: (state: GameState, card: CardInstance, ui: UiAdapter) => boolean | Promise<boolean>

  // Bohater skasowany z HQ (przez koFromHq). Gdy zdefiniowane, zastępuje domyślne trafienie karty do KO
  // (Detonate the Helicarrier: karta zostaje zakryta na miejscu HQ jako Eksplozja).
  onHeroKoedFromHq?: (state: GameState, hero: CardInstance, hqIndex: number) => void

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
  bystandersInHeroDeck: number // Save Humanity: ile Bystanderów dokłada się do talii Bohaterów
  villainDeckHeroes: number // ile dodatkowych grup bohaterów trafia do talii złoczyńców
  requiredVillainDeckHeroes: string[]
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
  villainDeckHeroIds: string[]
  villainGroupIds: string[]
  henchmenGroupIds: string[]
}
