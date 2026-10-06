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
  masterStrikeText: 'Master Strike: Each player reveals a Tech Hero or puts 2 cards from their hand on top of their deck.',
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

// TODO: "Always Leads: Enemies of Asgard" — na razie tylko komentarz/placeholder.
// Docelowo ma być opcjonalne (np. pole w MastermindData albo w SetupChoices,
// wymuszające dobór konkretnej grupy złoczyńców przy tym mastermindzie).
export const LOKI: MastermindData = {
  card: {
    id: 'mastermind-loki',
    name: 'Loki',
    img: '/cards/core-set/mastermind-loki.webp',
    strength: 10,
    vp: 5,
  },
  masterStrikeId: 'mastermind-loki-master-strike',
  masterStrikeText: 'Master Strike: Each player reveals a Strength Hero or gains a Wound.',
  tactics: [
    {
      id: 'loki-cruel-ruler',
      name: 'Cruel Ruler',
      img: '/cards/core-set/loki-cruel-ruler.webp',
      vp: 5,
      text: 'Fight: Defeat a Villain in the City for free.',
    },
    {
      id: 'loki-maniacal-tyrant',
      name: 'Maniacal Tyrant',
      img: '/cards/core-set/loki-maniacal-tyrant.webp',
      vp: 5,
      text: 'Fight: KO up to four cards from your discard pile.',
    },
    {
      id: 'loki-vanishing-illusions',
      name: 'Vanishing Illusions',
      img: '/cards/core-set/loki-vanishing-illusions.webp',
      vp: 5,
      text: 'Fight: KO a Villain from your Victory Pile.',
    },
    {
      id: 'loki-whispers-and-lies',
      name: 'Whispers and Lies',
      img: '/cards/core-set/loki-whispers-and-lies.webp',
      vp: 5,
      text: 'Fight: KO two Bystanders from your Victory Pile.',
    },
  ],
}

// TODO: "Always Leads: Brotherhood" — na razie tylko komentarz/placeholder, jak przy Lokim.
export const MAGNETO: MastermindData = {
  card: {
    id: 'mastermind-magneto',
    name: 'Magneto',
    img: '/cards/core-set/mastermind-magneto.webp',
    strength: 8,
    vp: 5,
  },
  masterStrikeId: 'mastermind-magneto-master-strike',
  masterStrikeText: 'Master Strike: Each player reveals an X-Men Hero or discards down to four cards.',
  tactics: [
    {
      id: 'magneto-bitter-captor',
      name: 'Bitter Captor',
      img: '/cards/core-set/magneto-bitter-captor.webp',
      vp: 5,
      text: 'Fight: Recruit an X-Men Hero from the HQ for free.',
    },
    {
      id: 'magneto-crushing-shockwave',
      name: 'Crushing Shockwave',
      img: '/cards/core-set/magneto-crushing-shockwave.webp',
      vp: 5,
      text: 'Fight: Each other player reveals an X-Men Hero or gains two Wounds.',
    },
    {
      id: 'magneto-electromagnetic-bubble',
      name: 'Electromagnetic Bubble',
      img: '/cards/core-set/magneto-electromagnetic-bubble.webp',
      vp: 5,
      text: "Fight: Choose one of your X-Men Heroes. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as a seventh card.",
    },
    {
      id: 'magneto-xaviers-nemesis',
      name: "Xavier's Nemesis",
      img: '/cards/core-set/magneto-xaviers-nemesis.webp',
      vp: 5,
      text: 'Fight: For each of your X-Men Heroes, rescue a Bystander.',
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
      conditionIcons: ['covert'],
      conditionText: 'You may KO a card from your hand or discard pile. If you do, rescue a Bystander.',
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
      text: 'Draw a card.',
      conditionIcons: ['tech'],
      conditionText: 'Rescue a Bystander.',
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
      conditionIcons: ['avengers'],
      conditionText: 'You get +3 Attack for each other Avengers Hero you played this turn.',
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
      conditionIcons: ['x-men'],
      conditionText: 'You get +2 Attack for each other X-Men Hero you played this turn.',
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
      villainGroup: 'Brotherhood',
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
      villainGroup: 'Brotherhood',
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
      villainGroup: 'Brotherhood',
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
      villainGroup: 'Brotherhood',
      text: 'Fight: Each player reveals an X-Men Hero or gains a Wound. Escape: Same effect.',
    },
    count: 2,
  },
]

