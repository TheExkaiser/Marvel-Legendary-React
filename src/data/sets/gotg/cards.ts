import type { DeckEntry } from '../../../engine/types'

const img = (slug: string) => `/cards/guardians-of-the-galaxy/${slug}.webp`
const TEAM = ['guardians-of-the-galaxy']

// Słowa kluczowe używane tylko przez silnik/UI:
//   'artifact' = Hero Artifact (zostaje w grze między turami, patrz engine/artifacts.ts)
//   'shard'    = karta operuje na Shardach (steruje widocznością licznika Shardów i wpisem w glosariuszu)

export const DRAX_THE_DESTROYER_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-drax-the-destroyer-knives-of-the-hunter', name: 'Knives of the Hunter', hero: 'Drax the Destroyer', img: img('hero-drax-the-destroyer-knives-of-the-hunter'), team: TEAM, type: ['strength'], keywords: ['artifact'], cost: 3, text: 'Artifact - Once per turn, you get +1 Attack.' } },
  { count: 5, card: { id: 'hero-drax-the-destroyer-interstellar-tracker', name: 'Interstellar Tracker', hero: 'Drax the Destroyer', img: img('hero-drax-the-destroyer-interstellar-tracker'), team: TEAM, type: ['instinct'], recruit: 2, cost: 3, text: 'Look at the top card of your deck. Discard it or put it back.', conditionIcons: ['instinct'], conditionText: 'You may KO the card you discarded this way.' } },
  { count: 3, card: { id: 'hero-drax-the-destroyer-the-destroyer', name: 'The Destroyer', hero: 'Drax the Destroyer', img: img('hero-drax-the-destroyer-the-destroyer'), team: TEAM, type: ['instinct'], keywords: ['shard'], attack: 4, cost: 6, text: 'Guardians of the Galaxy: Each other player reveals an Instinct Hero or discards an Artifact they control. For each Artifact discarded this way, you gain a Shard.' } },
  { count: 1, card: { id: 'hero-drax-the-destroyer-avatar-of-destruction', name: 'Avatar of Destruction', hero: 'Drax the Destroyer', img: img('hero-drax-the-destroyer-avatar-of-destruction'), team: TEAM, type: ['instinct'], cost: 7, text: 'Double the Attack you have.' } },
]

export const GAMORA_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-gamora-bounty-hunter', name: 'Bounty Hunter', hero: 'Gamora', img: img('hero-gamora-bounty-hunter'), team: TEAM, type: ['covert'], keywords: ['shard'], recruit: 2, cost: 2, text: 'A Villain gains a Shard.' } },
  { count: 5, card: { id: 'hero-gamora-deadliest-woman-in-the-universe', name: 'Deadliest Woman in the Universe', hero: 'Gamora', img: img('hero-gamora-deadliest-woman-in-the-universe'), team: TEAM, type: ['instinct'], keywords: ['shard'], cost: 3, text: 'Gain two Shards.', conditionIcons: ['covert'], conditionText: 'Gain another Shard.' } },
  { count: 3, card: { id: 'hero-gamora-galactic-assassin', name: 'Galactic Assassin', hero: 'Gamora', img: img('hero-gamora-galactic-assassin'), team: TEAM, type: ['covert'], keywords: ['shard'], attack: 3, cost: 5, text: 'A Villain of your choice gets no Attack from Shards this turn.', conditionIcons: ['covert', 'covert'], conditionText: 'The Mastermind gets no Attack from Shards this turn.' } },
  { count: 1, card: { id: 'hero-gamora-godslayer-blade', name: 'Godslayer Blade', hero: 'Gamora', img: img('hero-gamora-godslayer-blade'), team: TEAM, type: ['covert'], keywords: ['artifact', 'shard'], cost: 8, text: 'Artifact - Once per turn, gain two Shards. Once per turn, you may spend 5 Shards to get +10 Attack.' } },
]

