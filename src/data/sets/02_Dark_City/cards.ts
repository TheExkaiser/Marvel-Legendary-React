import type { CardData, DeckEntry, MastermindData } from '../../../engine/types'



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

export const BISHOP_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-bishop-absorb-energies',
      name: 'Absorb Energies',
      hero: 'Bishop',
      img: '/cards/dark-city/hero-bishop-absorb-energies.webp',
      team: ['x-men'],
      type: ['covert'],
      attack: 2,
      recruit: 0,
      cost: 3,
      text: "Whenever a card you own is KO'd this turn, you get +2 Recruit.",
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-bishop-whatever-the-cost',
      name: 'Whatever the Cost',
      hero: 'Bishop',
      img: '/cards/dark-city/hero-bishop-whatever-the-cost.webp',
      team: ['x-men'],
      type: ['ranged'],
      cost: 2,
      text: 'Draw a card.',
      conditionIcons: ['covert'],
      conditionText: 'You may KO a card from your hand or discard pile.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-bishop-concussive-blast',
      name: 'Concussive Blast',
      hero: 'Bishop',
      img: '/cards/dark-city/hero-bishop-concussive-blast.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 3,
      cost: 5,
      conditionIcons: ['ranged', 'ranged'],
      conditionText: 'You get +3 Attack.',
      flavor: 'Bishop absorbs energy, channeling it back into devastating blasts.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-bishop-firepower-from-the-future',
      name: 'Firepower from the Future',
      hero: 'Bishop',
      img: '/cards/dark-city/hero-bishop-firepower-from-the-future.webp',
      team: ['x-men'],
      type: ['tech'],
      attack: 4,
      cost: 7,
      text: "Discard the top four cards of your deck. You get +Attack equal to those cards' printed Attack.",
      conditionIcons: ['x-men'],
      conditionText: 'KO any number of those cards.',
    },
    count: 1,
  },
]

export const BLADE_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-blade-night-hunter',
      name: 'Night Hunter',
      hero: 'Blade',
      img: '/cards/dark-city/hero-blade-night-hunter.webp',
      team: ['marvel-knights'],
      type: ['strength'],
      attack: 2,
      recruit: 0,
      cost: 4,
      text: 'Whenever you defeat a Villain in the Sewers or Rooftops this turn, you get +2 Recruit.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-blade-stalk-the-prey',
      name: 'Stalk the Prey',
      hero: 'Blade',
      img: '/cards/dark-city/hero-blade-stalk-the-prey.webp',
      team: ['marvel-knights'],
      type: ['covert'],
      attack: 2,
      cost: 3,
      text: 'You may move a Villain to an adjacent city space. If another Villain is already there, swap them.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-blade-nowhere-to-hide',
      name: 'Nowhere to Hide',
      hero: 'Blade',
      img: '/cards/dark-city/hero-blade-nowhere-to-hide.webp',
      team: ['marvel-knights'],
      type: ['tech'],
      attack: 3,
      cost: 6,
      text: 'Whenever you defeat a Villain in the Sewers or Rooftops this turn, draw two cards.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-blade-vampiric-surge',
      name: 'Vampiric Surge',
      hero: 'Blade',
      img: '/cards/dark-city/hero-blade-vampiric-surge.webp',
      team: ['marvel-knights'],
      type: ['instinct'],
      attack:0,
      cost: 7,
      text: 'You get +1 Attack for each Villain in your Victory Pile.',
    },
    count: 1,
  },
]

export const CABLE_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-cable-disaster-survivalist',
      name: 'Disaster Survivalist',
      hero: 'Cable',
      img: '/cards/dark-city/hero-cable-disaster-survivalist.webp',
      team: ['x-force'],
      type: ['tech'],
      recruit: 2,
      cost: 3,
      text: 'When a Master Strike is played, before it takes effect, you may discard this card. If you do, draw three extra cards at the end of this turn.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-cable-strike-at-the-heart-of-evil',
      name: 'Strike at the Heart of Evil',
      hero: 'Cable',
      img: '/cards/dark-city/hero-cable-strike-at-the-heart-of-evil.webp',
      team: ['x-force'],
      type: ['ranged'],
      attack: 2,
      cost: 4,
      text: 'You get +2 Attack only when fighting Masterminds.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-cable-rapid-response-force',
      name: 'Rapid Response Force',
      hero: 'Cable',
      img: '/cards/dark-city/hero-cable-rapid-response-force.webp',
      team: ['x-force'],
      type: ['covert'],
      attack: 3,
      cost: 6,
      text: 'Teleport',
      keywords: ['teleport'],
      conditionIcons: ['x-force'],
      conditionText: 'You get +1 Attack for each other X-Force Hero you played this turn.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-cable-army-of-one',
      name: 'Army of One',
      hero: 'Cable',
      img: '/cards/dark-city/hero-cable-army-of-one.webp',
      team: ['x-force'],
      type: ['tech'],
      attack: 5,
      cost: 8,
      text: "KO any number of cards from your hand. You get +1 Attack for each card KO'd this way.",
    },
    count: 1,
  },
]