export const ENEMIES_OF_ASGARD_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'villain-destroyer',
      name: 'Destroyer',
      img: '/cards/core-set/villain-destroyer.webp',
      strength: 7,
      vp: 5,
      villainGroup: 'Enemies of Asgard',
      text: 'Fight: KO all your S.H.I.E.L.D. Heroes. Escape: Each player KOs two of their Heroes.',
    },
    count: 1,
  },
  {
    card: {
      id: 'villain-enchantress',
      name: 'Enchantress',
      img: '/cards/core-set/villain-enchantress.webp',
      strength: 6,
      vp: 4,
      villainGroup: 'Enemies of Asgard',
      text: 'Fight: Draw three cards.',
      flavor: 'Illusions fade in time. Time fades in mind. Minds fade in my illusion.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-frost-giant',
      name: 'Frost Giant',
      img: '/cards/core-set/villain-frost-giant.webp',
      strength: 4,
      vp: 2,
      villainGroup: 'Enemies of Asgard',
      text: 'Fight: Each player reveals a Ranged Hero or gains a Wound. Escape: Same effect.',
    },
    count: 3,
  },
  {
    card: {
      id: 'villain-ymir',
      name: 'Ymir, Frost Giant King',
      img: '/cards/core-set/villain-ymir.webp',
      strength: 6,
      vp: 4,
      villainGroup: 'Enemies of Asgard',
      text: 'Ambush: Each player reveals a Ranged Hero or gains a Wound. Fight: Choose a player. That player KOs any number of Wounds from their hand and discard pile.',
    },
    count: 2,
  },
]

export const HYDRA_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'villain-endless-armies-of-hydra',
      name: 'Endless Armies of HYDRA',
      img: '/cards/core-set/villain-endless-armies-of-hydra.webp',
      strength: 4,
      vp: 3,
      villainGroup: 'HYDRA',
      text: 'Fight: Play the top two cards of the Villain Deck.',
      flavor: 'Hail HYDRA! Immortal HYDRA! Cut off a limb, and two more shall take its place!',
    },
    count: 3,
  },
  {
    card: {
      id: 'villain-hydra-kidnappers',
      name: 'HYDRA Kidnappers',
      img: '/cards/core-set/villain-hydra-kidnappers.webp',
      strength: 3,
      vp: 1,
      villainGroup: 'HYDRA',
      text: 'Fight: You may gain a S.H.I.E.L.D. Officer.',
    },
    count: 3,
  },
  {
    card: {
      id: 'villain-supreme-hydra',
      name: 'Supreme HYDRA',
      img: '/cards/core-set/villain-supreme-hydra.webp',
      strength: 6,
      vp: 3,
      villainGroup: 'HYDRA',
      text: 'Supreme HYDRA is worth +3 VP for each other HYDRA Villain in your Victory Pile.',
    },
    count: 1,
  },
  {
    card: {
      id: 'villain-viper',
      name: 'Viper',
      img: '/cards/core-set/villain-viper.webp',
      strength: 5,
      vp: 3,
      villainGroup: 'HYDRA',
      text: 'Fight: Each player without another HYDRA Villain in their Victory Pile gains a Wound. Escape: Same effect.',
    },
    count: 1,
  },
]

export const MASTERS_OF_EVIL_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'villain-baron-zemo',
      name: 'Baron Zemo',
      img: '/cards/core-set/villain-baron-zemo.webp',
      strength: 6,
      vp: 4,
      villainGroup: 'Masters of Evil',
      text: 'Fight: For each of your Avengers Heroes, rescue a Bystander.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-melter',
      name: 'Melter',
      img: '/cards/core-set/villain-melter.webp',
      strength: 5,
      vp: 3,
      villainGroup: 'Masters of Evil',
      text: 'Fight: Each player reveals the top card of their deck. For each card, you choose to KO it or put it back.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-ultron',
      name: 'Ultron',
      img: '/cards/core-set/villain-ultron.webp',
      strength: 6,
      vp: 2,
      villainGroup: 'Masters of Evil',
      text: 'Ultron is worth +1 VP for each Tech Hero you have among all your cards at the end of the game. Escape: Each player reveals a Tech Hero or gains a Wound.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-whirlwind',
      name: 'Whirlwind',
      img: '/cards/core-set/villain-whirlwind.webp',
      strength: 4,
      vp: 2,
      villainGroup: 'Masters of Evil',
      text: 'Fight: If you fight Whirlwind on the Rooftops or Bridge, KO two of your Heroes.',
    },
    count: 2,
  },
]

