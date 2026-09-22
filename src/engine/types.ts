// ============================================================
// KARTY
// ============================================================

// Definicja karty: niezmienne dane, jedna na cały typ karty
export interface CardData {
  id: string
  name: string
  hero?: string    // NOWE: do jakiego bohatera należy karta (np. "Black Widow")  
  img: string
  cost?: number       // koszt kupienia (recruit)
  attack?: number
  recruit?: number
  strength?: number   // ile attack trzeba mieć, żeby pokonać złoczyńcę lub Mastermind
  vp?: number   // NOWE: punkty zwycięstwa (drukowane na karcie)  
  kind?: 'wound' | 'bystander' | 'twist'   // karty specjalne
  text?: string        // NOWE: treść umiejętności (przyda się do popupu z lupą)
  team?: string[]       // NOWE: drużyny na karcie, puste/brak = żadna
  type?: string[]        // NOWE: typy na karcie (covert, tech...), puste/brak = żaden
}

// Konkretna kopia karty w grze (agentów masz 8, ale każdy to osobny egzemplarz)
export interface CardInstance {
  instanceId: string  // unikalne id egzemplarza, np. "shield-agent-3"
  cardId: string      // odwołanie do CardData.id
}

// Wpis w składzie talii: jaka karta i ile jej kopii
export interface DeckEntry {
  card: CardData
  count: number
}

// Mastermind: sama karta plus jego taktyki (nagrody za pokonanie)
export interface MastermindData {
  card: CardData
  tactics: CardData[]
}

// ============================================================
// STAN GRY
// ============================================================

export type GameStatus = 'playing' | 'won' | 'lost'

export interface GameState {
  // Słownik danych kart: id -> definicja
  cards: Record<string, CardData>

  // Talie i stosy gracza
  deck: CardInstance[]
  hand: CardInstance[]
  cardsPlayedThisTurn: CardInstance[]   // NOWE: karty zagrane wcześniej w tej turze  
  played: CardInstance[]
  discard: CardInstance[]

  // Bohaterowie do kupienia
  heroDeck: CardInstance[]
  hq: (CardInstance | null)[]

  // Złoczyńcy i miasto ([0] = Sewers ... [4] = Bridge)
  villainDeck: CardInstance[]
  city: (CardInstance | null)[]
  cityMarkers: string[][]                    // znaczniki na polach miasta (równolegle do city)
  escaped: CardInstance[]                    // złoczyńcy, którzy uciekli
  captives: Record<string, CardInstance[]>   // id złoczyńcy -> przetrzymywani bystanderzy

  // Mastermind
  mastermind: CardInstance
  tactics: CardInstance[]                    // taktyki, które zostały do zdobycia

  // Pozostałe stosy
  defeated: CardInstance[]                   // stos zwycięstwa
  wounds: CardInstance[]
  bystanders: CardInstance[]
  ko: CardInstance[]                         // karty usunięte z gry (KO)

  // Scheme
  schemeId: string
  counters: Record<string, number>           // liczniki scheme'u po nazwie
  twistsRevealed: number                     // ile Twistów już odkryto

  // Bieżąca gra
  attack: number
  recruit: number
  turn: number
  extraTurnsQueued: number   // NOWE: ile dodatkowych tur bez fazy złoczyńcy czeka (Secrets of Time Travel)
  bonusDrawNextTurn: number  // NOWE: ile dodatkowych kart dobrać przy najbliższym dobraniu ręki (Treasures of Latveria)
  status: GameStatus
}

// ============================================================
// PRZYGOTOWANIE GRY I SCHEME
// ============================================================

// Wszystko, czego potrzeba do przygotowania gry
export interface GameSetup {
  startingCards: DeckEntry[]
  heroCards: DeckEntry[]
  villainCards: DeckEntry[]
  mastermind: MastermindData
  wounds: DeckEntry
  bystanders: DeckEntry
  bystandersInVillainDeck: number   // ile bystanderów trafia do talii złoczyńców
  scheme: SchemeDef
  twist: CardData                   // karta Scheme Twist
}

export interface SchemeDef {
  id: string
  name: string
  img: string
  twistCount: number                // ile Twistów wchodzi do talii złoczyńców
  escapeLimit?: number              // opcjonalnie: inny próg uciekłych niż domyślny

  // Haczyki: wszystkie opcjonalne, scheme wypełnia tylko potrzebne
  setup?: (state: GameState) => void
  onTwist?: (state: GameState, twistNumber: number) => void
  onVillainEntered?: (state: GameState, villain: CardInstance) => void
  onVillainEscaped?: (state: GameState, villain: CardInstance) => void
  checkLoss?: (state: GameState) => boolean
}

// ============================================================
// ZESTAWY KART
// ============================================================

// Zestaw kart (Core Set, dodatek). Kolejne kategorie kart dojdą tu, gdy przeniesiemy resztę danych
export interface SetData {
  id: string
  name: string
  schemes: SchemeDef[]
}