export const COLOSSUS_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-colossus-draw-their-fire',
      name: 'Draw Their Fire',
      hero: 'Colossus',
      img: '/cards/dark-city/hero-colossus-draw-their-fire.webp',
      team: ['x-force'],
      type: ['strength'],
      attack: 3,
      cost: 1,
      text: 'You gain a Wound.',
      flavor: 'When enemies get charged by a huge steel titan, that tends to occupy their attention.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-colossus-invulnerability',
      name: 'Invulnerability',
      hero: 'Colossus',
      img: '/cards/dark-city/hero-colossus-invulnerability.webp',
      team: ['x-force'],
      type: ['strength'],
      recruit: 2,
      cost: 3,
      text: 'If you would gain a Wound, you may discard this card instead. If you do, draw two cards.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-colossus-silent-statue',
      name: 'Silent Statue',
      hero: 'Colossus',
      img: '/cards/dark-city/hero-colossus-silent-statue.webp',
      team: ['x-force'],
      type: ['covert'],
      attack: 4,
      cost: 6,
      conditionIcons: ['strength'],
      conditionText: 'You get +2 Attack.',
      flavor: 'No one expects an enormous metal brawler to take the stealthy approach.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-colossus-russian-heavy-tank',
      name: 'Russian Heavy Tank',
      hero: 'Colossus',
      img: '/cards/dark-city/hero-colossus-russian-heavy-tank.webp',
      team: ['x-force'],
      type: ['strength'],
      attack: 6,
      cost: 8,
      text: 'If another player would gain a Wound, you may reveal this card to gain that Wound and draw a card.',
    },
    count: 1,
  },
]

export const DAREDEVIL_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-daredevil-backflip',
      name: 'Backflip',
      hero: 'Daredevil',
      img: '/cards/dark-city/hero-daredevil-backflip.webp',
      team: ['marvel-knights'],
      type: ['strength'],
      recruit: 2,
      cost: 3,
      text: 'When you play Backflip, the next Hero you recruit this turn goes on top of your deck.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-daredevil-radar-sense',
      name: 'Radar Sense',
      hero: 'Daredevil',
      img: '/cards/dark-city/hero-daredevil-radar-sense.webp',
      team: ['marvel-knights'],
      type: ['instinct'],
      attack: 2,
      cost: 4,
      text: 'Choose a number, then reveal the top card of your deck. If the card is that Cost, you get +2 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-daredevil-blind-justice',
      name: 'Blind Justice',
      hero: 'Daredevil',
      img: '/cards/dark-city/hero-daredevil-blind-justice.webp',
      team: ['marvel-knights'],
      type: ['covert'],
      attack: 4,
      cost: 6,
      text: 'Choose a number, then reveal the top card of your deck. If the card is that Cost, draw it.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-daredevil-the-man-without-fear',
      name: 'The Man Without Fear',
      hero: 'Daredevil',
      img: '/cards/dark-city/hero-daredevil-the-man-without-fear.webp',
      team: ['marvel-knights'],
      type: ['instinct'],
      attack: 7,
      cost: 8,
      text: 'Choose a number, then reveal the top card of your deck. If the card is that Cost, draw it and repeat this process.',
    },
    count: 1,
  },
]

export const DOMINO_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-domino-lucky-break',
      name: 'Lucky Break',
      hero: 'Domino',
      img: '/cards/dark-city/hero-domino-lucky-break.webp',
      team: ['x-force'],
      type: ['tech'],
      recruit: 0,
      attack: 0,
      cost: 1,
      text: 'Draw a card.',
      conditionIcons: ['x-force'],
      conditionText: 'Versatile 1',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-domino-ready-for-anything',
      name: 'Ready for Anything',
      hero: 'Domino',
      img: '/cards/dark-city/hero-domino-ready-for-anything.webp',
      team: ['x-force'],
      type: ['instinct'],
      recruit: 0,
      attack: 0,
      cost: 3,
      versatile: 2,
      text: 'Versatile 2',
      flavor: "With Domino's mutant probability powers, every day is the luckiest day of her life.",
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-domino-specialized-ammunition',
      name: 'Specialized Ammunition',
      hero: 'Domino',
      img: '/cards/dark-city/hero-domino-specialized-ammunition.webp',
      team: ['x-force'],
      type: ['tech'],
      recruit: 0,
      attack: 0,
      cost: 5,
      text: 'You may discard a card from your hand. If that card had a Recruit icon, you get +4 Recruit. If that card had an Attack icon, you get +4 Attack.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-domino-against-all-odds',
      name: 'Against All Odds',
      hero: 'Domino',
      img: '/cards/dark-city/hero-domino-against-all-odds.webp',
      team: ['x-force'],
      type: ['covert'],
      recruit: 0,
      attack: 0,
      cost: 7,
      versatile: 5,
      text: 'Versatile 5',
      conditionIcons: ['x-force'],
      conditionText: 'This card and each other Versatile ability you use for the rest of this turn produces both Recruit and Attack.',
    },
    count: 1,
  },
]

export const ELEKTRA_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-elektra-first-strike',
      name: 'First Strike',
      hero: 'Elektra',
      img: '/cards/dark-city/hero-elektra-first-strike.webp',
      team: ['marvel-knights'],
      type: ['covert'],
      attack: 1,
      cost: 1,
      text: 'If this is the first card you played this turn, you get +1 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-elektra-ninjitsu',
      name: 'Ninjitsu',
      hero: 'Elektra',
      img: '/cards/dark-city/hero-elektra-ninjitsu.webp',
      team: ['marvel-knights'],
      type: ['instinct'],
      recruit: 0,
      cost: 2,
      text: 'Draw a card.',
      conditionIcons: ['covert'],
      conditionText: 'You get +2 Recruit.',
      flavor: 'Zen is the absence of motion. Ninjitsu, the absence of stillness.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-elektra-sai-blades',
      name: 'Sai Blades',
      hero: 'Elektra',
      img: '/cards/dark-city/hero-elektra-sai-blades.webp',
      team: ['marvel-knights'],
      type: ['instinct'],
      attack: 4,
      cost: 6,
      text: 'You get +1 Attack for each Hero you played this turn that costs 1 or 2.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-elektra-silent-meditation',
      name: 'Silent Meditation',
      hero: 'Elektra',
      img: '/cards/dark-city/hero-elektra-silent-meditation.webp',
      team: ['marvel-knights'],
      type: ['instinct'],
      recruit: 5,
      cost: 7,
      text: 'When you play Silent Meditation, the next Hero you recruit this turn goes into your hand.',
      conditionIcons: ['marvel-knights'],
      conditionText: 'You get +2 Recruit.',
    },
    count: 1,
  },
]