export const RADIATION_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'villain-abomination',
      name: 'Abomination',
      img: '/cards/core-set/villain-abomination.webp',
      strength: 5,
      vp: 3,
      villainGroup: 'Radiation',
      text: 'Fight: If you fight Abomination on the Streets or Bridge, rescue three Bystanders.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-the-leader',
      name: 'The Leader',
      img: '/cards/core-set/villain-the-leader.webp',
      strength: 4,
      vp: 2,
      villainGroup: 'Radiation',
      text: 'Ambush: Play the top card of the Villain Deck.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-maestro',
      name: 'Maestro',
      img: '/cards/core-set/villain-maestro.webp',
      strength: 6,
      vp: 4,
      villainGroup: 'Radiation',
      text: 'Fight: For each of your Strength Heroes, KO one of your Heroes.',
      flavor:
        'Traveling from the future, Maestro is an alternate-reality Hulk that has absorbed 100 years of radiation on a nuclear wasteland Earth.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-zzzax',
      name: 'Zzzax',
      img: '/cards/core-set/villain-zzzax.webp',
      strength: 5,
      vp: 3,
      villainGroup: 'Radiation',
      text: 'Fight: Each player reveals a Strength Hero or gains a Wound. Escape: Same effect.',
    },
    count: 2,
  },
]

export const SKRULLS_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'villain-paibok',
      name: 'Paibok the Power Skrull',
      img: '/cards/core-set/villain-paibok.webp',
      strength: 8,
      vp: 3,
      villainGroup: 'Skrulls',
      text: 'Fight: Choose a Hero in the HQ. Gain that Hero.',
    },
    count: 1,
  },
  {
    card: {
      id: 'villain-skrull-queen-veranke',
      name: 'Skrull Queen Veranke',
      img: '/cards/core-set/villain-skrull-queen-veranke.webp',
      vp: 4,
      villainGroup: 'Skrulls',
      text: "Ambush: Put the highest-cost Hero from the HQ under this Villain. This Villain's Attack is equal to that Hero's Cost. Fight: Gain that Hero.",
    },
    count: 1,
  },
  {
    card: {
      id: 'villain-skrull-shapeshifters',
      name: 'Skrull Shapeshifters',
      img: '/cards/core-set/villain-skrull-shapeshifters.webp',
      vp: 2,
      villainGroup: 'Skrulls',
      text: "Ambush: Put the rightmost Hero from the HQ under this Villain. This Villain's Attack is equal to that Hero's Cost. Fight: Gain that Hero.",
    },
    count: 3,
  },
  {
    card: {
      id: 'villain-super-skrull',
      name: 'Super-Skrull',
      img: '/cards/core-set/villain-super-skrull.webp',
      strength: 4,
      vp: 2,
      villainGroup: 'Skrulls',
      text: 'Fight: Each player KOs one of their Heroes.',
    },
    count: 3,
  },
]

export const SPIDER_FOES_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'villain-doctor-octopus',
      name: 'Doctor Octopus',
      img: '/cards/core-set/villain-doctor-octopus.webp',
      strength: 4,
      vp: 2,
      villainGroup: 'Spider-Foes',
      text: 'Fight: When you draw a new hand of cards at the end of this turn, draw eight cards instead of six.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-green-goblin',
      name: 'Green Goblin',
      img: '/cards/core-set/villain-green-goblin.webp',
      strength: 6,
      vp: 4,
      villainGroup: 'Spider-Foes',
      text: 'Ambush: Green Goblin captures a Bystander.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-the-lizard',
      name: 'The Lizard',
      img: '/cards/core-set/villain-the-lizard.webp',
      strength: 3,
      vp: 2,
      villainGroup: 'Spider-Foes',
      text: 'Fight: If you fight the Lizard in the Sewers, each other player gains a Wound.',
    },
    count: 2,
  },
  {
    card: {
      id: 'villain-venom',
      name: 'Venom',
      img: '/cards/core-set/villain-venom.webp',
      strength: 5,
      vp: 3,
      villainGroup: 'Spider-Foes',
      text: "You can't defeat Venom unless you have a Hero. Escape: Each player gains a Wound.",
    },
    count: 2,
  },
]

