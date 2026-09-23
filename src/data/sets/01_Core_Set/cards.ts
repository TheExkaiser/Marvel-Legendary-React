import type { CardData, DeckEntry, MastermindData } from '../../../engine/types'

export const STARTING_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'shield-agent',
      name: 'S.H.I.E.L.D. Agent',
      hero: 'S.H.I.E.L.D. Agent',
      img: '/cards/core-set/shield-agent.webp',
      recruit: 1,
    },
    count: 8,
  },
  {
    card: {
      id: 'shield-trooper',
      name: 'S.H.I.E.L.D. Trooper',
      hero: 'S.H.I.E.L.D. Trooper',
      img: '/cards/core-set/shield-trooper.webp',
      attack: 1,
    },
    count: 4,
  },
]

// TESTOWE karty złoczyńców, do zastąpienia prawdziwymi
export const TEST_VILLAINS: DeckEntry[] = [
  { card: { id: 'test-v1', name: 'Złoczyńca 1', img: '/cards/core-set/test-v1.webp', strength: 1 }, count: 4 },
  { card: { id: 'test-v2', name: 'Złoczyńca 2', img: '/cards/core-set/test-v2.webp', strength: 2 }, count: 4 },
  { card: { id: 'test-v3', name: 'Złoczyńca 3', img: '/cards/core-set/test-v3.webp', strength: 3 }, count: 4 },
]

export const DRDOOM: MastermindData = {
  card: {
    id: 'mastermind-drdoom',
    name: 'Dr. Doom',
    img: '/cards/core-set/mastermind-drdoom.webp',
    strength: 9,
    vp: 5,
  },
  masterStrikeId: 'mastermind-drdoom-master-strike',
  tactics: [
    {
      id: 'drdoom-dark-technology',
      name: 'Dark Technology',
      img: '/cards/core-set/drdoom-dark-technology.webp',
      vp: 5,
      text: 'Fight: You may recruit a Tech or Ranged Hero from the HQ for free.',
    },
    {
      id: 'drdoom-monarchs-decree',
      name: "Monarch's Decree",
      img: '/cards/core-set/drdoom-monarchs-decree.webp',
      vp: 5,
      text: 'Fight: Choose one: each other player draws a card or each other player discards a card.',
    },
    {
      id: 'drdoom-secrets-of-time-travel',
      name: 'Secrets of Time Travel',
      img: '/cards/core-set/drdoom-secrets-of-time-travel.webp',
      vp: 5,
      text: 'Fight: Take another turn after this one.',
    },
    {
      id: 'drdoom-treasures-of-latveria',
      name: 'Treasures of Latveria',
      img: '/cards/core-set/drdoom-treasures-of-latveria.webp',
      vp: 5,
      text: 'Fight: When you draw a new hand of cards at the end of this turn, draw three extra cards.',
    },
  ],
}

export const SHIELD_OFFICER: CardData = {
  id: 'shield-officer',
  name: 'S.H.I.E.L.D. Officer',
  hero: 'Maria Hill',
  img: '/cards/core-set/shield-officer.webp',
  team: ['S.H.I.E.L.D.'],
  cost: 3,
  recruit: 2,
}

export const WOUND: CardData = {
  id: 'wound',
  name: 'Wound',
  img: '/cards/core-set/wound.webp',
  kind: 'wound',
}

export const BYSTANDER: CardData = {
  id: 'bystander',
  name: 'Bystander',
  img: '/cards/core-set/bystander.webp',
  kind: 'bystander',
  vp: 1,
}

export const SCHEME_TWIST: CardData = {
  id: 'scheme-twist',
  name: 'Scheme Twist',
  img: '/cards/core-set/scheme-twist.webp',
  kind: 'twist',
}

export const MASTER_STRIKE_CARD: CardData = {
  id: 'masterstrike',
  name: 'Master Strike',
  img: '/cards/core-set/masterstrike.webp',
  kind: 'masterstrike',
}