export const FORGE_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-forge-dirty-work',
      name: 'Dirty Work',
      hero: 'Forge',
      img: '/cards/dark-city/hero-forge-dirty-work.webp',
      team: ['x-force'],
      type: ['tech'],
      attack: 2,
      cost: 3,
      conditionIcons: ['tech'],
      conditionText: 'Any Villain you fight in the Sewers this turn gets -2 Attack.',
      flavor: 'Art contains a gun',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-forge-reboot',
      name: 'Reboot',
      hero: 'Forge',
      img: '/cards/dark-city/hero-forge-reboot.webp',
      team: ['x-force'],
      type: ['tech'],
      recruit: 2,
      cost: 4,
      conditionIcons: ['tech'],
      conditionText: 'You may discard a card. If you do, draw two cards.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-forge-overdrive',
      name: 'Overdrive',
      hero: 'Forge',
      img: '/cards/dark-city/hero-forge-overdrive.webp',
      team: ['x-force'],
      type: ['tech'],
      attack: 0,
      recruit: 0,
      cost: 5,
      versatile: 3,
      text: 'Versatile 3',
      flavor: "When Forge can't find the turret remote, he just takes a couple of spoons and builds a new one.",
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-forge-bfg',
      name: 'B.F.G.',
      hero: 'Forge',
      img: '/cards/dark-city/hero-forge-bfg.webp',
      team: ['x-force'],
      type: ['tech'],
      attack: 5,
      cost: 7,
      conditionIcons: ['tech', 'tech'],
      conditionText: 'Defeat the Mastermind once for free.',
      flavor: "That's a BIG FREAKING GUN!!!!",
    },
    count: 1,
  },
]

export const GHOST_RIDER_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-ghost-rider-blazing-hellfire',
      name: 'Blazing Hellfire',
      hero: 'Ghost Rider',
      img: '/cards/dark-city/hero-ghost-rider-blazing-hellfire.webp',
      team: ['marvel-knights'],
      type: ['ranged'],
      attack: 2,
      cost: 5,
      text: 'You may KO a Villain from your Victory Pile. If you do, you get +3 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-ghost-rider-hell-on-wheels',
      name: 'Hell on Wheels',
      hero: 'Ghost Rider',
      img: '/cards/dark-city/hero-ghost-rider-hell-on-wheels.webp',
      team: ['marvel-knights'],
      type: ['tech'],
      recruit: 2,
      cost: 3,
      conditionIcons: ['marvel-knights'],
      conditionText: 'You get +2 Recruit.',
      flavor: "Most motorcycles don't drive up walls. Most don't drive into your nightmares.",
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-ghost-rider-infernal-chains',
      name: 'Infernal Chains',
      hero: 'Ghost Rider',
      img: '/cards/dark-city/hero-ghost-rider-infernal-chains.webp',
      team: ['marvel-knights'],
      type: ['strength'],
      cost: 2,
      text: 'Draw a card.',
      conditionIcons: ['strength'],
      conditionText: 'Defeat a Villain of 3 Attack or less for free.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-ghost-rider-penance-stare',
      name: 'Penance Stare',
      hero: 'Ghost Rider',
      img: '/cards/dark-city/hero-ghost-rider-penance-stare.webp',
      team: ['marvel-knights'],
      type: ['ranged'],
      attack: 3,
      cost: 8,
      text: "Each player KOs a Villain from their Victory Pile. You get +1 Attack for each Villain KO'd this way.",
      conditionIcons: ['marvel-knights'],
      conditionText: 'Put one of those Villains into your Victory Pile.',
    },
    count: 1,
  },
]

export const ICEMAN_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-iceman-deep-freeze',
      name: 'Deep Freeze',
      hero: 'Iceman',
      img: '/cards/dark-city/hero-iceman-deep-freeze.webp',
      team: ['x-men'],
      type: ['ranged'],
      recruit: 0,
      cost: 2,
      text: 'Draw a card.',
      conditionIcons: ['ranged'],
      conditionText: 'You get +1 Recruit for each other Hero you played this turn.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-iceman-ice-slide',
      name: 'Ice Slide',
      hero: 'Iceman',
      img: '/cards/dark-city/hero-iceman-ice-slide.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 2,
      cost: 4,
      conditionIcons: ['ranged'],
      conditionText: 'You get +1 Attack for each other Hero you played this turn.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-iceman-frost-spike-armor',
      name: 'Frost Spike Armor',
      hero: 'Iceman',
      img: '/cards/dark-city/hero-iceman-frost-spike-armor.webp',
      team: ['x-men'],
      type: ['strength'],
      attack: 3,
      cost: 5,
      conditionIcons: ['ranged'],
      conditionText: 'Draw a card for each Hero you played this turn.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-iceman-impenetrable-ice-wall',
      name: 'Impenetrable Ice Wall',
      hero: 'Iceman',
      img: '/cards/dark-city/hero-iceman-impenetrable-ice-wall.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 7,
      cost: 8,
      text: 'If a Villain, Master Strike, or Mastermind Tactic would cause you to gain any Wounds or discard any cards, you may reveal this card instead.',
    },
    count: 1,
  },
]

