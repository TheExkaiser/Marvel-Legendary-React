import type { DeckEntry, MastermindData } from '../../../engine/types'

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

export const MAXIMUM_CARNAGE_CARDS: DeckEntry[] = [
  { ...villainCard('carrion', 'Carrion', 'Maximum Carnage', 4, 3, 'Feast. Whenever Carrion feasts on a Hero that costs 1 or more, put Carrion back in the city space where he was.', ['feast']), count: 2 },
  { ...villainCard('demogoblin', 'Demogoblin', 'Maximum Carnage', 5, 3, 'Ambush: Demogoblin captures a Bystander. Feast.', ['feast']), count: 2 },
  { ...villainCard('doppelganger', 'Doppelganger', 'Maximum Carnage', undefined, 3, "Doppelganger's Attack is equal to the Cost of the Hero in the HQ space under him. Feast.", ['feast']), count: 2 },
  { ...villainCard('shriek', 'Shriek', 'Maximum Carnage', 6, 4, 'Feast. When Shriek feasts on a 0-cost Hero, each other player gains a Wound. Escape: Each player gains a Wound.', ['feast']), count: 2 },
]

export const SINISTER_SIX_CARDS: DeckEntry[] = [
  villainCard('chameleon', 'Chameleon', 'Sinister Six', 6, 2, 'Fight: Copy the effects of the Hero in the HQ space under Chameleon, including its Recruit and Attack.'),
  villainCard('hobgoblin', 'Hobgoblin', 'Sinister Six', 5, 3, 'Ambush: Each Sinister Six Villain captures a Bystander.'),
  villainCard('kraven-the-hunter', 'Kraven the Hunter', 'Sinister Six', undefined, 4, 'Kraven’s Attack is equal to the Cost of the highest-cost Hero in the HQ. Escape: After you do the normal escape KO, KO a Hero from the HQ with the highest cost.'),
  villainCard('sandman', 'Sandman', 'Sinister Six', undefined, 4, 'Sandman’s Attack is twice the number of Villains in the city. Escape: Each player reveals an Instinct Hero or gains a Wound.'),
  villainCard('shocker', 'Shocker', 'Sinister Six', 5, 3, 'Ambush: Each player reveals an Instinct Hero or discards a card.'),
  villainCard('vulture', 'Vulture', 'Sinister Six', 4, 2, 'Ambush: After Vulture enters the city, if there is a Villain on the Rooftops or Bridge, swap Vulture with one of those Villains. Escape: Each player reveals an Instinct Hero or gains a Wound.'),
].map((entry) => ({ ...entry, count: entry.card.id === 'villain-chameleon' || entry.card.id === 'villain-hobgoblin' || entry.card.id === 'villain-kraven-the-hunter' || entry.card.id === 'villain-sandman' ? 1 : 2 }))

const mastermindImg = (slug: string) => `/cards/paint-the-town-red/mastermind-${slug}.webp`
const tacticImg = (slug: string) => `/cards/paint-the-town-red/${slug}.webp`

const MYSTERIO_MASTER_STRIKE_TACTIC: DeckEntry['card'] = {
  id: 'mysterio-master-strike-tactic', name: 'Mysterio’s Master Strike', img: '/cards/core-set/masterstrike.webp', vp: 6,
  text: 'Mastermind Tactic created by Mysterio’s Master Strike.',
}

export const CARNAGE: MastermindData = {
  card: { id: 'mastermind-carnage', name: 'Carnage', img: mastermindImg('carnage'), strength: 9, vp: 6, text: 'Always Leads: Maximum Carnage. Each Villain gets +2 Attack for each Hero it has.' },
  tactics: [
    { id: 'carnage-drooling-jaws', name: 'Drooling Jaws', img: tacticImg('carnage-drooling-jaws'), vp: 6, text: 'Fight: Each player reveals the top card of their deck. Then Carnage feasts on the player of your choice.' },
    { id: 'carnage-endless-hunger', name: 'Endless Hunger', img: tacticImg('carnage-endless-hunger'), vp: 6, text: 'Feast. If Carnage feasts on a 0-cost Hero this way, repeat this process.' },
    { id: 'carnage-feed-me', name: 'Feed Me', img: tacticImg('carnage-feed-me'), vp: 6, text: 'Feast. You get +Recruit equal to the Cost of the card Carnage feasts on.' },
    { id: 'carnage-om-nom-nom', name: 'Om Nom Nom', img: tacticImg('carnage-om-nom-nom'), vp: 6, text: 'Feast. If Carnage feasts on a 0-cost Hero this way, each other player KOs a Bystander from their Victory Pile.' },
  ],
  masterStrikeId: 'mastermind-carnage-master-strike',
  masterStrikeText: 'Feast on each player. Whenever this Master Strike feasts on a player’s 0-cost Hero, that player gains a Wound.',
  alwaysLeads: { villainGroupId: 'paint_red_maximum_carnage' },
}

export const MYSTERIO: MastermindData = {
  card: { id: 'mastermind-mysterio', name: 'Mysterio', img: mastermindImg('mysterio'), strength: 8, vp: 6, text: 'Always Leads: Sinister Six.' },
  tactics: [
    { id: 'mysterio-blurring-images', name: 'Blurring Images', img: tacticImg('mysterio-blurring-images'), vp: 6, text: 'Fight: You get +1 Recruit for each Mastermind Tactic Mysterio has left after this one.' },
    { id: 'mysterio-captive-audience', name: 'Captive Audience', img: tacticImg('mysterio-captive-audience'), vp: 6, text: 'Fight: Rescue a Bystander for each Mastermind Tactic Mysterio has left after this one.' },
    { id: 'mysterio-master-of-illusions', name: 'Master of Illusions', img: tacticImg('mysterio-master-of-illusions'), vp: 6, text: 'Fight: If this is not the final Tactic, shuffle a Master Strike Tactic from each other player’s Victory Pile back into Mysterio’s Mastermind Tactics.' },
    { id: 'mysterio-mists-of-deception', name: 'Mists of Deception', img: tacticImg('mysterio-mists-of-deception'), vp: 6, text: 'Fight: If this is not the final Tactic, reveal the top five cards of the Villain Deck. Play all the Master Strikes you revealed. Put the rest on the bottom of that deck in random order.' },
  ],
  extraCards: [MYSTERIO_MASTER_STRIKE_TACTIC],
  masterStrikeId: 'mastermind-mysterio-master-strike',
  masterStrikeText: 'Shuffle this Master Strike into Mysterio’s face-down Mastermind Tactics. That card becomes a Mastermind Tactic worth 6 VP.',
  alwaysLeads: { villainGroupId: 'paint_red_sinister_six' },
}