export const BLACK_WIDOW_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-black-widow-dangerous-rescue',
      name: 'Dangerous Rescue',
      hero: 'Black Widow',
      img: '/cards/core-set/hero-black-widow-dangerous-rescue.webp',
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
      img: '/cards/core-set/hero-black-widow-mission-accomplished.webp',
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
      img: '/cards/core-set/hero-black-widow-covert-operation.webp',
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
      img: '/cards/core-set/hero-black-widow-silent-sniper.webp',
      team: ['avengers'],
      attack: 4,
      cost: 7,
      text: 'Defeat a Villain or Mastermind that has a Bystander.',
    },
    count: 1,
  },
]

export const CAPTAIN_AMERICA_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-captain-america-avengers-assemble',
      name: 'Avengers Assemble!',
      hero: 'Captain America',
      img: '/cards/core-set/hero-captain-america-avengers-assemble.webp',
      team: ['avengers'],
      type: ['instinct'],
      recruit: 0,
      cost: 3,
      text: 'You get +1 Recruit for each color of Hero you have.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-captain-america-perfect-teamwork',
      name: 'Perfect Teamwork',
      hero: 'Captain America',
      img: '/cards/core-set/hero-captain-america-perfect-teamwork.webp',
      team: ['avengers'],
      type: ['strength'],
      attack: 0,
      cost: 4,
      text: 'You get +1 Attack for each color of Hero you have.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-captain-america-diving-block',
      name: 'Diving Block',
      hero: 'Captain America',
      img: '/cards/core-set/hero-captain-america-diving-block.webp',
      team: ['avengers'],
      type: ['tech'],
      attack: 4,
      cost: 6,
      text: 'If you would gain a Wound, you may reveal this card and draw a card instead.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-captain-america-day-unlike-any-other',
      name: 'A Day Unlike Any Other',
      hero: 'Captain America',
      img: '/cards/core-set/hero-captain-america-day-unlike-any-other.webp',
      team: ['avengers'],
      type: ['covert'],
      attack: 3,
      cost: 7,
      text: 'If an Avengers card was played this turn: You get +3 Attack for each other Avengers Hero you played this turn.',
    },
    count: 1,
  },
]

export const CYCLOPS_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-cyclops-determination',
      name: 'Determination',
      hero: 'Cyclops',
      img: '/cards/core-set/hero-cyclops-determination.webp',
      team: ['x-men'],
      type: ['strength'],
      recruit: 3,
      cost: 2,
      text: 'To play this card, you must discard a card from your hand.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-cyclops-optic-blast',
      name: 'Optic Blast',
      hero: 'Cyclops',
      img: '/cards/core-set/hero-cyclops-optic-blast.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 3,
      cost: 3,
      text: 'To play this card, you must discard a card from your hand.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-cyclops-unending-energy',
      name: 'Unending Energy',
      hero: 'Cyclops',
      img: '/cards/core-set/hero-cyclops-unending-energy.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 4,
      cost: 6,
      text: 'If a card effect makes you discard this card, you may return this card to your hand.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-cyclops-x-men-united',
      name: 'X-Men United',
      hero: 'Cyclops',
      img: '/cards/core-set/hero-cyclops-x-men-united.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 6,
      cost: 8,
      text: 'If an X-Men card was played this turn: You get +2 Attack for each other X-Men Hero you played this turn.',
    },
    count: 1,
  },
]

export const BROTHERHOOD_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'villain-blob',
      name: 'Blob',
      img: '/cards/core-set/villain-blob.webp',
      strength: 4,
      vp: 2,
      text: "You can't defeat Blob unless you have an X-Men Hero.",
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-juggernaut',
      name: 'Juggernaut',
      img: '/cards/core-set/villain-juggernaut.webp',
      strength: 6,
      vp: 4,
      text: 'Ambush: Each player KOs two Heroes from their discard pile. Escape: Each player KOs two Heroes from their hand.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-mystique',
      name: 'Mystique',
      img: '/cards/core-set/villain-mystique.webp',
      strength: 5,
      vp: 3,
      text: 'Escape: Mystique becomes a Scheme Twist that takes effect immediately.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-sabretooth',
      name: 'Sabretooth',
      img: '/cards/core-set/villain-sabretooth.webp',
      strength: 5,
      vp: 3,
      text: 'Fight: Each player reveals an X-Men Hero or gains a Wound. Escape: Same effect.',
    },
    count: 2,
  },
]