export const IRON_FIST_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-iron-fist-focus-chi',
      name: 'Focus Chi',
      hero: 'Iron Fist',
      img: '/cards/dark-city/hero-iron-fist-focus-chi.webp',
      team: ['marvel-knights'],
      type: ['instinct'],
      recruit: 0,
      cost: 3,
      text: 'You get +1 Recruit for each Hero with a different Cost you have.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-iron-fist-wield-the-iron-fist',
      name: 'Wield the Iron Fist',
      hero: 'Iron Fist',
      img: '/cards/dark-city/hero-iron-fist-wield-the-iron-fist.webp',
      team: ['marvel-knights'],
      type: ['strength'],
      attack: 0,
      cost: 4,
      text: 'You get +1 Attack for each Hero with a different Cost you have.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-iron-fist-ancient-legacy',
      name: 'Ancient Legacy',
      hero: 'Iron Fist',
      img: '/cards/dark-city/hero-iron-fist-ancient-legacy.webp',
      team: ['marvel-knights'],
      type: ['strength'],
      attack: 0,
      recruit: 0,
      cost: 1,
      text: 'Draw a card.',
      conditionIcons: ['strength', 'strength'],
      conditionText: 'Versatile 2',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-iron-fist-living-weapon',
      name: 'Living Weapon',
      hero: 'Iron Fist',
      img: '/cards/dark-city/hero-iron-fist-living-weapon.webp',
      team: ['marvel-knights'],
      type: ['strength'],
      attack: 8,
      cost: 9,
      text: 'Reveal cards from your deck until you have revealed two cards with the same Cost. Draw all the cards you revealed.',
    },
    count: 1,
  },
]

export const JEAN_GREY_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-jean-grey-psychic-search',
      name: 'Psychic Search',
      hero: 'Jean Grey',
      img: '/cards/dark-city/hero-jean-grey-psychic-search.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 2,
      cost: 3,
      conditionIcons: ['x-men'],
      conditionText: 'Rescue a Bystander.',
      flavor: 'Amid violent chaos, a soundless voice leads to safety.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-jean-grey-read-your-thoughts',
      name: 'Read Your Thoughts',
      hero: 'Jean Grey',
      img: '/cards/dark-city/hero-jean-grey-read-your-thoughts.webp',
      team: ['x-men'],
      type: ['covert'],
      recruit: 3,
      cost: 5,
      text: 'Whenever you rescue a Bystander this turn, you get +1 Recruit.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-jean-grey-mind-over-matter',
      name: 'Mind Over Matter',
      hero: 'Jean Grey',
      img: '/cards/dark-city/hero-jean-grey-mind-over-matter.webp',
      team: ['x-men'],
      type: ['covert'],
      attack: 4,
      cost: 6,
      text: 'Whenever you rescue a Bystander this turn, draw a card.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-jean-grey-telekinetic-mastery',
      name: 'Telekinetic Mastery',
      hero: 'Jean Grey',
      img: '/cards/dark-city/hero-jean-grey-telekinetic-mastery.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 5,
      cost: 7,
      text: 'Whenever you rescue a Bystander this turn, you get +1 Attack.',
      conditionIcons: ['x-men'],
      conditionText: 'Rescue a Bystander for each other X-Men Hero you played this turn.',
    },
    count: 1,
  },
]

export const NIGHTCRAWLER_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-nightcrawler-bamf',
      name: 'Bamf!',
      hero: 'Nightcrawler',
      img: '/cards/dark-city/hero-nightcrawler-bamf.webp',
      team: ['x-men'],
      type: ['instinct'],
      recruit: 2,
      cost: 3,
      text: 'Teleport',
      keywords: ['teleport'],
      flavor: '"Now you see me..." BAMF!"',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-nightcrawler-blend-into-shadows',
      name: 'Blend Into Shadows',
      hero: 'Nightcrawler',
      img: '/cards/dark-city/hero-nightcrawler-blend-into-shadows.webp',
      team: ['x-men'],
      type: ['covert'],
      attack: 2,
      cost: 4,
      text: 'Teleport',
      keywords: ['teleport'],
      flavor: 'Sometimes it is best to hide now and fight later.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-nightcrawler-swashbuckler',
      name: 'Swashbuckler',
      hero: 'Nightcrawler',
      img: '/cards/dark-city/hero-nightcrawler-swashbuckler.webp',
      team: ['x-men'],
      type: ['instinct'],
      attack: 3,
      cost: 5,
      conditionIcons: ['covert', 'instinct'],
      conditionText: 'You get +3 Attack.',
      flavor: 'Chivalry wears blue fur.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-nightcrawler-along-for-the-ride',
      name: 'Along for the Ride',
      hero: 'Nightcrawler',
      img: '/cards/dark-city/hero-nightcrawler-along-for-the-ride.webp',
      team: ['x-men'],
      type: ['covert'],
      attack: 5,
      cost: 7,
      text: 'Teleport. When you play or Teleport this card, you may also Teleport up to three other cards from your hand.',
      keywords: ['teleport'],
    },
    count: 1,
  },
]