export const DOOMBOT_LEGION_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'henchmen-doombot-legion',
      name: 'Doombot Legion',
      img: '/cards/core-set/henchmen-doombot-legion.webp',
      strength: 3,
      vp: 1,
      henchman: true,
      text: 'Fight: Look at the top two cards of your deck. KO one of them and put the other back.',
    },
    count: 10,
  },
]

export const HAND_NINJAS_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'henchmen-hand-ninjas',
      name: 'Hand Ninjas',
      img: '/cards/core-set/henchmen-hand-ninjas.webp',
      strength: 3,
      vp: 1,
      henchman: true,
      text: 'Fight: You get +1 Recruit.',
    },
    count: 10,
  },
]

export const SAVAGE_LAND_MUTATES_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'henchmen-savage-land-mutates',
      name: 'Savage Land Mutates',
      img: '/cards/core-set/henchmen-savage-land-mutates.webp',
      strength: 3,
      vp: 1,
      henchman: true,
      text: 'Fight: When you draw a new hand of cards at the end of this turn, draw an extra card.',
    },
    count: 10,
  },
]

export const SENTINEL_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'henchmen-sentinel',
      name: 'Sentinel',
      img: '/cards/core-set/henchmen-sentinel.webp',
      strength: 3,
      vp: 1,
      henchman: true,
      text: 'Fight: KO one of your Heroes.',
    },
    count: 10,
  },
]

export const DEADPOOL_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-deadpool-here-hold-this-for-a-second',
      name: 'Here, Hold This for a Second',
      hero: 'Deadpool',
      img: '/cards/core-set/hero-deadpool-here-hold-this-for-a-second.webp',
      type: ['tech'],
      recruit: 2,
      cost: 3,
      text: 'A Villain of your choice captures a Bystander.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-deadpool-oddball',
      name: 'Oddball',
      hero: 'Deadpool',
      img: '/cards/core-set/hero-deadpool-oddball.webp',
      type: ['covert'],
      attack: 2,
      cost: 5,
      text: 'You get +1 Attack for each other Hero with an odd-numbered Cost you played this turn.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-deadpool-hey-can-i-get-a-do-over',
      name: 'Hey, Can I Get a Do-Over?',
      hero: 'Deadpool',
      img: '/cards/core-set/hero-deadpool-hey-can-i-get-a-do-over.webp',
      type: ['instinct'],
      attack: 2,
      cost: 3,
      text: 'If this is the first Hero you played this turn, you may discard the rest of your hand and draw four cards.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-deadpool-random-acts-of-unkindness',
      name: 'Random Acts of Unkindness',
      hero: 'Deadpool',
      img: '/cards/core-set/hero-deadpool-random-acts-of-unkindness.webp',
      type: ['instinct'],
      attack: 6,
      cost: 7,
      text: 'You may gain a Wound to your hand. Then draw a card.',
    },
    count: 1,
  },
]

export const EMMA_FROST_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-emma-frost-mental-discipline',
      name: 'Mental Discipline',
      hero: 'Emma Frost',
      img: '/cards/core-set/hero-emma-frost-mental-discipline.webp',
      team: ['x-men'],
      type: ['ranged'],
      recruit: 1,
      cost: 3,
      text: 'Draw a card.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-emma-frost-shadowed-thoughts',
      name: 'Shadowed Thoughts',
      hero: 'Emma Frost',
      img: '/cards/core-set/hero-emma-frost-shadowed-thoughts.webp',
      team: ['x-men'],
      type: ['covert'],
      attack: 2,
      cost: 4,
      conditionIcons: ['covert'],
      conditionText: 'You may play the top card of the Villain Deck. If you do, you get +2 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-emma-frost-psychic-link',
      name: 'Psychic Link',
      hero: 'Emma Frost',
      img: '/cards/core-set/hero-emma-frost-psychic-link.webp',
      team: ['x-men'],
      type: ['instinct'],
      attack: 3,
      cost: 5,
      text: 'You may reveal another X-Men Hero. If you do, draw a card.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-emma-frost-diamond-form',
      name: 'Diamond Form',
      hero: 'Emma Frost',
      img: '/cards/core-set/hero-emma-frost-diamond-form.webp',
      team: ['x-men'],
      type: ['strength'],
      recruit: 0,
      attack: 5,
      cost: 7,
      text: 'Whenever you defeat a Villain or Mastermind this turn, you get +3 Recruit.',
    },
    count: 1,
  },
]

