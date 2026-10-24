import type { DeckEntry } from '../../../engine/types'

const img = (slug: string) => `/cards/paint-the-town-red/${slug}.webp`

export const BLACK_CAT_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-black-cat-casual-bank-robbery', name: 'Casual Bank Robbery', hero: 'Black Cat', img: img('hero-black-cat-casual-bank-robbery'), team: ['spider-friends'], type: ['covert'], keywords: ['wall-crawl'], recruit: 2, cost: 4, text: 'Wall-Crawl. You get another +1 Recruit usable only to recruit the Hero in the HQ space under the Bank.' } },
  { count: 5, card: { id: 'hero-black-cat-pickpocket', name: 'Pickpocket', hero: 'Black Cat', img: img('hero-black-cat-pickpocket'), team: ['spider-friends'], type: ['covert'], keywords: ['wall-crawl'], attack: 0, cost: 1, text: 'Wall-Crawl. Reveal the top card of any player’s deck. You get +Attack equal to that card’s printed Recruit plus its printed Attack.' } },
  { count: 3, card: { id: 'hero-black-cat-jinx', name: 'Jinx', hero: 'Black Cat', img: img('hero-black-cat-jinx'), team: ['spider-friends'], type: ['instinct'], attack: 3, cost: 5, text: 'Each player reveals the top card of their deck. Choose any number of those cards to be discarded.' } },
  { count: 1, card: { id: 'hero-black-cat-cat-burglar', name: 'Cat Burglar', hero: 'Black Cat', img: img('hero-black-cat-cat-burglar'), team: ['spider-friends'], type: ['covert'], attack: 5, cost: 8, text: 'Each other player reveals a Covert Hero or chooses a Bystander from their Victory Pile. You rescue those Bystanders. Spider Friends: You get +1 Attack for each Bystander you rescued this turn.' } },
]

export const MOON_KNIGHT_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-moon-knight-climbing-claws', name: 'Climbing Claws', hero: 'Moon Knight', img: img('hero-moon-knight-climbing-claws'), team: ['marvel-knights'], type: ['tech'], keywords: ['wall-crawl'], recruit: 2, cost: 3, text: 'Wall-Crawl. Instinct Hero: You get +1 Recruit.' } },
  { count: 5, card: { id: 'hero-moon-knight-lunar-communion', name: 'Lunar Communion', hero: 'Moon Knight', img: img('hero-moon-knight-lunar-communion'), team: ['marvel-knights'], type: ['instinct'], keywords: ['wall-crawl'], attack: 2, cost: 3, text: 'Wall-Crawl. Whenever you defeat a Villain on the Rooftops this turn, you may KO one of your cards or a card from your discard pile.' } },
  { count: 3, card: { id: 'hero-moon-knight-crescent-moon-darts', name: 'Crescent Moon Darts', hero: 'Moon Knight', img: img('hero-moon-knight-crescent-moon-darts'), team: ['marvel-knights'], type: ['tech'], attack: 3, cost: 5, text: 'Reveal the top card of your deck. If it is an Instinct or Tech Hero, draw it.' } },
  { count: 1, card: { id: 'hero-moon-knight-golden-ankh-of-khonshu', name: 'Golden Ankh of Khonshu', hero: 'Moon Knight', img: img('hero-moon-knight-golden-ankh-of-khonshu'), team: ['marvel-knights'], type: ['instinct'], attack: 6, cost: 8, text: 'Whenever you defeat a Villain on the Rooftops this turn, rescue Bystanders equal to that Villain’s printed VP. Tech Hero: You may move a Villain to the Rooftops. If another Villain is already there, swap them.' } },
]

