import type { DeckEntry, MastermindData } from '../../../engine/types'

const img = (slug: string) => `/cards/paint-the-town-red/${slug}.webp`
/* WZÓR:
export const BLACK_CAT_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-black-cat-casual-bank-robbery', name: 'Casual Bank Robbery', hero: 'Black Cat', img: img('hero-black-cat-casual-bank-robbery'), team: ['spider-friends'], type: ['covert'], keywords: ['wall-crawl'], recruit: 2, cost: 4, text: 'Wall-Crawl. You get another +1 Recruit usable only to recruit the Hero in the HQ space under the Bank.' } },
  { count: 5, card: { id: 'hero-black-cat-pickpocket', name: 'Pickpocket', hero: 'Black Cat', img: img('hero-black-cat-pickpocket'), team: ['spider-friends'], type: ['covert'], keywords: ['wall-crawl'], attack: 0, cost: 1, text: 'Wall-Crawl. Reveal the top card of any player’s deck. You get +Attack equal to that card’s printed Recruit plus its printed Attack.' } },
  { count: 3, card: { id: 'hero-black-cat-jinx', name: 'Jinx', hero: 'Black Cat', img: img('hero-black-cat-jinx'), team: ['spider-friends'], type: ['instinct'], attack: 3, cost: 5, text: 'Each player reveals the top card of their deck. Choose any number of those cards to be discarded.' } },
  { count: 1, card: { id: 'hero-black-cat-cat-burglar', name: 'Cat Burglar', hero: 'Black Cat', img: img('hero-black-cat-cat-burglar'), team: ['spider-friends'], type: ['covert'], attack: 5, cost: 8, text: 'Each other player reveals a Covert Hero or chooses a Bystander from their Victory Pile. You rescue those Bystanders. Spider Friends: You get +1 Attack for each Bystander you rescued this turn.' } },
]
*/
const villainImg = (slug: string) => `/cards/paint-the-town-red/villain-${slug}.webp`

function villainCard(
  id: string,
  name: string,
  group: string,
  strength: number | undefined,
  vp: number,
  text: string,
  keywords: string[] = [],
): DeckEntry {
  return {
    count: 1,
    card: {
      id: `villain-${id}`,
      name,
      img: villainImg(id),
      strength,
      vp,
      villainGroup: group,
      text,
      keywords,
    },
  }
}
/* WZÓR:
export const MAXIMUM_CARNAGE_CARDS: DeckEntry[] = [
  { ...villainCard('carrion', 'Carrion', 'Maximum Carnage', 4, 3, 'Feast. Whenever Carrion feasts on a Hero that costs 1 or more, put Carrion back in the city space where he was.', ['feast']), count: 2 },
  { ...villainCard('demogoblin', 'Demogoblin', 'Maximum Carnage', 5, 3, 'Ambush: Demogoblin captures a Bystander. Feast.', ['feast']), count: 2 },
  { ...villainCard('doppelganger', 'Doppelganger', 'Maximum Carnage', undefined, 3, "Doppelganger's Attack is equal to the Cost of the Hero in the HQ space under him. Feast.", ['feast']), count: 2 },
  { ...villainCard('shriek', 'Shriek', 'Maximum Carnage', 6, 4, 'Feast. When Shriek feasts on a 0-cost Hero, each other player gains a Wound. Escape: Each player gains a Wound.', ['feast']), count: 2 },
]
*/