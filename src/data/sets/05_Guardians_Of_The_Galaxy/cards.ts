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

// ---------- Villains ----------

const villainImg = (slug: string) => `/cards/guardians-of-the-galaxy/villain-${slug}.webp`

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

export const KREE_STARFORCE_CARDS: DeckEntry[] = [
  villainCard('captain-atlas', 'Captain Atlas', 'Kree Starforce', 6, 4, 'Captain Atlas gets +1 Attack for each Shard on the Mastermind. Escape: Each player loses a Shard. Each player that cannot do so gains a Wound.', ['shard']),
  villainCard('demon-druid', 'Demon Druid', 'Kree Starforce', 5, 3, 'Ambush: Another Villain in the city gains two Shards.', ['shard']),
  villainCard('dr-minerva', 'Dr. Minerva', 'Kree Starforce', 5, 3, 'Ambush: Each Kree Villain in the city gains a Shard (including this Villain).', ['shard']),
  villainCard('korath-the-pursuer', 'Korath the Pursuer', 'Kree Starforce', 5, 3, 'Ambush: Each player may draw a card. Korath gains a Shard for each card drawn this way. Escape: If Korath had any Shards, each player gains a Wound.', ['shard']),
  villainCard('ronan-the-accuser', 'Ronan the Accuser', 'Kree Starforce', 7, 5, 'Ambush: Each player simultaneously points their finger to accuse another player. Each player who was accused the most gains a Wound. Escape: Same effect.'),
  villainCard('shatterax', 'Shatterax', 'Kree Starforce', 5, 3, 'Fight: Put a Shard on each Hero in the HQ. When a player gains that Hero, they gain that Shard. If that Hero leaves the HQ some other way, return that Shard to the supply.', ['shard']),
  { ...villainCard('supremor', 'Supremor', 'Kree Starforce', 3, 2, 'Ambush: Supremor and the Mastermind each gain a Shard.', ['shard']), count: 2 },
]

function infinityGemCard(id: string, name: string, strength: number, count: number, text: string): DeckEntry {
  return {
    count,
    card: {
      id: `villain-infinity-gems-${id}`,
      name,
      img: 'villain-infinity-gems-${id}.webp',
      strength,
      vp: 0,
      villainGroup: 'Infinity Gems',
      text,
      keywords: ['artifact', 'villain-artifact', 'shard'],
    },
  }
}

export const INFINITY_GEMS_CARDS: DeckEntry[] = [
  infinityGemCard(
    'mind-gem',
    'Mind Gem',
    6,
    1,
    'Ambush: Mind Gem gains a Shard for each Scheme Twist in the KO pile and/or stacked next to the Scheme. Fight: Put this into your discard pile as an Artifact. Artifact — Once per turn, you get +2 Recruit.',
  ),
  infinityGemCard(
    'power-gem',
    'Power Gem',
    7,
    1,
    'Ambush: Power Gem gains a Shard for each Master Strike in the KO pile and/or stacked next to the Mastermind. Fight: Put this into your discard pile as an Artifact. Artifact — Once per turn, you get +2 Attack.',
  ),
  infinityGemCard(
    'reality-gem',
    'Reality Gem',
    5,
    2,
    "Ambush: Reality Gem gains a Shard for each Infinity Gem Villain card in the city and/or Escape pile. Fight: Put this into your discard pile as an Artifact. Artifact — Before you play a card from the Villain Deck, you may first reveal the top card of the Villain Deck. If it's not a Scheme Twist, you may put it on the bottom of the Villain Deck. If you do, gain a Shard.",
  ),
  infinityGemCard(
    'soul-gem',
    'Soul Gem',
    6,
    1,
    'Ambush: Soul Gem gains a Shard for each Villain in the city. Fight: Put this into your discard pile as an Artifact. Artifact — Whenever you defeat a Villain, put a Shard on Soul Gem from the supply. Once per turn, you get +Attack equal to the number of Shards on Soul Gem.',
  ),
  infinityGemCard(
    'space-gem',
    'Space Gem',
    5,
    2,
    'Ambush: Space Gem gains a Shard for each empty space in the city. Fight: Put this into your discard pile as an Artifact. Artifact — Once per turn, you may move a Villain to another city space. If another Villain is already there, swap them. If you moved any Villains this way, gain a Shard.',
  ),
  infinityGemCard(
    'time-gem',
    'Time Gem',
    6,
    1,
    'Ambush: Play another card from the Villain Deck. Time Gem gains Shards equal to that card’s printed Victory Points. Fight: Put this into your discard pile as an Artifact. Artifact — When you play this Artifact, take another turn after this one. Use this ability only if this is the first time any player has played the Time Gem this game.',
  ),
]