export const PROFESSOR_X_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-professor-x-class-dismissed',
      name: 'Class Dismissed',
      hero: 'Professor X',
      img: '/cards/dark-city/hero-professor-x-class-dismissed.webp',
      team: ['x-men'],
      type: ['instinct'],
      recruit: 2,
      cost: 3,
      text: 'You may put a Hero from the HQ on the bottom of the Hero Deck.',
      conditionIcons: ['instinct'],
      conditionText: 'You may KO a card from your hand or discard pile.',
      flavor: '"What do they call you? Wheels?"',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-professor-x-psionic-astral-form',
      name: 'Psionic Astral Form',
      hero: 'Professor X',
      img: '/cards/dark-city/hero-professor-x-psionic-astral-form.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 1,
      cost: 2,
      conditionIcons: ['x-men'],
      conditionText: 'You get +2 Attack.',
      flavor: "In a plane of pure mental energy, Xavier's body is as powerful as his mind.",
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-professor-x-telepathic-probe',
      name: 'Telepathic Probe',
      hero: 'Professor X',
      img: '/cards/dark-city/hero-professor-x-telepathic-probe.webp',
      team: ['x-men'],
      type: ['ranged'],
      attack: 3,
      cost: 5,
      text: "Reveal the top card of the Villain Deck. If it's a Bystander, you may rescue it. If it's a Villain, you may fight it this turn.",
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-professor-x-mind-control',
      name: 'Mind Control',
      hero: 'Professor X',
      img: '/cards/dark-city/hero-professor-x-mind-control.webp',
      team: ['x-men'],
      type: ['covert'],
      attack: 6,
      cost: 8,
      text: 'Whenever you defeat a Villain this turn, you may gain it. It becomes a grey Hero with no text that gives +Attack equal to its Attack. (You still get its VP.)',
    },
    count: 1,
  },
]

export const PUNISHER_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-punisher-boom-goes-the-dynamite',
      name: 'Boom Goes the Dynamite',
      hero: 'Punisher',
      img: '/cards/dark-city/hero-punisher-boom-goes-the-dynamite.webp',
      team: ['marvel-knights'],
      type: ['tech'],
      cost: 2,
      text: 'Reveal the top card of your deck. If it costs 0, KO it.',
      conditionIcons: ['tech'],
      conditionText: 'Draw a card.',
      flavor: 'The Punisher always knows which cops are corrupt.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-punisher-hail-of-bullets',
      name: 'Hail of Bullets',
      hero: 'Punisher',
      img: '/cards/dark-city/hero-punisher-hail-of-bullets.webp',
      team: ['marvel-knights'],
      type: ['tech'],
      attack: 2,
      cost: 5,
      text: "Reveal the top card of the Villain Deck. If it's a Villain, you get +Attack equal to its printed VP.",
      conditionIcons: ['tech', 'tech'],
      conditionText: 'You may defeat that Villain for free.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-punisher-hostile-interrogation',
      name: 'Hostile Interrogation',
      hero: 'Punisher',
      img: '/cards/dark-city/hero-punisher-hostile-interrogation.webp',
      team: ['marvel-knights'],
      type: ['strength'],
      recruit: 2,
      cost: 3,
      conditionIcons: ['strength'],
      conditionText: 'Each other player reveals the top card of their deck. If that card costs 4 or more, discard it. You get +1 Recruit for each card discarded this way.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-punisher-the-punisher',
      name: 'The Punisher',
      hero: 'Punisher',
      img: '/cards/dark-city/hero-punisher-the-punisher.webp',
      team: ['marvel-knights'],
      type: ['tech'],
      attack: 4,
      cost: 8,
      text: 'Reveal cards from the Hero Deck until you have revealed two cards with the same Cost. You get +1 Attack for each card revealed this way. Put them on the bottom of the Hero Deck in random order.',
    },
    count: 1,
  },
]

export const WOLVERINE_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'hero-wolverine-animal-instincts',
      name: 'Animal Instincts',
      hero: 'Wolverine',
      img: '/cards/dark-city/hero-wolverine-animal-instincts.webp',
      team: ['x-force'],
      type: ['instinct'],
      attack: 0,
      cost: 2,
      text: 'Draw a card.',
      conditionIcons: ['instinct'],
      conditionText: 'You get +2 Attack.',
      flavor: "To avoid injury, it's best to keep a distance from Wolverine of at least 5,000 miles.",
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-wolverine-sudden-ambush',
      name: 'Sudden Ambush',
      hero: 'Wolverine',
      img: '/cards/dark-city/hero-wolverine-sudden-ambush.webp',
      team: ['x-force'],
      type: ['covert'],
      attack: 2,
      cost: 4,
      text: 'If you drew any extra cards this turn, you get +2 Attack.',
    },
    count: 5,
  },
  {
    card: {
      id: 'hero-wolverine-no-mercy',
      name: 'No Mercy',
      hero: 'Wolverine',
      img: '/cards/dark-city/hero-wolverine-no-mercy.webp',
      team: ['x-force'],
      type: ['strength'],
      cost: 4,
      text: 'Draw a card. You may KO a card from your hand or discard pile.',
    },
    count: 3,
  },
  {
    card: {
      id: 'hero-wolverine-reckless-abandon',
      name: 'Reckless Abandon',
      hero: 'Wolverine',
      img: '/cards/dark-city/hero-wolverine-reckless-abandon.webp',
      team: ['x-force'],
      type: ['covert'],
      attack: 3,
      cost: 7,
      text: 'Count the number of extra cards you drew this turn. Draw that many cards.',
    },
    count: 1,
  },
]