export const GROOT_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-groot-prune-the-growths', name: 'Prune the Growths', hero: 'Groot', img: img('hero-groot-prune-the-growths'), team: TEAM, type: ['strength'], keywords: ['shard'], attack: 2, cost: 4, text: '', conditionIcons: ['strength'], conditionText: 'You may KO a card from your hand or discard pile. If you do, gain a Shard.' } },
  { count: 5, card: { id: 'hero-groot-surviving-sprig', name: 'Surviving Sprig', hero: 'Groot', img: img('hero-groot-surviving-sprig'), team: TEAM, type: ['strength'], attack: 1, cost: 3, text: 'When you draw a new hand of cards at the end of this turn, draw an extra card.' } },
  { count: 3, card: { id: 'hero-groot-groot-and-branches', name: 'Groot and Branches', hero: 'Groot', img: img('hero-groot-groot-and-branches'), team: TEAM, type: ['covert'], keywords: ['shard'], cost: 4, text: 'Gain two Shards. You may spend Shards to get Recruit this turn.', conditionIcons: ['covert'], conditionText: 'You may choose another player. That player gains a Shard.' } },
  { count: 1, card: { id: 'hero-groot-i-am-groot', name: 'I Am Groot', hero: 'Groot', img: img('hero-groot-i-am-groot'), team: TEAM, type: ['strength'], keywords: ['shard'], recruit: 5, cost: 8, text: "When you recruit your next Hero this turn, you gain Shards equal to that Hero's cost." } },
]

export const ROCKET_RACCOON_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-rocket-raccoon-gritty-scavenger', name: 'Gritty Scavenger', hero: 'Rocket Raccoon', img: img('hero-rocket-raccoon-gritty-scavenger'), team: TEAM, type: ['tech'], recruit: 2, cost: 3, text: 'You may discard a card. If you do, draw a card.' } },
  { count: 5, card: { id: 'hero-rocket-raccoon-trigger-happy', name: 'Trigger Happy', hero: 'Rocket Raccoon', img: img('hero-rocket-raccoon-trigger-happy'), team: TEAM, type: ['ranged'], keywords: ['shard'], attack: 2, cost: 4, text: 'Guardians of the Galaxy: You gain a Shard for each other Guardians of the Galaxy Hero you played this turn.' } },
  { count: 3, card: { id: 'hero-rocket-raccoon-incoming-detector', name: 'Incoming Detector', hero: 'Rocket Raccoon', img: img('hero-rocket-raccoon-incoming-detector'), team: TEAM, type: ['instinct'], keywords: ['artifact', 'shard'], cost: 4, text: "Artifact - Whenever a Master Strike or Villain's Ambush ability is completed, you may gain a Shard." } },
  { count: 1, card: { id: 'hero-rocket-raccoon-vengeance-is-rocket', name: 'Vengeance is Rocket', hero: 'Rocket Raccoon', img: img('hero-rocket-raccoon-vengeance-is-rocket'), team: TEAM, type: ['tech'], attack: 5, cost: 7, text: '', conditionIcons: ['tech'], conditionText: 'You get +1 Attack for each Master Strike in the KO pile and/or stacked next to the Mastermind.' } },
]

export const STAR_LORD_CARDS: DeckEntry[] = [
  { count: 5, card: { id: 'hero-star-lord-element-guns', name: 'Element Guns', hero: 'Star-Lord', img: img('hero-star-lord-element-guns'), team: TEAM, type: ['ranged'], keywords: ['artifact', 'shard'], cost: 4, text: 'Artifact - Once per turn, gain a Shard.' } },
  { count: 5, card: { id: 'hero-star-lord-legendary-outlaw', name: 'Legendary Outlaw', hero: 'Star-Lord', img: img('hero-star-lord-legendary-outlaw'), team: TEAM, type: ['covert'], recruit: 2, cost: 4, text: 'Choose an Artifact any player controls with a "once per turn" ability. Play a copy of one of those abilities.' } },
  { count: 3, card: { id: 'hero-star-lord-implanted-memory-chip', name: 'Implanted Memory Chip', hero: 'Star-Lord', img: img('hero-star-lord-implanted-memory-chip'), team: TEAM, type: ['tech'], keywords: ['artifact'], cost: 6, text: 'Artifact - Once per turn, draw a card.' } },
  { count: 1, card: { id: 'hero-star-lord-sentient-starship', name: 'Sentient Starship', hero: 'Star-Lord', img: img('hero-star-lord-sentient-starship'), team: TEAM, type: ['ranged'], keywords: ['artifact', 'shard'], cost: 8, text: 'Artifact - Once per turn, gain a Shard for each Artifact you control.' } },
]
