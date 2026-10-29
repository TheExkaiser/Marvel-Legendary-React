import type { CardGroup, DeckEntry, MastermindData } from '../../../engine/types'
import {
  APOCALYPTIC_KITTY_PRYDE_CARDS,
  BLACK_BOLT_CARDS,
  BLACK_PANTHER_CARDS,
  CAPTAIN_MARVEL_CARDS,
  DR_STRANGE_CARDS,
  LADY_THOR_CARDS,
  MAGIK_CARDS,
} from './heroes'

export const SECRET_WARS_VOL_1_HEROES: CardGroup[] = [
  { id: 'secret-wars-apocalyptic-kitty-pryde', name: 'Apocalyptic Kitty Pryde', realName: 'Kitty Pryde', cards: APOCALYPTIC_KITTY_PRYDE_CARDS },
  { id: 'secret-wars-black-bolt', name: 'Black Bolt', realName: 'Black Bolt', cards: BLACK_BOLT_CARDS },
  { id: 'secret-wars-black-panther', name: 'Black Panther', realName: "T'Challa", cards: BLACK_PANTHER_CARDS },
  { id: 'secret-wars-captain-marvel', name: 'Captain Marvel', realName: 'Carol Danvers', cards: CAPTAIN_MARVEL_CARDS },
  { id: 'secret-wars-dr-strange', name: 'Dr. Strange', realName: 'Stephen Strange', cards: DR_STRANGE_CARDS },
  { id: 'secret-wars-lady-thor', name: 'Lady Thor', realName: 'Jane Foster', cards: LADY_THOR_CARDS },
  { id: 'secret-wars-magik', name: 'Magik', realName: 'Illyana Rasputin', cards: MAGIK_CARDS },
]

export const SIDEKICK_CARD: DeckEntry = {
  count: 15,
  card: {
    id: 'secret-wars-sidekick',
    name: 'Sidekick',
    img: '/cards/secret-wars-vol-1/secret-wars-sidekick.webp',
    cost: 2,
    kind: 'token',
    text: 'You may return this card to the Sidekick Stack. If you do, draw two cards. (You can only recruit up to one Sidekick each turn, using Recruit.)',
  },
}

export const SECRET_WARS_VOL_1_VILLAIN_GROUPS: CardGroup[] = []
export const SECRET_WARS_VOL_1_HENCHMEN_GROUPS: CardGroup[] = []
export const SECRET_WARS_VOL_1_BYSTANDER_GROUPS: CardGroup[] = []
export const SECRET_WARS_VOL_1_MASTERMINDS: MastermindData[] = []