export const GAMBIT_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-gambit-card-shark',
      name: 'Card Shark',
      hero: 'Gambit',
      img: '/cards/core-set/hero-gambit-card-shark.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 2,
      cost: 4,
      text: "Reveal the top card of your deck. If it's an X-Men Hero, draw it.",
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-gambit-stack-the-deck',
      name: 'Stack the Deck',
      hero: 'Gambit',
      img: '/cards/core-set/hero-gambit-stack-the-deck.webp',
      team: ['x-men'],
      type: ['covert'],
      cost: 2,
      text: 'Draw two cards. Then put a card from your hand on top of your deck.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-gambit-hypnotic-charm',
      name: 'Hypnotic Charm',
      hero: 'Gambit',
      img: '/cards/core-set/hero-gambit-hypnotic-charm.webp',
      team: ['x-men'],
      type: ['instinct'],
      recruit: 2,
      cost: 3,
      text: 'Reveal the top card of your deck. Discard it or put it back.',
      conditionIcons: ['instinct'],
      conditionText: "Do the same thing to each other player's deck.",
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-gambit-high-stakes-jackpot',
      name: 'High Stakes Jackpot',
      hero: 'Gambit',
      img: '/cards/core-set/hero-gambit-high-stakes-jackpot.webp',
      team: ['x-men'],
      type: ['instinct'],
      attack: 4,
      cost: 7,
      text: "Reveal the top card of your deck. You get +Attack equal to that card's cost.",
    },
    count: 1,
  },
]

export const HAWKEYE_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-hawkeye-quick-draw',
      name: 'Quick Draw',
      hero: 'Hawkeye',
      img: '/cards/core-set/hero-hawkeye-quick-draw.webp',
      team: ['avengers'],
      type: ['instinct'],
      attack: 1,
      cost: 3,
      text: 'Draw a card.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-hawkeye-team-player',
      name: 'Team Player',
      hero: 'Hawkeye',
      img: '/cards/core-set/hero-hawkeye-team-player.webp',
      team: ['avengers'],
      type: ['tech'],
      attack: 2,
      cost: 4,
      conditionIcons: ['avengers'],
      conditionText: 'You get +1 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-hawkeye-covering-fire',
      name: 'Covering Fire',
      hero: 'Hawkeye',
      img: '/cards/core-set/hero-hawkeye-covering-fire.webp',
      team: ['avengers'],
      type: ['tech'],
      attack: 3,
      cost: 5,
      conditionIcons: ['tech'],
      conditionText: 'Choose one: each other player draws a card or each other player discards a card.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-hawkeye-impossible-trick-shot',
      name: 'Impossible Trick Shot',
      hero: 'Hawkeye',
      img: '/cards/core-set/hero-hawkeye-impossible-trick-shot.webp',
      team: ['avengers'],
      type: ['tech'],
      attack: 5,
      cost: 7,
      text: 'Whenever you defeat a Villain or Mastermind this turn, rescue three Bystanders.',
    },
    count: 1,
  },
]

export const HULK_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-hulk-growing-anger',
      name: 'Growing Anger',
      hero: 'Hulk',
      img: '/cards/core-set/hero-hulk-growing-anger.webp',
      team: ['avengers'],
      type: ['strength'],
      attack: 2,
      cost: 3,
      conditionIcons: ['strength'],
      conditionText: 'You get +1 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-hulk-unstoppable-hulk',
      name: 'Unstoppable Hulk',
      hero: 'Hulk',
      img: '/cards/core-set/hero-hulk-unstoppable-hulk.webp',
      team: ['avengers'],
      type: ['instinct'],
      attack: 2,
      cost: 4,
      text: 'You may KO a Wound from your hand or discard pile. If you do, you get +2 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-hulk-crazed-rampage',
      name: 'Crazed Rampage',
      hero: 'Hulk',
      img: '/cards/core-set/hero-hulk-crazed-rampage.webp',
      team: ['avengers'],
      type: ['strength'],
      attack: 4,
      cost: 5,
      text: 'You gain a Wound.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-hulk-hulk-smash',
      name: 'Hulk Smash!',
      hero: 'Hulk',
      img: '/cards/core-set/hero-hulk-hulk-smash.webp',
      team: ['avengers'],
      type: ['strength'],
      attack: 5,
      cost: 8,
      conditionIcons: ['strength'],
      conditionText: 'You get +5 Attack.',
    },
    count: 1,
  },
]