export const APOCALYPSE: MastermindData = {
  card: {
    id: 'mastermind-apocalypse',
    name: 'Apocalypse',
    img: '/cards/dark-city/mastermind-apocalypse.webp',
    strength: 12,
    vp: 6,
    text: 'Always Leads: Four Horsemen. Four Horsemen Villains get +2 Attack. Apocalypse Wins: When Famine, Pestilence, War, and Death have escaped.',
  },
  tactics: [
    {
      id: 'apocalypse-apocalyptic-destruction',
      name: 'Apocalyptic Destruction',
      img: '/cards/dark-city/apocalypse-apocalyptic-destruction.webp',
      vp: 6,
      text: 'Fight: Each player reveals their hand and puts all their Heroes that cost 1 or more on top of their deck.'
    },
    {
      id: 'apocalypse-the-end-of-all-things',
      name: 'The End of All Things',
      img: '/cards/dark-city/apocalypse-the-end-of-all-things.webp',
      vp: 6,
      text: 'Fight: Each other player reveals the top three cards of their deck, KOs each one of those cards that cost 1 or more, and puts the rest back in any order.'
    },
    {
      id: 'apocalypse-horsemen-are-drawing-nearer',
      name: 'Horsemen Are Drawing Nearer',
      img: '/cards/dark-city/apocalypse-horsemen-are-drawing-nearer.webp',
      vp: 6,
      text: 'Fight: Each other player plays a Four Horsemen Villain from their Victory Pile as if playing it from the Villain Deck.'
    },
    {
      id: 'apocalypse-immortal-and-undefeated',
      name: 'Immortal and Undefeated',
      img: '/cards/dark-city/apocalypse-immortal-and-undefeated.webp',
      vp: 6,
      text: 'Fight: If this is not the final Tactic, rescue six Bystanders and shuffle this Tactic back into the other Tactics.'
    }
  ],
  masterStrikeId: 'mastermind-apocalypse-master-strike',
  masterStrikeText: 'Each player reveals their hand and puts all their Heroes that cost 1 or more on top of their deck.',
  alwaysLeads: { villainGroupId: 'darkcity_four_horsemen' },
}

export const KINGPIN: MastermindData = {
  card: {
    id: 'mastermind-kingpin',
    name: 'Kingpin',
    img: '/cards/dark-city/mastermind-kingpin.webp',
    strength: 13,
    vp: 6,
    keywords: ['bribe'],
    text: 'Bribe. Always Leads: Streets of New York.',
  },
  tactics: [
{
      id: 'kingpin-call-a-hit',
      name: 'Call a Hit',
      img: '/cards/dark-city/kingpin-call-a-hit.webp',
      vp: 6,
      text: "Fight: Choose a Hero from each player's discard pile and KO it."
    },
    {
      id: 'kingpin-criminal-empire',
      name: 'Criminal Empire',
      img: '/cards/dark-city/kingpin-criminal-empire.webp',
      vp: 6,
      text: "Fight: If this is not the final Tactic, reveal the top three cards of the Villain Deck. Play all the Villains you revealed. Put the rest back in random order."
    },
    {
      id: 'kingpin-dirty-cops',
      name: 'Dirty Cops',
      img: '/cards/dark-city/kingpin-dirty-cops.webp',
      vp: 6,
      text: "Fight: Put a 0 Cost Hero from the KO pile on top of each other player's deck."
    },
    {
      id: 'kingpin-mob-war',
      name: 'Mob War',
      img: '/cards/dark-city/kingpin-mob-war.webp',
      vp: 6,
      text: "Fight: Each other player plays a Henchman Villain from their Victory Pile as if playing it from the Villain Deck."
    },
  ],
  masterStrikeId: 'mastermind-kingpin-master-strike',
  masterStrikeText: 'Each player reveals a Marvel Knights Hero or discards their hand and draws 5 cards.',
}

function villainCard(
  slug: string,
  name: string,
  villainGroup: string,
  strength: number,
  vp: number,
  text: string,
  bribe = false,
): CardData {
  return {
    id: `villain-${slug}`,
    name,
    img: `/cards/dark-city/villain-${slug}.webp`,
    villainGroup,
    strength,
    vp,
    text,
    ...(bribe ? { keywords: ['bribe'] } : {}),
  }
}

export const FOUR_HORSEMEN_CARDS: DeckEntry[] = [
  {
    card: villainCard('death', 'Death', 'Four Horsemen', 7, 5,
      'Fight: Each other player reveals their hand and KOs one of their Heroes that costs 1 or more. Escape: Each player does that same effect.'),
    count: 2,
  },
  {
    card: villainCard('famine', 'Famine', 'Four Horsemen', 4, 2,
      'Fight: Each other player reveals an Instinct Hero or discards a card. Escape: Each player does that same effect.'),
    count: 2,
  },
  {
    card: villainCard('pestilence', 'Pestilence', 'Four Horsemen', 5, 3,
      'Fight: Each other player reveals the top three cards of their deck, discards each of those cards that costs 1 or more, and puts the rest back in any order. Escape: Each player does that same effect.'),
    count: 2,
  },
  {
    card: villainCard('war', 'War', 'Four Horsemen', 6, 4,
      'Fight: Each other player reveals an Instinct Hero or gains a Wound. Escape: Each player does that same effect.'),
    count: 2,
  },
]

