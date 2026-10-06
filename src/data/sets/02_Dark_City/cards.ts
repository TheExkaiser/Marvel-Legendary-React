import type { DeckEntry } from '../../../engine/types'

export const ANGEL_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-angel-diving-catch',
      name: 'Diving Catch',
      hero: 'Angel',
      img: '/cards/dark-city/hero-angel-diving-catch.webp',
      team: ['x-men'],
      type: ['strength'],
      recruit: 2,
      cost: 4,
      text: 'When a card effect causes you to discard this card, rescue a Bystander and draw two cards.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-angel-high-speed-chase',
      name: 'High-Speed Chase',
      hero: 'Angel',
      img: '/cards/dark-city/hero-angel-high-speed-chase.webp',
      team: ['x-men'],
      type: ['covert'],
      cost: 3,
      text: 'Draw two cards, then discard a card.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-angel-drop-off-a-friend',
      name: 'Drop off a Friend',
      hero: 'Angel',
      img: '/cards/dark-city/hero-angel-drop-off-a-friend.webp',
      team: ['x-men'],
      type: ['instinct'],
      attack: 2,
      cost: 5,
      text: "You may discard a card. You get +Attack equal to that card's Cost.",
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-angel-strength-of-spirit',
      name: 'Strength of Spirit',
      hero: 'Angel',
      img: '/cards/dark-city/hero-angel-strength-of-spirit.webp',
      team: ['x-men'],
      type: ['strength'],
      attack: 4,
      cost: 7,
      text: 'Discard any number of cards. Draw that many cards.',
    },
    count: 1,
  },
]