export const IRON_MAN_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-iron-man-endless-invention',
      name: 'Endless Invention',
      hero: 'Iron Man',
      img: '/cards/core-set/hero-iron-man-endless-invention.webp',
      team: ['avengers'],
      type: ['tech'],
      cost: 3,
      text: 'Draw a card.',
      conditionIcons: ['tech'],
      conditionText: 'Draw another card.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-iron-man-repulsor-rays',
      name: 'Repulsor Rays',
      hero: 'Iron Man',
      img: '/cards/core-set/hero-iron-man-repulsor-rays.webp',
      team: ['avengers'],
      type: ['ranged'],
      attack: 2,
      cost: 3,
      conditionIcons: ['ranged'],
      conditionText: 'You get +1 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-iron-man-arc-reactor',
      name: 'Arc Reactor',
      hero: 'Iron Man',
      img: '/cards/core-set/hero-iron-man-arc-reactor.webp',
      team: ['avengers'],
      type: ['tech'],
      attack: 3,
      cost: 5,
      conditionIcons: ['tech'],
      conditionText: 'You get +1 Attack for each other Hero you played this turn.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-iron-man-quantum-breakthrough',
      name: 'Quantum Breakthrough',
      hero: 'Iron Man',
      img: '/cards/core-set/hero-iron-man-quantum-breakthrough.webp',
      team: ['avengers'],
      type: ['tech'],
      cost: 7,
      text: 'Draw two cards.',
      conditionIcons: ['tech'],
      conditionText: 'Draw two more cards.',
    },
    count: 1,
  },
]

export const NICK_FURY_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-nick-fury-battlefield-promotion',
      name: 'Battlefield Promotion',
      hero: 'Nick Fury',
      img: '/cards/core-set/hero-nick-fury-battlefield-promotion.webp',
      team: ['S.H.I.E.L.D.'],
      type: ['covert'],
      cost: 4,
      text: 'You may KO a S.H.I.E.L.D. Hero from your hand or discard pile. If you do, you may gain a S.H.I.E.L.D. Officer to your hand.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-nick-fury-high-tech-weaponry',
      name: 'High-Tech Weaponry',
      hero: 'Nick Fury',
      img: '/cards/core-set/hero-nick-fury-high-tech-weaponry.webp',
      team: ['S.H.I.E.L.D.'],
      type: ['tech'],
      attack: 2,
      cost: 3,
      conditionIcons: ['tech'],
      conditionText: 'You get +1 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-nick-fury-legendary-commander',
      name: 'Legendary Commander',
      hero: 'Nick Fury',
      img: '/cards/core-set/hero-nick-fury-legendary-commander.webp',
      team: ['S.H.I.E.L.D.'],
      type: ['strength'],
      attack: 1,
      cost: 6,
      text: 'You get +1 Attack for each other S.H.I.E.L.D. Hero you played this turn.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-nick-fury-pure-fury',
      name: 'Pure Fury',
      hero: 'Nick Fury',
      img: '/cards/core-set/hero-nick-fury-pure-fury.webp',
      team: ['S.H.I.E.L.D.'],
      type: ['tech'],
      cost: 8,
      text: 'Defeat any Villain or Mastermind whose Attack is less than the number of S.H.I.E.L.D. Heroes in the KO pile.',
    },
    count: 1,
  },
]

export const ROGUE_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-rogue-borrowed-brawn',
      name: 'Borrowed Brawn',
      hero: 'Rogue',
      img: '/cards/core-set/hero-rogue-borrowed-brawn.webp',
      team: ['x-men'],
      type: ['strength'],
      attack: 1,
      cost: 4,
      conditionIcons: ['strength'],
      conditionText: 'You get +3 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-rogue-energy-drain',
      name: 'Energy Drain',
      hero: 'Rogue',
      img: '/cards/core-set/hero-rogue-energy-drain.webp',
      team: ['x-men'],
      type: ['covert'],
      recruit: 2,
      cost: 3,
      conditionIcons: ['covert'],
      conditionText: 'You may KO a card from your hand or discard pile. If you do, you get +1 Recruit.',
    },
    count: 5,
  },
   {
    card: {
      id: 'hero-rogue-copy-powers',
      name: 'Copy Powers',
      hero: 'Rogue',
      img: '/cards/core-set/hero-rogue-copy-powers.webp',
      team: ['x-men'],
      type: ['covert'],
      cost: 5,
      text: 'Play this card as a copy of another Hero you played this turn. This card is both types/teams for the rest of the turn.',
    },
    count: 3,
  },

  {
    card: {
      id: 'hero-rogue-steal-abilities',
      name: 'Steal Abilities',
      hero: 'Rogue',
      img: '/cards/core-set/hero-rogue-steal-abilities.webp',
      team: ['x-men'],
      type: ['strength'],
      attack: 4,
      cost: 8,
      text: 'Discard the top card of your deck. Play a copy of that card (its effects only, without playing the card itself).',
    },
    count: 1,
  },
]