export const STREETS_OF_NEW_YORK_CARDS: DeckEntry[] = [
  {
    card: villainCard('bullseye', 'Bullseye', 'Streets of New York', 6, 4,
      'Fight: KO one of your Heroes with a Recruit icon and one of your Heroes with an Attack icon.'),
    count: 2,
  },
  {
    card: villainCard('hammerhead', 'Hammerhead', 'Streets of New York', 5, 2,
      'Bribe. Fight: KO one of your Heroes with a Recruit icon.', true),
    count: 2,
  },
  {
    card: villainCard('jigsaw', 'Jigsaw', 'Streets of New York', 11, 5,
      'Ambush: Each player discards three cards, then draws two cards. Bribe.', true),
    count: 2,
  },
  {
    card: villainCard('tombstone', 'Tombstone', 'Streets of New York', 8, 4,
      'Bribe. Escape: Each player reveals a Strength Hero or gains a Wound.', true),
    count: 2,
  },
]

export const MEPHISTO: MastermindData = {
  card: {
    id: 'mastermind-mephisto',
    name: 'Mephisto',
    img: '/cards/dark-city/mastermind-mephisto.webp',
    strength: 10,
    vp: 6,
    text: "Whenever a player gains a Wound, put it on top of that player's deck. Always Leads: Underworld.",
  },
tactics: [
    {
      id: 'mephisto-damned-if-you-do',
      name: 'Damned If You Do...',
      img: '/cards/dark-city/mephisto-damned-if-you-do.webp',
      vp: 6,
      text: 'Fight: Each other player KOs a Bystander from their Victory Pile or gains a Wound.'
    },
    {
      id: 'mephisto-devilish-torment',
      name: 'Devilish Torment',
      img: '/cards/dark-city/mephisto-devilish-torment.webp',
      vp: 6,
      text: 'Fight: Each other player puts all 0 Cost cards from their discard pile on top of their deck in any order.'
    },
    {
      id: 'mephisto-pain-begets-pain',
      name: 'Pain Begets Pain',
      img: '/cards/dark-city/mephisto-pain-begets-pain.webp',
      vp: 6,
      text: 'Fight: Choose any number of Wounds from your hand and discard pile. The player to your right gains them.'
    },
    {
      id: 'mephisto-the-price-of-failure',
      name: 'The Price of Failure',
      img: '/cards/dark-city/mephisto-the-price-of-failure.webp',
      vp: 6,
      text: 'Fight: Each other player without a Mastermind Tactic in their Victory Pile gains a Wound.'
    }
  ],
  masterStrikeId: 'mastermind-mephisto-master-strike',
  masterStrikeText: 'Each player reveals a Marvel Knights Hero or gains a Wound.',
}

export const MR_SINISTER: MastermindData = {
  card: {
    id: 'mastermind-mr-sinister',
    name: 'Mr. Sinister',
    img: '/cards/dark-city/mastermind-mr-sinister.webp',
    strength: 8,
    vp: 6,
    text: 'Mr. Sinister gets +1 Attack for each Bystander he has. Always Leads: Marauders.',
  },
tactics: [
    {
      id: 'sinister-human-experimentation',
      name: 'Human Experimentation',
      img: '/cards/dark-city/sinister-human-experimentation.webp',
      vp: 6,
      text: 'Fight: Mr. Sinister captures Bystanders equal to the number of Villains in the city.'
    },
    {
      id: 'sinister-master-geneticist',
      name: 'Master Geneticist',
      img: '/cards/dark-city/sinister-master-geneticist.webp',
      vp: 6,
      text: 'Fight: Reveal the top seven cards of the Villain Deck. Mr. Sinister captures all of the Bystanders you revealed. Put the rest back in random order.'
    },
    {
      id: 'sinister-plans-within-plans',
      name: 'Plans Within Plans',
      img: '/cards/dark-city/sinister-plans-within-plans.webp',
      vp: 6,
      text: "Fight: Mr. Sinister captures a Bystander for each Mr. Sinister Tactic in players' Victory Piles, including this Tactic."
    },
    {
      id: 'sinister-telepathic-manipulation',
      name: 'Telepathic Manipulation',
      img: '/cards/dark-city/sinister-telepathic-manipulation.webp',
      vp: 6,
      text: "Fight: Mr. Sinister captures a Bystander from each other player's Victory Pile."
    }
  ], 
  masterStrikeId: 'mastermind-mr-sinister-master-strike',
  masterStrikeText: 'Mr. Sinister captures a Bystander. Then each player with exactly 6 cards reveals a Covert Hero or discards cards equal to the number of Bystanders Mr. Sinister has.',
}

export const STRYFE: MastermindData = {
  card: {
    id: 'mastermind-stryfe',
    name: 'Stryfe',
    img: '/cards/dark-city/mastermind-stryfe.webp',
    strength: 7,
    vp: 6,
    text: 'Always Leads: MLF. Stryfe gets +1 Attack for each Master Strike stacked next to him.',
  },
tactics: [
    {
      id: 'stryfe-furious-wrath',
      name: 'Furious Wrath',
      img: '/cards/dark-city/stryfe-furious-wrath.webp',
      vp: 6,
      text: 'Fight: Reveal the top six cards of the Villain Deck. Play all the Master Strikes you revealed. Put the rest back in random order.'
    },
    {
      id: 'stryfe-psychic-torment',
      name: 'Psychic Torment',
      img: '/cards/dark-city/stryfe-psychic-torment.webp',
      vp: 6,
      text: 'Fight: Look at the top five cards of your deck. Put one into your hand and discard the rest.'
    },
    {
      id: 'stryfe-swift-vengeance',
      name: 'Swift Vengeance',
      img: '/cards/dark-city/stryfe-swift-vengeance.webp',
      vp: 6,
      text: 'Fight: A Wound from the Wound Stack becomes a Master Strike that takes effect immediately.'
    },
    {
      id: 'stryfe-tide-of-retribution',
      name: 'Tide of Retribution',
      img: '/cards/dark-city/stryfe-tide-of-retribution.webp',
      vp: 6,
      text: 'Fight: Each other player reveals an X-Force Hero or gains a Wound.'
    }
  ],
  masterStrikeId: 'mastermind-stryfe-master-strike',
  masterStrikeText: 'Stack this Master Strike next to Stryfe. Then each player reveals an X-Force Hero or discards a card at random.',
}

