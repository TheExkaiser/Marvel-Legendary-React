import type { CardData, DeckEntry, MastermindData } from '../../../engine/types'

export const STARTING_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'shield-agent',
      name: 'S.H.I.E.L.D. Agent',
      img: '/cards/core-set/Core+Agent.webp',
      recruit: 1,
    },
    count: 8,
  },
  {
    card: {
      id: 'shield-trooper',
      name: 'S.H.I.E.L.D. Trooper',
      img: '/cards/core-set/Core+Trooper.webp',
      attack: 1,
    },
    count: 4,
  },
]

// TESTOWE karty bohaterów, do zastąpienia prawdziwymi
export const TEST_HEROES: DeckEntry[] = [
  { card: { id: 'test-a', name: 'Test A', img: '', cost: 2, recruit: 1 }, count: 5 },
  { card: { id: 'test-b', name: 'Test B', img: '', cost: 3, attack: 2 }, count: 5 },
  { card: { id: 'test-c', name: 'Test C', img: '', cost: 4, attack: 2, recruit: 1 }, count: 5 },
  { card: { id: 'test-d', name: 'Test D', img: '', cost: 5, attack: 3 }, count: 5 },
]

// TESTOWE karty złoczyńców, do zastąpienia prawdziwymi
export const TEST_VILLAINS: DeckEntry[] = [
  { card: { id: 'test-v1', name: 'Złoczyńca 1', img: '', strength: 1 }, count: 4 },
  { card: { id: 'test-v2', name: 'Złoczyńca 2', img: '', strength: 2 }, count: 4 },
  { card: { id: 'test-v3', name: 'Złoczyńca 3', img: '', strength: 3 }, count: 4 },
]

export const DRDOOM: MastermindData = {
  card: {
    id: 'mastermind-drdoom',
    name: 'Dr. Doom',
    img: '/cards/core-set/DrDoom.webp',
    strength: 9,
    vp: 5,
    text: 'Master Strike: Each player with exactly 6 cards in hand reveals a Hero or puts 2 cards from their hand on top of their deck.',
  },
  tactics: [
    {
      id: 'drdoom-dark-technology',
      name: 'Dark Technology',
      img: '/cards/core-set/DrDoomTactic1.webp',
      vp: 5,
      text: 'Fight: You may recruit a Tech or Ranged Hero from the HQ for free.',
    },
    {
      id: 'drdoom-monarchs-decree',
      name: "Monarch's Decree",
      img: '/cards/core-set/DrDoomTactic2.webp',
      vp: 5,
      text: 'Fight: Choose one: each other player draws a card or each other player discards a card.',
    },
    {
      id: 'drdoom-secrets-of-time-travel',
      name: 'Secrets of Time Travel',
      img: '/cards/core-set/DrDoomTactic4.webp',
      vp: 5,
      text: 'Fight: Take another turn after this one.',
    },
    {
      id: 'drdoom-treasures-of-latveria',
      name: 'Treasures of Latveria',
      img: '/cards/core-set/DrDoomTactic3.webp',
      vp: 5,
      text: 'Fight: When you draw a new hand of cards at the end of this turn, draw three extra cards.',
    },
  ],
}

export const WOUND: CardData = { id: 'wound', name: 'Wound', img: '/cards/core-set/Core+Wound.webp', kind: 'wound' }

export const BYSTANDER: CardData = { id: 'bystander', name: 'Bystander', img: '/cards/core-set/Core+Bystander.webp', kind: 'bystander', vp: 1 }

export const SCHEME_TWIST: CardData = { id: 'scheme-twist', name: 'Scheme Twist', img: '/cards/core-set/Core+Scheme+Twist.webp', kind: 'twist' }

export const BLACK_WIDOW_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-black-widow-dangerous-rescue',
      name: 'Dangerous Rescue',
      hero: 'Black Widow',      
      img: '/cards/core-set/BlackWidow_3Common.webp',
      team: ['avengers'],
      type: ['covert'],
      attack: 2,
      cost: 3,
      text: 'If a Covert card was played this turn: You may KO a card from your hand or discard pile. If you do, rescue a Bystander.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-black-widow-mission-accomplished',
      name: 'Mission Accomplished',
      hero: 'Black Widow',      
      img: '/cards/core-set/BlackWidow_2Common.webp',
      team: ['avengers'],
      type: ['tech'],
      cost: 2,
      text: 'Draw a card. If a Tech card was played this turn: Rescue a Bystander.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-black-widow-covert-operation',
      name: 'Covert Operation',
      hero: 'Black Widow',      
      img: '/cards/core-set/BlackWidow_4Uncommon.webp',
      team: ['avengers'],
      type: ['covert'],
      attack: 0,
      cost: 4,
      text: 'You get +1 Attack for each Bystander in your Victory Pile.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-black-widow-silent-sniper',
      name: 'Silent Sniper',
      hero: 'Black Widow',      
      img: '/cards/core-set/BlackWidow_1Rare.webp',
      team: ['avengers'],
      attack: 4,
      cost: 7,
      text: 'Defeat a Villain or Mastermind that has a Bystander.',
    },
    count: 1,
  },
]

export const SHIELD_OFFICER: CardData = {
  id: 'shield-officer',
  name: 'S.H.I.E.L.D. Officer',
  hero: 'Maria Hill',
  img: '/cards/core-set/Core+Officer.webp',
  team: ['S.H.I.E.L.D.'],
  cost: 3,
  recruit: 2,
}