export const SPIDER_MAN_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-spider-man-astonishing-strength',
      name: 'Astonishing Strength',
      hero: 'Spider-Man',
      img: '/cards/core-set/hero-spider-man-astonishing-strength.webp',
      team: ['spider-friends'],
      type: ['strength'],
      recruit: 1,
      cost: 2,
      text: 'Reveal the top card of your deck. If that card costs 2 or less, draw it.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-spider-man-great-responsibility',
      name: 'Great Responsibility',
      hero: 'Spider-Man',
      img: '/cards/core-set/hero-spider-man-great-responsibility.webp',
      team: ['spider-friends'],
      type: ['instinct'],
      attack: 1,
      cost: 2,
      text: 'Reveal the top card of your deck. If that card costs 2 or less, draw it.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-spider-man-web-shooters',
      name: 'Web-Shooters',
      hero: 'Spider-Man',
      img: '/cards/core-set/hero-spider-man-web-shooters.webp',
      team: ['spider-friends'],
      type: ['tech'],
      cost: 2,
      text: 'Rescue a Bystander. Reveal the top card of your deck. If that card costs 2 or less, draw it.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-spider-man-the-amazing-spider-man',
      name: 'The Amazing Spider-Man',
      hero: 'Spider-Man',
      img: '/cards/core-set/hero-spider-man-the-amazing-spider-man.webp',
      team: ['spider-friends'],
      type: ['covert'],
      cost: 2,
      text: 'Reveal the top three cards of your deck. Put any that cost 2 or less into your hand. Put the rest back in any order.',
    },
    count: 1,
  },
]

// TODO: "Always Leads: HYDRA" — na razie tylko komentarz/placeholder, jak przy Lokim i Magneto.
export const RED_SKULL: MastermindData = {
  card: {
    id: 'mastermind-redskull',
    name: 'Red Skull',
    img: '/cards/core-set/mastermind-redskull.webp',
    strength: 7,
    vp: 5,
  },
  masterStrikeId: 'mastermind-redskull-master-strike',
  masterStrikeText: 'Master Strike: Each player KOs a Hero from their hand.',
  tactics: [
    {
      id: 'redskull-endless-resources',
      name: 'Endless Resources',
      img: '/cards/core-set/redskull-endless-resources.webp',
      vp: 5,
      text: 'Fight: You get +4 Recruit.',
      flavor: "You'd be surprised how many people are willing to donate to a madman with no skin.",
    },
    {
      id: 'redskull-hydra-conspiracy',
      name: 'HYDRA Conspiracy',
      img: '/cards/core-set/redskull-hydra-conspiracy.webp',
      vp: 5,
      text: 'Fight: Draw two cards. Then draw another card for each HYDRA Villain in your Victory Pile.',
    },
    {
      id: 'redskull-negablast-grenades',
      name: 'Negablast Grenades',
      img: '/cards/core-set/redskull-negablast-grenades.webp',
      vp: 5,
      text: 'Fight: You get +3 Attack.',
      flavor: 'The only pure act of creation is destruction.',
    },
    {
      id: 'redskull-ruthless-dictator',
      name: 'Ruthless Dictator',
      img: '/cards/core-set/redskull-ruthless-dictator.webp',
      vp: 5,
      text: 'Fight: Look at the top three cards of your deck. KO one, discard one and put one back on top of your deck.',
    },
  ],
}