export const EMISSARIES_OF_EVIL_CARDS: DeckEntry[] = [
  {
    card: villainCard('egghead', 'Egghead', 'Emissaries of Evil', 4, 2,
      "Ambush: Reveal the top card of the Villain Deck. If it's a Villain, play it."),
    count: 2,
  },
  {
    card: villainCard('electro', 'Electro', 'Emissaries of Evil', 6, 4,
      "Ambush: Reveal the top card of the Villain Deck. If it's a Scheme Twist, play it."),
    count: 2,
  },
  {
    card: villainCard('gladiator', 'Gladiator', 'Emissaries of Evil', 5, 3,
      "Ambush: Reveal the top card of the Villain Deck. If it's a Bystander, Gladiator captures it."),
    count: 2,
  },
  {
    card: villainCard('rhino', 'Rhino', 'Emissaries of Evil', 5, 3,
      "Ambush: Reveal the top card of the Villain Deck. If it's a Master Strike, each player gains a Wound. Escape: Each player gains a Wound."),
    count: 2,
  },
]

export const MARAUDERS_CARDS: DeckEntry[] = [
  {
    card: villainCard('blockbuster', 'Blockbuster', 'Marauders', 4, 2,
      'Blockbuster gets +2 Attack for each Bystander he has. Ambush: If there is a Villain in the Bank, that Villain and Blockbuster each capture a Bystander.'),
    count: 2,
  },
  {
    card: villainCard('chimera', 'Chimera', 'Marauders', 3, 3,
      'Chimera gets +3 Attack for each Bystander she has. Ambush: Reveal the top three cards of the Villain Deck. Chimera captures all the Bystander cards you revealed. Put the rest back in random order.'),
    count: 2,
  },
  {
    card: villainCard('scalphunter', 'Scalphunter', 'Marauders', 4, 2,
      'Scalphunter gets +1 Attack for each Bystander he has. Ambush: Each player chooses a Bystander from their Victory Pile. Scalphunter captures those Bystanders.'),
    count: 2,
  },
  {
    card: villainCard('vertigo', 'Vertigo', 'Marauders', 5, 3,
      'Fight: Each player discards all the cards in their hand, then draws as many cards as they discarded.'),
    count: 2,
  },
]

export const MLF_CARDS: DeckEntry[] = [
  {
    card: villainCard('forearm', 'Forearm', 'MLF', 4, 4,
      'To fight Forearm, you must also reveal four Hero cards with different card names.'),
    count: 2,
  },
  {
    card: villainCard('reignfire', 'Reignfire', 'MLF', 6, 4,
      'Escape: Reignfire becomes a Master Strike that takes effect immediately.'),
    count: 2,
  },
  {
    card: villainCard('wildside', 'Wildside', 'MLF', 5, 3,
      'Fight: If you fight Wildside in the Sewers or Bank, KO two of your Heroes.'),
    count: 2,
  },
  {
    card: villainCard('zero', 'Zero', 'MLF', 0, 2,
      'To fight Zero, you must also discard three cards that cost 0.'),
    count: 2,
  },
]

export const UNDERWORLD_CARDS: DeckEntry[] = [
  {
    card: villainCard('azazel', 'Azazel', 'Underworld', 4, 2,
      'Fight: A card in your hand gains Teleport this turn.'),
    count: 2,
  },
  {
    card: villainCard('blackheart', 'Blackheart', 'Underworld', 6, 4,
      'Ambush: The player to your right reveals a Marvel Knights Hero or gains a Wound. Fight: Same effect. Escape: Same effect.'),
    count: 2,
  },
  {
    card: villainCard('dracula', 'Dracula', 'Underworld', 3, 4,
      "Ambush: Dracula captures the top card of the Hero Deck. Dracula gets +Attack equal to that card's Cost. Fight: Gain that card."),
    count: 2,
  },
  {
    card: villainCard('lilith', 'Lilith, Daughter of Dracula', 'Underworld', 5, 3,
      'Escape: Each player without Dracula in their Victory Pile gains a Wound.'),
    count: 2,
  },
]

export const MAGGIA_GOONS_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'henchmen-maggia-goons',
      name: 'Maggia Goons',
      img: '/cards/dark-city/henchmen-maggia-goons.webp',
      strength: 4,
      vp: 1,
      henchman: true,
      keywords: ['bribe'],
      text: 'Bribe. Fight: KO one of your Heroes.',
    },
    count: 10,
  },
]

export const PHALANX_CARDS: DeckEntry[] = [
  {
    card: {
      id: 'henchmen-phalanx',
      name: 'Phalanx',
      img: '/cards/dark-city/henchmen-phalanx.webp',
      strength: 3,
      vp: 1,
      henchman: true,
      text: 'Fight: Reveal a Tech Hero or KO one of your Heroes with an Attack icon.',
    },
    count: 10,
  },
]