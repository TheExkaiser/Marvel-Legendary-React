import type { DeckEntry } from '../../../engine/types'

// Karty Secret Wars Vol. 2. Dane dopisujemy grupami (bohaterowie, złoczyńcy, henchmeni, mastermindzi).
// Obrazki leżą w public/cards/secret-wars-vol-2/<id>.webp
export const img = (id: string) => `/cards/secret-wars-vol-2/${id}.webp`

export const AGENT_VENOM_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'secret-wars-2-agent-venom-multi-gun', name: 'Multi-Gun', hero: 'Agent Venom', img: img('secret-wars-2-agent-venom-multi-gun'), team: ['spider-friends'], type: ['tech'], recruit: 1, attack: 1, cost: 2, text: 'Spectrum: You get +1 Recruit and +1 Attack.', flavor: 'His weapons are as versatile as Venom himself.' } },
  { count: 5, card: { id: 'secret-wars-2-agent-venom-government-payroll', name: 'Government Payroll', hero: 'Agent Venom', img: img('secret-wars-2-agent-venom-government-payroll'), team: ['spider-friends'], type: ['strength', 'instinct'], recruit: 0, attack: 0, cost: 3, keywords: ['wall-crawl'], text: "Wall-Crawl. Patrol the Bank: If it's empty, you get +2 Recruit. If it's not, you get +2 Attack." } },
  { count: 3, card: { id: 'secret-wars-2-agent-venom-big-slimeportunity', name: 'Big Slimeportunity', hero: 'Agent Venom', img: img('secret-wars-2-agent-venom-big-slimeportunity'), team: ['spider-friends'], type: ['instinct'], recruit: 2, attack: 2, cost: 6, keywords: ['wall-crawl'], text: "Wall-Crawl. Patrol the Sewers: If it's empty, draw a card.", flavor: 'Flash Thompson combines elite military training with Venom symbiote.' } },
  { count: 1, card: { id: 'secret-wars-2-agent-venom-shapeshifting-symbiote', name: 'Shapeshifting Symbiote', hero: 'Agent Venom', img: img('secret-wars-2-agent-venom-shapeshifting-symbiote'), team: ['spider-friends'], type: ['strength'], recruit: 0, attack: 0, cost: 7, keywords: ['wall-crawl'], text: 'Wall-Crawl. For each other card you played this turn with a Recruit icon, you get +1 Recruit.\nFor each other card you played this turn with a Attack icon, you get +1 Attack.\n(If another card has both Recruit and Attack, you get both bonuses.)' } },
]