export const STORM_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-storm-gathering-stormclouds',
      name: 'Gathering Stormclouds',
      img: '/cards/core-set/hero-storm-gathering-stormclouds.webp',
      hero: 'Storm',
      team: ['x-men'],
      type: ['ranged'],
      recruit: 2,
      cost: 3,
      conditionIcons: ['ranged'],
      conditionText: 'Draw a card.',
      flavor: 'Two little raindrops. Then two billion.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-storm-lightning-bolt',
      name: 'Lightning Bolt',
      img: '/cards/core-set/hero-storm-lightning-bolt.webp',
      hero: 'Storm',
      team: ['x-men'],
      type: ['ranged'],
      attack: 2,
      cost: 4,
      text: 'Any Villain you fight on the Rooftops this turn gets -2 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-storm-spinning-cyclone',
      name: 'Spinning Cyclone',
      img: '/cards/core-set/hero-storm-spinning-cyclone.webp',
      hero: 'Storm',
      team: ['x-men'],
      type: ['covert'],
      attack: 4,
      cost: 6,
      text: 'You may move a Villain to a new city space. Rescue any Bystanders captured by that Villain. (If you move a Villain to a city space that already has a Villain, swap them.)',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-storm-tidal-wave',
      name: 'Tidal Wave',
      img: '/cards/core-set/hero-storm-tidal-wave.webp',
      hero: 'Storm',
      team: ['x-men'],
      type: ['ranged'],
      attack: 5,
      cost: 7,
      text: 'Any Villain you fight on the Bridge this turn gets -2 Attack.',
      conditionIcons: ['ranged'],
      conditionText: 'The Mastermind gets -2 Attack this turn.',
    },
    count: 1,
  },
]

export const THOR_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-thor-odinson',
      name: 'Odinson',
      img: '/cards/core-set/hero-thor-odinson.webp',
      hero: 'Thor',
      team: ['avengers'],
      type: ['strength'],
      recruit: 2,
      cost: 3,
      conditionIcons: ['strength'],
      conditionText: 'You get +2 Recruit.',
      flavor: 'Whosoever holds the hammer, if he be worthy, shall possess the power of Thor.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-thor-surge-of-power',
      name: 'Surge of Power',
      img: '/cards/core-set/hero-thor-surge-of-power.webp',
      hero: 'Thor',
      team: ['avengers'],
      type: ['ranged'],
      recruit: 2,
      attack: 0,
      cost: 4,
      text: 'If you made 8 or more Recruit this turn, you get +3 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-thor-call-lightning',
      name: 'Call Lightning',
      img: '/cards/core-set/hero-thor-call-lightning.webp',
      hero: 'Thor',
      team: ['avengers'],
      type: ['ranged'],
      attack: 3,
      cost: 6,
      conditionIcons: ['ranged'],
      conditionText: 'You get +3 Attack.',
      flavor: 'Lightning never strikes twice. Thor never needs to.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-thor-god-of-thunder',
      name: 'God of Thunder',
      img: '/cards/core-set/hero-thor-god-of-thunder.webp',
      hero: 'Thor',
      team: ['avengers'],
      type: ['ranged'],
      recruit: 5,
      attack: 0,
      cost: 8,
      text: 'You can use Recruit as Attack this turn.',
      flavor: 'They call him the God of Thunder. His enemies better start praying.',
    },
    count: 1,
  },
]

export const WOLVERINE_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-wolverine-healing-factor',
      name: 'Healing Factor',
      img: '/cards/core-set/hero-wolverine-healing-factor.webp',
      hero: 'Wolverine',
      team: ['x-men'],
      type: ['instinct'],
      attack: 2,
      cost: 3,
      text: 'You may KO a Wound from your hand or discard pile. If you do, draw a card.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-wolverine-keen-senses',
      name: 'Keen Senses',
      img: '/cards/core-set/hero-wolverine-keen-senses.webp',
      hero: 'Wolverine',
      team: ['x-men'],
      type: ['instinct'],
      attack: 1,
      cost: 2,
      conditionIcons: ['instinct'],
      conditionText: 'Draw a card.',
      flavor: 'The only thing scarier than Wolverine tracking you is Wolverine finding you.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-wolverine-frenzied-slashing',
      name: 'Frenzied Slashing',
      img: '/cards/core-set/hero-wolverine-frenzied-slashing.webp',
      hero: 'Wolverine',
      team: ['x-men'],
      type: ['instinct'],
      attack: 2,
      cost: 5,
      conditionIcons: ['instinct'],
      conditionText: 'Draw two cards.',
      flavor: 'Some villains get torn apart by guilt. Others get torn apart by Wolverine.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-wolverine-berserker-rage',
      name: 'Berserker Rage',
      img: '/cards/core-set/hero-wolverine-berserker-rage.webp',
      hero: 'Wolverine',
      team: ['x-men'],
      type: ['instinct'],
      attack: 0,
      cost: 8,
      text: 'Draw three cards.',
      conditionIcons: ['instinct'],
      conditionText: "You get +1 Attack for each extra card you've drawn this turn.",
    },
    count: 1,
  },
]