export const SCARLET_SPIDER_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-scarlet-spider-flip-out', name: 'Flip Out', hero: 'Scarlet Spider', img: img('hero-scarlet-spider-flip-out'), team: ['spider-friends'], type: ['strength'], keywords: ['wall-crawl'], recruit: 1, cost: 2, text: 'Wall-Crawl. Spider Friends: Draw a card.' } },
  { count: 5, card: { id: 'hero-scarlet-spider-perfect-hunter', name: 'Perfect Hunter', hero: 'Scarlet Spider', img: img('hero-scarlet-spider-perfect-hunter'), team: ['spider-friends'], type: ['instinct'], keywords: ['wall-crawl'], attack: 1, cost: 4, text: 'Wall-Crawl. Draw a card.' } },
  { count: 3, card: { id: 'hero-scarlet-spider-leap-from-above', name: 'Leap from Above', hero: 'Scarlet Spider', img: img('hero-scarlet-spider-leap-from-above'), team: ['spider-friends'], type: ['covert'], keywords: ['wall-crawl'], attack: 3, cost: 6, text: 'Wall-Crawl. Instinct Hero: You get +2 Attack.' } },
  { count: 1, card: { id: 'hero-scarlet-spider-sting-of-the-spider', name: 'Sting of the Spider', hero: 'Scarlet Spider', img: img('hero-scarlet-spider-sting-of-the-spider'), team: ['spider-friends'], type: ['strength'], attack: 5, cost: 7, text: 'Whenever you put a card on top of your deck this turn, you may draw that card.' } },
]

export const SPIDER_WOMAN_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-spider-woman-bioelectric-shock', name: 'Bioelectric Shock', hero: 'Spider-Woman', img: img('hero-spider-woman-bioelectric-shock'), team: ['spider-friends'], type: ['ranged'], keywords: ['wall-crawl'], attack: 2, cost: 4, text: 'Wall-Crawl. Reveal the top card of your deck. If that card has an Attack icon, draw it.' } },
  { count: 5, card: { id: 'hero-spider-woman-radioactive-spider', name: 'Radioactive Spider', hero: 'Spider-Woman', img: img('hero-spider-woman-radioactive-spider'), team: ['spider-friends'], type: ['strength'], recruit: 3, cost: 2, text: 'To play this card, you must put a card from your hand on top of your deck.' } },
  { count: 3, card: { id: 'hero-spider-woman-venom-blast', name: 'Venom Blast', hero: 'Spider-Woman', img: img('hero-spider-woman-venom-blast'), team: ['spider-friends'], type: ['ranged'], keywords: ['wall-crawl'], attack: 3, cost: 6, text: 'Wall-Crawl. Reveal the top card of your deck. If that card has a Recruit icon, draw it.' } },
  { count: 1, card: { id: 'hero-spider-woman-arachno-pheromones', name: 'Arachno-Pheromones', hero: 'Spider-Woman', img: img('hero-spider-woman-arachno-pheromones'), team: ['spider-friends'], type: ['covert'], cost: 7, text: 'Recruit a Hero from the HQ for free. Spider Friends: Put that Hero on top of your deck.' } },
]

export const SYMBIOTE_SPIDER_MAN_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-symbiote-spider-man-dark-strength', name: 'Dark Strength', hero: 'Symbiote Spider-Man', img: img('hero-symbiote-spider-man-dark-strength'), team: ['spider-friends'], type: ['strength'], keywords: ['wall-crawl'], attack: 1, cost: 2, text: 'Wall-Crawl. Reveal the top card of your deck. If it costs 1 or 2, you get +2 Attack.' } },
  { count: 5, card: { id: 'hero-symbiote-spider-man-spider-sense-tingling', name: 'Spider-Sense Tingling', hero: 'Symbiote Spider-Man', img: img('hero-symbiote-spider-man-spider-sense-tingling'), team: ['spider-friends'], type: ['instinct'], cost: 2, text: 'Reveal the top two cards of your deck. Put any that cost 2 or less into your hand. Put the rest back in any order.' } },
  { count: 3, card: { id: 'hero-symbiote-spider-man-shadowed-spider', name: 'Shadowed Spider', hero: 'Symbiote Spider-Man', img: img('hero-symbiote-spider-man-shadowed-spider'), team: ['spider-friends'], type: ['covert'], attack: 1, cost: 2, text: 'Wall-Crawl. You get +1 Attack for each other Hero you played this turn that costs 1 or 2.' } },
  { count: 1, card: { id: 'hero-symbiote-spider-man-thwip', name: 'Thwip!', hero: 'Symbiote Spider-Man', img: img('hero-symbiote-spider-man-thwip'), team: ['spider-friends'], type: ['ranged'], attack: 4, cost: 2, text: 'To play this card, you must put two cards from your hand on top of your deck.' } },
]
